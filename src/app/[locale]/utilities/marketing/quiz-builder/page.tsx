import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "MBTI 스타일 퀴즈 빌더 | Utility Hub"
    : "Quiz & Personality Test Builder | Utility Hub";
  const description = isKo
    ? "코딩 없이 MBTI 스타일 심리테스트를 만들고 링크로 바로 공유하세요. 무료·무제한"
    : "Build and share MBTI-style personality quizzes with no coding. Free, unlimited, no login required.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/marketing/quiz-builder`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: "https://www.theutilhub.com/ko/utilities/marketing/quiz-builder",
        en: "https://www.theutilhub.com/en/utilities/marketing/quiz-builder",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MBTI 스타일 퀴즈 빌더",
  "alternateName": "Quiz & Personality Test Builder",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/marketing/quiz-builder",
  "description": "코딩 없이 MBTI 스타일 심리테스트를 만들고 링크로 바로 공유하세요. 무료·무제한"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "만든 퀴즈는 어디에 저장되나요?", "acceptedAnswer": { "@type": "Answer", "text": "퀴즈 데이터는 별도 서버에 저장되지 않습니다. 생성된 링크 URL 자체에 퀴즈 전체 내용이 인코딩되어 있어, 링크를 보관하면 영구적으로 퀴즈를 재현할 수 있습니다. 링크를 잃어버리면 복구가 불가능하므로 반드시 저장해두세요." } },
    { "@type": "Question", "name": "퀴즈 유형과 질문은 최대 몇 개까지 만들 수 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "결과 유형은 최대 4개(A~D), 질문은 최대 10개까지 설정할 수 있습니다. 각 질문마다 결과 유형 수만큼의 선택지가 자동 생성되어, 각 선택지에 원하는 유형을 연결할 수 있습니다." } },
    { "@type": "Question", "name": "만든 퀴즈를 수정하려면 어떻게 하나요?", "acceptedAnswer": { "@type": "Answer", "text": "현재 버전은 생성된 링크를 직접 수정하는 기능을 제공하지 않습니다. 수정이 필요한 경우 빌더 페이지에서 내용을 다시 입력한 후 새 링크를 생성하시기 바랍니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

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
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
          <ShareBar title={isKo ? '심리테스트 빌더' : 'Quiz Builder'} description={isKo ? '코딩 없이 만드는 나만의 심리테스트' : 'Create your own personality quiz for free'} />
          <RelatedTools toolId="utilities/marketing/quiz-builder" />
          <div className={s.quiz_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
          <SeoSection
            ko={{
              title: "심리테스트 빌더란?",
              description: "심리테스트 빌더는 코딩 지식 없이 누구나 MBTI 스타일의 퀴즈·심리테스트를 직접 만들고 링크로 즉시 공유할 수 있는 무료 노코드 도구입니다. 결과 유형(최대 4개)과 질문(최대 10개)을 설정하면 각 선택지에 유형을 연결하는 방식으로 동작하며, 링크 생성 버튼을 누르면 퀴즈 전체 데이터가 URL에 인코딩된 공유 링크가 만들어집니다. 서버나 데이터베이스를 사용하지 않아 회원가입·로그인이 전혀 필요 없고, 생성된 링크는 영구적으로 유효합니다. 브랜드 마케팅용 바이럴 퀴즈, 팀 내 아이스브레이킹 테스트, 교육용 OX 퀴즈, 연애 유형 테스트 등 다양한 용도로 활용할 수 있습니다.",
              useCases: [
                { icon: '📣', title: '브랜드 마케팅 퀴즈', desc: '당신의 브랜드에 어울리는 제품 유형은? 같은 퀴즈를 만들어 SNS에 공유하면 브랜드 인지도를 높이고 자연스러운 바이럴 마케팅 효과를 얻을 수 있습니다.' },
                { icon: '🎓', title: '교육·연수 활용', desc: '강의 후 학습 내용을 확인하는 유형별 퀴즈를 만들거나, 팀 연수 시 참가자의 업무 스타일 유형을 파악하는 아이스브레이킹 도구로 활용할 수 있습니다.' },
                { icon: '💬', title: '커뮤니티 콘텐츠', desc: '인터넷 커뮤니티나 카카오톡 단톡방에서 유행하는 MBTI 스타일 테스트를 직접 만들어 배포하면 높은 참여율과 공유 확산 효과를 기대할 수 있습니다.' },
                { icon: '🎮', title: '게임·이벤트 기획', desc: '오프라인 행사나 온라인 이벤트에서 참가자 유형 분류, 팀 배정, 경품 추첨 등에 활용할 수 있는 맞춤 퀴즈를 코딩 없이 5분 만에 제작할 수 있습니다.' },
              ],
              steps: [
                { step: '기본 설정 입력', desc: '커버 이모지, 테스트 제목, 소개 문구를 입력합니다. 제목은 참여자가 테스트를 시작하기 전 첫인상이 되므로 흥미를 유발하는 질문형 문구를 사용하면 클릭률이 높아집니다.' },
                { step: '결과 유형 설정', desc: '결과 유형을 2~4개 추가하고 각 유형의 이모지, 이름, 상세 설명을 입력합니다. 유형 설명은 참여자가 결과를 받았을 때 공감하고 공유하고 싶어지도록 구체적으로 작성하는 것이 중요합니다.' },
                { step: '질문과 선택지 작성', desc: '질문을 최대 10개까지 추가하고, 각 선택지에 연결될 결과 유형을 드롭다운에서 지정합니다. 선택지마다 어떤 유형으로 점수가 쌓이는지 설계하면 더 정교한 결과 분류가 가능합니다.' },
                { step: '링크 생성 및 공유', desc: '링크 생성하기 버튼을 클릭하면 퀴즈 전체 데이터가 인코딩된 공유 URL이 생성됩니다. 복사 버튼으로 링크를 복사한 뒤 SNS, 카카오톡, 이메일 등 원하는 채널에 바로 공유하세요.' },
              ],
              faqs: [
                { q: '만든 퀴즈는 어디에 저장되나요?', a: '퀴즈 데이터는 별도 서버나 데이터베이스에 저장되지 않습니다. 생성된 공유 링크의 URL 파라미터 안에 퀴즈 전체 내용이 Base64로 인코딩되어 담겨 있어, 링크만 보관하면 언제든 퀴즈를 재현하고 공유할 수 있습니다. 링크를 잃어버리면 복구가 불가능하므로 반드시 복사하여 보관하시기 바랍니다.' },
                { q: '결과 유형과 질문은 최대 몇 개까지 만들 수 있나요?', a: '결과 유형은 최소 2개에서 최대 4개(A, B, C, D)까지 설정할 수 있으며, 질문은 최대 10개까지 추가 가능합니다. 각 질문의 선택지 수는 설정한 결과 유형 수와 동일하게 자동 생성되어, 선택지마다 특정 유형에 점수를 부여하는 방식으로 결과가 산출됩니다.' },
                { q: '생성한 퀴즈를 나중에 수정할 수 있나요?', a: '현재 버전에서는 이미 생성된 공유 링크를 직접 수정하는 기능을 제공하지 않습니다. 수정이 필요한 경우 빌더 페이지에서 내용을 다시 입력하고 새 링크를 생성하시면 됩니다. 이전 링크를 공유했다면 새 링크로 교체하여 재공유하시기 바랍니다.' },
                { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
              ],
            }}
            en={{
              title: "What is Quiz & Personality Test Builder?",
              description: "The Quiz Builder is a free no-code tool that lets anyone create MBTI-style personality quizzes and share them instantly via a link — no coding, no sign-up, and no server required. You define up to four result types and up to ten questions, then connect each answer option to a result type. When you click Generate, the entire quiz is encoded directly into the share URL using Base64, so the link itself contains all quiz data permanently without any database. Use it to create viral brand quizzes for marketing campaigns, icebreaker tests for team workshops, educational assessments for online courses, or fun personality tests to share in social media communities. The generated link works on any device and opens a clean, mobile-friendly quiz experience that participants can complete and share their results from.",
              useCases: [
                { icon: '📣', title: 'Brand Marketing Quizzes', desc: 'Create a "Which product type suits you?" or "What kind of traveler are you?" quiz that subtly promotes your brand, then share it on social media to drive organic engagement and viral reach without paid advertising.' },
                { icon: '🎓', title: 'Education & Training', desc: 'Build post-lesson knowledge checks or team-building personality assessments for workshops and corporate training sessions, helping facilitators quickly categorize participants by learning style or work preference.' },
                { icon: '💬', title: 'Community & Social Content', desc: 'Publish MBTI-style personality tests in online communities, group chats, or social media to spark conversations, boost engagement metrics, and keep your audience returning for new quiz content regularly.' },
                { icon: '🎮', title: 'Events & Campaigns', desc: 'Design custom quizzes for offline events, online contests, or promotional campaigns to categorize participants, assign teams, or determine prize eligibility — all without writing a single line of code.' },
              ],
              steps: [
                { step: 'Set Up Basics', desc: 'Enter a cover emoji, quiz title, and short introduction text. A compelling, question-format title (e.g., "What kind of developer are you?") significantly increases the click-through rate when the link is shared on social media.' },
                { step: 'Define Result Types', desc: 'Add two to four result types and fill in each type\'s emoji, name, and description. Write vivid, relatable descriptions that participants will want to screenshot and share with friends after seeing their result.' },
                { step: 'Write Questions and Options', desc: 'Add up to ten questions, each with one answer option per result type. Assign which result type each option points to using the dropdown selector, allowing nuanced scoring where different answer combinations lead to different results.' },
                { step: 'Generate Link and Share', desc: 'Click Generate Quiz Link to create a shareable URL that encodes the full quiz. Copy the link and share it on Instagram, KakaoTalk, email, or any platform — recipients can take the quiz immediately with no login required.' },
              ],
              faqs: [
                { q: 'Where is my quiz data stored?', a: 'Quiz data is not stored on any server or database. The entire quiz content is Base64-encoded directly into the generated share URL. As long as you keep the link, the quiz is permanently accessible. If the link is lost, the quiz cannot be recovered, so always save a copy of the generated URL somewhere safe.' },
                { q: 'How many result types and questions can I create?', a: 'You can define between 2 and 4 result types (labeled A through D) and add up to 10 questions. Each question automatically generates one answer option per result type, and you assign which type each option points to, allowing flexible scoring logic to produce distinct and meaningful results.' },
                { q: 'Can I edit a quiz after generating the link?', a: 'The current version does not support editing an already-generated link directly. To update your quiz, return to the builder, re-enter the updated content, and generate a new link. If you previously shared the old link, replace it with the new one in all locations where it was distributed.' },
                { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}
