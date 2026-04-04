'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Grid3x3 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';

// 한국어 3글자 단어 데이터 (테마별 100개, 안전장치로 3글자만 허용)
const KOREAN_WORDS = [
  // 자연 및 식물
  '무지개', '소나무', '대나무', '보름달', '초승달',
  '민들레', '진달래', '개나리', '할미꽃', '무궁화',
  '봉선화', '백합꽃', '장미꽃', '국화꽃', '해오라기',
  // 동물 및 곤충
  '강아지', '고양이', '호랑이', '코끼리', '다람쥐',
  '너구리', '송아지', '망아지', '기러기', '거북이',
  '가오리', '송사리', '오징어', '고등어', '갈매기',
  '독수리', '앵무새', '꾀꼬리', '사마귀', '메뚜기',
  '개구리', '두꺼비',
  // 음식 및 채소
  '복숭아', '옥수수', '고구마', '도라지', '미나리',
  '고사리', '비빔밥', '미역국', '된장국', '삼계탕',
  '설렁탕', '갈비탕', '비빔면', '깍두기',
  // 사물 및 가전
  '지우개', '주전자', '바구니', '돋보기', '계산기',
  '컴퓨터', '모니터', '키보드', '라디오', '카메라',
  '정수기', '냉장고', '세탁기', '청소기', '선풍기',
  '다리미', '가습기', '손전등', '손거울', '빗자루',
  '일기장', '연습장', '그림책', '물감통', '크레용',
  '장난감', '안경테', '귀걸이', '목걸이',
  // 장소 및 이동수단
  '운동장', '수영장', '정류장', '놀이터', '도서관',
  '영화관', '박물관', '미술관', '백화점', '편의점',
  '비행기', '자동차', '자전거', '유모차', '소방차',
  '구급차',
  // 직업 및 관념
  '소방관', '경찰관', '요리사', '변호사',
].filter(w => w.length === 3); // 안전장치: 3글자만 허용 (해오라기 등 4글자 자동 제외)

// 영어 5글자 단어 데이터 (100개 이상)
const ENGLISH_WORDS = [
  'APPLE', 'BREAD', 'CHAIR', 'DANCE', 'EAGLE',
  'FANCY', 'GHOST', 'HAPPY', 'IMAGE', 'JUICE',
  'KNIFE', 'LEMON', 'MAGIC', 'NIGHT', 'OCEAN',
  'PEACE', 'QUEEN', 'RADIO', 'SMILE', 'TIGER',
  'UNCLE', 'VOICE', 'WATER', 'YOUTH', 'ZEBRA',
  'ABOUT', 'BEACH', 'CLOUD', 'DREAM', 'EARTH',
  'FLAME', 'GRACE', 'HEART', 'IDEAL', 'JEWEL',
  'KIOSK', 'LIGHT', 'MATCH', 'NOBLE', 'ORBIT',
  'PANEL', 'QUEST', 'RIVER', 'STONE', 'TRUTH',
  'UNITY', 'VALUE', 'WORLD', 'XENON', 'YIELD',
  'ABUSE', 'BRAVE', 'CRIME', 'DEPTH', 'ELITE',
  'FAITH', 'GLOBE', 'HONOR', 'INDEX', 'JOINT',
  'KARMA', 'LOGIC', 'METAL', 'NERVE', 'ORBIT',
  'PRIDE', 'QUIRK', 'REALM', 'SHOCK', 'THEME',
  'URBAN', 'VITAL', 'WASTE', 'XENON', 'YACHT',
  'ADAPT', 'BATCH', 'CRISP', 'DEVIL', 'EVOKE',
  'FLARE', 'GRAIN', 'HOTEL', 'INPUT', 'JUDGE',
  'KNIGHT', 'LABEL', 'MOUNT', 'NURSE', 'OCCUR',
  'PLANT', 'QUOTA', 'RANCH', 'SCALE', 'TRADE',
  'UPSET', 'VAULT', 'WHEAT', 'XEROX', 'YEARN',
  'ABIDE', 'BOUND', 'CRAFT', 'DWELL', 'EQUIP',
  'FORGE', 'GRANT', 'HASTE', 'INFER', 'JOUST',
  'KNEAD', 'LEASE', 'MIRTH', 'NOTCH', 'OPTIC',
  'PLUME', 'QUELL', 'ROAST', 'SWIFT', 'TRIAL',
  'UNIFY', 'VIGOR', 'WRECK', 'XYLEM', 'YODEL',
];

type GameStatus = 'playing' | 'won' | 'lost';
type TileStatus = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

interface GameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: GameStatus;
  lastPlayedDate: string;
}

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastWinDate: string;
}

const STORAGE_KEY = 'theutilhub-wordle-storage';
const BASE_DATE = new Date('2026-01-01');

// 정확한 Wordle 매칭 로직 (동일 글자 중복 처리)
const evaluateGuess = (guess: string, answer: string): TileStatus[] => {
  const result: TileStatus[] = Array(guess.length).fill('absent');
  const answerChars = answer.split('');
  
  // 1차 패스: 정확한 위치(correct) 확인
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answerChars[i]) {
      result[i] = 'correct';
      answerChars[i] = ''; // 사용됨 표시
    }
  }
  
  // 2차 패스: 포함(present) 확인
  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== 'correct' && answerChars.includes(guess[i])) {
      result[i] = 'present';
      answerChars[answerChars.indexOf(guess[i])] = ''; // 사용됨 표시
    }
  }
  
  return result;
};

export default function WordlePage() {
  const locale = useLocale();
  const isKorean = locale === 'ko';

  const [currentLanguage, setCurrentLanguage] = useState<'ko' | 'en'>('ko');
  const maxLength = currentLanguage === 'ko' ? 3 : 5;
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    lastPlayedDate: '',
  });
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastWinDate: '',
  });
  const [showStats, setShowStats] = useState(false);
  const [showInvalidWord, setShowInvalidWord] = useState(false);
  const [shake, setShake] = useState(false);

  // 오늘의 단어 인덱스 계산
  const getTodayIndex = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - BASE_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // 오늘의 정답 가져오기
  const getTodayAnswer = useCallback(() => {
    const index = getTodayIndex();
    const words = currentLanguage === 'ko' ? KOREAN_WORDS : ENGLISH_WORDS;
    return words[index % words.length];
  }, [currentLanguage, getTodayIndex]);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // localStorage 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStats(data.stats || stats);

        const todayDate = getTodayDateString();
        if (data.gameState && data.gameState.lastPlayedDate === todayDate && data.gameState.language === currentLanguage) {
          setGameState(data.gameState);
        } else {
          // 새로운 날이면 게임 상태 초기화
          setGameState({
            guesses: [],
            currentGuess: '',
            gameStatus: 'playing',
            lastPlayedDate: todayDate,
          });
        }
      } catch (e) {
        console.error('Failed to load game state:', e);
      }
    }
  }, [currentLanguage]);

  // 게임 상태 저장
  const saveGameState = useCallback((newGameState: GameState, newStats: Stats) => {
    const data = {
      gameState: { ...newGameState, language: currentLanguage },
      stats: newStats,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [currentLanguage]);

  // 키 입력 처리
  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;

    const answer = getTodayAnswer();

    if (key === 'ENTER') {
      if (gameState.currentGuess.length !== maxLength) {
        setShowInvalidWord(true);
        setShake(true);
        setTimeout(() => {
          setShowInvalidWord(false);
          setShake(false);
        }, 500);
        return;
      }

      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const won = gameState.currentGuess === answer;
      const lost = newGuesses.length >= 6 && !won;

      let newStats = { ...stats };
      let newGameStatus: GameStatus = 'playing';

      if (won) {
        newGameStatus = 'won';
        newStats.gamesPlayed += 1;
        newStats.gamesWon += 1;

        const todayDate = getTodayDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        if (stats.lastWinDate === yesterdayDate) {
          newStats.currentStreak += 1;
        } else if (stats.lastWinDate === todayDate) {
          // 같은 날 이미 이겼음
        } else {
          newStats.currentStreak = 1;
        }

        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        newStats.lastWinDate = todayDate;

        setTimeout(() => setShowStats(true), 1500);
      } else if (lost) {
        newGameStatus = 'lost';
        newStats.gamesPlayed += 1;
        setTimeout(() => setShowStats(true), 1500);
      }

      const newGameState = {
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus,
        lastPlayedDate: getTodayDateString(),
      };

      setGameState(newGameState);
      setStats(newStats);
      saveGameState(newGameState, newStats);

    } else if (key === 'BACKSPACE') {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1),
      }));
    } else if (gameState.currentGuess.length < maxLength) {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key,
      }));
    }
  }, [gameState, stats, currentLanguage, getTodayAnswer, saveGameState]);

  // 한글 입력 처리
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isComposing) return; // IME 입력 중이면 무시

      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key) && currentLanguage === 'en') {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, currentLanguage, isComposing]);

  // 타일 상태 가져오기
  const getTileStatus = (rowIndex: number, colIndex: number): TileStatus => {
    const answer = getTodayAnswer();
    const guess = gameState.guesses[rowIndex];

    if (!guess) return 'empty';
    if (!guess[colIndex]) return 'empty';

    const evaluated = evaluateGuess(guess, answer);
    return evaluated[colIndex];
  };

  // 키보드 키 상태
  const getKeyStatus = (key: string): TileStatus => {
    const answer = getTodayAnswer();
    let bestStatus: TileStatus = 'empty';

    for (const guess of gameState.guesses) {
      const evaluated = evaluateGuess(guess, answer);
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          const status = evaluated[i];
          if (status === 'correct') {
            return 'correct'; // 초록색은 무조건 최우선
          } else if (status === 'present') {
            bestStatus = 'present'; // 노란색은 회색/빈칸보다 우선
          } else if (status === 'absent' && bestStatus === 'empty') {
            bestStatus = 'absent';
          }
        }
      }
    }

    return bestStatus;
  };

  // 공유하기
  const handleShare = () => {
    const answer = getTodayAnswer();
    const emoji = gameState.guesses.map(guess => {
      const evaluated = evaluateGuess(guess, answer);
      return evaluated.map(status => {
        if (status === 'correct') return '🟩';
        if (status === 'present') return '🟨';
        return '⬛';
      }).join('');
    }).join('\n');

    const dayCount = getTodayIndex() + 1;
    const attempts = gameState.gameStatus === 'won' ? gameState.guesses.length : 'X';
    const text = `Utility Hub Wordle #${dayCount} - ${attempts}/6\n\n${emoji}\n\nhttps://theutilhub.com`;

    navigator.clipboard.writeText(text);
    alert(currentLanguage === 'ko' ? '클립보드에 복사되었습니다!' : 'Copied to clipboard!');
  };

  // 언어 변경
  const handleLanguageToggle = (lang: 'ko' | 'en') => {
    setCurrentLanguage(lang);
    setGameState({
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      lastPlayedDate: getTodayDateString(),
    });
  };

  // 한글 키보드는 물리 키보드 사용을 권장 (가상 키보드는 표시만)
  const koreanKeyboardHint = '⌨️ 키보드로 한글을 직접 입력하세요';

  // 영어 키보드 레이아웃
  const englishKeyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  // 영어 키보드 레이아웃

  // 다음 퍼즐까지 남은 시간
  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <NavigationActions />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Grid3x3 size={40} color="#8b5cf6" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            {currentLanguage === 'ko' ? '일일 단어 퍼즐' : 'Daily Word Puzzle'}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => handleLanguageToggle('ko')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: currentLanguage === 'ko' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: currentLanguage === 'ko' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              KR
            </button>
            <button
              onClick={() => handleLanguageToggle('en')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: currentLanguage === 'en' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: currentLanguage === 'en' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              EN
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {currentLanguage === 'ko'
            ? `매일 새로운 ${maxLength}글자 단어를 맞춰보세요!`
            : `Guess the ${maxLength}-letter word every day!`}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {currentLanguage === 'ko' ? `퍼즐 #${getTodayIndex() + 1}` : `Puzzle #${getTodayIndex() + 1}`}
        </p>
      </header>

      {/* Game Board */}
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        {/* Status Bar */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {currentLanguage === 'ko' ? '현재 연승' : 'Current Streak'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
              {stats.currentStreak} 🔥
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {currentLanguage === 'ko' ? '최대 연승' : 'Max Streak'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
              {stats.maxStreak} 👑
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {currentLanguage === 'ko' ? '승률' : 'Win Rate'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#06b6d4' }}>
              {winRate}% 📊
            </div>
          </div>
        </div>

        {/* Invalid Word Message */}
        {showInvalidWord && (
          <div style={{
            color: '#ef4444',
            fontWeight: 600,
            fontSize: '0.95rem',
            animation: 'pulse 0.5s ease-in-out'
          }}>
            {currentLanguage === 'ko' ? `${maxLength}글자를 입력하세요!` : `Enter ${maxLength} letters!`}
          </div>
        )}

        {/* Grid */}
        <div className={shake ? 'shake' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
          {Array.from({ length: 6 }).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === gameState.guesses.length;
            const guess = gameState.guesses[rowIndex] || '';
            const displayGuess = isCurrentRow ? gameState.currentGuess : guess;

            return (
              <div key={rowIndex} style={{ display: 'flex', gap: '0.5rem' }}>
                {Array.from({ length: maxLength }).map((_, colIndex) => {
                  const char = displayGuess[colIndex] || '';
                  const status = getTileStatus(rowIndex, colIndex);
                  const isFilled = char !== '' && isCurrentRow;

                  return (
                    <div
                      key={colIndex}
                      className="tile"
                      data-status={status}
                      data-filled={isFilled}
                      style={{
                        width: currentLanguage === 'ko' ? '70px' : '62px',
                        height: currentLanguage === 'ko' ? '70px' : '62px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: currentLanguage === 'ko' ? '1.75rem' : '2rem',
                        fontWeight: 700,
                        border: '2px solid',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        animation: status !== 'empty' && !isCurrentRow ? `flip 0.5s ease ${colIndex * 0.1}s` : 'none',
                      }}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Korean Input Field */}
        {currentLanguage === 'ko' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              maxLength={maxLength}
              disabled={gameState.gameStatus !== 'playing'}
              placeholder="여기에 한글 입력 (3글자)"
              value={gameState.currentGuess}
              onChange={(e) => {
                // IME 조합 중에는 필터링하지 않고 그대로 적용
                // 조합이 끝나면 onCompositionEnd에서 완성된 한글만 남김
                const val = e.target.value;
                if (val.length <= maxLength) {
                  setGameState(prev => ({ ...prev, currentGuess: val }));
                }
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(e) => {
                setIsComposing(false);
                // 조합이 끝난 후 완성된 한글만 허용 (자모는 제거)
                const val = (e.target as HTMLInputElement).value.replace(/[^가-힣]/g, '');
                if (val.length <= maxLength) {
                  setGameState(prev => ({ ...prev, currentGuess: val }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isComposing) {
                  handleKeyPress('ENTER');
                }
              }}
              style={{
                padding: '1rem',
                fontSize: '1.5rem',
                textAlign: 'center',
                width: '100%',
                maxWidth: '300px',
                borderRadius: '8px',
                border: '2px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />
          </div>
        )}

        {/* Virtual Keyboard / Korean Input Hint */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
          {currentLanguage === 'ko' ? (
            // 한글 모드: 입력 안내 및 버튼
            <div style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                👆 위의 입력창에 한글을 타이핑하세요 (3글자)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => handleKeyPress('BACKSPACE')}
                  disabled={gameState.gameStatus !== 'playing'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: gameState.gameStatus === 'playing' ? 'pointer' : 'not-allowed',
                    opacity: gameState.gameStatus !== 'playing' ? 0.5 : 1,
                  }}
                >
                  ⌫ 지우기
                </button>
                <button
                  onClick={() => handleKeyPress('ENTER')}
                  disabled={gameState.gameStatus !== 'playing'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: gameState.gameStatus === 'playing' ? 'pointer' : 'not-allowed',
                    opacity: gameState.gameStatus !== 'playing' ? 0.5 : 1,
                  }}
                >
                  ↵ 확인
                </button>
              </div>
            </div>
          ) : (
            // 영어 모드: 가상 키보드 표시
            englishKeyboard.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: rowIndex < englishKeyboard.length - 1 ? '0.4rem' : 0 }}>
                {row.map((key) => {
                  const status = key.length === 1 ? getKeyStatus(key) : 'empty';
                  const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className="keyboard-key"
                      data-status={status}
                      disabled={gameState.gameStatus !== 'playing'}
                      style={{
                        padding: isSpecial ? '0 1.5rem' : '0',
                        height: '58px',
                        minWidth: isSpecial ? '80px' : '40px',
                        fontSize: isSpecial ? '0.75rem' : '1.1rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: gameState.gameStatus === 'playing' ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        opacity: gameState.gameStatus !== 'playing' ? 0.5 : 1,
                      }}
                    >
                      {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '↵' : key}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats Modal */}
      {showStats && (
        <div
          className="modal-overlay"
          onClick={() => setShowStats(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            className="glass-panel modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>
              {gameState.gameStatus === 'won'
                ? (currentLanguage === 'ko' ? '🎉 축하합니다!' : '🎉 Congratulations!')
                : (currentLanguage === 'ko' ? '😢 아쉽네요!' : '😢 Better luck tomorrow!')}
            </h2>

            {gameState.gameStatus === 'lost' && (
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                {currentLanguage === 'ko' ? '정답은' : 'The answer was'}: <strong style={{ color: '#10b981', fontSize: '1.25rem' }}>{getTodayAnswer()}</strong>
              </p>
            )}

            {/* Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{stats.gamesPlayed}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentLanguage === 'ko' ? '플레이' : 'Played'}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{winRate}%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentLanguage === 'ko' ? '승률' : 'Win Rate'}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#06b6d4' }}>{stats.currentStreak}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentLanguage === 'ko' ? '현재 연승' : 'Current'}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{stats.maxStreak}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentLanguage === 'ko' ? '최대 연승' : 'Max Streak'}
                </div>
              </div>
            </div>

            {/* Next Puzzle Countdown */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'var(--surface)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {currentLanguage === 'ko' ? '다음 퍼즐까지' : 'Next Puzzle In'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
                {timeUntilNext}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {currentLanguage === 'ko' ? '🎯 공유하기' : '🎯 Share'}
              </button>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {currentLanguage === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .tile[data-status="empty"] {
          background: var(--surface);
          border-color: var(--border);
          color: var(--text-primary);
        }

        .tile[data-status="filled"] {
          background: var(--surface);
          border-color: var(--text-secondary);
          color: var(--text-primary);
          transform: scale(1.05);
        }

        .tile[data-status="correct"] {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .tile[data-status="present"] {
          background: #f59e0b;
          border-color: #f59e0b;
          color: white;
        }

        .tile[data-status="absent"] {
          background: #64748b;
          border-color: #64748b;
          color: white;
        }

        .keyboard-key[data-status="empty"] {
          background: var(--surface);
          color: var(--text-primary);
        }

        .keyboard-key[data-status="correct"] {
          background: #10b981;
          color: white;
        }

        .keyboard-key[data-status="present"] {
          background: #f59e0b;
          color: white;
        }

        .keyboard-key[data-status="absent"] {
          background: #64748b;
          color: white;
        }

        .keyboard-key:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .shake {
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* 공유하기 */}
      <ShareBar
        title={currentLanguage === 'ko' ? '일일 단어 퍼즐' : 'Daily Word Puzzle'}
        description={currentLanguage === 'ko' ? `매일 새로운 ${maxLength}글자 단어를 맞춰보세요!` : `Guess the ${maxLength}-letter word every day!`}
      />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/utility/wordle" />

      {/* 광고 영역 */}
      <div style={{
        width: '100%',
        minHeight: '90px',
        background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        margin: '2rem 0'
      }}>
        광고 영역
      </div>

      {/* SEO Section */}
      <SeoSection
        ko={{
          title: currentLanguage === 'ko' ? '일일 단어 퍼즐 - 매일 새로운 도전!' : 'Daily Word Puzzle - New Challenge Every Day!',
          description: currentLanguage === 'ko'
            ? 'Utility Hub의 일일 단어 퍼즐은 매일 새로운 5글자 단어를 맞추는 두뇌 게임입니다. 한국어와 영어를 지원하며, 연승 기록을 추적하여 매일 재방문을 유도합니다. 100% 무료로 플레이하고 친구들과 결과를 공유하세요!'
            : 'Utility Hub\'s Daily Word Puzzle is a brain game where you guess a new 5-letter word every day. Supports Korean and English, tracks your winning streak to encourage daily visits. Play 100% free and share your results with friends!',
          useCases: [
            {
              icon: '🧠',
              title: currentLanguage === 'ko' ? '두뇌 트레이닝' : 'Brain Training',
              desc: currentLanguage === 'ko'
                ? '매일 단어 퍼즐을 풀면서 어휘력과 추론 능력을 향상시키세요. 규칙적인 두뇌 활동으로 집중력을 높일 수 있습니다.'
                : 'Improve your vocabulary and reasoning skills by solving word puzzles daily. Regular brain activity enhances concentration.',
            },
            {
              icon: '🔥',
              title: currentLanguage === 'ko' ? '연승 도전' : 'Streak Challenge',
              desc: currentLanguage === 'ko'
                ? '매일 퍼즐을 풀고 연승 기록을 쌓아보세요. 최대 연승 기록에 도전하고, 친구들과 경쟁할 수 있습니다.'
                : 'Solve puzzles daily and build your winning streak. Challenge your max streak record and compete with friends.',
            },
            {
              icon: '🌏',
              title: currentLanguage === 'ko' ? '글로벌 지원' : 'Global Support',
              desc: currentLanguage === 'ko'
                ? '한국어와 영어 두 언어를 모두 지원합니다. 언어 토글 버튼으로 간편하게 전환하며 다양한 단어를 경험하세요.'
                : 'Supports both Korean and English languages. Easily switch between languages and experience diverse words.',
            },
            {
              icon: '🎯',
              title: currentLanguage === 'ko' ? '바이럴 공유' : 'Viral Sharing',
              desc: currentLanguage === 'ko'
                ? '퍼즐 결과를 이모지로 표현하여 SNS에 공유하세요. 스포일러 없이 친구들에게 도전장을 내밀 수 있습니다.'
                : 'Share your puzzle results using emojis on social media. Challenge friends without spoilers.',
            },
          ],
          steps: [
            {
              step: currentLanguage === 'ko' ? '1. 언어 선택' : '1. Choose Language',
              desc: currentLanguage === 'ko'
                ? '상단의 KR/EN 토글 버튼으로 한국어 또는 영어를 선택합니다.'
                : 'Select Korean or English using the KR/EN toggle button at the top.',
            },
            {
              step: currentLanguage === 'ko' ? '2. 단어 입력' : '2. Enter Word',
              desc: currentLanguage === 'ko'
                ? '키보드 또는 화면의 가상 키보드를 사용하여 단어를 입력합니다. 한국어는 3글자, 영어는 5글자입니다.'
                : 'Use your keyboard or the on-screen virtual keyboard to enter words. Korean uses 3 characters, English uses 5 letters.',
            },
            {
              step: currentLanguage === 'ko' ? '3. 색상 힌트 확인' : '3. Check Color Hints',
              desc: currentLanguage === 'ko'
                ? '🟩 초록색은 정답, 🟨 노란색은 위치 오류, ⬛ 회색은 단어에 없는 글자입니다.'
                : '🟩 Green means correct, 🟨 Yellow means wrong position, ⬛ Gray means not in the word.',
            },
            {
              step: currentLanguage === 'ko' ? '4. 결과 공유' : '4. Share Results',
              desc: currentLanguage === 'ko'
                ? '게임 종료 후 통계 모달에서 공유 버튼을 눌러 결과를 복사하고 SNS에 공유하세요.'
                : 'After the game ends, click the share button in the stats modal to copy and share your results on social media.',
            },
          ],
          faqs: [
            {
              q: currentLanguage === 'ko' ? '매일 새로운 단어가 나오나요?' : 'Is there a new word every day?',
              a: currentLanguage === 'ko'
                ? '네! 매일 자정(00:00)이 되면 새로운 단어 퍼즐이 생성됩니다. 날짜 기반 알고리즘을 사용하여 모든 사용자에게 동일한 단어가 제공됩니다.'
                : 'Yes! A new word puzzle is generated every day at midnight (00:00). The date-based algorithm ensures all users get the same word.',
            },
            {
              q: currentLanguage === 'ko' ? '연승이 끊기면 어떻게 되나요?' : 'What happens if my streak breaks?',
              a: currentLanguage === 'ko'
                ? '하루를 건너뛰거나 퍼즐을 실패하면 현재 연승이 0으로 초기화됩니다. 하지만 최대 연승 기록은 유지되므로, 다시 도전하여 새로운 기록을 세워보세요!'
                : 'If you skip a day or fail a puzzle, your current streak resets to 0. However, your max streak record is preserved, so challenge yourself to set a new record!',
            },
            {
              q: currentLanguage === 'ko' ? '무료로 플레이할 수 있나요?' : 'Is it free to play?',
              a: currentLanguage === 'ko'
                ? '네! 일일 단어 퍼즐은 100% 무료로 제공됩니다. 회원가입이나 로그인 없이 바로 플레이하고, 데이터는 브라우저에 안전하게 저장됩니다.'
                : 'Yes! The Daily Word Puzzle is 100% free. Play immediately without registration or login, and your data is safely stored in your browser.',
            },
            {
              q: currentLanguage === 'ko' ? '한국어와 영어 중 선택할 수 있나요?' : 'Can I choose between Korean and English?',
              a: currentLanguage === 'ko'
                ? '네! 상단의 KR/EN 토글 버튼으로 언제든지 언어를 전환할 수 있습니다. 각 언어마다 독립적인 단어 리스트가 있으며, 게임 기록도 별도로 관리됩니다.'
                : 'Yes! You can switch languages anytime using the KR/EN toggle button at the top. Each language has an independent word list, and game records are managed separately.',
            },
            {
              q: currentLanguage === 'ko' ? '공유 기능은 어떻게 작동하나요?' : 'How does the share feature work?',
              a: currentLanguage === 'ko'
                ? '게임 종료 후 공유 버튼을 누르면 스포일러 없이 결과를 이모지(🟩🟨⬛)로 표현한 텍스트가 클립보드에 복사됩니다. SNS에 붙여넣어 친구들에게 도전장을 내밀어보세요!'
                : 'After the game ends, clicking the share button copies a text expressing your results with emojis (🟩🟨⬛) without spoilers to your clipboard. Paste it on social media to challenge your friends!',
            },
          ],
        }}
        en={{
          title: currentLanguage === 'ko' ? '일일 단어 퍼즐 - 매일 새로운 도전!' : 'Daily Word Puzzle - New Challenge Every Day!',
          description: currentLanguage === 'ko'
            ? 'Utility Hub의 일일 단어 퍼즐은 매일 새로운 5글자 단어를 맞추는 두뇌 게임입니다. 한국어와 영어를 지원하며, 연승 기록을 추적하여 매일 재방문을 유도합니다. 100% 무료로 플레이하고 친구들과 결과를 공유하세요!'
            : 'Utility Hub\'s Daily Word Puzzle is a brain game where you guess a new 5-letter word every day. Supports Korean and English, tracks your winning streak to encourage daily visits. Play 100% free and share your results with friends!',
          useCases: [
            {
              icon: '🧠',
              title: currentLanguage === 'ko' ? '두뇌 트레이닝' : 'Brain Training',
              desc: currentLanguage === 'ko'
                ? '매일 단어 퍼즐을 풀면서 어휘력과 추론 능력을 향상시키세요. 규칙적인 두뇌 활동으로 집중력을 높일 수 있습니다.'
                : 'Improve your vocabulary and reasoning skills by solving word puzzles daily. Regular brain activity enhances concentration.',
            },
            {
              icon: '🔥',
              title: currentLanguage === 'ko' ? '연승 도전' : 'Streak Challenge',
              desc: currentLanguage === 'ko'
                ? '매일 퍼즐을 풀고 연승 기록을 쌓아보세요. 최대 연승 기록에 도전하고, 친구들과 경쟁할 수 있습니다.'
                : 'Solve puzzles daily and build your winning streak. Challenge your max streak record and compete with friends.',
            },
            {
              icon: '🌏',
              title: currentLanguage === 'ko' ? '글로벌 지원' : 'Global Support',
              desc: currentLanguage === 'ko'
                ? '한국어와 영어 두 언어를 모두 지원합니다. 언어 토글 버튼으로 간편하게 전환하며 다양한 단어를 경험하세요.'
                : 'Supports both Korean and English languages. Easily switch between languages and experience diverse words.',
            },
            {
              icon: '🎯',
              title: currentLanguage === 'ko' ? '바이럴 공유' : 'Viral Sharing',
              desc: currentLanguage === 'ko'
                ? '퍼즐 결과를 이모지로 표현하여 SNS에 공유하세요. 스포일러 없이 친구들에게 도전장을 내밀 수 있습니다.'
                : 'Share your puzzle results using emojis on social media. Challenge friends without spoilers.',
            },
          ],
          steps: [
            {
              step: currentLanguage === 'ko' ? '1. 언어 선택' : '1. Choose Language',
              desc: currentLanguage === 'ko'
                ? '상단의 KR/EN 토글 버튼으로 한국어 또는 영어를 선택합니다.'
                : 'Select Korean or English using the KR/EN toggle button at the top.',
            },
            {
              step: currentLanguage === 'ko' ? '2. 단어 입력' : '2. Enter Word',
              desc: currentLanguage === 'ko'
                ? '키보드 또는 화면의 가상 키보드를 사용하여 단어를 입력합니다. 한국어는 3글자, 영어는 5글자입니다.'
                : 'Use your keyboard or the on-screen virtual keyboard to enter words. Korean uses 3 characters, English uses 5 letters.',
            },
            {
              step: currentLanguage === 'ko' ? '3. 색상 힌트 확인' : '3. Check Color Hints',
              desc: currentLanguage === 'ko'
                ? '🟩 초록색은 정답, 🟨 노란색은 위치 오류, ⬛ 회색은 단어에 없는 글자입니다.'
                : '🟩 Green means correct, 🟨 Yellow means wrong position, ⬛ Gray means not in the word.',
            },
            {
              step: currentLanguage === 'ko' ? '4. 결과 공유' : '4. Share Results',
              desc: currentLanguage === 'ko'
                ? '게임 종료 후 통계 모달에서 공유 버튼을 눌러 결과를 복사하고 SNS에 공유하세요.'
                : 'After the game ends, click the share button in the stats modal to copy and share your results on social media.',
            },
          ],
          faqs: [
            {
              q: currentLanguage === 'ko' ? '매일 새로운 단어가 나오나요?' : 'Is there a new word every day?',
              a: currentLanguage === 'ko'
                ? '네! 매일 자정(00:00)이 되면 새로운 단어 퍼즐이 생성됩니다. 날짜 기반 알고리즘을 사용하여 모든 사용자에게 동일한 단어가 제공됩니다.'
                : 'Yes! A new word puzzle is generated every day at midnight (00:00). The date-based algorithm ensures all users get the same word.',
            },
            {
              q: currentLanguage === 'ko' ? '연승이 끊기면 어떻게 되나요?' : 'What happens if my streak breaks?',
              a: currentLanguage === 'ko'
                ? '하루를 건너뛰거나 퍼즐을 실패하면 현재 연승이 0으로 초기화됩니다. 하지만 최대 연승 기록은 유지되므로, 다시 도전하여 새로운 기록을 세워보세요!'
                : 'If you skip a day or fail a puzzle, your current streak resets to 0. However, your max streak record is preserved, so challenge yourself to set a new record!',
            },
            {
              q: currentLanguage === 'ko' ? '무료로 플레이할 수 있나요?' : 'Is it free to play?',
              a: currentLanguage === 'ko'
                ? '네! 일일 단어 퍼즐은 100% 무료로 제공됩니다. 회원가입이나 로그인 없이 바로 플레이하고, 데이터는 브라우저에 안전하게 저장됩니다.'
                : 'Yes! The Daily Word Puzzle is 100% free. Play immediately without registration or login, and your data is safely stored in your browser.',
            },
            {
              q: currentLanguage === 'ko' ? '한국어와 영어 중 선택할 수 있나요?' : 'Can I choose between Korean and English?',
              a: currentLanguage === 'ko'
                ? '네! 상단의 KR/EN 토글 버튼으로 언제든지 언어를 전환할 수 있습니다. 각 언어마다 독립적인 단어 리스트가 있으며, 게임 기록도 별도로 관리됩니다.'
                : 'Yes! You can switch languages anytime using the KR/EN toggle button at the top. Each language has an independent word list, and game records are managed separately.',
            },
            {
              q: currentLanguage === 'ko' ? '공유 기능은 어떻게 작동하나요?' : 'How does the share feature work?',
              a: currentLanguage === 'ko'
                ? '게임 종료 후 공유 버튼을 누르면 스포일러 없이 결과를 이모지(🟩🟨⬛)로 표현한 텍스트가 클립보드에 복사됩니다. SNS에 붙여넣어 친구들에게 도전장을 내밀어보세요!'
                : 'After the game ends, clicking the share button copies a text expressing your results with emojis (🟩🟨⬛) without spoilers to your clipboard. Paste it on social media to challenge your friends!',
            },
          ],
        }}
      />
    </div>
  );
}
