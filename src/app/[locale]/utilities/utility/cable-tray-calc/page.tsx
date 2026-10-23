import type { Metadata } from 'next';
import CableTrayCalcClient from './CableTrayCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/cable-tray-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '케이블 트레이 경사·오프셋 가공 계산기 (V-컷·3D 도면) | Utility Hub'
    : 'Cable Tray Slope & Offset Fabrication Calculator (V-cut, 3D) | Utility Hub';
  const description = isKo
    ? '케이블 트레이 오르막·내리막·오프셋 구간의 V-컷과 일자 절개 치수, 마킹 간격, 지지점 위치를 계산하고 3D로 접히는 모습을 보여줍니다. 30·45·60° 프리셋과 실측 입력 지원.'
    : 'Field-fabricate cable tray rises, drops and offsets: V-cut and slit dimensions for both bends, marking distance, support positions and a 3D fold preview.';
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
    name: '케이블 트레이 경사·오프셋 가공 계산기',
    description: '케이블 트레이 오르막·내리막·오프셋 구간의 V-컷·일자 절개 치수, 마킹 간격, 지지점 위치를 계산하고 3D 형상으로 보여주는 전기공사 현장용 무료 도구입니다.',
    faqs: [
      { q: '오르막 구간인데 왜 한쪽은 V-컷이고 한쪽은 일자 절개인가요?', a: '상하 꺾임은 바닥판이 접히는 축이므로, 레일 윗부분이 가까워지는 오르막 시작점은 V-컷으로 겹치는 부분을 잘라내고, 레일이 벌어지는 오르막 끝점은 일자로 절개한 뒤 틈을 연결판으로 덮습니다. 내리막은 그 반대입니다.' },
      { q: 'V-컷 치수는 어떻게 계산하나요?', a: 'V-컷 한쪽 폭은 기준 치수 × tan(꺾임 각도 ÷ 2)입니다. 상하 꺾임은 측면 레일 높이, 좌우 꺾임은 트레이 폭이 기준이며, 레일 높이 100mm·30°면 한쪽 26.8mm입니다.' },
      { q: '볼트 구멍은 어디에 뚫나요?', a: '꺾은 뒤 각도 조절형 연결판을 절단면에 맞춰 대고 연결판 구멍을 형판 삼아 천공합니다(NEMA VE 2 4.5.3). 구멍 크기는 기존 트레이 구멍과 맞춥니다.' },
      { q: '행거(지지) 간격은 어떤 기준인가요?', a: '국내 규정에는 트레이 지지 간격 수치가 없어 설계도서·제조사 허용 간격을 따르며, 조절형 연결판 양쪽 600mm 이내에 지지점을 두라는 NEMA VE 2 권장을 반영합니다.' },
    ],
  },
  en: {
    name: 'Cable Tray Slope & Offset Fabrication Calculator',
    description: 'Free field tool for electricians: V-cut and slit dimensions for cable tray rises, drops and offsets, marking distance, support positions and a 3D fold preview.',
    faqs: [
      { q: 'Why is one bend a V-cut and the other a slit?', a: 'In a vertical bend the tray bottom is the fold axis. Where the rails close (start of a rise) the overlap is removed with a V-cut; where they open (end of a rise) they are slit straight and the gap is covered with a splice plate. A drop is the reverse.' },
      { q: 'How is the V-cut size calculated?', a: 'Half width equals the reference dimension times tan(bend angle ÷ 2): side rail height for vertical bends, tray width for horizontal bends. A 100 mm rail at 30° needs 26.8 mm each side of center.' },
      { q: 'Where do the bolt holes go?', a: 'After bending, clamp the adjustable splice plate against the cut ends and drill through its holes, matching the existing tray holes (NEMA VE 2, 4.5.3).' },
      { q: 'What is the support spacing based on?', a: 'Korean codes give no numeric tray span, so use the project or manufacturer span; the calculator also applies the NEMA VE 2 rule of a support within 600 mm of each adjustable splice plate.' },
    ],
  },
} as const;

export default async function CableTrayCalcPage({
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
      <CableTrayCalcClient />
    </>
  );
}
