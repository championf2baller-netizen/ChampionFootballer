import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // COMPLETE AUTH BYPASS - Let all admin & auth routes pass through
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Add this condition to your middleware
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  const rawToken = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value;
  const token =
    typeof rawToken === 'string' &&
      rawToken !== 'undefined' &&
      rawToken !== 'null' &&
      rawToken.split('.').length === 3
      ? rawToken
      : undefined;

  // Public routes
  const publicAlwaysPaths = ['/about', '/terms', '/privacy', '/contact', '/join-league']; // always accessible (no redirect even if logged-in)
  const publicRedirectPaths = ['/', '/login', '/register']; // redirect to /home if logged-in
  const publicPaths = [...publicAlwaysPaths, ...publicRedirectPaths];

  // If user has token and tries to access auth landing pages, redirect to home
  if (publicRedirectPaths.includes(pathname) && token) {
    const redirectUrl = new URL('/home', request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // If user tries to access protected page without token, redirect to landing page (preserving search params)
  if (!publicPaths.includes(pathname) && !token) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
