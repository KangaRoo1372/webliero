/*
 * formats.js — read/write Liero (.CHR) and WebLiero (.wlsprt) sprite formats
 *
 * Works in the browser (window.LieroFormats) and in Node (module.exports).
 *
 * ── LIERO.CHR format (determined empirically, extends the liero.nl description) ──
 *   0   6 B   "Liero\0"
 *   followed by 3 blocks, each:
 *         1 B   0x02            (constant – block type, meaning unknown)
 *         1 B   W               sprite width (16 / 7 / 4)
 *         1 B   H               sprite height (16 / 7 / 4)
 *         1 B   N               sprite count (110 / 130 / 30)
 *         N*W*H B  pixels, 1 B = palette index, 0 = transparent
 *   Each sprite is stored COLUMN-MAJOR (the whole column x=0 top to bottom,
 *   then x=1 etc.) – hence the "16 x 1760 picture" in the description.
 *   The 4x4 block has 30 slots, but WebLiero uses 26 – the last 4 are empty (zeros).
 *   Total: 6 + (4+28160) + (4+6370) + (4+480) = 35028 B.
 *   The file contains no palette (the palette lives in LIERO.EXE).
 *
 * ── .wlsprt format (WebLiero) ────────────────────────────────────────────────────
 *   0   6 B   "WLSPRT"
 *   6   2 B   unknown (00 00 in known files – probably a version)
 *   8   1 B   palette flag (1 = 768 B palette follows)
 *   9   768 B RGB palette, 8 bits per channel (values are multiples of 4 = 6-bit VGA × 4)
 *   ... 2 B   u16 LE  sprite count
 *   for each sprite:
 *         u16 LE  width
 *         u16 LE  height
 *         i16 LE  X offset (relative to the anchor point)
 *         i16 LE  Y offset
 *         W*H B   pixels ROW-MAJOR, 0 = transparent
 *   Sprites are cropped to content; an empty sprite = 1x1 with pixel 0.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LieroFormats = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // LIERO.CHR block layout
  const CHR_BLOCKS = [
    { size: 16, slots: 110, used: 110, first: 0 },
    { size: 7, slots: 130, used: 130, first: 110 },
    { size: 4, slots: 30, used: 26, first: 240 },
  ];
  const CHR_TOTAL_USED = 266;   // WebLiero sprite count / maximum allowed in .wlsprt
  const CHR_MAGIC = [0x4c, 0x69, 0x65, 0x72, 0x6f, 0x00]; // "Liero\0"
  const CHR_FILE_SIZE = 6 + CHR_BLOCKS.reduce((a, b) => a + 4 + b.slots * b.size * b.size, 0);

  const WL_MAGIC = 'WLSPRT';

  /*
   * Anchor points for every sprite index: position inside the CHR cell where the
   * .wlsprt (0,0) origin lands.  cell_x = offsetX + anchorX.
   * Table derived by comparing a CHR/wlsprt pair of the same mod – it matches how
   * Liero draws each object type (e.g. explosions at x-8, projectiles at x-7,
   * small sprites at x-3).
   */
  function buildAnchorTable() {
    const t = new Array(CHR_TOTAL_USED);
    const eight = new Set([0, 64, 65, 66, 67, 68, 76, 77, 78]);
    for (let i = 40; i <= 55; i++) eight.add(i);
    for (let i = 91; i <= 95; i++) eight.add(i);
    for (let i = 100; i <= 107; i++) eight.add(i);
    for (let i = 0; i < 110; i++) t[i] = eight.has(i) ? [8, 8] : [7, 7];
    t[84] = [1, 1];
    for (let i = 110; i < 240; i++) t[i] = [3, 3];
    t[153] = [1, 2];
    for (let i = 240; i < 266; i++) t[i] = [0, 0];
    return t;
  }
  const ANCHORS = buildAnchorTable();

  // Palette of the reference mod – used to preview a CHR when no .wlsprt is loaded
  const DEFAULT_PALETTE_HEX =
    '0000006c38006c5000a494800090003cac3cfc5454a8a8a85454545454fc54d85454fcfc78400880440888480c905010985414a05818ac601c4c4c4c5454545c5c5c6464646c6c6c7474747c7c7c8484848c8c8c9494949c9c9c3838885050c06868f89090f4b8b8f46c6c6c909090b4b4b4d8d8d82060202c842c3cac3c70bc70a4d4a46c6c6c909090b4b4b4d8d8d8a8a8f8d0d0f4fcfcf43c500058700074900094b0007848349c7858c4a87cecd8a09c7858c4a87cecd8a0c86400a050004848486c6c6c909090b4b4b4d8d8d8fcfcfcc4c4c4909090983c00b46400d08c00ecb400a85400d80000bc0000a40000c80000ac0000d80000bc0000a40000d80000bc0000a400005050c06868f89090f45050c06868f89090f4948800887c007c7000746400845c28a08448bcb068d8dc88f8f8bcf4f4fcfc0000f81804f83408f85010f86c14f88818f8a420f8c024f8dc28f4e83cf4f450f4f470f4f494f0f0b4f0f0d4f0f0f82c842c3cac3c70bc702c842c3cac3c70bc70f83c3cf47c7cf4bcbc6868f89090f4b8b8f49090f43cac3c70bc70a4d4a470bc709488008874007c6000704c006438005828006868889090c0bcbcf8c8c8f4dcdcf42870282c842c3498343cac3cfcc8c8f4a4a4f85c5cf44c4cf43c3cf44c4cf45c5cf4a4a45428005828005c2c006030003c1c00401c00442000482400fcfcfcdcdcdcbcbcbc9c9c9c7c7c7c9c9c9cbcbcbcdcdcdc6c4c2c7c54308c60389c6c40ac7848000000282408504c1478741ca09828c8c030f4e83c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fc0000fc2400fc4800fc6c00fc9000fcb400fcd800fcfc00a8f00054e80000e000fc0000e80414d80c2cc41444b41858a020709028887c2c9c6c34b4583ccc4844e4';
  function hexToBytes(h) {
    const out = new Uint8Array(h.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16);
    return out;
  }
  const DEFAULT_PALETTE = hexToBytes(DEFAULT_PALETTE_HEX);

  // ── Helpers: message log ─────────────────────────────────────────────────
  function makeLog() {
    const items = [];
    const add = (level, msg, idx) => items.push({ level, msg, sprite: idx === undefined ? null : idx });
    return {
      items,
      ok: (m, i) => add('ok', m, i),
      info: (m, i) => add('info', m, i),
      warn: (m, i) => add('warn', m, i),
      error: (m, i) => add('error', m, i),
      hasErrors: () => items.some((x) => x.level === 'error'),
    };
  }

  function blockForIndex(i) {
    for (const b of CHR_BLOCKS) if (i >= b.first && i < b.first + b.used) return b;
    return null;
  }

  // ── Reading .wlsprt ────────────────────────────────────────────────────────
  function parseWlsprt(buffer) {
    const bytes = new Uint8Array(buffer);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const log = makeLog();
    const res = { format: 'wlsprt', log, palette: null, sprites: [], header: {} };

    if (bytes.length < 11) { log.error(`File too short (${bytes.length} B) – not a .wlsprt file.`); return res; }
    const magic = String.fromCharCode(...bytes.slice(0, 6));
    if (magic !== WL_MAGIC) { log.error(`Invalid signature: "${magic}" (expected "${WL_MAGIC}").`); return res; }
    log.ok('Signature "WLSPRT" is valid.');

    res.header.unknown = [bytes[6], bytes[7]];
    res.header.paletteFlag = bytes[8];
    if (bytes[6] !== 0 || bytes[7] !== 0)
      log.warn(`Bytes 6–7 are ${hex(bytes[6])} ${hex(bytes[7])} (00 00 in known files) – possibly a different format version.`);

    let p = 9;
    if (bytes[8] === 1) {
      if (bytes.length < p + 768 + 2) { log.error('File truncated inside the palette.'); return res; }
      res.palette = bytes.slice(p, p + 768);
      p += 768;
      log.ok('Palette: 256 RGB colours.');
      const not6bit = [];
      for (let c = 0; c < 256; c++) {
        for (let k = 0; k < 3; k++) if (res.palette[c * 3 + k] % 4 !== 0) { not6bit.push(c); break; }
      }
      if (not6bit.length)
        log.warn(`${not6bit.length} palette colours cannot be represented exactly in Liero's 6-bit VGA palette (e.g. indices ${not6bit.slice(0, 8).join(', ')}${not6bit.length > 8 ? '…' : ''}). They will be rounded.`);
      else log.ok('Palette is 6-bit VGA compatible (all components divisible by 4).');
    } else if (bytes[8] === 0) {
      log.warn('File contains no palette (flag = 0). Preview will use the default palette.');
    } else {
      log.error(`Unknown palette flag value: ${bytes[8]}.`);
      return res;
    }

    if (p + 2 > bytes.length) { log.error('Sprite count field is missing.'); return res; }
    const count = dv.getUint16(p, true); p += 2;
    res.header.count = count;
    log.info(`Sprites in file: ${count}.`);

    for (let i = 0; i < count; i++) {
      if (p + 8 > bytes.length) { log.error(`File truncated in the header of sprite #${i}.`, i); return res; }
      const w = dv.getUint16(p, true), h = dv.getUint16(p + 2, true);
      const ox = dv.getInt16(p + 4, true), oy = dv.getInt16(p + 6, true);
      p += 8;
      if (p + w * h > bytes.length) { log.error(`File truncated in the pixels of sprite #${i} (${w}x${h}).`, i); return res; }
      const px = bytes.slice(p, p + w * h);
      p += w * h;
      res.sprites.push({ index: i, w, h, ox, oy, pixels: px });
    }
    if (p !== bytes.length) log.warn(`${bytes.length - p} B of unknown data after the last sprite.`);
    else log.ok('File structure is consistent – all data read, nothing left over.');
    return res;
  }

  // ── Reading LIERO.CHR ───────────────────────────────────────────────────────
  function parseChr(buffer) {
    const bytes = new Uint8Array(buffer);
    const log = makeLog();
    const res = { format: 'chr', log, blocks: [], sprites: [] };
    if (bytes.length < 10) { log.error('File too short – not a LIERO.CHR file.'); return res; }
    for (let i = 0; i < 5; i++) if (bytes[i] !== CHR_MAGIC[i]) {
      log.error(`Invalid signature: "${String.fromCharCode(...bytes.slice(0, 5))}" (expected "Liero").`); return res;
    }
    log.ok('Signature "Liero" is valid.');
    if (bytes.length !== CHR_FILE_SIZE) log.warn(`Size ${bytes.length} B (standard: ${CHR_FILE_SIZE} B).`);
    let p = 6, idx = 0;
    for (let b = 0; b < 3; b++) {
      if (p + 4 > bytes.length) { log.error(`Header of block ${b + 1} is missing.`); return res; }
      const [type, w, h, n] = bytes.slice(p, p + 4);
      p += 4;
      const exp = CHR_BLOCKS[b];
      res.blocks.push({ type, w, h, n });
      if (type !== 2) log.warn(`Block ${b + 1}: unusual type byte ${hex(type)} (expected 02).`);
      if (w !== exp.size || h !== exp.size || n !== exp.slots)
        log.warn(`Block ${b + 1}: ${n} sprites of ${w}x${h} (Liero standard: ${exp.slots} × ${exp.size}x${exp.size}).`);
      else log.ok(`Block ${b + 1}: ${n} sprites of ${w}x${h}.`);
      if (p + n * w * h > bytes.length) { log.error(`Block ${b + 1} is truncated.`); return res; }
      for (let k = 0; k < n; k++) {
        // column-major → row-major
        const px = new Uint8Array(w * h);
        for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) px[y * w + x] = bytes[p + x * h + y];
        p += w * h;
        res.sprites.push({ index: idx, w, h, ox: 0, oy: 0, pixels: px, block: b, slot: k, unusedSlot: k >= exp.used });
        idx++;
      }
    }
    if (p !== bytes.length) log.warn(`${bytes.length - p} B of extra data at the end of the file.`);
    else log.ok('File structure is consistent.');
    return res;
  }

  // ── Conversion .wlsprt → LIERO.CHR ─────────────────────────────────────────
  /*
   * options.autoFit – when a sprite fits the cell by size but sticks out of it with
   *                   the table anchor, shift it inside (warning) instead of
   *                   aborting the conversion.
   */
  function convertWlsprtToChr(wl, options) {
    options = options || {};
    const log = makeLog();
    const out = { log, bytes: null, placed: [] };

    if (!wl || wl.log.hasErrors()) { log.error('The .wlsprt file has structural errors – conversion impossible.'); return out; }

    const n = wl.sprites.length;
    if (n !== CHR_TOTAL_USED) {
      log.error(`Sprite count: ${n}. Liero requires exactly ${CHR_TOTAL_USED} (110 × 16x16, 130 × 7x7, 26 × 4x4). ` +
        (n > CHR_TOTAL_USED ? `Extra sprites #${CHR_TOTAL_USED}–#${n - 1} have no slot in LIERO.CHR.` : `${CHR_TOTAL_USED - n} sprites are missing.`) +
        ' Conversion impossible.');
      return out;
    }
    log.ok(`Sprite count matches: ${n}.`);

    // output buffer
    const bytes = new Uint8Array(CHR_FILE_SIZE);
    bytes.set(CHR_MAGIC, 0);
    const blockOffsets = [];
    let p = 6;
    for (const b of CHR_BLOCKS) {
      bytes.set([0x02, b.size, b.size, b.slots], p);
      p += 4;
      blockOffsets.push(p);
      p += b.slots * b.size * b.size;
    }

    let problems = 0, shifted = 0;
    const sizeErrors = { 16: 0, 7: 0, 4: 0 };
    for (const s of wl.sprites) {
      const blk = blockForIndex(s.index);
      const S = blk.size;
      const bi = CHR_BLOCKS.indexOf(blk);
      const slot = s.index - blk.first;

      // area actually used (ignore transparent margins)
      let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.pixels[y * s.w + x]) {
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      const empty = maxX < 0;
      const cw = empty ? 0 : maxX - minX + 1, ch = empty ? 0 : maxY - minY + 1;

      if (cw > S || ch > S) {
        log.error(`Sprite #${s.index}: content is ${cw}x${ch} px, but the Liero slot is only ${S}x${S} px.`, s.index);
        sizeErrors[S]++; problems++; out.placed.push(null); continue;
      }

      let [ax, ay] = ANCHORS[s.index];
      let dx = s.ox + ax, dy = s.oy + ay; // top-left corner of the sprite inside the cell
      if (!empty) {
        const x0 = dx + minX, y0 = dy + minY, x1 = dx + maxX, y1 = dy + maxY;
        if (x0 < 0 || y0 < 0 || x1 >= S || y1 >= S) {
          if (options.autoFit) {
            const ndx = dx + (x0 < 0 ? -x0 : (x1 >= S ? S - 1 - x1 : 0));
            const ndy = dy + (y0 < 0 ? -y0 : (y1 >= S ? S - 1 - y1 : 0));
            log.warn(`Sprite #${s.index}: with offset (${s.ox},${s.oy}) it stuck out of the ${S}x${S} slot – shifted by (${ndx - dx},${ndy - dy}) px. In game it may be drawn slightly off its original position.`, s.index);
            dx = ndx; dy = ndy; shifted++;
          } else {
            log.error(`Sprite #${s.index}: with offset (${s.ox},${s.oy}) it sticks out of the ${S}x${S} slot (x ${x0}…${x1}, y ${y0}…${y1}). Enable "auto-fit" to shift it inside.`, s.index);
            problems++; out.placed.push(null); continue;
          }
        }
      }

      const cell = new Uint8Array(S * S); // row-major
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
        const v = s.pixels[y * s.w + x];
        if (!v) continue;
        cell[(dy + y) * S + (dx + x)] = v;
      }
      // write column-major
      const base = blockOffsets[bi] + slot * S * S;
      for (let x = 0; x < S; x++) for (let y = 0; y < S; y++) bytes[base + x * S + y] = cell[y * S + x];
      out.placed.push({ index: s.index, w: S, h: S, ox: 0, oy: 0, pixels: cell });
    }

    if (sizeErrors[16] || sizeErrors[7] || sizeErrors[4]) {
      const parts = [];
      if (sizeErrors[16]) parts.push(`${sizeErrors[16]} in the 16x16 block (#0–#109)`);
      if (sizeErrors[7]) parts.push(`${sizeErrors[7]} in the 7x7 block (#110–#239)`);
      if (sizeErrors[4]) parts.push(`${sizeErrors[4]} in the 4x4 block (#240–#265)`);
      log.error(`Oversized sprites: ${parts.join(', ')}.`);
    }
    if (problems) {
      log.error(`Conversion impossible: ${problems} sprite(s) cannot be stored in LIERO.CHR format.`);
      return out;
    }
    if (shifted) log.warn(`Shifted ${shifted} sprite(s) to fit their slots.`);
    log.info('Slots #266–#269 (last 4 of the 4x4 block, unused by WebLiero) filled with zeros.');
    log.info('LIERO.CHR does not store a palette – if the mod uses custom colours, they must be set in LIERO.EXE (e.g. with a mod editor). The palette can be downloaded separately.');
    log.ok(`LIERO.CHR created (${bytes.length} B).`);
    out.bytes = bytes;
    return out;
  }

  // 8-bit palette → 6-bit VGA (768 B, values 0–63)
  function paletteTo6bit(pal) {
    const out = new Uint8Array(768);
    for (let i = 0; i < 768; i++) out[i] = Math.min(63, Math.round(pal[i] / 4));
    return out;
  }

  // ── Writing .wlsprt (e.g. after editing the sprite list) ───────────────────
  function writeWlsprt(wl) {
    const sprites = wl.sprites;
    const hasPal = !!wl.palette;
    let size = 9 + (hasPal ? 768 : 0) + 2;
    for (const s of sprites) size += 8 + s.w * s.h;
    const bytes = new Uint8Array(size);
    const dv = new DataView(bytes.buffer);
    for (let i = 0; i < 6; i++) bytes[i] = WL_MAGIC.charCodeAt(i);
    const unk = (wl.header && wl.header.unknown) || [0, 0];
    bytes[6] = unk[0]; bytes[7] = unk[1];
    bytes[8] = hasPal ? 1 : 0;
    let p = 9;
    if (hasPal) { bytes.set(wl.palette.slice(0, 768), p); p += 768; }
    dv.setUint16(p, sprites.length, true); p += 2;
    for (const s of sprites) {
      dv.setUint16(p, s.w, true); dv.setUint16(p + 2, s.h, true);
      dv.setInt16(p + 4, s.ox, true); dv.setInt16(p + 6, s.oy, true);
      p += 8;
      bytes.set(s.pixels, p); p += s.w * s.h;
    }
    return bytes;
  }

  // LPL (LieroKit): 768 B raw RGB, 8 bits per channel, no header
  function paletteToLpl(pal) { return new Uint8Array(pal.slice(0, 768)); }

  // JSON: flat array of 768 numbers [r,g,b, r,g,b, ...], no whitespace
  function paletteToJson(pal) { return JSON.stringify(Array.from(pal.slice(0, 768))); }

  // PNG: 256x1, 8-bit indexed (colour type 3), pixel i = palette index i,
  // PLTE = palette, tRNS = index 0 fully transparent, IDAT = uncompressed (stored) zlib.
  function paletteToPng(pal) {
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
    const crc32 = (bytes) => {
      let c = 0xffffffff;
      for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
      return (c ^ 0xffffffff) >>> 0;
    };
    const u32 = (v) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
    const chunk = (type, data) => {
      const td = new Uint8Array(4 + data.length);
      for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
      td.set(data, 4);
      return [...u32(data.length), ...td, ...u32(crc32(td))];
    };
    // raw image data: filter byte 0 + 256 indices
    const raw = new Uint8Array(257);
    for (let i = 0; i < 256; i++) raw[i + 1] = i;
    let a = 1, b = 0;
    for (const v of raw) { a = (a + v) % 65521; b = (b + a) % 65521; }
    const len = raw.length;
    const zlib = [0x78, 0x01, 0x01, len & 255, len >> 8, ~len & 255, (~len >> 8) & 255, ...raw, ...u32(((b << 16) | a) >>> 0)];
    const trns = new Uint8Array(256).fill(255); trns[0] = 0;
    const ihdr = [...u32(256), ...u32(1), 8, 3, 0, 0, 0];
    return new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...chunk('IHDR', ihdr),
      ...chunk('PLTE', Array.from(pal.slice(0, 768))),
      ...chunk('tRNS', Array.from(trns)),
      ...chunk('IDAT', zlib),
      ...chunk('IEND', []),
    ]);
  }

  // Compare the result with a reference CHR
  function compareChr(a, b) {
    const diff = [];
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const x = a[i].pixels, y = b[i].pixels;
      let same = x.length === y.length;
      for (let k = 0; same && k < x.length; k++) if (x[k] !== y[k]) same = false;
      if (!same) diff.push(i);
    }
    return { compared: n, diff };
  }

  function hex(v) { return v.toString(16).padStart(2, '0').toUpperCase(); }

  return {
    CHR_BLOCKS, CHR_TOTAL_USED, CHR_FILE_SIZE, ANCHORS, DEFAULT_PALETTE,
    paletteToLpl, paletteToJson, paletteToPng, writeWlsprt,
    parseWlsprt, parseChr, convertWlsprtToChr, paletteTo6bit, compareChr, blockForIndex,
  };
});
