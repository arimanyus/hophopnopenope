// c02_chorus1.js: chorus 1 + tag (20.62 - 41.15). The unmute, the first stage reveal, the logo drops, the split,
// the email, no depth, the unison jump, the chant.
(() => {
  const W_ = (li, wi) => wordT(li, wi);
  const SLAM = 22.30, GOD = W_(20, 0), TEXT = W_(20, 6);
  const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
  const hits = t => ({ kick: kick(t, 9), snare: snare(t, 9), tom: 0, crash: hit(t, [SLAM, GOD, TEXT, 40.98], 3), hat: pulse(t, 12, .5) });
  const beat = t => beatAt(t + VLEAD);

  // ---------- the band on the STAGE set ----------
  function bobPose(t, o = {}) {
    const tc = twos(t), b = beat(tc), h = headbang(tc, 1, .7);
    return { sit: 1, hold: 'sticks', hits: { l: stroke(b + .5), r: stroke(b) }, mouth: 'grin', rage: .6, twitch: 0, eyes: 'wide', sweat: 1, nod: h.nod * .5, tilt: h.tilt * .5, t: tc, ...o };
  }
  function lindaPose(t, o = {}) {
    const tc = twos(t), b = beat(tc);
    return { hold: 'guitar', strum: frac(tc * 4.8), fret: .35 + .25 * Math.sin(tc * 5), legs: 'step', stepH: 1.3, turn: .35, lids: .5, mouth: 'flat', lean: -4 + 3 * Math.sin(b * Math.PI), t: tc, ...o };
  }
  function tashaPose(t, o = {}) {
    const tc = twos(t), h = headbang(tc, 2, .5);
    return { hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.35, lids: .5, legs: 'wide', nod: h.nod * .4, tilt: h.tilt * .4, t: tc, ...o };
  }
  function danPose(t, o = {}) {
    const tc = twos(t), h = headbang(tc, 2, .6);
    return { hold: 'micstand', micAt: STAGE.mic, rage: 1, stage: 1, wild: 1, legs: 'wide', turn: .15, lean: 12 + h.lean * .4, tilt: -6 + h.tilt * .4, nod: h.nod * .3, swing: h.swing,
      open: .45 + .55 * singOpen(tc, 12, 23), t: tc, ...o };
  }
  // the merged poses stageBand() draws, so close-ups can aim at the same heads
  function bandPoses(t, o = {}) {
    const j = o.jump || { hop: 0, sq: 0, vy: 0 }, air = j.hop > .15 ? { legs: 'jump' } : {}, J = { hop: j.hop, sq: j.sq, vy: j.vy };
    return { linda: lindaPose(t, { ...J, ...air, ...o.linda }), tasha: tashaPose(t, { ...J, ...air, ...o.tasha }), bob: bobPose(t, o.bob),
      dan: danPose(t, { ...J, ...(j.hop > .15 ? { legs: 'jump', swing: j.vy * 40 } : {}), ...o.dan }) };
  }
  // head centre of a rig in world coords (dry run off screen)
  function headOf(x, y, s, who, pose) { const L = pushLayer(), A = person(L, x, y, s, who, pose); popLayer(); return A.head; }
  // camera that puts world point p at screen (sx, sy)
  const aim = (ctx, p, z, rot = 0, sx = 960, sy = 600) => cam(ctx, p[0] - (sx - 960) / z, p[1] - (sy - 540) / z, z, rot);
  // stage(): back layer (with Bob in the kit), the three front-line players, the front layer (smoke, lip, crowd).
  function stageBand(ctx, t, o = {}) {
    const P = bandPoses(t, o);
    if (o.behindBob) {
      stage(ctx, t, { inks: 'hot', strobe: 1, lights: 1, hits: hits(t), kit: 'back' });
      o.behindBob(ctx); person(ctx, ...STAGE.bob, 'bob', P.bob); drumKit(ctx, ...STAGE.kit, t, { layer: 'front', hits: hits(t) });
    } else stage(ctx, t, { inks: 'hot', strobe: 1, lights: 1, hits: hits(t), drummer: (c, _, tt) => person(c, ...STAGE.bob, 'bob', bobPose(tt, o.bob)) });
    if (o.linda !== false) person(ctx, ...STAGE.linda, 'linda', P.linda);
    if (o.tasha !== false) person(ctx, ...STAGE.tasha, 'tasha', P.tasha);
    let A = null; if (o.dan !== false) A = person(ctx, ...(o.danAt || STAGE.dan), 'dan', P.dan);
    if (o.after) o.after(ctx, A);
    stage(ctx, t, { fg: true, inks: 'hot', smoke: o.smoke ?? .1, crowd: o.crowd ?? 110, jump: .95, headbang: .6, seed: 3 });
    return A;
  }
  // a riso paper plane seen from above (the Send glyph), nose along +x, size = length px
  function plane(ctx, x, y, size, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(size / 2, size / 2);
    const L = [[1, 0], [-1, -.78], [-.55, 0]], R = [[1, 0], [-.55, 0], [-1, .78]];
    fillPts(ctx, [[1.08, .1], [-.92, -.68], [-.92, .9]], INK.ink, false);
    ink(ctx, L, { fill: INK.white, line: .06, smooth: false, boil: .01 });
    ink(ctx, R, { fill: INK.yellow, shade: { color: INK.pink, spacing: .09, dir: [-.3, 1], from: -.2, to: .6 }, line: .06, smooth: false, boil: .01 });
    inkLine(ctx, [[-.55, 0], [1, 0]], .05, INK.ink, { taper: [0, .3], smooth: false });
    ctx.restore();
  }

  // ---------- A. 20.62 the sacred stop: the mic button flips, Dan inhales ----------
  const FLIP = 20.631;
  function micButton(ctx, t) {
    look(0);
    const press = hit(t, [FLIP], 22), sl = 1 - clamp((t - (FLIP - VLEAD)) / (2 / 24)), on = t >= FLIP - VLEAD;
    fillPts(ctx, rrect(1050, 560, 1000, 620, 44), INK.teamsBar, false);
    fillPts(ctx, rect(1050, 560, 1000, 8), '#3D3D3D', false);
    const cx = 1430, cy = 780, sc = 1 - press * .07;
    ctx.save(); ctx.translate(cx, cy + 40); ctx.scale(sc, sc); ctx.translate(-cx, -cy - 40);
    fillPts(ctx, rrect(1150, 600, 560, 440, 34), on ? '#3A3A3A' : '#333333', false);
    // the audio level filling the mic capsule as he sings, then inhales
    const lvl = on ? clamp(kf(t, [[20.66, .06], [21.9, .5], [22.04, .55], [22.27, 1]], easeInOut) * (.9 + .1 * singOpen(t, 12, 12))) : 0, sz = 330, u = sz / 20;
    if (lvl > 0) { ctx.save(); ctx.translate(cx - 10 * u, cy - 10 * u); ctx.scale(u, u); clipPts(ctx, rrect(7.25, 2.5, 5.5, 10, 2.75), false); fillPts(ctx, rect(6, 12.5 - 10 * lvl, 8, 10.5), INK.red, false); ctx.restore(); }
    appIcon(ctx, 'mic', cx, cy, sz, '#FFFFFF', { w: 1.35 });
    if (sl > 0) { ctx.save(); ctx.translate(cx - 10 * u, cy - 10 * u); ctx.scale(u, u); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(3 + 14 * sl, 3 + 14 * sl); ctx.strokeStyle = '#333333'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.35; ctx.stroke(); ctx.restore(); }
    appIcon(ctx, 'chevron', cx + 230, cy - 6, 90, '#D6D6D6', { w: 1.6 });
    txt(ctx, 'Mic', cx, cy + 215, { font: 'ui', size: 92, weight: 500, color: '#D6D6D6', align: 'center', base: 'middle' });
    ctx.restore();
    pointer(ctx, 1590, 880, 150, { click: on ? clamp(1 - (t - FLIP) / .3) : 0, color: INK.red });
    look(1);
  }
  function unmute(ctx, t) {
    BOIL = 0; if (t < 20.655) FRAME.lyrics = false;
    const tc = twos(t), inh = smooth(seg(tc, 22.0, 22.25)), sing = singOpen(tc, 12, 12);
    look(1);
    dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.red, k: (x, y) => clamp(Math.hypot(x - 560, y - 560) / 900 - .25) * .9 });
    const F = headFit(560, 505, 540, 'dan');
    person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', stage: 0, turn: .38, rage: .3, twitch: 0, wild: .45, glare: 0, eyes: inh > .5 ? 'closed' : 'wide', lids: 0, lx: .8, ly: .35,
      brows: .3 + inh * .25, browTilt: .5, mouth: inh > .25 ? 'o' : 'talk', open: inh > .25 ? .3 + .2 * inh : .12 + sing * .45, nostrils: inh, nod: -.28 * inh, tilt: -3 * inh, sweat: .4, t: 20.62 });
    duotone(ctx, INK.redDk, INK.paper, 1.25);
    micButton(ctx, t);
  }

  // ---------- B1. 22.30 SLAM: the band, the crowd, the colour ----------
  function slam(ctx, t) {
    const k0 = hit(t, [SLAM], 5), e = expoOut(seg(t, SLAM + .06, SLAM + .4)), z = lerp(3.4, 1.3, e), sh = shake(t, 26 * k0 + 6 * snare(t, 10));
    const h0 = headOf(...STAGE.dan, 'dan', bandPoses(SLAM, { jump: jumpArc(SLAM, 22.12, .56, 2.4) }).dan);
    cam(ctx, lerp(h0[0], 960, e) + sh[0], lerp(h0[1] - 100 / 3.4, 610, e) + sh[1], z, lerp(-.06, 0, e));
    stageBand(ctx, t, { jump: jumpArc(t, 22.12, .56, 2.4) });
    ctx.restore();
    // "send": a paper plane launches off the mic and flies at the lens
    const p = seg(t, W_(13, 2) - VLEAD, 22.9);
    if (p > 0 && p < 1) {
      const e = easeIn(p), x = lerp(1110, 1780, e), y = lerp(480, 250, e), r = -.45 + .25 * e, s = 170 * Math.pow(8, p);
      streaks(ctx, [x - s * 1.1, y - s * .35, x - s * .5, y + s * .35], { dir: [Math.cos(r), Math.sin(r)], n: 7, len: s * .9, w: 3 + s * .015, color: INK.ink });
      plane(ctx, x, y, s, r);
    }
    flash(ctx, INK.yellow, hit(t, [SLAM], 20) * .35);
    misregFrame(ctx, 8 * k0, .4);
  }

  // ---------- B2. 23.11 Dan on the mic stand, "done it in a SEC" ----------
  function sec(ctx, t) {
    const SEC = W_(13, 8), pk = hit(t, [SEC], 9), sh = shake(t, 12 * snare(t, 9) + 18 * pk);
    const o = { crowd: 60, dan: { lean: 16, turn: .1 } }, hd = headOf(...STAGE.dan, 'dan', bandPoses(23.11, o).dan);
    aim(ctx, [hd[0] + sh[0], hd[1] + sh[1]], 3.0 + .16 * snare(t, 10) + .3 * pk, -.05, 960, 650);
    stageBand(ctx, t, o);
    ctx.restore();
    misregFrame(ctx, 12 * pk, 0);
  }

  // ---------- C. 23.70 "dropped it in Teams": the logo is flown in and slams the stage ----------
  function teams(ctx, t) {
    const LAND = W_(14, 4), DROP = W_(14, 1), imp = hit(t, [LAND], 7), sh = shake(t, 26 * imp + 5 * snare(t, 10));
    const landed = t >= LAND - VLEAD, a = landed ? t - LAND + VLEAD : 0, fall = landed ? 1 : easeIn(seg(t, DROP - .12, LAND - VLEAD));
    const gx = 960, gy = 436, S = 470, y = lerp(-620, gy, fall), sq = landed ? .22 * Math.exp(-a * 11) * Math.cos(a * 36) : -.08 * fall;
    cam(ctx, 960 + sh[0], 455 + sh[1], 1.18, 0);
    stageBand(ctx, t, { jump: jumpArc(t, LAND, .34, 1.0), bob: landed && a < .5 ? { eyes: 'wide', mouth: 'o', open: .9, rage: .3, hop: .4 * Math.exp(-a * 8) } : {},
      behindBob: c => {
        if (!landed) { c.save(); c.globalAlpha = .5 * fall; fillPts(c, ell(gx, gy - 4, S * .5 * (.3 + .7 * fall), 22, 24), INK.ink); c.restore();
          if (fall > 0) streaks(c, [gx - S * .5, y - S * 2.2, gx + S * .5, y - S], { dir: [0, 1], n: 18, len: 340, w: 7, color: INK.ink }); }
        else {
          c.save(); c.globalAlpha = clamp(1.2 - a * 2.4); dotsIn(c, [gx - 900, gy - 90, gx + 900, gy + 40], { spacing: 22, color: INK.yellow, k: (px, py) => 1.2 - Math.abs(Math.hypot((px - gx) / 5, (py - gy)) - 30 - a * 160) / 22 }); c.restore();
          for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const d = 30 + a * (380 + i * 140), r = (60 + i * 18) * clamp(1 - a * 1.6);
            if (r > 2) ink(c, blob(gx + sd * (S * .42 + d), gy - 30 - i * 26 - a * 60, r, i * 5 + (sd > 0 ? 2 : 9), .3, 12, r * .7), { fill: INK.paper, shade: { color: INK.pinkLt, spacing: 14, dir: [0, 1], from: 0, to: r }, line: 3.5, boil: 1 }); }
        }
        c.save(); c.translate(gx, y); c.scale(1 + sq * .7, 1 - sq); teamsLogo(c, 0, -S * .465, S); c.restore();
        if (landed && a < .25) krackle(c, gx, gy - 40, 300, { n: 36, size: 16, color: INK.ink });
      } });
    ctx.restore();
    misregFrame(ctx, 16 * imp, 1.2);
  }

  // ---------- D. 24.54 "slid into Slack": Tasha's knee slide, the Slack stamp ----------
  function slack(ctx, t) {
    const STAMP = W_(15, 3), p = easeOut(seg(t, 24.58, 25.34)), x = lerp(1800, 700, p), v = 1 - p;
    const cx = lerp(1520, 860, easeInOut(seg(t, 24.5, 25.42))), sh = shake(t, 10 * hit(t, [STAMP], 8) + 4 * snare(t, 10));
    cam(ctx, cx + sh[0], 770 + sh[1], 2.0, 0);
    stageBand(ctx, t, { tasha: false, crowd: false, smoke: 0, after: c => {
      const tc = twos(t);
      if (v > .05) { streaks(c, [x + 60, 760, x + 900, 930], { dir: [-1, 0], n: 18, len: 420 * v, w: 6, color: INK.ink });
        for (let i = 0; i < 9; i++) { const a = hash(Math.floor(t * 24) * 3 + i), sx = x + 40 + a * 120 * v + i * 18, sy = 915 - hash(i * 7 + Math.floor(t * 24)) * 70;
          ink(c, star(sx, sy, 10 + 12 * v * hash(i), .35, 4, a), { fill: INK.yellow, line: 2.5, boil: .5 }); } }
      person(c, x, 925, 40, 'tasha', { hold: 'bass', strum: frac(tc * 3), fret: .5, legs: 'kneel', turn: -.7, lean: 14 * v + 4, tilt: 10, lids: .75, mouth: 'smirk', gum: .35 + .15 * Math.sin(tc * 3), t: tc });
    } });
    ctx.restore();
    const age = t - (STAMP - VLEAD);
    if (age >= 0) {
      const k = age < .08 ? lerp(1.9, 1, easeIn(age / .08)) : 1 + .05 * Math.exp(-(age - .08) * 18) * Math.sin((age - .08) * 60);
      ctx.save(); ctx.translate(1450, 560); ctx.rotate(-.12); ctx.scale(k, k);
      if (age < .2) krackle(ctx, 0, 0, 260, { n: 40, size: 18, color: INK.ink });
      fillPts(ctx, rrect(-230 + 14, -230 + 16, 460, 460, 60), INK.ink, false);
      ink(ctx, rrect(-230, -230, 460, 460, 60), { fill: INK.paper, line: 8, smooth: false, boil: 1 });
      slackLogo(ctx, 0, 0, 340);
      ctx.restore();
      misregFrame(ctx, 10 * Math.exp(-age * 9), 0);
    }
  }

  // ---------- E. 25.48 the split: office Dan on mute | stage Dan screaming; Greg circles back; the whip ----------
  function stageDanTile(c, [x, y, w, h], t) {
    const tc = twos(t);
    fillPts(c, rect(x, y, w, h), INK.paper, false);
    sunburst(c, x + w / 2, y + h * .4, INK.pink, INK.red, .3, 20);
    dotsIn(c, [x, y, x + w, y + h], { spacing: 30, color: INK.ink, k: (px, py) => clamp(Math.hypot(px - x - w / 2, py - y - h * .45) / (w * .7) - .35) });
    const F = bustFit([x, y, w, h], 'dan', { zoom: .8, dy: .02 }), sh = shake(t, 6 * snare(t, 9));
    person(c, F.x + sh[0], F.y + sh[1], F.s, 'dan', { view: 'bust', rage: 1, stage: 1, wild: 1, tilt: -6 + noise1(tc * 3) * 4, nod: -.1, open: .5 + .5 * singOpen(tc, 16, 16), t: tc });
  }
  function split(ctx, t) {
    const BACK = W_(16, 9), CIRC = W_(16, 8), sp = easeInOut(seg(t, BACK - .1, BACK + .3)), rot = sp * TAU, z = 1 + .18 * Math.sin(sp * Math.PI);
    look(0);
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    if (sp > 0 && sp < 1) speedLines(ctx, 960, 540, { n: 70, r0: 500, r1: 1500, w: 10, color: INK.wallDk });
    cam(ctx, 960, 540, z * lerp(1, 1.05, smooth(seg(t, 25.48, BACK - .1))), rot);
    const tc = twos(t), nodK = Math.exp(-frac(beat(tc) / 2) * 4);
    const tiles = [
      { who: 'dan', muted: true, pose: { glare: .9, mouth: 'polite', lids: blink(tc, [26.9, 28.4]), nod: .05 * nodK, tilt: 1, hunch: .2 }, bg: 'plain' },
      { who: 'dan', speaking: true, look: 1, draw: stageDanTile },
    ];
    teamsCall(ctx, [0, 0, W, H], t, { zoom: 1.5, title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: 900 + (t - 25.48), participants: 5, tiles, unread: 2 });
    // Greg's small tile, circling back
    const tw = seg(t, CIRC - .25, CIRC), ang = tc * TAU * 1.6;
    const gp = tw > 0 ? { armR: { a: lerp(30, 128, smooth(tw * 3)) + Math.sin(ang) * 14, e: lerp(-20, -62, smooth(tw * 3)) + Math.cos(ang) * 22 }, handR: 'point', twirl: tw, mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(tc * 6)), brows: .4, lids: .25 }
      : { mouth: 'talk', open: .2 + .4 * Math.abs(noise1(tc * 6)), brows: .3 };
    teamsTile(ctx, [690, 150, 540, 310], t, { who: 'greg', speaking: true, pose: gp, zoom: 1.5, cam: { zoom: .78, dy: .06 } });
    ctx.restore();
    if (sp > 0 && sp < 1) misregFrame(ctx, 16 * Math.sin(sp * Math.PI), rot);
    look(1);
  }

  // ---------- F. 28.70 the email: two little lines, SEND ----------
  function sungText(li, t) { return LINES[li].words.filter(w => t >= w.a - LEAD).map(w => w.w).join(' '); }
  function email(ctx, t) {
    const REAL = W_(18, 7), tc = twos(t), smash = hit(t, [REAL], 7), sh = shake(t, 22 * smash + 4 * snare(t, 10));
    look(1);
    sunburst(ctx, 175, 700, INK.yellow, INK.pink, .2, 16);
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.red, k: (x, y) => clamp(Math.hypot(x - 175, y - 600) / 700 - .3) });
    ctx.save(); ctx.translate(sh[0], sh[1]);
    const subj = sungText(17, t), body = LINES[18].words.filter(w => t >= w.a - LEAD).map((w, i) => (i === 3 ? '\n' : i ? ' ' : '') + w.w).join('');
    const z = 4.6, bx = 385, by = -290, fly = easeIn(seg(t, REAL + .16, REAL + .34));
    ctx.save(); ctx.translate(fly * 2000, -fly * 500); ctx.rotate(fly * .25);
    const send = emailCompose(ctx, [bx, by, 800 * z, 340 * z], t, { zoom: z, to: ['greg'], subject: subj, body, send: REAL });
    ctx.restore();
    // Dan: hammering the keyboard below frame, the wind-up, the smash
    const sx = send[0] + send[2] * .45, sy = send[1] + send[3] * .45, up = seg(t, REAL - .38, REAL - .1), dn = t >= REAL - VLEAD;
    const typing = [[140 + Math.sin(tc * 31) * 22, 1250], [400 + Math.cos(tc * 27) * 22, 1230]];
    const reachR = dn ? [sx, sy] : up > 0 ? [lerp(400, 580, up), lerp(1230, 30, easeOut(up))] : typing[1];
    const F = headFit(160, 650, 250, 'dan');
    person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, stage: 1, wild: 1, turn: .4, lean: dn ? 9 : -7 * up, tilt: dn ? 7 : -4 - 3 * up, nod: dn ? .15 : -.1 * up,
      open: .45 + .55 * singOpen(tc, 17, 18), reachL: typing[0], reachR, handR: 'fist', handL: up > 0 || dn ? 'fist' : 'type', t: tc });
    if (smash > .05) { burst(ctx, sx, sy, 120 + 140 * smash, { fill: INK.yellow, seed: 7, n: 13 }); krackle(ctx, sx, sy, 280, { n: 30, size: 16, color: INK.ink }); }
    ctx.restore();
    stamp(ctx, 'SENT', 1330, 760, 210, t - (REAL - VLEAD), { color: INK.red, rot: -.14 });
    misregFrame(ctx, 14 * smash, .8);
  }

  // ---------- G. 31.62 "you needed my face for a question with no depth" ----------
  function depthless(ctx, t) {
    const NO = W_(19, 9), DEPTH = W_(19, 10), FACE = W_(19, 4), tc = twos(t);
    look(1);
    fillPts(ctx, rect(0, 0, W, H), INK.paper, false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.pink, k: () => .45 });
    const cram = smooth(seg(t, 31.62, FACE)), squish = hit(t, [FACE], 6);
    const danTile = (c, [x, y, w, h], tt) => {
      fillPts(c, rect(x, y, w, h), INK.yellow, false);
      dotsIn(c, [x, y, x + w, y + h], { spacing: 26, color: INK.red, k: (px, py) => clamp((py - y) / h) * .8 });
      const F = bustFit([x, y, w, h], 'dan', { zoom: lerp(1.2, 2.3, cram), dy: lerp(0, -.12, cram) });
      person(c, F.x, F.y, F.s, 'dan', { view: 'bust', rage: .9, stage: 1, wild: 1, sq: .25 * squish + .12 * cram, open: .4 + .6 * singOpen(twos(tt), 19, 19), t: twos(tt) });
    };
    // Greg turns on his base like a cardboard standee: front squeezes to a sliver on "no", edge-on on "depth", then his brown back
    const th = lerp(0, 158, easeInOut(seg(t, NO - VLEAD, DEPTH + .12))) * Math.PI / 180, wob = Math.sin((t - DEPTH) * 30) * Math.exp(-(t - DEPTH - .12) * 8) * .08 * (t > DEPTH + .12 ? 1 : 0);
    const gregTile = (c, [x, y, w, h], tt) => {
      look(0); webcamBg(c, [x, y, w, h], 'bookshelf', 45620);
      const F = bustFit([x, y, w, h], 'greg', { zoom: 1.05, dy: -.12 }), cs = Math.cos(th + wob), sx = Math.sign(cs) * Math.max(.025, Math.abs(cs));
      const pose = { view: 'bust', mouth: th > 0 ? 'grin' : 'talk', open: th > 0 ? .4 : .3 + .3 * Math.abs(Math.sin(tc * 7)), armR: { a: 150, e: 20 }, handR: 'point', brows: .3, t: twos(tt) };
      c.save(); c.translate(F.x, 0); c.scale(sx, 1); c.translate(-F.x, 0);
      if (cs > 0) person(c, F.x, F.y, F.s, 'greg', pose);
      else { // the back: Greg's silhouette in corrugated brown card, with the easel strut
        const L = pushLayer(); L.setTransform(c.getTransform()); person(L, F.x, F.y, F.s, 'greg', pose);
        L.globalCompositeOperation = 'source-in'; L.setTransform(1, 0, 0, 1, 0, 0); L.fillStyle = '#B48A5A'; L.fillRect(0, 0, W, H);
        L.globalCompositeOperation = 'source-atop'; L.fillStyle = '#9A7246'; for (let i = 0; i < W; i += 16) L.fillRect(i, 0, 5, H);
        popLayer(); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(L.canvas, 0, 0); c.restore();
        ink(c, [[F.x - 30, y + h * .42], [F.x + 30, y + h * .42], [F.x + 150, y + h + 10], [F.x + 90, y + h + 10]], { fill: '#8A6236', line: 3, smooth: false, boil: 0 });
      }
      c.restore();
      if (cs < -.5) { const lw = 150 * -cs; ink(c, rect(F.x - lw / 2, y + h * .56, lw, 54), { fill: '#F4F2EC', line: 2, smooth: false, boil: 0 });
        txt(c, 'GREG', F.x, y + h * .56 + 39, { font: 'mono', weight: 800, size: 30, color: '#4A4852', align: 'center', sx: -cs }); }
      if (Math.abs(cs) < .2) fillPts(c, rect(F.x - 5, y + h * .1, 10, h * .9), '#6E5232', false);
    };
    teamsCall(ctx, [40, 60, 1840, 960], t, { zoom: 1.4, title: 'Quick sync \uD83D\uDE42', timer: 900 + (t - 25.48), participants: 5,
      tiles: [{ who: 'dan', draw: danTile, muted: false, speaking: true }, { who: 'greg', draw: gregTile, look: 0, hand: t < NO }] });
  }

  // ---------- H. 33.60 THE UNISON JUMP (shared spec with c04) ----------
  const JU = { t0: GOD, d: TEXT - GOD, crouch: GOD - .16 };
  function jumpState(t) {
    const k = (t - JU.t0) / JU.d;
    if (t < JU.t0) { const c = seg(t, JU.crouch, JU.t0); return { hop: 0, sq: .42 * Math.sin(c * Math.PI * .5) * (c < 1 ? 1 : 0), air: 0, vy: 0, c }; }
    if (k < 1) { const f = 1 - Math.pow(Math.abs(2 * k - 1), 2.6); return { hop: 3.6 * f, sq: k < .12 ? -.3 * (1 - k / .12) : k > .9 ? -.18 * (k - .9) / .1 : 0, air: 1, vy: 1 - 2 * k, c: 1 }; }
    const a = t - TEXT; return { hop: 0, sq: .5 * Math.exp(-a * 9) * Math.cos(a * 22), air: 0, vy: 0, c: 1, land: a };
  }
  function jump(ctx, t) {
    const tc = twos(t), tj = t + VLEAD, J = jumpState(tj), up = J.air ? smooth(clamp((tj - JU.t0) / .2)) : 0;
    const crouchArms = J.air ? 0 : J.c > 0 && J.land == null ? J.c : 0;
    look(1);
    if (t < GOD - LEAD) FRAME.lyrics = false;
    // framing matched to c04 (field, shadows, turns, lettering box); only the inks differ
    fillPts(ctx, rect(0, 0, W, H), INK.paper, false);
    sunburst(ctx, 960, 560, INK.paper, INK.pink, 0, 20, 2400);
    dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.red, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 560) / 640) - .45) * 1.8) });
    const scream = J.air ? 1 : .55 + .45 * singOpen(tc, 20, 20), land = J.land != null ? Math.exp(-J.land * 8) : 0;
    const air = J.air && J.hop > .3 ? { legs: 'jump' } : {};
    const common = { hop: J.hop, sq: J.sq, vy: J.vy, swing: J.vy * 40, ...air, noShadow: true, t: tc };
    for (const [x, r] of [[420, 120], [790, 110], [1130, 110], [1500, 140]]) fillPts(ctx, ell(x, 962, r * (1 - J.hop * .07), 18 * (1 - J.hop * .07), 24), rgba(INK.ink, .85));
    const arm = (a0, e0, e1) => ({ a: lerp(lerp(a0, -25, crouchArms), 168, up), e: lerp(e0, e1, up) });
    person(ctx, 420, 960, 50, 'linda', { ...common, rage: .3, mouth: 'flat', open: 0, lids: .5, hold: 'guitar', strum: J.air ? 0 : frac(tc * 4), fret: .4, turn: .3 });
    person(ctx, 790, 960, 50, 'dan', { ...common, rage: 1, stage: 1, wild: 1, mouth: 'scream', open: scream, hold: 'mic', armL: arm(20, -20, 15), handL: J.air ? 'horns' : 'fist', turn: .15 });
    person(ctx, 1130, 960, 50, 'tasha', { ...common, rage: .8, mouth: 'scream', open: scream, hold: 'bass', strum: J.air ? 0 : frac(tc * 2), fret: .5, turn: -.25 });
    person(ctx, 1500, 960, 50, 'bob', { ...common, rage: .8, mouth: 'scream', open: scream, sweat: 1, hold: 'sticks', hits: { l: 0, r: 0 }, armL: arm(30, -30, 20), armR: arm(30, -30, 20), turn: -.2 });
    const la = J.land ?? -1; if (la >= 0 && la < .1) flash(ctx, INK.white, .7 * (1 - la / .1));
    if (land > .05) misregFrame(ctx, 10 * land, 0);
  }

  // ---------- I. the tag: the chant ----------
  function chant(ctx, t) {
    const tc = twos(t), dr = drift(t, 10, .5), pk = snare(t, 9);
    look(1);
    cam(ctx, 960 + dr[0], 540 + dr[1], 1.02 + .06 * pk, .025);
    sunburst(ctx, 960, -300, INK.red, INK.pink, t * .04, 26);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .35;
    [[300, 1], [800, -1], [1300, 1], [1700, -1]].forEach(([x, sd], i) => { const a = Math.PI / 2 + sd * (.35 + .2 * Math.sin(t * 1.3 + i)); fillPts(ctx, [[x - 10, -20], [x + 10, -20], [x + Math.cos(a - .1) * 1400, Math.sin(a - .1) * 1400], [x + Math.cos(a + .1) * 1400, Math.sin(a + .1) * 1400]], i % 2 ? INK.yellow : INK.white, false); });
    ctx.restore();
    crowd(ctx, t, [-120, 260, 2160, 700], 230, { seed: 11, view: 'front', style: 'flat', k: 1, jump: 1, headbang: .3, hands: .75, phones: .12, rage: 1, inks: 'hot' });
    const b = beat(tc), oh = singOpen(tc, 21, 21);
    [[260, 21, 1, INK.yellow], [1000, 5, -1, INK.white], [1700, 14, 1, INK.pink]].forEach(([x, seed, sd, top], i) => {
      const ph = frac(b + i * .33), hop = Math.max(0, Math.sin(ph * Math.PI)) * .8, pump = Math.sin((b + i * .2) * Math.PI * 2);
      const F = headFit(x, 760 - hop * 40, 175, seed);
      person(ctx, F.x, F.y, F.s, seed, { view: 'bust', rage: .8, eyes: 'rage', mouth: 'scream', open: .4 + .6 * oh, nod: -hop * .3, tilt: sd * 6, swing: sd * 30 * pump, armL: { a: 150 + 15 * pump, e: 10 }, handL: 'fist', armR: { a: 40, e: -40 },
        col: { top, topDk: mix(top, INK.red, .45) }, t: tc });
    });
    ctx.restore();
  }
  function bobShot(ctx, t) {
    const tc = twos(t), pk = snare(t, 8), sh = shake(t, 10 * pk), dr = drift(t, 8, .7);
    look(1);
    const bp = tt => bobPose(tt, { mouth: 'scream', open: .6 + .4 * snare(tt, 8), rage: .8, eyes: 'rage' }), hd = headOf(...STAGE.bob, 'bob', bp(36.43));
    aim(ctx, [hd[0] + sh[0] + dr[0], hd[1] + sh[1] + dr[1]], 4.3 + .2 * pk, .06, 960, 640);
    stage(ctx, t, { inks: 'hot', strobe: 1, hits: hits(t), kit: 'back', banner: false });
    const A = person(ctx, ...STAGE.bob, 'bob', bp(t));    drumKit(ctx, ...STAGE.kit, t, { layer: 'front', hits: hits(t) });
    // sweat spray on every snare
    const ls = lastOf(t, SNARES), age = ls == null ? 9 : t - ls + VLEAD;
    if (A && age < .45) for (let i = 0; i < 16; i++) { const a = -Math.PI * (.1 + .8 * hash(ls * 7 + i)), sp = 160 + 260 * hash(ls * 3 + i), d = sp * age, g = 600 * age * age;
      const x = A.head[0] + Math.cos(a) * (40 + d), y = A.head[1] - 20 + Math.sin(a) * (30 + d) + g, r = 7 + 6 * hash(i * 9);
      ink(ctx, [[x, y - r * 1.5], [x + r * .75, y], [x + r * .5, y + r * .8], [x, y + r], [x - r * .5, y + r * .8], [x - r * .75, y]], { fill: '#BDF2FF', line: 2.5, boil: .3 }); }
    ctx.restore();
  }
  function bandText(ctx, t) {
    const pk = snare(t, 8), sh = shake(t, 8 * pk), dr = drift(t, 10, .5);
    cam(ctx, 960 + sh[0] + dr[0], 560 + sh[1], 1.34 + .06 * pk + .06 * seg(t, 37.26, 38.09), -.04);
    stageBand(ctx, t, { crowd: 130 });
    ctx.restore();
  }
  function gum(ctx, t) {
    const POP = lastOf(38.92, SNARES), tc = twos(t), popped = t >= POP - VLEAD, g = popped ? 1 + .4 * clamp((t - POP + VLEAD) / .08) : Math.pow(seg(tc, 38.12, POP - VLEAD), 1.3);
    const pk = snare(t, 8), sh = shake(t, (popped ? 12 : 3) * pk + 16 * hit(t, [POP], 10)), h = popped ? headbang(tc, 1, 1.5) : { nod: 0, tilt: 0, lean: 0, swing: 0 };
    const push = popped ? 0 : easeIn(seg(t, 38.12, POP - VLEAD)), z = lerp(3.3, 5.8, push) + .12 * pk;
    const hd = headOf(...STAGE.tasha, 'tasha', bandPoses(38.09, { tasha: { gum: 0, mouth: 'flat' } }).tasha);
    aim(ctx, [hd[0] + sh[0], hd[1] + sh[1]], z, popped ? .05 : 0, 960, lerp(620, 600, push));
    stageBand(ctx, t, { tasha: { gum: g, eyes: popped ? (tc - POP < .15 ? 'wide' : 'closed') : 'open', lids: popped ? 0 : .55, mouth: 'flat', ...h, nod: h.nod * .8, lean: h.lean, strum: frac(tc * (popped ? 4 : 2)) }, crowd: 60 });
    ctx.restore();
    if (popped) misregFrame(ctx, 14 * hit(t, [POP], 9), 0);
  }
  function lindaShot(ctx, t) {
    const tc = twos(t), pk = snare(t, 8), dr = drift(t, 8, .6);
    const lp = tt => lindaPose(tt, { strum: frac(twos(tt) * 6.5), fret: .3 + .4 * Math.abs(Math.sin(twos(tt) * 9)), lids: .6, lx: .4, ly: .5, tilt: 4, lean: -6 }), hd = headOf(...STAGE.linda, 'linda', lp(39.74));
    aim(ctx, [hd[0] + dr[0], hd[1] + dr[1]], 3.6 + .1 * pk, .08, 1060, 620);
    stage(ctx, t, { inks: 'hot', strobe: 1, hits: hits(t), drummer: (c, _, tt) => person(c, ...STAGE.bob, 'bob', bobPose(tt)) });
    const A = person(ctx, ...STAGE.linda, 'linda', lp(t));
    if (A && A.handL) streaks(ctx, [A.handL[0] - 40, A.handL[1] - 50, A.handL[0] + 40, A.handL[1] + 50], { dir: [0, 1], n: 8, len: 60, w: 3, color: INK.ink });
    stage(ctx, t, { fg: true, inks: 'hot', smoke: .08, crowd: false });
    ctx.restore();
  }
  function finale(ctx, t) {
    const HIT = 40.98, fr = t >= HIT - VLEAD, tf = fr ? HIT - VLEAD : t, a = t - HIT + VLEAD;
    if (fr) BOIL = 0;
    const z = lerp(1.25, 1.45, easeIn(seg(tf, 40.56, HIT))), sh = fr ? [0, 0] : shake(t, 6 * snare(t, 9));
    const L = fr ? pushLayer() : ctx;
    if (fr) paperBg(L);
    cam(L, 960 + sh[0], 480 + sh[1], z, 0);
    stageBand(L, tf, { jump: jumpArc(tf, 40.6, .76, 2.8), dan: { armL: { a: 165, e: 10 }, handL: 'horns' }, linda: { mouth: 'scream', open: .7 }, tasha: { rage: 1, mouth: 'scream', open: 1 } });
    L.restore();
    if (fr) { // freeze-frame: slapped down as a tilted flyer
      popLayer();
      fillPts(ctx, rect(0, 0, W, H), INK.red, false);
      dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.redDk, k: () => .5 });
      const s = lerp(1.08, .9, easeOut(clamp(a / .08))) + .012 * Math.sin(a * 60) * Math.exp(-a * 20);
      ctx.save(); ctx.translate(960, 540); ctx.rotate(-.04); ctx.scale(s, s);
      fillPts(ctx, rect(-W / 2 - 4, -H / 2 + 10, W + 48, H + 48), INK.ink, false);
      fillPts(ctx, rect(-W / 2 - 26, -H / 2 - 26, W + 52, H + 52), INK.white, false);
      ctx.drawImage(L.canvas, -W / 2, -H / 2);
      ctx.restore();
    }
  }

  chapter('chorus1', 20.62, 41.15, [
    [20.62, unmute], [SLAM, slam], [23.11, sec], [23.70, teams], [24.54, slack], [25.48, split], [28.70, email], [31.62, depthless],
    [JU.crouch, jump], [35.56, chant], [36.43, bobShot], [37.26, bandText], [38.09, gum], [39.74, lindaShot], [40.56, finale],
  ]);

  const ST = { stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink } };
  Object.assign(LYRICS, {
    12: { mode: 'hero', box: [1010, 70, 860, 450], rows: [2, 2, 2], emph: [5], align: 'center', color: INK.paper, hot: INK.red, tilt: 0, ...ST },
    13: { mode: 'hero', box: [160, 70, 1600, 380], rows: [3, 6], emph: [2], align: 'center', color: INK.paper, hot: INK.red, after: SLAM - VLEAD + .005, ...ST },
    14: { mode: 'hero', box: [300, 800, 1320, 240], rows: [4, 1], emph: [4], align: 'center', color: INK.paper, hot: INK.red, ...ST },
    16: { mode: 'livecap', x: 40, y: 1050, w: 900, size: 60, speaker: 'dan' },
    17: { mode: 'none' }, 18: { mode: 'none' },
    20: { mode: 'hero', box: [200, 34, 1520, 236], rows: [3, 4], emph: [0, 6], align: 'center', color: INK.paper, hot: INK.red, tilt: 0, out: 'cut', end: 35.45, ...ST },
    23: { mode: 'hero', box: [160, 70, 1600, 380], align: 'center', color: INK.paper, hot: INK.yellow, budget: 20, until: 40.95, ...ST },
    19: { mode: 'livecap', look: 1, x: 975, y: 1040, w: 880, size: 60, speaker: 'dan' },
  });
})();
