'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

/* ─── Constants ─── */
const BRANCHES = [
  { id: 'army',    name: '육군',        nameEn: 'Army',                 months: 18 },
  { id: 'navy',    name: '해군',        nameEn: 'Navy',                 months: 20 },
  { id: 'airforce',name: '공군',        nameEn: 'Air Force',            months: 21 },
  { id: 'marines', name: '해병대',      nameEn: 'Marine Corps',         months: 18 },
  { id: 'social',  name: '사회복무요원', nameEn: 'Social Service Agent', months: 21 },
  { id: 'reserve', name: '상근예비역',  nameEn: 'Full-time Reservist',  months: 18 },
];

type Tab = 'age' | 'military' | 'ovulation';

/* ─── Helpers ─── */
function toKorDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function fmtDate(date: Date, isKo: boolean) {
  return isKo
    ? toKorDate(date)
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function calcAge(birthStr: string) {
  const today = new Date();
  const birth = new Date(birthStr);
  let man = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) man--;
  const yeon = today.getFullYear() - birth.getFullYear();
  return {
    man,
    yeon,
    saenun: yeon + 1,
    elementaryYear: birth.getFullYear() + 7,
    nextBirthday: (() => {
      const nb = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
      if (nb <= today) nb.setFullYear(nb.getFullYear() + 1);
      const diff = Math.ceil((nb.getTime() - today.getTime()) / 86400000);
      return diff;
    })(),
  };
}

function calcMilitary(enlistStr: string, months: number) {
  const enlist = new Date(enlistStr);
  const discharge = addMonths(enlist, months);
  const today = new Date();
  const totalMs = discharge.getTime() - enlist.getTime();
  const elapsed = today.getTime() - enlist.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
  const daysLeft = Math.ceil((discharge.getTime() - today.getTime()) / 86400000);
  const totalDays = Math.ceil(totalMs / 86400000);
  return { discharge, progress, daysLeft, totalDays };
}

/* ─── Ovulation mini-calendar ─── */
function OvulationCalendar({
  lmpStr, cycleLength, isKo,
}: { lmpStr: string; cycleLength: number; isKo: boolean }) {
  const lmp = new Date(lmpStr);
  const ovDay = new Date(lmp);
  ovDay.setDate(ovDay.getDate() + cycleLength - 14);
  const fertileStart = new Date(ovDay);
  fertileStart.setDate(ovDay.getDate() - 5);
  const fertileEnd = new Date(ovDay);
  fertileEnd.setDate(ovDay.getDate() + 1);
  const nextPeriod = new Date(lmp);
  nextPeriod.setDate(lmp.getDate() + cycleLength);
  const menEnd = new Date(lmp);
  menEnd.setDate(lmp.getDate() + 4);

  // Show two months starting from lmp month
  const months = [0, 1].map(offset => {
    const y = lmp.getFullYear();
    const m = lmp.getMonth() + offset;
    return { year: m > 11 ? y + 1 : y, month: m > 11 ? m - 12 : m };
  });

  function getDayType(d: Date): 'men' | 'fertile' | 'ovulation' | 'next' | '' {
    if (d.toDateString() === ovDay.toDateString()) return 'ovulation';
    if (d >= fertileStart && d <= fertileEnd) return 'fertile';
    if (d >= lmp && d <= menEnd) return 'men';
    if (d.toDateString() === nextPeriod.toDateString()) return 'next';
    return '';
  }

  const dayColors: Record<string, { bg: string; color: string }> = {
    ovulation: { bg: '#f59e0b', color: '#fff' },
    fertile:   { bg: '#10b981', color: '#fff' },
    men:       { bg: '#f87171', color: '#fff' },
    next:      { bg: '#818cf8', color: '#fff' },
  };

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
        {(isKo ? [
          { label: '생리 예정일', color: '#f87171' },
          { label: '가임 기간', color: '#10b981' },
          { label: '배란 예정일', color: '#f59e0b' },
          { label: '다음 생리 예측', color: '#818cf8' },
        ] : [
          { label: 'Period', color: '#f87171' },
          { label: 'Fertile window', color: '#10b981' },
          { label: 'Expected ovulation', color: '#f59e0b' },
          { label: 'Next period (predicted)', color: '#818cf8' },
        ]).map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
            {l.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {months.map(({ year, month }) => {
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const cells: (Date | null)[] = Array(firstDay).fill(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

          return (
            <div key={`${year}-${month}`}>
              <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {isKo
                  ? <>{year}년 {month + 1}월</>
                  : new Date(year, month, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {(isKo ? ['일', '월', '화', '수', '목', '금', '토'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', padding: '4px 0', fontWeight: 600 }}>{d}</div>
                ))}
                {cells.map((date, i) => {
                  if (!date) return <div key={`e${i}`} />;
                  const type = getDayType(date);
                  const style = type ? dayColors[type] : { bg: undefined, color: undefined };
                  return (
                    <div
                      key={i}
                      style={{
                        textAlign: 'center', padding: '5px 2px',
                        borderRadius: '50%', fontSize: '0.8rem',
                        background: style.bg ?? 'transparent',
                        color: style.color ?? 'var(--text-primary)',
                        fontWeight: type ? 700 : 400,
                      }}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {(isKo ? [
          { label: '배란 예정일', value: toKorDate(ovDay), color: '#f59e0b' },
          { label: '가임기 시작', value: toKorDate(fertileStart), color: '#10b981' },
          { label: '가임기 종료', value: toKorDate(fertileEnd), color: '#10b981' },
          { label: '다음 생리 예측', value: toKorDate(nextPeriod), color: '#818cf8' },
        ] : [
          { label: 'Expected ovulation', value: fmtDate(ovDay, false), color: '#f59e0b' },
          { label: 'Fertile window starts', value: fmtDate(fertileStart, false), color: '#10b981' },
          { label: 'Fertile window ends', value: fmtDate(fertileEnd, false), color: '#10b981' },
          { label: 'Next period (predicted)', value: fmtDate(nextPeriod, false), color: '#818cf8' },
        ]).map(item => (
          <div key={item.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '0.75rem', borderLeft: `3px solid ${item.color}` }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{item.label}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AgeCalcClient({ seo }: { seo?: React.ReactNode }) {
  const isKo = useLocale() === 'ko';
  const [tab, setTab] = useState<Tab>('age');

  // Age tab
  const [birthDate, setBirthDate] = useState('');
  // Military tab
  const [enlistDate, setEnlistDate] = useState('');
  const [branch, setBranch] = useState('army');
  // Ovulation tab
  const [lmp, setLmp] = useState('');
  const [cycleLength, setCycleLength] = useState(28);

  // LocalStorage restore
  useEffect(() => {
    try {
      setBirthDate(localStorage.getItem('kage_birth') ?? '');
      setEnlistDate(localStorage.getItem('kage_enlist') ?? '');
      setBranch(localStorage.getItem('kage_branch') ?? 'army');
      setLmp(localStorage.getItem('kage_lmp') ?? '');
      const cl = parseInt(localStorage.getItem('kage_cycle') ?? '28');
      if (cl >= 21 && cl <= 35) setCycleLength(cl);
    } catch {}
  }, []);

  const saveBirth = (v: string) => { setBirthDate(v); try { localStorage.setItem('kage_birth', v); } catch {} };
  const saveEnlist = (v: string) => { setEnlistDate(v); try { localStorage.setItem('kage_enlist', v); } catch {} };
  const saveBranch = (v: string) => { setBranch(v); try { localStorage.setItem('kage_branch', v); } catch {} };
  const saveLmp = (v: string) => { setLmp(v); try { localStorage.setItem('kage_lmp', v); } catch {} };
  const saveCycle = (v: number) => { setCycleLength(v); try { localStorage.setItem('kage_cycle', String(v)); } catch {} };

  const ageResult = useMemo(() => birthDate ? calcAge(birthDate) : null, [birthDate]);
  const milResult = useMemo(() => {
    if (!enlistDate) return null;
    const b = BRANCHES.find(b => b.id === branch)!;
    return calcMilitary(enlistDate, b.months);
  }, [enlistDate, branch]);

  const panelStyle: React.CSSProperties = { marginBottom: '2rem' };
  const resultCard = (label: string, value: string, sub?: string, color?: string) => (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', borderLeft: `4px solid ${color ?? 'var(--primary)'}` }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: color ?? 'var(--primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );

  const TABS: { id: Tab; label: string; icon: string }[] = isKo ? [
    { id: 'age', label: '만나이 계산', icon: '🎂' },
    { id: 'military', label: '전역일 계산', icon: '🪖' },
    { id: 'ovulation', label: '배란일 예측', icon: '🌸' },
  ] : [
    { id: 'age', label: 'International Age', icon: '🎂' },
    { id: 'military', label: 'Discharge Date', icon: '🪖' },
    { id: 'ovulation', label: 'Ovulation', icon: '🌸' },
  ];

  return (
    <div>
      <NavigationActions />

      <ToolHeader
        icon={<Calendar />}
        title={isKo ? '한국형 날짜 계산기' : 'Korean Date Calculator'}
        subtitle={isKo ? '만나이 · 전역일 · 배란일 — 한국 생활에 필요한 날짜 계산을 한 곳에서' : 'International age · Military discharge · Ovulation — the date calculations you need for life in Korea, all in one place'}
      />

      {/* Tabs */}
      <div className={ui.segmented} style={{ marginBottom: '2rem' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`${ui.segment} ${tab === t.id ? ui.segmentActive : ''}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Age Tab ── */}
      {tab === 'age' && (
        <div className={ui.card} style={panelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={ui.field}>
              <label className={ui.label}>{isKo ? '생년월일' : 'Date of birth'}</label>
              <input type="date" value={birthDate} onChange={e => saveBirth(e.target.value)} className={ui.input} style={{ maxWidth: '280px' }} />
            </div>

            {ageResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {isKo ? (
                  <>
                    {resultCard('만 나이', `만 ${ageResult.man}세`, '현행 법률 기준 (2023년 만나이 통일법)', '#6366f1')}
                    {resultCard('연 나이', `${ageResult.yeon}세`, '연도 차이만 계산', '#3b82f6')}
                    {resultCard('세는 나이', `${ageResult.saenun}세`, '태어난 해를 1세로 시작', '#8b5cf6')}
                    {resultCard('초등학교 입학 연도', `${ageResult.elementaryYear}년`, '생년 + 7년 기준', '#10b981')}
                    {resultCard('다음 생일까지', `${ageResult.nextBirthday}일`, '만나이가 바뀌는 날', '#f59e0b')}
                  </>
                ) : (
                  <>
                    {resultCard('International age', `${ageResult.man} years`, 'Current legal standard (2023 Age Unification Act)', '#6366f1')}
                    {resultCard('Year age', `${ageResult.yeon} years`, 'Current year minus birth year', '#3b82f6')}
                    {resultCard('Counting age (traditional)', `${ageResult.saenun} years`, 'You are 1 in the year you are born', '#8b5cf6')}
                    {resultCard('Elementary school entry', `${ageResult.elementaryYear}`, 'Birth year + 7', '#10b981')}
                    {resultCard('Until next birthday', `${ageResult.nextBirthday} days`, 'When your international age goes up', '#f59e0b')}
                  </>
                )}
              </div>
            )}

            {!birthDate && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                {isKo ? '생년월일을 입력하면 결과가 표시됩니다' : 'Enter your date of birth to see the results'}
              </p>
            )}

            <div className={`${ui.notice} ${ui.blue}`} style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                {isKo ? (
                  <>ℹ️ <strong>만나이 통일법 (2023.6.28 시행)</strong> — 공공·행정·법령 문서에서 모두 '만 나이' 기준을 사용합니다. 단, 병역·연금 등 일부 법률은 별도 기준을 적용할 수 있습니다.</>
                ) : (
                  <>ℹ️ <strong>Age Unification Act (effective June 28, 2023)</strong> — Public, administrative, and legal documents in Korea now all use international age. However, some laws such as military service and pensions may still apply their own standards.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Military Tab ── */}
      {tab === 'military' && (
        <div className={ui.card} style={panelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={ui.field}>
                <label className={ui.label}>{isKo ? '입대일' : 'Enlistment date'}</label>
                <input type="date" value={enlistDate} onChange={e => saveEnlist(e.target.value)} className={ui.input} />
              </div>
              <div className={ui.field}>
                <label className={ui.label}>{isKo ? '군별 / 복무 유형' : 'Branch / service type'}</label>
                <select value={branch} onChange={e => saveBranch(e.target.value)} className={ui.input}>
                  {BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{isKo ? <>{b.name} ({b.months}개월)</> : <>{b.nameEn} ({b.months} months)</>}</option>
                  ))}
                </select>
              </div>
            </div>

            {milResult && (() => {
              const pct = milResult.progress;
              const finished = milResult.daysLeft <= 0;
              const barColor = finished ? '#10b981' : pct > 75 ? '#f59e0b' : 'var(--primary)';
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span>{isKo ? (finished ? '✅ 전역 완료!' : `복무율 ${pct.toFixed(1)}%`) : (finished ? '✅ Discharged!' : `Service completed ${pct.toFixed(1)}%`)}</span>
                      <span>{isKo ? <>총 {milResult.totalDays}일</> : <>Total {milResult.totalDays} days</>}</span>
                    </div>
                    <div style={{ background: 'var(--surface)', borderRadius: '999px', height: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                        borderRadius: '999px', transition: 'width 0.5s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        paddingRight: pct > 10 ? '8px' : 0,
                      }}>
                        {pct > 15 && <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>{pct.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {isKo ? (
                      <>
                        {resultCard('전역 예정일', toKorDate(milResult.discharge), BRANCHES.find(b => b.id === branch)!.name, '#6366f1')}
                        {!finished && resultCard('전역까지', `${milResult.daysLeft}일`, '오늘 기준', '#f59e0b')}
                        {finished && resultCard('전역일로부터', `${Math.abs(milResult.daysLeft)}일 경과`, '이미 전역', '#10b981')}
                      </>
                    ) : (
                      <>
                        {resultCard('Expected discharge date', fmtDate(milResult.discharge, false), BRANCHES.find(b => b.id === branch)!.nameEn, '#6366f1')}
                        {!finished && resultCard('Until discharge', `${milResult.daysLeft} days`, 'As of today', '#f59e0b')}
                        {finished && resultCard('Since discharge', `${Math.abs(milResult.daysLeft)} days ago`, 'Already discharged', '#10b981')}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {!enlistDate && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                {isKo ? '입대일과 군별을 선택하면 전역일이 계산됩니다' : 'Choose your enlistment date and branch to calculate your discharge date'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Ovulation Tab ── */}
      {tab === 'ovulation' && (
        <div className={ui.card} style={panelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={ui.field}>
                <label className={ui.label}>{isKo ? '마지막 생리 시작일' : 'First day of last period'}</label>
                <input type="date" value={lmp} onChange={e => saveLmp(e.target.value)} className={ui.input} />
              </div>
              <div className={ui.field}>
                <label className={ui.label}>{isKo ? <>평균 생리 주기 (일): {cycleLength}일</> : <>Average cycle length: {cycleLength} days</>}</label>
                <input
                  type="range" min={21} max={35} value={cycleLength}
                  onChange={e => saveCycle(Number(e.target.value))}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isKo ? <><span>21일</span><span>35일</span></> : <><span>21 days</span><span>35 days</span></>}
                </div>
              </div>
            </div>

            {lmp && <OvulationCalendar lmpStr={lmp} cycleLength={cycleLength} isKo={isKo} />}

            {!lmp && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                {isKo ? '마지막 생리 시작일을 입력하면 달력이 표시됩니다' : 'Enter the first day of your last period to see the calendar'}
              </p>
            )}

            <div className={`${ui.notice} ${ui.amber}`}>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                {isKo
                  ? '⚠️ 본 도구는 평균 주기를 기반으로 한 참고용 예측값입니다. 실제 배란일과 가임기는 개인의 건강 상태에 따라 다를 수 있으므로 전문의 상담을 권장합니다.'
                  : '⚠️ This tool gives a reference estimate based on your average cycle. Actual ovulation and fertile days vary with individual health, so please consult a doctor for medical advice.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ad */}

      <ShareBar title={isKo ? '한국형 날짜 계산기 (만나이·전역일·배란일)' : 'Korean Date Calculator (Age · Discharge · Ovulation)'} />
      <RelatedTools toolId="utilities/lifestyle/age-calc" />

      {seo}
    </div>
  );
}
