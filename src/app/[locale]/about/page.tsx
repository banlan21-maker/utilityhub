import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';
import s from './about.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const BASE = 'https://www.theutilhub.com';
  const title = isKo ? '소개 | Utility Hub' : 'About Us | Utility Hub';
  const description = isKo
    ? 'theutilhub는 비개발자가 실제 업무 필요에서 만든 무료 온라인 도구 모음입니다. 프라이버시 보호, 완전 무료, 설치 없음을 원칙으로 운영합니다.'
    : 'Utility Hub is a free online tool collection built from real work needs. Privacy-first, completely free, no installation required.';
  const canonical = `${BASE}/${locale}/about`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko/about`,
        en: `${BASE}/en/about`,
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  const isKo = locale === 'ko';

  const principles = [
    { icon: t('p1_icon'), title: t('p1_title'), body: t('p1_body') },
    { icon: t('p2_icon'), title: t('p2_title'), body: t('p2_body') },
    { icon: t('p3_icon'), title: t('p3_title'), body: t('p3_body') },
  ];

  return (
    <main className={s.main}>
      <NavigationActions />

      {/* Hero Header */}
      <header className={s.hero}>
        <div className={s.heroIcon}>🛠️</div>
        <h1 className={s.heroTitle}>{t('title')}</h1>
        <p className={s.heroSub}>{t('hero_sub')}</p>
      </header>

      {/* Origin Story */}
      <article className={s.card}>
        <h2 className={s.cardTitle}>
          <span className={s.accent}>—</span> {t('origin_title')}
        </h2>
        <p className={s.cardBody}>{t('origin_body')}</p>
      </article>

      {/* Philosophy Cards */}
      <section aria-labelledby="philosophy-heading">
        <h2 id="philosophy-heading" className={s.sectionTitle}>{t('philosophy_title')}</h2>
        <div className={s.principleGrid}>
          {principles.map((p, i) => (
            <div key={i} className={s.principleCard}>
              <span className={s.principleIcon}>{p.icon}</span>
              <h3 className={s.principleTitle}>{p.title}</h3>
              <p className={s.principleBody}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Future */}
      <section className={s.card} aria-labelledby="future-heading">
        <h2 id="future-heading" className={s.cardTitle}>
          <span className={s.accent}>—</span> {t('future_title')}
        </h2>
        <p className={s.cardBody}>{t('future_body')}</p>
      </section>

      {/* CTA */}
      <section className={s.cta}>
        <Link href="/contact" className={s.ctaBtn}>
          {t('contact_cta')} →
        </Link>
        <Link href="/" className={s.ctaSecondary}>
          {isKo ? '← 모든 도구 보기' : '← Browse All Tools'}
        </Link>
      </section>
    </main>
  );
}
