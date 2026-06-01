'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Coffee } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './coffee-yield-calc.module.css';

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

export default function CoffeeYieldClient() {
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

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.icon_wrap}>
          <Coffee size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* ── Mode toggle ── */}
      <div className={s.toggle_row} role="tablist" aria-label={t('mode_label')}>
        <button
          role="tab"
          aria-selected={mode === 'basic'}
          className={`${s.toggle_btn} ${mode === 'basic' ? s.toggle_btn_active : ''}`}
          onClick={() => setMode('basic')}
        >
          {t('mode_basic')}
        </button>
        <button
          role="tab"
          aria-selected={mode === 'pro'}
          className={`${s.toggle_btn} ${mode === 'pro' ? s.toggle_btn_active : ''}`}
          onClick={() => setMode('pro')}
        >
          {t('mode_pro')}
        </button>
      </div>

      {/* ── 2-column ── */}
      <div className={s.layout}>
        {/* ── Input panel (left) ── */}
        <section className={s.panel} aria-label={t('method_label')}>
          {/* method toggle */}
          <div className={s.field}>
            <span className={s.field_label}>{t('method_label')}</span>
            <div className={s.method_row}>
              <button
                className={`${s.method_btn} ${method === 'drip' ? s.method_btn_active : ''}`}
                aria-pressed={method === 'drip'}
                onClick={() => switchMethod('drip')}
              >
                {t('method_drip')}
              </button>
              <button
                className={`${s.method_btn} ${method === 'espresso' ? s.method_btn_active : ''}`}
                aria-pressed={method === 'espresso'}
                onClick={() => switchMethod('espresso')}
              >
                {t('method_espresso')}
              </button>
            </div>
          </div>

          {/* dose */}
          <div className={s.field}>
            <label className={s.field_label} htmlFor="cy-dose">
              {t('label_bean')}
            </label>
            <input
              id="cy-dose"
              className={s.input}
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
          <div className={s.field}>
            <span className={s.field_label}>{t('label_ratio')}</span>
            <div className={s.ratio_grid}>
              {presets.map((p) => (
                <button
                  key={p.value}
                  className={`${s.ratio_btn} ${ratioSel === p.value ? s.ratio_btn_active : ''}`}
                  aria-pressed={ratioSel === p.value}
                  onClick={() => selectPreset(p.value)}
                >
                  <span className={s.ratio_main}>1:{p.value}</span>
                  {p.suffix && <span className={s.ratio_sub}>{presetLabel(p)}</span>}
                </button>
              ))}
              <button
                className={`${s.ratio_btn} ${ratioSel === 'custom' ? s.ratio_btn_active : ''}`}
                aria-pressed={ratioSel === 'custom'}
                onClick={selectCustom}
              >
                <span className={s.ratio_main}>1:?</span>
                <span className={s.ratio_sub}>{t('ratio_custom')}</span>
              </button>
            </div>
            {ratioSel === 'custom' && (
              <input
                className={s.input}
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
            {method === 'drip' && <p className={s.sca_note}>{t('sca_ratio_note')}</p>}
          </div>

          {/* pro-only inputs */}
          {mode === 'pro' && (
            <>
              <div className={s.field}>
                <label className={s.field_label} htmlFor="cy-output">
                  {t('label_output')}
                </label>
                <input
                  id="cy-output"
                  className={s.input}
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
              <div className={s.field}>
                <label className={s.field_label} htmlFor="cy-tds">
                  {t('label_tds')}
                </label>
                <input
                  id="cy-tds"
                  className={s.input}
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

          {!calc.doseValid && <div className={s.error_box}>{t('input_error_dose')}</div>}
        </section>

        {/* ── Result panel (right) ── */}
        <section className={`${s.panel} ${s.result_panel}`} aria-live="polite">
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
                  {calc.outputWarn && <div className={s.warn_box}>{t('input_warn_output')}</div>}

                  {calc.unrealistic && (
                    <div className={s.error_box}>{t('input_error_unrealistic')}</div>
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
                          className={`${s.feedback} ${
                            calc.verdict === 'under'
                              ? s.feedback_under
                              : calc.verdict === 'ideal'
                                ? s.feedback_ideal
                                : s.feedback_over
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
              <button className={s.share_btn} onClick={handleShare} aria-label={t('share_result_btn')}>
                {t('share_result_btn')}
              </button>
            </>
          )}
        </section>
      </div>

      {/* ── bottom sections ── */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/lifestyle/coffee-yield-calc" />
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '커피 브루잉 수율 계산기란 무엇인가요?',
          description:
            '커피 브루잉 수율 계산기는 전 세계 바리스타들의 표준인 SCA(스페셜티 커피 협회) 브루잉 컨트롤 차트 공식을 100% 브라우저 안에서 계산해주는 도구입니다. 서버 통신 없이 원두 도징량과 추출 비율만 입력하면 즉시 결과를 보여주며, 핸드드립을 선택하면 "부어야 할 목표 물 용량"을, 에스프레소를 선택하면 "타겟 최종 추출량"을 정확한 용어로 분기해 제공합니다. 이는 드립이 원두 대비 붓는 물(coffee-to-water) 기준인 반면 에스프레소는 추출된 액체 무게(dose-to-yield) 기준이라는 과학적 차이를 반영한 것입니다. 굴절계(TDS 측정기)를 보유한 분은 전문가 모드에서 최종 추출량과 TDS 농도를 입력해 진짜 추출 수율(%)을 계산하고, SCA 브루잉 컨트롤 차트 위에 내 커피의 좌표를 빨간 점으로 확인할 수 있습니다. 수율이 골든존(18~22%)을 벗어나면 과소·과다 추출 여부와 함께 분쇄도·물 온도·추출 시간 조절 가이드를 제공합니다. 매일 아침 홈카페 레시피의 일관성을 잡거나 카페 머신을 다이얼인할 때 엑셀 없이 쓰는 계량 도구입니다. 다만 로스팅 정도, 채널링 등 현장 변수로 실제 미각은 달라질 수 있으므로 보조 도구로 활용하시기 바랍니다.',
          useCases: [
            { icon: '☕', title: '아침 홈카페 레시피 점검', desc: '매일 원두를 바꿀 때마다 변하는 맛의 일관성을 잡기 위해, 저울에 잰 원두 무게만 입력하여 1:16 같은 국룰 비율의 정확한 물 가이드를 즉시 확인합니다.' },
            { icon: '👨‍🍳', title: '카페 바리스타 다이얼인', desc: '에스프레소 머신 세팅 시 리스트레토·룽고 샷의 목표 추출량과 수율 18~22%를 맞추기 위한 필수 계량 계산기로 활용해 샷 품질을 표준화합니다.' },
            { icon: '🧪', title: '스페셜티 TDS 굴절계 연동', desc: '전문 TDS 측정 장비를 보유한 로스터리나 바리스타가 정확한 추출 수율 점수를 확인하고 SCA 차트에 좌표를 기록하며 추출을 미세 조정할 때 사용합니다.' },
            { icon: '🌐', title: '글로벌 커피 커뮤니티 공유', desc: '영어 버전이 완벽 지원되어 해외 Reddit r/Coffee 매니아나 바리스타들이 레시피를 빌드할 때 엑셀 대신 쓰는 사이트로 링크 하나로 공유할 수 있습니다.' },
          ],
          steps: [
            { step: '모드와 추출 방식 선택', desc: '입문자/전문가 모드를 고르고 핸드드립·에스프레소 중 방식을 선택합니다. 방식에 따라 비율 프리셋과 결과 용어(물 양/추출량)가 자동으로 전환됩니다.' },
            { step: '원두량과 비율 입력', desc: '원두 도징량을 그램 단위로 입력하고 비율 프리셋을 선택하거나, 직접 입력 버튼으로 16.5 같은 소수점 비율을 칠 수 있습니다. 우측에 결과가 즉시 표시됩니다.' },
            { step: '전문가 모드 — TDS 입력', desc: '굴절계가 있다면 전문가 모드에서 최종 추출량과 TDS 측정값을 입력합니다. SCA 브루잉 컨트롤 차트에 내 커피의 좌표가 빨간 점으로 표시됩니다.' },
            { step: '바리스타 피드백 확인', desc: '계산된 수율이 골든존(18~22%)인지 확인하고, 과소·과다 추출 시 제공되는 분쇄도·물 온도·추출 시간 조절 가이드대로 다음 추출을 개선합니다.' },
          ],
          faqs: [
            { q: '이 계산기의 공식은 어디 기준인가요?', a: '전 세계 바리스타 표준인 SCA(스페셜티 커피 협회)의 브루잉 컨트롤 차트 공식을 기반으로 합니다. 골든존 수율 18~22%, 드립 TDS 1.15~1.35%는 SCA가 제시하는 이상적 추출 구간이며, 모든 계산은 사용자 브라우저 안에서만 처리되어 입력값이 서버로 전송되지 않습니다.' },
            { q: '에스프레소 1:2랑 드립 1:16은 같은 의미인가요?', a: '다릅니다. 드립의 1:16은 원두 1에 붓는 물 16을 의미하고, 에스프레소의 1:2는 원두 1에 추출된 액체 2를 의미합니다. 에스프레소는 물을 붓는 게 아니라 추출된 결과물 기준이라, 본 도구가 방식별로 결과 용어를 자동 구분합니다. 그래서 같은 계산식이라도 드립은 "부어야 할 물", 에스프레소는 "타겟 추출량"으로 표시됩니다.' },
            { q: 'TDS 측정기가 없는데 수율을 알 수 있나요?', a: '정확한 수율은 굴절계(TDS 측정기)가 필요합니다. 측정기가 없으면 입문자 모드에서 정확한 물 양 또는 추출량 계산을 제공하며, 비율 기반 레시피 일관성 유지에 집중하시길 권장합니다. 가상 추정 수율은 부정확하므로 제공하지 않습니다. 측정기를 보유했다면 전문가 모드에서 진짜 수율과 차트를 확인하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 로스팅 정도, 채널링, 물의 미네랄 함량 등 현장 변수로 실제 미각은 다를 수 있으므로 보조 도구로 활용하시고, 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Coffee Extraction Calculator?',
          description:
            'The Coffee Extraction Calculator computes the SCA (Specialty Coffee Association) Brewing Control Chart formulas — the global barista standard — entirely inside your browser with zero server communication. Enter your coffee dose and brew ratio, and it instantly shows the result, correctly branching the terminology: choosing pour-over gives you the "target water to pour," while espresso gives you the "target final yield." This reflects the scientific difference that pour-over is measured coffee-to-water (the water you pour in), whereas espresso is measured dose-to-yield (the weight of liquid extracted), since an espresso machine extracts rather than pours. If you own a refractometer (TDS meter), Pro mode lets you enter the final yield and TDS to calculate the real extraction yield (%) and plot your coffee as a red dot on the SCA Brewing Control Chart. When the yield falls outside the golden zone (18–22%), the tool tells you whether it is under- or over-extracted and gives grind, water-temperature, and time adjustment guidance. It is the measuring tool you reach for instead of a spreadsheet when dialing in your morning home-cafe recipe or a cafe machine. Note that roast level, channeling, and other real-world variables can change the actual taste, so use it as an aid.',
          useCases: [
            { icon: '☕', title: 'Morning Home-Cafe Check', desc: 'To keep taste consistent as you switch beans daily, just enter the dose you weighed and instantly get the exact water guide for a classic ratio like 1:16.' },
            { icon: '👨‍🍳', title: 'Cafe Barista Dial-In', desc: 'Use it as the essential measuring calculator to hit target yields for ristretto and lungo shots and land the 18–22% extraction window, standardizing shot quality.' },
            { icon: '🧪', title: 'Specialty TDS Refractometer', desc: 'Roasteries and baristas with professional TDS gear can check the precise extraction yield score, plot coordinates on the SCA chart, and fine-tune extraction.' },
            { icon: '🌐', title: 'Global Coffee Community', desc: 'With full English support, r/Coffee enthusiasts and baristas worldwide can use it instead of a spreadsheet when building recipes and share it with a single link.' },
          ],
          steps: [
            { step: 'Pick mode and brew method', desc: 'Choose Beginner or Pro mode and select pour-over or espresso. The ratio presets and result terminology (water vs yield) switch automatically based on the method.' },
            { step: 'Enter dose and ratio', desc: 'Enter the coffee dose in grams and pick a ratio preset, or use the custom button to type a decimal ratio like 16.5. The result appears instantly on the right.' },
            { step: 'Pro mode — enter TDS', desc: 'If you have a refractometer, enter the final yield and TDS reading in Pro mode. Your coffee is plotted as a red dot on the SCA Brewing Control Chart.' },
            { step: 'Check barista feedback', desc: 'See whether the calculated yield lands in the golden zone (18–22%), and follow the grind, water-temperature, and time guidance to improve your next brew.' },
          ],
          faqs: [
            { q: 'What standard are these formulas based on?', a: 'They are based on the Brewing Control Chart from the SCA (Specialty Coffee Association), the global barista standard. The golden-zone yield of 18–22% and drip TDS of 1.15–1.35% are the ideal extraction ranges the SCA defines, and every calculation runs in your browser, so your inputs are never sent to a server.' },
            { q: 'Are espresso 1:2 and drip 1:16 the same idea?', a: 'No. In drip, 1:16 means 1 part coffee to 16 parts poured water; in espresso, 1:2 means 1 part coffee to 2 parts extracted liquid. Espresso is measured by the extracted output, not poured water, so this tool branches the terminology automatically — drip shows "water to pour" while espresso shows "target yield," even when the arithmetic is the same.' },
            { q: 'Can I know the yield without a TDS meter?', a: 'Accurate yield requires a refractometer (TDS meter). Without one, Beginner mode gives you precise water or yield calculations and we recommend focusing on ratio-based recipe consistency. We do not provide a fake estimated yield because it would be inaccurate. If you own a meter, use Pro mode to see the real yield and chart.' },
            { q: 'Can I use this result as official data?', a: 'The results are for reference only. Roast level, channeling, water mineral content, and other real-world variables can change the actual taste, so use it as an aid and consult a professional or official source for accurate figures.' },
          ],
        }}
      />

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
