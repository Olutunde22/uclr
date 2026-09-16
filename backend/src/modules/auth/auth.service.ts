import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { verifyPassword } from '../../common/password';
import { AccessTokenPayload, RefreshTokenPayload } from './auth.constants';
export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}
  async validateCredentials(
    identifier: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user || !user.isActive) return null;
    const ok = await verifyPassword(password, user.passwordHash);
    return ok ? user : null;
  }
  issueTokens(user: User): IssuedTokens {
    const jwtCfg = this.config.get('jwt', { infer: true });
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email } as AccessTokenPayload,
      { secret: jwtCfg.accessSecret, expiresIn: jwtCfg.accessTtl },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id } as RefreshTokenPayload,
      { secret: jwtCfg.refreshSecret, expiresIn: jwtCfg.refreshTtl },
    );
    return { accessToken, refreshToken };
  }
  async login(user: User): Promise<IssuedTokens> {
    await this.usersService.markLogin(user.id);
    return this.issueTokens(user);
  }
  async refreshSession(refreshToken: string | undefined): Promise<{
    tokens: IssuedTokens;
    user: User;
  }> {
    if (!refreshToken) {
      this.logger.warn('Refresh attempt with missing refresh token');
      throw new UnauthorizedException('Missing refresh token');
    }
    const jwtCfg = this.config.get('jwt', { infer: true });
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwt.verify<RefreshTokenPayload>(refreshToken, {
        secret: jwtCfg.refreshSecret,
      });
    } catch (err) {
      this.logger.warn(
        `JWT verification failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      this.logger.warn(
        `Refresh attempt for inactive or missing user: ${payload.sub}`,
      );
      throw new UnauthorizedException('Account is not active');
    }
    return { tokens: this.issueTokens(user), user };
  }
  async refresh(refreshToken: string | undefined): Promise<IssuedTokens> {
    return (await this.refreshSession(refreshToken)).tokens;
  }
}
