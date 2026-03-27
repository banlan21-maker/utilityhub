'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function MarketingDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('MarketingBoard');

  const tools = [
    {
      id: 'utilities/marketing/osmu-formatter',
      title: boardT('osmu-formatter.title'),
      desc: boardT('osmu-formatter.desc'),
      icon: '✨',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
    },
    {
      id: 'utilities/marketing/hashtag-generator',
      title: boardT('hashtag-generator.title'),
      desc: boardT('hashtag-generator.desc'),
      icon: '#️⃣',
      gradient: 'linear-gradient(135deg, #e879f9 0%, #a21caf 100%)'
    },
    {
      id: 'utilities/marketing/qr-generator',
      title: boardT('qr-generator.title'),
      desc: boardT('qr-generator.desc'),
      icon: '🔳',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)'
    },
    {
      id: 'utilities/marketing/shorturl',
      title: boardT('shorturl.title'),
      desc: boardT('shorturl.desc'),
      icon: '🔗',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
    },
    {
      id: 'utilities/marketing/quiz-builder',
      title: boardT('quiz-builder.title'),
      desc: boardT('quiz-builder.desc'),
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    }
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('marketing')}
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
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div
                style={{
                  background: tool.gradient,
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '1.5rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
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
