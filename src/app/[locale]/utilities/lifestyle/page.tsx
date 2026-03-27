'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function LifestyleDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('LifestyleBoard');

  const tools = [
    {
      id: 'utilities/lifestyle/gpa-calc',
      title: boardT('gpa-calc.title'),
      desc: boardT('gpa-calc.desc'),
      icon: '🎓',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      id: 'utilities/lifestyle/dday-calc',
      title: boardT('dday-calc.title'),
      desc: boardT('dday-calc.desc'),
      icon: '📅',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      id: 'utilities/lifestyle/age-calc',
      title: boardT('age-calc.title'),
      desc: boardT('age-calc.desc'),
      icon: '🎂',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    {
      id: 'utilities/lifestyle/pet-calorie',
      title: boardT('pet-calorie.title'),
      desc: boardT('pet-calorie.desc'),
      icon: '🐾',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    {
      id: 'utilities/lifestyle/bmi-calc',
      title: boardT('bmi-calc.title'),
      desc: boardT('bmi-calc.desc'),
      icon: '💧',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
    {
      id: 'utilities/lifestyle/mbti-test',
      title: boardT('mbti-test.title'),
      desc: boardT('mbti-test.desc'),
      icon: '🧜',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      id: 'utilities/lifestyle/aquarium-calc',
      title: boardT('aquarium-calc.title'),
      desc: boardT('aquarium-calc.desc'),
      icon: '🐠',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      id: 'utilities/lifestyle/fortune-prompt',
      title: boardT('fortune-prompt.title'),
      desc: boardT('fortune-prompt.desc'),
      icon: '🔮',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    },
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('lifestyle')}
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
