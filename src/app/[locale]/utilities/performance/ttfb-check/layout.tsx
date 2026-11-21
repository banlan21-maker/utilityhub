// 이 도구의 화면 코드가 쓰는 번역 묶음만 브라우저로 보낸다 (scripts/check-client-messages.mjs 가 검사)
import type { ReactNode } from 'react';
import ScopedMessages from '@/app/components/ScopedMessages';

export default function Layout({ children }: { children: ReactNode }) {
  return <ScopedMessages namespaces={['Ttfb']}>{children}</ScopedMessages>;
}
