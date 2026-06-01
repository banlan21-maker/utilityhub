import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  const host = request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'https';

  // 경로 내 슬래시 중복(//) 정규화 → 단일 슬래시로 308 영구 리디렉션.
  // 과거 카테고리 목록 링크가 /ko//utilities/... 형태로 렌더링되어
  // 색인된 잘못된 URL을 정식 URL(/ko/utilities/...)로 회수한다.
  const { pathname } = request.nextUrl;
  if (pathname.includes('//')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/{2,}/g, '/');
    return NextResponse.redirect(url, { status: 308 });
  }

  // non-www → www 강제 리디렉션 (production만)
  // 308 = Permanent Redirect (메소드 보존). Next.js App Router에서는
  // 두 번째 인자가 ResponseInit이므로 status 명시 객체 형태로 전달해야
  // 실제 응답 코드가 308로 나간다 (그냥 301/308 숫자 전달은 무시되어 307로 처리됨).
  if (host === 'theutilhub.com') {
    const url = new URL(request.url);
    url.host = 'www.theutilhub.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 308 });
  }

  // HTTP → HTTPS 강제 (production만)
  if (proto === 'http' && host.includes('theutilhub.com')) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = 'www.theutilhub.com';
    return NextResponse.redirect(url, { status: 308 });
  }

  const response = intlMiddleware(request) as NextResponse;
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/', '/(ko|en)/:path*'],
};
