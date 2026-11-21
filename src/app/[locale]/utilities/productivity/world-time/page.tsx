import type { Metadata } from 'next';
import WorldTimeClient from './WorldTimeClient';
import SeoSection from '@/app/components/SeoSection';
import { SEO } from './seo-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '세계 시간대 변환기 | Utility Hub' : 'World Time Zone Converter | Utility Hub';
  const description = isKo
    ? '전 세계 주요 도시의 현재 시각을 한 화면에서 비교하고, 슬라이더로 최적의 국제 미팅 시간을 찾으세요.'
    : 'Compare current times of major cities worldwide on one screen and find the best international meeting time with the slider.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/world-time`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/world-time',
        en: 'https://www.theutilhub.com/en/utilities/productivity/world-time',
        'x-default': 'https://www.theutilhub.com/ko/utilities/productivity/world-time',
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
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '세계 시간대 변환기',
  alternateName: 'World Time Zone Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/world-time',
  description: '전 세계 주요 도시의 현재 시각을 한 화면에서 비교하고, 슬라이더로 최적의 국제 미팅 시간을 찾으세요.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'DST(서머타임)는 자동으로 반영되나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 이 시간대 변환기는 각 도시의 현재 DST(일광 절약 시간제) 적용 여부를 자동으로 반영합니다. 미국·유럽 등 서머타임 적용 국가의 시각도 항상 정확하게 표시됩니다.' } },
    { '@type': 'Question', name: '원하는 도시가 목록에 없습니다', acceptedAnswer: { '@type': 'Answer', text: '현재 세계 주요 30개 이상의 도시를 지원합니다. 특정 도시가 없다면 같은 타임존(UTC 오프셋)의 대표 도시를 대신 사용하세요. 예: 방콕(UTC+7) = 자카르타(UTC+7)' } },
    { '@type': 'Question', name: '현재 시각이 아닌 특정 시각을 변환하고 싶습니다', acceptedAnswer: { '@type': 'Answer', text: '슬라이더를 원하는 시각(0~23시)으로 조정하면 해당 시각 기준으로 모든 도시의 시각이 계산됩니다. 내일 오전 10시 미팅이라면 슬라이더를 10에 맞추면 됩니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

const softwareSchemaEn = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'World Time Zone Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://www.theutilhub.com/en/utilities/productivity/world-time',
  description: 'Compare current times of major cities worldwide on one screen and find the best international meeting time with the slider.',
};

const faqSchemaEn = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is DST (Daylight Saving Time) automatically applied?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. This timezone converter automatically applies the current DST status for each city, so times for the US, Europe, and other DST regions are always displayed accurately.' } },
    { '@type': 'Question', name: "My city isn't in the list", acceptedAnswer: { '@type': 'Answer', text: 'If your city is missing, use the representative city for the same timezone (UTC offset). For example, Bangkok (UTC+7) can substitute for Jakarta (UTC+7).' } },
    { '@type': 'Question', name: 'Can I convert a specific time rather than the current time?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Adjust the slider to your desired hour (0-23) and all city times are recalculated for that moment. For a 10:00 AM meeting tomorrow, set the slider to 10.' } },
    { '@type': 'Question', name: 'Can I use this result as official data?', acceptedAnswer: { '@type': 'Answer', text: 'Results are for reference only. Please consult a professional or official source for accurate figures.' } },
  ],
};

export default async function WorldTimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(isKo ? softwareSchema : softwareSchemaEn) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(isKo ? faqSchema : faqSchemaEn) }} />
      <WorldTimeClient seo={<SeoSection ko={SEO.ko} en={SEO.en} faqSchema={false} />} />
    </>
  );
}
