import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      url?: string;
    }>();
    const isHealth = req?.url?.includes('/health') ?? false;
    return next.handle().pipe(
      map((value) => {
        if (isHealth) return value;
        if (
          value &&
          typeof value === 'object' &&
          Array.isArray(
            (
              value as {
                items?: unknown;
              }
            ).items,
          )
        ) {
          const { items, ...pagination } = value as Record<string, unknown> & {
            items: unknown[];
          };
          return { success: true, data: items, pagination };
        }
        return { success: true, data: value ?? null };
      }),
    );
  }
}
