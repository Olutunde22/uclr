import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppConfig } from '../../config/configuration';
import { AuthService } from '../../modules/auth/auth.service';
import { UsersService } from '../../modules/users/users.service';
import { setAuthCookies } from '../../modules/auth/cookies';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      if (await this.tryRefresh(context)) {
        return true;
      }
      throw err;
    }
  }
  private async tryRefresh(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const cookieName = this.config.get('cookieNames', { infer: true }).refresh;
    const refreshToken = req.cookies?.[cookieName] as string | undefined;
    if (!refreshToken) {
      this.logger.warn(
        `${req.method} ${req.originalUrl}: access token rejected and no "${cookieName}" cookie to refresh from`,
      );
      return false;
    }
    try {
      const { tokens, user } =
        await this.authService.refreshSession(refreshToken);
      setAuthCookies(res, tokens, {
        cookieSecure: this.config.get('cookieSecure', { infer: true }),
        cookieDomain: this.config.get('cookieDomain', { infer: true }),
        cookieNames: this.config.get('cookieNames', { infer: true }),
        jwt: this.config.get('jwt', { infer: true }),
      });
      req.user = this.usersService.toAuthenticatedUser(user);
      this.logger.log(
        `${req.method} ${req.originalUrl}: access token refreshed in-guard for ${user.email}`,
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `${req.method} ${req.originalUrl}: in-guard refresh failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }
}
