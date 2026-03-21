'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import styles from './page.module.css';

type Step = 'start' | 'quiz' | 'loading' | 'result';

interface Scores {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

export default function SeaMbtiPage() {
  const t = useTranslations('SeaMbti');
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
    }, 400); // Slightly faster for snappier feel
  };

  const calculateResult = (finalScores: Scores) => {
    setStep('loading');
    
    let mbti = '';
    mbti += finalScores.E >= finalScores.I ? 'E' : 'I';
    mbti += finalScores.S >= finalScores.N ? 'S' : 'N';
    mbti += finalScores.T >= finalScores.F ? 'T' : 'F';
    mbti += finalScores.J >= finalScores.P ? 'J' : 'P';
    
    setResultMBTI(mbti);

    // Artificial delay for loading effect (Exactly 2 seconds as requested)
    setTimeout(() => {
      setStep('result');
      setIsAnimating(false);
    }, 2000);
  };

  const shareResult = (platform: string) => {
    const url = window.location.href;
    const title = '나와 닮은 바다 생물 MBTI 테스트 결과는?';
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('URL이 복사되었습니다!');
        });
        break;
      case 'kakao':
        // Kakao sharing usually involves their SDK, but we can use a basic share link if set up
        window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      default:
        break;
    }
  };

  const renderStart = () => (
    <div className={`${styles.card} ${styles.fadeIn}`}>
      <h1 className={styles.startTitle}>{t('title')}</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem', padding: '0 1rem' }}>
        {t('description')}
      </p>
      <div style={{ fontSize: '4rem', marginBottom: '2.5rem' }}>🐋🦑🐬🐢🐙</div>
      <button className={styles.startBtn} onClick={startTest}>
        {t('startBtn')}
      </button>
    </div>
  );

  const renderQuiz = () => {
    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className={`${styles.card} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>
          Q{currentIdx + 1} / {questions.length}
        </p>
        <h2 className={styles.question}>{q.q}</h2>
        <button className={styles.optionBtn} onClick={() => handleAnswer(q.type, 'a')}>
          <span className={styles.choiceCircle}>A</span> 
          <span className={styles.optionText}>{q.a}</span>
        </button>
        <button className={styles.optionBtn} onClick={() => handleAnswer(q.type, 'b')}>
          <span className={styles.choiceCircle}>B</span> 
          <span className={styles.optionText}>{q.b}</span>
        </button>
      </div>
    );
  };

  const renderLoading = () => (
    <div className={`${styles.card} ${styles.fadeIn}`}>
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <h2 style={{ color: 'var(--primary)', marginTop: '2rem' }}>{t('loading')}</h2>
      </div>
    </div>
  );

  const renderResult = () => {
    const result = t.raw(`results.${resultMBTI}`);
    const imageUrl = `/img/sea-mbti/${resultMBTI.toLowerCase()}.jpeg`;

    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <p className={styles.resultTitle}>{t('resultIntro')}</p>
        <h2 className={styles.resultAnimal}>{resultMBTI}: {result.animal}</h2>
        
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

        <div style={{ marginBottom: '2rem' }}>
          <h3 className={styles.resultBadge}>
            "{result.title}"
          </h3>
          <div className={styles.resultDesc}>
            {result.desc}
          </div>
        </div>

        <div className={styles.matchCard}>
          <p style={{ fontWeight: 600, color: '#0ea5e9', marginBottom: '0.5rem' }}>
            💙 {t('matchTitle')}
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>
             {result.match}
          </p>
        </div>

        <div className={styles.shareContainer}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('shareTitle')}</p>
          <div className={styles.shareIcons}>
            <button className={styles.shareBtn} onClick={() => shareResult('kakao')} title="카카오톡">💬</button>
            <button className={styles.shareBtn} onClick={() => shareResult('twitter')} title="트위터">🐦</button>
            <button className={styles.shareBtn} onClick={() => shareResult('facebook')} title="페이스북">📘</button>
            <button className={styles.shareBtn} onClick={() => shareResult('copy')} title="URL 복사">🔗</button>
          </div>
          <button className={styles.restartBtn} onClick={() => setStep('start')}>
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
    </div>
  );
}
