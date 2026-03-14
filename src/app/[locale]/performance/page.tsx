'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function PerformancePage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('PerformanceBoard');

  const tools = [
    {
      id: 'performance/ttfb',
      title: boardT('ttfb.title'),
      desc: boardT('ttfb.desc'),
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #ff4757 0%, #c0392b 100%)',
    },
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('performance')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {boardT('subtitle')}
        </p>
      </header>

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
                overflow: 'hidden',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{
                background: tool.gradient,
                width: '60px', height: '60px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-md)',
              }}>
                {tool.icon}
              </div>
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
    </div>
  );
}
