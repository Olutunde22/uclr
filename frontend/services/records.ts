'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type {
  FinaliseSemesterResult,
  ListRecordsFilters,
  RecordRow,
  Transcript,
} from '@/types/records';

// Services never throw for API failures (data-layer.md) — every function
// here resolves with an ApiResponse, and the calling hook/component reads
// the result rather than catching. Registry-officer-only per backend/CLAUDE.md
// (records:read for the two reads below, records:finalise for finaliseSemester).

export async function listRecords(
  filters: ListRecordsFilters,
): Promise<ApiResponse<RecordRow[] | null>> {
  try {
    const params = new URLSearchParams({ semesterId: filters.semesterId });
    if (filters.status) params.set('status', filters.status);
    const response = await serverApi.get<ApiEnvelope<RecordRow[]>>(
      `/records?${params.toString()}`,
    );
    return unwrap(response, 'Failed to load the final registered list');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load the final registered list'),
    };
  }
}

// Genuinely destructive/irreversible — locks the semester (backend/CLAUDE.md:
// throws if already locked). The page gates this behind DangerConfirm.
export async function finaliseSemester(
  semesterId: string,
): Promise<ApiResponse<FinaliseSemesterResult | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<FinaliseSemesterResult>>(
      '/records/finalise',
      { semesterId },
    );
    return unwrap(response, 'Failed to finalise the semester');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to finalise the semester'),
    };
  }
}

export async function getTranscript(
  studentId: string,
): Promise<ApiResponse<Transcript | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<Transcript>>(
      `/records/transcripts/${studentId}`,
    );
    return unwrap(response, 'Failed to load the transcript');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load the transcript'),
    };
  }
}
