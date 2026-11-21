'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GraduationCap, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

/* ─── Types ─── */
type Scale = '4.5' | '4.3' | '100';
type CourseType = 'major' | 'liberal' | 'other';
type GradeKey =
  | 'A_PLUS' | 'A_ZERO' | 'B_PLUS' | 'B_ZERO'
  | 'C_PLUS' | 'C_ZERO' | 'D_PLUS' | 'D_ZERO' | 'F';

interface Course {
  id: number;
  name: string;
  credits: number;
  grade: GradeKey; // 정규화 키
  type: CourseType;
}

/* ─── Grade tables: scale별 label + value, key는 정규화 ─── */
const GRADES: Record<Scale, { key: GradeKey; label: string; value: number }[]> = {
  '4.5': [
    { key: 'A_PLUS', label: 'A+', value: 4.5 }, { key: 'A_ZERO', label: 'A0', value: 4.0 },
    { key: 'B_PLUS', label: 'B+', value: 3.5 }, { key: 'B_ZERO', label: 'B0', value: 3.0 },
    { key: 'C_PLUS', label: 'C+', value: 2.5 }, { key: 'C_ZERO', label: 'C0', value: 2.0 },
    { key: 'D_PLUS', label: 'D+', value: 1.5 }, { key: 'D_ZERO', label: 'D0', value: 1.0 },
    { key: 'F',      label: 'F',  value: 0.0 },
  ],
  '4.3': [
    { key: 'A_PLUS', label: 'A+', value: 4.3 }, { key: 'A_ZERO', label: 'A',  value: 4.0 },
    { key: 'B_PLUS', label: 'B+', value: 3.3 }, { key: 'B_ZERO', label: 'B',  value: 3.0 },
    { key: 'C_PLUS', label: 'C+', value: 2.3 }, { key: 'C_ZERO', label: 'C',  value: 2.0 },
    { key: 'D_PLUS', label: 'D+', value: 1.3 }, { key: 'D_ZERO', label: 'D',  value: 1.0 },
    { key: 'F',      label: 'F',  value: 0.0 },
  ],
  '100': [
    { key: 'A_PLUS', label: 'A+ (95-100)', value: 97.5 }, { key: 'A_ZERO', label: 'A  (90-94)',  value: 92.0 },
    { key: 'B_PLUS', label: 'B+ (85-89)',  value: 87.0 }, { key: 'B_ZERO', label: 'B  (80-84)',  value: 82.0 },
    { key: 'C_PLUS', label: 'C+ (75-79)',  value: 77.0 }, { key: 'C_ZERO', label: 'C  (70-74)',  value: 72.0 },
    { key: 'D_PLUS', label: 'D+ (65-69)',  value: 67.0 }, { key: 'D_ZERO', label: 'D  (60-64)',  value: 62.0 },
    { key: 'F',      label: 'F  (<60)',    value: 0.0  },
  ],
};

function getGradeLabel(key: GradeKey, scale: Scale): string {
  return GRADES[scale].find((g) => g.key === key)?.label ?? '';
}

function getGradeValue(key: GradeKey, scale: Scale): number {
  return GRADES[scale].find((g) => g.key === key)?.value ?? 0;
}

// 4.5 GPA로 환산 (Course.grade는 정규화 키이므로 4.5 등급표 값을 그대로 사용)
function toGpa45FromKey(key: GradeKey, scale: Scale): number {
  if (scale === '4.5') return getGradeValue(key, '4.5');
  if (scale === '4.3') {
    const v43 = getGradeValue(key, '4.3');
    return Math.round((v43 / 4.3) * 4.5 * 100) / 100;
  }
  // 100점 → 4.5 환산: 4.5 등급표의 값 사용 (정규화 키 매칭)
  return getGradeValue(key, '4.5');
}

function gpa45to43(v: number): number {
  return Math.round((v / 4.5) * 4.3 * 100) / 100;
}

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
const STORAGE_KEY = 'uh_gpa_courses_v2'; // v2: GradeKey 사용

interface StoredCourse {
  id: number;
  name: string;
  credits: number;
  grade: GradeKey;
  type: CourseType;
}

function loadCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
function saveCourses(courses: Course[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); } catch { /* ignore */ }
}

const CREDITS_OPTIONS = [0, 1, 2, 3, 4, 5];

/* ─── Main Client ─── */
export default function GpaCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('GpaCalc');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [scale, setScale] = useState<Scale>('4.5');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterType, setFilterType] = useState<'all' | CourseType>('all');
  const [copied, setCopied] = useState(false);
  const nextIdRef = useRef(1);

  useEffect(() => {
    const saved = loadCourses();
    if (saved.length > 0) {
      nextIdRef.current = Math.max(...saved.map((c) => c.id)) + 1;
      setCourses(saved);
    } else {
      setCourses([
        { id: nextIdRef.current++, name: '', credits: 3, grade: 'A_PLUS', type: 'major' },
        { id: nextIdRef.current++, name: '', credits: 3, grade: 'B_PLUS', type: 'major' },
        { id: nextIdRef.current++, name: '', credits: 2, grade: 'A_ZERO', type: 'liberal' },
      ]);
    }
  }, []);

  const update = useCallback((updated: Course[]) => {
    setCourses(updated);
    saveCourses(updated);
  }, []);

  const addRow = () => {
    const newCourses = [
      ...courses,
      { id: nextIdRef.current++, name: '', credits: 3, grade: 'A_PLUS' as GradeKey, type: 'major' as CourseType },
    ];
    update(newCourses);
  };

  const removeRow = (id: number) => update(courses.filter((c) => c.id !== id));

  const changeField = <K extends keyof Course>(id: number, field: K, value: Course[K]) => {
    update(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const TYPE_LABELS: Record<CourseType, string> = {
    major: t('type_major'),
    liberal: t('type_liberal'),
    other: t('type_other'),
  };

  // ── GPA calculations (메모화) ────────────────────────────────────────
  const calcGpa = useCallback(
    (list: Course[]) => {
      const totalCredits = list.reduce((s, c) => s + c.credits, 0);
      if (totalCredits === 0) return { gpa45: 0, gpa43: 0, gpa100: 0, totalCredits: 0 };
      const totalPoints = list.reduce((s, c) => s + toGpa45FromKey(c.grade, scale) * c.credits, 0);
      const gpa45 = totalPoints / totalCredits;
      return {
        gpa45,
        gpa43: gpa45to43(gpa45),
        gpa100: gpa45to100(gpa45),
        totalCredits,
      };
    },
    [scale],
  );

  const filteredCourses = useMemo(
    () => (filterType === 'all' ? courses : courses.filter((c) => c.type === filterType)),
    [courses, filterType],
  );

  const overall = useMemo(() => calcGpa(filteredCourses), [calcGpa, filteredCourses]);
  const majorResult = useMemo(() => calcGpa(courses.filter((c) => c.type === 'major')), [calcGpa, courses]);
  const liberalResult = useMemo(() => calcGpa(courses.filter((c) => c.type === 'liberal')), [calcGpa, courses]);
  const otherResult = useMemo(() => calcGpa(courses.filter((c) => c.type === 'other')), [calcGpa, courses]);

  const handleCopy = useCallback(() => {
    const lines: string[] = [t('title')];
    lines.push(`${t('scale_label')}: ${scale}`);
    lines.push(`${t('result_45')}: ${overall.gpa45.toFixed(2)} (${overall.totalCredits} ${t('credit_unit')})`);
    lines.push(`${t('result_43')}: ${overall.gpa43.toFixed(2)}`);
    lines.push(`${t('result_100')}: ${overall.gpa100.toFixed(1)}`);
    if (majorResult.totalCredits > 0)
      lines.push(`${t('result_major')}: ${majorResult.gpa45.toFixed(2)} (${majorResult.totalCredits} ${t('credit_unit')})`);
    if (liberalResult.totalCredits > 0)
      lines.push(`${t('result_liberal')}: ${liberalResult.gpa45.toFixed(2)} (${liberalResult.totalCredits} ${t('credit_unit')})`);
    if (otherResult.totalCredits > 0)
      lines.push(`${t('result_other')}: ${otherResult.gpa45.toFixed(2)} (${otherResult.totalCredits} ${t('credit_unit')})`);
    try {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [t, scale, overall, majorResult, liberalResult, otherResult]);

  // 표 안 입력칸은 kit 기본(48px)보다 낮게: 인라인으로 높이·글자만 줄인다
  const inputClass = ui.input;
  const compact = { minHeight: 'var(--control-h-sm)', fontSize: '0.9rem' } as const;

  const resultCard = (label: string, value: string, sub?: string) => (
    <div
      className={ui.card}
      style={{
        padding: '1rem',
        textAlign: 'center',
        borderTop: '3px solid var(--color-primary)',
      }}
    >
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{sub}</div>}
    </div>
  );


  return (
    <div>
      <NavigationActions />

      <ToolHeader icon={<GraduationCap />} title={t('title')} subtitle={t('subtitle')} />

      {/* Scale + Filter */}
      <div className={ui.card} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className={ui.field}>
            <label className={ui.label}>
              {t('scale_label')}
            </label>
            <div className={ui.segmented}>
              {(['4.5', '4.3', '100'] as Scale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  aria-label={s}
                  className={`${ui.segment} ${scale === s ? ui.segmentActive : ''}`}
                >
                  {isKo ? `${s}점` : s}
                </button>
              ))}
            </div>
          </div>
          <div className={ui.field}>
            <label className={ui.label}>
              {t('filter_label')}
            </label>
            <div className={ui.segmented}>
              {(['all', 'major', 'liberal', 'other'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`${ui.segment} ${filterType === f ? ui.segmentActive : ''}`}
                >
                  {f === 'all' ? t('filter_all') : TYPE_LABELS[f as CourseType]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GPA Results */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '0.85rem',
        }}
      >
        {resultCard(t('result_45'), overall.gpa45.toFixed(2), t('result_credits', { n: overall.totalCredits }))}
        {resultCard(t('result_43'), overall.gpa43.toFixed(2), t('result_converted'))}
        {resultCard(t('result_100'), overall.gpa100.toFixed(1), t('result_converted'))}
        {majorResult.totalCredits > 0 &&
          resultCard(t('result_major'), majorResult.gpa45.toFixed(2), t('result_credits', { n: majorResult.totalCredits }))}
        {liberalResult.totalCredits > 0 &&
          resultCard(t('result_liberal'), liberalResult.gpa45.toFixed(2), t('result_credits', { n: liberalResult.totalCredits }))}
        {otherResult.totalCredits > 0 &&
          resultCard(t('result_other'), otherResult.gpa45.toFixed(2), t('result_credits', { n: otherResult.totalCredits }))}
      </div>

      {/* Copy button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={t('copy_button')}
          disabled={overall.totalCredits === 0}
          className={`${ui.button} ${ui.secondary} ${ui.sm} ${copied ? ui.green : ''}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t('copy_done') : t('copy_button')}
        </button>
      </div>

      {/* Course Table */}
      <div className={ui.card} style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <h2 className={ui.cardTitle} style={{ margin: 0 }}>
            {t('table_title', { n: courses.length })}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={addRow}
              className={`${ui.button} ${ui.primary} ${ui.sm}`}
            >
              {t('add_course')}
            </button>
            <button
              onClick={() => update([])}
              className={`${ui.button} ${ui.danger} ${ui.sm}`}
            >
              {t('clear_all')}
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {[t('th_name'), t('th_credits'), t('th_grade'), t('th_type'), t('th_converted'), ''].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '0.5rem',
                    textAlign: 'left',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.4rem' }}>
                  <input
                    value={c.name}
                    onChange={(e) => changeField(c.id, 'name', e.target.value)}
                    placeholder={t('course_placeholder')}
                    className={inputClass}
                    style={{ ...compact, width: '120px' }}
                    aria-label={t('th_name')}
                  />
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <select
                    value={c.credits}
                    onChange={(e) => changeField(c.id, 'credits', Number(e.target.value))}
                    className={inputClass}
                    style={compact}
                    aria-label={t('th_credits')}
                  >
                    {CREDITS_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {isKo ? `${n}학점` : `${n} cr`}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <select
                    value={c.grade}
                    onChange={(e) => changeField(c.id, 'grade', e.target.value as GradeKey)}
                    className={inputClass}
                    style={compact}
                    aria-label={t('th_grade')}
                  >
                    {GRADES[scale].map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <select
                    value={c.type}
                    onChange={(e) => changeField(c.id, 'type', e.target.value as CourseType)}
                    className={inputClass}
                    style={compact}
                    aria-label={t('th_type')}
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {toGpa45FromKey(c.grade, scale).toFixed(2)}
                </td>
                <td style={{ padding: '0.4rem' }}>
                  <button
                    onClick={() => removeRow(c.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--tint-red-fg)',
                      fontSize: '1rem',
                    }}
                    aria-label="remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            {t('empty_message')}
          </p>
        )}
      </div>

      {/* Conversion reference table */}
      <div className={ui.card} style={{ marginBottom: '2rem' }}>
        <h3 className={ui.cardTitle}>
          {t('ref_title')}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[t('ref_th_grade'), t('ref_th_45'), t('ref_th_43'), t('ref_th_100')].map((h) => (
                  <th key={h} style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRADES['4.5'].map((g, i) => (
                <tr
                  key={g.key}
                  style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--surface-hover)' }}
                >
                  <td style={{ padding: '0.4rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>{g.label}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>{g.value.toFixed(1)}</td>
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    {getGradeValue(g.key, '4.3').toFixed(2)}
                  </td>
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>{gpa45to100(g.value).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad */}

      <ShareBar title={t('share_title')} />
      <RelatedTools toolId="utilities/lifestyle/gpa-calc" />

      {seo}
    </div>
  );
}
