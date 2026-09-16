import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
export type Weekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
@Entity({ name: 'timetable_slots' })
export class TimetableSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'course_id' })
  courseId: string;
  @ManyToOne(() => Course, (course) => course.timetableSlots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @Column({ type: 'varchar' })
  day: Weekday;
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;
  @Column()
  venue: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
