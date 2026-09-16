// Mirrors backend/src/modules/users/entities/*.ts and its DTOs. `User` is the
// shape `sanitizeUser()` returns (password hash stripped, roles kept as full
// objects because `UsersService.list`/`findByIdWithProfile` return the real
// entity, unlike auth/me's flattened AuthenticatedUser in types/index.ts).

export interface RoleRef {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  roles: RoleRef[];
  createdAt: string;
  updatedAt: string;
}

// GET /users/:id additionally embeds the profile that matches the user's
// role, if any (UsersService.findByIdWithProfile).
export interface UserDetail extends User {
  studentProfile?: StudentProfile;
  staffProfile?: StaffProfile;
}

export interface StudentProfile {
  userId: string;
  matricNo: string;
  departmentId: string;
  department?: { id: string; code: string; name: string };
  level: 100 | 200 | 300 | 400 | 500;
  programme: string;
  gender: string;
  adviserId?: string | null;
  adviser?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfile {
  userId: string;
  staffId: string;
  departmentId?: string | null;
  department?: { id: string; code: string; name: string } | null;
  rank: string;
  createdAt: string;
  updatedAt: string;
}

// Role names ULCRS seeds (root CLAUDE.md's Architecture rules) — the only
// values `POST /users`/`PATCH /users/:id`'s `roles` array accepts, since
// UsersService.resolveRoles() 400s on anything else. Kept here (not fetched
// from an endpoint — there isn't one) as the one place both the create/edit
// form and the list filter read this vocabulary from.
export const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'academic_adviser', label: 'Academic adviser' },
  { value: 'hod', label: 'HOD' },
  { value: 'registry_officer', label: 'Registry officer' },
  { value: 'bursary_officer', label: 'Bursary officer' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'system_admin', label: 'System admin' },
] as const;

export type RoleName = (typeof ROLE_OPTIONS)[number]['value'];

export const STAFF_ROLES: RoleName[] = [
  'academic_adviser',
  'hod',
  'registry_officer',
  'bursary_officer',
  'lecturer',
  'system_admin',
];

export interface ListUsersFilters {
  role?: string;
  departmentId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  roles?: string[];
}

export interface UpsertStudentProfileRequest {
  matricNo: string;
  departmentId: string;
  level: 100 | 200 | 300 | 400 | 500;
  programme: string;
  gender: string;
  adviserId?: string | null;
}

export interface UpsertStaffProfileRequest {
  staffId: string;
  departmentId?: string | null;
  rank: string;
}
