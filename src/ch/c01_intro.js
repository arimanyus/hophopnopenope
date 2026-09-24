// c01_intro.js: the hook (0.00-10.45). Ping, the watch, the meadow hole, the vortex fall, the AI timeline rushing up
// the hole, and the crash-landing in the burrow chair.
(() => {
  const D2R = Math.PI / 180, FR = 1 / 24;
  const onF = x => Math.floor(x * 24 + 1e-6) / 24;               // first frame that contains a sound at x
  const W1 = LINES[1].words;
  const STAB = onF(.19), DIVE = 4.30, DROP = 5.28, CUT_LAND = 10.20;
  // 2nd tick: vocal-stem onset (LINES has 6.73, which is dead silence in the mix)
  const TICK1 = onF(W1[4].a), TICK2 = onF(6.80), TOCK = onF(W1[6].a);
  // dead-silent gaps of the stop-time: the whole fall holds still
  const FREEZE = [[6.49, 6.77], [7.10, 7.23]];
  // hat/snare hits of the build (no-vocals stem): quarters, then eighths, then sixteenths
  const CARD_T = [7.872, 8.29, 8.737, 9.166, 9.375, 9.59, 9.802, 9.91, 10.014, 10.121].map(onF);
  const PINCH = [9.99, 10.19], LAND = onF(10.34);
  const te = t => { let d = 0; for (const [a, b] of FREEZE) d += clamp(t - a, 0, b - a); return t - d; };
  const isFrozen = t => FREEZE.some(([a, b]) => t >= a && t < b);
  const WARM = mix(INK.ink, INK.orangeDk, .2), BRASS = mix(INK.yellow, INK.orangeDk, .28), BRASS_DK = mix(INK.orangeDk, INK.ink, .25);
  const GROUND = mix(INK.orangeDk, INK.ink, .32), GRASS = mix(INK.ink, INK.orangeDk, .18);

  // ---------------------------------------------------------------- 0.00 PING (the thumbnail)
  function earTips(ctx, t) {
    const up = kf(t, [[0, .6], [.083, 1.12], [.125, .96], [.16, 1]]), vib = Math.sin(boilN(t) * 2.1) * 3;
    const A = rabbit(ctx, 470, 1905 + (1 - up) * 190, 78, { earL: { a: -10 + vib, b: 0, len: lerp(.92, 1.04, up) }, earR: { a: 10 - vib, b: 0, len: lerp(.92, 1.04, up) }, noShadow: true });
    for (const [e, sd] of [[A.earL, -1], [A.earR, 1]]) for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + sd * (.55 + i * .42), pts = [];
      for (let j = 0; j <= 6; j++) { const r = lerp(78, 160, j / 6), w = Math.sin(j * 2.3 + boilN(t) * 1.7 + i) * 8; pts.push([e[0] + Math.cos(a) * r - Math.sin(a) * w, e[1] + Math.sin(a) * r + Math.cos(a) * w]); }
      inkLine(ctx, pts, 10, INK.paper, { taper: [.1, .5] });
    }
  }
  function ping(ctx, t) {
    const S = kf(t, [[0, 1.15], [.083, .982], [.125, 1]], x => x), imp = t > .07 ? Math.exp(-(t - .083) * 25) : 0, [sx, sy] = shake(t, 12 * imp);
    const cx = 930, cy = 455, s = 1.32 * S, rot = -.07;
    const bx = cx + s * (470 * Math.cos(rot) + 140 * Math.sin(rot)), by = cy + s * (470 * Math.sin(rot) - 140 * Math.cos(rot));
    fillPts(ctx, rect(0, 0, W, H), INK.night, false);
    depth(ctx, 8, c => {
      dotsIn(c, [0, 0, W, H], { spacing: 34, color: INK.nightLt, k: (x, y) => .2 + .75 * clamp(Math.hypot(x - cx, (y - cy) * 1.7) / 1150) });
      speedLines(c, cx, cy, { n: 60, r0: 780, r1: 1900, w: 16, color: INK.nightLt, seed: 3 });
    });
    ctx.save(); ctx.translate(sx, sy);
    earTips(ctx, t);
    for (let j = 0; j < 3; j++) {
      const r = 90 * s + (t + j * .16) * 1500, a = clamp(1.25 - r / 1100);
      if (a > .02) { ctx.save(); ctx.globalAlpha = clamp(a); outline(ctx, ell(bx, by, r, r, 72), 18 * (1 - r / 1500) + 5, INK.cyan, { seed: j }); ctx.restore(); }
    }
    // slam multiples: where the card was a frame ago
    if (t < .07) for (const [k, a] of [[1.2, .3], [1.1, .5]]) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * 1.4); ctx.scale(s * k, s * k); ctx.globalAlpha = a; outline(ctx, rrect(-500, -150, 1000, 300, 26), 9 / (s * k), INK.paper, { smooth: false }); ctx.restore(); }
    toast(ctx, cx, cy, s, { rot });
    ctx.save(); ctx.globalAlpha = .9; outline(ctx, ell(bx, by, 62 * s + 14 + t * 90, 62 * s + 14 + t * 90, 40), 7, INK.cyan); ctx.restore();
    if (imp > .3) krackle(ctx, bx, by, 150 * s, { n: 22, size: 16, color: INK.cyan, seed: 5 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- 0.19 THE WATCH (+ the hook 1.36)
  const LIDA = [104, 176, 150, 171, 161, 167];
  function lidAngle(t) {
    const f = Math.round((t - STAB) * 24);
    if (f < LIDA.length) return LIDA[Math.max(0, f)];
    const back = t - 1.36;
    return lerp(166, 97, easeInOut(seg(t, 1.12, 1.36))) + (back > 0 ? 5 * Math.sin(back * 20) * Math.exp(-back * 6) : 0);
  }
  // the lid, hinged at the case's left edge; ang 0 = shut, 90 = edge-on, 180 = folded flat to the left
  function lid(c, r, ang, ghost) {
    const k = Math.cos(ang * D2R), hx = -r * 1.05, P = pts => pts.map(([x, y]) => [hx + (x - hx) * k, y]);
    if (ghost) { c.save(); c.globalAlpha = ghost; fillPts(c, P(ell(0, 0, r * 1.06, r * 1.06, 40)), INK.orangeLt); c.restore(); return; }
    if (k >= 0) {
      ink(c, P(ell(0, 0, r * 1.06, r * 1.06, 40)), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 14, dir: [.55, .83], from: -r * .2, to: r }, line: r * .035, boil: .8 });
      outline(c, P(ell(0, 0, r * .7, r * .7, 30)), r * .018, INK.orangeDk);
    } else {
      ink(c, P(ell(0, 0, r * 1.06, r * 1.06, 40)), { fill: BRASS, shade: { color: BRASS_DK, spacing: 14, dir: [.6, .8], from: -r * .1, to: r }, line: r * .035, boil: .8 });
      outline(c, P(ell(0, 0, r * .9, r * .9, 36)), r * .016, BRASS_DK);
    }
  }
  // the rabbit's paw holding the watch from below (u = r / 100, origin = the watch centre)
  function paw(c, r, front) {
    const u = r / 100, fur = { fill: INK.fur, shade: { color: INK.furShade, spacing: 13, dir: [.45, .9], from: 0, to: 40 * u }, line: 7, boil: 1.2 };
    if (!front) {
      ink(c, [[-150 * u, 600 * u], [-98 * u, 168 * u], [104 * u, 168 * u], [168 * u, 600 * u]], { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 14, dir: [.6, .8], from: 0, to: 240 * u }, line: 7, boil: 1.4, seed: 4 });
      inkLine(c, [[-36 * u, 250 * u], [-24 * u, 460 * u]], 5, INK.orangeDk, { taper: [.2, .4] });
      ink(c, rrect(-112 * u, 150 * u, 226 * u, 46 * u, 16 * u), { fill: INK.orangeDk, line: 6, boil: 1, smooth: false });
      ink(c, ell(0, 112 * u, 112 * u, 58 * u, 28), { ...fur, seed: 5 });
      return;
    }
    // one mitt wrapped over the front of the case (bumpy finger tips), the thumb pressing on its left side
    const m = [], n = 32;
    for (let i = 0; i <= n; i++) { const k = i / n, a = lerp(46, 134, k) * D2R, r0 = 86 - 11 * Math.pow(Math.abs(Math.sin(k * Math.PI * 4)), .6) * (1 - Math.pow(Math.abs(k - .5) * 2, 4)); m.push([Math.cos(a) * r0 * u, Math.sin(a) * r0 * u]); }
    for (let i = n; i >= 0; i--) { const a = lerp(46, 134, i / n) * D2R; m.push([Math.cos(a) * 128 * u, Math.sin(a) * 128 * u]); }
    ink(c, m, { ...fur, seed: 6 });
    for (const k of [.25, .5, .75]) { const a = lerp(46, 134, k) * D2R; inkLine(c, [[Math.cos(a) * 84 * u, Math.sin(a) * 84 * u], [Math.cos(a) * 104 * u, Math.sin(a) * 104 * u]], 6, INK.ink, { taper: [.05, .6] }); }
    ink(c, xform(ell(0, 0, 17 * u, 38 * u, 18), -97 * u, 50 * u, 1, .5), { ...fur, seed: 11 });
  }
  function watchAt(ctx, t, x, y, r, rot, ang, ghosts) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    paw(ctx, r, false);
    if (Math.cos(ang * D2R) < 0) lid(ctx, r, ang);
    ctx.restore();
    const ticks = Math.max(0, beatN(t) - beatN(STAB));
    pocketWatch(ctx, x, y, r, { secs: clockSecs(16, 58, 30) + ticks, left: 90, rot });
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    for (const [a, g] of ghosts || []) lid(ctx, r, a, g);
    if (Math.cos(ang * D2R) >= 0) lid(ctx, r, ang);
    paw(ctx, r, true);
    ctx.restore();
  }
  function watchShot(ctx, t) {
    const lt = t - STAB, f = Math.round(lt * 24);
    const hook = seg(t, 1.14, 1.36), sl = backOut(hook, 1.25), antic = t < 1.14 ? Math.sin(seg(t, 1.0, 1.14) * Math.PI) : 0;
    const X = k => lerp(960, 1488, k);
    const x = X(sl) - 34 * antic, y = lerp(488, 560, easeInOut(hook));
    const r = lerp(lerp(372, 398, easeOut(seg(t, STAB, 1.14))), lerp(330, 346, seg(t, 1.36, 2.62)), easeInOut(hook));
    const tk = pulse(t, 16), jolt = .075 * Math.exp(-lt * 6) * Math.cos(lt * 17);
    const rot = jolt + .014 * tk * (beatN(t) % 2 ? 1 : -1) + wob(t, .23) * .012 - .05 * Math.sin(hook * Math.PI);
    const imp = Math.exp(-lt * 11), [sx, sy] = shake(t, 16 * imp + 5 * tk * (t > 1.36));
    // warm, defocused burrow behind the close-up; flat ink once the lyric column needs the left half
    fillPts(ctx, rect(0, 0, W, H), mix(WARM, INK.ink, easeInOut(hook) * .7), false);
    const bgA = 1 - easeInOut(hook) * .85, px = 380 * easeInOut(hook);
    if (bgA > .05) depth(ctx, 11, c => {
      c.save(); c.globalAlpha = bgA; c.translate(px - 20 * seg(t, STAB, 1.14), 0);
      dotsIn(c, [-400, 0, W, H], { spacing: 30, color: mix(WARM, INK.orangeDk, .45), k: (x, y) => .35 + .35 * noise2(x * .003, y * .003) });
      for (const [bx, by, br, col] of [[260, 250, 170, INK.yellow], [1720, 330, 210, INK.orangeLt], [1540, 900, 150, INK.orangeDk], [150, 860, 120, INK.orangeLt]]) {
        c.save(); clipPts(c, ell(bx, by, br, br, 32)); dotsIn(c, [bx - br, by - br, bx + br, by + br], { spacing: 24, color: rgba(col, .55), k: (x, y) => 1.1 - Math.hypot(x - bx, y - by) / br * .6 }); c.restore();
      }
      c.restore();
    }, { angle: .4 });
    ctx.save(); ctx.translate(sx, sy);
    if (f <= 2) speedLines(ctx, x, y, { n: 50, r0: r * 1.25, r1: 1900, w: 14, color: rgba(INK.orangeDk, .9 - f * .3), seed: 9 });
    const moving = t > 1.15 && t < 1.31;
    if (moving) {
      streaks(ctx, [x - 700, y - r, x - 200, y + r], { dir: [1, 0], n: 18, len: 520, w: 10, color: rgba(INK.orangeDk, .8) });
      for (const [d, a] of [[2, .22], [1, .4]]) { const k = backOut(seg(t - d * FR, 1.14, 1.36), 1.25); ctx.save(); ctx.globalAlpha = a; fillPts(ctx, ell(X(k), y, r * 1.06, r * 1.06, 40), BRASS); ctx.restore(); }
    }
    const ghosts = f === 0 ? [[22, .2], [48, .3], [76, .45]] : null;
    watchAt(ctx, t, x, y, r, rot, lidAngle(t), ghosts);
    if (f <= 1) krackle(ctx, x - r * 1.1, y, r * .5, { n: 18, size: 18, color: INK.yellow, seed: 2 });
    ctx.restore();
    if (f <= 1) misregFrame(ctx, f === 0 ? 12 : 5, .35);
  }

  // ---------------------------------------------------------------- 2.62 THE MEADOW (a real ground plane, so the tilt reads)
  const HZ = 8.5, HR = 1.8, RX = HR + .5, RK = 290, F0 = 1400;
  function mcam(t) {
    const push = easeInOut(seg(t, 2.62, 4.55)), k = easeInOut(seg(t, 4.5, DROP));
    const x = lerp(lerp(1.05, .8, push), 0, k), h = lerp(1.9, 2.25, k), z = lerp(lerp(0, 1.8, push), HZ, k);
    const look = Math.atan2(h, Math.max(1e-4, HZ - z));
    const [dx, dy] = drift(t, .012, .4);
    return { x: x + dx, h, z, p: look - (1 - k) * 8 * D2R + dy * .3, F: F0 };
  }
  function proj(C, X, Y, Z) {
    const rx = X - C.x, ry = Y - C.h, rz = Z - C.z, cp = Math.cos(C.p), sp = Math.sin(C.p);
    const yc = ry * cp + rz * sp, zc = Math.max(.05, -ry * sp + rz * cp);
    return [960 + C.F * rx / zc, 540 - C.F * yc / zc, zc];
  }
  const dirProj = (C, dx, dy, dz) => { const cp = Math.cos(C.p), sp = Math.sin(C.p), yc = dy * cp + dz * sp, zc = -dy * sp + dz * cp; return zc > .05 ? [960 + C.F * dx / zc, 540 - C.F * yc / zc] : null; };
  const TUFTS = (() => {
    const out = [];
    for (let i = 0; i < 230; i++) { const X = hrange(i * 3.1, -11, 13), Z = 2.2 + Math.pow(hash(i * 7.7), 1.4) * 34; if (Math.hypot(X, Z - HZ) < HR * 1.3 || Math.hypot(X - RX, Z - HZ) < .8) continue; out.push({ X, Z, n: 3 + Math.floor(hash(i * 5.3) * 3), h: hrange(i * 2.9, .26, .58), seed: i }); }
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + hash(i + 99) * .25, rr = HR * hrange(i + 40, 1.1, 1.24), X = Math.cos(a) * rr, Z = HZ + Math.sin(a) * rr; if (Math.hypot(X - RX, Z - HZ) < .6) continue; out.push({ X, Z, n: 4, h: hrange(i + 70, .16, .3), seed: 300 + i }); }
    return out.sort((a, b) => b.Z - a.Z);
  })();
  function tuft(c, C, T, tt) {
    const b = proj(C, T.X, 0, T.Z); if (b[2] < .3 || b[0] < -300 || b[0] > W + 300 || b[1] > H + 300) return;
    const w = C.F * .06 / b[2];
    for (let j = 0; j < T.n; j++) {
      const off = (j / (T.n - 1) - .5), sway = .06 * Math.sin(tt * 2.6 + T.seed * .7), hh = T.h * (1 - Math.abs(off) * .7);
      const p0 = proj(C, T.X + off * .14, 0, T.Z), p1 = proj(C, T.X + off * .22 + sway * .4, hh * .55, T.Z), p2 = proj(C, T.X + off * .42 + sway, hh, T.Z - off * .04);
      inkLine(c, [p0, p1, p2], w, GRASS, { taper: [0, 1], seed: T.seed + j });
      if (b[2] < 9) inkLine(c, [p1, p2], w * .3, INK.orange, { taper: [.2, 1], seed: T.seed + j + 50 });
    }
  }
  function holeRing(C, r, Y = 0) { const p = []; for (let i = 0; i < 56; i++) { const a = i / 56 * TAU, q = proj(C, Math.cos(a) * r, Y, HZ + Math.sin(a) * r); p.push([q[0], q[1]]); } return p; }

  // the rabbit's path: stands on the right rim, leaps head first into the hole, falls down the shaft
  function diver(t) {
    const k = seg(t, DIVE, 4.64);
    if (t < DIVE) return { X: RX, Y: 1.04, rot: 0, inHole: false };
    if (t < 4.64) { const e = easeInOut(k); return { X: lerp(RX - .05, .12, e), Y: 1.04 + 1.25 * Math.sin(Math.PI * k) - 1.3 * k * k, rot: lerp(-10, -172, easeInOut(k)), inHole: false }; }
    const d = t - 4.64; return { X: .12, Y: -.26 - 17 * Math.pow(d, 1.55), rot: -172 - 120 * d, inHole: true };
  }
  function meadowPose(t, tt) {
    const late = seg(t, onF(2.99), onF(2.99) + .08), look = seg(t, onF(3.40), onF(3.40) + .1), tuck = seg(t, onF(3.83), onF(3.83) + .12);
    const crouch = easeOut(seg(t, onF(4.03), 4.27)), fly = t >= DIVE;
    const up = late > 0 ? 1 + .22 * Math.exp(-(t - onF(2.99)) * 9) * Math.cos((t - onF(2.99)) * 30) : 0, vib = late > 0 && !fly ? Math.sin(tt * 47) * 5 : 0;
    const p = { turn: -.38, noShadow: true, lx: -.2, ly: .1, eyes: 'open', mouth: 'smile',
      earL: { a: lerp(-14, -3, Math.min(1, up)) + vib, b: 0, len: 1 + .18 * up },
      earR: { a: lerp(12, 3, Math.min(1, up)) - vib, b: 0, len: 1 + .18 * up } };
    if (tuck < 1) { p.armR = { a: lerp(38, 18, tuck), e: lerp(158, 40, tuck) }; p.pawR = 'mitt'; p.lx = lerp(.75, -.2, look); p.ly = lerp(.55, 0, look); }
    else { p.armR = { a: 14, e: 30 }; }
    p.armL = { a: 12, e: 12 };
    if (late > 0) { p.eyes = 'wide'; p.mouth = 'o'; p.sweat = clamp(late * 1.2); p.sense = 1; p.brows = .3; p.sq = -.14 * Math.exp(-(t - onF(2.99)) * 8); }
    if (look > 0) { p.mouth = 'open'; p.open = .75 * (1 - crouch); p.browTilt = -2; p.hop = t < onF(3.83) ? hopArc(t, onF(3.40), .3, .9).h : 0; }
    if (crouch > 0 && !fly) { p.sq = .38 * crouch; p.lean = -16 * crouch; p.armL = { a: lerp(12, 55, crouch), e: 20 }; p.armR = { a: lerp(14, 55, crouch), e: 20 }; p.earL = { a: -30 * crouch - 6, b: 30 * crouch, len: 1.05 }; p.earR = { a: 20 - 30 * crouch, b: 34 * crouch, len: 1.05 }; p.eyes = 'open'; p.mouth = 'flat'; p.brows = -.1; p.browTilt = 1.5 * crouch; p.lids = .15; p.lx = -.8; p.ly = .3; p.sense = 0; p.sweat = 0; }
    if (fly) {
      const k = seg(t, DIVE, 4.64), flap = Math.sin(tt * 30) * 12;
      Object.assign(p, { sq: k < .25 ? -.32 : -.15, lean: 0, armL: { a: 172, e: -8 }, armR: { a: 172, e: 8 }, pawL: 'mitt', pawR: 'mitt', legs: 'hop', hop: .4, earL: { a: -168 + flap, b: -20, len: 1.1 }, earR: { a: 168 - flap, b: 20, len: 1.1 }, eyes: 'wide', mouth: 'open', open: .8, brows: .5, browTilt: 0, lids: 0, sweat: 0, sense: 0, lx: 0, ly: .8 });
      if (t > 4.64) Object.assign(p, { armL: { a: 150 + flap, e: 40 }, armR: { a: 160 - flap, e: 30 }, pawL: 'open', pawR: 'open', legs: 'run', phase: tt * 3, earL: { a: -40 + flap * 2, b: 50, len: 1.05 }, earR: { a: 40 - flap * 2, b: -50, len: 1.05 } });
    }
    return p;
  }
  function drawDiver(ctx, C, t, tt) {
    const d = diver(t), q = proj(C, d.X, d.Y, HZ), s = RK / q[2], p = meadowPose(t, tt);
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(d.rot * D2R);
    const A = rabbit(ctx, 0, 5 * s, s, p);
    ctx.restore();
    if (t < onF(3.83) + .05 && A) {
      const [px, py] = A.pawR, rr = s * 1.05, ca = Math.cos(d.rot * D2R), sa = Math.sin(d.rot * D2R);
      pocketWatch(ctx, q[0] + px * ca - py * sa, q[1] + px * sa + py * ca - rr * .3, rr, { left: 90, secs: clockSecs(16, 58, 36) + Math.max(0, beatN(t) - beatN(2.62)), rot: -.3, label: false });
    }
    return { q, s, d };
  }
  const WORDS = [
    { s: 'DOWN', dx: -290, dy: -185, size: 176, rot: -.07, align: 'center' },
    { s: 'THE', dx: 90, dy: -205, size: 108, rot: .04, align: 'center' },
    { s: 'RABBIT', dx: -310, dy: 175, size: 176, rot: -.03, align: 'center', hot: true },
    { s: 'HOLE', dx: 370, dy: 190, size: 206, rot: .05, align: 'center' },
  ];
  // laid out around where the hole sits before the tilt; once sucked, they spiral into wherever it is now
  function holeWords(ctx, t, hx, hy, g) {
    const [bx, by] = proj(mcam(4.5), 0, 0, HZ);
    WORDS.forEach((w, i) => {
      const a = W1[i].a - FR, age = t - a; if (age < 0) return;
      const pop = backOut(clamp(age / .1 + .42), 2.6), on = t < W1[i].b + .05;
      const suck = easeIn(seg(t, 4.93 + i * .05, 5.17 + i * .025)), ang = suck * (2.4 + i * .3);
      const ox = w.dx * g * (1 - suck), oy = w.dy * g * (1 - suck), ca = Math.cos(ang), sa = Math.sin(ang);
      const sc = pop * (1 - suck * .92) * g * (on ? 1 + .05 * Math.exp(-age * 7) : 1);
      if (sc < .02) return;
      const tw = measure(ctx, w.s, { font: 'display', weight: 900, stretch: -1, size: w.size }).w * sc, l = w.align === 'right' ? tw : tw / 2, r = w.align === 'right' ? 0 : tw / 2;
      const x = clamp(lerp(bx, hx, suck) + ox * ca - oy * sa, 110 + l, 1810 - r), y = clamp(lerp(by, hy, suck) + ox * sa + oy * ca, 70 + w.size * .4 * sc, 1010 - w.size * .4 * sc);
      ctx.save(); ctx.translate(x, y); ctx.rotate(w.rot + ang * 1.3 + (on ? Math.sin(t * 40) * .01 : 0)); ctx.scale(sc, sc);
      txt(ctx, w.s, 0, w.size * .37, { font: 'display', weight: 900, stretch: -1, size: w.size, align: w.align, color: w.hot ? INK.orange : INK.paper, stroke: { w: 11, color: INK.ink }, extrude: { dx: 11, dy: 13, color: INK.ink }, alpha: clamp(age / .05 + .5) });
      ctx.restore();
    });
  }
  // 2D push on top of the ground-plane camera: in on the rabbit for the "I'm late!" beat, back out for the dive
  function mpush(t) {
    const pop = onF(2.99), k = kf(t, [[2.62, 0], [2.93, .88], [pop, 1], [3.8, 1.04], [4.24, 0]], easeInOut) + (t >= pop ? .1 * Math.exp(-(t - pop) * 10) * (t < 3.8) : 0);
    const r = proj(mcam(t), RX, 1.05, HZ);
    return { Z: 1 + .72 * k, x: lerp(960, r[0] - 150, clamp(k)), y: lerp(540, r[1] - 40, clamp(k)) };
  }
  function meadow(ctx, t) {
    const M = mpush(t);
    cam(ctx, M.x, M.y, M.Z);
    const g = meadowWorld(ctx, t);
    ctx.restore();
    const q = ([x, y]) => [(x - M.x) * M.Z + 960, (y - M.y) * M.Z + 540];
    const [hx, hy] = q([g.hx, g.hy]);
    return { hx, hy, rx: g.rx * M.Z, ry: g.ry * M.Z };
  }
  function meadowWorld(ctx, t) {
    const tt = twos(t), C = mcam(t), hz = 540 - C.F * Math.tan(C.p);
    // sky, sun, far ridge
    if (hz > -40) {
      fillPts(ctx, rect(0, 0, W, hz + 4), INK.orange, false);
      const sp = dirProj(C, -.12, .045, 1);
      if (sp) {
        const [sx, sy] = sp, R = 205;
        ctx.save(); clipPts(ctx, rect(0, -10, W, hz + 14), false);
        dotsIn(ctx, [sx - R * 2.2, sy - R * 2.2, sx + R * 2.2, sy + R * 2.2], { spacing: 26, color: INK.yellow, k: (x, y) => { const d = Math.hypot(x - sx, y - sy) / R; return d < 1 ? 0 : clamp(1.9 - d) * .95; } });
        fillPts(ctx, ell(sx, sy, R, R, 48), INK.yellow);
        ctx.restore();
      }
      // the far meadow: a spiky grass silhouette along the horizon
      const ridge = [[-40, hz + 30]], ox = C.x * 60;
      for (let i = 0; i <= 150; i++) { const x = -40 + i * 13.6, n = x + ox, base = hz - 6 - 14 * (.5 + .5 * noise1(n * .004 + 3.1)); ridge.push([x, i % 2 ? base - 10 - 22 * hash(i * 1.37 + 5) : base]); }
      ridge.push([W + 40, hz + 30]);
      fillPts(ctx, ridge, GRASS, false);
    }
    const gy0 = Math.max(0, hz);
    fillPts(ctx, rect(0, gy0, W, H - gy0 + 10), GROUND, false);
    if (hz > -40) {
      fillPts(ctx, rect(0, gy0, W, 26), mix(GROUND, INK.orange, .45), false);
      dotsIn(ctx, [0, gy0, W, gy0 + 120], { spacing: 20, color: mix(GROUND, INK.orange, .45), k: (x, y) => clamp(1 - (y - hz - 20) / 100) });
    }
    dotsIn(ctx, [0, gy0, W, H], { spacing: 28, color: mix(GROUND, INK.ink, .55), k: (x, y) => clamp((y - Math.max(hz, -600) - 260) / 700) * .75 });
    // hole geometry
    const rim = holeRing(C, HR), mound = holeRing(C, HR * 1.14), bb = bbox(rim), hx = (bb[0] + bb[2]) / 2, hy = (bb[1] + bb[3]) / 2, rx = (bb[2] - bb[0]) / 2, ry = (bb[3] - bb[1]) / 2;
    // light spilling out onto the grass
    dotsIn(ctx, [hx - rx * 2.2, hy - ry * 2.6, hx + rx * 2.2, hy + ry * 2.6], { spacing: 20, color: INK.cyan, k: (x, y) => { const d = Math.hypot((x - hx) / rx, (y - hy) / ry); return d < 1.05 ? 0 : clamp(1.75 - d) * 1.1; } });
    const d = diver(t);
    // the rabbit's long golden-hour shadow, cast toward camera
    if (t < DIVE + .12) {
      const sh = [[RX - .35, HZ + .05], [RX + .35, HZ + .05], [RX + .95, HZ - 3.2], [RX + .15, HZ - 3.3]].map(([X, Z]) => proj(C, X, 0, Z).slice(0, 2));
      ctx.save(); ctx.globalAlpha = .38 * (1 - seg(t, DIVE, DIVE + .12)); fillPts(ctx, sh, INK.ink); ctx.restore();
    }
    let i = 0;
    for (; i < TUFTS.length && TUFTS[i].Z > HZ; i++) tuft(ctx, C, TUFTS[i], tt);
    ink(ctx, mound, { fill: mix(GROUND, INK.ink, .35), line: 5, boil: 1.2, seed: 3 });
    ctx.save(); clipPts(ctx, rim);
    fillPts(ctx, rect(bb[0] - 10, bb[1] - 10, bb[2] - bb[0] + 20, bb[3] - bb[1] + 20), INK.night, false);
    const q = ry / rx;
    vortex(ctx, { x: hx, y: hy + ry * .22 * (1 - q), R: rx * 1.08, sq: clamp(q + .06), spin: t * .9, zoom: t * .7, dots: 16 });
    if (d.inHole || d.Y < .2) drawDiver(ctx, C, t, tt);
    // shaft wall shading: the near lip throws the top of the opening into shadow
    dotsIn(ctx, bb, { spacing: 16, color: INK.ink, k: (x, y) => clamp(.9 - ((y - hy) / ry + 1) * 1.5) });
    ctx.restore();
    outline(ctx, rim, 7, INK.ink, { seed: 4 });
    inkLine(ctx, rim.slice(4, 25), 6, INK.cyan, { taper: [.3, .3] });
    if (!d.inHole && d.Y >= .2) drawDiver(ctx, C, t, tt);
    for (; i < TUFTS.length; i++) if (proj(C, TUFTS[i].X, 0, TUFTS[i].Z)[2] >= 4.2) tuft(ctx, C, TUFTS[i], tt);
    const m = ctx.getTransform();
    depth(ctx, 9, c => { c.setTransform(m); for (let j = 0; j < TUFTS.length; j++) if (TUFTS[j].Z <= HZ && proj(C, TUFTS[j].X, 0, TUFTS[j].Z)[2] < 4.2) tuft(c, C, TUFTS[j], tt); });
    return { hx, hy, rx, ry };
  }
  function meadowShot(ctx, t) { meadow(ctx, t); }
  function diveShot(ctx, t) {
    const g = meadow(ctx, t);
    holeWords(ctx, t, g.hx, g.hy, Math.pow(g.rx / 300, .12));
    if (t < onF(W1[0].a) + .05 && t >= onF(W1[0].a) - FR) misregFrame(ctx, 6, .2);
  }

  // ---------------------------------------------------------------- THE VORTEX (blow-up homage: orange = fast core, cyan = slow rim)
  // o: {x, y, R, sq (vertical squash), spin, zoom, rot, dots (spacing)}
  function vortex(c, o) {
    const R = o.R; if (!(R > 3)) return;
    const spin = o.spin || 0, zoom = o.zoom || 0, rs = .4, sp = o.dots || 22;
    c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(1, o.sq ?? 1);
    fillPts(c, ell(0, 0, R * 1.3, R * 1.3, 48), INK.night);
    const band = (x, y) => { const r = Math.hypot(x, y) / R; if (r > 1.3 || r < .01) return [r, 0]; const lr = Math.log(r), v = lr / .42 + zoom, a = Math.atan2(y, x);
      const b = Math.pow(.5 + .5 * Math.cos(v * TAU), 1.6), m = .5 + .5 * Math.cos(5 * a - lr * 2.6 - spin * 1.4); return [r, b * (.3 + .7 * m)]; };
    dotsIn(c, [-R * 1.3, -R * 1.3, R * 1.3, R * 1.3], { spacing: sp, color: mix(INK.cyan, INK.night, .35), k: (x, y) => { const [r, k] = band(x, y); return r < rs * .8 ? 0 : k * clamp((r - rs * .8) * 4) * clamp((1.35 - r) * 3); } });
    dotsIn(c, [-R * rs * 1.3, -R * rs * 1.3, R * rs * 1.3, R * rs * 1.3], { spacing: sp * .8, color: INK.orange, k: (x, y) => { const [r, k] = band(x, y); return r > rs * 1.2 ? 0 : (k * .8 + .25) * clamp((rs * 1.2 - r) * 5); } });
    // spiral streamline ribbons, differential rotation (the core winds faster)
    const N = 7;
    for (let i = 0; i < N; i++) {
      const L = [], Rr = [], ph = i / N * TAU;
      for (let j = 0; j <= 44; j++) {
        const r = R * 1.3 * Math.exp(-j * .085), lr = Math.log(r / R), a = ph + 1.55 * -lr + spin * (.55 + .45 * Math.pow(R / (r + .12 * R), .7)), dw = .075 + .03 * Math.sin(i * 1.7);
        L.push([Math.cos(a - dw) * r, Math.sin(a - dw) * r]); Rr.push([Math.cos(a + dw) * r, Math.sin(a + dw) * r]);
      }
      const split = L.findIndex(p => Math.hypot(p[0], p[1]) < R * rs);
      const outer = [...L.slice(0, split + 1), ...Rr.slice(0, split + 1).reverse()], inner = [...L.slice(split), ...Rr.slice(split).reverse()];
      fillPts(c, outer, INK.cyan, true); fillPts(c, inner, INK.orange, true);
      inkLine(c, L, Math.max(2, R * .006), INK.ink, { taper: [0, .7], seed: i });
    }
    // hot core
    fillPts(c, ell(0, 0, R * .075, R * .075, 24), INK.yellow);
    fillPts(c, ell(0, 0, R * .03, R * .03, 16), INK.white);
    c.restore();
  }

  // ---------------------------------------------------------------- 5.30 THE FALL (the showcase) + 7.85 THE ACCELERATION
  function fallRabbit(c, x, y, s, rot, tt, o = {}) {
    const flap = Math.sin(tt * 31), kick = tt * 4;
    c.save(); c.translate(x, y); c.rotate(rot);
    const A = rabbit(c, 0, 5 * s, s, { eyes: 'wide', mouth: 'open', open: .7, armL: { a: 150 + flap * 18, e: 35 }, armR: { a: 160 - flap * 18, e: 25 }, pawL: 'open', pawR: 'open',
      legs: 'run', phase: kick, earL: { a: -35 + flap * 25, b: 55 * flap, len: 1.05 }, earR: { a: 35 - flap * 25, b: -55 * flap, len: 1.05 }, noShadow: true, brows: .4, ...o });
    c.restore(); return A;
  }
  // flyby scale for debris drifting up the shaft: arrive, linger while readable, then rush past the lens
  const flyG = u => u < .38 ? lerp(.1, 1, easeOut(u / .38)) : u < .8 ? lerp(1, 1.32, (u - .38) / .42) : 1.32 * Math.exp((u - .8) * 15);
  // times in frozen-clock seconds (te): the console.log scrap hangs mid-frame through the first silence
  const DEBRIS = [
    { t0: 5.3, t1: 6.08, a: -2.5, kind: 'key' },
    { t0: 5.48, t1: 6.1, a: .5, kind: 'fix' },
    { t0: 6.16, t1: 6.86, a: 2.3, kind: 'log' },
    { t0: 6.99, t1: 7.72, a: -.9, kind: 'check' },
  ];
  function debris(c, k, x, y, g, rot, tt) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(g, g);
    if (k === 'key') {
      ink(c, ell(-95, 0, 58, 58, 28), { fill: INK.yellow, shade: { color: INK.orange, spacing: 12, dir: [.5, .85], from: -20, to: 60 }, line: 7, boil: 1.2 });
      fillPts(c, ell(-95, 0, 26, 26, 20), INK.night);
      ink(c, [[-40, -16], [150, -16], [150, 16], [-40, 16]], { fill: INK.yellow, shade: { color: INK.orange, spacing: 12, dir: [0, 1], from: -10, to: 20 }, line: 7, boil: 1, smooth: false });
      ink(c, [[92, 14], [118, 14], [118, 56], [92, 56]], { fill: INK.yellow, line: 6, boil: 1, smooth: false });
      ink(c, [[128, 14], [150, 14], [150, 42], [128, 42]], { fill: INK.yellow, line: 6, boil: 1, smooth: false });
      for (let i = 0; i < 3; i++) { const a = tt * 5 + i * 2.1; ink(c, star(-95 + Math.cos(a) * 110, Math.sin(a) * 80, 16, .4, 4, tt * 3), { fill: INK.white, line: 3, boil: 0, smooth: false }); }
    } else if (k === 'fix' || k === 'log') {
      const s = k === 'fix' ? 'function fix() {' : 'console.log("here");', f = { font: 'mono', weight: 800, size: 64 }, w = measure(c, s, f).w + 70;
      cutout(c, -w / 2, -60, w, 120, 0, tt, cc => { txt(cc, s, 35, 82, { ...f, color: k === 'fix' ? INK.ink : INK.ink }); if (k === 'log') txt(cc, '"here"', 35 + measure(cc, 'console.log(', f).w, 82, { ...f, color: INK.orangeDk }); }, { seed: k === 'fix' ? 3 : 8 });
    } else if (k === 'check') {
      ink(c, ell(0, 0, 95, 95, 32), { fill: INK.green, shade: { color: mix(INK.green, INK.ink, .4), spacing: 14, dir: [.5, .85], from: 0, to: 90 }, line: 8, boil: 1.2 });
      inkLine(c, [[-48, 4], [-12, 40], [52, -38]], 26, INK.white, { taper: [0, 0], smooth: false });
    }
    c.restore();
  }
  // a clock flying past the lens; g = 1 on the hit frame
  function clockFly(c, t, T, dir, R0, tt) {
    const g = .065 / Math.max(.012, .065 + (T - t)); if (g < .08 || g > 3.2) return null;
    const x = 960 + dir[0] * 560 * g, y = 540 + dir[1] * 560 * g, r = R0 * g;
    if (t > T) { c.save(); c.globalAlpha = .35; fillPts(c, ell(960 + dir[0] * 560 * g * .7, 540 + dir[1] * 560 * g * .7, r * .8, r * .8, 32), BRASS); c.restore(); }
    pocketWatch(c, x, y, r, { left: 90 - Math.round((T - 6) * 8), secs: clockSecs(16, 58, 40) + Math.floor(T * 3), rot: tt * 1.4 + dir[0], label: false });
    return [x, y, r];
  }
  function card(ctx, t, i) {
    const L = CARD_T[i], prev = i ? CARD_T[i - 1] : L - .3, next = i + 1 < CARD_T.length ? CARD_T[i + 1] : 10.11;
    const pre = Math.min(.1, (L - prev) * .6), out = next - Math.min(.1, (next - L) * .6) * .5;
    const C = CARDS[i], S = C.S, [ox, oy] = C.at, ex = C.exit, sink = !ex;   // the last scraps get swallowed by the pinch
    if (t < L - pre || t > out + (sink ? 4 : 2.2) * FR) return;
    const arr = t < L ? 1 - seg(t, L - pre, L) : 0, fly = Math.max(0, t - out) / (2 * FR), d = 2400 * fly * fly, sk = sink ? Math.pow(clamp(fly * 1.2), 1.5) : 0;
    const g = (t < L ? lerp(.16, .9, easeIn(1 - arr)) : 1 + .04 * Math.exp(-(t - L) * 30) + .08 * seg(t, L, next) + (sink ? 0 : .5 * fly)) * (1 - sk);
    if (g < .03) return;
    const ang = C.rot + arr * (i % 2 ? .7 : -.7) + (sink ? sk * 5 : fly * .5 * Math.sign(ex[0]));
    const x = lerp(lerp(960 + ox, 960, arr) + (sink ? 0 : ex[0] * d), 960, sk), y = lerp(lerp(540 + oy, 540, arr) + (sink ? 0 : ex[1] * d), 540, sk);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(S * g, S * g);
    cutout(ctx, -C.w / 2, -C.h / 2, C.w, C.h, 0, t, c => C.f(c, t, t - L), { seed: i * 7 + 1 });
    if (C.over) { ctx.translate(-C.w / 2, -C.h / 2); C.over(ctx, t, t - L); }
    ctx.restore();
  }
  function fall(ctx, t) {
    const e = te(t), tt = twos(e), fz = isFrozen(t);
    if (fz) BOIL = 0;
    const T1 = te(TICK1), T2 = te(TICK2), T3 = te(TOCK), P = te(PINCH[0]), PE = te(PINCH[1]);
    const pinch = seg(e, P, PE);
    // blow-up clock: rotation phase grows like -log(T* - t)
    const Ts = te(10.26), spin = (e - DROP) * .55 - 1.1 * Math.log(Math.max(.02, Ts - e) / (Ts - DROP)), zoom = (e - DROP) * .9 + spin * .35;
    const hitK = Math.max(hit(t, [TICK1], 9) * .6, hit(t, [TICK2], 9) * .8, hit(t, [TOCK], 7));
    const [sx, sy] = shake(t, 22 * hitK), zm = 1 + .08 * hitK, roll = spin * .12 + .08 * Math.sin(e * .9);
    const R = 1100 * Math.pow(1 - pinch, 1.6) + 50 * pinch;
    // the shaft
    fillPts(ctx, rect(0, 0, W, H), INK.night, false);
    depth(ctx, 7, c => {
      cam(c, 960 - sx, 540 - sy, zm, roll);
      vortex(c, { x: 960, y: 540, R, spin, zoom, dots: 24 });
      if (R > 60 && !fz) speedLines(c, 960, 540, { n: 46, r0: R * .32, r1: R * 1.5, w: 7, color: rgba(INK.paper, .28 + .3 * seg(e, te(7.8), P)), seed: 1 });
      if (pinch > 0) { speedLines(c, 960, 540, { n: 70, r0: R * 1.05, r1: 1500, w: 12, color: rgba(INK.paper, .55), seed: 2 }); outline(c, ell(960, 540, R * 1.02, R * 1.02, 56), 10, INK.orange); }
      c.restore();
    }, { angle: roll });
    cam(ctx, 960 - sx, 540 - sy, zm, roll);
    // debris drifting up past the lens (behind the rabbit while far, in front once close)
    const near = [], drawDebris = (c, d) => { const u = seg(e, d.t0, d.t1), g = flyG(u), a = d.a + spin * .35 + u * .8, r = 250 * g; debris(c, d.kind, 960 + Math.cos(a) * r, 540 + Math.sin(a) * r * .8, g, Math.sin(e * 1.3 + d.a) * .25, tt); };
    for (const d of DEBRIS) {
      const u = seg(e, d.t0, d.t1); if (u <= 0 || u >= 1) continue;
      if (flyG(u) > 1.15) near.push(d); else drawDebris(ctx, d);
    }
    // the rabbit: tumbling, falling away from the lens; TOCK knocks it back toward us
    const bonk = e >= T3 ? e - T3 : -1;
    const s0 = kf(e, [[DROP, 30], [6.1, 26], [te(7.2), 30]]) * (1 - .3 * seg(e, te(7.9), P)), ox = 960 + 200 * Math.cos(e * .9 + 1), oy = 540 + 130 * Math.sin(e * 1.1);
    // the tumble is phased so the rabbit arrives near upright on TOCK
    let s = s0, rx = ox, ry = oy, rot = twos(e - T3) * 2.3 + .15;
    if (bonk >= 0) { const k = Math.exp(-bonk * 4), out = (1 - Math.exp(-bonk * 7)); s += 18 * k * Math.min(1, bonk * 16); rx -= 380 * out * Math.exp(-bonk * 1.2); ry -= 110 * out * Math.exp(-bonk * 1.5); rot += 7 * (1 - Math.exp(-bonk * 4)); }
    s *= 1 - easeIn(seg(e, P - .06, PE - .04));
    // the TOCK clock rises under the rabbit, takes the hit (cracks), then rushes out past the lens
    if (e >= T3 - .45 && e < T3 + .11) {
      const g = e < T3 ? .1 / (.1 + (T3 - e)) : 1 + (e - T3) * 22, a = e > T3 ? g - 1 : 0;
      pocketWatch(ctx, ox + 20 + 950 * a, oy + 40 - 260 * a, 14 * s0 * g, { left: 88, secs: clockSecs(16, 58, 44), rot: -.4 + e * .6, label: false, crack: e >= T3 ? 1 : 0 });
    }
    if (bonk >= 0 && bonk < .09) burst(ctx, rx, ry, s * 7, { fill: INK.white, dotColor: INK.yellow, seed: 11, n: 12, spike: .45 });
    if (s > 1) {
      const pose = bonk >= 0 && bonk < .5 ? { eyes: bonk < .09 ? 'x' : 'spiral', mouth: 'o', sq: bonk < .05 ? .55 : bonk < .09 ? -.2 : 0 } : {};
      fallRabbit(ctx, rx, ry, s, rot, tt, pose);
      if (bonk >= .04 && bonk < .5) { const [hx, hy] = [rx + Math.sin(rot) * s * 2.6, ry - Math.cos(rot) * s * 2.6];
        for (let i = 0; i < 4; i++) { const a = twos(e) * 9 + i * TAU / 4; ink(ctx, star(hx + Math.cos(a) * s * 3.4, hy + Math.sin(a) * s * 1.2 - s * 2.2, s * .55, .45, 5, a), { fill: INK.yellow, line: 3.5, boil: 0, smooth: false }); } }
    }
    ctx.restore();
    // things close to the lens: out of focus
    depth(ctx, 10, c => {
      cam(c, 960 - sx, 540 - sy, zm, roll);
      for (const d of near) drawDebris(c, d);
      clockFly(c, e, T1, [-.78, -.55], 470, tt);
      if (t >= TICK2) clockFly(c, e, T2, [.8, -.4], 560, tt);
      c.restore();
    }, { angle: roll });
    // lettering: screen space, not rolled
    sfx(ctx, 'TICK', 560, 290, 230, e - T1 + FR, { rot: -.14, life: .42 });
    sfx(ctx, 'TICK', 1370, 300, 270, t < TICK2 ? -1 : e - T2 + FR, { rot: .1, life: .4 });
    sfx(ctx, 'TOCK!', 960, 200, 320, e - T3 + FR, { rot: -.06, life: .46, color: INK.orange, dotColor: INK.yellow });
    for (let i = 0; i < CARDS.length; i++) card(ctx, t, i);
    if (pinch > .6) { const k = seg(pinch, .6, 1); fillPts(ctx, ell(960, 540, 12 + k * 30, 12 + k * 30, 20), INK.white); outline(ctx, ell(960, 540, 60 + k * 420, 60 + k * 420, 48), 16 * (1 - k) + 3, INK.orange); outline(ctx, ell(960, 540, 30 + k * 230, 30 + k * 230, 40), 9 * (1 - k) + 2, INK.cyan); }
  }

  // ---------------------------------------------------------------- the timeline, as xerox scraps (legible in freeze-frame)
  const pad = 14;
  function stopwatchCard(c, t, w, h) {
    const cx = w / 2, cy = 200, R = 140;
    ink(c, rrect(cx - 34, cy - R - 58, 68, 44, 10), { fill: INK.orange, line: 5, boil: .5, smooth: false });
    ink(c, ell(cx, cy, R + 16, R + 16, 40), { fill: INK.ink, line: 0, boil: .5 });
    ink(c, ell(cx, cy, R, R, 40), { fill: INK.white, line: 5, boil: .5 });
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 ? R * .86 : R * .74; inkLine(c, [[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * R * .94, cy - Math.cos(a) * R * .94]], i % 5 ? 2.5 : 5, INK.ink, { taper: [0, 0], smooth: false }); }
    const a = t * 38; inkLine(c, [[cx, cy], [cx + Math.sin(a) * R * .85, cy - Math.cos(a) * R * .85]], 7, INK.orange, { taper: [0, .5], smooth: false });
    fillPts(c, ell(cx, cy, 12, 12, 12), INK.ink);
    txt(c, '88:00:00', cx, 455, { font: 'mono', weight: 800, size: 104, color: INK.ink, align: 'center' });
    txt(c, '10,000 agents', cx, 528, { font: 'ui', weight: 800, size: 48, color: INK.orangeDk, align: 'center' });
  }
  function scoreCard(c, t, w, h) {
    fillPts(c, rect(0, 0, w, h), INK.ink, false);
    for (let i = 0; i < 22; i++) { const on = (Math.floor(t * 16) + i) % 2; fillPts(c, ell(28 + i * (w - 56) / 21, 26, 8, 8, 8), on ? INK.yellow : mix(INK.yellow, INK.ink, .7)); fillPts(c, ell(28 + i * (w - 56) / 21, h - 26, 8, 8, 8), on ? mix(INK.yellow, INK.ink, .7) : INK.yellow); }
    txt(c, 'PROBLEMS SOLVED', w / 2, 112, { font: 'ui', weight: 800, size: 48, color: INK.paper, align: 'center', track: 4 });
    txt(c, '42/42', w / 2, 340, { font: 'display', weight: 900, stretch: -1, size: 240, color: INK.yellow, align: 'center', dots: { color: INK.orange, spacing: 13 } });
  }
  function toggleCard(c, t, w, h, age) {
    const on = age >= 0, k = backOut(clamp(age / .08 + .5), 2);
    txt(c, "it's so over", 44, 158, { font: 'ui', weight: 800, size: 58, color: on ? '#9A94A6' : INK.ink });
    txt(c, "we're so back", w - 44, 158, { font: 'ui', weight: 800, size: 58, color: on ? INK.ink : '#9A94A6', align: 'right' });
    const sx = w / 2 - 95, sy = 88, sw = 190, sh = 100;
    ink(c, rrect(sx, sy, sw, sh, 50), { fill: on ? INK.green : INK.red, line: 6, boil: .5, smooth: false });
    ink(c, ell(sx + 50 + (sw - 100) * clamp(on ? k : 0), sy + 50, 40, 40, 24), { fill: INK.white, line: 5, boil: .5 });
    txt(c, '\u21C4', w / 2, 245, { font: 'ui', weight: 900, size: 52, color: INK.ink, align: 'center' });
  }
  function barsCard(c, t, w, h) {
    txt(c, 'commits / month', 40, 72, { font: 'ui', weight: 800, size: 50, color: INK.ink });
    const base = h - 70, vals = [.3, .42, .58, .8, 1.4];
    inkLine(c, [[36, base], [w - 36, base]], 5, INK.ink, { taper: [0, 0], smooth: false });
    vals.forEach((v, i) => ink(c, rect(56 + i * 96, base - v * 170, 70, v * 170), { fill: i === 4 ? INK.ink : '#B8B2C4', line: 4, boil: .5, smooth: false }));
    txt(c, '1.4B', 56 + 4 * 96 + 35, base - 1.4 * 170 - 16, { font: 'display', weight: 900, size: 56, color: INK.ink, align: 'center' });
  }
  function barsOver(c, t, age) {
    const h = CARDS[8].h, base = h - 70, grow = age < 0 ? 0 : backOut(clamp(age / .09 + .3), 1.6), bh = lerp(1.4, 2.9, grow) * 170, x = 56 + 5 * 96;
    ink(c, rect(x, base - bh, 78, bh), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 12, dir: [1, 0], from: 0, to: 40 }, line: 5, boil: .8, smooth: false });
    if (bh > h - 20) burst(c, x + 39, -6, 70, { fill: INK.white, dotColor: INK.orange, seed: 4, n: 10, spike: .5 });
    txt(c, '2.9B', x + 39, base - bh - 18, { font: 'display', weight: 900, size: 76, color: INK.orange, align: 'center', stroke: { w: 8, color: INK.ink } });
  }
  function rsiCard(c, t, w, h, age) {
    const gx = 250, gy = 330, R = 200, need = age < 0 ? -.85 : lerp(-.85, 1.12, backOut(clamp(age / .08 + .4), 2.2)) + Math.sin(t * 90) * .02;
    arcLine(c, gx, gy, R, INK.ink, 28, Math.PI, TAU);
    arcLine(c, gx, gy, R, INK.red, 28, Math.PI * 1.72, TAU);
    for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; inkLine(c, [[gx + Math.cos(a) * (R - 40), gy + Math.sin(a) * (R - 40)], [gx + Math.cos(a) * (R - 18), gy + Math.sin(a) * (R - 18)]], 5, INK.ink, { taper: [0, 0], smooth: false }); }
    const a = -Math.PI / 2 + need * Math.PI / 2;
    inkLine(c, [[gx, gy], [gx + Math.cos(a) * (R - 30), gy + Math.sin(a) * (R - 30)]], 12, INK.red, { taper: [0, .7], smooth: false });
    fillPts(c, ell(gx, gy, 22, 22, 16), INK.ink);
    txt(c, 'RSI', gx, gy + 100, { font: 'display', weight: 900, stretch: -1, size: 110, color: INK.ink, align: 'center' });
    const sx = w - 250, sy = 70;
    ink(c, rrect(sx, sy, 200, 280, 14), { fill: INK.white, line: 8, boil: .5, smooth: false });
    txt(c, 'SPEED', sx + 100, sy + 62, { font: 'ui', weight: 900, size: 46, color: INK.ink, align: 'center' });
    txt(c, 'LIMIT', sx + 100, sy + 110, { font: 'ui', weight: 900, size: 46, color: INK.ink, align: 'center' });
    txt(c, '1\u00D7', sx + 100, sy + 238, { font: 'display', weight: 900, size: 120, color: INK.ink, align: 'center' });
    inkLine(c, [[sx + 90, sy + 290], [sx + 90, h + 20]], 12, '#8A8496', { taper: [0, 0], smooth: false });
  }
  function arcLine(c, x, y, r, col, w, a0, a1) { const p = []; for (let i = 0; i <= 30; i++) { const a = lerp(a0, a1, i / 30); p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } inkLine(c, p, w, col, { taper: [0, 0] }); }
  const CARDS = [
    { w: 668, h: 350, S: 1.75, at: [-40, -10], rot: -.05, exit: [-.9, -.45], f: (c, t) => tweetCard(c, pad, pad, 640, { name: 'timeline enjoyer', handle: '@timeline_enjoyer', text: ['wake up babe,', 'new model dropped'], dark: true, size: 40, time: '1m' }) },
    { w: 748, h: 548, S: 1.62, at: [50, 10], rot: .04, exit: [.95, -.3], f: (c, t) => {
      metrChart(c, pad, pad, 720, 520, t, { title: 'Time horizon of agents (50% success)', ylabels: ['1 min', '10 min', '1 hr', '8 hrs', '16 hrs'], footnote: 'Measurements above 16 hrs are unreliable', fit: false,
        pts: [[.04, 'GPT-2', .03], [.25, '', .12], [.44, '', .24], [.58, '', .38], [.68, '', .52], [.75, '', .66], [.8, '', .8], [.83, '', .92], [.845, 'now', 1.0]] });
      const px = pad + 110 + .845 * 560; for (let i = 0; i < 6; i++) inkLine(c, [[px, pad + 60 - i * 34], [px, pad + 42 - i * 34]], 6, INK.orange, { taper: [0, 0], smooth: false });
    } },
    { w: 808, h: 470, S: 1.45, at: [-40, 0], rot: -.03, exit: [-.8, .6], f: (c, t) => arxivCard(c, pad, pad, 780, { title: ['On the Finite-Time Blowup', 'of Friday Deploys'], abstract: ['We show that for every Friday deploy there', 'exists a finite time T* at which prod blows up.'] }) },
    { w: 620, h: 570, S: 1.4, at: [60, 0], rot: .06, exit: [.85, .55], f: (c, t) => stopwatchCard(c, t, 620, 570) },
    { w: 720, h: 420, S: 1.5, at: [-60, 10], rot: -.05, exit: [-.95, -.3], f: (c, t) => scoreCard(c, t, 720, 420) },
    { w: 780, h: 330, S: 1.55, at: [40, -10], rot: .03, exit: [.9, -.45], f: (c, t) => terminal(c, pad, pad, 752, 302, t, { title: 'lean \u2014 blowup.lean', size: 48, lines: [['$ lake build', '#E8E6F0'], ['\u2714 0 sorry', INK.green], ['goals accomplished', INK.yellow]] }) },
    { w: 1040, h: 280, S: 1.3, at: [-20, 0], rot: -.04, exit: [-.7, .7], f: (c, t, age) => toggleCard(c, t, 1040, 280, age) },
    { w: 940, h: 178, S: 1.45, at: [40, 20], rot: .03, exit: [.8, .6], f: (c, t) => promptBox(c, 20, 20, 900, t, { text: 'What do you want to build?', size: 52, h: 138 }) },
    { w: 640, h: 440, S: 1.25, at: [-40, 50], rot: -.05, exit: null, f: (c, t) => barsCard(c, t, 640, 440), over: barsOver },
    { w: 760, h: 440, S: 1.2, at: [30, 0], rot: .05, exit: null, f: (c, t, age) => rsiCard(c, t, 760, 440, age) },
  ];

  // ---------------------------------------------------------------- 10.20 CRASH-LANDING in the burrow chair (hand-off to verse 1)
  // verse 1 opens on this exact composition (cam 960/540/1, chair 1400/1000/.95, rabbit 1400/870/30, settle from 10.40)
  const settle = t => .42 * Math.exp(-(t - 10.40) * 8) * Math.cos((t - 10.40) * 26);
  const SEAT = { sit: 1, eyes: 'closed', mouth: 'flat', earL: { a: -40, b: -30 }, earR: { a: 38, b: 28 }, armL: { a: 28, e: 30 }, armR: { a: 28, e: 30 }, pawL: 'mitt', pawR: 'mitt', noShadow: true };
  const FALL_Y = [190, 480, 770];
  function land(ctx, t) {
    const f = Math.round((t - CUT_LAND) * 24), imp = t >= LAND ? Math.exp(-(t - LAND) * 16) : 0, [sx, sy] = shake(t, 18 * imp);
    cam(ctx, 960 + sx, 540 + sy, 1 + .02 * imp, 0);
    burrow(ctx, t, { mood: 'warm', fg: false });
    const cx = 1400, holeR = [130, 115, 90, 55][f] ?? 0;
    if (holeR > 2) {
      ink(ctx, blob(cx, 110, holeR * 1.15, 5, .3, 14), { fill: mix(INK.orangeDk, INK.ink, .5), line: 6, boil: 1.6 });
      ctx.save(); clipPts(ctx, blob(cx, 110, holeR, 5, .25, 14)); vortex(ctx, { x: cx, y: 110, R: holeR * 1.1, spin: t * 6, zoom: t * 3, dots: 12 }); ctx.restore();
    }
    for (let i = 0; i < 16; i++) { const y = 120 + (t - CUT_LAND + .03 + hash(i) * .08) * (1100 + hash(i * 3.3) * 900), x = cx + (hash(i * 7.1) - .5) * 200 + (hash(i * 2) - .5) * (y - 120) * .45;
      if (y < H + 40) ink(ctx, blob(x, y, 9 + hash(i * 5) * 15, i, .35, 8), { fill: mix(INK.orangeDk, INK.ink, .55), line: 3, boil: 1 }); }
    ctx.save(); ctx.translate(cx, 1000); ctx.scale(1 + .07 * imp, 1 - .1 * imp); ctx.translate(-cx, -1000);
    officeChair(ctx, cx, 1000, .95);
    ctx.restore();
    if (f <= 2) {
      const pose = { sit: 1, sq: -.38, eyes: 'wide', mouth: 'o', earL: { a: -12, b: -25, len: 1.12 }, earR: { a: 12, b: 25, len: 1.12 }, armL: { a: 155, e: 25 }, armR: { a: 155, e: -25 }, pawL: 'open', pawR: 'open', noShadow: true };
      streaks(ctx, [cx - 170, FALL_Y[f] - 620, cx + 170, FALL_Y[f] - 250], { dir: [0, 1], n: 16, len: 340, w: 9, color: rgba(INK.paper, .75) });
      for (const [d, a] of [[2, .2], [1, .4]]) if (f - d >= 0) { ctx.save(); ctx.globalAlpha = a; rabbit(ctx, cx, FALL_Y[f - d], 30, pose); ctx.restore(); }
      rabbit(ctx, cx, FALL_Y[f], 30, pose);
    } else rabbit(ctx, cx, 870, 30, f === 3 ? { ...SEAT, sq: .62, eyes: 'x', mouth: 'open', open: .7, earL: { a: -70, b: 60 }, earR: { a: 70, b: -60 } } : { ...SEAT, sq: settle(t) });
    if (t >= LAND) {
      const age = t - LAND, du = seg(t, 10.4, 10.75);
      for (let i = 0; i < 7; i++) { const sd = i % 2 ? 1 : -1, r = (40 + hash(i) * 40) * (1 - du * .8);
        ink(ctx, blob(1400 + sd * (170 + i * 26 + du * 120), 830 - hash(i * 3) * 60 - du * 40, r, i, .25, 12), { fill: INK.paperDk, line: 4, boil: 1.2, seed: i }); }
      for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, r = 260 + age * 2600 * (.6 + hash(i + 9) * .5), a = (.1 + .5 * hash(i * 1.7)) * Math.PI;
        ctx.save(); ctx.globalAlpha = clamp(1 - age * 6); ink(ctx, blob(cx + sd * Math.cos(a) * r, 985 - Math.sin(a) * r * .22, 28 + age * 300 * hash(i + 3), i + 2, .3, 10), { fill: INK.paperDk, line: 4, boil: 1.4 }); ctx.restore(); }
      if (age < FR * 1.5) { krackle(ctx, cx, 860, 230, { n: 34, size: 20, color: INK.ink, seed: 3 }); speedLines(ctx, cx, 860, { n: 30, r0: 260, r1: 700, w: 10, color: rgba(INK.paper, .7), seed: 4 }); }
    }
    ctx.restore();
    sfx(ctx, 'THUD', 1120, 600, 170, t - LAND + FR, { rot: -.12, life: .4 });
  }

  chapter('intro', 0, 10.45, [[0, ping], [STAB - .005, watchShot], [2.62, meadowShot], [DIVE, diveShot], [DROP, fall], [CUT_LAND, land]]);
})();
