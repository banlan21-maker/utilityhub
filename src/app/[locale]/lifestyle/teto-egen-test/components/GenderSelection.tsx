'use client';

import { useTranslations } from 'next-intl';

interface GenderSelectionProps {
  onSelect: (gender: 'male' | 'female') => void;
}

export default function GenderSelection({ onSelect }: GenderSelectionProps) {
  const t = useTranslations('TetoEgenTest');

  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        {t('genderSelectTitle')}
      </h2>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        {t('genderSelectDesc')}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onSelect('male')}
          style={{
            width: '200px',
            height: '200px',
            border: '3px solid #3b82f6',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '4rem' }}>👨</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
            {t('male')}
          </div>
        </button>

        <button
          onClick={() => onSelect('female')}
          style={{
            width: '200px',
            height: '200px',
            border: '3px solid #ec4899',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(236, 72, 153, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '4rem' }}>👩</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>
            {t('female')}
          </div>
        </button>
      </div>
    </div>
  );
}
