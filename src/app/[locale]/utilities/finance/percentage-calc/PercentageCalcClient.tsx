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
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './percent.module.css';

type Mode = 'discount' | 'change' | 'ratio' | 'reverse';

interface Result {
  label: string;
  value: string;
  highlight?: boolean;
  color?: 'green' | 'red';
}

const DISCOUNT_PRESETS = [10, 20, 30, 50];

export default function PercentageCalcClient() {
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

      <header className={s.fin_header}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Percent size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{t('title')}</h1>
        <p className={s.fin_subtitle}>{t('description')}</p>
      </header>

      {/* Mode Switcher */}
      <div className={s.fin_tabs}>
        {[
          { id: 'discount', label: t('mode.discount'), icon: <ArrowDownToLine size={20} /> },
          { id: 'change', label: t('mode.change'), icon: <TrendingUp size={20} /> },
          { id: 'ratio', label: t('mode.ratio'), icon: <Activity size={20} /> },
          { id: 'reverse', label: t('mode.reverse'), icon: <RotateCcw size={20} /> },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as Mode)}
            className={`${s.fin_tab_btn} ${mode === m.id ? s.fin_tab_btn_active : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {m.icon}
              {m.label}
            </div>
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <section className={s.fin_panel}>
        {mode === 'discount' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{t('label.originalPrice')}</label>
              <input value={origPrice} onChange={e => setOrigPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>{isKo ? '원' : ''}</span>
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{t('label.discountRate')}</label>
              <div className={s.fin_presets}>
                {DISCOUNT_PRESETS.map(p => (
                  <button
                    key={p}
                    className={`${s.fin_preset_btn} ${discRate === String(p) ? s.fin_preset_btn_active : ''}`}
                    onClick={() => setDiscRate(String(p))}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <input value={discRate} onChange={e => setDiscRate(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>%</span>
            </div>
          </>
        )}

        {mode === 'change' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '이전 값' : 'Old Value'}</label>
              <input value={oldVal} onChange={e => setOldVal(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '새 값' : 'New Value'}</label>
              <input value={newVal} onChange={e => setNewVal(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
          </>
        )}

        {mode === 'ratio' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '부분 값' : 'Partial Value'}</label>
              <input value={part} onChange={e => setPart(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '전체 값' : 'Total Value'}</label>
              <input value={total} onChange={e => setTotal(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
          </>
        )}

        {mode === 'reverse' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '현재 가격' : 'Current Price'}</label>
              <input value={finalPrice} onChange={e => setFinalPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>{isKo ? '원' : ''}</span>
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '할인율' : 'Discount Rate'}</label>
              <input value={appliedRate} onChange={e => setAppliedRate(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>%</span>
            </div>
          </>
        )}

        {/* Results Area */}
        {results.length > 0 && (
          <div className={s.fin_result_card} style={{ animation: 'bounceIn 0.5s ease-out' }}>
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
    </div>
  );
}
