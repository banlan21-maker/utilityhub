'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Smile } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import GenderSelection from './components/GenderSelection';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';

type Gender = 'male' | 'female' | null;
type Screen = 'gender' | 'questions' | 'result';

export default function TetoEgenTestPage() {
  const t = useTranslations('TetoEgenTest');
  const [screen, setScreen] = useState<Screen>('gender');
  const [gender, setGender] = useState<Gender>(null);
  const [tetoScore, setTetoScore] = useState(0);
  const [egenScore, setEgenScore] = useState(0);

  const handleGenderSelect = (selectedGender: 'male' | 'female') => {
    setGender(selectedGender);
    setScreen('questions');
  };

  const handleTestComplete = (teto: number, egen: number) => {
    setTetoScore(teto);
    setEgenScore(egen);
    setScreen('result');
  };

  const handleRestart = () => {
    setScreen('gender');
    setGender(null);
    setTetoScore(0);
    setEgenScore(0);
  };

  return (
    <div>
      <NavigationActions />

      <header style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Smile size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', minHeight: '500px' }}>
        {screen === 'gender' && <GenderSelection onSelect={handleGenderSelect} />}
        {screen === 'questions' && <QuestionScreen onComplete={handleTestComplete} />}
        {screen === 'result' && gender && (
          <ResultScreen
            gender={gender}
            tetoScore={tetoScore}
            egenScore={egenScore}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* SEO Content */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ec4899', marginBottom: '1rem' }}>
          {t('seoTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          {t('seoPara1')}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          {t('seoPara2')}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {t('seoPara3')}
        </p>
      </section>

      {/* FAQ */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ec4899', marginBottom: '1.5rem' }}>
          {t('faqTitle')}
        </h2>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {t(`faq${i}Q`)}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t(`faq${i}A`)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
