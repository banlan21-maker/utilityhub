import type { Metadata } from 'next';
import CoreWebVitalsClient from './CoreWebVitalsClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import { SEO_KO } from './content';
import SeoSection from '@/app/components/SeoSection';
import { SEO_EN } from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'Core Web Vitals 판정기 — LCP·INP·CLS 등급 즉시 판정, 무료 | Utility Hub'
    : 'Core Web Vitals Checker – LCP, INP & CLS, Free | Utility Hub';
  const description = isKo
    ? 'PageSpeed Insights나 서치콘솔의 LCP·INP·CLS 수치를 넣으면 구글 기준 Good·Needs Improvement·Poor 등급과 무엇부터 고칠지 바로 알려 줍니다. 구글 현행 공식 기준(2024년 3월 INP 도입) 적용, 무료·가입 없음.'
    : 'Paste the LCP, INP and CLS numbers from PageSpeed Insights or Search Console and instantly see Google\'s Good / Needs Improvement / Poor rating, which metric to fix first and how. Free, no sign-up.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/performance/core-web-vitals`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/performance/core-web-vitals',
        en: 'https://www.theutilhub.com/en/utilities/performance/core-web-vitals',
        'x-default': 'https://www.theutilhub.com/ko/utilities/performance/core-web-vitals',
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Core Web Vitals 판정기',
  alternateName: 'Core Web Vitals Checker',
  operatingSystem: 'Web Browser',
  applicationCategory: 'DeveloperApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/performance/core-web-vitals',
  description:
    'PageSpeed Insights나 서치콘솔의 LCP·INP·CLS 수치를 넣으면 구글 기준 Good·Needs Improvement·Poor 등급과 무엇부터 고칠지 바로 알려 줍니다. 구글 현행 공식 기준(2024년 3월 INP 도입) 적용, 무료·가입 없음.',
};

// 화면의 한국어 FAQ와 같은 데이터
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'ko',
  mainEntity: SEO_KO.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default async function CoreWebVitalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </>
      ) : (
        <ToolJsonLd href="/utilities/performance/core-web-vitals" />
      )}
      <CoreWebVitalsClient seo={<SeoSection ko={SEO_KO} en={SEO_EN} />} />
    </>
  );
}
