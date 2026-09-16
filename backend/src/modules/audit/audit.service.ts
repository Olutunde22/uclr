import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export interface RecordAuditInput {
  actorUserId?: string;
  actorEmail?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  outcome?: 'success' | 'denied' | 'error';
  summary?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}
export interface AuditQuery {
  actorUserId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}
  async record(input: RecordAuditInput): Promise<void> {
    try {
      const entry = this.repo.create({
        actorUserId: input.actorUserId,
        actorEmail: input.actorEmail,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        outcome: input.outcome ?? 'success',
        summary: input.summary,
        metadata: input.metadata,
        ip: input.ip,
        userAgent: input.userAgent,
      });
      await this.repo.save(entry);
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for action "${input.action}"`,
        err as Error,
      );
    }
  }
  async query(q: AuditQuery): Promise<{
    items: AuditLog[];
    total: number;
  }> {
    const page = q.page && q.page > 0 ? q.page : 1;
    const pageSize =
      q.pageSize && q.pageSize > 0 ? Math.min(q.pageSize, 200) : 50;
    const where: FindOptionsWhere<AuditLog> = {};
    if (q.actorUserId) where.actorUserId = q.actorUserId;
    if (q.action) where.action = q.action;
    if (q.resourceType) where.resourceType = q.resourceType;
    if (q.resourceId) where.resourceId = q.resourceId;
    if (q.from && q.to) where.createdAt = Between(q.from, q.to);
    else if (q.from) where.createdAt = MoreThanOrEqual(q.from);
    else if (q.to) where.createdAt = LessThanOrEqual(q.to);
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total };
  }
}
