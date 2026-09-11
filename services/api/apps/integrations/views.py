from __future__ import annotations

import secrets
from datetime import UTC

from django.conf import settings
from django.http import HttpRequest, HttpResponseRedirect
from googleapiclient.errors import HttpError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditAction
from apps.audit.services import record

from . import google_client
from .google_oauth import (
    GoogleWorkspaceError,
    build_authorization_url,
    exchange_code_for_grant,
    revoke_refresh_token,
)
from .models import GoogleWorkspaceToken
from .serializers import GoogleWorkspaceStatusSerializer

_STATE_COOKIE = "g_workspace_oauth_state"
_STATE_COOKIE_PATH = "/api/integrations/google/"
_STATE_MAX_AGE = 600
_UID_COOKIE = "g_workspace_oauth_uid"


class WorkspaceAPIException(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_code = "google_error"

    def __init__(self, exc: GoogleWorkspaceError):
        self.status_code = status.HTTP_409_CONFLICT if exc.code == "not_connected" else 502
        super().__init__(detail={"code": exc.code, "detail": exc.detail or str(exc)})


def _frontend_redirect(path: str, **params: str) -> HttpResponseRedirect:
    from urllib.parse import urlencode

    url = settings.FRONTEND_URL.rstrip("/") + path
    if params:
        url = f"{url}?{urlencode(params)}"
    return HttpResponseRedirect(url)


class GoogleWorkspaceStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        token = GoogleWorkspaceToken.objects.filter(user=request.user).first()
        if token is None:
            return Response({"connected": False, "google_account_email": "", "scopes": [], "access_token_expiry": None})
        return Response(GoogleWorkspaceStatusSerializer(token).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def google_workspace_authorize_view(request: HttpRequest):
    """Step 1: send the already-signed-in user to Google's consent screen to
    grant Drive/Calendar/Meet access. Requires ``access_type=offline`` +
    ``prompt=consent`` so we always receive a refresh token."""
    try:
        auth_url, state = build_authorization_url()
    except GoogleWorkspaceError as exc:
        return _frontend_redirect("/", google_error=exc.code)

    response = HttpResponseRedirect(auth_url)
    response.set_cookie(
        _STATE_COOKIE, state, max_age=_STATE_MAX_AGE, path=_STATE_COOKIE_PATH,
        secure=not settings.DEBUG, httponly=True, samesite="Lax",
    )
    response.set_cookie(
        _UID_COOKIE, str(request.user.pk), max_age=_STATE_MAX_AGE, path=_STATE_COOKIE_PATH,
        secure=not settings.DEBUG, httponly=True, samesite="Lax",
    )
    return response


@api_view(["GET"])
def google_workspace_callback_view(request: HttpRequest):
    """Step 2: Google redirects back here. The user's Phronesis session cookie
    is still present (this never logs anyone in/out), so we attach the grant
    to ``request.user`` if authenticated, falling back to the uid cookie set
    in step 1 (covers same-browser third-party-cookie edge cases)."""
    def _fail(code: str) -> HttpResponseRedirect:
        resp = _frontend_redirect("/", google_error=code)
        resp.delete_cookie(_STATE_COOKIE, path=_STATE_COOKIE_PATH)
        resp.delete_cookie(_UID_COOKIE, path=_STATE_COOKIE_PATH)
        return resp

    if request.GET.get("error"):
        return _fail(request.GET["error"])

    code = request.GET.get("code", "")
    state = request.GET.get("state", "")
    expected_state = request.COOKIES.get(_STATE_COOKIE, "")
    if not code or not state or not expected_state or not secrets.compare_digest(state, expected_state):
        return _fail("state_mismatch")

    user = request.user if request.user.is_authenticated else None
    if user is None:
        from django.contrib.auth import get_user_model

        uid = request.COOKIES.get(_UID_COOKIE, "")
        if uid:
            user = get_user_model().objects.filter(pk=uid).first()
    if user is None:
        return _fail("not_authenticated")

    try:
        grant = exchange_code_for_grant(code=code, state=state)
    except GoogleWorkspaceError as exc:
        return _fail(exc.code)

    GoogleWorkspaceToken.objects.update_or_create(
        user=user,
        defaults={
            "google_account_email": grant.email,
            "encrypted_refresh_token": grant.refresh_token,
            "scopes": grant.scopes,
            "access_token_expiry": grant.expiry,
            "revoked_at": None,
        },
    )
    record(AuditAction.GOOGLE_CONNECT, actor=user, metadata={"email": grant.email})

    resp = _frontend_redirect("/", google_connected="1")
    resp.delete_cookie(_STATE_COOKIE, path=_STATE_COOKIE_PATH)
    resp.delete_cookie(_UID_COOKIE, path=_STATE_COOKIE_PATH)
    return resp


class GoogleWorkspaceDisconnectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = GoogleWorkspaceToken.objects.filter(user=request.user).first()
        if token is not None and token.revoked_at is None:
            revoke_refresh_token(token.encrypted_refresh_token)
            from django.utils import timezone

            token.revoked_at = timezone.now()
            token.save(update_fields=["revoked_at", "updated_at"])
            record(AuditAction.GOOGLE_DISCONNECT, actor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Drive
# ---------------------------------------------------------------------------
_DRIVE_FIELDS = "nextPageToken,files(id,name,mimeType,description,webViewLink,webContentLink,iconLink,thumbnailLink,createdTime,modifiedTime,size,shared,owners,parents)"

_MIME_FILTERS = {
    "FOLDERS": "mimeType = 'application/vnd.google-apps.folder'",
    "PDFS": "mimeType = 'application/pdf'",
    "DOCS": "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'text/plain')",
    "SHEETS": "(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType = 'text/csv')",
    "SLIDES": "(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')",
    "AUDIO": "(mimeType = 'application/vnd.google-apps.audio' or mimeType contains 'audio/')",
}


class GoogleDriveFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q_parts = ["trashed = false"]
        folder_id = request.query_params.get("folderId")
        if folder_id:
            q_parts.append(f"'{folder_id}' in parents")
        search = request.query_params.get("search", "").strip()
        if search:
            sanitized = search.replace("'", "\\'")
            q_parts.append(f"(name contains '{sanitized}' or fullText contains '{sanitized}')")
        mime_filter = request.query_params.get("mimeType", "ALL")
        if mime_filter in _MIME_FILTERS:
            q_parts.append(_MIME_FILTERS[mime_filter])

        try:
            service = google_client.drive_service(request.user)
            result = service.files().list(
                q=" and ".join(q_parts),
                pageSize=int(request.query_params.get("pageSize", 40)),
                pageToken=request.query_params.get("pageToken") or None,
                fields=_DRIVE_FIELDS,
                orderBy="folder,modifiedTime desc",
            ).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(result)

    def delete(self, request):
        file_id = request.query_params.get("fileId")
        if not file_id:
            return Response({"detail": "fileId is required"}, status=400)
        try:
            service = google_client.drive_service(request.user)
            service.files().delete(fileId=file_id).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(status=status.HTTP_204_NO_CONTENT)


class GoogleDriveFolderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"detail": "name is required"}, status=400)
        metadata = {
            "name": name,
            "mimeType": "application/vnd.google-apps.folder",
            "description": "Phronesis Mentorship Discipleship Folder",
        }
        parent = request.data.get("parentFolderId")
        if parent:
            metadata["parents"] = [parent]
        try:
            service = google_client.drive_service(request.user)
            result = service.files().create(
                body=metadata, fields="id,name,mimeType,webViewLink,createdTime"
            ).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(result, status=status.HTTP_201_CREATED)


class GoogleDriveUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from googleapiclient.http import MediaInMemoryUpload

        file_name = request.data.get("fileName", "").strip()
        mime_type = request.data.get("mimeType", "text/plain")
        content = request.data.get("content", "")
        if not file_name or not content:
            return Response({"detail": "fileName and content are required"}, status=400)
        metadata = {
            "name": file_name,
            "mimeType": mime_type,
            "description": request.data.get("description") or "Created via Phronesis Discipleship Platform",
        }
        parent = request.data.get("parentFolderId")
        if parent:
            metadata["parents"] = [parent]
        media = MediaInMemoryUpload(content.encode("utf-8"), mimetype=mime_type)
        try:
            service = google_client.drive_service(request.user)
            result = service.files().create(
                body=metadata, media_body=media,
                fields="id,name,mimeType,webViewLink,size,createdTime",
            ).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(result, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Calendar / Meet
# ---------------------------------------------------------------------------
class GoogleCalendarEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = {
            "singleEvents": True,
            "orderBy": "startTime",
            "maxResults": int(request.query_params.get("maxResults", 50)),
        }
        if request.query_params.get("timeMin"):
            params["timeMin"] = request.query_params["timeMin"]
        if request.query_params.get("timeMax"):
            params["timeMax"] = request.query_params["timeMax"]
        if request.query_params.get("search"):
            params["q"] = request.query_params["search"]
        try:
            service = google_client.calendar_service(request.user)
            result = service.events().list(calendarId="primary", **params).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(result.get("items", []))

    def post(self, request):
        data = request.data
        event_body = {
            "summary": data.get("summary", "Phronesis Discipleship Session"),
            "description": data.get("description", ""),
            "start": data.get("start"),
            "end": data.get("end"),
        }
        attendees = data.get("attendees") or []
        if attendees:
            event_body["attendees"] = [{"email": a} for a in attendees]
        if not event_body["start"] or not event_body["end"]:
            return Response({"detail": "start and end are required"}, status=400)

        create_kwargs = {"calendarId": "primary", "body": event_body}
        if data.get("includeGoogleMeet"):
            event_body["conferenceData"] = {
                "createRequest": {
                    "requestId": secrets.token_hex(8),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            }
            create_kwargs["conferenceDataVersion"] = 1

        try:
            service = google_client.calendar_service(request.user)
            result = service.events().insert(**create_kwargs).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(result, status=status.HTTP_201_CREATED)

    def delete(self, request):
        event_id = request.query_params.get("eventId")
        if not event_id:
            return Response({"detail": "eventId is required"}, status=400)
        try:
            service = google_client.calendar_service(request.user)
            service.events().delete(calendarId="primary", eventId=event_id).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)
        return Response(status=status.HTTP_204_NO_CONTENT)


class GoogleInstantMeetView(APIView):
    """"Instant Meet": a Calendar event starting now with auto-generated
    conference data. The Google Meet REST API (v2) requires a separate
    Workspace-admin-gated product; using Calendar's ``conferenceData`` is the
    standard way to mint a Meet link with only Calendar scope."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        from datetime import datetime, timedelta

        now = datetime.now(UTC)
        event_body = {
            "summary": request.data.get("summary", "Phronesis Instant Meeting"),
            "start": {"dateTime": now.isoformat()},
            "end": {"dateTime": (now + timedelta(minutes=60)).isoformat()},
            "conferenceData": {
                "createRequest": {
                    "requestId": secrets.token_hex(8),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }
        try:
            service = google_client.calendar_service(request.user)
            result = service.events().insert(
                calendarId="primary", body=event_body, conferenceDataVersion=1
            ).execute()
        except GoogleWorkspaceError as exc:
            raise WorkspaceAPIException(exc) from exc
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)

        meet_link = ""
        for entry in result.get("conferenceData", {}).get("entryPoints", []):
            if entry.get("entryPointType") == "video":
                meet_link = entry.get("uri", "")
                break
        return Response({"eventId": result["id"], "meetLink": meet_link, "event": result}, status=201)
