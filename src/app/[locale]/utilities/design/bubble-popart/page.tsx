import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import { FONTS, SIZE_PRESETS, a4Dpi } from '@/lib/bubblePopart';
import BubblePopartClient from './BubblePopartClient';
import s from './bubble-popart.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/design/bubble-popart';
const SCALES = [1, 2, 3];

type Props = { params: Promise<{ locale: string }> };

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'BubblePopart' });
  const raw = <T,>(k: string) => t.raw(k) as T;
  return {
    title: raw<string>('title'),
    subtitle: raw<string>('subtitle'),
    metaTitle: raw<string>('meta_title'),
    metaDescription: raw<string>('meta_description'),
    description: raw<string>('description'),
    shareTitle: raw<string>('share_title'),
    aboutTitle: raw<string>('about_title'),
    about: raw<string>('about'),
    presetsTitle: raw<string>('presets_title'),
    presets: raw<string[]>('presets'),
    printTitle: raw<string>('print_title'),
    printIntro: raw<string>('print_intro'),
    printHead: raw<string[]>('print_head'),
    printDpiRow: raw<string>('print_dpi_row'),
    printNote: raw<string>('print_note'),
    fontsTitle: raw<string>('fonts_title'),
    fontsIntro: raw<string>('fonts_intro'),
    fontNotes: raw<Record<string, string>>('font_notes'),
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
      ? ['버블 폰트', '팝아트 글씨', '예쁜 글씨 만들기', 'POP 글씨', '매장 POP 만들기', '투명 배경 글씨 PNG', '귀여운 글씨체 이미지']
      : ['bubble letters generator', 'pop art text', 'bubble font PNG', 'transparent text PNG', 'cute lettering maker'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function BubblePopartPage({ params }: Props) {
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
  const sizeName: Record<string, [string, string]> = {
    square: ['정사각형', 'Square'], landscape: ['가로형 16:9', 'Landscape 16:9'], portrait: ['세로형 9:16', 'Portrait 9:16'], a4: ['A4', 'A4'],
  };

  return (
    <div className={s.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <NavigationActions />
      <ToolHeader icon={<Sparkles />} title={c.title} subtitle={c.subtitle} />

      <BubblePopartClient />

      <section className={s.help} aria-label={isKo ? '도움말' : 'Guide'}>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.aboutTitle}</h2>
          <p>{c.about}</p>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.presetsTitle}</h2>
          <ul>{c.presets.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.printTitle}</h2>
          <p>{c.printIntro}</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr>{c.printHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {SIZE_PRESETS.map((p) => (
                  <tr key={p.key}>
                    <td>{sizeName[p.key][isKo ? 0 : 1]}</td>
                    {SCALES.map((k) => <td key={k}>{p.w * k}×{p.h * k}</td>)}
                  </tr>
                ))}
                <tr>
                  <td>{c.printDpiRow}</td>
                  {SCALES.map((k) => <td key={k}>≈ {a4Dpi(k)} dpi</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p>{c.printNote}</p>
        </article>
        <article className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{c.fontsTitle}</h2>
          <p>{c.fontsIntro}</p>
          <ul>
            {FONTS.map((f) => (
              <li key={f.key}>
                <a href={`https://fonts.google.com/specimen/${f.family.replace(/ /g, '+')}`} target="_blank" rel="noopener noreferrer">
                  <strong>{isKo ? `${f.ko} (${f.family})` : f.family}</strong>
                </a>{' '}— {c.fontNotes[f.key]}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <ShareBar title={c.shareTitle} description={c.subtitle} />
      <RelatedTools toolId="utilities/design/bubble-popart" />
      <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
    </div>
  );
}
