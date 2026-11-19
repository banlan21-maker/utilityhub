import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Truck } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import ConcreteCalcClient from './ConcreteCalcClient';
import s from './concrete-calc.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/concrete-calc';

type Props = { params: Promise<{ locale: string }> };

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'ConcreteCalc' });
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
    formulaTitle: raw<string>('formula_title'),
    formulaHead: raw<string[]>('formula_head'),
    formulaRows: raw<string[][]>('formula_rows'),
    rubeTitle: raw<string>('rube_title'),
    rube: raw<string[]>('rube'),
    wasteTitle: raw<string>('waste_title'),
    waste: raw<string[]>('waste'),
    mixTitle: raw<string>('mix_title'),
    mix: raw<string[]>('mix'),
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
      ? ['레미콘 계산기', '콘크리트 물량 계산', '루베 계산', '레미콘 몇 대', '시멘트 모래 배합 계산', '콘크리트 몇 포대', '바닥 콘크리트 계산', '기초 콘크리트 물량']
      : ['concrete calculator', 'concrete slab calculator', 'how many bags of concrete', 'cubic yards of concrete', 'footing calculator', 'fence post concrete calculator', 'concrete stairs calculator'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function ConcreteCalcPage({ params }: Props) {
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

      <div className={s.noPrint}><NavigationActions /></div>
      <ToolHeader icon={<Truck />} title={c.title} subtitle={c.subtitle} />

      <ConcreteCalcClient />

      <section className={`${s.help} ${s.noPrint}`} aria-label={isKo ? '도움말' : 'Guide'}>
        <article className={`${ui.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.aboutTitle}</h2>
          {c.about.map((p, i) => <p key={i}>{p}</p>)}
        </article>
        <article className={`${ui.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.formulaTitle}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr>{c.formulaHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {c.formulaRows.map((r) => (
                  <tr key={r[0]}><td>{r[0]}</td><td><code>{r[1]}</code></td><td>{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.rubeTitle}</h2>
          <ul>{c.rube.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.wasteTitle}</h2>
          <ul>{c.waste.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.mixTitle}</h2>
          <ul>{c.mix.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>{c.excludedTitle}</h2>
          <ul>{c.excluded.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </article>
      </section>

      <div className={`${s.noPrint} ${s.stack}`}>
        <ShareBar title={c.shareTitle} description={c.subtitle} />
        <RelatedTools toolId="utilities/utility/concrete-calc" />
        <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
      </div>
    </div>
  );
}
