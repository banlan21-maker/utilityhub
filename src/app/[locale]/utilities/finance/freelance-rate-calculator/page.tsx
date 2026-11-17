import type { Metadata } from 'next';
import FreelanceRateCalculatorClient from './FreelanceRateCalculatorClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import SeoSection from '@/app/components/SeoSection';
import { FREELANCE_RATE_SEO } from './seoContent';

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
        'x-default': 'https://www.theutilhub.com/ko/utilities/finance/freelance-rate-calculator',
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

// 한국어 FAQPage — 화면의 한국어 FAQ(SeoSection)와 같은 데이터. 영문 FAQPage는 SeoSection이 /en에서 내보낸다.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "ko",
  "mainEntity": FREELANCE_RATE_SEO.ko.faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
};

export default async function FreelanceRateCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/finance/freelance-rate-calculator" />
      )}
      <FreelanceRateCalculatorClient />
      <SeoSection ko={FREELANCE_RATE_SEO.ko} en={FREELANCE_RATE_SEO.en} />
    </>
  );
}
