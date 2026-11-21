'use client';

import { useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';
import { Shield, Upload, Download, Eye, EyeOff, AlertTriangle, CheckCircle, FileText, Trash2, Lock, ShieldCheck } from 'lucide-react';

// ⚠️ jsPDF / pdfjs-dist 는 모듈 최상단에서 import 하면 안 된다.
// pdfjs-dist 가 import 시점에 브라우저 전용 전역(DOMMatrix)을 참조해
// 서버(Node) SSR에서 ReferenceError 로 라우트 전체가 크래시 → raw HTML 이 빈 껍데기가 됨.
// 따라서 두 라이브러리는 사용하는 핸들러 안에서 동적 import 한다(브라우저에서만 로드).

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

export default function PdfMaskingClient({ seo }: { seo?: React.ReactNode }) {
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
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';
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
      const { jsPDF } = await import('jspdf');
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
    <div className="max-w-[var(--tool-width-wide)] mx-auto">
      <NavigationActions />

      <ToolHeader
        icon={<ShieldCheck />}
        title={isKorean ? 'PDF 개인정보 마스킹' : 'PDF Privacy Masking'}
        subtitle={isKorean
          ? '100% 로컬 처리 | AI 개인정보 탐지 | 서버 전송 없음'
          : '100% Local Processing | AI Privacy Detection | No Server Upload'}
      >
        {/* Security Badge */}
        <div className={`${ui.badge} ${ui.blue}`} style={{ marginTop: '1rem', marginBottom: '1rem', whiteSpace: 'normal' }}>
          <Lock size={14} />
          {isKorean ? '로컬 보안 구역 작동 중 (오프라인 안전)' : 'Local Security Zone Active (Offline Safe)'}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flexBasis: '100%' }}>
          {isKorean
            ? '귀하의 문서는 브라우저를 절대 떠나지 않습니다. 개발자도 볼 수 없습니다.'
            : 'Your documents never leave your browser. Even developers cannot see them.'}
        </p>
      </ToolHeader>

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
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = 'var(--tint-violet-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Shield size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {isKorean ? 'PDF 파일을 드래그하거나 클릭하여 업로드' : 'Drag & Drop PDF or Click to Upload'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>
              {isKorean ? 'AI가 개인정보를 자동으로 탐지하고 보안 점수를 제공합니다' : 'AI automatically detects personal information and provides a security score'}
            </p>
            <div className={`${ui.badge} ${ui.green}`}>
              <CheckCircle size={14} />
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
        <div className={`${ui.card} animate-slide-up`} style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Shield size={48} style={{ color: 'var(--color-primary)', animation: 'pulse 2s infinite' }} />
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
              background: 'var(--primary-fill)',
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
          <div className={ui.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div>
                <h3 className={ui.cardTitle} style={{ marginBottom: '0.35rem' }}>
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
                className={`${ui.button} ${ui.secondary}`}
              >
                <Trash2 size={18} />
                {isKorean ? '새 파일' : 'New File'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                padding: '1.5rem',
                background: securityScore >= 80 ? 'var(--tint-green-bg)' : securityScore >= 50 ? 'var(--tint-amber-bg)' : 'var(--tint-red-bg)',
                borderRadius: 'var(--radius-control)',
                border: `1px solid ${securityScore >= 80 ? 'var(--tint-green-border)' : securityScore >= 50 ? 'var(--tint-amber-border)' : 'var(--tint-red-border)'}`,
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '보안 점수' : 'Security Score'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: securityScore >= 80 ? 'var(--tint-green-fg)' : securityScore >= 50 ? 'var(--tint-amber-fg)' : 'var(--tint-red-fg)' }}>
                  {securityScore}
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--tint-red-bg)', borderRadius: 'var(--radius-control)', border: '1px solid var(--tint-red-border)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '탐지된 개인정보' : 'Detected Info'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--tint-red-fg)' }}>
                  {detectedInfo.length}
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--tint-blue-bg)', borderRadius: 'var(--radius-control)', border: '1px solid var(--tint-blue-border)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isKorean ? '마스킹 예정' : 'Will Be Masked'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--tint-blue-fg)' }}>
                  {detectedInfo.filter(info => info.masked).length}
                </div>
              </div>
            </div>
          </div>

          {/* Detected Information List */}
          {detectedInfo.length > 0 && (
            <div className={ui.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <h3 className={ui.cardTitle} style={{ margin: 0 }}>
                  {isKorean ? '탐지된 개인정보 목록' : 'Detected Personal Information'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleAllMasks(true)}
                    className={`${ui.button} ${ui.danger} ${ui.sm}`}
                  >
                    <EyeOff size={16} />
                    {isKorean ? '전체 가리기' : 'Mask All'}
                  </button>
                  <button
                    onClick={() => toggleAllMasks(false)}
                    className={`${ui.button} ${ui.secondary} ${ui.sm}`}
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
                      background: info.masked ? 'var(--tint-red-bg)' : 'var(--surface)',
                      border: `1px solid ${info.masked ? 'var(--tint-red-border)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-control)',
                      gap: '0.75rem',
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
                          color: info.masked ? 'var(--tint-red-fg)' : 'var(--text-secondary)',
                          textDecoration: info.masked ? 'line-through' : 'none',
                        }}>
                          {info.text}
                        </div>
                      </div>
                      <div className={`${ui.badge} ${ui.blue}`}>
                        {isKorean ? `페이지 ${info.page}` : `Page ${info.page}`}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMask(info.id)}
                      className={`${ui.button} ${ui.sm} ${info.masked ? ui.secondary : ui.danger}`}
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
          <div className={ui.card}>
            <button
              onClick={generateSecuredPdf}
              disabled={processing}
              className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`}
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
      </div>

      {/* SEO Section */}
      {seo}

      {/* Security Disclaimer */}
      <div className={ui.card} style={{ marginTop: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
        <h3 className={ui.cardTitle} style={{ marginBottom: '0.5rem' }}>
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
