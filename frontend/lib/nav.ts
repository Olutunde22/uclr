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
    disabled: true,
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
    label: 'Reports',
    href: '/reports',
    permissions: [PERMISSIONS.REPORTS_READ],
    disabled: true,
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
];
