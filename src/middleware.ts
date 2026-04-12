import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  const response = intlMiddleware(request) as NextResponse;
  // 현재 pathname을 헤더에 담아 서버 컴포넌트(generateMetadata)에서 읽을 수 있게 함
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/', '/(ko|en)/:path*'],
};
