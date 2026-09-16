import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  RegistrationRuleContext,
  RegistrationRuleMode,
  RegistrationRulesService,
  RuleCourse,
  RuleResult,
} from './registration-rules.service';
import { Registration } from './entities/registration.entity';
import { RegistrationCourse } from './entities/registration-course.entity';
import { Approval, ApprovalDecisionStatus } from './entities/approval.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseResult } from '../courses/entities/course-result.entity';
import { Semester } from '../calendar/entities/semester.entity';
import { FeeClearance } from '../fees/entities/fee-clearance.entity';
import { StudentProfile } from '../users/entities/student-profile.entity';
import { Department } from '../academics/entities/department.entity';
import { SettingsService } from '../settings/settings.service';
import { RegistryRecord } from '../records/entities/registry-record.entity';
import { AuthenticatedUser } from '../../common/types';
import { sanitizeUser } from '../../common/sanitize-user';
const DEFAULT_MIN_CREDIT_UNITS = 15;
const DEFAULT_MAX_CREDIT_UNITS = 24;
const DEFAULT_PASS_MARK = 40;
export interface SubmitOutcome {
  valid: boolean;
  violations: RuleResult['violations'];
  registration?: Registration;
}
export interface FinaliseSemesterOutstandingItem {
  registrationId: string;
  studentId: string;
  status: Registration['status'];
}
export interface FinaliseSemesterResult {
  semesterId: string;
  lockedAt: Date;
  finalisedCount: number;
  finalisedRegistrationIds: string[];
  outstandingCount: number;
  outstanding: FinaliseSemesterOutstandingItem[];
}
@Injectable()
export class RegistrationsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Registration)
    private readonly registrations: Repository<Registration>,
    @InjectRepository(RegistrationCourse)
    private readonly registrationCourses: Repository<RegistrationCourse>,
    @InjectRepository(Approval)
    private readonly approvals: Repository<Approval>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(CourseResult)
    private readonly courseResults: Repository<CourseResult>,
    @InjectRepository(Semester)
    private readonly semesters: Repository<Semester>,
    @InjectRepository(FeeClearance)
    private readonly feeClearances: Repository<FeeClearance>,
    @InjectRepository(StudentProfile)
    private readonly studentProfiles: Repository<StudentProfile>,
    @InjectRepository(Department)
    private readonly departments: Repository<Department>,
    @InjectRepository(RegistryRecord)
    private readonly registryRecords: Repository<RegistryRecord>,
    private readonly rulesService: RegistrationRulesService,
    private readonly settingsService: SettingsService,
  ) {}
  private isSystemAdmin(user: AuthenticatedUser): boolean {
    return user.roles.includes('system_admin');
  }
  // Registration.student and Approval.adviser/hod are loaded as full User
  // entities (createQueryBuilder joins, not the sanitizeUser-wrapped path
  // users.service.ts's own reads go through) — strip passwordHash before any
  // of these cross the controller boundary. Found live during milestone 12
  // verification: the adviser/HOD queues and registrations/me were leaking
  // the bcrypt hash on every embedded student/adviser/hod.
  private sanitizeRegistration(registration: Registration): Registration {
    if (registration.student) {
      registration.student = sanitizeUser(registration.student);
    }
    if (registration.approval) {
      if (registration.approval.adviser) {
        registration.approval.adviser = sanitizeUser(
          registration.approval.adviser,
        );
      }
      if (registration.approval.hod) {
        registration.approval.hod = sanitizeUser(registration.approval.hod);
      }
    }
    return registration;
  }
  private async loadSettings(): Promise<{
    minCreditUnits: number;
    maxCreditUnits: number;
    passMark: number;
  }> {
    const [min, max, pass] = await Promise.all([
      this.settingsService.get('min_credit_units'),
      this.settingsService.get('max_credit_units'),
      this.settingsService.get('pass_mark'),
    ]);
    return {
      minCreditUnits: min ? Number(min) : DEFAULT_MIN_CREDIT_UNITS,
      maxCreditUnits: max ? Number(max) : DEFAULT_MAX_CREDIT_UNITS,
      passMark: pass ? Number(pass) : DEFAULT_PASS_MARK,
    };
  }
  private async loadContext(
    manager: EntityManager,
    studentId: string,
    semesterId: string,
    courseIds: string[],
    mode: RegistrationRuleMode,
    excludeRegistrationId?: string,
  ): Promise<RegistrationRuleContext> {
    const semester = await manager
      .getRepository(Semester)
      .findOne({ where: { id: semesterId }, relations: ['session'] });
    if (!semester) throw new NotFoundException('Semester not found');
    const feeClearance = await manager.getRepository(FeeClearance).findOne({
      where: { studentId, sessionId: semester.sessionId, cleared: true },
    });
    const uniqueIds = [...new Set(courseIds)];
    const courseRows = uniqueIds.length
      ? await manager.getRepository(Course).find({
          where: uniqueIds.map((id) => ({ id })),
          relations: ['prerequisites', 'timetableSlots'],
        })
      : [];
    const courseById = new Map(courseRows.map((c) => [c.id, c]));
    const missing = uniqueIds.filter((id) => !courseById.has(id));
    if (missing.length) {
      throw new BadRequestException(
        `Unknown course id(s): ${missing.join(', ')}`,
      );
    }
    const seatsTakenByCourse = await this.countSeatsTaken(
      manager,
      uniqueIds,
      semesterId,
      excludeRegistrationId,
    );
    const selectedCourses: RuleCourse[] = courseIds.map((id) => {
      const course = courseById.get(id)!;
      return {
        id: course.id,
        code: course.code,
        isActive: course.isActive,
        semester: course.semester,
        creditUnits: course.creditUnits,
        capacity: course.capacity,
        prerequisiteIds: (course.prerequisites ?? []).map((p) => p.id),
        timetableSlots: (course.timetableSlots ?? []).map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        seatsTaken: seatsTakenByCourse.get(course.id) ?? 0,
      };
    });
    const results = await manager
      .getRepository(CourseResult)
      .find({ where: { studentId } });
    const settings = await this.loadSettings();
    return {
      now: new Date(),
      mode,
      semester: {
        name: semester.name,
        registrationOpensAt: semester.registrationOpensAt ?? null,
        registrationClosesAt: semester.registrationClosesAt ?? null,
        addDropClosesAt: semester.addDropClosesAt ?? null,
        lockedAt: semester.lockedAt ?? null,
      },
      feeCleared: !!feeClearance,
      selectedCourses,
      courseResults: results.map((r) => ({
        courseId: r.courseId,
        score: Number(r.score),
      })),
      settings,
    };
  }
  private async countSeatsTaken(
    manager: EntityManager,
    courseIds: string[],
    semesterId: string,
    excludeRegistrationId?: string,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (!courseIds.length) return result;
    const qb = manager
      .createQueryBuilder(RegistrationCourse, 'rc')
      .innerJoin(Registration, 'r', 'r.id = rc.registration_id')
      .where('rc.course_id IN (:...courseIds)', { courseIds })
      .andWhere('r.semester_id = :semesterId', { semesterId })
      .andWhere('r.status IN (:...countedStatuses)', {
        countedStatuses: [
          'pending_adviser',
          'pending_hod',
          'approved',
          'finalised',
        ],
      });
    if (excludeRegistrationId) {
      qb.andWhere('r.id != :excludeId', { excludeId: excludeRegistrationId });
    }
    const rows = await qb
      .select('rc.course_id', 'courseId')
      .addSelect('COUNT(DISTINCT r.id)', 'count')
      .groupBy('rc.course_id')
      .getRawMany<{
        courseId: string;
        count: string;
      }>();
    for (const row of rows) {
      result.set(row.courseId, Number(row.count));
    }
    return result;
  }
  async saveDraft(
    studentId: string,
    semesterId: string,
    courseIds: string[],
  ): Promise<Registration> {
    return this.dataSource.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(Registration);
      let registration = await registrationRepo.findOne({
        where: { studentId, semesterId },
      });
      if (
        registration &&
        !['draft', 'rejected'].includes(registration.status)
      ) {
        throw new BadRequestException(
          `Cannot edit a registration with status "${registration.status}"`,
        );
      }
      if (!registration) {
        registration = registrationRepo.create({
          studentId,
          semesterId,
          status: 'draft',
        });
        registration = await registrationRepo.save(registration);
      }
      const rcRepo = manager.getRepository(RegistrationCourse);
      await rcRepo.delete({ registrationId: registration.id });
      const uniqueIds = [...new Set(courseIds)];
      if (uniqueIds.length) {
        await rcRepo.save(
          uniqueIds.map((courseId) =>
            rcRepo.create({ registrationId: registration!.id, courseId }),
          ),
        );
      }
      return this.findByIdOrThrow(registration.id, manager);
    });
  }
  async validate(
    studentId: string,
    semesterId: string,
    courseIds: string[],
  ): Promise<RuleResult> {
    const existing = await this.registrations.findOne({
      where: { studentId, semesterId },
    });
    const context = await this.loadContext(
      this.dataSource.manager,
      studentId,
      semesterId,
      courseIds,
      'submit',
      existing?.id,
    );
    return this.rulesService.evaluate(context);
  }
  async submit(studentId: string, semesterId: string): Promise<SubmitOutcome> {
    return this.dataSource.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(Registration);
      const registration = await registrationRepo.findOne({
        where: { studentId, semesterId },
        relations: ['courses'],
      });
      if (!registration) {
        throw new NotFoundException(
          'No draft registration found for this semester. Save a draft first.',
        );
      }
      if (!['draft', 'rejected'].includes(registration.status)) {
        throw new BadRequestException(
          `Cannot submit a registration with status "${registration.status}"`,
        );
      }
      const courseIds = registration.courses.map((rc) => rc.courseId);
      if (!courseIds.length) {
        throw new BadRequestException(
          'Add at least one course before submitting',
        );
      }
      const uniqueIds = [...new Set(courseIds)];
      await manager
        .createQueryBuilder(Course, 'course')
        .setLock('pessimistic_write')
        .whereInIds(uniqueIds)
        .getMany();
      const context = await this.loadContext(
        manager,
        studentId,
        semesterId,
        courseIds,
        'submit',
        registration.id,
      );
      const result = this.rulesService.evaluate(context);
      if (!result.valid) {
        return { valid: false, violations: result.violations };
      }
      const studentProfile = await manager
        .getRepository(StudentProfile)
        .findOne({ where: { userId: studentId } });
      if (!studentProfile?.adviserId) {
        throw new BadRequestException(
          'You have no assigned academic adviser; contact your department',
        );
      }
      const totalUnits = [...new Set(courseIds)]
        .map((id) => context.selectedCourses.find((c) => c.id === id)!)
        .reduce((sum, c) => sum + c.creditUnits, 0);
      registration.status = 'pending_adviser';
      registration.submittedAt = new Date();
      registration.totalUnits = totalUnits;
      await registrationRepo.save(registration);
      const approvalRepo = manager.getRepository(Approval);
      let approval = await approvalRepo.findOne({
        where: { registrationId: registration.id },
      });
      if (!approval) {
        approval = approvalRepo.create({ registrationId: registration.id });
      }
      approval.adviserId = studentProfile.adviserId;
      approval.adviserStatus = 'pending';
      approval.adviserComment = null;
      approval.adviserDecidedAt = null;
      approval.hodId = null;
      approval.hodStatus = 'pending';
      approval.hodComment = null;
      approval.hodDecidedAt = null;
      await approvalRepo.save(approval);
      const saved = await this.findByIdOrThrow(registration.id, manager);
      return { valid: true, violations: [], registration: saved };
    });
  }
  async addDrop(
    studentId: string,
    semesterId: string,
    courseIds: string[],
  ): Promise<SubmitOutcome> {
    return this.dataSource.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(Registration);
      const registration = await registrationRepo.findOne({
        where: { studentId, semesterId },
      });
      if (!registration) {
        throw new NotFoundException('No registration found for this semester');
      }
      if (registration.status !== 'approved') {
        throw new BadRequestException(
          'Add/drop is only allowed on an approved registration',
        );
      }
      if (!courseIds.length) {
        throw new BadRequestException('Select at least one course');
      }
      const uniqueIds = [...new Set(courseIds)];
      await manager
        .createQueryBuilder(Course, 'course')
        .setLock('pessimistic_write')
        .whereInIds(uniqueIds)
        .getMany();
      const context = await this.loadContext(
        manager,
        studentId,
        semesterId,
        courseIds,
        'add_drop',
        registration.id,
      );
      const result = this.rulesService.evaluate(context);
      if (!result.valid) {
        return { valid: false, violations: result.violations };
      }
      const rcRepo = manager.getRepository(RegistrationCourse);
      await rcRepo.delete({ registrationId: registration.id });
      await rcRepo.save(
        uniqueIds.map((courseId) =>
          rcRepo.create({ registrationId: registration.id, courseId }),
        ),
      );
      const totalUnits = uniqueIds
        .map((id) => context.selectedCourses.find((c) => c.id === id)!)
        .reduce((sum, c) => sum + c.creditUnits, 0);
      registration.status = 'pending_adviser';
      registration.totalUnits = totalUnits;
      await registrationRepo.save(registration);
      const approvalRepo = manager.getRepository(Approval);
      const approval = await approvalRepo.findOne({
        where: { registrationId: registration.id },
      });
      if (!approval) {
        throw new BadRequestException(
          'Registration has no approval record to reset',
        );
      }
      approval.adviserStatus = 'pending';
      approval.adviserComment = null;
      approval.adviserDecidedAt = null;
      approval.hodId = null;
      approval.hodStatus = 'pending';
      approval.hodComment = null;
      approval.hodDecidedAt = null;
      await approvalRepo.save(approval);
      const saved = await this.findByIdOrThrow(registration.id, manager);
      return { valid: true, violations: [], registration: saved };
    });
  }
  async adviserDecide(
    decider: AuthenticatedUser,
    registrationId: string,
    decision: 'approved' | 'rejected',
    comment?: string,
  ): Promise<Registration> {
    return this.dataSource.transaction(async (manager) => {
      const registration = await manager
        .getRepository(Registration)
        .findOne({ where: { id: registrationId } });
      if (!registration) throw new NotFoundException('Registration not found');
      if (registration.status !== 'pending_adviser') {
        throw new BadRequestException(
          `Cannot record an adviser decision on a registration with status "${registration.status}"`,
        );
      }
      if (!this.isSystemAdmin(decider)) {
        const profile = await manager
          .getRepository(StudentProfile)
          .findOne({ where: { userId: registration.studentId } });
        if (profile?.adviserId !== decider.id) {
          throw new ForbiddenException(
            'You are not the academic adviser for this student',
          );
        }
      }
      const approvalRepo = manager.getRepository(Approval);
      const approval = await approvalRepo.findOne({
        where: { registrationId },
      });
      if (!approval) {
        throw new NotFoundException('No approval record for this registration');
      }
      approval.adviserStatus = decision as ApprovalDecisionStatus;
      approval.adviserComment = comment ?? null;
      approval.adviserDecidedAt = new Date();
      await approvalRepo.save(approval);
      registration.status =
        decision === 'approved' ? 'pending_hod' : 'rejected';
      await manager.getRepository(Registration).save(registration);
      return this.findByIdOrThrow(registrationId, manager);
    });
  }
  async hodDecide(
    decider: AuthenticatedUser,
    registrationId: string,
    decision: 'approved' | 'rejected',
    comment?: string,
  ): Promise<Registration> {
    return this.dataSource.transaction(async (manager) => {
      const registration = await manager
        .getRepository(Registration)
        .findOne({ where: { id: registrationId } });
      if (!registration) throw new NotFoundException('Registration not found');
      if (registration.status !== 'pending_hod') {
        throw new BadRequestException(
          `Cannot record a HOD decision on a registration with status "${registration.status}"`,
        );
      }
      if (!this.isSystemAdmin(decider)) {
        const profile = await manager
          .getRepository(StudentProfile)
          .findOne({ where: { userId: registration.studentId } });
        if (!profile) {
          throw new NotFoundException('Student profile not found');
        }
        const department = await manager
          .getRepository(Department)
          .findOne({ where: { id: profile.departmentId } });
        if (department?.hodId !== decider.id) {
          throw new ForbiddenException(
            "You are not the HOD of this student's department",
          );
        }
      }
      const approvalRepo = manager.getRepository(Approval);
      const approval = await approvalRepo.findOne({
        where: { registrationId },
      });
      if (!approval) {
        throw new NotFoundException('No approval record for this registration');
      }
      approval.hodId = decider.id;
      approval.hodStatus = decision as ApprovalDecisionStatus;
      approval.hodComment = comment ?? null;
      approval.hodDecidedAt = new Date();
      await approvalRepo.save(approval);
      registration.status = decision === 'approved' ? 'approved' : 'rejected';
      await manager.getRepository(Registration).save(registration);
      return this.findByIdOrThrow(registrationId, manager);
    });
  }
  async finaliseSemester(
    deciderId: string,
    semesterId: string,
  ): Promise<FinaliseSemesterResult> {
    return this.dataSource.transaction(async (manager) => {
      const semesterRepo = manager.getRepository(Semester);
      const semester = await semesterRepo.findOne({
        where: { id: semesterId },
      });
      if (!semester) throw new NotFoundException('Semester not found');
      if (semester.lockedAt) {
        throw new BadRequestException(
          'This semester has already been finalised and locked',
        );
      }
      const registrationRepo = manager.getRepository(Registration);
      const registrations = await registrationRepo.find({
        where: { semesterId },
      });
      const approved = registrations.filter((r) => r.status === 'approved');
      const outstanding = registrations.filter((r) =>
        ['draft', 'pending_adviser', 'pending_hod', 'rejected'].includes(
          r.status,
        ),
      );
      const now = new Date();
      for (const registration of approved) {
        registration.status = 'finalised';
      }
      if (approved.length) {
        await registrationRepo.save(approved);
      }
      const registryRecordRepo = manager.getRepository(RegistryRecord);
      if (approved.length) {
        await registryRecordRepo.save(
          approved.map((registration) =>
            registryRecordRepo.create({
              registrationId: registration.id,
              recordedBy: deciderId,
              recordedAt: now,
            }),
          ),
        );
      }
      semester.lockedAt = now;
      await semesterRepo.save(semester);
      return {
        semesterId,
        lockedAt: now,
        finalisedCount: approved.length,
        finalisedRegistrationIds: approved.map((r) => r.id),
        outstandingCount: outstanding.length,
        outstanding: outstanding.map((r) => ({
          registrationId: r.id,
          studentId: r.studentId,
          status: r.status,
        })),
      };
    });
  }
  async adviserQueue(adviserId: string): Promise<Registration[]> {
    const rows = await this.registrations
      .createQueryBuilder('r')
      .innerJoin(Approval, 'a', 'a.registration_id = r.id')
      .leftJoinAndSelect('r.courses', 'courses')
      .leftJoinAndSelect('courses.course', 'course')
      .leftJoinAndSelect('r.student', 'student')
      .leftJoinAndSelect('r.approval', 'approval')
      .where('r.status = :status', { status: 'pending_adviser' })
      .andWhere('a.adviser_id = :adviserId', { adviserId })
      .orderBy('r.submitted_at', 'ASC')
      .getMany();
    return rows.map((r) => this.sanitizeRegistration(r));
  }
  async hodQueue(hodId: string): Promise<Registration[]> {
    const department = await this.departments.findOne({
      where: { hodId },
    });
    if (!department) return [];
    const rows = await this.registrations
      .createQueryBuilder('r')
      .innerJoin(StudentProfile, 'sp', 'sp.user_id = r.student_id')
      .leftJoinAndSelect('r.courses', 'courses')
      .leftJoinAndSelect('courses.course', 'course')
      .leftJoinAndSelect('r.student', 'student')
      .leftJoinAndSelect('r.approval', 'approval')
      .where('r.status = :status', { status: 'pending_hod' })
      .andWhere('sp.department_id = :departmentId', {
        departmentId: department.id,
      })
      .orderBy('r.submitted_at', 'ASC')
      .getMany();
    return rows.map((r) => this.sanitizeRegistration(r));
  }
  async getOwn(
    studentId: string,
    semesterId?: string,
  ): Promise<Registration | null> {
    let resolvedSemesterId = semesterId;
    if (!resolvedSemesterId) {
      const current = await this.semesters.findOne({
        where: { isCurrent: true },
      });
      if (!current) return null;
      resolvedSemesterId = current.id;
    }
    const registration = await this.registrations.findOne({
      where: { studentId, semesterId: resolvedSemesterId },
      relations: [
        'courses',
        'courses.course',
        'approval',
        'approval.adviser',
        'approval.hod',
        'semester',
        'semester.session',
      ],
    });
    return registration ? this.sanitizeRegistration(registration) : null;
  }
  private async findByIdOrThrow(
    id: string,
    manager: EntityManager,
  ): Promise<Registration> {
    const registration = await manager.getRepository(Registration).findOne({
      where: { id },
      relations: [
        'courses',
        'courses.course',
        'approval',
        'approval.adviser',
        'approval.hod',
        'student',
      ],
    });
    if (!registration) throw new NotFoundException('Registration not found');
    return this.sanitizeRegistration(registration);
  }
}
