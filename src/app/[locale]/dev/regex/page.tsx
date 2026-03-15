'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';

/* ─── Cheat sheet patterns ─── */
interface CheatItem {
  labelKo: string;
  labelEn: string;
  pattern: string;
  flags: string;
  sample: string;
}
const CHEAT: CheatItem[] = [
  { labelKo: '이메일',        labelEn: 'Email',          pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi', sample: 'Contact user@example.com or admin@site.org for help.' },
  { labelKo: '한국 전화번호', labelEn: 'KR Phone',       pattern: '0\\d{1,2}-\\d{3,4}-\\d{4}', flags: 'g', sample: '010-1234-5678 또는 02-987-6543으로 연락하세요.' },
  { labelKo: 'URL',           labelEn: 'URL',             pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?[^\\s]*', flags: 'gi', sample: 'Visit https://example.com and http://sub.site.org/page?q=1' },
  { labelKo: '한국 주민번호', labelEn: 'KR SSN',         pattern: '\\d{6}-[1-4]\\d{6}', flags: 'g', sample: '홍길동 900101-1234567 (마스킹 대상)' },
  { labelKo: '숫자만',        labelEn: 'Digits only',    pattern: '\\d+', flags: 'g', sample: 'Order 12345 costs $678.90 with 3 items.' },
  { labelKo: 'IPv4 주소',     labelEn: 'IPv4 address',   pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', sample: 'Server at 192.168.1.1 and 10.0.0.255 are online.' },
  { labelKo: '16진수 색상',   labelEn: 'Hex color',      pattern: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b', flags: 'gi', sample: 'Colors: #ff0000 #0f0 #4f46e5 and rgba(0,0,0)' },
  { labelKo: '날짜 YYYY-MM-DD', labelEn: 'Date YYYY-MM-DD', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', flags: 'g', sample: 'Born 1990-05-21, expired 2025-12-31.' },
  { labelKo: '한글 문자',     labelEn: 'Korean chars',   pattern: '[가-힣]+', flags: 'g', sample: '안녕하세요 Hello こんにちは 你好' },
];

const FLAG_OPTIONS = ['g', 'i', 'm', 's'] as const;

/* ─── Highlighted text renderer ─── */
function HighlightedText({ text, regex }: { text: string; regex: RegExp | null }) {
  if (!regex || !text) return <span style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{text || <span style={{ color: '#475569' }}>— 텍스트를 입력하세요 —</span>}</span>;

  const parts: { text: string; match: boolean }[] = [];
  let last = 0;
  try {
    const r = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let m: RegExpExecArray | null;
    while ((m = r.exec(text)) !== null) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false });
      parts.push({ text: m[0], match: true });
      last = r.lastIndex;
      if (m[0].length === 0) { r.lastIndex++; }
    }
  } catch { /* invalid regex */ }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });

  if (!parts.length) return <span style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{text}</span>;

  return (
    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {parts.map((p, i) =>
        p.match
          ? <mark key={i} style={{ background: '#fbbf24', color: '#0f172a', borderRadius: '2px', padding: '0 1px' }}>{p.text}</mark>
          : <span key={i} style={{ color: '#e2e8f0' }}>{p.text}</span>
      )}
    </span>
  );
}

export default function RegexPage() {
  const t = useTranslations('RegexTester');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<string[]>(['g', 'i']);
  const [testText, setTestText] = useState('');
  const [showCheat, setShowCheat] = useState(true);

  const flagStr = flags.join('');

  const { regex, error, matchCount } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matchCount: 0 };
    try {
      const r = new RegExp(pattern, flagStr);
      const count = flags.includes('g')
        ? (testText.match(new RegExp(pattern, flagStr)) ?? []).length
        : testText.match(r) ? 1 : 0;
      return { regex: r, error: null, matchCount: count };
    } catch (e) {
      return { regex: null, error: (e as Error).message, matchCount: 0 };
    }
  }, [pattern, flagStr, testText, flags]);

  const applyCheat = (item: CheatItem) => {
    setPattern(item.pattern);
    setFlags(item.flags.split(''));
    setTestText(item.sample);
  };

  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: showCheat ? '1fr 280px' : '1fr', gap: '1rem' }}>

        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Pattern input */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={labelStyle}>{t('label.pattern')}</span>
              <button onClick={() => setShowCheat(v => !v)} style={ghostBtn}>
                {showCheat ? '◀ ' : '▶ '}{t('btn.cheatsheet')}
              </button>
            </div>

            {/* Pattern row */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: codeFont, fontSize: '1.1rem' }}>/</span>
              <input
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="e.g. \\d{3}-\\d{4}"
                spellCheck={false}
                style={{ ...codeInputStyle, flex: 1 }}
              />
              <span style={{ color: 'var(--text-muted)', fontFamily: codeFont, fontSize: '1.1rem' }}>/</span>
              <span style={{ fontFamily: codeFont, color: '#93c5fd', fontSize: '1rem', minWidth: '2rem' }}>{flagStr}</span>
            </div>

            {/* Flags */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Flags:</span>
              {FLAG_OPTIONS.map(f => (
                <button key={f} onClick={() => toggleFlag(f)} style={{
                  padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid', fontFamily: codeFont,
                  borderColor: flags.includes(f) ? 'var(--primary)' : 'var(--border)',
                  background: flags.includes(f) ? 'rgba(79,70,229,0.15)' : 'var(--surface)',
                  color: flags.includes(f) ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                }}>{f}</button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: error ? '#f87171' : matchCount > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                {error ? `✗ ${error}` : pattern ? `${matchCount} ${t('status.matches')}` : ''}
              </span>
            </div>
          </div>

          {/* Test string */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={labelStyle}>{t('label.testString')}</span>
              <button onClick={() => setTestText('')} style={ghostBtn}>{t('btn.clear')}</button>
            </div>
            <textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              placeholder={t('placeholder.test')}
              spellCheck={false}
              style={{ ...codeTextareaStyle, minHeight: '120px' }}
            />
          </div>

          {/* Live result */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: '0.6rem' }}>{t('label.result')}</span>
            <div style={{
              minHeight: '120px', padding: '0.85rem', borderRadius: 'var(--radius-md)',
              background: '#0f172a', border: '1px solid #1e293b',
              fontFamily: codeFont, fontSize: '0.85rem', lineHeight: 1.7,
              overflowY: 'auto',
            }}>
              <HighlightedText text={testText} regex={regex} />
            </div>
            {regex && matchCount > 0 && (
              <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(testText.match(new RegExp(pattern, flagStr)) ?? []).slice(0, 20).map((m, i) => (
                  <code key={i} style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: '0.78rem', fontFamily: codeFont }}>
                    {m}
                  </code>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cheat sheet sidebar */}
        {showCheat && (
          <div className="glass-panel" style={{ padding: '1rem', height: 'fit-content', maxHeight: '600px', overflowY: 'auto' }}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: '0.75rem' }}>{t('cheat.title')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {CHEAT.map(item => (
                <button
                  key={item.pattern}
                  onClick={() => applyCheat(item)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {item.labelKo} / {item.labelEn}
                  </span>
                  <code style={{ fontSize: '0.72rem', color: '#93c5fd', fontFamily: codeFont, wordBreak: 'break-all' }}>
                    /{item.pattern}/{item.flags}
                  </code>
                </button>
              ))}
            </div>

            {/* Quick reference */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>{t('cheat.quickRef')}</span>
              {[
                ['.', '임의 문자 (줄바꿈 제외)'],
                ['\\d', '숫자 [0-9]'],
                ['\\w', '단어 문자 [a-zA-Z0-9_]'],
                ['\\s', '공백 문자'],
                ['^', '문자열 시작'],
                ['$', '문자열 끝'],
                ['*', '0회 이상 반복'],
                ['+', '1회 이상 반복'],
                ['?', '0 또는 1회'],
                ['{n,m}', 'n~m회 반복'],
                ['(a|b)', 'a 또는 b'],
              ].map(([sym, desc]) => (
                <div key={sym} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.78rem' }}>
                  <code style={{ color: '#fbbf24', fontFamily: codeFont, minWidth: '52px', flexShrink: 0 }}>{sym}</code>
                  <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad */}
      <div style={{ maxWidth: '960px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={adStyle}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>728 × 90</span>
        </div>
      </div>

      <RelatedTools toolId="dev/regex" />

      <SeoSection
        ko={{
          title: '정규표현식(Regex) 테스터란 무엇인가요?',
          description: '정규표현식(Regular Expression, Regex)은 문자열에서 특정 패턴을 검색, 추출, 대체하는 강력한 도구입니다. 이메일 형식 검증, 전화번호 추출, URL 파싱, 로그 분석 등 개발의 모든 분야에서 활용됩니다. 이 테스터는 패턴과 테스트 문자열을 입력하면 실시간으로 일치하는 부분을 강조 표시하고 매치 수를 계산합니다. g(전체), i(대소문자 무시), m(다중행), s(점이 줄바꿈 포함) 등 주요 플래그를 지원하며, 이메일·전화번호·URL 등 자주 쓰는 패턴 치트시트를 제공합니다.',
          useCases: [
            { icon: '✉️', title: '이메일 형식 검증', desc: '회원가입 폼에서 이메일 형식을 검증하는 정규식을 테스트하고 엣지 케이스를 즉시 확인합니다.' },
            { icon: '📋', title: '로그 파싱', desc: '서버 로그에서 에러 코드, IP 주소, 타임스탬프 등 필요한 정보를 추출하는 패턴을 개발합니다.' },
            { icon: '🔄', title: '문자열 대체', desc: '특정 패턴을 찾아 다른 문자열로 치환하는 replace() 작업 전 패턴을 미리 검증합니다.' },
            { icon: '🔍', title: '데이터 정제', desc: 'CSV나 텍스트 데이터에서 원하는 형식의 값만 추출하는 데이터 전처리 작업에 활용합니다.' },
          ],
          steps: [
            { step: '패턴 입력', desc: '/패턴/ 형식으로 정규식을 입력하거나, 오른쪽 치트시트에서 자주 쓰는 패턴을 클릭해 불러옵니다.' },
            { step: '플래그 선택', desc: 'g(전체 검색), i(대소문자 무시), m(다중행), s(dotAll) 플래그를 필요에 따라 활성화합니다.' },
            { step: '테스트 문자열 입력 후 결과 확인', desc: '테스트 텍스트를 입력하면 매칭 부분이 실시간으로 노란색으로 강조 표시됩니다.' },
          ],
          faqs: [
            { q: '정규표현식에서 특수문자를 검색하려면?', a: '특수문자(.  * + ? ^ $ { } [ ] | ( ) \\) 앞에 백슬래시(\\)를 붙여 이스케이프합니다. 예를 들어 점(.)을 검색하려면 \\.을 사용합니다.' },
            { q: '이메일 검증 정규식이 완벽하지 않은 이유는?', a: 'RFC 5322 표준을 완전히 따르는 이메일 정규식은 매우 복잡합니다. 실무에서는 기본 형식 확인 후 서버에서 실제 이메일 발송 테스트로 최종 검증하는 것을 권장합니다.' },
            { q: '자바스크립트에서 정규식을 사용하는 방법은?', a: '/패턴/플래그 리터럴 또는 new RegExp("패턴", "플래그")로 생성합니다. test(), match(), matchAll(), replace(), split() 등의 메서드와 함께 사용합니다.' },
          ],
        }}
        en={{
          title: 'What is a Regular Expression (Regex) Tester?',
          description: 'A Regular Expression (Regex) is a powerful tool for searching, extracting, and replacing patterns in strings. It is used in every area of development: validating email formats, extracting phone numbers, parsing URLs, analyzing logs, and more. This tester highlights matched portions of the test string in real time as you type, and counts the number of matches. It supports the major flags — g (global), i (case-insensitive), m (multiline), s (dotAll) — and includes a cheat sheet of common patterns for emails, phone numbers, URLs, hex colors, and more.',
          useCases: [
            { icon: '✉️', title: 'Email Validation', desc: 'Test and refine email validation patterns for sign-up forms and catch edge cases instantly.' },
            { icon: '📋', title: 'Log Parsing', desc: 'Build patterns to extract error codes, IP addresses, and timestamps from server logs.' },
            { icon: '🔄', title: 'String Replacement', desc: 'Verify patterns before using them in replace() operations to avoid unintended substitutions.' },
            { icon: '🔍', title: 'Data Extraction', desc: 'Extract specifically formatted values from CSV or raw text during data preprocessing.' },
          ],
          steps: [
            { step: 'Enter Pattern', desc: 'Type your regex in the /pattern/ field or click any cheat sheet item to load a common pattern.' },
            { step: 'Select Flags', desc: 'Toggle g (global), i (case-insensitive), m (multiline), or s (dotAll) as needed.' },
            { step: 'Type Test String & View Results', desc: 'Enter test text and matched portions are instantly highlighted in yellow with the total match count.' },
          ],
          faqs: [
            { q: 'How do I search for special characters in regex?', a: 'Escape special characters (.  * + ? ^ $ { } [ ] | ( ) \\) with a backslash. For example, to match a literal dot, use \\.' },
            { q: 'Why is no email regex 100% accurate?', a: 'Fully RFC 5322-compliant email validation is extremely complex. In practice, use a basic format check via regex, then confirm the address with an actual email delivery test on the server side.' },
            { q: 'How do I use regex in JavaScript?', a: 'Create a regex with the /pattern/flags literal or new RegExp("pattern", "flags"). Use it with methods like test(), match(), matchAll(), replace(), and split().' },
          ],
        }}
      />
    </div>
  );
}

const codeFont = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const codeInputStyle: React.CSSProperties = {
  padding: '0.6rem 0.85rem', fontFamily: codeFont, fontSize: '0.9rem',
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
  background: '#0f172a', color: '#e2e8f0', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};
const codeTextareaStyle: React.CSSProperties = {
  width: '100%', resize: 'vertical', padding: '0.85rem',
  fontFamily: codeFont, fontSize: '0.83rem', lineHeight: 1.6,
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
  background: '#0f172a', color: '#e2e8f0', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', padding: 0,
};
const adStyle: React.CSSProperties = {
  width: '728px', maxWidth: '100%', height: '90px',
  background: '#f1f5f9', border: '1px dashed #cbd5e1',
  borderRadius: 'var(--radius-md)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
};
