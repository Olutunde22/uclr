'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type {
  AcademicSession,
  CreateSemesterRequest,
  CreateSessionRequest,
  Semester,
  UpdateSemesterRequest,
  UpdateSemesterWindowsRequest,
  UpdateSessionRequest,
} from '@/types/calendar';

// Services never throw for API failures (data-layer.md) — every function here
// resolves with an ApiResponse, and the calling hook/component reads the
// result rather than catching.

// Sessions.

export async function getSessions(): Promise<ApiResponse<AcademicSession[] | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<AcademicSession[]>>(
      '/calendar/sessions',
    );
    return unwrap(response, 'Failed to load academic sessions');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load academic sessions'),
    };
  }
}

export async function createSession(
  dto: CreateSessionRequest,
): Promise<ApiResponse<AcademicSession | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<AcademicSession>>(
      '/calendar/sessions',
      dto,
    );
    return unwrap(response, 'Failed to create academic session');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to create academic session'),
    };
  }
}

export async function updateSession(
  id: string,
  dto: UpdateSessionRequest,
): Promise<ApiResponse<AcademicSession | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<AcademicSession>>(
      `/calendar/sessions/${id}`,
      dto,
    );
    return unwrap(response, 'Failed to update academic session');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update academic session'),
    };
  }
}

export async function setCurrentSession(
  id: string,
): Promise<ApiResponse<AcademicSession | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<AcademicSession>>(
      `/calendar/sessions/${id}/current`,
    );
    return unwrap(response, 'Failed to set the current session');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to set the current session'),
    };
  }
}

// Semesters.

export async function getSemesters(
  sessionId?: string,
): Promise<ApiResponse<Semester[] | null>> {
  try {
    const qs = sessionId ? `?sessionId=${sessionId}` : '';
    const response = await serverApi.get<ApiEnvelope<Semester[]>>(
      `/calendar/semesters${qs}`,
    );
    return unwrap(response, 'Failed to load semesters');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load semesters'),
    };
  }
}

export async function createSemester(
  dto: CreateSemesterRequest,
): Promise<ApiResponse<Semester | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Semester>>(
      '/calendar/semesters',
      dto,
    );
    return unwrap(response, 'Failed to create semester');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to create semester'),
    };
  }
}

export async function updateSemester(
  id: string,
  dto: UpdateSemesterRequest,
): Promise<ApiResponse<Semester | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Semester>>(
      `/calendar/semesters/${id}`,
      dto,
    );
    return unwrap(response, 'Failed to update semester');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update semester'),
    };
  }
}

export async function updateSemesterWindows(
  id: string,
  dto: UpdateSemesterWindowsRequest,
): Promise<ApiResponse<Semester | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Semester>>(
      `/calendar/semesters/${id}/windows`,
      dto,
    );
    return unwrap(response, "Failed to update the semester's windows");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, "Failed to update the semester's windows"),
    };
  }
}

export async function setCurrentSemester(
  id: string,
): Promise<ApiResponse<Semester | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Semester>>(
      `/calendar/semesters/${id}/current`,
    );
    return unwrap(response, 'Failed to set the current semester');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to set the current semester'),
    };
  }
}
