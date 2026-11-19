'use client';

// 줄걸이(슬링) 각도·하중 계산기 — 입력·계산 위젯만 (제목·설명·FAQ·도움말은 page.tsx 서버 렌더)
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertTriangle, Check, CheckCircle2, Copy, Info, OctagonAlert, RotateCcw, XCircle } from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  APEX_SLIDER, DECIMALS, HORIZ_SLIDER_MIN, LEN_UNITS, TABLE_APEX, VERT_SLIDER, WEIGHT_UNITS,
  angleFactor, angleGrade, decimal, fromKg, legTension, num, sharingLegs, toKg, verticalAngle,
  type AngleMode, type Grade, type LenUnit, type Legs, type Share, type WeightUnit,
} from '@/lib/slingCalc';
import SlingDiagram from './SlingDiagram';
import SlingChart from './SlingChart';
import s from './sling-angle-calc.module.css';

const STORE_KEY = 'utilhub-sling-angle-calc';
const MODES: AngleMode[] = ['apex', 'vertical', 'horizontal', 'length'];

const T = {
  ko: {
    weight: '인양물 중량',
    unitName: { t: '톤', kg: 'kg', kN: 'kN', lb: 'lb', ston: 'US톤' } as Record<WeightUnit, string>,
    unitOpt: { t: '톤', kg: 'kg', kN: 'kN', lb: 'lb', ston: 'US톤' } as Record<WeightUnit, string>,
    unitHint: (u: WeightUnit) => u === 'ston' ? 'US톤(쇼트톤) = 2,000lb = 907.18kg. 미터 톤(1,000kg)과 약 10% 차이가 납니다.'
      : u === 'kN' ? '중량을 힘(kN)으로 넣으면 장력도 kN으로 나옵니다. 1톤힘(tf) = 9.80665kN' : '',
    weightErr: '0보다 큰 중량을 입력하세요',
    legs: '줄걸이 다리 수', legUnit: '줄',
    share: '3·4줄걸이 하중 분담 기준',
    share2: '2줄이 분담 (기본·보수적)', share3: '3줄이 분담',
    shareHint: (sh: Share) => sh === 2
      ? '다리 길이 오차·체결점 높이 차이·인양물 강성 때문에 실제로는 2줄이 대부분의 하중을 받는 경우가 많아, 2줄만 하중을 받는다고 보고 계산합니다.'
      : '유럽 규격(EN 13414)은 3·4줄걸이를 3줄 분담 기준으로 계산합니다. 인양물이 단단하거나 줄 길이가 정확히 맞지 않으면 2줄 기준이 안전합니다.',
    why4: '왜 4로 나누지 않나요?',
    why4Body: '4줄을 걸어도 네 다리의 길이가 몇 mm만 달라도 짧은 다리 2개가 먼저 팽팽해지고 나머지는 느슨하게 남습니다. 단단한 인양물(철골·블록·금형)일수록 이런 일이 흔해서, 중량을 4로 나누면 실제 장력보다 크게 낮게 계산됩니다.',
    mode: '각도 입력 방식',
    modes: { apex: '꼭지각', vertical: '수직 기준', horizontal: '수평 기준', length: '줄 길이로' } as Record<AngleMode, string>,
    modeHint: {
      apex: '두 줄 사이의 각도입니다. 국내 현장에서 가장 많이 쓰는 표현입니다.',
      vertical: '수직선(훅에서 똑바로 내린 선)과 줄 사이의 각도입니다. 꼭지각의 절반입니다.',
      horizontal: '인양물 윗면(수평)과 줄 사이의 각도입니다. 미국 OSHA·ASME 자료의 "sling angle"이 이 기준입니다.',
      length: '각도를 모를 때 슬링 길이와, 훅 중심에서 체결점까지의 수평거리를 재서 넣으세요.',
    } as Record<AngleMode, string>,
    angleLabel: { apex: '꼭지각', vertical: '수직 기준 각도', horizontal: '수평 기준 각도', length: '' } as Record<AngleMode, string>,
    slingLen: '슬링 길이 (훅~체결점)', horiz: '수평거리 (훅 중심~체결점)', lenUnit: '길이 단위',
    oneLeg: '1줄걸이는 수직으로 매달리므로 각도 입력이 필요 없습니다. 장력 = 중량',
    errs: {
      empty: '각도를 입력하세요',
      apexMax: '꼭지각은 180° 미만이어야 합니다 (180°면 줄이 수평이 되어 들 수 없습니다)',
      vertMax: '수직 기준 각도는 90° 미만이어야 합니다',
      horizMin: '수평 기준 각도는 0°보다 커야 합니다 (0°면 줄이 수평이라 들 수 없습니다)',
      horizMax: '수평 기준 각도는 90° 이하여야 합니다',
      impossible: '체결 불가능한 치수입니다 — 수평거리는 슬링 길이보다 짧아야 합니다',
    },
    lenEmpty: '슬링 길이와 수평거리를 입력하세요',
    equiv: (apex: string, v: string, h: string) => `꼭지각 ${apex}° · 수직 기준 ${v}° · 수평 기준 ${h}°`,
    wll: '사용 슬링 WLL (선택)',
    wllHint: '슬링 태그에 적힌 다리 1개의 수직(스트레이트) 허용하중을 넣으세요. 줄 1개 장력과 비교합니다.',
    tension: '줄 1개당 장력',
    noWeight: '중량을 입력하면 장력이 계산됩니다',
    factor: '하중 증가 배수',
    factorSub: (f: string) => `수직으로 들 때보다 ${f}배`,
    angle: '각도',
    shareRow: '하중 분담',
    shareVal: (legs: Legs, n: number) => (legs === n ? `${n}줄 모두` : `${legs}줄 중 ${n}줄 기준`),
    grades: {
      green: ['권장 범위', '꼭지각 60° 이하 — 장력 증가가 작습니다.'],
      yellow: ['주의', '꼭지각 60~90° — 줄 1개 장력이 최대 1.41배까지 늘어납니다.'],
      orange: ['경고: 장력 급증', '꼭지각 90~120° — 120°에서는 줄 1개에 인양물 전체 무게가 걸립니다.'],
      red: ['사용 금지 수준', '꼭지각 120° 초과 — 각도를 줄이거나 더 긴 슬링·인양 보조 기구를 쓰세요.'],
    } as Record<Grade, [string, string]>,
    okWll: '사용 가능', overWll: '허용하중 초과',
    usage: (p: string) => `WLL의 ${p}% 사용`,
    tight: '여유가 10% 미만입니다. 동하중(급정지·흔들림)을 생각하면 한 단계 큰 슬링을 검토하세요.',
    redButOk: 'WLL 이내지만 각도가 사용 금지 수준입니다. 각도를 줄이세요.',
    disclaimer: '이 계산 결과는 참고용입니다. 실제 인양 작업은 자격을 갖춘 담당자의 판단, 슬링·샤클 제조사의 허용하중(WLL), 현장 작업계획서를 반드시 따르세요.',
    diagram: '줄걸이 그림',
    diagramNote: (legs: Legs, n: number) => legs >= 3 ? `점선은 뒤쪽 다리입니다. 장력은 ${n}줄 분담 기준 값입니다.` : '',
    chart: '각도-장력 그래프',
    chartSub: '꼭지각이 커질수록 줄 1개에 걸리는 힘이 급격히 늘어납니다.',
    chartX: '꼭지각', chartY: '하중 증가 배수',
    zones: ['권장', '주의', '경고', '금지'] as [string, string, string, string],
    tip: (a: number, f: string) => `꼭지각 ${a}° → ×${f}`,
    outside: (a: number, f: string) => `현재 꼭지각 ${a}°는 그래프 범위(150°) 밖입니다. 배수 ×${f}`,
    table: '각도별 장력 비교표',
    tableSub: (w: string, legs: Legs, n: number) => w ? `${w} · ${legs}줄${legs >= 3 ? ` (${n}줄 분담)` : ''} 기준` : `${legs}줄${legs >= 3 ? ` (${n}줄 분담)` : ''} 기준 · 중량을 넣으면 장력이 채워집니다`,
    tableHead: ['꼭지각', '수직 기준', '배수', '줄 1개 장력'],
    current: '현재',
    tableOne: '1줄걸이는 각도와 관계없이 장력이 중량과 같습니다. 다리 수를 2줄 이상으로 바꾸면 각도별 비교표가 나옵니다.',
    copy: '결과 복사', copied: '복사됨', reset: '초기화',
    resetConfirm: '입력값을 모두 처음 상태로 되돌릴까요?',
    copyText: (w: string, legs: Legs, n: number, angle: string, t: string, f: string) =>
      `${w} / ${legs}줄${legs >= 3 ? `(${n}줄 분담)` : ''}${angle ? ` / ${angle}` : ''} → 줄 1개당 ${t}${legs > 1 ? ` (배수 ${f})` : ''}`,
    copyWll: (wll: string, p: string, ok: boolean) => ` / WLL ${wll} 대비 ${p}% ${ok ? '사용 가능' : '허용하중 초과'}`,
    copyLen: (L: string, H: string) => ` (줄 ${L}·수평 ${H})`,
    mobileBar: '줄 1개당 장력',
  },
  en: {
    weight: 'Load weight',
    unitName: { t: 'metric t', kg: 'kg', kN: 'kN', lb: 'lb', ston: 'US tons' } as Record<WeightUnit, string>,
    unitOpt: { t: 'metric t', kg: 'kg', kN: 'kN', lb: 'lb', ston: 'US ton' } as Record<WeightUnit, string>,
    unitHint: (u: WeightUnit) => u === 'ston' ? 'US ton (short ton) = 2,000 lb. A metric ton is 2,204.62 lb — about 10% heavier.'
      : u === 't' ? 'Metric ton (tonne) = 1,000 kg = 2,204.62 lb. A US (short) ton is 2,000 lb.'
      : u === 'kN' ? 'Enter the load as a force in kN and the leg tension comes out in kN too.' : '',
    weightErr: 'Enter a weight greater than 0',
    legs: 'Number of sling legs', legUnit: 'leg',
    share: 'Load sharing for 3- and 4-leg slings',
    share2: '2 legs carry it (default, conservative)', share3: '3 legs carry it',
    shareHint: (sh: Share) => sh === 2
      ? 'Small differences in leg length, pick-point height and a stiff load often leave two legs carrying most of the weight, so the calculation assumes only two legs share it.'
      : 'European standard EN 13414 rates 3- and 4-leg slings on three legs sharing the load. If the load is rigid or the legs are not matched exactly, the 2-leg basis is safer.',
    why4: 'Why not divide by 4?',
    why4Body: 'Even with four legs hooked up, a few millimetres of difference in leg length lets two short legs take up first while the others stay slack. With rigid loads such as steel, blocks or dies this is common, so dividing by four can badly underestimate the real tension.',
    mode: 'How to enter the angle',
    modes: { apex: 'Included', vertical: 'From vertical', horizontal: 'From horizontal', length: 'Lengths' } as Record<AngleMode, string>,
    modeHint: {
      apex: 'The angle between the two legs (included angle).',
      vertical: 'The angle between a leg and a vertical line dropped from the hook — half the included angle.',
      horizontal: 'The angle between a leg and the horizontal. This is the "sling angle" used in OSHA and ASME charts.',
      length: 'Don’t know the angle? Measure the sling leg length and the horizontal distance from the hook centre to the pick point.',
    } as Record<AngleMode, string>,
    angleLabel: { apex: 'Included angle', vertical: 'Angle from vertical', horizontal: 'Angle from horizontal', length: '' } as Record<AngleMode, string>,
    slingLen: 'Sling leg length (hook to pick point)', horiz: 'Horizontal distance (hook centre to pick point)', lenUnit: 'Length unit',
    oneLeg: 'A single leg hangs straight down, so no angle is needed. Tension = load weight.',
    errs: {
      empty: 'Enter an angle',
      apexMax: 'The included angle must be less than 180° (at 180° the legs are flat and cannot lift)',
      vertMax: 'The angle from vertical must be less than 90°',
      horizMin: 'The angle from horizontal must be greater than 0° (a flat leg cannot lift)',
      horizMax: 'The angle from horizontal must be 90° or less',
      impossible: 'Impossible geometry — the horizontal distance must be shorter than the sling length',
    },
    lenEmpty: 'Enter the sling length and the horizontal distance',
    equiv: (apex: string, v: string, h: string) => `Included ${apex}° · ${v}° from vertical · ${h}° from horizontal`,
    wll: 'Sling WLL (optional)',
    wllHint: 'Enter the single-leg vertical working load limit from the sling tag. It is compared with the tension in one leg.',
    tension: 'Tension per leg',
    noWeight: 'Enter the load weight to see the tension',
    factor: 'Load angle factor',
    factorSub: (f: string) => `${f}× a straight vertical lift`,
    angle: 'Angle',
    shareRow: 'Load sharing',
    shareVal: (legs: Legs, n: number) => (legs === n ? `all ${n} legs` : `${n} of ${legs} legs`),
    grades: {
      green: ['Recommended', 'Included angle 60° or less (sling angle 60°+ from horizontal) — little extra tension.'],
      yellow: ['Caution', 'Included 60–90° — leg tension rises to as much as 1.41× a vertical lift.'],
      orange: ['Warning: tension climbing fast', 'Included 90–120° — at 120° each leg carries the full load.'],
      red: ['Do not use', 'Included angle over 120° (under 30° from horizontal) — reduce the angle, use longer legs or a spreader beam.'],
    } as Record<Grade, [string, string]>,
    okWll: 'Within WLL', overWll: 'Over the WLL',
    usage: (p: string) => `${p}% of WLL`,
    tight: 'Less than 10% margin. Allow for shock loading (sudden stops, swinging) — consider the next size up.',
    redButOk: 'Within the WLL, but the angle is in the do-not-use range. Reduce the angle.',
    disclaimer: 'For reference only. Always follow the manufacturer’s rated capacity (WLL), a qualified rigger’s judgment, and your site lift plan.',
    diagram: 'Sling diagram',
    diagramNote: (legs: Legs, n: number) => legs >= 3 ? `Dashed lines are the back legs. Tensions assume ${n} legs share the load.` : '',
    chart: 'Angle vs. tension',
    chartSub: 'As the included angle opens up, the force in each leg climbs steeply.',
    chartX: 'Included angle', chartY: 'Load factor',
    zones: ['OK', 'Caution', 'Warning', 'No'] as [string, string, string, string],
    tip: (a: number, f: string) => `${a}° included → ×${f}`,
    outside: (a: number, f: string) => `The current included angle (${a}°) is beyond the chart (150°). Factor ×${f}`,
    table: 'Tension by angle',
    tableSub: (w: string, legs: Legs, n: number) => w ? `For ${w} on ${legs} legs${legs >= 3 ? ` (${n} sharing)` : ''}` : `${legs} legs${legs >= 3 ? ` (${n} sharing)` : ''} · enter a weight to fill in tensions`,
    tableHead: ['Included', 'From vertical', 'Factor', 'Tension per leg'],
    current: 'now',
    tableOne: 'With a single leg, tension equals the load at any angle. Choose 2 or more legs to compare angles.',
    copy: 'Copy result', copied: 'Copied', reset: 'Reset',
    resetConfirm: 'Reset all inputs?',
    copyText: (w: string, legs: Legs, n: number, angle: string, t: string, f: string) =>
      `${w} / ${legs} leg${legs === 1 ? '' : 's'}${legs >= 3 ? ` (${n} sharing)` : ''}${angle ? ` / ${angle}` : ''} → ${t} per leg${legs > 1 ? ` (×${f})` : ''}`,
    copyWll: (wll: string, p: string, ok: boolean) => ` / ${p}% of ${wll} WLL — ${ok ? 'within WLL' : 'OVER WLL'}`,
    copyLen: (L: string, H: string) => ` (leg ${L}, horizontal ${H})`,
    mobileBar: 'Tension per leg',
  },
};

/** 각도 글자: 소수 둘째 자리까지, 끝의 0 제거 */
const deg = (n: number) => String(Math.round(n * 100) / 100);

type Angles = { apex: string; vertical: string; horizontal: string };
function anglesFromTheta(theta: number): Angles {
  return { apex: deg(theta * 2), vertical: deg(theta), horizontal: deg(90 - theta) };
}

type Saved = {
  weight: string; wUnit: WeightUnit; legs: Legs; share: Share; mode: AngleMode;
  angles: Angles; slingLen: string; horiz: string; lenUnit: LenUnit; wll: string; wllUnit: WeightUnit;
};

function defaults(isKo: boolean): Saved {
  return {
    weight: '', wUnit: isKo ? 't' : 'lb', legs: 2, share: 2,
    mode: isKo ? 'apex' : 'horizontal', angles: anglesFromTheta(30),
    slingLen: '', horiz: '', lenUnit: isKo ? 'm' : 'ft', wll: '', wllUnit: isKo ? 't' : 'lb',
  };
}

const isUnit = (u: unknown): u is WeightUnit => u === 't' || u === 'kg' || u === 'kN' || u === 'lb' || u === 'ston';

export default function SlingCalcClient() {
  const isKo = useLocale() === 'ko';
  const L = isKo ? T.ko : T.en;
  const loc = isKo ? 'ko-KR' : 'en-US';
  const nf = (n: number, d: number) => n.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d });

  const [st, setSt] = useState<Saved>(() => defaults(isKo));
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);
  const inputsRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const [inputsVisible, setInputsVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(true);
  const set = (patch: Partial<Saved>) => setSt((x) => ({ ...x, ...patch }));

  // 휴대폰: 입력칸을 보는 동안 결과가 화면 밖이면 아래에 장력 막대를 띄운다
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

  // 마운트 후 저장값 복원 (저장소를 못 써도 계산은 그대로)
  useEffect(() => {
    let sv: Record<string, unknown> | null = null;
    try { sv = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { /* 저장소 없음 */ }
    void Promise.resolve().then(() => {
      if (sv && typeof sv === 'object') {
        const d = defaults(isKo);
        const str = (v: unknown, fb: string) => (typeof v === 'string' ? decimal(v) : fb);
        const a = (sv.angles && typeof sv.angles === 'object' ? sv.angles : {}) as Record<string, unknown>;
        setSt({
          weight: str(sv.weight, d.weight),
          wUnit: isUnit(sv.wUnit) ? sv.wUnit : d.wUnit,
          legs: sv.legs === 1 || sv.legs === 2 || sv.legs === 3 || sv.legs === 4 ? sv.legs : d.legs,
          share: sv.share === 3 ? 3 : 2,
          mode: MODES.includes(sv.mode as AngleMode) ? (sv.mode as AngleMode) : d.mode,
          angles: { apex: str(a.apex, d.angles.apex), vertical: str(a.vertical, d.angles.vertical), horizontal: str(a.horizontal, d.angles.horizontal) },
          slingLen: str(sv.slingLen, ''), horiz: str(sv.horiz, ''),
          lenUnit: LEN_UNITS.includes(sv.lenUnit as LenUnit) ? (sv.lenUnit as LenUnit) : d.lenUnit,
          wll: str(sv.wll, ''),
          wllUnit: isUnit(sv.wllUnit) ? sv.wllUnit : d.wllUnit,
        });
      }
      loaded.current = true;
    });
    // 복원은 처음 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch { /* 저장 실패해도 계산은 그대로 */ }
  }, [st]);

  /* ── 계산 ── */
  const { weight, wUnit, legs, share, mode, angles, slingLen, horiz, lenUnit, wll, wllUnit } = st;
  const angleRes = legs === 1
    ? ({ ok: true, theta: 0 } as const)
    : verticalAngle({ mode, apex: angles.apex, vertical: angles.vertical, horizontal: angles.horizontal, slingLen, horiz });
  const theta = angleRes.ok ? angleRes.theta : null;
  const w = num(weight);
  const weightOk = w > 0;
  const weightErr = weight !== '' && !(w > 0);
  const n = sharingLegs(legs, share);
  const factor = theta !== null ? angleFactor(theta) : null;
  const grade: Grade | null = theta !== null && legs > 1 ? angleGrade(theta) : null;
  const tension = theta !== null && weightOk ? legTension(w, legs, share, theta) : null;
  const wllNum = num(wll);
  const usage = tension !== null && wllNum > 0 ? toKg(tension, wUnit) / toKg(wllNum, wllUnit) : null;

  /* ── 표시 ── */
  const fmtW = (v: number, u: WeightUnit) => {
    const txt = nf(v, DECIMALS[u]);
    return isKo && u === 't' ? `${txt}${L.unitName.t}` : `${txt} ${L.unitName[u]}`;
  };
  const inputW = (v: number, u: WeightUnit) => {
    const txt = v.toLocaleString(loc, { maximumFractionDigits: 3 });
    return isKo && u === 't' ? `${txt}${L.unitName.t}` : `${txt} ${L.unitName[u]}`;
  };
  const altUnits: Record<WeightUnit, WeightUnit[]> = { t: ['kg', 'kN'], kg: ['t', 'kN'], kN: ['t', 'kg'], lb: ['ston', 't'], ston: ['lb', 't'] };
  const alt = (v: number) => altUnits[wUnit].map((u) => fmtW(fromKg(toKg(v, wUnit), u), u)).join(' · ');
  const thetaEq = theta !== null ? anglesFromTheta(theta) : null;
  const angleText = (() => {
    if (legs === 1 || !thetaEq) return '';
    if (mode === 'vertical') return isKo ? `수직 기준 ${thetaEq.vertical}°` : `${thetaEq.vertical}° from vertical (${thetaEq.apex}° included)`;
    if (mode === 'horizontal') return isKo ? `수평 기준 ${thetaEq.horizontal}°` : `${thetaEq.horizontal}° from horizontal (${thetaEq.apex}° included)`;
    const base = isKo ? `꼭지각 ${thetaEq.apex}°` : `${thetaEq.apex}° included`;
    return mode === 'length' ? base + L.copyLen(`${slingLen}${lenUnit}`, `${horiz}${lenUnit}`) : base;
  })();
  const pct = usage !== null ? nf(usage * 100, 0) : '';
  const over = usage !== null && usage > 1;

  /* ── 동작 ── */
  const setAngle = (m: Exclude<AngleMode, 'length'>, raw: string) => {
    const v = decimal(raw);
    const r = verticalAngle({ mode: m, apex: v, vertical: v, horizontal: v, slingLen: '', horiz: '' });
    set({ angles: r.ok ? { ...anglesFromTheta(r.theta), [m]: v } : { ...angles, [m]: v } });
  };
  const switchMode = (m: AngleMode) => {
    if (m === mode) return;
    // 지금 계산된 각도를 새 입력 방식으로 옮긴다
    set({ mode: m, ...(theta !== null && legs > 1 && m !== 'length' ? { angles: anglesFromTheta(theta) } : {}) });
  };
  const setWeightUnit = (u: WeightUnit) => set({ wUnit: u, ...(wll === '' ? { wllUnit: u } : {}) });
  const reset = () => {
    if (typeof window !== 'undefined' && !window.confirm(L.resetConfirm)) return;
    setSt(defaults(isKo));
  };
  const copy = async () => {
    if (tension === null) return;
    let text = L.copyText(inputW(w, wUnit), legs, n, angleText, fmtW(tension, wUnit), factor !== null ? factor.toFixed(3) : '');
    if (usage !== null) text += L.copyWll(inputW(wllNum, wllUnit), pct, !over);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* 클립보드 권한 없음 */ }
  };

  const sliderMin = mode === 'horizontal' ? HORIZ_SLIDER_MIN : 0;
  const sliderMax = mode === 'apex' ? APEX_SLIDER : mode === 'vertical' ? VERT_SLIDER : 90;
  const angleStr = mode === 'length' ? '' : angles[mode];
  const sliderVal = Math.min(sliderMax, Math.max(sliderMin, Number.isFinite(num(angleStr)) ? num(angleStr) : sliderMin));
  const angleErr = !angleRes.ok && legs > 1
    ? (angleRes.reason === 'empty' ? (mode === 'length' ? L.lenEmpty : L.errs.empty) : L.errs[angleRes.reason])
    : null;

  // 비교표: 기본 각도 + 현재 각도(목록에 없으면 끼워 넣음)
  const curApex = thetaEq ? Number(thetaEq.apex) : null;
  const tableRows = (() => {
    const list = TABLE_APEX.map((a) => ({ apex: a, now: curApex !== null && Math.abs(curApex - a) < 0.005 }));
    if (curApex !== null && legs > 1 && !list.some((r) => r.now)) list.push({ apex: curApex, now: true });
    return list.sort((a, b) => a.apex - b.apex);
  })();

  const GradeIcon = grade === 'green' ? CheckCircle2 : grade === 'red' ? OctagonAlert : AlertTriangle;
  const gradeTone = grade === 'green' ? ui.green : grade === 'yellow' ? ui.amber : grade === 'orange' ? s.orange : ui.red;

  return (
    <>
      <div className={s.layout}>
        {/* ── 입력 ── */}
        <section ref={inputsRef} className={`${ui.card} ${s.card}`} aria-label={isKo ? '입력' : 'Inputs'}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="sl-weight">{L.weight}</label>
            <div className={`${s.unitInput} ${weightErr ? s.errInput : ''}`}>
              <input id="sl-weight" className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0"
                value={weight} aria-invalid={weightErr} onChange={(e) => set({ weight: decimal(e.target.value) })} />
              <select className={s.unitSelect} aria-label={`${L.weight} ${isKo ? '단위' : 'unit'}`} value={wUnit}
                onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}>
                {WEIGHT_UNITS[isKo ? 'ko' : 'en'].map((u) => <option key={u} value={u}>{L.unitOpt[u]}</option>)}
              </select>
            </div>
            {weightErr ? <p className={ui.error} role="alert">{L.weightErr}</p> : L.unitHint(wUnit) && <p className={ui.hint}>{L.unitHint(wUnit)}</p>}
          </div>

          <div className={ui.field}>
            <span className={ui.label}>{L.legs}</span>
            <div className={s.legGrid} role="radiogroup" aria-label={L.legs}>
              {([1, 2, 3, 4] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={legs === k}
                  className={`${s.legBtn} ${legs === k ? s.legActive : ''}`} onClick={() => set({ legs: k })}>
                  <b>{k}</b>{isKo ? L.legUnit : `${L.legUnit}${k === 1 ? '' : 's'}`}
                </button>
              ))}
            </div>
          </div>

          {legs >= 3 && (
            <div className={ui.field}>
              <span className={ui.label}>{L.share}</span>
              <div className={ui.segmented} role="tablist" aria-label={L.share}>
                {([2, 3] as const).map((v) => (
                  <button key={v} type="button" role="tab" aria-selected={share === v}
                    className={`${ui.segment} ${share === v ? ui.segmentActive : ''}`} onClick={() => set({ share: v })}>
                    {v === 2 ? L.share2 : L.share3}
                  </button>
                ))}
              </div>
              <p className={ui.hint}>{L.shareHint(share)}</p>
              <details className={s.why}>
                <summary>{L.why4}</summary>
                <p>{L.why4Body}</p>
              </details>
            </div>
          )}

          <div className={ui.field}>
            <span className={ui.label}>{L.mode}</span>
            <div className={`${ui.segmented} ${s.modeTabs}`} role="tablist" aria-label={L.mode}>
              {MODES.map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} disabled={legs === 1}
                  className={`${ui.segment} ${mode === m ? ui.segmentActive : ''}`} onClick={() => switchMode(m)}>
                  {L.modes[m]}
                </button>
              ))}
            </div>
            {legs === 1
              ? <p className={`${ui.notice} ${ui.gray} ${s.small}`}><Info aria-hidden />{L.oneLeg}</p>
              : <p className={ui.hint}>{L.modeHint[mode]}</p>}
          </div>

          {legs > 1 && mode !== 'length' && (
            <div className={ui.field}>
              <label className={ui.label} htmlFor="sl-angle">{L.angleLabel[mode]}</label>
              <div className={`${s.angleRow} ${angleErr ? s.errInput : ''}`}>
                <div className={s.unitInput}>
                  <input id="sl-angle" className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0"
                    value={angleStr} aria-invalid={!!angleErr} onChange={(e) => setAngle(mode, e.target.value)} />
                  <span className={s.unitTag}>°</span>
                </div>
                <input type="range" className={s.slider} min={sliderMin} max={sliderMax} step={1} value={sliderVal}
                  aria-label={L.angleLabel[mode]} onChange={(e) => setAngle(mode, e.target.value)} />
              </div>
            </div>
          )}

          {legs > 1 && mode === 'length' && (
            <div className={s.lenFields}>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="sl-len">{L.slingLen}</label>
                <div className={`${s.unitInput} ${angleErr && angleRes.ok === false && angleRes.reason === 'impossible' ? s.errInput : ''}`}>
                  <input id="sl-len" className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0"
                    value={slingLen} onChange={(e) => set({ slingLen: decimal(e.target.value) })} />
                  <select className={s.unitSelect} aria-label={L.lenUnit} value={lenUnit} onChange={(e) => set({ lenUnit: e.target.value as LenUnit })}>
                    {LEN_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="sl-horiz">{L.horiz}</label>
                <div className={`${s.unitInput} ${angleErr && angleRes.ok === false && angleRes.reason === 'impossible' ? s.errInput : ''}`}>
                  <input id="sl-horiz" className={ui.input} inputMode="decimal" autoComplete="off" placeholder="0"
                    value={horiz} onChange={(e) => set({ horiz: decimal(e.target.value) })} />
                  <span className={s.unitTag}>{lenUnit}</span>
                </div>
              </div>
            </div>
          )}

          {legs > 1 && (angleErr
            ? <p className={ui.error} role="alert">{angleErr}</p>
            : thetaEq && <p className={s.equiv}>{L.equiv(thetaEq.apex, thetaEq.vertical, thetaEq.horizontal)}</p>)}

          <div className={ui.field}>
            <label className={ui.label} htmlFor="sl-wll">{L.wll}</label>
            <div className={s.unitInput}>
              <input id="sl-wll" className={ui.input} inputMode="decimal" autoComplete="off" placeholder="—"
                value={wll} onChange={(e) => set({ wll: decimal(e.target.value) })} />
              <select className={s.unitSelect} aria-label={`WLL ${isKo ? '단위' : 'unit'}`} value={wllUnit}
                onChange={(e) => set({ wllUnit: e.target.value as WeightUnit })}>
                {WEIGHT_UNITS[isKo ? 'ko' : 'en'].map((u) => <option key={u} value={u}>{L.unitOpt[u]}</option>)}
              </select>
            </div>
            <p className={ui.hint}>{L.wllHint}</p>
          </div>
        </section>

        {/* ── 결과 ── */}
        <aside ref={resultRef} className={s.resultCol} aria-label={isKo ? '결과' : 'Results'}>
          <section className={`${ui.card} ${s.card}`}>
            <div className={ui.result} aria-live="polite">
              <div className={ui.resultLabel}>{L.tension}</div>
              {tension !== null ? (
                <>
                  <div className={`${ui.resultValue} ${s.bigValue}`}>{fmtW(tension, wUnit)}</div>
                  <div className={s.resultSub}>= {alt(tension)}</div>
                </>
              ) : (
                <div className={s.zero}>{weightOk ? (angleErr ?? L.noWeight) : L.noWeight}</div>
              )}
            </div>

            <div>
              {factor !== null && legs > 1 && (
                <div className={s.row}>
                  <span className={s.rowLabel}>{L.factor}<small>{L.factorSub(factor.toFixed(3))}</small></span>
                  <span className={`${s.rowValue} ${s.factorValue}`}>×{factor.toFixed(3)}</span>
                </div>
              )}
              {thetaEq && legs > 1 && (
                <div className={s.row}>
                  <span className={s.rowLabel}>{L.angle}</span>
                  <span className={s.rowValue}>{isKo ? `꼭지각 ${thetaEq.apex}° · 수직 ${thetaEq.vertical}°` : `${thetaEq.apex}° incl. · ${thetaEq.horizontal}° from horiz.`}</span>
                </div>
              )}
              {legs > 1 && (
                <div className={s.row}>
                  <span className={s.rowLabel}>{L.shareRow}</span>
                  <span className={s.rowValue}>{L.shareVal(legs, n)}</span>
                </div>
              )}
            </div>

            {grade && (
              <div className={`${ui.notice} ${gradeTone} ${s.verdict}`}>
                <GradeIcon aria-hidden />
                <div><strong>{L.grades[grade][0]}</strong><span>{L.grades[grade][1]}</span></div>
              </div>
            )}

            {usage !== null && (
              <div className={`${ui.notice} ${over || grade === 'red' ? ui.red : ui.green} ${s.verdict}`} role="status">
                {over ? <XCircle aria-hidden /> : grade === 'red' ? <OctagonAlert aria-hidden /> : <CheckCircle2 aria-hidden />}
                <div>
                  <strong>{over ? L.overWll : L.okWll} · {L.usage(pct)}</strong>
                  <span>{fmtW(tension!, wUnit)} {over ? '>' : '≤'} WLL {inputW(wllNum, wllUnit)}</span>
                  {!over && grade === 'red' && <span>{L.redButOk}</span>}
                  {!over && grade !== 'red' && usage > 0.9 && <span>{L.tight}</span>}
                </div>
              </div>
            )}

            <div className={s.actions}>
              <button type="button" className={`${ui.button} ${ui.primary}`} onClick={copy} disabled={tension === null}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}{copied ? L.copied : L.copy}
              </button>
              <button type="button" className={`${ui.button} ${ui.ghost}`} onClick={reset}>
                <RotateCcw aria-hidden />{L.reset}
              </button>
            </div>
          </section>

          <p className={`${ui.notice} ${ui.amber} ${s.disclaimer}`}><AlertTriangle aria-hidden />{L.disclaimer}</p>

          <section className={`${ui.card} ${s.card}`} aria-label={L.diagram}>
            <SlingDiagram legs={legs} theta={theta ?? 0} grade={grade} title={L.diagram}
              tension={tension !== null ? fmtW(tension, wUnit) : undefined}
              load={weightOk ? inputW(w, wUnit) : undefined}
              apex={thetaEq && legs > 1 ? `${thetaEq.apex}°` : undefined} />
            {L.diagramNote(legs, n) && <p className={s.note}>{L.diagramNote(legs, n)}</p>}
          </section>
        </aside>
      </div>

      <div className={s.lower}>
        <section className={`${ui.card} ${s.card}`} aria-label={L.chart}>
          <div>
            <h2 className={ui.cardTitle}>{L.chart}</h2>
            <p className={s.note}>{L.chartSub}</p>
          </div>
          <SlingChart apex={legs > 1 && curApex !== null ? curApex : null} title={L.chart}
            labels={{ x: L.chartX, y: L.chartY, zones: L.zones, tip: L.tip, outside: L.outside }} />
        </section>

        <section className={`${ui.card} ${s.card}`} aria-label={L.table}>
          <div>
            <h2 className={ui.cardTitle}>{L.table}</h2>
            <p className={s.note}>{L.tableSub(weightOk ? inputW(w, wUnit) : '', legs, n)}</p>
          </div>
          {legs === 1 ? (
            <p className={s.zero}>{L.tableOne}</p>
          ) : (
            <table className={s.table}>
              <thead><tr>{L.tableHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {tableRows.map((r) => {
                  const th = r.apex / 2;
                  const g = angleGrade(th);
                  return (
                    <tr key={`${r.apex}${r.now ? 'n' : ''}`} className={r.now ? s.nowRow : ''}>
                      <td><span className={`${s.dotMark} ${s[`dot_${g}`]}`} aria-hidden />{deg(r.apex)}°{r.now && <small className={s.nowTag}>{L.current}</small>}</td>
                      <td>{deg(th)}°</td>
                      <td>×{angleFactor(th).toFixed(3)}</td>
                      <td>{weightOk ? fmtW(legTension(w, legs, share, th), wUnit) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {tension !== null && inputsVisible && !resultVisible && (
        <button type="button" className={`${s.mobileBar} ${grade ? s[`bar_${grade}`] : ''}`} onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <span>{L.mobileBar}{grade ? ` · ${L.grades[grade][0]}` : ''}{usage !== null ? ` · ${L.usage(pct)}` : ''}</span>
          <strong>{fmtW(tension, wUnit)}</strong>
        </button>
      )}
    </>
  );
}

