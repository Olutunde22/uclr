// Mirrors backend/src/modules/registrations/entities/*.ts, its DTOs and
// RegistrationRulesService's RuleViolation/RuleResult shapes. Approvals share
// this module on the backend (no separate approvals module — see
// backend/CLAUDE.md), so approval decisions live in this same types file
// rather than a parallel one.
import type { Course } from './courses';
import type { Semester } from './calendar';
import type { User } from './users';

export type RegistrationStatus =
  | 'draft'
  | 'pending_adviser'
  | 'pending_hod'
  | 'approved'
  | 'rejected'
  | 'finalised';

export type ApprovalDecisionStatus = 'pending' | 'approved' | 'rejected';

export type Decision = 'approved' | 'rejected';

export interface Approval {
  id: string;
  registrationId: string;
  adviserId: string;
  adviser?: User;
  adviserStatus: ApprovalDecisionStatus;
  adviserComment?: string | null;
  adviserDecidedAt?: string | null;
  hodId?: string | null;
  hod?: User | null;
  hodStatus: ApprovalDecisionStatus;
  hodComment?: string | null;
  hodDecidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationCourse {
  id: string;
  registrationId: string;
  courseId: string;
  course: Course;
  createdAt: string;
}

export interface Registration {
  id: string;
  studentId: string;
  student?: User;
  semesterId: string;
  semester?: Semester;
  status: RegistrationStatus;
  totalUnits: number;
  submittedAt?: string | null;
  courses: RegistrationCourse[];
  approval?: Approval;
  createdAt: string;
  updatedAt: string;
}

// RegistrationRulesService.evaluate's return shape — every violation, not
// just the first, per PLAN.md's "student sees all clash and error alerts
// together" rule.
export interface RuleViolation {
  rule: string;
  message: string;
  courseId?: string;
}

export interface RuleResult {
  valid: boolean;
  violations: RuleViolation[];
}

// submit()/addDrop()'s outcome: either the rules failed (no registration
// change) or they passed and the updated registration comes back.
export interface SubmitOutcome extends RuleResult {
  registration?: Registration;
}
