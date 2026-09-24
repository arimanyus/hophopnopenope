// c05_chorus2.js: chorus 2, the stage escalated (69.27-87.74). Blue/cyan/yellow stage, forty comment-bunnies, comic
// panels, the chair in the void, the acceleration crescendo, and an Evangelion title card on the drum fill.
(() => {
  const F1 = 1 / 24, BAGS = .4;
  const at = x => x - F1;                                          // hits land one frame before their sound
  const frameOf = x => Math.ceil(x * 24 - 1e-6) / 24;              // first frame at or after x
  const tw = (t, a) => a + Math.floor((t - a) * 12 + 1e-6) / 12;   // twos, phased so a pose lands on frame a
  const twh = (t, hits) => { let a = frameOf(at(hits[0])); for (const x of hits) if (t >= frameOf(at(x)) - 1e-6) a = frameOf(at(x)); return tw(t, a); }; // re-phased at every hit
  const HOP1 = [72.40, 72.771], NOPE = [75.535, 75.883], CLICK = [76.161, 76.696], HOP2 = [79.621, 80.132];
  const GREY = '#DCD6CA', GREYLN = '#6E6A78';

  // ---------- shared private helpers ----------
  function hops(t, times, d, h) { let a = { h: 0, sq: 0, vy: 0 }; for (const x of times) if (t >= at(x) - d * .18) a = hopArc(t, at(x), d, h); return a; }
  // flat colour field with a halftone ramp from y0 (no dots) to y1 (max)
  function field(c, col, dots, o = {}) {
    fillPts(c, rect(-60, -60, W + 120, H + 120), col, false);
    dotsIn(c, [-40, -40, W + 40, H + 40], { spacing: o.spacing || 36, color: dots, dir: [0, 1], from: (o.y0 ?? 150) - 540, to: (o.y1 ?? 1080) - 540, min: 0, max: o.max ?? .8 });
  }
  // cheap comment-bunny for crowds: flat fill, one stroke, dot eyes
  function bun(c, x, y, s, o = {}) {
    const u = s / 10, sq = o.sq || 0, ln = o.line || INK.ink, j = (hash(boilN(BOIL_T) * 1.3 + x * .07) - .5) * .3 * u * BOIL, ea = o.ears || 0;
    c.save(); c.translate(x, y - (o.hop || 0) * u); c.rotate(o.rot || 0); c.scale(1 + sq * .25, 1 - sq * .25);
    c.beginPath();
    for (const sd of [-1, 1]) c.ellipse(sd * (2.4 + ea) * u + j, -10.1 * u, 1.35 * u, 3.3 * u, sd * (.12 + ea * .2), 0, TAU);
    c.roundRect(-6.2 * u, -7.6 * u, 12.4 * u, 6.2 * u, 2.2 * u);
    c.moveTo(-1.2 * u, -1.6 * u); c.lineTo(-3.8 * u, .9 * u); c.lineTo(-3.4 * u, -1.6 * u); c.closePath();
    c.lineJoin = 'round'; c.lineWidth = Math.max(2.5, .85 * u); c.strokeStyle = ln; c.stroke(); c.fillStyle = o.fill || INK.white; c.fill();
    c.fillStyle = INK.earIn; c.beginPath(); for (const sd of [-1, 1]) c.ellipse(sd * (2.4 + ea) * u + j, -10 * u, .6 * u, 2.2 * u, sd * (.12 + ea * .2), 0, TAU); c.fill();
    const lx = (o.look || 0) * .5 * u; c.fillStyle = ln; c.beginPath();
    if (o.closed) { c.fillRect(-2.6 * u + lx, -4.9 * u, 1.4 * u, .45 * u); c.fillRect(1.2 * u + lx, -4.9 * u, 1.4 * u, .45 * u); }
    else for (const sd of [-1, 1]) c.ellipse(sd * 1.9 * u + lx, -4.8 * u, .6 * u, .75 * u, 0, 0, TAU);
    c.fill(); c.restore();
  }
  // the stage marquee, redrawn so it can fly in and out (x, y = top centre)
  function marquee(c, t, x, y, n) {
    ink(c, rrect(x - 440, y, 880, 190, 22), { fill: INK.ink, line: 6, boil: .8, smooth: false });
    for (let i = 0; i < 25; i++) { const on = (Math.floor(t * 12) + i) % 3 !== 0, px = x - 418 + i * 34.8; for (const py of [y + 17, y + 173]) fillPts(c, ell(px, py, 8, 8, 8), on ? INK.yellow : '#5A4A20'); }
    txt(c, `${PR.title} #${PR.num}`, x, y + 80, { font: 'ui', weight: 900, size: 46, color: INK.white, align: 'center' });
    txt(c, 'Actionable comments posted:', x - 50, y + 146, { font: 'ui', weight: 800, size: 38, color: INK.cyan, align: 'center' });
    txt(c, String(n), x + 318, y + 152, { font: 'ui', weight: 900, size: 70, color: INK.yellow, align: 'center' });
  }
  // stamp() with its worn-ink specks knocked out of the ink only (so it works on colour fields).
  // Lands fully on age 0 (the hit frame); the frame before it is a faint oversized approach.
  function slamStamp(ctx, s, x, y, size, age, o = {}) {
    if (age < -F1 - 1e-6) return;
    const k = age < 0 ? 1.45 : 1 + .05 * Math.exp(-age * 16) * Math.sin(age * 70), col = o.color || INK.red, f = { font: 'display', weight: 900, stretch: o.stretch ?? 0, size: size * k };
    const c = pushLayer(); c.setTransform(ctx.getTransform()); c.translate(x, y); c.rotate(o.rot ?? -.12);
    const m = measure(c, s, f), bw = m.w + size * .5, bh = size * 1.05 * k;
    c.lineWidth = size * .1; c.strokeStyle = col; c.strokeRect(-bw / 2, -bh / 2, bw, bh);
    txt(c, s, 0, size * .36 * k, { ...f, color: col, align: 'center' });
    c.globalCompositeOperation = 'destination-out';
    dotsIn(c, [-bw / 2 - 20, -bh / 2 - 20, bw / 2 + 20, bh / 2 + 20], { spacing: size * .13, color: '#000', k: (a, b) => clamp(.12 + noise2(a * .025 + 7, b * .025) * .55) });
    popLayer();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = age < 0 ? .45 : 1; ctx.drawImage(c.canvas, 0, 0); ctx.restore();
  }
  // the release ticker (private so its arrows can be coloured and it can smear solid). off = scroll px, blur 0..1
  const RELEASES = [['MODEL 5.6 SOL', '\u25B2'], ['6 ASTRA', '\u25B2\u25B2'], ['FLASH 3.8', '\u25B2'], ['NEW SOTA', '\u25B2'], ['NEW SOTA', '\u25B2']];
  function crawl(c, y, h, off, o = {}) {
    const size = o.size || 72, blur = clamp(o.blur || 0), lw = o.labelW ?? 300, f = { font: 'ui', weight: 900, size, stretch: -1 };
    fillPts(c, rect(-60, y, W + 120, h), INK.ink, false);
    const segs = []; let w = 0;
    for (const [s, up] of RELEASES) for (const [str, col] of [[s + ' ', INK.white], [up, INK.yellow], ['   \u00B7   ', rgba(INK.white, .45)]]) { segs.push([str, col, w]); w += measure(c, str, f).w; }
    c.save(); clipPts(c, rect(lw, y, W - lw + 60, h), false);
    const by = y + h * .5 + size * .36, n = 1 + Math.round(blur * 5);
    for (let k = n - 1; k >= 0; k--) {
      c.globalAlpha = k ? .28 * (1 - k / (n + 1)) : 1 - blur * .5;
      for (let x0 = lw - mod(off, w) - w; x0 < W + 60; x0 += w) for (const [s, col, sx] of segs) if (x0 + sx < W + 60 && x0 + sx + size * 10 > lw) txt(c, s, x0 + sx + k * blur * 70, by, { ...f, color: col });
    }
    c.globalAlpha = 1;
    if (blur > .4) streaks(c, [lw, y + 8, W + 400, y + h - 8], { dir: [-1, 0], n: 26, len: 700, w: 7, color: rgba(INK.white, clamp((blur - .4) * 1.4)), seed: 3 });
    if (blur > .8) { c.globalAlpha = clamp((blur - .8) / .2) * .85; fillPts(c, rect(lw, y + h * .2, W, h * .6), INK.yellow, false); c.globalAlpha = 1; }
    c.restore();
    if (lw) { fillPts(c, rect(0, y, lw, h), INK.cyan, false); txt(c, o.label || 'RELEASES', lw / 2, by - size * .08, { font: 'display', weight: 900, stretch: -2, size: size * .72, color: INK.ink, align: 'center' });
      inkLine(c, [[lw, y], [lw, y + h]], 5, INK.ink, { taper: [0, 0], smooth: false }); }
  }

  // ---------- 69.27 SLAM: forty bunnies erupt; the chart plots 3 -> 40 ----------
  const POP = [0, 1, 2, 3, 4].map(r => beatTime(163 + r * .5));      // eighth notes from the downbeat
  const GRID = [];
  { const ys = [1010, 918, 842, 780, 732], ss = [132, 106, 86, 70, 58], sp = [1900, 1660, 1480, 1320, 1180];
    for (let r = 4; r >= 0; r--) for (let i = 0; i < 8; i++) { const u = i / 7 - .5, aisle = r < 2 ? Math.sign(u) * (r ? 50 : 90) : 0;
      GRID.push({ x: 960 + u * sp[r] + aisle + (r % 2 ? 22 : 0), y: ys[r], s: ss[r], r, i }); } }
  function pop(t, tc, t0) {                                           // a bunny jumping out of the floor at t0
    if (t < at(t0)) return null;
    const a = Math.max(0, tc - at(t0)), air = .25, k = a / air;
    if (a < air) return { sc: lerp(.3, 1, easeOut(clamp(a / .09))), hop: 5.2 * Math.sin(Math.PI * k), sq: -.45 * Math.sin(Math.PI * k) * (1 - k), fresh: 1 - k };
    const b = a - air;
    return { sc: 1, hop: Math.max(0, Math.sin(frac(beatAt(tc + F1)) * Math.PI)) * .9 * (1 - Math.exp(-b * 4)), sq: .55 * Math.exp(-b * 11) * Math.cos(b * 28), fresh: 0 };
  }
  const CPTS = [[.142, '3', .159], [.525, '40', .534]];
  function slam(ctx, t) {
    const tc = twos(t), a0 = t - 69.27;
    const z = lerp(1.18, 1, backOut(clamp(a0 / .2), 1.3)) + seg(t, 69.45, 70.35) * .04;
    const sh = shake(t, 18 * Math.exp(-a0 * 8) + 6 * hit(t, POP.slice(1), 18));
    cam(ctx, 960 + sh[0], 560 + sh[1], z);
    stage(ctx, t, { a: INK.blue, b: INK.cyan, spin: .3, rays: 28, marquee: false, altarBtn: false, horizon: 640 });
    for (const g of GRID) {
      const p = pop(t, tc, POP[g.r]); if (!p) continue;
      if (p.fresh > .35) { const k = (p.fresh - .35) / .65; burst(ctx, g.x, g.y - g.s * .25, g.s * (.95 - .35 * k), { fill: INK.white, shade: null, line: 4, seed: g.i * 3 + g.r, spike: .5, n: 9 });
        fillPts(ctx, ell(g.x, g.y, g.s * .62, g.s * .14, 16), INK.ink); }
      (g.r >= 3 ? bun : commentBunny)(ctx, g.x, g.y, g.s * p.sc, { hop: p.hop, sq: p.sq, eyes: p.fresh > 0 ? 'wide' : 'happy' });
    }
    const land = Math.exp(-a0 * 8) * Math.cos(a0 * 24), jz = Math.sin(tc * TAU * 5) * 8, so = singOpen(t);
    rabbit(ctx, 960, 1012, 33, { sq: .4 * land, armL: { a: 148 + jz, e: 22 }, armR: { a: 148 - jz, e: 22 }, pawL: 'open', pawR: 'open',
      mouth: so > .05 ? 'open' : 'grin', open: so, ly: -.15, bags: BAGS, blush: .35, earL: { a: -14 - land * 10, b: land * 30 }, earR: { a: 12 + land * 10, b: -land * 30 } });
    ctx.restore();
    const mk = backOut(clamp(a0 / .12), 1.5), mo = easeIn(seg(t, 69.49, 69.6));
    if (mo < 1) marquee(ctx, t, 1400, lerp(-220, 30, mk) - mo * 280, 40);
    const ck = seg(threes(t), 69.72, 69.97);
    if (ck > 0) cutout(ctx, lerp(1990, 1340, backOut(ck, 1.2)), 66, 540, 420, .05, t, c => metrChart(c, 0, 0, 540, 420, t,
      { title: 'Comments per PR (0% read)', ylabels: ['1', '10', '100', '1K'], pts: CPTS, progress: t >= at(POP[4]) ? 1 : .5 }), { seed: 3 });
    misregFrame(ctx, 12 * Math.exp(-a0 * 9), 0);
  }

  // ---------- 70.32 three panels: V formation / release ticker / the watch at T-30 ----------
  const VF = [];
  for (let i = 0; i < 40; i++) { const sd = i % 2 ? 1 : -1, d = Math.pow(Math.floor(i / 2) / 19, .9);
    VF.push({ x: 960 + sd * lerp(175, 780, d), y: lerp(990, 580, d), s: lerp(116, 44, d), i }); }
  VF.sort((a, b) => a.y - b.y);
  function vForm(c, t) {
    const tc = twos(t), lt = t - 70.32, bt = beatAt(tc + F1), bob = Math.sin(frac(bt) * Math.PI), sd = Math.floor(bt) % 2 ? 1 : -1, up = hit(tc, [71.62], 4);
    cam(c, 960, 600 - lt * 22, 1.03 + lt * .04, (lt - 1) * .012);
    stage(c, t, { a: INK.blue, b: INK.yellow, spin: -.25, rays: 28, marquee: false, altarBtn: false, horizon: 520 });
    for (const b of VF) { const o = { hop: bob * 1.4 + up * 3.5, sq: -bob * .12, rot: sd * .09 * bob, eyes: 'happy' }; (b.s < 60 ? bun : commentBunny)(c, b.x, b.y, b.s, o); }
    const aL = up > .2 ? 168 : sd > 0 ? 150 : 40, aR = up > .2 ? 168 : sd > 0 ? 40 : 150;
    rabbit(c, 960, 1012, 27, { hop: bob * .6 + up * 1.5, armL: { a: aL, e: 15 }, armR: { a: aR, e: 15 }, pawL: up > .2 ? 'point' : 'open', pawR: up > .2 ? 'point' : 'open',
      lean: sd * 5 * bob, eyes: 'happy', mouth: 'grin', bags: BAGS, ...earsFor(bob * .5 * sd) });
    c.restore();
  }
  function tickerPanel(c, t) { fillPts(c, rect(0, 0, W, H), INK.ink, false); crawl(c, 445, 190, (t - at(70.937)) * 620 - 60, { size: 108, labelW: 380 }); }
  function watchPanel(c, t) {
    const tc = twos(t), n = clamp(Math.floor(beatAt(t + F1) - 168 + 1e-6), 0, 30);
    field(c, INK.night, INK.nightLt, { spacing: 30, y0: 0, y1: 1100 });
    pocketWatch(c, 960, 470, 360, { secs: clockSecs(16, 59, 30 + n), left: 30 - n, total: 90, rot: Math.sin(tc * 3.2) * .07 });
    txt(c, `T\u2212${30 - n}s`, 960, 1030, { font: 'mono', weight: 800, size: 150, color: INK.red, align: 'center', stroke: { w: 16, color: INK.ink } });
  }
  function trio(ctx, t) {
    const kB = backOut(seg(t, at(70.937), at(70.937) + .15), 1.3), kC = backOut(seg(t, at(71.378), at(71.378) + .13), 1.8), on = t >= at(70.937);
    const L = [{ r: on ? [lerp(0, 40, kB), lerp(0, 232, kB), lerp(W, 1840, kB), lerp(H, 808, kB)] : [0, 0, W, H], fn: vForm, at: [960, on ? lerp(540, 600, kB) : 540] }];
    if (on) L.push({ r: [40, lerp(-190, 40, kB), 1840, 170], fn: tickerPanel });
    if (t >= at(71.378)) { const w = 520 * lerp(1.3, 1, kC), h = 540 * lerp(1.3, 1, kC), cx = 1590, cy = 748;
      L.push({ r: [cx - w / 2 - 14, cy - h / 2 - 14, w + 28, h + 28], fn: c => fillPts(c, rect(0, 0, W, H), INK.paper, false) });
      L.push({ r: [cx - w / 2, cy - h / 2, w, h], fn: watchPanel, at: [960, 560] }); }
    panels(ctx, t, L, { gutter: INK.paper, border: 8 });
  }

  // ---------- 72.35 POINT CHOREO 1 (hop! hop!): chorus-1 framing, blue field, forty bunnies behind ----------
  const RISERS = [];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 10; i++)
    RISERS.push({ x: 960 + (i / 9 - .5) * [1500, 1600, 1700, 1800][r] + (r % 2 ? 40 : -40), y: [560, 640, 735, 845][r], s: [44, 52, 62, 74][r], r, i });
  function crowd(ctx, fn) {                                            // back risers defocused, front risers in focus
    depth(ctx, 7, c => { for (const b of RISERS) if (b.r < 2) bun(c, b.x, b.y, b.s, fn(b, true)); });
    for (const b of RISERS) if (b.r >= 2) commentBunny(ctx, b.x, b.y, b.s, fn(b, false));
  }
  function hopChoreo(ctx, t) {
    const tc = twh(t, HOP1), a = hops(tc, HOP1, .3, 3.1), air = a.h > .25;
    field(ctx, INK.blue, INK.blueDk, { y0: 250, y1: 1150 });
    crowd(ctx, () => ({ hop: a.h * 5.4, sq: a.sq, eyes: air ? 'happy' : 'dot', closed: air }));
    rabbit(ctx, 960, 985, 40, { hop: a.h, sq: a.sq, legs: 'hop', ...earsFor(a.vy), armL: { a: air ? 152 : 35, e: 20 }, armR: { a: air ? 152 : 35, e: 20 }, pawL: 'open', pawR: 'open',
      eyes: air ? 'happy' : 'open', mouth: air ? 'grin' : 'smile', bags: BAGS });
    sfx(ctx, 'HOP!', 520, 300, 205, t - at(HOP1[0]) + .05, { rot: -.14, life: 1.4 });
    sfx(ctx, 'HOP!', 1410, 300, 205, t - at(HOP1[1]) + .05, { rot: .12, life: 1.4 });
  }

  // ---------- 73.00 the chair in the void (developer), 74.50 the inversion (rabbit) ----------
  const CH = { x: 960, y: 858, s: .95 };
  function voidSet(c) {
    fillPts(c, rect(-700, -700, W + 1400, H + 1400), INK.ink, false);
    const cone = [[900, -120], [1020, -120], [1350, 872], [570, 872]];
    c.save(); c.globalAlpha = .12; fillPts(c, cone, INK.paper, false); c.restore();
    dotsIn(c, [440, -120, 1480, 880], { spacing: 20, color: rgba(INK.paper, .2), k: (x, y) => { const hw = lerp(60, 390, (y + 120) / 992), d = Math.abs(x - 960) - hw; return d < 0 ? 0 : clamp(.9 - d / 110); } });
    fillPts(c, ell(960, 872, 470, 78, 40), mix(INK.ink, INK.paper, .22));
    dotsIn(c, [420, 770, 1500, 980], { spacing: 18, color: rgba(INK.paper, .22), k: (x, y) => { const e = Math.hypot((x - 960) / 470, (y - 872) / 78); return e < 1 ? 0 : clamp(1.5 - e) * 1.8; } });
  }
  // folding metal chair, 3/4 front view. (x, y) = floor point under the seat; seat top at y - 236 s
  function foldChair(c, x, y, s, part) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const M = '#9C9AA8', MD = '#4A4858', P = (pts, w, col = MD) => inkLine(c, pts, w, col, { taper: [0, 0], smooth: false });
    if (part !== 'front') {
      c.save(); c.globalAlpha = .75; for (const [fx, fy] of [[-150, -4], [150, -4], [-122, -40], [122, -40]]) fillPts(c, [[fx - 8, fy], [fx + 8, fy], [fx + (fx) * .9 + 26, fy + 92], [fx + fx * .9 + 6, fy + 96]], INK.ink, false); c.restore();
      for (const sd of [-1, 1]) { P([[sd * 122, -40], [sd * 116, -600]], 20); P([[sd * 122, -40], [sd * 150, -236]], 14); }
      ink(c, rrect(-150, -610, 300, 126, 16), { fill: M, shade: { color: MD, spacing: 14, dir: [0, 1], from: -10, to: 90 }, line: 5, boil: .8, smooth: false });
      ink(c, [[-168, -250], [168, -250], [150, -214], [-150, -214]], { fill: mix(M, INK.white, .3), line: 5, boil: .8, smooth: false });
    }
    if (part !== 'back') for (const sd of [-1, 1]) { P([[sd * 152, -216], [sd * 152, -4]], 18); P([[sd * 152, -120], [sd * 122, -60]], 10); }
    c.restore();
  }
  function slumped(c, t) {                                             // the developer hunched forward, elbows on knees, face in hands (chair coords)
    const S = '#0B0D1E', br = Math.sin(twos(t) * 2.2), L = (pts, w) => inkLine(c, pts, w, S, { taper: [0, 0] }), rim = rgba(INK.paper, .7);
    for (const sd of [-1, 1]) { L([[sd * 74, -226], [sd * 90, -28]], 62); ink(c, ell(sd * 100, -16, 60, 22, 16), { fill: S, line: 4, boil: .8 }); ink(c, ell(sd * 70, -240, 74, 48, 18), { fill: S, line: 4, boil: .8 }); }
    c.save(); c.translate(0, -236 + br); c.scale(1.06, .6 + br * .004); devShadow(c, 0, 0, 300, { glare: 0 }); c.restore();
    for (const sd of [-1, 1]) { L([[sd * 150, -330], [sd * 118, -252]], 54); L([[sd * 112, -250], [sd * 30, -398]], 46); }
    ink(c, ell(0, -408, 58, 34, 16), { fill: S, line: 4, boil: .8 });
    for (const sd of [-1, 1]) ink(c, ell(sd * 30, -438, 22, 10, 10), { fill: INK.cyan, line: 3, lineColor: INK.white, boil: .4 });
    inkLine(c, [[-64, -484 + br], [0, -500 + br], [64, -484 + br]], 7, rim, { taper: [.2, .2] });
    for (const sd of [-1, 1]) inkLine(c, [[sd * 80, -440 + br], [sd * 150, -350]], 6, rgba(INK.paper, .5), { taper: [.2, .6] });
  }
  const PROMPTS = [
    { s: 'What do you want to build?', x: 80, y: 110, w: 920, size: 58, t0: 73.0 },
    { s: 'What can I help you ship?', x: 1040, y: 62, w: 830, size: 52, t0: 73.26 },
    { s: 'Start a new agent', x: 1200, y: 322, w: 610, size: 50, t0: 73.49 },
    { s: '   Generate', x: 120, y: 392, w: 480, size: 50, t0: 73.76, spark: 1 },
    { s: 'Run 64 agents in parallel?', x: 1050, y: 606, w: 830, size: 48, t0: 73.91 },
    { s: 'Ask anything', x: 100, y: 656, w: 520, size: 50, t0: 74.12 },
  ];
  const SMALL = [];                                                    // background copies that multiply
  for (let i = 0; SMALL.length < 36 && i < 600; i++) {
    const w = hrange(i * 2.7 + 5, 260, 420), x = hrange(i * 3.1 + 1, -60, 1900 - w), y = hrange(i * 7.7 + 2, 20, 840);
    if (x + w > 700 && x < 1220 && y > 200) continue;
    if (SMALL.some(q => Math.abs(q.x - x) < 240 && Math.abs(q.y - y) < 80)) continue;
    SMALL.push({ x, y, w, s: PROMPTS[i % 6].s.trim(), t0: 74.1 + SMALL.length * .011 + Math.pow(SMALL.length / 36, .5) * .3 });
  }
  function card(c, p, t, i, sc = 1) {
    const k = backOut(clamp((t - at(p.t0)) / .14), 2.2); if (t < at(p.t0)) return;
    const h = (p.size || 30) * 2.4, bob = wob(t, .23, i * .37) * 9;
    c.save(); c.translate(p.x + p.w / 2, p.y + h / 2 + bob); c.rotate((hash(i * 4.1) - .5) * .06); c.scale(k * sc, k * sc); c.translate(-p.w / 2, -h / 2);
    promptBox(c, 0, 0, p.w, t, { text: p.s, h, size: p.size || 30 });
    if (p.spark) ink(c, star(58, h * .5, p.size * .42, .32, 4, 0), { fill: INK.yellow, line: 3, boil: .5, smooth: false });
    c.restore();
  }
  function chairShot(ctx, t, lt) {
    const z = 1 + lt * .04, d = drift(t, 7, .35), view = c => cam(c, 960 + d[0], 540 + d[1], z);
    depth(ctx, 9, c => { view(c); voidSet(c); SMALL.forEach((p, i) => { if (t >= at(p.t0)) card(c, { ...p, size: 28 }, t, i + 20, .9); }); c.restore(); });
    view(ctx);
    foldChair(ctx, CH.x, CH.y, CH.s, 'back');
    ctx.save(); ctx.translate(CH.x, CH.y); ctx.scale(CH.s, CH.s); slumped(ctx, t); ctx.restore();
    foldChair(ctx, CH.x, CH.y, CH.s, 'front');
    PROMPTS.forEach((p, i) => card(ctx, p, t, i));
    ctx.restore();
  }
  const FLOAT = PROMPTS.map((p, i) => ({ x: p.x + p.w / 2 + (i % 2 ? 40 : -40), y: p.y + p.size * 1.2 + 70, s: [150, 138, 120, 118, 130, 120][i], d: 0 }));
  for (let i = 0; FLOAT.length < 40 && i < 2000; i++) {
    const x = hrange(i * 3.9 + 4, 60, 1860), y = hrange(i * 6.1 + 8, 110, 860), s = hrange(i * 1.7, 46, 92);
    if (x > 700 && x < 1220 && y > 240) continue;
    if (FLOAT.some(q => Math.hypot(q.x - x, (q.y - y) * 1.4) < (q.s + s) * .62)) continue;
    FLOAT.push({ x, y, s, d: s < 62 ? 2 : 1 });
  }
  function inversion(ctx, t, lt) {
    const tc = twos(t), z = 1.06 + lt * .045, d = drift(t, 7, .35), view = c => cam(c, 960 + d[0], 540 + d[1], z);
    const fl = (c, f, i) => { const bob = wob(tc, .21, i * .43) * 10, o = { eyes: 'sad', look: clamp((960 - f.x) / 500, -1, 1), rot: (hash(i * 3.3) - .5) * .3 + wob(tc, .17, i * .2) * .05 };
      if (f.d === 2) bun(c, f.x, f.y + bob, f.s, o); else commentBunny(c, f.x, f.y + bob, f.s, o);
      if (f.d < 2) fillPts(c, ell(f.x + f.s * .56, f.y + bob - f.s * .72, f.s * .09, f.s * .09, 12), INK.cyan); };
    depth(ctx, 9, c => { view(c); voidSet(c); FLOAT.forEach((f, i) => { if (f.d === 2) fl(c, f, i); }); c.restore(); });
    view(ctx);
    foldChair(ctx, CH.x, CH.y, CH.s, 'back');
    const seat = CH.y - 236 * CH.s, s = 25;
    rabbit(ctx, CH.x, seat + .46 * s, s, { sit: 1, nod: .35, lids: .55, ly: .8, bags: BAGS, mouth: 'flat', noShadow: true,
      earL: { a: -58 + wob(tc, .3) * 3, b: -62 }, earR: { a: 64, b: 74 }, armL: { a: 14, e: 20 }, armR: { a: 14, e: 20 }, tilt: -4 });
    foldChair(ctx, CH.x, CH.y, CH.s, 'front');
    FLOAT.forEach((f, i) => { if (f.d < 2) fl(ctx, f, i); });
    ctx.restore();
  }

  // ---------- 75.50 POINT CHOREO 2 (nope! nope!): cursor wag, NOPE stamps, head-whip, forty heads shaking ----------
  function nopeChoreo(ctx, t) {
    const tc = twh(t, NOPE);
    field(ctx, INK.blue, INK.blueDk, { y0: 250, y1: 1150 });
    const shk = (i, tt) => { let v = 0; for (const x of NOPE) { const a = tt - at(x); if (a >= 0) v = Math.sin(a * TAU * 4.5 + i * .35) * .3 * Math.exp(-a * 4); } return v; };
    crowd(ctx, b => ({ rot: shk(b.i + b.r, tc), eyes: 'dot', look: -Math.sign(shk(b.i + b.r, tc)) }));
    // head whip: direction flips on each nope (on ones), with a ghost of the previous pose as the smear
    const dir = t >= at(NOPE[1]) ? -1 : 1, a = t - at(t >= at(NOPE[1]) ? NOPE[1] : NOPE[0]), k = clamp(a / .07), set = lerp(0, 1, k) + Math.sin(clamp(a / .3) * Math.PI) * .25 * (1 - clamp(a / .3));
    const head = d => ({ turn: d * .75, tilt: d * 13, lean: d * 3, earL: { a: -14 - d * 26 * (1 - clamp(a / .4)), b: -d * 40 * (1 - clamp(a / .4)) }, earR: { a: 12 - d * 26 * (1 - clamp(a / .4)), b: -d * 40 * (1 - clamp(a / .4)) } });
    const pose = { eyes: a < .2 ? 'wide' : 'open', lids: a < .2 ? 0 : .45, mouth: a < .2 ? 'o' : 'flat', bags: BAGS, armL: { a: 12, e: 12 }, armR: { a: 12, e: 12 } };
    const prev = t >= at(NOPE[1]) ? 1 : 0;
    if (a < .1) { ctx.save(); ctx.globalAlpha = .35; rabbit(ctx, 960, 985, 40, { ...pose, ...head(prev), noShadow: true }); ctx.restore();
      streaks(ctx, [760, 460, 1160, 700], { dir: [dir, 0], n: 12, len: 260, w: 6, color: rgba(INK.white, .8), seed: 7 }); }
    rabbit(ctx, 960, 985, 40, { ...pose, ...head(dir * set) });
    // the cursor wags like a no-no finger, pivoting at its base
    const up = .43, w = t >= at(NOPE[1]) ? lerp(up + .5, up - .5, elasticOut(clamp((t - at(NOPE[1])) / .32))) : lerp(up - .2, up + .5, elasticOut(clamp((t - at(NOPE[0])) / .32)));
    const S = 250, bx = 1440, by = 470, px = .42 * S, py = .92 * S, ca = Math.cos(w), sa = Math.sin(w);
    cursor(ctx, bx - (px * ca - py * sa), by - (px * sa + py * ca), S, { rot: w, label: 'you' });
    slamStamp(ctx, 'NOPE', 520, 330, 280, t - at(NOPE[0]), { color: INK.red, rot: -.16 });
    slamStamp(ctx, 'NOPE', 1470, 700, 310, t - at(NOPE[1]), { color: INK.red, rot: .1 });
    misregFrame(ctx, 12 * hit(t, NOPE, 14), 0);
  }

  // ---------- 76.10 click, click: the cursor army and the Accept All button ----------
  const ARMY = [];
  { const rows = [[500, 54, 12, 1360], [580, 72, 11, 1440], [676, 96, 10, 1500], [786, 126, 7, 1380]];
    rows.forEach(([y, s, n, span], r) => { for (let i = 0; i < n; i++) ARMY.push({ x: 960 + (n === 1 ? 0 : (i / (n - 1) - .5) * span) + (r % 2 ? 30 : -30), y, s, r, i }); }); }
  const CLK = [76.161, 76.696, 77.067];
  function odometer(c, x, y, v, o = {}) {                            // rolling drum digits; (x, y) = centre
    const n = o.digits || 7, dw = o.dw || 70, dh = o.dh || 104, w = n * dw + 40;
    ink(c, rrect(x - w / 2, y - dh / 2 - 16, w, dh + 32, 12), { fill: INK.ink, line: 5, boil: .6, smooth: false });
    for (let p = 0; p < n; p++) {
      const d = mod(v / Math.pow(10, n - 1 - p), 10), dx = x - w / 2 + 20 + p * dw;
      c.save(); clipPts(c, rect(dx + 4, y - dh / 2, dw - 8, dh), false); fillPts(c, rect(dx + 4, y - dh / 2, dw - 8, dh), INK.white, false);
      const f = frac(d), i0 = Math.floor(d);
      for (const [k, dd] of [[0, i0], [1, (i0 + 1) % 10]]) txt(c, String(dd), dx + dw / 2, y + dh * .33 - f * dh + k * dh, { font: 'mono', weight: 800, size: dh * .86, color: INK.ink, align: 'center' });
      fillPts(c, rect(dx + 4, y - dh / 2, dw - 8, dh * .16), rgba(INK.ink, .3), false); fillPts(c, rect(dx + 4, y + dh * .34, dw - 8, dh * .16), rgba(INK.ink, .3), false);
      c.restore();
    }
  }
  function clickArmy(ctx, t) {
    const tc = twos(t), last = lastOf(t, CLK.map(x => x)), a = last === null ? 9 : t - at(last), cl = clamp(a / .28);
    const lunge = last === null ? 0 : Math.exp(-a * 9), pre = CLK.reduce((m, x) => { const d = at(x) - t; return d > 0 && d < .18 ? Math.max(m, 1 - d / .18) : m; }, 0);
    const z = 1 + .05 * lunge + seg(t, 76.1, 77.3) * .07, sh = shake(t, 10 * lunge), bt = beatAt(tc + F1) * 2;
    cam(ctx, 960 + sh[0], 520 + sh[1], z, Math.sin(t * 1.3) * .008);
    field(ctx, INK.blue, INK.blueDk, { y0: 300, y1: 1300 });
    speedLines(ctx, 960, 250, { n: 70, r0: 520, r1: 2200, w: 14, color: rgba(INK.cyan, .45 + .4 * lunge) });
    const v = t < at(CLK[0]) ? 0 : t < at(CLK[1]) ? 40 + (t - at(CLK[0])) * 180 : 1600 + Math.pow(Math.max(0, t - at(CLK[1])), 2.2) * 2.4e6;
    odometer(ctx, 960, 420, v);
    txt(ctx, 'CLICKS', 960, 348, { font: 'ui', weight: 900, size: 30, color: INK.white, align: 'center', track: 6 });
    if (lunge > .05) burst(ctx, 960, 200, 620 + 120 * (1 - lunge), { fill: rgba(INK.yellow, .9 * lunge), shade: null, line: 0, seed: CLK.indexOf(last) + 3, n: 16, spike: .45 });
    button(ctx, 440, 100, 1040, 200, 'Accept All', { fill: lunge > .5 ? mix(INK.green, INK.white, .35) : INK.green, size: 118, press: lunge * 2 });
    for (const [bx, sd] of [[170, -1], [1750, 1]]) for (let k = 0; k < 3; k++) agentBot(ctx, bx - sd * k * 26, 560 + k * 150, 92 - k * 6, { clap: lunge > .3 ? 1 : .15, bob: Math.sin(tc * 9 + k) * .5 });
    for (const q of ARMY) {
      const ripple = t > 76.85 ? Math.max(0, Math.sin((t - 76.85) * 30 - q.i * .7 - q.r)) : 0, ck = Math.max(last === null ? 0 : cl < 1 ? cl : 0, ripple * .7);
      const x = q.x, y = q.y - lunge * 34 + pre * 16 * (q.r + 1) - Math.abs(Math.sin((bt + (q.r % 2) * .5) * Math.PI)) * q.s * .08;
      if (ck > 0 && ck < 1) { ctx.save(); ctx.globalAlpha = 1 - ck; ctx.beginPath(); ctx.arc(x, y, 14 + ck * q.s * .75, 0, TAU); ctx.lineWidth = q.s * .11 * (1 - ck) + 2; ctx.strokeStyle = INK.white; ctx.stroke(); ctx.restore(); }
      cursor(ctx, x, y, q.s, { rot: .43, label: q.r === 3 && q.i === 3 ? 'you' : false, click: ck, color: INK.yellow });
    }
    ctx.restore();
    misregFrame(ctx, 10 * lunge, 0);
  }

  // ---------- 77.30 resolve all: a domino cascade into a grey barcode ----------
  const DOM = []; for (let i = 0; i < 40; i++) DOM.push({ x: 180 + i * 80 + (hash(i * 2.9) - .5) * 26, w: [14, 22, 34, 50][Math.floor(hash(i * 5.3 + 1) * 4)], guard: i < 2 || i === 19 || i === 20 || i > 37 });
  const DOM0 = 77.38, domT = i => at(DOM0) + .04 + i * .0115;
  function domino(ctx, t) {
    const tc = twos(t), G = 640;
    const [cx, cy, z] = kf(t, [[77.30, [470, 560, 1.7]], [77.64, [1720, 560, 1.0]], [77.9, [1740, 540, .56]]], easeInOut);
    cam(ctx, cx, cy, z);
    fillPts(ctx, rect(-600, -600, 4400, 2200), INK.white, false);
    for (let i = 0; i < 40; i++) fillPts(ctx, rect(-600, 100 + i * 52, 4400, 22), i % 5 === 2 ? '#EFE6D6' : '#F4EEE4', false);
    inkLine(ctx, [[-600, G + 2], [4000, G + 2]], 5, GREYLN, { taper: [0, 0], smooth: false });
    DOM.forEach((d, i) => {
      const f = (tc - domT(i)) / .1;
      if (f < 0) { const near = clamp(1 + f / 3); commentBunny(ctx, d.x, G, 64, { eyes: near > .3 ? 'wide' : 'dot', look: -near, rot: -near * .05 }); return; }
      if (f < .5) { commentBunny(ctx, d.x + 30 * f, G, 64, { rot: f / .5 * .7, eyes: 'x', sq: -.1 }); return; }
      const e = easeOut(clamp((f - .5) / .5)), bw = lerp(70, d.w, e), bh = lerp(70, 520, e), low = d.guard ? 60 * e : 0;
      ink(ctx, rect(d.x - bw / 2 + 18 * (1 - e), G - bh, bw, bh + low), { fill: mix(GREY, GREYLN, .55), line: 4, lineColor: GREYLN, boil: .6, smooth: false });
      if (e > .9) txt(ctx, '\u2713', d.x, G - bh - 14, { font: 'ui', weight: 900, size: 40, color: GREYLN, align: 'center' });
    });
    if (t > 77.8) txt(ctx, '4 812 040 000 0  \u00B7  40 RESOLVED  \u00B7  0 READ', 1740, G + 110, { font: 'mono', weight: 800, size: 74, color: INK.ink, align: 'center', track: 6, alpha: clamp((t - 77.8) * 12) });
    if (t < DOM0 + .2) { const k = clamp((t - 77.30) / (at(DOM0) - 77.30)); cursor(ctx, lerp(-40, 108, easeOut(k)), G - 50, 110, { rot: -.2, click: t >= at(DOM0) ? clamp((t - at(DOM0)) / .2) : 0 }); }
    ctx.restore();
  }

  // ---------- 78.03 thumbs up: a rain of reactions, 40 of them ----------
  const TH = [];
  for (let i = 0; i < 40; i++) { const x = hrange(i * 3.3 + 2, 150, 1770), onHead = Math.abs(x - 960) < 170;
    TH.push({ t0: 78.03 + Math.pow(i / 40, .85) * .58, x, s: hrange(i * 5.1, 70, 130), r: hrange(i * 9.7, -.7, .7), y1: onHead ? 575 - (i % 5) * 34 : hrange(i * 2.2, 800, 850), onHead }); }
  function thumbsRain(ctx, t) {
    const tc = twos(t), lt = t - 78.03;
    cam(ctx, 960, 540 + lt * 14, 1 + lt * .05);
    stage(ctx, t, { a: INK.blue, b: INK.cyan, spin: .2, rays: 28, marquee: false, altarBtn: false, horizon: 760 });
    let landed = 0, bonk = 0;
    const drawn = [];
    for (const th of TH) { const a = tc - th.t0; if (a < 0) continue; const k = clamp(a / .26), y = lerp(-180, th.y1, k * k);
      if (k >= 1) { landed++; if (th.onHead) bonk = Math.max(bonk, Math.exp(-(a - .26) * 9)); }
      drawn.push([th, y, k]); }
    const hb = TH.filter(q => q.onHead && tc - q.t0 > .26).length;
    rabbit(ctx, 960, 900, 34, { eyes: bonk > .3 ? 'closed' : 'open', lids: .5, mouth: 'flat', bags: BAGS, sq: bonk * .25, nod: bonk * .3,
      earL: { a: -14 - hb * 7, b: -Math.min(80, hb * 16) }, earR: { a: 12 + hb * 7, b: Math.min(80, hb * 16) }, armL: { a: 10, e: 10 }, armR: { a: 10, e: 10 } });
    for (const [th, y, k] of drawn) thumbsUp(ctx, th.x, y, th.s, { rot: th.r + (1 - k) * 2 });
    ctx.restore();
    const pk = backOut(clamp((t - at(78.06)) / .14), 2), n = Math.max(1, Math.min(40, drawn.length));
    ctx.save(); ctx.translate(330, 190); ctx.scale(pk, pk); ctx.rotate(-.04);
    ink(ctx, rrect(-230, -95, 460, 190, 95), { fill: INK.white, line: 6, boil: .6, smooth: false }); fillPts(ctx, rrect(-222, -87, 444, 174, 87), rgba(INK.blue, .12), false);
    thumbsUp(ctx, -110, 30, 105, { rot: -.1 }); txt(ctx, String(n), 60, 52, { font: 'ui', weight: 900, size: 132, color: INK.blue, align: 'center' });
    ctx.restore();
  }

  // ---------- 78.85 amen: a stadium choir of forty bots, LGTM, and the RSI speedometer ----------
  const CHOIR = [];
  [[12, 240, 700, 50], [11, 336, 620, 60], [9, 440, 540, 72], [8, 552, 470, 84]].forEach(([n, y, rx, s], r) => {
    for (let i = 0; i < n; i++) { const a = (i / (n - 1) - .5) * 2.4; CHOIR.push({ x: 960 + Math.sin(a) * (rx + 380), y: y + (1 - Math.cos(a)) * 90, s, r, i }); } });
  function gauge(c, t, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    const cx = w * .5, cy = h * .78, R = h * .62, arc = (a0, a1, col) => { c.beginPath(); c.arc(cx, cy, R, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI); c.lineWidth = R * .2; c.strokeStyle = col; c.stroke(); };
    arc(0, .5, INK.green); arc(.5, .75, INK.yellow); arc(.75, 1, INK.red);
    c.beginPath(); c.arc(cx, cy, R + R * .1, Math.PI, 0); c.lineWidth = 6; c.strokeStyle = INK.ink; c.stroke();
    ['1\u00D7', '2\u00D7', '4\u00D7', '8\u00D7', '\u221E'].forEach((s, i) => { const a = Math.PI + i / 4 * Math.PI; txt(c, s, cx + Math.cos(a) * R * .7, cy + Math.sin(a) * R * .7 + 20, { font: 'ui', weight: 900, size: 52, color: INK.ink, align: 'center' }); });
    txt(c, 'RSI', cx, cy + 20, { font: 'display', weight: 900, stretch: -2, size: 130, color: INK.ink, align: 'center' });
    c.save(); c.translate(w * .2, h * .12); c.rotate(-.1);
    ink(c, rect(0, 0, 260, 250), { fill: INK.white, line: 8, boil: 1.2, smooth: false });
    txt(c, 'SPEED', 130, 80, { font: 'hand', weight: 800, size: 62, color: INK.ink, align: 'center' }); txt(c, 'LIMIT', 130, 150, { font: 'hand', weight: 800, size: 62, color: INK.ink, align: 'center' });
    txt(c, '(please)', 130, 215, { font: 'hand', weight: 800, size: 40, color: INK.red, align: 'center' });
    inkLine(c, [[130, 250], [150, 420]], 14, INK.ink, { taper: [0, 0] }); c.restore();
    const na = kf(t, [[79.36, .08], [79.42, .7], [79.47, 1.02], [79.56, .96]], easeOut) + Math.sin(t * 90) * .012;
    const a = Math.PI + na * Math.PI;
    inkLine(c, [[cx - Math.cos(a) * 40, cy - Math.sin(a) * 40], [cx + Math.cos(a) * R * .95, cy + Math.sin(a) * R * .95]], 18, INK.red, { taper: [0, .8] });
    ink(c, ell(cx, cy, 34, 34, 20), { fill: INK.ink, line: 0, boil: 0 });
  }
  function amen(ctx, t) {
    const tc = twos(t), lt = t - 78.85, am = t - at(78.88), ph = frac(beatAt(tc + F1) * 2), clap = Math.max(hit(t, [78.88], 5), Math.sin(ph * Math.PI));
    const view = c => cam(c, 960, 560 - lt * 40, 1.03 + lt * .07, -.01 + lt * .02);
    view(ctx);
    stage(ctx, t, { a: INK.blue, b: INK.cyan, spin: .12, rays: 28, marquee: false, altarBtn: false, horizon: 720, altar: .7 + .3 * Math.sin(ph * Math.PI) });
    const bot = (c, q) => agentBot(c, q.x, q.y, q.s, { bob: Math.sin(ph * Math.PI) * .9, clap: clamp(clap), say: q.r === 3 && (q.i === 1 || q.i === 6) ? 'LGTM!' : null, saySize: 34 });
    depth(ctx, 6, c => { view(c); for (const q of CHOIR) if (q.r < 2) bot(c, q); c.restore(); });
    for (const q of CHOIR) if (q.r >= 2) bot(ctx, q);
    button(ctx, 610, 600, 700, 130, 'Merge pull request', { fill: INK.green, size: 56 });
    ctx.restore();
    slamStamp(ctx, 'LGTM', 960, 350, 300, am, { color: INK.yellow, rot: -.1 });
    if (t >= 79.36 && t < 79.56) cutout(ctx, 250, 110, 1420, 860, -.035, t, c => gauge(c, t, 1420, 860), { seed: 9 });
  }

  // ---------- 79.56 hop, hop: alone, smaller, on an emptier, bigger stage ----------
  function hopAlone(ctx, t) {
    const tc = twh(t, HOP2), a = hops(tc, HOP2, .3, 2.4), z = lerp(1.1, .84, easeOut(seg(t, 79.56, 80.3)));
    cam(ctx, 960, 560, z);
    stage(ctx, t, { a: INK.night, b: INK.nightLt, spin: .04, rays: 28, marquee: false, altarBtn: false, horizon: 560 });
    ctx.save(); ctx.globalAlpha = .16; fillPts(ctx, [[900, -300], [1020, -300], [1110, 860], [810, 860]], INK.white, false); ctx.restore();
    fillPts(ctx, ell(960, 858, 170, 26, 24), rgba(INK.white, .35));
    for (let i = 0; i < 9; i++) { const x = hrange(i * 4.4, 120, 1800), y = hrange(i * 2.9, 660, 1000), s = lerp(60, 140, (y - 660) / 340); if (Math.abs(x - 960) < 220) continue; commentBunny(ctx, x, y, s, { state: 'resolved' }); }
    rabbit(ctx, 960, 858, 15, { hop: a.h, sq: a.sq, legs: 'hop', ...earsFor(a.vy), armL: { a: 30, e: 20 }, armR: { a: 30, e: 20 }, eyes: 'open', lids: .45, mouth: 'flat', bags: BAGS });
    ctx.restore();
    sfx(ctx, 'hop', 720, 700, 110, t - at(HOP2[0]) + .05, { rot: -.1, life: .7 });
    sfx(ctx, 'hop', 1210, 690, 110, t - at(HOP2[1]) + .05, { rot: .1, life: .7 });
  }

  // ---------- 80.30 guess I'll write 'em all again: four panels, faster each; the chart goes vertical ----------
  function writing(c, t, p) {
    const tc = twos(t), f = [1.5, 3, 6, 12][p], sc = Math.sin(tc * f * TAU), bg = [INK.blue, INK.cyan, INK.yellow, INK.blue][p];
    field(c, bg, p === 2 ? INK.orange : INK.blueDk, { y0: 0, y1: 1300, spacing: 34 });
    if (p >= 1) speedLines(c, 1060, 900, { n: 30 + p * 20, r0: 420, r1: 1800, w: 8 + p * 4, color: rgba(p === 2 ? INK.orangeDk : INK.white, .5) });
    const pose = { turn: .2, lx: .4, ly: .85, bags: BAGS + p * .1, pen: false, lids: .15 + p * .08, sweat: p >= 2 ? .5 + p * .2 : 0,
      eyes: p === 3 ? 'spiral' : 'open', mouth: p >= 2 ? 'wavy' : 'flat', armL: { a: 28, e: 70 }, pawL: 'open', pawR: 'fist',
      earL: { a: -14 - p * 6, b: p * 12 + sc * p * 4 }, earR: { a: 12 + p * 6, b: -p * 12 - sc * p * 4 } };
    const arm = g => ({ a: 32 + g * 12, e: 50 + g * 16 }), RX = 930, RY = 1150, RS = 60;
    if (p >= 2) for (let g = 1; g <= p - 1; g++) { c.save(); c.globalAlpha = .32; rabbit(c, RX, RY, RS, { ...pose, armR: arm(-sc * g * .9), noShadow: true }); c.restore(); }
    const A = rabbit(c, RX, RY, RS, { ...pose, armR: arm(sc) });
    ink(c, [[300, 1004], [1640, 1004], [1760, 1100], [180, 1100]], { fill: '#8A5A34', line: 6, boil: .8, smooth: false });
    ink(c, [[980, 990], [1380, 990], [1420, 1090], [960, 1090]], { fill: INK.white, line: 4, boil: .6, smooth: false });
    const nLines = Math.floor(frac(tc * f / 5) * 5) + 1;
    for (let i = 0; i < nLines; i++) inkLine(c, [[1010 + i * 4, 1012 + i * 16], [1080 + i * 5, 1004 + i * 16], [1160 + i * 6, 1014 + i * 16], [1240 + i * 6, 1006 + i * 16], [1320 + i * 7, 1012 + i * 16]], 6, INK.red, { taper: [.1, .3] });
    c.save(); c.translate(A.pawR[0], A.pawR[1]); c.rotate(.55); ink(c, rrect(-13, -120, 26, 160, 9), { fill: INK.red, line: 4, boil: .8, smooth: false }); ink(c, [[-13, 40], [13, 40], [0, 74]], { fill: INK.fur, line: 3, boil: 0, smooth: false }); c.restore();
    for (let i = 0; i < [1, 3, 6, 9][p]; i++) ink(c, rect(700 + (i % 2) * 8, 988 - i * 15, 150, 13), { fill: i % 2 ? INK.white : '#F4EEE4', line: 3, boil: .6, smooth: false, seed: i });
    if (p === 3) krackle(c, A.pawR[0], A.pawR[1] + 40, 120, { n: 20, size: 14, color: INK.ink });
  }
  const WP = [[80.30, 60], [80.62, 515], [80.94, 970], [81.16, 1425]];
  function writeChart(c, t, w, h) {
    const k = seg(t, at(81.54), 81.84), pts = [...CPTS];
    metrChart(c, 0, 0, w, h, t, { title: 'Comments the rabbit can write (50% success)', ylabels: ['1', '10', '100', '1K'], pts, footnote: 'Measurements above 40 comments are unreliable with our current rabbit.' });
    const px = 110, py = 80, pw = w - 160, ph = h - 190, x0 = px + .525 * pw, y0 = py + ph - .534 * ph;
    if (k > 0) { const line = []; for (let i = 0; i <= 12; i++) { const q = i / 12 * k; line.push([x0 + (1 - Math.exp(-q * 5)) * 40, y0 - Math.pow(q, 2.2) * (ph * 1.6 + 200)]); } inkLine(c, line, 10, INK.orange, { taper: [0, 0] }); }
  }
  function writePanels(ctx, t) {
    const L = [];
    WP.forEach(([t0, x], p) => { if (t < at(t0)) return; const k = backOut(clamp((t - at(t0)) / .12), 1.6); L.push({ r: [x, lerp(-620, 420, k), 435, 610], fn: c => writing(c, t, p), at: [1040, 690], zoom: 1.12 }); });
    panels(ctx, t, L, { gutter: INK.paper, border: 8 });
    const ck = seg(threes(t), at(81.42), at(81.42) + .12);
    if (ck > 0) cutout(ctx, lerp(-900, 120, backOut(ck, 1.2)), 450, 820, 560, -.03, t, c => writeChart(c, t, 820, 560), { seed: 12 });
  }

  // ---------- 81.87 held "agaaain": the acceleration crescendo ----------
  const CR0 = 81.87, CR1 = 84.85, KR = 1.05;
  const rate = t => Math.exp(KR * (clamp(t, CR0, CR1) - CR0)), tau = t => (rate(t) - 1) / KR, tauInv = u => CR0 + Math.log(1 + KR * u) / KR;
  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const CAL_R = 1.35;                                                   // calendar pages per tau-second (a week per page)
  function calPage(c, p, w, h) {
    const d = new Date(Date.UTC(2026, 8, 3 + 7 * p));
    fillPts(c, rect(0, 0, w, h), INK.white, false); fillPts(c, rect(0, 0, w, 78), INK.red, false);
    txt(c, `${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`, w / 2, 56, { font: 'ui', weight: 900, size: 46, color: INK.white, align: 'center' });
    txt(c, String(d.getUTCDate()), w / 2, h * .74, { font: 'display', weight: 900, stretch: -2, size: 210, color: INK.ink, align: 'center' });
    txt(c, DAYS[d.getUTCDay()], w / 2, h * .9, { font: 'ui', weight: 800, size: 30, color: GREYLN, align: 'center' });
    stamp(c, 'NEW SOTA', w * .55, h * .56, 64, 1, { color: INK.blue, rot: -.2 + hash(p) * .2 });
    outline(c, rect(0, 0, w, h), 4, INK.ink, { smooth: false, heavy: .2 });
  }
  function calendar(c, t, w, h) {
    const tf = Math.min(t, CR1), p = Math.floor(tau(tf) * CAL_R), pw = w - 40, ph = h - 70;
    c.save(); c.translate(20, 50); calPage(c, p, pw, ph); c.restore();
    for (let i = 0; i < 16; i++) ink(c, ell(40 + i * (w - 80) / 15, 44, 9, 18, 10), { fill: '#8C8A96', line: 3, boil: .4 });
    return p;
  }
  function flyingPages(c, t, w, h) {
    const tf = Math.min(t, CR1), p = Math.floor(tau(tf) * CAL_R);
    for (let j = p; j > p - 4 && j > 0; j--) { const a = tf - tauInv(j / CAL_R); if (a > .4) continue;
      c.save(); c.translate(20 + (w - 40) / 2 - a * 900 + hash(j) * 80, 50 + (h - 70) / 2 - a * 1500 + a * a * 1200); c.rotate(-a * (5 + hash(j) * 6)); c.scale(1 - a * .8, 1 - a * .8); c.translate(-(w - 40) / 2, -(h - 70) / 2);
      calPage(c, j - 1, w - 40, h - 70); c.restore(); }
  }
  function toggle(c, t, w, h) {
    const tf = Math.min(t, CR1), u = tau(tf) * 1.25, k = Math.floor(u), s = k % 2, pr = clamp((tf - tauInv(k / 1.25)) / .08), pos = s ? pr : 1 - pr;
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    txt(c, "it's so over", 30, 78, { font: 'ui', weight: 900, size: 54, color: s ? '#B8B2C4' : INK.ink });
    txt(c, "we're so back", w - 30, h - 34, { font: 'ui', weight: 900, size: 54, color: s ? INK.ink : '#B8B2C4', align: 'right' });
    const tx = w / 2 - 130, ty = h / 2 - 50;
    ink(c, rrect(tx, ty, 260, 100, 50), { fill: mix('#B8B2C4', INK.cyan, pos), line: 5, boil: .5, smooth: false });
    ink(c, ell(tx + 50 + pos * 160, ty + 50, 40, 40, 20), { fill: INK.white, line: 5, boil: .5 });
    txt(c, '\u21C4', w / 2, ty - 16, { font: 'ui', weight: 900, size: 40, color: GREYLN, align: 'center' });
  }
  const TRACK = [['Erd\u0151s #339', 'MODEL 5.6 SOL', 'g'], ['Navier\u2013Stokes', '6 ASTRA', 'g'], ['Jacobian conj.', 'FABLE 5', 'g'], ['Unit distances', 'internal', 'g'],
    ['Erd\u0151s #1,043', 'FLASH 3.8', 'y'], ['FrontierMath T4', '6 ASTRA', 'g'], ['Small fix #4812', 'you', 'r'], ['IMO 2026 P6', 'MODEL 5.6 SOL', 'g'], ['Kakeya (3D)', 'NEW SOTA', 'y'], ['ARC-AGI-3', '6 ASTRA', 'g']];
  function tracker(c, t, w, h) {
    const tf = Math.min(t, CR1), off = tau(tf) * 150, rh = 62, sp = rate(tf) * 150 / 24;
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    c.save(); clipPts(c, rect(0, 70, w, h - 70), false);
    const n0 = Math.floor(off / rh);
    for (let i = -1; i < h / rh + 1; i++) { const n = n0 + i, row = TRACK[mod(n, TRACK.length)], y = 70 + i * rh - mod(off, rh);
      if (mod(n, 2) === 0) fillPts(c, rect(0, y, w, rh), '#F4EEE4', false);
      const col = { g: INK.green, y: INK.yellow, r: INK.red }[row[2]];
      if (sp > 30) { c.globalAlpha = .5; fillPts(c, rect(20, y + rh * .35, w * .55, rh * .3), GREYLN, false); fillPts(c, rect(w - 70, y + 6, 36, rh + sp), col, false); c.globalAlpha = 1; continue; }
      txt(c, row[0], 22, y + 42, { font: 'ui', weight: 800, size: 30, color: INK.ink }); txt(c, row[1], w - 96, y + 42, { font: 'mono', weight: 700, size: 20, color: GREYLN, align: 'right' });
      ink(c, ell(w - 52, y + rh / 2, 17, 17, 14), { fill: col, line: 3, boil: .4 }); }
    c.restore();
    fillPts(c, rect(0, 0, w, 70), INK.ink, false); txt(c, 'AI contributions \u00B7 tracker', 22, 48, { font: 'ui', weight: 800, size: 32, color: INK.white });
  }
  function stopwatch(c, t, w, h) {
    const tf = Math.min(t, CR1), end = 84.43, v = t >= end ? 88 * 3600 : 88 * 3600 * Math.pow(tau(tf) / tau(end), 1.6);
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    const cx = w / 2, cy = h / 2 + 24, r = Math.min(w, h) * .4;
    ink(c, rrect(cx - 26, cy - r - 46, 52, 40, 8), { fill: '#8C8A96', line: 4, boil: .4, smooth: false });
    ink(c, ell(cx, cy, r, r, 40), { fill: INK.ink, line: 6, boil: .6 }); ink(c, ell(cx, cy, r * .86, r * .86, 40), { fill: '#C9D8C0', line: 4, boil: .4 });
    const hh = Math.floor(v / 3600), mm = Math.floor(v / 60) % 60, ss = Math.floor(v) % 60, p2 = n => String(n).padStart(2, '0');
    const blinkOff = t >= end && Math.floor((t - end) * 6) % 2 === 1;
    if (!blinkOff) txt(c, `${p2(hh)}:${p2(mm)}:${p2(ss)}`, cx, cy + 26, { font: 'mono', weight: 800, size: 64, color: INK.ink, align: 'center' });
    txt(c, 'agent runtime', cx, cy + 80, { font: 'ui', weight: 800, size: 24, color: GREYLN, align: 'center' });
  }
  const SEAT = mix(INK.ink, INK.nightLt, .35);
  function spinRabbit(ctx, t, x, y, th, alpha = 1) {                  // rabbit + office chair rotating by th (rad); the base stays put
    const cs = Math.cos(th), sn = Math.sin(th), s = .95, rs = 32, seat = y - 290 * s;
    const back = () => { ctx.save(); ctx.translate(x - sn * 80, y); ctx.scale(s, s); ink(ctx, rrect(-190 * Math.max(.12, Math.abs(cs)), -760, 380 * Math.max(.12, Math.abs(cs)), 470, 60), { fill: SEAT, shade: { color: INK.ink, spacing: 14, dir: [.6, .8], from: -80, to: 260 }, line: 6, boil: .8, smooth: false }); ctx.restore(); };
    ctx.save(); ctx.globalAlpha = alpha;
    if (alpha === 1) officeChair(ctx, x, y, s, { back: false, seat: SEAT });
    if (cs >= 0) back();
    const fl = (cs < 0 ? -1 : 1) * Math.sign(sn || 1);
    rabbit(ctx, x + sn * 14, seat + 16, rs, { sit: 1, turn: sn, eyes: 'spiral', mouth: 'wavy', bags: BAGS, noShadow: true, sweat: .6,
      armL: { a: 95 + sn * 20, e: -10 }, armR: { a: 95 - sn * 20, e: -10 }, pawL: 'open', pawR: 'open', earL: { a: -60 - fl * 25, b: -30 }, earR: { a: 60 - fl * 25, b: 30 } });
    if (cs < 0) back();
    ctx.restore();
  }
  function crescendo(ctx, t) {
    const tf = Math.min(t, CR1), R = rate(tf), I = clamp((R - 1) / 20), frozen = t >= at(CR1), tc = frozen ? tf : twos(t);
    const z = 1 + .1 * expoIn(seg(tf, CR0, CR1)), rot = Math.sin(tf * (3 + I * 14)) * .02 * I, sh = shake(t, frozen ? 26 * Math.exp(-(t - at(CR1)) * 9) : 3 + I * 9);
    cam(ctx, 960 + sh[0], 540 + sh[1], z, rot);
    // riding the curve: the log axis rushes down past a vertical trend line
    field(ctx, INK.blue, INK.blueDk, { y0: -200, y1: 1300, spacing: 40, max: .6 });
    const alt = tau(tf) * 420;
    ['1 hr', '8 hrs', '1 day', '1 wk', '1 mo', '1 yr', '1 decade', '\u221E'].forEach((l, i) => { const y = 540 + alt - i * 700 - 200; if (y < -100 || y > H + 100) return;
      inkLine(ctx, [[-200, y], [W + 200, y]], 5, rgba(INK.cyan, .6), { taper: [0, 0], smooth: false }); txt(ctx, l, 990, y - 16, { font: 'ui', weight: 900, size: 52, color: INK.cyan, stroke: { w: 8, color: INK.ink } }); });
    if (!frozen) streaks(ctx, [-100, -200, W + 100, H + 200], { dir: [0, 1], n: 20 + Math.round(I * 50), len: 200 + I * 900, w: 5 + I * 5, color: rgba(INK.white, .25 + I * .35), seed: 5 });
    ctx.save(); ctx.setLineDash([46, 30]); ctx.lineDashOffset = -alt * 1.3; inkLine(ctx, [[960, -300], [960, H + 300]], 16, INK.orange, { taper: [0, 0], smooth: false }); ctx.restore();
    // the rabbit spins in its chair, faster and faster; multiples at speed
    const th = (1.5 / KR * (R - 1)) * TAU + (frozen ? 0 : 0);
    const tth = frozen ? Math.round(th / TAU) * TAU + Math.sin((t - CR1) * 30) * .3 * Math.exp(-(t - CR1) * 6) : (1.5 / KR * (rate(tc) - 1)) * TAU;
    if (!frozen && I > .25) for (let g = 2; g >= 1; g--) spinRabbit(ctx, t, 960, 1010, tth - g * .9, .28);
    spinRabbit(ctx, t, 960, 1010, tth);
    if (!frozen && I > .1) { ctx.save(); ctx.globalAlpha = .7; for (let i = 0; i < 4; i++) inkLine(ctx, bezPts([650, 480 + i * 70], [720, 430 + i * 70], [1200, 430 + i * 70], [1270, 480 + i * 70], 10), 7, INK.white, { taper: [.3, .3], seed: i }); ctx.restore(); }
    ctx.restore();
    // inserts arrive on the beats, then everything accelerates
    const ins = (t0, fn) => { if (t < at(t0)) return; const k = backOut(clamp((threes(t) - at(t0)) / .15), 1.5); fn(k); };
    ins(82.315, k => { cutout(ctx, lerp(-600, 70, k), 60, 460, 440, -.05, tf, c => calendar(c, t, 460, 440), { seed: 21 }); ctx.save(); ctx.translate(lerp(-600, 70, k), 60); ctx.rotate(-.05); flyingPages(ctx, t, 460, 440); ctx.restore(); });
    ins(82.756, k => cutout(ctx, lerp(2000, 1350, k), 70, 500, 300, .05, tf, c => toggle(c, t, 500, 300), { seed: 22 }));
    ins(83.174, k => cutout(ctx, lerp(-700, 60, k), 570, 580, 380, .03, tf, c => tracker(c, t, 580, 380), { seed: 23 }));
    ins(83.592, k => cutout(ctx, lerp(2000, 1400, k), 470, 440, 420, -.04, tf, c => stopwatch(c, t, 440, 420), { seed: 24 }));
    crawl(ctx, 968, 104, 400 + tau(tf) * 700, { size: 64, blur: clamp((R - 3) / 12), labelW: 290 });
    if (t >= at(CR1) - .085) {
      const k = clamp((t - (at(CR1) - .085)) / .085), a = t - at(CR1), y = lerp(-300, 390, easeIn(k)) + (a > 0 ? Math.sin(a * 50) * 16 * Math.exp(-a * 10) : 0);
      ctx.save(); ctx.translate(960, y + 100); ctx.rotate(-.025);
      fillPts(ctx, rect(-900 + 14, -100 + 16, 1800, 200), INK.ink, false); ink(ctx, rect(-900, -100, 1800, 200), { fill: GREY, line: 7, boil: 0, smooth: false });
      txt(ctx, 'THIS TRACKER IS NO LONGER UPDATED', 0, 32, { font: 'ui', weight: 900, size: 92, color: '#4A4658', align: 'center', stretch: -1 });
      ctx.restore();
    }
  }

  // ---------- 85.25 the drum fill: an Evangelion title card, re-arranged on two hard cuts ----------
  function vcol(ctx, s, x, y, size, o = {}) { [...s].forEach((ch, i) => txt(ctx, ch, x, y + i * size * 1.02, { font: 'jp', weight: 800, size, color: o.color || '#F4F1EA', align: 'center' })); }
  const EVA = [
    { b: [{ s: 'LINE', x: 100, y: 350, size: 300 }, { s: '9,012', x: 90, y: 840, size: 530 }, { s: 'THE RABBIT, READING', x: 1620, y: 1000, size: 124, align: 'right' }], v: [['第九千十二行', 1740, 120, 138]] },
    { b: [{ s: '9,012', x: 70, y: 700, size: 660, sx: .66 }, { s: 'LINE', x: 1830, y: 250, size: 200, align: 'right' }, { s: 'THE RABBIT,', x: 1830, y: 880, size: 150, align: 'right' }, { s: 'READING', x: 1830, y: 1020, size: 150, align: 'right' }], v: [['第九千十二行', 1110, 100, 88]] },
    { b: [{ s: 'THE RABBIT,', x: 90, y: 700, size: 310 }, { s: 'READING', x: 90, y: 1010, size: 310 }, { s: 'LINE 9,012', x: 1830, y: 200, size: 150, align: 'right', color: INK.red }], v: [['第九千十二行', 1760, 300, 112]] },
  ];
  function eva(ctx, t) {
    BOIL = 0;
    const i = t >= at(87.2) ? 2 : t >= at(86.54) ? 1 : 0, E = EVA[i];
    evaCard(ctx, t, E.b);
    for (const [s, x, y, size] of E.v) vcol(ctx, s, x, y, size);
  }

  chapter('chorus2', 69.27, 87.74, [
    [69.27, slam], [70.32, trio], [72.35, hopChoreo], [73.00, chairShot], [74.50, inversion], [75.50, nopeChoreo],
    [76.10, clickArmy], [77.30, domino], [78.03, thumbsRain], [78.85, amen], [79.56, hopAlone], [80.30, writePanels],
    [81.87, crescendo], [85.25, eva],
  ]);
})();
