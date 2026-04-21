'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Ruler, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './cable-tray-calc.module.css';

// ── Constants ──────────────────────────────────────
const BASE_INTERVAL: Record<number, number> = {
  100: 1.5, 150: 1.5, 200: 1.5,
  300: 2.0, 400: 2.0, 450: 2.0,
  600: 1.5,
};

const TRAY_WIDTHS = [100, 150, 200, 300, 400, 450, 600];

function getAngleFactor(angle: number): number {
  if (angle <= 10) return 1.0;
  if (angle <= 20) return 0.85;
  if (angle <= 30) return 0.75;
  if (angle <= 45) return 0.60;
  if (angle < 90) return 0.50;
  return 0.40;
}

const ENV_FACTOR: Record<string, number> = {
  indoor: 1.0,
  outdoor: 0.8,
  vibration: 0.7,
};

// ── SVG helpers ────────────────────────────────────
const SVG_W = 200;
const SVG_H = 120;
const PADDING = 20;

function normalizeSVG(h1: number, h2: number, l: number, isVertical: boolean) {
  const drawW = SVG_W - PADDING * 2;
  const drawH = SVG_H - PADDING * 2;

  if (isVertical) {
    const x = PADDING + drawW / 2;
    return {
      startX: x, startY: PADDING,
      endX: x,   endY: PADDING + drawH,
      labelH1:    { x: x + 6, y: PADDING + 12 },
      labelH2:    { x: x + 6, y: PADDING + drawH - 4 },
      labelL:     null,
      labelSlope: { x: x + 6, y: SVG_H / 2 },
    };
  }

  const heightDiff = Math.abs(h1 - h2);
  const scaleX = drawW / (l || 1);
  const scaleY = heightDiff > 0 ? drawH / heightDiff : scaleX;
  const scale = Math.min(scaleX, scaleY);

  const scaledL = l * scale;
  const scaledH = heightDiff * scale;

  const startX = PADDING + (drawW - scaledL) / 2;
  const startY = PADDING + (drawH - scaledH) / 2;
  const endX = startX + scaledL;
  const endY = startY + scaledH;

  return {
    startX, startY, endX, endY,
    labelH1:    { x: startX - 3, y: startY + 12 },
    labelH2:    { x: endX + 3,   y: endY - 4 },
    labelL:     { x: (startX + endX) / 2, y: endY + 13 },
    labelSlope: { x: (startX + endX) / 2 - 12, y: (startY + endY) / 2 - 8 },
  };
}

// ── Hanger positions ───────────────────────────────
function generateHangerPositions(trayLength: number, hangerInterval: number): string[] {
  if (trayLength <= 0 || hangerInterval <= 0) return [];
  const count = Math.ceil(trayLength / hangerInterval) + 1;
  const positions: string[] = [];
  for (let i = 0; i < count; i++) {
    const rawPosition = i * hangerInterval;
    const position = Math.min(rawPosition, trayLength);
    positions.push(position.toFixed(2));
    if (position >= trayLength) break;
  }
  return positions;
}

// ── Elbow recommendation ───────────────────────────
function getElbowRec(angle: number, isKo: boolean): { label: string; warning: string | null } {
  if (angle === 90) return {
    label: isKo ? '수직 구간 — 엘보 불필요' : 'Vertical Riser — No elbow needed',
    warning: null,
  };
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

// ── Main component ─────────────────────────────────
export default function CableTrayCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // ── Shared state (all 3 tabs) — string to preserve decimal input ──
  const [h1, setH1] = useState<string>('');
  const [h2, setH2] = useState<string>('');
  const [L, setL]   = useState<string>('');

  // ── Tab 3 extras ──
  const [trayWidth, setTrayWidth]   = useState<number>(200);
  const [environment, setEnvironment] = useState<string>('indoor');

  const [activeTab, setActiveTab] = useState<'length' | 'angle' | 'hanger'>('length');
  const [copyMsg, setCopyMsg] = useState<string>('');

  // ── Derived values ──
  const h1Val = Math.max(0, parseFloat(h1) || 0);
  const h2Val = Math.max(0, parseFloat(h2) || 0);
  const lVal  = Math.max(0, parseFloat(L)  || 0);

  const hasValidInput = h1.trim() !== '' && h2.trim() !== '' && L.trim() !== '';
  const heightDiff = Math.abs(h1Val - h2Val);
  const isVertical = lVal === 0;

  let slopeLength = 0;
  let slopeAngle  = 0;

  if (hasValidInput) {
    if (isVertical) {
      slopeLength = heightDiff;
      slopeAngle  = 90;
    } else {
      slopeLength = Math.sqrt(lVal * lVal + heightDiff * heightDiff);
      slopeAngle  = Math.atan(heightDiff / lVal) * (180 / Math.PI);
    }
  }

  const hangerInterval = hasValidInput
    ? Number(
        (BASE_INTERVAL[trayWidth] * getAngleFactor(slopeAngle) * ENV_FACTOR[environment]).toFixed(2)
      )
    : 0;

  const hangerCount = hangerInterval > 0
    ? Math.ceil(slopeLength / hangerInterval) + 1
    : 0;

  const hangerPositions = hasValidInput
    ? generateHangerPositions(slopeLength, hangerInterval)
    : [];

  const elbow = getElbowRec(slopeAngle, isKo);

  const coords = hasValidInput
    ? normalizeSVG(h1Val, h2Val, lVal, isVertical)
    : null;

  // ── Copy ──
  const handleCopy = async () => {
    const text = `[${isKo ? '케이블 트레이 경사 계산 결과' : 'Cable Tray Slope Calculation'}]
${isKo ? '사선 길이' : 'Slope Length'}: ${slopeLength.toFixed(2)}m
${isKo ? '경사각' : 'Slope Angle'}: ${slopeAngle.toFixed(1)}°
${isKo ? '권장 엘보' : 'Recommended Elbow'}: ${elbow.label}
${isKo ? '권장 행거 간격' : 'Hanger Interval'}: ${hangerInterval.toFixed(2)}m / ${isKo ? '행거' : 'hangers'} ${hangerCount}${isKo ? '개 필요' : ' needed'}
📐 theutilhub.com/utilities/utility/cable-tray-calc`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg(isKo ? '✓ 복사됨' : '✓ Copied');
    } catch {
      setCopyMsg(isKo ? '❌ 복사 실패' : '❌ Copy failed');
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  // ── Shared input JSX (inlined to prevent unmount on re-render) ──
  const sharedInputs = (
    <div className={s.input_grid}>
      <div>
        <label className={s.field_label}>{isKo ? '시작 높이 H1 (m)' : 'Start Height H1 (m)'}</label>
        <input
          type="number" step="0.01" min="0"
          placeholder={isKo ? '예: 3.00' : 'e.g. 3.00'}
          className={s.field_input}
          value={h1}
          onChange={e => setH1(e.target.value)}
          aria-label={isKo ? '시작 높이 입력' : 'Start height input'}
        />
      </div>
      <div>
        <label className={s.field_label}>{isKo ? '끝 높이 H2 (m)' : 'End Height H2 (m)'}</label>
        <input
          type="number" step="0.01" min="0"
          placeholder={isKo ? '예: 1.00' : 'e.g. 1.00'}
          className={s.field_input}
          value={h2}
          onChange={e => setH2(e.target.value)}
          aria-label={isKo ? '끝 높이 입력' : 'End height input'}
        />
      </div>
      <div>
        <label className={s.field_label}>{isKo ? '수평 거리 L (m)' : 'Horizontal Distance L (m)'}</label>
        <input
          type="number" step="0.01" min="0"
          placeholder={isKo ? '예: 5.00' : 'e.g. 5.00'}
          className={s.field_input}
          value={L}
          onChange={e => setL(e.target.value)}
          aria-label={isKo ? '수평 거리 입력' : 'Horizontal distance input'}
        />
        <p className={s.field_hint}>{isKo ? '수직 구간은 0 입력' : 'Enter 0 for vertical riser'}</p>
      </div>
    </div>
  );

  const titleStr = isKo ? '케이블 트레이 경사 계산기' : 'Cable Tray Slope Calculator';
  const descStr  = isKo
    ? '전기공사 현장에서 케이블 트레이 사선 길이, 경사각, 행거 간격을 즉시 계산. 엘보 규격 자동 추천 포함.'
    : 'Calculate cable tray slope length, angle, and hanger spacing instantly for electrical construction sites.';

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

      {/* Main panel */}
      <section className={s.panel}>
        {/* Tab bar */}
        <div className={s.tab_bar} role="tablist">
          {([
            ['length', isKo ? '📐 경사 길이' : '📐 Length'],
            ['angle',  isKo ? '📏 경사각'   : '📏 Angle'],
            ['hanger', isKo ? '🔩 행거 간격' : '🔩 Hangers'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`${s.tab_btn} ${activeTab === tab ? s.tab_active : s.tab_inactive}`}
              onClick={() => setActiveTab(tab)}
              aria-label={label}
            >{label}</button>
          ))}
        </div>

        {/* ── TAB 1: 경사 길이 ── */}
        {activeTab === 'length' && (
          <div role="tabpanel">
            {sharedInputs}

            {hasValidInput && isVertical && (
              <div className={s.vertical_box}>
                ⚠️ {isKo
                  ? '수직 상승/하강 구간 (Vertical Riser)입니다. 사선 길이 = 높이 차'
                  : 'Vertical Riser segment. Slope length = height difference'}
              </div>
            )}

            {hasValidInput && (
              <>
                <div className={s.result_row} style={{ paddingTop: 0 }}>
                  <span className={s.result_label}>{isKo ? '사선 길이' : 'Slope Length'}</span>
                  <span>
                    <span className={s.result_primary}>{slopeLength.toFixed(2)}</span>
                    <span className={s.result_unit}>m</span>
                  </span>
                </div>
                <div className={s.result_row}>
                  <span className={s.result_label}>{isKo ? '높이 차' : 'Height Difference'}</span>
                  <span className={s.result_value}>{heightDiff.toFixed(2)} m</span>
                </div>
                <div className={s.result_row}>
                  <span className={s.result_label}>{isKo ? '경사각 (참고)' : 'Angle (ref)'}</span>
                  <span className={s.result_value}>{slopeAngle.toFixed(1)}°</span>
                </div>

                <div className={s.divider} />

                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                  {isKo ? '여유분 포함 권장 주문량' : 'Recommended Order Qty (with margin)'}
                </p>
                <div className={s.order_grid}>
                  <div className={s.order_card}>
                    <div className={s.order_label}>{isKo ? '5% 여유' : '5% margin'}</div>
                    <div className={s.order_value}>{(slopeLength * 1.05).toFixed(2)} m</div>
                  </div>
                  <div className={s.order_card}>
                    <div className={s.order_label}>{isKo ? '10% 여유' : '10% margin'}</div>
                    <div className={s.order_value}>{(slopeLength * 1.10).toFixed(2)} m</div>
                  </div>
                </div>

                {/* SVG 단면도 */}
                {coords && (
                  <div className={s.svg_wrap}>
                    <svg
                      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                      width="100%"
                      style={{ maxWidth: '400px' }}
                      aria-label={isKo ? '케이블 트레이 단면도' : 'Cable tray cross-section diagram'}
                    >
                      {/* 보조선 */}
                      {!isVertical && (
                        <>
                          <line
                            x1={coords.startX} y1={coords.endY}
                            x2={coords.endX}   y2={coords.endY}
                            stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2"
                          />
                          <line
                            x1={coords.startX} y1={coords.startY}
                            x2={coords.startX} y2={coords.endY}
                            stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2"
                          />
                        </>
                      )}
                      {/* 사선 */}
                      <line
                        x1={coords.startX} y1={coords.startY}
                        x2={coords.endX}   y2={coords.endY}
                        stroke="#8b5cf6" strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* 레이블 */}
                      <text x={coords.labelH1.x} y={coords.labelH1.y}
                        fontSize="9" fill="#8b5cf6" fontWeight="bold">H1</text>
                      <text x={coords.labelH2.x} y={coords.labelH2.y}
                        fontSize="9" fill="#64748b">H2</text>
                      {coords.labelL && (
                        <text x={coords.labelL.x} y={coords.labelL.y}
                          fontSize="9" fill="#64748b" textAnchor="middle">L</text>
                      )}
                      <text x={coords.labelSlope.x} y={coords.labelSlope.y}
                        fontSize="8" fill="#8b5cf6" textAnchor="middle">
                        {slopeLength.toFixed(2)}m
                      </text>
                    </svg>
                  </div>
                )}

                <button className={s.copy_btn} onClick={handleCopy} aria-label={isKo ? '결과 복사' : 'Copy results'}>
                  <Copy size={14} /> {isKo ? '결과 복사' : 'Copy results'}
                </button>
                {copyMsg && (
                  <p className={`${s.copy_msg} ${copyMsg.includes('❌') ? s.copy_msg_fail : ''}`}>{copyMsg}</p>
                )}
              </>
            )}

            {!hasValidInput && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                {isKo ? 'H1, H2, L을 모두 입력하면 결과가 표시됩니다.' : 'Enter H1, H2, and L to see results.'}
              </p>
            )}
          </div>
        )}

        {/* ── TAB 2: 경사각 ── */}
        {activeTab === 'angle' && (
          <div role="tabpanel">
            {sharedInputs}

            {hasValidInput && isVertical && (
              <div className={s.vertical_box}>
                ⚠️ {isKo
                  ? '수직 상승/하강 구간 (Vertical Riser)입니다.'
                  : 'Vertical Riser segment.'}
              </div>
            )}

            {hasValidInput && (
              <>
                <div className={s.result_row} style={{ paddingTop: 0 }}>
                  <span className={s.result_label}>{isKo ? '실제 경사각' : 'Slope Angle'}</span>
                  <span>
                    <span className={s.result_primary}>{slopeAngle.toFixed(1)}</span>
                    <span className={s.result_unit}>°</span>
                  </span>
                </div>

                <div className={s.divider} />

                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
                  {isKo ? '권장 엘보 규격' : 'Recommended Elbow'}
                </p>
                <span className={s.elbow_badge}>{elbow.label}</span>
                {elbow.warning && (
                  <div className={s.elbow_warning}>{elbow.warning}</div>
                )}

                <button className={s.copy_btn} onClick={handleCopy} aria-label={isKo ? '결과 복사' : 'Copy results'}>
                  <Copy size={14} /> {isKo ? '결과 복사' : 'Copy results'}
                </button>
                {copyMsg && (
                  <p className={`${s.copy_msg} ${copyMsg.includes('❌') ? s.copy_msg_fail : ''}`}>{copyMsg}</p>
                )}
              </>
            )}

            {!hasValidInput && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                {isKo ? 'H1, H2, L을 모두 입력하면 결과가 표시됩니다.' : 'Enter H1, H2, and L to see results.'}
              </p>
            )}
          </div>
        )}

        {/* ── TAB 3: 행거 간격 ── */}
        {activeTab === 'hanger' && (
          <div role="tabpanel">
            {sharedInputs}

            {/* Tab-3 only inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className={s.field_label}>{isKo ? '트레이 폭 (mm)' : 'Tray Width (mm)'}</label>
                <select
                  className={s.select_field}
                  value={trayWidth}
                  onChange={e => setTrayWidth(Number(e.target.value))}
                  aria-label={isKo ? '트레이 폭 선택' : 'Select tray width'}
                >
                  {TRAY_WIDTHS.map(w => (
                    <option key={w} value={w}>{w} mm</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={s.field_label}>{isKo ? '설치 환경' : 'Environment'}</label>
                <select
                  className={s.select_field}
                  value={environment}
                  onChange={e => setEnvironment(e.target.value)}
                  aria-label={isKo ? '설치 환경 선택' : 'Select installation environment'}
                >
                  <option value="indoor">{isKo ? '실내 일반' : 'Indoor (standard)'}</option>
                  <option value="outdoor">{isKo ? '실외·부식 환경' : 'Outdoor / Corrosive'}</option>
                  <option value="vibration">{isKo ? '진동 있음' : 'Vibration present'}</option>
                </select>
              </div>
            </div>

            {hasValidInput && (
              <>
                <div className={s.result_row} style={{ paddingTop: 0 }}>
                  <span className={s.result_label}>{isKo ? '권장 행거 간격' : 'Hanger Interval'}</span>
                  <span>
                    <span className={s.result_primary}>{hangerInterval.toFixed(2)}</span>
                    <span className={s.result_unit}>m</span>
                  </span>
                </div>
                <div className={s.result_row}>
                  <span className={s.result_label}>{isKo ? '필요 행거 개수' : 'Hangers Required'}</span>
                  <span className={s.result_value}>{hangerCount}{isKo ? '개' : ' pcs'}</span>
                </div>
                <div className={s.result_row}>
                  <span className={s.result_label}>{isKo ? '트레이 사선 길이' : 'Slope Length'}</span>
                  <span className={s.result_value}>{slopeLength.toFixed(2)} m</span>
                </div>
                <div className={s.result_row}>
                  <span className={s.result_label}>{isKo ? '경사각' : 'Slope Angle'}</span>
                  <span className={s.result_value}>{slopeAngle.toFixed(1)}°</span>
                </div>

                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginTop: '1rem', marginBottom: '0.25rem' }}>
                  {isKo ? '행거 위치 목록' : 'Hanger Positions'}
                </p>
                <div className={s.hanger_list}>
                  {hangerPositions.map((pos, i) => (
                    <div
                      key={i}
                      className={`${s.hanger_item} ${i === 0 ? s.hanger_item_first : ''} ${i === hangerPositions.length - 1 ? s.hanger_item_last : ''}`}
                    >
                      {i + 1}{isKo ? '번 행거' : '. hanger'}: {pos}m
                      {i === 0 ? (isKo ? ' (시작점)' : ' (start)') : ''}
                      {i === hangerPositions.length - 1 ? (isKo ? ' (끝점)' : ' (end)') : ''}
                    </div>
                  ))}
                </div>

                <button className={s.copy_btn} onClick={handleCopy} aria-label={isKo ? '결과 복사' : 'Copy results'}>
                  <Copy size={14} /> {isKo ? '결과 복사' : 'Copy results'}
                </button>
                {copyMsg && (
                  <p className={`${s.copy_msg} ${copyMsg.includes('❌') ? s.copy_msg_fail : ''}`}>{copyMsg}</p>
                )}
              </>
            )}

            {!hasValidInput && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                {isKo ? 'H1, H2, L을 모두 입력하면 결과가 표시됩니다.' : 'Enter H1, H2, and L to see results.'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Bottom 7 sections */}
      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utility/cable-tray-calc" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection
        ko={{
          title: '케이블 트레이 경사 계산기란 무엇인가요?',
          description: '케이블 트레이 경사 계산기는 전기공사 현장에서 케이블 트레이를 경사지게 설치할 때 필요한 모든 수치를 즉시 계산해주는 현장 실무 도구입니다. 시작 높이, 끝 높이, 수평 거리를 한 번만 입력하면 탭을 전환해도 입력값이 유지되어 사선 길이, 경사각, 행거 간격을 연속으로 확인할 수 있습니다. 수직 상승/하강 구간(Vertical Riser)도 지원하며, 수평 거리를 0으로 입력하면 90° 수직 구간으로 자동 처리됩니다. 경사각에 따라 10°·15°·22.5°·30°·45° 표준 엘보 규격을 자동으로 추천하며, 행거 간격은 트레이 폭·경사각·설치 환경을 모두 고려해 산출하고 행거 위치 목록까지 제공합니다. 현장에서 스마트폰으로 바로 꺼내 쓸 수 있도록 최적화되어 있습니다.',
          useCases: [
            { icon: '📦', title: '트레이 재료 수량 산출', desc: '현장 구조물 변경으로 트레이 경로가 바뀌었을 때, 시작·끝 높이와 수평 거리만 입력하면 실제 사선 길이와 여유분 포함 권장 주문량을 즉시 계산할 수 있습니다.' },
            { icon: '🔧', title: '엘보 규격 즉시 확인', desc: '경사각을 직접 계산하기 어려운 현장에서 높이와 거리만 입력하면 10°·15°·22.5°·30°·45° 중 적합한 엘보 규격을 자동으로 추천해드립니다.' },
            { icon: '🔩', title: '행거 설치 계획 수립', desc: '경사각과 트레이 폭, 설치 환경에 따라 행거 간격과 필요 개수를 자동 산출하고 행거 위치 목록까지 제공해 시공 계획을 빠르게 수립할 수 있습니다.' },
            { icon: '📱', title: '수직 구간(Vertical Riser) 계산', desc: '수평 거리가 0인 수직 상승·하강 구간도 지원합니다. 수평 거리에 0을 입력하면 90° 수직 구간으로 자동 처리되어 사선 길이와 행거 간격을 바로 확인할 수 있습니다.' },
          ],
          steps: [
            { step: '입력값 입력', desc: '시작 높이(H1), 끝 높이(H2), 수평 거리(L)를 미터(m) 단위로 입력합니다. 수직 상승·하강 구간은 수평 거리에 0을 입력하세요. 한 번 입력한 값은 탭을 전환해도 유지됩니다.' },
            { step: '경사 길이 확인', desc: '경사 길이 탭에서 실제 사선 길이와 여유분 포함 권장 주문량을 확인합니다. SVG 단면도로 트레이 형태를 시각적으로 확인할 수 있습니다.' },
            { step: '경사각 및 엘보 확인', desc: '경사각 탭에서 자동으로 계산된 경사각과 권장 엘보 규격을 확인합니다. 45° 초과 시 분할 시공 안내가 표시됩니다.' },
            { step: '행거 간격 계획', desc: '행거 간격 탭에서 트레이 폭과 설치 환경을 추가로 선택하면 권장 행거 간격과 위치 목록이 자동으로 계산됩니다. 결과 복사 버튼으로 동료와 즉시 공유하세요.' },
          ],
          faqs: [
            { q: '탭을 전환하면 입력값이 초기화되나요?', a: '아닙니다. 시작 높이, 끝 높이, 수평 거리는 세 탭 모두 동일한 값을 공유합니다. 한 탭에서 입력한 값은 다른 탭으로 전환해도 그대로 유지되므로 중복 입력할 필요가 없습니다. 행거 간격 탭에서는 트레이 폭과 설치 환경만 추가로 선택하면 됩니다.' },
            { q: '수직 상승/하강 구간(Vertical Riser)도 계산되나요?', a: '네, 지원합니다. 수평 거리(L)에 0을 입력하면 90° 수직 구간으로 자동 처리됩니다. 수직 구간에서는 사선 길이가 높이 차와 동일하게 계산되며, 엘보 규격 추천 대신 수직 구간 안내가 표시됩니다. 행거 간격도 수직 구간 기준(경사 계수 0.40)으로 산출됩니다.' },
            { q: '행거 간격 기준은 어떤 규정을 따르나요?', a: '행거 간격은 KEC(한국전기설비규정) 및 현장 실무 기준을 바탕으로 트레이 폭, 경사각, 설치 환경을 종합해 산출합니다. 경사각이 클수록, 트레이가 넓을수록, 실외·진동 환경일수록 간격이 줄어듭니다. 최종 간격은 반드시 현장 감리 및 설계 기준과 대조하여 확인하시기 바랍니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 시공 시에는 반드시 설계도서, 감리 지침, KEC 규정을 기준으로 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is Cable Tray Slope Calculator?',
          description: 'The Cable Tray Slope Calculator is a field-ready tool for electrical construction workers who need to quickly calculate slope length, angle, and hanger spacing for inclined cable tray installations. Enter the start height, end height, and horizontal distance once — your inputs are shared across all three tabs, so you can switch between slope length, angle, and hanger spacing results without re-entering data. Vertical riser segments (L=0) are fully supported: entering a horizontal distance of 0 automatically treats the segment as a 90° vertical riser and adjusts all calculations accordingly. The angle tab automatically recommends the correct standard elbow size (10°, 15°, 22.5°, 30°, or 45°) and warns when the angle exceeds 45°. The hanger tab accounts for tray width, slope angle, and installation environment to output the recommended spacing interval and a complete hanger position list, calculated using index-based arithmetic to eliminate floating-point accumulation errors. All calculations run client-side in your browser — no server, no login required.',
          useCases: [
            { icon: '📦', title: 'Material Quantity Estimation', desc: 'When a cable tray route changes on-site, enter the new start and end heights and horizontal distance to instantly get the actual slope length and recommended order quantity with 5% and 10% safety margins.' },
            { icon: '🔧', title: 'Elbow Size Lookup', desc: 'On sites where calculating the exact slope angle by hand is impractical, input height and distance values to instantly receive the correct standard elbow size recommendation from 10° up to 45°.' },
            { icon: '🔩', title: 'Hanger Installation Planning', desc: 'Select the tray width and installation environment to automatically calculate hanger spacing interval, total hanger count, and a complete numbered hanger position list for immediate use in construction planning.' },
            { icon: '📱', title: 'Vertical Riser Calculation', desc: 'Supports vertical riser segments where the horizontal distance is zero. Enter L=0 to switch to 90° vertical mode — slope length equals height difference and hanger spacing adjusts to the vertical factor automatically.' },
          ],
          steps: [
            { step: 'Enter dimensions', desc: 'Type the start height (H1), end height (H2), and horizontal distance (L) in meters. For a vertical riser segment, enter 0 for L. Your inputs persist across all three tabs — no need to retype.' },
            { step: 'Check slope length', desc: 'On the Length tab, read the actual slope length and the recommended order quantities with 5% and 10% margins. An SVG cross-section diagram visualizes the geometry for any input ratio without layout breakage.' },
            { step: 'Check angle and elbow', desc: 'On the Angle tab, see the calculated slope angle in degrees and the automatically selected standard elbow size. A warning appears if the angle exceeds 45°, recommending a split installation approach.' },
            { step: 'Plan hanger placement', desc: 'On the Hangers tab, select the tray width and environment, then read the recommended hanger interval, total count, and every hanger position to the nearest centimeter. Copy all results with one tap to share with your team.' },
          ],
          faqs: [
            { q: 'Do my inputs reset when I switch tabs?', a: 'No. The start height, end height, and horizontal distance are shared state across all three tabs. Values you enter on any tab remain intact when you navigate to another tab — only the tray width and environment dropdowns are exclusive to the Hangers tab.' },
            { q: 'Does it handle vertical riser segments?', a: 'Yes. Enter 0 for the horizontal distance (L) to activate vertical riser mode. The tool automatically sets the slope angle to 90°, sets slope length equal to the height difference, and adjusts the hanger spacing factor to 0.40 for vertical segments. No elbow recommendation is shown for vertical risers.' },
            { q: 'What standard is the hanger spacing based on?', a: 'Hanger spacing is derived from KEC (Korean Electrical Code) field practice guidelines, adjusted by slope angle factor (ranging from 1.0 at 0–10° to 0.40 at 90°) and an environment reduction factor (0.7 for vibration, 0.8 for outdoor/corrosive, 1.0 for indoor). Always verify the final spacing against your project specifications and supervising engineer\'s approval.' },
            { q: 'Can I use these results as official data?', a: 'Results are for reference only. For all actual construction work, verify the final specifications against your design documents, supervision guidelines, and applicable KEC regulations before procurement or installation.' },
          ],
        }}
      />
    </div>
  );
}
