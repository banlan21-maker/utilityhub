'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Wind } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './apnea-trainer.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
type TrainingMode = 'co2' | 'o2';
type Phase = 'idle' | 'warmup' | 'breathe' | 'hold' | 'recovery' | 'done';

interface TableRow { round: number; holdSec: number; restSec: number; }
interface HistoryEntry { date: string; mode: TrainingMode; completedRounds: number; totalRounds: number; pb: number; }

const ROUNDS = 8;
const WARMUP_SEC = 120;
const LS_PB = 'ap-pb-v1';
const LS_HIST = 'ap-hist-v1';

// ─── Table generators ─────────────────────────────────────────────────────────
function buildCO2Table(pbSec: number): TableRow[] {
  const hold = Math.round(pbSec * 0.5);
  return Array.from({ length: ROUNDS }, (_, i) => ({
    round: i + 1,
    holdSec: hold,
    restSec: Math.max(15, 120 - i * 15),
  }));
}

function buildO2Table(pbSec: number): TableRow[] {
  const maxHold = Math.round(pbSec * 0.85);
  const minHold = 60;
  return Array.from({ length: ROUNDS }, (_, i) => ({
    round: i + 1,
    holdSec: Math.round(minHold + (maxHold - minHold) * (i / (ROUNDS - 1))),
    restSec: 120,
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const parsePB = (raw: string): number => {
  // accept "m:ss" or plain seconds
  if (raw.includes(':')) {
    const [m, s] = raw.split(':').map(Number);
    return (m || 0) * 60 + (s || 0);
  }
  return Number(raw) || 0;
};

// ─── Audio helpers ────────────────────────────────────────────────────────────
function beep(ctx: AudioContext, freq = 880, dur = 0.15, vol = 0.5) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function speak(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

// ─── SVG Ring ────────────────────────────────────────────────────────────────
const RING_R = 90;
const RING_CIRC = 2 * Math.PI * RING_R;

function Ring({ progress, phase }: { progress: number; phase: Phase }) {
  const offset = RING_CIRC * (1 - Math.max(0, Math.min(1, progress)));
  const colorClass = phase === 'warmup' ? s.ap_ring_warmup
    : phase === 'breathe' ? s.ap_ring_breathe
    : phase === 'hold' ? s.ap_ring_hold
    : phase === 'recovery' ? s.ap_ring_recovery
    : s.ap_ring_done;
  return (
    <svg width="220" height="220" aria-hidden="true">
      <circle cx="110" cy="110" r={RING_R} fill="none" strokeWidth="10" className={s.ap_ring_bg} />
      <circle cx="110" cy="110" r={RING_R} fill="none" strokeWidth="10"
        strokeDasharray={RING_CIRC} strokeDashoffset={offset}
        className={`${s.ap_ring_fill} ${colorClass}`} />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApneaTrainerClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const lang = isKo ? 'ko-KR' : 'en-US';

  const [pbInput, setPbInput] = useState('1:30');
  const [mode, setMode] = useState<TrainingMode>('co2');
  const [table, setTable] = useState<TableRow[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(1);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [flash, setFlash] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pbWarn, setPbWarn] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const roundRef = useRef(0);
  const timeRef = useRef(0);
  const tableRef = useRef<TableRow[]>([]);
  const completedRef = useRef(0);
  const pbSecRef = useRef(90);

  // Sync refs
  phaseRef.current = phase;
  roundRef.current = currentRound;
  tableRef.current = table;
  completedRef.current = completedRounds;

  // Load history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_PB);
      if (saved) setPbInput(saved);
      const hist = JSON.parse(localStorage.getItem(LS_HIST) || '[]');
      setHistory(hist);
    } catch { /* ignore */ }
  }, []);

  // Build table on mode/pb change
  useEffect(() => {
    const pb = parsePB(pbInput);
    setPbWarn(pb < 60);
    if (pb >= 60) {
      setTable(mode === 'co2' ? buildCO2Table(pb) : buildO2Table(pb));
    }
  }, [pbInput, mode]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 450);
  };

  const vibrate = (ms: number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
  };

  const alertTransition = useCallback((voiceText: string) => {
    const ctx = getAudioCtx();
    beep(ctx, 880, 0.18);
    setTimeout(() => beep(ctx, 1200, 0.12), 200);
    triggerFlash();
    vibrate([100, 50, 100]);
    speak(voiceText, lang);
  }, [lang]);

  const stopAll = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase('idle');
    setCurrentRound(0);
    setCompletedRounds(0);
    timeRef.current = 0;
    window.speechSynthesis?.cancel();
  }, []);

  const saveHistory = useCallback((completed: number, pbSec: number) => {
    const entry: HistoryEntry = {
      date: new Date().toLocaleDateString(isKo ? 'ko-KR' : 'en-US'),
      mode,
      completedRounds: completed,
      totalRounds: ROUNDS,
      pb: pbSec,
    };
    try {
      const prev: HistoryEntry[] = JSON.parse(localStorage.getItem(LS_HIST) || '[]');
      const next = [entry, ...prev].slice(0, 10);
      localStorage.setItem(LS_HIST, JSON.stringify(next));
      setHistory(next);
    } catch { /* ignore */ }
  }, [mode, isKo]);

  // Countdown announcement: fires at 5s left
  const announceCountdown = useCallback((remaining: number, nextPhaseVoice: string) => {
    if (remaining === 5) {
      const ctx = getAudioCtx();
      beep(ctx, 660, 0.1);
      speak(isKo ? `5초 후 ${nextPhaseVoice}` : `${nextPhaseVoice} in 5`, lang);
    }
    if (remaining <= 3 && remaining > 0) {
      beep(getAudioCtx(), 440 + remaining * 50, 0.08);
    }
  }, [isKo, lang]);

  const startTraining = useCallback(() => {
    const pb = parsePB(pbInput);
    if (pb < 60) return;
    pbSecRef.current = pb;
    try { localStorage.setItem(LS_PB, pbInput); } catch { /* ignore */ }

    const tbl = mode === 'co2' ? buildCO2Table(pb) : buildO2Table(pb);
    setTable(tbl);
    tableRef.current = tbl;
    setCompletedRounds(0);
    completedRef.current = 0;
    setCurrentRound(0);
    roundRef.current = 0;

    // Start with warmup
    setPhase('warmup');
    phaseRef.current = 'warmup';
    setTimeLeft(WARMUP_SEC);
    setTotalTime(WARMUP_SEC);
    timeRef.current = WARMUP_SEC;
    alertTransition(isKo ? '웜업 시작. 편안하게 호흡하세요.' : 'Warm up. Breathe comfortably.');

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);

      const cur = phaseRef.current;
      const rnd = roundRef.current;
      const tbl2 = tableRef.current;

      // Countdown announcements
      if (cur === 'warmup') {
        announceCountdown(timeRef.current, isKo ? '훈련 시작' : 'training starts');
      } else if (cur === 'breathe') {
        announceCountdown(timeRef.current, isKo ? '숨 참기' : 'hold');
      } else if (cur === 'hold') {
        announceCountdown(timeRef.current, isKo ? '회복 호흡' : 'recovery');
      } else if (cur === 'recovery') {
        announceCountdown(timeRef.current, isKo ? '다음 숨 참기' : 'next hold');
      }

      if (timeRef.current > 0) return;

      // Phase transition
      if (cur === 'warmup') {
        // Start round 1 breathe-up (10s)
        phaseRef.current = 'breathe';
        setPhase('breathe');
        timeRef.current = 10;
        setTimeLeft(10);
        setTotalTime(10);
        setCurrentRound(1);
        roundRef.current = 1;
        alertTransition(isKo ? '1라운드. 마지막 호흡.' : 'Round 1. Final breath.');
      } else if (cur === 'breathe') {
        // Start hold
        const row = tbl2[rnd - 1];
        phaseRef.current = 'hold';
        setPhase('hold');
        timeRef.current = row.holdSec;
        setTimeLeft(row.holdSec);
        setTotalTime(row.holdSec);
        alertTransition(isKo ? '숨 참기 시작!' : 'Hold now!');
      } else if (cur === 'hold') {
        // Hold done → recovery or done
        const done = completedRef.current + 1;
        completedRef.current = done;
        setCompletedRounds(done);

        if (rnd >= ROUNDS) {
          // All rounds complete
          phaseRef.current = 'done';
          setPhase('done');
          clearInterval(tickRef.current!);
          alertTransition(isKo ? '훈련 완료! 수고하셨습니다!' : 'Training complete! Well done!');
          saveHistory(done, pbSecRef.current);
          return;
        }
        // Recovery
        const row = tbl2[rnd - 1];
        phaseRef.current = 'recovery';
        setPhase('recovery');
        timeRef.current = row.restSec;
        setTimeLeft(row.restSec);
        setTotalTime(row.restSec);
        alertTransition(isKo ? '회복 호흡. 편안하게 쉬세요.' : 'Recovery. Breathe easy.');
      } else if (cur === 'recovery') {
        // Next round breathe-up
        const nextRnd = rnd + 1;
        roundRef.current = nextRnd;
        setCurrentRound(nextRnd);
        phaseRef.current = 'breathe';
        setPhase('breathe');
        timeRef.current = 10;
        setTimeLeft(10);
        setTotalTime(10);
        alertTransition(isKo ? `${nextRnd}라운드. 마지막 호흡.` : `Round ${nextRnd}. Final breath.`);
      }
    }, 1000);
  }, [pbInput, mode, alertTransition, announceCountdown, isKo, saveHistory]);

  const progress = totalTime > 0 ? timeLeft / totalTime : 0;

  const phaseLabelKo: Record<Phase, string> = {
    idle: '',
    warmup: '🌊 워밍업 호흡',
    breathe: '💨 마지막 호흡',
    hold: '🫁 숨 참기',
    recovery: '💛 회복 호흡',
    done: '✅ 훈련 완료',
  };
  const phaseLabelEn: Record<Phase, string> = {
    idle: '',
    warmup: '🌊 Warm-up',
    breathe: '💨 Final Breath',
    hold: '🫁 Hold',
    recovery: '💛 Recovery',
    done: '✅ Done!',
  };
  const phaseLabel = isKo ? phaseLabelKo[phase] : phaseLabelEn[phase];
  const phaseCls = phase === 'warmup' ? s.ap_phase_warmup
    : phase === 'breathe' ? s.ap_phase_breathe
    : phase === 'hold' ? s.ap_phase_hold
    : phase === 'recovery' ? s.ap_phase_recovery
    : s.ap_phase_done;

  const isRunning = phase !== 'idle' && phase !== 'done';

  const FAQ_KO = [
    { q: 'CO2 테이블과 O2 테이블의 차이는 무엇인가요?', a: 'CO2 테이블은 이산화탄소 상승으로 인한 호흡 충동에 적응하는 훈련입니다. 숨 참기 시간을 고정하고 휴식 시간을 줄여가며 CO₂ 내성을 높입니다. O2 테이블은 저산소 상태에서 신체가 효율적으로 작동하도록 적응시키는 훈련으로, 휴식 시간을 고정하고 숨 참기 시간을 점진적으로 늘려 실제 PB(개인 최고 기록)의 80~90%까지 도달합니다. 두 테이블 모두 물속이 아닌 드라이(육상) 환경에서 진행합니다.' },
    { q: '드라이 트레이닝은 얼마나 자주 해야 하나요?', a: '주 3~4회를 권장합니다. CO2 테이블과 O2 테이블을 교차하여 진행하면 적응 효과가 가장 좋습니다. 매일 훈련하면 오히려 과부하로 적응 효과가 줄어들 수 있습니다. 훈련 후에는 충분한 수분 보충과 휴식을 취하고, 이상 증상이 느껴지면 즉시 중단하고 전문가와 상담하세요.' },
    { q: '음성 가이드가 작동하지 않아요', a: 'Web Speech API는 브라우저의 자동 재생 정책에 따라 사용자가 처음 화면을 클릭(상호작용)한 후부터 정상 작동합니다. Safari 브라우저에서는 시스템 설정 > 손쉬운 사용 > 음성 항목도 확인해 보세요. 그래도 작동하지 않으면 Chrome 최신 버전 사용을 권장합니다. 비프음과 시각 플래시는 음성과 별개로 항상 작동합니다.' },
    { q: '이 앱의 결과를 공식 훈련 자료로 사용해도 되나요?', a: '본 앱의 훈련 테이블은 프리다이빙 커뮤니티에서 통용되는 일반적인 가이드라인을 기반으로 하며, 참고용으로만 제공됩니다. 개인의 건강 상태, 훈련 수준, 환경에 따라 조정이 필요할 수 있습니다. 프리다이빙 초보자는 반드시 공인 프리다이빙 강사의 지도하에 훈련을 시작하시기 바랍니다.' },
  ];
  const FAQ_EN = [
    { q: 'What is the difference between CO2 and O2 tables?', a: 'CO2 tables train your tolerance to the rising CO₂ urge-to-breathe by keeping hold time fixed and progressively reducing rest time. O2 tables adapt your body to hypoxia by keeping rest time fixed and gradually increasing hold time up to 80–90% of your PB. Both are done dry (on land), never in water alone.' },
    { q: 'How often should I do dry training?', a: 'Three to four sessions per week is recommended. Alternating CO2 and O2 table sessions produces the best adaptation. Daily training may cause overtraining and reduce adaptation gains. Stay well hydrated and rest adequately after each session. Stop immediately if you feel unusual symptoms.' },
    { q: 'The voice guide is not working', a: 'Web Speech API requires a user interaction (button click) before it can produce audio — this is a browser security policy. On Safari, also check System Preferences > Accessibility > Speech settings. If the issue persists, Chrome is recommended. The beep sounds and visual flash work independently and are always active.' },
    { q: 'Can I use this app as official training documentation?', a: 'The training tables are based on widely used community guidelines and are provided for reference only. Individual health, training level, and environment may require adjustments. Beginners should always train under the supervision of a certified freediving instructor before attempting breath-hold exercises.' },
  ];

  return (
    <div className={s.ap_wrap}>
      {flash && <div className={s.ap_flash} aria-hidden="true" />}
      <NavigationActions />

      {/* Hero */}
      <div className={s.ap_hero}>
        <div className={s.ap_badge}>🫁 Apnea Pro</div>
        <h1 className={s.ap_title}>{isKo ? 'Apnea Pro 드라이 트레이닝' : 'Apnea Pro Dry Training'}</h1>
        <p className={s.ap_subtitle}>
          {isKo
            ? 'CO2·O2 테이블 자동 생성 | 음성 가이드 | 비프음 | 시각 플래시'
            : 'Auto CO2 & O2 tables · Voice guide · Beep · Visual flash'}
        </p>
      </div>

      <div className={s.ap_container}>

        {/* ── IDLE / SETUP VIEW ── */}
        {phase === 'idle' && (
          <>
            {/* PB Input */}
            <div className={s.ap_section}>
              <div className={s.ap_card}>
                <p className={s.ap_card_title}>🏆 {isKo ? '나의 PB (개인 최고 기록)' : 'My Personal Best (PB)'}</p>
                <div className={s.ap_pb_row}>
                  <input
                    className={s.ap_pb_input}
                    value={pbInput}
                    onChange={e => setPbInput(e.target.value)}
                    placeholder="예: 2:30"
                    aria-label={isKo ? 'PB 입력 (분:초)' : 'Enter PB (m:ss)'}
                  />
                </div>
                <p className={s.ap_pb_hint}>{isKo ? '분:초 형식으로 입력 (예: 2:30 = 2분 30초)' : 'Format m:ss e.g. 2:30 = 2 min 30 sec'}</p>
                {pbWarn && <p className={s.ap_pb_warn}>⚠️ {isKo ? 'PB는 최소 1분 이상이어야 합니다' : 'PB must be at least 1 minute'}</p>}
              </div>

              {/* Mode Selection */}
              <div className={s.ap_card}>
                <p className={s.ap_card_title}>📋 {isKo ? '훈련 모드 선택' : 'Training Mode'}</p>
                <div className={s.ap_mode_tabs}>
                  <button
                    onClick={() => setMode('co2')}
                    className={`${s.ap_mode_btn} ${mode === 'co2' ? s.ap_mode_active : ''}`}
                    aria-pressed={mode === 'co2'}
                  >
                    💨 {isKo ? 'CO₂ 내성 테이블' : 'CO₂ Tolerance'}
                  </button>
                  <button
                    onClick={() => setMode('o2')}
                    className={`${s.ap_mode_btn} ${mode === 'o2' ? s.ap_mode_active : ''}`}
                    aria-pressed={mode === 'o2'}
                  >
                    🫁 {isKo ? 'O₂ 적응 테이블' : 'O₂ Adaptation'}
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {mode === 'co2'
                    ? (isKo ? '숨 참기 = PB × 50% 고정 / 휴식은 2:00부터 매 라운드 15초씩 감소' : 'Hold = PB×50% fixed / Rest decreases 15s each round from 2:00')
                    : (isKo ? '휴식 = 2:00 고정 / 숨 참기는 1:00부터 PB × 85%까지 점진적 증가' : 'Rest = 2:00 fixed / Hold increases from 1:00 up to PB×85%')}
                </p>
              </div>

              {/* Table Preview */}
              {table.length > 0 && !pbWarn && (
                <div className={s.ap_card}>
                  <p className={s.ap_card_title}>📊 {isKo ? '훈련 테이블 미리보기' : 'Table Preview'}</p>
                  <div className={s.ap_table_wrap}>
                    <table className={s.ap_table} aria-label={isKo ? '훈련 테이블' : 'Training table'}>
                      <thead>
                        <tr>
                          <th>{isKo ? '라운드' : 'Round'}</th>
                          <th>{isKo ? '숨 참기' : 'Hold'}</th>
                          <th>{isKo ? '휴식' : 'Rest'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map(r => (
                          <tr key={r.round}>
                            <td>{r.round}</td>
                            <td>{fmtTime(r.holdSec)}</td>
                            <td>{fmtTime(r.restSec)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button
                className={s.ap_btn_start}
                onClick={startTraining}
                disabled={pbWarn || table.length === 0}
                aria-label={isKo ? '훈련 시작' : 'Start Training'}
              >
                🫁 {isKo ? '훈련 시작 (워밍업 2분 포함)' : 'Start Training (2-min warm-up)'}
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className={s.ap_card}>
                <p className={s.ap_card_title}>🕒 {isKo ? '최근 훈련 이력' : 'Recent History'}</p>
                <div className={s.ap_hist_list}>
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} className={s.ap_hist_item}>
                      <span className={s.ap_hist_date}>{h.date}</span>
                      <span className={s.ap_hist_mode}>{h.mode.toUpperCase()}</span>
                      <span className={s.ap_hist_rounds}>{h.completedRounds}/{h.totalRounds} {isKo ? '라운드' : 'rds'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PB {fmtTime(h.pb)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TRAINING VIEW ── */}
        {(isRunning || phase === 'done') && (
          <div className={s.ap_section}>
            {/* Phase label */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <p className={`${s.ap_phase_label} ${phaseCls}`}>{phaseLabel}</p>
              <p className={s.ap_round_info}>
                {phase !== 'warmup' && phase !== 'done' && (
                  <><strong>{isKo ? `${currentRound}라운드` : `Round ${currentRound}`}</strong> / {ROUNDS} &nbsp;|&nbsp; {isKo ? '완료' : 'Done'}: {completedRounds}</>
                )}
                {phase === 'warmup' && (isKo ? '편안하게 코로 호흡하며 이완하세요' : 'Relax and breathe calmly through your nose')}
                {phase === 'done' && (isKo ? `${completedRounds}라운드 완료! 수고하셨습니다 🎉` : `${completedRounds} rounds complete! Great work 🎉`)}
              </p>
            </div>

            {/* Ring Timer */}
            {phase !== 'done' && (
              <div className={s.ap_timer_wrap}>
                <div className={s.ap_ring}>
                  <Ring progress={progress} phase={phase} />
                  <span className={s.ap_time_num} aria-live="polite">{fmtTime(timeLeft)}</span>
                </div>
              </div>
            )}

            {/* Live table (current round highlighted) */}
            {phase !== 'warmup' && phase !== 'done' && table.length > 0 && (
              <div className={s.ap_card} style={{ marginBottom: '1rem' }}>
                <div className={s.ap_table_wrap}>
                  <table className={s.ap_table}>
                    <thead>
                      <tr>
                        <th>{isKo ? '라운드' : 'Rnd'}</th>
                        <th>{isKo ? '숨 참기' : 'Hold'}</th>
                        <th>{isKo ? '휴식' : 'Rest'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.map(r => (
                        <tr key={r.round} className={r.round === currentRound ? s.ap_table_cur : ''}>
                          <td>{r.round <= completedRounds ? '✅' : r.round === currentRound ? '▶' : r.round}</td>
                          <td>{fmtTime(r.holdSec)}</td>
                          <td>{fmtTime(r.restSec)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STOP / Restart */}
            {phase !== 'done' ? (
              <button className={s.ap_btn_stop} onClick={stopAll} aria-label={isKo ? '훈련 중단' : 'Stop Training'}>
                ■ STOP {isKo ? '훈련 중단' : 'Stop Training'}
              </button>
            ) : (
              <button className={s.ap_btn_start} onClick={() => setPhase('idle')} aria-label={isKo ? '새 훈련 시작' : 'New Training'}>
                🔄 {isKo ? '새 훈련 시작' : 'New Training'}
              </button>
            )}
          </div>
        )}

        {/* ── BOTTOM SECTIONS ── */}

        {/* 0-0. Share */}
        <ShareBar
          title={isKo ? 'Apnea Pro 드라이 트레이닝 마스터' : 'Apnea Pro Dry Training Master'}
          description={isKo ? '프리다이빙 CO2·O2 테이블 무료 드라이 훈련 앱' : 'Free freediving CO2 & O2 dry training app'}
        />

        {/* 0-1. Related Tools */}
        <RelatedTools toolId="lifestyle/apnea-trainer" />

        {/* 0-2. Ad */}
        <div style={{
          width: '100%', minHeight: 90, background: 'rgba(248,250,252,0.06)',
          border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#475569', fontSize: '0.8rem', margin: '1.5rem 0',
        }}>AD</div>

        {/* SEO Section */}
        <SeoSection
          ko={{
            title: 'Apnea Pro 드라이 트레이닝 마스터란?',
            description: 'Apnea Pro는 프리다이빙 입문자부터 고급 다이버까지 누구나 과학적으로 설계된 드라이 스태틱(육상 정적 숨 참기) 훈련을 체계적으로 수행할 수 있도록 돕는 전문 웹 앱입니다. CO2 내성 테이블과 O2 적응 테이블을 개인의 PB(최고 기록)에 맞춰 자동으로 생성하며, 음성 가이드(Web Speech API), 비프음(AudioContext), 시각적 플래시, 진동 등 4가지 알림 시스템을 동시에 활용하여 눈을 감고 훈련 중에도 단계 전환을 정확히 인지할 수 있습니다. 2분간의 워밍업 호흡 단계가 자동으로 포함되며, 훈련 이력이 로컬 저장소에 기록되어 진행 상황을 추적할 수 있습니다. 별도 앱 설치 없이 브라우저에서 즉시 사용 가능하며, 수영장에서 코치 없이 혼자 드라이 훈련할 때 이상적인 훈련 파트너입니다.',
            useCases: [
              { icon: '💨', title: 'CO₂ 내성 훈련', desc: '숨 참기 충동에 강해지고 싶은 프리다이버가 이산화탄소 내성을 체계적으로 기르기 위해 CO2 테이블을 활용할 수 있습니다. 8라운드 동안 휴식 시간을 15초씩 줄여가며 CO₂ 저항력을 점진적으로 향상시킵니다.' },
              { icon: '🫁', title: 'O₂ 적응 훈련', desc: '저산소 내성을 높이고 실제 다이빙 시 더 오랫동안 안전하게 숨을 참기 위해 O2 테이블을 활용합니다. 휴식 시간을 2분으로 고정하고 숨 참기 시간을 PB의 85%까지 점진적으로 늘려 저산소 적응 능력을 극대화합니다.' },
              { icon: '🏊', title: '수영장 훈련 전 육상 워밍업', desc: '물에 들어가기 전 드라이 트레이닝으로 신체와 정신을 미리 준비하고 싶은 다이버에게 적합합니다. 2분 워밍업 호흡 단계와 함께 점진적으로 훈련 강도를 높이는 구조로 부상 없이 효과적으로 준비할 수 있습니다.' },
              { icon: '📊', title: '기록 기반 훈련 관리', desc: 'PB 기록과 날짜별 훈련 이력을 자동으로 저장하여 꾸준한 훈련 진행 상황을 확인할 수 있습니다. 지난 10회 훈련 이력을 한눈에 볼 수 있어 실력 향상 추이를 객관적으로 파악하고 훈련 동기를 유지하는 데 도움을 줍니다.' },
            ],
            steps: [
              { step: 'PB 입력', desc: '화면 상단에서 본인의 최고 스태틱 기록(PB)을 분:초 형식으로 입력합니다. 예를 들어 2분 30초라면 "2:30"을 입력합니다. PB가 1분 미만이면 경고가 표시되므로 최소 1분 이상의 기록을 보유한 후 시작하세요.' },
              { step: '모드 선택', desc: 'CO2 내성 테이블(숨 참기 고정, 휴식 감소)과 O2 적응 테이블(휴식 고정, 숨 참기 증가) 중 오늘의 훈련 목적에 맞는 모드를 선택합니다. PB에 따라 자동 생성된 8라운드 테이블을 미리보기로 확인할 수 있습니다.' },
              { step: '훈련 시작', desc: '"훈련 시작" 버튼을 눌러 2분간의 워밍업 호흡 단계부터 자동으로 시작됩니다. 단계가 전환될 때 음성 가이드, 비프음, 화면 플래시가 동시에 알림을 주므로, 눈을 감고 편안하게 누운 자세로 훈련에 집중할 수 있습니다.' },
              { step: '완료 및 기록', desc: '8라운드를 모두 완료하면 축하 메시지와 함께 자동으로 훈련이 종료됩니다. 완료된 라운드 수와 날짜가 자동으로 저장되어 이력에 기록됩니다. 언제든 STOP 버튼으로 훈련을 중단할 수 있습니다.' },
            ],
            faqs: FAQ_KO,
          }}
          en={{
            title: 'What is Apnea Pro Dry Training Master?',
            description: 'Apnea Pro is a professional web app designed to help freediving practitioners of all levels perform scientifically structured dry static apnea training. It automatically generates CO2 tolerance and O2 adaptation tables based on your personal best (PB), and uses four simultaneous alert systems — voice guide (Web Speech API), beep sounds (Web Audio API), visual flash, and vibration — so you can train with eyes closed and still perceive every phase transition clearly. The 2-minute warm-up phase is built in automatically, training history is saved locally, and no app installation is required. It is the ideal training companion for solo dry training sessions at the pool or at home.',
            useCases: [
              { icon: '💨', title: 'CO₂ Tolerance Training', desc: 'Systematically build resistance to the urge to breathe using the CO2 table. Over 8 rounds, rest time decreases by 15 seconds each round while hold time stays fixed at 50% of your PB, progressively challenging your CO₂ tolerance.' },
              { icon: '🫁', title: 'O₂ Adaptation Training', desc: 'Train your body to operate efficiently under hypoxia using the O2 table. Rest is fixed at 2 minutes while hold time increases from 1 minute up to 85% of your PB across 8 rounds, maximizing low-oxygen adaptation.' },
              { icon: '🏊', title: 'Pre-pool Dry Warm-up', desc: 'Prepare your body and mind on land before entering the water. The built-in 2-minute breathing warm-up and gradual intensity progression make it a safe and effective pre-dive preparation routine.' },
              { icon: '📊', title: 'Progress Tracking', desc: 'PB and session history (rounds completed, mode, date) are saved automatically to local storage. View your last 10 sessions at a glance to monitor improvement trends and stay motivated over time.' },
            ],
            steps: [
              { step: 'Enter Your PB', desc: 'Type your personal best static apnea time in m:ss format at the top of the screen. For example, 2 minutes 30 seconds is entered as "2:30". A warning appears if PB is under 1 minute — ensure you have at least that baseline before starting.' },
              { step: 'Select Training Mode', desc: 'Choose CO2 Tolerance (hold fixed, rest decreasing) or O2 Adaptation (rest fixed, hold increasing) based on today\'s training goal. The 8-round table is automatically generated from your PB and shown in a preview table.' },
              { step: 'Start Training', desc: 'Tap "Start Training" to begin the automatic 2-minute warm-up phase. Voice guidance, beep sounds, and screen flashes alert you at every phase transition, so you can lie down with eyes closed and focus entirely on your breath.' },
              { step: 'Complete and Save', desc: 'After all 8 rounds, a completion message appears and the session is automatically logged. You can stop at any time with the large STOP button. Session records are saved locally and visible in the history section.' },
            ],
            faqs: FAQ_EN,
          }}
        />

        {/* Inline Safety & Science SEO content */}
        <div className={s.ap_seo_wrap}>
          <h2>{isKo ? '🔬 프리다이빙 드라이 스태틱의 과학: MDR과 혈중 가스 분압' : '🔬 The Science: MDR and Blood Gas Partial Pressures'}</h2>
          <p>
            {isKo
              ? '프리다이빙에서 숨을 참으면 신체는 포유류 잠수 반응(MDR, Mammalian Dive Reflex)을 발동합니다. 이는 진화적으로 보존된 반사 작용으로, 심박수를 최대 50% 감소(잠수 서맥)시키고 말초 혈관을 수축해 혈액과 산소를 심장·뇌 등 핵심 기관에 집중시킵니다. 동시에 비장이 수축하며 산소를 풍부하게 함유한 적혈구를 혈류로 추가 방출합니다. 혈중 산소 분압(PO₂)은 잠수 시 100mmHg 이하로 떨어질 수 있으며, 이산화탄소 분압(PCO₂) 상승이 실질적인 호흡 충동의 원인입니다. 드라이 트레이닝은 물 없이 이 반응들을 안전하게 자극하고 적응시키는 방법입니다.'
              : 'When you hold your breath, the body activates the Mammalian Dive Reflex (MDR) — an evolutionarily conserved response that reduces heart rate by up to 50% (diving bradycardia), constricts peripheral blood vessels to redirect oxygenated blood to the heart and brain, and triggers splenic contraction to release oxygen-rich red blood cells. Blood oxygen partial pressure (PO₂) can fall below 100mmHg during a dive, while rising CO₂ partial pressure (PCO₂) is the primary trigger of the urge to breathe. Dry training safely stimulates and adapts these physiological responses without water.'}
          </p>

          <h2>{isKo ? '⚠️ 드라이 트레이닝 안전 수칙 (필독)' : '⚠️ Dry Training Safety Rules (Must Read)'}</h2>
          <ul>
            <li><strong>{isKo ? '절대 물속에서 혼자 숨 참기 금지' : 'Never hold your breath alone in water'}</strong> — {isKo ? '드라이 트레이닝이더라도 반드시 육상에서 실시하세요. 수영장이나 욕조에서 혼자 하는 숨 참기는 얕은 물 실신(Shallow Water Blackout)으로 사망 위험이 있습니다.' : 'Even dry training should be done on land. Breath-holding alone in a pool or bathtub can cause Shallow Water Blackout, which is fatal.'}</li>
            <li><strong>{isKo ? '혼자 하지 말 것' : 'Never train alone'}</strong> — {isKo ? '드라이 트레이닝도 가급적 다른 사람이 있는 환경에서 진행하거나, 훈련 전후에 지인에게 상태를 알리세요.' : 'Train where someone else is nearby, or inform someone before and after your session.'}</li>
            <li><strong>{isKo ? '푹신한 곳에서 실시' : 'Train on a soft surface'}</strong> — {isKo ? '드라이 스태틱 훈련 중 실신이 발생할 수 있습니다. 요가 매트, 침대, 소파 등 안전한 장소에서 누운 자세로 진행하세요.' : 'Blackout can occur during dry static training. Always lie on a yoga mat, bed, or couch to prevent injury from falling.'}</li>
            <li><strong>{isKo ? '과호흡(하이퍼벤틸레이션) 절대 금지' : 'Never hyperventilate'}</strong> — {isKo ? '깊고 빠른 과호흡은 CO₂를 급속히 낮춰 호흡 충동 없이 기절하는 Blackout 위험을 높입니다. 본 앱의 워밍업 호흡은 이완 호흡이며 과호흡이 아닙니다.' : 'Rapid deep breathing (hyperventilation) flushes CO₂ and removes the urge-to-breathe signal, dramatically increasing blackout risk. The warm-up breathing in this app is gentle relaxation breathing, not hyperventilation.'}</li>
            <li><strong>{isKo ? '건강 이상 시 즉시 중단' : 'Stop immediately if you feel unwell'}</strong> — {isKo ? '두통, 어지러움, 시야 이상이 느껴지면 즉시 STOP 버튼을 누르고 정상 호흡을 회복하세요.' : 'Press STOP and breathe normally at any sign of headache, dizziness, or vision disturbance.'}</li>
          </ul>

          <div className={s.ap_disclaimer}>
            ⚠️ {isKo
              ? '본 앱은 교육 및 훈련 보조 도구로 제공되며, 의학적 또는 전문 코칭 조언을 대체하지 않습니다. 프리다이빙은 생명에 위협이 될 수 있는 활동입니다. 반드시 공인 프리다이빙 강사의 지도하에 안전한 환경에서 훈련하시기 바랍니다.'
              : 'This app is provided as an educational and training support tool and does not replace medical or professional coaching advice. Freediving is an activity that can pose serious risks to life. Always train under the guidance of a certified freediving instructor in a safe environment.'}
          </div>
        </div>

      </div>
    </div>
  );
}
