// c06_verse3.js: verse 3 (92.30 - 105.90). Office, 3:30 PM, look .3 with orange accents, Dan's rage up to .5.
// Stop-time: the band stabs on the bar downbeats (92.99, 94.64, 96.29, measured in the stems) with quiet snare ticks in
// between, and comes back for good at 98.74. Each stab slams another artefact of the meeting onto Dan's desk until the
// pile buries him. Then: the action items, "noted" -> a Zoom, and the deck.
(() => {
  const K = .3, T0 = 92.30, BAND = 98.74;
  const STABS = [92.99, 94.64, 96.29];
  const TICKS = [93.41, 94.20, 95.06, 95.87, 96.70, 97.53, 98.34];   // the quiet snares between the stabs
  const CLOCK = clockSecs(15, 30, 4);
  const age = (t, at) => t + VLEAD - at;                              // sync law: everything lands one frame early
  const pal = (a, k = .2, b = INK.orange) => mix(a, b, k);

  // ---------- the pile ----------
  // Each artefact is seen spine-on (front face to camera) with a label-maker strip.
  const PILE = [
    { s: 'RE: FW: FOLLOW-UP', w: 660, h: 68, kind: 'ream', at: STABS[0] },
    { s: 'AI RECAP (412 pp)', w: 720, h: 112, kind: 'ream', at: STABS[2], spark: true },
    { s: 'MINUTES', w: 600, h: 68, kind: 'binder', at: wordT(51, 5) },
    { s: 'NOTES', w: 520, h: 50, kind: 'pad', at: wordT(51, 6) },
    { s: 'THREAD \u00B7 47 replies', w: 580, h: 46, kind: 'feed', at: wordT(51, 8) },
  ];
  const AVAL = [
    { s: 'RECAP OF THE RECAP', w: 700, h: 80, kind: 'ream', rot: -.05, dx: -24 },
    { s: 'FOLLOW-UP RE: FOLLOW-UP', w: 760, h: 64, kind: 'binder', rot: .06, dx: 30 },
  ];
  const LANDS = PILE.map(p => p.at).concat([BAND]);
  const DESK_Y = 724, DESK_F = 784, BASE = 770, HEADY = 334, HEADH = 270;

  const C = {
    paper: '#F4F2EC', edge: '#D9D5CB', top: '#FBFAF6', binder: '#8EA3BC', binderDk: '#6F86A3',
    pad: '#E8DCA0', feed: '#F1EFE4', feedLine: '#C5D8C9', tape: '#2B2A30',
  };

  function doc(ctx, it, x, yb, w, h, rot, seed) {
    ctx.save(); ctx.translate(x, yb); ctx.rotate(rot || 0);
    const d = 16, kind = it.kind;
    const face = kind === 'binder' ? C.binder : kind === 'pad' ? C.pad : kind === 'feed' ? C.feed : C.paper;
    ink(ctx, [[-w / 2, -h], [w / 2, -h], [w / 2 - 12, -h - d], [-w / 2 + 12, -h - d]], { fill: kind === 'binder' ? C.binderDk : kind === 'pad' ? C.pad : C.top, line: 2.5, smooth: false, seed });
    ink(ctx, rect(-w / 2, -h, w, h), { fill: face, line: 3, smooth: false, seed: seed + 1 });
    ctx.save(); clipPts(ctx, rect(-w / 2, -h, w, h), false); ctx.beginPath();
    if (kind === 'ream' || kind === 'feed') for (let y = -h + 6; y < -3; y += kind === 'feed' ? 9 : 6) { ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y + (hash(seed + y) - .5) * 2); }
    ctx.strokeStyle = kind === 'feed' ? C.feedLine : C.edge; ctx.lineWidth = 1.6; ctx.stroke();
    if (kind === 'binder') { fillPts(ctx, rect(-w / 2, -h, w, 12), C.binderDk, false); fillPts(ctx, rect(-w / 2, -12, w, 12), C.binderDk, false); fillPts(ctx, rect(-w / 2 + 8, -h + 12, w - 16, h - 24), C.paper, false); }
    if (kind === 'pad') for (let i = 0; i < 16; i++) outline(ctx, ell(-w / 2 + 24 + i * (w - 48) / 15, -h + 5, 6, 9, 10), 2.5, '#77737C');
    if (kind === 'feed') { ctx.beginPath(); for (const sx of [-w / 2 + 12, w / 2 - 12]) for (let y = -h + 8; y < 0; y += 12) { ctx.moveTo(sx + 3.5, y); ctx.arc(sx, y, 3.5, 0, TAU); } ctx.fillStyle = '#D0CCC0'; ctx.fill(); }
    ctx.restore();
    // label-maker strip
    const f = { font: 'mono', weight: 800, size: Math.min(h * .66, 54) };
    let m = measure(ctx, it.s, f); if (m.w > w - 100) { f.size *= (w - 100) / m.w; m = measure(ctx, it.s, f); }
    const lw = m.w + f.size * .9, lh = f.size * 1.3, ly = -h / 2 - lh / 2 + (kind === 'pad' ? 5 : 0);
    fillPts(ctx, rrect(-lw / 2 + 4, ly + 5, lw, lh, 6), rgba(INK.ink, .18), false);
    fillPts(ctx, rrect(-lw / 2, ly, lw, lh, 6), C.tape, false);
    txt(ctx, it.s, 0, ly + lh * .5, { ...f, color: '#F4F2EC', align: 'center', base: 'middle' });
    if (it.spark) { const sx = lw / 2 + 34, sy = ly + lh / 2; fillPts(ctx, star(-sx, sy, 26, .28, 4, 0), INK.teams, false); fillPts(ctx, star(-sx + 26, sy - 18, 11, .28, 4, 0), INK.teams, false); }
    if (kind === 'feed') slackLogo(ctx, -lw / 2 - 30, ly + lh / 2, 36);
    ctx.restore();
  }
  // a loose sheet of paper (centre, size, rotation)
  function sheet(ctx, x, y, s, rot, seed) {
    const p = xform(rect(-s * .4, -s * .52, s * .8, s * 1.04), x, y, 1, rot);
    ink(ctx, p, { fill: '#F7F6F1', line: 2, smooth: false, boil: .3, seed });
    ctx.save(); ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = xform([[-s * .3, -s * .34 + i * s * .14], [s * (.12 + hash(seed + i) * .18), -s * .34 + i * s * .14]], x, y, 1, rot); ctx.moveTo(...a[0]); ctx.lineTo(...a[1]); }
    ctx.strokeStyle = '#C9C6BE'; ctx.lineWidth = Math.max(1.5, s * .025); ctx.stroke(); ctx.restore();
  }

  // landing: y offset (falling in from above the frame), squash; null before it enters
  function land(t, at, drop = 900) {
    const a = age(t, at), fall = .16;
    if (a < -fall) return null;
    if (a < 0) { const p = (a + fall) / fall; return { dy: -(1 - p * p) * drop, sq: 0, a }; }
    return { dy: 0, sq: Math.exp(-a * 22) * Math.cos(a * 40), a };
  }
  // impact lines in the orange accent, out from both bottom corners
  function thud(ctx, x, y, w, a, big = 1) {
    if (a < 0 || a > .3) return;
    const k = easeOut(a / .12), fade = 1 - clamp((a - .12) / .18);
    ctx.save(); ctx.globalAlpha *= fade;
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
      const ang = (-.25 - i * .32) * Math.PI / 2, r0 = 30 + k * 30 * big, r1 = r0 + (50 + i * 16) * k * big, ox = x + sd * (w / 2 + 10);
      inkLine(ctx, [[ox + sd * Math.cos(ang) * r0, y + Math.sin(ang) * r0], [ox + sd * Math.cos(ang) * r1, y + Math.sin(ang) * r1]], 9 * big, INK.orange, { taper: [.2, .6] });
    }
    ctx.restore();
  }

  // the tower at time t, bottom-up: [{it, x, yb, w, h, rot, a}]
  function tower(t) {
    const out = [];
    const sway = TICKS.slice(5).reduce((s, tk) => { const a = age(t, tk); return a < 0 ? s : s + Math.exp(-a * 5) * Math.sin(a * 18) * 22; }, 0);
    const lean = age(t, BAND) < 0 ? easeIn(seg(t + VLEAD, 98.34, BAND)) * 50 : 0;
    PILE.forEach((it, i) => {
      const L = land(t, it.at); if (!L) return;
      for (const o of out) o.h *= 1 - .05 * L.sq;               // the landing squashes the docs below it
      const hk = Math.max(0, out.length - 1) / 4, dx = (sway + lean) * hk * hk;
      out.push({ it, w: it.w * (1 + .08 * L.sq), h: it.h * (1 - .2 * L.sq), dx, rot: dx * .0016, dy: L.dy, a: L.a, i });
    });
    let y = BASE; for (const o of out) { o.yb = y + o.dy; o.x = 960 + o.dx; y -= o.h; }
    return out;
  }

  // ---------- desk props ----------
  function mug(ctx, x, y) {
    const w = 110, h = 128;
    inkLine(ctx, [[x + w / 2 - 4, y - h * .78], [x + w / 2 + 34, y - h * .7], [x + w / 2 + 34, y - h * .34], [x + w / 2 - 4, y - h * .26]], 15, '#E2DFD7', { taper: [0, 0] });
    ink(ctx, rrect(x - w / 2, y - h, w, h, 12), { fill: '#F4F2EC', shade: { color: '#E2DFD7', spacing: 12, dir: [1, 0], from: 0, to: w / 2 }, line: 3, smooth: false, seed: 81 });
    fillPts(ctx, ell(x, y - h + 4, w / 2 - 6, 9, 18), '#6E5A4A');
    txt(ctx, 'PER MY', x, y - h * .58, { font: 'display', weight: 900, stretch: -2, size: 24, align: 'center', color: '#7D6F8F' });
    txt(ctx, 'LAST EMAIL', x, y - h * .36, { font: 'display', weight: 900, stretch: -2, size: 24, align: 'center', color: '#7D6F8F' });
  }
  function plant(ctx, x, y) {
    ink(ctx, [[x - 58, y - 90], [x + 58, y - 90], [x + 45, y], [x - 45, y]], { fill: '#CBB49B', shade: { color: '#B39C83', spacing: 14, dir: [1, 0], from: 0, to: 56 }, line: 3, smooth: false, seed: 91 });
    [[-1, 1.0], [-.5, .7], [.2, .5], [.7, .8], [1.1, 1.1]].forEach(([sd, len], i) => {
      const base = [x + sd * 20, y - 92], a0 = -Math.PI / 2 + sd * .4, L = 100 + 56 * len, mid = [base[0] + Math.cos(a0) * L * .5, base[1] + Math.sin(a0) * L * .5];
      const a1 = a0 + sd * 1.6, tip = [mid[0] + Math.cos(a1) * L * .5, mid[1] + Math.sin(a1) * L * .5];
      inkLine(ctx, [base, mid, tip], 5, INK.plantDk, { taper: [0, .3], seed: i });
      ink(ctx, xform([[0, 0], [22, -20], [52, -12], [64, 0], [52, 12], [22, 20]], tip[0], tip[1], 1, a1 + sd * .3), { fill: i === 4 ? '#C9C18E' : INK.plant, line: 2.5, seed: 92 + i });
    });
  }
  function deskFront(ctx) {
    fillPts(ctx, rect(-60, DESK_Y, W + 120, DESK_F - DESK_Y), INK.desk, false);
    fillPts(ctx, rect(-60, DESK_Y, W + 120, 5), INK.deskDk, false);
    ink(ctx, rect(-60, DESK_F, W + 120, 24), { fill: INK.deskDk, line: 3, smooth: false, seed: 71 });
    fillPts(ctx, rect(-60, DESK_F + 24, W + 120, H), '#8B939C', false);
    fillPts(ctx, rect(-60, DESK_F + 24, W + 120, 30), '#737A84', false);
  }
  // the rage seeping in: orange halftone climbing the partition from the desk, a step per stab
  function seep(ctx, t, x0, x1, y0, y1) {
    const reach = kf(t + VLEAD, [[STABS[0] - .01, .12], [STABS[0] + .1, .3], [STABS[2] - .01, .3], [STABS[2] + .1, .48], [97.34, .48], [97.45, .6], [BAND - .01, .6], [BAND + .1, 1]], easeOut);
    ctx.save(); clipPts(ctx, rect(x0, y0, x1 - x0, y1 - y0), false);
    dotsIn(ctx, [x0, y0, x1, y1], { spacing: 30, color: rgba(INK.orange, .5), angle: .4, k: (x, y) => clamp((reach - (y1 - y) / (y1 - y0)) * 2.2) });
    ctx.restore();
  }

  // ---------- shots 1 + 3: the desk, stop-time ----------
  function danDesk(t) {
    const tc = twos(t), landA = LANDS.map(L => age(tc, L)).filter(a => a >= 0), last = landA.length ? Math.min(...landA) : 9;
    const flinch = last < .13, jolt = Math.exp(-last * 14) * Math.cos(last * 30);
    // after each slam: flinch, glance down at the new doc, then deadpan back into the camera
    const glance = last > .2 && last < 1.0;
    const rage = kf(t, [[92.3, .12], [94.6, .22], [96.4, .34], [97.4, .45], [98.3, .5]]);
    const up = age(tc, 98.34) >= 0, tick = hit(t, TICKS, 9), buried = age(t, BAND) >= 0;
    // the tuft is the barometer: it springs up a notch with every slam (overshoot, then settle)
    const wild = LANDS.reduce((w, L, i) => { const q = age(tc, L); return q < 0 ? w : [.18, .3, .38, .44, .5, .85][i] + .12 * Math.exp(-q * 9); }, .04);
    return { view: 'bust', mouth: up ? 'flat' : 'polite', hunch: .15, rage, glare: 0, lids: flinch ? 1 : up ? 0 : .28 + .2 * tick, eyes: flinch ? 'closed' : up ? 'wide' : 'open',
      ly: up ? -1 : glance ? .85 : 0, lx: up ? .3 : 0, brows: up ? .5 : 0, browTilt: up ? .7 : undefined, nod: jolt * .22 - (up ? .1 : 0), twitch: tick, wild: buried ? .85 : wild, t: tc };
  }
  function desk(ctx, t, lt) {
    look(K);
    const a = age(t, BAND), buried = a >= 0;
    const impact = Math.max(...LANDS.map(L => { const q = age(t, L); return q < 0 ? 0 : Math.exp(-q * 30); }));
    BOIL = .25 + .75 * impact;
    const [sx, sy] = buried ? shake(t, 22 * Math.exp(-a * 5)) : [0, Math.round(impact * 4) * (Math.floor(t * 24) % 2 ? 1 : -1)];
    ctx.save(); ctx.translate(sx, sy);
    webcamBg(ctx, [-60, -60, W + 120, H + 120], 'cubicle', 3, { k: 0, t });
    seep(ctx, t, -60, W + 60, 252, DESK_Y);
    wallClock(ctx, 960, 84, 70, CLOCK + (t - T0), { k: K });
    const F = headFit(960, HEADY, HEADH);
    person(ctx, F.x, F.y, F.s, 'dan', danDesk(t));
    deskFront(ctx);
    plant(ctx, 300, BASE); mug(ctx, 1480, BASE);
    const T = tower(t), top = T.length ? T[T.length - 1] : null;
    fillPts(ctx, rect(960 - 380, BASE - 4, 760, 14), pal(INK.deskDk, .35), false);
    // the avalanche (two last docs + loose sheets, half behind, half in front)
    // the burst goes out sideways so the buried tuft reads within a few frames
    const debris = front => { if (a < 0) return; for (let i = front ? 0 : 1; i < 30; i += 2) {
      const side = i % 4 < 2 ? -1 : 1, elev = .1 + hash(i * 3.3) * .9, v = 1500 + hash(i * 5.1) * 1500, g = 2400, tt = a + .02;
      const x = 960 + side * (60 + hash(i * 7.7) * 260) + side * Math.cos(elev) * v * tt, y = 300 + hash(i * 1.3) * 160 - Math.sin(elev) * v * tt + g * tt * tt * .5;
      if (y > H + 150 || x < -150 || x > W + 150) continue;
      sheet(ctx, x, y, 150 + hash(i * 9) * 70, (hash(i * 2) - .5) * 2 + tt * (hash(i * 4) - .5) * 16, 300 + i); } };
    debris(false);
    T.forEach(o => doc(ctx, o.it, o.x, o.yb, o.w, o.h, o.rot, 10 + o.i * 7));
    T.forEach(o => thud(ctx, o.x, o.yb, o.w, o.a));
    let y = top ? top.yb - top.h : BASE;
    AVAL.forEach((it, i) => {
      const L = land(t, BAND - .04 * (AVAL.length - 1 - i), 1000); if (!L) return;
      const h = it.h * (1 - .25 * L.sq);
      doc(ctx, it, 960 + it.dx + (top ? top.dx : 0), y + L.dy, it.w, h, it.rot * (1 - Math.exp(-Math.max(0, L.a) * 10)), 200 + i * 9); y -= h;
    });
    if (a >= 0) thud(ctx, 960, BASE - 220, 860, a, 1.7);
    debris(true);
    ctx.restore();
    // the band is back: the print slips off register for a few frames
    if (buried) misregFrame(ctx, 9 * Math.exp(-a * 14), .3);
  }

  // ---------- shot 2: the AI recap writes it all ----------
  const RECAP = [
    { h: 'Discussion', items: ['Greg waited two more minutes for people to join.', 'Greg asked if everyone could see his screen.', 'Greg asked if everyone could see his screen.', 'Greg asked if everyone could see his screen.',
      'Linda said Greg was on mute.', "Bob's connection was unstable.", 'Bob asked if anyone could hear him.', 'Greg suggested circling back.', 'Greg circled back.', 'Greg recapped the previous recap.',
      'Silence (14 seconds).', 'Dan said "sounds good".', 'Greg said this would be quick.', 'Greg shared the deck.', 'Greg asked if everyone could see the deck.', 'Greg suggested circling back on the circle back.',
      'Tasha left and rejoined.', 'Greg thanked everyone for their time.', 'Greg asked one more quick thing.', 'Greg thanked everyone for their time again.'] },
    { h: 'Follow-up tasks', tasks: true, items: ['Dan to send a recap of this recap.', 'Dan to set up a follow-up re: the follow-up.', 'Dan to read the deck.'] },
  ];
  const RZ = 3.7, RX = 130, RY = 30, RW = 1660;
  // reveal times: one item per sung syllable, then the flood on "write it all"
  const REV = (() => { const n = RECAP.reduce((s, r) => s + r.items.length, 0), r = [94.62, 94.80, 95.00, 95.20, 95.32, 95.36, 95.54, 95.66, 95.74]; let x = 95.78; while (r.length < n) { r.push(x); x += .024; } return r; })();
  // aiRecap's layout maths: the native bottom y of every item
  function recapLayout(ctx) {
    const Wn = RW / RZ, out = []; let yy = 212;
    for (const s of RECAP) { yy += 26; for (const it of s.items) {
      let lines = 1, line = ''; for (const w of it.split(' ')) { const tryL = line ? line + ' ' + w : w; if (line && measure(ctx, tryL, { font: 'ui', size: 14, weight: 400 }).w > Wn - 110) { lines++; line = w; } else line = tryL; }
      yy += lines * 20 + 8; out.push(yy); } yy += 12; }
    return out;
  }
  function recap(ctx, t, lt) {
    look(K); BOIL = .3;
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const tv = t + VLEAD, n = REV.filter(r => r <= tv).length, last = REV[Math.max(0, n - 1)];
    const vt = n ? .3 + (n - 1) * .42 + .25 * clamp((tv - last) / .1) : 0;
    // the view follows the newest item, keeping it above the captions
    const lay = recapLayout(ctx), bottom = n ? RY + lay[n - 1] * RZ : 0, scroll = Math.max(0, bottom - 760);
    const pop = Math.exp(-Math.max(0, age(t, STABS[1])) * 16);
    ctx.save(); ctx.translate(960, 540); ctx.scale(1 + .05 * pop, 1 + .05 * pop); ctx.translate(-960, -540);
    aiRecap(ctx, [RX, RY - scroll, RW, 4200], vt, { zoom: RZ, t0: 0, title: 'Quick sync \uD83D\uDE42', date: 'Wed, Oct 7  \u00B7  1:30 PM \u2013 3:29 PM', sections: RECAP });
    ctx.restore();
    // the AI sparkle pops on the stab
    const sp = age(t, STABS[1]);
    if (sp >= 0 && sp < .4) { const r = 40 + 180 * easeOut(sp / .4), cx = RX + 42 * RZ, cy = RY + 154 * RZ - scroll;
      ctx.save(); ctx.globalAlpha = 1 - sp / .4; fillPts(ctx, star(cx, cy, r, .16, 4, 0), INK.teamsLt, false); outline(ctx, star(cx, cy, r * 1.25, .16, 4, 0), 6, INK.orange); ctx.restore(); }
    // a scrollbar thumb that shrinks as it writes (the recap is absurdly long)
    const total = Math.max(1080, bottom + 3000 * seg(tv, 95.7, 96.3)), th = clamp(1080 / total * 1000, 60, 1000), ty = 10 + (1060 - th) * clamp(scroll / Math.max(1, total - 1080));
    fillPts(ctx, rrect(1868, ty, 14, th, 7), '#6B6B6B', false);
  }

  // ---------- shot 4: the action items ----------
  const ITEMS = ['Dan to recap the recap', 'Dan to set up a follow-up', 'Dan will own Q4 (per Greg)'];
  const SWIPE = [99.58, 99.99, 100.40];
  function mound(ctx) {
    for (let i = 0; i < 60; i++) {
      const u = hash(i * 2.7) * 2 - 1, x = 960 + u * 1100, y = 600 + Math.abs(u) * Math.abs(u) * 240 + hash(i * 3.9) * 300;
      sheet(ctx, x, y, 170 + hash(i * 6) * 90, (hash(i * 8.1) - .5) * 1.4, 500 + i);
    }
    doc(ctx, PILE[1], 330, 1000, 620, 120, -.18, 600); doc(ctx, PILE[2], 1600, 980, 560, 84, .14, 610);
  }
  function actionItems(ctx, t, lt, dur) {
    look(K); BOIL = .6;
    const tc = twos(t), z = lerp(1, 1.1, easeInOut(lt / dur)), [dx, dy] = drift(t, 6, .6);
    cam(ctx, 960 + dx, 540 + dy, z);
    webcamBg(ctx, [-200, -200, W + 400, H + 400], 'cubicle', 3, { k: 0, t });
    ctx.save(); clipPts(ctx, rect(-200, 220, W + 400, 900), false); dotsIn(ctx, [-200, 220, W + 200, 1100], { spacing: 30, color: rgba(INK.orange, .5), angle: .4, k: (x, y) => clamp((y - 330) / 500) }); ctx.restore();
    const sw = 900, shh = 470, cx = 960, top = 330, rot = -.012 + noise1(tc * 1.5) * .006, F = headFit(cx, 262, 290);
    const wake = age(t, wordT(53, 5)) >= 0, n = SWIPE.filter(s => age(tc, s) >= 0).length;
    const P = { view: 'bust', mouth: 'polite', rage: kf(t, [[99.2, .35], [100.4, .5], [100.9, .58]]), glare: 0, eyes: wake ? 'wide' : 'open', lids: wake ? 0 : .35,
      ly: wake ? 0 : .9, lx: wake ? 0 : -.6 + .45 * n, brows: wake ? .55 : -.1, twitch: hit(t, SWIPE, 6), reachL: [cx - sw / 2 + 24, top + 190], reachR: [cx + sw / 2 - 24, top + 210], handL: 'grip', handR: 'grip', t: tc };
    person(ctx, F.x, F.y, F.s, 'dan', P);
    mound(ctx);
    // the sheet he holds up
    ctx.save(); ctx.translate(cx, top + shh / 2); ctx.rotate(rot); ctx.translate(-sw / 2, -shh / 2);
    fillPts(ctx, rect(14, 18, sw, shh), rgba(INK.ink, .14), false);
    ink(ctx, rect(0, 0, sw, shh), { fill: '#FBFAF6', line: 3, smooth: false, seed: 700 });
    teamsLogo(ctx, 74, 52, 40); txt(ctx, 'Recap  \u00B7  Quick sync \uD83D\uDE42', 108, 62, { font: 'ui', weight: 600, size: 30, color: '#6E6A74' });
    txt(ctx, 'ACTION ITEMS', 56, 150, { font: 'ui', weight: 900, size: 78, color: '#2B2A30' });
    ITEMS.forEach((s, i) => {
      const y = 240 + i * 82, f = { font: 'ui', weight: 600, size: 52 }, dw = measure(ctx, 'Dan', f).w, k = easeOut(clamp(age(t, SWIPE[i]) / .12));
      if (k > 0) fillPts(ctx, [[118, y - 42], [118 + (dw + 22) * k, y - 46], [118 + (dw + 22) * k, y + 10], [118, y + 12]], rgba(INK.orange, .6), false);
      outline(ctx, rrect(58, y - 38, 40, 40, 6), 4, '#6E6A74');
      txt(ctx, s, 128, y, { ...f, color: '#2B2A30' });
    });
    ctx.restore();
    // his hands, drawn again on top so the fingers grip the edges
    for (const p of [P.reachL, P.reachR]) { ctx.save(); clipPts(ctx, ell(p[0], p[1], 64, 64, 20), false); person(ctx, F.x, F.y, F.s, 'dan', P); ctx.restore(); }
    ctx.restore();
  }

  // ---------- shot 5: "noted" needs a Zoom ----------
  const ZLINK = 'Re: noted \u2014 can we hop on a quick Zoom? \uD83D\uDE42 zoom.us/j/83275510';
  function noted(ctx, t) {
    look(K); BOIL = .4;
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const sent = wordT(54, 2), reply = wordT(54, 3);
    teamsChat(ctx, [130, 900 - 322 * 4.2, 1660, 1600], t, { zoom: 4.2, title: 'Greg Hollis (He/Him)',
      messages: [{ who: 'greg', text: "Recap's up! Lmk if any questions \uD83D\uDE42", time: '3:29 PM' }, { who: 'dan', text: 'noted', time: '3:30 PM', at: sent }, { who: 'greg', text: ZLINK, time: '3:30 PM', at: reply }],
      compose: age(t, sent) < 0 ? { text: 'noted', t0: wordT(54, 0), cps: 22 } : '', typing: age(t, sent) >= .1 && age(t, reply) < 0 ? 'greg' : null });
    const za = age(t, wordT(54, 5));
    if (za >= 0) {
      const k = backOut(clamp(za / .14), 1.6);
      ctx.save(); ctx.translate(960, 660); ctx.scale(lerp(.6, 1, k), lerp(.6, 1, k)); ctx.translate(-960, -660);
      zoomCall(ctx, [180, 262, 1560, 800], t, { waiting: true, title: 'Re: noted', zoom: 2.4 });
      ctx.restore();
    }
  }

  // ---------- shot 6: the deck ----------
  const TITLES = ['AGENDA', 'BACKGROUND', 'CONTEXT', 'MORE CONTEXT', 'SYNERGIES', 'ROADMAP', 'ROADMAP (CONT.)', 'KEY LEARNINGS', 'ALIGNMENT', 'DEEP DIVE', 'APPENDIX', 'APPENDIX B'];
  const FILE = 'Q4_Alignment_FINAL_v7_REAL';
  function deckRead(ctx, t) {
    look(K); BOIL = .4;
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    const tv = t + VLEAD, n = Math.round(1 + 93 * easeIn(seg(tv, wordT(55, 5), wordT(55, 7))));
    const last = n >= 94, k = backOut(clamp(age(t, 102.78) / .14), 1.4);
    ctx.save(); ctx.translate(0, (1 - k) * 160);
    pptSlide(ctx, [0, 0, W, H], t, { zoom: 1.5, n, total: 94, file: FILE,
      title: last ? 'QUESTIONS?' : TITLES[(n - 1) % TITLES.length], bullets: last ? ["Let's set up a call to walk through the deck \uD83D\uDE42"] : n === 1 ? ['Why we made this deck', 'How to read this deck', 'Deck overview (see slide 2)'] : ['\u2014', '\u2014'] });
    ctx.restore();
    stamp(ctx, '94 / 94', 1460, 700, 120, age(t, wordT(55, 7)), { color: INK.orange, rot: -.1 });
  }
  function deckCall(ctx, t, lt) {
    look(K); BOIL = .4;
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const tc = twos(t), push = easeInOut(clamp(age(t, wordT(56, 5)) / .3));
    cam(ctx, lerp(960, 800, push), lerp(540, 650, push), lerp(1, 1.62, push));
    teamsCall(ctx, [0, 0, W, H], t, { zoom: 1.5, layout: 'share', title: 'Deck walkthrough \uD83D\uDE42 | Microsoft Teams', timer: 7110 + (t - T0), participants: 112,
      share: (c, box, tt) => pptSlide(c, box, tt, { zoom: box[2] / 1280, n: 1, total: 94, file: FILE, title: 'AGENDA', bullets: ['1. Explain the deck', '2. Questions about the deck', '3. Next steps: another deck'] }),
      tiles: [{ who: 'greg', speaking: true, cam: 'forehead', camK: .35, pose: { mouth: 'talk', open: .2 + .4 * Math.abs(Math.sin(tc * 7)) } },
        { who: 'dan', muted: true, pose: { rage: .5, mouth: 'polite', glare: .5 } }, { who: 'linda', muted: true }, { who: 'tasha', camOff: true, muted: true }, { who: 'bob', muted: true, frozen: 104.6 }] });
    ctx.restore();
    stamp(ctx, '1 / 94', 1500, 470, 150, age(t, wordT(56, 7)), { color: INK.orange, rot: -.12 });
  }

  chapter('verse3', 92.30, 105.90, [[92.30, desk], [94.64, recap], [96.29, desk], [99.16, actionItems], [100.94, noted], [102.78, deckRead], [104.28, deckCall]]);
  Object.assign(LYRICS, {
    54: { mode: 'livecap', hold: 0, y: 240 },
  });
})();
