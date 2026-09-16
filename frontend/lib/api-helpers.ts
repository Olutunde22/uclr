import { AxiosError } from 'axios';
import type { ApiFailure } from '@/types/api';

export const API_TIMEOUTS = {
  default: 10_000,
  refresh: 5_000,
  upload: 60_000,
} as const;

// The ONLY place that inspects an error's shape (data-layer.md). Inlining
// `(error as AxiosError)?.response?.data?.message` at call sites skips the
// timeout/network branches below — grep for that pattern during any audit.
//
// Adapted to ULCRS's real error envelope (all-exceptions.filter.ts):
//   { success: false, statusCode, message, error?, path, timestamp }
// `message` is either a plain string (e.g. "Invalid credentials") or a
// class-validator array (400s from ValidationPipe, e.g.
// ["email must be an email"]) — never the skill template's separate
// `errors: Record<string, string[]>` map, because Nest's ValidationPipe
// doesn't group by field by default.
export function handleAPIErrors(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiFailure>;

  if (axiosError?.code === 'ECONNABORTED' || axiosError?.code === 'ETIMEDOUT') {
    return 'This is taking longer than expected. Please try again.';
  }

  if (axiosError?.code === 'ERR_NETWORK' || !axiosError?.response) {
    return "Can't reach the server. Check your connection and try again.";
  }

  const apiMessage = axiosError.response?.data?.message;
  if (Array.isArray(apiMessage) && apiMessage.length > 0) return apiMessage[0];
  if (typeof apiMessage === 'string' && apiMessage) return apiMessage;

  return fallback;
}

// Same mapping, but returns every validation message rather than just the
// first — used by the login form so a bad payload shows all field problems.
export function getAllErrorMessages(
  error: unknown,
  fallback: string,
): string[] {
  const axiosError = error as AxiosError<ApiFailure>;
  const apiMessage = axiosError?.response?.data?.message;
  if (Array.isArray(apiMessage) && apiMessage.length > 0) return apiMessage;
  if (typeof apiMessage === 'string' && apiMessage) return [apiMessage];
  return [fallback];
}
