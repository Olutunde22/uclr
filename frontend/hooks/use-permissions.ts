'use client';

import { useSession } from '@/hooks/use-auth';
import { hasPermission, type PermissionKey } from '@/lib/permissions';

// Client-side presentation gate (permissions.md): hides controls the user
// can't use. NOT a security boundary — lib/page-access.ts's server guard and
// the API are. Called from feature components only; pages use
// requireSession()/canAccess() from lib/route-access.ts / lib/page-access.ts
// instead, and the two consumer sets stay disjoint.
export function usePermissions() {
  const { data: session, isLoading } = useSession();
  const user = session?.data ?? null;

  return {
    user,
    can: (permission: PermissionKey | string) =>
      hasPermission(user?.permissions, permission),
    isLoading,
  };
}
