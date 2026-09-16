// Mirrors backend/src/modules/records/records.service.ts's interfaces and
// backend/src/modules/registrations/registrations.service.ts's
// FinaliseSemesterResult (finalise lives on RegistrationsService but is
// exposed here via POST /records/finalise, see backend/CLAUDE.md).
import type { RegistrationStatus } from './registrations';

export type RecordListStatus = 'approved' | 'finalised';

export interface RecordCourseRow {
  courseId: string;
  code: string;
  title: string;
  creditUnits: number;
}

export interface RecordRow {
  registrationId: string;
  studentId: string;
  matricNo: string;
  studentName: string;
  department: string;
  level: number;
  programme: string;
  status: RegistrationStatus;
  totalUnits: number;
  courses: RecordCourseRow[];
}

export interface ListRecordsFilters {
  semesterId: string;
  status?: RecordListStatus;
}

export interface TranscriptResultRow {
  sessionName: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  score: number;
  grade: string;
  gradePoint: number;
}

export interface Transcript {
  student: {
    id: string;
    matricNo: string;
    name: string;
    department: string;
    level: number;
    programme: string;
  };
  results: TranscriptResultRow[];
  totalCreditUnits: number;
  gpa: number;
}

export interface FinaliseSemesterOutstandingItem {
  registrationId: string;
  studentId: string;
  status: RegistrationStatus;
}

export interface FinaliseSemesterResult {
  semesterId: string;
  lockedAt: string;
  finalisedCount: number;
  finalisedRegistrationIds: string[];
  outstandingCount: number;
  outstanding: FinaliseSemesterOutstandingItem[];
}
