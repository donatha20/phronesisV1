export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  comment?: string;
}

export interface CalendarConferenceData {
  createRequest?: {
    requestId: string;
    conferenceSolutionKey: {
      type: 'hangoutsMeet';
    };
    status?: {
      statusCode: string;
    };
  };
  entryPoints?: Array<{
    entryPointType: 'video' | 'phone' | 'more';
    uri: string;
    label?: string;
    pin?: string;
  }>;
  conferenceSolution?: {
    name: string;
    iconUri?: string;
  };
  conferenceId?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: CalendarConferenceData;
  attendees?: CalendarEventAttendee[];
  status?: string;
  colorId?: string;
  created?: string;
  updated?: string;
}

export interface CalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
  summary?: string;
  timeZone?: string;
}

/**
 * List events from primary Google Calendar
 */
export async function listGoogleCalendarEvents(
  accessToken: string,
  options?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    searchQuery?: string;
  }
): Promise<CalendarListResponse> {
  const maxResults = options?.maxResults || 50;
  const now = options?.timeMin || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=${maxResults}&timeMin=${encodeURIComponent(now)}`;

  if (options?.timeMax) {
    url += `&timeMax=${encodeURIComponent(options.timeMax)}`;
  }
  if (options?.searchQuery && options.searchQuery.trim()) {
    url += `&q=${encodeURIComponent(options.searchQuery.trim())}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API Error (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Create a new Google Calendar Event with optional Google Meet video call integration
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    attendees?: Array<{ email: string; displayName?: string }>;
    enableGoogleMeet?: boolean;
    colorId?: string;
  }
): Promise<GoogleCalendarEvent> {
  const eventPayload: Record<string, any> = {
    summary: event.summary,
    description: event.description || '',
    start: {
      dateTime: event.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: event.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  if (event.location) {
    eventPayload.location = event.location;
  }

  if (event.attendees && event.attendees.length > 0) {
    eventPayload.attendees = event.attendees;
  }

  if (event.colorId) {
    eventPayload.colorId = event.colorId;
  }

  if (event.enableGoogleMeet) {
    eventPayload.conferenceData = {
      createRequest: {
        requestId: `phronesis-meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    };
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventPayload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Google Calendar event: ${err}`);
  }

  return res.json();
}

/**
 * Delete an event from Google Calendar
 * (Caller MUST show confirmation dialog first)
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Failed to delete Google Calendar event: ${err}`);
  }

  return true;
}

/**
 * Extract Google Meet link from calendar event if present
 */
export function getMeetLinkFromEvent(event: GoogleCalendarEvent): string | null {
  if (event.hangoutLink) {
    return event.hangoutLink;
  }
  if (event.conferenceData?.entryPoints) {
    const videoEntry = event.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
    if (videoEntry?.uri) return videoEntry.uri;
  }
  return null;
}
