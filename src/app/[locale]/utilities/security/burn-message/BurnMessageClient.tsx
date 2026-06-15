'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bomb, Lock } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './burn-message.module.css';

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

export default function BurnMessageClient() {
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

      <header className={s.header}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
        }}>
          <Bomb size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* ── State: loading ── */}
      {state === 'loading' && (
        <div className={s.loading_wrap}><div className={s.spinner} /></div>
      )}

      {/* ── State 0: compat ── */}
      {state === 'compat' && (
        <div className={s.compat_box}>
          <div className={s.compat_icon}>⚠️</div>
          <div className={s.compat_title}>{t('compat_title')}</div>
          <div className={s.compat_desc}>{t('compat_desc')}</div>
          <div className={s.compat_list}>{t('compat_browser_list')}</div>
        </div>
      )}

      {/* ── State 1: write ── */}
      {state === 'write' && (
        <section className={s.panel}>
          <div className={s.notice_yellow}>{t('security_notice')}</div>
          <textarea
            className={s.textarea}
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
            className={s.btn_primary}
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
                className={`${s.copy_btn} ${linkCopied ? s.copy_btn_done : ''}`}
                onClick={handleCopyLink}
                aria-label={t('copy_btn')}
              >
                {linkCopied ? t('copy_done') : t('copy_btn')}
              </button>
              <p className={s.notice_gray}>{t('expiry_note')}</p>
              {urlLen > 4000 ? (
                <div className={s.notice_red}>{t('url_warning_high')}</div>
              ) : urlLen > 2000 ? (
                <div className={s.notice_yellow} style={{ marginBottom: 0, marginTop: '0.6rem' }}>{t('url_warning_medium')}</div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* ── State 2: unlock ── */}
      {state === 'unlock' && decoded && (
        <section className={s.panel}>
          <div className={s.center_col}>
            <div className={s.lock_icon}><Lock size={44} color="#f43f5e" /></div>
            <div className={s.state_title}>{t('unlock_title')}</div>
            <div className={s.state_warning}>{t('unlock_warning')}</div>
            <div>
              <div className={s.countdown_label}>{t('remaining_time')}</div>
              <div className={s.countdown_big} aria-live="off">{fmtRemaining(remainingMs)}</div>
            </div>
            <button className={s.btn_dark} onClick={handleReveal} aria-label={t('reveal_btn')}>
              {t('reveal_btn')}
            </button>
          </div>
        </section>
      )}

      {/* ── State 3: read & burn ── */}
      {state === 'read' && decoded && (
        <section className={s.panel}>
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
              className={`${s.copy_msg_btn} ${msgCopied ? s.copy_msg_btn_done : ''}`}
              onClick={handleCopyMessage}
              aria-label={t('copy_message')}
            >
              {msgCopied ? t('copy_done') : t('copy_message')}
            </button>
          )}

          {/* 블러 후 + 다시보기 미사용 → 다시보기 버튼 첫 렌더링 */}
          {blurred && !viewAgainUsed && (
            <button className={s.view_again_btn} onClick={handleViewAgain} aria-label={t('view_again')}>
              {t('view_again')} ({READ_COUNTDOWN}{t('seconds')})
            </button>
          )}

          {/* 다시보기 사용 후 영구 파괴 안내 */}
          {blurred && viewAgainUsed && (
            <p className={s.notice_gray}>{t('permanent_destroyed_notice')}</p>
          )}
        </section>
      )}

      {/* ── State 4-A: burned ── */}
      {state === 'burned' && (
        <section className={s.panel}>
          <div className={s.center_col}>
            <div className={s.big_icon}>💥</div>
            <div className={s.state_title}>{t('burned_title')}</div>
            <div className={s.state_warning}>{t('burned_desc')}</div>
            <button className={s.new_msg_btn} onClick={handleNewMessage} aria-label={t('new_message_btn')}>
              {t('new_message_btn')}
            </button>
          </div>
        </section>
      )}

      {/* ── State 4-B: expired ── */}
      {state === 'expired' && (
        <section className={s.panel}>
          <div className={s.center_col}>
            <div className={s.big_icon}>⏱️</div>
            <div className={s.state_title}>{t('expired_title')}</div>
            <div className={s.state_warning}>{t('expired_desc')}</div>
            <p className={s.notice_gray}>{t('clock_skew_notice')}</p>
            <button className={s.new_msg_btn} onClick={handleNewMessage} aria-label={t('new_message_btn')}>
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
          <div className={s.ad_placeholder}>{t('ad_text')}</div>

          <SeoSection
            ko={{
              title: '일회용 비밀 메모란 무엇인가요?',
              description:
                '일회용 비밀 메모(Burn Message)는 한 번 열람하면 자동으로 파괴되는 비밀 메시지를 100% 브라우저 안에서만 생성·전달하는 보안 도구입니다. 메시지는 URL의 해시(#) 부분에 압축·인코딩되어 담기는데, 웹 표준상 URL 해시는 서버로 전송되지 않으며 theutilhub은 정적 호스팅이라 서버에 메시지를 처리·저장하는 로직 자체가 존재하지 않습니다. 두 가지 안전장치가 작동합니다 — 링크는 생성 후 1시간이 지나면 자동 만료되고, 수신자가 처음 열람하는 즉시 기기에 파괴 마킹이 남아 다시 열 수 없습니다. 카카오톡으로 서버 비밀번호를 보내거나 슬랙으로 일회용 인증 코드를 공유할 때, 대화방 기록에 민감 정보가 영구 보존되는 위험을 줄여줍니다. 다만 이 도구는 우발적 노출을 막기 위한 보조 수단이며, 수신자가 화면을 캡처하거나 시크릿 모드로 열면 파괴 기능이 우회될 수 있으므로 금융·의료·법률 등 고위험 정보에는 전용 보안 시스템을 사용하시기 바랍니다.',
              useCases: [
                { icon: '🔑', title: '비밀번호 안전 전달', desc: '팀원에게 서버 관리자 비밀번호를 메신저로 보낼 때, 대화방에 영구 보존되지 않는 일회용 링크로 전달하여 사후 노출 위험을 차단합니다.' },
                { icon: '💳', title: '계좌번호·인증코드 공유', desc: '가족에게 계좌번호나 일회용 인증 코드를 1시간 후 자동 파괴 링크로 보내, 카카오톡 대화 기록에서 영구히 지워지도록 합니다.' },
                { icon: '🎫', title: '예매 정보·티켓 코드', desc: '콘서트나 비행기 티켓 예매 번호처럼 한 번 확인하면 그만인 정보를, 메신저 검색 기록에 남기지 않고 1회용으로 전달합니다.' },
                { icon: '🏢', title: '사내 기밀 메모', desc: '슬랙·팀즈 채널에 민감한 인사 정보나 미공개 프로젝트 코드네임을 공유할 때, 채널 검색 기록에 남지 않는 일회용 링크로 전달합니다.' },
              ],
              steps: [
                { step: '비밀 메시지 입력', desc: '상단 입력창에 메시지를 입력합니다. 최대 1,500자까지 가능하며, 우측 하단 실시간 카운터로 글자 수를 확인할 수 있습니다.' },
                { step: '1시간짜리 링크 생성', desc: '버튼을 클릭하면 브라우저 내부에서 메시지가 gzip 압축·인코딩됩니다. 어떤 서버에도 전송되지 않고 URL 해시에만 담깁니다.' },
                { step: '링크 복사 및 전달', desc: '복사 버튼으로 링크를 복사한 뒤 메신저로 전달합니다. 링크는 생성 후 1시간 동안만 유효합니다.' },
                { step: '수신자 1회 열람', desc: '수신자가 열람 버튼을 누르는 즉시 메시지가 노출되고, 동시에 기기에 파괴 마킹이 남아 같은 기기·브라우저에서는 다시 열 수 없습니다.' },
              ],
              faqs: [
                { q: '정말 서버에 메시지가 저장되지 않나요? 어떻게 그런 게 가능하죠?', a: 'URL의 해시(#) 부분은 웹 표준상 브라우저가 서버로 전송하지 않습니다. theutilhub은 정적 호스팅 사이트라 서버에 메시지를 받거나 처리하는 코드 자체가 없으며, 압축·인코딩·복호화 모든 과정이 사용자 브라우저 안에서만 일어납니다. 개발자 도구의 네트워크 탭으로 직접 확인하실 수 있습니다.' },
                { q: '수신자가 메시지를 캡처하거나 복사하면 어떻게 되나요?', a: '막을 수 없습니다. 이 도구는 대화방에 민감 정보가 영구 보존되는 우발적 노출을 줄이기 위한 보조 수단이지, 의도적인 보존·복사를 차단하는 시스템이 아닙니다. 캡처를 막아야 하는 고위험 정보에는 워터마크·DRM이 적용된 전용 보안 솔루션을 사용하세요.' },
                { q: '수신자가 시크릿 모드로 열거나 다른 브라우저로 열면 두 번 볼 수 있지 않나요?', a: '맞습니다. 파괴 마킹은 각 브라우저의 localStorage에 저장되므로, 시크릿 모드나 다른 브라우저는 별도 저장소를 써서 마킹이 공유되지 않습니다. 다만 1시간 자동 만료는 링크 자체(payload의 timestamp)에 박혀 있어 어떤 환경에서 열든 동일하게 작동합니다.' },
                { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '본 도구는 우발적 노출을 줄이는 보조 도구이며 진짜 보안 시스템이 아닙니다. 금융·의료·법률 등 유출 시 심각한 피해가 발생하는 고위험 정보에는 종단간 암호화 메신저나 기업용 보안 솔루션 등 전문 시스템을 사용하시기 바랍니다.' },
              ],
            }}
            en={{
              title: 'What is Burn Message?',
              description:
                'Burn Message is a security tool that creates and delivers self-destructing secret messages entirely inside your browser. The message is compressed and encoded into the URL hash (#) — and by web standard, the URL hash is never sent to the server. theutilhub is statically hosted, so there is literally no server-side code that receives or stores your message; compression, encoding, and decryption all happen in the browser. Two safeguards apply: the link auto-expires one hour after creation, and the moment the recipient opens it for the first time, a destruction marker is saved on their device so it cannot be reopened. It is ideal for sending a server password over KakaoTalk or sharing a one-time verification code over Slack without leaving sensitive data permanently in chat history. However, this is an aid against accidental exposure — if the recipient screenshots it or opens it in incognito mode, the burn feature can be bypassed, so use a dedicated security system for high-risk financial, medical, or legal information.',
              useCases: [
                { icon: '🔑', title: 'Securely Share Passwords', desc: 'When sending a server admin password to a teammate over a messenger, deliver it as a one-time link that does not persist in the chat history.' },
                { icon: '💳', title: 'Account Numbers & Codes', desc: 'Send family members an account number or one-time verification code as a link that self-destructs in 1 hour, erasing it from chat history.' },
                { icon: '🎫', title: 'Booking & Ticket Codes', desc: 'Share concert or flight booking codes — info you only need to view once — without leaving it in messenger search history.' },
                { icon: '🏢', title: 'Internal Confidential Memos', desc: 'Share sensitive HR info or unreleased project codenames on Slack/Teams as a one-time link that leaves no trace in channel search.' },
              ],
              steps: [
                { step: 'Type your secret message', desc: 'Enter your message in the top input. Up to 1,500 characters, with a live counter at the bottom right showing your progress.' },
                { step: 'Create a 1-hour link', desc: 'Click the button — the message is gzip-compressed and encoded inside your browser. It is never sent to any server; it lives only in the URL hash.' },
                { step: 'Copy and send the link', desc: 'Use the copy button, then share the link via messenger. The link is valid for only 1 hour after creation.' },
                { step: 'Recipient reads once', desc: 'The moment the recipient taps reveal, the message appears and a destruction marker is saved on their device, preventing reopening on the same browser.' },
              ],
              faqs: [
                { q: 'Is the message really not stored on a server? How is that possible?', a: 'The URL hash (#) is, by web standard, never transmitted to the server by the browser. theutilhub is a static host with no server-side code to receive or process messages — compression, encoding, and decryption all run in your browser. You can verify this yourself in the Network tab of your browser dev tools.' },
                { q: 'What if the recipient screenshots or copies the message?', a: 'It cannot be prevented. This tool reduces accidental exposure (sensitive data lingering in chat logs); it is not a system that blocks intentional retention or copying. For high-risk info where screenshots must be prevented, use a dedicated security solution with watermarking or DRM.' },
                { q: 'Can the recipient view it twice via incognito or another browser?', a: 'Yes. The destruction marker is stored in each browser\'s localStorage, so incognito mode or a different browser uses a separate store and the marker is not shared. However, the 1-hour auto-expiry is embedded in the link itself (the payload timestamp), so it works identically in any environment.' },
                { q: 'Can I use this as official security infrastructure?', a: 'No. This is an aid against accidental exposure, not a real security system. For high-risk financial, medical, or legal information where leaks cause serious harm, use professional systems such as end-to-end encrypted messengers or enterprise security solutions.' },
              ],
            }}
          />
        </>
      )}
    </div>
  );
}
