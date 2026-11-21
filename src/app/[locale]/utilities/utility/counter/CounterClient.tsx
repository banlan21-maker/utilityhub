'use client';

import {useTranslations} from 'next-intl';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';

export default function CounterClient({ seo }: { seo?: React.ReactNode }) {
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
      <ToolHeader icon={<Plus />} title={t('title')} subtitle={t('description')} />

      <div className={ui.card} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Input Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          rows={8}
          className={ui.input}
          style={{ fontSize: '1.1rem' }}
        />

        {/* Results Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>

          <div className={ui.card} style={{ textAlign: 'center' }}>
            <p className={ui.resultLabel}>
              {t('charsIncludeSpaces')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {charsWithSpaces.toLocaleString()}
            </p>
          </div>

          <div className={ui.card} style={{ textAlign: 'center' }}>
            <p className={ui.resultLabel}>
              {t('charsExcludeSpaces')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {charsWithoutSpaces.toLocaleString()}
            </p>
          </div>

          <div className={ui.card} style={{ textAlign: 'center' }}>
            <p className={ui.resultLabel}>
              {t('byteUtf8')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--tint-green-fg)', fontVariantNumeric: 'tabular-nums' }}>
              {byteUtf8.toLocaleString()}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>B</span>
            </p>
          </div>

          <div className={ui.card} style={{ textAlign: 'center' }}>
            <p className={ui.resultLabel}>
              {t('byteEucKr')}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--tint-green-fg)', fontVariantNumeric: 'tabular-nums' }}>
              {byteEucKr.toLocaleString()}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>B</span>
            </p>
          </div>

        </div>

      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/utility/counter" />


      {seo}
    </div>
  );
}
