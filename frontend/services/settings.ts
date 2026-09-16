'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type { SystemSetting } from '@/types/settings';

export async function getSettings(): Promise<
  ApiResponse<SystemSetting[] | null>
> {
  try {
    const response =
      await serverApi.get<ApiEnvelope<SystemSetting[]>>('/settings');
    return unwrap(response, 'Failed to load system settings');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load system settings'),
    };
  }
}

export async function updateSetting(
  key: string,
  value: string,
): Promise<ApiResponse<SystemSetting | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<SystemSetting>>(
      `/settings/${key}`,
      { value },
    );
    return unwrap(response, `Failed to update "${key}"`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, `Failed to update "${key}"`),
    };
  }
}
