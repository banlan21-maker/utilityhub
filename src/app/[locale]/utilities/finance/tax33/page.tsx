'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';

/* ─── 4대 보험 요율 (2024 기준, 근로자 부담분) ─── */
const INSURANCE = {
  national:  { rate: 0.045,   labelKo: '국민연금',  labelEn: 'National Pension' },
  health:    { rate: 0.03545, labelKo: '건강보험',  labelEn: 'Health Insurance' },
  care:      { rate: 0.004591,labelKo: '장기요양',  labelEn: 'Long-term Care' },
  employ:    { rate: 0.009,   labelKo: '고용보험',  labelEn: 'Employment Ins.' },
};

function fmt(n: number) {
  return Math.round(n).toLocaleString('ko-KR');
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);
  return (
    <button
      onClick={copy}
      style={{
        padding: '0.25rem 0.6rem',
        fontSize: '0.72rem',
        fontWeight: 600,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: copied ? 'var(--primary)' : 'var(--surface-hover)',
        color: copied ? '#fff' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ ' + label : '📋 ' + label}
    </button>
  );
}

function ResultRow({
  label,
  amount,
  sub,
  highlight,
  copyable,
}: {
  label: string;
  amount: number;
  sub?: string;
  highlight?: boolean;
  copyable?: boolean;
}) {
  const val = fmt(amount) + '원';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        background: highlight
          ? 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(16,185,129,0.08))'
          : 'transparent',
      }}
    >
      <div>
        <span style={{ fontSize: '0.9rem', color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: highlight ? 700 : 400 }}>
          {label}
        </span>
        {sub && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>{sub}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: highlight ? '1.35rem' : '1rem', fontWeight: highlight ? 800 : 600, color: highlight ? 'var(--primary)' : 'var(--text-primary)', letterSpacing: highlight ? '-0.5px' : 'normal' }}>
          {val}
        </span>
        {copyable && <CopyButton value={fmt(amount)} label="복사" />}
      </div>
    </div>
  );
}

export default function Tax33Page() {
  const t = useTranslations('Tax33');
  const locale = useLocale();

  const [gross, setGross] = useState('');
  const [applyInsurance, setApplyInsurance] = useState(false);

  const grossNum = parseFloat(gross.replace(/,/g, '')) || 0;

  // 3.3% 원천세
  const businessTax = grossNum * 0.03;
  const localTax = grossNum * 0.003;
  const withholding = businessTax + localTax; // 3.3%

  // 4대 보험 (사업소득자는 법적으로 국민연금·건강보험 지역가입자 처리 — 참고용)
  const natPension = grossNum * INSURANCE.national.rate;
  const healthIns  = grossNum * INSURANCE.health.rate;
  const careIns    = grossNum * INSURANCE.care.rate;
  const employIns  = grossNum * INSURANCE.employ.rate;
  const totalInsurance = natPension + healthIns + careIns + employIns;

  const totalDeduction = withholding + (applyInsurance ? totalInsurance : 0);
  const net = grossNum - totalDeduction;

  const hasResult = grossNum > 0;

  return (
    <div>
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '520px', margin: '0 auto' }}>

        {/* Gross input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('label.gross')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="3,000,000"
              value={gross}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setGross(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '');
              }}
              style={{
                width: '100%',
                padding: '0.9rem 3rem 0.9rem 1rem',
                fontSize: '1.4rem',
                fontWeight: 700,
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem' }}>
              원
            </span>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            {[1000000, 2000000, 3000000, 5000000, 10000000].map(v => (
              <button
                key={v}
                onClick={() => setGross(v.toLocaleString('ko-KR'))}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {(v / 10000).toLocaleString()}만원
              </button>
            ))}
          </div>
        </div>

        {/* 4대 보험 toggle */}
        <div
          onClick={() => setApplyInsurance(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${applyInsurance ? 'var(--primary)' : 'var(--border)'}`,
            background: applyInsurance ? 'rgba(79,70,229,0.05)' : 'var(--surface)',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              {t('label.insurance')}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('label.insuranceNote')}</p>
          </div>
          <div style={{
            width: '44px', height: '24px',
            borderRadius: '12px',
            background: applyInsurance ? 'var(--primary)' : 'var(--border)',
            position: 'relative',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: applyInsurance ? '22px' : '2px',
              width: '20px', height: '20px',
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>

        {/* Result table */}
        {hasResult && (
          <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1rem' }}>

            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '0.7rem 1.25rem' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>
                {t('result.breakdown')}
              </span>
            </div>

            <div style={{ background: 'var(--surface)' }}>
              <ResultRow label={t('result.gross')} amount={grossNum} />
              <ResultRow label={t('result.bizTax')} amount={businessTax} sub="(3.0%)" />
              <ResultRow label={t('result.localTax')} amount={localTax} sub="(0.3%)" />
              <ResultRow label={t('result.withholding')} amount={withholding} sub="(3.3%)" />

              {applyInsurance && (
                <>
                  <div style={{ padding: '0.5rem 1.25rem', background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('result.insuranceSection')}
                    </span>
                  </div>
                  {Object.entries(INSURANCE).map(([key, ins]) => (
                    <ResultRow
                      key={key}
                      label={locale === 'ko' ? ins.labelKo : ins.labelEn}
                      amount={key === 'national' ? natPension : key === 'health' ? healthIns : key === 'care' ? careIns : employIns}
                      sub={`(${(ins.rate * 100).toFixed(3)}%)`}
                    />
                  ))}
                  <ResultRow label={t('result.totalInsurance')} amount={totalInsurance} />
                </>
              )}

              <ResultRow
                label={t('result.net')}
                amount={net}
                highlight
                copyable
              />
            </div>
          </div>
        )}

        {hasResult && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            {t('notice')}
          </p>
        )}
      </div>

      {/* Ad placeholder */}
      <div style={{ maxWidth: '520px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '250px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      <RelatedTools toolId="fintech/tax33" />

      <SeoSection
        ko={{
          title: '프리랜서 3.3% 세금 계산기란 무엇인가요?',
          description: '프리랜서·사업소득자에게 적용되는 3.3% 원천징수세는 사업소득세(3%)와 지방소득세(0.3%)로 구성됩니다. 기업이나 개인으로부터 용역비를 받을 때 원천징수 의무자가 해당 세금을 미리 떼고 지급하며, 프리랜서는 이듬해 5월에 종합소득세 확정신고를 통해 정산합니다. 연간 총수입에서 필요경비를 공제한 후 실제 세율을 적용하면 원천세보다 세금이 줄어 환급받는 경우가 많습니다. 이 계산기는 계약 전 실수령액을 사전에 파악해 급여 협상 시 유용하게 활용할 수 있습니다.',
          useCases: [
            { icon: '💼', title: '계약 전 실수령액 파악', desc: '의뢰인이 제시한 금액에서 실제로 받을 수 있는 금액을 미리 계산해 협상에 활용합니다.' },
            { icon: '📑', title: '세금계산서/영수증 발행', desc: '부가세 면세 사업자(프리랜서)의 원천세 내역을 명확히 파악해 회계 처리를 간소화합니다.' },
            { icon: '🔄', title: '종합소득세 환급 예측', desc: '연간 수입과 경비를 고려해 이듬해 환급 예상액을 대략적으로 추정합니다.' },
            { icon: '🏥', title: '4대 보험 부담 시뮬레이션', desc: '지역가입자로서 납부해야 할 4대 보험료를 포함한 실질 수령액을 계산합니다.' },
          ],
          steps: [
            { step: '총 급여(계약 금액) 입력', desc: '의뢰인으로부터 받기로 한 총 급여 또는 용역비를 입력합니다.' },
            { step: '4대 보험 적용 여부 선택', desc: '지역가입자 4대 보험료 공제를 포함할지 선택합니다. (프리랜서는 보통 지역가입자)' },
            { step: '실수령액 및 세부 내역 확인', desc: '사업소득세, 지방소득세, 실수령액이 자동 계산됩니다. 복사 버튼으로 결과를 즉시 활용하세요.' },
          ],
          faqs: [
            { q: '3.3% 원천세는 언제 환급받나요?', a: '매년 5월 종합소득세 신고 시 실제 세율(소득에 따라 6~45%)과 기납부 원천세를 비교해 차액을 정산합니다. 연소득이 낮을수록 환급 가능성이 높습니다.' },
            { q: '3.3%와 부가세는 다른가요?', a: '네, 다릅니다. 3.3%는 소득세 성격의 원천세이며, 부가세(10%)는 매출에 부과되는 별도 세금입니다. 면세 사업자(프리랜서 대다수)는 부가세 신고 의무가 없습니다.' },
            { q: '4대 보험은 반드시 내야 하나요?', a: '프리랜서(사업소득자)는 직장가입자가 아닌 지역가입자로 국민연금·건강보험에 가입하며, 고용보험·산재보험은 특수형태근로종사자 해당 시에만 적용됩니다.' },
          ],
        }}
        en={{
          title: 'What is a Korean Freelancer 3.3% Tax Calculator?',
          description: 'South Korea\'s 3.3% withholding tax applies to freelancers and self-employed individuals receiving service fees. It consists of business income tax (3%) and local income tax (0.3%). The payer withholds this amount before payment, and the freelancer reconciles the difference via the annual comprehensive income tax filing in May. Because the final tax rate depends on total income after expenses, many freelancers receive a refund if their effective rate falls below 3.3%. This calculator helps you predict your take-home pay before signing contracts.',
          useCases: [
            { icon: '💼', title: 'Pre-contract Net Pay Planning', desc: 'Know your actual take-home before negotiations so you can set the right contract price.' },
            { icon: '📑', title: 'Invoice & Accounting', desc: 'Understand the exact withholding breakdown to simplify bookkeeping and tax documentation.' },
            { icon: '🔄', title: 'Tax Refund Estimation', desc: 'Estimate potential refunds by comparing the flat 3.3% rate against your effective income tax bracket.' },
            { icon: '🏥', title: '4 Major Insurance Simulation', desc: 'Include regional subscriber insurance premiums to see the true net amount after all deductions.' },
          ],
          steps: [
            { step: 'Enter Gross Pay', desc: 'Input the total service fee or contract amount agreed with the client.' },
            { step: 'Toggle Insurance Option', desc: 'Enable the 4 major insurance toggle if you want to include regional subscriber premiums in the deduction.' },
            { step: 'View Breakdown & Copy', desc: 'Business income tax, local tax, and net pay are calculated instantly. Use the copy button to grab the result.' },
          ],
          faqs: [
            { q: 'When do I get the 3.3% withholding refunded?', a: 'During the May comprehensive income tax filing, your actual tax liability is compared to the 3.3% already withheld. Lower annual incomes typically result in a refund.' },
            { q: 'Is 3.3% withholding the same as VAT?', a: 'No. The 3.3% is an income-based withholding tax, while VAT (10%) is a consumption tax on sales. Most freelancers are VAT-exempt and do not need to file VAT.' },
            { q: 'Are freelancers required to pay national health insurance?', a: 'Yes. Freelancers enroll as regional subscribers for national pension and health insurance. Employment and industrial accident insurance generally only apply to specific worker categories.' },
          ],
        }}
      />
    </div>
  );
}
