'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Building2, 
  Calculator, 
  Wallet, 
  ShieldCheck, 
  Hospital, 
  Scale, 
  DollarSign, 
  Copy, 
  CheckCircle2, 
  ArrowRight,
  Info,
  TrendingUp,
  Coins,
  Receipt,
  Umbrella
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './tax.module.css';

/* ─── Insurance Rates (2024 Reference) ─── */
const INSURANCE = {
  national: { rate: 0.045, labelKo: '국민연금', labelEn: 'Nat. Pension' },
  health: { rate: 0.03545, labelKo: '건강보험', labelEn: 'Health Ins.' },
  care: { rate: 0.004591, labelKo: '장기요양', labelEn: 'Long-term Care' },
};

export default function Tax33Page() {
  const t = useTranslations('Tax33');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [gross, setGross] = useState('');
  const [applyInsurance, setApplyInsurance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const grossNum = parseFloat(gross.replace(/,/g, '')) || 0;

  // 3.3% Withholding Tax
  const businessTax = grossNum * 0.03;
  const localTax = grossNum * 0.003;
  const withholding = businessTax + localTax;

  // Regional Subscriber Insurance Estimates (Simplified)
  const natPension = grossNum * INSURANCE.national.rate;
  const healthIns = grossNum * INSURANCE.health.rate;
  const careIns = grossNum * INSURANCE.care.rate;
  const totalInsurance = natPension + healthIns + careIns;

  const totalDeduction = withholding + (applyInsurance ? totalInsurance : 0);
  const net = grossNum - totalDeduction;

  const fmt = (n: number) => Math.round(n).toLocaleString(isKo ? 'ko-KR' : 'en-US');

  const copyResult = useCallback(() => {
    const text = `${t('title')}\n${t('result.gross')}: ${fmt(grossNum)}원\n${t('result.withholding')}: ${fmt(withholding)}원\n${t('result.net')}: ${fmt(net)}원`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [grossNum, withholding, net, t, isKo]);

  if (!isClient) return null;

  return (
    <div className={s.tax_container}>
      <NavigationActions />
      <header className={s.tax_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Building2 size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.tax_title}>{t('title')}</h1>
        <p className={s.tax_subtitle}>{t('description')}</p>
      </header>

      <section className={s.tax_panel}>
        {/* Gross Input */}
        <div className={s.tax_input_group}>
          <label className={s.tax_label}>{t('label.gross')}</label>
          <div style={{ position: 'relative' }}>
            <input 
              className={s.tax_input} 
              value={gross}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setGross(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '');
              }}
              inputMode="numeric"
              placeholder="3,000,000"
            />
            <span className={s.tax_suffix}>{isKo ? '원' : ''}</span>
          </div>
          <div className={s.tax_presets}>
            {[100, 200, 300, 500, 1000].map(v => (
              <button 
                key={v} 
                className={s.tax_preset_btn}
                onClick={() => setGross((v * 10000).toLocaleString('ko-KR'))}
              >
                {isKo ? `${v}만원` : `${v*10}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Insurance Toggle */}
        <div 
          className={`${s.tax_toggle_box} ${applyInsurance ? s.tax_toggle_active : ''}`}
          onClick={() => setApplyInsurance(!applyInsurance)}
        >
          <div>
            <div className={s.tax_toggle_label}>{t('label.insurance')}</div>
            <div className={s.tax_toggle_desc}>{t('label.insuranceNote')}</div>
          </div>
          <div className={`${s.tax_switch} ${applyInsurance ? s.tax_switch_active : ''}`}>
            <div className={s.tax_switch_knob} />
          </div>
        </div>

        {/* Results Area */}
        {grossNum > 0 && (
          <div className={s.tax_result_card} style={{ animation: 'bounceIn 0.5s ease-out' }}>
            <div className={s.tax_result_header}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Receipt size={18} />
                  {t('result.breakdown')}
                </div>
                <button 
                  onClick={copyResult} 
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '결과 복사' : 'Copy Result')}
                </button>
              </div>
            </div>

            <div className={s.tax_result_row}>
              <span className={s.tax_result_label}>{t('result.gross')}</span>
              <span className={s.tax_result_value}>{fmt(grossNum)}{isKo ? '원' : ''}</span>
            </div>

            <div className={s.tax_result_row}>
              <span className={s.tax_result_label}>{t('result.withholding')} (3.3%)</span>
              <span className={s.tax_result_value} style={{ color: '#ef4444' }}>-{fmt(withholding)}{isKo ? '원' : ''}</span>
            </div>

            {applyInsurance && (
              <>
                <div className={s.tax_insurance_section}>{t('result.insuranceSection')} (Regional Est.)</div>
                <div className={s.tax_result_row}>
                  <span className={s.tax_result_label}>{isKo ? '국민연금 (4.5%)' : 'Nat. Pension'}</span>
                  <span className={s.tax_result_value} style={{ color: '#f59e0b' }}>-{fmt(natPension)}{isKo ? '원' : ''}</span>
                </div>
                <div className={s.tax_result_row}>
                  <span className={s.tax_result_label}>{isKo ? '건강보험 (3.545%~)' : 'Health Insurance'}</span>
                  <span className={s.tax_result_value} style={{ color: '#f59e0b' }}>-{fmt(healthIns)}{isKo ? '원' : ''}</span>
                </div>
              </>
            )}

            <div className={`${s.tax_result_row} ${s.tax_result_net}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={18} color="#8b5cf6" />
                <span className={`${s.tax_result_label} ${s.tax_net_label}`}>{t('result.net')}</span>
              </div>
              <span className={`${s.tax_result_value} ${s.tax_net_value}`}>{fmt(net)}{isKo ? '원' : ''}</span>
            </div>
          </div>
        )}
      </section>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="fintech/tax33" />
        <div className={s.tax_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '프리랜서 3.3% 세금 계산 가이드',
            description: '계약 금액에서 원천징수 세금과 실수령액을 즉시 계산하세요. 종합소득세 신고 전 필수 도구.',
            useCases: [{ icon: '💼', title: '계약 전 필수 확인', desc: '세후 실수령액 협상에 활용' }],
            steps: [{ step: '1', desc: '총 계약 금액 입력 후 결과 확인' }],
            faqs: [{ q: '3.3% 구성이 어떻게 되나요?', a: '사업소득세 3%와 지방소득세 0.3%입니다.' }]
          }}
          en={{
            title: 'Freelancer 3.3% Tax Guide',
            description: 'Calculate your net pay after the standard 3.3% withholding tax in South Korea. Plan your income and taxes easily.',
            useCases: [{ icon: '📑', title: 'Contracting', desc: 'Predict take-home pay accurately' }],
            steps: [{ step: '1', desc: 'Enter gross amount and toggle insurance if needed' }],
            faqs: [{ q: 'Is it official?', a: 'It follows the 2024 standard tax and insurance rates.' }]
          }}
        />
      </div>
    </div>
  );
}
