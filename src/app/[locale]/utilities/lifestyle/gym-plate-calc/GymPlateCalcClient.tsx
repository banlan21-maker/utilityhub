'use client';

import { useLocale } from 'next-intl';
import { useState, useRef } from 'react';
import { Dumbbell, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import html2canvas from 'html2canvas';
import s from './gym.module.css';

// IWF Standard Plate Colors
const PLATE_COLORS: Record<number, string> = {
  25: '#EF4444', // Red
  20: '#3B82F6', // Blue
  15: '#FBBF24', // Yellow
  10: '#10B981', // Green
  5: '#F3F4F6',  // White
  2.5: '#1F2937', // Black
  1.25: '#9CA3AF', // Silver
};

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

interface PlateCount {
  weight: number;
  count: number;
  color: string;
}

export default function GymPlateCalcClient() {
  const locale = useLocale();
  const isKorean = locale === 'ko';
  const resultRef = useRef<HTMLDivElement>(null);

  // 1RM Calculator States
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRM, setOneRM] = useState<number | null>(null);

  // Plate Loader States
  const [targetWeight, setTargetWeight] = useState('');
  const [barbellWeight, setBarbellWeight] = useState(20);
  const [plates, setPlates] = useState<PlateCount[]>([]);
  const [totalPlateWeight, setTotalPlateWeight] = useState(0);

  // Calculate 1RM using Epley Formula
  const calculate1RM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);

    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      alert(isKorean ? '올바른 값을 입력해주세요!' : 'Please enter valid values!');
      return;
    }

    // Epley Formula: 1RM = Weight × (1 + Reps/30)
    const result = w * (1 + r / 30);
    setOneRM(Math.round(result * 10) / 10);
  };

  // Calculate Plates using Greedy Algorithm
  const calculatePlates = () => {
    const target = parseFloat(targetWeight);

    if (isNaN(target) || target <= barbellWeight) {
      alert(isKorean ? '바벨 무게보다 큰 값을 입력해주세요!' : 'Target weight must be greater than barbell weight!');
      return;
    }

    // Weight for one side
    let remainingWeight = (target - barbellWeight) / 2;
    const usedPlates: PlateCount[] = [];
    let total = 0;

    // Greedy algorithm: use largest plates first
    for (const plateWeight of PLATES) {
      const count = Math.floor(remainingWeight / plateWeight);
      if (count > 0) {
        usedPlates.push({
          weight: plateWeight,
          count,
          color: PLATE_COLORS[plateWeight],
        });
        remainingWeight -= plateWeight * count;
        total += plateWeight * count;
      }
    }

    setPlates(usedPlates);
    setTotalPlateWeight(total * 2); // Both sides
  };

  // Export to Instagram Story Format (9:16)
  const exportToImage = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gym-plate-calc-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      alert(isKorean ? '이미지 저장 실패' : 'Failed to save image');
    }
  };

  return (
    <div className={s.container}>
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
          <Dumbbell size={40} color="#8b5cf6" />
        </div>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.75rem'
        }}>
          {isKorean ? '1RM & 바벨 원판 계산기' : '1RM & Barbell Plate Calculator'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isKorean ? '최대 중량 측정과 원판 세팅을 한 번에!' : 'Calculate max weight and plate loading instantly!'}
        </p>
      </header>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button onClick={exportToImage} className={s.save_button}>
          <Download size={18} />
          {isKorean ? '인스타 스토리용 이미지 저장' : 'Save for Instagram Story'}
        </button>
      </div>

      {/* Result Area (for capture) */}
      <div ref={resultRef} className={s.result_area}>

        {/* 1RM Calculator */}
        <div className={s.tool_panel}>
          <h2 className={s.section_title}>
            💪 {isKorean ? '1RM 계산기 (Epley 공식)' : '1RM Calculator (Epley Formula)'}
          </h2>

          <div className={s.input_row}>
            <div className={s.input_group}>
              <label className={s.label}>{isKorean ? '중량 (kg)' : 'Weight (kg)'}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                className={s.input}
              />
            </div>

            <div className={s.input_group}>
              <label className={s.label}>{isKorean ? '반복 횟수' : 'Reps'}</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8"
                className={s.input}
              />
            </div>
          </div>

          <button onClick={calculate1RM} className={s.calc_button}>
            {isKorean ? '1RM 계산하기' : 'Calculate 1RM'}
          </button>

          {oneRM !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={s.result_card}
            >
              <p className={s.result_label}>{isKorean ? '예상 1RM' : 'Estimated 1RM'}</p>
              <p className={s.result_value}>{oneRM} kg</p>
            </motion.div>
          )}
        </div>

        {/* Plate Loader */}
        <div className={s.tool_panel}>
          <h2 className={s.section_title}>
            🏋️ {isKorean ? '바벨 원판 계산기' : 'Barbell Plate Loader'}
          </h2>

          <div className={s.barbell_selector}>
            <label className={s.label}>{isKorean ? '바벨 무게' : 'Barbell Weight'}</label>
            <div className={s.radio_group}>
              <label className={s.radio_label}>
                <input
                  type="radio"
                  checked={barbellWeight === 20}
                  onChange={() => setBarbellWeight(20)}
                />
                <span>20kg</span>
              </label>
              <label className={s.radio_label}>
                <input
                  type="radio"
                  checked={barbellWeight === 15}
                  onChange={() => setBarbellWeight(15)}
                />
                <span>15kg</span>
              </label>
            </div>
          </div>

          <div className={s.input_group}>
            <label className={s.label}>{isKorean ? '목표 총 중량 (kg)' : 'Target Total Weight (kg)'}</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="140"
              className={s.input}
            />
          </div>

          <button onClick={calculatePlates} className={s.calc_button}>
            {isKorean ? '원판 계산하기' : 'Calculate Plates'}
          </button>

          {plates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={s.plate_result}
            >
              <p className={s.info_text}>
                {isKorean ? '한쪽 면에 끼울 원판' : 'Plates per side'}: <strong>{totalPlateWeight / 2} kg</strong>
              </p>

              {/* Barbell Visualization */}
              <div className={s.barbell_visual}>
                {/* Left Plates */}
                <div className={s.plates_left}>
                  <AnimatePresence>
                    {plates.map((plate, idx) => (
                      Array(plate.count).fill(0).map((_, i) => (
                        <motion.div
                          key={`left-${idx}-${i}`}
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: (idx * plate.count + i) * 0.1 }}
                          className={s.plate}
                          style={{
                            backgroundColor: plate.color,
                            width: `${Math.max(40, plate.weight * 2)}px`,
                            border: plate.weight === 5 ? '2px solid #d1d5db' : 'none',
                            color: plate.weight === 5 || plate.weight === 15 ? '#1f2937' : 'white',
                          }}
                        >
                          {plate.weight}
                        </motion.div>
                      ))
                    ))}
                  </AnimatePresence>
                </div>

                {/* Barbell Bar */}
                <div className={s.barbell_bar}>
                  <span className={s.barbell_weight}>{barbellWeight}kg</span>
                </div>

                {/* Right Plates */}
                <div className={s.plates_right}>
                  <AnimatePresence>
                    {plates.map((plate, idx) => (
                      Array(plate.count).fill(0).map((_, i) => (
                        <motion.div
                          key={`right-${idx}-${i}`}
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: (idx * plate.count + i) * 0.1 }}
                          className={s.plate}
                          style={{
                            backgroundColor: plate.color,
                            width: `${Math.max(40, plate.weight * 2)}px`,
                            border: plate.weight === 5 ? '2px solid #d1d5db' : 'none',
                            color: plate.weight === 5 || plate.weight === 15 ? '#1f2937' : 'white',
                          }}
                        >
                          {plate.weight}
                        </motion.div>
                      ))
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Plate List */}
              <div className={s.plate_list}>
                <p className={s.list_title}>{isKorean ? '원판 목록 (한쪽)' : 'Plate List (per side)'}</p>
                {plates.map((plate, idx) => (
                  <div key={idx} className={s.plate_item}>
                    <div
                      className={s.color_dot}
                      style={{ backgroundColor: plate.color }}
                    />
                    <span>{plate.weight}kg × {plate.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Share Bar */}
      <ShareBar
        title={isKorean ? '🏋️ 1RM & 바벨 원판 계산기' : '🏋️ 1RM & Barbell Plate Calculator'}
        description={isKorean ? '오늘의 중량을 친구들에게 자랑해보세요!' : 'Share your max weight with friends!'}
      />

      {/* Related Tools */}
      <RelatedTools toolId="utilities/lifestyle/gym-plate-calc" limit={3} />

      {/* Ad Placeholder */}
      <div className={s.ad_placeholder}>
        {isKorean ? '광고 영역' : 'Ad Space'}
      </div>

      <SeoSection
        ko={{
          title: "1RM 계산기란 무엇인가요?",
          description: "1RM(One Repetition Maximum)은 한 번에 들어 올릴 수 있는 최대 중량을 의미합니다. 직접 측정하기에는 부상 위험이 있어, Epley 공식을 사용하여 안전하게 예측합니다. 공식은 '1RM = 중량 × (1 + 반복횟수/30)'으로, 국제적으로 가장 널리 사용되는 표준입니다. 이 도구는 웨이트 트레이닝 프로그램 설계, 목표 설정, 진행 상황 추적에 필수적입니다.",
          useCases: [
            { icon: '📊', title: '운동 프로그램 설계', desc: '5x5, 5/3/1 등 퍼센티지 기반 프로그램을 위한 정확한 중량 계산에 활용하세요.' },
            { icon: '🎯', title: '목표 설정 및 추적', desc: '현재 1RM을 기록하고 주기적으로 측정하여 근력 향상을 시각적으로 확인하세요.' },
            { icon: '🏋️', title: '원판 세팅 최적화', desc: '헬스장에서 암산 없이 바로 원판을 세팅할 수 있어 운동 집중도가 높아집니다.' },
            { icon: '📸', title: 'SNS 공유', desc: '인스타그램 스토리 규격으로 저장하여 운동 기록을 친구들과 공유하세요.' },
          ],
          steps: [
            { step: '중량과 반복 횟수 입력', desc: '최근 세트에서 수행한 중량(kg)과 반복 횟수를 입력합니다. 예: 100kg × 8회' },
            { step: '1RM 계산 확인', desc: 'Epley 공식으로 계산된 예상 1RM을 확인합니다. 이 값을 기준으로 운동 프로그램을 설계하세요.' },
            { step: '바벨 무게 선택', desc: '사용할 바벨이 20kg인지 15kg인지 선택합니다. (올림픽 바벨 vs 여성용 바벨)' },
            { step: '목표 중량 입력 및 원판 확인', desc: '들고 싶은 총 중량을 입력하면, IWF 표준 컬러로 표시된 바벨 그래픽과 원판 리스트를 확인할 수 있습니다.' },
          ],
          faqs: [
            { q: 'Epley 공식은 얼마나 정확한가요?', a: 'Epley 공식은 1985년 Bruce Epley가 발표한 공식으로, 연구 결과 오차 범위가 평균 3~5% 이내로 나타났습니다. 특히 6~10회 반복 구간에서 가장 정확하며, 보디빌딩과 파워리프팅 커뮤니티에서 표준으로 사용됩니다.' },
            { q: '원판 색깔이 헬스장과 다른데요?', a: '이 도구는 국제 역도 연맹(IWF) 표준 컬러 코드를 따릅니다: 빨강(25kg), 파랑(20kg), 노랑(15kg), 초록(10kg), 하양(5kg), 검정(2.5kg), 은색(1.25kg). 일부 헬스장은 다른 색상을 사용할 수 있습니다.' },
            { q: '1RM 측정 후 어떻게 활용하나요?', a: '1RM의 80~85%는 근비대(Hypertrophy), 85~95%는 근력(Strength), 95% 이상은 파워(Power) 훈련에 적합합니다. 5x5 프로그램은 보통 1RM의 75~85%를 사용합니다.' },
            { q: '이미지 저장이 안 돼요', a: '브라우저 팝업 차단을 해제하거나, 다운로드 권한을 허용해주세요. 일부 모바일 브라우저에서는 "다운로드" 폴더에 자동 저장됩니다.' },
          ],
        }}
        en={{
          title: "What is a 1RM Calculator?",
          description: "1RM (One Repetition Maximum) is the maximum weight you can lift for one repetition. Direct testing carries injury risk, so we use the Epley formula for safe estimation: 1RM = Weight × (1 + Reps/30). This internationally recognized formula is essential for designing weight training programs, setting goals, and tracking progress.",
          useCases: [
            { icon: '📊', title: 'Program Design', desc: 'Calculate precise weights for percentage-based programs like 5x5, 5/3/1, and Texas Method.' },
            { icon: '🎯', title: 'Goal Setting & Tracking', desc: 'Record your current 1RM and measure periodically to visualize strength gains over time.' },
            { icon: '🏋️', title: 'Plate Loading Optimization', desc: 'No more mental math at the gym—instantly see which plates to load on each side of the bar.' },
            { icon: '📸', title: 'Social Sharing', desc: 'Export results in Instagram Story format (9:16) to share your lifting achievements.' },
          ],
          steps: [
            { step: 'Enter weight and reps', desc: 'Input the weight (kg) and repetitions from your recent set. Example: 100kg × 8 reps' },
            { step: 'Check calculated 1RM', desc: 'View your estimated 1RM calculated via the Epley formula. Use this as your training baseline.' },
            { step: 'Select barbell weight', desc: "Choose whether you're using a 20kg Olympic bar or 15kg women's bar." },
            { step: 'Enter target weight and view plates', desc: 'Input your desired total weight to see a visual barbell graphic with IWF-standard colored plates and a detailed plate list.' },
          ],
          faqs: [
            { q: 'How accurate is the Epley formula?', a: "The Epley formula, published by Bruce Epley in 1985, has a research-proven accuracy within 3-5% margin of error. It's most accurate in the 6-10 rep range and is the standard in bodybuilding and powerlifting communities." },
            { q: 'Why are the plate colors different from my gym?', a: 'This tool follows the International Weightlifting Federation (IWF) standard color codes: Red (25kg), Blue (20kg), Yellow (15kg), Green (10kg), White (5kg), Black (2.5kg), Silver (1.25kg). Some gyms use different color schemes.' },
            { q: 'How do I use my 1RM for training?', a: '80-85% of 1RM is ideal for hypertrophy, 85-95% for strength, and 95%+ for power training. Programs like 5x5 typically use 75-85% of your 1RM.' },
            { q: "Image save isn't working", a: 'Disable popup blockers or allow download permissions in your browser. On some mobile browsers, images auto-save to the Downloads folder.' },
          ],
        }}
      />
    </div>
  );
}
