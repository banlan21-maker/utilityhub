'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Puzzle, 
  Settings, 
  ListChecks, 
  Smile, 
  Plus, 
  Trash2, 
  Layout, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Share2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './quiz.module.css';

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

function makeDefault(): QuizDef {
  return {
    title: '당신의 개발 유형은?',
    description: '5가지 질문으로 알아보는 나의 개발 스타일',
    coverEmoji: '🧑‍💻',
    resultTypes: [
      { id: 'A', emoji: '🎨', title: '프론트엔드 장인', description: '완벽한 UI와 픽셀 하나에 집착합니다.' },
      { id: 'B', emoji: '⚙️', title: '백엔드 마스터', description: '탄탄한 로직과 시스템 설계에 진심입니다.' },
    ],
    questions: [
      { id: uid(), text: '주말에 가장 하고 싶은 프로젝트 설계 단계는?', options: [
        { id: uid(), text: '피그마로 UI 디자인', typeId: 'A' },
        { id: uid(), text: 'DB 테이블 모델링', typeId: 'B' },
      ]},
    ],
  };
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function QuizBuilderPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  
  const [quiz, setQuiz] = useState<QuizDef>(makeDefault);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // ── Updaters ──
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
        options: quiz.resultTypes.map(rt => ({ id: uid(), text: '', typeId: rt.id })),
      }],
    }));
  };

  const removeQ = (qId: string) => {
    if (quiz.questions.length <= 1) return;
    setQuiz(p => ({ ...p, questions: quiz.questions.filter(q => q.id !== qId) }));
  };

  const setOpt = (qId: string, optId: string, patch: Partial<AnswerOption>) =>
    setQuiz(p => ({
      ...p,
      questions: p.questions.map(q =>
        q.id === qId ? { ...q, options: q.options.map(o => o.id === optId ? { ...o, ...patch } : o) } : q
      ),
    }));

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!quiz.title.trim()) errs.push(isKo ? '테스트 제목을 입력해주세요.' : 'Enter quiz title.');
    if (quiz.questions.some(q => !q.text.trim())) errs.push(isKo ? '모든 질문 내용을 입력해주세요.' : 'Complete all question texts.');
    return errs;
  };

  const handleGenerate = useCallback(() => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    const encoded = encodeQuiz(quiz);
    const url = `${window.location.origin}/${locale}/ux/quiz/play?d=${encoded}`;
    setGeneratedUrl(url);
  }, [quiz, locale, isKo]);

  if (!isClient) return null;

  return (
    <div className={s.quiz_container}>
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
          <Puzzle size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{isKo ? 'MBTI 스타일 퀴즈 빌더' : 'Quiz & Personality Test Builder'}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{isKo ? '질문과 결과를 입력하면 공유 가능한 심리테스트가 단 1분 만에 완성됩니다.' : 'Build a viral personality test in seconds. No login required.'}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* STEP 1: Basic Config */}
        <section className={s.quiz_panel}>
          <h2 className={s.quiz_section_title}><span className={s.quiz_step_badge}>1</span> {isKo ? '기본 설정' : 'Basic Config'}</h2>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{isKo ? '커버' : 'Cover'}</label>
              <input value={quiz.coverEmoji} onChange={e => setBasic({ coverEmoji: e.target.value })} className={s.quiz_input} style={{ width: '4rem', fontSize: '2rem', height: '4rem', textAlign: 'center', padding: '0' }} maxLength={2} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input value={quiz.title} onChange={e => setBasic({ title: e.target.value })} className={s.quiz_input} placeholder={isKo ? "테스트 제목 (예: 당신의 연애 유형은?)" : "Quiz Title"} />
              <input value={quiz.description} onChange={e => setBasic({ description: e.target.value })} className={s.quiz_input} placeholder={isKo ? "소개 문구 (친구들에게 보여질 설명)" : "Introduction Text"} />
            </div>
          </div>
        </section>

        {/* STEP 2: Result Types */}
        <section className={s.quiz_panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={s.quiz_section_title} style={{ margin: 0 }}><span className={s.quiz_step_badge}>2</span> {isKo ? '결과 유형' : 'Result Types'} ({quiz.resultTypes.length}/4)</h2>
            {quiz.resultTypes.length < 4 && (
              <button onClick={addRT} className={s.quiz_icon_button} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: '0.5rem' }}>
                <Plus size={16} /> {isKo ? '유형 추가' : 'Add Type'}
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {quiz.resultTypes.map(rt => (
              <div key={rt.id} className={s.quiz_card}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input value={rt.emoji} onChange={e => setRT(rt.id, { emoji: e.target.value })} className={s.quiz_input} style={{ width: '3rem', textAlign: 'center' }} maxLength={2} />
                  <span style={{ fontWeight: 800, fontSize: '0.75rem', background: '#8b5cf6', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>{isKo ? '유형' : 'Type'} {rt.id}</span>
                  {quiz.resultTypes.length > 2 && <button onClick={() => removeRT(rt.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>}
                </div>
                <input value={rt.title} onChange={e => setRT(rt.id, { title: e.target.value })} className={s.quiz_input} placeholder={isKo ? "유형 이름" : "Result Title"} />
                <textarea value={rt.description} onChange={e => setRT(rt.id, { description: e.target.value })} className={s.quiz_input} style={{ resize: 'none' }} placeholder={isKo ? "유형에 대한 상세 설명..." : "Describe this result..."} rows={2} />
              </div>
            ))}
          </div>
        </section>

        {/* STEP 3: Questions */}
        <section className={s.quiz_panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={s.quiz_section_title} style={{ margin: 0 }}><span className={s.quiz_step_badge}>3</span> {isKo ? '질문 리스트' : 'Question List'} ({quiz.questions.length}/10)</h2>
            <button onClick={addQ} className={s.quiz_icon_button} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: '0.5rem' }}>
              <Plus size={16} /> {isKo ? '질문 추가' : 'Add Question'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {quiz.questions.map((q, i) => (
              <div key={q.id} className={s.quiz_card} style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#8b5cf6' }}>Q{i+1}</span>
                  <input value={q.text} onChange={e => setQText(q.id, e.target.value)} className={s.quiz_input} placeholder={isKo ? "질문을 입력하세요" : "Enter question text"} />
                  {quiz.questions.length > 1 && <button onClick={() => removeQ(q.id)} style={{ color: '#94a3b8' }}><Trash2 size={18} /></button>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2.5rem' }}>
                  {q.options.map((opt, oi) => (
                    <div key={opt.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input value={opt.text} onChange={e => setOpt(q.id, opt.id, { text: e.target.value })} className={s.quiz_input} style={{ flex: 1 }} placeholder={isKo ? `선택지 ${oi+1}` : `Option ${oi+1}`} />
                      <select value={opt.typeId} onChange={e => setOpt(q.id, opt.id, { typeId: e.target.value })} className={s.quiz_input} style={{ width: '8rem' }}>
                        {quiz.resultTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.emoji} {isKo ? '유형' : 'Type'} {rt.id}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 4: Generate */}
        <section className={s.quiz_panel} style={{ textAlign: 'center', background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
          <h2 className={s.quiz_section_title} style={{ justifyContent: 'center' }}><span className={s.quiz_step_badge}>4</span> {isKo ? '테스트 완성' : 'Finish & Link'}</h2>
          
          {errors.length > 0 && <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 600 }}>{errors[0]}</div>}
          
          <button onClick={handleGenerate} className={s.quiz_primary_button} style={{ margin: '0 auto 1.5rem' }}>
            <Sparkles size={20} />
            {isKo ? '링크 생성하기' : 'Generate Quiz Link'}
          </button>

          {generatedUrl && (
            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{isKo ? '아래 주소를 복사해 친구들에게 공유하세요!' : 'Copy and share this link with your friends!'}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input readOnly value={generatedUrl} className={s.quiz_input} style={{ fontSize: '0.8rem' }} />
                <button 
                  onClick={() => { navigator.clipboard.writeText(generatedUrl); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} 
                  className={s.quiz_primary_button} style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem', background: copied ? '#10b981' : '#8b5cf6' }}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <a href={generatedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ExternalLink size={14} /> {isKo ? '미리보기' : 'Preview Live'}
              </a>
            </div>
          )}
        </section>

        {/* Standard Bottom Sections */}
        <div style={{ width: '100%' }}>
          <ShareBar title={isKo ? '심리테스트 빌더' : 'Quiz Builder'} description={isKo ? '코딩 없이 만드는 나만의 심리테스트' : 'Create your own personality quiz for free'} />
          <RelatedTools toolId="utilities/marketing/quiz-builder" />
          <div className={s.quiz_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
          <SeoSection
            ko={{
              title: "심리테스트 빌더란?",
              description: "코딩 없이 누구나 MBTI 스타일의 퀴즈를 만들고 공유할 수 있는 도구입니다. 모든 데이터는 링크에 저장되므로 가입 없이 영구 소장이 가능합니다.",
              useCases: [{ icon: '📣', title: '마케팅용 퀴즈', desc: '브랜드 홍보를 위한 심리테스트 제작' }],
              steps: [{ step: '1', desc: '유형과 질문 입력' }],
              faqs: [{ q: '무료인가요?', a: '네, 100% 무료입니다.' }]
            }}
            en={{
              title: "What is Quiz Builder?",
              description: "A simple no-code tool to create personality quizzes. All data is saved in the URL link itself.",
              useCases: [{ icon: '📣', title: 'Marketing', desc: 'Create viral quizzes for your brand' }],
              steps: [{ step: '1', desc: 'Input types and questions' }],
              faqs: [{ q: 'Is it free?', a: 'Yes, absolutely free.' }]
            }}
          />
        </div>
      </div>
    </div>
  );
}
