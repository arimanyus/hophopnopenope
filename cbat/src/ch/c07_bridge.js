// c07_bridge.js: the bridge, 105.90 - 121.85. Office 4:59 PM, look .3 -> .8, red.
// "Call me" vignettes (a riso zine page in Dan's head) -> the desk at 4:59 -> three requests stacking up, each answered by a
// TYPE IT keyboard slam -> Greg's forehead riding the kick build.
(() => {
  const L_EMO = wordT(57, 3), L_FIRE = wordT(58, 4), L_HALF = wordT(59, 3), L_OKAY = wordT(60, 1), L_CALL = wordT(60, 2);
  const REQ = [61, 63, 65].map(li => LINES[li].words[0].a);          // the three requests
  const SLAM = [62, 64, 66].map(li => [wordT(li, 0), wordT(li, 1)]);  // TYPE / IT
  const FORE = wordT(67, 6), FOREEND = 121.89;   // the hero cuts out after 121.80, before c08's first frame
  const CLOCK = t => clockSecs(16, 59, 2) + (t - 105.9);
  const tc_ = t => twos(t);
  // head centre y and head radii (px) of a rig drawn with ground point y and scale s
  const headAt = (who, y, s) => { const C = CAST[who]; return { y: y - (C.H - C.head.ry) * s, rx: C.head.rx * s, ry: C.head.ry * s }; };

  // ---------- small shapes ----------
  const heart = (x, y, r, rot = 0) => { const p = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; p.push([16 * Math.pow(Math.sin(a), 3) / 16, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); } return xform(p, x, y, r, rot); };
  const flame = (x, y, w, h, seed, t) => { const f = Math.floor(t * 8), n = 7, p = [[x - w / 2, y]];
    for (let i = 1; i < n; i++) { const u = i / n, tip = i % 2 ? 1 : .55, hh = h * tip * (.75 + .5 * hash(seed * 7 + i + f * 3.1)) * Math.sin(u * Math.PI) ** .6; p.push([x - w / 2 + u * w + (hash(seed + i * 5 + f) - .5) * w * .15, y - hh]); }
    p.push([x + w / 2, y]); return p; };
  // panel slam-in: scale + settle, a taped xerox cut-out (props.js)
  function slab(ctx, t, t0, [x, y, w, h], rot, seed, draw) {
    const a = t - t0; if (a < -1 / 24) return;
    const k = backOut(clamp((a + 1 / 24) / .2), 1.7), s = lerp(1.3, 1, k);
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.rotate(rot + (1 - k) * .06); ctx.translate(-w / 2, -h / 2);
    cutout(ctx, 0, 0, w, h, 0, t, c => draw(c, w, h, t, a), { seed, jit: 5 });
    ctx.restore();
  }
  const raysIn = (ctx, w, h, cx, cy, a, b, rot = 0, n = 16) => sunburst(ctx, cx, cy, a, b, rot, n, Math.hypot(w, h) * 1.2);

  // ---------- 105.90 - 110.80: "call me" vignettes, a zine page in Dan's head ----------
  const P1 = [230, 150, 1470, 830], P2 = [200, 120, 1520, 850], P3 = [210, 140, 1500, 840];
  // a phone pressed to the ear, drawn over the gripping hand
  const earPhone = (c, [x, y], s, rot) => { c.save(); c.translate(x, y); c.rotate(rot); ink(c, rrect(-.32 * s, -1.05 * s, .64 * s, 1.3 * s, .12 * s), { fill: INK.ink, line: 3, smooth: false, boil: .5 }); c.restore(); };
  function emotion(c, w, h, t, a) {
    const tc = tc_(t), nod = .14 * kick(tc, 5) - .04, cut = w * .52;
    const left = [[0, 0], [cut + 60, 0], [cut - 60, h], [0, h]], right = [[cut + 60, 0], [w, 0], [w, h], [cut - 60, h]];
    c.save(); clipPts(c, left, false); raysIn(c, w, h, cut * .45, h * .55, INK.paper, mix(INK.paper, INK.red, .35), t * .08);
    dotsIn(c, [0, 0, cut + 60, h], { spacing: 26, color: rgba(INK.red, .55), k: (x, y) => clamp(Math.hypot(x - cut * .45, y - h * .5) / 700 - .25) });
    const D = bustFit([0, 60, cut, h - 60], 'dan', { zoom: 1.7 }), E = headAt('dan', D.y, D.s);
    const A = person(c, D.x, D.y, D.s, 'dan', { view: 'bust', nod, tilt: 7, eyes: 'happy', mouth: 'smile', browTilt: .9, brows: .2, blush: .6, t: tc,
      reachR: [D.x + E.rx * 1.45, E.y + E.ry * .2], handR: 'grip', reachL: [D.x - .3 * D.s, D.y - 5.2 * D.s], handL: 'open' });
    earPhone(c, A.handR, D.s * .6, .25);
    c.restore();
    c.save(); clipPts(c, right, false); raysIn(c, w, h, w * .78, h * .55, INK.pinkLt, INK.pink, -t * .08);
    const B = bustFit([cut - 20, 60, w - cut + 20, h - 60], 'bob', { zoom: 1.6 }), sob = Math.abs(Math.sin(tc * 7)), by = B.y - 8.6 * B.s;
    const Q = person(c, B.x, B.y, B.s, 'bob', { view: 'bust', turn: -.2, tilt: -6 + sob * 3, nod: .05 * sob, eyes: 'closed', mouth: 'frown', open: .3 + .35 * sob, browTilt: 1.4, brows: .3, t: tc,
      reachL: [B.x - .9 * B.s, by + 1.7 * B.s - sob * .1 * B.s], handL: 'fist' });
    ink(c, blob(Q.handL[0] + .2 * B.s, Q.handL[1] - .25 * B.s, .32 * B.s, 7, .35, 12), { fill: INK.white, line: 3, boil: 1.5 });   // the tissue
    for (const [e, sd] of [[Q.eyeL, -1], [Q.eyeR, 1]]) for (let i = 0; i < 3; i++) {   // tears: two streams of drops
      const p = frac(t * 1.6 + i / 3 + (sd > 0 ? .5 : 0)), x = e[0] + sd * (20 + p * 60), y = e[1] + 10 + p * 300 - Math.sin(p * Math.PI) * 60;
      ink(c, xform([[0, -1.5], [.75, 0], [.5, .8], [0, 1], [-.5, .8], [-.75, 0]], x, y, 18 * (1 - p * .3)), { fill: INK.white, line: 3, boil: .5 }); }
    c.restore();
    inkLine(c, [[cut + 60, -10], [cut - 60, h + 10]], 14, INK.ink, { taper: [0, 0] });
    for (let i = 0; i < 4; i++) {   // hearts rise up the gutter, from his phone to Bob's headset
      const p = frac(t * .55 + i / 4), x = cut - 60 * (1 - p) + 60 * p + Math.sin(p * 9 + i) * 30, y = lerp(h * .95, h * .02, p);
      ink(c, heart(x, y, 34 + 20 * Math.sin(p * Math.PI), Math.sin(t * 3 + i) * .25), { fill: i % 2 ? INK.red : INK.pink, line: 4, boil: 1 });
    }
    const pop = t - L_EMO + 1 / 24;   // "emotion": one big heart pops in the gutter
    if (pop > 0 && pop < .7) ink(c, heart(cut, h * .5, 120 * backOut(clamp(pop / .14), 2.4) * (1 - easeIn(seg(pop, .5, .7))), Math.sin(pop * 30) * .08 * (1 - pop)), { fill: INK.red, line: 7, boil: 1 });
  }
  function fire(c, w, h, t, a) {
    const tc = tc_(t), f = hit(t, [L_FIRE], 3), bx = 70, bw = 760, top = 230;
    fillPts(c, rect(0, 0, w, h), INK.paper, false);
    raysIn(c, w, h, bx + bw / 2, top, INK.paper, mix(INK.paper, INK.yellow, .6), t * .1, 20);
    dotsIn(c, [0, 0, w, h], { spacing: 30, color: rgba(INK.red, .75), k: (x, y) => clamp(1 - Math.hypot(x - bx - bw / 2, y - top) / (700 + 350 * f)) * 1.3 });
    // smoke
    for (let i = 0; i < 8; i++) { const p = frac(t * .25 + i / 8); ink(c, blob(bx + bw * (.1 + .12 * i) + p * 320, top - 150 - p * 300, 80 + p * 110, i + 3, .25, 14), { fill: i % 2 ? INK.ink : '#3A3240', line: 0 }); }
    // the tower
    ink(c, rect(bx, top, bw, h - top + 20), { fill: INK.paperDk, shade: { color: INK.ink, spacing: 16, dir: [1, 0], from: bw * .1, to: bw * .7, max: .55 }, line: 6, smooth: false });
    const cols = 5, rows = 5, gw = bw / cols;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const wx = bx + q * gw + 24, wy = top + 70 + r * 112, ww = gw - 48, lit = hash(r * 7 + q * 3) < .6 || r < 2;
      ink(c, rect(wx, wy, ww, 66), { fill: lit ? INK.yellow : INK.nightLt, line: 4, smooth: false, boil: .4 });
      if (lit) { const fh = (100 + 80 * hash(r + q * 9)) * (1 + f * .9); ink(c, flame(wx + ww / 2, wy + 44, gw - 14, fh, r * 9 + q, t), { fill: INK.red, line: 4, boil: 1.5 });
        ink(c, flame(wx + ww / 2, wy + 44, gw - 64, fh * .55, r * 9 + q + 50, t), { fill: INK.yellow, line: 0, boil: 1.5 }); }
    }
    // roof blaze + sign
    ink(c, flame(bx + bw / 2, top + 6, bw * 1.2, 300 * (1 + f), 77, t), { fill: INK.red, line: 6, boil: 2 });
    ink(c, flame(bx + bw / 2, top + 6, bw * .85, 170 * (1 + f), 78, t), { fill: INK.yellow, line: 0, boil: 2 });
    ink(c, rect(bx + 70, top - 74, bw - 140, 68), { fill: INK.ink, line: 4, smooth: false });
    txt(c, 'ALIGNMENT CO.', bx + bw / 2, top - 26, { font: 'ui', weight: 900, size: 46, track: 3, align: 'center', color: INK.paper });
    // Dan out front: calm, phone to his ear, thumbs up
    fillPts(c, rect(0, h - 60, w, 80), INK.ink, false);
    const x = 1170, y = h - 36, s = 58, E = headAt('dan', y, s);
    const A = person(c, x, y, s, 'dan', { turn: -.25, reachR: [x + E.rx * 1.1, E.y + E.ry * .3], handR: 'grip', armL: { a: 70, e: 80 }, handL: 'thumb', mouth: 'polite', eyes: 'happy', brows: .15,
      nod: .05 * kick(tc, 5), tilt: 5, stage: 0, t: tc });
    earPhone(c, A.handR, s * .85, .3);
  }
  const ORG = (() => { const o = [{ x: .5, y: .22, who: 'greg', title: 'CEO' }];
    ['linda', 'bob', 4].forEach((who, i) => o.push({ x: .2 + i * .3, y: .5, who, title: ['HR', 'IT', 'SALES'][i], up: 0 }));
    ['tasha', 'dan', 9, 11].forEach((who, i) => o.push({ x: .12 + i * .25, y: .8, who, title: '', up: [1, 2, 2, 3][i] }));
    return o; })();
  function chart(c, w, h, t) {
    fillPts(c, rect(0, 0, w, h), INK.white, false);
    c.beginPath(); for (let x = 0; x < w; x += 40) { c.moveTo(x, 0); c.lineTo(x, h); } for (let y = 0; y < h; y += 40) { c.moveTo(0, y); c.lineTo(w, y); } c.strokeStyle = rgba(INK.cyan, .25); c.lineWidth = 2; c.stroke();
    txt(c, 'ORG CHART Q4 (FINAL) (v7)', 40, 64, { font: 'ui', weight: 800, size: 30, color: INK.ink });
    for (const n of ORG) if (n.up != null) { const p = ORG[n.up]; inkLine(c, [[p.x * w, p.y * h + 80], [p.x * w, (p.y * h + n.y * h) / 2], [n.x * w, (p.y * h + n.y * h) / 2], [n.x * w, n.y * h - 80]], 7, INK.ink, { taper: [0, 0], smooth: false }); }
    for (const n of ORG) { const x = n.x * w, y = n.y * h;
      ink(c, rrect(x - 110, y - 80, 220, 160, 16), { fill: n.title === 'CEO' ? INK.yellow : INK.paper, line: 6, smooth: false, boil: .6 });
      teamsAvatar(c, x, y - (n.title ? 14 : 0), 52, n.who, { depth: 0 });
      if (n.title) txt(c, n.title, x, y + 66, { font: 'ui', weight: 900, size: 30, align: 'center', color: INK.ink }); }
  }
  function half(c, w, h, t, a) {
    const tc = tc_(t), rip = seg(t, L_HALF - .06, L_HALF + .1), sep = easeOut(seg(t, L_HALF, L_HALF + .55)) + .03 * Math.sin(seg(t, L_HALF, L_HALF + 1.2) * 9) * (1 - seg(t, L_HALF, L_HALF + 1.2));
    raysIn(c, w, h, w / 2, h * .6, INK.red, INK.redDk, t * .1, 18);
    const D = bustFit([w / 2 - 330, 60, 660, h - 60], 'dan', { zoom: 1.6 }), E = headAt('dan', D.y, D.s);
    const A = person(c, D.x, D.y, D.s, 'dan', { view: 'bust', mouth: 'flat', brows: -.1, browTilt: -.2, lids: .25, nod: .1 * kick(tc, 4), t: tc, reachR: [D.x + E.rx * 1.45, E.y + E.ry * .2], handR: 'grip' });
    earPhone(c, A.handR, D.s * .6, .25);
    // the tear: a jagged line down the middle, ripping top to bottom on "half"
    const J = [], n = 22; for (let i = 0; i <= n; i++) J.push([w / 2 + (hash(i * 3.7) - .5) * 60, -20 + (h + 40) * i / n]);
    const yRip = lerp(-20, h + 20, rip), dx = sep * 300, rot = sep * .07;
    for (const sd of [-1, 1]) {
      const poly = sd < 0 ? [[-40, -40], ...J.map(([x, y]) => [y < yRip ? x : w / 2 + 400, y]), [-40, h + 40]] : [[w + 40, -40], ...J.map(([x, y]) => [y < yRip ? x : w / 2 - 400, y]), [w + 40, h + 40]];
      const full = sd < 0 ? [[-40, -40], ...J, [-40, h + 40]] : [[w + 40, -40], ...J, [w + 40, h + 40]];
      c.save(); c.translate(w / 2, h); c.rotate(sd * rot); c.translate(-w / 2 + sd * dx, -h);
      fillPts(c, full.map(([x, y]) => [x + 10, y + 12]), rgba(INK.ink, .85 * clamp(sep * 4)), false);
      c.save(); clipPts(c, rip > 0 ? full : rect(-40, -40, w + 80, h + 80), false); chart(c, w, h, t); c.restore();
      if (rip > 0) inkLine(c, J.filter(([x, y]) => y < yRip + 40), 4, INK.ink, { taper: [0, 0], smooth: false });
      c.restore();
      if (rip <= 0) break;
    }
  }
  function vignettes(ctx, t, lt) {
    look(.7);
    if (t < shownUntil(56)) FRAME.lyrics = false;   // c06's held caption would hang over the cut
    fillPts(ctx, rect(0, 0, W, H), INK.paper, false);
    sunburst(ctx, 960, 560, INK.paper, mix(INK.paper, INK.red, .22), t * .05, 22);
    dotsIn(ctx, [0, 0, W, H], { spacing: 40, color: INK.red, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 540) / 620) - .55) * 2) });
    const sh = shake(t, 4 * kick(t, 10)); ctx.save(); ctx.translate(sh[0], sh[1]);
    slab(ctx, t, 105.9, P1, -.025, 1, emotion);
    slab(ctx, t, LINES[58].a, P2, .02, 2, fire);
    slab(ctx, t, LINES[59].a, P3, -.012, 3, half);
    ctx.restore();
  }

  // ---------- the desk at 4:59 PM ----------
  // the monitor: Start menu open, the pointer resting on "Shut down"
  function startMenu(c, [x, y, w, h], t) {
    fillPts(c, rect(x, y, w, h), '#3C6FB4', false);
    fillPts(c, ell(x + w * .62, y + h * .42, w * .32, h * .5, 32, -.4), '#5C8FD0'); fillPts(c, ell(x + w * .7, y + h * .38, w * .18, h * .3, 28, -.4), '#9CC2EC');
    fillPts(c, rect(x, y + h - 22, w, 22), '#E9ECF1', false);
    [-2, -1, 0, 1, 2].forEach(i => fillPts(c, rrect(x + w / 2 + i * 22 - 7, y + h - 18, 14, 14, 3), ['#0078D4', '#5B5FC7', '#F2C744', '#4A154B', '#0B5CFF'][i + 2], false));
    txt(c, '4:59 PM', x + w - 8, y + h - 7, { font: 'ui', weight: 600, size: 11, align: 'right', color: '#1F1F1F' });
    const m = [x + w * .25, y + h * .12, w * .5, h * .72];
    fillPts(c, rrect(m[0] + 3, m[1] + 4, m[2], m[3], 8), rgba('#000000', .25), false); fillPts(c, rrect(...m, 8), '#F3F3F3', false);
    fillPts(c, rrect(m[0] + 10, m[1] + 10, m[2] - 20, 20, 10), '#FFFFFF', false);
    for (let i = 0; i < 12; i++) fillPts(c, rrect(m[0] + 18 + (i % 6) * 34, m[1] + 44 + Math.floor(i / 6) * 34, 20, 20, 4), ['#0078D4', '#5B5FC7', '#C43E1C', '#13A10E', '#E8A33D', '#4A154B'][i % 6], false);
    const fx = m[0] + m[2] - 104, fy = m[1] + m[3] - 112;
    fillPts(c, rrect(fx, fy, 96, 84, 6), '#FFFFFF', false); outline(c, rrect(fx, fy, 96, 84, 6), 1, '#C8C8C8', { smooth: false });
    ['Sleep', 'Shut down', 'Restart'].forEach((s, i) => { if (i === 1) fillPts(c, rrect(fx + 4, fy + 4 + i * 26, 88, 24, 4), '#E3EAF3', false); txt(c, s, fx + 12, fy + 21 + i * 26, { font: 'ui', weight: i === 1 ? 700 : 500, size: 12, color: '#1F1F1F' }); });
    fillPts(c, rect(m[0], m[1] + m[3] - 26, m[2], 26), '#EBEBEB', false);
    pointer(c, fx + 70, fy + 40, 22, { depth: 0 });
  }
  // keycaps knocked off by the slams, left on the desk "as if nothing happened"
  function damage(ctx, n) {
    if (n < 1) return;
    const caps = [[1012, 716, -.4, 'T'], [1290, 690, .5, 'Y'], [960, 700, .2, 'P'], [1220, 728, -.7, 'E'], [1100, 735, .9, 'I'], [870, 724, -.2, 'T']].slice(0, n * 2 + 2);
    for (const [x, y, r, s] of caps) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ink(ctx, rrect(-11, -9, 22, 18, 4), { fill: '#E4E2DC', line: 1.6, smooth: false, boil: .3 }); txt(ctx, s, 0, 5, { font: 'ui', weight: 800, size: 12, align: 'center', color: '#55535C' }); ctx.restore(); }
    if (n >= 2) inkLine(ctx, [[1090, 698], [1100, 708], [1094, 716], [1106, 726]], 3, '#55535C', { taper: [0, 0], smooth: false });
  }
  const deskK = t => kf(t, [[110.8, .3], [112.48, .3], [117.4, .55]]);
  const RAGE = [.2, .3, .45, .6];   // Dan's rage after 0..3 requests
  function deskShot(ctx, t, lt, n) {
    const k = deskK(t), tc = tc_(t); look(k);
    // a slow push from the wide (clock at 4:59) onto Dan, ending with him screen-left so the toasts stack on the right
    const z = kf(t, [[110.8, 1.3], [112.48, 1.6], [117.47, 1.75]], n ? x => x : easeInOut), thump = n >= 2 ? (n - 1) * 3 * kick(t, 12) : 0;   // the band's kick starts to bleed in
    const u = seg(t, 110.8, 112.48), cx = lerp(960, 700 + 470 / z, n ? 1 : easeInOut(u)), cy = lerp(520, 570, n ? 1 : easeInOut(u));
    cam(ctx, cx, cy - thump, z * (1 + thump * .002));
    officeDesk(ctx, t, { k, clock: CLOCK(t), screen: startMenu, flicker: 1 });
    damage(ctx, n ? n - 1 : 0);
    // Dan: seated at the keyboard, polite; the body leaks what the face hides
    const r = RAGE[n], tw = twitchAt(tc, r > .15 ? 1 : 0), bl = blink(tc, 9);
    let pose = { sit: 1, turn: .45, hunch: .45, mouth: 'polite', glare: .7, lids: Math.max(bl, .1), rage: r, t: tc, reachL: [1062, 706], reachR: [1188, 706], handL: 'type', handR: 'type' };
    if (n === 0) {   // "Yeah, okay, call me": anticipation dip, shrug up on "okay" with overshoot, settle, then the sigh on "call me"
      const up = kf(tc, [[L_OKAY - .2, 0], [L_OKAY - .06, -.2], [L_OKAY + .1, 1.12], [L_OKAY + .28, 1], [L_CALL + .05, 1], [L_CALL + .3, .1]], easeInOut);
      pose = { ...pose, turn: .15, reachL: undefined, reachR: undefined, armL: { a: lerp(14, 40, up), e: lerp(25, 100, up) }, armR: { a: lerp(14, 40, up), e: lerp(25, 100, up) }, handL: up > .5 ? 'open' : 'relax', handR: up > .5 ? 'open' : 'relax',
        brows: .35 * up, browTilt: .5 * up, mouth: up > .5 ? 'flat' : 'polite', tilt: 7 * up, nod: -.1 * up + .12 * seg(tc, L_CALL + .05, L_CALL + .3), glare: .25 + .5 * (1 - up), hunch: .45 - .15 * up + .2 * seg(tc, L_CALL + .05, L_CALL + .3) };
    } else {         // a request lands: eyes slide to the toast, the twitch, the tuft
      const look_ = smooth(seg(tc, REQ[n - 1] + .1, REQ[n - 1] + .35));
      pose = { ...pose, lx: .9 * look_, ly: -.1, glare: .7 * (1 - look_) + .1, twitch: tw, wild: lerp(.15, .5, (n - 1) / 2), tilt: -2 * look_ };
    }
    person(ctx, ...DESK.dan, 'dan', pose);
    officeDesk(ctx, t, { k, fg: true });
    ctx.restore();
    if (n) toasts(ctx, t, n);
  }
  // Windows stacks notifications from the bottom up: the newest at the bottom, the older ones pushed up.
  const TW = 880, TX = 984, TB = 1000, TGAP = 22;
  const toastH = i => [124 * TW / 360, 128 * TW / 364, (214 + 2 * 36) * TW / 480][i];
  function toasts(ctx, t, n) {
    look(deskK(t) * .6);
    for (let i = 0; i < n; i++) {
      let yb = TB; for (let j = i + 1; j < n; j++) yb -= (toastH(j) + TGAP) * easeOut(seg(t, REQ[j], REQ[j] + .25));
      const y = yb - toastH(i), t0 = REQ[i] - 1 / 24;
      if (i === 0) teamsToast(ctx, TX, y, TW, t, { kind: 'call', who: 'greg', text: 'Incoming video call', t0, photo: true, depth: 0 });
      if (i === 1) slackNotif(ctx, TX, y, TW, t, { who: 'greg', channel: 'quick-sync', text: 'can you send that over? \uD83C\uDFA7 hopping on a huddle', t0, depth: 0 });
      if (i === 2) outlookInvite(ctx, TX, y, TW, t, { title: 'Any update on this? \uD83D\uDE42', when: 'Today 4:59 PM \u2013 5:59 PM', dur: '1 hr', attendees: ['greg', 'dan'], t0, depth: 0 });
    }
  }
  const shrug = (ctx, t, lt) => deskShot(ctx, t, lt, 0);
  const req = i => (ctx, t, lt) => deskShot(ctx, t, lt, i + 1);

  // ---------- TYPE IT: three keyboard slams, each bigger ----------
  const KEYS = ['T', 'Y', 'P', 'E', 'I', 'T'];
  function keycap(ctx, x, y, s, ch, down, hot) {
    const d = down * s * .16, top = rrect(x - s / 2, y - s / 2 + d, s, s * .86, s * .14);
    ink(ctx, [[x - s * .56, y - s * .34 + d * .5], [x + s * .56, y - s * .34 + d * .5], [x + s * .62, y + s * .62], [x - s * .62, y + s * .62]], { fill: hot ? INK.redDk : INK.ink, line: 6, smooth: false, boil: 1 });
    ink(ctx, top, { fill: hot ? INK.red : INK.paper, shade: { color: hot ? INK.redDk : INK.paperDk, spacing: 18, dir: [.4, .9], from: 0, to: s * .6, max: .8 }, line: 7, smooth: false, boil: 1 });
    txt(ctx, ch, x, y - s * .06 + d, { font: 'ui', weight: 900, size: s * .52, align: 'center', base: 'middle', color: hot ? INK.paper : INK.ink });
  }
  function slam(i) {
    return (ctx, t, lt, dur) => {
      look(1); const tc = tc_(t), [tT, tI] = SLAM[i], imp = hit(t, [tT, tI], 9), big = [1, 1.12, 1.26][i];
      const tilt = [-.03, .08, -.12][i] * (1 - .3 * lt / dur), sh = shake(t, (14 + 14 * i) * imp + 4);
      // field: red on red, then red on ink, then ink on red
      const [ra, rb] = [[INK.red, INK.redDk], [INK.redDk, INK.ink], [INK.ink, INK.red]][i];
      sunburst(ctx, 960, 560, ra, rb, t * .3 + i, [18, 14, 10][i]);
      dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 600) / 600) - .5) * 1.8) });
      cam(ctx, 960 - sh[0], 560 - sh[1], big * lerp(1.08, 1, easeOut(clamp(lt / .2))), tilt);
      speedLines(ctx, 960, 420, { n: 70, r0: 460, r1: 1900, w: 14, color: rgba(INK.paper, .9) });
      // flying keycaps behind him
      if (i >= 1) for (let j = 0; j < 7 * i; j++) { const p = clamp((t - tT) / .45), a = -Math.PI * (.08 + .84 * hash(j * 3.3 + i)), r = 380 + p * (500 + hash(j) * 500);
        ctx.save(); ctx.translate(960 + Math.cos(a) * r, 760 + Math.sin(a) * r * .8 + p * p * 260); ctx.rotate(p * 6 * (hash(j * 7) - .5)); keycap(ctx, 0, 0, 80 + hash(j * 5) * 50, 'QWERASDFZX'[j % 10], 0, j % 3 === 0); ctx.restore(); }
      // the keys: TYPE on the first word, IT on the second
      const rage = [.8, .92, 1][i], s = 230, ky = 860, ds = [100, 116, 132][i];
      const row = KEYS.map((ch, j) => [960 + (j - 2.5) * (s + 20) + (j > 3 ? 36 : -36), ky]);
      if (i === 2) inkLine(ctx, [[960, 640], [925, 720], [990, 800], [935, 880], [995, 960], [945, 1090]], 18, INK.ink, { taper: [0, 0], smooth: false });
      KEYS.forEach((ch, j) => { const at = j < 4 ? tT : tI, on = t >= at - 1 / 24, dn = on ? 1 - .25 * Math.exp(-(t - at) * 18) : 0;
        const [x, y] = row[j], sd = j < 3 ? -1 : 1, fly = i === 2 && on ? easeOut(clamp((t - at) / .3)) : 0;
        ctx.save(); ctx.translate(x + sd * fly * 50, y - fly * 40); ctx.rotate(sd * (fly * .12 + (i === 1 && on ? .03 : 0))); keycap(ctx, 0, 0, s, ch, dn, on); ctx.restore(); });
      // Dan behind the keyboard: fists land on P and E for TYPE, rebound up, and land on P and I for IT.
      // He is clipped to above the key row, plus a window round each fist so the fists come down on top of the caps.
      const lift = Math.sin(Math.PI * seg(t, tT + .04, tI - 1 / 24)) * 110 + (t > tI ? 40 * (1 - Math.exp(-(t - tI) * 10)) : 0), fistY = ky - s * .3 - lift;
      const fL = [800, fistY], fR = [lerp(1050, 1370, smooth(seg(t, tT + .04, tI - 1 / 24))), fistY], fr = ds * 1.1;
      ctx.save(); ctx.beginPath(); ctx.rect(-2000, -2000, 6000, 2000 + ky - s * .44);
      for (const [x, y] of [fL, fR]) { ctx.moveTo(x + fr, y - fr * .3); ctx.arc(x, y - fr * .3, fr, 0, TAU); } ctx.clip();
      const F = headFit(960, 400 + 30 * imp - lift * .3, ds * 3.15, 'dan');
      person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage, wild: 1, stage: 1, nod: .22 * imp - lift / 1400, tilt: (i % 2 ? 8 : -8),
        reachL: fL, reachR: fR, handL: 'fist', handR: 'fist', spit: rage, sweat: 1, t: tc });
      ctx.restore();
      if (imp > .3) for (const [x, y] of [fL, fR]) krackle(ctx, x, y, 110 + 90 * imp, { n: 14, size: 14 });
      ctx.restore();
      if (lt < 1e-4) flash(ctx, i === 2 ? INK.white : INK.paper, .55);
      misregFrame(ctx, 6 + 8 * imp + 4 * i, .3);
    };
  }

  // ---------- 117.82 - 121.85: "Why am I looking at your forehead?!" ----------
  function call(ctx, t, lt) {
    const k = kf(t, [[117.82, .5], [FORE, .62]]), tc = tc_(t); look(k);
    const u = easeIn(seg(t, 117.82, FORE)), z = lerp(1, 1.22, u);
    cam(ctx, lerp(960, 960 - (W / 2) * (1 - 1 / z), u), lerp(540, 540 - (H / 2) * (1 - 1 / z) * .6, u), z);
    const lean = easeInOut(seg(t, 117.9, FORE)), talk = .25 + .35 * Math.abs(Math.sin(tc * 6.5));
    teamsCall(ctx, [0, 0, W, H], t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: clockSecs(1, 58, 30) + (t - 117.82) * 37, participants: 112, layout: 'speaker', zoom: 1.5, depth: 0,
      tiles: [{ who: 'greg', speaking: true, cam: 'forehead', camK: lerp(.15, .62, lean), pose: { mouth: 'talk', open: talk, nod: -.1 * lean } },
        { who: 'dan', muted: true, pose: { rage: .6, glare: .6, twitch: twitchAt(tc), wild: .6 } }, { who: 'linda', muted: true, bg: 'ceiling' }, { who: 'tasha', camOff: true, muted: true }, { who: 'bob', frozen: 117.9, muted: true }] });
    ctx.restore();
  }
  const INS = [[119.72, 2, .82], [120.53, 3, .9], [121.45, 4, .97]];   // Dan rage inserts on the snares: start, frames, rage
  function forehead(ctx, t, lt) {
    const tc = tc_(t), ins = INS.find(([a, n]) => t >= a - 1 / 24 - 1e-6 && t < a - 1 / 24 + n / 24 - 1e-6);
    if (ins) return rageInsert(ctx, t, ins[2]);
    const k = kf(t, [[FORE, .65], [121.8, .85]]); look(k);
    const kk = lerp(.7, 1, easeOut(seg(t, FORE, FORE + .25))), u = seg(t, FORE, 121.8);
    // four on the floor: a punch-in on every beat of the build, on top of a slow creep toward the shine
    let steps = 0; for (let b = beatN(FORE) + 1; beatTime(b) < 121.6; b++) steps += easeOut(seg(t, beatTime(b) - VLEAD, beatTime(b) - VLEAD + .1));
    // pan across the brows like a mountain range, then tilt up into the shine
    const zoom = lerp(1.12, 1.2, u) * Math.pow(1.06, steps), sh = shake(t, 2 + 9 * kick(t, 6) * u), skin = mix('#C99377', '#B95A45', STYLE.k);
    const hx = W / 2 / zoom, hy = H / 2 / zoom, [ux, uy] = kf(t, [[FORE, [0, 1]], [120.8, [1, 1]], [121.5, [.35, 0]]], easeInOut);   // 0..1 across the free range
    cam(ctx, lerp(hx, W - hx, ux) + sh[0], lerp(hy, H - hy, uy) + sh[1], zoom, .04 * Math.sin(u * 3.2));
    foreheadCam(ctx, [0, 0, W, H], t, 'greg', { mouth: 'grin', brows: .35 }, { k: kk });
    dotsIn(ctx, [0, 0, W, H * .8], { spacing: 30, color: rgba(skin, .28), k: (x, y) => .15 + .3 * noise2(x * .012, y * .012) });   // pores
    const glint = kick(t, 7);
    ink(ctx, star(560, 210, 70 + 150 * glint, .12, 4, 0), { fill: INK.white, line: 0, boil: 0, smooth: false });
    ink(ctx, star(1010, 330, 30 + 70 * kick(t, 9), .14, 4, .4), { fill: INK.white, line: 0, boil: 0, smooth: false });
    ctx.restore();
    // Dan's rage printing up from the bottom edge, red halftone
    dotsIn(ctx, [0, H * .6, W, H], { spacing: 36, color: INK.red, k: (x, y) => clamp((y / H - .97 + .2 * u) * 4 + .25 * kick(t, 5)) });
    // the shine floods the frame on the build peak, the ring light still reflected in it
    const fl = easeOut(seg(t, 121.45 - VLEAD, 121.8));
    if (fl > 0) { fillPts(ctx, ell(760, 420, 250 + fl * 650, 140 + fl * 380, 40, -.08), INK.white);
      outline(ctx, ell(900, 560, 200 + fl * 150, 60 + fl * 40, 32, -.08), 14, mix('#E8D9C6', INK.paperDk, STYLE.k)); }
    // still a Teams tile: the speaking ring and the name label
    const z2 = 2.2; ctx.save(); ctx.lineWidth = 14; ctx.strokeStyle = mix('#7F85F5', INK.teams, k); ctx.strokeRect(7, 7, W - 14, H - 14); ctx.restore();
    teamsLabel(ctx, 40, H - 40, 'Greg Hollis (He/Him)', z2, k);
  }
  function teamsLabel(ctx, x, y, s, z, k) {
    setFont(ctx, { font: 'ui', size: 14 * z, weight: 600 }); const w = ctx.measureText(s).width + 20 * z;
    fillPts(ctx, rrect(x, y - 28 * z, w, 26 * z, 4 * z), rgba(mix('#141414', INK.ink, k), .82), false);
    txt(ctx, s, x + 10 * z, y - 15 * z, { font: 'ui', size: 14 * z, weight: 600, base: 'middle', color: INK.white });
  }
  function rageInsert(ctx, t, r) {
    look(1); const tc = tc_(t), sh = shake(t, 12);
    sunburst(ctx, 960, 560, INK.red, INK.redDk, t * 2, 16);
    ctx.save(); ctx.translate(sh[0], sh[1]);
    const F = headFit(960, 710, 600, 'dan');
    person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage: r, wild: 1, stage: 1, tilt: -6, nod: -.1, t: tc });
    ctx.restore(); misregFrame(ctx, 10, .4);
  }

  chapter('bridge', 105.90, 121.85, [
    [105.90, vignettes], [110.80, shrug],
    [REQ[0], req(0)], [SLAM[0][0], slam(0)], [REQ[1], req(1)], [SLAM[1][0], slam(1)], [REQ[2], req(2)], [SLAM[2][0], slam(2)],
    [117.82, call], [FORE, forehead],
  ]);
  const capAt = (x, y, rot, hot) => ({ mode: 'caption', x, y, w: 820, rot, hot });
  const lc = { mode: 'livecap', x: 80, y: 1010, w: 860, size: 52, hold: 0 };
  Object.assign(LYRICS, {
    57: capAt(150, 70, -.025, [3]), 58: capAt(1010, 64, .02, [4]), 59: capAt(140, 70, -.015, [3]),
    60: { ...lc, speaker: 'dan', hold: .3 },
    61: { ...lc, speaker: 'greg' }, 63: { ...lc, speaker: 'greg' }, 65: { ...lc, speaker: 'greg' },
    62: { mode: 'none' }, 64: { mode: 'none' }, 66: { mode: 'none' },
    67: [{ mode: 'livecap', speaker: 'dan', x: 380, y: 1026, w: 1160, size: 60, until: FORE - 1 / 24 },
      { mode: 'hero', after: FORE - 1 / 24, end: FOREEND, out: 'cut', words: [6], box: [140, 120, 1640, 420], align: 'center', color: INK.paper, hot: INK.red, emph: [6], tilt: 0,
        stroke: { w: 14, color: INK.ink }, extrude: { dx: 16, dy: 18, color: INK.ink } }],
  });
})();
