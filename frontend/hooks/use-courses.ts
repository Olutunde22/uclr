'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { coursesKeys } from '@/hooks/keys';
import {
  addOwnPrerequisite,
  addPrerequisite,
  addTimetableSlot,
  assignLecturer,
  clearLecturer,
  createCourse,
  getClassList,
  getCourse,
  getCourses,
  getMyCourses,
  removeOwnPrerequisite,
  removePrerequisite,
  removeTimetableSlot,
  updateCourse,
  updateOwnCapacity,
  updateTimetableSlot,
} from '@/services/courses';
import type {
  CreateCourseRequest,
  CreateTimetableSlotRequest,
  ListCoursesFilters,
  UpdateCourseRequest,
  UpdateTimetableSlotRequest,
} from '@/types/courses';

// Reads.

export function useCourses(filters: ListCoursesFilters = {}) {
  return useQuery({
    queryKey: coursesKeys.list(filters),
    queryFn: () => getCourses(filters),
    placeholderData: (prev, prevQuery) => (prevQuery ? prev : undefined),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: coursesKeys.detail(id),
    queryFn: () => getCourse(id),
    enabled: !!id,
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: coursesKeys.mine(),
    queryFn: () => getMyCourses(),
  });
}

export function useClassList(id: string, semesterId?: string) {
  return useQuery({
    queryKey: coursesKeys.classList(id, semesterId),
    queryFn: () => getClassList(id, semesterId as string),
    enabled: !!id && !!semesterId,
  });
}

// Mutations are passthroughs (query.md) — no wrapper that throws on failure.

export function useCreateCourse() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCourseRequest) => createCourse(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() }),
  });
}

export function useUpdateCourse() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCourseRequest }) =>
      updateCourse(id, dto),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      });
    },
  });
}

export function useAssignLecturer() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      assignLecturer(id, userId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: coursesKeys.mine() });
    },
  });
}

export function useClearLecturer() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (id: string) => clearLecturer(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: coursesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: coursesKeys.mine() });
    },
  });
}

export function useAddPrerequisite() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, prerequisiteId }: { id: string; prerequisiteId: string }) =>
      addPrerequisite(id, prerequisiteId),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      }),
  });
}

export function useRemovePrerequisite() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, prerequisiteId }: { id: string; prerequisiteId: string }) =>
      removePrerequisite(id, prerequisiteId),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      }),
  });
}

export function useAddTimetableSlot() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateTimetableSlotRequest }) =>
      addTimetableSlot(id, dto),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      }),
  });
}

export function useUpdateTimetableSlot() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      slotId,
      dto,
    }: {
      id: string;
      slotId: string;
      dto: UpdateTimetableSlotRequest;
    }) => updateTimetableSlot(id, slotId, dto),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      }),
  });
}

export function useRemoveTimetableSlot() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, slotId }: { id: string; slotId: string }) =>
      removeTimetableSlot(id, slotId),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: coursesKeys.detail(variables.id),
      }),
  });
}

// Lecturer's own courses.

export function useUpdateOwnCapacity() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, capacity }: { id: string; capacity: number }) =>
      updateOwnCapacity(id, capacity),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: coursesKeys.mine() }),
  });
}

// There is no `GET /courses/mine/:id` (only list/capacity/prerequisite
// mutations) — a lecturer can't re-fetch a single own-course's current
// prerequisites, only learn them from what a mutation just returned (see
// frontend/CLAUDE.md's "My courses" notes). Both mutations below cache their
// CourseDetail response under the same `coursesKeys.detail(id)` key the HOD
// detail page reads, so `components/my-courses/*` can show "known
// prerequisites" via `queryClient.getQueryData` without an extra fetch.

export function useAddOwnPrerequisite() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, prerequisiteId }: { id: string; prerequisiteId: string }) =>
      addOwnPrerequisite(id, prerequisiteId),
    onSuccess: (result, variables) => {
      if (result.data) {
        queryClient.setQueryData(coursesKeys.detail(variables.id), result);
      }
      queryClient.invalidateQueries({ queryKey: coursesKeys.mine() });
    },
  });
}

export function useRemoveOwnPrerequisite() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, prerequisiteId }: { id: string; prerequisiteId: string }) =>
      removeOwnPrerequisite(id, prerequisiteId),
    onSuccess: (result, variables) => {
      if (result.data) {
        queryClient.setQueryData(coursesKeys.detail(variables.id), result);
      }
      queryClient.invalidateQueries({ queryKey: coursesKeys.mine() });
    },
  });
}
