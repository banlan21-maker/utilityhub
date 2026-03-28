'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileSpreadsheet } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import StepIndicator from './components/StepIndicator';
import Step1FileUpload from './components/Step1FileUpload';
import Step2Mapping from './components/Step2Mapping';
import Step3Preview from './components/Step3Preview';
import s from './excel-mapper.module.css';

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
  const locale = useLocale();
  const isKorean = locale === 'ko';
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
    <div className={s.container}>
      <NavigationActions />

      {/* Tool Start Card */}
      <header className={s.fin_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <FileSpreadsheet size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{t('title')}</h1>
        <p className={s.fin_subtitle}>{t('description')}</p>
      </header>

      <div className={s.main_panel}>
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

      {/* Share Bar */}
      <ShareBar
        title={isKorean ? '스마트 엑셀 매퍼' : 'Smart Excel Mapper'}
        description={isKorean ? '엑셀 데이터를 원하는 형식으로 자동 변환' : 'Transform Excel data to your desired format'}
      />

      {/* Related Tools */}
      <RelatedTools toolId="productivity/excel-mapper" limit={3} />

      {/* Ad Placeholder */}
      <div className={s.ad_placeholder}>
        {isKorean ? '광고 영역' : 'Ad Space'}
      </div>

      {/* SEO Content */}
      <section className={s.main_panel}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '1rem' }}>
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
      <section className={s.main_panel}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
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
