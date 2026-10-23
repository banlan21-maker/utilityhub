import type { Metadata } from 'next';
import ElbowOffsetClient from './ElbowOffsetClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '배관 엘보 오프셋 계산기 — 직관 절단길이 즉시 계산 | Utility Hub'
    : 'Pipe Elbow Offset Calculator — Cut Length Instant Calc | Utility Hub';
  const description = isKo
    ? '배관 엘보 오프셋 거리와 직관 절단길이를 즉시 계산. 단순 오프셋·롤링 오프셋·절단길이 3가지 모드. 90° 장·단반경, 45° 장반경 엘보의 ASME B16.9 규격 테이크아웃 적용. 현장 배관공 모바일 최적화.'
    : 'Calculate pipe elbow offset and cut length instantly. Three modes: simple offset, rolling offset and cut length, using ASME B16.9 take-outs for 90° long/short radius and 45° long radius elbows.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/elbow-offset`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/elbow-offset',
        en: 'https://www.theutilhub.com/en/utilities/utility/elbow-offset',
        'x-default': 'https://www.theutilhub.com/ko/utilities/utility/elbow-offset',
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

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/elbow-offset';

const SCHEMA_TEXT = {
  ko: {
    name: '배관 엘보 오프셋 계산기',
    description: '배관 엘보 오프셋 거리와 직관 절단길이를 즉시 계산하는 무료 현장 도구. 단순·롤링 오프셋·절단길이 3가지 모드, ASME B16.9 규격 테이크아웃 적용.',
    faqs: [
      { q: '테이크아웃(Take-out)이란 무엇인가요?', a: '테이크아웃은 엘보의 중심점에서 파이프 접합면(끝단)까지의 거리입니다. 두 엘보 사이의 직관 길이를 구하려면 목표 거리에서 양쪽 테이크아웃을 빼야 합니다. 본 계산기는 ASME B16.9 표준 규격 데이터를 직접 적용합니다.' },
      { q: '장반경(LR)과 단반경(SR) 엘보는 어떻게 다른가요?', a: 'LR은 굽힘반경이 호칭경의 1.5배로 흐름이 완만한 표준 제품이고, SR은 호칭경과 같아 좁은 공간에 쓰지만 흐름 저항이 큽니다. SR 테이크아웃도 규격값(예: 50A 51mm)을 쓰며, 45° 엘보는 장반경만, 단반경은 25A 이상만 규격에 있습니다.' },
      { q: '롤링 오프셋은 언제 사용하나요?', a: '배관이 수평·수직면을 동시에 이동해야 할 때 사용합니다. 가로·세로 이동거리를 입력하면 대각선 Travel, 기울기각, 절단길이가 자동 계산됩니다. 이 모드는 구조상 45° 엘보로만 동작합니다.' },
      { q: '이 결과를 공식 자료로 사용해도 되나요?', a: '본 결과는 현장 참고용입니다. 엘보 제조사별로 실제 테이크아웃 공차가 있을 수 있으며, 나사식 엘보는 나사 물림 길이도 고려해야 합니다. 시공 전 반드시 실제 제품 치수와 현장 실측값을 확인하세요.' },
    ],
  },
  en: {
    name: 'Pipe Elbow Offset Calculator',
    description: 'Free field tool for pipe elbow offsets and cut lengths: simple offset, rolling offset and cut length modes with ASME B16.9 take-outs.',
    faqs: [
      { q: 'What is take-out?', a: 'Take-out is the distance from the elbow centre to the pipe end face. To get the straight pipe between two elbows, subtract both take-outs from the centre-to-centre distance. This calculator uses ASME B16.9 dimensions directly.' },
      { q: 'What is the difference between LR and SR elbows?', a: 'LR elbows have a bend radius of 1.5 × nominal size and are the standard choice; SR elbows have 1.0 × nominal size for tight spaces but more flow resistance. SR take-outs also use B16.9 values (e.g. 51 mm for 2"); 45° elbows are long radius only and SR starts at NPS 1".' },
      { q: 'When do I use a rolling offset?', a: 'When the pipe must move horizontally and vertically at the same time. Enter both distances to get the true offset, travel, roll angle and cut length. This mode uses 45° elbows.' },
      { q: 'Can I use these results as official data?', a: 'Results are for field reference. Fitting makers have small tolerances on take-out, and threaded fittings need thread engagement allowed for. Always check actual fitting dimensions and site measurements before cutting.' },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ElbowOffsetClient />
    </>
  );
}
