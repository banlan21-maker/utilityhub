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

export default function Tax33CalcClient() {
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
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Receipt size={40} color="#8b5cf6" />
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
        <RelatedTools toolId="utilities/finance/tax-33-calc" />
        <div className={s.tax_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '프리랜서 3.3% 원천징수 세금 계산기란 무엇인가요?',
            description: '프리랜서나 개인사업자가 기업과 계약할 때 필수적으로 알아야 하는 것이 바로 3.3% 원천징수입니다. 이는 사업소득세 3%와 지방소득세 0.3%를 합친 세율로, 용역 대가 지급 시 의뢰인(기업)이 미리 공제한 후 나머지 금액을 지급하는 제도입니다. 본 계산기는 계약 금액을 입력하면 원천징수액과 실제 입금될 금액을 즉시 확인할 수 있으며, 선택적으로 지역가입자 4대보험료(국민연금, 건강보험, 장기요양보험)까지 포함하여 최종 실수령액을 예측할 수 있습니다. 프리랜서 디자이너, 개발자, 작가, 강사, 컨설턴트 등 인적용역 소득이 있는 모든 분들에게 필수적인 도구로, 계약 전 협상 시 세후 금액을 명확히 파악하여 합리적인 단가를 제시하고, 연말정산이나 종합소득세 신고 시 예상 세액을 미리 준비할 수 있도록 돕습니다.',
            useCases: [
              { icon: '💼', title: '프리랜서 계약 협상', desc: '클라이언트와 단가 협상 시 세후 실수령액을 즉시 계산하여 손해 없는 계약 금액을 제시할 수 있습니다.' },
              { icon: '📊', title: '월별 수입 관리', desc: '여러 프로젝트 수입을 합산하여 월 실수령액과 세금 총액을 파악하고 재정 계획을 수립할 수 있습니다.' },
              { icon: '📑', title: '종합소득세 신고 대비', desc: '연간 원천징수 세액을 미리 계산하여 5월 종합소득세 신고 시 예상 세액 및 환급액을 가늠할 수 있습니다.' },
              { icon: '🏥', title: '지역가입자 보험료 예측', desc: '프리랜서로 전환 시 4대보험 지역가입자 납부액까지 포함하여 실제 생활비를 현실적으로 계산할 수 있습니다.' }
            ],
            steps: [
              { step: '총 계약 금액 입력', desc: '클라이언트로부터 받기로 한 세전 총 계약 금액을 입력합니다. 프리셋 버튼(100만원~1000만원)을 활용하면 더욱 빠릅니다.' },
              { step: '보험료 포함 여부 선택', desc: '지역가입자 4대보험(국민연금 4.5%, 건강보험 3.545%, 장기요양보험 등)을 포함할지 토글 버튼으로 설정합니다.' },
              { step: '실시간 결과 확인', desc: '입력과 동시에 원천징수액(3.3%), 보험료(선택 시), 최종 실수령액이 시각적으로 명확하게 표시됩니다.' },
              { step: '결과 복사 및 저장', desc: '"결과 복사" 버튼을 눌러 클립보드에 저장한 후 메모장이나 엑셀에 붙여넣어 기록으로 관리할 수 있습니다.' }
            ],
            faqs: [
              { q: '3.3% 원천징수는 어떻게 구성되나요?', a: '사업소득세 3.0%와 지방소득세 0.3%로 구성되며, 총 3.3%가 계약 금액에서 자동 공제됩니다. 이는 소득세법 제127조에 따라 사업소득 지급 시 의무적으로 원천징수해야 하는 금액입니다.' },
              { q: '원천징수된 세금은 나중에 돌려받을 수 있나요?', a: '5월 종합소득세 신고 시 연간 총소득과 경비를 정산하여 최종 세액을 계산합니다. 원천징수액이 실제 납부할 세액보다 많으면 환급받고, 적으면 추가 납부해야 합니다.' },
              { q: '지역가입자 4대보험료는 정확한가요?', a: '본 계산기는 2024년 기준 간이 예측치로, 실제 보험료는 전년도 소득, 재산, 자동차 등 여러 요소를 반영하여 국민건강보험공단과 국민연금공단이 개별 고지합니다. 정확한 금액은 해당 기관에 문의하세요.' },
              { q: '월급과 프리랜서 소득을 동시에 받으면?', a: '직장 근로소득과 프리랜서 사업소득을 동시에 받는 경우, 종합소득세 신고 시 두 소득을 합산하여 누진세율이 적용되므로 예상보다 세금이 높아질 수 있습니다. 세무사 상담을 권장합니다.' }
            ]
          }}
          en={{
            title: 'What is the Freelancer 3.3% Withholding Tax Calculator?',
            description: 'In South Korea, freelancers and independent contractors are subject to a 3.3% withholding tax on their income, consisting of 3.0% business income tax and 0.3% local income tax. This calculator helps you instantly determine how much will be deducted from your contract payment and what your actual take-home amount will be. Additionally, it offers an option to include regional health insurance and national pension estimates (approximately 9.4% total) for freelancers registered as regional subscribers. Whether you\'re a designer, developer, writer, consultant, or any other independent professional, this tool is essential for contract negotiations, monthly income planning, and preparing for annual comprehensive income tax filing. By understanding your net income upfront, you can make informed decisions about pricing your services and budgeting your finances.',
            useCases: [
              { icon: '💼', title: 'Contract Negotiation', desc: 'Calculate your after-tax income before signing contracts to ensure you\'re charging rates that meet your financial needs.' },
              { icon: '📊', title: 'Monthly Income Tracking', desc: 'Sum up multiple project incomes and predict your total monthly take-home pay after taxes and insurance deductions.' },
              { icon: '📑', title: 'Tax Filing Preparation', desc: 'Estimate annual withholding tax amounts to prepare for comprehensive income tax filing in May and anticipate refunds or additional payments.' },
              { icon: '🏥', title: 'Insurance Cost Planning', desc: 'Include regional subscriber insurance premiums to realistically plan your living expenses as a full-time freelancer.' }
            ],
            steps: [
              { step: 'Enter Gross Contract Amount', desc: 'Input the total pre-tax amount you\'ve agreed to receive from your client. Use preset buttons (100k~1000k KRW) for quick input.' },
              { step: 'Toggle Insurance Option', desc: 'Enable the insurance toggle if you want to include estimated regional health insurance and pension contributions (simplified rates).' },
              { step: 'View Real-time Results', desc: 'As you type, the breakdown showing withholding tax (3.3%), insurance (if enabled), and final net pay appears instantly.' },
              { step: 'Copy and Save Results', desc: 'Click "Copy Result" to save the breakdown to your clipboard, then paste it into a spreadsheet or note app for record-keeping.' }
            ],
            faqs: [
              { q: 'What does the 3.3% withholding tax include?', a: 'It consists of 3.0% business income tax and 0.3% local income tax, totaling 3.3%. This is mandated by Article 127 of the Income Tax Act for all business income payments.' },
              { q: 'Can I get a refund on withheld taxes?', a: 'Yes, during the comprehensive income tax filing in May, your total annual income and expenses are reconciled. If withheld taxes exceed your actual tax liability, you\'ll receive a refund.' },
              { q: 'Are the insurance estimates accurate?', a: 'The insurance amounts shown are simplified 2024 estimates. Actual premiums are calculated by the National Health Insurance Service and National Pension Service based on prior year income, assets, and vehicles. Contact them for exact figures.' },
              { q: 'What if I have both salary and freelance income?', a: 'If you receive both employment income and freelance business income, they are combined during tax filing, potentially pushing you into a higher progressive tax bracket. Consult a tax professional for personalized advice.' }
            ]
          }}
        />
      </div>
    </div>
  );
}
