// 빌드 전 검사: 화면 코드(useTranslations)가 쓰는 번역 묶음이 브라우저로 실제로 보내지는지 확인한다.
// 브라우저에는 공통 묶음(src/i18n/client-messages.ts) + 도구 폴더 layout.tsx 의 ScopedMessages 묶음만 간다.
// 빠진 것이 있으면 화면에 문구 대신 키 이름이 보이므로 빌드를 멈춘다.
//
//   node scripts/check-client-messages.mjs          검사
//   node scripts/check-client-messages.mjs --fix    빠진 도구 layout.tsx 를 만들거나 고친다
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const FIX = process.argv.includes('--fix');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const posix = (f) => f.split(path.sep).join('/');

const common = [...readFileSync('src/i18n/client-messages.ts', 'utf8').match(/COMMON_NAMESPACES = \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const known = new Set(Object.keys(JSON.parse(readFileSync('messages/ko.json', 'utf8'))));
const TOOLS = 'src/app/[locale]/utilities';
const problems = [];
const need = new Map(); // 도구 폴더 → 필요한 묶음

for (const file of walk('src').map(posix).filter((f) => /\.tsx?$/.test(f))) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('useTranslations')) continue;
  const tool = file.match(/^src\/app\/\[locale\]\/utilities\/([^/]+\/[^/]+)\//)?.[1];
  for (const m of src.matchAll(/useTranslations\(\s*([^)]*)\)/g)) {
    const arg = m[1].trim();
    const lit = arg.match(/^['"]([\w.-]+)['"]$/)?.[1];
    if (!lit) {
      // 묶음 이름 없이 쓰면 t('묶음.키') 꼴: 키에서 묶음을 읽는다
      const keys = [...src.matchAll(/['"]([\w-]+)\.[\w.-]+['"]/g)].map((k) => k[1]).filter((k) => known.has(k));
      if (arg !== '' || !keys.length || keys.some((k) => !common.includes(k))) problems.push(`${file}: useTranslations(${arg}) — 묶음을 알 수 없습니다. 묶음 이름을 글자 그대로 넣어 주세요.`);
      continue;
    }
    const ns = lit.split('.')[0];
    if (!known.has(ns)) { problems.push(`${file}: 번역 파일에 "${ns}" 묶음이 없습니다.`); continue; }
    if (common.includes(ns)) continue;
    if (!tool) { problems.push(`${file}: "${ns}" 는 공통 묶음이 아닙니다. src/i18n/client-messages.ts 의 COMMON_NAMESPACES 에 넣거나 ScopedMessages 로 감싸 주세요.`); continue; }
    if (!need.has(tool)) need.set(tool, new Set());
    need.get(tool).add(ns);
  }
}

const layoutSource = (list) => `// 이 도구의 화면 코드가 쓰는 번역 묶음만 브라우저로 보낸다 (scripts/check-client-messages.mjs 가 검사)
import type { ReactNode } from 'react';
import ScopedMessages from '@/app/components/ScopedMessages';

export default function Layout({ children }: { children: ReactNode }) {
  return <ScopedMessages namespaces={[${list.map((n) => `'${n}'`).join(', ')}]}>{children}</ScopedMessages>;
}
`;

let fixed = 0;
for (const [tool, set] of [...need].sort()) {
  const file = `${TOOLS}/${tool}/layout.tsx`;
  const list = [...set].sort();
  const cur = existsSync(file) ? readFileSync(file, 'utf8') : null;
  const have = cur?.match(/namespaces=\{\[([^\]]*)\]\}/)?.[1].match(/'([^']+)'/g)?.map((x) => x.slice(1, -1)) ?? [];
  const missing = list.filter((n) => !have.includes(n));
  if (!missing.length) continue;
  if (FIX && (cur === null || cur.includes('scripts/check-client-messages.mjs'))) { writeFileSync(file, layoutSource([...new Set([...have, ...list])].sort())); fixed++; continue; }
  problems.push(`${file}: 화면 코드가 ${missing.map((n) => `"${n}"`).join(', ')} 묶음을 쓰는데 layout.tsx 에 없습니다. (node scripts/check-client-messages.mjs --fix)`);
}

if (fixed) console.log(`layout.tsx ${fixed}개를 만들거나 고쳤습니다.`);
if (problems.length) {
  console.error(`번역 묶음 검사 실패 (${problems.length}건):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`번역 묶음 검사 통과: 공통 ${common.length}개 + 도구 ${need.size}개`);
