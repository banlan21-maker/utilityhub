'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Ruler, Copy } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  calcSegment, nearestElbow, supportPositions,
  FIELD_BEND_MAX_DEG, SUPPORT_NEAR_JOINT_M,
  type BendDirection, type RouteKind,
} from '@/lib/cableTray';
import TrayBend3D from './TrayBend3D';
import { BendDetail, SegmentOverview } from './FlatPattern';
import s from './cable-tray-calc.module.css';

const TRAY_WIDTHS = [100, 150, 200, 300, 400, 450, 600];
const TRAY_HEIGHTS = [60, 80, 100, 120, 150];
const PRESET_ANGLES = [30, 45, 60] as const;

type Route = { direction: BendDirection; route: RouteKind };
const ROUTES: Record<'up' | 'down' | 'offset', Route> = {
  up: { direction: 'vertical', route: 'up' },
  down: { direction: 'vertical', route: 'down' },
  offset: { direction: 'horizontal', route: 'offset' },
};

/** 구간 모양 실루엣 (상하는 옆에서, 좌우는 위에서 본 모습) */
function RouteIcon({ kind }: { kind: 'up' | 'down' | 'offset' }) {
  const d = kind === 'up'
    ? 'M6 46 H46 L94 14 H134'
    : kind === 'down'
      ? 'M6 14 H46 L94 46 H134'
      : 'M6 40 H46 L94 20 H134';
  return (
    <svg viewBox="0 0 140 60" className={s.route_icon} aria-hidden="true">
      {kind === 'offset' ? (
        <>
          <path d={d} fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" opacity="0.18" />
          <path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d={d} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M0 56 H140" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </>
      )}
    </svg>
  );
}

/** H·L(D·L)을 어디서 재는지 보여주는 그림 */
function MeasureDiagram({ direction, down, isKo }: { direction: BendDirection; down: boolean; isKo: boolean }) {
  const riseLabel = direction === 'vertical' ? (isKo ? 'H 높이차' : 'H rise') : (isKo ? 'D 옆 이동' : 'D offset');
  const runLabel = isKo ? 'L 진행 거리' : 'L run';
  // 내리막은 위에서 아래로 내려가는 모양으로 그린다
  const y1 = down ? 50 : 130, y2 = down ? 130 : 50;
  return (
    <svg viewBox="0 0 360 170" className={s.measure_svg} role="img"
      aria-label={isKo ? '측정 위치 그림' : 'Where to measure'}>
      <text x="20" y="16" style={{ fontSize: 12, fontWeight: 500 }}>
        {direction === 'vertical'
          ? (isKo ? '옆에서 본 모습 · 트레이 바닥 기준으로 잼' : 'Side view · measure at tray bottom')
          : (isKo ? '위에서 본 모습 · 트레이 중심선 기준으로 잼' : 'Top view · measure at tray centerline')}
      </text>
      <path d={`M20 ${y1} H120 L240 ${y2} H340`} className={s.measure_line} />
      <line x1="120" y1="148" x2="240" y2="148" className={s.measure_dim} />
      <text x="180" y="166" textAnchor="middle">{runLabel}</text>
      <line x1="252" y1="50" x2="252" y2="130" className={s.measure_dim} />
      <text x="258" y="95">{riseLabel}</text>
      <circle cx="120" cy={y1} r="6" fill="var(--primary)" />
      <circle cx="240" cy={y2} r="6" fill="var(--primary)" />
      <text x="106" y={y1 - 12} textAnchor="middle">①</text>
      <text x="226" y={y2 - 12} textAnchor="middle">②</text>
    </svg>
  );
}

export default function CableTrayCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [routeKey, setRouteKey] = useState<'up' | 'down' | 'offset' | null>(null);
  const [trayWidth, setTrayWidth] = useState(200);
  const [trayHeight, setTrayHeight] = useState(100);
  const [inputMode, setInputMode] = useState<'preset' | 'manual'>('preset');
  const [presetAngle, setPresetAngle] = useState<number | null>(null);
  const [riseText, setRiseText] = useState('');
  const [runText, setRunText] = useState('');
  const [activeBend, setActiveBend] = useState<0 | 1>(0);
  const [maxSpanText, setMaxSpanText] = useState('1.5');
  const [copyMsg, setCopyMsg] = useState('');

  const route = routeKey ? ROUTES[routeKey] : null;
  const direction = route?.direction ?? 'vertical';
  const rise = parseFloat(riseText) || 0;
  const run = inputMode === 'preset'
    ? (presetAngle ? rise / Math.tan((presetAngle * Math.PI) / 180) : 0)
    : parseFloat(runText) || 0;
  const inputReady = inputMode === 'preset' ? presetAngle !== null && rise > 0 : rise > 0 && runText.trim() !== '';

  const seg = route && inputReady
    ? calcSegment({ direction, route: route.route, widthMm: trayWidth, heightMm: trayHeight, riseM: rise, runM: run })
    : null;
  const elbow = seg ? nearestElbow(seg.angleDeg, rise) : null;
  const maxSpan = parseFloat(maxSpanText) || 0;
  const supports = seg && !seg.isVerticalRiser ? supportPositions(seg.slopeLengthM, maxSpan) : [];
  const bend = seg?.bends[activeBend];

  const riseLabel = direction === 'vertical' ? (isKo ? '높이차 H (m)' : 'Rise H (m)') : (isKo ? '옆 이동 거리 D (m)' : 'Offset D (m)');
  const runLabel = isKo ? '진행 거리 L (m)' : 'Run L (m)';

  const fillExample = () => {
    setRouteKey('down');
    setTrayWidth(300);
    setTrayHeight(100);
    setInputMode('preset');
    setPresetAngle(30);
    setRiseText('0.25');
  };

  const routeName = (k: 'up' | 'down' | 'offset') => ({
    up: isKo ? '오르막' : 'Rise',
    down: isKo ? '내리막' : 'Drop',
    offset: isKo ? '옆으로 비키기' : 'Side offset',
  })[k];

  const cutName = (k: 'vcut' | 'slit') => k === 'vcut' ? (isKo ? 'V-컷' : 'V-cut') : (isKo ? '일자 절개' : 'Straight slit');

  const handleCopy = async () => {
    if (!seg || !routeKey) return;
    const lines = [
      `[${isKo ? '케이블 트레이 경사·오프셋 가공' : 'Cable Tray Bend Fabrication'}]`,
      `${isKo ? '구간' : 'Segment'}: ${routeName(routeKey)} · ${isKo ? '폭' : 'W'} ${trayWidth}mm · ${isKo ? '레일' : 'Rail'} ${trayHeight}mm`,
      `${isKo ? '각도' : 'Angle'}: ${seg.angleDeg.toFixed(1)}° · ${isKo ? '사선 길이' : 'Slope'}: ${seg.slopeLengthM.toFixed(3)}m`,
      ...(seg.isVerticalRiser ? [] : [
        ...seg.bends.map(b => `${isKo ? '꺾임' : 'Bend'} ${b.index}: ${cutName(b.kind)} · ${isKo ? '한쪽' : 'half'} ${b.halfMm.toFixed(1)}mm / ${isKo ? '전체' : 'full'} ${b.fullMm.toFixed(1)}mm / ${isKo ? '깊이' : 'depth'} ${b.depthMm}mm`),
        `${isKo ? '마킹 간격 A' : 'Marking A'}: ${Math.round(seg.markingAmm)}mm`,
        `${isKo ? '지지점(꺾임①부터)' : 'Supports (from bend 1)'}: ${supports.map(x => `${x.toFixed(2)}m`).join(', ')}`,
      ]),
      elbow ? `${isKo ? '기성 엘보' : 'Factory elbow'}: ${elbow.elbowDeg}° ${elbow.elbowDeg < 90 ? `(L ${elbow.runForRiseM.toFixed(2)}m)` : ''}` : '',
      `theutilhub.com/${locale}/utilities/utility/cable-tray-calc`,
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMsg(isKo ? '✓ 복사됨' : '✓ Copied');
    } catch {
      setCopyMsg(isKo ? '복사 실패 — 직접 선택해 복사하세요' : 'Copy failed — select and copy manually');
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const titleStr = isKo ? '케이블 트레이 경사·오프셋 가공 계산기' : 'Cable Tray Slope & Offset Fabrication Calculator';
  const descStr = isKo
    ? '높이차와 거리만 넣으면 꺾임 두 곳의 V-컷·일자 절개 치수, 마킹 간격, 지지점 위치를 계산하고 3D로 접히는 모습을 보여줍니다.'
    : 'Enter rise and run to get V-cut and slit dimensions for both bends, marking distance and support positions, with a 3D fold preview.';

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><Ruler size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      {/* ── STEP 1 구간 종류 ── */}
      <section className={s.step_card}>
        <div className={s.step_label}>STEP 1</div>
        <h2 className={s.step_title}>{isKo ? '어떤 구간인가요?' : 'What kind of segment?'}</h2>
        <div className={s.route_grid} role="radiogroup" aria-label={isKo ? '구간 종류' : 'Segment type'}>
          {(['up', 'down', 'offset'] as const).map(k => (
            <button key={k} type="button" role="radio" aria-checked={routeKey === k}
              className={`${s.route_card} ${routeKey === k ? s.route_active : ''}`}
              onClick={() => { setRouteKey(k); setActiveBend(0); }}>
              <RouteIcon kind={k} />
              <span className={s.route_label}>{routeName(k)}</span>
              <span className={s.route_desc}>
                {k === 'up' && (isKo ? '수평 → 위로 → 수평 (상하 꺾임)' : 'Level → up → level')}
                {k === 'down' && (isKo ? '수평 → 아래로 → 수평 (상하 꺾임)' : 'Level → down → level')}
                {k === 'offset' && (isKo ? '같은 높이에서 옆으로 비킴 (좌우 꺾임)' : 'Shift sideways on the same level')}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className={s.example_btn} onClick={fillExample}>
          {isKo ? '예시 채우기: 천장 랙에서 0.25m 내려가는 30° 구간' : 'Example: 30° drop of 0.25 m from a ceiling rack'}
        </button>

        <div className={s.spec_grid}>
          <div>
            <label className={s.field_label} htmlFor="ct-width">{isKo ? '트레이 폭 (mm)' : 'Tray width (mm)'}</label>
            <select id="ct-width" className={s.select_field} value={trayWidth} onChange={e => setTrayWidth(Number(e.target.value))}>
              {TRAY_WIDTHS.map(w => <option key={w} value={w}>{w}mm</option>)}
            </select>
          </div>
          <div>
            <label className={s.field_label} htmlFor="ct-height">{isKo ? '측면 레일 높이 (mm)' : 'Side rail height (mm)'}</label>
            <select id="ct-height" className={s.select_field} value={trayHeight} onChange={e => setTrayHeight(Number(e.target.value))}>
              {TRAY_HEIGHTS.map(h => <option key={h} value={h}>{h}mm</option>)}
            </select>
            <p className={s.field_hint}>{isKo ? '바닥에서 레일 윗면까지' : 'From bottom to top of rail'}</p>
          </div>
        </div>
      </section>

      {/* ── STEP 2 치수 ── */}
      {route && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 2</div>
          <h2 className={s.step_title}>{isKo ? '치수 입력' : 'Dimensions'}</h2>
          <MeasureDiagram direction={direction} down={routeKey === 'down'} isKo={isKo} />

          <div className={s.mode_toggle}>
            <button type="button" className={`${s.mode_btn} ${inputMode === 'preset' ? s.mode_active : ''}`}
              aria-pressed={inputMode === 'preset'} onClick={() => setInputMode('preset')}>
              {isKo ? '각도로 정하기' : 'By angle'}
            </button>
            <button type="button" className={`${s.mode_btn} ${inputMode === 'manual' ? s.mode_active : ''}`}
              aria-pressed={inputMode === 'manual'} onClick={() => setInputMode('manual')}>
              {isKo ? '실측 H·L 입력' : 'Measured H & L'}
            </button>
          </div>

          {inputMode === 'preset' && (
            <div className={s.preset_grid}>
              {PRESET_ANGLES.map(a => (
                <button key={a} type="button" className={`${s.preset_btn} ${presetAngle === a ? s.preset_active : ''}`}
                  aria-pressed={presetAngle === a} aria-label={isKo ? `${a}도 선택` : `Select ${a} degrees`}
                  onClick={() => setPresetAngle(a)}>
                  {a}°
                </button>
              ))}
            </div>
          )}

          <div className={s.spec_grid}>
            <div>
              <label className={s.field_label} htmlFor="ct-rise">{riseLabel}</label>
              <input id="ct-rise" className={s.field_input} type="number" inputMode="decimal" step="0.01" min="0"
                placeholder={isKo ? '예: 0.25' : 'e.g. 0.25'} value={riseText} onChange={e => setRiseText(e.target.value)} />
            </div>
            {inputMode === 'manual' && (
              <div>
                <label className={s.field_label} htmlFor="ct-run">{runLabel}</label>
                <input id="ct-run" className={s.field_input} type="number" inputMode="decimal" step="0.01" min="0"
                  placeholder={isKo ? '예: 0.43' : 'e.g. 0.43'} value={runText} onChange={e => setRunText(e.target.value)} />
                {direction === 'vertical' && (
                  <p className={s.field_hint}>{isKo ? '수직으로 올라가면 0 입력' : 'Enter 0 for a vertical riser'}</p>
                )}
              </div>
            )}
          </div>
          {inputMode === 'manual' && direction === 'horizontal' && runText.trim() !== '' && run <= 0 && (
            <div className={s.warn_box}>{isKo ? '옆으로 비키는 구간은 진행 거리 L이 0보다 커야 합니다. 90° 방향 전환은 기성 90° 수평 엘보를 사용하세요.' : 'Run L must be greater than 0. For a 90° turn use a factory 90° horizontal elbow.'}</div>
          )}
        </section>
      )}

      {/* ── STEP 3 결과 + 시공 방식 ── */}
      {seg && elbow && routeKey && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 3</div>
          <h2 className={s.step_title}>{isKo ? '계산 결과와 시공 방식' : 'Results and method'}</h2>

          <div className={s.result_big_grid}>
            <div className={s.result_big}>
              <span className={s.result_num}>{seg.angleDeg.toFixed(1)}</span><span className={s.result_unit}>°</span>
              <div className={s.result_label}>{isKo ? '꺾임 각도' : 'Bend angle'}</div>
            </div>
            <div className={s.result_big}>
              <span className={s.result_num}>{seg.slopeLengthM.toFixed(3)}</span><span className={s.result_unit}>m</span>
              <div className={s.result_label}>{isKo ? '사선 길이 (꺾임 ①→②)' : 'Slope length (bend 1→2)'}</div>
            </div>
          </div>
          <div className={s.result_sub_grid}>
            <div className={s.result_sub}><span>{isKo ? '진행 거리 L' : 'Run L'}</span><strong>{run.toFixed(3)}m</strong></div>
            <div className={s.result_sub}><span>{direction === 'vertical' ? (isKo ? '높이차 H' : 'Rise H') : (isKo ? '옆 이동 D' : 'Offset D')}</span><strong>{rise.toFixed(3)}m</strong></div>
            <div className={s.result_sub}><span>{isKo ? '자재 +5%' : 'Order +5%'}</span><strong>{(seg.slopeLengthM * 1.05).toFixed(2)}m</strong></div>
            <div className={s.result_sub}><span>{isKo ? '자재 +10%' : 'Order +10%'}</span><strong>{(seg.slopeLengthM * 1.1).toFixed(2)}m</strong></div>
          </div>

          <div className={s.method_grid}>
            <div className={`${s.method_card} ${seg.fieldBendOk && !seg.isVerticalRiser ? '' : s.method_dim}`}>
              <h3>{isKo ? '① 현장 가공 (자르고 접기)' : 'A. Field fabrication (cut & bend)'}</h3>
              {seg.isVerticalRiser ? (
                <span>{isKo ? '90° 수직 전환은 현장 가공 대상이 아닙니다. 아래쪽(①)과 위쪽(②)에 90° 수직 엘보를 하나씩 씁니다.' : 'A 90° vertical change is not field-bent. Use one 90° vertical elbow at the bottom (1) and one at the top (2).'}</span>
              ) : (
                <>
                  <span>{isKo ? `꺾임 두 곳을 가공하고 각도 조절형 연결판으로 고정합니다. 아래 STEP 4 치수를 사용하세요.` : 'Cut both bends and join them with adjustable splice plates. Use the STEP 4 dimensions below.'}</span>
                  {!seg.fieldBendOk && (
                    <strong>{isKo ? `${FIELD_BEND_MAX_DEG}°를 넘으면 현장 가공보다 기성 엘보를 권장합니다.` : `Above ${FIELD_BEND_MAX_DEG}°, factory elbows are recommended.`}</strong>
                  )}
                </>
              )}
            </div>
            <div className={s.method_card}>
              <h3>{isKo ? '② 기성 엘보 사용' : 'B. Factory elbows'}</h3>
              <span>
                {isKo ? '가장 가까운 규격: ' : 'Nearest size: '}
                <strong>{elbow.elbowDeg}° {direction === 'vertical' ? (isKo ? '수직 엘보' : 'vertical elbow') : (isKo ? '수평 엘보' : 'horizontal elbow')} × 2</strong>
              </span>
              {elbow.elbowDeg < 90 && Math.abs(elbow.elbowDeg - seg.angleDeg) > 0.5 && (
                <span>
                  {isKo
                    ? `같은 ${direction === 'vertical' ? '높이차' : '옆 이동'} ${rise.toFixed(2)}m를 ${elbow.elbowDeg}°로 맞추려면 진행 거리 L을 약 ${elbow.runForRiseM.toFixed(2)}m로 잡으세요.`
                    : `To keep ${rise.toFixed(2)} m at ${elbow.elbowDeg}°, set run L to about ${elbow.runForRiseM.toFixed(2)} m.`}
                </span>
              )}
              <span className={s.field_hint}>{isKo ? '엘보는 곡률 반경이 있어 시작·끝 위치가 달라집니다. 제조사 카탈로그 치수를 확인하세요.' : 'Elbows have a radius, so start/end points shift. Check the manufacturer catalog.'}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 4 꺾임별 가공 ── */}
      {seg && bend && !seg.isVerticalRiser && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 4</div>
          <h2 className={s.step_title}>{isKo ? '꺾임별 가공 치수' : 'Cut dimensions per bend'}</h2>
          <p className={s.step_hint}>
            {direction === 'vertical'
              ? (isKo ? '상하 꺾임은 바닥판을 접고 양쪽 측면 레일만 가공합니다. 바닥판은 자르지 않습니다.' : 'For vertical bends the bottom folds; only the two side rails are cut. Never cut the bottom.')
              : (isKo ? '좌우 꺾임은 바닥판에 V-컷을 넣고 안쪽 레일을 잘라내며, 바깥 레일은 자르지 않고 접습니다.' : 'For horizontal bends, V-cut the bottom, remove the inner rail section and fold the outer rail.')}
          </p>

          <SegmentOverview bends={seg.bends} markingAmm={seg.markingAmm} direction={direction} isKo={isKo} />
          <p className={s.step_hint}>
            {direction === 'vertical'
              ? (isKo ? `마킹 간격 A = 두 꺾임 중심선 사이를 바닥판을 따라 잰 거리 (${Math.round(seg.markingAmm)}mm).` : `Marking A = distance between the two bend centerlines along the bottom (${Math.round(seg.markingAmm)} mm).`)
              : (isKo ? `마킹 간격 A = 평평한 자재에서 두 V-컷 중심선 사이 거리 (${Math.round(seg.markingAmm)}mm). 중심선 사선 길이에 V-컷으로 줄어드는 몫을 더한 값입니다.` : `Marking A = distance between the two V-cut centerlines on the flat tray (${Math.round(seg.markingAmm)} mm), including the length lost to the V-cuts.`)}
          </p>

          <div className={s.bend_tabs} role="tablist" aria-label={isKo ? '꺾임 선택' : 'Select bend'}>
            {seg.bends.map((b, i) => (
              <button key={b.index} type="button" role="tab" aria-selected={activeBend === i}
                className={`${s.chip} ${activeBend === i ? s.chip_active : ''}`} onClick={() => setActiveBend(i as 0 | 1)}>
                {isKo ? `꺾임 ${b.index}` : `Bend ${b.index}`} · {cutName(b.kind)}
              </button>
            ))}
          </div>

          <div className={s.cut_grid}>
            <div className={s.cut_card}>
              <div className={`${s.cut_num} ${s.cut_num_key}`}>{bend.halfMm.toFixed(1)}</div>
              <div className={s.cut_unit}>mm</div>
              <div className={s.cut_label}>{bend.kind === 'vcut' ? (isKo ? '중심선에서 한쪽' : 'Each side of center') : (isKo ? '벌어지는 틈 한쪽' : 'Gap, each side')}</div>
            </div>
            <div className={s.cut_card}>
              <div className={s.cut_num}>{bend.fullMm.toFixed(1)}</div>
              <div className={s.cut_unit}>mm</div>
              <div className={s.cut_label}>{bend.kind === 'vcut' ? (isKo ? 'V-컷 전체 폭' : 'Full V width') : (isKo ? '접은 뒤 틈 (윗면)' : 'Gap after bending')}</div>
            </div>
            <div className={s.cut_card}>
              <div className={s.cut_num}>{bend.depthMm}</div>
              <div className={s.cut_unit}>mm</div>
              <div className={s.cut_label}>
                {direction === 'vertical'
                  ? (isKo ? '절단 깊이 (레일 높이)' : 'Cut depth (rail height)')
                  : (isKo ? 'V 길이 (트레이 폭)' : 'V length (tray width)')}
              </div>
            </div>
          </div>

          <TrayBend3D direction={direction} kind={bend.kind} angleDeg={seg.angleDeg}
            widthMm={trayWidth} heightMm={trayHeight} isKo={isKo} />
          <BendDetail bend={bend} direction={direction} isKo={isKo} />

          <div className={s.info_box}>
            {isKo
              ? '볼트 구멍: 꺾은 뒤 각도 조절형 연결판을 절단면에 맞춰 대고, 연결판 구멍 위치를 표시해 천공합니다(연결판을 형판으로 사용). 구멍 크기는 기존 트레이 구멍과 같게 맞추고, 절단·천공 부위는 버를 제거한 뒤 아연 보수 도장을 합니다.'
              : 'Bolt holes: after bending, clamp the adjustable splice plate against the cut ends and drill through its holes (use the plate as a template). Match the existing hole size, deburr, and touch up galvanizing on cut edges.'}
          </div>
          {!seg.fieldBendOk && (
            <div className={s.warn_box}>
              {isKo
                ? `${seg.angleDeg.toFixed(1)}°는 현장 가공 권장 범위(${FIELD_BEND_MAX_DEG}° 이하)를 넘습니다. 기성 엘보를 쓰거나, 꺾임을 두 번으로 나눠(예: 30° + 30°) 가공하세요.`
                : `${seg.angleDeg.toFixed(1)}° exceeds the recommended field-bend range (≤ ${FIELD_BEND_MAX_DEG}°). Use factory elbows or split the bend in two (e.g. 30° + 30°).`}
            </div>
          )}
        </section>
      )}

      {/* ── STEP 5 지지 ── */}
      {seg && (
        <section className={s.step_card}>
          <div className={s.step_label}>{seg.isVerticalRiser ? 'STEP 4' : 'STEP 5'}</div>
          <h2 className={s.step_title}>{isKo ? '지지(행거) 위치' : 'Support (hanger) positions'}</h2>
          {seg.isVerticalRiser ? (
            <div className={s.info_box}>
              {isKo
                ? '수직 엘보는 위쪽 엘보는 양 끝을, 아래쪽 엘보는 엘보 윗부분과 아래 끝에서 600mm 이내를 지지합니다. 긴 수직 구간은 제조사 허용 간격에 따라 벽면 브래킷으로 고정하세요.'
                : 'Support top vertical elbows at each end; support bottom elbows at the top of the elbow and within 600 mm of the lower end. Fix long risers to the wall per the manufacturer span.'}
            </div>
          ) : (
            <>
              <div className={s.spec_grid}>
                <div>
                  <label className={s.field_label} htmlFor="ct-span">{isKo ? '최대 지지 간격 (m)' : 'Max support span (m)'}</label>
                  <input id="ct-span" className={s.field_input} type="number" inputMode="decimal" step="0.1" min="0.3"
                    value={maxSpanText} onChange={e => setMaxSpanText(e.target.value)} />
                  <p className={s.field_hint}>{isKo ? '설계도서·제조사 허용 간격을 입력하세요. 기본 1.5m는 국내 실무 관례값입니다.' : 'Use the design or manufacturer span. 1.5 m is a common default.'}</p>
                </div>
              </div>
              <p className={s.step_hint}>{isKo ? '사선 구간 지지점 (꺾임 ①에서 잰 거리):' : 'Supports on the slope (measured from bend 1):'}</p>
              <ul className={s.support_list}>
                {supports.map((x, i) => <li key={i}>{x.toFixed(2)} m</li>)}
              </ul>
              <p className={s.step_hint}>
                {isKo
                  ? `꺾임부(연결판) 양쪽 ${SUPPORT_NEAR_JOINT_M * 1000}mm 이내에 지지점을 둡니다. 꺾임 ① 앞쪽, ② 뒤쪽 직선 구간에도 각각 ${SUPPORT_NEAR_JOINT_M * 1000}mm 이내에 하나씩 추가하세요.`
                  : `Place a support within ${SUPPORT_NEAR_JOINT_M * 1000} mm of each side of every bend joint, including the straight runs before bend 1 and after bend 2.`}
              </p>
            </>
          )}
          <p className={s.source_note}>
            {isKo
              ? '근거: NEMA VE 2 케이블트레이 설치 지침 4.3.3~4.3.4(조절형 연결판 양쪽 600mm 이내 지지), 4.4.1(엘보 지지 위치), 4.5(현장 가공·천공). 한국전기설비규정(KEC)과 KCS 31 65 10에는 트레이 지지 간격 수치가 따로 없으므로 설계도서와 제조사 기준을 우선합니다.'
              : 'Basis: NEMA VE 2 Cable Tray Installation Guidelines 4.3.3–4.3.4 (supports within 600 mm of adjustable splice plates), 4.4.1 (elbow supports), 4.5 (field cutting and drilling). Korean codes (KEC, KCS 31 65 10) give no numeric tray span, so project and manufacturer specs take priority.'}
          </p>

          <button type="button" className={s.copy_btn} onClick={handleCopy}>
            <Copy size={16} /> {isKo ? '전체 결과 복사' : 'Copy all results'}
          </button>
          {copyMsg && <p className={`${s.copy_msg} ${copyMsg.startsWith('✓') ? '' : s.copy_msg_fail}`} role="status">{copyMsg}</p>}
        </section>
      )}

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/cable-tray-calc" />
      <div className={s.ad_slot}>AD</div>
      <SeoSection
        ko={{
          title: '케이블 트레이 경사·오프셋 가공 계산기란 무엇인가요?',
          description: '전기공사 현장에서 케이블 트레이를 경사 구간(오르막·내리막)이나 옆으로 비키는 오프셋 구간에 맞게 직접 자르고 접을 때 필요한 치수를 계산하는 도구입니다. 높이차 H와 진행 거리 L(또는 30°·45°·60° 각도와 H)을 넣으면 꺾임 각도와 사선 길이를 구하고, 구간을 이루는 꺾임 두 곳 각각에 대해 V-컷인지 일자 절개인지, 중심선에서 한쪽으로 몇 mm를 표시해야 하는지, 두 꺾임 사이 마킹 간격 A가 얼마인지 알려줍니다. 상하 꺾임은 바닥판이 접히는 축이므로 레일이 안쪽으로 접히는 쪽(오르막 시작·내리막 끝)은 V-컷, 바깥으로 벌어지는 쪽은 일자 절개가 됩니다. 좌우 꺾임은 바닥판에 V-컷을 넣고 안쪽 레일을 잘라내며 바깥 레일은 접습니다. 3D 형상으로 평평한 트레이가 실제 각도로 접히는 과정을 돌려 볼 수 있고, 실제 비율 마킹 상세도와 NEMA VE 2 기준 지지점 위치도 함께 제공합니다.',
          useCases: [
            { icon: '✂️', title: '오르막·내리막 구간 가공', desc: '천장 랙에서 장비 쪽으로 0.25m 내려가는 30° 구간처럼 높이가 바뀌는 곳에서 꺾임 두 곳의 V-컷과 일자 절개 위치, 레일 높이 100mm 기준 한쪽 26.8mm 같은 마킹 치수를 바로 구합니다.' },
            { icon: '↔️', title: '기둥·덕트 피하는 오프셋', desc: '같은 높이에서 기둥이나 덕트를 피해 옆으로 비켜야 할 때, 옆 이동 거리와 진행 거리로 각도를 구하고 바닥판 V-컷 폭과 잘라낼 안쪽 레일 길이를 계산합니다.' },
            { icon: '🧊', title: '3D로 접히는 모습 확인', desc: '처음 가공하는 초보자도 어느 쪽을 자르고 어디를 접는지 헷갈리지 않도록, 평평한 상태에서 실제 각도까지 접히는 3D 형상을 손가락으로 돌려 가며 확인할 수 있습니다. V-컷 폭, 레일 높이, 트레이 폭, 현재 꺾임 각도가 각 부위에 함께 표시됩니다.' },
            { icon: '🔩', title: '지지점 위치와 엘보 대안', desc: '꺾임부 양쪽 600mm 이내와 최대 지지 간격을 반영해 사선 구간 지지점 위치를 계산하고, 현장 가공 대신 기성 엘보를 쓸 경우 가장 가까운 규격과 맞춰야 할 진행 거리도 함께 보여줍니다.' },
          ],
          steps: [
            { step: '구간 종류와 규격 선택', desc: '오르막, 내리막, 옆으로 비키기 중 현장 모양과 같은 그림을 고르고 트레이 폭과 측면 레일 높이를 선택합니다. 상하 꺾임은 레일 높이, 좌우 꺾임은 트레이 폭이 가공 기준 치수가 됩니다.' },
            { step: '치수 입력', desc: '각도를 정해 두었다면 30°·45°·60° 중 하나와 높이차(또는 옆 이동 거리)를, 현장에서 실측했다면 H와 L을 입력합니다. 그림처럼 상하는 트레이 바닥, 좌우는 트레이 중심선을 기준으로 잽니다.' },
            { step: '꺾임별 치수와 3D 확인', desc: '꺾임 ①·② 탭을 바꿔 가며 V-컷 한쪽 폭, 전체 폭, 절단 깊이를 확인하고, 3D 형상과 실제 비율 상세도를 보며 중심선에서 양쪽으로 표시합니다. 두 꺾임 사이는 마킹 간격 A만큼 띄웁니다.' },
            { step: '지지점 배치와 결과 공유', desc: '설계도서나 제조사의 최대 지지 간격을 넣으면 사선 구간 지지점 위치가 나옵니다. "전체 결과 복사"로 모든 치수를 복사해 동료나 반장에게 전달하세요.' },
          ],
          faqs: [
            { q: '오르막 구간인데 왜 한쪽은 V-컷이고 한쪽은 일자 절개인가요?', a: '상하 꺾임에서는 바닥판이 접히는 축이 됩니다. 오르막이 시작되는 곳은 레일 윗부분끼리 가까워지므로 겹치는 부분을 V자로 잘라내야 하고, 오르막이 끝나 다시 수평이 되는 곳은 레일 윗부분이 벌어지므로 일자로 절개한 뒤 벌어진 틈을 연결판으로 덮습니다. 내리막은 그 반대입니다.' },
            { q: 'V-컷 치수는 어떻게 계산하나요?', a: 'V-컷 한쪽 폭은 기준 치수 × tan(꺾임 각도 ÷ 2)입니다. 상하 꺾임은 측면 레일 높이, 좌우 꺾임은 트레이 폭이 기준 치수입니다. 예를 들어 레일 높이 100mm에서 30°로 꺾으면 한쪽 26.8mm, 전체 53.6mm를 레일 윗면에 표시하고 바닥판 쪽 한 점까지 V자로 자릅니다.' },
            { q: '볼트 구멍은 어디에 뚫나요?', a: '구멍 위치를 중심선에서 고정 치수로 정하지 않습니다. 꺾은 뒤 각도 조절형 연결판을 절단면에 맞춰 대고, 연결판 구멍을 형판 삼아 표시한 다음 기존 트레이 구멍과 같은 크기로 천공합니다(NEMA VE 2 4.5.3). 절단·천공 부위는 버를 제거하고 아연 보수 도장을 합니다.' },
            { q: '행거(지지) 간격은 어떤 기준인가요?', a: '한국전기설비규정과 표준시방서에는 케이블트레이 지지 간격 수치가 따로 없어 설계도서와 제조사 허용 간격을 따릅니다. 이 계산기는 입력한 최대 간격과, 조절형 연결판 양쪽 600mm 이내에 지지점을 두라는 NEMA VE 2 권장을 함께 반영해 위치를 계산합니다. 기본값 1.5m는 국내 실무 관례값입니다.' },
          ],
        }}
        en={{
          title: 'What is the Cable Tray Slope & Offset Fabrication Calculator?',
          description: 'This tool gives electricians the numbers needed to field-cut and bend a channel or ladder cable tray for a slope (rise or drop) or a sideways offset. Enter the rise H and run L, or pick 30°, 45° or 60° with a rise, and it returns the bend angle and slope length, then for each of the two bends in the segment tells you whether it is a V-cut or a straight slit, how far to mark on each side of the centerline, and the marking distance A between the bends. In a vertical bend the bottom is the fold axis, so the bend where the rails close (start of a rise, end of a drop) needs a V-cut and the bend where they open needs a straight slit. In a horizontal bend the bottom gets the V-cut, the inner rail section is removed and the outer rail folds. A rotatable 3D view shows the flat tray folding to the real angle, alongside a true-proportion marking detail and support positions based on NEMA VE 2.',
          useCases: [
            { icon: '✂️', title: 'Rises and Drops', desc: 'For a 30° drop of 0.25 m from a ceiling rack, get where each bend needs a V-cut or a slit and the marks to make, such as 26.8 mm each side of center on a 100 mm rail.' },
            { icon: '↔️', title: 'Offsets Around Columns', desc: 'When the tray must shift sideways around a column or duct at the same level, get the angle from offset and run, the V-cut width in the bottom and the length of inner rail to remove.' },
            { icon: '🧊', title: 'See the Fold in 3D', desc: 'Rotate a 3D model that folds from flat to the real angle, so new installers can see exactly which part is cut away and which part bends before touching the grinder. V-cut width, rail height, tray width and the current bend angle are labelled on the model.' },
            { icon: '🔩', title: 'Supports and Elbow Alternative', desc: 'Get support positions on the slope that respect a maximum span and the 600 mm rule at bend joints, plus the nearest factory elbow size and the run needed if you buy fittings instead.' },
          ],
          steps: [
            { step: 'Pick the Segment and Tray', desc: 'Choose rise, drop or side offset to match the site, then the tray width and side rail height. Rail height is the reference for vertical bends and tray width for horizontal bends.' },
            { step: 'Enter Dimensions', desc: 'Pick 30°, 45° or 60° and enter the rise (or offset), or enter measured H and L. Measure at the tray bottom for vertical bends and at the tray centerline for offsets, as shown in the diagram.' },
            { step: 'Check Each Bend', desc: 'Switch between bend 1 and bend 2 to see half width, full width and cut depth. Use the 3D view and true-proportion detail to mark both sides of the centerline, and space the bends by distance A.' },
            { step: 'Place Supports and Share', desc: 'Enter the maximum span from the design or manufacturer to get support positions on the slope, then copy all results to send to your foreman or crew.' },
          ],
          faqs: [
            { q: 'Why is one bend a V-cut and the other a slit?', a: 'In a vertical bend the tray bottom is the fold axis. Where a rise starts, the top edges of the rails move together, so the overlapping material is removed with a V-cut. Where the rise ends and the tray levels out, the rails spread apart, so they are slit straight and the gap is covered with a splice plate. A drop is the reverse.' },
            { q: 'How is the V-cut size calculated?', a: 'Half width equals the reference dimension times tan(bend angle ÷ 2). The reference is the side rail height for vertical bends and the tray width for horizontal bends. For a 100 mm rail at 30°, mark 26.8 mm each side of center (53.6 mm total) on the rail top and cut down to a point at the bottom.' },
            { q: 'Where do the bolt holes go?', a: 'Not at a fixed distance from the centerline. After bending, clamp the adjustable splice plate against the cut ends, use its holes as a template, and drill to match the existing tray holes (NEMA VE 2, 4.5.3). Deburr and touch up galvanizing on cut edges.' },
            { q: 'What is the support spacing based on?', a: 'Korean codes give no numeric cable tray span, so follow the project and manufacturer specification. The calculator combines your maximum span with the NEMA VE 2 recommendation to place a support within 600 mm of each side of an adjustable splice plate. The 1.5 m default is a common field value.' },
          ],
        }}
      />
    </div>
  );
}
