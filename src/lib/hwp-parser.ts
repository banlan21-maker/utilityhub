import JSZip from 'jszip';

/**
 * HWPX Parser Logic
 * HWPX is a ZIP container containing XML files.
 * The main content is located at Contents/section0.xml (and following sections).
 */
export async function parseHwpx(file: File): Promise<string[]> {
  const zip = await JSZip.loadAsync(file);
  const contents: string[] = [];

  // HWPX content files are usually named Contents/sectionX.xml
  const sectionFiles = Object.keys(zip.files).filter(
    name => name.startsWith('Contents/section') && name.endsWith('.xml')
  );

  if (sectionFiles.length === 0) {
    throw new Error('HWPX 파일에서 섹션 파일을 찾을 수 없습니다.');
  }

  // Sort sections numerically
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

    // Process document structure in order: paragraphs and tables separately
    processHwpxNode(xmlDoc.documentElement, contents, false);
  }

  return contents;
}

/**
 * Recursively traverse HWPX XML tree.
 * - tbl: extract as table rows (cells joined with tab)
 * - p (outside table): extract as paragraph
 * - other: recurse into children
 * insideTable flag prevents p elements inside cells being double-processed.
 */
function processHwpxNode(node: Element, output: string[], insideTable: boolean): void {
  for (const child of Array.from(node.children)) {
    const ln = child.localName;

    if (ln === 'tbl') {
      // Process table structure
      extractHwpxTable(child, output);
    } else if (ln === 'p' && !insideTable) {
      // Regular paragraph (not inside a table cell)
      const text = getHwpxParaText(child);
      if (text.trim()) output.push(text.trim());
    } else if (ln !== 'p' && ln !== 'tc') {
      // Recurse into container elements (sec, body, sub-doc, frames, etc.)
      processHwpxNode(child, output, insideTable);
    }
  }
}

/** Extract text from a single hp:p element */
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

/**
 * Extract table content: each row becomes one string with cells tab-separated.
 * Empty rows are skipped.
 */
function extractHwpxTable(tbl: Element, output: string[]): void {
  for (const child of Array.from(tbl.children)) {
    if (child.localName !== 'tr') continue;

    const rowCells: string[] = [];

    for (const tcChild of Array.from(child.children)) {
      if (tcChild.localName !== 'tc') continue;

      // Each cell may have multiple hp:p paragraphs — collect text from all of them
      const cellParagraphs: string[] = [];
      for (const tcEl of Array.from(tcChild.children)) {
        if (tcEl.localName !== 'p') continue;
        const paraText = getHwpxParaText(tcEl);
        if (paraText.trim()) cellParagraphs.push(paraText.trim());
      }

      rowCells.push(cellParagraphs.join(' '));
    }

    if (rowCells.some(c => c.length > 0)) {
      output.push(rowCells.join('\t'));
    }
  }
}

/**
 * Check if a line looks like an OLE stream/storage name (CamelCase ASCII, no spaces)
 * e.g. "HwpSummaryInformation", "JScriptVersion", "DefaultJScript"
 */
function isOleMetadata(line: string): boolean {
  return /^[A-Z][a-zA-Z0-9]{4,}$/.test(line);
}

/**
 * Check if a line is binary garbage:
 * more than 40% of characters are outside normal Korean/ASCII/punctuation ranges
 */
function isGarbageLine(line: string): boolean {
  if (line.length === 0) return true;
  let badCount = 0;
  for (const ch of line) {
    const code = ch.charCodeAt(0);
    const isKorean = (code >= 0xac00 && code <= 0xd7a3) || (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f);
    const isAscii = code >= 0x20 && code <= 0x7e;
    const isCJK = code >= 0x4e00 && code <= 0x9fff;
    const isFullWidthPunct = (code >= 0xff00 && code <= 0xffef) || (code >= 0x2000 && code <= 0x206f) || (code >= 0x3000 && code <= 0x303f);
    if (!isKorean && !isAscii && !isCJK && !isFullWidthPunct) {
      badCount++;
    }
  }
  return badCount / line.length > 0.4;
}

/**
 * Process HWP PrvText raw lines:
 * - Handle table cell format: <cell1><cell2> → "cell1  cell2"
 * - Filter OLE metadata and binary garbage
 */
function processPrvTextLines(rawText: string): string[] {
  const results: string[] = [];

  // PrvText uses \r as paragraph separator
  const lines = rawText.split(/\r|\n|\r\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // HWP table row format: <cell1><cell2>... or <><content><>
    if (trimmed.includes('<') && trimmed.includes('>') && /^[<\s]/.test(trimmed)) {
      // Extract cell contents, skip empty cells
      const cells = trimmed.match(/<([^>]*)>/g)
        ?.map(c => c.slice(1, -1).trim())
        .filter(c => c.length > 0) ?? [];

      if (cells.length > 0) {
        results.push(cells.join('  '));
      }
      continue;
    }

    // Filter OLE metadata names and garbage
    if (isOleMetadata(trimmed)) continue;
    if (isGarbageLine(trimmed)) continue;

    results.push(trimmed);
  }

  return results;
}

/**
 * Legacy HWP Parser
 * Reads OLE Compound Document Format and extracts the PrvText stream (UTF-16LE plain text preview).
 */
export async function parseLegacyHwp(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // Verify OLE signature: D0 CF 11 E0 A1 B1 1A E1
  const OLE_SIG = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  for (let i = 0; i < 8; i++) {
    if (uint8[i] !== OLE_SIG[i]) {
      throw new Error('유효한 HWP 파일이 아닙니다.');
    }
  }

  function readU16(offset: number): number {
    return uint8[offset] | (uint8[offset + 1] << 8);
  }
  function readU32(offset: number): number {
    return (uint8[offset] | (uint8[offset + 1] << 8) | (uint8[offset + 2] << 16) | (uint8[offset + 3] << 24)) >>> 0;
  }

  const sectorSize = 1 << readU16(30); // typically 512
  const firstDirSector = readU32(44);
  const miniStreamCutoff = readU32(52); // typically 4096
  const firstMiniFatSector = readU32(56);

  // Build FAT from DIFAT array in header (first 109 entries)
  const fat: number[] = [];
  for (let i = 0; i < 109; i++) {
    const sid = readU32(76 + i * 4);
    if (sid >= 0xfffffffa) break;
    const offset = 512 + sid * sectorSize;
    for (let j = 0; j < sectorSize / 4; j++) {
      fat.push(readU32(offset + j * 4));
    }
  }

  // Follow FAT chain and concatenate sectors
  function readChain(startSid: number): Uint8Array {
    const chunks: Uint8Array[] = [];
    let sid = startSid;
    const seen = new Set<number>();
    while (sid < 0xfffffffa) {
      if (seen.has(sid)) break;
      seen.add(sid);
      const off = 512 + sid * sectorSize;
      if (off + sectorSize > uint8.length) break;
      chunks.push(uint8.slice(off, off + sectorSize));
      sid = fat[sid] ?? 0xfffffffe;
    }
    const out = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
    let pos = 0;
    for (const c of chunks) { out.set(c, pos); pos += c.length; }
    return out;
  }

  // Read directory entries from directory sector chain
  const dirData = readChain(firstDirSector);

  interface DirEntry { name: string; type: number; startSid: number; size: number; }

  function readEntry(i: number): DirEntry {
    const b = i * 128;
    const nameLen = dirData[b + 64] | (dirData[b + 65] << 8);
    let name = '';
    if (nameLen >= 2) {
      for (let j = 0; j < Math.min((nameLen - 2) / 2, 31); j++) {
        const code = dirData[b + j * 2] | (dirData[b + j * 2 + 1] << 8);
        if (code === 0) break;
        name += String.fromCharCode(code);
      }
    }
    const type = dirData[b + 66];
    const startSid = (dirData[b + 116] | (dirData[b + 117] << 8) | (dirData[b + 118] << 16) | (dirData[b + 119] << 24)) >>> 0;
    const size = (dirData[b + 120] | (dirData[b + 121] << 8) | (dirData[b + 122] << 16) | (dirData[b + 123] << 24)) >>> 0;
    return { name, type, startSid, size };
  }

  const entryCount = Math.floor(dirData.length / 128);
  const entries: DirEntry[] = Array.from({ length: entryCount }, (_, i) => readEntry(i));

  // Find PrvText stream (type=2 means stream object)
  const prvEntry = entries.find(e => e.type === 2 && e.name === 'PrvText');

  if (!prvEntry || prvEntry.startSid >= 0xfffffffa) {
    return extractKoreanFallback(uint8);
  }

  // Extract PrvText data (may be in mini stream if size < miniStreamCutoff)
  let prvData: Uint8Array;

  if (prvEntry.size < miniStreamCutoff) {
    // Mini stream: data is stored in 64-byte mini sectors within root's data chain
    const rootEntry = entries[0];
    const miniStreamData = readChain(rootEntry.startSid);
    const miniSectorSize = 64;

    // Build mini FAT
    const miniFat: number[] = [];
    let mfSid = firstMiniFatSector;
    const mfSeen = new Set<number>();
    while (mfSid < 0xfffffffa) {
      if (mfSeen.has(mfSid)) break;
      mfSeen.add(mfSid);
      const off = 512 + mfSid * sectorSize;
      for (let j = 0; j < sectorSize / 4; j++) {
        miniFat.push(readU32(off + j * 4));
      }
      mfSid = fat[mfSid] ?? 0xfffffffe;
    }

    // Follow mini FAT chain
    const chunks: Uint8Array[] = [];
    let msid = prvEntry.startSid;
    const msSeen = new Set<number>();
    while (msid < 0xfffffffa) {
      if (msSeen.has(msid)) break;
      msSeen.add(msid);
      const mOff = msid * miniSectorSize;
      if (mOff + miniSectorSize > miniStreamData.length) break;
      chunks.push(miniStreamData.slice(mOff, mOff + miniSectorSize));
      msid = miniFat[msid] ?? 0xfffffffe;
    }
    prvData = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
    let pos = 0;
    for (const c of chunks) { prvData.set(c, pos); pos += c.length; }
  } else {
    prvData = readChain(prvEntry.startSid);
  }

  // Decode as UTF-16LE, limit to actual size
  const actualSize = Math.min(prvEntry.size, prvData.length);
  const decoder = new TextDecoder('utf-16le');
  const rawText = decoder.decode(prvData.slice(0, actualSize));

  const paragraphs = processPrvTextLines(rawText);

  return paragraphs.length > 0 ? paragraphs : extractKoreanFallback(uint8);
}

/**
 * Fallback: scan binary for Korean/ASCII text in UTF-16LE encoding.
 * Skips the OLE header area. Only includes lines with Korean content.
 */
function extractKoreanFallback(uint8: Uint8Array): string[] {
  // Skip the first 10% of the file (OLE header + directory entries)
  const startOffset = Math.max(512, Math.floor(uint8.length * 0.1));
  startOffset % 2 === 0 ? startOffset : startOffset + 1; // align to 2 bytes

  const results: string[] = [];
  let current = '';

  for (let i = startOffset; i + 1 < uint8.length; i += 2) {
    const code = uint8[i] | (uint8[i + 1] << 8);
    const isKorean = (code >= 0xac00 && code <= 0xd7a3) || (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f);
    const isAscii = code >= 0x20 && code <= 0x7e;
    const isNewline = code === 0x000d || code === 0x000a;

    if (isKorean || isAscii) {
      if (isNewline) {
        if (current.trim().length > 0) {
          results.push(current.trim());
          current = '';
        }
      } else {
        current += String.fromCharCode(code);
      }
    } else {
      if (current.trim().length > 3) {
        results.push(current.trim());
      }
      current = '';
    }
  }
  if (current.trim().length > 3) results.push(current.trim());

  // Only keep lines that contain Korean syllables
  const filtered = results.filter(line =>
    /[\uac00-\ud7a3]/.test(line) && !isGarbageLine(line)
  );

  return filtered.length > 0 ? filtered : ['텍스트를 추출할 수 없습니다. HWPX 형식으로 저장하면 더 정확하게 변환됩니다.'];
}
