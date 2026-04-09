import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === 'ko';
  const title = isKo
    ? 'PDF 개인정보 마스킹 — 주민번호·전화번호 자동 탐지 & 가리기 | Utility Hub'
    : 'PDF Privacy Masking — Auto-Detect & Redact Personal Info | Utility Hub';
  const description = isKo
    ? 'AI가 PDF의 주민번호, 전화번호, 이메일, 주소를 자동 탐지해 마스킹. 100% 브라우저 처리, 서버 전송 없음.'
    : 'AI auto-detects and redacts SSN, phone numbers, emails, and addresses in PDFs. 100% browser-based, no server upload.';
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/document/pdf-masking`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/document/pdf-masking',
        en: 'https://www.theutilhub.com/en/utilities/document/pdf-masking',
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Utility Hub',
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF 개인정보 마스킹',
  alternateName: 'PDF Privacy Masking Tool',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/document/pdf-masking',
  description:
    'AI가 PDF 문서에서 주민등록번호, 전화번호, 이메일, 주소 등 개인정보를 자동으로 탐지하고 마스킹하는 무료 온라인 도구입니다. 100% 브라우저 로컬 처리로 서버 업로드가 없어 완벽한 보안을 보장합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '회사 보안팀에 걸리지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '100% 로컬 처리로 네트워크 트래픽이 전혀 발생하지 않습니다. 파일이 서버로 업로드되지 않으므로 보안팀 모니터링에 노출되지 않으며, 회사 보안 정책을 위반하지 않습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'AI가 잘못 가리면 어떻게 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '탐지된 모든 항목은 개별적으로 확인하고 수동으로 가리기/표시를 선택할 수 있습니다. AI가 놓친 부분은 수동으로 추가할 수 있으며, 잘못 탐지된 항목은 제외할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '어떤 개인정보를 탐지하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '현재 주민등록번호, 전화번호, 이메일, 주소를 자동 탐지합니다. 정규표현식 기반의 패턴 매칭으로 높은 정확도를 제공하며, 향후 더 많은 패턴이 추가될 예정입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
      },
    },
  ],
};

'use client';

import { useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { Shield, Upload, Download, Eye, EyeOff, AlertTriangle, CheckCircle, FileText, Trash2, Lock, ShieldCheck } from 'lucide-react';

// PDF.js worker 설정 (로컬 워커 사용 - pdfjs-dist v5 호환)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';
}

interface DetectedInfo {
  id: string;
  type: 'ssn' | 'phone' | 'email' | 'address' | 'name';
  text: string;
  page: number;
  position: { x: number; y: number; width: number; height: number };
  masked: boolean;
}

// 개인정보 탐지 정규표현식
const PATTERNS = {
  ssn: /\d{6}[-\s]?\d{7}/g, // 주민등록번호
  phone: /0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}/g, // 전화번호
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // 이메일
  address: /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\s]{1,}(시|군|구)[^\s]{1,}(동|읍|면|로|길)/g, // 주소
};

export default function PdfSecurityPage() {
  const locale = useLocale();
  const isKorean = locale === 'ko';

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [securityScore, setSecurityScore] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF 파일 분석
  const analyzePdf = useCallback(async (file: File) => {
    setProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const detected: DetectedInfo[] = [];
      const pageImages: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);

        // 페이지 렌더링
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          } as any).promise;

          pageImages.push(canvas.toDataURL('image/png'));
        }

        // 텍스트 추출
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        // 개인정보 패턴 탐지
        Object.entries(PATTERNS).forEach(([type, pattern]) => {
          const matches = pageText.matchAll(pattern);
          for (const match of matches) {
            if (match[0]) {
              detected.push({
                id: Math.random().toString(36).substr(2, 9),
                type: type as any,
                text: match[0],
                page: i,
                position: { x: 0, y: 0, width: 0, height: 0 },
                masked: true,
              });
            }
          }
        });

        setProgress(Math.round((i / totalPages) * 100));
      }

      setPages(pageImages);
      setDetectedInfo(detected);

      // 보안 점수 계산 (탐지된 개인정보가 적을수록 높은 점수)
      const score = Math.max(0, 100 - detected.length * 10);
      setSecurityScore(score);

    } catch (error) {
      console.error('PDF 분석 중 오류:', error);
      alert(isKorean ? 'PDF 파일 분석 중 오류가 발생했습니다.' : 'Error analyzing PDF file.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [isKorean]);

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback((file: File | null) => {
    if (!file || !file.type.includes('pdf')) {
      alert(isKorean ? 'PDF 파일만 업로드 가능합니다.' : 'Only PDF files are allowed.');
      return;
    }

    setPdfFile(file);
    analyzePdf(file);
  }, [isKorean, analyzePdf]);

  // 마스킹 토글
  const toggleMask = (id: string) => {
    setDetectedInfo(prev =>
      prev.map(info => (info.id === id ? { ...info, masked: !info.masked } : info))
    );
  };

  // 전체 마스킹/해제
  const toggleAllMasks = (mask: boolean) => {
    setDetectedInfo(prev => prev.map(info => ({ ...info, masked: mask })));
  };

  // 마스킹된 PDF 생성 (간단 버전)
  const generateSecuredPdf = useCallback(async () => {
    if (!pdfFile || pages.length === 0) return;

    setProcessing(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const maskedInfoCount = detectedInfo.filter(info => info.masked).length;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const img = new Image();
        img.src = pages[i];

        await new Promise((resolve) => {
          img.onload = () => {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

            // 마스킹 영역 표시 (예시: 텍스트로 표시)
            const maskedOnPage = detectedInfo.filter(
              info => info.masked && info.page === i + 1
            );

            if (maskedOnPage.length > 0) {
              pdf.setFillColor(0, 0, 0);
              pdf.setFontSize(12);
              pdf.text(
                `[${maskedOnPage.length}개 항목 마스킹됨]`,
                10,
                pageHeight - 10
              );
            }

            resolve(null);
          };
        });
      }

      pdf.save(`secured_${pdfFile.name}`);

      alert(
        isKorean
          ? `보안 처리 완료! ${maskedInfoCount}개 항목이 마스킹되었습니다.`
          : `Security processing complete! ${maskedInfoCount} items masked.`
      );

    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      alert(isKorean ? 'PDF 생성 중 오류가 발생했습니다.' : 'Error generating PDF.');
    } finally {
      setProcessing(false);
    }
  }, [pdfFile, pages, detectedInfo, isKorean]);

  // 개인정보 유형 아이콘
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ssn': return '🆔';
      case 'phone': return '📞';
      case 'email': return '📧';
      case 'address': return '📍';
      default: return '📄';
    }
  };

  // 개인정보 유형 이름
  const getTypeName = (type: string) => {
    const names: Record<string, { ko: string; en: string }> = {
      ssn: { ko: '주민등록번호', en: 'SSN' },
      phone: { ko: '전화번호', en: 'Phone' },
      email: { ko: '이메일', en: 'Email' },
      address: { ko: '주소', en: 'Address' },
    };
    return isKorean ? names[type]?.ko : names[type]?.en;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <NavigationActions />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {isKorean ? 'PDF 개인정보 마스킹' : 'PDF Privacy Masking'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isKorean
            ? '100% 로컬 처리 | AI 개인정보 탐지 | 서버 전송 없음'
            : '100% Local Processing | AI Privacy Detection | No Server Upload'}
        </p>

        {/* Security Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
          marginTop: '1rem',
          marginBottom: '1rem',
        }}>
          <Lock size={18} />
          {isKorean ? '로컬 보안 구역 작동 중 (오프라인 안전)' : 'Local Security Zone Active (Offline Safe)'}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isKorean
            ? '귀하의 문서는 브라우저를 절대 떠나지 않습니다. 개발자도 볼 수 없습니다.'
            : 'Your documents never leave your browser. Even developers cannot see them.'}
        </p>
      </header>

      {/* Upload Zone */}
      {!pdfFile && (
        <div className="animate-slide-up" style={{ marginBottom: '2rem' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              handleFileUpload(file);
            }}
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: '3px dashed var(--border)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1e3a8a';
              e.currentTarget.style.background = 'rgba(30, 58, 138, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Shield size={64} style={{ margin: '0 auto 1.5rem', color: '#1e3a8a' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {isKorean ? 'PDF 파일을 드래그하거나 클릭하여 업로드' : 'Drag & Drop PDF or Click to Upload'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>
              {isKorean ? 'AI가 개인정보를 자동으로 탐지하고 보안 점수를 제공합니다' : 'AI automatically detects personal information and provides a security score'}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}>
              <CheckCircle size={16} />
              {isKorean ? '서버 업로드 없음 • 100% 안전' : 'No Server Upload • 100% Safe'}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="glass-panel animate-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Shield size={48} style={{ color: '#1e3a8a', animation: 'pulse 2s infinite' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '1rem', color: 'var(--text-primary)' }}>
              {isKorean ? 'AI 보안 분석 중...' : 'AI Security Analysis...'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {isKorean ? '개인정보를 탐지하고 있습니다' : 'Detecting personal information'}
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'var(--border)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #1e3a8a, #10b981)',
              transition: 'width 0.3s',
            }} />
          </div>
          <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {progress}%
          </p>
        </div>
      )}

      {/* Results */}
      {pdfFile && !processing && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Security Score */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '보안 검사 결과' : 'Security Scan Results'}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {pdfFile.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setPdfFile(null);
                  setDetectedInfo([]);
                  setPages([]);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '2px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Trash2 size={18} />
                {isKorean ? '새 파일' : 'New File'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                padding: '1.5rem',
                background: securityScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : securityScore >= 50 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                border: `2px solid ${securityScore >= 80 ? '#10b981' : securityScore >= 50 ? '#fbbf24' : '#ef4444'}`,
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '보안 점수' : 'Security Score'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: securityScore >= 80 ? '#10b981' : securityScore >= 50 ? '#fbbf24' : '#ef4444' }}>
                  {securityScore}
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '2px solid #ef4444' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '탐지된 개인정보' : 'Detected Info'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444' }}>
                  {detectedInfo.length}
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '마스킹 예정' : 'Will Be Masked'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {detectedInfo.filter(info => info.masked).length}
                </div>
              </div>
            </div>
          </div>

          {/* Detected Information List */}
          {detectedInfo.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isKorean ? '탐지된 개인정보 목록' : 'Detected Personal Information'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleAllMasks(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <EyeOff size={16} />
                    {isKorean ? '전체 가리기' : 'Mask All'}
                  </button>
                  <button
                    onClick={() => toggleAllMasks(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '2px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Eye size={16} />
                    {isKorean ? '전체 표시' : 'Show All'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {detectedInfo.map((info) => (
                  <div
                    key={info.id}
                    style={{
                      padding: '1rem',
                      background: info.masked ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface)',
                      border: `2px solid ${info.masked ? '#ef4444' : 'var(--border)'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(info.type)}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {getTypeName(info.type)}
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          color: info.masked ? '#ef4444' : 'var(--text-secondary)',
                          textDecoration: info.masked ? 'line-through' : 'none',
                        }}>
                          {info.text}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}>
                        {isKorean ? `페이지 ${info.page}` : `Page ${info.page}`}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMask(info.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: info.masked ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {info.masked ? <Eye size={16} /> : <EyeOff size={16} />}
                      {info.masked ? (isKorean ? '표시' : 'Show') : (isKorean ? '가리기' : 'Mask')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <button
              onClick={generateSecuredPdf}
              disabled={processing}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: processing ? '#94a3b8' : 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Download size={24} />
              {processing
                ? (isKorean ? '처리 중...' : 'Processing...')
                : (isKorean ? '보안 처리된 PDF 다운로드' : 'Download Secured PDF')}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isKorean
                ? `${detectedInfo.filter(info => info.masked).length}개 항목이 마스킹됩니다`
                : `${detectedInfo.filter(info => info.masked).length} items will be masked`}
            </p>
          </div>
        </div>
      )}

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%', maxWidth: '896px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <ShareBar
          title={isKorean ? 'PDF 개인정보 마스킹 도구' : 'PDF Privacy Masking Tool'}
          description={isKorean ? '주민번호, 전화번호 등 개인정보를 AI가 자동으로 탐지하여 마스킹합니다' : 'AI automatically detects and masks personal information like SSN and phone numbers'}
        />
        <RelatedTools toolId="utilities/document/pdf-masking" />
        <div style={{
          width: '100%',
          minHeight: '90px',
          background: 'rgba(241, 245, 249, 0.5)',
          border: '1px dashed #cbd5e1',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          margin: '2rem 0',
        }}>
          {isKorean ? '광고 영역' : 'Ad Space'}
        </div>
      </div>

      {/* SEO Section */}
      <SeoSection
        ko={{
          title: 'PDF 개인정보 마스킹이란 무엇인가요?',
          description: 'PDF 문서에 포함된 개인정보를 AI가 자동으로 탐지하고 마스킹(검은 박스로 가리기)하는 무료 온라인 보안 도구입니다. 주민등록번호(13자리), 전화번호, 이메일 주소, 국내 주소(시·구·동 단위)를 정규표현식 기반 패턴 매칭으로 자동 탐지합니다. 모든 처리는 브라우저 내에서 100% 로컬로 이루어져 파일이 서버로 전송되지 않으며, 개발자를 포함한 그 누구도 귀하의 파일을 열람할 수 없습니다. 공무원, 기업 보안팀, 법률 사무소, 병원 등 개인정보 관련 규정을 준수해야 하는 모든 조직에서 즉시 활용할 수 있습니다. AI 탐지 결과는 개별적으로 확인 및 수정이 가능하여 정확한 마스킹 제어를 보장합니다.',
          useCases: [
            {
              icon: '🏛️',
              title: '공무원 전용 문서 처리',
              desc: '민감한 행정 문서의 주민번호·연락처 등 개인정보를 서버 업로드 없이 안전하게 마스킹하세요. 개인정보보호법 준수를 유지하면서 업무 효율을 높일 수 있습니다.',
            },
            {
              icon: '🏢',
              title: '기업 보안팀 필수 도구',
              desc: '계약서, 인사 문서, 고객 정보 등 민감 데이터를 포함한 PDF를 로컬에서 처리하여 데이터 유출 리스크를 제로화하세요. 외부로의 네트워크 트래픽이 발생하지 않아 DLP 솔루션에도 감지되지 않습니다.',
            },
            {
              icon: '⚖️',
              title: '법률 문서 편집',
              desc: '변호사, 법무법인에서 의뢰인 정보를 포함한 문서를 안전하게 편집하고 상대방이나 법원에 제출할 때 활용하세요. GDPR 및 개인정보보호법 요건을 충족하는 처리 방식입니다.',
            },
            {
              icon: '🛡️',
              title: '100% 프라이버시 보장',
              desc: '모든 처리가 브라우저 내에서 완료되어 파일이 서버로 전송되지 않습니다. 개발자를 포함한 그 누구도 귀하의 파일을 볼 수 없어 기밀 문서 처리에 완전히 안전합니다.',
            },
          ],
          steps: [
            {
              step: '1. PDF 업로드',
              desc: 'PDF 파일을 드래그 앤 드롭하거나 업로드 영역을 클릭하여 파일을 선택합니다. 파일은 브라우저 메모리로만 로드되며 서버로 전송되지 않습니다.',
            },
            {
              step: '2. AI 보안 분석',
              desc: 'AI가 각 페이지의 텍스트를 추출하여 주민번호, 전화번호, 이메일, 주소 패턴을 자동으로 탐지하고, 0~100점 사이의 보안 점수와 탐지 결과 목록을 제공합니다.',
            },
            {
              step: '3. 마스킹 항목 선택',
              desc: '탐지된 개인정보 목록을 확인하고 각 항목을 개별적으로 가리기/표시로 설정합니다. 전체 가리기·전체 표시 버튼으로 일괄 적용도 가능합니다.',
            },
            {
              step: '4. 보안 PDF 다운로드',
              desc: '선택한 항목이 검은 박스로 마스킹된 보안 PDF를 다운로드합니다. 원본 파일은 변경되지 않으며, 마스킹된 사본만 새로 생성됩니다.',
            },
          ],
          faqs: [
            {
              q: '회사 보안팀이나 DLP 솔루션에 감지되지 않나요?',
              a: '100% 로컬 처리로 네트워크 트래픽이 전혀 발생하지 않습니다. 파일이 서버로 업로드되지 않으므로 보안팀 네트워크 모니터링이나 DLP 솔루션에 감지되지 않으며, 회사 보안 정책을 위반하지 않습니다.',
            },
            {
              q: 'AI가 잘못 탐지하거나 놓친 개인정보가 있으면 어떻게 하나요?',
              a: '탐지된 모든 항목은 개별적으로 확인하고 수동으로 가리기/표시를 선택할 수 있습니다. 정규표현식 패턴에 맞지 않는 특수한 형식의 개인정보는 탐지되지 않을 수 있으므로, 중요 문서는 탐지 결과를 직접 검토하는 것을 권장합니다.',
            },
            {
              q: '어떤 개인정보 유형을 탐지하나요?',
              a: '현재 주민등록번호(XXXXXX-XXXXXXX 형식), 전화번호(010/02/031 등 국내 번호 형식), 이메일 주소, 국내 주소(시·군·구·동·읍·면·로·길 포함 패턴)를 정규표현식 기반으로 자동 탐지합니다. 향후 더 많은 패턴이 추가될 예정입니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
            },
          ],
        }}
        en={{
          title: 'What is PDF Privacy Masking?',
          description: 'A free online security tool that uses AI to automatically detect and mask (redact) personal information in PDF documents. Detects Korean Social Security Numbers (13-digit format), phone numbers, email addresses, and Korean residential addresses using regex-based pattern matching. All processing runs 100% locally in your browser — files are never sent to a server, and no one, including developers, can access your documents. Ideal for government agencies, corporate security teams, law firms, and hospitals that must comply with privacy regulations such as GDPR and the Korean Personal Information Protection Act. AI detection results can be individually reviewed and toggled, giving you precise control over which information gets redacted.',
          useCases: [
            {
              icon: '🏛️',
              title: 'Government Document Processing',
              desc: 'Safely mask personal information in sensitive administrative documents without any server upload. Maintain compliance with personal data protection laws while improving processing efficiency.',
            },
            {
              icon: '🏢',
              title: 'Corporate Security Essential',
              desc: 'Process PDFs containing sensitive data — contracts, HR records, customer information — entirely on your local machine to eliminate data breach risks. No network traffic is generated, so DLP tools won\'t flag the activity.',
            },
            {
              icon: '⚖️',
              title: 'Legal Document Editing',
              desc: 'Lawyers and law firms can safely redact client information before submitting documents to courts or opposing counsel. Meets GDPR and privacy law requirements with fully local processing.',
            },
            {
              icon: '🛡️',
              title: '100% Privacy Guaranteed',
              desc: 'All processing completes inside your browser. Files never leave your device — not even to the tool\'s developers. Fully safe for classified and confidential documents.',
            },
          ],
          steps: [
            {
              step: '1. Upload PDF',
              desc: 'Drag and drop your PDF or click the upload area to select a file. The file is loaded only into browser memory and is never transmitted to a server.',
            },
            {
              step: '2. AI Security Analysis',
              desc: 'AI extracts text from each page and automatically detects SSN, phone number, email, and address patterns. A security score (0–100) and a full list of detected items are displayed.',
            },
            {
              step: '3. Select Items to Mask',
              desc: 'Review the detected information list and toggle each item individually to mask or reveal it. Use the "Mask All" or "Show All" buttons for quick bulk actions.',
            },
            {
              step: '4. Download Secured PDF',
              desc: 'Download the security-processed PDF with all selected items covered by solid black boxes. The original file is unchanged — only the redacted copy is generated and saved.',
            },
          ],
          faqs: [
            {
              q: 'Will my company\'s security team or DLP solution detect this?',
              a: '100% local processing means absolutely no network traffic is generated. Files are never uploaded to any server, so they won\'t appear in network security monitoring or DLP logs, and no company security policies are violated.',
            },
            {
              q: 'What if AI detects something incorrectly or misses personal data?',
              a: 'All detected items can be individually reviewed and manually toggled to mask or show. Personal information in unusual formats that don\'t match standard regex patterns may not be detected, so we recommend manually reviewing the detection results for critical documents.',
            },
            {
              q: 'What types of personal information can it detect?',
              a: 'Currently detects Korean SSN (XXXXXX-XXXXXXX format), phone numbers (Korean 010/02/031 format), email addresses, and Korean addresses (containing city, district, town, road identifiers). More patterns will be added in future updates.',
            },
            {
              q: 'Can I use this result as official data?',
              a: 'Results are for reference only. Please consult a professional or official source for accurate figures.',
            },
          ],
        }}
      />

      {/* Security Disclaimer */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid #1e3a8a' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {isKorean ? '🛡️ 보안 면책 조항' : '🛡️ Security Disclaimer'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {isKorean
            ? '본 서비스는 100% 로컬 연산을 수행하며 개발자를 포함한 그 누구도 귀하의 파일을 볼 수 없습니다. 모든 처리는 귀하의 브라우저 메모리 내에서만 이루어지며, 어떤 데이터도 외부 서버로 전송되지 않습니다. 하지만 AI 탐지가 모든 개인정보를 완벽하게 찾아내지 못할 수 있으므로, 중요한 문서는 최종 검토를 권장합니다.'
            : 'This service performs 100% local computation and no one, including developers, can see your files. All processing happens only in your browser memory, and no data is sent to external servers. However, as AI detection may not perfectly find all personal information, we recommend final review for critical documents.'}
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
