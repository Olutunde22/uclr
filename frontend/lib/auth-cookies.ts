// Cookie name constants + the one shared cookie-options object (auth.md:
// "if each writer sets its own attributes, one path eventually downgrades
// secure/httpOnly and the weakest write wins"). Names default to the
// backend's own defaults (backend/src/config/configuration.ts) so the
// frontend never has to guess what the backend named them.
export const ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_COOKIE_ACCESS_NAME ?? 'ulcrs_ac_tk';
export const REFRESH_TOKEN =
  process.env.NEXT_PUBLIC_COOKIE_REFRESH_NAME ?? 'ulcrs_re_tk';

// Only used by lib/api-client.ts's best-effort cookie *deletion* on a dead
// session (logout, failed refresh) — every *write* of a real cookie value is
// done by the backend itself via Set-Cookie (see PLAN.md's "who refreshes
// tokens" decision: the backend mints and writes cookies, the frontend never
// signs its own). `maxAge` here is unused for deletes but kept so this stays
// a genuine "one shared options object" callers can also use for writes if a
// future flow ever needs one (e.g. clearing on logout with matching attributes
// so the delete actually matches the cookie that was set).
export const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
