'use client';

import { useTranslations } from 'next-intl';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useTranslations('SmartExcelMapper');

  const steps = [
    { number: 1, label: t('step1Label') },
    { number: 2, label: t('step2Label') },
    { number: 3, label: t('step3Label') },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      {/* Progress line */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          right: '0',
          height: '2px',
          background: 'var(--border)',
          zIndex: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentStep - 1) / 2) * 100}%`,
            background: '#f97316',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Step circles */}
      {steps.map((step) => (
        <div
          key={step.number}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: currentStep >= step.number ? '#f97316' : 'var(--surface)',
              border: `2px solid ${currentStep >= step.number ? '#f97316' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStep >= step.number ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              marginBottom: '0.5rem',
            }}
          >
            {step.number}
          </div>
          <span
            style={{
              fontSize: '0.875rem',
              color: currentStep >= step.number ? '#f97316' : 'var(--text-secondary)',
              fontWeight: currentStep === step.number ? 600 : 400,
              textAlign: 'center',
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
