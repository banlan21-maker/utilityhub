import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Store } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import MenuCostClient from './MenuCostClient';
import s from './menu-cost.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/finance/menu-cost-breakeven';

type Props = { params: Promise<{ locale: string }> };

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'MenuCost' });
  const raw = <T,>(k: string) => t.raw(k) as T;
  return {
    title: raw<string>('title'),
    subtitle: raw<string>('subtitle'),
    metaTitle: raw<string>('meta_title'),
    metaDescription: raw<string>('meta_description'),
    localBadge: raw<string>('local_badge'),
    description: raw<string>('description'),
    shareTitle: raw<string>('share_title'),
    cards: (['about', 'what', 'target', 'bep', 'owner', 'vat'] as const).map((k) => ({
      key: k, title: raw<string>(`${k}_title`), items: raw<string[]>(k),
    })),
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
      ? ['원가율 계산기', '식당 원가 계산', '메뉴 원가 계산', '손익분기점 계산기', '자영업 손익분기점', '하루 매출 목표', '미용실 시술 가격 정하기', '적정 판매가']
      : ['food cost calculator', 'menu pricing calculator', 'break even calculator restaurant', 'salon service pricing calculator', 'food cost percentage'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function MenuCostPage({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const [ko, en] = await Promise.all([content('ko'), content('en')]);
  const c = isKo ? ko : en;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: c.title,
    operatingSystem: 'Web Browser',
    applicationCategory: 'FinanceApplication',
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
      <ToolHeader icon={<Store />} title={c.title} subtitle={c.subtitle}>
        <span className={`${ui.badge} ${ui.green}`}><ShieldCheck />{c.localBadge}</span>
      </ToolHeader>

      <MenuCostClient />

      <section className={s.help} aria-label={isKo ? '도움말' : 'Guide'}>
        {c.cards.map((card) => (
          <article key={card.key} className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{card.title}</h2>
            {card.key === 'bep' ? (
              <ol>{card.items.map((x, i) => <li key={i}>{rich(x)}</li>)}</ol>
            ) : card.key === 'about' ? (
              <ul>{card.items.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>
            ) : (
              card.items.map((x, i) => <p key={i}>{rich(x)}</p>)
            )}
          </article>
        ))}
      </section>

      <ShareBar title={c.shareTitle} description={c.subtitle} />
      <RelatedTools toolId="utilities/finance/menu-cost-breakeven" />
      <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
    </div>
  );
}
