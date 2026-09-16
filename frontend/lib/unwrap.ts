import type { AxiosResponse } from 'axios';
import type { ApiEnvelope, ApiResponse, Paginated } from '@/types/api';

// serverApi is configured with `validateStatus: () => true` (see
// lib/api-client.ts) so a 4xx/5xx never throws — it arrives here as an
// ordinary response with `success: false`. This turns that raw envelope into
// the ApiResponse<T> shape every service resolves with (data-layer.md:
// "services never throw for API failures").
export function unwrap<T>(
  response: AxiosResponse<ApiEnvelope<T>>,
  fallback: string,
): ApiResponse<T | null> {
  const body = response.data;
  if (body.success) {
    return { data: body.data };
  }
  const message = Array.isArray(body.message) ? body.message[0] : body.message;
  return { data: null, message: message || fallback };
}

// Same idea as unwrap(), for list endpoints whose success envelope carries
// `data` as the bare items array and pagination metadata in the envelope's
// sibling `pagination` key (response.interceptor.ts spreads
// `{ items, ...rest }` that way) rather than nesting it inside `data`. Some
// list services (e.g. GET /audit) don't echo `page`/`pageSize` back at all —
// callers pass their own request `page`/`pageSize` as a fallback so the
// admin pages listed below never invent them.
export function unwrapPaginated<T>(
  response: AxiosResponse<ApiEnvelope<T[]>>,
  fallback: string,
  requested?: { page?: number; pageSize?: number },
): ApiResponse<Paginated<T> | null> {
  const body = response.data;
  if (body.success) {
    const pagination = body.pagination;
    const items = body.data;
    return {
      data: {
        items,
        total: pagination?.total ?? items.length,
        page: pagination?.page ?? requested?.page ?? 1,
        pageSize: pagination?.pageSize ?? requested?.pageSize ?? items.length,
      },
    };
  }
  const message = Array.isArray(body.message) ? body.message[0] : body.message;
  return { data: null, message: message || fallback };
}
