/** Maps backend Google-login error slugs (see apps/accounts/google_oauth.py)
 *  to messages shown on the login screen. */
export const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  not_configured: 'Google sign-in is not available right now. Please use your email and password.',
  access_denied: 'Google sign-in was cancelled.',
  state_mismatch: 'That sign-in link expired or was invalid. Please try again.',
  token_exchange_failed: 'We could not complete Google sign-in. Please try again.',
  no_id_token: 'Google did not return the expected information. Please try again.',
  id_token_invalid: 'We could not verify your Google identity. Please try again.',
  no_email: 'Your Google account did not share an email address.',
  email_unverified: 'Your Google email address is not verified. Verify it with Google and retry.',
  account_disabled: 'This account has been disabled. Contact an administrator.',
};

export function googleErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return GOOGLE_ERROR_MESSAGES[code] ?? 'Google sign-in failed. Please try again.';
}
