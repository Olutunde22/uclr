import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/lib/auth-cookies';

const REFRESH_WINDOW_MS = 30_000;

// Decode `exp` without verifying the signature — the API is the authority
// (auth.md). Undecodable tokens pass through untouched rather than throwing.
function jwtExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function loginRedirect(request: NextRequest) {
  const url = new URL('/login', request.url);
  if (request.nextUrl.pathname !== '/') {
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
  }
  const response = NextResponse.redirect(url);
  response.cookies.delete(ACCESS_TOKEN);
  response.cookies.delete(REFRESH_TOKEN);
  return response;
}

// Middleware owns PROACTIVE refresh (auth.md's two-tier refresh). It is the
// only place cookies can always be written — Server Components cannot write
// cookies during render (see lib/api-client.ts's tryPersistSetCookie).
//
// Note this is a *belt-and-braces* refresh on top of the backend's own
// in-guard self-heal (JwtAuthGuard silently mints a fresh pair when an
// expired access token arrives with a valid refresh cookie — see
// backend/CLAUDE.md's Auth section). Both layers matter for different
// reasons: the in-guard heal covers every backend call (including the
// browser calling the backend directly per browser-client.ts), while this
// middleware avoids a page even *starting* to render with a token that's
// about to expire mid-request, and is the only layer that can redirect a
// dead GET session to /login before any React render begins.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN)?.value;
  const isAuthed = !!accessToken || !!refreshToken;

  // Redirect authenticated users away from /login.
  if (pathname === '/login') {
    return isAuthed
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next();
  }

  // Redirect unauthenticated requests to /login for every other (protected) route.
  if (!accessToken && !refreshToken) return loginRedirect(request);

  const expiry = accessToken ? jwtExpiryMs(accessToken) : null;
  const needsRefresh =
    !accessToken ||
    (expiry !== null && expiry - Date.now() < REFRESH_WINDOW_MS);

  if (!needsRefresh || !refreshToken) return NextResponse.next();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Middleware's fetch is a same-server-to-backend call, a different
        // origin from the incoming browser request — cookies aren't
        // forwarded automatically, so the refresh cookie is set explicitly.
        Cookie: `${REFRESH_TOKEN}=${refreshToken}`,
      },
      body: '{}',
    });

    // Refresh token rejected = dead session. GET only: a 307 on a
    // server-action POST would replay the POST against the login route.
    if (res.status === 401 || res.status === 403) {
      return request.method === 'GET'
        ? loginRedirect(request)
        : NextResponse.next();
    }

    if (!res.ok) return NextResponse.next(); // 5xx: fail open, client retries

    const body = (await res.json().catch(() => null)) as {
      data?: { access_token?: string };
    } | null;
    const token = body?.data?.access_token;
    if (!token) return NextResponse.next();

    // Write to BOTH the forwarded request headers (so RSC reads in this same
    // request use the new token) and the response.
    const headers = new Headers(request.headers);
    headers.set(
      'cookie',
      `${ACCESS_TOKEN}=${token}; ${REFRESH_TOKEN}=${refreshToken}`,
    );
    const response = NextResponse.next({ request: { headers } });
    response.cookies.set(ACCESS_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.next(); // network error: fail open, not a dead session
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
};
