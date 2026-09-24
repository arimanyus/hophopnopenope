// c03_chorus1.js: Chorus 1, the stage (32.09-47.74). Pink + yellow. Eager and proud -> ignored -> resigned.
(() => {
  const A = 32.09, B = 47.74, BAGS = .1, GREY = '#DCD6CA', GREYD = '#6E6A78';
  const at = T => T - VLEAD;                                   // hits, and cuts on hits, land one frame early
  const wd = (li, wi) => LINES[li].words[wi].a;
  const age = (t, T) => t - at(T);
  const POPS = [wd(8, 0), wd(8, 1), wd(8, 2)];                 // Three / little / comments
  const HOPS = [wd(8, 6), wd(8, 7)];                           // (hop! hop!)
  const NOPES = [wd(9, 6), wd(9, 7)];                          // (nope! nope!)
  const CLICKS = [wd(10, 0), wd(10, 1)];                       // Click, click
  const ALL = wd(10, 3), THUMBS = wd(10, 4), UP = wd(10, 5);
  const ECHO = [wd(11, 0), wd(11, 1)];                         // Hop, hop
  const pose = o => ({ bags: BAGS, ...o });

  // ---------- helpers ----------
  // fn drawn through camera C = [cx, cy, zoom, rot], defocused by px (misregistered plates = depth of field)
  function plate(ctx, C, px, fn) { depth(ctx, px, c => { cam(c, ...C); fn(c); c.restore(); }); }
  // plain colour field, darkening to a halftone at the edges
  function field(ctx, col, o = {}) {
    fillPts(ctx, rect(-300, -300, W + 600, H + 600), col, false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: rgba(INK.ink, o.dark ?? .2), angle: .5,
      k: (x, y) => clamp(Math.hypot((x - 960) / 1100, (y - (o.cy ?? 620)) / 700) * 1.9 - 1.05) * .9 });
  }
  function shadow(ctx, x, y, rx, k = 1) { ctx.save(); ctx.globalAlpha = .22 * k; fillPts(ctx, ell(x, y, rx, rx * .18, 20), INK.ink); ctx.restore(); }
  // comment-bunny standing on ground point (x, y), with its shadow
  function bun(ctx, x, y, s, o = {}) {
    const u = s / 10, h = o.hop || 0;
    shadow(ctx, x - u, y, 5.5 * u / (1 + h * .06), 1 / (1 + h * .08));
    commentBunny(ctx, x, y - .9 * u, s, o);
  }
  // the third comment rides in the hoodie's kangaroo pocket: drawn over the chest, clipped at the pocket's top edge
  function pocketBun(ctx, a, s, o = {}) {
    const bs = s * 1.95, u = bs / 10, top = a.pocket[1] - .5 * s, rise = o.rise ?? 1;
    if (rise <= 0) return;
    ctx.save(); clipPts(ctx, rect(a.pocket[0] - 14 * u, top - 24 * u, 28 * u, 24 * u), false);
    commentBunny(ctx, a.pocket[0], top + lerp(14, 3.2, rise) * u, bs, o);
    ctx.restore();
  }
  // grey "Resolved" bar standing on (x, y); k = vertical pop
  function bar(ctx, x, y, w, k = 1) {
    if (k <= 0) return; const h = w * .24;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + (1 - k) * .25, k);
    fillPts(ctx, rrect(-w / 2 + 7, -h + 8, w, h, h * .28), rgba(INK.ink, .85), false);
    ink(ctx, rrect(-w / 2, -h, w, h, h * .28), { fill: GREY, line: 5, lineColor: GREYD, boil: .5, smooth: false });
    txt(ctx, '\u2713 Resolved', 0, -h * .31, { font: 'ui', weight: 800, size: h * .5, color: GREYD, align: 'center' });
    ctx.restore();
  }
  function ring(ctx, x, y, a, r = 110, col = INK.pink, life = .3, w = 9) {
    if (a < 0 || a > life) return; const k = a / life, R = 14 + easeOut(k) * r;
    ctx.save(); ctx.globalAlpha = 1 - k * k; outline(ctx, ell(x, y, R, R, 28), w * (1 - k) + 2, col); ctx.restore();
  }
  function popFx(ctx, x, y, r, a, col = INK.white) {
    if (a < 0 || a > .22) return; const k = a / .22;
    ctx.save(); ctx.globalAlpha = 1 - k * k;
    ink(ctx, burstPts(x, y, r * (.45 + k * .8), 9, 7, .5), { fill: col, line: 5, boil: 0, smooth: false });
    ctx.restore();
    krackle(ctx, x, y, r * (1 + k), { n: 14, size: 13 * (1 - k) + 3, seed: 3 });
  }
  function poof(ctx, x, y, r, a, life = .5) {
    if (a < 0 || a > life) return; const k = a / life, e = easeOut(k);
    if (k < .35) ink(ctx, burstPts(x, y, r * (.6 + k * 2), 12, 5, .35), { fill: INK.white, line: 5, boil: 0, smooth: false });
    for (let i = 0; i < 9; i++) {
      const an = i / 9 * TAU + .4, d = r * (.25 + e * 1.05), rr = r * (.48 - k * .36) * (.75 + hash(i * 3) * .5);
      ink(ctx, ell(x + Math.cos(an) * d, y + Math.sin(an) * d * .75, rr, rr, 14), { fill: INK.white, shade: { color: GREY, spacing: 12, dir: [.5, .85], from: -rr * .2, to: rr }, line: 4, boil: 1.2, seed: i });
    }
  }
  // the chorus-stage marquee; big = only the counter, at must-read size (for the strike)
  function marquee(ctx, t, n, o = {}) {
    ink(ctx, rrect(360, 36, 1200, 150, 20), { fill: INK.ink, line: 6, boil: .8, smooth: false });
    for (let i = 0; i < 34; i++) { const on = (Math.floor(t * 8) + i) % 3 !== 0, px = 380 + i * 34.6; for (const py of [52, 170]) fillPts(ctx, ell(px, py, 8, 8, 8), on ? INK.yellow : '#5A4A20'); }
    const s = `Actionable comments posted: ${n}`, f = { font: 'ui', weight: 800, size: o.big ? 60 : 36 }, mw = measure(ctx, s, f).w, y = o.big ? 132 : 152;
    if (!o.big) txt(ctx, `${PR.title} #${PR.num}`, 960, 104, { font: 'ui', weight: 900, size: 40, color: INK.white, align: 'center' });
    txt(ctx, s, 960, y, { ...f, color: INK.yellow, align: 'center' });
    const k = o.strike || 0;
    if (k > 0) inkLine(ctx, [[960 - mw / 2 - 18, y - f.size * .3], [960 - mw / 2 - 18 + (mw + 36) * k, y - f.size * .42]], f.size * .24, INK.pink, { taper: [.04, .15] });
  }
  // the dev's thumbs-up, in this chorus's inks (pink cuff)
  function thumb(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const u = s / 10, lw = Math.max(4, .45 * u), hand = [[-3.5 * u, -1 * u], [-1 * u, -1.5 * u], [0, -5.5 * u], [.8 * u, -8 * u], [2.4 * u, -7.4 * u], [2.2 * u, -3 * u], [4.8 * u, -3 * u], [5.2 * u, -1.6 * u], [4.6 * u, 4.2 * u], [-3.5 * u, 4.2 * u]];
    ink(ctx, hand, { fill: INK.yellow, shade: { color: INK.orange, spacing: Math.max(12, u * .9), dir: [.5, .85], from: -3 * u, to: 5 * u }, line: lw, boil: 1, smooth: false });
    ink(ctx, rrect(-6 * u, -1.8 * u, 2.8 * u, 6.8 * u, .8 * u), { fill: INK.pink, line: lw, boil: .8, smooth: false });
    for (let i = 0; i < 3; i++) inkLine(ctx, [[1.6 * u, (-.8 + i * 1.6) * u], [4.8 * u, (-.8 + i * 1.6) * u]], Math.max(2.5, .3 * u), INK.ink, { taper: [.1, .3] });
    ctx.restore();
  }
  // red review pen held in a paw
  function penAt(ctx, x, y, s, rot) {
    ink(ctx, xform(rrect(-1.6, -.2, 3.2, .4, .14), x, y, s, rot), { fill: INK.red, line: 3.4, boil: .6, smooth: false });
    ink(ctx, xform([[1.6, -.2], [2.15, 0], [1.6, .2]], x, y, s, rot), { fill: INK.fur, line: 3, boil: 0, smooth: false });
  }
  // a comment curled up into a boulder
  function boulder(ctx, x, y, r, rot, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    for (const side of [-1, 1]) {
      const sp = [[side * .3 * r, -.75 * r], [side * .42 * r, -1.2 * r], [side * .36 * r, -1.55 * r]];
      ink(ctx, tube(sp, k => (.3 - k * .1) * r * Math.sin(Math.PI * (.2 + .8 * k)) + .05 * r, 8), { fill: INK.white, line: 6, boil: 1.4 });
      fillPts(ctx, tube(sp.map(([a, b]) => [a, b + .08 * r]), k => (.13 - k * .04) * r * Math.sin(Math.PI * (.2 + .8 * k)) + .02 * r, 6), INK.earIn);
    }
    const body = ell(0, 0, r, r * .9, 28); body.splice(19, 0, [-.35 * r, .86 * r], [-.72 * r, 1.12 * r], [-.62 * r, .7 * r]);
    ink(ctx, body, { fill: INK.white, shade: { color: rgba(INK.pink, .4), spacing: 14, dir: [.4, .9], from: -r * .2, to: r }, line: 7, boil: 1.6 });
    for (const side of [-1, 1]) { fillPts(ctx, ell(side * .3 * r, -.2 * r, .11 * r, .14 * r, 12), INK.ink); fillPts(ctx, ell(side * .3 * r - .04 * r, -.25 * r, .04 * r, .04 * r, 8), INK.white); }
    for (let i = 0; i < 2; i++) inkLine(ctx, [[-.5 * r, (.18 + i * .2) * r], [(i ? .2 : .5) * r, (.18 + i * .2) * r]], 6, '#8A8496', { taper: [0, 0], smooth: false });
    ctx.restore();
  }

  // ---------- 1. SLAM: the stage, jazz hands, three comments pop up ----------
  // a comment-bunny springs out of a trapdoor on its word, lands, settles, then bobs on the beat
  function popBunny(ctx, t, T, x, y, s, look) {
    const a = age(t, T), u = s / 10; if (a < -.08) return;
    if (a < 0) { const k = 1 + a / .08; fillPts(ctx, ell(x, y, 5.5 * u * k, 1.1 * u * k, 20), INK.ink); return; }
    let hop, sq;
    if (a < .15) { hop = -13 + 17 * Math.sin(a / .15 * Math.PI / 2); sq = -.35; }
    else if (a < .32) { const k = (a - .15) / .17; hop = 4 * (1 - k * k); sq = -.35 * (1 - k); }
    else { const k = twos(t) - at(T) - .32; hop = .7 * Math.max(0, Math.sin(beatAt(t + VLEAD) * Math.PI)) ** 4; sq = .4 * Math.exp(-k * 12) * Math.cos(k * 30); }
    if (a < .3) { const k = clamp(1 - (a - .12) / .18); fillPts(ctx, ell(x, y, 5.5 * u * k, 1.1 * u * k, 20), INK.ink); }
    popFx(ctx, x, y - 6 * u, 16 * u, a);
    ctx.save(); clipPts(ctx, rect(x - 20 * u, y - 30 * u, 40 * u, 30 * u + .2 * u), false);
    bun(ctx, x, y, s, { hop, sq, eyes: a < .6 ? 'happy' : 'dot', look, ears: hop > 1 ? .4 : 0 });
    ctx.restore();
  }
  function slam(ctx, t, lt, dur) {
    const tc = twos(t), h = Math.exp(-lt * 8), [sx, sy] = shake(t, 30 * h * h);
    const C = [960 + sx, 630 + sy, 1.38 + .22 * h * h + .06 * easeInOut(lt / dur), 0];
    plate(ctx, C, 5, c => stage(c, t, { marquee: false, spin: .05 }));
    ctx.save(); ctx.translate(sx, sy); marquee(ctx, t, 3); ctx.restore();
    cam(ctx, ...C);
    const G = 905;
    popBunny(ctx, t, POPS[0], 530, G, 185, .7);
    popBunny(ctx, t, POPS[1], 1390, G, 185, -.7);
    // rabbit: lands from a jump into jazz hands, glances at each new comment, then down at its pocket
    const P0 = at(POPS[0]), P1 = at(POPS[1]), P2 = at(POPS[2]);
    const la = lt < .08 ? 1 : Math.exp(-(tc - A - .08) * 9) * Math.cos((tc - A - .08) * 26);
    const look = kf(tc, [[P0, 0], [P0 + .08, -1], [P0 + .42, -1], [P0 + .52, 0], [P1, 0], [P1 + .08, 1], [P1 + .36, 1], [P1 + .46, 0]], easeOut);
    const down = kf(tc, [[P2, 0], [P2 + .06, 1], [P2 + .24, 1], [P2 + .34, 0]], easeOut);
    const jazz = (Math.floor(tc * 12) % 2 ? 1 : -1) * 7, reach = backOut(clamp(lt / .2), 2);   // arms fling out on the slam, paws shake on twos
    const a = rabbit(ctx, 960, 1000, 32, pose({ sq: .45 * la, ...earsFor(-la * .8),
      armL: { a: lerp(60, 132, reach) + jazz, e: 22 - jazz }, armR: { a: lerp(60, 132, reach) - jazz, e: 22 + jazz }, pawL: 'open', pawR: 'open',
      eyes: Math.abs(look) > .3 || down > .3 ? 'open' : 'happy', lx: look, ly: down * .9, nod: down * .3, turn: look * .3,
      mouth: down > .3 ? 'o' : 'grin', blush: .5 + down * .4 }));
    const pa = age(t, POPS[2]);
    pocketBun(ctx, a, 32, { rise: pa < 0 ? 0 : backOut(clamp(pa / .16), 3.2), eyes: pa < .5 ? 'happy' : 'dot', ears: pa < .3 ? .5 : 0, look: -.2 });
    popFx(ctx, a.pocket[0], a.pocket[1] - 12, 55, pa);
    ctx.restore();
    if (lt < .05) duotone(ctx, INK.ink, INK.yellow, 2.4);        // impact frame
    misregFrame(ctx, 22 * h * h);
  }

  // ---------- 2. Chorus line: arm in arm, a wave of hops rippling across the line ----------
  function line(ctx, t, lt, dur) {
    const tc = twos(t), z = lerp(1.4, 1.52, easeInOut(lt / dur)), [dx, dy] = drift(t, 8);
    const C = [960 + dx, 1075 - 515 / z + dy, z, 0];                              // feet pinned near the frame bottom through the push-in
    plate(ctx, C, 6, c => stage(c, t, { a: INK.yellow, b: INK.pink, spin: -.06, marquee: false }));
    cam(ctx, ...C);
    const G = 1075, sway = Math.sin(beatAt(tc + VLEAD) * Math.PI);
    const hops = (i, ht = 1.5) => { let h = 0, sq = 0, vy = 0; for (let b = 79; b <= 83; b++) { const r = hopArc(t, beatTime(b) - VLEAD + i * .07, .27, ht); h += r.h; sq += r.sq; vy += r.vy; } return { h, sq, vy }; };
    const xs = [700, 960, 1220];
    [0, 2].forEach(i => { const hp = hops(i); bun(ctx, xs[i], G - 8, 185, { hop: hp.h * 30 / 18.5, sq: hp.sq, rot: sway * .08, ears: -hp.vy * .6, eyes: hp.h > .3 ? 'happy' : 'dot', look: i ? -.5 : .5 }); });
    const hp = hops(1, .9);
    const a = rabbit(ctx, xs[1], G, 30, pose({ hop: hp.h, sq: hp.sq, legs: 'hop', lean: sway * 6, ...earsFor(hp.vy),
      armL: { a: 100, e: -10 }, armR: { a: 100, e: -10 }, pawL: 'open', pawR: 'open', eyes: hp.h > .3 ? 'happy' : 'open', mouth: 'grin', blush: .4, lx: sway * .3 }));
    pocketBun(ctx, a, 30, { eyes: hp.h > .3 ? 'happy' : 'dot', ears: -hp.vy * .5 });
    ctx.restore();
  }

  // ---------- 3. POINT CHOREO 1 (the template for every chorus) ----------
  // Static camera, full body, plain colour field; the rabbit and its comments hop in unison on `times`, ears flicking,
  // with a HOP! lettered on each hop. bunnies: [[x, groundY, s]]; bars: resolved bars [[x, y, w]]; sad: the lonely echo.
  function hopShot(ctx, t, { field: col = INK.pink, bunnies = [], bars = [], times, x = 960, y = 980, s = 40,
    height = 3.2, word = 'HOP!', size = 200, wordColor = INK.yellow, pocket = false, sad = false }) {
    field(ctx, col);
    let h = 0, sq = 0, vy = 0;
    for (const T of times) { const r = hopArc(t, at(T), .29, height); h += r.h; sq += r.sq; vy += r.vy; }
    const up = clamp(h / height), happy = !sad && up > .25;
    for (const [bx, by, bw] of bars) bar(ctx, bx, by, bw);
    for (const [bx, by, bs] of bunnies) bun(ctx, bx, by, bs, { hop: h * s / (bs / 10), sq, ears: -vy * .6 + up * .4, eyes: happy ? 'happy' : 'dot', look: (x - bx) / 900 });
    const arm = sad ? { a: 8 + up * 25, e: 8 } : { a: lerp(35, 140, up), e: lerp(40, -12, up) };
    const a = rabbit(ctx, x, y, s, pose({ hop: h, sq, legs: 'hop', ...earsFor(vy, sad ? -38 : 0), armL: arm, armR: arm, pawL: 'open', pawR: 'open',
      eyes: happy ? 'happy' : 'open', lids: sad ? .45 : 0, mouth: sad ? 'flat' : 'grin', blush: sad ? 0 : .5 }));
    if (pocket) pocketBun(ctx, a, s, { eyes: happy ? 'happy' : 'dot', ears: -vy * .6 + up * .4, rise: 1 + up * .8 });
    times.forEach((T, i) => sfx(ctx, word, i % 2 ? W - 430 : 430, 330, size, age(t, T), { rot: i % 2 ? .12 : -.13, life: .8, color: wordColor, dots: !sad }));
  }
  const hop1 = (ctx, t) => hopShot(ctx, t, { times: HOPS, bunnies: [[520, 985, 205], [1400, 985, 205]], pocket: true });

  // ---------- 4. The cursor whooshes past, not reading; every eye follows it ----------
  const PASSES = [[35.87, 36.13, -1, 640], [36.58, 36.82, 1, 690]];              // [start, end, direction, tip y]
  const X0 = 20, X1 = 1900;                                                       // pass span in stage coords (just past the zoomed frame)
  const passX = ([a, b, d], tt) => { const k = (tt - a) / (b - a); return d < 0 ? lerp(X1, X0, k) : lerp(X0, X1, k); };
  const cursorX = tt => { let x = 2600; for (const p of PASSES) if (tt >= p[0]) x = passX(p, tt); return x; };
  const passT = ([a, b, d], bx) => a + (d < 0 ? X1 - bx : bx - X0) / (X1 - X0) * (b - a);
  function whoosh(ctx, t, lt, dur) {
    const tc = twos(t), cxN = cursorX(t), pass = PASSES.filter(p => t >= p[0]).pop() || PASSES[0];
    const onScreen = cxN > X0 && cxN < X1, [sx, sy] = shake(t, onScreen ? 7 : 0);
    const C = [960 + clamp((cxN - 960) * .03, -30, 30) + sx, 641 + sy, 1.3, 0];
    plate(ctx, C, 6, c => stage(c, t, { marquee: false, spin: .05 }));
    cam(ctx, ...C);
    const G = 1035, lookAt = bx => clamp((cursorX(tc - .04) - bx) / 480, -1, 1), after = seg(tc, 36.9, 37.12);
    const bump = bx => PASSES.reduce((m, p) => Math.max(m, Math.exp(-(((tc - passT(p, bx) - .07) / .12) ** 2))), 0);   // "pick me!" hop just after it passes
    [560, 1360].forEach(bx => { const b = bump(bx); bun(ctx, bx, G, 200, { hop: 2.6 * b, sq: -.3 * b + .12 * after, look: lookAt(bx), eyes: after > .3 ? 'sad' : b > .3 ? 'wide' : 'dot', ears: b * .6 - after * .8 + pass[2] * b * .5 }); });
    const b = bump(960), wave = tc < 36.3 ? 1 : 1 - seg(tc, 36.84, 37.05);
    const a = rabbit(ctx, 960, G + 10, 38, pose({ hop: b * .7, sq: -.2 * b, turn: lookAt(960) * .5, lx: lookAt(960), ly: -.2 * b,
      armR: { a: lerp(15, 140 + wob(tc, 4) * 6, wave), e: lerp(10, 8 + wob(tc, 4, .25) * 28, wave) }, pawR: 'open', armL: { a: 12, e: 12 },
      earL: { a: -14 - after * 20, b: pass[2] * 40 * b }, earR: { a: 12 + after * 16, b: pass[2] * 40 * b + after * 60 },
      eyes: b > .3 ? 'wide' : 'open', mouth: after > .3 ? 'flat' : 'open', open: .5 * (1 - after), blush: .3 * (1 - after) }));
    pocketBun(ctx, a, 38, { look: lookAt(960), eyes: after > .3 ? 'sad' : 'dot' });
    // the cursor, on ones: multiples trailing behind + travel streaks
    if (onScreen) {
      const y = pass[3], d = pass[2], fast = Math.abs(cxN - cursorX(t - 1 / 24)) > 60;
      streaks(ctx, [cxN - d * 150, y - 40, cxN - d * 1300, y + 200], { dir: [d, 0], n: 20, len: 520, w: 7, color: rgba(INK.ink, .55) });
      if (fast) for (const k of [2, 1]) { ctx.save(); ctx.globalAlpha = .45 - k * .15; cursor(ctx, cxN - d * k * 85, y, 190, { label: false }); ctx.restore(); }
      cursor(ctx, cxN, y, 190, { label: 'you' });
    }
    ctx.restore();
  }

  // ---------- 5. Close-up: the rabbit holds up ONE comment, both pleading ----------
  function sparkle(ctx, x, y, r, rot = 0, col = INK.white) { ink(ctx, star(x, y, r, .22, 4, rot), { fill: col, line: Math.max(2, r * .08), boil: 0, smooth: false }); }
  function bigEyes(ctx, ex, ey, rx, ry, tc, seed) {        // glossy puppy pupils over an existing eye
    ctx.save(); clipPts(ctx, ell(ex, ey, rx, ry, 20));
    fillPts(ctx, ell(ex, ey + ry * .12, rx * .82, ry * .78, 18), INK.ink);
    fillPts(ctx, ell(ex - rx * .28, ey - ry * .28, rx * .34, rx * .34, 14), INK.white);
    fillPts(ctx, ell(ex + rx * .3, ey + ry * .32, rx * .16, rx * .16, 10), INK.white);
    ctx.restore();
    sparkle(ctx, ex + rx * .5, ey - ry * .55, rx * (.55 + .15 * wob(tc, 3, seed)), .2);
    inkLine(ctx, [[ex - rx * .7, ey + ry * .78], [ex, ey + ry * .98], [ex + rx * .7, ey + ry * .78]], Math.max(3, rx * .14), rgba(INK.white, .9), { taper: [.3, .3] });
  }
  function plead(ctx, t, lt, dur) {
    const tc = twos(t), z = lerp(1, 1.08, easeInOut(lt / dur)), [dx, dy] = drift(t, 7, .4);
    const C = [960 + dx, 560 + dy, z, 0];
    plate(ctx, C, 8, c => {
      field(c, INK.pink, { dark: .16 });
      c.save(); c.globalAlpha = .45; for (let i = 0; i < 7; i++) fillPts(c, ell(hrange(i * 3, 80, W - 80), hrange(i * 5 + 1, 420, 1040), hrange(i * 7, 60, 150), hrange(i * 7, 60, 150), 26), INK.pinkLt); c.restore();
      for (let i = 0; i < 8; i++) { const x = hrange(i * 11 + 4, 80, W - 80), y = hrange(i * 13 + 2, 440, 1020), r = 22 + 26 * Math.max(0, wob(tc, .8, hash(i))); sparkle(c, x, y, r, 0, i % 3 ? INK.white : INK.yellow); }
    });
    cam(ctx, ...C);
    const S1 = at(wd(9, 4)), Q = at(wd(9, 5));                                   // "single", "one?"
    const lift = backOut(clamp((tc - S1) / .2), 2.6), tilt = easeOut(clamp((tc - Q) / .2));
    const a = rabbit(ctx, 700, 1250, 70, pose({ tilt: -8 * tilt, earL: { a: -48, b: -42 }, earR: { a: 50, b: 44 },
      eyes: 'open', browTilt: 1.4, brows: .22, mouth: 'wavy', blush: .9, ly: -.1,
      armR: { a: 112 + lift * 10, e: 36 }, pawR: 'open', armL: { a: 28, e: 100 }, pawL: 'open' }));
    for (const e of [a.eyeL, a.eyeR]) bigEyes(ctx, e[0], e[1], .6 * 70, .8 * 70, tc, e[0]);
    const bs = 270 * (1 + lift * .08), u = bs / 10, bx = a.pawR[0] + 3.4 * u, by = a.pawR[1] + 1.4 * u - lift * 16, br = -.05 + .12 * tilt;
    commentBunny(ctx, bx, by, bs, { eyes: 'wide', rot: br, ears: .2 });
    ctx.save(); ctx.translate(bx, by); ctx.rotate(br);
    for (const sd of [-1, 1]) bigEyes(ctx, sd * 1.9 * u, -4.8 * u, 1.05 * u, 1.3 * u, tc, sd + 5);
    ctx.restore();
    ctx.restore();
  }

  // ---------- 6. POINT CHOREO 2: a giant cursor wags "no-no" behind the rabbit; NOPE, NOPE; the head whips ----------
  function nope(ctx, t, lt) {
    const [n1, n2] = NOPES.map(at);
    field(ctx, INK.red, { dark: .28 });
    const swing = (tt, T, from, to) => lerp(from, to, backOut(clamp((tt - T) / .1), 2.2));
    const ang = tt => tt < n2 ? swing(tt, n1, 18, -18) : swing(tt, n2, -18, 18);
    const turn = tt => tt < n2 ? swing(tt, n1, 0, -.9) : swing(tt, n2, -.9, .9);
    // the cursor, rotating about its tail like a wagging finger (smear multiples on the swing frames)
    const cs = 1000, drawCursor = (c, tt, tag) => { c.save(); c.translate(960, 1190); c.rotate((ang(tt) + 24) * Math.PI / 180);
      cursor(c, -.44 * cs, -.965 * cs, cs, { label: false });
      if (tag) { c.translate(-.44 * cs, -.965 * cs); ink(c, rrect(.1 * cs, .1 * cs, 170, 84, 22), { fill: INK.pink, line: 5, boil: .4, smooth: false }); txt(c, 'you', .1 * cs + 85, .1 * cs + 60, { font: 'ui', weight: 800, size: 56, color: INK.white, align: 'center' }); }
      c.restore(); };
    for (const T of [n1, n2]) { const a = t - T; if (a >= 0 && a < .12) for (const k of [2, 1]) { ctx.save(); ctx.globalAlpha = .2 * (3 - k); drawCursor(ctx, t - k / 40, false); ctx.restore(); } }
    drawCursor(ctx, t, true);
    // rabbit: head whips toward each stamp (head-only multiples on the smear frames)
    const P = tt => pose({ turn: turn(tt), tilt: turn(tt) * 14, earL: { a: -40 - turn(tt) * 26, b: -26 + turn(tt) * 30 }, earR: { a: 40 - turn(tt) * 26, b: 26 + turn(tt) * 30 },
      eyes: 'wide', mouth: 'o', lx: turn(tt) * .7, armL: { a: 18, e: 24 }, armR: { a: 18, e: 24 }, pawL: 'fist', pawR: 'fist', sweat: .6 });
    const neck = 985 - 5.6 * 40;
    for (const T of [n1, n2]) { const a = t - T; if (a >= 0 && a < .09) {
      const c = pushLayer(); c.save(); clipPts(c, rect(0, 0, W, neck), false);
      for (const k of [.66, .33]) rabbit(c, 960, 985, 40, { ...P(lerp(T, t, 1 - k) - .02), noShadow: true });
      c.restore(); popLayer(); ctx.save(); ctx.globalAlpha = .45; ctx.drawImage(c.canvas, 0, 0); ctx.restore(); } }
    rabbit(ctx, 960, 985, 40, P(t));
    stamp(ctx, 'NOPE', 400, 610, 170, t - n1, { color: INK.white, paper: INK.red, rot: -.14 });
    stamp(ctx, 'NOPE', W - 400, 610, 170, t - n2, { color: INK.white, paper: INK.red, rot: .12 });
  }

  // ---------- 7. Cursor swarm: a dozen "you" cursors stomp in unison ----------
  const SW = [960, 700, 1.3];                                              // swarm / poof camera
  function swarm(ctx, t, lt, dur) {
    const tc = twos(t), [c1, c2] = CLICKS.map(at), h = hit(t, CLICKS, 9), [sx, sy] = shake(t, 12 * h);
    const C = [SW[0] + sx, SW[1] + sy, SW[2] + .03 * h, 0];
    plate(ctx, C, 5, c => stage(c, t, { marquee: false }));
    cam(ctx, ...C);
    const G = 880, flat = T => { const a = tc - T; return a < 0 ? 0 : a < .1 ? .85 : .85 * Math.exp(-(a - .1) * 3) + .35; };
    bun(ctx, 600, G, 185, { sq: flat(c1), eyes: tc >= c1 ? 'x' : 'wide', look: .4 });
    bun(ctx, 1320, G, 185, { sq: flat(c2), eyes: tc >= c2 ? 'x' : 'wide', look: -.4 });
    const threat = seg(tc, c2 + .12, 39.72);
    const a = rabbit(ctx, 960, 900, 30, pose({ lean: -threat * 10, turn: kf(tc, [[38.9, -.4], [c2 - .1, -.3], [c2 + .05, .4], [39.55, .1]]), lx: kf(tc, [[38.9, -.8], [c2 - .1, -.8], [c2 + .05, .8], [39.5, .1]]), ly: -.3 - threat * .6,
      eyes: 'wide', mouth: 'wavy', sweat: .5 + threat * .5, browTilt: 1.2, armL: { a: 50, e: 60 }, armR: { a: 50, e: 60 }, pawL: 'open', pawR: 'open', earL: { a: -30, b: -20 }, earR: { a: 30, b: 20 } }));
    pocketBun(ctx, a, 30, { eyes: 'wide', look: -.3 });
    // formation: a 4x3 block of cursors hovering over the target; it dips on each click
    const tgt = kf(t, [[38.9, [600, 520]], [c1 + .1, [600, 520]], [(c1 + c2) / 2 + .05, [960, 330]], [c2 - .05, [1320, 520]], [c2 + .12, [1320, 520]], [39.76, [990, 430]]], easeInOut);
    const ca = Math.min(...CLICKS.map(T => { const a = t - at(T); return a >= 0 ? a : 9; })), dip = ca < .12 ? 28 * (1 - ca / .12) : 0, sc = ca < .08 ? .84 : 1;
    ring(ctx, tgt[0] + 20, G - 120, ca, 260, INK.pink, .32, 12);
    for (let i = 0; i < 12; i++) {
      const col = i % 4, row = Math.floor(i / 4), x = tgt[0] + (col - 1.5) * 118 - 40 + noise1(t * 2 + i) * 5, y = tgt[1] + (row - 1) * 104 + dip + noise1(t * 2 + i + 40) * 5;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); cursor(ctx, 0, 0, 118, { label: row === 2 ? 'you' : false }); ctx.restore();
    }
    ctx.restore();
  }

  // ---------- 8. Resolve all: every cursor mashes one big pink button ----------
  function press(ctx, t, lt, dur) {
    const h = Math.exp(-lt * 9), [sx, sy] = shake(t, 24 * h);
    const C = [960 + sx, 540 + sy, 1 + .12 * h, 0];
    plate(ctx, C, 9, c => { sunburst(c, 960, 520, INK.pink, INK.yellow, .2 + t * .3, 24); dotsIn(c, [0, 0, W, H], { spacing: 40, color: rgba(INK.ink, .2), dir: [0, 1], from: 0, to: H, min: 0, max: .6 }); });
    cam(ctx, ...C);
    speedLines(ctx, 960, 520, { n: 60, r0: 600, w: 14, color: rgba(INK.ink, .6 * h + .15) });
    const p = lt < .1 ? 1 : lerp(1, .3, easeOut((lt - .1) / .15));
    button(ctx, 500, 400, 920, 240, 'Resolve all', { fill: INK.pink, size: 120, press: p });
    const d0 = Math.atan2(-14, -6), cs = 130;
    for (let i = 0; i < 12; i++) {
      const an = (i + .5) / 12 * TAU, ex = 960 + Math.cos(an) * 452, ey = 525 + Math.sin(an) * 124, into = Math.atan2(525 - ey, 960 - ex), rot = into - d0;
      const back = lt < .1 ? 0 : 30 * easeOut((lt - .1) / .2), x = ex - Math.cos(into) * back, y = ey - Math.sin(into) * back;
      const lx = x + Math.cos(rot) * .75 * cs - Math.sin(rot) * .95 * cs, ly = y + Math.sin(rot) * .75 * cs + Math.cos(rot) * .95 * cs;
      const onBtn = lx > 470 && lx < 1450 && ly > 380 && ly < 660;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lt < .1 ? .82 : 1, lt < .1 ? .82 : 1); cursor(ctx, 0, 0, cs, { label: onBtn ? false : 'you' }); ctx.restore();
      ring(ctx, ex, ey, lt, 70, INK.white, .3, 6);
    }
    ctx.restore();
  }

  // ---------- 9. ...and all three go poof into grey bars; the counter is struck ----------
  function poofShot(ctx, t, lt, dur) {
    const tc = twos(t), P = at(ALL), h = hit(t, [ALL], 9), [sx, sy] = shake(t, 14 * h);
    const C = [SW[0] + sx, SW[1] + sy, SW[2] + .02 * lt, 0];
    plate(ctx, C, 5, c => stage(c, t, { marquee: false }));
    cam(ctx, ...C);
    const G = 880, gone = t >= P, pa = t - P, pop = backOut(clamp((pa - .06) / .16), 2.6);
    for (const [x, lk] of [[600, .4], [1320, -.4]]) {
      if (!gone) bun(ctx, x, G, 185, { sq: .35 + .05 * wob(tc, 5), eyes: 'x', look: lk });
      else bar(ctx, x, G, 330, pop);
      poof(ctx, x, G - 110, 130, pa);
    }
    const sad = seg(tc, P + .2, P + .6);
    const a = rabbit(ctx, 960, 900, 30, pose({ eyes: gone && pa < .3 ? 'wide' : 'open', lids: sad * .35, ly: gone ? .7 : -.3, nod: sad * .2, mouth: gone ? (pa < .3 ? 'o' : 'flat') : 'wavy',
      sweat: gone ? 0 : .7, armL: { a: 30, e: 70 }, armR: { a: 30, e: 70 }, pawL: 'open', pawR: 'open',
      earL: { a: -20 - sad * 14, b: -10 - sad * 20 }, earR: { a: 18 + sad * 10, b: 10 + sad * 70 } }));
    if (!gone) pocketBun(ctx, a, 30, { eyes: 'wide', sq: .05 * wob(tc, 5) });
    else bar(ctx, a.pocket[0], a.pocket[1] - 16, 130, pop);
    poof(ctx, a.pocket[0], a.pocket[1] - 60, 90, pa);
    ctx.restore();
    marquee(ctx, t, 3, { big: true, strike: easeOut(clamp((t - P) / .14)) });
  }

  // ---------- 10. thumbs up: a giant reaction bonks the rabbit's ears flat ----------
  function thumbs(ctx, t, lt, dur) {
    const tc = twos(t), T = at(THUMBS), U = at(UP), h = hit(t, [THUMBS], 8), [sx, sy] = shake(t, 26 * h);
    const C = [960 + sx, 540 + sy, 1 + .04 * h, 0];
    plate(ctx, C, 7, c => { sunburst(c, 960, 640, INK.yellow, INK.pink, .3 + t * .04 + h * .2, 22); dotsIn(c, [0, 0, W, H], { spacing: 40, color: rgba(INK.ink, .18), dir: [0, 1], from: 0, to: H, min: 0, max: .6 }); });
    cam(ctx, ...C);
    const hitA = t - T, bonked = hitA >= 0, sq = bonked ? .12 + .45 * Math.exp(-(tc - T) * 7) : 0;
    const a = rabbit(ctx, 960, 1070, 50, pose({ sq, eyes: bonked && hitA < .18 ? 'x' : 'open', lids: bonked ? .55 : 0, mouth: bonked ? 'flat' : 'smile', ly: bonked ? 0 : -.8,
      earL: bonked ? { a: -96, b: -4 + wob(tc, 7) * 4 * Math.exp(-hitA * 4) } : { a: -12, b: 0 }, earR: bonked ? { a: 96, b: 4 } : { a: 12, b: 0 },
      armL: { a: 12, e: 12 }, armR: { a: 12, e: 12 } }));
    const rest = a.top[1] - 4.2 * 42 + 18;
    const ty = t < T ? lerp(-500, rest, easeIn(seg(t, T - .09, T))) : t < U ? rest : lerp(rest, -700, easeIn(seg(t, U, U + .2)));
    if (t < T && t > T - .1) streaks(ctx, [700, ty - 700, 1250, ty], { dir: [0, 1], n: 16, len: 500, w: 8, color: rgba(INK.ink, .5) });
    thumb(ctx, 920, ty, 420, bonked && t < U ? .03 : -.05);
    if (bonked && hitA < .25) krackle(ctx, 960, a.top[1], 220, { n: 22, size: 18 });
    sfx(ctx, 'BONK!', 1440, 400, 150, hitA, { rot: .12, life: .55 });
    // the reaction chip, "👍 1"
    const ck = backOut(clamp((t - U) / .14), 2.6);
    if (ck > 0) { ctx.save(); ctx.translate(1330, 640); ctx.scale(ck, ck); ctx.rotate(.05);
      fillPts(ctx, rrect(-8, 8, 250, 120, 60), INK.ink, false); ink(ctx, rrect(-16, 0, 250, 120, 60), { fill: INK.white, line: 6, lineColor: INK.ink, boil: .5, smooth: false });
      thumb(ctx, 50, 66, 70); txt(ctx, '1', 170, 92, { font: 'ui', weight: 900, size: 84, color: INK.ink, align: 'center' }); ctx.restore(); }
    ctx.restore();
  }

  // ---------- 11. amen: the Merge button on an altar under a lancet window; a bot choir sings LGTM ----------
  function lancet(x0, x1, ys, y1) {                                  // pointed gothic arch
    const w = x1 - x0, p = [[x0, y1], [x0, ys]];
    for (let i = 1; i <= 10; i++) { const f = Math.PI + i / 10 * Math.PI / 3; p.push([x1 + w * Math.cos(f), ys + w * Math.sin(f)]); }
    for (let i = 1; i <= 10; i++) { const f = -Math.PI / 3 + i / 10 * Math.PI / 3; p.push([x0 + w * Math.cos(f), ys + w * Math.sin(f)]); }
    p.push([x1, y1]); return p;
  }
  function altar(ctx, t, lt, dur) {
    const tc = twos(t), k = easeInOut(lt / dur);
    const C = [960, lerp(620, 530, k), lerp(1.0, 1.06, k), 0];
    plate(ctx, C, 6, c => {
      fillPts(c, rect(-300, -300, W + 600, H + 600), INK.ink, false);
      dotsIn(c, [-100, -100, W + 100, H + 100], { spacing: 34, color: INK.nightLt, dir: [0, 1], from: -300, to: 900, min: .45, max: 0 });
      const win = lancet(730, 1190, 400, 700);
      ink(c, lancet(700, 1220, 400, 700), { fill: INK.paperDk, line: 8, boil: .8, smooth: false });
      c.save(); clipPts(c, win, false);
      for (let i = 0; i < 7; i++) fillPts(c, rect(730 + i * 66, -100, 66, 900), [INK.yellow, INK.green, INK.white, INK.yellow, INK.white, INK.green, INK.yellow][i], false);
      dotsIn(c, [700, 0, 1220, 700], { spacing: 16, color: rgba(INK.ink, .35), dir: [0, 1], from: 100, to: 700, min: 0, max: .8 });
      c.beginPath(); for (let i = 1; i < 7; i++) { c.moveTo(730 + i * 66, 0); c.lineTo(730 + i * 66, 700); } for (let y = 160; y < 700; y += 95) { c.moveTo(700, y); c.lineTo(1220, y); } c.lineWidth = 9; c.strokeStyle = INK.ink; c.stroke();
      c.restore();
      outline(c, win, 9, INK.ink, { smooth: false });
      ink(c, ell(960, 250, 92, 92, 28), { fill: INK.green, line: 9, boil: .6 });
      txt(c, '\u2713', 960, 290, { font: 'ui', weight: 900, size: 116, color: INK.white, align: 'center' });
    });
    cam(ctx, ...C);
    // halftone light shafts from the window onto the altar
    for (let i = 0; i < 4; i++) { const x0 = 800 + i * 107, x1 = 640 + i * 213, beam = [[x0 - 24, 520], [x0 + 24, 520], [x1 + 64, 880], [x1 - 64, 880]];
      ctx.save(); clipPts(ctx, beam, false); dotsIn(ctx, [x1 - 300, 520, x1 + 300, 880], { spacing: 18, color: INK.yellow, dir: [0, 1], from: -200, to: 300, min: .9, max: .2 }); ctx.restore(); }
    // altar + the button, haloed
    ink(ctx, rect(580, 700, 760, 200), { fill: INK.paperDk, shade: { color: rgba(INK.ink, .3), spacing: 14, dir: [0, 1], from: 0, to: 200 }, line: 7, boil: .8, smooth: false });
    ink(ctx, [[560, 690], [1360, 690], [1330, 780], [1180, 760], [960, 790], [740, 760], [590, 780]], { fill: INK.white, line: 6, boil: .8, smooth: false });
    const glow = pulse(t, 5);
    ink(ctx, burstPts(960, 604, 400 + glow * 30, 18, 9, .3).map(([x, y]) => [x, 604 + (y - 604) * .5]), { fill: INK.yellow, line: 6, boil: 1, smooth: false });
    button(ctx, 640, 545, 640, 118, 'Merge pull request', { fill: INK.green, size: 50 });
    // the choir: two tiers of bots each side, paws together, bobbing on the beat
    const bob = 1.4 * pulse(t, 5);
    for (const sd of [-1, 1]) for (let r = 0; r < 2; r++) for (let i = 0; i < 2; i++) {
      const x = 960 + sd * (560 + i * 190 + r * 90), y = r ? 730 : 900;
      agentBot(ctx, x, y, r ? 76 : 92, { bob: bob * (1 + (i % 2) * .3), clap: 1, say: (i + r) % 2 === 0 ? 'LGTM' : null, saySize: 40 });
    }
    ctx.restore();
  }

  // ---------- 12. Hop, hop: the choreo-1 framing again, alone, smaller, bars where the comments were ----------
  const echo = (ctx, t) => hopShot(ctx, t, { times: ECHO, s: 28, height: 1.1, sad: true, bars: [[520, 985, 330], [1400, 985, 330]], word: 'hop', size: 120, wordColor: INK.paper });

  // ---------- 13. Sisyphus: pushing a comment boulder up the scrollbar; it rolls back; the counter resets to 3 ----------
  function sisyphus(ctx, t, lt, dur) {
    const tc = twos(t), ang = -24 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), O = [150, 1030];
    const Pt = d => [O[0] + d * ca, O[1] + d * sa], nrm = [sa, -ca];
    const SLIP = at(wd(11, 5)), CRASH = at(wd(11, 7)), R0 = 120;
    const [sx, sy] = shake(t, 22 * hit(t, [wd(11, 7)], 7)), [dx, dy] = drift(t, 6);
    const C = [960 + sx + dx, 540 + sy + dy, 1, 0];
    plate(ctx, C, 8, c => { sunburst(c, 1700, 120, INK.pink, INK.yellow, t * .04, 20); dotsIn(c, [0, 0, W, H], { spacing: 40, color: rgba(INK.ink, .2), dir: [0, 1], from: 0, to: H, min: 0, max: .6 }); });
    cam(ctx, ...C);
    // the hill: a giant scrollbar track, its down-arrow cap at the bottom, the top out of frame
    const th = 116, off = (p, k) => [p[0] - nrm[0] * k, p[1] - nrm[1] * k], a0 = Pt(-40), a1 = Pt(2600);
    ink(ctx, [a0, a1, off(a1, th), off(a0, th)], { fill: '#ECE6DA', shade: { color: rgba(INK.ink, .16), spacing: 16, dir: [-nrm[0], -nrm[1]], from: 0, to: 120 }, line: 7, boil: .8, smooth: false });
    const b0 = Pt(-190), cap = [b0, a0, off(a0, th), off(b0, th)];
    ink(ctx, cap, { fill: '#D8D1C2', line: 7, boil: .8, smooth: false });
    const cc = off(Pt(-115), th / 2); ink(ctx, xform([[-22, -14], [22, -14], [0, 18]], cc[0], cc[1], 1, ang), { fill: INK.ink, line: 0, boil: 0, smooth: false });
    // boulder: pushed up in surges, slips on "'em", rolls back on "again"
    const d = t < SLIP ? kf(tc, [[43.18, 520], [43.45, 560], [43.6, 610], [43.85, 640], [44.0, 690], [SLIP, 700]]) : lerp(700, -800, easeIn(seg(t, SLIP, CRASH + .06)));
    const bp = Pt(d), bc = [bp[0] + nrm[0] * R0, bp[1] + nrm[1] * R0];
    const dr = (t < SLIP ? d : 700) - 290, rp = Pt(dr), push = t < SLIP;
    const under = !push && d < dr + 70, flatK = t < SLIP ? 0 : under ? 1 : d < dr + 70 ? 1 : 0;
    const flatUntil = at(44.56), pk = !push && tc >= flatUntil ? 1 - clamp((tc - flatUntil) / .12) : 1;
    const squashed = !push && (under || (d < dr && tc < flatUntil + .12));
    const sqv = squashed ? 3.2 * pk : 0, alarm = !push && !squashed && tc < flatUntil;
    ctx.save(); ctx.translate(rp[0], rp[1]); ctx.rotate(ang * .3);
    rabbit(ctx, 0, 0, 30, pose({ lean: push ? 24 : alarm ? -8 : 0, turn: push ? .75 : alarm ? .4 : -.2, sq: sqv + (pk < 1 && pk > 0 ? -.3 * pk : 0), legs: push ? 'run' : 'stand', phase: tc * .9,
      armL: push ? { a: -70, e: -25 } : alarm ? { a: 150, e: 20 } : { a: 10, e: 10 }, armR: push ? { a: 75, e: 0 } : alarm ? { a: 150, e: 20 } : { a: 10, e: 10 }, pawL: 'open', pawR: 'open',
      eyes: squashed ? 'spiral' : alarm ? 'wide' : 'open', lids: push ? .35 : alarm ? 0 : .5, browTilt: push ? -1.5 : 0, mouth: push ? 'wavy' : alarm ? 'o' : 'flat', sweat: push || alarm ? .8 : 0,
      lx: push || alarm ? .8 : -.8, ly: push ? -.3 : alarm ? -.5 : .4,
      earL: alarm ? { a: -8, b: 0 } : { a: -14 + (push ? 0 : -30), b: push ? -10 : -40 }, earR: alarm ? { a: 8, b: 0 } : { a: 12 + (push ? 0 : 20), b: push ? 10 : 60 } }));
    ctx.restore();
    boulder(ctx, bc[0], bc[1], R0, d / R0);
    if (t >= SLIP && t < CRASH) streaks(ctx, [bc[0] + 120, bc[1] - 200, bc[0] + 700, bc[1] + 80], { dir: [-ca, -sa], n: 14, len: 300, w: 7, color: rgba(INK.ink, .5) });
    // the counter plate: 0 -> 3 on "again"
    const n = t < CRASH ? 0 : 3, k = t < CRASH ? 1 : 1 + .3 * Math.exp(-(t - CRASH) * 12);
    ctx.save(); ctx.translate(1440, 950); ctx.scale(k, k); ctx.rotate(-.02);
    uiBox(ctx, -400, -62, 800, 116, { r: 14, shadow: 10 });
    countHeader(ctx, -368, 20, n, { size: 44 });
    ctx.restore();
    ctx.restore();
  }

  // ---------- 14. again~: a Droste time-loop of the rabbit writing; stacked AGAIN AGAIN AGAIN; the watch swings out ----------
  const DZ = (() => {
    const r = .45, th = .1, cx = 1372, cy = 470, M = new DOMMatrix().translate(cx, cy).rotate(th * 180 / Math.PI).scale(r).translate(-W / 2, -H / 2);
    const c = r * Math.cos(th), s = r * Math.sin(th), dd = (1 - c) ** 2 + s * s;
    return { r, th, M, p: [((1 - c) * M.e - s * M.f) / dd, (s * M.e + (1 - c) * M.f) / dd] };
  })();
  function panel(ctx, t, i, sc) {                         // one level of the tunnel, in panel coords; i = its loop index
    const tc = twos(t);
    fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
    fillPts(ctx, rect(540, 36, W - 576, H - 72), INK.pink, false);
    fillPts(ctx, rect(540, 900, W - 576, H - 936), INK.yellow, false);
    for (let k = 0; k < 3; k++) txt(ctx, 'AGAIN', 36, 290 + k * 255, { font: 'serif', weight: 900, stretch: -3, size: 250, sx: .72, color: '#F4F1EA', track: -2 });
    if (sc > .15) txt(ctx, 'もう一度', 44, 1010, { font: 'jp', weight: 800, size: 84, sx: .9, color: '#F4F1EA' });
    if (sc > .09) {
      const bags = Math.min(.7, BAGS + i * .09), wr = wob(tc, 3.1, i * .3);
      const a = rabbit(ctx, 770, 985, 40, pose({ bags, turn: .25, lx: .8, ly: -.4, lids: .42, mouth: 'flat', pen: false,
        armR: { a: 128 + wr * 5, e: -18 + wob(tc, 3.1, i * .3 + .25) * 10 }, pawR: 'fist', armL: { a: 14, e: 20 }, pawL: 'open', earL: { a: -18, b: -8 - i * 4 }, earR: { a: 16, b: 30 + i * 8 } }));
      penAt(ctx, a.pawR[0], a.pawR[1], 40, -.7);
    } else fillPts(ctx, rrect(680, 700, 180, 280, 50), INK.orange, false);
  }
  function again(ctx, t, lt, dur) {
    const tau = t - at(44.768), phi = .7 * tau + .26 * tau * tau, n = Math.floor(phi), u = phi - n;
    const [px, py] = DZ.p, camM = new DOMMatrix().translate(px, py).rotate(-u * DZ.th * 180 / Math.PI).scale(Math.pow(DZ.r, -u)).translate(-px, -py);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fillPts(ctx, rect(0, 0, W, H), INK.ink, false); ctx.restore();
    let M = camM;
    for (let k = 0; k < 7; k++) {
      const sc = Math.pow(DZ.r, k - u); if (sc * W < 24) break;
      ctx.save(); ctx.setTransform(M); panel(ctx, t, n + k, sc); ctx.restore();
      M = M.multiply(DZ.M);
    }
    // the pocket watch flies out of the vanishing point, swinging like a hypnotist's pendulum, and lands on chapter 4's first frame
    const wk = seg(t, 46.9, B - .03);
    if (wk > 0) {
      const r = 36 * Math.pow(510 / 36, Math.pow(wk, 1.5)), e = easeInOut(wk), sw = (1 - wk) * Math.sin(wk * 3 * Math.PI);
      pocketWatch(ctx, lerp(px, 960, e) + 260 * sw, lerp(py, 540, e), r, { secs: clockSecs(16, 58, 30), left: 90, total: 90, rot: lerp(0, -.06, e) - .45 * sw });
    }
  }

  chapter('chorus1', A, B, [
    [A, slam],
    [at(beatTime(79)), line],
    [35.15, hop1],
    [at(35.88), whoosh],
    [at(37.22), plead],
    [38.40, nope],
    [at(CLICKS[0]), swarm],
    [at(39.80), press],
    [40.05, poofShot],
    [40.80, thumbs],
    [at(41.72), altar],
    [42.44, echo],
    [at(43.22), sisyphus],
    [at(44.768), again],
  ]);
})();
