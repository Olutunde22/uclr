import { User } from '../modules/users/entities/user.entity';
import { StudentProfile } from '../modules/users/entities/student-profile.entity';
import { StaffProfile } from '../modules/users/entities/staff-profile.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { Permission } from '../modules/roles/entities/permission.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { SystemSetting } from '../modules/settings/entities/system-setting.entity';
import { Faculty } from '../modules/academics/entities/faculty.entity';
import { Department } from '../modules/academics/entities/department.entity';
import { AcademicSession } from '../modules/calendar/entities/academic-session.entity';
import { Semester } from '../modules/calendar/entities/semester.entity';
import { FeePayment } from '../modules/fees/entities/fee-payment.entity';
import { FeeClearance } from '../modules/fees/entities/fee-clearance.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { TimetableSlot } from '../modules/courses/entities/timetable-slot.entity';
import { CourseResult } from '../modules/courses/entities/course-result.entity';
import { Registration } from '../modules/registrations/entities/registration.entity';
import { RegistrationCourse } from '../modules/registrations/entities/registration-course.entity';
import { Approval } from '../modules/registrations/entities/approval.entity';
import { RegistryRecord } from '../modules/records/entities/registry-record.entity';
export const entities = [
  User,
  StudentProfile,
  StaffProfile,
  Role,
  Permission,
  AuditLog,
  SystemSetting,
  Faculty,
  Department,
  AcademicSession,
  Semester,
  FeePayment,
  FeeClearance,
  Course,
  TimetableSlot,
  CourseResult,
  Registration,
  RegistrationCourse,
  Approval,
  RegistryRecord,
];
