'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Brain } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './brain-boost.module.css';
import { ui } from '@/app/components/ui';

// ── Constants ─────────────────────────────────────────────
const SOUND_LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T']; // 명확히 구분되는 자음
const STORAGE_KEY = 'uh_brain_boost_stats_v1';
type SessionLen = 'short' | 'standard' | 'long';
type Interval = 'fast' | 'normal' | 'slow';

interface Stimulus {
  position: number; // 0~8
  letterIdx: number; // index into SOUND_LETTERS
}

interface SessionStats {
  date: string; // ISO
  n: number;
  totalTrials: number;
  posAcc: number; // 0~100
  soundAcc: number;
  score: number;
}

interface AggregateStats {
  totalSessions: number;
  bestN: number;
  bestScore: number;
  avgAccuracy: number;
  streak: number;
}

function loadStats(): SessionStats[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionStats[];
  } catch { return []; }
}

function saveStats(stats: SessionStats[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
}

function aggregate(stats: SessionStats[]): AggregateStats {
  if (stats.length === 0) {
    return { totalSessions: 0, bestN: 0, bestScore: 0, avgAccuracy: 0, streak: 0 };
  }
  const totalSessions = stats.length;
  const bestN = Math.max(...stats.map((s) => s.n));
  const bestScore = Math.max(...stats.map((s) => s.score));
  const avgAccuracy = Math.round(
    stats.reduce((sum, st) => sum + (st.posAcc + st.soundAcc) / 2, 0) / totalSessions,
  );

  // streak — 연속 일수 (오늘부터 역으로)
  const dates = new Set(stats.map((s) => s.date.slice(0, 10))); // YYYY-MM-DD
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = d.toISOString().slice(0, 10);
    if (dates.has(k)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return { totalSessions, bestN, bestScore, avgAccuracy, streak };
}

// Web Audio API — 짧은 letter sound (음성 합성 대신 톤 사용)
function playTone(audioCtx: AudioContext | null, letterIdx: number) {
  if (!audioCtx) return;
  const baseFreq = 220; // A3
  const freq = baseFreq * Math.pow(2, letterIdx / 8); // 옥타브를 8등분
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.45);
}

function generateSequence(n: number, totalTrials: number): Stimulus[] {
  // 최소 N개 이후부터는 약 25% 확률로 N번 전과 같게 배치 (positive sample)
  const seq: Stimulus[] = [];
  for (let i = 0; i < totalTrials; i++) {
    let pos: number;
    let letterIdx: number;
    if (i >= n) {
      const ref = seq[i - n];
      pos = Math.random() < 0.28 ? ref.position : Math.floor(Math.random() * 9);
      letterIdx = Math.random() < 0.28 ? ref.letterIdx : Math.floor(Math.random() * SOUND_LETTERS.length);
    } else {
      pos = Math.floor(Math.random() * 9);
      letterIdx = Math.floor(Math.random() * SOUND_LETTERS.length);
    }
    seq.push({ position: pos, letterIdx });
  }
  return seq;
}

const INTERVAL_MS: Record<Interval, number> = { fast: 2000, normal: 2500, slow: 3000 };
const STIM_VISIBLE_MS = 500; // 자극 표시 시간

type GameState = 'setup' | 'running' | 'finished';

export default function BrainBoostClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('BrainBoost');
  const locale = useLocale();
  const isKo = locale === 'ko';

  // ── Setup state ──
  const [n, setN] = useState(2);
  const [sessionLen, setSessionLen] = useState<SessionLen>('standard');
  const [soundOn, setSoundOn] = useState(true);
  const [adaptive, setAdaptive] = useState(true);
  const [interval, setIntervalKey] = useState<Interval>('normal');

  // ── Game state ──
  const [state, setState] = useState<GameState>('setup');
  const [sequence, setSequence] = useState<Stimulus[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = not started
  const [showStim, setShowStim] = useState(false); // 자극 표시중 여부
  const [posPressed, setPosPressed] = useState(false);
  const [soundPressed, setSoundPressed] = useState(false);

  // 응답 누적
  const responsesRef = useRef<Array<{ pos: boolean; sound: boolean }>>([]);

  // ── Stats ──
  const [history, setHistory] = useState<SessionStats[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialOnce, setShowTutorialOnce] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Result ──
  const [lastResult, setLastResult] = useState<SessionStats | null>(null);

  // Mount
  useEffect(() => {
    setHistory(loadStats());
    const seen = localStorage.getItem('uh_brain_boost_tutorial_seen');
    if (!seen) setShowTutorial(true);
    setShowTutorialOnce(true);
  }, []);

  const totalTrials = useMemo(() => {
    if (sessionLen === 'short') return 15;
    if (sessionLen === 'long') return 30;
    return 20 + n;
  }, [sessionLen, n]);

  // ── 게임 진행 (자극 시퀀스 표시) ──
  useEffect(() => {
    if (state !== 'running') return;

    // 첫 자극 시작
    if (currentIdx === -1) {
      setCurrentIdx(0);
      return;
    }

    if (currentIdx >= sequence.length) {
      // 종료
      finishSession();
      return;
    }

    const stim = sequence[currentIdx];

    // 자극 표시
    setShowStim(true);
    setPosPressed(false);
    setSoundPressed(false);

    // 사운드 재생
    if (soundOn) {
      try {
        if (!audioCtxRef.current) {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new Ctx();
        }
        playTone(audioCtxRef.current, stim.letterIdx);
      } catch { /* ignore */ }
    }

    // 자극 숨김 타이머
    const hideTimer = setTimeout(() => setShowStim(false), STIM_VISIBLE_MS);

    // 다음 자극으로
    const nextTimer = setTimeout(() => {
      // 응답 기록 — 사용자가 누르지 않은 경우는 false (정답이면 TN)
      // 정답 채점은 finishSession에서 일괄 처리하므로 여기서는 응답만 기록
      responsesRef.current[currentIdx] = {
        pos: posPressedRef.current,
        sound: soundPressedRef.current,
      };
      setCurrentIdx((idx) => idx + 1);
    }, INTERVAL_MS[interval]);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, currentIdx]);

  // 응답 ref (state 비동기 업데이트 우회)
  const posPressedRef = useRef(false);
  const soundPressedRef = useRef(false);
  useEffect(() => { posPressedRef.current = posPressed; }, [posPressed]);
  useEffect(() => { soundPressedRef.current = soundPressed; }, [soundPressed]);

  // ── 키보드 단축키 ──
  useEffect(() => {
    if (state !== 'running') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        setPosPressed(true);
      } else if (e.key === 'l' || e.key === 'L') {
        setSoundPressed(true);
      } else if (e.key === 'Escape') {
        stopSession();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const startSession = () => {
    const seq = generateSequence(n, totalTrials);
    setSequence(seq);
    responsesRef.current = Array(seq.length).fill(null).map(() => ({ pos: false, sound: false }));
    setLastResult(null);
    setCurrentIdx(-1);
    setState('running');
  };

  const stopSession = () => {
    setState('setup');
    setCurrentIdx(-1);
    setShowStim(false);
  };

  const finishSession = () => {
    // F1 기반 채점 — 단순 정확도는 "가만히 있어도 80%" 문제가 있음
    let posTP = 0, posFP = 0, posFN = 0;
    let sndTP = 0, sndFP = 0, sndFN = 0;

    for (let i = 0; i < sequence.length; i++) {
      if (i < n) continue;
      const isPosMatch = sequence[i].position === sequence[i - n].position;
      const isSoundMatch = sequence[i].letterIdx === sequence[i - n].letterIdx;
      const resp = responsesRef.current[i] ?? { pos: false, sound: false };

      if (isPosMatch && resp.pos) posTP++;
      else if (!isPosMatch && resp.pos) posFP++;
      else if (isPosMatch && !resp.pos) posFN++;
      // else: TN (불일치 + 안 누름) — F1에 사용 안 함

      if (isSoundMatch && resp.sound) sndTP++;
      else if (!isSoundMatch && resp.sound) sndFP++;
      else if (isSoundMatch && !resp.sound) sndFN++;
    }

    const f1 = (tp: number, fp: number, fn: number): number => {
      // 매치 자체가 없고 사용자도 누르지 않은 경우 만점 (특수 케이스, 거의 발생 안 함)
      if (tp + fp === 0 && tp + fn === 0) return 100;
      const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
      const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
      if (precision + recall === 0) return 0;
      return Math.round((2 * precision * recall) / (precision + recall) * 100);
    };
    const posAcc = f1(posTP, posFP, posFN);
    const soundAcc = f1(sndTP, sndFP, sndFN);
    const score = Math.round(((posAcc + soundAcc) / 2) * n);

    const result: SessionStats = {
      date: new Date().toISOString(),
      n,
      totalTrials: sequence.length,
      posAcc,
      soundAcc,
      score,
    };
    const newHistory = [...history, result];
    setHistory(newHistory);
    saveStats(newHistory);
    setLastResult(result);

    // 어댑티브 N 조정 — 표준 Dual N-Back 규칙: 둘 다 80%+ → N+1, 어느 하나 50%- → N-1
    if (adaptive) {
      if (posAcc >= 80 && soundAcc >= 80) setN((prev) => Math.min(prev + 1, 9));
      else if (posAcc < 50 || soundAcc < 50) setN((prev) => Math.max(prev - 1, 1));
    }

    setState('finished');
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    try { localStorage.setItem('uh_brain_boost_tutorial_seen', '1'); } catch { /* ignore */ }
  };

  const resetStats = () => {
    if (typeof window === 'undefined') return;
    if (!window.confirm(t('stats_confirm_reset'))) return;
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const stats = aggregate(history);

  // 다음 N 추천 — Adaptive ON이면 실제 자동 조정된 N과 일치, OFF면 추천만 표시
  const nextN = useMemo(() => {
    if (!lastResult) return n;
    const { posAcc, soundAcc, n: lastN } = lastResult;
    if (posAcc >= 80 && soundAcc >= 80) return Math.min(lastN + 1, 9);
    if (posAcc < 50 || soundAcc < 50) return Math.max(lastN - 1, 1);
    return lastN;
  }, [lastResult, n]);

  const recommendationKey: 'result_level_up' | 'result_level_down' | 'result_level_same' = useMemo(() => {
    if (!lastResult) return 'result_level_same';
    const { posAcc, soundAcc } = lastResult;
    if (posAcc >= 80 && soundAcc >= 80) return 'result_level_up';
    if (posAcc < 50 || soundAcc < 50) return 'result_level_down';
    return 'result_level_same';
  }, [lastResult]);

  const currentStim = currentIdx >= 0 && currentIdx < sequence.length ? sequence[currentIdx] : null;


  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Brain />} title={t('title')} subtitle={t('subtitle')}>
        <p className={s.tagline}>{t('tagline')}</p>
      </ToolHeader>

      {/* ── SETUP ── */}
      {state === 'setup' && (
        <>
          <section className={ui.card}>
            <h2 className={ui.cardTitle}>⚙️ {t('setup_title')}</h2>

            <div className={`${ui.field} ${s.field}`}>
              <label className={ui.label}>{t('level_label')}</label>
              <div className={s.level_row}>
                <button
                  className={s.level_btn}
                  onClick={() => setN((v) => Math.max(1, v - 1))}
                  disabled={n <= 1}
                  aria-label="N-1"
                >
                  −
                </button>
                <span className={s.level_value}>N = {n}</span>
                <button
                  className={s.level_btn}
                  onClick={() => setN((v) => Math.min(9, v + 1))}
                  disabled={n >= 9}
                  aria-label="N+1"
                >
                  +
                </button>
              </div>
            </div>

            <div className={`${ui.field} ${s.field}`}>
              <label className={ui.label}>{t('length_label')}</label>
              <div className={ui.segmented}>
                {(['short', 'standard', 'long'] as SessionLen[]).map((k) => (
                  <button
                    key={k}
                    className={`${ui.segment} ${sessionLen === k ? ui.segmentActive : ''}`}
                    onClick={() => setSessionLen(k)}
                    aria-label={t(`length_${k}` as 'length_short')}
                  >
                    {t(`length_${k}` as 'length_short')}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${ui.field} ${s.field}`}>
              <label className={ui.label}>{t('stim_interval')}</label>
              <div className={ui.segmented}>
                {(['fast', 'normal', 'slow'] as Interval[]).map((k) => (
                  <button
                    key={k}
                    className={`${ui.segment} ${interval === k ? ui.segmentActive : ''}`}
                    onClick={() => setIntervalKey(k)}
                    aria-label={t(`stim_interval_${k}` as 'stim_interval_fast')}
                  >
                    {t(`stim_interval_${k}` as 'stim_interval_fast')}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${ui.field} ${s.field}`}>
              <label className={ui.label}>{t('sound_label')}</label>
              <div className={ui.segmented}>
                <button
                  className={`${ui.segment} ${soundOn ? ui.segmentActive : ''}`}
                  onClick={() => setSoundOn(true)}
                >
                  {t('sound_on')}
                </button>
                <button
                  className={`${ui.segment} ${!soundOn ? ui.segmentActive : ''}`}
                  onClick={() => setSoundOn(false)}
                >
                  {t('sound_off')}
                </button>
              </div>
            </div>

            <div className={`${ui.field} ${s.field}`}>
              <label className={ui.label}>{t('adaptive_label')}</label>
              <div className={ui.segmented}>
                <button
                  className={`${ui.segment} ${adaptive ? ui.segmentActive : ''}`}
                  onClick={() => setAdaptive(true)}
                >
                  {t('adaptive_on')}
                </button>
                <button
                  className={`${ui.segment} ${!adaptive ? ui.segmentActive : ''}`}
                  onClick={() => setAdaptive(false)}
                >
                  {t('adaptive_off')}
                </button>
              </div>
            </div>

            <button className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block} ${s.start_btn}`} onClick={startSession} aria-label={t('start_button')}>
              {t('start_button')}
            </button>
            <button className={`${ui.button} ${ui.ghost} ${ui.block} ${s.tutorial_link}`} onClick={() => setShowTutorial(true)}>
              {t('tutorial_button')}
            </button>
          </section>

          {/* Stats */}
          <section className={ui.card}>
            <h2 className={ui.cardTitle}>📊 {t('stats_title')}</h2>
            {history.length === 0 ? (
              <p className={s.empty_msg}>{t('empty_stats')}</p>
            ) : (
              <>
                <div className={s.stats_grid}>
                  <div className={s.stat_card}>
                    <div className={s.stat_label}>{t('stats_total_sessions')}</div>
                    <div className={s.stat_value}>{stats.totalSessions}</div>
                  </div>
                  <div className={s.stat_card}>
                    <div className={s.stat_label}>{t('stats_best_level')}</div>
                    <div className={s.stat_value}>N={stats.bestN}</div>
                  </div>
                  <div className={s.stat_card}>
                    <div className={s.stat_label}>{t('stats_best_score')}</div>
                    <div className={s.stat_value}>{stats.bestScore}</div>
                  </div>
                  <div className={s.stat_card}>
                    <div className={s.stat_label}>{t('stats_avg_acc')}</div>
                    <div className={s.stat_value}>{stats.avgAccuracy}%</div>
                  </div>
                  <div className={s.stat_card} style={{ gridColumn: 'span 2' }}>
                    <div className={s.stat_label}>🔥 {t('stats_streak')}</div>
                    <div className={s.stat_value}>{stats.streak}</div>
                  </div>
                </div>
                <button onClick={resetStats} className={`${ui.button} ${ui.ghost} ${ui.sm} ${ui.block} ${s.stats_reset_btn}`}>{t('stats_reset')}</button>
              </>
            )}
          </section>
        </>
      )}

      {/* ── RUNNING ── */}
      {state === 'running' && (
        <section className={ui.card}>
          <div className={s.game_wrap}>
            <div className={s.progress_row}>
              <span>N = {n}</span>
              <span>{t('progress', { current: currentIdx + 1, total: sequence.length })}</span>
            </div>
            <div className={s.progress_bar_outer}>
              <div
                className={s.progress_bar_inner}
                style={{ width: `${((currentIdx + 1) / sequence.length) * 100}%` }}
              />
            </div>

            {/* Grid */}
            <div className={s.grid}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`${s.cell} ${showStim && currentStim?.position === i ? s.cell_active : ''}`}
                >
                  {showStim && currentStim?.position === i ? '●' : ''}
                </div>
              ))}
            </div>

            {/* Sound display */}
            <div className={s.sound_display}>
              {showStim && currentStim ? SOUND_LETTERS[currentStim.letterIdx] : '—'}
            </div>

            {/* Action buttons */}
            <div className={s.action_row}>
              <button
                className={`${s.action_btn} ${posPressed ? s.action_btn_pressed : ''}`}
                onClick={() => setPosPressed(true)}
                aria-label={t('btn_position')}
              >
                {t('btn_position')}
              </button>
              <button
                className={`${s.action_btn} ${s.action_btn_sound} ${soundPressed ? s.action_btn_pressed : ''}`}
                onClick={() => setSoundPressed(true)}
                aria-label={t('btn_sound')}
              >
                {t('btn_sound')}
              </button>
            </div>

            <p className={s.shortcut_hint}>{t('shortcut_hint')}</p>

            <button className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={stopSession}>
              {t('stop_button')}
            </button>
          </div>
        </section>
      )}

      {/* ── FINISHED ── */}
      {state === 'finished' && lastResult && (
        <section className={s.result_card}>
          <p className={s.result_title}>{t('result_title')}</p>
          <p className={s.result_score}>{lastResult.score}</p>
          <p className={s.result_accuracy}>
            {t('result_accuracy')}: {Math.round((lastResult.posAcc + lastResult.soundAcc) / 2)}%
          </p>

          <div className={s.result_details}>
            <div className={s.result_detail_item}>
              <div className={s.result_detail_label}>{t('result_pos_acc')}</div>
              <div className={s.result_detail_value}>{lastResult.posAcc}%</div>
            </div>
            <div className={s.result_detail_item}>
              <div className={s.result_detail_label}>{t('result_sound_acc')}</div>
              <div className={s.result_detail_value}>{lastResult.soundAcc}%</div>
            </div>
          </div>

          <div className={s.result_recommendation}>
            {t(recommendationKey, { n: nextN })}
            {!adaptive && nextN !== lastResult.n && (
              <div style={{ fontSize: '0.78rem', marginTop: '0.4rem', color: 'rgba(212,175,55,0.85)', fontWeight: 500 }}>
                {isKo
                  ? '※ 어댑티브 OFF — 다시 도전 시 N은 직접 조절하세요'
                  : '※ Adaptive OFF — manually change N before retrying'}
              </div>
            )}
          </div>

          <div className={s.result_actions}>
            <button
              className={s.action_again_btn}
              onClick={() => { setState('setup'); setLastResult(null); }}
              aria-label={t('result_again')}
            >
              {t('result_again')}
            </button>
            <button
              className={s.action_share_btn}
              onClick={() => {
                const txt = `${t('title')} — ${t('result_score')}: ${lastResult.score} | N=${lastResult.n} | ${t('result_accuracy')}: ${Math.round((lastResult.posAcc + lastResult.soundAcc) / 2)}%`;
                try {
                  navigator.clipboard.writeText(txt);
                  alert(isKo ? '클립보드에 복사됨!' : 'Copied to clipboard!');
                } catch { /* ignore */ }
              }}
              aria-label={t('result_share')}
            >
              {t('result_share')}
            </button>
          </div>
        </section>
      )}

      {/* Tutorial modal */}
      {showTutorial && showTutorialOnce && (
        <div className={s.modal_backdrop} onClick={closeTutorial}>
          <div className={s.modal_card} onClick={(e) => e.stopPropagation()}>
            <p className={s.modal_title}>{t('tutorial_title')}</p>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={s.modal_step}>
                <div className={s.modal_step_num}>{i}</div>
                <div>{t(`tutorial_step_${i}` as 'tutorial_step_1')}</div>
              </div>
            ))}
            <button className={`${ui.button} ${ui.primary} ${ui.block} ${s.modal_close_btn}`} onClick={closeTutorial}>
              {t('tutorial_close')}
            </button>
          </div>
        </div>
      )}

      {/* 표준 하단 섹션 */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/lifestyle/brain-boost" />

      {seo}
    </div>
  );
}
