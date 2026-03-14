'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

// ── Types ──────────────────────────────────────────────────────────────────
interface ResultType { id: string; emoji: string; title: string; description: string; }
interface AnswerOption { id: string; text: string; typeId: string; }
interface Question { id: string; text: string; options: AnswerOption[]; }
export interface QuizDef {
  title: string; description: string; coverEmoji: string;
  resultTypes: ResultType[]; questions: Question[];
}

// ── Utils ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }
export function encodeQuiz(q: QuizDef) { return btoa(encodeURIComponent(JSON.stringify(q))); }

// ── Default example quiz ───────────────────────────────────────────────────
function makeDefault(): QuizDef {
  return {
    title: '당신의 개발자 유형은? 🧑‍💻',
    description: '5가지 질문으로 알아보는 나의 개발 스타일',
    coverEmoji: '🧑‍💻',
    resultTypes: [
      { id: 'A', emoji: '🎨', title: '프론트엔드 감성주의자', description: '픽셀 하나도 허투루 쓰지 않는 당신. UI/UX에 진심이고 아름다운 인터페이스에서 보람을 찾습니다.' },
      { id: 'B', emoji: '⚙️', title: '백엔드 완벽주의자', description: '로직이 깔끔하지 않으면 잠 못 자는 당신. 탄탄한 아키텍처와 최적화된 코드에 집착합니다.' },
      { id: 'C', emoji: '🔮', title: '풀스택 카멜레온', description: '어디서든 적응하는 멀티 플레이어. 앞뒤 가리지 않고 필요한 걸 만들어냅니다.' },
      { id: 'D', emoji: '📊', title: '데이터 탐정', description: '숫자에서 인사이트를 뽑아내는 당신. 데이터 없이는 의사결정을 못 합니다.' },
    ],
    questions: [
      { id: uid(), text: '주말에 개인 프로젝트를 할 때 가장 먼저 하는 것은?', options: [
        { id: uid(), text: '피그마로 UI 디자인부터', typeId: 'A' },
        { id: uid(), text: 'DB 스키마 설계부터', typeId: 'B' },
        { id: uid(), text: '그냥 코딩부터 시작', typeId: 'C' },
        { id: uid(), text: '데이터 분석 계획 수립', typeId: 'D' },
      ]},
      { id: uid(), text: '버그를 발견했을 때 나의 반응은?', options: [
        { id: uid(), text: '"이 UI가 이상한데…" 레이아웃부터 확인', typeId: 'A' },
        { id: uid(), text: '로그 찍고 원인 분석', typeId: 'B' },
        { id: uid(), text: '일단 고치고 원인은 나중에', typeId: 'C' },
        { id: uid(), text: '에러 발생 패턴 데이터 수집', typeId: 'D' },
      ]},
      { id: uid(), text: '팀 프로젝트에서 내가 맡고 싶은 역할은?', options: [
        { id: uid(), text: 'UI 컴포넌트 & 애니메이션', typeId: 'A' },
        { id: uid(), text: 'API 서버 & DB 설계', typeId: 'B' },
        { id: uid(), text: '뭐든 필요한 부분', typeId: 'C' },
        { id: uid(), text: '사용자 분석 & 지표 설계', typeId: 'D' },
      ]},
      { id: uid(), text: '이상적인 기술 스택은?', options: [
        { id: uid(), text: 'React + TailwindCSS + Framer Motion', typeId: 'A' },
        { id: uid(), text: 'Go + PostgreSQL + Redis', typeId: 'B' },
        { id: uid(), text: 'Next.js + Supabase', typeId: 'C' },
        { id: uid(), text: 'Python + Pandas + Jupyter', typeId: 'D' },
      ]},
      { id: uid(), text: '코드 리뷰에서 내가 가장 많이 남기는 코멘트는?', options: [
        { id: uid(), text: '"컴포넌트 재사용성 개선이 필요해요"', typeId: 'A' },
        { id: uid(), text: '"시간복잡도가 걱정됩니다"', typeId: 'B' },
        { id: uid(), text: '"동작하면 LGTM!"', typeId: 'C' },
        { id: uid(), text: '"이 지표를 로깅해야 할 것 같아요"', typeId: 'D' },
      ]},
    ],
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function QuizBuilderPage() {
  const locale = useLocale();
  const [quiz, setQuiz] = useState<QuizDef>(makeDefault);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Updaters ───────────────────────────────────────────────────────────
  const setBasic = (patch: Partial<Pick<QuizDef, 'title' | 'description' | 'coverEmoji'>>) =>
    setQuiz(p => ({ ...p, ...patch }));

  const setRT = (id: string, patch: Partial<ResultType>) =>
    setQuiz(p => ({ ...p, resultTypes: p.resultTypes.map(r => r.id === id ? { ...r, ...patch } : r) }));

  const addRT = () => {
    if (quiz.resultTypes.length >= 4) return;
    const id = String.fromCharCode(65 + quiz.resultTypes.length);
    setQuiz(p => ({ ...p, resultTypes: [...p.resultTypes, { id, emoji: '✨', title: '새 유형 ' + id, description: '' }] }));
  };

  const removeRT = (id: string) => {
    if (quiz.resultTypes.length <= 2) return;
    const fallback = quiz.resultTypes.find(r => r.id !== id)!.id;
    setQuiz(p => ({
      ...p,
      resultTypes: p.resultTypes.filter(r => r.id !== id),
      questions: p.questions.map(q => ({
        ...q,
        options: q.options.map(o => o.typeId === id ? { ...o, typeId: fallback } : o),
      })),
    }));
  };

  const setQText = (qId: string, text: string) =>
    setQuiz(p => ({ ...p, questions: p.questions.map(q => q.id === qId ? { ...q, text } : q) }));

  const addQ = () => {
    if (quiz.questions.length >= 10) return;
    setQuiz(p => ({
      ...p,
      questions: [...p.questions, {
        id: uid(), text: '',
        options: p.resultTypes.map(rt => ({ id: uid(), text: '', typeId: rt.id })),
      }],
    }));
  };

  const removeQ = (qId: string) => {
    if (quiz.questions.length <= 1) return;
    setQuiz(p => ({ ...p, questions: p.questions.filter(q => q.id !== qId) }));
  };

  const setOpt = (qId: string, optId: string, patch: Partial<AnswerOption>) =>
    setQuiz(p => ({
      ...p,
      questions: p.questions.map(q =>
        q.id === qId ? { ...q, options: q.options.map(o => o.id === optId ? { ...o, ...patch } : o) } : q
      ),
    }));

  const addOpt = (qId: string) => {
    const q = quiz.questions.find(q => q.id === qId);
    if (!q || q.options.length >= 4) return;
    setQuiz(p => ({
      ...p,
      questions: p.questions.map(q =>
        q.id === qId ? { ...q, options: [...q.options, { id: uid(), text: '', typeId: p.resultTypes[0].id }] } : q
      ),
    }));
  };

  const removeOpt = (qId: string, optId: string) => {
    const q = quiz.questions.find(q => q.id === qId);
    if (!q || q.options.length <= 2) return;
    setQuiz(p => ({
      ...p,
      questions: p.questions.map(q =>
        q.id === qId ? { ...q, options: q.options.filter(o => o.id !== optId) } : q
      ),
    }));
  };

  // ── Generate ───────────────────────────────────────────────────────────
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!quiz.title.trim()) errs.push('테스트 제목을 입력해주세요.');
    if (quiz.resultTypes.some(r => !r.title.trim())) errs.push('모든 결과 유형의 제목을 입력해주세요.');
    if (quiz.questions.some(q => !q.text.trim())) errs.push('모든 질문 텍스트를 입력해주세요.');
    if (quiz.questions.some(q => q.options.some(o => !o.text.trim()))) errs.push('모든 선택지 텍스트를 입력해주세요.');
    return errs;
  };

  const handleGenerate = useCallback(() => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    const encoded = encodeQuiz(quiz);
    const url = `${window.location.origin}/${locale}/ux/quiz/play?d=${encoded}`;
    setGeneratedUrl(url);
  }, [quiz, locale]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Shared styles ──────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    padding: '0.6rem 0.8rem', fontSize: '0.9rem',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', color: 'var(--text-primary)',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const stepBadge = (n: number) => (
    <span style={{
      background: 'var(--primary)', color: 'white', borderRadius: '50%',
      width: '1.6rem', height: '1.6rem', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
    }}>{n}</span>
  );

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>🧩 심리테스트 / 퀴즈 빌더</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          질문과 결과를 입력하면 공유 가능한 심리테스트가 완성됩니다. 아래 예시를 참고해 수정해보세요.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* ── STEP 1: Basics ── */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0 0 1.25rem' }}>
            {stepBadge(1)} 기본 설정
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '3.5rem 1fr', gap: '0.75rem', alignItems: 'start' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>커버</label>
              <input type="text" value={quiz.coverEmoji} onChange={e => setBasic({ coverEmoji: e.target.value })}
                style={{ ...inp, textAlign: 'center', fontSize: '1.6rem', padding: '0.25rem' }} maxLength={2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>테스트 제목 *</label>
                <input type="text" value={quiz.title} onChange={e => setBasic({ title: e.target.value })} style={inp} placeholder="예: 당신의 MBTI는?" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>소개 문구</label>
                <input type="text" value={quiz.description} onChange={e => setBasic({ description: e.target.value })} style={inp} placeholder="예: 5가지 질문으로 알아보는 나의 유형" />
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 2: Result Types ── */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              {stepBadge(2)} 결과 유형 ({quiz.resultTypes.length}/4)
            </h2>
            {quiz.resultTypes.length < 4 && (
              <button onClick={addRT} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
                + 유형 추가
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {quiz.resultTypes.map(rt => (
              <div key={rt.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="text" value={rt.emoji} onChange={e => setRT(rt.id, { emoji: e.target.value })}
                    style={{ ...inp, width: '2.75rem', textAlign: 'center', fontSize: '1.3rem', padding: '0.2rem', flexShrink: 0 }} maxLength={2} />
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '4px', padding: '0.1rem 0.45rem' }}>유형 {rt.id}</span>
                  {quiz.resultTypes.length > 2 && (
                    <button onClick={() => removeRT(rt.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.1rem 0.3rem', flexShrink: 0 }}>✕</button>
                  )}
                </div>
                <input type="text" value={rt.title} onChange={e => setRT(rt.id, { title: e.target.value })} style={inp} placeholder="유형 이름" />
                <textarea value={rt.description} onChange={e => setRT(rt.id, { description: e.target.value })}
                  style={{ ...inp, resize: 'vertical', minHeight: '4.5rem' } as React.CSSProperties} placeholder="이 유형에 대한 설명..." rows={3} />
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 3: Questions ── */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              {stepBadge(3)} 질문 목록 ({quiz.questions.length}/10)
            </h2>
            {quiz.questions.length < 10 && (
              <button onClick={addQ} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
                + 질문 추가
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {quiz.questions.map((q, qi) => (
              <div key={q.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                  <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, marginTop: '0.3rem' }}>Q{qi + 1}</span>
                  <input type="text" value={q.text} onChange={e => setQText(q.id, e.target.value)}
                    style={{ ...inp, flex: 1 }} placeholder={`질문 ${qi + 1}을 입력하세요`} />
                  {quiz.questions.length > 1 && (
                    <button onClick={() => removeQ(q.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0, padding: '0.3rem' }}>🗑️</button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingLeft: '2.5rem' }}>
                  {q.options.map((opt, oi) => (
                    <div key={opt.id} style={{ display: 'grid', gridTemplateColumns: '1fr 7.5rem auto', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="text" value={opt.text} onChange={e => setOpt(q.id, opt.id, { text: e.target.value })}
                        style={inp} placeholder={`선택지 ${oi + 1}`} />
                      <select value={opt.typeId} onChange={e => setOpt(q.id, opt.id, { typeId: e.target.value })}
                        style={{ ...inp, width: 'auto' }}>
                        {quiz.resultTypes.map(rt => (
                          <option key={rt.id} value={rt.id}>{rt.emoji} 유형 {rt.id}</option>
                        ))}
                      </select>
                      {q.options.length > 2 ? (
                        <button onClick={() => removeOpt(q.id, opt.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem 0.4rem' }}>✕</button>
                      ) : <span style={{ width: '1.8rem' }} />}
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <button onClick={() => addOpt(q.id)} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '0.2rem 0', fontWeight: 600 }}>
                      + 선택지 추가
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 4: Generate ── */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0 0 1.25rem' }}>
            {stepBadge(4)} 완성 & 공유
          </h2>

          {errors.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              {errors.map((e, i) => <p key={i} style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#991b1b' }}>⚠️ {e}</p>)}
            </div>
          )}

          <button
            onClick={handleGenerate}
            style={{ padding: '0.8rem 2rem', fontWeight: 700, fontSize: '1rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background 0.2s', marginBottom: '1rem' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            🔗 테스트 링크 생성하기
          </button>

          {generatedUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input readOnly value={generatedUrl}
                  style={{ ...inp, flex: 1, fontSize: '0.75rem', cursor: 'text' }}
                  onClick={e => (e.target as HTMLInputElement).select()} />
                <button onClick={handleCopy}
                  style={{ padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.85rem', border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`, background: copied ? '#ecfdf5' : 'var(--surface)', color: copied ? '#065f46' : 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', background: '#0f172a', color: 'white', borderRadius: 'var(--radius-sm)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  👁️ 미리보기
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${quiz.coverEmoji} ${quiz.title} — 당신의 유형은?`)}&url=${encodeURIComponent(generatedUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', background: '#000', color: 'white', borderRadius: 'var(--radius-sm)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  𝕏 트위터 공유
                </a>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                💡 이 링크를 카카오톡, 인스타 스토리, 트위터에 공유하면 누구나 퀴즈를 바로 시작할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      <SeoSection
        title="심리테스트 & 퀴즈 폼 빌더란 무엇인가요?"
        description="노코드 심리테스트 빌더는 코딩 지식 없이도 MBTI 스타일의 성격 유형 테스트, 직업 적성 검사, 취향 궁합 테스트 등 다양한 유형의 심리 테스트와 퀴즈를 직접 만들고 링크 하나로 공유할 수 있는 도구입니다. 모든 퀴즈 데이터는 URL에 인코딩되어 데이터베이스 없이도 공유 가능하며, 결과 페이지에서 이미지 다운로드와 바이럴 공유가 자동으로 지원됩니다. 마케터, 콘텐츠 크리에이터, 선생님, 인플루언서 등 누구나 활용할 수 있습니다."
        useCases={[
          { icon: '📣', title: '마케팅 & 바이럴 콘텐츠', desc: '브랜드 스타일 테스트, 제품 추천 퀴즈 등을 제작해 SNS에 공유하면 높은 인게이지먼트와 자연스러운 브랜드 노출 효과를 만들어냅니다.' },
          { icon: '🎓', title: '교육 & 학습 퀴즈', desc: '선생님이나 강사가 수업 내용 복습 퀴즈, OX 문제, 단원 마무리 테스트를 빠르게 만들어 학생들에게 링크를 공유합니다.' },
          { icon: '👥', title: '팀 빌딩 & HR', desc: '신입 직원 온보딩, 팀 성향 파악, 사내 이벤트 참여 설문 등을 심리테스트 형식으로 만들어 흥미롭게 운영합니다.' },
          { icon: '📱', title: '인플루언서 & 크리에이터', desc: "유튜버, 인스타그래머 등이 팔로워 참여를 유도하는 '당신의 유형은?' 테스트를 코딩 없이 10분 안에 제작합니다." },
        ]}
        steps={[
          { step: '퀴즈 기본 정보 입력', desc: '퀴즈 제목과 설명을 입력합니다. 예: "당신의 개발자 유형은? 🧑‍💻"' },
          { step: '결과 유형 설정 (2~4가지)', desc: '퀴즈 결과로 나올 유형들을 입력합니다. 각 유형에는 이름, 이모지, 설명을 작성합니다.' },
          { step: '질문 & 선택지 작성', desc: '최대 10개의 질문을 추가하고, 각 선택지가 어떤 결과 유형에 대응되는지 설정합니다.' },
          { step: '링크 생성 & 공유', desc: "'퀴즈 링크 생성' 버튼을 누르면 즉시 공유 가능한 URL이 생성됩니다. 카카오, X(트위터) 등으로 바로 공유하세요." },
        ]}
        faqs={[
          { q: '만든 퀴즈는 언제까지 유효한가요?', a: '퀴즈 데이터는 URL 파라미터에 Base64로 인코딩되어 저장됩니다. 서버 데이터베이스를 사용하지 않으므로 생성된 URL만 있으면 영구적으로 접근 가능합니다. 단, URL을 잃어버리면 복구가 불가능하니 반드시 링크를 저장해두세요.' },
          { q: '응답자 수나 결과 통계를 볼 수 있나요?', a: '현재 버전에서는 통계 기능이 없습니다. 순수하게 퀴즈 제작과 결과 확인에 집중된 도구입니다. 응답 수집이 필요하다면 Google 설문지와 함께 활용하거나, 통계 기능 추가 요청을 피드백 게시판에 남겨주세요.' },
          { q: '퀴즈 결과 이미지를 다운로드할 수 있나요?', a: '네. 결과 페이지에서 Canvas API로 생성된 1200×630 결과 이미지를 다운로드할 수 있습니다. SNS 업로드용으로 최적화된 비율이며, 퀴즈 제목과 결과 유형이 자동으로 디자인됩니다.' },
        ]}
      />
    </div>
  );
}
