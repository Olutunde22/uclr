'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type { DepartmentReport, SystemReport } from '@/types/reports';

// Services never throw for API failures (data-layer.md). Both endpoints share
// `reports:read`; the department-vs-system split is enforced in the backend
// service, not the guard (backend/CLAUDE.md's reports module notes) — the
// system report 403s here for anyone but system_admin, same as any other
// backend rejection.

export async function getDepartmentReport(
  semesterId: string,
  departmentId?: string,
): Promise<ApiResponse<DepartmentReport | null>> {
  try {
    const params = new URLSearchParams({ semesterId });
    if (departmentId) params.set('departmentId', departmentId);
    const response = await serverApi.get<ApiEnvelope<DepartmentReport>>(
      `/department/report?${params.toString()}`,
    );
    return unwrap(response, 'Failed to load the department report');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load the department report'),
    };
  }
}

export async function getSystemReport(
  semesterId?: string,
): Promise<ApiResponse<SystemReport | null>> {
  try {
    const qs = semesterId ? `?semesterId=${semesterId}` : '';
    const response = await serverApi.get<ApiEnvelope<SystemReport>>(
      `/admin/reports${qs}`,
    );
    return unwrap(response, 'Failed to load the system report');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load the system report'),
    };
  }
}
