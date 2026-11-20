import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Columns2, ShieldCheck } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import { RATIOS } from '@/lib/beforeAfter';
import BeforeAfterClient from './BeforeAfterClient';
import s from './before-after-maker.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/design/before-after-maker';

type Props = { params: Promise<{ locale: string }> };

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'BeforeAfter' });
  const raw = <T,>(k: string) => t.raw(k) as T;
  return {
    title: raw<string>('title'),
    subtitle: raw<string>('subtitle'),
    metaTitle: raw<string>('meta_title'),
    metaDescription: raw<string>('meta_description'),
    localBadge: raw<string>('local_badge'),
    description: raw<string>('description'),
    shareTitle: raw<string>('share_title'),
    aboutTitle: raw<string>('about_title'),
    about: raw<string[]>('about'),
    ratioTitle: raw<string>('ratio_title'),
    ratioHead: raw<string[]>('ratio_head'),
    ratioNotes: raw<Record<string, string>>('ratio_notes'),
    ratioNote: raw<string>('ratio_note'),
    tipsTitle: raw<string>('tips_title'),
    tips: raw<string[]>('tips'),
    industriesTitle: raw<string>('industries_title'),
    industriesHead: raw<string[]>('industries_head'),
    industries: raw<string[][]>('industries'),
    consentTitle: raw<string>('consent_title'),
    consent: raw<string[]>('consent'),
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
      ? ['비포 애프터 사진 만들기', '전후 사진 합치기', '사진 두장 합치기', '미용실 인스타 사진', '네일 전후 사진', '사진 나란히 붙이기', '전후 비교 사진']
      : ['before and after photo maker', 'side by side photo', 'before after collage', 'salon before after', 'before and after template instagram'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function BeforeAfterPage({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const [ko, en] = await Promise.all([content('ko'), content('en')]);
  const c = isKo ? ko : en;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: c.title,
    operatingSystem: 'Web Browser',
    applicationCategory: 'DesignApplication',
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
      <ToolHeader icon={<Columns2 />} title={c.title} subtitle={c.subtitle}>
        <span className={`${ui.badge} ${ui.green} ${s.localBadge}`}><ShieldCheck />{c.localBadge}</span>
      </ToolHeader>

      <BeforeAfterClient />

      <section className={s.help} aria-label={isKo ? '도움말' : 'Guide'}>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.aboutTitle}</h2>
          {c.about.map((p, i) => <p key={i}>{rich(p)}</p>)}
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.tipsTitle}</h2>
          <ul>{c.tips.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.ratioTitle}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr>{c.ratioHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {RATIOS.map((r) => (
                  <tr key={r.key}>
                    <td>{r.key}</td>
                    <td>{r.w}×{r.h}px</td>
                    <td>{c.ratioNotes[r.key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{c.ratioNote}</p>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.consentTitle}</h2>
          <ul>{c.consent.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={`${ui.card} ${s.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.industriesTitle}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr>{c.industriesHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {c.industries.map((row) => (
                  <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <ShareBar title={c.shareTitle} description={c.subtitle} />
      <RelatedTools toolId="utilities/design/before-after-maker" />
      <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
    </div>
  );
}
