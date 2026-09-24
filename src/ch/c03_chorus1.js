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
  // plain colour field with a halftone vignette
  function field(ctx, col, dot, o = {}) {
    fillPts(ctx, rect(-300, -300, W + 600, H + 600), col, false);
    dotsIn(ctx, [0, 0, W, H], { spacing: o.spacing || 38, color: dot, angle: .5,
      k: (x, y) => clamp(Math.hypot((x - 960) / 1150, (y - (o.cy ?? 600)) / 760) * 1.6 - .55) * (o.max ?? 1) });
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
    const bs = s * 1.7, u = bs / 10, top = a.pocket[1] - .5 * s, rise = o.rise ?? 1;
    if (rise <= 0) return;
    ctx.save(); clipPts(ctx, rect(a.pocket[0] - 14 * u, top - 24 * u, 28 * u, 24 * u), false);
    commentBunny(ctx, a.pocket[0], top + lerp(14, 3.4, rise) * u, bs, o);
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
  function ring(ctx, x, y, a, r = 110, col = INK.pink, life = .3) {
    if (a < 0 || a > life) return; const k = a / life, R = 14 + easeOut(k) * r;
    ctx.save(); ctx.globalAlpha = 1 - k * k; outline(ctx, ell(x, y, R, R, 28), 9 * (1 - k) + 2, col); ctx.restore();
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
      ink(ctx, ell(x + Math.cos(an) * d, y + Math.sin(an) * d * .75, rr, rr, 14), { fill: INK.white, shade: { color: GREY, spacing: 11, dir: [.5, .85], from: -rr * .2, to: rr }, line: 4, boil: 1.2, seed: i });
    }
  }
  // the chorus-stage marquee with a readable counter (and a pen strike through it)
  function marquee(ctx, t, n, strike = 0) {
    ink(ctx, rrect(360, 36, 1200, 150, 20), { fill: INK.ink, line: 6, boil: .8, smooth: false });
    for (let i = 0; i < 34; i++) { const on = (Math.floor(t * 8) + i) % 3 !== 0, px = 380 + i * 34.6; for (const py of [52, 170]) fillPts(ctx, ell(px, py, 8, 8, 8), on ? INK.yellow : '#5A4A20'); }
    txt(ctx, `${PR.title} #${PR.num}`, 960, 104, { font: 'ui', weight: 900, size: 40, color: INK.white, align: 'center' });
    const s = `Actionable comments posted: ${n}`, f = { font: 'ui', weight: 800, size: 36 }, mw = measure(ctx, s, f).w;
    txt(ctx, s, 960, 152, { ...f, color: INK.yellow, align: 'center' });
    if (strike > 0) inkLine(ctx, [[960 - mw / 2 - 18, 146], [960 - mw / 2 - 18 + (mw + 36) * strike, 134]], 10, INK.pink, { taper: [.04, .15] });
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
    if (o.sweat) ink(ctx, [[.62 * r, -.55 * r], [.72 * r, -.35 * r], [.62 * r, -.28 * r], [.52 * r, -.35 * r]], { fill: INK.cyan, line: 3, boil: .5 });
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
    ctx.save(); clipPts(ctx, rect(x - 20 * u, y - 30 * u, 40 * u, 30 * u + .2 * u), false);
    bun(ctx, x, y, s, { hop, sq, eyes: a < .6 ? 'happy' : 'dot', look, ears: hop > 1 ? .4 : 0 });
    ctx.restore();
    popFx(ctx, x, y - 6 * u, 16 * u, a);
  }
  function slam(ctx, t, lt, dur) {
    const tc = twos(t), h = Math.exp(-lt * 8), [sx, sy] = shake(t, 30 * h * h);
    const C = [960 + sx, 548 + sy, 1 + .2 * h * h + .035 * easeInOut(lt / dur), 0];
    plate(ctx, C, 5, c => stage(c, t, { marquee: false, spin: .05 }));
    cam(ctx, ...C);
    marquee(ctx, t, 3);
    const G = 890;
    popBunny(ctx, t, POPS[0], 560, G, 150, .7);
    popBunny(ctx, t, POPS[1], 1360, G, 150, -.7);
    // rabbit: lands from a jump into jazz hands, glances at each new comment, then down at its pocket
    const P0 = at(POPS[0]), P1 = at(POPS[1]), P2 = at(POPS[2]);
    const la = lt < .08 ? 1 : Math.exp(-(tc - A - .08) * 9) * Math.cos((tc - A - .08) * 26);
    const look = kf(tc, [[P0, 0], [P0 + .08, -1], [P0 + .42, -1], [P0 + .52, 0], [P1, 0], [P1 + .08, 1], [P1 + .36, 1], [P1 + .46, 0]], easeOut);
    const down = kf(tc, [[P2, 0], [P2 + .06, 1], [P2 + .24, 1], [P2 + .34, 0]], easeOut);
    const jazz = wob(tc, 6) * 8;
    const a = rabbit(ctx, 960, 985, 30, pose({ sq: .45 * la, ...earsFor(-la * .8),
      armL: { a: 150 + jazz, e: 20 }, armR: { a: 150 - jazz, e: 20 }, pawL: 'open', pawR: 'open',
      eyes: Math.abs(look) > .3 || down > .3 ? 'open' : 'happy', lx: look, ly: down * .9, nod: down * .3, turn: look * .3,
      mouth: down > .3 ? 'o' : 'grin', blush: .5 + down * .4 }));
    const pa = age(t, POPS[2]);
    pocketBun(ctx, a, 30, { rise: pa < 0 ? 0 : backOut(clamp(pa / .16), 3.2), eyes: pa < .5 ? 'happy' : 'dot', ears: pa < .3 ? .5 : 0, look: -.2 });
    popFx(ctx, a.pocket[0], a.pocket[1] - 40, 70, pa);
    ctx.restore();
    if (lt < .05) duotone(ctx, INK.ink, INK.yellow, 2.4);        // impact frame
    misregFrame(ctx, 22 * h * h);
  }

  // ---------- 2. Chorus line: a wave of hops rippling across the line ----------
  function line(ctx, t, lt, dur) {
    const tc = twos(t), z = lerp(1.05, 1.17, easeInOut(lt / dur)), [dx, dy] = drift(t, 8);
    const C = [960 + dx, 655 + dy, z, 0];
    plate(ctx, C, 6, c => stage(c, t, { a: INK.yellow, b: INK.pink, spin: -.06, marquee: false }));
    cam(ctx, ...C);
    const G = 1080, sway = Math.sin(beatAt(tc + VLEAD) * Math.PI);
    const hops = i => { let h = 0, sq = 0, vy = 0; for (let b = 79; b <= 83; b++) { const r = hopArc(t, beatTime(b) - VLEAD + i * .07, .26, 1.1); h += r.h; sq += r.sq; vy += r.vy; } return { h, sq, vy }; };
    const xs = [630, 960, 1290];
    [0, 2].forEach(i => { const hp = hops(i); bun(ctx, xs[i], G - 10, 150, { hop: hp.h * 27 / 15, sq: hp.sq, rot: sway * .1, ears: -hp.vy * .5, eyes: hp.h > .3 ? 'happy' : 'dot', look: i ? -.5 : .5 }); });
    const hp = hops(1);
    const a = rabbit(ctx, xs[1], G, 27, pose({ hop: hp.h, sq: hp.sq, legs: 'hop', lean: sway * 6, ...earsFor(hp.vy),
      armL: { a: 92, e: -8 }, armR: { a: 92, e: -8 }, pawL: 'open', pawR: 'open', eyes: hp.h > .3 ? 'happy' : 'open', mouth: 'grin', blush: .4, lx: sway * .3 }));
    pocketBun(ctx, a, 27, { eyes: hp.h > .3 ? 'happy' : 'dot', ears: -hp.vy * .5 });
    ctx.restore();
  }

  // ---------- 3. POINT CHOREO 1 (the template for every chorus) ----------
  // Static camera, full body, plain colour field; the rabbit and its comments hop in unison on `times`, ears flicking,
  // with a HOP! lettered on each hop. bunnies: [[x, groundY, s]]; bars: resolved bars [[x, y, w]]; sad: the lonely echo.
  function hopShot(ctx, t, { field: col = INK.pink, dot = INK.pinkLt, bunnies = [], bars = [], times, x = 960, y = 980, s = 40,
    height = 2.3, word = 'HOP!', size = 190, wordColor = INK.yellow, pocket = false, sad = false }) {
    field(ctx, col, dot);
    let h = 0, sq = 0, vy = 0;
    for (const T of times) { const r = hopArc(t, at(T), .29, height); h += r.h; sq += r.sq; vy += r.vy; }
    const up = clamp(h / height), happy = !sad && up > .25;
    for (const [bx, by, bw] of bars) bar(ctx, bx, by, bw);
    for (const [bx, by, bs] of bunnies) bun(ctx, bx, by, bs, { hop: h * s / (bs / 10), sq, ears: -vy * .6 + up * .4, eyes: happy ? 'happy' : 'dot', look: (x - bx) / 900 });
    const arm = sad ? { a: 8 + up * 25, e: 8 } : { a: lerp(40, 165, up), e: lerp(45, 12, up) };
    const a = rabbit(ctx, x, y, s, pose({ hop: h, sq, legs: 'hop', ...earsFor(vy, sad ? -38 : 0), armL: arm, armR: arm, pawL: 'open', pawR: 'open',
      eyes: happy ? 'happy' : 'open', lids: sad ? .45 : 0, mouth: sad ? 'flat' : 'grin', blush: sad ? 0 : .5 }));
    if (pocket) pocketBun(ctx, a, s, { eyes: happy ? 'happy' : 'dot', ears: -vy * .6, rise: 1 + up * .3 });
    times.forEach((T, i) => sfx(ctx, word, i % 2 ? W - 430 : 430, 330, size, age(t, T), { rot: i % 2 ? .12 : -.13, life: .8, color: wordColor, dots: !sad }));
  }
  const hop1 = (ctx, t) => hopShot(ctx, t, { times: HOPS, bunnies: [[470, 980, 150], [1450, 980, 150]], pocket: true });

  // ---------- 4. The cursor whooshes past, not reading; every eye follows it ----------
  const PASSES = [[35.86, 36.12, -1, 470], [36.56, 36.8, 1, 560]];
  const cursorX = tt => { let x = 2300; for (const [a, b, d] of PASSES) if (tt >= a) x = d < 0 ? lerp(2300, -500, easeInOut(seg(tt, a, b))) : lerp(-500, 2300, easeInOut(seg(tt, a, b))); return x; };
  function whoosh(ctx, t, lt, dur) {
    const tc = twos(t), cxN = cursorX(t), pass = PASSES.filter(p => t >= p[0]).pop() || PASSES[0];
    const onScreen = cxN > -300 && cxN < 2200, [sx, sy] = shake(t, onScreen ? 6 : 0);
    const C = [960 + clamp((cxN - 960) * .03, -30, 30) + sx, 640 + sy, 1.08, 0];
    plate(ctx, C, 6, c => stage(c, t, { marquee: false, spin: .05 }));
    cam(ctx, ...C);
    const G = 1050, lookAt = bx => clamp((cursorX(tc - .04) - bx) / 480, -1, 1);
    const bump = bx => Math.exp(-(((cursorX(tc) - bx) / 280) ** 2)), after = seg(tc, 36.84, 37.1);
    [600, 1320].forEach(bx => { const b = bump(bx); bun(ctx, bx, G, 150, { hop: 3 * b, sq: -.3 * b + .12 * after, look: lookAt(bx), eyes: after > .3 ? 'sad' : b > .3 ? 'wide' : 'dot', ears: b * .6 - after * .8 + pass[2] * b * .5 }); });
    const b = bump(960), wave = tc < 36.3 ? 1 : 1 - seg(tc, 36.84, 37.05);
    const a = rabbit(ctx, 960, G + 10, 32, pose({ hop: b * .8, sq: -.2 * b, turn: lookAt(960) * .5, lx: lookAt(960), ly: -.2 * b,
      armR: { a: lerp(15, 160 + wob(tc, 4) * 14, wave), e: lerp(10, 30 + wob(tc, 4, .25) * 25, wave) }, pawR: 'open', armL: { a: 12, e: 12 },
      earL: { a: -14 - after * 20, b: pass[2] * 40 * b }, earR: { a: 12 + after * 16, b: pass[2] * 40 * b + after * 60 },
      eyes: b > .3 ? 'wide' : 'open', mouth: after > .3 ? 'flat' : 'open', open: .5 * (1 - after), blush: .3 * (1 - after) }));
    pocketBun(ctx, a, 32, { look: lookAt(960), eyes: after > .3 ? 'sad' : 'dot' });
    // the cursor: multiples + streaks, on ones
    if (onScreen) {
      const y = pass[3], d = pass[2];
      streaks(ctx, [cxN - d * 200, y - 60, cxN - d * 1400, y + 220], { dir: [d, 0], n: 22, len: 520, w: 7, color: rgba(INK.ink, .55) });
      for (const k of [3, 2, 1]) { ctx.save(); ctx.globalAlpha = .18 * (4 - k); cursor(ctx, cursorX(t - k / 60), y, 170, { label: false }); ctx.restore(); }
      cursor(ctx, cxN, y, 170, { label: 'you' });
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
    const tc = twos(t), z = lerp(1, 1.09, easeInOut(lt / dur)), [dx, dy] = drift(t, 7, .4);
    const C = [960 + dx, 560 + dy, z, 0];
    plate(ctx, C, 8, c => {
      field(c, INK.pink, INK.pinkLt, { max: .8 });
      for (let i = 0; i < 9; i++) { const x = hrange(i * 3, 0, W), y = hrange(i * 5 + 1, 380, 1080), r = hrange(i * 7, 50, 150); c.save(); c.globalAlpha = .5; outline(c, ell(x, y, r, r, 26), 6, INK.pinkLt); c.restore(); }
      for (let i = 0; i < 14; i++) { const x = hrange(i * 11, 60, W - 60), y = hrange(i * 13 + 2, 420, 1040), r = 18 + 22 * Math.max(0, wob(tc, .9, hash(i))); sparkle(c, x, y, r, 0, i % 3 ? INK.white : INK.yellow); }
    });
    cam(ctx, ...C);
    const S1 = at(wd(9, 4)), Q = at(wd(9, 5));                                   // "single", "one?"
    const lift = backOut(clamp((tc - S1) / .2), 2.6), tilt = easeOut(clamp((tc - Q) / .2));
    const a = rabbit(ctx, 760, 1340, 72, pose({ tilt: -9 * tilt, earL: { a: -74, b: -32 }, earR: { a: 74, b: 32 },
      eyes: 'open', browTilt: -2.6, brows: .12, mouth: 'wavy', blush: .9, ly: -.15,
      armR: { a: 118 + lift * 8, e: 30 }, pawR: 'open', armL: { a: 30, e: 95 }, pawL: 'open' }));
    for (const e of [a.eyeL, a.eyeR]) bigEyes(ctx, e[0], e[1], .6 * 72, .8 * 72, tc, e[0]);
    const bs = 180 * (1 + lift * .1), u = bs / 10, bx = a.pawR[0] + 5.2 * u, by = a.pawR[1] + 2.2 * u - lift * 18, br = -.06 + .12 * tilt;
    commentBunny(ctx, bx, by, bs, { eyes: 'wide', rot: br, ears: .25 });
    ctx.save(); ctx.translate(bx, by); ctx.rotate(br);
    for (const sd of [-1, 1]) bigEyes(ctx, sd * 1.9 * u, -4.8 * u, 1.05 * u, 1.3 * u, tc, sd + 5);
    ctx.restore();
    ctx.restore();
  }

  // ---------- 6. POINT CHOREO 2: the cursor wags "no-no", NOPE, NOPE ----------
  function nope(ctx, t, lt) {
    const [n1, n2] = NOPES.map(at);
    field(ctx, INK.red, INK.redDk);
    const swing = (tt, T, from, to) => lerp(from, to, backOut(clamp((tt - T) / .1), 2.2));
    const ang = tt => tt < n2 ? swing(tt, n1, 22, -24) : swing(tt, n2, -24, 24);
    const turn = tt => tt < n2 ? swing(tt, n1, .35, -.85) : swing(tt, n2, -.85, .85);
    // the cursor, rotating about its tail like a wagging finger
    const cs = 440, drawCursor = (c, tt, o) => { c.save(); c.translate(960, 600); c.rotate((ang(tt) + 14) * Math.PI / 180); cursor(c, -.44 * cs, -.97 * cs, cs, o); c.restore(); };
    for (const T of [n1, n2]) { const a = t - T; if (a >= 0 && a < .12) for (const k of [2, 1]) { ctx.save(); ctx.globalAlpha = .22 * (3 - k); drawCursor(ctx, t - k / 40, { label: false }); ctx.restore(); } }
    // rabbit: head whips with each nope (head-only multiples on the smear frames)
    const P = tt => pose({ turn: turn(tt), tilt: turn(tt) * 14, earL: { a: -48 - turn(tt) * 20, b: -30 + turn(tt) * 30 }, earR: { a: 48 - turn(tt) * 20, b: 30 + turn(tt) * 30 },
      eyes: 'wide', mouth: 'o', lx: turn(tt) * .6, armL: { a: 20, e: 30 }, armR: { a: 20, e: 30 }, pawL: 'fist', pawR: 'fist', sweat: .6 });
    const neck = 1000 - 5.6 * 34;
    for (const T of [n1, n2]) { const a = t - T; if (a >= 0 && a < .09) {
      const c = pushLayer(); c.save(); clipPts(c, rect(0, 0, W, neck), false);
      for (const k of [.66, .33]) rabbit(c, 960, 1000, 34, { ...P(lerp(T, t, 1 - k) - .02), noShadow: true });
      c.restore(); popLayer(); ctx.save(); ctx.globalAlpha = .45; ctx.drawImage(c.canvas, 0, 0); ctx.restore(); } }
    rabbit(ctx, 960, 1000, 34, P(t));
    drawCursor(ctx, t, { label: 'you' });
    stamp(ctx, 'NOPE', 470, 330, 220, t - n1, { color: INK.white, paper: INK.red, rot: -.16 });
    stamp(ctx, 'NOPE', 1450, 360, 220, t - n2, { color: INK.white, paper: INK.red, rot: .14 });
  }

  // ---------- 7. Cursor swarm: a dozen "you" cursors click in unison ----------
  function swarm(ctx, t, lt, dur) {
    const tc = twos(t), [c1, c2] = CLICKS.map(at), h = hit(t, CLICKS, 9), [sx, sy] = shake(t, 12 * h);
    const C = [960 + sx, 540 + sy, 1 + .03 * h, 0];
    plate(ctx, C, 5, c => stage(c, t, { marquee: false }));
    cam(ctx, ...C);
    marquee(ctx, t, 3);
    const G = 880, flat = (T) => { const a = tc - T; return a < 0 ? 0 : a < .1 ? .8 : .8 * Math.exp(-(a - .1) * 3) + .35; };
    bun(ctx, 560, G, 150, { sq: flat(c1), eyes: tc >= c1 ? 'x' : 'wide', look: .4 });
    bun(ctx, 1360, G, 150, { sq: flat(c2), eyes: tc >= c2 ? 'x' : 'wide', look: -.4 });
    const threat = seg(tc, c2 + .12, 39.72);
    const a = rabbit(ctx, 960, 900, 30, pose({ lean: -threat * 10, turn: kf(tc, [[38.9, -.4], [c2 - .1, -.3], [c2 + .05, .4], [39.8, .1]]), lx: kf(tc, [[38.9, -.8], [c2 - .1, -.8], [c2 + .05, .8], [39.6, .2]]), ly: -.5,
      eyes: 'wide', mouth: 'wavy', sweat: .5 + threat * .5, browTilt: -2, armL: { a: 50, e: 60 }, armR: { a: 50, e: 60 }, pawL: 'open', pawR: 'open', earL: { a: -30, b: -20 }, earR: { a: 30, b: 20 } }));
    pocketBun(ctx, a, 30, { eyes: 'wide', look: -.3 });
    // formation: 4x3 grid of cursors whose tips hover over the target
    const tgt = kf(t, [[38.9, [560, 700]], [c1 + .1, [560, 700]], [c2 - .04, [1360, 700]], [c2 + .12, [1360, 700]], [39.8, [1000, 560]]], easeInOut);
    const ca = Math.min(...CLICKS.map(T => { const a = t - at(T); return a >= 0 ? a : 9; }));
    const press = ca < .1 ? .8 : 1;
    for (let i = 0; i < 12; i++) {
      const gx = (i % 4 - 1.5) * 128 - 40, gy = (Math.floor(i / 4) - 1) * 116 - 70, x = tgt[0] + gx + noise1(t * 2 + i) * 6, y = tgt[1] + gy + noise1(t * 2 + i + 40) * 6;
      ctx.save(); ctx.translate(x, y); ctx.scale(press, press); cursor(ctx, 0, 0, 104, { label: 'you' }); ctx.restore();
      ring(ctx, x, y, ca, 90);
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
    const d0 = Math.atan2(-14, -6);
    for (let i = 0; i < 12; i++) {
      const an = (i + .5) / 12 * TAU, ex = 960 + Math.cos(an) * 440, ey = 525 + Math.sin(an) * 118, into = Math.atan2(525 - ey, 960 - ex);
      const back = (lt < .1 ? 0 : 30 * easeOut((lt - .1) / .2)), x = ex - Math.cos(into) * back, y = ey - Math.sin(into) * back;
      ctx.save(); ctx.translate(x, y); ctx.rotate(into - d0); ctx.scale(lt < .1 ? .82 : 1, lt < .1 ? .82 : 1); cursor(ctx, 0, 0, 130, { label: 'you' }); ctx.restore();
      ring(ctx, ex, ey, lt, 80);
    }
    ctx.restore();
  }

  // ---------- 9. ...and all three go poof into grey bars; the counter is struck ----------
  function poofShot(ctx, t, lt, dur) {
    const tc = twos(t), P = at(ALL), h = hit(t, [ALL], 9), [sx, sy] = shake(t, 14 * h);
    const C = [960 + sx, 540 + sy, 1 + .025 * lt, 0];
    plate(ctx, C, 5, c => stage(c, t, { marquee: false }));
    cam(ctx, ...C);
    marquee(ctx, t, 3, easeOut(clamp((t - P) / .14)));
    const G = 880, gone = t >= P, pa = t - P;
    for (const [x, lk] of [[560, .4], [1360, -.4]]) {
      if (!gone) bun(ctx, x, G, 150, { sq: .35 + .05 * wob(tc, 5), eyes: 'x', look: lk });
      else bar(ctx, x, G, 250, backOut(clamp((pa - .06) / .16), 2.6));
      poof(ctx, x, G - 90, 110, pa);
    }
    const sad = seg(tc, P + .2, P + .6);
    const a = rabbit(ctx, 960, 900, 30, pose({ eyes: gone && pa < .3 ? 'wide' : 'open', lids: sad * .35, ly: gone ? .7 : -.3, nod: sad * .2, mouth: gone ? (pa < .3 ? 'o' : 'flat') : 'wavy',
      sweat: gone ? 0 : .7, armL: { a: 30, e: 70 }, armR: { a: 30, e: 70 }, pawL: 'open', pawR: 'open',
      earL: { a: -20 - sad * 14, b: -10 - sad * 20 }, earR: { a: 18 + sad * 10, b: 10 + sad * 70 } }));
    if (!gone) pocketBun(ctx, a, 30, { eyes: 'wide', sq: .05 * wob(tc, 5) });
    else bar(ctx, a.pocket[0], a.pocket[1] - 18, 120, backOut(clamp((pa - .06) / .16), 2.6));
    poof(ctx, a.pocket[0], a.pocket[1] - 60, 80, pa);
    ctx.restore();
  }

  // ---------- 10. thumbs up: a giant reaction bonks the rabbit's ears flat ----------
  function thumbs(ctx, t, lt, dur) {
    const tc = twos(t), T = at(THUMBS), U = at(UP), h = hit(t, [THUMBS], 8), [sx, sy] = shake(t, 26 * h);
    const C = [960 + sx, 540 + sy, 1 + .04 * h, 0];
    plate(ctx, C, 7, c => { sunburst(c, 960, 700, INK.yellow, INK.pink, .3 + t * .04 + h * .2, 22); dotsIn(c, [0, 0, W, H], { spacing: 40, color: rgba(INK.ink, .18), dir: [0, 1], from: 0, to: H, min: 0, max: .6 }); });
    cam(ctx, ...C);
    const hitA = t - T, bonked = hitA >= 0, sq = bonked ? .12 + .45 * Math.exp(-(tc - T) * 7) : 0;
    const a = rabbit(ctx, 960, 1130, 50, pose({ sq, eyes: bonked && hitA < .18 ? 'x' : 'open', lids: bonked ? .55 : 0, mouth: bonked ? 'flat' : 'smile', ly: bonked ? 0 : -.8,
      earL: bonked ? { a: -96, b: -4 + wob(tc, 7) * 4 * Math.exp(-hitA * 4) } : { a: -12, b: 0 }, earR: bonked ? { a: 96, b: 4 } : { a: 12, b: 0 },
      armL: { a: 12, e: 12 }, armR: { a: 12, e: 12 } }));
    const rest = a.top[1] - 4.2 * 42 + 18;
    const ty = t < T ? lerp(-500, rest, easeIn(seg(t, T - .09, T))) : t < U ? rest : lerp(rest, -700, easeIn(seg(t, U, U + .2)));
    if (t < T && t > T - .1) streaks(ctx, [700, ty - 700, 1250, ty], { dir: [0, 1], n: 16, len: 500, w: 8, color: rgba(INK.ink, .5) });
    thumb(ctx, 920, ty, 420, bonked && t < U ? .03 : -.05);
    if (bonked && hitA < .25) krackle(ctx, 960, a.top[1], 220, { n: 22, size: 18 });
    sfx(ctx, 'BONK!', 1440, 420, 150, hitA, { rot: .12, life: .55 });
    // the reaction chip, "👍 1"
    const ck = backOut(clamp((t - U) / .14), 2.6);
    if (ck > 0) { ctx.save(); ctx.translate(1330, 700); ctx.scale(ck, ck); ctx.rotate(.05);
      fillPts(ctx, rrect(-8, 8, 250, 120, 60), INK.ink, false); ink(ctx, rrect(-16, 0, 250, 120, 60), { fill: INK.white, line: 6, lineColor: INK.ink, boil: .5, smooth: false });
      thumb(ctx, 50, 66, 70); txt(ctx, '1', 170, 92, { font: 'ui', weight: 900, size: 84, color: INK.ink, align: 'center' }); ctx.restore(); }
    ctx.restore();
  }

  // ---------- 11. amen: the Merge button as an altar, a choir of bots sings LGTM ----------
  function altar(ctx, t, lt, dur) {
    const tc = twos(t), k = easeInOut(lt / dur);
    const C = [960, lerp(590, 540, k), lerp(1.0, 1.07, k), 0];
    plate(ctx, C, 7, c => {
      fillPts(c, rect(-200, -200, W + 400, H + 400), INK.ink, false);
      dotsIn(c, [-100, -100, W + 100, H + 100], { spacing: 34, color: INK.nightLt, dir: [0, 1], from: -200, to: 900, min: .5, max: 0 });
      const R = 290, cx = 960, cy = 290;
      ink(c, ell(cx, cy, R + 36, R + 36, 48), { fill: INK.paperDk, line: 8, boil: .8 });
      for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU + t * .05, a1 = a0 + TAU / 16, col = [INK.yellow, INK.green, INK.white, INK.yellow][i % 4];
        const pane = [[cx + Math.cos(a0) * 70, cy + Math.sin(a0) * 70], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], [cx + Math.cos((a0 + a1) / 2) * R * 1.02, cy + Math.sin((a0 + a1) / 2) * R * 1.02], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R], [cx + Math.cos(a1) * 70, cy + Math.sin(a1) * 70]];
        ink(c, pane, { fill: col, shade: { color: rgba(INK.ink, .35), spacing: 16, dir: [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2)], from: -40, to: 200, max: .7 }, line: 9, smooth: false, boil: .6, seed: i }); }
      ink(c, ell(cx, cy, 74, 74, 24), { fill: INK.green, line: 9, boil: .6 });
      txt(c, '\u2713', cx, cy + 34, { font: 'ui', weight: 900, size: 96, color: INK.white, align: 'center' });
    });
    cam(ctx, ...C);
    // halftone light shafts from the window onto the altar
    for (let i = 0; i < 5; i++) { const x0 = 960 + (i - 2) * 90, x1 = 960 + (i - 2) * 230, beam = [[x0 - 26, 380], [x0 + 26, 380], [x1 + 70, 940], [x1 - 70, 940]];
      ctx.save(); clipPts(ctx, beam, false); dotsIn(ctx, [x1 - 300, 380, x1 + 300, 940], { spacing: 20, color: INK.yellow, dir: [0, 1], from: -300, to: 400, min: .95, max: .15 }); ctx.restore(); }
    // altar steps + the button
    ink(ctx, rect(560, 720, 800, 70), { fill: INK.paperDk, shade: { color: rgba(INK.ink, .3), spacing: 14, dir: [0, 1], from: -10, to: 60 }, line: 6, boil: .8, smooth: false });
    ink(ctx, rect(480, 790, 960, 70), { fill: INK.paperDk, shade: { color: rgba(INK.ink, .3), spacing: 14, dir: [0, 1], from: -10, to: 60 }, line: 6, boil: .8, smooth: false });
    ink(ctx, rect(660, 610, 600, 110), { fill: INK.white, line: 6, boil: .8, smooth: false });
    const glow = .5 + .5 * pulse(t, 5);
    ctx.save(); ctx.globalAlpha = .35 * glow; fillPts(ctx, rrect(612, 450, 696, 170, 30), INK.yellow, false); ctx.restore();
    button(ctx, 640, 480, 640, 118, 'Merge pull request', { fill: INK.green, size: 50 });
    // the choir: two tiers of bots each side, bobbing on the beat
    const bob = 1.4 * pulse(t, 5);
    for (const sd of [-1, 1]) for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
      const x = 960 + sd * (620 + i * 150 - r * 70), y = r ? 700 : 880, j = sd * 3 + i + r * 7;
      agentBot(ctx, x, y, r ? 62 : 72, { bob: bob * (1 + (i % 2) * .3), clap: 0, say: (i + r) % 2 === 0 ? '\u266A LGTM' : null, saySize: 30 });
    }
    ctx.restore();
  }

  // ---------- 12. Hop, hop: the same framing as choreo 1, alone, smaller, bars where the comments were ----------
  const echo = (ctx, t) => hopShot(ctx, t, { times: ECHO, s: 28, height: 1.1, sad: true, bars: [[470, 980, 250], [1450, 980, 250]], word: 'hop.', size: 110, wordColor: INK.pinkLt });

  // ---------- 13. Sisyphus: pushing a comment boulder up the scrollbar; it rolls back; counter resets to 3 ----------
  function sisyphus(ctx, t, lt, dur) {
    const tc = twos(t), ang = -24 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), O = [120, 1030];
    const Pt = d => [O[0] + d * ca, O[1] + d * sa], nrm = [sa, -ca];
    const SLIP = at(wd(11, 5)), CRASH = at(wd(11, 7)), R0 = 118;
    const [sx, sy] = shake(t, 20 * hit(t, [wd(11, 7)], 7));
    const C = [960 + sx, 540 + sy, 1, 0];
    plate(ctx, C, 8, c => { sunburst(c, 1700, 120, INK.pink, INK.yellow, t * .04, 20); dotsIn(c, [0, 0, W, H], { spacing: 40, color: rgba(INK.ink, .2), dir: [0, 1], from: 0, to: H, min: 0, max: .6 }); });
    cam(ctx, ...C);
    // the hill: a giant scrollbar track
    const a0 = Pt(-300), a1 = Pt(2600), th = 110, track = [a0, a1, [a1[0] - nrm[0] * th, a1[1] - nrm[1] * th], [a0[0] - nrm[0] * th, a0[1] - nrm[1] * th]];
    ink(ctx, track, { fill: '#E9E3D6', shade: { color: rgba(INK.ink, .18), spacing: 16, dir: [-nrm[0], -nrm[1]], from: 0, to: 120 }, line: 7, boil: .8, smooth: false });
    inkLine(ctx, [Pt(-300), Pt(2600)].map(([x, y]) => [x - nrm[0] * 18, y - nrm[1] * 18]), 3, rgba(INK.ink, .3), { taper: [0, 0], smooth: false });
    // boulder: pushed up in surges on the beat, slips on "'em", rolls back on "again"
    const d = t < SLIP ? kf(tc, [[43.18, 520], [43.45, 560], [43.6, 610], [43.85, 640], [44.0, 690], [SLIP, 700]]) : lerp(700, -700, easeIn(seg(t, SLIP, CRASH + .06)));
    const bp = Pt(d), bc = [bp[0] + nrm[0] * R0, bp[1] + nrm[1] * R0];
    const dr = t < SLIP ? d - R0 - 50 : 700 - R0 - 50;                       // the rabbit stays where it lost its grip
    const flatK = d < dr + 60 && t >= SLIP ? clamp(1 - (tc - (SLIP + .12)) / .5) : 0, squashed = t >= SLIP + .1;
    const rp = Pt(dr), push = t < SLIP;
    ctx.save(); ctx.translate(rp[0], rp[1]); ctx.rotate(ang * .35);
    rabbit(ctx, 0, 0, 30, pose({ lean: push ? 26 : 0, turn: .75, sq: squashed ? lerp(0, 3.4, flatK) : 0, legs: push ? 'run' : 'stand', phase: tc * .9,
      armL: push ? { a: -70, e: -25 } : { a: 10, e: 10 }, armR: push ? { a: 75, e: 0 } : { a: 10, e: 10 }, pawL: 'open', pawR: 'open',
      eyes: squashed && flatK > .5 ? 'spiral' : 'open', lids: push ? .35 : .5, browTilt: push ? 1.5 : 0, mouth: push ? 'wavy' : 'flat', sweat: push ? .8 : 0, lx: push ? .8 : -.6, ly: push ? -.3 : .3,
      earL: { a: -14 + (push ? 0 : -30), b: push ? -10 : -40 }, earR: { a: 12 + (push ? 0 : 20), b: push ? 10 : 60 } }));
    ctx.restore();
    boulder(ctx, bc[0], bc[1], R0, d / R0, { sweat: push });
    if (t >= SLIP && t < CRASH) streaks(ctx, [bc[0] + 120, bc[1] - 200, bc[0] + 700, bc[1] + 80], { dir: [-ca, -sa], n: 14, len: 300, w: 7, color: rgba(INK.ink, .5) });
    // the counter plate: 0 -> 3 on "again"
    const n = t < CRASH ? 0 : 3, k = t < CRASH ? 1 : 1 + .25 * Math.exp(-(t - CRASH) * 12);
    ctx.save(); ctx.translate(1450, 950); ctx.scale(k, k); ctx.rotate(-.02);
    uiBox(ctx, -380, -60, 760, 110, { r: 14, shadow: 10 });
    countHeader(ctx, -350, 18, n, { size: 42 });
    ctx.restore();
    ctx.restore();
  }

  // ---------- 14. again~: a Droste time-loop of the rabbit writing; AGAIN AGAIN AGAIN; the watch swings in ----------
  const DZ = (() => {
    const r = .46, th = .13, cx = 1300, cy = 585, M = new DOMMatrix().translate(cx, cy).rotate(th * 180 / Math.PI).scale(r).translate(-W / 2, -H / 2);
    const c = r * Math.cos(th), s = r * Math.sin(th), dd = (1 - c) ** 2 + s * s;
    return { r, th, M, p: [((1 - c) * M.e - s * M.f) / dd, (s * M.e + (1 - c) * M.f) / dd] };
  })();
  function panel(ctx, t, i, sc) {                         // one level of the tunnel in panel coords; i = its loop index
    const tc = twos(t);
    fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
    fillPts(ctx, rect(36, 190, W - 72, H - 226), INK.pink, false);
    if (sc > .25) dotsIn(ctx, [36, 190, W - 36, H - 36], { spacing: 34, color: INK.pinkLt, angle: .5, dir: [0, -1], from: -300, to: 300, min: .1, max: .9 });
    fillPts(ctx, rect(36, 930, W - 72, 114), INK.yellow, false);
    txt(ctx, 'AGAIN', 60, 168, { font: 'serif', weight: 900, stretch: -3, size: 200, sx: .72, color: '#F4F1EA', track: -2 });
    if (sc > .12) txt(ctx, 'もう一度', W - 60, 150, { font: 'jp', weight: 800, size: 96, sx: .9, color: '#F4F1EA', align: 'right' });
    if (sc > .1) {
      const bags = Math.min(.7, BAGS + i * .09), wr = wob(tc, 3.1, i * .3);
      const a = rabbit(ctx, 640, 1080, 56, pose({ bags, turn: .55, lean: 6, lx: .9, ly: .25, lids: .42 + i * .02, mouth: 'flat', pen: false,
        armR: { a: 64 + wr * 7, e: 52 + wob(tc, 3.1, i * .3 + .25) * 12 }, pawR: 'fist', armL: { a: 20, e: 70 }, pawL: 'open', earL: { a: -18, b: -8 - i * 3 }, earR: { a: 16, b: 30 + i * 6 } }));
      penAt(ctx, a.pawR[0], a.pawR[1], 56, -.9);
    } else fillPts(ctx, rrect(520, 640, 260, 440, 60), INK.orange, false);
  }
  function again(ctx, t, lt, dur) {
    const tau = t - at(44.768), phi = .75 * tau + .28 * tau * tau, n = Math.floor(phi), u = phi - n;
    const [px, py] = DZ.p, camM = new DOMMatrix().translate(px, py).rotate(-u * DZ.th * 180 / Math.PI).scale(Math.pow(DZ.r, -u)).translate(-px, -py);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fillPts(ctx, rect(0, 0, W, H), INK.ink, false); ctx.restore();
    let M = camM;
    for (let k = 0; k < 7; k++) {
      const sc = Math.pow(DZ.r, k - u); if (sc * W < 24) break;
      ctx.save(); ctx.setTransform(M); panel(ctx, t, n + k, sc); ctx.restore();
      M = M.multiply(DZ.M);
    }
    // the pocket watch swings in like a hypnotist's pendulum and fills the frame on the cut
    const wk = seg(t, 46.85, B - .03);
    if (wk > 0) {
      const r = 70 * Math.pow(640 / 70, Math.pow(wk, 1.7)), sw = Math.pow(1 - wk, 1.3), ph = wk * 2.4 * Math.PI + .6;
      pocketWatch(ctx, 960 + 820 * sw * Math.sin(ph), lerp(-260, 540, easeOut(wk)), r, { secs: clockSecs(16, 58, 58), left: 62, rot: -.4 * sw * Math.cos(ph) });
    }
  }

  chapter('chorus1', A, B, [
    [A, slam],
    [at(34.226) - .44, line],
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
