import { PERMISSIONS, type PermissionKey } from '@/lib/permissions';

// Sidebar nav is built from the user's permissions, not parallel-route slots
// (decision gate answer 8) — one item per PLAN.md actor-table row. Routes not
// built yet stay `disabled: true` ("coming soon") rather than linking to a
// 404; flip `disabled` off in the same change that ships a route (milestone 9
// did this for "Admin" — /admin/{users,academics,settings,audit}).
export interface NavItem {
  label: string;
  href: string;
  /** Omitted = visible to every authenticated user (e.g. the dashboard). */
  permissions?: PermissionKey[];
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  {
    label: 'Registration',
    href: '/registration',
    permissions: [PERMISSIONS.REGISTRATIONS_SUBMIT],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    permissions: [PERMISSIONS.APPROVALS_ADVISER, PERMISSIONS.APPROVALS_HOD],
  },
  {
    label: 'Advisees',
    href: '/advisees',
    permissions: [PERMISSIONS.APPROVALS_ADVISER],
  },
  {
    label: 'Department courses',
    href: '/department/courses',
    permissions: [PERMISSIONS.COURSES_MANAGE],
  },
  {
    label: 'My courses',
    href: '/my-courses',
    permissions: [PERMISSIONS.CLASS_LISTS_READ],
  },
  {
    label: 'Calendar',
    href: '/calendar',
    permissions: [PERMISSIONS.CALENDAR_MANAGE],
  },
  {
    label: 'Records',
    href: '/records',
    permissions: [PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_FINALISE],
  },
  {
    label: 'Fees',
    href: '/fees',
  },
  {
    label: 'Student fees',
    href: '/fees/students',
    permissions: [PERMISSIONS.FEES_MANAGE],
  },
  {
    label: 'Department report',
    href: '/department/report',
    permissions: [PERMISSIONS.REPORTS_READ],
  },
  {
    label: 'Admin',
    href: '/admin',
    permissions: [
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.ACADEMICS_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.AUDIT_READ,
    ],
  },
  {
    // Same permission set as "Admin" above (not REPORTS_READ, which `hod`
    // also holds) - only system_admin holds any of these four keys, and
    // ReportsService.systemReport is system_admin-only regardless (backend/
    // CLAUDE.md), so this correctly hides from a pure HOD. The sidebar has
    // no sub-item support (milestone 9), so this is its own top-level entry
    // rather than nested under "Admin", matching "Student fees"'s precedent.
    label: 'System reports',
    href: '/admin/reports',
    permissions: [
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.ACADEMICS_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.AUDIT_READ,
    ],
  },
];
