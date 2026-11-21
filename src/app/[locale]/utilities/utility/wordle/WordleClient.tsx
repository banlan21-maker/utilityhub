'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Grid3x3 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import {
  WORD_LENGTH, MAX_GUESSES, compose, decompose, evaluate, keyStatuses, dayNumber, answerFor, toTiles,
  emptyStats, recordResult, liveStreak, type Lang, type Stats, type TileStatus,
} from '@/lib/wordle';
import { KO_ANSWERS, KO_VALID } from '@/constants/wordle/ko';
import { EN_ANSWERS } from '@/constants/wordle/en-answers';
import s from './wordle.module.css';
import { ui } from '@/app/components/ui';

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

// 게임 방법 예시 (정답 "생일"로 가정 — 실제 정답과 무관)
const HELP_WORDS = [['학생', 'two'], ['바나나', 'three'], ['과일', 'compound'], ['꽃잎', 'tense']] as const;
const HELP_ANSWER = '생일';
const HELP_GUESSES = ['학생', '생선', '생일'] as const;
const splitBySyllable = (word: string) => [...word].map(ch => decompose(ch));
/** 입력 중인 자모가 완성된 글자 몇 개로 조합되는지 */
const syllableCount = (jamo: string[]) => [...compose(jamo)].filter(ch => /[가-힣]/.test(ch)).length;

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
    ruleKo: '정답은 자모 6칸 = 받침 있는 2글자(예: 학생) 또는 받침 없는 3글자(예: 바나나)',
    ruleEn: '정답은 영어 5글자 단어입니다',
    previewCount: (syl: number, n: number) => ` · ${syl}글자 · 자모 ${n}/6`,
    helpTitle: '게임 방법',
    h1: '1. 정답은 몇 글자? — 자모 6칸 = 2글자 또는 3글자',
    h1p: '오늘의 정답은 자음과 모음을 합쳐 정확히 6개인 단어입니다. 그래서 받침 있는 글자 2개(정답의 약 86%)이거나 받침 없는 글자 3개(약 14%)입니다. 자모는 두벌식 자판에서 누르는 순서대로 한 칸씩 들어갑니다.',
    notes: { two: '받침 있는 글자 2개', three: '받침 없는 글자 3개', compound: '겹모음 ㅘ는 ㅗ+ㅏ 두 칸', tense: '된소리 ㄲ은 한 칸 (⇧+ㄱ)' },
    h2: '2. 입력하는 방법',
    h2list: [
      '화면 자판이나 컴퓨터 키보드로 자모를 하나씩 누릅니다. 컴퓨터에서는 한/영 전환 없이 그대로 쳐도 됩니다.',
      'ㄲ·ㄸ·ㅃ·ㅆ·ㅉ·ㅒ·ㅖ는 ⇧(Shift)를 누른 다음 해당 키를 누릅니다.',
      '판 아래 "입력" 줄에 조합된 글자와 자모 개수(예: 고양 · 2글자 · 자모 4/6)가 보입니다. 6칸을 채우고 [입력]을 누르세요.',
      '단어 목록에 없는 단어는 기회를 쓰지 않고 다시 입력할 수 있습니다.',
    ],
    h3: '3. 색깔 힌트 읽기 (예: 정답이 "생일"일 때)',
    h3p: '단어를 넣으면 칸마다 색이 바뀝니다. 초록은 자리까지 맞음, 노랑은 정답에 있지만 자리가 다름, 회색은 정답에 없음입니다.',
    guessNotes: {
      학생: 'ㅅ·ㅐ·ㅇ은 정답에 있지만 자리가 달라 노랑, ㅎ·ㅏ·ㄱ은 없어서 회색',
      생선: '"생"이 자리까지 맞아 초록. 뒤의 ㅅ은 정답에 ㅅ이 하나뿐이라 회색',
      생일: '6칸 모두 초록 — 정답!',
    } as Record<string, string>,
    h3list: [
      '자판 버튼에도 같은 색이 칠해져 남은 자모를 고르기 쉽습니다.',
      '같은 자모를 두 번 넣으면 정답에 들어 있는 개수만큼만 초록·노랑으로 표시됩니다.',
    ],
    h4: '4. 하루 한 문제',
    h4list: [
      '여섯 번 안에 맞히면 성공이고 연승이 1 늘어납니다. 못 맞히거나 하루를 건너뛰면 연승은 0이 됩니다.',
      '자정(기기 시계 기준)마다 새 문제가 열리고, 한글 판과 English 판은 따로 하루 한 번씩 풀 수 있습니다.',
      '게임이 끝나면 정답의 뜻을 사전에서 보고, 정답이 드러나지 않는 색깔 칸 결과를 복사해 공유할 수 있습니다.',
    ],
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
    ruleKo: 'Answer: a Korean word of exactly 6 jamo — 2 syllables with final consonants (학생) or 3 open syllables (바나나)',
    ruleEn: 'Answer: a five-letter English word',
    previewCount: (syl: number, n: number) => ` · ${syl} syllable${syl === 1 ? '' : 's'} · ${n}/6 jamo`,
    helpTitle: 'How to play',
    h1: '1. How long is the Korean answer? — 6 jamo = 2 or 3 syllables',
    h1p: 'The Korean answer always has exactly six consonants and vowels in total, so it is either two syllables that both end in a consonant (about 86% of answers) or three open syllables (about 14%). Jamo fill the tiles in the order you type them on a 2-set keyboard. The English board is simply a five-letter word.',
    notes: { two: 'two syllables with final consonants', three: 'three open syllables', compound: 'compound vowel ㅘ takes two tiles (ㅗ+ㅏ)', tense: 'tense ㄲ takes one tile (⇧+ㄱ)' },
    h2: '2. Typing',
    h2list: [
      'Use the on-screen keys or your keyboard; on a computer there is no need to switch to Korean input.',
      'For ㄲ ㄸ ㅃ ㅆ ㅉ ㅒ ㅖ press ⇧ (Shift) first.',
      'The "Typing" line under the board shows the composed word and jamo count (e.g. 고양 · 2 syllables · 4/6 jamo). Fill all six and press ENTER.',
      'Words that are not in the list do not use up a try.',
    ],
    h3: '3. Reading the colours (example answer: 생일)',
    h3p: 'Green means the right spot, yellow means in the answer but elsewhere, grey means not in the answer.',
    guessNotes: {
      학생: 'ㅅ, ㅐ and ㅇ are in the answer but elsewhere (yellow); ㅎ, ㅏ, ㄱ are not (grey)',
      생선: '"생" is in the right place (green); the second ㅅ is grey because the answer has only one',
      생일: 'All six green — solved!',
    } as Record<string, string>,
    h3list: [
      'The keyboard keys take the same colours, so you can see which jamo are left.',
      'A repeated jamo is only coloured as many times as it appears in the answer.',
    ],
    h4: '4. One puzzle a day',
    h4list: [
      'Solve it within six tries to add one to your streak; failing or skipping a day resets it.',
      'A new puzzle opens at midnight on your device, separately for the Korean and English boards.',
      'Afterwards, look up the meaning and copy a spoiler-free coloured result to share.',
    ],
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

export default function WordleClient({ seo }: { seo?: React.ReactNode }) {
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

      <ToolHeader compact icon={<Grid3x3 />} title={T.title} subtitle={T.subtitle} />

      <div className={s.game} ref={gameRef}>
        <div className={`${ui.segmented} ${s.tabs}`} role="tablist" aria-label={isKo ? '언어' : 'Language'}>
          {(['ko', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" role="tab" aria-selected={lang === l}
              className={`${ui.segment} ${lang === l ? ui.segmentActive : ''}`} onClick={() => switchLang(l)}>
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

        <p className={s.rule}>{lang === 'ko' ? T.ruleKo : T.ruleEn}</p>

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
          <div className={s.preview}>
            <span>{T.typing}</span>{compose(current) || '—'}
            <small>{T.previewCount(syllableCount(current), current.length)}</small>
          </div>
        )}

        {ready && game.status !== 'playing' ? (
          <button type="button" className={`${ui.button} ${ui.primary}`} onClick={() => setShowResult(true)}>{T.showResult}</button>
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

      <section className={`${ui.card} ${s.help}`} aria-labelledby="wd-help">
        <h2 id="wd-help" className={ui.cardTitle}>{T.helpTitle}</h2>

        <h3 className={s.help_sub}>{T.h1}</h3>
        <p>{T.h1p}</p>
        <div className={s.help_examples}>
          {HELP_WORDS.map(([word, note]) => (
            <div key={word} className={s.help_ex}>
              <div className={s.help_tiles}>
                {splitBySyllable(word).map((syl, i) => (
                  <span key={i} className={s.help_syl}>
                    {syl.map((j, k) => <span key={k} className={`${s.tile} ${s.mini}`}>{j}</span>)}
                  </span>
                ))}
              </div>
              <span className={s.help_word}><b>{word}</b> {T.notes[note]}</span>
            </div>
          ))}
        </div>

        <h3 className={s.help_sub}>{T.h2}</h3>
        <ul className={s.help_list}>{T.h2list.map(x => <li key={x}>{x}</li>)}</ul>

        <h3 className={s.help_sub}>{T.h3}</h3>
        <p>{T.h3p}</p>
        <div className={s.help_examples}>
          {HELP_GUESSES.map(g => (
            <div key={g} className={s.help_ex}>
              <div className={s.help_tiles}>
                {evaluate(decompose(g), decompose(HELP_ANSWER)).map((st, i) => (
                  <span key={i} className={`${s.tile} ${s.mini} ${s[`tile_${st}`]}`} style={{ animation: 'none' }}>{decompose(g)[i]}</span>
                ))}
              </div>
              <span className={s.help_word}><b>{g}</b> {T.guessNotes[g]}</span>
            </div>
          ))}
        </div>
        <ul className={s.help_list}>{T.h3list.map(x => <li key={x}>{x}</li>)}</ul>

        <h3 className={s.help_sub}>{T.h4}</h3>
        <ul className={s.help_list}>{T.h4list.map(x => <li key={x}>{x}</li>)}</ul>
      </section>

      {showResult && game.status !== 'playing' && (
        <div className={s.overlay} onClick={() => setShowResult(false)}>
          <div className={`${ui.card} ${s.modal}`} role="dialog" aria-modal="true" aria-labelledby="wd-result-title" onClick={e => e.stopPropagation()}>
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
              <button type="button" className={`${ui.button} ${ui.primary}`} onClick={share}>{T.share}</button>
              <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => setShowResult(false)} autoFocus>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      <ShareBar title={T.title} description={T.subtitle} />
      <RelatedTools toolId="utilities/utility/wordle" />

      {seo}
    </div>
  );
}
