'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function LifestyleDashboardPage() {
  const catT = useTranslations('Categories');
  const t = useTranslations('LifestyleBoard');
  const petT = useTranslations('PetFood');
  const bmiT = useTranslations('BmiWater');
  // Assume Nickname exists too, checking the previous content
  // Actually I'll use a safer way to call useTranslations for each tool or just pass the translation object
  
  const tools: any[] = [
    {
      id: 'utilities/lifestyle/pet-food',
      title: petT('title'),
      desc: petT('description'),
      icon: '🐾',
      gradient: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)'
    },
    {
      id: 'utilities/lifestyle/bmi-water',
      title: bmiT('title'),
      desc: bmiT('description'),
      icon: '💧',
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    {
      id: 'utilities/lifestyle/korean-age',
      title: t('korean-age.title'),
      desc: t('korean-age.desc'),
      icon: '🎂',
      gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
    },
    {
      id: 'utilities/lifestyle/sea-mbti',
      title: t('sea-mbti.title'),
      desc: t('sea-mbti.desc'),
      icon: '🌊',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)'
    },
    {
      id: 'utilities/lifestyle/aquarium-bioload',
      title: t('aquarium-bioload.title'),
      desc: t('aquarium-bioload.desc'),
      icon: '🐠',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      id: 'utilities/lifestyle/ai-saju-prompt',
      title: t('ai-saju-prompt.title'),
      desc: t('ai-saju-prompt.desc'),
      icon: '🔮',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #fbbf24 100%)'
    }
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('lifestyle')}
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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
          <p>{t('comingSoon')}</p>
        </div>
      )}
    </div>
  );
}
