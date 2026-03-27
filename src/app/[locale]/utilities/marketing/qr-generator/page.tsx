'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Search, 
  LayoutGrid, 
  Smartphone, 
  Share2,
  Trash2,
  Sparkles
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './qr.module.css';

export default function QRGeneratorPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  
  const [inputValue, setInputValue] = useState('');
  const [isClient, setIsClient] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { setIsClient(true); }, []);

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // SVG Blob with higher quality padding/size
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1200;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngFile = canvas.toDataURL('image/png', 1.0); // Full quality
        const downloadLink = document.createElement('a');
        downloadLink.download = `theutilhub_qr_${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const clear = () => setInputValue('');

  if (!isClient) return null;

  return (
    <div className={s.qr_container}>
      <NavigationActions />

      <header className={s.qr_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <QrCode size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.qr_title}>
          {isKo ? '고해상도 QR 생성기' : 'HD QR Code Generator'}
        </h1>
        <p className={s.qr_subtitle}>
          {isKo 
            ? '링크나 텍스트를 고화질 QR 코드로 즉시 변환하고 소장하세요' 
            : 'Turn any URL or text into a high-quality QR code instantly'}
        </p>
      </header>
      
      <section className={s.qr_panel}>
        <div className={s.qr_input_wrapper}>
          <label className={s.hashtag_label} style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
            {isKo ? 'URL 또는 텍스트 입력' : 'Enter URL or Text'}
            {inputValue && <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={clear} />}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isKo ? "https://..." : "e.g. your website link"}
            className={s.qr_input}
          />
        </div>

        <div className={s.qr_drawing_area} style={{ background: inputValue.trim() ? '#ffffff' : '#f1f5f9', border: inputValue.trim() ? '1px solid #e2e8f0' : '2px dashed #cbd5e1' }}>
          {inputValue.trim() ? (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <div className={s.qr_svg_wrapper}>
                <QRCodeSVG 
                  value={inputValue} 
                  size={240} 
                  level="H" 
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                  ref={svgRef}
                />
              </div>
              
              <button onClick={handleDownload} className={s.qr_primary_button}>
                <Download size={22} />
                {isKo ? 'PNG 이미지 저장' : 'Save as PNG'}
              </button>
            </div>
          ) : (
            <div className={s.qr_empty_state}>
              <Smartphone size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p>{isKo ? 'URL을 입력하면 이곳에 QR 코드가 생성됩니다.' : 'QR Code will appear here when you type.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Standard Bottom Sections (Rulebook V4.4) ─── */}
      <div style={{ width: '100%' }}>
        
        {/* 0-0. SNS Share */}
        <ShareBar 
          title={isKo ? '고해상도 QR 생성기' : 'HD QR Code Generator'} 
          description={isKo ? '누구나 쉽고 빠르게 만드는 무제한 무료 QR 코드' : 'Create free unlimited QR codes in seconds'} 
        />

        {/* 0-1. Recommended Tools */}
        <RelatedTools toolId="utilities/marketing/qr-generator" />

        {/* 0-2. Ad Placeholder */}
        <div className={s.qr_ad_placeholder}>
          {isKo ? '광고 영역 (Google AdSense 등)' : 'Ad Space (Google AdSense, etc.)'}
        </div>

        {/* 1 ~ 4. SEO Sections */}
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
              { step: '1', desc: '입력창에 QR 코드로 만들 URL(https://...) 또는 원하는 텍스트를 붙여넣으세요.' },
              { step: '2', desc: '입력 즉시 하단에 QR 코드 미리보기가 실시간으로 생성되는 것을 확인하세요.' },
              { step: '3', desc: '다운로드 버튼을 클릭해 고해상도 이미지로 저장하여 인쇄물에 바로 활용하세요.' },
            ],
            faqs: [
              { q: '생성된 QR 코드는 유효기간이 있나요?', a: '아니요. 본 도구가 생성하는 QR은 유효기간이 없는 정적 QR입니다. 가리키는 웹페이지 주소만 살아있다면 영구적으로 작동합니다.' },
              { q: 'QR 코드를 인쇄할 때 주의할 점은?', a: '고해상도 이미지(1200px)를 제공하므로 크게 인쇄해도 깨지지 않습니다. 다만, 스마트폰 인식을 위해 최소 2cm 이상의 크기를 권장합니다.' },
              { q: '이미지를 상업적으로 사용해도 되나요?', a: '네, 이 도구로 만든 QR 코드는 개인/기업 모두 저작권 제약 없이 상업적 용도로 자유롭게 사용하실 수 있습니다.' },
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
              { step: '1', desc: 'Paste the URL or text you want into the input field above.' },
              { step: '2', desc: 'Watch your QR code appear instantly in the preview area below.' },
              { step: '3', desc: 'Download the high-resolution PNG file and use it on your marketing materials.' },
            ],
            faqs: [
              { q: 'Do QR codes expire?', a: 'No. These are static QR codes that never expire. They will work as long as the underlying link remains active.' },
              { q: 'What size should I print it?', a: 'We provide a 1200px HD image. For best results, print at least 2cm wide to ensure easy smartphone scanning.' },
              { q: 'Is it free for commercial use?', a: 'Yes. All QR codes generated here are 100% free for both personal and commercial use without any restrictions.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
