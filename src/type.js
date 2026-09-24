// type.js: lettering and the kinetic lyric engine.
const F = {
  display: 'Archivo', mono: 'JetBrains Mono', ui: 'Mona Sans', hand: 'Shantell Sans', serif: 'Noto Serif Display',
  jp: 'Shippori Mincho B1', comic: 'Bangers', marker: 'Permanent Marker',
};
const STRETCH = ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'];
// setFont(ctx, {font, size, weight, stretch (-4..4, 0 = normal), italic})
function setFont(ctx, o) {
  const fam = F[o.font || 'display'] || o.font;
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 900} ${o.size || 100}px "${fam}"`;
  ctx.fontStretch = STRETCH[clamp(Math.round((o.stretch || 0) + 4), 0, 8)];
  ctx.letterSpacing = (o.track || 0) + 'px';
}
function measure(ctx, s, o) { setFont(ctx, o); const m = ctx.measureText(s); return { w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent }; }

// txt(ctx, s, x, y, o): one styled run of text.
// o: font/size/weight/stretch/italic/track, color, align ('left'|'center'|'right'), base ('alphabetic'|'middle'|'top'),
//    rot, skew, sx, sy, alpha, stroke: {w, color} (fat outline under the fill), extrude: {dx, dy, color} (solid offset
//    print shadow), dots: {color, spacing, dir, from, to} (halftone inside the letters).
function txt(ctx, s, x, y, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
  ctx.scale(o.sx ?? 1, o.sy ?? 1); ctx.globalAlpha *= o.alpha ?? 1;
  setFont(ctx, o); ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.lineJoin = 'round';
  const col = o.color || INK.ink;
  if (o.extrude) { const e = o.extrude, n = e.steps || 1; ctx.fillStyle = e.color || INK.ink; if (e.line) { ctx.strokeStyle = e.color || INK.ink; ctx.lineWidth = e.line; } for (let i = n; i >= 1; i--) { const dx = e.dx * i / n, dy = e.dy * i / n; if (e.line) ctx.strokeText(s, dx, dy); ctx.fillText(s, dx, dy); } }
  if (o.stroke) { ctx.strokeStyle = o.stroke.color || INK.ink; ctx.lineWidth = o.stroke.w; ctx.strokeText(s, 0, 0); }
  ctx.fillStyle = col; ctx.fillText(s, 0, 0);
  if (o.dots) {
    const c = layer(44), m = ctx.measureText(s), asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
    const x0 = -m.actualBoundingBoxLeft, x1 = m.actualBoundingBoxRight;
    c.setTransform(ctx.getTransform()); setFont(c, o); c.textAlign = ctx.textAlign; c.textBaseline = ctx.textBaseline;
    c.fillStyle = '#000'; c.fillText(s, 0, 0); c.globalCompositeOperation = 'source-in';
    dotsIn(c, [x0, -asc, x1, desc], { spacing: o.size * .07, dir: [0, 1], from: -asc * .2, to: desc + asc * .2, min: 0, max: .85, ...o.dots });
    c.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(c.canvas, 0, 0); ctx.restore();
  }
  if (o.under) { const m = ctx.measureText(s), x0 = o.align === 'center' ? -m.width / 2 : o.align === 'right' ? -m.width : 0; inkLine(ctx, [[x0 - 6, o.size * .14], [x0 + m.width * .5, o.size * .17], [x0 + m.width + 8, o.size * .12]], o.size * .07, o.under, { taper: [.1, .3] }); }
  ctx.restore();
}

// ---------- lyric timing ----------
const LEAD = 1 / 24;                                        // show words one frame before the vocal onset
const lineEnd = li => Math.min(LINES[li].b + .25, li + 1 < LINES.length ? LINES[li + 1].a - LEAD : 1e9);
// Word reveal state for word wi of line li at time t: {k: 0..1 entry progress, age, on: is being sung now}
function wordState(t, li, wi) {
  const w = LINES[li].words[wi], age = t - (w.a - LEAD);
  return { age, k: clamp(age / .12), on: t >= w.a - LEAD && t < (w.b + .05), shown: age >= 0 };
}
// Split a line's words into rows: rows = [3, 2, 4] word counts, or auto (greedy by character budget).
function rowsOf(words, rows, budget = 12) {
  if (rows) { const out = []; let i = 0; for (const n of rows) { out.push(words.slice(i, i + n).map((w, j) => i + j)); i += n; } return out; }
  const out = [[]]; let len = 0;
  words.forEach((w, i) => { if (len && len + w.w.length > budget) { out.push([]); len = 0; } out[out.length - 1].push(i); len += w.w.length + 1; });
  return out;
}
const clean = s => s.replace(/[()]/g, '');

// ---------- HERO: justified stacked slab ----------
// hero(ctx, t, li, {box: [x, y, w, h], rows, align, color, hot: accent colour for emphasised words, emph: [word idx],
//   stretch, italic, gap, stroke, extrude, dots, out: exit style 'drop'|'cut', upper, maxSize, from: word idx subset})
// Each row is sized to fill the box width (short rows get huge), rows stack top-down and never exceed box height.
function hero(ctx, t, li, o = {}) {
  const L = LINES[li], end = o.end ?? lineEnd(li); if (t < L.words[0].a - LEAD - .02 || t >= end) return;
  const [bx, by, bw, bh] = o.box || [110, 120, 1000, 840], gap = o.gap ?? .06;
  const words = L.words.map(w => ({ ...w, s: o.upper === false ? clean(w.w) : clean(w.w).toUpperCase() }));
  const idx = o.words || words.map((_, i) => i), rows = rowsOf(idx.map(i => words[i]), o.rows, o.budget || 11).map(r => r.map(j => idx[j]));
  const base = { font: o.font || 'display', weight: o.weight || 900, stretch: o.stretch ?? -2, italic: o.italic, track: o.track ?? -2 };
  // size each row to the box width, then scale all rows down together if the stack is too tall
  const meas = rows.map(r => { const s = r.map(i => words[i].s).join(' '), m = measure(ctx, s, { ...base, size: 100 }); return { s, w: m.w, size: Math.min(o.maxSize || 420, 100 * bw / m.w) }; });
  let total = meas.reduce((a, m) => a + m.size * (.78 + gap), 0); const fit = Math.min(1, bh / total);
  const ex = end - t, out = o.out || 'drop', outK = clamp(1 - ex / .18);
  let y = by;
  rows.forEach((r, ri) => {
    const size = meas[ri].size * fit, capH = size * .74; y += capH;
    // lay the words of the row left to right at this size
    setFont(ctx, { ...base, size }); const sp = ctx.measureText(' ').width;
    const ws = r.map(i => ctx.measureText(words[i].s).width), rowW = ws.reduce((a, b) => a + b, 0) + sp * (r.length - 1);
    let x = o.align === 'center' ? bx + (bw - rowW) / 2 : o.align === 'right' ? bx + bw - rowW : bx;
    r.forEach((i, j) => {
      const st = wordState(t, li, i); if (!st.shown) { x += ws[j] + sp; return; }
      const emph = (o.emph || []).includes(i), pop = backOut(st.k, 2.6), wob = st.on ? Math.sin(t * 40) * .004 : 0;
      const sc = lerp(1.45, 1, pop) * (1 + (st.on ? .04 * Math.exp(-st.age * 6) : 0)), fall = out === 'drop' ? easeIn(outK) * 900 * (1 + j * .15 + ri * .1) : 0;
      if (out === 'cut' && outK > .5) { x += ws[j] + sp; return; }
      const cx = x + ws[j] / 2, cy = y - capH / 2;
      ctx.save(); ctx.translate(cx, cy + fall); ctx.rotate((hash(li * 17 + i) - .5) * (o.tilt ?? .05) + wob + (out === 'drop' ? outK * (hash(i) - .5) * .8 : 0)); ctx.scale(sc, sc);
      txt(ctx, words[i].s, -ws[j] / 2, capH / 2, { ...base, size, color: emph ? (o.hot || INK.orange) : (o.color || INK.ink),
        stroke: o.stroke, extrude: o.extrude, dots: emph ? o.hotDots : o.dots, alpha: st.k < 1 ? clamp(st.k * 3) : 1 });
      ctx.restore();
      x += ws[j] + sp;
    });
    y += size * gap;
  });
}

// ---------- CAPTION: Spider-Verse narration box ----------
// caption(ctx, t, li, {x, y, w, size, rot, fill, color, align}) - box sized to the full line, words appear as sung.
function caption(ctx, t, li, o = {}) {
  const L = LINES[li], end = o.end ?? lineEnd(li), a = L.words[0].a - LEAD - .06; if (t < a || t >= end) return;
  const size = o.size || 62, pad = size * .5, maxW = o.w || 900, f = { font: 'hand', weight: 800, size, track: .5 };
  const words = L.words.map(w => w.w.toUpperCase());
  setFont(ctx, f); const sp = ctx.measureText(' ').width, lines = [[]]; let lw = 0;
  words.forEach((w, i) => { const ww = ctx.measureText(w).width; if (lw && lw + sp + ww > maxW - pad * 2) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += (lw ? sp : 0) + ww; });
  const bw = Math.min(maxW, Math.max(...lines.map(r => r.reduce((s, i) => s + ctx.measureText(words[i]).width, 0) + sp * (r.length - 1))) + pad * 2), bh = lines.length * size * 1.12 + pad * 1.4;
  const k = backOut(seg(t, a, a + .16), 2.2), exit = clamp((t - (end - .12)) / .12);
  const x = o.x ?? 80, y = o.y ?? 80;
  ctx.save(); ctx.translate(x + bw / 2, y + bh / 2); ctx.rotate(o.rot ?? -.02); ctx.scale(k * (1 - exit * .3), k * (1 - exit)); ctx.translate(-bw / 2, -bh / 2);
  fillPts(ctx, rect(10, 12, bw, bh), INK.ink, false);
  ink(ctx, rect(0, 0, bw, bh), { fill: o.fill || INK.yellow, line: 4, smooth: false, boil: .8 });
  lines.forEach((r, ri) => {
    let xx = pad; r.forEach(i => { const st = wordState(t, li, i); setFont(ctx, f); const ww = ctx.measureText(words[i]).width;
      if (st.shown) txt(ctx, words[i], xx, pad * .7 + (ri + .8) * size * 1.12 - size * .12, { ...f, color: (o.hot || []).includes(i) ? (o.hotColor || INK.red) : (o.color || INK.ink), alpha: clamp(st.age / .06) });
      xx += ww + sp; });
  });
  ctx.restore();
}

// ---------- RANSOM: Spider-Punk cut-out letters (final chorus) ----------
// ransom(ctx, t, li, {box, rows, words, upper}) - every glyph on its own taped scrap, mixed faces, jitter on threes.
const RANSOM_FACES = [['display', 900, -2], ['serif', 900, -2], ['ui', 900, 0], ['mono', 800, 0], ['comic', 400, 0], ['display', 900, 2], ['marker', 400, 0]];
const RANSOM_PAPERS = [[INK.white, INK.ink], [INK.yellow, INK.ink], [INK.ink, INK.white], [INK.red, INK.white], [INK.pinkLt, INK.ink], [INK.cyan, INK.ink], [INK.paper, INK.red], [INK.orange, INK.ink]];
function ransom(ctx, t, li, o = {}) {
  const L = LINES[li], end = o.end ?? lineEnd(li); if (t < L.words[0].a - LEAD - .02 || t >= end) return;
  const [bx, by, bw, bh] = o.box || [100, 120, 1720, 800], words = L.words.map(w => clean(w.w).toUpperCase());
  const idx = o.words || words.map((_, i) => i), rows = rowsOf(idx.map(i => ({ w: words[i] })), o.rows, o.budget || 12).map(r => r.map(j => idx[j]));
  const tk = Math.floor(t * 8), glyph = (wi, ci) => { const h = hash(li * 131 + wi * 17 + ci * 3.3); return { face: RANSOM_FACES[Math.floor(h * RANSOM_FACES.length)], paper: RANSOM_PAPERS[Math.floor(hash(h * 91) * RANSOM_PAPERS.length)], rot: (hash(h * 7) - .5) * .22 }; };
  const rowW = r => r.reduce((s, i) => s + [...words[i]].reduce((a, ch, ci) => { const g = glyph(i, ci); return a + measure(ctx, ch, { font: g.face[0], weight: g.face[1], stretch: g.face[2], size: 100 }).w * 1.18 + 6; }, 0) + 40, 0);
  const sizes = rows.map(r => Math.min(o.maxSize || 260, 100 * bw / rowW(r))), fit = Math.min(1, bh / sizes.reduce((a, s) => a + s * 1.12, 0));
  let y = by;
  rows.forEach((r, ri) => { const size = sizes[ri] * fit; y += size;
    let x = bx + (bw - rowW(r) * size / 100) / 2;
    r.forEach(i => { const st = wordState(t, li, i); [...words[i]].forEach((ch, ci) => {
      const g = glyph(i, ci), f = { font: g.face[0], weight: g.face[1], stretch: g.face[2], size }, cw = measure(ctx, ch, f).w;
      if (st.shown) { const k = backOut(clamp((st.age - ci * .015) / .1), 2.4); if (k > .01) { const j = [(hash(tk + ci * 3 + i) - .5) * 4, (hash(tk * 2 + ci + i * 5) - .5) * 4];
        ctx.save(); ctx.translate(x + cw * .59 + j[0], y - size * .36 + j[1]); ctx.rotate(g.rot); ctx.scale(k, k);
        fillPts(ctx, rect(-cw * .59 + 7, -size * .55 + 8, cw * 1.18, size * 1.02), INK.ink, false); fillPts(ctx, rect(-cw * .59, -size * .55, cw * 1.18, size * 1.02), g.paper[0], false);
        txt(ctx, ch, 0, size * .34, { ...f, color: g.paper[1], align: 'center' }); ctx.restore(); } }
      x += (cw * 1.18 + 6); }); x += size * .4; });
    y += size * .12; });
}

// ---------- SUB: subtitle-scale lyric ----------
// sub(ctx, t, li, {y, size, color, box: true}) - centred lower third, current word highlighted.
function sub(ctx, t, li, o = {}) {
  const L = LINES[li], end = o.end ?? lineEnd(li), a = L.words[0].a - LEAD - .05; if (t < a || t >= end) return;
  const size = o.size || 62, f = { font: 'display', weight: 800, stretch: -1, size, track: 0 }, y = o.y ?? 1000;
  setFont(ctx, f); const sp = ctx.measureText(' ').width, ws = L.words.map(w => ctx.measureText(w.w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let x = (o.x ?? W / 2) - tot / 2; const k = easeOut(seg(t, a, a + .12)) * (1 - seg(t, end - .1, end));
  if (o.box !== false) { ctx.save(); ctx.globalAlpha = .88 * k; fillPts(ctx, rect(x - 26, y - size * .95, tot + 52, size * 1.35), o.bg || INK.ink, false); ctx.restore(); }
  L.words.forEach((w, i) => { const st = wordState(t, li, i);
    txt(ctx, w.w, x, y, { ...f, color: st.on ? (o.hot || INK.yellow) : (st.shown ? (o.color || INK.white) : rgba(o.color || INK.white, .35)), alpha: k });
    x += ws[i] + sp; });
}

// ---------- SFX: onomatopoeia ----------
// sfx(ctx, 'HOP!', x, y, size, age, {rot, color, fill2, life}) - pops with overshoot, jitters, then snaps away.
function sfx(ctx, s, x, y, size, age, o = {}) {
  const life = o.life ?? .9; if (age < 0 || age > life) return;
  const k = backOut(clamp(age / .1), 3), out = clamp((age - (life - .12)) / .12), j = shake(age + x, 3 * (1 - age / life));
  txt(ctx, s, x + j[0], y + j[1], { font: 'display', weight: 900, stretch: o.stretch ?? 2, italic: true, size: size * k * (1 + out * .3), align: 'center', base: 'middle', rot: o.rot ?? -.1,
    color: o.color || INK.yellow, stroke: { w: size * .09, color: INK.ink }, extrude: { dx: size * .06, dy: size * .08, color: o.shadow || INK.ink }, dots: o.dots === false ? null : { color: rgba(o.dotColor || INK.orange, .9), spacing: size * .08 }, alpha: 1 - out });
}
// Visible prefix of s when typing it from t0 at cps characters per second (with a blinking caret while typing).
function typed(s, t, t0, cps = 18, caret = true) { const n = clamp(Math.floor((t - t0) * cps), 0, s.length); return s.slice(0, n) + (caret && n < s.length && Math.floor(t * 4) % 2 === 0 ? '\u258D' : ''); }
