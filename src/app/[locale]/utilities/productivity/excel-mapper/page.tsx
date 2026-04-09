import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "스마트 엑셀 매퍼 — 엑셀 컬럼 자동 변환 | Utility Hub"
    : "Smart Excel Mapper — Auto Column Mapping | Utility Hub";
  const description = isKo
    ? "엑셀 파일을 업로드하고 컬럼을 드래그앤드롭으로 매핑해 원하는 형식으로 즉시 변환·다운로드하세요."
    : "Upload an Excel file, map columns via drag-and-drop, and instantly download the transformed output in your desired format.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/productivity/excel-mapper`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/productivity/excel-mapper`,
        en: `https://www.theutilhub.com/en/utilities/productivity/excel-mapper`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "스마트 엑셀 매퍼",
  "alternateName": "Smart Excel Mapper",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/productivity/excel-mapper",
  "description": "엑셀 파일을 업로드하고 컬럼을 매핑해 원하는 형식으로 즉시 변환·다운로드하세요."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "어떤 엑셀 파일 형식을 지원하나요?", "acceptedAnswer": { "@type": "Answer", "text": ".xlsx, .xls 형식의 엑셀 파일을 지원합니다. 파일은 브라우저에서만 처리되며 서버에 업로드되지 않으므로 데이터가 외부로 유출되지 않습니다." } },
    { "@type": "Question", "name": "원본 파일이 변경되거나 삭제되나요?", "acceptedAnswer": { "@type": "Answer", "text": "아니요. 이 툴은 원본 파일을 읽기만 하며 수정하거나 삭제하지 않습니다. 변환 결과는 별도의 새 파일로 다운로드됩니다." } },
    { "@type": "Question", "name": "헤더 행이 여러 줄인 경우도 처리할 수 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "파일 업로드 후 헤더 행 번호를 직접 지정할 수 있습니다. 데이터 시작 행도 별도로 설정 가능하므로 복잡한 헤더 구조도 처리할 수 있습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileSpreadsheet } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <NavigationActions />

      {/* Tool Start Card */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <FileSpreadsheet size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
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
      <RelatedTools toolId="utilities/productivity/excel-mapper" limit={3} />

      {/* Ad Placeholder */}
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>

      <SeoSection
        ko={{
          title: '스마트 엑셀 매퍼란 무엇인가요?',
          description: '스마트 엑셀 매퍼는 엑셀(.xlsx/.xls) 파일을 업로드한 후 원하는 컬럼을 선택·매핑하여 새로운 형식의 파일로 즉시 변환·다운로드할 수 있는 브라우저 기반 무료 도구입니다. 서버에 파일을 전송하지 않고 브라우저 내에서만 처리하므로 데이터 보안이 보장됩니다. 반복적인 엑셀 데이터 형식 변환 업무를 자동화하고 싶은 직장인, 데이터 분석가, 관리자에게 적합합니다. 고정값 컬럼 삽입과 다중 소스 컬럼 매핑을 지원해 복잡한 데이터 변환도 몇 번의 클릭으로 완료할 수 있습니다.',
          useCases: [
            { icon: '🏢', title: '부서 간 데이터 양식 통일', desc: '각 부서에서 서로 다른 컬럼 구조로 관리하는 엑셀 데이터를 통합 양식으로 일괄 변환해 보고서 작성 시간을 단축합니다.' },
            { icon: '📊', title: 'ERP·CRM 데이터 마이그레이션', desc: '구형 시스템에서 내보낸 엑셀을 신규 ERP/CRM 시스템의 임포트 형식에 맞게 컬럼을 재배치하고 고정값을 삽입합니다.' },
            { icon: '🔄', title: '반복 데이터 변환 자동화', desc: '매월 같은 형식으로 변환해야 하는 데이터가 있다면 매핑 규칙을 저장해 반복 작업 시간을 획기적으로 줄일 수 있습니다.' },
            { icon: '📁', title: '외부 파트너 데이터 수신 처리', desc: '거래처나 외부 파트너로부터 받은 엑셀 데이터를 내부 기준 컬럼 순서와 이름으로 즉시 재구성합니다.' },
          ],
          steps: [
            { step: '엑셀 파일 업로드', desc: '드래그앤드롭 또는 파일 선택 버튼으로 .xlsx 또는 .xls 파일을 업로드합니다. 헤더 행 번호와 데이터 시작 행을 확인하고 필요 시 수정합니다.' },
            { step: '컬럼 매핑 설정', desc: '출력 파일의 컬럼명을 지정하고, 원본 파일의 어느 컬럼을 연결할지 선택합니다. 고정값 컬럼 추가도 가능합니다.' },
            { step: '미리보기 확인', desc: '매핑 결과를 테이블 형태로 미리 확인합니다. 오류가 있으면 이전 단계로 돌아가 수정합니다.' },
            { step: '변환 파일 다운로드', desc: '미리보기가 정확하면 다운로드 버튼을 클릭해 변환된 엑셀 파일을 저장합니다. 원본 파일은 변경되지 않습니다.' },
          ],
          faqs: [
            { q: '어떤 엑셀 파일 형식을 지원하나요?', a: '.xlsx와 .xls 형식의 엑셀 파일을 지원합니다. 파일은 브라우저에서만 처리되며 서버에 업로드되지 않으므로 민감한 업무 데이터도 안전하게 변환할 수 있습니다.' },
            { q: '원본 파일이 변경되거나 삭제되나요?', a: '아니요. 이 툴은 원본 파일을 읽기만 하며 수정하거나 삭제하지 않습니다. 변환 결과는 별도의 새 파일로 다운로드되므로 원본 파일은 항상 안전하게 유지됩니다.' },
            { q: '헤더 행이 여러 줄인 경우도 처리할 수 있나요?', a: '파일 업로드 후 헤더 행 번호와 데이터 시작 행을 직접 지정할 수 있습니다. 병합 셀이나 복잡한 헤더 구조가 있는 파일도 행 번호를 조정해 처리할 수 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is Smart Excel Mapper?',
          description: 'Smart Excel Mapper is a free, browser-based tool that lets you upload an Excel (.xlsx/.xls) file, select and map columns visually, and instantly download the transformed output in a new format. All processing happens entirely in your browser — no files are sent to any server — ensuring complete data security. It is ideal for office workers, data analysts, and administrators who need to automate repetitive Excel column transformation tasks. The tool supports fixed-value column insertion and multi-source column mapping, enabling complex data reshaping in just a few clicks.',
          useCases: [
            { icon: '🏢', title: 'Standardizing Cross-Department Data', desc: 'Convert Excel files with inconsistent column structures from different departments into a unified reporting format, dramatically reducing the time spent on manual reformatting.' },
            { icon: '📊', title: 'ERP & CRM Data Migration', desc: 'Rearrange columns and insert fixed values to transform exported Excel data from legacy systems into the exact import format required by new ERP or CRM platforms.' },
            { icon: '🔄', title: 'Recurring Data Transformation', desc: 'Save mapping rules and reapply them to monthly or weekly reports that need to be converted to the same output format, eliminating repetitive manual work every cycle.' },
            { icon: '📁', title: 'Processing Partner Data Submissions', desc: 'Instantly restructure Excel files received from external partners or vendors to match your internal column naming conventions and field ordering requirements.' },
          ],
          steps: [
            { step: 'Upload your Excel file', desc: 'Drag and drop or use the file picker to upload an .xlsx or .xls file. Verify the header row number and data start row, then adjust if your file has a non-standard structure.' },
            { step: 'Set up column mappings', desc: 'Define output column names and link each one to the corresponding source column from your uploaded file. Add fixed-value columns as needed for fields that don\'t change across rows.' },
            { step: 'Preview the result', desc: 'Review the transformed data in a table preview before downloading. If anything looks wrong, go back to the previous step to adjust your mapping rules.' },
            { step: 'Download the transformed file', desc: 'Once the preview looks correct, click the download button to save the converted Excel file. Your original file remains completely unchanged throughout the process.' },
          ],
          faqs: [
            { q: 'What Excel file formats are supported?', a: 'Both .xlsx and .xls formats are supported. All processing happens entirely in your browser and no files are ever uploaded to a server, so sensitive business data can be transformed securely without any risk of leakage.' },
            { q: 'Will my original file be modified or deleted?', a: 'No. This tool only reads your original file and never modifies or deletes it. The transformation result is saved as a separate new file that you download, so your original data always remains intact and safe.' },
            { q: 'Can it handle files with multi-row headers?', a: 'Yes. After uploading, you can manually set the header row number and data start row. This allows you to process files with merged cells or complex multi-line header structures by simply adjusting the row numbers accordingly.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
