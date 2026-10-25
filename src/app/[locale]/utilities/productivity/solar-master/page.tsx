import type { Metadata } from 'next';
import SolarMasterClient from './SolarMasterClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/productivity/solar-master';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '태양광 발전량·수익 계산기 — 전기요금 절감, 발전사업 SMP·REC·IRR, 태양열 온수 | Utility Hub'
    : 'Solar PV, Power Plant & Thermal Calculator — Savings, Revenue, IRR | Utility Hub';
  const description = isKo
    ? '지역별 일평균 발전시간(서울 3.2h, 전국 3.6h)과 한전 주택용 전기요금 전체(누진·부가세·전력기금·상계거래)로 태양광 발전량·절감액·회수 기간을 계산합니다. 발전사업은 계약시장 20년 고정가격 또는 SMP·REC로 수익, IRR, DSCR을 구하고, 태양열 온수는 급탕량 기준으로 가스·등유 절감액을 구합니다.'
    : 'Estimate solar PV output, bill savings and payback with Korean regional yields and the full KEPCO residential tariff, power plant revenue and IRR from contract or SMP + REC prices, and solar hot-water savings.';
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
    name: '태양광·태양열 발전량·수익 계산기',
    description: '지역별 발전시간과 한전 주택용 전기요금 전체로 태양광 절감액·회수 기간을, 계약시장 고정가격 또는 SMP·REC로 발전사업 수익·IRR을, 급탕량 기준으로 태양열 온수 절감액을 계산하는 무료 도구입니다.',
    faqs: [
      { q: '여름보다 봄에 발전량이 더 많은 이유는 무엇인가요?', a: '여름은 장마로 흐린 날이 많고 패널 온도가 올라 출력이 1℃당 약 0.4% 줄어, 맑고 선선한 4~5월에 발전량이 가장 많은 경우가 많습니다.' },
      { q: '전기요금 절감액은 어떻게 계산하나요?', a: '태양광 전후 월 사용량으로 한전 주택용 저압 요금을 각각 계산해 차이를 봅니다. 누진 구간, 기본요금, 기후환경·연료비조정요금, 부가세, 전력산업기반기금이 모두 들어갑니다.' },
      { q: '보조금은 얼마나 받을 수 있나요?', a: '주택지원사업과 지자체 사업은 해마다·지역마다 다르므로, 모집 공고나 계약서에서 확인한 금액을 넣도록 했습니다.' },
      { q: '계산 결과는 얼마나 정확한가요?', a: '한국동서발전 당진·울산 발전소의 2022~2026년 실측과 비교해 실측 보정을 켠 연간 발전량은 1% 안팎, 월별은 10~15% 차이였습니다. 그늘·방향이 나쁜 현장은 더 낮을 수 있습니다.' },
      { q: '2027년부터 새로 짓는 태양광 발전소도 REC를 받을 수 있나요?', a: '재생에너지법 개정으로 REC 신규 발급은 2026년 12월 31일까지입니다. 이후 신규 발전소는 정부 계약시장 경쟁입찰의 20년 고정가격이나 기업 PPA로 팔고, 기존 발전소의 현물시장은 2029년 말까지 운영될 예정입니다.' },
      { q: 'REC 가중치는 어떻게 매기나요?', a: '일반부지는 100kW 미만 1.2, 3,000kW까지 1.0, 초과 0.8을 구간별로 나눠 평균합니다. 1,000kW면 1.019입니다.' },
      { q: '태양열 집열판은 클수록 좋은가요?', a: '아닙니다. 하루 쓰는 온수 열량보다 많이 모은 열은 버려집니다. 하루 200L를 15℃에서 45℃로 데우는 데는 약 25MJ가 필요합니다.' },
    ],
  },
  en: {
    name: 'Solar PV, Power Plant & Thermal Calculator',
    description: 'Free tool for home solar savings, power plant revenue and IRR, and solar hot-water savings with Korean regional yields and tariffs.',
    faqs: [
      { q: 'Why is spring better than summer?', a: 'Monsoon clouds and hot panels (about −0.4% per °C) reduce summer output, so April and May often produce the most.' },
      { q: 'How are bill savings calculated?', a: 'The full residential bill is calculated with and without solar each month, including tiers, charges, VAT and the power fund.' },
      { q: 'What about subsidies?', a: 'They vary by year and municipality, so enter only a confirmed amount.' },
      { q: 'How accurate is it?', a: 'Against 2022–2026 measurements from plants in Dangjin and Ulsan, corrected annual yield matched within about 1% and monthly within 10–15%.' },
      { q: 'Do new plants from 2027 get RECs?', a: 'No. New REC issuance ends on 31 Dec 2026; new plants sell via the government contract market at a 20-year fixed price or via PPAs.' },
      { q: 'How is the REC weight set?', a: 'Land PV: 1.2 below 100 kW, 1.0 to 3 MW, 0.8 above, applied by band and averaged (1,000 kW → 1.019).' },
      { q: 'Is a bigger collector better?', a: 'No — heat beyond daily demand is wasted; 200 L from 15 to 45 °C needs about 25 MJ a day.' },
    ],
  },
} as const;

export default async function SolarMasterPage({
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
      <SolarMasterClient />
    </>
  );
}
