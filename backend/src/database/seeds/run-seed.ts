import 'reflect-metadata';
import 'dotenv/config';
import '../entities';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Permission } from '../../modules/roles/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { StudentProfile } from '../../modules/users/entities/student-profile.entity';
import { StaffProfile } from '../../modules/users/entities/staff-profile.entity';
import { Faculty } from '../../modules/academics/entities/faculty.entity';
import { Department } from '../../modules/academics/entities/department.entity';
import { AcademicSession } from '../../modules/calendar/entities/academic-session.entity';
import { Semester } from '../../modules/calendar/entities/semester.entity';
import {
  Course,
  CourseSemester,
} from '../../modules/courses/entities/course.entity';
import {
  TimetableSlot,
  Weekday,
} from '../../modules/courses/entities/timetable-slot.entity';
import { CourseResult } from '../../modules/courses/entities/course-result.entity';
import { FeeClearance } from '../../modules/fees/entities/fee-clearance.entity';
import { SystemSetting } from '../../modules/settings/entities/system-setting.entity';
import {
  ALL_PERMISSIONS,
  SEEDED_ROLE_PERMISSIONS,
  SYSTEM_ADMIN_ROLE,
} from '../../common/permissions';
import { hashPassword } from '../../common/password';
export const SEED_PASSWORD = 'Seed@12345!';
const CURRENT_SESSION_NAME = '2025/2026';
const PRIOR_SESSION_NAME = '2024/2025';
interface DepartmentSeed {
  code: string;
  name: string;
  facultyCode: string;
}
const FACULTIES = [
  { code: 'SCI', name: 'Faculty of Science' },
  { code: 'ENG', name: 'Faculty of Engineering' },
];
const DEPARTMENTS: DepartmentSeed[] = [
  { code: 'CSC', name: 'Computer Science', facultyCode: 'SCI' },
  { code: 'MTH', name: 'Mathematics', facultyCode: 'SCI' },
  { code: 'PHY', name: 'Physics', facultyCode: 'SCI' },
  { code: 'CHM', name: 'Chemistry', facultyCode: 'SCI' },
  {
    code: 'EEE',
    name: 'Electrical and Electronics Engineering',
    facultyCode: 'ENG',
  },
  { code: 'MEE', name: 'Mechanical Engineering', facultyCode: 'ENG' },
  { code: 'CVE', name: 'Civil Engineering', facultyCode: 'ENG' },
  { code: 'CHE', name: 'Chemical Engineering', facultyCode: 'ENG' },
];
const PROGRAMME_BY_DEPT: Record<string, string> = {
  CSC: 'B.Sc. Computer Science',
  MTH: 'B.Sc. Mathematics',
  PHY: 'B.Sc. Physics',
  CHM: 'B.Sc. Chemistry',
  EEE: 'B.Eng. Electrical and Electronics Engineering',
  MEE: 'B.Eng. Mechanical Engineering',
  CVE: 'B.Eng. Civil Engineering',
  CHE: 'B.Eng. Chemical Engineering',
};
interface CourseSlotSeed {
  day: Weekday;
  startTime: string;
  endTime: string;
  venue: string;
}
interface CourseSeed {
  code: string;
  title: string;
  deptCode: string;
  level: number;
  semester: CourseSemester;
  creditUnits: number;
  capacity: number;
  prerequisite?: string;
  slots: CourseSlotSeed[];
}
const COURSES: CourseSeed[] = [
  {
    code: 'CSC101',
    title: 'Introduction to Computer Science',
    deptCode: 'CSC',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 60,
    slots: [
      { day: 'monday', startTime: '08:00', endTime: '10:00', venue: 'LT1' },
    ],
  },
  {
    code: 'CSC102',
    title: 'Introduction to Programming',
    deptCode: 'CSC',
    level: 100,
    semester: 'second',
    creditUnits: 3,
    capacity: 60,
    prerequisite: 'CSC101',
    slots: [
      { day: 'tuesday', startTime: '08:00', endTime: '10:00', venue: 'LT1' },
    ],
  },
  {
    code: 'CSC201',
    title: 'Data Structures and Algorithms',
    deptCode: 'CSC',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'CSC102',
    slots: [
      { day: 'wednesday', startTime: '10:00', endTime: '12:00', venue: 'LT2' },
    ],
  },
  {
    code: 'CSC202',
    title: 'Computer Architecture',
    deptCode: 'CSC',
    level: 200,
    semester: 'second',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'CSC101',
    slots: [
      { day: 'thursday', startTime: '10:00', endTime: '12:00', venue: 'LT2' },
    ],
  },
  {
    code: 'CSC301',
    title: 'Design and Analysis of Algorithms',
    deptCode: 'CSC',
    level: 300,
    semester: 'first',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'CSC201',
    slots: [
      { day: 'monday', startTime: '12:00', endTime: '14:00', venue: 'LT3' },
    ],
  },
  {
    code: 'CSC302',
    title: 'Operating Systems',
    deptCode: 'CSC',
    level: 300,
    semester: 'second',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'CSC202',
    slots: [
      { day: 'tuesday', startTime: '12:00', endTime: '14:00', venue: 'LT3' },
    ],
  },
  {
    code: 'CSC401',
    title: 'Software Engineering',
    deptCode: 'CSC',
    level: 400,
    semester: 'first',
    creditUnits: 3,
    capacity: 30,
    prerequisite: 'CSC301',
    slots: [
      { day: 'wednesday', startTime: '08:00', endTime: '10:00', venue: 'LT4' },
    ],
  },
  {
    code: 'CSC402',
    title: 'Database Systems',
    deptCode: 'CSC',
    level: 400,
    semester: 'second',
    creditUnits: 3,
    capacity: 30,
    prerequisite: 'CSC201',
    slots: [
      { day: 'thursday', startTime: '08:00', endTime: '10:00', venue: 'LT4' },
    ],
  },
  {
    code: 'CSC501',
    title: 'Artificial Intelligence',
    deptCode: 'CSC',
    level: 500,
    semester: 'first',
    creditUnits: 3,
    capacity: 20,
    prerequisite: 'CSC401',
    slots: [
      { day: 'friday', startTime: '10:00', endTime: '12:00', venue: 'LT5' },
    ],
  },
  {
    code: 'MTH101',
    title: 'Elementary Mathematics I',
    deptCode: 'MTH',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 80,
    slots: [
      { day: 'monday', startTime: '09:00', endTime: '11:00', venue: 'LT2' },
    ],
  },
  {
    code: 'MTH102',
    title: 'Elementary Mathematics II',
    deptCode: 'MTH',
    level: 100,
    semester: 'second',
    creditUnits: 3,
    capacity: 80,
    prerequisite: 'MTH101',
    slots: [
      { day: 'tuesday', startTime: '09:00', endTime: '11:00', venue: 'LT2' },
    ],
  },
  {
    code: 'MTH201',
    title: 'Mathematical Methods I',
    deptCode: 'MTH',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 60,
    prerequisite: 'MTH102',
    slots: [
      { day: 'wednesday', startTime: '08:00', endTime: '10:00', venue: 'LT1' },
    ],
  },
  {
    code: 'MTH202',
    title: 'Mathematical Methods II',
    deptCode: 'MTH',
    level: 200,
    semester: 'second',
    creditUnits: 3,
    capacity: 60,
    prerequisite: 'MTH201',
    slots: [
      { day: 'thursday', startTime: '08:00', endTime: '10:00', venue: 'LT1' },
    ],
  },
  {
    code: 'MTH301',
    title: 'Real Analysis',
    deptCode: 'MTH',
    level: 300,
    semester: 'first',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'MTH201',
    slots: [
      { day: 'monday', startTime: '14:00', endTime: '16:00', venue: 'LT3' },
    ],
  },
  {
    code: 'MTH302',
    title: 'Linear Algebra',
    deptCode: 'MTH',
    level: 300,
    semester: 'second',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'MTH202',
    slots: [
      { day: 'tuesday', startTime: '14:00', endTime: '16:00', venue: 'LT3' },
    ],
  },
  {
    code: 'PHY101',
    title: 'General Physics I',
    deptCode: 'PHY',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 70,
    slots: [
      {
        day: 'wednesday',
        startTime: '12:00',
        endTime: '14:00',
        venue: 'Physics Lab',
      },
    ],
  },
  {
    code: 'PHY102',
    title: 'General Physics II',
    deptCode: 'PHY',
    level: 100,
    semester: 'second',
    creditUnits: 3,
    capacity: 70,
    prerequisite: 'PHY101',
    slots: [
      {
        day: 'thursday',
        startTime: '12:00',
        endTime: '14:00',
        venue: 'Physics Lab',
      },
    ],
  },
  {
    code: 'PHY201',
    title: 'Mechanics',
    deptCode: 'PHY',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'PHY102',
    slots: [
      { day: 'friday', startTime: '08:00', endTime: '10:00', venue: 'LT5' },
    ],
  },
  {
    code: 'PHY202',
    title: 'Electromagnetism',
    deptCode: 'PHY',
    level: 200,
    semester: 'second',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'PHY201',
    slots: [
      { day: 'monday', startTime: '10:00', endTime: '12:00', venue: 'LT2' },
    ],
  },
  {
    code: 'PHY301',
    title: 'Thermodynamics',
    deptCode: 'PHY',
    level: 300,
    semester: 'first',
    creditUnits: 3,
    capacity: 30,
    prerequisite: 'PHY201',
    slots: [
      { day: 'tuesday', startTime: '10:00', endTime: '12:00', venue: 'LT2' },
    ],
  },
  {
    code: 'CHM101',
    title: 'General Chemistry I',
    deptCode: 'CHM',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 70,
    slots: [
      {
        day: 'thursday',
        startTime: '09:00',
        endTime: '11:00',
        venue: 'Chem Lab',
      },
    ],
  },
  {
    code: 'CHM102',
    title: 'General Chemistry II',
    deptCode: 'CHM',
    level: 100,
    semester: 'second',
    creditUnits: 3,
    capacity: 70,
    prerequisite: 'CHM101',
    slots: [
      {
        day: 'friday',
        startTime: '09:00',
        endTime: '11:00',
        venue: 'Chem Lab',
      },
    ],
  },
  {
    code: 'CHM201',
    title: 'Organic Chemistry',
    deptCode: 'CHM',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'CHM102',
    slots: [
      { day: 'wednesday', startTime: '14:00', endTime: '16:00', venue: 'LT4' },
    ],
  },
  {
    code: 'CHM202',
    title: 'Inorganic Chemistry',
    deptCode: 'CHM',
    level: 200,
    semester: 'second',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'CHM102',
    slots: [
      { day: 'thursday', startTime: '14:00', endTime: '16:00', venue: 'LT4' },
    ],
  },
  {
    code: 'EEE101',
    title: 'Introduction to Electrical Engineering',
    deptCode: 'EEE',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 60,
    slots: [
      { day: 'monday', startTime: '08:00', endTime: '10:00', venue: 'Eng LT1' },
    ],
  },
  {
    code: 'EEE201',
    title: 'Circuit Theory',
    deptCode: 'EEE',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'EEE101',
    slots: [
      {
        day: 'tuesday',
        startTime: '08:00',
        endTime: '10:00',
        venue: 'Eng LT1',
      },
    ],
  },
  {
    code: 'EEE202',
    title: 'Electronics I',
    deptCode: 'EEE',
    level: 200,
    semester: 'second',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'EEE201',
    slots: [
      {
        day: 'wednesday',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Eng LT2',
      },
    ],
  },
  {
    code: 'EEE301',
    title: 'Electronics II',
    deptCode: 'EEE',
    level: 300,
    semester: 'first',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'EEE202',
    slots: [
      {
        day: 'thursday',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Eng LT2',
      },
    ],
  },
  {
    code: 'EEE302',
    title: 'Control Systems',
    deptCode: 'EEE',
    level: 300,
    semester: 'second',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'EEE301',
    slots: [
      { day: 'friday', startTime: '12:00', endTime: '14:00', venue: 'Eng LT3' },
    ],
  },
  {
    code: 'EEE401',
    title: 'Power Systems',
    deptCode: 'EEE',
    level: 400,
    semester: 'first',
    creditUnits: 3,
    capacity: 30,
    prerequisite: 'EEE301',
    slots: [
      { day: 'monday', startTime: '12:00', endTime: '14:00', venue: 'Eng LT3' },
    ],
  },
  {
    code: 'MEE101',
    title: 'Engineering Mechanics',
    deptCode: 'MEE',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 60,
    slots: [
      {
        day: 'tuesday',
        startTime: '12:00',
        endTime: '14:00',
        venue: 'Eng LT1',
      },
    ],
  },
  {
    code: 'MEE201',
    title: 'Thermodynamics I',
    deptCode: 'MEE',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'MEE101',
    slots: [
      {
        day: 'wednesday',
        startTime: '08:00',
        endTime: '10:00',
        venue: 'Eng LT2',
      },
    ],
  },
  {
    code: 'MEE301',
    title: 'Fluid Mechanics',
    deptCode: 'MEE',
    level: 300,
    semester: 'first',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'MEE201',
    slots: [
      {
        day: 'thursday',
        startTime: '08:00',
        endTime: '10:00',
        venue: 'Eng LT2',
      },
    ],
  },
  {
    code: 'MEE302',
    title: 'Fluid Mechanics II',
    deptCode: 'MEE',
    level: 300,
    semester: 'second',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'MEE301',
    slots: [
      { day: 'friday', startTime: '08:00', endTime: '10:00', venue: 'Eng LT2' },
    ],
  },
  {
    code: 'CVE101',
    title: 'Introduction to Civil Engineering',
    deptCode: 'CVE',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 60,
    slots: [
      { day: 'monday', startTime: '10:00', endTime: '12:00', venue: 'Eng LT3' },
    ],
  },
  {
    code: 'CVE201',
    title: 'Structural Analysis I',
    deptCode: 'CVE',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'CVE101',
    slots: [
      {
        day: 'tuesday',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Eng LT3',
      },
    ],
  },
  {
    code: 'CVE301',
    title: 'Structural Analysis II',
    deptCode: 'CVE',
    level: 300,
    semester: 'first',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'CVE201',
    slots: [
      {
        day: 'wednesday',
        startTime: '12:00',
        endTime: '14:00',
        venue: 'Eng LT4',
      },
    ],
  },
  {
    code: 'CVE302',
    title: 'Reinforced Concrete Design',
    deptCode: 'CVE',
    level: 300,
    semester: 'second',
    creditUnits: 3,
    capacity: 40,
    prerequisite: 'CVE301',
    slots: [
      {
        day: 'thursday',
        startTime: '12:00',
        endTime: '14:00',
        venue: 'Eng LT4',
      },
    ],
  },
  {
    code: 'CHE101',
    title: 'Introduction to Chemical Engineering',
    deptCode: 'CHE',
    level: 100,
    semester: 'first',
    creditUnits: 3,
    capacity: 60,
    slots: [
      { day: 'friday', startTime: '14:00', endTime: '16:00', venue: 'Eng LT5' },
    ],
  },
  {
    code: 'CHE201',
    title: 'Mass Transfer Operations',
    deptCode: 'CHE',
    level: 200,
    semester: 'first',
    creditUnits: 3,
    capacity: 50,
    prerequisite: 'CHE101',
    slots: [
      { day: 'monday', startTime: '16:00', endTime: '18:00', venue: 'Eng LT5' },
    ],
  },
];
const LECTURER_COURSE_CODES = [
  'CSC101',
  'CSC102',
  'CSC201',
  'CSC202',
  'CSC301',
  'MTH101',
  'MTH201',
];
interface StudentSeed {
  deptCode: string;
  level: number;
  gender: 'male' | 'female';
  firstName: string;
  lastName: string;
}
const FIRST_NAMES = [
  'Adaeze',
  'Chinedu',
  'Bolanle',
  'Emeka',
  'Folake',
  'Gbenga',
  'Halima',
  'Ifeoma',
  'Junaid',
  'Kemi',
  'Lawal',
  'Ngozi',
  'Obinna',
  'Peju',
  'Rasheed',
  'Sade',
  'Tunde',
  'Uche',
  'Vivian',
  'Wale',
  'Yemisi',
  'Zainab',
  'Ayo',
  'Bukola',
  'Chioma',
  'Damola',
  'Efe',
  'Funke',
  'Godwin',
  'Hauwa',
];
const LAST_NAMES = [
  'Okafor',
  'Balogun',
  'Eze',
  'Adeyemi',
  'Nwosu',
  'Bello',
  'Okoro',
  'Afolabi',
  'Ibrahim',
  'Chukwu',
  'Ogundele',
  'Suleiman',
  'Nnamdi',
  'Fashola',
  'Ahmed',
  'Uzoma',
  'Salami',
  'Onyekwere',
  'Musa',
  'Adebayo',
  'Igwe',
  'Yusuf',
  'Nnaji',
  'Oyelaran',
  'Danjuma',
  'Obi',
  'Lawal',
  'Akintola',
  'Ojo',
  'Umar',
];
const STUDENT_PLAN: {
  deptCode: string;
  levels: number[];
}[] = [
  {
    deptCode: 'CSC',
    levels: [100, 100, 200, 200, 200, 300, 300, 400, 400, 500],
  },
  { deptCode: 'MTH', levels: [100, 200, 200, 300] },
  { deptCode: 'PHY', levels: [100, 200, 300] },
  { deptCode: 'CHM', levels: [100, 200, 300] },
  { deptCode: 'EEE', levels: [100, 200, 200, 300] },
  { deptCode: 'MEE', levels: [100, 200] },
  { deptCode: 'CVE', levels: [100, 200] },
  { deptCode: 'CHE', levels: [100, 200] },
];
function buildStudentSeeds(): StudentSeed[] {
  const students: StudentSeed[] = [];
  let nameIndex = 0;
  for (const group of STUDENT_PLAN) {
    for (const level of group.levels) {
      students.push({
        deptCode: group.deptCode,
        level,
        gender: nameIndex % 2 === 0 ? 'male' : 'female',
        firstName: FIRST_NAMES[nameIndex % FIRST_NAMES.length],
        lastName: LAST_NAMES[nameIndex % LAST_NAMES.length],
      });
      nameIndex += 1;
    }
  }
  return students;
}
function pseudoScore(seed: number): number {
  const v = Math.abs(Math.sin(seed) * 10000);
  return 35 + Math.floor(v % 60);
}
function gradeFor(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}
function intakeShortYear(level: number): string {
  const currentYear = 2025;
  const yearsIn = level / 100 - 1;
  return String(currentYear - yearsIn).slice(-2);
}
async function seedPermissionsRolesAndAdmin(
  ds: DataSource,
): Promise<Map<string, Role>> {
  const permRepo = ds.getRepository(Permission);
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);
  await permRepo.upsert(
    ALL_PERMISSIONS.map((def) => ({
      key: def.key,
      description: def.description,
    })),
    ['key'],
  );
  const allPerms = await permRepo.find();
  const byKey = new Map(allPerms.map((p) => [p.key, p]));
  const rolesByName = new Map<string, Role>();
  let systemAdminRole: Role | undefined;
  for (const [name, keys] of Object.entries(SEEDED_ROLE_PERMISSIONS)) {
    const isSystemAdmin = name === SYSTEM_ADMIN_ROLE;
    const perms = isSystemAdmin
      ? allPerms
      : keys.map((k) => byKey.get(k)).filter((p): p is Permission => !!p);
    let role = await roleRepo.findOne({ where: { name } });
    if (!role) {
      role = roleRepo.create({ name, permissions: perms });
    } else {
      role.permissions = perms;
    }
    role = await roleRepo.save(role);
    rolesByName.set(name, role);
    if (isSystemAdmin) systemAdminRole = role;
  }
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@ulcrs.edu.ng';
  const existingUser = await userRepo.findOne({ where: { email } });
  if (!existingUser && systemAdminRole) {
    await userRepo.save(
      userRepo.create({
        email,
        firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME ?? 'System',
        lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME ?? 'Admin',
        passwordHash: await hashPassword(
          process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'ChangeMe123!',
        ),
        roles: [systemAdminRole],
        isActive: true,
      }),
    );
  }
  return rolesByName;
}
async function seedAcademics(ds: DataSource): Promise<Map<string, Department>> {
  const facultyRepo = ds.getRepository(Faculty);
  const departmentRepo = ds.getRepository(Department);
  await facultyRepo.upsert(FACULTIES, ['code']);
  const faculties = await facultyRepo.find();
  const facultyByCode = new Map(faculties.map((f) => [f.code, f]));
  const deptByCode = new Map<string, Department>();
  for (const dept of DEPARTMENTS) {
    const faculty = facultyByCode.get(dept.facultyCode)!;
    let row = await departmentRepo.findOne({ where: { code: dept.code } });
    if (!row) {
      row = departmentRepo.create({
        code: dept.code,
        name: dept.name,
        facultyId: faculty.id,
      });
    } else {
      row.name = dept.name;
      row.facultyId = faculty.id;
    }
    row = await departmentRepo.save(row);
    deptByCode.set(dept.code, row);
  }
  return deptByCode;
}
async function seedCalendar(ds: DataSource): Promise<{
  currentSession: AcademicSession;
  currentSemester: Semester;
  priorSession: AcademicSession;
}> {
  const sessionRepo = ds.getRepository(AcademicSession);
  const semesterRepo = ds.getRepository(Semester);
  const upsertSession = async (
    name: string,
    isCurrent: boolean,
  ): Promise<AcademicSession> => {
    let session = await sessionRepo.findOne({ where: { name } });
    if (!session) {
      session = sessionRepo.create({ name, isCurrent });
    } else {
      session.isCurrent = isCurrent;
    }
    return sessionRepo.save(session);
  };
  await sessionRepo
    .createQueryBuilder()
    .update(AcademicSession)
    .set({ isCurrent: false })
    .where('is_current = true')
    .execute();
  const currentSession = await upsertSession(CURRENT_SESSION_NAME, true);
  const priorSession = await upsertSession(PRIOR_SESSION_NAME, false);
  const now = new Date();
  const opensAt = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const registrationClosesAt = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  );
  const addDropClosesAt = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
  await semesterRepo
    .createQueryBuilder()
    .update(Semester)
    .set({ isCurrent: false })
    .where('is_current = true')
    .execute();
  let firstSemester = await semesterRepo.findOne({
    where: { sessionId: currentSession.id, name: 'first' },
  });
  if (!firstSemester) {
    firstSemester = semesterRepo.create({
      sessionId: currentSession.id,
      name: 'first',
    });
  }
  firstSemester.isCurrent = true;
  firstSemester.registrationOpensAt = opensAt;
  firstSemester.registrationClosesAt = registrationClosesAt;
  firstSemester.addDropClosesAt = addDropClosesAt;
  firstSemester.lockedAt = null;
  firstSemester = await semesterRepo.save(firstSemester);
  let secondSemester = await semesterRepo.findOne({
    where: { sessionId: currentSession.id, name: 'second' },
  });
  if (!secondSemester) {
    secondSemester = semesterRepo.create({
      sessionId: currentSession.id,
      name: 'second',
    });
  }
  secondSemester.isCurrent = false;
  secondSemester.registrationOpensAt = new Date(
    now.getTime() + 120 * 24 * 60 * 60 * 1000,
  );
  secondSemester.registrationClosesAt = new Date(
    now.getTime() + 150 * 24 * 60 * 60 * 1000,
  );
  secondSemester.addDropClosesAt = new Date(
    now.getTime() + 160 * 24 * 60 * 60 * 1000,
  );
  await semesterRepo.save(secondSemester);
  for (const name of ['first', 'second'] as const) {
    let semester = await semesterRepo.findOne({
      where: { sessionId: priorSession.id, name },
    });
    if (!semester) {
      semester = semesterRepo.create({
        sessionId: priorSession.id,
        name,
        isCurrent: false,
        registrationOpensAt: new Date('2024-08-01'),
        registrationClosesAt: new Date('2024-09-01'),
        addDropClosesAt: new Date('2024-09-15'),
        lockedAt: new Date('2025-02-01'),
      });
      await semesterRepo.save(semester);
    }
  }
  return { currentSession, currentSemester: firstSemester, priorSession };
}
async function seedSettings(ds: DataSource): Promise<void> {
  const settingsRepo = ds.getRepository(SystemSetting);
  await settingsRepo.upsert(
    [
      { key: 'min_credit_units', value: '15' },
      { key: 'max_credit_units', value: '24' },
      { key: 'pass_mark', value: '40' },
    ],
    ['key'],
  );
}
interface SeededStaff {
  adviser: User;
  hod: User;
  registry: User;
  bursary: User;
  lecturer: User;
}
async function findOrCreateUser(
  ds: DataSource,
  email: string,
  firstName: string,
  lastName: string,
  role: Role,
  passwordHash: string,
): Promise<User> {
  const userRepo = ds.getRepository(User);
  let user = await userRepo.findOne({ where: { email } });
  if (!user) {
    user = userRepo.create({
      email,
      firstName,
      lastName,
      passwordHash,
      roles: [role],
      isActive: true,
    });
    user = await userRepo.save(user);
  }
  return user;
}
async function upsertStaffProfile(
  ds: DataSource,
  userId: string,
  staffId: string,
  departmentId: string | null,
  rank: string,
): Promise<void> {
  const staffProfileRepo = ds.getRepository(StaffProfile);
  let profile = await staffProfileRepo.findOne({ where: { userId } });
  if (!profile) {
    profile = staffProfileRepo.create({ userId });
  }
  profile.staffId = staffId;
  profile.departmentId = departmentId;
  profile.rank = rank;
  await staffProfileRepo.save(profile);
}
async function seedStaff(
  ds: DataSource,
  rolesByName: Map<string, Role>,
  deptByCode: Map<string, Department>,
  passwordHash: string,
): Promise<SeededStaff> {
  const departmentRepo = ds.getRepository(Department);
  const csc = deptByCode.get('CSC')!;
  const adviser = await findOrCreateUser(
    ds,
    'academic.adviser@ulcrs.edu.ng',
    'Amaka',
    'Adeyemi',
    rolesByName.get('academic_adviser')!,
    passwordHash,
  );
  await upsertStaffProfile(
    ds,
    adviser.id,
    'ADV-0001',
    csc.id,
    'Senior Lecturer',
  );
  const hod = await findOrCreateUser(
    ds,
    'hod@ulcrs.edu.ng',
    'Chukwuemeka',
    'Obi',
    rolesByName.get('hod')!,
    passwordHash,
  );
  await upsertStaffProfile(ds, hod.id, 'HOD-0001', csc.id, 'Professor');
  csc.hodId = hod.id;
  await departmentRepo.save(csc);
  const registry = await findOrCreateUser(
    ds,
    'registry@ulcrs.edu.ng',
    'Folashade',
    'Bello',
    rolesByName.get('registry_officer')!,
    passwordHash,
  );
  await upsertStaffProfile(
    ds,
    registry.id,
    'REG-0001',
    null,
    'Registry Officer',
  );
  const bursary = await findOrCreateUser(
    ds,
    'bursary@ulcrs.edu.ng',
    'Ibrahim',
    'Suleiman',
    rolesByName.get('bursary_officer')!,
    passwordHash,
  );
  await upsertStaffProfile(ds, bursary.id, 'BUR-0001', null, 'Bursary Officer');
  const lecturer = await findOrCreateUser(
    ds,
    'lecturer@ulcrs.edu.ng',
    'Ngozi',
    'Eze',
    rolesByName.get('lecturer')!,
    passwordHash,
  );
  await upsertStaffProfile(ds, lecturer.id, 'LEC-0001', csc.id, 'Lecturer I');
  return { adviser, hod, registry, bursary, lecturer };
}
async function seedCourses(
  ds: DataSource,
  deptByCode: Map<string, Department>,
  lecturer: User,
): Promise<Map<string, Course>> {
  const courseRepo = ds.getRepository(Course);
  const timetableRepo = ds.getRepository(TimetableSlot);
  const courseByCode = new Map<string, Course>();
  for (const seed of COURSES) {
    const department = deptByCode.get(seed.deptCode)!;
    let course = await courseRepo.findOne({ where: { code: seed.code } });
    if (!course) {
      course = courseRepo.create({ code: seed.code });
    }
    course.title = seed.title;
    course.departmentId = department.id;
    course.level = seed.level;
    course.semester = seed.semester;
    course.creditUnits = seed.creditUnits;
    course.capacity = seed.capacity;
    course.isActive = true;
    course.lecturerId = LECTURER_COURSE_CODES.includes(seed.code)
      ? lecturer.id
      : (course.lecturerId ?? null);
    course = await courseRepo.save(course);
    courseByCode.set(seed.code, course);
  }
  for (const seed of COURSES) {
    if (!seed.prerequisite) continue;
    const course = courseByCode.get(seed.code)!;
    const prerequisite = courseByCode.get(seed.prerequisite)!;
    const loaded = await courseRepo.findOne({
      where: { id: course.id },
      relations: ['prerequisites'],
    });
    if (!loaded) continue;
    const already = loaded.prerequisites.some((p) => p.id === prerequisite.id);
    if (!already) {
      loaded.prerequisites = [...loaded.prerequisites, prerequisite];
      await courseRepo.save(loaded);
    }
  }
  for (const seed of COURSES) {
    const course = courseByCode.get(seed.code)!;
    const existingCount = await timetableRepo.count({
      where: { courseId: course.id },
    });
    if (existingCount > 0) continue;
    await timetableRepo.save(
      seed.slots.map((slot) =>
        timetableRepo.create({
          courseId: course.id,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          venue: slot.venue,
        }),
      ),
    );
  }
  return courseByCode;
}
interface SeededStudent {
  user: User;
  profile: StudentProfile;
  deptCode: string;
  level: number;
}
async function seedStudents(
  ds: DataSource,
  rolesByName: Map<string, Role>,
  deptByCode: Map<string, Department>,
  adviser: User,
  passwordHash: string,
): Promise<SeededStudent[]> {
  const userRepo = ds.getRepository(User);
  const studentProfileRepo = ds.getRepository(StudentProfile);
  const studentRole = rolesByName.get('student')!;
  const seeds = buildStudentSeeds();
  const seqByDept = new Map<string, number>();
  const students: SeededStudent[] = [];
  for (const seed of seeds) {
    const seq = (seqByDept.get(seed.deptCode) ?? 0) + 1;
    seqByDept.set(seed.deptCode, seq);
    const matricNo = `${seed.deptCode}/${intakeShortYear(seed.level)}/${String(seq).padStart(3, '0')}`;
    const email =
      `${seed.firstName}.${seed.lastName}.${seed.deptCode.toLowerCase()}${seq}@ulcrs.edu.ng`.toLowerCase();
    const department = deptByCode.get(seed.deptCode)!;
    let user = await userRepo.findOne({ where: { email } });
    if (!user) {
      user = userRepo.create({
        email,
        firstName: seed.firstName,
        lastName: seed.lastName,
        passwordHash,
        roles: [studentRole],
        isActive: true,
      });
      user = await userRepo.save(user);
    }
    let profile = await studentProfileRepo.findOne({
      where: { userId: user.id },
    });
    if (!profile) {
      profile = studentProfileRepo.create({ userId: user.id });
    }
    profile.matricNo = matricNo;
    profile.departmentId = department.id;
    profile.level = seed.level;
    profile.programme = PROGRAMME_BY_DEPT[seed.deptCode];
    profile.gender = seed.gender;
    profile.adviserId = adviser.id;
    profile = await studentProfileRepo.save(profile);
    students.push({
      user,
      profile,
      deptCode: seed.deptCode,
      level: seed.level,
    });
  }
  return students;
}
async function seedCourseResults(
  ds: DataSource,
  students: SeededStudent[],
  coursesByCode: Map<string, Course>,
  priorSession: AcademicSession,
): Promise<void> {
  const courseResultRepo = ds.getRepository(CourseResult);
  const coursesByDept = new Map<string, Course[]>();
  for (const course of coursesByCode.values()) {
    const list = coursesByDept.get(course.departmentId) ?? [];
    list.push(course);
    coursesByDept.set(course.departmentId, list);
  }
  const csc200Students = students.filter(
    (s) => s.deptCode === 'CSC' && s.level === 200,
  );
  const missingPrereqStudentId = csc200Students[0]?.user.id;
  const failedPrereqStudentId = csc200Students[1]?.user.id;
  let seedCounter = 0;
  for (const student of students) {
    const deptCourses = coursesByDept.get(student.profile.departmentId) ?? [];
    const priorCourses = deptCourses.filter((c) => c.level < student.level);
    for (const course of priorCourses) {
      seedCounter += 1;
      if (
        student.user.id === missingPrereqStudentId &&
        course.code === 'CSC102'
      ) {
        continue;
      }
      let score = pseudoScore(seedCounter);
      if (
        student.user.id === failedPrereqStudentId &&
        course.code === 'CSC102'
      ) {
        score = 32;
      }
      const existing = await courseResultRepo.findOne({
        where: {
          studentId: student.user.id,
          courseId: course.id,
          sessionId: priorSession.id,
        },
      });
      if (existing) continue;
      await courseResultRepo.save(
        courseResultRepo.create({
          studentId: student.user.id,
          courseId: course.id,
          sessionId: priorSession.id,
          score,
          grade: gradeFor(score),
        }),
      );
    }
  }
}
async function seedFeeClearances(
  ds: DataSource,
  students: SeededStudent[],
  currentSession: AcademicSession,
  clearedBy: User,
): Promise<void> {
  const clearanceRepo = ds.getRepository(FeeClearance);
  for (const [index, student] of students.entries()) {
    const bucket = index % 3;
    if (bucket === 0) continue;
    let clearance = await clearanceRepo.findOne({
      where: { studentId: student.user.id, sessionId: currentSession.id },
    });
    if (!clearance) {
      clearance = clearanceRepo.create({
        studentId: student.user.id,
        sessionId: currentSession.id,
      });
    }
    if (bucket === 1) {
      clearance.cleared = false;
      clearance.clearedBy = null;
      clearance.clearedAt = null;
    } else {
      clearance.cleared = true;
      clearance.clearedBy = clearedBy.id;
      clearance.clearedAt = new Date();
    }
    await clearanceRepo.save(clearance);
  }
}
async function run(): Promise<void> {
  const ds = await AppDataSource.initialize();
  const rolesByName = await seedPermissionsRolesAndAdmin(ds);
  await seedSettings(ds);
  const deptByCode = await seedAcademics(ds);
  const { currentSession, priorSession } = await seedCalendar(ds);
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const staff = await seedStaff(ds, rolesByName, deptByCode, passwordHash);
  const coursesByCode = await seedCourses(ds, deptByCode, staff.lecturer);
  const students = await seedStudents(
    ds,
    rolesByName,
    deptByCode,
    staff.adviser,
    passwordHash,
  );
  await seedCourseResults(ds, students, coursesByCode, priorSession);
  await seedFeeClearances(ds, students, currentSession, staff.bursary);
  console.log(
    `Seed complete: ${deptByCode.size} departments, ${coursesByCode.size} courses, ${students.length} students. Shared demo password: "${SEED_PASSWORD}".`,
  );
  await ds.destroy();
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
