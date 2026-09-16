'use client';

import Link from 'next/link';
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
import { PERMISSIONS, hasAnyPermission } from '@/lib/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { useSessions, useSemesters } from '@/hooks/use-calendar';
import { useOwnFeeStatus, usePayments } from '@/hooks/use-fees';
import { useOwnRegistration } from '@/hooks/use-registrations';
import { useAdviserQueue, useHodQueue } from '@/hooks/use-approvals';
import { useRecords } from '@/hooks/use-records';
import { useMyCourses } from '@/hooks/use-courses';
import { useSystemReport } from '@/hooks/use-reports';

function formatRole(role: string) {
  return role
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

// Milestone 13: real, role-appropriate dashboard cards, each backed by an
// existing hook/endpoint (no new backend scope added, per this milestone's
// brief) - a card only appears once its data is actually loading/available,
// so a caller with several roles just sees several cards. A generic "your
// pages" quick-link grid replaces the old milestone-8 "coming soon"
// placeholders now that every nav item actually has a page behind it.
export function DashboardView() {
  const { user, isLoading, can } = usePermissions();

  const isStudent = can(PERMISSIONS.REGISTRATIONS_SUBMIT);
  const isAdviser = can(PERMISSIONS.APPROVALS_ADVISER);
  const isHod = can(PERMISSIONS.APPROVALS_HOD);
  const isRegistry = can(PERMISSIONS.RECORDS_FINALISE);
  const isBursary = can(PERMISSIONS.FEES_MANAGE);
  const isLecturer = can(PERMISSIONS.CLASS_LISTS_READ);
  const isAdmin = !!user?.roles.includes('system_admin');

  const links = NAV_ITEMS.filter(
    (item) =>
      item.href !== '/' &&
      !item.disabled &&
      (!item.permissions || hasAnyPermission(user?.permissions, item.permissions)),
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isStudent ? <StudentCard /> : null}
        {isAdviser ? <AdviserCard /> : null}
        {isHod ? <HodCard /> : null}
        {isRegistry ? <RegistryCard /> : null}
        {isBursary ? <BursaryCard /> : null}
        {isLecturer ? <LecturerCard /> : null}
        {isAdmin ? <AdminCard /> : null}
      </div>

      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-medium">
          Your pages
        </h2>
        {links.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{item.label}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nothing assigned yet</CardTitle>
              <CardDescription>
                Your account has no feature permissions assigned. Contact the
                ICT admin if this looks wrong.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

// Student: registration status for the current semester, and whether the
// current session's fee clearance is in place - both permission-less "self"
// reads (GET /registrations/me, GET /fees/me), so no new endpoint needed.
function StudentCard() {
  const { data: sessionsResult } = useSessions();
  const currentSessionId = sessionsResult?.data?.find((s) => s.isCurrent)?.id;
  const { data: registrationResult, isLoading: registrationLoading } =
    useOwnRegistration();
  const { data: feeResult, isLoading: feeLoading } =
    useOwnFeeStatus(currentSessionId);

  const registration = registrationResult?.data;
  const cleared = feeResult?.data?.clearances.some(
    (c) => c.sessionId === currentSessionId && c.cleared,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your registration</CardTitle>
        <CardDescription>Current semester</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {registrationLoading ? (
          <Skeleton className="h-5 w-24" />
        ) : registration ? (
          <Badge variant="secondary">{formatStatus(registration.status)}</Badge>
        ) : (
          <p className="text-muted-foreground text-sm">Not yet started</p>
        )}
        {feeLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <Badge variant={cleared ? 'secondary' : 'outline'}>
            {cleared ? 'Fee cleared' : 'Fee not yet cleared'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function AdviserCard() {
  const { data, isLoading } = useAdviserQueue();
  const count = data?.data?.length ?? 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pending your review</CardTitle>
        <CardDescription>As academic adviser</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-2xl font-semibold">{count}</p>
        )}
      </CardContent>
    </Card>
  );
}

function HodCard() {
  const { data, isLoading } = useHodQueue();
  const count = data?.data?.length ?? 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pending your review</CardTitle>
        <CardDescription>As HOD</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-2xl font-semibold">{count}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Registry: the current semester and how many approved registrations are
// still outstanding to finalise - derived from GET /records (records:read),
// not a new endpoint.
function RegistryCard() {
  const { data: semestersResult, isLoading: semestersLoading } = useSemesters();
  const current = semestersResult?.data?.find((s) => s.isCurrent);
  const { data: recordsResult, isLoading: recordsLoading } = useRecords({
    semesterId: current?.id ?? '',
    status: 'approved',
  });
  const outstanding = recordsResult?.data?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Current semester</CardTitle>
        <CardDescription>Registry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {semestersLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : current ? (
          <>
            <p className="text-sm">
              {current.session?.name} - {formatStatus(current.name)} semester
            </p>
            <Badge variant={current.lockedAt ? 'secondary' : 'outline'}>
              {current.lockedAt ? 'Finalised and locked' : 'Not yet finalised'}
            </Badge>
            {!current.lockedAt ? (
              <p className="text-muted-foreground text-xs">
                {recordsLoading ? '…' : outstanding} approved, not yet
                finalised
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No current semester set</p>
        )}
      </CardContent>
    </Card>
  );
}

function BursaryCard() {
  const { data, isLoading } = usePayments({});
  const recent = (data?.data ?? []).slice(0, 3);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent payments</CardTitle>
        <CardDescription>Bursary</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payments recorded</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recent.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <span>{p.receiptNo}</span>
                <span className="text-muted-foreground">{p.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function LecturerCard() {
  const { data, isLoading } = useMyCourses();
  const count = data?.data?.length ?? 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your courses</CardTitle>
        <CardDescription>Lecturer</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-2xl font-semibold">{count}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Admin: reuses the system report (GET /admin/reports, reports:read) rather
// than inventing a dashboard-specific totals endpoint.
function AdminCard() {
  const { data, isLoading } = useSystemReport(undefined);
  const report = data?.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">System totals</CardTitle>
        <CardDescription>ICT admin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : report ? (
          <>
            <p className="text-sm">{report.logins.totalUsers} users</p>
            <p className="text-sm">
              {report.registrations.total} registrations
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Unavailable</p>
        )}
      </CardContent>
    </Card>
  );
}
