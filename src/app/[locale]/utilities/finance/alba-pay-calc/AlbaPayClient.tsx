'use client';

// 알바 급여·주휴수당 계산기 — 입력·계산 위젯만 (제목·설명·FAQ는 page.tsx 서버 렌더)
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertTriangle, CheckCircle2, Copy, Download, Info, Printer, XCircle } from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  analyzeDay, basisFor, calcPay, scheduleDays, simpleDays, wageYears,
  type Deduction, type DayInput, type PayResult,
} from '@/lib/albaPay';
import s from './alba-pay.module.css';

type Mode = 'simple' | 'schedule';

const STORE_KEY = 'utilhub-alba-pay';
const DEFAULT_DAYS: DayInput[] = Array.from({ length: 7 }, (_, i) => ({
  on: i < 5, start: '09:00', end: '18:00', breakMin: 60, holiday: false,
}));

const T = {
  ko: {
    modeSimple: '간단 계산', modeSchedule: '근무표 계산',
    year: '기준 연도', fromJan: '1월 1일부터',
    wage: '시급', applyMin: (w: string) => `최저시급 적용 (${w})`, wageError: '시급을 입력해 주세요.',
    hours: '하루 근무시간', hoursHint: '휴게시간을 뺀 실제 일한 시간', hoursError: '하루 근무시간은 0~24시간입니다.',
    days: '주 근무일수', dayUnit: '일',
    size: '사업장 규모', under5: '5인 미만', over5: '5인 이상',
    sizeHint: (five: boolean) => five ? '연장·야간·휴일 근무는 시급의 50%를 더 받습니다.' : '연장·야간·휴일 가산수당은 없지만 주휴수당은 받습니다.',
    deduction: '공제 방식', dedNone: '공제 없음', dedIns: '4대보험', ded33: '3.3%',
    dayNames: ['월', '화', '수', '목', '금', '토', '일'],
    start: '출근', end: '퇴근', brk: '휴게(분)', holiday: '휴일 근무', off: '쉬는 날',
    nextDay: '다음 날 퇴근', sameTime: '출근과 퇴근 시각이 같습니다',
    breakShort: (need: number) => `${need === 60 ? '8시간 근무 시 휴게 1시간' : '4시간 근무 시 휴게 30분'} 이상 주어야 합니다`,
    dayHours: (h: string, n: string) => `${h}시간${n !== '0' ? ` · 야간 ${n}시간` : ''}`,
    weekTotal: (h: string, ot: string, n: string) => `주 ${h}시간 · 연장 ${ot}시간 · 야간 ${n}시간`,
    eligible: '주휴수당 대상입니다', notEligible: '주휴수당 대상이 아닙니다 (주 15시간 미만)',
    eligibleSub: (h: string, ok: boolean) => `1주 소정근로 ${h}시간${ok ? ' · 결근한 주는 주휴수당이 발생하지 않습니다' : ''}`,
    net: '월 실수령액', gross: '월 급여 (월 환산)',
    weekly: '주급 내역', base: '기본급', juhyu: '주휴수당', ot: '연장 가산 (50%)', night: '야간 가산 (50%)',
    hol: '휴일 가산', weeklyTotal: '주급 합계',
    monthly: '월 환산', monthHint: (h: string) => `약 ${h}시간 · 주급 × 4.345주`,
    deductTitle: '공제 내역', totalDeduct: '공제 합계',
    dedNames: { pension: '국민연금', health: '건강보험', ltc: '장기요양보험', employment: '고용보험', incomeTax: '소득세 (3%)', localTax: '지방소득세 (0.3%)' },
    minWarn: (w: string, y: number) => `${y}년 최저시급(${w})보다 낮습니다. 최저임금 미달은 법 위반입니다.`,
    under5Note: '5인 미만 사업장이라 연장·야간·휴일 가산수당을 넣지 않았습니다.',
    insNote: '근로소득세(간이세액표)는 포함하지 않았습니다. 주 15시간 미만(월 60시간 미만) 근로자는 일부 4대보험 가입 대상이 아닐 수 있습니다.',
    pendingNote: (name: string, note?: string) => `${name}: 아직 확정되지 않았습니다.${note ? ` ${note}` : ''}`,
    taxNote: '3.3%는 사업소득자(프리랜서)에게 적용하는 방식입니다. 사장님의 지시를 받고 일하는 알바생은 원칙적으로 근로자이므로 4대보험 대상일 수 있습니다.',
    basis: (y: number, w: string, d: string) => `${y}년 최저시급 ${w} 기준 · 기준값 확인일 ${d}`,
    disclaimer: '계산 결과는 참고용이며 법적 효력이 없습니다. 정확한 내용은 고용노동부(국번 없이 1350) 또는 노무사와 상담하세요.',
    copy: '결과 복사', copied: '복사됨', save: '이미지 저장', print: '인쇄',
    copyText: (p: CopyParts) => [
      `${p.year}년 기준`, `시급 ${p.wage}`, p.work,
      p.eligible ? `주휴수당 ${p.juhyu} 포함 주급 ${p.weekly}` : `주급 ${p.weekly} (주휴수당 없음)`,
      `월 환산 ${p.monthly}`, ...(p.net ? [`공제 후 실수령 ${p.net}`] : []),
    ].join(' / '),
    workSimple: (d: number, h: string) => `주 ${d}일 × ${h}시간`,
    workSchedule: (h: string) => `근무표 주 ${h}시간`,
  },
  en: {
    modeSimple: 'Quick', modeSchedule: 'Weekly schedule',
    year: 'Rate year', fromJan: 'from Jan 1',
    wage: 'Hourly wage', applyMin: (w: string) => `Use minimum wage (${w})`, wageError: 'Enter an hourly wage.',
    hours: 'Hours per day', hoursHint: 'Actual working hours, excluding breaks', hoursError: 'Hours per day must be 0–24.',
    days: 'Days per week', dayUnit: 'd',
    size: 'Workplace size', under5: 'Under 5 staff', over5: '5+ staff',
    sizeHint: (five: boolean) => five ? 'Overtime, night and holiday hours earn an extra 50%.' : 'No overtime/night premiums, but the weekly holiday allowance still applies.',
    deduction: 'Deductions', dedNone: 'None', dedIns: '4 insurances', ded33: '3.3%',
    dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    start: 'Start', end: 'End', brk: 'Break (min)', holiday: 'Holiday work', off: 'Day off',
    nextDay: 'ends next day', sameTime: 'Start and end times are the same',
    breakShort: (need: number) => `${need === 60 ? '8 hours of work needs a 1-hour break' : '4 hours of work needs a 30-minute break'} or more`,
    dayHours: (h: string, n: string) => `${h} h${n !== '0' ? ` · night ${n} h` : ''}`,
    weekTotal: (h: string, ot: string, n: string) => `${h} h/week · overtime ${ot} h · night ${n} h`,
    eligible: 'Eligible for weekly holiday allowance', notEligible: 'Not eligible (under 15 hours a week)',
    eligibleSub: (h: string, ok: boolean) => `${h} contracted hours a week${ok ? ' · no allowance for a week with an unexcused absence' : ''}`,
    net: 'Monthly take-home', gross: 'Monthly pay (converted)',
    weekly: 'Weekly pay', base: 'Base pay', juhyu: 'Weekly holiday allowance', ot: 'Overtime premium (50%)', night: 'Night premium (50%)',
    hol: 'Holiday premium', weeklyTotal: 'Weekly total',
    monthly: 'Monthly', monthHint: (h: string) => `about ${h} h · weekly × 4.345`,
    deductTitle: 'Deductions', totalDeduct: 'Total deductions',
    dedNames: { pension: 'National pension', health: 'Health insurance', ltc: 'Long-term care', employment: 'Employment insurance', incomeTax: 'Income tax (3%)', localTax: 'Local tax (0.3%)' },
    minWarn: (w: string, y: number) => `Below the ${y} minimum wage (${w}). Paying less is illegal in Korea.`,
    under5Note: 'Under 5 staff: overtime, night and holiday premiums are not added.',
    insNote: 'Income tax (withholding table) is not included. Workers under 15 h/week (60 h/month) may be exempt from some insurances.',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pendingNote: (name: string, _note?: string) => `${name}: not finalised yet — the current rate is used.`,
    taxNote: '3.3% applies to freelancers (business income). A part-timer who works under an employer\'s direction is normally an employee and may be covered by the 4 insurances instead.',
    basis: (y: number, w: string, d: string) => `${y} minimum wage ${w} · rates checked ${d}`,
    disclaimer: 'For reference only, not legal advice. Contact the Ministry of Employment and Labor (1350) for official guidance.',
    copy: 'Copy result', copied: 'Copied', save: 'Save image', print: 'Print',
    copyText: (p: CopyParts) => [
      `${p.year} rates`, `wage ${p.wage}/h`, p.work,
      p.eligible ? `weekly ${p.weekly} incl. holiday allowance ${p.juhyu}` : `weekly ${p.weekly} (no holiday allowance)`,
      `monthly ${p.monthly}`, ...(p.net ? [`take-home ${p.net}`] : []),
    ].join(' / '),
    workSimple: (d: number, h: string) => `${d} days × ${h} h`,
    workSchedule: (h: string) => `schedule ${h} h/week`,
  },
};

interface CopyParts { year: number; wage: string; work: string; eligible: boolean; juhyu: string; weekly: string; monthly: string; net?: string }

const hoursStr = (h: number) => String(Math.round(h * 100) / 100);
const digits = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 9);
const decimal = (v: string) => {
  const [i, ...d] = v.replace(/[^0-9.]/g, '').split('.');
  return d.length ? `${i}.${d.join('').slice(0, 2)}` : i;
};
const kstYear = () => new Date(Date.now() + 9 * 3600_000).getUTCFullYear();

export default function AlbaPayClient({ initialYear }: { initialYear: number }) {
  const isKo = useLocale() === 'ko';
  const L = isKo ? T.ko : T.en;
  const won = (n: number) => (isKo ? `${n.toLocaleString('ko-KR')}원` : `₩${n.toLocaleString('en-US')}`);

  const years = useMemo(() => wageYears(), []);
  const [mode, setMode] = useState<Mode>('simple');
  const [year, setYear] = useState(initialYear);
  const [wage, setWage] = useState(String(basisFor(initialYear).minWage?.value ?? ''));
  const [hours, setHours] = useState('8');
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [days, setDays] = useState<DayInput[]>(DEFAULT_DAYS);
  const [fivePlus, setFivePlus] = useState(false);
  const [deduction, setDeduction] = useState<Deduction>('none');
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLElement>(null);
  const resultColRef = useRef<HTMLElement>(null);
  // 휴대폰: 입력칸을 보는 동안 결과가 화면 밖이면 아래에 실수령액 막대를 띄운다
  const [inputsVisible, setInputsVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(true);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === inputsRef.current) setInputsVisible(e.isIntersecting);
        if (e.target === resultColRef.current) setResultVisible(e.isIntersecting);
      }
    }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
    if (inputsRef.current) io.observe(inputsRef.current);
    if (resultColRef.current) io.observe(resultColRef.current);
    return () => io.disconnect();
  }, []);

  // 마운트 후: 저장된 입력 복원, 없으면 오늘(한국 시간) 연도 선택
  useEffect(() => {
    let saved: Record<string, unknown> | null = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { /* 저장소 없음 */ }
    const nowYear = Math.min(Math.max(kstYear(), years[0]), years[years.length - 1]);
    if (saved && typeof saved === 'object') {
      if (saved.mode === 'simple' || saved.mode === 'schedule') setMode(saved.mode);
      if (typeof saved.year === 'number' && years.includes(saved.year)) setYear(saved.year); else setYear(nowYear);
      if (typeof saved.wage === 'string') setWage(digits(saved.wage));
      if (typeof saved.hours === 'string') setHours(decimal(saved.hours));
      if (typeof saved.daysPerWeek === 'number') setDaysPerWeek(Math.min(7, Math.max(1, saved.daysPerWeek)));
      if (Array.isArray(saved.days) && saved.days.length === 7) setDays(saved.days as DayInput[]);
      if (typeof saved.fivePlus === 'boolean') setFivePlus(saved.fivePlus);
      if (saved.deduction === 'none' || saved.deduction === 'insurance' || saved.deduction === 'tax33') setDeduction(saved.deduction);
    } else if (nowYear !== initialYear) {
      setYear(nowYear);
      setWage(String(basisFor(nowYear).minWage?.value ?? ''));
    }
    loaded.current = true;
  }, [years, initialYear]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ mode, year, wage, hours, daysPerWeek, days, fivePlus, deduction }));
    } catch { /* 저장 실패해도 계산은 그대로 */ }
  }, [mode, year, wage, hours, daysPerWeek, days, fivePlus, deduction]);

  const basis = useMemo(() => basisFor(year), [year]);
  const minWage = basis.minWage?.value ?? 0;

  const changeYear = (y: number) => {
    // 시급이 그 해 최저시급 그대로였으면 새 연도 최저시급으로 바꿔 준다
    if (Number(wage) === minWage) setWage(String(basisFor(y).minWage?.value ?? wage));
    setYear(y);
  };

  const wageNum = Number(wage) || 0;
  const hoursNum = Number(hours) || 0;
  const hoursInvalid = hoursNum < 0 || hoursNum > 24;
  const dayInfo = useMemo(() => days.map(analyzeDay), [days]);

  const result: PayResult | null = useMemo(() => {
    if (wageNum <= 0) return null;
    if (mode === 'simple' && hoursInvalid) return null;
    const work = mode === 'simple' ? simpleDays(hoursNum, daysPerWeek) : scheduleDays(days);
    return calcPay({ wage: wageNum, days: work, fivePlus, deduction, basis });
  }, [wageNum, mode, hoursInvalid, hoursNum, daysPerWeek, days, fivePlus, deduction, basis]);

  const setDay = (i: number, patch: Partial<DayInput>) =>
    setDays((prev) => prev.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const pending = [basis.pension, basis.health, basis.ltc, basis.employment].filter((r) => r?.status === 'pending');
  const lastChecked = [basis.minWage, basis.pension, basis.health, basis.ltc, basis.employment]
    .map((r) => r?.lastChecked ?? '').sort()[0];

  const workLabel = mode === 'simple'
    ? L.workSimple(daysPerWeek, hoursStr(hoursNum))
    : L.workSchedule(hoursStr(result?.totalHours ?? 0));

  const copy = async () => {
    if (!result) return;
    const text = L.copyText({
      year, wage: won(wageNum), work: workLabel, eligible: result.eligible,
      juhyu: won(result.juhyuPay), weekly: won(result.weekly), monthly: won(result.monthly),
      net: deduction !== 'none' ? won(result.net) : undefined,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* 클립보드 권한 없음 */ }
  };

  const saveImage = async () => {
    if (!resultRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      // html2canvas는 CSS 변수를 못 읽으므로 계산된 배경색을 넘긴다
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#ffffff';
      const canvas = await html2canvas(resultRef.current, { scale: 2, backgroundColor: bg });
      const a = document.createElement('a');
      a.download = `alba-pay-${year}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) {
      console.error('image export failed', e);
    }
  };

  const row = (label: string, sub: string | null, amount: number, key?: string) => (
    <div className={s.row} key={key ?? label}>
      <span className={s.rowLabel}>{label}{sub && <small>{sub}</small>}</span>
      <span className={s.rowValue}>{won(amount)}</span>
    </div>
  );
  const hh = (h: number) => (isKo ? `${hoursStr(h)}시간` : `${hoursStr(h)} h`);

  return (
    <div className={s.layout}>
      {/* ── 입력 ── */}
      <section ref={inputsRef} className={`${ui.card} ${s.card} ${s.inputs}`} aria-label={isKo ? '입력' : 'Inputs'}>
        <div className={ui.segmented} role="tablist" aria-label={isKo ? '계산 방식' : 'Mode'}>
          {(['simple', 'schedule'] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m}
              className={`${ui.segment} ${mode === m ? ui.segmentActive : ''}`} onClick={() => setMode(m)}>
              {m === 'simple' ? L.modeSimple : L.modeSchedule}
            </button>
          ))}
        </div>

        <div className={ui.field}>
          <span className={ui.label}>{L.year}</span>
          <div className={`${ui.chips} ${ui.grow}`}>
            {years.map((y) => (
              <button key={y} type="button" aria-pressed={year === y}
                className={`${ui.chip} ${year === y ? ui.chipActive : ''}`} onClick={() => changeYear(y)}>
                {isKo ? `${y}년` : y}
              </button>
            ))}
          </div>
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="alba-wage">{L.wage}</label>
          <div className={ui.inputGroup}>
            <input id="alba-wage" className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" autoComplete="off"
              value={wageNum ? wageNum.toLocaleString('ko-KR') : wage}
              onChange={(e) => setWage(digits(e.target.value))} aria-invalid={wageNum <= 0} />
            <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
          </div>
          {wageNum <= 0 && <span className={ui.error}>{L.wageError}</span>}
          {minWage > 0 && wageNum !== minWage && (
            <button type="button" className={`${ui.chip} ${ui.pill} ${s.applyMin}`} onClick={() => setWage(String(minWage))}>
              {L.applyMin(won(minWage))}
            </button>
          )}
        </div>

        {mode === 'simple' ? (
          <>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="alba-hours">{L.hours}</label>
              <div className={ui.inputGroup}>
                <input id="alba-hours" className={ui.input} inputMode="decimal" autoComplete="off"
                  value={hours} onChange={(e) => setHours(decimal(e.target.value))} aria-invalid={hoursInvalid} />
                <span className={ui.unit}>{isKo ? '시간' : 'h'}</span>
              </div>
              {hoursInvalid ? <span className={ui.error}>{L.hoursError}</span> : <span className={ui.hint}>{L.hoursHint}</span>}
            </div>
            <div className={ui.field}>
              <span className={ui.label}>{L.days}</span>
              <div className={`${ui.chips} ${s.dayChips}`}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button key={n} type="button" aria-pressed={daysPerWeek === n}
                    className={`${ui.chip} ${daysPerWeek === n ? ui.chipActive : ''}`} onClick={() => setDaysPerWeek(n)}>
                    {n}{L.dayUnit}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={s.schedule}>
            {days.map((d, i) => {
              const info = dayInfo[i];
              const overnight = d.on && !info.sameTime && d.end <= d.start;
              return (
                <div key={i} className={`${s.dayRow} ${d.on ? '' : s.dayOff}`}>
                  <label className={s.dayName}>
                    <input type="checkbox" checked={d.on} onChange={(e) => setDay(i, { on: e.target.checked })} />
                    {L.dayNames[i]}
                  </label>
                  {d.on ? (
                    <>
                      <div className={s.dayFields}>
                        <label className={s.mini}>
                          <span>{L.start}</span>
                          <input type="time" className={ui.input} value={d.start} onChange={(e) => setDay(i, { start: e.target.value || '00:00' })} />
                        </label>
                        <label className={s.mini}>
                          <span>{L.end}</span>
                          <input type="time" className={ui.input} value={d.end} onChange={(e) => setDay(i, { end: e.target.value || '00:00' })} />
                        </label>
                        <label className={s.mini}>
                          <span>{L.brk}</span>
                          <input type="number" min={0} max={600} step={10} inputMode="numeric" className={ui.input} value={d.breakMin}
                            onChange={(e) => setDay(i, { breakMin: Math.min(600, Math.max(0, Number(e.target.value) || 0)) })} />
                        </label>
                      </div>
                      <div className={s.dayMeta}>
                        <span>{L.dayHours(hoursStr(info.workMin / 60), hoursStr(info.nightMin / 60))}{overnight && ` · ${L.nextDay}`}</span>
                        <label className={s.holiday}>
                          <input type="checkbox" checked={d.holiday} onChange={(e) => setDay(i, { holiday: e.target.checked })} />
                          {L.holiday}
                        </label>
                      </div>
                      {info.sameTime && <p className={`${ui.notice} ${ui.red} ${s.dayWarn}`}><XCircle />{L.sameTime}</p>}
                      {info.breakShort && <p className={`${ui.notice} ${ui.amber} ${s.dayWarn}`}><AlertTriangle />{L.breakShort(info.breakRequired)}</p>}
                    </>
                  ) : (
                    <span className={s.offText}>{L.off}</span>
                  )}
                </div>
              );
            })}
            {result && (
              <p className={ui.hint}>{L.weekTotal(hoursStr(result.totalHours), hoursStr(result.overtimeHours), hoursStr(result.nightHours))}</p>
            )}
          </div>
        )}

        <div className={ui.field}>
          <span className={ui.label}>{L.size}</span>
          <div className={ui.segmented} role="radiogroup" aria-label={L.size}>
            {[false, true].map((v) => (
              <button key={String(v)} type="button" role="radio" aria-checked={fivePlus === v}
                className={`${ui.segment} ${fivePlus === v ? ui.segmentActive : ''}`} onClick={() => setFivePlus(v)}>
                {v ? L.over5 : L.under5}
              </button>
            ))}
          </div>
          <span className={ui.hint}>{L.sizeHint(fivePlus)}</span>
        </div>

        <div className={ui.field}>
          <span className={ui.label}>{L.deduction}</span>
          <div className={ui.segmented} role="radiogroup" aria-label={L.deduction}>
            {(['none', 'insurance', 'tax33'] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={deduction === v}
                className={`${ui.segment} ${deduction === v ? ui.segmentActive : ''}`} onClick={() => setDeduction(v)}>
                {v === 'none' ? L.dedNone : v === 'insurance' ? L.dedIns : L.ded33}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 결과 ── */}
      <section ref={resultColRef} className={s.resultCol} aria-live="polite" aria-label={isKo ? '계산 결과' : 'Result'}>
        {result ? (
          <>
            <div ref={resultRef} className={`${ui.card} ${s.card} ${s.resultCard}`}>
              <div className={`${ui.notice} ${result.eligible ? ui.green : ui.gray} ${s.eligibility}`}>
                {result.eligible ? <CheckCircle2 /> : <Info />}
                <div>
                  <strong>{result.eligible ? L.eligible : L.notEligible}</strong>
                  <span>{L.eligibleSub(hoursStr(result.contractHours), result.eligible)}</span>
                </div>
              </div>

              <div className={ui.result}>
                <div className={ui.resultLabel}>{deduction === 'none' ? L.gross : L.net}</div>
                <div className={ui.resultValue}>{won(deduction === 'none' ? result.monthly : result.net)}</div>
              </div>

              {result.belowMinWage && (
                <p className={`${ui.notice} ${ui.red}`}><AlertTriangle />{L.minWarn(won(minWage), year)}</p>
              )}

              <div>
                <h3 className={s.subTitle}>{L.weekly}</h3>
                {row(L.base, hh(result.totalHours), result.basePay)}
                {result.eligible && row(L.juhyu, hh(result.juhyuHours), result.juhyuPay)}
                {fivePlus && result.overtimeHours > 0 && row(L.ot, hh(result.overtimeHours), result.overtimePay)}
                {fivePlus && result.nightHours > 0 && row(L.night, hh(result.nightHours), result.nightPay)}
                {fivePlus && result.holidayHours > 0 && row(L.hol, hh(result.holidayHours), result.holidayPay)}
                <div className={`${s.row} ${s.total}`}>
                  <span className={s.rowLabel}>{L.weeklyTotal}</span>
                  <span className={s.rowValue}>{won(result.weekly)}</span>
                </div>
                <div className={`${s.row} ${s.total}`}>
                  <span className={s.rowLabel}>{L.monthly}<small>{L.monthHint(hoursStr(Math.round(result.monthHours * 10) / 10))}</small></span>
                  <span className={s.rowValue}>{won(result.monthly)}</span>
                </div>
              </div>

              {deduction !== 'none' && (
                <div>
                  <h3 className={s.subTitle}>{L.deductTitle}</h3>
                  {result.deductions.map((d) => row(L.dedNames[d.key], null, d.amount, d.key))}
                  <div className={`${s.row} ${s.total}`}>
                    <span className={s.rowLabel}>{L.totalDeduct}</span>
                    <span className={`${s.rowValue} ${s.minus}`}>−{won(result.totalDeduction)}</span>
                  </div>
                </div>
              )}

              {!fivePlus && (result.overtimeHours > 0 || result.nightHours > 0 || result.holidayHours > 0) && (
                <p className={`${ui.notice} ${ui.blue}`}><Info />{L.under5Note}</p>
              )}
              {deduction === 'insurance' && <p className={`${ui.notice} ${ui.gray}`}><Info />{L.insNote}</p>}
              {deduction === 'insurance' && pending.map((r) => r && (
                <p key={r.id} className={`${ui.notice} ${ui.amber}`}><AlertTriangle />{L.pendingNote(r.name, r.note)}</p>
              ))}
              {deduction === 'tax33' && <p className={`${ui.notice} ${ui.amber}`}><AlertTriangle />{L.taxNote}</p>}

              <p className={s.basis}>
                {L.basis(year, won(minWage), lastChecked)}
                {year > kstYear() && ` (${L.fromJan})`}
              </p>
              <p className={s.disclaimer}>{L.disclaimer}</p>
            </div>

            <div className={s.actions}>
              <button type="button" className={`${ui.button} ${copied ? ui.primary : ui.secondary}`} onClick={copy}>
                <Copy />{copied ? L.copied : L.copy}
              </button>
              <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={saveImage}><Download />{L.save}</button>
              <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => window.print()}><Printer />{L.print}</button>
            </div>
          </>
        ) : (
          <div className={`${ui.card} ${s.card}`}>
            <p className={ui.hint}>{wageNum <= 0 ? L.wageError : L.hoursError}</p>
          </div>
        )}
      </section>

      {result && inputsVisible && !resultVisible && (
        <button type="button" className={s.mobileBar}
          onClick={() => resultColRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <span>{deduction === 'none' ? L.gross : L.net}</span>
          <strong>{won(deduction === 'none' ? result.monthly : result.net)}</strong>
        </button>
      )}
    </div>
  );
}
