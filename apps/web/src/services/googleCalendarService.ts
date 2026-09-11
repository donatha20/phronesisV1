/**
 * Google Calendar/Meet access, brokered server-side (phase P5). Every call
 * here hits our Django API, which holds the encrypted refresh token and talks
 * to Google on the user's behalf.
 */
import { apiFetch } from '../lib/api';

export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  comment?: string;
}

export interface CalendarConferenceData {
  createRequest?: {
    requestId: string;
    conferenceSolutionKey: { type: 'hangoutsMeet' };
    status?: { statusCode: string };
  };
  entryPoints?: Array<{
    entryPointType: 'video' | 'phone' | 'more';
    uri: string;
    label?: string;
    pin?: string;
  }>;
  conferenceSolution?: { name: string; iconUri?: string };
  conferenceId?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: CalendarConferenceData;
  attendees?: CalendarEventAttendee[];
  status?: string;
  colorId?: string;
  created?: string;
  updated?: string;
}

/** List events from the connected user's primary Google Calendar. */
export async function listGoogleCalendarEvents(options?: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  searchQuery?: string;
}): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams();
  const timeMin = options?.timeMin || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  params.set('timeMin', timeMin);
  if (options?.timeMax) params.set('timeMax', options.timeMax);
  if (options?.maxResults) params.set('maxResults', String(options.maxResults));
  if (options?.searchQuery?.trim()) params.set('search', options.searchQuery.trim());

  return apiFetch<GoogleCalendarEvent[]>(`/api/integrations/google/calendar/events/?${params.toString()}`);
}

/** Create a new Google Calendar event, optionally with a Google Meet link. */
export async function createGoogleCalendarEvent(event: {
  summary: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  attendees?: Array<{ email: string; displayName?: string }>;
  enableGoogleMeet?: boolean;
  colorId?: string;
}): Promise<GoogleCalendarEvent> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return apiFetch<GoogleCalendarEvent>('/api/integrations/google/calendar/events/', {
    method: 'POST',
    json: {
      summary: event.summary,
      description: event.description || '',
      location: event.location,
      start: { dateTime: event.startTime, timeZone },
      end: { dateTime: event.endTime, timeZone },
      attendees: event.attendees?.map((a) => a.email),
      includeGoogleMeet: !!event.enableGoogleMeet,
      colorId: event.colorId,
    },
  });
}

/** Delete an event from Google Calendar. Caller MUST confirm first. */
export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  await apiFetch<void>(`/api/integrations/google/calendar/events/?eventId=${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
  });
  return true;
}

/** Extract the Google Meet link from a calendar event, if present. */
export function getMeetLinkFromEvent(event: GoogleCalendarEvent): string | null {
  if (event.hangoutLink) return event.hangoutLink;
  const videoEntry = event.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video');
  return videoEntry?.uri || null;
}
