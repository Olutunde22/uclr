// A flat capability table with NO outbound dependencies (permissions.md) —
// shared vocabulary named by both the server guard (lib/page-access.ts) and
// the client hook (hooks/use-permissions.ts). Keys are copied verbatim from
// backend/src/common/permissions.ts's PERMISSIONS object so the two apps
// never drift — if the backend adds a key, add the matching row here.
export const PERMISSIONS = {
  REGISTRATIONS_SUBMIT: 'registrations:submit',
  APPROVALS_ADVISER: 'approvals:adviser',
  APPROVALS_HOD: 'approvals:hod',
  COURSES_MANAGE: 'courses:manage',
  CALENDAR_MANAGE: 'calendar:manage',
  RECORDS_FINALISE: 'records:finalise',
  RECORDS_READ: 'records:read',
  FEES_MANAGE: 'fees:manage',
  CLASS_LISTS_READ: 'class_lists:read',
  USERS_MANAGE: 'users:manage',
  ACADEMICS_MANAGE: 'academics:manage',
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_READ: 'audit:read',
  REPORTS_READ: 'reports:read',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// The map shape both layers read. ULCRS's `/auth/me` returns `permissions` as
// a flat string array (AuthenticatedUser.permissions), not a
// Record<string, boolean> — hasPermission() below adapts the skill's
// map-lookup shape to an array membership check instead of forcing every
// caller to convert it themselves.
export type PermissionList = string[] | null | undefined;

export function hasPermission(
  list: PermissionList,
  permission: string,
): boolean {
  return !!list?.includes(permission);
}

export function hasAnyPermission(
  list: PermissionList,
  permissions: string[],
): boolean {
  if (permissions.length === 0) return !!list;
  return permissions.some((p) => hasPermission(list, p));
}
