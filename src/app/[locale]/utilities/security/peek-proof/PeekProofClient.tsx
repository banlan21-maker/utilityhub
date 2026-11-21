'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';
import { EyeOff, Copy, RotateCcw, Eye } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './peek-proof.module.css';
import { ui } from '@/app/components/ui';

const STRENGTH_MIN = 2;
const STRENGTH_MAX = 12;
const STRENGTH_DEFAULT = 6;
const FONT_MIN = 14;
const FONT_MAX = 28;
const FONT_DEFAULT = 16;
const PANIC_BLUR = 12;
const CLEAR_SECONDS = 30;

type ModalKind = null | 'copy' | 'reset';

export default function PeekProofClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('PeekProof');

  const [text, setText] = useState('');
  const [activeLine, setActiveLine] = useState(0);
  const [strength, setStrength] = useState(STRENGTH_DEFAULT);
  const [fontSize, setFontSize] = useState(FONT_DEFAULT);
  const [panic, setPanic] = useState(false);
  const [autoClear, setAutoClear] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useMemo(() => text.split('\n'), [text]);

  // ── caret → active line ──────────────────────────────────────
  const syncActiveLine = useCallback(() => {
    if (isComposingRef.current) return; // IME 조합 중 갱신 보류
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? 0;
    const before = el.value.slice(0, pos);
    let count = 0;
    for (let i = 0; i < before.length; i++) {
      if (before[i] === '\n') count++;
    }
    setActiveLine(count);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (!isComposingRef.current) {
      // defer to next frame so selectionStart is settled
      requestAnimationFrame(syncActiveLine);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposingRef.current = false;
    setText((e.target as HTMLTextAreaElement).value);
    requestAnimationFrame(syncActiveLine);
  };

  // ── scroll sync ──────────────────────────────────────────────
  const handleScroll = () => {
    const ta = textareaRef.current;
    const vis = visualRef.current;
    if (ta && vis) {
      vis.scrollTop = ta.scrollTop;
      vis.scrollLeft = ta.scrollLeft;
    }
  };

  // ── toast helper ─────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // ── clipboard countdown ──────────────────────────────────────
  const cancelCountdown = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
  }, []);

  const startCountdown = useCallback(() => {
    cancelCountdown();
    setCountdown(CLEAR_SECONDS);
    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          countdownTimer.current = null;
          // best-effort clipboard wipe
          navigator.clipboard
            ?.writeText('')
            .then(() => showToast(t('clipboard_cleared_toast')))
            .catch(() => showToast(t('clipboard_clear_failed')));
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cancelCountdown, showToast, t]);

  // ── copy ─────────────────────────────────────────────────────
  const doCopy = useCallback(async () => {
    setModal(null);
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('copy_done'));
      if (autoClear) startCountdown();
    } catch {
      showToast(t('copy_failed'));
    }
  }, [text, autoClear, startCountdown, showToast, t]);

  // ── reset ────────────────────────────────────────────────────
  const doReset = useCallback(() => {
    setModal(null);
    setText('');
    setActiveLine(0);
    cancelCountdown();
    showToast(t('reset_done'));
    textareaRef.current?.focus();
  }, [cancelCountdown, showToast, t]);

  // ── ESC priority matrix (global) ─────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isComposingRef.current) return; // 1순위: IME 조합 중 → 무시
      if (modal !== null) {
        // 2순위: 모달 닫기만
        e.preventDefault();
        setModal(null);
        return;
      }
      // 3순위: 패닉 모드 토글
      e.preventDefault();
      setPanic((p) => !p);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal]);

  // ── visibility warning during countdown ──────────────────────
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && countdown !== null) {
        // background tab may block clipboard write — warn user
        showToast(t('clipboard_clear_failed'));
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [countdown, showToast, t]);

  // ── cleanup ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ── per-line visual class + blur ─────────────────────────────
  const lineStyle = useCallback(
    (idx: number): { className: string; blur: number } => {
      const dist = Math.abs(idx - activeLine);
      if (panic) {
        return { className: s.vline_masked, blur: PANIC_BLUR };
      }
      if (dist === 0) return { className: s.vline_focus, blur: 0 };
      if (dist === 1) return { className: s.vline_adjacent, blur: 0 };
      return { className: s.vline_masked, blur: strength };
    },
    [activeLine, panic, strength]
  );

  const sharedFont: React.CSSProperties = { fontSize: `${fontSize}px` };

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* ── Header ── */}
      <ToolHeader icon={<EyeOff />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── 2-column ── */}
      <div className={s.layout}>
        {/* ── Settings (left) ── */}
        <aside className={`${ui.card} ${s.settings}`}>
          <h2 className={`${ui.cardTitle} ${s.tight}`}>{t('settings_title')}</h2>

          {/* protection strength */}
          <div className={ui.field}>
            <label className={`${ui.label} ${s.field_label}`} htmlFor="pp-strength">
              <span>{t('strength_label')}</span>
              <span className={s.field_value}>{strength}px</span>
            </label>
            <input
              id="pp-strength"
              className={s.slider}
              type="range"
              min={STRENGTH_MIN}
              max={STRENGTH_MAX}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              aria-valuenow={strength}
              aria-valuemin={STRENGTH_MIN}
              aria-valuemax={STRENGTH_MAX}
              aria-label={t('strength_label')}
            />
            <span className={ui.hint}>{t('strength_hint')}</span>
          </div>

          {/* font size */}
          <div className={ui.field}>
            <label className={`${ui.label} ${s.field_label}`} htmlFor="pp-font">
              <span>{t('fontsize_label')}</span>
              <span className={s.field_value}>{fontSize}px</span>
            </label>
            <input
              id="pp-font"
              className={s.slider}
              type="range"
              min={FONT_MIN}
              max={FONT_MAX}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              aria-valuenow={fontSize}
              aria-valuemin={FONT_MIN}
              aria-valuemax={FONT_MAX}
              aria-label={t('fontsize_label')}
            />
          </div>

          {/* active zone guide */}
          <div className={s.zone_box}>
            <p className={s.zone_box_title}>{t('active_zone_title')}</p>
            <div className={s.zone_row}>
              <span className={`${s.zone_dot} ${s.zone_dot_focus}`} />
              {t('active_zone_focus')}
            </div>
            <div className={s.zone_row}>
              <span className={`${s.zone_dot} ${s.zone_dot_adjacent}`} />
              {t('active_zone_adjacent')}
            </div>
            <div className={s.zone_row}>
              <span className={`${s.zone_dot} ${s.zone_dot_masked}`} />
              {t('active_zone_masked')}
            </div>
          </div>

          {/* ESC guide */}
          <div className={`${ui.notice} ${ui.green} ${s.stack}`}>
            <p className={s.info_box_title}>{t('esc_guide_title')}</p>
            {t('esc_guide_body')}
          </div>

          {/* single-line tip */}
          <div className={`${ui.notice} ${ui.amber}`}>{t('single_line_tip')}</div>

          {/* clipboard auto-clear option */}
          <div className={`${s.clip_box} ${autoClear ? s.clip_box_active : ''}`}>
            <label className={s.clip_check_row}>
              <input
                type="checkbox"
                checked={autoClear}
                onChange={(e) => {
                  setAutoClear(e.target.checked);
                  if (!e.target.checked) cancelCountdown();
                }}
                aria-describedby="pp-clip-help"
              />
              <span className={s.clip_label}>{t('clipboard_auto_clear_label')}</span>
            </label>
            <p id="pp-clip-help" className={s.clip_help}>
              {t('clipboard_auto_clear_help')}
            </p>
          </div>

          {/* actions */}
          <div className={s.actions}>
            {countdown !== null ? (
              <button
                className={`${ui.button} ${ui.danger} ${ui.block}`}
                onClick={cancelCountdown}
                aria-label={t('clipboard_countdown_cancel')}
              >
                {t('clipboard_countdown_label', { seconds: countdown })}
              </button>
            ) : (
              <button
                className={`${ui.button} ${ui.primary} ${ui.block}`}
                onClick={() => setModal('copy')}
                disabled={text.length === 0}
                aria-label={t('copy_btn')}
              >
                <Copy size={16} /> {t('copy_btn')}
              </button>
            )}
            <button
              className={`${ui.button} ${ui.secondary} ${ui.block}`}
              onClick={() => setModal('reset')}
              disabled={text.length === 0}
              aria-label={t('reset_btn')}
            >
              <RotateCcw size={16} /> {t('reset_btn')}
            </button>
          </div>

          {/* aria-live region — announce countdown every 5s only */}
          <div className="sr-only" aria-live="polite">
            {countdown !== null && countdown % 5 === 0
              ? t('clipboard_countdown_label', { seconds: countdown })
              : ''}
          </div>
        </aside>

        {/* ── Editor (right) ── */}
        <div className={s.editor_panel}>
          <div className={s.toolbar}>
            <span className={s.line_indicator}>
              {t('current_line', { line: activeLine + 1 })}
            </span>
            <button
              className={`${ui.button} ${ui.sm} ${panic ? ui.danger : ui.secondary}`}
              onClick={() => setPanic((p) => !p)}
              aria-pressed={panic}
              aria-label={panic ? t('panic_active') : t('panic_label')}
            >
              {panic ? <Eye size={15} /> : <EyeOff size={15} />}
              {panic ? t('panic_active') : t('panic_label')}
            </button>
          </div>

          <div className={s.mirror}>
            {/* empty hint (behind everything) */}
            {text.length === 0 && (
              <div className={s.empty_hint} style={sharedFont} aria-hidden="true">
                {t('empty_hint')}
              </div>
            )}

            {/* back: visual layer */}
            <div
              ref={visualRef}
              className={`${s.layer} ${s.visual}`}
              style={sharedFont}
              aria-hidden="true"
            >
              {lines.map((line, idx) => {
                const { className, blur } = lineStyle(idx);
                return (
                  <div
                    key={idx}
                    className={`${s.vline} ${className}`}
                    style={blur > 0 ? { filter: `blur(${blur}px)` } : undefined}
                  >
                    {line === '' ? ' ' : line}
                  </div>
                );
              })}
            </div>

            {/* front: input layer */}
            <textarea
              ref={textareaRef}
              className={`${s.layer} ${s.input}`}
              style={sharedFont}
              value={text}
              onChange={handleChange}
              onSelect={syncActiveLine}
              onKeyUp={syncActiveLine}
              onClick={syncActiveLine}
              onFocus={syncActiveLine}
              onScroll={handleScroll}
              onCompositionStart={handleCompositionStart}
              onCompositionUpdate={() => { isComposingRef.current = true; }}
              onCompositionEnd={handleCompositionEnd}
              placeholder={t('placeholder')}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={t('subtitle')}
              aria-multiline="true"
              role="textbox"
            />
          </div>
        </div>
      </div>

      {/* ── Tips ── */}
      <section className={ui.card}>
        <h2 className={ui.cardTitle}>{t('tips_title')}</h2>
        <ul className={s.tips_list}>
          <li>{t('tip_1')}</li>
          <li>{t('tip_2')}</li>
          <li>{t('tip_3')}</li>
          <li>{t('tip_4')}</li>
          <li>{t('tip_single_line')}</li>
        </ul>
      </section>

      {/* ── bottom sections ── */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/security/peek-proof" />

      {seo}

      {/* ── Modals ── */}
      {modal === 'copy' && (
        <div
          className={s.modal_overlay}
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={s.modal_title}>{t('copy_confirm_title')}</h3>
            <p className={s.modal_body}>
              {t('copy_confirm_body')}
              {!autoClear && <><br /><br />{t('clipboard_security_notice')}</>}
            </p>
            <div className={s.modal_actions}>
              <button className={`${ui.button} ${ui.secondary}`} onClick={() => setModal(null)}>
                {t('modal_cancel')}
              </button>
              <button className={`${ui.button} ${ui.primary}`} onClick={doCopy}>
                {t('copy_confirm_ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'reset' && (
        <div
          className={s.modal_overlay}
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={s.modal_title}>{t('reset_confirm_title')}</h3>
            <p className={s.modal_body}>{t('reset_confirm_body')}</p>
            <div className={s.modal_actions}>
              <button className={`${ui.button} ${ui.secondary}`} onClick={() => setModal(null)}>
                {t('modal_cancel')}
              </button>
              <button className={`${ui.button} ${ui.primary}`} onClick={doReset}>
                {t('reset_confirm_ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
