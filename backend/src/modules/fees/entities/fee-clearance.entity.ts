import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AcademicSession } from '../../calendar/entities/academic-session.entity';
@Entity({ name: 'fee_clearances' })
@Index(['studentId', 'sessionId'], { unique: true })
export class FeeClearance {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'student_id' })
  studentId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;
  @Column({ name: 'session_id' })
  sessionId: string;
  @ManyToOne(() => AcademicSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;
  @Column({ default: false })
  cleared: boolean;
  @Column({ name: 'cleared_by', nullable: true })
  clearedBy?: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cleared_by' })
  clearedByUser?: User | null;
  @Column({ name: 'cleared_at', type: 'timestamptz', nullable: true })
  clearedAt?: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
