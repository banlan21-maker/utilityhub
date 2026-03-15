'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';

/* ─── Sample JSON ─── */
const SAMPLE = `{
  "name": "Utility Hub",
  "version": "2.0.0",
  "features": ["json", "regex", "password"],
  "meta": {
    "author": "dev team",
    "published": true,
    "score": 9.8,
    "tags": null
  }
}`;

/* ─── Syntax highlighter (no deps) ─── */
function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span style="color:#93c5fd">${match}</span>`; // key
          return `<span style="color:#86efac">${match}</span>`; // string
        }
        if (/true|false/.test(match)) return `<span style="color:#fbbf24">${match}</span>`; // bool
        if (/null/.test(match))       return `<span style="color:#f87171">${match}</span>`; // null
        return `<span style="color:#c084fc">${match}</span>`; // number
      }
    );
}

/* ─── Tree view ─── */
function TreeNode({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [open, setOpen] = useState(true);
  const indent = depth * 16;

  if (data === null) return <span style={{ color: '#f87171' }}>null</span>;
  if (typeof data === 'boolean') return <span style={{ color: '#fbbf24' }}>{String(data)}</span>;
  if (typeof data === 'number') return <span style={{ color: '#c084fc' }}>{data}</span>;
  if (typeof data === 'string') return <span style={{ color: '#86efac' }}>"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: 'var(--text-muted)' }}>[]</span>;
    return (
      <span>
        <button onClick={() => setOpen(v => !v)} style={toggleStyle}>{open ? '▼' : '▶'}</button>
        <span style={{ color: 'var(--text-muted)' }}>[{!open && `${data.length} items`}]</span>
        {open && (
          <div style={{ marginLeft: indent + 16 }}>
            {data.map((item, i) => (
              <div key={i} style={{ padding: '1px 0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>{i}: </span>
                <TreeNode data={item} depth={depth + 1} />
                {i < data.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data as object);
    if (keys.length === 0) return <span style={{ color: 'var(--text-muted)' }}>{'{}'}</span>;
    return (
      <span>
        <button onClick={() => setOpen(v => !v)} style={toggleStyle}>{open ? '▼' : '▶'}</button>
        <span style={{ color: 'var(--text-muted)' }}>{open ? '{' : `{${keys.length} keys}`}</span>
        {open && (
          <div style={{ marginLeft: indent + 16 }}>
            {keys.map((key, i) => (
              <div key={key} style={{ padding: '1px 0' }}>
                <span style={{ color: '#93c5fd' }}>"{key}"</span>
                <span style={{ color: 'var(--text-muted)' }}>: </span>
                <TreeNode data={(data as Record<string, unknown>)[key]} depth={depth + 1} />
                {i < keys.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
              </div>
            ))}
          </div>
        )}
        {open && <div><span style={{ color: 'var(--text-muted)' }}>{'}'}</span></div>}
      </span>
    );
  }
  return <span>{String(data)}</span>;
}

const toggleStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#94a3b8', fontSize: '0.7rem', padding: '0 3px', marginRight: '2px',
};

/* ─── Action Button ─── */
function ActionBtn({ onClick, children, active }: { onClick: () => void; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
      border: '1.5px solid', borderColor: active ? 'var(--primary)' : 'var(--border)',
      background: active ? 'var(--primary)' : 'var(--surface-hover)',
      color: active ? '#fff' : 'var(--text-secondary)',
      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

type ViewMode = 'pretty' | 'tree' | 'minify';

export default function JsonPage() {
  const t = useTranslations('JsonFormatter');
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ViewMode>('pretty');
  const [copied, setCopied] = useState(false);

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: null };
    try { return { parsed: JSON.parse(input), error: null }; }
    catch (e) { return { parsed: null, error: (e as Error).message }; }
  }, [input]);

  const pretty   = parsed !== null ? JSON.stringify(parsed, null, 2) : '';
  const minified = parsed !== null ? JSON.stringify(parsed) : '';
  const output   = mode === 'minify' ? minified : pretty;

  const copy = useCallback(() => {
    const val = mode === 'tree' ? pretty : output;
    navigator.clipboard.writeText(val).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }, [output, pretty, mode]);

  const highlighted = useMemo(() => pretty ? highlight(pretty) : '', [pretty]);

  const isValid = parsed !== null;
  const hasInput = input.trim().length > 0;

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Input panel */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>{t('label.input')}</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <ActionBtn onClick={() => setInput(SAMPLE)}>{t('btn.sample')}</ActionBtn>
              <ActionBtn onClick={() => setInput('')}>{t('btn.clear')}</ActionBtn>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('placeholder')}
            spellCheck={false}
            style={{ ...codeTextareaStyle, minHeight: '380px' }}
          />
          {/* Status bar */}
          <div style={{ fontSize: '0.75rem', color: hasInput ? (isValid ? '#10b981' : '#ef4444') : 'var(--text-muted)' }}>
            {hasInput
              ? isValid
                ? `✓ ${t('status.valid')} · ${Object.keys(parsed ?? {}).length || (Array.isArray(parsed) ? parsed.length : 0)} ${t('status.keys')}`
                : `✗ ${error}`
              : t('status.empty')}
          </div>
        </div>

        {/* Output panel */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <ActionBtn onClick={() => setMode('pretty')} active={mode === 'pretty'}>{t('btn.pretty')}</ActionBtn>
              <ActionBtn onClick={() => setMode('tree')} active={mode === 'tree'}>{t('btn.tree')}</ActionBtn>
              <ActionBtn onClick={() => setMode('minify')} active={mode === 'minify'}>{t('btn.minify')}</ActionBtn>
            </div>
            {isValid && (
              <ActionBtn onClick={copy}>{copied ? `✓ ${t('btn.copied')}` : `📋 ${t('btn.copy')}`}</ActionBtn>
            )}
          </div>

          <div style={{
            flex: 1, minHeight: '380px', borderRadius: 'var(--radius-md)',
            background: '#0f172a', border: '1px solid #1e293b',
            padding: '1rem', overflow: 'auto', fontFamily: codeFont, fontSize: '0.83rem',
            lineHeight: 1.6, color: '#e2e8f0',
          }}>
            {!hasInput && (
              <span style={{ color: '#475569' }}>{t('output.empty')}</span>
            )}
            {hasInput && !isValid && (
              <div style={{ color: '#f87171' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>✗ {t('output.invalid')}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{error}</div>
              </div>
            )}
            {isValid && mode === 'tree' && (
              <div style={{ fontFamily: codeFont, fontSize: '0.83rem' }}>
                <TreeNode data={parsed} />
              </div>
            )}
            {isValid && mode !== 'tree' && (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                dangerouslySetInnerHTML={{ __html: highlighted }} />
            )}
          </div>

          {isValid && mode === 'minify' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {t('status.saved', {
                original: pretty.length.toLocaleString(),
                minified: minified.length.toLocaleString(),
                pct: (100 - (minified.length / pretty.length) * 100).toFixed(1),
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ad */}
      <div style={{ maxWidth: '900px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={adStyle}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>728 × 90</span>
        </div>
      </div>

      <RelatedTools toolId="dev/json" />

      <SeoSection
        ko={{
          title: 'JSON 포맷터 & 뷰어란 무엇인가요?',
          description: 'JSON(JavaScript Object Notation)은 웹 API와 애플리케이션 간 데이터를 교환할 때 가장 많이 사용하는 경량 데이터 형식입니다. JSON 포맷터는 압축되거나 읽기 어려운 JSON 문자열을 들여쓰기와 줄바꿈이 적용된 가독성 높은 형식으로 변환하고, 구문 오류를 즉시 검출합니다. 트리 뷰 기능은 중첩된 객체와 배열의 계층 구조를 시각적으로 표현해 복잡한 JSON 구조를 쉽게 탐색할 수 있게 해줍니다. 로그 분석, API 응답 디버깅, 설정 파일 편집 등 다양한 개발 작업에 필수 도구입니다.',
          useCases: [
            { icon: '🔍', title: 'API 응답 디버깅', desc: 'REST API나 GraphQL에서 받은 JSON 응답을 즉시 정렬하고, 트리 뷰로 원하는 필드를 빠르게 탐색합니다.' },
            { icon: '📦', title: '설정 파일 편집', desc: 'package.json, tsconfig.json 등 설정 파일의 구조를 검증하고 가독성 높게 포맷합니다.' },
            { icon: '📉', title: '데이터 압축(Minify)', desc: '프로덕션 배포 전 JSON을 최소화해 네트워크 전송 크기를 줄이고 성능을 최적화합니다.' },
            { icon: '🌳', title: '트리 구조 탐색', desc: '깊게 중첩된 JSON 객체를 폴딩/펼침 트리로 탐색해 원하는 키를 빠르게 찾습니다.' },
          ],
          steps: [
            { step: 'JSON 입력', desc: '왼쪽 에디터에 JSON을 직접 붙여넣거나 샘플 데이터 버튼으로 예시를 불러옵니다.' },
            { step: '뷰 모드 선택', desc: '보기 좋게 정렬(Pretty), 트리 뷰(Tree), 압축(Minify) 중 원하는 형식을 선택합니다.' },
            { step: '복사 및 활용', desc: '결과를 복사 버튼으로 클립보드에 복사해 바로 코드에 붙여넣습니다.' },
          ],
          faqs: [
            { q: 'JSON 유효성 검사는 어떻게 하나요?', a: '입력 즉시 자동으로 JSON을 파싱해 오류 여부를 하단 상태바에 표시합니다. 오류 발생 시 정확한 오류 메시지도 함께 보여줍니다.' },
            { q: 'JSON과 YAML의 차이는 무엇인가요?', a: 'JSON은 중괄호와 따옴표를 사용하는 엄격한 형식으로 기계 친화적이고, YAML은 들여쓰기 기반의 인간 친화적 형식입니다. 둘 다 설정 파일과 데이터 직렬화에 사용됩니다.' },
            { q: 'JSON을 JavaScript 객체로 변환하려면?', a: 'JSON.parse() 메서드를 사용합니다. 반대로 객체를 JSON으로 변환할 때는 JSON.stringify()를 사용하며, 두 번째 인수로 null, 세 번째 인수로 들여쓰기 공백 수를 전달하면 이 포맷터처럼 예쁘게 출력됩니다.' },
          ],
        }}
        en={{
          title: 'What is a JSON Formatter & Viewer?',
          description: 'JSON (JavaScript Object Notation) is the most widely used lightweight data format for exchanging information between web APIs and applications. A JSON formatter transforms compressed or hard-to-read JSON strings into an indented, human-readable format and immediately detects syntax errors. The tree view visually represents nested objects and arrays, making it easy to navigate complex structures. It is an essential tool for debugging API responses, editing configuration files, and log analysis.',
          useCases: [
            { icon: '🔍', title: 'API Response Debugging', desc: 'Instantly prettify JSON from REST or GraphQL APIs and use tree view to find the exact field you need.' },
            { icon: '📦', title: 'Config File Editing', desc: 'Validate and format package.json, tsconfig.json, and other config files for readability.' },
            { icon: '📉', title: 'Minification', desc: 'Compress JSON before production deployment to reduce network payload size and improve performance.' },
            { icon: '🌳', title: 'Tree Structure Navigation', desc: 'Explore deeply nested JSON with collapsible tree nodes to quickly find any key.' },
          ],
          steps: [
            { step: 'Paste JSON', desc: 'Paste JSON into the left editor or click the Sample button to load example data.' },
            { step: 'Select View Mode', desc: 'Choose Pretty (formatted), Tree, or Minify — the output updates instantly.' },
            { step: 'Copy & Use', desc: 'Click the copy button to grab the result and paste it directly into your code.' },
          ],
          faqs: [
            { q: 'How does JSON validation work?', a: 'The tool parses your input automatically on every keystroke. The status bar shows ✓ for valid JSON or the exact error message if parsing fails.' },
            { q: 'What is the difference between JSON and YAML?', a: 'JSON uses curly braces and quotes — strict and machine-friendly. YAML uses indentation — more human-readable. Both are widely used for config files and data serialization.' },
            { q: 'How do I convert JSON to a JavaScript object?', a: 'Use JSON.parse(). To go the other way, use JSON.stringify(obj, null, 2) — the null and 2 arguments produce the same prettified output as this formatter.' },
          ],
        }}
      />
    </div>
  );
}

const codeFont = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const codeTextareaStyle: React.CSSProperties = {
  width: '100%', flex: 1, resize: 'vertical', padding: '0.85rem',
  fontFamily: codeFont, fontSize: '0.83rem', lineHeight: 1.6,
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
  background: '#0f172a', color: '#e2e8f0',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
const adStyle: React.CSSProperties = {
  width: '728px', maxWidth: '100%', height: '90px',
  background: '#f1f5f9', border: '1px dashed #cbd5e1',
  borderRadius: 'var(--radius-md)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
};
