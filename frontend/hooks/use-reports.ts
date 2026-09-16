'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsKeys } from '@/hooks/keys';
import { getDepartmentReport, getSystemReport } from '@/services/reports';

export function useDepartmentReport(semesterId?: string, departmentId?: string) {
  return useQuery({
    queryKey: reportsKeys.department(semesterId, departmentId),
    queryFn: () => getDepartmentReport(semesterId as string, departmentId),
    enabled: !!semesterId,
  });
}

export function useSystemReport(semesterId?: string) {
  return useQuery({
    queryKey: reportsKeys.system(semesterId),
    queryFn: () => getSystemReport(semesterId),
  });
}
