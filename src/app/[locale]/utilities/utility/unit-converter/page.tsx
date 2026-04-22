import type { Metadata } from 'next';
import UnitConverterClient from './UnitConverterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '단위 변환기 – 10가지 카테고리 즉시 환산 | Utility Hub' : 'Unit Converter – 10 Categories Instant Conversion | Utility Hub';
  const description = isKo
    ? '길이, 무게, 온도, 데이터 등 10가지 단위를 즉시 환산하는 무료 온라인 단위 변환기입니다.'
    : 'Free online unit converter for length, weight, temperature, data and 10 more categories — instant results.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/unit-converter`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/unit-converter`,
        en: `https://www.theutilhub.com/en/utilities/utility/unit-converter`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '단위 변환기',
  alternateName: 'Unit Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/unit-converter',
  description: '길이, 무게, 온도, 데이터 등 10가지 단위를 즉시 환산하는 무료 온라인 단위 변환기입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '어떤 단위 카테고리를 지원하나요?', acceptedAnswer: { '@type': 'Answer', text: '길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 총 10가지 카테고리를 지원합니다. 각 카테고리에는 국제 표준 및 한국 전통 단위가 포함되어 있습니다.' } },
    { '@type': 'Question', name: '온도 변환은 어떻게 계산하나요?', acceptedAnswer: { '@type': 'Answer', text: '섭씨(°C), 화씨(°F), 켈빈(K) 간 변환을 지원합니다. 섭씨→화씨: (°C × 9/5) + 32, 섭씨→켈빈: °C + 273.15 공식을 사용합니다.' } },
    { '@type': 'Question', name: '평(坪) 단위도 지원하나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 넓이 카테고리에서 m², km², ft², acre, ha와 함께 한국 전통 단위인 평(坪, 1평=3.30579m²)을 지원합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function UnitConverterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <UnitConverterClient />
    </>
  );
}
