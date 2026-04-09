'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './privacy-masking.module.css';

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "개인정보 마스킹 도구",
  "alternateName": "Personal Data Masking Tool",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/security/privacy-masking",
  "description": "텍스트 내 이메일, 전화번호, 주민번호, 신용카드 번호, IP 주소, 한국 이름 등 민감한 개인정보를 자동으로 검출하고 별표(*)로 마스킹하는 온라인 비식별화 도구입니다. 모든 처리는 브라우저에서만 이루어져 서버에 데이터가 전송되지 않습니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "입력한 텍스트가 서버로 전송되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "전혀 그렇지 않습니다. 이 개인정보 마스킹 도구는 100% 클라이언트 사이드(브라우저)에서만 동작하며, 입력한 텍스트는 어떠한 서버에도 전송되지 않습니다. 완전히 오프라인 환경에서도 사용할 수 있습니다." }
    },
    {
      "@type": "Question",
      "name": "마스킹 규칙을 부분적으로만 적용할 수 있나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "네. 왼쪽 패널의 체크박스에서 원하는 규칙만 선택하면 됩니다. 예를 들어 이메일만 마스킹하고 전화번호는 그대로 두고 싶다면 이메일 규칙만 체크하세요." }
    },
    {
      "@type": "Question",
      "name": "한국 이름 마스킹이 일부 단어를 잘못 처리합니다",
      "acceptedAnswer": { "@type": "Answer", "text": "한국 이름 마스킹은 2~3글자 한글을 패턴으로 인식하므로, 일반 한국어 단어와 구분이 어려울 수 있습니다. 이름이 포함된 텍스트는 결과를 꼭 검토 후 사용하세요." }
    },
    {
      "@type": "Question",
      "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." }
    }
  ]
};

// ── Masking Rules ──────────────────────────────────────────────────────────
interface MaskRule {
  id: string;
  label: string;
  labelEn: string;
  pattern: RegExp;
  replace: (match: string) => string;
  example: string;
}

const RULES: MaskRule[] = [
  {
    id: 'email',
    label: '이메일 주소',
    labelEn: 'Email Address',
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replace: (m) => {
      const [local, domain] = m.split('@');
      const maskedLocal = local[0] + '***';
      const domainParts = domain.split('.');
      const maskedDomain = domainParts[0][0] + '***.' + domainParts.slice(1).join('.');
      return `${maskedLocal}@${maskedDomain}`;
    },
    example: 'hong@example.com → h***@e***.com',
  },
  {
    id: 'phone_kr',
    label: '한국 전화번호',
    labelEn: 'Korean Phone',
    pattern: /(\d{2,3})-(\d{3,4})-(\d{4})/g,
    replace: (m) => m.replace(/(\d{2,3})-(\d{3,4})-(\d{4})/, '$1-****-$3'),
    example: '010-1234-5678 → 010-****-5678',
  },
  {
    id: 'ssn_kr',
    label: '주민등록번호',
    labelEn: 'Korean SSN',
    pattern: /\d{6}-[1-4]\d{6}/g,
    replace: (m) => m.slice(0, 8) + '*******',
    example: '901201-1234567 → 901201-*******',
  },
  {
    id: 'card',
    label: '신용카드 번호',
    labelEn: 'Credit Card',
    pattern: /\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/g,
    replace: (m) => {
      const digits = m.replace(/[\s\-]/g, '');
      return `****-****-****-${digits.slice(-4)}`;
    },
    example: '1234-5678-9012-3456 → ****-****-****-3456',
  },
  {
    id: 'ip',
    label: 'IP 주소',
    labelEn: 'IP Address',
    pattern: /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g,
    replace: (m) => {
      const parts = m.split('.');
      return `${parts[0]}.${parts[1]}.***.***`;
    },
    example: '192.168.1.1 → 192.168.***.***',
  },
  {
    id: 'name_kr',
    label: '한국 이름 (3글자)',
    labelEn: 'Korean Name',
    pattern: /[가-힣]{2}([가-힣])[가-힣]{0}/g,
    replace: (m) => m[0] + '*' + (m[2] ?? ''),
    example: '홍길동 → 홍*동',
  },
];

function applyMasking(text: string, enabled: Set<string>): { result: string; count: number } {
  let result = text;
  let count = 0;
  for (const rule of RULES) {
    if (!enabled.has(rule.id)) continue;
    result = result.replace(rule.pattern, (match) => {
      count++;
      return rule.replace(match);
    });
  }
  return { result, count };
}

// highlight differences
function buildHighlighted(original: string, masked: string): React.ReactNode[] {
  const origWords = original.split(/(\s+)/);
  const maskedWords = masked.split(/(\s+)/);
  return maskedWords.map((word, i) => {
    const changed = word !== origWords[i];
    return (
      <span key={i} style={changed ? { background: '#fef08a', color: '#78350f', borderRadius: '2px', padding: '0 1px' } : undefined}>
        {word}
      </span>
    );
  });
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RedactPage() {
  const t = useTranslations('Redact');

  const [input, setInput] = useState('안녕하세요. 제 이메일은 hong@example.com이고 전화번호는 010-1234-5678입니다.\n주민번호: 901201-1234567, 카드: 1234-5678-9012-3456');
  const [enabled, setEnabled] = useState<Set<string>>(new Set(RULES.map(r => r.id)));
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const { result: masked, count } = applyMasking(input, enabled);

  const toggleRule = (id: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(masked).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '1rem', fontSize: '0.9rem', lineHeight: 1.7,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', color: 'var(--text-primary)',
    outline: 'none', resize: 'vertical', fontFamily: 'monospace',
  };

  return (
    <div>
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
          <Shield size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      {/* Privacy badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, color: '#14532d' }}>
          🔒 {t('privacy_badge')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Rule toggles */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('rules_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {RULES.map(rule => (
                <label key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabled.has(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    style={{ width: '1rem', height: '1rem', marginTop: '0.15rem', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rule.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontFamily: 'monospace', marginTop: '0.1rem' }}>{rule.example}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: count > 0 ? '#10b981' : 'var(--text-secondary)' }}>{count}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t('masked_count')}</div>
          </div>
        </div>

        {/* ── Right: Text areas ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Input */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              {t('input_label')}
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={7}
              placeholder={t('placeholder')}
              style={inp}
            />
          </div>

          {/* Output */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('output_label')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showDiff} onChange={e => setShowDiff(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                  {t('highlight')}
                </label>
                <button onClick={handleCopy}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`, background: copied ? '#ecfdf5' : 'var(--surface)', color: copied ? '#065f46' : 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
              </div>
            </div>
            {showDiff ? (
              <div style={{ ...inp, minHeight: '10rem', whiteSpace: 'pre-wrap', overflow: 'auto' } as React.CSSProperties}>
                {buildHighlighted(input, masked)}
              </div>
            ) : (
              <textarea readOnly value={masked} rows={7} style={{ ...inp, background: '#f0fdf4' }} />
            )}
          </div>
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/security/privacy-masking" />

      {/* 광고 영역 */}
      <div className={s.ad_placeholder}>광고 영역</div>

      <SeoSection
        ko={{
          title: "개인정보 마스킹 도구란 무엇인가요?",
          description: "개인정보 마스킹 도구는 텍스트 안에 포함된 이메일 주소, 전화번호, 주민등록번호, 신용카드 번호, IP 주소, 이름 등의 민감한 개인정보를 자동으로 검출하고 일부를 별표(*)로 대체하는 온라인 개인정보 비식별화 도구입니다. 문서, 로그 파일, 고객 데이터, 스크린샷 텍스트 등을 공유하기 전에 개인정보를 안전하게 마스킹할 수 있습니다. 모든 처리는 브라우저에서만 이루어지며 서버에 데이터가 전송되지 않으므로 민감한 정보도 안심하고 사용할 수 있습니다.",
          useCases: [
            { icon: '📋', title: '고객 데이터 공유 전 비식별화', desc: '고객 정보가 담긴 CSV, 스프레드시트 내용을 동료나 외부 업체와 공유하기 전 개인정보를 마스킹합니다.' },
            { icon: '🐛', title: '개발 로그 & 에러 리포트 공유', desc: '서버 로그나 에러 메시지에 포함된 사용자 이메일, IP 주소를 마스킹한 후 개발팀이나 GitHub에 공유합니다.' },
            { icon: '📝', title: '스크린샷 & 문서 공유', desc: '블로그 포스팅, SNS, 발표 자료에 스크린샷을 삽입할 때 개인정보가 노출되지 않도록 사전에 마스킹합니다.' },
            { icon: '🏢', title: 'GDPR & 개인정보보호법 대응', desc: '테스트 환경에서 실제 사용자 데이터 대신 마스킹된 데이터를 사용해 개인정보 규정을 준수합니다.' },
          ],
          steps: [
            { step: '마스킹 규칙 선택', desc: '왼쪽 패널에서 이메일, 전화번호, 주민번호, 카드번호, IP, 한국 이름 중 마스킹할 항목을 체크합니다. 각 항목 옆에 마스킹 예시가 표시되어 결과를 미리 파악할 수 있습니다.' },
            { step: '텍스트 붙여넣기', desc: '오른쪽 상단 입력창에 마스킹할 텍스트를 붙여넣거나 직접 입력합니다. 여러 줄의 텍스트도 한 번에 처리할 수 있습니다.' },
            { step: '결과 확인 및 복사', desc: '하단 출력창에 마스킹 결과가 즉시 표시됩니다. 노란색으로 강조된 부분이 마스킹된 항목이며, 복사 버튼으로 클립보드에 저장합니다.' },
            { step: '마스킹 결과 검토', desc: '출력 결과를 반드시 육안으로 검토하여 의도치 않게 마스킹되거나 누락된 항목이 없는지 확인한 후 사용합니다. 필요 시 규칙 체크박스를 조정해 재처리할 수 있습니다.' },
          ],
          faqs: [
            { q: '입력한 텍스트가 서버로 전송되나요?', a: '전혀 그렇지 않습니다. 이 개인정보 마스킹 도구는 100% 클라이언트 사이드(브라우저)에서만 동작하며, 입력한 텍스트는 어떠한 서버에도 전송되지 않습니다. 완전히 오프라인 환경에서도 사용할 수 있습니다.' },
            { q: '마스킹 규칙을 부분적으로만 적용할 수 있나요?', a: '네. 왼쪽 패널의 체크박스에서 원하는 규칙만 선택하면 됩니다. 예를 들어 이메일만 마스킹하고 전화번호는 그대로 두고 싶다면 이메일 규칙만 체크하세요. 나머지 규칙은 활성화 상태를 유지하면서 특정 항목만 제외하는 방식도 가능합니다.' },
            { q: '한국 이름 마스킹이 일부 단어를 잘못 처리합니다', a: '한국 이름 마스킹은 2~3글자 한글을 패턴으로 인식하므로, 일반 한국어 단어와 구분이 어려울 수 있습니다. 이름이 포함된 텍스트는 결과를 꼭 검토 후 사용하세요. 정확한 이름 마스킹이 필요할 경우 해당 규칙을 비활성화하고 수동으로 처리하는 방법도 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is a Personal Data Masking Tool?",
          description: "A personal data masking tool automatically detects sensitive information in text — including email addresses, phone numbers, social security numbers, credit card numbers, IP addresses, and names — and replaces part of each with asterisks (*) to anonymize it. Use it to safely mask personal data in documents, log files, customer records, and screenshot text before sharing. All processing happens entirely in the browser; no data is ever sent to a server.",
          useCases: [
            { icon: '📋', title: 'De-identify Customer Data Before Sharing', desc: 'Mask personal information in CSV files and spreadsheet content before sharing with colleagues or external vendors.' },
            { icon: '🐛', title: 'Share Dev Logs & Error Reports', desc: 'Strip user emails and IP addresses from server logs and error messages before sharing with the dev team or posting to GitHub.' },
            { icon: '📝', title: 'Screenshots & Document Sharing', desc: 'Pre-mask any personal data before inserting screenshots into blog posts, social media, or presentations to prevent unintended exposure.' },
            { icon: '🏢', title: 'GDPR & Privacy Law Compliance', desc: 'Use masked data instead of real user data in test environments to maintain compliance with privacy regulations.' },
          ],
          steps: [
            { step: 'Select masking rules', desc: 'Check the rules you want to apply in the left panel: email, phone, SSN, credit card, IP address, Korean name. Each rule shows a sample output so you know what to expect.' },
            { step: 'Paste your text', desc: 'Paste or type the text you want to mask into the input area on the right. Multiple lines of text are processed all at once.' },
            { step: 'Review & copy result', desc: 'The masked output appears instantly. Yellow highlights show what was masked. Click the copy button to save it to your clipboard.' },
            { step: 'Verify the output', desc: 'Always review the masked result manually to confirm no items were accidentally missed or incorrectly masked. Adjust the rule checkboxes and reprocess if needed.' },
          ],
          faqs: [
            { q: 'Is my input text sent to a server?', a: 'Not at all. This tool runs 100% client-side in your browser. Your text is never transmitted to any server and can even be used completely offline — no internet connection required after the page loads.' },
            { q: 'Can I apply only some masking rules?', a: 'Yes. Use the checkboxes in the left panel to select only the rules you want. For example, to mask only emails while keeping phone numbers intact, check only the email rule. You can mix and match freely.' },
            { q: 'Korean name masking is incorrectly flagging some words', a: 'Korean name masking uses a 2–3 character Hangul pattern, which can be hard to distinguish from ordinary Korean words. Always review the output carefully when masking text that contains names. You can disable the name rule and handle those manually.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
