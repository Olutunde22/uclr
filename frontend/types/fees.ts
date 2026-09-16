// Mirrors backend/src/modules/fees/entities/*.ts and its DTOs.
import type { AcademicSession } from './calendar';
import type { User } from './users';

export interface FeePayment {
  id: string;
  studentId: string;
  student?: User;
  sessionId: string;
  session?: AcademicSession;
  amount: string;
  receiptNo: string;
  paymentDate: string;
  recordedBy: string;
  recordedByUser?: User;
  createdAt: string;
}

export interface FeeClearance {
  id: string;
  studentId: string;
  student?: User;
  sessionId: string;
  session?: AcademicSession;
  cleared: boolean;
  clearedBy?: string | null;
  clearedByUser?: User | null;
  clearedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  studentId: string;
  sessionId: string;
  amount: string;
  receiptNo: string;
  paymentDate: string;
}

export interface ListPaymentsFilters {
  studentId?: string;
  sessionId?: string;
}

export interface SetClearanceRequest {
  studentId: string;
  sessionId: string;
}

// GET /fees/me's response shape — the student's own read-only fee status.
export interface OwnFeeStatus {
  clearances: FeeClearance[];
  payments: FeePayment[];
}
