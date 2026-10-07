// c08_breakdown.js: the office ERUPTS (121.85 - 137.70). look 1, red + yellow, rage 1.
(() => {
  const INKS = [INK.red, INK.yellow, INK.yellow];
  const tc_ = t => twos(t);
  const W68 = [0, 1, 2].map(i => wordT(68, i)), W69 = [0, 1, 2].map(i => wordT(69, i)), WHAT = [0, 1, 2, 3].map(i => wordT(75, i));
  const END = 137.70;
  // measured on the drum stem: a straight 16th-note snare roll from 132.42 to 137.32
  const ROLL = Array.from({ length: 49 }, (_, i) => 132.423 + i * .102083);
  const CLOCK = t => clockSecs(16, 59, 40) + (t - 121.85);
  const TIMER = t => clockSecs(2, 1, 0) + (t - 121.85) * 37;
  const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
  const desk = (ctx, t, o = {}) => officeDesk(ctx, t, { k: 1, inks: INKS, clock: CLOCK(t), strobe: 1, chair: false, ...o });

  // ---------- shared bits ----------
  // A band member printing into existence: dots grow to solid while the colour plates slide into register.
  function printIn(ctx, k, fn) {
    if (k >= 1) return fn(ctx);
    if (k <= 0) return;
    const c = pushLayer(); fn(c);
    const m = pushLayer(); dotsIn(m, [0, 0, W, H], { spacing: 26, color: '#000', k: () => k * 1.15 });
    c.globalCompositeOperation = 'destination-in'; c.drawImage(m.canvas, 0, 0); c.globalCompositeOperation = 'source-over';
    misreg(ctx, c.canvas, (1 - k) * 90, .5);
    popLayer(); popLayer();
  }
  function sheet(ctx, x, y, w, rot, flip, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(flip, 1);
    const h = w * 1.3;
    ink(ctx, rect(-w / 2, -h / 2, w, h), { fill: INK.white, line: Math.max(2, w * .035), smooth: false, boil: .8, seed });
    ctx.fillStyle = hash(seed * 1.3) < .3 ? INK.red : INK.ink;
    for (let i = 0; i < 6; i++) ctx.fillRect(-w * .36, -h * .34 + i * h * .12, w * (.42 + .3 * hash(seed + i)), h * .04);
    ctx.restore();
  }
  // a storm of paper blowing across the frame (screen space)
  function storm(ctx, t, n, o = {}) {
    const sp = o.speed ?? 900, seed = o.seed || 1, tt = threes(t);
    for (let i = 0; i < n; i++) {
      const h1 = hash(seed * 13 + i), h2 = hash(seed * 7 + i * 3.1), h3 = hash(seed + i * 5.7), z = (o.size ?? 1) * (.5 + h1 * 1.1), span = W + 500;
      const x = mod(h2 * span + tt * sp * z, span) - 250, y = mod(h3 * (H + 400) - tt * sp * .25 * z + Math.sin(tt * 3 + i) * 50, H + 400) - 200;
      sheet(ctx, x, y, 80 * z, tt * (2 + h1 * 4) * (h2 < .5 ? -1 : 1) + i, Math.cos(tt * (5 + h3 * 6) + i), seed * 100 + i);
    }
  }
  // paper bursting up out of a point at t0 (ballistic, world coords)
  function burstPaper(ctx, t, t0, x, y, n, seed, sz = 60) {
    const a = t - t0; if (a < 0 || a > 1.6) return;
    for (let i = 0; i < n; i++) { const ang = -Math.PI / 2 + (hash(seed + i) - .5) * 2.4, v = 900 + hash(seed * 3 + i) * 900, tt = threes(a);
      sheet(ctx, x + Math.cos(ang) * v * tt, y + Math.sin(ang) * v * tt + 1100 * tt * tt, sz * (.7 + hash(i + seed * 5) * .6), tt * 8 * (hash(i) - .5) + i, Math.cos(tt * 9 + i), seed + i); }
  }
  const camPt = (x, y, cx, cy, z) => [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z];
  // whole-frame misregistration, skipped once the hit has faded (it costs a full-frame composite)
  const split = (ctx, px, ang) => { if (px >= 2) misregFrame(ctx, px, ang); };

  // Greg's call on Dan's monitor
  function gregCall(c, box, t, o = {}) {
    const tc = tc_(t), talk = .25 + .35 * Math.abs(Math.sin(tc * 6.5));
    return teamsCall(c, box, t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: TIMER(t), participants: 112, layout: 'speaker', depth: 0,
      tiles: [{ who: 'greg', speaking: true, cam: 'forehead', camK: o.camK ?? .3, pose: { mouth: 'grin', open: talk, brows: .35, ...(o.pose || {}) } }] });
  }

  // ---------- 121.85 SEND: the desk erupts, Dan on the desk ----------
  function s1(ctx, t, lt) {
    const tc = tc_(t), h = hit(t, [W68[0]], 5), sh = shake(t, 4 + 18 * h), z = 2.0 + .12 * h;
    cam(ctx, 960 + sh[0], 420 + sh[1], z, -.012);
    desk(ctx, t, { screen: (c, b, tt) => gregCall(c, b, tt) });
    const u = backOut(seg(tc, W68[0] - 1 / 24, W68[0] + .2), 2.4), hb = headbang(tc, 1, .5 * seg(tc, W68[0] + .2, W68[0] + .4));
    person(ctx, 960, 706, 50, 'dan', { rage: 1, wild: 1, stage: 1, legs: 'wide', sq: lerp(.34, -.04, u), hop: lerp(.5, 0, clamp(u * 2)),
      armL: { a: lerp(35, 136, u), e: lerp(-60, 4, u) }, armR: { a: lerp(35, 132, u), e: lerp(-60, 8, u) }, handL: 'fist', handR: 'fist',
      nod: lerp(.3, -.18, u) + hb.nod * .5, tilt: lerp(6, -5, u) + hb.tilt, open: lerp(.5, 1, u), badge: { swing: lerp(-30, 25, u) }, t: tc });
    burstPaper(ctx, t, W68[0], DESK.papers[0] + 20, DESK.papers[1] - 20, 9, 11, 64);
    burstPaper(ctx, t, W68[0], 1700, 690, 7, 23, 58);
    desk(ctx, t, { fg: true });
    ctx.restore();
    flash(ctx, INK.white, .3 * hit(t, [W68[0]], 20));
    split(ctx, 14 * h, .3);
  }

  // ---------- 122.60 THE: Dan close, low angle ----------
  function s2(ctx, t, lt) {
    const tc = tc_(t), h = hit(t, [W68[1]], 6), sh = shake(t, 6 + 12 * h), z = 2.1 + lt * .4;
    cam(ctx, 1260 + sh[0], 210 + sh[1], z, .14);
    desk(ctx, t);
    ctx.restore();
    ctx.save(); ctx.translate(960 + sh[0] * 1.6, 600 + sh[1] * 1.6); ctx.rotate(.1); ctx.scale(1 + lt * .12, 1 + lt * .12); ctx.translate(-960, -600);
    const F = headFit(880, 500, 540, 'dan');
    person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, wild: 1, stage: 1, tilt: -12, nod: -.28, open: 1, armR: { a: 150, e: 30 }, handR: 'fist', t: tc });
    ctx.restore();
    split(ctx, 14 * h, .2);
  }

  // ---------- 123.00 MESSAGE: the riso floods the open plan ----------
  function s3(ctx, t, lt) {
    const h = hit(t, [W68[2]], 5), sh = shake(t, 3 + 10 * h), z = 1.03 + .05 * h + lt * .05, cx = 960 + sh[0], cy = 470 + sh[1];
    const r = lerp(780, -60, clamp(lt / .2)), vp = camPt(...OPEN.vp, cx, cy, z), ry = .62;
    if (r > 0) { look(0); cam(ctx, cx, cy, z); openPlan(ctx, t, { k: 0, clock: CLOCK(t) }); ctx.restore(); look(1); }
    ctx.save();
    if (r > 0) { ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20); ctx.ellipse(vp[0], vp[1], r, r * ry, 0, 0, TAU); ctx.clip('evenodd'); }
    cam(ctx, cx, cy, z); openPlan(ctx, t, { k: 1, inks: INKS, stare: clamp(lt / .35), clock: CLOCK(t), strobe: 1 }); ctx.restore();
    ctx.restore();
    if (r > 0) dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.yellow, k: (x, y) => { const d = Math.hypot(x - vp[0], (y - vp[1]) / ry) - r; return d > 0 && d < 140 ? 1.1 - d / 140 : 0; } });
    flash(ctx, INK.white, .45 * hit(t, [W68[2]], 16));
    split(ctx, 12 * h, .2);
  }

  // ---------- 123.67 SEND / 124.04 THE / 124.62 MESSAGE: the band prints itself into the office ----------
  const BOBCAM = [1150, 440, 2.15], LINDACAM = [560, 260, 2.1], TASHACAM = [1500, 455, 2.0];
  function bobKit(c, t, tc) {
    const [x, y, s] = [1150, 712, 46], ph = (tc - W69[0]) / .41;
    const hits = { kick: kick(t, 8), snare: snare(t, 8), crash: hit(t, [W69[0], W69[2], 125.034], 4), hat: pulse(t, 12, .5), tom: hit(t, [W69[1]], 6) };
    drumKit(c, x, y, s, t, { layer: 'back', hits, k: 1, inks: INKS });
    const hb = headbang(tc, 1, .7);
    person(c, x, y - 6, s, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(ph + .5), r: stroke(ph) }, mouth: 'grin', rage: .75, eyes: 'wide', sweat: 1, nod: hb.nod * .6, tilt: hb.tilt * .5, t: tc });
    drumKit(c, x, y, s, t, { layer: 'front', hits, k: 1, inks: INKS });
  }
  function s4(ctx, t, lt) {
    const h = hit(t, [W69[0]], 5), sh = shake(t, 4 + 14 * h), view = c => cam(c, BOBCAM[0] - 140 + sh[0] / 2, BOBCAM[1] + sh[1] / 2, BOBCAM[2] * (1 + .05 * h));
    view(ctx); desk(ctx, t, { screen: false }); ctx.restore();
    printIn(ctx, clamp(.55 + lt / .14), c => { view(c); bobKit(c, t, tc_(t)); c.restore(); });
    flash(ctx, INK.white, .4 * hit(t, [W69[0]], 18));
    split(ctx, 10 * h, .3);
  }

  function cabinet(c, x, y, w, h, t) {
    const dw = h / 4, open = 34 * Math.exp(-frac(beatAt(t + VLEAD)) * 5);
    fillPts(c, rect(x - w / 2 + 16, y - h + 16, w, h), INK.ink, false);
    ink(c, rect(x - w / 2, y - h, w, h), { fill: INK.paper, shade: { color: INK.red, spacing: 14, dir: [1, 0], from: 0, to: w / 2 }, line: 5, smooth: false, seed: 300 });
    const labels = ['SYNCS Q1', 'SYNCS Q2', 'RE: SYNCS', 'MINUTES'];
    for (let i = 0; i < 4; i++) {
      const dy = y - h + i * dw + 8, ox = i === 1 ? open : 0;
      ink(c, rect(x - w / 2 + 12 - ox * .3, dy, w - 24, dw - 14), { fill: INK.paperDk, line: 4, smooth: false, seed: 301 + i });
      ink(c, rect(x - 30, dy + dw * .22, 60, dw * .2), { fill: INK.white, line: 3, smooth: false, seed: 310 + i });
      txt(c, labels[i], x, dy + dw * .22 + dw * .14, { font: 'mono', weight: 800, size: 11, align: 'center', color: INK.ink });
      ink(c, rrect(x - 40, dy + dw * .55, 80, 16, 8), { fill: INK.ink, line: 0, smooth: false });
    }
  }
  const CAB = [440, 1050, 250, 470];
  function lindaOn(c, t) {
    const tc = tc_(t);
    person(c, CAB[0], CAB[1] - CAB[3], 62, 'linda', { hold: 'guitar', strum: frac(tc * 4.8), fret: .35 + .25 * Math.sin(tc * 3), legs: 'wide', turn: .3, lids: .5, mouth: 'flat',
      lean: -6 + 3 * Math.sin(tc * 5), t: tc });
  }
  function s5(ctx, t, lt) {
    const h = hit(t, [W69[1]], 5), sh = shake(t, 4 + 14 * h), view = c => cam(c, LINDACAM[0] + sh[0] / 2, LINDACAM[1] + sh[1] / 2, LINDACAM[2] * (1 + .05 * h), .03);
    view(ctx); desk(ctx, t); cabinet(ctx, ...CAB, t); ctx.restore();
    printIn(ctx, clamp(.55 + lt / .14), c => { view(c); lindaOn(c, t); c.restore(); });
    split(ctx, 10 * h, .3);
  }

  function copier(c, x, y, w, h, t) {
    const top = y - h, lid = 30;
    fillPts(c, rect(x - w / 2 + 18, top + 18, w, h), INK.ink, false);
    ink(c, rect(x - w / 2, top + lid, w, h - lid), { fill: INK.paper, shade: { color: INK.red, spacing: 14, dir: [.7, .7], from: 0, to: h }, line: 5, smooth: false, seed: 320 });
    ink(c, rect(x - w / 2 - 10, top, w + 20, lid + 4), { fill: INK.paperDk, line: 5, smooth: false, seed: 321 });
    // the control panel, scan light leaking under the lid on the beat
    const sc = pulse(t, 5);
    if (sc > .1) { c.save(); c.globalAlpha = sc; fillPts(c, rect(x - w / 2 + 6, top + lid + 2, w - 12, 10), INK.yellow, false); c.restore(); }
    ink(c, rect(x + w * .1, top + lid + 22, w * .34, 54), { fill: INK.ink, line: 3, smooth: false, seed: 322 });
    fillPts(c, rect(x + w * .1 + 8, top + lid + 30, w * .2, 22), Math.floor(t * 4) % 2 ? INK.yellow : INK.red, false);
    txt(c, 'PAPER JAM', x + w * .1 + 12, top + lid + 46, { font: 'mono', weight: 800, size: 13, color: INK.ink });
    fillPts(c, ell(x + w * .4, top + lid + 49, 11, 11, 12), INK.red);
    for (let i = 0; i < 3; i++) { const ty = top + lid + 100 + i * (h - lid - 120) / 3; ink(c, rect(x - w / 2 + 16, ty, w - 32, (h - lid - 140) / 3), { fill: INK.paperDk, line: 4, smooth: false, seed: 323 + i }); ink(c, rrect(x - 50, ty + 18, 100, 14, 7), { fill: INK.ink, line: 0, smooth: false }); }
    // output tray on the side, spitting copies on the beat
    ink(c, [[x + w / 2, top + lid + 70], [x + w / 2 + 90, top + lid + 50], [x + w / 2 + 96, top + lid + 64], [x + w / 2, top + lid + 90]], { fill: INK.paperDk, line: 4, smooth: false, seed: 330 });
    const b = beatAt(t + VLEAD), n = Math.floor(b), p = frac(b);
    for (let i = 0; i < 3; i++) { const a = (p + i) * .41; sheet(c, x + w / 2 + 60 + a * 700, top + lid + 40 - a * 900 + a * a * 1800, 60, a * 7 + n + i, Math.cos(a * 12), n * 3 + i); }
  }
  const COP = [1520, 1050, 340, 380];
  // her gum pops on the snare under MESSAGE (the shot's first frame)
  function tashaOn(c, t) {
    const tc = tc_(t), age = tc - W69[2], hb = headbang(tc, 1, clamp(age / .3) * .9), s = 62;
    const gum = age < 0 ? .95 : 1 + clamp(age / .12) * .4;
    return person(c, COP[0], COP[1] - COP[3] + 4.2 * s, s, 'tasha', { sit: 1, hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.3, gum, eyes: age < .25 ? 'wide' : 'open', lids: age < .25 ? 0 : .5,
      nod: hb.nod, tilt: hb.tilt, lean: hb.lean * .5, t: tc });
  }
  function s6(ctx, t, lt) {
    const h = hit(t, [W69[2]], 5), sh = shake(t, 4 + 14 * h), z = TASHACAM[2] * (1 + .05 * h), cx = TASHACAM[0] + sh[0] / 2, cy = TASHACAM[1] + sh[1] / 2, view = c => cam(c, cx, cy, z, -.03);
    view(ctx); desk(ctx, t); copier(ctx, ...COP, t); ctx.restore();
    let A; printIn(ctx, clamp(.55 + lt / .14), c => { view(c); A = tashaOn(c, t); c.restore(); });
    if (A && lt < .5) { const m = camPt(...A.mouth, cx, cy, z); sfx(ctx, 'POP!', m[0] - 260, m[1] - 120, 150, lt, { rot: -.12, color: INK.pinkLt, dotColor: INK.pink, life: .5 }); }
    flash(ctx, INK.white, .4 * hit(t, [W69[2]], 18));
    split(ctx, 10 * h, .3);
  }

  // ---------- 125.34 - 131.98: the throws ----------
  // prop path keys [x, y, scale, rot] in Greg's webcam view; kinds: over (two hands overhead), flick (one hand), put (shot put)
  const DANF = [960, 1420, 96], DANZ = 1.45;   // Dan in his own webcam: ground point + s, drawn scaled DANZ about his head
  const KIND = {
    over: [[960, 1000, 1, 0], [960, 420, 1, -.06], [960, 395, .8, .1], [960, 520, 1.12, -.04]],
    flick: [[1110, 960, 1, .4], [830, 770, 1, -.6], [780, 730, .88, -1.1], [1250, 700, 1.1, .7]],
    put: [[960, 960, 1, 0], [960, 870, 1, 0], [960, 830, .86, .06], [960, 760, 1.3, 0]],
  };
  const THROWS = [
    { prop: 'keyboard', kind: 'over', t0: 125.34, tl: 125.66, tk: 126.2, tr: 126.3, ti: wordT(70, 3), u: .4, v: .5 },
    { prop: 'card', kind: 'flick', t0: 127.36, tl: 127.5, tk: 127.84, tr: 127.96, ti: wordT(71, 3), u: .6, v: .3 },
    { prop: 'slack', kind: 'flick', t0: 129.14, tl: 129.26, tk: 129.38, tr: 129.48, ti: wordT(72, 2), u: .27, v: .62 },
    { prop: 'teams', kind: 'put', t0: 130.24, tl: 130.28, tk: 130.36, tr: 130.44, ti: wordT(73, 2), u: .72, v: .6 },
    { prop: 'outlook', kind: 'over', t0: 131.08, tl: 131.16, tk: 131.24, tr: 131.3, ti: wordT(74, 2), u: .5, v: .48 },
  ];
  function keyboardProp(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    const w = 250, h = 84;
    ink(c, rrect(-w / 2, -h / 2, w, h, 10), { fill: INK.paperDk, shade: { color: INK.red, spacing: 9, dir: [0, 1], from: 0, to: h }, line: 4, smooth: false, seed: 400 });
    c.fillStyle = INK.ink;
    for (let r = 0; r < 4; r++) for (let k = 0; k < 13; k++) { if (r === 3 && k > 3 && k < 9) continue; c.fillRect(-w / 2 + 12 + k * 18.2, -h / 2 + 10 + r * 17, 14, 13); }
    c.fillRect(-w / 2 + 12 + 4 * 18.2, -h / 2 + 10 + 3 * 17, 18.2 * 5 - 4, 13);
    fillPts(c, rect(-w / 2 + 12, -h / 2 + 10, 14, 13), INK.red, false);   // Esc
    c.restore();
  }
  // the keyboard's USB cable: hangs down out of frame while held, whips along behind it in flight
  function cable(c, t, A) {
    const [x, y, s, rot] = A.p, tc = tc_(t), root = [x - Math.sin(rot) * 40 * s, y + Math.cos(rot) * 40 * s];
    const tail = A.held ? [root[0] + 80 + 30 * Math.sin(tc * 9), 1150] : [root[0] + 260 * s, root[1] + 120 * s];
    const mid = A.held ? [root[0] - 60 + 40 * Math.sin(tc * 7), (root[1] + 1150) / 2] : [root[0] + 140 * s, root[1] - 90 * s];
    inkLine(c, bezPts(root, [root[0], root[1] + 60], mid, tail, 18), 6 * Math.min(s, 3), INK.ink, { taper: [0, 0] });
  }
  function cardProp(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    fillPts(c, rect(-60 + 6, -36 + 7, 120, 72), INK.ink, false);
    ink(c, rect(-60, -36, 120, 72), { fill: INK.white, line: 3, smooth: false, seed: 410 });
    fillPts(c, rect(-60, -36, 120, 16), INK.red, false);
    txt(c, 'DAN KOWALSKI', 0, 6, { font: 'ui', weight: 900, size: 14, align: 'center', color: INK.ink });
    txt(c, 'DESK 4B', 0, 26, { font: 'ui', weight: 800, size: 13, align: 'center', color: INK.red });
    c.restore();
  }
  function drawProp(c, prop, x, y, s, rot) {
    if (prop === 'keyboard') keyboardProp(c, x, y, s, rot);
    else if (prop === 'card') cardProp(c, x, y, s * 1.3, rot);
    else { c.save(); c.translate(x, y); c.rotate(rot); (prop === 'slack' ? slackLogo : prop === 'teams' ? teamsLogo : outlookLogo)(c, 0, 0, 170 * s); c.restore(); }
  }
  const propSize = { keyboard: 120, card: 80, slack: 70, teams: 72, outlook: 72 };
  // prop state at time tt (hand-held phases on twos, the flight on ones)
  function propAt(T, t) {
    const K = KIND[T.kind], tc = tc_(t);
    if (t < T.tr) return { held: true, p: kf(tc, [[T.t0, K[0]], [T.tl, K[1]], [T.tk, K[2]], [T.tr, K[3]]], easeInOut) };
    // flying straight at the lens: distance falls linearly, so the size grows like 1 / distance
    const u = clamp((t - T.tr) / (T.ti - T.tr)), zz = Math.max(.06, Math.pow(1 - u, 1.6)), r = K[3];
    return { held: false, u, p: [lerp(r[0], 960, u), lerp(r[1], 560, u), r[2] / zz, r[3] + u * (T.kind === 'flick' ? 9 : 1.2)] };
  }
  function throwPose(T, t, A) {
    const tc = tc_(t), K = KIND[T.kind], pp = A.p, held = A.held;
    const coil = held ? kf(tc, [[T.t0, 0], [T.tl, .3], [T.tk, 1], [T.tr, -.6]], easeInOut) : -1 + clamp((t - T.tr) / .5) * .7;
    const pose = { rage: 1, wild: 1, stage: 1, open: .6 + .4 * singOpen(t, 70, 74), sq: -coil * .12, nod: -coil * .22 + (coil < 0 ? -coil * .25 : 0), tilt: -4 + 3 * Math.sin(tc * 5), t: tc };
    const s = pp[2], c = Math.cos(pp[3]), sn = Math.sin(pp[3]), half = propSize[T.prop] * s;
    if (held) {
      if (T.kind === 'flick') { pose.reachR = [pp[0], pp[1]]; pose.handR = 'grip'; pose.armL = { a: 45 + 20 * coil, e: -40 }; pose.handL = 'point'; }
      else { pose.reachL = [pp[0] - c * half, pp[1] - sn * half]; pose.reachR = [pp[0] + c * half, pp[1] + sn * half]; pose.handL = pose.handR = 'grip'; }
    } else if (T.kind === 'flick') { pose.armR = { a: 105, e: -5 }; pose.handR = 'open'; pose.armL = { a: 35, e: -60 }; pose.handL = 'fist'; }
    else { pose.armL = { a: 38, e: -25 }; pose.armR = { a: 38, e: -25 }; pose.handL = pose.handR = 'open'; }
    return pose;
  }
  function throwShot(i) {
    const T = THROWS[i];
    return (ctx, t, lt) => {
      const sn = snare(t, 7), A = propAt(T, t), sh = shake(t, 2 + 7 * sn);
      teamsTile(ctx, [0, 0, W, H], t, { who: 'dan', muted: true, zoom: 3, depth: 0, draw: (c) => {
        depth(c, 9, d => { cam(d, 960 + sh[0] * .5, 640 + sh[1] * .5, 1.45); openPlan(d, t, { k: 1, inks: INKS, stare: 1, clock: CLOCK(t), strobe: 1 }); d.restore(); });
        // Dan and his prop scaled together about his head (the paths are keyed at DANF), with a punch on the snares
        const z = DANZ * (1 + .035 * sn), hy = DANF[1] - 9.22 * DANF[2];
        c.save(); c.translate(960 + sh[0], hy + sh[1]); c.scale(z, z); c.translate(-960, -hy);
        if (T.prop === 'keyboard') cable(c, t, A);
        person(c, ...DANF, 'dan', throwPose(T, t, A));
        drawProp(c, T.prop, ...A.p);
        if (!A.held) speedLines(c, A.p[0], A.p[1], { n: 50, r0: 180 * A.p[2], r1: 1600, w: 8, color: INK.ink });
        c.restore();
      } });
    };
  }

  // ---------- the impacts on Greg's monitor ----------
  const MON = DESK.monitor, MZ = 2.8, MC = [MON[0] + MON[2] / 2, MON[1] + MON[3] / 2 + 46];
  function crack(c, x, y, R, seed, grow) {
    const n = 9 + Math.floor(hash(seed) * 5), rays = [];
    for (let i = 0; i < n; i++) { const a0 = (i + hash(seed + i) * .6) / n * TAU, L = R * (.55 + .7 * hash(seed * 3 + i)) * grow, pts = [[x, y]];
      for (let j = 1; j <= 5; j++) { const a = a0 + (hash(seed * 7 + i * 5 + j) - .5) * .5; pts.push([x + Math.cos(a) * L * j / 5, y + Math.sin(a) * L * j / 5]); }
      rays.push(pts); }
    c.save(); c.lineJoin = 'round';
    for (const w of [[3.2, INK.ink], [1.3, INK.white]]) {
      c.beginPath();
      for (const r of rays) { c.moveTo(...r[0]); for (const p of r) c.lineTo(...p); }
      for (const ring of [1, 3]) for (let i = 0; i < n; i++) { const a = rays[i][ring], b = rays[(i + 1) % n][ring]; if (hash(seed + i * 9 + ring) < .7) { c.moveTo(...a); c.lineTo(...b); } }
      c.strokeStyle = w[1]; c.lineWidth = w[0]; c.stroke();
    }
    fillPts(c, star(x, y, R * .16 * grow, .35, 7, hash(seed) * 3), INK.white, false);
    c.restore();
  }
  function screenFx(c, box, t, i) {
    const [x, y, w, h] = box;
    for (let j = 0; j <= i; j++) { const T = THROWS[j]; if (t < T.ti - VLEAD) continue; crack(c, x + w * T.u, y + h * T.v, w * (.22 + .05 * j), 50 + j * 17, easeOut(clamp((t - T.ti + VLEAD) / .08))); }
    if (i >= 3 && t >= THROWS[3].ti + .12) unstableBanner(c, box, { zoom: 1, depth: 0 });
    // what stays stuck in the glass
    if (i >= 1) { const T = THROWS[1]; cardProp(c, x + w * T.u, y + h * T.v, .78, -.35); }
    if (i >= 2) { const T = THROWS[2], wob = Math.exp(-(t - T.ti) * 8) * Math.sin((t - T.ti) * 60) * .2; c.save(); c.translate(x + w * T.u, y + h * T.v); c.rotate(.5 + wob); slackLogo(c, 0, 0, 62); c.restore(); }
  }
  function hitShot(i) {
    const T = THROWS[i];
    return (ctx, t, lt) => {
      const h = hit(t, [T.ti], 6), sh = shake(t, 3 + 20 * h), z = MZ * (1 + .1 * h), cx = MC[0] + sh[0] / z, cy = MC[1] + sh[1] / z;
      const shatter = i === 4;
      cam(ctx, cx, cy, z);
      desk(ctx, t, { screen: (c, b, tt) => {
        if (shatter && tt >= T.ti - VLEAD) { deadScreen(c, b, tt); return; }
        gregCall(c, b, tt, { camK: 0, pose: tt - T.ti < .1 ? { eyes: 'wide', lids: 0 } : { eyes: 'happy' } });
        screenFx(c, b, tt, i);
        if (i === 0) mutedToast(c, b[0] + b[2] * .5, b[1] + b[3] * .34, tt, T.ti + .2, { zoom: 1.3, depth: 0 });
      } });
      // the thrown thing at the glass
      const [mx, my, mw, mh] = MON, ix = mx + mw * T.u, iy = my + mh * T.v, a = Math.max(0, t - T.ti);
      if (T.prop === 'keyboard') keyboardProp(ctx, ix - a * 40, iy + 30 + 900 * a * a, .62 + .25 * Math.exp(-a * 10), -.15 + a * 2);
      if (T.prop === 'teams') { ctx.save(); ctx.translate(ix + a * 30, iy + 1000 * a * a); ctx.rotate(.3 + a * 3); teamsLogo(ctx, 0, 0, 80); ctx.restore(); }
      desk(ctx, t, { fg: true });
      ctx.restore();
      if (shatter) shards(ctx, t, T, cx, cy, z);
      // glass and keycaps flying at the camera
      chips(ctx, t, T, camPt(ix, iy, cx, cy, z), i);
      flash(ctx, INK.white, .55 * hit(t, [T.ti], 20));
      split(ctx, 16 * h, .4);
    };
  }
  function chips(ctx, t, T, o, i) {
    const a = t - T.ti; if (a < -VLEAD || a > .6) return;
    const n = 16 + i * 3;
    for (let j = 0; j < n; j++) { const ang = hash(j * 3.7 + i) * TAU, v = 700 + hash(j * 5.1 + i) * 1500, aa = Math.max(0, a), s = 1 + aa * 5;
      const x = o[0] + Math.cos(ang) * v * aa, y = o[1] + Math.sin(ang) * v * aa + 700 * aa * aa, r = (14 + hash(j) * 26) * s;
      if (T.prop === 'keyboard' && j % 2) { keycap(ctx, x, y, r * 1.6, aa * 9 * (hash(j * 2) - .5), 'QWERTYASDFGHZX'[j % 14]); continue; }
      ink(ctx, xform([[0, -r], [r * .8, r * .6], [-r * .6, r * .4]], x, y, 1, aa * 10 * (hash(j * 9) - .5) + j), { fill: j % 4 ? INK.white : INK.paperDk, line: 3, smooth: false, boil: 0 }); }
  }
  function keycap(ctx, x, y, s, rot, ch) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ink(ctx, rrect(-s / 2, -s / 2, s, s, s * .16), { fill: INK.paperDk, line: Math.max(2, s * .05), smooth: false, boil: 0 });
    fillPts(ctx, rrect(-s * .36, -s * .4, s * .72, s * .62, s * .1), INK.white, false);
    txt(ctx, ch, 0, s * .06, { font: 'ui', weight: 800, size: s * .4, align: 'center', base: 'middle', color: INK.ink });
    ctx.restore();
  }
  function deadScreen(c, [x, y, w, h], t) {
    fillPts(c, rect(x, y, w, h), INK.ink, false);
    const n = Math.floor(t * 6) % 4;
    txt(c, 'Reconnecting' + '.'.repeat(n), x + w / 2, y + h * .58, { font: 'ui', weight: 600, size: 23, align: 'center', base: 'middle', color: INK.white });
    c.save(); c.translate(x + w / 2, y + h * .38); c.rotate(t * 8); c.beginPath(); c.arc(0, 0, 17, 0, 4.5); c.strokeStyle = INK.teamsLt; c.lineWidth = 4; c.stroke(); c.restore();
  }
  // the final throw: the whole screen breaks into pieces that fly at the camera
  function shards(ctx, t, T, cx, cy, z) {
    const a = t - T.ti + VLEAD; if (a < 0) return;
    const c = pushLayer(); cam(c, cx, cy, z); c.save(); clipPts(c, rect(...MON), false);
    gregCall(c, MON, T.ti - .01, { camK: 0 }); screenFx(c, MON, T.ti - .01, 3); c.restore(); c.restore();
    const [mx, my, mw, mh] = MON, nx = 5, ny = 3, P = (i, j) => { const e = i === 0 || j === 0 || i === nx || j === ny; return [mx + mw * i / nx + (e ? 0 : (hash(i * 7 + j * 13) - .5) * mw / nx * .7), my + mh * j / ny + (e ? 0 : (hash(i * 3 + j * 17) - .5) * mh / ny * .7)]; };
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (const tri of [0, 1]) {
      const q = tri ? [P(i, j), P(i + 1, j), P(i + 1, j + 1)] : [P(i, j), P(i + 1, j + 1), P(i, j + 1)];
      const sq = q.map(p => camPt(p[0], p[1], cx, cy, z)), g = [(sq[0][0] + sq[1][0] + sq[2][0]) / 3, (sq[0][1] + sq[1][1] + sq[2][1]) / 3];
      const id = i * 11 + j * 3 + tri, d = [g[0] - W / 2, g[1] - H / 2], sp = 1 + a * (2 + hash(id) * 4), rot = a * (hash(id * 3) - .5) * 10;
      const ang = Math.hypot(...d) > 60 ? Math.atan2(d[1], d[0]) + (hash(id * 7) - .5) * .8 : hash(id * 7) * TAU, v = 2400 + hash(id * 5) * 2200;
      const ox = Math.cos(ang) * v * a, oy = Math.sin(ang) * v * a + 1500 * a * a;
      const [bx0, by0, bx1, by1] = bbox(sq), bw = Math.min(W, bx1) - Math.max(0, bx0), bh = Math.min(H, by1) - Math.max(0, by0);
      if (bw <= 1 || bh <= 1) continue;
      ctx.save(); ctx.translate(g[0] + ox, g[1] + oy); ctx.rotate(rot); ctx.scale(sp, sp); ctx.translate(-g[0], -g[1]);
      ctx.save(); clipPts(ctx, sq, false); ctx.drawImage(c.canvas, Math.max(0, bx0), Math.max(0, by0), bw, bh, Math.max(0, bx0), Math.max(0, by0), bw, bh); ctx.restore();
      outline(ctx, sq, 4 / sp, INK.ink, { smooth: false });
      ctx.restore();
    }
    popLayer();
  }

  // ---------- 131.98 - 135.30: everyone stands up / WHAT ARE WE DOING? ----------
  const TICKS = [131.982, 132.2, ...ROLL.filter(x => x < 133.36)];
  const FLOOR = (() => {
    const L = [];
    for (const d of OPEN.desks) {
      if (d.row > 8 || d.empty) continue;
      const p = OPEN.P(d.X, 0, d.z), s = .175 * OPEN.f / d.z;
      if (p[0] < -200 || p[0] > W + 200) continue;
      L.push({ ...d, gx: p[0], gy: p[1], s, clipY: OPEN.P(0, OPEN.ph, OPEN.row0 + (d.row - 1) * OPEN.rowD)[1] });
    }
    const band = { [L.find(d => d.row === 1 && d.side < 0)?.id]: 'bob', [L.find(d => d.row === 1 && d.side > 0)?.id]: 'tasha', [L.find(d => d.row === 2 && d.side > 0 && d.col === 0)?.id]: 'linda' };
    // pop order: a few readable mid rows first, then the far mass, the big front row (the band) last
    const order = L.slice().sort((a, b) => (band[a.id] ? 2 : 0) + (a.row > 3 ? .5 : 0) * hash(a.id) + hash(a.id * 7.7) * .6 - ((band[b.id] ? 2 : 0) + (b.row > 3 ? .5 : 0) * hash(b.id) + hash(b.id * 7.7) * .6));
    let k = 0; TICKS.forEach((tk, i) => { const n = i < 2 ? 1 : Math.round(1 + (i - 2) * .55); for (let m = 0; m < n && k < order.length; m++) order[k++].tp = tk + m * .012; });
    for (; k < order.length; k++) order[k].tp = TICKS[TICKS.length - 1];
    for (const d of L) d.who = band[d.id] || d.id;
    L.sort((a, b) => b.z - a.z);
    return L;
  })();
  const DAN_Z = 3.7;
  function floorScene(ctx, t, o = {}) {
    const tc = tc_(t), b = beatAt(t + VLEAD), scream = t >= WHAT[0] - VLEAD, bang = o.bang || 0;
    openPlan(ctx, t, { k: 1, inks: INKS, people: false, clock: CLOCK(t), strobe: 1 });
    const danAt = OPEN.at(DAN_Z);
    let danDone = false;
    for (const d of FLOOR) {
      if (!danDone && d.z < DAN_Z) { danDone = true; floorDan(ctx, t, danAt, o); }
      const up = t >= d.tp - VLEAD, u = up ? backOut(seg(tc, d.tp - VLEAD, d.tp + .16), 2.6) : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(-50, -400, W + 100, d.clipY + 400); ctx.clip();
      if (!up) {   // still seated, back to the camera
        const sp = OPEN.P(d.X, 1.02, d.z), r = d.r;
        ink(ctx, rrect(sp[0] - r * 1.7, sp[1] - r * .25, r * 3.4, r * 3.2, r * .8), { fill: [INK.ink, INK.blue, INK.paperDk, INK.yellow][d.id % 4], line: Math.max(1.2, 9 / d.z), smooth: false, boil: .3, seed: d.id + 1 });
        cubeHead(ctx, d.x, d.y, r, d.id, { facing: -1, t: t + d.id, k: 1 });
      } else {
        const rise = (1 - u) * 1.1 * OPEN.f / d.z, ph = hash(d.id * 2.3) * .5, hop = scream ? Math.max(0, Math.sin((b + ph) * Math.PI)) * .9 : 0, pa = t - d.tp + VLEAD;
        if (pa < .17 && !scream) burst(ctx, d.gx, d.gy - 8.4 * d.s, d.s * (2.2 + 5 * pa), { fill: INK.yellow, seed: d.id, n: 9, line: Math.max(2, d.s * .12), shade: null });
        const hb = bang ? headbang(tc + ph * .2, 1, bang) : { nod: 0, tilt: 0, lean: 0 };
        if (d.row <= 3) {
          const arms = scream ? { armL: { a: 150 + 15 * hash(d.id), e: 15 }, armR: { a: 140 + 20 * hash(d.id * 3), e: 20 }, handL: hash(d.id * 5) < .4 ? 'horns' : 'fist', handR: 'fist' } : { armL: { a: 12, e: -20 }, armR: { a: 12, e: -20 } };
          person(ctx, d.gx, d.gy + rise, d.s, d.who, { rage: scream ? 1 : .55, wild: 1, stage: 1, mouth: scream ? 'scream' : 'grit', open: scream ? .8 + .2 * Math.sin(tc * 9 + d.id) : 0,
            eyes: scream ? 'rage' : 'wide', lx: clamp((960 - d.gx) / 700, -1, 1) * .7, hop, sq: (1 - u) * -.2, turn: clamp((960 - d.gx) / 1400, -.4, .4),
            badge: { swing: 40 * Math.exp(-(tc - d.tp) * 4) * Math.sin((tc - d.tp) * 14) }, nod: hb.nod, tilt: hb.tilt, ...arms, t: tc });
        } else crowdPerson(ctx, d.gx, d.gy + rise - hop * d.s, d.s, d.id, { arms: scream ? 1 : .1, nod: hb.nod });
      }
      ctx.restore();
    }
    if (!danDone) floorDan(ctx, t, danAt, o);
  }
  function floorDan(ctx, t, [x, y, s], o) {
    const tc = tc_(t), scream = t >= WHAT[0] - VLEAD, raise = easeInOut(seg(tc, 131.98, WHAT[0])), bang = o.bang || 0, hb = headbang(tc, 1, bang);
    const pose = scream ? { armL: { a: 150, e: 20 }, armR: { a: 150, e: 20 }, handL: 'fist', handR: 'fist', mouth: 'scream', open: 1, hop: Math.max(0, Math.sin(beatAt(t + VLEAD) * Math.PI)) * .8 }
      : { armL: { a: lerp(30, 120, raise), e: lerp(-10, 25, raise) }, armR: { a: lerp(30, 120, raise), e: lerp(-10, 25, raise) }, handL: 'open', handR: 'open', mouth: 'grit' };
    person(ctx, x, y, s, 'dan', { rage: 1, wild: 1, stage: 1, legs: 'wide', nod: hb.nod, tilt: hb.tilt, lean: hb.lean * .5, ...pose, t: tc });
  }
  function rise(ctx, t, lt) {
    const r = hit(t, ROLL, 30), sh = shake(t, 2 + 3 * r), z = 1.55 + lt * .06 + .01 * r;
    cam(ctx, 960 + sh[0], 590 + sh[1], z); floorScene(ctx, t); ctx.restore();
  }
  function what(ctx, t, lt) {
    const r = hit(t, ROLL, 30), wi = WHAT.filter(x => x - VLEAD <= t).length - 1, h = hit(t, WHAT, 7);
    const Z = [1.15, 1.35, 1.6, 1.95][Math.max(0, wi)] * (1 + .06 * h) + .008 * r, sh = shake(t, 4 + 12 * h), [x, y, s] = OPEN.at(DAN_Z);
    cam(ctx, lerp(960, x, seg(Z, 1.1, 2)) + sh[0], lerp(600, y - 8.6 * s, seg(Z, 1.1, 2)) + sh[1], Z); floorScene(ctx, t, { bang: .9 * seg(t, WHAT[3] - .1, WHAT[3] + .2) }); ctx.restore();
    storm(ctx, t, Math.round(lerp(0, 14, seg(t, WHAT[0], 135.3))), { seed: 3, speed: 1100 });
    if (t < WHAT[0] + .1) flash(ctx, INK.white, .5 * hit(t, [WHAT[0]], 18));
    split(ctx, 12 * h, .3);
  }

  // ---------- 135.30 the grid is the band: four tiles, all unmuted, all headbanging ----------
  // a webcam backdrop for the grid tiles (full-frame coords): the cubicle wall printed hot, one strobing troffer, the desk edge
  function camBg(c, t, deskY) {
    fillPts(c, rect(0, 0, W, H), INK.red, false);
    dotsIn(c, [0, 0, W, H], { spacing: 46, color: INK.redDk, dir: [0, 1], from: 150, to: 1000, min: 0, max: .9 });
    fluoro(c, t, [520, 30, 880, 64], { k: 1, strobe: 1, glow: INK.yellow, spacing: 24 });
    if (deskY) { ink(c, rect(-20, deskY, W + 40, 56), { fill: INK.yellow, line: 5, smooth: false }); fillPts(c, rect(-20, deskY + 56, W + 40, H), INK.ink, false); }
  }
  const TILES = {
    dan: (c, t) => { const tc = tc_(t), hb = headbang(tc, 1, 1); camBg(c, t, 830);
      person(c, 960, 870, 76, 'dan', { rage: 1, wild: 1, stage: 1, legs: 'wide', armL: { a: 150, e: 15 }, armR: { a: 70, e: 60 }, handL: 'horns', handR: 'fist', ...hb, t: tc }); },
    bob: (c, t) => { const tc = tc_(t), ph = (tc - W69[0]) / .41, hb = headbang(tc, 1, 1), hits = { kick: kick(t, 8), snare: hit(t, ROLL, 14), crash: hit(t, [135.3], 4), hat: pulse(t, 12, .5), tom: 0 };
      camBg(c, t, 860); drumKit(c, 960, 900, 74, t, { layer: 'back', hits, k: 1, inks: INKS });
      person(c, 960, 892, 74, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(ph * 2 + .5), r: stroke(ph * 2) }, mouth: 'scream', rage: 1, eyes: 'rage', sweat: 1, nod: hb.nod * .6, tilt: hb.tilt * .5, t: tc });
      drumKit(c, 960, 900, 74, t, { layer: 'front', hits, k: 1, inks: INKS }); },
    linda: (c, t) => { const tc = tc_(t), hb = headbang(tc, 1, .9); camBg(c, t); cabinet(c, 900, 1300, 360, 560, t);
      person(c, 900, 740, 82, 'linda', { hold: 'guitar', strum: frac(tc * 4.8), fret: .4, legs: 'wide', turn: .3, lids: .5, mouth: 'flat', lean: hb.lean, nod: hb.nod, tilt: hb.tilt, t: tc }); },
    tasha: (c, t) => { const tc = tc_(t), hb = headbang(tc, 1, 1); camBg(c, t); copier(c, 960, 1180, 460, 480, t);
      person(c, 960, 700 + 4.2 * 80, 80, 'tasha', { sit: 1, hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.3, mouth: 'scream', open: .8, eyes: 'rage', nod: hb.nod, tilt: hb.tilt, lean: hb.lean * .5, t: tc }); },
  };
  function grid(ctx, t, lt) {
    const r = hit(t, ROLL, 30), sh = shake(t, 2 + 4 * r);
    look(1);
    const scene = fn => (c, [x, y, w, h], tt) => { c.save(); c.translate(x, y); c.scale(w / W, h / H); c.translate(960, 380); c.scale(1.4, 1.4); c.translate(-960, -380); fn(c, tt); c.restore(); };
    ctx.save(); ctx.translate(sh[0], sh[1]);
    teamsCall(ctx, [0, 0, W, H], t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: TIMER(t), participants: 112, zoom: 1.5, mic: true, depth: 0,
      tiles: ['dan', 'bob', 'linda', 'tasha'].map(who => ({ who, speaking: true, draw: scene(TILES[who]) })) });
    ctx.restore();
    storm(ctx, t, 10, { seed: 5, speed: 1200, size: .9 });
    split(ctx, 6 * r, .3);
  }

  // ---------- 136.16 the clock spins, the paper storms ----------
  function clockSpin(ctx, t, lt) {
    const r = hit(t, ROLL, 30), sh = shake(t, 4 + 6 * r), [kx, ky] = DESK.clock, spin = 43200 * easeIn(seg(t, 136.16, END)) * 1.6;
    cam(ctx, kx + sh[0] * .3, ky + 40 + sh[1] * .3, 4.2 + lt * .8, .06 * Math.sin(lt * 9));
    desk(ctx, t, { clock: CLOCK(t) + spin });
    ctx.restore();
    storm(ctx, t, 18, { seed: 9, speed: 1500, size: 1.3 });
    split(ctx, 4 + 8 * r, .5);
  }

  // ---------- 136.98 the push into Dan's scream ----------
  function scream(ctx, t, lt) {
    const tc = tc_(t), k = easeIn(seg(t, 136.98, END - 1 / 24)), r = hit(t, ROLL, 30), sh = shake(t, 6 + 14 * k + 6 * r), hh = lerp(560, 4600, k), dh = CAST.dan.head;
    sunburst(ctx, 960, 560, INK.red, INK.redDk, t * 3, 18);
    dotsIn(ctx, [0, 0, W, H], { spacing: 40, color: INK.yellow, k: (x, y) => clamp(1.2 - Math.hypot(x - 960, y - 560) / 700) * .8 });
    ctx.save(); ctx.translate(sh[0], sh[1]);
    // keep the mouth at the centre as the camera pushes in
    const F = headFit(960, 540 - dh.mouthY * hh / (2 * dh.ry), hh, 'dan');
    person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, wild: 1, stage: 1, open: 1, tilt: -6 + 4 * Math.sin(tc * 7), nod: -.1, t: tc });
    ctx.restore();
    storm(ctx, t, 12, { seed: 13, speed: 1700, size: 1.4 });
    split(ctx, 6 + 10 * k, .4);
  }

  chapter('breakdown', 121.85, END, [
    [121.85, s1], [W68[1], s2], [W68[2], s3], [W69[0], s4], [W69[1], s5], [W69[2], s6],
    ...THROWS.flatMap((T, i) => [[T.t0, throwShot(i)], [T.ti, hitShot(i)]]),
    [131.98, rise], [WHAT[0], what], [135.30, grid], [136.16, clockSpin], [136.98, scream],
  ]);

  // ---------- lyrics: one word per slam, the hit word on the impact ----------
  const ST = { stroke: { w: 14, color: INK.ink }, extrude: { dx: 16, dy: 18, color: INK.ink } };
  const one = (li, wi, box, color, o = {}) => ({ mode: 'hero', words: [wi], rows: [1], box, align: 'center', color, tilt: 0, maxSize: 700, out: 'cut', ...ST,
    ...(wi + 1 < LINES[li].words.length ? { until: wordT(li, wi + 1) - LEAD } : {}), ...o });
  const lead = (li, n, color = INK.paper) => ({ mode: 'hero', words: [...Array(n).keys()], rows: [n], box: [430, 870, 1060, 150], align: 'center', color, tilt: 0, out: 'cut', ...ST,
    until: wordT(li, n) - LEAD });
  const HOTBOX = [140, 790, 1640, 260];
  Object.assign(LYRICS, {
    68: [one(68, 0, [140, 700, 1640, 340], INK.paper), one(68, 1, [1100, 640, 700, 380], INK.yellow), one(68, 2, [120, 60, 1680, 300], INK.red)],
    69: [one(69, 0, [70, 300, 720, 420], INK.paper), one(69, 1, [1060, 300, 760, 400], INK.yellow), one(69, 2, [120, 810, 1680, 240], INK.red)],
    70: [lead(70, 3), one(70, 3, HOTBOX, INK.yellow)],
    71: [lead(71, 3), one(71, 3, HOTBOX, INK.yellow)],
    72: [lead(72, 2), one(72, 2, HOTBOX, INK.yellow)],
    73: [lead(73, 2), one(73, 2, HOTBOX, INK.yellow)],
    74: [lead(74, 2), one(74, 2, HOTBOX, INK.yellow, { end: 131.98 - LEAD })],
    75: { mode: 'hero', box: [140, 40, 1640, 400], rows: [2, 2], emph: [3], hot: INK.red, color: INK.paper, align: 'center', tilt: 0, end: 135.30 - LEAD, ...ST },
  });
})();
