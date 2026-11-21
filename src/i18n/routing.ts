import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ko', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'ko',

  // 응답 헤더(Link)에 hreflang 을 붙이지 않는다. next-intl 이 붙이는 x-default 는 로케일 없는 주소
  // (/utilities/... → 308 리디렉션)를 가리켜 구글이 리디렉션 주소를 계속 크롤링했다.
  // hreflang 은 각 페이지 generateMetadata 의 alternates(HTML <head>, x-default=/ko/...)와 사이트맵으로 충분하다.
  alternateLinks: false
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
