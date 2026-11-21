'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';

export default function BmiCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('BmiWater');

  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [activity, setActivity] = useState<string>('activityNormal');

  const [results, setResults] = useState<{
    bmi: number;
    status: string;
    statusKey: string;
    waterLimit: number;
    cups: number;
  } | null>(null);

  const calculate = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);

    if (isNaN(h) || h <= 0 || isNaN(w) || w <= 0) return;

    // BMI = weight (kg) / height (m)^2
    const bmi = w / (h * h);

    let statusKey = 'statusNormal';
    if (bmi < 18.5) statusKey = 'statusUnderweight';
    else if (bmi < 25) statusKey = 'statusNormal';
    else if (bmi < 30) statusKey = 'statusOverweight';
    else statusKey = 'statusObese';

    // Water intake: Approx 30-35ml per kg, plus activity adjustment
    let baseWater = w * 33;
    if (activity === 'activityHigh') baseWater += 500;
    if (activity === 'activityLow') baseWater -= 200;

    setResults({
      bmi: parseFloat(bmi.toFixed(1)),
      status: t(statusKey),
      statusKey,
      waterLimit: Math.round(baseWater),
      cups: Math.round(baseWater / 200) // Standard 200ml cup
    });
  };

  const getStatusColor = (key: string) => {
    switch(key) {
      case 'statusUnderweight': return '#3498db';
      case 'statusNormal': return '#2ecc71';
      case 'statusOverweight': return '#f1c40f';
      case 'statusObese': return '#e74c3c';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="max-w-[var(--tool-width)] mx-auto">
      <NavigationActions />
      <ToolHeader icon={<Activity />} title={t('title')} subtitle={t('description')} />

      <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
        {/* Input Form */}
        <div className={`${ui.card} flex flex-col gap-5`}>
          <div className={ui.field}>
            <label className={ui.label}>{t('height')}</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className={`${ui.input} ${ui.inputLg}`}
            />
          </div>

          <div className={ui.field}>
            <label className={ui.label}>{t('weight')}</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              className={`${ui.input} ${ui.inputLg}`}
            />
          </div>

          <div className={ui.field}>
            <label className={ui.label}>{t('activity')}</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className={ui.input}
            >
              <option value="activityLow">{t('activityLow')}</option>
              <option value="activityNormal">{t('activityNormal')}</option>
              <option value="activityHigh">{t('activityHigh')}</option>
            </select>
          </div>

          <button
            onClick={calculate}
            className={`${ui.button} ${ui.primary} ${ui.block} ${ui.lg}`}
          >
            {t('calculate')}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col gap-6">
          {results ? (
            <>
              {/* BMI Card */}
              <div className={`${ui.card} animate-scale-in`} style={{ borderTop: `4px solid ${getStatusColor(results.statusKey)}` }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('bmiResult')}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800 }}>{results.bmi}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: getStatusColor(results.statusKey) }}>
                    [{results.status}]
                  </span>
                </div>
              </div>

              {/* Water Intake Card */}
              <div className="glass-panel animate-scale-in" style={{ padding: '2rem', background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', color: 'white' }}>
                <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('waterResult')}</p>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                  {results.waterLimit} ml / {t('cups', { count: results.cups })}
                </div>

                {/* Visual Cups */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {Array.from({ length: Math.min(results.cups, 20) }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem' }}>💧</span>
                  ))}
                  {results.cups > 20 && <span>...</span>}
                </div>

                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('cupGuide')}</p>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {t('notice')}
              </p>
            </>
          ) : (
            <div className={`${ui.card} flex-1 flex items-center justify-center`} style={{ color: 'var(--text-muted)' }}>
              <p>{t('emptyState')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/bmi-calc" />


      {seo}
    </div>
  );
}
