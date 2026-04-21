import type { Metadata } from 'next';
import InterestCalcClient from './InterestCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '단리·복리 이자 계산기 | Utility Hub' : 'Simple & Compound Interest Calculator | Utility Hub';
  const description = isKo
    ? '단리와 복리 이자를 즉시 계산하고 연도별 수익 그래프로 복리 효과를 시각화하는 무료 이자 계산기.'
    : 'Free interest calculator — compare simple vs compound interest with a yearly growth chart.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/interest-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/interest-calc',
        en: 'https://www.theutilhub.com/en/utilities/finance/interest-calc',
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
  "name": "단리·복리 이자 계산기",
  "alternateName": "Simple & Compound Interest Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/interest-calc",
  "description": "단리와 복리 이자를 즉시 계산하고 연도별 수익 그래프로 복리 효과를 시각화하는 무료 이자 계산기입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "단리와 복리의 차이가 무엇인가요?", "acceptedAnswer": { "@type": "Answer", "text": "단리는 원금에만 이자가 붙어 매 기간 동일한 이자가 발생하는 반면, 복리는 원금에 이자가 더해진 금액에 다시 이자가 붙어 시간이 지날수록 수익이 기하급수적으로 증가합니다. 예: 1000만원, 연 5%, 10년 기준 → 단리 1500만원, 복리 약 1629만원" } },
    { "@type": "Question", "name": "월복리와 연복리 중 어느 것이 더 유리한가요?", "acceptedAnswer": { "@type": "Answer", "text": "동일한 연 이자율이라면 복리 주기가 짧을수록(일복리 > 월복리 > 연복리) 더 자주 이자가 재투자되어 최종 수익이 높아집니다. 실제 은행 상품은 대부분 월복리 또는 분기복리를 적용합니다." } },
    { "@type": "Question", "name": "이자율은 어떤 기준으로 입력해야 하나요?", "acceptedAnswer": { "@type": "Answer", "text": "연 이자율(%)을 기준으로 입력하세요. 예: 은행 정기예금 연 3.5%면 3.5 입력. 월 이자율을 알고 있다면 12를 곱해 연 이자율로 환산하세요. 복리 주기는 별도 옵션으로 설정할 수 있습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

export default function InterestCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <InterestCalcClient />
    </>
  );
}
