'use client';

import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { calendarKeys, feesKeys } from '@/hooks/keys';
import { getSessions } from '@/services/calendar';
import {
  getOwnFeeStatus,
  issueClearance,
  listPayments,
  recordPayment,
  revokeClearance,
} from '@/services/fees';
import type {
  CreatePaymentRequest,
  ListPaymentsFilters,
  SetClearanceRequest,
} from '@/types/fees';
import type { AcademicSession } from '@/types/calendar';

export function usePayments(filters: ListPaymentsFilters) {
  return useQuery({
    queryKey: feesKeys.paymentsList(filters),
    queryFn: () => listPayments(filters),
  });
}

export function useOwnFeeStatus(sessionId?: string) {
  return useQuery({
    queryKey: feesKeys.me(sessionId),
    queryFn: () => getOwnFeeStatus(sessionId),
  });
}

// Session picker for the bursary pages (record payment / issue-revoke
// clearance): backed exclusively by real AcademicSession rows, never free
// text (every FK field in this slice is a select). GET /calendar/sessions
// requires `calendar:manage`, which `bursary_officer` isn't seeded with
// (backend/src/common/permissions.ts), so that call 403s for a pure bursary
// account — it resolves with `data: null` rather than throwing (data-layer.md)
// and this hook falls back to the distinct sessions embedded in
// GET /fees/payments (which `fees:manage` *does* allow), deduped by id. This
// is the best real-data source available to bursary without touching the
// backend's permission grants; see PROGRESS.md's Decisions for the full
// writeup, including the cold-start case.
export function useFeeSessionOptions() {
  const sessionsQuery = useQuery({
    queryKey: calendarKeys.sessions(),
    queryFn: () => getSessions(),
  });
  const paymentsQuery = useQuery({
    queryKey: feesKeys.paymentsList({}),
    queryFn: () => listPayments({}),
  });

  const sessions = useMemo(() => {
    const fromCalendar = sessionsQuery.data?.data;
    if (fromCalendar && fromCalendar.length > 0) return fromCalendar;

    const byId = new Map<string, AcademicSession>();
    for (const payment of paymentsQuery.data?.data ?? []) {
      if (payment.session) byId.set(payment.session.id, payment.session);
    }
    return Array.from(byId.values());
  }, [sessionsQuery.data, paymentsQuery.data]);

  return {
    sessions,
    isLoading: sessionsQuery.isLoading || paymentsQuery.isLoading,
  };
}

// Mutations are passthroughs (query.md). Recording a payment or setting
// clearance both only ever affect the searched student's own history/status,
// but the payments list also backs useFeeSessionOptions' fallback above, so
// invalidate the whole `fees` branch rather than a narrower key.

export function useRecordPayment() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePaymentRequest) => recordPayment(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: feesKeys.all() }),
  });
}

export function useIssueClearance() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: SetClearanceRequest) => issueClearance(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: feesKeys.all() }),
  });
}

export function useRevokeClearance() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: SetClearanceRequest) => revokeClearance(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: feesKeys.all() }),
  });
}
