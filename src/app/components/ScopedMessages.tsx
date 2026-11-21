// 도구 폴더의 layout.tsx 에서 쓴다: 이 도구의 화면 코드가 쓰는 번역 묶음만 브라우저로 보낸다.
// (안쪽 Provider 가 바깥 것을 대신하므로 공통 묶음도 함께 넣는다 — src/i18n/client-messages.ts)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pickMessages } from '@/i18n/client-messages';

export default async function ScopedMessages({ namespaces, children }: { namespaces: readonly string[]; children: ReactNode }) {
  const all = await getMessages();
  return <NextIntlClientProvider messages={pickMessages(all, namespaces)}>{children}</NextIntlClientProvider>;
}
