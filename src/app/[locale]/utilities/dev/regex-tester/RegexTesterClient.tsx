'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import rxs from './regex-tester.module.css';
import { ui } from '@/app/components/ui';

/* ─── Cheat sheet patterns (라벨은 i18n 키로 분리) ─── */
interface CheatItem {
  key: string;
  pattern: string;
  flags: string;
  sample: string;
  sampleEn?: string; // 영문 페이지용 예시 문장 (없으면 sample 사용)
}
const CHEAT: CheatItem[] = [
  { key: 'email',    pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi', sample: 'Contact user@example.com or admin@site.org for help.' },
  { key: 'phone_kr', pattern: '0\\d{1,2}-\\d{3,4}-\\d{4}', flags: 'g', sample: '010-1234-5678 또는 02-987-6543으로 연락하세요.', sampleEn: 'Call 010-1234-5678 or 02-987-6543 for details.' },
  { key: 'url',      pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?[^\\s]*', flags: 'gi', sample: 'Visit https://example.com and http://sub.site.org/page?q=1' },
  { key: 'ssn_kr',   pattern: '\\d{6}-[1-4]\\d{6}', flags: 'g', sample: '홍길동 900101-1234567 (마스킹 대상)', sampleEn: 'Hong Gil-dong 900101-1234567 (to be masked)' },
  { key: 'digits',   pattern: '\\d+', flags: 'g', sample: 'Order 12345 costs $678.90 with 3 items.' },
  { key: 'ipv4',     pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', sample: 'Server at 192.168.1.1 and 10.0.0.255 are online.' },
  { key: 'hex',      pattern: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b', flags: 'gi', sample: 'Colors: #ff0000 #0f0 #4f46e5 and rgba(0,0,0)' },
  { key: 'date',     pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', flags: 'g', sample: 'Born 1990-05-21, expired 2025-12-31.' },
  { key: 'hangul',   pattern: '[가-힣]+', flags: 'g', sample: '안녕하세요 Hello こんにちは 你好' },
];

const FLAG_OPTIONS = ['g', 'i', 'm', 's'] as const;
const MAX_TOKENS = 20;

const QUICK_REF: { sym: string; key: string }[] = [
  { sym: '.',     key: 'any_char' },
  { sym: '\\d',   key: 'digit' },
  { sym: '\\w',   key: 'word' },
  { sym: '\\s',   key: 'space' },
  { sym: '^',     key: 'start' },
  { sym: '$',     key: 'end' },
  { sym: '*',     key: 'zero_or_more' },
  { sym: '+',     key: 'one_or_more' },
  { sym: '?',     key: 'zero_or_one' },
  { sym: '{n,m}', key: 'n_to_m' },
  { sym: '(a|b)', key: 'or' },
];

/* ─── Highlighted text renderer ─── */
function HighlightedText({
  text,
  regex,
  emptyHint,
}: {
  text: string;
  regex: RegExp | null;
  emptyHint: string;
}) {
  if (!regex || !text) {
    return (
      <span style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
        {text || <span style={{ color: '#94a3b8' }}>{emptyHint}</span>}
      </span>
    );
  }

  const parts: { text: string; match: boolean }[] = [];
  let last = 0;
  try {
    const r = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let m: RegExpExecArray | null;
    let safety = 0;
    while ((m = r.exec(text)) !== null && safety++ < 10000) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false });
      parts.push({ text: m[0], match: true });
      last = r.lastIndex;
      if (m[0].length === 0) r.lastIndex++;
    }
  } catch { /* invalid regex */ }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });

  if (!parts.length) return <span style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{text}</span>;

  return (
    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            style={{ background: '#fbbf24', color: 'var(--text-primary)', borderRadius: '2px', padding: '0 1px' }}
          >
            {p.text}
          </mark>
        ) : (
          <span key={i} style={{ color: '#e2e8f0' }}>
            {p.text}
          </span>
        ),
      )}
    </span>
  );
}

export default function RegexTesterClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('RegexTester');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<string[]>(['g', 'i']);
  const [testText, setTestText] = useState('');
  const [showCheat, setShowCheat] = useState(true);

  const flagStr = useMemo(() => flags.join(''), [flags]);

  // 정규식 + 매치 결과를 한 번만 컴파일
  const { regex, error, allMatches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, allMatches: [] as string[] };
    try {
      const r = new RegExp(pattern, flagStr);
      // 매치 결과는 g 플래그가 있어야 모든 매치 반환
      const gRegex = flagStr.includes('g') ? r : new RegExp(pattern, flagStr + 'g');
      const matches = testText.match(gRegex) ?? [];
      return { regex: r, error: null, allMatches: matches };
    } catch (e) {
      return { regex: null, error: (e as Error).message, allMatches: [] };
    }
  }, [pattern, flagStr, testText]);

  const matchCount = allMatches.length;
  const displayedTokens = allMatches.slice(0, MAX_TOKENS);
  const moreCount = matchCount - displayedTokens.length;

  const applyCheat = (item: CheatItem) => {
    setPattern(item.pattern);
    setFlags(item.flags.split(''));
    setTestText(isKo ? item.sample : (item.sampleEn ?? item.sample));
  };

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  return (
    <div className={rxs.rx_wrap}>
      <NavigationActions />
      <ToolHeader icon={<Search />} title={t('title')} subtitle={t('description')} />

      <div className={`${rxs.rx_grid} ${showCheat ? rxs.rx_grid_with_cheat : ''}`}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Pattern input */}
          <div className={ui.card}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.6rem',
              }}
            >
              <span className={ui.label}>{t('label.pattern')}</span>
              <button onClick={() => setShowCheat((v) => !v)} className={`${ui.button} ${ui.ghost} ${ui.sm}`} aria-label={t('btn.cheatsheet')}>
                {showCheat ? '◀ ' : '▶ '}
                {t('btn.cheatsheet')}
              </button>
            </div>

            {/* Pattern row — 모바일 친화적 레이아웃 */}
            <div className={rxs.rx_pattern_row}>
              <span className={rxs.rx_slash}>/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. \\d{3}-\\d{4}"
                spellCheck={false}
                style={codeInputStyle}
                className={rxs.rx_pattern_input}
                aria-label={t('label.pattern')}
              />
              <span className={rxs.rx_slash}>/</span>
              <span className={rxs.rx_flag_str}>{flagStr || '—'}</span>
            </div>

            {/* Flags */}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: '0.75rem',
              }}
            >
              <span className={ui.hint} style={{ marginRight: '0.25rem' }}>Flags:</span>
              {FLAG_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  aria-label={`flag ${f}`}
                  className={`${ui.chip} ${ui.pill} ${flags.includes(f) ? ui.chipActive : ''}`}
                  style={{ fontFamily: codeFont }}
                >
                  {f}
                </button>
              ))}
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.78rem',
                  color: error ? 'var(--tint-red-fg)' : matchCount > 0 ? 'var(--tint-green-fg)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {error
                  ? `✗ ${t('status.error_prefix')}`
                  : pattern
                    ? matchCount > 0
                      ? `${matchCount} ${t('status.matches')}`
                      : t('status.no_match')
                    : ''}
              </span>
            </div>

            {/* 에러 상세 (한국어 안내 + 원문) */}
            {error && (
              <div className={`${ui.notice} ${ui.red} ${rxs.rx_error_box}`}>
                <code>{error}</code>
              </div>
            )}
          </div>

          {/* Test string */}
          <div className={ui.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span className={ui.label}>{t('label.testString')}</span>
              <button onClick={() => setTestText('')} className={`${ui.button} ${ui.ghost} ${ui.sm}`} aria-label={t('btn.clear')}>
                {t('btn.clear')}
              </button>
            </div>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder={t('placeholder.test')}
              spellCheck={false}
              style={{ ...codeTextareaStyle, minHeight: '120px' }}
              aria-label={t('label.testString')}
            />
          </div>

          {/* Live result */}
          <div className={ui.card}>
            <span className={ui.label} style={{ display: 'block', marginBottom: '0.6rem' }}>{t('label.result')}</span>
            <div
              style={{
                minHeight: '120px',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: '#0f172a',
                border: '1px solid #1e293b',
                fontFamily: codeFont,
                fontSize: '0.85rem',
                lineHeight: 1.7,
                overflowY: 'auto',
              }}
            >
              <HighlightedText text={testText} regex={regex} emptyHint={t('placeholder.empty_result')} />
            </div>

            {regex && matchCount > 0 && (
              <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                {displayedTokens.map((m, i) => (
                  <code
                    key={i}
                    className={`${ui.badge} ${ui.amber}`}
                    style={{ fontFamily: codeFont }}
                  >
                    {m}
                  </code>
                ))}
                {moreCount > 0 && (
                  <span className={`${ui.badge} ${ui.gray}`}>
                    {t('status.more_results', { n: moreCount })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cheat sheet sidebar */}
        {showCheat && (
          <div
            className={`${ui.card} ${rxs.rx_cheat}`}
          >
            <span className={ui.label} style={{ display: 'block', marginBottom: '0.75rem' }}>{t('cheat.title')}</span>
            <div className={rxs.rx_cheat_list}>
              {CHEAT.map((item) => (
                <button
                  key={item.pattern}
                  onClick={() => applyCheat(item)}
                  aria-label={t(`cheat.items.${item.key}` as 'cheat.items.email')}
                  className={`${ui.chip} ${rxs.rx_cheat_btn}`}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {t(`cheat.items.${item.key}` as 'cheat.items.email')}
                  </span>
                  <code
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--tint-blue-fg)',
                      fontFamily: codeFont,
                      fontWeight: 500,
                      wordBreak: 'break-all',
                    }}
                  >
                    /{item.pattern}/{item.flags}
                  </code>
                </button>
              ))}
            </div>

            {/* Quick reference */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span className={ui.label} style={{ display: 'block', marginBottom: '0.5rem' }}>{t('cheat.quickRef')}</span>
              {QUICK_REF.map(({ sym, key }) => (
                <div
                  key={sym}
                  style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.78rem' }}
                >
                  <code style={{ color: 'var(--tint-amber-fg)', fontFamily: codeFont, minWidth: '52px', flexShrink: 0 }}>{sym}</code>
                  <span style={{ color: 'var(--text-secondary)' }}>{t(`quickRef.${key}` as 'quickRef.any_char')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/dev/regex-tester" />


      {seo}
    </div>
  );
}

const codeFont = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const codeInputStyle: React.CSSProperties = {
  padding: '0.6rem 0.85rem',
  fontFamily: codeFont,
  fontSize: '0.9rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: '#0f172a',
  color: '#e2e8f0',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};
const codeTextareaStyle: React.CSSProperties = {
  width: '100%',
  resize: 'vertical',
  padding: '0.85rem',
  fontFamily: codeFont,
  fontSize: '0.83rem',
  lineHeight: 1.6,
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: '#0f172a',
  color: '#e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
