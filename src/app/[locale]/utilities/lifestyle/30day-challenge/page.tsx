'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Calendar, Download, Palette, RefreshCw, Sparkles } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import s from './challenge.module.css';

type ThemeColor = {
  name: string;
  primary: string;
  light: string;
  gradient: string;
};

const THEMES: ThemeColor[] = [
  { name: 'Violet', primary: '#8b5cf6', light: '#f3f0ff', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' },
  { name: 'Mint', primary: '#10b981', light: '#ecfdf5', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { name: 'Pink', primary: '#ec4899', light: '#fdf2f8', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
  { name: 'Sky', primary: '#3b82f6', light: '#eff6ff', gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' },
  { name: 'Gray', primary: '#6b7280', light: '#f9fafb', gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)' },
];

interface ChallengeData {
  title: string;
  startDate: string;
  theme: number;
  stamps: boolean[];
}

export default function ThirtyDayChallengePage() {
  const t = useTranslations('30DayChallenge');
  const locale = useLocale();
  const isKorean = locale === 'ko';

  const [challengeTitle, setChallengeTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [stamps, setStamps] = useState<boolean[]>(Array(30).fill(false));
  const [isSetup, setIsSetup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('30day-challenge');
    if (saved) {
      try {
        const data: ChallengeData = JSON.parse(saved);
        setChallengeTitle(data.title);
        setStartDate(data.startDate);
        setSelectedTheme(data.theme);
        setStamps(data.stamps);
        setIsSetup(true);
      } catch (e) {
        console.error('Failed to load challenge data:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isSetup) {
      const data: ChallengeData = {
        title: challengeTitle,
        startDate,
        theme: selectedTheme,
        stamps,
      };
      localStorage.setItem('30day-challenge', JSON.stringify(data));
    }
  }, [challengeTitle, startDate, selectedTheme, stamps, isSetup]);

  // Check completion for confetti
  useEffect(() => {
    const completed = stamps.filter(Boolean).length;
    if (completed === 30 && !showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: [THEMES[selectedTheme].primary],
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 60,
          spread: 80,
          origin: { x: 0 },
        });
      }, 200);
      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 120,
          spread: 80,
          origin: { x: 1 },
        });
      }, 400);
    }
  }, [stamps, showConfetti, selectedTheme]);

  const handleStartChallenge = () => {
    if (!challengeTitle.trim() || !startDate) {
      alert(isKorean ? '챌린지 제목과 시작 날짜를 입력해주세요!' : 'Please enter challenge title and start date!');
      return;
    }
    setIsSetup(true);
    setStamps(Array(30).fill(false));
    setShowConfetti(false);
  };

  const handleReset = () => {
    if (confirm(isKorean ? '챌린지를 초기화하시겠습니까?' : 'Reset your challenge?')) {
      setIsSetup(false);
      setChallengeTitle('');
      setStartDate('');
      setStamps(Array(30).fill(false));
      setShowConfetti(false);
      localStorage.removeItem('30day-challenge');
    }
  };

  const toggleStamp = (index: number) => {
    const newStamps = [...stamps];
    newStamps[index] = !newStamps[index];
    setStamps(newStamps);
  };

  const completedCount = stamps.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 30) * 100);
  const theme = THEMES[selectedTheme];

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Title
    doc.setFontSize(24);
    doc.setTextColor(theme.primary);
    doc.text(challengeTitle || '30 Day Challenge', 105, 30, { align: 'center' });

    // Date
    doc.setFontSize(12);
    doc.setTextColor('#6b7280');
    doc.text(`Start: ${startDate}`, 105, 40, { align: 'center' });

    // Progress
    doc.setFontSize(14);
    doc.setTextColor('#1e293b');
    doc.text(`Progress: ${completedCount}/30 (${progressPercent}%)`, 105, 50, { align: 'center' });

    // Grid
    const startX = 30;
    const startY = 70;
    const cellSize = 25;
    const gap = 3;

    for (let i = 0; i < 30; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = startX + col * (cellSize + gap);
      const y = startY + row * (cellSize + gap);

      // Cell background
      if (stamps[i]) {
        doc.setFillColor(theme.primary);
        doc.rect(x, y, cellSize, cellSize, 'F');
      } else {
        doc.setDrawColor('#e5e7eb');
        doc.setLineWidth(0.5);
        doc.rect(x, y, cellSize, cellSize);
      }

      // Day number
      doc.setFontSize(10);
      doc.setTextColor(stamps[i] ? '#ffffff' : '#6b7280');
      doc.text(`${i + 1}`, x + cellSize / 2, y + cellSize / 2 + 2, { align: 'center' });

      // Stamp emoji
      if (stamps[i]) {
        doc.setFontSize(16);
        doc.text('✓', x + cellSize / 2, y + cellSize / 2 - 3, { align: 'center' });
      }
    }

    // Footer branding
    doc.setFontSize(10);
    doc.setTextColor('#9ca3af');
    doc.text('Start your challenge at theutilhub.com', 105, 280, { align: 'center' });

    doc.save(`${challengeTitle || '30day-challenge'}.pdf`);
  };

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Tool Start Card */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Calendar size={40} color={theme.primary} />
        </div>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          background: theme.gradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.75rem'
        }}>
          {isKorean ? '나만의 30일 챌린지 트래커' : '30 Day Challenge Tracker'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isKorean ? '새로운 습관을 만드는 30일의 여정을 시작하세요' : 'Track your 30-day journey to build new habits'}
        </p>
      </header>

      {/* Main Panel */}
      <div className={s.tool_panel}>
        {!isSetup ? (
          // Setup Form
          <div className={s.setup_form}>
            <div className={s.form_group}>
              <label className={s.form_label}>
                <Sparkles size={18} />
                {isKorean ? '챌린지 목표' : 'Challenge Goal'}
              </label>
              <input
                type="text"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder={isKorean ? '예: 매일 영단어 20개 외우기' : 'e.g., Read 20 pages daily'}
                className={s.input}
                maxLength={50}
              />
            </div>

            <div className={s.form_group}>
              <label className={s.form_label}>
                <Calendar size={18} />
                {isKorean ? '시작 날짜' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={s.input}
              />
            </div>

            <div className={s.form_group}>
              <label className={s.form_label}>
                <Palette size={18} />
                {isKorean ? '테마 컬러' : 'Theme Color'}
              </label>
              <div className={s.theme_grid}>
                {THEMES.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTheme(idx)}
                    className={`${s.theme_button} ${selectedTheme === idx ? s.theme_button_active : ''}`}
                    style={{
                      background: t.gradient,
                      transform: selectedTheme === idx ? 'scale(1.1)' : 'scale(1)',
                    }}
                    title={t.name}
                  >
                    {selectedTheme === idx && '✓'}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleStartChallenge} className={s.start_button} style={{ background: theme.gradient }}>
              {isKorean ? '챌린지 시작하기' : 'Start Challenge'}
            </button>
          </div>
        ) : (
          // Challenge Tracker
          <div className={s.tracker}>
            <div className={s.challenge_header}>
              <h2 className={s.challenge_title}>{challengeTitle}</h2>
              <p className={s.challenge_date}>
                {isKorean ? '시작일' : 'Started'}: {startDate}
              </p>
            </div>

            {/* Progress Bar */}
            <div className={s.progress_section}>
              <div className={s.progress_info}>
                <span className={s.progress_text}>
                  {completedCount}/30 {isKorean ? '일 완료' : 'days completed'}
                </span>
                <span className={s.progress_percent} style={{ color: theme.primary }}>
                  {progressPercent}%
                </span>
              </div>
              <div className={s.progress_bar_bg}>
                <div
                  className={s.progress_bar_fill}
                  style={{
                    width: `${progressPercent}%`,
                    background: theme.gradient,
                  }}
                />
              </div>
            </div>

            {/* 30-Day Grid */}
            <div className={s.grid}>
              {stamps.map((checked, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleStamp(idx)}
                  className={`${s.cell} ${checked ? s.cell_checked : ''}`}
                  style={{
                    background: checked ? theme.gradient : theme.light,
                    borderColor: checked ? theme.primary : '#e5e7eb',
                  }}
                >
                  <span className={s.cell_number} style={{ color: checked ? '#fff' : '#6b7280' }}>
                    {idx + 1}
                  </span>
                  {checked && <span className={s.cell_stamp}>✓</span>}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className={s.action_buttons}>
              <button onClick={exportToPDF} className={s.action_button} style={{ borderColor: theme.primary, color: theme.primary }}>
                <Download size={18} />
                {isKorean ? 'PDF 다운로드' : 'Download PDF'}
              </button>
              <button onClick={handleReset} className={s.action_button}>
                <RefreshCw size={18} />
                {isKorean ? '챌린지 초기화' : 'Reset Challenge'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Bar */}
      <ShareBar
        title={isKorean ? '📅 30일 챌린지 트래커' : '📅 30 Day Challenge Tracker'}
        description={isKorean ? '새로운 습관을 만드는 30일의 여정' : 'Build new habits in 30 days'}
      />

      {/* Related Tools */}
      <RelatedTools toolId="utilities/lifestyle/30day-challenge" limit={3} />

      {/* Ad Placeholder */}
      <div className={s.ad_placeholder}>
        {isKorean ? '광고 영역' : 'Ad Space'}
      </div>

      <SeoSection
        ko={{
          title: "30일 챌린지 트래커란 무엇인가요?",
          description: "30일 챌린지는 새로운 습관을 형성하거나 목표를 달성하기 위해 30일 동안 매일 특정 행동을 반복하는 자기 계발 방법입니다. 연구에 따르면 새로운 습관이 자동화되려면 평균 21~66일이 걸리며, 30일은 습관 형성의 핵심 기간입니다. 이 온라인 트래커는 브라우저 localStorage를 활용하여 30일간의 진행 상황을 안전하게 보관하며, PDF로 출력하여 오프라인에서도 기록할 수 있습니다. 운동, 독서, 명상, 영어 공부 등 어떤 목표든 시각적으로 추적하며 성취감을 느낄 수 있습니다.",
          useCases: [
            { icon: '💪', title: '헬스 & 운동 챌린지', desc: '스쿼트 100개, 플랭크 1분, 물 2L 마시기 등 건강 목표를 30일간 기록하며 몸의 변화를 경험하세요.' },
            { icon: '📚', title: '독서 & 학습 챌린지', desc: '매일 책 20페이지 읽기, 영단어 30개 암기, 강의 1개 수강 등 꾸준한 학습 습관을 만드세요.' },
            { icon: '🧘', title: '멘탈 관리 챌린지', desc: '명상 10분, 감사 일기 쓰기, 디지털 디톡스 등 정신 건강을 위한 루틴을 정착시키세요.' },
            { icon: '🎨', title: '창작 & 생산성 챌린지', desc: '매일 그림 그리기, 블로그 글쓰기, 코딩 1시간 등 창작 활동을 꾸준히 이어가세요.' },
          ],
          steps: [
            { step: '챌린지 목표와 시작 날짜 입력', desc: "나만의 목표(예: '매일 영단어 20개 외우기')와 시작 날짜를 입력하고 원하는 테마 컬러를 선택합니다." },
            { step: '매일 체크하기', desc: '목표를 달성한 날은 해당 날짜 칸을 클릭하여 스탬프를 찍습니다. 30개의 칸이 모두 채워질 때까지 꾸준히 기록하세요.' },
            { step: 'PDF 출력 또는 브라우저 추적', desc: 'PDF로 다운로드하여 벽에 붙여 오프라인으로 기록하거나, 매일 사이트에 방문하여 온라인으로 체크할 수 있습니다. 데이터는 localStorage에 안전하게 보관됩니다.' },
          ],
          faqs: [
            { q: '기록이 사라지면 어떡하나요?', a: '브라우저의 localStorage에 저장되므로 쿠키나 캐시를 삭제하지 않는 한 안전하게 보관됩니다. 만약을 대비해 PDF로 백업하는 것을 추천합니다.' },
            { q: '모바일에서도 사용할 수 있나요?', a: '네, 모바일 브라우저에서도 정상적으로 작동하며 터치로 간편하게 스탬프를 찍을 수 있습니다.' },
            { q: '30일이 아닌 다른 기간으로 설정할 수 있나요?', a: '현재 버전은 30일로 고정되어 있습니다. 더 짧거나 긴 기간이 필요하다면 피드백을 남겨주세요!' },
            { q: '챌린지 도중 놓친 날이 있으면 실패인가요?', a: '완벽주의보다는 꾸준함이 중요합니다. 하루 이틀 놓쳤다고 포기하지 말고 다시 시작하세요. 30일 중 25일 이상만 달성해도 훌륭한 성과입니다.' },
          ],
        }}
        en={{
          title: "What is a 30-Day Challenge Tracker?",
          description: "A 30-day challenge is a personal development method where you repeat a specific action daily for 30 days to build a new habit or achieve a goal. Research shows that it takes an average of 21 to 66 days for a new habit to become automatic, making 30 days a critical period for habit formation. This online tracker uses browser localStorage to securely save your 30-day progress and allows you to export to PDF for offline tracking. Whether it's exercise, reading, meditation, or learning English, you can visually track any goal and feel a sense of achievement.",
          useCases: [
            { icon: '💪', title: 'Fitness & Exercise Challenges', desc: 'Track 30 days of squats, planks, or drinking 2L of water daily to experience physical transformation.' },
            { icon: '📚', title: 'Reading & Learning Challenges', desc: 'Build consistent learning habits: read 20 pages, memorize 30 words, or complete 1 lesson daily.' },
            { icon: '🧘', title: 'Mental Wellness Challenges', desc: 'Establish routines for mental health: 10 min meditation, gratitude journaling, or digital detox.' },
            { icon: '🎨', title: 'Creative & Productivity Challenges', desc: 'Sustain creative activities: daily drawing, blog writing, or 1 hour of coding.' },
          ],
          steps: [
            { step: 'Enter your challenge goal and start date', desc: "Input your goal (e.g., 'Memorize 20 words daily') and start date, then choose a theme color." },
            { step: 'Check off each completed day', desc: "Click on a day's cell to stamp it when you complete your goal. Keep tracking until all 30 cells are filled." },
            { step: 'Download PDF or track online', desc: 'Export to PDF and stick it on your wall for offline tracking, or visit the site daily to check online. Data is safely stored in localStorage.' },
          ],
          faqs: [
            { q: 'What if my progress gets deleted?', a: "It's stored in your browser's localStorage, so it's safe unless you clear cookies or cache. We recommend backing up with PDF export just in case." },
            { q: 'Does it work on mobile?', a: 'Yes, it works perfectly on mobile browsers, and you can tap to stamp each day easily.' },
            { q: 'Can I set a different duration instead of 30 days?', a: 'The current version is fixed at 30 days. If you need a shorter or longer period, please leave feedback!' },
            { q: 'Is missing a day considered failure?', a: "Consistency matters more than perfection. If you miss a day or two, don't give up—just restart. Completing 25+ out of 30 days is still an excellent achievement." },
          ],
        }}
      />
    </div>
  );
}
