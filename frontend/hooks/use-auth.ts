'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';
import { getQueryClient } from '@/app/get-query-client';
import { authKeys } from '@/hooks/keys';
import { getMe, logoutAction } from '@/services/auth';

// Must match the RSC prefetch key in app/(app)/layout.tsx exactly — see
// query.md's "keys are the contract".
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => getMe(),
  });
}

// Mutation is a passthrough (query.md: "no wrapper that throws on failure").
// logoutAction() always resolves (never throws) and always clears cookies in
// its own `finally`, whatever the API said (auth.md). The redirect and cache
// clear happen in onSettled — not onSuccess — so a user who clicks "log out"
// always ends up back at /login even if the backend call itself failed;
// their cookies are gone either way, so staying "logged in" client-side would
// just be a stale, broken session.
export function useLogout() {
  const router = useRouter();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: () => logoutAction(),
    onSettled: () => {
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });
}
