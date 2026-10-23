import type { Metadata } from 'next';
import SalaryCalcClient from './SalaryCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/finance/salary-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '2026 연봉 실수령액 계산기 — 4대보험·소득세 공제 후 월급 | Utility Hub'
    : '2026 Korean Salary Take-Home Pay Calculator | Utility Hub';
  const description = isKo
    ? '연봉·월급을 입력하면 2026년 4대보험 요율과 국세청 근로소득 간이세액표로 국민연금·건강보험·소득세를 공제한 월 실수령액을 계산합니다. 연봉별 실수령액 표와 시급·주휴수당 계산도 지원합니다.'
    : 'Calculate Korean take-home pay from an annual salary or monthly pay after 2026 social insurance and income tax (official withholding table). Includes a salary table and hourly pay with weekly holiday pay.';
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
    name: '2026 연봉·급여 실수령액 계산기',
    description: '연봉·월급에서 2026년 4대보험과 근로소득세(간이세액표)를 공제한 월 실수령액을 계산하고, 시급 기준 주휴수당·잔업·특근 수당도 계산하는 무료 도구입니다.',
    faqs: [
      { q: '연봉 3,000만·4,000만·5,000만 원의 월 실수령액은 얼마인가요?', a: '본인 1명, 식대 비과세 월 20만 원, 퇴직금 별도 기준으로 연봉 3,000만 원은 월 약 224만 원, 4,000만 원은 월 약 293만 원, 5,000만 원은 월 약 357만 원입니다. 부양가족이 늘어나면 근로소득세가 줄어 실수령액이 더 많아집니다.' },
      { q: '2026년 4대보험 요율은 얼마인가요?', a: '근로자 부담 기준으로 국민연금 4.75%, 건강보험 3.595%, 장기요양보험은 건강보험료의 13.14%, 고용보험 0.9%로 합계 약 9.72%입니다. 산재보험은 사업주가 전액 부담합니다.' },
      { q: '근로소득세는 어떻게 계산되나요?', a: '회사는 매달 국세청 근로소득 간이세액표에 따라 소득세를 원천징수하고, 지방소득세는 소득세의 10%입니다. 이 계산기는 2026년 3월 1일 이후 지급분 간이세액표(100% 기준)와 8~20세 자녀 세액공제를 반영합니다.' },
      { q: '주휴수당은 어떻게 계산되나요?', a: '1주 소정근로시간이 15시간 이상이면 (주 소정근로시간 ÷ 40) × 8 × 시급만큼 주휴수당이 붙고, 주 40시간 이상이면 8시간분이 최대입니다. 잔업·특근 시간은 포함되지 않습니다.' },
    ],
  },
  en: {
    name: '2026 Korean Salary & Take-Home Pay Calculator',
    description: 'Free calculator for Korean take-home pay after 2026 social insurance and income tax (official withholding table), plus hourly pay with weekly holiday pay, overtime and holiday shifts.',
    faqs: [
      { q: 'How much is take-home pay on a ₩40 million salary in Korea?', a: 'With severance paid separately, a ₩200,000 monthly tax-free meal allowance and no dependents, a ₩40,000,000 salary gives about ₩2,936,000 per month. ₩30,000,000 gives about ₩2,244,000 and ₩50,000,000 about ₩3,572,000.' },
      { q: 'What are the 2026 Korean social insurance rates?', a: 'The employee share is National Pension 4.75%, Health Insurance 3.595%, Long-term Care at 13.14% of the health premium and Employment Insurance 0.9%, about 9.72% in total. Industrial accident insurance is paid by the employer.' },
      { q: 'How is Korean income tax withheld?', a: 'Employers withhold income tax monthly using the National Tax Service simplified withholding table; local income tax is 10% of it. This calculator uses the table for payments from March 1, 2026 at the 100% option, including the child tax credit.' },
      { q: 'How is weekly holiday pay calculated?', a: 'If scheduled hours are 15 or more per week, weekly holiday pay is (weekly scheduled hours ÷ 40) × 8 × hourly wage, capped at 8 hours of pay at 40 hours. Overtime and holiday shifts do not count.' },
    ],
  },
} as const;

export default async function SalaryCalcPage({
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
    applicationCategory: 'FinanceApplication',
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
      <SalaryCalcClient />
    </>
  );
}
