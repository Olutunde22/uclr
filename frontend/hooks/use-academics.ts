'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { departmentsKeys, facultiesKeys } from '@/hooks/keys';
import {
  assignHod,
  clearHod,
  createDepartment,
  createFaculty,
  deleteDepartment,
  deleteFaculty,
  getDepartments,
  getFaculties,
  updateDepartment,
  updateFaculty,
} from '@/services/academics';
import type {
  CreateDepartmentRequest,
  CreateFacultyRequest,
  UpdateDepartmentRequest,
  UpdateFacultyRequest,
} from '@/types/academics';

export function useFaculties() {
  return useQuery({
    queryKey: facultiesKeys.list(),
    queryFn: () => getFaculties(),
  });
}

export function useDepartments(facultyId?: string) {
  return useQuery({
    queryKey: departmentsKeys.list(facultyId),
    queryFn: () => getDepartments(facultyId),
  });
}

export function useCreateFaculty() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFacultyRequest) => createFaculty(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: facultiesKeys.all() }),
  });
}

export function useUpdateFaculty() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFacultyRequest }) =>
      updateFaculty(id, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: facultiesKeys.all() }),
  });
}

export function useDeleteFaculty() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFaculty(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: facultiesKeys.all() }),
  });
}

// A department's faculty/HOD affects both department lists (all + per-faculty)
// and, when HOD changes, the users list (a staff member's "HOD of X" isn't
// shown there today, but invalidating both keeps this future-proof and cheap).
export function useCreateDepartment() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDepartmentRequest) => createDepartment(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: departmentsKeys.all() }),
  });
}

export function useUpdateDepartment() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepartmentRequest }) =>
      updateDepartment(id, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: departmentsKeys.all() }),
  });
}

export function useDeleteDepartment() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: departmentsKeys.all() }),
  });
}

export function useAssignHod() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      userId,
    }: {
      departmentId: string;
      userId: string;
    }) => assignHod(departmentId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: departmentsKeys.all() }),
  });
}

export function useClearHod() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) => clearHod(departmentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: departmentsKeys.all() }),
  });
}
