'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './privacy-masking.module.css';

// ── Korean Surnames (단성 + 복성) ────────────────────────────────────────────
// 일반 단어 오탐을 줄이기 위해 화이트리스트 기반 매칭 사용.
const KOREAN_SURNAMES = new Set([
  '김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권',
  '황','안','송','전','홍','고','문','양','손','배','백','허','유','남','심',
  '노','하','곽','성','차','주','구','민','진','지','엄','채','원','천','방',
  '공','현','함','변','염','여','추','도','소','석','선','설','마','길','위',
  '표','명','기','반','라','왕','금','옥','육','인','맹','제','모','탁','국',
  '편','용','예','봉','부','단','갈','음','연','동','온','시','류','어','피',
  '범','독','경','자','뢰','초','매','진','산','순','평','부','갈','감','감',
  '동','진','채','초','두','순','애',
]);
const KOREAN_COMPOUND_SURNAMES = ['남궁','황보','사공','선우','독고','동방','서문','제갈'];

// ── Masking Rules ──────────────────────────────────────────────────────────
interface MaskRule {
  id: string;
  example: string;
  /** Applied via custom function so we can run logic per rule (not just regex.replace). */
  apply: (text: string) => { result: string; matches: number };
  /** Default-enabled in the UI (false = user must explicitly turn on). */
  defaultOn: boolean;
}

// 이메일
function applyEmail(text: string) {
  let matches = 0;
  const result = text.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, (m) => {
    matches++;
    const [local, domain] = m.split('@');
    const maskedLocal = local[0] + '***';
    const domainParts = domain.split('.');
    const maskedDomain = domainParts[0][0] + '***.' + domainParts.slice(1).join('.');
    return `${maskedLocal}@${maskedDomain}`;
  });
  return { result, matches };
}

// 한국 전화번호: 하이픈/공백/없음 + 선택적 국가코드(+82, 0082) 모두 허용
function applyPhoneKr(text: string) {
  let matches = 0;
  // 02 (서울) 또는 03X~06X 또는 010/011/016/017/018/019 + 3~4자리 + 4자리
  const re = /(?:\+82[-\s]?|0082[-\s]?)?(?:0?1[016789]|02|0\d{2})[-\s]?\d{3,4}[-\s]?\d{4}/g;
  const result = text.replace(re, (m) => {
    matches++;
    // 숫자만 추출하여 패턴 분석
    const digits = m.replace(/\D/g, '');
    // 끝 4자리 보존, 중간 마스킹
    if (digits.length >= 9) {
      const last4 = digits.slice(-4);
      const prefix = digits.slice(0, digits.length - 8);
      return `${prefix || '010'}-****-${last4}`;
    }
    return m;
  });
  return { result, matches };
}

// 주민등록번호: 내국인(1~4), 외국인(5~8), 2000년대 신생아(0)도 포함
function applySsnKr(text: string) {
  let matches = 0;
  const result = text.replace(/\b\d{6}[-\s]?[0-8]\d{6}\b/g, (m) => {
    matches++;
    const digits = m.replace(/\D/g, '');
    return digits.slice(0, 6) + '-' + digits.charAt(6) + '******';
  });
  return { result, matches };
}

// 신용카드 (16자리 + Visa 4자리 4그룹 / Amex 15자리)
function applyCard(text: string) {
  let matches = 0;
  // 16자리: 4-4-4-4
  let result = text.replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, (m) => {
    matches++;
    const digits = m.replace(/[\s\-]/g, '');
    return `****-****-****-${digits.slice(-4)}`;
  });
  // 15자리: 4-6-5 (Amex)
  result = result.replace(/\b\d{4}[\s\-]?\d{6}[\s\-]?\d{5}\b/g, (m) => {
    matches++;
    const digits = m.replace(/[\s\-]/g, '');
    return `****-******-${digits.slice(-5)}`;
  });
  return { result, matches };
}

// IPv4 / IPv6
function applyIp(text: string) {
  let matches = 0;
  // IPv4
  let result = text.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, (m) => {
    const parts = m.split('.');
    if (parts.every((p) => Number(p) >= 0 && Number(p) <= 255)) {
      matches++;
      return `${parts[0]}.${parts[1]}.***.***`;
    }
    return m;
  });
  // IPv6 — Full form (8 그룹) + Compressed form (::) 모두 처리
  // 헥사 문자와 콜론으로만 이루어진 토큰을 추출 후 유효성 검증
  result = result.replace(/[0-9a-fA-F]*(?::[0-9a-fA-F]*){2,7}/g, (m) => {
    const groups = m.split(':');
    // 그룹 수가 3~8개, 각 그룹은 0~4 hex chars, 최소 한 그룹은 hex 1자리 이상
    if (groups.length < 3 || groups.length > 9) return m;
    if (!groups.every((g) => /^[0-9a-fA-F]{0,4}$/.test(g))) return m;
    if (!groups.some((g) => g.length > 0)) return m;
    // "1:2" 같이 너무 짧은 건 시간 표기일 수 있음 — 콜론 2개 이상 요구는 이미 정규식이 처리
    matches++;
    return groups[0] + ':' + groups[1] + ':****:****';
  });
  return { result, matches };
}

// 한국 이름 — 성씨 화이트리스트 기반 토큰 단위 매칭 (2~3글자만)
function applyKoreanName(text: string) {
  let matches = 0;
  const result = text.replace(/[가-힣]+/g, (token) => {
    const len = token.length;
    // 토큰이 정확히 2~3글자인 경우만 이름 후보로 간주 (긴 단어는 일반 텍스트로 가정)
    if (len < 2 || len > 4) return token;

    // 복성 우선 검사 (3~4글자)
    for (const cs of KOREAN_COMPOUND_SURNAMES) {
      if (token.startsWith(cs) && len >= 3 && len <= 4) {
        matches++;
        return token[0] + '*' + (len >= 3 ? '*' : '') + (len >= 4 ? '*' : '');
      }
    }

    // 단성 검사 (2~3글자만 — 4글자 이상은 안 매칭)
    if (KOREAN_SURNAMES.has(token[0]) && len >= 2 && len <= 3) {
      matches++;
      // 가운데를 별표로
      if (len === 2) return token[0] + '*';
      return token[0] + '*' + token[2];
    }
    return token;
  });
  return { result, matches };
}

const RULES: MaskRule[] = [
  { id: 'email',    example: 'hong@example.com → h***@e***.com',         apply: applyEmail,        defaultOn: true  },
  { id: 'phone_kr', example: '010-1234-5678 → 010-****-5678',             apply: applyPhoneKr,      defaultOn: true  },
  { id: 'ssn_kr',   example: '901201-1234567 → 901201-1******',            apply: applySsnKr,        defaultOn: true  },
  { id: 'card',     example: '1234-5678-9012-3456 → ****-****-****-3456', apply: applyCard,         defaultOn: true  },
  { id: 'ip',       example: '192.168.1.1 → 192.168.***.***',              apply: applyIp,           defaultOn: true  },
  { id: 'name_kr',  example: '홍길동 → 홍*동',                              apply: applyKoreanName,   defaultOn: false },
];

function applyAllMasks(text: string, enabled: Set<string>): { result: string; count: number } {
  let result = text;
  let count = 0;
  for (const rule of RULES) {
    if (!enabled.has(rule.id)) continue;
    const r = rule.apply(result);
    result = r.result;
    count += r.matches;
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
const DEFAULT_INPUT = '안녕하세요. 담당자 홍길동, 박지은.\n이메일: hong@example.com / 전화: 010-1234-5678\n주민번호: 901201-1234567 / 카드: 1234-5678-9012-3456\nIPv4: 192.168.1.1 / IPv6: 2001:db8::1';

export default function PrivacyMaskingClient() {
  const t = useTranslations('Redact');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [input, setInput] = useState(DEFAULT_INPUT);
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(RULES.filter((r) => r.defaultOn).map((r) => r.id)),
  );
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const { result: masked, count } = useMemo(() => applyAllMasks(input, enabled), [input, enabled]);

  const toggleRule = (id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(masked);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '1rem', fontSize: '0.9rem', lineHeight: 1.7,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', color: 'var(--text-primary)',
    outline: 'none', resize: 'vertical', fontFamily: 'monospace',
  };

  const isNameKrEnabled = enabled.has('name_kr');

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
              {RULES.map((rule) => (
                <label key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabled.has(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    style={{ width: '1rem', height: '1rem', marginTop: '0.15rem', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }}
                    aria-label={t(`rule_${rule.id}` as 'rule_email')}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t(`rule_${rule.id}` as 'rule_email')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontFamily: 'monospace', marginTop: '0.1rem' }}>{rule.example}</span>
                  </div>
                </label>
              ))}
            </div>

            {isNameKrEnabled && (
              <div style={{
                marginTop: '0.85rem',
                padding: '0.65rem 0.85rem',
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '0.5rem',
                color: '#92400e',
                fontSize: '0.75rem',
                lineHeight: 1.5,
              }}>
                {t('rule_name_warning')}
              </div>
            )}
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
              onChange={(e) => setInput(e.target.value)}
              rows={7}
              placeholder={t('placeholder')}
              style={inp}
              aria-label={t('input_label')}
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
                  <input type="checkbox" checked={showDiff} onChange={(e) => setShowDiff(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                  {t('highlight')}
                </label>
                <button
                  onClick={handleCopy}
                  aria-label={t('copy_button')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`,
                    background: copied ? '#ecfdf5' : 'var(--surface)',
                    color: copied ? '#065f46' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? t('copy_icon_done') : t('copy_icon_button')}
                </button>
              </div>
            </div>
            {showDiff ? (
              <div style={{ ...inp, minHeight: '10rem', whiteSpace: 'pre-wrap', overflow: 'auto' }}>
                {buildHighlighted(input, masked)}
              </div>
            ) : (
              <textarea readOnly value={masked} rows={7} style={{ ...inp, background: '#f0fdf4' }} aria-label={t('output_label')} />
            )}
          </div>
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/security/privacy-masking" />

      {/* 광고 영역 */}
      <div className={s.ad_placeholder}>AD</div>

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
            { step: '마스킹 규칙 선택', desc: '왼쪽 패널에서 이메일, 전화번호, 주민번호, 카드번호, IP, 한국 이름 중 마스킹할 항목을 체크합니다. 한국 이름 규칙은 일반 단어와 충돌할 수 있어 기본으로 꺼져 있으니 필요할 때만 켜세요.' },
            { step: '텍스트 붙여넣기', desc: '오른쪽 상단 입력창에 마스킹할 텍스트를 붙여넣거나 직접 입력합니다. 여러 줄의 텍스트도 한 번에 처리할 수 있습니다.' },
            { step: '결과 확인 및 복사', desc: '하단 출력창에 마스킹 결과가 즉시 표시됩니다. 노란색으로 강조된 부분이 마스킹된 항목이며, 복사 버튼으로 클립보드에 저장합니다.' },
            { step: '마스킹 결과 검토', desc: '출력 결과를 반드시 육안으로 검토하여 의도치 않게 마스킹되거나 누락된 항목이 없는지 확인한 후 사용합니다. 필요 시 규칙 체크박스를 조정해 재처리할 수 있습니다.' },
          ],
          faqs: [
            { q: '입력한 텍스트가 서버로 전송되나요?', a: '전혀 그렇지 않습니다. 이 개인정보 마스킹 도구는 100% 클라이언트 사이드(브라우저)에서만 동작하며, 입력한 텍스트는 어떠한 서버에도 전송되지 않습니다. 완전히 오프라인 환경에서도 사용할 수 있습니다.' },
            { q: '하이픈이 없는 전화번호도 마스킹되나요?', a: '네. 010-1234-5678 같은 하이픈 형식뿐 아니라 01012345678, 010 1234 5678, +82 10 1234 5678 같은 다양한 형식을 모두 감지합니다. 국제번호 prefix(+82, 0082)도 자동으로 인식합니다.' },
            { q: '한국 이름 마스킹이 일반 단어를 잘못 마스킹합니다', a: '한국 이름 규칙은 흔한 성씨 화이트리스트와 토큰 길이 2~4글자 제한을 사용해 오탐을 최소화했지만, 짧은 한글 단어("안녕", "선생" 등)는 여전히 마스킹될 수 있습니다. 그래서 기본값은 꺼져 있고, 켤 경우 결과를 반드시 검토하세요.' },
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
            { step: 'Select masking rules', desc: 'Check the rules you want to apply in the left panel: email, phone, SSN, credit card, IP address, Korean name. The Korean name rule is off by default because it may match common words — turn it on only when needed.' },
            { step: 'Paste your text', desc: 'Paste or type the text you want to mask into the input area on the right. Multiple lines of text are processed all at once.' },
            { step: 'Review & copy result', desc: 'The masked output appears instantly. Yellow highlights show what was masked. Click the copy button to save it to your clipboard.' },
            { step: 'Verify the output', desc: 'Always review the masked result manually to confirm no items were accidentally missed or incorrectly masked. Adjust the rule checkboxes and reprocess if needed.' },
          ],
          faqs: [
            { q: 'Is my input text sent to a server?', a: 'Not at all. This tool runs 100% client-side in your browser. Your text is never transmitted to any server and can even be used completely offline — no internet connection required after the page loads.' },
            { q: 'Does it mask phone numbers without dashes?', a: 'Yes. Beyond 010-1234-5678, the tool also recognizes 01012345678, 010 1234 5678, and country-code formats like +82 10 1234 5678 or 0082-10-1234-5678. All common variants are detected automatically.' },
            { q: 'Korean name masking flagged some common words', a: 'The Korean name rule uses a surname whitelist and 2-to-4-character token limit to minimize false positives, but short Hangul words may still get masked. That is why the rule is off by default — when you enable it, always review the output.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
