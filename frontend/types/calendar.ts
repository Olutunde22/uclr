// Mirrors backend/src/modules/calendar/entities/*.ts and its DTOs.
export interface AcademicSession {
  id: string;
  name: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SemesterName = 'first' | 'second';

export interface Semester {
  id: string;
  sessionId: string;
  session?: AcademicSession;
  name: SemesterName;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  addDropClosesAt?: string | null;
  isCurrent: boolean;
  lockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  name: string;
}

export type UpdateSessionRequest = Partial<CreateSessionRequest>;

export interface CreateSemesterRequest {
  sessionId: string;
  name: SemesterName;
}

export interface UpdateSemesterRequest {
  name?: SemesterName;
}

export interface UpdateSemesterWindowsRequest {
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  addDropClosesAt?: string;
}
