import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { TimetableSlot } from './entities/timetable-slot.entity';
import { Department } from '../academics/entities/department.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { StudentProfile } from '../users/entities/student-profile.entity';
import { UsersService } from '../users/users.service';
import { sanitizeUser } from '../../common/sanitize-user';
import { AuthenticatedUser } from '../../common/types';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ListCoursesQueryDto } from './dto/list-courses-query.dto';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { UpdateTimetableSlotDto } from './dto/update-timetable-slot.dto';
const FK_VIOLATION = '23503';
export interface ClassListRow {
  studentId: string;
  matricNo: string;
  name: string;
  level: number;
  programme: string;
  department: string;
  registrationStatus: string;
}
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(TimetableSlot)
    private readonly timetableSlots: Repository<TimetableSlot>,
    @InjectRepository(Department)
    private readonly departments: Repository<Department>,
    @InjectRepository(Registration)
    private readonly registrations: Repository<Registration>,
    @InjectRepository(StudentProfile)
    private readonly studentProfiles: Repository<StudentProfile>,
    private readonly usersService: UsersService,
  ) {}
  private isSystemAdmin(user: AuthenticatedUser): boolean {
    return user.roles.includes('system_admin');
  }
  private async assertHodOfDepartment(
    user: AuthenticatedUser,
    departmentId: string,
  ): Promise<void> {
    if (this.isSystemAdmin(user)) return;
    const department = await this.departments.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');
    if (department.hodId !== user.id) {
      throw new ForbiddenException(
        'You are not the HOD of this course’s department',
      );
    }
  }
  private assertOwnCourse(user: AuthenticatedUser, course: Course): void {
    if (course.lecturerId !== user.id) {
      throw new ForbiddenException('You are not the lecturer for this course');
    }
  }
  private async getCourseOrThrow(
    id: string,
    relations: string[] = [],
  ): Promise<Course> {
    const course = await this.courses.findOne({ where: { id }, relations });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
  private sanitizeCourse(course: Course): Course {
    return course.lecturer
      ? { ...course, lecturer: sanitizeUser(course.lecturer) }
      : course;
  }
  async list(query: ListCoursesQueryDto): Promise<Course[]> {
    const where: Record<string, unknown> = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.level) where.level = query.level;
    if (query.semester) where.semester = query.semester;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    const rows = await this.courses.find({
      where,
      relations: ['department', 'lecturer'],
      order: { code: 'ASC' },
    });
    return rows.map((c) => this.sanitizeCourse(c));
  }
  async findOne(id: string): Promise<Course> {
    const course = await this.getCourseOrThrow(id, [
      'department',
      'lecturer',
      'prerequisites',
      'timetableSlots',
    ]);
    return this.sanitizeCourse(course);
  }
  async create(user: AuthenticatedUser, dto: CreateCourseDto): Promise<Course> {
    const department = await this.departments.findOne({
      where: { id: dto.departmentId },
    });
    if (!department) throw new BadRequestException('Department not found');
    await this.assertHodOfDepartment(user, dto.departmentId);
    if (dto.lecturerId) {
      await this.assertLecturerRole(dto.lecturerId);
    }
    const course = this.courses.create({
      departmentId: dto.departmentId,
      code: dto.code,
      title: dto.title,
      creditUnits: dto.creditUnits,
      level: dto.level,
      semester: dto.semester,
      capacity: dto.capacity,
      lecturerId: dto.lecturerId ?? null,
      isActive: true,
    });
    try {
      const saved = await this.courses.save(course);
      return this.findOne(saved.id);
    } catch (err) {
      throw this.mapUniqueError(err, 'A course with this code already exists');
    }
  }
  async update(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.getCourseOrThrow(id);
    await this.assertHodOfDepartment(user, course.departmentId);
    if (dto.departmentId && dto.departmentId !== course.departmentId) {
      const department = await this.departments.findOne({
        where: { id: dto.departmentId },
      });
      if (!department) throw new BadRequestException('Department not found');
      await this.assertHodOfDepartment(user, dto.departmentId);
      course.departmentId = dto.departmentId;
    }
    if (dto.code !== undefined) course.code = dto.code;
    if (dto.title !== undefined) course.title = dto.title;
    if (dto.creditUnits !== undefined) course.creditUnits = dto.creditUnits;
    if (dto.level !== undefined) course.level = dto.level;
    if (dto.semester !== undefined) course.semester = dto.semester;
    if (dto.capacity !== undefined) course.capacity = dto.capacity;
    if (dto.isActive !== undefined) course.isActive = dto.isActive;
    if (dto.lecturerId !== undefined) {
      if (dto.lecturerId) await this.assertLecturerRole(dto.lecturerId);
      course.lecturerId = dto.lecturerId;
    }
    try {
      await this.courses.save(course);
      return this.findOne(id);
    } catch (err) {
      throw this.mapUniqueError(err, 'A course with this code already exists');
    }
  }
  async assignLecturer(
    user: AuthenticatedUser,
    id: string,
    lecturerUserId: string,
  ): Promise<Course> {
    const course = await this.getCourseOrThrow(id);
    await this.assertHodOfDepartment(user, course.departmentId);
    await this.assertLecturerRole(lecturerUserId);
    course.lecturerId = lecturerUserId;
    await this.courses.save(course);
    return this.findOne(id);
  }
  async clearLecturer(user: AuthenticatedUser, id: string): Promise<Course> {
    const course = await this.getCourseOrThrow(id);
    await this.assertHodOfDepartment(user, course.departmentId);
    course.lecturerId = null;
    await this.courses.save(course);
    return this.findOne(id);
  }
  private async assertLecturerRole(userId: string): Promise<void> {
    const candidate = await this.usersService.findById(userId);
    if (!candidate) throw new BadRequestException('User not found');
    if (!this.usersService.hasRole(candidate, 'lecturer')) {
      throw new BadRequestException(
        'The target user must hold the "lecturer" role before being assigned',
      );
    }
  }
  async addPrerequisite(
    user: AuthenticatedUser,
    courseId: string,
    prerequisiteId: string,
  ): Promise<Course> {
    if (courseId === prerequisiteId) {
      throw new BadRequestException('A course cannot be its own prerequisite');
    }
    const course = await this.getCourseOrThrow(courseId, ['prerequisites']);
    await this.assertHodOfDepartment(user, course.departmentId);
    const prerequisite = await this.getCourseOrThrow(prerequisiteId);
    const already = course.prerequisites.some((p) => p.id === prerequisite.id);
    if (!already) {
      course.prerequisites.push(prerequisite);
      await this.courses.save(course);
    }
    return this.findOne(courseId);
  }
  async removePrerequisite(
    user: AuthenticatedUser,
    courseId: string,
    prerequisiteId: string,
  ): Promise<Course> {
    const course = await this.getCourseOrThrow(courseId, ['prerequisites']);
    await this.assertHodOfDepartment(user, course.departmentId);
    course.prerequisites = course.prerequisites.filter(
      (p) => p.id !== prerequisiteId,
    );
    await this.courses.save(course);
    return this.findOne(courseId);
  }
  async listMine(user: AuthenticatedUser): Promise<Course[]> {
    const rows = await this.courses.find({
      where: { lecturerId: user.id },
      relations: ['department', 'lecturer'],
      order: { code: 'ASC' },
    });
    return rows.map((c) => this.sanitizeCourse(c));
  }
  async updateOwnCapacity(
    user: AuthenticatedUser,
    courseId: string,
    capacity: number,
  ): Promise<Course> {
    const course = await this.getCourseOrThrow(courseId);
    this.assertOwnCourse(user, course);
    course.capacity = capacity;
    await this.courses.save(course);
    return this.findOne(courseId);
  }
  async addOwnPrerequisite(
    user: AuthenticatedUser,
    courseId: string,
    prerequisiteId: string,
  ): Promise<Course> {
    if (courseId === prerequisiteId) {
      throw new BadRequestException('A course cannot be its own prerequisite');
    }
    const course = await this.getCourseOrThrow(courseId, ['prerequisites']);
    this.assertOwnCourse(user, course);
    const prerequisite = await this.getCourseOrThrow(prerequisiteId);
    const already = course.prerequisites.some((p) => p.id === prerequisite.id);
    if (!already) {
      course.prerequisites.push(prerequisite);
      await this.courses.save(course);
    }
    return this.findOne(courseId);
  }
  async removeOwnPrerequisite(
    user: AuthenticatedUser,
    courseId: string,
    prerequisiteId: string,
  ): Promise<Course> {
    const course = await this.getCourseOrThrow(courseId, ['prerequisites']);
    this.assertOwnCourse(user, course);
    course.prerequisites = course.prerequisites.filter(
      (p) => p.id !== prerequisiteId,
    );
    await this.courses.save(course);
    return this.findOne(courseId);
  }
  async addTimetableSlot(
    user: AuthenticatedUser,
    courseId: string,
    dto: CreateTimetableSlotDto,
  ): Promise<TimetableSlot> {
    const course = await this.getCourseOrThrow(courseId);
    await this.assertHodOfDepartment(user, course.departmentId);
    this.assertTimeOrder(dto.startTime, dto.endTime);
    const slot = this.timetableSlots.create({
      courseId,
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
      venue: dto.venue,
    });
    return this.timetableSlots.save(slot);
  }
  async updateTimetableSlot(
    user: AuthenticatedUser,
    courseId: string,
    slotId: string,
    dto: UpdateTimetableSlotDto,
  ): Promise<TimetableSlot> {
    const course = await this.getCourseOrThrow(courseId);
    await this.assertHodOfDepartment(user, course.departmentId);
    const slot = await this.timetableSlots.findOne({
      where: { id: slotId, courseId },
    });
    if (!slot) throw new NotFoundException('Timetable slot not found');
    const startTime = dto.startTime ?? slot.startTime;
    const endTime = dto.endTime ?? slot.endTime;
    this.assertTimeOrder(startTime, endTime);
    if (dto.day !== undefined) slot.day = dto.day;
    slot.startTime = startTime;
    slot.endTime = endTime;
    if (dto.venue !== undefined) slot.venue = dto.venue;
    return this.timetableSlots.save(slot);
  }
  async removeTimetableSlot(
    user: AuthenticatedUser,
    courseId: string,
    slotId: string,
  ): Promise<void> {
    const course = await this.getCourseOrThrow(courseId);
    await this.assertHodOfDepartment(user, course.departmentId);
    const result = await this.timetableSlots.delete({ id: slotId, courseId });
    if (result.affected === 0) {
      throw new NotFoundException('Timetable slot not found');
    }
  }
  async classList(
    user: AuthenticatedUser,
    courseId: string,
    semesterId: string,
  ): Promise<ClassListRow[]> {
    const course = await this.getCourseOrThrow(courseId);
    await this.assertCanViewClassList(user, course);
    const registrations = await this.registrations
      .createQueryBuilder('r')
      .innerJoin('r.courses', 'rc')
      .innerJoinAndSelect('r.student', 'student')
      .where('rc.course_id = :courseId', { courseId })
      .andWhere('r.semester_id = :semesterId', { semesterId })
      .andWhere('r.status IN (:...statuses)', {
        statuses: ['approved', 'finalised'],
      })
      .orderBy('student.last_name', 'ASC')
      .getMany();
    const studentIds = registrations.map((r) => r.studentId);
    const profiles = studentIds.length
      ? await this.studentProfiles.find({
          where: studentIds.map((id) => ({ userId: id })),
          relations: ['department'],
        })
      : [];
    const profileByStudent = new Map(profiles.map((p) => [p.userId, p]));
    return registrations.map((r) => {
      const profile = profileByStudent.get(r.studentId);
      return {
        studentId: r.studentId,
        matricNo: profile?.matricNo ?? '',
        name: `${r.student.firstName} ${r.student.lastName}`,
        level: profile?.level ?? 0,
        programme: profile?.programme ?? '',
        department: profile?.department?.name ?? '',
        registrationStatus: r.status,
      };
    });
  }
  private async assertCanViewClassList(
    user: AuthenticatedUser,
    course: Course,
  ): Promise<void> {
    if (this.isSystemAdmin(user)) return;
    if (course.lecturerId === user.id) return;
    await this.assertHodOfDepartment(user, course.departmentId);
  }
  private assertTimeOrder(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }
  private mapUniqueError(err: unknown, message: string): Error {
    if (
      err instanceof QueryFailedError &&
      (
        err as unknown as {
          code?: string;
        }
      ).code === '23505'
    ) {
      return new ConflictException(message);
    }
    if (
      err instanceof QueryFailedError &&
      (
        err as unknown as {
          code?: string;
        }
      ).code === FK_VIOLATION
    ) {
      return new BadRequestException('Referenced row not found');
    }
    return err as Error;
  }
}
