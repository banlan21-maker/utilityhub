import type { Metadata } from 'next';
import TileVisualizerClient from './TileVisualizerClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/design/tile-visualizer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '욕실 타일 시뮬레이터 — 내 사진에 실제 크기·원근으로 타일 깔아 보기 | Utility Hub'
    : 'Bathroom Tile Visualizer — Try Tiles on Your Photo at True Scale | Utility Hub';
  const description = isKo
    ? '내 욕실 사진이나 샘플 욕실의 바닥·벽에 실사 대리석·콘크리트·우드 타일을 실제 크기와 원근으로 깔아 봅니다. 조명·그림자·거울·유광 반사 유지, 줄눈·배치·마감, 전후 비교, 필요한 타일 장수까지. 사진은 브라우저 안에서만 처리됩니다.'
    : 'Lay tiles on your own bathroom photo or a sample room at true scale and perspective, keeping the lighting, with grout, offset layouts and tile counts. Processed in your browser.';
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
    name: '욕실 타일 시뮬레이터',
    description: '내 욕실 사진이나 샘플 욕실의 바닥·벽에 타일을 실제 크기와 원근으로 합성하고, 줄눈·배치를 바꿔 비교하며 필요한 타일 장수를 계산하는 무료 도구입니다.',
    faqs: [
      { q: '내 욕실 사진으로도 할 수 있나요?', a: '네. 사진을 올리고 바닥과 벽마다 네 모서리 점을 맞춘 뒤 실제 치수를 넣으면 그 원근대로 타일이 깔립니다. 앞에 있는 변기·세면대는 붓으로 칠해 원래 사진으로 남기고, 사진은 서버로 보내지 않습니다.' },
      { q: '사진은 어떻게 찍어야 잘 맞나요?', a: '휴대폰 기본(1배) 렌즈로 정면 벽을 보고 수평을 맞춰 찍는 것이 좋습니다. 광각(0.5배)은 가장자리 직선이 휘어 면이 어긋납니다.' },
      { q: '왜 실제 사진처럼 보이나요?', a: '대리석·콘크리트 무늬는 실제 재료 사진 텍스처를 타일마다 다르게 잘라 쓰고, 원래 사진의 빛 색과 그림자, 모서리 그늘, 베벨, 유광 반사를 더하며 샘플 욕실은 거울 속 벽까지 다시 그립니다.' },
      { q: '줄눈 색은 어떤 것이 많이 쓰이나요?', a: '밝은 타일에 화이트 줄눈은 이음매가 덜 보여 넓어 보이고, 그레이·차콜은 오염이 덜 보입니다. 바닥은 타일보다 한두 톤 어두운 줄눈을 많이 씁니다.' },
      { q: '필요한 타일 장수는 어떻게 세나요?', a: '면 치수, 타일 크기, 줄눈, 배치로 실제로 깔리는 장수(잘라 쓰는 장 포함)를 세고 여유 5%와 1.44㎡ 박스 기준 박스 수를 냅니다.' },
    ],
  },
  en: {
    name: 'Bathroom Tile Visualizer',
    description: 'Free tool to lay tiles on your own bathroom photo or a sample room at true scale and perspective, compare grout and layouts, and count tiles.',
    faqs: [
      { q: 'Can I use my own bathroom photo?', a: 'Yes. Align the four corners of each surface, enter real dimensions and paint over objects in front. Photos never leave your browser.' },
      { q: 'How should I take the photo?', a: 'Use the 1× lens, face the back wall and keep the phone level; ultra-wide lenses bend lines near the edges.' },
      { q: 'Why does it look like a real photo?', a: 'Real material photos cut per tile, the original lighting and shadows, corner occlusion, bevels and glossy reflections; the sample mirror reflects the new walls.' },
      { q: 'Which grout colour is common?', a: 'White hides joints on light tiles; grey or charcoal hides stains. Floors often use a darker grout.' },
      { q: 'How are tiles counted?', a: 'Pieces laid on the surface including cut pieces, plus 5% spare, in 1.44 m² boxes.' },
    ],
  },
} as const;

export default async function TileVisualizerPage({
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
    applicationCategory: 'DesignApplication',
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
      <TileVisualizerClient />
    </>
  );
}
