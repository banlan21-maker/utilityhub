'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Bomb, Clock, Download, Users, RefreshCw, AlertTriangle, Copy, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './bomb-pad.module.css';

const EXPIRY_MS = 72 * 60 * 60 * 1000;
const WARNING_MS = 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 800;

interface PadRow {
  content: string; // AES-GCM encrypted, base64
  last_activity: string;
  reactions: Record<number, Record<string, number>>;
}

const BOMB_NAMES = [
  { ko: '익명의 폭탄', en: 'Anonymous Bomb' },
  { ko: '익명의 도화선', en: 'Anonymous Fuse' },
  { ko: '익명의 뇌관', en: 'Anonymous Detonator' },
  { ko: '익명의 타이머', en: 'Anonymous Timer' },
  { ko: '익명의 화약', en: 'Anonymous Powder' },
];

const EMOJI_REACTIONS = ['👍', '❤️', '📍'];

// ── Web Crypto helpers (AES-256-GCM) ─────────────────────────────────────────

async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

async function importKey(b64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const combined = new Uint8Array(12 + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), 12);
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(ciphertext: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

// ── Inner component ───────────────────────────────────────────────────────────
function BombPadContent() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [padId, setPadId] = useState('');
  const [encKey, setEncKey] = useState<CryptoKey | null>(null);
  const [keyError, setKeyError] = useState(false);
  const [content, setContent] = useState('');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(EXPIRY_MS);
  const [showExtended, setShowExtended] = useState(false);
  const [reactions, setReactions] = useState<Record<number, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [urlCopied, setUrlCopied] = useState(false);

  const [myName] = useState(() => BOMB_NAMES[Math.floor(Math.random() * BOMB_NAMES.length)]);
  const [fakeUsers] = useState(() =>
    [...BOMB_NAMES].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 1)
  );

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLocalWriteRef = useRef<number>(0);
  const encKeyRef = useRef<CryptoKey | null>(null);

  // encKey를 ref에도 동기화 (비동기 콜백에서 최신값 접근용)
  useEffect(() => {
    encKeyRef.current = encKey;
  }, [encKey]);

  // ── 1. Pad ID + 암호화 키 초기화 ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      let id = searchParams.get('pad');
      const hash = window.location.hash.slice(1); // '#' 제거

      if (!id) {
        // 신규 패드: UUID + 새 암호화 키 생성
        id = crypto.randomUUID();
        const key = await generateKey();
        const keyB64 = await exportKey(key);
        router.replace(`?pad=${id}#${keyB64}`);
        setPadId(id);
        setEncKey(key);
      } else if (hash) {
        // 기존 패드 접속: URL 해시에서 키 복원
        try {
          const key = await importKey(hash);
          setPadId(id);
          setEncKey(key);
        } catch {
          setPadId(id);
          setKeyError(true);
          setIsLoading(false);
        }
      } else {
        // pad ID는 있는데 키(해시)가 없는 경우
        setPadId(id);
        setKeyError(true);
        setIsLoading(false);
      }
    };

    init();
  }, [searchParams, router]);

  // ── 2. Supabase 로드 + Realtime 구독 ─────────────────────────────────────
  useEffect(() => {
    if (!padId || !encKey) return;

    const loadPad = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('bomb_pads')
        .select('content, last_activity, reactions')
        .eq('id', padId)
        .maybeSingle();

      if (data) {
        const lastMs = new Date(data.last_activity).getTime();
        const elapsed = Date.now() - lastMs;

        if (elapsed >= EXPIRY_MS) {
          // 만료된 패드 → DB에서 삭제
          await supabase.from('bomb_pads').delete().eq('id', padId);
        } else {
          try {
            const plain = data.content ? await decrypt(data.content, encKey) : '';
            setContent(plain);
          } catch {
            setKeyError(true);
          }
          setLastActivity(lastMs);
          setReactions(data.reactions ?? {});
        }
      } else {
        // 신규 패드 생성 (암호화된 빈 내용)
        const cipher = await encrypt('', encKey);
        await supabase.from('bomb_pads').insert({
          id: padId,
          content: cipher,
          last_activity: new Date().toISOString(),
          reactions: {},
        });
      }
      setIsLoading(false);
    };

    loadPad();

    const channel = supabase
      .channel(`pad:${padId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bomb_pads', filter: `id=eq.${padId}` },
        async (payload) => {
          const row = payload.new as PadRow;
          const remoteActivity = new Date(row.last_activity).getTime();
          setLastActivity(remoteActivity);

          // 내가 방금 쓴 변경은 커서 점프 방지를 위해 무시
          if (Date.now() - lastLocalWriteRef.current > 1500 && encKeyRef.current) {
            try {
              const plain = row.content ? await decrypt(row.content, encKeyRef.current) : '';
              setContent(plain);
            } catch { /* 복호화 실패 무시 */ }
            setReactions(row.reactions ?? {});
          }
          setShowExtended(true);
          setTimeout(() => setShowExtended(false), 2500);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [padId, encKey]);

  // ── 3. 카운트다운 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, EXPIRY_MS - (Date.now() - lastActivity)));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  // ── 4. 저장 (암호화 후 Supabase) ─────────────────────────────────────────
  const saveToSupabase = useCallback(
    async (newContent: string, newReactions?: Record<number, Record<string, number>>) => {
      if (!padId || !encKey) return;
      lastLocalWriteRef.current = Date.now();
      const cipher = await encrypt(newContent, encKey);
      const now = new Date().toISOString();
      await supabase
        .from('bomb_pads')
        .update({ content: cipher, last_activity: now, reactions: newReactions ?? reactions })
        .eq('id', padId);
      setLastActivity(Date.now());
      setShowExtended(true);
      setTimeout(() => setShowExtended(false), 2500);
    },
    [padId, encKey, reactions]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveToSupabase(val), SAVE_DEBOUNCE_MS);
  };

  const handleReaction = (lineIndex: number, emoji: string) => {
    const updated = {
      ...reactions,
      [lineIndex]: { ...(reactions[lineIndex] ?? {}), [emoji]: (reactions[lineIndex]?.[emoji] ?? 0) + 1 },
    };
    setReactions(updated);
    saveToSupabase(content, updated);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bomb-pad-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (!confirm(isKo ? '패드를 초기화하면 모든 내용이 삭제됩니다. 계속하시겠습니까?' : 'Reset will delete all content. Continue?')) return;
    if (!encKey) return;
    const cipher = await encrypt('', encKey);
    const now = new Date().toISOString();
    await supabase.from('bomb_pads').update({ content: cipher, last_activity: now, reactions: {} }).eq('id', padId);
    setContent('');
    setLastActivity(Date.now());
    setTimeLeft(EXPIRY_MS);
    setReactions({});
  };

  const handleCopyUrl = () => {
    // 해시 포함한 전체 URL 복사
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2500);
    });
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const t = Math.floor(ms / 1000);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= WARNING_MS && timeLeft > 0;
  const isExpired = timeLeft <= 0;
  const isReadOnly = isWarning || isExpired;
  const lines = content.split('\n');

  // ── 로딩 ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={s.container}>
        <NavigationActions />
        <div className={s.loadingState}>
          <div className={s.loadingBomb}>💣</div>
          <p>{isKo ? '암호화된 패드 불러오는 중...' : 'Decrypting pad...'}</p>
        </div>
      </div>
    );
  }

  // ── 키 없음 에러 ──────────────────────────────────────────────────────────
  if (keyError) {
    return (
      <div className={s.container}>
        <NavigationActions />
        <div className={s.keyErrorCard}>
          <Lock size={48} color="#ef4444" />
          <h2>{isKo ? '🔐 복호화 키가 없습니다' : '🔐 Decryption Key Missing'}</h2>
          <p>
            {isKo
              ? '이 패드를 열려면 암호화 키가 포함된 전체 URL이 필요합니다.\n공유받은 원본 링크를 다시 확인해주세요.'
              : 'You need the full URL including the encryption key (#) to open this pad.\nPlease check the original shared link.'}
          </p>
          <button
            className={s.newPadBtn}
            onClick={() => { window.location.href = window.location.pathname; }}
            aria-label={isKo ? '새 패드 만들기' : 'Create new pad'}
          >
            <Bomb size={18} />
            {isKo ? '새 패드 만들기' : 'Create New Pad'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <div className={s.header}>
        <div className={s.iconWrapper}><Bomb size={48} color="#f97316" /></div>
        <h1 className={s.title}>{isKo ? '💣 72시간 시한폭탄 패드' : '💣 72H Bomb Pad'}</h1>
        <p className={s.subtitle}>
          {isKo
            ? '마지막 수정으로부터 72시간 동안만 살아있는 공유 메모장 — 아무도 안 쓰면 폭발'
            : 'A shared notepad alive 72h from the last edit — nobody writes = BOOM'}
        </p>

        {/* 암호화 배지 */}
        <div className={s.encBadge}>
          <ShieldCheck size={14} />
          {isKo
            ? '종단간 암호화(AES-256) — 운영자도 내용을 볼 수 없습니다'
            : 'End-to-End Encrypted (AES-256) — even the site owner cannot read this'}
        </div>
      </div>

      {/* Share URL Bar */}
      <div className={s.shareUrlBar}>
        <div className={s.shareUrlLabel}>
          🔗 {isKo ? '이 링크(#포함)를 공유해야 같이 읽을 수 있어요' : 'Share the full URL (including #) to collaborate'}
        </div>
        <div className={s.shareUrlRow}>
          <span className={s.shareUrlText}>{typeof window !== 'undefined' ? window.location.href : ''}</span>
          <button onClick={handleCopyUrl} className={s.copyBtn} aria-label={isKo ? 'URL 복사' : 'Copy URL'}>
            <Copy size={14} />
            {urlCopied ? (isKo ? '✅ 복사됨!' : '✅ Copied!') : (isKo ? '복사' : 'Copy')}
          </button>
        </div>
      </div>

      {/* Timer */}
      <div className={`${s.timerCard} ${isWarning ? s.timerWarning : ''} ${isExpired ? s.timerExpired : ''}`}>
        <div className={s.timerLabel}>
          <Clock size={18} />
          {isKo ? '폭파까지 남은 시간' : 'Time Until Detonation'}
        </div>
        <div className={s.timerDisplay}>{formatTime(timeLeft)}</div>
        {showExtended && (
          <div className={s.extendedBadge}>
            {isKo ? '💥 수명 연장! 타이머 리셋' : '💥 Fuse Extended! Timer Reset'}
          </div>
        )}
        {isWarning && (
          <div className={s.warningLabel}>
            ⚠️ {isKo ? '1시간 미만! 지금 바로 데이터를 대피시키세요!' : 'Under 1 hour! Evacuate your data NOW!'}
          </div>
        )}
        {isExpired && (
          <div className={s.expiredLabel}>
            💥 {isKo ? '폭발! 패드가 소멸되었습니다' : 'BOOM! The pad has self-destructed'}
          </div>
        )}
      </div>

      {/* Presence */}
      <div className={s.presenceBar}>
        <div className={s.presenceLabel}><Users size={15} />{isKo ? '지금 접속 중' : 'Online now'}:</div>
        <div className={s.presenceList}>
          <span className={`${s.presenceBadge} ${s.presenceMine}`}>
            💣 {myName[isKo ? 'ko' : 'en']} ({isKo ? '나' : 'You'})
          </span>
          {fakeUsers.map((u, i) => (
            <span key={i} className={s.presenceBadge}>💣 {u[isKo ? 'ko' : 'en']}</span>
          ))}
        </div>
      </div>

      {/* 1시간 경고 배너 */}
      {isWarning && (
        <div className={s.evacuateBanner}>
          <AlertTriangle size={22} />
          <span>{isKo ? '패드가 곧 폭발합니다! 지금 바로 내용을 저장하세요.' : 'Pad is about to detonate! Save your content NOW.'}</span>
          <button onClick={handleDownload} className={s.evacuateBtn} aria-label={isKo ? '데이터 다운로드' : 'Download'}>
            <Download size={16} />
            {isKo ? '📥 데이터 안전하게 대피시키기' : '📥 Evacuate Data Safely'}
          </button>
        </div>
      )}

      {/* 만료 상태 */}
      {isExpired ? (
        <div className={s.expiredCard}>
          <Bomb size={64} color="#f97316" />
          <h2>{isKo ? '💥 이 패드는 소멸되었습니다' : '💥 This pad self-destructed'}</h2>
          <p>{isKo ? '72시간 동안 아무도 수정하지 않아 폭발했습니다.' : 'No one edited for 72 hours, so it exploded.'}</p>
          <button
            onClick={() => { window.location.href = window.location.pathname; }}
            className={s.newPadBtn}
            aria-label={isKo ? '새 패드 시작' : 'Start new pad'}
          >
            <RefreshCw size={18} />
            {isKo ? '새 폭탄 패드 시작' : 'Start New Bomb Pad'}
          </button>
        </div>
      ) : (
        <div className={`${s.editorCard} ${isWarning ? s.editorWarning : ''}`}>
          <div className={s.editorToolbar}>
            <span className={s.editorHint}>
              {isReadOnly
                ? (isKo ? '🔒 읽기 전용 — 수명이 1시간 미만입니다' : '🔒 Read Only — Under 1 hour remaining')
                : (isKo ? '✏️ 수정할 때마다 암호화되어 저장됩니다' : '✏️ Every edit is encrypted and saved')}
            </span>
            <div className={s.editorActions}>
              <button onClick={handleDownload} className={s.toolbarBtn} aria-label={isKo ? '다운로드' : 'Download'}>
                <Download size={15} />{isKo ? '저장' : 'Save'}
              </button>
              {!isReadOnly && (
                <button onClick={handleReset} className={s.toolbarBtnDanger} aria-label={isKo ? '초기화' : 'Reset'}>
                  <RefreshCw size={15} />{isKo ? '초기화' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          <textarea
            className={`${s.textarea} ${isReadOnly ? s.textareaReadOnly : ''}`}
            value={content}
            onChange={handleContentChange}
            readOnly={isReadOnly}
            placeholder={
              isKo
                ? '여기에 자유롭게 입력하세요...\n\n예시:\n- MT 여행 장소: 강원도 춘천\n- 맛집: 닭갈비 골목 (추가하면 +72시간!)\n- 준비물: 침낭, 텐트, 라면\n\n🔐 내용은 암호화되어 저장됩니다. 운영자도 읽을 수 없습니다.'
                : 'Type anything here...\n\nExamples:\n- Trip destination: Colorado\n- Must-try restaurant (add one = +72h!)\n- Packing: sleeping bag, tent, snacks\n\n🔐 Content is encrypted. Not even the site owner can read it.'
            }
            aria-label={isKo ? '폭탄 패드 텍스트 에디터' : 'Bomb pad text editor'}
          />

          {/* 줄별 리액션 */}
          {lines.some((l) => l.trim()) && (
            <div className={s.reactionsSection}>
              <h3 className={s.reactionTitle}>{isKo ? '줄별 리액션 투표' : 'Line Reactions'}</h3>
              {lines.map((line, idx) => {
                if (!line.trim()) return null;
                return (
                  <div key={idx} className={s.lineReaction}>
                    <span className={s.linePreview}>{line.length > 45 ? line.slice(0, 45) + '…' : line}</span>
                    <div className={s.emojiButtons}>
                      {EMOJI_REACTIONS.map((emoji) => (
                        <button key={emoji} onClick={() => handleReaction(idx, emoji)} className={s.emojiBtn} aria-label={`${emoji} line ${idx + 1}`}>
                          {emoji}
                          {reactions[idx]?.[emoji] ? <span className={s.emojiCount}>{reactions[idx][emoji]}</span> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 플로팅 공유 버튼 */}
      <button className={s.floatingShare} aria-label={isKo ? '링크 복사' : 'Copy link'} onClick={handleCopyUrl}>
        {urlCopied ? '✅' : '💬'}
        <span className={s.srOnly}>{isKo ? '공유하기' : 'Share'}</span>
      </button>

      <ShareBar
        title={isKo ? '72시간 시한폭탄 패드 — 암호화된 공유 메모장' : '72H Bomb Pad — Encrypted Collaborative Notepad'}
        description={isKo ? '종단간 암호화로 내용이 보호되는 72시간 공유 메모장. 아무도 안 쓰면 폭발합니다!' : 'End-to-end encrypted shared notepad alive for 72h. Nobody writes = BOOM!'}
      />
      <RelatedTools toolId="utilities/productivity/bomb-pad" />

      <SeoSection
        ko={{
          title: '72시간 시한폭탄 패드 — 종단간 암호화 공유 메모장',
          description: '마지막 수정으로부터 72시간 동안만 생존하는 공유 메모장. AES-256 종단간 암호화로 운영자도 내용을 볼 수 없습니다. MT, 여행, 팀 프로젝트에 최적.',
          useCases: [
            { icon: '🏕️', title: 'MT/여행 계획', desc: '단톡방 대신 이 패드에 여행 계획을 공유하세요. 맛집 리스트 하나 추가하면 3일 더 살아납니다!' },
            { icon: '🛒', title: '공동 장보기 목록', desc: '여럿이 함께 쓰는 장보기 리스트. 아무도 안 추가하면 패드가 폭발합니다.' },
            { icon: '💡', title: '단기 팀 프로젝트', desc: '짧은 스프린트의 브레인스토밍과 아이디어 공유에 최적입니다.' },
            { icon: '🎯', title: '긴급 회의록', desc: '72시간 안에 결론이 나야 하는 안건 정리에 활용하세요.' },
          ],
          steps: [
            { step: '패드 열기', desc: '이 페이지를 열면 고유 URL과 암호화 키가 자동으로 생성됩니다.' },
            { step: '전체 URL 공유', desc: '#이 포함된 전체 URL을 복사해서 공유하세요. 같은 링크를 열어야 같은 패드에 접속됩니다.' },
            { step: '같이 작성', desc: '누구든 내용을 수정하면 모든 접속자 화면에 실시간 반영됩니다.' },
            { step: '1시간 전 대피', desc: '수명이 1시간 미만으로 떨어지면 다운로드 버튼으로 내용을 저장하세요.' },
          ],
          faqs: [
            { q: '정말 운영자도 내용을 볼 수 없나요?', a: '네. 내용은 브라우저에서 AES-256-GCM으로 암호화된 후 저장됩니다. 암호화 키는 URL의 # 뒤에만 존재하며 서버로 전송되지 않습니다. 데이터베이스에는 암호화된 덩어리만 저장됩니다.' },
            { q: '수정하면 시간이 얼마나 늘어나나요?', a: '수정할 때마다 남은 시간과 무관하게 72:00:00으로 완전 리셋됩니다.' },
            { q: '링크를 잃어버리면 어떻게 되나요?', a: '#이 포함된 전체 URL을 잃어버리면 복호화 키가 없어 내용에 접근할 수 없습니다. 링크는 안전한 곳에 보관하세요.' },
            { q: '데이터는 어디에 저장되나요?', a: '암호화된 형태로 Supabase 데이터베이스에 저장됩니다. 72시간 경과 후 자동 삭제됩니다.' },
          ],
        }}
        en={{
          title: '72H Bomb Pad — End-to-End Encrypted Collaborative Notepad',
          description: 'A shared notepad alive 72 hours from the last edit, protected by AES-256 end-to-end encryption. Not even the site owner can read your content.',
          useCases: [
            { icon: '🏕️', title: 'Trip Planning', desc: 'Share travel plans here instead of group chats. Add one restaurant = 3 more days!' },
            { icon: '🛒', title: 'Group Shopping', desc: 'A shared shopping list. Nobody adds anything = pad explodes.' },
            { icon: '💡', title: 'Short Team Sprints', desc: 'Perfect for brainstorming and quick collaboration.' },
            { icon: '🎯', title: 'Urgent Meeting Notes', desc: 'Organize agendas that need a conclusion within 72 hours.' },
          ],
          steps: [
            { step: 'Open the pad', desc: 'A unique URL and encryption key are auto-generated when you open this page.' },
            { step: 'Share the full URL', desc: 'Copy the URL including the # part and share it. Same full link = same pad.' },
            { step: 'Collaborate', desc: 'Any edit is reflected in real-time on all connected screens.' },
            { step: 'Evacuate before 1 hour', desc: 'When under 1 hour remains, save your content with the download button.' },
          ],
          faqs: [
            { q: "Can't even the site owner read the content?", a: "Correct. Content is encrypted with AES-256-GCM in the browser before saving. The key lives only in the URL hash (#) and is never sent to the server. The database only contains encrypted ciphertext." },
            { q: 'How much time is added when you edit?', a: 'Every edit resets the timer to exactly 72:00:00 regardless of remaining time.' },
            { q: 'What if I lose the link?', a: 'Without the full URL including the # part, the decryption key is gone and the content is inaccessible. Keep the link in a safe place.' },
            { q: 'Where is data stored?', a: 'Encrypted data is stored in Supabase database and automatically deleted after 72 hours of inactivity.' },
          ],
        }}
      />
    </div>
  );
}

export default function BombPadPage() {
  return (
    <Suspense>
      <BombPadContent />
    </Suspense>
  );
}
