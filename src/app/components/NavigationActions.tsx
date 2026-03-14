'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

export default function NavigationActions() {
  const t = useTranslations('Navigation');
  const router = useRouter();

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.75rem', 
      marginBottom: 'var(--section-gap)',
      justifyContent: 'flex-start',
      flexWrap: 'wrap'
    }}>
      <button 
        onClick={() => router.back()}
        style={{
          padding: '0.6rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--surface-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--surface)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>←</span> {t('back')}
      </button>

      <Link 
        href="/"
        style={{
          padding: '0.6rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--surface-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--surface)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🏠</span> {t('home')}
      </Link>
    </div>
  );
}
