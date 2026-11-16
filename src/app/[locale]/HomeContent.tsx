'use client';

import React, { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './page.module.css';
import SearchDropdown from '@/app/components/SearchDropdown';
import NewsTicker, { type TickerEntry } from '@/app/components/NewsTicker';

export interface HomeLive {
  ticker: TickerEntry[];
  changes: number;
  lastUpdated: string;
  autoData: number;
  today: number | null;
  total: number | null;
  since: string;
  popular: { href: string; ko: string; en: string; emoji: string }[];
}

const CATEGORIES_BASE = [
  { id: 'performance',  icon: '🚀', color: '#ef4444', hot: false, popular: false },
  { id: 'document',     icon: '📄', color: '#10b981', hot: false, popular: false },
  { id: 'finance',      icon: '💳', color: '#3b82f6', hot: false, popular: true  },
  { id: 'productivity', icon: '⚡', color: '#f59e0b', hot: false, popular: true  },
  { id: 'design',       icon: '✨', color: '#ec4899', hot: false, popular: false },
  { id: 'marketing',    icon: '🤖', color: '#8b5cf6', hot: true,  popular: true  },
  { id: 'lifestyle',    icon: '🌿', color: '#22c55e', hot: false, popular: false },
  { id: 'security',     icon: '🛡️', color: '#6366f1', hot: false, popular: false },
  { id: 'utility',      icon: '🛠️', color: '#14b8a6', hot: false, popular: true  },
  { id: 'dev',          icon: '💻', color: '#f97316', hot: true,  popular: false },
] as const;

interface HomeContentProps {
  toolCounts: Record<string, number>;
  totalTools: number;
  /** 서버에서 계산한 실시간 정보 (전광판·숫자·인기 도구) */
  live: HomeLive;
  /** 서버에서 렌더된 전체 도구 디렉터리 (카테고리 섹션 아래에 표시) */
  directory?: React.ReactNode;
}

const FEATURES = [
  { icon: '🔒', titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: '⚡', titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: '🎁', titleKey: 'feature3Title', descKey: 'feature3Desc' },
] as const;

export default function HomeContent({ toolCounts, totalTools, live, directory }: HomeContentProps) {
  const t = useTranslations('Index');
  const catT = useTranslations('Categories');
  const nav = useTranslations('Navigation');
  const locale = useLocale();

  // Merge category base info with auto-calculated counts from props
  const CATEGORIES = useMemo(() => CATEGORIES_BASE.map(cat => ({
    ...cat,
    count: toolCounts[cat.id] || 0,
  })), [toolCounts]);

  return (
    <div className={styles.homePage}>

      {/* ── HERO ── */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroGlow} ${styles.heroGlowLeft}`} aria-hidden />
        <div className={`${styles.heroGlow} ${styles.heroGlowRight}`} aria-hidden />

        <div className={`${styles.tickerWrap} ${styles.anim0}`}>
          <NewsTicker items={live.ticker} label={t('tickerLabel')} />
        </div>

        <h1 className={`${styles.heroTitle} ${styles.anim1}`}>
          {t('heroTitleLine1')}
          <span className={styles.heroAccent}>{t('heroTitleAccent')}</span>
        </h1>

        <p className={`${styles.heroSubtitle} ${styles.anim2}`}>
          <span>{t('heroSubtitleL1', { count: totalTools })}</span>
          <span className={styles.subtitleBreak}>{t('heroSubtitleL2')}</span>
        </p>

        <div className={`${styles.searchWrapper} ${styles.anim3}`}>
          <SearchDropdown
            placeholder={locale === 'ko'
              ? '퍼센트, 환율, 세금... 원하는 툴을 검색하세요'
              : 'Search for percent, currency, tax...'}
          />
        </div>

        <div className={`${styles.statsRow} ${styles.anim4}`} role="list">
          {[
            { num: String(totalTools), label: t('statTools') },
            { num: t('statUpdatesValue', { n: live.changes }), label: t('statUpdates') },
            { num: live.lastUpdated, label: t('statLastUpdate') },
            live.today !== null
              ? { num: live.today.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US'), label: t('statToday') }
              : { num: t('statAutoDataValue', { n: live.autoData }), label: t('statAutoData') },
            ...(live.total !== null
              ? [{ num: live.total.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US'), label: t('statTotal', { since: `${Number(live.since.slice(5, 7))}/${Number(live.since.slice(8, 10))}` }) }]
              : []),
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className={styles.statDivider} aria-hidden />}
              <div className={styles.statItem} role="listitem">
                <span className={styles.statNumber}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {live.popular.length > 0 && (
          <div className={`${styles.popularRow} ${styles.anim4}`}>
            <span className={styles.popularTitle}>🔥 {t('popularTitle')}</span>
            <ol className={styles.popularList}>
              {live.popular.map((p, i) => (
                <li key={p.href}>
                  <Link href={p.href} className={styles.popularChip}>
                    <span className={styles.popularRank}>{i + 1}</span>
                    <span aria-hidden="true">{p.emoji}</span>
                    {locale === 'ko' ? p.ko : p.en}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ── AD SLOT 1 · 728×90 Leaderboard ── */}

      {/* ── CATEGORIES ── */}
      <section className={styles.categoriesSection} id="categories" aria-label="Tool categories">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {t('browseCategories')}
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('browseCategoriesSubtitle')}
          </p>
        </div>

        <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/utilities/${cat.id}` as any}
                className={styles.categoryCard}
                style={{ '--cat-color': cat.color, animationDelay: `${i * 55}ms` } as React.CSSProperties}
              >
                {(cat.hot || cat.popular) && (
                  <span className={`${styles.badge} ${cat.hot ? styles.badgeHot : styles.badgePopular}`}>
                    {cat.hot ? '🔥 Hot' : '⭐ Popular'}
                  </span>
                )}
                <span className={styles.catIcon} aria-hidden>{cat.icon}</span>
                <h3 className={styles.catName}>{catT(cat.id)}</h3>
                <span className={styles.catCount}>{cat.count} {t('tools')}</span>
              </Link>
            ))}
          </div>
      </section>

      {/* ── ALL TOOLS DIRECTORY (server-rendered links) ── */}
      {directory}

      {/* ── AD SLOT 2 · 300×250 Rectangle ── */}

      {/* ── FEATURES ── */}
      <section className={`${styles.featuresSection} ${styles.fullBleed}`} id="features" aria-label="Why Utility Hub">
        <div className={styles.featuresInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('featuresTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('featuresSubtitle')}</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIconBox} aria-hidden>
                  <span className={styles.featureIconInner}>{f.icon}</span>
                </div>
                <h3 className={styles.featureTitle}>{t(f.titleKey)}</h3>
                <p className={styles.featureDesc}>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO CONTENT ── */}
      <section className={styles.seoSection} aria-label="About Utility Hub">
        <h2 className={styles.seoTitle}>{t('seoTitle')}</h2>
        <div className={styles.seoParagraphs}>
          <p>{t('seoPara1', { count: totalTools })}</p>
          <p>{t('seoPara2')}</p>
          <p>{t('seoPara3')}</p>
        </div>
      </section>

      {/* ── AD SLOT 3 · 728×90 Footer Leaderboard ── */}



    </div>
  );
}
