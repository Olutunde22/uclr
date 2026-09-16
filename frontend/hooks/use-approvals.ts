'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { approvalsKeys, registrationsKeys } from '@/hooks/keys';
import {
  adviserDecide,
  getAdviserQueue,
  getAdvisees,
  getHodQueue,
  hodDecide,
} from '@/services/approvals';
import type { Decision } from '@/types/registrations';

export function useAdviserQueue() {
  return useQuery({
    queryKey: approvalsKeys.adviserQueue(),
    queryFn: () => getAdviserQueue(),
  });
}

export function useHodQueue() {
  return useQuery({
    queryKey: approvalsKeys.hodQueue(),
    queryFn: () => getHodQueue(),
  });
}

export function useAdvisees(adviserId: string) {
  return useQuery({
    queryKey: approvalsKeys.advisees(adviserId),
    queryFn: () => getAdvisees(adviserId),
    enabled: !!adviserId,
  });
}

// Mutations are passthroughs (query.md). A decision always removes the item
// from its own queue (status moves off pending_adviser/pending_hod) and,
// after an adviser approves, adds it to the HOD queue — invalidate both plus
// the student's own status read defensively (harmless if that student isn't
// the current session).

export function useAdviserDecide() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      comment,
    }: {
      id: string;
      decision: Decision;
      comment?: string;
    }) => adviserDecide(id, decision, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalsKeys.adviserQueue() });
      queryClient.invalidateQueries({ queryKey: approvalsKeys.hodQueue() });
      queryClient.invalidateQueries({ queryKey: registrationsKeys.all() });
    },
  });
}

export function useHodDecide() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      comment,
    }: {
      id: string;
      decision: Decision;
      comment?: string;
    }) => hodDecide(id, decision, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalsKeys.hodQueue() });
      queryClient.invalidateQueries({ queryKey: registrationsKeys.all() });
    },
  });
}
