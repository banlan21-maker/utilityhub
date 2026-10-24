import type { Metadata } from 'next';
import AcCapacityCalcClient from './AcCapacityCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/lifestyle/ac-capacity-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '에어컨 평형 계산기 — 방·아파트 거실·매장 몇 평형? kW 환산 | Utility Hub'
    : 'Air Conditioner Size Calculator — Pyeong Class & kW for Rooms, Apartments, Shops | Utility Hub';
  const description = isKo
    ? '방 면적, 아파트 평형, 매장 업종과 인원으로 몇 평형 에어컨이 맞는지 계산합니다. 34평형 아파트 거실은 17평형 스탠드처럼 제조사 기준(냉방면적 1㎡당 약 123W)으로 냉방능력 kW까지 알려 줍니다.'
    : 'Find the right air conditioner pyeong class and cooling capacity (kW) for a room, an apartment living room or a shop, based on manufacturer cooling-area ratings.';
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
    name: '에어컨 평형 계산기',
    description: '방·아파트 거실·매장에 맞는 에어컨 평형과 냉방능력(kW)을 제조사 냉방면적 기준으로 계산하는 무료 도구입니다.',
    faqs: [
      { q: '34평 아파트면 34평형 에어컨을 사야 하나요?', a: '아닙니다. 거실 스탠드는 공급면적의 절반 이상을 기준으로 고르므로 34평형 아파트는 17평형 스탠드가 기본이고, 남향·베란다 확장형이면 18~20평형을 봅니다.' },
      { q: '평형과 kW는 어떻게 바꿔 보나요?', a: '제조사 사양표 기준 냉방면적 1㎡당 약 123W입니다. 6평형은 약 2.4kW, 10평형은 약 4.1kW, 17평형은 약 6.9kW, 30평형은 약 12.2kW입니다.' },
      { q: '용량을 넉넉하게 사면 더 좋지 않나요?', a: '너무 크면 켜졌다 꺼졌다를 반복해 습기를 덜 빼고 구입비도 오릅니다. 한 단계 큰 정도는 괜찮지만 두세 단계 이상 키우는 것은 권하지 않습니다.' },
      { q: '천장이 높으면 얼마나 더 필요한가요?', a: '일반 천장 2.4m 기준으로 높이에 비례해 2.7m는 약 12.5%, 3m는 25%, 3.6m는 50% 더 필요합니다.' },
      { q: '보정 비율은 어디서 나온 값인가요?', a: '평형·냉방면적·kW 관계와 거실 기준은 제조사 사양표와 LG전자 선택 가이드를 따랐고, 창 방향·층·업종 가산치는 현장 경험치입니다.' },
    ],
  },
  en: {
    name: 'Air Conditioner Size Calculator',
    description: 'Free tool to find the right air conditioner pyeong class and cooling capacity (kW) for rooms, apartment living rooms and shops.',
    faqs: [
      { q: 'Does a 34-pyeong apartment need a 34-pyeong AC?', a: 'No. A living-room floor unit is sized from at least half the supply area, so a 34-pyeong apartment needs a 17-pyeong unit, or 18–20 if it faces south with an enclosed balcony.' },
      { q: 'How do pyeong classes convert to kW?', a: 'Spec sheets give about 123 W per ㎡ of cooling area: 6-pyeong ≈ 2.4 kW, 10-pyeong ≈ 4.1 kW, 17-pyeong ≈ 6.9 kW, 30-pyeong ≈ 12.2 kW.' },
      { q: 'Is a bigger unit always better?', a: 'An oversized unit cycles on and off and removes less humidity. One class up is fine; two or three classes larger is not recommended.' },
      { q: 'Where do the add-on percentages come from?', a: 'The class, area and kW relationship follows manufacturer spec sheets and LG Electronics\' guide; direction, floor and business add-ons are installer rules of thumb.' },
    ],
  },
} as const;

export default async function AcCapacityCalcPage({
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
      <AcCapacityCalcClient />
    </>
  );
}
