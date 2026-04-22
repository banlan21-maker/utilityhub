'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Calendar, Download, Palette, RefreshCw, Sparkles, X } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  { name: 'Mint',   primary: '#10b981', light: '#ecfdf5', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { name: 'Pink',   primary: '#ec4899', light: '#fdf2f8', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
  { name: 'Sky',    primary: '#3b82f6', light: '#eff6ff', gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' },
  { name: 'Gray',   primary: '#6b7280', light: '#f9fafb', gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)' },
];

interface DayEntry { checked: boolean; memo: string; }

interface ChallengeData {
  title: string;
  startDate: string;
  theme: number;
  days: DayEntry[];
  // legacy
  stamps?: boolean[];
}

const emptyDays = (): DayEntry[] => Array(30).fill(null).map(() => ({ checked: false, memo: '' }));

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayDate(startDate: string, idx: number): Date {
  const d = new Date(startDate + 'T00:00:00');
  d.setDate(d.getDate() + idx);
  return d;
}

function isFailed(startDate: string, idx: number, day: DayEntry): boolean {
  if (day.checked || !startDate) return false;
  return getDayDate(startDate, idx) < getToday();
}

export default function ThirtyDayChallengeClient() {
  const t = useTranslations('30DayChallenge');
  const locale = useLocale();
  const isKorean = locale === 'ko';

  const [challengeTitle, setChallengeTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [days, setDays] = useState<DayEntry[]>(emptyDays());
  const [isSetup, setIsSetup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Memo modal
  const [memoModal, setMemoModal] = useState<{ idx: number } | null>(null);
  const [memoInput, setMemoInput] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('30day-challenge');
    if (saved) {
      try {
        const data: ChallengeData = JSON.parse(saved);
        setChallengeTitle(data.title);
        setStartDate(data.startDate);
        setSelectedTheme(data.theme);
        // migrate legacy stamps array
        if (data.days) {
          setDays(data.days);
        } else if (data.stamps) {
          setDays(data.stamps.map(s => ({ checked: s, memo: '' })));
        }
        setIsSetup(true);
      } catch (e) {
        console.error('Failed to load challenge data:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isSetup) {
      const data: ChallengeData = { title: challengeTitle, startDate, theme: selectedTheme, days };
      localStorage.setItem('30day-challenge', JSON.stringify(data));
    }
  }, [challengeTitle, startDate, selectedTheme, days, isSetup]);

  // Confetti on 30/30
  useEffect(() => {
    const completed = days.filter(d => d.checked).length;
    if (completed === 30 && !showConfetti) {
      setShowConfetti(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: [THEMES[selectedTheme].primary] });
      setTimeout(() => confetti({ particleCount: 150, angle: 60, spread: 80, origin: { x: 0 } }), 200);
      setTimeout(() => confetti({ particleCount: 150, angle: 120, spread: 80, origin: { x: 1 } }), 400);
    }
  }, [days, showConfetti, selectedTheme]);

  const handleStartChallenge = () => {
    if (!challengeTitle.trim() || !startDate) {
      alert(isKorean ? '챌린지 제목과 시작 날짜를 입력해주세요!' : 'Please enter challenge title and start date!');
      return;
    }
    setIsSetup(true);
    setDays(emptyDays());
    setShowConfetti(false);
  };

  const handleReset = () => {
    if (confirm(isKorean ? '챌린지를 초기화하시겠습니까?' : 'Reset your challenge?')) {
      setIsSetup(false);
      setChallengeTitle('');
      setStartDate('');
      setDays(emptyDays());
      setShowConfetti(false);
      localStorage.removeItem('30day-challenge');
    }
  };

  // Open memo modal
  const openMemo = (idx: number) => {
    setMemoInput(days[idx].memo);
    setMemoModal({ idx });
  };

  // Save memo + toggle from modal
  const saveMemo = (toggleCheck?: boolean) => {
    if (!memoModal) return;
    const { idx } = memoModal;
    setDays(prev => {
      const next = [...prev];
      next[idx] = {
        checked: toggleCheck !== undefined ? toggleCheck : next[idx].checked,
        memo: memoInput.trim(),
      };
      return next;
    });
    setMemoModal(null);
  };

  // Quick toggle (click check area only)
  const toggleCheck = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDays(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], checked: !next[idx].checked };
      return next;
    });
  };

  const completedCount = days.filter(d => d.checked).length;
  const failedCount = startDate ? days.filter((d, i) => isFailed(startDate, i, d)).length : 0;
  const progressPercent = Math.round((completedCount / 30) * 100);
  const theme = THEMES[selectedTheme];

  const exportToPDF = async () => {
    const exportElement = document.createElement('div');
    exportElement.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 794px; padding: 40px; background: white; font-family: "Inter", sans-serif;';
    exportElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: 800; color: ${theme.primary}; margin: 0 0 10px 0;">${challengeTitle || '30 Day Challenge'}</h1>
        <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">${isKorean ? '시작일' : 'Start'}: ${startDate}</p>
        <p style="font-size: 16px; color: #1e293b; font-weight: 600; margin: 10px 0;">${isKorean ? '진행률' : 'Progress'}: ${completedCount}/30 (${progressPercent}%)</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; max-width: 600px; margin: 0 auto;">
        ${days.map((day, idx) => {
          const failed = isFailed(startDate, idx, day);
          const bg = day.checked ? theme.primary : failed ? '#fee2e2' : '#f9fafb';
          const border = day.checked ? theme.primary : failed ? '#fca5a5' : '#e5e7eb';
          return `
          <div style="border:2px solid ${border};border-radius:8px;background:${bg};padding:6px;min-height:64px;position:relative;">
            <span style="font-size:10px;font-weight:700;color:${day.checked?'#fff':failed?'#ef4444':'#6b7280'};position:absolute;top:3px;left:5px;">${idx+1}</span>
            <div style="display:flex;align-items:center;justify-content:center;height:36px;margin-top:8px;">
              ${day.checked ? `<span style="font-size:22px;color:white;font-weight:800;">✓</span>` : failed ? `<span style="font-size:20px;">❌</span>` : ''}
            </div>
            ${day.memo ? `<div style="font-size:8px;color:${day.checked?'rgba(255,255,255,0.85)':'#475569'};margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${day.memo}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af;">
        Start your challenge at theutilhub.com
      </div>
    `;
    document.body.appendChild(exportElement);
    try {
      const canvas = await html2canvas(exportElement, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      pdf.addImage(imgData, 'PNG', (pdfWidth - canvas.width * ratio) / 2, 10, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`${challengeTitle || '30day-challenge'}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(isKorean ? 'PDF 생성 중 오류가 발생했습니다.' : 'Failed to generate PDF.');
    } finally {
      document.body.removeChild(exportElement);
    }
  };

  const memoDay = memoModal !== null ? days[memoModal.idx] : null;

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
        }}>
          <Calendar size={40} color={theme.primary} />
        </div>
        <h1 className={s.page_title} style={{ color: theme.primary }}>
          {isKorean ? '나만의 30일 챌린지 트래커' : '30 Day Challenge Tracker'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isKorean ? '새로운 습관을 만드는 30일의 여정을 시작하세요' : 'Track your 30-day journey to build new habits'}
        </p>
      </header>

      {/* Main Panel */}
      <div className={s.tool_panel}>
        {!isSetup ? (
          <div className={s.setup_form}>
            <div className={s.form_group}>
              <label className={s.form_label}><Sparkles size={18} />{isKorean ? '챌린지 목표' : 'Challenge Goal'}</label>
              <input type="text" value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)}
                placeholder={isKorean ? '예: 매일 푸시업 30개 하기' : 'e.g., 30 push-ups every day'}
                className={s.input} maxLength={50} />
            </div>
            <div className={s.form_group}>
              <label className={s.form_label}><Calendar size={18} />{isKorean ? '시작 날짜' : 'Start Date'}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={s.input} />
            </div>
            <div className={s.form_group}>
              <label className={s.form_label}><Palette size={18} />{isKorean ? '테마 컬러' : 'Theme Color'}</label>
              <div className={s.theme_grid}>
                {THEMES.map((th, idx) => (
                  <button key={idx} onClick={() => setSelectedTheme(idx)}
                    className={`${s.theme_button} ${selectedTheme === idx ? s.theme_button_active : ''}`}
                    style={{ background: th.gradient, transform: selectedTheme === idx ? 'scale(1.1)' : 'scale(1)' }}
                    title={th.name}
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
          <div className={s.tracker}>
            {/* Challenge header */}
            <div className={s.challenge_header}>
              <h2 className={s.challenge_title} style={{ color: theme.primary }}>{challengeTitle}</h2>
              <p className={s.challenge_date}>{isKorean ? '시작일' : 'Started'}: {startDate}</p>
            </div>

            {/* Progress */}
            <div className={s.progress_section}>
              <div className={s.progress_info}>
                <span className={s.progress_text}>
                  ✅ {completedCount}/30 {isKorean ? '일 완료' : 'days done'}
                  {failedCount > 0 && <span className={s.fail_badge}>❌ {failedCount} {isKorean ? '일 실패' : 'missed'}</span>}
                </span>
                <span className={s.progress_percent} style={{ color: theme.primary }}>{progressPercent}%</span>
              </div>
              <div className={s.progress_bar_bg}>
                <div className={s.progress_bar_fill} style={{ width: `${progressPercent}%`, background: theme.gradient }} />
              </div>
              <p className={s.grid_hint}>
                {isKorean ? '💡 날짜를 클릭하면 체크 & 메모를 남길 수 있어요' : '💡 Click any day to check it off & add a note'}
              </p>
            </div>

            {/* 30-Day Grid */}
            <div className={s.grid}>
              {days.map((day, idx) => {
                const failed = isFailed(startDate, idx, day);
                return (
                  <button
                    key={idx}
                    onClick={() => openMemo(idx)}
                    className={`${s.cell} ${day.checked ? s.cell_checked : ''} ${failed ? s.cell_failed : ''}`}
                    style={{
                      background: day.checked ? theme.gradient : failed ? '#fee2e2' : theme.light,
                      borderColor: day.checked ? theme.primary : failed ? '#fca5a5' : '#e5e7eb',
                    }}
                    aria-label={`Day ${idx + 1}`}
                  >
                    {/* Top: number + icon */}
                    <div className={s.cell_top}>
                      <span className={s.cell_number} style={{ color: day.checked ? '#fff' : failed ? '#ef4444' : '#6b7280' }}>
                        {idx + 1}
                      </span>
                      <span className={s.cell_icon}>
                        {day.checked ? <span className={s.cell_stamp}>✓</span> : failed ? <span className={s.cell_fail_icon}>✕</span> : null}
                      </span>
                    </div>
                    {/* Bottom: memo preview */}
                    {day.memo && (
                      <div className={s.cell_memo} style={{ color: day.checked ? 'rgba(255,255,255,0.85)' : '#475569' }}>
                        {day.memo}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className={s.action_buttons}>
              <button onClick={exportToPDF} className={s.action_button} style={{ borderColor: theme.primary, color: theme.primary }}>
                <Download size={18} />{isKorean ? 'PDF 다운로드' : 'Download PDF'}
              </button>
              <button onClick={handleReset} className={s.action_button}>
                <RefreshCw size={18} />{isKorean ? '챌린지 초기화' : 'Reset Challenge'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Memo Modal ── */}
      {memoModal !== null && memoDay !== null && (
        <div className={s.modal_overlay} onClick={() => setMemoModal(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modal_header} style={{ borderColor: theme.primary }}>
              <span className={s.modal_title} style={{ color: theme.primary }}>
                {isKorean ? `${memoModal.idx + 1}일차` : `Day ${memoModal.idx + 1}`}
                {startDate && (
                  <span className={s.modal_date}>
                    &nbsp;{getDayDate(startDate, memoModal.idx).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </span>
              <button className={s.modal_close} onClick={() => setMemoModal(null)} aria-label="Close"><X size={20} /></button>
            </div>

            {/* Check toggle */}
            <button
              className={s.modal_check_btn}
              style={{
                background: memoDay.checked ? theme.gradient : '#f1f5f9',
                color: memoDay.checked ? '#fff' : '#475569',
              }}
              onClick={() => {
                setDays(prev => {
                  const next = [...prev];
                  next[memoModal.idx] = { ...next[memoModal.idx], checked: !next[memoModal.idx].checked };
                  return next;
                });
              }}
            >
              {memoDay.checked
                ? (isKorean ? '✅ 완료됨 (클릭해서 취소)' : '✅ Done (tap to undo)')
                : (isKorean ? '○ 미완료 (클릭해서 완료 체크)' : '○ Not done (tap to complete)')}
            </button>

            {/* Memo input */}
            <label className={s.modal_label}>{isKorean ? '메모 (선택)' : 'Note (optional)'}</label>
            <textarea
              className={s.modal_textarea}
              value={memoInput}
              onChange={e => setMemoInput(e.target.value)}
              placeholder={isKorean ? '예: 푸시업 25개 완료, 오늘 힘들었지만 해냄 💪' : 'e.g., Did 25 push-ups, tough day but made it 💪'}
              maxLength={80}
              rows={3}
              autoFocus
            />
            <p className={s.modal_char}>{memoInput.length}/80</p>

            <div className={s.modal_actions}>
              <button className={s.modal_save} style={{ background: theme.gradient }} onClick={() => saveMemo()}>
                {isKorean ? '저장' : 'Save'}
              </button>
              <button className={s.modal_cancel} onClick={() => setMemoModal(null)}>
                {isKorean ? '취소' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareBar title={isKorean ? '📅 30일 챌린지 트래커' : '📅 30 Day Challenge Tracker'} description={isKorean ? '새로운 습관을 만드는 30일의 여정' : 'Build new habits in 30 days'} />
      <RelatedTools toolId="utilities/lifestyle/30day-challenge" limit={3} />
      <div className={s.ad_placeholder}>{isKorean ? '광고 영역' : 'Ad Space'}</div>

      <SeoSection
        ko={{
          title: "30일 챌린지 트래커란 무엇인가요?",
          description: "30일 챌린지는 새로운 습관을 형성하거나 목표를 달성하기 위해 30일 동안 매일 특정 행동을 반복하는 자기 계발 방법입니다. 연구에 따르면 새로운 습관이 자동화되려면 평균 21~66일이 걸리며, 30일은 습관 형성의 핵심 기간입니다. 이 온라인 트래커는 브라우저 localStorage를 활용하여 30일간의 진행 상황을 안전하게 보관하며, 각 날짜에 메모를 남기고 PDF로 출력할 수 있습니다. 운동, 독서, 명상, 영어 공부 등 어떤 목표든 시각적으로 추적하며 성취감을 느낄 수 있습니다.",
          useCases: [
            { icon: '💪', title: '헬스 & 운동 챌린지', desc: '스쿼트 100개, 플랭크 1분, 물 2L 마시기 등 건강 목표를 30일간 기록하고 메모로 당일 실제 수행 내용을 남겨 진행 상황을 확인하세요.' },
            { icon: '📚', title: '독서 & 학습 챌린지', desc: '매일 책 20페이지 읽기, 영단어 30개 암기, 강의 1개 수강 등 꾸준한 학습 습관을 만들고 배운 핵심 내용을 메모로 기록하세요.' },
            { icon: '🧘', title: '멘탈 관리 챌린지', desc: '명상 10분, 감사 일기 쓰기, 디지털 디톡스 등 정신 건강을 위한 루틴을 정착시키고 그날의 느낌이나 감사한 점을 메모로 남겨보세요.' },
            { icon: '🎨', title: '창작 & 생산성 챌린지', desc: '매일 그림 그리기, 블로그 글쓰기, 코딩 1시간 등 창작 활동을 꾸준히 이어가고 당일 완성한 작업이나 아이디어를 메모로 기록하세요.' },
          ],
          steps: [
            { step: '챌린지 목표와 시작 날짜 입력', desc: "나만의 목표(예: '매일 푸시업 30개 하기')와 시작 날짜를 입력하고 원하는 테마 컬러를 선택한 뒤 시작하기 버튼을 누릅니다." },
            { step: '날짜 클릭 → 체크 & 메모', desc: '목표를 달성한 날 해당 날짜 칸을 클릭하면 완료 체크와 간단한 메모(최대 80자)를 남길 수 있습니다. 셀 하단에 메모 미리보기가 표시됩니다.' },
            { step: '실패 날짜 자동 표시', desc: '시작일 이후 지난 날짜 중 체크하지 않은 날은 자동으로 빨간색 ✕ 실패 표시가 나타납니다. 현재 날짜 이후는 표시되지 않습니다.' },
            { step: 'PDF 출력으로 백업', desc: 'PDF 다운로드 버튼을 눌러 지금까지의 진행 상황(완료·실패 표시 및 메모 포함)을 PDF로 저장하여 오프라인 기록으로 보관할 수 있습니다.' },
          ],
          faqs: [
            { q: '기록이 사라지면 어떡하나요?', a: '브라우저의 localStorage에 저장되므로 쿠키나 캐시를 삭제하지 않는 한 안전하게 보관됩니다. 만약을 대비해 주기적으로 PDF로 백업하는 것을 추천합니다.' },
            { q: '실패 표시는 어떻게 작동하나요?', a: '시작일부터 오늘 이전까지의 날짜 중 체크하지 않은 날은 자동으로 빨간색 ✕ 실패 표시가 나타납니다. 오늘 날짜나 미래 날짜는 아직 실패로 표시되지 않습니다. 뒤늦게 체크하면 실패 표시가 사라집니다.' },
            { q: '메모는 얼마나 길게 쓸 수 있나요?', a: '메모는 최대 80자까지 입력할 수 있습니다. 셀 하단에는 메모 내용이 미리보기로 표시되며, PDF 출력 시에도 메모가 포함됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 기록은 참고용으로만 제공됩니다. 정확한 습관 형성 기간이나 효과는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is a 30-Day Challenge Tracker?",
          description: "A 30-day challenge is a personal development method where you repeat a specific action daily for 30 days to build a new habit or achieve a goal. Research shows that it takes an average of 21 to 66 days for a new habit to become automatic. This online tracker stores your 30-day progress in browser localStorage and lets you add a daily memo note to each day. Days you miss after the start date are automatically marked with a red ✕ failure indicator. Export to PDF including all check marks, failure marks, and memos at any time.",
          useCases: [
            { icon: '💪', title: 'Fitness & Exercise Challenges', desc: 'Track 30 days of push-ups, squats, or daily water intake. Leave a memo note recording exactly how many reps you completed each day to monitor your progress.' },
            { icon: '📚', title: 'Reading & Learning Challenges', desc: 'Build consistent learning habits by checking off daily reading or study sessions. Use the memo to jot down key vocabulary or page numbers to reinforce memory.' },
            { icon: '🧘', title: 'Mental Wellness Challenges', desc: 'Establish routines for mental health: meditation, gratitude journaling, or digital detox. Record how you felt each day in the memo to reflect on your journey.' },
            { icon: '🎨', title: 'Creative & Productivity Challenges', desc: 'Sustain creative activities like daily drawing or coding. Use memo notes to describe what you created or learned, building a meaningful 30-day portfolio.' },
          ],
          steps: [
            { step: 'Enter your challenge goal and start date', desc: "Type your goal (e.g., '30 push-ups every day') and start date, choose a theme color, then tap Start Challenge to begin your tracker." },
            { step: 'Click a day to check it off and add a note', desc: "Tap any day cell to open the day panel. Toggle the completion check and optionally add a short memo (up to 80 characters). The memo preview appears at the bottom of the cell." },
            { step: 'Missed days are automatically marked as failures', desc: 'Any day after your start date that has passed without being checked automatically turns red with a ✕ failure mark. Checking it later removes the failure marker.' },
            { step: 'Download PDF to save your progress', desc: 'Use the PDF Download button to export your full 30-day tracker including completed days, failure marks, and memo notes as a PDF file for offline records.' },
          ],
          faqs: [
            { q: 'What if my progress gets deleted?', a: "Data is saved in your browser's localStorage and persists unless you clear cache or cookies. We recommend regular PDF backups to avoid data loss." },
            { q: 'How does the failure marking work?', a: 'Any day between your start date and yesterday that has not been checked is automatically shown with a red ✕ failure indicator. Today and future dates are not marked as failures yet. Checking a missed day retroactively removes the failure mark.' },
            { q: 'How long can my memo notes be?', a: 'Memo notes can be up to 80 characters. A preview appears at the bottom of each cell, and memos are included when you export to PDF.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. For accurate information on habit formation timelines or health goals, please consult a professional or official source.' },
          ],
        }}
      />
    </div>
  );
}
