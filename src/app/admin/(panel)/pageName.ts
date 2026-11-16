import { tools } from '@/lib/tools-registry';

const byHref = new Map(tools.map((t) => [t.href, t.nameKo]));
const STATIC: Record<string, string> = { '': '홈', '/about': '소개', '/contact': '문의', '/feedback': '피드백 게시판', '/privacy': '개인정보처리방침', '/terms': '이용약관' };

/** '/en/utilities/utility/pyeong-calc' → '평수 계산기 (EN)' */
export function pageName(path: string): string {
  const url = path.replace(/^https?:\/\/[^/]+/, '');
  const m = url.match(/^\/(ko|en)(\/.*)?$/);
  if (!m) return url;
  const rest = (m[2] ?? '').replace(/\/$/, '');
  const tag = m[1] === 'en' ? ' (EN)' : '';
  if (byHref.has(rest)) return `${byHref.get(rest)}${tag}`;
  if (rest in STATIC) return `${STATIC[rest]}${tag}`;
  const cat = rest.match(/^\/utilities\/([^/]+)$/);
  if (cat) return `카테고리: ${cat[1]}${tag}`;
  return url;
}

/** 지금 시각(ms)과 한국 날짜 'YYYY-MM-DD' — 서버에서 요청마다 계산 */
export const nowMs = () => Date.now();
export const kstToday = () => new Date(nowMs() + 9 * 3600_000).toISOString().slice(0, 10);
