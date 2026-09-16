import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Registration } from './registration.entity';
import { Course } from '../../courses/entities/course.entity';
@Entity({ name: 'registration_courses' })
@Index(['registrationId', 'courseId'], { unique: true })
export class RegistrationCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'registration_id' })
  registrationId: string;
  @ManyToOne(() => Registration, (registration) => registration.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registration_id' })
  registration: Registration;
  @Column({ name: 'course_id' })
  courseId: string;
  @ManyToOne(() => Course, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
