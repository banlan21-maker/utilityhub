// AI 크롤러 봇 데이터 — User-agent 토큰은 각 운영사 공식 문서 기준 (2026)
// 설명은 ko/en 직접 포함하여 i18n MISSING_MESSAGE 위험 제거.

export interface AiBot {
  id: string;
  userAgent: string;   // robots.txt User-agent 토큰 (정확한 대소문자)
  company: string;
  major: boolean;      // 메이저 봇 여부 (기본 선택)
  isImageBot?: boolean; // 이미지 학습 봇 여부
  purposeKo: string;
  purposeEn: string;
}

export const AI_BOTS: AiBot[] = [
  // ── 메이저 8개 (기본 선택) ──────────────────────────────────
  { id: 'gptbot', userAgent: 'GPTBot', company: 'OpenAI', major: true,
    purposeKo: 'ChatGPT 모델 학습용 데이터 수집', purposeEn: 'Scrapes data to train ChatGPT models' },
  { id: 'chatgpt_user', userAgent: 'ChatGPT-User', company: 'OpenAI', major: true,
    purposeKo: 'ChatGPT 실시간 브라우징 시 페이지 접근', purposeEn: 'Fetches pages during ChatGPT live browsing' },
  { id: 'claudebot', userAgent: 'ClaudeBot', company: 'Anthropic', major: true,
    purposeKo: 'Claude 모델 학습용 데이터 수집', purposeEn: 'Scrapes data to train Claude models' },
  { id: 'google_extended', userAgent: 'Google-Extended', company: 'Google', major: true,
    purposeKo: 'Gemini 등 구글 AI 학습용 (일반 검색과 분리)', purposeEn: 'Google AI (Gemini) training — separate from normal Search' },
  { id: 'ccbot', userAgent: 'CCBot', company: 'Common Crawl', major: true,
    purposeKo: '다수 AI가 학습에 사용하는 공개 크롤 데이터셋', purposeEn: 'Open crawl dataset used by many AI models' },
  { id: 'perplexitybot', userAgent: 'PerplexityBot', company: 'Perplexity', major: true,
    purposeKo: 'Perplexity AI 검색 색인·답변 생성', purposeEn: 'Perplexity AI search indexing and answers' },
  { id: 'bytespider', userAgent: 'Bytespider', company: 'ByteDance', major: true,
    purposeKo: 'ByteDance(TikTok) AI 학습 데이터 수집', purposeEn: 'ByteDance (TikTok) AI training data scraping' },
  { id: 'meta_external', userAgent: 'meta-externalagent', company: 'Meta', major: true,
    purposeKo: 'Meta AI(라마) 학습용 데이터 수집', purposeEn: 'Meta AI (Llama) training data scraping' },

  // ── 추가 10개 (기본 접힘) ───────────────────────────────────
  { id: 'oai_searchbot', userAgent: 'OAI-SearchBot', company: 'OpenAI', major: false,
    purposeKo: 'OpenAI 검색 기능용 색인', purposeEn: 'Indexing for OpenAI search features' },
  { id: 'anthropic_ai', userAgent: 'anthropic-ai', company: 'Anthropic', major: false,
    purposeKo: '구 Anthropic 크롤러 (호환성용 함께 차단 권장)', purposeEn: 'Legacy Anthropic crawler (block for compatibility)' },
  { id: 'claude_web', userAgent: 'Claude-Web', company: 'Anthropic', major: false,
    purposeKo: 'Claude 웹 접근 (구 토큰)', purposeEn: 'Claude web access (legacy token)' },
  { id: 'amazonbot', userAgent: 'Amazonbot', company: 'Amazon', major: false,
    purposeKo: 'Amazon AI·Alexa 데이터 수집', purposeEn: 'Amazon AI and Alexa data scraping' },
  { id: 'applebot_extended', userAgent: 'Applebot-Extended', company: 'Apple', major: false,
    purposeKo: 'Apple Intelligence 학습용 (일반 검색과 분리)', purposeEn: 'Apple Intelligence training — separate from Search' },
  { id: 'cohere_ai', userAgent: 'cohere-ai', company: 'Cohere', major: false,
    purposeKo: 'Cohere AI 모델 학습', purposeEn: 'Cohere AI model training' },
  { id: 'diffbot', userAgent: 'Diffbot', company: 'Diffbot', major: false,
    purposeKo: '구조화 데이터 추출·AI 지식그래프', purposeEn: 'Structured data extraction and AI knowledge graph' },
  { id: 'facebookbot', userAgent: 'FacebookBot', company: 'Meta', major: false,
    purposeKo: 'Meta 언어모델 학습 데이터 수집', purposeEn: 'Meta language model training data' },
  { id: 'imagesiftbot', userAgent: 'ImagesiftBot', company: 'ImageSift', major: false, isImageBot: true,
    purposeKo: '이미지 수집·AI 이미지 학습', purposeEn: 'Image scraping for AI image training' },
  { id: 'youbot', userAgent: 'YouBot', company: 'You.com', major: false,
    purposeKo: 'You.com AI 검색 색인', purposeEn: 'You.com AI search indexing' },
  { id: 'petalbot', userAgent: 'PetalBot', company: 'Huawei', major: false,
    purposeKo: 'Huawei AI·검색 데이터 수집', purposeEn: 'Huawei AI and search data scraping' },
];

// ── 경로 정규화 (V3 §2-1: 8케이스) ─────────────────────────────
export function normalizePath(input: string): string | null {
  let s = input.trim();
  if (!s) return null;
  // 풀 URL이면 path만 추출
  if (/^https?:\/\//i.test(s)) {
    try { s = new URL(s).pathname; } catch { /* keep as-is */ }
  }
  // 연속 슬래시 압축
  s = s.replace(/\/{2,}/g, '/');
  // 앞 슬래시
  if (!s.startsWith('/')) s = '/' + s;
  // 뒤 슬래시
  if (!s.endsWith('/')) s = s + '/';
  // 다시 공백 제거 (내부)
  s = s.trim();
  return s === '/' ? null : s;
}

// 다중 경로 (쉼표 분리) 정규화 → 유효 경로 배열
export function normalizePaths(input: string): string[] {
  return input
    .split(',')
    .map((p) => normalizePath(p))
    .filter((p): p is string => p !== null);
}

export function hasWildcard(input: string): boolean {
  return /[*?[\]]/.test(input);
}
