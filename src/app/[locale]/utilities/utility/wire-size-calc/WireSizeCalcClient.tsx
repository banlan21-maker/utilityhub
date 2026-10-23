'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Zap, Copy } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  calcWire, loadCurrentFromKw, voltageDropLimit, SYSTEMS, AMBIENT_TEMPS, MIN_INDOOR_SIZE,
  type Insulation, type Method, type SystemType, type Supply, type Usage,
} from '@/lib/wireSize';
import s from './wire-size-calc.module.css';

type WireKind = 'hfix' | 'cv' | 'pvc';

const WIRES: Record<WireKind, { insulation: Insulation; methods: Method[] }> = {
  // 단심 절연전선은 전선관·몰드 안에만 시설
  hfix: { insulation: 'xlpe', methods: ['A1', 'B1'] },
  cv: { insulation: 'xlpe', methods: ['B1', 'B2', 'C', 'E'] },
  pvc: { insulation: 'pvc', methods: ['A1', 'B1', 'B2', 'C', 'E'] },
};

const METHODS: Method[] = ['A1', 'B1', 'B2', 'C', 'E'];

/** 공사방법 단면 그림 */
function MethodIcon({ m }: { m: Method }) {
  const wall = <rect x="4" y="4" width="18" height="52" fill="currentColor" opacity="0.15" />;
  const wire = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="4" fill="currentColor" />;
  return (
    <svg viewBox="0 0 120 60" className={s.method_icon} aria-hidden="true">
      {m === 'A1' && (<>
        <rect x="4" y="4" width="112" height="52" rx="4" fill="currentColor" opacity="0.12" />
        <circle cx="60" cy="30" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {wire(54, 30)}{wire(66, 30)}
      </>)}
      {m === 'B1' && (<>
        {wall}
        <circle cx="62" cy="30" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {wire(56, 30)}{wire(68, 30)}
        <line x1="22" y1="30" x2="46" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      </>)}
      {m === 'B2' && (<>
        {wall}
        <circle cx="62" cy="30" r="17" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="62" cy="30" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
        {wire(58, 30)}{wire(66, 30)}
      </>)}
      {m === 'C' && (<>
        {wall}
        <circle cx="35" cy="30" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
        {wire(31, 30)}{wire(39, 30)}
        <path d="M22 18 H40 M22 42 H40" stroke="currentColor" strokeWidth="2" />
      </>)}
      {m === 'E' && (<>
        <path d="M8 22 V44 H112 V22" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {[20, 40, 60, 80, 100].map(x => <line key={x} x1={x} y1="44" x2={x} y2="48" stroke="currentColor" strokeWidth="2" />)}
        {[34, 60, 86].map(x => (
          <g key={x}><circle cx={x} cy="33" r="9" fill="none" stroke="currentColor" strokeWidth="2" />{wire(x - 3, 33)}{wire(x + 3, 33)}</g>
        ))}
      </>)}
    </svg>
  );
}

export default function WireSizeCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [system, setSystem] = useState<SystemType>('1P2W');
  const [inputMode, setInputMode] = useState<'ampere' | 'kw'>('ampere');
  const [ampText, setAmpText] = useState('');
  const [kwText, setKwText] = useState('');
  const [pf, setPf] = useState(0.9);
  const [lengthText, setLengthText] = useState('');
  const [wire, setWire] = useState<WireKind>('hfix');
  const [method, setMethod] = useState<Method>('B1');
  const [ambient, setAmbient] = useState(30);
  const [circuitsText, setCircuitsText] = useState('1');
  const [supply, setSupply] = useState<Supply>('lv');
  const [usage, setUsage] = useState<Usage>('other');
  const [dropOverride, setDropOverride] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  const loadA = inputMode === 'ampere'
    ? parseFloat(ampText) || 0
    : loadCurrentFromKw(parseFloat(kwText) || 0, system, pf);
  const lengthM = parseFloat(lengthText) || 0;
  const circuits = Math.max(1, parseInt(circuitsText, 10) || 1);
  const autoLimit = voltageDropLimit(supply, usage, lengthM);
  const dropLimit = dropOverride.trim() !== '' ? parseFloat(dropOverride) || autoLimit : autoLimit;
  const wireSpec = WIRES[wire];

  const result = loadA > 0 && lengthM > 0
    ? calcWire({ loadA, lengthM, system, insulation: wireSpec.insulation, method, ambientC: ambient, circuits, dropLimitPct: dropLimit })
    : null;

  const chooseWire = (w: WireKind) => {
    setWire(w);
    if (!WIRES[w].methods.includes(method)) setMethod(WIRES[w].methods[w === 'cv' ? 3 : 1] ?? WIRES[w].methods[0]);
  };

  const fillExample = () => {
    setSystem('1P2W'); setInputMode('ampere'); setAmpText('25'); setLengthText('15');
    setWire('hfix'); setMethod('B1'); setAmbient(35); setCircuitsText('3');
    setSupply('lv'); setUsage('other'); setDropOverride('');
  };

  const methodName = (m: Method) => ({
    A1: isKo ? '단열벽 속 전선관' : 'Conduit in insulated wall',
    B1: isKo ? '전선관·몰드 속 전선' : 'Single cores in conduit',
    B2: isKo ? '전선관 속 다심케이블' : 'Multi-core cable in conduit',
    C: isKo ? '벽·천장에 케이블 직접 고정' : 'Cable clipped to wall',
    E: isKo ? '통풍형 트레이 위 다심케이블' : 'Multi-core on perforated tray',
  })[m];

  const wireName = (w: WireKind) => ({
    hfix: isKo ? 'HFIX 전선 (90°C)' : 'HFIX wire (90°C)',
    cv: isKo ? 'CV·F-CV 케이블 (90°C)' : 'CV / F-CV cable (90°C)',
    pvc: isKo ? 'PVC 계열 NR·VCT (70°C)' : 'PVC types NR / VCT (70°C)',
  })[w];

  const systemName = (k: SystemType) => ({
    '1P2W': isKo ? '단상 2선식 220V' : 'Single-phase 2-wire 220 V',
    '1P3W': isKo ? '단상 3선식 220/440V' : 'Single-phase 3-wire 220/440 V',
    '3P3W_220': isKo ? '삼상 3선식 220V' : '3-phase 3-wire 220 V',
    '3P3W_380': isKo ? '삼상 3선식 380V' : '3-phase 3-wire 380 V',
    '3P4W': isKo ? '삼상 4선식 380/220V' : '3-phase 4-wire 380/220 V',
  })[k];

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      `[${isKo ? '전선 굵기 산정 결과' : 'Wire Size Result'}]`,
      `${systemName(system)} · ${isKo ? '부하전류' : 'Load'} ${loadA.toFixed(1)}A · ${isKo ? '편도' : 'one-way'} ${lengthM}m`,
      `${wireName(wire)} · ${method} ${methodName(method)} · ${ambient}°C · ${circuits}${isKo ? '회로' : ' circuit(s)'}`,
      `${isKo ? '권장 굵기' : 'Recommended'}: ${result.recommended ?? '-'} mm²`,
      `${isKo ? '차단기' : 'Breaker'}: ${result.breakerA ?? '-'}A · IZ ${result.izA?.toFixed(1) ?? '-'}A`,
      `${isKo ? '전압강하' : 'Voltage drop'}: ${result.dropV?.toFixed(2) ?? '-'}V (${result.dropPct?.toFixed(2) ?? '-'}% / ${isKo ? '한도' : 'limit'} ${dropLimit.toFixed(2)}%)`,
      `theutilhub.com/${locale}/utilities/utility/wire-size-calc`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMsg(isKo ? '✓ 복사됨' : '✓ Copied');
    } catch {
      setCopyMsg(isKo ? '복사 실패 — 직접 선택해 복사하세요' : 'Copy failed — select and copy manually');
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const titleStr = isKo ? '전선 굵기 계산기 (KEC 허용전류·전압강하)' : 'Wire Size Calculator (KEC ampacity & voltage drop)';
  const descStr = isKo
    ? '부하전류와 거리, 전선 종류와 공사방법을 넣으면 차단기 정격, 허용전류, 전압강하를 모두 만족하는 전선 굵기(㎟)를 계산합니다.'
    : 'Enter load, length, wire type and installation method to get the conductor size that satisfies breaker rating, ampacity and voltage drop.';

  const maxBar = result ? Math.max(result.sizeByAmpacity ?? 300, result.sizeByDrop ?? 300, result.sizeByMin) : 1;
  const barPct = (v: number | null) => `${Math.max(6, ((v ?? 300) / maxBar) * 100)}%`;
  const izOk = result?.izA != null && result.breakerA != null && result.izA >= result.breakerA;

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><Zap size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      {/* ── 부하 ── */}
      <section className={s.card}>
        <div className={s.step_label}>STEP 1</div>
        <h2 className={s.card_title}>{isKo ? '전원과 부하' : 'Supply and load'}</h2>
        <button type="button" className={s.example_btn} onClick={fillExample}>
          {isKo ? '예시 채우기: 분전반 → 에어컨 25A, 15m, 같은 관 3회로' : 'Example: panel → A/C 25 A, 15 m, 3 circuits in one conduit'}
        </button>
        <div>
          <label className={s.field_label} htmlFor="ws-system">{isKo ? '전기 방식' : 'System'}</label>
          <select id="ws-system" className={s.select} value={system} onChange={e => setSystem(e.target.value as SystemType)}>
            {(Object.keys(SYSTEMS) as SystemType[]).map(k => <option key={k} value={k}>{systemName(k)}</option>)}
          </select>
        </div>
        <div className={s.chips} role="group" aria-label={isKo ? '부하 입력 방식' : 'Load input'}>
          <button type="button" className={`${s.chip} ${inputMode === 'ampere' ? s.chip_active : ''}`} aria-pressed={inputMode === 'ampere'} onClick={() => setInputMode('ampere')}>
            {isKo ? '전류(A)로 입력' : 'Current (A)'}
          </button>
          <button type="button" className={`${s.chip} ${inputMode === 'kw' ? s.chip_active : ''}`} aria-pressed={inputMode === 'kw'} onClick={() => setInputMode('kw')}>
            {isKo ? '용량(kW)으로 입력' : 'Power (kW)'}
          </button>
        </div>
        <div className={s.grid2}>
          {inputMode === 'ampere' ? (
            <div>
              <label className={s.field_label} htmlFor="ws-amp">{isKo ? '부하전류 IB (A)' : 'Load current IB (A)'}</label>
              <input id="ws-amp" className={s.input} type="number" inputMode="decimal" min="0" placeholder={isKo ? '예: 25' : 'e.g. 25'}
                value={ampText} onChange={e => setAmpText(e.target.value)} />
            </div>
          ) : (
            <>
              <div>
                <label className={s.field_label} htmlFor="ws-kw">{isKo ? '부하 용량 (kW)' : 'Load (kW)'}</label>
                <input id="ws-kw" className={s.input} type="number" inputMode="decimal" min="0" placeholder={isKo ? '예: 5' : 'e.g. 5'}
                  value={kwText} onChange={e => setKwText(e.target.value)} />
                {loadA > 0 && <p className={s.field_hint}>{isKo ? `환산 전류 ${loadA.toFixed(1)}A` : `= ${loadA.toFixed(1)} A`}</p>}
              </div>
              <div>
                <label className={s.field_label} htmlFor="ws-pf">{isKo ? '역률' : 'Power factor'}</label>
                <select id="ws-pf" className={s.select} value={pf} onChange={e => setPf(Number(e.target.value))}>
                  {[1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7].map(v => <option key={v} value={v}>{v.toFixed(2)}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className={s.field_label} htmlFor="ws-len">{isKo ? '배선 길이 (편도, m)' : 'Cable length (one-way, m)'}</label>
            <input id="ws-len" className={s.input} type="number" inputMode="decimal" min="0" placeholder={isKo ? '예: 35' : 'e.g. 35'}
              value={lengthText} onChange={e => setLengthText(e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── 전선과 공사방법 ── */}
      <section className={s.card}>
        <div className={s.step_label}>STEP 2</div>
        <h2 className={s.card_title}>{isKo ? '전선 종류와 공사방법' : 'Wire type and installation'}</h2>
        <div className={s.chips} role="radiogroup" aria-label={isKo ? '전선 종류' : 'Wire type'}>
          {(Object.keys(WIRES) as WireKind[]).map(w => (
            <button key={w} type="button" role="radio" aria-checked={wire === w}
              className={`${s.chip} ${wire === w ? s.chip_active : ''}`} onClick={() => chooseWire(w)}>
              {wireName(w)}
            </button>
          ))}
        </div>
        <div className={s.method_grid} role="radiogroup" aria-label={isKo ? '공사방법' : 'Installation method'}>
          {METHODS.map(m => {
            const allowed = wireSpec.methods.includes(m);
            return (
              <button key={m} type="button" role="radio" aria-checked={method === m} disabled={!allowed}
                className={`${s.method_card} ${method === m ? s.method_active : ''}`} onClick={() => setMethod(m)}>
                <MethodIcon m={m} />
                <span className={s.method_code}>{isKo ? `공사방법 ${m}` : `Method ${m}`}</span>
                <span className={s.method_name}>{methodName(m)}</span>
              </button>
            );
          })}
        </div>
        {wire === 'hfix' && (
          <p className={s.field_hint}>{isKo ? '절연전선(HFIX)은 전선관이나 몰드 안에만 시설할 수 있어 A1·B1만 선택됩니다.' : 'Insulated wires (HFIX) must run in conduit, so only A1 and B1 apply.'}</p>
        )}
        <div className={s.grid2}>
          <div>
            <label className={s.field_label} htmlFor="ws-amb">{isKo ? '주위온도 (°C)' : 'Ambient temperature (°C)'}</label>
            <select id="ws-amb" className={s.select} value={ambient} onChange={e => setAmbient(Number(e.target.value))}>
              {AMBIENT_TEMPS.map(t => <option key={t} value={t}>{t}°C{t === 30 ? (isKo ? ' (기준)' : ' (reference)') : ''}</option>)}
            </select>
            <p className={s.field_hint}>{isKo ? '천장 속·기계실은 35~40°C로 보는 것이 안전합니다.' : 'Use 35–40 °C for ceiling voids and plant rooms.'}</p>
          </div>
          <div>
            <label className={s.field_label} htmlFor="ws-cir">{isKo ? '같은 관·트레이의 회로 수' : 'Circuits sharing the route'}</label>
            <input id="ws-cir" className={s.input} type="number" inputMode="numeric" min="1" step="1"
              value={circuitsText} onChange={e => setCircuitsText(e.target.value)} />
            <p className={s.field_hint}>{isKo ? '이 회로를 포함한 수. 회로가 많을수록 허용전류가 줄어듭니다.' : 'Including this one. More circuits reduce ampacity.'}</p>
          </div>
        </div>
      </section>

      {/* ── 전압강하 한도 ── */}
      <section className={s.card}>
        <div className={s.step_label}>STEP 3</div>
        <h2 className={s.card_title}>{isKo ? '전압강하 한도 (KEC 232.3.9)' : 'Voltage drop limit (KEC 232.3.9)'}</h2>
        <div className={s.grid2}>
          <div>
            <span className={s.field_label}>{isKo ? '수전 방식' : 'Supply'}</span>
            <div className={s.chips}>
              <button type="button" className={`${s.chip} ${supply === 'lv' ? s.chip_active : ''}`} aria-pressed={supply === 'lv'} onClick={() => setSupply('lv')}>{isKo ? '저압 수전' : 'LV supply'}</button>
              <button type="button" className={`${s.chip} ${supply === 'hv' ? s.chip_active : ''}`} aria-pressed={supply === 'hv'} onClick={() => setSupply('hv')}>{isKo ? '고압 이상 수전' : 'HV supply'}</button>
            </div>
          </div>
          <div>
            <span className={s.field_label}>{isKo ? '용도' : 'Use'}</span>
            <div className={s.chips}>
              <button type="button" className={`${s.chip} ${usage === 'lighting' ? s.chip_active : ''}`} aria-pressed={usage === 'lighting'} onClick={() => setUsage('lighting')}>{isKo ? '조명' : 'Lighting'}</button>
              <button type="button" className={`${s.chip} ${usage === 'other' ? s.chip_active : ''}`} aria-pressed={usage === 'other'} onClick={() => setUsage('other')}>{isKo ? '기타(동력·콘센트)' : 'Other'}</button>
            </div>
          </div>
        </div>
        <div className={s.grid2}>
          <div>
            <label className={s.field_label} htmlFor="ws-drop">{isKo ? '이 회로에 적용할 한도 (%)' : 'Limit for this circuit (%)'}</label>
            <input id="ws-drop" className={s.input} type="number" inputMode="decimal" min="0.5" step="0.1"
              placeholder={autoLimit.toFixed(2)} value={dropOverride} onChange={e => setDropOverride(e.target.value)} />
            <p className={s.field_hint}>
              {isKo
                ? `KEC 한도 ${autoLimit.toFixed(2)}%(인입구~기기 전체). 간선과 나눠 쓴다면 이 회로 몫만 입력하세요.`
                : `KEC limit ${autoLimit.toFixed(2)}% (origin to equipment). Enter this circuit's share if the feeder uses part of it.`}
            </p>
          </div>
        </div>
      </section>

      {/* ── 결과 ── */}
      {result && (
        <section className={s.card} aria-live="polite">
          <div className={s.step_label}>{isKo ? '결과' : 'RESULT'}</div>
          {result.recommended === null ? (
            <div className={s.warn_box}>
              {isKo
                ? '300㎟로도 조건을 만족하지 못합니다. 병렬 포설, 전압 상향, 배선 경로 단축 등 설계 검토가 필요합니다.'
                : 'Even 300 mm² does not satisfy the conditions. Consider parallel conductors, a higher voltage or a shorter route.'}
            </div>
          ) : (
            <>
              <div className={s.hero}>
                <span className={s.hero_num}>{result.recommended}</span>
                <span className={s.hero_unit}>mm² (SQ)</span>
              </div>
              <p className={s.hero_sub}>
                {result.governing === 'ampacity' && (isKo ? '차단기 정격을 견디는 허용전류 기준으로 결정' : 'Governed by ampacity for the breaker rating')}
                {result.governing === 'drop' && (isKo ? '전압강하 한도 기준으로 결정' : 'Governed by voltage drop')}
                {result.governing === 'min' && (isKo ? `저압 옥내배선 최소 굵기 ${MIN_INDOOR_SIZE}㎟ (KEC 231.3.1)` : `Minimum indoor wiring size ${MIN_INDOOR_SIZE} mm² (KEC 231.3.1)`)}
              </p>

              <h3 className={s.card_title} style={{ fontSize: '1rem' }}>{isKo ? '과부하 보호 협조 (KEC 212.4)' : 'Overload coordination (KEC 212.4)'}</h3>
              <div className={s.chain}>
                <div className={s.chain_box}>
                  <div className={s.chain_val}>{loadA.toFixed(1)}A</div>
                  <div className={s.chain_lbl}>{isKo ? 'IB 부하전류' : 'IB load'}</div>
                </div>
                <span className={s.chain_op}>≤</span>
                <div className={s.chain_box}>
                  <div className={s.chain_val}>{result.breakerA ?? '-'}A</div>
                  <div className={s.chain_lbl}>{isKo ? 'In 차단기 정격' : 'In breaker'}</div>
                </div>
                <span className={`${s.chain_op} ${izOk ? '' : s.chain_op_fail}`}>{izOk ? '≤' : '>'}</span>
                <div className={s.chain_box}>
                  <div className={s.chain_val}>{result.izA?.toFixed(1)}A</div>
                  <div className={s.chain_lbl}>{isKo ? `IZ 전선 허용전류 (${result.recommended}㎟, 보정 후)` : `IZ ampacity (${result.recommended} mm², corrected)`}</div>
                </div>
              </div>
              <div className={`${s.verdict} ${izOk ? s.verdict_pass : s.verdict_fail}`}>
                {izOk
                  ? (isKo ? `차단기 ${result.breakerA}A가 전선을 보호합니다.` : `The ${result.breakerA} A breaker protects this cable.`)
                  : (isKo ? '차단기 정격이 전선 허용전류보다 큽니다. 굵기를 올리세요.' : 'Breaker exceeds cable ampacity. Increase the size.')}
              </div>

              <h3 className={s.card_title} style={{ fontSize: '1rem' }}>{isKo ? '기준별 필요 굵기' : 'Size needed by each check'}</h3>
              <div className={s.bars}>
                {([
                  ['ampacity', isKo ? '허용전류' : 'Ampacity', result.sizeByAmpacity, s.bar_amp],
                  ['drop', isKo ? '전압강하' : 'Voltage drop', result.sizeByDrop, s.bar_drop],
                  ['min', isKo ? '최소 굵기' : 'Minimum', result.sizeByMin, s.bar_min],
                ] as const).map(([key, label, v, cls]) => (
                  <div key={key} className={s.bar_row}>
                    <span className={result.governing === key ? s.bar_governing : ''}>{label}{result.governing === key ? ' ★' : ''}</span>
                    <div className={s.bar_track}><div className={`${s.bar_fill} ${cls}`} style={{ width: barPct(v) }} /></div>
                    <span className={s.bar_val}>{v ?? '>300'}㎟</span>
                  </div>
                ))}
              </div>

              <div className={s.stats}>
                <div className={s.stat}><span>{isKo ? '전압강하' : 'Voltage drop'}</span><strong>{result.dropV?.toFixed(2)}V</strong></div>
                <div className={s.stat}><span>{isKo ? '전압강하율 / 한도' : 'Drop / limit'}</span><strong>{result.dropPct?.toFixed(2)}% / {dropLimit.toFixed(2)}%</strong></div>
                <div className={s.stat}><span>{isKo ? '온도 보정' : 'Temp. factor'}</span><strong>×{result.tempFactor.toFixed(2)}</strong></div>
                <div className={s.stat}><span>{isKo ? '복수 회로 보정' : 'Grouping factor'}</span><strong>×{result.groupFactor.toFixed(2)}</strong></div>
              </div>
            </>
          )}

          <p className={s.source_note}>
            {isKo
              ? `근거: 허용전류 KS C IEC 60364-5-52 부속서 B 표 B.52.2~B.52.5·B.52.10·B.52.12(동 도체, 기중 30°C), 보정계수 표 B.52.14·B.52.17(${method === 'E' ? '트레이 1단 배열' : '묶음 배열'}), 보호 협조 KEC 212.4.1, 전압강하 한도 KEC 232.3.9, 전압강하 e = K·L·I/(1000·A) 약식(역률 1). 최종 설계는 실제 케이블 제조사 허용전류와 설계도서로 확인하세요.`
              : `Basis: ampacity from IEC 60364-5-52 Annex B tables B.52.2–B.52.5, B.52.10, B.52.12 (copper, 30 °C air), correction tables B.52.14 and B.52.17 (${method === 'E' ? 'single layer on tray' : 'bunched'}), coordination KEC 212.4.1, drop limit KEC 232.3.9, drop e = K·L·I/(1000·A) simplified (pf 1). Verify with the cable maker's data for final design.`}
          </p>

          <button type="button" className={s.copy_btn} onClick={handleCopy}><Copy size={16} /> {isKo ? '결과 복사' : 'Copy result'}</button>
          {copyMsg && <p className={`${s.copy_msg} ${copyMsg.startsWith('✓') ? '' : s.copy_fail}`} role="status">{copyMsg}</p>}
        </section>
      )}

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/wire-size-calc" />
      <div className={s.ad_slot}>AD</div>
      <SeoSection
        ko={{
          title: '전선 굵기 계산기는 어떻게 굵기를 정하나요?',
          description: '전선 굵기는 세 가지 조건을 모두 만족해야 합니다. 첫째, 부하전류보다 큰 차단기를 고르고 그 차단기 정격보다 전선의 허용전류가 커야 합니다(KEC 212.4.1, IB ≤ In ≤ IZ). 허용전류는 KEC가 준용하는 KS C IEC 60364-5-52 부속서 B 표에서 전선 절연(PVC 70°C, XLPE 90°C)과 공사방법(A1 단열벽 속 전선관, B1 전선관 속 전선, B2 전선관 속 케이블, C 직접 고정, E 트레이)에 따라 찾고, 주위온도와 같은 경로의 회로 수로 보정합니다. 둘째, 인입구에서 기기까지 전압강하가 KEC 232.3.9 한도(저압 수전 조명 3%·기타 5%, 고압 이상 수전 조명 6%·기타 8%)를 넘지 않아야 합니다. 셋째, 저압 옥내배선은 2.5㎟ 이상이어야 합니다. 이 계산기는 세 조건 중 가장 큰 굵기를 권장값으로 보여주고, 어떤 조건이 결정했는지 막대로 비교합니다. 예를 들어 단상 220V 25A 에어컨 회로를 HFIX 전선관(B1)으로 15m 배선할 때, 관에 이 회로만 있고 주위 30°C면 2.5㎟로 충분하지만, 같은 관에 3회로가 들어가고 주위가 35°C면 차단기 30A를 견디는 허용전류 기준으로 6㎟가 필요합니다.',
          useCases: [
            { icon: '❄️', title: '에어컨·전열기 전용회로', desc: '25A 에어컨 회로도 같은 전선관에 3회로가 들어가고 천장 속이 35°C라면 허용전류가 0.67배로 줄어 2.5㎟ 대신 6㎟가 필요합니다. 회로 수 보정을 놓치기 쉬운 경우를 바로 확인할 수 있습니다.' },
            { icon: '🏭', title: '동력 간선 트레이 배선', desc: '삼상 380V 100A 동력 간선을 CV 케이블로 트레이(E)에 4회로 포설하고 주위 40°C인 기계실이라면, 온도·회로 수 보정을 반영해 35㎟와 차단기 100A 조합이 맞는지 검토합니다.' },
            { icon: '📏', title: '긴 배선의 전압강하 검토', desc: '창고·주차장처럼 배선이 100m를 넘으면 허용전류보다 전압강하가 굵기를 결정하는 경우가 많습니다. KEC 100m 초과 가산(1m당 0.005%, 최대 0.5%)까지 반영합니다.' },
            { icon: '🔍', title: '기존 배선·차단기 적정성 점검', desc: '이미 설치된 차단기 정격이 전선 허용전류보다 큰지 IB ≤ In ≤ IZ 사슬 그림으로 확인해, 과부하 시 전선이 먼저 과열될 위험이 있는 회로를 찾아낼 수 있습니다.' },
          ],
          steps: [
            { step: '전원과 부하 입력', desc: '전기 방식(단상·삼상)을 고르고 부하전류(A)나 용량(kW)과 역률을 입력합니다. 분전반에서 부하까지의 편도 배선 길이(m)도 넣습니다. 예시 채우기 버튼으로 에어컨 회로 예를 불러올 수 있습니다.' },
            { step: '전선과 공사방법 선택', desc: 'HFIX 전선, CV·F-CV 케이블, PVC 계열 중 실제 쓰는 전선을 고르고 그림을 보며 공사방법(A1·B1·B2·C·E)을 선택합니다. 주위온도와 같은 관·트레이를 쓰는 회로 수도 입력합니다.' },
            { step: '전압강하 한도 확인', desc: '저압 수전인지 고압 이상 수전인지, 조명인지 동력·콘센트인지 선택하면 KEC 한도가 자동으로 들어갑니다. 간선과 한도를 나눠 쓴다면 이 회로에 배정할 몫만 직접 입력하세요.' },
            { step: '결과와 보호 협조 확인', desc: '권장 굵기와 결정 근거, 부하전류 ≤ 차단기 ≤ 전선 허용전류 사슬, 기준별 필요 굵기 막대, 실제 전압강하율을 확인하고 결과를 복사해 공유합니다.' },
          ],
          faqs: [
            { q: '전압강하 기준이 "간선 2%, 분기 2%" 아닌가요?', a: '그 값은 KEC 시행 전 내선규정의 기준입니다. 현행 KEC 232.3.9는 수용가 설비의 인입구에서 기기까지 전체 전압강하를 저압 수전 시 조명 3%·기타 5%, 고압 이상 수전 시 조명 6%·기타 8% 이하로 정하고, 배선이 100m를 넘으면 초과 1m당 0.005%(최대 0.5%)를 더할 수 있게 합니다.' },
            { q: '왜 같은 전류인데 공사방법에 따라 굵기가 달라지나요?', a: '전선이 열을 얼마나 잘 내보내는지가 다르기 때문입니다. 같은 XLPE 2.5㎟ 전선도 3상 부하 기준으로 단열벽 속 전선관(A1)은 23A, 전선관(B1)은 28A, 벽에 직접 고정(C)은 30A까지 흘릴 수 있습니다. 주위온도가 40°C로 오르면 XLPE는 0.91배, 같은 관에 2회로가 들어가면 0.8배로 더 줄어듭니다.' },
            { q: '차단기와 전선 굵기는 어떻게 맞추나요?', a: 'KEC 212.4.1에 따라 부하전류 IB ≤ 차단기 정격 In ≤ 전선 허용전류 IZ가 되어야 합니다. 이 계산기는 부하전류 이상인 표준 차단기 정격(15·20·30·40·50A…)을 먼저 고르고, 보정 후 허용전류가 그 정격 이상인 가장 가는 전선을 찾습니다. 전선만 부하에 맞추고 차단기를 크게 달면 과부하 때 전선이 보호되지 않습니다.' },
            { q: 'HFIX와 CV 케이블은 어떻게 다른가요?', a: '둘 다 도체 허용온도 90°C인 가교 절연이라 같은 XLPE 허용전류 표를 씁니다. 다만 HFIX는 시스가 없는 절연전선이라 전선관이나 몰드 안(A1·B1)에만 시설할 수 있고, CV·F-CV는 시스가 있는 케이블이라 직접 고정(C)이나 트레이(E)에도 시설할 수 있습니다. PVC 계열(NR·VCT)은 70°C 기준이라 허용전류가 더 낮습니다.' },
          ],
        }}
        en={{
          title: 'How does this wire size calculator choose a size?',
          description: 'A conductor must pass three checks. First, pick a breaker at or above the load current, and the cable ampacity must be at least the breaker rating (KEC 212.4.1, IB ≤ In ≤ IZ). Ampacity comes from the IEC 60364-5-52 Annex B tables that the Korean Electrical Code adopts, by insulation (PVC 70 °C, XLPE 90 °C) and installation method (A1 conduit in insulated wall, B1 wires in conduit, B2 cable in conduit, C clipped direct, E perforated tray), then corrected for ambient temperature and the number of circuits sharing the route. Second, the voltage drop from the origin to the equipment must stay within KEC 232.3.9 (LV supply: lighting 3 %, other 5 %; HV supply: 6 % and 8 %). Third, indoor LV wiring must be at least 2.5 mm². The calculator recommends the largest size required by the three checks and shows which one governed. For example, a 25 A single-phase 220 V air-conditioner circuit in HFIX wire in conduit (B1), 15 m long, is fine at 2.5 mm² alone at 30 °C, but with three circuits in the conduit at 35 °C it needs 6 mm² to carry the ampacity required by a 30 A breaker.',
          useCases: [
            { icon: '❄️', title: 'Dedicated A/C Circuits', desc: 'With three circuits in one conduit in a 35 °C ceiling void, ampacity falls to 0.67 times, pushing a 25 A air-conditioner circuit from 2.5 mm² to 6 mm². See it instantly instead of guessing.' },
            { icon: '🏭', title: 'Power Feeders on Tray', desc: 'Check a 100 A, 380 V three-phase feeder in CV cable on a perforated tray with four circuits in a 40 °C plant room, including temperature and grouping corrections.' },
            { icon: '📏', title: 'Long Runs and Voltage Drop', desc: 'On runs over 100 m, voltage drop often decides the size. The calculator applies the KEC allowance of 0.005 % per metre beyond 100 m, up to 0.5 %.' },
            { icon: '🔍', title: 'Auditing Existing Circuits', desc: 'Use the IB ≤ In ≤ IZ chain to spot circuits where the installed breaker is larger than the cable ampacity, so the cable would overheat before the breaker trips.' },
          ],
          steps: [
            { step: 'Enter Supply and Load', desc: 'Choose the system (single or three phase), enter load current or kW with power factor, and the one-way cable length from the panel to the load. The example button loads an A/C circuit.' },
            { step: 'Choose Wire and Method', desc: 'Pick HFIX wire, CV/F-CV cable or PVC types, then the installation method from the pictures. Enter ambient temperature and how many circuits share the conduit or tray.' },
            { step: 'Set the Drop Limit', desc: 'Select LV or HV supply and lighting or other loads to fill in the KEC limit. If the feeder uses part of the budget, enter only this circuit\'s share.' },
            { step: 'Read the Result', desc: 'See the recommended size and what governed it, the load ≤ breaker ≤ ampacity chain, a bar comparison of each check and the actual voltage drop, then copy the result.' },
          ],
          faqs: [
            { q: 'Isn\'t the voltage drop rule 2 % feeder plus 2 % branch?', a: 'That was the old Korean wiring code before KEC. KEC 232.3.9 limits the total drop from the origin to the equipment to 3 % for lighting and 5 % for other loads on an LV supply, or 6 % and 8 % on an HV supply, plus 0.005 % per metre beyond 100 m (max 0.5 %).' },
            { q: 'Why does the installation method change the size?', a: 'Heat escapes differently. A 2.5 mm² XLPE conductor with three loaded conductors carries 23 A in conduit in an insulated wall (A1), 28 A in conduit (B1) and 30 A clipped direct (C). At 40 °C it drops by 0.91, and two circuits together reduce it by a further 0.8.' },
            { q: 'How are the breaker and cable matched?', a: 'KEC 212.4.1 requires IB ≤ In ≤ IZ. The calculator picks the standard breaker at or above the load (15, 20, 30, 40, 50 A…) and then the smallest cable whose corrected ampacity is at least that rating. Sizing the cable to the load but fitting a bigger breaker leaves the cable unprotected.' },
            { q: 'What is the difference between HFIX and CV?', a: 'Both use 90 °C cross-linked insulation, so they share the XLPE table. HFIX is an unsheathed wire that must run in conduit (A1, B1), while CV/F-CV are sheathed cables that can also be clipped direct (C) or laid on tray (E). PVC types (NR, VCT) are rated 70 °C and carry less current.' },
          ],
        }}
      />
    </div>
  );
}
