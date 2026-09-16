import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionKey } from '../permissions';
import { AuthenticatedUser } from '../types';
import { AuditService } from '../../modules/audit/audit.service';
import { extractRequestContext } from '../request-context';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    const granted = new Set(user?.permissions ?? []);
    const missing = required.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      const ctx = extractRequestContext(request);
      await this.auditService.record({
        actorUserId: user?.id,
        actorEmail: user?.email,
        action: `${request.method} ${request.route?.path ?? request.url}`,
        outcome: 'denied',
        summary: `Missing permission(s): ${missing.join(', ')}`,
        metadata: { required, missing },
        ...ctx,
      });
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
