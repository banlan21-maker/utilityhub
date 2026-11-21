'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Calendar, Download, Palette, RefreshCw, Sparkles, X } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import s from './challenge.module.css';
import { ui } from '@/app/components/ui';

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

export default function ThirtyDayChallengeClient({ seo }: { seo?: React.ReactNode }) {
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
      <ToolHeader
        icon={<Calendar />}
        title={isKorean ? '나만의 30일 챌린지 트래커' : '30 Day Challenge Tracker'}
        subtitle={isKorean ? '새로운 습관을 만드는 30일의 여정을 시작하세요' : 'Track your 30-day journey to build new habits'}
      />

      {/* Main Panel */}
      <div className={`${ui.card} ${s.tool_panel}`}>
        {!isSetup ? (
          <div className={s.setup_form}>
            <div className={ui.field}>
              <label className={`${ui.label} ${s.form_label}`}><Sparkles size={18} />{isKorean ? '챌린지 목표' : 'Challenge Goal'}</label>
              <input type="text" value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)}
                placeholder={isKorean ? '예: 매일 푸시업 30개 하기' : 'e.g., 30 push-ups every day'}
                className={ui.input} maxLength={50} />
            </div>
            <div className={ui.field}>
              <label className={`${ui.label} ${s.form_label}`}><Calendar size={18} />{isKorean ? '시작 날짜' : 'Start Date'}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={ui.input} />
            </div>
            <div className={ui.field}>
              <label className={`${ui.label} ${s.form_label}`}><Palette size={18} />{isKorean ? '테마 컬러' : 'Theme Color'}</label>
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
            <button onClick={handleStartChallenge} className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block} ${s.start_button}`} style={{ background: theme.gradient }}>
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
                  {failedCount > 0 && <span className={`${ui.badge} ${ui.red}`}>❌ {failedCount} {isKorean ? '일 실패' : 'missed'}</span>}
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
              <button onClick={exportToPDF} className={`${ui.button} ${ui.secondary}`} style={{ borderColor: theme.primary, color: theme.primary }}>
                <Download size={18} />{isKorean ? 'PDF 다운로드' : 'Download PDF'}
              </button>
              <button onClick={handleReset} className={`${ui.button} ${ui.secondary}`}>
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
                background: memoDay.checked ? theme.gradient : 'var(--surface-hover)',
                color: memoDay.checked ? '#fff' : 'var(--text-secondary)',
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
            <label className={ui.label}>{isKorean ? '메모 (선택)' : 'Note (optional)'}</label>
            <textarea
              className={ui.input}
              value={memoInput}
              onChange={e => setMemoInput(e.target.value)}
              placeholder={isKorean ? '예: 푸시업 25개 완료, 오늘 힘들었지만 해냄 💪' : 'e.g., Did 25 push-ups, tough day but made it 💪'}
              maxLength={80}
              rows={3}
              autoFocus
            />
            <p className={s.modal_char}>{memoInput.length}/80</p>

            <div className={s.modal_actions}>
              <button className={`${ui.button} ${ui.primary}`} style={{ background: theme.gradient }} onClick={() => saveMemo()}>
                {isKorean ? '저장' : 'Save'}
              </button>
              <button className={`${ui.button} ${ui.secondary}`} onClick={() => setMemoModal(null)}>
                {isKorean ? '취소' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareBar title={isKorean ? '📅 30일 챌린지 트래커' : '📅 30 Day Challenge Tracker'} description={isKorean ? '새로운 습관을 만드는 30일의 여정' : 'Build new habits in 30 days'} />
      <RelatedTools toolId="utilities/lifestyle/30day-challenge" />

      {seo}
    </div>
  );
}
