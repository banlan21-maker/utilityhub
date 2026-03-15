/**
 * Tool metadata registry and relationship map.
 *
 * toolId format: "{category}/{slug}" — matches the Next.js route path under /[locale]/
 */

export interface ToolMeta {
  id: string;
  icon: string;
  /** Korean label */
  ko: string;
  /** English label */
  en: string;
  category: string;
}

export const TOOLS: ToolMeta[] = [
  // fintech
  { id: 'fintech/tax33',    icon: '🧾', ko: '3.3% 세금 계산기',     en: 'Freelancer 3.3% Tax Calculator', category: 'fintech' },
  { id: 'fintech/percent',  icon: '🔢', ko: '퍼센트 계산기',        en: 'Percentage Calculator',          category: 'fintech' },
  { id: 'fintech/vat',      icon: '🧾', ko: '부가세(VAT) 계산기',   en: 'VAT Calculator',                 category: 'fintech' },
  { id: 'fintech/interest', icon: '💰', ko: '이자 계산기',           en: 'Interest Calculator',            category: 'fintech' },
  { id: 'fintech/currency', icon: '💱', ko: '실시간 환율 변환기',    en: 'Live Currency Converter',        category: 'fintech' },
  { id: 'fintech/crypto',   icon: '🪙', ko: '코인 수익률 계산기',    en: 'Crypto Profit Calculator',       category: 'fintech' },
  // pdf
  { id: 'pdf/hwp',          icon: '📄', ko: '한글(HWP) to PDF',     en: 'HWP → PDF Converter',            category: 'pdf' },
  // productivity
  { id: 'productivity/pomodoro', icon: '🍅', ko: '뽀모도로 타이머', en: 'Pomodoro Timer',                 category: 'productivity' },
  { id: 'productivity/timezone', icon: '🌍', ko: '시간대 변환기',    en: 'Timezone Converter',             category: 'productivity' },
  // ux
  { id: 'ux/logo',  icon: '🎨', ko: 'AI 로고 & 파비콘 생성기',      en: 'Logo & Favicon Generator',       category: 'ux' },
  { id: 'ux/color', icon: '🎯', ko: '색상 팔레트 & 가독성 검사기',  en: 'Color Palette Checker',          category: 'ux' },
  { id: 'ux/font',  icon: '🔤', ko: '다국어 폰트 비교기',           en: 'Multilingual Font Comparer',     category: 'ux' },
  { id: 'ux/quiz',  icon: '🧩', ko: '심리테스트 / 퀴즈 빌더',      en: 'Quiz Builder',                   category: 'ux' },
  // lifestyle
  { id: 'lifestyle/pet-food',  icon: '🐾', ko: '반려동물 사료량 계산기', en: 'Pet Food Calculator',       category: 'lifestyle' },
  { id: 'lifestyle/bmi-water', icon: '💧', ko: 'BMI & 수분 섭취량',      en: 'BMI & Water Intake',        category: 'lifestyle' },
  { id: 'lifestyle/nickname',  icon: '✨', ko: '영문 이름/닉네임 추천기', en: 'English Name Generator',    category: 'lifestyle' },
  // security
  { id: 'security/redact',   icon: '🔏', ko: '개인정보 마스킹 도구',  en: 'Personal Info Redactor',       category: 'security' },
  { id: 'security/password', icon: '🔑', ko: '비밀번호 생성기',       en: 'Password Generator',            category: 'security' },
  { id: 'security/url',      icon: '🛡️', ko: 'URL 피싱/악성코드 검사기', en: 'URL Safety Checker',        category: 'security' },
  // utilities
  { id: 'utilities/area',    icon: '📐', ko: '평수 ↔ ㎡ 변환기',    en: 'Pyeong ↔ ㎡ Converter',         category: 'utilities' },
  { id: 'utilities/qr',      icon: '📱', ko: 'QR 코드 생성기',       en: 'QR Code Generator',             category: 'utilities' },
  { id: 'utilities/counter', icon: '📝', ko: '글자 수 & 바이트 계산기', en: 'Character Counter',          category: 'utilities' },
  { id: 'utilities/dday',    icon: '📅', ko: 'D-Day & 날짜 계산기',  en: 'D-Day Calculator',              category: 'utilities' },
  // performance
  { id: 'performance/ttfb',  icon: '🚀', ko: 'TTFB 속도 테스터',    en: 'TTFB Speed Tester',             category: 'performance' },
];

/** Build a lookup map: toolId → ToolMeta */
export const TOOL_MAP: Record<string, ToolMeta> = Object.fromEntries(
  TOOLS.map(t => [t.id, t])
);

/**
 * Curated relationship map.
 * Each key is a toolId; value is an ordered list of related toolIds (most relevant first).
 * At most the first 3 entries are shown in the UI.
 */
export const TOOL_RELATIONS: Record<string, string[]> = {
  // ── Fintech ────────────────────────────────────────────────
  'fintech/tax33': [
    'fintech/vat',
    'fintech/interest',
    'fintech/percent',
  ],
  'fintech/percent': [
    'fintech/vat',
    'fintech/interest',
    'fintech/currency',
  ],
  'fintech/vat': [
    'fintech/percent',
    'fintech/interest',
    'fintech/currency',
  ],
  'fintech/interest': [
    'fintech/percent',
    'fintech/vat',
    'fintech/currency',
  ],
  'fintech/currency': [
    'fintech/percent',
    'fintech/crypto',
    'fintech/interest',
  ],
  'fintech/crypto': [
    'fintech/currency',
    'fintech/percent',
    'fintech/interest',
  ],

  // ── PDF ────────────────────────────────────────────────────
  'pdf/hwp': [
    'utilities/qr',
    'utilities/counter',
    'security/redact',
  ],

  // ── Productivity ───────────────────────────────────────────
  'productivity/pomodoro': [
    'productivity/timezone',
    'utilities/dday',
    'utilities/counter',
  ],
  'productivity/timezone': [
    'productivity/pomodoro',
    'utilities/dday',
    'fintech/currency',
  ],

  // ── UX / Design ────────────────────────────────────────────
  'ux/logo': [
    'ux/color',
    'ux/font',
    'utilities/qr',
  ],
  'ux/color': [
    'ux/logo',
    'ux/font',
    'ux/quiz',
  ],
  'ux/font': [
    'ux/color',
    'ux/logo',
    'utilities/counter',
  ],
  'ux/quiz': [
    'ux/color',
    'ux/font',
    'utilities/qr',
  ],

  // ── Lifestyle ──────────────────────────────────────────────
  'lifestyle/pet-food': [
    'lifestyle/bmi-water',
    'lifestyle/nickname',
    'fintech/percent',
  ],
  'lifestyle/bmi-water': [
    'lifestyle/pet-food',
    'lifestyle/nickname',
    'utilities/dday',
  ],
  'lifestyle/nickname': [
    'lifestyle/bmi-water',
    'lifestyle/pet-food',
    'utilities/qr',
  ],

  // ── Security ───────────────────────────────────────────────
  'security/redact': [
    'security/password',
    'security/url',
    'utilities/counter',
  ],
  'security/password': [
    'security/url',
    'security/redact',
    'utilities/qr',
  ],
  'security/url': [
    'security/password',
    'security/redact',
    'performance/ttfb',
  ],

  // ── Utilities ──────────────────────────────────────────────
  'utilities/area': [
    'fintech/currency',
    'utilities/counter',
    'utilities/dday',
  ],
  'utilities/qr': [
    'utilities/counter',
    'utilities/dday',
    'ux/logo',
  ],
  'utilities/counter': [
    'utilities/qr',
    'utilities/dday',
    'security/redact',
  ],
  'utilities/dday': [
    'utilities/counter',
    'utilities/qr',
    'productivity/pomodoro',
  ],

  // ── Performance ────────────────────────────────────────────
  'performance/ttfb': [
    'security/url',
    'utilities/qr',
    'ux/logo',
  ],
};

/**
 * Returns up to `limit` related ToolMeta items for a given toolId.
 *
 * Priority:
 * 1. Curated relations from TOOL_RELATIONS
 * 2. Fallback: other tools in the same category (random order, excluding self)
 * 3. Fallback: any tools from the registry (excluding self)
 */
export function getRelatedTools(toolId: string, limit = 3): ToolMeta[] {
  const curated = (TOOL_RELATIONS[toolId] ?? [])
    .map(id => TOOL_MAP[id])
    .filter(Boolean)
    .slice(0, limit);

  if (curated.length >= limit) return curated;

  const current = TOOL_MAP[toolId];
  const category = current?.category;

  const sameCat = TOOLS
    .filter(t => t.id !== toolId && t.category === category && !curated.some(c => c.id === t.id))
    .sort(() => Math.random() - 0.5);

  const combined = [...curated, ...sameCat].slice(0, limit);
  if (combined.length >= limit) return combined;

  const rest = TOOLS
    .filter(t => t.id !== toolId && !combined.some(c => c.id === t.id))
    .sort(() => Math.random() - 0.5);

  return [...combined, ...rest].slice(0, limit);
}
