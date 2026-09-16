import axios, { type AxiosRequestConfig } from 'axios';
import { API_TIMEOUTS } from '@/lib/api-helpers';

// Browser-side axios client — the API-base-URL judgment call for ULCRS (see
// frontend/CLAUDE.md for the full writeup): the browser calls the NestJS
// backend's public origin DIRECTLY for client-mutations (react-query
// mutations from client components), rather than proxying through a Next.js
// route handler. This mirrors admin.usebash.io's precedent that PLAN.md
// points at. It works here because:
//   - the backend's cookies are httpOnly but NOT origin-restricted beyond
//     normal cookie/CORS rules, and CORS is already configured on the
//     backend for http://localhost:3000 with `credentials: true`
//   - `withCredentials: true` below means the browser sends/receives those
//     cookies cross-origin automatically, so no token ever touches JS
//   - Server Components/Actions still go through lib/api-client.ts directly
//     against the backend too, so there is exactly one API origin in play,
//     not three (Next server, Next proxy, backend)
export const browserApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: API_TIMEOUTS.default,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Client-side reactive fallback (auth.md, decision gate answer 3). In the
// common case this never fires: the backend's JwtAuthGuard already self-heals
// an expired access token in-guard as long as the refresh cookie is valid, so
// most requests never see a 401 at all. This exists for the remaining case —
// the refresh cookie itself is close to expiry or was rejected — where one
// retry is attempted before giving up.
//
// LOAD-BEARING pattern from auth.md, adapted: the skill's dedup Map is keyed
// by the refresh token's own value, because on the SERVER module state is
// shared across concurrent requests from DIFFERENT users, and a single
// shared promise would hand user A's refreshed token to user B. That specific
// hazard doesn't exist here — this module runs inside one user's browser
// tab, so there is only ever one user in scope — but a single in-flight
// promise is still kept (as a Map, for structural parity with the server
// pattern) so concurrent 401s from several parallel requests in the same tab
// don't each fire their own POST /auth/refresh.
const refreshPromises = new Map<string, Promise<boolean>>();
const REFRESH_KEY = 'browser-session';

async function refreshSession(): Promise<boolean> {
  let pending = refreshPromises.get(REFRESH_KEY);
  if (pending) return pending;

  pending = (async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          timeout: API_TIMEOUTS.refresh,
          validateStatus: () => true,
        },
      );
      return res.status >= 200 && res.status < 300;
    } catch {
      return false;
    } finally {
      refreshPromises.delete(REFRESH_KEY);
    }
  })();

  refreshPromises.set(REFRESH_KEY, pending);
  return pending;
}

browserApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & {
      _retried?: boolean;
    };
    if (error.response?.status !== 401 || original?._retried) throw error;

    const refreshed = await refreshSession();
    if (!refreshed) {
      // Dead session. Redirect to login — GET-only guidance from auth.md is a
      // server-middleware concern (avoiding a 307 replaying a POST); here we
      // just navigate, which is always safe from the browser.
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    }

    original._retried = true;
    return browserApi.request(original);
  },
);
