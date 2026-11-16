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

export default function QrGeneratorClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [inputValue, setInputValue] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);


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


  return (
    <div className={s.qr_container}>
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
    </div>
  );
}
