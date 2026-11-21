'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Snowflake, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  calcAc, splitUnits, classToKw, SQM_PER_PYEONG, BUSINESS_EXTRA, SUN_EXTRA,
  WALL_CLASSES, STAND_CLASSES, type SpaceMode, type SunSide, type Business,
} from '@/lib/acCapacity';
import s from './ac-capacity-calc.module.css';
import { ui } from '@/app/components/ui';

const decimalInput = (v: string) => {
  const [int, ...dec] = v.replace(/[^0-9.]/g, '').split('.');
  return dec.length ? `${int}.${dec.join('').slice(0, 2)}` : int;
};

const BUSINESSES: Business[] = ['office', 'retail', 'cafe', 'salon', 'academy', 'restaurant', 'gym', 'pc_room', 'bbq'];
const SUNS: SunSide[] = ['north', 'east', 'south', 'west'];
const CEILINGS = [2.4, 2.7, 3, 3.5, 4];
const LIVING_PRESETS = [24, 32, 34, 45];
const pct = (r: number) => `+${Math.round(r * 100)}%`;

const TEXT = {
  ko: {
    title: '에어컨 평형 계산기',
    subtitle: '방·원룸, 아파트 거실, 매장의 면적과 조건으로 몇 평형 에어컨이 맞는지, 냉방능력(kW)은 얼마인지 계산합니다.',
    tabs: { room: ['방·원룸', '방 면적 = 냉방면적'], living: ['아파트 거실', '스탠드, 평형 ÷ 2'], commercial: ['매장·사무실', '업종 발열·인원'] },
    areaRoom: '냉방할 방 면적', areaCommercial: '냉방할 매장 면적', areaLiving: '아파트 평형',
    areaHintRoom: '침대·가구 포함 방 바닥 면적입니다. 방 여러 개를 한 대로 식히려면 합친 면적을 넣으세요.',
    areaHintCommercial: '주방을 뺀 홀·작업 공간 면적입니다.',
    livingHint: (supply: string, half: string) => `공급면적 약 ${supply}㎡의 절반인 ${half}㎡를 거실·주방 냉방면적으로 봅니다(제조사 안내 기준).`,
    sun: '주로 햇빛이 드는 창 방향', business: '업종', ceiling: '천장 높이', occupants: '평소 머무는 인원',
    occupantsHint: '2명까지는 기본에 포함, 그 이상은 1명당 약 120W를 더합니다.',
    conditions: '조건', suns: { north: '북향', east: '동향', south: '남향', west: '서향' },
    bigWindow: '큰 창·베란다 확장', topFloor: '꼭대기층(지붕 아래)', oldInsulation: '오래된 단열·홑창', kitchen: '거실과 이어진 주방',
    businesses: { office: '사무실', retail: '일반 매장', cafe: '카페', salon: '미용실', academy: '학원', restaurant: '식당', gym: '헬스장', pc_room: 'PC방', bbq: '고기집(직화)' },
    resultTitle: '계산 결과', recommend: '추천 제품', classUnit: '평형',
    units: { wall: '벽걸이', stand: '스탠드', multi: '여러 대로 나눠 설치' },
    unitHint: { wall: '이 크기는 벽걸이가 일반적입니다.', stand: '매장은 같은 평형의 천장형(카세트)도 고를 수 있습니다.', multi: '40평형을 넘으면 한 대로는 부족합니다.' },
    split: (n: number, c: number) => `예: ${c}평형 스탠드·천장형 ${n}대`,
    neededArea: '필요 냉방면적', capacity: '필요 냉방능력', capSub: (kcal: string) => `약 ${kcal} kcal/h`,
    pyUnit: '평', breakdown: '어디서 늘었나',
    bk: { base: '기본 면적', sun: '창 방향', bigWindow: '큰 창·확장', topFloor: '꼭대기층', insulation: '단열', kitchen: '주방', ceiling: '천장 높이', business: '업종 발열', occupants: '추가 인원' } as Record<string, string>,
    capped: '가산 비율 합계가 80%를 넘어 80%로 맞췄습니다. 이런 공간은 현장 부하 계산을 꼭 받으세요.',
    copy: '결과 복사', copied: '복사됨',
    copyText: (cls: string, sqm: string, py: string, kw: string) => `에어컨 추천: ${cls} / 필요 냉방면적 ${sqm}㎡(${py}평) / 냉방능력 약 ${kw}kW`,
    empty: '면적을 입력하면 결과가 나옵니다.',
    tableTitle: '평형별 냉방면적·냉방능력',
    tableHead: ['제품 평형', '종류', '냉방면적', '냉방능력'],
    wallLabel: '벽걸이', standLabel: '스탠드',
    source: '기준: 제품 평형 = 냉방면적 ÷ 3.3㎡, 냉방능력 ≈ 냉방면적 × 123W(제조사 사양표 6평형 18.7㎡·2.3kW, 17평형 56.9㎡·7.0kW). 거실은 공급면적의 ½ 이상, 남향·확장형은 한 단계 위(LG전자 선택 가이드). 창 방향·층·단열·업종·인원 가산은 현장 경험치이며 정밀 부하 계산을 대신하지 않습니다.',
  },
  en: {
    title: 'Air Conditioner Size Calculator',
    subtitle: 'Find the right Korean AC "pyeong class" and cooling capacity (kW) for a room, an apartment living room or a shop.',
    tabs: { room: ['Room / studio', 'Room area = cooling area'], living: ['Apartment living', 'Floor-standing, class ÷ 2'], commercial: ['Shop / office', 'Business heat, people'] },
    areaRoom: 'Room area to cool', areaCommercial: 'Shop floor area to cool', areaLiving: 'Apartment pyeong class',
    areaHintRoom: 'Floor area of the room. To cool several rooms with one unit, add their areas.',
    areaHintCommercial: 'Seating and work area, excluding the kitchen.',
    livingHint: (supply: string, half: string) => `Half of the ≈${supply}㎡ supply area (${half}㎡) is treated as the living room and kitchen, as manufacturers advise.`,
    sun: 'Direction of the main windows', business: 'Business type', ceiling: 'Ceiling height', occupants: 'People usually inside',
    occupantsHint: 'Two people are included; each extra person adds about 120 W.',
    conditions: 'Conditions', suns: { north: 'North', east: 'East', south: 'South', west: 'West' },
    bigWindow: 'Large windows / enclosed balcony', topFloor: 'Top floor (under the roof)', oldInsulation: 'Old insulation / single glazing', kitchen: 'Open kitchen',
    businesses: { office: 'Office', retail: 'Retail shop', cafe: 'Café', salon: 'Hair salon', academy: 'Tutoring academy', restaurant: 'Restaurant', gym: 'Gym', pc_room: 'PC café', bbq: 'Korean BBQ (grill)' },
    resultTitle: 'Result', recommend: 'Recommended unit', classUnit: '-pyeong class',
    units: { wall: 'Wall-mounted', stand: 'Floor-standing', multi: 'Split across several units' },
    unitHint: { wall: 'A wall-mounted unit is usual at this size.', stand: 'Shops can also use a ceiling cassette of the same class.', multi: 'Above a 40-pyeong class one unit is not enough.' },
    split: (n: number, c: number) => `e.g. ${n} × ${c}-pyeong floor or ceiling units`,
    neededArea: 'Cooling area needed', capacity: 'Cooling capacity needed', capSub: (btu: string) => `≈ ${btu} BTU/h`,
    pyUnit: 'py', breakdown: 'Where it comes from',
    bk: { base: 'Base area', sun: 'Window direction', bigWindow: 'Large windows', topFloor: 'Top floor', insulation: 'Insulation', kitchen: 'Kitchen', ceiling: 'Ceiling height', business: 'Business heat', occupants: 'Extra people' } as Record<string, string>,
    capped: 'The add-ons exceeded 80% and were capped at 80%. Get an on-site load calculation for a space like this.',
    copy: 'Copy result', copied: 'Copied',
    copyText: (cls: string, sqm: string, py: string, kw: string) => `AC: ${cls} / cooling area ${sqm}㎡ (${py} py) / about ${kw} kW`,
    empty: 'Enter an area to see the result.',
    tableTitle: 'Cooling area and capacity by class',
    tableHead: ['Class', 'Type', 'Cooling area', 'Capacity'],
    wallLabel: 'Wall', standLabel: 'Floor',
    source: 'Basis: product class = cooling area ÷ 3.3㎡; capacity ≈ cooling area × 123 W (spec sheets: 6-pyeong 18.7㎡ / 2.3 kW, 17-pyeong 56.9㎡ / 7.0 kW). Living rooms use at least half the supply area; south-facing or enclosed-balcony homes go one class up (LG Electronics buying guide). Direction, floor, insulation, business and occupancy add-ons are rules of thumb, not a full load calculation.',
  },
} as const;

export default function AcCapacityCalcClient({ seo }: { seo?: React.ReactNode }) {
  const isKo = useLocale() === 'ko';
  const T = isKo ? TEXT.ko : TEXT.en;
  const nf = (n: number, d = 1) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  const [mode, setMode] = useState<SpaceMode>('room');
  const [areaText, setAreaText] = useState('');
  const [areaUnit, setAreaUnit] = useState<'sqm' | 'pyeong'>('sqm');
  const [sun, setSun] = useState<SunSide>('east');
  const [bigWindow, setBigWindow] = useState(false);
  const [topFloor, setTopFloor] = useState(false);
  const [oldInsulation, setOldInsulation] = useState(false);
  const [kitchen, setKitchen] = useState(false);
  const [ceilingM, setCeilingM] = useState(2.4);
  const [occText, setOccText] = useState('2');
  const [business, setBusiness] = useState<Business>('cafe');
  const [copied, setCopied] = useState(false);

  const areaNum = Number(areaText) || 0;
  // 거실은 아파트 평형 그대로, 방·매장은 ㎡로 맞춰서 넘긴다
  const area = mode === 'living' ? areaNum : areaUnit === 'pyeong' ? areaNum * SQM_PER_PYEONG : areaNum;
  const r = calcAc({
    mode, area, sun, bigWindow, topFloor, oldInsulation,
    kitchen: mode === 'living' && kitchen, ceilingM, occupants: Number(occText) || 0, business,
  });

  // 가산 비율이 상한(80%)에 걸리면 항목별 몫도 같은 비율로 줄여서 보여 준다
  const extraSum = r ? r.extras.reduce((sum, e) => sum + e.ratio, 0) : 0;
  const scale = extraSum > 0 && r ? (r.factor - 1) / extraSum : 1;
  const rows = r ? [
    { key: 'base', sqm: r.baseSqm, extra: false },
    ...r.extras.map(e => ({ key: e.key, sqm: r.baseSqm * e.ratio * scale, extra: true })),
    ...(r.occupantSqm > 0 ? [{ key: 'occupants', sqm: r.occupantSqm, extra: true }] : []),
  ] : [];

  const split = r && r.productClass === null ? splitUnits(r.neededPyeong) : null;
  const classLabel = r
    ? r.productClass !== null
      ? (isKo ? `${r.productClass}평형 ${T.units[r.unit]}` : `${r.productClass}${T.classUnit} ${T.units[r.unit].toLowerCase()}`)
      : T.split(split!.count, split!.cls)
    : '';

  // 거실 스탠드는 설명이 필요 없고, 매장 스탠드에만 천장형 안내를 붙인다
  const unitHint = !r ? '' : r.unit === 'stand' ? (mode === 'commercial' ? T.unitHint.stand : '') : T.unitHint[r.unit];

  const copy = async () => {
    if (!r) return;
    try {
      await navigator.clipboard.writeText(T.copyText(classLabel, nf(r.neededSqm), nf(r.neededPyeong), nf(r.capacityKw)));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* 클립보드 권한이 없으면 무시 */ }
  };

  const toggle = (on: boolean, set: (v: boolean) => void, label: string, extra: string) => (
    <label className={`${s.toggle} ${on ? s.toggle_on : ''}`}>
      <input type="checkbox" checked={on} onChange={e => set(e.target.checked)} />
      {label}
      <small>{extra}</small>
    </label>
  );

  const livingSupply = areaNum * SQM_PER_PYEONG;
  const unitSuffix = mode === 'living' ? (isKo ? '평형' : 'py') : areaUnit === 'sqm' ? '㎡' : (isKo ? '평' : 'py');

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Snowflake />} title={T.title} subtitle={T.subtitle} />

      <div className={`${ui.segmented} ${s.tabs}`} role="tablist" aria-label={isKo ? '공간 종류' : 'Space type'}>
        {(['room', 'living', 'commercial'] as SpaceMode[]).map(m => (
          <button key={m} type="button" role="tab" aria-selected={mode === m}
            className={`${ui.segment} ${mode === m ? ui.segmentActive : ''}`}
            onClick={() => { setMode(m); setAreaText(''); }}>
            {T.tabs[m][0]}<small>{T.tabs[m][1]}</small>
          </button>
        ))}
      </div>

      <section className={`${ui.card} ${s.card}`}>
        <div className={s.grid2}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ac-area">
              {mode === 'living' ? T.areaLiving : mode === 'room' ? T.areaRoom : T.areaCommercial}
            </label>
            <div className={ui.inputGroup}>
              <input id="ac-area" className={`${ui.input} ${ui.inputLg}`} inputMode="decimal" placeholder={mode === 'living' ? '34' : areaUnit === 'sqm' ? '33' : '10'}
                value={areaText} onChange={e => setAreaText(decimalInput(e.target.value))} />
              <span className={ui.unit}>{unitSuffix}</span>
            </div>
            {mode === 'living' ? (
              <>
                <div className={ui.chips} style={{ marginTop: '0.25rem' }}>
                  {LIVING_PRESETS.map(p => (
                    <button key={p} type="button" className={`${ui.chip} ${ui.pill} ${areaText === String(p) ? ui.chipActive : ''}`} onClick={() => setAreaText(String(p))}>
                      {isKo ? `${p}평형` : `${p} py`}
                    </button>
                  ))}
                </div>
                <p className={ui.hint}>{areaNum > 0 ? T.livingHint(nf(livingSupply), nf(livingSupply / 2)) : T.livingHint('112', '56')}</p>
              </>
            ) : (
              <>
                <div className={ui.chips} style={{ marginTop: '0.25rem' }}>
                  {(['sqm', 'pyeong'] as const).map(u => (
                    <button key={u} type="button" className={`${ui.chip} ${ui.pill} ${areaUnit === u ? ui.chipActive : ''}`} onClick={() => setAreaUnit(u)}>
                      {u === 'sqm' ? '㎡' : (isKo ? '평' : 'pyeong')}
                    </button>
                  ))}
                </div>
                <p className={ui.hint}>{mode === 'room' ? T.areaHintRoom : T.areaHintCommercial}</p>
              </>
            )}
          </div>

          <div className={ui.field}>
            {mode === 'commercial' && (
              <div className={ui.field} style={{ marginBottom: '0.6rem' }}>
                <label className={ui.label} htmlFor="ac-business">{T.business}</label>
                <select id="ac-business" className={ui.input} value={business} onChange={e => setBusiness(e.target.value as Business)}>
                  {BUSINESSES.map(b => (
                    <option key={b} value={b}>{T.businesses[b]}{BUSINESS_EXTRA[b] > 0 ? ` (${pct(BUSINESS_EXTRA[b])})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            <label className={ui.label} htmlFor="ac-occ">{T.occupants}</label>
            <div className={ui.inputGroup}>
              <input id="ac-occ" className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" value={occText}
                onChange={e => setOccText(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} />
              <span className={ui.unit}>{isKo ? '명' : 'ppl'}</span>
            </div>
            <p className={ui.hint}>{T.occupantsHint}</p>
          </div>
        </div>

        <div className={ui.field}>
          <span className={ui.label}>{T.sun}</span>
          <div className={`${ui.chips} ${ui.grow}`}>
            {SUNS.map(d => (
              <button key={d} type="button" className={`${ui.chip} ${sun === d ? ui.chipActive : ''}`} onClick={() => setSun(d)} aria-pressed={sun === d}>
                {T.suns[d]}{SUN_EXTRA[d] > 0 ? ` ${pct(SUN_EXTRA[d])}` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className={ui.field}>
          <span className={ui.label}>{T.ceiling}</span>
          <div className={`${ui.chips} ${ui.grow}`}>
            {CEILINGS.map(h => (
              <button key={h} type="button" className={`${ui.chip} ${ceilingM === h ? ui.chipActive : ''}`} onClick={() => setCeilingM(h)} aria-pressed={ceilingM === h}>
                {h.toFixed(1)}m{h > 2.4 ? ` ${pct(h / 2.4 - 1)}` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className={ui.field}>
          <span className={ui.label}>{T.conditions}</span>
          <div className={s.toggles}>
            {toggle(bigWindow, setBigWindow, T.bigWindow, '+10%')}
            {toggle(topFloor, setTopFloor, T.topFloor, '+10%')}
            {toggle(oldInsulation, setOldInsulation, T.oldInsulation, '+10%')}
            {mode === 'living' && toggle(kitchen, setKitchen, T.kitchen, '+10%')}
          </div>
        </div>
      </section>

      <section className={`${ui.card} ${s.card}`} aria-live="polite">
        <h2 className={ui.cardTitle}>{T.resultTitle}</h2>
        {!r ? (
          <p className={s.hint}>{T.empty}</p>
        ) : (
          <>
            <div className={`${ui.result} ${s.hero}`}>
              <div className={ui.resultLabel}>{T.recommend}</div>
              {r.productClass !== null ? (
                <div className={ui.resultValue}>
                  {r.productClass}<span className={s.hero_unit}>{isKo ? '평형' : '-pyeong class'}</span>
                </div>
              ) : (
                <div className={ui.resultValue} style={{ fontSize: '1.6rem' }}>{T.split(split!.count, split!.cls)}</div>
              )}
              <div className={s.hero_sub}>{T.units[r.unit]}{unitHint ? ` · ${unitHint}` : ''}</div>
            </div>

            <div className={s.stats}>
              <div className={s.stat}>
                <div className={s.stat_num}>{nf(r.neededSqm)}㎡</div>
                <div className={s.stat_label}>{T.neededArea} ({nf(r.neededPyeong)}{T.pyUnit})</div>
              </div>
              <div className={s.stat}>
                <div className={s.stat_num}>{nf(r.capacityKw, 2)} kW</div>
                <div className={s.stat_label}>{T.capacity}</div>
              </div>
              <div className={s.stat}>
                <div className={s.stat_num}>{isKo ? Math.round(r.capacityKw * 860).toLocaleString('ko-KR') : Math.round(r.capacityKw * 3412).toLocaleString('en-US')}</div>
                <div className={s.stat_label}>{isKo ? 'kcal/h (1kW = 860)' : 'BTU/h (1 kW = 3,412)'}</div>
              </div>
            </div>

            <div className={ui.field}>
              <span className={ui.label}>{T.breakdown}</span>
              <div className={s.breakdown}>
                {rows.map(row => (
                  <div key={row.key} className={s.bk_row}>
                    <span>{T.bk[row.key]}</span>
                    <div className={s.bk_track}>
                      <div className={`${s.bk_fill} ${row.extra ? s.bk_fill_extra : ''}`} style={{ width: `${Math.max(2, (row.sqm / r.neededSqm) * 100)}%` }} />
                    </div>
                    <span className={s.bk_val}>{row.extra ? '+' : ''}{nf(row.sqm)}㎡</span>
                  </div>
                ))}
              </div>
            </div>

            {extraSum > 0.8 && <div className={`${ui.notice} ${ui.amber}`}>{T.capped}</div>}

            <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={copy}>
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? T.copied : T.copy}
            </button>
          </>
        )}
      </section>

      <section className={`${ui.card} ${s.card}`}>
        <h2 className={ui.cardTitle}>{T.tableTitle}</h2>
        <div className={s.table_wrap}>
          <table className={s.table}>
            <thead>
              <tr>{T.tableHead.map(h => <th key={h} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {[...WALL_CLASSES.map(c => [c, T.wallLabel] as const), ...STAND_CLASSES.map(c => [c, T.standLabel] as const)].map(([c, type]) => {
                const hit = r?.productClass === c && (type === T.standLabel) === (r.unit === 'stand');
                return (
                  <tr key={`${type}-${c}`}>
                    <td>{hit ? <strong>{c}{isKo ? '평형' : ' py'} ◀</strong> : <>{c}{isKo ? '평형' : ' py'}</>}</td>
                    <td>{type}</td>
                    <td>{nf(c * SQM_PER_PYEONG)}㎡</td>
                    <td>{nf(classToKw(c))} kW</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={s.source_note}>{T.source}</p>
      </section>

      <ShareBar title={T.title} description={T.subtitle} />
      <RelatedTools toolId="utilities/lifestyle/ac-capacity-calc" />

      {seo}
    </div>
  );
}
