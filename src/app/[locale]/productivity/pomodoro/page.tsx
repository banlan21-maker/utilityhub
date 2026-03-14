'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

type Mode = 'focus' | 'short' | 'long';

const DEFAULT_TIMES: Record<Mode, number> = {
  focus: 25,
  short: 5,
  long: 15,
};

const MODE_COLORS: Record<Mode, { primary: string; bg: string; ring: string }> = {
  focus: { primary: '#ef4444', bg: 'rgba(239,68,68,0.08)', ring: '#ef4444' },
  short: { primary: '#10b981', bg: 'rgba(16,185,129,0.08)', ring: '#10b981' },
  long:  { primary: '#3b82f6', bg: 'rgba(59,130,246,0.08)', ring: '#3b82f6' },
};

/** Beep sound via Web Audio API — no external dependency */
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
  } catch { /* silently ignore if AudioContext unavailable */ }
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
        <circle cx="130" cy="130" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
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

export default function PomodoroPage() {
  const t = useTranslations('Pomodoro');

  const [mode, setMode] = useState<Mode>('focus');
  const [times, setTimes] = useState<Record<Mode, number>>({ ...DEFAULT_TIMES });
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIMES.focus * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editVals, setEditVals] = useState({ ...DEFAULT_TIMES });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = times[mode] * 60;
  const progress = secondsLeft / totalSeconds;
  const color = MODE_COLORS[mode].primary;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(times[m] * 60);
  }, [times]);

  const onDone = useCallback(() => {
    setRunning(false);
    if (soundOn) playBeep('done');
    if (notifGranted) {
      new Notification(t('notif_title'), {
        body: mode === 'focus' ? t('notif_break') : t('notif_work'),
        icon: '/favicon.ico',
      });
    }
    if (mode === 'focus') setSessions(s => s + 1);
  }, [soundOn, notifGranted, mode, t]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { onDone(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, onDone]);

  // Update page title with timer
  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} – ${t(`mode_${mode}`)}` : 'Pomodoro Timer';
    return () => { document.title = 'Utility Hub'; };
  }, [secondsLeft, running, mode, t]);

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
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '480px', margin: '0 auto' }}>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {(['focus', 'short', 'long'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontWeight: mode === m ? 700 : 400,
                fontSize: '0.875rem',
                background: mode === m ? MODE_COLORS[m].primary : 'var(--surface-hover)',
                color: mode === m ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Circle timer */}
        <div style={{ background: MODE_COLORS[mode].bg, borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '1.5rem', transition: 'background 0.4s' }}>
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
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              padding: '0.85rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: color,
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
              minWidth: '140px',
            }}
          >
            {running ? t('pause') : (secondsLeft === totalSeconds ? t('start') : t('resume'))}
          </button>
          <button
            onClick={() => { setRunning(false); setSecondsLeft(totalSeconds); }}
            style={{
              padding: '0.85rem 1.2rem',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ↺
          </button>
        </div>

        {/* Stats & toggles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>🍅</span>
            <span>{t('sessions', { count: sessions })}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSoundOn(s => !s)}
              title={soundOn ? t('sound_off') : t('sound_on')}
              style={{ background: 'var(--surface-hover)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '1rem' }}
            >
              {soundOn ? '🔔' : '🔕'}
            </button>
            <button
              onClick={notifGranted ? undefined : requestNotif}
              title={t('notif_hint')}
              style={{ background: notifGranted ? 'rgba(16,185,129,0.15)' : 'var(--surface-hover)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.7rem', cursor: notifGranted ? 'default' : 'pointer', fontSize: '1rem' }}
            >
              {notifGranted ? '🔔✓' : '🖥️'}
            </button>
            <button
              onClick={() => { setEditVals({ ...times }); setEditMode(e => !e); }}
              style={{ background: editMode ? 'var(--primary)' : 'var(--surface-hover)', color: editMode ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              {t('settings')}
            </button>
          </div>
        </div>

        {/* Edit panel */}
        {editMode && (
          <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('custom_times')}</p>
            {(['focus', 'short', 'long'] as Mode[]).map(m => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <label style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{modeLabels[m]}</label>
                <input
                  type="number"
                  min={1} max={99}
                  value={editVals[m]}
                  onChange={e => setEditVals(prev => ({ ...prev, [m]: Number(e.target.value) }))}
                  style={{ width: '64px', padding: '0.35rem 0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('minutes')}</span>
              </div>
            ))}
            <button
              onClick={applyEdit}
              style={{ width: '100%', padding: '0.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem' }}
            >
              {t('apply')}
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </div>
  );
}
