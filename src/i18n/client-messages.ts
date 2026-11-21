// 브라우저로 보내는 번역 묶음 고르기.
//
// 번역 파일(messages/*.json) 전체를 NextIntlClientProvider 에 넘기면 모든 페이지 HTML 에 200KB 가까운 문구가 실린다
// (평수 계산기 페이지에 세금 계산기 문구까지). 그래서 화면 코드(useTranslations)가 실제로 쓰는 묶음만 보낸다.
//  - 공통(COMMON): 헤더·바닥글·홈·피드백처럼 여러 곳에서 쓰는 작은 묶음 → [locale]/layout.tsx
//  - 도구별: 그 도구 폴더의 layout.tsx 에서 <ScopedMessages namespaces={[...]}> 로 추가
// 서버 컴포넌트의 getTranslations 는 영향이 없다 (서버는 항상 전체를 가진다).
//
// 화면 코드에서 새 묶음을 쓰기 시작하면 scripts/check-client-messages.mjs 가 빌드를 멈춰 알려 준다.
export const COMMON_NAMESPACES = ['Index', 'Navigation', 'Categories', 'footer', 'Feedback'] as const;

type Messages = Record<string, unknown>;

export function pickMessages(all: Messages, extra: readonly string[] = []): Messages {
  const out: Messages = {};
  for (const ns of [...COMMON_NAMESPACES, ...extra]) {
    if (ns in all) out[ns] = all[ns];
  }
  return out;
}
