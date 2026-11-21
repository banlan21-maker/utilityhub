// 사이트맵 lastmod 기준 날짜 만들기: 페이지별 "마지막으로 내용을 고친 날"(한국 시간 날짜)을
// src/constants/lastmod.json 에 쓴다.
//
// 왜 파일로 두나: Vercel 은 최근 커밋 10개만 받아 빌드하므로(얕은 복제) 빌드 중 git log 를 쓰면
// 그보다 오래된 페이지가 전부 같은 날짜로 찍힌다. 그래서 전체 기록이 있는 곳에서 이 스크립트로 만든다.
// 이후 변경은 src/lib/changelog.ts 날짜가 사이트맵에서 함께 반영되므로 자주 돌릴 필요는 없다.
//
// 여러 페이지를 한꺼번에 건드린 정리 커밋(도구 15개 이상 또는 카테고리 5개 이상)은 내용 수정으로 치지 않는다.
// 페이지에 그런 커밋밖에 없으면 그중 가장 최근 것을 쓴다.
//
//   node scripts/gen-lastmod.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const OUT = 'src/constants/lastmod.json';
const STATIC = ['privacy', 'terms', 'about', 'contact', 'support'];

if (execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() === 'true') {
  console.error('얕은 복제(shallow) 저장소에서는 날짜가 틀립니다. 전체 기록이 있는 곳에서 실행하세요.');
  process.exit(1);
}

const log = execFileSync('git', ['log', '--format=@%cI', '--name-only', '--', 'src/app/[locale]'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const kst = (iso) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10);

/** 파일 경로 → 사이트 경로 (로케일 없음, 홈은 '') */
function keyOf(file) {
  const m = file.match(/^src\/app\/\[locale\]\/(.*)$/);
  if (!m) return null;
  const rest = m[1];
  if (rest === 'page.tsx') return '';
  let x = rest.match(/^utilities\/([^/]+)\/([^/]+)\//);
  if (x) return `/utilities/${x[1]}/${x[2]}`;
  x = rest.match(/^utilities\/([^/]+)\/[^/]+\.(tsx|ts|css)$/);
  if (x) return `/utilities/${x[1]}`;
  x = rest.match(/^([^/]+)\//);
  if (x && STATIC.includes(x[1])) return `/${x[1]}`;
  return null;
}

const best = {};     // 정리 커밋이 아닌 마지막 수정일
const anyDate = {};  // 정리 커밋 포함 마지막 수정일
for (const block of log.split('\n@').map((b) => b.replace(/^@/, ''))) {
  const [date, ...files] = block.split('\n').filter(Boolean);
  if (!date) continue;
  const keys = new Set(files.map(keyOf).filter((k) => k !== null));
  const tools = [...keys].filter((k) => k.split('/').length === 4).length;
  const cats = [...keys].filter((k) => k.split('/').length === 3).length;
  const mass = tools >= 15 || cats >= 5;
  const d = kst(date);
  for (const k of keys) {
    anyDate[k] ??= d; // 최신 커밋부터 읽으므로 처음 본 날짜가 마지막 수정일
    if (!mass) best[k] ??= d;
  }
}
const out = Object.fromEntries(Object.keys(anyDate).sort().map((k) => [k, best[k] ?? anyDate[k]]));
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`${Object.keys(out).length}개 경로 → ${OUT}`);
