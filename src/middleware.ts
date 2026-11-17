import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const HOST = 'www.theutilhub.com';
const CATS = 'performance|document|finance|productivity|design|marketing|lifestyle|security|utility|dev';
const STATIC_PAGES = 'about|contact|feedback|privacy|terms|support';

/**
 * 옛 주소·로케일 없는 주소를 정식 경로로 바꾼다. 바꿀 필요가 없으면 null.
 * 규칙을 끝까지 적용한 최종 경로를 돌려주므로 리디렉션은 항상 한 번으로 끝난다.
 */
export function canonicalPath(input: string): string | null {
  let p = input.replace(/\/{2,}/g, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '');
  const rules: [RegExp, string][] = [
    // 로케일 없는 예전 주소 → 한국어
    [/^\/utilities(\/.*)?$/, '/ko/utilities$1'],
    [new RegExp(`^/(${STATIC_PAGES})$`), '/ko/$1'],
    // 과거 'ai' 카테고리는 marketing, 'ux'는 design으로 병합
    [/^\/(ko|en)\/ai(\/.*)?$/, '/$1/utilities/marketing'],
    [/^\/ai(\/.*)?$/, '/ko/utilities/marketing'],
    [/^\/(ko|en)\/ux(\/.*)?$/, '/$1/utilities/design'],
    [/^\/ux(\/.*)?$/, '/ko/utilities/design'],
    // /{locale}/{category}[/{tool}] → /{locale}/utilities/{category}[/{tool}]
    [new RegExp(`^/(ko|en)/(${CATS})(/[^/]+)?$`), '/$1/utilities/$2$3'],
    // 피드백 페이지가 디자인 도구 경로에도 중복으로 있던 것
    [/^\/(ko|en)\/utilities\/design\/feedback$/, '/$1/feedback'],
  ];
  for (let i = 0; i < 4; i++) {
    let changed = false;
    for (const [re, to] of rules) {
      if (re.test(p)) { p = p.replace(re, to); changed = true; }
    }
    if (!changed) break;
  }
  return p === input ? null : p;
}

export default function middleware(request: NextRequest): NextResponse {
  const host = (request.headers.get('host') || '').toLowerCase();
  const { pathname } = request.nextUrl;
  const isApex = host === 'theutilhub.com';

  // 파일·API·아이콘은 경로를 바꾸지 않는다 (www 없는 주소만 www로)
  const isAsset = /\.[a-z0-9]+$/i.test(pathname) || pathname.startsWith('/api') || pathname.startsWith('/_next')
    || pathname === '/icon' || pathname === '/apple-icon' || pathname.startsWith('/s/');
  const target = isAsset ? null : canonicalPath(pathname);

  // www 없는 주소·옛 주소·로케일 없는 주소 → 최종 주소로 한 번에 308
  if (isApex || target) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = HOST;
    url.port = '';
    url.pathname = target ?? pathname;
    return NextResponse.redirect(url, { status: 308 });
  }

  // 관리자 공간은 검색엔진에 노출하지 않는다
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  if (isAsset || !(pathname === '/' || /^\/(ko|en)(\/|$)/.test(pathname))) return NextResponse.next();

  // 루트(/)는 브라우저 언어에 따라 /ko·/en으로 가므로 임시(307) 이동이 맞다 (next-intl 기본)
  const response = intlMiddleware(request) as NextResponse;
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
