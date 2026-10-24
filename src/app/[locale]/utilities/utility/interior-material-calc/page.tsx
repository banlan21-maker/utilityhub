import type { Metadata } from 'next';
import InteriorMaterialCalcClient from './InteriorMaterialCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/interior-material-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '타일·도배지 소요량 계산기 — 타일 몇 박스, 벽지 몇 롤? 로스율 포함 | Utility Hub'
    : 'Tile & Wallpaper Calculator — Boxes, Rolls and Waste | Utility Hub';
  const description = isKo
    ? '바닥·욕실 벽 타일을 실제 배치대로 세어 박스 수를, 방 크기나 집 평수로 실크·합지 벽지 롤 수를 계산합니다. 엇갈림·대각선 시공, 줄눈, 문·창, 천장, 무늬 반복까지 반영합니다.'
    : 'Count tile boxes for floors and bathroom walls and wallpaper rolls per room or flat size, including offsets, diagonals, joints, openings, ceilings and pattern repeats.';
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
    name: '타일·도배지 소요량 & 로스율 계산기',
    description: '타일 박스 수와 도배지 롤 수를 실제 배치·재단 방식대로 계산하는 무료 도구입니다.',
    faqs: [
      { q: '타일 로스율은 몇 %로 잡아야 하나요?', a: '면적만으로 셀 때는 정자 5~10%, 엇갈림 10% 안팎, 대각선 15% 이상을 더합니다. 줄마다 장수를 세어 잘리는 장을 넣었다면 파손·보수용 3~5%만 더하면 됩니다.' },
      { q: '엇갈림으로 붙이면 왜 더 필요한가요?', a: '밀린 줄은 양 끝이 잘린 장이 되어 한 장이 더 들어갑니다. 1.8m × 2.4m 바닥에 600각은 정자 12장, 반장 엇갈림 14장입니다.' },
      { q: '도배지 1롤로 몇 평을 바를 수 있나요?', a: '실크(106cm × 15.6m)와 광폭 합지는 약 16.5㎡(5평), 소폭 합지는 약 6.6㎡(2평)이지만, 층고 2.3m면 실크 1롤에서 벽 폭 6장이 나와 실제로는 약 4.4평입니다.' },
      { q: '무늬 있는 벽지는 얼마나 더 드나요?', a: '폭을 무늬 반복 길이의 배수로 잘라야 합니다. 층고 2.3m에 반복 53cm면 한 폭이 2.65m가 되어 실크 1롤의 벽 폭이 6장에서 5장으로 줄어듭니다.' },
    ],
  },
  en: {
    name: 'Tile & Wallpaper Calculator',
    description: 'Free tool that counts tile boxes and wallpaper rolls the way installers lay and cut them.',
    faqs: [
      { q: 'What waste allowance should I use for tiles?', a: 'By area: 5–10% straight, about 10% offset, 15%+ diagonal. If cut pieces are counted row by row, add only 3–5% spare.' },
      { q: 'Why do offset layouts need more tiles?', a: 'Each shifted row needs one more piece; a 1.8 m × 2.4 m floor takes 12 tiles of 600×600 straight but 14 with a half offset.' },
      { q: 'How much does one roll of wallpaper cover?', a: 'About 16.5 m² for silk and wide rolls and 6.6 m² for narrow rolls, less in practice because of strip offcuts.' },
      { q: 'How much extra for patterned wallpaper?', a: 'Strips are cut to a multiple of the repeat, so fewer strips come out of each roll.' },
    ],
  },
} as const;

export default async function InteriorMaterialCalcPage({
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
      <InteriorMaterialCalcClient />
    </>
  );
}
