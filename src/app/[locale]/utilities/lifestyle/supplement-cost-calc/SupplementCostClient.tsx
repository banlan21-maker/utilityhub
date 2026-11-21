'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Pill, Crown } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './supplement-cost-calc.module.css';
import { ui } from '@/app/components/ui';

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

export default function SupplementCostClient({ seo }: { seo?: React.ReactNode }) {
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
    <div className={`${ui.card} ${s.product_card} ${cardClass}`}>
      <h3 className={s.product_name}>{label}</h3>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={`sp-price-${idSuffix}`}>
          {t('label_price')}
        </label>
        <input
          id={`sp-price-${idSuffix}`}
          className={ui.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={p.price}
          onChange={(e) => upd('price', e.target.value)}
          aria-label={`${label} ${t('label_price')}`}
        />
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={`sp-total-${idSuffix}`}>
          {t('label_total_units')}
        </label>
        <input
          id={`sp-total-${idSuffix}`}
          className={ui.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={p.totalUnits}
          onChange={(e) => upd('totalUnits', e.target.value)}
          aria-label={`${label} ${t('label_total_units')}`}
        />
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={`sp-serving-${idSuffix}`}>
          {t('label_serving_units')}
        </label>
        <input
          id={`sp-serving-${idSuffix}`}
          className={ui.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={p.servingUnits}
          onChange={(e) => upd('servingUnits', e.target.value)}
          aria-label={`${label} ${t('label_serving_units')}`}
        />
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={`sp-active-${idSuffix}`}>
          {t('label_active_mg')}
          <span className={s.field_basis}> {t('serving_basis_note')}</span>
        </label>
        <input
          id={`sp-active-${idSuffix}`}
          className={ui.input}
          type="number"
          inputMode="decimal"
          min="0"
          value={p.activeMg}
          onChange={(e) => upd('activeMg', e.target.value)}
          aria-label={`${label} ${t('label_active_mg')}`}
        />
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={`sp-capsule-${idSuffix}`}>
          {t('label_capsule_mg')}
          <span className={s.field_basis}> {t('serving_basis_note')}</span>
        </label>
        <input
          id={`sp-capsule-${idSuffix}`}
          className={ui.input}
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
          <div className={ui.field}>
            <label className={ui.label} htmlFor={`sp-epa-${idSuffix}`}>
              {t('label_epa')}
            </label>
            <input
              id={`sp-epa-${idSuffix}`}
              className={ui.input}
              type="number"
              inputMode="decimal"
              min="0"
              value={p.epa}
              onChange={(e) => upd('epa', e.target.value)}
              aria-label={`${label} ${t('label_epa')}`}
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor={`sp-dha-${idSuffix}`}>
              {t('label_dha')}
            </label>
            <input
              id={`sp-dha-${idSuffix}`}
              className={ui.input}
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

      {res.purityError && <div className={`${ui.notice} ${ui.red}`}>{t('input_error_purity')}</div>}
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

      <ToolHeader icon={<Pill />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── Controls ── */}
      <div className={s.controls}>
        <div className={s.control_group}>
          <span className={ui.label}>{t('currency_label')}</span>
          <div className={ui.segmented} role="group" aria-label={t('currency_label')}>
            <button
              className={`${ui.segment} ${currency === 'KRW' ? ui.segmentActive : ''}`}
              aria-pressed={currency === 'KRW'}
              onClick={() => setCurrency('KRW')}
            >
              {t('currency_krw')}
            </button>
            <button
              className={`${ui.segment} ${currency === 'USD' ? ui.segmentActive : ''}`}
              aria-pressed={currency === 'USD'}
              onClick={() => setCurrency('USD')}
            >
              {t('currency_usd')}
            </button>
          </div>
        </div>
        <div className={s.control_group}>
          <label className={ui.label} htmlFor="sp-category">
            {t('label_category')}
          </label>
          <select
            id="sp-category"
            className={ui.input}
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
        className={`${ui.button} ${ui.ghost} ${ui.sm} ${s.advanced_btn}`}
        onClick={() => setShowAdvanced((v) => !v)}
        aria-expanded={showAdvanced}
      >
        {showAdvanced ? '▾ ' : '▸ '}
        {t('advanced_toggle')}
      </button>

      <p className={s.multi_hint}>{t('serving_hint')} · {t('multi_dose_hint')}</p>

      {/* ── Result dashboard ── */}
      <section className={`${ui.card} ${s.dashboard}`} aria-live="polite">
        <h2 className={`${ui.cardTitle} ${s.dashboard_title}`}>{t('result_title')}</h2>

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
              <div className={`${ui.notice} ${ui.amber}`}>
                A · {t(`purity_warn_${warnA.type}`, { p: warnA.p })}
              </div>
            )}
            {warnB && (
              <div className={`${ui.notice} ${ui.amber}`}>
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

            <button className={`${ui.button} ${ui.primary} ${ui.block}`} onClick={handleShare} aria-label={t('share_btn')}>
              {t('share_btn')}
            </button>

            <p className={s.disclaimer}>{t('disclaimer')}</p>
          </>
        )}
      </section>

      {/* ── bottom sections ── */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/lifestyle/supplement-cost-calc" />

      {seo}

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
