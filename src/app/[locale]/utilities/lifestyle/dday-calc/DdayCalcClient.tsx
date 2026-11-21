'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarDays, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';

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

export default function DdayCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('DDay');
  const locale = useLocale();

  const [targetDate, setTargetDate] = useState<string>('');
  const [addDays, setAddDays] = useState<string>('');
  const [addMonths, setAddMonths] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // SSR/CSR hydration mismatch 방지 — 마운트 후에만 today를 초기화
  useEffect(() => {
    setTargetDate(formatLocalDateInput(todayLocal()));
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

  return (
    <div>
      <NavigationActions />
      <ToolHeader icon={<CalendarDays />} title={t('title')} subtitle={t('description')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 'var(--tool-width-narrow)', margin: '0 auto', width: '100%' }}>
        {/* Main D-Day Section */}
        <div className={ui.card}>
          {/* 날짜 입력 (위) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <label className={ui.label}>
              {t('targetDateLabel')}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              aria-label={t('targetDateLabel')}
              className={`${ui.input} ${ui.inputLg}`}
              style={{ maxWidth: '280px', textAlign: 'center' }}
            />
          </div>

          {/* 결과 카드 (아래) */}
          {ddayData && (
            <div className={ui.result} style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {t('dDayResult')}
              </p>
              <p
                style={{
                  fontSize: '4.5rem',
                  fontWeight: 900,
                  color: 'var(--color-primary)',
                  margin: 0,
                  letterSpacing: '-3px',
                  lineHeight: 1,
                }}
              >
                {ddayData.label}
              </p>
              {ddayData.isToday && (
                <p style={{ color: 'var(--tint-green-fg)', fontWeight: 700, marginTop: '0.75rem', fontSize: '0.95rem' }}>
                  {t('isToday')}
                </p>
              )}

              {!ddayData.isToday && (
                <>
                  <div
                    style={{
                      marginTop: '1.75rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px dashed var(--tint-violet-border)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>{t('months')}</p>
                      <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{ddayData.months}</p>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--tint-violet-border)', borderRight: '1px solid var(--tint-violet-border)' }}>
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
                className={`${ui.button} ${ui.secondary} ${ui.sm}`}
                style={{ marginTop: '1.5rem' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t('copy_done') : t('copy_button')}
              </button>
            </div>
          )}
        </div>

        {/* Date Arithmetic Section */}
        <div className={ui.card}>
          <h2 className={ui.cardTitle}>
            {t('dateAddTitle')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className={ui.field}>
              <label className={ui.label}>{t('addDays')}</label>
              <input
                type="number"
                inputMode="numeric"
                value={addDays}
                onChange={(e) => setAddDays(e.target.value)}
                placeholder={t('placeholderDays')}
                className={ui.input}
                aria-label={t('addDays')}
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label}>{t('addMonths')}</label>
              <input
                type="number"
                inputMode="numeric"
                value={addMonths}
                onChange={(e) => setAddMonths(e.target.value)}
                placeholder="0"
                className={ui.input}
                aria-label={t('addMonths')}
              />
            </div>
          </div>

          <div className={ui.result} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
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


      {seo}
    </div>
  );
}
