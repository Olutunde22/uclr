import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_KEY, AuditMeta } from '../../common/decorators/audit.decorator';
import { AuthenticatedUser } from '../../common/types';
import { extractRequestContext } from '../../common/request-context';
import { AuditService } from './audit.service';
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditMeta>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!meta) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    const reqCtx = extractRequestContext(request);
    const resourceId = meta.resourceIdParam
      ? request.params?.[meta.resourceIdParam]
      : undefined;
    return next.handle().pipe(
      tap({
        next: () => {
          void this.auditService.record({
            actorUserId: user?.id,
            actorEmail: user?.email,
            action: meta.action,
            resourceType: meta.resourceType,
            resourceId,
            outcome: 'success',
            ...reqCtx,
          });
        },
        error: (err: Error) => {
          void this.auditService.record({
            actorUserId: user?.id,
            actorEmail: user?.email,
            action: meta.action,
            resourceType: meta.resourceType,
            resourceId,
            outcome: 'error',
            summary: err?.message,
            ...reqCtx,
          });
        },
      }),
    );
  }
}
