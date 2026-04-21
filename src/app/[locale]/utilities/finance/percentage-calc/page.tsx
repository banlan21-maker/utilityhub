import type { Metadata } from 'next';
import PercentageCalcClient from './PercentageCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '퍼센트 계산기 | Utility Hub' : 'Percentage Calculator | Utility Hub';
  const description = isKo
    ? '할인율·증감률·비율·역산 4가지 퍼센트 연산을 하나의 도구로 제공하는 무료 계산기.'
    : 'Free percentage calculator — discount, change rate, ratio, and reverse calculation in one tool.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/percentage-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/percentage-calc',
        en: 'https://www.theutilhub.com/en/utilities/finance/percentage-calc',
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
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "퍼센트 계산기",
  "alternateName": "Percentage Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/percentage-calc",
  "description": "할인율 계산, 증감률 계산, 비율 계산, 역산 4가지 퍼센트 연산을 하나의 도구에서 제공하는 무료 계산기입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "할인율 계산과 역산의 차이가 무엇인가요?", "acceptedAnswer": { "@type": "Answer", "text": "할인율 계산은 원래 가격에서 할인율(%)을 적용해 최종 결제 금액과 절약 금액을 구하는 방식입니다. 역산은 반대로 이미 할인된 금액과 할인율을 알고 있을 때 원래 정가를 찾아내는 계산입니다. 예를 들어 세일 후 가격이 70,000원이고 할인율이 30%라면, 역산으로 원래 정가 100,000원을 구할 수 있습니다." } },
    { "@type": "Question", "name": "증감률은 어떻게 계산되나요?", "acceptedAnswer": { "@type": "Answer", "text": "증감률은 ((새 값 - 이전 값) / 이전 값) × 100 공식으로 계산됩니다. 결과가 양수면 증가, 음수면 감소를 의미합니다. 예: 이전 값 50,000원 → 새 값 65,000원이면 (65,000 - 50,000) / 50,000 × 100 = 30% 증가입니다." } },
    { "@type": "Question", "name": "비율 계산 모드는 언제 사용하나요?", "acceptedAnswer": { "@type": "Answer", "text": "비율 계산은 전체 중 특정 부분이 차지하는 비중(%)을 구할 때 사용합니다. 예를 들어 총 매출 500만원 중 특정 상품 매출이 150만원이라면, 비율 계산으로 150 / 500 × 100 = 30%라는 점유율을 즉시 알 수 있습니다. 성적 점수, 예산 집행률, 달성률 등 다양한 상황에 활용할 수 있습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

export default function PercentageCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PercentageCalcClient />
    </>
  );
}
