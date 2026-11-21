'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';
import { Lunar, Solar } from 'lunar-javascript';

// 천간 (天干)
const HEAVENLY_STEMS = [
  { char: '甲', name: '갑', en: 'Jia' },
  { char: '乙', name: '을', en: 'Yi' },
  { char: '丙', name: '병', en: 'Bing' },
  { char: '丁', name: '정', en: 'Ding' },
  { char: '戊', name: '무', en: 'Wu' },
  { char: '己', name: '기', en: 'Ji' },
  { char: '庚', name: '경', en: 'Geng' },
  { char: '辛', name: '신', en: 'Xin' },
  { char: '壬', name: '임', en: 'Ren' },
  { char: '癸', name: '계', en: 'Gui' },
];

// 지지 (地支)
const EARTHLY_BRANCHES = [
  { char: '子', name: '자', en: 'Zi' },
  { char: '丑', name: '축', en: 'Chou' },
  { char: '寅', name: '인', en: 'Yin' },
  { char: '卯', name: '묘', en: 'Mao' },
  { char: '辰', name: '진', en: 'Chen' },
  { char: '巳', name: '사', en: 'Si' },
  { char: '午', name: '오', en: 'Wu' },
  { char: '未', name: '미', en: 'Wei' },
  { char: '申', name: '신', en: 'Shen' },
  { char: '酉', name: '유', en: 'You' },
  { char: '戌', name: '술', en: 'Xu' },
  { char: '亥', name: '해', en: 'Hai' },
];

interface SajuData {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}

type CalendarType = 'solar' | 'lunar';
type AnalysisType = 'general' | 'wealth' | 'love' | 'business';

export default function FortunePromptClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('AiSajuPrompt');
  const isKo = useLocale() === 'ko';

  // 입력 상태
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);
  const [year, setYear] = useState<number>(1990);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [hour, setHour] = useState<number | 'unknown'>('unknown');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('general');

  // 결과 상태
  const [sajuData, setSajuData] = useState<SajuData | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // 사주팔자 계산 함수
  const calculateSaju = () => {
    try {
      let lunar: any;

      if (calendarType === 'solar') {
        // 양력 입력
        const solar = Solar.fromYmd(year, month, day);
        lunar = solar.getLunar();
      } else {
        // 음력 입력
        lunar = Lunar.fromYmd(year, month, day);
      }

      // 연주, 월주, 일주 가져오기
      const yearGanZhi = lunar.getYearInGanZhiExact();
      const monthGanZhi = lunar.getMonthInGanZhiExact();
      const dayGanZhi = lunar.getDayInGanZhi();

      // 시주 계산 (시간을 모르는 경우 제외)
      let hourGanZhi = '';
      if (hour !== 'unknown') {
        // 시간대를 기준으로 Solar 객체 생성
        const hourValue = typeof hour === 'number' ? hour : 0;
        // 시간대별 시작 시각 계산 (자시는 23시부터 시작)
        const hourMap: { [key: number]: number } = {
          0: 23, 1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11,
          7: 13, 8: 15, 9: 17, 10: 19, 11: 21
        };
        const actualHour = hourMap[hourValue] || 0;

        const solarWithTime = Solar.fromYmdHms(year, month, day, actualHour, 0, 0);
        const lunarWithTime = solarWithTime.getLunar();
        hourGanZhi = lunarWithTime.getTimeInGanZhi();
      }

      // 한자와 한글 발음 병기
      const formatGanZhi = (ganZhi: string): string => {
        const chars = ganZhi.split('');
        const stem = HEAVENLY_STEMS.find(s => s.char === chars[0]);
        const branch = EARTHLY_BRANCHES.find(b => b.char === chars[1]);
        if (!isKo) return `${chars[0]}${chars[1]} (${stem?.en}-${branch?.en})`;
        return `${chars[0]}${chars[1]}(${stem?.name}${branch?.name})`;
      };

      const saju: SajuData = {
        yearPillar: formatGanZhi(yearGanZhi),
        monthPillar: formatGanZhi(monthGanZhi),
        dayPillar: formatGanZhi(dayGanZhi),
        hourPillar: hour === 'unknown' ? (isKo ? '모름' : 'Unknown') : formatGanZhi(hourGanZhi),
      };

      setSajuData(saju);
      generatePrompt(saju);
    } catch (error) {
      console.error('사주 계산 오류:', error);
      alert(isKo ? '입력한 날짜가 올바르지 않습니다. 다시 확인해주세요.' : 'The date you entered is not valid. Please check it and try again.');
    }
  };

  // AI 프롬프트 생성 함수
  const generatePrompt = (saju: SajuData) => {
    if (!isKo) {
      const analysisTypeTextEn = {
        general: 'Overall fortune',
        wealth: 'Wealth & career',
        love: 'Love & marriage',
        business: 'Business & marketing strategy',
      }[analysisType];
      const hourTextEn = hour === 'unknown'
        ? 'My Hour Pillar is unknown.'
        : `My Hour Pillar is ${saju.hourPillar}.`;
      setGeneratedPrompt(`You are a top Saju (Four Pillars of Destiny / BaZi) expert with 30 years of experience, as well as a thoughtful counselor.

My Four Pillars are as follows:
- Year Pillar (年柱): ${saju.yearPillar}
- Month Pillar (月柱): ${saju.monthPillar}
- Day Pillar (日柱): ${saju.dayPillar}
- Hour Pillar (時柱): ${saju.hourPillar}

I am ${gender === 'male' ? 'male' : 'female'}. ${hourTextEn}

Based on this data, analyze the flow of my fortune for 2026 and give me detailed, warm advice on the topic I chose: [${analysisTypeTextEn}].

Please avoid difficult jargon and explain with modern analogies and concrete, actionable steps for improving my luck. Keep the advice encouraging yet realistic.`);
      return;
    }
    const genderText = gender === 'male' ? '남성' : '여성';
    const analysisTypeText = {
      general: '전체 운세',
      wealth: '재물/직장운',
      love: '연애/결혼운',
      business: '비즈니스 마케팅 전략',
    }[analysisType];

    const hourText = saju.hourPillar === '모름'
      ? '시주(時柱)는 알 수 없습니다.'
      : `시주(時柱)는 ${saju.hourPillar}입니다.`;

    const prompt = `너는 30년 경력의 대한민국 최고 명리학 전문가이자 심리 상담가야.

나의 사주팔자는 다음과 같아:
- 연주(年柱): ${saju.yearPillar}
- 월주(月柱): ${saju.monthPillar}
- 일주(日柱): ${saju.dayPillar}
- 시주(時柱): ${saju.hourPillar}

성별은 ${genderText}이고, ${hourText}

이 데이터를 바탕으로 2026년 나의 운의 흐름을 분석하고, 내가 선택한 주제인 [${analysisTypeText}]에 대해 아주 디테일하고 따뜻하게 조언해줘.

어려운 한자어보다는 현대적인 비유와 구체적인 실행 방안(개운법)을 포함해서 설명해주면 좋겠어. 나를 응원하는 마음으로 긍정적이면서도 현실적인 조언을 부탁해.`;

    setGeneratedPrompt(prompt);
  };

  // 클립보드 복사 함수
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div className="max-w-[var(--tool-width-wide)] mx-auto">
      <NavigationActions />

      {/* Header */}
      <ToolHeader icon={<Sparkles />} title={t('title')} subtitle={t('subtitle')} />

      <div className="grid gap-8 lg:grid-cols-2 animate-slide-up">
        {/* Left Column - Input Section */}
        <div className="flex flex-col gap-6">
          {/* Step 1: 성별 선택 */}
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>
              ✨ {t('step1Gender')}
            </h2>
            <div className={ui.segmented}>
              <button
                onClick={() => setGender('male')}
                className={`${ui.segment} ${gender === 'male' ? ui.segmentActive : ''}`}
              >
                👨 {t('male')}
              </button>
              <button
                onClick={() => setGender('female')}
                className={`${ui.segment} ${gender === 'female' ? ui.segmentActive : ''}`}
              >
                👩 {t('female')}
              </button>
            </div>
          </div>

          {/* Step 2: 달력 종류 */}
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>
              📅 {t('step2Calendar')}
            </h2>
            <div className={ui.segmented} style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => setCalendarType('solar')}
                className={`${ui.segment} ${calendarType === 'solar' ? ui.segmentActive : ''}`}
              >
                ☀️ {t('solar')}
              </button>
              <button
                onClick={() => setCalendarType('lunar')}
                className={`${ui.segment} ${calendarType === 'lunar' ? ui.segmentActive : ''}`}
              >
                🌙 {t('lunar')}
              </button>
            </div>
            {calendarType === 'lunar' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                {t('leapMonth')}
              </label>
            )}
          </div>

          {/* Step 3: 생년월일 */}
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>
              🎂 {t('step3Birth')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className={ui.field}>
                <label className={ui.label}>
                  {t('year')}
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className={ui.input}
                >
                  {Array.from({ length: 101 }, (_, i) => 2025 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className={ui.field}>
                <label className={ui.label}>
                  {t('month')}
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className={ui.input}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{isKo ? `${m}월` : m}</option>
                  ))}
                </select>
              </div>
              <div className={ui.field}>
                <label className={ui.label}>
                  {t('day')}
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value))}
                  className={ui.input}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{isKo ? `${d}일` : d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 4: 태어난 시간 */}
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>
              ⏰ {t('step4Time')}
            </h2>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value === 'unknown' ? 'unknown' : parseInt(e.target.value))}
              className={ui.input}
            >
              <option value="unknown">{t('unknownTime')}</option>
              <option value={0}>{isKo ? '23:00-01:00 (子時/자시)' : '23:00–01:00 (Rat hour, 子時)'}</option>
              <option value={1}>{isKo ? '01:00-03:00 (丑時/축시)' : '01:00–03:00 (Ox hour, 丑時)'}</option>
              <option value={2}>{isKo ? '03:00-05:00 (寅時/인시)' : '03:00–05:00 (Tiger hour, 寅時)'}</option>
              <option value={3}>{isKo ? '05:00-07:00 (卯時/묘시)' : '05:00–07:00 (Rabbit hour, 卯時)'}</option>
              <option value={4}>{isKo ? '07:00-09:00 (辰時/진시)' : '07:00–09:00 (Dragon hour, 辰時)'}</option>
              <option value={5}>{isKo ? '09:00-11:00 (巳時/사시)' : '09:00–11:00 (Snake hour, 巳時)'}</option>
              <option value={6}>{isKo ? '11:00-13:00 (午時/오시)' : '11:00–13:00 (Horse hour, 午時)'}</option>
              <option value={7}>{isKo ? '13:00-15:00 (未時/미시)' : '13:00–15:00 (Goat hour, 未時)'}</option>
              <option value={8}>{isKo ? '15:00-17:00 (申時/신시)' : '15:00–17:00 (Monkey hour, 申時)'}</option>
              <option value={9}>{isKo ? '17:00-19:00 (酉時/유시)' : '17:00–19:00 (Rooster hour, 酉時)'}</option>
              <option value={10}>{isKo ? '19:00-21:00 (戌時/술시)' : '19:00–21:00 (Dog hour, 戌時)'}</option>
              <option value={11}>{isKo ? '21:00-23:00 (亥時/해시)' : '21:00–23:00 (Pig hour, 亥時)'}</option>
            </select>
          </div>

          {/* Step 5: 분석 옵션 */}
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>
              🔮 {t('step5Analysis')}
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {(['general', 'wealth', 'love', 'business'] as AnalysisType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAnalysisType(type)}
                  className={`${ui.chip} ${analysisType === type ? ui.chipActive : ''}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {type === 'general' && '🌟 '}
                  {type === 'wealth' && '💰 '}
                  {type === 'love' && '❤️ '}
                  {type === 'business' && '📊 '}
                  {t(`analysis_${type}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={calculateSaju}
            className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`}
          >
            ✨ {t('generatePrompt')}
          </button>
        </div>

        {/* Right Column - Result Section */}
        <div className="flex flex-col gap-6">
          {sajuData && generatedPrompt ? (
            <>
              {/* 사주팔자 결과 */}
              <div className={`${ui.card} animate-scale-in`}>
                <h2 className={ui.cardTitle}>
                  🎴 {t('yourSaju')}
                </h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div className="saju-pillar">
                    <div className="pillar-label">{t('yearPillar')}</div>
                    <div className="pillar-value">{sajuData.yearPillar}</div>
                  </div>
                  <div className="saju-pillar">
                    <div className="pillar-label">{t('monthPillar')}</div>
                    <div className="pillar-value">{sajuData.monthPillar}</div>
                  </div>
                  <div className="saju-pillar">
                    <div className="pillar-label">{t('dayPillar')}</div>
                    <div className="pillar-value">{sajuData.dayPillar}</div>
                  </div>
                  <div className="saju-pillar">
                    <div className="pillar-label">{t('hourPillar')}</div>
                    <div className="pillar-value">{sajuData.hourPillar}</div>
                  </div>
                </div>
              </div>

              {/* 생성된 프롬프트 */}
              <div className={`${ui.card} animate-scale-in`}>
                <h2 className={ui.cardTitle}>
                  📝 {t('generatedPrompt')}
                </h2>
                <div
                  className="prompt-display"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--tint-amber-border)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '1.5rem',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  {generatedPrompt}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`${ui.button} ${ui.primary} ${ui.block}`}
                  style={{ marginBottom: '1rem' }}
                >
                  {copied ? '✅ ' + t('copied') : '📋 ' + t('copyPrompt')}
                </button>

                {/* 퀵 링크 버튼 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <a
                    href="https://chat.openai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ui.button} ${ui.secondary} ${ui.sm}`}
                  >
                    🤖 ChatGPT
                  </a>
                  <a
                    href="https://claude.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ui.button} ${ui.secondary} ${ui.sm}`}
                  >
                    🧠 Claude
                  </a>
                  <a
                    href="https://gemini.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ui.button} ${ui.secondary} ${ui.sm}`}
                  >
                    💎 Gemini
                  </a>
                </div>
              </div>

              {/* 사용 팁 */}
              <div className={`${ui.notice} ${ui.amber}`}>
                <div>
                  <strong>💡 {t('tipTitle')}</strong><br />
                  {t('tipContent')}
                </div>
              </div>
            </>
          ) : (
            <div className={`${ui.card} flex items-center justify-center`} style={{ opacity: 0.6, minHeight: '600px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔮</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('emptyState')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 사주 기둥 결과 + 프롬프트 스크롤바 */}
      <style jsx>{`
        .saju-pillar {
          padding: 1rem;
          background: var(--tint-amber-bg);
          border: 1px solid var(--tint-amber-border);
          border-radius: var(--radius-control);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pillar-label {
          font-size: 0.875rem;
          color: var(--tint-amber-fg);
          font-weight: 700;
        }

        .pillar-value {
          font-size: 1.25rem;
          color: var(--text-primary);
          font-weight: 700;
          font-family: 'Noto Serif KR', serif;
        }

        .prompt-display::-webkit-scrollbar {
          width: 8px;
        }

        .prompt-display::-webkit-scrollbar-track {
          background: var(--surface);
          border-radius: 4px;
        }

        .prompt-display::-webkit-scrollbar-thumb {
          background: var(--tint-amber-border);
          border-radius: 4px;
        }
      `}</style>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('subtitle')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/fortune-prompt" />


      {/* SEO Section */}
      {seo}
    </div>
  );
}
