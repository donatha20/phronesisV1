/**
 * Google Workspace (Drive / Calendar / Meet) connection status — phase P5.
 *
 * This is a SEPARATE concern from application sign-in (`src/auth/`). Workspace
 * data access is brokered entirely server-side: the Django backend holds an
 * encrypted refresh token and proxies Drive/Calendar/Meet calls under
 * `/api/integrations/google/*`. The browser never sees a Google access token —
 * "connecting" is a full-page redirect to `/api/integrations/google/authorize/`
 * and back, exactly like "Login with Google".
 */
import { apiFetch, API_BASE_URL } from '../lib/api';

export interface GoogleWorkspaceStatus {
  connected: boolean;
  google_account_email: string;
  scopes: string[];
  access_token_expiry: string | null;
}

/** `GET /api/integrations/google/status/` */
export const getWorkspaceStatus = (): Promise<GoogleWorkspaceStatus> =>
  apiFetch<GoogleWorkspaceStatus>('/api/integrations/google/status/');

/** Full-page redirect to Google's consent screen; returns to `/settings/integrations`. */
export const connectGoogleWorkspace = (): void => {
  window.location.href = `${API_BASE_URL}/api/integrations/google/authorize/`;
};

/** Revokes and deletes the stored refresh token. */
export const disconnectGoogleWorkspace = (): Promise<void> =>
  apiFetch<void>('/api/integrations/google/disconnect/', { method: 'POST' });
