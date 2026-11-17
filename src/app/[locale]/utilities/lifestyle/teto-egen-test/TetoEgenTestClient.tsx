'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Smile } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import GenderSelection from './components/GenderSelection';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';

type Gender = 'male' | 'female' | null;
type Screen = 'gender' | 'questions' | 'result';

export default function TetoEgenTestClient() {
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

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/teto-egen-test" />

      {/* 소개·활용 사례·사용 방법·FAQ는 page.tsx의 SeoSection에서 렌더한다 (seoContent.ts) */}
    </div>
  );
}
