// 오피넷 전국 평균가격 API에서 실내등유 가격을 받아 src/constants/energyPrices.ts 의 KEROSENE 값을 고친다.
// GitHub Actions(주 1회)에서 실행. 키는 환경변수 OPINET_API_KEY (저장소 Secret).
// 응답이 이상하면 파일을 고치지 않고 실패로 끝내 알림이 가게 한다.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/constants/energyPrices.ts';
// GitHub Actions 주석(annotation)으로도 남겨 로그인 없이 원인을 볼 수 있게 한다
const fail = msg => { console.log(`::error::${msg.replace(/?
/g, ' ')}`); process.exit(1); };
const note = msg => console.log(`::notice::${msg.replace(/?
/g, ' ')}`);
const key = process.env.OPINET_API_KEY;
if (!key) {
  fail('OPINET_API_KEY 가 없습니다. 저장소 Settings → Secrets and variables → Actions 에 넣어 주세요.');
}

const res = await fetch(`https://www.opinet.co.kr/api/avgAllPrice.do?out=json&code=${encodeURIComponent(key)}`);
const body = (await res.text()).split(key).join('***');
if (!res.ok) {
  fail(`오피넷 응답 오류 HTTP ${res.status}: ${body.slice(0, 300)}`);
}

let data;
try { data = JSON.parse(body); } catch {
  fail(`JSON이 아닌 응답(키가 틀렸거나 승인 전일 수 있음): ${body.slice(0, 300)}`);
}

const list = data?.RESULT?.OIL ?? data?.result?.oil ?? [];
if (!Array.isArray(list) || list.length === 0) {
  fail(`유종 목록이 비어 있습니다: ${body.slice(0, 300)}`);
}
note('받은 유종: ' + list.map(o => `${o.PRODCD}:${o.PRODNM}=${o.PRICE}`).join(', '));

// 실내등유: 제품 코드 C004 또는 이름에 '등유'
const oil = list.find(o => o.PRODCD === 'C004') ?? list.find(o => String(o.PRODNM ?? '').includes('등유'));
if (!oil) {
  fail('실내등유 항목을 찾지 못했습니다.');
}

const price = Math.round(Number(oil.PRICE));
if (!(price > 500 && price < 4000)) {
  fail(`등유 가격이 비정상입니다: ${oil.PRICE}`);
}
const d = String(oil.TRADE_DT ?? '').replace(/\D/g, '');
const asOf = d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : new Date().toISOString().slice(0, 10);

const src = readFileSync(FILE, 'utf8');
const block = /export const KEROSENE = \{[\s\S]*?\} as const;/;
const m = src.match(block);
if (!m) {
  fail('energyPrices.ts 에서 KEROSENE 블록을 찾지 못했습니다.');
}
const next = m[0]
  .replace(/asOf: '[^']*'/, `asOf: '${asOf}'`)
  .replace(/perLiter: [\d.]+/, `perLiter: ${price}`);
if (next === m[0]) {
  note(`변동 없음: ${price}원/L (${asOf})`);
} else {
  writeFileSync(FILE, src.replace(block, next));
  note(`갱신: 실내등유 ${price}원/L (${asOf})`);
}
