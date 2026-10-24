import type { Metadata } from 'next';
import VatCalcClient from './VatCalcClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/finance/vat-calc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '부가세 계산기 — 공급가액 역산·부가세 신고 예상·간이과세자 | Utility Hub'
    : 'Korean VAT Calculator — Net/Gross Split, VAT Return & Simplified Taxpayer | Utility Hub';
  const description = isKo
    ? '부가세 10%를 더하거나 합계에서 공급가액·세액을 나누고(원 단위 합계 일치), 일반과세자 부가세 신고 납부·환급액과 간이과세자 업종별 부가세를 계산해 비교합니다.'
    : 'Add or split Korean 10% VAT to the won, estimate a general taxpayer\'s VAT return and a simplified taxpayer\'s annual VAT by industry, and compare the two.';
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
    name: '부가세 계산기 (공급가액 역산·부가세 신고·간이과세자)',
    description: '부가세 10% 계산과 공급가액 역산, 일반과세자 부가세 신고 예상액, 간이과세자 업종별 부가세를 계산하는 무료 도구입니다.',
    faqs: [
      { q: '부가세 포함 금액에서 공급가액은 어떻게 구하나요?', a: '합계를 1.1로 나누면 공급가액이고 합계에서 공급가액을 빼면 부가세입니다. 110,000원이면 공급가액 100,000원, 부가세 10,000원입니다.' },
      { q: '일반과세자는 부가세를 얼마나 내나요?', a: '신고 기간(개인은 6개월) 매출세액(매출 공급가액의 10%)에서 세금계산서·사업용 카드 등으로 증빙한 매입세액을 뺀 금액을 내고, 매입세액이 더 크면 환급받습니다.' },
      { q: '간이과세자 부가세는 어떻게 계산하나요?', a: '1년 매출(부가세 포함)에 업종별 부가가치율(15~40%)과 10%를 곱하고 매입액의 0.5%를 뺍니다. 1년 매출이 4,800만 원 미만이면 납부의무가 면제되지만 신고는 해야 합니다.' },
      { q: '간이과세자가 되는 기준은 얼마인가요?', a: '2024년 7월부터 직전 연도 매출이 1억 400만 원 미만인 개인사업자입니다. 부동산임대업과 과세유흥장소는 4,800만 원 미만이 기준입니다.' },
    ],
  },
  en: {
    name: 'Korean VAT Calculator',
    description: 'Free calculator for Korean 10% VAT: split VAT-inclusive totals, estimate a general taxpayer\'s VAT return and a simplified taxpayer\'s annual VAT.',
    faqs: [
      { q: 'How do I get the net amount from a VAT-inclusive total?', a: 'Divide the total by 1.1 for the net amount; the VAT is the total minus the net. ₩110,000 is ₩100,000 net and ₩10,000 VAT.' },
      { q: 'How much VAT does a general taxpayer pay?', a: 'Output tax (10% of net sales) minus documented input tax for the filing period, six months for individuals; a larger input tax means a refund.' },
      { q: 'How is simplified taxpayer VAT calculated?', a: 'Annual VAT-inclusive sales × industry value-added rate (15–40%) × 10%, minus 0.5% of purchases. Sales under ₩48M are exempt from payment but must be filed.' },
      { q: 'Who can be a simplified taxpayer?', a: 'Since July 2024, individuals with prior-year sales under ₩104M, or under ₩48M for real-estate rental and entertainment venues.' },
    ],
  },
} as const;

export default async function VatCalcPage({
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
      <VatCalcClient />
    </>
  );
}
