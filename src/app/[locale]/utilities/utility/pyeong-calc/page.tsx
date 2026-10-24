import type { Metadata } from 'next';
import PyeongCalcClient from './PyeongCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/pyeong-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '평수 계산기 — ㎡ 평 변환, 84㎡는 몇 평형?, 평당 가격 | Utility Hub'
    : 'Pyeong Calculator — ㎡ to Pyeong, Korean Apartment Classes & Price per Pyeong | Utility Hub';
  const description = isKo
    ? '㎡와 평을 바로 변환하고, 전용면적이 몇 평형인지(84㎡ ≈ 34평형, 59㎡ ≈ 24평형) 아파트·주상복합·오피스텔 전용률로 계산합니다. 매매가로 평당 가격과 ㎡당 가격도 구합니다.'
    : 'Convert ㎡ and pyeong, find the Korean apartment pyeong class from exclusive area (84㎡ ≈ 34-pyeong class), and work out the price per pyeong.';
  const canonical = `${BASE}/${locale}${PATH}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko${PATH}`,
        en: `${BASE}/en${PATH}`,
        'x-default': `${BASE}/ko${PATH}`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const SCHEMA_TEXT = {
  ko: {
    name: '평수 계산기 (㎡ ↔ 평, 평형, 평당 가격)',
    description: '㎡와 평 변환, 전용면적 ↔ 평형 환산, 평당 가격을 계산하는 무료 도구입니다.',
    faqs: [
      { q: '전용 84㎡는 왜 25평형이 아니라 34평형인가요?', a: '84㎡를 평으로 바꾸면 25.4평이지만, 평형은 계단·복도 같은 주거공용면적을 더한 공급면적으로 부릅니다. 전용 84㎡ 아파트의 공급면적은 보통 110~115㎡로 약 34평입니다.' },
      { q: '1평은 정확히 몇 ㎡인가요?', a: '1평은 400/121㎡, 약 3.305785㎡입니다. ㎡를 3.3058로 나누거나 0.3025를 곱하면 평이 됩니다.' },
      { q: '오피스텔 평형은 아파트와 어떻게 다른가요?', a: '오피스텔은 공용시설까지 포함한 계약면적으로 분양하는 경우가 많아 전용률이 45~60% 정도라, 같은 평형이라도 전용면적이 아파트보다 작습니다.' },
      { q: '평당 가격은 어떤 면적으로 나누나요?', a: '기사나 분양 광고의 평당가는 보통 공급면적(평형) 기준입니다. 전용면적으로 나누면 더 높게 나오므로 같은 기준끼리 비교해야 합니다.' },
    ],
  },
  en: {
    name: 'Pyeong Calculator (㎡ ↔ pyeong, classes, price per pyeong)',
    description: 'Free tool to convert ㎡ and pyeong, map exclusive area to Korean pyeong classes and calculate price per pyeong.',
    faqs: [
      { q: 'Why is 84㎡ a 34-pyeong class, not 25?', a: '84㎡ is 25.4 pyeong, but classes use supply area including shared stairs and corridors. An 84㎡ apartment usually has 110–115㎡ of supply area, about 34 pyeong.' },
      { q: 'Exactly how big is one pyeong?', a: '400/121 ㎡ ≈ 3.305785 ㎡. Divide ㎡ by 3.3058, or multiply by 0.3025, for pyeong.' },
      { q: 'How do officetel classes differ?', a: 'Officetels are often sold by contract area with an exclusive ratio of about 45–60%, so the same class has less usable space than an apartment.' },
      { q: 'Which area is used for price per pyeong?', a: 'Media and sales ads usually divide by supply area; dividing by exclusive area gives a higher number, so compare like with like.' },
    ],
  },
} as const;

export default async function PyeongCalcPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const text = locale === 'ko' ? SCHEMA_TEXT.ko : SCHEMA_TEXT.en;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: text.name,
    operatingSystem: 'Web Browser',
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    url: `${BASE}/${locale}${PATH}`,
    inLanguage: locale,
    description: text.description,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: text.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PyeongCalcClient />
    </>
  );
}
