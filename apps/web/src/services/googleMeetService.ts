export interface GoogleMeetSpace {
  name: string; // e.g. "spaces/1234abcd"
  meetingUri: string; // e.g. "https://meet.google.com/abc-defg-hij"
  meetingCode: string; // e.g. "abc-defg-hij"
  config?: {
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
    entryPointAccess?: 'ALL' | 'CREATOR_APP_ONLY';
  };
  activeConference?: {
    conferenceRecord?: string;
  };
}

/**
 * Create a new Instant Google Meet Space
 */
export async function createGoogleMeetSpace(
  accessToken: string,
  config?: {
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  }
): Promise<GoogleMeetSpace> {
  const body: Record<string, any> = {
    config: {
      accessType: config?.accessType || 'OPEN'
    }
  };

  const res = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    // Fallback: If spaces API is restricted or not yet enabled on the project, synthesize standard meeting link or throw detailed error
    throw new Error(`Google Meet API Error (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Get details of an existing Google Meet Space
 */
export async function getGoogleMeetSpace(
  accessToken: string,
  spaceName: string
): Promise<GoogleMeetSpace> {
  const res = await fetch(`https://meet.googleapis.com/v2/${spaceName}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Google Meet space: ${err}`);
  }

  return res.json();
}
