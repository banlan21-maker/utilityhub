'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useMemo } from 'react';
import { Dumbbell, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import html2canvas from 'html2canvas';
import s from './gym.module.css';
import { ui } from '@/app/components/ui';

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

export default function GymPlateCalcClient({ seo }: { seo?: React.ReactNode }) {
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
        // html2canvas는 CSS 변수를 못 읽으므로 현재 테마의 실제 색을 넘긴다
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface-hover').trim() || '#f8fafc',
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

      <ToolHeader icon={<Dumbbell />} title={t('title')} subtitle={t('subtitle')} />

      {/* Result Area (capture target) — 타이틀 + 워터마크 포함 */}
      <div ref={resultRef} className={s.result_area}>
        {/* Capture header (캡처 시 보이는 브랜드) */}
        <div className={s.capture_header}>
          <Dumbbell size={20} />
          <span>{t('title')}</span>
        </div>

        {/* 1RM Calculator */}
        <div className={`${ui.card} ${s.tool_panel}`}>
          <h2 className={ui.cardTitle}>{t('section_1rm')}</h2>

          <div className={s.input_row}>
            <div className={ui.field}>
              <label className={ui.label}>{t('weight_label')}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                className={`${ui.input} ${ui.inputLg}`}
                inputMode="decimal"
                min="0"
                max="999"
                aria-label={t('weight_label')}
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label}>{t('reps_label')}</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8"
                className={`${ui.input} ${ui.inputLg}`}
                inputMode="numeric"
                min="1"
                max="15"
                aria-label={t('reps_label')}
              />
            </div>
          </div>

          {showRepsTip && (
            <div className={ui.notice}>{repsTipText}</div>
          )}

          <button onClick={calculate1RM} className={`${ui.button} ${ui.primary} ${ui.block}`}>
            {t('calc_1rm_btn')}
          </button>

          {oneRMError && <div className={`${ui.notice} ${ui.red}`}>{oneRMError}</div>}

          {oneRM !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${ui.result} ${s.result_card}`}
            >
              <p className={ui.resultLabel}>{t('result_1rm')}</p>
              <p className={ui.resultValue}>{oneRM} kg</p>
            </motion.div>
          )}
        </div>

        {/* Plate Loader */}
        <div className={`${ui.card} ${s.tool_panel}`}>
          <h2 className={ui.cardTitle}>{t('section_plate')}</h2>

          <div className={ui.field}>
            <label className={ui.label}>{t('barbell_label')}</label>
            <div className={`${ui.chips} ${s.radio_group}`}>
              {[20, 15].map((w) => (
                <label key={w} className={`${ui.chip} ${barbellWeight === w ? ui.chipActive : ''}`}>
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

          <div className={ui.field}>
            <label className={ui.label}>{t('target_label')}</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="140"
              className={`${ui.input} ${ui.inputLg}`}
              inputMode="decimal"
              min="0"
              max="999"
              aria-label={t('target_label')}
            />
          </div>

          <button onClick={calculatePlates} className={`${ui.button} ${ui.primary} ${ui.block}`}>
            {t('calc_plate_btn')}
          </button>

          {plateError && <div className={`${ui.notice} ${ui.red}`}>{plateError}</div>}

          {plates !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                <div className={`${ui.notice} ${ui.amber} ${s.diff_box}`}>
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
          className={`${ui.button} ${ui.primary} ${s.save_button}`}
          disabled={!hasResult}
          aria-label={t('save_button')}
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
      <RelatedTools toolId="utilities/lifestyle/gym-plate-calc" />

      {/* Ad */}

      {seo}
    </div>
  );
}
