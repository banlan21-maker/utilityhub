'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

interface TzItem {
  id: string;
  label: string;
  tz: string;
  flag: string;
}

const ALL_TIMEZONES: TzItem[] = [
  { id: 'KST',  label: '한국 (KST)',         tz: 'Asia/Seoul',             flag: '🇰🇷' },
  { id: 'JST',  label: '일본 (JST)',          tz: 'Asia/Tokyo',             flag: '🇯🇵' },
  { id: 'CST',  label: '중국 (CST)',          tz: 'Asia/Shanghai',          flag: '🇨🇳' },
  { id: 'IST',  label: '인도 (IST)',          tz: 'Asia/Kolkata',           flag: '🇮🇳' },
  { id: 'UAE',  label: '두바이 (UAE)',        tz: 'Asia/Dubai',             flag: '🇦🇪' },
  { id: 'GMT',  label: '런던 (GMT/BST)',      tz: 'Europe/London',          flag: '🇬🇧' },
  { id: 'CET',  label: '파리/베를린 (CET)',   tz: 'Europe/Paris',           flag: '🇪🇺' },
  { id: 'EST',  label: '뉴욕 (EST/EDT)',      tz: 'America/New_York',       flag: '🇺🇸' },
  { id: 'CST2', label: '시카고 (CST/CDT)',    tz: 'America/Chicago',        flag: '🇺🇸' },
  { id: 'PST',  label: '로스앤젤레스 (PST)', tz: 'America/Los_Angeles',    flag: '🇺🇸' },
  { id: 'SYD',  label: '시드니 (AEDT)',       tz: 'Australia/Sydney',       flag: '🇦🇺' },
  { id: 'BRT',  label: '상파울루 (BRT)',      tz: 'America/Sao_Paulo',      flag: '🇧🇷' },
];

const DEFAULT_SELECTED = ['KST', 'EST', 'GMT', 'JST'];

function getTimeInZone(baseDate: Date, tz: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(baseDate);
}

function getDateInZone(baseDate: Date, tz: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: tz,
    month: 'short', day: 'numeric', weekday: 'short',
  }).format(baseDate);
}

function getHourInZone(baseDate: Date, tz: string): number {
  const h = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', hour12: false,
  }).format(baseDate);
  return parseInt(h) % 24;
}

function isDaytime(hour: number) {
  return hour >= 7 && hour < 20;
}

function HourBadge({ hour }: { hour: number }) {
  const day = isDaytime(hour);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem',
      background: day ? 'rgba(251,191,36,0.18)' : 'rgba(99,102,241,0.18)',
      color: day ? '#b45309' : '#6366f1',
      fontWeight: 600,
    }}>
      {day ? '☀️' : '🌙'} {day ? '낮' : '밤'}
    </span>
  );
}

export default function TimezonePage() {
  const t = useTranslations('Timezone');

  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [baseId, setBaseId] = useState('KST');
  const [sliderHour, setSliderHour] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Live clock
  useEffect(() => {
    if (sliderHour !== null) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [sliderHour]);

  // Build display date: if slider is active, create a virtual date
  const displayDate = (() => {
    if (sliderHour === null) return now;
    const baseTz = ALL_TIMEZONES.find(z => z.id === baseId)!.tz;
    const currentHourInBase = getHourInZone(now, baseTz);
    const diffHours = sliderHour - currentHourInBase;
    const d = new Date(now.getTime() + diffHours * 3600 * 1000);
    return d;
  })();

  const selectedZones = ALL_TIMEZONES.filter(z => selected.includes(z.id));
  const availableToAdd = ALL_TIMEZONES.filter(z => !selected.includes(z.id));
  const baseZone = ALL_TIMEZONES.find(z => z.id === baseId)!;

  const toggleZone = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const baseHour = getHourInZone(displayDate, baseZone.tz);

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Base timezone selector & slider */}
      <div className="glass-panel" style={{ padding: 'var(--page-padding)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {t('base_label')}
          </label>
          <select
            value={baseId}
            onChange={e => setBaseId(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {ALL_TIMEZONES.map(z => (
              <option key={z.id} value={z.id}>{z.flag} {z.label}</option>
            ))}
          </select>
          {sliderHour !== null && (
            <button
              onClick={() => setSliderHour(null)}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface-hover)', border: 'none', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem', cursor: 'pointer' }}
            >
              ↺ {t('reset_time')}
            </button>
          )}
        </div>

        {/* Time slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {baseZone.flag} {baseZone.label} 기준
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
              {sliderHour !== null ? `${String(sliderHour).padStart(2,'0')}:00` : t('now')}
            </span>
          </div>
          <input
            type="range" min={0} max={23}
            value={sliderHour ?? baseHour}
            onChange={e => setSliderHour(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {['0시', '6시', '12시', '18시', '23시'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
      </div>

      {/* Timezone cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {selectedZones.map(zone => {
          const time = getTimeInZone(displayDate, zone.tz);
          const date = getDateInZone(displayDate, zone.tz);
          const hour = getHourInZone(displayDate, zone.tz);
          const isBase = zone.id === baseId;

          return (
            <div
              key={zone.id}
              className="glass-panel animate-fade-in"
              style={{
                padding: '1.25rem 1.5rem',
                border: isBase ? '2px solid var(--primary)' : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {isBase && (
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  fontSize: '0.65rem', fontWeight: 700,
                  background: 'var(--primary)', color: 'white',
                  padding: '2px 7px', borderRadius: 'var(--radius-full)',
                }}>
                  {t('base')}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{zone.flag}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{zone.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <HourBadge hour={hour} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>
                {time}
              </div>

              {/* Remove button */}
              {!isBase && (
                <button
                  onClick={() => toggleZone(zone.id)}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '22px', height: '22px',
                    borderRadius: '50%', border: 'none',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Add zone card */}
        {availableToAdd.length > 0 && (
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              border: '2px dashed var(--border)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', cursor: 'pointer', minHeight: '120px',
            }}
            onClick={() => setShowAdd(s => !s)}
          >
            <span style={{ fontSize: '1.5rem' }}>＋</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('add_zone')}</span>
          </div>
        )}
      </div>

      {/* Add zone dropdown */}
      {showAdd && availableToAdd.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            {t('select_zone')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {availableToAdd.map(z => (
              <button
                key={z.id}
                onClick={() => { toggleZone(z.id); setShowAdd(false); }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text-primary)',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                {z.flag} {z.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
