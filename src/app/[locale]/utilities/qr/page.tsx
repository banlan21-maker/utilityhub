'use client';

import {useTranslations} from 'next-intl';
import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

export default function QRGeneratorPage() {
  const catT = useTranslations('Categories');
  const t = useTranslations('QRGenerator');
  
  const [inputValue, setInputValue] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode_${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div>
      <NavigationActions />
      <h1 style={{ marginBottom: '1rem', color: 'var(--primary)', textAlign: 'center' }}>
        {t('title')}
      </h1>
      
      <div className="glass-panel" style={{ padding: 'var(--page-padding)', marginTop: 'var(--section-gap)' }}>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          {t('description')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('placeholder')}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border)',
              outline: 'none',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          <div 
            style={{ 
              minHeight: '260px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem'
            }}
          >
            {inputValue.trim() ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                  <QRCodeSVG 
                    value={inputValue} 
                    size={200} 
                    level="H" 
                    includeMargin={true}
                    ref={svgRef}
                  />
                </div>
                
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  ↓ {t('download')}
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                {t('emptyState')}
              </p>
            )}
          </div>

        </div>
      </div>

      <SeoSection
        ko={{
          title: "QR 코드 생성기란 무엇인가요?",
          description: "QR 코드(Quick Response Code)는 스마트폰 카메라로 즉시 스캔할 수 있는 2차원 바코드로, URL·텍스트·연락처 등 다양한 정보를 담을 수 있습니다. 이 무료 QR 코드 생성기는 원하는 링크나 텍스트를 입력하면 고해상도 QR 코드 이미지를 즉시 생성하고 PNG로 다운로드할 수 있습니다. 별도 앱 설치 없이 브라우저에서 바로 사용 가능하며, 생성된 QR 코드는 인쇄물·온라인 홍보물 등에 자유롭게 활용할 수 있습니다.",
          useCases: [
            { icon: '🏪', title: '오프라인 매장 홍보', desc: '명함, 전단지, 현수막에 QR 코드를 인쇄해 고객이 스캔만으로 홈페이지나 주문 페이지에 바로 접근하게 합니다.' },
            { icon: '📋', title: '행사 & 이벤트 안내', desc: '세미나·전시회 자료집에 QR 코드를 삽입해 발표 자료, 동영상, 설문 링크를 빠르게 공유할 수 있습니다.' },
            { icon: '💼', title: '디지털 명함', desc: '개인 포트폴리오나 링크드인 프로필 URL을 QR 코드화해 명함 뒷면에 넣으면 스마트한 인상을 줄 수 있습니다.' },
            { icon: '🍽️', title: '식당 & 카페 메뉴판', desc: '종이 메뉴판 대신 QR 코드로 디지털 메뉴를 연결하면 위생적이고 업데이트도 손쉽습니다.' },
          ],
          steps: [
            { step: '링크 또는 텍스트 입력', desc: '입력창에 QR 코드로 만들 URL(https://...) 또는 원하는 텍스트를 붙여넣습니다.' },
            { step: '미리보기 확인', desc: '입력 즉시 우측에 QR 코드 미리보기가 실시간으로 생성됩니다.' },
            { step: 'PNG 다운로드', desc: '다운로드 버튼을 클릭하면 고해상도 PNG 파일로 저장됩니다. 인쇄용으로도 선명하게 출력됩니다.' },
          ],
          faqs: [
            { q: '생성된 QR 코드는 유효기간이 있나요?', a: 'URL을 직접 담는 방식(정적 QR)으로 생성되므로 유효기간이 없습니다. 단, QR 코드가 가리키는 웹페이지 자체가 삭제되면 스캔해도 빈 페이지가 뜰 수 있습니다.' },
            { q: 'QR 코드가 너무 작거나 인쇄가 흐릿합니다', a: '다운로드된 PNG는 기본 1024px 이상의 고해상도입니다. 인쇄 시 최소 2×2cm 이상 크기로 출력하면 대부분의 스마트폰에서 정확히 인식됩니다.' },
            { q: 'QR 코드에 로고를 삽입할 수 있나요?', a: '현재 이 도구는 순수 QR 코드를 생성합니다. 로고 삽입이 필요하다면 생성된 PNG를 포토샵·Canva 등 이미지 편집 툴에서 오버레이하는 방법을 권장합니다.' },
          ],
        }}
        en={{
          title: "What is a QR Code Generator?",
          description: "A QR Code (Quick Response Code) is a 2D barcode instantly scannable by smartphone cameras to encode URLs, text, contact info, and more. This free QR code generator creates a high-resolution QR code image the moment you type your link or text, available for immediate PNG download. No app installation required — works directly in your browser. Generated QR codes can be freely used on print materials, digital promotions, menus, and business cards.",
          useCases: [
            { icon: '🏪', title: 'Offline Store Promotion', desc: 'Print QR codes on flyers, banners, and business cards so customers can instantly reach your website or order page with a single scan.' },
            { icon: '📋', title: 'Events & Presentations', desc: 'Embed QR codes in seminar handouts or slide decks to share presentation files, videos, or survey links with attendees instantly.' },
            { icon: '💼', title: 'Digital Business Card', desc: 'Add a QR code to your business card linking to your portfolio or LinkedIn profile for a modern, memorable impression.' },
            { icon: '🍽️', title: 'Restaurant & Café Menus', desc: 'Replace printed menus with QR codes linking to digital menus — more hygienic and easy to update anytime.' },
          ],
          steps: [
            { step: 'Enter your URL or text', desc: 'Paste the URL (https://...) or any text you want to encode into the QR code.' },
            { step: 'Preview your QR code', desc: 'A live QR code preview is generated instantly as you type.' },
            { step: 'Download as PNG', desc: 'Click the download button to save a high-resolution PNG file — sharp enough for print.' },
          ],
          faqs: [
            { q: 'Do QR codes expire?', a: 'Static QR codes (which embed the URL directly) never expire. However, if the webpage the QR code points to is deleted, scanning it will result in a broken page.' },
            { q: 'The printed QR code looks blurry', a: 'The downloaded PNG is 1024px or larger. For print, output at a minimum size of 2×2cm — most smartphones will scan it accurately.' },
            { q: 'Can I add a logo to my QR code?', a: 'This tool generates a clean QR code without logo overlay. To add a logo, download the PNG and use an image editor like Canva or Photoshop to overlay it.' },
          ],
        }}
      />
    </div>
  );
}
