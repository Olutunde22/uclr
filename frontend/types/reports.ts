// Mirrors backend/src/modules/reports/reports.service.ts's interfaces.
import type { RegistrationStatus } from './registrations';

export type StatusCounts = Record<RegistrationStatus, number>;

export interface DepartmentReportCourseRow {
  courseId: string;
  code: string;
  title: string;
  level: number;
  counts: StatusCounts;
  total: number;
}

export interface DepartmentReportLevelRow {
  level: number;
  counts: StatusCounts;
  total: number;
}

export interface DepartmentReport {
  departmentId: string;
  departmentName: string;
  semesterId: string;
  courses: DepartmentReportCourseRow[];
  byLevel: DepartmentReportLevelRow[];
  totals: StatusCounts & { total: number };
}

export interface SystemReportRoleRow {
  role: string;
  totalUsers: number;
  everLoggedIn: number;
}

export interface SystemReport {
  logins: {
    totalUsers: number;
    usersEverLoggedIn: number;
    usersLoggedInLast7Days: number;
    usersLoggedInLast30Days: number;
    byRole: SystemReportRoleRow[];
  };
  registrations: {
    semesterId: string | null;
    counts: StatusCounts;
    total: number;
  };
}
