import 'server-only';

import { getSession } from '@/lib/session';
import type { AuthenticatedUser } from '@/types';

// AUTHENTICATION belongs in middleware.ts (redirects unauthenticated GET
// requests to /login before a page even starts rendering) — this helper is
// for pages that only need "who is logged in", not a finer permission check.
// The milestone-8 dashboard stub is the main caller: PLAN.md says it's open
// to any authenticated user, so it calls requireSession() rather than
// lib/page-access.ts's canAccess(...permissions), which is for pages gated
// by a specific capability.
//
// Returns null if, somehow, a request reaches an (app) page with no valid
// session (e.g. middleware matcher gap, or the cookie expired between the
// middleware check and this render) — callers render a no-access/redirect
// fallback rather than assuming middleware always caught it.
export async function requireSession(): Promise<AuthenticatedUser | null> {
  const { data } = await getSession();
  return data;
}
