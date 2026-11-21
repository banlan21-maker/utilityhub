'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Pipette, Copy, Plus } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  FAMILIES, INCH, DRAIN_SIZES, IPC_DRAIN_SIZES, UNIT, pipeSpec, hasSize, minDrainSlope, ipcMinSlope, inPerFt, dropMm, slopeDenom,
  hydroVolume, truckPlan, velocity, smallestPipeFor, frictionKPaPer100m, dnOf, inchDims, type Family, type HydroLine, type PipeSpec,
} from '@/lib/piping';
import s from './piping.module.css';
import { ui } from '@/app/components/ui';

type Tab = 'spec' | 'slope' | 'hydro' | 'flow';
type Units = 'metric' | 'us';
type Code = 'kr' | 'ipc';

const FAMILY_TEXT: Record<Family, [string, string, string, string]> = {
  // [한국어 이름, 한국어 설명, 영어 이름, 영어 설명]
  spp: ['SPP 강관', '일반배관용 KS D 3507', 'KS SPP', 'Korea/JIS general (KS D 3507)'],
  spps: ['SPPS 강관', '압력배관용 KS D 3562', 'KS SPPS', 'Korea/JIS pressure (KS D 3562)'],
  sts: ['스테인리스 STS', 'KS D 3576 (Sch)', 'KS Stainless', 'Korea/JIS (KS D 3576)'],
  su: ['스테인리스 Su', '얇은 관 KS D 3595', 'KS Stainless Su', 'Light-wall (KS D 3595)'],
  asme: ['ASME B36.10', '미국 규격 탄소강', 'Steel pipe', 'ASME B36.10 (NPS)'],
  copper: ['동관 ASTM B88', '미국 Type K·L·M', 'Copper tube', 'ASTM B88 Type K/L/M'],
  pvc: ['PVC ASTM D1785', '미국 Sch40·80', 'PVC pipe', 'ASTM D1785 Sch40/80'],
};
const ORDER_KO: Family[] = ['spp', 'spps', 'sts', 'su', 'asme', 'copper', 'pvc'];
const ORDER_EN: Family[] = ['asme', 'copper', 'pvc', 'spp', 'spps', 'sts', 'su'];
const PAGE_URL = 'https://www.theutilhub.com/{locale}/utilities/utility/piping-calc';

const dec = (raw: string) => {
  const [int, ...d] = raw.replace(/[^0-9.]/g, '').split('.');
  return d.length ? `${int}.${d.join('').slice(0, 3)}` : int;
};
const num = (v: string) => Number(v) || 0;
/** 규격 치수 표기: 1 → 1.0, 34 → 34.0 */
const dim = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(Math.round(n * 1000) / 1000));
const firstSch = (f: Family) => FAMILIES[f].schedules.includes('Sch40') ? 'Sch40' : FAMILIES[f].schedules.includes('L') ? 'L' : FAMILIES[f].schedules[0];
const firstSize = (f: Family, sch: string, prefer: string[]) => prefer.find(z => hasSize(f, z, sch)) ?? FAMILIES[f].sizes.find(z => hasSize(f, z, sch)) ?? FAMILIES[f].sizes[0];

export default function PipingCalcClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const fx = (n: number, d = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const ORDER = isKo ? ORDER_KO : ORDER_EN;

  const [tab, setTab] = useState<Tab>('spec');
  const [copied, setCopied] = useState('');
  // 영문 페이지는 미국 단위·규격으로 시작 (언제든 바꿀 수 있다)
  const [units, setUnits] = useState<Units>(isKo ? 'metric' : 'us');
  const us = units === 'us';

  // 규격 조회
  const [family, setFamily] = useState<Family>(isKo ? 'spp' : 'asme');
  const [size, setSize] = useState(isKo ? '100A' : '50A');
  const [sch, setSch] = useState(isKo ? '-' : 'Sch40');

  // 구배
  const [code, setCode] = useState<Code>(isKo ? 'kr' : 'ipc');
  const [drainSize, setDrainSize] = useState(isKo ? '100A' : '3"');
  const [slopeMode, setSlopeMode] = useState<'toDrop' | 'toSlope'>('toDrop');
  const [lenText, setLenText] = useState(isKo ? '15' : '40');
  // 미국 단위에서는 in/ft, 미터법에서는 1/N의 N
  const [denomText, setDenomText] = useState(isKo ? '100' : '0.125');
  const [dropText, setDropText] = useState(isKo ? '150' : '5');

  // 수압
  const [lines, setLines] = useState<(HydroLine & { lenText: string })[]>(isKo ? [
    { family: 'spps', size: '100A', sch: 'Sch40', lengthM: 50, lenText: '50' },
    { family: 'spp', size: '50A', sch: '-', lengthM: 120, lenText: '120' },
  ] : [
    { family: 'asme', size: '100A', sch: 'Sch40', lengthM: 150 / UNIT.ftPerM, lenText: '150' },
    { family: 'copper', size: 'CU2', sch: 'L', lengthM: 400 / UNIT.ftPerM, lenText: '400' },
  ]);
  const [margin, setMargin] = useState(10);

  // 유속
  const [flowText, setFlowText] = useState(isKo ? '100' : '25');
  const [flowUnit, setFlowUnit] = useState<'lpm' | 'm3h' | 'gpm'>(isKo ? 'lpm' : 'gpm');
  const [vmax, setVmax] = useState(isKo ? 2 : 8 / UNIT.ftsPerMs);
  const [flowFamily, setFlowFamily] = useState<Family>(isKo ? 'spp' : 'copper');
  const [flowSch, setFlowSch] = useState(isKo ? '-' : 'L');
  const [hwC, setHwC] = useState<number | null>(null); // null = 관 종류 기본값

  const familyName = (f: Family) => (isKo ? FAMILY_TEXT[f][0] : FAMILY_TEXT[f][2]);
  const schName = (x: string) => (x === '-' ? '' : FAMILIES.copper.schedules.includes(x) && x.length === 1 ? `Type ${x}` : x);
  /** 호칭 표기: 한국은 15A, 영어는 NPS 인치(1/2")를 앞에 */
  const sizeName = (f: Family, z: string) => {
    if (f === 'copper') return FAMILIES.copper.inch![z];
    if (f === 'su') return z;
    if (isKo) return z;
    return INCH[z] ? `${INCH[z]}` : z;
  };
  const sizeSub = (f: Family, z: string) => {
    if (f === 'copper') return `OD ${us ? `${+(FAMILIES.copper.od[z] / UNIT.mmPerIn).toFixed(3)}"` : `${fx(FAMILIES.copper.od[z], 1)} mm`}`;
    if (f === 'su') return undefined;
    if (isKo) return INCH[z];
    return f === 'asme' || f === 'pvc' ? dnOf(z) ?? undefined : z;
  };

  // 단위 환산 표기
  const lenU = us ? 'in' : 'mm';
  // 규격 치수: 미국 단위는 인치 원표 값(2.375"), 미터법은 mm 표 값
  const dOD = (sp: PipeSpec) => (us ? fx(inchDims(sp.family, sp.size, sp.sch)!.od, 3) : dim(sp.od));
  const dT = (sp: PipeSpec) => (us ? fx(inchDims(sp.family, sp.size, sp.sch)!.t, 3) : dim(sp.t));
  const dID = (sp: PipeSpec) => (us ? fx(inchDims(sp.family, sp.size, sp.sch)!.id, 3) : fx(sp.id, 1));
  const wt = (kgm: number) => (us ? fx(kgm * UNIT.lbftPerKgm, 3) : fx(kgm, 2));
  const wtU = us ? 'lb/ft' : 'kg/m';
  const wat = (lpm: number) => fx(us ? (lpm * UNIT.galPerL) / UNIT.ftPerM : lpm, us ? 3 : 2);
  const watU = us ? 'gal/ft' : 'L/m';
  const vel = (ms: number) => fx(us ? ms * UNIT.ftsPerMs : ms, 2);
  const velU = us ? 'ft/s' : 'm/s';
  // 작은 값은 자릿수를 늘려 0.0으로 뭉개지지 않게
  const fric = (kpa100: number) => { const v = us ? kpa100 * UNIT.psi100ftPerKPa100m : kpa100; return fx(v, v >= 10 ? 1 : v >= 1 ? 2 : 3); };
  const fricU = us ? 'psi/100 ft' : 'kPa/100 m';

  const pickFamily = (f: Family, cur: string, setF: (x: Family) => void, setS: (x: string) => void, setSz?: (x: string) => void) => {
    setF(f);
    const nextSch = firstSch(f);
    setS(nextSch);
    if (setSz && !hasSize(f, cur, nextSch)) setSz(firstSize(f, nextSch, f === 'copper' ? ['CU3/4'] : ['50A']));
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(`${text}\n${PAGE_URL.replace('{locale}', locale)}`); setCopied(L('✓ 복사했습니다', '✓ Copied')); }
    catch { setCopied(L('복사하지 못했습니다', 'Could not copy')); }
    setTimeout(() => setCopied(''), 2000);
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void, unit: string) => (
    <div className={ui.field}>
      <label className={ui.label} htmlFor={id}>{label}</label>
      <div className={ui.inputGroup}>
        <input id={id} className={ui.input} inputMode="decimal" value={value} onChange={e => set(dec(e.target.value))} />
        <span className={ui.unit}>{unit}</span>
      </div>
    </div>
  );
  const chip = <T extends string | number>(cur: T, val: T, set: (v: T) => void, label: string, sub?: string, disabled = false) => (
    <button key={String(val)} type="button" aria-pressed={cur === val} disabled={disabled}
      className={`${ui.chip} ${s.chip} ${cur === val ? ui.chipActive : ''}`} onClick={() => set(val)}>
      {label}{sub && <small>{sub}</small>}
    </button>
  );
  const familyChips = (cur: Family, onPick: (f: Family) => void) => (
    <div className={ui.chips}>
      {ORDER.map(f => chip(cur, f, onPick, familyName(f), isKo ? FAMILY_TEXT[f][1] : FAMILY_TEXT[f][3]))}
    </div>
  );
  const schChips = (f: Family, cur: string, set: (x: string) => void, forSize?: string) => FAMILIES[f].schedules[0] === '-' ? null : (
    <div className={ui.field}>
      <span className={ui.label}>{f === 'copper' ? L('타입 (두께)', 'Type (wall)') : L('스케줄', 'Schedule')}</span>
      <div className={ui.chips}>{FAMILIES[f].schedules.map(x => chip(cur, x, set, schName(x), undefined, forSize ? !hasSize(f, forSize, x) : false))}</div>
    </div>
  );

  // ── 규격 조회
  const spec = pipeSpec(family, size, sch);
  const specRows = FAMILIES[family].sizes.map(z => pipeSpec(family, z, sch)).filter((x): x is PipeSpec => !!x);

  // ── 구배 (내부 계산은 m·mm, 미국 단위는 ft·in로 입력)
  const drainSizes = code === 'kr' ? DRAIN_SIZES : IPC_DRAIN_SIZES;
  const minDen = code === 'kr' ? minDrainSlope(drainSize) : ipcMinSlope(drainSize);
  const lenM = us ? num(lenText) / UNIT.ftPerM : num(lenText);
  // 미국 단위면 구배 칸은 in/ft, 단차 칸은 inch
  const denIn = us ? (num(denomText) > 0 ? 12 / num(denomText) : 0) : num(denomText);
  const dropIn = us ? num(dropText) * UNIT.mmPerIn : num(dropText);
  const den = slopeMode === 'toDrop' ? denIn : (dropIn > 0 ? slopeDenom(lenM, dropIn) : 0);
  const drop = slopeMode === 'toDrop' ? (den > 0 ? dropMm(lenM, den) : 0) : dropIn;
  const slopeOk = den > 0 && den <= minDen + 1e-9;
  const slopeReady = lenM > 0 && den > 0;
  const switchCode = (c: Code) => {
    setCode(c);
    setDrainSize(c === 'kr' ? '100A' : '3"');
    if (slopeMode === 'toDrop') setDenomText(us ? (c === 'kr' ? '0.12' : '0.125') : (c === 'kr' ? '100' : '96'));
  };
  const switchUnits = (u: Units) => {
    if (u === units) return;
    setUnits(u);
    // 입력값을 새 단위로 바꿔 둔다
    const toUs = u === 'us';
    const l = num(lenText), d = num(denomText), dr = num(dropText);
    if (l) setLenText(String(Math.round((toUs ? l * UNIT.ftPerM : l / UNIT.ftPerM) * 10) / 10));
    if (d) setDenomText(String(toUs ? Math.round((12 / d) * 1000) / 1000 : Math.round(12 / d)));
    if (dr) setDropText(String(Math.round((toUs ? dr / UNIT.mmPerIn : dr * UNIT.mmPerIn) * 100) / 100));
    setLines(ls => ls.map(x => ({ ...x, lenText: x.lengthM ? String(Math.round((toUs ? x.lengthM * UNIT.ftPerM : x.lengthM) * 10) / 10) : x.lenText })));
    if (toUs && flowUnit !== 'gpm') { setFlowText(String(Math.round(lpmNow * UNIT.gpmPerLpm * 10) / 10)); setFlowUnit('gpm'); }
    if (!toUs && flowUnit === 'gpm') { setFlowText(String(Math.round(lpmNow * 10) / 10)); setFlowUnit('lpm'); }
  };

  // ── 수압
  const hydro = hydroVolume(lines, margin);
  const trucks = truckPlan(hydro.tons);
  const updateLine = (i: number, patch: Partial<HydroLine & { lenText: string }>) => setLines(ls => ls.map((l, j) => {
    if (j !== i) return l;
    const next = { ...l, ...patch };
    if (patch.family) { next.sch = firstSch(patch.family); if (!hasSize(next.family, next.size, next.sch)) next.size = firstSize(next.family, next.sch, ['50A', 'CU1']); }
    if (patch.sch && !hasSize(next.family, next.size, next.sch)) next.size = firstSize(next.family, next.sch, []);
    if (patch.lenText !== undefined) next.lengthM = us ? num(patch.lenText) / UNIT.ftPerM : num(patch.lenText);
    return next;
  }));

  // ── 유속·마찰 손실
  const lpmNow = flowUnit === 'lpm' ? num(flowText) : flowUnit === 'm3h' ? (num(flowText) * 1000) / 60 : num(flowText) / UNIT.gpmPerLpm;
  const lpm = lpmNow;
  const C = hwC ?? FAMILIES[flowFamily].hwC;
  const best = lpm > 0 ? smallestPipeFor(lpm, vmax, flowFamily, flowSch) : null;
  const flowRows = FAMILIES[flowFamily].sizes.map(z => pipeSpec(flowFamily, z, flowSch)).filter((x): x is PipeSpec => !!x);
  const vmaxChoices = us ? [5, 6, 8, 10].map(v => v / UNIT.ftsPerMs) : [1.5, 2, 2.5, 3];

  const titleStr = L('배관 종합 계산기', 'Pipe Size, Slope & Flow Calculator');
  const descStr = L(
    'SPP·SPPS·스테인리스·ASME·동관·PVC 규격(외경·두께·내경·중량), 배수 구배, 수압 테스트 물량, 유량별 유속·마찰 손실과 관경을 한곳에서 계산합니다.',
    'Pipe dimensions and weights for steel (ASME B36.10), copper (ASTM B88 K/L/M) and PVC, drain slope to IPC, hydro-test water volume, and flow velocity with Hazen-Williams friction loss — in US or metric units.',
  );

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Pipette />} title={titleStr} subtitle={descStr} />

      <div className={`${ui.chips} ${s.units}`} role="group" aria-label={L('단위', 'Units')}>
        {chip(units, 'metric', switchUnits, L('미터법', 'Metric'), 'mm · kg · L · m/s')}
        {chip(units, 'us', switchUnits, L('미국 단위', 'US units'), 'in · lb · gal · ft/s')}
      </div>

      <div className={`${ui.segmented} ${s.tabs}`} role="tablist">
        {([
          ['spec', L('규격 조회', 'Pipe specs'), L('외경·두께·중량', 'OD, wall, weight')],
          ['slope', L('배수 구배', 'Drain slope'), L('단차·최소 구배', 'drop, minimum')],
          ['hydro', L('수압 물량', 'Hydro test'), L('물 L·톤·물차', 'water volume')],
          ['flow', L('유량·유속', 'Flow & sizing'), L('관경·마찰 손실', 'velocity, friction')],
        ] as [Tab, string, string][]).map(([k, t, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`${ui.segment} ${tab === k ? ui.segmentActive : ''}`} onClick={() => setTab(k)}>
            {t}<small>{sub}</small>
          </button>
        ))}
      </div>

      {tab === 'spec' && (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('관 종류와 호칭', 'Pipe type and size')}</h2>
            {familyChips(family, f => pickFamily(f, size, setFamily, setSch, setSize))}
            <div className={ui.field}>
              <span className={ui.label}>{family === 'copper' ? L('호칭 (외경 = 호칭 + 1/8")', 'Nominal size (OD = nominal + 1/8")') : L('호칭', isKo ? 'Nominal size' : (family === 'asme' || family === 'pvc' ? 'Nominal pipe size (NPS)' : 'Nominal size (A = DN)'))}</span>
              <div className={s.size_grid}>
                {FAMILIES[family].sizes.map(z => chip(size, z, setSize, sizeName(family, z), sizeSub(family, z), !hasSize(family, z, sch)))}
              </div>
            </div>
            {schChips(family, sch, setSch, size)}
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            {!spec ? <p className={s.hint}>{L('이 호칭에는 해당 스케줄이 없습니다.', 'This size is not made in this schedule.')}</p> : (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{familyName(family)} {sizeName(family, size)} {schName(sch)}</div>
                  <div className={ui.resultValue}>{dID(spec)}<span className={s.hero_unit}>{lenU}</span></div>
                  <div className={s.hero_sub}>{L('내경', 'Inside diameter')} = {L('외경', 'OD')} {dOD(spec)} − 2 × {L('두께', 'wall')} {dT(spec)}</div>
                </div>
                <div className={s.stats}>
                  <div className={s.stat}><div className={s.stat_num}>{dOD(spec)}</div><div className={s.stat_label}>{L('외경', 'OD')} {lenU}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{dT(spec)}</div><div className={s.stat_label}>{L('두께', 'Wall')} {lenU}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{wt(spec.kgPerM)}</div><div className={s.stat_label}>{wtU}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{wat(spec.litersPerM)}</div><div className={s.stat_label}>{L('물', 'Water')} {watU}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{us ? fx(spec.flowArea / (UNIT.mmPerIn ** 2), 3) : fx(spec.flowArea, 0)}</div><div className={s.stat_label}>{L('유로 단면적', 'Bore area')} {us ? 'in²' : '㎟'}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{us ? fx(spec.id, 1) : (family === 'su' ? '-' : FAMILIES[family].inch?.[size] ?? INCH[size] ?? '-')}</div><div className={s.stat_label}>{us ? L('내경 mm', 'ID mm') : L('인치', 'Inch')}</div></div>
                </div>
                <button type="button" className={`${ui.button} ${ui.secondary} ${s.btn}`} onClick={() => copy(`${familyName(family)} ${sizeName(family, size)} ${schName(sch)}\n${L('외경', 'OD')} ${dOD(spec)} / ${L('두께', 'wall')} ${dT(spec)} / ${L('내경', 'ID')} ${dID(spec)} ${lenU}\n${wt(spec.kgPerM)} ${wtU}, ${L('물', 'water')} ${wat(spec.litersPerM)} ${watU}`)}>
                  <Copy size={16} />{copied || L('결과 복사', 'Copy')}
                </button>
                <p className={s.hint}>{L(
                  `${family === 'copper' ? '구리 밀도 8.94' : family === 'pvc' ? 'PVC 밀도 1.40' : family === 'sts' || family === 'su' ? '스테인리스 밀도 7.93' : '탄소강 밀도 7.85'} g/㎤ 기준 계산 중량입니다.${family === 'asme' || family === 'pvc' ? ' ASME·PVC는 외경이 KS와 달라(15A = 21.3mm) 같은 호칭이라도 부속 호환에 주의하세요.' : ''}`,
                  `Weight calculated from density ${family === 'copper' ? '8.94' : family === 'pvc' ? '1.40' : family === 'sts' || family === 'su' ? '7.93' : '7.85'} g/cm³.${family === 'asme' || family === 'pvc' ? ' PVC Sch40/80 shares the steel OD and wall, so the same size fits the same outside dimensions.' : ''}${family === 'copper' ? ' Type K is the heaviest wall (underground, high pressure), Type L is the usual choice for water supply, Type M is the lightest.' : ''}${['spp', 'spps', 'sts', 'su'].includes(family) ? ' Korean/JIS pipe ODs differ from ASME (DN15 = 21.7 mm vs 21.3 mm); do not mix fittings.' : ''}`,
                )}</p>
              </>
            )}
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L(`규격표 — ${familyName(family)} ${schName(sch)}`, `Table — ${familyName(family)} ${schName(sch)}`)}</h2>
            <div className={s.table_wrap}>
              <table className={s.table}>
                <thead><tr><th>{L('호칭', 'Size')}</th><th>{L('외경', 'OD')} {lenU}</th><th>{L('두께', 'Wall')} {lenU}</th><th>{L('내경', 'ID')} {lenU}</th><th>{wtU}</th><th>{watU}</th></tr></thead>
                <tbody>
                  {specRows.map(r => (
                    <tr key={r.size} className={r.size === size ? s.row_on : ''}>
                      <td>{sizeName(family, r.size)}</td><td>{dOD(r)}</td><td>{dT(r)}</td><td>{dID(r)}</td><td>{wt(r.kgPerM)}</td><td>{wat(r.litersPerM)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'slope' && (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('기준과 배수관 관경', 'Code and drain size')}</h2>
            <div className={ui.chips}>
              {chip(code, 'kr', switchCode, L('한국 기준', 'Korea'), L('기계설비 기술기준', 'mechanical code manual'))}
              {chip(code, 'ipc', switchCode, L('미국 IPC', 'US — IPC'), 'Table 704.1')}
            </div>
            <div className={s.size_grid}>{drainSizes.map(z => chip(drainSize, z, setDrainSize, z, code === 'kr' ? `1/${minDrainSlope(z)}` : `${inPerFt(ipcMinSlope(z))}"/ft`))}</div>
            <p className={s.hint}>{code === 'kr'
              ? L('칸 아래 숫자는 오·배수 수평관 최소 구배입니다(기계설비 기술기준 매뉴얼: 65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200).', 'Minimum slope for horizontal waste pipes in the Korean mechanical code manual: ≤65A 1/50, 80–150A 1/100, ≥200A 1/200.')
              : L('미국 국제배관코드(IPC) Table 704.1: 2-1/2" 이하 1/4 inch/ft(2%), 3~6" 1/8 inch/ft(1%), 8" 이상 1/16 inch/ft(0.5%). 주(州)·시 개정판이 다를 수 있습니다.', 'International Plumbing Code Table 704.1: 2-1/2" and smaller 1/4 inch per foot (2%), 3" to 6" 1/8 inch per foot (1%), 8" and larger 1/16 inch per foot (0.5%). Check your state or local amendments; UPC jurisdictions may differ.')}</p>
            <div className={ui.chips}>
              {chip(slopeMode, 'toDrop', setSlopeMode, L('구배 → 단차', 'Slope → drop'))}
              {chip(slopeMode, 'toSlope', setSlopeMode, L('단차 → 구배', 'Drop → slope'))}
            </div>
            <div className={s.grid2}>
              {field('sl-len', L('수평 길이', 'Run length'), lenText, setLenText, us ? 'ft' : 'm')}
              {slopeMode === 'toDrop'
                ? field('sl-den', us ? L('구배', 'Slope') : L('구배 1/N 의 N', 'Slope 1/N'), denomText, setDenomText, us ? 'in/ft' : `1/${denomText || 'N'}`)
                : field('sl-drop', L('높이 차(단차)', 'Height drop'), dropText, setDropText, us ? 'in' : 'mm')}
            </div>
            {slopeMode === 'toDrop' && <div className={ui.chips}>{us
              ? [['0.25', '1/4"/ft'], ['0.125', '1/8"/ft'], ['0.0625', '1/16"/ft']].map(([v, lbl]) => chip(denomText, v, setDenomText, lbl))
              : [50, 100, 150, 200].map(n => chip(denomText, String(n), setDenomText, `1/${n}`))}</div>}
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            {!slopeReady ? <p className={s.hint}>{L('길이와 구배(또는 단차)를 넣으세요.', 'Enter length and slope or drop.')}</p> : (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{slopeMode === 'toDrop' ? L('끝점이 시작점보다 낮아야 할 높이', 'Drop over the run') : L('구배', 'Slope')}</div>
                  <div className={ui.resultValue}>{slopeMode === 'toDrop'
                    ? <>{us ? fx(drop / UNIT.mmPerIn, 2) : fx(drop, 1)}<span className={s.hero_unit}>{us ? 'in' : 'mm'}</span></>
                    : us ? <>{fx(inPerFt(den), 3)}<span className={s.hero_unit}>in/ft</span></> : <>1/{fx(den, 0)}</>}</div>
                  <div className={s.hero_sub}>{us
                    ? `1/${fx(den, 0)} · ${fx(100 / den, 2)}% · ${fx(1000 / den, 1)} mm/m`
                    : L(`1m당 ${fx(1000 / den, 1)}mm · ${fx(100 / den, 2)}%`, `${fx(1000 / den, 1)} mm per m · ${fx(100 / den, 2)}% · ${fx(inPerFt(den), 3)} in/ft`)}</div>
                </div>
                <div className={`${ui.notice} ${slopeOk ? ui.green : ui.red} ${s.judge}`}>
                  {slopeOk
                    ? L(`✓ ${drainSize} 최소 구배 ${code === 'kr' ? `1/${minDen}` : `${inPerFt(minDen)}"/ft`} 이상입니다.`, `✓ Meets the ${drainSize} minimum of ${code === 'kr' ? `1/${minDen}` : `${inPerFt(minDen)} in/ft`}.`)
                    : L(`✕ ${drainSize}는 최소 ${code === 'kr' ? `1/${minDen}` : `${inPerFt(minDen)}"/ft`}이 필요합니다. ${us ? `${fx(lenM * UNIT.ftPerM, 1)}ft` : `${fx(lenM, 1)}m`}라면 단차를 ${us ? `${fx(dropMm(lenM, minDen) / UNIT.mmPerIn, 2)}in` : `${fx(dropMm(lenM, minDen), 0)}mm`} 이상 주세요.`,
                      `✕ ${drainSize} needs at least ${code === 'kr' ? `1/${minDen}` : `${inPerFt(minDen)} in/ft`}: a ${us ? `${fx(lenM * UNIT.ftPerM, 1)} ft` : `${fx(lenM, 1)} m`} run needs ${us ? `${fx(dropMm(lenM, minDen) / UNIT.mmPerIn, 2)} in` : `${fx(dropMm(lenM, minDen), 0)} mm`} of drop.`)}
                </div>
                <div className={s.viz}>
                  <svg viewBox="0 0 400 130" role="img" aria-label={L('구배 그림', 'Slope sketch')}>
                    <line x1={30} y1={40} x2={370} y2={40} className={s.sv_level} />
                    <line x1={30} y1={40} x2={370} y2={90} className={s.sv_pipe} />
                    <line x1={385} y1={40} x2={385} y2={90} className={s.sv_dim} />
                    <text x={378} y={70} textAnchor="end" className={s.sv_text}>{us ? `${fx(drop / UNIT.mmPerIn, 1)}"` : `${fx(drop, 0)}mm`}</text>
                    <text x={200} y={120} textAnchor="middle" className={s.sv_muted}>{us ? `${fx(lenM * UNIT.ftPerM, 1)} ft · ${fx(inPerFt(den), 3)} in/ft` : `${fx(lenM, 1)} m · 1/${fx(den, 0)}`} ({L('기울기는 과장해 그림', 'exaggerated')})</text>
                  </svg>
                </div>
                <p className={s.hint}>{L('기준은 건물 안 오·배수 수평관입니다. 우수관·에어컨 드레인은 설계도서와 제조사 설치 설명서를 따르세요.', 'Applies to horizontal drainage piping inside buildings. Storm drains and condensate lines follow their own rules and the drawings.')}</p>
              </>
            )}
          </section>
        </>
      )}

      {tab === 'hydro' && (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('시험할 배관 (관경별로 한 줄씩)', 'Pipes under test (one line per size)')}</h2>
            {lines.map((l, i) => (
              <div key={i} className={s.line}>
                <div className={ui.field}>
                  <span className={ui.label}>{L('관 종류', 'Type')}</span>
                  <select className={ui.input} value={l.family} onChange={e => updateLine(i, { family: e.target.value as Family })} aria-label={L('관 종류', 'Type')}>
                    {ORDER.map(f => <option key={f} value={f}>{familyName(f)}</option>)}
                  </select>
                </div>
                <div className={ui.field}>
                  <span className={ui.label}>{L('호칭', 'Size')}</span>
                  <select className={ui.input} value={l.size} onChange={e => updateLine(i, { size: e.target.value })} aria-label={L('호칭', 'Size')}>
                    {FAMILIES[l.family].sizes.filter(z => hasSize(l.family, z, l.sch)).map(z => <option key={z} value={z}>{sizeName(l.family, z)}</option>)}
                  </select>
                </div>
                <div className={ui.field}>
                  <span className={ui.label}>{L('스케줄', 'Sch')}</span>
                  <select className={ui.input} value={l.sch} onChange={e => updateLine(i, { sch: e.target.value })} disabled={FAMILIES[l.family].schedules[0] === '-'} aria-label={L('스케줄', 'Schedule')}>
                    {FAMILIES[l.family].schedules.map(x => <option key={x} value={x}>{x === '-' ? L('단일', 'n/a') : schName(x)}</option>)}
                  </select>
                </div>
                <div className={ui.field}>
                  <span className={ui.label}>{L('길이', 'Length')}</span>
                  <div className={ui.inputGroup}>
                    <input className={ui.input} inputMode="decimal" value={l.lenText} onChange={e => updateLine(i, { lenText: dec(e.target.value) })} aria-label={L('길이', 'Length')} />
                    <span className={ui.unit}>{us ? 'ft' : 'm'}</span>
                  </div>
                </div>
                <button type="button" className={s.del_btn} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} aria-label={L('줄 삭제', 'Remove line')} disabled={lines.length === 1}>✕</button>
              </div>
            ))}
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.btn}`} onClick={() => setLines(ls => [...ls, isKo ? { family: 'spp', size: '25A', sch: '-', lengthM: 0, lenText: '' } : { family: 'copper', size: 'CU1', sch: 'L', lengthM: 0, lenText: '' }])}><Plus size={14} />{L('관경 추가', 'Add line')}</button>
            <div className={ui.field}>
              <span className={ui.label}>{L('여유분 (부속·공기빼기·보충)', 'Allowance (fittings, venting, top-up)')}</span>
              <div className={ui.chips}>{[0, 10, 15, 20].map(p => chip(margin, p, setMargin, `${p}%`))}</div>
            </div>
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            {hydro.netL <= 0 ? <p className={s.hint}>{L('길이를 넣으면 물량이 나옵니다.', 'Enter lengths to see the volume.')}</p> : (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{L(`필요 물량 (여유 ${margin}% 포함)`, `Water needed (+${margin}%)`)}</div>
                  <div className={ui.resultValue}>{us ? fx(hydro.totalL * UNIT.galPerL, 0) : fx(hydro.tons, 2)}<span className={s.hero_unit}>{us ? 'US gal' : L('톤', 't')}</span></div>
                  <div className={s.hero_sub}>{us
                    ? `${fx(hydro.totalL, 0)} L · ${fx(hydro.totalL / 1000, 2)} m³ · ${fx(hydro.totalL * UNIT.galPerL / 7.48052, 1)} ft³`
                    : <>{fx(hydro.totalL, 0)} L · {fx(hydro.totalL / 1000, 2)} ㎥{isKo && <> · 물차 {trucks.map(t => `${t.size}톤${t.count > 1 ? ` × ${t.count}회` : ''}`).join(' + ')}</>}{!isKo && <> · {fx(hydro.totalL * UNIT.galPerL, 0)} US gal</>}</>}</div>
                </div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('배관', 'Pipe')}</th><th>{L('내경', 'ID')} {lenU}</th><th>{watU}</th><th>{L('길이', 'Length')}</th><th>{us ? 'gal' : 'L'}</th></tr></thead>
                    <tbody>
                      {hydro.rows.map((r, i) => (
                        <tr key={i}>
                          <td>{familyName(r.family)} {sizeName(r.family, r.size)} {schName(r.sch)}</td>
                          <td>{r.spec ? dID(r.spec) : '-'}</td>
                          <td>{r.spec ? wat(r.spec.litersPerM) : '-'}</td>
                          <td>{us ? `${fx(r.lengthM * UNIT.ftPerM, 0)} ft` : `${fx(r.lengthM, 1)} m`}</td>
                          <td>{fx(us ? r.liters * UNIT.galPerL : r.liters, 0)}</td>
                        </tr>
                      ))}
                      <tr className={s.row_on}><td>{L('합계 (여유 전)', 'Total (net)')}</td><td /><td /><td /><td>{fx(us ? hydro.netL * UNIT.galPerL : hydro.netL, 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <button type="button" className={`${ui.button} ${ui.secondary} ${s.btn}`} onClick={() => copy(L(
                  `[수압 테스트 물량]\n${hydro.rows.map(r => `${familyName(r.family)} ${sizeName(r.family, r.size)} ${schName(r.sch)} ${fx(r.lengthM, 1)}m: ${fx(r.liters, 0)}L`).join('\n')}\n합계 ${fx(hydro.netL, 0)}L + 여유 ${margin}% = ${fx(hydro.totalL, 0)}L (${fx(hydro.tons, 2)}톤)`,
                  `[Hydro test water]\n${hydro.rows.map(r => `${familyName(r.family)} ${sizeName(r.family, r.size)} ${schName(r.sch)}, ${us ? `${fx(r.lengthM * UNIT.ftPerM, 0)} ft` : `${fx(r.lengthM, 1)} m`}: ${us ? `${fx(r.liters * UNIT.galPerL, 0)} gal` : `${fx(r.liters, 0)} L`}`).join('\n')}\nTotal with ${margin}% allowance: ${fx(hydro.totalL * UNIT.galPerL, 0)} US gal (${fx(hydro.totalL, 0)} L)`,
                ))}><Copy size={16} />{copied || L('결과 복사', 'Copy')}</button>
              </>
            )}
          </section>
        </>
      )}

      {tab === 'flow' && (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('유량과 관 종류', 'Flow and pipe type')}</h2>
            <div className={s.grid2}>
              {field('fl-q', L('유량', 'Flow rate'), flowText, setFlowText, flowUnit === 'lpm' ? 'L/min' : flowUnit === 'm3h' ? '㎥/h' : 'GPM')}
              <div className={ui.field}>
                <span className={ui.label}>{L('단위', 'Unit')}</span>
                <div className={ui.chips}>{chip(flowUnit, 'gpm', setFlowUnit, 'GPM')}{chip(flowUnit, 'lpm', setFlowUnit, 'L/min')}{chip(flowUnit, 'm3h', setFlowUnit, '㎥/h')}</div>
              </div>
            </div>
            {familyChips(flowFamily, f => { pickFamily(f, '', setFlowFamily, setFlowSch); setHwC(null); })}
            {schChips(flowFamily, flowSch, setFlowSch)}
            <div className={ui.field}>
              <span className={ui.label}>{L('허용 최대 유속', 'Maximum velocity')}</span>
              <div className={ui.chips}>{vmaxChoices.map(v => chip(Math.round(vmax * 1000), Math.round(v * 1000), () => setVmax(v), `${vel(v).replace(/\.00$/, '').replace(/\.0$/, '')} ${velU}`))}</div>
              <p className={s.hint}>{L('급수 배관은 보통 0.5~2 m/s 범위로 잡습니다(BS EN 805 권장). 소방 배관 등은 해당 화재안전기준의 유속 제한을 따르세요.', 'Domestic water is commonly kept at or below 5–8 ft/s (1.5–2.4 m/s) to limit noise and erosion — copper hot water lines are often held to about 5 ft/s. Fire protection follows its own codes.')}</p>
            </div>
            <div className={ui.field}>
              <span className={ui.label}>{L(`Hazen-Williams 계수 C = ${C}`, `Hazen-Williams C = ${C}`)}</span>
              <div className={ui.chips}>{[100, 120, 130, 140, 150].map(c => chip(C, c, v => setHwC(v), String(c), c === FAMILIES[flowFamily].hwC ? L('기본', 'default') : c === 100 ? L('오래된 강관', 'old steel') : undefined))}</div>
            </div>
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            {lpm <= 0 ? <p className={s.hint}>{L('유량을 넣으세요.', 'Enter a flow rate.')}</p> : (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{L(`유속 ${vel(vmax)} ${velU} 이하가 되는 최소 관경`, `Smallest pipe at ≤ ${vel(vmax)} ${velU}`)}</div>
                  <div className={ui.resultValue}>{best ? sizeName(flowFamily, best.size) : L('없음', 'None')}</div>
                  <div className={s.hero_sub}>{best
                    ? `${familyName(flowFamily)} ${schName(flowSch)} · ${L('내경', 'ID')} ${dID(best)} ${lenU} · ${vel(velocity(lpm, best))} ${velU} · ${L('마찰', 'friction')} ${fric(frictionKPaPer100m(lpm, best, C))} ${fricU}`
                    : L('표의 가장 큰 관으로도 부족합니다.', 'Even the largest size is too small.')}</div>
                </div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('호칭', 'Size')}</th><th>{L('내경', 'ID')} {lenU}</th><th>{L('유속', 'Velocity')} {velU}</th><th>{L('마찰 손실', 'Friction')} {fricU}</th></tr></thead>
                    <tbody>
                      {flowRows.map(r => {
                        const v = velocity(lpm, r);
                        return (
                          <tr key={r.size} className={best?.size === r.size ? s.row_on : ''}>
                            <td>{sizeName(flowFamily, r.size)}</td><td>{dID(r)}</td>
                            <td className={v <= vmax ? s.cell_ok : s.cell_bad}>{vel(v)}</td>
                            <td>{fric(frictionKPaPer100m(lpm, r, C))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className={s.hint}>{L(
                  `유속 = 유량 ÷ 관 내부 단면적. ${fx(lpm, 1)} L/min = ${fx((lpm * 60) / 1000, 2)} ㎥/h = ${fx(lpm * UNIT.gpmPerLpm, 1)} GPM. 마찰 손실은 상온 물 기준 Hazen-Williams 식(직관)이며 엘보·밸브 등 부속 손실은 따로 더하세요.`,
                  `Velocity = flow ÷ bore area. ${fx(lpm * UNIT.gpmPerLpm, 1)} GPM = ${fx(lpm, 1)} L/min. Friction is the Hazen-Williams loss for straight pipe with water near room temperature; add equivalent lengths for elbows, tees and valves.`,
                )}</p>
              </>
            )}
          </section>
        </>
      )}

      <p className={s.disclaimer}>{L('규격 값은 KS(JIS)·ASME·ASTM 치수표를 옮긴 것이며, 발주·설계 전에는 제조사 규격서와 설계도서로 최종 확인하세요.', 'Dimensions are transcribed from ASME B36.10, ASTM B88, ASTM D1785 and KS (JIS) tables; confirm with manufacturer data and your local code before ordering or installing.')}</p>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/piping-calc" />

      {seo}
    </div>
  );
}
