import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from '../registrations/entities/registration.entity';
import { CourseResult } from '../courses/entities/course-result.entity';
import { StudentProfile } from '../users/entities/student-profile.entity';
import {
  RegistrationsService,
  FinaliseSemesterResult,
} from '../registrations/registrations.service';
const GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};
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
  status: string;
  totalUnits: number;
  courses: RecordCourseRow[];
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
@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrations: Repository<Registration>,
    @InjectRepository(CourseResult)
    private readonly courseResults: Repository<CourseResult>,
    @InjectRepository(StudentProfile)
    private readonly studentProfiles: Repository<StudentProfile>,
    private readonly registrationsService: RegistrationsService,
  ) {}
  async finaliseSemester(
    deciderId: string,
    semesterId: string,
  ): Promise<FinaliseSemesterResult> {
    return this.registrationsService.finaliseSemester(deciderId, semesterId);
  }
  async listFinal(
    semesterId: string,
    status?: 'approved' | 'finalised',
  ): Promise<RecordRow[]> {
    const statuses = status ? [status] : ['approved', 'finalised'];
    const rows = await this.registrations
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.courses', 'rc')
      .leftJoinAndSelect('rc.course', 'course')
      .leftJoinAndSelect('r.student', 'student')
      .where('r.semester_id = :semesterId', { semesterId })
      .andWhere('r.status IN (:...statuses)', { statuses })
      .orderBy('student.last_name', 'ASC')
      .getMany();
    const studentIds = rows.map((r) => r.studentId);
    const profiles = studentIds.length
      ? await this.studentProfiles.find({
          where: studentIds.map((id) => ({ userId: id })),
          relations: ['department'],
        })
      : [];
    const profileByStudent = new Map(profiles.map((p) => [p.userId, p]));
    return rows.map((r) => {
      const profile = profileByStudent.get(r.studentId);
      return {
        registrationId: r.id,
        studentId: r.studentId,
        matricNo: profile?.matricNo ?? '',
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        department: profile?.department?.name ?? '',
        level: profile?.level ?? 0,
        programme: profile?.programme ?? '',
        status: r.status,
        totalUnits: r.totalUnits,
        courses: (r.courses ?? []).map((rc) => ({
          courseId: rc.courseId,
          code: rc.course.code,
          title: rc.course.title,
          creditUnits: rc.course.creditUnits,
        })),
      };
    });
  }
  async transcript(studentId: string): Promise<Transcript> {
    const profile = await this.studentProfiles.findOne({
      where: { userId: studentId },
      relations: ['user', 'department'],
    });
    if (!profile) throw new NotFoundException('Student not found');
    const results = await this.courseResults.find({
      where: { studentId },
      relations: ['course', 'session'],
      order: { createdAt: 'ASC' },
    });
    let totalPoints = 0;
    let totalCreditUnits = 0;
    const resultRows: TranscriptResultRow[] = results.map((r) => {
      const gradePoint = GRADE_POINTS[r.grade.toUpperCase()] ?? 0;
      totalPoints += gradePoint * r.course.creditUnits;
      totalCreditUnits += r.course.creditUnits;
      return {
        sessionName: r.session.name,
        courseCode: r.course.code,
        courseTitle: r.course.title,
        creditUnits: r.course.creditUnits,
        score: Number(r.score),
        grade: r.grade,
        gradePoint,
      };
    });
    const gpa = totalCreditUnits > 0 ? totalPoints / totalCreditUnits : 0;
    return {
      student: {
        id: profile.userId,
        matricNo: profile.matricNo,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
        department: profile.department?.name ?? '',
        level: profile.level,
        programme: profile.programme,
      },
      results: resultRows,
      totalCreditUnits,
      gpa: Math.round(gpa * 100) / 100,
    };
  }
}
