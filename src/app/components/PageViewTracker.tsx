'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/track';

/** 페이지 이동마다 한 번 조회를 기록한다 (화면에는 아무것도 그리지 않음) */
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);
  return null;
}
