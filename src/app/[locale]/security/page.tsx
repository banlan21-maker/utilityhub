'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function SecurityDashboardPage() {
  const catT = useTranslations('Categories');
  const t = useTranslations('SecurityBoard');

  const tools: any[] = [
    // Add security tools here later
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('security')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('subtitle')}
        </p>
      </header>

      {tools.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {tools.map((tool) => (
            <Link 
              key={tool.id} 
              href={`/${tool.id}` as any}
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="glass-panel"
                style={{
                  padding: '2rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{tool.icon}</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {tool.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {tool.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <p>{t('comingSoon')}</p>
        </div>
      )}
    </div>
  );
}
