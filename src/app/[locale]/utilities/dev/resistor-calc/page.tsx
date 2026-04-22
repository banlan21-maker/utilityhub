import type { Metadata } from 'next';
import ResistorCalcClient from './ResistorCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '저항기 계산기 (색상 코드 & SMD) | Utility Hub' : 'Resistor Calculator (Color Code & SMD) | Utility Hub';
  const description = isKo
    ? '4·5·6색 띠 저항기와 SMD 코드를 실시간 그래픽으로 즉시 변환하는 무료 온라인 저항기 계산기입니다.'
    : 'Free online resistor calculator that decodes 4/5/6-band color codes and SMD resistor codes with live graphics.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/dev/resistor-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/dev/resistor-calc',
        en: 'https://www.theutilhub.com/en/utilities/dev/resistor-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '통합 저항기 판독기',
  alternateName: 'Resistor Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/dev/resistor-calc',
  description: '4색·5색·6색 띠 저항기와 SMD 저항 코드를 실시간 그래픽과 함께 즉시 변환해주는 전문가용 무료 온라인 저항기 계산기입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'EIA-96 코드는 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '오차 1% 미만의 고정밀 저항기에서 사용되는 코드로, 두 자리 숫자 인덱스와 한 자리 문자로 구성됩니다. 일반적인 배수법과 다르니 본 도구의 자동 판별 기능을 사용하는 것이 정확합니다.' } },
    { '@type': 'Question', name: '저항기에 띠가 6개인 경우는 무엇을 의미하나요?', acceptedAnswer: { '@type': 'Answer', text: '6번째 띠는 온도 계수(Temperature Coefficient)를 의미하며, 온도 변화에 따라 저항값이 얼마나 변하는지(PPM/K)를 나타냅니다.' } },
    { '@type': 'Question', name: '단위가 왜 kΩ이나 MΩ으로 바뀌나요?', acceptedAnswer: { '@type': 'Answer', text: '가독성을 위해 1,000Ω 이상은 kΩ으로, 1,000,000Ω 이상은 MΩ으로 직관적으로 자동 변환하여 표시합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ResistorCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ResistorCalcClient />
    </>
  );
}
