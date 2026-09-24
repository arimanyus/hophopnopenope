// ink.js: the drawing kit. Shapes are point lists [[x, y], ...] traced as smooth closed splines.
// Look: flat ink colour + halftone-dot shading (never soft gradients) + tapered comic ink outlines that boil.

// ---------- shape generators ----------
function ell(cx, cy, rx, ry = rx, n = 32, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function rrect(x, y, w, h, r = 12) {
  r = Math.min(r, w / 2, h / 2); const p = [], q = 4;
  const c = (cx, cy, a0) => { for (let i = 0; i <= q; i++) { const a = a0 + i / q * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  c(x + w - r, y + r, -Math.PI / 2); c(x + w - r, y + h - r, 0); c(x + r, y + h - r, Math.PI / 2); c(x + r, y + r, Math.PI); return p;
}
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// irregular round blob (clouds, splats, rocks). amt = relative wobble.
function blob(cx, cy, r, seed = 1, amt = .18, n = 18, ry = r) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + (noise1(i * .9 + seed * 7.1) * .6 + (hash(seed * 31 + i) - .5) * .8) * amt; p.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * ry * k]); } return p; }
function star(cx, cy, r, inner = .45, n = 5, rot = -Math.PI / 2) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p; }
// comic burst / explosion balloon: spiky star with irregular spikes
function burstPts(cx, cy, r, n = 14, seed = 3, spike = .38) { const p = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + hash(seed + i) * .12, q = i % 2 ? r * (1 - spike * (.7 + .6 * hash(seed * 3 + i))) : r * (.92 + .16 * hash(seed * 7 + i)); p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p; }
function bezPts(p0, p1, p2, p3, n = 16) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; }
const xform = (pts, x, y, s = 1, rot = 0) => { const c = Math.cos(rot), si = Math.sin(rot); return pts.map(([a, b]) => [x + (a * c - b * si) * s, y + (a * si + b * c) * s]); };
function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }

// ---------- line boil ----------
// Hand-drawn jitter that re-seeds 12x/s. Neighbouring points move together so outlines wobble, not fizz.
// BOIL is the global boil amount multiplier (a shot can set it to 0 for a frozen/"paused" look).
let BOIL = 1, BOIL_T = 0;
// Size of one screen pixel in the current drawing units (the rabbit rig draws in units of s pixels and sets this).
let UPX = 1;
function boil(pts, amt = 1.6, seed = 0) {
  const s = boilN(BOIL_T) * 13.37 + seed * 3.1, a = amt * BOIL; if (!a) return pts;
  return pts.map(([x, y], i) => [x + noise1(i * .7 + s) * a, y + noise1(i * .7 + s + 50) * a]);
}

// ---------- path tracing ----------
// Catmull-Rom through the points. smooth=false gives straight segments (UI boxes, hard-edged props).
function tracePath(ctx, pts, closed = true, smooth = true) {
  const n = pts.length; ctx.moveTo(pts[0][0], pts[0][1]);
  if (!smooth || n < 3) { for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (closed) ctx.closePath(); return; }
  const P = i => closed ? pts[mod(i, n)] : pts[clamp(i, 0, n - 1)], m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
// Dense resampling of the same spline, for variable-width strokes.
function sampleSpline(pts, closed = true, smooth = true, step = 5) {
  const n = pts.length, out = [];
  if (!smooth || n < 3) {
    const m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n], k = Math.max(1, Math.ceil(dist(a, b) / step)); for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
    if (!closed) out.push(pts[n - 1]); return out;
  }
  const P = i => closed ? pts[mod(i, n)] : pts[clamp(i, 0, n - 1)], m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    const k = Math.max(2, Math.ceil(dist(p1, p2) / step)), seg = bezPts(p1, c1, c2, p2, k); seg.pop(); for (const q of seg) out.push(q);
  }
  if (!closed) out.push(pts[n - 1]); return out;
}

// ---------- fills ----------
function fillPts(ctx, pts, color, smooth = true) { ctx.beginPath(); tracePath(ctx, pts, true, smooth); ctx.fillStyle = color; ctx.fill(); }
function clipPts(ctx, pts, smooth = true) { ctx.beginPath(); tracePath(ctx, pts, true, smooth); ctx.clip(); }

// Halftone dots inside the current clip over box [x0, y0, x1, y1]. Dot coverage k (0..1) ramps along direction dir
// (unit vector pointing into the shadow) from `from` to `to` (distances measured from point c along dir).
// Pass k as a function (x, y) => 0..1 for custom masks. Coverage 1 = dots just touch (reads as solid tone).
function dotsIn(ctx, box, o = {}) {
  const sp = o.spacing || 10, ang = o.angle ?? Math.PI / 4, ca = Math.cos(ang), sa = Math.sin(ang);
  const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + sp;
  const dir = o.dir || [.6, .8], c = o.c || [cx, cy], from = o.from ?? -R * .2, to = o.to ?? R, kmin = o.min ?? 0, kmax = o.max ?? 1;
  const kf_ = typeof o.k === 'function' ? o.k : (x, y) => lerp(kmin, kmax, clamp(((x - c[0]) * dir[0] + (y - c[1]) * dir[1] - from) / (to - from)));
  const rMax = sp * .72 * (o.size || 1);
  ctx.beginPath();
  const nu = Math.ceil(R / sp);
  for (let u = -nu; u <= nu; u++) for (let v = -nu; v <= nu; v++) {
    const x = cx + (u * ca - v * sa) * sp, y = cy + (u * sa + v * ca) * sp;
    if (x < x0 - sp || x > x1 + sp || y < y0 - sp || y > y1 + sp) continue;
    const k = kf_(x, y); if (k <= .02) continue;
    const r = rMax * Math.sqrt(Math.min(k, 1.2)); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
  }
  ctx.fillStyle = o.color || INK.ink; ctx.fill();
}
// Halftone shading of a shape: dots clipped to pts. Typical: shade(ctx, body, {color: darker tone, dir, from, to}).
function shade(ctx, pts, o = {}) {
  ctx.save(); clipPts(ctx, pts, o.smooth ?? true); const b = bbox(pts);
  dotsIn(ctx, b, { c: [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], from: o.from ?? 0, to: o.to ?? (b[3] - b[1]) * .6, ...o }); ctx.restore();
}
// Parallel hatching clipped to pts (deep shadows, speed, texture). Lines only where the ramp along dir passes thresh.
function hatch(ctx, pts, o = {}) {
  ctx.save(); clipPts(ctx, pts, o.smooth ?? true);
  const [x0, y0, x1, y1] = bbox(pts), sp = o.spacing || 9, a = o.angle ?? -Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
  if (o.dir) { const d = o.dir, off = o.from ?? 0; ctx.beginPath(); ctx.moveTo(cx + d[0] * off - d[1] * 4 * R, cy + d[1] * off + d[0] * 4 * R); ctx.lineTo(cx + d[0] * off + d[1] * 4 * R, cy + d[1] * off - d[0] * 4 * R); ctx.lineTo(cx + d[0] * 4 * R + d[1] * 4 * R, cy + d[1] * 4 * R - d[0] * 4 * R); ctx.lineTo(cx + d[0] * 4 * R - d[1] * 4 * R, cy + d[1] * 4 * R + d[0] * 4 * R); ctx.clip(); }
  ctx.beginPath();
  for (let v = -R; v <= R; v += sp) { const jx = o.jit ? noise1(v * .3 + boilN(BOIL_T)) * o.jit * BOIL : 0; ctx.moveTo(cx - ca * R - sa * (v + jx), cy - sa * R + ca * (v + jx)); ctx.lineTo(cx + ca * R - sa * (v + jx), cy + sa * R + ca * (v + jx)); }
  ctx.strokeStyle = o.color || INK.ink; ctx.lineWidth = o.width || 2; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
}

// ---------- ink strokes ----------
// Variable-width stroke along dense points. wFn(s, normal) gives the width at arc-length fraction s.
function strokeVar(ctx, d, wFn, closed, color) {
  const n = d.length; if (n < 2) return;
  let L = 0; const acc = [0]; for (let i = 1; i < n; i++) { L += dist(d[i - 1], d[i]); acc.push(L); } if (closed) L += dist(d[n - 1], d[0]);
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const a = d[closed ? mod(i - 1, n) : Math.max(0, i - 1)], b = d[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx, w = wFn(acc[i] / (L || 1), nx, ny) / 2;
    left.push([d[i][0] + nx * w, d[i][1] + ny * w]); right.push([d[i][0] - nx * w, d[i][1] - ny * w]);
  }
  ctx.beginPath(); ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
  if (closed) { ctx.closePath(); ctx.moveTo(right[n - 1][0], right[n - 1][1]); for (let i = n - 2; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]); ctx.closePath(); }
  else for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.fillStyle = color; ctx.fill(closed ? 'evenodd' : 'nonzero');
  if (!closed) { // round caps
    const w0 = wFn(0, 0, 0) / 2, w1 = wFn(1, 0, 0) / 2; ctx.beginPath();
    if (w0 > .3) { ctx.moveTo(d[0][0] + w0, d[0][1]); ctx.arc(d[0][0], d[0][1], w0, 0, TAU); }
    if (w1 > .3) { ctx.moveTo(d[n - 1][0] + w1, d[n - 1][1]); ctx.arc(d[n - 1][0], d[n - 1][1], w1, 0, TAU); } ctx.fill();
  }
}
// LIGHT is the direction light comes FROM (screen space); outlines get heavier on the side facing away from it.
let LIGHT = [-.55, -.83];
// Closed comic outline. w = base weight; heavier on the shadow side, with a little pressure noise.
function outline(ctx, pts, w = 3, color = INK.ink, o = {}) {
  const d = sampleSpline(pts, true, o.smooth ?? true, o.step || 5 * UPX), seed = o.seed || 0, heavy = o.heavy ?? .6;
  strokeVar(ctx, d, (s, nx, ny) => w * (1 + heavy * clamp(-(nx * LIGHT[0] + ny * LIGHT[1]) * .9, -.5, 1)) * (1 + .18 * noise1(s * 9 + seed + boilN(BOIL_T) * .5 * BOIL)), true, color);
}
// Open tapered ink line. taper = [start, end] fractions of the length that thin to zero.
function inkLine(ctx, pts, w = 3, color = INK.ink, o = {}) {
  const d = sampleSpline(pts, false, o.smooth ?? true, o.step || 4 * UPX), [ta, tb] = o.taper || [.25, .25], seed = o.seed || 0;
  strokeVar(ctx, d, s => { let k = 1; if (ta > 0 && s < ta) k = Math.sqrt(s / ta); if (tb > 0 && s > 1 - tb) k = Math.min(k, Math.sqrt((1 - s) / tb)); return Math.max(.01, w * k * (1 + .15 * noise1(s * 7 + seed + boilN(BOIL_T) * BOIL))); }, false, color);
}

// ---------- all-in-one ----------
// ink(ctx, pts, {fill, shade: {color, dir, from, to, spacing} | null, hatch, line: weight | 0, lineColor, boil, smooth})
function ink(ctx, pts, o = {}) {
  const P = o.boil === 0 ? pts : boil(pts, o.boil ?? 1.4, o.seed || 0), sm = o.smooth ?? true;
  if (o.fill) fillPts(ctx, P, o.fill, sm);
  if (o.shade) shade(ctx, P, { smooth: sm, ...o.shade });
  if (o.hatch) hatch(ctx, P, { smooth: sm, ...o.hatch });
  if (o.line !== 0) outline(ctx, P, o.line ?? 3, o.lineColor || INK.ink, { smooth: sm, seed: o.seed, heavy: o.heavy });
  return P;
}

// ---------- comic effects ----------
// Radial action lines converging on (cx, cy). r0 = inner clear radius. Boils on twos.
function speedLines(ctx, cx, cy, o = {}) {
  const n = o.n || 90, r0 = o.r0 || 300, r1 = o.r1 || 1800, s = boilN(BOIL_T) * 7 + (o.seed || 0);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i + hash(s + i) * .8) / n * TAU, w = (o.w || 10) * (.3 + hash(s * 3 + i)), ri = r0 * (1 + hash(s * 5 + i) * .5);
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    ctx.moveTo(cx + ca * ri, cy + sa * ri); ctx.lineTo(cx + ca * r1 + px * w, cy + sa * r1 + py * w); ctx.lineTo(cx + ca * r1 - px * w, cy + sa * r1 - py * w); ctx.closePath();
  }
  ctx.fillStyle = o.color || INK.ink; ctx.fill();
}
// Parallel motion streaks (whip pans, falls). dir = unit vector of motion.
function streaks(ctx, box, o = {}) {
  const [x0, y0, x1, y1] = box, n = o.n || 40, dir = o.dir || [1, 0], s = boilN(BOIL_T) * 5 + (o.seed || 0), L = o.len || 400;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, hash(s + i * 1.3)), y = lerp(y0, y1, hash(s * 2 + i * 2.1)), l = L * (.4 + hash(s + i * 7)), w = (o.w || 4) * (.4 + hash(i * 3 + s));
    ctx.moveTo(x, y); ctx.lineTo(x - dir[0] * l - dir[1] * w, y - dir[1] * l + dir[0] * w); ctx.lineTo(x - dir[0] * l + dir[1] * w, y - dir[1] * l - dir[0] * w); ctx.closePath();
  }
  ctx.fillStyle = o.color || INK.ink; ctx.fill();
}
// Kirby krackle: clusters of black energy dots around a hit.
function krackle(ctx, cx, cy, r, o = {}) {
  const n = o.n || 40, s = boilN(BOIL_T) * 3 + (o.seed || 0); ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = hash(s + i) * TAU, d = r * (.5 + hash(s * 2 + i) * .8), rr = (o.size || 14) * (.3 + hash(s * 5 + i)); const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, TAU); }
  ctx.fillStyle = o.color || INK.ink; ctx.fill();
}
// Comic burst balloon with outline and optional halftone.
function burst(ctx, cx, cy, r, o = {}) {
  const p = burstPts(cx, cy, r, o.n || 14, o.seed ?? 3, o.spike ?? .38);
  return ink(ctx, p, { fill: o.fill || INK.yellow, shade: o.shade === undefined ? { color: rgba(o.dotColor || INK.orange, .9), spacing: o.spacing || 12, dir: [0, 1], from: -r * .3, to: r } : o.shade, line: o.line ?? 5, smooth: false, boil: o.boil ?? 2 });
}
