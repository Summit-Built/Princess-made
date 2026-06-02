/**
 * Minimal pure-JS XLSX writer — no external dependencies.
 * Generates a single-sheet workbook from a 2D array of strings.
 * Uses uncompressed (STORE) ZIP so no deflate library is needed.
 */

const enc = new TextEncoder();

// ── CRC-32 ────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const b of data) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ── Minimal ZIP (STORE, no compression) ──────────────────────────────────

function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const offsets: number[] = [];
  let dataOffset = 0;

  for (const { name, data } of files) {
    const nameB = enc.encode(name);
    const crc = crc32(data);
    const sz = data.length;
    offsets.push(dataOffset);

    // Local file header (30 bytes + name)
    const lh = new DataView(new ArrayBuffer(30 + nameB.length));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0, true);
    lh.setUint16(8, 0, true);   // STORE
    lh.setUint16(10, 0, true);
    lh.setUint16(12, 0, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, sz, true);
    lh.setUint32(22, sz, true);
    lh.setUint16(26, nameB.length, true);
    lh.setUint16(28, 0, true);
    const lhArr = new Uint8Array(lh.buffer);
    lhArr.set(nameB, 30);
    localParts.push(lhArr, data);
    dataOffset += lhArr.length + sz;

    // Central directory entry (46 bytes + name)
    const cd = new DataView(new ArrayBuffer(46 + nameB.length));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(10, 0, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, sz, true);
    cd.setUint32(24, sz, true);
    cd.setUint16(28, nameB.length, true);
    cd.setUint32(42, offsets[offsets.length - 1], true);
    const cdArr = new Uint8Array(cd.buffer);
    cdArr.set(nameB, 46);
    centralParts.push(cdArr);
  }

  const cdSize = centralParts.reduce((s, p) => s + p.length, 0);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, dataOffset, true);

  const all = [...localParts, ...centralParts, new Uint8Array(eocd.buffer)];
  const total = all.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of all) { out.set(p, pos); pos += p.length; }
  return out;
}

// ── XML helpers ───────────────────────────────────────────────────────────

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Column number (0-based) → Excel column letter(s): 0→A, 25→Z, 26→AA …
function colLetter(n: number): string {
  let s = '';
  n++;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

// ── XLSX XML files ────────────────────────────────────────────────────────

function contentTypes(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
}

function rootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
}

function workbook(sheetName: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEsc(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
}

function workbookRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
}

function styles(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`;
}

function sharedStrings(strings: string[]): string {
  const items = strings.map(s => `<si><t xml:space="preserve">${xmlEsc(s)}</t></si>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">${items}</sst>`;
}

function worksheet(rows: string[][], strIndex: Map<string, number>): string {
  const rowXml = rows.map((row, ri) => {
    const cells = row.map((val, ci) => {
      const ref = `${colLetter(ci)}${ri + 1}`;
      const idx = strIndex.get(val) ?? 0;
      return `<c r="${ref}" t="s"><v>${idx}</v></c>`;
    }).join('');
    return `<row r="${ri + 1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Generate a minimal XLSX file from a 2D array of strings.
 * @param rows  First row should be the header row.
 * @param sheetName  Name of the worksheet tab.
 * @returns Uint8Array containing the .xlsx binary.
 */
export function generateXLSX(rows: string[][], sheetName = 'Sheet1'): Uint8Array {
  // Collect all unique strings for the shared strings table
  const allStrings: string[] = [];
  const strIndex = new Map<string, number>();
  for (const row of rows) {
    for (const val of row) {
      if (!strIndex.has(val)) {
        strIndex.set(val, allStrings.length);
        allStrings.push(val);
      }
    }
  }

  const files = [
    { name: '[Content_Types].xml',         data: enc.encode(contentTypes()) },
    { name: '_rels/.rels',                  data: enc.encode(rootRels()) },
    { name: 'xl/workbook.xml',              data: enc.encode(workbook(sheetName)) },
    { name: 'xl/_rels/workbook.xml.rels',   data: enc.encode(workbookRels()) },
    { name: 'xl/styles.xml',               data: enc.encode(styles()) },
    { name: 'xl/sharedStrings.xml',         data: enc.encode(sharedStrings(allStrings)) },
    { name: 'xl/worksheets/sheet1.xml',     data: enc.encode(worksheet(rows, strIndex)) },
  ];

  return zipStore(files);
}

/** Download a generated XLSX file in the browser. */
export function downloadXLSX(rows: string[][], filename: string, sheetName = 'Sheet1'): void {
  const bytes = generateXLSX(rows, sheetName);
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
