'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { usersKeys } from '@/hooks/keys';
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  upsertStaffProfile,
  upsertStudentProfile,
} from '@/services/users';
import type {
  ListUsersFilters,
  UpdateUserRequest,
  UpsertStaffProfileRequest,
  UpsertStudentProfileRequest,
  CreateUserRequest,
} from '@/types/users';

export function useUsers(filters: ListUsersFilters) {
  return useQuery({
    // Must match the page's prefetchQuery key exactly (query.md).
    queryKey: usersKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: (prev, prevQuery) => (prevQuery ? prev : undefined),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

// Mutations are passthroughs (query.md) — no wrapper that throws on failure.
export function useCreateUser() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserRequest) => createUser(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: usersKeys.all() }),
  });
}

export function useUpdateUser() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserRequest }) =>
      updateUser(id, dto),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.id),
      });
    },
  });
}

export function useUpsertStudentProfile() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpsertStudentProfileRequest;
    }) => upsertStudentProfile(id, dto),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.id),
      });
    },
  });
}

export function useUpsertStaffProfile() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertStaffProfileRequest }) =>
      upsertStaffProfile(id, dto),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.id),
      });
    },
  });
}
