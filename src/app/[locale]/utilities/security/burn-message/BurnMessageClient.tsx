'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bomb, Lock } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './burn-message.module.css';
import { ui } from '@/app/components/ui';

const MAX_LEN = 1500;
const EXPIRY_MS = 3_600_000; // 1시간
const READ_COUNTDOWN = 5; // 초

type GameState = 'loading' | 'compat' | 'write' | 'unlock' | 'read' | 'burned' | 'expired';

interface Payload {
  c: number[]; // 압축 바이트
  t: number;   // timestamp
}

// ── 압축 (명시적 ReadableStream 빌더 패턴) ─────────────────────
// CompressionStream/DecompressionStream의 lib.dom 타입이 BufferSource 기반이라
// ReadableStream<Uint8Array>.pipeThrough와 제네릭이 어긋남 → 캐스팅으로 우회.
type ByteTransform = ReadableWritablePair<Uint8Array, Uint8Array>;

async function gzipCompress(data: Uint8Array): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
  const stream = source.pipeThrough(new CompressionStream('gzip') as unknown as ByteTransform);
  const buf = await new Response(stream as unknown as ReadableStream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gzipDecompress(data: Uint8Array): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
  const stream = source.pipeThrough(new DecompressionStream('gzip') as unknown as ByteTransform);
  const buf = await new Response(stream as unknown as ReadableStream).arrayBuffer();
  return new Uint8Array(buf);
}

// ── Binary ↔ Base64URL ─────────────────────────────────────────
function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ── SHA-256 fingerprint (앞 8바이트) ───────────────────────────
async function fingerprint(hashStr: string): Promise<string> {
  const data = new TextEncoder().encode(hashStr);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest).subarray(0, 8);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function BurnMessageClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('BurnMessage');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [state, setState] = useState<GameState>('loading');

  // write mode
  const [message, setMessage] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // unlock mode
  const [decoded, setDecoded] = useState<{ message: string; timestamp: number; fp: string } | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  // read mode
  const [readCountdown, setReadCountdown] = useState(READ_COUNTDOWN);
  const [blurred, setBlurred] = useState(false);
  const [viewAgainUsed, setViewAgainUsed] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);
  const msgBoxRef = useRef<HTMLDivElement>(null);

  // ── 진입점: 호환성 + 해시 검사 (모두 useEffect) ──────────────
  useEffect(() => {
    // 1. 호환성 검사
    if (
      typeof window === 'undefined' ||
      typeof window.CompressionStream === 'undefined' ||
      typeof window.DecompressionStream === 'undefined' ||
      !crypto?.subtle?.digest
    ) {
      setState('compat');
      return;
    }

    const hash = window.location.hash;
    if (!hash.startsWith('#note=')) {
      setState('write');
      return;
    }

    // 2. 복호화 파이프라인
    (async () => {
      try {
        const encoded = hash.slice('#note='.length);
        const fp = await fingerprint(encoded);

        // 이미 열람됨?
        const marked = localStorage.getItem(`burn_${fp}`);
        if (marked) {
          setState('burned');
          return;
        }

        const bytes = base64UrlToBytes(encoded);
        const json = JSON.parse(new TextDecoder().decode(bytes)) as { z: string; t: number };
        const compressed = base64UrlToBytes(json.z);
        const decompressed = await gzipDecompress(compressed);
        const text = new TextDecoder().decode(decompressed);

        // 만료 검사
        if (Date.now() - json.t > EXPIRY_MS) {
          setState('expired');
          return;
        }

        setDecoded({ message: text, timestamp: json.t, fp });
        setRemainingMs(EXPIRY_MS - (Date.now() - json.t));
        setState('unlock');
      } catch {
        setState('expired'); // 손상된 링크 / 복호화 실패
      }
    })();
  }, []);

  // ── localStorage 청소 (Idle 스케줄링) ────────────────────────
  useEffect(() => {
    const cleanup = () => {
      try {
        const now = Date.now();
        const TWO_HOURS = 2 * EXPIRY_MS;
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith('burn_')) continue;
          try {
            const { readAt } = JSON.parse(localStorage.getItem(key) || '{}');
            if (typeof readAt === 'number' && now - readAt > TWO_HOURS) toRemove.push(key);
          } catch { toRemove.push(key); }
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
      } catch { /* ignore */ }
    };
    const schedule = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback
      || ((cb: () => void) => setTimeout(cb, 1000));
    schedule(cleanup, { timeout: 2000 });
  }, []);

  // ── unlock 카운트다운 ────────────────────────────────────────
  useEffect(() => {
    if (state !== 'unlock' || !decoded) return;
    const timer = setInterval(() => {
      const rem = EXPIRY_MS - (Date.now() - decoded.timestamp);
      if (rem <= 0) {
        setState('expired');
        clearInterval(timer);
      } else {
        setRemainingMs(rem);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state, decoded]);

  // ── read 카운트다운 ──────────────────────────────────────────
  useEffect(() => {
    if (state !== 'read') return;
    if (readCountdown <= 0) {
      setBlurred(true);
      return;
    }
    const timer = setTimeout(() => setReadCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, readCountdown]);

  // ── 링크 생성 ────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!message.trim() || message.length > MAX_LEN) return;
    try {
      const utf8 = new TextEncoder().encode(message);
      const compressed = await gzipCompress(utf8);
      const zB64 = bytesToBase64Url(compressed);
      const payload = JSON.stringify({ z: zB64, t: Date.now() });
      const encoded = bytesToBase64Url(new TextEncoder().encode(payload));
      const url = `${window.location.origin}${window.location.pathname}#note=${encoded}`;
      setGeneratedUrl(url);
      setLinkCopied(false);
    } catch {
      /* ignore — compat 검사로 사전 차단됨 */
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ── 열람 (즉시 마킹 → 노출) ──────────────────────────────────
  const handleReveal = () => {
    if (!decoded) return;
    try {
      localStorage.setItem(`burn_${decoded.fp}`, JSON.stringify({ readAt: Date.now() }));
    } catch { /* ignore */ }
    setReadCountdown(READ_COUNTDOWN);
    setBlurred(false);
    setState('read');
  };

  const handleCopyMessage = async () => {
    if (!decoded) return;
    try {
      await navigator.clipboard.writeText(decoded.message);
      setMsgCopied(true);
      setTimeout(() => setMsgCopied(false), 2000);
    } catch {
      // 폴백: 메시지 박스 선택
      if (msgBoxRef.current) {
        const range = document.createRange();
        range.selectNodeContents(msgBoxRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const handleViewAgain = () => {
    setViewAgainUsed(true);
    setReadCountdown(READ_COUNTDOWN);
    setBlurred(false);
  };

  const handleNewMessage = () => {
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  };

  const urlLen = generatedUrl.length;
  const charCount = message.length;
  const charWarn = charCount > MAX_LEN * 0.9;

  const fmtRemaining = useCallback((ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const sec = total % 60;
    return `${m}${t('minutes')} ${sec}${t('seconds')}`;
  }, [t]);

  // 하단 SEO 섹션 표시 여부 (compat 에러 화면에서만 숨김).
  // ⚠️ 'loading'(서버 초기 상태)에서도 렌더해야 SeoSection 이 raw HTML 에 포함된다.
  // 과거 'loading' 제외 → 서버 HTML 에 SEO 본문 누락 → 색인 실패.
  const showBottomSections = state !== 'compat';

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Bomb />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── State: loading ── */}
      {state === 'loading' && (
        <div className={s.loading_wrap}><div className={s.spinner} /></div>
      )}

      {/* ── State 0: compat ── */}
      {state === 'compat' && (
        <div className={`${ui.card} ${s.compat_box}`}>
          <div className={s.compat_icon}>⚠️</div>
          <div className={s.compat_title}>{t('compat_title')}</div>
          <div className={s.compat_desc}>{t('compat_desc')}</div>
          <div className={s.compat_list}>{t('compat_browser_list')}</div>
        </div>
      )}

      {/* ── State 1: write ── */}
      {state === 'write' && (
        <section className={`${ui.card} ${s.panel}`}>
          <div className={`${ui.notice} ${ui.amber} ${s.gap_bottom}`}>{t('security_notice')}</div>
          <textarea
            className={`${ui.input} ${s.textarea}`}
            value={message}
            maxLength={MAX_LEN}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
          />
          <div
            className={`${s.char_counter} ${charWarn ? s.char_counter_warn : ''}`}
            aria-live="polite"
          >
            {charCount} / {MAX_LEN}{t('char_unit')}
          </div>

          <button
            className={`${ui.button} ${ui.primary} ${ui.block} ${ui.lg} ${s.gap_top_lg}`}
            onClick={handleGenerate}
            disabled={charCount === 0}
            aria-label={t('generate_btn')}
          >
            {t('generate_btn')}
          </button>

          {generatedUrl && (
            <div className={s.link_box}>
              <div className={s.link_url}>{generatedUrl}</div>
              <button
                className={`${ui.button} ${ui.secondary} ${ui.block} ${linkCopied ? s.done : ''}`}
                onClick={handleCopyLink}
                aria-label={t('copy_btn')}
              >
                {linkCopied ? t('copy_done') : t('copy_btn')}
              </button>
              <p className={`${ui.hint} ${s.note}`}>{t('expiry_note')}</p>
              {urlLen > 4000 ? (
                <div className={`${ui.notice} ${ui.red} ${s.gap_top}`}>{t('url_warning_high')}</div>
              ) : urlLen > 2000 ? (
                <div className={`${ui.notice} ${ui.amber} ${s.gap_top}`}>{t('url_warning_medium')}</div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* ── State 2: unlock ── */}
      {state === 'unlock' && decoded && (
        <section className={`${ui.card} ${s.panel}`}>
          <div className={s.center_col}>
            <div className={s.lock_icon}><Lock size={44} color="#f43f5e" /></div>
            <div className={s.state_title}>{t('unlock_title')}</div>
            <div className={s.state_warning}>{t('unlock_warning')}</div>
            <div>
              <div className={s.countdown_label}>{t('remaining_time')}</div>
              <div className={s.countdown_big} aria-live="off">{fmtRemaining(remainingMs)}</div>
            </div>
            <button className={`${ui.button} ${ui.primary} ${ui.block} ${ui.lg}`} onClick={handleReveal} aria-label={t('reveal_btn')}>
              {t('reveal_btn')}
            </button>
          </div>
        </section>
      )}

      {/* ── State 3: read & burn ── */}
      {state === 'read' && decoded && (
        <section className={`${ui.card} ${s.panel}`}>
          {!blurred && (
            <>
              <div className={s.burn_timer_row}>
                <span>{t('auto_destruct_in')}</span>
                <span aria-live="off">{readCountdown}{t('seconds')}</span>
              </div>
              <div className={s.progress_outer}>
                <div className={s.progress_inner} style={{ width: `${(readCountdown / READ_COUNTDOWN) * 100}%` }} />
              </div>
            </>
          )}

          <div
            ref={msgBoxRef}
            className={`${s.message_box} ${blurred ? s.message_box_blurred : ''}`}
          >
            {decoded.message}
          </div>

          {!blurred && (
            <button
              className={`${ui.button} ${ui.secondary} ${ui.block} ${s.gap_top} ${msgCopied ? s.done : ''}`}
              onClick={handleCopyMessage}
              aria-label={t('copy_message')}
            >
              {msgCopied ? t('copy_done') : t('copy_message')}
            </button>
          )}

          {/* 블러 후 + 다시보기 미사용 → 다시보기 버튼 첫 렌더링 */}
          {blurred && !viewAgainUsed && (
            <button className={`${ui.button} ${ui.secondary} ${ui.block} ${s.gap_top}`} onClick={handleViewAgain} aria-label={t('view_again')}>
              {t('view_again')} ({READ_COUNTDOWN}{t('seconds')})
            </button>
          )}

          {/* 다시보기 사용 후 영구 파괴 안내 */}
          {blurred && viewAgainUsed && (
            <p className={`${ui.hint} ${s.note}`}>{t('permanent_destroyed_notice')}</p>
          )}
        </section>
      )}

      {/* ── State 4-A: burned ── */}
      {state === 'burned' && (
        <section className={`${ui.card} ${s.panel}`}>
          <div className={s.center_col}>
            <div className={s.big_icon}>💥</div>
            <div className={s.state_title}>{t('burned_title')}</div>
            <div className={s.state_warning}>{t('burned_desc')}</div>
            <button className={`${ui.button} ${ui.secondary} ${s.gap_top}`} onClick={handleNewMessage} aria-label={t('new_message_btn')}>
              {t('new_message_btn')}
            </button>
          </div>
        </section>
      )}

      {/* ── State 4-B: expired ── */}
      {state === 'expired' && (
        <section className={`${ui.card} ${s.panel}`}>
          <div className={s.center_col}>
            <div className={s.big_icon}>⏱️</div>
            <div className={s.state_title}>{t('expired_title')}</div>
            <div className={s.state_warning}>{t('expired_desc')}</div>
            <p className={`${ui.hint} ${s.note}`}>{t('clock_skew_notice')}</p>
            <button className={`${ui.button} ${ui.secondary} ${s.gap_top}`} onClick={handleNewMessage} aria-label={t('new_message_btn')}>
              {t('new_message_btn')}
            </button>
          </div>
        </section>
      )}

      {/* 하단 섹션 (compat/loading 제외) */}
      {showBottomSections && (
        <>
          <ShareBar title={t('title')} description={t('subtitle')} />
          <RelatedTools toolId="utilities/security/burn-message" />

          {seo}
        </>
      )}
    </div>
  );
}
