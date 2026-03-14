'use client';

import {useTranslations} from 'next-intl';
import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import NavigationActions from '@/app/components/NavigationActions';

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
    </div>
  );
}
