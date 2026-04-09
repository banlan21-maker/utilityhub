'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import styles from './page.module.css';

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '바다 생물 MBTI 테스트',
  alternateName: 'Sea Creature MBTI Test',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/mbti-test',
  description: '12가지 심리 분석 질문으로 나와 닮은 바다 생물을 찾는 무료 MBTI 성격 테스트',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'MBTI 지표는 어떻게 활용되나요?', acceptedAnswer: { '@type': 'Answer', text: '에너지 방향(E/I), 탐색 방식(S/N), 교감 방식(T/F), 대응 방식(J/P)의 4가지 축을 동물의 실제 생태적 특징과 연결하여 분석합니다.' } },
    { '@type': 'Question', name: '결과는 몇 가지인가요?', acceptedAnswer: { '@type': 'Answer', text: '총 16가지의 서로 다른 MBTI 조합에 맞춰 16가지의 매력적인 바다 생물 결과가 준비되어 있습니다.' } },
    { '@type': 'Question', name: '과학적으로 정확한가요?', acceptedAnswer: { '@type': 'Answer', text: '이 테스트는 전문적인 심리 진단 도구보다는 재미와 공감을 목적으로 설계되었습니다. 가벼운 마음으로 즐겨주세요!' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

type Step = 'start' | 'quiz' | 'loading' | 'result';

interface Scores {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

export default function SeaMbtiPage() {
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
    <div className={`${styles.card} ${styles.fadeIn}`} style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex',
        padding: '1rem',
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        marginBottom: '1.5rem'
      }}>
        <Waves size={40} color="#8b5cf6" />
      </div>
      <h1 className={styles.startTitle} style={{ whiteSpace: 'pre-line', margin: '0 0 0.75rem', lineHeight: 1.4, fontSize: '2.25rem', fontWeight: 800, color: '#1e293b' }}>
        {t('title')}
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
        {t('description')}
      </p>
      <div style={{ fontSize: '4.5rem', marginBottom: '3rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
        🌊🐬🦦🐢🌊
      </div>
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
    <div className={`${styles.card} ${styles.fadeIn}`}>
      <div className={styles.loaderArea}>
        <div className={styles.spinner} />
        <h2 style={{ color: 'var(--primary)', marginTop: '2rem', animation: 'pulse 1.5s infinite' }}>{t('loading')}</h2>
      </div>
    </div>
  );

  const renderResult = () => {
    const result = currentResult;
    if (!result) return null;
    const imageUrl = `/img/sea-mbti/${resultMBTI.toLowerCase()}.jpeg`;

    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
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
          <p style={{ fontWeight: 600, color: '#0ea5e9', marginBottom: '0.5rem', fontSize: '1rem' }}>
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
          <button className={styles.restartBtn} onClick={() => setStep('start')}>
            {t('restartBtn')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />
      
      {step === 'start' && renderStart()}
      {step === 'quiz' && renderQuiz()}
      {step === 'loading' && renderLoading()}
      {step === 'result' && renderResult()}

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/mbti-test" />

      {/* 광고 영역 */}
      <div style={{
        width: '100%',
        minHeight: '90px',
        background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        margin: '2rem 0'
      }}>
        광고 영역
      </div>

      <SeoSection
        ko={{
          title: '나와 닮은 바다 생물 MBTI 테스트란?',
          description: '바다 생물 MBTI 테스트는 12가지 심리 분석 질문을 통해 여러분의 행동 양식과 에너지를 분석하고, 넓고 신비로운 바다 속에서 여러분과 가장 성격이 닮은 동물을 찾아드립니다. 16가지의 다양한 바다 생물 결과를 통해 나의 장점과 찰떡궁합인 친구를 함께 확인해보세요.',
          useCases: [
            { icon: '🏖️', title: '심심할 때 즐기는 힐링', desc: '바쁜 일상 속에서 바다의 여유를 느끼며 잠시 쉬어가는 힐링 심리 테스트로 활용하세요.' },
            { icon: '👥', title: '친구와의 소통 도구', desc: '테스트 결과를 SNS에 공유하여 서로 어떤 바다 생물인지 비교해보고 우정을 쌓으세요.' },
            { icon: '🔍', title: '자아 성찰의 시간', desc: '간단한 질문에 솔직하게 답하며 평소 내가 어떤 성향을 가지고 있는지 가볍게 돌아볼 수 있습니다.' },
            { icon: '🐬', title: '생물학적 재미 발견', desc: '동물의 실제 행동 특성과 MBTI 지표를 연결하여 평소 몰랐던 바다 동물의 특성을 이해하게 됩니다.' }
          ],
          steps: [
            { step: '테스트 시작', desc: '시작 버튼을 눌러 테스트에 진입하세요. 총 12개의 질문이 주어집니다.' },
            { step: '직관적인 답변 선택', desc: '깊게 고민하지 말고, 평소 자신의 모습에 더 가까운 선택지를 고르세요.' },
            { step: '분석 및 결과 확인', desc: '생물을 찾는 로딩 시간이 지나면 최종 결과와 함께 찰떡궁합 친구 정보를 확인합니다.' },
            { step: '공유하기', desc: '결과를 하단 공유 버튼을 통해 인스타그램이나 카톡으로 친구에게 보내보세요.' }
          ],
          faqs: [
            { q: 'MBTI 지표는 어떻게 활용되나요?', a: '에너지 방향(E/I), 탐색 방식(S/N), 교감 방식(T/F), 대응 방식(J/P)의 4가지 축을 동물의 실제 생태적 특징과 연결하여 분석합니다.' },
            { q: '결과는 몇 가지인가요?', a: '총 16가지의 서로 다른 MBTI 조합에 맞춰 16가지의 매력적인 바다 생물 결과가 준비되어 있습니다.' },
            { q: '과학적으로 정확한가요?', a: '이 테스트는 전문적인 심리 진단 도구보다는 재미와 공감을 목적으로 설계되었습니다. 가벼운 마음으로 즐겨주세요!' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' }
          ]
        }}
        en={{
          title: 'What is the Sea Creature MBTI Test?',
          description: 'The Sea Creature MBTI Test analyzes your behavior and energy through 12 psychological questions to find the animal that most closely matches your personality in the mysterious deep sea. Discover your strengths and your perfect match among 16 different marine results.',
          useCases: [
            { icon: '🏖️', title: 'Quick Fun Break', desc: 'Take a brief, healing break during your busy day to feel the tranquility of the sea.' },
            { icon: '👥', title: 'Social Icebreaker', desc: 'Share your results on social media to compare creature types with friends and build connections.' },
            { icon: '🔍', title: 'Light Self-Reflection', desc: 'A quick way to look back at your natural tendencies by answering simple, intuitive questions.' },
            { icon: '🐬', title: 'Marine Life Fun', desc: 'Discover interesting biological traits of sea animals mapped to behavioral personality types.' }
          ],
          steps: [
            { step: 'Start Test', desc: 'Press start to begin. You will be asked a total of 12 questions.' },
            { step: 'Pick Your Best Match', desc: 'Don\'t overthink; simply choose the option that feels most like you.' },
            { step: 'View Analysis', desc: 'After a short loading period, your creature and personality report will appear.' },
            { step: 'Share Results', desc: 'Use the buttons at the bottom to send your results to friends via Instagram or KakaoTalk.' }
          ],
          faqs: [
            { q: 'How are the MBTI traits used?', a: 'We map Energy (E/I), Perception (S/N), Logic/Empathy (T/F), and Lifestyle (J/P) to the ecological behaviors of marine animals.' },
            { q: 'How many results are there?', a: 'There are 16 unique marine results corresponding to each of the 16 MBTI personality combinations.' },
            { q: 'Is it scientifically accurate?', a: 'This test is designed for fun and empathy rather than clinical diagnosis. Please enjoy it with a light heart!' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' }
          ]
        }}
      />
    </div>
  );
}
