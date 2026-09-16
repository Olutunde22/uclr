'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type { Registration, RuleResult, SubmitOutcome } from '@/types/registrations';

// Services never throw for API failures (data-layer.md) — every function
// here resolves with an ApiResponse, and the calling hook/component reads
// the result rather than catching.
//
// Student routes are `registrations:submit`-gated, self-scoped via
// @CurrentUser on the backend (never a body/param student id) — see
// backend/CLAUDE.md's registrations module notes.

export async function saveDraft(
  semesterId: string,
  courseIds: string[],
): Promise<ApiResponse<Registration | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Registration>>(
      '/registrations/draft',
      { semesterId, courseIds },
    );
    return unwrap(response, 'Failed to save your draft registration');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to save your draft registration'),
    };
  }
}

export async function validateRegistration(
  semesterId: string,
  courseIds: string[],
): Promise<ApiResponse<RuleResult | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<RuleResult>>(
      '/registrations/validate',
      { semesterId, courseIds },
    );
    return unwrap(response, 'Failed to check your selection');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to check your selection'),
    };
  }
}

export async function submitRegistration(
  semesterId: string,
): Promise<ApiResponse<SubmitOutcome | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<SubmitOutcome>>(
      '/registrations/submit',
      { semesterId },
    );
    return unwrap(response, 'Failed to submit your registration');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to submit your registration'),
    };
  }
}

export async function addDrop(
  semesterId: string,
  courseIds: string[],
): Promise<ApiResponse<SubmitOutcome | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<SubmitOutcome>>(
      '/registrations/add-drop',
      { semesterId, courseIds },
    );
    return unwrap(response, 'Failed to update your registration');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update your registration'),
    };
  }
}

// Permission-less self-read (matches the fees/me and courses/mine precedent —
// see backend/CLAUDE.md): defaults to the current semester when omitted.
export async function getOwnRegistration(
  semesterId?: string,
): Promise<ApiResponse<Registration | null>> {
  try {
    const qs = semesterId ? `?semesterId=${semesterId}` : '';
    const response = await serverApi.get<ApiEnvelope<Registration | null>>(
      `/registrations/me${qs}`,
    );
    return unwrap(response, 'Failed to load your registration');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load your registration'),
    };
  }
}
