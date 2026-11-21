/**
 * Related-tools map. Tool names and icons come from src/lib/tools-registry.ts.
 *
 * toolId format: "utilities/{category}/{slug}" — matches the Next.js route path under /[locale]/
 */

import { tools as registryTools } from '@/lib/tools-registry';

export interface ToolMeta {
  id: string;
  icon: string;
  /** Korean label */
  ko: string;
  /** English label */
  en: string;
  category: string;
}

/**
 * 도구 이름·아이콘은 tools-registry.ts 한 곳에서만 관리한다 (카테고리 목록·검색·홈과 같은 이름).
 * 예전에는 여기에 이름을 따로 적어 "관련 도구" 칸만 다른 이름으로 보였다.
 */
const fromRegistry: ToolMeta[] = registryTools
  .filter(t => t.available)
  .map(t => ({
    id: t.href.slice(1),
    icon: t.emoji,
    ko: t.nameKo ?? t.slug,
    en: t.nameEn ?? t.slug,
    category: t.category,
  }));

/**
 * "관련 도구" 빈자리를 같은 카테고리 도구로 채울 때의 순서 (이름은 여기 적지 않는다).
 * 이 목록에 없는 도구는 레지스트리 순서대로 뒤에 붙으므로, 새 도구를 만들 때 여기를 고칠 필요는 없다.
 */
const FILL_ORDER: string[] = [
  'utilities/finance/percentage-calc',
  'utilities/finance/exchange-rate',
  'utilities/finance/coin-profit',
  'utilities/finance/vat-calc',
  'utilities/finance/interest-calc',
  'utilities/finance/tax-33-calc',
  'utilities/finance/alba-pay-calc',
  'utilities/finance/menu-cost-breakeven',
  'utilities/finance/salary-calc',
  'utilities/finance/smart-percent',
  'utilities/finance/freelance-rate-calculator',
  'utilities/finance/invoice-maker',
  'utilities/productivity/pomodoro',
  'utilities/productivity/world-time',
  'utilities/productivity/resume-helper',
  'utilities/productivity/excel-mapper',
  'utilities/productivity/meeting-burner',
  'utilities/productivity/solar-master',
  'utilities/productivity/bulk-renamer',
  'utilities/design/color-palette',
  'utilities/design/logo-favicon',
  'utilities/design/font-preview',
  'utilities/design/photo-batch-master',
  'utilities/design/bubble-popart',
  'utilities/design/before-after-maker',
  'utilities/marketing/hashtag-generator',
  'utilities/marketing/osmu-formatter',
  'utilities/marketing/qr-generator',
  'utilities/marketing/shorturl',
  'utilities/marketing/quiz-builder',
  'utilities/lifestyle/color-coordinator',
  'utilities/lifestyle/30day-challenge',
  'utilities/lifestyle/gym-plate-calc',
  'utilities/lifestyle/bmi-calc',
  'utilities/lifestyle/dday-calc',
  'utilities/lifestyle/age-calc',
  'utilities/lifestyle/gpa-calc',
  'utilities/lifestyle/nickname',
  'utilities/lifestyle/pet-calorie',
  'utilities/lifestyle/aquarium-calc',
  'utilities/lifestyle/mbti-test',
  'utilities/lifestyle/fortune-prompt',
  'utilities/lifestyle/teto-egen-test',
  'utilities/lifestyle/brain-boost',
  'utilities/lifestyle/apnea-trainer',
  'utilities/lifestyle/saju-compatibility',
  'utilities/lifestyle/coffee-yield-calc',
  'utilities/lifestyle/supplement-cost-calc',
  'utilities/security/privacy-masking',
  'utilities/security/password-generator',
  'utilities/security/url-safety',
  'utilities/security/burn-message',
  'utilities/security/block-ai-crawlers',
  'utilities/security/peek-proof',
  'utilities/utility/counter',
  'utilities/utility/pyeong-calc',
  'utilities/utility/unit-converter',
  'utilities/utility/image-processor',
  'utilities/utility/image-resizer',
  'utilities/utility/wordle',
  'utilities/utility/yt-thumbnail',
  'utilities/utility/lotto-generator',
  'utilities/utility/decision-master',
  'utilities/utility/piping-calc',
  'utilities/utility/wire-size-calc',
  'utilities/utility/cable-tray-calc',
  'utilities/utility/metal-weight-calc',
  'utilities/utility/concrete-calc',
  'utilities/utility/sling-angle-calc',
  'utilities/utility/interior-material-calc',
  'utilities/utility/elbow-offset',
  'utilities/utility/construction-dictionary',
  'utilities/utility/persona-build',
  'utilities/dev/json-formatter',
  'utilities/dev/regex-tester',
  'utilities/dev/password-strength',
  'utilities/dev/kec-grounding',
  'utilities/dev/resistor-calc',
  'utilities/document/hwp-pdf-converter',
  'utilities/document/img-pdf-converter',
  'utilities/document/pdf-masking',
  'utilities/performance/ttfb-check',
  'utilities/performance/sla-uptime-calc',
];

export const TOOLS: ToolMeta[] = [
  ...FILL_ORDER.map(id => fromRegistry.find(t => t.id === id)).filter((t): t is ToolMeta => !!t),
  ...fromRegistry.filter(t => !FILL_ORDER.includes(t.id)),
];

const ALL_TOOLS = TOOLS;

/** Build a lookup map: toolId → ToolMeta */
export const TOOL_MAP: Record<string, ToolMeta> = Object.fromEntries(
  ALL_TOOLS.map(t => [t.id, t])
);

/**
 * Curated relationship map.
 * Each key is a toolId; value is an ordered list of related toolIds (most relevant first).
 * Up to 6 tools are shown in the UI; shorter lists are filled from the same category.
 */
export const TOOL_RELATIONS: Record<string, string[]> = {
  // ── Finance ────────────────────────────────────────────────
  'utilities/finance/tax-33-calc': [
    'utilities/finance/alba-pay-calc',
    'utilities/finance/vat-calc',
    'utilities/finance/interest-calc',
    'utilities/finance/percentage-calc',
  ],
  'utilities/finance/percentage-calc': [
    'utilities/finance/smart-percent',
    'utilities/finance/vat-calc',
    'utilities/finance/interest-calc',
  ],
  'utilities/finance/smart-percent': [
    'utilities/finance/percentage-calc',
    'utilities/finance/vat-calc',
    'utilities/finance/coin-profit',
  ],
  'utilities/finance/vat-calc': [
    'utilities/finance/tax-33-calc',
    'utilities/finance/menu-cost-breakeven',
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
  'utilities/finance/alba-pay-calc': [
    'utilities/finance/salary-calc',
    'utilities/finance/menu-cost-breakeven',
    'utilities/finance/tax-33-calc',
    'utilities/finance/percentage-calc',
  ],
  'utilities/finance/menu-cost-breakeven': [
    'utilities/finance/alba-pay-calc',
    'utilities/finance/vat-calc',
    'utilities/finance/percentage-calc',
    'utilities/finance/invoice-maker',
  ],
  'utilities/finance/salary-calc': [
    'utilities/finance/alba-pay-calc',
    'utilities/finance/tax-33-calc',
    'utilities/finance/freelance-rate-calculator',
    'utilities/finance/percentage-calc',
  ],
  'utilities/finance/freelance-rate-calculator': [
    'utilities/finance/invoice-maker',
    'utilities/finance/salary-calc',
    'utilities/finance/tax-33-calc',
  ],
  'utilities/finance/invoice-maker': [
    'utilities/document/sign-stamp-maker',
    'utilities/finance/freelance-rate-calculator',
    'utilities/finance/tax-33-calc',
    'utilities/finance/vat-calc',
  ],

  // ── Productivity ───────────────────────────────────────────
  'utilities/productivity/solar-master': [
    'utilities/finance/invoice-maker',
    'utilities/finance/freelance-rate-calculator',
    'utilities/finance/salary-calc',
  ],
  'utilities/productivity/pomodoro': [
    'utilities/lifestyle/30day-challenge',
    'utilities/productivity/world-time',
    'utilities/lifestyle/dday-calc',
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
  'utilities/productivity/meeting-burner': [
    'utilities/productivity/pomodoro',
    'utilities/finance/salary-calc',
    'utilities/productivity/world-time',
  ],
  'utilities/productivity/bulk-renamer': [
    'utilities/productivity/excel-mapper',
    'utilities/dev/json-formatter',
    'utilities/utility/counter',
  ],

  // ── Design ─────────────────────────────────────────────────
  'utilities/design/color-palette': [
    'utilities/design/logo-favicon',
    'utilities/design/font-preview',
    'utilities/design/bubble-popart',
  ],
  'utilities/design/logo-favicon': [
    'utilities/design/color-palette',
    'utilities/marketing/qr-generator',
    'utilities/utility/image-resizer',
  ],
  'utilities/lifestyle/color-coordinator': [
    'utilities/design/color-palette',
    'utilities/design/photo-batch-master',
    'utilities/lifestyle/teto-egen-test',
    'utilities/design/bubble-popart',
  ],
  'utilities/design/font-preview': [
    'utilities/design/color-palette',
    'utilities/design/logo-favicon',
    'utilities/lifestyle/nickname',
  ],
  'utilities/design/photo-batch-master': [
    'utilities/lifestyle/color-coordinator',
    'utilities/utility/unit-converter',
    'utilities/lifestyle/30day-challenge',
    'utilities/design/before-after-maker',
  ],
  'utilities/design/bubble-popart': [
    'utilities/design/logo-favicon',
    'utilities/design/color-palette',
    'utilities/design/font-preview',
  ],
  'utilities/design/before-after-maker': [
    'utilities/utility/image-resizer',
    'utilities/design/photo-batch-master',
    'utilities/security/privacy-masking',
    'utilities/marketing/hashtag-generator',
  ],

  // ── Marketing ──────────────────────────────────────────────
  'utilities/marketing/hashtag-generator': [
    'utilities/marketing/osmu-formatter',
    'utilities/marketing/shorturl',
    'utilities/utility/counter',
    'utilities/design/before-after-maker',
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
    'utilities/marketing/hashtag-generator',
    'utilities/lifestyle/mbti-test',
    'utilities/lifestyle/fortune-prompt',
  ],

  // ── Lifestyle ──────────────────────────────────────────────
  'utilities/lifestyle/apnea-trainer': [
    'utilities/lifestyle/bmi-calc',
    'utilities/lifestyle/gym-plate-calc',
    'utilities/lifestyle/30day-challenge',
  ],
  'utilities/lifestyle/30day-challenge': [
    'utilities/productivity/pomodoro',
    'utilities/lifestyle/dday-calc',
    'utilities/lifestyle/bmi-calc',
  ],
  'utilities/lifestyle/gym-plate-calc': [
    'utilities/lifestyle/bmi-calc',
    'utilities/lifestyle/pet-calorie',
    'utilities/lifestyle/mbti-test',
  ],
  'utilities/lifestyle/bmi-calc': [
    'utilities/lifestyle/gym-plate-calc',
    'utilities/lifestyle/30day-challenge',
    'utilities/lifestyle/pet-calorie',
  ],
  'utilities/lifestyle/dday-calc': [
    'utilities/lifestyle/30day-challenge',
    'utilities/lifestyle/age-calc',
    'utilities/productivity/world-time',
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
  'utilities/lifestyle/brain-boost': [
    'utilities/lifestyle/apnea-trainer',
    'utilities/productivity/pomodoro',
    'utilities/lifestyle/30day-challenge',
  ],
  'utilities/lifestyle/saju-compatibility': [
    'utilities/lifestyle/fortune-prompt',
    'utilities/lifestyle/mbti-test',
    'utilities/lifestyle/teto-egen-test',
  ],
  'utilities/lifestyle/coffee-yield-calc': [
    'utilities/lifestyle/bmi-calc',
    'utilities/lifestyle/pet-calorie',
    'utilities/utility/unit-converter',
  ],
  'utilities/lifestyle/supplement-cost-calc': [
    'utilities/lifestyle/bmi-calc',
    'utilities/lifestyle/pet-calorie',
    'utilities/finance/percentage-calc',
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
  'utilities/security/burn-message': [
    'utilities/security/privacy-masking',
    'utilities/security/password-generator',
    'utilities/security/block-ai-crawlers',
  ],
  'utilities/security/block-ai-crawlers': [
    'utilities/security/url-safety',
    'utilities/dev/json-formatter',
    'utilities/security/peek-proof',
  ],
  'utilities/security/peek-proof': [
    'utilities/security/burn-message',
    'utilities/security/privacy-masking',
    'utilities/security/password-generator',
  ],

  // ── Utility ────────────────────────────────────────────────
  'utilities/utility/counter': [
    'utilities/productivity/resume-helper',
    'utilities/marketing/osmu-formatter',
    'utilities/marketing/hashtag-generator',
  ],
  'utilities/utility/pyeong-calc': [
    'utilities/utility/unit-converter',
    'utilities/utility/concrete-calc',
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
  'utilities/utility/lotto-generator': [
    'utilities/utility/wordle',
    'utilities/finance/exchange-rate',
    'utilities/utility/unit-converter',
  ],
  'utilities/utility/decision-master': [
    'utilities/utility/lotto-generator',
    'utilities/utility/wordle',
    'utilities/utility/counter',
  ],
  'utilities/utility/yt-thumbnail': [
    'utilities/utility/image-resizer',
    'utilities/marketing/qr-generator',
    'utilities/marketing/shorturl',
  ],
  'utilities/utility/piping-calc': [
    'utilities/utility/elbow-offset',
    'utilities/utility/wire-size-calc',
    'utilities/utility/cable-tray-calc',
    'utilities/utility/metal-weight-calc',
    'utilities/utility/unit-converter',
  ],
  'utilities/utility/wire-size-calc': [
    'utilities/utility/cable-tray-calc',
    'utilities/dev/kec-grounding',
    'utilities/utility/piping-calc',
    'utilities/dev/resistor-calc',
  ],
  'utilities/utility/cable-tray-calc': [
    'utilities/utility/wire-size-calc',
    'utilities/utility/piping-calc',
    'utilities/utility/metal-weight-calc',
    'utilities/utility/elbow-offset',
  ],
  'utilities/utility/elbow-offset': [
    'utilities/utility/piping-calc',
    'utilities/utility/metal-weight-calc',
    'utilities/utility/construction-dictionary',
  ],
  'utilities/utility/sling-angle-calc': [
    'utilities/utility/metal-weight-calc',
    'utilities/utility/unit-converter',
    'utilities/utility/concrete-calc',
    'utilities/utility/construction-dictionary',
  ],
  'utilities/utility/concrete-calc': [
    'utilities/utility/pyeong-calc',
    'utilities/utility/interior-material-calc',
    'utilities/utility/unit-converter',
    'utilities/finance/invoice-maker',
  ],
  'utilities/utility/construction-dictionary': [
    'utilities/utility/concrete-calc',
    'utilities/utility/sling-angle-calc',
    'utilities/utility/piping-calc',
    'utilities/utility/interior-material-calc',
    'utilities/utility/elbow-offset',
  ],
  'utilities/utility/persona-build': [
    'utilities/utility/decision-master',
    'utilities/utility/wordle',
    'utilities/lifestyle/brain-boost',
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
    'utilities/document/sign-stamp-maker',
    'utilities/utility/image-processor',
    'utilities/document/pdf-masking',
  ],
  'utilities/document/pdf-masking': [
    'utilities/security/privacy-masking',
    'utilities/document/hwp-pdf-converter',
    'utilities/document/img-pdf-converter',
    'utilities/document/sign-stamp-maker',
  ],
  'utilities/document/sign-stamp-maker': [
    'utilities/finance/invoice-maker',
    'utilities/document/img-pdf-converter',
    'utilities/document/pdf-masking',
    'utilities/utility/image-processor',
    'utilities/design/before-after-maker',
  ],

  // ── Performance ────────────────────────────────────────────
  'utilities/performance/ttfb-check': [
    'utilities/security/url-safety',
    'utilities/performance/sla-uptime-calc',
    'utilities/dev/json-formatter',
  ],
  'utilities/performance/sla-uptime-calc': [
    'utilities/performance/ttfb-check',
    'utilities/finance/percentage-calc',
    'utilities/dev/json-formatter',
  ],
};

/**
 * Returns up to `limit` related tools for the given toolId.
 * Pulls from TOOL_RELATIONS if available; otherwise returns random tools from the same category.
 */
export function getRelatedTools(toolId: string, limit = 6): ToolMeta[] {
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

  const sameCategory = ALL_TOOLS
    .filter(t => t.category === currentTool.category && t.id !== toolId && !related.includes(t))
    .slice(0, limit - related.length);

  return [...related, ...sameCategory].slice(0, limit);
}
