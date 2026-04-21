import type { Metadata } from 'next';
import VatCalcClient from './VatCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '부가가치세(VAT) 계산기 | Utility Hub' : 'VAT Calculator | Utility Hub';
  const description = isKo
    ? '공급가에서 VAT 포함 금액을 산출하거나 총액에서 공급가를 역산하는 무료 부가세 계산기.'
    : 'Free VAT calculator — add VAT to a net price or extract VAT from a gross amount instantly.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/vat-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/vat-calc',
        en: 'https://www.theutilhub.com/en/utilities/finance/vat-calc',
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
  "name": "부가가치세(VAT) 계산기",
  "alternateName": "VAT Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/vat-calc",
  "description": "부가가치세(VAT)를 즉시 계산하는 도구로 공급가액에서 총액을 산출하거나 총액에서 공급가를 역산할 수 있습니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "한국의 부가가치세율은 얼마인가요?", "acceptedAnswer": { "@type": "Answer", "text": "대한민국의 표준 부가가치세율은 10%입니다. 일부 면세 품목(미가공 식료품, 의료서비스 등)을 제외한 대부분의 상품과 서비스에 적용됩니다." } },
    { "@type": "Question", "name": "부가세 포함 금액에서 공급가를 역산하려면?", "acceptedAnswer": { "@type": "Answer", "text": "\"부가세 별도(역산)\" 모드를 선택한 후 총 결제금액을 입력하면, 자동으로 공급가액과 부가세액이 분리되어 표시됩니다. 예: 110,000원 입력 → 공급가 100,000원 + 부가세 10,000원" } },
    { "@type": "Question", "name": "해외 국가별 부가세율은 어떻게 적용하나요?", "acceptedAnswer": { "@type": "Answer", "text": "세율 입력창에 직접 숫자를 입력하거나 프리셋 버튼을 활용하세요. 예: 일본 10%, 중국 13%, EU 평균 20%, 싱가포르 8% 등 각국 세율을 자유롭게 설정 가능합니다." } },
    { "@type": "Question", "name": "이 계산기는 법적 효력이 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "본 도구는 참고용 계산 도구로, 실제 세금 신고나 법적 문서 작성 시에는 반드시 세무사 또는 회계 전문가의 검토를 받으시기 바랍니다." } }
  ]
};

export default function VatCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <VatCalcClient />
    </>
  );
}
