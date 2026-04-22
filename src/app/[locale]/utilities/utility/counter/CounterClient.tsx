'use client';

import {useTranslations} from 'next-intl';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';

export default function CounterClient() {
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
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Plus size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
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

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/utility/counter" />

      {/* 광고 영역 */}
      <div style={{
        width: '100%',
        minHeight: '90px',
        background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        margin: '2rem 0'
      }}>
        광고 영역
      </div>

      <SeoSection
        ko={{
          title: "글자 수 세기 / 바이트 계산기란 무엇인가요?",
          description: "글자 수 세기 & 바이트 계산기는 입력한 텍스트의 문자 개수(공백 포함/제외)와 바이트 용량을 즉시 계산해주는 온라인 도구입니다. 자기소개서, 이력서, SNS 게시물, 블로그 본문, SMS 문자 메시지 등 글자 수 제한이 있는 다양한 상황에서 정확한 분량을 파악하는 데 필수적으로 활용됩니다. 특히 한국어 텍스트는 EUC-KR과 UTF-8 인코딩에 따라 바이트 크기가 달라지기 때문에, 두 가지 기준을 동시에 확인할 수 있는 글자 수 계산기가 필요합니다. 이 도구는 별도 설치 없이 브라우저에서 바로 사용할 수 있으며, 입력과 동시에 실시간으로 결과를 보여줍니다.",
          useCases: [
            { icon: '📝', title: '자기소개서 & 이력서 작성', desc: '취업 포털의 글자 수 제한(예: 1,000자 이내)에 맞춰 내용을 조절할 때 실시간으로 확인하며 작성할 수 있습니다.' },
            { icon: '📱', title: 'SNS & 문자 메시지 작성', desc: 'X(트위터) 280자, 인스타그램 캡션, SMS 90바이트 제한 등 플랫폼별 규격에 맞게 텍스트를 다듬을 수 있습니다.' },
            { icon: '💻', title: '개발 & 데이터베이스 설계', desc: 'VARCHAR(255) 등 DB 컬럼 바이트 제한을 확인하거나, API 요청 본문의 용량을 미리 계산할 때 활용됩니다.' },
            { icon: '📄', title: '논문 & 보고서 분량 체크', desc: '학술 논문이나 공모전 응모작의 원고지 매수 환산, 최소/최대 글자 수 충족 여부를 손쉽게 확인합니다.' },
          ],
          steps: [
            { step: '텍스트 붙여넣기 또는 직접 입력', desc: '상단 입력창에 분량을 확인하고 싶은 텍스트를 붙여넣거나 직접 작성합니다. Ctrl+A로 전체 선택 후 붙여넣기하면 빠르게 입력할 수 있습니다.' },
            { step: '실시간 결과 확인', desc: '입력하는 즉시 공백 포함 글자 수, 공백 제외 글자 수, EUC-KR 바이트, UTF-8 바이트가 자동으로 계산됩니다. 별도 버튼 클릭 없이 타이핑과 동시에 반영됩니다.' },
            { step: '기준에 맞게 텍스트 조정', desc: '제한 기준과 현재 분량을 비교하며 텍스트를 추가하거나 줄여 원하는 분량으로 맞춥니다. 자기소개서 1,000자 제한, SMS 90바이트 제한 등 다양한 기준에 활용하세요.' },
            { step: '결과 활용 및 복사', desc: '확인한 글자 수나 바이트 수치를 메모하거나, 텍스트를 그대로 복사하여 목적지 플랫폼에 붙여넣습니다. 입력창 내용은 페이지를 새로고침하기 전까지 유지됩니다.' },
          ],
          faqs: [
            { q: '공백 포함과 공백 제외 글자 수, 어떤 기준을 써야 하나요?', a: '자기소개서나 공모전 대부분은 "공백 포함" 기준을 사용합니다. 단, 제출 플랫폼마다 다를 수 있으니 공고문의 안내를 반드시 확인하세요. 이 도구는 두 기준을 동시에 표시하므로 어떤 상황에도 바로 사용할 수 있습니다.' },
            { q: 'EUC-KR 바이트와 UTF-8 바이트는 왜 다른가요?', a: '한글 한 글자는 EUC-KR에서 2바이트, UTF-8에서 3바이트를 차지합니다. 영문과 숫자는 두 인코딩 모두 1바이트입니다. 오래된 한국 웹사이트나 전통적인 SMS 시스템은 EUC-KR을 사용하는 경우가 많고, 최신 웹 표준은 UTF-8을 사용합니다.' },
            { q: '입력한 텍스트가 서버에 저장되나요?', a: '아니요. 이 글자 수 계산기는 100% 브라우저에서만 작동하며, 입력한 내용은 외부 서버로 전송되지 않습니다. 민감한 문서 내용도 안심하고 사용하실 수 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is a Character & Byte Counter?",
          description: "The Character & Byte Counter is an online tool that instantly calculates the number of characters (with and without spaces) and byte size of your text in both EUC-KR and UTF-8 encodings. It's essential for writing job applications, social media posts, SMS messages, and any content with character limits. Since Korean text differs in byte size between EUC-KR (2 bytes/char) and UTF-8 (3 bytes/char), this tool lets you check both standards at once — all processed instantly in your browser.",
          useCases: [
            { icon: '📝', title: 'Job Applications & Resumes', desc: 'Monitor your character count in real time while writing job application essays with limits like "within 1,000 characters."' },
            { icon: '📱', title: 'Social Media & SMS', desc: 'Fit your posts within platform limits — X (Twitter) 280 chars, Instagram captions, SMS 160-char limits — before hitting send.' },
            { icon: '💻', title: 'Development & Database Design', desc: 'Verify byte sizes for VARCHAR column limits or calculate API request body sizes before sending.' },
            { icon: '📄', title: 'Essays & Reports', desc: 'Easily check minimum/maximum character requirements for academic papers, contest entries, or official submissions.' },
          ],
          steps: [
            { step: 'Paste or type your text', desc: 'Paste or type the text you want to measure into the input field. You can use Ctrl+A to select all and paste quickly from another document.' },
            { step: 'View real-time results', desc: 'Characters with spaces, without spaces, EUC-KR bytes, and UTF-8 bytes are calculated instantly as you type — no button click required.' },
            { step: 'Adjust your text', desc: 'Add or trim your text while watching the count to hit your target length precisely. Useful for fitting within a 1,000-character job application or a 160-character SMS limit.' },
            { step: 'Copy and use your text', desc: 'Once your text meets the target length, copy it directly from the input field and paste it into your destination platform. The content stays visible until you refresh the page.' },
          ],
          faqs: [
            { q: 'Should I use character count with or without spaces?', a: 'Most job application portals use "with spaces" as the standard. Always check the submission guidelines for the specific platform. This tool shows both simultaneously, so you are covered either way.' },
            { q: 'Why are EUC-KR and UTF-8 byte counts different?', a: 'Korean characters take 2 bytes in EUC-KR and 3 bytes in UTF-8. ASCII/English characters are 1 byte in both encodings. Older Korean websites and some SMS systems use EUC-KR; modern web standards use UTF-8.' },
            { q: 'Is my text sent to a server?', a: 'No. This counter runs 100% in your browser. Nothing is transmitted to any server, so you can safely paste sensitive document content such as cover letters, contracts, or personal messages.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
