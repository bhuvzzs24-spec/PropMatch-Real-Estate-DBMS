import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/utils/constants';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login and registration must always be accessible.
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // APIs handle authentication themselves.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Every other website page requires a session.
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run proxy on all application pages.
     * API and Next.js internal paths are skipped above.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
