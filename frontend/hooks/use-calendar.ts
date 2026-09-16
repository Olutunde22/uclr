'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { calendarKeys } from '@/hooks/keys';
import {
  createSemester,
  createSession,
  getSemesters,
  getSessions,
  setCurrentSemester,
  setCurrentSession,
  updateSemester,
  updateSemesterWindows,
  updateSession,
} from '@/services/calendar';
import type {
  CreateSemesterRequest,
  CreateSessionRequest,
  UpdateSemesterRequest,
  UpdateSemesterWindowsRequest,
  UpdateSessionRequest,
} from '@/types/calendar';

export function useSessions() {
  return useQuery({
    queryKey: calendarKeys.sessions(),
    queryFn: () => getSessions(),
  });
}

export function useSemesters(sessionId?: string) {
  return useQuery({
    queryKey: calendarKeys.semestersList(sessionId),
    queryFn: () => getSemesters(sessionId),
  });
}

// Mutations are passthroughs (query.md) — no wrapper that throws on failure.
// Every mutation invalidates the whole calendar branch: sessions and
// semesters both surface "current" flags that are global, single-row flips
// (backend/CLAUDE.md), so a narrower invalidation risks leaving a stale
// "current" badge on the sibling list.

export function useCreateSession() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSessionRequest) => createSession(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}

export function useUpdateSession() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSessionRequest }) =>
      updateSession(id, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}

export function useSetCurrentSession() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (id: string) => setCurrentSession(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}

export function useCreateSemester() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSemesterRequest) => createSemester(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}

export function useUpdateSemester() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSemesterRequest }) =>
      updateSemester(id, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}

export function useUpdateSemesterWindows() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateSemesterWindowsRequest;
    }) => updateSemesterWindows(id, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}

export function useSetCurrentSemester() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (id: string) => setCurrentSemester(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all() }),
  });
}
