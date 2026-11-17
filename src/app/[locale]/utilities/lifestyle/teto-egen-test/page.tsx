import type { Metadata } from 'next';
import TetoEgenTestClient from './TetoEgenTestClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import SeoSection from '@/app/components/SeoSection';
import { TETO_EGEN_SEO } from './seoContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '테토·에겐 테스트 | Utility Hub' : 'Teto-Egen Test | Utility Hub';
  const description = isKo
    ? '남성형(테토)과 여성형(에겐) 성향을 분석하는 무료 성격 테스트'
    : 'A free personality test that analyzes your Teto (masculine) and Egen (feminine) tendencies.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/teto-egen-test`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/teto-egen-test',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/teto-egen-test',
        'x-default': 'https://www.theutilhub.com/ko/utilities/lifestyle/teto-egen-test',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '테토·에겐 테스트',
  alternateName: 'Teto-Egen Test',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/teto-egen-test',
  description: '남성형(테토)과 여성형(에겐) 성향을 분석하는 무료 성격 테스트',
};

// 한국어 FAQPage — 화면의 한국어 FAQ(SeoSection)와 같은 데이터. 영문 FAQPage는 SeoSection이 /en에서 내보낸다.
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'ko',
  mainEntity: TETO_EGEN_SEO.ko.faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function TetoEgenTestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/lifestyle/teto-egen-test" />
      )}
      <TetoEgenTestClient />
      <SeoSection ko={TETO_EGEN_SEO.ko} en={TETO_EGEN_SEO.en} />
    </>
  );
}
