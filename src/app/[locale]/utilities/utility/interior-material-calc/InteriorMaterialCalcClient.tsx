'use client';

import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { LayoutGrid, Copy, AlertTriangle } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './interior-material-calc.module.css';

// ── Constants ──────────────────────────────────────────────────────────
const TILE_PRESETS = [
  { label: '300×300mm', w: 300, h: 300 },
  { label: '600×600mm', w: 600, h: 600 },
  { label: '600×1200mm', w: 600, h: 1200 },
  { label: '300×600mm', w: 300, h: 600 },
  { label: '직접 입력', w: 0, h: 0 },
];

const PAPER_TYPES = [
  { label: '실크벽지 (표준)', sub: '폭 1.06m × 15.6m/롤', labelEn: 'Silk (Standard)', subEn: '1.06m wide × 15.6m/roll', rollW: 1.06, rollL: 15.6 },
  { label: '광폭합지', sub: '폭 0.93m × 17.7m/롤', labelEn: 'Wide Vinyl', subEn: '0.93m wide × 17.7m/roll', rollW: 0.93, rollL: 17.7 },
  { label: '소폭합지', sub: '폭 0.53m × 12.5m/롤', labelEn: 'Narrow Vinyl', subEn: '0.53m wide × 12.5m/roll', rollW: 0.53, rollL: 12.5 },
  { label: '직접 입력', sub: '폭/길이 직접 입력', labelEn: 'Custom', subEn: 'Enter width/length', rollW: 0, rollL: 0 },
];

const SVG_W = 400;
const SVG_H = 300;
const LEGEND_H = 24;
const SVG_TOTAL_H = SVG_H + LEGEND_H;
const SVG_W_WALL = 360;
const SVG_H_WALL = 280;
const TOLERANCE = 0.1;
const MAX_SVG_TILES = 2000;

// ── Component ──────────────────────────────────────────────────────────
export default function InteriorMaterialCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [activeTab, setActiveTab] = useState<'tile' | 'wallpaper'>('tile');

  // ── Tile state (탭 전환 시 초기화 방지 — 최상위 관리)
  const [tileAreaW, setTileAreaW] = useState('');
  const [tileAreaH, setTileAreaH] = useState('');
  const [tilePresetIdx, setTilePresetIdx] = useState(1); // 600×600 default
  const [tileW, setTileW] = useState(600);
  const [tileH, setTileH] = useState(600);
  const [tileGap, setTileGap] = useState(2);
  const [tilePattern, setTilePattern] = useState<'grid' | 'staggered'>('grid');
  const [boxPcs, setBoxPcs] = useState(4);

  // ── Wallpaper state
  const [perimeter, setPerimeter] = useState('');
  const [ceilingH, setCeilingH] = useState(2.3);
  const [paperTypeIdx, setPaperTypeIdx] = useState(0);
  const [rollW, setRollW] = useState(1.06);
  const [rollL, setRollL] = useState(15.6);
  const [patternRepeat, setPatternRepeat] = useState(0);

  // ── Copy state
  const [tileCopyMsg, setTileCopyMsg] = useState<string | null>(null);
  const [wpCopyMsg, setWpCopyMsg] = useState<string | null>(null);

  // ── Tile calculation ────────────────────────────────────────────────
  const tileResult = useMemo(() => {
    const aw = parseFloat(tileAreaW);
    const ah = parseFloat(tileAreaH);
    if (!aw || aw <= 0 || !ah || ah <= 0) return null;
    if (!tileW || tileW <= 0 || !tileH || tileH <= 0) return null;
    const bp = Math.max(1, boxPcs);

    // STEP 1: 줄눈 포함 유효 타일 크기
    const effectiveTileW = tileW + tileGap;
    const effectiveTileH = tileH + tileGap;

    // STEP 2: 가로/세로 필요 장수 (올림)
    const cols = Math.ceil(aw / effectiveTileW);
    const rows = Math.ceil(ah / effectiveTileH);
    const baseCount = cols * rows;

    // STEP 3: 패턴별 로스율 (복리 적용)
    const patternLossRate = tilePattern === 'staggered' ? 0.05 : 0;
    const patternCount = Math.ceil(baseCount * (1 + patternLossRate));
    const safeCount = Math.ceil(patternCount * 1.10);
    const totalLossRate = ((1 + patternLossRate) * 1.10 - 1) * 100;

    // STEP 4: 박스 환산
    const requiredBoxes = Math.ceil(safeCount / bp);
    const totalOrderPcs = requiredBoxes * bp;

    // SVG 스케일 (비율 왜곡 방지: Math.min 공통 스케일)
    const scale = Math.min(SVG_W / aw, SVG_H / ah);
    const drawW = aw * scale;
    const drawH = ah * scale;
    const originX = (SVG_W - drawW) / 2;
    const originY = (SVG_H - drawH) / 2;
    const svgTileW = tileW * scale;
    const svgTileH = tileH * scale;
    const svgEffTileW = (tileW + tileGap) * scale;
    const svgEffTileH = (tileH + tileGap) * scale;
    const shouldRenderSVG = cols * rows <= MAX_SVG_TILES;

    return {
      aw, ah, cols, rows, baseCount,
      patternLossRate, patternCount,
      safeCount, totalLossRate,
      requiredBoxes, totalOrderPcs, bp,
      svg: { scale, drawW, drawH, originX, originY, svgTileW, svgTileH, svgEffTileW, svgEffTileH, shouldRenderSVG },
    };
  }, [tileAreaW, tileAreaH, tileW, tileH, tileGap, tilePattern, boxPcs]);

  // ── Wallpaper calculation ───────────────────────────────────────────
  const wpCalc = useMemo(() => {
    const p = parseFloat(perimeter);
    if (!p || p <= 0 || !ceilingH || ceilingH <= 0 || !rollW || rollW <= 0 || !rollL || rollL <= 0) {
      return { result: null, error: null };
    }

    const margin = 0.1;
    const lengthPerStrip = ceilingH + margin + patternRepeat;

    // 층고 초과 방어 (Infinity 방지 — stripsPerRoll 계산 전)
    if (lengthPerStrip >= rollL) {
      return {
        result: null,
        error: isKo
          ? '층고 + 패턴 여유분이 롤 길이를 초과합니다. 더 긴 롤을 선택해주세요.'
          : 'Strip length exceeds roll length. Please select a longer roll.',
      };
    }

    const stripsNeeded = Math.ceil(p / rollW);
    const stripsPerRoll = Math.floor(rollL / lengthPerStrip); // 반드시 내림
    const rollsNeeded = Math.ceil(stripsNeeded / stripsPerRoll);
    const totalStrips = rollsNeeded * stripsPerRoll;
    const wasteStrips = totalStrips - stripsNeeded;
    const lossRate = ((wasteStrips / totalStrips) * 100).toFixed(1);

    // SVG 비율
    const usableRatio = (ceilingH + margin) / rollL;
    const patternRatio = patternRepeat / rollL;
    const wasteRatio = (rollL - lengthPerStrip) / rollL;
    const displayStrips = Math.min(stripsPerRoll, 10);
    const stripSvgW = displayStrips > 0 ? (SVG_W_WALL - 4) / displayStrips - 2 : 0;

    return {
      result: {
        stripsNeeded, stripsPerRoll, rollsNeeded,
        totalStrips, wasteStrips, lossRate, lengthPerStrip,
        svg: { usableRatio, patternRatio, wasteRatio, displayStrips, stripSvgW },
      },
      error: null,
    };
  }, [perimeter, ceilingH, rollW, rollL, patternRepeat, isKo]);

  // ── Handlers ────────────────────────────────────────────────────────
  function handleTilePreset(idx: number) {
    setTilePresetIdx(idx);
    const p = TILE_PRESETS[idx];
    if (p.w > 0) { setTileW(p.w); setTileH(p.h); }
  }

  function handlePaperType(idx: number) {
    setPaperTypeIdx(idx);
    const p = PAPER_TYPES[idx];
    if (p.rollW > 0) { setRollW(p.rollW); setRollL(p.rollL); }
  }

  async function copyTile() {
    if (!tileResult) return;
    const text = [
      '[타일 소요량 계산 결과]',
      `타일 규격: ${tileW}×${tileH}mm`,
      `시공 면적: ${tileAreaW}×${tileAreaH}mm`,
      `시공 패턴: ${tilePattern === 'grid' ? '정자 붙이기' : '지그재그'}`,
      `순수 필요 장수: ${tileResult.baseCount}장`,
      `총 필요 장수 (로스 포함): ${tileResult.safeCount}장`,
      `총 로스율: 약 ${tileResult.totalLossRate.toFixed(1)}%`,
      `권장 주문: ${tileResult.requiredBoxes}박스 (${tileResult.totalOrderPcs}장)`,
      '📐 theutilhub.com/utilities/utility/interior-material-calc',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setTileCopyMsg('✅ 복사 완료!');
      setTimeout(() => setTileCopyMsg(null), 2000);
    } catch {
      setTileCopyMsg('❌ 복사 실패: 브라우저 설정을 확인하세요');
      setTimeout(() => setTileCopyMsg(null), 3000);
    }
  }

  async function copyWallpaper() {
    if (!wpCalc.result) return;
    const { stripsNeeded, rollsNeeded } = wpCalc.result;
    const text = [
      '[도배지 소요량 계산 결과]',
      `벽 둘레: ${perimeter}m / 층고: ${ceilingH}m`,
      `도배지: 폭 ${rollW}m × ${rollL}m 롤`,
      `무늬 반복: ${patternRepeat}m`,
      `필요 폭 수: ${stripsNeeded}폭`,
      `권장 주문: ${rollsNeeded}롤`,
      '📐 theutilhub.com/utilities/utility/interior-material-calc',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setWpCopyMsg('✅ 복사 완료!');
      setTimeout(() => setWpCopyMsg(null), 2000);
    } catch {
      setWpCopyMsg('❌ 복사 실패: 브라우저 설정을 확인하세요');
      setTimeout(() => setWpCopyMsg(null), 3000);
    }
  }

  const DISCLAIMER = isKo
    ? '⚠️ 본 계산은 자재 주문을 위한 수학적 추정치입니다.\n실제 시공 시 작업자의 숙련도, 창문·문 등의 개구부 면적,\n현장 변수에 따라 소요량이 달라질 수 있으므로\n여유 있게 주문하는 것을 권장합니다.'
    : '⚠️ This result is a mathematical estimate for material ordering.\nActual quantities may vary based on worker skill, openings (doors/windows),\nand on-site conditions. We recommend ordering extra buffer.';

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}>
          <LayoutGrid size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{isKo ? '타일 및 도배지 로스율 산출기' : 'Tile & Wallpaper Calculator'}</h1>
        <p className={s.subtitle}>
          {isKo
            ? '타일 소요량(박스)과 도배지 롤 수를 SVG 시각화와 함께 즉시 계산합니다.'
            : 'Instantly calculate tile quantity and wallpaper rolls with visual layout preview.'}
        </p>
      </header>

      {/* ── Tabs ── */}
      <div className={s.tab_row}>
        <button
          className={`${s.tab_btn} ${activeTab === 'tile' ? s.tab_active : ''}`}
          onClick={() => setActiveTab('tile')}
          aria-label={isKo ? '타일 탭' : 'Tile tab'}
        >
          🔲 {isKo ? '타일 로스율 & 소요량' : 'Tile Loss & Quantity'}
        </button>
        <button
          className={`${s.tab_btn} ${activeTab === 'wallpaper' ? s.tab_active : ''}`}
          onClick={() => setActiveTab('wallpaper')}
          aria-label={isKo ? '도배지 탭' : 'Wallpaper tab'}
        >
          🖼 {isKo ? '도배지 소요량' : 'Wallpaper Quantity'}
        </button>
      </div>

      {/* ── Split layout ── */}
      <div className={s.split_layout}>

        {/* ─────────── LEFT: Input ─────────── */}
        <div className={s.input_panel}>

          {activeTab === 'tile' ? (
            <>
              <div className={s.section_title}>
                📐 {isKo ? '시공 면적 (mm)' : 'Installation Area (mm)'}
              </div>

              <div className={s.input_row_2}>
                <div className={s.form_group}>
                  <label className={s.field_label}>{isKo ? '가로 (mm)' : 'Width (mm)'}</label>
                  <input
                    className={s.field_input} type="number" min="1"
                    placeholder="예: 3000" value={tileAreaW}
                    onChange={e => setTileAreaW(e.target.value)}
                    aria-label={isKo ? '시공 면적 가로' : 'Area width in mm'}
                  />
                </div>
                <div className={s.form_group}>
                  <label className={s.field_label}>{isKo ? '세로 (mm)' : 'Depth (mm)'}</label>
                  <input
                    className={s.field_input} type="number" min="1"
                    placeholder="예: 3000" value={tileAreaH}
                    onChange={e => setTileAreaH(e.target.value)}
                    aria-label={isKo ? '시공 면적 세로' : 'Area depth in mm'}
                  />
                </div>
              </div>

              <div className={s.form_group}>
                <label className={s.field_label}>{isKo ? '타일 규격' : 'Tile Size'}</label>
                <select
                  className={s.field_select} value={tilePresetIdx}
                  onChange={e => handleTilePreset(Number(e.target.value))}
                  aria-label={isKo ? '타일 규격 선택' : 'Select tile size'}
                >
                  {TILE_PRESETS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                </select>
              </div>

              {tilePresetIdx === 4 && (
                <div className={s.input_row_2}>
                  <div className={s.form_group}>
                    <label className={s.field_label}>{isKo ? '타일 가로 (mm)' : 'Tile Width (mm)'}</label>
                    <input
                      className={s.field_input} type="number" min="1"
                      placeholder="예: 450" value={tileW || ''}
                      onChange={e => setTileW(Number(e.target.value))}
                      aria-label={isKo ? '타일 가로 직접 입력' : 'Custom tile width'}
                    />
                  </div>
                  <div className={s.form_group}>
                    <label className={s.field_label}>{isKo ? '타일 세로 (mm)' : 'Tile Height (mm)'}</label>
                    <input
                      className={s.field_input} type="number" min="1"
                      placeholder="예: 900" value={tileH || ''}
                      onChange={e => setTileH(Number(e.target.value))}
                      aria-label={isKo ? '타일 세로 직접 입력' : 'Custom tile height'}
                    />
                  </div>
                </div>
              )}

              <div className={s.input_row_2}>
                <div className={s.form_group}>
                  <label className={s.field_label}>{isKo ? '박스당 타일 수' : 'Pcs per Box'}</label>
                  <input
                    className={s.field_input} type="number" min="1"
                    value={boxPcs}
                    onChange={e => setBoxPcs(Math.max(1, Number(e.target.value)))}
                    aria-label={isKo ? '박스당 타일 수' : 'Tiles per box'}
                  />
                </div>
                <div className={s.form_group}>
                  <label className={s.field_label}>{isKo ? '줄눈(메지) 간격 (mm)' : 'Grout Gap (mm)'}</label>
                  <input
                    className={s.field_input} type="number" min="0"
                    value={tileGap}
                    onChange={e => setTileGap(Number(e.target.value))}
                    aria-label={isKo ? '줄눈 간격' : 'Grout gap in mm'}
                  />
                </div>
              </div>

              <div className={s.form_group}>
                <label className={s.field_label}>{isKo ? '시공 패턴' : 'Layout Pattern'}</label>
                <div className={s.radio_group}>
                  <label className={s.radio_option}>
                    <input type="radio" name="tilePattern" value="grid"
                      checked={tilePattern === 'grid'}
                      onChange={() => setTilePattern('grid')} />
                    <span>{isKo ? '정자 붙이기 (파손 여유 10%)' : 'Straight Grid (10% safety)'}</span>
                  </label>
                  <label className={s.radio_option}>
                    <input type="radio" name="tilePattern" value="staggered"
                      checked={tilePattern === 'staggered'}
                      onChange={() => setTilePattern('staggered')} />
                    <span>{isKo ? '지그재그 — 브릭/벽돌 패턴 (파손 여유+패턴 5% 복리)' : 'Staggered/Brick (+5% pattern + 10% safety)'}</span>
                  </label>
                </div>
              </div>

              <div className={s.disclaimer}>
                {DISCLAIMER.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: '0.15rem 0' }}>{line}</p>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={s.section_title}>
                🖼 {isKo ? '도배 정보 입력' : 'Wallpaper Details'}
              </div>

              <div className={s.form_group}>
                <label className={s.field_label}>{isKo ? '벽 둘레 합계 (m)' : 'Total Wall Perimeter (m)'}</label>
                <input
                  className={s.field_input} type="number" min="0" step="0.1"
                  placeholder={isKo ? '예: 20' : 'e.g. 20'} value={perimeter}
                  onChange={e => setPerimeter(e.target.value)}
                  aria-label={isKo ? '벽 둘레 합계' : 'Total wall perimeter'}
                />
                <p className={s.field_hint}>
                  {isKo
                    ? '※ 창문·문 등 개구부는 별도 차감하지 않습니다. 개구부 포함 전체 둘레를 입력하면 여유분이 자동 확보됩니다.'
                    : '※ Do not deduct doors/windows. Enter the full perimeter — buffer is automatically included.'}
                </p>
              </div>

              <div className={s.form_group}>
                <label className={s.field_label}>{isKo ? '층고 (천장 높이, m)' : 'Ceiling Height (m)'}</label>
                <input
                  className={s.field_input} type="number" min="0.1" step="0.1"
                  value={ceilingH}
                  onChange={e => setCeilingH(Number(e.target.value))}
                  aria-label={isKo ? '층고' : 'Ceiling height'}
                />
              </div>

              <div className={s.form_group}>
                <label className={s.field_label}>{isKo ? '도배지 종류' : 'Wallpaper Type'}</label>
                <select
                  className={s.field_select} value={paperTypeIdx}
                  onChange={e => handlePaperType(Number(e.target.value))}
                  aria-label={isKo ? '도배지 종류 선택' : 'Select wallpaper type'}
                >
                  {PAPER_TYPES.map((p, i) => (
                    <option key={i} value={i}>
                      {isKo ? `${p.label} — ${p.sub}` : `${p.labelEn} — ${p.subEn}`}
                    </option>
                  ))}
                </select>
              </div>

              {paperTypeIdx === 3 && (
                <div className={s.input_row_2}>
                  <div className={s.form_group}>
                    <label className={s.field_label}>{isKo ? '롤 폭 (m)' : 'Roll Width (m)'}</label>
                    <input
                      className={s.field_input} type="number" min="0.1" step="0.01"
                      placeholder="0.53" value={rollW}
                      onChange={e => setRollW(Number(e.target.value))}
                      aria-label={isKo ? '롤 폭' : 'Roll width'}
                    />
                  </div>
                  <div className={s.form_group}>
                    <label className={s.field_label}>{isKo ? '롤 길이 (m)' : 'Roll Length (m)'}</label>
                    <input
                      className={s.field_input} type="number" min="1" step="0.1"
                      placeholder="15.6" value={rollL}
                      onChange={e => setRollL(Number(e.target.value))}
                      aria-label={isKo ? '롤 길이' : 'Roll length'}
                    />
                  </div>
                </div>
              )}

              <div className={s.form_group}>
                <label className={s.field_label}>{isKo ? '무늬(패턴) 반복 간격 (m)' : 'Pattern Repeat (m)'}</label>
                <input
                  className={s.field_input} type="number" min="0" step="0.1"
                  value={patternRepeat}
                  onChange={e => setPatternRepeat(Number(e.target.value))}
                  aria-label={isKo ? '패턴 반복 간격' : 'Pattern repeat distance'}
                />
                <p className={s.field_hint}>
                  {isKo ? '단색이면 0 입력. 패턴 벽지는 통상 0.5~0.6m' : 'Enter 0 for solid color. Patterned wallpapers are typically 0.5–0.6m.'}
                </p>
              </div>

              <div className={s.disclaimer}>
                {DISCLAIMER.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: '0.15rem 0' }}>{line}</p>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─────────── RIGHT: Result + SVG ─────────── */}
        <div className={s.result_panel}>

          {/* ── TILE result ── */}
          {activeTab === 'tile' && (
            tileResult ? (
              <>
                <div className={s.main_result_wrap}>
                  <div className={s.main_result_label}>{isKo ? '권장 주문' : 'Recommended Order'}</div>
                  <div className={s.main_result_value}>
                    {tileResult.requiredBoxes}
                    <span className={s.main_result_unit}>{isKo ? '박스' : 'boxes'}</span>
                  </div>
                  <div className={s.main_result_sub}>
                    ({tileResult.totalOrderPcs.toLocaleString()}{isKo ? '장' : ' pcs'})
                  </div>
                </div>

                <div className={s.result_table}>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '순수 필요 장수' : 'Base count'}</span>
                    <span className={s.result_val}>{tileResult.baseCount.toLocaleString()}{isKo ? '장' : ' pcs'}</span>
                  </div>
                  {tilePattern === 'staggered' && (
                    <div className={s.result_row}>
                      <span className={s.result_key}>{isKo ? '패턴 로스 (지그재그 5%)' : 'Pattern loss (staggered 5%)'}</span>
                      <span className={s.result_val}>+{(tileResult.patternCount - tileResult.baseCount).toLocaleString()}{isKo ? '장' : ' pcs'}</span>
                    </div>
                  )}
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '파손 여유 (10%)' : 'Safety margin (10%)'}</span>
                    <span className={s.result_val}>+{(tileResult.safeCount - tileResult.patternCount).toLocaleString()}{isKo ? '장' : ' pcs'}</span>
                  </div>
                  <div className={`${s.result_row} ${s.result_row_strong}`}>
                    <span className={s.result_key}>{isKo ? '총 필요 장수' : 'Total required'}</span>
                    <span className={s.result_val}>{tileResult.safeCount.toLocaleString()}{isKo ? '장' : ' pcs'}</span>
                  </div>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '박스당 타일 수' : 'Per box'}</span>
                    <span className={s.result_val}>{tileResult.bp}{isKo ? '장/박스' : ' pcs/box'}</span>
                  </div>
                  <div className={`${s.result_row} ${s.result_row_strong}`}>
                    <span className={s.result_key}>{isKo ? '권장 주문 박스' : 'Boxes to order'}</span>
                    <span className={s.result_val}>{tileResult.requiredBoxes}{isKo ? '박스' : ' boxes'}</span>
                  </div>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '실제 주문 타일 수' : 'Actual order pcs'}</span>
                    <span className={s.result_val}>{tileResult.totalOrderPcs.toLocaleString()}{isKo ? '장' : ' pcs'}</span>
                  </div>
                  <div
                    className={`${s.result_row} ${s.result_row_loss}`}
                    title={isKo
                      ? `지그재그 로스 ${(tileResult.patternLossRate * 100).toFixed(0)}% + 파손 여유 10% = 복리 ${tileResult.totalLossRate.toFixed(1)}%`
                      : `Pattern ${(tileResult.patternLossRate * 100).toFixed(0)}% + safety 10% = ${tileResult.totalLossRate.toFixed(1)}% combined`}
                  >
                    <span className={s.result_key}>{isKo ? '총 로스율 ℹ️' : 'Total loss rate ℹ️'}</span>
                    <span className={s.result_val}>{isKo ? '약' : 'approx.'} {tileResult.totalLossRate.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Tile SVG */}
                <div className={s.svg_section_title}>{isKo ? '🎨 타일 배치 시각화' : '🎨 Tile Layout Preview'}</div>
                {tileResult.svg.shouldRenderSVG ? (
                  <div className={s.svg_wrap}>
                    <svg
                      viewBox={`0 0 ${SVG_W} ${SVG_TOTAL_H}`}
                      width="100%"
                      style={{ maxWidth: '400px', display: 'block', margin: '0 auto' }}
                    >
                      <defs>
                        {/* clipPath: originX/Y 반영 필수 */}
                        <clipPath id="tileAreaClip">
                          <rect
                            x={tileResult.svg.originX}
                            y={tileResult.svg.originY}
                            width={tileResult.svg.drawW}
                            height={tileResult.svg.drawH}
                          />
                        </clipPath>
                      </defs>
                      {/* SVG 배경 */}
                      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#F8FAFC" />
                      {/* 시공 면적 배경 */}
                      <rect
                        x={tileResult.svg.originX}
                        y={tileResult.svg.originY}
                        width={tileResult.svg.drawW}
                        height={tileResult.svg.drawH}
                        fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1"
                      />
                      {/* 타일 그리기 */}
                      <g clipPath="url(#tileAreaClip)">
                        {Array.from({ length: tileResult.rows }, (_, r) =>
                          Array.from({ length: tileResult.cols }, (_, c) => {
                            const staggerOffset = (tilePattern === 'staggered' && r % 2 !== 0)
                              ? tileResult.svg.svgEffTileW / 2 : 0;
                            const x = tileResult.svg.originX + c * tileResult.svg.svgEffTileW - staggerOffset;
                            const y = tileResult.svg.originY + r * tileResult.svg.svgEffTileH;

                            const realStaggerOffset = (tilePattern === 'staggered' && r % 2 !== 0)
                              ? (tileW + tileGap) / 2 : 0;
                            const realX = c * (tileW + tileGap) - realStaggerOffset;
                            const realY = r * (tileH + tileGap);

                            // TOLERANCE로 부동소수점 False Positive 방어
                            const isCut =
                              realX + tileW > tileResult.aw + TOLERANCE ||
                              realY + tileH > tileResult.ah + TOLERANCE ||
                              realX < -TOLERANCE;

                            return (
                              <rect
                                key={`${r}-${c}`}
                                x={x} y={y}
                                width={tileResult.svg.svgTileW}
                                height={tileResult.svg.svgTileH}
                                fill={isCut ? '#FECACA' : '#E0E7FF'}
                                stroke={isCut ? '#EF4444' : '#6366F1'}
                                strokeWidth="0.5"
                              />
                            );
                          })
                        )}
                      </g>
                      {/* 범례 */}
                      <rect x="4" y={SVG_H + 6} width="12" height="12" fill="#E0E7FF" stroke="#6366F1" strokeWidth="0.5" />
                      <text x="20" y={SVG_H + 16} fontSize="8" fill="#475569">{isKo ? '온전한 타일' : 'Full tile'}</text>
                      <rect x="90" y={SVG_H + 6} width="12" height="12" fill="#FECACA" stroke="#EF4444" strokeWidth="0.5" />
                      <text x="106" y={SVG_H + 16} fontSize="8" fill="#475569">{isKo ? '잘리는 타일 (로스)' : 'Cut tile (loss)'}</text>
                    </svg>
                  </div>
                ) : (
                  <div className={s.no_svg_msg}>
                    {isKo
                      ? `격자 수가 너무 많아 시각화를 생략합니다. (${tileResult.cols}열 × ${tileResult.rows}행 = ${(tileResult.cols * tileResult.rows).toLocaleString()}장)`
                      : `Too many tiles to render. (${tileResult.cols} × ${tileResult.rows} = ${(tileResult.cols * tileResult.rows).toLocaleString()} tiles)`}
                  </div>
                )}

                <button className={s.copy_btn} onClick={copyTile} aria-label={isKo ? '결과 복사' : 'Copy results'}>
                  <Copy size={16} />
                  {tileCopyMsg ?? (isKo ? '결과 복사' : 'Copy Result')}
                </button>
              </>
            ) : (
              <div className={s.empty_state}>
                {isKo
                  ? '⬅ 시공 면적과 타일 규격을 입력하면\n결과가 여기에 표시됩니다.'
                  : '⬅ Enter area and tile size\nto see results here.'}
              </div>
            )
          )}

          {/* ── WALLPAPER result ── */}
          {activeTab === 'wallpaper' && (
            wpCalc.error ? (
              <div className={s.error_box}>
                <AlertTriangle size={18} />
                {wpCalc.error}
              </div>
            ) : wpCalc.result ? (
              <>
                <div className={s.main_result_wrap}>
                  <div className={s.main_result_label}>{isKo ? '권장 주문' : 'Recommended Order'}</div>
                  <div className={s.main_result_value}>
                    {wpCalc.result.rollsNeeded}
                    <span className={s.main_result_unit}>{isKo ? '롤' : 'rolls'}</span>
                  </div>
                </div>

                <div className={s.result_table}>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '필요한 총 폭 수' : 'Strips needed'}</span>
                    <span className={s.result_val}>{wpCalc.result.stripsNeeded}{isKo ? '폭' : ' strips'}</span>
                  </div>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '1롤에서 뽑을 수 있는 폭' : 'Strips per roll'}</span>
                    <span className={s.result_val}>{wpCalc.result.stripsPerRoll}{isKo ? '폭/롤' : ' strips/roll'}</span>
                  </div>
                  <div className={`${s.result_row} ${s.result_row_strong}`}>
                    <span className={s.result_key}>{isKo ? '권장 주문 롤 수' : 'Rolls to order'}</span>
                    <span className={s.result_val}>{wpCalc.result.rollsNeeded}{isKo ? '롤' : ' rolls'}</span>
                  </div>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '실제 구매 총 폭 수' : 'Total strips purchased'}</span>
                    <span className={s.result_val}>{wpCalc.result.totalStrips}{isKo ? '폭' : ' strips'}</span>
                  </div>
                  <div className={s.result_row}>
                    <span className={s.result_key}>{isKo ? '남는 폭 수 (여유분)' : 'Spare strips'}</span>
                    <span className={s.result_val}>{wpCalc.result.wasteStrips}{isKo ? '폭' : ' strips'}</span>
                  </div>
                  <div className={`${s.result_row} ${s.result_row_loss}`}>
                    <span className={s.result_key}>{isKo ? '예상 로스율' : 'Estimated loss rate'}</span>
                    <span className={s.result_val}>{isKo ? '약' : 'approx.'} {wpCalc.result.lossRate}%</span>
                  </div>
                </div>

                {/* Wallpaper SVG */}
                <div className={s.svg_section_title}>{isKo ? '🎨 도배지 1롤 단면 시각화' : '🎨 Wallpaper Roll Cross-section'}</div>
                <div className={s.svg_wrap}>
                  <svg
                    viewBox={`0 0 ${SVG_W_WALL} ${SVG_H_WALL}`}
                    width="100%"
                    style={{ maxWidth: '360px', display: 'block', margin: '0 auto' }}
                  >
                    {Array.from({ length: wpCalc.result.svg.displayStrips }, (_, i) => {
                      const x = i * (wpCalc.result!.svg.stripSvgW + 2) + 1;
                      const usableH = SVG_H_WALL * wpCalc.result!.svg.usableRatio;
                      const patternH = SVG_H_WALL * wpCalc.result!.svg.patternRatio;
                      const wasteH = SVG_H_WALL * wpCalc.result!.svg.wasteRatio;
                      return (
                        <g key={i}>
                          <rect x={x} y={0} width={wpCalc.result!.svg.stripSvgW} height={usableH}
                            fill="#EDE9FE" stroke="#6366F1" strokeWidth="0.5" />
                          {patternRepeat > 0 && (
                            <rect x={x} y={usableH} width={wpCalc.result!.svg.stripSvgW} height={patternH}
                              fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.5" />
                          )}
                          <rect x={x} y={usableH + patternH} width={wpCalc.result!.svg.stripSvgW} height={wasteH}
                            fill="#FECACA" stroke="#EF4444" strokeWidth="0.5" />
                        </g>
                      );
                    })}
                    {/* 범례 */}
                    <rect x="4" y={SVG_H_WALL - 30} width="10" height="10" fill="#EDE9FE" />
                    <text x="18" y={SVG_H_WALL - 21} fontSize="7" fill="#475569">{isKo ? '사용 부분' : 'Used'}</text>
                    {patternRepeat > 0 && (
                      <>
                        <rect x="65" y={SVG_H_WALL - 30} width="10" height="10" fill="#FEF3C7" />
                        <text x="79" y={SVG_H_WALL - 21} fontSize="7" fill="#475569">{isKo ? '패턴 로스' : 'Pattern loss'}</text>
                      </>
                    )}
                    <rect x={patternRepeat > 0 ? 140 : 65} y={SVG_H_WALL - 30} width="10" height="10" fill="#FECACA" />
                    <text x={patternRepeat > 0 ? 154 : 79} y={SVG_H_WALL - 21} fontSize="7" fill="#475569">{isKo ? '버려지는 자투리' : 'Waste'}</text>
                  </svg>
                </div>

                <button className={s.copy_btn} onClick={copyWallpaper} aria-label={isKo ? '결과 복사' : 'Copy results'}>
                  <Copy size={16} />
                  {wpCopyMsg ?? (isKo ? '결과 복사' : 'Copy Result')}
                </button>
              </>
            ) : (
              <div className={s.empty_state}>
                {isKo
                  ? '⬅ 벽 둘레와 층고를 입력하면\n결과가 여기에 표시됩니다.'
                  : '⬅ Enter wall perimeter and ceiling height\nto see results here.'}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Bottom sections ── */}
      <ShareBar
        title={isKo ? '타일 및 도배지 로스율 산출기' : 'Tile & Wallpaper Calculator'}
        description={isKo ? '타일 소요량(박스)과 도배지 롤 수를 SVG 시각화와 함께 즉시 계산합니다.' : 'Calculate tile boxes and wallpaper rolls with visual preview.'}
      />
      <RelatedTools toolId="utility/interior-material-calc" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection
        ko={{
          title: '타일 및 도배지 로스율 산출기란?',
          description: '타일 및 도배지 로스율 산출기는 인테리어 시공 시 자재를 얼마나 주문해야 하는지 정확하게 계산해주는 현장 실무 도구입니다. 타일은 시공 면적의 가로·세로와 타일 규격, 줄눈 간격, 시공 패턴(정자/지그재그)을 입력하면 자투리 컷팅과 파손 여유를 반영한 최종 박스 수를 산출합니다. 지그재그(브릭) 패턴은 끝단 반장 컷팅으로 인해 추가 로스가 발생하며, 이를 SVG 격자 그래픽으로 시각화하여 어느 타일이 잘려나가는지 한눈에 확인할 수 있습니다. 도배지는 벽 둘레와 층고, 도배지 종류, 무늬 반복 간격을 입력하면 필요한 롤 수를 계산하고 1롤에서 폭을 몇 장 뽑을 수 있는지 시각적으로 보여줍니다. 창문·문 등 개구부는 전체 둘레 기준으로 입력하면 여유분이 자동으로 확보됩니다.',
          useCases: [
            { icon: '🏠', title: '셀프 인테리어 자재 구입', desc: '직접 타일이나 도배지를 시공하는 셀프 인테리어 시 자재를 정확하게 계산하세요. 부족해서 추가 주문하거나, 너무 많이 사서 낭비하는 실수를 방지하고 동일 로트 번호의 자재를 한 번에 구입할 수 있어 색상 차이를 방지할 수 있습니다.' },
            { icon: '🔧', title: '인테리어 업체 견적 검증', desc: '인테리어 업체에서 받은 자재 수량 견적이 적정한지 직접 계산해보세요. 과도한 자재비 청구를 확인하고, 합리적인 견적 협상의 근거 자료로 활용할 수 있습니다. 공간별로 따로 계산해 항목별 견적을 비교하세요.' },
            { icon: '📐', title: '지그재그 패턴 시공 준비', desc: '브릭(벽돌) 패턴으로 타일을 시공할 경우 정자 붙이기보다 로스율이 높아집니다. SVG 격자 그래픽으로 어느 위치의 타일이 잘려나가는지 미리 확인하고, 로스율을 감안한 정확한 수량을 준비해 현장에서의 자재 부족 상황을 방지할 수 있습니다.' },
            { icon: '🎨', title: '무늬 도배지 소요량 계산', desc: '무늬가 있는 벽지는 패턴을 맞추기 위해 추가 손실이 발생합니다. 패턴 반복 간격을 입력하면 실제로 버려지는 부분을 시각화하고, 단색 대비 얼마나 추가 주문이 필요한지 정확한 롤 수를 계산해 예산 초과를 방지할 수 있습니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '상단 탭에서 타일 또는 도배지를 선택합니다. 탭을 전환해도 입력값이 초기화되지 않으므로 두 자재를 번갈아 계산할 수 있습니다.' },
            { step: '타일 치수 입력', desc: '타일 탭에서 시공 면적(가로×세로, mm)과 타일 규격을 선택합니다. 박스당 타일 수는 구입할 제품의 박스 뒷면에서 확인할 수 있으며, 기본값은 4장으로 설정되어 있습니다. 줄눈(메지) 간격은 기본 2mm로 설정됩니다.' },
            { step: '도배지 정보 입력', desc: '도배지 탭에서 벽 둘레 합계(m)와 층고(m)를 입력합니다. 창문·문 개구부는 차감하지 않고 전체 둘레를 입력하면 여유분이 자동으로 확보됩니다. 도배지 종류를 선택하면 롤 규격이 자동 설정됩니다.' },
            { step: '결과 확인 및 복사', desc: '입력값이 모두 채워지면 결과가 자동으로 표시됩니다. SVG 격자에서 파란색(온전한 타일)과 빨간색(잘리는 타일)을 확인하고, 결과 복사 버튼으로 견적서나 메모에 바로 붙여넣을 수 있습니다.' },
          ],
          faqs: [
            { q: '무늬가 있는 타일/벽지는 왜 더 많이 필요한가요?', a: '무늬(패턴)가 있는 자재는 인접한 폭이나 장 사이에 패턴을 맞춰야 합니다. 타일의 경우 지그재그 패턴 시 끝단 반장 컷팅 로스 약 5%가 추가되고, 도배지의 경우 패턴 반복 간격(0.5~0.6m)만큼 1폭당 재단 길이가 늘어나 롤에서 뽑을 수 있는 폭 수가 줄어들어 최대 20~30% 추가 로스가 발생할 수 있습니다.' },
            { q: '로스율은 보통 몇 %를 잡아야 하나요?', a: '일반적으로 타일은 정자 붙이기 기준 10%, 지그재그(브릭) 패턴은 약 15.5%를 권장합니다. 이 계산기는 정자 붙이기에 파손 여유 10%, 지그재그에 패턴 로스 5% + 파손 여유 10%를 복리로 자동 적용합니다. 도배지는 단색 기준 약 10~15%, 무늬 있는 벽지는 패턴 반복 간격에 따라 더 높아질 수 있습니다.' },
            { q: '지그재그(브릭) 시공은 왜 로스가 더 발생하나요?', a: '지그재그 패턴은 홀수 행마다 타일을 절반씩 오프셋하여 배치합니다. 시공 면적의 왼쪽·오른쪽 끝부분에 타일의 절반만 필요한 구간이 생기는데, 나머지 절반은 버려집니다. SVG 격자에서 빨간 타일을 보면 어느 위치에서 로스가 발생하는지 직관적으로 확인할 수 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 발주 수량은 시공업체나 전문 인테리어 업체의 현장 실측 후 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Tile & Wallpaper Calculator?',
          description: 'The Tile & Wallpaper Calculator is a free, browser-based tool that helps you order exactly the right amount of materials for interior renovation projects — no more, no less. For tiles, enter the installation area dimensions in millimeters along with the tile size, grout gap, and layout pattern (straight grid or staggered/brick). The calculator instantly computes the base tile count, applies pattern loss for staggered layouts (5%), adds a 10% safety margin for breakage, and outputs the recommended number of boxes to purchase. An SVG grid visualization highlights cut tiles in red so you can see at a glance where waste occurs. For wallpaper, enter the total wall perimeter and ceiling height, select your wallpaper type (silk standard, wide vinyl, or narrow vinyl), and optionally specify a pattern repeat distance. The calculator determines how many strips can be cut from each roll and outputs the exact number of rolls to order. A visual cross-section shows the usable portion, pattern loss, and waste per roll. All calculations run entirely in your browser — no data is sent to any server.',
          useCases: [
            { icon: '🏠', title: 'DIY Home Renovation', desc: 'Calculate the exact number of tile boxes or wallpaper rolls for a self-renovation project. Ordering the right amount in one purchase ensures color consistency from the same production batch and eliminates costly re-ordering.' },
            { icon: '🔧', title: 'Contractor Quote Verification', desc: 'Cross-check material quantities quoted by an interior contractor. Use the breakdown report as a negotiation reference to identify any overestimates in material costs and ensure you are paying a fair price.' },
            { icon: '📐', title: 'Staggered Tile Pattern Planning', desc: 'Staggered (brick) tile layouts produce 5% more waste than straight grids due to half-tile offsets at edges. The SVG visualization shows exactly which tiles will be cut, helping you prepare the correct quantity before starting work.' },
            { icon: '🎨', title: 'Patterned Wallpaper Estimation', desc: 'Patterned wallpapers require extra material to align repeats between strips. Enter the pattern repeat distance to see the additional waste visualized in the cross-section diagram, and get an accurate roll count to avoid running short mid-project.' },
          ],
          steps: [
            { step: 'Select Tab', desc: 'Click the Tile or Wallpaper tab at the top. Switching tabs does not reset your inputs — you can calculate both materials and switch between them freely.' },
            { step: 'Enter Tile Details', desc: 'In the Tile tab, enter the installation area width and depth in millimeters, then select a tile size preset or enter custom dimensions. Set the tiles per box (check the product packaging) and the grout gap (default 2mm).' },
            { step: 'Enter Wallpaper Details', desc: 'In the Wallpaper tab, enter the total wall perimeter in meters and the ceiling height. Select the wallpaper type to auto-fill the roll dimensions. Enter a pattern repeat value if the wallpaper has a pattern (enter 0 for solid colors).' },
            { step: 'View Results and Copy', desc: 'Results appear automatically as you fill in the inputs. Review the SVG visualization, check the breakdown table, and click Copy Result to paste the full calculation summary into your notes or quote documents.' },
          ],
          faqs: [
            { q: 'Why do patterned tiles or wallpapers require more material?', a: 'Patterned materials must be aligned between adjacent rows or strips, which means cutting away portions until the pattern lines up. For staggered tile layouts, half-tile offsets at row ends add approximately 5% extra waste. For patterned wallpaper, each strip must be lengthened by the pattern repeat distance, reducing the number of strips per roll by 1–2 and increasing total roll count significantly at high repeat values.' },
            { q: 'What loss rate should I budget for in general?', a: 'For tiles, we recommend 10% for straight grid and approximately 15.5% for staggered/brick patterns. This calculator automatically applies a 10% safety margin for breakage on top of any pattern loss. For wallpaper, solid-color rolls typically run 10–15% waste; patterned rolls can reach 20–30% depending on the repeat distance.' },
            { q: 'Why does staggered tile layout produce more loss?', a: 'In a staggered pattern, every other row is offset by half a tile width. This creates partial tile positions at the left and right edges of each offset row, where the trimmed half is discarded. The SVG grid highlights these cut tiles in red so you can see the waste distribution visually. With more rows, the cumulative edge waste adds approximately 5% over a straight grid layout.' },
            { q: 'Can I use these results as official specifications?', a: 'Results are for reference only. Please confirm the final order quantity with a professional contractor or interior specialist based on an on-site measurement before placing your material order.' },
          ],
        }}
      />
    </div>
  );
}
