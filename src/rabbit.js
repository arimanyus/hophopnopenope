// rabbit.js: the Reviewer. An original White Rabbit in an oversized orange hoodie, red review pen behind the right
// ear, a notch bitten out of the left ear. Drawn in unit space: u = 1 is the scale s in pixels.
//
// rabbit(ctx, x, y, s, pose) -> anchors. (x, y) = ground point between the feet. Height: feet to head top 9.8u,
// ear tips about 14.5u. s = 40 gives a ~580 px tall rabbit including ears.
// Returns anchor points in the caller's coordinates: {pawL, pawR, head, eyeL, eyeR, mouth, earL, earR, chest, pocket}.
//
// pose (all optional; angles in degrees):
//   turn -1..1 (faces screen-left..right), flip, lean, tilt (head roll), nod (head drop, u), sq (squash, - = stretch),
//   hop (height in u), sit (0..1), legs: 'stand' | 'hop' | 'run' (+ phase), step (0..1 spread),
//   earL/earR: {a: base angle, b: bend at the middle, len: 0..1.2}, armL/armR: {a: shoulder (0 down, 90 out, 170 up), e: elbow},
//   pawL/pawR: 'mitt' | 'point' | 'fist' | 'open' | 'thumb',
//   eyes: 'open' | 'wide' | 'happy' | 'closed' | 'star' | 'spiral' | 'x' | 'heart' | 'dot', lids 0..1, lx/ly -1..1 look,
//   bags 0..1, brows (raise, u), browTilt (+ angry, - worried), mouth: 'smile' | 'open' | 'o' | 'flat' | 'frown' | 'wavy' |
//   'grin' | 'smirk', open 0..1, blush 0..1, sweat 0..1, sense 0..1 (rabbit-sense squiggles), anger 0..1,
//   glasses, pen (default true), hood (hood up), col: {hoodie, hoodieDk, fur, furDk, ear, line}, noShadow.
const RB = {
  hoodie: INK.orange, hoodieDk: INK.orangeDk, hoodieLt: INK.orangeLt, fur: INK.fur, furDk: INK.furShade, ear: INK.earIn,
  nose: '#FF6F96', line: INK.ink, pen: INK.red, cheek: '#FF7FA6',
};
const deg = a => a * Math.PI / 180;

// ---------- pose helpers (use with twos(t)) ----------
// Mouth driven by the vocal: opens on each sung word onset and relaxes. Returns 0..1.
function singOpen(t, li0 = 0, li1 = LINES.length - 1) {
  let v = 0;
  for (let li = li0; li <= li1; li++) { const L = LINES[li]; if (t < L.a - .2 || t > L.b + .3) continue;
    for (const w of L.words) { const a = w.a - .03, b = Math.max(w.b, a + .12); if (t >= a && t < b + .12) v = Math.max(v, Math.min(1, (t - a) / .05) * (t < b ? .65 + .35 * Math.sin((t - a) / (b - a) * Math.PI) : 1 - (t - b) / .12)); } }
  return clamp(v);
}
// Hop arc: returns {h (height u), sq (squash), vy (vertical speed sign)} for a hop that takes off at t0 and lasts d.
function hopArc(t, t0, d = .38, height = 2.2) {
  const k = (t - t0) / d;
  if (k < -.18 || k > 1.25) return { h: 0, sq: 0, vy: 0 };
  if (k < 0) return { h: 0, sq: .35 * easeOut(1 + k / .18), vy: 0 };         // anticipation crouch
  if (k > 1) return { h: 0, sq: .45 * Math.exp(-(k - 1) * 14) * Math.sin((k - 1) * 40 + 1.6), vy: 0 }; // landing squash
  return { h: height * 4 * k * (1 - k), sq: -.25 * Math.sin(k * Math.PI) * (1 - k), vy: 1 - 2 * k };
}
// Ears react to vertical motion: trailing down while rising, flopping up after landing.
const earsFor = (vy, base = 0) => ({ earL: { a: -14 + base, b: -vy * 38 }, earR: { a: 12 - base, b: vy * 38 } });
// Blink: lids at time t for blinks centred at the given times.
function blink(t, times, d = .12) { let v = 0; for (const b of times) { const k = Math.abs(t - b) / d; if (k < 1) v = Math.max(v, 1 - k * k); } return v; }

// ---------- geometry ----------
// Tube along a spine (ears, sleeves, legs) with width profile wf(s) in u; returns closed outline points.
function tube(spine, wf, n = 14, notch = null) {
  const d = sampleSpline(spine, false, true, .15), L = []; let tot = 0; for (let i = 1; i < d.length; i++) { tot += dist(d[i - 1], d[i]); L.push(tot); } L.unshift(0);
  const pick = s => { let i = 0; while (i < d.length - 2 && L[i + 1] / tot < s) i++; const k = (s * tot - L[i]) / ((L[i + 1] - L[i]) || 1); return [lerp(d[i][0], d[i + 1][0], k), lerp(d[i][1], d[i + 1][1], k), Math.atan2(d[i + 1][1] - d[i][1], d[i + 1][0] - d[i][0])]; };
  const left = [], right = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, [x, y, a] = pick(Math.min(s, .999)), w = wf(s) / 2, nx = -Math.sin(a), ny = Math.cos(a);
    let wl = w; if (notch && Math.abs(s - notch[0]) < notch[1]) wl *= 1 - notch[2] * (1 - Math.abs(s - notch[0]) / notch[1]);
    left.push([x + nx * wl, y + ny * wl]); right.push([x - nx * w, y - ny * w]);
  }
  const tip = pick(.999); return [...left, [tip[0] + Math.cos(tip[2]) * wf(1) * .5, tip[1] + Math.sin(tip[2]) * wf(1) * .5], ...right.reverse()];
}
const polar = (a, r) => [Math.sin(deg(a)) * r, -Math.cos(deg(a)) * r]; // a from straight up, clockwise

function headPts(turn) {
  const p = [], n = 30;
  for (let i = 0; i < n; i++) {
    const th = i / n * TAU, c = Math.cos(th), s = Math.sin(th);
    const bulge = 1 + .1 * Math.max(0, s) * (1 - Math.abs(c) * .4), top = s < 0 ? .9 : 1.02;
    let x = 2.45 * c * bulge, y = 2.1 * s * top;
    x += turn * .22 * (1 - s * s) * Math.sign(c) * (Math.sign(c) === Math.sign(turn) ? -1 : .6);
    p.push([x, y]);
  }
  return p;
}
function earPts(side, e = {}, turn = 0) {
  const a = e.a ?? (side < 0 ? -14 : 12), b = e.b ?? 0, len = e.len ?? 1, bx = side * .95 + turn * .45, by = -1.62;
  const L1 = 2.5 * len, L2 = 2.6 * len, m = polar(a, L1), tip = polar(a + b, L2);
  const spine = [[bx, by + .2], [bx + m[0] * .5, by + m[1] * .5], [bx + m[0], by + m[1]], [bx + m[0] + tip[0] * .55, by + m[1] + tip[1] * .55], [bx + m[0] + tip[0], by + m[1] + tip[1]]];
  const wf = s => 1.18 * Math.pow(Math.sin(Math.PI * (.18 + .8 * s)), .55) * (1 - .12 * s) + .05;
  return { out: tube(spine, wf, 16, side < 0 ? [.74, .07, .45] : null), inner: tube(spine.slice(1).map(([x, y], i) => [x, y]), s => wf(s) * .52, 12), tip: spine[4], spine };
}
function sleevePts(side, arm = {}) {
  const a = arm.a ?? 8, e = arm.e ?? 10, sh = [side * 1.62, -4.85];
  const d1 = [side * Math.sin(deg(a)), Math.cos(deg(a))], a2 = a + e, d2 = [side * Math.sin(deg(a2)), Math.cos(deg(a2))];
  const el = [sh[0] + d1[0] * 1.5, sh[1] + d1[1] * 1.5], wr = [el[0] + d2[0] * 1.35, el[1] + d2[1] * 1.35];
  return { pts: tube([sh, [lerp(sh[0], el[0], .5), lerp(sh[1], el[1], .5)], el, [lerp(el[0], wr[0], .5), lerp(el[1], wr[1], .5)], wr], s => lerp(1.12, .9, s), 12), wr, dir: d2, el };
}

// ---------- parts ----------
function drawEar(c, E, o, px, isFar) {
  const col = o.col;
  ink(c, E.out, { fill: col.fur, shade: { color: col.furDk, spacing: 9 * px, dir: [.6, .8], from: -.2, to: 2.2, max: .8 }, line: 4.2 * px, lineColor: col.line, boil: 1.3 * px, seed: isFar ? 3 : 7 });
  ink(c, E.inner, { fill: col.ear, shade: { color: mix(col.ear, col.hoodieDk, .45), spacing: 8 * px, dir: [.5, .85], from: -.6, to: 1.4 }, line: 0, boil: 1.1 * px, seed: isFar ? 5 : 9 });
}
function drawPaw(c, o, side, S, kind, px) {
  const [x, y] = S.wr, d = S.dir, col = o.col, r = .5;
  const cx = x + d[0] * .32, cy = y + d[1] * .32;
  if (kind === 'point') inkPts(c, tube([[cx, cy], [cx + d[0] * .9 - side * .1, cy + d[1] * .9]], () => .3, 6), col, px);
  ink(c, ell(cx, cy, r, r * .92, 16), { fill: col.fur, shade: { color: col.furDk, spacing: 8 * px, dir: [.5, .85], from: -.1, to: .6 }, line: 3.6 * px, lineColor: col.line, boil: 1 * px });
  if (kind !== 'fist') inkLine(c, [[cx - d[1] * .18 + d[0] * .25, cy + d[0] * .18 + d[1] * .25], [cx + d[0] * .45, cy + d[1] * .45]], 2.2 * px, col.line, { taper: [.2, .6] });
  if (kind === 'thumb') inkPts(c, tube([[cx, cy - .2], [cx, cy - .85]], () => .32, 6), col, px);
  if (kind === 'open') for (let i = -1; i <= 1; i++) inkPts(c, tube([[cx + d[0] * .3, cy + d[1] * .3], [cx + d[0] * .78 + i * d[1] * .32, cy + d[1] * .78 - i * d[0] * .32]], () => .24, 5), col, px);
  // cuff
  ink(c, tube([[x - d[0] * .15, y - d[1] * .15], [x + d[0] * .12, y + d[1] * .12]], () => 1.02, 4), { fill: o.col.hoodieDk, line: 3 * px, lineColor: col.line, boil: .8 * px, smooth: false });
}
const inkPts = (c, p, col, px) => ink(c, p, { fill: col.fur, line: 3.4 * px, lineColor: col.line, boil: .8 * px });

function drawEye(c, x, y, sx, o, side, px) {
  const col = o.col, eyes = o.eyes || 'open', lids = clamp(o.lids ?? 0), lx = (o.lx || 0) * .2, ly = (o.ly || 0) * .22, rx = .6 * sx, ry = .8;
  if (eyes === 'happy' || eyes === 'closed' || lids > .95) {
    const up = eyes === 'happy' ? -1 : 1;
    inkLine(c, [[x - rx, y + .05], [x, y + .05 + up * .38 * (eyes === 'happy' ? 1 : .35)], [x + rx, y + .05]], 5.5 * px, col.line, { taper: [.15, .15] }); return;
  }
  if (eyes === 'x') { inkLine(c, [[x - rx * .8, y - .5], [x + rx * .8, y + .5]], 5 * px, col.line); inkLine(c, [[x + rx * .8, y - .5], [x - rx * .8, y + .5]], 5 * px, col.line); return; }
  const wide = eyes === 'wide' ? 1.12 : 1;
  ink(c, ell(x, y, rx * wide, ry * wide, 20), { fill: INK.white, line: 3.6 * px, lineColor: col.line, boil: .9 * px, heavy: .9 });
  c.save(); clipPts(c, ell(x, y, rx * wide, ry * wide, 20));
  const pr = eyes === 'wide' ? .22 : eyes === 'dot' ? .16 : .4, px_ = x + lx * sx, py_ = y + ly + .08;
  if (eyes === 'star') ink(c, star(px_, py_, .5, .45, 5, -Math.PI / 2 + BOIL_T * 2), { fill: INK.yellow, line: 2.5 * px, lineColor: col.line, boil: 0, smooth: false });
  else if (eyes === 'heart') ink(c, [[px_, py_ + .45], [px_ - .5, py_ - .05], [px_ - .3, py_ - .42], [px_, py_ - .18], [px_ + .3, py_ - .42], [px_ + .5, py_ - .05]], { fill: INK.pink, line: 2.5 * px, boil: .5 * px });
  else if (eyes === 'spiral') { const pts = []; for (let i = 0; i < 40; i++) { const a = i * .5 + BOIL_T * 8 * side, r = i / 40 * .55; pts.push([px_ + Math.cos(a) * r, py_ + Math.sin(a) * r]); } inkLine(c, pts, 3 * px, col.line, { taper: [0, 0] }); }
  else {
    fillPts(c, ell(px_, py_, pr * sx, pr * 1.3, 16), col.line);
    fillPts(c, ell(px_ - .14 * sx, py_ - .2, .13, .13, 10), INK.white);
    fillPts(c, ell(px_ + .1 * sx, py_ + .16, .06, .06, 8), INK.white);
  }
  c.restore();
  // upper lid (fur coloured) closing from the top, with a heavy lash line
  if (lids > .02 || o.browTilt) {
    const ly0 = y - ry * wide + lids * ry * 2 * wide, tilt = (o.browTilt || 0) * .12 * side;
    const lid = [[x - rx * 1.4, y - ry * 1.6], [x + rx * 1.4, y - ry * 1.6], [x + rx * 1.4, ly0 - tilt], [x, ly0 + .06], [x - rx * 1.4, ly0 + tilt]];
    c.save(); clipPts(c, ell(x, y, rx * wide + .05, ry * wide + .05, 20)); fillPts(c, lid, col.fur, false); c.restore();
    if (lids > .02) inkLine(c, [[x - rx * 1.02, ly0 + tilt], [x, ly0 + .05], [x + rx * 1.02, ly0 - tilt]], 5 * px, col.line, { taper: [.1, .1] });
  }
  if (o.bags) { c.save(); c.globalAlpha = clamp(o.bags); inkLine(c, [[x - rx * .8, y + ry * 1.08], [x, y + ry * 1.25], [x + rx * .8, y + ry * 1.08]], 2.6 * px, col.line, { taper: [.3, .3] });
    inkLine(c, [[x - rx * .5, y + ry * 1.32], [x + rx * .3, y + ry * 1.4]], 2 * px, col.line, { taper: [.3, .3] }); c.restore(); }
}
function drawMouth(c, x, y, o, px) {
  const col = o.col, m = o.mouth || 'smile', open = clamp(o.open ?? (m === 'open' ? .7 : 0));
  // nose
  ink(c, [[x - .2, y - .12], [x + .2, y - .12], [x, y + .1]], { fill: col.nose, line: 2.6 * px, lineColor: col.line, boil: .5 * px });
  const my = y + .1;
  if (open > .05 || m === 'o') {
    const w = m === 'o' ? .22 : .45 + open * .15, h = m === 'o' ? .35 : .2 + open * .55;
    const mp = m === 'o' ? ell(x, my + .35, w, h, 14) : [[x - w, my + .12], [x, my + .05], [x + w, my + .12], [x + w * .8, my + .12 + h * .8], [x, my + .12 + h], [x - w * .8, my + .12 + h * .8]];
    ink(c, mp, { fill: '#5A1830', line: 3.4 * px, lineColor: col.line, boil: .6 * px });
    c.save(); clipPts(c, mp); fillPts(c, ell(x, my + .12 + h * 1.02, w * .7, h * .45, 12), '#FF6F8A');
    if (m !== 'o') { fillPts(c, rect(x - .19, my, .17, .26), INK.white, false); fillPts(c, rect(x + .02, my, .17, .26), INK.white, false); }
    c.restore(); return;
  }
  const S = (pts, w = 3.2) => inkLine(c, pts, w * px, col.line, { taper: [.25, .25] });
  S([[x, my - .05], [x, my + .18]], 2.8);
  if (m === 'smile' || m === 'grin') { S([[x - .55, my + .12], [x - .28, my + .32], [x, my + .18]]); S([[x, my + .18], [x + .28, my + .32], [x + .55, my + .12]]);
    if (m === 'grin') { fillPts(c, rect(x - .18, my + .2, .16, .22), INK.white, false); fillPts(c, rect(x + .02, my + .2, .16, .22), INK.white, false); } }
  else if (m === 'flat') S([[x - .45, my + .25], [x + .45, my + .25]]);
  else if (m === 'frown') { S([[x - .5, my + .4], [x - .22, my + .22], [x, my + .2]]); S([[x, my + .2], [x + .22, my + .22], [x + .5, my + .4]]); }
  else if (m === 'wavy') S([[x - .5, my + .3], [x - .25, my + .2], [x, my + .32], [x + .25, my + .2], [x + .5, my + .3]]);
  else if (m === 'smirk') S([[x - .35, my + .26], [x + .2, my + .24], [x + .5, my + .08]]);
}

// ---------- the rabbit ----------
function rabbit(ctx, x, y, s, o = {}) {
  if (!(s > 0)) return null;
  o = { ...o, col: { ...RB, ...(o.col || {}) } };
  const px = 1 / s, UPX0 = UPX; UPX = px;
  const turn = clamp(o.turn || 0, -1, 1), sq = o.sq || 0, flip = o.flip ? -1 : 1, hop = o.hop || 0;
  const sx = (1 + sq * .22) * flip, sy = 1 - sq * .22, sit = o.sit || 0;
  const base = ctx.getTransform();
  const M0 = new DOMMatrix().translate(x, y).scale(s * sx, s * sy);
  const MB = M0.translate(0, -hop - 1.9 + sit * 1.2).rotate(o.lean || 0).translate(0, 1.9);
  const MH = MB.translate(0, -5.45).rotate((o.tilt || 0) + (o.lean || 0) * .3).translate(turn * .1, -2.15 + (o.nod || 0));
  const use = M => ctx.setTransform(base.multiply(M));
  const at = (M, p) => { const q = M.transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; };
  ctx.save();
  // ground shadow (not squashed by the hop)
  if (!o.noShadow) { use(M0); c0shadow(ctx, hop, sit); }
  const E = [earPts(-1, o.earL, turn), earPts(1, o.earR, turn)];
  const SL = sleevePts(-1, o.armL), SR = sleevePts(1, o.armR);
  const far = turn > 0 ? 1 : 0; // facing screen-right, the screen-right ear/arm recedes
  // both ears sit behind the head outline; the pen pokes out from behind the head at the right ear;
  // the far arm goes behind the body when turned
  use(MH); drawEar(ctx, E[far], o, px, true); drawEar(ctx, E[1 - far], o, px, false);
  if (o.pen !== false) { ctx.save(); ctx.translate(1.55 + turn * .3, -1.25); ctx.rotate(deg(-24)); ink(ctx, rrect(-1.6, -.2, 3.2, .4, .14), { fill: o.col.pen, line: 3.4 * px, lineColor: o.col.line, boil: .6 * px, smooth: false }); fillPts(ctx, rect(1.0, -.2, .3, .4), INK.white, false); ink(ctx, [[1.6, -.2], [2.15, 0], [1.6, .2]], { fill: INK.fur, line: 3 * px, lineColor: o.col.line, boil: 0, smooth: false }); fillPts(ctx, ell(2.08, 0, .08, .08, 6), o.col.pen); ctx.restore(); }
  use(MB);
  if (Math.abs(turn) > .3) { const S = far === 0 ? SL : SR; ink(ctx, S.pts, { fill: o.col.hoodieDk, line: 4 * px, lineColor: o.col.line, boil: 1 * px }); drawPaw(ctx, o, far === 0 ? -1 : 1, S, far === 0 ? o.pawL : o.pawR, px); }
  // legs + feet
  use(M0.translate(0, -hop));
  const legs = o.legs || 'stand', ph = o.phase || 0, step = o.step || 0;
  for (const side of [-1, 1]) {
    let fx = side * (1.05 + step * .6), fy = -.3, lift = 0;
    if (legs === 'hop') { fx = side * .6; fy = hop > .1 ? .35 : -.3; }
    if (legs === 'run') { lift = Math.max(0, Math.sin(ph * TAU + (side > 0 ? Math.PI : 0))) * .9; fx = side * .8 + Math.cos(ph * TAU + (side > 0 ? Math.PI : 0)) * .7 * side; }
    const hip = [side * .8, -1.95 + sit * 1.2], ft = [fx, fy - lift];
    ink(ctx, tube([hip, [lerp(hip[0], ft[0], .5), lerp(hip[1], ft[1], .5)], ft], () => .95, 6), { fill: o.col.fur, shade: { color: o.col.furDk, spacing: 9 * px, dir: [.5, .85], from: -.3, to: .6 }, line: 3.8 * px, lineColor: o.col.line, boil: 1 * px, seed: side });
    const fr = side * .14 + (legs === 'hop' && hop > .1 ? side * .5 : 0);
    ink(ctx, ell(ft[0] + side * .15, ft[1], 1.02, .44, 18, fr), { fill: o.col.fur, shade: { color: o.col.furDk, spacing: 9 * px, dir: [0, 1], from: -.1, to: .5 }, line: 4 * px, lineColor: o.col.line, boil: 1 * px, seed: side * 2 });
    for (const k of [-.3, .05]) inkLine(ctx, [[ft[0] + side * (.45 + k), ft[1] + .05], [ft[0] + side * (.55 + k), ft[1] + .38]], 2.2 * px, o.col.line, { taper: [.2, .5] });
  }
  // hood collar, body
  use(MB);
  const body = [[-.85, -5.55], [-1.85, -5.05], [-2.08, -3.8], [-2.3, -2.05], [-1.25, -1.72], [0, -1.66], [1.25, -1.72], [2.3, -2.05], [2.08, -3.8], [1.85, -5.05], [.85, -5.55], [0, -5.35]];
  ink(ctx, body, { fill: o.col.hoodie, shade: { color: o.col.hoodieDk, spacing: 10 * px, dir: [.55, .83], from: -.4, to: 2.6, max: .95 }, line: 5 * px, lineColor: o.col.line, boil: 1.4 * px, seed: 11 });
  inkLine(ctx, [[-2.2, -2.45], [0, -2.08], [2.2, -2.45]], 3 * px, o.col.line, { taper: [.1, .1] });
  const pk = turn * .35, pocket = [[-1.3 + pk, -3.25], [1.3 + pk, -3.25], [1.55 + pk, -2.35], [-1.55 + pk, -2.35]];
  ink(ctx, pocket, { fill: mix(o.col.hoodie, o.col.hoodieDk, .25), line: 3.2 * px, lineColor: o.col.line, boil: 1 * px, smooth: false, seed: 12 });
  inkLine(ctx, [[-1.05 + pk, -3.2], [-1.3 + pk, -2.45]], 2.4 * px, o.col.line); inkLine(ctx, [[1.05 + pk, -3.2], [1.3 + pk, -2.45]], 2.4 * px, o.col.line);
  for (const side of [-1, 1]) { const a = [side * .34 + turn * .2, -5.25], b = [side * .44 + turn * .25, -4.15]; inkLine(ctx, [a, b], 5.4 * px, o.col.line, { taper: [0, .1] }); inkLine(ctx, [a, b], 3 * px, INK.white, { taper: [0, 0] }); fillPts(ctx, ell(b[0], b[1] + .1, .1, .16, 8), o.col.line); }
  // near arm(s) in front of the body
  const arms = Math.abs(turn) > .3 ? [far === 0 ? 1 : -1] : [-1, 1];
  for (const side of arms) { const S = side < 0 ? SL : SR; ink(ctx, S.pts, { fill: o.col.hoodie, shade: { color: o.col.hoodieDk, spacing: 10 * px, dir: [.55, .83], from: -.2, to: .8 }, line: 4.6 * px, lineColor: o.col.line, boil: 1.2 * px, seed: 20 + side }); drawPaw(ctx, o, side, S, side < 0 ? o.pawL : o.pawR, px); }
  // hood rolled behind the neck
  ink(ctx, [[-1.7, -5.25], [-1.1, -5.9], [0, -6.05], [1.1, -5.9], [1.7, -5.25], [.9, -5.45], [0, -5.3], [-.9, -5.45]], { fill: o.col.hoodieDk, line: 4 * px, lineColor: o.col.line, boil: 1 * px, seed: 13 });
  // head
  use(MH);
  const hp = headPts(turn);
  ink(ctx, hp, { fill: o.col.fur, shade: { color: o.col.furDk, spacing: 9 * px, dir: [.5, .86], from: .4, to: 2.6, max: .85 }, line: 5.4 * px, lineColor: o.col.line, boil: 1.4 * px, seed: 31 });
  // face
  const tx = turn * .85, fs = 1 - Math.abs(turn) * .3;
  const eL = [-.95 * (turn < 0 ? 1 : fs) + tx, -.15], eR = [.95 * (turn > 0 ? 1 : fs) + tx, -.15];
  if (o.blush) { ctx.save(); ctx.globalAlpha = clamp(o.blush); for (const e of [eL, eR]) { ctx.save(); clipPts(ctx, ell(e[0] + Math.sign(e[0] - tx) * .45, .72, .52, .3, 14)); dotsIn(ctx, [e[0] - 1.2, 0, e[0] + 1.2, 1.4], { color: o.col.cheek, spacing: 7 * px, k: () => .9 }); ctx.restore(); } ctx.restore(); }
  drawEye(ctx, eL[0], eL[1], turn < 0 ? 1 : fs, o, -1, px); drawEye(ctx, eR[0], eR[1], turn > 0 ? 1 : fs, o, 1, px);
  // brows
  const bt = (o.browTilt || 0), br = o.brows || 0;
  for (const [e, side] of [[eL, -1], [eR, 1]]) inkLine(ctx, [[e[0] - side * .38, e[1] - 1.05 - br - bt * .12], [e[0] + side * .32, e[1] - 1.12 - br + bt * .16]], 6 * px, o.col.line, { taper: [.3, .4] });
  drawMouth(ctx, tx * 1.08, .52, o, px);
  for (const side of [-1, 1]) for (const k of [0, 1]) inkLine(ctx, [[tx + side * .7, .62 + k * .18], [tx + side * 1.35, .5 + k * .32]], 1.8 * px, o.col.line, { taper: [.1, .7] });
  if (o.glasses) { for (const e of [eL, eR]) { ink(ctx, ell(e[0], e[1] + .05, .78, .72, 20), { line: 3.4 * px, lineColor: o.col.line, boil: .5 * px }); ctx.save(); ctx.globalAlpha = .35; fillPts(ctx, [[e[0] - .5, e[1] - .45], [e[0] - .1, e[1] - .6], [e[0] - .55, e[1] + .3]], INK.white); ctx.restore(); } inkLine(ctx, [[eL[0] + .72, eL[1]], [eR[0] - .72, eR[1]]], 3 * px, o.col.line, { taper: [0, 0] }); }
  // emotes
  if (o.sweat) { const k = clamp(o.sweat); ink(ctx, [[2.3, -1.9 + k * .4], [2.62, -1.1 + k * .4], [2.3, -.8 + k * .4], [1.98, -1.1 + k * .4]], { fill: INK.cyan, line: 3 * px, boil: .5 * px }); }
  if (o.anger) { ctx.save(); ctx.translate(1.9, -1.9); ctx.scale(o.anger, o.anger); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); inkLine(ctx, [[.15, -.55], [.15, -.15], [.55, -.15]], 5 * px, INK.red, { taper: [0, 0] }); } ctx.restore(); }
  if (o.sense) senseLines(ctx, o.sense, px, o.col.line);
  const out = { pawL: at(MB, [SL.wr[0] + SL.dir[0] * .32, SL.wr[1] + SL.dir[1] * .32]), pawR: at(MB, [SR.wr[0] + SR.dir[0] * .32, SR.wr[1] + SR.dir[1] * .32]),
    head: at(MH, [0, 0]), eyeL: at(MH, eL), eyeR: at(MH, eR), mouth: at(MH, [tx, .9]), earL: at(MH, E[0].tip), earR: at(MH, E[1].tip), chest: at(MB, [0, -4.3]), pocket: at(MB, [0, -2.8]), top: at(MH, [0, -2.1]) };
  ctx.setTransform(base); ctx.restore(); UPX = UPX0;
  return out;
}
function c0shadow(ctx, hop, sit) { const k = 1 / (1 + hop * .25); ctx.save(); ctx.globalAlpha = .25 * k; fillPts(ctx, ell(0, 0, 2.6 * k + sit * .4, .5 * k, 20), INK.ink); ctx.restore(); }
// Rabbit-sense: wavy squiggles radiating from the head (the Spider-Verse spider-sense, rabbit edition).
function senseLines(ctx, k, px, col) {
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * .95 + i / (n - 1) * Math.PI * .9 + (i > 3 ? .6 : 0) - .3, r0 = 2.8 + hash(i) * .3, r1 = r0 + 1.1 * k + hash(i + 9) * .4, pts = [];
    for (let j = 0; j <= 8; j++) { const r = lerp(r0, r1, j / 8), w = Math.sin(j * 2.2 + boilN(BOIL_T) * 1.7) * .16; pts.push([Math.cos(a) * r - Math.sin(a) * w, Math.sin(a) * r + Math.cos(a) * w]); }
    inkLine(ctx, pts, 4.4 * px, col, { taper: [.1, .5] });
  }
}
