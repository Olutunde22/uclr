import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId?: string;
  @Column({ name: 'actor_email', nullable: true })
  actorEmail?: string;
  @Index()
  @Column()
  action: string;
  @Index()
  @Column({ name: 'resource_type', nullable: true })
  resourceType?: string;
  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string;
  @Column({ default: 'success' })
  outcome: string;
  @Column({ nullable: true })
  summary?: string;
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
  @Column({ nullable: true })
  ip?: string;
  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;
  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
