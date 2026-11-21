'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Zap, Copy } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  calcWire, loadCurrentFromKw, voltageDropLimit, SYSTEMS, AMBIENT_TEMPS, MIN_INDOOR_SIZE,
  type Insulation, type Method, type SystemType, type Supply, type Usage,
} from '@/lib/wireSize';
import WireSizeUS from './WireSizeUS';
import s from './wire-size-calc.module.css';
import { ui } from '@/app/components/ui';

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

export default function WireSizeCalcClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // 영문 페이지는 미국 NEC(AWG)로 시작, 한국어는 KEC(㎟)
  const [std, setStd] = useState<'kec' | 'nec'>(isKo ? 'kec' : 'nec');
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

  const titleStr = isKo ? '전선 굵기 계산기 (KEC 허용전류·전압강하)' : 'Wire Size Calculator — AWG (NEC) & mm² (IEC)';
  const descStr = isKo
    ? '부하전류와 거리, 전선 종류와 공사방법을 넣으면 차단기 정격, 허용전류, 전압강하를 모두 만족하는 전선 굵기(㎟)를 계산합니다.'
    : 'Find the copper wire size for a circuit from load, voltage and run length: NEC Table 310.16 ampacity with temperature and conductor-count derating, breaker sizing and voltage drop in AWG — or IEC/KEC sizing in mm².';

  const maxBar = result ? Math.max(result.sizeByAmpacity ?? 300, result.sizeByDrop ?? 300, result.sizeByMin) : 1;
  const barPct = (v: number | null) => `${Math.max(6, ((v ?? 300) / maxBar) * 100)}%`;
  const izOk = result?.izA != null && result.breakerA != null && result.izA >= result.breakerA;

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Zap />} title={titleStr} subtitle={descStr} />

      <div className={ui.segmented} role="group" aria-label={isKo ? '적용 기준' : 'Code'}>
        <button type="button" aria-pressed={std === 'kec'} className={`${ui.segment} ${std === 'kec' ? ui.segmentActive : ''}`} onClick={() => setStd('kec')}>
          {isKo ? '한국 KEC (㎟)' : 'IEC / Korea KEC (mm²)'}<small>{isKo ? 'HFIX·CV, IEC 60364-5-52' : 'HFIX, CV · IEC 60364-5-52'}</small>
        </button>
        <button type="button" aria-pressed={std === 'nec'} className={`${ui.segment} ${std === 'nec' ? ui.segmentActive : ''}`} onClick={() => setStd('nec')}>
          {isKo ? '미국 NEC (AWG)' : 'US NEC (AWG)'}<small>{isKo ? 'THHN·NM-B, Table 310.16' : 'THHN, NM-B · Table 310.16'}</small>
        </button>
      </div>

      {std === 'nec' ? <WireSizeUS isKo={isKo} locale={locale} /> : (<>
      {/* ── 부하 ── */}
      <section className={`${ui.card} ${s.card}`}>
        <div className={`${ui.badge} ${s.step_label}`}>STEP 1</div>
        <h2 className={ui.cardTitle}>{isKo ? '전원과 부하' : 'Supply and load'}</h2>
        <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.example_btn}`} onClick={fillExample}>
          {isKo ? '예시 채우기: 분전반 → 에어컨 25A, 15m, 같은 관 3회로' : 'Example: panel → A/C 25 A, 15 m, 3 circuits in one conduit'}
        </button>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="ws-system">{isKo ? '전기 방식' : 'System'}</label>
          <select id="ws-system" className={ui.input} value={system} onChange={e => setSystem(e.target.value as SystemType)}>
            {(Object.keys(SYSTEMS) as SystemType[]).map(k => <option key={k} value={k}>{systemName(k)}</option>)}
          </select>
        </div>
        <div className={`${ui.chips} ${ui.grow}`} role="group" aria-label={isKo ? '부하 입력 방식' : 'Load input'}>
          <button type="button" className={`${ui.chip} ${inputMode === 'ampere' ? ui.chipActive : ''}`} aria-pressed={inputMode === 'ampere'} onClick={() => setInputMode('ampere')}>
            {isKo ? '전류(A)로 입력' : 'Current (A)'}
          </button>
          <button type="button" className={`${ui.chip} ${inputMode === 'kw' ? ui.chipActive : ''}`} aria-pressed={inputMode === 'kw'} onClick={() => setInputMode('kw')}>
            {isKo ? '용량(kW)으로 입력' : 'Power (kW)'}
          </button>
        </div>
        <div className={s.grid2}>
          {inputMode === 'ampere' ? (
            <div className={ui.field}>
              <label className={ui.label} htmlFor="ws-amp">{isKo ? '부하전류 IB (A)' : 'Load current IB (A)'}</label>
              <input id="ws-amp" className={ui.input} type="number" inputMode="decimal" min="0" placeholder={isKo ? '예: 25' : 'e.g. 25'}
                value={ampText} onChange={e => setAmpText(e.target.value)} />
            </div>
          ) : (
            <>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="ws-kw">{isKo ? '부하 용량 (kW)' : 'Load (kW)'}</label>
                <input id="ws-kw" className={ui.input} type="number" inputMode="decimal" min="0" placeholder={isKo ? '예: 5' : 'e.g. 5'}
                  value={kwText} onChange={e => setKwText(e.target.value)} />
                {loadA > 0 && <p className={ui.hint}>{isKo ? `환산 전류 ${loadA.toFixed(1)}A` : `= ${loadA.toFixed(1)} A`}</p>}
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="ws-pf">{isKo ? '역률' : 'Power factor'}</label>
                <select id="ws-pf" className={ui.input} value={pf} onChange={e => setPf(Number(e.target.value))}>
                  {[1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7].map(v => <option key={v} value={v}>{v.toFixed(2)}</option>)}
                </select>
              </div>
            </>
          )}
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ws-len">{isKo ? '배선 길이 (편도, m)' : 'Cable length (one-way, m)'}</label>
            <input id="ws-len" className={ui.input} type="number" inputMode="decimal" min="0" placeholder={isKo ? '예: 35' : 'e.g. 35'}
              value={lengthText} onChange={e => setLengthText(e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── 전선과 공사방법 ── */}
      <section className={`${ui.card} ${s.card}`}>
        <div className={`${ui.badge} ${s.step_label}`}>STEP 2</div>
        <h2 className={ui.cardTitle}>{isKo ? '전선 종류와 공사방법' : 'Wire type and installation'}</h2>
        <div className={`${ui.chips} ${ui.grow}`} role="radiogroup" aria-label={isKo ? '전선 종류' : 'Wire type'}>
          {(Object.keys(WIRES) as WireKind[]).map(w => (
            <button key={w} type="button" role="radio" aria-checked={wire === w}
              className={`${ui.chip} ${wire === w ? ui.chipActive : ''}`} onClick={() => chooseWire(w)}>
              {wireName(w)}
            </button>
          ))}
        </div>
        <div className={s.method_grid} role="radiogroup" aria-label={isKo ? '공사방법' : 'Installation method'}>
          {METHODS.map(m => {
            const allowed = wireSpec.methods.includes(m);
            return (
              <button key={m} type="button" role="radio" aria-checked={method === m} disabled={!allowed}
                className={`${ui.chip} ${s.method_card} ${method === m ? ui.chipActive : ''}`} onClick={() => setMethod(m)}>
                <MethodIcon m={m} />
                <span className={s.method_code}>{isKo ? `공사방법 ${m}` : `Method ${m}`}</span>
                <span className={s.method_name}>{methodName(m)}</span>
              </button>
            );
          })}
        </div>
        {wire === 'hfix' && (
          <p className={ui.hint}>{isKo ? '절연전선(HFIX)은 전선관이나 몰드 안에만 시설할 수 있어 A1·B1만 선택됩니다.' : 'Insulated wires (HFIX) must run in conduit, so only A1 and B1 apply.'}</p>
        )}
        <div className={s.grid2}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ws-amb">{isKo ? '주위온도 (°C)' : 'Ambient temperature (°C)'}</label>
            <select id="ws-amb" className={ui.input} value={ambient} onChange={e => setAmbient(Number(e.target.value))}>
              {AMBIENT_TEMPS.map(t => <option key={t} value={t}>{t}°C{t === 30 ? (isKo ? ' (기준)' : ' (reference)') : ''}</option>)}
            </select>
            <p className={ui.hint}>{isKo ? '천장 속·기계실은 35~40°C로 보는 것이 안전합니다.' : 'Use 35–40 °C for ceiling voids and plant rooms.'}</p>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ws-cir">{isKo ? '같은 관·트레이의 회로 수' : 'Circuits sharing the route'}</label>
            <input id="ws-cir" className={ui.input} type="number" inputMode="numeric" min="1" step="1"
              value={circuitsText} onChange={e => setCircuitsText(e.target.value)} />
            <p className={ui.hint}>{isKo ? '이 회로를 포함한 수. 회로가 많을수록 허용전류가 줄어듭니다.' : 'Including this one. More circuits reduce ampacity.'}</p>
          </div>
        </div>
      </section>

      {/* ── 전압강하 한도 ── */}
      <section className={`${ui.card} ${s.card}`}>
        <div className={`${ui.badge} ${s.step_label}`}>STEP 3</div>
        <h2 className={ui.cardTitle}>{isKo ? '전압강하 한도 (KEC 232.3.9)' : 'Voltage drop limit (KEC 232.3.9)'}</h2>
        <div className={s.grid2}>
          <div className={ui.field}>
            <span className={ui.label}>{isKo ? '수전 방식' : 'Supply'}</span>
            <div className={`${ui.chips} ${ui.grow}`}>
              <button type="button" className={`${ui.chip} ${supply === 'lv' ? ui.chipActive : ''}`} aria-pressed={supply === 'lv'} onClick={() => setSupply('lv')}>{isKo ? '저압 수전' : 'LV supply'}</button>
              <button type="button" className={`${ui.chip} ${supply === 'hv' ? ui.chipActive : ''}`} aria-pressed={supply === 'hv'} onClick={() => setSupply('hv')}>{isKo ? '고압 이상 수전' : 'HV supply'}</button>
            </div>
          </div>
          <div className={ui.field}>
            <span className={ui.label}>{isKo ? '용도' : 'Use'}</span>
            <div className={`${ui.chips} ${ui.grow}`}>
              <button type="button" className={`${ui.chip} ${usage === 'lighting' ? ui.chipActive : ''}`} aria-pressed={usage === 'lighting'} onClick={() => setUsage('lighting')}>{isKo ? '조명' : 'Lighting'}</button>
              <button type="button" className={`${ui.chip} ${usage === 'other' ? ui.chipActive : ''}`} aria-pressed={usage === 'other'} onClick={() => setUsage('other')}>{isKo ? '기타(동력·콘센트)' : 'Other'}</button>
            </div>
          </div>
        </div>
        <div className={s.grid2}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ws-drop">{isKo ? '이 회로에 적용할 한도 (%)' : 'Limit for this circuit (%)'}</label>
            <input id="ws-drop" className={ui.input} type="number" inputMode="decimal" min="0.5" step="0.1"
              placeholder={autoLimit.toFixed(2)} value={dropOverride} onChange={e => setDropOverride(e.target.value)} />
            <p className={ui.hint}>
              {isKo
                ? `KEC 한도 ${autoLimit.toFixed(2)}%(인입구~기기 전체). 간선과 나눠 쓴다면 이 회로 몫만 입력하세요.`
                : `KEC limit ${autoLimit.toFixed(2)}% (origin to equipment). Enter this circuit's share if the feeder uses part of it.`}
            </p>
          </div>
        </div>
      </section>

      {/* ── 결과 ── */}
      {result && (
        <section className={`${ui.card} ${s.card}`} aria-live="polite">
          <div className={`${ui.badge} ${s.step_label}`}>{isKo ? '결과' : 'RESULT'}</div>
          {result.recommended === null ? (
            <div className={`${ui.notice} ${ui.amber}`}>
              {isKo
                ? '300㎟로도 조건을 만족하지 못합니다. 병렬 포설, 전압 상향, 배선 경로 단축 등 설계 검토가 필요합니다.'
                : 'Even 300 mm² does not satisfy the conditions. Consider parallel conductors, a higher voltage or a shorter route.'}
            </div>
          ) : (
            <>
              <div className={`${ui.result} ${s.hero}`}>
                <span className={ui.resultValue}>{result.recommended}</span>
                <span className={s.hero_unit}>mm² (SQ)</span>
              </div>
              <p className={s.hero_sub}>
                {result.governing === 'ampacity' && (isKo ? '차단기 정격을 견디는 허용전류 기준으로 결정' : 'Governed by ampacity for the breaker rating')}
                {result.governing === 'drop' && (isKo ? '전압강하 한도 기준으로 결정' : 'Governed by voltage drop')}
                {result.governing === 'min' && (isKo ? `저압 옥내배선 최소 굵기 ${MIN_INDOOR_SIZE}㎟ (KEC 231.3.1)` : `Minimum indoor wiring size ${MIN_INDOOR_SIZE} mm² (KEC 231.3.1)`)}
              </p>

              <h3 className={ui.cardTitle} style={{ fontSize: '1rem', margin: 0 }}>{isKo ? '과부하 보호 협조 (KEC 212.4)' : 'Overload coordination (KEC 212.4)'}</h3>
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
              <div className={`${ui.notice} ${izOk ? ui.green : ui.red} ${s.verdict}`}>
                {izOk
                  ? (isKo ? `차단기 ${result.breakerA}A가 전선을 보호합니다.` : `The ${result.breakerA} A breaker protects this cable.`)
                  : (isKo ? '차단기 정격이 전선 허용전류보다 큽니다. 굵기를 올리세요.' : 'Breaker exceeds cable ampacity. Increase the size.')}
              </div>

              <h3 className={ui.cardTitle} style={{ fontSize: '1rem', margin: 0 }}>{isKo ? '기준별 필요 굵기' : 'Size needed by each check'}</h3>
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

          <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={handleCopy}><Copy size={16} /> {isKo ? '결과 복사' : 'Copy result'}</button>
          {copyMsg && <p className={`${s.copy_msg} ${copyMsg.startsWith('✓') ? '' : s.copy_fail}`} role="status">{copyMsg}</p>}
        </section>
      )}
      </>)}

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/wire-size-calc" />
      {seo}
    </div>
  );
}
