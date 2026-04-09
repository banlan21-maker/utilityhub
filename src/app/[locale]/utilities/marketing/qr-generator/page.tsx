import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "고해상도 QR 코드 생성기 | Utility Hub"
    : "HD QR Code Generator | Utility Hub";
  const description = isKo
    ? "URL이나 텍스트를 고해상도 QR 코드로 즉시 변환하고 PNG로 무료 다운로드하세요"
    : "Convert any URL or text into a high-resolution QR code instantly. Free PNG download, no login required.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/marketing/qr-generator`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: "https://www.theutilhub.com/ko/utilities/marketing/qr-generator",
        en: "https://www.theutilhub.com/en/utilities/marketing/qr-generator",
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
  "name": "고해상도 QR 코드 생성기",
  "alternateName": "HD QR Code Generator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/marketing/qr-generator",
  "description": "URL이나 텍스트를 고해상도 QR 코드로 즉시 변환하고 PNG로 무료 다운로드하세요"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "생성된 QR 코드는 유효기간이 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "아니요. 본 도구가 생성하는 QR은 유효기간이 없는 정적 QR입니다. 가리키는 웹페이지 주소만 살아있다면 영구적으로 작동합니다." } },
    { "@type": "Question", "name": "QR 코드를 인쇄할 때 주의할 점은?", "acceptedAnswer": { "@type": "Answer", "text": "고해상도 이미지(1200px)를 제공하므로 크게 인쇄해도 깨지지 않습니다. 다만, 스마트폰 인식을 위해 최소 2cm 이상의 크기를 권장합니다." } },
    { "@type": "Question", "name": "이미지를 상업적으로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "네, 이 도구로 만든 QR 코드는 개인/기업 모두 저작권 제약 없이 상업적 용도로 자유롭게 사용하실 수 있습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <QrCode size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {isKo ? '고해상도 QR 생성기' : 'HD QR Code Generator'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
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
              { step: 'URL 또는 텍스트 입력', desc: '상단 입력창에 QR 코드로 변환할 웹사이트 주소(https://...)나 원하는 텍스트를 붙여넣거나 직접 입력합니다. 입력과 동시에 실시간으로 QR 코드가 생성됩니다.' },
              { step: 'QR 코드 미리보기 확인', desc: '입력창 아래에 즉시 나타나는 QR 코드 미리보기를 스마트폰 카메라로 직접 스캔해 정보가 올바르게 담겼는지 확인합니다.' },
              { step: 'PNG 이미지 저장', desc: 'PNG 이미지 저장 버튼을 클릭하면 1200×1200px 고해상도 이미지가 기기에 다운로드됩니다. 인쇄물 제작에 바로 활용할 수 있는 품질입니다.' },
              { step: '인쇄물 또는 디지털 채널에 적용', desc: '저장한 QR 코드 이미지를 명함, 전단지, 현수막, 프레젠테이션, SNS 게시물 등 원하는 매체에 삽입하여 활용합니다.' },
            ],
            faqs: [
              { q: '생성된 QR 코드는 유효기간이 있나요?', a: '아니요. 본 도구가 생성하는 QR은 유효기간이 없는 정적 QR 코드입니다. QR 코드 자체에 정보가 직접 인코딩되어 있어 별도 서버를 거치지 않으므로, 연결된 웹페이지 주소가 살아있는 한 영구적으로 스캔이 가능합니다.' },
              { q: 'QR 코드를 인쇄할 때 주의할 점은?', a: '1200px 고해상도 이미지를 제공하므로 대형 현수막 크기로 인쇄해도 깨지지 않습니다. 다만, 스마트폰 카메라가 안정적으로 인식하려면 인쇄 크기가 최소 2cm × 2cm 이상이어야 합니다. 배경과 QR 코드 간 충분한 여백(Quiet Zone)도 확보해야 스캔 성공률이 높아집니다.' },
              { q: '이미지를 상업적으로 사용해도 되나요?', a: '네, 이 도구로 만든 QR 코드 이미지는 개인·기업 구분 없이 저작권 제약 없이 상업적 용도로 자유롭게 사용 가능합니다. 홍보물, 패키지 디자인, 광고물 등 어떤 용도로도 활용하실 수 있습니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
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
              { step: 'Enter URL or Text', desc: 'Type or paste the website address (https://...) or any text you want to encode into the input field at the top. Your QR code generates in real time as you type.' },
              { step: 'Preview and Scan Test', desc: 'Check the QR code preview that appears immediately below the input. Scan it with your smartphone camera to verify the encoded information is correct before downloading.' },
              { step: 'Download HD PNG', desc: 'Click the "Save as PNG" button to download a 1200×1200px high-resolution image file to your device, ready for use in print or digital materials.' },
              { step: 'Apply to Your Materials', desc: 'Insert the downloaded QR code image into business cards, flyers, banners, presentations, menus, or social media posts — any medium where you want to give audiences instant access to your link.' },
            ],
            faqs: [
              { q: 'Do QR codes generated here ever expire?', a: 'No. These are static QR codes where the destination information is encoded directly into the image itself, with no intermediary server. They will remain scannable permanently as long as the linked webpage or destination URL stays active.' },
              { q: 'What is the minimum print size for reliable scanning?', a: 'We provide a 1200×1200px HD image, so print quality is never a concern. For reliable smartphone recognition, print the QR code at least 2cm × 2cm in size. Also ensure adequate white space (Quiet Zone) around all four sides of the code, as cluttered surroundings reduce scan success rates.' },
              { q: 'Can I use the QR code for commercial purposes?', a: 'Yes. All QR codes generated with this tool are completely free for both personal and commercial use with no attribution or licensing restrictions. Feel free to use them on product packaging, advertising materials, menus, or any commercial print and digital assets.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
