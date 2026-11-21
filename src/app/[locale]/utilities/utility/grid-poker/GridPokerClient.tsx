'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { dailySeed, msUntilNextDay } from '@/lib/dailyRandom';
import {
  CELLS, GRADES, HANDS, SIZE, dailyCards, gradeIndex, nextStreak, scoreGrid,
  type Card, type Grid, type Hand, type Streak,
} from '@/lib/gridPoker';
import s from './grid-poker.module.css';
import { ui } from '@/app/components/ui';

// 게임 규칙(카드 뽑기·족보·등급)은 src/lib/gridPoker.ts 에 있다. 여기는 화면과 저장만.

const STREAK_KEY = 'grid-poker_streak';
const NO_STREAK: Streak = { currentStreak: 0, maxStreak: 0, lastPlayedDate: '' };
const PAGE_PATH = '/utilities/utility/grid-poker';

const TXT = {
  ko: {
    title: '데일리 그리드 포커',
    subtitle: '5×5 판에 카드를 한 장씩 놓아 가로·세로 10줄의 포커 족보 점수를 모으세요',
    next: '다음 카드', count: (n: number) => `${n} / 25장`, loading: '오늘의 카드를 준비하는 중…',
    how: '빈칸을 누르면 카드가 놓입니다. 한 번 놓은 카드는 옮길 수 없고, 다음에 나올 카드는 알 수 없습니다.',
    now: '현재 점수', pts: '점', table: '족보 점수표', tableNote: '가로 5줄 + 세로 5줄을 각각 따로 계산합니다. 줄이 다 차면 점수가 붙습니다.',
    grade: '오늘의 등급', toNext: (name: string, n: number) => `${name}까지 ${n}점`, top: '최고 등급입니다!',
    gradeGuide: '등급 기준',
    line: '줄', hand: '족보', score: '점수', row: (i: number) => `가로 ${i}`, col: (i: number) => `세로 ${i}`,
    share: '📤 공유하기', copy: '📋 결과 복사', copied: '✅ 복사됨!',
    nextIn: '다음 카드까지', streak: (n: number) => `🔥 ${n}일 연속 플레이 중!`, first: '🎯 첫 번째 도전!', restart: '🎯 다시 시작 — 1일째',
    best: (n: number) => `🏆 최고 연속 기록: ${n}일`,
    cell: (r: number, c: number) => `${r}행 ${c}열 빈칸`, grid: '5x5 카드 판',
    shareHead: (d: string) => `🃏 오늘의 그리드 포커 (${d})`, rows: '가로', cols: '세로', shareStreak: (n: number) => `🔥 ${n}일 연속`,
  },
  en: {
    title: 'Daily Grid Poker',
    subtitle: 'Place cards one by one on a 5×5 board and score poker hands across 10 rows and columns',
    next: 'Next card', count: (n: number) => `Card ${n} of 25`, loading: "Preparing today's cards…",
    how: 'Tap an empty cell to place the card. A placed card cannot be moved, and you cannot see the cards to come.',
    now: 'Score so far', pts: 'pts', table: 'Hand scores', tableNote: 'The 5 rows and 5 columns are scored separately. A line scores once it is full.',
    grade: "Today's grade", toNext: (name: string, n: number) => `${n} pts to ${name}`, top: 'This is the top grade!',
    gradeGuide: 'Grades',
    line: 'Line', hand: 'Hand', score: 'Score', row: (i: number) => `Row ${i}`, col: (i: number) => `Col ${i}`,
    share: '📤 Share', copy: '📋 Copy result', copied: '✅ Copied!',
    nextIn: 'Next cards in', streak: (n: number) => `🔥 ${n}-day streak!`, first: '🎯 First attempt!', restart: '🎯 Starting over — day 1',
    best: (n: number) => `🏆 Best streak: ${n} days`,
    cell: (r: number, c: number) => `Empty cell, row ${r} column ${c}`, grid: '5x5 card board',
    shareHead: (d: string) => `🃏 Daily Grid Poker (${d})`, rows: 'Rows', cols: 'Cols', shareStreak: (n: number) => `🔥 ${n}-day streak`,
  },
};

/** 저장 형식: 칸마다 "몇 번째 카드가 놓였는지"(없으면 -1). 카드는 날짜로 다시 만들 수 있어 번호만 둔다 */
function loadPlaced(seed: number): number[] | null {
  try {
    const data = JSON.parse(localStorage.getItem(`grid-poker_${seed}`) ?? 'null') as { cells?: unknown } | null;
    const cells = data?.cells;
    if (!Array.isArray(cells) || cells.length !== CELLS) return null;
    const used = cells.filter((n) => n !== -1) as number[];
    // 0번부터 빠짐없이 차례로 놓인 기록만 받는다
    const ok = used.every((n) => Number.isInteger(n) && n >= 0 && n < used.length) && new Set(used).size === used.length;
    return ok ? (cells as number[]) : null;
  } catch { return null; }
}
function loadStreak(): Streak {
  try {
    const d = JSON.parse(localStorage.getItem(STREAK_KEY) ?? 'null') as Partial<Streak> | null;
    return d && typeof d.currentStreak === 'number' && typeof d.maxStreak === 'number' && typeof d.lastPlayedDate === 'string'
      ? { currentStreak: d.currentStreak, maxStreak: d.maxStreak, lastPlayedDate: d.lastPlayedDate } : NO_STREAK;
  } catch { return NO_STREAK; }
}
const save = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장이 막혀 있어도 게임은 계속된다 */ } };

function CardFace({ card }: { card: Card }) {
  return (
    <>
      <span className={s.cardRank}>{card.rank}</span>
      <span className={s.cardSuit}>{card.suit}</span>
    </>
  );
}

export default function GridPokerClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const t = isKo ? TXT.ko : TXT.en;
  const handName = useCallback((h: Hand) => (isKo ? h.ko : h.en), [isKo]);

  // 오늘 날짜(한국 시간)는 브라우저에서만 정한다 — 서버가 미리 만든 화면에는 카드를 넣지 않는다
  const [seed, setSeed] = useState<number | null>(null);
  const [placed, setPlaced] = useState<number[]>(() => Array(CELLS).fill(-1));
  const [streak, setStreak] = useState<Streak>(NO_STREAK);
  const [timeLeft, setTimeLeft] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const start = useCallback(() => {
    const today = dailySeed();
    setSeed(today);
    setPlaced(loadPlaced(today) ?? Array(CELLS).fill(-1));
    setStreak(loadStreak());
  }, []);

  useEffect(() => {
    start();
    setCanShare(typeof navigator.share === 'function');
  }, [start]);

  // 남은 시간. 한국 자정이 지나면 새 카드로 바꾼다
  useEffect(() => {
    if (seed === null) return;
    const tick = () => {
      if (dailySeed() !== seed) { start(); return; }
      const ms = msUntilNextDay();
      const p = (n: number) => String(Math.floor(n)).padStart(2, '0');
      setTimeLeft(`${p(ms / 3600000)}:${p((ms % 3600000) / 60000)}:${p((ms % 60000) / 1000)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [seed, start]);

  const cards = useMemo(() => (seed === null ? [] : dailyCards(seed)), [seed]);
  const grid: Grid = useMemo(() => placed.map((n) => (n >= 0 ? cards[n] ?? null : null)), [placed, cards]);
  const count = placed.filter((n) => n >= 0).length;
  const done = seed !== null && count === CELLS;
  const current = seed !== null && !done ? cards[count] : null;
  const result = useMemo(() => scoreGrid(grid), [grid]);

  const placeCard = (cell: number) => {
    if (seed === null || done || placed[cell] !== -1) return;
    const next = [...placed];
    next[cell] = count;
    setPlaced(next);
    save(`grid-poker_${seed}`, { cells: next });
    if (count + 1 === CELLS) {
      const updated = nextStreak(loadStreak(), seed);
      setStreak(updated);
      save(STREAK_KEY, updated);
    }
  };

  const grade = gradeIndex(result.total);
  const gradeName = (i: number) => `${GRADES[i].emoji} ${isKo ? GRADES[i].ko : GRADES[i].en}`;
  const streakLine = streak.currentStreak >= 2 ? t.streak(streak.currentStreak) : streak.maxStreak >= 2 ? t.restart : t.first;

  const pageUrl = `https://www.theutilhub.com/${locale}${PAGE_PATH}`;
  const shareText = useMemo(() => {
    if (seed === null) return '';
    const emoji = (hs: (Hand | null)[]) => hs.map((h) => h?.emoji ?? '▫️').join('');
    return [
      t.shareHead(`${Math.floor(seed / 100) % 100}/${seed % 100}`),
      `${GRADES[grade].emoji} ${isKo ? GRADES[grade].ko : GRADES[grade].en} · ${result.total}${isKo ? '점' : ' pts'}`,
      `${t.rows} ${emoji(result.rows)}`,
      `${t.cols} ${emoji(result.cols)}`,
      ...(streak.currentStreak >= 2 ? [t.shareStreak(streak.currentStreak)] : []),
    ].join('\n');
  }, [seed, t, grade, isKo, result, streak]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${shareText}\n${pageUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* 복사 권한 없음 */ });
  };
  const handleShare = () => { navigator.share({ text: shareText, url: pageUrl }).catch(() => { /* 사용자가 닫음 */ }); };

  /** 줄 끝의 점수 칸 */
  const badge = (h: Hand | null, label: string) => (
    <div className={`${s.lineBadge} ${h ? (h.score > 0 ? s.lineBadgeOn : s.lineBadgeZero) : ''}`} title={h ? `${label}: ${handName(h)}` : label}>
      {h ? (h.score > 0 ? `+${h.score}` : '0') : ''}
    </div>
  );

  const board = (
    <div className={s.board}>
      <div className={s.grid} role="group" aria-label={t.grid}>
        {Array.from({ length: SIZE }, (_, r) => (
          <div key={r} className={s.gridRow}>
            {Array.from({ length: SIZE }, (_, c) => {
              const idx = r * SIZE + c;
              const card = grid[idx];
              return card ? (
                <div key={idx} className={`${s.cell} ${s.cellFilled} ${card.isRed ? s.cardRed : s.cardBlack}`} aria-label={`${card.rank}${card.suit}`}>
                  <motion.div className={s.cellInner} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <CardFace card={card} />
                  </motion.div>
                </div>
              ) : (
                <button key={idx} type="button" className={`${s.cell} ${s.cellEmpty}`} onClick={() => placeCard(idx)} disabled={seed === null || done} aria-label={t.cell(r + 1, c + 1)} />
              );
            })}
            {badge(result.rows[r], t.row(r + 1))}
          </div>
        ))}
        <div className={s.gridRow}>
          {result.cols.map((h, c) => <div key={c}>{badge(h, t.col(c + 1))}</div>)}
          <div className={s.lineTotal} aria-label={t.now}>{result.total}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Gamepad2 />} title={t.title} subtitle={t.subtitle} />

      <section className={`${ui.card} ${s.fin_panel}`}>
        {/* ── 플레이 ── */}
        {!done && (
          <>
            <div className={s.nextCardArea}>
              <span className={s.nextCardLabel}>{t.next}</span>
              {current ? (
                  <motion.div
                    key={count}
                    className={`${s.nextCard} ${current.isRed ? s.cardRed : s.cardBlack}`}
                    initial={{ scale: 1.4, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <span className={s.nextCardRank}>{current.rank}</span>
                    <span className={s.nextCardSuit}>{current.suit}</span>
                  </motion.div>
                ) : (
                  <div className={`${s.nextCard} ${s.nextCardEmpty}`} aria-hidden="true" />
                )}
              <span className={s.cardCount}>{seed === null ? t.loading : t.count(count + 1)}</span>
            </div>

            {board}

            <p className={s.how}>{t.how}</p>
          </>
        )}

        {/* ── 결과 ── */}
        {done && (
          <motion.div className={s.resultPanel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={s.gradeBox}>
              <div className={s.totalScoreLabel}>{t.grade}</div>
              <div className={s.gradeName}>{gradeName(grade)}</div>
              <div className={s.totalScore}>{result.total}<span className={s.totalScoreUnit}>{t.pts}</span></div>
              <div className={s.totalScoreMax}>
                {grade < GRADES.length - 1 ? t.toNext(gradeName(grade + 1), GRADES[grade + 1].min - result.total) : t.top}
              </div>
            </div>

            <div className={s.streakBadge}>
              <span className={s.streakMain}>{streakLine}</span>
              {streak.maxStreak >= 2 && <span className={s.streakSub}>{t.best(streak.maxStreak)}</span>}
            </div>

            {board}

            <table className={s.handsTable}>
              <thead>
                <tr><th>{t.line}</th><th>{t.hand}</th><th className={s.right}>{t.score}</th></tr>
              </thead>
              <tbody>
                {[...result.rows.map((h, i) => [t.row(i + 1), h] as const), ...result.cols.map((h, i) => [t.col(i + 1), h] as const)].map(([label, h]) => h && (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{h.emoji} {handName(h)}</td>
                    <td className={h.score > 0 ? s.handScore : s.handScoreZero}>{h.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={s.shareRow}>
              {canShare && <button type="button" className={`${ui.button} ${ui.primary} ${ui.lg}`} onClick={handleShare}>{t.share}</button>}
              <button type="button" className={`${ui.button} ${canShare ? '' : ui.primary} ${ui.lg}`} onClick={handleCopy}>{copied ? t.copied : t.copy}</button>
            </div>

            <div className={s.countdown}>
              <div className={s.countdownLabel}>{t.nextIn}</div>
              <div className={s.countdownTimer}>{timeLeft}</div>
            </div>
          </motion.div>
        )}

        {/* ── 족보 점수표·등급 기준 (언제나 볼 수 있게) ── */}
        <details className={s.rules}>
          <summary>{t.table}</summary>
          <p className={s.rulesNote}>{t.tableNote}</p>
          <ul className={s.rulesList}>
            {HANDS.map((h) => (
              <li key={h.id}><span>{h.emoji} {handName(h)}</span><b>{h.score}</b></li>
            ))}
          </ul>
          <p className={s.rulesNote}>{t.gradeGuide}: {GRADES.map((g, i) => `${gradeName(i)} ${g.min}+`).join(' · ')}</p>
        </details>
      </section>

      <ShareBar title={t.title} description={t.subtitle} />
      <RelatedTools toolId="utilities/utility/grid-poker" />
      {seo}
    </div>
  );
}
