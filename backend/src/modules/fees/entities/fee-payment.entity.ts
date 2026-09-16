import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AcademicSession } from '../../calendar/entities/academic-session.entity';
@Entity({ name: 'fee_payments' })
export class FeePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'student_id' })
  studentId: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student: User;
  @Column({ name: 'session_id' })
  sessionId: string;
  @ManyToOne(() => AcademicSession, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;
  @Column({ name: 'receipt_no', unique: true })
  receiptNo: string;
  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;
  @Column({ name: 'recorded_by' })
  recordedBy: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recorded_by' })
  recordedByUser: User;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
