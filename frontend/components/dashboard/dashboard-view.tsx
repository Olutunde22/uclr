'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NAV_ITEMS } from '@/lib/nav';
import { hasAnyPermission } from '@/lib/permissions';
import { usePermissions } from '@/hooks/use-permissions';

function formatRole(role: string) {
  return role
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

// Milestone-8 dashboard STUB (PLAN.md): no real data fetching, just a
// role-aware greeting and placeholder cards for what's coming per actor —
// registration, approvals, courses, etc. Real per-role dashboards land in
// milestone 13.
export function DashboardView() {
  const { user, isLoading } = usePermissions();

  const upcoming = NAV_ITEMS.filter(
    (item) =>
      item.href !== '/' &&
      (!item.permissions ||
        hasAnyPermission(user?.permissions, item.permissions)),
  );

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {user.firstName} {user.lastName}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {user.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {formatRole(role)}
            </Badge>
          ))}
        </div>
      </div>

      {upcoming.length > 0 ? (
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">
            Coming to your dashboard
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((item) => (
              <Card key={item.label}>
                <CardHeader>
                  <CardTitle className="text-base">{item.label}</CardTitle>
                  <CardDescription>
                    Not built yet - part of an upcoming milestone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Coming soon</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nothing assigned yet</CardTitle>
            <CardDescription>
              Your account has no feature permissions assigned. Contact the ICT
              admin if this looks wrong.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
