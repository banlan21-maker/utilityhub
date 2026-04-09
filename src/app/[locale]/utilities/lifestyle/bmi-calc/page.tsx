'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === 'ko';
  const title = isKo
    ? 'BMI 계산기 & 일일 수분 섭취량 계산기 | Utility Hub'
    : 'BMI Calculator & Daily Water Intake Guide | Utility Hub';
  const description = isKo
    ? '키와 몸무게로 체질량지수(BMI)를 계산하고 활동량 기반 일일 권장 수분 섭취량을 확인하세요'
    : 'Calculate your BMI and recommended daily water intake based on your weight and activity level — free and instant.';
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/lifestyle/bmi-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/bmi-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/bmi-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BMI 계산기 & 수분 섭취량 계산기',
  alternateName: 'BMI Calculator & Daily Water Intake',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/bmi-calc',
  description: '키와 몸무게로 체질량지수(BMI)를 계산하고 활동량 기반 일일 권장 수분 섭취량을 확인하세요',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'BMI가 높으면 반드시 건강에 문제가 있나요?', acceptedAnswer: { '@type': 'Answer', text: 'BMI는 빠른 체중 상태 평가를 위한 참고 지표입니다. 근육량이 많은 운동선수는 BMI가 높아도 건강할 수 있으며, 노인의 경우 정상 BMI여도 근감소증이 있을 수 있습니다. 정확한 진단은 의료 전문가와 상담하세요.' } },
    { '@type': 'Question', name: '하루 물을 얼마나 마셔야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '일반적으로 체중(kg) × 30~35ml가 기본 권장량입니다. 예를 들어 60kg이라면 1,800~2,100ml(약 9~10잔)입니다. 더운 날씨, 운동 후, 고섬유질 식단에서는 추가 수분이 필요합니다.' } },
    { '@type': 'Question', name: '아시아인 기준 BMI는 서양인과 다른가요?', acceptedAnswer: { '@type': 'Answer', text: '네. WHO 아시아·태평양 권고 기준은 정상 범위를 18.5~22.9로 설정해 서양 기준(18.5~24.9)보다 낮습니다. 이 도구는 일반 WHO 기준을 사용하며, 아시아인은 25 미만이어도 과체중 위험을 고려할 필요가 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function BmiWaterCalculatorPage() {
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
    <div className="max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />
      <header style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Activity size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
        {/* Input Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('height')}</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('weight')}</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('activity')}</label>
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'inherit' }}
            >
              <option value="activityLow">{t('activityLow')}</option>
              <option value="activityNormal">{t('activityNormal')}</option>
              <option value="activityHigh">{t('activityHigh')}</option>
            </select>
          </div>

          <button 
            onClick={calculate}
            className="primary-button"
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            {t('calculate')}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col gap-6">
          {results ? (
            <>
              {/* BMI Card */}
              <div className="glass-panel animate-scale-in" style={{ padding: '2rem', borderTop: `4px solid ${getStatusColor(results.statusKey)}` }}>
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
            <div className="glass-panel flex-1 flex items-center justify-center opacity-50" style={{ padding: '2rem' }}>
              <p>{t('emptyState')}</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
        input, select {
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }
        input:focus, select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
          outline: none;
        }
      `}</style>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/bmi-calc" />

      {/* 광고 영역 */}
      <div style={{
        width: '100%',
        minHeight: '90px',
        background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        margin: '2rem 0'
      }}>
        광고 영역
      </div>

      <SeoSection
        ko={{
          title: "BMI 계산기 & 일일 권장 수분 섭취량이란 무엇인가요?",
          description: "BMI 계산기(체질량지수 계산기)는 키와 몸무게를 입력하면 체질량지수(Body Mass Index)를 계산하고, 저체중/정상/과체중/비만을 즉시 판별해주는 건강 도구입니다. 동시에 체중과 활동량을 기반으로 하루에 마셔야 하는 물의 양(ml 및 컵 수)도 계산합니다. WHO 기준 정상 BMI 범위(18.5~24.9)와 비교해 현재 체중 상태를 확인하고, 건강한 체중 유지를 위한 수분 섭취 습관 형성에 도움이 됩니다.",
          useCases: [
            { icon: '🏃', title: '다이어트 & 체중 관리', desc: '다이어트 목표 설정 전 현재 BMI를 파악하고, 이상 체중 달성까지의 변화 목표를 수치로 확인합니다.' },
            { icon: '💧', title: '수분 섭취 습관 개선', desc: '활동량에 맞는 일일 권장 수분 섭취량(컵 수)을 확인해 물 마시는 습관을 데이터 기반으로 개선합니다.' },
            { icon: '🏥', title: '건강검진 전 자가 체크', desc: '건강검진이나 의사 상담 전 자신의 BMI 범위를 미리 확인해 건강 상태에 대한 기초적인 이해를 높입니다.' },
            { icon: '🎯', title: '피트니스 목표 설정', desc: '헬스 트레이너 상담 전 기초 데이터를 파악하거나, 운동 계획 수립 시 현재 체중 상태를 객관적으로 평가합니다.' },
          ],
          steps: [
            { step: '키 & 몸무게 입력', desc: '신장(cm)과 체중(kg)을 입력합니다. 정확한 측정값을 사용할수록 더 정확한 결과를 얻을 수 있습니다.' },
            { step: '활동량 선택', desc: '평소 활동량(거의 없음 / 적당함 / 매우 활동적)을 선택합니다. 수분 섭취 권장량 계산에 반영됩니다.' },
            { step: '계산 결과 확인', desc: 'BMI 수치와 상태(저체중/정상/과체중/비만)가 표시되고, 하루 권장 수분 섭취량이 ml와 컵 수로 안내됩니다.' },
            { step: '결과 공유 & 목표 설정', desc: '계산된 BMI와 수분 섭취량을 바탕으로 체중 관리 목표를 설정하세요. SNS 공유 버튼으로 친구에게 도구를 소개할 수도 있습니다.' },
          ],
          faqs: [
            { q: 'BMI가 높으면 반드시 건강에 문제가 있나요?', a: 'BMI는 빠른 체중 상태 평가를 위한 참고 지표입니다. 근육량이 많은 운동선수는 BMI가 높아도 건강할 수 있으며, 노인의 경우 정상 BMI여도 근감소증이 있을 수 있습니다. 정확한 진단은 의료 전문가와 상담하세요.' },
            { q: '하루 물을 얼마나 마셔야 하나요?', a: '일반적으로 체중(kg) × 30~35ml가 기본 권장량입니다. 예를 들어 60kg이라면 1,800~2,100ml(약 9~10잔)입니다. 더운 날씨, 운동 후, 고섬유질 식단에서는 추가 수분이 필요합니다.' },
            { q: '아시아인 기준 BMI는 서양인과 다른가요?', a: '네. WHO 아시아·태평양 권고 기준은 정상 범위를 18.5~22.9로 설정해 서양 기준(18.5~24.9)보다 낮습니다. 이 도구는 일반 WHO 기준을 사용하며, 아시아인은 25 미만이어도 과체중 위험을 고려할 필요가 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is a BMI Calculator & Daily Water Intake Guide?",
          description: "A BMI Calculator computes your Body Mass Index from height and weight, instantly classifying you as underweight, normal, overweight, or obese based on WHO standards. At the same time, it calculates your recommended daily water intake (in ml and cups) based on your body weight and activity level. Use it to check your current weight status against the healthy BMI range (18.5–24.9) and build better hydration habits.",
          useCases: [
            { icon: '🏃', title: 'Diet & Weight Management', desc: 'Check your current BMI before setting diet goals and quantify how far you are from your ideal weight.' },
            { icon: '💧', title: 'Improve Hydration Habits', desc: 'Find your personalized daily water intake recommendation (in cups) matched to your activity level and build data-driven hydration routines.' },
            { icon: '🏥', title: 'Pre-Checkup Self-Assessment', desc: 'Understand your BMI range before a medical checkup or doctor consultation to go in better informed.' },
            { icon: '🎯', title: 'Fitness Goal Setting', desc: 'Get baseline metrics before consulting a personal trainer or building a workout plan to objectively assess your starting point.' },
          ],
          steps: [
            { step: 'Enter height & weight', desc: 'Input your height (cm) and weight (kg). More accurate measurements yield more accurate results.' },
            { step: 'Select activity level', desc: 'Choose your typical activity level (low / moderate / high). This is factored into your daily water intake recommendation.' },
            { step: 'View results', desc: 'Your BMI value and weight status (underweight/normal/overweight/obese) are displayed, along with your recommended daily water intake in ml and cups.' },
            { step: 'Set health goals', desc: 'Use your BMI and hydration results as a baseline to set diet or exercise goals. Share the tool with friends using the SNS share buttons below.' },
          ],
          faqs: [
            { q: 'Does a high BMI always mean poor health?', a: 'BMI is a reference indicator for quick weight status assessment, not a diagnostic tool. Athletes with high muscle mass may have a high BMI while being perfectly healthy, and older adults can have sarcopenia even with a normal BMI. Consult a healthcare professional for accurate diagnosis.' },
            { q: 'How much water should I drink per day?', a: 'The general guideline is body weight (kg) × 30–35 ml. For example, a 60 kg person needs approximately 1,800–2,100 ml (about 9–10 cups) per day. Hot weather, exercise, and high-fiber diets require additional fluid intake.' },
            { q: 'Is the BMI standard different for Asians?', a: 'Yes. The WHO Asia-Pacific recommendation sets the healthy range at 18.5–22.9, lower than the Western standard of 18.5–24.9. This tool uses the general WHO standard; Asians should be aware of overweight risk even below 25.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
