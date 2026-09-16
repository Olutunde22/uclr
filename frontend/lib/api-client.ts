import 'server-only';

import axios from 'axios';
import { cookies } from 'next/headers';
import { API_TIMEOUTS } from '@/lib/api-helpers';

// Server-side axios client. Used from Server Components, Server Actions and
// Route Handlers — never imported by a client component (enforced by the
// `server-only` import above).
//
// Why this is simpler than the nextjs-app skill's generic template: the
// backend's JwtAuthGuard already self-heals in-guard (see
// backend/src/common/guards/jwt-auth.guard.ts) — an expired access token with
// a valid refresh cookie silently gets a new token pair minted and set on the
// backend's response, and the original request proceeds. So this client does
// NOT need its own 401-retry/refresh-dedup logic (that lives in
// browser-client.ts instead, per PLAN.md's decision gate answer 3, as the
// client-side fallback for the rarer case). Its only two jobs:
//
//   1. Forward the incoming request's cookies to the backend on every call
//      (both tokens — the guard needs the refresh cookie to self-heal).
//   2. Propagate any Set-Cookie the backend response carries back onto the
//      Next.js response, where the calling context can actually write one.
//
// A plain RSC read (page.tsx, layout.tsx) CANNOT set cookies during render —
// only Server Actions and Route Handlers can, via next/headers's cookies().
// tryPersistSetCookie() below is a best-effort write: it succeeds from an
// action/handler and silently no-ops from a bare RSC render, which is fine
// because middleware.ts's proactive refresh already covers the
// RSC-navigation path (see middleware.ts and frontend/CLAUDE.md's
// "API base URL" section for the full reasoning).
export const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: API_TIMEOUTS.default,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true, // we read `success` ourselves; see lib/unwrap.ts
});

serverApi.interceptors.request.use(async (config) => {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  if (cookieHeader) {
    config.headers.Cookie = cookieHeader;
  }
  return config;
});

serverApi.interceptors.response.use(async (response) => {
  await tryPersistSetCookie(response.headers?.['set-cookie']);
  return response;
});

// Best-effort: only succeeds when called from a Server Action / Route Handler
// context, where next/headers's cookies() is mutable. Swallowed elsewhere —
// see the comment above. LOAD-BEARING pattern from auth.md: never let a
// best-effort cookie write break a render.
async function tryPersistSetCookie(setCookie: string[] | string | undefined) {
  if (!setCookie) return;
  const raw = Array.isArray(setCookie) ? setCookie : [setCookie];
  try {
    const store = await cookies();
    for (const entry of raw) {
      const [pair] = entry.split(';');
      const eq = pair.indexOf('=');
      if (eq === -1) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      store.set(name, value);
    }
  } catch {
    // Not in a mutable cookie context (plain RSC render). No-op by design.
  }
}
