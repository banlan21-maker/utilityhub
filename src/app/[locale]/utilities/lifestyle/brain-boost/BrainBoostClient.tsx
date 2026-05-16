'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Brain } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './brain-boost.module.css';

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

export default function BrainBoostClient() {
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
  const [isMounted, setIsMounted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialOnce, setShowTutorialOnce] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Result ──
  const [lastResult, setLastResult] = useState<SessionStats | null>(null);

  // Mount
  useEffect(() => {
    setIsMounted(true);
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
    // 채점
    let posCorrect = 0, posTotal = 0;
    let soundCorrect = 0, soundTotal = 0;

    for (let i = 0; i < sequence.length; i++) {
      if (i < n) continue; // 첫 N개는 비교 불가
      const isPosMatch = sequence[i].position === sequence[i - n].position;
      const isSoundMatch = sequence[i].letterIdx === sequence[i - n].letterIdx;
      const resp = responsesRef.current[i] ?? { pos: false, sound: false };

      posTotal++;
      soundTotal++;
      if (isPosMatch === resp.pos) posCorrect++;
      if (isSoundMatch === resp.sound) soundCorrect++;
    }

    const posAcc = posTotal > 0 ? Math.round((posCorrect / posTotal) * 100) : 0;
    const soundAcc = soundTotal > 0 ? Math.round((soundCorrect / soundTotal) * 100) : 0;
    const score = Math.round(((posAcc + soundAcc) / 2) * (n * 10) / 10); // n에 따른 가중치

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

    // 어댑티브 N 조정
    if (adaptive) {
      const avgAcc = (posAcc + soundAcc) / 2;
      if (avgAcc >= 80) setN((prev) => Math.min(prev + 1, 9));
      else if (avgAcc < 50) setN((prev) => Math.max(prev - 1, 1));
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

  // 다음 N 추천 메시지
  const nextN = useMemo(() => {
    if (!lastResult) return n;
    const avg = (lastResult.posAcc + lastResult.soundAcc) / 2;
    if (avg >= 80) return Math.min(lastResult.n + 1, 9);
    if (avg < 50) return Math.max(lastResult.n - 1, 1);
    return lastResult.n;
  }, [lastResult, n]);

  const recommendationKey: 'result_level_up' | 'result_level_down' | 'result_level_same' = useMemo(() => {
    if (!lastResult) return 'result_level_same';
    const avg = (lastResult.posAcc + lastResult.soundAcc) / 2;
    if (avg >= 80) return 'result_level_up';
    if (avg < 50) return 'result_level_down';
    return 'result_level_same';
  }, [lastResult]);

  const currentStim = currentIdx >= 0 && currentIdx < sequence.length ? sequence[currentIdx] : null;

  if (!isMounted) return null;

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.25rem',
          }}
        >
          <Brain size={40} color="#065f46" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
        <p className={s.tagline}>{t('tagline')}</p>
      </header>

      {/* ── SETUP ── */}
      {state === 'setup' && (
        <>
          <section className={s.panel}>
            <h2 className={s.section_title}>⚙️ {t('setup_title')}</h2>

            <div className={s.field}>
              <label className={s.field_label}>{t('level_label')}</label>
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

            <div className={s.field}>
              <label className={s.field_label}>{t('length_label')}</label>
              <div className={s.option_row}>
                {(['short', 'standard', 'long'] as SessionLen[]).map((k) => (
                  <button
                    key={k}
                    className={`${s.option_btn} ${sessionLen === k ? s.option_btn_active : ''}`}
                    onClick={() => setSessionLen(k)}
                    aria-label={t(`length_${k}` as 'length_short')}
                  >
                    {t(`length_${k}` as 'length_short')}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.field}>
              <label className={s.field_label}>{t('stim_interval')}</label>
              <div className={s.option_row}>
                {(['fast', 'normal', 'slow'] as Interval[]).map((k) => (
                  <button
                    key={k}
                    className={`${s.option_btn} ${interval === k ? s.option_btn_active : ''}`}
                    onClick={() => setIntervalKey(k)}
                    aria-label={t(`stim_interval_${k}` as 'stim_interval_fast')}
                  >
                    {t(`stim_interval_${k}` as 'stim_interval_fast')}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.field}>
              <label className={s.field_label}>{t('sound_label')}</label>
              <div className={s.toggle_row}>
                <button
                  className={`${s.toggle_btn} ${soundOn ? s.toggle_btn_active : ''}`}
                  onClick={() => setSoundOn(true)}
                >
                  {t('sound_on')}
                </button>
                <button
                  className={`${s.toggle_btn} ${!soundOn ? s.toggle_btn_active : ''}`}
                  onClick={() => setSoundOn(false)}
                >
                  {t('sound_off')}
                </button>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.field_label}>{t('adaptive_label')}</label>
              <div className={s.toggle_row}>
                <button
                  className={`${s.toggle_btn} ${adaptive ? s.toggle_btn_active : ''}`}
                  onClick={() => setAdaptive(true)}
                >
                  {t('adaptive_on')}
                </button>
                <button
                  className={`${s.toggle_btn} ${!adaptive ? s.toggle_btn_active : ''}`}
                  onClick={() => setAdaptive(false)}
                >
                  {t('adaptive_off')}
                </button>
              </div>
            </div>

            <button className={s.start_btn} onClick={startSession} aria-label={t('start_button')}>
              {t('start_button')}
            </button>
            <button className={s.tutorial_link} onClick={() => setShowTutorial(true)}>
              {t('tutorial_button')}
            </button>
          </section>

          {/* Stats */}
          <section className={s.panel}>
            <h2 className={s.section_title}>📊 {t('stats_title')}</h2>
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
                <button onClick={resetStats} className={s.stats_reset_btn}>{t('stats_reset')}</button>
              </>
            )}
          </section>
        </>
      )}

      {/* ── RUNNING ── */}
      {state === 'running' && (
        <section className={s.panel}>
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

            <button className={s.stop_btn} onClick={stopSession}>
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
            <button className={s.modal_close_btn} onClick={closeTutorial}>
              {t('tutorial_close')}
            </button>
          </div>
        </div>
      )}

      {/* 표준 하단 섹션 */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/lifestyle/brain-boost" />
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '브레인 부스트 N-Back이란 무엇인가요?',
          description:
            '브레인 부스트 N-Back은 듀얼 N-Back(Dual N-Back) 인지 훈련 기법을 기반으로 한 무료 작업 기억력 훈련 게임입니다. 1990년대 후반 인지심리학자 Susanne Jaeggi의 연구 이후, N-Back 훈련은 작업 기억(working memory)과 유동적 지능(fluid intelligence) 향상에 효과가 있다고 보고된 대표적인 신경 가소성 기반 훈련입니다. 3×3 격자에서 시각 자극(위치)과 청각 자극(알파벳 음)이 동시에 제시되면, 사용자는 N번 전의 자극과 위치/소리가 일치하는지를 빠르게 판단해야 합니다. 어댑티브 난이도 시스템이 80% 이상 정확도면 N을 한 단계 올리고, 50% 미만이면 한 단계 낮춰 항상 도전 한계에 머물도록 합니다. 모든 점수와 이력은 브라우저 LocalStorage에 저장되어 서버 전송 없이 안전하게 관리됩니다.',
          useCases: [
            { icon: '🧠', title: '작업 기억력 강화', desc: '단기간 정보를 머릿속에 유지하면서 다른 작업을 동시에 수행하는 능력을 향상시켜 학습·업무 효율을 높입니다.' },
            { icon: '🎯', title: '집중력 훈련', desc: '시각과 청각을 동시에 추적하는 듀얼 태스킹이 전두엽을 자극해 장시간 집중 유지력을 키웁니다.' },
            { icon: '👴', title: '디지털 치매 예방', desc: '나이가 들수록 감소하는 작업 기억력을 매일 5~15분 훈련으로 유지·강화해 노화에 따른 인지 저하를 늦춥니다.' },
            { icon: '📈', title: '학습 능력 향상', desc: '수험생, 직장인, 시니어 모두에게 권장되는 신경 가소성 훈련 — 꾸준한 N-Back 훈련은 IQ 테스트의 일부 측정값 상승과 연관성이 있다는 연구 결과가 있습니다.' },
          ],
          steps: [
            { step: '튜토리얼 확인', desc: '첫 방문 시 N=1 시범 튜토리얼이 자동으로 표시됩니다. 자극 인식 → 응답 방식 → 단축키를 익힌 뒤 본 세션으로 진입하세요.' },
            { step: '세션 설정', desc: 'N 레벨(1~9), 세션 길이(짧음/표준/긴), 자극 간격(2~3초), 사운드 ON/OFF, 어댑티브 모드를 설정합니다. 초보자는 N=2, 표준 길이, 보통 속도 권장.' },
            { step: '훈련 시작', desc: '격자 한 칸에 점이 표시되고 동시에 소리가 재생됩니다. N번 전과 위치가 같으면 [위치 일치] (단축키 A), 소리가 같으면 [소리 일치] (단축키 L) 버튼을 누르세요. 둘 다 같으면 두 버튼 모두, 다르면 아무것도 누르지 않습니다.' },
            { step: '결과 확인 및 반복', desc: '세션 종료 후 위치/소리 정확도와 코그니티브 스코어가 표시됩니다. 어댑티브 모드면 다음 세션의 N이 자동 조정됩니다. 매일 1~2회, 최소 2주 꾸준히 훈련해야 효과가 나타납니다.' },
          ],
          faqs: [
            { q: 'N-Back 훈련이 정말 머리가 좋아지나요?', a: 'Jaeggi 등의 2008년 PNAS 연구는 듀얼 N-Back 훈련이 유동적 지능 측정값을 향상시킨다고 보고했으며, 이후 복제 연구에서는 효과가 작업 기억 자체에 더 국한된다는 비판도 있습니다. 다만 작업 기억력 자체의 향상은 비교적 일관되게 보고되어, 학습·집중 분야에서는 도움이 됩니다.' },
            { q: '하루 얼마나 훈련해야 효과가 있나요?', a: '연구에서는 하루 20분, 주 5일, 최소 2~4주 훈련을 권장합니다. 본 도구에서는 매일 1~3 세션(약 5~15분)을 꾸준히 실행하는 것이 좋습니다. 휴식 없는 과도한 훈련은 오히려 정확도를 떨어뜨립니다.' },
            { q: '어댑티브 난이도는 어떻게 동작하나요?', a: '평균 정확도(위치+소리)/2가 80% 이상이면 다음 세션에서 N을 +1, 50% 미만이면 -1로 자동 조정합니다. 항상 자신의 한계 근처에서 훈련하도록 도와 효과를 극대화합니다. 수동 조절을 원하면 어댑티브를 OFF로 설정하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '본 결과는 본인 훈련 추적 참고용입니다. 의학적 진단·치료에 사용할 수 없으며, 인지 저하·기억력 문제가 의심되면 반드시 전문의와 상담하세요.' },
          ],
        }}
        en={{
          title: 'What is Brain Boost N-Back?',
          description:
            'Brain Boost N-Back is a free working memory training game based on the Dual N-Back cognitive training paradigm. Following the late-1990s research of cognitive psychologist Susanne Jaeggi, N-Back has been reported to improve working memory and fluid intelligence — making it one of the most well-known neuroplasticity-based exercises. In a 3×3 grid, a visual stimulus (position) and an auditory stimulus (letter tone) are presented simultaneously every few seconds, and you must quickly decide whether each matches the stimulus from N trials ago. An adaptive difficulty system raises N by one when your accuracy hits 80%+ and drops it by one when accuracy falls below 50%, keeping you near your cognitive limit. All scores and history are stored locally in your browser via LocalStorage — no server transfer.',
          useCases: [
            { icon: '🧠', title: 'Working Memory Boost', desc: 'Improve your ability to hold information in mind while juggling other tasks — directly impacting learning and work efficiency.' },
            { icon: '🎯', title: 'Focus Training', desc: 'Dual-tracking visual and audio stimuli activates the prefrontal cortex and builds long-duration concentration stamina.' },
            { icon: '👴', title: 'Cognitive Aging Defense', desc: 'Daily 5–15 minute sessions help maintain working memory that naturally declines with age — slowing cognitive decline.' },
            { icon: '📈', title: 'Learning Performance', desc: 'Recommended for students, knowledge workers, and seniors — sustained N-Back training has been linked to gains in some IQ subtests.' },
          ],
          steps: [
            { step: 'Watch the Tutorial', desc: 'On first visit, an N=1 tutorial appears automatically. Learn how stimuli are presented, how to respond, and the keyboard shortcuts before starting a real session.' },
            { step: 'Configure the Session', desc: 'Choose N (1–9), session length (short/standard/long), stimulus interval (2–3s), sound on/off, and adaptive mode. Beginners: start with N=2, standard length, normal speed.' },
            { step: 'Start Training', desc: 'A cell lights up while a letter tone plays. If the position matches the stimulus from N trials ago, press [Position Match] (key A). If the sound matches, press [Sound Match] (key L). Press both if both match, none if neither.' },
            { step: 'Review & Repeat', desc: 'After each session, your position/sound accuracy and cognitive score are displayed. With adaptive mode on, N auto-adjusts for the next session. Train daily for at least 2 weeks to see meaningful gains.' },
          ],
          faqs: [
            { q: 'Does N-Back training really make you smarter?', a: 'Jaeggi et al. (2008, PNAS) reported that Dual N-Back training improves fluid intelligence; later replication studies have been more cautious, suggesting effects may be more limited to working memory itself. The working memory benefit is fairly consistent across studies and is useful for learning and focus.' },
            { q: 'How much should I train per day?', a: 'Research suggests 20 minutes/day, 5 days/week, for at least 2–4 weeks. Here, doing 1–3 sessions daily (about 5–15 minutes) is ideal. Excessive sessions without rest actually hurt accuracy.' },
            { q: 'How does adaptive difficulty work?', a: 'When your average accuracy (position + sound) / 2 hits 80% or more, the next session jumps to N+1. Below 50%, it drops to N-1. This keeps you training near your cognitive limit, where neuroplastic gains are strongest. Turn adaptive off if you prefer manual control.' },
            { q: 'Can I use this result as official data?', a: 'These results are for personal training tracking. They are not a clinical assessment. If you suspect cognitive decline or memory issues, please consult a medical professional.' },
          ],
        }}
      />
    </div>
  );
}
