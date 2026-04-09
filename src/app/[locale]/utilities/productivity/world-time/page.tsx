import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "세계 시간대 변환기 | Utility Hub"
    : "World Time Zone Converter | Utility Hub";
  const description = isKo
    ? "전 세계 주요 도시의 현재 시각을 한 화면에서 비교하고, 슬라이더로 최적의 국제 미팅 시간을 찾으세요."
    : "Compare current times across major world cities on one screen and find the perfect international meeting slot with the time slider.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/productivity/world-time`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/productivity/world-time`,
        en: `https://www.theutilhub.com/en/utilities/productivity/world-time`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "세계 시간대 변환기",
  "alternateName": "World Time Zone Converter",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/productivity/world-time",
  "description": "전 세계 주요 도시의 현재 시각을 한 화면에서 비교하고, 슬라이더로 최적의 국제 미팅 시간을 찾으세요."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "DST(서머타임)는 자동으로 반영되나요?", "acceptedAnswer": { "@type": "Answer", "text": "네. 이 시간대 변환기는 각 도시의 현재 DST(일광 절약 시간제) 적용 여부를 자동으로 반영합니다. 미국·유럽 등 서머타임 적용 국가의 시각도 항상 정확하게 표시됩니다." } },
    { "@type": "Question", "name": "원하는 도시가 목록에 없습니다", "acceptedAnswer": { "@type": "Answer", "text": "현재 세계 주요 30개 이상의 도시를 지원합니다. 특정 도시가 없다면 같은 타임존(UTC 오프셋)의 대표 도시를 대신 사용하세요. 예: 방콕(UTC+7) = 자카르타(UTC+7)" } },
    { "@type": "Question", "name": "현재 시각이 아닌 특정 시각을 변환하고 싶습니다", "acceptedAnswer": { "@type": "Answer", "text": "슬라이더를 원하는 시각(0~23시)으로 조정하면 해당 시각 기준으로 모든 도시의 시각이 계산됩니다. 내일 오전 10시 미팅이라면 슬라이더를 10에 맞추면 됩니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './world-time.module.css';

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <NavigationActions />

      {/* Tool Start Card */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Globe size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      {/* Control Panel */}
      <div className={s.control_panel}>
        <div className={s.base_selector}>
          <label className={s.base_label}>
            {t('base_label')}
          </label>
          <select
            value={baseId}
            onChange={e => setBaseId(e.target.value)}
            className={s.base_select}
          >
            {ALL_TIMEZONES.map(z => (
              <option key={z.id} value={z.id}>{z.flag} {z.label}</option>
            ))}
          </select>
          {sliderHour !== null && (
            <button
              onClick={() => setSliderHour(null)}
              className={s.reset_time}
            >
              ↺ {t('reset_time')}
            </button>
          )}
        </div>

        {/* Time slider */}
        <div>
          <div className={s.slider_header}>
            <span className={s.slider_label}>
              {baseZone.flag} {baseZone.label} 기준
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
            {['0시', '6시', '12시', '18시', '23시'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
      </div>

      {/* Timezone cards */}
      <div className={s.timezone_grid}>
        {selectedZones.map(zone => {
          const time = getTimeInZone(displayDate, zone.tz);
          const date = getDateInZone(displayDate, zone.tz);
          const hour = getHourInZone(displayDate, zone.tz);
          const isBase = zone.id === baseId;

          return (
            <div
              key={zone.id}
              className={`${s.timezone_card} ${isBase ? s.timezone_card_base : ''}`}
            >
              {isBase && (
                <span className={s.base_badge}>
                  {t('base')}
                </span>
              )}
              <div className={s.timezone_header}>
                <span className={s.timezone_flag}>{zone.flag}</span>
                <div>
                  <div className={s.timezone_label}>{zone.label}</div>
                  <div className={s.timezone_date}>{date}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <HourBadge hour={hour} />
                </div>
              </div>
              <div className={s.timezone_time}>
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
        <div className={s.add_zone_panel}>
          <p className={s.add_zone_title}>
            {t('select_zone')}
          </p>
          <div className={s.add_zone_buttons}>
            {availableToAdd.map(z => (
              <button
                key={z.id}
                onClick={() => { toggleZone(z.id); setShowAdd(false); }}
                className={s.city_button}
              >
                {z.flag} {z.label}
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
      <RelatedTools toolId="utilities/productivity/world-time" limit={3} />

      {/* Ad Placeholder */}
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>

      <SeoSection
        ko={{
          title: "시간대 변환기(타임존 컨버터)란 무엇인가요?",
          description: "시간대 변환기(Timezone Converter)는 전 세계 주요 도시의 현재 시각을 한 화면에서 비교하고, 특정 시각이 다른 나라에서는 몇 시인지 즉시 계산해주는 온라인 도구입니다. 국제 비즈니스 미팅 일정 조율, 해외 친구·동료와의 통화 시간 계획, 글로벌 라이브 이벤트 시청 시간 확인 등 다양한 상황에서 활용됩니다. 슬라이더를 움직여 시간을 조절하면 모든 도시의 시각이 실시간으로 연동되어 최적의 미팅 시간을 직관적으로 찾을 수 있습니다. 브라우저 내장 Intl API를 사용해 DST(서머타임)도 자동 반영됩니다.",
          useCases: [
            { icon: '🤝', title: '국제 미팅 & 화상회의 일정 조율', desc: '서울, 뉴욕, 런던, 도쿄 등 여러 도시의 참석자가 모두 업무 시간 내에 있는 시간대를 찾아 회의를 잡습니다.' },
            { icon: '💬', title: '해외 팀과의 협업', desc: '원격 근무 팀원의 현지 시각을 실시간으로 확인해 메시지 발송, 코드 리뷰 요청 등의 타이밍을 맞춥니다.' },
            { icon: '🎮', title: '글로벌 이벤트 & 게임 출시 시간 확인', desc: '해외 스트리머의 라이브 방송, 게임 서버 오픈, 글로벌 신보 발매 등 이벤트의 한국 기준 시각을 바로 확인합니다.' },
            { icon: '✈️', title: '해외 항공편 & 현지 도착 시간 계산', desc: '출발지와 목적지의 시간차를 확인해 현지 도착 시각, 환승 대기 시간, 수면 계획 등을 세웁니다.' },
          ],
          steps: [
            { step: '기준 도시 확인', desc: '기본으로 서울(KST, UTC+9)이 설정되어 있습니다. 다른 도시를 기준으로 변환하려면 상단 드롭다운에서 기준 도시를 변경합니다.' },
            { step: '도시 추가', desc: "'도시 추가' 카드를 클릭하면 나타나는 목록에서 비교할 도시를 선택합니다. 뉴욕, 런던, 도쿄 등 주요 도시를 자유롭게 추가할 수 있습니다." },
            { step: '시간 슬라이더로 최적 시간 탐색', desc: '슬라이더를 좌우로 움직이면 모든 도시의 시각이 연동되어 변경됩니다. ☀️/🌙 배지로 각 도시의 낮/밤 여부를 한눈에 파악하여 모든 참가자의 업무 시간대를 찾으세요.' },
            { step: '시간 초기화', desc: "슬라이더를 조정한 후 실시간 시각으로 돌아오려면 '↺ 현재 시각' 버튼을 클릭하세요. 라이브 시계가 즉시 재개됩니다." },
          ],
          faqs: [
            { q: 'DST(서머타임)는 자동으로 반영되나요?', a: '네. 이 시간대 변환기는 브라우저 내장 Intl.DateTimeFormat API를 사용하므로 각 도시의 현재 DST(일광 절약 시간제) 적용 여부가 자동으로 반영됩니다. 미국·유럽 등 서머타임 적용 국가의 시각도 항상 정확하게 표시됩니다.' },
            { q: '원하는 도시가 목록에 없습니다', a: '현재 세계 주요 12개 타임존을 지원합니다. 특정 도시가 없다면 같은 UTC 오프셋의 대표 도시를 대신 사용하세요. 예: 방콕(UTC+7) = 자카르타(UTC+7). 추가 도시 요청은 피드백으로 남겨주세요.' },
            { q: '현재 시각이 아닌 특정 시각을 변환하고 싶습니다', a: '슬라이더를 원하는 시각(0~23시)으로 조정하면 해당 시각 기준으로 모든 도시의 시각이 계산됩니다. 내일 오전 10시 미팅이라면 슬라이더를 10에 맞추면 됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is a Timezone Converter?",
          description: "A Timezone Converter displays the current local time for major cities worldwide on a single screen and instantly calculates what time it is in another country for any given moment. It's invaluable for scheduling international business meetings, planning calls with overseas colleagues, and checking global live event start times. Use the time slider to find the perfect meeting slot where all participants are within business hours — updated in real time as you drag. Daylight Saving Time (DST) for all supported cities is applied automatically using the browser's built-in Intl API.",
          useCases: [
            { icon: '🤝', title: 'International Meeting Scheduling', desc: 'Find an overlap in business hours across Seoul, New York, London, and Tokyo to schedule a meeting time that works for every participant without back-and-forth emails.' },
            { icon: '💬', title: 'Remote Team Collaboration', desc: "Check teammates' local time in real time to perfectly time your messages, code review requests, and async handoffs to avoid unnecessary delays." },
            { icon: '🎮', title: 'Global Events & Game Launches', desc: "Convert overseas streamer live times, game server openings, and international album releases to your local timezone so you never miss a global event." },
            { icon: '✈️', title: 'Flight & Arrival Time Calculation', desc: 'Verify the time difference between departure and destination cities to accurately plan your local arrival time, layover schedules, and sleep strategy on long-haul flights.' },
          ],
          steps: [
            { step: 'Confirm your base city', desc: 'Seoul (KST, UTC+9) is set as the default base city. Use the dropdown to switch to any other city as your reference timezone.' },
            { step: 'Add cities', desc: "Click the 'Add city' card to reveal the city list, then select the cities you want to compare. Major cities including New York, London, and Tokyo are available." },
            { step: 'Use the slider to find the best time', desc: 'Drag the slider left or right to shift all city clocks simultaneously. The ☀️/🌙 badge on each card shows whether it is daytime or nighttime, helping you identify the ideal meeting window.' },
            { step: 'Reset to live time', desc: "After adjusting the slider, click the '↺ Current time' button to return to the real-time live clock view instantly." },
          ],
          faqs: [
            { q: 'Is DST (Daylight Saving Time) automatically applied?', a: 'Yes. This timezone converter uses the browser\'s built-in Intl.DateTimeFormat API, so current DST status for each city is applied automatically. Times for the US, Europe, and other DST regions are always displayed accurately without any manual adjustment.' },
            { q: "My city isn't in the list", a: 'Twelve major timezone zones are currently supported. If your city is missing, use the representative city for the same UTC offset — for example, Bangkok (UTC+7) can substitute for Jakarta (UTC+7). Feel free to send a city request via feedback.' },
            { q: 'Can I convert a specific time rather than the current time?', a: 'Yes. Adjust the slider to your desired hour (0–23) and all city times will instantly recalculate for that moment. For example, set it to 10 to see what time 10:00 AM in your base city corresponds to in all other cities.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
