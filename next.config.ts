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
      {
        source: '/ai/:path*',
        destination: '/ko',
        permanent: true,
      },
      {
        source: '/ai',
        destination: '/ko',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
