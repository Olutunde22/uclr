// The response envelope every ULCRS backend endpoint returns. Adapted from the
// nextjs-app skill's ApiResponse<T> template to the REAL envelope shape used by
// backend/src/common/interceptors/response.interceptor.ts and
// backend/src/common/filters/all-exceptions.filter.ts — NOT the skill's default
// `{ message, data }` shape.
//
// Success: { success: true, data, pagination? }
// Error:   { success: false, statusCode, message, error?, path, timestamp }

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ApiFailure {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  timestamp: string;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

// Services resolve with this shape (never throw for API failures — see
// lib/api-helpers.ts and the nextjs-app skill's data-layer.md). `message` is
// only populated on failure; a successful call has nothing to say beyond the
// data itself, so callers check `data` first.
export interface ApiResponse<T> {
  data: T | null;
  message?: string;
}

// Void operations (logout, delete, decide) — success `data` is null either
// way, so `ok` is the only meaningful signal.
export interface ApiResult {
  ok: boolean;
  message?: string;
}

// Mirrors backend/src/common/types.ts's Paginated<T>, but the pagination
// metadata rides in the envelope's `pagination` key, not inline with items.
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
