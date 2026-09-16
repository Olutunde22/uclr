import { SetMetadata } from '@nestjs/common';
export interface AuditMeta {
  action: string;
  resourceType?: string;
  resourceIdParam?: string;
}
export const AUDIT_KEY = 'auditMeta';
export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_KEY, meta);
