// The cache contract (query.md). A prefetch key and its hook key must be
// IDENTICAL or the hydration is silently wasted — the page refetches on
// mount, flashes a skeleton, and doubles the request count. Nothing errors.
// Keys live here and nowhere else; every future feature slice (registrations,
// approvals, courses, ...) extends this file rather than inlining a key.
export const authKeys = {
  all: () => ['auth'] as const,
  session: () => [...authKeys.all(), 'session'] as const,
};

// Milestone 9 (admin): users, academics, settings, audit. Filter objects go
// last in the tuple (query.md) so `usersKeys.lists()` / `.all()` stay stable
// prefixes for invalidation.
export const usersKeys = {
  all: () => ['users'] as const,
  lists: () => [...usersKeys.all(), 'list'] as const,
  list: (filters: object) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all(), 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

export const facultiesKeys = {
  all: () => ['faculties'] as const,
  list: () => [...facultiesKeys.all(), 'list'] as const,
};

export const departmentsKeys = {
  all: () => ['departments'] as const,
  list: (facultyId?: string) =>
    [...departmentsKeys.all(), 'list', facultyId ?? null] as const,
};

export const settingsKeys = {
  all: () => ['settings'] as const,
  list: () => [...settingsKeys.all(), 'list'] as const,
};

export const auditKeys = {
  all: () => ['audit'] as const,
  lists: () => [...auditKeys.all(), 'list'] as const,
  list: (filters: object) => [...auditKeys.lists(), filters] as const,
};

// Milestone 10 (calendar): sessions/semesters. AcademicSession.isCurrent and
// Semester.isCurrent are both single global flags (backend/CLAUDE.md), so
// every mutation that touches "current" invalidates the whole branch, not
// just one row.
export const calendarKeys = {
  all: () => ['calendar'] as const,
  sessions: () => [...calendarKeys.all(), 'sessions'] as const,
  semesters: () => [...calendarKeys.all(), 'semesters'] as const,
  semestersList: (sessionId?: string) =>
    [...calendarKeys.semesters(), sessionId ?? null] as const,
};

// Milestone 10 (fees): payments, and the permission-less "me" self-read used
// by the student's own /fees page. There is no list endpoint for an
// arbitrary student's fee clearances (only issue/revoke return one row) —
// see components/fees/students' doc comment for how the UI works around
// that without inventing data.
export const feesKeys = {
  all: () => ['fees'] as const,
  payments: () => [...feesKeys.all(), 'payments'] as const,
  paymentsList: (filters: object) => [...feesKeys.payments(), filters] as const,
  me: (sessionId?: string) => [...feesKeys.all(), 'me', sessionId ?? null] as const,
};

// Milestone 11 (courses): the general courses:manage-gated CRUD (list/detail),
// the lecturer's permission-less "own courses" family (`mine`), and class
// lists (scoped per-course + semester, shared by both HOD and lecturer
// viewers). Adding/removing a timetable slot or prerequisite, or
// (un)assigning a lecturer, all invalidate the one course's `detail(id)` —
// they're nested under it in the API too (CoursesService.findOne re-embeds
// prerequisites/timetableSlots on every mutation). Assigning/clearing a
// lecturer additionally invalidates `mine()` since it can add or remove a
// course from that lecturer's own list.
export const coursesKeys = {
  all: () => ['courses'] as const,
  lists: () => [...coursesKeys.all(), 'list'] as const,
  list: (filters: object) => [...coursesKeys.lists(), filters] as const,
  details: () => [...coursesKeys.all(), 'detail'] as const,
  detail: (id: string) => [...coursesKeys.details(), id] as const,
  mine: () => [...coursesKeys.all(), 'mine'] as const,
  classList: (id: string, semesterId?: string) =>
    [...coursesKeys.all(), 'class-list', id, semesterId ?? null] as const,
};

// Milestone 12 (registrations & approvals): the student's own registration
// self-read (permission-less, self-scoped — matches fees/me and
// courses/mine), and the shared adviser/HOD queues. A decision or
// submit/add-drop invalidates both `own(semesterId)` (the student's status
// view) and whichever queue the decider belongs to — see hooks/use-approvals.ts.
export const registrationsKeys = {
  all: () => ['registrations'] as const,
  own: (semesterId?: string) =>
    [...registrationsKeys.all(), 'own', semesterId ?? null] as const,
};

export const approvalsKeys = {
  all: () => ['approvals'] as const,
  adviserQueue: () => [...approvalsKeys.all(), 'adviser-queue'] as const,
  hodQueue: () => [...approvalsKeys.all(), 'hod-queue'] as const,
  advisees: (adviserId: string) =>
    [...approvalsKeys.all(), 'advisees', adviserId] as const,
};
