import type { Metadata } from 'next';
import SalaryCalcClient from './SalaryCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '급여 & 실수령액 계산기 | Utility Hub' : 'Salary & Net Pay Calculator | Utility Hub';
  const description = isKo
    ? '시급 기반으로 일반근무·잔업·특근 수당을 설정하고 세금 및 보험료를 공제한 월 실수령액을 계산하는 무료 도구.'
    : 'Free salary calculator — set hourly rate, overtime, and holiday pay to compute monthly net pay after deductions.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/salary-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/salary-calc',
        en: 'https://www.theutilhub.com/en/utilities/finance/salary-calc',
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
  "name": "급여 & 실수령액 계산기",
  "alternateName": "Salary & Net Pay Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/salary-calc",
  "description": "시급 기반으로 일반근무·잔업·특근 수당을 설정하고 세금 및 보험료를 공제한 월 실수령액을 계산하는 무료 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "주휴수당 계산 기준이 어떻게 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "주휴수당은 일반근무(소정근로시간) 기준으로만 계산됩니다. 잔업·특근 시간은 포함되지 않습니다. 공식은 (소정근로시간 ÷ 40) × 8 × 시급이며, 주 15시간 이상 근무 시 자동 적용됩니다. 최대는 주 40시간 이상 시 8시간분 시급입니다." } },
    { "@type": "Question", "name": "잔업과 특근의 차이가 무엇인가요?", "acceptedAnswer": { "@type": "Answer", "text": "잔업(연장근로)은 정규 근무 뒤 같은 날 추가로 일하는 것을 의미하며, 특근(휴일근로)은 주휴일이나 별도로 지정된 날에 출근하는 것입니다. 둘 다 시급 배율(1.5x~3x)을 설정할 수 있습니다." } },
    { "@type": "Question", "name": "4대보험 9.4%는 정확한가요?", "acceptedAnswer": { "@type": "Answer", "text": "본 계산기는 국민연금 4.5%, 건강보험 3.545%, 장기요양보험 0.455%, 고용보험 0.9%를 합산한 근사치를 사용합니다. 실제 공제액은 소득 수준 및 회사 규모에 따라 소폭 차이가 있으며, 정확한 금액은 급여명세서에서 확인하세요." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

export default function SalaryCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SalaryCalcClient />
    </>
  );
}
