'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { registrationsKeys, approvalsKeys } from '@/hooks/keys';
import {
  addDrop,
  getOwnRegistration,
  saveDraft,
  submitRegistration,
  validateRegistration,
} from '@/services/registrations';

export function useOwnRegistration(semesterId?: string) {
  return useQuery({
    queryKey: registrationsKeys.own(semesterId),
    queryFn: () => getOwnRegistration(semesterId),
  });
}

// Mutations are passthroughs (query.md) — no wrapper that throws on failure.
// validate() has no mutation-style side effect on the backend (it never
// persists), but it's still a useMutation here rather than a query: it's
// fired on demand (debounced, on selection change) with a variable payload,
// not cached/keyed the way a read is.

export function useValidateRegistration() {
  return useMutation({
    mutationFn: ({
      semesterId,
      courseIds,
    }: {
      semesterId: string;
      courseIds: string[];
    }) => validateRegistration(semesterId, courseIds),
  });
}

export function useSaveDraft() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      semesterId,
      courseIds,
    }: {
      semesterId: string;
      courseIds: string[];
    }) => saveDraft(semesterId, courseIds),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: registrationsKeys.own(variables.semesterId),
      }),
  });
}

export function useSubmitRegistration() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (semesterId: string) => submitRegistration(semesterId),
    onSuccess: (_result, semesterId) => {
      queryClient.invalidateQueries({
        queryKey: registrationsKeys.own(semesterId),
      });
      queryClient.invalidateQueries({ queryKey: registrationsKeys.own() });
      // A successful submit lands the registration in the adviser's queue —
      // invalidate defensively in case an adviser has this open in another
      // tab/session (harmless no-op otherwise).
      queryClient.invalidateQueries({ queryKey: approvalsKeys.adviserQueue() });
    },
  });
}

export function useAddDrop() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      semesterId,
      courseIds,
    }: {
      semesterId: string;
      courseIds: string[];
    }) => addDrop(semesterId, courseIds),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: registrationsKeys.own(variables.semesterId),
      });
      queryClient.invalidateQueries({ queryKey: registrationsKeys.own() });
      queryClient.invalidateQueries({ queryKey: approvalsKeys.adviserQueue() });
    },
  });
}
