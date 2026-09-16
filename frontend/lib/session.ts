import 'server-only';

import { cache } from 'react';
import { getMe } from '@/services/auth';

// Request-scoped cache (decision gate answer 10): the session is read by BOTH
// `app/(app)/layout.tsx` (to build the permission-based sidebar) and by
// `lib/page-access.ts` / `lib/route-access.ts` on every page in the same
// render — textbook case for React's cache() per data-layer.md ("does a
// layout prefetch it AND a descendant page or guard call it directly?").
// Dedupes per request only; it is not a data cache and has no effect on
// client-side reads (those go through hooks/use-auth.ts's useSession query,
// which calls the same `getMe` service directly).
export const getSession = cache(getMe);
