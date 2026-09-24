// c08_outro.js: the hot-fix montage on the band stabs, the ending fairy, the button, the title card.
(() => {
  const F = n => n / 24;                                     // start time of frame n
  // First frame on (or just before) each onset measured in the band stem.
  const STAB = [F(2934), F(2944), F(2954), F(2964)];         // 122.25 122.667 123.083 123.5
  const FILL = [F(2969), F(2972)];                           // fill hits while the status page holds
  const T_CMT = F(2974), T_CLICK = F(2994), T_BTN = F(3041); // 123.917 124.75 126.708
  const WORDS = [125.56, 125.66, 125.94];
  const GREY = '#6E6A78';
  const age = (t, x) => t - x + .002;                        // >= 0 from the frame of x on
  const kick = (t, times, k) => { let v = 0; for (const x of times) { const a = age(t, x); if (a >= 0) v = Math.exp(-a * k); } return v; };
  const slam = (a, ks) => a < 0 ? 1 : ks[Math.floor(a * 24)] ?? 1;   // per-frame scale keys from the hit frame on
  // depth() draws its layer untransformed; carry the current camera into it.
  const dep = (ctx, px, fn) => { const m = ctx.getTransform(); depth(ctx, px, c => { c.setTransform(m); fn(c); }); };
  const ring = (ctx, x, y, r, w, col) => { if (w > .5) outline(ctx, ell(x, y, r, r, 40), w, col, { heavy: .2 }); };

  // ---------- night UI world ----------
  function nightField(ctx, cx, cy, z) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    fillPts(ctx, rect(0, 0, W, H), INK.night, false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.nightLt, k: (x, y) => .25 + .5 * (.5 + .5 * noise2((cx + (x - W / 2) / z) * .0022, (cy + (y - H / 2) / z) * .0022)) });
    // far plane: other windows left open overnight, out of focus, at half parallax
    cam(ctx, cx * .5, cy * .5, z * .55);
    dep(ctx, 10, c => { for (let i = 0; i < 14; i++) {
      const x = -900 + (i % 7) * 520 + hash(i) * 160, y = -500 + Math.floor(i / 7) * 900 + hash(i + 7) * 260, w = 300 + hash(i + 3) * 220, h = 200 + hash(i + 5) * 160;
      ink(c, rrect(x, y, w, h, 14), { fill: INK.nightLt, line: 5, boil: .6, smooth: false, seed: i });
      for (let k = 0; k < 5; k++) fillPts(c, rect(x + 24, y + 30 + k * 30, (w - 48) * (.35 + .6 * hash(i * 9 + k)), 12), rgba(INK.cyan, .22), false);
    } });
    ctx.restore(); ctx.restore();
  }
  const coolShade = (ctx, pts) => shade(ctx, pts, { color: rgba(INK.blue, .14), spacing: 16, dir: [.6, .8], from: 100, to: 900, smooth: false });
  function checkDisc(ctx, x, y, r, ok) {
    ink(ctx, ell(x, y, r, r, 28), { fill: ok ? INK.green : INK.yellow, line: 4, boil: .5 });
    if (ok) inkLine(ctx, [[x - r * .42, y + r * .02], [x - r * .1, y + r * .34], [x + r * .46, y - r * .32]], r * .22, INK.white, { taper: [0, 0], smooth: false });
    else fillPts(ctx, ell(x, y, r * .3, r * .3, 14), INK.ink);
  }

  function revertPR(ctx, t) {
    const X = 170;
    uiBox(ctx, 100, 90, 1760, 1230, { r: 16, shadow: 18 });
    coolShade(ctx, rrect(100, 90, 1760, 1230, 16));
    const tf = { font: 'ui', weight: 800, size: 84 };
    txt(ctx, 'Revert "Small fix"', X, 222, tf);
    txt(ctx, '#4813', X + measure(ctx, 'Revert "Small fix" ', tf).w, 222, { ...tf, weight: 500, color: GREY });
    // state pill: Merged slams in on stab 3
    const a3 = age(t, STAB[2]), merged = a3 >= 0, lab = merged ? 'Merged' : 'Open', pw = measure(ctx, lab, { font: 'ui', weight: 700, size: 40 }).w + 48;
    ctx.save(); ctx.translate(X + pw / 2, 318); const ps = slam(a3, [1.45, .9, 1.05]); ctx.scale(ps, ps);
    pill(ctx, -pw / 2, 0, lab, { fill: merged ? INK.purple : INK.green, size: 40 }); ctx.restore();
    if (merged && a3 < .3) ring(ctx, X + pw / 2, 318, pw * .6 + a3 * 900, 10 * (1 - a3 / .3), INK.purple);
    txt(ctx, `you ${merged ? 'merged' : 'wants to merge'} 1 commit into main from revert-4812-small-fix`, X + pw + 22, 330, { font: 'ui', weight: 500, size: 32, color: '#4A4658' });
    // the inverse diffstat
    const df = { font: 'mono', weight: 800, size: 124 }, ds = slam(age(t, STAB[0]), [1.3, .95, 1.03]);
    ctx.save(); ctx.translate(X, 600); ctx.scale(ds, ds);
    txt(ctx, '+12', 0, 0, { ...df, color: INK.green });
    const w1 = measure(ctx, '+12', df).w + 56; txt(ctx, '\u221214,203', w1, 0, { ...df, color: INK.red });
    const w2 = w1 + measure(ctx, '\u221214,203', df).w + 44;
    for (let i = 0; i < 5; i++) ink(ctx, rect(w2 + i * 70, -84, 58, 58), { fill: INK.red, line: 3, smooth: false, boil: .5 });
    ctx.restore();
    prTabs(ctx, X, 650, 1620, { tabs: [['Conversation', 2], ['Commits', 1], ['Checks', 14], ['Files changed', 347]], active: 0, size: 30 });
    // merge box: checks go green on stab 2
    const a2 = age(t, STAB[1]), ok = a2 >= 0, Y = 810;
    uiBox(ctx, X, Y, 1620, 430, { r: 12, shadow: 0 });
    checkDisc(ctx, 262, Y + 90, 54 * slam(a2, [1.5, .9, 1.06]), ok);
    if (ok && a2 < .3) ring(ctx, 262, Y + 90, 60 + a2 * 1100, 12 * (1 - a2 / .3), INK.green);
    txt(ctx, ok ? 'All checks have passed' : 'Some checks haven\u2019t completed yet', 350, Y + 108, { font: 'ui', weight: 800, size: 68 });
    txt(ctx, ok ? '14 successful checks' : '3 in progress', 350, Y + 162, { font: 'ui', weight: 500, size: 34, color: GREY });
    inkLine(ctx, [[X, Y + 200], [X + 1620, Y + 200]], 3, '#D8D2C4', { taper: [0, 0], smooth: false });
    checkDisc(ctx, 262, Y + 250, 30, true);
    txt(ctx, 'This branch has no conflicts with the base branch', 350, Y + 262, { font: 'ui', weight: 600, size: 32 });
    inkLine(ctx, [[X, Y + 298], [X + 1620, Y + 298]], 3, '#D8D2C4', { taper: [0, 0], smooth: false });
    button(ctx, 350, Y + 325, 470, 84, 'Merge pull request', { fill: INK.green, size: 34 });
  }

  // status page: the title flips on stab 4, then one row per frame (split-flap)
  function statusWin(ctx, t) {
    const x = 2050, y = 190, w = 880, names = ['API', 'Web', 'Database', 'Auth', 'Code review'];
    const down = names.map(n => [n, 'down']), up = names.map((n, i) => [n, i === 4 ? 'degraded' : 'ok']);
    statusPage(ctx, x, y, w, t, { rows: down });
    const a = age(t, STAB[3]); if (a < 0) return;
    const n = Math.floor(a * 24), hb = n >= 5 ? 1e4 : 130 + n * 74;
    ctx.save(); clipPts(ctx, rect(x - 30, y - 30, w + 60, hb + 30), false); statusPage(ctx, x, y, w, t, { rows: up }); ctx.restore();
    if (n < 5) { ctx.save(); ctx.globalAlpha = .55; fillPts(ctx, rect(x + 4, y + (n ? 130 + (n - 1) * 74 : 4), w - 8, n ? 74 : 126), INK.white, false); ctx.restore(); }
  }

  const MCAM = [[770, 385, 1.25, -.012], [700, 1030, 1.7, .01], [600, 240, 2.0, -.018], [2490, 440, 1.85, .012]];
  function montage(ctx, t) {
    let i = 0; while (i < 3 && age(t, STAB[i + 1]) >= 0) i++;
    const a = Math.max(0, age(t, STAB[i])), [cx, cy, z, r] = MCAM[i], p = Math.exp(-a * 12);
    const zoom = z * (1 + .14 * p + .03 * (i === 3 ? kick(t, FILL, 10) : 0)) * (1 + .035 * a), [dx, dy] = drift(t, 8, .5);
    nightField(ctx, cx, cy, zoom);
    cam(ctx, cx + dx, cy + dy, zoom, r * (1 + 2 * p));
    revertPR(ctx, t); statusWin(ctx, t);
    ctx.restore();
    snapSmear(ctx, a, i ? MCAM[i - 1] : [cx - 1500, cy], [cx, cy]);
    misregFrame(ctx, 14 * p, i * .9);
  }
  function snapSmear(ctx, a, from, to) {
    if (a >= .09) return; const d = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    ctx.save(); ctx.globalAlpha = 1 - a / .09; streaks(ctx, [0, 0, W, H], { dir: [(to[0] - from[0]) / d, (to[1] - from[1]) / d], n: 30, len: 600, w: 6, color: rgba(INK.white, .45) }); ctx.restore();
  }

  // ---------- the reaction: the rabbit's comment, finally acknowledged ----------
  const CX = 200, CY = 280, CW = 900, RY = CY + 264, RBX = CX + 84;
  function pawPrint(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = .85;
    fillPts(ctx, blob(0, 22, 44, 3, .08, 16, 36), INK.red);
    for (let i = 0; i < 4; i++) fillPts(ctx, ell(-51 + i * 34, -30 - (i === 1 || i === 2 ? 16 : 0), 14, 19, 12, (i - 1.5) * .25), INK.red);
    dotsIn(ctx, [-70, -70, 70, 70], { spacing: 9, color: INK.white, k: (a, b) => clamp(.1 + noise2(a * .05 + 3, b * .05) * .5) });
    ctx.restore();
  }
  function addReaction(ctx, x, y, hov) {
    ink(ctx, rrect(x, y - 30, 80, 60, 30), { fill: hov ? '#E4DED0' : '#EFEAE0', line: 3, smooth: false, boil: .4 });
    outline(ctx, ell(x + 32, y, 15, 15, 16), 3.5, INK.ink);
    fillPts(ctx, ell(x + 27, y - 4, 2.5, 3, 6), INK.ink); fillPts(ctx, ell(x + 37, y - 4, 2.5, 3, 6), INK.ink);
    inkLine(ctx, [[x + 24, y + 5], [x + 32, y + 10], [x + 40, y + 5]], 3, INK.ink, { taper: [0, 0] });
    inkLine(ctx, [[x + 56, y - 12], [x + 66, y - 12]], 3.5, INK.ink, { taper: [0, 0], smooth: false }); inkLine(ctx, [[x + 61, y - 17], [x + 61, y - 7]], 3.5, INK.ink, { taper: [0, 0], smooth: false });
  }
  function eyesChip(ctx, x, y, a) {
    const f = { font: 'ui', weight: 700, size: 40 }, s = '\uD83D\uDC40 1', w = measure(ctx, s, f).w + 44, k = slam(a, [1.4, .9, 1.05]);
    ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(k, k);
    ink(ctx, rrect(-w / 2, -30, w, 60, 30), { fill: '#FFE3EE', line: 3.5, lineColor: INK.pink, smooth: false, boil: .4 });
    txt(ctx, s, 0, 14, { ...f, align: 'center' });
    ctx.restore();
  }
  function thread(ctx, t, hov) {
    commentCard(ctx, CX, CY, CW, t, { author: 'coderabbitai', time: '10 hours ago', chip: 'critical', body: ['Unsanitized input on line 9012', '\u2192 SQL injection. Sanitize this input.', '', '', ''], buttons: false, size: 34 });
    pawPrint(ctx, CX + CW - 60, CY + 70, .9, .4);
    addReaction(ctx, RBX, RY, hov);
    const ac = age(t, T_CLICK); if (ac >= 0) eyesChip(ctx, RBX + 96, RY, ac);
    commentCard(ctx, CX, CY + 350, CW, t, { author: 'coderabbitai', time: 'just now', body: ['As mentioned above.'], buttons: false, size: 34 });
  }
  function react(ctx, t) {
    const a = Math.max(0, age(t, T_CMT)), p = Math.exp(-a * 12), k = easeInOut(clamp(a / 1.55));
    const zoom = lerp(1.9, 2.5, k) * (1 + .07 * p + .025 * kick(t, [T_CLICK], 8) + .012 * kick(t, [F(2979), F(2984)], 10));
    const cx = lerp(660, 510, k), cy = lerp(480, 470, k);
    nightField(ctx, cx, cy, zoom);
    cam(ctx, cx, cy, zoom, lerp(.012, -.004, k));
    const P = kf(t, [[T_CMT, [820, 830]], [124.42, [430, 620]], [124.64, [RBX + 40, RY + 6]], [125.05, [RBX + 40, RY + 6]], [125.45, [RBX + 660, RY + 40]]], easeInOut);
    thread(ctx, t, t > 124.5 && t < 125.1);
    const cl = seg(t, T_CLICK - .002, T_CLICK + .3);
    cursor(ctx, P[0], P[1], 64, { click: cl > 0 && cl < 1 ? cl : 0, tremble: t > 124.5 && t < T_CLICK - .01 ? 1.5 : 0 });
    ctx.restore();
    snapSmear(ctx, a, MCAM[3], [cx + 2400, cy + 1400]);
    misregFrame(ctx, 10 * p);
  }

  // ---------- the ending fairy ----------
  const RX = 1040, RS = 110, RHY = 530, RY0 = RHY + 7.6 * RS;
  const HOLD = { bags: 1, mouth: 'flat', armR: { a: 25, e: 200 }, armL: { a: 12, e: 25 } };
  // the burrow at night, frozen (its roots sway with t) and pushed back into shadow
  function fairyBg(ctx) {
    cam(ctx, 660, 330, 1.75);
    dep(ctx, 12, c => burrow(c, 125.45, { mood: 'night', pinsFocus: true, fg: false, glow: .8 }));
    ctx.restore();
    fillPts(ctx, rect(0, 0, W, H), rgba(INK.night, .5), false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 18, color: rgba(INK.night, .9), k: () => .55 });
  }
  function mug(ctx, [px, py], s) {
    const x = px - 1.55 * s, y = py - .95 * s, w = 1.5 * s, h = 1.75 * s;
    inkLine(ctx, [[x + .05 * s, y + .4 * s], [x - .45 * s, y + .5 * s], [x - .45 * s, y + 1.15 * s], [x + .05 * s, y + 1.3 * s]], .2 * s, INK.ink, { taper: [0, 0] });
    ink(ctx, rrect(x, y, w, h, .28 * s), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 12, dir: [.7, .7], from: -.1 * s, to: 1.1 * s }, line: 5, boil: 1, smooth: false });
    fillPts(ctx, ell(x + w / 2, y + .06 * s, w * .44, .13 * s, 18), '#3A1C14');
    // carrot print
    ink(ctx, [[x + w * .5, y + h * .82], [x + w * .32, y + h * .38], [x + w * .68, y + h * .38]], { fill: INK.paper, line: 3, boil: .6, smooth: false });
    for (const d of [-1, 0, 1]) inkLine(ctx, [[x + w * .5, y + h * .38], [x + w * (.5 + d * .1), y + h * .24]], 4, INK.ink, { taper: [0, .4] });
    // the paw wraps the mug's right side
    ink(ctx, ell(px, py, .52 * s, .48 * s, 16), { fill: INK.fur, shade: { color: INK.furShade, spacing: 8, dir: [.5, .85], from: -.1 * s, to: .6 * s }, line: 3.6, boil: 1 });
    for (const k of [-.18, .1]) inkLine(ctx, [[px - .45 * s, py + k * s], [px - .1 * s, py + (k + .04) * s]], 2.4, INK.ink, { taper: [.2, .5] });
  }
  // The rabbit, lit from the front by the monitor (the camera is the screen): a cool cast, face bright, body falling off into night.
  function litRabbit(ctx, x, y, s, pose, M, glint) {
    const c = pushLayer(); if (M) c.setTransform(M);
    const A = rabbit(c, x, y, s, pose); mug(c, A.pawR, s);
    if (glint) for (const e of [A.eyeL, A.eyeR]) fillPts(c, rrect(e[0] + .1 * s, e[1] + .22 * s, .2 * s, .13 * s, 3), rgba(INK.cyan, .9), false);
    const hp = (M || new DOMMatrix()).transformPoint(new DOMPoint(...A.head));
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
    fillPts(c, rect(0, 0, W, H), rgba(INK.cyan, .08), false);
    dotsIn(c, [0, 0, W, H], { spacing: 15, color: rgba(INK.night, .85), k: (px, py) => clamp((Math.hypot(px - hp.x, (py - hp.y) * .75) - 2.8 * s) / (4.5 * s)) });
    c.globalCompositeOperation = 'source-over';
    // cyan rim on the monitor side: the silhouette printed in cyan, offset under the figure
    const rim = pushLayer(); rim.drawImage(c.canvas, 0, 0); rim.globalCompositeOperation = 'source-in'; fillPts(rim, rect(0, 0, W, H), INK.cyan, false); popLayer(); popLayer();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(rim.canvas, 9, -5); ctx.drawImage(c.canvas, 0, 0); ctx.restore();
    return A;
  }
  // "As mentioned above." as a GitHub comment, word by word, with a speech tail up to the rabbit
  function saidCard(ctx, t) {
    const n = WORDS.filter(w => t >= w - .002).length; if (!n) return;
    const bf = { font: 'ui', weight: 700, size: 64 }, hf = { font: 'ui', weight: 800, size: 32 };
    const w = measure(ctx, 'As mentioned above.', bf).w + 110, h = 180, x = 110, y = 846, tl = [[x + w - 170, y + 2], [x + w - 70, y - 56], [x + w - 112, y + 2]];
    uiBox(ctx, x, y, w, h, { r: 14, shadow: 10 });
    fillPts(ctx, tl.map(([a, b]) => [a, b + 2]), INK.white, false);
    inkLine(ctx, tl, 4, INK.ink, { taper: [0, 0], smooth: false });
    avatar(ctx, x + 72, y + 52, 24, 'rabbit');
    txt(ctx, 'coderabbitai', x + 110, y + 64, hf);
    txt(ctx, 'just now', x + 124 + measure(ctx, 'coderabbitai', hf).w, y + 64, { ...hf, weight: 500, color: GREY });
    txt(ctx, ['As', 'mentioned', 'above.'].slice(0, n).join(' '), x + 56, y + 148, bf);
  }
  function fairy(ctx, t) {
    BOIL = 0;
    fairyBg(ctx);
    litRabbit(ctx, RX, RY0, RS, { ...HOLD, lids: Math.max(.5, blink(twos(t), [126.2], .2)), earL: { a: -8, b: 0 }, earR: { a: 40, b: 80 } }, null, true);
    saidCard(ctx, t);
  }

  // ---------- the button: PING, the next PR ----------
  // toast() from props.js with the title condensed to fit: the shared one runs off the card for titles this long.
  function toastFit(ctx, cx, cy, s, o) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot); ctx.scale(s, s);
    uiBox(ctx, -500, -150, 1000, 300, { r: 26, shadow: 18, fill: INK.white, line: 6 });
    ink(ctx, rrect(-460, -110, 150, 150, 30), { fill: INK.orange, line: 5, boil: .5, smooth: false });
    avatar(ctx, -385, -35, 58, 'rabbit', INK.orange);
    txt(ctx, '\uD83D\uDD14 Review requested', -280, -62, { font: 'ui', weight: 700, size: 38, color: GREY });
    const title = `${o.title} #${o.num}`, tf = { font: 'ui', weight: 900, size: 70, color: INK.ink };
    for (tf.stretch = 0; tf.stretch > -4 && measure(ctx, title, tf).w > 740; tf.stretch--);
    txt(ctx, title, -280, 12, tf);
    const df = { font: 'mono', weight: 800, size: 58 };
    txt(ctx, `+${o.add}`, -280, 100, { ...df, color: INK.green });
    txt(ctx, `\u2212${o.del}`, -280 + measure(ctx, `+${o.add}`, df).w + 34, 100, { ...df, color: INK.red });
    ink(ctx, ell(470, -140, 62, 62, 24), { fill: INK.red, line: 6, boil: .6 }); txt(ctx, String(o.badge), 470, -118, { font: 'ui', weight: 900, size: 70, color: INK.white, align: 'center' });
    ctx.restore();
  }
  function btn(ctx, t) {
    const a = Math.max(0, age(t, T_BTN)), p = Math.exp(-a * 9), n = Math.floor(a * 12);   // n: pose index on twos
    fillPts(ctx, rect(0, 0, W, H), INK.night, false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.nightLt, dir: [0, 1], from: 0, to: H, min: .2, max: .7 });
    const [sx, sy] = shake(t, 14 * p), z = 1 + .06 * p + .012 * a;
    const M = new DOMMatrix().translate(W / 2 + sx, H / 2 + sy).scale(z).translate(-W / 2, -H / 2);
    const osc = Math.cos(n * 2) * Math.exp(-n * .5), len = 1 + .22 * Math.exp(-n * .6);   // damped ear wobble, stretch
    const pose = { ...HOLD, lids: 0, eyes: 'dot', brows: .5, sq: -.28 * osc, hop: [1.25, 1.05, .9][n] ?? .85, earL: { a: -3 + 3 * osc, b: 5 * osc, len }, earR: { a: 3 - 12 * osc, b: -18 * osc, len } };
    const A = litRabbit(ctx, RX, RY0, RS, pose, M);
    ctx.save(); ctx.setTransform(M);
    // the right ear's swing from flat to up, as speed arcs round its root
    if (n < 2) { const bx = A.head[0] + .95 * RS, by = A.head[1] - 1.62 * RS; ctx.globalAlpha = n ? .45 : .9;
      for (const r of [3.2, 4.1, 5]) { const pts = []; for (let k = 0; k <= 12; k++) { const th = (lerp(78, 8, k / 12) - 90) * Math.PI / 180; pts.push([bx + Math.cos(th) * r * RS, by + Math.sin(th) * r * RS]); } inkLine(ctx, pts, 9, INK.white, { taper: [.6, .1] }); }
      ctx.globalAlpha = 1; }
    const ts = 1.1 * slam(a, [1.2, 1.06, .98, 1.01]), tx = RX - 20, ty = 872 + (a < .09 ? 70 * (1 - a / .09) : 0), rot = -.07;
    const bx = tx + ts * (470 * Math.cos(rot) + 140 * Math.sin(rot)), by = ty + ts * (470 * Math.sin(rot) - 140 * Math.cos(rot));
    for (const r0 of [0, .3]) { const ra = a - r0; if (ra >= 0 && ra < .6) ring(ctx, bx, by, 70 + easeOut(ra / .6) * 1300, 16 * (1 - ra / .6), INK.cyan); }
    toastFit(ctx, tx, ty, ts, { title: 'Small fix (again)', num: 4814, add: '28,406', del: '3', badge: 1, rot });
    ctx.restore();
    misregFrame(ctx, 16 * p, .4);
  }

  // ---------- the title card ----------
  function card(ctx, t) {
    evaCard(ctx, t, [
      { s: 'CODERABBIT,', x: 120, y: 330, size: 215, sx: .66 },
      { s: 'PAUSE', x: 110, y: 930, size: 640, sx: .56 },
      { s: '\u30B3\u30FC\u30C9\u30E9\u30D3\u30C3\u30C8\u3001', x: 1800, y: 250, size: 116, font: 'jp', align: 'right', sx: .8 },
      { s: '\u4E00\u6642\u505C\u6B62', x: 1800, y: 400, size: 116, font: 'jp', align: 'right', sx: .8 },
      { s: 'EPISODE: 4814', x: 1800, y: 930, size: 130, align: 'right' },
    ], { bg: INK.ink });
  }

  chapter('outro', 122.25, 128.64, [[122.25, montage], [123.9, react], [125.45, fairy], [126.7, btn], [127.65, card]]);
})();
