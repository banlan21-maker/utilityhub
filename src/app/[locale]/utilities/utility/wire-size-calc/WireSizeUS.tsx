'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import {
  calcWireUS, AWG_TABLE, US_SYSTEMS, awgLabel, cmilToMm2, necTempFactor, necAdjFactor,
  type UsSystem, type UsConductor,
} from '@/lib/wireSize';
import s from './wire-size-calc.module.css';
import { ui } from '@/app/components/ui';

/** 미국 NEC(AWG) 전선 굵기 — 허용전류 Table 310.16, 보정 310.15, 연속부하 125%, 단자 110.14(C), 소선 240.4(D) */
export default function WireSizeUS({ isKo, locale }: { isKo: boolean; locale: string }) {
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const [system, setSystem] = useState<UsSystem>('120_1');
  const [mode, setMode] = useState<'amp' | 'kw'>('amp');
  const [ampText, setAmpText] = useState('');
  const [kwText, setKwText] = useState('');
  const [pf, setPf] = useState(1);
  const [lenText, setLenText] = useState('');
  const [continuous, setContinuous] = useState(false);
  const [conductor, setConductor] = useState<UsConductor>('thhn');
  const [termC, setTermC] = useState<60 | 75>(75);
  const [ambientF, setAmbientF] = useState(86);
  const [cccText, setCccText] = useState('');
  const [vdText, setVdText] = useState('3');
  const [msg, setMsg] = useState('');

  const sys = US_SYSTEMS[system];
  const kw = parseFloat(kwText) || 0;
  const loadA = mode === 'amp' ? parseFloat(ampText) || 0 : kw > 0 ? (kw * 1000) / ((sys.phases === 3 ? Math.sqrt(3) : 1) * sys.V * pf) : 0;
  const lengthFt = parseFloat(lenText) || 0;
  const ambientC = Math.round(((ambientF - 32) * 5) / 9);
  const ccc = Math.max(1, parseInt(cccText, 10) || sys.ccc);
  const dropLimitPct = parseFloat(vdText) || 3;
  const r = loadA > 0 && lengthFt > 0 ? calcWireUS({ loadA, lengthFt, system, conductor, termC, ambientC, ccc, continuous, dropLimitPct }) : null;
  const rowOf = (z: string | null) => (z ? AWG_TABLE.find(x => x[0] === z)! : null);
  const rec = rowOf(r?.recommended ?? null);
  const ok = r?.ampacityA != null && r.breakerA != null && r.ampacityA >= r.breakerA;

  const sysName = (k: UsSystem) => ({
    '120_1': L('120V 단상', '120 V single-phase'), '208_1': L('208V 단상', '208 V single-phase (2 legs of 208Y)'),
    '240_1': L('240V 단상', '240 V single-phase'), '277_1': L('277V 단상', '277 V single-phase'),
    '208_3': L('208V 삼상', '208 V three-phase'), '480_3': L('480V 삼상', '480 V three-phase'),
  })[k];

  const example = () => { setSystem('120_1'); setMode('amp'); setAmpText('20'); setLenText('100'); setContinuous(false); setConductor('thhn'); setTermC(75); setAmbientF(86); setCccText(''); setVdText('3'); };

  const copy = async () => {
    if (!r || !rec) return;
    const text = [
      `[${L('전선 굵기 (NEC)', 'Wire size (NEC)')}] ${sysName(system)} · ${loadA.toFixed(1)} A${continuous ? L(' 연속', ' continuous') : ''} · ${lengthFt} ft`,
      `${L('권장', 'Recommended')}: ${awgLabel(rec[0])} ${L('구리', 'copper')} (${cmilToMm2(rec[4]).toFixed(1)} mm²)`,
      `OCPD ${r.breakerA} A · ${L('허용전류', 'ampacity')} ${r.ampacityA?.toFixed(1)} A · VD ${r.dropV?.toFixed(2)} V (${r.dropPct?.toFixed(2)}%)`,
      `theutilhub.com/${locale}/utilities/utility/wire-size-calc`,
    ].join('\n');
    try { await navigator.clipboard.writeText(text); setMsg(L('✓ 복사됨', '✓ Copied')); } catch { setMsg(L('복사 실패', 'Copy failed')); }
    setTimeout(() => setMsg(''), 2500);
  };

  const idx = (z: string | null) => (z ? AWG_TABLE.findIndex(x => x[0] === z) : AWG_TABLE.length);
  const barPct = (z: string | null) => `${Math.max(8, ((idx(z) + 1) / AWG_TABLE.length) * 100)}%`;

  return (
    <>
      <section className={`${ui.card} ${s.card}`}>
        <div className={`${ui.badge} ${s.step_label}`}>STEP 1</div>
        <h2 className={ui.cardTitle}>{L('전원과 부하', 'Circuit and load')}</h2>
        <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.example_btn}`} onClick={example}>{L('예시: 120V 20A 회로, 100ft', 'Example: 120 V, 20 A circuit, 100 ft run')}</button>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="us-sys">{L('전압·상', 'Voltage and phase')}</label>
          <select id="us-sys" className={ui.input} value={system} onChange={e => { setSystem(e.target.value as UsSystem); setCccText(''); }}>
            {(Object.keys(US_SYSTEMS) as UsSystem[]).map(k => <option key={k} value={k}>{sysName(k)}</option>)}
          </select>
        </div>
        <div className={`${ui.chips} ${ui.grow}`}>
          <button type="button" className={`${ui.chip} ${mode === 'amp' ? ui.chipActive : ''}`} aria-pressed={mode === 'amp'} onClick={() => setMode('amp')}>{L('전류(A)', 'Amps')}</button>
          <button type="button" className={`${ui.chip} ${mode === 'kw' ? ui.chipActive : ''}`} aria-pressed={mode === 'kw'} onClick={() => setMode('kw')}>{L('전력(kW)', 'Kilowatts')}</button>
        </div>
        <div className={s.grid2}>
          {mode === 'amp' ? (
            <div className={ui.field}>
              <label className={ui.label} htmlFor="us-amp">{L('부하전류 (A)', 'Load current (A)')}</label>
              <input id="us-amp" className={ui.input} type="number" inputMode="decimal" min="0" placeholder="20" value={ampText} onChange={e => setAmpText(e.target.value)} />
            </div>
          ) : (
            <>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="us-kw">{L('부하 (kW)', 'Load (kW)')}</label>
                <input id="us-kw" className={ui.input} type="number" inputMode="decimal" min="0" placeholder="5" value={kwText} onChange={e => setKwText(e.target.value)} />
                {loadA > 0 && <p className={ui.hint}>= {loadA.toFixed(1)} A</p>}
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="us-pf">{L('역률', 'Power factor')}</label>
                <select id="us-pf" className={ui.input} value={pf} onChange={e => setPf(Number(e.target.value))}>
                  {[1, 0.95, 0.9, 0.85, 0.8].map(v => <option key={v} value={v}>{v.toFixed(2)}</option>)}
                </select>
              </div>
            </>
          )}
          <div className={ui.field}>
            <label className={ui.label} htmlFor="us-len">{L('편도 길이 (ft)', 'One-way length (ft)')}</label>
            <input id="us-len" className={ui.input} type="number" inputMode="decimal" min="0" placeholder="100" value={lenText} onChange={e => setLenText(e.target.value)} />
          </div>
        </div>
        <label className={s.check}>
          <input type="checkbox" checked={continuous} onChange={e => setContinuous(e.target.checked)} />
          <span>{L('연속부하 (3시간 이상) — 125% 적용', 'Continuous load (3 hours or more) — apply 125%')}<small>{L('NEC 210.19(A)·210.20(A)', 'NEC 210.19(A)(1) and 210.20(A): conductors and breaker sized at 125% of the continuous load.')}</small></span>
        </label>
      </section>

      <section className={`${ui.card} ${s.card}`}>
        <div className={`${ui.badge} ${s.step_label}`}>STEP 2</div>
        <h2 className={ui.cardTitle}>{L('전선과 설치 조건', 'Conductor and conditions')}</h2>
        <div className={`${ui.chips} ${ui.grow}`}>
          <button type="button" className={`${ui.chip} ${conductor === 'thhn' ? ui.chipActive : ''}`} aria-pressed={conductor === 'thhn'} onClick={() => setConductor('thhn')}>THHN / THWN-2 (90°C)</button>
          <button type="button" className={`${ui.chip} ${conductor === 'nm' ? ui.chipActive : ''}`} aria-pressed={conductor === 'nm'} onClick={() => setConductor('nm')}>NM-B {L('(로멕스)', '(Romex)')}</button>
        </div>
        <p className={ui.hint}>{conductor === 'nm'
          ? L('NM-B는 90°C 절연이지만 NEC 334.80에 따라 허용전류는 60°C 열을 넘을 수 없습니다(보정은 90°C 값에서).', 'NM-B has 90 °C conductors, but NEC 334.80 limits its ampacity to the 60 °C column; derating may start from the 90 °C value.')
          : L('구리 THHN·THWN-2 단심선을 전선관에 넣는 경우. 보정은 90°C 열에서 시작하고, 최종 값은 단자 등급 열을 넘을 수 없습니다.', 'Copper THHN/THWN-2 in raceway. Derating starts from the 90 °C column, but the result cannot exceed the termination column.')}</p>
        {conductor === 'thhn' && (
          <div className={ui.field}>
            <span className={ui.label}>{L('단자 온도 등급 (NEC 110.14(C))', 'Termination rating (NEC 110.14(C))')}</span>
            <div className={`${ui.chips} ${ui.grow}`}>
              <button type="button" className={`${ui.chip} ${termC === 75 ? ui.chipActive : ''}`} aria-pressed={termC === 75} onClick={() => setTermC(75)}>75°C</button>
              <button type="button" className={`${ui.chip} ${termC === 60 ? ui.chipActive : ''}`} aria-pressed={termC === 60} onClick={() => setTermC(60)}>60°C</button>
            </div>
            <p className={ui.hint}>{L('대부분의 차단기·기기 단자는 75°C 등급입니다. 100A 이하 회로에서 단자 등급이 표시되지 않았다면 60°C를 고르세요.', 'Most breakers and equipment are listed for 75 °C. For circuits of 100 A or less with unmarked terminals, use 60 °C.')}</p>
          </div>
        )}
        <div className={s.grid2}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="us-amb">{L('주위온도', 'Ambient temperature')}</label>
            <select id="us-amb" className={ui.input} value={ambientF} onChange={e => setAmbientF(Number(e.target.value))}>
              {[50, 59, 68, 77, 86, 95, 104, 113, 122, 131].map(f => <option key={f} value={f}>{f}°F ({Math.round(((f - 32) * 5) / 9)}°C){f === 86 ? L(' 기준', ' (table basis)') : ''}</option>)}
            </select>
            <p className={ui.hint}>{L('다락·지붕 위는 높게 잡으세요.', 'Attics and rooftops run hotter — size for the worst case.')} ×{necTempFactor(ambientC, 90).toFixed(2)}</p>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="us-ccc">{L('같은 관·케이블 안 통전 도체 수', 'Current-carrying conductors in the raceway')}</label>
            <input id="us-ccc" className={ui.input} type="number" inputMode="numeric" min="1" placeholder={String(sys.ccc)} value={cccText} onChange={e => setCccText(e.target.value)} />
            <p className={ui.hint}>{L(`이 회로만이면 ${sys.ccc}본. 4본 이상이면 NEC 310.15(C)(1)로 저감됩니다.`, `This circuit alone is ${sys.ccc}. Four or more triggers NEC 310.15(C)(1) adjustment (×${necAdjFactor(ccc).toFixed(2)} now). Neutrals of balanced circuits and grounds don't count.`)}</p>
          </div>
        </div>
      </section>

      <section className={`${ui.card} ${s.card}`}>
        <div className={`${ui.badge} ${s.step_label}`}>STEP 3</div>
        <h2 className={ui.cardTitle}>{L('전압강하 한도', 'Voltage drop limit')}</h2>
        <div className={`${ui.chips} ${ui.grow}`}>{['2', '3', '5'].map(v => <button key={v} type="button" className={`${ui.chip} ${vdText === v ? ui.chipActive : ''}`} aria-pressed={vdText === v} onClick={() => setVdText(v)}>{v}%</button>)}</div>
        <p className={ui.hint}>{L('NEC 210.19(A) 정보 노트: 분기회로 3%, 간선 포함 전체 5% 권장(의무 아님).', 'NEC 210.19(A) Informational Note: 3% for a branch circuit and 5% total including the feeder are recommended (not mandatory, but widely specified).')}</p>
      </section>

      {r && (
        <section className={`${ui.card} ${s.card}`} aria-live="polite">
          <div className={`${ui.badge} ${s.step_label}`}>{L('결과', 'RESULT')}</div>
          {!rec ? (
            <div className={`${ui.notice} ${ui.amber}`}>{L('600 kcmil로도 부족합니다. 병렬 도체나 전압 상향을 검토하세요.', 'Even 600 kcmil is not enough. Consider parallel conductors (NEC 310.10(G)) or a higher voltage.')}</div>
          ) : (
            <>
              <div className={`${ui.result} ${s.hero}`}>
                <span className={ui.resultValue}>{rec[0]}</span>
                <span className={s.hero_unit}>{/^\d{3}$/.test(rec[0]) ? 'kcmil' : 'AWG'} {L('구리', 'copper')}</span>
              </div>
              <p className={s.hero_sub}>
                {r.governing === 'ampacity' ? L('허용전류(차단기 보호) 기준으로 결정', 'Governed by ampacity for the breaker') : L('전압강하 기준으로 결정', 'Governed by voltage drop')}
                {' · '}{cmilToMm2(rec[4]).toFixed(1)} mm² · {rec[4].toLocaleString('en-US')} cmil
              </p>
              <div className={s.chain}>
                <div className={s.chain_box}><div className={s.chain_val}>{r.designA.toFixed(1)}A</div><div className={s.chain_lbl}>{continuous ? L('부하 ×125%', 'Load ×125%') : L('부하전류', 'Load')}</div></div>
                <span className={s.chain_op}>≤</span>
                <div className={s.chain_box}><div className={s.chain_val}>{r.breakerA ?? '-'}A</div><div className={s.chain_lbl}>{L('차단기 (240.6)', 'Breaker (240.6)')}</div></div>
                <span className={`${s.chain_op} ${ok ? '' : s.chain_op_fail}`}>{ok ? '≤' : '>'}</span>
                <div className={s.chain_box}><div className={s.chain_val}>{r.ampacityA?.toFixed(1)}A</div><div className={s.chain_lbl}>{L(`허용전류 (${awgLabel(rec[0])}, 보정 후)`, `Ampacity (${awgLabel(rec[0])}, adjusted)`)}</div></div>
              </div>
              <div className={s.bars}>
                {([
                  ['ampacity', L('허용전류', 'Ampacity'), r.sizeByAmpacity, s.bar_amp],
                  ['drop', L('전압강하', 'Voltage drop'), r.sizeByDrop, s.bar_drop],
                ] as const).map(([k, label, z, cls]) => (
                  <div key={k} className={s.bar_row}>
                    <span className={r.governing === k ? s.bar_governing : ''}>{label}{r.governing === k ? ' ★' : ''}</span>
                    <div className={s.bar_track}><div className={`${s.bar_fill} ${cls}`} style={{ width: barPct(z) }} /></div>
                    <span className={s.bar_val}>{z ? awgLabel(z) : '>600 kcmil'}</span>
                  </div>
                ))}
              </div>
              <div className={s.stats}>
                <div className={s.stat}><span>{L('전압강하', 'Voltage drop')}</span><strong>{r.dropV?.toFixed(2)} V</strong></div>
                <div className={s.stat}><span>{L('강하율 / 한도', 'Drop / limit')}</span><strong>{r.dropPct?.toFixed(2)}% / {dropLimitPct}%</strong></div>
                <div className={s.stat}><span>{L('온도 보정', 'Temperature factor')}</span><strong>×{r.tempFactor.toFixed(2)}</strong></div>
                <div className={s.stat}><span>{L('도체 수 보정', 'Adjustment factor')}</span><strong>×{r.adjFactor.toFixed(2)}</strong></div>
              </div>
            </>
          )}
          <p className={s.source_note}>{L(
            '근거: NEC 2023 Table 310.16(구리, 30°C), 310.15(B)(1) 온도 보정, 310.15(C)(1) 도체 수 저감, 110.14(C) 단자 온도, 240.4(D) 소선 보호(14 AWG 15A·12 AWG 20A·10 AWG 30A), 240.6(A) 표준 정격, 전압강하 VD = 2·K·I·L/CM(단상)·√3·K·I·L/CM(삼상), K = 12.9. 주택 인입선 83% 규칙(310.12), 알루미늄, 모터 회로(430조)는 반영하지 않습니다.',
            'Basis: NEC 2023 Table 310.16 (copper, 86 °F/30 °C), 310.15(B)(1) temperature correction, 310.15(C)(1) adjustment for more than three current-carrying conductors, 110.14(C) termination limits, 240.4(D) small-conductor protection (14 AWG 15 A, 12 AWG 20 A, 10 AWG 30 A), 240.6(A) standard ratings, voltage drop VD = 2·K·I·L/CM single-phase or √3·K·I·L/CM three-phase with K = 12.9. Dwelling service sizing (310.12, 83%), aluminum and motor circuits (Article 430) are not covered; local amendments apply.',
          )}</p>
          <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={copy}><Copy size={16} /> {L('결과 복사', 'Copy result')}</button>
          {msg && <p className={s.copy_msg} role="status">{msg}</p>}
        </section>
      )}

      <section className={`${ui.card} ${s.card}`}>
        <h2 className={ui.cardTitle}>{L('NEC 구리 허용전류표 (Table 310.16, 30°C, 3본 이하)', 'Copper ampacity chart (NEC Table 310.16, 86 °F, ≤ 3 conductors)')}</h2>
        <div className={s.table_wrap}>
          <table className={s.table}>
            <thead><tr><th>{L('굵기', 'Size')}</th><th>60°C<small> TW, UF, NM-B*</small></th><th>75°C<small> THW, THWN</small></th><th>90°C<small> THHN, THWN-2</small></th><th>mm²</th></tr></thead>
            <tbody>
              {AWG_TABLE.map(([z, a60, a75, a90, cm]) => (
                <tr key={z} className={rec?.[0] === z ? s.row_on : ''}><td>{awgLabel(z)}</td><td>{a60}</td><td>{a75}</td><td>{a90}</td><td>{cmilToMm2(cm).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={ui.hint}>{L('* NM-B는 도체가 90°C지만 허용전류는 60°C 열. 14·12·10 AWG는 240.4(D)로 차단기가 15·20·30A까지로 제한됩니다.', '* NM-B uses the 60 °C column. 14, 12 and 10 AWG copper are limited to 15, 20 and 30 A breakers by NEC 240.4(D), whatever the table says.')}</p>
      </section>
    </>
  );
}
