'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { recordsKeys } from '@/hooks/keys';
import { finaliseSemester, getTranscript, listRecords } from '@/services/records';
import type { ListRecordsFilters } from '@/types/records';

export function useRecords(filters: ListRecordsFilters) {
  return useQuery({
    queryKey: recordsKeys.list(filters),
    queryFn: () => listRecords(filters),
    enabled: !!filters.semesterId,
    placeholderData: (prev, prevQuery) => (prevQuery ? prev : undefined),
  });
}

export function useTranscript(studentId: string) {
  return useQuery({
    queryKey: recordsKeys.transcript(studentId),
    queryFn: () => getTranscript(studentId),
    enabled: !!studentId,
  });
}

// A passthrough mutation (query.md) — the DangerConfirm dialog on /records
// drives the loading/confirm UI, not this hook.
export function useFinaliseSemester() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (semesterId: string) => finaliseSemester(semesterId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recordsKeys.all() }),
  });
}
