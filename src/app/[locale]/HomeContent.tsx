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
  { id: 'lifestyle',   icon: '🌿', color: '#22c55e', hot: false, popular: false },
  { id: 'security',    icon: '🛡️', color: '#6366f1', hot: false, popular: false },
  { id: 'utilities',   icon: '🛠️', color: '#14b8a6', hot: false, popular: true  },
  { id: 'dev',         icon: '💻', color: '#f97316', hot: true,  popular: false },
] as const;

// All available tools across categories
const ALL_TOOLS = [
  // Utilities
  { id: 'utilities/thumbnail', category: 'utilities', icon: '📸', titleKey: 'UtilitiesBoard.thumbnail.title', descKey: 'UtilitiesBoard.thumbnail.desc' },
  { id: 'utilities/shorturl', category: 'utilities', icon: '🔗', titleKey: 'UtilitiesBoard.shorturl.title', descKey: 'UtilitiesBoard.shorturl.desc' },
  { id: 'utilities/area', category: 'utilities', icon: '📐', titleKey: 'UtilitiesBoard.area.title', descKey: 'UtilitiesBoard.area.desc' },
  { id: 'utilities/qr', category: 'utilities', icon: '🔲', titleKey: 'UtilitiesBoard.qr.title', descKey: 'UtilitiesBoard.qr.desc' },
  { id: 'utilities/counter', category: 'utilities', icon: '📝', titleKey: 'UtilitiesBoard.counter.title', descKey: 'UtilitiesBoard.counter.desc' },
  { id: 'utilities/dday', category: 'utilities', icon: '📅', titleKey: 'UtilitiesBoard.dday.title', descKey: 'UtilitiesBoard.dday.desc' },
  { id: 'utilities/gpa', category: 'utilities', icon: '📊', titleKey: 'UtilitiesBoard.gpa.title', descKey: 'UtilitiesBoard.gpa.desc' },
  { id: 'utilities/unit-converter', category: 'utilities', icon: '⚖️', titleKey: 'UtilitiesBoard.unit-converter.title', descKey: 'UtilitiesBoard.unit-converter.desc' },
  { id: 'utilities/image-compressor', category: 'utilities', icon: '🗜️', titleKey: 'UtilitiesBoard.image-compressor.title', descKey: 'UtilitiesBoard.image-compressor.desc' },
  { id: 'utilities/image-resizer', category: 'utilities', icon: '✂️', titleKey: 'UtilitiesBoard.image-resizer.title', descKey: 'UtilitiesBoard.image-resizer.desc' },
  { id: 'utilities/smart-excel-mapper', category: 'utilities', icon: '📊', titleKey: 'UtilitiesBoard.smart-excel-mapper.title', descKey: 'UtilitiesBoard.smart-excel-mapper.desc' },

  // Fintech
  { id: 'fintech/tax33', category: 'fintech', icon: '🧾', titleKey: 'FintechBoard.tax33.title', descKey: 'FintechBoard.tax33.desc' },
  { id: 'fintech/percent', category: 'fintech', icon: '🔢', titleKey: 'FintechBoard.percent.title', descKey: 'FintechBoard.percent.desc' },
  { id: 'fintech/vat', category: 'fintech', icon: '🧾', titleKey: 'FintechBoard.vat.title', descKey: 'FintechBoard.vat.desc' },
  { id: 'fintech/interest', category: 'fintech', icon: '💰', titleKey: 'FintechBoard.interest.title', descKey: 'FintechBoard.interest.desc' },
  { id: 'fintech/currency', category: 'fintech', icon: '💱', titleKey: 'FintechBoard.currency.title', descKey: 'FintechBoard.currency.desc' },
  { id: 'fintech/crypto', category: 'fintech', icon: '🪙', titleKey: 'FintechBoard.crypto.title', descKey: 'FintechBoard.crypto.desc' },
  { id: 'fintech/net-pay', category: 'fintech', icon: '💵', titleKey: 'FintechBoard.net-pay.title', descKey: 'FintechBoard.net-pay.desc' },

  // Dev
  { id: 'dev/json', category: 'dev', icon: '🗂️', titleKey: 'DevBoard.json.title', descKey: 'DevBoard.json.desc' },
  { id: 'dev/regex', category: 'dev', icon: '🔍', titleKey: 'DevBoard.regex.title', descKey: 'DevBoard.regex.desc' },
  { id: 'dev/password', category: 'dev', icon: '🔑', titleKey: 'DevBoard.password.title', descKey: 'DevBoard.password.desc' },

  // PDF
  { id: 'pdf/hwp', category: 'pdf', icon: '📄', titleKey: 'PdfBoard.hwp.title', descKey: 'PdfBoard.hwp.desc' },

  // Performance
  { id: 'performance/ttfb', category: 'performance', icon: '⚡', titleKey: 'PerformanceBoard.ttfb.title', descKey: 'PerformanceBoard.ttfb.desc' },

  // Productivity
  { id: 'productivity/pomodoro', category: 'productivity', icon: '🍅', titleKey: 'ProductivityBoard.pomodoro.title', descKey: 'ProductivityBoard.pomodoro.desc' },
  { id: 'productivity/timezone', category: 'productivity', icon: '🌍', titleKey: 'ProductivityBoard.timezone.title', descKey: 'ProductivityBoard.timezone.desc' },
  { id: 'productivity/coverletter', category: 'productivity', icon: '📝', titleKey: 'ProductivityBoard.coverletter.title', descKey: 'ProductivityBoard.coverletter.desc' },

  // UX
  { id: 'ux/color', category: 'ux', icon: '🎨', titleKey: 'UxBoard.color.title', descKey: 'UxBoard.color.desc' },
  { id: 'ux/font', category: 'ux', icon: '🔤', titleKey: 'UxBoard.font.title', descKey: 'UxBoard.font.desc' },
  { id: 'ux/logo', category: 'ux', icon: '🎭', titleKey: 'UxBoard.logo.title', descKey: 'UxBoard.logo.desc' },
  { id: 'ux/sea-mbti', category: 'ux', icon: '🌊', titleKey: 'UxBoard.sea-mbti.title', descKey: 'UxBoard.sea-mbti.desc' },
  { id: 'ux/quiz', category: 'ux', icon: '🎯', titleKey: 'UxBoard.quiz.title', descKey: 'UxBoard.quiz.desc' },

  // AI
  { id: 'ai/hashtag', category: 'ai', icon: '#️⃣', titleKey: 'AiBoard.hashtag.title', descKey: 'AiBoard.hashtag.desc' },

  // Security
  { id: 'security/password', category: 'security', icon: '🔐', titleKey: 'SecurityBoard.password.title', descKey: 'SecurityBoard.password.desc' },
  { id: 'security/url', category: 'security', icon: '🔗', titleKey: 'SecurityBoard.url.title', descKey: 'SecurityBoard.url.desc' },
  { id: 'security/redact', category: 'security', icon: '🖍️', titleKey: 'SecurityBoard.redact.title', descKey: 'SecurityBoard.redact.desc' },

  // Lifestyle
  { id: 'lifestyle/bmi-water', category: 'lifestyle', icon: '💧', titleKey: 'LifestyleBoard.bmi-water.title', descKey: 'LifestyleBoard.bmi-water.desc' },
  { id: 'lifestyle/nickname', category: 'lifestyle', icon: '✨', titleKey: 'LifestyleBoard.nickname.title', descKey: 'LifestyleBoard.nickname.desc' },
  { id: 'lifestyle/pet-food', category: 'lifestyle', icon: '🐾', titleKey: 'LifestyleBoard.pet-food.title', descKey: 'LifestyleBoard.pet-food.desc' },
  { id: 'lifestyle/korean-age', category: 'lifestyle', icon: '🎂', titleKey: 'LifestyleBoard.korean-age.title', descKey: 'LifestyleBoard.korean-age.desc' },
  { id: 'lifestyle/teto-egen-test', category: 'lifestyle', icon: '🧬', titleKey: 'LifestyleBoard.teto-egen-test.title', descKey: 'LifestyleBoard.teto-egen-test.desc' },
] as const;

// Calculate tool counts per category automatically
const CATEGORY_TOOL_COUNTS = ALL_TOOLS.reduce((acc, tool) => {
  acc[tool.category] = (acc[tool.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

// Merge category base info with auto-calculated counts
const CATEGORIES = CATEGORIES_BASE.map(cat => ({
  ...cat,
  count: CATEGORY_TOOL_COUNTS[cat.id] || 0,
}));

const FEATURES = [
  { icon: '🔒', titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: '⚡', titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: '🎁', titleKey: 'feature3Title', descKey: 'feature3Desc' },
] as const;

export default function HomeContent() {
  const t = useTranslations('Index');
  const catT = useTranslations('Categories');
  const nav = useTranslations('Navigation');
  const toolT = useTranslations();

  const [search, setSearch] = useState('');

  // Get translated tool title and desc
  const getToolTitle = (titleKey: string) => {
    try {
      const parts = titleKey.split('.');
      return toolT(`${parts[0]}.${parts[1]}.${parts[2]}`);
    } catch {
      return titleKey;
    }
  };

  const getToolDesc = (descKey: string) => {
    try {
      const parts = descKey.split('.');
      return toolT(`${parts[0]}.${parts[1]}.${parts[2]}`);
    } catch {
      return descKey;
    }
  };

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return ALL_TOOLS.filter(tool => {
      const title = getToolTitle(tool.titleKey).toLowerCase();
      const desc = getToolDesc(tool.descKey).toLowerCase();
      const catName = catT(tool.category).toLowerCase();
      return title.includes(q) || desc.includes(q) || catName.includes(q) || tool.id.includes(q);
    });
  }, [search, toolT, catT]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(cat =>
      catT(cat.id).toLowerCase().includes(q) || cat.id.includes(q)
    );
  }, [search, catT]);

  // Auto-switch between categories and tools view
  const showTools = search.trim().length > 0 && filteredTools.length > 0;

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
            { num: '40+', label: t('statTools') },
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

      {/* ── CATEGORIES / TOOLS ── */}
      <section className={styles.categoriesSection} id="categories" aria-label={showTools ? "Search results" : "Tool categories"}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {showTools ? `${filteredTools.length}개의 도구 검색됨` : t('browseCategories')}
          </h2>
          <p className={styles.sectionSubtitle}>
            {showTools ? `"${search}" 검색 결과` : t('browseCategoriesSubtitle')}
          </p>
        </div>

        {showTools ? (
          // Show tool search results
          <div className={styles.categoriesGrid}>
            {filteredTools.map((tool, i) => {
              const category = CATEGORIES.find(c => c.id === tool.category);
              return (
                <Link
                  key={tool.id}
                  href={`/${tool.id}` as any}
                  className={styles.categoryCard}
                  style={{ '--cat-color': category?.color || '#3b82f6', animationDelay: `${i * 55}ms` } as React.CSSProperties}
                >
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>
                    {category?.icon} {catT(tool.category)}
                  </span>
                  <span className={styles.catIcon} aria-hidden>{tool.icon}</span>
                  <h3 className={styles.catName}>{getToolTitle(tool.titleKey)}</h3>
                  <p className={styles.toolDesc}>{getToolDesc(tool.descKey)}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          // Show categories (default view)
          filtered.length === 0 && search ? (
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
          )
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
