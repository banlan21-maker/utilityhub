import type { Metadata } from 'next';
import InvoiceMakerClient from './InvoiceMakerClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import { SEO_KO } from './content';

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
    : 'Free browser-based invoice & quote maker — create, export PDF/Excel, and share by link. No sign-up.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/invoice-maker`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/invoice-maker',
        en: 'https://www.theutilhub.com/en/utilities/finance/invoice-maker',
        'x-default': 'https://www.theutilhub.com/ko/utilities/finance/invoice-maker',
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
  "description": "프리랜서와 소규모 사업자를 위한 무료 인보이스·견적서 작성 도구로 PDF 출력과 공유 링크를 지원합니다."
};

// 화면의 한국어 FAQ(SeoSection)와 같은 내용 — 영문 FAQPage는 SeoSection이 내보낸다
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'ko',
  mainEntity: SEO_KO.faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function InvoiceMakerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/finance/invoice-maker" />
      )}
      <InvoiceMakerClient />
    </>
  );
}
