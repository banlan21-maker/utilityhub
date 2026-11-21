'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Coffee } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './coffee-yield-calc.module.css';
import { ui } from '@/app/components/ui';

type Mode = 'basic' | 'pro';
type Method = 'drip' | 'espresso';
type RatioSel = number | 'custom';

interface Preset {
  value: number;
  suffix?: 'sca' | 'standard' | 'ristretto' | 'lungo';
}

const DRIP_PRESETS: Preset[] = [
  { value: 15 },
  { value: 16 },
  { value: 17 },
  { value: 18, suffix: 'sca' },
];
const ESPRESSO_PRESETS: Preset[] = [
  { value: 2, suffix: 'standard' },
  { value: 1.5, suffix: 'ristretto' },
  { value: 3, suffix: 'lungo' },
];

// TDS scale per method (SCA-verified)
const TDS_SCALE = {
  drip: { min: 1.0, max: 1.6, goldMin: 1.15, goldMax: 1.35 },
  espresso: { min: 6, max: 14, goldMin: 8, goldMax: 12 },
};
// yield axis (extraction yield %)
const Y_MIN = 14;
const Y_MAX = 26;
const GOLD_Y_MIN = 18;
const GOLD_Y_MAX = 22;

// SVG plot geometry (viewBox 0 0 400 280)
const PLOT = { left: 44, right: 384, top: 16, bottom: 244 };
const PW = PLOT.right - PLOT.left;
const PH = PLOT.bottom - PLOT.top;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function CoffeeYieldClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('CoffeeYield');

  const [mode, setMode] = useState<Mode>('basic');
  const [method, setMethod] = useState<Method>('drip');
  const [dose, setDose] = useState('18');
  const [ratioSel, setRatioSel] = useState<RatioSel>(16);
  const [ratioValue, setRatioValue] = useState(16);
  const [customRatio, setCustomRatio] = useState('');
  const [output, setOutput] = useState('');
  const [tds, setTds] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const presets = method === 'drip' ? DRIP_PRESETS : ESPRESSO_PRESETS;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ── method switch: reset ratio to method default ──
  const switchMethod = (m: Method) => {
    setMethod(m);
    const def = m === 'drip' ? 16 : 2;
    setRatioSel(def);
    setRatioValue(def);
    setCustomRatio('');
  };

  const selectPreset = (value: number) => {
    setRatioSel(value);
    setRatioValue(value);
  };
  const selectCustom = () => {
    setRatioSel('custom');
    const v = parseFloat(customRatio);
    if (!isNaN(v) && v > 0) setRatioValue(v);
  };
  const onCustomChange = (raw: string) => {
    setCustomRatio(raw);
    if (ratioSel === 'custom') {
      const v = parseFloat(raw);
      if (!isNaN(v) && v > 0) setRatioValue(v);
    }
  };

  // ── core calculation ──
  const calc = useMemo(() => {
    const doseNum = parseFloat(dose);
    const doseValid = !isNaN(doseNum) && doseNum > 0;
    const ratioOk = ratioValue > 0;

    const target = doseValid && ratioOk ? doseNum * ratioValue : null;

    // pro mode: extraction yield
    const outNum = parseFloat(output);
    const tdsNum = parseFloat(tds);
    const proInputsReady =
      !isNaN(outNum) && outNum > 0 && !isNaN(tdsNum) && tdsNum > 0;

    let yieldPct: number | null = null;
    let unrealistic = false;
    if (mode === 'pro' && doseValid && proInputsReady) {
      yieldPct = (outNum * (tdsNum / 100)) / doseNum * 100;
      if (yieldPct < 0 || yieldPct > 35) unrealistic = true;
    }

    let verdict: 'under' | 'ideal' | 'over' | null = null;
    if (yieldPct !== null && !unrealistic) {
      if (yieldPct < GOLD_Y_MIN) verdict = 'under';
      else if (yieldPct <= GOLD_Y_MAX) verdict = 'ideal';
      else verdict = 'over';
    }

    // output sanity warning (method range)
    let outputWarn = false;
    if (mode === 'pro' && doseValid && !isNaN(outNum) && outNum > 0 && target) {
      // warn if drastically off the expected target (>2.5x deviation)
      if (outNum > target * 2.5 || outNum < target * 0.3) outputWarn = true;
    }

    return {
      doseValid,
      target,
      yieldPct,
      unrealistic,
      verdict,
      tdsNum: isNaN(tdsNum) ? null : tdsNum,
      outputWarn,
    };
  }, [dose, ratioValue, output, tds, mode]);

  const scale = TDS_SCALE[method];

  // chart coords
  const xOf = (y: number) => PLOT.left + clamp01((y - Y_MIN) / (Y_MAX - Y_MIN)) * PW;
  const yOf = (td: number) =>
    PLOT.top + (1 - clamp01((td - scale.min) / (scale.max - scale.min))) * PH;

  const goldRect = {
    x: xOf(GOLD_Y_MIN),
    y: yOf(scale.goldMax),
    w: xOf(GOLD_Y_MAX) - xOf(GOLD_Y_MIN),
    h: yOf(scale.goldMin) - yOf(scale.goldMax),
  };

  const dotInGolden =
    calc.yieldPct !== null &&
    calc.tdsNum !== null &&
    calc.yieldPct >= GOLD_Y_MIN &&
    calc.yieldPct <= GOLD_Y_MAX &&
    calc.tdsNum >= scale.goldMin &&
    calc.tdsNum <= scale.goldMax;

  const presetLabel = (p: Preset) =>
    p.suffix ? t(`ratio_suffix_${p.suffix}`) : '';

  // ── share card (Canvas) ──
  const handleShare = useCallback(async () => {
    if (calc.target === null) return;
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      const W = 1080;
      const H = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');

      // bg
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fffdf8');
      grad.addColorStop(1, '#fde9b8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#78350f';

      // emoji + title
      ctx.font = '120px serif';
      ctx.fillText('☕', W / 2, 260);
      ctx.font = 'bold 56px sans-serif';
      ctx.fillText(t('share_card_title'), W / 2, 360);

      // target line
      const methodLabel =
        method === 'drip' ? t('target_water') : t('target_yield');
      ctx.font = '34px sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText(methodLabel.replace(/^[^\sA-Za-z가-힣]+\s*/, ''), W / 2, 500);
      ctx.font = 'bold 110px sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText(`${Math.round(calc.target)} g`, W / 2, 620);

      // yield (pro)
      if (calc.yieldPct !== null && !calc.unrealistic && calc.verdict) {
        const verdictLabel = t(`verdict_${calc.verdict}`);
        ctx.font = '34px sans-serif';
        ctx.fillStyle = '#92400e';
        ctx.fillText(t('extract_yield').replace(/^[^\sA-Za-z가-힣]+\s*/, ''), W / 2, 760);
        ctx.font = 'bold 96px sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText(`${calc.yieldPct.toFixed(2)}%`, W / 2, 870);
        ctx.font = 'bold 44px sans-serif';
        ctx.fillStyle = calc.verdict === 'ideal' ? '#166534' : '#9a3412';
        ctx.fillText(verdictLabel, W / 2, 940);
      }

      ctx.font = '30px sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('theutilhub.com', W / 2, 1020);

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'coffee-extraction.png';
      a.click();
      showToast(t('share_done'));
    } catch {
      showToast(t('share_failed'));
    }
  }, [calc, method, t, showToast]);

  const targetLabel = method === 'drip' ? t('target_water') : t('target_yield');
  const hasResult = calc.doseValid && calc.target !== null;

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Coffee />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── Mode toggle ── */}
      <div className={`${ui.segmented} ${s.toggle_row}`} role="tablist" aria-label={t('mode_label')}>
        <button
          role="tab"
          aria-selected={mode === 'basic'}
          className={`${ui.segment} ${mode === 'basic' ? ui.segmentActive : ''}`}
          onClick={() => setMode('basic')}
        >
          {t('mode_basic')}
        </button>
        <button
          role="tab"
          aria-selected={mode === 'pro'}
          className={`${ui.segment} ${mode === 'pro' ? ui.segmentActive : ''}`}
          onClick={() => setMode('pro')}
        >
          {t('mode_pro')}
        </button>
      </div>

      {/* ── 2-column ── */}
      <div className={s.layout}>
        {/* ── Input panel (left) ── */}
        <section className={`${ui.card} ${s.panel}`} aria-label={t('method_label')}>
          {/* method toggle */}
          <div className={ui.field}>
            <span className={ui.label}>{t('method_label')}</span>
            <div className={ui.segmented}>
              <button
                className={`${ui.segment} ${method === 'drip' ? ui.segmentActive : ''}`}
                aria-pressed={method === 'drip'}
                onClick={() => switchMethod('drip')}
              >
                {t('method_drip')}
              </button>
              <button
                className={`${ui.segment} ${method === 'espresso' ? ui.segmentActive : ''}`}
                aria-pressed={method === 'espresso'}
                onClick={() => switchMethod('espresso')}
              >
                {t('method_espresso')}
              </button>
            </div>
          </div>

          {/* dose */}
          <div className={ui.field}>
            <label className={ui.label} htmlFor="cy-dose">
              {t('label_bean')}
            </label>
            <input
              id="cy-dose"
              className={ui.input}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder={t('bean_placeholder')}
              aria-label={t('label_bean')}
            />
          </div>

          {/* ratio presets */}
          <div className={ui.field}>
            <span className={ui.label}>{t('label_ratio')}</span>
            <div className={s.ratio_grid}>
              {presets.map((p) => (
                <button
                  key={p.value}
                  className={`${ui.chip} ${s.ratio_btn} ${ratioSel === p.value ? ui.chipActive : ''}`}
                  aria-pressed={ratioSel === p.value}
                  onClick={() => selectPreset(p.value)}
                >
                  <span className={s.ratio_main}>1:{p.value}</span>
                  {p.suffix && <span className={s.ratio_sub}>{presetLabel(p)}</span>}
                </button>
              ))}
              <button
                className={`${ui.chip} ${s.ratio_btn} ${ratioSel === 'custom' ? ui.chipActive : ''}`}
                aria-pressed={ratioSel === 'custom'}
                onClick={selectCustom}
              >
                <span className={s.ratio_main}>1:?</span>
                <span className={s.ratio_sub}>{t('ratio_custom')}</span>
              </button>
            </div>
            {ratioSel === 'custom' && (
              <input
                className={ui.input}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={customRatio}
                onChange={(e) => onCustomChange(e.target.value)}
                placeholder={t('ratio_custom_placeholder')}
                aria-label={t('ratio_custom')}
                autoFocus
              />
            )}
            {method === 'drip' && <p className={ui.hint}>{t('sca_ratio_note')}</p>}
          </div>

          {/* pro-only inputs */}
          {mode === 'pro' && (
            <>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="cy-output">
                  {t('label_output')}
                </label>
                <input
                  id="cy-output"
                  className={ui.input}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder={t('output_placeholder')}
                  aria-label={t('label_output')}
                />
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="cy-tds">
                  {t('label_tds')}
                </label>
                <input
                  id="cy-tds"
                  className={ui.input}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={tds}
                  onChange={(e) => setTds(e.target.value)}
                  placeholder={t('tds_placeholder')}
                  aria-label={t('label_tds')}
                />
              </div>
            </>
          )}

          {!calc.doseValid && <div className={`${ui.notice} ${ui.red}`}>{t('input_error_dose')}</div>}
        </section>

        {/* ── Result panel (right) ── */}
        <section className={`${ui.card} ${s.panel} ${s.result_panel}`} aria-live="polite">
          {!hasResult ? (
            <div className={s.empty_result}>
              <span className={s.empty_result_icon}>☕</span>
              <span>{t('input_error_dose')}</span>
            </div>
          ) : (
            <>
              {/* target */}
              <div className={s.result_block}>
                <span className={s.result_label}>{targetLabel}</span>
                <span className={s.result_value}>
                  {Math.round(calc.target as number)}
                  <span className={s.result_unit}> g</span>
                </span>
              </div>

              {/* basic note */}
              {mode === 'basic' && <div className={s.basic_note}>{t('basic_mode_note')}</div>}

              {/* pro: yield + chart + feedback */}
              {mode === 'pro' && (
                <>
                  {calc.outputWarn && <div className={`${ui.notice} ${ui.amber}`}>{t('input_warn_output')}</div>}

                  {calc.unrealistic && (
                    <div className={`${ui.notice} ${ui.red}`}>{t('input_error_unrealistic')}</div>
                  )}

                  {calc.yieldPct !== null && !calc.unrealistic && (
                    <div className={s.yield_block}>
                      <span className={s.result_label}>{t('extract_yield')}</span>
                      <span className={s.result_value}>
                        {calc.yieldPct.toFixed(2)}
                        <span className={s.result_unit}> %</span>
                      </span>

                      {/* SCA chart */}
                      <div className={s.chart_wrap}>
                        <p className={s.chart_title}>{t('chart_title')}</p>
                        <svg
                          className={s.chart_svg}
                          viewBox="0 0 400 280"
                          preserveAspectRatio="xMidYMid meet"
                          role="img"
                          aria-label={t('chart_aria', {
                            yield: calc.yieldPct.toFixed(1),
                            tds: (calc.tdsNum ?? 0).toFixed(2),
                            zone: dotInGolden ? t('chart_zone_in') : t('chart_zone_out'),
                          })}
                        >
                          {/* golden zone */}
                          <rect
                            x={goldRect.x}
                            y={goldRect.y}
                            width={goldRect.w}
                            height={goldRect.h}
                            fill="#86efac"
                            fillOpacity="0.45"
                            stroke="#16a34a"
                            strokeOpacity="0.5"
                            strokeDasharray="4 3"
                          />
                          <text
                            x={goldRect.x + goldRect.w / 2}
                            y={goldRect.y + goldRect.h / 2 + 4}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#15803d"
                            fontWeight="700"
                          >
                            {t('chart_golden_zone')}
                          </text>

                          {/* axes */}
                          <line
                            x1={PLOT.left}
                            y1={PLOT.bottom}
                            x2={PLOT.right}
                            y2={PLOT.bottom}
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={PLOT.left}
                            y1={PLOT.top}
                            x2={PLOT.left}
                            y2={PLOT.bottom}
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                          />

                          {/* x ticks (yield) */}
                          {[14, 18, 22, 26].map((v) => (
                            <text
                              key={v}
                              x={xOf(v)}
                              y={PLOT.bottom + 18}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#94a3b8"
                            >
                              {v}%
                            </text>
                          ))}
                          {/* y ticks (tds) */}
                          {[scale.min, (scale.min + scale.max) / 2, scale.max].map((v) => (
                            <text
                              key={v}
                              x={PLOT.left - 6}
                              y={yOf(v) + 3}
                              textAnchor="end"
                              fontSize="10"
                              fill="#94a3b8"
                            >
                              {method === 'drip' ? v.toFixed(2) : v.toFixed(0)}
                            </text>
                          ))}

                          {/* axis labels */}
                          <text
                            x={(PLOT.left + PLOT.right) / 2}
                            y={278}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#64748b"
                            fontWeight="600"
                          >
                            {t('chart_axis_yield')}
                          </text>
                          <text
                            x={12}
                            y={(PLOT.top + PLOT.bottom) / 2}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#64748b"
                            fontWeight="600"
                            transform={`rotate(-90 12 ${(PLOT.top + PLOT.bottom) / 2})`}
                          >
                            {t('chart_axis_tds')}
                          </text>

                          {/* red dot */}
                          {calc.tdsNum !== null && (
                            <circle
                              cx={xOf(calc.yieldPct)}
                              cy={yOf(calc.tdsNum)}
                              r="7"
                              fill="#dc2626"
                              stroke="#fff"
                              strokeWidth="2.5"
                            />
                          )}
                        </svg>
                      </div>

                      {/* feedback */}
                      {calc.verdict && (
                        <div
                          className={`${ui.notice} ${s.feedback} ${
                            calc.verdict === 'under'
                              ? ui.amber
                              : calc.verdict === 'ideal'
                                ? ui.green
                                : ui.red
                          }`}
                        >
                          <span className={s.feedback_verdict}>{t(`verdict_${calc.verdict}`)}</span>
                          <span>{t(`feedback_${calc.verdict}`)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* share */}
              <button className={`${ui.button} ${ui.primary} ${ui.block}`} onClick={handleShare} aria-label={t('share_result_btn')}>
                {t('share_result_btn')}
              </button>
            </>
          )}
        </section>
      </div>

      {/* ── bottom sections ── */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/lifestyle/coffee-yield-calc" />

      {seo}

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
