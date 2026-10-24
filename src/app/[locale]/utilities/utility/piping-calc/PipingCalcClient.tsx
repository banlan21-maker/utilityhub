'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Pipette, Copy, Plus } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  FAMILIES, INCH, DRAIN_SIZES, pipeSpec, hasSize, minDrainSlope, dropMm, slopeDenom,
  hydroVolume, truckPlan, velocity, smallestPipeFor, type Family, type HydroLine,
} from '@/lib/piping';
import s from './piping.module.css';

type Tab = 'spec' | 'slope' | 'hydro' | 'flow';

const FAMILY_TEXT: Record<Family, [string, string, string, string]> = {
  // [한국어 이름, 한국어 설명, 영어 이름, 영어 설명]
  spp: ['SPP 강관', '일반배관용 KS D 3507', 'SPP', 'KS D 3507 general'],
  spps: ['SPPS 강관', '압력배관용 KS D 3562', 'SPPS', 'KS D 3562 pressure'],
  sts: ['스테인리스 STS', 'KS D 3576 (Sch)', 'Stainless', 'KS D 3576 schedule'],
  su: ['스테인리스 Su', '얇은 관 KS D 3595', 'Stainless Su', 'KS D 3595 light'],
  asme: ['ASME B36.10', '미국 규격 탄소강', 'ASME B36.10', 'US carbon steel'],
};
const FAMILY_ORDER: Family[] = ['spp', 'spps', 'sts', 'su', 'asme'];
const PAGE_URL = 'https://www.theutilhub.com/{locale}/utilities/utility/piping-calc';

const dec = (raw: string) => {
  const [int, ...d] = raw.replace(/[^0-9.]/g, '').split('.');
  return d.length ? `${int}.${d.join('').slice(0, 3)}` : int;
};
const num = (v: string) => Number(v) || 0;
/** 규격 치수 표기: 1 → 1.0, 34 → 34.0 */
const dim = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
/** 스케줄을 바꿀 때 그 규격에 없는 호칭이면 가까운 것으로 */
const firstSch = (f: Family) => FAMILIES[f].schedules.includes('Sch40') ? 'Sch40' : FAMILIES[f].schedules[0];

export default function PipingCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const fx = (n: number, d = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  const [tab, setTab] = useState<Tab>('spec');
  const [copied, setCopied] = useState('');

  // 규격 조회
  const [family, setFamily] = useState<Family>('spp');
  const [size, setSize] = useState('100A');
  const [sch, setSch] = useState('-');

  // 구배
  const [drainSize, setDrainSize] = useState('100A');
  const [slopeMode, setSlopeMode] = useState<'toDrop' | 'toSlope'>('toDrop');
  const [lenText, setLenText] = useState('15');
  const [denomText, setDenomText] = useState('100');
  const [dropText, setDropText] = useState('150');

  // 수압
  const [lines, setLines] = useState<(HydroLine & { lenText: string })[]>([
    { family: 'spps', size: '100A', sch: 'Sch40', lengthM: 50, lenText: '50' },
    { family: 'spp', size: '50A', sch: '-', lengthM: 120, lenText: '120' },
  ]);
  const [margin, setMargin] = useState(10);

  // 유속
  const [flowText, setFlowText] = useState('100');
  const [flowUnit, setFlowUnit] = useState<'lpm' | 'm3h'>('lpm');
  const [vmax, setVmax] = useState(2);
  const [flowFamily, setFlowFamily] = useState<Family>('spp');
  const [flowSch, setFlowSch] = useState('-');

  const familyName = (f: Family) => (isKo ? FAMILY_TEXT[f][0] : FAMILY_TEXT[f][2]);
  const schName = (x: string) => (x === '-' ? '' : x);

  const pickFamily = (f: Family, cur: string, setF: (x: Family) => void, setS: (x: string) => void, setSize?: (x: string) => void) => {
    setF(f);
    const nextSch = firstSch(f);
    setS(nextSch);
    if (setSize && !hasSize(f, cur, nextSch)) setSize(FAMILIES[f].sizes.find(z => hasSize(f, z, nextSch)) ?? FAMILIES[f].sizes[0]);
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(`${text}\n${PAGE_URL.replace('{locale}', locale)}`); setCopied(L('✓ 복사했습니다', '✓ Copied')); }
    catch { setCopied(L('복사하지 못했습니다', 'Could not copy')); }
    setTimeout(() => setCopied(''), 2000);
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void, unit: string) => (
    <div className={s.field}>
      <label className={s.field_label} htmlFor={id}>{label}</label>
      <div className={s.input_wrap}>
        <input id={id} className={s.input} inputMode="decimal" value={value} onChange={e => set(dec(e.target.value))} />
        <span className={s.unit}>{unit}</span>
      </div>
    </div>
  );
  const chip = <T extends string | number>(cur: T, val: T, set: (v: T) => void, label: string, sub?: string, disabled = false) => (
    <button key={String(val)} type="button" aria-pressed={cur === val} disabled={disabled}
      className={`${s.chip} ${cur === val ? s.chip_on : ''}`} onClick={() => set(val)}>
      {label}{sub && <small>{sub}</small>}
    </button>
  );
  const familyChips = (cur: Family, onPick: (f: Family) => void) => (
    <div className={s.chips}>
      {FAMILY_ORDER.map(f => chip(cur, f, onPick, familyName(f), isKo ? FAMILY_TEXT[f][1] : FAMILY_TEXT[f][3]))}
    </div>
  );
  const schChips = (f: Family, cur: string, set: (x: string) => void, forSize?: string) => FAMILIES[f].schedules[0] === '-' ? null : (
    <div>
      <span className={s.label}>{L('스케줄', 'Schedule')}</span>
      <div className={s.chips}>{FAMILIES[f].schedules.map(x => chip(cur, x, set, x, undefined, forSize ? !hasSize(f, forSize, x) : false))}</div>
    </div>
  );

  // ── 규격 조회
  const spec = pipeSpec(family, size, sch);
  const specRows = FAMILIES[family].sizes.map(z => pipeSpec(family, z, sch)).filter(Boolean);

  // ── 구배
  const minDen = minDrainSlope(drainSize);
  const lenM = num(lenText);
  const den = slopeMode === 'toDrop' ? num(denomText) : (num(dropText) > 0 ? slopeDenom(lenM, num(dropText)) : 0);
  const drop = slopeMode === 'toDrop' ? (den > 0 ? dropMm(lenM, den) : 0) : num(dropText);
  const slopeOk = den > 0 && den <= minDen + 1e-9;
  const slopeReady = lenM > 0 && den > 0;

  // ── 수압
  const hydro = hydroVolume(lines, margin);
  const trucks = truckPlan(hydro.tons);
  const updateLine = (i: number, patch: Partial<HydroLine & { lenText: string }>) => setLines(ls => ls.map((l, j) => {
    if (j !== i) return l;
    const next = { ...l, ...patch };
    if (patch.family) { next.sch = firstSch(patch.family); if (!hasSize(next.family, next.size, next.sch)) next.size = FAMILIES[next.family].sizes.find(z => hasSize(next.family, z, next.sch)) ?? next.size; }
    if (patch.sch && !hasSize(next.family, next.size, next.sch)) next.size = FAMILIES[next.family].sizes.find(z => hasSize(next.family, z, next.sch)) ?? next.size;
    if (patch.lenText !== undefined) next.lengthM = num(patch.lenText);
    return next;
  }));

  // ── 유속
  const lpm = flowUnit === 'lpm' ? num(flowText) : (num(flowText) * 1000) / 60;
  const best = lpm > 0 ? smallestPipeFor(lpm, vmax, flowFamily, flowSch) : null;
  const flowRows = FAMILIES[flowFamily].sizes.map(z => pipeSpec(flowFamily, z, flowSch)).filter(Boolean);

  const titleStr = L('배관 종합 계산기', 'Piping Calculator');
  const descStr = L('SPP·SPPS·스테인리스 강관 규격(외경·두께·내경·kg/m), 배수 구배, 수압 테스트 물량, 유량별 유속과 관경을 한곳에서 계산합니다.', 'KS pipe dimensions and weights, drain slope, hydro-test water volume and flow velocity in one place.');

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><Pipette size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      <div className={s.tabs} role="tablist">
        {([
          ['spec', L('규격 조회', 'Pipe specs'), L('외경·두께·중량', 'OD, wall, kg/m')],
          ['slope', L('배수 구배', 'Drain slope'), L('단차·최소 구배', 'drop, minimum')],
          ['hydro', L('수압 물량', 'Hydro test'), L('물 L·톤·물차', 'water volume')],
          ['flow', L('유량·유속', 'Flow velocity'), L('관경 고르기', 'pipe sizing')],
        ] as [Tab, string, string][]).map(([k, t, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`${s.tab} ${tab === k ? s.tab_on : ''}`} onClick={() => setTab(k)}>
            {t}<small>{sub}</small>
          </button>
        ))}
      </div>

      {tab === 'spec' && (
        <>
          <section className={s.card}>
            <h2 className={s.card_title}>{L('관 종류와 호칭', 'Pipe type and size')}</h2>
            {familyChips(family, f => pickFamily(f, size, setFamily, setSch, setSize))}
            <div>
              <span className={s.label}>{L('호칭', 'Nominal size')}</span>
              <div className={s.size_grid}>
                {FAMILIES[family].sizes.map(z => chip(size, z, setSize, z, FAMILIES[family].inch?.[z] ?? (family === 'su' ? undefined : INCH[z]), !hasSize(family, z, sch)))}
              </div>
            </div>
            {schChips(family, sch, setSch, size)}
          </section>

          <section className={s.card} aria-live="polite">
            {!spec ? <p className={s.hint}>{L('이 호칭에는 해당 스케줄이 없습니다.', 'This size is not made in this schedule.')}</p> : (
              <>
                <div className={s.hero}>
                  <div className={s.hero_label}>{familyName(family)} {size} {schName(sch)}</div>
                  <div className={s.hero_num}>{fx(spec.id, 1)}<span className={s.hero_unit}>mm</span></div>
                  <div className={s.hero_sub}>{L('내경', 'Inside diameter')} = {L('외경', 'OD')} {dim(spec.od)} − 2 × {L('두께', 'wall')} {dim(spec.t)}</div>
                </div>
                <div className={s.stats}>
                  <div className={s.stat}><div className={s.stat_num}>{dim(spec.od)}</div><div className={s.stat_label}>{L('외경 mm', 'OD mm')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{dim(spec.t)}</div><div className={s.stat_label}>{L('두께 mm', 'Wall mm')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{fx(spec.kgPerM, 2)}</div><div className={s.stat_label}>kg/m</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{fx(spec.litersPerM, 2)}</div><div className={s.stat_label}>{L('1m당 물 L', 'Water L/m')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{fx(spec.flowArea, 0)}</div><div className={s.stat_label}>{L('유로 단면적 ㎟', 'Bore area mm²')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{family === 'su' ? '-' : INCH[size] ?? '-'}</div><div className={s.stat_label}>{L('인치', 'Inch')}</div></div>
                </div>
                <button type="button" className={s.btn} onClick={() => copy(`${familyName(family)} ${size} ${schName(sch)}\n${L('외경', 'OD')} ${spec.od} / ${L('두께', 'wall')} ${spec.t} / ${L('내경', 'ID')} ${fx(spec.id, 1)} mm\n${fx(spec.kgPerM, 2)} kg/m, ${L('물', 'water')} ${fx(spec.litersPerM, 2)} L/m`)}>
                  <Copy size={16} />{copied || L('결과 복사', 'Copy')}
                </button>
                <p className={s.hint}>{L(
                  `${family === 'sts' || family === 'su' ? '스테인리스 밀도 7.93' : '탄소강 밀도 7.85'} g/㎤ 기준 계산 중량입니다.${family === 'asme' ? ' ASME는 외경이 KS와 달라(15A = 21.3mm) 같은 호칭이라도 부속 호환에 주의하세요.' : ''}`,
                  `Weight from density ${family === 'sts' || family === 'su' ? '7.93' : '7.85'} g/cm³.${family === 'asme' ? ' ASME outside diameters differ from KS (15A = 21.3 mm).' : ''}`,
                )}</p>
              </>
            )}
          </section>

          <section className={s.card}>
            <h2 className={s.card_title}>{L(`규격표 — ${familyName(family)} ${schName(sch)}`, `Table — ${familyName(family)} ${schName(sch)}`)}</h2>
            <div className={s.table_wrap}>
              <table className={s.table}>
                <thead><tr><th>{L('호칭', 'Size')}</th><th>{L('외경', 'OD')}</th><th>{L('두께', 'Wall')}</th><th>{L('내경', 'ID')}</th><th>kg/m</th><th>{L('물 L/m', 'L/m')}</th></tr></thead>
                <tbody>
                  {specRows.map(r => (
                    <tr key={r!.size} className={r!.size === size ? s.row_on : ''}>
                      <td>{r!.size}</td><td>{dim(r!.od)}</td><td>{dim(r!.t)}</td><td>{fx(r!.id, 1)}</td><td>{fx(r!.kgPerM, 2)}</td><td>{fx(r!.litersPerM, 2)}</td>
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
          <section className={s.card}>
            <h2 className={s.card_title}>{L('배수관 관경', 'Drain size')}</h2>
            <div className={s.size_grid}>{DRAIN_SIZES.map(z => chip(drainSize, z, setDrainSize, z, `1/${minDrainSlope(z)}`))}</div>
            <p className={s.hint}>{L('칸 아래 숫자는 오·배수 수평관 최소 구배입니다(기계설비 기술기준 매뉴얼: 65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200).', 'Numbers show the minimum slope for horizontal waste pipes (Korean mechanical code manual: ≤65A 1/50, 80–150A 1/100, ≥200A 1/200).')}</p>
            <div className={s.chips}>
              {chip(slopeMode, 'toDrop', setSlopeMode, L('구배 → 단차', 'Slope → drop'))}
              {chip(slopeMode, 'toSlope', setSlopeMode, L('단차 → 구배', 'Drop → slope'))}
            </div>
            <div className={s.grid2}>
              {field('sl-len', L('수평 길이', 'Run length'), lenText, setLenText, 'm')}
              {slopeMode === 'toDrop'
                ? field('sl-den', L('구배 1/N 의 N', 'Slope 1/N'), denomText, setDenomText, `1/${denomText || 'N'}`)
                : field('sl-drop', L('높이 차(단차)', 'Height drop'), dropText, setDropText, 'mm')}
            </div>
            {slopeMode === 'toDrop' && <div className={s.chips}>{[50, 100, 150, 200].map(n => chip(denomText, String(n), setDenomText, `1/${n}`))}</div>}
          </section>

          <section className={s.card} aria-live="polite">
            {!slopeReady ? <p className={s.hint}>{L('길이와 구배(또는 단차)를 넣으세요.', 'Enter length and slope or drop.')}</p> : (
              <>
                <div className={s.hero}>
                  <div className={s.hero_label}>{slopeMode === 'toDrop' ? L('끝점이 시작점보다 낮아야 할 높이', 'Drop over the run') : L('구배', 'Slope')}</div>
                  <div className={s.hero_num}>{slopeMode === 'toDrop' ? <>{fx(drop, 1)}<span className={s.hero_unit}>mm</span></> : <>1/{fx(den, 0)}</>}</div>
                  <div className={s.hero_sub}>{L(`1m당 ${fx(1000 / den, 1)}mm · ${fx(100 / den, 2)}%`, `${fx(1000 / den, 1)} mm per m · ${fx(100 / den, 2)}%`)}</div>
                </div>
                <div className={`${s.judge} ${slopeOk ? s.judge_ok : s.judge_bad}`}>
                  {slopeOk
                    ? L(`✓ ${drainSize} 최소 구배 1/${minDen} 이상입니다.`, `✓ Meets the ${drainSize} minimum of 1/${minDen}.`)
                    : L(`✕ ${drainSize}는 최소 1/${minDen}이 필요합니다. ${fx(lenM, 1)}m라면 단차를 ${fx(dropMm(lenM, minDen), 0)}mm 이상 주세요.`, `✕ ${drainSize} needs at least 1/${minDen}: a ${fx(lenM, 1)} m run needs ${fx(dropMm(lenM, minDen), 0)} mm drop.`)}
                </div>
                <div className={s.viz}>
                  <svg viewBox="0 0 400 130" role="img" aria-label={L('구배 그림', 'Slope sketch')}>
                    <line x1={30} y1={40} x2={370} y2={40} className={s.sv_level} />
                    <line x1={30} y1={40} x2={370} y2={90} className={s.sv_pipe} />
                    <line x1={385} y1={40} x2={385} y2={90} className={s.sv_dim} />
                    <text x={378} y={70} textAnchor="end" className={s.sv_text}>{fx(drop, 0)}mm</text>
                    <text x={200} y={120} textAnchor="middle" className={s.sv_muted}>{fx(lenM, 1)} m · 1/{fx(den, 0)} ({L('기울기는 과장해 그림', 'exaggerated')})</text>
                  </svg>
                </div>
                <p className={s.hint}>{L('기준은 건물 안 오·배수 수평관입니다. 우수관·에어컨 드레인은 설계도서와 제조사 설치 설명서를 따르세요.', 'Applies to horizontal waste pipes inside buildings; follow drawings or manufacturer guides for storm and AC drains.')}</p>
              </>
            )}
          </section>
        </>
      )}

      {tab === 'hydro' && (
        <>
          <section className={s.card}>
            <h2 className={s.card_title}>{L('시험할 배관 (관경별로 한 줄씩)', 'Pipes under test (one line per size)')}</h2>
            {lines.map((l, i) => (
              <div key={i} className={s.line}>
                <div className={s.field}>
                  <span className={s.field_label}>{L('관 종류', 'Type')}</span>
                  <select className={s.select} value={l.family} onChange={e => updateLine(i, { family: e.target.value as Family })} aria-label={L('관 종류', 'Type')}>
                    {FAMILY_ORDER.map(f => <option key={f} value={f}>{familyName(f)}</option>)}
                  </select>
                </div>
                <div className={s.field}>
                  <span className={s.field_label}>{L('호칭', 'Size')}</span>
                  <select className={s.select} value={l.size} onChange={e => updateLine(i, { size: e.target.value })} aria-label={L('호칭', 'Size')}>
                    {FAMILIES[l.family].sizes.filter(z => hasSize(l.family, z, l.sch)).map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className={s.field}>
                  <span className={s.field_label}>{L('스케줄', 'Sch')}</span>
                  <select className={s.select} value={l.sch} onChange={e => updateLine(i, { sch: e.target.value })} disabled={FAMILIES[l.family].schedules[0] === '-'} aria-label={L('스케줄', 'Schedule')}>
                    {FAMILIES[l.family].schedules.map(x => <option key={x} value={x}>{x === '-' ? L('단일', 'n/a') : x}</option>)}
                  </select>
                </div>
                <div className={s.field}>
                  <span className={s.field_label}>{L('길이', 'Length')}</span>
                  <div className={s.input_wrap}>
                    <input className={s.input} inputMode="decimal" value={l.lenText} onChange={e => updateLine(i, { lenText: dec(e.target.value) })} aria-label={L('길이', 'Length')} />
                    <span className={s.unit}>m</span>
                  </div>
                </div>
                <button type="button" className={s.del_btn} onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} aria-label={L('줄 삭제', 'Remove line')} disabled={lines.length === 1}>✕</button>
              </div>
            ))}
            <button type="button" className={s.ghost} onClick={() => setLines(ls => [...ls, { family: 'spp', size: '25A', sch: '-', lengthM: 0, lenText: '' }])}><Plus size={14} />{L('관경 추가', 'Add line')}</button>
            <div>
              <span className={s.label}>{L('여유분 (부속·공기빼기·보충)', 'Allowance (fittings, venting)')}</span>
              <div className={s.chips}>{[0, 10, 15, 20].map(p => chip(margin, p, setMargin, `${p}%`))}</div>
            </div>
          </section>

          <section className={s.card} aria-live="polite">
            {hydro.netL <= 0 ? <p className={s.hint}>{L('길이를 넣으면 물량이 나옵니다.', 'Enter lengths to see the volume.')}</p> : (
              <>
                <div className={s.hero}>
                  <div className={s.hero_label}>{L(`필요 물량 (여유 ${margin}% 포함)`, `Water needed (+${margin}%)`)}</div>
                  <div className={s.hero_num}>{fx(hydro.tons, 2)}<span className={s.hero_unit}>{L('톤', 't')}</span></div>
                  <div className={s.hero_sub}>{fx(hydro.totalL, 0)} L · {fx(hydro.totalL / 1000, 2)} ㎥ · {L('물차', 'truck')} {trucks.map(t => `${t.size}${L('톤', 't')}${t.count > 1 ? ` × ${t.count}${L('회', '')}` : ''}`).join(' + ')}</div>
                </div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('배관', 'Pipe')}</th><th>{L('내경', 'ID')}</th><th>{L('물 L/m', 'L/m')}</th><th>{L('길이', 'Length')}</th><th>L</th></tr></thead>
                    <tbody>
                      {hydro.rows.map((r, i) => (
                        <tr key={i}>
                          <td>{familyName(r.family)} {r.size} {schName(r.sch)}</td>
                          <td>{r.spec ? fx(r.spec.id, 1) : '-'}</td>
                          <td>{r.spec ? fx(r.spec.litersPerM, 2) : '-'}</td>
                          <td>{fx(r.lengthM, 1)} m</td>
                          <td>{fx(r.liters, 0)}</td>
                        </tr>
                      ))}
                      <tr className={s.row_on}><td>{L('합계 (여유 전)', 'Total (net)')}</td><td /><td /><td /><td>{fx(hydro.netL, 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <button type="button" className={s.btn} onClick={() => copy(L(
                  `[수압 테스트 물량]\n${hydro.rows.map(r => `${familyName(r.family)} ${r.size} ${schName(r.sch)} ${r.lengthM}m: ${fx(r.liters, 0)}L`).join('\n')}\n합계 ${fx(hydro.netL, 0)}L + 여유 ${margin}% = ${fx(hydro.totalL, 0)}L (${fx(hydro.tons, 2)}톤)`,
                  `[Hydro test water]\n${hydro.rows.map(r => `${r.size} ${r.lengthM} m: ${fx(r.liters, 0)} L`).join('\n')}\nTotal ${fx(hydro.totalL, 0)} L (${fx(hydro.tons, 2)} t)`,
                ))}><Copy size={16} />{copied || L('결과 복사', 'Copy')}</button>
              </>
            )}
          </section>
        </>
      )}

      {tab === 'flow' && (
        <>
          <section className={s.card}>
            <h2 className={s.card_title}>{L('유량과 관 종류', 'Flow and pipe type')}</h2>
            <div className={s.grid2}>
              {field('fl-q', L('유량', 'Flow rate'), flowText, setFlowText, flowUnit === 'lpm' ? 'L/min' : '㎥/h')}
              <div className={s.field}>
                <span className={s.field_label}>{L('단위', 'Unit')}</span>
                <div className={s.chips}>{chip(flowUnit, 'lpm', setFlowUnit, 'L/min')}{chip(flowUnit, 'm3h', setFlowUnit, '㎥/h')}</div>
              </div>
            </div>
            {familyChips(flowFamily, f => pickFamily(f, '', setFlowFamily, setFlowSch))}
            {schChips(flowFamily, flowSch, setFlowSch)}
            <div>
              <span className={s.label}>{L('허용 최대 유속', 'Maximum velocity')}</span>
              <div className={s.chips}>{[1.5, 2, 2.5, 3].map(v => chip(vmax, v, setVmax, `${v} m/s`))}</div>
              <p className={s.hint}>{L('급수 배관은 보통 0.5~2 m/s 범위로 잡습니다(BS EN 805 권장). 소방 배관 등은 해당 화재안전기준의 유속 제한을 따르세요.', 'Water supply is typically sized for 0.5–2 m/s (BS EN 805). Fire systems follow their own codes.')}</p>
            </div>
          </section>

          <section className={s.card} aria-live="polite">
            {lpm <= 0 ? <p className={s.hint}>{L('유량을 넣으세요.', 'Enter a flow rate.')}</p> : (
              <>
                <div className={s.hero}>
                  <div className={s.hero_label}>{L(`유속 ${vmax} m/s 이하가 되는 최소 관경`, `Smallest pipe at ≤ ${vmax} m/s`)}</div>
                  <div className={s.hero_num}>{best ? best.size : L('없음', 'None')}</div>
                  <div className={s.hero_sub}>{best ? L(`${familyName(flowFamily)} ${schName(flowSch)} · 내경 ${fx(best.id, 1)}mm · ${fx(velocity(lpm, best), 2)} m/s`, `${familyName(flowFamily)} ${schName(flowSch)} · ID ${fx(best.id, 1)} mm · ${fx(velocity(lpm, best), 2)} m/s`) : L('표의 가장 큰 관으로도 부족합니다.', 'Even the largest size is too small.')}</div>
                </div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('호칭', 'Size')}</th><th>{L('내경 mm', 'ID mm')}</th><th>{L('유속 m/s', 'Velocity m/s')}</th></tr></thead>
                    <tbody>
                      {flowRows.map(r => {
                        const v = velocity(lpm, r!);
                        return (
                          <tr key={r!.size} className={best?.size === r!.size ? s.row_on : ''}>
                            <td>{r!.size}</td><td>{fx(r!.id, 1)}</td>
                            <td className={v <= vmax ? s.cell_ok : s.cell_bad}>{fx(v, 2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className={s.hint}>{L(`유속 = 유량 ÷ 관 내부 단면적. ${fx(lpm, 1)} L/min = ${fx((lpm * 60) / 1000, 2)} ㎥/h. 마찰 손실(수두)은 따로 검토하세요.`, `Velocity = flow ÷ bore area. Friction loss is not included.`)}</p>
              </>
            )}
          </section>
        </>
      )}

      <p className={s.disclaimer}>{L('규격 값은 KS(JIS)·ASME 치수표를 옮긴 것이며, 발주·설계 전에는 제조사 규격서와 설계도서로 최종 확인하세요.', 'Dimensions are transcribed from KS (JIS) and ASME tables; confirm with manufacturer data before ordering.')}</p>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/piping-calc" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '배관 규격표·구배·수압 물량·유속을 한 번에',
          description: '배관 종합 계산기는 현장에서 자주 찾는 강관 규격과 계산을 한곳에 모았습니다. 일반배관용 SPP(KS D 3507), 압력배관용 SPPS(KS D 3562) Sch40·80, 배관용 스테인리스 STS(KS D 3576) Sch5S·10S·20S·40·80, 얇은 스테인리스 Su관(KS D 3595), 미국 규격 ASME B36.10의 외경·두께·내경·m당 중량·1m당 물 용량을 호칭별로 보여 줍니다. 예를 들어 SPP 50A는 외경 60.5mm, 두께 3.8mm, 내경 52.9mm, 5.31 kg/m이고, 같은 50A라도 ASME는 외경이 60.3mm로 다릅니다. 배수 구배 탭에서는 관경을 고르면 기계설비 기술기준 매뉴얼의 오·배수 수평관 최소 구배(65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200)와 비교해 판정하고, 길이와 구배로 단차를, 길이와 단차로 구배를 계산합니다. 수압 테스트 탭은 관경이 섞인 배관을 줄마다 넣어 필요한 물(L·㎥·톤)과 물차 규모를 계산하며, 유량·유속 탭은 유량을 넣으면 관경별 유속을 보여 주고 허용 유속 이하가 되는 가장 작은 관을 골라 줍니다.',
          useCases: [
            { icon: '🔧', title: '현장 규격표 대신', desc: 'SPP 100A는 외경 114.3mm·두께 4.5mm·12.2 kg/m, SPPS Sch40은 두께 6.0mm처럼 관 종류와 스케줄별 치수를 바로 확인하고, 규격표 전체를 표로 보며 부속·용접 작업을 준비합니다.' },
            { icon: '📐', title: '배수관 구배 시공', desc: '100A 배수관 15m를 1/100으로 놓으면 끝점이 150mm 낮아야 하고, 50A라면 최소 1/50이라 300mm가 필요하다는 것을 관경별 기준과 함께 바로 확인합니다.' },
            { icon: '💧', title: '수압 테스트 물 준비', desc: 'SPPS 100A 50m와 SPP 50A 120m처럼 관경별로 길이를 넣으면 순 물량 약 675L, 여유 10% 포함 약 0.74톤으로 계산되어 물차를 부를지, 수돗물로 채울지 정할 수 있습니다.' },
            { icon: '🚿', title: '급수 관경 고르기', desc: '유량 100 L/min을 SPP로 보내면 25A는 유속 2.79 m/s, 32A는 1.66 m/s입니다. 허용 유속을 고르면 기준 이하가 되는 가장 작은 관경을 표와 함께 알려 줍니다.' },
          ],
          steps: [
            { step: '탭 고르기', desc: '규격 조회, 배수 구배, 수압 물량, 유량·유속 중 필요한 계산을 고릅니다. 탭마다 입력값이 따로 유지됩니다.' },
            { step: '관 종류·호칭 선택', desc: 'SPP, SPPS, 스테인리스 STS·Su, ASME 중 관 종류와 호칭, 스케줄을 고릅니다. 해당 규격에 없는 호칭·스케줄은 눌리지 않습니다.' },
            { step: '길이·구배·유량 입력', desc: '구배는 관경과 길이, 구배(또는 단차)를, 수압 물량은 관경별 길이를, 유속은 유량(L/min 또는 ㎥/h)과 허용 유속을 넣습니다.' },
            { step: '결과 확인·복사', desc: '내경·중량, 단차와 기준 판정, 물량과 물차 규모, 관경별 유속을 확인하고 결과 복사로 작업 메모나 보고에 붙여 넣습니다.' },
          ],
          faqs: [
            { q: 'SPP와 SPPS, Sch40은 무엇이 다른가요?', a: 'SPP(KS D 3507)는 급수·소화·공조 등 비교적 낮은 압력용 일반배관 강관으로 호칭마다 두께가 하나뿐입니다. SPPS(KS D 3562)는 압력배관용으로 Sch40, Sch80처럼 스케줄에 따라 두께가 정해집니다. 예를 들어 50A는 SPP 3.8mm, SPPS Sch40 3.9mm, Sch80 5.5mm입니다.' },
            { q: '같은 호칭인데 KS와 ASME 외경이 왜 다른가요?', a: 'KS(JIS) 강관은 15A 21.7mm, 150A 165.2mm처럼 외경을 정하고, 미국 ASME B36.10은 1/2인치 21.3mm, 6인치 168.3mm로 정합니다. 호칭은 같아도 외경이 달라 용접 부속이나 플랜지를 섞어 쓰면 맞지 않을 수 있으니 같은 규격끼리 맞춰야 합니다.' },
            { q: '스테인리스 Sch10S와 Sch40은 얼마나 다른가요?', a: 'KS D 3576 기준 25A는 Sch5S 1.65mm, Sch10S 2.8mm, Sch20S 3.0mm, Sch40 3.4mm입니다. 건물 급수·급탕에는 더 얇은 Su관(KS D 3595, 예: 20Su 외경 22.22mm, 두께 1.0mm)을 많이 쓰고, 공장·플랜트 배관에는 Sch10S 이상을 주로 씁니다.' },
            { q: '배수관 최소 구배는 관경에 따라 어떻게 정해지나요?', a: '기계설비 기술기준 매뉴얼은 건물 안 오·배수 수평관의 최소 구배를 65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200으로 둡니다. 관이 가늘수록 물이 얕게 흘러 오물을 밀어내기 어려우므로 더 큰 구배가 필요합니다.' },
          ],
        }}
        en={{
          title: 'Pipe dimensions, drain slope, hydro-test volume and flow velocity',
          description: 'The Piping Calculator brings together the pipe tables and calculations used most on site. It lists outside diameter, wall thickness, inside diameter, weight per metre and water per metre for SPP (KS D 3507), SPPS (KS D 3562) Sch40 and Sch80, stainless STS (KS D 3576) Sch5S to Sch80, light-wall stainless Su tube (KS D 3595) and ASME B36.10 carbon steel. SPP 50A, for example, is 60.5 mm OD with a 3.8 mm wall, 52.9 mm bore and 5.31 kg/m, while ASME 2-inch pipe has a 60.3 mm OD. The drain slope tab checks a run against the Korean minimum slopes for horizontal waste pipes (≤65A 1/50, 80–150A 1/100, ≥200A 1/200) and converts between slope and drop. The hydro-test tab adds up water for runs of mixed sizes and suggests a water-truck size, and the flow tab shows velocity for every size at a given flow and picks the smallest pipe under your velocity limit.',
          useCases: [
            { icon: '🔧', title: 'Replace the Pocket Chart', desc: 'Look up OD, wall, bore and kg/m by pipe type and schedule, with the full table on screen.' },
            { icon: '📐', title: 'Drain Slopes', desc: 'A 15 m run of 100A at 1/100 drops 150 mm; 50A needs at least 1/50, or 300 mm.' },
            { icon: '💧', title: 'Hydro-Test Water', desc: 'Enter each size and length to get litres, tonnes and the water truck to book.' },
            { icon: '🚿', title: 'Size a Supply Pipe', desc: '100 L/min runs at 2.79 m/s in SPP 25A and 1.66 m/s in 32A; pick a velocity limit to get the right size.' },
          ],
          steps: [
            { step: 'Choose a Tab', desc: 'Specs, drain slope, hydro-test volume or flow velocity; each keeps its own inputs.' },
            { step: 'Pick the Pipe', desc: 'Choose SPP, SPPS, stainless STS or Su, or ASME, then size and schedule.' },
            { step: 'Enter Lengths or Flow', desc: 'Give run length and slope or drop, lengths per size, or flow and velocity limit.' },
            { step: 'Read and Copy', desc: 'Check the result and copy it into your notes or report.' },
          ],
          faqs: [
            { q: 'What is the difference between SPP and SPPS?', a: 'SPP is general-purpose pipe with one wall per size; SPPS is pressure pipe made in schedules such as Sch40 and Sch80. 50A is 3.8 mm in SPP, 3.9 mm in Sch40 and 5.5 mm in Sch80.' },
            { q: 'Why do KS and ASME diameters differ?', a: 'KS (JIS) pipe 15A is 21.7 mm OD and 150A is 165.2 mm, while ASME 1/2" is 21.3 mm and 6" is 168.3 mm, so fittings should not be mixed.' },
            { q: 'How thick is stainless Sch10S?', a: 'Under KS D 3576, 25A is 1.65 mm in Sch5S, 2.8 mm in Sch10S, 3.0 mm in Sch20S and 3.4 mm in Sch40. Building water lines often use thinner Su tube.' },
            { q: 'What minimum slope does a drain need?', a: 'Korean guidance for horizontal waste pipes is 1/50 up to 65A, 1/100 for 80–150A and 1/200 from 200A.' },
          ],
        }}
      />
    </div>
  );
}
