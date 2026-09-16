import { Response } from 'express';
import { AppConfig } from '../../config/configuration';
export function setAuthCookies(
  res: Response,
  tokens: {
    accessToken: string;
    refreshToken?: string;
  },
  config: Pick<
    AppConfig,
    'cookieSecure' | 'cookieDomain' | 'cookieNames' | 'jwt'
  >,
): void {
  const secure = config.cookieSecure;
  const base = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    domain: config.cookieDomain,
  };
  res.cookie(config.cookieNames.access, tokens.accessToken, {
    ...base,
    maxAge: config.jwt.accessTtl * 1000,
  });
  if (tokens.refreshToken) {
    res.cookie(config.cookieNames.refresh, tokens.refreshToken, {
      ...base,
      maxAge: config.jwt.refreshTtl * 1000,
    });
  }
}
export function clearAuthCookies(
  res: Response,
  names: {
    access: string;
    refresh: string;
  },
  domain?: string,
): void {
  res.clearCookie(names.access, { path: '/', domain });
  res.clearCookie(names.refresh, { path: '/', domain });
}
