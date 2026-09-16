import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationCourse } from '../registrations/entities/registration-course.entity';
import {
  Registration,
  RegistrationStatus,
} from '../registrations/entities/registration.entity';
import { Department } from '../academics/entities/department.entity';
import { User } from '../users/entities/user.entity';
import { AuthenticatedUser } from '../../common/types';
type StatusCounts = Record<RegistrationStatus, number>;
function emptyStatusCounts(): StatusCounts {
  return {
    draft: 0,
    pending_adviser: 0,
    pending_hod: 0,
    approved: 0,
    rejected: 0,
    finalised: 0,
  };
}
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
  totals: StatusCounts & {
    total: number;
  };
}
export interface SystemReport {
  logins: {
    totalUsers: number;
    usersEverLoggedIn: number;
    usersLoggedInLast7Days: number;
    usersLoggedInLast30Days: number;
    byRole: {
      role: string;
      totalUsers: number;
      everLoggedIn: number;
    }[];
  };
  registrations: {
    semesterId: string | null;
    counts: StatusCounts;
    total: number;
  };
}
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(RegistrationCourse)
    private readonly registrationCourses: Repository<RegistrationCourse>,
    @InjectRepository(Registration)
    private readonly registrations: Repository<Registration>,
    @InjectRepository(Department)
    private readonly departments: Repository<Department>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}
  private isSystemAdmin(user: AuthenticatedUser): boolean {
    return user.roles.includes('system_admin');
  }
  async departmentReport(
    user: AuthenticatedUser,
    semesterId: string,
    departmentIdParam?: string,
  ): Promise<DepartmentReport> {
    let departmentId: string;
    if (this.isSystemAdmin(user)) {
      if (!departmentIdParam) {
        throw new NotFoundException(
          'departmentId is required for system_admin',
        );
      }
      departmentId = departmentIdParam;
    } else {
      const department = await this.departments.findOne({
        where: { hodId: user.id },
      });
      if (!department) {
        throw new ForbiddenException('You are not the HOD of any department');
      }
      departmentId = department.id;
    }
    const department = await this.departments.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');
    const raw = await this.registrationCourses
      .createQueryBuilder('rc')
      .innerJoin('rc.course', 'course')
      .innerJoin('rc.registration', 'r')
      .where('course.department_id = :departmentId', { departmentId })
      .andWhere('r.semester_id = :semesterId', { semesterId })
      .select('course.id', 'courseId')
      .addSelect('course.code', 'code')
      .addSelect('course.title', 'title')
      .addSelect('course.level', 'level')
      .addSelect('r.status', 'status')
      .getRawMany<{
        courseId: string;
        code: string;
        title: string;
        level: number;
        status: RegistrationStatus;
      }>();
    const courseById = new Map<string, DepartmentReportCourseRow>();
    const levelMap = new Map<number, DepartmentReportLevelRow>();
    const totals = { ...emptyStatusCounts(), total: 0 };
    for (const row of raw) {
      if (!courseById.has(row.courseId)) {
        courseById.set(row.courseId, {
          courseId: row.courseId,
          code: row.code,
          title: row.title,
          level: row.level,
          counts: emptyStatusCounts(),
          total: 0,
        });
      }
      const courseRow = courseById.get(row.courseId)!;
      courseRow.counts[row.status] += 1;
      courseRow.total += 1;
      if (!levelMap.has(row.level)) {
        levelMap.set(row.level, {
          level: row.level,
          counts: emptyStatusCounts(),
          total: 0,
        });
      }
      const levelRow = levelMap.get(row.level)!;
      levelRow.counts[row.status] += 1;
      levelRow.total += 1;
      totals[row.status] += 1;
      totals.total += 1;
    }
    return {
      departmentId,
      departmentName: department.name,
      semesterId,
      courses: [...courseById.values()].sort((a, b) =>
        a.code.localeCompare(b.code),
      ),
      byLevel: [...levelMap.values()].sort((a, b) => a.level - b.level),
      totals,
    };
  }
  async systemReport(
    user: AuthenticatedUser,
    semesterId?: string,
  ): Promise<SystemReport> {
    if (!this.isSystemAdmin(user)) {
      throw new ForbiddenException('System reports are system_admin only');
    }
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const allUsers = await this.users.find({ relations: ['roles'] });
    const totalUsers = allUsers.length;
    const usersEverLoggedIn = allUsers.filter((u) => u.lastLoginAt).length;
    const usersLoggedInLast7Days = allUsers.filter(
      (u) => u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo,
    ).length;
    const usersLoggedInLast30Days = allUsers.filter(
      (u) => u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo,
    ).length;
    const byRoleMap = new Map<
      string,
      {
        totalUsers: number;
        everLoggedIn: number;
      }
    >();
    for (const u of allUsers) {
      for (const role of u.roles) {
        if (!byRoleMap.has(role.name)) {
          byRoleMap.set(role.name, { totalUsers: 0, everLoggedIn: 0 });
        }
        const entry = byRoleMap.get(role.name)!;
        entry.totalUsers += 1;
        if (u.lastLoginAt) entry.everLoggedIn += 1;
      }
    }
    const registrationWhere: Record<string, unknown> = {};
    if (semesterId) registrationWhere.semesterId = semesterId;
    const registrations = await this.registrations.find({
      where: registrationWhere,
    });
    const counts = emptyStatusCounts();
    for (const r of registrations) counts[r.status] += 1;
    return {
      logins: {
        totalUsers,
        usersEverLoggedIn,
        usersLoggedInLast7Days,
        usersLoggedInLast30Days,
        byRole: [...byRoleMap.entries()].map(([role, v]) => ({
          role,
          ...v,
        })),
      },
      registrations: {
        semesterId: semesterId ?? null,
        counts,
        total: registrations.length,
      },
    };
  }
}
