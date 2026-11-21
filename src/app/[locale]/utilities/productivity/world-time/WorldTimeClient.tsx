'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './world-time.module.css';
import { ui } from '@/app/components/ui';


interface TzItem {
  id: string;
  label: string;
  labelEn: string;
  tz: string;
  flag: string;
}

const ALL_TIMEZONES: TzItem[] = [
  { id: 'KST',  label: '한국 (KST)',         labelEn: 'Seoul, Korea (KST)',          tz: 'Asia/Seoul',             flag: '🇰🇷' },
  { id: 'JST',  label: '일본 (JST)',          labelEn: 'Tokyo, Japan (JST)',          tz: 'Asia/Tokyo',             flag: '🇯🇵' },
  { id: 'CST',  label: '중국 (CST)',          labelEn: 'Shanghai, China (CST)',       tz: 'Asia/Shanghai',          flag: '🇨🇳' },
  { id: 'IST',  label: '인도 (IST)',          labelEn: 'India (IST)',                 tz: 'Asia/Kolkata',           flag: '🇮🇳' },
  { id: 'UAE',  label: '두바이 (UAE)',        labelEn: 'Dubai (UAE)',                 tz: 'Asia/Dubai',             flag: '🇦🇪' },
  { id: 'GMT',  label: '런던 (GMT/BST)',      labelEn: 'London (GMT/BST)',            tz: 'Europe/London',          flag: '🇬🇧' },
  { id: 'CET',  label: '파리/베를린 (CET)',   labelEn: 'Paris/Berlin (CET)',          tz: 'Europe/Paris',           flag: '🇪🇺' },
  { id: 'EST',  label: '뉴욕 (EST/EDT)',      labelEn: 'New York (EST/EDT)',          tz: 'America/New_York',       flag: '🇺🇸' },
  { id: 'CST2', label: '시카고 (CST/CDT)',    labelEn: 'Chicago (CST/CDT)',           tz: 'America/Chicago',        flag: '🇺🇸' },
  { id: 'PST',  label: '로스앤젤레스 (PST)', labelEn: 'Los Angeles (PST)',           tz: 'America/Los_Angeles',    flag: '🇺🇸' },
  { id: 'SYD',  label: '시드니 (AEDT)',       labelEn: 'Sydney (AEDT)',               tz: 'Australia/Sydney',       flag: '🇦🇺' },
  { id: 'BRT',  label: '상파울루 (BRT)',      labelEn: 'São Paulo (BRT)',             tz: 'America/Sao_Paulo',      flag: '🇧🇷' },
];

const DEFAULT_SELECTED = ['KST', 'EST', 'GMT', 'JST'];

function getTimeInZone(baseDate: Date, tz: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(baseDate);
}

function getDateInZone(baseDate: Date, tz: string, isKorean: boolean) {
  return new Intl.DateTimeFormat(isKorean ? 'ko-KR' : 'en-US', {
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

function zoneLabel(z: TzItem, isKorean: boolean) {
  return isKorean ? z.label : z.labelEn;
}

function HourBadge({ hour, isKorean }: { hour: number; isKorean: boolean }) {
  const day = isDaytime(hour);
  return (
    <span className={`${ui.badge} ${day ? ui.amber : ui.violet}`}>
      {day ? '☀️' : '🌙'} {isKorean ? (day ? '낮' : '밤') : (day ? 'Day' : 'Night')}
    </span>
  );
}

export default function WorldTimeClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Timezone');
  const locale = useLocale();
  const isKorean = locale === 'ko';

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
    <div className={s.container}>
      <NavigationActions />

      {/* Tool Start Card */}
      <ToolHeader icon={<Globe />} title={t('title')} subtitle={t('description')} />

      {/* Control Panel */}
      <div className={`${ui.card} ${s.control_panel}`}>
        <div className={s.base_selector}>
          <label className={`${ui.label} ${s.base_label}`}>
            {t('base_label')}
          </label>
          <select
            value={baseId}
            onChange={e => setBaseId(e.target.value)}
            className={`${ui.input} ${s.base_select}`}
          >
            {ALL_TIMEZONES.map(z => (
              <option key={z.id} value={z.id}>{z.flag} {zoneLabel(z, isKorean)}</option>
            ))}
          </select>
          {sliderHour !== null && (
            <button
              onClick={() => setSliderHour(null)}
              className={`${ui.button} ${ui.ghost} ${ui.sm}`}
            >
              ↺ {t('reset_time')}
            </button>
          )}
        </div>

        {/* Time slider */}
        <div>
          <div className={s.slider_header}>
            <span className={s.slider_label}>
              {isKorean ? <>{baseZone.flag} {baseZone.label} 기준</> : <>{baseZone.flag} Based on {baseZone.labelEn}</>}
            </span>
            <span className={s.slider_value}>
              {sliderHour !== null ? `${String(sliderHour).padStart(2,'0')}:00` : t('now')}
            </span>
          </div>
          <input
            type="range" min={0} max={23}
            value={sliderHour ?? baseHour}
            onChange={e => setSliderHour(Number(e.target.value))}
            className={s.slider}
          />
          <div className={s.slider_ticks}>
            {(isKorean ? ['0시', '6시', '12시', '18시', '23시'] : ['0h', '6h', '12h', '18h', '23h']).map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
      </div>

      {/* Timezone cards */}
      <div className={s.timezone_grid}>
        {selectedZones.map(zone => {
          const time = getTimeInZone(displayDate, zone.tz);
          const date = getDateInZone(displayDate, zone.tz, isKorean);
          const hour = getHourInZone(displayDate, zone.tz);
          const isBase = zone.id === baseId;

          return (
            <div
              key={zone.id}
              className={`${ui.card} ${s.timezone_card} ${isBase ? s.timezone_card_base : ''}`}
            >
              {isBase && (
                <span className={`${ui.badge} ${s.base_badge}`}>
                  {t('base')}
                </span>
              )}
              <div className={s.timezone_header}>
                <span className={s.timezone_flag}>{zone.flag}</span>
                <div>
                  <div className={s.timezone_label}>{zoneLabel(zone, isKorean)}</div>
                  <div className={s.timezone_date} suppressHydrationWarning>{date}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <HourBadge hour={hour} isKorean={isKorean} />
                </div>
              </div>
              {/* 서버 렌더 시각과 브라우저 시각이 몇 초 다를 수 있다 (1초마다 다시 그림) */}
              <div className={s.timezone_time} suppressHydrationWarning>
                {time}
              </div>

              {/* Remove button */}
              {!isBase && (
                <button
                  onClick={() => toggleZone(zone.id)}
                  className={s.remove_button}
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
            className={s.add_zone_card}
            onClick={() => setShowAdd(s => !s)}
          >
            <span className={s.add_zone_icon}>＋</span>
            <span className={s.add_zone_text}>{t('add_zone')}</span>
          </div>
        )}
      </div>

      {/* Add zone dropdown */}
      {showAdd && availableToAdd.length > 0 && (
        <div className={`${ui.card} ${s.add_zone_panel}`}>
          <p className={`${ui.label} ${s.add_zone_title}`}>
            {t('select_zone')}
          </p>
          <div className={ui.chips}>
            {availableToAdd.map(z => (
              <button
                key={z.id}
                onClick={() => { toggleZone(z.id); setShowAdd(false); }}
                className={`${ui.chip} ${ui.pill}`}
              >
                {z.flag} {zoneLabel(z, isKorean)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share Bar */}
      <ShareBar
        title={isKorean ? '🌍 시간대 변환기' : '🌍 World Time Converter'}
        description={isKorean ? '전 세계 도시의 시간을 한눈에 비교' : 'Compare world timezones at a glance'}
      />

      {/* Related Tools */}
      <RelatedTools toolId="utilities/productivity/world-time" />

      {/* Ad Placeholder */}

      {seo}
    </div>
  );
}
