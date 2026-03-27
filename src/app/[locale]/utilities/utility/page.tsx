'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function UtilityDashboardPage() {
  const catT = useTranslations('Categories');
  const t = useTranslations('UtilityBoard');

  const tools = [
    {
      id: 'utilities/utility/thumbnail',
      title: t('thumbnail.title'),
      desc: t('thumbnail.desc'),
      icon: '📸',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      id: 'utilities/utility/shorturl',
      title: t('shorturl.title'),
      desc: t('shorturl.desc'),
      icon: '🔗',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    },
    {
      id: 'utilities/utility/area',
      title: t('area.title'),
      desc: t('area.desc'),
      icon: '📐',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
    },
    {
      id: 'utilities/utility/qr',
      title: t('qr.title'),
      desc: t('qr.desc'),
      icon: '🔲',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
    },
    {
      id: 'utilities/utility/counter',
      title: t('counter.title'),
      desc: t('counter.desc'),
      icon: '📝',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'utilities/utility/dday',
      title: t('dday.title'),
      desc: t('dday.desc'),
      icon: '📅',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 'utilities/utility/gpa',
      title: t('gpa.title'),
      desc: t('gpa.desc'),
      icon: '📊',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
    },
    {
      id: 'utilities/utility/unit-converter',
      title: t('unit-converter.title'),
      desc: t('unit-converter.desc'),
      icon: '⚖️',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    },
    {
      id: 'utilities/utility/image-compressor',
      title: t('image-compressor.title'),
      desc: t('image-compressor.desc'),
      icon: '🗜️',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
    },
    {
      id: 'utilities/utility/image-resizer',
      title: t('image-resizer.title'),
      desc: t('image-resizer.desc'),
      icon: '✂️',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    },
    {
      id: 'utilities/utility/smart-excel-mapper',
      title: t('smart-excel-mapper.title'),
      desc: t('smart-excel-mapper.desc'),
      icon: '📊',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    },
    {
      id: 'utilities/utility/games/wordle',
      title: t('wordle.title'),
      desc: t('wordle.desc'),
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('utility')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('subtitle')}
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
