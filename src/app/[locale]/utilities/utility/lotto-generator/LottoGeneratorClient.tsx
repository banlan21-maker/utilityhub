'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './lotto.module.css';

/* ─── Types ─── */
type Game = 'powerball' | 'megamillions' | 'lotto645';

interface LottoResult {
  main: number[];
  bonus: number | null;
  bonusLabel: string;
}

/* ─── Game Config ─── */
const GAMES: { id: Game; label: string; sub: string }[] = [
  { id: 'powerball',    label: '🇺🇸 Powerball',      sub: '5/69 + PB 1/26' },
  { id: 'megamillions', label: '🇺🇸 Mega Millions',   sub: '5/70 + MB 1/24' },
  { id: 'lotto645',     label: '🇰🇷 Lotto 6/45',      sub: '6/45' },
];

/* ─── Seed PRNG (pure JS, no lib) ─── */
function hashCode(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function pickUnique(max: number, count: number, rng: () => number): number[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

function generateNumbers(game: Game, name: string, birth: string, purchase: string, isKo: boolean): LottoResult {
  const seed = hashCode(`${name}|${birth}|${purchase}|${game}`);
  const rng  = makeRng(seed);

  if (game === 'powerball') {
    return { main: pickUnique(69, 5, rng), bonus: Math.floor(rng() * 26) + 1, bonusLabel: 'Powerball' };
  }
  if (game === 'megamillions') {
    return { main: pickUnique(70, 5, rng), bonus: Math.floor(rng() * 24) + 1, bonusLabel: 'Mega Ball' };
  }
  // lotto645: 6 main + 1 bonus from remaining numbers
  const main645 = pickUnique(45, 6, rng);
  const remaining = Array.from({ length: 45 }, (_, i) => i + 1).filter(n => !main645.includes(n));
  const bonus645 = remaining[Math.floor(rng() * remaining.length)];
  return { main: main645, bonus: bonus645, bonusLabel: isKo ? '보너스' : 'Bonus' };
}

/* ─── Ball Helpers ─── */
function getLotto645Class(n: number): string {
  if (n <= 10) return s.ball_yellow;
  if (n <= 20) return s.ball_sky;
  if (n <= 30) return s.ball_rose;
  if (n <= 40) return s.ball_slate;
  return s.ball_green;
}

function BallEl({
  num, cls, delay,
}: { num: number; cls: string; delay: number }) {
  return (
    <motion.div
      className={`${s.ball} ${cls}`}
      initial={{ scale: 0, opacity: 0, y: -30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 22 }}
    >
      {num}
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function LottoGeneratorClient({ seo }: { seo?: React.ReactNode }) {
  const locale  = useLocale();
  const isKo    = locale === 'ko';
  const today   = new Date().toISOString().split('T')[0];

  const [game, setGame]         = useState<Game>('powerball');
  const [name, setName]         = useState('');
  const [birth, setBirth]       = useState('');
  const [purchase, setPurchase] = useState(today);
  const [result, setResult]     = useState<LottoResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [key, setKey]           = useState(0); // force re-mount for re-animation

  const canGenerate = name.trim().length > 0 && birth.length > 0 && purchase.length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(generateNumbers(game, name.trim(), birth, purchase, isKo));
      setKey(k => k + 1);
      setLoading(false);
    }, 1500);
  };

  const handleGameChange = (g: Game) => {
    setGame(g);
    setResult(null);
  };

  return (
    <div className={s.wrap}>
      <NavigationActions />

      {/* Header */}
      <ToolHeader
        icon="🎰"
        title="Global Destiny Lotto Picker"
        subtitle={isKo
          ? '이름 · 생년월일 · 구매일로 당신만의 운명 번호를 뽑습니다'
          : 'Your name, birthday & purchase date reveal your destiny numbers'}
      />

      {/* ── Galaxy Gold Hero ── */}
      <div className={s.hero}>
        <div className={s.hero_inner}>

          {/* Game Selector */}
          <div className={s.game_tabs}>
            {GAMES.map(g => (
              <button
                key={g.id}
                className={`${s.game_tab} ${game === g.id ? s.game_tab_active : ''}`}
                onClick={() => handleGameChange(g.id)}
              >
                {g.label}
                <div style={{ fontSize: '0.68rem', opacity: 0.7, fontWeight: 600, marginTop: '0.2rem' }}>{g.sub}</div>
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className={s.inputs_grid}>
            <div className={s.input_group}>
              <label className={s.input_label}>{isKo ? '이름 (Name)' : 'Your Name'}</label>
              <input
                className={s.input_field}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isKo ? '홍길동' : 'John Doe'}
                maxLength={50}
              />
            </div>
            <div className={s.input_group}>
              <label className={s.input_label}>{isKo ? '생년월일 (Birth Date)' : 'Birth Date'}</label>
              <input
                className={s.input_field}
                type="date"
                value={birth}
                onChange={e => setBirth(e.target.value)}
                max={today}
              />
            </div>
            <div className={s.input_group} style={{ gridColumn: '1 / -1' }}>
              <label className={s.input_label}>{isKo ? '복권 구매 날짜 (Purchase Date)' : 'Purchase Date'}</label>
              <input
                className={s.input_field}
                type="date"
                value={purchase}
                onChange={e => setPurchase(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            className={s.generate_btn}
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
          >
            {loading
              ? (isKo ? '운명 동기화 중...' : 'Synchronizing...')
              : (isKo ? '✨ 나의 운명 번호 뽑기' : '✨ Reveal My Destiny Numbers')}
          </button>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className={s.loading_wrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={s.loading_spinner} />
                <div className={s.loading_text}>
                  {isKo ? 'Synchronizing with your destiny...' : 'Synchronizing with your destiny...'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                key={key}
                className={s.result_wrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={s.result_label}>
                  {isKo ? '🌟 당신의 운명 번호' : '🌟 Your Destiny Numbers'}
                </div>

                <div className={s.balls_row}>
                  {result.main.map((n, i) => (
                    <BallEl
                      key={`m${i}`}
                      num={n}
                      cls={
                        game === 'lotto645'
                          ? getLotto645Class(n)
                          : s.ball_blue
                      }
                      delay={i * 0.12}
                    />
                  ))}

                  {result.bonus !== null && (
                    <>
                      <motion.div
                        className={s.divider}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ delay: result.main.length * 0.12 + 0.1 }}
                      />
                      <BallEl
                        num={result.bonus}
                        cls={
                          game === 'powerball'    ? s.ball_red :
                          game === 'megamillions' ? s.ball_gold :
                          getLotto645Class(result.bonus)   // 로또 6/45 보너스도 동일 색상 체계
                        }
                        delay={result.main.length * 0.12 + 0.2}
                      />
                    </>
                  )}
                </div>

                {result.bonus !== null && (
                  <motion.div
                    style={{ fontSize: '0.72rem', color: 'rgba(212,175,55,0.6)', marginTop: '0.5rem', fontWeight: 700 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (result.main.length + 1) * 0.12 + 0.3 }}
                  >
                    {result.bonusLabel}
                  </motion.div>
                )}

                <div className={s.seed_notice}>
                  🔒 {isKo
                    ? '동일한 입력값은 항상 같은 번호를 생성합니다 (운명 고정 알고리즘)'
                    : 'Same inputs always generate the same numbers (destiny-fixed algorithm)'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Disclaimer */}
        <div className={s.disclaimer}>
          <div className={s.disclaimer_title}>⚠️ {isKo ? '면책 조항' : 'Disclaimer'}</div>
          {isKo
            ? '이 도구는 순수한 오락 목적으로 제작되었으며, 어떠한 당첨도 보장하지 않습니다. 실제 복권 구매를 권장하는 것이 아닙니다. 복권 구매는 만 19세 이상 성인만 가능하며, 과도한 복권 구매는 도박 중독으로 이어질 수 있습니다. 도박 문제 상담: 한국도박문제관리센터 ☎ 1336 (24시간)'
            : 'This tool is for entertainment purposes only and does not guarantee any lottery winnings. This is not a recommendation to purchase lottery tickets. Please play responsibly. If you have a gambling problem, call the National Problem Gambling Helpline: 1-800-522-4700.'}
        </div>
      </div>

      {/* ── Standard Bottom ── */}
      <div className={s.seo_wrap}>
        <ShareBar
          title={isKo ? '글로벌 운명 로또 번호 생성기' : 'Global Destiny Lotto Picker'}
          description={isKo ? '이름과 생일로 나만의 운명 번호를 뽑아보세요' : 'Generate your destiny lotto numbers with name & birthday'}
        />
        <RelatedTools toolId="utilities/utility/lotto-generator" />

        {seo}
      </div>
    </div>
  );
}
