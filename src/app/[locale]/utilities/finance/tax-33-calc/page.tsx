import type { Metadata } from 'next';
import Tax33CalcClient from './Tax33CalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/finance/tax-33-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '3.3% 세금 계산기 — 프리랜서 실수령액·종합소득세 환급 예상 | Utility Hub'
    : 'Korean 3.3% Freelancer Tax Calculator — Net Pay & May Refund | Utility Hub';
  const description = isKo
    ? '프리랜서 계약금에서 3.3%를 뗀 실수령액(10원 미만 절사)과 역산, 5월 종합소득세 환급·추가 납부 예상액, 지역가입자 건강보험·국민연금 월 보험료를 2026년 기준으로 계산합니다.'
    : 'Net pay after Korea\'s 3.3% freelancer withholding, a May income tax refund estimate and monthly regional health insurance and pension, using 2026 rates.';
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
    name: '프리랜서 3.3% 세금 계산기 (실수령액·종합소득세 환급)',
    description: '프리랜서 계약금의 3.3% 원천징수 실수령액, 5월 종합소득세 환급 예상액, 지역가입자 건강보험·국민연금 월 보험료를 계산하는 무료 도구입니다.',
    faqs: [
      { q: '3.3%는 왜 3.3%인가요?', a: '사업소득을 지급하는 쪽이 소득세 3%를 원천징수하고 그 소득세의 10%를 지방소득세로 함께 떼어 3.3%가 됩니다. 세금은 10원 미만을 버리므로 3.3%보다 몇 원 적을 수 있습니다.' },
      { q: '3.3% 뗀 돈은 돌려받을 수 있나요?', a: '다음 해 5월 종합소득세 신고 때 수입에서 경비를 빼고 공제를 적용한 실제 세금과 비교해, 미리 낸 3.3%가 더 많으면 차액을 돌려받고 적으면 더 냅니다.' },
      { q: '경비율은 어디서 알 수 있나요?', a: '홈택스 → 조회/발급 → 기준·단순경비율에서 본인 업종코드로 조회할 수 있습니다. 직전 연도 수입이 많으면 단순경비율 대신 기준경비율이나 장부 기장이 필요합니다.' },
      { q: '프리랜서 건강보험료는 얼마나 나오나요?', a: '지역가입자는 월 소득(소득금액 ÷ 12)의 7.19%에 장기요양보험료(건강보험료의 13.14%)를 더해 내고, 국민연금은 월 소득의 9.5%를 전액 본인이 냅니다(2026년). 재산분 보험료는 별도입니다.' },
    ],
  },
  en: {
    name: 'Korean 3.3% Freelancer Tax Calculator',
    description: 'Free calculator for net pay after Korea\'s 3.3% freelancer withholding, the May income tax refund and monthly regional health insurance and pension.',
    faqs: [
      { q: 'Why exactly 3.3%?', a: 'The payer withholds 3% income tax plus 10% of it as local income tax, totalling 3.3%. Tax is rounded down to 10 KRW.' },
      { q: 'Can I get the 3.3% back?', a: 'At the May comprehensive income tax filing the real tax after expenses and deductions is compared with what was withheld; any excess is refunded and any shortfall is paid.' },
      { q: 'Where do I find my expense rate?', a: 'On Hometax under 기준·단순경비율, by business code. Above certain revenue levels the simple rate no longer applies.' },
      { q: 'How much health insurance will I pay?', a: 'Regional subscribers pay 7.19% of monthly business income plus 13.14% of that for long-term care, and 9.5% national pension in full (2026). Property-based premiums are extra.' },
    ],
  },
} as const;

export default async function Tax33CalcPage({
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
    audience: { '@type': 'Audience', geographicArea: { '@type': 'Country', name: 'South Korea' } },
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
      <Tax33CalcClient />
    </>
  );
}
