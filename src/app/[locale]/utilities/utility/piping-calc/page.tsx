import type { Metadata } from 'next';
import PipingCalcClient from './PipingCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '배관 종합 계산기 — 규격 조회·구배·수압 테스트 | Utility Hub'
    : 'Piping Calculator — Spec Lookup, Slope & Hydro Test | Utility Hub';
  const description = isKo
    ? '강관·스테인리스관 KS 규격 즉시 조회, 배관 구배 단차 계산, 수압 테스트 물량 산출. 현장 작업자를 위한 모바일 최적화 배관 계산기.'
    : 'Instantly look up KS pipe specs, calculate slope drop, and estimate water volume for hydro testing. Mobile-optimized for field workers.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/piping-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/piping-calc',
        en: 'https://www.theutilhub.com/en/utilities/utility/piping-calc',
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
  name: '배관 종합 계산기',
  alternateName: 'Piping Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/piping-calc',
  description:
    '강관·스테인리스관 KS 규격 즉시 조회, 배관 구배 단차 계산, 수압 테스트 물량 산출. 현장 작업자를 위한 모바일 최적화 배관 계산기.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '탄소강관과 스테인리스강관의 규격이 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '동일한 호칭경(예: 100A)이라도 재질에 따라 두께가 다릅니다. 스테인리스강관은 인장강도가 높아 동일한 스케줄 번호라도 탄소강관보다 두께가 얇습니다. 스테인리스강관의 스케줄에는 "S"가 붙어 SCH10S, SCH40S로 구분합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '구배 계산에서 경사율 1/100은 어떤 의미인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경사율 1/100은 배관 100mm 길이당 1mm의 높이 차이가 생긴다는 뜻입니다. 10m 배관이라면 끝점이 시작점보다 100mm 낮아야 합니다. 오수관은 1/50~1/100, 우수관은 1/100~1/200, 에어컨 드레인은 1/100 이상이 표준입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수압 테스트 물량 계산 시 SCH40 내경을 기준으로 하는 이유는 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '수압 테스트에서 가장 많이 사용하는 SCH40 기준으로 계산하면 실제와 큰 차이가 없습니다. 여유율(10~20%)을 적용하므로 스케줄 차이에 의한 오차는 충분히 흡수됩니다. 정확도가 필요하면 탭 1에서 실제 내경을 확인하세요.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '본 계산기의 결과는 KS/JIS 규격 기반의 참고용입니다. 실제 설계·시공 시에는 최신 KS 규격표, 설계도서, 현장 감리 기준을 기준으로 최종 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function PipingCalcPage() {
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
      <PipingCalcClient />
    </>
  );
}
