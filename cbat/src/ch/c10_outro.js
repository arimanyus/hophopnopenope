// c10_outro.js: final tag + outro (152.45 - 179.88).
// The singalong in the conference-room stage (Greg alone on mute), THIS COULD HAVE BEEN A TEXT, the chair crowd-surf,
// the dropout freeze, then the calm-down at Dan's desk: the drain back to pastel, "No.", the text, 5:01, he leaves,
// "approved ðŸ‘", the title card and the silent tail that loops back to frame 0.
(() => {
  const TAG = 152.45, GAL_T = 154.09, GREG_T = 155.72, BIG = 157.32, SURF = 159.41, BOB_T = 161.05, DUO = 162.27, LEAP = 163.09,
    DROP = 163.90, BACK = 165.54, CHAT = 167.17, NO = 168.60, SEND = 170.06, LEAVE = 172.42, PHONE = 174.50, SMILE = 175.35,
    TITLE = 176.30, TAIL = 178.45;
  const TEXT_T = wordT(89, 5), SENT_T = wordT(93, 4), MUTE_T = 156.54, POP = 162.68;
  const LAST_F = (Math.round(DUR * FPS) - 1) / FPS;            // the last frame render.mjs outputs (179.833)
  const MEET = t => 11565 + (t - 137.71);                        // the final-chorus meeting timer (03:12:45 at the drop)
  const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
  const hits = t => ({ kick: kick(t, 9), snare: snare(t, 9), crash: Math.max(hit(t, SNARES, 3), t > 159.4 && t < 163.95 ? kick(t, 3) : 0), hat: pulse(t, 12, .5) });
  const DAN_HS = { ...CAST.dan, ear: 'headset', pal: { ...CAST.dan.pal, headset: ['#46454D', INK.ink] } };   // Dan with his call headset (as in c01)
  const DAN_FREE = { ...CAST.dan, lanyard: false, badge: null }; // ...and after the lanyard comes off
  const INKS = [INK.teams, INK.pink, INK.yellow];                // the final-chorus room inks (c09)
  const fmtT = s => { s = Math.max(0, Math.floor(s)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':'); };

  // ---------- sticky-note confetti ----------
  const noteCols = () => [mix('#ECE2A6', INK.yellow, STYLE.k), mix('#EBC9CC', INK.pinkLt, STYLE.k), mix('#CFE0E6', INK.cyan, STYLE.k)];
  function note(ctx, x, y, s, rot, sx, col, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, 1);
    const h = s / 2, p = [[-h, -h], [h, -h], [h, h * .55], [h * .55, h], [-h, h]];
    ink(ctx, p, { fill: col, line: 2.5, smooth: false, boil: .5, seed });
    fillPts(ctx, [[h, h * .55], [h * .55, h], [h * .55, h * .55]], mix(col, INK.ink, .3), false);
    ctx.restore();
  }
  // n notes falling through box [x, y, w, h] (wrapping), fluttering; a pure function of t
  function noteRain(ctx, t, n, o = {}) {
    const seed = o.seed || 1, [bx, by, bw, bh] = o.box || [-120, -160, 2160, 1400], C = noteCols();
    for (let i = 0; i < n; i++) {
      const h = q => hash(seed * 31.7 + i * 7.13 + q), v = lerp(150, 320, h(1)) * (o.speed ?? 1);
      const y = by + mod(h(3) * bh + t * v, bh), x = bx + h(2) * bw + Math.sin(t * lerp(1, 2.2, h(4)) + h(5) * 9) * 40;
      const fk = Math.cos(t * lerp(2, 5, h(8)) + h(9) * 6);
      note(ctx, x, y, lerp(34, 62, h(10)) * (o.size ?? 1), Math.sin(t * lerp(1.5, 3, h(6)) + h(7) * 6) * .9, Math.sign(fk || 1) * Math.max(.18, Math.abs(fk)), C[i % 3], i);
    }
  }
  // a burst of notes thrown up from (x, y) at t0, falling under gravity
  function noteBurst(ctx, t, t0, x, y, n, o = {}) {
    const a = t - t0; if (a < 0) return; const C = noteCols(), seed = o.seed || 5;
    for (let i = 0; i < n; i++) {
      const h = q => hash(seed * 13.1 + i * 3.77 + q), ang = -Math.PI / 2 + (h(1) - .5) * 2.6, v = lerp(700, 1500, h(2)) * (o.power ?? 1);
      const px = x + Math.cos(ang) * v * a, py = y + Math.sin(ang) * v * a + 1100 * a * a, fk = Math.cos(a * lerp(5, 11, h(3)) + h(4) * 6);
      if (py > 1250) continue;
      note(ctx, px, py, lerp(36, 64, h(5)), a * lerp(-6, 6, h(6)), Math.sign(fk || 1) * Math.max(.18, Math.abs(fk)), C[i % 3], i + 40);
    }
  }

  // ---------- a rolling office chair at rig scale (seat top 4.2 s above the floor point; same build as Dan's desk chair) ----------
  function rollChair(ctx, x, y, s, o = {}) {
    const k = STYLE.k, seat = o.seat || mix('#646B76', '#3A2E66', k), dk = mix('#535963', INK.ink, k), lt = o.lt || mix('#747C88', INK.teams, k), metal = mix('#BDBFC1', INK.paperDk, k), sy = y - 4.2 * s;
    for (const [dx, dy] of [[-2.6, -.25], [-1.1, .1], [1.1, .1], [2.6, -.25]]) inkLine(ctx, [[x, y - .9 * s], [x + dx * s, y + dy * s - .3 * s]], .38 * s, dk, { taper: [0, 0], smooth: false });
    for (const [dx, dy] of [[-2.6, -.25], [-1.1, .1], [1.1, .1], [2.6, -.25]]) ink(ctx, ell(x + dx * s, y + dy * s, .3 * s, .24 * s, 12), { fill: INK.ink, line: 2, boil: .4 });
    ink(ctx, rect(x - .22 * s, sy + .4 * s, .44 * s, 2.9 * s), { fill: metal, line: 2.2, smooth: false });
    ink(ctx, rect(x - .8 * s, sy - 1.6 * s, .3 * s, 1.8 * s), { fill: dk, line: 2.2, smooth: false });
    ink(ctx, rrect(x - 2.1 * s, sy - 5.1 * s, 2.9 * s, 3.7 * s, 1.1 * s), { fill: seat, shade: { color: dk, spacing: 14, dir: [.5, .85], from: -.5 * s, to: 2.5 * s }, line: 3, seed: 50 });
    ink(ctx, rrect(x - 1.9 * s, sy - .15 * s, 3.8 * s, .75 * s, .35 * s), { fill: lt, shade: { color: dk, spacing: 12, dir: [0, 1], from: 0, to: .7 * s }, line: 3, smooth: false, seed: 51 });
  }

  // ---------- the 500-tile wall screen ----------
  function wall500(c, [x, y, w, h], t) {
    fillPts(c, rect(x, y, w, h), INK.ink, false);
    const bar = h * .09, b = beatAt(t + VLEAD), sing = singOpen(twos(t), 86, 90);
    fillPts(c, rect(x, y, w, bar), '#231B33', false);
    txt(c, fmtT(MEET(t)), x + w * .02, y + bar * .7, { font: 'mono', weight: 700, size: bar * .62, color: INK.white });
    fillPts(c, rrect(x + w * .86, y + bar * .15, w * .12, bar * .7, 3), INK.red, false);
    const cols = 25, rows = 20, g = 1.2, tw = (w - g * (cols + 1)) / cols, th = (h - bar - g * (rows + 1)) / rows;
    const bg = new Path2D(), skins = [new Path2D(), new Path2D(), new Path2D()], mouth = new Path2D(), hair = new Path2D(), SK = [INK.pinkLt, INK.orangeLt, '#C9844F'];
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      if (r === 9 && q === 12) continue;
      const tx0 = x + g + q * (tw + g), ty0 = y + bar + g + r * (th + g), i = r * cols + q, ph = hash(i * 1.7);
      bg.rect(tx0, ty0, tw, th);
      const hop = Math.max(0, Math.sin((b + ph * .4) * Math.PI)) * th * .16, cx = tx0 + tw / 2, cy = ty0 + th * .55 - hop, rr = th * .3;
      skins[i % 3].moveTo(cx + rr, cy); skins[i % 3].ellipse(cx, cy, rr, rr * 1.1, 0, 0, TAU);
      hair.moveTo(cx + rr, cy - rr * .2); hair.ellipse(cx, cy - rr * .2, rr * 1.02, rr * .95, 0, Math.PI, TAU);
      const mo = rr * (.15 + .45 * sing * (.6 + .4 * ph)); mouth.moveTo(cx + rr * .35, cy + rr * .5); mouth.ellipse(cx, cy + rr * .5, rr * .35, mo, 0, 0, TAU);
    }
    c.fillStyle = '#3A2E66'; c.fill(bg); SK.forEach((s, i) => { c.fillStyle = s; c.fill(skins[i]); }); c.fillStyle = INK.ink; c.fill(hair); c.fillStyle = INK.redDk; c.fill(mouth);
    const gx = x + g + 12 * (tw + g), gy = y + bar + g + 9 * (th + g);      // Greg's tile: pastel, still talking
    fillPts(c, rect(gx, gy, tw, th), '#C9C4BA', false); fillPts(c, ell(gx + tw / 2, gy + th * .62, th * .34, th * .42, 12), '#E9B898');
  }

  // ---------- the conference room as the stage ----------
  const BD = CONF.band;
  // the set ends at y -20; the band's raised arms need a little more ceiling above it
  const ceilingTop = ctx => fillPts(ctx, rect(-600, -900, 3120, 920), INK.paper, false);
  function roomBack(ctx, t) {
    ceilingTop(ctx);
    confRoom(ctx, t, { k: 1, inks: INKS, chairs: false, screen: wall500, clock: clockSecs(16, 59, 31) + (t - TAG), lights: 1 });
    confRoom(ctx, t, { k: 1, inks: INKS, fg: true });
  }
  function roomScene(ctx, t, o = {}) {
    const tc = twos(t), b = beatAt(tc + VLEAD), sing = singOpen(tc, 86, 90), hb = headbang(tc, 1, .8), J = o.jump || { hop: 0, sq: 0, vy: 0 }, H = hits(t);
    roomBack(ctx, t);
    drumKit(ctx, ...BD.kit, t, { layer: 'back', hits: H, inks: INKS });
    person(ctx, ...BD.bob, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(b + .5), r: stroke(b) }, mouth: 'scream', open: .35 + .55 * sing, eyes: 'wide', sweat: .9, rage: .6, nod: hb.nod * .5, tilt: hb.tilt * .5, t: tc });
    drumKit(ctx, ...BD.kit, t, { layer: 'front', hits: H, inks: INKS });
    const jl = J.hop ? { ...J, legs: 'jump' } : J.sq ? { sq: J.sq } : {};
    person(ctx, ...BD.linda, 'linda', { hold: 'guitar', strum: frac(tc * 4), fret: .45, legs: 'wide', turn: .25, lids: .55, mouth: 'o', open: .25 + .35 * sing, t: tc, ...jl });
    person(ctx, ...BD.tasha, 'tasha', { hold: 'bass', strum: frac(tc * 2), fret: .55, legs: 'wide', turn: -.25, mouth: 'scream', open: .3 + .6 * sing, eyes: 'closed', nod: hb.nod * .7, tilt: hb.tilt, t: tc, ...jl });
    person(ctx, ...BD.dan, 'dan', { hold: 'mic', armR: { a: 112, e: 18 }, armL: { a: 168, e: 6 }, handL: 'fist', legs: 'wide', rage: .85, wild: 1, stage: 1, mouth: 'scream', open: .45 + .55 * sing,
      swing: hb.swing * .6 + J.vy * 40, t: tc, ...jl, ...(o.dan || {}) });
    if (o.crowd !== false) crowd(ctx, t, [-120, 680, 2160, 470], 80, { seed: 11, view: 'back', style: 'silhouette', jump: o.cjump ?? .9, headbang: .4, hands: .8, phones: .3, inks: INKS, k: 1, size: 50 });
  }

  // ---------- S1 152.45: everyone sings ----------
  function sing(ctx, t) {
    const sn = snare(t, 7), dr = drift(t, 10, .4), sh = shake(t, 6 * sn);
    cam(ctx, 960 + dr[0] + sh[0], 405 + dr[1] + sh[1], 1.15 + .05 * sn, -.015 + .012 * Math.sin(t * .9));
    roomScene(ctx, t);
    noteRain(ctx, t, 22, { seed: 2, box: [-120, -260, 2160, 1500] });
    ctx.restore();
    misregFrame(ctx, 8 * sn);
  }

  // ---------- S2 154.09: the gallery, 500+ singing; Greg's tile pastel, muted, still talking ----------
  const BANDAT = { 7: 'linda', 11: 'dan', 13: 'bob', 17: 'tasha' }, GREG = 12, GN = 5;
  const singer = (i, who) => tt => {
    const tc = twos(tt), hb = headbang(tc + hash(i) * .25, 1, .55), dan = who === 'dan';
    return { mouth: 'scream', open: .3 + .7 * singOpen(tc - hash(i * 3) * .05, 86, 89), eyes: dan ? 'rage' : hash(i * 5) < .45 ? 'closed' : 'open', brows: .5, browTilt: .4,
      nod: hb.nod * .45, tilt: hb.tilt, rage: dan ? .9 : 0, wild: dan ? 1 : 0, stage: 1, sweat: .5 };
  };
  // Greg mid-pitch: jazz hands, thumbs up, the circle-back twirl (a new gesture every ~.7 s)
  const gregTalk = tt => {
    const tc = twos(tt), g = Math.floor(tc * 1.4) % 3, a = tc * TAU * 1.3, pew = stroke(tc * 1.5) * 10;
    const G = [{ armL: { a: 22 + pew, e: 72 }, armR: { a: 22 + pew, e: 72 }, handL: 'open', handR: 'open', tilt: 4 }, { armR: { a: 28, e: -118 }, handR: 'thumb', brows: .45 },
      { armR: { a: 62 + Math.sin(a) * 16, e: -75 + Math.cos(a) * 22 }, handR: 'point', twirl: 1 }][g];
    return { mouth: 'talk', open: .2 + .6 * Math.abs(noise1(tc * 7)), brows: .3, lids: .08, eyes: 'open', nod: noise1(tc * 2) * .05, ...G };
  };
  let xn = 0;
  const GAL = Array.from({ length: GN * GN }, (_, i) => i === GREG ? { who: 'greg', look: 0, muted: true, pose: gregTalk, bg: 'office', cam: { zoom: 1.2, dy: -.02 } }
    : { who: BANDAT[i] || 96 + xn++, look: 1, speaking: true, pose: singer(i, BANDAT[i]), bg: 'stage', seed: i });
  function captions(ctx, t, lis, y = 1046) {
    const words = []; for (const li of lis) LINES[li].words.forEach((w, i) => words.push({ s: w.w, ...wordState(t, li, i) }));
    teamsCaption(ctx, 200, y, 1520, { speaker: 'Everyone', name: 'Everyone (500+)', words, size: 66, lines: 1, bottom: true, t });
  }
  function gallery(ctx, t) {
    look(1); fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
    const sn = snare(t, 8), sh = shake(t, 4 * sn);
    ctx.save(); ctx.translate(W / 2 + sh[0], H / 2 + sh[1]); ctx.scale(1 + .025 * sn, 1 + .025 * sn); ctx.translate(-W / 2, -H / 2);
    teamsCall(ctx, [-8, -8, W + 16, H + 16], t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: MEET(t), participants: '500+', tiles: GAL, mic: true, recording: true, depth: 0 });
    ctx.restore();
    captions(ctx, t, [87]);
  }

  // ---------- S3 155.72: Greg, still talking, on mute ----------
  function gregShot(ctx, t) {
    look(1); fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
    const gw = 1080, gh = 608, gx = (W - gw) / 2, gy = 150, gap = 22, z = 2.3, sn = snare(t, 9);
    for (let r = -1; r <= 1; r++) for (let q = -1; q <= 1; q++) {
      if (!r && !q) continue; const sh = shake(t + r * 3 + q, 6 * sn);
      teamsTile(ctx, [gx + q * (gw + gap) + sh[0], gy + r * (gh + gap) + sh[1], gw, gh], t, { ...GAL[GREG + r * GN + q], zoom: z, depth: 0, cam: { dx: -q * .36, dy: -r * .2, zoom: 1.15 } });
    }
    look(1); teamsTile(ctx, [gx, gy, gw, gh], t, { ...GAL[GREG], zoom: z, depth: 0 });
    mutedToast(ctx, W / 2, gy + 70, t, MUTE_T, { zoom: 2.8, life: 3 });
    captions(ctx, t, [87, 88]);
  }

  // ---------- S4 157.32: THIS COULD HAVE BEEN A TEXT (the biggest lettering of the film) ----------
  const F_BIG = { font: 'display', weight: 900, stretch: -2, track: -4 };
  function bigLine(ctx, t) {
    const ws = LINES[89].words, landed = t >= TEXT_T - LEAD, wk = ws.map(w => clamp((t - (w.a - LEAD)) / .1)), punch = hit(t, ws.map(w => w.a), 10);
    const J = jumpArc(t, TEXT_T, .62, 2.4);
    const scene = (c, cy, z) => { const sh = shake(t, 9 * punch); cam(c, 960 + sh[0], cy + sh[1], z + .06 * punch, landed ? 0 : -.02); roomScene(c, t, { jump: J, cjump: 1 }); noteBurst(c, t, TEXT_T, 960, 600, 34, { seed: 9 }); c.restore(); };
    const r1 = ws.slice(0, 5).map(w => w.w), m1 = measure(ctx, r1.join(' '), { ...F_BIG, size: 100 }).w, s1 = 100 * 1760 / m1;
    const s2 = Math.min(980, 100 * 1840 / measure(ctx, 'TEXT', { ...F_BIG, size: 100 }).w), y1 = 70 + s1 * .74, y2 = 1035, ty = y2 - s2 * .37;
    if (!landed) { scene(ctx, 430, 1.05); fillPts(ctx, rect(0, 0, W, H), rgba(INK.ink, .25), false); }
    else {
      const k = clamp((t - TEXT_T + LEAD) / .12), zz = lerp(1.25, 1, backOut(k, 2.2));
      fillPts(ctx, rect(0, 0, W, H), INK.red, false);
      dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.redDk, k: (x, y) => clamp(.25 + .6 * Math.hypot(x - 960, y - 600) / 1100) });
      const sc = pushLayer(); scene(sc, 190, 1.3);
      const m = pushLayer(); m.translate(960, ty); m.scale(zz, zz); m.translate(-960, -ty);
      txt(m, 'TEXT', 960, y2, { ...F_BIG, size: s2, align: 'center', color: '#000' });
      m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-in'; m.drawImage(sc.canvas, 0, 0); m.globalCompositeOperation = 'source-over';
      popLayer(); popLayer();
      ctx.save(); ctx.translate(960, ty); ctx.scale(zz, zz); ctx.translate(-960, -ty);
      txt(ctx, 'TEXT', 960, y2, { ...F_BIG, size: s2, align: 'center', color: INK.ink, stroke: { w: 26, color: INK.ink }, extrude: { dx: 22, dy: 26, color: INK.ink } });
      ctx.restore();
      ctx.drawImage(m.canvas, 0, 0);
      misregFrame(ctx, 16 * hit(t, [TEXT_T], 6));
    }
    setFont(ctx, { ...F_BIG, size: s1 }); const sp = ctx.measureText(' ').width; let x = (W - m1 * s1 / 100) / 2;
    r1.forEach((w, i) => { const ww = measure(ctx, w, { ...F_BIG, size: s1 }).w;
      if (wk[i] > 0) { const sc = lerp(1.7, 1, backOut(wk[i], 2.6)); ctx.save(); ctx.translate(x + ww / 2, y1 - s1 * .37); ctx.scale(sc, sc); ctx.rotate((hash(i * 7) - .5) * .05);
        txt(ctx, w, -ww / 2, s1 * .37, { ...F_BIG, size: s1, color: INK.paper, stroke: { w: 12, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink }, alpha: clamp(wk[i] * 3) }); ctx.restore(); }
      x += ww + sp; });
    if (landed) flash(ctx, INK.white, .55 * hit(t, [TEXT_T], 14));
  }

  // ---------- S5 159.41: Dan crowd-surfs on a rolling chair ----------
  function surf(ctx, t, lt, dur) {
    const tc = twos(t), p = lt / dur, kk = kick(t, 7), camX = lerp(830, 1090, smooth(p)), dr = drift(t, 8, .5);
    cam(ctx, camX + dr[0], 390 + dr[1], 1.48 + .03 * kk, -.06 + .02 * Math.sin(t * 2));
    roomBack(ctx, t);
    crowd(ctx, t, [camX - 1100, 470, 2200, 330], 70, { seed: 4, view: 'back', style: 'silhouette', jump: .9, hands: .9, phones: .25, inks: INKS, k: 1, size: 40 });
    // Dan on the chair, riding the hands
    const x = lerp(700, 1220, p) + Math.sin(t * 3.1) * 16, y = 640 - Math.abs(Math.sin(tc * 5.2)) * 24, rot = -.16 + Math.sin(tc * 4.2) * .07, s = 54;
    const arms = [[-2.6, -.2], [-1.1, .15], [1.1, .15], [2.6, -.2], [0, .3]];
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.translate(-x, -y);
    rollChair(ctx, x, y, s, { seat: INK.ink, lt: INK.pink });
    person(ctx, x, y, s, 'dan', { sit: 1, turn: .45, lean: -14, hold: 'mic', armR: { a: 150, e: 20 }, armL: { a: 165, e: 8 }, handL: 'horns', mouth: 'scream', open: .9, rage: .9, wild: 1, stage: 1,
      eyes: 'closed', swing: Math.sin(tc * 6) * 30, t: tc });
    const casters = arms.map(([dx, dy]) => [x + dx * s, y + dy * s + .3 * s]);
    ctx.restore();
    // the hands holding the chair up (rotated with it)
    const R = ([px, py]) => { const c = Math.cos(rot), sn = Math.sin(rot), dx = px - x, dy = py - y; return [x + dx * c - dy * sn, y + dx * sn + dy * c]; };
    casters.forEach((c0, i) => { const c1 = R(c0), base = [c1[0] + (i - 2) * 50, 1250], bob = Math.sin(tc * 5 + i) * 6;
      inkLine(ctx, [base, [lerp(base[0], c1[0], .55), lerp(base[1], c1[1], .55)], [c1[0], c1[1] + 22 + bob]], 30, INK.ink, { taper: [0, 0] });
      fillPts(ctx, ell(c1[0], c1[1] + 18 + bob, 22, 20, 12), INK.ink); });
    depth(ctx, 9, c => crowd(c, t, [camX - 1250, 820, 2500, 460], 22, { seed: 8, view: 'back', style: 'silhouette', jump: 1, hands: 1, phones: .1, inks: INKS, k: 1, size: 86 }), { keep: true });
    noteRain(ctx, t, 30, { seed: 6, box: [camX - 1100, -300, 2200, 1500] });
    ctx.restore();
  }

  // ---------- S6 161.05: Bob on the cymbals ----------
  function bobShot(ctx, t) {
    const tc = twos(t), b = beatAt(tc + VLEAD), kk = kick(t, 6), [kx, ky, ks] = BD.kit, sh = shake(t, 10 * kk);
    cam(ctx, kx + 20 + sh[0], ky - 5.6 * ks + sh[1], 2.55 + .12 * kk, .05);
    roomBack(ctx, t);
    const H = hits(t), crashR = kick(t, 5);
    drumKit(ctx, kx, ky, ks, t, { layer: 'back', hits: H, inks: INKS });
    person(ctx, ...BD.bob, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(b + .5), r: 1 }, armR: { a: lerp(165, 95, crashR), e: lerp(25, 10, crashR) }, turn: -.15,
      mouth: 'scream', open: .7 + .3 * crashR, eyes: 'wide', sweat: 1, spit: .6, rage: .7, nod: headbang(tc, 1, 1).nod * .6, tilt: -6 + 8 * crashR, t: tc });
    drumKit(ctx, kx, ky, ks, t, { layer: 'front', hits: H, inks: INKS });
    // sweat spray off his head on every crash
    const lk = lastOf(t, KICKS), a = lk == null ? -1 : t - lk;
    if (a >= 0 && a < .4) for (let i = 0; i < 14; i++) { const an = -Math.PI / 2 + (hash(i * 3.3 + Math.floor(lk * 10)) - .5) * 2.8, v = 260 + hash(i * 1.7) * 380;
      fillPts(ctx, ell(BD.bob[0] + Math.cos(an) * v * a, BD.bob[1] - 8.56 * BD.bob[2] + Math.sin(an) * v * a + 600 * a * a, 4, 6, 8, an), i % 3 ? INK.cyan : INK.white); }
    noteRain(ctx, t, 16, { seed: 12, size: .45, box: [kx - 500, ky - 600, 1000, 800], speed: .5 });
    ctx.restore();
  }

  // ---------- S7 162.27: Linda deadpan, Tasha's bubble pops ----------
  function duo(ctx, t) {
    const tc = twos(t), sn = Math.max(snare(t, 8), kick(t, 9) * .6), cx = (BD.linda[0] + BD.tasha[0]) / 2, cy = BD.linda[1] - 6 * BD.linda[2], sh = shake(t, 6 * sn);
    cam(ctx, cx + sh[0], cy + sh[1], 2.55 + .06 * sn, -.03);
    roomBack(ctx, t);
    const g = t < POP - LEAD ? clamp((t - DUO) / (POP - DUO - .05)) : 1.15 + clamp((t - POP + LEAD) / .25) * .25, hb = headbang(tc, 1, 1.1);
    person(ctx, ...BD.linda, 'linda', { hold: 'guitar', strum: frac(tc * 6), fret: .25 + .5 * frac(tc * 1.7), legs: 'step', stepH: .2, turn: .3, lids: .55, mouth: 'flat', eyes: 'open', lx: .6, t: tc });
    person(ctx, ...BD.tasha, 'tasha', { hold: 'bass', strum: frac(tc * 2), fret: .55, legs: 'wide', turn: -.3, gum: g, eyes: g > 1 ? 'wide' : 'open', lids: g > 1 ? 0 : .5, nod: g > 1 ? hb.nod : 0, tilt: g > 1 ? hb.tilt : 0, t: tc });
    noteRain(ctx, t, 14, { seed: 14, size: .6, box: [cx - 600, cy - 500, 1200, 900], speed: .6 });
    ctx.restore();
  }

  // ---------- S8 163.09: everybody jumps, chairs in the air ----------
  function leap(ctx, t) {
    const sn = snare(t, 6), J = jumpArc(t, LEAP + .02, .72, 2.6), sh = shake(t, 8 * sn);
    cam(ctx, 960 + sh[0], 360 + sh[1], 1.0 + .05 * sn, .02);
    roomScene(ctx, t, { jump: J, cjump: 1, dan: { armL: { a: 170, e: 4 }, armR: { a: 150, e: 10 }, handL: 'horns', eyes: 'closed' } });
    for (let i = 0; i < 3; i++) { const a = t - LEAP + .1, x0 = [240, 1680, 1150][i], vx = [420, -460, 120][i], y = 820 - 1300 * a + 1100 * a * a - i * 50;
      ctx.save(); ctx.translate(x0 + vx * a, y); ctx.rotate((i % 2 ? -1 : 1) * a * 4 + i); rollChair(ctx, 0, 0, 30); ctx.restore(); }
    noteBurst(ctx, t, LEAP, 960, 560, 40, { seed: 3, power: 1.1 });
    ctx.restore();
  }

  // ---------- S9 163.90: the dropout, one held image ----------
  function freeze(ctx, t, lt, dur) {
    BOIL = 0; look(1);
    const z = 1 + .035 * smooth(lt / dur);
    dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.red, k: (x, y) => clamp(1.25 - Math.hypot(x - 960, y - 400) / 640) });
    const L = pushLayer();
    L.translate(960, 540); L.scale(z, z); L.translate(-960, -540);
    noteRain(L, DROP, 9, { seed: 21, size: 1.2 });
    const FZ = headFit(960, 380, 2.8 * 150, 'dan');
    person(L, FZ.x, FZ.y, FZ.s, 'dan', { view: 'bust', armR: { a: 6, e: 4 }, armL: { a: 6, e: -4 }, mouth: 'o', open: .55, eyes: 'closed', brows: .25, browTilt: .45,
      wild: 1, stage: 1, sweat: 1, swing: 32, tilt: -6, nod: -.2, t: DROP + .02 });
    const G = pushLayer(); G.filter = 'grayscale(1) contrast(1.35) brightness(1.08)'; G.drawImage(L.canvas, 0, 0); G.filter = 'none';
    popLayer(); popLayer();
    ctx.drawImage(G.canvas, 0, 0);
    // the last bit of colour: one sticky note drifting down
    const a = lt / dur; note(ctx, 1330 + Math.sin(a * 5) * 60, lerp(-60, 820, a), 62, Math.sin(a * 6) * .6, Math.max(.2, Math.abs(Math.cos(a * 7))), INK.yellow, 3);
  }

  // ---------- S10 165.54: back at the desk; the print drains to pastel ----------
  const endedScreen = k => (c, [x, y, w, h]) => {
    fillPts(c, rect(x, y, w, h), mix('#1F1F1F', INK.ink, k), false);
    txt(c, 'You left the meeting', x + w / 2, y + h * .38, { font: 'ui', weight: 700, size: 30, align: 'center', color: '#FFFFFF' });
    txt(c, 'Quick sync \uD83D\uDE42  \u00B7  03:13:07', x + w / 2, y + h * .52, { font: 'ui', weight: 500, size: 19, align: 'center', color: '#ADADAD' });
    fillPts(c, rrect(x + w / 2 - 128, y + h * .63, 120, 38, 5), mix('#5B5FC7', INK.teams, k), false); txt(c, 'Rejoin', x + w / 2 - 68, y + h * .63 + 26, { font: 'ui', weight: 700, size: 18, align: 'center', color: '#FFFFFF' });
    fillPts(c, rrect(x + w / 2 + 8, y + h * .63, 120, 38, 5), mix('#3D3D3D', '#3B3052', k), false); txt(c, 'Dismiss', x + w / 2 + 68, y + h * .63 + 26, { font: 'ui', weight: 700, size: 18, align: 'center', color: '#FFFFFF' });
  };
  const deskClock = t => clockSecs(17, 1, 0) + (t - LEAVE);
  const deskCam = ctx => cam(ctx, 870, 560, 1.32);
  const MIN_TOAST = { kind: 'chat', who: 'greg', text: 'Hey, got a minute? \uD83D\uDE42', t0: wordT(91, 0) - LEAD, presence: 'available', photo: true };
  function drain(ctx, t, lt) {
    const tc = twos(t), k = 1 - smooth(seg(t, BACK + .1, 166.75)), ping = t >= MIN_TOAST.t0; look(k);
    deskCam(ctx);
    officeDesk(ctx, t, { k, inks: 'fire', clock: deskClock(t), screen: endedScreen(k), headset: false, flicker: 0 });
    const land = jumpArc(t, BACK - .3, .3, .6), pant = Math.abs(Math.sin(tc * 7)) * clamp(1 - lt / 1.4), look1 = seg(tc, MIN_TOAST.t0 + .08, MIN_TOAST.t0 + .2);
    person(ctx, ...DESK.dan, DAN_HS, { sit: 1, turn: .45, sq: land.sq, hunch: lerp(.15, .3, look1), nod: lerp(-.12, 0, look1), tilt: lerp(6, 0, look1), armL: { a: 8, e: -6 }, armR: { a: 10, e: 4 },
      mouth: ping ? 'flat' : 'o', open: .2 + .3 * pant, eyes: tc < 166.3 ? 'closed' : 'open', lids: ping ? .2 : .3, lx: .9 * look1, ly: lerp(-.4, .35, look1),
      wild: lerp(.35, 1, k), stage: k > .5 ? 1 : 0, sweat: lerp(.35, 1, k), t: tc });
    officeDesk(ctx, t, { k, fg: true });
    ctx.restore();
    teamsToast(ctx, 1000, 690, 880, t, MIN_TOAST);
    misregFrame(ctx, 14 * hit(t, [BACK], 7));                    // the band's last hit
  }

  // ---------- S11 166.77: Dan's webcam | the Teams chat ("Hey, got a minute?" / "No." / "Send me the damn text.") ----------
  const CHAT_MSGS = [{ who: 'greg', text: 'Hey, got a minute? \uD83D\uDE42', time: '5:00 PM', at: wordT(91, 0) }, { who: 'dan', text: 'No.', time: '5:00 PM', at: NO }, { who: 'dan', text: 'Send me the damn text.', time: '5:00 PM', at: SENT_T }];
  function headsetProp(ctx, x, y, s, hw) {                       // the headset in his hands as it comes off (cups at x Â± hw)
    const c = '#46454D';
    inkLine(ctx, ell(x, y + .6 * s, hw, 1.0 * s, 24).filter(p => p[1] < y + .6 * s).sort((a, b) => a[0] - b[0]), .16 * s, c, { taper: [0, 0] });
    for (const sd of [-1, 1]) ink(ctx, ell(x + sd * hw, y + .75 * s, .26 * s, .34 * s, 14), { fill: c, line: 2 });
    inkLine(ctx, [[x - hw, y + 1 * s], [x - hw * .7, y + 1.5 * s], [x - hw * .2, y + 1.55 * s]], .07 * s, c, { taper: [0, 0] });
  }
  function split(ctx, t) {
    look(0); const tc = twos(t), LW = 920;
    // left: Dan through his own webcam
    const tight = t >= NO - LEAD && t < SEND - LEAD, s = tight ? 178 : 118, hy = tight ? 480 : 430;
    webcamBg(ctx, [0, 0, LW, H], 'cubicle', 1, { k: 0, t });
    ctx.save(); clipPts(ctx, rect(0, 0, LW, H), false);
    const read = t >= wordT(91, 0) && t < NO, say = t >= NO - LEAD && t < NO + .38, typing = t >= SEND && t < SENT_T - LEAD;
    const off = seg(tc, 171.4, 172.2), hands = off > 0 && off < 1, hx = LW / 2;
    const pose = { view: 'bust', mouth: say || typing ? 'talk' : 'flat', open: say ? .32 : typing ? .22 * singOpen(tc, 93, 93) : 0,
      lids: read ? .25 : .18, lx: read ? .2 : 0, ly: read || typing ? .4 : 0, brows: read && tc > 167.4 && tc < 168.2 ? .3 : 0,
      nod: (typing ? .05 : 0) + .1 * hit(t, [SENT_T], 9) - .06 * Math.sin(seg(t, 168.95, 169.9) * Math.PI), wild: .35, sweat: .2, t: tc };
    // hands up to the ear cups, lift it clear of the head, lower it out of frame
    const handY = kf(off, [[0, hy + 3.4 * s], [.3, hy + .1 * s], [.42, hy + .1 * s], [.68, hy - 1.5 * s], [1, hy + 3.6 * s]], easeInOut), handX = kf(off, [[0, 2.5], [.3, 2.1], [.68, 2.1], [1, 1.6]]) * s;
    if (hands) Object.assign(pose, { reachL: [hx - handX, handY], reachR: [hx + handX, handY], handL: 'grip', handR: 'grip', lids: off > .5 && off < .8 ? .5 : .15, nod: -.04 * Math.sin(off * Math.PI) });
    const FD = headFit(hx, hy, 2.8 * s, 'dan');
    person(ctx, FD.x, FD.y, FD.s, off < .5 ? DAN_HS : CAST.dan, pose);
    if (hands && off >= .5) headsetProp(ctx, hx, handY - .75 * s, s, handX);
    ctx.restore();
    // right: the Teams chat window
    fillPts(ctx, rect(LW, 0, W - LW, H), '#141414', false);
    const cmp = typing ? LINES[93].words.slice(0, 4).filter((w, i) => wordState(t, 93, i).shown).map(w => w.w).join(' ') : '';
    teamsChat(ctx, [LW + 4, -6, W - LW - 4, H + 12], t, { title: 'Greg Hollis (He/Him)', zoom: 3.8, messages: CHAT_MSGS, typing: t < wordT(91, 0) ? 'greg' : null, compose: cmp, shadow: false });
  }

  // ---------- S12 172.42: 5:01. He stands, the lanyard comes off, he leaves ----------
  const LANY = [[1088, 712], [1110, 690], [1160, 684], [1196, 700], [1176, 716], [1120, 720]];
  function lanyardOnDesk(ctx) {
    inkLine(ctx, [...LANY, LANY[0]], 5, '#5C7FA3', { taper: [0, 0] });
    ink(ctx, rrect(1150, 700, 46, 30, 3), { fill: '#F4F2EC', line: 2, smooth: false });
    fillPts(ctx, rect(1156, 706, 14, 16), '#93AAC4', false); txt(ctx, 'DAN K.', 1174, 726, { font: 'ui', weight: 800, size: 7, color: INK.oline });
  }
  function leave(ctx, t) {
    look(0); const tc = twos(t);
    deskCam(ctx);
    officeDesk(ctx, t, { k: 0, clock: deskClock(t), screen: endedScreen(0) });
    const [dx, dy, ds] = DESK.dan, up = easeOut(seg(tc, 172.55, 172.95)), off = seg(tc, 172.95, 173.4), walk = seg(t, 173.5, 174.5), wp = (t - 173.5) * 2.3;
    const pose = { sit: 1 - up, turn: lerp(.45, 0, up), hunch: lerp(.3, 0, up), lids: .2, mouth: 'flat', wild: .35, sweat: .2, t: tc };
    if (tc < 172.55) Object.assign(pose, { lean: 8, reachL: [880, 735], reachR: [960, 735], handL: 'open', handR: 'open' });
    // the lanyard: both hands lift it over his head, the right hand tosses it onto the keyboard
    const hy = kf(off, [[0, 610], [.35, 470], [.6, 330], [.8, 420], [1, 600]], easeInOut), held = off > .3 && off < .85;
    if (off > 0 && off < 1) Object.assign(pose, { reachL: [dx - 70 + 20 * (off > .7 ? 1 : 0), hy + (off > .7 ? 140 * (off - .7) / .3 : 0)], reachR: [dx + 70 + 150 * clamp((off - .7) / .3), hy], handL: 'grip', handR: off > .8 ? 'open' : 'grip', nod: .06 * Math.sin(off * Math.PI) });
    let x = dx;
    if (walk > 0) { x = dx - walk * 720; Object.assign(pose, { turn: -.75, legs: 'walk', phase: frac(wp), hop: Math.abs(Math.sin(wp * Math.PI)) * .25, sit: 0, brows: .15,
      armL: { a: -20 * Math.cos(wp * TAU), e: -15 }, armR: { a: 20 * Math.cos(wp * TAU), e: -15 } }); }
    else if (t >= 173.4) pose.turn = lerp(0, -.75, seg(t, 173.4, 173.5));
    const A = person(ctx, x, dy, ds, off > .3 || walk > 0 || t >= 173.4 ? DAN_FREE : CAST.dan, pose);
    if (held && A) { const [l, r] = [A.handL, A.handR], mid = [(l[0] + r[0]) / 2, Math.max(l[1], r[1]) + 120];
      inkLine(ctx, [l, [lerp(l[0], mid[0], .6), mid[1] - 20], mid, [lerp(r[0], mid[0], .6), mid[1] - 20], r], 5, '#5C7FA3', { taper: [0, 0] });
      ink(ctx, rrect(mid[0] - 23, mid[1] - 4, 46, 30, 3), { fill: '#F4F2EC', line: 2, smooth: false }); }
    const tossA = tc - (172.95 + .85 * .45);
    if (tossA >= .17) lanyardOnDesk(ctx);
    else if (tossA >= 0) { const q = tossA / .17; ink(ctx, rrect(lerp(dx + 150, 1150, q), lerp(430, 700, q) - Math.sin(q * Math.PI) * 90, 46, 30, 3), { fill: '#F4F2EC', line: 2, smooth: false }); }
    officeDesk(ctx, t, { k: 0, fg: true });
    ctx.restore();
  }

  // ---------- S13 174.50: the phone: "approved ðŸ‘"; then Dan's first real smile ----------
  function phoneShot(ctx, t, lt) {
    look(0); fillPts(ctx, rect(0, 0, W, H), '#CFC9BD', false);
    const p = 4.6, h = 876 * p, dr = drift(t, 6, .6), x = 140 - 29 * p + dr[0], y = 180 - 94 * p + dr[1];    // the header centred, the bubble at the left margin
    ctx.save(); ctx.translate(960, 540); ctx.rotate(-.03); ctx.translate(-960, -540);
    phoneScreen(ctx, x, y, h, t, { lock: false, contact: 'greg', thread: [{ text: 'approved \uD83D\uDC4D', side: 'in', at: 174.82 }], typing: t < 174.82, time: '5:01' });
    ctx.restore();
  }
  function smileShot(ctx, t, lt, dur) {
    look(0); const tc = twos(t), z = 1.35 + .04 * lt / dur, bob = Math.abs(Math.sin(tc * 2.2 * Math.PI)) * 8;
    ctx.save(); ctx.translate(960 - 960 * z, 540 - 460 * z); ctx.scale(z, z); openPlan(ctx, t, { k: 0, clock: deskClock(t), flicker: 0 }); ctx.restore();
    const up = seg(tc, 175.55, 175.75), sm = seg(tc, 175.7, 175.95);
    const FS = headFit(960, 735 + bob, 2.8 * 136, 'dan');
    person(ctx, FS.x, FS.y, FS.s, DAN_FREE, { view: 'bust', hold: 'phone', ly: lerp(.7, 0, up), lids: lerp(.3, .1, up), mouth: sm > .5 ? 'smile' : 'flat',
      eyes: sm > .5 ? 'happy' : 'open', brows: lerp(0, .3, sm), wild: .4, blush: .25 * sm, t: tc });
  }

  // ---------- S14 176.30: the title card ----------
  function bubblePts(x, y, w, h, side) {
    const R = Math.min(h * .3, 110), pts = [], arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * i / 8; pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); } };
    arc(x + R, y + R, Math.PI, Math.PI * 1.5); arc(x + w - R, y + R, -Math.PI / 2, 0);
    if (side > 0) pts.push([x + w, y + h - R * .6], [x + w + 46, y + h + 10], [x + w - R * .8, y + h]); else arc(x + w - R, y + h - R, 0, Math.PI / 2);
    if (side < 0) pts.push([x + R * .8, y + h], [x - 46, y + h + 10], [x, y + h - R * .6]); else arc(x + R, y + h - R, Math.PI / 2, Math.PI);
    return pts;
  }
  function titleCard(ctx, t) {
    look(1); BOIL = .7;
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.red, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 540) / 640) - .78) * 2.4) });
    const k1 = backOut(seg(t, TITLE - LEAD, TITLE + .3), 1.5), k2 = backOut(seg(t, 177.2, 177.48), 1.7), dl = clamp((t - 176.75) / .15);
    const f = { font: 'display', weight: 900, stretch: -2, track: -2 }, s = 205;
    // the sent text: THIS COULD HAVE BEEN A TEXT.
    ctx.save(); ctx.translate(1780, 640); ctx.scale(k1, k1); ctx.translate(-1780, -640 - (1 - clamp(k1)) * 120);
    depth(ctx, 5, c => {
      ink(c, bubblePts(150, 90, 1630, 550, 1), { fill: INK.red, shade: { color: INK.redDk, spacing: 22, dir: [.4, .9], from: 200, to: 640, max: .6 }, line: 9, boil: 1.2, seed: 1 });
      txt(c, 'THIS COULD HAVE', 965, 180 + s * .74, { ...f, size: s, align: 'center', color: INK.paper });
      txt(c, 'BEEN A TEXT.', 965, 210 + s * 1.74, { ...f, size: s, align: 'center', color: INK.paper });
    }, { keep: true });
    ctx.restore();
    if (dl > 0) txt(ctx, 'Delivered', 1700, 728, { font: 'ui', weight: 700, size: 40, align: 'right', color: INK.ink, alpha: dl });
    // the reply: the band's auto-reply
    if (t >= 176.85 && t < 177.2) { ink(ctx, bubblePts(150, 790, 190, 110, -1), { fill: INK.ink, line: 6, boil: 1, seed: 3 }); for (let i = 0; i < 3; i++) fillPts(ctx, ell(205 + i * 40, 845 - Math.max(0, Math.sin((t * 2.4 - i * .16) * TAU)) * 10, 11, 11, 12), INK.paper); }
    if (k2 > 0) {
      ctx.save(); ctx.translate(150, 1000); ctx.scale(k2, k2); ctx.translate(-150, -1000);
      depth(ctx, 5, c => {
        ink(c, bubblePts(150, 770, 1120, 230, -1), { fill: INK.ink, line: 8, boil: 1.2, seed: 2 });
        txt(c, '\u21A9 AUTO-REPLY', 236, 836, { font: 'mono', weight: 800, size: 38, color: INK.red });
        txt(c, 'OUT OF OFFICE', 230, 960, { ...f, size: 130, color: INK.paper });
      }, { keep: true });
      ctx.restore();
    }
  }

  // ---------- S15 178.45: silence. The empty desk; Greg again (the loop back to frame 0) ----------
  // c01's frame 0 framing and toast; the toast's t0 is set so its slide-in carries straight across the loop into frame 0
  function tail(ctx, t) {
    look(0); const q = easeInOut(seg(t, TAIL, LAST_F));
    cam(ctx, lerp(870, 810, q), lerp(560, 410, q), lerp(1.32, 2.2, q));         // lands on c01's frame 0 (the thumbnail)
    officeDesk(ctx, t, { k: 0, clock: deskClock(t), screen: endedScreen(0) });
    lanyardOnDesk(ctx);
    officeDesk(ctx, t, { k: 0, fg: true });
    ctx.restore();
    teamsToast(ctx, 930, 620, 950, t, { kind: 'chat', who: 'greg', text: 'Hey, you got a sec? \uD83D\uDE42', t0: LAST_F + 1 / 24 - .2, presence: 'available', photo: true });
  }

  chapter('outro', TAG, 179.88, [
    [TAG, sing], [GAL_T, gallery], [GREG_T, gregShot], [BIG, bigLine], [SURF, surf], [BOB_T, bobShot], [DUO, duo], [LEAP, leap], [DROP, freeze],
    [BACK, drain], [CHAT, split], [LEAVE, leave], [PHONE, phoneShot], [SMILE, smileShot], [TITLE, titleCard], [TAIL, tail],
  ]);

  Object.assign(LYRICS, {
    86: { mode: 'hero', box: [150, 720, 1620, 310], rows: [4, 2], emph: [5], align: 'center', color: INK.paper, hot: INK.yellow, stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink }, end: cutF(GAL_T) },
    87: { mode: 'none' }, 88: { mode: 'none' }, 89: { mode: 'none' },
    90: { mode: 'sub', y: 1000, end: cutF(BACK) },
    91: { mode: 'none' }, 92: { mode: 'none' }, 93: { mode: 'none' },
  });
})();
