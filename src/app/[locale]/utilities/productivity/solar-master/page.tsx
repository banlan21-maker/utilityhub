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
    ? '태양광 발전량·수익 계산기 — 지역별 발전시간, 전기요금 절감, 회수 기간, 태양열 온수 | Utility Hub'
    : 'Solar PV & Thermal Savings Calculator — Output, Bill Savings, Payback | Utility Hub';
  const description = isKo
    ? '지역별 일평균 발전시간(서울 3.2h, 전국 3.6h)과 한전 주택용 전기요금 전체(누진·부가세·전력기금·상계거래)로 태양광 발전량·절감액·회수 기간을 계산합니다. 태양열 온수는 급탕량 기준으로 가스·등유 절감액을 구합니다.'
    : 'Estimate solar PV output, bill savings and payback with Korean regional yields and the full KEPCO residential tariff, plus solar hot-water fuel savings sized to demand.';
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
    description: '지역별 발전시간과 한전 주택용 전기요금 전체로 태양광 발전량·절감액·회수 기간을, 급탕량 기준으로 태양열 온수 절감액을 계산하는 무료 도구입니다.',
    faqs: [
      { q: '여름보다 봄에 발전량이 더 많은 이유는 무엇인가요?', a: '여름은 장마로 흐린 날이 많고 패널 온도가 올라 출력이 1℃당 약 0.4% 줄어, 맑고 선선한 4~5월에 발전량이 가장 많은 경우가 많습니다.' },
      { q: '전기요금 절감액은 어떻게 계산하나요?', a: '태양광 전후 월 사용량으로 한전 주택용 저압 요금을 각각 계산해 차이를 봅니다. 누진 구간, 기본요금, 기후환경·연료비조정요금, 부가세, 전력산업기반기금이 모두 들어갑니다.' },
      { q: '보조금은 얼마나 받을 수 있나요?', a: '주택지원사업과 지자체 사업은 해마다·지역마다 다르므로, 모집 공고나 계약서에서 확인한 금액을 넣도록 했습니다.' },
      { q: '태양열 집열판은 클수록 좋은가요?', a: '아닙니다. 하루 쓰는 온수 열량보다 많이 모은 열은 버려집니다. 하루 200L를 15℃에서 45℃로 데우는 데는 약 25MJ가 필요합니다.' },
    ],
  },
  en: {
    name: 'Solar PV & Thermal Savings Calculator',
    description: 'Free tool for solar PV output, bill savings and payback with Korean regional yields and the full residential tariff, plus solar hot-water savings.',
    faqs: [
      { q: 'Why is spring better than summer?', a: 'Monsoon clouds and hot panels (about −0.4% per °C) reduce summer output, so April and May often produce the most.' },
      { q: 'How are bill savings calculated?', a: 'The full residential bill is calculated with and without solar each month, including tiers, charges, VAT and the power fund.' },
      { q: 'What about subsidies?', a: 'They vary by year and municipality, so enter only a confirmed amount.' },
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
