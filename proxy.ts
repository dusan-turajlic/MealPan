import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/locales';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect bare root
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  // Redirect legacy /meals/plans/* paths
  if (pathname.startsWith('/meals/plans/')) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url));
  }

  // Validate first segment
  const firstSegment = pathname.split('/')[1];
  if (firstSegment && !isValidLocale(firstSegment)) {
    const rest = pathname.split('/').slice(2).join('/');
    const redirectPath = rest ? `/${DEFAULT_LOCALE}/${rest}` : `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Stamp locale header for root layout
  const locale = isValidLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
  const res = NextResponse.next();
  res.headers.set('x-locale', locale);
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest).*)'],
};
