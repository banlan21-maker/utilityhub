import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CATEGORIES = [
  'performance',
  'document',
  'finance',
  'productivity',
  'design',
  'marketing',
  'lifestyle',
  'security',
  'utility',
  'dev'
] as const;

/**
 * Automatically count tools in each category by scanning the file system
 * Returns a map of category -> tool count
 */
export function getToolCounts(): Record<string, number> {
  const counts: Record<string, number> = {};

  const basePath = join(process.cwd(), 'src', 'app', '[locale]');

  for (const category of CATEGORIES) {
    try {
      const categoryPath = join(basePath, 'utilities', category);
      const items = readdirSync(categoryPath);

      // Count only directories (each tool has its own directory)
      // Exclude page.tsx and other files
      const toolDirs = items.filter(item => {
        const itemPath = join(categoryPath, item);
        // 빈 폴더(작업 흔적)는 빼고 실제 페이지가 있는 도구만 센다
        return statSync(itemPath).isDirectory() && existsSync(join(itemPath, 'page.tsx'));
      });

      counts[category] = toolDirs.length;
    } catch (error) {
      // Category directory doesn't exist or is empty
      counts[category] = 0;
    }
  }

  return counts;
}

/**
 * Get total tool count across all categories
 */
export function getTotalToolCount(): number {
  const counts = getToolCounts();
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}
