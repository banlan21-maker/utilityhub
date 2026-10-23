import type { Metadata } from 'next';
import WireSizeCalcClient from './WireSizeCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/wire-size-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '전선 굵기 계산기 — KEC 허용전류·전압강하·차단기 (SQ 산정) | Utility Hub'
    : 'Wire Size Calculator — Ampacity, Voltage Drop & Breaker (KEC/IEC) | Utility Hub';
  const description = isKo
    ? '부하전류와 배선 거리, HFIX·CV 전선과 공사방법(전선관·트레이 등)을 넣으면 KEC 허용전류 표, 온도·회로 수 보정, 차단기 정격, KEC 232.3.9 전압강하 한도를 모두 만족하는 전선 굵기(㎟)를 계산합니다.'
    : 'Size low-voltage copper conductors with IEC 60364-5-52 ampacity tables, temperature and grouping corrections, breaker coordination (IB ≤ In ≤ IZ) and KEC voltage drop limits.';
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

const SCHEMA_TEXT = {
  ko: {
    name: '전선 굵기 계산기 (KEC 허용전류·전압강하)',
    description: 'KEC가 준용하는 KS C IEC 60364-5-52 허용전류 표와 KEC 232.3.9 전압강하 한도, KEC 212.4 차단기 협조로 저압 전선 굵기를 산정하는 무료 도구입니다.',
    faqs: [
      { q: '전압강하 기준이 "간선 2%, 분기 2%" 아닌가요?', a: '그 값은 KEC 시행 전 내선규정 기준입니다. 현행 KEC 232.3.9는 인입구에서 기기까지 저압 수전 시 조명 3%·기타 5%, 고압 이상 수전 시 조명 6%·기타 8% 이하로 정하고, 100m 초과분은 1m당 0.005%(최대 0.5%)를 더할 수 있습니다.' },
      { q: '왜 같은 전류인데 공사방법에 따라 굵기가 달라지나요?', a: '열 방출 조건이 달라서입니다. XLPE 2.5㎟(3상 부하)는 단열벽 속 전선관 23A, 전선관 28A, 직접 고정 30A이며, 주위 40°C면 0.91배, 같은 관 2회로면 0.8배로 더 줄어듭니다.' },
      { q: '차단기와 전선 굵기는 어떻게 맞추나요?', a: 'KEC 212.4.1에 따라 부하전류 ≤ 차단기 정격 ≤ 전선 허용전류가 되어야 합니다. 부하 이상의 표준 차단기를 고른 뒤 보정 후 허용전류가 그 정격 이상인 전선을 선택합니다.' },
      { q: 'HFIX와 CV 케이블은 어떻게 다른가요?', a: '둘 다 90°C 가교 절연이라 같은 XLPE 표를 쓰지만, HFIX는 전선관·몰드 안(A1·B1)에만, CV·F-CV는 직접 고정(C)이나 트레이(E)에도 시설할 수 있습니다.' },
    ],
  },
  en: {
    name: 'Wire Size Calculator (KEC ampacity & voltage drop)',
    description: 'Free low-voltage conductor sizing with IEC 60364-5-52 ampacity tables, KEC 232.3.9 voltage drop limits and KEC 212.4 breaker coordination.',
    faqs: [
      { q: 'Isn\'t the voltage drop rule 2 % feeder plus 2 % branch?', a: 'That was the old Korean wiring code. KEC 232.3.9 limits the total drop to 3 % lighting / 5 % other on an LV supply and 6 % / 8 % on an HV supply, plus 0.005 % per metre beyond 100 m (max 0.5 %).' },
      { q: 'Why does the installation method change the size?', a: 'Heat dissipation differs. A 2.5 mm² XLPE conductor (three loaded) carries 23 A in insulated-wall conduit, 28 A in conduit and 30 A clipped direct, reduced further by 0.91 at 40 °C and 0.8 for two grouped circuits.' },
      { q: 'How are the breaker and cable matched?', a: 'KEC 212.4.1 requires load current ≤ breaker rating ≤ cable ampacity. Pick the standard breaker at or above the load, then the cable whose corrected ampacity is at least that rating.' },
      { q: 'What is the difference between HFIX and CV?', a: 'Both are 90 °C cross-linked and use the XLPE table, but HFIX must run in conduit (A1, B1) while CV/F-CV can also be clipped direct (C) or laid on tray (E).' },
    ],
  },
} as const;

export default async function WireSizeCalcPage({
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
      <WireSizeCalcClient />
    </>
  );
}
