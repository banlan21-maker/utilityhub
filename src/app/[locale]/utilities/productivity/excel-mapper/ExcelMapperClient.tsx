'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileSpreadsheet } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import StepIndicator from './components/StepIndicator';
import Step1FileUpload from './components/Step1FileUpload';
import Step2Mapping from './components/Step2Mapping';
import Step3Preview from './components/Step3Preview';
import s from './excel-mapper.module.css';
import { ui } from '@/app/components/ui';


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

export default function ExcelMapperClient({ seo }: { seo?: React.ReactNode }) {
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
      <ToolHeader icon={<FileSpreadsheet />} title={t('title')} subtitle={t('description')} />

      <div className={`${ui.card} ${s.main_panel}`}>
        <StepIndicator currentStep={currentStep} />

        <div className={s.stepBody}>
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
      <RelatedTools toolId="utilities/productivity/excel-mapper" />

      {/* Ad Placeholder */}

      {seo}
    </div>
  );
}
