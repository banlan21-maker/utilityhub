import type { Metadata } from 'next';
import Tax33CalcClient from './Tax33CalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '프리랜서 3.3% 원천징수 계산기 | Utility Hub' : 'Freelancer 3.3% Withholding Tax Calculator | Utility Hub';
  const description = isKo
    ? '프리랜서 계약금에서 3.3% 원천징수를 공제한 실수령액을 즉시 계산하는 무료 도구.'
    : 'Free 3.3% withholding tax calculator for Korean freelancers — instantly compute net pay after deductions.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/tax-33-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/tax-33-calc',
        en: 'https://www.theutilhub.com/en/utilities/finance/tax-33-calc',
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
  "name": "프리랜서 3.3% 원천징수 계산기",
  "alternateName": "Freelancer 3.3% Withholding Tax Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/tax-33-calc",
  "description": "프리랜서 계약금에서 3.3% 원천징수(사업소득세 3% + 지방소득세 0.3%)를 공제한 실수령액을 즉시 계산하는 무료 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "3.3% 원천징수는 어떻게 구성되나요?", "acceptedAnswer": { "@type": "Answer", "text": "사업소득세 3.0%와 지방소득세 0.3%로 구성되며, 총 3.3%가 계약 금액에서 자동 공제됩니다. 이는 소득세법 제127조에 따라 사업소득 지급 시 의무적으로 원천징수해야 하는 금액입니다." } },
    { "@type": "Question", "name": "원천징수된 세금은 나중에 돌려받을 수 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "5월 종합소득세 신고 시 연간 총소득과 경비를 정산하여 최종 세액을 계산합니다. 원천징수액이 실제 납부할 세액보다 많으면 환급받고, 적으면 추가 납부해야 합니다." } },
    { "@type": "Question", "name": "지역가입자 4대보험료는 정확한가요?", "acceptedAnswer": { "@type": "Answer", "text": "본 계산기는 2024년 기준 간이 예측치로, 실제 보험료는 전년도 소득, 재산, 자동차 등 여러 요소를 반영하여 국민건강보험공단과 국민연금공단이 개별 고지합니다. 정확한 금액은 해당 기관에 문의하세요." } },
    { "@type": "Question", "name": "월급과 프리랜서 소득을 동시에 받으면?", "acceptedAnswer": { "@type": "Answer", "text": "직장 근로소득과 프리랜서 사업소득을 동시에 받는 경우, 종합소득세 신고 시 두 소득을 합산하여 누진세율이 적용되므로 예상보다 세금이 높아질 수 있습니다. 세무사 상담을 권장합니다." } }
  ]
};

export default function Tax33CalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Tax33CalcClient />
    </>
  );
}
