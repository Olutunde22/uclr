// Mirrors backend/src/modules/audit/entities/audit-log.entity.ts.
export interface AuditLog {
  id: string;
  actorUserId?: string;
  actorEmail?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  outcome: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditFilters {
  action?: string;
  resourceType?: string;
  page?: number;
  pageSize?: number;
}
