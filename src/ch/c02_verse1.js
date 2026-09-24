// c02_verse1.js: Verse 1, the burrow (10.45-32.09).
// Split mode: the lyric column owns the left ~45% of the frame, so each shot keeps it calm and plays its joke on the right.
(() => {
  const V = 1 / 24, PI = Math.PI;
  const wt = (li, wi) => LINES[li].words[wi].a;
  const at = T => T - V;                                                    // visual hits land one frame before the sound
  const tw = (t, T) => T + Math.floor((t - T) * 12 + 1e-6) / 12;          // on twos, phased so a pose change lands on T
  const SCREEN = '#DDF6FB', EARTH = '#3A1C14', EARTH2 = '#5A2A18', EARTHDK = '#2A120C';
  const MAIN = BURROW.main, MC = [MAIN[0] + MAIN[2] / 2, MAIN[1] + MAIN[3] / 2];

  // ---------- shared helpers ----------
  function tint(ctx, color, a, op = 'source-over') {
    if (a <= .005) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // halftone ink ramp that quiets the lyric column (screen space): near solid at the left edge, gone by x1
  function calmLeft(ctx, k = 1, x1 = 1000, color = INK.ink, y1 = H) {
    if (k <= .01) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); clipPts(ctx, rect(0, 0, x1, y1), false);
    dotsIn(ctx, [0, 0, x1, y1], { spacing: 30, color, k: x => k * clamp(1.25 * (1 - x / x1)) });
    ctx.restore();
  }
  // draw(c, vw, vh, t) paints a virtual 1680-wide screen into the burrow's main monitor
  const onScreen = draw => (c, [x, y, w, h], tt) => { const s = w / 1680; c.save(); c.translate(x, y); c.scale(s, s); draw(c, 1680, h / s, tt); c.restore(); };
  // the earth wall of the burrow, for close-ups (world coords, box to cover)
  function earthWall(ctx, box, o = {}) {
    const [x0, y0, x1, y1] = box;
    fillPts(ctx, rect(x0, y0, x1 - x0, y1 - y0), o.fill || EARTH, false);
    dotsIn(ctx, box, { spacing: o.spacing || 34, color: o.dots || EARTHDK, k: (x, y) => .35 + .35 * noise2(x * .004, y * .004) });
  }
  function roots(ctx, t, xs, y0, o = {}) {
    xs.forEach((x, i) => { const len = (o.len || 160) * (.6 + hash(i + 3) * .8), sw = wob(t, .3, i * .2) * 8;
      inkLine(ctx, [[x, y0], [x + 10 + sw, y0 + len * .5], [x - 8 + sw * 1.6, y0 + len]], (o.w || 10) * (.6 + hash(i) * .6), o.color || '#1A0A06', { taper: [.05, .9], seed: i }); });
  }
  // the rabbit seen from behind (only head, ears and shoulders: the chair back hides the rest). Same ground point as rabbit().
  function rabbitBack(ctx, x, y, s, o = {}) {
    const sit = o.sit ?? 1, U0 = UPX, px = 1 / s; UPX = px;
    ctx.save(); ctx.translate(x, y + (sit * 1.2 - 7.6) * s); ctx.rotate(deg(o.tilt || 0)); ctx.scale(-s, s);
    ink(ctx, [[-2.5, 3.2], [-2.1, 2.2], [-1, 1.75], [0, 1.7], [1, 1.75], [2.1, 2.2], [2.5, 3.2], [2.6, 3.6], [-2.6, 3.6]], { fill: RB.hoodie, shade: { color: RB.hoodieDk, spacing: 10 * px, dir: [.55, .83], from: -.5, to: 3 }, line: 5 * px, boil: 1.4 * px, seed: 11 });
    ink(ctx, [[-1.8, 2.2], [-1.2, 1.35], [0, 1.2], [1.2, 1.35], [1.8, 2.2], [.9, 2.5], [0, 2.6], [-.9, 2.5]], { fill: RB.hoodieDk, line: 4 * px, boil: px, seed: 13 });
    ink(ctx, ell(0, 0, 2.45, 2.15, 30), { fill: RB.fur, shade: { color: RB.furDk, spacing: 9 * px, dir: [.5, .86], from: .2, to: 2.4, max: .85 }, line: 5.4 * px, boil: 1.4 * px, seed: 31 });
    for (const side of [-1, 1]) { const E = earPts(side, side < 0 ? o.earL : o.earR, 0);
      ink(ctx, E.out, { fill: RB.fur, shade: { color: RB.furDk, spacing: 9 * px, dir: [-.6, .8], from: -.2, to: 2.4, max: .8 }, line: 4.2 * px, boil: 1.3 * px, seed: 7 + side }); }
    ctx.save(); ctx.translate(1.55, -1.25); ctx.rotate(deg(-24)); ink(ctx, rrect(-1.6, -.2, 3.2, .4, .14), { fill: RB.pen, line: 3.4 * px, boil: .6 * px, smooth: false }); ctx.restore();
    ctx.restore(); UPX = U0;
  }
  // the red review pen, held: (x, y) = grip point, rot in radians, s = rabbit scale
  function penAt(ctx, x, y, s, rot) {
    const U0 = UPX, px = 1 / s; UPX = px;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ink(ctx, rrect(-1.4, -.2, 3.2, .4, .14), { fill: RB.pen, line: 3.4 * px, boil: .6 * px, smooth: false });
    fillPts(ctx, rect(1.2, -.2, .3, .4), INK.white, false);
    ink(ctx, [[1.8, -.2], [2.35, 0], [1.8, .2]], { fill: INK.fur, line: 3 * px, boil: 0, smooth: false });
    fillPts(ctx, ell(2.28, 0, .08, .08, 6), RB.pen);
    ctx.restore(); UPX = U0;
    return [x + Math.cos(rot) * 2.35 * s, y + Math.sin(rot) * 2.35 * s];     // nib
  }
  function sparkle(ctx, x, y, r, k, seed = 0) {
    if (k <= .02) return;
    ink(ctx, star(x, y, r * k, .22, 4, PI / 4 * (seed % 2)), { fill: INK.white, line: Math.max(3, r * .08), boil: 0, smooth: false });
  }
  // a literal golden key. (x, y) centre, s = length
  function goldKey(ctx, x, y, s, rot = 0, o = {}) {
    const u = s / 10;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const body = [[-5, -2.1], [-2.6, -2.1], [-1.4, -.55], [5, -.55], [5, 1.9], [4.3, 1.9], [4.3, .55], [3.6, .55], [3.6, 1.5], [2.9, 1.5], [2.9, .55], [-1.4, .55], [-2.6, 2.1], [-5, 2.1]].map(([a, b]) => [a * u, b * u]);
    ink(ctx, ell(-3.8 * u, 0, 2.2 * u, 2.2 * u, 28), { fill: INK.yellow, shade: { color: INK.orange, spacing: Math.max(10, u * .9), dir: [.5, .85], from: -u, to: 2.5 * u }, line: Math.max(4, u * .38), boil: .8 });
    ink(ctx, body.slice(2, 12), { fill: INK.yellow, shade: { color: INK.orange, spacing: Math.max(10, u * .9), dir: [0, 1], from: -u * .4, to: u * 1.6 }, line: Math.max(4, u * .38), boil: .8, smooth: false });
    ink(ctx, ell(-3.8 * u, 0, 1 * u, 1 * u, 20), { fill: o.hole || INK.orangeDk, line: Math.max(3, u * .3), boil: .6 });
    fillPts(ctx, ell(-4.6 * u, -1 * u, .45 * u, .3 * u, 10, -.6), INK.white);
    ctx.restore();
  }
  // headphones on a rabbit: head anchor + scale + head roll in degrees
  function headphones(ctx, A, s, tilt = 0) {
    const [hx, hy] = A.head, u = s;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(deg(tilt));
    inkLine(ctx, [[-2.45 * u, -.2 * u], [-2.3 * u, -2.2 * u], [0, -3.05 * u], [2.3 * u, -2.2 * u], [2.45 * u, -.2 * u]], .55 * u, INK.ink, { taper: [0, 0] });
    for (const sd of [-1, 1]) {
      ink(ctx, rrect(sd * 2.45 * u - .75 * u, -1.25 * u, 1.5 * u, 2.3 * u, .6 * u), { fill: INK.ink, line: .2 * u, boil: .6 });
      ink(ctx, rrect(sd * 2.45 * u - (sd > 0 ? .1 : .55) * u, -.95 * u, .65 * u, 1.7 * u, .3 * u), { fill: INK.pink, line: .12 * u, boil: .5 });
    }
    ctx.restore();
  }
  // rabbit-sense squiggles along a vertical-ish ear spine (private: the rig only draws them round the head)
  function earSense(ctx, pts, k, w) {
    if (k <= .02) return;
    pts.forEach(([x, y], i) => { for (const sd of [-1, 1]) { const q = []; for (let j = 0; j <= 6; j++) q.push([x + sd * (w + j * 11 * k), y + Math.sin(j * 2.1 + boilN(BOIL_T) * 1.9 + i) * 9]); inkLine(ctx, q, 6, INK.ink, { taper: [.1, .5] }); } });
  }

  // ================= 1 · PING (10.45-12.00) =================
  const PING = 10.449;
  function ping(ctx, t) {
    const a = t - at(PING), tc = tw(t, at(PING));
    const th = kf(t, [[10.92, 0], [11.0, -.3], [11.2, PI + .32], [11.31, PI - .1], [11.42, PI]], easeInOut);
    const k = easeInOut(seg(t, 11.26, 11.97));
    const [qx, qy] = shake(t, 9 * hit(t, [PING], 10));
    const A = [lerp(960, 1170, k) + qx, lerp(540, 430, k) + qy, lerp(1, 1.5, k)];
    const B = [A[0], lerp(540, 464, k) + qy, lerp(1, 1.68, k)];              // the rabbit rises out of the chair back as we crane over it
    const C = [A[0], lerp(540, 40, k) + qy, lerp(1, 1.9, k)];                // chair back, nearest the lens
    cam(ctx, ...A);
    burrow(ctx, t, { pinsFocus: k > 0, fg: false, glow: 1, screen: onScreen((c, vw, vh) => {
      prPage(c, t, { x: 0, y: 0, w: vw, h: vh, shadow: 0 });
      tintBox(c, vw, vh, .35);
    }) });
    ctx.restore();
    // the chair and the rabbit spin as one on a fake swivel (x squash about the post)
    const sx = Math.cos(th), front = sx >= 0, sq = Math.abs(sx);
    const swivel = (c, P, fn) => { cam(c, ...P); c.translate(1400, 0); c.scale(Math.max(.04, sq), 1); c.translate(-1400, 0); fn(); c.restore(); };
    if (front) {
      const la = tc - 10.40, settle = .42 * Math.exp(-la * 8) * Math.cos(la * 26);
      const look = seg(tc, 10.6, 10.7), wind = seg(tc, 10.88, 10.98);
      const pose = {
        sit: 1, sq: settle + wind * .22, lean: -9 * wind, turn: lerp(.35 * look, 1, clamp(1 - sx) * 1.6), tilt: -7 * look,
        eyes: tc < 10.58 ? 'closed' : 'wide', lx: .9 * look, ly: -.85 * look, brows: .35 * look, mouth: look ? (wind ? 'grin' : 'o') : 'flat',
        earL: { a: lerp(-40, -8, look), b: lerp(-30, wob(tc, 6) * 6, look) }, earR: { a: lerp(38, 8, look), b: lerp(28, wob(tc, 6, .3) * 6, look) },
        armL: { a: 28, e: 30 }, armR: { a: 28, e: 30 }, pawL: 'mitt', pawR: 'mitt', noShadow: true,
      };
      swivel(ctx, A, () => { officeChair(ctx, 1400, 1000, .95); rabbit(ctx, 1400, 870, 30, pose); });
    } else {
      const ek = seg(tc, 11.36, 11.5), tw_ = wob(tc, 3.5) * 5 * ek;
      const back = { sit: 1, tilt: tw_ * .6, earL: { a: -9 + tw_, b: -wob(tc, 7) * 7, len: lerp(1, 1.12, ek) }, earR: { a: 9 + tw_, b: wob(tc, 7, .4) * 7, len: lerp(1, 1.12, ek) } };
      swivel(ctx, B, () => rabbitBack(ctx, 1400, 870, 30, back));
      swivel(ctx, C, () => officeChair(ctx, 1400, 1000, .95, { back: false }));
      depth(ctx, 6 * k, c => swivel(c, C, () => { c.save(); c.translate(1400, 1000); c.scale(.95, .95);
        ink(c, rrect(-190, -760, 380, 470, 70), { fill: INK.nightLt, shade: { color: INK.night, spacing: 14, dir: [.6, .8], from: -80, to: 260 }, line: 6, boil: .8, smooth: false });
        inkLine(c, [[0, -290], [0, -180]], 26, '#2A2638', { taper: [0, 0], smooth: false }); c.restore(); }));
    }
    // spin smear, landing dust, and the review toast bursting out of the monitor (the intro's frame-0 card)
    cam(ctx, ...A);
    const sp = seg(t, 11.02, 11.2);
    if (sp > 0 && sp < 1) streaks(ctx, [1180, 420, 1640, 860], { dir: [front ? 1 : -1, 0], n: 26, len: 360, w: 6, color: INK.ink });
    const du = seg(t, 10.4, 10.75);
    if (du < 1) for (let i = 0; i < 7; i++) { const sd = i % 2 ? 1 : -1, r = (40 + hash(i) * 40) * (1 - du * .8);
      ink(ctx, blob(1400 + sd * (170 + i * 26 + du * 120), 830 - hash(i * 3) * 60 - du * 40, r, i, .25, 12), { fill: INK.paperDk, line: 4, boil: 1.2, seed: i }); }
    const pop = backOut(clamp(a / .22), 2.2), tp = [lerp(MC[0], 1470 - 30 * k, pop), lerp(MC[1], 180 + 60 * k, pop)];
    toast(ctx, tp[0], tp[1], lerp(.2, .56, pop) * (1 + .03 * wob(t, 1.3)), { rot: lerp(0, -.06, pop) + wob(t, .9) * .01 });
    const bx = tp[0] + 470 * .56, by = tp[1] - 140 * .56;
    for (let i = 0; i < 3; i++) { const g = a - i * .12; if (g < 0 || g > .8) continue; const r = 40 + easeOut(g / .8) * 900;
      outline(ctx, ell(bx, by, r, r, 56), 20 * (1 - g / .8) + 2, INK.cyan, { heavy: 0 }); }
    ctx.restore();
    // foreground roots
    depth(ctx, 10, c => { cam(c, A[0], A[1] - k * 90, A[2] * (1 + k * .25)); roots(c, t, [-40, 800, 1640], -20, { len: 230, w: 22, color: '#120604' }); c.restore(); });
    calmLeft(ctx, .15 + .7 * k, 1020);
    tint(ctx, INK.cyan, .5 * hit(t, [PING], 5) + .06, 'screen');
  }
  function tintBox(c, w, h, a) { c.save(); c.globalAlpha = a; c.fillStyle = INK.ink; c.fillRect(0, 0, w, h); c.restore(); }

  // ================= 2 · MY EARS STAND TALL (12.00-13.40) =================
  // world for the ears shot: the burrow room (ceiling y -100), earth strata above it, the meadow surface at SURF
  const SURF = -2300;
  function ears(ctx, t) {
    const E = wt(2, 5), S = wt(2, 6), T = wt(2, 7), tc = tw(t, at(E));
    const len = kf(t, [[12.0, 1], [at(E), .9], [at(E) + .07, 1.25], [at(E) + .16, 1.06], [at(E) + .25, 1.12], [at(S), 1.12], [at(S) + .08, 2.4], [at(S) + .18, 2.05], [at(S) + .28, 2.15], [at(T), 2.15], [at(T) + .24, 8.1], [at(T) + .34, 7.5], [at(T) + .44, 7.75]], easeOut);
    const up = clamp((t - at(E)) / .05), dip = seg(t, at(E) - .1, at(E)) * (1 - up);
    const whip = seg(t, at(T), at(T) + .28);
    const cy = t < at(T) ? kf(t, [[12.0, 600], [at(S), 585], [at(S) + .26, 330]], easeInOut) : lerp(330, SURF - 60, easeInOut(whip));
    const [qx, qy] = shake(t, 10 * hit(t, [E, S, T], 12) + 6 * hit(t, [at(T) + .3], 10));
    cam(ctx, 960 + qx, cy + qy, 1);
    // earth: strata, stones, roots, a couple of buried things (pause-bait)
    earthWall(ctx, [-300, SURF, 2300, 1900]);
    [[-100, EARTH], [-900, EARTH2], [-1500, '#4A2416'], [-2000, EARTH2]].forEach(([y, c], i) => ink(ctx, [[-300, y], [400, y - 30 - i * 10], [1100, y + 20], [1800, y - 20], [2300, y + 10], [2300, y - 620], [-300, y - 600]], { fill: c, line: 5, boil: 1, seed: i + 3 }));
    dotsIn(ctx, [-300, SURF, 2300, -100], { spacing: 34, color: EARTHDK, k: (x, y) => .3 + .3 * noise2(x * .005, y * .005) });
    for (let i = 0; i < 16; i++) ink(ctx, blob(hrange(i, -100, 2100), hrange(i + 40, SURF + 150, -200), hrange(i + 9, 18, 46), i, .25, 10), { fill: '#7A5A44', line: 4, boil: .8, seed: i });
    goldKey(ctx, 460, -1250, 170, .5, { hole: EARTH });
    txt(ctx, 'fix()', 1800, -1700, { font: 'mono', weight: 800, size: 64, color: '#8A6A54', rot: -.3 });
    roots(ctx, t, [150, 520, 900, 1150, 1700, 1980], SURF + 10, { len: 420, w: 12 });
    // the room: lit by the monitor, the ceiling the ears are about to pierce
    ink(ctx, [[-300, -40], [500, -110], [1400, -80], [2300, -120], [2300, 1900], [-300, 1900]], { fill: EARTH, line: 7, boil: 1.2, seed: 1 });
    dotsIn(ctx, [-300, -120, 2300, 1900], { spacing: 34, color: EARTHDK, k: (x, y) => .35 + .35 * noise2(x * .004, y * .004) });
    ctx.save(); ctx.globalAlpha = .16; fillPts(ctx, [[1060, 180], [1740, 180], [1900, 1400], [900, 1400]], INK.cyan, false); ctx.restore();
    roots(ctx, t, [200, 480, 760, 1700, 1980], -90, { len: 200, w: 12 });
    // the meadow at golden hour (the intro's), where the ear tips come out
    fillPts(ctx, rect(-300, SURF - 1400, 2600, 1400), INK.orange, false);
    ctx.save(); clipPts(ctx, rect(-300, SURF - 1400, 2600, 1400), false);
    ink(ctx, ell(1720, SURF - 60, 300, 300, 40), { fill: INK.yellow, shade: { color: INK.orangeLt, spacing: 22, dir: [0, 1], from: 0, to: 300 }, line: 6, boil: 1 });
    dotsIn(ctx, [-300, SURF - 1400, 2300, SURF], { spacing: 36, color: INK.orangeDk, dir: [0, -1], c: [960, SURF], from: 200, to: 900, min: 0, max: .8 });
    ctx.restore();
    const flop = 1 - up, wobE = up * 16 * Math.exp(-(tc - at(E)) * 9) * Math.sin((tc - at(E)) * 42);
    const tall = seg(t, at(T), at(T) + .1);
    const pose = {
      sq: dip * .2 - up * .1 * Math.exp(-(t - at(E)) * 6), nod: dip * .3, ly: -.35 + (1 - up) * .2 - tall * .5, lx: wob(tc, .8) * .2 * (1 - up),
      eyes: up ? 'wide' : 'open', brows: .5 * up, mouth: tall ? 'grin' : up ? 'open' : 'smile', open: up ? .5 : 0, blush: .4 * up, sense: tall,
      earL: { a: lerp(-4 * (1 - tall), -40, flop), b: lerp(-wobE, -48, flop), len }, earR: { a: lerp(4 * (1 - tall), 38, flop), b: lerp(wobE, 50, flop), len },
      armL: { a: 12, e: 30 }, armR: { a: 12, e: 30 }, col: { fur: mix(INK.fur, INK.cyan, .1) }, noShadow: true,
    };
    ctx.save(); clipPts(ctx, rect(-400, SURF + 12, 2800, 4000), false); rabbit(ctx, 1400, 1260, 80, pose); ctx.restore();
    // above ground only the tips show: short ears of their own, so they can twitch
    const emerge = clamp((SURF + 12 - (538 - 408 * len)) / 408, 0, 1.05), out = t - (at(T) + .12);
    if (emerge > .02) {
      const U0 = UPX; UPX = 1 / 80;
      for (const sd of [-1, 1]) { const tw2 = out > 0 ? 22 * Math.exp(-out * 4) * Math.sin(out * 26 + sd) + wob(tc, 1.3, sd * .2) * 7 : 0;
        ctx.save(); ctx.translate(1400 + sd * 76, SURF + 20); ctx.scale(80, 80); ctx.translate(-sd * .95, 1.42);
        drawEar(ctx, earPts(sd, { a: sd * 3 + tw2 * .3, b: tw2, len: emerge }, 0), { col: RB }, 1 / 80, false); ctx.restore(); }
      UPX = U0;
    }
    // dirt bursts where the ears break through the ceiling and the surface; grass in front of the tips
    const pierce = t - (at(S) + .05); if (pierce > 0 && pierce < .5) krackle(ctx, 1400, -100, 150 + pierce * 200, { n: 24, size: 18 * (1 - pierce * 1.5), color: EARTH2 });
    if (out > 0 && out < .5) krackle(ctx, 1400, SURF - 20, 120 + out * 260, { n: 20, size: 16 * (1 - out * 1.6), color: EARTH2 });
    for (let i = 0; i < 26; i++) { const x = -200 + i * 95 + hash(i) * 40, h = 40 + hash(i * 3) * 50, sw = wob(t, .5, i * .1) * 8;
      ink(ctx, [[x - 22, SURF + 10], [x - 6 + sw, SURF - h], [x + 2, SURF - 8], [x + 12 + sw, SURF - h * .8], [x + 24, SURF + 10]], { fill: INK.ink, line: 0, boil: 1.2, smooth: false, seed: i }); }
    if (out > 0) earSense(ctx, [[1400 - 80, SURF - 330 * emerge], [1400 + 80, SURF - 330 * emerge]], clamp(out / .1), 60);
    if (whip > 0 && whip < 1) streaks(ctx, [900, cy - 700, 1900, cy + 700], { dir: [0, -1], n: 30, len: 700, w: 6, color: rgba(INK.ink, .7) });
    ctx.restore();
    calmLeft(ctx, .45 * (1 - whip), 980);
    tint(ctx, INK.cyan, .07 * (1 - whip), 'screen');
  }

  // ================= 3 · "SMALL FIX" (13.40-14.45) =================
  function smallFix(ctx, t) {
    const k = easeInOut(seg(t, 13.4, 14.3)), whip = easeIn(seg(t, 14.3, 14.45));
    cam(ctx, 1060 + whip * 900, 560, lerp(1, 1.12, k));
    fillPts(ctx, rect(-400, -300, W + 2400, H + 600), SCREEN, false);
    prHeader(ctx, 640, 250, 1500, { size: 112, stats: false });
    prTabs(ctx, 640, 590, 1400, { size: 38 });
    diff(ctx, 620, 760, 1600, fakeDiff(8, 5), { lineH: 60 });
    ctx.restore();
    // the rabbit's face reflected in the glass, leaning in
    const tc = twos(t), lean = easeOut(seg(tc, 13.45, 14.25)), L = pushLayer();
    const R = rabbit(L, 1500 - lean * 60, 1700 + lean * 40, 118 * (1 + .22 * lean), { flip: true, tilt: -12 * lean, lids: .15 + .1 * lean, brows: .35 * lean, lx: -.3, ly: -.2,
      mouth: lean > .5 ? 'o' : 'smile', eyes: blink(tc, [13.95]) > .5 ? 'closed' : 'open', noShadow: true, armL: { a: 10, e: 10 }, armR: { a: 10, e: 10 } });
    L.globalCompositeOperation = 'source-atop'; L.globalAlpha = .6; L.fillStyle = INK.nightLt; L.fillRect(0, 0, W, H);
    popLayer();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .24; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L.canvas, 0, 0); ctx.restore();
    // breath fog on the glass as it leans right up to it
    const fog = seg(tc, 13.75, 14.0) * (1 - .5 * seg(tc, 14.1, 14.45));
    if (fog > 0) { ctx.save(); ctx.globalAlpha = .55; clipPts(ctx, blob(R.mouth[0], R.mouth[1] + 10, 95 * fog, 4, .2, 16, 60 * fog)); dotsIn(ctx, [R.mouth[0] - 120, R.mouth[1] - 80, R.mouth[0] + 120, R.mouth[1] + 100], { spacing: 14, color: INK.white, c: [R.mouth[0], R.mouth[1] + 10], dir: [1, 0], k: (x, y) => .9 - Math.hypot(x - R.mouth[0], (y - R.mouth[1] - 10) * 1.5) / 110 }); ctx.restore(); }
    // CRT scanlines and a glass glare
    ctx.save(); ctx.globalAlpha = .07; for (let y = 0; y < H; y += 6) fillPts(ctx, rect(0, y, W, 2), INK.ink, false); ctx.restore();
    ctx.save(); ctx.globalAlpha = .25; fillPts(ctx, [[1500, 0], [1720, 0], [1180, H], [960, H]], INK.white, false); ctx.restore();
    if (whip > 0) streaks(ctx, [0, 0, W, H], { dir: [-1, 0], n: 40, len: 600 * whip, w: 6, color: rgba(INK.ink, .6) });
  }

  // ================= 4 · FOURTEEN THOUSAND LINES IN ALL (14.45-16.90) =================
  const DIG = '14203', DIG_T = [14.48, 14.56, 14.66, 14.8, 14.96];
  function odometer(ctx, x, y, h, t) {
    const w = h * .64, gap = h * .1; let xx = x;
    const tile = (s, fn) => { fillPts(ctx, rrect(xx + 10, y + 12, w, h, 12), INK.ink, false); ink(ctx, rrect(xx, y, w, h, 12), { fill: INK.green, shade: { color: rgba(INK.ink, .28), spacing: 14, dir: [0, 1], from: h * .1, to: h }, line: 6, boil: .5, smooth: false }); ctx.save(); clipPts(ctx, rrect(xx + 6, y + 6, w - 12, h - 12, 8), false); fn(); ctx.restore(); xx += w + gap; };
    const f = { font: 'mono', weight: 800, size: h * .78, align: 'center', color: INK.white };
    tile('+', () => txt(ctx, '+', xx + w / 2, y + h * .78, f));
    [...DIG].forEach((d, i) => {
      const T = at(DIG_T[i]), g = t - T;
      const p = g < 0 ? (t - 14.4) * 26 + i * 3.3 : +d - .4 * Math.exp(-g * 16) * Math.cos(g * 36);
      const b = Math.floor(p), fr = p - b;
      tile(d, () => { for (const [dd, off] of [[b, -fr], [b + 1, 1 - fr]]) txt(ctx, String(mod(dd, 10)), xx + w / 2, y + h * .78 + off * h, f);
        if (g < 0) streaks(ctx, [xx, y, xx + w, y + h], { dir: [0, 1], n: 6, len: h * .7, w: 5, color: rgba(INK.white, .6), seed: i }); });
      if (i === 1) { txt(ctx, ',', xx - gap * .2, y + h * .95, { ...f, color: INK.green, size: h * .7 }); xx += gap * .6; }
    });
    return xx;
  }
  // the printed diff unrolling: a path from the screen, over the desk, along the floor and out of the door
  const FLOOR = 985;
  const TAPE = [[1410, 590], [1395, 700], [1350, 800], [1300, 900], [1220, FLOOR - 8], [1000, FLOOR], [500, FLOOR + 4], [0, FLOOR + 6], [-500, FLOOR + 8], [-1000, FLOOR + 10]];
  const TAPE_TXT = ['\uD83E\uDD16 Co-authored-by: 64 agents', '+ console.log("here");', '+ return a ? b ? c : d : e;', '\uD83E\uDD16 Co-authored-by: 64 agents', '+ // TODO: remove before merge', '+ await sleep(1000); // fixes race'];
  function tape(ctx, t, t0) {
    const d = sampleSpline(TAPE, false, true, 6); let L = 0; const acc = [0]; for (let i = 1; i < d.length; i++) { L += dist(d[i - 1], d[i]); acc.push(L); }
    const head = Math.min(L, (t - t0) * 2600), n = acc.findIndex(v => v > head), pts = d.slice(0, n < 0 ? d.length : Math.max(2, n));
    if (pts.length < 2) return;
    inkLine(ctx, pts.map(([x, y]) => [x + 10, y + 12]), 124, rgba(INK.ink, .8), { taper: [0, 0] });
    inkLine(ctx, pts, 118, INK.white, { taper: [0, 0] });
    // printed rows: short coloured bars on the falling part, legible text along the floor run
    const scroll = (t - t0) * 700;
    for (let i = 0; i < pts.length - 1; i += 3) { const s = acc[i] + scroll, [x, y] = pts[i], [x2, y2] = pts[Math.min(pts.length - 1, i + 1)], ang = Math.atan2(y2 - y, x2 - x);
      if (y > FLOOR - 20) continue; const kind = hash(Math.floor(s / 18)); ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      fillPts(ctx, rect(-9, -44, 12, 88 * (.4 + .6 * kind)), kind < .6 ? '#8FD9AE' : '#F4A6B0', false); ctx.restore(); }
    ctx.save(); clipPts(ctx, rect(-1200, FLOOR - 56, 2410, 112), false);
    const period = TAPE_TXT.length * 820, tx = mod(-scroll, period);
    for (let r = -1; r < 3; r++) TAPE_TXT.forEach((s, i) => txt(ctx, s, 1200 + tx - r * period - (i + 1) * 820, FLOOR + 16, { font: 'mono', weight: 800, size: 46, color: s[0] === '+' ? '#0E6B3A' : INK.ink }));
    ctx.restore();
    outline(ctx, [...pts.map(([x, y]) => [x, y - 59]), ...pts.slice().reverse().map(([x, y]) => [x, y + 59])], 4, INK.ink, { smooth: false, heavy: .2 });
  }
  function fourteen(ctx, t) {
    const LN = wt(3, 4), tc = tw(t, at(LN)), pull = expoOut(seg(t, at(LN), at(LN) + .55));
    const [qx, qy] = shake(t, 14 * hit(t, [LN], 9) + 4 * hit(t, DIG_T, 14));
    const z = lerp(1.75 + .1 * seg(t, 14.45, at(LN)), 1.05, pull), cx = lerp(1169, 1000, pull), cy = lerp(432, 560, pull);
    cam(ctx, cx + qx, cy + qy, z);
    burrow(ctx, t, { pinsFocus: true, fg: false, screen: onScreen((c, vw, vh) => {
      prHeader(c, 70, 40, vw - 140, { size: 96, stats: false });
      odometer(c, 100, 390, 330, t);
      txt(c, '\u221212', 1600, 1010, { font: 'mono', weight: 800, size: 80, color: INK.red, align: 'right' });
      const over = seg(t, at(LN) - .3, at(LN) + .2); for (let i = 0; i < 5 + over * 26; i++) fillPts(c, rect(100 + i * 58, 930, 46, 46), INK.green, false);
    }) });
    fillPts(ctx, rect(-1200, FLOOR - 30, 3600, 600), EARTHDK, false); inkLine(ctx, [[-1200, FLOOR - 30], [2400, FLOOR - 30]], 5, INK.ink, { taper: [0, 0] });
    if (t >= at(LN)) tape(ctx, t, at(LN));
    ctx.restore();
    const whipIn = 1 - seg(t, 14.45, 14.56); if (whipIn > 0) streaks(ctx, [0, 0, W, H], { dir: [-1, 0], n: 40, len: 600 * whipIn, w: 6, color: rgba(INK.ink, .5) });
    // the rabbit, foreground right: jaw drop, ears blown back by the paper
    if (pull > .05) {
      const g = tc - at(LN), drop = clamp(g / .12), fl = wob(tc, 5) * 8;
      const A = rabbit(ctx, 1690 + (1 - pull) * 400, 1250, 58, { turn: -.55, eyes: 'wide', lx: -.8, ly: -.3, mouth: 'open', open: drop, sq: -.12 * drop, brows: .7,
        earL: { a: 58 + fl, b: 28 - fl }, earR: { a: 74 + fl, b: 22 + fl }, armL: { a: 70, e: 60 }, armR: { a: 40, e: 90 }, pawL: 'open', pawR: 'open', sweat: .6, noShadow: true });
    }
    calmLeft(ctx, .5 + pull * .4, 1000, INK.ink, lerp(H, 925, pull));
  }

  // ================= 5 · NESTED TERNARIES (16.90-18.10) =================
  function ternary(ctx, t) {
    const TN = wt(4, 1), tc = tw(t, at(TN));
    fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
    const X = 720, Y = 150, PW = 1100, PH = 720, r = .6, F = [X + .6 * PW, Y + .56 * PH], rot = .2;
    const P = 3.4 * Math.pow(seg(t, 16.9, 18.1), 1.35), n0 = Math.floor(P) - 1;
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (let n = n0; n < n0 + 8; n++) {
      const sc = Math.pow(r, n - P); if (sc * PW < 30) break;
      ctx.save(); ctx.translate(F[0], F[1]); ctx.rotate((n - P) * rot); ctx.scale(sc, sc); ctx.translate(-F[0], -F[1]);
      ink(ctx, rect(X, Y, PW, PH), { fill: mod(n, 2) ? '#221C33' : '#2E2545', line: 8, lineColor: INK.paper, boil: .6, smooth: false });
      const f = { font: 'mono', weight: 800, size: PH * .17 }, L = letters[mod(n, 26)];
      txt(ctx, L, X + 36, Y + PH * .24, { ...f, color: INK.paper });
      txt(ctx, '?', X + 36 + measure(ctx, 'a ', f).w, Y + PH * .27, { ...f, size: PH * .26, color: INK.orange });
      txt(ctx, ': ' + letters[mod(n + 13, 26)], X + 36, Y + PH * .95, { ...f, color: INK.cyan });
      ctx.restore();
    }
    // the rabbit, hypnotised
    const spir = t >= at(TN) + .06, bl = blink(tc, [at(TN)]);
    rabbit(ctx, 400, 1400, 78, { eyes: bl > .5 ? 'closed' : spir ? 'spiral' : 'wide', tilt: spir ? wob(tc, .9) * 9 : 0, lx: .7, ly: -.2, mouth: spir ? 'wavy' : 'o', open: .3,
      earL: { a: -18 + (spir ? wob(tc, .9) * 14 : 0), b: spir ? wob(tc, 1.1) * 30 : 0 }, earR: { a: 18 + (spir ? wob(tc, .9, .5) * 14 : 0), b: spir ? -wob(tc, 1.1, .3) * 30 : 0 }, noShadow: true });
  }

  // ================= 6 · A FUNCTION CALLED "FIX" (18.10-19.70) =================
  const FIXES = [['function fix() {', 18.16], ['fix2()', 18.34], ['fixFinal()', 18.53], ['fix_ACTUALLY_final()', 18.72], ['fix_final_v3_REAL()', 18.92]];
  function fixTower(ctx, t) {
    const FX = wt(4, 5), tc = tw(t, at(FX)), push = backOut(seg(t, at(FX), at(FX) + .2), 1.4);
    const [qx, qy] = shake(t, 6 * hit(t, FIXES.map(f => f[1]), 14));
    cam(ctx, lerp(960, 1080, push) + qx, lerp(540, 560, push) + qy, lerp(1, 1.3, push));
    earthWall(ctx, [-400, -300, 2400, 1400]);
    fillPts(ctx, rect(-400, 980, 2800, 500), EARTH2, false);
    inkLine(ctx, [[-400, 982], [2400, 982]], 6, INK.ink, { taper: [0, 0] });
    const f = { font: 'mono', weight: 800, size: 60 }, bh = 100, landed = FIXES.filter(([, T]) => t >= at(T)).length;
    const sway = landed >= 5 ? wob(t, 1.1) * .035 * (1 + hit(t, [FX], 3)) : 0;
    let y = 980;
    FIXES.forEach(([s, T], i) => {
      const g = t - at(T), w = measure(ctx, s, f).w + 70, dx = (hash(i * 5) - .5) * 60, drop = g < 0 ? -1 : 0;
      const yy = y - bh, fall = g < 0 ? Math.max(0, 1 - (g + .16) / .16) : 0;
      if (g >= -.16) {
        const fy = g < 0 ? lerp(-200, yy, easeIn((g + .16) / .16)) : yy, sq = g >= 0 ? .25 * Math.exp(-g * 14) : 0;
        ctx.save(); ctx.translate(1330, 980); ctx.rotate(sway * (980 - yy) / 400); ctx.translate(-1330, -980);
        ctx.translate(1330 + dx, fy + bh); ctx.rotate((hash(i * 9) - .5) * .06 * i); ctx.scale(1 + sq * .4, 1 - sq);
        fillPts(ctx, rect(-w / 2 + 10, -bh + 12, w, bh), INK.ink, false);
        ink(ctx, rect(-w / 2, -bh, w, bh), { fill: i === 0 ? INK.white : mix(INK.white, INK.yellow, i * .12), line: 5, boil: .6, smooth: false });
        const kw = s.startsWith('function') ? 'function ' : '', kwW = kw ? measure(ctx, kw, f).w : 0, x0 = -w / 2 + 35;
        if (kw) txt(ctx, kw, x0, -bh * .3, { ...f, color: INK.orange });
        txt(ctx, s.slice(kw.length), x0 + kwW, -bh * .3, { ...f, color: INK.ink });
        ctx.restore();
        if (g >= 0 && g < .25) krackle(ctx, 1330 + dx, yy + bh, w * .4, { n: 14, size: 10, color: EARTH2 });
      }
      y -= bh;
    });
    const dead = { lids: .5, mouth: 'flat', lx: .6, ly: -.55 - landed * .05, earL: { a: -12, b: 0 }, earR: { a: 12, b: 0 }, armL: { a: 8, e: 10 }, armR: { a: 8, e: 10 } };
    rabbit(ctx, 640, 980, 40, { ...dead, eyes: blink(tc, [at(FX) + .2]) > .5 ? 'closed' : 'open' });
    ctx.restore();
  }

  // ================= 7 · FORTY-SIX CONSOLE LOGS (19.70-21.70) =================
  const CELL = 88, COLS = 7, ROWS = 10, WX = 950, WB = 985;
  const LOGS = (() => {
    const hero = [['"here"', 3, 0, 0], ['"HERE???"', 4, 3, 0], ['"here2"', 3, 0, 1], ['"why"', 3, 3, 1], ['"it works??"', 5, 0, 2], ['"asdf"', 3, 0, 3]];
    const out = hero.map(([s, w, c, r], i) => ({ s, w, c, r, T: 19.72 + i * .16, hero: 1 }));
    const tiny = ['"x"', '"1"', '"?"', '"a"', '"k"', '"2"', '"3"', '"!"', '"."', '"q"'], wide = ['"ok"', '"hi"', '"no"', '"??"'];
    const holes = [[6, 1, 1], [5, 2, 2], [3, 3, 1], [4, 3, 1], [5, 3, 1], [6, 3, 1]];
    for (let r = 4; r < ROWS - 1; r++) for (let c = 0; c < COLS; c++) holes.push([c, r, 1]);
    const merge = new Set([9, 24]);                                       // two 2-wide pieces, so 46 logs in all
    const rain = []; for (let i = 0; i < holes.length; i++) { const [c, r, w] = holes[i]; if (merge.has(i) && holes[i + 1] && holes[i + 1][1] === r) { rain.push([c, r, 2]); i++; } else rain.push([c, r, w]); }
    rain.forEach(([c, r, w], j) => { const L = w > 1 ? wide : tiny; out.push({ s: L[Math.floor(hash(j * 3.7) * L.length)], w, c, r, T: 20.7 + j / rain.length * .76 }); });
    out.push({ s: '\uD83D\uDE4F', w: 2, c: 2, r: ROWS - 1, T: 21.52, hero: 1 });
    return out;
  })();
  function consoleLogs(ctx, t) {
    const tc = twos(t), n = LOGS.filter(p => t >= at(p.T)).length;
    const last = at(21.52), [qx, qy] = shake(t, 10 * hit(t, [21.52], 10));
    cam(ctx, 960 + qx, 540 + qy, 1 + .015 * pulse(t, 8));
    earthWall(ctx, [-100, -100, W + 100, H + 100]);
    // the well, on a CRT
    const top = WB - ROWS * CELL, WW = COLS * CELL;
    ink(ctx, rrect(WX - 36, top - 40, WW + 72, ROWS * CELL + 90, 20), { fill: '#D9CDB4', shade: { color: rgba(INK.ink, .35), spacing: 14, dir: [.6, .8], from: -40, to: 800 }, line: 6, boil: 1, smooth: false });
    fillPts(ctx, rect(WX, top - 10, WW, ROWS * CELL + 10), '#101018', false);
    ctx.save(); clipPts(ctx, rect(WX, top - 10, WW, ROWS * CELL + 10), false);
    for (let c = 1; c < COLS; c++) fillPts(ctx, rect(WX + c * CELL - 1, top - 10, 2, ROWS * CELL + 10), '#1E1E2C', false);
    const cols = [INK.orange, INK.yellow, INK.cyan, INK.paper];
    LOGS.forEach((p, i) => {
      const g = t - at(p.T), fd = p.hero ? .34 : .14; if (g < -fd) return;
      const ty = WB - (p.r + 1) * CELL, steps = Math.round((ty - top + CELL) / CELL), y = g >= 0 ? ty : top - CELL + Math.floor(((g + fd) / fd) * steps) * CELL;
      const x = WX + p.c * CELL, w = p.w * CELL, fillc = p.s === '\uD83D\uDE4F' ? INK.white : cols[Math.floor(hash(i * 3.3) * cols.length)], sq = g >= 0 ? .2 * Math.exp(-g * 20) : 0;
      ctx.save(); ctx.translate(x + w / 2, y + CELL); ctx.scale(1 + sq * .3, 1 - sq); ctx.translate(-x - w / 2, -y - CELL);
      ink(ctx, rect(x + 3, y + 3, w - 6, CELL - 6), { fill: fillc, shade: { color: rgba(INK.ink, .3), spacing: 12, dir: [0, 1], from: 0, to: CELL }, line: 4, boil: .5, smooth: false });
      const pray = p.s === '\uD83D\uDE4F';
      txt(ctx, p.s, x + w / 2, y + CELL * (pray ? .8 : p.hero ? .7 : .66), { font: 'mono', weight: 800, size: pray ? 72 : p.hero ? 56 : 40, align: 'center', color: INK.ink });
      ctx.restore();
    });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .1; for (let y = top - 10; y < WB; y += 6) fillPts(ctx, rect(WX, y, WW, 2), INK.white, false); ctx.restore();
    // counter
    const cx = 1735, bump = hit(t, LOGS.map(p => p.T), 18);
    ink(ctx, rrect(cx - 105, 70, 210, 250, 16), { fill: INK.ink, line: 5, boil: .6, smooth: false });
    txt(ctx, 'console', cx, 120, { font: 'mono', weight: 800, size: 34, color: INK.paper, align: 'center' });
    txt(ctx, '.log', cx, 160, { font: 'mono', weight: 800, size: 34, color: INK.paper, align: 'center' });
    txt(ctx, String(n), cx, 290, { font: 'mono', weight: 800, size: 120 * (1 + .14 * bump), color: n >= 46 ? INK.orange : INK.yellow, align: 'center' });
    // the rabbit counts on its paws, loses count, gives up
    const f = tc > 20.66 && tc < last, done = tc >= last, cnt = n % 3;
    rabbit(ctx, 1735, 1010, 32, { turn: -.5, lx: -.9, ly: done ? -.9 : -.4 + .5 * wob(tc, 2), eyes: f ? 'wide' : 'open', lids: done ? .5 : 0, mouth: done ? 'flat' : f ? 'wavy' : 'o', open: .3, sweat: f ? .8 : 0,
      armL: { a: 70 + (f ? wob(tc, 6) * 25 : 0), e: 80 }, armR: { a: 70 + (f ? wob(tc, 6, .5) * 25 : 0), e: 80 }, pawL: ['point', 'open', 'thumb'][cnt], pawR: ['open', 'point', 'fist'][cnt],
      earL: { a: -12, b: done ? -60 : 0 }, earR: { a: 12, b: done ? 20 : 0 } });
    ctx.restore();
    calmLeft(ctx, .5, 950);
  }

  // ================= 8 · LEFT IN THE MIX (21.70-23.40) =================
  function dj(ctx, t) {
    const tc = twos(t), p = pulse(t, 7);
    depth(ctx, 7, c => { cam(c, 1330, 470, 1.22); burrow(c, t, { mood: 'party', pinsFocus: true, fg: false, screen: onScreen((s, vw, vh) => { fillPts(s, rect(0, 0, vw, vh), INK.ink, false); for (let i = 0; i < 12; i++) { const hh = vh * .8 * (.2 + .8 * Math.abs(noise1(t * 6 + i * 3.1))) * (.5 + .5 * p); fillPts(s, rect(80 + i * 128, vh - 40 - hh, 96, hh), i % 3 ? INK.pink : INK.yellow, false); } }) }); c.restore(); });
    // party beams
    ctx.save(); ctx.globalAlpha = .2 + .15 * p;
    for (let i = 0; i < 3; i++) { const a = wob(t, .35, i * .33) * .5 + (i - 1) * .35, x0 = 1000 + i * 380; fillPts(ctx, [[x0 - 20, -20], [x0 + 20, -20], [x0 + Math.sin(a) * 1300 + 160, 1200], [x0 + Math.sin(a) * 1300 - 160, 1200]], i === 1 ? INK.yellow : INK.pink, false); }
    ctx.restore();
    // the DJ: nods on the beat, one paw on the headphones, the other riding a fader
    const pt = pulse(tc, 6), fad = .5 + .5 * wob(tc, .6), hd = wob(tc, 1.2) * 6;
    const A = rabbit(ctx, 1400, 905, 46, { nod: .45 * pt, tilt: hd, lean: 3 * pt, eyes: 'happy', mouth: 'grin', blush: .5, sq: .06 * pt,
      armL: { a: 140, e: 110 }, pawL: 'mitt', armR: { a: 4 + 10 * fad, e: 2 + 12 * fad }, pawR: 'fist', earL: { a: -14, b: -22 * pt }, earR: { a: 12, b: 22 * pt } });
    headphones(ctx, A, 46, hd + (.45 * pt) * 0);
    // the mixing console, channel strips taped "console.log"
    const top = 790, poly = [[960, top], [1880, top], [1940, 1100], [900, 1100]];
    ink(ctx, poly, { fill: '#2A2638', shade: { color: INK.ink, spacing: 14, dir: [0, 1], from: 0, to: 300 }, line: 6, boil: .8, smooth: false });
    const faderX = A.pawR[0];
    for (let i = 0; i < 8; i++) {
      const x = 995 + i * 110, lv = clamp(pt * (.55 + .45 * hash(i + beatN(t) * 7)) + .12 * noise1(t * 9 + i)), mine = Math.abs(x + 44 - faderX) < 55;
      for (let j = 0; j < 9; j++) fillPts(ctx, rect(x, top + 170 - j * 17, 28, 12), j / 9 < lv ? (j > 7 ? INK.red : j > 5 ? INK.yellow : INK.green) : '#3E3A50', false);
      fillPts(ctx, rect(x + 42, top + 24, 8, 160), INK.ink, false);
      const fy = mine ? clamp(A.pawR[1] - 12, top + 24, top + 170) : top + 30 + hash(i * 2.7) * 120;
      ink(ctx, rect(x + 28, fy, 36, 24), { fill: INK.paper, line: 3, boil: .4, smooth: false });
    }
    ink(ctx, [[930, top + 200], [1905, top + 200], [1910, top + 250], [925, top + 250]], { fill: '#EFE3C0', line: 3, boil: .6, smooth: false });
    for (let i = 0; i < 8; i++) txt(ctx, 'console.log', 1039 + i * 110, top + 233, { font: 'hand', weight: 800, size: 17, color: INK.ink, align: 'center', rot: (hash(i) - .5) * .1 });
    ink(ctx, rrect(1160, 1000, 540, 66, 10), { fill: INK.paper, line: 4, boil: .5, smooth: false });
    txt(ctx, 'console.log \u00D7 46', 1430, 1048, { font: 'mono', weight: 800, size: 46, color: INK.ink, align: 'center' });
    // the paw in front of the console top, on its fader
    ink(ctx, ell(A.pawR[0], A.pawR[1], 26, 23, 16), { fill: INK.fur, line: 4, boil: .8 });
    calmLeft(ctx, .75, 1000);
  }

  // ================= 9 · A SECRET KEY COMMITTED (23.40-25.55) =================
  const KEYEND = [1240, 235, 430, -.14];
  const KEYLINE = '+ STRIPE_SECRET_KEY = "sk_live_HOPHOPNOPE_4f9\u2026"';
  function secretKey(ctx, t) {
    const SE = wt(6, 1), K = wt(6, 2), CM = wt(6, 3), tc = tw(t, at(CM));
    const scroll = 900 * Math.pow(1 - easeOut(seg(t, 23.4, at(SE))), 1);
    const [qx, qy] = shake(t, 16 * hit(t, [CM], 9));
    const push = easeInOut(seg(t, at(CM) + .1, 25.55));
    cam(ctx, lerp(960, 1040, push) + qx, 540 + qy, lerp(1, 1.06, push));
    fillPts(ctx, rect(-200, -200, W + 400, H + 400), INK.white, false);
    const LH = 92, ky = 420;
    depth(ctx, 8, c => { cam(c, lerp(960, 1040, push) + qx, 540 + qy, lerp(1, 1.06, push));
      const lines = fakeDiff(24, 9); for (let i = -8; i < 12; i++) { if (!i) continue; const y = ky + i * LH - scroll; const [k2, s2] = lines[mod(i + 8, 24)]; fillPts(c, rect(-100, y, 2200, LH), k2 === '@' ? '#E9E5F2' : '#E4F2E8', false);
        txt(c, String(311 + i), 150, y + LH * .66, { font: 'mono', weight: 600, size: 40, color: '#B4AEBE', align: 'right' }); txt(c, (k2 === '@' ? '' : k2 + ' ') + s2, 190, y + LH * .66, { font: 'mono', weight: 700, size: 46, color: '#9CC9AE' }); }
      c.restore(); });
    const hl = seg(t, at(SE), at(SE) + .1), y = ky - scroll;
    fillPts(ctx, rect(-100, y, 2200, LH), mix('#D8F3E1', INK.yellow, .55 * hl), false);
    fillPts(ctx, rect(-100, y, 22, LH), INK.green, false);
    inkLine(ctx, [[-100, y], [2200, y]], 4, INK.ink, { taper: [0, 0] }); inkLine(ctx, [[-100, y + LH], [2200, y + LH]], 4, INK.ink, { taper: [0, 0] });
    txt(ctx, '311', 150, y + LH * .68, { font: 'mono', weight: 700, size: 44, color: '#6E6A78', align: 'right' });
    txt(ctx, KEYLINE, 190, y + LH * .7, { font: 'mono', weight: 800, size: 58, color: '#0E6B3A' });
    ctx.restore();
    // the golden key rises out of the string
    const kk = backOut(seg(t, at(K), at(K) + .22), 2.2);
    if (kk > 0) {
      const [kx, ky2, ks, kr] = KEYEND, x = lerp(1500, kx, kk), yy = lerp(y + 46, ky2, kk), bob = wob(t, .7) * 8 * kk;
      inkLine(ctx, [[x + 40, yy + 60 + bob], [1500, y + 10]], 4, rgba(INK.ink, .5 * kk), { taper: [.3, .3] });
      goldKey(ctx, x, yy + bob, ks * kk, kr * kk + wob(tc, .8) * .03);
      for (let i = 0; i < 4; i++) sparkle(ctx, x + [-200, 120, 190, -40][i], yy + [-90, -70, 70, 90][i], 40, clamp(Math.sin((tc * 3 + i * .27) * PI)) * kk, i);
    }
    // the rabbit peeks up from the bottom right: rabbit-sense
    const peek = easeOut(seg(tc, 23.45, 23.8)), alarm = t >= at(CM);
    const A = rabbit(ctx, 1640 + (alarm ? shake(t, 4)[0] : 0), 1480 - peek * 180, 64, { turn: -.4, lx: -.6, ly: -.5, eyes: 'wide', mouth: alarm ? 'frown' : 'o', open: .4, brows: alarm ? -.2 : .5, browTilt: alarm ? -1.5 : 0, sweat: alarm ? .7 : 0,
      sense: t >= at(K) ? 1 : 0, earL: { a: -6 + (alarm ? shake(t, 3)[0] : 0), b: 0 }, earR: { a: 6 + (alarm ? shake(t, 3)[1] : 0), b: 0 }, noShadow: true });
    stamp(ctx, 'CRITICAL', 1010, 650, 150, t - at(CM), { color: INK.red, rot: -.09 });
    if (hit(t, [CM], 20) > .3) misregFrame(ctx, 12 * hit(t, [CM], 20));
  }

  // ================= 10 · PLAIN AS DAY (25.55-27.30) =================
  function plainAsDay(ctx, t) {
    const tc = twos(t), pull = easeInOut(seg(t, 25.55, 26.45));
    const BK = [1020, 330, 300, KEYEND[3]];                             // key on the billboard (world); the shot opens matched on shot 9's key
    const [kx, ky, ks, kr] = KEYEND, z0 = ks / BK[2], z = lerp(z0, 1, pull);
    const cx = lerp(BK[0] - (kx - 960) / z0, 960, pull), cy = lerp(BK[1] - (ky - 540) / z0, 540, pull);
    cam(ctx, cx, cy, z);
    sunburst(ctx, 360, 240, INK.yellow, mix(INK.yellow, INK.orange, .45), t * .08, 22);
    ctx.save(); clipPts(ctx, rect(-2000, -2000, 6000, 6000), false); dotsIn(ctx, [-600, -600, 2600, 1600], { spacing: 40, color: rgba(INK.orange, .5), c: [360, 240], dir: [.7, .7], from: 200, to: 2000, min: 0, max: .7 }); ctx.restore();
    ink(ctx, ell(360, 240, 150, 150, 40), { fill: INK.white, shade: { color: INK.yellow, spacing: 16, dir: [.6, .8], from: -40, to: 160 }, line: 6, boil: 1.2 });
    // skyline, flat ink
    for (let i = 0; i < 12; i++) { const x = -200 + i * 190, h = 180 + hash(i * 4.4) * 360; ink(ctx, rect(x, 1080 - h, 170, h + 200), { fill: i % 2 ? '#2A2638' : INK.ink, line: 0, boil: 0, smooth: false });
      for (let j = 0; j < 8; j++) if (hash(i * 9 + j) > .5) fillPts(ctx, rect(x + 20 + (j % 3) * 50, 1100 - h + Math.floor(j / 3) * 60, 26, 30), mix(INK.yellow, INK.ink, .35), false); }
    // the billboard on its rooftop, floodlit at noon for good measure
    fillPts(ctx, rect(760, 700, 1080, 500), INK.ink, false);
    for (const x of [860, 1300, 1740]) inkLine(ctx, [[x, 640], [x, 720]], 18, INK.ink, { taper: [0, 0], smooth: false });
    uiBox(ctx, 740, 90, 1120, 540, { fill: INK.white, shadow: 18, line: 8, r: 6 });
    ctx.save(); ctx.globalAlpha = .3; for (const x of [900, 1300, 1700]) fillPts(ctx, [[x - 14, 40], [x + 14, 40], [x + 190, 600], [x - 190, 600]], INK.yellow, false); ctx.restore();
    for (const x of [900, 1300, 1700]) { inkLine(ctx, [[x, 90], [x, 30]], 8, INK.ink, { taper: [0, 0], smooth: false }); ink(ctx, [[x - 34, 0], [x + 34, 0], [x + 24, 44], [x - 24, 44]], { fill: INK.ink, line: 4, boil: .6, smooth: false }); fillPts(ctx, rect(x - 22, 38, 44, 10), INK.white, false); }
    goldKey(ctx, BK[0], BK[1], BK[2], BK[3]);
    txt(ctx, 'sk_live_', 1200, 300, { font: 'mono', weight: 800, size: 78, color: '#6E6A78' });
    txt(ctx, 'HOPHOPNOPE', 1200, 395, { font: 'mono', weight: 800, size: 78, color: INK.ink });
    txt(ctx, '_4f9\u2026', 1200, 490, { font: 'mono', weight: 800, size: 78, color: INK.ink });
    for (let i = 0; i < 4; i++) sparkle(ctx, BK[0] + [-170, 100, 150, -30][i], BK[1] + [-70, -60, 60, 70][i], 30, clamp(Math.sin((tc * 2.5 + i * .25) * PI)), i);
    ctx.restore();
  }

  // ================= 11 · THE TESTS ALL PASS (27.30-28.72) =================
  const CHECKS = [['build', 27.446], ['lint', 27.864], ['unit tests', 28.282], ['e2e', 28.70]];
  function ciPanel(ctx, t, o = {}) {
    const x = 960, y = 130, w = 740;
    uiBox(ctx, x, y, w, 820, { fill: INK.white, shadow: 16, line: 6, r: 14 });
    ink(ctx, ell(x + 72, y + 92, 44, 44, 24), { fill: INK.green, line: 5, boil: .5 });
    txt(ctx, '\u2713', x + 72, y + 114, { font: 'ui', weight: 900, size: 60, color: INK.white, align: 'center' });
    txt(ctx, 'All checks have passed', x + 134, y + 110, { font: 'ui', weight: 800, size: 52, color: INK.ink });
    txt(ctx, '412 successful checks', x + 134, y + 166, { font: 'ui', weight: 600, size: 34, color: '#6E6A78' });
    CHECKS.forEach(([s, T], i) => {
      const g = t - at(T), k = o.all ? 1 : backOut(clamp(g / .14), 3); if (k <= 0) return;
      const yy = y + 290 + i * 130;
      ctx.save(); ctx.translate(x + 90, yy); ctx.scale(k, k);
      ink(ctx, ell(0, 0, 40, 40, 22), { fill: INK.green, line: 5, boil: .5 }); txt(ctx, '\u2713', 0, 21, { font: 'ui', weight: 900, size: 56, color: INK.white, align: 'center' });
      ctx.restore();
      txt(ctx, s, x + 160, yy + 22, { font: 'ui', weight: 700, size: 60, color: INK.ink, alpha: clamp(k) });
      txt(ctx, 'Successful in 0s', x + w - 40, yy + 16, { font: 'ui', weight: 600, size: 30, color: '#6E6A78', align: 'right', alpha: clamp(k) });
    });
  }
  function testsPass(ctx, t) {
    const tc = twos(t), n = CHECKS.filter(([, T]) => t >= at(T)).length;
    earthWall(ctx, [0, 0, W, H]);
    const z = 1 + .03 * seg(t, 27.3, 28.72), p = hit(t, CHECKS.map(c => c[1]), 10);
    cam(ctx, 960, 540, z * (1 + .01 * p));
    ciPanel(ctx, t);
    // confetti
    for (let i = 0; i < 40; i++) { const t0 = 27.35 + hash(i) * 1.2, g = t - t0; if (g < 0) continue; const x = 980 + hash(i * 3) * 900 + wob(g, .8, i) * 40, y = -40 + g * (380 + hash(i * 7) * 300);
      ctx.save(); ctx.translate(x, y); ctx.rotate(g * 6 + i); fillPts(ctx, rect(-10, -6, 20, 12), [INK.orange, INK.yellow, INK.green][i % 3], false); ctx.restore(); }
    ctx.restore();
    const relax = n / 4;
    rabbit(ctx, 1790, 1040, 30, { turn: -.4, lean: -8 * relax, eyes: relax > .6 ? 'happy' : 'open', lids: .2 * relax, mouth: 'smile', blush: .5 * relax,
      armL: { a: lerp(10, 150, relax), e: lerp(10, 120, relax) }, armR: { a: lerp(10, 150, relax), e: lerp(10, 120, relax) }, earL: { a: -14 - 10 * relax, b: -20 * relax }, earR: { a: 12 + 12 * relax, b: 25 * relax } });
    calmLeft(ctx, .5, 950);
  }

  // ================= 12 · 'CAUSE THEY'RE SKIPPED ANYWAY (28.72-30.10) =================
  const SKIPS = ['describe.skip(() => {', "  it.skip('works')", "  xit('really works')", "  it.skip('null')", '});'];
  function checkStandee(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ink(ctx, rect(-8, -s * .9, 16, s * .9), { fill: '#B07A48', line: 4, boil: .6, smooth: false });
    const c = [[-.55, -.35], [-.25, -.62], [-.05, -.35], [.5, -1.05], [.8, -.8], [-.05, .12]].map(([a, b]) => [a * s, b * s - s * .75]);
    fillPts(ctx, c.map(([a, b]) => [a + 10, b + 6]), '#8A5A34', false);
    ink(ctx, c, { fill: INK.green, shade: { color: rgba(INK.ink, .25), spacing: 12, dir: [.5, .85], from: -s * .3, to: s * .5 }, line: 5, boil: .8, smooth: false });
    ctx.restore();
  }
  function skipped(ctx, t) {
    const SK = wt(7, 6), AN = wt(7, 7), tc = tw(t, at(SK));
    earthWall(ctx, [0, 0, W, H]);
    const z = lerp(1.06, 1, easeOut(seg(t, 28.72, 29.1)));
    cam(ctx, 1000, 540, z);
    // the test file behind the standees
    uiBox(ctx, 980, 110, 860, 640, { fill: '#15141C', shadow: 14, line: 6, r: 12 });
    fillPts(ctx, rrect(983, 113, 854, 56, 10), '#262434', false); txt(ctx, 'payments.test.ts', 1410, 152, { font: 'mono', weight: 700, size: 30, color: '#A8A4B8', align: 'center' });
    SKIPS.forEach((s, i) => { const f = { font: 'mono', weight: 800, size: 56 }; txt(ctx, s, 1015, 250 + i * 74, { ...f, color: INK.paper });
      const m = s.match(/\.skip|xit/); if (m) { const pre = measure(ctx, s.slice(0, m.index), f).w; txt(ctx, m[0], 1015 + pre, 250 + i * 74, { ...f, color: INK.yellow }); } });
    const res = backOut(seg(t, at(AN), at(AN) + .16), 2.2);
    if (res > 0) { ctx.save(); ctx.translate(1410, 660); ctx.scale(res, res); txt(ctx, '0 passed \u00B7 412 skipped', 0, 0, { font: 'mono', weight: 800, size: 60, color: INK.yellow, align: 'center', stroke: { w: 8, color: INK.ink } }); ctx.restore(); }
    // floor
    fillPts(ctx, rect(-200, 880, 2400, 400), EARTH2, false); inkLine(ctx, [[-200, 882], [2400, 882]], 6, INK.ink, { taper: [0, 0] });
    // cardboard checks on sticks, toppling like dominoes from the poke
    for (let i = 4; i >= 0; i--) { const t0 = at(SK) + i * .09, g = t - t0, fall = g < 0 ? 0 : Math.min(1, easeIn(g / .2)) * (PI / 2 - .12 * (i < 4 ? 1 : 0)) - (g > .2 ? .08 * Math.exp(-(g - .2) * 12) * Math.sin((g - .2) * 40) : 0);
      checkStandee(ctx, 1150 + i * 150, 885, 290, fall); }
    ctx.restore();
    const poke = seg(tc, at(SK) - .2, at(SK)), back = seg(tc, at(SK) + .1, at(SK) + .3);
    rabbit(ctx, 970, 1000, 30, { turn: .5, lx: .8, ly: -.2, lean: 8 * poke * (1 - back), armR: { a: 90 * poke * (1 - back) + 10, e: 0 }, pawR: 'point', armL: { a: 10, e: 20 },
      eyes: t > at(AN) ? 'open' : 'open', lids: t > at(AN) ? .5 : 0, mouth: t > at(AN) ? 'flat' : 'smile', earL: { a: -12, b: t > at(AN) ? -70 : 0 }, earR: { a: 12, b: 0 } });
    calmLeft(ctx, .5, 950);
  }

  // ================= 13 · THE PEN (30.10-32.09) =================
  const COUNT = [31.44, 31.65, 31.86], CRACK = 30.567, ROLL = 30.817;
  // where the rig puts a paw for given arm angles (standing, no lean): for smear multiples without redrawing the rabbit
  const pawAt = (x, y, s, side, a, e) => { const d1 = [side * Math.sin(deg(a)), Math.cos(deg(a))], d2 = [side * Math.sin(deg(a + e)), Math.cos(deg(a + e))];
    return [x + s * (side * 1.62 + d1[0] * 1.5 + d2[0] * 1.67), y + s * (-4.85 + d1[1] * 1.5 + d2[1] * 1.67)]; };
  const writeArm = t => [16 + 12 * wob(t, 6.5), -58 + 34 * wob(t, 9.5, .3)];
  function pen(ctx, t) {
    const tc = twos(t), n = COUNT.filter(T => t >= at(T)).length, RX = 960, RY = 1000, RS = 62;
    const size = 66, f = { font: 'ui', weight: 800, size }, hy = 150;
    const lw = measure(ctx, 'Actionable comments posted: ', f).w, tot = lw + measure(ctx, '3', { ...f, weight: 900, size: size * 1.25 }).w, x0 = 960 - tot / 2;
    const N = [x0 + lw + size * .42, hy - size * .44];                                     // centre of the counter's digit
    const push = kf(t, [[30.16, 0], [30.3, 1], [30.42, 1], [30.5, 0]], easeInOut), punch = expoIn(seg(t, at(COUNT[2]) + .04, 32.085)), pz = lerp(1, 18, punch);
    let C = [lerp(960, 1010, push), lerp(540, 330, push), 1 + .32 * push];
    if (punch > 0) { const k = smooth(clamp(punch * 1.6)), s = [lerp(N[0], 960, k), lerp(N[1], 540, k)]; C = [N[0] - (s[0] - 960) / pz, N[1] - (s[1] - 540) / pz, pz]; }
    const [qx, qy] = shake(t, 10 * hit(t, [CRACK, ...COUNT], 12));
    C[0] += qx / C[2]; C[1] += qy / C[2];
    depth(ctx, 8, c => { cam(c, ...C); cam(c, 1200, 520, 1.5); burrow(c, t, { pinsFocus: true, fg: false }); c.restore(); c.restore(); });
    cam(ctx, ...C);
    // the rabbit, behind its desk
    const reach = seg(tc, 30.1, 30.26), pluck = t >= at(30.3), twirl = seg(t, at(30.3), 30.48), crack = t >= at(CRACK) - .1 && t < at(CRACK) + .2, writing = t >= at(ROLL);
    let pose = { eyes: 'open', mouth: 'smirk', brows: -.1, browTilt: 1.2, lids: .2, earL: { a: -10, b: 0 }, earR: { a: 10, b: 0 }, pen: !pluck, noShadow: true };
    const [wa, we] = writeArm(t);
    if (!pluck) pose = { ...pose, tilt: 12 * reach, armR: { a: lerp(10, 168, easeOut(reach)), e: lerp(20, -30, reach) }, pawR: 'mitt', lx: .6 * reach, ly: -.6 * reach };
    else if (crack) { const c2 = t >= at(CRACK); pose = { ...pose, armL: { a: 62, e: c2 ? -115 : -142 }, armR: { a: 62, e: c2 ? -115 : -142 }, pawL: 'fist', pawR: 'fist', eyes: 'closed', mouth: 'grin', sq: c2 ? .12 : -.05, lean: c2 ? -4 : 0 }; }
    else if (writing) pose = { ...pose, lx: .2 * wob(tc, 6.5), ly: .95, nod: .3, armR: { a: wa, e: we }, pawR: 'fist', armL: { a: 12, e: 25 }, pawL: 'mitt', mouth: 'open', open: .25, sweat: .6, brows: -.3, browTilt: 1.6 };
    else pose = { ...pose, armR: { a: 150 - 40 * twirl, e: 40 }, pawR: 'fist', armL: { a: 20, e: 30 }, lx: .5, ly: -.5 };
    const A = rabbit(ctx, RX, RY, RS, pose);
    // desk and draft
    ink(ctx, [[260, 830], [1660, 830], [1800, 1120], [120, 1120]], { fill: '#8A5A34', shade: { color: '#4A2C18', spacing: 14, dir: [0, 1], from: 0, to: 300 }, line: 6, boil: 1, smooth: false });
    ink(ctx, [[600, 850], [1260, 850], [1300, 1070], [560, 1070]], { fill: INK.white, line: 4, boil: .6, smooth: false });
    const wr = seg(t, at(ROLL), at(COUNT[2]));
    for (let i = 0; i < 5; i++) { const lk = clamp(wr * 5.2 - i); if (lk <= 0) continue; const y = 900 + i * 36, x1 = lerp(630, 1230, lk);
      inkLine(ctx, [[630, y], ...Array.from({ length: 12 }, (_, j) => [lerp(630, x1, (j + 1) / 12), y + Math.sin(j * 2.3 + i * 1.7) * 7])], 5, INK.red, { taper: [0, .15] }); }
    // three comment-bunnies hop off the page, one per count
    COUNT.forEach((T, i) => { const g = t - at(T) + .02; if (g < 0) return; const k = clamp(g / .3), x = lerp(820 + i * 90, 1380 + i * 125, easeOut(k)), y = lerp(930, 846, k) - Math.sin(k * PI) * 200, sq = k >= 1 ? .3 * Math.exp(-(g - .3) * 12) : -.15 * Math.sin(k * PI);
      commentBunny(ctx, x, y, 105 * backOut(clamp(g / .1), 3), { sq, eyes: k >= 1 ? 'happy' : 'wide', hop: k >= 1 ? 2 * Math.max(0, Math.sin((t - at(T) - .3) * 14)) * Math.exp(-(t - at(T) - .3) * 5) : 0 }); });
    // paws and pen on top of the desk: smear multiples while it scribbles
    if (writing) {
      const ghosts = punch > 0 ? [0] : [2, 1, 0];
      for (const g of ghosts) { const tt = t - g / 24, [ga, ge] = writeArm(tt), P = g ? pawAt(RX, RY, RS, 1, ga, ge) : A.pawR;
        ctx.save(); ctx.globalAlpha = g ? .35 / g : 1; penAt(ctx, P[0], P[1], RS, deg(112 + 10 * wob(tt, 6.5))); ink(ctx, ell(P[0], P[1], 30, 27, 16), { fill: INK.fur, line: g ? 0 : 4.5, boil: .8 }); ctx.restore(); }
      ink(ctx, ell(A.pawL[0], Math.max(A.pawL[1], 862), 30, 25, 16), { fill: INK.fur, line: 4.5, boil: .8 });
      if (punch < .3) speedLines(ctx, A.pawR[0] - 40, A.pawR[1] + 110, { n: 22, r0: 90, r1: 240, w: 5, color: INK.ink });
    } else if (pluck && !crack) {
      penAt(ctx, A.pawR[0], A.pawR[1], RS, -PI / 2 - twirl * TAU * 1.5);
      if (t < at(30.3) + .12) sparkle(ctx, A.pawR[0] + 20, A.pawR[1] - 150, 50, 1 - (t - at(30.3)) / .12);
    }
    if (crack) { sfx(ctx, 'KRAK!', 1270, 600, 110, t - at(CRACK), { rot: -.12, life: .3 }); if (t >= at(CRACK)) krackle(ctx, RX, 770, 120, { n: 18, size: 12 }); }
    // the counter: 0 -> 1 -> 2 -> 3 on the last snare hits
    const bump = hit(t, COUNT, 12), show = backOut(seg(t, at(ROLL), at(ROLL) + .14), 2.4);
    if (show > 0) { ctx.save(); ctx.translate(960, hy - size * .4); ctx.scale(show, show); ctx.translate(-960, -(hy - size * .4));
      ink(ctx, rrect(x0 - 50, hy - size * 1.25, tot + 100, size * 1.8, 18), { fill: INK.white, line: 5, boil: .6, smooth: false });
      countHeader(ctx, x0, hy, n, { size, numScale: 1.25 * (1 + .35 * bump), stroke: n > 0 }); ctx.restore(); }
    ctx.restore();
    if (punch > .35) misregFrame(ctx, 16 * punch);
  }

  chapter('verse1', 10.45, 32.09, [
    [10.45, ping], [12.0, ears], [13.4, smallFix], [14.45, fourteen], [16.9, ternary], [18.1, fixTower],
    [19.7, consoleLogs], [21.7, dj], [23.4, secretKey], [25.55, plainAsDay], [27.3, testsPass], [28.72, skipped], [30.1, pen],
  ]);
})();
