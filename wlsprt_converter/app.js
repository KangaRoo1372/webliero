/* app.js — UI of the .wlsprt → LIERO.CHR converter */
(function () {
  'use strict';
  const F = window.LieroFormats;
  const $ = (id) => document.getElementById(id);

  const state = {
    wl: null, wlName: '',
    chr: null, chrName: '',
    out: null, compare: null,
    view: 'wl', logs: [],
    // editing
    base: null,          // original sprite list as loaded
    undo: [], redo: [],  // snapshots of sprite lists
    sel: new Set(),      // selected sprite uids
    selAnchor: null,     // uid used as the start of Shift+click ranges
    edits: 0,
    nextUid: 1,
    drag: null,          // uids being dragged
  };

  // ── Log: UI + console ───────────────────────────────────────────────────────
  function pushLog(source, items) {
    for (const it of items) {
      state.logs.push({ ...it, source });
      const line = `[${source}] ${it.msg}`;
      if (it.level === 'error') console.error(line);
      else if (it.level === 'warn') console.warn(line);
      else console.log(line);
    }
    renderLog();
  }
  function clearLog(source) { state.logs = state.logs.filter((l) => l.source !== source); }

  function renderLog() {
    const show = {};
    document.querySelectorAll('.log-filter input').forEach((c) => (show[c.dataset.lvl] = c.checked));
    const box = $('log');
    box.innerHTML = '';
    const order = { error: 0, warn: 1, info: 2, ok: 3 };
    const rows = state.logs.filter((l) => show[l.level]);
    // errors and warnings first, original order within a level
    rows.sort((a, b) => order[a.level] - order[b.level]);
    if (!rows.length) { box.innerHTML = '<div style="color:var(--muted)">No messages.</div>'; return; }
    const frag = document.createDocumentFragment();
    for (const l of rows.slice(0, 600)) {
      const d = document.createElement('div');
      d.className = 'log-entry ' + l.level + (l.sprite !== null ? ' clickable' : '');
      d.innerHTML = `<span class="src">${l.source}</span>`;
      d.appendChild(document.createTextNode(l.msg));
      if (l.sprite !== null) d.onclick = () => focusSprite(l.source === 'conversion' ? 'wl' : l.source === 'CHR' ? 'chr' : 'wl', l.sprite);
      frag.appendChild(d);
    }
    if (rows.length > 600) {
      const d = document.createElement('div'); d.className = 'log-entry info';
      d.textContent = `… and ${rows.length - 600} more messages (full list in the browser console).`;
      frag.appendChild(d);
    }
    box.appendChild(frag);
  }
  document.querySelectorAll('.log-filter input').forEach((c) => (c.onchange = renderLog));

  // ── Loading files ───────────────────────────────────────────────────────
  function setupDrop(dropId, inputId, handler) {
    const drop = $(dropId), input = $(inputId);
    input.onchange = () => input.files[0] && readFile(input.files[0], handler);
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault(); drop.classList.remove('over');
      const f = e.dataTransfer.files[0]; if (f) readFile(f, handler);
    });
  }
  function readFile(file, handler) {
    const r = new FileReader();
    r.onload = () => handler(file.name, r.result);
    r.onerror = () => alert('Could not read file: ' + file.name);
    r.readAsArrayBuffer(file);
  }
  // Detect type by content – in case a file is dropped into the wrong box
  function sniff(buf) {
    const b = new Uint8Array(buf, 0, Math.min(6, buf.byteLength));
    const s = String.fromCharCode(...b);
    if (s === 'WLSPRT') return 'wl';
    if (s.slice(0, 5) === 'Liero') return 'chr';
    return null;
  }

  function onFile(slot) {
    return (name, buf) => {
      const kind = sniff(buf) || slot;
      if (kind !== slot) pushLog('UI', [{ level: 'info', msg: `File ${name} was detected as ${kind === 'wl' ? '.wlsprt' : 'LIERO.CHR'} – loaded into the correct slot.`, sprite: null }]);
      if (kind === 'wl') loadWl(name, buf); else loadChr(name, buf);
    };
  }
  setupDrop('dropWl', 'fileWl', onFile('wl'));
  setupDrop('dropChr', 'fileChr', onFile('chr'));

  function loadWl(name, buf) {
    state.wl = F.parseWlsprt(buf); state.wlName = name;
    state.out = null; state.outParsed = null; state.compare = null;
    for (const s of state.wl.sprites) { s.uid = state.nextUid++; s.origIndex = s.index; }
    state.base = state.wl.sprites.slice();
    state.undo = []; state.redo = []; state.sel.clear(); state.selAnchor = null; state.edits = 0;
    clearLog('WLSPRT'); clearLog('limits'); clearLog('edit'); clearLog('conversion'); clearLog('comparison');
    $('nameWl').textContent = `${name} (${buf.byteLength} B)`;
    pushLog('WLSPRT', state.wl.log.items);
    precheck();
    $('btnConvert').disabled = state.wl.log.hasErrors();
    setStatus('', '');
    $('downloads').innerHTML = '';
    if (state.wl.palette) addPaletteDownloads();
    switchView('wl');
    renderInfo();
    updateEditBar();
  }
  function loadChr(name, buf) {
    state.chr = F.parseChr(buf); state.chrName = name;
    clearLog('CHR'); clearLog('comparison');
    $('nameChr').textContent = `${name} (${buf.byteLength} B)`;
    pushLog('CHR', state.chr.log.items);
    doCompare();
    if (!state.wl) switchView('chr'); else render();
    renderInfo();
  }

  // Pre-check of Liero limits right after loading .wlsprt (before conversion)
  function precheck() {
    const wl = state.wl; if (!wl || wl.log.hasErrors()) return;
    const items = [];
    const n = wl.sprites.length;
    const blocks = F.CHR_BLOCKS.map((b) => ({ ...b, have: 0, tooBig: [] }));
    for (const s of wl.sprites) {
      const b = blocks.find((x) => s.index >= x.first && s.index < x.first + x.used);
      if (!b) continue;
      b.have++;
      const c = contentBox(s);
      if (c.w > b.size || c.h > b.size) b.tooBig.push(s.index);
    }
    const lim = 'Liero limit: 266 sprites = 110 × 16x16 + 130 × 7x7 + 26 × 4x4.';
    if (n === F.CHR_TOTAL_USED) items.push({ level: 'ok', msg: `Sprite count (${n}) matches the Liero limit. ${lim}`, sprite: null });
    else items.push({ level: 'error', msg: `Sprite count: ${n} ≠ 266. ${lim} ` +
      (n > F.CHR_TOTAL_USED ? `Delete ${n - F.CHR_TOTAL_USED} sprite(s) to convert.` : `Insert ${F.CHR_TOTAL_USED - n} sprite(s) (e.g. empty ones) to convert.`) +
      ' Conversion impossible.', sprite: null });
    for (const b of blocks) {
      const range = `#${b.first}–#${b.first + b.used - 1}`;
      if (b.have < b.used)
        items.push({ level: 'error', msg: `Block ${b.size}x${b.size} (${range}): only ${b.have} of ${b.used} slots filled.`, sprite: null });
      if (b.tooBig.length)
        items.push({ level: 'error', msg: `Block ${b.size}x${b.size} (${range}): ${b.tooBig.length} sprite(s) larger than ${b.size}x${b.size} px: ${b.tooBig.slice(0, 12).map((i) => '#' + i).join(', ')}${b.tooBig.length > 12 ? '…' : ''}.`, sprite: b.tooBig[0] });
      else if (b.have === b.used)
        items.push({ level: 'ok', msg: `Block ${b.size}x${b.size} (${range}): all ${b.used} sprites fit by size.`, sprite: null });
    }
    const bad = blocks.reduce((a, b) => a + b.tooBig.length, 0);
    wl.tooBig = new Set(blocks.flatMap((b) => b.tooBig));
    if (n !== F.CHR_TOTAL_USED || bad) items.push({ level: 'error', msg: 'The sprite list CANNOT be converted to LIERO.CHR yet – fix the problems above (you can delete, insert and reorder sprites in the WLSPRT tab).', sprite: null });
    pushLog('limits', items);
  }

  // ── Editing the sprite list ──────────────────────────────────────────────
  function setSprites(list, desc, record = true) {
    if (record) { state.undo.push(state.wl.sprites); state.redo = []; state.edits++; }
    state.wl.sprites = list.map((s, i) => ({ ...s, index: i }));
    const alive = new Set(state.wl.sprites.map((s) => s.uid));
    for (const u of [...state.sel]) if (!alive.has(u)) state.sel.delete(u);
    afterEdit(desc);
  }

  function afterEdit(desc) {
    clearLog('limits'); clearLog('conversion'); clearLog('comparison');
    state.out = null; state.outParsed = null; state.compare = null;
    $('downloads').innerHTML = '';
    if (state.wl.palette) addPaletteDownloads();
    setStatus('info', 'The sprite list has changed – click "Convert to CHR" again to build the file.');
    if (desc) pushLog('edit', [{ level: 'info', msg: desc, sprite: null }]);
    precheck();
    render(); renderInfo(); updateEditBar();
  }

  const selectedIndices = () => state.wl.sprites.filter((s) => state.sel.has(s.uid)).map((s) => s.index);
  const listIdx = (ids) => ids.map((i) => '#' + i).slice(0, 10).join(', ') + (ids.length > 10 ? '…' : '');

  function deleteSelected() {
    if (!state.wl || !state.sel.size) return;
    const idx = selectedIndices();
    const list = state.wl.sprites.filter((s) => !state.sel.has(s.uid));
    state.sel.clear();
    setSprites(list, `Deleted ${idx.length} sprite(s): ${listIdx(idx)}. Sprites after them moved up.`);
  }

  // Move the given uids so that they start at position `target` (index in the current list, before removal)
  function moveTo(uids, target) {
    const set = new Set(uids);
    const moving = state.wl.sprites.filter((s) => set.has(s.uid));
    if (!moving.length) return;
    const before = moving.filter((s) => s.index < target).length;
    const rest = state.wl.sprites.filter((s) => !set.has(s.uid));
    const at = Math.max(0, Math.min(rest.length, target - before));
    const list = [...rest.slice(0, at), ...moving, ...rest.slice(at)];
    if (list.every((s, i) => s === state.wl.sprites[i])) return; // nothing changed
    const from = moving.map((s) => s.index);
    setSprites(list, moving.length === 1 ? `Moved sprite #${from[0]} to #${at}.` : `Moved ${moving.length} sprites (${listIdx(from)}) to #${at}–#${at + moving.length - 1}.`);
    const el = document.querySelector(`.tile[data-uid="${moving[0].uid}"]`);
    if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1300); }
  }

  function insertEmpty() {
    if (!state.wl) return;
    const idx = selectedIndices();
    const at = idx.length ? Math.min(...idx) : state.wl.sprites.length;
    const empty = { w: 1, h: 1, ox: 0, oy: 0, pixels: new Uint8Array(1), uid: state.nextUid++, origIndex: null };
    const list = state.wl.sprites.slice();
    list.splice(at, 0, empty);
    state.sel = new Set([empty.uid]); state.selAnchor = empty.uid;
    setSprites(list, `Inserted an empty sprite at #${at}. Sprites after it moved down.`);
  }

  function undo() {
    if (!state.wl || !state.undo.length) return;
    state.redo.push(state.wl.sprites);
    state.edits--;
    setSprites(state.undo.pop(), 'Undo.', false);
  }
  function redo() {
    if (!state.wl || !state.redo.length) return;
    state.undo.push(state.wl.sprites);
    state.edits++;
    setSprites(state.redo.pop(), 'Redo.', false);
  }
  function resetEdits() {
    if (!state.wl) return;
    if (!isModified()) return;
    if (!confirm('Discard all changes and restore the sprite list from the file?')) return;
    state.sel.clear();
    setSprites(state.base, 'All changes discarded – original sprite list restored.');
  }

  function clickTile(e, uid) {
    const list = state.wl.sprites;
    if (e.shiftKey && state.selAnchor !== null) {
      const a = list.findIndex((s) => s.uid === state.selAnchor), b = list.findIndex((s) => s.uid === uid);
      if (a >= 0 && b >= 0) {
        if (!(e.ctrlKey || e.metaKey)) state.sel.clear();
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) state.sel.add(list[i].uid);
      }
    } else if (e.ctrlKey || e.metaKey) {
      state.sel.has(uid) ? state.sel.delete(uid) : state.sel.add(uid);
      state.selAnchor = uid;
    } else {
      const only = state.sel.size === 1 && state.sel.has(uid);
      state.sel.clear();
      if (!only) state.sel.add(uid);
      state.selAnchor = uid;
    }
    refreshSelection();
  }

  function refreshSelection() {
    document.querySelectorAll('.tile[data-uid]').forEach((t) => t.classList.toggle('sel', state.sel.has(+t.dataset.uid)));
    updateEditBar();
  }

  function isModified() {
    const a = state.wl.sprites, b = state.base;
    return a.length !== b.length || a.some((s, i) => s.uid !== b[i].uid);
  }

  function updateEditBar() {
    const bar = $('editBar');
    const on = !!(state.wl && !state.wl.log.hasErrors() && state.view === 'wl');
    bar.style.display = on ? '' : 'none';
    if (!on) return;
    const n = state.sel.size;
    $('selInfo').textContent = n ? `${n} selected` : 'Nothing selected';
    $('btnDelete').disabled = !n;
    $('btnMove').disabled = !n;
    $('btnUndo').disabled = !state.undo.length;
    $('btnRedo').disabled = !state.redo.length;
    const mod = isModified();
    $('btnReset').disabled = !mod;
    $('moveTo').max = Math.max(0, state.wl.sprites.length - 1);
    $('editCount').textContent = `${state.wl.sprites.length} sprites · ${mod ? 'modified' : 'as in the file'}`;
  }

  $('btnDelete').onclick = deleteSelected;
  $('btnInsert').onclick = insertEmpty;
  $('btnUndo').onclick = undo;
  $('btnRedo').onclick = redo;
  $('btnReset').onclick = resetEdits;
  $('btnSelNone').onclick = () => { state.sel.clear(); refreshSelection(); };
  $('btnMove').onclick = () => {
    const v = parseInt($('moveTo').value, 10);
    if (isNaN(v) || v < 0) { $('moveTo').focus(); return; }
    // target = final position of the first selected sprite
    const uids = state.wl.sprites.filter((s) => state.sel.has(s.uid)).map((s) => s.uid);
    const restLen = state.wl.sprites.length - uids.length;
    const at = Math.min(v, restLen);
    // convert "final position" into a position in the current list
    const rest = state.wl.sprites.filter((s) => !state.sel.has(s.uid));
    const target = at < rest.length ? rest[at].index : state.wl.sprites.length;
    moveTo(uids, target);
  };
  $('btnSaveWl').onclick = () => {
    const name = (state.wlName || 'sprites').replace(/\.[^.]*$/, '') + '_edited.wlsprt';
    download(F.writeWlsprt(state.wl), name);
    console.log(`[UI] Edited sprite list saved as ${name}`);
  };

  document.addEventListener('keydown', (e) => {
    if (!state.wl || state.view !== 'wl') return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    const k = e.key.toLowerCase();
    if (e.key === 'Delete' || e.key === 'Backspace') { if (state.sel.size) { e.preventDefault(); deleteSelected(); } }
    else if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    else if ((e.ctrlKey || e.metaKey) && k === 'a') { e.preventDefault(); state.wl.sprites.forEach((s) => state.sel.add(s.uid)); refreshSelection(); }
    else if (e.key === 'Escape') { state.sel.clear(); refreshSelection(); }
  });

  // Drag & drop of tiles (WLSPRT view only)
  function clearDropMarks() { document.querySelectorAll('.drop-before,.drop-after').forEach((t) => t.classList.remove('drop-before', 'drop-after')); }
  function setupTileDrag(d, s) {
    d.draggable = true;
    d.addEventListener('dragstart', (e) => {
      if (!state.sel.has(s.uid)) { state.sel.clear(); state.sel.add(s.uid); state.selAnchor = s.uid; refreshSelection(); }
      state.drag = state.wl.sprites.filter((x) => state.sel.has(x.uid)).map((x) => x.uid);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'sprites');
      $('tip').style.display = 'none';
      document.body.classList.add('dragging');
      setTimeout(() => document.querySelectorAll('.tile.sel').forEach((t) => t.classList.add('ghost')), 0);
    });
    d.addEventListener('dragend', () => {
      state.drag = null; clearDropMarks();
      document.body.classList.remove('dragging');
      document.querySelectorAll('.ghost').forEach((t) => t.classList.remove('ghost'));
    });
    d.addEventListener('dragover', (e) => {
      if (!state.drag) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const r = d.getBoundingClientRect();
      const after = e.clientX > r.left + r.width / 2;
      if (!d.classList.contains(after ? 'drop-after' : 'drop-before')) { clearDropMarks(); d.classList.add(after ? 'drop-after' : 'drop-before'); }
    });
    d.addEventListener('drop', (e) => {
      if (!state.drag) return;
      e.preventDefault(); e.stopPropagation();
      const after = d.classList.contains('drop-after');
      const uids = state.drag; clearDropMarks();
      moveTo(uids, s.index + (after ? 1 : 0));
    });
  }
  function setupGridDrop(grid) {
    // dropping on the empty area of a block puts the sprites after its last tile
    grid.addEventListener('dragover', (e) => { if (state.drag) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } });
    grid.addEventListener('drop', (e) => {
      if (!state.drag) return;
      e.preventDefault();
      const tiles = grid.querySelectorAll('.tile');
      const last = tiles[tiles.length - 1];
      const uids = state.drag; clearDropMarks();
      if (last) moveTo(uids, +last.dataset.idx + 1);
    });
  }

  function contentBox(s) {
    let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.pixels[y * s.w + x]) {
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return maxX < 0 ? { w: 0, h: 0, empty: true } : { w: maxX - minX + 1, h: maxY - minY + 1, x: minX, y: minY, empty: false };
  }

  // ── Conversion ─────────────────────────────────────────────────────────────
  $('btnConvert').onclick = () => {
    if (!state.wl) return;
    clearLog('conversion'); clearLog('comparison');
    console.groupCollapsed('Conversion .wlsprt → LIERO.CHR');
    const out = F.convertWlsprtToChr(state.wl, { autoFit: $('autoFit').checked });
    pushLog('conversion', out.log.items);
    console.groupEnd();
    state.out = out;
    $('downloads').innerHTML = '';
    if (out.bytes) {
      setStatus('ok', 'Conversion finished – LIERO.CHR is ready to download.');
      const btn = document.createElement('button');
      btn.className = 'primary'; btn.textContent = 'Download LIERO.CHR';
      btn.onclick = () => download(out.bytes, 'LIERO.CHR');
      $('downloads').appendChild(btn);
      state.outParsed = F.parseChr(out.bytes);
      doCompare();
      switchView('out');
    } else {
      const errs = out.log.items.filter((i) => i.level === 'error').length;
      setStatus('err', `Conversion impossible – ${errs} ${errs === 1 ? 'error' : 'errors'}. See the "Sanity checks" panel for details.`);
      state.outParsed = null;
      render();
    }
    if (state.wl.palette) addPaletteDownloads();
    renderInfo();
  };
  $('autoFit').onchange = () => { if (state.out) $('btnConvert').click(); };

  function doCompare() {
    state.compare = null;
    clearLog('comparison');
    if (!state.outParsed || !state.chr || state.chr.log.hasErrors()) return;
    const cmp = F.compareChr(state.outParsed.sprites.slice(0, F.CHR_TOTAL_USED), state.chr.sprites.slice(0, F.CHR_TOTAL_USED));
    state.compare = new Set(cmp.diff);
    const items = [];
    if (!cmp.diff.length) items.push({ level: 'ok', msg: `Result is identical to the loaded CHR (${cmp.compared} sprites).`, sprite: null });
    else {
      items.push({ level: 'info', msg: `Comparison with ${state.chrName}: ${cmp.compared - cmp.diff.length} sprites identical, ${cmp.diff.length} different: ${cmp.diff.map((i) => '#' + i).join(', ')}. Differences are marked in blue.`, sprite: null });
    }
    pushLog('comparison', items);
  }

  function addPaletteDownloads() {
    if ($('downloads').querySelector('[data-pal]')) return;
    const pal = state.wl.palette;
    const base = (state.wlName || 'palette').replace(/\.[^.]*$/, '') + '_palette';
    const formats = [
      ['PNG', 'png', 'image/png', () => F.paletteToPng(pal), '256x1 indexed PNG, pixel i = colour i, index 0 transparent'],
      ['JSON', 'json', 'application/json', () => F.paletteToJson(pal), 'Flat array of 768 numbers [r,g,b,...], 0–255'],
      ['LPL', 'lpl', 'application/octet-stream', () => F.paletteToLpl(pal), 'LieroKit palette: 768 B raw RGB, 0–255'],
      ['PAL (6-bit)', 'pal', 'application/octet-stream', () => F.paletteTo6bit(pal), '768 B raw RGB, 0–63 (VGA, as stored in LIERO.EXE)'],
    ];
    const wrap = document.createElement('span');
    wrap.dataset.pal = 1;
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center';
    const lbl = document.createElement('span');
    lbl.textContent = 'Palette:'; lbl.style.cssText = 'color:var(--muted);font-size:13px;margin-left:4px';
    wrap.appendChild(lbl);
    for (const [label, ext, mime, make, title] of formats) {
      const b = document.createElement('button');
      b.textContent = label; b.title = title;
      b.onclick = () => { download(make(), `${base}.${ext}`, mime); console.log(`[UI] Palette saved as ${base}.${ext}`); };
      wrap.appendChild(b);
    }
    $('downloads').appendChild(wrap);
  }

  function download(data, name, mime) {
    const url = URL.createObjectURL(new Blob([data], { type: mime || 'application/octet-stream' }));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function setStatus(kind, text) { const s = $('status'); s.className = 'status ' + kind; s.textContent = text; }

  // ── Sprite view ──────────────────────────────────────────────────────────
  document.querySelectorAll('.tab').forEach((t) => (t.onclick = () => switchView(t.dataset.view)));
  $('zoom').onchange = render;
  $('onlyProblems').onchange = render;

  function switchView(v) {
    state.view = v;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === v));
    render();
    updateEditBar();
  }

  function currentPalette() { return (state.wl && state.wl.palette) || F.DEFAULT_PALETTE; }

  function problemMap() {
    // sprite index → 'error' | 'warn' (from WLSPRT and conversion logs)
    const m = new Map();
    for (const l of state.logs) {
      if (l.sprite === null || (l.source !== 'conversion' && l.source !== 'WLSPRT' && l.source !== 'limits')) continue;
      if (l.level === 'error') m.set(l.sprite, 'error');
      else if (l.level === 'warn' && m.get(l.sprite) !== 'error') m.set(l.sprite, 'warn');
    }
    if (state.wl && state.wl.tooBig) for (const i of state.wl.tooBig) m.set(i, 'error');
    return m;
  }

  function render() {
    $('bWl').textContent = state.wl ? state.wl.sprites.length : '';
    $('bOut').textContent = state.outParsed ? '✓' : state.out ? '✕' : '';
    $('bChr').textContent = state.chr ? state.chr.sprites.length : '';
    const view = $('view');
    view.innerHTML = '';
    const zoom = +$('zoom').value;
    const only = $('onlyProblems').checked;
    const pal = currentPalette();
    const probs = problemMap();
    let sprites = null, kind = state.view;
    if (kind === 'wl') sprites = state.wl && state.wl.sprites;
    else if (kind === 'out') sprites = state.outParsed && state.outParsed.sprites;
    else sprites = state.chr && state.chr.sprites;

    if (!sprites) {
      const msg = kind === 'wl' ? 'Load a .wlsprt file.' :
        kind === 'out' ? (state.out ? 'Conversion failed – no result. See the error messages.' : 'Click "Convert to CHR" to see the result.') :
        'Optionally load a LIERO.CHR for preview or comparison.';
      view.innerHTML = `<div class="empty-state">${msg}</div>`;
      $('viewInfo').textContent = '';
      return;
    }

    const groups = [];
    for (const b of F.CHR_BLOCKS) groups.push({ title: `Block ${b.size}x${b.size} · #${b.first}–#${b.first + b.slots - 1}${b.slots !== b.used ? ` (used up to #${b.first + b.used - 1})` : ''}`, from: b.first, to: b.first + b.slots, size: b.size });
    const maxIdx = sprites.length;
    if (kind === 'wl' && maxIdx > F.CHR_TOTAL_USED) groups.push({ title: `Extra · #${F.CHR_TOTAL_USED}–#${maxIdx - 1} (no room in CHR)`, from: F.CHR_TOTAL_USED, to: maxIdx, size: 16, extra: true });
    if (kind === 'wl') groups[2].to = F.CHR_TOTAL_USED; // .wlsprt has no slots 266–269

    let shown = 0;
    for (const g of groups) {
      const items = [];
      for (let i = g.from; i < Math.min(g.to, maxIdx); i++) {
        const s = sprites[i];
        let cls = '';
        if (kind === 'wl') { cls = probs.get(i) === 'error' || g.extra ? 'err' : probs.get(i) === 'warn' ? 'warn' : ''; }
        if (kind === 'out' && probs.get(i) === 'warn') cls = 'warn';
        if ((kind === 'out' || kind === 'chr') && state.compare && state.compare.has(i)) cls = 'diff';
        if (kind !== 'wl' && s.unusedSlot) cls += ' unused';
        if (only && !cls.trim().replace('unused', '')) continue;
        items.push({ s, cls, i });
      }
      if (!items.length) continue;
      const h = document.createElement('div'); h.className = 'block-title'; h.textContent = g.title;
      const grid = document.createElement('div'); grid.className = 'grid';
      if (kind === 'wl') setupGridDrop(grid);
      for (const it of items) { grid.appendChild(tile(it.s, it.i, it.cls, zoom, pal, kind, g.size)); shown++; }
      view.append(h, grid);
    }
    if (!shown) view.innerHTML = '<div class="empty-state">No sprites match the filter.</div>';
    const fmt = kind === 'wl' ? 'cropped sprites, drawn at actual size · ←N = position in the original file' : 'full-size slot cells';
    $('viewInfo').textContent = `${shown} sprites · ${fmt}`;
  }

  function tile(s, i, cls, zoom, pal, kind, slotSize) {
    const d = document.createElement('div');
    d.className = 'tile ' + cls; d.dataset.idx = i; d.dataset.kind = kind;
    if (kind === 'wl') {
      d.dataset.uid = s.uid;
      if (state.sel.has(s.uid)) d.classList.add('sel');
      if (s.origIndex !== s.index) d.classList.add('moved');
      d.addEventListener('click', (e) => clickTile(e, s.uid));
      setupTileDrag(d, s);
    }
    const c = document.createElement('canvas');
    const w = Math.max(1, s.w), h = Math.max(1, s.h);
    c.width = w; c.height = h;
    c.style.width = w * zoom + 'px'; c.style.height = h * zoom + 'px';
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let k = 0; k < s.w * s.h; k++) {
      const v = s.pixels[k]; if (!v) continue;
      img.data[k * 4] = pal[v * 3]; img.data[k * 4 + 1] = pal[v * 3 + 1]; img.data[k * 4 + 2] = pal[v * 3 + 2]; img.data[k * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // minimum tile size = slot size, so the grid stays even
    d.style.minWidth = slotSize * zoom + 8 + 'px';
    const holder = document.createElement('div');
    holder.style.cssText = `height:${Math.max(slotSize, h) * zoom}px;display:flex;align-items:center;justify-content:center`;
    holder.appendChild(c);
    const n = document.createElement('div'); n.className = 'n'; n.textContent = i;
    if (kind === 'wl' && s.origIndex !== s.index) {
      const o = document.createElement('span'); o.className = 'orig';
      o.textContent = s.origIndex === null ? ' new' : ` ←${s.origIndex}`;
      n.appendChild(o);
    }
    d.append(holder, n);
    d.onmouseenter = (e) => { if (!state.drag) showTip(e, s, i, kind); };
    d.onmousemove = moveTip;
    d.onmouseleave = () => ($('tip').style.display = 'none');
    return d;
  }

  function showTip(e, s, i, kind) {
    const blk = F.blockForIndex(i);
    const lines = [`Sprite #${i}`];
    if (kind === 'wl') {
      const cb = contentBox(s);
      lines.push(`In file: ${s.origIndex === null ? 'inserted (empty)' : '#' + s.origIndex}`, `Size:    ${s.w}x${s.h}`, `Offset:  ${s.ox}, ${s.oy}`, `Content: ${cb.empty ? 'empty' : cb.w + 'x' + cb.h}`);
      lines.push(blk ? `Liero slot: ${blk.size}x${blk.size} (anchor ${F.ANCHORS[i].join(',')})` : 'Liero slot: NONE (beyond the 266 limit)');
    } else {
      lines.push(`Slot: ${s.w}x${s.h}${s.unusedSlot ? ' (unused by WebLiero)' : ''}`);
    }
    if (state.compare && state.compare.has(i) && kind !== 'wl') lines.push('≠ differs from the other CHR file');
    for (const l of state.logs) if (l.sprite === i && (l.level === 'error' || l.level === 'warn')) lines.push((l.level === 'error' ? '✕ ' : '! ') + wrap(l.msg, 52));
    const t = $('tip'); t.textContent = lines.join('\n'); t.style.display = 'block'; moveTip(e);
  }
  function wrap(s, n) { return s.replace(new RegExp(`(.{1,${n}})(\\s|$)`, 'g'), '$1\n  ').trimEnd(); }
  function moveTip(e) {
    const t = $('tip'); const pad = 14;
    let x = e.clientX + pad, y = e.clientY + pad;
    if (x + t.offsetWidth > innerWidth) x = e.clientX - t.offsetWidth - pad;
    if (y + t.offsetHeight > innerHeight) y = e.clientY - t.offsetHeight - pad;
    t.style.left = Math.max(4, x) + 'px'; t.style.top = Math.max(4, y) + 'px';
  }

  function focusSprite(view, idx) {
    $('onlyProblems').checked = false;
    switchView(view);
    const el = document.querySelector(`.tile[data-idx="${idx}"]`);
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1300); }
  }

  // ── Information panel ────────────────────────────────────────────────────
  function renderInfo() {
    const kv = [];
    if (state.wl) {
      const h = state.wl.header;
      kv.push(['.wlsprt', state.wlName], ['Sprites', h.count ?? '—'], ['Palette', state.wl.palette ? '256 colours' : 'none']);
      if (state.base && isModified()) kv.push(['After edits', `${state.wl.sprites.length} sprites`]);
    }
    if (state.chr) {
      kv.push(['CHR', state.chrName]);
      state.chr.blocks.forEach((b, k) => kv.push([`Block ${k + 1}`, `${b.n} × ${b.w}x${b.h}`]));
    }
    if (state.outParsed) kv.push(['Result', `LIERO.CHR, ${state.out.bytes.length} B`]);
    $('info').innerHTML = kv.length ? kv.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(String(v))}</dd>`).join('') : '<dt>File</dt><dd>—</dd>';
    const pal = currentPalette();
    const p = $('palette'); p.innerHTML = '';
    for (let i = 0; i < 256; i++) {
      const d = document.createElement('div');
      d.style.background = `rgb(${pal[i * 3]},${pal[i * 3 + 1]},${pal[i * 3 + 2]})`;
      d.title = `#${i}: ${pal[i * 3]}, ${pal[i * 3 + 1]}, ${pal[i * 3 + 2]}`;
      p.appendChild(d);
    }
    $('palNote').textContent = state.wl && state.wl.palette ? 'Palette from the .wlsprt file (index 0 = transparent).' : 'Default palette (CHR files contain no palette).';
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  renderInfo();
  renderLog();
})();
