import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Department } from '../../academics/entities/department.entity';
@Entity({ name: 'student_profiles' })
export class StudentProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ name: 'matric_no', unique: true })
  matricNo: string;
  @Column({ name: 'department_id' })
  departmentId: string;
  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'department_id' })
  department: Department;
  @Column()
  level: number;
  @Column()
  programme: string;
  @Column()
  gender: string;
  @Column({ name: 'adviser_id', nullable: true })
  adviserId?: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'adviser_id' })
  adviser?: User | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
