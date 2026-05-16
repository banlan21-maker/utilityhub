'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarDays, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';

// ── Date helpers ─────────────────────────────────────────────────────────
// `<input type="date">`는 "YYYY-MM-DD" 문자열을 주는데, `new Date(str)`는
// 이를 UTC 자정으로 파싱하므로 KST 환경에서 9시간 어긋남.
// 항상 로컬 자정으로 파싱한다.
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

function todayLocal(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function formatLocalDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 월 더하기 — 월말 보호 (Jan 31 + 1 month → Feb 28/29, not Mar 2/3)
function addMonthsSafe(base: Date, months: number): Date {
  const result = new Date(base.getTime());
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  // 새 달의 마지막 날
  const lastDayOfNewMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDayOfNewMonth));
  return result;
}

export default function DdayCalcClient() {
  const t = useTranslations('DDay');
  const locale = useLocale();

  const [isMounted, setIsMounted] = useState(false);
  const [targetDate, setTargetDate] = useState<string>('');
  const [addDays, setAddDays] = useState<string>('');
  const [addMonths, setAddMonths] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // SSR/CSR hydration mismatch 방지 — 마운트 후에만 today를 초기화
  useEffect(() => {
    setTargetDate(formatLocalDateInput(todayLocal()));
    setIsMounted(true);
  }, []);

  // ── D-Day 메인 결과 (자정 기준 일관) ───────────────────────────────
  const ddayData = useMemo(() => {
    if (!targetDate) return null;
    const target = parseLocalDate(targetDate);
    const today = todayLocal();
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / 86400000); // 자정-자정이라 정수, round로 DST 보정

    const label =
      diffDays === 0 ? t('today') : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;

    // 상세 — 자정 기준 통일
    const absDays = Math.abs(diffDays);
    const totalWeeks = Math.floor(absDays / 7);
    const daysRemainder = absDays % 7;
    const totalHours = absDays * 24;

    // 개월 — 자정 기준 (today, target 모두 자정)
    let m = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    if (target.getDate() < today.getDate() && m > 0) m--;
    if (target.getDate() > today.getDate() && m < 0) m++;

    return {
      diffDays,
      label,
      isToday: diffDays === 0,
      months: Math.abs(m),
      weeks: totalWeeks,
      daysRemainder,
      hours: totalHours,
    };
  }, [targetDate, t]);

  // ── 날짜 더하기/빼기 결과 ───────────────────────────────────────────
  const calcResult = useMemo(() => {
    if (!targetDate) return '';
    let base = parseLocalDate(targetDate);
    if (isNaN(base.getTime())) return '';

    const daysNum = addDays.trim() === '' ? 0 : parseInt(addDays, 10);
    const monthsNum = addMonths.trim() === '' ? 0 : parseInt(addMonths, 10);
    if (isNaN(daysNum) || isNaN(monthsNum)) return '';

    if (monthsNum !== 0) base = addMonthsSafe(base, monthsNum);
    if (daysNum !== 0) {
      const tmp = new Date(base.getTime());
      tmp.setDate(tmp.getDate() + daysNum);
      base = tmp;
    }

    return base.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, [targetDate, addDays, addMonths, locale]);

  // ── 결과 복사 ───────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (!ddayData) return;
    const isKo = locale === 'ko';
    const lines = [
      t('title'),
      `${t('targetDateLabel')}: ${targetDate}`,
      `${t('dDayResult')}: ${ddayData.label}`,
    ];
    if (!ddayData.isToday) {
      lines.push(`${t('months')}: ${ddayData.months}`);
      lines.push(`${t('weeks')}: ${ddayData.weeks}${ddayData.daysRemainder > 0 ? ` + ${ddayData.daysRemainder}d` : ''}`);
      lines.push(`${t('hours')}: ${ddayData.hours.toLocaleString(isKo ? 'ko-KR' : 'en-US')}`);
    }
    if (calcResult) {
      lines.push(`${t('result')}: ${calcResult}`);
    }
    try {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [ddayData, targetDate, calcResult, t, locale]);

  // SSR mismatch 방지
  if (!isMounted) return null;

  return (
    <div>
      <NavigationActions />
      <header style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
          }}
        >
          <CalendarDays size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {/* Main D-Day Section */}
        <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
          {/* 날짜 입력 (위) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <label style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('targetDateLabel')}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              aria-label={t('targetDateLabel')}
              style={{
                padding: '0.85rem 1rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '0.85rem',
                border: '2px solid var(--border)',
                outline: 'none',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                width: '100%',
                maxWidth: '280px',
                textAlign: 'center',
              }}
            />
          </div>

          {/* 결과 카드 (아래) */}
          {ddayData && (
            <div
              style={{
                padding: '2rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(139,92,246,0.02) 100%)',
                borderRadius: '1.25rem',
                border: '1px solid rgba(139,92,246,0.15)',
                textAlign: 'center',
                width: '100%',
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {t('dDayResult')}
              </p>
              <p
                style={{
                  fontSize: '4.5rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  margin: 0,
                  letterSpacing: '-3px',
                  lineHeight: 1,
                }}
              >
                {ddayData.label}
              </p>
              {ddayData.isToday && (
                <p style={{ color: '#10b981', fontWeight: 700, marginTop: '0.75rem', fontSize: '0.95rem' }}>
                  {t('isToday')}
                </p>
              )}

              {!ddayData.isToday && (
                <>
                  <div
                    style={{
                      marginTop: '1.75rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px dashed rgba(139,92,246,0.25)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>{t('months')}</p>
                      <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{ddayData.months}</p>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(139,92,246,0.15)', borderRight: '1px solid rgba(139,92,246,0.15)' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>{t('weeks')}</p>
                      <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {ddayData.weeks}
                        {ddayData.daysRemainder > 0 && (
                          <span style={{ fontSize: '0.85rem', fontWeight: 500, marginLeft: '2px', color: 'var(--text-muted)' }}>
                            {` +${ddayData.daysRemainder}d`}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>{t('hours')}</p>
                      <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {ddayData.hours.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <p style={{ marginTop: '0.85rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {t('stats_note')}
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={handleCopy}
                aria-label={t('copy_button')}
                style={{
                  marginTop: '1.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '2rem',
                  border: `1px solid ${copied ? '#10b981' : 'rgba(139,92,246,0.3)'}`,
                  background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.6)',
                  color: copied ? '#10b981' : 'var(--primary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t('copy_done') : t('copy_button')}
              </button>
            </div>
          )}
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
                inputMode="numeric"
                value={addDays}
                onChange={(e) => setAddDays(e.target.value)}
                placeholder={t('placeholderDays')}
                className="glass-panel"
                aria-label={t('addDays')}
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('addMonths')}</label>
              <input
                type="number"
                inputMode="numeric"
                value={addMonths}
                onChange={(e) => setAddMonths(e.target.value)}
                placeholder="0"
                className="glass-panel"
                aria-label={t('addMonths')}
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('result')}
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {calcResult || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/dday-calc" />

      {/* 광고 영역 */}
      <div
        style={{
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
          margin: '2rem 0',
        }}
      >
        AD
      </div>

      <SeoSection
        ko={{
          title: 'D-Day & 날짜 계산기란 무엇인가요?',
          description:
            'D-Day 계산기는 특정 목표일까지 남은 날짜를 하루도 빠짐없이 정확하게 계산해주는 온라인 도구입니다. 수능·공무원 시험·결혼식·여행·프로젝트 마감일 등 중요한 날까지 몇 일이 남았는지 한눈에 파악할 수 있습니다. 또한 날짜 더하기/빼기 기능을 통해 계약 만료일, 수습 기간 종료일, 납기일 계산 등 업무에 필요한 날짜 산술도 간편하게 처리합니다. 모든 계산은 사용자의 로컬 자정 기준이라 타임존 오차 없이 동작하며, 월 더하기 시 월말이 보호되어 "1월 31일 + 1개월"이 "2월 28일/29일"로 정확히 계산됩니다.',
          useCases: [
            { icon: '📚', title: '시험 준비 D-Day 관리', desc: '수능, 토익, 공무원 시험 등 목표 시험일까지 남은 일수를 확인해 학습 계획을 세우고 동기를 유지합니다.' },
            { icon: '💍', title: '결혼 & 기념일 카운트다운', desc: '결혼식 D-day, 100일·1주년 기념일 등 소중한 날까지 남은 날을 계산하고 준비 일정을 역산합니다.' },
            { icon: '💼', title: '프로젝트 & 계약 관리', desc: '계약 만료일, 프로젝트 납기일, 수습 기간 종료일 등 업무상 중요한 날짜를 정확히 계산해 일정을 관리합니다.' },
            { icon: '✈️', title: '여행 & 이벤트 준비', desc: '해외여행 출발일, 콘서트·페스티벌 날짜까지 D-day를 설정해두고 준비물·예약 일정을 단계적으로 챙깁니다.' },
          ],
          steps: [
            { step: '목표 날짜 선택', desc: '달력 입력창에서 D-Day로 지정할 날짜를 선택합니다. 오늘 이전 날짜를 선택하면 "D+경과일"로 표시됩니다.' },
            { step: 'D-Day 결과 확인', desc: '선택 즉시 오늘로부터 며칠 남았는지(또는 며칠이 지났는지) 자동으로 계산되며, 상세 통계(개월/주/시간)도 함께 표시됩니다.' },
            { step: '날짜 더하기/빼기 활용', desc: '기준 날짜에 일수나 개월 수를 더하거나 빼서 정확한 결과 날짜를 계산합니다. 음수를 입력하면 과거로 거슬러 갑니다. 월말 보호로 "1월 31일 + 1개월"은 "2월 말일"로 정확히 계산됩니다.' },
            { step: '결과 활용 & 공유', desc: '계산된 D-Day 결과를 "결과 복사" 버튼으로 클립보드에 저장하거나 SNS 공유 버튼으로 친구에게 전달하세요.' },
          ],
          faqs: [
            { q: 'D-Day 계산 시 오늘 날짜도 포함되나요?', a: '오늘이 목표일이면 "D-Day"로 표시되고 내일은 D-1, 모레는 D-2로 계산됩니다. 한국 시간 자정(00:00)을 기준으로 하므로 KST 사용자에게 타임존 오차가 발생하지 않습니다.' },
            { q: '월 더하기 시 1월 31일 + 1개월은 어떻게 계산되나요?', a: '본 계산기는 월말 보호 로직을 적용하여 "1월 31일 + 1개월"을 "2월 28일(평년) 또는 2월 29일(윤년)"로 정확히 계산합니다. 자동 보정으로 3월로 넘어가지 않습니다. 계약 만기일/수습 기간 종료일 계산에서도 안심하고 사용할 수 있습니다.' },
            { q: '상세 통계의 개월/주/시간은 합산해도 되나요?', a: '안 됩니다. 각각은 동일한 D-day를 다른 단위로 환산한 독립적인 값입니다. 예를 들어 D-100이면 "약 3개월", "14주 + 2일", "2,400시간"이며 모두 동일한 기간을 의미합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로 제공됩니다. 법적 효력이 있는 날짜(계약 만기일, 법정 기한 등)는 반드시 공식 캘린더와 대조하거나 전문가와 상의하세요.' },
          ],
        }}
        en={{
          title: 'What is a D-Day & Date Calculator?',
          description:
            'A D-Day calculator tells you exactly how many days remain until an important target date — or how many days have passed since one. It is perfect for tracking exam prep countdowns, wedding dates, travel departures, and project deadlines. The date arithmetic feature handles contract expiration dates, probation period endings, and due date calculations with precision. All calculations use local midnight as reference (no timezone drift) and the month-add operation is end-of-month safe — so "Jan 31 + 1 month" correctly returns "Feb 28/29", not "Mar 2/3".',
          useCases: [
            { icon: '📚', title: 'Exam Preparation Countdown', desc: 'Track days remaining until major exams or certifications to stay motivated and structure your study plan.' },
            { icon: '💍', title: 'Anniversaries & Special Events', desc: 'Count down to weddings, 100-day milestones, anniversaries, and other special occasions.' },
            { icon: '💼', title: 'Project & Contract Deadlines', desc: 'Calculate contract expiration dates, project due dates, and probation period end dates for accurate schedule management.' },
            { icon: '✈️', title: 'Travel & Event Preparation', desc: 'Set a D-day for your trip departure or concert date and use the countdown to prepare step-by-step.' },
          ],
          steps: [
            { step: 'Select your target date', desc: 'Pick a date from the calendar input. Selecting a past date will show elapsed days as "D+N" instead of a countdown.' },
            { step: 'View your D-Day result', desc: 'Days remaining (or elapsed) are calculated instantly, displayed as a large D-number with month/week/hour breakdowns.' },
            { step: 'Use date arithmetic', desc: 'Add or subtract days and months from the base date. Negative numbers go into the past. Month-add is end-of-month safe: "Jan 31 + 1 month" returns "Feb 28/29".' },
            { step: 'Copy & share', desc: 'Click "Copy Result" to save the full breakdown to your clipboard, or use the share buttons to send your D-Day to friends.' },
          ],
          faqs: [
            { q: 'Is today included in the D-Day count?', a: 'If today is the target date, the result shows "D-Day"; tomorrow is D-1 and the day after is D-2. The calculator uses your local midnight as reference, so there is no timezone drift for KST or any other zone.' },
            { q: 'How does "Jan 31 + 1 month" work?', a: 'This calculator applies end-of-month protection — "Jan 31 + 1 month" correctly returns "Feb 28" in regular years or "Feb 29" in leap years, not "Mar 2/3" as JavaScript would do by default. This makes it safe for contract expiration and probation end calculations.' },
            { q: 'Can I sum the months/weeks/hours stats?', a: 'No. Each stat is an independent conversion of the same D-Day into a different unit. For example, D-100 = "about 3 months" = "14 weeks + 2 days" = "2,400 hours" — all describing the same period.' },
            { q: 'Can I use this result as official data?', a: 'Results are provided for reference only. For legally binding dates (contract expirations, statutory deadlines), always cross-check with official calendars or consult a professional.' },
          ],
        }}
      />
    </div>
  );
}
