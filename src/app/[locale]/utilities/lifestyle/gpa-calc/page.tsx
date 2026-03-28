'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { GraduationCap } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

/* ─── Types ─── */
type Scale = '4.5' | '4.3' | '100';
type CourseType = 'major' | 'liberal' | 'other';

interface Course {
  id: number;
  name: string;
  credits: number;
  grade: string;
  type: CourseType;
}

/* ─── Grade tables ─── */
const GRADES: Record<Scale, { label: string; value: number }[]> = {
  '4.5': [
    { label: 'A+', value: 4.5 }, { label: 'A0', value: 4.0 },
    { label: 'B+', value: 3.5 }, { label: 'B0', value: 3.0 },
    { label: 'C+', value: 2.5 }, { label: 'C0', value: 2.0 },
    { label: 'D+', value: 1.5 }, { label: 'D0', value: 1.0 },
    { label: 'F',  value: 0.0 },
  ],
  '4.3': [
    { label: 'A+', value: 4.3 }, { label: 'A',  value: 4.0 },
    { label: 'B+', value: 3.3 }, { label: 'B',  value: 3.0 },
    { label: 'C+', value: 2.3 }, { label: 'C',  value: 2.0 },
    { label: 'D+', value: 1.3 }, { label: 'D',  value: 1.0 },
    { label: 'F',  value: 0.0 },
  ],
  '100': [
    { label: 'A+ (95-100)', value: 97.5 }, { label: 'A  (90-94)',  value: 92.0 },
    { label: 'B+ (85-89)',  value: 87.0 }, { label: 'B  (80-84)',  value: 82.0 },
    { label: 'C+ (75-79)',  value: 77.0 }, { label: 'C  (70-74)',  value: 72.0 },
    { label: 'D+ (65-69)',  value: 67.0 }, { label: 'D  (60-64)',  value: 62.0 },
    { label: 'F  (<60)',    value: 0.0  },
  ],
};

// Conversions to GPA 4.5
function toGpa45(grade: string, scale: Scale): number {
  const found = GRADES[scale].find(g => g.label === grade);
  if (!found) return 0;
  if (scale === '4.5') return found.value;
  if (scale === '4.3') return Math.round((found.value / 4.3) * 4.5 * 100) / 100;
  // 100-point
  const v = found.value;
  if (v >= 95) return 4.5;
  if (v >= 90) return 4.0;
  if (v >= 85) return 3.5;
  if (v >= 80) return 3.0;
  if (v >= 75) return 2.5;
  if (v >= 70) return 2.0;
  if (v >= 65) return 1.5;
  if (v >= 60) return 1.0;
  return 0;
}

function gpa45to43(v: number): number { return Math.round((v / 4.5) * 4.3 * 100) / 100; }
function gpa45to100(v: number): number {
  if (v >= 4.5) return 97.5;
  if (v >= 4.0) return 92.0;
  if (v >= 3.5) return 87.0;
  if (v >= 3.0) return 82.0;
  if (v >= 2.5) return 77.0;
  if (v >= 2.0) return 72.0;
  if (v >= 1.5) return 67.0;
  if (v >= 1.0) return 62.0;
  return 0;
}

/* ─── Storage ─── */
const STORAGE_KEY = 'uh_gpa_courses';
let nextId = 1;

function loadCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
function saveCourses(courses: Course[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); } catch {}
}

/* ─── Main Page ─── */
export default function GpaPage() {
  const [scale, setScale] = useState<Scale>('4.5');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterType, setFilterType] = useState<'all' | CourseType>('all');

  useEffect(() => {
    const saved = loadCourses();
    if (saved.length > 0) {
      nextId = Math.max(...saved.map(c => c.id)) + 1;
      setCourses(saved);
    } else {
      // default empty rows
      setCourses([
        { id: nextId++, name: '', credits: 3, grade: 'A+', type: 'major' },
        { id: nextId++, name: '', credits: 3, grade: 'B+', type: 'major' },
        { id: nextId++, name: '', credits: 2, grade: 'A0', type: 'liberal' },
      ]);
    }
  }, []);

  const update = useCallback((updated: Course[]) => {
    setCourses(updated);
    saveCourses(updated);
  }, []);

  const addRow = () => {
    const newCourses = [...courses, { id: nextId++, name: '', credits: 3, grade: GRADES[scale][0].label, type: 'major' as CourseType }];
    update(newCourses);
  };

  const removeRow = (id: number) => update(courses.filter(c => c.id !== id));

  const changeField = <K extends keyof Course>(id: number, field: K, value: Course[K]) => {
    update(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // GPA calculations
  const calcGpa = (filtered: Course[]) => {
    const totalCredits = filtered.reduce((s, c) => s + c.credits, 0);
    if (totalCredits === 0) return { gpa45: 0, gpa43: 0, gpa100: 0, totalCredits: 0 };
    const totalPoints = filtered.reduce((s, c) => s + toGpa45(c.grade, scale) * c.credits, 0);
    const gpa45 = totalPoints / totalCredits;
    return { gpa45, gpa43: gpa45to43(gpa45), gpa100: gpa45to100(gpa45), totalCredits };
  };

  const filtered = filterType === 'all' ? courses : courses.filter(c => c.type === filterType);
  const { gpa45, gpa43, gpa100, totalCredits } = useMemo(() => calcGpa(filtered), [filtered, scale]);
  const majorResult = useMemo(() => calcGpa(courses.filter(c => c.type === 'major')), [courses, scale]);
  const liberalResult = useMemo(() => calcGpa(courses.filter(c => c.type === 'liberal')), [courses, scale]);

  const inputStyle: React.CSSProperties = {
    padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none',
  };

  const resultCard = (label: string, value: string, sub?: string) => (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', borderTop: '3px solid var(--primary)' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{sub}</div>}
    </div>
  );

  const TYPE_LABELS: Record<CourseType, string> = { major: '전공', liberal: '교양', other: '기타' };

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
          <GraduationCap size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>학점 변환기 (GPA Converter)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>4.5 · 4.3 · 100점 만점 간 GPA 상호 변환 — 전공/교양 구분 입력 지원</p>
      </header>

      {/* Scale + Filter */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>성적 기준 (입력 단위)</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['4.5', '4.3', '100'] as Scale[]).map(s => (
                <button key={s} onClick={() => setScale(s)} style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  background: scale === s ? 'var(--primary)' : 'var(--surface)',
                  color: scale === s ? '#fff' : 'var(--text-primary)',
                  border: scale === s ? 'none' : '1px solid var(--border)',
                }}>{s}점</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>보기 필터</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['all', 'major', 'liberal'] as const).map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{
                  padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.82rem',
                  background: filterType === f ? 'var(--primary)' : 'var(--surface)',
                  color: filterType === f ? '#fff' : 'var(--text-primary)',
                }}>
                  {f === 'all' ? '전체' : TYPE_LABELS[f as CourseType]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GPA Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {resultCard('4.5 만점', gpa45.toFixed(2), `${totalCredits}학점`)}
        {resultCard('4.3 만점', gpa43.toFixed(2), '환산값')}
        {resultCard('100점 만점', gpa100.toFixed(1), '환산값')}
        {majorResult.totalCredits > 0 && resultCard('전공 학점', majorResult.gpa45.toFixed(2), `${majorResult.totalCredits}학점`)}
        {liberalResult.totalCredits > 0 && resultCard('교양 학점', liberalResult.gpa45.toFixed(2), `${liberalResult.totalCredits}학점`)}
      </div>

      {/* Course Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>과목 입력 ({courses.length}개)</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={addRow} style={{
              padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'var(--primary)', color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            }}>+ 과목 추가</button>
            <button onClick={() => update([])} style={{
              padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', color: '#f87171', border: '1px solid #f87171',
              cursor: 'pointer', fontSize: '0.82rem',
            }}>전체 삭제</button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['과목명', '학점', '성적', '구분', '4.5환산', ''].map(h => (
                <th key={h} style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.4rem' }}>
                  <input value={c.name} onChange={e => changeField(c.id, 'name', e.target.value)}
                    placeholder="과목명" style={{ ...inputStyle, width: '120px' }} />
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <select value={c.credits} onChange={e => changeField(c.id, 'credits', Number(e.target.value))} style={inputStyle}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}학점</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <select value={c.grade} onChange={e => changeField(c.id, 'grade', e.target.value)} style={inputStyle}>
                    {GRADES[scale].map(g => <option key={g.label} value={g.label}>{g.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <select value={c.type} onChange={e => changeField(c.id, 'type', e.target.value as CourseType)} style={inputStyle}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {toGpa45(c.grade, scale).toFixed(2)}
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <button onClick={() => removeRow(c.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '1rem',
                  }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            과목을 추가하면 학점이 계산됩니다
          </p>
        )}
      </div>

      {/* Conversion reference table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>📊 학점 환산 기준표</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['등급', '4.5 만점', '4.3 만점', '100점 기준'].map(h => (
                  <th key={h} style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRADES['4.5'].map((g, i) => (
                <tr key={g.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                  <td style={{ padding: '0.4rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>{g.label}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>{g.value.toFixed(1)}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>{gpa45to43(g.value).toFixed(2)}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>{gpa45to100(g.value).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad */}
      <div style={{
        background: 'var(--surface)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)', height: '90px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem',
      }}>광고 영역 (728×90)</div>

      <ShareBar title="대학생 학점 변환기 (GPA Converter)" />
      <RelatedTools toolId="utilities/gpa" />

      <SeoSection
        ko={{
          title: '학점 변환기(GPA Converter) — 환산 공식·취업 활용 팁·FAQ',
          description: `학점 변환기(GPA Converter)는 한국 대학에서 사용하는 4.5 만점, 4.3 만점, 100점 만점 성적 체계를 서로 변환해주는 온라인 도구입니다. 과목명, 학점(Credit), 성적(Grade)을 입력하면 전체 GPA와 전공/교양 GPA를 자동으로 계산하고, 다른 기준으로 환산된 값도 즉시 확인할 수 있습니다.

【학점 변환 공식】
4.5 → 4.3 환산: GPA(4.3) = GPA(4.5) × (4.3 ÷ 4.5). 예를 들어 4.5 만점에서 4.0은 4.3 만점으로 약 3.82가 됩니다. 100점 기준 환산은 등급별 기준점수(A+ = 97.5, A = 92.0, B+ = 87.0 등)를 사용합니다.

【취업 시 학점 기입 주의사항】
취업 사이트나 지원서에 학점을 기입할 때는 반드시 본인 대학의 기준(4.5 또는 4.3)을 확인하고 기입해야 합니다. 대기업 지원 시 4.5 기준으로 제출하면 4.3 기준보다 높게 보일 수 있어 혼동이 생길 수 있습니다. NCS 직업기초능력 평가나 공기업 채용에서는 100점 만점 환산 점수를 요구하는 경우가 많으므로, 정확한 환산 기준을 사전에 파악하세요. 입력된 과목 정보는 브라우저 LocalStorage에 자동 저장되어 페이지를 새로 고쳐도 데이터가 유지됩니다.`,
          useCases: [
            { icon: '🎓', title: '취업 지원서 학점 기입', desc: '4.5/4.3/100점 기준을 정확히 변환해 채용 서류에 기입합니다.' },
            { icon: '📊', title: '전공/교양 GPA 분리', desc: '전공 평점과 교양 평점을 각각 계산해 강점 영역을 파악합니다.' },
            { icon: '💾', title: '성적 자동 저장', desc: '입력한 과목과 성적이 LocalStorage에 저장되어 재방문 시 복원됩니다.' },
            { icon: '📋', title: '환산 기준표 제공', desc: 'A+/A0/B+ 등 각 등급별 4.5·4.3·100점 환산값을 한눈에 확인합니다.' },
          ],
          steps: [
            { step: '1', desc: '상단에서 입력 기준(4.5/4.3/100점)을 선택' },
            { step: '2', desc: '「+ 과목 추가」 버튼으로 과목명, 학점, 성적, 구분(전공/교양)을 입력' },
            { step: '3', desc: '상단 결과 카드에서 4.5/4.3/100점 환산 GPA와 전공·교양 평점 확인' },
            { step: '4', desc: '입력 데이터는 자동 저장 — 다음 방문 시에도 유지' },
          ],
          faqs: [
            {
              q: '4.5 학점을 4.3으로 바꾸면 불리한가요?',
              a: '4.5 기준 A+(4.5)를 4.3으로 환산하면 약 4.3이 되어 손해가 없습니다. 하지만 중간 등급(예: B+)은 4.5 기준 3.5 → 4.3 기준 약 3.33으로 수치가 소폭 낮아집니다. 지원서에는 자신에게 유리한 기준을 선택하되, 학교 공식 기준을 병기하는 것이 권장됩니다.',
            },
            {
              q: '졸업 평점이 기재 기준보다 낮으면 지원이 불가능한가요?',
              a: '많은 기업에서 4.5 만점 기준 3.0 이상을 커트라인으로 사용하지만, 이는 참고용이며 절대적 기준은 아닙니다. 자소서, 어학 점수, 경험 등 다른 요소로 보완될 수 있으므로 지원 자격 요건을 먼저 확인하세요.',
            },
            {
              q: '대학마다 학점 기준이 다른데 어떻게 하나요?',
              a: '이 도구는 국내 대학에서 가장 많이 사용되는 표준 환산 기준을 적용합니다. 일부 대학은 A+ = 4.3(최고) 또는 A = 4.5 등 고유 기준을 사용하므로, 정확한 환산이 필요하다면 학교 학사지원팀에 문의하거나 성적증명서의 기준을 확인하세요.',
            },
          ],
        }}
        en={{
          title: 'GPA Converter — Conversion Formulas, Job Application Tips & FAQ',
          description: `The GPA Converter translates between South Korea's three common grading scales — 4.5, 4.3, and 100-point — used across Korean universities. Enter course names, credit hours, and grades to calculate your overall GPA and separate major vs. liberal arts GPAs, with instant conversion to all three scales.

【GPA Conversion Formulas】
4.5 → 4.3: GPA(4.3) = GPA(4.5) × (4.3 ÷ 4.5). For example, a 4.0 on the 4.5 scale equals approximately 3.82 on the 4.3 scale. The 100-point conversion uses grade midpoints: A+ ≈ 97.5, A ≈ 92.0, B+ ≈ 87.0, B ≈ 82.0, and so on.

【Tips for Job Applications】
When filling out Korean job application forms, always verify which GPA scale the company expects. Some large corporations assume 4.5 as the maximum, so submitting a 4.3-scale score could appear inflated or cause confusion. Many public enterprise (공기업) exams require a 100-point GPA, so convert your grade accurately beforehand. All entered course data is saved to LocalStorage and automatically restored on your next visit.`,
          useCases: [
            { icon: '🎓', title: 'Job application GPA entry', desc: 'Convert between 4.5/4.3/100-point scales accurately for Korean job applications.' },
            { icon: '📊', title: 'Major vs. liberal arts GPA', desc: 'Calculate your major GPA and liberal arts GPA separately to highlight strengths.' },
            { icon: '💾', title: 'Auto-saved grade data', desc: 'Course data persists in LocalStorage across browser sessions without login.' },
            { icon: '📋', title: 'Conversion reference table', desc: 'See equivalent values for all letter grades across all three scales at a glance.' },
          ],
          steps: [
            { step: '1', desc: 'Select your input grading scale (4.5 / 4.3 / 100-point)' },
            { step: '2', desc: 'Click "+ Add Course" and enter course name, credits, grade, and type (major/liberal arts)' },
            { step: '3', desc: 'View converted GPA in all three scales in the result cards at the top' },
            { step: '4', desc: 'Data is auto-saved — your course list is restored on your next visit' },
          ],
          faqs: [
            {
              q: 'Does converting from 4.5 to 4.3 put me at a disadvantage?',
              a: 'An A+ (4.5) converts to exactly 4.3 on the 4.3 scale — no loss at the top. However, mid-range grades (e.g., B+ = 3.5 on 4.5) convert to approximately 3.33 on the 4.3 scale, a slight reduction. When in doubt, submit the scale that your official transcript uses and note the maximum alongside your score.',
            },
            {
              q: 'If my GPA is below a company\'s stated minimum, should I still apply?',
              a: 'Many Korean companies list a 3.0 / 4.5 minimum as a guideline rather than a strict filter. Strong cover letters, language scores, internship experience, and portfolio work often outweigh borderline GPA scores. Always check the specific job posting for hard requirements.',
            },
            {
              q: 'Each university has a different grading system — how do I account for that?',
              a: 'This tool uses the most common standardized conversion table. Some universities assign A+ = 4.3 as maximum, or use unique grade boundaries. For precise conversion, consult your university\'s academic office or the grading legend on your official transcript.',
            },
          ],
        }}
      />
    </div>
  );
}
