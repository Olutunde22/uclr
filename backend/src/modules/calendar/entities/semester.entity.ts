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
import { AcademicSession } from './academic-session.entity';
export type SemesterName = 'first' | 'second';
@Entity({ name: 'semesters' })
@Index(['sessionId', 'name'], { unique: true })
export class Semester {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'session_id' })
  sessionId: string;
  @ManyToOne(() => AcademicSession, (session) => session.semesters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;
  @Column({ type: 'varchar' })
  name: SemesterName;
  @Column({
    name: 'registration_opens_at',
    type: 'timestamptz',
    nullable: true,
  })
  registrationOpensAt?: Date | null;
  @Column({
    name: 'registration_closes_at',
    type: 'timestamptz',
    nullable: true,
  })
  registrationClosesAt?: Date | null;
  @Column({ name: 'add_drop_closes_at', type: 'timestamptz', nullable: true })
  addDropClosesAt?: Date | null;
  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;
  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt?: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
