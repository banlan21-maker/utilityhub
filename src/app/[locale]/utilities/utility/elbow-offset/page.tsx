import type { Metadata } from 'next';
import ElbowOffsetClient from './ElbowOffsetClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '배관 엘보 오프셋 계산기 — 직관 절단길이 즉시 계산 | Utility Hub'
    : 'Pipe Elbow Offset Calculator — Cut Length Instant Calc | Utility Hub';
  const description = isKo
    ? '배관 엘보 오프셋 거리와 직관 절단길이를 즉시 계산. 단순 오프셋·롤링 오프셋·절단길이 3가지 모드. 90°·45° 장단반경 엘보 지원. ASME B16.9 규격 데이터 적용. 현장 배관공 모바일 최적화.'
    : 'Calculate pipe elbow offset and cut length instantly. Three modes: simple offset, rolling offset, and cut length. Supports 90°/45° long & short radius elbows with ASME B16.9 spec data.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/elbow-offset`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/elbow-offset',
        en: 'https://www.theutilhub.com/en/utilities/utility/elbow-offset',
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
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '배관 엘보 오프셋 계산기',
  alternateName: 'Pipe Elbow Offset Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/elbow-offset',
  description:
    '배관 엘보 오프셋 거리와 직관 절단길이를 즉시 계산하는 무료 현장 도구. 단순·롤링 오프셋·절단길이 3가지 모드, 90°/45° 장단반경 엘보, ASME B16.9 규격 적용.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '테이크아웃(Take-out)이란 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '테이크아웃은 엘보의 중심점에서 파이프 접합면(끝단)까지의 거리입니다. 두 엘보 사이의 직관 길이를 구하려면 목표 거리에서 양쪽 테이크아웃을 빼야 합니다. 본 계산기는 ASME B16.9 표준 규격 데이터를 직접 적용해 약식 공식보다 정확한 수치를 제공합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '장반경(LR)과 단반경(SR) 엘보는 어떻게 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LR은 굽힘반경이 NPS의 1.5배로 유체 흐름이 완만하며 표준입니다. SR은 굽힘반경이 NPS와 같아 좁은 공간에 적합하지만 흐름 저항이 큽니다. 본 계산기는 SR 테이크아웃을 LR × 0.667 비율로 계산합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '롤링 오프셋은 언제 사용하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '배관이 수평·수직면을 동시에 이동해야 할 때 사용합니다. 가로·세로 이동거리를 입력하면 대각선 Travel, 기울기각, 절단길이가 자동 계산됩니다. 이 모드는 구조상 45° 엘보로만 동작합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '본 결과는 현장 참고용입니다. 엘보 제조사별로 실제 테이크아웃 공차가 있을 수 있으며, 나사식 엘보는 나사 물림 길이도 고려해야 합니다. 시공 전 반드시 실제 제품 치수와 현장 실측값을 확인하세요.',
      },
    },
  ],
};

export default function ElbowOffsetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ElbowOffsetClient />
    </>
  );
}
