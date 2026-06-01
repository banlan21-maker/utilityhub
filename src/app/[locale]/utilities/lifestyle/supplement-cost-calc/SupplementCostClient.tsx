'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Pill, Crown } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './supplement-cost-calc.module.css';

type Currency = 'KRW' | 'USD';
type Category = 'omega3' | 'vitamin' | 'other';
type EpaType = 'epa_focus' | 'epa_lean' | 'balance' | 'dha_focus';

interface ProductInput {
  price: string;
  totalUnits: string;
  servingUnits: string;
  activeMg: string;
  capsuleMg: string;
  epa: string;
  dha: string;
}

interface ProductResult {
  basicValid: boolean;
  days: number | null;
  costPerDay: number | null;
  costPer1000mg: number | null;
  purity: number | null;
  purityError: boolean;
  epaType: EpaType | null;
  epaRatio: { e: number; d: number } | null;
}

const EMPTY: ProductInput = {
  price: '',
  totalUnits: '',
  servingUnits: '',
  activeMg: '',
  capsuleMg: '',
  epa: '',
  dha: '',
};

function num(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? NaN : n;
}

function epaTypeOf(e: number, d: number): EpaType {
  const r = e / d;
  if (r >= 2) return 'epa_focus';
  if (r >= 1.5) return 'epa_lean';
  if (r >= 0.67) return 'balance';
  return 'dha_focus';
}

function computeProduct(p: ProductInput): ProductResult {
  const price = num(p.price);
  const total = num(p.totalUnits);
  const serving = num(p.servingUnits);
  const active = num(p.activeMg);
  const capsule = num(p.capsuleMg);

  const basicValid = price > 0 && total > 0 && serving > 0;
  const days = basicValid ? total / serving : null;
  const costPerDay = basicValid && days ? price / days : null;

  const costPer1000mg =
    basicValid && days && active > 0 ? price / ((days * active) / 1000) : null;

  let purity: number | null = null;
  let purityError = false;
  if (active > 0 && capsule > 0) {
    purity = (active / capsule) * 100;
    if (active > capsule) purityError = true;
  }

  let epaType: EpaType | null = null;
  let epaRatio: { e: number; d: number } | null = null;
  const e = num(p.epa);
  const d = num(p.dha);
  if (e > 0 && d > 0) {
    epaType = epaTypeOf(e, d);
    epaRatio = { e, d };
  }

  return { basicValid, days, costPerDay, costPer1000mg, purity, purityError, epaType, epaRatio };
}

export default function SupplementCostClient() {
  const t = useTranslations('Supplement');

  const [currency, setCurrency] = useState<Currency>('KRW');
  const [category, setCategory] = useState<Category>('omega3');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [a, setA] = useState<ProductInput>(EMPTY);
  const [b, setB] = useState<ProductInput>(EMPTY);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const resA = useMemo(() => computeProduct(a), [a]);
  const resB = useMemo(() => computeProduct(b), [b]);

  const fmt = useCallback(
    (v: number | null, opts?: { decimals?: number }) => {
      if (v === null || isNaN(v)) return '—';
      const dec = opts?.decimals ?? (currency === 'USD' ? 2 : 0);
      const rounded = Number(v.toFixed(dec));
      const formatted = rounded.toLocaleString(currency === 'USD' ? 'en-US' : 'ko-KR', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });
      return currency === 'USD' ? `$${formatted}` : `${formatted}원`;
    },
    [currency]
  );

  const bothValid = resA.basicValid && resB.basicValid;

  // purity warning per product (omega3 only)
  const purityWarn = useCallback(
    (r: ProductResult): { type: 'high' | 'low'; p: string } | null => {
      if (category !== 'omega3' || r.purity === null || r.purityError) return null;
      if (r.purity > 88) return { type: 'high', p: r.purity.toFixed(1) };
      if (r.purity < 50) return { type: 'low', p: r.purity.toFixed(1) };
      return null;
    },
    [category]
  );

  // winner by cost per 1000mg (primary), fallback to cost per day
  const winner = useMemo(() => {
    if (!bothValid) return null;
    const useMg = resA.costPer1000mg !== null && resB.costPer1000mg !== null;
    const va = useMg ? resA.costPer1000mg! : resA.costPerDay!;
    const vb = useMg ? resB.costPer1000mg! : resB.costPerDay!;
    if (va === vb) return { side: 'tie' as const, criteria: useMg ? 'mg' : 'day', percent: 0 };
    const aWins = va < vb;
    const lo = Math.min(va, vb);
    const hi = Math.max(va, vb);
    const percent = hi > 0 ? ((hi - lo) / hi) * 100 : 0;
    return {
      side: (aWins ? 'a' : 'b') as 'a' | 'b',
      criteria: useMg ? 'mg' : 'day',
      percent: Number(percent.toFixed(1)),
    };
  }, [bothValid, resA, resB]);

  // gauge helper: returns side class for A and B given "lower is better" or "higher is better"
  const gaugeClass = (
    va: number | null,
    vb: number | null,
    side: 'a' | 'b',
    lowerWins: boolean
  ): string => {
    if (va === null || vb === null || va === vb) return s.gauge_neutral;
    const aWins = lowerWins ? va < vb : va > vb;
    const isWinner = side === 'a' ? aWins : !aWins;
    return isWinner ? s.gauge_winner : s.gauge_loser;
  };

  const barWidth = (v: number | null, other: number | null): string => {
    if (v === null || other === null) return '40%';
    const max = Math.max(v, other);
    if (max <= 0) return '8px';
    return `${Math.max(12, (v / max) * 100)}%`;
  };

  const updateA = (k: keyof ProductInput, v: string) => setA((p) => ({ ...p, [k]: v }));
  const updateB = (k: keyof ProductInput, v: string) => setB((p) => ({ ...p, [k]: v }));

  // ── share card ──
  const handleShare = useCallback(async () => {
    if (!bothValid || !winner) return;
    try {
      if (typeof document !== 'undefined' && document.fonts) await document.fonts.ready;
      const W = 1080;
      const H = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W, H);
      // receipt card
      ctx.fillStyle = '#fff';
      ctx.fillRect(90, 90, W - 180, H - 180);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(90, 90, W - 180, H - 180);

      ctx.textAlign = 'center';
      ctx.font = '90px serif';
      ctx.fillText('💊', W / 2, 230);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(t('share_card_title'), W / 2, 310);

      const line = (label: string, va: string, vb: string, y: number) => {
        ctx.textAlign = 'left';
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(label, 160, y);
        ctx.textAlign = 'center';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(va, 430, y + 50);
        ctx.fillStyle = '#db2777';
        ctx.fillText(vb, 650, y + 50);
      };
      ctx.textAlign = 'center';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillStyle = '#2563eb';
      ctx.fillText('A', 430, 410);
      ctx.fillStyle = '#db2777';
      ctx.fillText('B', 650, 410);

      line(t('result_cost_per_day'), fmt(resA.costPerDay), fmt(resB.costPerDay), 470);
      line(t('result_cost_per_mg'), fmt(resA.costPer1000mg), fmt(resB.costPer1000mg), 590);
      line(
        t('result_purity'),
        resA.purity !== null ? `${resA.purity.toFixed(0)}%` : '—',
        resB.purity !== null ? `${resB.purity.toFixed(0)}%` : '—',
        710
      );

      // winner banner
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(160, 820, W - 320, 110);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      const winLabel =
        winner.side === 'tie'
          ? t('winner_tie', { criteria: t(`criteria_${winner.criteria}`) })
          : `🏆 ${winner.side === 'a' ? 'A' : 'B'}  -${winner.percent}%`;
      ctx.fillText(winLabel, W / 2, 888);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '26px sans-serif';
      ctx.fillText('theutilhub.com', W / 2, 980);

      const a2 = document.createElement('a');
      a2.href = canvas.toDataURL('image/png');
      a2.download = 'supplement-comparison.png';
      a2.click();
      showToast(t('share_done'));
    } catch {
      showToast(t('share_failed'));
    }
  }, [bothValid, winner, resA, resB, fmt, t, showToast]);

  const warnA = purityWarn(resA);
  const warnB = purityWarn(resB);

  // ── render a product input card ──
  const renderInputs = (
    label: string,
    cardClass: string,
    p: ProductInput,
    upd: (k: keyof ProductInput, v: string) => void,
    res: ProductResult,
    idSuffix: string
  ) => (
    <div className={`${s.product_card} ${cardClass}`}>
      <h3 className={s.product_name}>{label}</h3>

      <div className={s.field}>
        <label className={s.field_label} htmlFor={`sp-price-${idSuffix}`}>
          {t('label_price')}
        </label>
        <input
          id={`sp-price-${idSuffix}`}
          className={s.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={p.price}
          onChange={(e) => upd('price', e.target.value)}
          aria-label={`${label} ${t('label_price')}`}
        />
      </div>

      <div className={s.field}>
        <label className={s.field_label} htmlFor={`sp-total-${idSuffix}`}>
          {t('label_total_units')}
        </label>
        <input
          id={`sp-total-${idSuffix}`}
          className={s.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={p.totalUnits}
          onChange={(e) => upd('totalUnits', e.target.value)}
          aria-label={`${label} ${t('label_total_units')}`}
        />
      </div>

      <div className={s.field}>
        <label className={s.field_label} htmlFor={`sp-serving-${idSuffix}`}>
          {t('label_serving_units')}
        </label>
        <input
          id={`sp-serving-${idSuffix}`}
          className={s.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={p.servingUnits}
          onChange={(e) => upd('servingUnits', e.target.value)}
          aria-label={`${label} ${t('label_serving_units')}`}
        />
      </div>

      <div className={s.field}>
        <label className={s.field_label} htmlFor={`sp-active-${idSuffix}`}>
          {t('label_active_mg')}
          <span className={s.field_basis}> {t('serving_basis_note')}</span>
        </label>
        <input
          id={`sp-active-${idSuffix}`}
          className={s.input}
          type="number"
          inputMode="decimal"
          min="0"
          value={p.activeMg}
          onChange={(e) => upd('activeMg', e.target.value)}
          aria-label={`${label} ${t('label_active_mg')}`}
        />
      </div>

      <div className={s.field}>
        <label className={s.field_label} htmlFor={`sp-capsule-${idSuffix}`}>
          {t('label_capsule_mg')}
          <span className={s.field_basis}> {t('serving_basis_note')}</span>
        </label>
        <input
          id={`sp-capsule-${idSuffix}`}
          className={s.input}
          type="number"
          inputMode="decimal"
          min="0"
          value={p.capsuleMg}
          onChange={(e) => upd('capsuleMg', e.target.value)}
          aria-label={`${label} ${t('label_capsule_mg')}`}
        />
      </div>

      {showAdvanced && (
        <>
          <div className={s.field}>
            <label className={s.field_label} htmlFor={`sp-epa-${idSuffix}`}>
              {t('label_epa')}
            </label>
            <input
              id={`sp-epa-${idSuffix}`}
              className={s.input}
              type="number"
              inputMode="decimal"
              min="0"
              value={p.epa}
              onChange={(e) => upd('epa', e.target.value)}
              aria-label={`${label} ${t('label_epa')}`}
            />
          </div>
          <div className={s.field}>
            <label className={s.field_label} htmlFor={`sp-dha-${idSuffix}`}>
              {t('label_dha')}
            </label>
            <input
              id={`sp-dha-${idSuffix}`}
              className={s.input}
              type="number"
              inputMode="decimal"
              min="0"
              value={p.dha}
              onChange={(e) => upd('dha', e.target.value)}
              aria-label={`${label} ${t('label_dha')}`}
            />
          </div>
        </>
      )}

      {res.purityError && <div className={s.error_box}>{t('input_error_purity')}</div>}
    </div>
  );

  // gauge value with bar
  const gaugeSide = (
    sideClass: string,
    statusClass: string,
    label: string,
    value: string,
    width: string,
    tag?: string
  ) => (
    <div className={`${s.gauge_side} ${sideClass} ${statusClass}`}>
      <span className={s.gauge_label}>{label}</span>
      <span className={s.gauge_value}>{value}</span>
      <div className={s.gauge_bar} style={{ width }} />
      {tag && <span className={s.gauge_tag}>{tag}</span>}
    </div>
  );

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.icon_wrap}>
          <Pill size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* ── Controls ── */}
      <div className={s.controls}>
        <div className={s.control_group}>
          <span className={s.control_label}>{t('currency_label')}</span>
          <div className={s.toggle_row} role="group" aria-label={t('currency_label')}>
            <button
              className={`${s.toggle_btn} ${currency === 'KRW' ? s.toggle_btn_active : ''}`}
              aria-pressed={currency === 'KRW'}
              onClick={() => setCurrency('KRW')}
            >
              {t('currency_krw')}
            </button>
            <button
              className={`${s.toggle_btn} ${currency === 'USD' ? s.toggle_btn_active : ''}`}
              aria-pressed={currency === 'USD'}
              onClick={() => setCurrency('USD')}
            >
              {t('currency_usd')}
            </button>
          </div>
        </div>
        <div className={s.control_group}>
          <label className={s.control_label} htmlFor="sp-category">
            {t('label_category')}
          </label>
          <select
            id="sp-category"
            className={s.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="omega3">{t('category_omega3')}</option>
            <option value="vitamin">{t('category_vitamin')}</option>
            <option value="other">{t('category_other')}</option>
          </select>
        </div>
      </div>

      {/* ── A/B inputs ── */}
      <div className={s.ab_grid}>
        {renderInputs(t('product_a'), s.product_a, a, updateA, resA, 'a')}
        {renderInputs(t('product_b'), s.product_b, b, updateB, resB, 'b')}
      </div>

      <button
        className={s.advanced_btn}
        onClick={() => setShowAdvanced((v) => !v)}
        aria-expanded={showAdvanced}
      >
        {showAdvanced ? '▾ ' : '▸ '}
        {t('advanced_toggle')}
      </button>

      <p className={s.multi_hint}>{t('serving_hint')} · {t('multi_dose_hint')}</p>

      {/* ── Result dashboard ── */}
      <section className={s.dashboard} aria-live="polite">
        <h2 className={s.dashboard_title}>{t('result_title')}</h2>

        {!bothValid ? (
          <div className={s.empty_dash}>
            <span className={s.empty_icon}>⚖️</span>
            <span>{t('empty_hint')}</span>
            {(a.price || b.price) && !bothValid && <span>{t('input_error_basic')}</span>}
          </div>
        ) : (
          <>
            {/* cost per day gauge */}
            <div className={s.gauge_block}>
              <span className={s.gauge_metric}>{t('result_cost_per_day')}</span>
              <div className={s.gauge_row}>
                {gaugeSide(
                  s.gauge_side_a,
                  gaugeClass(resA.costPerDay, resB.costPerDay, 'a', true),
                  t('product_a'),
                  `${fmt(resA.costPerDay)}${t('unit_per_day')}`,
                  barWidth(resA.costPerDay, resB.costPerDay)
                )}
                {gaugeSide(
                  s.gauge_side_b,
                  gaugeClass(resA.costPerDay, resB.costPerDay, 'b', true),
                  t('product_b'),
                  `${fmt(resB.costPerDay)}${t('unit_per_day')}`,
                  barWidth(resB.costPerDay, resA.costPerDay)
                )}
              </div>
            </div>

            {/* cost per 1000mg gauge */}
            {(resA.costPer1000mg !== null || resB.costPer1000mg !== null) && (
              <div className={s.gauge_block}>
                <span className={s.gauge_metric}>{t('result_cost_per_mg')}</span>
                <div className={s.gauge_row}>
                  {gaugeSide(
                    s.gauge_side_a,
                    gaugeClass(resA.costPer1000mg, resB.costPer1000mg, 'a', true),
                    t('product_a'),
                    `${fmt(resA.costPer1000mg)}${t('unit_per_1000mg')}`,
                    barWidth(resA.costPer1000mg, resB.costPer1000mg)
                  )}
                  {gaugeSide(
                    s.gauge_side_b,
                    gaugeClass(resA.costPer1000mg, resB.costPer1000mg, 'b', true),
                    t('product_b'),
                    `${fmt(resB.costPer1000mg)}${t('unit_per_1000mg')}`,
                    barWidth(resB.costPer1000mg, resA.costPer1000mg)
                  )}
                </div>
              </div>
            )}

            {/* purity gauge */}
            {(resA.purity !== null || resB.purity !== null) && (
              <div className={s.gauge_block}>
                <span className={s.gauge_metric}>{t('result_purity')}</span>
                <div className={s.gauge_row}>
                  {gaugeSide(
                    s.gauge_side_a,
                    gaugeClass(resA.purity, resB.purity, 'a', false),
                    t('product_a'),
                    resA.purity !== null ? `${resA.purity.toFixed(1)}%` : '—',
                    barWidth(resA.purity, resB.purity),
                    resA.purity !== null && resB.purity !== null && resA.purity > resB.purity
                      ? t('gauge_higher_purity')
                      : undefined
                  )}
                  {gaugeSide(
                    s.gauge_side_b,
                    gaugeClass(resA.purity, resB.purity, 'b', false),
                    t('product_b'),
                    resB.purity !== null ? `${resB.purity.toFixed(1)}%` : '—',
                    barWidth(resB.purity, resA.purity),
                    resA.purity !== null && resB.purity !== null && resB.purity > resA.purity
                      ? t('gauge_higher_purity')
                      : undefined
                  )}
                </div>
              </div>
            )}

            {/* purity warnings (omega3 only) */}
            {warnA && (
              <div className={s.purity_warn}>
                A · {t(`purity_warn_${warnA.type}`, { p: warnA.p })}
              </div>
            )}
            {warnB && (
              <div className={s.purity_warn}>
                B · {t(`purity_warn_${warnB.type}`, { p: warnB.p })}
              </div>
            )}

            {/* EPA:DHA type (advanced) */}
            {(resA.epaType || resB.epaType) && (
              <div className={s.type_row}>
                <div className={`${s.type_chip} ${s.type_chip_a}`}>
                  {resA.epaType && resA.epaRatio ? (
                    <>
                      <strong>{t(`type_${resA.epaType}`)}</strong>
                      EPA:DHA {resA.epaRatio.e}:{resA.epaRatio.d}
                    </>
                  ) : (
                    '—'
                  )}
                </div>
                <div className={`${s.type_chip} ${s.type_chip_b}`}>
                  {resB.epaType && resB.epaRatio ? (
                    <>
                      <strong>{t(`type_${resB.epaType}`)}</strong>
                      EPA:DHA {resB.epaRatio.e}:{resB.epaRatio.d}
                    </>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            )}

            {/* winner card */}
            {winner && winner.side !== 'tie' && (
              <div className={s.winner_card}>
                <Crown size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {t('winner_announcement', {
                  criteria: t(`criteria_${winner.criteria}`),
                  winner: winner.side === 'a' ? t('product_a') : t('product_b'),
                  percent: winner.percent,
                })}
              </div>
            )}
            {winner && winner.side === 'tie' && (
              <div className={s.winner_tie}>
                {t('winner_tie', { criteria: t(`criteria_${winner.criteria}`) })}
              </div>
            )}

            <button className={s.share_btn} onClick={handleShare} aria-label={t('share_btn')}>
              {t('share_btn')}
            </button>

            <p className={s.disclaimer}>{t('disclaimer')}</p>
          </>
        )}
      </section>

      {/* ── bottom sections ── */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/lifestyle/supplement-cost-calc" />
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '영양제 진짜 가성비 분석기란 무엇인가요?',
          description:
            '영양제 진짜 가성비 분석기는 제조사 라벨의 표기 방식 차이에 가려진 실제 가격 경쟁력을 숫자로 드러내는 100% 브라우저 기반 가격 비교 계산기입니다. 같은 가격이라도 1회에 먹어야 하는 캡슐 수가 다르면 실제 복용 일수와 하루 단가가 크게 달라지는데, 이 도구는 제품 가격·통 전체 총 캡슐 수·1회 섭취 캡슐 수·1회 섭취량당 핵심 성분(mg)·1회 섭취량당 캡슐 총 용량(mg)을 입력받아 세 가지 핵심 지표를 실시간으로 산출합니다 — 총 복용 가능 일수, 하루 진짜 단가, 그리고 핵심 성분 1,000mg당 가격입니다. 모든 성분 입력은 라벨에 적힌 1회 섭취량 기준 숫자를 그대로 넣으면 되므로 사용자가 따로 나누기 계산을 할 필요가 없고, 순도(핵심 성분 ÷ 캡슐 총 용량 × 100)도 캡슐 수와 무관하게 정확히 계산됩니다. A·B 두 제품을 나란히 입력하면 좌우 대칭 게이지로 어느 쪽이 더 저렴한지 한눈에 비교되고, 1,000mg당 단가를 기준으로 진짜 가성비 승자를 판정합니다. 해외 직구 핫딜이나 커뮤니티 특가가 정말 싼 것인지 객관적으로 검증할 때 유용합니다. 다만 본 도구는 가격 비교 계산기이며, 흡수율이나 원료 형태 같은 요소는 사용자가 직접 판단해야 합니다.',
          useCases: [
            { icon: '💊', title: '오메가3·유산균 직구 핫딜 판독', desc: '가격은 싸 보이는데 1회에 3캡슐을 먹어야 해서 실제론 비싼 제품을 걸러내고, 순수 핵심 성분 함량 대비 1,000mg당 단가로 진짜 가성비를 판정합니다.' },
            { icon: '⚖️', title: '동일 성분 타 브랜드 교체 검토', desc: '현재 먹는 제품과 새로 눈여겨보는 제품의 1,000mg당 단가와 순도를 정확히 대조하여, 브랜드를 교체할 만한 가격 이점이 있는지 객관적으로 판단합니다.' },
            { icon: '🛒', title: '특가 커뮤니티 딜 검증', desc: '영양제 갤러리나 핫딜 커뮤니티에 올라온 특가 제품이 정말 싼 게 맞는지 하루 단가와 1,000mg당 단가로 검증하고 결과 이미지를 공유합니다.' },
            { icon: '🌎', title: '다국어 달러($) 비교', desc: '원화와 달러 결제가 모두 호환되어 아마존, 아이허브 등 글로벌 플랫폼 직구 가격을 같은 통화끼리 정확히 비교하는 데 최적화되어 있습니다.' },
          ],
          steps: [
            { step: '통화·성분 종류 선택', desc: '상단에서 통화(KRW/USD)와 성분 종류(오메가3·비타민·기타)를 선택합니다. 성분 종류에 따라 순도 경고 기준이 자동으로 맞춰져 불필요한 경고를 줄여줍니다.' },
            { step: '라벨 숫자 그대로 입력', desc: '가격, 총 캡슐 수, 1회 섭취 캡슐 수를 입력하고, 핵심 성분과 캡슐 총 용량은 라벨의 1회 섭취량 기준 숫자를 그대로 베껴 넣습니다. 별도 계산이 필요 없습니다.' },
            { step: '고급 입력 (선택)', desc: 'EPA·DHA 개별 함량을 입력하면 EPA 집중형·밸런스형 같은 객관적 비율 타입과 EPA:DHA 비율 수치가 표시됩니다. 효능과 무관한 순수 분류입니다.' },
            { step: '승자와 순도 확인', desc: '하루 단가·1,000mg당 단가·순도가 좌우 게이지로 실시간 비교되고, 1,000mg당 기준으로 더 저렴한 제품에 승자 카드가 표시됩니다. 결과는 이미지로 공유할 수 있습니다.' },
          ],
          faqs: [
            { q: '성분 함량을 1캡슐 기준으로 넣나요, 1회 섭취량 기준으로 넣나요?', a: '라벨에 적힌 1회 섭취량(Serving Size) 기준 숫자를 그대로 입력하시면 됩니다. 핵심 성분과 캡슐 총 용량 모두 같은 1회 섭취량 기준으로 넣어야 순도가 정확히 계산됩니다. 시중 라벨 대부분이 1회 섭취량 기준으로 표기되므로 사용자가 별도로 나누기 계산을 할 필요가 없습니다.' },
            { q: '하루 단가와 1,000mg당 단가 중 뭘 봐야 하나요?', a: '비타민처럼 단순한 제품은 하루 단가가 직관적이고, 오메가3처럼 핵심 성분 농도가 중요한 영양제는 1,000mg당 단가가 핵심 비교 기준입니다. 같은 가격이어도 함량이 다르면 1,000mg당 단가가 크게 차이 나기 때문입니다. 본 도구는 두 지표를 모두 제공하니 비교 목적에 맞게 보세요.' },
            { q: '순도가 높을수록 무조건 좋은 건가요?', a: '오메가3의 경우 순도 80% 내외가 일반적 기준으로 알려져 있습니다. rTG 형태는 보통 80%를 넘기 어려워, 90%에 가까운 순도가 표기되면 용량 표기를 다시 확인할 필요가 있어 본 도구가 이상치를 안내합니다. 비타민·미네랄은 고순도가 정상이라 순도 경고를 적용하지 않습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 본 도구는 가격 비교 계산기이며 의학적 조언이 아닙니다. 흡수율이나 원료 형태 등은 사용자가 직접 판단해야 하며, 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Supplement Cost Analyzer?',
          description:
            'The Supplement Cost Analyzer is a 100% browser-based price comparison calculator that reveals, in plain numbers, the real cost competitiveness hidden behind differences in how manufacturers label their products. Two products at the same price can have very different real costs if one requires more capsules per serving. This tool takes the product price, total capsules in the bottle, capsules per serving, active ingredient per serving (mg), and total capsule weight per serving (mg), and computes three key metrics in real time: total days of supply, true cost per day, and price per 1,000mg of active ingredient. Every ingredient field is entered exactly as written on the label per serving size, so you never have to do any division yourself, and purity (active ingredient ÷ total capsule weight × 100) is calculated accurately regardless of the capsule count. Enter Products A and B side by side and a left-right symmetric gauge shows at a glance which one is cheaper, declaring the true value winner based on the price per 1,000mg. It is useful for objectively verifying whether an overseas direct-purchase deal or a community sale is actually a good price. Note that this is a price comparison calculator only; factors like absorption rate and ingredient form are for you to judge.',
          useCases: [
            { icon: '💊', title: 'Decode Direct-Purchase Deals', desc: 'Filter out products that look cheap but require 3 capsules per serving and are actually expensive, judging true value by price per 1,000mg of active ingredient.' },
            { icon: '⚖️', title: 'Compare Switching Brands', desc: 'Precisely contrast the price per 1,000mg and purity of your current product against a new candidate to objectively decide whether the price advantage justifies switching.' },
            { icon: '🛒', title: 'Verify Community Sale Deals', desc: 'Check whether a sale product posted in a deal community is genuinely cheap using cost per day and per 1,000mg, then share the result image with others.' },
            { icon: '🌎', title: 'Dollar ($) Comparison', desc: 'With both KRW and USD supported, it is optimized for comparing direct-purchase prices on global platforms like Amazon and iHerb within the same currency.' },
          ],
          steps: [
            { step: 'Pick currency and ingredient type', desc: 'Choose the currency (KRW/USD) and ingredient type (Omega-3, Vitamin, Other) at the top. The purity warning threshold adjusts automatically to the type, cutting unnecessary warnings.' },
            { step: 'Enter label numbers as-is', desc: 'Enter price, total capsules, and capsules per serving, then copy the active ingredient and total capsule weight straight from the label per serving size. No separate math needed.' },
            { step: 'Advanced input (optional)', desc: 'Enter separate EPA and DHA amounts to see an objective ratio type such as EPA-concentrated or Balanced, along with the EPA:DHA ratio. It is a pure classification.' },
            { step: 'Check the winner and purity', desc: 'Cost per day, per 1,000mg, and purity are compared live in left-right gauges, and a winner card highlights the cheaper product by the per-1,000mg metric. Share the result as an image.' },
          ],
          faqs: [
            { q: 'Do I enter ingredient amounts per capsule or per serving?', a: 'Enter the numbers exactly as written on the label per serving size. Both the active ingredient and total capsule weight must be on the same per-serving basis for purity to calculate correctly. Since most labels report per serving size, you never need to divide anything yourself.' },
            { q: 'Should I look at cost per day or cost per 1,000mg?', a: 'For simple products like vitamins, cost per day is intuitive; for supplements where active concentration matters, like Omega-3, price per 1,000mg is the key metric. At the same price, different amounts produce very different per-1,000mg costs. This tool provides both so you can choose by purpose.' },
            { q: 'Is higher purity always better?', a: 'For Omega-3, around 80% purity is a commonly cited benchmark. The rTG form rarely exceeds 80%, so a purity near 90% may warrant rechecking the dosage label, which is why this tool flags outliers. For vitamins and minerals, high purity is normal, so no purity warning is applied.' },
            { q: 'Can I use this result as official data?', a: 'The results are for reference only. This is a price comparison calculator, not medical advice. Factors like absorption rate and ingredient form are for you to judge, and you should consult a professional or official source for accurate figures.' },
          ],
        }}
      />

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
