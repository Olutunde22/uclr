'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/lib/auth-cookies';
import type { ApiEnvelope, ApiResponse, ApiResult } from '@/types/api';
import type { AuthenticatedUser } from '@/types';

// getMe(): the "use server" service backing both the RSC session read
// (lib/session.ts wraps this logic directly against serverApi for the
// request-cached server path) and the client-side useSession query in
// hooks/use-auth.ts. Follows data-layer.md exactly: rethrow redirects first,
// map every other failure through the shared error mapper, and resolve
// rather than throw.
export async function getMe(): Promise<ApiResponse<AuthenticatedUser | null>> {
  try {
    const response =
      await serverApi.get<ApiEnvelope<AuthenticatedUser>>('/auth/me');
    return unwrap(response, 'Failed to load session');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load session'),
    };
  }
}

// Deliberate exception to "services never throw" (auth.md: "Login and
// OAuth-callback handlers may throw rather than returning the result
// envelope, because their callers drive error UI from a caught error").
// Converting this to the envelope means a failed login would fall through to
// the success redirect instead of showing the form's error state.
export async function loginAction(
  identifier: string,
  password: string,
): Promise<void> {
  let response;
  try {
    // The backend's LoginDto field is literally named `email`, even though it
    // accepts email, matric no. or staff ID (UsersService.findByIdentifier
    // resolves all three) — see backend/src/modules/auth/dto/login.dto.ts.
    response = await serverApi.post<ApiEnvelope<AuthenticatedUser>>(
      '/auth/login',
      {
        email: identifier,
        password,
      },
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(
      handleAPIErrors(error, 'Unable to log in. Please try again.'),
    );
  }

  if (!response.data.success) {
    const raw = response.data.message;
    const message = Array.isArray(raw) ? raw[0] : raw;
    throw new Error(message || 'Invalid identifier or password.');
  }

  // The backend's Set-Cookie headers were already persisted onto this
  // request's cookie jar by serverApi's response interceptor (this runs
  // inside a Server Action, so that write is not best-effort here — it's a
  // real mutable cookie context).
  redirect('/');
}

// Deliberately resolves rather than throwing (unlike loginAction): the
// logout mutation hook (hooks/use-auth.ts) always redirects regardless of
// outcome, driven from onSettled, not from a caught error — see that file's
// comment. Cookies are cleared in `finally` no matter what the backend says,
// per auth.md's "logout must always clear the session" rule: an early return
// that leaves cookies intact on a failed API call is the worst failure mode.
export async function logoutAction(): Promise<ApiResult> {
  try {
    await serverApi.post('/auth/logout');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: handleAPIErrors(error, 'Failed to log out') };
  } finally {
    const store = await cookies();
    store.delete(ACCESS_TOKEN);
    store.delete(REFRESH_TOKEN);
  }
}
