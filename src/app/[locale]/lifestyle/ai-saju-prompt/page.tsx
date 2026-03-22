'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import { Lunar, Solar } from 'lunar-javascript';

// 천간 (天干)
const HEAVENLY_STEMS = [
  { char: '甲', name: '갑' },
  { char: '乙', name: '을' },
  { char: '丙', name: '병' },
  { char: '丁', name: '정' },
  { char: '戊', name: '무' },
  { char: '己', name: '기' },
  { char: '庚', name: '경' },
  { char: '辛', name: '신' },
  { char: '壬', name: '임' },
  { char: '癸', name: '계' },
];

// 지지 (地支)
const EARTHLY_BRANCHES = [
  { char: '子', name: '자' },
  { char: '丑', name: '축' },
  { char: '寅', name: '인' },
  { char: '卯', name: '묘' },
  { char: '辰', name: '진' },
  { char: '巳', name: '사' },
  { char: '午', name: '오' },
  { char: '未', name: '미' },
  { char: '申', name: '신' },
  { char: '酉', name: '유' },
  { char: '戌', name: '술' },
  { char: '亥', name: '해' },
];

interface SajuData {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}

type CalendarType = 'solar' | 'lunar';
type AnalysisType = 'general' | 'wealth' | 'love' | 'business';

export default function AiSajuPromptPage() {
  const t = useTranslations('AiSajuPrompt');

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
        return `${chars[0]}${chars[1]}(${stem?.name}${branch?.name})`;
      };

      const saju: SajuData = {
        yearPillar: formatGanZhi(yearGanZhi),
        monthPillar: formatGanZhi(monthGanZhi),
        dayPillar: formatGanZhi(dayGanZhi),
        hourPillar: hour === 'unknown' ? '모름' : formatGanZhi(hourGanZhi),
      };

      setSajuData(saju);
      generatePrompt(saju);
    } catch (error) {
      console.error('사주 계산 오류:', error);
      alert('입력한 날짜가 올바르지 않습니다. 다시 확인해주세요.');
    }
  };

  // AI 프롬프트 생성 함수
  const generatePrompt = (saju: SajuData) => {
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
    <div className="max-w-6xl mx-auto">
      <NavigationActions />

      {/* Header */}
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '2.5rem' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {t('subtitle')}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 animate-slide-up">
        {/* Left Column - Input Section */}
        <div className="flex flex-col gap-6">
          {/* Step 1: 성별 선택 */}
          <div className="glass-panel mystic-panel" style={{ padding: '2rem' }}>
            <h2 className="mystic-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              ✨ {t('step1Gender')}
            </h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setGender('male')}
                className={gender === 'male' ? 'gender-btn active' : 'gender-btn'}
                style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
              >
                👨 {t('male')}
              </button>
              <button
                onClick={() => setGender('female')}
                className={gender === 'female' ? 'gender-btn active' : 'gender-btn'}
                style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
              >
                👩 {t('female')}
              </button>
            </div>
          </div>

          {/* Step 2: 달력 종류 */}
          <div className="glass-panel mystic-panel" style={{ padding: '2rem' }}>
            <h2 className="mystic-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              📅 {t('step2Calendar')}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setCalendarType('solar')}
                className={calendarType === 'solar' ? 'calendar-btn active' : 'calendar-btn'}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
              >
                ☀️ {t('solar')}
              </button>
              <button
                onClick={() => setCalendarType('lunar')}
                className={calendarType === 'lunar' ? 'calendar-btn active' : 'calendar-btn'}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
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
          <div className="glass-panel mystic-panel" style={{ padding: '2rem' }}>
            <h2 className="mystic-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              🎂 {t('step3Birth')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('year')}
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 1990)}
                  min={1900}
                  max={2100}
                  className="mystic-input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.5)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('month')}
                </label>
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
                  min={1}
                  max={12}
                  className="mystic-input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.5)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('day')}
                </label>
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                  min={1}
                  max={31}
                  className="mystic-input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.5)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Step 4: 태어난 시간 */}
          <div className="glass-panel mystic-panel" style={{ padding: '2rem' }}>
            <h2 className="mystic-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              ⏰ {t('step4Time')}
            </h2>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value === 'unknown' ? 'unknown' : parseInt(e.target.value))}
              className="mystic-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
            >
              <option value="unknown">{t('unknownTime')}</option>
              <option value={0}>23:00-01:00 (子時/자시)</option>
              <option value={1}>01:00-03:00 (丑時/축시)</option>
              <option value={2}>03:00-05:00 (寅時/인시)</option>
              <option value={3}>05:00-07:00 (卯時/묘시)</option>
              <option value={4}>07:00-09:00 (辰時/진시)</option>
              <option value={5}>09:00-11:00 (巳時/사시)</option>
              <option value={6}>11:00-13:00 (午時/오시)</option>
              <option value={7}>13:00-15:00 (未時/미시)</option>
              <option value={8}>15:00-17:00 (申時/신시)</option>
              <option value={9}>17:00-19:00 (酉時/유시)</option>
              <option value={10}>19:00-21:00 (戌時/술시)</option>
              <option value={11}>21:00-23:00 (亥時/해시)</option>
            </select>
          </div>

          {/* Step 5: 분석 옵션 */}
          <div className="glass-panel mystic-panel" style={{ padding: '2rem' }}>
            <h2 className="mystic-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              🔮 {t('step5Analysis')}
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {(['general', 'wealth', 'love', 'business'] as AnalysisType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAnalysisType(type)}
                  className={analysisType === type ? 'analysis-btn active' : 'analysis-btn'}
                  style={{ padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left' }}
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
            className="generate-btn"
            style={{ padding: '1.25rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            ✨ {t('generatePrompt')}
          </button>
        </div>

        {/* Right Column - Result Section */}
        <div className="flex flex-col gap-6">
          {sajuData && generatedPrompt ? (
            <>
              {/* 사주팔자 결과 */}
              <div className="glass-panel mystic-panel animate-scale-in" style={{ padding: '2rem' }}>
                <h2 className="mystic-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
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
              <div className="glass-panel mystic-panel animate-scale-in" style={{ padding: '2rem' }}>
                <h2 className="mystic-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                  📝 {t('generatedPrompt')}
                </h2>
                <div
                  className="prompt-display"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #fbbf24',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    color: '#e2e8f0',
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
                  className="copy-btn"
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', border: 'none', marginBottom: '1rem' }}
                >
                  {copied ? '✅ ' + t('copied') : '📋 ' + t('copyPrompt')}
                </button>

                {/* 퀵 링크 버튼 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <a
                    href="https://chat.openai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link-btn"
                    style={{ padding: '0.875rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    🤖 ChatGPT
                  </a>
                  <a
                    href="https://claude.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link-btn"
                    style={{ padding: '0.875rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    🧠 Claude
                  </a>
                  <a
                    href="https://gemini.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link-btn"
                    style={{ padding: '0.875rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    💎 Gemini
                  </a>
                </div>
              </div>

              {/* 사용 팁 */}
              <div className="glass-panel mystic-panel" style={{ padding: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  <strong style={{ color: '#fbbf24' }}>💡 {t('tipTitle')}</strong><br />
                  {t('tipContent')}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel flex items-center justify-center" style={{ padding: '4rem', opacity: 0.5, minHeight: '600px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔮</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('emptyState')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mystic Modern Theme Styles */}
      <style jsx>{`
        .mystic-panel {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          border: 1px solid rgba(251, 191, 36, 0.2);
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.5), 0 0 20px rgba(251, 191, 36, 0.1);
        }

        .mystic-title {
          color: #fbbf24 !important;
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
        }

        .mystic-input {
          border: 1px solid rgba(251, 191, 36, 0.3) !important;
          transition: all 0.3s;
        }

        .mystic-input:focus {
          outline: none;
          border-color: #fbbf24 !important;
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
        }

        .gender-btn, .calendar-btn, .analysis-btn {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(251, 191, 36, 0.2);
          color: var(--text-primary);
        }

        .gender-btn:hover, .calendar-btn:hover, .analysis-btn:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: #fbbf24;
          transform: translateY(-2px);
        }

        .gender-btn.active, .calendar-btn.active, .analysis-btn.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: #fbbf24;
          color: #0f172a;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
        }

        .generate-btn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.5);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .generate-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(251, 191, 36, 0.6);
        }

        .generate-btn:active {
          transform: translateY(-1px);
        }

        .saju-pillar {
          padding: 1rem;
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pillar-label {
          font-size: 0.875rem;
          color: #fbbf24;
          font-weight: 600;
        }

        .pillar-value {
          font-size: 1.25rem;
          color: var(--text-primary);
          font-weight: 700;
          font-family: 'Noto Serif KR', serif;
        }

        .copy-btn {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
          transition: all 0.3s;
        }

        .copy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
        }

        .quick-link-btn {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(251, 191, 36, 0.2);
          color: var(--text-primary);
          transition: all 0.3s;
        }

        .quick-link-btn:hover {
          background: rgba(251, 191, 36, 0.15);
          border-color: #fbbf24;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .prompt-display::-webkit-scrollbar {
          width: 8px;
        }

        .prompt-display::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }

        .prompt-display::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.5);
          border-radius: 4px;
        }

        .prompt-display::-webkit-scrollbar-thumb:hover {
          background: #fbbf24;
        }
      `}</style>

      {/* SEO Section */}
      <SeoSection
        ko={{
          title: t('seoTitle'),
          description: t('seoDescription'),
          useCases: [
            { icon: '🤖', title: t('useCase1Title'), desc: t('useCase1Desc') },
            { icon: '🎯', title: t('useCase2Title'), desc: t('useCase2Desc') },
            { icon: '💎', title: t('useCase3Title'), desc: t('useCase3Desc') },
            { icon: '🔒', title: t('useCase4Title'), desc: t('useCase4Desc') },
          ],
          steps: [
            { step: t('howStep1Title'), desc: t('howStep1Desc') },
            { step: t('howStep2Title'), desc: t('howStep2Desc') },
            { step: t('howStep3Title'), desc: t('howStep3Desc') },
            { step: t('howStep4Title'), desc: t('howStep4Desc') },
          ],
          faqs: [
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
            { q: t('faq5Q'), a: t('faq5A') },
          ],
        }}
        en={{
          title: t('seoTitle'),
          description: t('seoDescription'),
          useCases: [
            { icon: '🤖', title: t('useCase1Title'), desc: t('useCase1Desc') },
            { icon: '🎯', title: t('useCase2Title'), desc: t('useCase2Desc') },
            { icon: '💎', title: t('useCase3Title'), desc: t('useCase3Desc') },
            { icon: '🔒', title: t('useCase4Title'), desc: t('useCase4Desc') },
          ],
          steps: [
            { step: t('howStep1Title'), desc: t('howStep1Desc') },
            { step: t('howStep2Title'), desc: t('howStep2Desc') },
            { step: t('howStep3Title'), desc: t('howStep3Desc') },
            { step: t('howStep4Title'), desc: t('howStep4Desc') },
          ],
          faqs: [
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
            { q: t('faq5Q'), a: t('faq5A') },
          ],
        }}
      />
    </div>
  );
}
