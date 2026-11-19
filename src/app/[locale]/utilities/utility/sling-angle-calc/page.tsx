import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Anchor } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import SlingCalcClient from './SlingCalcClient';
import s from './sling-angle-calc.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/sling-angle-calc';

type Props = { params: Promise<{ locale: string }> };

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'SlingCalc' });
  const raw = <T,>(k: string) => t.raw(k) as T;
  return {
    title: raw<string>('title'),
    subtitle: raw<string>('subtitle'),
    metaTitle: raw<string>('meta_title'),
    metaDescription: raw<string>('meta_description'),
    description: raw<string>('description'),
    shareTitle: raw<string>('share_title'),
    aboutTitle: raw<string>('about_title'),
    about: raw<string[]>('about'),
    factorTitle: raw<string>('factor_title'),
    factorHead: raw<string[]>('factor_head'),
    factorRows: raw<string[][]>('factor_rows'),
    factorNote: raw<string>('factor_note'),
    why4Title: raw<string>('why4_title'),
    why4: raw<string[]>('why4'),
    apexTitle: raw<string>('apex_title'),
    apex: raw<string[]>('apex'),
    lawTitle: raw<string>('law_title'),
    law: raw<string[]>('law'),
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
      ? ['줄걸이 각도 계산', '줄걸이 하중 계산', '슬링 각도 하중', '꼭지각 하중', '와이어로프 장력 계산', '인양 각도 계산기', '슬링 장력 계산', '4줄걸이 하중']
      : ['sling angle calculator', 'rigging calculator', 'sling tension calculator', 'sling angle factor', 'lifting sling load calculator', 'bridle sling calculator', 'rigging load calculator'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function SlingAngleCalcPage({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const [ko, en] = await Promise.all([content('ko'), content('en')]);
  const c = isKo ? ko : en;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: c.title,
    operatingSystem: 'Web Browser',
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: isKo ? 'KRW' : 'USD' },
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
      <ToolHeader icon={<Anchor />} title={c.title} subtitle={c.subtitle} />

      <SlingCalcClient />

      <section className={s.help} aria-label={isKo ? '도움말' : 'Guide'}>
        <article className={`${ui.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.aboutTitle}</h2>
          {c.about.map((p, i) => <p key={i}>{p}</p>)}
        </article>
        <article className={`${ui.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.factorTitle}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr>{c.factorHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {c.factorRows.map((r) => (
                  <tr key={r[0]}>{r.map((v, i) => <td key={i}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{c.factorNote}</p>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.why4Title}</h2>
          {c.why4.map((p, i) => <p key={i}>{rich(p)}</p>)}
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.apexTitle}</h2>
          <ul>{c.apex.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.lawTitle}</h2>
          <ul>{c.law.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.excludedTitle}</h2>
          <ul>{c.excluded.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </article>
      </section>

      <div className={s.stack}>
        <ShareBar title={c.shareTitle} description={c.subtitle} />
        <RelatedTools toolId="utilities/utility/sling-angle-calc" />
        <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
      </div>
    </div>
  );
}
