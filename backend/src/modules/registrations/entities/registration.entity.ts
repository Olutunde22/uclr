import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Semester } from '../../calendar/entities/semester.entity';
import { RegistrationCourse } from './registration-course.entity';
import { Approval } from './approval.entity';
export type RegistrationStatus =
  | 'draft'
  | 'pending_adviser'
  | 'pending_hod'
  | 'approved'
  | 'rejected'
  | 'finalised';
@Entity({ name: 'registrations' })
@Index(['studentId', 'semesterId'], { unique: true })
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'student_id' })
  studentId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;
  @Column({ name: 'semester_id' })
  semesterId: string;
  @ManyToOne(() => Semester, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;
  @Column({ type: 'varchar', default: 'draft' })
  status: RegistrationStatus;
  @Column({ name: 'total_units', default: 0 })
  totalUnits: number;
  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt?: Date | null;
  @OneToMany(() => RegistrationCourse, (rc) => rc.registration)
  courses: RegistrationCourse[];
  @OneToOne(() => Approval, (approval) => approval.registration)
  approval?: Approval;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
