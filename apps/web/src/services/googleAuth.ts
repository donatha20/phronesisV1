/**
 * Google Workspace (Drive / Calendar / Meet) connection shim.
 *
 * Firebase has been removed. Application sign-in now lives in `src/auth/`
 * (cookie-JWT against the Django API, plus "Login with Google" via a
 * server-side redirect).
 *
 * Workspace *data* access is a SEPARATE concern and is being moved server-side:
 * the Django backend will broker Drive/Calendar/Meet calls with a stored,
 * encrypted refresh token (migration phase P5, endpoints under
 * `/api/integrations/google/`). Until that lands, these functions report the
 * feature as unavailable so the Drive/Calendar views degrade gracefully
 * instead of calling Google directly from the browser.
 */

export interface GoogleWorkspaceUser {
  email: string;
  displayName?: string;
}

const NOT_AVAILABLE_MESSAGE =
  'Google Workspace access is being migrated to the Phronesis backend and will be available again shortly.';

/** No live browser-side session anymore. */
export const getAccessToken = async (): Promise<string | null> => null;

export const getCurrentGoogleUser = (): GoogleWorkspaceUser | null => null;

/**
 * Previously subscribed to Firebase auth state. Now a no-op that immediately
 * signals "not connected" and returns an unsubscribe function.
 */
export const initAuth = (
  _onConnected?: (user: GoogleWorkspaceUser, token: string) => void,
  onNotConnected?: () => void,
): (() => void) => {
  onNotConnected?.();
  return () => {};
};

export const signInWithGoogleDrive = async (): Promise<{
  user: GoogleWorkspaceUser;
  accessToken: string;
} | null> => {
  throw new Error(NOT_AVAILABLE_MESSAGE);
};

export const googleLogout = async (): Promise<void> => {
  /* nothing to tear down */
};
