'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './page.module.css';

const CATEGORIES_BASE = [
  { id: 'performance', icon: '🚀', color: '#ef4444', hot: false, popular: false },
  { id: 'pdf',         icon: '📄', color: '#10b981', hot: false, popular: false },
  { id: 'fintech',     icon: '💳', color: '#3b82f6', hot: false, popular: true  },
  { id: 'productivity',icon: '⚡', color: '#f59e0b', hot: false, popular: true  },
  { id: 'ux',          icon: '✨', color: '#ec4899', hot: false, popular: false },
  { id: 'ai',          icon: '🤖', color: '#8b5cf6', hot: true,  popular: false },
  { id: 'ai-marketing',icon: '✨', color: '#8b5cf6', hot: true,  popular: true  },
  { id: 'lifestyle',   icon: '🌿', color: '#22c55e', hot: false, popular: false },
  { id: 'security',    icon: '🛡️', color: '#6366f1', hot: false, popular: false },
  { id: 'utilities',   icon: '🛠️', color: '#14b8a6', hot: false, popular: true  },
  { id: 'dev',         icon: '💻', color: '#f97316', hot: true,  popular: false },
] as const;

interface HomeContentProps {
  toolCounts: Record<string, number>;
  totalTools: number;
}

const FEATURES = [
  { icon: '🔒', titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: '⚡', titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: '🎁', titleKey: 'feature3Title', descKey: 'feature3Desc' },
] as const;

export default function HomeContent({ toolCounts, totalTools }: HomeContentProps) {
  const t = useTranslations('Index');
  const catT = useTranslations('Categories');
  const nav = useTranslations('Navigation');

  const [search, setSearch] = useState('');

  // Merge category base info with auto-calculated counts from props
  const CATEGORIES = useMemo(() => CATEGORIES_BASE.map(cat => ({
    ...cat,
    count: toolCounts[cat.id] || 0,
  })), [toolCounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(cat =>
      catT(cat.id).toLowerCase().includes(q) || cat.id.includes(q)
    );
  }, [search, catT, CATEGORIES]);

  return (
    <div className={styles.homePage}>

      {/* ── HERO ── */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroGlow} ${styles.heroGlowLeft}`} aria-hidden />
        <div className={`${styles.heroGlow} ${styles.heroGlowRight}`} aria-hidden />

        <div className={`${styles.heroBadge} ${styles.anim0}`}>
          <span>🆕</span>
          <span>{t('heroBadgeText')}</span>
          <span className={styles.heroBadgeArrow}>→</span>
        </div>

        <h1 className={`${styles.heroTitle} ${styles.anim1}`}>
          {t('heroTitleLine1')}
          <span className={styles.heroAccent}>{t('heroTitleAccent')}</span>
        </h1>

        <p className={`${styles.heroSubtitle} ${styles.anim2}`}>
          <span>{t('heroSubtitleL1')}</span>
          <span className={styles.subtitleBreak}>{t('heroSubtitleL2')}</span>
        </p>

        <div className={`${styles.searchWrapper} ${styles.anim3}`}>
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon} aria-hidden>🔍</span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className={styles.searchInput}
              aria-label={t('searchPlaceholder')}
            />
            {search && (
              <button
                className={styles.searchClear}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className={`${styles.statsRow} ${styles.anim4}`} role="list">
          {[
            { num: `${totalTools}+`, label: t('statTools') },
            { num: '10',  label: t('statCategories') },
            { num: '100%',label: t('statFree') },
            { num: '0',   label: t('statLogin') },
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
      </section>

      {/* ── AD SLOT 1 · 728×90 Leaderboard ── */}
      <div className={styles.adSlot} role="complementary" aria-label="Advertisement">
        <span className={styles.adSlotLabel}>AD</span>
      </div>

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

        {filtered.length === 0 && search ? (
          <div className={styles.noResults}>
            <span aria-hidden>🔍</span>
            <p>{t('noResults')} &ldquo;<strong>{search}</strong>&rdquo;</p>
          </div>
        ) : (
          <div className={styles.categoriesGrid}>
            {filtered.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/${cat.id}` as any}
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
        )}
      </section>

      {/* ── AD SLOT 2 · 300×250 Rectangle ── */}
      <div className={`${styles.adSlot} ${styles.adSlotRect}`} role="complementary" aria-label="Advertisement">
        <span className={styles.adSlotLabel}>AD</span>
      </div>

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
          <p>{t('seoPara1')}</p>
          <p>{t('seoPara2')}</p>
          <p>{t('seoPara3')}</p>
        </div>
      </section>

      {/* ── AD SLOT 3 · 728×90 Footer Leaderboard ── */}
      <div className={styles.adSlot} role="complementary" aria-label="Advertisement">
        <span className={styles.adSlotLabel}>AD</span>
      </div>

      {/* ── FOOTER ── */}
      <footer className={`${styles.footer} ${styles.fullBleed}`} aria-label="Site footer">
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>

            {/* Brand */}
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoIcon} aria-hidden>🛠️</span>
                <span className={styles.footerLogoText}>Utility Hub</span>
              </div>
              <p className={styles.footerTagline}>{t('footerTagline')}</p>
              <p className={styles.footerCopyright}>
                © {new Date().getFullYear()} Utility Hub. {t('allRightsReserved')}
              </p>
            </div>

            {/* Categories A */}
            <div className={styles.footerColumn}>
              <h4 className={styles.footerHeading}>{t('footerCategories')}</h4>
              <ul className={styles.footerLinkList}>
                {CATEGORIES.slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/${cat.id}` as any} className={styles.footerLink}>
                      {cat.icon} {catT(cat.id)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories B */}
            <div className={styles.footerColumn}>
              <h4 className={styles.footerHeading}>{t('footerMore')}</h4>
              <ul className={styles.footerLinkList}>
                {CATEGORIES.slice(5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/${cat.id}` as any} className={styles.footerLink}>
                      {cat.icon} {catT(cat.id)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className={styles.footerColumn}>
              <h4 className={styles.footerHeading}>{t('footerLegal')}</h4>
              <ul className={styles.footerLinkList}>
                <li>
                  <Link href={'/privacy' as any} className={styles.footerLink}>
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={'/terms' as any} className={styles.footerLink}>
                    {t('terms')}
                  </Link>
                </li>
                <li>
                  <a href="/sitemap.xml" className={styles.footerLink}>
                    {t('sitemap')}
                  </a>
                </li>
                <li>
                  <Link href={'/feedback' as any} className={styles.footerLink}>
                    {nav('feedback')}
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
