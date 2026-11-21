import { tools } from '@/lib/tools-registry';

/**
 * 카테고리별 도구 수 (홈 카테고리 카드). 레지스트리의 화면 분류(category)로 센다.
 * 폴더(주소)로 세면 분류만 옮긴 도구가 옛 카테고리에 잡힌다.
 */
export function getToolCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tools) {
    if (!t.available) continue;
    counts[t.category] = (counts[t.category] ?? 0) + 1;
  }
  return counts;
}

/** 전체 도구 수 */
export function getTotalToolCount(): number {
  return tools.filter((t) => t.available).length;
}
