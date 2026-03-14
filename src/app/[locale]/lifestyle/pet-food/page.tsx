'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

export default function PetFoodCalculatorPage() {
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
    <div className="max-w-4xl mx-auto">
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '2.5rem' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {t('description')}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
        {/* Input Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('petType')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setPetType('dog')}
                className={petType === 'dog' ? 'active-tab' : 'tab'}
                style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', border: 'none' }}
              >
                🐶 {t('dog')}
              </button>
              <button 
                onClick={() => setPetType('cat')}
                className={petType === 'cat' ? 'active-tab' : 'tab'}
                style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', border: 'none' }}
              >
                🐱 {t('cat')}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('weight')}</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('age')}</label>
            <select 
              value={ageStage}
              onChange={(e) => setAgeStage(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'inherit' }}
            >
              <option value="puppy">{t('puppy')}</option>
              <option value="adult">{t('adult')}</option>
              <option value="adultIntact">{t('adultIntact')}</option>
              <option value="senior">{t('senior')}</option>
              <option value="obese">{t('obese')}</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('activity')}</label>
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'inherit' }}
            >
              <option value="low">{t('low')}</option>
              <option value="normal">{t('normal')}</option>
              <option value="high">{t('high')}</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('foodKcal')}</label>
            <input 
              type="number" 
              value={foodKcal}
              onChange={(e) => setFoodKcal(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
            />
          </div>

          <button 
            onClick={calculate}
            className="primary-button"
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            {t('calculate')}
          </button>
        </div>

        {/* Result Section */}
        <div className="flex flex-col gap-4">
          {results ? (
            <div className="glass-panel animate-scale-in" style={{ padding: '2rem', flex: 1, border: '2px solid var(--primary)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Calculation Results</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('resultRer')}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{results.rer} <span style={{ fontSize: '1rem', fontWeight: 400 }}>{t('kcalPerDay')}</span></p>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('resultDer')}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{results.der} <span style={{ fontSize: '1rem', fontWeight: 400 }}>{t('kcalPerDay')}</span></p>
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--primary-gradient)', borderRadius: '12px', color: 'white' }}>
                  <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('resultFood')}</p>
                  <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{results.foodAmount} <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>{t('gramPerDay')}</span></p>
                </div>
              </div>

              <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {t('notice')}
              </p>
            </div>
          ) : (
            <div className="glass-panel flex items-center justify-center" style={{ padding: '2rem', flex: 1, opacity: 0.5 }}>
              <p style={{ textAlign: 'center' }}>정보를 입력하고 계산하기 버튼을 눌러주세요.</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .tab {
          background: var(--surface);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .tab:hover {
          background: var(--surface-hover);
          border-color: var(--primary);
          color: var(--primary);
        }
        .active-tab {
          background: var(--primary) !important;
          color: white !important;
          border: 1px solid var(--primary) !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3) !important;
        }
        .primary-button {
          background: var(--primary) !important;
          color: white !important;
          border: none;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .primary-button:hover {
          background: var(--primary-hover) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
        }
        .primary-button:active {
          transform: translateY(-1px);
        }
      `}</style>

      <SeoSection
        title="반려동물 사료량 & 칼로리 계산기란 무엇인가요?"
        description="반려동물 사료량 계산기는 강아지(개)와 고양이의 체중, 생애 단계, 활동량을 입력하면 기초 대사량(RER)과 일일 권장 칼로리(DER)를 과학적으로 계산하고, 사료 칼로리를 입력하면 하루 급여해야 할 사료량(g)까지 알려주는 도구입니다. 국제 수의영양학 공식(RER = 70 × 체중^0.75)을 기반으로 하며, 반려동물의 건강한 체중 유지와 비만 예방을 위한 정확한 사료량을 파악하는 데 도움이 됩니다."
        useCases={[
          { icon: '🐶', title: '강아지 다이어트 관리', desc: '과체중 강아지의 일일 권장 칼로리를 계산해 체중 감량에 필요한 사료 감소량을 파악하고 다이어트 식이 계획을 세웁니다.' },
          { icon: '🐱', title: '고양이 성장기 영양 관리', desc: '자묘(키튼) 시기에는 성묘보다 많은 칼로리가 필요합니다. 성장기에 맞는 적정 사료량으로 건강한 성장을 지원합니다.' },
          { icon: '🏥', title: '수의사 상담 전 사전 점검', desc: '동물병원 방문 전 반려동물의 일일 칼로리 섭취량을 계산해 의사와 영양 상담을 더 효과적으로 진행합니다.' },
          { icon: '🛒', title: '사료 구매 & 한 달 소비량 예측', desc: '일일 권장 사료량을 기준으로 한 달 소비량을 계산해 경제적으로 사료를 구매하고 재고를 관리합니다.' },
        ]}
        steps={[
          { step: '반려동물 정보 입력', desc: '종류(강아지/고양이), 체중(kg), 생애 단계(자견~노령), 활동량(낮음/보통/높음)을 선택합니다.' },
          { step: '사료 칼로리 입력', desc: '현재 급여 중인 사료의 칼로리(kcal/kg)를 입력합니다. 사료 봉투 뒷면이나 제조사 홈페이지에서 확인할 수 있습니다.' },
          { step: '권장 사료량 확인', desc: '기초 대사량(RER), 일일 권장 칼로리(DER), 하루 권장 사료량(g)이 계산됩니다. 아침·저녁 2회 급여 시 절반씩 나눠주세요.' },
        ]}
        faqs={[
          { q: '계산된 사료량과 사료 봉투의 급여량 기준이 다릅니다', a: '사료 봉투의 급여량은 제조사 기준으로 다소 많이 제시되는 경향이 있습니다. 이 계산기는 개별 반려동물의 체중과 활동량을 반영하므로 더 정밀합니다. 처음에는 계산량을 기준으로 2~3주간 급여 후 체중 변화를 모니터링하세요.' },
          { q: '중성화 수술 후 사료량을 줄여야 하나요?', a: '네. 중성화 후에는 기초 대사율이 약 20~30% 낮아져 같은 양을 먹어도 살이 찌기 쉽습니다. 생애 단계에서 "성견/성묘 (중성화 완료)"를 선택하면 이를 반영한 권장량이 계산됩니다.' },
          { q: '반려동물이 계산된 양보다 훨씬 많이 먹으려 합니다', a: '하루 급여량을 한 번에 주지 말고 2~3회로 나눠 급여하면 포만감이 높아집니다. 또한 식이섬유가 풍부한 사료나 물을 사료와 함께 제공하면 과식 충동을 줄일 수 있습니다.' },
        ]}
      />
    </div>
  );
}
