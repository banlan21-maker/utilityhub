'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './pomodoro.module.css';
import { ui } from '@/app/components/ui';

type Mode = 'focus' | 'short' | 'long';

const DEFAULT_TIMES: Record<Mode, number> = {
  focus: 25,
  short: 5,
  long: 15,
};

const MODE_COLORS: Record<Mode, { primary: string; bg: string }> = {
  focus: { primary: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  short: { primary: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  long:  { primary: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
};

function playBeep(type: 'tick' | 'done') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'done') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
    osc.onended = () => ctx.close();
  } catch { /* AudioContext unavailable */ }
}

function CircleTimer({ progress, color, children }: {
  progress: number; color: string; children: React.ReactNode;
}) {
  const R = 110;
  const circumference = 2 * Math.PI * R;
  const offset = circumference * (1 - progress);
  return (
    <div style={{ position: 'relative', width: '260px', height: '260px', margin: '0 auto' }}>
      <svg width="260" height="260" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="130" cy="130" r={R} fill="none" strokeWidth="10" style={{ stroke: 'var(--border)' }} />
        <circle
          cx="130" cy="130" r={R} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

export default function PomodoroClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Pomodoro');

  const todayKey = `pomodoro_${new Date().toDateString()}`;

  const [mode, setMode] = useState<Mode>('focus');
  const [times, setTimes] = useState<Record<Mode, number>>({ ...DEFAULT_TIMES });
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIMES.focus * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editVals, setEditVals] = useState({ ...DEFAULT_TIMES });
  const [autoStart, setAutoStart] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to always reflect current values inside the stable timer callback
  const soundOnRef = useRef(soundOn);
  const notifGrantedRef = useRef(notifGranted);
  const modeRef = useRef(mode);
  const timesRef = useRef(times);
  const autoStartRef = useRef(autoStart);

  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
  useEffect(() => { notifGrantedRef.current = notifGranted; }, [notifGranted]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { timesRef.current = times; }, [times]);
  useEffect(() => { autoStartRef.current = autoStart; }, [autoStart]);

  // Load today's session count from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(todayKey);
      if (stored) setSessions(parseInt(stored, 10));
    } catch { /* localStorage unavailable */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist session count
  useEffect(() => {
    try { localStorage.setItem(todayKey, String(sessions)); } catch { /* ignore */ }
  }, [sessions, todayKey]);

  const totalSeconds = times[mode] * 60;
  const progress = secondsLeft / totalSeconds;
  const color = MODE_COLORS[mode].primary;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s2 = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s2}`;
  };

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(timesRef.current[m] * 60);
  }, []);

  // Stable onDone: reads all values from refs to avoid stale closure
  const onDoneRef = useRef(() => {
    setRunning(false); // 즉시 interval 정지 → 무한 호출 방지
    if (soundOnRef.current) playBeep('done');
    if (notifGrantedRef.current && typeof Notification !== 'undefined') {
      try {
        new Notification(t('notif_title'), {
          body: modeRef.current === 'focus' ? t('notif_break') : t('notif_work'),
          icon: '/favicon.ico',
        });
      } catch { /* ignore */ }
    }
    if (modeRef.current === 'focus') {
      setSessions(prev => {
        const next = prev + 1;
        const nextMode: Mode = next % 4 === 0 ? 'long' : 'short';
        setTimeout(() => {
          setMode(nextMode);
          setSecondsLeft(timesRef.current[nextMode] * 60);
          if (autoStartRef.current) setRunning(true);
        }, 800);
        return next;
      });
    } else {
      setTimeout(() => {
        setMode('focus');
        setSecondsLeft(timesRef.current.focus * 60);
        if (autoStartRef.current) setRunning(true);
      }, 800);
    }
  });

  // Timer interval: ONLY depends on [running] — toggling sound/notif won't restart it
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(sec => {
          if (sec <= 1) {
            onDoneRef.current();
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Update document title
  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} – ${t(`mode_${mode}`)}` : 'Pomodoro Timer';
    return () => { document.title = 'Utility Hub'; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, running, mode]);

  const requestNotif = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === 'granted');
  };

  const applyEdit = () => {
    const clamped = {
      focus: Math.max(1, Math.min(99, editVals.focus)),
      short: Math.max(1, Math.min(60, editVals.short)),
      long:  Math.max(1, Math.min(60, editVals.long)),
    };
    setTimes(clamped);
    setSecondsLeft(clamped[mode] * 60);
    setRunning(false);
    setEditMode(false);
  };

  const modeLabels: Record<Mode, string> = {
    focus: t('mode_focus'),
    short: t('mode_short'),
    long: t('mode_long'),
  };

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Timer />} title={t('title')} subtitle={t('description')} />

      <div className={`${ui.card} ${s.tool_panel}`}>
        {/* Mode tabs */}
        <div className={`${ui.segmented} ${s.mode_tabs}`}>
          {(['focus', 'short', 'long'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              aria-label={modeLabels[m]}
              className={`${ui.segment} ${mode === m ? ui.segmentActive : ''}`}
              style={{ color: mode === m ? MODE_COLORS[m].primary : undefined }}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Circle timer */}
        <div className={s.circle_container} style={{ background: MODE_COLORS[mode].bg }}>
          <CircleTimer progress={progress} color={color}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-2px' }}>
              {formatTime(secondsLeft)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {modeLabels[mode]}
            </span>
          </CircleTimer>
        </div>

        {/* Controls */}
        <div className={s.controls}>
          <button
            onClick={() => setRunning(r => !r)}
            className={`${ui.button} ${ui.primary} ${ui.lg} ${s.control_button}`}
            style={{ background: color }}
            aria-label={running ? t('pause') : t('start')}
          >
            {running ? t('pause') : (secondsLeft === totalSeconds ? t('start') : t('resume'))}
          </button>
          <button
            onClick={() => { setRunning(false); setSecondsLeft(totalSeconds); }}
            className={`${ui.button} ${ui.secondary} ${ui.lg}`}
            aria-label="Reset"
          >
            ↺
          </button>
        </div>

        {/* Stats & toggles */}
        <div className={s.stats_row}>
          <div className={s.sessions_count}>
            <span>🍅</span>
            <span>{t('sessions_today', { count: sessions })}</span>
          </div>
          <div className={ui.chips}>
            <button
              onClick={() => setAutoStart(v => !v)}
              title={autoStart ? t('autostart_off') : t('autostart_on')}
              aria-label={autoStart ? t('autostart_off') : t('autostart_on')}
              className={`${ui.chip} ${ui.pill} ${autoStart ? ui.chipActive : ''}`}
            >
              {autoStart ? '⏩' : '⏸'}
            </button>
            <button
              onClick={() => setSoundOn(v => !v)}
              title={soundOn ? t('sound_off') : t('sound_on')}
              aria-label={soundOn ? t('sound_off') : t('sound_on')}
              className={`${ui.chip} ${ui.pill}`}
            >
              {soundOn ? '🔔' : '🔕'}
            </button>
            <button
              onClick={notifGranted ? undefined : requestNotif}
              title={t('notif_hint')}
              aria-label={t('notif_hint')}
              className={`${ui.chip} ${ui.pill} ${notifGranted ? ui.chipActive : ''}`}
            >
              {notifGranted ? '🔔✓' : '🖥️'}
            </button>
            <button
              onClick={() => { setEditVals({ ...times }); setEditMode(e => !e); }}
              aria-label={t('settings')}
              className={`${ui.chip} ${ui.pill} ${editMode ? ui.chipActive : ''}`}
            >
              {t('settings')}
            </button>
          </div>
        </div>

        {/* Edit panel */}
        {editMode && (
          <div className={s.edit_panel}>
            <p className={ui.cardTitle}>{t('custom_times')}</p>
            {(['focus', 'short', 'long'] as Mode[]).map(m => (
              <div key={m} className={s.edit_row}>
                <label className={`${ui.label} ${s.edit_label}`}>{modeLabels[m]}</label>
                <input
                  type="number"
                  min={1} max={99}
                  value={editVals[m]}
                  onChange={e => setEditVals(prev => ({ ...prev, [m]: Number(e.target.value) }))}
                  className={`${ui.input} ${s.edit_input}`}
                  aria-label={`${modeLabels[m]} ${t('minutes')}`}
                />
                <span className={ui.hint}>{t('minutes')}</span>
              </div>
            ))}
            <button onClick={applyEdit} className={`${ui.button} ${ui.primary} ${ui.block}`}>
              {t('apply')}
            </button>
          </div>
        )}
      </div>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/productivity/pomodoro" />

      {seo}
    </div>
  );
}
