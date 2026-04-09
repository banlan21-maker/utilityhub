'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

/* ─── JSON-LD Schemas ─── */
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "비밀번호 강도 측정 & 생성기",
  "alternateName": "Password Strength Checker & Generator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/dev/password-strength",
  "description": "암호학적으로 안전한 난수(crypto.getRandomValues)를 사용해 강력한 비밀번호를 생성하고, 비트 단위 엔트로피로 강도를 측정하는 무료 온라인 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "엔트로피(Entropy)가 높을수록 좋은 비밀번호인가요?", "acceptedAnswer": { "@type": "Answer", "text": "네. 엔트로피는 비밀번호 예측 불가능성을 비트로 나타냅니다. 일반적으로 72비트 이상이면 현대 컴퓨터로 사실상 해킹이 불가능한 수준입니다." } },
    { "@type": "Question", "name": "비밀번호가 서버로 전송되지 않나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 도구의 모든 처리(생성, 분석, 강도 측정)는 100% 브라우저(JavaScript)에서 실행됩니다. 네트워크 요청이 발생하지 않으며 개인 데이터가 외부로 전송되지 않습니다." } },
    { "@type": "Question", "name": "생성된 비밀번호는 얼마나 안전한가요?", "acceptedAnswer": { "@type": "Answer", "text": "Web Crypto API의 crypto.getRandomValues()를 사용해 암호학적으로 안전한 난수를 생성합니다. Math.random() 기반 생성기보다 훨씬 예측이 어렵습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

/* ─── Charset ─── */
const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  digits:  '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  ambiguous: /[0O1lI]/g,
};

/* ─── Strength engine ─── */
function calcStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '', crackTime: '' };

  let poolSize = 0;
  if (/[a-z]/.test(pw)) poolSize += 26;
  if (/[A-Z]/.test(pw)) poolSize += 26;
  if (/[0-9]/.test(pw)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 32;

  const entropy = pw.length * Math.log2(poolSize || 1);

  // bonus for variety
  let bonus = 0;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) bonus += 5;
  if (/[0-9]/.test(pw)) bonus += 5;
  if (/[^a-zA-Z0-9]/.test(pw)) bonus += 10;

  const effectiveEntropy = entropy + bonus;

  // Crack time at 1 trillion guesses/sec (1e12)
  const seconds = Math.pow(2, effectiveEntropy) / 1e12;
  const crackTime = formatSeconds(seconds);

  let score: 0 | 1 | 2 | 3 | 4;
  if (effectiveEntropy < 28)      score = 0;
  else if (effectiveEntropy < 40) score = 1;
  else if (effectiveEntropy < 60) score = 2;
  else if (effectiveEntropy < 80) score = 3;
  else                             score = 4;

  const labels = ['매우 취약', '취약', '보통', '강함', '매우 강함'];
  const labelsEn = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  return { score, label: labels[score], labelEn: labelsEn[score], color: colors[score], crackTime, entropy: Math.round(effectiveEntropy) };
}

function formatSeconds(s: number): string {
  if (s < 1)           return '즉시 (< 1초)';
  if (s < 60)          return `${Math.round(s)}초`;
  if (s < 3600)        return `${Math.round(s / 60)}분`;
  if (s < 86400)       return `${Math.round(s / 3600)}시간`;
  if (s < 2592000)     return `${Math.round(s / 86400)}일`;
  if (s < 31536000)    return `${Math.round(s / 2592000)}개월`;
  if (s < 1e10)        return `${Math.round(s / 31536000).toLocaleString()}년`;
  if (s < 1e15)        return `${(s / 31536000).toExponential(1)}년`;
  return '수백만 년 이상 (사실상 불가능)';
}

function generatePassword(length: number, opts: {
  upper: boolean; lower: boolean; digits: boolean; symbols: boolean; noAmbiguous: boolean;
}) {
  let pool = '';
  if (opts.upper)   pool += opts.noAmbiguous ? CHARS.upper.replace(CHARS.ambiguous, '') : CHARS.upper;
  if (opts.lower)   pool += opts.noAmbiguous ? CHARS.lower.replace(CHARS.ambiguous, '') : CHARS.lower;
  if (opts.digits)  pool += opts.noAmbiguous ? CHARS.digits.replace(CHARS.ambiguous, '') : CHARS.digits;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(v => pool[v % pool.length]).join('');
}

/* ─── UI helpers ─── */
function StrengthBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          flex: 1, height: '6px', borderRadius: '3px',
          background: i <= score ? color : 'var(--border)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

function CheckOption({ label, note, checked, onChange }: {
  label: string; note?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.4rem 0' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{label}</span>
      {note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note}</span>}
    </label>
  );
}

export default function DevPasswordPage() {
  const t = useTranslations('DevPassword');

  // Analyze mode
  const [analyzeMode, setAnalyzeMode] = useState<'generate' | 'analyze'>('generate');
  const [analysisInput, setAnalysisInput] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Generator options
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false });
  const [generated, setGenerated] = useState('');
  const [copiedGen, setCopiedGen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const pw = generatePassword(length, opts);
    setGenerated(pw);
    setHistory(h => [pw, ...h].slice(0, 5));
  }, [length, opts]);

  const copyGen = useCallback(() => {
    if (!generated) return;
    navigator.clipboard.writeText(generated).then(() => { setCopiedGen(true); setTimeout(() => setCopiedGen(false), 1500); });
  }, [generated]);

  const analyzeTarget = analyzeMode === 'analyze' ? analysisInput : generated;
  const strength = useMemo(() => calcStrength(analyzeTarget), [analyzeTarget]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
          <ShieldCheck size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      {/* Privacy badge */}
      <div style={{ maxWidth: '640px', margin: '0 auto 1.25rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
          🔒 {t('badge')}
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Mode tabs */}
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          {(['generate', 'analyze'] as const).map(m => (
            <button key={m} onClick={() => setAnalyzeMode(m)} style={{
              flex: 1, padding: '0.6rem', borderRadius: 'calc(var(--radius-md) - 2px)', border: 'none',
              background: analyzeMode === m ? 'var(--primary)' : 'transparent',
              color: analyzeMode === m ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {m === 'generate' ? `🎲 ${t('mode.generate')}` : `🔍 ${t('mode.analyze')}`}
            </button>
          ))}
        </div>

        {/* Generator */}
        {analyzeMode === 'generate' && (
          <div className="glass-panel" style={{ padding: '1.25rem' }}>

            {/* Generated output */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{
                padding: '1rem 3.5rem 1rem 1rem', minHeight: '56px',
                fontFamily: codeFont, fontSize: '1.15rem', fontWeight: 600,
                letterSpacing: '0.05em', color: generated ? 'var(--text-primary)' : 'var(--text-muted)',
                border: '2px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface)', wordBreak: 'break-all', lineHeight: 1.5,
              }}>
                {generated || t('placeholder.generated')}
              </div>
              {generated && (
                <button onClick={copyGen} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  padding: '0.35rem 0.65rem', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', background: copiedGen ? 'var(--primary)' : 'var(--surface-hover)',
                  color: copiedGen ? '#fff' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}>
                  {copiedGen ? '✓' : '📋'}
                </button>
              )}
            </div>

            <button onClick={generate} style={{
              width: '100%', padding: '0.8rem', marginBottom: '1.25rem',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--primary)', color: '#fff',
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              🎲 {t('btn.generate')}
            </button>

            {/* Length slider */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={labelStyle}>{t('label.length')}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{length}</span>
              </div>
              <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>8</span><span>64</span>
              </div>
            </div>

            {/* Options */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <CheckOption label={t('opt.upper')} checked={opts.upper} onChange={v => setOpts(o => ({ ...o, upper: v }))} />
              <CheckOption label={t('opt.lower')} checked={opts.lower} onChange={v => setOpts(o => ({ ...o, lower: v }))} />
              <CheckOption label={t('opt.digits')} checked={opts.digits} onChange={v => setOpts(o => ({ ...o, digits: v }))} />
              <CheckOption label={t('opt.symbols')} checked={opts.symbols} onChange={v => setOpts(o => ({ ...o, symbols: v }))} />
              <CheckOption label={t('opt.noAmbiguous')} note="(0, O, 1, l, I)" checked={opts.noAmbiguous} onChange={v => setOpts(o => ({ ...o, noAmbiguous: v }))} />
            </div>

            {/* History */}
            {history.length > 1 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>{t('label.history')}</span>
                {history.slice(1).map((pw, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', gap: '0.5rem' }}>
                    <code style={{ fontFamily: codeFont, fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all', flex: 1 }}>{pw}</code>
                    <button onClick={() => navigator.clipboard.writeText(pw)} style={{ padding: '0.2rem 0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-hover)', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>📋</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analyze mode */}
        {analyzeMode === 'analyze' && (
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: '0.4rem' }}>{t('label.check')}</label>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showAnalysis ? 'text' : 'password'}
                value={analysisInput}
                onChange={e => setAnalysisInput(e.target.value)}
                placeholder={t('placeholder.check')}
                style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 1rem', fontFamily: codeFont, fontSize: '1rem', fontWeight: 600, border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', letterSpacing: '0.05em' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => setShowAnalysis(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {showAnalysis ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {/* Strength panel — shown for both modes when there's a value */}
        {analyzeTarget && (
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={labelStyle}>{t('label.strength')}</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: strength.color }}>
                {strength.label}
              </span>
            </div>
            <StrengthBar score={strength.score} color={strength.color} />

            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('result.length')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{analyzeTarget.length}</div>
              </div>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('result.entropy')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{strength.entropy} <span style={{ fontSize: '0.75rem' }}>bits</span></div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: strength.score >= 3 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${strength.score >= 3 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{t('result.crackTime')}</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: strength.color, lineHeight: 1.3 }}>
                {strength.crackTime}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                * 1조 회/초 (최신 GPU 클러스터 기준)
              </div>
            </div>

            {/* Checklist */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                { ok: analyzeTarget.length >= 12, label: t('check.length12') },
                { ok: /[A-Z]/.test(analyzeTarget), label: t('check.upper') },
                { ok: /[a-z]/.test(analyzeTarget), label: t('check.lower') },
                { ok: /[0-9]/.test(analyzeTarget), label: t('check.digit') },
                { ok: /[^a-zA-Z0-9]/.test(analyzeTarget), label: t('check.symbol') },
              ].map(({ ok, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <span style={{ color: ok ? '#10b981' : '#94a3b8', fontSize: '1rem' }}>{ok ? '✓' : '○'}</span>
                  <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad */}
      <div style={{ maxWidth: '640px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '250px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/dev/password-strength" />

      {/* 광고 영역 */}
      <div style={{
        width: '100%',
        minHeight: '90px',
        background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        margin: '2rem auto',
        maxWidth: '640px'
      }}>광고 영역</div>

      <SeoSection
        ko={{
          title: '비밀번호 강도 측정 & 생성기란 무엇인가요?',
          description: '강력한 비밀번호는 계정 보안의 첫 번째 방어선입니다. 이 도구는 암호화학적으로 안전한 난수(crypto.getRandomValues)를 사용해 추측이 불가능한 비밀번호를 생성하며, 입력한 비밀번호의 보안 강도를 비트(bit) 단위 엔트로피로 정확하게 측정합니다. 모든 처리는 브라우저 내에서만 이루어지며 서버로 데이터가 전송되지 않아 완벽하게 프라이버시가 보호됩니다. 길이, 대소문자, 숫자, 특수문자 포함 여부를 조합해 상황에 맞는 최적의 비밀번호를 생성하세요.',
          useCases: [
            { icon: '🔐', title: '신규 계정 비밀번호 생성', desc: '웹사이트 가입 시 대소문자·숫자·특수문자가 혼합된 강력한 비밀번호를 즉시 생성합니다.' },
            { icon: '🏦', title: '금융 계정 보안 강화', desc: '뱅킹, 증권 계정용 16자 이상의 고강도 비밀번호를 생성해 금융 사기를 예방합니다.' },
            { icon: '🔍', title: '기존 비밀번호 보안 점검', desc: '분석 모드에서 현재 사용 중인 비밀번호의 강도와 해킹 소요 예상 시간을 확인합니다.' },
            { icon: '🏢', title: '기업 IT 보안 정책 준수', desc: '12자 이상, 대소문자·숫자·특수문자 포함 등 기업 비밀번호 정책에 맞는 비밀번호를 생성합니다.' },
          ],
          steps: [
            { step: '생성 또는 분석 모드 선택', desc: '상단 탭에서 새 비밀번호를 만들 때는 생성(Generate) 모드를, 현재 사용 중인 비밀번호의 보안을 점검할 때는 분석(Analyze) 모드를 선택합니다.' },
            { step: '옵션 설정 및 생성', desc: '생성 모드에서는 슬라이더로 길이(8~64자)를 조정하고, 대문자·소문자·숫자·특수문자 포함 여부와 혼동 문자(0, O, 1, l) 제외 옵션을 설정한 후 생성 버튼을 클릭합니다.' },
            { step: '강도 및 엔트로피 확인', desc: '강도 게이지, 비트 단위 엔트로피, 최신 GPU 클러스터(1조 회/초) 기준 해킹 소요 예상 시간을 확인합니다. 72비트 이상이면 사실상 해킹이 불가능한 수준입니다.' },
            { step: '복사 및 저장', desc: '복사 버튼으로 생성된 비밀번호를 클립보드에 저장한 뒤, 비밀번호 관리자(1Password, Bitwarden 등)에 즉시 등록하여 안전하게 보관합니다.' },
          ],
          faqs: [
            { q: '엔트로피(Entropy)가 높을수록 좋은 비밀번호인가요?', a: '네. 엔트로피(비트)는 비밀번호가 얼마나 예측하기 어려운지를 수치로 나타냅니다. 일반적으로 72비트 이상이면 최신 GPU 클러스터(1조 회/초 공격)로도 사실상 해킹이 불가능한 수준이며, 128비트 이상이면 양자 컴퓨터 위협에도 대비할 수 있습니다.' },
            { q: '비밀번호가 서버로 전송되지 않나요?', a: '이 도구의 모든 처리(생성, 분석, 강도 측정)는 100% 브라우저 내 JavaScript에서 실행됩니다. 네트워크 요청이 발생하지 않으며 입력한 비밀번호를 포함한 어떤 개인 데이터도 외부 서버로 전송되지 않습니다.' },
            { q: '생성된 비밀번호는 얼마나 안전한가요?', a: 'Web Crypto API의 crypto.getRandomValues()를 사용해 암호학적으로 안전한 진성 난수를 생성합니다. 예측 가능한 Math.random() 기반 생성기와 달리 패턴이 없어 무차별 대입 공격에 매우 강합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is a Password Strength Checker & Generator?',
          description: 'A strong password is your first line of defense for account security. This tool generates unguessable passwords using the cryptographically secure Web Crypto API (crypto.getRandomValues), and accurately measures the strength of any password using bit-level entropy. All processing happens entirely in your browser — no data is sent to any server — ensuring complete privacy. Customize length (8–64 chars), character sets (uppercase, lowercase, digits, symbols), and ambiguous character exclusion to create the right password for every situation.',
          useCases: [
            { icon: '🔐', title: 'Account Sign-up', desc: 'Generate a strong mixed-character password instantly when creating new accounts.' },
            { icon: '🏦', title: 'Financial Account Security', desc: 'Create 16+ character high-entropy passwords for banking and investment accounts to prevent fraud.' },
            { icon: '🔍', title: 'Password Audit', desc: 'Check the strength and estimated crack time of your existing passwords in Analyze mode.' },
            { icon: '🏢', title: 'Enterprise Policy Compliance', desc: 'Generate passwords meeting corporate security policies: 12+ chars, mixed case, numbers, symbols.' },
          ],
          steps: [
            { step: 'Select Mode', desc: 'Pick Generate mode to create a new password, or switch to Analyze mode to evaluate the strength of a password you already use.' },
            { step: 'Configure & Generate', desc: 'In Generate mode, drag the slider to set length (8–64 chars), toggle uppercase, lowercase, digits, symbols, and ambiguous character exclusion, then click Generate.' },
            { step: 'Check Strength & Entropy', desc: 'Review the strength gauge, bit-level entropy score, and estimated crack time based on a 1-trillion-guesses-per-second attack. 72+ bits is considered practically uncrackable.' },
            { step: 'Copy & Store Safely', desc: 'Click the copy button to save the password to your clipboard, then immediately store it in a password manager like Bitwarden or 1Password.' },
          ],
          faqs: [
            { q: 'Does higher entropy always mean a better password?', a: 'Yes. Entropy measures unpredictability in bits. Generally, 72+ bits of entropy is considered practically uncrackable by modern GPU clusters running at 1 trillion guesses per second. 128+ bits provides resistance even against future quantum computing threats.' },
            { q: 'Is my password sent to your server?', a: 'No. All generation and analysis runs 100% in your browser via JavaScript. No network request is made at any point, and no personal data — including the passwords you type or generate — ever leaves your device.' },
            { q: 'How secure is the password generator?', a: 'It uses the Web Crypto API\'s crypto.getRandomValues(), which produces cryptographically secure true random numbers with no detectable pattern. This is far more secure than Math.random()-based generators, which are predictable and should never be used for security-sensitive purposes.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}

const codeFont = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
