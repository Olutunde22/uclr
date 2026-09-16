import {
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS, type PermissionKey } from '@/lib/permissions';

// Sidebar nav is built from the user's permissions, not parallel-route slots
// (decision gate answer 8) — one item per PLAN.md actor-table row. Routes not
// built yet stay `disabled: true` ("coming soon") rather than linking to a
// 404; flip `disabled` off in the same change that ships a route (milestone 9
// did this for "Admin" — /admin/{users,academics,settings,audit}).
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omitted = visible to every authenticated user (e.g. the dashboard). */
  permissions?: PermissionKey[];
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    label: 'Registration',
    href: '/registration',
    icon: ClipboardList,
    permissions: [PERMISSIONS.REGISTRATIONS_SUBMIT],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: CheckSquare,
    permissions: [PERMISSIONS.APPROVALS_ADVISER, PERMISSIONS.APPROVALS_HOD],
  },
  {
    label: 'Advisees',
    href: '/advisees',
    icon: Users,
    permissions: [PERMISSIONS.APPROVALS_ADVISER],
  },
  {
    label: 'Department courses',
    href: '/department/courses',
    icon: GraduationCap,
    permissions: [PERMISSIONS.COURSES_MANAGE],
  },
  {
    label: 'My courses',
    href: '/my-courses',
    icon: ScrollText,
    permissions: [PERMISSIONS.CLASS_LISTS_READ],
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: CalendarDays,
    permissions: [PERMISSIONS.CALENDAR_MANAGE],
  },
  {
    label: 'Records',
    href: '/records',
    icon: FileBarChart,
    permissions: [PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_FINALISE],
  },
  {
    label: 'Fees',
    href: '/fees',
    icon: Wallet,
  },
  {
    label: 'Student fees',
    href: '/fees/students',
    icon: Wallet,
    permissions: [PERMISSIONS.FEES_MANAGE],
  },
  {
    label: 'Department report',
    href: '/department/report',
    icon: FileBarChart,
    permissions: [PERMISSIONS.REPORTS_READ],
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
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
    icon: ShieldCheck,
    permissions: [
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.ACADEMICS_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.AUDIT_READ,
    ],
  },
];
