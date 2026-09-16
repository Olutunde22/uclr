import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { hashPassword } from '../../src/common/password';
import { Faculty } from '../../src/modules/academics/entities/faculty.entity';
import { Department } from '../../src/modules/academics/entities/department.entity';
import { User } from '../../src/modules/users/entities/user.entity';
import { StudentProfile } from '../../src/modules/users/entities/student-profile.entity';
import { StaffProfile } from '../../src/modules/users/entities/staff-profile.entity';
import { Role } from '../../src/modules/roles/entities/role.entity';
import { AcademicSession } from '../../src/modules/calendar/entities/academic-session.entity';
import { Semester } from '../../src/modules/calendar/entities/semester.entity';
import {
  Course,
  CourseSemester,
} from '../../src/modules/courses/entities/course.entity';
import {
  TimetableSlot,
  Weekday,
} from '../../src/modules/courses/entities/timetable-slot.entity';
import { FeeClearance } from '../../src/modules/fees/entities/fee-clearance.entity';
let counter = 0;
export function uniqueSuffix(): string {
  counter += 1;
  return `${Date.now()}${counter}`;
}
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app;
}
export function repo<T extends object>(
  app: INestApplication,
  entity: new () => T,
): Repository<T> {
  return app.get<Repository<T>>(getRepositoryToken(entity));
}
const TEST_PASSWORD = 'TestPass123!';
let cachedPasswordHash: string | undefined;
async function testPasswordHash(): Promise<string> {
  if (!cachedPasswordHash) {
    cachedPasswordHash = await hashPassword(TEST_PASSWORD);
  }
  return cachedPasswordHash;
}
export async function loginAs(
  app: INestApplication,
  email: string,
): Promise<ReturnType<typeof request.agent>> {
  const agent = request.agent(app.getHttpServer());
  const res = await agent
    .post('/api/auth/login')
    .send({ email, password: TEST_PASSWORD });
  if (res.status !== 200) {
    throw new Error(
      `Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }
  return agent;
}
export async function createFacultyAndDepartment(
  app: INestApplication,
): Promise<{
  faculty: Faculty;
  department: Department;
}> {
  const suffix = uniqueSuffix();
  const faculty = await repo(app, Faculty).save(
    repo(app, Faculty).create({
      code: `FAC${suffix}`,
      name: `Test Faculty ${suffix}`,
    }),
  );
  const department = await repo(app, Department).save(
    repo(app, Department).create({
      code: `DEP${suffix}`,
      name: `Test Department ${suffix}`,
      facultyId: faculty.id,
    }),
  );
  return { faculty, department };
}
export async function findRole(
  app: INestApplication,
  name: string,
): Promise<Role> {
  const role = await repo(app, Role).findOne({ where: { name } });
  if (!role)
    throw new Error(`Role "${name}" not seeded — did the app bootstrap?`);
  return role;
}
export async function createUserWithRole(
  app: INestApplication,
  roleName: string,
  opts: {
    emailPrefix?: string;
  } = {},
): Promise<User> {
  const suffix = uniqueSuffix();
  const role = await findRole(app, roleName);
  const passwordHash = await testPasswordHash();
  return repo(app, User).save(
    repo(app, User).create({
      email: `${opts.emailPrefix ?? roleName}.${suffix}@e2e.ulcrs.test`,
      firstName: 'Test',
      lastName: roleName,
      passwordHash,
      roles: [role],
      isActive: true,
    }),
  );
}
export async function createHod(
  app: INestApplication,
  department: Department,
): Promise<User> {
  const hod = await createUserWithRole(app, 'hod', { emailPrefix: 'hod' });
  await repo(app, StaffProfile).save(
    repo(app, StaffProfile).create({
      userId: hod.id,
      staffId: `HOD-${uniqueSuffix()}`,
      departmentId: department.id,
      rank: 'Senior Lecturer',
    }),
  );
  department.hodId = hod.id;
  await repo(app, Department).save(department);
  return hod;
}
export async function createAdviser(app: INestApplication): Promise<User> {
  const adviser = await createUserWithRole(app, 'academic_adviser', {
    emailPrefix: 'adviser',
  });
  await repo(app, StaffProfile).save(
    repo(app, StaffProfile).create({
      userId: adviser.id,
      staffId: `ADV-${uniqueSuffix()}`,
      rank: 'Lecturer I',
    }),
  );
  return adviser;
}
export async function createLecturer(app: INestApplication): Promise<User> {
  const lecturer = await createUserWithRole(app, 'lecturer', {
    emailPrefix: 'lecturer',
  });
  await repo(app, StaffProfile).save(
    repo(app, StaffProfile).create({
      userId: lecturer.id,
      staffId: `LEC-${uniqueSuffix()}`,
      rank: 'Lecturer II',
    }),
  );
  return lecturer;
}
export async function createRegistryOfficer(
  app: INestApplication,
): Promise<User> {
  const registry = await createUserWithRole(app, 'registry_officer', {
    emailPrefix: 'registry',
  });
  await repo(app, StaffProfile).save(
    repo(app, StaffProfile).create({
      userId: registry.id,
      staffId: `REG-${uniqueSuffix()}`,
      rank: 'Registry Officer',
    }),
  );
  return registry;
}
export async function createStudent(
  app: INestApplication,
  department: Department,
  adviser: User,
  opts: {
    level?: number;
  } = {},
): Promise<User> {
  const suffix = uniqueSuffix();
  const student = await createUserWithRole(app, 'student', {
    emailPrefix: 'student',
  });
  await repo(app, StudentProfile).save(
    repo(app, StudentProfile).create({
      userId: student.id,
      matricNo: `TST/${suffix}`,
      departmentId: department.id,
      level: opts.level ?? 100,
      programme: 'B.Sc. Test Programme',
      gender: 'male',
      adviserId: adviser.id,
    }),
  );
  return student;
}
export async function createOpenSemester(
  app: INestApplication,
  opts: {
    locked?: boolean;
  } = {},
): Promise<{
  session: AcademicSession;
  semester: Semester;
}> {
  const suffix = uniqueSuffix();
  const session = await repo(app, AcademicSession).save(
    repo(app, AcademicSession).create({
      name: `E2E ${suffix}`,
      isCurrent: false,
    }),
  );
  const now = Date.now();
  const semester = await repo(app, Semester).save(
    repo(app, Semester).create({
      sessionId: session.id,
      name: 'first',
      isCurrent: false,
      registrationOpensAt: new Date(now - 24 * 60 * 60 * 1000),
      registrationClosesAt: new Date(now + 24 * 60 * 60 * 1000),
      addDropClosesAt: new Date(now + 48 * 60 * 60 * 1000),
      lockedAt: opts.locked ? new Date(now - 1000) : null,
    }),
  );
  return { session, semester };
}
export interface CourseSeedOpts {
  department: Department;
  creditUnits?: number;
  capacity?: number;
  semester?: CourseSemester;
  level?: number;
  isActive?: boolean;
  lecturerId?: string | null;
  prerequisites?: Course[];
  slots?: {
    day: Weekday;
    startTime: string;
    endTime: string;
    venue?: string;
  }[];
}
export async function createCourse(
  app: INestApplication,
  opts: CourseSeedOpts,
): Promise<Course> {
  const suffix = uniqueSuffix();
  let course = repo(app, Course).create({
    code: `TST${suffix}`,
    title: `Test Course ${suffix}`,
    departmentId: opts.department.id,
    creditUnits: opts.creditUnits ?? 18,
    level: opts.level ?? 100,
    semester: opts.semester ?? 'first',
    capacity: opts.capacity ?? 10,
    lecturerId: opts.lecturerId ?? null,
    isActive: opts.isActive ?? true,
  });
  course = await repo(app, Course).save(course);
  if (opts.prerequisites?.length) {
    course.prerequisites = opts.prerequisites;
    course = await repo(app, Course).save(course);
  }
  if (opts.slots?.length) {
    await repo(app, TimetableSlot).save(
      opts.slots.map((slot) =>
        repo(app, TimetableSlot).create({
          courseId: course.id,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          venue: slot.venue ?? 'Test Venue',
        }),
      ),
    );
  }
  return course;
}
export async function setFeeClearance(
  app: INestApplication,
  studentId: string,
  sessionId: string,
  cleared: boolean,
): Promise<void> {
  await repo(app, FeeClearance).save(
    repo(app, FeeClearance).create({
      studentId,
      sessionId,
      cleared,
      clearedBy: null,
      clearedAt: cleared ? new Date() : null,
    }),
  );
}
export { TEST_PASSWORD };
