import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { HandCoins } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import { REFERENCE_VALUES } from '@/constants/referenceValues';
import { FULLTIME_MONTH_HOURS } from '@/lib/albaPay';
import AlbaPayClient from './AlbaPayClient';
import s from './alba-pay.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/finance/alba-pay-calc';

type Props = { params: Promise<{ locale: string }> };

// 최저시급 표·제목 연도는 기준값 파일을 따른다 (새해 값이 들어가면 제목도 바뀜)
const WAGE_ROWS = REFERENCE_VALUES.filter((r) => r.id === 'kr.minimum_wage')
  .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
const LATEST = [...WAGE_ROWS].reverse().find((r) => r.status === 'confirmed') ?? WAGE_ROWS[WAGE_ROWS.length - 1];
const PREV = WAGE_ROWS[WAGE_ROWS.indexOf(LATEST) - 1];
const yearOf = (r?: { effectiveFrom: string }) => (r ? Number(r.effectiveFrom.slice(0, 4)) : 0);

const kstYear = () => new Date(Date.now() + 9 * 3600_000).getUTCFullYear();

const money = (n: number, isKo: boolean) => (isKo ? `${n.toLocaleString('ko-KR')}원` : `₩${n.toLocaleString('en-US')}`);

function filler(isKo: boolean) {
  const vars: Record<string, string> = {
    year: String(yearOf(LATEST)),
    wage: money(LATEST.value, isKo),
    monthly: money(LATEST.value * FULLTIME_MONTH_HOURS, isKo),
    prevYear: String(yearOf(PREV)),
    prevWage: PREV ? money(PREV.value, isKo) : '',
    juhyu20: money(LATEST.value * 4, isKo),
  };
  const fill = (v: string) => v.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  return <T,>(v: T): T => JSON.parse(JSON.stringify(v), (_k, x) => (typeof x === 'string' ? fill(x) : x));
}

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'AlbaPay' });
  const fill = filler(locale === 'ko');
  const raw = <T,>(k: string) => fill(t.raw(k) as T);
  return {
    title: raw<string>('title'),
    subtitle: raw<string>('subtitle'),
    metaTitle: raw<string>('meta_title'),
    metaDescription: raw<string>('meta_description'),
    description: raw<string>('description'),
    shareTitle: raw<string>('share_title'),
    aboutTitle: raw<string>('about_title'),
    about: raw<string>('about'),
    formula: raw<string>('formula'),
    under5Title: raw<string>('under5_title'),
    under5: raw<string[]>('under5'),
    breakTitle: raw<string>('break_title'),
    breaks: raw<string[]>('break'),
    tableTitle: raw<string>('table_title'),
    tableHead: raw<string[]>('table_head'),
    confirmed: raw<string>('table_confirmed'),
    pending: raw<string>('table_pending'),
    excludedTitle: raw<string>('excluded_title'),
    excluded: raw<string[]>('excluded'),
    useCases: raw<SeoContent['useCases']>('use_cases'),
    steps: raw<SeoContent['steps']>('how_to'),
    faqs: raw<SeoContent['faqs']>('faq'),
  };
}

/** 번역문의 <b>…</b> 만 굵게 */
const rich = (text: string): ReactNode[] =>
  text.split(/(<b>.*?<\/b>)/g).map((part, i) =>
    part.startsWith('<b>') ? <strong key={i}>{part.slice(3, -4)}</strong> : part);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const c = await content(isKo ? 'ko' : 'en');
  const canonical = `${BASE}/${locale}${PATH}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: isKo
      ? ['주휴수당 계산기', '알바 월급 계산기', `${yearOf(LATEST)} 최저시급`, '시급 계산기', '주휴수당 조건', '알바 실수령액', '5인 미만 주휴수당']
      : [`Korea minimum wage ${yearOf(LATEST)}`, 'weekly holiday allowance Korea', 'part-time salary calculator Korea', 'juhyu sudang'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function AlbaPayPage({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const [ko, en] = await Promise.all([content('ko'), content('en')]);
  const c = isKo ? ko : en;

  // 처음 보여 줄 연도: 오늘(한국 시간) 연도 — 브라우저에서 다시 확인한다
  const years = WAGE_ROWS.map(yearOf);
  const initialYear = Math.min(Math.max(kstYear(), years[0]), years[years.length - 1]);

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: c.title,
    operatingSystem: 'Web Browser',
    applicationCategory: 'FinanceApplication',
    audience: { '@type': 'Audience', geographicArea: { '@type': 'Country', name: 'South Korea' } },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    url: `${BASE}/${locale}${PATH}`,
    inLanguage: locale,
    description: c.metaDescription,
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  const seo = (x: typeof ko): SeoContent => ({
    title: x.title, description: x.description, useCases: x.useCases, steps: x.steps, faqs: x.faqs,
  });

  return (
    <div className={s.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <NavigationActions />
      <ToolHeader icon={<HandCoins />} title={c.title} subtitle={c.subtitle} />

      <AlbaPayClient initialYear={initialYear} />

      <section className={s.help} aria-label={isKo ? '도움말' : 'Guide'}>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.aboutTitle}</h2>
          <p>{c.about}</p>
          <p className={s.formula}>{c.formula}</p>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.under5Title}</h2>
          <ul>{c.under5.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.breakTitle}</h2>
          <ul>{c.breaks.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.tableTitle}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr>{c.tableHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {[...WAGE_ROWS].reverse().map((r) => (
                  <tr key={r.effectiveFrom}>
                    <td>{isKo ? `${yearOf(r)}년` : yearOf(r)}</td>
                    <td>{money(r.value, isKo)}</td>
                    <td>{money(r.value * FULLTIME_MONTH_HOURS, isKo)}</td>
                    <td>{r.status === 'confirmed' ? c.confirmed : c.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className={`${ui.card} ${s.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.excludedTitle}</h2>
          <ul>{c.excluded.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </article>
      </section>

      <ShareBar title={c.shareTitle} description={c.subtitle} />
      <RelatedTools toolId="utilities/finance/alba-pay-calc" />
      <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
    </div>
  );
}
