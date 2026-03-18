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
  const t = await getTranslations({ locale, namespace: 'TermsOfService' });
  const BASE = 'https://theutilhub.com';
  const canonical = locale === 'ko' ? `${BASE}/terms` : `${BASE}/${locale}/terms`;

  return {
    title: `${t('title')} — Utility Hub`,
    description: t('metaDesc'),
    metadataBase: new URL(BASE),
    alternates: {
      canonical,
      languages: { ko: `${BASE}/terms`, en: `${BASE}/en/terms` },
    },
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const t = await getTranslations('TermsOfService');
  const nav = await getTranslations('Navigation');

  const tocTitles = [
    t('s1Title'), t('s2Title'), t('s3Title'), t('s4Title'),
    t('s5Title'), t('s6Title'), t('s7Title'), t('s8Title'), t('s9Title'),
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
          <span className={styles.pageIcon} aria-hidden>⚖️</span>
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

      {/* ── Section 1: Acceptance ── */}
      <section id="s1" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>1</span>
          {t('s1Title')}
        </h2>
        <p className={styles.body}>{t('s1Body')}</p>
      </section>

      {/* ── Section 2: Description ── */}
      <section id="s2" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>2</span>
          {t('s2Title')}
        </h2>
        <p className={styles.body}>{t('s2Body')}</p>
      </section>

      {/* ── Section 3: Acceptable Use ── */}
      <section id="s3" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>3</span>
          {t('s3Title')}
        </h2>
        <p className={styles.body}>{t('s3Body')}</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>{t('s3Li1')}</li>
          <li className={styles.listItem}>{t('s3Li2')}</li>
          <li className={styles.listItem}>{t('s3Li3')}</li>
        </ul>
      </section>

      {/* ── Section 4: DISCLAIMER ── */}
      <section id="s4" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>4</span>
          {t('s4Title')}
        </h2>

        <div className={styles.disclaimer} role="note" aria-label="Important disclaimer">
          <p className={styles.disclaimerLabel}>⚠️ Important</p>
          <p className={styles.disclaimerWarning}>{t('s4Warning')}</p>
          <p className={styles.disclaimerBody}>{t('s4Body')}</p>
        </div>

        <h3 className={styles.subheading}>{t('s4DisTitle')}</h3>
        <ul className={styles.list}>
          <li className={styles.listItem}>{t('s4DisLi1')}</li>
          <li className={styles.listItem}>{t('s4DisLi2')}</li>
          <li className={styles.listItem}>{t('s4DisLi3')}</li>
          <li className={styles.listItem}>{t('s4DisLi4')}</li>
          <li className={styles.listItem}>{t('s4DisLi5')}</li>
        </ul>

        <div
          className={styles.disclaimer}
          role="alert"
          aria-label="Final liability disclaimer"
          style={{ marginTop: '1.25rem' }}
        >
          <p className={styles.disclaimerLabel}>⛔ Limitation of Liability</p>
          <p className={styles.disclaimerFinal}>{t('s4FinalWarning')}</p>
        </div>
      </section>

      {/* ── Section 5: IP ── */}
      <section id="s5" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>5</span>
          {t('s5Title')}
        </h2>
        <p className={styles.body}>{t('s5Body')}</p>
      </section>

      {/* ── Section 6: Third-Party ── */}
      <section id="s6" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>6</span>
          {t('s6Title')}
        </h2>
        <p className={styles.body}>{t('s6Body')}</p>
      </section>

      {/* ── Section 7: Modifications ── */}
      <section id="s7" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>7</span>
          {t('s7Title')}
        </h2>
        <p className={styles.body}>{t('s7Body')}</p>
      </section>

      {/* ── Section 8: Governing Law ── */}
      <section id="s8" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>8</span>
          {t('s8Title')}
        </h2>
        <p className={styles.body}>{t('s8Body')}</p>
      </section>

      {/* ── Section 9: Contact ── */}
      <section id="s9" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum} aria-hidden>9</span>
          {t('s9Title')}
        </h2>
        <p className={styles.body}>
          {t('s9Body')}{' '}
          <Link href="/feedback" className={styles.link}>
            {t('s9Link')}
          </Link>{' '}
          {t('s9Suffix')}
        </p>
      </section>

      <div className={styles.divider} aria-hidden />

      {/* Bottom navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" className={styles.backLink}>
          <span className={styles.backArrow} aria-hidden>←</span>
          {nav('home')}
        </Link>
        <Link href="/privacy" className={styles.backLink}>
          Privacy Policy →
        </Link>
      </div>

    </article>
  );
}
