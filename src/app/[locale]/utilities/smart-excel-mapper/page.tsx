'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import StepIndicator from './components/StepIndicator';
import Step1FileUpload from './components/Step1FileUpload';
import Step2Mapping from './components/Step2Mapping';
import Step3Preview from './components/Step3Preview';

type Step = 1 | 2 | 3;

export interface ParsedExcelData {
  fileName: string;
  sheetName: string;
  allRows: any[][];
  headerRowIndex: number;
  dataStartRowIndex: number;
  headers: string[];
  dataRows: any[][];
}

export interface MappingRule {
  id: string;
  type: 'fixed' | 'column';
  targetColumn: string;
  fixedValue?: string;
  sourceColumnIndex?: number;
}

export default function SmartExcelMapperPage() {
  const t = useTranslations('SmartExcelMapper');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);
  const [outputData, setOutputData] = useState<any[][]>([]);

  const handleStep1Complete = (data: ParsedExcelData) => {
    setParsedData(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = (rules: MappingRule[]) => {
    setMappingRules(rules);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setParsedData(null);
    setMappingRules([]);
    setOutputData([]);
  };

  return (
    <div>
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#f97316' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('description')}
        </p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <StepIndicator currentStep={currentStep} />

        <div style={{ marginTop: '2rem' }}>
          {currentStep === 1 && (
            <Step1FileUpload onComplete={handleStep1Complete} />
          )}

          {currentStep === 2 && parsedData && (
            <Step2Mapping
              parsedData={parsedData}
              onComplete={handleStep2Complete}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && parsedData && (
            <Step3Preview
              parsedData={parsedData}
              mappingRules={mappingRules}
              onBack={handleBack}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      {/* SEO Content */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f97316', marginBottom: '1rem' }}>
          {t('seoTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          {t('seoPara1')}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          {t('seoPara2')}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {t('seoPara3')}
        </p>
      </section>

      {/* FAQ */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f97316', marginBottom: '1.5rem' }}>
          {t('faqTitle')}
        </h2>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {t(`faq${i}Q`)}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t(`faq${i}A`)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
