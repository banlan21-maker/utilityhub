'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import { Braces } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

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
  color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0 3px', marginRight: '2px',
};

/* ─── Action Button ─── */
function ActionBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`${ui.button} ${ui.secondary} ${ui.sm}`}>
      {children}
    </button>
  );
}

type ViewMode = 'pretty' | 'tree' | 'minify';

export default function JsonFormatterClient({ seo }: { seo?: React.ReactNode }) {
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
      <ToolHeader icon={<Braces />} title={t('title')} subtitle={t('description')} />

      <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Input panel */}
        <div className={ui.card} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={ui.label}>{t('label.input')}</span>
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
          <div style={{ fontSize: '0.75rem', color: hasInput ? (isValid ? 'var(--tint-green-fg)' : 'var(--tint-red-fg)') : 'var(--text-muted)' }}>
            {hasInput
              ? isValid
                ? `✓ ${t('status.valid')} · ${Object.keys(parsed ?? {}).length || (Array.isArray(parsed) ? parsed.length : 0)} ${t('status.keys')}`
                : `✗ ${error}`
              : t('status.empty')}
          </div>
        </div>

        {/* Output panel */}
        <div className={ui.card} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div className={ui.segmented}>
              {([['pretty', t('btn.pretty')], ['tree', t('btn.tree')], ['minify', t('btn.minify')]] as const).map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)} className={`${ui.segment} ${mode === m ? ui.segmentActive : ''}`}>{label}</button>
              ))}
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
              <span style={{ color: '#94a3b8' }}>{t('output.empty')}</span>
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
            <div className={ui.hint}>
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

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/dev/json-formatter" />


      {seo}
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
