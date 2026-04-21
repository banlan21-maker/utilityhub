import type { Metadata } from 'next';
import CoreWebVitalsClient from './CoreWebVitalsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'Core Web Vitals 판정기 | Utility Hub'
    : 'Core Web Vitals Checker | Utility Hub';
  const description = isKo
    ? 'LCP·INP·CLS 수치를 입력하면 Google 공식 기준으로 Good/Needs Work/Poor 등급을 즉시 판정. 2024년 최신 INP 기준 적용.'
    : 'Enter your LCP, INP, and CLS scores to instantly get Google\'s Good / Needs Work / Poor ratings. Updated with the latest INP standard replacing FID.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/performance/core-web-vitals`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/performance/core-web-vitals',
        en: 'https://www.theutilhub.com/en/utilities/performance/core-web-vitals',
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
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/performance/core-web-vitals',
  description:
    'LCP·INP·CLS 수치를 입력하면 Google 공식 기준으로 Good/Needs Work/Poor 등급을 즉시 판정. 2024년 최신 INP 기준 적용.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'FID는 어디 갔나요? INP가 뭔가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '2024년 3월 구글은 FID(First Input Delay)를 INP(Interaction to Next Paint)로 공식 교체했습니다. FID는 첫 번째 입력만 측정했지만, INP는 페이지 전체 수명 동안 모든 클릭·탭·키 입력의 반응성을 측정하는 더 포괄적인 지표입니다. Good 기준은 200ms 이하입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '세 지표 중 하나만 Poor여도 SEO에 영향이 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google은 LCP·INP·CLS 세 지표 모두 Good이어야 Core Web Vitals 통과로 인정합니다. 하나라도 미달 시 완전 통과가 아닙니다. 단, Core Web Vitals는 200개 이상의 검색 순위 신호 중 하나로, 동점 상황의 타이브레이커 역할을 합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수치는 어디서 측정하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PageSpeed Insights(pagespeed.web.dev) 또는 Chrome DevTools의 Lighthouse 탭에서 측정할 수 있습니다. Google Search Console의 Core Web Vitals 보고서에서는 실제 사용자 데이터(CrUX)를 확인할 수 있습니다. 이 툴은 측정된 수치를 입력받아 등급을 판정하는 해설기입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 판정 결과는 참고용으로만 제공됩니다. 정확한 수치와 공식 판정은 Google PageSpeed Insights 또는 Search Console을 통해 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function CoreWebVitalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CoreWebVitalsClient />
    </>
  );
}
