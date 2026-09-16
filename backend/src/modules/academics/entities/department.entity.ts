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
import { Faculty } from './faculty.entity';
import { User } from '../../users/entities/user.entity';
@Entity({ name: 'departments' })
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'faculty_id' })
  facultyId: string;
  @ManyToOne(() => Faculty, (faculty) => faculty.departments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'faculty_id' })
  faculty: Faculty;
  @Column({ unique: true })
  code: string;
  @Column()
  name: string;
  @Column({ name: 'hod_id', unique: true, nullable: true })
  hodId?: string | null;
  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'hod_id' })
  hod?: User | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
