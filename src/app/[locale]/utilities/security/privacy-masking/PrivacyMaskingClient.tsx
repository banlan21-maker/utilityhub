'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './privacy-masking.module.css';
import { ui } from '@/app/components/ui';

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
  /** English-page example (falls back to `example`). */
  exampleEn?: string;
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
  { id: 'name_kr',  example: '홍길동 → 홍*동', exampleEn: '3-syllable Hangul name → middle syllable masked', apply: applyKoreanName, defaultOn: false },
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
      <span key={i} className={changed ? s.hl : undefined}>
        {word}
      </span>
    );
  });
}

// ── Component ──────────────────────────────────────────────────────────────
const DEFAULT_INPUT = '안녕하세요. 담당자 홍길동, 박지은.\n이메일: hong@example.com / 전화: 010-1234-5678\n주민번호: 901201-1234567 / 카드: 1234-5678-9012-3456\nIPv4: 192.168.1.1 / IPv6: 2001:db8::1';
const DEFAULT_INPUT_EN = 'Hello. Contacts: John Smith, Emily Park.\nEmail: john.smith@example.com / Mobile (KR): 010-1234-5678\nNational ID (KR RRN): 901201-1234567 / Card: 1234-5678-9012-3456\nIPv4: 192.168.1.1 / IPv6: 2001:db8::1';

export default function PrivacyMaskingClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Redact');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [input, setInput] = useState(isKo ? DEFAULT_INPUT : DEFAULT_INPUT_EN);
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

  const isNameKrEnabled = enabled.has('name_kr');

  return (
    <div>
      <NavigationActions />
      <ToolHeader icon={<Shield />} title={t('title')} subtitle={t('description')}>
        {/* Privacy badge */}
        <div className={`${ui.badge} ${ui.green}`}>
          🔒 {t('privacy_badge')}
        </div>
      </ToolHeader>

      <div className={s.layout}>

        {/* ── Left: Controls ── */}
        <div className={s.col}>

          {/* Rule toggles */}
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>{t('rules_title')}</h2>
            <div className={s.rules}>
              {RULES.map((rule) => (
                <label key={rule.id} className={s.rule}>
                  <input
                    type="checkbox"
                    checked={enabled.has(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    aria-label={t(`rule_${rule.id}` as 'rule_email')}
                  />
                  <div>
                    <span className={s.ruleName}>
                      {t(`rule_${rule.id}` as 'rule_email')}
                    </span>
                    <span className={s.ruleExample}>{isKo ? rule.example : (rule.exampleEn ?? rule.example)}</span>
                  </div>
                </label>
              ))}
            </div>

            {isNameKrEnabled && (
              <div className={`${ui.notice} ${ui.amber} ${s.warn}`}>
                {t('rule_name_warning')}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className={`${ui.card} ${s.center}`}>
            <div className={`${s.count} ${count > 0 ? s.countActive : ''}`}>{count}</div>
            <div className={`${ui.hint} ${s.countLabel}`}>{t('masked_count')}</div>
          </div>
        </div>

        {/* ── Right: Text areas ── */}
        <div className={s.col}>

          {/* Input */}
          <div className={ui.card}>
            <label className={`${ui.label} ${s.blockLabel}`}>
              {t('input_label')}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={7}
              placeholder={t('placeholder')}
              className={`${ui.input} ${s.mono}`}
              aria-label={t('input_label')}
            />
          </div>

          {/* Output */}
          <div className={ui.card}>
            <div className={s.outHead}>
              <label className={ui.label}>
                {t('output_label')}
              </label>
              <div className={s.outActions}>
                <label className={s.diffToggle}>
                  <input type="checkbox" checked={showDiff} onChange={(e) => setShowDiff(e.target.checked)} />
                  {t('highlight')}
                </label>
                <button
                  onClick={handleCopy}
                  aria-label={t('copy_button')}
                  className={`${ui.button} ${ui.secondary} ${ui.sm} ${copied ? s.copied : ''}`}
                >
                  {copied ? t('copy_icon_done') : t('copy_icon_button')}
                </button>
              </div>
            </div>
            {showDiff ? (
              <div className={s.diffBox}>
                {buildHighlighted(input, masked)}
              </div>
            ) : (
              <textarea readOnly value={masked} rows={7} className={`${ui.input} ${s.mono} ${s.outGreen}`} aria-label={t('output_label')} />
            )}
          </div>
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/security/privacy-masking" />


      {seo}
    </div>
  );
}
