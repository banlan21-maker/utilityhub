import JSZip from 'jszip';
import { inflateSync } from 'fflate';

export interface HwpParseResult {
  paragraphs: string[];
  /** 본문을 읽지 못해 미리보기(앞부분)만 추출한 경우 */
  partial: boolean;
  /** partial 인 이유 */
  reason?: 'encrypted' | 'distribution' | 'no-body';
}

/** 확장자로 HWP/HWPX를 구분해 본문 텍스트를 추출한다 */
export async function parseHwpFile(file: File): Promise<HwpParseResult> {
  if (file.name.toLowerCase().endsWith('.hwpx')) {
    return { paragraphs: await parseHwpx(file), partial: false };
  }
  return parseHwpBuffer(await file.arrayBuffer());
}

/* ───────────────────────── HWPX ─────────────────────────
 * HWPX는 ZIP 안에 XML이 들어 있는 형식. 본문은 Contents/section0.xml, section1.xml …
 */
export async function parseHwpx(file: File | ArrayBuffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(file);
  const contents: string[] = [];

  const sectionFiles = Object.keys(zip.files).filter(
    name => name.startsWith('Contents/section') && name.endsWith('.xml')
  );

  if (sectionFiles.length === 0) {
    throw new Error('HWPX 파일에서 섹션 파일을 찾을 수 없습니다.');
  }

  sectionFiles.sort((a, b) => {
    const matchA = a.match(/\d+/);
    const matchB = b.match(/\d+/);
    const numA = matchA ? parseInt(matchA[0]) : 0;
    const numB = matchB ? parseInt(matchB[0]) : 0;
    return numA - numB;
  });

  for (const fileName of sectionFiles) {
    const xmlText = await zip.files[fileName].async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    processHwpxNode(xmlDoc.documentElement, contents, false);
  }

  return contents;
}

/**
 * HWPX XML 트리를 순서대로 순회한다.
 * - tbl: 행 단위로 추출(칸은 탭으로 구분)
 * - p(표 밖): 문단으로 추출
 */
function processHwpxNode(node: Element, output: string[], insideTable: boolean): void {
  for (const child of Array.from(node.children)) {
    const ln = child.localName;

    if (ln === 'tbl') {
      extractHwpxTable(child, output);
    } else if (ln === 'p' && !insideTable) {
      const text = getHwpxParaText(child);
      if (text.trim()) output.push(text.trim());
    } else if (ln !== 'p' && ln !== 'tc') {
      processHwpxNode(child, output, insideTable);
    }
  }
}

function getHwpxParaText(para: Element): string {
  const all = para.getElementsByTagName('*');
  let text = '';
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === 't') {
      text += all[i].textContent || '';
    }
  }
  return text;
}

function extractHwpxTable(tbl: Element, output: string[]): void {
  for (const child of Array.from(tbl.children)) {
    if (child.localName !== 'tr') continue;

    const rowCells: string[] = [];

    for (const tcChild of Array.from(child.children)) {
      if (tcChild.localName !== 'tc') continue;

      // 칸 안의 문단은 subList 등으로 한 단계 더 감싸여 있을 수 있어 하위 p를 모두 모은다
      const cellParagraphs: string[] = [];
      const paras = Array.from(tcChild.getElementsByTagName('*')).filter(el => el.localName === 'p');
      for (const p of paras) {
        const paraText = getHwpxParaText(p);
        if (paraText.trim()) cellParagraphs.push(paraText.trim());
      }

      rowCells.push(cellParagraphs.join(' '));
    }

    if (rowCells.some(c => c.length > 0)) {
      output.push(rowCells.join('\t'));
    }
  }
}

/* ───────────────────────── HWP 5.0 (바이너리) ─────────────────────────
 * OLE 복합 문서 안의 BodyText/SectionN 스트림(대개 raw deflate 압축)에 문단 레코드가 들어 있다.
 * PrvText는 목록 미리보기용으로 앞부분만 담겨 있어, 본문을 읽을 수 없을 때만 쓴다.
 */

const FREESECT = 0xfffffffa;

interface OleEntry { name: string; type: number; left: number; right: number; child: number; start: number; size: number }

function readOle(u8: Uint8Array) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const u16 = (o: number) => dv.getUint16(o, true);
  const u32 = (o: number) => dv.getUint32(o, true);

  const SIG = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  if (u8.length < 512 || SIG.some((b, i) => u8[i] !== b)) throw new Error('invalid');

  const ss = 1 << u16(30);
  const sectorOffset = (sid: number) => 512 + sid * ss;

  // FAT 섹터 목록: 헤더의 DIFAT 109개 + 추가 DIFAT 섹터
  const fatSectors: number[] = [];
  for (let i = 0; i < 109; i++) {
    const sid = u32(76 + i * 4);
    if (sid >= FREESECT) break;
    fatSectors.push(sid);
  }
  let difat = u32(68);
  let difatCount = u32(72);
  const difatSeen = new Set<number>();
  while (difatCount-- > 0 && difat < FREESECT && !difatSeen.has(difat)) {
    difatSeen.add(difat);
    const off = sectorOffset(difat);
    for (let j = 0; j < ss / 4 - 1; j++) {
      const sid = u32(off + j * 4);
      if (sid < FREESECT) fatSectors.push(sid);
    }
    difat = u32(off + ss - 4);
  }

  const fat: number[] = [];
  for (const sid of fatSectors) {
    const off = sectorOffset(sid);
    if (off + ss > u8.length) break;
    for (let j = 0; j < ss / 4; j++) fat.push(u32(off + j * 4));
  }

  const concat = (parts: Uint8Array[]) => {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let pos = 0;
    for (const p of parts) { out.set(p, pos); pos += p.length; }
    return out;
  };

  const chain = (start: number) => {
    const parts: Uint8Array[] = [];
    const seen = new Set<number>();
    for (let sid = start; sid < FREESECT && !seen.has(sid); sid = fat[sid] ?? FREESECT) {
      seen.add(sid);
      const off = sectorOffset(sid);
      if (off + ss > u8.length) break;
      parts.push(u8.subarray(off, off + ss));
    }
    return concat(parts);
  };

  const dir = chain(u32(48));
  const ddv = new DataView(dir.buffer, dir.byteOffset, dir.byteLength);
  const entries: (OleEntry | null)[] = [];
  for (let b = 0; b + 128 <= dir.length; b += 128) {
    const nameLen = ddv.getUint16(b + 64, true);
    if (nameLen < 2) { entries.push(null); continue; }
    let name = '';
    for (let j = 0; j < (nameLen - 2) / 2; j++) name += String.fromCharCode(ddv.getUint16(b + j * 2, true));
    entries.push({
      name,
      type: dir[b + 66],
      left: ddv.getUint32(b + 68, true),
      right: ddv.getUint32(b + 72, true),
      child: ddv.getUint32(b + 76, true),
      start: ddv.getUint32(b + 116, true),
      size: ddv.getUint32(b + 120, true),
    });
  }

  const root = entries[0];
  if (!root) throw new Error('invalid');
  const cutoff = u32(56);
  const miniStream = chain(root.start);
  const miniFatBytes = chain(u32(60));
  const mdv = new DataView(miniFatBytes.buffer, miniFatBytes.byteOffset, miniFatBytes.byteLength);
  const miniFat: number[] = [];
  for (let j = 0; j + 4 <= miniFatBytes.length; j += 4) miniFat.push(mdv.getUint32(j, true));

  const miniChain = (start: number) => {
    const parts: Uint8Array[] = [];
    const seen = new Set<number>();
    for (let sid = start; sid < FREESECT && !seen.has(sid); sid = miniFat[sid] ?? FREESECT) {
      seen.add(sid);
      if ((sid + 1) * 64 > miniStream.length) break;
      parts.push(miniStream.subarray(sid * 64, (sid + 1) * 64));
    }
    return concat(parts);
  };

  // 저장소 트리를 따라 "BodyText/Section0" 같은 경로로 스트림을 찾는다
  const streams = new Map<string, OleEntry>();
  const walk = (idx: number, prefix: string, depth: number) => {
    if (idx >= FREESECT || depth > 64) return;
    const e = entries[idx];
    if (!e) return;
    walk(e.left, prefix, depth + 1);
    walk(e.right, prefix, depth + 1);
    const path = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.type === 2) streams.set(path, e);
    if (e.type === 1) walk(e.child, path, depth + 1);
  };
  walk(root.child, '', 0);

  const read = (path: string): Uint8Array | null => {
    const e = streams.get(path);
    if (!e) return null;
    const data = e.size < cutoff ? miniChain(e.start) : chain(e.start);
    return data.subarray(0, e.size);
  };

  return { streams, read };
}

/**
 * HWP 섹션 스트림은 압축 데이터 뒤에 여분 바이트가 붙는 경우가 있다.
 * 브라우저 DecompressionStream은 이를 오류로 처리해 마지막 데이터가 버려질 수 있어,
 * 여분을 무시하는 fflate로 푼다.
 */
function inflateRaw(data: Uint8Array): Uint8Array {
  return inflateSync(data);
}

const TAG_PARA_TEXT = 67;   // HWPTAG_BEGIN(16) + 51
const TAG_CTRL_HEADER = 71; // + 55
const TAG_LIST_HEADER = 72; // + 56
const CTRL_TABLE = 0x74626c20; // 'tbl '

/** 8 WCHAR 크기를 차지하는 인라인·확장 컨트롤 문자 */
const WIDE_CONTROLS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);

function decodeParaText(rec: Uint8Array): string {
  const dv = new DataView(rec.buffer, rec.byteOffset, rec.byteLength);
  let s = '';
  for (let i = 0; i + 1 < rec.length;) {
    const c = dv.getUint16(i, true);
    if (c < 32) {
      if (c === 9) s += '\t';
      else if (c === 10) s += '\n';
      else if (c === 24) s += '-';
      else if (c === 30 || c === 31) s += ' ';
      i += WIDE_CONTROLS.has(c) ? 16 : 2;
    } else {
      s += String.fromCharCode(c);
      i += 2;
    }
  }
  return s;
}

interface Cell { row: number; col: number; texts: string[] }

/** 섹션 레코드를 순서대로 읽어 문단·표 행을 output에 쌓는다 */
function extractSection(data: Uint8Array, output: string[]): void {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let table: { level: number; cells: Cell[]; cur: Cell | null } | null = null;

  const flushTable = () => {
    if (!table) return;
    const rows = new Map<number, Cell[]>();
    for (const c of table.cells) {
      if (!rows.has(c.row)) rows.set(c.row, []);
      rows.get(c.row)!.push(c);
    }
    for (const r of [...rows.keys()].sort((a, b) => a - b)) {
      const line = rows.get(r)!.sort((a, b) => a.col - b.col).map(c => c.texts.join(' ').replace(/\s+/g, ' ').trim()).join('\t');
      if (line.replace(/\t/g, '').trim()) output.push(line);
    }
    table = null;
  };

  let o = 0;
  while (o + 4 <= data.length) {
    const h = dv.getUint32(o, true);
    o += 4;
    const tag = h & 0x3ff;
    const level = (h >>> 10) & 0x3ff;
    let size = (h >>> 20) & 0xfff;
    if (size === 0xfff) {
      if (o + 4 > data.length) break;
      size = dv.getUint32(o, true);
      o += 4;
    }
    if (o + size > data.length) break;
    const rec = data.subarray(o, o + size);
    o += size;

    // 표보다 얕거나 같은 레벨의 레코드가 나오면 표가 끝난 것
    if (table && level <= table.level) flushTable();

    if (tag === TAG_CTRL_HEADER && size >= 4 && !table) {
      if (new DataView(rec.buffer, rec.byteOffset, 4).getUint32(0, true) === CTRL_TABLE) {
        table = { level, cells: [], cur: null };
      }
      continue;
    }

    // 표의 칸: 문단 리스트 헤더(문단 수 2 + 미상 2 + 속성 4) 뒤에 열·행 주소가 온다
    if (table && tag === TAG_LIST_HEADER && level === table.level + 1 && size >= 12) {
      const ldv = new DataView(rec.buffer, rec.byteOffset, rec.byteLength);
      const cell = { col: ldv.getUint16(8, true), row: ldv.getUint16(10, true), texts: [] };
      table.cells.push(cell);
      table.cur = cell;
      continue;
    }

    if (tag === TAG_PARA_TEXT) {
      const text = decodeParaText(rec);
      if (table?.cur) {
        if (text.trim()) table.cur.texts.push(text.trim());
      } else {
        for (const line of text.split('\n')) if (line.trim()) output.push(line.trim());
      }
    }
  }
  flushTable();
}

/** PrvText(미리보기)의 표 표기 "<칸1><칸2>"를 정리한다 */
function processPrvTextLines(rawText: string): string[] {
  const results: string[] = [];
  for (const line of rawText.split(/\r\n|\r|\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^</.test(trimmed) && trimmed.includes('>')) {
      const cells = trimmed.match(/<([^>]*)>/g)?.map(c => c.slice(1, -1).trim()).filter(Boolean) ?? [];
      if (cells.length) results.push(cells.join('\t'));
      continue;
    }
    results.push(trimmed);
  }
  return results;
}

export async function parseHwpBuffer(buffer: ArrayBuffer): Promise<HwpParseResult> {
  const u8 = new Uint8Array(buffer);
  const ole = readOle(u8);

  const header = ole.read('FileHeader');
  if (!header || header.length < 40) throw new Error('invalid');
  const props = new DataView(header.buffer, header.byteOffset, header.byteLength).getUint32(36, true);
  const compressed = (props & 1) !== 0;
  const encrypted = (props & 2) !== 0;
  const distribution = (props & 4) !== 0;

  const preview = () => {
    const prv = ole.read('PrvText');
    return prv ? processPrvTextLines(new TextDecoder('utf-16le').decode(prv)) : [];
  };

  if (encrypted || distribution) {
    return { paragraphs: preview(), partial: true, reason: encrypted ? 'encrypted' : 'distribution' };
  }

  const sections = [...ole.streams.keys()]
    .filter(p => /^BodyText\/Section\d+$/.test(p))
    .sort((a, b) => Number(a.slice(16)) - Number(b.slice(16)));
  if (sections.length === 0) {
    return { paragraphs: preview(), partial: true, reason: 'no-body' };
  }

  const output: string[] = [];
  for (const path of sections) {
    let data = ole.read(path)!;
    if (compressed) data = inflateRaw(data);
    extractSection(data, output);
  }

  if (output.length === 0) {
    return { paragraphs: preview(), partial: true, reason: 'no-body' };
  }
  return { paragraphs: output, partial: false };
}

/** @deprecated parseHwpFile 사용 */
export async function parseLegacyHwp(file: File): Promise<string[]> {
  return (await parseHwpBuffer(await file.arrayBuffer())).paragraphs;
}
