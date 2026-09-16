import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Semester } from './semester.entity';
@Entity({ name: 'academic_sessions' })
export class AcademicSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  name: string;
  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;
  @OneToMany(() => Semester, (semester) => semester.session)
  semesters: Semester[];
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
