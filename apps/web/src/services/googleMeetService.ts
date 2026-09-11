/**
 * Instant Google Meet creation, brokered server-side (phase P5).
 *
 * The Google Meet REST API (v2 `spaces`) requires Workspace-admin-gated
 * access on the underlying Cloud project, so the backend mints an instant
 * meeting the standard way instead: a Calendar event starting now with
 * auto-generated conference data (see `apps.integrations.views.GoogleInstantMeetView`).
 */
import { apiFetch } from '../lib/api';

export interface GoogleMeetSpace {
  eventId: string;
  meetingUri: string;
}

/** Create an instant Google Meet (backed by a just-in-time Calendar event). */
export async function createGoogleMeetSpace(): Promise<GoogleMeetSpace> {
  const result = await apiFetch<{ eventId: string; meetLink: string }>(
    '/api/integrations/google/meet/instant/',
    { method: 'POST', json: {} },
  );
  return { eventId: result.eventId, meetingUri: result.meetLink };
}
