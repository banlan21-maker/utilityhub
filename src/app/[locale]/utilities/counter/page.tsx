'use client';

import {useTranslations} from 'next-intl';
import { useState } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

export default function CharacterCounterPage() {
  const t = useTranslations('TextCounter');
  const [text, setText] = useState('');

  // Calculate Lengths
  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s+/g, '').length;

  // Calculate Bytes
  // UTF-8: ASCII(1), others(up to 4, commonly 3 for Hangul)
  const byteUtf8 = new Blob([text]).size;
  
  // Fake EUC-KR Calculation for common Korean usage (ASCII: 1, Hangul: 2)
  const calculateEucKr = (str: string) => {
    let bytes = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // Basic English/ASCII
      if (charCode <= 0x7f) {
        bytes += 1;
      } 
      // Hangul and others
      else {
        bytes += 2;
      }
    }
    return bytes;
  };
  
  const byteEucKr = calculateEucKr(text);

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('description')}
        </p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Input Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          rows={8}
          className="glass-panel"
          style={{
            width: '100%',
            padding: '1.5rem',
            fontSize: '1.125rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border)',
            outline: 'none',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            resize: 'vertical',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Results Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('charsIncludeSpaces')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
              {charsWithSpaces.toLocaleString()}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('charsExcludeSpaces')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {charsWithoutSpaces.toLocaleString()}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('byteUtf8')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              {byteUtf8.toLocaleString()}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>B</span>
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('byteEucKr')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              {byteEucKr.toLocaleString()}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>B</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
