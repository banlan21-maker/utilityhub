'use client';

import { useState, useEffect } from 'react';
import {Link} from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import {useTranslations} from 'next-intl';

export default function Header() {
  const t = useTranslations('Index');
  const nav = useTranslations('Navigation');

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('utilhub-theme');
    const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('utilhub-theme', next ? 'dark' : 'light');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      height: 'var(--header-height)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="main-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        height: '100%'
      }}>
        <Link href="/" style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🛠️</span>
          {t('title')}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              padding: '0.45rem 0.6rem',
              fontSize: '1rem',
              lineHeight: 1,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--surface-hover)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link
            href="/feedback"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <span>💬</span>
            {nav('feedback')}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
