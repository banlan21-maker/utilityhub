import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/utilities/:path*',
        destination: '/ko/utilities/:path*',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/ko/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/ko/contact',
        permanent: true,
      },
      {
        source: '/feedback',
        destination: '/ko/feedback',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/ko/privacy',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/ko/terms',
        permanent: true,
      },
      // 과거 'ai' 카테고리는 V4.3 리팩토링에서 marketing으로 병합됨.
      // 구글이 옛 색인 기억으로 /ko/ai, /en/ai를 재크롤하므로 marketing으로 영구 리디렉션(308).
      {
        source: '/:locale(ko|en)/ai/:path*',
        destination: '/:locale/utilities/marketing',
        permanent: true,
      },
      {
        source: '/:locale(ko|en)/ai',
        destination: '/:locale/utilities/marketing',
        permanent: true,
      },
      {
        source: '/ai/:path*',
        destination: '/ko/utilities/marketing',
        permanent: true,
      },
      {
        source: '/ai',
        destination: '/ko/utilities/marketing',
        permanent: true,
      },
      // 과거 'ux' 카테고리는 design으로 병합됨. 옛 색인 회수용 영구 리디렉션(308).
      {
        source: '/:locale(ko|en)/ux/:path*',
        destination: '/:locale/utilities/design',
        permanent: true,
      },
      {
        source: '/:locale(ko|en)/ux',
        destination: '/:locale/utilities/design',
        permanent: true,
      },
      {
        source: '/ux/:path*',
        destination: '/ko/utilities/design',
        permanent: true,
      },
      {
        source: '/ux',
        destination: '/ko/utilities/design',
        permanent: true,
      },
      // /{locale}/{category} → /{locale}/utilities/{category}
      {
        source: '/:locale(ko|en)/:cat(performance|document|finance|productivity|design|marketing|lifestyle|security|utility|dev)',
        destination: '/:locale/utilities/:cat',
        permanent: true,
      },
      // /{locale}/{category}/{tool} → /{locale}/utilities/{category}/{tool}
      {
        source: '/:locale(ko|en)/:cat(performance|document|finance|productivity|design|marketing|lifestyle|security|utility|dev)/:tool',
        destination: '/:locale/utilities/:cat/:tool',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
