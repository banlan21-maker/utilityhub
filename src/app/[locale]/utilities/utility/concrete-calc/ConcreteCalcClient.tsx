'use client';

// 콘크리트·레미콘 물량 계산기 — 입력·계산 위젯만 (제목·설명·FAQ는 page.tsx 서버 렌더)
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertTriangle, Check, Copy, Info, Pencil, Plus, Printer, RotateCcw, Trash2, Truck, X } from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  DENSITY_T, FT3_M3, HAS_COUNT, LEN_TO_M, MIXES, SHAPES, UNITS, VOL_TO_M3, YD3_M3,
  activeFields, defaultUnit, dimWarnings, emptyPart, mix, num, partVolume, postTooBig, premixBags, round2, trucks,
  type DimKey, type LenUnit, type MixId, type Part, type PostShape, type ShapeKind, type StairType, type UnitSystem, type VolUnit,
} from '@/lib/concreteCalc';
import ConcreteDiagram, { type DiagramLabels } from './ConcreteDiagram';
import s from './concrete-calc.module.css';

const STORE_KEY = 'utilhub-concrete-calc';
const DEFAULT_CAP: Record<UnitSystem, string> = { metric: '6', imperial: '10' };
const CAP_CHIPS: Record<UnitSystem, number[]> = { metric: [3, 6, 7], imperial: [8, 9, 10] };

const T = {
  ko: {
    system: '단위', metric: '미터법 (m·cm·mm)', imperial: '야드파운드법 (ft·in)',
    shape: '형태 선택',
    shapes: { slab: '슬래브·바닥', wall: '벽·줄기초', box: '사각 기둥·독립기초', cyl: '원형 기둥', hole: '원형 구멍 (기둥 기초)', stairs: '계단', manual: '직접 입력' } as Record<ShapeKind, string>,
    shortNames: { slab: '바닥', wall: '줄기초', box: '기초', cyl: '원형 기둥', hole: '기둥 구멍', stairs: '계단', manual: '추가 물량' } as Record<ShapeKind, string>,
    name: '부위 이름 (선택)',
    label: (kind: ShapeKind, key: DimKey, post: PostShape): string => ({
      length: kind === 'wall' ? '길이' : '가로',
      width: kind === 'stairs' ? '계단 폭' : '세로',
      thick: kind === 'wall' ? '폭(두께)' : '두께',
      height: '높이',
      dia: kind === 'hole' ? '구멍 지름' : '지름',
      depth: '깊이',
      post: post === 'round' ? '기둥 지름' : '기둥 한 변',
      riser: '단 높이',
      tread: '단 너비',
      waist: '바닥판 두께',
    })[key],
    count: (kind: ShapeKind) => (kind === 'stairs' ? '단 수' : '개수'),
    countUnit: (kind: ShapeKind) => (kind === 'stairs' ? '단' : '개'),
    postShape: '기둥', postNone: '기둥 없음', postSquare: '사각 기둥', postRound: '원형 기둥',
    postHint: '구멍에 박는 기둥이 차지하는 부피를 뺍니다.',
    stairType: '계단 형태', stairWaist: '경사 슬래브형', stairSolid: '채움형 (속이 꽉 참)',
    stairHint: (t: StairType) => t === 'waist'
      ? '계단 아래가 비어 있는 일반 철근콘크리트 계단: 단 부분 + 경사 바닥판'
      : '흙 위에 바로 붓는 외부 계단처럼 아래까지 콘크리트로 채운 계단',
    manualLabel: '알고 있는 물량',
    warnBig: '값이 너무 큽니다 — 단위를 확인하세요',
    warnSmall: '값이 너무 작습니다 — 단위를 확인하세요',
    postBig: '기둥이 구멍보다 커서 들어가지 않습니다.',
    thisPart: '이 부위', needInput: '치수를 모두 입력하면 물량이 계산됩니다',
    add: '목록에 추가', update: '수정 완료', cancel: '취소',
    list: '부위 목록', empty: '아직 추가한 부위가 없습니다. 위에서 치수를 입력하고 "목록에 추가"를 누르세요.',
    drafting: '입력 중 · 합계에 포함', editing: '수정 중',
    edit: '수정', del: '삭제', netTotal: '합계 (순 물량)',
    order: (w: number) => `주문 물량 (할증 ${w}% 포함)`,
    rube: '루베',
    net: '순 물량', waste: (w: number) => `할증 ${w}%`,
    trucks: '레미콘 차량', truckLine: (cap: string, n: number) => `${cap} 차량 ${n}대`,
    smallLoad: (one: boolean) => `${one ? '주문 물량이 차량 1대 용량의 절반보다 적습니다.' : '마지막 차 적재량이 적습니다.'} 소량 배차는 업체에 따라 추가 요금이 붙을 수 있습니다.`,
    stairTotal: (rise: string, run: string) => `계단 전체 높이 ${rise} · 전체 길이 ${run}`,
    warnItem: '단위 확인 필요',
    weight: '콘크리트 중량', weightHint: '2.3~2.4 t/㎥ 기준, 운반·하중 검토 참고용',
    cost: '예상 비용',
    zero: '치수를 입력하면 바로 계산됩니다',
    settings: '할증·차량 설정',
    wasteLabel: '할증률 (여유분)',
    wasteHint: '타설 손실, 거푸집 변형, 바닥 요철을 고려한 여유분입니다. 현장 조건에 맞게 조정하세요.',
    capLabel: '차량 1대 용량',
    mixTitle: '직접 비빔 재료', mixSub: '소량을 직접 비빌 때',
    mixTab: '시멘트·모래·자갈', premixTab: '레디믹스 포대',
    ratio: '배합비 (부피비 시멘트 : 모래 : 자갈)',
    ratioNames: { '124': '일반 구조용 (기본)', '136': '버림·비구조용', '1153': '강도가 더 필요할 때' } as Record<MixId, string>,
    basisOf: (v: string) => `주문 물량 ${v} 기준`,
    cement: '시멘트', sand: '모래', gravel: '자갈', water: '물 (개략)',
    bags40: (n: number, kg: string) => `${n}포대 (40kg, ${kg})`,
    bags94: (n: number, lb: string) => `${n}포대 (94lb, ${lb})`,
    mixNote: '개략치입니다. 실제 배합은 골재 상태와 요구 강도에 따라 달라집니다. 마른 재료 부피 = 콘크리트 양 × 1.54',
    premixNote: '제품마다 수율이 다를 수 있으니 포장 표기를 확인하세요. (80lb ≈ 0.60ft³, 60lb ≈ 0.45ft³, 40lb ≈ 0.30ft³)',
    bagUnit: '포대',
    costTitle: '예상 비용 (선택)', price: (u: string) => `${u}당 단가`, priceHint: '지역·시기마다 달라 사이트에 단가를 넣어 두지 않았습니다. 견적받은 단가를 입력하세요.',
    costTotal: (v: string) => `주문 물량 ${v} × 단가`,
    copy: '주문 요약 복사', copied: '복사됨', print: '인쇄', reset: '초기화',
    resetConfirm: '목록과 입력값을 모두 지울까요?',
    disclaimer: '계산 결과는 참고용입니다. 실제 주문량은 현장 조건과 시공 담당자의 판단에 따라 결정하세요.',
    summaryTitle: '콘크리트 주문 요약',
    summaryTotal: (net: string, w: number, order: string) => w > 0 ? `합계 ${net} → 할증 ${w}% 포함 ${order}` : `합계 ${order}`,
    summaryTrucks: (cap: string, n: number, loads: string) => `레미콘 ${cap} 차량 ${n}대 (${loads})`,
    mobileBar: '주문 물량',
    of: (n: number) => `${n}개`,
  },
  en: {
    system: 'Units', metric: 'Metric (m·cm·mm)', imperial: 'US (ft·in)',
    shape: 'Choose a shape',
    shapes: { slab: 'Slab / floor', wall: 'Wall / strip footing', box: 'Square column / pad footing', cyl: 'Round column', hole: 'Post hole', stairs: 'Stairs', manual: 'Known volume' } as Record<ShapeKind, string>,
    shortNames: { slab: 'Slab', wall: 'Footing', box: 'Pad', cyl: 'Column', hole: 'Post holes', stairs: 'Stairs', manual: 'Extra' } as Record<ShapeKind, string>,
    name: 'Name (optional)',
    label: (kind: ShapeKind, key: DimKey, post: PostShape): string => ({
      length: 'Length',
      width: kind === 'stairs' ? 'Stair width' : 'Width',
      thick: 'Thickness',
      height: 'Height',
      dia: kind === 'hole' ? 'Hole diameter' : 'Diameter',
      depth: 'Depth',
      post: post === 'round' ? 'Post diameter' : 'Post size',
      riser: 'Riser height',
      tread: 'Tread depth',
      waist: 'Waist slab thickness',
    })[key],
    count: (kind: ShapeKind) => (kind === 'stairs' ? 'Number of steps' : 'Quantity'),
    countUnit: (kind: ShapeKind) => (kind === 'stairs' ? 'steps' : 'pcs'),
    postShape: 'Post', postNone: 'No post', postSquare: 'Square post', postRound: 'Round post',
    postHint: 'The volume taken up by the post is subtracted.',
    stairType: 'Stair type', stairWaist: 'Sloped waist slab', stairSolid: 'Solid fill',
    stairHint: (t: StairType) => t === 'waist'
      ? 'Typical reinforced stairs with open space underneath: steps plus a sloped waist slab'
      : 'Steps poured solid down to the ground, like outdoor steps on grade',
    manualLabel: 'Volume you already know',
    warnBig: 'This looks too large — check the unit',
    warnSmall: 'This looks too small — check the unit',
    postBig: 'The post is too big for the hole.',
    thisPart: 'This part', needInput: 'Fill in every dimension to see the volume',
    add: 'Add to list', update: 'Save changes', cancel: 'Cancel',
    list: 'Parts list', empty: 'Nothing added yet. Enter dimensions above and press “Add to list”.',
    drafting: 'In progress · included', editing: 'Editing',
    edit: 'Edit', del: 'Delete', netTotal: 'Total (net)',
    order: (w: number) => `Order volume (incl. ${w}% waste)`,
    rube: '',
    net: 'Net volume', waste: (w: number) => `Waste ${w}%`,
    trucks: 'Ready-mix trucks', truckLine: (cap: string, n: number) => `${n} × ${cap} truck${n === 1 ? '' : 's'}`,
    smallLoad: (one: boolean) => `${one ? 'This is less than half a truck.' : 'The last load is small.'} Some suppliers charge a short-load fee.`,
    stairTotal: (rise: string, run: string) => `Total rise ${rise} · total run ${run}`,
    warnItem: 'Check the units',
    weight: 'Concrete weight', weightHint: 'At 2.3–2.4 t/m³ (about 145–150 lb/ft³), for hauling and load checks',
    cost: 'Estimated cost',
    zero: 'Enter dimensions to see results',
    settings: 'Waste & truck size',
    wasteLabel: 'Waste allowance',
    wasteHint: 'Covers spillage, form bulging and uneven subgrade. Adjust for your site.',
    capLabel: 'Truck capacity',
    mixTitle: 'Mixing it yourself', mixSub: 'For small pours',
    mixTab: 'Cement · sand · gravel', premixTab: 'Premix bags',
    ratio: 'Mix ratio (cement : sand : gravel by volume)',
    ratioNames: { '124': 'General structural (default)', '136': 'Blinding / non-structural', '1153': 'Higher strength' } as Record<MixId, string>,
    basisOf: (v: string) => `Based on order volume ${v}`,
    cement: 'Cement', sand: 'Sand', gravel: 'Gravel', water: 'Water (approx.)',
    bags40: (n: number, kg: string) => `${n} bags (40 kg, ${kg})`,
    bags94: (n: number, lb: string) => `${n} bags (94 lb, ${lb})`,
    mixNote: 'Approximate. Real mixes depend on aggregate moisture and the strength you need. Dry volume = concrete volume × 1.54.',
    premixNote: 'Yields vary by brand — check the bag. (80 lb ≈ 0.60 ft³, 60 lb ≈ 0.45 ft³, 40 lb ≈ 0.30 ft³)',
    bagUnit: 'bags',
    costTitle: 'Estimated cost (optional)', price: (u: string) => `Price per ${u}`, priceHint: 'Prices vary by region and season, so none are preset. Enter your quote.',
    costTotal: (v: string) => `${v} × price`,
    copy: 'Copy order summary', copied: 'Copied', print: 'Print', reset: 'Reset',
    resetConfirm: 'Clear the list and all inputs?',
    disclaimer: 'Estimates only. Confirm final quantities with your contractor or supplier.',
    summaryTitle: 'Concrete order summary',
    summaryTotal: (net: string, w: number, order: string) => w > 0 ? `Total ${net} → with ${w}% waste ${order}` : `Total ${order}`,
    summaryTrucks: (cap: string, n: number, loads: string) => `${n} × ${cap} truck${n === 1 ? '' : 's'} (${loads})`,
    mobileBar: 'Order volume',
    of: (n: number) => `${n}`,
  },
};

/** 숫자 입력 정리: 숫자와 소수점 하나, 소수 3자리까지. 쉼표는 천 단위 구분으로 보고 지운다 */
const decimal = (v: string) => {
  const [i, ...d] = v.replace(/[^0-9.]/g, '').split('.');
  return (d.length ? `${i}.${d.join('').slice(0, 3)}` : i).slice(0, 10);
};
const trim3 = (n: number) => String(Math.round(n * 1000) / 1000);
let seq = 0;
const newId = () => `p${Date.now().toString(36)}${(seq++).toString(36)}`;

interface Row { part: Part; vol: number | null; state: 'saved' | 'editing' | 'draft' }

const isKind = (k: unknown): k is ShapeKind => typeof k === 'string' && (SHAPES as string[]).includes(k);
const LEN_UNITS: LenUnit[] = ['m', 'cm', 'mm', 'ft', 'in'];
const VOL_UNITS: VolUnit[] = ['m3', 'yd3', 'ft3'];

/** 저장된 값 → 안전한 Part (모양이 틀린 값은 버린다) */
function normalize(raw: unknown, sys: UnitSystem): Part | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!isKind(r.kind)) return null;
  const base = emptyPart(r.kind, sys, typeof r.id === 'string' ? r.id : newId());
  const dims = (r.dims ?? {}) as Record<string, { v?: unknown; u?: unknown }>;
  for (const k of Object.keys(base.dims) as DimKey[]) {
    const d = dims[k];
    if (d && typeof d.v === 'string' && LEN_UNITS.includes(d.u as LenUnit)) base.dims[k] = { v: decimal(d.v), u: d.u as LenUnit };
  }
  const m = r.manual as { v?: unknown; u?: unknown } | undefined;
  return {
    ...base,
    name: typeof r.name === 'string' ? r.name.slice(0, 40) : '',
    count: typeof r.count === 'string' ? decimal(r.count) : base.count,
    post: r.post === 'none' || r.post === 'square' || r.post === 'round' ? r.post : base.post,
    stair: r.stair === 'waist' || r.stair === 'solid' ? r.stair : base.stair,
    manual: m && typeof m.v === 'string' && VOL_UNITS.includes(m.u as VolUnit) ? { v: decimal(m.v), u: m.u as VolUnit } : base.manual,
  };
}

/** 단위 체계를 바꿀 때 입력 중인 값을 새 기본 단위로 환산 */
function convertDraft(p: Part, to: UnitSystem): Part {
  const dims: Part['dims'] = {};
  for (const [k, d] of Object.entries(p.dims) as [DimKey, { v: string; u: LenUnit }][]) {
    const u = defaultUnit(p.kind, k, to);
    const n = num(d.v);
    dims[k] = { u, v: Number.isFinite(n) ? trim3((n * LEN_TO_M[d.u]) / LEN_TO_M[u]) : d.v };
  }
  const mu: VolUnit = to === 'imperial' ? 'yd3' : 'm3';
  const mv = num(p.manual.v);
  return { ...p, dims, manual: { u: mu, v: Number.isFinite(mv) ? trim3((mv * VOL_TO_M3[p.manual.u]) / VOL_TO_M3[mu]) : p.manual.v } };
}

export default function ConcreteCalcClient() {
  const isKo = useLocale() === 'ko';
  const L = isKo ? T.ko : T.en;
  const nf = (n: number, d = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  const [sys, setSys] = useState<UnitSystem>(isKo ? 'metric' : 'imperial');
  const [items, setItems] = useState<Part[]>([]);
  const [draft, setDraft] = useState<Part>(() => emptyPart('slab', isKo ? 'metric' : 'imperial'));
  const [editId, setEditId] = useState<string | null>(null);
  const [waste, setWaste] = useState(5);
  const [cap, setCap] = useState<Record<UnitSystem, string>>(DEFAULT_CAP);
  const [mixId, setMixId] = useState<MixId>('124');
  const [mixTab, setMixTab] = useState<'mix' | 'premix'>(isKo ? 'mix' : 'premix');
  const [price, setPrice] = useState('');
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);
  const inputsRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const [inputsVisible, setInputsVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(true);

  // 휴대폰: 입력칸을 보는 동안 결과가 화면 밖이면 아래에 주문 물량 막대를 띄운다
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === inputsRef.current) setInputsVisible(e.isIntersecting);
        if (e.target === resultRef.current) setResultVisible(e.isIntersecting);
      }
    }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
    if (inputsRef.current) io.observe(inputsRef.current);
    if (resultRef.current) io.observe(resultRef.current);
    return () => io.disconnect();
  }, []);

  // 마운트 후 저장된 목록·설정 복원 (저장소를 못 써도 계산은 그대로)
  useEffect(() => {
    let saved: Record<string, unknown> | null = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { /* 저장소 없음 */ }
    if (saved && typeof saved === 'object') {
      const sv = saved;
      void Promise.resolve().then(() => {
        const nextSys: UnitSystem = sv.sys === 'metric' || sv.sys === 'imperial' ? sv.sys : sys;
        setSys(nextSys);
        if (Array.isArray(sv.items)) setItems(sv.items.map((x) => normalize(x, nextSys)).filter((x): x is Part => !!x).slice(0, 100));
        const d = normalize(sv.draft, nextSys);
        setDraft(d ? { ...d, id: '' } : emptyPart('slab', nextSys));
        if (typeof sv.waste === 'number') setWaste(Math.min(15, Math.max(0, Math.round(sv.waste))));
        if (sv.cap && typeof sv.cap === 'object') {
          const c = sv.cap as Record<string, unknown>;
          setCap({
            metric: typeof c.metric === 'string' ? decimal(c.metric) : DEFAULT_CAP.metric,
            imperial: typeof c.imperial === 'string' ? decimal(c.imperial) : DEFAULT_CAP.imperial,
          });
        }
        if (sv.mixId === '124' || sv.mixId === '136' || sv.mixId === '1153') setMixId(sv.mixId);
        if (sv.mixTab === 'mix' || sv.mixTab === 'premix') setMixTab(sv.mixTab);
        if (typeof sv.price === 'string') setPrice(decimal(sv.price));
        loaded.current = true;
      });
    } else {
      loaded.current = true;
    }
    // 복원은 처음 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ sys, items, draft: editId ? null : draft, waste, cap, mixId, mixTab, price }));
    } catch { /* 저장 실패해도 계산은 그대로 */ }
  }, [sys, items, draft, editId, waste, cap, mixId, mixTab, price]);

  /* ── 계산 ── */
  const draftVol = useMemo(() => partVolume(draft), [draft]);
  const warns = useMemo(() => dimWarnings(draft), [draft]);
  const postBig = postTooBig(draft);

  // 합계에 들어가는 부위: 목록 + (수정 중이면 그 자리에, 아니면 맨 끝에) 입력 중인 부위
  const rows = useMemo(() => {
    const list: Row[] = items.map((p) => (p.id === editId ? { part: draft, vol: draftVol, state: 'editing' } : { part: p, vol: partVolume(p), state: 'saved' }));
    if (!editId && draftVol) list.push({ part: draft, vol: draftVol, state: 'draft' });
    return list;
  }, [items, editId, draft, draftVol]);

  const net = rows.reduce((a, r) => a + (r.vol ?? 0), 0);
  const order = net * (1 + waste / 100);
  const capNum = num(cap[sys]);
  // 차량 대수·비용은 화면에 보이는 주문 물량(소수 둘째 자리)으로 계산해 손으로 검산한 값과 맞춘다
  const orderQty = round2(sys === 'imperial' ? order / YD3_M3 : order);
  const truck = trucks(orderQty, capNum);
  const mixR = mix(order, mixId);
  const premix = premixBags(order);
  const priceNum = num(price);

  /* ── 표시 ── */
  const volStr = (m3: number) => (sys === 'imperial' ? `${nf(m3 / YD3_M3)} yd³` : `${nf(m3)}㎥`);
  const capStr = sys === 'imperial' ? `${cap[sys]} yd³` : `${cap[sys]}㎥`;
  const dimStr = (d?: { v: string; u: LenUnit }) => (d ? `${d.v}${d.u}` : '');
  const summary = (p: Part) => {
    const D = p.dims;
    const n = num(p.count);
    const times = HAS_COUNT[p.kind] && p.kind !== 'stairs' && n !== 1 ? ` × ${L.of(n)}` : '';
    switch (p.kind) {
      case 'slab': return `${dimStr(D.length)} × ${dimStr(D.width)} × ${dimStr(D.thick)}`;
      case 'wall': return `${dimStr(D.length)} × ${dimStr(D.thick)} × ${dimStr(D.height)}`;
      case 'box': return `${dimStr(D.length)} × ${dimStr(D.width)} × ${dimStr(D.height)}${times}`;
      case 'cyl': return `⌀${dimStr(D.dia)} × ${dimStr(D.height)}${times}`;
      case 'hole': {
        const post = p.post === 'none' ? '' : p.post === 'square' ? ` − ${dimStr(D.post)}□` : ` − ⌀${dimStr(D.post)}`;
        return `⌀${dimStr(D.dia)} × ${dimStr(D.depth)}${times}${post}`;
      }
      case 'stairs': {
        const steps = isKo ? `${p.count}단` : `${p.count} steps`;
        const tail = p.stair === 'waist' ? ` · ${isKo ? '바닥판' : 'waist'} ${dimStr(D.waist)}` : ` · ${isKo ? '채움형' : 'solid'}`;
        return `${isKo ? '폭' : 'W'} ${dimStr(D.width)} · ${steps} (${dimStr(D.riser)} × ${dimStr(D.tread)})${tail}`;
      }
      case 'manual': return `${p.manual.v} ${p.manual.u === 'm3' ? 'm³' : p.manual.u === 'yd3' ? 'yd³' : 'ft³'}`;
    }
  };
  const nameOf = (p: Part, i: number) => p.name.trim() || `${L.shortNames[p.kind]} ${i + 1}`;

  const diagramLabels: DiagramLabels = {};
  for (const k of activeFields(draft)) diagramLabels[k] = L.label(draft.kind, k, draft.post);
  if (HAS_COUNT[draft.kind]) diagramLabels.count = draft.kind === 'stairs' ? L.count('stairs') : `× ${L.count(draft.kind)}`;

  // 계단 전체 높이·길이 (단 수 × 단 높이, 단 수 × 단 너비)
  const stairTotals = (() => {
    if (draft.kind !== 'stairs') return null;
    const n = num(draft.count);
    const R = num(draft.dims.riser?.v) * LEN_TO_M[draft.dims.riser?.u ?? 'm'];
    const Tr = num(draft.dims.tread?.v) * LEN_TO_M[draft.dims.tread?.u ?? 'm'];
    if (!(n > 0 && R > 0 && Tr > 0)) return null;
    const len = (m: number) => (sys === 'imperial' ? `${nf(m / LEN_TO_M.ft)} ft` : `${nf(m)}m`);
    return [len(n * R), len(n * Tr)] as const;
  })();

  /* ── 동작 ── */
  const pickKind = (kind: ShapeKind) => {
    if (kind === draft.kind) return;
    setDraft((d) => ({ ...emptyPart(kind, sys, d.id), name: d.name }));
  };
  const setDim = (k: DimKey, patch: Partial<{ v: string; u: LenUnit }>) =>
    setDraft((d) => ({ ...d, dims: { ...d.dims, [k]: { ...d.dims[k]!, ...patch } } }));

  const switchSys = (to: UnitSystem) => {
    if (to === sys) return;
    setSys(to);
    setDraft((d) => convertDraft(d, to));
  };

  const commit = () => {
    if (!draftVol || postBig) return;
    if (editId) {
      setItems((list) => list.map((p) => (p.id === editId ? { ...draft, id: editId } : p)));
      setEditId(null);
    } else {
      setItems((list) => [...list, { ...draft, id: newId(), name: draft.name.trim() || `${L.shortNames[draft.kind]} ${list.length + 1}` }]);
    }
    setDraft(emptyPart(draft.kind, sys));
  };
  const startEdit = (p: Part) => { setEditId(p.id); setDraft({ ...p }); inputsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const cancelEdit = () => { setEditId(null); setDraft(emptyPart(draft.kind, sys)); };
  const remove = (id: string) => {
    setItems((list) => list.filter((p) => p.id !== id));
    if (editId === id) cancelEdit();
  };
  const reset = () => {
    if (typeof window !== 'undefined' && !window.confirm(L.resetConfirm)) return;
    setItems([]); setEditId(null); setDraft(emptyPart('slab', sys)); setWaste(5); setCap(DEFAULT_CAP); setPrice('');
  };

  const copy = async () => {
    if (!(order > 0)) return;
    const lines = [
      L.summaryTitle,
      ...rows.filter((r) => r.vol).map((r, i) => `- ${nameOf(r.part, i)}: ${volStr(r.vol!)} (${summary(r.part)})`),
      L.summaryTotal(volStr(net), waste, volStr(order)),
      ...(truck.count ? [L.summaryTrucks(capStr, truck.count, truck.loads.map((x) => nf(x)).join(' + '))] : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* 클립보드 권한 없음 */ }
  };

  const unitLabel = (u: LenUnit) => u;
  const fieldId = (k: string) => `cc-${k}`;
  const hasValue = order > 0;
  const priceUnit = sys === 'imperial' ? 'yd³' : '㎥';
  const costTotal = priceNum > 0 && hasValue ? priceNum * orderQty : 0;
  const money = (n: number) => (isKo ? `${Math.round(n).toLocaleString('ko-KR')}원` : `$${nf(n)}`);

  return (
    <>
      <div className={s.layout}>
        {/* ── 입력 ── */}
        <div className={s.leftCol}>
          <section ref={inputsRef} className={`${ui.card} ${s.card} ${s.noPrint}`} aria-label={isKo ? '입력' : 'Inputs'}>
            <div className={ui.field}>
              <span className={ui.label}>{L.system}</span>
              <div className={ui.segmented} role="tablist" aria-label={L.system}>
                {(['metric', 'imperial'] as const).map((v) => (
                  <button key={v} type="button" role="tab" aria-selected={sys === v}
                    className={`${ui.segment} ${sys === v ? ui.segmentActive : ''}`} onClick={() => switchSys(v)}>
                    {v === 'metric' ? L.metric : L.imperial}
                  </button>
                ))}
              </div>
            </div>

            <div className={ui.field}>
              <span className={ui.label}>{L.shape}</span>
              <div className={s.shapeGrid} role="radiogroup" aria-label={L.shape}>
                {SHAPES.map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={draft.kind === k}
                    className={`${s.shapeBtn} ${draft.kind === k ? s.shapeActive : ''}`} onClick={() => pickKind(k)}>
                    <ConcreteDiagram kind={k} className={s.shapeIcon} />
                    <span>{L.shapes[k]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={s.form}>
              <div className={s.diagramBox}>
                <ConcreteDiagram kind={draft.kind} labels={diagramLabels} stair={draft.stair} post={draft.post} className={s.diagram} title={L.shapes[draft.kind]} />
              </div>

              {draft.kind === 'stairs' && (
                <div className={ui.field}>
                  <span className={ui.label}>{L.stairType}</span>
                  <div className={ui.segmented} role="tablist" aria-label={L.stairType}>
                    {(['waist', 'solid'] as const).map((v) => (
                      <button key={v} type="button" role="tab" aria-selected={draft.stair === v}
                        className={`${ui.segment} ${draft.stair === v ? ui.segmentActive : ''}`} onClick={() => setDraft((d) => ({ ...d, stair: v }))}>
                        {v === 'waist' ? L.stairWaist : L.stairSolid}
                      </button>
                    ))}
                  </div>
                  <p className={ui.hint}>{L.stairHint(draft.stair)}</p>
                </div>
              )}

              {draft.kind === 'hole' && (
                <div className={ui.field}>
                  <span className={ui.label}>{L.postShape}</span>
                  <div className={ui.segmented} role="tablist" aria-label={L.postShape}>
                    {(['none', 'square', 'round'] as const).map((v) => (
                      <button key={v} type="button" role="tab" aria-selected={draft.post === v}
                        className={`${ui.segment} ${draft.post === v ? ui.segmentActive : ''}`} onClick={() => setDraft((d) => ({ ...d, post: v }))}>
                        {v === 'none' ? L.postNone : v === 'square' ? L.postSquare : L.postRound}
                      </button>
                    ))}
                  </div>
                  {draft.post !== 'none' && <p className={ui.hint}>{L.postHint}</p>}
                </div>
              )}

              <div className={s.fields}>
                {draft.kind === 'manual' ? (
                  <div className={`${ui.field} ${s.full}`}>
                    <label className={ui.label} htmlFor={fieldId('manual')}>{L.manualLabel}</label>
                    <div className={s.unitInput}>
                      <input id={fieldId('manual')} className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0"
                        value={draft.manual.v} onChange={(e) => setDraft((d) => ({ ...d, manual: { ...d.manual, v: decimal(e.target.value) } }))} />
                      <select className={s.unitSelect} aria-label={isKo ? '단위' : 'Unit'} value={draft.manual.u}
                        onChange={(e) => setDraft((d) => ({ ...d, manual: { ...d.manual, u: e.target.value as VolUnit } }))}>
                        <option value="m3">m³</option>
                        <option value="yd3">yd³</option>
                        <option value="ft3">ft³</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  activeFields(draft).map((k) => {
                    const d = draft.dims[k]!;
                    const w = warns[k];
                    const units = UNITS[sys].includes(d.u) ? UNITS[sys] : [d.u, ...UNITS[sys]];
                    return (
                      <div key={k} className={ui.field}>
                        <label className={ui.label} htmlFor={fieldId(k)}>{L.label(draft.kind, k, draft.post)}</label>
                        <div className={`${s.unitInput} ${w ? s.warnInput : ''}`}>
                          <input id={fieldId(k)} className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0"
                            value={d.v} aria-invalid={!!w} onChange={(e) => setDim(k, { v: decimal(e.target.value) })} />
                          <select className={s.unitSelect} aria-label={`${L.label(draft.kind, k, draft.post)} ${isKo ? '단위' : 'unit'}`}
                            value={d.u} onChange={(e) => setDim(k, { u: e.target.value as LenUnit })}>
                            {units.map((u) => <option key={u} value={u}>{unitLabel(u)}</option>)}
                          </select>
                        </div>
                        {w && <p className={s.warn} role="alert"><AlertTriangle aria-hidden />{w === 'big' ? L.warnBig : L.warnSmall}</p>}
                      </div>
                    );
                  })
                )}
                {HAS_COUNT[draft.kind] && (
                  <div className={ui.field}>
                    <label className={ui.label} htmlFor={fieldId('count')}>{L.count(draft.kind)}</label>
                    <div className={ui.inputGroup}>
                      <input id={fieldId('count')} className={ui.input} inputMode="numeric" autoComplete="off" placeholder={draft.kind === 'stairs' ? '5' : '1'}
                        value={draft.count} onChange={(e) => setDraft((d) => ({ ...d, count: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))} />
                      <span className={ui.unit}>{L.countUnit(draft.kind)}</span>
                    </div>
                  </div>
                )}
                <div className={`${ui.field} ${s.full}`}>
                  <label className={ui.label} htmlFor={fieldId('name')}>{L.name}</label>
                  <input id={fieldId('name')} className={ui.input} maxLength={40} autoComplete="off"
                    placeholder={`${L.shortNames[draft.kind]} ${(editId ? items.findIndex((p) => p.id === editId) : items.length) + 1}`}
                    value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
              </div>

              {stairTotals && <p className={ui.hint}>{L.stairTotal(stairTotals[0], stairTotals[1])}</p>}
              {postBig && <p className={s.warn} role="alert"><AlertTriangle aria-hidden />{L.postBig}</p>}

              <div className={s.preview} aria-live="polite">
                <span>{L.thisPart}</span>
                {draftVol && !postBig
                  ? <strong>{volStr(draftVol)}{sys === 'metric' ? '' : ` · ${nf(draftVol / FT3_M3)} ft³`}</strong>
                  : <em>{L.needInput}</em>}
              </div>

              <div className={s.formActions}>
                <button type="button" className={`${ui.button} ${ui.primary} ${ui.lg}`} disabled={!draftVol || postBig} onClick={commit}>
                  {editId ? <Check aria-hidden /> : <Plus aria-hidden />}{editId ? L.update : L.add}
                </button>
                {editId && (
                  <button type="button" className={`${ui.button} ${ui.secondary} ${ui.lg}`} onClick={cancelEdit}>
                    <X aria-hidden />{L.cancel}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── 부위 목록 ── */}
          <section className={`${ui.card} ${s.card}`} aria-label={L.list}>
            <h2 className={ui.cardTitle}>{L.list}{items.length > 0 && <span className={s.countBadge}>{items.length}</span>}</h2>
            {rows.length === 0 ? (
              <p className={s.emptyList}>{L.empty}</p>
            ) : (
              <ul className={s.list}>
                {rows.map((r, i) => {
                  const pending = r.state === 'draft';
                  return (
                    <li key={pending ? 'draft' : r.part.id} className={`${s.item} ${pending ? s.itemDraft : ''} ${r.state === 'editing' ? s.itemEditing : ''}`}>
                      <div className={s.itemMain}>
                        <span className={s.itemName}>
                          {nameOf(r.part, i)}
                          {pending && <small className={s.tag}>{L.drafting}</small>}
                          {r.state === 'editing' && <small className={s.tag}>{L.editing}</small>}
                          {Object.keys(dimWarnings(r.part)).length > 0 && <AlertTriangle className={s.itemWarn} aria-label={L.warnItem} />}
                        </span>
                        <span className={s.itemDims}>{L.shapes[r.part.kind]} · {summary(r.part)}</span>
                      </div>
                      <span className={s.itemVol}>{r.vol ? volStr(r.vol) : '—'}</span>
                      {!pending && (
                        <span className={`${s.itemBtns} ${s.noPrint}`}>
                          <button type="button" className={s.iconBtn} onClick={() => startEdit(r.part)} aria-label={`${nameOf(r.part, i)} ${L.edit}`} disabled={r.state === 'editing'}><Pencil aria-hidden /></button>
                          <button type="button" className={s.iconBtn} onClick={() => remove(r.part.id)} aria-label={`${nameOf(r.part, i)} ${L.del}`}><Trash2 aria-hidden /></button>
                        </span>
                      )}
                    </li>
                  );
                })}
                <li className={`${s.item} ${s.itemTotal}`}>
                  <span className={s.itemMain}><span className={s.itemName}>{L.netTotal}</span></span>
                  <span className={s.itemVol}>{volStr(net)}</span>
                </li>
              </ul>
            )}
          </section>
        </div>

        {/* ── 결과 ── */}
        <aside ref={resultRef} className={s.resultCol} aria-label={isKo ? '결과' : 'Results'}>
          <section className={`${ui.card} ${s.card}`}>
            <div className={ui.result} aria-live="polite">
              <div className={ui.resultLabel}>{L.order(waste)}</div>
              {hasValue ? (
                <>
                  <div className={ui.resultValue}>
                    {sys === 'imperial' ? `${nf(order / YD3_M3)} yd³` : `${nf(order)}㎥`}
                    {isKo && sys === 'metric' && <span className={s.rube}> ({L.rube})</span>}
                  </div>
                  <div className={s.resultSub}>
                    {sys === 'imperial'
                      ? `${nf(order / FT3_M3)} ft³ · ${nf(order)} m³`
                      : `${nf(order / YD3_M3)} yd³ · ${nf(order / FT3_M3, 1)} ft³`}
                  </div>
                </>
              ) : (
                <div className={s.zero}>{L.zero}</div>
              )}
            </div>

            {hasValue && (
              <div>
                <div className={s.row}><span className={s.rowLabel}>{L.net}</span><span className={s.rowValue}>{volStr(net)}</span></div>
                <div className={s.row}><span className={s.rowLabel}>{L.waste(waste)}</span><span className={s.rowValue}>+{volStr(order - net)}</span></div>
                {truck.count > 0 && (
                  <div className={s.row}>
                    <span className={s.rowLabel}>{L.trucks}<small>{truck.loads.map((x) => nf(x)).join(' + ')}</small></span>
                    <span className={s.rowValue}><Truck className={s.inlineIcon} aria-hidden />{L.truckLine(capStr, truck.count)}</span>
                  </div>
                )}
                {truck.count > 0 && (
                  <div className={s.loads} aria-hidden>
                    {truck.loads.map((x, i) => (
                      <span key={i} className={s.load}><span className={s.loadFill} style={{ width: `${Math.min(100, (x / capNum) * 100)}%` }} /></span>
                    ))}
                  </div>
                )}
                <div className={s.row}>
                  <span className={s.rowLabel}>{L.weight}<small>{L.weightHint}</small></span>
                  <span className={s.rowValue}>
                    {sys === 'imperial'
                      ? `${Math.round(order * DENSITY_T[0] * 2204.62).toLocaleString('en-US')}–${Math.round(order * DENSITY_T[1] * 2204.62).toLocaleString('en-US')} lb`
                      : `${nf(order * DENSITY_T[0], 1)}~${nf(order * DENSITY_T[1], 1)} t`}
                  </span>
                </div>
                {costTotal > 0 && (
                  <div className={`${s.row} ${s.rowTotal}`}><span className={s.rowLabel}>{L.cost}<small>{L.costTotal(volStr(order))}</small></span><span className={s.rowValue}>{money(costTotal)}</span></div>
                )}
              </div>
            )}
            {hasValue && truck.lastSmall && (
              <div className={`${ui.notice} ${ui.amber} ${s.smallNotice}`}><Info aria-hidden /><div>{L.smallLoad(truck.count === 1)}</div></div>
            )}
          </section>

          <section className={`${ui.card} ${s.card} ${s.settings}`} aria-label={L.settings}>
            <div className={ui.field}>
              <div className={s.sliderHead}><label htmlFor="cc-waste">{L.wasteLabel}</label><b>{waste}%</b></div>
              <input id="cc-waste" type="range" min={0} max={15} step={1} value={waste} className={s.slider} onChange={(e) => setWaste(Number(e.target.value))} />
              <div className={s.ends}><span>0%</span><span>15%</span></div>
              <p className={ui.hint}>{L.wasteHint}</p>
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="cc-cap">{L.capLabel}</label>
              <div className={s.capRow}>
                <div className={`${ui.inputGroup} ${s.capInput}`}>
                  <input id="cc-cap" className={ui.input} inputMode="decimal" autoComplete="off" value={cap[sys]}
                    onChange={(e) => { const v = decimal(e.target.value); setCap((c) => ({ ...c, [sys]: v })); }} />
                  <span className={ui.unit}>{sys === 'imperial' ? 'yd³' : '㎥'}</span>
                </div>
                <div className={ui.chips}>
                  {CAP_CHIPS[sys].map((c) => (
                    <button key={c} type="button" className={`${ui.chip} ${num(cap[sys]) === c ? ui.chipActive : ''}`}
                      onClick={() => setCap((x) => ({ ...x, [sys]: String(c) }))}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <details className={`${ui.card} ${s.card} ${s.details}`}>
            <summary className={s.summary}><span>{L.mixTitle}</span><small>{L.mixSub}</small></summary>
            <div className={s.detailsBody}>
              <div className={ui.segmented} role="tablist" aria-label={L.mixTitle}>
                {(['mix', 'premix'] as const).map((v) => (
                  <button key={v} type="button" role="tab" aria-selected={mixTab === v}
                    className={`${ui.segment} ${mixTab === v ? ui.segmentActive : ''}`} onClick={() => setMixTab(v)}>
                    {v === 'mix' ? L.mixTab : L.premixTab}
                  </button>
                ))}
              </div>
              {mixTab === 'mix' ? (
                <>
                  <div className={ui.field}>
                    <span className={ui.label}>{L.ratio}</span>
                    <div className={s.ratioList} role="radiogroup" aria-label={L.ratio}>
                      {MIXES.map((m) => (
                        <button key={m.id} type="button" role="radio" aria-checked={mixId === m.id}
                          className={`${ui.chip} ${s.ratioBtn} ${mixId === m.id ? ui.chipActive : ''}`} onClick={() => setMixId(m.id as MixId)}>
                          <b>{m.ratio.join(' : ')}</b><span>{L.ratioNames[m.id as MixId]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {hasValue ? (
                    <div>
                      <p className={s.basis}>{L.basisOf(volStr(order))}</p>
                      <div className={s.row}>
                        <span className={s.rowLabel}>{L.cement}</span>
                        <span className={s.rowValue}>
                          {sys === 'imperial'
                            ? L.bags94(mixR.bags94, `${Math.round(mixR.cementKg / 0.45359237).toLocaleString('en-US')} lb`)
                            : L.bags40(mixR.bags40, `${nf(mixR.cementKg, 1)}kg`)}
                        </span>
                      </div>
                      <div className={s.row}><span className={s.rowLabel}>{L.sand}</span><span className={s.rowValue}>{sys === 'imperial' ? `${nf(mixR.sand / FT3_M3, 1)} ft³` : `${nf(mixR.sand)}㎥`}</span></div>
                      <div className={s.row}><span className={s.rowLabel}>{L.gravel}</span><span className={s.rowValue}>{sys === 'imperial' ? `${nf(mixR.gravel / FT3_M3, 1)} ft³` : `${nf(mixR.gravel)}㎥`}</span></div>
                      <div className={s.row}><span className={s.rowLabel}>{L.water}</span><span className={s.rowValue}>{sys === 'imperial' ? `${nf(mixR.waterL / 3.78541, 1)} gal` : `${nf(mixR.waterL, 0)}L`}</span></div>
                    </div>
                  ) : <p className={s.zero}>{L.zero}</p>}
                  <p className={s.note}>{L.mixNote}</p>
                </>
              ) : (
                <>
                  {hasValue ? (
                    <div>
                      <p className={s.basis}>{L.basisOf(`${volStr(order)} = ${nf(order / FT3_M3)} ft³`)}</p>
                      {premix.map((b) => (
                        <div key={b.lb} className={s.row}><span className={s.rowLabel}>{b.lb} lb</span><span className={s.rowValue}>{b.bags.toLocaleString()} {L.bagUnit}</span></div>
                      ))}
                    </div>
                  ) : <p className={s.zero}>{L.zero}</p>}
                  <p className={s.note}>{L.premixNote}</p>
                </>
              )}
            </div>
          </details>

          <details className={`${ui.card} ${s.card} ${s.details}`}>
            <summary className={s.summary}><span>{L.costTitle}</span></summary>
            <div className={s.detailsBody}>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="cc-price">{L.price(priceUnit)}</label>
                <div className={ui.inputGroup}>
                  <input id="cc-price" className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0" value={price}
                    onChange={(e) => setPrice(decimal(e.target.value))} />
                  <span className={ui.unit}>{isKo ? `원/${priceUnit}` : `$/${priceUnit}`}</span>
                </div>
                <p className={ui.hint}>{L.priceHint}</p>
              </div>
              {costTotal > 0 && <div className={`${s.row} ${s.rowTotal}`}><span className={s.rowLabel}>{L.costTotal(volStr(order))}</span><span className={s.rowValue}>{money(costTotal)}</span></div>}
            </div>
          </details>

          <div className={`${s.actions} ${s.noPrint}`}>
            <button type="button" className={`${ui.button} ${ui.primary}`} onClick={copy} disabled={!hasValue}>
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}{copied ? L.copied : L.copy}
            </button>
            <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => window.print()} disabled={!hasValue}>
              <Printer aria-hidden />{L.print}
            </button>
            <button type="button" className={`${ui.button} ${ui.ghost}`} onClick={reset}>
              <RotateCcw aria-hidden />{L.reset}
            </button>
          </div>
          <p className={s.disclaimer}>{L.disclaimer}</p>
        </aside>
      </div>

      {hasValue && inputsVisible && !resultVisible && (
        <button type="button" className={s.mobileBar} onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <span>{L.mobileBar} · {L.waste(waste)}</span>
          <strong>{volStr(order)}{truck.count > 0 ? ` · ${truck.count}${isKo ? '대' : ' trucks'}` : ''}</strong>
        </button>
      )}
    </>
  );
}
