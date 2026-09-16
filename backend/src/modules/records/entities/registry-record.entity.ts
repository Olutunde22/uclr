import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../users/entities/user.entity';
@Entity({ name: 'registry_records' })
export class RegistryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'registration_id', unique: true })
  registrationId: string;
  @OneToOne(() => Registration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration: Registration;
  @Column({ name: 'recorded_by' })
  recordedBy: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recorded_by' })
  recordedByUser: User;
  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
