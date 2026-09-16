'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import { settingsKeys } from '@/hooks/keys';
import { getSettings, updateSetting } from '@/services/settings';

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.list(),
    queryFn: () => getSettings(),
  });
}

export function useUpdateSetting() {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: settingsKeys.all() }),
  });
}
