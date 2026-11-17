'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { Flame, Users, DollarSign, Clock, Receipt, Download } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import html2canvas from 'html2canvas';
import s from './meeting.module.css';
import { MEETING_BURNER_SEO } from './seoContent';

// Salary presets (annual)
const PRESETS = {
  junior: 35000000,   // 3,500만원
  senior: 60000000,   // 6,000만원
  executive: 100000000 // 1억원
};

interface OpportunityCost {
  threshold: number;
  text: { ko: string; en: string };
}

const OPPORTUNITY_COSTS: OpportunityCost[] = [
  { threshold: 0, text: { ko: '타이머 시작...', en: 'Timer started...' } },
  { threshold: 5000, text: { ko: '아메리카노 1잔 증발 ☕', en: 'One coffee evaporated ☕' } },
  { threshold: 20000, text: { ko: '치킨 한 마리 날아가는 중 🍗', en: 'One chicken flying away 🍗' } },
  { threshold: 50000, text: { ko: '점심 회식비 공중분해 🍽️', en: 'Team lunch vaporized 🍽️' } },
  { threshold: 100000, text: { ko: '제주도 왕복 항공권 공중분해 ✈️', en: 'Round trip to Jeju gone ✈️' } },
  { threshold: 500000, text: { ko: '에어팟 프로 10개 불타는 중 🎧', en: '10 AirPods Pro burning 🎧' } },
  { threshold: 1000000, text: { ko: '맥북 프로 한 대가 불타는 중 💻', en: 'MacBook Pro on fire 💻' } },
  { threshold: 5000000, text: { ko: '중고차 한 대 증발... 🚗', en: 'Used car evaporated... 🚗' } },
];

export default function MeetingBurnerClient() {
  const locale = useLocale();
  const isKorean = locale === 'ko';
  const receiptRef = useRef<HTMLDivElement>(null);

  // Setup states
  const [participants, setParticipants] = useState(5);
  const [avgSalary, setAvgSalary] = useState(50000000);
  const [targetMinutes, setTargetMinutes] = useState(30);

  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in milliseconds
  const [totalCost, setTotalCost] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);

  // Cost per second calculation (annual salary to per-second cost)
  const costPerSecond = (avgSalary * participants) / (365 * 8 * 3600);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
      setTotalCost((prev) => prev + (costPerSecond * 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, costPerSecond]);

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setAvgSalary(PRESETS[preset]);
  };

  const startTimer = () => {
    setElapsed(0);
    setTotalCost(0);
    setIsRunning(true);
    setShowReceipt(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setShowReceipt(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    setTotalCost(0);
    setShowReceipt(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const getOpportunityCostText = () => {
    for (let i = OPPORTUNITY_COSTS.length - 1; i >= 0; i--) {
      if (totalCost >= OPPORTUNITY_COSTS[i].threshold) {
        return OPPORTUNITY_COSTS[i].text[isKorean ? 'ko' : 'en'];
      }
    }
    return OPPORTUNITY_COSTS[0].text[isKorean ? 'ko' : 'en'];
  };

  const isOvertime = elapsed > targetMinutes * 60 * 1000;

  const exportReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#111827',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `meeting-receipt-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const getReceiptItems = () => {
    const items = [];
    let remaining = totalCost;

    if (remaining >= 1000000) {
      const macbooks = Math.floor(remaining / 1000000);
      items.push({ item: isKorean ? '맥북 프로' : 'MacBook Pro', count: macbooks });
      remaining -= macbooks * 1000000;
    }
    if (remaining >= 100000) {
      const flights = Math.floor(remaining / 100000);
      items.push({ item: isKorean ? '제주도 왕복권' : 'Round Trip Flight', count: flights });
      remaining -= flights * 100000;
    }
    if (remaining >= 20000) {
      const chickens = Math.floor(remaining / 20000);
      items.push({ item: isKorean ? '치킨' : 'Chicken', count: chickens });
      remaining -= chickens * 20000;
    }
    if (remaining >= 5000) {
      const coffees = Math.floor(remaining / 5000);
      items.push({ item: isKorean ? '아메리카노' : 'Americano', count: coffees });
    }

    return items;
  };

  return (
    <div className={s.container}>
      <NavigationActions />

      <div className={s.header}>
        <div className={s.iconWrapper}>
          <Flame size={48} color="#22c55e" />
        </div>
        <h1 className={s.title}>
          {isKorean ? '⏱️ Meeting Burner' : '⏱️ Meeting Burner'}
        </h1>
        <p className={s.subtitle}>
          {isKorean
            ? '당신의 시간은 돈이다. 그리고 그 돈은 지금 타오르고 있다.'
            : 'Your time is money. And that money is burning right now.'}
        </p>
      </div>

      {/* Setup Section */}
      {!isRunning && !showReceipt && (
        <div className={s.setupCard}>
          <h2 className={s.sectionTitle}>{isKorean ? '🚀 초기 설정' : '🚀 Easy Setup'}</h2>

          <div className={s.inputGroup}>
            <label className={s.label}>
              <Users size={20} />
              {isKorean ? '참석자 수' : 'Participants'}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={participants}
              onChange={(e) => setParticipants(Number(e.target.value))}
              className={s.slider}
            />
            <span className={s.value}>{participants} {isKorean ? '명' : 'people'}</span>
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>
              <DollarSign size={20} />
              {isKorean ? '평균 연봉' : 'Avg Annual Salary'}
            </label>
            <input
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(Number(e.target.value))}
              className={s.input}
              placeholder={isKorean ? '연봉 입력 (원)' : 'Enter salary (KRW)'}
            />
            <div className={s.presets}>
              <button onClick={() => applyPreset('junior')} className={s.presetBtn}>
                {isKorean ? '주니어 (3,500만)' : 'Junior (35M)'}
              </button>
              <button onClick={() => applyPreset('senior')} className={s.presetBtn}>
                {isKorean ? '시니어 (6,000만)' : 'Senior (60M)'}
              </button>
              <button onClick={() => applyPreset('executive')} className={s.presetBtn}>
                {isKorean ? '임원 (1억)' : 'Executive (100M)'}
              </button>
            </div>
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>
              <Clock size={20} />
              {isKorean ? '목표 회의 시간' : 'Target Meeting Duration'}
            </label>
            <input
              type="number"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Number(e.target.value))}
              className={s.input}
              placeholder={isKorean ? '목표 시간 (분)' : 'Target time (min)'}
            />
          </div>

          <button onClick={startTimer} className={s.startBtn}>
            {isKorean ? '🔥 회의 시작' : '🔥 Start Meeting'}
          </button>
        </div>
      )}

      {/* Running Timer */}
      {isRunning && (
        <div className={`${s.tickerCard} ${isOvertime ? s.overtime : ''}`}>
          <h2 className={s.sectionTitle}>{isKorean ? '💸 실시간 대시보드' : '💸 The Ticker'}</h2>

          <div className={s.ticker}>
            <div className={s.costDisplay}>
              ₩{Math.floor(totalCost).toLocaleString()}
            </div>
            <div className={s.timeDisplay}>
              {formatTime(elapsed)}
            </div>
          </div>

          <div className={s.opportunityCost}>
            {getOpportunityCostText()}
          </div>

          {isOvertime && (
            <div className={s.warningBanner}>
              ⚠️ {isKorean ? '목표 시간 초과! 퇴근이 멀어지고 있습니다...' : 'Overtime! Your work-life balance is burning...'}
            </div>
          )}

          <div className={s.controls}>
            <button onClick={stopTimer} className={s.stopBtn}>
              {isKorean ? '종료' : 'Stop'}
            </button>
            <button onClick={resetTimer} className={s.resetBtn}>
              {isKorean ? '리셋' : 'Reset'}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className={s.receiptModal}>
          <div className={s.receiptCard} ref={receiptRef}>
            <div className={s.receiptHeader}>
              <Receipt size={32} color="#22c55e" />
              <h2>{isKorean ? '💳 회의 영수증' : '💳 Meeting Receipt'}</h2>
            </div>

            <div className={s.receiptBody}>
              <div className={s.receiptRow}>
                <span>{isKorean ? '최종 청구액' : 'Total Cost'}</span>
                <strong>₩{Math.floor(totalCost).toLocaleString()}</strong>
              </div>
              <div className={s.receiptRow}>
                <span>{isKorean ? '소모된 시간' : 'Time Spent'}</span>
                <strong>{formatTime(elapsed)}</strong>
              </div>
              <div className={s.receiptRow}>
                <span>{isKorean ? '참석 인원' : 'Participants'}</span>
                <strong>{participants}{isKorean ? '명' : ' people'}</strong>
              </div>

              <div className={s.divider}></div>

              <h3 className={s.itemsTitle}>{isKorean ? '증발한 물건' : 'Evaporated Items'}</h3>
              {getReceiptItems().map((item, idx) => (
                <div key={idx} className={s.receiptItem}>
                  <span>{item.item}</span>
                  <span>{item.count}{isKorean ? '개' : 'x'}</span>
                </div>
              ))}

              <div className={s.receiptFooter}>
                <p>{isKorean ? '회의가 길어질수록 당신의 퇴근은 멀어집니다' : 'Longer meetings = Later finish time'}</p>
                <small>powered by theutilhub</small>
              </div>
            </div>
          </div>

          <div className={s.receiptActions}>
            <button onClick={exportReceipt} className={s.exportBtn}>
              <Download size={20} />
              {isKorean ? '이미지 저장' : 'Save as Image'}
            </button>
            <button onClick={resetTimer} className={s.resetBtn}>
              {isKorean ? '새 회의 시작' : 'New Meeting'}
            </button>
          </div>
        </div>
      )}

      <ShareBar
        title={isKorean ? 'Meeting Burner - 실시간 회의 비용 미터기' : 'Meeting Burner - Real-time Meeting Cost Meter'}
        description={isKorean ? '회의 참석자와 연봉을 입력하면 초 단위로 증발하는 인건비를 실시간으로 시각화합니다.' : 'Visualize labor costs evaporating in real-time by entering meeting participants and salaries.'}
      />
      <RelatedTools toolId="utilities/productivity/meeting-burner" />

      {/* Ad Section */}
      <div className={s.adSection}>
        <p className={s.adText}>
          {isKorean
            ? '💡 효율적인 회의를 위한 타임박싱 기법도 함께 활용해보세요!'
            : '💡 Try timeboxing techniques for more efficient meetings!'}
        </p>
      </div>

      <SeoSection ko={MEETING_BURNER_SEO.ko} en={MEETING_BURNER_SEO.en} />
    </div>
  );
}
