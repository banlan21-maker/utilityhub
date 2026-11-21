'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Activity } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './sla-uptime-calc.module.css';
import { ui } from '@/app/components/ui';

/* ─── Constants ───────────────────────────────────────────── */

const YEAR_SECONDS = 365.25 * 24 * 3600; // 31,557,600
const QUICK_VALUES = [99, 99.9, 99.99, 99.999];

/* ─── Calculation ─────────────────────────────────────────── */

function calcDowntime(uptime: number) {
  const diff = Number((100 - uptime).toFixed(10));
  const yearSeconds = Number(((diff / 100) * YEAR_SECONDS).toFixed(5));
  const monthSeconds = Number((yearSeconds / 12).toFixed(5));
  const weekSeconds = Number((yearSeconds / 52).toFixed(5));
  const daySeconds = Number((yearSeconds / 365.25).toFixed(5));
  return { yearSeconds, monthSeconds, weekSeconds, daySeconds };
}

const toHours = (sec: number) => (sec / 3600).toFixed(2);
const toMins = (sec: number) => (sec / 60).toFixed(2);
const toSecs = (sec: number) => sec.toFixed(2);

const fmt = (val: string) =>
  Number(val).toLocaleString('ko-KR', { maximumFractionDigits: 2 });

/* ─── Component ───────────────────────────────────────────── */

export default function SlaUptimeCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('SlaUptimeCalc');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [inputVal, setInputVal] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setInputVal('');
      return;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    if (num > 100) { setInputVal('100'); return; }
    if (num < 0) { setInputVal('0'); return; }
    setInputVal(raw);
  };

  const handleQuick = (val: number) => {
    setInputVal(String(val));
  };

  const uptime = inputVal !== '' ? parseFloat(inputVal) : null;
  const hasValue = uptime !== null && !isNaN(uptime);

  const result = useMemo(() => {
    if (!hasValue || uptime === null) return null;
    return calcDowntime(uptime);
  }, [hasValue, uptime]);

  const periods = useMemo(() => {
    const labels = isKo
      ? [{ key: 'year', label: '연간' }, { key: 'month', label: '월간' }, { key: 'week', label: '주간' }, { key: 'day', label: '일간' }]
      : [{ key: 'year', label: 'Yearly' }, { key: 'month', label: 'Monthly' }, { key: 'week', label: 'Weekly' }, { key: 'day', label: 'Daily' }];

    const unitH = isKo ? '시간' : 'hrs';
    const unitM = isKo ? '분' : 'min';
    const unitS = isKo ? '초' : 'sec';

    if (!result) {
      return labels.map(l => ({ ...l, hours: null, mins: null, secs: null, unitH, unitM, unitS }));
    }

    const secValues = [result.yearSeconds, result.monthSeconds, result.weekSeconds, result.daySeconds];
    return labels.map((l, i) => ({
      ...l,
      hours: fmt(toHours(secValues[i])),
      mins: fmt(toMins(secValues[i])),
      secs: fmt(toSecs(secValues[i])),
      unitH, unitM, unitS,
    }));
  }, [result, isKo]);

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Activity />} title={t('title')} subtitle={t('description')} />

      {/* Input Panel */}
      <section className={`${ui.card} ${s.fin_panel}`}>
        <div className={`${ui.field} ${s.inputGroup}`}>
          <label className={ui.label} htmlFor="sla-input">
            {isKo ? 'SLA 가동률 (%)' : 'SLA Uptime (%)'}
          </label>
          <div className={ui.inputGroup}>
            <input
              id="sla-input"
              className={`${ui.input} ${ui.inputLg} ${s.numInput}`}
              type="number"
              step="any"
              placeholder={isKo ? '예: 99.99' : 'e.g. 99.99'}
              value={inputVal}
              onChange={handleChange}
              autoComplete="off"
            />
            <span className={ui.unit}>%</span>
          </div>
        </div>

        <div className={`${ui.chips} ${ui.grow} ${s.quickBtns}`}>
          {QUICK_VALUES.map(v => (
            <button
              key={v}
              className={`${ui.chip} ${inputVal === String(v) ? ui.chipActive : ''}`}
              onClick={() => handleQuick(v)}
              aria-label={`SLA ${v}%`}
            >
              {v}%
            </button>
          ))}
        </div>
      </section>

      {/* Result Grid */}
      <div className={s.resultGrid}>
        {periods.map((p, i) => (
          <div key={p.key} className={`${ui.card} ${i === 0 ? ui.violet : ''} ${s.resultCard}`}>
            <div className={s.cardLabel}>{p.label}</div>
            {p.hours !== null ? (
              <>
                <div className={s.cardHours}>{p.hours}<span className={s.cardUnit}>{p.unitH}</span></div>
                <div className={s.cardMins}>{p.mins}<span className={s.cardUnit}>{p.unitM}</span></div>
                <div className={s.cardSecs}>{p.secs}<span className={s.cardUnit}>{p.unitS}</span></div>
              </>
            ) : (
              <div className={s.emptyVal}>—</div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom 7 Sections */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/performance/sla-uptime-calc" />

      {seo}
    </div>
  );
}
