'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Weight, Copy, ShoppingCart, Plus, X } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './metal-weight-calc.module.css';

// ── Types ────────────────────────────────────────────
type ShapeId = 'round' | 'pipe' | 'square' | 'sqtube' | 'hex' | 'flat' | 'plate' | 'angle' | 'channel' | 'hbeam' | 'tshape' | 'checkered';

interface Dims { D: number; W: number; H: number; L: number; t: number; t1: number; t2: number; S: number; }
interface Material { name: string; density: number; custom?: boolean; }
interface BasketItem {
  id: string; shape: ShapeId; shapeName: string; spec: string;
  material: string; density: number;
  length: number; qty: number; lossRate: number;
  unitWeight: number; totalWeight: number; orderWeight: number;
  paintArea: number; pricePerKg: number; pricePerM2: number;
  materialCost: number; paintCost: number; total: number;
}

// ── Constants ────────────────────────────────────────
const ZERO_DIMS: Dims = { D: 0, W: 0, H: 0, L: 0, t: 0, t1: 0, t2: 0, S: 0 };

const BASE_MATERIALS: Material[] = [
  { name: '강철/탄소강', density: 7.85 },
  { name: '스테인리스 (304/310)', density: 7.93 },
  { name: '스테인리스 (316/321)', density: 7.98 },
  { name: '스테인리스 (410/430)', density: 7.75 },
  { name: '알루미늄', density: 2.70 },
  { name: '황동(신주)', density: 8.50 },
  { name: '구리(동)', density: 8.96 },
  { name: '청동', density: 8.80 },
  { name: '주철', density: 7.20 },
  { name: '아연', density: 7.14 },
  { name: '납', density: 11.34 },
  { name: '니켈', density: 8.90 },
  { name: '티타늄', density: 4.51 },
  { name: '주석', density: 7.30 },
  { name: '텅스텐', density: 19.25 },
  { name: '인코넬', density: 8.44 },
  { name: 'MC나일론', density: 1.16 },
  { name: '아세탈(POM)', density: 1.41 },
  { name: '테프론(PTFE)', density: 2.20 },
];

const KS_PRESETS: Record<ShapeId, { label: string; dims: Partial<Dims> }[]> = {
  hbeam: [
    { label: 'H-100×100×6×8',   dims: { W: 100, H: 100, t1: 6,   t2: 8  } },
    { label: 'H-150×150×7×10',  dims: { W: 150, H: 150, t1: 7,   t2: 10 } },
    { label: 'H-200×100×5.5×8', dims: { W: 100, H: 200, t1: 5.5, t2: 8  } },
    { label: 'H-200×200×8×12',  dims: { W: 200, H: 200, t1: 8,   t2: 12 } },
    { label: 'H-250×125×6×9',   dims: { W: 125, H: 250, t1: 6,   t2: 9  } },
    { label: 'H-300×150×6.5×9', dims: { W: 150, H: 300, t1: 6.5, t2: 9  } },
    { label: 'H-350×175×7×11',  dims: { W: 175, H: 350, t1: 7,   t2: 11 } },
    { label: 'H-400×200×8×13',  dims: { W: 200, H: 400, t1: 8,   t2: 13 } },
  ],
  channel: [
    { label: 'C-75×45×6',   dims: { W: 45, H: 75,  t1: 6, t2: 6  } },
    { label: 'C-100×50×6',  dims: { W: 50, H: 100, t1: 6, t2: 6  } },
    { label: 'C-125×65×6',  dims: { W: 65, H: 125, t1: 6, t2: 8  } },
    { label: 'C-150×75×9',  dims: { W: 75, H: 150, t1: 9, t2: 9  } },
    { label: 'C-180×75×9',  dims: { W: 75, H: 180, t1: 9, t2: 9  } },
    { label: 'C-200×80×9',  dims: { W: 80, H: 200, t1: 9, t2: 10 } },
  ],
  angle: [
    { label: 'L-50×50×4',    dims: { W: 50,  H: 50,  t: 4  } },
    { label: 'L-65×65×6',    dims: { W: 65,  H: 65,  t: 6  } },
    { label: 'L-75×75×6',    dims: { W: 75,  H: 75,  t: 6  } },
    { label: 'L-90×90×7',    dims: { W: 90,  H: 90,  t: 7  } },
    { label: 'L-100×100×7',  dims: { W: 100, H: 100, t: 7  } },
    { label: 'L-125×125×8',  dims: { W: 125, H: 125, t: 8  } },
    { label: 'L-150×150×12', dims: { W: 150, H: 150, t: 12 } },
  ],
  round: [], pipe: [], square: [], sqtube: [], hex: [], flat: [], plate: [], tshape: [], checkered: [],
};

const SHAPE_DEFS: { id: ShapeId; ko: string; en: string; fields: (keyof Dims)[]; hasLength: boolean }[] = [
  { id: 'round',     ko: '환봉',       en: 'Round Bar',       fields: ['D'],                  hasLength: true  },
  { id: 'pipe',      ko: '파이프',     en: 'Pipe/Tube',       fields: ['D', 't'],              hasLength: true  },
  { id: 'square',    ko: '사각봉',     en: 'Square Bar',      fields: ['W', 'H'],             hasLength: true  },
  { id: 'sqtube',    ko: '사각튜브',   en: 'Square Tube',     fields: ['W', 'H', 't'],        hasLength: true  },
  { id: 'hex',       ko: '육각봉',     en: 'Hexagonal Bar',   fields: ['S'],                  hasLength: true  },
  { id: 'flat',      ko: '평철',       en: 'Flat Bar',        fields: ['W', 'H'],             hasLength: true  },
  { id: 'plate',     ko: '판재',       en: 'Plate',           fields: ['W', 'L', 't'],        hasLength: false },
  { id: 'angle',     ko: '앵글',       en: 'Angle',           fields: ['W', 'H', 't'],        hasLength: true  },
  { id: 'channel',   ko: 'ㄷ채널',     en: 'C-Channel',       fields: ['W', 'H', 't1', 't2'], hasLength: true  },
  { id: 'hbeam',     ko: 'H/I빔',     en: 'H/I-Beam',        fields: ['W', 'H', 't1', 't2'], hasLength: true  },
  { id: 'tshape',    ko: 'T형강',      en: 'T-Shape',         fields: ['W', 'H', 't1', 't2'], hasLength: true  },
  { id: 'checkered', ko: '무늬철판',   en: 'Checkered Plate', fields: ['W', 'L', 't'],        hasLength: false },
];

const FIELD_LABELS: Record<keyof Dims, { ko: string; en: string; unit: string }> = {
  D:  { ko: '외경 D',     en: 'Outer Dia. D', unit: 'mm' },
  W:  { ko: '폭 W',       en: 'Width W',       unit: 'mm' },
  H:  { ko: '높이 H',     en: 'Height H',      unit: 'mm' },
  L:  { ko: '길이 L',     en: 'Length L',      unit: 'mm' },
  t:  { ko: '두께 t',     en: 'Thickness t',   unit: 'mm' },
  t1: { ko: '웹두께 t1',  en: 'Web t1',        unit: 'mm' },
  t2: { ko: '플랜지 t2',  en: 'Flange t2',     unit: 'mm' },
  S:  { ko: '대변거리 S', en: 'Flat-to-Flat S',unit: 'mm' },
};

// ── Calculation ──────────────────────────────────────
function calcSection(shape: ShapeId, dims: Dims): { area: number; perimeter: number } {
  const { D, W, H, t, t1, t2, S } = dims;
  switch (shape) {
    case 'round':    return { area: Math.PI * (D/2)**2, perimeter: Math.PI * D };
    case 'pipe':     return { area: Math.PI * ((D/2)**2 - (D/2 - t)**2), perimeter: Math.PI * D };
    case 'square':
    case 'flat':     return { area: W * H, perimeter: 2 * (W + H) };
    case 'sqtube':   return { area: W*H - (W - 2*t)*(H - 2*t), perimeter: 2*(W+H) };
    case 'hex':      return { area: 0.866025 * S**2, perimeter: 3.4641 * S };
    case 'angle':    return { area: W*t + (H-t)*t, perimeter: 2*W + 2*H };
    case 'channel':  return { area: 2*(W*t2) + (H - 2*t2)*t1, perimeter: 4*W + 2*H - 2*t1 };
    case 'hbeam':    return { area: 2*(W*t2) + (H - 2*t2)*t1, perimeter: 4*W + 2*H - 2*t1 };
    case 'tshape':   return { area: W*t2 + (H - t2)*t1, perimeter: 2*W + 2*H };
    case 'plate':    return { area: 0, perimeter: 0 }; // handled in calcResults
    case 'checkered':return { area: 0, perimeter: 0 };
    default:         return { area: 0, perimeter: 0 };
  }
}

interface CalcResult {
  area: number; unitWeight: number; totalWeight: number;
  paintArea: number; orderWeight: number;
  materialCost: number; paintCost: number; total: number;
  error: string | null;
}

function calcResults(
  shape: ShapeId, dims: Dims, length: number, qty: number,
  density: number, lossRate: number, pricePerKg: number, pricePerM2: number,
): CalcResult {
  const blank: CalcResult = { area: 0, unitWeight: 0, totalWeight: 0, paintArea: 0, orderWeight: 0, materialCost: 0, paintCost: 0, total: 0, error: null };

  // Thickness validation
  if (shape === 'pipe' && dims.t >= dims.D / 2) return { ...blank, error: '두께(t)가 외경의 절반을 초과할 수 없습니다.' };
  if (shape === 'sqtube' && (dims.t >= dims.W / 2 || dims.t >= dims.H / 2)) return { ...blank, error: '두께(t)가 폭/높이의 절반을 초과할 수 없습니다.' };

  const lengthMM = length * 1000; // m → mm

  if (shape === 'plate') {
    const { W, L, t } = dims;
    if (W <= 0 || L <= 0 || t <= 0 || qty <= 0) return blank;
    const volume = W * L * t * qty; // mm³
    const totalWeight = volume / 1_000_000 * density;
    const paintArea = 2 * (W * L) / 1_000_000 * qty; // both wide faces
    const orderWeight = totalWeight * (1 + lossRate / 100);
    const materialCost = pricePerKg > 0 ? orderWeight * pricePerKg : 0;
    const paintCost = pricePerM2 > 0 ? paintArea * pricePerM2 : 0;
    return { area: W*t, unitWeight: (W*L*t/1_000_000)*density, totalWeight, paintArea, orderWeight, materialCost, paintCost, total: materialCost + paintCost, error: null };
  }

  if (shape === 'checkered') {
    const { W, L, t } = dims;
    if (W <= 0 || L <= 0 || t <= 0 || qty <= 0) return blank;
    // KS formula: ((t × density) + 1.67) × (W × L / 1,000,000) × qty
    // Note: t is in mm, density in g/cm³ — DO NOT divide t by 1000
    const totalWeight = (t * density + 1.67) * (W * L / 1_000_000) * qty;
    const paintArea = 1 * (W * L) / 1_000_000 * qty; // back face only
    const unitWeight = (dims.t * density + 1.67) * (W * L / 1_000_000);
    const orderWeight = totalWeight * (1 + lossRate / 100);
    const materialCost = pricePerKg > 0 ? orderWeight * pricePerKg : 0;
    const paintCost = pricePerM2 > 0 ? paintArea * pricePerM2 : 0;
    return { area: W*t, unitWeight, totalWeight, paintArea, orderWeight, materialCost, paintCost, total: materialCost + paintCost, error: null };
  }

  // All other shapes
  const { area, perimeter } = calcSection(shape, dims);
  if (area <= 0 || lengthMM <= 0 || qty <= 0) return blank;

  const volume = area * lengthMM; // mm³ per piece
  const unitWeight = volume / 1_000_000 * density; // kg per piece
  const totalWeight = unitWeight * qty;
  const paintArea = perimeter * lengthMM / 1_000_000 * qty; // m²
  const orderWeight = totalWeight * (1 + lossRate / 100);
  const materialCost = pricePerKg > 0 ? orderWeight * pricePerKg : 0;
  const paintCost = pricePerM2 > 0 ? paintArea * pricePerM2 : 0;
  return { area, unitWeight, totalWeight, paintArea, orderWeight, materialCost, paintCost, total: materialCost + paintCost, error: null };
}

// ── Shape spec string ─────────────────────────────────
function makeSpec(shape: ShapeId, dims: Dims, length: number, qty: number): string {
  const { D, W, H, L, t, t1, t2, S } = dims;
  switch (shape) {
    case 'round':    return `Ø${D}`;
    case 'pipe':     return `Ø${D}×t${t}`;
    case 'square':   return `□${W}×${H}`;
    case 'sqtube':   return `□${W}×${H}×t${t}`;
    case 'hex':      return `S${S}(대변)`;
    case 'flat':     return `${W}×${H}`;
    case 'plate':    return `${W}×${L}×t${t}`;
    case 'angle':    return `L-${W}×${H}×${t}`;
    case 'channel':  return `C-${H}×${W}×${t1}/${t2}`;
    case 'hbeam':    return `H-${H}×${W}×${t1}×${t2}`;
    case 'tshape':   return `T-${W}×${H}×${t1}/${t2}`;
    case 'checkered':return `${W}×${L}×t${t}`;
    default:         return '';
  }
}

// ── Shape icon SVGs (for selection grid) ─────────────
const SHAPE_ICONS: Record<ShapeId, React.ReactNode> = {
  round:     <svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="14" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5"/></svg>,
  pipe:      <svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="14" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5"/><circle cx="20" cy="20" r="8" fill="white" stroke="#8b5cf6" strokeWidth="1.5"/></svg>,
  square:    <svg viewBox="0 0 40 40" width="36" height="36"><rect x="6" y="6" width="28" height="28" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5" rx="2"/></svg>,
  sqtube:    <svg viewBox="0 0 40 40" width="36" height="36"><rect x="6" y="6" width="28" height="28" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5" rx="2"/><rect x="12" y="12" width="16" height="16" fill="white" stroke="#8b5cf6" strokeWidth="1.5" rx="1"/></svg>,
  hex:       <svg viewBox="0 0 40 40" width="36" height="36"><polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5"/></svg>,
  flat:      <svg viewBox="0 0 40 40" width="36" height="36"><rect x="4" y="14" width="32" height="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5" rx="2"/></svg>,
  plate:     <svg viewBox="0 0 40 40" width="36" height="36"><rect x="4" y="17" width="32" height="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5" rx="1"/></svg>,
  angle:     <svg viewBox="0 0 40 40" width="36" height="36"><path d="M8 6 L8 34 L34 34" fill="none" stroke="#8b5cf6" strokeWidth="7" strokeLinecap="square"/><path d="M8 6 L8 34 L34 34" fill="none" stroke="#ede9fe" strokeWidth="3" strokeLinecap="square"/></svg>,
  channel:   <svg viewBox="0 0 40 40" width="36" height="36"><path d="M30 6 L10 6 L10 34 L30 34" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="square"/><path d="M30 6 L10 6 L10 34 L30 34" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="square"/></svg>,
  hbeam:     <svg viewBox="0 0 40 40" width="36" height="36"><rect x="4" y="4" width="32" height="6" fill="#8b5cf6" rx="1"/><rect x="4" y="30" width="32" height="6" fill="#8b5cf6" rx="1"/><rect x="17" y="10" width="6" height="20" fill="#8b5cf6"/></svg>,
  tshape:    <svg viewBox="0 0 40 40" width="36" height="36"><rect x="4" y="6" width="32" height="7" fill="#8b5cf6" rx="1"/><rect x="17" y="13" width="6" height="22" fill="#8b5cf6"/></svg>,
  checkered: <svg viewBox="0 0 40 40" width="36" height="36"><rect x="4" y="16" width="32" height="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" rx="1"/><line x1="10" y1="16" x2="14" y2="24" stroke="#8b5cf6" strokeWidth="1.5"/><line x1="18" y1="16" x2="22" y2="24" stroke="#8b5cf6" strokeWidth="1.5"/><line x1="26" y1="16" x2="30" y2="24" stroke="#8b5cf6" strokeWidth="1.5"/></svg>,
};

// ── Cross-section SVG (STEP 5) ────────────────────────
function CrossSectionSVG({ shape, dims, isKo }: { shape: ShapeId; dims: Dims; isKo: boolean }) {
  const VW = 300, VH = 250;
  const cx = VW / 2, cy = VH / 2;
  const FILL = '#ede9fe', STROKE = '#8b5cf6', DC = '#475569', SW = 2;
  const maxD = 160;

  // Scale helper
  function sc(v: number, ref: number): number {
    if (ref <= 0) return 0;
    return (v / ref) * maxD;
  }

  // Dimension label
  function dimLabel(x: number, y: number, label: string, anchor: 'middle' | 'start' | 'end' = 'middle') {
    return <text x={x} y={y} textAnchor={anchor} fontSize="11" fill={DC} fontWeight="600">{label}</text>;
  }
  function dimArrow(x1: number, y1: number, x2: number, y2: number) {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DC} strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>;
  }

  const arrows = (
    <defs>
      <marker id="arr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill={DC}/>
      </marker>
    </defs>
  );

  if (shape === 'round') {
    const ref = Math.max(dims.D, 40);
    const r = sc(dims.D / 2, ref);
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        {arrows}
        <circle cx={cx} cy={cy} r={r} fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <line x1={cx - r - 16} y1={cy} x2={cx + r + 16} y2={cy} stroke={DC} strokeWidth="1" strokeDasharray="4 3"/>
        <line x1={cx - r - 2} y1={cy - 14} x2={cx - r - 2} y2={cy + 14} stroke={DC} strokeWidth="1"/>
        <line x1={cx + r + 2} y1={cy - 14} x2={cx + r + 2} y2={cy + 14} stroke={DC} strokeWidth="1"/>
        <line x1={cx - r - 2} y1={cy - 12} x2={cx + r + 2} y2={cy - 12} stroke={DC} strokeWidth="1"/>
        <text x={cx} y={cy - 16} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">Ø{dims.D}mm</text>
      </svg>
    );
  }

  if (shape === 'pipe') {
    const ref = Math.max(dims.D, 40);
    const ro = sc(dims.D / 2, ref);
    const ri = sc(dims.D / 2 - dims.t, ref);
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        {arrows}
        <circle cx={cx} cy={cy} r={ro} fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <circle cx={cx} cy={cy} r={Math.max(ri, 0)} fill="white" stroke={STROKE} strokeWidth={SW}/>
        <line x1={cx - ro - 2} y1={cy - 14} x2={cx + ro + 2} y2={cy - 14} stroke={DC} strokeWidth="1"/>
        <text x={cx} y={cy - 18} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">Ø{dims.D}</text>
        <text x={cx + ro * 0.7 + 8} y={cy - 4} textAnchor="start" fontSize="10" fill="#ef4444" fontWeight="600">t{dims.t}</text>
      </svg>
    );
  }

  if (shape === 'hex') {
    const ref = Math.max(dims.S, 30);
    const r = sc(dims.S / 2, ref);
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * Math.PI / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <polygon points={pts} fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <line x1={cx - r} y1={cy - 14} x2={cx + r} y2={cy - 14} stroke={DC} strokeWidth="1"/>
        <text x={cx} y={cy - 18} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">S{dims.S}mm</text>
      </svg>
    );
  }

  if (shape === 'square' || shape === 'flat') {
    const refW = Math.max(dims.W, 30), refH = Math.max(dims.H, 10);
    const scaleW = maxD / Math.max(refW, refH);
    const pw = dims.W * scaleW, ph = dims.H * scaleW;
    const rx = cx - pw/2, ry = cy - ph/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <rect x={rx} y={ry} width={pw} height={ph} fill={FILL} stroke={STROKE} strokeWidth={SW} rx="2"/>
        <line x1={rx} y1={ry - 12} x2={rx + pw} y2={ry - 12} stroke={DC} strokeWidth="1"/>
        <text x={cx} y={ry - 15} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">W{dims.W}</text>
        <line x1={rx + pw + 12} y1={ry} x2={rx + pw + 12} y2={ry + ph} stroke={DC} strokeWidth="1"/>
        <text x={rx + pw + 26} y={cy} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700" transform={`rotate(90,${rx+pw+26},${cy})`}>H{dims.H}</text>
      </svg>
    );
  }

  if (shape === 'sqtube') {
    const ref = Math.max(dims.W, dims.H, 30);
    const scale = maxD / ref;
    const pw = dims.W * scale, ph = dims.H * scale;
    const pt = dims.t * scale;
    const rx = cx - pw/2, ry = cy - ph/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <rect x={rx} y={ry} width={pw} height={ph} fill={FILL} stroke={STROKE} strokeWidth={SW} rx="2"/>
        <rect x={rx+pt} y={ry+pt} width={pw-2*pt} height={ph-2*pt} fill="white" stroke={STROKE} strokeWidth={1.5} rx="1"/>
        <line x1={rx} y1={ry-12} x2={rx+pw} y2={ry-12} stroke={DC} strokeWidth="1"/>
        <text x={cx} y={ry-15} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">W{dims.W}</text>
        <text x={cx} y={cy} textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="700">t{dims.t}</text>
      </svg>
    );
  }

  if (shape === 'plate' || shape === 'checkered') {
    // Show W × t cross-section (thin rectangle)
    const ref = Math.max(dims.W, 30);
    const scale = Math.min(maxD / ref, 3);
    const pw = dims.W * scale;
    const ph = Math.max(dims.t * scale, 8);
    const rx = cx - pw/2, ry = cy - ph/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        {shape === 'checkered' && (
          <>
            <line x1={rx+10} y1={ry} x2={rx+20} y2={ry+ph} stroke={STROKE} strokeWidth="1.5" opacity="0.5"/>
            <line x1={rx+30} y1={ry} x2={rx+40} y2={ry+ph} stroke={STROKE} strokeWidth="1.5" opacity="0.5"/>
          </>
        )}
        <rect x={rx} y={ry} width={pw} height={ph} fill={FILL} stroke={STROKE} strokeWidth={SW} rx="1"/>
        <line x1={rx} y1={ry-12} x2={rx+pw} y2={ry-12} stroke={DC} strokeWidth="1"/>
        <text x={cx} y={ry-15} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">W{dims.W}</text>
        <line x1={rx+pw+12} y1={ry} x2={rx+pw+12} y2={ry+ph} stroke={DC} strokeWidth="1"/>
        <text x={rx+pw+22} y={cy+4} textAnchor="start" fontSize="11" fill={DC} fontWeight="700">t{dims.t}</text>
      </svg>
    );
  }

  if (shape === 'angle') {
    const ref = Math.max(dims.W, dims.H, 30);
    const scale = maxD * 0.6 / ref;
    const pw = dims.W * scale, ph = dims.H * scale, pt = dims.t * scale;
    const ox = cx - pw/2, oy = cy - ph/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <path d={`M${ox},${oy} L${ox},${oy+ph} L${ox+pw},${oy+ph} L${ox+pw},${oy+ph-pt} L${ox+pt},${oy+ph-pt} L${ox+pt},${oy} Z`}
          fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <text x={cx} y={oy+ph+22} textAnchor="middle" fontSize="11" fill={DC} fontWeight="700">W{dims.W} × H{dims.H} × t{dims.t}</text>
      </svg>
    );
  }

  if (shape === 'channel') {
    const ref = Math.max(dims.W, dims.H, 30);
    const scale = maxD * 0.55 / ref;
    const pw = dims.W * scale, ph = dims.H * scale;
    const pt1 = dims.t1 * scale, pt2 = dims.t2 * scale;
    const ox = cx - pw/2 + 10, oy = cy - ph/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <path d={`M${ox+pw},${oy} L${ox},${oy} L${ox},${oy+ph} L${ox+pw},${oy+ph} L${ox+pw},${oy+ph-pt2} L${ox+pt1},${oy+ph-pt2} L${ox+pt1},${oy+pt2} L${ox+pw},${oy+pt2} Z`}
          fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <text x={cx+10} y={oy+ph+22} textAnchor="middle" fontSize="10" fill={DC} fontWeight="700">H{dims.H}×W{dims.W}×t1:{dims.t1}/t2:{dims.t2}</text>
      </svg>
    );
  }

  if (shape === 'hbeam') {
    const ref = Math.max(dims.W, dims.H, 30);
    const scale = maxD * 0.55 / ref;
    const pw = dims.W * scale, ph = dims.H * scale;
    const pt1 = dims.t1 * scale, pt2 = dims.t2 * scale;
    const ox = cx - pw/2, oy = cy - ph/2;
    const midX1 = cx - pt1/2, midX2 = cx + pt1/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <rect x={ox} y={oy} width={pw} height={pt2} fill={FILL} stroke={STROKE} strokeWidth={SW} rx="1"/>
        <rect x={ox} y={oy+ph-pt2} width={pw} height={pt2} fill={FILL} stroke={STROKE} strokeWidth={SW} rx="1"/>
        <rect x={midX1} y={oy+pt2} width={pt1} height={ph-2*pt2} fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <text x={cx} y={oy+ph+22} textAnchor="middle" fontSize="10" fill={DC} fontWeight="700">H{dims.H}×W{dims.W}×t1:{dims.t1}×t2:{dims.t2}</text>
      </svg>
    );
  }

  if (shape === 'tshape') {
    const ref = Math.max(dims.W, dims.H, 30);
    const scale = maxD * 0.55 / ref;
    const pw = dims.W * scale, ph = dims.H * scale;
    const pt1 = dims.t1 * scale, pt2 = dims.t2 * scale;
    const ox = cx - pw/2, oy = cy - ph/2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}>
        <rect x={ox} y={oy} width={pw} height={pt2} fill={FILL} stroke={STROKE} strokeWidth={SW} rx="1"/>
        <rect x={cx - pt1/2} y={oy+pt2} width={pt1} height={ph-pt2} fill={FILL} stroke={STROKE} strokeWidth={SW}/>
        <text x={cx} y={oy+ph+22} textAnchor="middle" fontSize="10" fill={DC} fontWeight="700">W{dims.W}×H{dims.H}×t1:{dims.t1}/t2:{dims.t2}</text>
      </svg>
    );
  }

  return <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 400 }}><text x={cx} y={cy} textAnchor="middle" fontSize="14" fill="#94a3b8">단면도 준비 중</text></svg>;
}

// ── Main component ────────────────────────────────────
export default function MetalWeightCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // STEP 1
  const [shape, setShape] = useState<ShapeId | null>(null);
  const [dims, setDims] = useState<Dims>({ ...ZERO_DIMS });
  const [length, setLength] = useState<string>('1');
  const [qty, setQty] = useState<string>('1');

  // Loss rate
  const [lossRateOpt, setLossRateOpt] = useState<string>('0');
  const [lossRateCustom, setLossRateCustom] = useState<string>('0');
  const lossRate = lossRateOpt === 'custom' ? (parseFloat(lossRateCustom) || 0) : parseFloat(lossRateOpt);

  // Material
  const [materials, setMaterials] = useState<Material[]>(BASE_MATERIALS);
  const [selectedMat, setSelectedMat] = useState<string>('강철/탄소강');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDensity, setCustomDensity] = useState('');

  // Pricing
  const [pricePerKg, setPricePerKg] = useState<string>('');
  const [pricePerM2, setPricePerM2] = useState<string>('');

  // KS preset
  const [ksPreset, setKsPreset] = useState<string>('');

  // Basket
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [copyMsg, setCopyMsg] = useState('');

  // Load custom materials from localStorage (useEffect only — SSR safe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('metal-weight-custom-mats');
      if (raw) {
        const custom: Material[] = JSON.parse(raw);
        setMaterials([...BASE_MATERIALS, ...custom]);
      }
    } catch { /* ignore */ }
  }, []);

  const saveCustomMaterials = useCallback((mats: Material[]) => {
    try {
      const custom = mats.filter(m => m.custom);
      localStorage.setItem('metal-weight-custom-mats', JSON.stringify(custom));
    } catch { /* ignore */ }
  }, []);

  // Reset dims when shape changes
  const handleShapeSelect = (id: ShapeId) => {
    setShape(id);
    setDims({ ...ZERO_DIMS });
    setKsPreset('');
  };

  const handleDim = (key: keyof Dims, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setDims(prev => ({ ...prev, [key]: num }));
  };

  const handleKsPreset = (label: string) => {
    if (!shape || !label) return;
    const presets = KS_PRESETS[shape] || [];
    const found = presets.find(p => p.label === label);
    if (found) {
      setDims(prev => ({ ...prev, ...found.dims }));
      setKsPreset(label);
    }
  };

  const handleAddCustomMaterial = () => {
    if (!customName.trim() || !customDensity) return;
    const density = parseFloat(customDensity);
    if (density <= 0 || isNaN(density)) return;
    const mat: Material = { name: customName.trim(), density, custom: true };
    const updated = [...materials, mat];
    setMaterials(updated);
    saveCustomMaterials(updated);
    setSelectedMat(mat.name);
    setCustomName('');
    setCustomDensity('');
    setShowCustomForm(false);
  };

  // Calculation
  const shapeDef = shape ? SHAPE_DEFS.find(s => s.id === shape) : null;
  const density = materials.find(m => m.name === selectedMat)?.density ?? 7.85;

  const result = useMemo(() => {
    if (!shape) return null;
    const len = parseFloat(length) || 0;
    const qt = Math.max(1, parseInt(qty) || 1);
    const ppk = parseFloat(pricePerKg) || 0;
    const ppm = parseFloat(pricePerM2) || 0;
    return calcResults(shape, dims, len, qt, density, lossRate, ppk, ppm);
  }, [shape, dims, length, qty, density, lossRate, pricePerKg, pricePerM2]);

  const hasResult = result && result.unitWeight > 0 && !result.error;

  const handleAddToBasket = () => {
    if (!shape || !result || !hasResult) return;
    const len = parseFloat(length) || 0;
    const qt = Math.max(1, parseInt(qty) || 1);
    const def = SHAPE_DEFS.find(s => s.id === shape)!;
    const item: BasketItem = {
      id: Date.now().toString(),
      shape, shapeName: isKo ? def.ko : def.en,
      spec: makeSpec(shape, dims, len, qt),
      material: selectedMat, density,
      length: len, qty: qt, lossRate,
      unitWeight: result.unitWeight, totalWeight: result.totalWeight, orderWeight: result.orderWeight,
      paintArea: result.paintArea,
      pricePerKg: parseFloat(pricePerKg) || 0,
      pricePerM2: parseFloat(pricePerM2) || 0,
      materialCost: result.materialCost, paintCost: result.paintCost, total: result.total,
    };
    setBasket(prev => [...prev, item]);
  };

  const handleDeleteBasketItem = (id: string) => setBasket(prev => prev.filter(b => b.id !== id));

  const basketTotalWeight = basket.reduce((s, b) => s + b.orderWeight, 0);
  const basketTotalCost = basket.reduce((s, b) => s + b.total, 0);

  const handleCopy = async () => {
    try {
      const lines = [
        `[${isKo ? '금속 자재 발주서' : 'Metal Material Order'}]`,
        '━━━━━━━━━━━━━━━━━━━━',
        ...basket.map((b, i) => {
          const loss = b.lossRate > 0 ? ` (${b.lossRate}%${isKo ? '할증' : ' loss'})` : '';
          const cost = b.total > 0 ? ` | ${b.total.toLocaleString()}${isKo ? '원' : ' KRW'}` : '';
          const len = b.length > 0 ? `${b.length}m` : '-';
          return `${i+1}. ${b.shapeName} | ${b.spec} | ${b.material} | ${len} | ${b.qty}${isKo ? '개' : 'pcs'} | ${b.orderWeight.toFixed(1)}kg${loss}${cost}`;
        }),
        '━━━━━━━━━━━━━━━━━━━━',
        `${isKo ? '총 발주 중량' : 'Total order weight'}: ${basketTotalWeight.toFixed(3)} kg (${isKo ? '로스율 반영' : 'incl. loss'})`,
        basketTotalCost > 0 ? `${isKo ? '총 금액' : 'Total cost'}: ${basketTotalCost.toLocaleString()} ${isKo ? '원' : 'KRW'}` : '',
        '📐 theutilhub.com/utilities/utility/metal-weight-calc',
      ].filter(Boolean);
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMsg(isKo ? '✓ 복사됨' : '✓ Copied');
    } catch {
      setCopyMsg(isKo ? '❌ 복사 실패' : '❌ Failed');
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const fmt = (v: number, d = 3) => v.toFixed(d);
  const fmtW = (v: number) => v >= 1000 ? `${(v/1000).toFixed(3)}t` : `${fmt(v)}kg`;
  const titleStr = isKo ? '금속 중량 & 면적 계산기' : 'Metal Weight & Area Calculator';
  const descStr = isKo ? 'H빔·파이프·판재 등 12형상 중량·도장 면적·예상 단가 실시간 계산. 견적 바구니로 즉시 발주서 작성.' : 'Calculate weight, paint area and cost for 12 metal shapes. Build a quote basket and copy the order instantly.';

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><Weight size={40} color="#8b5cf6" /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      {/* STEP 1 — Shape */}
      <section className={s.step_card}>
        <div className={s.step_label}>STEP 1</div>
        <h2 className={s.step_title}>{isKo ? '금속 형상 선택' : 'Select Metal Shape'}</h2>
        <div className={s.shape_grid}>
          {SHAPE_DEFS.map(def => (
            <button
              key={def.id}
              className={`${s.shape_btn} ${shape === def.id ? s.shape_active : ''}`}
              onClick={() => handleShapeSelect(def.id)}
              aria-label={isKo ? def.ko : def.en}
            >
              {SHAPE_ICONS[def.id]}
              {isKo ? def.ko : def.en}
            </button>
          ))}
        </div>

        {/* KS preset */}
        {shape && KS_PRESETS[shape] && KS_PRESETS[shape].length > 0 && (
          <div className={s.ks_row}>
            <span className={s.ks_label}>{isKo ? 'KS 규격 불러오기' : 'KS Standard Preset'}</span>
            <select
              className={s.ks_select}
              value={ksPreset}
              onChange={e => handleKsPreset(e.target.value)}
              aria-label={isKo ? 'KS 규격 선택' : 'Select KS standard'}
            >
              <option value="">{isKo ? '-- 직접 입력 --' : '-- Enter manually --'}</option>
              {KS_PRESETS[shape].map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>
        )}
      </section>

      {/* STEP 2 — Dimensions */}
      {shapeDef && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 2</div>
          <h2 className={s.step_title}>{isKo ? '치수 · 길이 · 수량 입력' : 'Dimensions · Length · Quantity'}</h2>
          <p className={s.step_hint}>{isKo ? '치수: mm 단위' : 'All dimensions in mm'}</p>

          {/* Shape-specific dimension inputs */}
          <div className={s.dims_grid}>
            {shapeDef.fields.map(field => (
              <div key={field} className={s.dim_field}>
                <label className={s.dim_label}>{isKo ? FIELD_LABELS[field].ko : FIELD_LABELS[field].en}</label>
                <div className={s.dim_input_wrap}>
                  <input
                    type="number" step="0.1" min="0"
                    className={s.dim_input}
                    value={dims[field] || ''}
                    onChange={e => handleDim(field, e.target.value)}
                    aria-label={FIELD_LABELS[field].en}
                  />
                  <span className={s.dim_unit}>{FIELD_LABELS[field].unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Length (m) — not for plate/checkered */}
          {shapeDef.hasLength && (
            <div className={s.dim_field}>
              <label className={s.dim_label}>{isKo ? '길이 (m)' : 'Length (m)'}</label>
              <div className={s.dim_input_wrap}>
                <input
                  type="number" step="0.01" min="0"
                  className={s.dim_input}
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  aria-label={isKo ? '길이 입력' : 'Length input'}
                />
                <span className={s.dim_unit}>m</span>
              </div>
            </div>
          )}

          {/* Common: quantity + loss rate */}
          <div className={s.common_grid}>
            <div>
              <label className={s.field_label}>{isKo ? '수량 (개/본)' : 'Quantity (pcs)'}</label>
              <input
                type="number" step="1" min="1"
                className={s.dim_input}
                value={qty}
                onChange={e => setQty(e.target.value)}
                style={{ width: '100%', paddingRight: '2.5rem', boxSizing: 'border-box' }}
                aria-label={isKo ? '수량 입력' : 'Quantity input'}
              />
            </div>
            <div>
              <label className={s.field_label}>{isKo ? '로스율 (할증, %)' : 'Loss Rate (%)'}</label>
              <select
                className={s.select_field}
                value={lossRateOpt}
                onChange={e => setLossRateOpt(e.target.value)}
                aria-label={isKo ? '로스율 선택' : 'Loss rate'}
              >
                <option value="0">0%</option>
                <option value="3">3%</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="custom">{isKo ? '직접 입력' : 'Custom'}</option>
              </select>
            </div>
            {lossRateOpt === 'custom' && (
              <div>
                <label className={s.field_label}>{isKo ? '로스율 직접 입력 (%)' : 'Custom loss rate (%)'}</label>
                <input
                  type="number" step="0.1" min="0" max="100"
                  className={s.dim_input}
                  value={lossRateCustom}
                  onChange={e => setLossRateCustom(e.target.value)}
                  style={{ width: '100%', paddingRight: '2.5rem', boxSizing: 'border-box' }}
                  aria-label={isKo ? '로스율 직접 입력' : 'Custom loss rate input'}
                />
              </div>
            )}
          </div>
          <p className={s.field_hint}>{isKo ? '절단 자투리 손실 반영. 현장 통상 3~5% 적용' : 'Add cutting waste. Typically 3–5% in the field.'}</p>
        </section>
      )}

      {/* STEP 3 — Material */}
      {shapeDef && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 3</div>
          <h2 className={s.step_title}>{isKo ? '재질 선택' : 'Select Material'}</h2>
          <div className={s.material_row}>
            <select
              className={s.material_select}
              value={selectedMat}
              onChange={e => setSelectedMat(e.target.value)}
              aria-label={isKo ? '재질 선택' : 'Select material'}
            >
              {materials.map(m => (
                <option key={m.name} value={m.name}>{m.name} ({m.density} g/cm³)</option>
              ))}
            </select>
            <button
              className={s.material_add_btn}
              onClick={() => setShowCustomForm(v => !v)}
              aria-label={isKo ? '새 재질 추가' : 'Add custom material'}
            >
              <Plus size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
              {isKo ? '새 재질 추가' : 'Add material'}
            </button>
          </div>
          {showCustomForm && (
            <div className={s.custom_form}>
              <div className={s.dim_field}>
                <label className={s.dim_label}>{isKo ? '재질명' : 'Material name'}</label>
                <input
                  className={s.dim_input}
                  style={{ paddingRight: '0.75rem' }}
                  placeholder={isKo ? '예: 인바(Invar)' : 'e.g. Invar Alloy'}
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  aria-label={isKo ? '재질명 입력' : 'Material name'}
                />
              </div>
              <div className={s.dim_field}>
                <label className={s.dim_label}>{isKo ? '밀도 (g/cm³)' : 'Density (g/cm³)'}</label>
                <div className={s.dim_input_wrap}>
                  <input
                    type="number" step="0.01" min="0"
                    className={s.dim_input}
                    placeholder="8.00"
                    value={customDensity}
                    onChange={e => setCustomDensity(e.target.value)}
                    aria-label={isKo ? '밀도 입력' : 'Density input'}
                  />
                  <span className={s.dim_unit}>g/cm³</span>
                </div>
              </div>
              <button className={s.custom_save_btn} onClick={handleAddCustomMaterial} aria-label={isKo ? '저장' : 'Save'}>
                {isKo ? '저장' : 'Save'}
              </button>
              <button className={s.custom_cancel_btn} onClick={() => setShowCustomForm(false)} aria-label={isKo ? '취소' : 'Cancel'}>
                {isKo ? '취소' : 'Cancel'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* STEP 4 — Pricing */}
      {shapeDef && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 4</div>
          <h2 className={s.step_title}>{isKo ? '단가 입력 (선택)' : 'Unit Price (optional)'}</h2>
          <p className={s.step_hint}>{isKo ? '단가를 입력하지 않으면 중량과 면적만 계산됩니다.' : 'Leave blank to calculate weight and area only.'}</p>
          <div className={s.price_grid}>
            <div>
              <label className={s.field_label}>{isKo ? 'kg당 자재 단가 (원)' : 'Material price (per kg)'}</label>
              <div className={s.dim_input_wrap}>
                <input
                  type="number" step="1" min="0"
                  className={s.dim_input}
                  placeholder={isKo ? '예: 2000' : 'e.g. 2000'}
                  value={pricePerKg}
                  onChange={e => setPricePerKg(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  aria-label={isKo ? 'kg당 단가' : 'Price per kg'}
                />
                <span className={s.dim_unit}>{isKo ? '원/kg' : 'KRW/kg'}</span>
              </div>
            </div>
            <div>
              <label className={s.field_label}>{isKo ? 'm²당 도장 단가 (원)' : 'Paint price (per m²)'}</label>
              <div className={s.dim_input_wrap}>
                <input
                  type="number" step="1" min="0"
                  className={s.dim_input}
                  placeholder={isKo ? '예: 15000' : 'e.g. 15000'}
                  value={pricePerM2}
                  onChange={e => setPricePerM2(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  aria-label={isKo ? 'm²당 도장 단가' : 'Paint price per m²'}
                />
                <span className={s.dim_unit}>{isKo ? '원/m²' : 'KRW/m²'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 5 — Results + SVG */}
      {shapeDef && result && (
        <section className={s.step_card}>
          <div className={s.step_label}>STEP 5</div>
          <h2 className={s.step_title}>{isKo ? 'SVG 단면도 & 계산 결과' : 'Cross-section & Results'}</h2>

          {result.error ? (
            <div className={s.warn_box}>⚠️ {result.error}</div>
          ) : (
            <>
              {/* SVG cross-section */}
              <div className={s.svg_wrap}>
                <CrossSectionSVG shape={shape!} dims={dims} isKo={isKo} />
              </div>

              {hasResult && (
                <>
                  <div className={s.result_big_grid}>
                    <div className={s.result_big}>
                      <div>
                        <span className={s.result_num}>{fmt(result.unitWeight)}</span>
                        <span className={s.result_unit}>kg</span>
                      </div>
                      <div className={s.result_label}>{isKo ? '1개당 중량' : 'Unit weight'}</div>
                    </div>
                    <div className={s.result_big}>
                      <div>
                        <span className={s.result_num}>{fmt(result.orderWeight)}</span>
                        <span className={s.result_unit}>kg</span>
                      </div>
                      <div className={s.result_label}>{isKo ? `발주 중량 (로스 ${lossRate}% 포함)` : `Order weight (${lossRate}% loss)`}</div>
                    </div>
                  </div>

                  <div className={s.result_sub_grid}>
                    <div className={s.result_sub}>
                      <span>{isKo ? '총 순 중량' : 'Net weight'}</span>
                      <strong>{fmt(result.totalWeight)} kg</strong>
                    </div>
                    <div className={s.result_sub}>
                      <span>{isKo ? '도장 면적' : 'Paint area'}</span>
                      <strong>{result.paintArea.toFixed(3)} m²</strong>
                    </div>
                    {result.materialCost > 0 && (
                      <div className={s.result_sub}>
                        <span>{isKo ? '예상 자재비' : 'Material cost'}</span>
                        <strong className={s.result_cost}>{result.materialCost.toLocaleString()}{isKo ? '원' : ' KRW'}</strong>
                      </div>
                    )}
                    {result.paintCost > 0 && (
                      <div className={s.result_sub}>
                        <span>{isKo ? '예상 도장비' : 'Paint cost'}</span>
                        <strong className={s.result_cost}>{result.paintCost.toLocaleString()}{isKo ? '원' : ' KRW'}</strong>
                      </div>
                    )}
                    {result.total > 0 && (
                      <div className={s.result_sub} style={{ gridColumn: '1 / -1' }}>
                        <span style={{ fontWeight: 800 }}>{isKo ? '합계' : 'Total'}</span>
                        <strong className={s.result_total}>{result.total.toLocaleString()}{isKo ? '원' : ' KRW'}</strong>
                      </div>
                    )}
                  </div>

                  <button className={s.basket_btn} onClick={handleAddToBasket} aria-label={isKo ? '견적 바구니에 담기' : 'Add to quote basket'}>
                    <ShoppingCart size={18} />
                    {isKo ? '👇 견적 바구니에 담기' : '👇 Add to Quote Basket'}
                  </button>
                </>
              )}
            </>
          )}
        </section>
      )}

      {/* STEP 6 — Basket */}
      <section className={s.step_card}>
        <div className={s.step_label}>STEP 6</div>
        <h2 className={s.step_title}>{isKo ? '견적 바구니 & 발주서' : 'Quote Basket & Order'}</h2>

        {basket.length === 0 ? (
          <p className={s.basket_empty}>{isKo ? '아직 담긴 항목이 없습니다.' : 'No items in basket yet.'}</p>
        ) : (
          <>
            <div className={s.basket_table_wrap}>
              <table className={s.basket_table}>
                <thead>
                  <tr>
                    <th>{isKo ? '형상' : 'Shape'}</th>
                    <th>{isKo ? '규격' : 'Spec'}</th>
                    <th>{isKo ? '재질' : 'Material'}</th>
                    <th>{isKo ? '길이' : 'Length'}</th>
                    <th>{isKo ? '수량' : 'Qty'}</th>
                    <th>{isKo ? '발주중량(kg)' : 'Order(kg)'}</th>
                    <th>{isKo ? '금액(원)' : 'Cost'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {basket.map(b => (
                    <tr key={b.id}>
                      <td>{b.shapeName}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{b.spec}</td>
                      <td>{b.material}</td>
                      <td>{b.length > 0 ? `${b.length}m` : '-'}</td>
                      <td>{b.qty}{isKo ? '개' : 'pcs'}</td>
                      <td><strong>{b.orderWeight.toFixed(1)}</strong>{b.lossRate > 0 ? <span style={{ fontSize: '0.7rem', color: '#f97316', marginLeft: '2px' }}>+{b.lossRate}%</span> : ''}</td>
                      <td style={{ color: b.total > 0 ? '#ea580c' : '#94a3b8', fontWeight: 700 }}>{b.total > 0 ? b.total.toLocaleString() : '-'}</td>
                      <td><button className={s.basket_delete_btn} onClick={() => handleDeleteBasketItem(b.id)} aria-label={isKo ? '삭제' : 'Delete'}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={s.basket_total_row}>
              <div className={s.basket_total_item}>
                <div className={s.basket_total_label}>{isKo ? '총 발주 중량 (로스 반영)' : 'Total order weight (incl. loss)'}</div>
                <div className={s.basket_total_num}>{basketTotalWeight.toFixed(3)} kg</div>
              </div>
              {basketTotalCost > 0 && (
                <div className={s.basket_total_item}>
                  <div className={s.basket_total_label}>{isKo ? '총 발주 금액' : 'Total cost'}</div>
                  <div className={`${s.basket_total_num} ${s.basket_total_cost}`}>{basketTotalCost.toLocaleString()} {isKo ? '원' : 'KRW'}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className={s.copy_btn} onClick={handleCopy} aria-label={isKo ? '발주서 복사' : 'Copy order'}>
                <Copy size={14} />
                {isKo ? '📋 발주서 내역 복사' : '📋 Copy Order Sheet'}
              </button>
              {copyMsg && <span className={`${s.copy_msg} ${copyMsg.includes('❌') ? s.copy_msg_fail : ''}`}>{copyMsg}</span>}
            </div>
          </>
        )}
      </section>

      {/* Bottom 7 sections */}
      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utility/metal-weight-calc" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection
        ko={{
          title: '금속 중량 & 면적 계산기란 무엇인가요?',
          description: '금속 중량 & 면적 계산기는 가공·설비·철골 현장에서 철강재 발주 견적을 낼 때 필요한 모든 계산을 즉시 처리해주는 현장 실무 도구입니다. 환봉·파이프·H빔·판재 등 12가지 금속 형상의 단면적 공식을 내장하고, 강철·알루미늄·스테인리스 등 19가지 재질의 밀도를 제공합니다. KS 규격 프리셋으로 H빔·채널·앵글 규격을 버튼 하나로 불러올 수 있으며, 커스텀 재질을 추가하면 다음 방문에도 기억됩니다. 여러 자재를 견적 바구니에 담아 총 중량과 총 금액을 한눈에 확인하고, 발주서를 즉시 공유할 수 있습니다.',
          useCases: [
            { icon: '🏗️', title: '철골 구조물 발주 견적', desc: 'H빔·앵글·채널 등 여러 형상과 규격을 견적 바구니에 담아 총 중량과 예상 자재비를 한 번에 산출하세요. KS 규격 프리셋으로 규격 입력 오류도 방지할 수 있습니다.' },
            { icon: '🎨', title: '도장 물량 산출', desc: '파이프·형강 등 도장이 필요한 자재의 표면적(도장 면적)을 형상별 기준에 맞게 자동 계산합니다. m²당 단가를 입력하면 예상 도장비도 즉시 산출됩니다.' },
            { icon: '🔧', title: '설비 배관 자재 발주', desc: '파이프 규격(외경·두께)과 길이·수량을 입력하면 총 중량과 외경 기준 도장 면적을 즉시 계산합니다. 여러 규격의 파이프를 바구니에 담아 한 번에 발주서를 작성하세요.' },
            { icon: '⚙️', title: '커스텀 재질 중량 계산', desc: '기본 제공 재질 외에 특수 합금이나 비금속 소재의 밀도를 직접 입력하고 저장하면, 다음 방문에도 사용할 수 있습니다.' },
          ],
          steps: [
            { step: '형상 선택', desc: '형상 아이콘 그리드에서 계산할 금속 형상을 선택합니다. H빔·채널·앵글은 KS 규격 드롭다운에서 규격을 선택하면 치수가 자동 입력됩니다.' },
            { step: '치수 입력', desc: '선택한 형상에 맞는 치수(mm)와 길이(m), 수량을 입력합니다. 재질을 선택하고 단가를 입력하면 예상 비용까지 실시간으로 계산됩니다.' },
            { step: '결과 확인', desc: 'SVG 단면도로 입력한 치수를 시각적으로 확인하고, 1개당 중량·총 중량·도장 면적·예상 금액을 확인합니다. 바구니에 담기 버튼으로 목록에 추가하세요.' },
            { step: '발주서 복사', desc: '여러 자재를 바구니에 담은 뒤 발주서 복사 버튼을 클릭하면 모든 자재의 총 중량과 총 금액이 포함된 발주서가 클립보드에 복사됩니다.' },
          ],
          faqs: [
            { q: '커스텀 재질은 어떻게 저장되나요?', a: '커스텀 재질은 사용자의 브라우저 로컬 저장소(localStorage)에 저장됩니다. 같은 기기·같은 브라우저에서 다음 방문 시에도 저장한 재질을 그대로 사용할 수 있습니다. 단, 다른 기기나 브라우저를 사용하거나 브라우저 데이터를 초기화하면 초기화됩니다. 파일이 서버로 전송되지 않아 보안상 안전합니다.' },
            { q: '도장 면적 계산 기준이 형상마다 다른가요?', a: '네, 형상 특성에 맞게 다르게 적용됩니다. 파이프는 내경에 도장을 하지 않으므로 외경 둘레만 기준으로 계산합니다. 판재는 넓은 양면(앞뒤)만 기준으로 하며 절단면 4면은 제외합니다. 환봉·형강류는 단면 전체 둘레를 기준으로 계산합니다. 현장에서 실제 도장 방식에 따라 차이가 있을 수 있으므로 참고용으로 활용하세요.' },
            { q: 'KS 규격 프리셋이 없는 형상은 어떻게 입력하나요?', a: 'H빔·채널·앵글 외의 형상(파이프·환봉·평철 등)은 KS 규격 드롭다운 없이 치수를 직접 입력합니다. 파이프의 경우 외경(D)과 벽두께(t)를 mm 단위로 입력하면 됩니다. 제품 카탈로그나 KS 규격표에서 치수를 확인하세요.' },
            { q: '이 툴의 결과를 공식 발주 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 현장 참고용으로만 제공됩니다. 실제 발주 시에는 반드시 제조사 규격표와 현장 실측값을 기준으로 최종 확인하시기 바랍니다. 특히 도장 면적은 현장 도장 방식에 따라 실제값과 차이가 있을 수 있습니다.' },
          ],
        }}
        en={{
          title: 'What is the Metal Weight & Area Calculator?',
          description: 'The Metal Weight & Area Calculator is a field-ready tool for fabrication, plant, and steel construction sites that need instant weight, paint area, and cost estimates for material orders. It covers 12 metal cross-sections including round bar, pipe, H-beam, and plate, with built-in density data for 19 standard materials. KS standard presets auto-fill dimensions for H-beams, C-channels, and angles. Custom materials are saved locally and remembered on your next visit. Add multiple items to a quote basket to get total weight and cost in one view, then copy a formatted order sheet to share instantly.',
          useCases: [
            { icon: '🏗️', title: 'Steel structure order quotes', desc: 'Add H-beams, angles, and channels of different sizes to the quote basket to get total weight and material cost in one step. KS standard presets prevent dimension entry errors.' },
            { icon: '🎨', title: 'Paint area estimation', desc: 'Automatically calculates paint area for pipes and structural sections using shape-specific rules. Enter a per-m² rate to get the estimated painting cost alongside the material cost.' },
            { icon: '🔧', title: 'Piping material orders', desc: 'Enter pipe outer diameter, wall thickness, length, and quantity to get total weight and outer-diameter-based paint area. Add multiple pipe sizes to the basket for a single order sheet.' },
            { icon: '⚙️', title: 'Custom material weight calculation', desc: 'Add special alloys or non-metallic materials by entering a name and density. Saved locally in your browser, the custom material is available on your next visit.' },
          ],
          steps: [
            { step: 'Select shape', desc: 'Tap a shape from the icon grid — round bar, pipe, H-beam, plate, etc. For H-beams, C-channels, and angles, choose a KS standard from the dropdown to auto-fill all dimensions.' },
            { step: 'Enter dimensions', desc: 'Fill in the required dimensions in mm and the length in meters. Select a material, enter loss rate for cutting waste, and optionally enter unit prices to get cost estimates.' },
            { step: 'Review results', desc: 'Check the SVG cross-section diagram for the shape, then read the unit weight, total weight, paint area, and estimated costs. Tap "Add to basket" to add to the order list.' },
            { step: 'Copy order sheet', desc: 'After adding multiple materials to the basket, tap "Copy Order Sheet" to copy a formatted order with all items, total weight (including loss), and total cost to your clipboard.' },
          ],
          faqs: [
            { q: 'How are custom materials saved?', a: 'Custom materials are saved in your browser\'s localStorage. They persist on the same device and browser across visits. If you clear browser data or switch devices, the custom materials will be gone. No data is sent to any server.' },
            { q: 'Why does paint area calculation differ by shape?', a: 'Each shape has a different painting convention. Pipes use only the outer diameter perimeter because the inner surface is not normally painted. Plates use only the two wide faces, excluding the four cut edges. All other structural sections use the full cross-section perimeter.' },
            { q: 'How do I enter dimensions for shapes without KS presets?', a: 'Shapes like pipe, round bar, and flat bar require manual dimension entry since there is no KS preset dropdown for them. For pipe, enter the outer diameter (D) and wall thickness (t) in millimeters. Refer to product catalogs or KS/JIS standards for the correct values.' },
            { q: 'Can I use the results as official procurement data?', a: 'Results are for reference only. For actual procurement, always verify the final dimensions and quantities against manufacturer specifications and on-site measurements. Paint area in particular may differ from actual usage depending on your painting method.' },
          ],
        }}
      />
    </div>
  );
}
