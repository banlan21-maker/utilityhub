'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function DesignDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('DesignBoard');

  const tools = [
    {
      id: 'utilities/design/logo',
      title: boardT('logo.title'),
      desc: boardT('logo.desc'),
      icon: '🎨',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)',
    },
    {
      id: 'utilities/design/color',
      title: boardT('color.title'),
      desc: boardT('color.desc'),
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    },
    {
      id: 'utilities/design/font',
      title: boardT('font.title'),
      desc: boardT('font.desc'),
      icon: '🔤',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    },
    {
      id: 'utilities/design/quiz',
      title: boardT('quiz.title'),
      desc: boardT('quiz.desc'),
      icon: '🧩',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    },
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('design')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {boardT('subtitle')}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div
              className="glass-panel"
              style={{
                padding: '2rem', height: '100%',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer', overflow: 'hidden',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
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
