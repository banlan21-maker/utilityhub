import type { Metadata } from 'next';
import MetalWeightCalcClient from './MetalWeightCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/metal-weight-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '금속 중량 계산기 — H빔·찬넬·앵글·파이프 kg/m, KS 규격, 도장 면적 | Utility Hub'
    : 'Metal Weight Calculator — Steel Section kg/m, KS Sizes & Paint Area | Utility Hub';
  const description = isKo
    ? 'H형강·ㄷ형강·ㄱ형강·각파이프·SPP 강관 등 12가지 형상의 단위중량(kg/m)을 KS 규격 치수(필렛 포함)로 계산합니다. 단면도에서 t1(웹)·t2(플랜지) 위치를 표시하고 도장 면적·자재비·발주 내역까지 만듭니다.'
    : 'Weight per metre for H-beams, channels, angles, tubes and pipes using KS standard sizes with fillets, plus paint area, cost and an order list. The diagram shows exactly where t1 (web) and t2 (flange) are.';
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
    name: '금속 중량 & 면적 계산기',
    description: 'H빔·찬넬·앵글·파이프·철판 등 12가지 금속 형상의 단위중량, 도장 면적, 자재비를 KS 규격 치수로 계산하는 무료 도구입니다.',
    faqs: [
      { q: 'H빔·찬넬에서 t1과 t2는 각각 어디인가요?', a: 't1은 웹(H빔 가운데 세로판, 찬넬의 세로 등판) 두께, t2는 플랜지(위·아래 가로판) 두께입니다. H-200×100×5.5×8은 높이 200, 폭 100, 웹 5.5, 플랜지 8mm입니다.' },
      { q: '필렛(r)은 왜 넣어야 하나요?', a: '압연 형강은 웹과 플랜지가 만나는 안쪽이 둥글게 살이 붙어 있어, 빼고 계산하면 규격표보다 1~4% 가볍게 나옵니다. H-100×100×6×8(r=10)은 단면적 21.90㎠입니다.' },
      { q: '각파이프는 모서리를 어떻게 계산하나요?', a: 'KS D 3568 식 0.0157 × t × (A + B − 3.287t)처럼 모서리 바깥 반경을 2t로 보아 □100×100×3.2가 9.52 kg/m입니다.' },
      { q: '도장 면적은 어느 면을 기준으로 하나요?', a: '형강·봉재는 단면 둘레 전체, 파이프·각파이프는 바깥면만, 철판은 양면 또는 한 면을 골라 계산하고 절단면은 넣지 않습니다.' },
    ],
  },
  en: {
    name: 'Metal Weight & Area Calculator',
    description: 'Free tool for weight per metre, paint area and material cost of 12 metal shapes using KS standard sizes.',
    faqs: [
      { q: 'Which part is t1 and which is t2?', a: 't1 is the web (vertical centre plate or channel back); t2 is the flange (top and bottom plates). H-200×100×5.5×8 means depth 200, width 100, web 5.5, flange 8 mm.' },
      { q: 'Why include the fillet radius?', a: 'Rolled sections carry extra material at the web-flange junction; ignoring it gives 1–4% less weight than the tables.' },
      { q: 'How are square tube corners handled?', a: 'Following KS D 3568, the outside corner radius defaults to 2t, so □100×100×3.2 weighs 9.52 kg/m.' },
      { q: 'Which faces count as paint area?', a: 'Full perimeter for sections and bars, outside only for pipes and tubes, one or both faces for plates, excluding cut edges.' },
    ],
  },
} as const;

export default async function MetalWeightCalcPage({
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
      <MetalWeightCalcClient />
    </>
  );
}
