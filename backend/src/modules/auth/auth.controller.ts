import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppConfig } from '../../config/configuration';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { setAuthCookies, clearAuthCookies } from './cookies';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';
import { extractRequestContext } from '../../common/request-context';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly auditService: AuditService,
  ) {}
  private cookieConfig() {
    return {
      cookieSecure: this.config.get('cookieSecure', { infer: true }),
      cookieDomain: this.config.get('cookieDomain', { infer: true }),
      cookieNames: this.config.get('cookieNames', { infer: true }),
      jwt: this.config.get('jwt', { infer: true }),
    };
  }
  private cookieNames(): {
    access: string;
    refresh: string;
  } {
    return this.config.get('cookieNames', { infer: true });
  }
  private cookieDomain(): string | undefined {
    return this.config.get('cookieDomain', { infer: true });
  }
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiOperation({
    summary: 'Log in with email, matric no. or staff ID, and password',
  })
  async login(
    @Req()
    req: Request,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const user = req.user as User;
    const tokens = await this.authService.login(user);
    setAuthCookies(res, tokens, this.cookieConfig());
    await this.auditService.record({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      outcome: 'success',
      ...extractRequestContext(req),
    });
    return this.usersService.toAuthenticatedUser(user);
  }
  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Exchange a refresh-token cookie for a new access token',
  })
  async refresh(
    @Req()
    req: Request,
    @Res({ passthrough: true })
    res: Response,
    @Body()
    body: {
      refresh_token?: string;
    },
  ) {
    const fromCookie = req.cookies?.[this.cookieNames().refresh] as
      string | undefined;
    const refreshToken = fromCookie ?? body?.refresh_token;
    try {
      const tokens = await this.authService.refresh(refreshToken);
      setAuthCookies(res, tokens, this.cookieConfig());
      this.logger.log(
        `Access token refreshed (refresh token from ${fromCookie ? 'cookie' : 'body'})`,
      );
      return { refreshed: true, access_token: tokens.accessToken };
    } catch (err) {
      this.logger.error(
        `Token refresh failed: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
      clearAuthCookies(res, this.cookieNames(), this.cookieDomain());
      throw err;
    }
  }
  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out and clear auth cookies' })
  async logout(
    @Req()
    req: Request,
    @Res({ passthrough: true })
    res: Response,
  ) {
    clearAuthCookies(res, this.cookieNames(), this.cookieDomain());
    await this.auditService.record({
      action: 'auth.logout',
      outcome: 'success',
      ...extractRequestContext(req),
    });
    return { loggedOut: true };
  }
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user, roles and permissions' })
  me(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return user;
  }
}
