import type { Metadata } from 'next';
import TtfbClient from './TtfbClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'TTFB 속도 테스터 | Utility Hub'
    : 'TTFB Speed Tester | Utility Hub';
  const description = isKo
    ? 'URL을 입력하면 서버 첫 응답 시간(TTFB)을 밀리초 단위로 즉시 측정하고 Core Web Vitals 기준 등급을 제공하는 무료 온라인 도구입니다.'
    : 'Instantly measure server TTFB (Time To First Byte) in milliseconds for any URL. Free online tool with Google Core Web Vitals grading.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/performance/ttfb-check`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/performance/ttfb-check',
        en: 'https://www.theutilhub.com/en/utilities/performance/ttfb-check',
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Utility Hub',
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TTFB 속도 테스터',
  alternateName: 'TTFB Speed Tester',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/performance/ttfb-check',
  description: 'URL을 입력하면 서버 첫 응답 시간(TTFB)을 밀리초 단위로 즉시 측정하고 Google Core Web Vitals 기준으로 등급을 제공하는 무료 온라인 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'TTFB는 몇 ms 이하여야 좋은 건가요?',
      acceptedAnswer: { '@type': 'Answer', text: "구글 권장 기준: 200ms 이하는 '양호(Good)', 200~500ms는 '보통(Needs Improvement)', 500ms 초과는 '개선 필요(Poor)'입니다. 국내 서버 기준 100ms 이하가 이상적입니다." },
    },
    {
      '@type': 'Question',
      name: 'TTFB가 높을 때 원인과 해결책은 무엇인가요?',
      acceptedAnswer: { '@type': 'Answer', text: '주요 원인: 서버 처리 속도 저하, 느린 데이터베이스 쿼리, CDN 미사용, 높은 서버 부하입니다. 해결책: CDN 도입, 서버 캐싱 적용, 데이터베이스 쿼리 최적화, 더 빠른 호스팅으로 이전을 고려하세요.' },
    },
    {
      '@type': 'Question',
      name: '매번 측정 결과가 조금씩 다른 이유는 무엇인가요?',
      acceptedAnswer: { '@type': 'Answer', text: '네트워크 경로, 서버 부하, DNS 조회 시간 등이 매 요청마다 달라질 수 있습니다. 동일한 URL을 3~5회 반복 측정해 평균값을 기준으로 판단하는 것을 권장합니다.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function TtfbPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <TtfbClient />
    </>
  );
}
