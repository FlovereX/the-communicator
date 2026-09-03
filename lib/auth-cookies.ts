/** Short-lived marker proving the current session came from the password-recovery email link. */
export const PASSWORD_RECOVERY_COOKIE = "communicator-password-recovery";

/** ~15 minutes — long enough to complete the reset form, short enough to limit exposure. */
export const PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS = 15 * 60;

/** Short-lived, HMAC-signed marker proving /set-password was reached via a FRESH sign-in — see lib/password-setup-marker.ts. */
export const PASSWORD_SETUP_COOKIE = "communicator-password-setup";

/** ~15 minutes — long enough to complete initial password setup, short enough to limit exposure. */
export const PASSWORD_SETUP_COOKIE_MAX_AGE_SECONDS = 15 * 60;
