import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Registration } from './registration.entity';
import { User } from '../../users/entities/user.entity';
export type ApprovalDecisionStatus = 'pending' | 'approved' | 'rejected';
@Entity({ name: 'approvals' })
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'registration_id', unique: true })
  registrationId: string;
  @OneToOne(() => Registration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration: Registration;
  @Column({ name: 'adviser_id' })
  adviserId: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'adviser_id' })
  adviser: User;
  @Column({ name: 'adviser_status', type: 'varchar', default: 'pending' })
  adviserStatus: ApprovalDecisionStatus;
  @Column({ name: 'adviser_comment', type: 'text', nullable: true })
  adviserComment?: string | null;
  @Column({ name: 'adviser_decided_at', type: 'timestamptz', nullable: true })
  adviserDecidedAt?: Date | null;
  @Column({ name: 'hod_id', nullable: true })
  hodId?: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'hod_id' })
  hod?: User | null;
  @Column({ name: 'hod_status', type: 'varchar', default: 'pending' })
  hodStatus: ApprovalDecisionStatus;
  @Column({ name: 'hod_comment', type: 'text', nullable: true })
  hodComment?: string | null;
  @Column({ name: 'hod_decided_at', type: 'timestamptz', nullable: true })
  hodDecidedAt?: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
