import type { Metadata } from 'next';
import PipingCalcClient from './PipingCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/piping-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '배관 종합 계산기 — SPP·SPPS·스테인리스 규격표, 배수 구배, 수압 물량, 유속 | Utility Hub'
    : 'Piping Calculator — KS Pipe Tables, Drain Slope, Hydro Test & Velocity | Utility Hub';
  const description = isKo
    ? 'SPP·SPPS Sch40/80·스테인리스 Sch10S·Su관·ASME 외경·두께·내경·kg/m를 호칭별로 조회하고, 관경별 최소 구배 판정, 관경이 섞인 수압 테스트 물량, 유량별 유속과 관경을 계산합니다.'
    : 'KS SPP, SPPS, stainless and ASME pipe dimensions and weights, drain slope checks by size, hydro-test water for mixed runs, and flow velocity sizing.';
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
    name: '배관 종합 계산기',
    description: 'KS 강관·스테인리스관 규격 조회, 배수 구배, 수압 테스트 물량, 유량별 유속을 계산하는 무료 현장 도구입니다.',
    faqs: [
      { q: 'SPP와 SPPS, Sch40은 무엇이 다른가요?', a: 'SPP(KS D 3507)는 호칭마다 두께가 하나인 일반배관용 강관이고, SPPS(KS D 3562)는 Sch40·Sch80처럼 스케줄별 두께가 있는 압력배관용 강관입니다. 50A는 SPP 3.8mm, Sch40 3.9mm, Sch80 5.5mm입니다.' },
      { q: '같은 호칭인데 KS와 ASME 외경이 왜 다른가요?', a: 'KS(JIS) 15A는 외경 21.7mm, ASME 1/2인치는 21.3mm처럼 외경 체계가 달라 부속을 섞어 쓰면 맞지 않을 수 있습니다.' },
      { q: '스테인리스 Sch10S와 Sch40은 얼마나 다른가요?', a: 'KS D 3576 25A 기준 Sch5S 1.65mm, Sch10S 2.8mm, Sch20S 3.0mm, Sch40 3.4mm입니다.' },
      { q: '배수관 최소 구배는 관경에 따라 어떻게 정해지나요?', a: '기계설비 기술기준 매뉴얼은 오·배수 수평관 최소 구배를 65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200으로 둡니다.' },
    ],
  },
  en: {
    name: 'Piping Calculator',
    description: 'Free field tool for KS pipe dimensions, drain slope, hydro-test water volume and flow velocity.',
    faqs: [
      { q: 'What is the difference between SPP and SPPS?', a: 'SPP has one wall per size; SPPS is pressure pipe in schedules. 50A is 3.8 mm SPP, 3.9 mm Sch40, 5.5 mm Sch80.' },
      { q: 'Why do KS and ASME diameters differ?', a: 'KS 15A is 21.7 mm OD while ASME 1/2" is 21.3 mm, so fittings should not be mixed.' },
      { q: 'How thick is stainless Sch10S?', a: 'Under KS D 3576, 25A is 1.65 mm Sch5S, 2.8 mm Sch10S, 3.0 mm Sch20S, 3.4 mm Sch40.' },
      { q: 'What minimum slope does a drain need?', a: '1/50 up to 65A, 1/100 for 80–150A and 1/200 from 200A for horizontal waste pipes.' },
    ],
  },
} as const;

export default async function PipingCalcPage({
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
      <PipingCalcClient />
    </>
  );
}
