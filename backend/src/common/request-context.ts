import { Request } from 'express';
export interface RequestContext {
  ip?: string;
  userAgent?: string;
}
export function extractRequestContext(req: Request): RequestContext {
  const forwarded = req.headers['x-forwarded-for'];
  const proxyIp =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ??
    req.ip ??
    req.socket?.remoteAddress;
  return {
    ip: proxyIp?.trim(),
    userAgent: req.headers['user-agent'],
  };
}
