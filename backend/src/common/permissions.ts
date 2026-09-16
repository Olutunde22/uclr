export const PERMISSIONS = {
  REGISTRATIONS_SUBMIT: 'registrations:submit',
  APPROVALS_ADVISER: 'approvals:adviser',
  APPROVALS_HOD: 'approvals:hod',
  COURSES_MANAGE: 'courses:manage',
  COURSES_READ: 'courses:read',
  CALENDAR_MANAGE: 'calendar:manage',
  RECORDS_FINALISE: 'records:finalise',
  RECORDS_READ: 'records:read',
  FEES_MANAGE: 'fees:manage',
  CLASS_LISTS_READ: 'class_lists:read',
  USERS_MANAGE: 'users:manage',
  USERS_READ: 'users:read',
  ACADEMICS_MANAGE: 'academics:manage',
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_READ: 'audit:read',
  REPORTS_READ: 'reports:read',
} as const;
export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export const ALL_PERMISSIONS: {
  key: PermissionKey;
  description: string;
}[] = [
  {
    key: PERMISSIONS.REGISTRATIONS_SUBMIT,
    description: 'Save, validate and submit a course registration',
  },
  {
    key: PERMISSIONS.APPROVALS_ADVISER,
    description: "Decide on advisees' registrations as academic adviser",
  },
  {
    key: PERMISSIONS.APPROVALS_HOD,
    description: 'Decide on department registrations as HOD',
  },
  {
    key: PERMISSIONS.COURSES_MANAGE,
    description: 'Create/update courses, prerequisites and timetable slots',
  },
  {
    key: PERMISSIONS.COURSES_READ,
    description:
      'List/view the course catalogue (a lower privilege than managing it)',
  },
  {
    key: PERMISSIONS.CALENDAR_MANAGE,
    description: 'Manage academic sessions, semesters and windows',
  },
  {
    key: PERMISSIONS.RECORDS_FINALISE,
    description: "Finalise and lock a semester's registrations",
  },
  {
    key: PERMISSIONS.RECORDS_READ,
    description:
      'Read the final registered list and student transcripts (a lower privilege than finalising)',
  },
  {
    key: PERMISSIONS.FEES_MANAGE,
    description: 'Record fee payments and issue/revoke clearance',
  },
  {
    key: PERMISSIONS.CLASS_LISTS_READ,
    description: 'View class lists for a course',
  },
  {
    key: PERMISSIONS.USERS_MANAGE,
    description: 'Create/update/disable user accounts and profiles',
  },
  {
    key: PERMISSIONS.USERS_READ,
    description:
      'Look up/search users and their profiles (a lower privilege than managing them)',
  },
  {
    key: PERMISSIONS.ACADEMICS_MANAGE,
    description: 'Manage faculties, departments and HOD assignment',
  },
  {
    key: PERMISSIONS.SETTINGS_MANAGE,
    description: 'Edit system settings',
  },
  { key: PERMISSIONS.AUDIT_READ, description: 'View the audit log' },
  {
    key: PERMISSIONS.REPORTS_READ,
    description: 'View department and system reports',
  },
];
export const SYSTEM_ADMIN_ROLE = 'system_admin';
export const SEEDED_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  student: [PERMISSIONS.REGISTRATIONS_SUBMIT, PERMISSIONS.COURSES_READ],
  academic_adviser: [PERMISSIONS.APPROVALS_ADVISER, PERMISSIONS.USERS_READ],
  hod: [
    PERMISSIONS.APPROVALS_HOD,
    PERMISSIONS.COURSES_MANAGE,
    PERMISSIONS.COURSES_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.USERS_READ,
  ],
  registry_officer: [
    PERMISSIONS.CALENDAR_MANAGE,
    PERMISSIONS.RECORDS_FINALISE,
    PERMISSIONS.RECORDS_READ,
  ],
  bursary_officer: [PERMISSIONS.FEES_MANAGE, PERMISSIONS.USERS_READ],
  lecturer: [PERMISSIONS.CLASS_LISTS_READ, PERMISSIONS.COURSES_READ],
  system_admin: [],
};
