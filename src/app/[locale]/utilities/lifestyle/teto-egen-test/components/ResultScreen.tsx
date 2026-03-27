'use client';

import { useTranslations } from 'next-intl';

interface ResultScreenProps {
  gender: 'male' | 'female';
  tetoScore: number;
  egenScore: number;
  onRestart: () => void;
}

export default function ResultScreen({ gender, tetoScore, egenScore, onRestart }: ResultScreenProps) {
  const t = useTranslations('TetoEgenTest');

  // 결과 타입 결정
  const isTeto = tetoScore >= egenScore;
  const resultType = `${gender}_${isTeto ? 'teto' : 'egen'}` as 'male_teto' | 'male_egen' | 'female_teto' | 'female_egen';

  // 궁합 결정
  const compatibility = {
    male_teto: 'female_egen',
    male_egen: 'female_teto',
    female_teto: 'male_egen',
    female_egen: 'male_teto',
  }[resultType];

  // 색상과 이모지
  const colors = {
    male_teto: { primary: '#3b82f6', secondary: '#2563eb', emoji: '💪' },
    male_egen: { primary: '#8b5cf6', secondary: '#7c3aed', emoji: '💝' },
    female_teto: { primary: '#ec4899', secondary: '#db2777', emoji: '👑' },
    female_egen: { primary: '#f97316', secondary: '#ea580c', emoji: '🌸' },
  };

  const color = colors[resultType];
  const percentage = Math.round((Math.max(tetoScore, egenScore) / 10) * 100);

  return (
    <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
      {/* Result Badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-xl)',
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          marginBottom: '2rem',
          boxShadow: `0 20px 60px ${color.primary}40`,
        }}
      >
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{color.emoji}</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          {t(`result_${resultType}_title`)}
        </h2>
        <div style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          {isTeto ? 'Teto' : 'Egen'} {percentage}%
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          padding: '2rem',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${color.primary}`,
          marginBottom: '2rem',
          textAlign: 'left',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: color.primary, marginBottom: '1rem' }}>
          {t('yourType')}
        </h3>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          {t(`result_${resultType}_desc1`)}
        </p>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
          {t(`result_${resultType}_desc2`)}
        </p>
      </div>

      {/* Compatibility */}
      <div
        style={{
          padding: '2rem',
          background: `linear-gradient(135deg, ${color.primary}10 0%, ${color.primary}05 100%)`,
          borderRadius: 'var(--radius-lg)',
          border: `2px dashed ${color.primary}`,
          marginBottom: '2rem',
          textAlign: 'left',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: color.primary, marginBottom: '1rem' }}>
          💕 {t('perfectMatch')}
        </h3>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {t(`result_${compatibility}_title`)}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t(`compatibility_${resultType}`)}
        </p>
      </div>

      {/* Score Breakdown */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {t('scoreBreakdown')}
        </h4>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ec4899', marginBottom: '0.25rem' }}>
              {tetoScore}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Teto</div>
          </div>
          <div style={{ width: '2px', background: 'var(--border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.25rem' }}>
              {egenScore}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Egen</div>
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        style={{
          padding: '1rem 3rem',
          border: `2px solid ${color.primary}`,
          borderRadius: 'var(--radius-lg)',
          background: 'transparent',
          color: color.primary,
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = color.primary;
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = color.primary;
        }}
      >
        {t('testAgain')}
      </button>
    </div>
  );
}
