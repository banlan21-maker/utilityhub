import type { Metadata } from 'next';
import SmartPercentClient from './SmartPercentClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '스마트 퍼센트 계산기 | Utility Hub' : 'Smart Percentage Calculator | Utility Hub';
  const description = isKo
    ? '기본 계산·증감률·할인율·마진율 4가지 퍼센트 연산을 입력 즉시 실시간으로 계산하는 무료 도구.'
    : 'Free smart percentage calculator — real-time basic, change, discount, and margin calculations.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/smart-percent`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/smart-percent',
        en: 'https://www.theutilhub.com/en/utilities/finance/smart-percent',
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
  "name": "스마트 퍼센트 계산기",
  "alternateName": "Smart Percentage Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/smart-percent",
  "description": "기본 계산·증감률·할인율·마진율 4가지 퍼센트 연산을 입력하는 즉시 실시간으로 계산하는 무료 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "입력할 때마다 자동으로 계산되나요?", "acceptedAnswer": { "@type": "Answer", "text": "네. 이 계산기는 별도의 계산하기 버튼이 없습니다. 숫자를 입력하는 즉시 onChange 이벤트로 실시간 연산이 실행되어 결과가 바로 나타납니다. 두 개의 입력 필드가 모두 채워지는 순간 자동으로 계산이 완료됩니다." } },
    { "@type": "Question", "name": "계산 기록은 어디에 저장되나요?", "acceptedAnswer": { "@type": "Answer", "text": "모든 계산 결과는 브라우저의 로컬 스토리지(localStorage)에 저장됩니다. 서버로 데이터가 전송되지 않으므로 개인정보 유출 걱정이 없습니다. 최대 5건이 유지되며, 새 계산이 추가될 때 가장 오래된 기록이 자동으로 제거됩니다." } },
    { "@type": "Question", "name": "할인율 탭에서 할인율이 100%를 넘으면?", "acceptedAnswer": { "@type": "Answer", "text": "할인율 탭은 0%~100% 범위에서만 정상 결과를 표시합니다. 0 미만이거나 100을 초과하는 경우 결과값이 표시되지 않습니다. 정상적인 할인율(예: 10%, 30%, 50%)을 입력하면 최종 결제금액과 절약 금액을 정확하게 계산합니다." } },
    { "@type": "Question", "name": "모바일에서도 편리하게 사용할 수 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "네. 입력 필드에 inputMode=\"decimal\" 속성이 적용되어 모바일에서 숫자 키패드가 자동으로 표시됩니다. 탭 메뉴는 모바일(600px 이하)에서 2열 2행으로 재배치되어 터치하기 쉽게 구성되며, 카드 레이아웃도 작은 화면에 최적화되어 있습니다." } }
  ]
};

export default function SmartPercentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SmartPercentClient />
    </>
  );
}
