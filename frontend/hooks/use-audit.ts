'use client';

import { useQuery } from '@tanstack/react-query';
import { auditKeys } from '@/hooks/keys';
import { getAuditLogs } from '@/services/audit';
import type { AuditFilters } from '@/types/audit';

// Read-only (audit:read has no mutations) — see hooks/use-users.ts etc. for
// the mutation pattern used elsewhere in this slice.
export function useAuditLogs(filters: AuditFilters) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => getAuditLogs(filters),
    placeholderData: (prev, prevQuery) => (prevQuery ? prev : undefined),
  });
}
