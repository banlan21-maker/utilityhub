'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

// ── Types ──────────────────────────────────────────────────────────────────
interface ResultType { id: string; emoji: string; title: string; description: string; }
interface AnswerOption { id: string; text: string; typeId: string; }
interface Question { id: string; text: string; options: AnswerOption[]; }
interface QuizDef {
  title: string; description: string; coverEmoji: string;
  resultTypes: ResultType[]; questions: Question[];
}

// ── Utils ──────────────────────────────────────────────────────────────────
function decodeQuiz(encoded: string): QuizDef | null {
  try { return JSON.parse(decodeURIComponent(atob(encoded))); }
  catch { return null; }
}

function generateResultImage(quiz: QuizDef, result: ResultType): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 1200, 630);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#a855f7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 630);

  // White frosted card
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  ctx.fillRect(80, 60, 1040, 510);

  // Big emoji
  ctx.font = '130px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(result.emoji, 600, 200);

  // Sub label
  ctx.font = '600 26px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('나의 결과 유형', 600, 300);

  // Result title
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(result.title, 600, 375);

  // Quiz title
  ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(quiz.title, 600, 445);

  // Branding footer
  ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Made with Utility Hub · utility-hub.com', 600, 545);

  return canvas.toDataURL('image/png');
}

// ── Quiz Player ────────────────────────────────────────────────────────────
function QuizPlayer({ quiz }: { quiz: QuizDef }) {
  type Phase = 'intro' | 'playing' | 'result';
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [resultImg, setResultImg] = useState('');
  const [copied, setCopied] = useState(false);

  const q = quiz.questions[currentQ];
  const progressPct = (currentQ / quiz.questions.length) * 100;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleSelect = useCallback((opt: AnswerOption) => {
    if (fading || selectedOpt) return;
    setSelectedOpt(opt.id);

    const newScores = { ...scores, [opt.typeId]: (scores[opt.typeId] ?? 0) + 1 };

    setTimeout(() => {
      if (currentQ + 1 >= quiz.questions.length) {
        // Find winner
        const winner = quiz.resultTypes.reduce((best, rt) =>
          (newScores[rt.id] ?? 0) > (newScores[best.id] ?? 0) ? rt : best
        , quiz.resultTypes[0]);
        setResult(winner);
        setScores(newScores);
        setPhase('result');
        setTimeout(() => setResultImg(generateResultImage(quiz, winner)), 200);
      } else {
        setFading(true);
        setScores(newScores);
        setTimeout(() => {
          setCurrentQ(prev => prev + 1);
          setSelectedOpt(null);
          setFading(false);
        }, 320);
      }
    }, 550);
  }, [fading, selectedOpt, currentQ, quiz, scores]);

  const handleRestart = () => {
    setPhase('intro'); setCurrentQ(0); setScores({});
    setSelectedOpt(null); setResult(null); setResultImg(''); setFading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImg = () => {
    if (!resultImg) return;
    const a = document.createElement('a');
    a.href = resultImg; a.download = `quiz-result.png`; a.click();
  };

  // ── Intro ──────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
      <div style={{ fontSize: '5.5rem', lineHeight: 1, marginBottom: '1.5rem' }}>{quiz.coverEmoji}</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
        {quiz.title}
      </h1>
      {quiz.description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {quiz.description}
        </p>
      )}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '2.5rem' }}>
        총 {quiz.questions.length}개 질문 · {quiz.resultTypes.length}가지 결과
      </p>
      <button
        onClick={() => setPhase('playing')}
        style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: 700, background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', border: 'none' }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        테스트 시작하기 →
      </button>
    </div>
  );

  // ── Playing ────────────────────────────────────────────────────────────
  if (phase === 'playing') return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '0.5rem 0' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <span>질문 {currentQ + 1} / {quiz.questions.length}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div style={{ height: '7px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--primary)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Question + options */}
      <div style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(12px)' : 'translateY(0)', transition: 'all 0.32s ease' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.4, textAlign: 'center' }}>
          {q.text}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {q.options.map(opt => {
            const isChosen = selectedOpt === opt.id;
            const isDimmed = !!selectedOpt && selectedOpt !== opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt)}
                disabled={!!selectedOpt}
                style={{
                  padding: '1.1rem 1.35rem', textAlign: 'left', fontSize: '1rem', fontWeight: 500,
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isChosen ? 'var(--primary)' : 'var(--border)'}`,
                  background: isChosen ? 'var(--primary)' : 'var(--surface)',
                  color: isChosen ? 'white' : 'var(--text-primary)',
                  cursor: selectedOpt ? 'default' : 'pointer',
                  opacity: isDimmed ? 0.35 : 1,
                  transform: isChosen ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.22s',
                }}
                onMouseOver={e => { if (!selectedOpt) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; } }}
                onMouseOut={e => { if (!selectedOpt) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; } }}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Result ─────────────────────────────────────────────────────────────
  if (phase === 'result' && result) return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '0.5rem 0' }}>
      {/* Result card */}
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), var(--surface))' }}>
        <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '1rem' }}>{result.emoji}</div>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>나의 유형</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>
          {result.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.98rem', marginBottom: '1.75rem' }}>
          {result.description}
        </p>

        {/* Score breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', textAlign: 'left' }}>
          {quiz.resultTypes.map(rt => {
            const score = scores[rt.id] ?? 0;
            const pct = Math.round((score / quiz.questions.length) * 100);
            const isWinner = rt.id === result.id;
            return (
              <div key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem' }}>
                <span style={{ width: '1.4rem', textAlign: 'center', flexShrink: 0 }}>{rt.emoji}</span>
                <span style={{ minWidth: '6.5rem', fontWeight: isWinner ? 700 : 400, color: isWinner ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0, fontSize: '0.82rem' }}>{rt.title}</span>
                <div style={{ flex: 1, height: '7px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: isWinner ? 'var(--primary)' : '#cbd5e1', borderRadius: '999px', transition: 'width 1.2s ease 0.3s' }} />
                </div>
                <span style={{ minWidth: '2.5rem', textAlign: 'right', color: isWinner ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isWinner ? 700 : 400, fontSize: '0.82rem' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>결과 공유하기</p>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${result.emoji} 나의 결과: ${result.title}\n${quiz.title}`)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', background: '#000', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            𝕏 X 공유
          </a>
          <button onClick={handleCopy}
            style={{ padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`, background: copied ? '#ecfdf5' : 'var(--surface)', color: copied ? '#065f46' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {copied ? '✓ 복사됨' : '🔗 링크 복사'}
          </button>
          {resultImg && (
            <button onClick={handleDownloadImg}
              style={{ padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🖼️ 이미지 저장
            </button>
          )}
          <button onClick={handleRestart}
            style={{ padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            🔄 다시 하기
          </button>
        </div>
      </div>

      {/* ── Viral CTA ── */}
      <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: 'var(--radius-lg)', color: 'white', textAlign: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
          나만의 심리테스트를 만들고 싶다면? 🧩
        </p>
        <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '0 0 1.1rem', lineHeight: 1.6 }}>
          유틸허브에서 누구나 무료로 퀴즈를 만들고 SNS에 공유할 수 있어요
        </p>
        <Link href="/ux/quiz"
          style={{ display: 'inline-block', padding: '0.65rem 1.75rem', background: 'white', color: '#6366f1', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
          나도 만들기 →
        </Link>
      </div>
    </div>
  );

  return null;
}

// ── Suspense wrapper (required for useSearchParams) ─────────────────────────
function PlayContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d');

  if (!encoded) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <p style={{ marginBottom: '1rem' }}>유효한 퀴즈 링크가 아닙니다.</p>
      <Link href="/ux/quiz" style={{ color: 'var(--primary)', fontWeight: 600 }}>퀴즈 만들러 가기 →</Link>
    </div>
  );

  const quiz = decodeQuiz(encoded);
  if (!quiz) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <p>퀴즈 데이터를 불러올 수 없습니다.</p>
    </div>
  );

  return <QuizPlayer quiz={quiz} />;
}

export default function QuizPlayPage() {
  return (
    <div>
      <NavigationActions />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>로딩 중...</div>}>
        <PlayContent />
      </Suspense>
    </div>
  );
}
