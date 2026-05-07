import type { Metadata } from 'next';
import CableTrayCalcClient from './CableTrayCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '케이블 트레이 경사 & 가공 계산기 | Utility Hub'
    : 'Cable Tray Slope & Fabrication Calculator | Utility Hub';
  const description = isKo
    ? '케이블 트레이 V-컷 절단폭, 타공 위치, 사선 길이, 행거 간격을 즉시 계산. SVG 가공 도면으로 현장에서 바로 마킹. 30·45·60도 프리셋 지원.'
    : 'Calculate V-cut dimensions, bolt hole positions, slope length, and hanger spacing for cable tray field fabrication. SVG layout for on-site marking.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/cable-tray-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/cable-tray-calc',
        en: 'https://www.theutilhub.com/en/utilities/utility/cable-tray-calc',
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
  name: '케이블 트레이 경사 & 가공 계산기',
  alternateName: 'Cable Tray Slope & Fabrication Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/cable-tray-calc',
  description:
    '케이블 트레이 V-컷 절단폭, 타공 위치, 사선 길이, 행거 간격을 즉시 계산. SVG 가공 도면으로 현장에서 바로 마킹. 30·45·60도 프리셋 지원.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'V-컷 공식이 상하 꺾임과 좌우 꺾임에서 왜 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '상하 꺾임은 트레이 옆면(레일)에 V-컷을 넣기 때문에 기준 치수가 옆면 높이(보통 100mm)이고, 좌우 꺾임은 트레이 상면 폭 전체에 V-컷을 넣기 때문에 기준 치수가 트레이 폭(예: 200mm)입니다. 공식은 기준치수 × tan(각도/2)로 동일하지만 입력 치수가 달라 결과가 크게 차이납니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수직 구간(L=0)도 계산되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 지원합니다. 수동 모드에서 수평 거리(L)에 0을 입력하면 90° 수직 구간으로 자동 처리됩니다. 수직 구간은 V-컷 가공이 불필요하며, 직각 절단 후 별도 수직 연결구를 사용하도록 안내됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '행거 간격 기준은 어떤 규정을 따르나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '행거 간격은 KEC(한국전기설비규정) 실무 기준을 바탕으로 트레이 폭별 기본 간격에 경사각 계수(0.40~1.0)와 환경 계수(실내 1.0, 실외 0.8, 진동 0.7)를 곱해 산출합니다. 최종 간격은 반드시 현장 감리 및 설계 기준과 대조하여 확인하시기 바랍니다.',
      },
    },
    {
      '@type': 'Question',
      name: '45° 초과 각도를 선택하면 어떻게 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '45°를 초과하는 각도는 단일 V-컷 가공이 구조적으로 어렵습니다. 도구는 V-컷 수치를 계산하되 주황색 경고 박스로 45° 2회 분할 시공을 권장합니다. V-컷 전체 폭이 기준 치수의 80%를 초과하면 재료 약화 경고도 별도로 표시됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 현장 참고용으로만 제공됩니다. 실제 시공 시에는 반드시 설계도서, 감리 지침, KEC 규정을 기준으로 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function CableTrayCalcPage() {
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
      <CableTrayCalcClient />
    </>
  );
}
