'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface QuestionScreenProps {
  onComplete: (tetoScore: number, egenScore: number) => void;
}

const QUESTIONS = [
  { id: 1, tetoOption: 'A', egenOption: 'B' },
  { id: 2, tetoOption: 'A', egenOption: 'B' },
  { id: 3, tetoOption: 'A', egenOption: 'B' },
  { id: 4, tetoOption: 'A', egenOption: 'B' },
  { id: 5, tetoOption: 'A', egenOption: 'B' },
  { id: 6, tetoOption: 'A', egenOption: 'B' },
  { id: 7, tetoOption: 'B', egenOption: 'A' }, // 반대 (상대방 성향에 끌림)
  { id: 8, tetoOption: 'A', egenOption: 'B' },
  { id: 9, tetoOption: 'A', egenOption: 'B' },
  { id: 10, tetoOption: 'A', egenOption: 'B' },
];

export default function QuestionScreen({ onComplete }: QuestionScreenProps) {
  const t = useTranslations('TetoEgenTest');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [tetoScore, setTetoScore] = useState(0);
  const [egenScore, setEgenScore] = useState(0);

  const handleAnswer = (answer: 'A' | 'B') => {
    const question = QUESTIONS[currentQuestion];

    if (answer === question.tetoOption) {
      setTetoScore(tetoScore + 1);
    } else {
      setEgenScore(egenScore + 1);
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 마지막 질문 완료
      const finalTeto = answer === question.tetoOption ? tetoScore + 1 : tetoScore;
      const finalEgen = answer === question.egenOption ? egenScore + 1 : egenScore;
      onComplete(finalTeto, finalEgen);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div style={{ padding: '2rem 1rem' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('question')} {currentQuestion + 1} / {QUESTIONS.length}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ec4899' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.5 }}>
          {t(`q${currentQuestion + 1}`)}
        </h2>

        {/* Answer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => handleAnswer('A')}
            style={{
              padding: '1.5rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ec4899';
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontWeight: 700, color: '#ec4899', marginRight: '0.75rem' }}>A.</span>
            {t(`q${currentQuestion + 1}A`)}
          </button>

          <button
            onClick={() => handleAnswer('B')}
            style={{
              padding: '1.5rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontWeight: 700, color: '#8b5cf6', marginRight: '0.75rem' }}>B.</span>
            {t(`q${currentQuestion + 1}B`)}
          </button>
        </div>
      </div>
    </div>
  );
}
