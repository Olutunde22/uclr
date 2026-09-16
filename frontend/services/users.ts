'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap, unwrapPaginated } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse, Paginated } from '@/types/api';
import type {
  CreateUserRequest,
  ListUsersFilters,
  StaffProfile,
  StudentProfile,
  UpdateUserRequest,
  UpsertStaffProfileRequest,
  UpsertStudentProfileRequest,
  User,
  UserDetail,
} from '@/types/users';

// Services never throw for API failures (data-layer.md) — every function here
// resolves with an ApiResponse/ApiResult, and the calling hook/component
// reads the result rather than catching.

export async function getUsers(
  filters: ListUsersFilters,
): Promise<ApiResponse<Paginated<User> | null>> {
  try {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.departmentId) params.set('departmentId', filters.departmentId);
    if (filters.isActive !== undefined)
      params.set('isActive', String(filters.isActive));
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    const qs = params.toString();
    const response = await serverApi.get<ApiEnvelope<User[]>>(
      `/users${qs ? `?${qs}` : ''}`,
    );
    return unwrapPaginated(response, 'Failed to load users', filters);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to load users') };
  }
}

export async function getUser(
  id: string,
): Promise<ApiResponse<UserDetail | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<UserDetail>>(
      `/users/${id}`,
    );
    return unwrap(response, 'Failed to load user');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to load user') };
  }
}

export async function createUser(
  dto: CreateUserRequest,
): Promise<ApiResponse<User | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<User>>('/users', dto);
    return unwrap(response, 'Failed to create user');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to create user'),
    };
  }
}

export async function updateUser(
  id: string,
  dto: UpdateUserRequest,
): Promise<ApiResponse<User | null>> {
  try {
    const response = await serverApi.patch<ApiEnvelope<User>>(
      `/users/${id}`,
      dto,
    );
    return unwrap(response, 'Failed to update user');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update user'),
    };
  }
}

export async function upsertStudentProfile(
  id: string,
  dto: UpsertStudentProfileRequest,
): Promise<ApiResponse<StudentProfile | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<StudentProfile>>(
      `/users/${id}/student-profile`,
      dto,
    );
    return unwrap(response, "Failed to save the student's profile");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, "Failed to save the student's profile"),
    };
  }
}

export async function upsertStaffProfile(
  id: string,
  dto: UpsertStaffProfileRequest,
): Promise<ApiResponse<StaffProfile | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<StaffProfile>>(
      `/users/${id}/staff-profile`,
      dto,
    );
    return unwrap(response, "Failed to save the staff member's profile");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(
        error,
        "Failed to save the staff member's profile",
      ),
    };
  }
}
