'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import styles from './page.module.css';
import { ui } from '@/app/components/ui';

type Step = 'start' | 'quiz' | 'loading' | 'result';

interface Scores {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

export default function MbtiTestClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('SeaMbti');
  const locale = useLocale();
  const [step, setStep] = useState<Step>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Scores>({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  });
  const [resultMBTI, setResultMBTI] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Questions are from translation file
  const questions = t.raw('questions') as any[];

  const startTest = () => {
    setStep('quiz');
    setCurrentIdx(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswer = (type: string, choice: 'a' | 'b') => {
    if (isAnimating) return;

    // Update scores
    const newScores = { ...scores };
    const char = choice === 'a' ? type[0] : type[1];
    (newScores as any)[char] += 1;
    setScores(newScores);

    // Transition
    setIsAnimating(true);
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setIsAnimating(false);
      } else {
        calculateResult(newScores);
      }
    }, 400);
  };

  const calculateResult = (finalScores: Scores) => {
    setStep('loading');

    let mbti = '';
    mbti += finalScores.E >= finalScores.I ? 'E' : 'I';
    mbti += finalScores.S >= finalScores.N ? 'S' : 'N';
    mbti += finalScores.T >= finalScores.F ? 'T' : 'F';
    mbti += finalScores.J >= finalScores.P ? 'J' : 'P';

    setResultMBTI(mbti);

    setTimeout(() => {
      setStep('result');
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  const currentResult = useMemo(() => {
    if (!resultMBTI) return null;
    return t.raw(`results.${resultMBTI}`);
  }, [resultMBTI, t]);

  const renderStart = () => (
    <>
      <ToolHeader icon={<Waves />} title={t('title')} subtitle={t('description')} />
      <div className={`${ui.card} ${styles.card} ${styles.fadeIn}`} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '3rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
          🌊🐬🦦🐢🌊
        </div>
        <button className={`${ui.button} ${ui.primary} ${ui.lg} ${styles.startBtn}`} onClick={startTest}>
          {t('startBtn')}
        </button>
      </div>
    </>
  );

  const renderQuiz = () => {
    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className={`${ui.card} ${styles.card} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span className={styles.qNum}>Q{currentIdx + 1} / {questions.length}</span>
        </div>
        <h2 className={styles.question}>{q.q}</h2>
        <div className={styles.optionsWrapper}>
          <button className={styles.optionBtn} onClick={() => handleAnswer(q.type, 'a')}>
            <span className={styles.choiceCircle}>A</span>
            <span className={styles.optionText}>{q.a}</span>
          </button>
          <button className={styles.optionBtn} onClick={() => handleAnswer(q.type, 'b')}>
            <span className={styles.choiceCircle}>B</span>
            <span className={styles.optionText}>{q.b}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className={`${ui.card} ${styles.card} ${styles.fadeIn}`}>
      <div className={styles.loaderArea}>
        <div className={styles.spinner} />
        <h2 style={{ color: 'var(--color-primary)', marginTop: '2rem', animation: 'pulse 1.5s infinite' }}>{t('loading')}</h2>
      </div>
    </div>
  );

  const renderResult = () => {
    const result = currentResult;
    if (!result) return null;
    const imageUrl = `/img/sea-mbti/${resultMBTI.toLowerCase()}.jpeg`;

    return (
      <div className={`${ui.card} ${styles.card} ${styles.fadeIn}`}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className={styles.resultTitle}>{t('resultIntro')}</p>
          <h2 className={styles.resultAnimal}>{result.animal} <span style={{ opacity: 0.5, fontSize: '0.9em' }}>({resultMBTI})</span></h2>
        </div>

        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={result.animal}
            className={styles.resultImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600/e0f2fe/0ea5e9?text=' + result.animal;
            }}
          />
        </div>

        <div className={styles.resultDetails}>
          <h3 className={styles.resultBadge}>
            "{result.title}"
          </h3>
          <div className={styles.resultDesc}>
            {result.desc}
          </div>
        </div>

        <div className={styles.matchCard}>
          <p style={{ fontWeight: 600, color: 'var(--tint-sky-fg)', marginBottom: '0.5rem', fontSize: '1rem' }}>
            💙 {t('matchTitle')} 💙
          </p>
          <p style={{ fontSize: '1.6rem', fontWeight: 900 }}>
             {result.match}
          </p>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <ShareBar
            title={`${t('resultIntro')} [${result.animal}] - ${result.title}`}
            description={t('description')}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button className={`${ui.button} ${ui.secondary}`} onClick={() => setStep('start')}>
            {t('restartBtn')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <NavigationActions />

      {step === 'start' && renderStart()}
      {step === 'quiz' && renderQuiz()}
      {step === 'loading' && renderLoading()}
      {step === 'result' && renderResult()}

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/mbti-test" />


      {seo}
    </div>
  );
}
