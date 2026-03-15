'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

export default function DDayPage() {
  const t = useTranslations('DDay');
  const catT = useTranslations('Categories');
  
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dDayResult, setDDayResult] = useState<string | number>('');
  
  const [addDays, setAddDays] = useState<string>('');
  const [addMonths, setAddMonths] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('');

  // D-Day Calculation
  useEffect(() => {
    if (!targetDate) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      setDDayResult(t('today'));
    } else if (diffDays > 0) {
      setDDayResult(`D-${diffDays}`);
    } else {
      setDDayResult(`D+${Math.abs(diffDays)}`);
    }
  }, [targetDate, t]);

  // Date Arithmetic Calculation
  const calculateFutureDate = () => {
    const base = new Date(targetDate);
    if (isNaN(base.getTime())) return;

    if (addDays) {
      base.setDate(base.getDate() + parseInt(addDays));
    }
    if (addMonths) {
      base.setMonth(base.getMonth() + parseInt(addMonths));
    }
    
    setCalcResult(base.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }));
  };

  useEffect(() => {
    calculateFutureDate();
  }, [targetDate, addDays, addMonths]);

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('description')}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Main D-Day Section */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('targetDateLabel')}
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="glass-panel"
            style={{
              padding: '1rem',
              fontSize: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border)',
              outline: 'none',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
              width: '100%',
              maxWidth: '300px'
            }}
          />
          
          <div style={{ 
            marginTop: '1rem',
            padding: '2rem',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-block',
            minWidth: '240px'
          }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {t('dDayResult')}
            </p>
            <p style={{ 
              fontSize: '4rem', 
              fontWeight: 800, 
              color: 'var(--primary)',
              margin: 0,
              letterSpacing: '-2px'
            }}>
              {dDayResult}
            </p>
            {dDayResult === t('today') && (
              <p style={{ color: 'var(--secondary)', fontWeight: 600, marginTop: '0.5rem' }}>
                {t('isToday')}
              </p>
            )}
          </div>
        </div>

        {/* Date Arithmetic Section */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {t('dateAddTitle')}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('addDays')}</label>
              <input
                type="number"
                value={addDays}
                onChange={(e) => setAddDays(e.target.value)}
                placeholder={t('placeholderDays')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('addMonths')}</label>
              <input
                type="number"
                value={addMonths}
                onChange={(e) => setAddMonths(e.target.value)}
                placeholder="0"
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'var(--surface)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('result')}
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {calcResult || '-'}
            </p>
          </div>
        </div>

      </div>

      <SeoSection
        ko={{
          title: "D-Day & 날짜 계산기란 무엇인가요?",
          description: "D-Day 계산기는 특정 목표일까지 남은 날짜를 하루도 빠짐없이 정확하게 계산해주는 온라인 도구입니다. 수능·공무원 시험·결혼식·여행·프로젝트 마감일 등 중요한 날까지 몇 일이 남았는지 한눈에 파악할 수 있습니다. 또한 날짜 더하기/빼기 기능을 통해 계약 만료일, 수습 기간 종료일, 납기일 계산 등 업무에 필요한 날짜 산술도 간편하게 처리합니다. D-Day 계산기는 스마트폰 없이 PC에서도 빠르게 쓸 수 있는 필수 도구입니다.",
          useCases: [
            { icon: '📚', title: '시험 준비 D-Day 관리', desc: '수능, 토익, 공무원 시험 등 목표 시험일까지 남은 일수를 확인해 학습 계획을 세우고 동기를 유지합니다.' },
            { icon: '💍', title: '결혼 & 기념일 카운트다운', desc: '결혼식 D-day, 100일·1주년 기념일 등 소중한 날까지 남은 날을 계산하고 준비 일정을 역산합니다.' },
            { icon: '💼', title: '프로젝트 & 계약 관리', desc: '계약 만료일, 프로젝트 납기일, 수습 기간 종료일 등 업무상 중요한 날짜를 정확히 계산해 일정을 관리합니다.' },
            { icon: '✈️', title: '여행 & 이벤트 준비', desc: '해외여행 출발일, 콘서트·페스티벌 날짜까지 D-day를 설정해두고 준비물·예약 일정을 단계적으로 챙깁니다.' },
          ],
          steps: [
            { step: '목표 날짜 선택', desc: '달력 입력창에서 D-Day로 지정할 날짜를 선택합니다. 오늘 이전 날짜를 선택하면 "경과일"로 표시됩니다.' },
            { step: 'D-Day 결과 확인', desc: '선택 즉시 오늘로부터 며칠 남았는지(또는 며칠이 지났는지) 자동으로 계산됩니다.' },
            { step: '날짜 더하기/빼기 활용', desc: '기준 날짜에 일수나 개월 수를 더하거나 빼서 정확한 결과 날짜를 계산합니다. 계약서·납기일 산정에 유용합니다.' },
          ],
          faqs: [
            { q: 'D-Day 계산 시 오늘 날짜도 포함되나요?', a: '일반적으로 D-Day 계산은 오늘을 기준으로 내일을 D-1, 목표일 당일을 D-0으로 계산합니다. 이 도구도 동일한 방식을 따르며, 오늘이 목표일이면 "D-Day!"로 표시됩니다.' },
            { q: '날짜 더하기 계산 시 윤년·월별 일수 차이가 적용되나요?', a: '네. 이 날짜 계산기는 JavaScript 내장 Date 객체를 사용하므로 윤년(2월 29일)과 각 월의 정확한 일수가 자동 반영됩니다. 별도로 신경 쓰실 필요가 없습니다.' },
            { q: '모바일에서도 D-Day 계산이 가능한가요?', a: '네, 이 D-Day 계산기는 모바일 브라우저에서도 완벽하게 동작합니다. 앱 설치 없이 즐겨찾기에 추가해 언제든지 빠르게 접근하세요.' },
          ],
        }}
        en={{
          title: "What is a D-Day & Date Calculator?",
          description: "A D-Day calculator tells you exactly how many days remain until an important target date — or how many days have passed since one. It's perfect for tracking exam prep countdowns, wedding dates, travel departures, and project deadlines. The date arithmetic feature also handles contract expiration dates, probation period endings, and due date calculations with precision. D-Day calculators are an essential productivity tool accessible right from your browser.",
          useCases: [
            { icon: '📚', title: 'Exam Preparation Countdown', desc: 'Track days remaining until major exams or certifications to stay motivated and structure your study plan.' },
            { icon: '💍', title: 'Anniversaries & Special Events', desc: 'Count down to weddings, 100-day milestones, anniversaries, and other special occasions.' },
            { icon: '💼', title: 'Project & Contract Deadlines', desc: 'Calculate contract expiration dates, project due dates, and probation period end dates for accurate schedule management.' },
            { icon: '✈️', title: 'Travel & Event Preparation', desc: 'Set a D-day for your trip departure or concert date and use the countdown to prepare step-by-step.' },
          ],
          steps: [
            { step: 'Select your target date', desc: 'Pick a date from the calendar. Selecting a past date will show days elapsed instead.' },
            { step: 'View your D-Day result', desc: 'Days remaining (or elapsed) are calculated instantly upon selection.' },
            { step: 'Use date arithmetic', desc: 'Add or subtract days and months from a base date to calculate exact result dates for contracts and deadlines.' },
          ],
          faqs: [
            { q: 'Is today included in the D-Day count?', a: "The standard convention counts tomorrow as D-1 and the target date itself as D-0. This tool follows the same convention — if today is the target date, it displays \"D-Day!\"" },
            { q: 'Are leap years and month lengths handled correctly?', a: "Yes. This calculator uses JavaScript's built-in Date object, so leap years (Feb 29) and varying month lengths are automatically accounted for." },
            { q: 'Does this work on mobile?', a: "Yes, the D-Day calculator works perfectly in mobile browsers. Add it to your bookmarks for quick access anytime — no app installation needed." },
          ],
        }}
      />
    </div>
  );
}
