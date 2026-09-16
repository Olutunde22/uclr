'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrapPaginated } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse, Paginated } from '@/types/api';
import type { AuditFilters, AuditLog } from '@/types/audit';

// GET /audit's service (AuditService.query) returns { items, total } only —
// no page/pageSize echoed back — so unwrapPaginated() falls back to the
// filters this call actually requested. Read-only: audit:read has no
// mutation counterpart.
export async function getAuditLogs(
  filters: AuditFilters,
): Promise<ApiResponse<Paginated<AuditLog> | null>> {
  try {
    const params = new URLSearchParams();
    if (filters.action) params.set('action', filters.action);
    if (filters.resourceType) params.set('resourceType', filters.resourceType);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    const qs = params.toString();
    const response = await serverApi.get<ApiEnvelope<AuditLog[]>>(
      `/audit${qs ? `?${qs}` : ''}`,
    );
    return unwrapPaginated(response, 'Failed to load the audit log', filters);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load the audit log'),
    };
  }
}
