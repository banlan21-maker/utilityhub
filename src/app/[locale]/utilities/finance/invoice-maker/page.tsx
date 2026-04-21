import type { Metadata } from 'next';
import InvoiceMakerClient from './InvoiceMakerClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '인보이스 & 견적서 메이커 | Utility Hub' : 'Invoice & Quote Maker | Utility Hub';
  const description = isKo
    ? '브라우저에서 바로 인보이스·견적서를 작성하고 PDF·Excel로 출력하는 무료 도구. 가입 불필요.'
    : 'Free browser-based invoice & quote maker — create, export PDF/Excel, and share with encrypted links. No sign-up.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/invoice-maker`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/invoice-maker',
        en: 'https://www.theutilhub.com/en/utilities/finance/invoice-maker',
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
  "name": "인보이스 & 견적서 메이커",
  "alternateName": "Invoice & Quote Maker",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/invoice-maker",
  "description": "프리랜서와 소규모 사업자를 위한 무료 인보이스·견적서 작성 도구로 PDF 출력과 암호화 공유 링크를 지원합니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "상업적으로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "개인 및 기업 모두 완전 무료로 사용 가능합니다. 별도 구독이나 결제가 필요 없습니다." } },
    { "@type": "Question", "name": "입력한 데이터가 사라지면 어떻게 하나요?", "acceptedAnswer": { "@type": "Answer", "text": "데이터는 서버가 아닌 브라우저 로컬 스토리지에 저장됩니다. 브라우저 캐시를 초기화하거나 시크릿 모드를 사용하면 데이터가 사라질 수 있습니다. 중요한 인보이스는 반드시 PDF/Excel로 저장해 두세요." } },
    { "@type": "Question", "name": "암호화 공유 링크는 안전한가요?", "acceptedAnswer": { "@type": "Answer", "text": "공유 링크 생성 시 입력된 데이터는 lz-string으로 압축 후 AES-256 알고리즘으로 암호화되어 URL에 포함됩니다. 계좌번호·은행 정보 등 민감한 금융 정보는 URL에서 자동 제외됩니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

export default function InvoiceMakerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <InvoiceMakerClient />
    </>
  );
}
