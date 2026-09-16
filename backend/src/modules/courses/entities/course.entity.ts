import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from '../../academics/entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { TimetableSlot } from './timetable-slot.entity';
export type CourseSemester = 'first' | 'second';
@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'department_id' })
  departmentId: string;
  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'department_id' })
  department: Department;
  @Column({ unique: true })
  code: string;
  @Column()
  title: string;
  @Column({ name: 'credit_units' })
  creditUnits: number;
  @Column()
  level: number;
  @Column({ type: 'varchar' })
  semester: CourseSemester;
  @Column()
  capacity: number;
  @Column({ name: 'lecturer_id', nullable: true })
  lecturerId?: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lecturer_id' })
  lecturer?: User | null;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @ManyToMany(() => Course, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'course_prerequisites',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'prerequisite_id', referencedColumnName: 'id' },
  })
  prerequisites: Course[];
  @OneToMany(() => TimetableSlot, (slot) => slot.course)
  timetableSlots: TimetableSlot[];
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
