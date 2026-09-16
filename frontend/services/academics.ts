'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse, ApiResult } from '@/types/api';
import type {
  CreateDepartmentRequest,
  CreateFacultyRequest,
  Department,
  Faculty,
  UpdateDepartmentRequest,
  UpdateFacultyRequest,
} from '@/types/academics';

// Faculties. Lists never paginate on the backend (AcademicsService.listFaculties
// / listDepartments return a plain array, not { items, total, page, pageSize }),
// so these resolve with plain arrays via unwrap(), not unwrapPaginated().

export async function getFaculties(): Promise<ApiResponse<Faculty[] | null>> {
  try {
    const response =
      await serverApi.get<ApiEnvelope<Faculty[]>>('/academics/faculties');
    return unwrap(response, 'Failed to load faculties');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load faculties'),
    };
  }
}

export async function createFaculty(
  dto: CreateFacultyRequest,
): Promise<ApiResponse<Faculty | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Faculty>>(
      '/academics/faculties',
      dto,
    );
    return unwrap(response, 'Failed to create faculty');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to create faculty'),
    };
  }
}

export async function updateFaculty(
  id: string,
  dto: UpdateFacultyRequest,
): Promise<ApiResponse<Faculty | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Faculty>>(
      `/academics/faculties/${id}`,
      dto,
    );
    return unwrap(response, 'Failed to update faculty');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update faculty'),
    };
  }
}

export async function deleteFaculty(id: string): Promise<ApiResult> {
  try {
    const response = await serverApi.delete<ApiEnvelope<null>>(
      `/academics/faculties/${id}`,
    );
    if (!response.data.success) {
      const raw = response.data.message;
      return {
        ok: false,
        message: Array.isArray(raw) ? raw[0] : raw || 'Failed to delete faculty',
      };
    }
    return { ok: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { ok: false, message: handleAPIErrors(error, 'Failed to delete faculty') };
  }
}

// Departments.

export async function getDepartments(
  facultyId?: string,
): Promise<ApiResponse<Department[] | null>> {
  try {
    const qs = facultyId ? `?facultyId=${facultyId}` : '';
    const response = await serverApi.get<ApiEnvelope<Department[]>>(
      `/academics/departments${qs}`,
    );
    return unwrap(response, 'Failed to load departments');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load departments'),
    };
  }
}

export async function createDepartment(
  dto: CreateDepartmentRequest,
): Promise<ApiResponse<Department | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Department>>(
      '/academics/departments',
      dto,
    );
    return unwrap(response, 'Failed to create department');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to create department'),
    };
  }
}

export async function updateDepartment(
  id: string,
  dto: UpdateDepartmentRequest,
): Promise<ApiResponse<Department | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Department>>(
      `/academics/departments/${id}`,
      dto,
    );
    return unwrap(response, 'Failed to update department');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update department'),
    };
  }
}

export async function deleteDepartment(id: string): Promise<ApiResult> {
  try {
    const response = await serverApi.delete<ApiEnvelope<null>>(
      `/academics/departments/${id}`,
    );
    if (!response.data.success) {
      const raw = response.data.message;
      return {
        ok: false,
        message:
          Array.isArray(raw) ? raw[0] : raw || 'Failed to delete department',
      };
    }
    return { ok: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      message: handleAPIErrors(error, 'Failed to delete department'),
    };
  }
}

export async function assignHod(
  departmentId: string,
  userId: string,
): Promise<ApiResponse<Department | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Department>>(
      `/academics/departments/${departmentId}/hod`,
      { userId },
    );
    return unwrap(response, 'Failed to assign HOD');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to assign HOD') };
  }
}

export async function clearHod(
  departmentId: string,
): Promise<ApiResponse<Department | null>> {
  try {
    const response = await serverApi.delete<ApiEnvelope<Department>>(
      `/academics/departments/${departmentId}/hod`,
    );
    return unwrap(response, "Failed to clear the department's HOD");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, "Failed to clear the department's HOD"),
    };
  }
}
