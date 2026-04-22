'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

/* ─── Constants ─── */
const BRANCHES = [
  { id: 'army',    name: '육군',        months: 18 },
  { id: 'navy',    name: '해군',        months: 20 },
  { id: 'airforce',name: '공군',        months: 21 },
  { id: 'marines', name: '해병대',      months: 18 },
  { id: 'social',  name: '사회복무요원', months: 21 },
  { id: 'reserve', name: '상근예비역',  months: 18 },
];

type Tab = 'age' | 'military' | 'ovulation';

/* ─── Helpers ─── */
function toKorDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
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
  lmpStr, cycleLength,
}: { lmpStr: string; cycleLength: number }) {
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
        {[
          { label: '생리 예정일', color: '#f87171' },
          { label: '가임 기간', color: '#10b981' },
          { label: '배란 예정일', color: '#f59e0b' },
          { label: '다음 생리 예측', color: '#818cf8' },
        ].map(l => (
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
                {year}년 {month + 1}월
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
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
        {[
          { label: '배란 예정일', value: toKorDate(ovDay), color: '#f59e0b' },
          { label: '가임기 시작', value: toKorDate(fertileStart), color: '#10b981' },
          { label: '가임기 종료', value: toKorDate(fertileEnd), color: '#10b981' },
          { label: '다음 생리 예측', value: toKorDate(nextPeriod), color: '#818cf8' },
        ].map(item => (
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
export default function AgeCalcClient() {
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

  const panelStyle: React.CSSProperties = { padding: '2rem', marginBottom: '2rem' };
  const inputStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' };
  const resultCard = (label: string, value: string, sub?: string, color?: string) => (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', borderLeft: `4px solid ${color ?? 'var(--primary)'}` }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: color ?? 'var(--primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'age', label: '만나이 계산', icon: '🎂' },
    { id: 'military', label: '전역일 계산', icon: '🪖' },
    { id: 'ovulation', label: '배란일 예측', icon: '🌸' },
  ];

  return (
    <div>
      <NavigationActions />

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Calendar size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>한국형 날짜 계산기</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>만나이 · 전역일 · 배란일 — 한국 생활에 필요한 날짜 계산을 한 곳에서</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)',
              border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              background: tab === t.id ? 'var(--primary)' : 'var(--surface)',
              color: tab === t.id ? '#fff' : 'var(--text-primary)',
              borderBottom: tab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Age Tab ── */}
      {tab === 'age' && (
        <div className="glass-panel" style={panelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>생년월일</label>
              <input type="date" value={birthDate} onChange={e => saveBirth(e.target.value)} style={inputStyle} />
            </div>

            {ageResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {resultCard('만 나이', `만 ${ageResult.man}세`, '현행 법률 기준 (2023년 만나이 통일법)', '#6366f1')}
                {resultCard('연 나이', `${ageResult.yeon}세`, '연도 차이만 계산', '#3b82f6')}
                {resultCard('세는 나이', `${ageResult.saenun}세`, '태어난 해를 1세로 시작', '#8b5cf6')}
                {resultCard('초등학교 입학 연도', `${ageResult.elementaryYear}년`, '생년 + 7년 기준', '#10b981')}
                {resultCard('다음 생일까지', `${ageResult.nextBirthday}일`, '만나이가 바뀌는 날', '#f59e0b')}
              </div>
            )}

            {!birthDate && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                생년월일을 입력하면 결과가 표시됩니다
              </p>
            )}

            <div className="glass-panel" style={{ padding: '1rem', background: 'var(--surface)', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                ℹ️ <strong>만나이 통일법 (2023.6.28 시행)</strong> — 공공·행정·법령 문서에서 모두 '만 나이' 기준을 사용합니다. 단, 병역·연금 등 일부 법률은 별도 기준을 적용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Military Tab ── */}
      {tab === 'military' && (
        <div className="glass-panel" style={panelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>입대일</label>
                <input type="date" value={enlistDate} onChange={e => saveEnlist(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={labelStyle}>군별 / 복무 유형</label>
                <select value={branch} onChange={e => saveBranch(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                  {BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.months}개월)</option>
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
                      <span>{finished ? '✅ 전역 완료!' : `복무율 ${pct.toFixed(1)}%`}</span>
                      <span>총 {milResult.totalDays}일</span>
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
                    {resultCard('전역 예정일', toKorDate(milResult.discharge), BRANCHES.find(b => b.id === branch)!.name, '#6366f1')}
                    {!finished && resultCard('전역까지', `${milResult.daysLeft}일`, '오늘 기준', '#f59e0b')}
                    {finished && resultCard('전역일로부터', `${Math.abs(milResult.daysLeft)}일 경과`, '이미 전역', '#10b981')}
                  </div>
                </div>
              );
            })()}

            {!enlistDate && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                입대일과 군별을 선택하면 전역일이 계산됩니다
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Ovulation Tab ── */}
      {tab === 'ovulation' && (
        <div className="glass-panel" style={panelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>마지막 생리 시작일</label>
                <input type="date" value={lmp} onChange={e => saveLmp(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={labelStyle}>평균 생리 주기 (일): {cycleLength}일</label>
                <input
                  type="range" min={21} max={35} value={cycleLength}
                  onChange={e => saveCycle(Number(e.target.value))}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>21일</span><span>35일</span>
                </div>
              </div>
            </div>

            {lmp && <OvulationCalendar lmpStr={lmp} cycleLength={cycleLength} />}

            {!lmp && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                마지막 생리 시작일을 입력하면 달력이 표시됩니다
              </p>
            )}

            <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                ⚠️ 본 도구는 평균 주기를 기반으로 한 참고용 예측값입니다. 실제 배란일과 가임기는 개인의 건강 상태에 따라 다를 수 있으므로 전문의 상담을 권장합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ad */}
      <div style={{
        background: 'var(--surface)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)', height: '90px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem',
      }}>광고 영역 (728×90)</div>

      <ShareBar title="한국형 날짜 계산기 (만나이·전역일·배란일)" />
      <RelatedTools toolId="utilities/lifestyle/age-calc" />

      <SeoSection
        ko={{
          title: '만나이·전역일·배란일 계산기 — 계산 공식·법적 기준·FAQ',
          description: `한국형 날짜 계산기는 한국 생활에서 자주 필요한 세 가지 날짜 계산 — 만나이, 전역일, 배란일 — 을 하나의 도구에서 제공합니다.

【만나이 통일법 (2023년 6월 28일 시행)】
2023년 6월부터 민법과 행정기본법 개정으로 공공·행정·법령 문서에서 '만 나이'가 공식 기준이 되었습니다. 만 나이는 생일이 지났을 때 1세를 더하는 방식으로, 국제 표준과 동일합니다. 반면 '연 나이'는 현재 연도에서 출생 연도를 빼는 방식이고, '세는 나이'는 태어난 해를 1세로 시작해 새해마다 1세를 더하는 한국 전통 방식입니다. 이 계산기는 세 가지 나이를 모두 표시하며, 초등학교 입학 예정 연도(생년 + 7)와 다음 생일까지의 남은 일수도 함께 알려줍니다.

【군 복무 기간 (2024년 기준)】
육군·해병대 18개월, 해군 20개월, 공군 21개월, 사회복무요원·상근예비역 21개월을 기준으로 전역 예정일을 계산합니다. 게이지 바로 현재 복무율을 한눈에 파악할 수 있습니다.

【배란일 계산 공식】
배란 예정일 = 마지막 생리 시작일 + (주기 - 14일). 가임기는 배란일 기준 -5일 ~ +1일로 표시합니다. 달력 UI로 생리 예정일, 가임기, 배란 예정일, 다음 생리 예측일을 한눈에 확인할 수 있습니다.`,
          useCases: [
            { icon: '🎂', title: '만나이 확인', desc: '2023년 만나이 통일법 시행 이후 공식 나이를 정확히 확인합니다.' },
            { icon: '🪖', title: '전역일·복무율 계산', desc: '입대일과 군별을 선택하면 전역일과 복무 진행률이 즉시 표시됩니다.' },
            { icon: '🌸', title: '배란일 예측', desc: '마지막 생리일과 주기를 입력해 달력 형태로 가임기를 확인합니다.' },
            { icon: '💾', title: '브라우저 자동 저장', desc: '입력한 정보가 LocalStorage에 저장되어 다음 방문 시에도 유지됩니다.' },
          ],
          steps: [
            { step: '1', desc: '상단 탭에서 계산 유형(만나이/전역일/배란일)을 선택' },
            { step: '2', desc: '날짜 또는 주기를 입력' },
            { step: '3', desc: '결과가 즉시 표시됨 — 버튼 클릭 불필요' },
            { step: '4', desc: '입력값은 브라우저에 자동 저장되어 재방문 시 복원' },
          ],
          faqs: [
            {
              q: '군 복무 기간 단축이나 단기 복무 반영이 되나요?',
              a: '현재 도구는 2024년 기준 표준 복무 기간을 사용합니다. 특기병, 부사관, 장교, 전문연구요원 등 비표준 복무 기간은 별도로 적용되지 않습니다. 정확한 전역일은 복무 부대에 문의하세요.',
            },
            {
              q: '만나이와 연나이 중 어떤 나이를 사용해야 하나요?',
              a: '2023년 6월부터 의료·행정·법령 문서는 만 나이를 기준으로 합니다. 단, 병역법·청소년보호법 등 일부 법률은 기존 연 나이나 세는 나이를 계속 사용할 수 있으므로 해당 법률을 확인하세요.',
            },
            {
              q: '배란일 계산이 부정확한 이유는 무엇인가요?',
              a: '배란일은 개인의 건강 상태, 스트레스, 호르몬 불균형에 따라 달라질 수 있습니다. 이 도구는 평균 주기를 기반으로 한 통계적 예측값으로, 임신을 계획하고 있다면 산부인과 전문의의 상담이 필요합니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
            },
          ],
        }}
        en={{
          title: 'Korean Age / Military Discharge / Ovulation Calculator — Formulas & FAQ',
          description: `The Korean Date Calculator combines three essential date calculations for life in Korea — Korean age (만나이), military discharge date (전역일), and ovulation prediction (배란일) — into one tool.

【Korean Age Unification Act (Effective June 28, 2023)】
As of June 2023, South Korea officially adopted the international "full age" (만나이) system in all administrative and legal documents. Under this system, age increases only on birthdays, matching the global standard. The tool also displays "year age" (연나이, birth year subtracted from the current year) and "counting age" (세는나이, the traditional Korean system where you are 1 at birth and gain a year each New Year). Elementary school enrollment year is calculated as birth year + 7.

【Military Service Periods (2024 Standard)】
Army & Marines: 18 months, Navy: 20 months, Air Force: 21 months, Social Service Workers: 21 months. The discharge date and a visual progress gauge are instantly displayed after entering the enlistment date and branch.

【Ovulation Calculation Formula】
Ovulation day = Last menstrual period (LMP) + (cycle length − 14). The fertile window spans from 5 days before ovulation to 1 day after. All dates are displayed on a color-coded mini calendar.`,
          useCases: [
            { icon: '🎂', title: 'Official age check', desc: 'Verify your official 만나이 under the 2023 Korean Age Unification Act.' },
            { icon: '🪖', title: 'Discharge & progress', desc: 'Enter enlistment date and branch to see discharge date and service completion rate.' },
            { icon: '🌸', title: 'Ovulation prediction', desc: 'Enter last period date and cycle to view fertile window on a color-coded calendar.' },
            { icon: '💾', title: 'Auto-saved', desc: 'Inputs are saved to LocalStorage and restored automatically on next visit.' },
          ],
          steps: [
            { step: '1', desc: 'Select a calculation type (Age / Military / Ovulation) from the tabs' },
            { step: '2', desc: 'Enter your date or cycle information' },
            { step: '3', desc: 'Results appear instantly — no submit button needed' },
            { step: '4', desc: 'Inputs are automatically saved to your browser for next time' },
          ],
          faqs: [
            {
              q: 'Does the military calculator account for shortened or extended service?',
              a: 'The tool uses standard 2024 service durations. Special roles (commissioned officers, NCOs, research specialists, etc.) have different service lengths not covered here. Contact your unit for a precise discharge date.',
            },
            {
              q: 'Which age system should I use for official documents?',
              a: 'Since June 2023, 만나이 (full age) is required in medical, administrative, and most legal documents. However, certain laws such as the Military Service Act and Youth Protection Act may still reference 연나이 or 세는나이, so always verify the applicable law.',
            },
            {
              q: 'Why might my ovulation date be different from this estimate?',
              a: 'Ovulation can shift due to stress, illness, hormonal fluctuations, or irregular cycles. This tool provides a statistical estimate based on average cycle length. For family planning or fertility concerns, consult a licensed OB/GYN.',
            },
            {
              q: 'Can I use this result as official data?',
              a: 'Results are for reference only. Please consult a professional or official source for accurate figures.',
            },
          ],
        }}
      />
    </div>
  );
}
