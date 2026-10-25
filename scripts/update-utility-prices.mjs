// 서울 도시가스(주택용)·한전 주택용 저압 요금·전력거래소 SMP 월평균을 공식 페이지에서 읽어 src/constants/energyPrices.ts 를 고친다.
// GitHub Actions(매월 2일)에서 실행. 전기는 분기 첫 달(1·4·7·10월)이나 FORCE_ELECTRICITY=1 일 때만 확인한다.
// 페이지 구조가 바뀌어 값을 못 읽으면 파일을 고치지 않고 실패로 끝내 알림이 가게 한다.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/constants/energyPrices.ts';
const oneLine = msg => String(msg).replace(/\s+/g, ' ');
const fail = msg => { console.log(`::error::${oneLine(msg)}`); process.exit(1); };
const note = msg => console.log(`::notice::${oneLine(msg)}`);
const UA = { 'User-Agent': 'Mozilla/5.0 (utilityhub price check)' };
const toText = html => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&#40;/g, '(').replace(/&#41;/g, ')').replace(/&#47;/g, '/').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

// 줄바꿈(CRLF/LF) 차이를 변경으로 보지 않도록 LF로 맞춰 비교하고, 쓸 때 원래 방식으로 되돌린다
const raw = readFileSync(FILE, 'utf8');
const crlf = raw.includes(String.fromCharCode(13, 10));
let src = raw.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
const original = src;
const replaceBlock = (name, edit) => {
  const re = new RegExp(`export const ${name} = \\{[\\s\\S]*?\\} as const;`);
  const m = src.match(re);
  if (!m) fail(`energyPrices.ts 에서 ${name} 블록을 찾지 못했습니다.`);
  src = src.replace(re, edit(m[0]));
};

// ───── 서울 도시가스 ─────
{
  const res = await fetch('https://www.seoulgas.co.kr/mobile/payment/gasPayTable', { headers: UA });
  if (!res.ok) fail(`서울도시가스 요금표 HTTP ${res.status}`);
  const t = toText(await res.text());
  const price = t.match(/주택용 취사 ([\d.]+) ([\d.]+)/);
  const date = t.match(/(\d{4})년\s?(\d{2})월\s?(\d{2})일 단가표\(서울지역\)/);
  if (!price || !date) fail('서울도시가스 요금표에서 주택용 단가나 기준일을 찾지 못했습니다(페이지 구조 변경 가능).');
  const perMJ = Number(price[2]); // 변경후 단가
  if (!(perMJ > 10 && perMJ < 60)) fail(`도시가스 단가가 비정상입니다: ${price[2]}`);
  const asOf = `${date[1]}-${date[2]}-${date[3]}`;
  replaceBlock('CITY_GAS', b => {
    const cur = Number((b.match(/perMJ: ([\d.]+)/) || [])[1]);
    if (cur === perMJ) { note(`도시가스 변동 없음: ${perMJ}원/MJ (${asOf} 단가표)`); return b; }
    note(`도시가스 갱신: ${cur} → ${perMJ}원/MJ (${asOf})`);
    return b.replace(/asOf: '[^']*'/, `asOf: '${asOf}'`).replace(/perMJ: [\d.]+/, `perMJ: ${perMJ}`);
  });
}

// ───── 한전 주택용 저압 ─────
const month = new Date().getUTCMonth() + 1;
if ([1, 4, 7, 10].includes(month) || process.env.FORCE_ELECTRICITY === '1') {
  const res = await fetch('https://cyber.kepco.co.kr/ckepco/front/jsp/CY/E/E/CYEEHP00101.jsp', { headers: UA });
  if (!res.ok) fail(`한전 요금표 HTTP ${res.status}`);
  const t = toText(new TextDecoder('euc-kr').decode(await res.arrayBuffer()));
  const low = t.slice(t.indexOf('주택용 전력(저압) 주거용'), t.indexOf('주택용 전력(고압) 고압으로'));
  const summerPart = low.slice(low.indexOf('하계 ('), low.indexOf('기타계절 ('));
  const normalPart = low.slice(low.indexOf('기타계절 ('));
  // 같은 계절 표가 적용일자별로 여러 개 있으면 마지막(최신) 것을 쓴다
  const table = /적용일자 : (\d{4})년 (\d+)월 (\d+)일 주택용 전력\(저압\) 구간 기본요금\(원\/호\) 전력량 요금\(원\/kWh\) 1 (\d+)kWh 이하 사용 ([\d,]+) ([\d.]+) 2 \d+~(\d+)kWh ([\d,]+) ([\d.]+) 3 \d+kWh 초과 ([\d,]+) ([\d.]+)/g;
  const latest = part => { const all = [...part.matchAll(table)]; return all[all.length - 1]; };
  const s = latest(summerPart), n = latest(normalPart);
  const superRate = (low.match(/1,000kWh초과 전력량요금은 ([\d.]+)원\/kWh/) || [])[1];
  if (!s || !n || !superRate) fail('한전 요금표에서 주택용 저압 표를 읽지 못했습니다(페이지 구조 변경 가능).');
  const num = x => Number(String(x).replace(/,/g, ''));
  const tiers = m => ({
    base: `[[${m[4]}, ${num(m[5])}], [${m[7]}, ${num(m[8])}], [Infinity, ${num(m[10])}]]`,
    energy: `[[${m[4]}, ${num(m[6]).toFixed(1)}], [${m[7]}, ${num(m[9]).toFixed(1)}], [Infinity, ${num(m[11]).toFixed(1)}]]`,
  });
  const ts = tiers(s), tn = tiers(n);
  if (n[4] !== '200' || n[7] !== '400' || s[4] !== '300' || s[7] !== '450') note('누진 구간 경계가 바뀌었습니다. 화면 안내 문구도 확인하세요.');
  const eff = `${n[1]}.${n[2]}.${n[3]}`;
  replaceBlock('ELECTRICITY', b => {
    const next = b
      .replace(/normal: \{\s*base: \[\[[^\n]*\] as Tier\[\],\s*energy: \[\[[^\n]*\] as Tier\[\],/, `normal: {\n    base: ${tn.base} as Tier[],\n    energy: ${tn.energy} as Tier[],`)
      .replace(/summer: \{\s*base: \[\[[^\n]*\] as Tier\[\],\s*energy: \[\[[^\n]*\] as Tier\[\],/, `summer: {\n    base: ${ts.base} as Tier[],\n    energy: ${ts.energy} as Tier[],`)
      .replace(/superUser: \{ over: 1000, rate: [\d.]+/, `superUser: { over: 1000, rate: ${num(superRate)}`);
    if (next === b) { note(`전기 변동 없음 (한전 표 적용일자 ${eff})`); return b; }
    const ym = new Date().toISOString().slice(0, 7);
    note(`전기요금 갱신: 한전 표 적용일자 ${eff}`);
    return next.replace(/asOf: '[^']*'/, `asOf: '${ym}'`);
  });
} else {
  note(`전기요금은 분기 첫 달(1·4·7·10월)에 확인합니다. 이번 달(${month}월)은 건너뜀`);
}

// ───── SMP (전력거래소 육지 월평균) ─────
{
  const year = new Date().getUTCFullYear();
  const months = [];
  for (const y of [year - 1, year]) {
    const res = await fetch(`https://www.kpx.or.kr/smpMonthly.es?mid=a30303000000&device=mbl&smp_year=${y}`, { headers: UA });
    if (!res.ok) fail(`전력거래소 SMP 월평균 HTTP ${res.status}`);
    const t = toText(await res.text());
    const part = t.slice(t.indexOf('구분 육지 SMP'));
    // "9월 119.02 118.97 119.02" (육지·제주·통합), 아직 안 나온 달은 숫자가 없다
    for (const m of part.matchAll(/(\d{1,2})월 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)(?= |$)/g)) {
      const month = Number(m[1]), v = Number(m[2]);
      if (month >= 1 && month <= 12 && v > 0) months.push({ ym: `${y}-${String(month).padStart(2, '0')}`, v });
    }
  }
  const uniq = [...new Map(months.map(x => [x.ym, x])).values()].sort((a, b) => a.ym.localeCompare(b.ym));
  const last12 = uniq.slice(-12);
  if (last12.length < 12) fail(`SMP 월평균을 12개월치 읽지 못했습니다(${last12.length}개, 페이지 구조 변경 가능).`);
  const latest = last12[last12.length - 1];
  if (!(latest.v > 30 && latest.v < 400)) fail(`SMP 값이 비정상입니다: ${latest.v}`);
  const avg12 = Math.round((last12.reduce((s, x) => s + x.v, 0) / 12) * 10) / 10;
  replaceBlock('SMP', b => {
    if (b.includes(`asOf: '${latest.ym}'`)) { note(`SMP 변동 없음: ${latest.ym} ${latest.v}원/kWh`); return b; }
    note(`SMP 갱신: ${latest.ym} ${latest.v}원/kWh, 12개월 평균 ${avg12}원`);
    return b.replace(/asOf: '[^']*'/, `asOf: '${latest.ym}'`).replace(/latest: [\d.]+/, `latest: ${latest.v}`).replace(/avg12: [\d.]+/, `avg12: ${avg12}`);
  });
}

if (src !== original) {
  writeFileSync(FILE, crlf ? src.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10)) : src);
  note('energyPrices.ts 를 고쳤습니다.');
}
