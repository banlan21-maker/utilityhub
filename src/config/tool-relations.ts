/**
 * Tool metadata registry and relationship map.
 *
 * toolId format: "utilities/{category}/{slug}" — matches the Next.js route path under /[locale]/
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
  // Finance
  { id: 'utilities/finance/percentage-calc', icon: '🔢', ko: '퍼센트 계산기', en: 'Percentage Calculator', category: 'finance' },
  { id: 'utilities/finance/exchange-rate', icon: '💱', ko: '실시간 환율 변환기', en: 'Exchange Rate Converter', category: 'finance' },
  { id: 'utilities/finance/coin-profit', icon: '🪙', ko: '코인 수익률 계산기', en: 'Crypto Profit Calculator', category: 'finance' },
  { id: 'utilities/finance/vat-calc', icon: '🧾', ko: '부가세(VAT) 계산기', en: 'VAT Calculator', category: 'finance' },
  { id: 'utilities/finance/interest-calc', icon: '💰', ko: '이자 계산기', en: 'Interest Calculator', category: 'finance' },
  { id: 'utilities/finance/tax-33-calc', icon: '🧾', ko: '3.3% 세금 계산기', en: 'Freelancer 3.3% Tax Calculator', category: 'finance' },
  { id: 'utilities/finance/salary-calc', icon: '💼', ko: '급여 계산기', en: 'Salary Calculator', category: 'finance' },

  // Productivity
  { id: 'utilities/productivity/pomodoro', icon: '🍅', ko: '뽀모도로 타이머', en: 'Pomodoro Timer', category: 'productivity' },
  { id: 'utilities/productivity/30day-challenge', icon: '📅', ko: '30일 챌린지 트래커', en: '30 Day Challenge Tracker', category: 'productivity' },
  { id: 'utilities/productivity/world-time', icon: '🌍', ko: '세계 시간대 변환기', en: 'World Time Converter', category: 'productivity' },
  { id: 'utilities/productivity/resume-helper', icon: '📝', ko: '자소서 작성 헬퍼', en: 'Resume Helper', category: 'productivity' },
  { id: 'utilities/productivity/excel-mapper', icon: '📊', ko: '엑셀 데이터 매퍼', en: 'Excel Data Mapper', category: 'productivity' },

  // Design
  { id: 'utilities/design/color-palette', icon: '🎯', ko: '색상 팔레트 & 가독성 검사기', en: 'Color Palette Checker', category: 'design' },
  { id: 'utilities/design/logo-favicon', icon: '🎨', ko: 'AI 로고 & 파비콘 생성기', en: 'Logo & Favicon Generator', category: 'design' },
  { id: 'utilities/design/font-preview', icon: '🔤', ko: '다국어 폰트 비교기', en: 'Multilingual Font Comparer', category: 'design' },
  { id: 'utilities/design/feedback', icon: '💬', ko: '사용자 피드백 수집기', en: 'User Feedback Collector', category: 'design' },

  // Marketing
  { id: 'utilities/marketing/hashtag-generator', icon: '#️⃣', ko: '해시태그 생성기', en: 'Hashtag Generator', category: 'marketing' },
  { id: 'utilities/marketing/osmu-formatter', icon: '✨', ko: 'OSMU 콘텐츠 재가공 포맷터', en: 'OSMU Content Formatter', category: 'marketing' },
  { id: 'utilities/marketing/qr-generator', icon: '🔳', ko: 'QR 코드 생성기', en: 'QR Code Generator', category: 'marketing' },
  { id: 'utilities/marketing/shorturl', icon: '🔗', ko: 'URL 단축기', en: 'URL Shortener', category: 'marketing' },
  { id: 'utilities/marketing/quiz-builder', icon: '🧩', ko: '심리테스트 / 퀴즈 빌더', en: 'Quiz Builder', category: 'marketing' },

  // Lifestyle
  { id: 'utilities/lifestyle/bmi-calc', icon: '💧', ko: 'BMI & 건강 계산기', en: 'BMI & Health Calculator', category: 'lifestyle' },
  { id: 'utilities/lifestyle/dday-calc', icon: '📅', ko: 'D-Day & 날짜 계산기', en: 'D-Day Calculator', category: 'lifestyle' },
  { id: 'utilities/lifestyle/age-calc', icon: '🎂', ko: '한국형 날짜 계산기', en: 'Korean Date Calculator', category: 'lifestyle' },
  { id: 'utilities/lifestyle/gpa-calc', icon: '📊', ko: '대학생 학점 변환기', en: 'GPA Converter', category: 'lifestyle' },
  { id: 'utilities/lifestyle/nickname', icon: '✨', ko: '영문 이름/닉네임 추천기', en: 'English Name Generator', category: 'lifestyle' },
  { id: 'utilities/lifestyle/pet-calorie', icon: '🐾', ko: '반려동물 칼로리 계산기', en: 'Pet Calorie Calculator', category: 'lifestyle' },
  { id: 'utilities/lifestyle/aquarium-calc', icon: '🐟', ko: '수족관 바이오로드 계산기', en: 'Aquarium Bioload Calculator', category: 'lifestyle' },
  { id: 'utilities/lifestyle/mbti-test', icon: '🌊', ko: 'MBTI 해양생물 테스트', en: 'MBTI Marine Life Test', category: 'lifestyle' },
  { id: 'utilities/lifestyle/fortune-prompt', icon: '🔮', ko: '오늘의 운세 프롬프트', en: 'Fortune Prompt', category: 'lifestyle' },
  { id: 'utilities/lifestyle/teto-egen-test', icon: '😊', ko: '태토에겐 성격 테스트', en: 'Teto Egen Personality Test', category: 'lifestyle' },

  // Security
  { id: 'utilities/security/privacy-masking', icon: '🔏', ko: '개인정보 마스킹 도구', en: 'Privacy Masking Tool', category: 'security' },
  { id: 'utilities/security/password-generator', icon: '🔑', ko: '비밀번호 생성기', en: 'Password Generator', category: 'security' },
  { id: 'utilities/security/url-safety', icon: '🛡️', ko: 'URL 피싱/악성코드 검사기', en: 'URL Safety Checker', category: 'security' },

  // Utility
  { id: 'utilities/utility/counter', icon: '📝', ko: '글자 수 & 바이트 계산기', en: 'Character Counter', category: 'utility' },
  { id: 'utilities/utility/pyeong-calc', icon: '📐', ko: '평수 ↔ ㎡ 변환기', en: 'Pyeong ↔ ㎡ Converter', category: 'utility' },
  { id: 'utilities/utility/unit-converter', icon: '🔢', ko: '단위 변환기', en: 'Unit Converter', category: 'utility' },
  { id: 'utilities/utility/image-processor', icon: '🖼️', ko: '이미지 압축기', en: 'Image Compressor', category: 'utility' },
  { id: 'utilities/utility/image-resizer', icon: '✂️', ko: '이미지 리사이저', en: 'Image Resizer', category: 'utility' },
  { id: 'utilities/utility/wordle', icon: '🎮', ko: '한글 워들 게임', en: 'Korean Wordle Game', category: 'utility' },
  { id: 'utilities/utility/yt-thumbnail', icon: '📸', ko: '유튜브 썸네일 추출기', en: 'YouTube Thumbnail Downloader', category: 'utility' },

  // Dev
  { id: 'utilities/dev/json-formatter', icon: '🗂️', ko: 'JSON 포맷터 & 뷰어', en: 'JSON Formatter & Viewer', category: 'dev' },
  { id: 'utilities/dev/regex-tester', icon: '🔍', ko: '정규표현식 테스터', en: 'Regex Tester', category: 'dev' },
  { id: 'utilities/dev/password-strength', icon: '🔐', ko: '비밀번호 강도 분석기', en: 'Password Strength Analyzer', category: 'dev' },
  { id: 'utilities/dev/kec-grounding', icon: '⚡', ko: 'KEC 접지 저항 계산기', en: 'KEC Grounding Calculator', category: 'dev' },
  { id: 'utilities/dev/resistor-calc', icon: '🔌', ko: '저항 색띠 계산기', en: 'Resistor Color Code Calculator', category: 'dev' },

  // Document
  { id: 'utilities/document/hwp-pdf-converter', icon: '📄', ko: '한글(HWP) to PDF', en: 'HWP → PDF Converter', category: 'document' },
  { id: 'utilities/document/img-pdf-converter', icon: '🖼️', ko: '이미지 to PDF', en: 'Image → PDF Converter', category: 'document' },
  { id: 'utilities/document/pdf-masking', icon: '🔒', ko: 'PDF 개인정보 마스킹', en: 'PDF Privacy Masking', category: 'document' },

  // Performance
  { id: 'utilities/performance/ttfb-check', icon: '🚀', ko: 'TTFB 속도 테스터', en: 'TTFB Speed Tester', category: 'performance' },
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
  // ── Finance ────────────────────────────────────────────────
  'utilities/finance/tax-33-calc': [
    'utilities/finance/vat-calc',
    'utilities/finance/interest-calc',
    'utilities/finance/percentage-calc',
  ],
  'utilities/finance/percentage-calc': [
    'utilities/finance/vat-calc',
    'utilities/finance/interest-calc',
    'utilities/finance/tax-33-calc',
  ],
  'utilities/finance/vat-calc': [
    'utilities/finance/tax-33-calc',
    'utilities/finance/percentage-calc',
    'utilities/finance/salary-calc',
  ],
  'utilities/finance/interest-calc': [
    'utilities/finance/coin-profit',
    'utilities/finance/percentage-calc',
    'utilities/finance/exchange-rate',
  ],
  'utilities/finance/exchange-rate': [
    'utilities/finance/coin-profit',
    'utilities/finance/interest-calc',
    'utilities/finance/percentage-calc',
  ],
  'utilities/finance/coin-profit': [
    'utilities/finance/interest-calc',
    'utilities/finance/exchange-rate',
    'utilities/finance/percentage-calc',
  ],
  'utilities/finance/salary-calc': [
    'utilities/finance/tax-33-calc',
    'utilities/finance/vat-calc',
    'utilities/finance/percentage-calc',
  ],

  // ── Productivity ───────────────────────────────────────────
  'utilities/productivity/pomodoro': [
    'utilities/productivity/30day-challenge',
    'utilities/productivity/world-time',
    'utilities/lifestyle/dday-calc',
  ],
  'utilities/productivity/30day-challenge': [
    'utilities/productivity/pomodoro',
    'utilities/lifestyle/dday-calc',
    'utilities/lifestyle/mbti-test',
  ],
  'utilities/productivity/world-time': [
    'utilities/productivity/pomodoro',
    'utilities/lifestyle/dday-calc',
    'utilities/lifestyle/age-calc',
  ],
  'utilities/productivity/resume-helper': [
    'utilities/utility/counter',
    'utilities/productivity/excel-mapper',
    'utilities/marketing/osmu-formatter',
  ],
  'utilities/productivity/excel-mapper': [
    'utilities/productivity/resume-helper',
    'utilities/utility/counter',
    'utilities/dev/json-formatter',
  ],

  // ── Design ─────────────────────────────────────────────────
  'utilities/design/color-palette': [
    'utilities/design/logo-favicon',
    'utilities/design/font-preview',
    'utilities/design/feedback',
  ],
  'utilities/design/logo-favicon': [
    'utilities/design/color-palette',
    'utilities/marketing/qr-generator',
    'utilities/utility/image-resizer',
  ],
  'utilities/design/font-preview': [
    'utilities/design/color-palette',
    'utilities/design/logo-favicon',
    'utilities/lifestyle/nickname',
  ],
  'utilities/design/feedback': [
    'utilities/design/color-palette',
    'utilities/marketing/quiz-builder',
    'utilities/utility/counter',
  ],

  // ── Marketing ──────────────────────────────────────────────
  'utilities/marketing/hashtag-generator': [
    'utilities/marketing/osmu-formatter',
    'utilities/marketing/shorturl',
    'utilities/utility/counter',
  ],
  'utilities/marketing/osmu-formatter': [
    'utilities/marketing/hashtag-generator',
    'utilities/marketing/qr-generator',
    'utilities/utility/counter',
  ],
  'utilities/marketing/qr-generator': [
    'utilities/marketing/shorturl',
    'utilities/design/logo-favicon',
    'utilities/utility/yt-thumbnail',
  ],
  'utilities/marketing/shorturl': [
    'utilities/marketing/qr-generator',
    'utilities/marketing/hashtag-generator',
    'utilities/security/url-safety',
  ],
  'utilities/marketing/quiz-builder': [
    'utilities/design/feedback',
    'utilities/lifestyle/mbti-test',
    'utilities/lifestyle/fortune-prompt',
  ],

  // ── Lifestyle ──────────────────────────────────────────────
  'utilities/lifestyle/bmi-calc': [
    'utilities/lifestyle/pet-calorie',
    'utilities/lifestyle/age-calc',
    'utilities/utility/unit-converter',
  ],
  'utilities/lifestyle/dday-calc': [
    'utilities/lifestyle/age-calc',
    'utilities/productivity/world-time',
    'utilities/productivity/pomodoro',
  ],
  'utilities/lifestyle/age-calc': [
    'utilities/lifestyle/dday-calc',
    'utilities/lifestyle/gpa-calc',
    'utilities/productivity/world-time',
  ],
  'utilities/lifestyle/gpa-calc': [
    'utilities/lifestyle/age-calc',
    'utilities/productivity/resume-helper',
    'utilities/finance/percentage-calc',
  ],
  'utilities/lifestyle/nickname': [
    'utilities/design/font-preview',
    'utilities/lifestyle/fortune-prompt',
    'utilities/security/password-generator',
  ],
  'utilities/lifestyle/pet-calorie': [
    'utilities/lifestyle/bmi-calc',
    'utilities/lifestyle/aquarium-calc',
    'utilities/utility/unit-converter',
  ],
  'utilities/lifestyle/aquarium-calc': [
    'utilities/lifestyle/pet-calorie',
    'utilities/utility/unit-converter',
    'utilities/utility/pyeong-calc',
  ],
  'utilities/lifestyle/mbti-test': [
    'utilities/lifestyle/fortune-prompt',
    'utilities/lifestyle/teto-egen-test',
    'utilities/marketing/quiz-builder',
  ],
  'utilities/lifestyle/fortune-prompt': [
    'utilities/lifestyle/mbti-test',
    'utilities/lifestyle/teto-egen-test',
    'utilities/lifestyle/nickname',
  ],
  'utilities/lifestyle/teto-egen-test': [
    'utilities/lifestyle/mbti-test',
    'utilities/lifestyle/fortune-prompt',
    'utilities/marketing/quiz-builder',
  ],

  // ── Security ───────────────────────────────────────────────
  'utilities/security/privacy-masking': [
    'utilities/security/password-generator',
    'utilities/document/pdf-masking',
    'utilities/security/url-safety',
  ],
  'utilities/security/password-generator': [
    'utilities/dev/password-strength',
    'utilities/security/privacy-masking',
    'utilities/lifestyle/nickname',
  ],
  'utilities/security/url-safety': [
    'utilities/marketing/shorturl',
    'utilities/security/privacy-masking',
    'utilities/performance/ttfb-check',
  ],

  // ── Utility ────────────────────────────────────────────────
  'utilities/utility/counter': [
    'utilities/productivity/resume-helper',
    'utilities/marketing/osmu-formatter',
    'utilities/marketing/hashtag-generator',
  ],
  'utilities/utility/pyeong-calc': [
    'utilities/utility/unit-converter',
    'utilities/lifestyle/aquarium-calc',
    'utilities/finance/percentage-calc',
  ],
  'utilities/utility/unit-converter': [
    'utilities/utility/pyeong-calc',
    'utilities/lifestyle/bmi-calc',
    'utilities/finance/exchange-rate',
  ],
  'utilities/utility/image-processor': [
    'utilities/utility/image-resizer',
    'utilities/design/logo-favicon',
    'utilities/document/img-pdf-converter',
  ],
  'utilities/utility/image-resizer': [
    'utilities/utility/image-processor',
    'utilities/design/logo-favicon',
    'utilities/utility/yt-thumbnail',
  ],
  'utilities/utility/wordle': [
    'utilities/lifestyle/nickname',
    'utilities/marketing/quiz-builder',
    'utilities/utility/counter',
  ],
  'utilities/utility/yt-thumbnail': [
    'utilities/utility/image-resizer',
    'utilities/marketing/qr-generator',
    'utilities/marketing/shorturl',
  ],

  // ── Dev ────────────────────────────────────────────────────
  'utilities/dev/json-formatter': [
    'utilities/dev/regex-tester',
    'utilities/productivity/excel-mapper',
    'utilities/utility/counter',
  ],
  'utilities/dev/regex-tester': [
    'utilities/dev/json-formatter',
    'utilities/utility/counter',
    'utilities/dev/password-strength',
  ],
  'utilities/dev/password-strength': [
    'utilities/security/password-generator',
    'utilities/dev/regex-tester',
    'utilities/security/privacy-masking',
  ],
  'utilities/dev/kec-grounding': [
    'utilities/dev/resistor-calc',
    'utilities/utility/unit-converter',
    'utilities/finance/percentage-calc',
  ],
  'utilities/dev/resistor-calc': [
    'utilities/dev/kec-grounding',
    'utilities/utility/unit-converter',
    'utilities/design/color-palette',
  ],

  // ── Document ───────────────────────────────────────────────
  'utilities/document/hwp-pdf-converter': [
    'utilities/document/img-pdf-converter',
    'utilities/document/pdf-masking',
    'utilities/productivity/resume-helper',
  ],
  'utilities/document/img-pdf-converter': [
    'utilities/document/hwp-pdf-converter',
    'utilities/utility/image-processor',
    'utilities/document/pdf-masking',
  ],
  'utilities/document/pdf-masking': [
    'utilities/security/privacy-masking',
    'utilities/document/hwp-pdf-converter',
    'utilities/document/img-pdf-converter',
  ],

  // ── Performance ────────────────────────────────────────────
  'utilities/performance/ttfb-check': [
    'utilities/security/url-safety',
    'utilities/performance/ttfb-check',
    'utilities/dev/json-formatter',
  ],
};

/**
 * Returns up to `limit` related tools for the given toolId.
 * Pulls from TOOL_RELATIONS if available; otherwise returns random tools from the same category.
 */
export function getRelatedTools(toolId: string, limit = 3): ToolMeta[] {
  const relatedIds = TOOL_RELATIONS[toolId] || [];

  // Map IDs to metadata, filtering out any that don't exist
  const related = relatedIds
    .map(id => TOOL_MAP[id])
    .filter(Boolean)
    .slice(0, limit);

  // If we have enough, return them
  if (related.length >= limit) {
    return related;
  }

  // Otherwise, fill with tools from the same category
  const currentTool = TOOL_MAP[toolId];
  if (!currentTool) return related;

  const sameCategory = TOOLS
    .filter(t => t.category === currentTool.category && t.id !== toolId)
    .slice(0, limit - related.length);

  return [...related, ...sameCategory].slice(0, limit);
}
