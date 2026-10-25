import type { Metadata } from 'next';
import ElbowOffsetClient from './ElbowOffsetClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/elbow-offset';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '배관 절단 길이 계산기 — 엘보값(뺄길이)·옵셋·45도 1.414·나사 물림 | Utility Hub'
    : 'Pipe Offset & Cut Length Calculator — Elbow Take-off, 45° Offsets | Utility Hub';
  const description = isKo
    ? '옵셋 거리나 도면 심-심 치수만 넣으면 엘보값(뺄길이)을 자동으로 빼서 파이프 절단 길이를 계산합니다. KS 용접 엘보·나사 엘보(물림 길이)·ASME, 45도·롤링 옵셋, 잘라 쓰는 엘보 각도, 용접 갭까지 반영합니다.'
    : 'Enter an offset or centre-to-centre dimension and get the pipe cut length with elbow allowances deducted: KS butt-weld and threaded fittings, ASME, 45° and rolling offsets, cut-down elbows and weld gaps.';
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
    name: '배관 옵셋·절단 길이 계산기',
    description: '엘보값(뺄길이)을 자동으로 빼서 옵셋·롤링 옵셋·심-심 치수의 파이프 절단 길이를 계산하는 무료 현장 도구입니다.',
    faqs: [
      { q: '엘보값(뺄길이)이 정확히 무엇인가요?', a: '엘보 중심(양쪽 배관 중심선이 만나는 점)에서 엘보 끝 단면까지의 거리입니다. 도면 치수는 중심선 기준이라 자를 길이는 양쪽 엘보값을 빼야 나옵니다.' },
      { q: '45° 옵셋에서 1.414는 어디서 나오나요?', a: '45° 엘보 두 개로 비켜 가면 빗변이 옵셋의 √2배(약 1.414배)가 됩니다. 30°는 2배, 60°는 1.155배이며 빗변에서 양쪽 엘보값을 빼면 절단 길이입니다.' },
      { q: 'KS 엘보와 ASME 엘보 값이 다른가요?', a: '90° 장반경은 거의 같지만 45°는 50A가 KS 31.6mm, ASME 35mm로 다릅니다. 쓰는 이음쇠 규격을 맞춰 골라야 합니다.' },
      { q: '나사 엘보는 왜 값이 다른가요?', a: '파이프가 나사 물림만큼 이음쇠 안으로 들어가므로 중심~끝 치수에서 물림 길이를 뺀 값을 뺍니다. 25A는 38 − 15 = 23mm입니다.' },
    ],
  },
  en: {
    name: 'Pipe Offset & Cut Length Calculator',
    description: 'Free field tool for pipe cut lengths in offsets, rolling offsets and centre-to-centre runs with fitting allowances deducted.',
    faqs: [
      { q: 'What is the fitting allowance?', a: 'The distance from the elbow centre to its end face, deducted at both ends of the pipe.' },
      { q: 'Where does 1.414 come from?', a: 'With 45° elbows the travel is √2 × offset; 30° is 2.0 and 60° 1.155.' },
      { q: 'Do KS and ASME elbows differ?', a: '45° values differ: 50A is 31.6 mm in KS and 35 mm in ASME.' },
      { q: 'Why are threaded allowances smaller?', a: 'Only centre-to-end minus thread engagement is deducted, 23 mm for 25A.' },
    ],
  },
} as const;

export default async function ElbowOffsetPage({
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
      <ElbowOffsetClient />
    </>
  );
}
