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
    ? '케이블 트레이 경사 계산기 | Utility Hub'
    : 'Cable Tray Slope Calculator | Utility Hub';
  const description = isKo
    ? '전기공사 현장에서 케이블 트레이 사선 길이, 경사각, 행거 간격을 즉시 계산. 엘보 규격 자동 추천 포함. 수직 구간(Vertical Riser) 지원.'
    : 'Calculate cable tray slope length, angle, and hanger spacing instantly for electrical construction sites. Includes automatic elbow size recommendation and vertical riser support.';
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
  name: '케이블 트레이 경사 계산기',
  alternateName: 'Cable Tray Slope Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/cable-tray-calc',
  description:
    '전기공사 현장에서 케이블 트레이 사선 길이, 경사각, 행거 간격을 즉시 계산. 엘보 규격 자동 추천 포함. 수직 구간(Vertical Riser) 지원.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '탭을 전환하면 입력값이 초기화되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아닙니다. 시작 높이, 끝 높이, 수평 거리는 세 탭 모두 동일한 값을 공유합니다. 한 탭에서 입력한 값은 다른 탭으로 전환해도 그대로 유지되므로 중복 입력할 필요가 없습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수직 상승/하강 구간(Vertical Riser)도 계산되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 지원합니다. 수평 거리(L)에 0을 입력하면 90° 수직 구간으로 자동 처리됩니다. 수직 구간에서는 사선 길이가 높이 차와 동일하게 계산되며, 엘보 규격 추천 대신 수직 구간 안내가 표시됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '행거 간격 기준은 어떤 규정을 따르나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '행거 간격은 KEC(한국전기설비규정) 및 현장 실무 기준을 바탕으로 트레이 폭, 경사각, 설치 환경을 종합해 산출합니다. 최종 간격은 반드시 현장 감리 및 설계 기준과 대조하여 확인하시기 바랍니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 시공 시에는 반드시 설계도서, 감리 지침, KEC 규정을 기준으로 확인하시기 바랍니다.',
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
