'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';

export default function PetCalorieClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('PetFood');

  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [weight, setWeight] = useState<string>('');
  const [ageStage, setAgeStage] = useState<string>('adult');
  const [activity, setActivity] = useState<string>('normal');
  const [foodKcal, setFoodKcal] = useState<string>('3500');

  const [results, setResults] = useState<{
    rer: number;
    der: number;
    foodAmount: number;
  } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const fk = parseFloat(foodKcal);

    if (isNaN(w) || w <= 0 || isNaN(fk) || fk <= 0) return;

    // RER (Resting Energy Requirement) = 70 * (weight^0.75)
    const rer = 70 * Math.pow(w, 0.75);

    // Factors for DER (Daily Energy Requirement)
    let factor = 1.0;
    if (petType === 'dog') {
      switch (ageStage) {
        case 'puppy': factor = 3.0; break;
        case 'adultIntact': factor = 1.8; break;
        case 'adult': factor = 1.6; break;
        case 'senior': factor = 1.4; break;
        case 'obese': factor = 1.0; break;
        default: factor = 1.6;
      }
      if (activity === 'high') factor += 0.4;
      if (activity === 'low') factor -= 0.2;
    } else {
      switch (ageStage) {
        case 'puppy': factor = 2.5; break;
        case 'adultIntact': factor = 1.4; break;
        case 'adult': factor = 1.2; break;
        case 'senior': factor = 1.1; break;
        case 'obese': factor = 0.8; break;
        default: factor = 1.2;
      }
      if (activity === 'high') factor += 0.3;
      if (activity === 'low') factor -= 0.1;
    }

    const der = rer * factor;
    const foodAmount = (der / fk) * 1000; // in grams

    setResults({
      rer: Math.round(rer),
      der: Math.round(der),
      foodAmount: Math.round(foodAmount)
    });
  };

  return (
    <div className="max-w-[var(--tool-width)] mx-auto">
      <NavigationActions />
      <ToolHeader icon={<Heart />} title={t('title')} subtitle={t('description')} />

      <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
        {/* Input Section */}
        <div className={ui.card}>
          <div className={ui.field} style={{ marginBottom: '1.5rem' }}>
            <label className={ui.label}>{t('petType')}</label>
            <div className={ui.segmented}>
              <button
                onClick={() => setPetType('dog')}
                className={`${ui.segment} ${petType === 'dog' ? ui.segmentActive : ''}`}
              >
                🐶 {t('dog')}
              </button>
              <button
                onClick={() => setPetType('cat')}
                className={`${ui.segment} ${petType === 'cat' ? ui.segmentActive : ''}`}
              >
                🐱 {t('cat')}
              </button>
            </div>
          </div>

          <div className={ui.field} style={{ marginBottom: '1.5rem' }}>
            <label className={ui.label}>{t('weight')}</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className={`${ui.input} ${ui.inputLg}`}
            />
          </div>

          <div className={ui.field} style={{ marginBottom: '1.5rem' }}>
            <label className={ui.label}>{t('age')}</label>
            <select
              value={ageStage}
              onChange={(e) => setAgeStage(e.target.value)}
              className={ui.input}
            >
              <option value="puppy">{t('puppy')}</option>
              <option value="adult">{t('adult')}</option>
              <option value="adultIntact">{t('adultIntact')}</option>
              <option value="senior">{t('senior')}</option>
              <option value="obese">{t('obese')}</option>
            </select>
          </div>

          <div className={ui.field} style={{ marginBottom: '1.5rem' }}>
            <label className={ui.label}>{t('activity')}</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className={ui.input}
            >
              <option value="low">{t('low')}</option>
              <option value="normal">{t('normal')}</option>
              <option value="high">{t('high')}</option>
            </select>
          </div>

          <div className={ui.field} style={{ marginBottom: '2rem' }}>
            <label className={ui.label}>{t('foodKcal')}</label>
            <input
              type="number"
              value={foodKcal}
              onChange={(e) => setFoodKcal(e.target.value)}
              className={ui.input}
            />
          </div>

          <button
            onClick={calculate}
            className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`}
          >
            {t('calculate')}
          </button>
        </div>

        {/* Result Section */}
        <div className="flex flex-col gap-4">
          {results ? (
            <div className={`${ui.card} animate-scale-in`} style={{ flex: 1, border: '2px solid var(--color-primary)' }}>
              <h2 className={ui.cardTitle}>Calculation Results</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('resultRer')}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{results.rer} <span style={{ fontSize: '1rem', fontWeight: 400 }}>{t('kcalPerDay')}</span></p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('resultDer')}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{results.der} <span style={{ fontSize: '1rem', fontWeight: 400 }}>{t('kcalPerDay')}</span></p>
                </div>

                <div className={ui.result}>
                  <p className={ui.resultLabel}>{t('resultFood')}</p>
                  <p className={ui.resultValue}>{results.foodAmount} <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>{t('gramPerDay')}</span></p>
                </div>
              </div>

              <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {t('notice')}
              </p>
            </div>
          ) : (
            <div className={`${ui.card} flex items-center justify-center`} style={{ flex: 1, opacity: 0.5 }}>
              <p style={{ textAlign: 'center' }}>{t('emptyResult')}</p>
            </div>
          )}
        </div>
      </div>


      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/pet-calorie" />


      {seo}
    </div>
  );
}
