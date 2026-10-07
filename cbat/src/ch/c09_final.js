// c09_final.js: final chorus, 137.70 - 152.45. The sacred drop in the dark conference room, then the room IS the stage.
(() => {
  const T0 = 137.70, SLAM = 142.62, T1 = 152.45;
  const TIMER = 3 * 3600 + 12 * 60 + 45;                     // 03:12:45 at the drop
  const INKS = [INK.teams, INK.pink, INK.yellow];
  const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
  const kitHits = t => ({ kick: kick(t, 9), snare: snare(t, 9), crash: hit(t, [SLAM, 145.90, 148.36, 151.22], 3), hat: pulse(t, 12, .5), tom: hit(t, [150.40], 6) });
  const fmt = s => [s / 3600, s / 60 % 60, s % 60].map(v => String(Math.floor(v)).padStart(2, '0')).join(':');
  const W2 = (li, wi) => wordT(li, wi);
  const on = (t, at) => t >= at - VLEAD;

  // ---------- the 500-tile wall: batched cheap busts, no per-tile clipping ----------
  const TB = [['#BDB6AA', INK.yellow], ['#C9C3B8', INK.pink], ['#A9B3BD', INK.cyan], ['#B8B0C4', INK.teamsLt], ['#C4BBA8', INK.orangeLt]];
  const TS = [['#F1C9AE', INK.paper], ['#D9A988', INK.pinkLt], ['#B07A5A', INK.orangeLt], ['#8A5A40', '#C06A48'], ['#E8BC9C', INK.white]];
  const TH = [['#3A302C', INK.ink], ['#5E4A3E', INK.ink], ['#8A6A4A', INK.redDk], ['#C9A86A', INK.yellow], ['#B9B6B8', INK.white], ['#2A2426', INK.ink]];
  const TSH = [['#C7D3DE', INK.blue], ['#D9CFC2', INK.ink], ['#B9C4B0', INK.teams], ['#D6C0C8', INK.red], ['#A9B2C2', INK.ink], ['#E3DCC8', INK.white]];
  const TL = [['#5C7FA3', INK.cyan], ['#A3605C', INK.red], ['#7A6A9A', INK.yellow], ['#C49A4A', INK.pink]];
  const fnOr = (v, d) => typeof v === 'function' ? v : () => v ?? d;
  // tileWall(ctx, box, t, {cols, rows, gap, k, bang, sing, mute, lids, flash: per-tile values or (i, c, r) => value; vis [x0, y0, x1, y1]; skip(i); seed})
  function tileWall(ctx, [x, y, w, h], t, o = {}) {
    const cols = o.cols, rows = o.rows, g = o.gap ?? w * .003, tw = (w - g * (cols + 1)) / cols, th = (h - g * (rows + 1)) / rows;
    const K = fnOr(o.k, STYLE.k), BANG = fnOr(o.bang, 0), SING = fnOr(o.sing, 0), MUTE = fnOr(o.mute, 1), LIDS = fnOr(o.lids, 0), FL = fnOr(o.flash, 0);
    const tc = twos(t), beat = beatAt(tc + VLEAD), vis = o.vis, seed = o.seed || 1, lw0 = Math.max(.5, th * .028);
    const LY = [...Array(12)].map(() => new Map()), RP = (l, c, s = null) => { const key = c + '|' + s; let e = LY[l].get(key); if (!e) LY[l].set(key, e = { c, s, p: new Path2D() }); return e.p; };
    const oval = (p, cx, cy, rx, ry, rot = 0) => { p.moveTo(cx + rx * Math.cos(rot), cy + rx * Math.sin(rot)); p.ellipse(cx, cy, rx, ry, rot, 0, TAU); };
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols, r = (i / cols) | 0, tx = x + g + c * (tw + g), ty = y + g + r * (th + g);
      if (vis && (tx > vis[2] || tx + tw < vis[0] || ty > vis[3] || ty + th < vis[1])) continue;
      if (o.skip && o.skip(i)) continue;
      if (FL(i, c, r) > .5) { RP(0, INK.teams).rect(tx, ty, tw, th); RP(10, INK.white).rect(tx + lw0 * 1.5, ty + lw0 * 1.5, tw - lw0 * 3, th - lw0 * 3); continue; }
      const k = K(i, c, r), m = p => mix(p[0], p[1], k), ln = k < .5 ? '#3E3C44' : INK.ink;
      const h0 = hash(seed * 31 + i * 1.37), h1 = hash(seed * 7 + i * 2.11), h2 = hash(seed + i * 5.3), h3 = hash(seed * 3 + i * 7.9);
      const muted = MUTE(i, c, r), sing = SING(i, c, r), bang = BANG(i, c, r), cx = tx + tw / 2;
      if (h3 < .08) { // camera off: an initials disc
        RP(0, m(['#2E2E2E', '#2A2140'])).rect(tx, ty, tw, th);
        oval(RP(3, m([['#C8A27C', '#8BA1C9', '#B58CB5', '#86B3A4'][i % 4], [INK.yellow, INK.pink, INK.cyan, INK.orange][i % 4]]), ln), cx, ty + th * .46, th * .2, th * .2);
      } else {
        RP(0, m(TB[Math.floor(h0 * TB.length)])).rect(tx, ty, tw, th);
        const d = frac(beat + h1 * .25), nk = bang * (d < .18 ? easeOut(d / .18) : 1 - smooth((d - .18) / .82));
        const tilt = (h2 - .5) * .9 * nk, nod = nk * th * .12, rx = th * .19, ry = th * .235;
        const hx = cx + (h2 - .5) * tw * .1, hy = ty + th * .45 + nod, sy = ty + th * .77 + nod * .3, sw = Math.min(tw * .4, th * .62);
        const shirt = RP(2, m(TSH[Math.floor(h2 * TSH.length)]), ln); shirt.moveTo(cx - sw, ty + th); shirt.lineTo(cx - sw, sy + th * .1); shirt.quadraticCurveTo(cx - sw, sy, cx - sw * .5, sy);
        shirt.lineTo(cx + sw * .5, sy); shirt.quadraticCurveTo(cx + sw, sy, cx + sw, sy + th * .1); shirt.lineTo(cx + sw, ty + th); shirt.closePath();
        const skin = RP(3, m(TS[Math.floor(h0 * 7 % 1 * TS.length)]), ln); skin.rect(hx - rx * .34, hy + ry * .6, rx * .68, Math.max(0, sy - hy - ry * .5)); oval(skin, hx, hy, rx, ry, tilt);
        const hs = Math.floor(h3 * 5), hair = m(TH[Math.floor(h1 * TH.length)]), hp = RP(4, hair, ln), up = bang * (1 - nk) * k;
        if (hs === 1) oval(RP(1, hair), hx, hy + ry * .25, rx * 1.25, ry * 1.15, tilt);
        if (hs !== 3) { const hr = ry * (1.02 + up * .45), hc = hy - ry * .08 - up * ry * .3; // the hair lifts off the head on the upswing
          hp.moveTo(hx + Math.cos(Math.PI + .25 + tilt) * rx * 1.08, hc + Math.sin(Math.PI + .25 + tilt) * hr); hp.ellipse(hx, hc, rx * (1.08 + up * .12), hr, tilt, Math.PI + .25, TAU - .25); hp.closePath(); }
        if (hs === 4) oval(hp, hx + Math.sin(tilt) * ry, hy - ry * 1.15 - up * ry * .5, rx * .38, rx * .32);
        const lc = RP(7, m(TL[i % 4])); lc.moveTo(cx - sw * .38, sy + th * .01); lc.lineTo(cx, sy + th * .2); lc.lineTo(cx + sw * .38, sy + th * .01);
        const ey = hy - ry * .02, ex = rx * .4, fe = RP(5, ln), lids = LIDS(i, c, r);
        if ((sing > .5 || bang > .5) && k > .5) { fe.rect(hx - ex - rx * .15, ey, rx * .3, ry * .08); fe.rect(hx + ex - rx * .15, ey, rx * .3, ry * .08); }
        else if (lids > .4) { fe.rect(hx - ex - rx * .13, ey, rx * .26, ry * .1); fe.rect(hx + ex - rx * .13, ey, rx * .26, ry * .1); }
        else { oval(fe, hx - ex, ey, rx * .12, ry * .12); oval(fe, hx + ex, ey, rx * .12, ry * .12); }
        if (h0 > .7) { fe.rect(hx - ex - rx * .3, ey - ry * .17, rx * .6, ry * .05); fe.rect(hx + ex - rx * .3, ey - ry * .17, rx * .6, ry * .05); fe.rect(hx - rx * .12, ey - ry * .14, rx * .24, ry * .04); }
        if (sing > .08) oval(RP(6, k > .5 ? INK.redDk : '#7A3B3B'), hx, hy + ry * .55, rx * (.24 + .16 * sing), ry * .36 * sing);
        else fe.rect(hx - rx * .22, hy + ry * .5, rx * .44, ry * (bang > .5 ? .12 : .06));
      }
      if (o.labels !== false) RP(8, mix('#141414', INK.ink, k)).rect(tx + tw * .03, ty + th * .85, tw * .42, th * .11);
      oval(RP(9, muted > .5 ? mix('#C4314B', INK.red, k) : '#FFFFFF'), tx + tw * .91, ty + th * .9, th * .055, th * .055);
      if (muted > .5) RP(5, '#FFFFFF').rect(tx + tw * .91 - th * .045, ty + th * .9 - th * .009, th * .09, th * .018);
      else if (sing > .2) RP(10, mix('#7F85F5', INK.teams, k)).rect(tx + lw0 * 1.5, ty + lw0 * 1.5, tw - lw0 * 3, th - lw0 * 3);
    }
    ctx.save(); ctx.lineJoin = 'round';
    LY.forEach((mp, l) => { for (const { c, s, p } of mp.values()) {
      if (l === 7) { ctx.strokeStyle = c; ctx.lineWidth = th * .03; ctx.stroke(p); continue; }
      if (l === 10) { ctx.strokeStyle = c; ctx.lineWidth = lw0 * 3; ctx.stroke(p); continue; }
      ctx.fillStyle = c; ctx.fill(p); if (s) { ctx.strokeStyle = s; ctx.lineWidth = lw0; ctx.stroke(p); } } });
    ctx.restore();
    return { tw, th, g, box: i => [x + g + (i % cols) * (tw + g), y + g + Math.floor(i / cols) * (th + g), tw, th] };
  }
  // The Teams top bar, drawn big enough to read on a wall screen.
  function wallBar(ctx, x, y, w, h, t, k) {
    fillPts(ctx, rect(x, y, w, h), mix('#292929', '#231B33', k), false);
    const s = h * .5, cy = y + h * .52, white = '#FFFFFF';
    fillPts(ctx, ell(x + h * .42, cy, h * .13, h * .13, 12), mix('#C4314B', INK.red, k));
    txt(ctx, fmt(TIMER + Math.max(0, t - T0)), x + h * .7, cy, { font: 'mono', weight: 700, size: s, base: 'middle', color: white });
    const lw = h * 2.3, lx = x + w - lw - h * .25;
    fillPts(ctx, rrect(lx, y + h * .16, lw, h * .68, h * .12), mix('#C4314B', INK.red, k), false);
    txt(ctx, 'Leave', lx + lw / 2, cy, { font: 'ui', weight: 700, size: s * .85, align: 'center', base: 'middle', color: white });
    const px = lx - h * 2.3;
    appIcon(ctx, 'people', px, cy, s * 1.15, white);
    txt(ctx, '500+', px + s * .8, cy, { font: 'ui', weight: 800, size: s * .9, base: 'middle', color: white });
  }
  // The conference-room wall screen: the meeting.
  const wallScreen = o => (ctx, [x, y, w, h], t) => {
    const k = o.chromeK ?? 1, bh = h * .12;
    fillPts(ctx, rect(x, y, w, h), mix('#1F1F1F', INK.ink, k), false);
    wallBar(ctx, x, y, w, bh, t, k);
    tileWall(ctx, [x, y + bh, w, h - bh], t, { cols: 16, rows: 12, gap: w * .004, ...o });
  };

  // ---------- small private props ----------
  // a rolling office chair in person units (s = the sitter's scale); (x, y) = floor under the casters
  function chair(ctx, x, y, s, rot = 0, seat = INK.teams, dk = INK.ink) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const lw = 3.5 / s;
    for (const a of [-1, -.4, .4, 1]) inkLine(ctx, [[0, -.8], [a * 2.5, -.3]], .34, dk, { taper: [0, 0], smooth: false });
    for (const a of [-1, -.4, .4, 1]) ink(ctx, ell(a * 2.5, -.2, .34, .28, 10), { fill: dk, line: lw });
    ink(ctx, rect(-.22, -4, .44, 3.3), { fill: INK.paperDk, shade: { color: dk, spacing: .3, dir: [1, 0], from: 0, to: .3 }, line: lw, smooth: false });
    ink(ctx, rect(-.5, -6.2, 1, 1.8), { fill: dk, line: lw, smooth: false });
    ink(ctx, rrect(-1.7, -9.4, 3.4, 4.2, 1), { fill: seat, shade: { color: dk, spacing: .5, dir: [.6, .8], from: -.5, to: 2.8 }, line: lw, smooth: false });
    ink(ctx, rrect(-2.1, -4.7, 4.2, .85, .4), { fill: seat, shade: { color: dk, spacing: .45, dir: [0, 1], from: 0, to: .9 }, line: lw, smooth: false });
    ctx.restore();
  }
  function sheet(ctx, x, y, s, rot, flip) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(Math.max(.15, Math.abs(flip)), 1);
    ink(ctx, rect(-s * .4, -s * .5, s * .8, s), { fill: INK.white, line: 3, smooth: false, boil: .6 });
    ctx.beginPath(); for (let i = 0; i < 4; i++) ctx.rect(-s * .3, -s * .32 + i * s * .17, s * (i === 3 ? .35 : .6), s * .05); ctx.fillStyle = INK.ink; ctx.fill();
    ctx.restore();
  }
  // riso halftone background: two-ink sunburst + vignette dots
  function risoBg(ctx, t, a, b, cx = 960, cy = 540, spin = .05) {
    sunburst(ctx, cx, cy, a, b, t * spin, 20);
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - cx) / 1100, (y - cy) / 680) - .42) * 1.7) });
  }
  // stage camera: handheld drift + snare punch
  const stageCam = (t, amt = 1) => { const sn = snare(t, 9), d = drift(t, 10 * amt, .5), sh = shake(t, 9 * sn * amt); return { z: 1 + .05 * sn * amt, dx: d[0] + sh[0], dy: d[1] + sh[1], sn }; };
  // draw fn into a scratch layer under the current transform; returns the layer (pop it after use)
  function grab(ctx, fn) { const c = pushLayer(); c.setTransform(ctx.getTransform()); fn(c); return c; }
  const blit = (ctx, c, dx = 0, dy = 0, op = 'source-over') => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = op; ctx.drawImage(c.canvas, dx, dy); ctx.restore(); };
  function tint(c, color, op = 'source-atop') { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = op; c.fillStyle = color; c.fillRect(0, 0, W, H); c.restore(); }

  // ---------- 1. the sacred drop: Dan alone on the table in the dark, the meeting waiting on the wall ----------
  const LIGHT_A = 140.20, LIGHT_B = 140.99, AWAKE = 141.79;   // the three quiet snares: lights clunk on, the tiles wake up
  const NIGHT = '#343873';
  // fluorescent start-up: on, off for a frame, on
  const clunk = (t, at) => on(t, at) && !(t >= at - VLEAD + 1.5 / 24 && t < at - VLEAD + 2.5 / 24);
  function drop(ctx, t, lt, dur) {
    look(1); BOIL = .2;
    const tc = twos(t), P = CONF.P, Hc = CONF.H, [sx, sy, sw, sh] = CONF.screen;
    const litA = clunk(t, LIGHT_A), litB = clunk(t, LIGHT_B), awake = on(t, AWAKE), ant = smooth(seg(t, W2(79, 0), SLAM - .04));
    const z = lerp(2.12, 2.4, easeInOut(lt / 4.2)) + .1 * easeIn(ant);
    cam(ctx, 960, 382 - 6 * ant, z);
    const inks = [INK.nightLt, INK.blue, INK.paperDk];
    confRoom(ctx, t, { k: 1, inks, lights: 0, strobe: 0, clock: clockSecs(16, 59, 31) + lt, layer: 'back',
      screen: wallScreen({ chromeK: 0, k: 0, cols: 20, rows: 15, seed: 3, labels: false, lids: awake ? 0 : .7 }) });
    confRoom(ctx, t, { k: 1, inks, lights: 0, strobe: 0, layer: 'front' });
    // night: multiply everything but the screen and the lit pools
    const pool = (c, z0, z1, zf, w1) => { const pts = [P(-.6, Hc, z0), P(.6, Hc, z0), P(.6, Hc, z1), P(w1, 0, zf[1]), P(w1, 0, zf[0]), P(-w1, 0, zf[0]), P(-w1, 0, zf[1]), P(-.6, Hc, z1)];
      fillPts(c, pts, '#000', false); };
    const dark = grab(ctx, c => { fillPts(c, rect(-300, -300, 2600, 1700), NIGHT, false); c.globalCompositeOperation = 'destination-out';
      fillPts(c, rect(sx, sy, sw, sh), '#000', false); if (litA) pool(c, 5.4, 6.6, [5.0, 7.2], 1.3); if (litB) pool(c, 3.6, 4.8, [2.9, 5.3], 1.5); });
    blit(ctx, dark, 0, 0, 'multiply'); popLayer();
    [[3.6, 4.8, litB, [2.9, 5.3], 1.5], [5.4, 6.6, litA, [5.0, 7.2], 1.3]].forEach(([z0, z1, lit, zf, w1]) => { if (!lit) return;
      fluoro(ctx, t, [P(-.6, Hc, z1), P(.6, Hc, z1), P(.6, Hc, z0), P(-.6, Hc, z0)], { k: 1, strobe: 0, glow: INK.yellow, seed: 40 });
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .2;
      fillPts(ctx, [P(-.6, Hc, (z0 + z1) / 2), P(.6, Hc, (z0 + z1) / 2), P(w1, 0, zf[0] + .3), P(-w1, 0, zf[0] + .3)], INK.yellow, false); ctx.restore(); });
    // the screen's glow spilling onto the wall around the bezel (it swells on the third snare)
    const gl = awake ? 1.35 : 1;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    dotsIn(ctx, [sx - 90 * gl, sy - 70 * gl, sx + sw + 90 * gl, sy + sh + 40 * gl], { spacing: 6, color: INK.teams, k: (px, py) => { const ox = Math.max(0, Math.abs(px - sx - sw / 2) - sw / 2), oy = Math.max(0, Math.abs(py - sy - sh / 2) - sh / 2);
      return ox + oy < 1 ? 0 : (1 - Math.hypot(ox / (80 * gl), oy / (60 * gl))) * .8; } });
    ctx.restore();
    // Dan, alone at the far end of the table
    const [x, y, s] = CONF.at(0, .75, 6.05), so = singOpen(t, 76, 79), L77 = t >= W2(77, 0) - .1, L78 = t >= W2(78, 0) - .1;
    const pose = { stage: 1, wild: .85, rage: lerp(.2, .8, ant), sweat: .8, hold: 'mic', legs: 'wide', sq: .4 * ant, lean: -6 * ant,
      eyes: !L77 || ant > .55 ? 'closed' : 'open', lids: L78 ? .15 : .45, brows: L78 ? -.3 : .15, browTilt: L78 ? -.7 : .4, mouth: so > .05 ? 'talk' : 'flat', open: so * .6,
      nod: L77 ? -.04 + .04 * Math.sin(tc * 2.2) - .1 * ant : .25, tilt: L77 ? -2 - 4 * ant : 5, armL: { a: lerp(12, 48, ant), e: lerp(-8, -50, ant) }, handL: ant > .3 ? 'fist' : 'relax', t: tc };
    if (litA) person(ctx, x, y, s, 'dan', pose);
    else { // backlit: a deep-blue silhouette with a Teams-purple rim from the screen
      const d = grab(ctx, c => person(c, x, y, s, 'dan', pose)), rim = pushLayer(); rim.drawImage(d.canvas, 0, 0); tint(rim, INK.teamsLt, 'source-in');
      blit(ctx, rim, -5, -4); blit(ctx, rim, 5, -4); popLayer(); tint(d, rgba('#1C1F45', .86)); blit(ctx, d); popLayer(); }
    ctx.restore();
  }

  // ---------- 2. SLAM: the conference room IS the stage ----------
  function slam(ctx, t, lt, dur) {
    look(1);
    const tc = twos(t), b = beatAt(tc + VLEAD), sl = hit(t, [SLAM], 5), sn = snare(t, 10), sh = shake(t, 24 * sl + 6 * sn), hb = headbang(tc, 1, 1);
    const z = 1.02 + .12 * sl + .03 * sn;
    cam(ctx, 960 + sh[0], 410 + sh[1], z, (hash(Math.floor(t * 24)) - .5) * .03 * sl);
    confRoom(ctx, t, { k: 1, inks: INKS, strobe: 1, lights: 1, chairs: false, clock: clockSecs(16, 59, 36) + lt, layer: 'back',
      screen: wallScreen({ k: 1, cols: 14, rows: 10, bang: 1, mute: 1, seed: 5 }) });
    { // Teams purple as the stage light: rays out of the wall screen
      const [sx, sy, sw, sh2] = CONF.screen, cx = sx + sw / 2, cy = sy + sh2 * .55, e = .22 + .3 * sl + .2 * pulse(t, 5);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = e;
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .25, w = .09; fillPts(ctx, [[cx, cy], [cx + Math.cos(a - w) * 1600, cy + Math.sin(a - w) * 1600], [cx + Math.cos(a + w) * 1600, cy + Math.sin(a + w) * 1600]], i % 2 ? INK.teams : INK.pink, false); }
      ctx.restore(); }
    confRoom(ctx, t, { k: 1, inks: INKS, strobe: 1, lights: 1, layer: 'front' });
    // Bob's kit at the head of the table, in front of the wall
    const KIT = CONF.at(0, .75, 5.0), BOB = CONF.at(0, .75, 5.25), H2 = kitHits(t);
    drumKit(ctx, ...KIT, t, { layer: 'back', hits: H2, inks: INKS });
    person(ctx, ...BOB, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(b * 2 + .5), r: stroke(b * 2) }, mouth: 'scream', open: .9, rage: 1, sweat: 1, nod: hb.nod * .5, tilt: hb.tilt * .5, t: tc });
    drumKit(ctx, ...KIT, t, { layer: 'front', hits: H2, inks: INKS });
    // the empty chairs launch off the far seats and tumble out of the room
    const dt = t - SLAM + .12;
    if (dt > 0) for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1, z0 = i < 2 ? 6.4 : 5.6;
      const X = sd * (1.9 + dt * (2.6 + hash(i) * 1.2)), Y = dt * (5 + hash(i * 3) * 1.6) - 4.9 * dt * dt, zz = z0 - dt * .5;
      const p = CONF.P(X, Y, zz); chair(ctx, p[0], p[1], .175 * CONF.f / zz, sd * dt * (3 + hash(i * 5) * 2), INK.teamsLt, INK.paperDk); }
    // Linda and Tasha standing on chairs either side of the table
    for (const [who, X, pose] of [['linda', -1.42, { hold: 'guitar', strum: frac(tc * 4.8), fret: .4 + .2 * Math.sin(tc * 3), turn: .35, lids: .5, mouth: 'flat', lean: 5, legs: 'wide' }],
      ['tasha', 1.42, { hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.35, ...hb, eyes: 'closed', mouth: 'scream', open: .7, rage: 1, legs: 'wide' }]]) {
      const [cx, cy, cs] = CONF.at(X, 0, 3.6); chair(ctx, cx, cy, cs); person(ctx, cx, cy - 4.7 * cs, cs, who, { ...pose, t: tc }); }
    // Dan: coming down out of the jump on the cut, lands on "clean"
    const D = CONF.at(-.45, .75, 2.7), j = jumpArc(t, SLAM - .3, .4, 1.2);
    person(ctx, D[0], D[1], D[2], 'dan', { ...j, legs: j.hop > .2 ? 'jump' : 'wide', stage: 1, wild: 1, rage: 1, hold: 'mic', armL: { a: 160, e: 10 }, handL: 'horns', turn: .3, lean: 7, tilt: -8 + hb.tilt * .5, nod: j.hop > .2 ? 0 : hb.nod * .6, swing: j.vy * 30, sweat: 1, spit: 1, open: .7 + .3 * singOpen(t, 79, 80), t: tc });
    // a few sheets of paper off the table
    const pt = t - SLAM + .04;
    if (pt > 0) for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, a = -Math.PI / 2 + sd * (.5 + hash(i * 9.1) * .9), v = 800 + hash(i * 4.3) * 700, o = CONF.P(sd * .7, .8, 2.6 + hash(i * 2) * 2);
      sheet(ctx, o[0] + Math.cos(a) * v * pt + Math.sin(pt * 6 + i) * 30, o[1] + Math.sin(a) * v * pt + 900 * pt * pt, 80 + hash(i * 5) * 40, i + pt * (3 + hash(i * 3) * 4), Math.cos(pt * 8 + i)); }
    ctx.restore();
    // the crowd packing the room, in front of the table
    ctx.save(); ctx.translate(sh[0], sh[1]);
    crowd(ctx, t, [-40, 880, 2000, 260], 34, { seed: 9, jump: 1, headbang: .7, inks: INKS, k: 1, style: 'silhouette', view: 'back', hands: .7, phones: .25, size: 56 });
    ctx.restore();
    flash(ctx, INK.paper, hit(t, [SLAM], 24) * .85);
    misregFrame(ctx, 12 * sl + 5 * sn, -.4);
  }

  // ---------- 3. trapped inside a meeting: Dan pounding on the glass of his tile among polite muted coworkers ----------
  const POUND = [144.25, W2(80, 5), 145.07];                  // crack, crack, shatter
  function trapped(ctx, t, lt, dur) {
    const tc = twos(t), sn = snare(t, 9), SH = POUND[2], shat = on(t, SH), sa = since(t, SH - VLEAD), cr = hit(t, POUND, 9), sh = shake(t, 3 + 16 * cr);
    look(shat ? 1 : 0);
    fillPts(ctx, rect(0, 0, W, H), shat ? '#1B1530' : '#1F1F1F', false);
    const z = 1 + .04 * sn + .22 * easeIn(clamp(sa / .45)), TW = 860, TH = 484, g = 14;
    ctx.save(); ctx.translate(960 + sh[0], 600 + sh[1]); ctx.scale(z, z);
    const box = (c, r) => [c * (TW + g) - TW / 2, r * (TH + g) - TH / 2, TW, TH];
    for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) { if (!r && !c) continue; const seed = 40 + (r + 1) * 3 + c + 1, greg = r === 1 && c === 1;
      teamsTile(ctx, box(c, r), t, { who: greg ? 'greg' : seed, muted: true, speaking: greg && !shat, look: shat && !greg ? 1 : 0, bg: greg ? 'bookshelf' : shat ? 'stage' : undefined, depth: 0,
        pose: greg ? { mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(tc * 7)), t: tc }
          : shat ? { ...headbang(tc + seed * .07, 1, 1.1), rage: .9, wild: 1, mouth: 'scream', open: .9, eyes: 'closed', t: tc }
          : { glare: hash(seed) > .5 ? 1 : 0, mouth: 'polite', lids: blink(tc, seed), nod: .05 * Math.sin(tc * 2 + seed), t: tc } }); }
    // Dan's tile: hands flat on the glass, then fists
    const [bx, by, bw, bh] = box(0, 0), F = bustFit([bx, by, bw, bh], 'dan', { zoom: 1.2, dy: .22 }), fist = cr > .35;
    const danPose = { view: 'bust', stage: 1, wild: 1, rage: 1, spit: 1, sweat: 1, open: .75 + .25 * singOpen(t, 80, 81), tilt: -4 + 6 * cr, nod: -.1 + .15 * cr,
      reachL: [bx + bw * .13, by + bh * (.5 + .08 * cr)], reachR: [bx + bw * .87, by + bh * (.46 + .08 * cr)], handL: fist ? 'fist' : 'open', handR: fist ? 'fist' : 'open', t: tc };
    look(1);
    teamsTile(ctx, [bx, by, bw, bh], t, { who: 'dan', name: 'Dan Kowalski', muted: false, speaking: true, depth: 0,
      draw: (c, bb, tt) => { look(1); risoBg(c, tt, INK.red, INK.pink, bx + bw / 2, by + bh / 2, .2); if (!shat) person(c, F.x, F.y, F.s, 'dan', danPose); } });
    // the glass: a glare stripe, star cracks at each pound, then the shatter
    ctx.save(); clipPts(ctx, rect(bx, by, bw, bh), false);
    if (!shat) { ctx.globalAlpha = .2; fillPts(ctx, [[bx + bw * .55, by], [bx + bw * .68, by], [bx + bw * .42, by + bh], [bx + bw * .29, by + bh]], INK.white, false); ctx.globalAlpha = 1; }
    POUND.slice(0, 2).forEach((p, q) => { if (!on(t, p) || shat) return; const ox = bx + bw * (q ? .86 : .14), oy = by + bh * (q ? .44 : .5), rr = 90 + 50 * clamp((t - p) / .1);
      for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + hash(q * 9 + i), pts = [[ox, oy]]; for (let s2 = 1; s2 < 6; s2++) { const aa = a + (hash(q * 50 + i * 7 + s2) - .5) * .5; pts.push([ox + Math.cos(aa) * s2 * rr * .45, oy + Math.sin(aa) * s2 * rr * .45]); }
        inkLine(ctx, pts, 7, INK.ink, { taper: [0, .9], smooth: false }); inkLine(ctx, pts, 3.5, INK.white, { taper: [0, .9], smooth: false }); }
      for (const f of [.35, .7]) outline(ctx, ell(ox, oy, rr * f, rr * f * .9, 9, q), 3.5, INK.white, { smooth: false }); });
    ctx.restore();
    if (shat) { // Dan bursts out of his tile toward the camera
      const k2 = easeOut(clamp(sa / .3)), F2 = bustFit([bx, by, bw, bh], 'dan', { zoom: lerp(1.2, 2.0, k2), dy: lerp(.22, .02, k2) });
      person(ctx, F2.x, F2.y + 80 * k2, F2.s, 'dan', { ...danPose, reachL: null, reachR: null, armL: { a: 155, e: 25 }, armR: { a: 155, e: 25 }, handL: 'fist', handR: 'fist', open: 1, tilt: -6 });
      for (let i = 0; i < 26; i++) { const a = hash(i * 3.3) * TAU, v = 500 + hash(i * 7.7) * 1400, d = v * sa, ox = bx + bw * hash(i * 1.9), oy = by + bh * hash(i * 2.9);
        const px = ox + Math.cos(a) * d, py = oy + Math.sin(a) * d + 900 * sa * sa, r = 30 + hash(i * 5) * 70;
        ink(ctx, xform([[0, -r], [r * .6, r * .3], [-r * .4, r * .5]], px, py, 1, sa * 8 * (hash(i) - .5)), { fill: i % 3 ? INK.white : INK.cyan, line: 3, smooth: false }); } }
    ctx.restore();
    flash(ctx, INK.white, hit(t, [SH], 14) * .8);
    misregFrame(ctx, shat ? 10 * cr : 0, .3);
  }

  // ---------- 4. crowd-surfing on rolling chairs ----------
  function surf(ctx, t, lt, dur) {
    look(1);
    const tc = twos(t), b = beatAt(tc + VLEAD), C = stageCam(t), u = lt / dur;
    cam(ctx, 960 + C.dx * .4, 330 + C.dy * .4, 1.5);
    confRoom(ctx, t, { k: 1, inks: INKS, strobe: 1, lights: 1, chairs: false, layer: 'back', screen: wallScreen({ k: 1, cols: 14, rows: 10, bang: 1, mute: 1, seed: 5 }) });
    ctx.restore();
    ctx.save(); ctx.translate(960 + C.dx, 540 + C.dy); ctx.scale(C.z, C.z); ctx.translate(-960, -540);
    crowd(ctx, t, [-80, 640, 2080, 420], 30, { seed: 21, jump: .7, headbang: .6, inks: INKS, k: 1, style: 'silhouette', view: 'back', hands: .9, phones: .2, size: 44 });
    // riders on rolling chairs, carried overhead on the crowd's forearms
    const ride = (x, y, s, who, ph, tilt, pose) => { const lift = Math.abs(Math.sin((b + ph) * Math.PI)) * s * .3, rot = tilt + Math.sin((b + ph) * Math.PI * .5) * .08;
      ctx.save(); ctx.translate(x, y - lift);
      [-2.6, -1.5, -.4, .7, 1.8, 2.8].forEach((a, i) => { const hx = a * s * Math.cos(rot), hy = a * s * Math.sin(rot) + .2 * s;
        ink(ctx, tube([[hx + a * s * .15, hy + 3.4 * s + lift], [hx, hy]], () => s * .5), { fill: INK.night, line: 3 });
        ink(ctx, ell(hx, hy - s * .1, s * .42, s * .36, 12), { fill: INK.night, line: 3 }); });
      ctx.rotate(rot); chair(ctx, 0, 0, s, 0); person(ctx, 0, 0, s, who, { sit: 1, noShadow: true, t: tc, ...pose });
      ctx.restore(); };
    ride(lerp(380, 470, u), 760, 36, 12, .5, .12, { armL: { a: 150, e: 10 }, armR: { a: 165, e: 5 }, handL: 'fist', handR: 'horns', rage: 1, wild: 1, mouth: 'scream', open: 1, turn: .3 });
    ride(lerp(1180, 1330, easeInOut(u)), 860, 80, 'linda', 0, -.1, { hold: 'guitar', strum: frac(tc * 4.8), fret: .35 + .25 * Math.sin(tc * 3), lids: .5, mouth: 'flat', turn: -.3, lean: -6, sweat: .3 });
    crowd(ctx, t, [-80, 920, 2080, 220], 13, { seed: 4, jump: .9, headbang: .5, inks: INKS, k: 1, style: 'silhouette', view: 'back', hands: .5, phones: .3, size: 90 });
    ctx.restore();
    misregFrame(ctx, 6 * C.sn, -.3);
  }

  // ---------- 5. "Nobody needed your voice": the speakerphone under Dan's boot ----------
  const STOMP = W2(83, 3);                                    // "voice"
  function starfish(ctx, cx, cy, r, crush, t) {
    const sq = lerp(.42, .2, crush), pts = [];
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3, rr = (i % 2 ? r * .42 : r) * (1 + crush * .12 * (hash(i) - .3)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sq]); }
    fillPts(ctx, pts.map(([x, y]) => [x + 12, y + 16]), INK.ink, true);
    ink(ctx, pts, { fill: INK.paperDk, shade: { color: INK.ink, spacing: 16, dir: [0, 1], from: 0, to: r * sq * 1.3, max: .55 }, line: 6 });
    ink(ctx, ell(cx, cy - 4, r * .36, r * .36 * sq, 18), { fill: INK.ink, line: 4 });
    if (!crush) { ctx.save(); ctx.translate(cx, cy - 6); ctx.scale(1, sq * 1.6); teamsLogo(ctx, 0, 0, r * .4); ctx.restore(); }
    for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + (i - 1) * TAU / 3, lit = !crush && Math.floor(t * 6 + i) % 3 === 0; ink(ctx, ell(cx + Math.cos(a) * r * .66, cy + Math.sin(a) * r * .66 * sq, 18, 11, 10), { fill: lit ? INK.cyan : INK.ink, line: 3 }); }
    if (crush) for (let i = 0; i < 5; i++) { const a = hash(i * 4.4) * TAU, p = [[cx, cy]]; for (let s = 1; s < 4; s++) p.push([cx + Math.cos(a + (hash(i + s) - .5) * .6) * r * .3 * s, cy + Math.sin(a + (hash(i * 2 + s) - .5) * .6) * r * .3 * s * sq]); inkLine(ctx, p, 5, INK.white, { taper: [0, .8], smooth: false }); }
  }
  function stomp(ctx, t, lt, dur) {
    look(1);
    const tc = twos(t), st = on(t, STOMP), sa = since(t, STOMP - VLEAD), C = stageCam(t, .8), hk = hit(t, [STOMP], 7), shk = shake(t, 28 * hk);
    risoBg(ctx, t, INK.teams, INK.pink, 1150, 380, .06);
    // camera: low on the table at the speakerphone, then pulls out to the whole of Dan
    const s = 150, fx = 1200, dy = 1000, dx = fx - 1.05 * s - 30, rev = easeInOut(seg(t, STOMP + .22, STOMP + .95)), Zs = lerp(1, .58, rev) * C.z;
    ctx.save(); ctx.translate(960 + C.dx + shk[0], 540 + C.dy + shk[1]); ctx.scale(Zs, Zs); ctx.translate(-lerp(fx - 170, dx + 140, rev), -lerp(720, 290, rev));
    // the table top, seen from just above it
    ink(ctx, [[-1400, dy - 175], [3400, dy - 175], [3400, dy + 900], [-1400, dy + 900]], { fill: INK.yellow, shade: { color: INK.orange, spacing: 24, dir: [0, 1], from: 60, to: 420, max: .7 }, line: 6, smooth: false });
    // Dan: the boot hangs over the speakerphone, then comes down on "voice"
    const raise = st ? 0 : smooth(seg(t, W2(83, 0) - .5, STOMP - .14)), sq = st ? .16 * Math.exp(-sa * 12) : 0, stepH = st ? .34 : .34 + 2.3 * raise;
    starfish(ctx, fx, dy - 48, 300, st ? 1 : 0, t);
    // Greg's voice, rising out of it
    const VOICE = ['so, quick question', 'just to level-set', 'can everyone hear me?', 'let\u2019s circle back'], vAt = i => W2(83, 0) - .3 + i * .22;
    if (!st) VOICE.forEach((s2, i) => { const age = t - vAt(i); if (age < 0) return; let slot = 0; for (let j = i + 1; j < VOICE.length; j++) slot += easeOut(clamp((t - vAt(j)) / .14));
      const k = backOut(clamp(age / .18), 2); ctx.save(); ctx.translate(fx + 250 + (i % 2) * 50, dy - 250 - slot * 96); ctx.scale(k, k); ctx.rotate(i % 2 ? .03 : -.04);
      const m2 = measure(ctx, s2, { font: 'ui', weight: 700, size: 46 }); fillPts(ctx, rrect(-12, -46, m2.w + 56, 84, 40), INK.ink, false); ink(ctx, rrect(-22, -56, m2.w + 48, 80, 38), { fill: INK.white, line: 5, smooth: false });
      txt(ctx, s2, 0, 0, { font: 'ui', weight: 700, size: 46, color: INK.ink }); ctx.restore(); });
    if (!st) { const lx = fx + 200, ly = dy + 40; ink(ctx, rrect(lx, ly, 470, 70, 12), { fill: INK.ink, line: 3, smooth: false }); appIcon(ctx, 'mic', lx + 42, ly + 35, 40, INK.white);
      txt(ctx, 'Greg Hollis (He/Him)', lx + 76, ly + 48, { font: 'ui', weight: 700, size: 36, color: INK.white }); }
    person(ctx, dx, dy, s, 'dan', { stage: 1, wild: 1, rage: 1, spit: st ? 1 : .3, sweat: 1, hold: 'mic', legs: 'step', stepH, turn: .45, sq, noShadow: true, lean: st ? 8 : -9 * raise,
      armL: { a: st ? 155 : 70 + 20 * raise, e: st ? 15 : 50 }, handL: st ? 'horns' : 'fist', mouth: 'scream', open: st ? .7 + .3 * singOpen(t, 83, 83) : .45, eyes: st ? 'rage' : 'wide', tilt: st ? -8 : 4, t: tc });
    if (st && sa < .6) { // crunch: sparks and the SFX
      for (let i = 0; i < 14; i++) { const a = -Math.PI * (.08 + .84 * hash(i * 2.3)), d = 120 + sa * (700 + 700 * hash(i * 7)), px = fx + Math.cos(a) * d, py = dy - 50 + Math.sin(a) * d * .7 + 900 * sa * sa;
        ink(ctx, star(px, py, 26 + 20 * hash(i), .4, 4, i), { fill: i % 2 ? INK.yellow : INK.cyan, line: 4 }); }
      sfx(ctx, 'CRUNCH!', fx + 330, dy - 560, 170, sa, { rot: .12, color: INK.yellow, life: .45 }); }
    ctx.restore();
    flash(ctx, INK.yellow, hk * .5);
    misregFrame(ctx, 14 * hk + 4 * C.sn, .2);
  }

  // ---------- 6-9. rage-1 close-ups of the band on the snares (faces framed under the two-row ransom line) ----------
  // close(who, [ink a, ink b], pose(t, tc, lt), {x, y, hh, rot}): the head centred at (x, y), hh px chin to crown
  const close = (who, bg, pose, o = {}) => (ctx, t, lt) => {
    look(1); const tc = twos(t), C = stageCam(t, 1.4), x = o.x ?? 960, y = o.y ?? 660, p = pose(t, tc, lt), z = C.z * (1 + lt * .06) * (p.zoom || 1);
    risoBg(ctx, t, bg[0], bg[1], x, y, .14);
    ctx.save(); ctx.translate(x + C.dx, y + C.dy); ctx.scale(z, z); ctx.rotate(o.rot || 0); ctx.translate(-x, -y);
    const F = headFit(x, y, o.hh ?? 540, who);
    person(ctx, F.x, F.y, F.s, who, { view: 'bust', stage: 1, rage: 1, sweat: 1, spit: 1, mouth: 'scream', open: 1, t: tc, ...p });
    ctx.restore();
    misregFrame(ctx, 10 * C.sn + 14 * (p.punch || 0), .4);
  };
  const FLIP = 148.77;                                        // Linda: deadpan HR shredding, then death metal on the kick
  const closeLinda = close('linda', [INK.yellow, INK.pink], (t, tc) => { const f = on(t, FLIP), pk = hit(t, [FLIP], 8);
    return { hold: 'guitar', strum: frac(tc * 6), fret: .8, turn: .25, tilt: f ? -6 : 4, rage: f ? 1 : 0, sweat: f ? 1 : .2, spit: f ? 1 : 0,
      mouth: f ? 'scream' : 'flat', open: f ? 1 : 0, lids: f ? 0 : .55, zoom: 1 + .12 * pk, punch: pk }; }, { x: 900, rot: -.05 });
  const closeTasha = close('tasha', [INK.cyan, INK.teams], (t, tc) => ({ hold: 'bass', strum: frac(tc * 2.4), fret: .7, ...headbang(tc, .5, 1.2), eyes: 'closed' }));
  const closeBob = close('bob', [INK.red, INK.yellow], (t, tc) => { const b = beatAt(tc + VLEAD), l = stroke(b * 2 + .5), r = stroke(b * 2);
    return { hold: 'sticks', armL: { a: 150 - 50 * l, e: 40 }, armR: { a: 150 - 50 * r, e: 40 }, eyes: 'wide', ...headbang(tc, .5, .6) }; }, { y: 620 });
  const closeDan = close('dan', [INK.red, INK.teams], (t, tc) => { const pk = hit(t, [150.81], 7);
    return { wild: 1, open: .8 + .2 * singOpen(t, 84, 85), tilt: -6 + noise1(tc * 3) * 3, zoom: 1 + .1 * pk, punch: pk }; }, { hh: 580, y: 650, rot: -.04 });

  // ---------- 10. "And everybody's thinking:" the 500 tiles unmute in a wave from Dan's tile ----------
  function unmute(ctx, t, lt, dur) {
    look(1);
    const tc = twos(t), ev = W2(85, 1), think = W2(85, 2), u = easeInOut(seg(t, 151.06, T1 - .08)), z = lerp(3.2, 1.0, u);
    const cols = 25, rows = 20, top = 64, gc = 12, gr = 10, dc = 11;           // Greg's tile at the centre, Dan's to its left
    const gw = W * z, gh = (H - top) * z, fx = (gc + .5) / cols, fy = (gr + .5) / rows;
    const gx = lerp(960, 960, u) - fx * gw + (1 - u) * (W / cols * z * .5), gy = top + lerp(540, (H - top) / 2, u) - fy * gh + (1 - u) * 20;
    fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
    const GI = gr * cols + gc, wave = (c, r) => ev - .06 + Math.hypot(c - dc, (r - gr) * 1.3) * .042;
    const unm = (i, c, r) => i !== GI && t >= wave(c, r) - VLEAD, pulse1 = (i, c, r) => unm(i, c, r) && t < wave(c, r) - VLEAD + 1 / 24;
    const big = gh / rows > 150, near = (c, r) => big && Math.abs(c - gc) <= 2 && Math.abs(r - gr) <= 1;
    const R = tileWall(ctx, [gx, gy, gw, gh], t, { cols, rows, gap: 4 * z, seed: 8, vis: [0, 0, W, H], skip: i => i === GI || near(i % cols, (i / cols) | 0),
      k: (i, c, r) => unm(i, c, r) ? 1 : 0, mute: (i, c, r) => unm(i, c, r) ? 0 : 1, bang: (i, c, r) => unm(i, c, r) ? .6 : 0, lids: .6,
      sing: (i, c, r) => !unm(i, c, r) ? 0 : t < think - .1 ? .45 : .95, flash: pulse1 });
    // the near tiles get the real rig; Greg's tile stays pastel, too close, still talking, on mute
    for (let r = gr - 1; r <= gr + 1; r++) for (let c = gc - 2; c <= gc + 2; c++) { const i = r * cols + c, greg = i === GI; if (!greg && !near(c, r)) continue;
      const bb = R.box(i), u2 = unm(i, c, r), dan = c === dc && r === gr;
      if (pulse1(i, c, r)) { fillPts(ctx, rect(...bb), INK.teams, false); outline(ctx, rect(bb[0] + 8, bb[1] + 8, bb[2] - 16, bb[3] - 16), 8, INK.white, { smooth: false }); continue; }
      if (greg) { teamsTile(ctx, bb, t, { who: 'greg', muted: true, look: 0, cam: 'forehead', camK: .4, depth: 0, pose: { mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(tc * 7)), t: tc } }); continue; }
      teamsTile(ctx, bb, t, { who: dan ? 'dan' : 60 + i, muted: !u2, speaking: u2, look: u2 ? 1 : 0, bg: u2 ? 'stage' : undefined, depth: 0,
        pose: u2 ? { rage: .8, wild: 1, stage: 1, mouth: 'scream', open: t < think - .1 ? .5 : 1, eyes: 'closed', ...headbang(tc + i * .05, 1, .6), t: tc } : { glare: hash(i) > .5 ? 1 : 0, mouth: 'polite', lids: .4, t: tc } }); }
    wallBar(ctx, 0, 0, W, top, t, 1);
  }

  chapter('final', T0, T1, [
    [T0, drop],
    [SLAM, slam],
    [W2(80, 2) - .05, trapped],
    [145.60, surf],
    [W2(83, 0), stomp],
    [148.52, closeLinda],
    [149.18, closeTasha],
    [149.58, closeBob],
    [149.99, closeDan],
    [151.06, unmute],
  ]);

  Object.assign(LYRICS, {
    76: { mode: 'sub', y: 1010, size: 52 }, 77: { mode: 'sub', y: 1010, size: 52 }, 78: { mode: 'sub', y: 1010, size: 52 },
    79: [{ mode: 'sub', y: 1010, size: 52, until: SLAM - VLEAD }, { mode: 'ransom', box: [1040, 800, 820, 250], words: [5], rows: [1], after: SLAM - VLEAD }],
    80: { mode: 'ransom', box: [140, 836, 1640, 220], rows: [3, 3] },
    81: { mode: 'ransom', box: [140, 24, 1640, 230], rows: [2, 2] },
    82: { mode: 'ransom', box: [60, 30, 900, 300], rows: [3, 3] },
    83: { mode: 'ransom', box: [40, 80, 720, 540], rows: [2, 2, 2, 2] },
    84: { mode: 'ransom', box: [140, 24, 1640, 300], rows: [5, 6] },
    85: { mode: 'ransom', box: [120, 860, 1680, 190], rows: [3] },
  });
})();
