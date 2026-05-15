import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  const host = request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'https';

  // non-www → www 강제 리디렉션 (production만)
  if (host === 'theutilhub.com') {
    const url = new URL(request.url);
    url.host = 'www.theutilhub.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // HTTP → HTTPS 강제 (production만)
  if (proto === 'http' && host.includes('theutilhub.com')) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = 'www.theutilhub.com';
    return NextResponse.redirect(url, 301);
  }

  const response = intlMiddleware(request) as NextResponse;
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/', '/(ko|en)/:path*'],
};
