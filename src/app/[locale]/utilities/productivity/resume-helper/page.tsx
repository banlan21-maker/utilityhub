'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
import s from './resume-helper.module.css';

// ── Presets ────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  maxChars: number;
  note: string;
}

const PRESETS: Preset[] = [
  { label: '공공기관/대기업 (공백 포함 800자)', maxChars: 800,  note: '공공기관, 대기업 공채 기본' },
  { label: '취업포털 기본 (공백 포함 1,000자)',  maxChars: 1000, note: '사람인·잡코리아 기본 항목' },
  { label: '중견·중소기업 (공백 포함 1,500자)',  maxChars: 1500, note: '대부분의 중소·스타트업 지원서' },
  { label: '심층 자소서 (공백 포함 2,000자)',    maxChars: 2000, note: '삼성·현대 등 상세 항목' },
  { label: '포트폴리오 첨부형 (공백 포함 500자)', maxChars: 500,  note: '포트폴리오 중심, 간략 설명용' },
  { label: '직접 입력',                          maxChars: 0,    note: '' },
];

const STORAGE_KEY = 'uh_coverletter';

interface SavedState {
  text: string;
  maxChars: number;
  countWithSpace: boolean;
}

// ── Byte counter ────────────────────────────────────────────────────────────

function byteLength(str: string): number {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) len += 1;
    else if (code <= 0x7ff) len += 2;
    else len += 3;
  }
  return len;
}

function stripSpaces(str: string): string {
  return str.replace(/\s/g, '');
}

// ── Main component ──────────────────────────────────────────────────────────

export default function CoverLetterPage() {
  const [text, setText] = useState('');
  const [maxChars, setMaxChars] = useState(1000);
  const [customMax, setCustomMax] = useState('1000');
  const [presetIdx, setPresetIdx] = useState(1);        // index into PRESETS
  const [countWithSpace, setCountWithSpace] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s: SavedState = JSON.parse(raw);
        setText(s.text ?? '');
        setMaxChars(s.maxChars ?? 1000);
        setCountWithSpace(s.countWithSpace ?? true);
        setCustomMax(String(s.maxChars ?? 1000));
        // find matching preset
        const idx = PRESETS.findIndex(p => p.maxChars === s.maxChars);
        setPresetIdx(idx >= 0 ? idx : PRESETS.length - 1);
      }
    } catch {}
  }, []);

  // Persist
  const save = useCallback((t: string, m: number, ws: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: t, maxChars: m, countWithSpace: ws }));
    } catch {}
  }, []);

  const handleText = (val: string) => {
    setText(val);
    save(val, maxChars, countWithSpace);
  };

  const handlePreset = (idx: number) => {
    setPresetIdx(idx);
    const p = PRESETS[idx];
    if (p.maxChars > 0) {
      setMaxChars(p.maxChars);
      setCustomMax(String(p.maxChars));
      save(text, p.maxChars, countWithSpace);
    }
  };

  const handleCustomMax = (val: string) => {
    setCustomMax(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) {
      setMaxChars(n);
      save(text, n, countWithSpace);
    }
  };

  const handleToggleSpace = (ws: boolean) => {
    setCountWithSpace(ws);
    save(text, maxChars, ws);
  };

  // Stats
  const countedText  = countWithSpace ? text : stripSpaces(text);
  const charCount    = countedText.length;
  const byteCount    = byteLength(text);
  const lineCount    = text === '' ? 0 : text.split('\n').length;
  const wordCount    = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const remaining    = maxChars - charCount;
  const pct          = Math.min((charCount / maxChars) * 100, 100);

  let barColor = 'var(--primary)';
  if (pct >= 100) barColor = '#ef4444';
  else if (pct >= 90) barColor = '#f59e0b';

  // Copy for spell check
  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      window.open('https://speller.cs.pusan.ac.kr/', '_blank', 'noopener,noreferrer');
    } catch {
      window.open('https://speller.cs.pusan.ac.kr/', '_blank', 'noopener,noreferrer');
    }
  };

  const handleClear = () => {
    if (text && !confirm('입력한 내용을 모두 지우시겠습니까?')) return;
    setText('');
    save('', maxChars, countWithSpace);
  };

  return (
    <div className={s.container}>
      {/* Tool Start Card */}
      <div className={s.tool_start_card}>
        <div className={s.tool_icon_wrapper}>
          <FileText size={40} color="white" strokeWidth={2.5} />
        </div>
        <div className={s.tool_content}>
          <h1 className={s.tool_title}>자소서 작성 헬퍼</h1>
          <p className={s.tool_subtitle}>
            실시간 글자 수 / 바이트 카운터 + 부산대 맞춤법 검사기 연동
          </p>
        </div>
      </div>

      {/* ── Preset selector ── */}
      <section className={s.preset_panel}>
        <h2 className={s.preset_title}>
          글자 수 제한 프리셋
        </h2>
        <div className={s.preset_buttons} style={{ marginBottom: presetIdx === PRESETS.length - 1 ? '1rem' : 0 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePreset(i)}
              className={`${s.preset_button} ${presetIdx === i ? s.preset_button_active : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {presetIdx === PRESETS.length - 1 && (
          <div className={s.custom_input_row}>
            <label className={s.custom_label}>최대 글자 수:</label>
            <input
              type="number"
              min={1}
              value={customMax}
              onChange={e => handleCustomMax(e.target.value)}
              className={s.custom_input}
            />
            <span className={s.custom_unit}>자</span>
          </div>
        )}
      </section>

      {/* ── Count mode toggle ── */}
      <div className={s.count_mode_row}>
        <span className={s.count_mode_label}>글자 수 기준:</span>
        {[true, false].map(ws => (
          <button
            key={String(ws)}
            onClick={() => handleToggleSpace(ws)}
            className={`${s.count_mode_button} ${countWithSpace === ws ? s.count_mode_button_active : ''}`}
          >
            {ws ? '공백 포함' : '공백 제외'}
          </button>
        ))}
      </div>

      {/* ── Textarea ── */}
      <section style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={text}
          onChange={e => handleText(e.target.value)}
          placeholder="자기소개서 내용을 입력하세요..."
          rows={14}
          className={`${s.textarea} ${charCount > maxChars ? s.textarea_over_limit : ''}`}
        />

        {/* Progress bar */}
        <div style={{
          marginTop: '0.5rem',
          height: 6,
          borderRadius: 99,
          background: 'var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 99,
            background: barColor,
            transition: 'width 0.15s, background 0.3s',
          }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="glass-panel animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { label: `글자 수 (${countWithSpace ? '공백 포함' : '공백 제외'})`, value: charCount.toLocaleString(), highlight: charCount > maxChars },
            { label: '제한까지 남은 글자', value: remaining >= 0 ? `+${remaining.toLocaleString()}` : remaining.toLocaleString(), highlight: remaining < 0 },
            { label: '바이트 (Byte)', value: byteCount.toLocaleString(), highlight: false },
            { label: '줄 수', value: lineCount.toLocaleString(), highlight: false },
            { label: '단어 수', value: wordCount.toLocaleString(), highlight: false },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: s.highlight ? '#ef4444' : 'var(--primary)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Limit indicator */}
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: charCount > maxChars ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.08)',
          fontSize: '0.85rem',
          color: charCount > maxChars ? '#ef4444' : 'var(--text-secondary)',
          textAlign: 'center',
        }}>
          {charCount > maxChars
            ? `⚠️ 제한 초과! ${Math.abs(remaining).toLocaleString()}자를 줄여야 합니다.`
            : `${charCount.toLocaleString()} / ${maxChars.toLocaleString()}자 (${pct.toFixed(1)}% 사용)`}
        </div>
      </section>

      {/* ── Action buttons ── */}
      <section className="animate-fade-in" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={handleCopyAndOpen}
          disabled={text.trim() === ''}
          style={{
            flex: 1, minWidth: 200,
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: text.trim() === '' ? 'var(--border)' : 'var(--primary)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: text.trim() === '' ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {copied ? '✅ 복사 완료! 부산대 맞춤법 검사기 열림' : '🔍 맞춤법 검사하기 (텍스트 복사 + 새 탭 열기)'}
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          🗑️ 초기화
        </button>
      </section>

      {/* ── Spell check tips ── */}
      <section className="glass-panel animate-fade-in" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '3px solid var(--primary)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          💡 맞춤법 검사 사용 방법
        </h3>
        <ol style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.9, paddingLeft: '1.2rem', margin: 0 }}>
          <li>위 버튼을 클릭하면 텍스트가 자동으로 클립보드에 복사됩니다.</li>
          <li>부산대 맞춤법 검사기 페이지가 새 탭으로 열립니다.</li>
          <li>검사기 입력란에 <kbd style={{ padding: '0.1rem 0.4rem', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.85rem' }}>Ctrl+V</kbd> (Mac: ⌘V)로 붙여넣으세요.</li>
          <li>맞춤법 검사 후 수정사항을 이 페이지에 적용하세요.</li>
        </ol>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          * 부산대학교 맞춤법 검사기는 한국어 맞춤법 교정에서 가장 신뢰도 높은 무료 서비스입니다.
        </p>
      </section>

      <ShareBar
        title="자소서 작성 헬퍼 - 글자 수 & 맞춤법 검사 연동"
        description="실시간 글자 수/바이트 카운터와 부산대 맞춤법 검사기를 한 번에! 취업 준비생을 위한 자소서 도우미"
      />

      <RelatedTools toolId="productivity/coverletter" />

      {/* Ad Placeholder */}
      <div className={s.ad_placeholder}>
        광고 영역
      </div>

      <SeoSection
        ko={{
          title: '자소서 작성 헬퍼 — 글자 수 계산 & 맞춤법 검사 완벽 가이드',
          description: '취업 준비생을 위한 자기소개서 작성 도구입니다. 실시간 글자 수(공백 포함/제외) 및 바이트 계산, 다양한 제한 프리셋, 부산대학교 맞춤법 검사기 연동으로 완성도 높은 자소서를 작성하세요. 모든 데이터는 브라우저 LocalStorage에 저장되어 페이지를 닫아도 내용이 유지됩니다.',
          useCases: [
            { icon: '🏢', title: '대기업·공공기관 공채', desc: '800자, 1,000자 등 기업별 글자 수 제한에 맞춰 항목별 자소서를 작성합니다.' },
            { icon: '🎓', title: '대학원·편입학 지원', desc: '연구계획서·학업계획서 분량을 실시간으로 확인하며 작성합니다.' },
            { icon: '📋', title: '취업포털 입력', desc: '사람인·잡코리아 등 취업포털의 자소서 항목별 글자 제한을 체크합니다.' },
            { icon: '🔍', title: '맞춤법 최종 교정', desc: '부산대 맞춤법 검사기와 연동해 제출 전 맞춤법을 한 번에 검토합니다.' },
          ],
          steps: [
            { step: '프리셋 선택', desc: '지원하는 기업/기관 유형에 맞는 글자 수 제한 프리셋을 선택하거나 직접 입력합니다.' },
            { step: '글자 수 기준 설정', desc: '공백 포함/제외 중 기업이 요구하는 기준을 선택합니다. 대부분의 대기업은 공백 포함 기준입니다.' },
            { step: '자소서 작성', desc: '텍스트 입력창에 자기소개서 내용을 작성합니다. 글자 수·바이트·줄 수가 실시간으로 표시됩니다.' },
            { step: '맞춤법 검사', desc: '맞춤법 검사 버튼을 클릭하면 텍스트가 클립보드에 복사되고 부산대 검사기가 새 탭으로 열립니다.' },
          ],
          faqs: [
            { q: '공백 포함과 공백 제외, 어느 기준으로 계산해야 하나요?', a: '대기업(삼성, 현대, LG 등)과 공공기관은 대부분 공백 포함 기준을 사용합니다. 지원 공고의 안내 사항을 확인하시고, 명시되지 않은 경우 공백 포함 기준을 사용하는 것이 안전합니다.' },
            { q: '바이트(Byte) 계산이 왜 필요한가요?', a: '일부 구형 채용 시스템이나 공공기관 시스템은 글자 수 대신 바이트 기준으로 제한을 설정합니다. 한글 1자는 UTF-8 기준 3바이트이므로, 바이트 카운터를 통해 시스템 오류를 미리 방지할 수 있습니다.' },
            { q: '작성 중 브라우저를 닫으면 내용이 사라지나요?', a: '아니요. 입력한 내용은 브라우저 LocalStorage에 자동 저장됩니다. 브라우저를 닫았다가 다시 열어도 마지막으로 작성한 내용이 복원됩니다. 단, 브라우저 데이터를 삭제하면 함께 삭제됩니다.' },
            { q: '부산대 맞춤법 검사기가 가장 좋은 이유는 무엇인가요?', a: '부산대학교 인공지능연구실이 개발한 맞춤법 검사기는 국립국어원 표준 맞춤법 규칙을 기반으로 하며, 한국어 맞춤법 교정 정확도에서 무료 서비스 중 가장 높은 평가를 받습니다. 네이버·다음 등 포털 맞춤법 검사기에 비해 전문성이 뛰어납니다.' },
            { q: '글자 수 제한을 초과하면 어떻게 되나요?', a: '초과 시 프로그레스 바가 빨간색으로 변하고, 초과된 글자 수가 표시됩니다. 텍스트 입력창의 테두리도 빨간색으로 변해 시각적으로 확인할 수 있습니다. 자동 잘라내기는 하지 않으니 직접 수정해야 합니다.' },
          ],
        }}
        en={{
          title: 'Cover Letter Helper — Character Count & Spell Check Guide',
          description: 'A cover letter writing tool for job seekers. Features real-time character count (with/without spaces), byte calculation, various limit presets, and integration with a Korean spell checker. All data is stored in LocalStorage so your content persists even after closing the browser.',
          useCases: [
            { icon: '🏢', title: 'Corporate & Public Sector Applications', desc: 'Write cover letters within the character limits set by different companies and organizations.' },
            { icon: '🎓', title: 'Graduate School & Transfer Applications', desc: 'Monitor the length of research plans and study plans in real time.' },
            { icon: '📋', title: 'Job Portal Submissions', desc: 'Track character limits for each section on Korean job portals like Saramin and JobKorea.' },
            { icon: '🔍', title: 'Final Proofreading', desc: 'Integrate with Korean spell checkers to proofread before submission.' },
          ],
          steps: [
            { step: 'Select a Preset', desc: 'Choose a character limit preset that matches the company type you\'re applying to, or enter a custom limit.' },
            { step: 'Set Count Mode', desc: 'Choose whether to count with or without spaces. Most large Korean companies use the "with spaces" standard.' },
            { step: 'Write Your Cover Letter', desc: 'Type your cover letter in the text area. Character count, bytes, and line count update in real time.' },
            { step: 'Spell Check', desc: 'Click the spell check button to copy the text to your clipboard and open the spell checker in a new tab.' },
          ],
          faqs: [
            { q: 'Which character count standard should I use — with or without spaces?', a: 'Most large corporations (Samsung, Hyundai, LG, etc.) and public institutions use the "with spaces" standard. Check the application guidelines; if not specified, using "with spaces" is the safer choice.' },
            { q: 'Why is byte counting needed?', a: 'Some older recruitment systems and government systems set limits in bytes rather than characters. Since one Korean character is 3 bytes in UTF-8, the byte counter helps you avoid system errors in advance.' },
            { q: 'Will my content be lost if I close the browser?', a: 'No. Your content is automatically saved to the browser\'s LocalStorage. It will be restored the next time you open the page. Note that clearing your browser data will also delete the saved content.' },
            { q: 'Why is the Pusan National University spell checker recommended?', a: 'Developed by the AI lab at Pusan National University, this spell checker is based on the National Institute of Korean Language\'s standard rules and is rated the most accurate among free Korean spell-checking services.' },
            { q: 'What happens when I exceed the character limit?', a: 'The progress bar turns red and the number of excess characters is displayed. The text area border also turns red for visual feedback. The tool does not automatically trim the text — you must edit it manually.' },
          ],
        }}
      />
    </div>
  );
}
