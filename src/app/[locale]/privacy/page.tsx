import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import styles from '../legal.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy' });
  const BASE = 'https://theutilhub.com';
  const canonical = locale === 'ko' ? `${BASE}/privacy` : `${BASE}/${locale}/privacy`;

  return {
    title: `${t('title')} — Utility Hub`,
    description: t('metaDesc'),
    metadataBase: new URL(BASE),
    alternates: {
      canonical,
      languages: { ko: `${BASE}/privacy`, en: `${BASE}/en/privacy` },
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('PrivacyPolicy');
  const nav = await getTranslations('Navigation');

  const toc = [
    't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8',
  ] as const;
  const tocTitles = [
    t('s1Title'), t('s2Title'), t('s3Title'), t('s4Title'),
    t('s5Title'), t('s6Title'), t('s7Title'), t('s8Title'),
  ];

  return (
    <article className={styles.page}>

      {/* Back link */}
      <Link href="/" className={styles.backLink}>
        <span className={styles.backArrow} aria-hidden>←</span>
        {nav('home')}
      </Link>

      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageIconRow}>
          <span className={styles.pageIcon} aria-hidden>🔒</span>
          <span className={styles.pageBadge}>theutilhub.com</span>
        </div>
        <h1 className={styles.pageTitle}>{t('title')}</h1>
        <p className={styles.pageSubtitle}>{t('subtitle')}</p>
        <span className={styles.lastUpdated}>
          📅 {t('lastUpdated')}: {t('date')}
        </span>
      </header>

      {/* Table of Contents */}
      <nav className={styles.toc} aria-label="Table of contents">
        <p className={styles.tocTitle}>Contents</p>
        <ol className={styles.tocList}>
          {tocTitles.map((title, i) => (
            <li key={i} className={styles.tocItem}>
              <a href={`#s${i + 1}`}>
                <span aria-hidden style={{ color: '#f97316', fontWeight: 700, fontSize: '0.75rem' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Intro */}
      <p className={styles.intro}>{t('intro')}</p>

      {/* ── Section 1: Not Collected ── */}
      <section id="s1" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>1</span>
          {t('s1Title')}
        </h2>
        <p className={styles.body}>{t('s1Body')}</p>
        <ul className={styles.list} aria-label="Items not collected">
          <li className={styles.listItem}>{t('s1Li1')}</li>
          <li className={styles.listItem}>{t('s1Li2')}</li>
          <li className={styles.listItem}>{t('s1Li3')}</li>
          <li className={styles.listItem}>{t('s1Li4')}</li>
        </ul>
        <p className={styles.body}><strong>{t('s1Note')}</strong></p>
      </section>

      {/* ── Section 2: Local Storage ── */}
      <section id="s2" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>2</span>
          {t('s2Title')}
        </h2>
        <p className={styles.body}>{t('s2Body')}</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>{t('s2Li1')}</li>
          <li className={styles.listItem}>{t('s2Li2')}</li>
        </ul>
      </section>

      {/* ── Section 3: Cookie Policy ── */}
      <section id="s3" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>3</span>
          {t('s3Title')}
        </h2>
        <p className={styles.body}>{t('s3Body')}</p>

        {/* 3a. First-party */}
        <h3 className={styles.subheading}>{t('s3fpTitle')}</h3>
        <p className={styles.body}>{t('s3fpBody')}</p>

        {/* 3b. Third-party (AdSense callout) */}
        <h3 className={styles.subheading}>{t('s3tpTitle')}</h3>
        <div className={styles.callout} role="note">
          <p className={styles.calloutLabel}>🍪 Google AdSense</p>
          <p className={styles.calloutBody}>{t('s3tpBody')}</p>
        </div>

        {/* Opt-out */}
        <p className={styles.body}>
          {t('s3optBody')}{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Google Ads Settings
          </a>
          {' '}{t('s3optOr')}{' '}
          <a
            href="http://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            AboutAds.info
          </a>.
        </p>

        {/* Google note */}
        <p className={styles.body}>
          {t('s3gNote')}{' '}
          <a
            href="https://www.google.com/policies/privacy/partners/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            google.com/policies/privacy/partners
          </a>
        </p>

        {/* 3c. Managing cookies */}
        <h3 className={styles.subheading}>{t('s3mgTitle')}</h3>
        <p className={styles.body}>{t('s3mgBody')}</p>
      </section>

      {/* ── Section 4: Feedback ── */}
      <section id="s4" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>4</span>
          {t('s4Title')}
        </h2>
        <p className={styles.body}>{t('s4Body')}</p>
      </section>

      {/* ── Section 5: Third-Party Services ── */}
      <section id="s5" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>5</span>
          {t('s5Title')}
        </h2>
        <p className={styles.body}>{t('s5Body')}</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Google AdSense</strong>: {t('s5Li1')}{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {t('s5Li1Link')}
            </a>
          </li>
          <li className={styles.listItem}>
            <strong>Supabase</strong>: {t('s5Li2')}{' '}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {t('s5Li2Link')}
            </a>
          </li>
        </ul>
      </section>

      {/* ── Section 6: Children ── */}
      <section id="s6" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>6</span>
          {t('s6Title')}
        </h2>
        <p className={styles.body}>{t('s6Body')}</p>
      </section>

      {/* ── Section 7: Changes ── */}
      <section id="s7" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>7</span>
          {t('s7Title')}
        </h2>
        <p className={styles.body}>{t('s7Body')}</p>
      </section>

      {/* ── Section 8: Contact ── */}
      <section id="s8" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>8</span>
          {t('s8Title')}
        </h2>
        <p className={styles.body}>
          {t('s8Body')}{' '}
          <Link href="/feedback" className={styles.link}>
            {t('s8Link')}
          </Link>{' '}
          {t('s8Suffix')}
        </p>
      </section>

      <div className={styles.divider} aria-hidden />

      {/* Bottom navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" className={styles.backLink}>
          <span className={styles.backArrow} aria-hidden>←</span>
          {nav('home')}
        </Link>
        <Link href="/terms" className={styles.backLink}>
          Terms of Service →
        </Link>
      </div>

    </article>
  );
}
