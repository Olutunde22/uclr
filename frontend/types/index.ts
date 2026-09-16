// Mirrors backend/src/common/types.ts's AuthenticatedUser exactly — this is
// the shape `GET /api/auth/me` returns and the client/server session source
// of truth (see PLAN.md decision gate answer 5).
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export * from './api';
export * from './users';
export * from './academics';
export * from './settings';
export * from './audit';
export * from './calendar';
export * from './fees';
