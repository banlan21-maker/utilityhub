'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Ruler, Copy } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './cable-tray-calc.module.css';

// ── Constants ──────────────────────────────────────
const TRAY_WIDTHS = [100, 150, 200, 300, 400, 450, 600];
const TRAY_HEIGHTS = [60, 80, 100, 120, 150];

const BASE_INTERVAL: Record<number, number> = {
  100: 1.5, 150: 1.5, 200: 1.5,
  300: 2.0, 400: 2.0, 450: 2.0,
  600: 1.5,
};

const ENV_FACTOR: Record<string, number> = {
  indoor: 1.0,
  outdoor: 0.8,
  vibration: 0.7,
};

function getAngleFactor(angle: number): number {
  if (angle <= 10) return 1.0;
  if (angle <= 20) return 0.85;
  if (angle <= 30) return 0.75;
  if (angle <= 45) return 0.60;
  if (angle < 90) return 0.50;
  return 0.40;
}

function getElbowRec(angle: number, isKo: boolean): { label: string; warning: string | null } {
  if (angle >= 90) return { label: isKo ? '수직 구간 — 엘보 불필요' : 'Vertical Riser — No elbow needed', warning: null };
  if (angle <= 0) return { label: '—', warning: null };
  if (angle <= 10) return { label: '10° 엘보', warning: null };
  if (angle <= 15) return { label: '15° 엘보', warning: null };
  if (angle <= 22.5) return { label: '22.5° 엘보', warning: null };
  if (angle <= 30) return { label: '30° 엘보', warning: null };
  if (angle <= 45) return { label: '45° 엘보', warning: null };
  return {
    label: isKo ? '⚠️ 분할 시공 권장' : '⚠️ Split installation recommended',
    warning: isKo
      ? '45° 초과 구간입니다. 45° 엘보 2개 이상 조합 또는 분할 시공을 권장합니다.'
      : 'Angle exceeds 45°. Use two or more 45° elbows or split the installation.',
  };
}

// ── SVG Fabrication Diagram ────────────────────────
function FabSVG({
  angle, vCutHalf, vCutFull, markingA, refDim, isKo,
}: {
  angle: number; vCutHalf: number; vCutFull: number;
  markingA: number; refDim: number; isKo: boolean;
}) {
  const VW = 400, VH = 310;
  const trayX = 50, trayY = 100, trayW = 300, trayH = 80;
  const cx = trayX + trayW / 2;

  if (angle >= 90) {
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 600 }}
        aria-label={isKo ? '수직 구간 도면' : 'Vertical riser diagram'}>
        <rect x={cx - 24} y={30} width={48} height={VH - 60}
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="6" />
        <text x={cx} y={VH / 2 - 8} textAnchor="middle" fontSize="14" fill="#64748b" fontWeight="700">
          {isKo ? '수직 구간' : 'Vertical Riser'}
        </text>
        <text x={cx} y={VH / 2 + 12} textAnchor="middle" fontSize="11" fill="#94a3b8">
          {isKo ? 'V-컷 불필요, 직각 절단' : 'No V-cut — straight cut'}
        </text>
      </svg>
    );
  }

  // Scale: half of refDim → half of trayW (150px)
  const scalePx = (trayW / 2) / refDim;
  const halfPx = Math.min(vCutHalf * scalePx, trayW / 2 - 6);
  const boltPx = Math.min(70 * scalePx, trayW / 2 - 6);
  const vtDepth = Math.min(trayH * 0.55, trayH - 8); // V triangle depth

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 600 }}
      aria-label={isKo ? 'V-컷 가공 도면' : 'V-cut fabrication diagram'}
      overflow="visible">

      {/* Tray body */}
      <rect x={trayX} y={trayY} width={trayW} height={trayH}
        fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="4" />

      {/* V-cut removed area */}
      <polygon
        points={`${cx - halfPx},${trayY} ${cx + halfPx},${trayY} ${cx},${trayY + vtDepth}`}
        fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />

      {/* Center reference line (blue dashed) */}
      <line x1={cx} y1={trayY - 18} x2={cx} y2={trayY + trayH + 18}
        stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 3" />

      {/* V-cut left line */}
      <line x1={cx - halfPx} y1={trayY - 10} x2={cx - halfPx} y2={trayY + trayH + 10}
        stroke="#ef4444" strokeWidth="2" />
      {/* V-cut right line */}
      <line x1={cx + halfPx} y1={trayY - 10} x2={cx + halfPx} y2={trayY + trayH + 10}
        stroke="#ef4444" strokeWidth="2" />

      {/* Bolt holes */}
      <circle cx={cx - boltPx} cy={trayY + trayH / 2} r={7}
        fill="none" stroke="#ef4444" strokeWidth="2" />
      <circle cx={cx + boltPx} cy={trayY + trayH / 2} r={7}
        fill="none" stroke="#ef4444" strokeWidth="2" />

      {/* Dimension line top: vCutFull */}
      <line x1={cx - halfPx} y1={trayY - 28} x2={cx + halfPx} y2={trayY - 28}
        stroke="#64748b" strokeWidth="1" />
      <line x1={cx - halfPx} y1={trayY - 32} x2={cx - halfPx} y2={trayY - 10}
        stroke="#64748b" strokeWidth="1" />
      <line x1={cx + halfPx} y1={trayY - 32} x2={cx + halfPx} y2={trayY - 10}
        stroke="#64748b" strokeWidth="1" />
      {/* 전체 폭 레이블 — 치수선 위에 단독 표시 */}
      <text x={cx} y={trayY - 33} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="800">
        {vCutFull.toFixed(1)}mm
      </text>

      {/* 한쪽 레이블 — 치수선 바로 아래, 좌우 분리 */}
      {halfPx > 28 && (
        <>
          <text x={cx - halfPx / 2} y={trayY - 16} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {vCutHalf.toFixed(1)}
          </text>
          <text x={cx + halfPx / 2} y={trayY - 16} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {vCutHalf.toFixed(1)}
          </text>
        </>
      )}

      {/* ── 하단 영역: 홀 관련 치수 (트레이 아래) ── */}
      {/* Ø14 labels */}
      <text x={cx - boltPx} y={trayY + trayH + 16} textAnchor="middle" fontSize="10" fill="#ef4444">Ø14</text>
      <text x={cx + boltPx} y={trayY + trayH + 16} textAnchor="middle" fontSize="10" fill="#ef4444">Ø14</text>

      {/* 70mm dimension line (left: center → left bolt) */}
      <line x1={cx} y1={trayY + trayH + 28} x2={cx - boltPx} y2={trayY + trayH + 28}
        stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 2" />
      <line x1={cx}        y1={trayY + trayH + 23} x2={cx}        y2={trayY + trayH + 33} stroke="#f97316" strokeWidth="1.5" />
      <line x1={cx-boltPx} y1={trayY + trayH + 23} x2={cx-boltPx} y2={trayY + trayH + 33} stroke="#f97316" strokeWidth="1.5" />
      <text x={cx - boltPx / 2} y={trayY + trayH + 22} textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="700">70mm</text>

      {/* 70mm dimension line (right: center → right bolt) */}
      <line x1={cx} y1={trayY + trayH + 28} x2={cx + boltPx} y2={trayY + trayH + 28}
        stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 2" />
      <line x1={cx+boltPx} y1={trayY + trayH + 23} x2={cx+boltPx} y2={trayY + trayH + 33} stroke="#f97316" strokeWidth="1.5" />
      <text x={cx + boltPx / 2} y={trayY + trayH + 22} textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="700">70mm</text>

      {/* Center label */}
      <text x={cx} y={trayY + trayH + 46} textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="600">
        {isKo ? '기준선 (중심)' : 'Center ref.'}
      </text>

      {/* Marking A at bottom */}
      <text x={VW / 2} y={VH - 6} textAnchor="middle" fontSize="11" fill="#475569">
        {isKo ? `마킹 간격 A: ${markingA.toFixed(0)}mm` : `Marking Interval A: ${markingA.toFixed(0)}mm`}
      </text>
    </svg>
  );
}

// ── Main component ─────────────────────────────────
export default function CableTrayCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // STEP 1
  const [direction, setDirection] = useState<'vertical' | 'horizontal' | null>(null);
  const [trayWidth, setTrayWidth] = useState<number>(200);
  const [trayHeight, setTrayHeight] = useState<number>(100);

  // STEP 2
  const [inputMode, setInputMode] = useState<'preset' | 'manual'>('preset');
  const [presetAngle, setPresetAngle] = useState<30 | 45 | 60 | null>(null);
  const [presetH, setPresetH] = useState<string>('');
  const [manualH, setManualH] = useState<string>('');
  const [manualL, setManualL] = useState<string>('');

  // STEP 6
  const [environment, setEnvironment] = useState<string>('indoor');
  const [copyMsg, setCopyMsg] = useState<string>('');

  // ── Derived calculations ──
  const step1Done = direction !== null;

  let angle = 0;
  let H = 0;
  let L = 0;
  let slopeLength = 0;
  let isVertical = false;
  let hasValidCalc = false;

  if (step1Done) {
    if (inputMode === 'preset' && presetAngle !== null && presetH.trim() !== '') {
      H = Math.max(0, parseFloat(presetH) || 0);
      if (H > 0) {
        angle = presetAngle;
        const rad = angle * Math.PI / 180;
        L = H / Math.tan(rad);
        slopeLength = H / Math.sin(rad);
        hasValidCalc = true;
      }
    } else if (inputMode === 'manual' && manualH.trim() !== '' && manualL.trim() !== '') {
      H = Math.max(0, parseFloat(manualH) || 0);
      L = Math.max(0, parseFloat(manualL) || 0);
      isVertical = L === 0;
      if (isVertical) {
        angle = 90;
        slopeLength = H;
      } else {
        angle = Math.atan(H / L) * (180 / Math.PI);
        slopeLength = Math.sqrt(L * L + H * H);
      }
      hasValidCalc = H > 0 || L > 0;
    }
  }

  // V-컷 계산
  const refDim = direction === 'vertical' ? trayHeight : trayWidth;
  const vCutHalf = (angle > 0 && angle < 90)
    ? refDim * Math.tan((angle / 2) * Math.PI / 180)
    : 0;
  const vCutFull = vCutHalf * 2;
  const markingA = slopeLength * 1000; // m → mm

  // 행거 간격
  const hangerInterval = hasValidCalc
    ? Number((BASE_INTERVAL[trayWidth] * getAngleFactor(angle) * ENV_FACTOR[environment]).toFixed(2))
    : 0;

  const elbow = getElbowRec(angle, isKo);
  const warn45 = angle > 45 && angle < 90;
  const warnVcut80 = vCutFull > refDim * 0.8 && angle > 0 && angle < 90;

  // 결과 복사
  const handleCopy = async () => {
    const lines = [
      `[${isKo ? '케이블 트레이 경사 & 가공 계산 결과' : 'Cable Tray Slope & Fabrication Results'}]`,
      `${isKo ? '꺾임 방향' : 'Direction'}: ${direction === 'vertical' ? (isKo ? '상하 꺾임' : 'Vertical') : (isKo ? '좌우 꺾임' : 'Horizontal')}`,
      `${isKo ? '트레이 폭' : 'Tray Width'}: ${trayWidth}mm  |  ${isKo ? '옆면 높이' : 'Side Height'}: ${trayHeight}mm`,
      `${isKo ? '경사각' : 'Angle'}: ${angle.toFixed(1)}°`,
      `${isKo ? '사선 길이' : 'Slope Length'}: ${slopeLength.toFixed(2)}m`,
      `${isKo ? '권장 엘보' : 'Elbow'}: ${elbow.label}`,
      `${isKo ? 'V-컷 한쪽' : 'V-cut half'}: ${vCutHalf.toFixed(1)}mm`,
      `${isKo ? 'V-컷 전체' : 'V-cut full'}: ${vCutFull.toFixed(1)}mm`,
      `${isKo ? '마킹 간격 A' : 'Marking A'}: ${markingA.toFixed(0)}mm`,
      `${isKo ? '타공 위치' : 'Bolt holes'}: ±70mm / Ø14mm`,
      `${isKo ? '행거 간격' : 'Hanger spacing'}: ${hangerInterval.toFixed(2)}m`,
      `📐 theutilhub.com/utilities/utility/cable-tray-calc`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMsg(isKo ? '✓ 복사됨' : '✓ Copied');
    } catch {
      setCopyMsg(isKo ? '❌ 복사 실패' : '❌ Copy failed');
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const titleStr = isKo ? '케이블 트레이 경사 & 가공 계산기' : 'Cable Tray Slope & Fabrication Calculator';
  const descStr = isKo
    ? 'V-컷 절단폭, 타공 위치, 사선 길이, 행거 간격을 즉시 계산. SVG 가공 도면으로 현장에서 바로 마킹.'
    : 'Calculate V-cut dimensions, bolt positions, slope length, and hanger spacing. SVG diagram for on-site marking.';

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}>
          <Ruler size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      {/* ── STEP 1 ── */}
      <section className={s.step_card}>
        <div className={s.step_label}>STEP 1</div>
        <h2 className={s.step_title}>
          {isKo ? '꺾임 방향 + 트레이 규격' : 'Bend Direction + Tray Specs'}
        </h2>

        <div className={s.direction_grid}>
          <button
            className={`${s.direction_card} ${direction === 'vertical' ? s.direction_active : ''}`}
            onClick={() => setDirection('vertical')}
            aria-label={isKo ? '상하 꺾임 선택' : 'Select vertical bend'}
          >
            <span className={s.dir_icon}>⬆️⬇️</span>
            <span className={s.dir_label}>{isKo ? '상하 꺾임 (수직)' : 'Vertical Bend'}</span>
            <span className={s.dir_desc}>
              {isKo ? '트레이가 위아래로 경사지는 구간' : 'Tray slopes up or down'}
            </span>
          </button>
          <button
            className={`${s.direction_card} ${direction === 'horizontal' ? s.direction_active : ''}`}
            onClick={() => setDirection('horizontal')}
            aria-label={isKo ? '좌우 꺾임 선택' : 'Select horizontal bend'}
          >
            <span className={s.dir_icon}>⬅️➡️</span>
            <span className={s.dir_label}>{isKo ? '좌우 꺾임 (수평)' : 'Horizontal Bend'}</span>
            <span className={s.dir_desc}>
              {isKo ? '트레이가 평면에서 방향을 바꾸는 구간' : 'Tray changes direction on a flat plane'}
            </span>
          </button>
        </div>

        <div className={s.spec_grid}>
          <div>
            <label className={s.field_label}>{isKo ? '트레이 폭 (mm)' : 'Tray Width (mm)'}</label>
            <select className={s.select_field} value={trayWidth}
              onChange={e => setTrayWidth(Number(e.target.value))}
              aria-label={isKo ? '트레이 폭 선택' : 'Select tray width'}>
              {TRAY_WIDTHS.map(w => <option key={w} value={w}>{w}mm</option>)}
            </select>
          </div>
          <div>
            <label className={s.field_label}>{isKo ? '옆면 높이 (mm)' : 'Side Height (mm)'}</label>
            <select className={s.select_field} value={trayHeight}
              onChange={e => setTrayHeight(Number(e.target.value))}
              aria-label={isKo ? '옆면 높이 선택' : 'Select side height'}>
              {TRAY_HEIGHTS.map(h => <option key={h} value={h}>{h}mm</option>)}
            </select>
            <p className={s.field_hint}>
              {isKo ? '측면 레일 높이 (현장 보통 100mm)' : 'Side rail height (usually 100mm)'}
            </p>
          </div>
        </div>
      </section>

      {/* ── STEP 2 ── */}
      {step1Done && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 2</div>
          <h2 className={s.step_title}>{isKo ? '각도 입력' : 'Angle Input'}</h2>

          <div className={s.mode_toggle}>
            <button
              className={`${s.mode_btn} ${inputMode === 'preset' ? s.mode_active : ''}`}
              onClick={() => setInputMode('preset')}
              aria-label={isKo ? '프리셋 모드' : 'Preset mode'}
            >
              {isKo ? '프리셋' : 'Preset'}
            </button>
            <button
              className={`${s.mode_btn} ${inputMode === 'manual' ? s.mode_active : ''}`}
              onClick={() => setInputMode('manual')}
              aria-label={isKo ? '수동 입력 모드' : 'Manual input mode'}
            >
              {isKo ? '수동 입력' : 'Manual'}
            </button>
          </div>

          {inputMode === 'preset' ? (
            <>
              <div className={s.preset_grid}>
                {([30, 45, 60] as const).map(a => (
                  <button
                    key={a}
                    className={`${s.preset_btn} ${presetAngle === a ? s.preset_active : ''}`}
                    onClick={() => setPresetAngle(a)}
                    aria-label={`${a}도 선택`}
                  >
                    {a}°
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <label className={s.field_label}>{isKo ? '높이 H (m)' : 'Height H (m)'}</label>
                <input
                  type="number" step="0.01" min="0"
                  placeholder={isKo ? '예: 0.25' : 'e.g. 0.25'}
                  className={s.field_input}
                  value={presetH}
                  onChange={e => setPresetH(e.target.value)}
                  aria-label={isKo ? '높이 입력' : 'Height input'}
                />
              </div>
            </>
          ) : (
            <div className={s.spec_grid}>
              <div>
                <label className={s.field_label}>{isKo ? '높이 H (m)' : 'Height H (m)'}</label>
                <input
                  type="number" step="0.01" min="0"
                  placeholder={isKo ? '예: 0.25' : 'e.g. 0.25'}
                  className={s.field_input}
                  value={manualH}
                  onChange={e => setManualH(e.target.value)}
                  aria-label={isKo ? '높이 입력' : 'Height input'}
                />
              </div>
              <div>
                <label className={s.field_label}>{isKo ? '수평 거리 L (m)' : 'Horizontal L (m)'}</label>
                <input
                  type="number" step="0.01" min="0"
                  placeholder={isKo ? '예: 0.43' : 'e.g. 0.43'}
                  className={s.field_input}
                  value={manualL}
                  onChange={e => setManualL(e.target.value)}
                  aria-label={isKo ? '수평 거리 입력' : 'Horizontal distance input'}
                />
                <p className={s.field_hint}>
                  {isKo ? '수직 상승 구간은 L에 0 입력' : 'Enter 0 for vertical riser'}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── STEP 3 ── */}
      {step1Done && hasValidCalc && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 3</div>
          <h2 className={s.step_title}>{isKo ? '경사 계산 결과' : 'Slope Results'}</h2>

          {isVertical && (
            <div className={s.warn_box}>
              ⚠️ {isKo
                ? '수직 상승/하강 구간 (Vertical Riser)입니다.'
                : 'Vertical Riser segment.'}
            </div>
          )}

          <div className={s.result_big_grid}>
            <div className={s.result_big}>
              <div>
                <span className={s.result_num}>{angle.toFixed(1)}</span>
                <span className={s.result_unit}>°</span>
              </div>
              <div className={s.result_label}>{isKo ? '경사각' : 'Slope Angle'}</div>
            </div>
            <div className={s.result_big}>
              <div>
                <span className={s.result_num}>{slopeLength.toFixed(2)}</span>
                <span className={s.result_unit}>m</span>
              </div>
              <div className={s.result_label}>{isKo ? '사선 길이' : 'Slope Length'}</div>
            </div>
          </div>

          <div className={s.result_sub_grid}>
            <div className={s.result_sub}>
              <span>{isKo ? '수평 거리' : 'Horizontal'}</span>
              <strong>{L.toFixed(2)}m</strong>
            </div>
            <div className={s.result_sub}>
              <span>{isKo ? '높이 차' : 'Height Diff'}</span>
              <strong>{H.toFixed(2)}m</strong>
            </div>
            <div className={s.result_sub}>
              <span>{isKo ? '5% 여유 주문량' : '+5% order qty'}</span>
              <strong>{(slopeLength * 1.05).toFixed(2)}m</strong>
            </div>
            <div className={s.result_sub}>
              <span>{isKo ? '10% 여유 주문량' : '+10% order qty'}</span>
              <strong>{(slopeLength * 1.10).toFixed(2)}m</strong>
            </div>
          </div>

          <div className={s.elbow_row}>
            <span className={s.field_label}>{isKo ? '권장 엘보 규격' : 'Recommended Elbow'}</span>
            <span className={s.elbow_badge}>{elbow.label}</span>
          </div>
          {elbow.warning && <div className={s.warn_box} style={{ marginTop: '0.75rem' }}>{elbow.warning}</div>}
        </section>
      )}

      {/* ── STEP 4 ── */}
      {step1Done && hasValidCalc && !isVertical && angle > 0 && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 4</div>
          <h2 className={s.step_title}>{isKo ? 'V-컷 가공 수치' : 'V-Cut Fabrication Dimensions'}</h2>

          <p className={s.step_hint}>
            {isKo
              ? `기준 치수: ${direction === 'vertical' ? '옆면 높이' : '트레이 폭'} ${refDim}mm`
              : `Reference: ${direction === 'vertical' ? 'Side height' : 'Tray width'} ${refDim}mm`}
          </p>

          <div className={s.vcut_grid}>
            <div className={s.vcut_card}>
              <div className={s.vcut_num} style={{ color: '#ef4444' }}>{vCutHalf.toFixed(1)}</div>
              <div className={s.vcut_unit}>mm</div>
              <div className={s.vcut_label}>{isKo ? '기준선 한쪽' : 'Half width'}</div>
              <div className={s.vcut_badge}>{isKo ? '★ 마킹 핵심' : '★ Key mark'}</div>
            </div>
            <div className={s.vcut_card}>
              <div className={s.vcut_num}>{vCutFull.toFixed(1)}</div>
              <div className={s.vcut_unit}>mm</div>
              <div className={s.vcut_label}>{isKo ? 'V-컷 전체 폭' : 'Full V-cut width'}</div>
            </div>
            <div className={s.vcut_card}>
              <div className={s.vcut_num}>{markingA.toFixed(0)}</div>
              <div className={s.vcut_unit}>mm</div>
              <div className={s.vcut_label}>{isKo ? '마킹 간격 A' : 'Marking interval A'}</div>
            </div>
            <div className={s.vcut_card}>
              <div className={s.vcut_num}>±70</div>
              <div className={s.vcut_unit}>mm / Ø14</div>
              <div className={s.vcut_label}>{isKo ? '타공 위치 (기본값)' : 'Bolt position (default)'}</div>
            </div>
          </div>

          <p className={s.step_hint} style={{ marginTop: '0.25rem' }}>
            {isKo
              ? '※ 타공 위치(±70mm)와 홀 크기(Ø14)는 현장 볼트 규격(M10~M16)에 따라 조정하세요.'
              : '※ Adjust bolt position (±70mm) and hole size (Ø14) to match your site bolt spec (M10–M16).'}
          </p>

          {direction === 'vertical' && (
            <div className={s.warn_box}>
              ⚠️ {isKo
                ? '수직 꺾임 시 트레이 하단 날개(플랜지)는 절대 절단하지 마세요. 케이블 처짐 및 구조 약화 위험.'
                : 'Never cut the bottom flange on vertical bends. Risk of cable sag and structural weakening.'}
            </div>
          )}
          {warn45 && (
            <div className={s.warn_box}>
              ⚠️ {isKo
                ? '45° 초과 각도는 단일 V-컷이 어렵습니다. 45° 2회 분할 시공을 권장합니다.'
                : 'V-cut is not practical above 45°. Use two 45° cuts instead.'}
            </div>
          )}
          {warnVcut80 && (
            <div className={s.warn_box}>
              ⚠️ {isKo
                ? 'V-컷 폭이 기준 치수의 80%를 초과합니다. 재료가 약해질 수 있으니 주의하세요.'
                : 'V-cut width exceeds 80% of the reference dimension. Material may be weakened.'}
            </div>
          )}
        </section>
      )}

      {/* ── STEP 5 ── */}
      {step1Done && hasValidCalc && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 5</div>
          <h2 className={s.step_title}>{isKo ? 'SVG 가공 도면' : 'Fabrication Diagram'}</h2>
          <p className={s.step_hint}>
            {isKo
              ? '줄자로 기준선에서 수치를 재고 바로 마킹하세요.'
              : 'Measure from the center line and mark directly on the tray.'}
          </p>
          <div className={s.svg_wrap}>
            <FabSVG
              angle={angle}
              vCutHalf={vCutHalf}
              vCutFull={vCutFull}
              markingA={markingA}
              refDim={refDim}
              isKo={isKo}
            />
          </div>
        </section>
      )}

      {/* ── STEP 6 ── */}
      {step1Done && hasValidCalc && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 6</div>
          <h2 className={s.step_title}>{isKo ? '행거 간격 계산' : 'Hanger Spacing'}</h2>

          <div className={s.radio_group}>
            {([
              ['indoor',    isKo ? '실내 일반'      : 'Indoor (standard)',     '× 1.0'],
              ['outdoor',   isKo ? '실외·부식 환경' : 'Outdoor / Corrosive',   '× 0.8'],
              ['vibration', isKo ? '진동 있음'       : 'Vibration present',    '× 0.7'],
            ] as const).map(([val, label, factor]) => (
              <label
                key={val}
                className={`${s.radio_label} ${environment === val ? s.radio_active : ''}`}
              >
                <input
                  type="radio" name="env" value={val}
                  checked={environment === val}
                  onChange={() => setEnvironment(val)}
                  className={s.radio_input}
                  aria-label={label}
                />
                <span className={s.radio_text}>{label}</span>
                <span className={s.radio_factor}>{factor}</span>
              </label>
            ))}
          </div>

          <div className={s.result_big} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span className={s.result_num}>{hangerInterval.toFixed(2)}</span>
            <span className={s.result_unit}>m</span>
            <div className={s.result_label} style={{ marginTop: '0.25rem' }}>
              {isKo ? '권장 행거 간격' : 'Recommended Hanger Spacing'}
            </div>
          </div>

          <div className={s.result_sub_grid} style={{ marginTop: '1rem' }}>
            <div className={s.result_sub}>
              <span>{isKo ? '트레이 폭' : 'Tray width'}</span>
              <strong>{trayWidth}mm</strong>
            </div>
            <div className={s.result_sub}>
              <span>{isKo ? '기본 간격' : 'Base spacing'}</span>
              <strong>{BASE_INTERVAL[trayWidth]}m</strong>
            </div>
            <div className={s.result_sub}>
              <span>{isKo ? '경사각 계수' : 'Angle factor'}</span>
              <strong>{getAngleFactor(angle)}</strong>
            </div>
            <div className={s.result_sub}>
              <span>{isKo ? '환경 계수' : 'Env. factor'}</span>
              <strong>{ENV_FACTOR[environment]}</strong>
            </div>
          </div>

          <button
            className={s.copy_btn}
            onClick={handleCopy}
            aria-label={isKo ? '전체 결과 복사' : 'Copy all results'}
          >
            <Copy size={14} />
            {isKo ? '전체 결과 복사' : 'Copy all results'}
          </button>
          {copyMsg && (
            <p className={`${s.copy_msg} ${copyMsg.includes('❌') ? s.copy_msg_fail : ''}`}>
              {copyMsg}
            </p>
          )}
        </section>
      )}

      {/* Bottom sections */}
      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utility/cable-tray-calc" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
        AD
      </div>
      <SeoSection
        ko={{
          title: '케이블 트레이 경사 & 가공 계산기란 무엇인가요?',
          description: '케이블 트레이 경사 & 가공 계산기는 전기공사 현장에서 케이블 트레이를 경사 구간에 직접 가공할 때 필요한 모든 수치를 즉시 제공하는 실무 도구입니다. 현장 국룰 각도인 30°·45°·60° 프리셋 버튼 하나로 V-컷 절단폭, 타공 위치, 마킹 간격을 자동 산출하며, SVG 가공 도면으로 줄자를 대고 바로 마킹할 수 있습니다. 상하 꺾임과 좌우 꺾임을 구분하여 각각 정확한 V-컷 공식을 적용하고, 수직 구간과 45° 초과 분할 시공 경고도 자동으로 안내합니다. 행거 간격은 트레이 폭, 경사각, 설치 환경을 모두 고려한 KEC 실무 기준으로 산출합니다. 스마트폰으로도 편리하게 사용할 수 있도록 단일 스크롤 구조로 설계되어 현장에서 빠르게 확인하고 결과를 복사해 동료와 공유할 수 있습니다.',
          useCases: [
            { icon: '✂️', title: 'V-컷 가공 수치 즉시 산출', desc: '현장에서 그라인더로 V-컷을 넣기 전, 기준선 한쪽과 전체 절단폭을 즉시 계산합니다. 상하/좌우 꺾임 방향에 따라 올바른 기준 치수(옆면 높이 또는 트레이 폭)를 자동 선택합니다.' },
            { icon: '📐', title: 'SVG 도면으로 현장 마킹', desc: 'SVG 가공 도면에 V-컷 위치, 타공 원(Ø14), 기준선이 시각적으로 표시되어 스마트폰 화면을 보며 줄자를 대고 바로 마킹할 수 있습니다. 도면 인쇄나 별도 앱이 필요 없습니다.' },
            { icon: '📏', title: '사선 길이 및 엘보 규격 확인', desc: '경사각을 직접 계산하기 어려운 현장에서 높이와 거리만 입력하면 사선 길이와 10°·15°·22.5°·30°·45° 중 적합한 엘보 규격을 자동으로 추천합니다.' },
            { icon: '🔩', title: '행거 간격 설치 계획 수립', desc: '트레이 폭, 경사각, 실내/실외/진동 환경 계수를 조합해 KEC 기준 권장 행거 간격을 즉시 산출합니다. 전체 결과를 한 번에 복사해 현장 팀과 즉시 공유할 수 있습니다.' },
          ],
          steps: [
            { step: 'STEP 1 — 방향 & 규격 선택', desc: '상하 꺾임(수직) 또는 좌우 꺾임(수평) 중 하나를 선택하고, 트레이 폭과 옆면 높이를 셀렉트에서 고릅니다. V-컷 기준 치수가 이 선택에 따라 자동 결정됩니다.' },
            { step: 'STEP 2 — 각도 입력', desc: '프리셋 모드에서 30°/45°/60° 중 하나를 선택하고 높이 H를 입력하면 사선 길이와 수평 거리가 자동 산출됩니다. 수동 모드에서는 실측 H와 L을 직접 입력하고, L=0이면 수직 구간으로 처리됩니다.' },
            { step: 'STEP 3~5 — 결과 확인 & 도면', desc: 'STEP 3에서 경사각, 사선 길이, 엘보 규격을, STEP 4에서 V-컷 한쪽·전체·마킹 간격 A·타공 위치를 확인합니다. STEP 5 SVG 도면을 보며 트레이에 줄자로 직접 마킹하세요.' },
            { step: 'STEP 6 — 행거 간격 & 결과 복사', desc: '설치 환경(실내/실외/진동)을 선택하면 KEC 기준 행거 간격이 즉시 계산됩니다. 하단 "전체 결과 복사" 버튼으로 모든 수치를 클립보드에 복사해 동료와 공유하세요.' },
          ],
          faqs: [
            { q: 'V-컷 공식이 상하 꺾임과 좌우 꺾임에서 왜 다른가요?', a: '상하 꺾임은 트레이 옆면(레일)에 V-컷을 넣기 때문에 기준 치수가 옆면 높이(보통 100mm)이고, 좌우 꺾임은 트레이 상면 폭 전체에 V-컷을 넣기 때문에 기준 치수가 트레이 폭(예: 200mm)입니다. 공식 자체는 기준치수 × tan(각도/2)로 동일하지만, 입력 치수가 달라 결과가 크게 차이납니다.' },
            { q: '수직 구간(L=0)도 계산되나요?', a: '네, 지원합니다. 수동 모드에서 수평 거리(L)에 0을 입력하면 90° 수직 구간으로 자동 처리됩니다. 수직 구간은 V-컷 가공이 불필요하며, 직각 절단 후 별도 수직 연결구를 사용하도록 안내됩니다. 행거 간격도 수직 계수(0.40)로 자동 계산됩니다.' },
            { q: '행거 간격 기준은 어떤 규정을 따르나요?', a: '행거 간격은 KEC(한국전기설비규정) 실무 기준을 바탕으로 트레이 폭별 기본 간격(100~200mm: 1.5m, 300~450mm: 2.0m, 600mm: 1.5m)에 경사각 계수(0.40~1.0)와 환경 계수(실내 1.0, 실외 0.8, 진동 0.7)를 곱해 산출합니다. 최종 수치는 현장 감리 및 설계 기준과 대조하여 확인하시기 바랍니다.' },
            { q: '45° 초과 각도를 선택하면 어떻게 되나요?', a: '45°를 초과하는 각도는 단일 V-컷 가공이 구조적으로 어렵습니다. 이 경우 도구는 V-컷 수치를 계산하되 주황색 경고 박스로 "45° 2회 분할 시공"을 권장합니다. 또한 V-컷 전체 폭이 기준 치수의 80%를 초과하면 재료 약화 경고도 별도로 표시됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 현장 참고용으로만 제공됩니다. 실제 시공 시에는 반드시 설계도서, 감리 지침, KEC 규정을 기준으로 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Cable Tray Slope & Fabrication Calculator?',
          description: 'The Cable Tray Slope & Fabrication Calculator is a field-ready tool for electrical construction workers who need to quickly calculate V-cut dimensions, bolt hole positions, slope length, and hanger spacing for inclined cable tray installations. Select the bend direction (vertical or horizontal), choose a preset angle (30°/45°/60°) or enter measured height and distance manually, and the tool instantly outputs V-cut half width, full width, marking interval A, and a to-scale SVG fabrication diagram you can use with a measuring tape on-site. Warnings are shown automatically for vertical risers, angles above 45°, and V-cut widths exceeding 80% of the reference dimension. Hanger spacing is calculated using KEC field practice guidelines, accounting for tray width, slope angle, and installation environment. All results can be copied in one tap to share with your team.',
          useCases: [
            { icon: '✂️', title: 'V-Cut Dimensions On-Site', desc: 'Before grinding a V-cut into a tray, get the exact half-width and full-width in millimeters. The tool automatically selects the correct reference dimension — side height for vertical bends, tray width for horizontal bends — so there is no guesswork.' },
            { icon: '📐', title: 'SVG Diagram for Direct Marking', desc: 'The SVG fabrication diagram shows V-cut lines, bolt hole circles (Ø14), and the center reference line to scale so you can hold your phone next to the tray and mark directly with a tape measure. No printing or separate app required.' },
            { icon: '📏', title: 'Slope Length and Elbow Selection', desc: 'Enter height and distance or select a preset angle to get the actual slope length with 5% and 10% safety margins, and the correct standard elbow size (10° to 45°) automatically recommended from your calculated angle.' },
            { icon: '🔩', title: 'Hanger Spacing Planning', desc: 'Select the tray width and installation environment to compute the recommended hanger interval per KEC guidelines, combining base spacing, slope angle factor, and environment factor. Copy all results at once to share with your crew.' },
          ],
          steps: [
            { step: 'STEP 1 — Direction & Specs', desc: 'Choose vertical bend (tray slopes up/down) or horizontal bend (tray changes direction on a flat plane). Then select the tray width and side height from the dropdowns. These determine the V-cut reference dimension automatically.' },
            { step: 'STEP 2 — Angle Input', desc: 'In Preset mode, tap 30°, 45°, or 60° and enter the height H in meters — slope length and horizontal distance are computed automatically. In Manual mode, enter measured H and L directly. Enter L=0 for a vertical riser segment.' },
            { step: 'STEP 3–5 — Results and Diagram', desc: 'STEP 3 shows slope angle, length, and elbow recommendation. STEP 4 shows V-cut half width, full width, marking interval A, and bolt hole positions. STEP 5 shows the SVG diagram — hold your phone next to the tray and mark it directly.' },
            { step: 'STEP 6 — Hanger Spacing & Copy', desc: 'Select the installation environment (indoor, outdoor/corrosive, or vibration) to get the recommended hanger interval. Tap "Copy all results" to copy every calculated value to your clipboard and share with your team instantly.' },
          ],
          faqs: [
            { q: 'Why is the V-cut formula different for vertical vs horizontal bends?', a: 'For a vertical bend, the V-cut is made into the side rail of the tray, so the reference dimension is the side height (typically 100mm). For a horizontal bend, the V-cut spans the full width of the tray top, so the reference dimension is the tray width (e.g. 200mm). The formula itself — reference × tan(angle/2) — is the same, but the different input dimension produces significantly different results.' },
            { q: 'Does it support vertical riser segments (L=0)?', a: 'Yes. In Manual mode, enter 0 for the horizontal distance to activate vertical riser mode. The tool sets the slope angle to 90°, sets slope length equal to the height, and skips the V-cut section since vertical risers require a straight cut and a separate vertical connector, not a V-cut. Hanger spacing is also adjusted using the vertical factor of 0.40.' },
            { q: 'What standard is the hanger spacing based on?', a: 'Hanger spacing follows KEC (Korean Electrical Code) field practice guidelines. The base interval (1.5m for 100–200mm trays, 2.0m for 300–450mm, 1.5m for 600mm) is multiplied by a slope angle factor (1.0 at 0–10° down to 0.40 at 90°) and an environment factor (1.0 indoor, 0.8 outdoor/corrosive, 0.7 vibration). Always verify against your project specifications and supervising engineer approval.' },
            { q: 'What happens if I enter an angle above 45°?', a: 'The tool calculates V-cut dimensions for angles above 45° but displays an orange warning recommending two 45° cuts (split installation) instead of a single V-cut. If the V-cut full width exceeds 80% of the reference dimension, a separate material weakening warning also appears. These are caution flags, not hard stops.' },
            { q: 'Can I use these results as official data?', a: 'Results are for reference only. For all actual construction work, verify the final specifications against your design documents, supervision guidelines, and applicable KEC regulations before procurement or installation.' },
          ],
        }}
      />
    </div>
  );
}
