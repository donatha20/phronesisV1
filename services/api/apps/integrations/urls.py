from __future__ import annotations

from django.urls import path

from .views import (
    GoogleCalendarEventsView,
    GoogleDriveFilesView,
    GoogleDriveFolderView,
    GoogleDriveUploadView,
    GoogleInstantMeetView,
    GoogleWorkspaceDisconnectView,
    GoogleWorkspaceStatusView,
    google_workspace_authorize_view,
    google_workspace_callback_view,
)

urlpatterns = [
    path("google/status/", GoogleWorkspaceStatusView.as_view(), name="google_workspace_status"),
    path("google/authorize/", google_workspace_authorize_view, name="google_workspace_authorize"),
    path("google/callback", google_workspace_callback_view, name="google_workspace_callback"),
    path("google/disconnect/", GoogleWorkspaceDisconnectView.as_view(), name="google_workspace_disconnect"),
    path("google/drive/files/", GoogleDriveFilesView.as_view(), name="google_drive_files"),
    path("google/drive/folders/", GoogleDriveFolderView.as_view(), name="google_drive_folders"),
    path("google/drive/upload/", GoogleDriveUploadView.as_view(), name="google_drive_upload"),
    path("google/calendar/events/", GoogleCalendarEventsView.as_view(), name="google_calendar_events"),
    path("google/meet/instant/", GoogleInstantMeetView.as_view(), name="google_meet_instant"),
]
