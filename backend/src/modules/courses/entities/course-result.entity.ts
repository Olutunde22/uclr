import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';
import { AcademicSession } from '../../calendar/entities/academic-session.entity';
@Entity({ name: 'course_results' })
@Index(['studentId', 'courseId', 'sessionId'], { unique: true })
export class CourseResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'student_id' })
  studentId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;
  @Column({ name: 'course_id' })
  courseId: string;
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @Column({ name: 'session_id' })
  sessionId: string;
  @ManyToOne(() => AcademicSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;
  @Column({ type: 'numeric' })
  score: number;
  @Column({ type: 'varchar' })
  grade: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
