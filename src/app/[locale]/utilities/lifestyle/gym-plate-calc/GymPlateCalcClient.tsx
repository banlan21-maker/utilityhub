'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useMemo } from 'react';
import { Dumbbell, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import html2canvas from 'html2canvas';
import s from './gym.module.css';

// IWF 표준 컬러
const PLATE_COLORS: Record<number, string> = {
  25: '#EF4444',   // Red
  20: '#3B82F6',   // Blue
  15: '#FBBF24',   // Yellow
  10: '#10B981',   // Green
  5: '#F3F4F6',    // White
  2.5: '#1F2937',  // Black
  1.25: '#9CA3AF', // Silver
};

// 실측 비율 반영 (디스크 지름과 두께를 단계별 차등)
const PLATE_SIZE: Record<number, { w: number; h: number }> = {
  25:   { w: 22, h: 92 },
  20:   { w: 20, h: 86 },
  15:   { w: 18, h: 78 },
  10:   { w: 16, h: 68 },
  5:    { w: 13, h: 56 },
  2.5:  { w: 10, h: 44 },
  1.25: { w: 8,  h: 36 },
};

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

interface PlateCount {
  weight: number;
  count: number;
  color: string;
}

export default function GymPlateCalcClient() {
  const t = useTranslations('GymPlate');
  const locale = useLocale();
  const isKorean = locale === 'ko';
  const resultRef = useRef<HTMLDivElement>(null);

  // 1RM Calculator
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRM, setOneRM] = useState<number | null>(null);
  const [oneRMError, setOneRMError] = useState('');

  // Plate Loader
  const [targetWeight, setTargetWeight] = useState('');
  const [barbellWeight, setBarbellWeight] = useState(20);
  const [plates, setPlates] = useState<PlateCount[] | null>(null);
  const [plateError, setPlateError] = useState('');
  const [actualWeight, setActualWeight] = useState(0); // 실제 맞춘 무게
  const [targetSnapshot, setTargetSnapshot] = useState(0); // 사용자가 입력한 목표

  const repsNum = parseInt(reps, 10);
  const showRepsTip = !isNaN(repsNum) && (repsNum === 1 || repsNum >= 12);
  const repsTipText = useMemo(() => {
    if (!isNaN(repsNum) && repsNum === 1) return t('tip_1rm_one_rep');
    if (!isNaN(repsNum) && repsNum >= 12) return t('tip_1rm_high_reps');
    return '';
  }, [repsNum, t]);

  // 1RM 계산 (Epley 공식, r=1 특수 처리)
  const calculate1RM = () => {
    setOneRMError('');
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);

    if (isNaN(w) || isNaN(r) || w <= 0 || w > 999 || r <= 0 || r > 99) {
      setOneRMError(t('error_invalid'));
      setOneRM(null);
      return;
    }
    if (r > 15) {
      setOneRMError(t('error_reps_range'));
      setOneRM(null);
      return;
    }

    // r = 1 이면 입력값 = 1RM 그대로
    const result = r === 1 ? w : w * (1 + r / 30);
    setOneRM(Math.round(result * 10) / 10);
  };

  // 원판 계산 (그리디)
  const calculatePlates = () => {
    setPlateError('');
    setPlates(null);
    const target = parseFloat(targetWeight);

    if (isNaN(target) || target <= 0 || target > 999) {
      setPlateError(t('error_invalid'));
      return;
    }
    if (target < barbellWeight) {
      setPlateError(t('error_target_too_low', { n: barbellWeight }));
      return;
    }

    setTargetSnapshot(target);

    // 빈 바벨만 사용 (원판 없음)
    if (target === barbellWeight) {
      setPlates([]);
      setActualWeight(barbellWeight);
      return;
    }

    // 한쪽 면 무게
    let remainingPerSide = (target - barbellWeight) / 2;
    const usedPlates: PlateCount[] = [];
    let totalPerSide = 0;

    for (const plateWeight of PLATES) {
      const count = Math.floor(remainingPerSide / plateWeight);
      if (count > 0) {
        usedPlates.push({ weight: plateWeight, count, color: PLATE_COLORS[plateWeight] });
        remainingPerSide -= plateWeight * count;
        totalPerSide += plateWeight * count;
      }
    }

    setPlates(usedPlates);
    setActualWeight(totalPerSide * 2 + barbellWeight);
  };

  const totalPlateWeight = useMemo(() => actualWeight - barbellWeight, [actualWeight, barbellWeight]);
  const diff = useMemo(() => Math.round((targetSnapshot - actualWeight) * 100) / 100, [targetSnapshot, actualWeight]);
  const hasDiff = diff !== 0;

  // 이미지 저장
  const exportToImage = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
        useCORS: true,
      });
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
      alert(t('image_failed'));
    }
  };

  const hasResult = oneRM !== null || plates !== null;

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
          }}
        >
          <Dumbbell size={40} color="#8b5cf6" />
        </div>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
          }}
        >
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('subtitle')}</p>
      </header>

      {/* Result Area (capture target) — 타이틀 + 워터마크 포함 */}
      <div ref={resultRef} className={s.result_area}>
        {/* Capture header (캡처 시 보이는 브랜드) */}
        <div className={s.capture_header}>
          <Dumbbell size={20} color="#8b5cf6" />
          <span>{t('title')}</span>
        </div>

        {/* 1RM Calculator */}
        <div className={s.tool_panel}>
          <h2 className={s.section_title}>{t('section_1rm')}</h2>

          <div className={s.input_row}>
            <div className={s.input_group}>
              <label className={s.label}>{t('weight_label')}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                className={s.input}
                inputMode="decimal"
                min="0"
                max="999"
                aria-label={t('weight_label')}
              />
            </div>

            <div className={s.input_group}>
              <label className={s.label}>{t('reps_label')}</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8"
                className={s.input}
                inputMode="numeric"
                min="1"
                max="15"
                aria-label={t('reps_label')}
              />
            </div>
          </div>

          {showRepsTip && (
            <div className={s.tip_box}>{repsTipText}</div>
          )}

          <button onClick={calculate1RM} className={s.calc_button}>
            {t('calc_1rm_btn')}
          </button>

          {oneRMError && <div className={s.error_box}>{oneRMError}</div>}

          {oneRM !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={s.result_card}
            >
              <p className={s.result_label}>{t('result_1rm')}</p>
              <p className={s.result_value}>{oneRM} kg</p>
            </motion.div>
          )}
        </div>

        {/* Plate Loader */}
        <div className={s.tool_panel}>
          <h2 className={s.section_title}>{t('section_plate')}</h2>

          <div className={s.barbell_selector}>
            <label className={s.label}>{t('barbell_label')}</label>
            <div className={s.radio_group}>
              {[20, 15].map((w) => (
                <label key={w} className={`${s.radio_label} ${barbellWeight === w ? s.radio_label_active : ''}`}>
                  <input
                    type="radio"
                    checked={barbellWeight === w}
                    onChange={() => setBarbellWeight(w)}
                  />
                  <span>{w}kg</span>
                </label>
              ))}
            </div>
          </div>

          <div className={s.input_group}>
            <label className={s.label}>{t('target_label')}</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="140"
              className={s.input}
              inputMode="decimal"
              min="0"
              max="999"
              aria-label={t('target_label')}
            />
          </div>

          <button onClick={calculatePlates} className={s.calc_button}>
            {t('calc_plate_btn')}
          </button>

          {plateError && <div className={s.error_box}>{plateError}</div>}

          {plates !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={s.plate_result}
            >
              {plates.length === 0 ? (
                <p className={s.info_text}>{t('info_empty_bar')}</p>
              ) : (
                <p className={s.info_text}>
                  {t('plates_per_side')}: <strong>{totalPlateWeight / 2} kg</strong>
                </p>
              )}

              {/* 실제/목표 무게 차이 안내 */}
              {hasDiff && (
                <div className={s.diff_box}>
                  {t('warning_diff_under', {
                    actual: actualWeight,
                    diff: diff > 0 ? `-${diff}` : `+${Math.abs(diff)}`,
                  })}
                </div>
              )}

              {/* Barbell Visualization */}
              {plates.length > 0 && (
                <div className={s.barbell_visual}>
                  {/* Left Plates */}
                  <div className={s.plates_left}>
                    <AnimatePresence>
                      {plates.flatMap((plate, idx) =>
                        Array.from({ length: plate.count }).map((_, i) => {
                          const sz = PLATE_SIZE[plate.weight] ?? { w: 16, h: 56 };
                          return (
                            <motion.div
                              key={`left-${idx}-${i}`}
                              initial={{ x: -50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: (idx * plate.count + i) * 0.07 }}
                              className={s.plate}
                              style={{
                                backgroundColor: plate.color,
                                width: `${sz.w}px`,
                                height: `${sz.h}px`,
                                border: plate.weight === 5 ? '2px solid #cbd5e1' : 'none',
                                color: plate.weight === 5 ? '#1f2937' : 'white',
                                textShadow: plate.weight === 5 ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                              }}
                              title={`${plate.weight}kg`}
                            >
                              {plate.weight}
                            </motion.div>
                          );
                        }),
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Barbell Bar */}
                  <div className={s.barbell_bar}>
                    <span className={s.barbell_weight}>{barbellWeight}kg</span>
                  </div>

                  {/* Right Plates */}
                  <div className={s.plates_right}>
                    <AnimatePresence>
                      {plates.flatMap((plate, idx) =>
                        Array.from({ length: plate.count }).map((_, i) => {
                          const sz = PLATE_SIZE[plate.weight] ?? { w: 16, h: 56 };
                          return (
                            <motion.div
                              key={`right-${idx}-${i}`}
                              initial={{ x: 50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: (idx * plate.count + i) * 0.07 }}
                              className={s.plate}
                              style={{
                                backgroundColor: plate.color,
                                width: `${sz.w}px`,
                                height: `${sz.h}px`,
                                border: plate.weight === 5 ? '2px solid #cbd5e1' : 'none',
                                color: plate.weight === 5 ? '#1f2937' : 'white',
                                textShadow: plate.weight === 5 ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                              }}
                              title={`${plate.weight}kg`}
                            >
                              {plate.weight}
                            </motion.div>
                          );
                        }),
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Plate List */}
              {plates.length > 0 && (
                <div className={s.plate_list}>
                  <p className={s.list_title}>{t('plate_list_title')}</p>
                  {plates.map((plate, idx) => (
                    <div key={idx} className={s.plate_item}>
                      <div className={s.color_dot} style={{ backgroundColor: plate.color }} />
                      <span>{plate.weight}kg × {plate.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Capture watermark */}
        <div className={s.capture_footer}>{t('watermark')}</div>
      </div>

      {/* Save Button — 결과 영역 아래 + 결과가 있을 때만 활성화 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
        <button
          onClick={exportToImage}
          className={s.save_button}
          disabled={!hasResult}
          aria-label={t('save_button')}
          style={{ opacity: hasResult ? 1 : 0.5, cursor: hasResult ? 'pointer' : 'not-allowed' }}
        >
          <Download size={18} />
          {t('save_button')}
        </button>
      </div>

      {/* Share Bar */}
      <ShareBar
        title={t('title')}
        description={t('subtitle')}
      />

      {/* Related Tools */}
      <RelatedTools toolId="utilities/lifestyle/gym-plate-calc" limit={3} />

      {/* Ad */}
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '1RM 계산기란 무엇인가요?',
          description: "1RM(One Repetition Maximum)은 한 번에 들어 올릴 수 있는 최대 중량을 의미합니다. 직접 측정하기에는 부상 위험이 있어, Epley 공식을 사용하여 안전하게 예측합니다. 공식은 '1RM = 중량 × (1 + 반복횟수/30)'으로, 6~10회 구간에서 가장 정확합니다. 본 도구는 r=1을 입력하면 입력 중량을 그대로 1RM으로 반환하고, r이 12회 이상이거나 16회 이상이면 정확도 안내/입력 차단을 통해 비현실적 추정을 막습니다. 또한 원판 계산은 IWF 표준 컬러로 시각화되며, 그리디 알고리즘 상 입력 무게와 실제 맞춤 무게가 다른 경우 차이를 명시적으로 안내합니다.",
          useCases: [
            { icon: '📊', title: '운동 프로그램 설계', desc: '5x5, 5/3/1 등 퍼센티지 기반 프로그램을 위한 정확한 중량 계산에 활용하세요.' },
            { icon: '🎯', title: '목표 설정 및 추적', desc: '현재 1RM을 기록하고 주기적으로 측정하여 근력 향상을 시각적으로 확인하세요.' },
            { icon: '🏋️', title: '원판 세팅 최적화', desc: '헬스장에서 암산 없이 바로 원판을 세팅할 수 있어 운동 집중도가 높아집니다.' },
            { icon: '📸', title: 'SNS 공유', desc: '인스타그램 스토리 규격으로 저장하여 운동 기록을 친구들과 공유하세요.' },
          ],
          steps: [
            { step: '중량과 반복 횟수 입력', desc: '최근 세트에서 수행한 중량(kg)과 반복 횟수(1~15회)를 입력합니다. 12회 이상은 정확도가 떨어집니다.' },
            { step: '1RM 계산 확인', desc: 'Epley 공식으로 계산된 예상 1RM을 확인합니다. r=1은 입력값 그대로 반환됩니다.' },
            { step: '바벨 무게 선택', desc: '사용할 바벨이 20kg인지 15kg인지 선택합니다 (올림픽 바벨 vs 여성용 바벨).' },
            { step: '목표 중량 입력 및 원판 확인', desc: '들고 싶은 총 중량을 입력하면 IWF 표준 컬러 원판이 시각화됩니다. 입력값과 실제 맞춤값이 다르면 차이를 자동 표시합니다.' },
          ],
          faqs: [
            { q: 'Epley 공식은 얼마나 정확한가요?', a: '1985년 Bruce Epley가 발표한 공식으로, 6~10회 반복 구간에서 평균 오차 3~5% 이내입니다. 본 도구는 12회 이상 입력 시 정확도 안내를, 16회 이상은 입력 차단으로 비현실적 추정(예: r=30 → 1RM 2배)을 방지합니다.' },
            { q: '원판 색깔이 헬스장과 다른데요?', a: 'IWF(국제 역도 연맹) 표준 컬러: 빨강(25kg), 파랑(20kg), 노랑(15kg), 초록(10kg), 하양(5kg), 검정(2.5kg), 은색(1.25kg). 일부 헬스장은 다른 색상을 사용할 수 있습니다.' },
            { q: '목표 무게가 정확히 맞춰지지 않을 때는?', a: '본 도구는 1.25kg 단위로만 원판을 조합할 수 있어 일부 무게(예: 142kg)는 정확히 맞출 수 없습니다. 그리디 알고리즘으로 가장 가까운 조합을 계산하고, 차이가 발생하면 결과 카드 위에 노란 박스로 차이를 명시합니다.' },
            { q: '이미지 저장이 안 돼요', a: '브라우저 팝업 차단 해제 또는 다운로드 권한 허용 필요. 일부 모바일 브라우저는 "다운로드" 폴더에 자동 저장됩니다. 결과가 없으면 저장 버튼이 비활성화됩니다.' },
          ],
        }}
        en={{
          title: 'What is a 1RM Calculator?',
          description: "1RM (One Repetition Maximum) is the maximum weight you can lift for one repetition. Direct testing carries injury risk, so we use the Epley formula for safe estimation: 1RM = Weight × (1 + Reps/30). The formula is most accurate in the 6–10 rep range. This tool returns your input weight unchanged when reps = 1, shows an accuracy warning at 12+ reps, and blocks input above 15 reps to prevent unrealistic estimates (e.g., 30 reps → 2× weight). Plate loading is visualized with IWF standard colors, and when greedy plate combinations cannot exactly match the target weight, the difference is explicitly shown so users are not misled.",
          useCases: [
            { icon: '📊', title: 'Program Design', desc: 'Calculate precise weights for percentage-based programs like 5x5, 5/3/1, and Texas Method.' },
            { icon: '🎯', title: 'Goal Setting & Tracking', desc: 'Record your current 1RM and measure periodically to visualize strength gains over time.' },
            { icon: '🏋️', title: 'Plate Loading Optimization', desc: 'No more mental math at the gym — instantly see which plates to load on each side of the bar.' },
            { icon: '📸', title: 'Social Sharing', desc: 'Export results in Instagram Story format (9:16) to share your lifting achievements.' },
          ],
          steps: [
            { step: 'Enter weight and reps', desc: 'Input the weight (kg) and reps from your recent set (1–15 recommended). 12+ reps lose accuracy.' },
            { step: 'Check calculated 1RM', desc: 'View your estimated 1RM via the Epley formula. A single-rep entry returns your input weight as-is.' },
            { step: 'Select barbell weight', desc: "Choose whether you're using a 20kg Olympic bar or 15kg women's bar." },
            { step: 'Enter target & view plates', desc: 'Input your desired total weight to see IWF-standard colored plates. If the greedy combo cannot match exactly, the difference from your target is shown.' },
          ],
          faqs: [
            { q: 'How accurate is the Epley formula?', a: "Published by Bruce Epley in 1985, accuracy is within 3–5% in the 6–10 rep range. This tool warns at 12+ reps and blocks input above 15 reps to prevent unrealistic estimates like 30 reps producing 2× the input weight." },
            { q: 'Why are the plate colors different from my gym?', a: 'This tool follows the International Weightlifting Federation (IWF) standard: Red (25kg), Blue (20kg), Yellow (15kg), Green (10kg), White (5kg), Black (2.5kg), Silver (1.25kg). Some gyms use different schemes.' },
            { q: 'What if my target weight cannot be matched exactly?', a: 'Plates only come in 1.25kg increments, so some targets (e.g., 142kg) cannot be matched exactly. The tool uses a greedy algorithm to find the closest combination and displays the actual weight and difference from your target above the visualization.' },
            { q: "Image save isn't working", a: 'Disable popup blockers or allow download permissions in your browser. On some mobile browsers, images auto-save to the Downloads folder. The save button is disabled until you have a calculated result.' },
          ],
        }}
      />
    </div>
  );
}
