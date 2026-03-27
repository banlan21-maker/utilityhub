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
}

export default function PercentPage() {
  const t = useTranslations('Percent');
  const locale = useLocale();
  const isKo = locale === 'ko';
  
  const [mode, setMode] = useState<Mode>('discount');
  const [isClient, setIsClient] = useState(false);

  // States
  const [origPrice, setOrigPrice] = useState('');
  const [discRate, setDiscRate] = useState('');
  const [oldVal, setOldVal] = useState('');
  const [newVal, setNewVal] = useState('');
  const [part, setPart] = useState('');
  const [total, setTotal] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [appliedRate, setAppliedRate] = useState('');

  useEffect(() => { setIsClient(true); }, []);

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
    return [
      { label: t('result.difference'), value: `${sign}${fmt(diff)}` },
      { label: t('result.changeRate'), value: `${sign}${fmt(rate)}%`, highlight: true },
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

  if (!isClient) return null;

  return (
    <div className={s.fin_container}>
      <NavigationActions />

      <header className={s.fin_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
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
                <span className={s.fin_result_value} style={{ fontSize: res.highlight ? '1.75rem' : '1.1rem' }}>
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
        <RelatedTools toolId="fintech/percent" />
        <div className={s.fin_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '퍼센트 계산기란?',
            description: '할인율, 증감률, 비율 등을 즉시 계산하세요. 일상 생활과 금융 거래 필수 도구.',
            useCases: [{ icon: '🏷️', title: '쇼핑 할인', desc: '세일 가격 미리보기' }],
            steps: [{ step: '1', desc: '원하는 계산기 선택 후 숫자 입력' }],
            faqs: [{ q: '역산이 무엇인가요?', a: '할인된 가격으로 원래 가격을 알아내는 기능입니다.' }]
          }}
          en={{
            title: 'What is Percent Calculator?',
            description: 'Calculate discounts, changes, and ratios instantly. Essential tool for daily finance.',
            useCases: [{ icon: '🏷️', title: 'Shopping', desc: 'Predict sale prices' }],
            steps: [{ step: '1', desc: 'Choose mode and enter values' }],
            faqs: [{ q: 'What is reverse calc?', a: 'Finding the original price using the discount rate.' }]
          }}
        />
      </div>
    </div>
  );
}
