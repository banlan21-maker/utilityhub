import type { Metadata } from 'next';
import CoffeeYieldClient from './CoffeeYieldClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '커피 브루잉 수율 계산기 (SCA 표준 · 물 양 · TDS) | Utility Hub'
    : 'Coffee Extraction Calculator (SCA Standard · Brew Ratio · TDS Yield) | Utility Hub';
  const description = isKo
    ? '핸드드립 물 양과 에스프레소 추출량을 계산하고, TDS 측정값으로 SCA 표준 추출 수율과 분쇄도 가이드까지. 100% 브라우저 계산.'
    : 'Calculate pour-over brew water or espresso yield from your dose and ratio, plus SCA extraction yield from TDS with a barista grind guide. 100% browser-based.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/coffee-yield-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/coffee-yield-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/coffee-yield-calc',
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
  name: '커피 브루잉 수율 계산기',
  alternateName: 'Coffee Extraction Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/coffee-yield-calc',
  description:
    '핸드드립 물 양과 에스프레소 추출량을 계산하고, TDS 측정값으로 SCA 표준 추출 수율과 분쇄도 가이드까지 제공하는 100% 브라우저 기반 커피 추출 계산기.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '이 계산기의 공식은 어디 기준인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '전 세계 바리스타 표준인 SCA(스페셜티 커피 협회)의 브루잉 컨트롤 차트 공식을 기반으로 합니다. 골든존 수율 18~22%, 드립 TDS 1.15~1.35%는 SCA가 제시하는 이상적 추출 구간이며, 모든 계산은 사용자 브라우저 안에서만 처리됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '에스프레소 1:2랑 드립 1:16은 같은 의미인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '다릅니다. 드립의 1:16은 원두 1에 붓는 물 16을 의미하고, 에스프레소의 1:2는 원두 1에 추출된 액체 2를 의미합니다. 에스프레소는 물을 붓는 게 아니라 추출된 결과물 기준이라, 본 도구가 방식별로 결과 용어(물 양 vs 추출량)를 자동 구분합니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'TDS 측정기가 없는데 수율을 알 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '정확한 수율은 굴절계(TDS 측정기)가 필요합니다. 측정기가 없으면 입문자 모드에서 정확한 물 양 또는 추출량 계산을 제공하며, 비율 기반 레시피 일관성 유지에 집중하시길 권장합니다. 측정기를 보유했다면 전문가 모드에서 진짜 수율과 차트를 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 로스팅 정도, 채널링 등 현장 변수로 실제 미각은 다를 수 있으므로 보조 도구로 활용하시고, 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function CoffeeYieldPage() {
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
      <CoffeeYieldClient />
    </>
  );
}
