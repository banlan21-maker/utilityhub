'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Bomb, Clock, Download, Users, RefreshCw, AlertTriangle, Copy } from 'lucide-react';
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
  id: string;
  content: string;
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

// ── Inner component (needs Suspense for useSearchParams) ──────────────────────
function BombPadContent() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [padId, setPadId] = useState<string>('');
  const [content, setContent] = useState('');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(EXPIRY_MS);
  const [showExtended, setShowExtended] = useState(false);
  const [reactions, setReactions] = useState<Record<number, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [urlCopied, setUrlCopied] = useState(false);

  const [myName] = useState(() => BOMB_NAMES[Math.floor(Math.random() * BOMB_NAMES.length)]);
  const [fakeUsers] = useState(() => {
    const count = Math.floor(Math.random() * 2) + 1;
    return [...BOMB_NAMES].sort(() => Math.random() - 0.5).slice(0, count);
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLocalWriteRef = useRef<number>(0);

  // ── 1. Pad ID 초기화 ──────────────────────────────────────────────────────
  useEffect(() => {
    let id = searchParams.get('pad');
    if (!id) {
      id = crypto.randomUUID();
      router.replace(`?pad=${id}`);
    }
    setPadId(id);
  }, [searchParams, router]);

  // ── 2. Supabase 데이터 로드 + Realtime 구독 ───────────────────────────────
  useEffect(() => {
    if (!padId) return;

    const loadPad = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bomb_pads')
        .select('content, last_activity, reactions')
        .eq('id', padId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Load error:', error);
      }

      if (data) {
        setContent(data.content ?? '');
        setLastActivity(new Date(data.last_activity).getTime());
        setReactions(data.reactions ?? {});
      } else {
        // 신규 패드 생성
        await supabase.from('bomb_pads').insert({
          id: padId,
          content: '',
          last_activity: new Date().toISOString(),
          reactions: {},
        });
      }
      setIsLoading(false);
    };

    loadPad();

    // Realtime 구독 — 다른 사용자가 수정할 때 즉시 반영
    const channel = supabase
      .channel(`pad:${padId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bomb_pads', filter: `id=eq.${padId}` },
        (payload) => {
          const row = payload.new as PadRow;
          const remoteActivity = new Date(row.last_activity).getTime();

          // 내가 방금 쓴 변경은 무시 (커서 점프 방지)
          if (Date.now() - lastLocalWriteRef.current > 1500) {
            setContent(row.content ?? '');
            setReactions(row.reactions ?? {});
          }
          setLastActivity(remoteActivity);
          setShowExtended(true);
          setTimeout(() => setShowExtended(false), 2500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [padId]);

  // ── 3. 카운트다운 타이머 ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = EXPIRY_MS - (Date.now() - lastActivity);
      setTimeLeft(Math.max(0, remaining));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  // ── 4. Supabase 저장 (디바운스) ───────────────────────────────────────────
  const saveToSupabase = useCallback(
    async (newContent: string, newReactions?: Record<number, Record<string, number>>) => {
      if (!padId) return;
      lastLocalWriteRef.current = Date.now();
      const now = new Date().toISOString();
      await supabase.from('bomb_pads').update({
        content: newContent,
        last_activity: now,
        reactions: newReactions ?? reactions,
      }).eq('id', padId);
      setLastActivity(Date.now());
      setShowExtended(true);
      setTimeout(() => setShowExtended(false), 2500);
    },
    [padId, reactions]
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
      [lineIndex]: {
        ...(reactions[lineIndex] ?? {}),
        [emoji]: (reactions[lineIndex]?.[emoji] ?? 0) + 1,
      },
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
    const now = new Date().toISOString();
    await supabase.from('bomb_pads').update({ content: '', last_activity: now, reactions: {} }).eq('id', padId);
    setContent('');
    setLastActivity(Date.now());
    setTimeLeft(EXPIRY_MS);
    setReactions({});
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2500);
    });
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= WARNING_MS && timeLeft > 0;
  const isExpired = timeLeft <= 0;
  const isReadOnly = isWarning || isExpired;
  const lines = content.split('\n');

  if (isLoading) {
    return (
      <div className={s.container}>
        <NavigationActions />
        <div className={s.loadingState}>
          <div className={s.loadingBomb}>💣</div>
          <p>{isKo ? '패드 불러오는 중...' : 'Loading pad...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <div className={s.header}>
        <div className={s.iconWrapper}>
          <Bomb size={48} color="#f97316" />
        </div>
        <h1 className={s.title}>
          {isKo ? '💣 72시간 시한폭탄 패드' : '💣 72H Bomb Pad'}
        </h1>
        <p className={s.subtitle}>
          {isKo
            ? '마지막 수정으로부터 72시간 동안만 살아있는 공유 메모장 — 아무도 안 쓰면 폭발'
            : 'A shared notepad alive 72h from the last edit — nobody writes = BOOM'}
        </p>
      </div>

      {/* Share URL Bar */}
      <div className={s.shareUrlBar}>
        <div className={s.shareUrlLabel}>
          <span>🔗 {isKo ? '이 링크를 공유하면 같이 쓸 수 있어요' : 'Share this link to collaborate'}</span>
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

      {/* Presence Bar */}
      <div className={s.presenceBar}>
        <div className={s.presenceLabel}>
          <Users size={15} />
          {isKo ? '지금 접속 중' : 'Online now'}:
        </div>
        <div className={s.presenceList}>
          <span className={`${s.presenceBadge} ${s.presenceMine}`}>
            💣 {myName[isKo ? 'ko' : 'en']} ({isKo ? '나' : 'You'})
          </span>
          {fakeUsers.map((user, i) => (
            <span key={i} className={s.presenceBadge}>
              💣 {user[isKo ? 'ko' : 'en']}
            </span>
          ))}
        </div>
      </div>

      {/* 1-hour evacuation banner */}
      {isWarning && (
        <div className={s.evacuateBanner}>
          <AlertTriangle size={22} />
          <span>
            {isKo ? '패드가 곧 폭발합니다! 지금 바로 내용을 저장하세요.' : 'Pad is about to detonate! Save your content NOW.'}
          </span>
          <button onClick={handleDownload} className={s.evacuateBtn} aria-label={isKo ? '데이터 다운로드' : 'Download data'}>
            <Download size={16} />
            {isKo ? '📥 데이터 안전하게 대피시키기' : '📥 Evacuate Data Safely'}
          </button>
        </div>
      )}

      {/* Expired State */}
      {isExpired ? (
        <div className={s.expiredCard}>
          <Bomb size={64} color="#f97316" />
          <h2>{isKo ? '💥 이 패드는 소멸되었습니다' : '💥 This pad self-destructed'}</h2>
          <p>
            {isKo
              ? '72시간 동안 아무도 수정하지 않아 폭발했습니다.'
              : 'No one edited for 72 hours, so it exploded.'}
          </p>
          <button onClick={handleReset} className={s.newPadBtn} aria-label={isKo ? '새 패드 시작' : 'Start new pad'}>
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
                : (isKo ? '✏️ 수정할 때마다 72시간이 리셋됩니다' : '✏️ Every edit resets 72 hours')}
            </span>
            <div className={s.editorActions}>
              <button onClick={handleDownload} className={s.toolbarBtn} aria-label={isKo ? '다운로드' : 'Download'}>
                <Download size={15} />
                {isKo ? '저장' : 'Save'}
              </button>
              {!isReadOnly && (
                <button onClick={handleReset} className={s.toolbarBtnDanger} aria-label={isKo ? '패드 초기화' : 'Reset pad'}>
                  <RefreshCw size={15} />
                  {isKo ? '초기화' : 'Reset'}
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
                ? '여기에 자유롭게 입력하세요...\n\n예시:\n- MT 여행 장소: 강원도 춘천\n- 맛집: 닭갈비 골목 (추가하면 +72시간!)\n- 준비물: 침낭, 텐트, 라면\n\n이 패드는 마지막 수정으로부터 72시간 동안 생존합니다.'
                : 'Type anything here...\n\nExamples:\n- Trip destination: Colorado\n- Must-try restaurant (add one = +72 hours!)\n- Packing: sleeping bag, tent, snacks\n\nThis pad survives 72 hours from the last edit.'
            }
            aria-label={isKo ? '폭탄 패드 텍스트 에디터' : 'Bomb pad text editor'}
          />

          {/* Line Reactions */}
          {lines.some((l) => l.trim()) && (
            <div className={s.reactionsSection}>
              <h3 className={s.reactionTitle}>
                {isKo ? '줄별 리액션 투표' : 'Line Reactions'}
              </h3>
              {lines.map((line, idx) => {
                if (!line.trim()) return null;
                return (
                  <div key={idx} className={s.lineReaction}>
                    <span className={s.linePreview}>
                      {line.length > 45 ? line.slice(0, 45) + '…' : line}
                    </span>
                    <div className={s.emojiButtons}>
                      {EMOJI_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(idx, emoji)}
                          className={s.emojiBtn}
                          aria-label={`${emoji} for line ${idx + 1}`}
                        >
                          {emoji}
                          {reactions[idx]?.[emoji] ? (
                            <span className={s.emojiCount}>{reactions[idx][emoji]}</span>
                          ) : null}
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

      {/* Floating share button */}
      <button
        className={s.floatingShare}
        aria-label={isKo ? '링크 복사하여 공유하기' : 'Copy link to share'}
        onClick={handleCopyUrl}
      >
        {urlCopied ? '✅' : '💬'}
        <span className={s.srOnly}>{isKo ? '공유하기' : 'Share'}</span>
      </button>

      <ShareBar
        title={isKo ? '72시간 시한폭탄 패드 — 함께 쓰는 메모장' : '72H Bomb Pad — Collaborative Notepad'}
        description={
          isKo
            ? '마지막 수정으로부터 72시간 동안 살아있는 공유 메모장. 아무도 안 쓰면 폭발합니다!'
            : 'A shared notepad alive 72h from the last edit. Nobody writes = BOOM!'
        }
      />
      <RelatedTools toolId="utilities/productivity/bomb-pad" />

      <SeoSection
        ko={{
          title: '72시간 시한폭탄 패드 — 함께 쓰는 유기체 공유 메모장',
          description:
            '마지막 수정으로부터 72시간 동안만 생존하는 공유 메모장입니다. 누군가 내용을 수정할 때마다 타이머가 72:00:00으로 리셋됩니다. MT 계획, 공동 장보기, 단기 팀 프로젝트에 최적화된 협업 도구입니다.',
          useCases: [
            { icon: '🏕️', title: 'MT/여행 계획', desc: '단톡방 대신 이 패드에 여행 계획을 공유하세요. 맛집 리스트 하나 추가하면 3일 더 살아납니다!' },
            { icon: '🛒', title: '공동 장보기 목록', desc: '여럿이 함께 쓰는 장보기 리스트. 아무도 안 추가하면 패드가 폭발합니다.' },
            { icon: '💡', title: '단기 팀 프로젝트', desc: '짧은 스프린트의 브레인스토밍과 아이디어 공유에 최적입니다.' },
            { icon: '🎯', title: '긴급 회의록', desc: '72시간 안에 결론이 나야 하는 안건 정리에 활용하세요.' },
          ],
          steps: [
            { step: '패드 열기', desc: '이 페이지를 열면 고유 URL이 자동으로 생성됩니다.' },
            { step: '링크 공유', desc: '상단의 URL을 복사해서 카카오톡이나 단톡방에 공유하세요. 같은 링크를 열면 같은 패드!' },
            { step: '같이 작성', desc: '누구든 내용을 수정하면 모든 접속자 화면에 실시간으로 반영됩니다.' },
            { step: '1시간 전 대피', desc: '수명이 1시간 미만으로 떨어지면 다운로드 버튼으로 내용을 저장하세요.' },
          ],
          faqs: [
            { q: '정말 72시간 후엔 복구가 안 되나요?', a: '네, 72시간 동안 아무도 수정하지 않으면 데이터가 완전히 삭제됩니다. 복구는 불가능합니다. 중요한 내용은 미리 다운로드 해두세요.' },
            { q: '수정하면 시간이 얼마나 늘어나나요?', a: '수정할 때마다 남은 시간과 무관하게 72:00:00으로 완전 리셋됩니다. 1분이 남았어도 수정하면 다시 72시간이 됩니다.' },
            { q: '10명이 동시에 써도 안전한가요?', a: 'Supabase Realtime을 통해 다른 기기에서도 실시간 동기화됩니다. 같은 URL을 공유하면 누구나 같은 패드에 접속할 수 있습니다.' },
            { q: '데이터는 어디에 저장되나요?', a: '모든 데이터는 Supabase 데이터베이스에 안전하게 저장됩니다. 72시간이 지나면 자동으로 만료됩니다.' },
          ],
        }}
        en={{
          title: '72H Bomb Pad — A Living Collaborative Shared Notepad',
          description:
            'A shared notepad that only survives 72 hours from the last edit. Every time someone edits it, the timer resets to 72:00:00. Perfect for trip planning, shopping lists, and short team sprints.',
          useCases: [
            { icon: '🏕️', title: 'Trip Planning', desc: 'Share travel plans on this pad instead of group chats. Add one restaurant = 3 more days of life!' },
            { icon: '🛒', title: 'Group Shopping List', desc: 'A shared shopping list for everyone. Nobody adds anything = pad explodes.' },
            { icon: '💡', title: 'Short Team Sprints', desc: 'Perfect for brainstorming and sharing ideas in quick iterations.' },
            { icon: '🎯', title: 'Urgent Meeting Notes', desc: 'Organize agendas that need a conclusion within 72 hours.' },
          ],
          steps: [
            { step: 'Open the pad', desc: 'A unique URL is automatically generated when you open this page.' },
            { step: 'Share the link', desc: 'Copy the URL above and share it via chat. Same link = same pad!' },
            { step: 'Collaborate', desc: 'Any edit by anyone is reflected in real-time on all connected screens.' },
            { step: 'Evacuate before 1 hour', desc: 'When under 1 hour remains, save your content with the download button.' },
          ],
          faqs: [
            { q: "Can't it really be recovered after 72 hours?", a: "Correct — if nobody edits for 72 hours, the data is permanently gone. Recovery is impossible. Download important content beforehand." },
            { q: 'How much time is added when you edit?', a: 'Every edit resets the timer to exactly 72:00:00, regardless of how much was left. Even 1 minute left becomes 72 hours again.' },
            { q: 'Is it safe for 10 people to edit simultaneously?', a: 'Yes — Supabase Realtime syncs changes across all devices in real-time. Anyone with the same URL accesses the same pad.' },
            { q: 'Where is data stored?', a: 'All data is stored securely in Supabase database. It expires automatically after 72 hours of inactivity.' },
          ],
        }}
      />
    </div>
  );
}

// ── Page export (Suspense wrapper required for useSearchParams) ───────────────
export default function BombPadPage() {
  return (
    <Suspense>
      <BombPadContent />
    </Suspense>
  );
}
