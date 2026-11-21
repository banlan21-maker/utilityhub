'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Weight, Copy, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  SHAPES, PRESETS, SAMPLE_DIMS, shapeDef, calc, validate, isComplete, specLabel,
  type ShapeId, type DimKey, type Dims, type ErrorCode,
} from '@/lib/metalWeight';
import CrossSection from './CrossSection';
import s from './metal-weight-calc.module.css';
import { ui } from '@/app/components/ui';

interface Material { id: string; ko: string; en: string; density: number; custom?: boolean }
interface BasketItem {
  id: string; shape: ShapeId; spec: string; material: string; materialEn?: string;
  lengthM: number; qty: number; lossPct: number; orderKg: number; paintM2: number; cost: number;
}

const BASE_MATERIALS: Material[] = [
  { id: 'steel', ko: '강철·탄소강 (SS275 등)', en: 'Carbon steel', density: 7.85 },
  { id: 'sus304', ko: '스테인리스 304·310', en: 'Stainless 304/310', density: 7.93 },
  { id: 'sus316', ko: '스테인리스 316·321', en: 'Stainless 316/321', density: 7.98 },
  { id: 'sus430', ko: '스테인리스 410·430', en: 'Stainless 410/430', density: 7.75 },
  { id: 'al', ko: '알루미늄', en: 'Aluminium', density: 2.70 },
  { id: 'brass', ko: '황동(신주)', en: 'Brass', density: 8.50 },
  { id: 'cu', ko: '구리(동)', en: 'Copper', density: 8.96 },
  { id: 'bronze', ko: '청동', en: 'Bronze', density: 8.80 },
  { id: 'castiron', ko: '주철', en: 'Cast iron', density: 7.20 },
  { id: 'zn', ko: '아연', en: 'Zinc', density: 7.14 },
  { id: 'pb', ko: '납', en: 'Lead', density: 11.34 },
  { id: 'ni', ko: '니켈', en: 'Nickel', density: 8.90 },
  { id: 'ti', ko: '티타늄', en: 'Titanium', density: 4.51 },
  { id: 'sn', ko: '주석', en: 'Tin', density: 7.30 },
  { id: 'w', ko: '텅스텐', en: 'Tungsten', density: 19.25 },
  { id: 'inconel', ko: '인코넬', en: 'Inconel', density: 8.44 },
  { id: 'mcnylon', ko: 'MC나일론', en: 'MC nylon', density: 1.16 },
  { id: 'pom', ko: '아세탈(POM)', en: 'Acetal (POM)', density: 1.41 },
  { id: 'ptfe', ko: '테프론(PTFE)', en: 'PTFE', density: 2.20 },
];

const SHAPE_NAMES: Record<ShapeId, [string, string]> = {
  round: ['환봉', 'Round bar'], pipe: ['파이프·강관', 'Pipe'], square: ['사각봉', 'Square bar'], sqtube: ['각파이프', 'Square tube'],
  hex: ['육각봉', 'Hex bar'], flat: ['평철', 'Flat bar'], plate: ['철판', 'Plate'], angle: ['앵글 (ㄱ형강)', 'Angle'],
  channel: ['찬넬 (ㄷ형강)', 'Channel'], hbeam: ['H빔 (H형강)', 'H-beam'], tshape: ['T형강', 'T-section'], checkered: ['무늬강판', 'Checkered plate'],
};

/** 칸 이름: [단면도용 짧은 이름, 입력칸 제목, 설명] */
type FieldText = [string, string, string];
const FIELD_KO: Record<ShapeId, Partial<Record<DimKey, FieldText>>> = {
  round: { D: ['D', '지름 D', ''] },
  pipe: { D: ['D', '외경 D', '바깥 지름'], t: ['t', '두께 t', '관 벽 두께'] },
  square: { W: ['W', '가로 W', ''], H: ['H', '세로 H', ''] },
  sqtube: { W: ['A', '가로 A', ''], H: ['B', '세로 B', ''], t: ['t', '두께 t', '벽 두께'], r: ['R', '모서리 R (선택)', '비우면 KS 기준 2t'] },
  hex: { S: ['S', '맞변 거리 S', '평평한 면끼리 거리 (스패너 치수)'] },
  flat: { W: ['W', '폭 W', ''], t: ['t', '두께 t', ''] },
  plate: { W: ['W', '폭 W', '예: 4×8 판 = 1219'], L: ['L', '길이 L', '예: 4×8 판 = 2438'], t: ['t', '두께 t', ''] },
  checkered: { W: ['W', '폭 W', ''], L: ['L', '길이 L', ''], t: ['t', '두께 t', '무늬를 뺀 바닥 두께'] },
  angle: { W: ['A', '가로 변 A', ''], H: ['B', '세로 변 B', ''], t: ['t', '두께 t', ''], r1: ['r1', '안쪽 필렛 r1 (선택)', '두 변이 만나는 안쪽 둥근 부분'], r2: ['r2', '끝 모서리 r2 (선택)', '변 끝의 둥근 모서리'] },
  channel: {
    H: ['H', '높이 H', '등판(웹) 방향 전체 높이'], W: ['B', '폭 B', '날개(플랜지) 길이'],
    t1: ['t1 웹', '웹 두께 t1', '세로로 선 등판의 두께'], t2: ['t2 플랜지', '플랜지 두께 t2', '위·아래 날개의 두께'],
    r1: ['r1', '안쪽 필렛 r1 (선택)', '웹과 플랜지가 만나는 안쪽'], r2: ['r2', '플랜지 끝 r2 (선택)', '날개 끝 안쪽 모서리'],
  },
  hbeam: {
    H: ['H', '높이 H', '위 플랜지 겉면 ~ 아래 플랜지 겉면'], W: ['B', '폭 B', '플랜지(가로판) 너비'],
    t1: ['t1 웹', '웹 두께 t1', '가운데 세로판 두께'], t2: ['t2 플랜지', '플랜지 두께 t2', '위·아래 가로판 두께'],
    r: ['r', '필렛 r (선택)', '웹과 플랜지가 만나는 안쪽 둥근 부분'],
  },
  tshape: {
    H: ['H', '높이 H', '플랜지 윗면 ~ 웹 끝'], W: ['B', '폭 B', '플랜지(가로판) 너비'],
    t1: ['t1 웹', '웹 두께 t1', '아래로 뻗은 세로판 두께'], t2: ['t2 플랜지', '플랜지 두께 t2', '위 가로판 두께'],
    r: ['r', '필렛 r (선택)', '웹과 플랜지가 만나는 안쪽'],
  },
};
const FIELD_EN: Record<ShapeId, Partial<Record<DimKey, FieldText>>> = {
  round: { D: ['D', 'Diameter D', ''] },
  pipe: { D: ['D', 'Outer diameter D', ''], t: ['t', 'Wall thickness t', ''] },
  square: { W: ['W', 'Width W', ''], H: ['H', 'Height H', ''] },
  sqtube: { W: ['A', 'Side A', ''], H: ['B', 'Side B', ''], t: ['t', 'Wall t', ''], r: ['R', 'Corner R (optional)', 'Blank = 2t (KS)'] },
  hex: { S: ['S', 'Across flats S', 'Spanner size'] },
  flat: { W: ['W', 'Width W', ''], t: ['t', 'Thickness t', ''] },
  plate: { W: ['W', 'Width W', '4×8 sheet = 1219'], L: ['L', 'Length L', '4×8 sheet = 2438'], t: ['t', 'Thickness t', ''] },
  checkered: { W: ['W', 'Width W', ''], L: ['L', 'Length L', ''], t: ['t', 'Base thickness t', 'Without the raised pattern'] },
  angle: { W: ['A', 'Leg A', ''], H: ['B', 'Leg B', ''], t: ['t', 'Thickness t', ''], r1: ['r1', 'Root radius r1 (optional)', ''], r2: ['r2', 'Toe radius r2 (optional)', ''] },
  channel: {
    H: ['H', 'Depth H', 'Along the web'], W: ['B', 'Flange width B', ''],
    t1: ['t1 web', 'Web thickness t1', 'The upright back'], t2: ['t2 flange', 'Flange thickness t2', 'Top and bottom legs'],
    r1: ['r1', 'Root radius r1 (optional)', ''], r2: ['r2', 'Toe radius r2 (optional)', ''],
  },
  hbeam: {
    H: ['H', 'Depth H', 'Outside of flange to outside of flange'], W: ['B', 'Flange width B', ''],
    t1: ['t1 web', 'Web thickness t1', 'The vertical centre plate'], t2: ['t2 flange', 'Flange thickness t2', 'Top and bottom plates'],
    r: ['r', 'Root radius r (optional)', 'Web-to-flange fillet'],
  },
  tshape: {
    H: ['H', 'Depth H', ''], W: ['B', 'Flange width B', ''],
    t1: ['t1 web', 'Web thickness t1', 'The stem'], t2: ['t2 flange', 'Flange thickness t2', 'The top plate'],
    r: ['r', 'Root radius r (optional)', ''],
  },
};

const ERRORS: Record<NonNullable<ErrorCode>, [string, string]> = {
  pipeWall: ['두께 t가 외경 D의 절반 이상이면 관이 될 수 없습니다.', 'Wall thickness must be less than half the outer diameter.'],
  tubeWall: ['두께 t의 2배가 가로·세로보다 작아야 합니다.', 'Twice the wall thickness must be less than each side.'],
  angleLeg: ['두께 t가 변 길이보다 작아야 합니다.', 'Thickness must be less than the leg length.'],
  flangeTooThick: ['플랜지 두께 t2가 높이 H에 비해 너무 두껍습니다. t1·t2 칸이 바뀌지 않았는지 확인하세요.', 'Flange thickness t2 is too large for depth H — check that t1 and t2 are not swapped.'],
  webTooThick: ['웹 두께 t1이 폭 B보다 두껍습니다. t1·t2 칸이 바뀌지 않았는지 확인하세요.', 'Web thickness t1 exceeds flange width B — check that t1 and t2 are not swapped.'],
};

const CUSTOM_KEY = 'metal-weight-custom-mats';
const BASKET_KEY = 'metal-weight-basket-v1';
const PAGE_URL = 'https://www.theutilhub.com/{locale}/utilities/utility/metal-weight-calc';

const decimalInput = (raw: string) => {
  const [int, ...dec] = raw.replace(/[^0-9.]/g, '').split('.');
  return dec.length ? `${int}.${dec.join('').slice(0, 3)}` : int;
};
const toDims = (text: Partial<Record<DimKey, string>>): Dims =>
  Object.fromEntries(Object.entries(text).map(([k, val]) => [k, val === '' || val === undefined ? null : Number(val)]));
const toText = (d: Dims): Partial<Record<DimKey, string>> =>
  Object.fromEntries(Object.entries(d).map(([k, val]) => [k, val === null || val === undefined ? '' : String(val)]));

function ShapeIcon({ id }: { id: ShapeId }) {
  const c = { round: <circle cx="20" cy="20" r="14" className={s.ic_fill} />,
    pipe: <><circle cx="20" cy="20" r="14" className={s.ic_fill} /><circle cx="20" cy="20" r="8" className={s.ic_hole} /></>,
    square: <rect x="6" y="6" width="28" height="28" rx="2" className={s.ic_fill} />,
    sqtube: <><rect x="6" y="6" width="28" height="28" rx="4" className={s.ic_fill} /><rect x="12" y="12" width="16" height="16" rx="2" className={s.ic_hole} /></>,
    hex: <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" className={s.ic_fill} />,
    flat: <rect x="4" y="14" width="32" height="12" rx="2" className={s.ic_fill} />,
    plate: <rect x="3" y="17" width="34" height="6" rx="1" className={s.ic_fill} />,
    checkered: <><rect x="3" y="17" width="34" height="6" rx="1" className={s.ic_fill} /><path d="M8 17l3-3M16 17l3-3M24 17l3-3M32 17l3-3" className={s.ic_fill} /></>,
    angle: <path d="M7 5h7v21h21v7H7z" className={s.ic_solid} />,
    channel: <path d="M8 5h25v6H14v18h19v6H8z" className={s.ic_solid} />,
    hbeam: <path d="M5 5h30v6H23v18h12v6H5v-6h12V11H5z" className={s.ic_solid} />,
    tshape: <path d="M5 6h30v7H23v22h-6V13H5z" className={s.ic_solid} />,
  }[id];
  return <svg viewBox="0 0 40 40" className={s.shape_icon} aria-hidden="true">{c}</svg>;
}

export default function MetalWeightCalcClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);

  const [shape, setShape] = useState<ShapeId>('hbeam');
  const [dimText, setDimText] = useState<Partial<Record<DimKey, string>>>({});
  const [preset, setPreset] = useState('');
  const [active, setActive] = useState<DimKey | null>(null);
  const [lengthText, setLengthText] = useState('6');
  const [qtyText, setQtyText] = useState('1');
  const [lossText, setLossText] = useState('0');
  const [plateFaces, setPlateFaces] = useState<1 | 2>(2);
  const [materials, setMaterials] = useState<Material[]>(BASE_MATERIALS);
  const [matId, setMatId] = useState('steel');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDensity, setCustomDensity] = useState('');
  const [priceKg, setPriceKg] = useState('');
  const [priceM2, setPriceM2] = useState('');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [copyMsg, setCopyMsg] = useState('');

  // 저장된 재질·견적 바구니는 브라우저에서만 읽는다
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '[]') as { name: string; density: number }[];
      if (raw.length) setMaterials([...BASE_MATERIALS, ...raw.map(m => ({ id: `custom:${m.name}`, ko: m.name, en: m.name, density: m.density, custom: true }))]);
      setBasket(JSON.parse(localStorage.getItem(BASKET_KEY) ?? '[]'));
    } catch { /* 저장소를 못 쓰면 기본값 */ }
  }, []);

  const saveBasket = (items: BasketItem[]) => {
    setBasket(items);
    try { localStorage.setItem(BASKET_KEY, JSON.stringify(items)); } catch { /* 무시 */ }
  };

  const def = shapeDef(shape);
  const fieldText = (isKo ? FIELD_KO : FIELD_EN)[shape];
  const dims = toDims(dimText);
  const complete = isComplete(shape, dims);
  const errorCode = validate(shape, dims);
  // 입력이 없으면 예시 치수로 단면도를 보여 준다
  const anyInput = def.fields.some(k => dimText[k]);
  const merged: Dims = { ...SAMPLE_DIMS[shape], ...Object.fromEntries(Object.entries(dims).filter(([, val]) => (val ?? 0) > 0)) };
  const drawDims: Dims = complete && !errorCode ? dims : anyInput && !validate(shape, merged) ? merged : SAMPLE_DIMS[shape];
  const material = materials.find(m => m.id === matId) ?? BASE_MATERIALS[0];
  const qty = Math.max(0, Math.floor(Number(qtyText) || 0));
  const lossPct = Number(lossText) || 0;
  const result = calc({ shape, dims, lengthM: Number(lengthText) || 0, qty, density: material.density, lossPct, plateFaces });
  const matCost = result && Number(priceKg) > 0 ? Math.round(result.orderKg * Number(priceKg)) : 0;
  const paintCost = result && Number(priceM2) > 0 ? Math.round(result.paintM2 * Number(priceM2)) : 0;

  const selectShape = (id: ShapeId) => {
    setShape(id);
    setDimText({});
    setPreset('');
    setActive(null);
  };

  const applyPreset = (label: string) => {
    setPreset(label);
    const found = (PRESETS[shape] ?? []).flatMap(g => g.items).find(p => p.label === label);
    if (found) setDimText(toText(found.dims));
  };

  const addCustom = () => {
    const density = Number(customDensity);
    const name = customName.trim();
    if (!name || !(density > 0)) return;
    const mat: Material = { id: `custom:${name}`, ko: name, en: name, density, custom: true };
    const next = [...materials.filter(m => m.id !== mat.id), mat];
    setMaterials(next);
    setMatId(mat.id);
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(next.filter(m => m.custom).map(m => ({ name: m.ko, density: m.density })))); } catch { /* 무시 */ }
    setCustomName(''); setCustomDensity(''); setShowCustom(false);
  };

  const addToBasket = () => {
    if (!result) return;
    saveBasket([...basket, {
      id: `${Date.now()}`, shape, spec: specLabel(shape, dims), material: material.ko, materialEn: material.en,
      lengthM: def.sheet ? 0 : Number(lengthText) || 0, qty, lossPct, orderKg: result.orderKg, paintM2: result.paintM2, cost: matCost + paintCost,
    }]);
  };

  const totalKg = basket.reduce((sum, b) => sum + b.orderKg, 0);
  const totalCost = basket.reduce((sum, b) => sum + b.cost, 0);
  const totalPaint = basket.reduce((sum, b) => sum + b.paintM2, 0);
  const won = (n: number) => (isKo ? `${n.toLocaleString('ko-KR')}원` : `₩${n.toLocaleString('en-US')}`);
  const kg = (n: number, d = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  const copyOrder = async () => {
    const lines = [
      `[${L('금속 자재 발주 내역', 'Metal material order')}]`,
      ...basket.map((b, i) => [
        `${i + 1}. ${(isKo ? SHAPE_NAMES[b.shape][0] : SHAPE_NAMES[b.shape][1])} ${b.spec}`,
        isKo ? b.material : b.materialEn ?? b.material,
        b.lengthM > 0 ? `${b.lengthM}m` : '',
        `${b.qty}${L('개', ' pcs')}`,
        `${kg(b.orderKg, 1)}kg${b.lossPct > 0 ? ` (${L('로스', 'loss')} ${b.lossPct}%)` : ''}`,
        b.cost > 0 ? won(b.cost) : '',
      ].filter(Boolean).join(' | ')),
      '──────────',
      `${L('총 발주 중량', 'Total order weight')}: ${kg(totalKg, 1)} kg`,
      totalPaint > 0 ? `${L('총 도장 면적', 'Total paint area')}: ${kg(totalPaint, 2)} ㎡` : '',
      totalCost > 0 ? `${L('총 금액', 'Total cost')}: ${won(totalCost)}` : '',
      PAGE_URL.replace('{locale}', locale),
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMsg(L('✓ 복사했습니다', '✓ Copied'));
    } catch { setCopyMsg(L('복사하지 못했습니다', 'Could not copy')); }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const presetGroups = PRESETS[shape];
  const titleStr = L('금속 중량 & 면적 계산기', 'Metal Weight & Area Calculator');
  const descStr = L('H빔·찬넬·앵글·파이프·철판 등 12가지 형상의 중량(kg/m)·도장 면적·자재비를 KS 규격 치수로 계산하고 발주 내역을 만듭니다.', 'Weight per metre, paint area and cost for 12 metal shapes with KS standard sizes, plus an order list.');
  const names = Object.fromEntries(Object.entries(fieldText).map(([k, val]) => [k, val![0]])) as Partial<Record<DimKey, string>>;

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Weight />} title={titleStr} subtitle={descStr} />

      <section className={`${ui.card} ${s.card}`}>
        <div className={s.step}>STEP 1</div>
        <h2 className={ui.cardTitle}>{L('형상 선택', 'Shape')}</h2>
        <div className={s.shape_grid}>
          {SHAPES.map(sh => (
            <button key={sh.id} type="button" aria-pressed={shape === sh.id}
              className={`${ui.chip} ${s.shape_btn} ${shape === sh.id ? ui.chipActive : ''}`} onClick={() => selectShape(sh.id)}>
              <ShapeIcon id={sh.id} />
              {isKo ? SHAPE_NAMES[sh.id][0] : SHAPE_NAMES[sh.id][1]}
            </button>
          ))}
        </div>
      </section>

      <section className={`${ui.card} ${s.card}`}>
        <div className={s.step}>STEP 2</div>
        <h2 className={ui.cardTitle}>{L('치수 입력', 'Dimensions')} — {isKo ? SHAPE_NAMES[shape][0] : SHAPE_NAMES[shape][1]}</h2>
        <div className={s.layout}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {presetGroups && (
              <div className={ui.field}>
                <label className={ui.label} htmlFor="mw-preset">{L('KS 규격에서 고르기', 'Pick a KS size')}</label>
                <select id="mw-preset" className={ui.input} value={preset} onChange={e => applyPreset(e.target.value)}>
                  <option value="">{L('— 직접 입력 —', '— Enter manually —')}</option>
                  {presetGroups.map((g, gi) => g.group
                    ? <optgroup key={gi} label={g.group}>{g.items.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}</optgroup>
                    : g.items.map(p => <option key={p.label} value={p.label}>{p.label}</option>))}
                </select>
              </div>
            )}
            <div className={s.fields}>
              {def.fields.map(k => {
                const [, title, desc] = fieldText[k]!;
                return (
                  <div key={k} className={`${ui.field} ${active === k ? s.field_active : ''}`}>
                    <label className={ui.label} htmlFor={`mw-${k}`}>{title}{desc && <small>{desc}</small>}</label>
                    <div className={ui.inputGroup}>
                      <input id={`mw-${k}`} className={ui.input} inputMode="decimal" autoComplete="off"
                        placeholder={def.optional.includes(k) ? (shape === 'sqtube' ? '2t' : '0') : String(SAMPLE_DIMS[shape][k] ?? '')}
                        value={dimText[k] ?? ''}
                        onFocus={() => setActive(k)} onBlur={() => setActive(a => (a === k ? null : a))}
                        onChange={e => { setDimText(prev => ({ ...prev, [k]: decimalInput(e.target.value) })); setPreset(''); }} />
                      <span className={ui.unit}>mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={s.row3}>
              {!def.sheet && (
                <div className={ui.field}>
                  <label className={ui.label} htmlFor="mw-len">{L('길이', 'Length')}</label>
                  <div className={ui.inputGroup}>
                    <input id="mw-len" className={ui.input} inputMode="decimal" value={lengthText} onChange={e => setLengthText(decimalInput(e.target.value))} />
                    <span className={ui.unit}>m</span>
                  </div>
                </div>
              )}
              <div className={ui.field}>
                <label className={ui.label} htmlFor="mw-qty">{L('수량', 'Quantity')}</label>
                <div className={ui.inputGroup}>
                  <input id="mw-qty" className={ui.input} inputMode="numeric" value={qtyText} onChange={e => setQtyText(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
                  <span className={ui.unit}>{L('개', 'pcs')}</span>
                </div>
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="mw-loss">{L('로스(할증)', 'Waste allowance')}</label>
                <div className={ui.inputGroup}>
                  <input id="mw-loss" className={ui.input} inputMode="decimal" value={lossText} onChange={e => setLossText(decimalInput(e.target.value))} />
                  <span className={ui.unit}>%</span>
                </div>
              </div>
            </div>
            {def.sheet && (
              <div className={ui.field}>
                <span className={ui.label}>{L('도장 면', 'Painted faces')}</span>
                <div className={ui.chips}>
                  {([2, 1] as const).map(f => (
                    <button key={f} type="button" className={`${ui.chip} ${plateFaces === f ? ui.chipActive : ''}`} onClick={() => setPlateFaces(f)} aria-pressed={plateFaces === f}>
                      {f === 2 ? L('양면', 'Both faces') : L('한 면', 'One face')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className={s.hint}>{L('절단 자투리를 생각해 로스는 보통 3~5%를 잡습니다.', 'Allow 3–5% for cutting waste.')}</p>
          </div>

          <div className={s.layout_diagram}>
            <CrossSection shape={shape} dims={drawDims} active={active} names={names}
              sample={!complete || !!errorCode} sampleLabel={L('예시 치수', 'Example size')}
              exaggeratedNote={L('※ 얇은 두께는 보이도록 실제보다 두껍게 그렸습니다.', '※ Thin walls are drawn thicker so they stay visible.')} />
            <div className={s.legend}>
              {def.fields.map(k => (
                <div key={k} className={active === k ? s.legend_on : ''}>
                  <b>{fieldText[k]![0]}</b>{fieldText[k]![1]}{fieldText[k]![2] ? ` — ${fieldText[k]![2]}` : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.card} ${s.card}`}>
        <div className={s.step}>STEP 3</div>
        <h2 className={ui.cardTitle}>{L('재질 · 단가', 'Material · price')}</h2>
        <div className={s.material_row}>
          <select className={`${ui.input} ${s.material_select}`} value={matId} onChange={e => setMatId(e.target.value)} aria-label={L('재질', 'Material')}>
            {materials.map(m => <option key={m.id} value={m.id}>{isKo ? m.ko : m.en} ({m.density} g/㎤)</option>)}
          </select>
          <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => setShowCustom(v => !v)}><Plus size={14} />{L('재질 추가', 'Add material')}</button>
        </div>
        {showCustom && (
          <div className={s.custom_form}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="mw-cname">{L('재질명', 'Name')}</label>
              <input id="mw-cname" className={ui.input} value={customName} onChange={e => setCustomName(e.target.value)} placeholder={L('예: 인바', 'e.g. Invar')} />
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="mw-cden">{L('밀도', 'Density')}</label>
              <div className={ui.inputGroup}>
                <input id="mw-cden" className={ui.input} inputMode="decimal" value={customDensity} onChange={e => setCustomDensity(decimalInput(e.target.value))} placeholder="8.05" />
                <span className={ui.unit}>g/㎤</span>
              </div>
            </div>
            <button type="button" className={`${ui.button} ${ui.primary}`} onClick={addCustom}>{L('저장', 'Save')}</button>
            <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => setShowCustom(false)}>{L('취소', 'Cancel')}</button>
          </div>
        )}
        <div className={s.fields}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="mw-pkg">{L('자재 단가 (선택)', 'Material price (optional)')}</label>
            <div className={ui.inputGroup}>
              <input id="mw-pkg" className={ui.input} inputMode="numeric" value={priceKg} onChange={e => setPriceKg(e.target.value.replace(/[^0-9]/g, ''))} placeholder="1200" />
              <span className={ui.unit}>{L('원/kg', '₩/kg')}</span>
            </div>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="mw-pm2">{L('도장 단가 (선택)', 'Paint price (optional)')}</label>
            <div className={ui.inputGroup}>
              <input id="mw-pm2" className={ui.input} inputMode="numeric" value={priceM2} onChange={e => setPriceM2(e.target.value.replace(/[^0-9]/g, ''))} placeholder="15000" />
              <span className={ui.unit}>{L('원/㎡', '₩/㎡')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.card} ${s.card}`} aria-live="polite">
        <div className={s.step}>STEP 4</div>
        <h2 className={ui.cardTitle}>{L('계산 결과', 'Result')}{complete && !errorCode ? ` — ${specLabel(shape, dims)}` : ''}</h2>
        {errorCode ? (
          <div className={`${ui.notice} ${ui.amber}`}>⚠️ {ERRORS[errorCode][isKo ? 0 : 1]}</div>
        ) : !result ? (
          <p className={s.hint}>{L('치수와 길이·수량을 넣으면 결과가 나옵니다. KS 규격에서 고르면 치수가 자동으로 채워집니다.', 'Enter dimensions, length and quantity, or pick a KS size.')}</p>
        ) : (
          <>
            <div className={s.big_grid}>
              <div className={`${ui.result} ${s.big}`}>
                <div><span className={ui.resultValue}>{kg(result.unitMass, def.sheet ? 2 : 3)}</span><span className={s.big_unit}>{def.sheet ? 'kg/㎡' : 'kg/m'}</span></div>
                <div className={s.big_label}>{def.sheet ? L('㎡당 중량', 'Weight per ㎡') : L('m당 중량 (단위중량)', 'Weight per metre')}</div>
              </div>
              <div className={`${ui.result} ${s.big}`}>
                <div><span className={ui.resultValue}>{kg(result.pieceKg)}</span><span className={s.big_unit}>kg</span></div>
                <div className={s.big_label}>{L('1개(본)당 중량', 'Per piece')}</div>
              </div>
              <div className={`${ui.result} ${s.big}`}>
                <div><span className={ui.resultValue}>{kg(result.orderKg)}</span><span className={s.big_unit}>kg</span></div>
                <div className={s.big_label}>{L(`발주 중량 (로스 ${lossPct}% 포함)`, `Order weight (+${lossPct}%)`)}</div>
              </div>
            </div>
            <div className={s.rows}>
              <div className={s.res_row}><span>{L('단면적', 'Section area')}</span><strong>{kg(result.areaMm2, 1)} ㎟ ({kg(result.areaMm2 / 100, 2)} ㎠)</strong></div>
              <div className={s.res_row}><span>{L(`순중량 (${qty}개)`, `Net weight (${qty} pcs)`)}</span><strong>{kg(result.netKg)} kg</strong></div>
              <div className={s.res_row}><span>{L('도장 면적', 'Paint area')}</span><strong>{kg(result.paintM2, 3)} ㎡</strong></div>
              {matCost > 0 && <div className={s.res_row}><span>{L('자재비 (발주 중량 기준)', 'Material cost')}</span><strong>{won(matCost)}</strong></div>}
              {paintCost > 0 && <div className={s.res_row}><span>{L('도장비', 'Paint cost')}</span><strong>{won(paintCost)}</strong></div>}
              {matCost + paintCost > 0 && <div className={`${s.res_row} ${s.res_total}`}><span>{L('합계', 'Total')}</span><strong>{won(matCost + paintCost)}</strong></div>}
            </div>
            <p className={s.hint}>{L(
              `${isKo ? material.ko : material.en} ${material.density} g/㎤ 기준.${['hbeam', 'channel', 'angle', 'tshape'].includes(shape) ? ' 형강은 필렛(r)을 넣어야 KS 표 단위중량과 맞습니다.' : ''}${shape === 'sqtube' ? ' 각관은 모서리 R(기본 2t)을 반영한 KS D 3568 방식입니다.' : ''}${shape === 'checkered' ? ' 무늬 질량 1.67 kg/㎡(강판 기준)을 더했습니다.' : ''}`,
              `Density ${material.density} g/cm³.${['hbeam', 'channel', 'angle', 'tshape'].includes(shape) ? ' Include the fillet radius to match KS table weights.' : ''}`,
            )}</p>
            <button type="button" className={`${ui.button} ${ui.primary}`} onClick={addToBasket}><ShoppingCart size={18} />{L('견적 바구니에 담기', 'Add to order list')}</button>
          </>
        )}
      </section>

      <section className={`${ui.card} ${s.card}`}>
        <div className={s.step}>STEP 5</div>
        <h2 className={ui.cardTitle}>{L('견적 바구니 · 발주 내역', 'Order list')}</h2>
        {basket.length === 0 ? (
          <p className={s.hint}>{L('담은 항목이 없습니다. 담은 내역은 이 브라우저에 저장됩니다.', 'Nothing added yet. The list is saved in this browser.')}</p>
        ) : (
          <>
            <div className={s.table_wrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>{L('규격', 'Spec')}</th><th>{L('재질', 'Material')}</th><th className={s.num}>{L('길이', 'Length')}</th>
                    <th className={s.num}>{L('수량', 'Qty')}</th><th className={s.num}>{L('발주 중량', 'Order kg')}</th><th className={s.num}>{L('금액', 'Cost')}</th><th />
                  </tr>
                </thead>
                <tbody>
                  {basket.map(b => (
                    <tr key={b.id}>
                      <td><span className={s.spec}>{b.spec}</span></td>
                      <td>{isKo ? b.material : b.materialEn ?? b.material}</td>
                      <td className={s.num}>{b.lengthM > 0 ? `${b.lengthM}m` : '-'}</td>
                      <td className={s.num}>{b.qty}</td>
                      <td className={s.num}><strong>{kg(b.orderKg, 1)}</strong>{b.lossPct > 0 ? ` (+${b.lossPct}%)` : ''}</td>
                      <td className={s.num}>{b.cost > 0 ? won(b.cost) : '-'}</td>
                      <td><button type="button" className={s.del_btn} onClick={() => saveBasket(basket.filter(x => x.id !== b.id))} aria-label={L('삭제', 'Delete')}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={s.totals}>
              <div className={s.total_box}><div className={s.total_label}>{L('총 발주 중량', 'Total order weight')}</div><div className={s.total_num}>{kg(totalKg, 1)} kg</div></div>
              <div className={s.total_box}><div className={s.total_label}>{L('총 금액', 'Total cost')}</div><div className={s.total_num}>{totalCost > 0 ? won(totalCost) : '-'}</div></div>
            </div>
            <div className={s.actions}>
              <button type="button" className={`${ui.button} ${ui.primary}`} onClick={copyOrder}><Copy size={16} />{L('발주 내역 복사', 'Copy order list')}</button>
              <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => saveBasket([])}><Trash2 size={14} />{L('모두 비우기', 'Clear all')}</button>
              {copyMsg && <span className={s.copy_msg}>{copyMsg}</span>}
            </div>
          </>
        )}
      </section>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/metal-weight-calc" />

      {seo}
    </div>
  );
}
