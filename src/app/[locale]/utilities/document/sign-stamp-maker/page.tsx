import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Signature } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection, { type SeoContent } from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';
import { SIGN_FONTS_EN, SIGN_FONTS_KO, STAMP_FONTS } from '@/lib/signStamp';
import SignStampClient from './SignStampClient';
import s from './sign-stamp.module.css';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/document/sign-stamp-maker';

type Props = { params: Promise<{ locale: string }> };

async function content(locale: 'ko' | 'en') {
  const t = await getTranslations({ locale, namespace: 'SignStamp' });
  const raw = <T,>(k: string) => t.raw(k) as T;
  // 한국어는 도장 먼저, 영어는 싸인 먼저
  const order = locale === 'ko'
    ? (['about', 'tips', 'how', 'stamp', 'caution'] as const)
    : (['about', 'caution', 'tips', 'how', 'stamp'] as const);
  return {
    title: raw<string>('title'),
    subtitle: raw<string>('subtitle'),
    metaTitle: raw<string>('meta_title'),
    metaDescription: raw<string>('meta_description'),
    localBadge: raw<string>('local_badge'),
    description: raw<string>('description'),
    shareTitle: raw<string>('share_title'),
    cards: order.map((k) => ({ key: k, title: raw<string>(`${k}_title`), items: raw<string[]>(k) })),
    fontsTitle: raw<string>('fonts_title'),
    fontsNote: raw<string>('fonts_note'),
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
      ? ['도장 이미지 만들기', '도장 배경 제거', '도장 투명하게', '싸인 만들기', '전자서명 이미지 만들기', '직인 이미지', '서명 이미지 만들기']
      : ['signature generator', 'signature maker', 'transparent signature', 'signature from photo', 'draw signature online', 'stamp maker'],
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function SignStampPage({ params }: Props) {
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
  const seo = (x: typeof ko): SeoContent => ({ title: x.title, description: x.description, useCases: x.useCases, steps: x.steps, faqs: x.faqs });
  const fontNames = (list: { family: string }[]) => list.map((f) => f.family).join(', ');

  return (
    <div className={s.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <NavigationActions />
      <ToolHeader icon={<Signature />} title={c.title} subtitle={c.subtitle}>
        <span className={`${ui.badge} ${ui.green} ${s.localBadge}`}><ShieldCheck />{c.localBadge}</span>
      </ToolHeader>

      <SignStampClient />

      <section className={s.help} aria-label={isKo ? '도움말' : 'Guide'}>
        {c.cards.map((card) => (
          <article key={card.key} className={`${ui.card} ${s.card} ${card.key === 'about' || card.key === 'caution' ? s.wide : ''}`}>
            <h2 className={ui.cardTitle}>{card.title}</h2>
            {card.key === 'how'
              ? card.items.map((x, i) => <p key={i}>{rich(x)}</p>)
              : <ul>{card.items.map((x, i) => <li key={i}>{rich(x)}</li>)}</ul>}
          </article>
        ))}
        <article className={`${ui.card} ${s.card} ${s.wide}`}>
          <h2 className={ui.cardTitle}>{c.fontsTitle}</h2>
          <p>{c.fontsNote}</p>
          <ul className={s.fontList}>
            <li><strong>{isKo ? '한글 손글씨 싸인' : 'Korean handwriting'}</strong>: {fontNames(SIGN_FONTS_KO)}</li>
            <li><strong>{isKo ? '영문 손글씨 싸인' : 'Latin handwriting'}</strong>: {fontNames(SIGN_FONTS_EN)}</li>
            <li><strong>{isKo ? '도장' : 'Stamps'}</strong>: {fontNames(STAMP_FONTS)}</li>
          </ul>
        </article>
      </section>

      <ShareBar title={c.shareTitle} description={c.subtitle} />
      <RelatedTools toolId="utilities/document/sign-stamp-maker" />
      <SeoSection ko={seo(ko)} en={seo(en)} faqSchema={false} />
    </div>
  );
}
