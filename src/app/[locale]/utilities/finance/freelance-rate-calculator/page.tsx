import type { Metadata } from 'next';
import FreelanceRateCalculatorClient from './FreelanceRateCalculatorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '프리랜서 적정 단가 계산기 | Utility Hub' : 'Freelance Rate Calculator | Utility Hub';
  const description = isKo
    ? '목표 순수익·세금·고정지출·업무효율을 역산하여 프리랜서의 시간당 적정 단가를 계산하는 무료 도구.'
    : 'Free freelance rate calculator — compute your ideal hourly rate based on income goal, tax, and expenses.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/freelance-rate-calculator`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/freelance-rate-calculator',
        en: 'https://www.theutilhub.com/en/utilities/finance/freelance-rate-calculator',
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
  "name": "프리랜서 적정 단가 계산기",
  "alternateName": "Freelance Rate Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/freelance-rate-calculator",
  "description": "목표 순수익·세금·고정지출·업무효율을 역산하여 프리랜서의 시간당 적정 단가를 계산하는 무료 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "효율(Efficiency)은 왜 100%가 아닌가요?", "acceptedAnswer": { "@type": "Answer", "text": "프리랜서의 하루 8시간 중 실제 청구 가능한 작업 시간은 미팅, 이메일, 이동, 영업 등을 제외하면 60~80% 수준입니다. 효율을 100%로 설정하면 단가가 낮아져 실제 수익이 줄어들 수 있습니다." } },
    { "@type": "Question", "name": "버퍼 10%는 왜 필요한가요?", "acceptedAnswer": { "@type": "Answer", "text": "세금 예측 오차, 미수금(미지급 프로젝트), 예상치 못한 지출, 비수기 등에 대비한 안전 마진입니다. 장기적으로 단가를 안정적으로 유지하는 핵심 요소입니다." } },
    { "@type": "Question", "name": "이 계산기의 세금 계산이 정확한가요?", "acceptedAnswer": { "@type": "Answer", "text": "공개된 2024년 세율 기준으로 추정합니다. 실제 세금은 공제 항목, 사업 형태, 지역 등에 따라 다를 수 있으니 세무사 상담을 권장합니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

export default function FreelanceRateCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FreelanceRateCalculatorClient />
    </>
  );
}
