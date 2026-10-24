'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Snowflake, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  calcAc, splitUnits, classToKw, SQM_PER_PYEONG, BUSINESS_EXTRA, SUN_EXTRA,
  WALL_CLASSES, STAND_CLASSES, type SpaceMode, type SunSide, type Business,
} from '@/lib/acCapacity';
import s from './ac-capacity-calc.module.css';

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

export default function AcCapacityCalcClient() {
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

      <header className={s.header}>
        <div className={s.icon_wrap}><Snowflake size={40} /></div>
        <h1 className={s.title}>{T.title}</h1>
        <p className={s.subtitle}>{T.subtitle}</p>
      </header>

      <div className={s.tabs} role="tablist" aria-label={isKo ? '공간 종류' : 'Space type'}>
        {(['room', 'living', 'commercial'] as SpaceMode[]).map(m => (
          <button key={m} type="button" role="tab" aria-selected={mode === m}
            className={`${s.tab} ${mode === m ? s.tab_active : ''}`}
            onClick={() => { setMode(m); setAreaText(''); }}>
            {T.tabs[m][0]}<small>{T.tabs[m][1]}</small>
          </button>
        ))}
      </div>

      <section className={s.card}>
        <div className={s.grid2}>
          <div>
            <label className={s.field_label} htmlFor="ac-area">
              {mode === 'living' ? T.areaLiving : mode === 'room' ? T.areaRoom : T.areaCommercial}
            </label>
            <div className={s.input_wrap}>
              <input id="ac-area" className={s.input} inputMode="decimal" placeholder={mode === 'living' ? '34' : areaUnit === 'sqm' ? '33' : '10'}
                value={areaText} onChange={e => setAreaText(decimalInput(e.target.value))} />
              <span className={s.suffix}>{unitSuffix}</span>
            </div>
            {mode === 'living' ? (
              <>
                <div className={s.chips} style={{ marginTop: '0.5rem' }}>
                  {LIVING_PRESETS.map(p => (
                    <button key={p} type="button" className={`${s.chip} ${areaText === String(p) ? s.chip_active : ''}`} onClick={() => setAreaText(String(p))}>
                      {isKo ? `${p}평형` : `${p} py`}
                    </button>
                  ))}
                </div>
                <p className={s.field_hint}>{areaNum > 0 ? T.livingHint(nf(livingSupply), nf(livingSupply / 2)) : T.livingHint('112', '56')}</p>
              </>
            ) : (
              <>
                <div className={s.chips} style={{ marginTop: '0.5rem' }}>
                  {(['sqm', 'pyeong'] as const).map(u => (
                    <button key={u} type="button" className={`${s.chip} ${areaUnit === u ? s.chip_active : ''}`} onClick={() => setAreaUnit(u)}>
                      {u === 'sqm' ? '㎡' : (isKo ? '평' : 'pyeong')}
                    </button>
                  ))}
                </div>
                <p className={s.field_hint}>{mode === 'room' ? T.areaHintRoom : T.areaHintCommercial}</p>
              </>
            )}
          </div>

          <div>
            {mode === 'commercial' && (
              <div style={{ marginBottom: '1rem' }}>
                <label className={s.field_label} htmlFor="ac-business">{T.business}</label>
                <select id="ac-business" className={s.select} value={business} onChange={e => setBusiness(e.target.value as Business)}>
                  {BUSINESSES.map(b => (
                    <option key={b} value={b}>{T.businesses[b]}{BUSINESS_EXTRA[b] > 0 ? ` (${pct(BUSINESS_EXTRA[b])})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            <label className={s.field_label} htmlFor="ac-occ">{T.occupants}</label>
            <div className={s.input_wrap}>
              <input id="ac-occ" className={s.input} inputMode="numeric" value={occText}
                onChange={e => setOccText(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} />
              <span className={s.suffix}>{isKo ? '명' : 'ppl'}</span>
            </div>
            <p className={s.field_hint}>{T.occupantsHint}</p>
          </div>
        </div>

        <div>
          <span className={s.field_label}>{T.sun}</span>
          <div className={s.chips}>
            {SUNS.map(d => (
              <button key={d} type="button" className={`${s.chip} ${sun === d ? s.chip_active : ''}`} onClick={() => setSun(d)} aria-pressed={sun === d}>
                {T.suns[d]}{SUN_EXTRA[d] > 0 ? ` ${pct(SUN_EXTRA[d])}` : ''}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={s.field_label}>{T.ceiling}</span>
          <div className={s.chips}>
            {CEILINGS.map(h => (
              <button key={h} type="button" className={`${s.chip} ${ceilingM === h ? s.chip_active : ''}`} onClick={() => setCeilingM(h)} aria-pressed={ceilingM === h}>
                {h.toFixed(1)}m{h > 2.4 ? ` ${pct(h / 2.4 - 1)}` : ''}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={s.field_label}>{T.conditions}</span>
          <div className={s.toggles}>
            {toggle(bigWindow, setBigWindow, T.bigWindow, '+10%')}
            {toggle(topFloor, setTopFloor, T.topFloor, '+10%')}
            {toggle(oldInsulation, setOldInsulation, T.oldInsulation, '+10%')}
            {mode === 'living' && toggle(kitchen, setKitchen, T.kitchen, '+10%')}
          </div>
        </div>
      </section>

      <section className={s.card} aria-live="polite">
        <h2 className={s.card_title}>{T.resultTitle}</h2>
        {!r ? (
          <p className={s.hint}>{T.empty}</p>
        ) : (
          <>
            <div className={s.hero}>
              <div className={s.hero_label}>{T.recommend}</div>
              {r.productClass !== null ? (
                <div className={s.hero_num}>
                  {r.productClass}<span className={s.hero_unit}>{isKo ? '평형' : '-pyeong class'}</span>
                </div>
              ) : (
                <div className={s.hero_num} style={{ fontSize: '1.6rem' }}>{T.split(split!.count, split!.cls)}</div>
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

            <div>
              <span className={s.field_label}>{T.breakdown}</span>
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

            {extraSum > 0.8 && <div className={s.note}>{T.capped}</div>}

            <button type="button" className={s.copy_btn} onClick={copy}>
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? T.copied : T.copy}
            </button>
          </>
        )}
      </section>

      <section className={s.card}>
        <h2 className={s.card_title}>{T.tableTitle}</h2>
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
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '에어컨 평형 계산기: 방·거실·매장에 맞는 평형과 kW',
          description: '에어컨의 "평형"은 그 제품이 식힐 수 있는 냉방면적을 3.3㎡로 나눈 값입니다. 제조사 사양표를 보면 6평형은 냉방면적 약 19㎡에 냉방능력 약 2.3kW, 17평형은 약 57㎡에 7.0kW로, 냉방면적 1㎡당 약 123W의 냉방능력이 잡혀 있습니다. 그래서 방이나 원룸은 방 면적과 같은 평형을 고르면 되지만, 아파트 거실 스탠드는 집 평형이 아니라 공급면적의 절반 이상을 기준으로 고릅니다. 34평형 아파트라면 공급면적 약 112㎡의 절반인 56㎡, 곧 17평형 스탠드가 기본이고, 남향에 베란다를 확장했다면 한 단계 위인 20평형을 봅니다. 이 계산기는 이 제조사 기준에 남향·서향 창, 큰 창과 확장 베란다, 꼭대기층, 오래된 단열, 거실과 이어진 주방, 높은 천장, 인원 수를 더해 필요한 냉방면적(㎡·평)과 냉방능력(kW·kcal/h)을 구하고, 매장에서 파는 벽걸이 6~16평형, 스탠드 15~40평형 가운데 맞는 제품을 골라 줍니다. 카페·식당·고기집·PC방·헬스장 같은 매장은 업종별 내부 발열을 반영하고, 40평형을 넘으면 몇 대로 나눠 달지 제안합니다. 창 방향·층·업종 가산치는 현장 경험치이므로, 공사가 필요한 매장은 설치 업체의 현장 부하 계산과 함께 보세요.',
          useCases: [
            { icon: '🛏️', title: '방·원룸 벽걸이 고르기', desc: '방 면적이 10평(약 33㎡)이면 10평형 벽걸이(약 4.1kW), 20㎡ 원룸이면 6평형이 기준입니다. 같은 20㎡ 원룸도 서향 꼭대기층이면 7평형으로 올라갑니다.' },
            { icon: '🛋️', title: '아파트 거실 스탠드 평형', desc: '24평형 아파트는 거실 냉방면적이 약 40㎡라 15평형, 34평형은 17평형, 45평형은 23평형 스탠드가 기본입니다. 2in1을 살 때 스탠드 평형을 정하는 데 씁니다.' },
            { icon: '☕', title: '카페·식당 매장 용량', desc: '66㎡(20평) 카페에 손님과 직원 15명이 있으면 업종 발열과 인원을 더해 필요 냉방면적이 약 89㎡, 30평형급(약 10.9kW)입니다. 천장을 3.3m로 노출하면 36평형급이 됩니다.' },
            { icon: '📋', title: '견적서·사양표 kW 비교', desc: '설치 업체 견적이나 제품 사양표의 정격 냉방능력(kW)을 결과와 견줘 봅니다. 고기집 66㎡에 30명, 천장 3m라면 약 18kW가 필요해 23평형 2대로 나눠 다는 조합이 나옵니다.' },
          ],
          steps: [
            { step: '공간 종류 고르기', desc: '침실·원룸·작은 방은 "방·원룸", 거실 스탠드는 "아파트 거실", 카페·식당·사무실처럼 사람과 기기가 많은 곳은 "매장·사무실"을 고릅니다.' },
            { step: '면적 입력', desc: '방과 매장은 냉방할 공간의 실제 바닥 면적을 ㎡나 평으로 넣고, 아파트 거실은 집의 평형(예: 34평형)을 넣으면 공급면적의 절반을 거실 냉방면적으로 잡습니다.' },
            { step: '조건 선택', desc: '창 방향, 큰 창·베란다 확장, 꼭대기층, 오래된 단열, 천장 높이, 평소 인원을 고릅니다. 매장은 업종을 고르면 주방 불과 기기에서 나오는 열이 더해집니다.' },
            { step: '결과 확인', desc: '추천 평형과 벽걸이·스탠드 구분, 필요한 냉방면적과 냉방능력(kW), 항목별로 늘어난 면적을 보고, 아래 평형별 표로 사려는 제품의 사양표와 비교합니다.' },
          ],
          faqs: [
            { q: '34평 아파트면 34평형 에어컨을 사야 하나요?', a: '아닙니다. 에어컨 평형은 그 제품이 감당하는 냉방면적이고, 거실 스탠드는 보통 거실과 주방 쪽만 맡습니다. 제조사도 아파트 거실은 공급면적의 절반 이상을 권하므로 34평형 아파트는 17평형 스탠드가 기본이고, 남향·베란다 확장형이면 18~20평형을 봅니다. 방에는 6~7평형 벽걸이를 따로 다는 것이 일반적입니다.' },
            { q: '평형과 kW는 어떻게 바꿔 보나요?', a: '제조사 사양표의 냉방면적과 정격 냉방능력을 견주면 1㎡당 약 123W입니다. 6평형(약 19.8㎡)은 약 2.4kW, 10평형은 약 4.1kW, 17평형은 약 6.9kW, 30평형은 약 12.2kW입니다. 같은 평형이라도 제품마다 조금씩 다르니 최종 비교는 사양표의 kW 숫자로 하세요.' },
            { q: '용량을 넉넉하게 사면 더 좋지 않나요?', a: '너무 크면 금방 설정 온도에 닿아 켜졌다 꺼졌다를 반복하면서 습기를 덜 빼고, 구입비도 올라갑니다. 요즘 인버터 제품은 낮은 출력으로 오래 돌 수 있어 한 단계 큰 정도는 큰 문제가 없지만, 두세 단계 이상 키우는 것은 권하지 않습니다. 결과가 두 평형 사이라면 큰 쪽을 고르면 됩니다.' },
            { q: '천장이 높으면 얼마나 더 필요한가요?', a: '식혀야 할 공기량이 늘어 그만큼 부하가 커집니다. 이 계산기는 일반 천장 2.4m를 기준으로 높이에 비례해 더하므로 2.7m는 약 12.5%, 3m는 25%, 3.6m는 50%가 늘어납니다. 노출 천장 카페나 복층 매장에서 에어컨이 약하게 느껴지는 흔한 이유입니다.' },
            { q: '보정 비율은 어디서 나온 값인가요?', a: '평형·냉방면적·kW의 관계와 거실 기준은 제조사 사양표와 LG전자 에어컨 선택 가이드를 따랐습니다. 서향 +10%, 꼭대기층 +10%, 업종 발열처럼 나머지 가산치는 설치 현장에서 흔히 쓰는 경험치입니다. 공사가 필요한 매장이나 40평형을 넘는 공간은 업체에 현장 실측과 부하 계산을 함께 요청하세요.' },
          ],
        }}
        en={{
          title: 'Air conditioner size calculator: the right class and kW',
          description: 'In Korea air conditioners are sold by "pyeong class", which is simply the cooling area divided by 3.3㎡. Spec sheets show a 6-pyeong unit covering about 19㎡ with roughly 2.3 kW of cooling and a 17-pyeong unit covering about 57㎡ with 7.0 kW, which works out to about 123 W per square metre. A bedroom or studio therefore needs a class equal to its floor area, but a living-room floor-standing unit is chosen from at least half of the apartment\'s supply area rather than the apartment class itself: a 34-pyeong apartment (about 112㎡ supply) needs a 17-pyeong unit, or a 20-pyeong unit if it faces south with an enclosed balcony. This calculator starts from that manufacturer basis and adds south or west windows, large glazing, top-floor heat, old insulation, an open kitchen, high ceilings and extra occupants. It then shows the cooling area, capacity in kW and BTU/h, and the matching wall-mounted (6–16) or floor-standing (15–40) class. Shops such as cafés, restaurants, Korean BBQ, PC cafés and gyms include business heat, and loads above a 40-pyeong class are split across several units. The add-ons are rules of thumb, so commercial installs should still get an on-site load calculation.',
          useCases: [
            { icon: '🛏️', title: 'Pick a Wall Unit for a Room', desc: 'A 33㎡ (10-pyeong) room needs a 10-pyeong wall unit of about 4.1 kW, and a 20㎡ studio a 6-pyeong unit — or 7-pyeong if it faces west on the top floor.' },
            { icon: '🛋️', title: 'Living-Room Floor Unit', desc: 'A 24-pyeong apartment needs a 15-pyeong floor unit, a 34-pyeong apartment 17, and a 45-pyeong apartment 23. Use it to choose the floor unit of a two-in-one set.' },
            { icon: '☕', title: 'Cafés and Restaurants', desc: 'A 66㎡ café with 15 people needs about 89㎡ of cooling area, a 30-pyeong class of roughly 10.9 kW, rising to a 36-pyeong class with a 3.3 m exposed ceiling.' },
            { icon: '📋', title: 'Check Quotes in kW', desc: 'Compare installer quotes or rated capacity on spec sheets. A 66㎡ BBQ restaurant with 30 people and a 3 m ceiling needs about 18 kW, for example two 23-pyeong units.' },
          ],
          steps: [
            { step: 'Choose the Space', desc: 'Use Room for bedrooms and studios, Apartment living for a floor-standing living-room unit, and Shop / office for spaces with many people or appliances.' },
            { step: 'Enter the Area', desc: 'Type the floor area in ㎡ or pyeong, or the apartment class for a living room; half of its supply area becomes the cooling area.' },
            { step: 'Set the Conditions', desc: 'Choose window direction, large windows, top floor, old insulation, ceiling height and usual occupants. For shops, pick the business type.' },
            { step: 'Read the Result', desc: 'See the recommended class and unit type, cooling area, capacity in kW, and each add-on, then compare with spec sheets in the table.' },
          ],
          faqs: [
            { q: 'Does a 34-pyeong apartment need a 34-pyeong AC?', a: 'No. The class is the area one unit can cool, and a living-room floor unit usually covers just the living room and kitchen. Manufacturers advise at least half the supply area, so a 34-pyeong apartment needs a 17-pyeong unit, or 18–20 if it faces south with an enclosed balcony. Bedrooms get separate 6–7-pyeong wall units.' },
            { q: 'How do pyeong classes convert to kW?', a: 'Comparing cooling area and rated capacity on spec sheets gives about 123 W per square metre: a 6-pyeong unit is about 2.4 kW, 10-pyeong about 4.1 kW, 17-pyeong about 6.9 kW and 30-pyeong about 12.2 kW. Models vary slightly, so compare the kW printed on the spec sheet.' },
            { q: 'Is a bigger unit always better?', a: 'An oversized unit reaches the set temperature quickly and cycles on and off, removing less humidity and costing more to buy. Modern inverter units can run slowly, so one class up is fine, but going two or three classes larger is not recommended. If the result falls between two classes, take the larger one.' },
            { q: 'Where do the add-on percentages come from?', a: 'The class, area and kW relationship and the living-room rule follow manufacturer spec sheets and LG Electronics\' buying guide. The other add-ons, such as +10% for west windows or the top floor and business heat, are common installer rules of thumb. Large shops should get an on-site survey and load calculation.' },
          ],
        }}
      />
    </div>
  );
}
