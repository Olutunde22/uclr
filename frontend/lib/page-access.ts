import 'server-only';

import { getSession } from '@/lib/session';
import { hasAnyPermission } from '@/lib/permissions';

// The server-side AUTHORIZATION gate (permissions.md: "may this user do
// this"). Called from route page.tsx files only — components use
// hooks/use-permissions.ts's client hook instead, and the two consumer sets
// stay disjoint. Neither replaces API-side authorization: every backend
// endpoint still checks `@RequirePermissions` and scopes data itself; this
// only protects a route so an unauthorized user sees a no-access state
// instead of a flash of data-fetching that immediately 403s.
//
// No permissions passed = "is anyone logged in at all" (see
// requireSession() in lib/route-access.ts for the more common "just give me
// the user" case used by pages open to any authenticated role, like the
// dashboard stub).
export async function canAccess(...permissions: string[]): Promise<boolean> {
  const { data: user } = await getSession();
  if (!user) return false;
  return hasAnyPermission(user.permissions, permissions);
}
