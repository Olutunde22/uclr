'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type {
  CreatePaymentRequest,
  FeeClearance,
  FeePayment,
  ListPaymentsFilters,
  OwnFeeStatus,
  SetClearanceRequest,
} from '@/types/fees';

// Services never throw for API failures (data-layer.md) — every function here
// resolves with an ApiResponse, and the calling hook/component reads the
// result rather than catching.

export async function recordPayment(
  dto: CreatePaymentRequest,
): Promise<ApiResponse<FeePayment | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<FeePayment>>(
      '/fees/payments',
      dto,
    );
    return unwrap(response, 'Failed to record payment');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to record payment'),
    };
  }
}

export async function listPayments(
  filters: ListPaymentsFilters,
): Promise<ApiResponse<FeePayment[] | null>> {
  try {
    const params = new URLSearchParams();
    if (filters.studentId) params.set('studentId', filters.studentId);
    if (filters.sessionId) params.set('sessionId', filters.sessionId);
    const qs = params.toString();
    const response = await serverApi.get<ApiEnvelope<FeePayment[]>>(
      `/fees/payments${qs ? `?${qs}` : ''}`,
    );
    return unwrap(response, 'Failed to load payment history');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load payment history'),
    };
  }
}

export async function issueClearance(
  dto: SetClearanceRequest,
): Promise<ApiResponse<FeeClearance | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<FeeClearance>>(
      '/fees/clearances',
      dto,
    );
    return unwrap(response, 'Failed to issue clearance');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to issue clearance'),
    };
  }
}

export async function revokeClearance(
  dto: SetClearanceRequest,
): Promise<ApiResponse<FeeClearance | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<FeeClearance>>(
      '/fees/clearances/revoke',
      dto,
    );
    return unwrap(response, 'Failed to revoke clearance');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to revoke clearance'),
    };
  }
}

// Permission-less: the backend scopes this to `currentUser.id` regardless of
// who calls it (backend/CLAUDE.md's "GET /fees/me" note), matching
// services/auth.ts's getMe() self-read precedent.
export async function getOwnFeeStatus(
  sessionId?: string,
): Promise<ApiResponse<OwnFeeStatus | null>> {
  try {
    const qs = sessionId ? `?sessionId=${sessionId}` : '';
    const response = await serverApi.get<ApiEnvelope<OwnFeeStatus>>(
      `/fees/me${qs}`,
    );
    return unwrap(response, 'Failed to load your fee status');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load your fee status'),
    };
  }
}
