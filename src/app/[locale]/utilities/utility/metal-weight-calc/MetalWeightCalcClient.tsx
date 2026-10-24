'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Weight, Copy, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  SHAPES, PRESETS, SAMPLE_DIMS, shapeDef, calc, validate, isComplete, specLabel,
  type ShapeId, type DimKey, type Dims, type ErrorCode,
} from '@/lib/metalWeight';
import CrossSection from './CrossSection';
import s from './metal-weight-calc.module.css';

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

export default function MetalWeightCalcClient() {
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

      <header className={s.header}>
        <div className={s.icon_wrap}><Weight size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      <section className={s.card}>
        <div className={s.step}>STEP 1</div>
        <h2 className={s.card_title}>{L('형상 선택', 'Shape')}</h2>
        <div className={s.shape_grid}>
          {SHAPES.map(sh => (
            <button key={sh.id} type="button" aria-pressed={shape === sh.id}
              className={`${s.shape_btn} ${shape === sh.id ? s.shape_on : ''}`} onClick={() => selectShape(sh.id)}>
              <ShapeIcon id={sh.id} />
              {isKo ? SHAPE_NAMES[sh.id][0] : SHAPE_NAMES[sh.id][1]}
            </button>
          ))}
        </div>
      </section>

      <section className={s.card}>
        <div className={s.step}>STEP 2</div>
        <h2 className={s.card_title}>{L('치수 입력', 'Dimensions')} — {isKo ? SHAPE_NAMES[shape][0] : SHAPE_NAMES[shape][1]}</h2>
        <div className={s.layout}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {presetGroups && (
              <div className={s.preset_row}>
                <label className={s.field_label} htmlFor="mw-preset">{L('KS 규격에서 고르기', 'Pick a KS size')}</label>
                <select id="mw-preset" className={s.select} value={preset} onChange={e => applyPreset(e.target.value)}>
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
                  <div key={k} className={`${s.field} ${active === k ? s.field_active : ''}`}>
                    <label className={s.field_label} htmlFor={`mw-${k}`}>{title}{desc && <small>{desc}</small>}</label>
                    <div className={s.input_wrap}>
                      <input id={`mw-${k}`} className={s.input} inputMode="decimal" autoComplete="off"
                        placeholder={def.optional.includes(k) ? (shape === 'sqtube' ? '2t' : '0') : String(SAMPLE_DIMS[shape][k] ?? '')}
                        value={dimText[k] ?? ''}
                        onFocus={() => setActive(k)} onBlur={() => setActive(a => (a === k ? null : a))}
                        onChange={e => { setDimText(prev => ({ ...prev, [k]: decimalInput(e.target.value) })); setPreset(''); }} />
                      <span className={s.unit}>mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={s.row3}>
              {!def.sheet && (
                <div className={s.field}>
                  <label className={s.field_label} htmlFor="mw-len">{L('길이', 'Length')}</label>
                  <div className={s.input_wrap}>
                    <input id="mw-len" className={s.input} inputMode="decimal" value={lengthText} onChange={e => setLengthText(decimalInput(e.target.value))} />
                    <span className={s.unit}>m</span>
                  </div>
                </div>
              )}
              <div className={s.field}>
                <label className={s.field_label} htmlFor="mw-qty">{L('수량', 'Quantity')}</label>
                <div className={s.input_wrap}>
                  <input id="mw-qty" className={s.input} inputMode="numeric" value={qtyText} onChange={e => setQtyText(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
                  <span className={s.unit}>{L('개', 'pcs')}</span>
                </div>
              </div>
              <div className={s.field}>
                <label className={s.field_label} htmlFor="mw-loss">{L('로스(할증)', 'Waste allowance')}</label>
                <div className={s.input_wrap}>
                  <input id="mw-loss" className={s.input} inputMode="decimal" value={lossText} onChange={e => setLossText(decimalInput(e.target.value))} />
                  <span className={s.unit}>%</span>
                </div>
              </div>
            </div>
            {def.sheet && (
              <div className={s.field}>
                <span className={s.field_label}>{L('도장 면', 'Painted faces')}</span>
                <div className={s.chips}>
                  {([2, 1] as const).map(f => (
                    <button key={f} type="button" className={`${s.chip} ${plateFaces === f ? s.chip_on : ''}`} onClick={() => setPlateFaces(f)} aria-pressed={plateFaces === f}>
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

      <section className={s.card}>
        <div className={s.step}>STEP 3</div>
        <h2 className={s.card_title}>{L('재질 · 단가', 'Material · price')}</h2>
        <div className={s.material_row}>
          <select className={s.select} value={matId} onChange={e => setMatId(e.target.value)} aria-label={L('재질', 'Material')}>
            {materials.map(m => <option key={m.id} value={m.id}>{isKo ? m.ko : m.en} ({m.density} g/㎤)</option>)}
          </select>
          <button type="button" className={s.ghost_btn} onClick={() => setShowCustom(v => !v)}><Plus size={14} />{L('재질 추가', 'Add material')}</button>
        </div>
        {showCustom && (
          <div className={s.custom_form}>
            <div className={s.field}>
              <label className={s.field_label} htmlFor="mw-cname">{L('재질명', 'Name')}</label>
              <input id="mw-cname" className={s.input} style={{ paddingRight: '0.8rem' }} value={customName} onChange={e => setCustomName(e.target.value)} placeholder={L('예: 인바', 'e.g. Invar')} />
            </div>
            <div className={s.field}>
              <label className={s.field_label} htmlFor="mw-cden">{L('밀도', 'Density')}</label>
              <div className={s.input_wrap}>
                <input id="mw-cden" className={s.input} inputMode="decimal" value={customDensity} onChange={e => setCustomDensity(decimalInput(e.target.value))} placeholder="8.05" />
                <span className={s.unit}>g/㎤</span>
              </div>
            </div>
            <button type="button" className={s.primary_btn} onClick={addCustom}>{L('저장', 'Save')}</button>
            <button type="button" className={s.ghost_btn} onClick={() => setShowCustom(false)}>{L('취소', 'Cancel')}</button>
          </div>
        )}
        <div className={s.fields}>
          <div className={s.field}>
            <label className={s.field_label} htmlFor="mw-pkg">{L('자재 단가 (선택)', 'Material price (optional)')}</label>
            <div className={s.input_wrap}>
              <input id="mw-pkg" className={s.input} inputMode="numeric" value={priceKg} onChange={e => setPriceKg(e.target.value.replace(/[^0-9]/g, ''))} placeholder="1200" />
              <span className={s.unit}>{L('원/kg', '₩/kg')}</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.field_label} htmlFor="mw-pm2">{L('도장 단가 (선택)', 'Paint price (optional)')}</label>
            <div className={s.input_wrap}>
              <input id="mw-pm2" className={s.input} inputMode="numeric" value={priceM2} onChange={e => setPriceM2(e.target.value.replace(/[^0-9]/g, ''))} placeholder="15000" />
              <span className={s.unit}>{L('원/㎡', '₩/㎡')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={s.card} aria-live="polite">
        <div className={s.step}>STEP 4</div>
        <h2 className={s.card_title}>{L('계산 결과', 'Result')}{complete && !errorCode ? ` — ${specLabel(shape, dims)}` : ''}</h2>
        {errorCode ? (
          <div className={s.warn}>⚠️ {ERRORS[errorCode][isKo ? 0 : 1]}</div>
        ) : !result ? (
          <p className={s.hint}>{L('치수와 길이·수량을 넣으면 결과가 나옵니다. KS 규격에서 고르면 치수가 자동으로 채워집니다.', 'Enter dimensions, length and quantity, or pick a KS size.')}</p>
        ) : (
          <>
            <div className={s.big_grid}>
              <div className={s.big}>
                <div><span className={s.big_num}>{kg(result.unitMass, def.sheet ? 2 : 3)}</span><span className={s.big_unit}>{def.sheet ? 'kg/㎡' : 'kg/m'}</span></div>
                <div className={s.big_label}>{def.sheet ? L('㎡당 중량', 'Weight per ㎡') : L('m당 중량 (단위중량)', 'Weight per metre')}</div>
              </div>
              <div className={s.big}>
                <div><span className={s.big_num}>{kg(result.pieceKg)}</span><span className={s.big_unit}>kg</span></div>
                <div className={s.big_label}>{L('1개(본)당 중량', 'Per piece')}</div>
              </div>
              <div className={s.big}>
                <div><span className={s.big_num}>{kg(result.orderKg)}</span><span className={s.big_unit}>kg</span></div>
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
            <button type="button" className={s.primary_btn} onClick={addToBasket}><ShoppingCart size={18} />{L('견적 바구니에 담기', 'Add to order list')}</button>
          </>
        )}
      </section>

      <section className={s.card}>
        <div className={s.step}>STEP 5</div>
        <h2 className={s.card_title}>{L('견적 바구니 · 발주 내역', 'Order list')}</h2>
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
              <button type="button" className={s.primary_btn} onClick={copyOrder}><Copy size={16} />{L('발주 내역 복사', 'Copy order list')}</button>
              <button type="button" className={s.ghost_btn} onClick={() => saveBasket([])}><Trash2 size={14} />{L('모두 비우기', 'Clear all')}</button>
              {copyMsg && <span className={s.copy_msg}>{copyMsg}</span>}
            </div>
          </>
        )}
      </section>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/metal-weight-calc" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '금속 중량 계산기: H빔·찬넬·앵글·파이프 kg/m와 도장 면적',
          description: '금속 자재의 중량은 단면적(㎟) × 길이(m) × 밀도(g/㎤) ÷ 1000으로 구합니다. 이 계산기는 환봉·파이프·사각봉·각파이프·육각봉·평철·철판·앵글·찬넬·H빔·T형강·무늬강판 12가지 형상의 단면적을 계산해 m당 중량(단위중량), 1개당 중량, 로스를 더한 발주 중량, 도장 면적, 자재비·도장비를 한 번에 보여 줍니다. H형강·ㄷ형강·ㄱ형강은 KS D 3502 규격표처럼 웹과 플랜지가 만나는 안쪽의 둥근 필렛(r)까지 넣어 계산하므로, 규격에서 고르면 표의 단위중량과 맞습니다. 예를 들어 H-200×100×5.5×8(r=11)은 단면적 27.16㎠, 21.32 kg/m이고, 필렛을 빼고 계산하면 20.5 kg/m로 4%가량 가볍게 나옵니다. 각파이프는 KS D 3568의 모서리 반경(외측 2t)을 반영해 □100×100×3.2가 9.52 kg/m, 무늬강판은 같은 두께 평판에 무늬 1.67 kg/㎡를 더해 3.2t가 26.79 kg/㎡입니다. 배관용 SPP·SCH40 강관은 호칭경(15A~200A)으로 고를 수 있습니다. 단면도에서는 지금 입력하는 칸이 어느 부위인지 색으로 표시되어, H빔·찬넬의 t1(웹, 세로판)과 t2(플랜지, 가로판)를 헷갈리지 않고 넣을 수 있습니다.',
          useCases: [
            { icon: '🏗️', title: '철골 자재 발주 중량', desc: 'H-300×150×6.5×9 6m 20본처럼 규격을 고르고 길이·수량을 넣으면 단위중량 36.72 kg/m 기준 순중량과 로스 포함 발주 중량이 나오고, 여러 규격을 바구니에 담아 총 톤수를 확인할 수 있습니다.' },
            { icon: '🎨', title: '도장 물량 산출', desc: '형강은 겉으로 드러나는 둘레 전체, 파이프·각파이프는 바깥면, 철판은 양면 또는 한 면을 골라 도장 면적(㎡)을 계산하고, ㎡당 단가를 넣으면 도장비까지 함께 산출합니다.' },
            { icon: '🔧', title: '배관 자재 무게', desc: 'SPP 50A(Ø60.5×3.8)는 5.31 kg/m, SCH40 100A(Ø114.3×6.0)처럼 호칭경으로 고르면 외경·두께가 자동으로 들어가 운반·양중 계획이나 지지대 하중 검토에 쓸 무게를 바로 확인합니다.' },
            { icon: '⚙️', title: '가공품·특수 재질', desc: '스테인리스·알루미늄·황동·티타늄 등 19가지 재질 밀도를 고르거나, 인바 같은 특수 합금 밀도를 직접 저장해 가공 소재의 무게와 kg당 자재비를 계산합니다.' },
          ],
          steps: [
            { step: '형상 고르기', desc: '환봉, 파이프, 각파이프, 앵글, 찬넬, H빔, T형강, 철판 등 12가지 중 계산할 형상을 누릅니다. 오른쪽 단면도에 예시 치수와 각 기호의 위치가 바로 표시됩니다.' },
            { step: '치수 넣기', desc: 'KS 규격 목록에서 고르면 필렛까지 자동으로 채워지고, 직접 넣을 때는 입력 중인 칸의 부위(예: t1 웹, t2 플랜지)가 단면도에서 색으로 강조됩니다. 길이(m)·수량·로스(%)도 넣습니다.' },
            { step: '재질·단가 선택', desc: '재질을 고르고 필요하면 kg당 자재 단가와 ㎡당 도장 단가를 넣습니다. 목록에 없는 재질은 이름과 밀도를 저장해 다음에도 쓸 수 있습니다.' },
            { step: '결과 확인·발주 내역', desc: 'm당 중량, 1개당 중량, 발주 중량, 도장 면적, 금액을 확인하고 견적 바구니에 담습니다. 담은 내역은 브라우저에 저장되며 복사 버튼으로 메신저에 붙여 넣을 수 있습니다.' },
          ],
          faqs: [
            { q: 'H빔·찬넬에서 t1과 t2는 각각 어디인가요?', a: 't1은 웹, 곧 H빔 가운데에 세로로 선 판(찬넬은 세로 등판)의 두께이고, t2는 플랜지, 곧 위·아래 가로판(찬넬은 날개)의 두께입니다. 규격 표기 H-200×100×5.5×8은 높이 H 200, 폭 B 100, 웹 t1 5.5, 플랜지 t2 8mm라는 뜻입니다. 두 값을 바꿔 넣으면 무게가 크게 달라지므로, 입력할 때 단면도에서 강조되는 부위를 확인하세요.' },
            { q: '필렛(r)은 왜 넣어야 하나요?', a: '압연 형강은 웹과 플랜지가 만나는 안쪽이 둥글게 살이 붙어 있어, 단순히 판 세 장의 넓이만 더하면 규격표보다 1~4% 가볍게 나옵니다. KS 규격에서 고르면 r이 자동으로 들어가며, H-100×100×6×8(r=10)은 단면적 21.90㎠로 규격표와 같아집니다. 판을 용접해 만든 조립 형강이면 r을 비워 두면 됩니다.' },
            { q: '각파이프는 모서리를 어떻게 계산하나요?', a: 'KS D 3568 일반구조용 각형강관의 단위질량 식 0.0157 × t × (A + B − 3.287t)는 모서리 바깥 반경을 두께의 2배로 본 값입니다. 이 계산기도 모서리 R을 비우면 2t로 계산해 □100×100×3.2가 9.52 kg/m로 나오고, 모서리를 직각으로 보면 9.73 kg/m로 약 2% 무겁게 나옵니다.' },
            { q: '도장 면적은 어느 면을 기준으로 하나요?', a: '형강과 봉재는 단면 둘레 전체(H빔은 4B + 2H − 2t1), 파이프와 각파이프는 바깥면만 계산하고 안쪽은 빼며, 철판·무늬강판은 양면 또는 한 면을 고를 수 있고 절단면은 넣지 않습니다. 실제 도장 방식에 따라 차이가 있으니 견적용 참고값으로 쓰세요.' },
          ],
        }}
        en={{
          title: 'Metal weight calculator: kg/m and paint area for steel sections',
          description: 'Metal weight is section area (mm²) × length (m) × density (g/cm³) ÷ 1000. This calculator works out the section area of 12 shapes — round bar, pipe, square bar, square tube, hex bar, flat bar, plate, angle, channel, H-beam, T-section and checkered plate — and shows weight per metre, weight per piece, order weight with a waste allowance, paint area and cost. H-beams, channels and angles include the root fillet radius exactly as in the KS D 3502 / JIS G 3192 tables, so picking a standard size reproduces the published weight: H-200×100×5.5×8 (r = 11) has 27.16 cm² and weighs 21.32 kg/m, whereas ignoring the fillet gives about 20.5 kg/m. Square tubes follow the KS D 3568 corner radius (2t outside), giving 9.52 kg/m for □100×100×3.2, and checkered plate adds 1.67 kg/m² of raised pattern for steel. SPP and SCH40 pipes can be picked by nominal size from 15A to 200A. The cross-section highlights the part you are typing — for example the web (t1) or the flange (t2) — so the two thicknesses are never swapped.',
          useCases: [
            { icon: '🏗️', title: 'Steel Order Weights', desc: 'Pick H-300×150×6.5×9, enter 6 m × 20 pieces and get net and order weight from 36.72 kg/m, then add more sizes to the list for a total tonnage.' },
            { icon: '🎨', title: 'Paint Quantities', desc: 'Exposed perimeter for sections, outside only for tubes, and one or both faces for plate; add a price per m² to get the painting cost.' },
            { icon: '🔧', title: 'Pipe Weights', desc: 'Choose SPP 50A (Ø60.5×3.8, 5.31 kg/m) or SCH40 sizes by nominal bore for lifting plans and support loads.' },
            { icon: '⚙️', title: 'Other Materials', desc: 'Switch between 19 densities such as stainless, aluminium, brass and titanium, or save your own alloy.' },
          ],
          steps: [
            { step: 'Choose a Shape', desc: 'Tap one of 12 shapes; the cross-section shows an example size and where each symbol sits.' },
            { step: 'Enter Dimensions', desc: 'Pick a KS size to fill everything including fillets, or type values while the diagram highlights the part you are editing.' },
            { step: 'Material and Price', desc: 'Select a material and optionally enter prices per kg and per m² of paint.' },
            { step: 'Review and Save', desc: 'Check weight per metre, per piece, order weight, paint area and cost, then add the item to the order list and copy it.' },
          ],
          faqs: [
            { q: 'Which part is t1 and which is t2?', a: 't1 is the web, the vertical centre plate of an H-beam or the back of a channel; t2 is the flange, the top and bottom plates. H-200×100×5.5×8 means depth 200, width 100, web 5.5 and flange 8 mm. Swapping them changes the weight a lot, so watch the highlighted part in the diagram.' },
            { q: 'Why include the fillet radius?', a: 'Rolled sections have extra material where the web meets the flange. Without it the result is 1–4% lighter than the standard table; with it, H-100×100×6×8 (r = 10) gives 21.90 cm² exactly. Leave r blank for welded built-up sections.' },
            { q: 'How are square tube corners handled?', a: 'The KS D 3568 formula 0.0157 × t × (A + B − 3.287t) assumes an outside corner radius of 2t. Leaving R blank uses that, so □100×100×3.2 weighs 9.52 kg/m instead of 9.73 kg/m with sharp corners.' },
            { q: 'Which faces count as paint area?', a: 'The full perimeter for bars and sections, the outside only for pipes and tubes, and one or both faces for plates, excluding cut edges. Treat it as an estimate.' },
          ],
        }}
      />
    </div>
  );
}
