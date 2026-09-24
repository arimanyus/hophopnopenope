// c07_final.js: final chorus, 3 a.m. (104.63-122.25). Spider-Punk collage: night + alarm red + orange, taped xerox scraps.
(() => {
  const HOPS = [107.44, 107.764], YEPS = [110.875, 111.224], FREEZE = 105.9, SILENT = 121.1;
  const age = (t, x) => t - (x - VLEAD);                     // time since a hit that shows one frame early
  const lit = mix(INK.paper, INK.blue, .28), coffee = mix(INK.ink, INK.orangeDk, .45), shadowInk = mix(INK.ink, INK.night, .5);
  const slam = (t, x, d = .12) => { const a = age(t, x); return a < 0 ? 0 : lerp(1.32, 1, backOut(clamp(a / d), 2.4)); };

  // ---------- shared bits ----------
  function night(c, o = {}) {
    fillPts(c, rect(-400, -400, W + 800, H + 800), o.bg || INK.night, false);
    if (o.dots !== false) dotsIn(c, [-80, -80, W + 80, H + 80], { spacing: o.sp || 46, color: o.dots || INK.nightLt, dir: o.dir || [0, 1], from: o.from ?? -300, to: o.to ?? 900, min: o.min ?? .06, max: o.max ?? .75 });
  }
  function scrap(ctx, cx, cy, w, h, rot, k, t, fn, o) {
    if (k <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(k, k); cutout(ctx, -w / 2, -h / 2, w, h, 0, t, fn, o); ctx.restore();
  }
  function strobe(ctx, v, a = .6) {
    if (v < .02) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = v * a; ctx.fillStyle = INK.red; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // tint what is already drawn in a box (paper lit by a monitor at night)
  function tint(c, pts, col, a = 1) { c.save(); clipPts(c, pts, false); c.globalCompositeOperation = 'multiply'; c.globalAlpha = a; c.fillStyle = col; c.fillRect(-2000, -2000, 6000, 6000); c.restore(); }

  // Cheap comment-bunny (same silhouette as commentBunny, unit u = s/10): flat fills, no shading, no boil.
  const P2 = pts => { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; };
  const joinP = (...ps) => { const p = new Path2D(); ps.forEach(q => p.addPath(q)); return p; };
  const B_EARS = joinP(P2(xform(ell(0, -3, 1.35, 3.1, 14), -2.3, -7.3, 1, -.13)), P2(xform(ell(0, -3, 1.35, 3.1, 14), 2.3, -7.3, 1, .13)));
  const B_INNER = joinP(P2(xform(ell(0, -3.1, .6, 2.1, 10), -2.3, -7.3, 1, -.13)), P2(xform(ell(0, -3.1, .6, 2.1, 10), 2.3, -7.3, 1, .13)));
  const B_BODY = P2((() => { const b = rrect(-6.2, -7.6, 12.4, 6.2, 2.2), i = b.findIndex(([x, y]) => y > -1.5 && x < 0); b.splice(Math.max(0, i), 0, [-1.4, -1.4], [-3.8, .9], [-3.2, -1.4]); return b; })());
  const B_EYES = joinP(P2(ell(-1.9, -4.8, .6, .75, 10)), P2(ell(1.9, -4.8, .6, .75, 10)));
  const B_HAPPY = (() => { const p = new Path2D(); for (const x of [-1.9, 1.9]) { p.moveTo(x - .75, -4.5); p.lineTo(x, -5.3); p.lineTo(x + .75, -4.5); } return p; })();
  const B_CHIP = P2(rrect(-4.5, -3.3, 9, 1.1, .5)), B_TEXT = joinP(P2(rect(-4.2, -3.3, 8.2, .45)), P2(rect(-4.2, -2.4, 5.7, .45)));
  function bun(c, x, y, s, o = {}) {
    const k = s / 10, sq = o.sq || 0;
    c.save(); c.translate(x, y - (o.hop || 0) * k); if (o.rot) c.rotate(o.rot); c.scale(k * (1 + sq * .25) * (o.sx || 1), k * (1 - sq * .25) * (o.sy || 1));
    c.lineWidth = Math.max(2.4, s * .05) / k; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = INK.ink;
    c.fillStyle = o.fill || INK.white; c.fill(B_EARS); c.stroke(B_EARS);
    if (s > 26) { c.fillStyle = INK.earIn; c.fill(B_INNER); }
    c.fillStyle = o.fill || INK.white; c.fill(B_BODY); c.stroke(B_BODY);
    c.fillStyle = INK.ink; if (o.eyes === 'happy') { c.lineWidth = .45; c.stroke(B_HAPPY); } else c.fill(B_EYES);
    c.fillStyle = o.chip || '#8A8496'; c.fill(o.chip ? B_CHIP : B_TEXT);
    c.restore();
  }
  const CHIPS = [INK.red, null, INK.orange, null, INK.red, null];

  // the carrot mug; (x, y) = centre, s = rabbit scale
  function mug(c, x, y, s, t, steam = 1) {
    const w = 1.5 * s, h = 1.6 * s;
    inkLine(c, [[x + w * .45, y - h * .28], [x + w * .82, y - h * .12], [x + w * .82, y + h * .18], [x + w * .45, y + h * .3]], Math.max(4, s * .2), INK.ink, { taper: [0, 0] });
    ink(c, rrect(x - w / 2, y - h / 2, w, h, s * .3), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: Math.max(8, s * .35), dir: [.7, .7], from: -s * .2, to: s }, line: Math.max(3, s * .13), smooth: false, boil: .8 });
    fillPts(c, rect(x - w * .38, y - h * .5 + s * .12, w * .76, s * .18), coffee, false);
    if (steam) for (let k = 0; k < 2; k++) { const ph = t * .9 + k * .5, p = frac(ph); c.save(); c.globalAlpha = .55 * steam * Math.sin(p * Math.PI);
      inkLine(c, [[x - s * .25 + k * s * .5, y - h * .6], [x - s * .1 + k * s * .5 + wob(t, .7, k) * s * .25, y - h * .6 - s * (.6 + p * .8)], [x - s * .3 + k * s * .5, y - h * .6 - s * (1.2 + p * 1.2)]], Math.max(3, s * .12), INK.paper, { taper: [.3, .7] }); c.restore(); }
  }
  // the on-call pager; s = width
  function pager(c, x, y, s, t, o = {}) {
    const u = s / 10, bz = o.buzz || 0, j = bz > .05 ? shake(t, 7 * bz) : [0, 0];
    c.save(); c.translate(x + j[0], y + j[1]); c.rotate(o.rot || 0);
    if (bz > .05) for (const sd of [-1, 1]) for (let i = 1; i <= 2; i++) { const r = 5.6 * u + i * 1.3 * u; inkLine(c, [[sd * r * .92, -r * .42], [sd * (r + .3 * u), 0], [sd * r * .92, r * .42]], Math.max(4, .45 * u), rgba(INK.paper, .85 * bz), { taper: [.2, .2] }); }
    ink(c, rrect(-2.2 * u, -4.2 * u, 4.4 * u, 2 * u, .5 * u), { fill: shadowInk, line: Math.max(3, .3 * u), boil: .6, smooth: false });
    ink(c, rrect(-5 * u, -3 * u, 10 * u, 6 * u, 1.3 * u), { fill: mix(INK.ink, INK.nightLt, .45), shade: { color: INK.ink, spacing: Math.max(9, u), dir: [.5, .85], from: 0, to: 4 * u }, line: Math.max(4, .42 * u), boil: .8, smooth: false });
    fillPts(c, rrect(-4.1 * u, -2.2 * u, 8.2 * u, 3.1 * u, .4 * u), INK.orangeLt, false);
    outline(c, rrect(-4.1 * u, -2.2 * u, 8.2 * u, 3.1 * u, .4 * u), Math.max(2.5, .22 * u), INK.ink, { smooth: false, heavy: .2 });
    txt(c, o.text || '03:00', 0, -.1 * u, { font: 'mono', weight: 800, size: 2.3 * u, color: INK.ink, align: 'center', base: 'middle' });
    for (let i = 0; i < 3; i++) ink(c, ell((-2.4 + i * 2.4) * u, 1.9 * u, .7 * u, .45 * u, 12), { fill: i === 1 ? INK.red : INK.nightLt, line: Math.max(2, .2 * u), boil: .4 });
    c.restore();
  }
  // big red paw print (the bridge stamp); s = pad width
  function pawPrint(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const pad = [[-.5, .1], [-.42, -.2], [-.18, -.34], [0, -.3], [.18, -.34], [.42, -.2], [.5, .1], [.36, .38], [0, .44], [-.36, .38]].map(([a, b]) => [a * s, b * s]);
    const toes = [[-.52, -.62, .15, .2, -.35], [-.19, -.84, .16, .22, -.1], [.19, -.84, .16, .22, .1], [.52, -.62, .15, .2, .35]].map(([a, b, rx, ry, r]) => xform(ell(0, 0, rx * s, ry * s, 16), a * s, b * s, 1, r));
    const all = [pad, ...toes];
    for (const p of all) fillPts(c, p, INK.red);
    c.save(); c.beginPath(); for (const p of all) tracePath(c, p, true, true); c.clip();
    dotsIn(c, [-s, -1.2 * s, s, .6 * s], { spacing: s * .07, color: INK.white, k: (a, b) => clamp(.1 + noise2(a * .012 + 3, b * .012) * .55) });
    c.restore(); c.restore();
  }
  // devShadow lit by a monitor: halftone light on the front, scrolling light bands, glasses reflecting the page
  const DEV = [[-5, 0], [-4.6, -6], [-3, -8.4], [-2.4, -12.6], [0, -14.2], [2.4, -12.6], [3, -8.4], [4.6, -6], [5, 0]];
  function devLit(c, x, y, s, t, o = {}) {
    const u = s / 10, body = DEV.map(([a, b]) => [x + a * u, y + b * u]);
    devShadow(c, x, y, s, { glare: 0 });
    outline(c, body.map(([a, b]) => [a + (a - x) * -.03, b + (b - y + 7 * u) * -.03]), Math.max(4, .5 * u), INK.blue);
    c.save(); clipPts(c, body);
    dotsIn(c, [x - 6 * u, y - 15 * u, x + 6 * u, y + u], { spacing: 16, color: INK.blue, dir: [0, 1], c: [x, y - 12.5 * u], from: 0, to: 7 * u, min: .55, max: 0 });
    if (o.scroll) { c.globalAlpha = .3; for (let i = 0; i < 6; i++) { const yy = y - 15 * u + mod(i * 3.1 * u - t * o.scroll, 16 * u); fillPts(c, rect(x - 6 * u, yy, 12 * u, .9 * u), INK.blue, false); } c.globalAlpha = 1; }
    c.restore();
    for (const sd of [-1, 1]) {
      const lens = ell(x + sd * 1.1 * u, y - 10.8 * u, .95 * u, .62 * u, 16);
      ink(c, lens, { fill: INK.white, line: Math.max(3, .2 * u), boil: .5 });
      if (o.scroll) { c.save(); clipPts(c, lens); for (let i = 0; i < 4; i++) { const yy = y - 11.6 * u + mod(i * .42 * u - t * o.scroll * .08, 1.7 * u); fillPts(c, rect(x + sd * 1.1 * u - .7 * u, yy, (.5 + hash(i + sd) * .8) * u, .16 * u), INK.nightLt, false); } c.restore(); }
    }
  }
  // desk silhouette with a keyboard rim-lit by the monitor (the calm lower lyric zone)
  function desk(c, y, t) {
    fillPts(c, [[-300, y], [W + 300, y], [W + 300, H + 300], [-300, H + 300]], shadowInk, false);
    inkLine(c, [[-300, y], [W + 300, y]], 6, INK.nightLt, { taper: [0, 0], smooth: false });
  }

  // ---------- 104.63 SLAM + 105.90 stop-time: the pile ----------
  // 400 slots in a flat-topped mound; row 0 is the nearest (big, full rig), later rows recede up the pile
  const PEAK = 745, BASE = 1135, PR_ = 1150;
  const surf = x => PEAK + (BASE - PEAK) * Math.min(1, Math.pow(Math.abs(x - 960) / PR_, 3));
  const PILE = (() => {
    const r = rng(400), out = [];
    let y = BASE, row = 0;
    while (y > PEAK) {
      const f = (BASE - y) / (BASE - PEAK), s = lerp(96, 34, f), hw = PR_ * Math.cbrt((y - PEAK) / (BASE - PEAK)), step = s * 1.12, n = Math.max(1, Math.round(2 * hw / step));
      for (let i = 0; i < n; i++) {
        const x = 960 + (i - (n - 1) / 2) * step + (r() - .5) * s * .45;
        out.push({ x, y: y + (r() - .5) * s * .2, s: s * (.9 + r() * .2), row, seed: r(), rot: (r() - .5) * .4, chip: CHIPS[Math.floor(r() * 6)], fill: mix(INK.white, INK.nightLt, f * .3),
          land: Math.min(105.84, 105.06 + f * .74 + (r() - .5) * .12), from: x < 960 ? -1 : 1, eyes: r() < .3 ? 'wide' : 'dot' });
      }
      y -= s * .46; row++;
    }
    while (out.length > 400) out.splice(40 + Math.floor(hash(out.length) * (out.length - 80)), 1);
    return out.sort((a, b) => a.y - b.y);
  })();
  const seatY = tw => lerp(1400, PEAK + 4, easeOut(seg(tw, 105.1, 105.84)));
  function pileBunny(ctx, b, t) {
    const dur = .42, u = (t - (b.land - dur)) / dur; if (u < 0) return;
    let x = b.x, y = b.y, rot = b.rot, sq = 0, sx = 1;
    if (u < 1) {       // the stampede runs on ones, smeared
      const x0 = b.from < 0 ? -160 - b.seed * 300 : W + 160 + b.seed * 300;
      x = lerp(x0, b.x, u); y = lerp(b.y - 40, b.y, u) - Math.abs(Math.sin(u * Math.PI * 2)) * b.s * 1.3; rot = -b.from * .3 * (1 - u) + b.rot * u; sx = 1 + .5 * (1 - u);
    } else { const g = twos(t) - b.land; sq = .5 * Math.exp(-g * 12) * Math.cos(g * 30); }
    if (b.row === 0) commentBunny(ctx, x, y, b.s, { eyes: b.eyes, rot, sq, chip: b.chip === INK.red ? 'critical' : b.chip === INK.orange ? 'issue' : null });
    else bun(ctx, x, y, b.s, { rot, sq, sx, chip: b.chip, fill: b.fill });
  }
  // the review header, slammed in, then trampled: it tips back and sinks behind the pile
  function counterStrip(ctx, t, k) {
    if (k <= 0) return;
    const w = 1500, h = 250, a = measure(ctx, 'Actionable comments posted: ', { font: 'ui', weight: 800, size: 100 }).w, b = measure(ctx, '400', { font: 'ui', weight: 900, size: 230 }).w, size = 100 * (w - 120) / (a + b);
    const fall = easeIn(seg(t, 105.2, 105.75)), jolt = shake(t, 10 * hit(t, [105.047, 105.465], 9));
    ctx.save(); ctx.translate(960 + jolt[0], 600 + fall * 520 + jolt[1]); ctx.rotate(-.03 - fall * .22); ctx.scale(k, k);
    cutout(ctx, -w / 2, -h / 2, w, h, 0, t, c => { fillPts(c, rect(0, 0, w, h), INK.white, false); countHeader(c, 60, h * .74, 400, { size, numScale: 2.3, stroke: true }); }, { seed: 7, jit: 8 });
    pager(ctx, -w / 2 + 70, -h / 2 - 10, 230, t, { rot: -.25, buzz: .35 + .65 * pulse(t, 7) });
    ctx.restore();
  }
  function pileScene(ctx, t, tw, rab) {
    const k0 = age(tw, 104.63), boom = k0 < 0 ? 0 : Math.exp(-k0 * 7);
    const sh = shake(tw, 18 * boom + 6 * hit(tw, [105.047, 105.465], 10));
    cam(ctx, 960 + sh[0], 540 + sh[1], 1 + .04 * boom);
    night(ctx, { max: .6 });
    speedLines(ctx, 960, 600, { n: 70, r0: 520, r1: 1500, w: 16, color: rgba(INK.nightLt, .9), seed: 3 });
    counterStrip(ctx, tw, lerp(1.5, 1, easeOut(clamp(k0 / .14))));
    const sy = seatY(tw); let drawn = false;
    for (const b of PILE) { if (!drawn && b.y > sy) { rab(sy); drawn = true; } pileBunny(ctx, b, tw); }
    if (!drawn) rab(sy);
    // foreground stampede: a few huge bunnies thunder past the lens
    depth(ctx, 10, c => { for (const [x1, y1, s, d0, sd] of [[260, 1150, 210, 104.98, -1], [1500, 1190, 240, 105.12, 1], [900, 1210, 200, 105.3, -1], [1820, 1130, 180, 105.44, 1]]) {
      const u = clamp((tw - d0) / .36); if (tw < d0) continue; const x = lerp(sd < 0 ? -500 : W + 500, x1, easeOut(u)), y = y1 - Math.abs(Math.sin(u * Math.PI * 1.5)) * 120 * (1 - u);
      bun(c, x, y, s, { rot: -sd * .25 * (1 - u) + sd * .08, sx: 1 + .6 * (1 - u), chip: INK.red }); } });
    ctx.restore();
  }
  const pileRabbit = (ctx, t, sip) => sy => {
    const tc = twos(t), up = smooth(sip), p = { sit: 1, bags: 1, lids: lerp(.52, 1, up * .6), mouth: 'flat', eyes: up > .6 ? 'closed' : 'open', nod: up * .5, noShadow: true,
      earL: { a: -40, b: -72 }, earR: { a: 10, b: 14 + wob(tc, .3) * 4 }, armL: { a: 20, e: lerp(-110, -150, up) }, armR: { a: 20, e: lerp(-110, -150, up) }, pawL: 'mitt', pawR: 'mitt' };
    const a = rabbit(ctx, 960, sy, 28, p);
    mug(ctx, (a.pawL[0] + a.pawR[0]) / 2, (a.pawL[1] + a.pawR[1]) / 2 - 10, 28, t);
  };
  function slamShot(ctx, t) {
    if (t < 104.89) FRAME.lyrics = false;
    pileScene(ctx, t, t, pileRabbit(ctx, t, 0));
    const k0 = age(t, 104.63);
    strobe(ctx, hit(t, [104.63, 105.047, 105.465], 9));
    if (k0 < .12) misregFrame(ctx, 14 * (1 - k0 / .12));
  }
  function hangShot(ctx, t) {
    BOIL = 0;
    pileScene(ctx, t, FREEZE - .01, sy => { BOIL = 1; pileRabbit(ctx, t, kf(t, [[106.1, 0], [106.35, 1], [106.72, 1], [106.95, 0]]))(sy); BOIL = 0; });
  }

  // ---------- 107.10 POINT CHOREO 1: hop! hop! on red ----------
  const CROWD = (() => {
    const out = [], S = [14, 18, 23, 29, 37, 47, 59, 74];
    S.forEach((s, r) => { const y = 600 + Math.pow(r / 7, 1.35) * 330, n = Math.floor(2150 / (s * 1.55));
      for (let i = 0; i < n; i++) out.push({ x: -110 + (i + .5 + (r % 2) * .5) * 2150 / n + (hash(r * 50 + i) - .5) * s * .4, y: y + (hash(r * 31 + i) - .5) * s * .15, s, r, chip: CHIPS[(i + r) % 6] }); });
    return out;
  })();
  const hopPose = tc => { const a = hopArc(tc, HOPS[0] - VLEAD, .3, 1), b = hopArc(tc, HOPS[1] - VLEAD, .3, 1); return tc < HOPS[1] - VLEAD - .06 ? a : b; };
  function hopShot(ctx, t) {
    const tc = twos(t), h = hopPose(tc), sh = shake(t, 26 * hit(t, HOPS, 9));
    cam(ctx, 960 + sh[0], 540 + sh[1], 1);
    fillPts(ctx, rect(-200, -200, W + 400, H + 400), INK.red, false);
    dotsIn(ctx, [-60, -60, W + 60, H + 60], { spacing: 44, color: INK.redDk, dir: [0, 1], from: -200, to: 700, min: 0, max: .85 });
    for (const b of CROWD) {
      const o = { hop: h.h * 3.2, sq: h.sq, eyes: 'happy', chip: b.chip };
      if (b.r === 7) commentBunny(ctx, b.x, b.y, b.s, { ...o, chip: b.chip === INK.red ? 'critical' : b.chip === INK.orange ? 'issue' : null }); else bun(ctx, b.x, b.y, b.s, o);
    }
    const r = hopPose(tc), e = earsFor(r.vy);
    fillPts(ctx, ell(960, 985, 250 / (1 + r.h * .3), 34, 24), rgba(INK.ink, .3));
    const a = rabbit(ctx, 960, 985, 34, { hop: r.h * 2, sq: r.sq, legs: 'hop', bags: 1, lids: .55, mouth: 'flat', earL: { a: -34, b: -50 + e.earL.b * .6 }, earR: { a: 12, b: e.earR.b },
      armL: { a: 20, e: -110 }, armR: { a: 20, e: -110 }, noShadow: true });
    const mx = (a.pawL[0] + a.pawR[0]) / 2, my = (a.pawL[1] + a.pawR[1]) / 2 - 12;
    mug(ctx, mx, my, 34, t, 0);
    for (const x of HOPS) { const g = tc - (x - VLEAD); if (g > .04 && g < .4) for (let i = 0; i < 3; i++) { const dx = (i - 1) * 90 * g, dy = -520 * g + 1500 * g * g; ink(ctx, blob(mx + dx, my - 30 + dy, 8 - i, i + 3, .2, 8), { fill: coffee, line: 3, boil: .6 }); } }
    ctx.restore();
    sfx(ctx, 'HOP!', 540, 320, 240, age(t, HOPS[0]), { rot: -.14, life: .75 });
    sfx(ctx, 'HOP!', 1390, 300, 240, age(t, HOPS[1]), { rot: .1, life: .6 });
  }

  // ---------- 108.35 the developer at 3 a.m. ----------
  const OUTAGE = [['API', 'down'], ['Web', 'down'], ['Database', 'down'], ['Auth', 'degraded'], ['Webhooks', 'down']];
  function devShot(ctx, t, lt, dur) {
    const tc = twos(t), z = 1 + .06 * easeInOut(lt / dur), dr = drift(t, 5, .5);
    cam(ctx, 960 + dr[0], 540 + dr[1], z);
    night(ctx, { max: .45 });
    // the NOC wall behind: the status page, huge and out of focus; only its red banner stays hot
    depth(ctx, 7, c => {
      c.save(); c.translate(150, 36); c.rotate(-.015); c.scale(2.15, 2.15); statusPage(c, 0, 0, 600, t, { rows: OUTAGE }); c.restore();
      c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = rgba(INK.blue, .22); c.fillRect(0, 250, W, H); c.restore();
    });
    const tw = noise1(tc * 5) * 6, lean = Math.abs(wob(tc, 3.5)) * 8;
    devLit(ctx, 1230 + tw, 820 + lean, 460, t, { scroll: 1500 });
    desk(ctx, 680, t);
    // keyboard + the frantic hand on the mouse
    ink(ctx, rrect(900, 660, 560, 50, 10), { fill: INK.ink, line: 4, lineColor: INK.nightLt, boil: .6, smooth: false });
    for (let i = 0; i < 10; i++) fillPts(ctx, rect(920 + i * 53, 671, 40, 8), INK.nightLt, false);
    const fl = Math.abs(wob(tc, 6));
    ink(ctx, ell(1580, 690, 72, 34, 18), { fill: INK.ink, line: 4, lineColor: INK.nightLt, boil: .6 });
    ink(ctx, [[1420, 800], [1520, 720 - fl * 6], [1590, 672 - fl * 10], [1615, 690], [1540, 780], [1460, 840]], { fill: '#0B0D1E', line: 4, lineColor: INK.blue, boil: 1 });
    cursor(ctx, 560, 380, 250, { tremble: 5, sweat: 1 });
    ctx.restore();
  }

  // ---------- 110.80 POINT CHOREO 2 inverted: yep! yep! ----------
  function yepShot(ctx, t) {
    const tc = twos(t);
    night(ctx, { max: .55, sp: 50 });
    fillPts(ctx, ell(880, 1000, 300, 44, 30), rgba(INK.ink, .35));
    const nod = YEPS.reduce((v, x) => Math.max(v, Math.sin(Math.PI * clamp((tc - (x - VLEAD)) / .34))), 0);
    const a = rabbit(ctx, 880, 1000, 40, { bags: 1, lids: lerp(.55, .72, nod), mouth: 'flat', nod: nod * .9, tilt: -nod * 3, earL: { a: -34, b: -55 }, earR: { a: 12, b: 10 + nod * 25 },
      armL: { a: 20, e: -110 }, armR: { a: 20, e: -110 }, noShadow: true });
    mug(ctx, (a.pawL[0] + a.pawR[0]) / 2, (a.pawL[1] + a.pawR[1]) / 2 - 14, 40, t);
    const b = hit(t, YEPS, 7);
    cursor(ctx, 1440, 280 + b * 120, 320, { rot: b * .35, sweat: 1 });
    stamp(ctx, 'YEP', 430, 300, 220, age(t, YEPS[0]), { color: INK.yellow, rot: -.14, paper: INK.night });
    stamp(ctx, 'YEP', 1560, 880, 200, age(t, YEPS[1]), { color: INK.yellow, rot: .1, paper: INK.night });
  }

  // ---------- 111.40 it's three a.m. ----------
  function moon(c, x, y, r) {
    ink(c, ell(x, y, r, r, 40), { fill: INK.paper, shade: { color: INK.nightLt, spacing: 22, dir: [.6, .8], from: -r * .1, to: r * 1.1, max: .95 }, line: 5, boil: .8 });
    for (const [a, b, q] of [[-.3, -.2, .2], [.25, .3, .13], [-.1, .45, .09], [.35, -.35, .1]]) ink(c, ell(x + a * r, y + b * r, q * r, q * r * .8, 14), { fill: mix(INK.paper, INK.nightLt, .35), line: 3, boil: .6 });
  }
  function watchShot(ctx, t, lt, dur) {
    const T3 = 111.58, crack = age(t, T3) >= 0, ka = age(t, T3), z = 1 + .07 * easeOut(lt / dur) + (crack ? .05 * Math.exp(-ka * 9) : 0), sh = shake(t, crack ? 16 * Math.exp(-ka * 10) : 0);
    cam(ctx, 960 + sh[0], 560 + sh[1], z);
    night(ctx, { max: .5 });
    depth(ctx, 9, c => moon(c, 1600, 260, 230));
    const spin = seg(t, 111.3, T3 - VLEAD), secs = crack ? clockSecs(3, 0, 0) + Math.floor(ka * 2) : clockSecs(3, 0, 0) - 3600 * (1 - easeOut(spin)) * .9;
    pocketWatch(ctx, 1040, 700, 250, { secs, left: 0, crack: crack ? 1 : 0, digital: 'T+10h', label: 'SAT 3:00 AM', rot: .06 });
    if (crack && ka < .3) krackle(ctx, 1040, 700, 300, { n: 40, size: 18, color: INK.paper, seed: 5 });
    pager(ctx, 390, 820, 300, t, { rot: -.18, buzz: pulse(t, 6) });
    ctx.restore();
  }

  // ---------- 112.35 prod's down: the outage montage ----------
  const HITS = [112.35, 112.59, 112.80, 112.98, 113.13];
  const PANIC = [["thread 'worker' panicked at", INK.red], ["'called Option::unwrap()", '#E8E6F0'], [" on a None value'", '#E8E6F0'], ['note: run with RUST_BACKTRACE=1', '#8C8AA0']];
  function rackFn(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), INK.night, false);
    const x0 = w * .2, x1 = w * .8, melt = seg(t, 112.8, 113.4);
    ink(c, rect(x0, 30, x1 - x0, h * .62), { fill: INK.ink, line: 4, lineColor: INK.nightLt, boil: .6, smooth: false });
    for (let i = 0; i < 6; i++) { const y = 46 + i * h * .095; fillPts(c, rect(x0 + 14, y, x1 - x0 - 28, h * .07), mix(INK.ink, INK.nightLt, .5), false);
      for (let k = 0; k < 3; k++) fillPts(c, ell(x1 - 34 - k * 18, y + h * .035, 5, 5, 8), hash(Math.floor(t * 8) + i * 3 + k) < .6 ? INK.red : INK.redDk); }
    for (let i = 0; i < 7; i++) { const x = lerp(x0 + 10, x1 - 10, i / 6), L = (30 + hash(i) * 90) * (.4 + melt) + 20;
      inkLine(c, [[x, h * .62 + 10], [x + (hash(i + 3) - .5) * 10, h * .62 + 10 + L]], 18 + hash(i + 7) * 12, INK.orange, { taper: [0, .15] });
      fillPts(c, ell(x, h * .62 + 18 + L, 12, 15, 10), INK.orange); }
    fillPts(c, ell(w / 2, h - 22, w * .42, 22, 20), INK.orangeDk);
  }
  function err500Fn(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    fillPts(c, rect(0, 0, w, 50), '#E4DED0', false); [INK.red, INK.orange, INK.nightLt].forEach((k, i) => fillPts(c, ell(30 + i * 28, 25, 9, 9, 10), k));
    ink(c, rrect(120, 10, w - 150, 30, 15), { fill: INK.white, line: 2, boil: .3, smooth: false }); txt(c, 'smallfix.dev', 140, 33, { font: 'ui', weight: 600, size: 20, color: '#6E6A78' });
    txt(c, '500', 40, 290, { font: 'display', weight: 900, stretch: -2, size: 270, color: INK.red, extrude: { dx: 10, dy: 12, color: INK.ink } });
    txt(c, 'Internal Server Error', 44, 370, { font: 'ui', weight: 800, size: 48, color: INK.ink });
    txt(c, 'Our rabbit is looking into it.', 44, 420, { font: 'ui', weight: 500, size: 30, color: '#6E6A78' });
    rabbit(c, w - 150, h - 36, 20, { bags: 1, lids: .55, mouth: 'flat', armR: { a: 165, e: 5 }, pawR: 'point', earL: { a: -36, b: -64 }, earR: { a: 10, b: 10 } });
  }
  function montageShot(ctx, t, lt) {
    const last = lastOf(t, HITS), bump = last ? Math.exp(-age(t, last) * 12) : 0, sh = shake(t, 10 * bump);
    cam(ctx, 960 + sh[0], 560 + sh[1], 1 + .03 * seg(t, 112.35, 113.25));
    night(ctx, { max: .5 });
    const rows = [['API', 'ok'], ['Web', 'ok'], ['Database', 'ok'], ['DNS', 'ok']].map(([n], i) => [n, age(t, 112.35 + .07 + i * .105) >= 0 ? 'down' : i === 0 ? 'degraded' : 'ok']);
    scrap(ctx, 470, 770, 640, 426, -.05, slam(t, HITS[0]), t, c => statusPage(c, 0, 0, 640, t, { rows }), { seed: 1 });
    scrap(ctx, 1330, 690, 900, 330, .03, slam(t, HITS[1]), t, c => terminal(c, 0, 0, 900, 330, t, { title: 'prod-worker-7', lines: PANIC, size: 38, cps: 160, t0: HITS[1] - VLEAD }), { seed: 2 });
    scrap(ctx, 640, 790, 820, 330, -.035, slam(t, HITS[2]), t, c => { terminal(c, 0, 0, 820, 330, t, { title: 'dig', lines: [['$ dig api.smallfix.dev', '#E8E6F0'], [';; ANSWER SECTION:', INK.yellow]], size: 46 });
      if (Math.floor(t * 6) % 2) fillPts(c, rect(26, 200, 26, 46), '#E8E6F0', false); }, { seed: 3 });
    scrap(ctx, 1290, 800, 900, 470, -.02, slam(t, HITS[3]), t, c => err500Fn(c, 900, 470, t), { seed: 4 });
    scrap(ctx, 420, 830, 420, 460, .05, slam(t, HITS[4]), t, c => rackFn(c, 420, 460, t), { seed: 5 });
    ctx.restore();
    strobe(ctx, hit(t, [112.38, 112.98], 8), .5);
  }

  // ---------- 113.25 who could've known? The "Congratulations" ring ----------
  function ringShot(ctx, t, lt, dur) {
    const tc = twos(t), z = 1 + .06 * easeInOut(lt / dur), dr = drift(t, 4, .5);
    cam(ctx, 960 + dr[0], 600 + dr[1], z);
    night(ctx, { max: .5 });
    // a hard spotlight from above on the dev: flat cone + pool, halftone edge
    ctx.save(); ctx.globalAlpha = .16; fillPts(ctx, [[860, -100], [1060, -100], [1250, 930], [670, 930]], INK.paper, false); ctx.restore();
    fillPts(ctx, ell(960, 900, 820, 170, 40), INK.nightLt);
    fillPts(ctx, ell(960, 905, 300, 70, 30), lit);
    dotsIn(ctx, [560, 800, 1360, 1010], { spacing: 20, color: lit, k: (x, y) => clamp(1.25 - Math.hypot((x - 960) / 420, (y - 905) / 100)) });
    const cast = [], N = 10, beat = beatAt(tc + VLEAD);
    for (let i = 0; i < N; i++) {
      const th = Math.PI / 2 + .8 + i / (N - 1) * (TAU - 1.6) + wob(t, .15, i * .1) * .03, x = 960 + Math.cos(th) * 760, y = 890 + Math.sin(th) * 190, d = (Math.sin(th) + 1) / 2;
      cast.push({ y, fn: () => { const s = lerp(100, 160, d), clap = Math.pow(1 - frac(beat * 2 + hash(i) * .3), 3), say = (Math.floor(beat * 2) + i) % 3 === 0;
        agentBot(ctx, x, y, s, { clap, bob: clap * .6, say: say ? 'LGTM!' : null, saySize: 40 }); } });
    }
    cast.push({ y: 905, fn: () => devLit(ctx, 960, 905, 235, t, {}) });
    const lift = smooth(seg(tc, 113.85, 114.1));
    cast.push({ y: 1060, fn: () => rabbit(ctx, 1480, 1060, 30, { turn: -.4, bags: 1, lids: .55, mouth: 'flat', lx: .2, earL: { a: -36, b: -66 }, earR: { a: 12, b: 8 },
      armR: { a: lerp(8, 60, lift), e: lerp(10, 50, lift) }, pawR: 'open', armL: { a: 8, e: 10 } }) });
    cast.sort((a, b) => a.y - b.y).forEach(o => o.fn());
    ctx.restore();
  }

  // ---------- 114.85 the scroll wheel; 116.00 the freeze ----------
  const THREAD = (c, x, y, w, h, off, n) => {
    for (let i = -1; i < n; i++) { const yy = y + mod(i * 120 + off, n * 120) - 120;
      bun(c, x + 70, yy + 100, 60, { chip: CHIPS[mod(i, 6)] });
      ink(c, rrect(x + 150, yy + 22, w - 190, 88, 10), { fill: INK.white, line: 3, boil: .4, smooth: false });
      fillPts(c, rect(x + 176, yy + 46, (w - 250) * (.5 + hash(mod(i, 17)) * .4), 12), '#8A8496', false); fillPts(c, rect(x + 176, yy + 74, (w - 250) * .35, 12), '#B8B2C4', false); }
  };
  function wheelPanel(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), shadowInk, false);
    dotsIn(c, [0, 0, w, h], { spacing: 30, color: INK.nightLt, dir: [0, -1], min: .1, max: .7 });
    const notch = Math.floor(beatAt(t + VLEAD) * 2), fl = Math.exp(-frac(beatAt(t + VLEAD) * 2) * 5);
    ink(c, ell(w / 2, h * .95, 300, 440, 40), { fill: lit, shade: { color: INK.nightLt, spacing: 18, dir: [.6, .8], from: 0, to: 400 }, line: 6, boil: 1 });
    inkLine(c, [[w / 2, h * .95 - 440], [w / 2, h * .95 - 250]], 5, INK.ink, { taper: [0, 0] });
    const wx = w / 2 - 50, wy = h * .95 - 380, ww = 100, wh = 250;
    ink(c, rrect(wx - 12, wy - 12, ww + 24, wh + 24, 30), { fill: INK.ink, line: 4, boil: .6, smooth: false });
    c.save(); clipPts(c, rrect(wx, wy, ww, wh, 26), false); fillPts(c, rect(wx, wy, ww, wh), mix(INK.ink, INK.nightLt, .6), false);
    for (let i = -1; i < 12; i++) { const y = wy + i * 24 - mod(notch * 12, 24); fillPts(c, rect(wx, y, ww, 9), INK.ink, false); } c.restore();
    const fy = wy + 150 - fl * 26;
    ink(c, [[w * .66, h + 60], [w / 2 + 70, fy + 120], [w / 2 + 30, fy], [w / 2 - 40, fy - 10], [w / 2 - 70, fy + 60], [w / 2 - 50, h + 60]], { fill: '#0B0D1E', line: 5, lineColor: INK.nightLt, boil: 1 });
  }
  function pagePanel(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), lit, false);
    const lt = Math.max(0, t - 114.9), off = 30 * lt + 260 * lt * lt * lt;
    THREAD(c, 20, 0, w - 90, h, off, 6);
    fillPts(c, rect(w - 56, 0, 40, h), '#D8D2C4', false);
    ink(c, rrect(w - 52, h - 44 - off * .01, 32, 30, 12), { fill: INK.ink, line: 3, boil: .4, smooth: false });
    if (lt > .3) streaks(c, [0, 0, w - 60, h], { dir: [0, 1], n: 14, len: 60 + lt * 200, w: 5, color: rgba(INK.nightLt, .8) });
  }
  function wheelShot(ctx, t) {
    night(ctx, { max: .4 });
    scrap(ctx, 490, 330, 820, 540, -.025, slam(t, 114.86), t, c => wheelPanel(c, 820, 540, t), { seed: 11 });
    scrap(ctx, 1430, 330, 820, 540, .02, slam(t, 115.2), t, c => pagePanel(c, 820, 540, t), { seed: 12 });
    const fl = Math.exp(-frac(beatAt(t + VLEAD) * 2) * 5); if (t > 114.95) sfx(ctx, 'TIK', 250, 130, 90, (frac(beatAt(t + VLEAD) * 2)) * BEAT / 2, { life: .18, rot: -.2 });
    for (const [x0, t0, s] of [[1250, 115.35, 170], [1650, 115.6, 140], [1080, 115.8, 200]]) {
      const u = (t - t0) / .35; if (u < 0 || u > 1) continue;
      depth(ctx, 10, c => { const y = lerp(-250, 1350, u); streaks(c, [x0 - s * .6, y - s * 3, x0 + s * .6, y - s * .8], { dir: [0, 1], n: 10, len: s * 2.4, w: 8, color: rgba(INK.paper, .7) }); bun(c, x0, y, s, { sy: 1.5, chip: INK.red, rot: .1 }); });
    }
  }
  function freezeShot(ctx, t) {
    BOIL = 0;
    night(ctx, { max: .4 });
    fillPts(ctx, rect(-10, -10, 1700, 640), lit, false);
    depth(ctx, 7, c => { c.save(); c.translate(-60, -300); c.scale(2.3, 2.3); THREAD(c, 40, 0, 560, 400, 40, 4); c.restore(); });
    // the scrollbar, extreme close-up: a tiny thumb (400 comments tall page) pinned at the very bottom
    fillPts(ctx, rect(1330, -10, 330, 650), '#D8D2C4', false); inkLine(ctx, [[1330, -10], [1330, 640]], 4, INK.ink, { taper: [0, 0], smooth: false });
    ink(ctx, [[1420, 575], [1570, 575], [1495, 620]], { fill: '#8A8496', line: 4, boil: 0, smooth: false });
    ink(ctx, rrect(1360, 360, 270, 196, 60), { fill: INK.ink, line: 7, lineColor: INK.ink, boil: 0, smooth: false });
    fillPts(ctx, rrect(1385, 380, 30, 150, 14), INK.nightLt, false);
    ink(ctx, rect(-20, 632, 1720, 16), { fill: INK.ink, line: 0, boil: 0 });
    desk(ctx, 648, t);
    depth(ctx, 11, c => { streaks(c, [110, -300, 560, 180], { dir: [0, 1], n: 10, len: 500, w: 10, color: rgba(INK.paper, .6), seed: 4 }); bun(c, 340, 360, 260, { sy: 1.4, chip: INK.red, rot: .12 }); });
    cursor(ctx, 1500, 450, 250, { tremble: 3, sweat: 1 });
  }

  // ---------- 116.80 the scroll back ----------
  function scrollAShot(ctx, t) {
    const u = seg(t, 116.8, 117.62), S = 26000 * Math.pow(u, 2.4), v = 26000 * 2.4 * Math.pow(u, 1.4) / .82 / 24, sy = clamp(1 + v / 260, 1, 6);
    cam(ctx, 960, 540, 1 - .14 * easeIn(u), -.2 * easeIn(u));
    night(ctx, { max: .4 });
    fillPts(ctx, rect(280, -900, 1360, H + 1800), lit, false);
    ctx.save(); clipPts(ctx, rect(280, -900, 1360, H + 1800), false);
    for (let i = -8; i < 14; i++) { const yy = mod(i * 150 + S, 22 * 150) - 8 * 150, cy = yy + 60;
      ctx.save(); ctx.translate(0, cy); ctx.scale(1, sy); ctx.translate(0, -cy);
      bun(ctx, 390, yy + 110, 80, { chip: CHIPS[mod(i, 6)] });
      ink(ctx, rrect(500, yy + 20, 1080, 110, 12), { fill: INK.white, line: 4, boil: .5, smooth: false });
      fillPts(ctx, rect(530, yy + 52, 700 + hash(mod(i, 13)) * 250, 16), '#8A8496', false); fillPts(ctx, rect(530, yy + 88, 420, 16), mod(i, 3) === 0 ? INK.red : '#B8B2C4', false);
      ctx.restore(); }
    ctx.restore();
    fillPts(ctx, rect(1660, -900, 50, H + 1800), '#D8D2C4', false);
    ink(ctx, rrect(1664, lerp(980, 40, easeIn(u)), 42, 60, 16), { fill: INK.ink, line: 3, boil: .4, smooth: false });
    if (u > .25) streaks(ctx, [-200, -300, W + 200, H + 300], { dir: [0, 1], n: 40, len: 200 + v * 2, w: 6, color: rgba(INK.paper, .55) });
    ctx.restore();
  }
  // callback cut-outs for the reverse rabbit hole (reverse chronology)
  function shipFn(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), INK.paper, false);
    for (let i = 0; i < 4; i++) inkLine(c, [[0, h * .8 + i * 18], [w * .3, h * .78 + i * 18], [w * .6, h * .82 + i * 18], [w, h * .79 + i * 18]], 4, INK.ink, { taper: [0, 0] });
    for (let i = 0; i < 3; i++) ink(c, blob(w * .62 + i * 50, h * .2 - i * 26, 30 + i * 10, i + Math.floor(t * 8) % 3, .25, 12), { fill: INK.ink, line: 0 });
    ink(c, rect(w * .56, h * .3, 44, h * .3), { fill: INK.ink, line: 4, smooth: false }); fillPts(c, rect(w * .56, h * .36, 44, 16), INK.red, false);
    ink(c, [[w * .12, h * .6], [w * .9, h * .6], [w * .8, h * .8], [w * .2, h * .8]], { fill: INK.ink, line: 5, smooth: false });
    ink(c, rect(w * .28, h * .46, w * .24, h * .14), { fill: INK.white, line: 4, smooth: false });
    ink(c, rrect(w * .14, h * .52, w * .72, 30, 6), { fill: INK.red, line: 3, smooth: false });
    txt(c, 'req.query.name', w * .5, h * .52 + 22, { font: 'mono', weight: 800, size: 20, color: INK.white, align: 'center' });
    txt(c, 'shipped.', 24, 46, { font: 'hand', weight: 800, size: 34, color: INK.ink });
  }
  function poemFn(c, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.paper, false);
    ["fourteen thousand lines of 'fix',", 'a key, a null, a skipped-test mix.', 'I read them all. I always do.', 'hop hop \u2014 I wrote this for you.'].forEach((l, i) => txt(c, l, 30, 80 + i * 62, { font: 'hand', weight: 700, size: 29, color: INK.ink }));
    stamp(c, 'RESOLVED', w * .62, h * .8, 56, 1, { color: INK.red, rot: -.1 });
  }
  function diagramFn(c, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    ['Client', 'API', 'DB'].forEach((s, i) => { const x = 90 + i * 200; ink(c, rect(x - 70, 30, 140, 56), { fill: INK.paper, line: 4, smooth: false }); txt(c, s, x, 68, { font: 'ui', weight: 800, size: 28, align: 'center' });
      c.save(); c.setLineDash([10, 10]); c.strokeStyle = INK.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 86); c.lineTo(x, h - 20); c.stroke(); c.restore(); });
    [[90, 290, 140, 'GET /user'], [290, 490, 200, 'SELECT'], [490, 290, 260, 'null']].forEach(([a, b, y, s]) => { inkLine(c, [[a, y], [b, y]], 4, INK.ink, { taper: [0, 0] }); fillPts(c, [[b, y], [b - Math.sign(b - a) * 18, y - 10], [b - Math.sign(b - a) * 18, y + 10]], INK.ink, false); txt(c, s, (a + b) / 2, y - 12, { font: 'mono', weight: 700, size: 20, align: 'center' }); });
    ink(c, rect(330, 290, 170, 70), { fill: INK.red, line: 3, smooth: false }); txt(c, 'null?', 415, 338, { font: 'hand', weight: 800, size: 34, color: INK.white, align: 'center' });
    txt(c, 'Seen by 0', w - 24, h - 20, { font: 'ui', weight: 700, size: 22, color: '#6E6A78', align: 'right' });
  }
  function waveFn(c, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.paper, false);
    const wave = [[0, h], [0, h * .55], [w * .3, h * .35], [w * .55, h * .12], [w * .78, h * .1], [w * .92, h * .24], [w * .8, h * .3], [w * .7, h * .24], [w * .66, h * .4], [w * .8, h * .62], [w, h * .7], [w, h]];
    c.save(); clipPts(c, wave); fillPts(c, rect(0, 0, w, h), INK.white, false);
    for (let y = 20; y < h; y += 30) for (let x = 10 + (y % 60 ? 15 : 0); x < w; x += 30) txt(c, '+', x, y, { font: 'mono', weight: 800, size: 26, color: INK.ink });
    c.restore(); outline(c, wave, 5, INK.ink);
    txt(c, '$ git push --force', 24, 44, { font: 'mono', weight: 800, size: 28, color: INK.ink });
  }
  function keyFn(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), INK.ink, false);
    const k = [[80, 150], [230, 150], [230, 130], [440, 130], [440, 160], [410, 160], [410, 200], [380, 200], [380, 160], [350, 160], [350, 190], [320, 190], [320, 160], [230, 160], [230, 170], [80, 170]];
    ink(c, ell(120, 160, 70, 70, 28), { fill: INK.orangeLt, shade: { color: INK.orange, spacing: 12, dir: [.6, .8], from: -20, to: 70 }, line: 6 });
    fillPts(c, ell(120, 160, 30, 30, 20), INK.ink);
    ink(c, k.slice(1, 15), { fill: INK.orangeLt, shade: { color: INK.orange, spacing: 12, dir: [0, 1], from: 0, to: 40 }, line: 5, smooth: false });
    for (let i = 0; i < 3; i++) { const p = frac(t * 2 + i * .33); ink(c, star(180 + i * 110, 70 + i * 30, 22 * Math.sin(p * Math.PI) + 4, .3, 4), { fill: INK.paper, line: 0, smooth: false }); }
    txt(c, 'sk_live_HOPHOPNOPE_4f9\u2026', 30, h - 40, { font: 'mono', weight: 800, size: 26, color: INK.orangeLt });
  }
  function consoleFn(c, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    ['here', 'here2', 'HERE???', 'why', 'asdf', 'it works??'].forEach((s, i) => txt(c, `console.log("${s}");`, 30, 60 + i * 52, { font: 'mono', weight: 700, size: 30, color: INK.ink }));
    txt(c, '46', w - 40, h - 30, { font: 'display', weight: 900, size: 110, color: INK.orange, align: 'right', stroke: { w: 8, color: INK.ink } });
  }
  function diffFn(c, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    txt(c, '+14,203', 30, 170, { font: 'mono', weight: 800, size: 130, color: INK.ink });
    txt(c, '\u221212', 34, 250, { font: 'mono', weight: 800, size: 60, color: INK.red });
    for (let i = 0; i < 5; i++) fillPts(c, rect(250 + i * 50, 208, 40, 40), i < 4 ? INK.ink : INK.red, false);
  }
  const watchFn = (c, w, h) => { fillPts(c, rect(0, 0, w, h), INK.night, false); pocketWatch(c, w / 2, h / 2 + 30, 160, { secs: clockSecs(16, 58, 30), left: 90 }); };
  const MEM = [[shipFn, 560, 380], [poemFn, 560, 340], [diagramFn, 600, 380], [waveFn, 600, 380], [keyFn, 520, 300], [consoleFn, 600, 380], [diffFn, 580, 290], [watchFn, 440, 460]];

  // ---------- 119.90 the comment ----------
  const CARD = { author: 'coderabbitai', time: '10 hours ago', chip: 'critical', body: ['Unsanitized input on line 9012 \u2192 SQL injection.', 'Sanitize this input.', ''], buttons: false };
  const REPLY = [['As', 120.00], ['mentioned', 120.68], ['above.', 121.36]];
  function cardGroup(ctx, t) {
    const K = 1.86;
    ctx.save(); ctx.translate(120, 70); ctx.scale(K, K); commentCard(ctx, 0, 0, 1680 / K, t, CARD); ctx.restore();
    pawPrint(ctx, 1600, 215, 210, .35);
    // the reply composer
    uiBox(ctx, 120, 560, 1680, 400, { r: 14, shadow: 12 });
    txt(ctx, 'Write', 170, 616, { font: 'ui', weight: 800, size: 30, color: INK.ink }); txt(ctx, 'Preview', 270, 616, { font: 'ui', weight: 600, size: 30, color: '#6E6A78' });
    fillPts(ctx, rect(160, 632, 90, 5), INK.orange, false); inkLine(ctx, [[140, 640], [1780, 640]], 3, '#D8D2C4', { taper: [0, 0], smooth: false });
    avatar(ctx, 220, 740, 50, 'rabbit');
    let s = '', n = 0, x = 300; const f = { font: 'ui', weight: 800, size: 104 };
    REPLY.forEach(([w, a], i) => { const k = clamp(Math.floor(age(t, a) * 24 / 1.5 + 1), 0, w.length); if (k > 0) { s += (i ? ' ' : '') + w.slice(0, k); n = i + 1; } });
    if (!s) txt(ctx, 'Leave a reply\u2026', x, 790, { ...f, weight: 600, size: 60, color: '#A8A2B4' });
    else txt(ctx, s, x, 800, { ...f, color: INK.ink });
    const done = n === 3 && s.endsWith('above.');
    if (done) { const w0 = measure(ctx, 'As mentioned ', f).w, w1 = measure(ctx, 'above.', f).w; inkLine(ctx, [[x + w0 - 6, 826], [x + w0 + w1 * .5, 832], [x + w0 + w1 + 8, 822]], 11, INK.orange, { taper: [.1, .3] }); }
    else if (t < SILENT || s) fillPts(ctx, rect(x + (s ? measure(ctx, s, f).w : 0) + 10, 715, 10, 104), INK.ink, false);
    button(ctx, 1500, 860, 260, 70, 'Comment', { fill: INK.ink, size: 30, noShade: true });
  }
  function tunnelShot(ctx, t) {
    const u = seg(t, 117.62, 119.9), L = 9.4, D = L * (1 - Math.pow(1 - u, 1.6)), spin = -D * .75;
    night(ctx, { dots: false });
    // the vortex, unwinding the other way (the intro's rabbit hole in reverse)
    ctx.save(); ctx.translate(960, 540);
    for (let i = 0; i < 24; i++) { const a0 = i / 24 * TAU + spin, L_ = [], R_ = [];
      for (let j = 0; j <= 22; j++) { const r = 20 * Math.pow(1.24, j), th = a0 + Math.log(r) * .9, w = r * .05, ca = Math.cos(th), sa = Math.sin(th); L_.push([ca * r - sa * w, sa * r + ca * w]); R_.push([ca * r + sa * w, sa * r - ca * w]); }
      fillPts(ctx, [...L_, ...R_.reverse()], i % 2 ? INK.nightLt : rgba(INK.orange, .55), false); }
    ctx.restore();
    dotsIn(ctx, [0, 0, W, H], { spacing: 40, color: INK.night, k: (x, y) => clamp(1.2 - Math.hypot(x - 960, y - 540) / 420) });
    if (u < .6) speedLines(ctx, 960, 540, { n: 50, r0: 300 + u * 500, r1: 1400, w: 7, color: rgba(INK.paper, .4 * (1 - u / .6)) });
    dotWipe(ctx, seg(t, 119.3, 119.75), INK.night, { dir: [0, 1], spacing: 44 });
    // flying cut-outs, far to near
    const list = MEM.map(([fn, w, h], i) => ({ d: 1.1 + i * 1.0, fn, w, h, i })).concat([0, 1, 2, 3, 4].map(i => ({ d: .25 + i * .22, bun: true, i })));
    const card = L + 1;
    const sc = 1 / (card - D); ctx.save(); ctx.translate(960, 540); ctx.scale(sc, sc); ctx.translate(-960, -540); cardGroup(ctx, t); ctx.restore();
    list.map(o => ({ ...o, z: o.d - D })).filter(o => o.z > .28 && o.z < 14).sort((a, b) => b.z - a.z).forEach(o => {
      const s = .9 / o.z, ph = o.i * 2.4 + (o.bun ? 1 : 0) + spin * .6, r = (o.bun ? 1.2 : .85) * 430 * s, x = 960 + Math.cos(ph) * r, y = 540 + Math.sin(ph) * r * .75;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(o.i * 3.1) * .3 + spin * .2);
      if (o.bun) bun(ctx, 0, 60, 150, { chip: CHIPS[o.i], eyes: 'dot' }); else cutout(ctx, -o.w / 2, -o.h / 2, o.w, o.h, 0, t, c => o.fn(c, o.w, o.h, t), { seed: o.i * 5 });
      ctx.restore(); });
  }
  function commentShot(ctx, t) {
    const still = t >= SILENT; if (still) BOIL = 0;
    const z = 1 + .025 * easeOut(seg(Math.min(t, SILENT), 119.9, SILENT));
    night(ctx, { max: .35, sp: 50 });
    cam(ctx, 960, 540, z); cardGroup(ctx, t); ctx.restore();
  }

  chapter('final', 104.63, 122.25, [
    [104.63, slamShot], [105.90, hangShot], [107.10, hopShot], [108.35, devShot], [110.80, yepShot], [111.40, watchShot],
    [112.35, montageShot], [113.25, ringShot], [114.85, wheelShot], [116.00, freezeShot], [116.80, scrollAShot], [117.62, tunnelShot], [119.90, commentShot],
  ]);
})();
