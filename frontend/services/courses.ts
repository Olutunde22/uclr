'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type {
  ClassListRow,
  Course,
  CourseDetail,
  CreateCourseRequest,
  CreateTimetableSlotRequest,
  ListCoursesFilters,
  TimetableSlot,
  UpdateCourseRequest,
  UpdateTimetableSlotRequest,
} from '@/types/courses';

// Services never throw for API failures (data-layer.md) — every function
// here resolves with an ApiResponse, and the calling hook/component reads
// the result rather than catching.

// General courses:manage-gated CRUD (HOD scoped to their own department in
// the service, system_admin sees all — CoursesService.list has no pagination,
// unlike users/audit, so this resolves a plain array via unwrap()).

export async function getCourses(
  filters: ListCoursesFilters = {},
): Promise<ApiResponse<Course[] | null>> {
  try {
    const params = new URLSearchParams();
    if (filters.departmentId) params.set('departmentId', filters.departmentId);
    if (filters.level) params.set('level', String(filters.level));
    if (filters.semester) params.set('semester', filters.semester);
    if (filters.isActive !== undefined)
      params.set('isActive', String(filters.isActive));
    const qs = params.toString();
    const response = await serverApi.get<ApiEnvelope<Course[]>>(
      `/courses${qs ? `?${qs}` : ''}`,
    );
    return unwrap(response, 'Failed to load courses');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to load courses') };
  }
}

export async function getCourse(
  id: string,
): Promise<ApiResponse<CourseDetail | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<CourseDetail>>(
      `/courses/${id}`,
    );
    return unwrap(response, 'Failed to load course');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to load course') };
  }
}

export async function createCourse(
  dto: CreateCourseRequest,
): Promise<ApiResponse<Course | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Course>>('/courses', dto);
    return unwrap(response, 'Failed to create course');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to create course') };
  }
}

export async function updateCourse(
  id: string,
  dto: UpdateCourseRequest,
): Promise<ApiResponse<Course | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Course>>(
      `/courses/${id}`,
      dto,
    );
    return unwrap(response, 'Failed to update course');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { data: null, message: handleAPIErrors(error, 'Failed to update course') };
  }
}

export async function assignLecturer(
  id: string,
  userId: string,
): Promise<ApiResponse<Course | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Course>>(
      `/courses/${id}/lecturer`,
      { userId },
    );
    return unwrap(response, 'Failed to assign lecturer');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to assign lecturer'),
    };
  }
}

export async function clearLecturer(
  id: string,
): Promise<ApiResponse<Course | null>> {
  try {
    const response = await serverApi.delete<ApiEnvelope<Course>>(
      `/courses/${id}/lecturer`,
    );
    return unwrap(response, "Failed to clear the course's lecturer");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, "Failed to clear the course's lecturer"),
    };
  }
}

export async function addPrerequisite(
  id: string,
  prerequisiteId: string,
): Promise<ApiResponse<CourseDetail | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<CourseDetail>>(
      `/courses/${id}/prerequisites`,
      { prerequisiteId },
    );
    return unwrap(response, 'Failed to add prerequisite');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to add prerequisite'),
    };
  }
}

export async function removePrerequisite(
  id: string,
  prerequisiteId: string,
): Promise<ApiResponse<CourseDetail | null>> {
  try {
    const response = await serverApi.delete<ApiEnvelope<CourseDetail>>(
      `/courses/${id}/prerequisites/${prerequisiteId}`,
    );
    return unwrap(response, 'Failed to remove prerequisite');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to remove prerequisite'),
    };
  }
}

export async function addTimetableSlot(
  id: string,
  dto: CreateTimetableSlotRequest,
): Promise<ApiResponse<TimetableSlot | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<TimetableSlot>>(
      `/courses/${id}/timetable-slots`,
      dto,
    );
    return unwrap(response, 'Failed to add timetable slot');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to add timetable slot'),
    };
  }
}

export async function updateTimetableSlot(
  id: string,
  slotId: string,
  dto: UpdateTimetableSlotRequest,
): Promise<ApiResponse<TimetableSlot | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<TimetableSlot>>(
      `/courses/${id}/timetable-slots/${slotId}`,
      dto,
    );
    return unwrap(response, 'Failed to update timetable slot');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update timetable slot'),
    };
  }
}

export async function removeTimetableSlot(
  id: string,
  slotId: string,
): Promise<ApiResponse<null>> {
  try {
    const response = await serverApi.delete<ApiEnvelope<null>>(
      `/courses/${id}/timetable-slots/${slotId}`,
    );
    return unwrap(response, 'Failed to remove timetable slot');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to remove timetable slot'),
    };
  }
}

// Lecturer's own courses — permission-less on the backend, self-scoped via
// CurrentUser (backend/CLAUDE.md: lecturer doesn't get courses:manage, so
// these hit a distinct /courses/mine* family instead of the general routes).

export async function getMyCourses(): Promise<ApiResponse<Course[] | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<Course[]>>('/courses/mine');
    return unwrap(response, 'Failed to load your courses');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load your courses'),
    };
  }
}

export async function updateOwnCapacity(
  id: string,
  capacity: number,
): Promise<ApiResponse<Course | null>> {
  try {
    const response = await serverApi.put<ApiEnvelope<Course>>(
      `/courses/mine/${id}/capacity`,
      { capacity },
    );
    return unwrap(response, 'Failed to update capacity');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to update capacity'),
    };
  }
}

export async function addOwnPrerequisite(
  id: string,
  prerequisiteId: string,
): Promise<ApiResponse<CourseDetail | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<CourseDetail>>(
      `/courses/mine/${id}/prerequisites`,
      { prerequisiteId },
    );
    return unwrap(response, 'Failed to add prerequisite');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to add prerequisite'),
    };
  }
}

export async function removeOwnPrerequisite(
  id: string,
  prerequisiteId: string,
): Promise<ApiResponse<CourseDetail | null>> {
  try {
    const response = await serverApi.delete<ApiEnvelope<CourseDetail>>(
      `/courses/mine/${id}/prerequisites/${prerequisiteId}`,
    );
    return unwrap(response, 'Failed to remove prerequisite');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to remove prerequisite'),
    };
  }
}

// Class list — no permission key either, scoped in-service to own-course /
// HOD-of-department / system_admin (backend/CLAUDE.md).

export async function getClassList(
  id: string,
  semesterId: string,
): Promise<ApiResponse<ClassListRow[] | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<ClassListRow[]>>(
      `/courses/${id}/class-list?semesterId=${semesterId}`,
    );
    return unwrap(response, 'Failed to load the class list');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load the class list'),
    };
  }
}
