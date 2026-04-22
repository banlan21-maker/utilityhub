import type { Metadata } from 'next';
import PyeongCalcClient from './PyeongCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '평수 계산기 / 평-제곱미터 변환기 | Utility Hub' : 'Pyeong to Square Meter Converter | Utility Hub';
  const description = isKo
    ? '평(坪)과 제곱미터(㎡)를 즉시 변환해주는 무료 온라인 도구입니다. 아파트 표준 전용면적 프리셋 제공.'
    : 'Free online converter for pyeong and square meters (㎡). Includes standard apartment size presets.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/pyeong-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/pyeong-calc`,
        en: `https://www.theutilhub.com/en/utilities/utility/pyeong-calc`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '평수 계산기 / 평-제곱미터 변환기',
  alternateName: 'Pyeong to Square Meter Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/pyeong-calc',
  description: '평(坪)과 제곱미터(㎡)를 즉시 변환해주는 무료 온라인 도구입니다. 아파트 표준 전용면적 프리셋 제공.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '1평은 몇 ㎡인가요?', acceptedAnswer: { '@type': 'Answer', text: '1평은 정확히 3.30578512㎡이며, 통상 3.3058㎡로 계산합니다. 법적으로는 1평 = 400/121㎡(약 3.30579㎡)로 정의됩니다.' } },
    { '@type': 'Question', name: '아파트 전용면적 84㎡는 몇 평인가요?', acceptedAnswer: { '@type': 'Answer', text: '84 ÷ 3.30579 ≈ 25.4평입니다. 흔히 \'25평형 아파트\'라고 부르는 평형입니다.' } },
    { '@type': 'Question', name: '공급면적과 전용면적의 차이는 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '전용면적은 현관문 안쪽 실내 면적만을 의미하고, 공급면적은 전용면적에 계단·복도 등 공용 면적을 합산한 면적입니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function PyeongCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PyeongCalcClient />
    </>
  );
}
