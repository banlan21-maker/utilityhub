'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Percent,
  TrendingUp,
  Hash,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './percent.module.css';
import { ui } from '@/app/components/ui';

type Mode = 'discount' | 'change' | 'ratio' | 'reverse';

interface Result {
  label: string;
  value: string;
  highlight?: boolean;
  color?: 'green' | 'red';
}

const DISCOUNT_PRESETS = [10, 20, 30, 50];

export default function PercentageCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Percent');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [mode, setMode] = useState<Mode>('discount');

  // States
  const [origPrice, setOrigPrice] = useState('');
  const [discRate, setDiscRate] = useState('');
  const [oldVal, setOldVal] = useState('');
  const [newVal, setNewVal] = useState('');
  const [part, setPart] = useState('');
  const [total, setTotal] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [appliedRate, setAppliedRate] = useState('');


  const fmt = (n: number, decimals = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const discountResults = (): Result[] => {
    const orig = parseFloat(origPrice);
    const rate = parseFloat(discRate);
    if (!isFinite(orig) || !isFinite(rate)) return [];
    const saved = orig * (rate / 100);
    const final = orig - saved;
    return [
      { label: t('result.discountAmount'), value: `${fmt(saved)}${isKo ? '원' : ''}` },
      { label: t('result.finalPrice'), value: `${fmt(final)}${isKo ? '원' : ''}`, highlight: true },
    ];
  };

  const changeResults = (): Result[] => {
    const o = parseFloat(oldVal);
    const n = parseFloat(newVal);
    if (!isFinite(o) || !isFinite(n) || o === 0) return [];
    const rate = ((n - o) / o) * 100;
    const diff = n - o;
    const sign = diff >= 0 ? '+' : '';
    const isUp = diff >= 0;
    return [
      { label: t('result.difference'), value: `${sign}${fmt(diff)}` },
      { label: t('result.changeRate'), value: `${sign}${fmt(rate)}%`, highlight: true, color: isUp ? 'green' : 'red' },
    ];
  };

  const ratioResults = (): Result[] => {
    const p = parseFloat(part);
    const tot = parseFloat(total);
    if (!isFinite(p) || !isFinite(tot) || tot === 0) return [];
    const ratio = (p / tot) * 100;
    return [
      { label: t('result.ratio'), value: `${fmt(ratio)}%`, highlight: true },
    ];
  };

  const reverseResults = (): Result[] => {
    const final = parseFloat(finalPrice);
    const rate = parseFloat(appliedRate);
    if (!isFinite(final) || !isFinite(rate)) return [];
    const orig = final / (1 - rate / 100);
    const saved = orig - final;
    return [
      { label: t('result.originalPrice'), value: `${fmt(orig)}${isKo ? '원' : ''}`, highlight: true },
      { label: t('result.discountAmount'), value: `${fmt(saved)}${isKo ? '원' : ''}` },
    ];
  };

  const results = mode === 'discount' ? discountResults() : mode === 'change' ? changeResults() : mode === 'ratio' ? ratioResults() : reverseResults();


  return (
    <div className={s.fin_container}>
      <NavigationActions />

      <ToolHeader icon={<Percent />} title={t('title')} subtitle={t('description')} />

      {/* Mode Switcher */}
      <div className={ui.segmented}>
        {[
          { id: 'discount', label: t('mode.discount'), icon: <ArrowDownToLine size={20} /> },
          { id: 'change', label: t('mode.change'), icon: <TrendingUp size={20} /> },
          { id: 'ratio', label: t('mode.ratio'), icon: <Activity size={20} /> },
          { id: 'reverse', label: t('mode.reverse'), icon: <RotateCcw size={20} /> },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as Mode)}
            className={`${ui.segment} ${mode === m.id ? ui.segmentActive : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              {m.icon}
              {m.label}
            </div>
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <section className={`${ui.card} ${s.fin_panel}`}>
        {mode === 'discount' && (
          <>
            <div className={ui.field}>
              <label className={ui.label}>{t('label.originalPrice')}</label>
              <div className={ui.inputGroup}>
                <input value={origPrice} onChange={e => setOrigPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
                <span className={ui.unit}>{isKo ? '원' : ''}</span>
              </div>
            </div>
            <div className={ui.field}>
              <label className={ui.label}>{t('label.discountRate')}</label>
              <div className={ui.chips}>
                {DISCOUNT_PRESETS.map(p => (
                  <button
                    key={p}
                    className={`${ui.chip} ${ui.pill} ${discRate === String(p) ? ui.chipActive : ''}`}
                    onClick={() => setDiscRate(String(p))}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className={ui.inputGroup}>
                <input value={discRate} onChange={e => setDiscRate(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
                <span className={ui.unit}>%</span>
              </div>
            </div>
          </>
        )}

        {mode === 'change' && (
          <>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '이전 값' : 'Old Value'}</label>
              <input value={oldVal} onChange={e => setOldVal(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
            </div>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '새 값' : 'New Value'}</label>
              <input value={newVal} onChange={e => setNewVal(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
            </div>
          </>
        )}

        {mode === 'ratio' && (
          <>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '부분 값' : 'Partial Value'}</label>
              <input value={part} onChange={e => setPart(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
            </div>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '전체 값' : 'Total Value'}</label>
              <input value={total} onChange={e => setTotal(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
            </div>
          </>
        )}

        {mode === 'reverse' && (
          <>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '현재 가격' : 'Current Price'}</label>
              <div className={ui.inputGroup}>
                <input value={finalPrice} onChange={e => setFinalPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
                <span className={ui.unit}>{isKo ? '원' : ''}</span>
              </div>
            </div>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '할인율' : 'Discount Rate'}</label>
              <div className={ui.inputGroup}>
                <input value={appliedRate} onChange={e => setAppliedRate(e.target.value.replace(/[^0-9.]/g, ''))} className={`${ui.input} ${ui.inputLg}`} placeholder="0" />
                <span className={ui.unit}>%</span>
              </div>
            </div>
          </>
        )}

        {/* Results Area */}
        {results.length > 0 && (
          <div className={`${ui.result} ${s.fin_result_card}`} style={{ animation: 'bounceIn 0.5s ease-out' }}>
            {results.map((res, i) => (
              <div key={i} className={s.fin_result_item}>
                <span className={s.fin_result_label}>{res.label}</span>
                <span
                  className={
                    res.color === 'green' ? s.fin_result_value_up :
                    res.color === 'red' ? s.fin_result_value_down :
                    s.fin_result_value
                  }
                  style={{ fontSize: res.highlight && !res.color ? '1.75rem' : undefined }}
                >
                  {res.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="utilities/finance/percentage-calc" />
        {seo}
      </div>
    </div>
  );
}
