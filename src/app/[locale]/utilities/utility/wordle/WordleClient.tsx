'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Grid3x3 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import {
  WORD_LENGTH, MAX_GUESSES, compose, evaluate, keyStatuses, dayNumber, answerFor, toTiles,
  emptyStats, recordResult, liveStreak, type Lang, type Stats, type TileStatus,
} from '@/lib/wordle';
import { KO_ANSWERS, KO_VALID } from '@/constants/wordle/ko';
import { EN_ANSWERS } from '@/constants/wordle/en-answers';
import s from './wordle.module.css';

type Status = 'playing' | 'won' | 'lost';
interface Game { day: number; guesses: string[]; status: Status }
interface Store { games: Partial<Record<Lang, Game>>; stats: Record<Lang, Stats> }

const STORAGE_KEY = 'theutilhub-wordle-v2';
const OLD_STORAGE_KEY = 'theutilhub-wordle-storage';
const KO_SET = new Set([...KO_ANSWERS, ...KO_VALID]);
const PAGE_URL = 'https://www.theutilhub.com/{locale}/utilities/utility/wordle';

// 두벌식 자판 (물리 키 위치 → 자모). 한/영 전환 상태와 무관하게 e.code로 읽는다
const KO_CODE: Record<string, [string, string?]> = {
  KeyQ: ['ㅂ', 'ㅃ'], KeyW: ['ㅈ', 'ㅉ'], KeyE: ['ㄷ', 'ㄸ'], KeyR: ['ㄱ', 'ㄲ'], KeyT: ['ㅅ', 'ㅆ'],
  KeyY: ['ㅛ'], KeyU: ['ㅕ'], KeyI: ['ㅑ'], KeyO: ['ㅐ', 'ㅒ'], KeyP: ['ㅔ', 'ㅖ'],
  KeyA: ['ㅁ'], KeyS: ['ㄴ'], KeyD: ['ㅇ'], KeyF: ['ㄹ'], KeyG: ['ㅎ'], KeyH: ['ㅗ'], KeyJ: ['ㅓ'], KeyK: ['ㅏ'], KeyL: ['ㅣ'],
  KeyZ: ['ㅋ'], KeyX: ['ㅌ'], KeyC: ['ㅊ'], KeyV: ['ㅍ'], KeyB: ['ㅠ'], KeyN: ['ㅜ'], KeyM: ['ㅡ'],
};
const KO_ROWS = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['SHIFT', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'BACK'],
];
const EN_ROWS = [
  [...'QWERTYUIOP'],
  [...'ASDFGHJKL'],
  ['ENTER', ...'ZXCVBNM', 'BACK'],
];

const TEXT = {
  ko: {
    title: '일일 단어 퍼즐 (한글 워들)',
    subtitle: '하루 한 문제, 여섯 번 안에 오늘의 단어를 맞혀 보세요. 한글은 자음·모음 6칸, 영어는 5글자입니다.',
    tabKo: ['한글', '자모 6칸'], tabEn: ['English', '5글자'],
    puzzle: (d: number) => `${d}번 문제`, streak: '연승', winRate: '승률',
    typing: '입력', enter: '입력', back: '지우기',
    short: (n: number) => (n === 6 ? '자모 6개를 모두 입력하세요' : '5글자를 모두 입력하세요'),
    notWord: '단어 목록에 없는 단어예요',
    loading: '단어 목록을 불러오는 중이에요',
    kbHintKo: '컴퓨터에서는 한/영 전환 없이 키보드로 바로 입력됩니다. 된소리·ㅒ·ㅖ는 Shift(⇧)와 함께 누르세요.',
    kbHintEn: 'Type with the keyboard or the keys below.',
    showResult: '결과 보기',
    won: ['천재!', '훌륭해요!', '멋져요!', '잘했어요!', '좋아요!', '휴, 아슬아슬!'],
    lost: '아쉬워요, 내일 다시 도전!',
    answerIs: '오늘의 정답',
    meaning: '표준국어대사전에서 뜻 보기 ↗',
    played: '플레이', rate: '승률', cur: '현재 연승', max: '최대 연승',
    dist: '맞힌 횟수 분포', next: '다음 문제까지',
    share: '결과 복사', close: '닫기', copied: '결과를 복사했어요. 붙여 넣어 공유하세요!', copyFail: '복사하지 못했어요',
    shareHead: (d: number, lang: Lang, t: string) => `일일 단어 퍼즐 ${d}번 (${lang === 'ko' ? '한글' : '영어'}) ${t}/6`,
    helpTitle: '게임 방법',
    help1: '여섯 번 안에 오늘의 단어를 맞히면 됩니다. 단어를 넣으면 칸 색깔로 힌트가 나옵니다.',
    help2: '초록 = 자리까지 맞음 · 노랑 = 단어에 있지만 자리가 다름 · 회색 = 단어에 없음',
    help3: '한글은 두벌식 자판으로 누르는 순서대로 자모 6칸입니다. 겹모음 ㅘ는 ㅗ+ㅏ 두 칸, 된소리 ㄲ은 한 칸입니다.',
    exampleLabel: '예: 과일 →',
  },
  en: {
    title: 'Daily Word Puzzle',
    subtitle: 'One puzzle a day: guess the word in six tries. Korean uses 6 jamo tiles, English uses 5 letters.',
    tabKo: ['한글', '6 jamo'], tabEn: ['English', '5 letters'],
    puzzle: (d: number) => `Puzzle #${d}`, streak: 'Streak', winRate: 'Win rate',
    typing: 'Typing', enter: 'ENTER', back: 'Delete',
    short: (n: number) => (n === 6 ? 'Enter all 6 jamo' : 'Not enough letters'),
    notWord: 'Not in word list',
    loading: 'Loading word list…',
    kbHintKo: 'On a computer, just type on the keyboard — no need to switch to Korean input. Use Shift for ㄲ ㄸ ㅃ ㅆ ㅉ ㅒ ㅖ.',
    kbHintEn: 'Type with the keyboard or the keys below.',
    showResult: 'Show result',
    won: ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'],
    lost: 'So close — try again tomorrow!',
    answerIs: "Today's answer",
    meaning: 'Look it up ↗',
    played: 'Played', rate: 'Win %', cur: 'Streak', max: 'Max streak',
    dist: 'Guess distribution', next: 'Next puzzle in',
    share: 'Copy result', close: 'Close', copied: 'Result copied — paste it to share!', copyFail: 'Could not copy',
    shareHead: (d: number, lang: Lang, t: string) => `Daily Word Puzzle #${d} (${lang === 'ko' ? 'Korean' : 'English'}) ${t}/6`,
    helpTitle: 'How to play',
    help1: 'Guess today’s word in six tries. After each guess the tiles change colour.',
    help2: 'Green = right spot · Yellow = in the word, wrong spot · Grey = not in the word',
    help3: 'Korean words are split into the jamo you type on a 2-set keyboard: 6 tiles. A compound vowel like ㅘ takes two tiles (ㅗ+ㅏ); ㄲ takes one.',
    exampleLabel: 'e.g. 과일 →',
  },
} as const;

const loadStore = (): Store => {
  const fresh: Store = { games: {}, stats: { ko: emptyStats(), en: emptyStats() } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Store;
      return { games: data.games ?? {}, stats: { ko: { ...emptyStats(), ...data.stats?.ko }, en: { ...emptyStats(), ...data.stats?.en } } };
    }
    // 이전 버전 기록(언어 구분 없음)은 한글 기록으로 옮긴다
    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) ?? 'null');
    if (old?.stats) {
      fresh.stats.ko = { ...emptyStats(), played: old.stats.gamesPlayed ?? 0, won: old.stats.gamesWon ?? 0, maxStreak: old.stats.maxStreak ?? 0 };
    }
  } catch { /* 저장소를 쓸 수 없으면 새로 시작 */ }
  return fresh;
};

const saveStore = (store: Store) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* 비공개 모드 등 */ }
};

const untilMidnight = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const sec = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  return [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map(n => String(n).padStart(2, '0')).join(':');
};

export default function WordleClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const T = isKo ? TEXT.ko : TEXT.en;

  const [lang, setLang] = useState<Lang>(isKo ? 'ko' : 'en');
  const [ready, setReady] = useState(false);
  const [day, setDay] = useState(0);
  const [store, setStore] = useState<Store>({ games: {}, stats: { ko: emptyStats(), en: emptyStats() } });
  const [current, setCurrent] = useState<string[]>([]);
  const [shift, setShift] = useState(false);
  const [toast, setToast] = useState('');
  const [shake, setShake] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [enValid, setEnValid] = useState<Set<string> | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const length = WORD_LENGTH[lang];
  const answerWord = day ? answerFor(day, lang === 'ko' ? KO_ANSWERS : EN_ANSWERS) : '';
  const answer = answerWord ? toTiles(lang, answerWord) : [];
  const game: Game = store.games[lang]?.day === day ? store.games[lang]! : { day, guesses: [], status: 'playing' };
  const guessTiles = game.guesses.map(g => toTiles(lang, g));
  const stats = store.stats[lang];
  const keys = answer.length ? keyStatuses(guessTiles, answer) : {};
  const playing = ready && game.status === 'playing';

  // 저장된 기록은 브라우저에서만 읽는다 (서버 HTML에는 빈 판이 들어간다)
  useEffect(() => {
    setStore(loadStore());
    setDay(dayNumber());
    setReady(true);
  }, []);

  // 자정이 지나면 새 문제로 넘어간다
  useEffect(() => {
    const tick = () => {
      setCountdown(untilMidnight());
      const now = dayNumber();
      setDay(prev => (prev && prev !== now ? now : prev));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // 날짜가 바뀌면 입력 중이던 줄은 비운다
  useEffect(() => { setCurrent([]); }, [day]);

  // 영어 입력 허용 목록(약 35KB)은 영어 판을 열 때만 받는다
  useEffect(() => {
    if (lang !== 'en' || enValid) return;
    let alive = true;
    import('@/constants/wordle/en-valid').then(m => { if (alive) setEnValid(new Set([...m.EN_VALID, ...EN_ANSWERS])); });
    return () => { alive = false; };
  }, [lang, enValid]);

  const flash = useCallback((msg: string, doShake = false) => {
    setToast(msg);
    if (doShake) { setShake(true); setTimeout(() => setShake(false), 450); }
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1600);
  }, []);

  const submit = useCallback(() => {
    if (!playing) return;
    if (current.length < length) { flash(T.short(length), true); return; }
    let word: string;
    if (lang === 'ko') {
      word = compose(current);
      if (!KO_SET.has(word)) { flash(T.notWord, true); return; }
    } else {
      if (!enValid) { flash(T.loading); return; }
      word = current.join('');
      if (!enValid.has(word.toLowerCase())) { flash(T.notWord, true); return; }
    }
    const guesses = [...game.guesses, word];
    const won = current.join('') === answer.join('');
    const status: Status = won ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing';
    const nextStats = status === 'playing' ? stats : recordResult(stats, day, won, guesses.length);
    const next: Store = { games: { ...store.games, [lang]: { day, guesses, status } }, stats: { ...store.stats, [lang]: nextStats } };
    setStore(next);
    saveStore(next);
    setCurrent([]);
    if (status !== 'playing') setTimeout(() => setShowResult(true), length * 120 + 600);
  }, [playing, current, length, lang, enValid, game.guesses, answer, stats, day, store, flash, T]);

  const typeKey = useCallback((k: string) => {
    if (!playing) return;
    if (k === 'ENTER') { submit(); return; }
    if (k === 'BACK') { setCurrent(c => c.slice(0, -1)); return; }
    setCurrent(c => (c.length < length ? [...c, k] : c));
  }, [playing, submit, length]);

  // 물리 키보드
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement;
      // 게임 밖의 입력창·버튼(FAQ 등)에 초점이 있으면 건드리지 않는다
      if (el && el !== document.body && !gameRef.current?.contains(el)) return;
      if (e.key === 'Enter') { e.preventDefault(); typeKey('ENTER'); return; }
      if (e.key === 'Backspace') { e.preventDefault(); typeKey('BACK'); return; }
      if (!e.code.startsWith('Key')) return;
      if (lang === 'ko') {
        const m = KO_CODE[e.code];
        if (!m) return;
        e.preventDefault();
        typeKey(e.shiftKey && m[1] ? m[1] : m[0]);
      } else {
        e.preventDefault();
        typeKey(e.code.slice(3));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lang, typeKey]);

  // 결과 창: Esc로 닫기
  useEffect(() => {
    if (!showResult) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowResult(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showResult]);

  const switchLang = (l: Lang) => {
    if (l === lang) return;
    setLang(l);
    setCurrent([]);
    setShift(false);
    setShowResult(false);
  };

  const share = async () => {
    const grid = guessTiles.map(g => evaluate(g, answer).map(st => (st === 'correct' ? '🟩' : st === 'present' ? '🟨' : '⬜')).join('')).join('\n');
    const tries = game.status === 'won' ? String(game.guesses.length) : 'X';
    const text = `${T.shareHead(day, lang, tries)}\n\n${grid}\n\n${PAGE_URL.replace('{locale}', locale)}`;
    try { await navigator.clipboard.writeText(text); flash(T.copied); } catch { flash(T.copyFail); }
  };

  const tileClass = (st?: TileStatus, filled?: boolean) =>
    `${s.tile} ${st ? s[`tile_${st}`] : filled ? s.tile_filled : ''}`;

  const renderKey = (code: string) => {
    if (code === 'SHIFT') {
      return (
        <button key={code} type="button" className={`${s.key} ${s.key_wide} ${shift ? s.key_shift_on : ''}`}
          aria-pressed={shift} aria-label="Shift" disabled={!playing} onClick={() => setShift(v => !v)}>⇧</button>
      );
    }
    if (code === 'BACK') {
      return <button key={code} type="button" className={`${s.key} ${s.key_wide}`} aria-label={T.back} disabled={!playing} onClick={() => typeKey('BACK')}>⌫</button>;
    }
    if (code === 'ENTER') {
      return <button key={code} type="button" className={`${s.key} ${s.key_wide}`} disabled={!playing} onClick={() => typeKey('ENTER')}>{T.enter}</button>;
    }
    const label = lang === 'ko' ? (shift && KO_CODE[code][1] ? KO_CODE[code][1]! : KO_CODE[code][0]) : code;
    const st = keys[label];
    return (
      <button key={code} type="button" className={`${s.key} ${st ? s[`key_${st}`] : ''}`} disabled={!playing}
        onClick={() => { typeKey(label); if (shift) setShift(false); }}>
        {label}
      </button>
    );
  };

  const winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const streakNow = day ? liveStreak(stats, day) : 0;
  const maxDist = Math.max(1, ...stats.dist);
  const dictUrl = lang === 'ko'
    ? `https://stdict.korean.go.kr/search/searchResult.do?searchKeyword=${encodeURIComponent(answerWord)}`
    : `https://en.wiktionary.org/wiki/${answerWord}`;

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><Grid3x3 size={40} /></div>
        <h1 className={s.title}>{T.title}</h1>
        <p className={s.subtitle}>{T.subtitle}</p>
      </header>

      <div className={s.game} ref={gameRef}>
        <div className={s.tabs} role="tablist" aria-label={isKo ? '언어' : 'Language'}>
          {(['ko', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" role="tab" aria-selected={lang === l}
              className={`${s.tab} ${lang === l ? s.tab_active : ''}`} onClick={() => switchLang(l)}>
              {(l === 'ko' ? T.tabKo : T.tabEn)[0]}<small>{(l === 'ko' ? T.tabKo : T.tabEn)[1]}</small>
            </button>
          ))}
        </div>

        <div className={s.meta} aria-live="polite">
          {ready && <span><strong>{T.puzzle(day)}</strong></span>}
          <span>{T.streak} <strong>{streakNow}</strong></span>
          <span>{T.winRate} <strong>{winRate}%</strong></span>
        </div>

        {toast && <div className={s.toast} role="status">{toast}</div>}

        <div className={s.board} role="grid" aria-label={isKo ? '단어 판' : 'Word board'}>
          {Array.from({ length: MAX_GUESSES }, (_, r) => {
            const done = guessTiles[r];
            const isCurrent = r === game.guesses.length && game.status === 'playing';
            const tiles = done ?? (isCurrent ? current : []);
            const result = done ? evaluate(done, answer) : null;
            return (
              <div key={r} className={`${s.row} ${isCurrent && shake ? s.shake : ''}`} role="row">
                <div className={`${s.tiles} ${lang === 'ko' ? s.tiles_ko : s.tiles_en}`}>
                  {Array.from({ length }, (_, c) => (
                    <div key={c} role="gridcell" className={tileClass(result?.[c], !!tiles[c])}
                      style={result ? { animationDelay: `${c * 0.12}s` } : undefined}
                      aria-label={tiles[c] ? `${tiles[c]}${result ? ` ${result[c]}` : ''}` : undefined}>
                      {tiles[c] ?? ''}
                    </div>
                  ))}
                </div>
                {lang === 'ko' && done && <span className={s.row_word}>{game.guesses[r]}</span>}
              </div>
            );
          })}
        </div>

        {lang === 'ko' && game.status === 'playing' && (
          <div className={s.preview}><span>{T.typing}</span>{compose(current)}</div>
        )}

        {ready && game.status !== 'playing' ? (
          <button type="button" className={s.result_btn} onClick={() => setShowResult(true)}>{T.showResult}</button>
        ) : (
          <div className={s.keyboard}>
            {(lang === 'ko' ? KO_ROWS : EN_ROWS).map((row, i) => (
              <div key={i} className={s.krow}>{row.map(renderKey)}</div>
            ))}
            {lang === 'ko' && (
              <div className={s.krow}>
                <button type="button" className={`${s.key} ${s.key_enter}`} disabled={!playing} onClick={() => typeKey('ENTER')}>{T.enter}</button>
              </div>
            )}
          </div>
        )}
        <p className={s.kb_hint}>{lang === 'ko' ? T.kbHintKo : T.kbHintEn}</p>
      </div>

      <details className={s.help}>
        <summary>{T.helpTitle}</summary>
        <p>{T.help1}</p>
        <p>{T.help2}</p>
        <p>{T.help3}</p>
        <div className={s.help_row}>
          <span>{T.exampleLabel}</span>
          {['ㄱ', 'ㅗ', 'ㅏ', 'ㅇ', 'ㅣ', 'ㄹ'].map((j, i) => (
            <span key={i} className={`${s.tile} ${s.mini} ${i === 0 ? s.tile_correct : i === 3 ? s.tile_present : ''}`}>{j}</span>
          ))}
        </div>
      </details>

      {showResult && game.status !== 'playing' && (
        <div className={s.overlay} onClick={() => setShowResult(false)}>
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="wd-result-title" onClick={e => e.stopPropagation()}>
            <h2 id="wd-result-title">{game.status === 'won' ? T.won[game.guesses.length - 1] : T.lost}</h2>
            <div className={s.answer}>
              {T.answerIs}
              <strong>{answerWord.toUpperCase()}</strong>
              <a href={dictUrl} target="_blank" rel="noopener noreferrer">{T.meaning}</a>
            </div>
            <div className={s.stat_grid}>
              {[[stats.played, T.played], [`${winRate}%`, T.rate], [streakNow, T.cur], [stats.maxStreak, T.max]].map(([n, l]) => (
                <div key={String(l)}><div className={s.stat_num}>{n}</div><div className={s.stat_label}>{l}</div></div>
              ))}
            </div>
            <div className={s.dist}>
              <div className={s.dist_title}>{T.dist}</div>
              {stats.dist.map((n, i) => (
                <div key={i} className={s.dist_row}>
                  <span>{i + 1}</span>
                  <div className={`${s.dist_bar} ${game.status === 'won' && game.guesses.length === i + 1 ? s.dist_bar_now : ''}`}
                    style={{ width: `${Math.max(8, (n / maxDist) * 100)}%` }}>{n}</div>
                </div>
              ))}
            </div>
            <div className={s.countdown}>{T.next}<strong>{countdown}</strong></div>
            <div className={s.modal_actions}>
              <button type="button" className={s.btn_primary} onClick={share}>{T.share}</button>
              <button type="button" className={s.btn_ghost} onClick={() => setShowResult(false)} autoFocus>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      <ShareBar title={T.title} description={T.subtitle} />
      <RelatedTools toolId="utilities/utility/wordle" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '일일 단어 퍼즐: 자모로 맞히는 한글 워들',
          description: '일일 단어 퍼즐은 하루에 한 번, 모든 사람에게 같은 단어가 나오는 워들(Wordle) 방식의 단어 맞히기 게임입니다. 한글 판은 단어를 두벌식 자판에서 누르는 순서대로 자음과 모음으로 풀어 6칸에 맞춥니다. 예를 들어 "학생"은 ㅎ·ㅏ·ㄱ·ㅅ·ㅐ·ㅇ, "과일"은 겹모음 ㅘ를 ㅗ와 ㅏ로 나눠 ㄱ·ㅗ·ㅏ·ㅇ·ㅣ·ㄹ이 됩니다. 글자(음절) 단위로 비교하면 한 칸에 올 수 있는 글자가 1만 개가 넘어 힌트가 거의 나오지 않지만, 자모로 나누면 자음과 모음의 위치를 하나씩 좁혀 가며 여섯 번 안에 추리로 정답에 다가갈 수 있습니다. 정답은 국립국어원 「한국어 학습용 어휘 목록」의 1·2단계 명사 가운데 자모가 6개인 388개 단어에서 나오고, 입력할 수 있는 단어는 약 1,500개입니다. 목록에 없는 단어를 넣으면 기회를 쓰지 않고 다시 입력하게 합니다. 영어 판은 원조 워들처럼 알파벳 5글자이며 약 6,400개의 영어 단어를 입력할 수 있습니다. 기기 시계 기준 자정마다 새 문제가 열리고, 한글·영어 판의 진행 상황과 연승·승률·맞힌 횟수 분포는 브라우저에 따로 저장됩니다. 결과는 정답이 드러나지 않는 색깔 칸으로 복사해 친구에게 보낼 수 있습니다.',
          useCases: [
            { icon: '☕', title: '하루 5분 두뇌 운동', desc: '출근길이나 점심시간에 하루 한 문제만 풀면 됩니다. 자음과 모음의 자리를 따져 보는 추리라 단순 암기보다 집중력과 어휘 감각을 함께 씁니다.' },
            { icon: '👨‍👩‍👧', title: '가족·친구와 같은 문제 겨루기', desc: '모든 사람이 같은 날 같은 단어를 풀기 때문에, 결과 복사로 🟩🟨⬜ 칸을 단톡방에 올려 누가 더 적은 횟수로 맞혔는지 정답을 드러내지 않고 비교할 수 있습니다.' },
            { icon: '📚', title: '한국어 학습', desc: '정답은 국립국어원이 한국어 학습자용으로 고른 기초 어휘라 받침과 겹모음 구조를 익히기 좋고, 게임이 끝나면 표준국어대사전 뜻풀이로 바로 이동할 수 있습니다.' },
            { icon: '🔤', title: '영어 단어 연습', desc: 'English 탭에서는 원조 워들처럼 다섯 글자 영어 단어를 맞힙니다. 영어 단어를 공부하는 학생이 철자 감각과 자주 쓰는 단어를 익히는 연습용으로 쓸 수 있습니다.' },
          ],
          steps: [
            { step: '언어 고르기', desc: '한글(자모 6칸) 또는 English(5글자)를 고릅니다. 두 판은 따로 진행되며 하루에 각각 한 번씩 풀 수 있고, 언어를 바꿔도 풀던 판은 그대로 남습니다.' },
            { step: '단어 입력', desc: '화면 자판이나 컴퓨터 키보드로 입력합니다. 한글은 한/영 전환 없이 키보드 자리 그대로 누르면 자모가 들어가고, 된소리와 ㅒ·ㅖ는 Shift(⇧)를 함께 누릅니다.' },
            { step: '색깔 힌트 읽기', desc: '초록은 자리까지 맞은 칸, 노랑은 단어에 있지만 자리가 다른 칸, 회색은 단어에 없는 자모입니다. 자판에도 같은 색이 표시되어 남은 자모를 고르기 쉽습니다.' },
            { step: '결과 확인·공유', desc: '여섯 번 안에 맞히면 연승이 쌓이고, 결과 창에서 정답의 뜻을 확인하거나 색깔 칸 결과를 복사해 공유합니다. 다음 문제까지 남은 시간도 표시됩니다.' },
          ],
          faqs: [
            { q: '한글은 왜 글자가 아니라 자모로 맞히나요?', a: '글자 단위로 비교하면 한 칸에 들어갈 수 있는 글자가 1만 개가 넘어 노란색·초록색 힌트가 거의 나오지 않고, 사실상 운으로 맞히게 됩니다. 자모로 나누면 자음 19개와 모음 몇 개 안에서 위치를 추리하게 되어 원조 워들처럼 여섯 번 안에 풀 수 있는 난이도가 됩니다.' },
            { q: '겹모음과 받침은 칸을 어떻게 나누나요?', a: '두벌식 자판에서 누르는 순서 그대로입니다. ㅘ·ㅝ·ㅢ 같은 겹모음은 ㅗ+ㅏ처럼 두 칸, ㄺ·ㄳ 같은 겹받침도 두 칸이고, ㄲ·ㅆ 같은 된소리와 ㅐ·ㅔ는 키 하나라서 한 칸입니다. 그래서 "과일"은 ㄱ·ㅗ·ㅏ·ㅇ·ㅣ·ㄹ 여섯 칸입니다.' },
            { q: '입력한 단어가 목록에 없다고 나와요.', a: '입력할 수 있는 한글 단어는 국립국어원 학습용 어휘와 보충 단어 가운데 자모가 정확히 6개인 약 1,500개입니다. "사과"(ㅅㅏㄱㅗㅏ, 5칸)처럼 자모 수가 6개가 아닌 단어는 넣을 수 없습니다. 목록에 없는 단어는 기회를 쓰지 않으니 다른 단어로 다시 시도해 보세요.' },
            { q: '새 문제는 언제 나오고, 연승은 어떻게 세나요?', a: '기기 시계 기준 자정마다 새 문제가 열립니다. 문제를 맞히면 연승이 1 늘고, 하루를 건너뛰거나 여섯 번 안에 맞히지 못하면 연승은 0이 되지만 최대 연승과 맞힌 횟수 분포는 남습니다. 기록은 이 기기의 브라우저에만 저장되며 서버로 보내지 않습니다.' },
          ],
        }}
        en={{
          title: 'Daily Word Puzzle: Wordle in Korean and English',
          description: 'The Daily Word Puzzle is a free Wordle-style game: everyone gets the same word each day and has six tries to find it. The English board uses five letters and accepts about 6,400 English words, with answers drawn from roughly 840 common words. The Korean board works differently from a simple syllable match: each word is split into the jamo you press on a standard 2-set Korean keyboard, giving six tiles. "학생" becomes ㅎ·ㅏ·ㄱ·ㅅ·ㅐ·ㅇ, and "과일" splits its compound vowel ㅘ into ㅗ and ㅏ. Comparing whole syllables gives almost no hints because there are more than 11,000 possible syllables, while jamo tiles let you narrow down consonants and vowels one by one. Korean answers are 388 everyday nouns from the National Institute of Korean Language learner vocabulary list. A new puzzle opens at midnight on your device, words that are not in the list do not use up a try, and your progress, streak, win rate and guess distribution are stored separately for each language in your browser. Share your result as coloured squares without spoiling the answer.',
          useCases: [
            { icon: '☕', title: 'A Five-Minute Daily Habit', desc: 'Solve one puzzle on your commute or lunch break and keep your streak alive; it exercises deduction and vocabulary rather than memorisation.' },
            { icon: '👨‍👩‍👧', title: 'Compete with Friends', desc: 'Everyone gets the same word each day, so you can post your coloured squares in a group chat and compare tries without revealing the answer.' },
            { icon: '📚', title: 'Learn Korean', desc: 'Korean answers come from a basic learner vocabulary list, which makes the jamo board good practice for final consonants and compound vowels.' },
            { icon: '🔤', title: 'English Spelling Practice', desc: 'The English board plays like the original Wordle and suits students building spelling instincts with common five-letter words.' },
          ],
          steps: [
            { step: 'Pick a Board', desc: 'Choose 한글 (6 jamo) or English (5 letters). Each board has its own daily puzzle and keeps its progress when you switch.' },
            { step: 'Type a Word', desc: 'Use the on-screen keys or your keyboard. For Korean you can type on the physical key positions without switching input; hold Shift for ㄲ ㄸ ㅃ ㅆ ㅉ ㅒ ㅖ.' },
            { step: 'Read the Colours', desc: 'Green is the right spot, yellow is in the word but elsewhere, and grey is not in the word. The keyboard shows the same colours.' },
            { step: 'Share Your Result', desc: 'Solve it within six tries to build your streak, look up the answer in a dictionary and copy your coloured result to share.' },
          ],
          faqs: [
            { q: 'Why does the Korean board use jamo instead of syllables?', a: 'With more than 11,000 possible syllables, a syllable-by-syllable match almost never gives a yellow or green hint. Splitting words into jamo means you work with 19 consonants and a handful of vowels, which makes six tries a fair challenge.' },
            { q: 'How are compound vowels and final consonants counted?', a: 'Exactly as you type them on a 2-set keyboard: compound vowels like ㅘ and double finals like ㄺ take two tiles, while tense consonants like ㄲ and vowels like ㅐ are one key and one tile.' },
            { q: 'Why is my word "not in word list"?', a: 'The Korean board accepts about 1,500 words with exactly six jamo, and the English board about 6,400 five-letter words. Words outside the list do not use up a try, so just enter another word.' },
            { q: 'When does a new puzzle appear?', a: 'At midnight on your device clock. Solving it adds one to your streak; skipping a day or failing resets it to zero, but your best streak and guess distribution stay in your browser.' },
          ],
        }}
      />
    </div>
  );
}
