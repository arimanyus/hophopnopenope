// c03_verse2.js: verse 2 + pre-chorus 2 (41.15 - 61.85). Office, 12:01 PM: a hard cut back to beige after the chorus.
// Verse: locked symmetric camera, the jokes live in the apps (Greg too close, the one-sentence invite, background blur
// eating Dan, the screen-share Droste, every tile staring, the CONTEXT slide). One 4-frame mask slip on "Buddy".
// Pre-chorus: the invite becomes a bomb, the countdown turns into a meeting timer, the clock spins an hour;
// look 0 -> .6, rage .3 -> .6.
(() => {
  const DAN = { ...CAST.dan, ear: 'headset', pal: { ...CAST.dan.pal, headset: ['#46454D', INK.ink] } };
  const TITLE = 'Quick sync \uD83D\uDE42 | Microsoft Teams', FULL = [0, 0, W, H];
  const NOON = clockSecs(12, 1), clockAt = t => NOON + (t - 41.15), timerAt = t => 31 * 60 + 4 + (t - 41.15);
  const LK = t => remap(t, 55.24, 61.85, 0, .6);                       // the pre-chorus bleed
  const RG = t => remap(t, 55.24, 61.85, .3, .62);                     // Dan's rage through the pre-chorus
  const hms = s => { s = Math.max(0, Math.floor(s)); return [s / 3600, s / 60 % 60, s % 60].map(v => String(Math.floor(v)).padStart(2, '0')).join(':'); };
  const fit169 = ([x, y, w, h]) => { const a = Math.min(w, h * 16 / 9), b = a * 9 / 16; return [x + (w - a) / 2, y + (h - b) / 2, a, b]; };

  // ---------- small props ----------
  // a sandwich seen side-on with a bite out of its right end, centred on (x, y)
  function sandwich(ctx, x, y, s, rot) {
    const X = p => xform(p, x, y, s, rot);
    const bread = dy => X([[-54, -12], [30, -14], [42, -8], [34, 0], [42, 7], [30, 13], [-54, 12], [-60, 0]].map(([a, b]) => [a, b + dy]));
    ink(ctx, bread(-18), { fill: '#EFDDB4', line: 2.5, seed: 3 });
    inkLine(ctx, X([[-52, 2], [-34, 9], [-18, 1], [0, 9], [18, 1], [34, 8]]), 9, '#9DB27C', { taper: [.05, .2] });
    ink(ctx, X([[-46, -6], [30, -6], [30, 4], [-46, 4]]), { fill: '#D88E7E', line: 2, smooth: false, seed: 5 });
    ink(ctx, bread(20), { fill: '#EFDDB4', line: 2.5, seed: 4 });
  }
  // office scissors, pivot at (x, y), blades along rot; open 0..1
  function scissors(ctx, x, y, s, rot, open) {
    const a = .05 + open * .32;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.rotate(sd * a);
      ink(ctx, [[0, -9 * sd], [118, -2 * sd], [124, 0], [0, 9 * sd]], { fill: mix('#C9CDD2', INK.white, STYLE.k), line: 2.5, smooth: false, seed: 5 + sd });
      ink(ctx, ell(-46, 14 * sd, 30, 18, 18, sd * .3), { fill: mix('#E07B39', INK.orange, STYLE.k), line: 3, seed: 7 + sd });
      fillPts(ctx, ell(-46, 14 * sd, 17, 8, 14, sd * .3), mix('#F3EFE6', INK.paper, STYLE.k));
      ctx.restore();
    }
    fillPts(ctx, ell(0, 0, 6, 6, 10), mix(INK.oline, INK.ink, STYLE.k));
    ctx.restore();
  }
  // Dan's webcam background (world.js 'cubicle') with the wall clock above the partition, so noon keeps ticking
  function cubicleCam(ctx, box, t, secs) {
    const [x, y, w, h] = box;
    webcamBg(ctx, box, 'cubicle', 1, { k: STYLE.k, t });
    ctx.save(); clipPts(ctx, rect(x, y, w, h * .18), false); wallClock(ctx, x + w * .24, y + h * .07, h * .16, secs, { k: STYLE.k }); ctx.restore();
  }

  // Dan's Teams tile: his cubicle behind him (the clock keeps reading noon), muted, polite
  const danTile = (pose = {}, o = {}) => ({ who: DAN, muted: true, ...o, draw: (c, box, t) => {
    cubicleCam(c, box, t, clockAt(t)); const F = bustFit(box, DAN, o.fit);
    person(c, F.x, F.y, F.s, DAN, { view: 'bust', glare: .9, mouth: 'polite', lids: blink(twos(t), 5), t: twos(t), ...pose });
  } });

  // ---------- 41.15 noon: the desk, mid-bite ----------
  const gregTile = (t, camK, li) => ({ who: 'greg', speaking: true, cam: 'forehead', camK, pose: { mouth: 'talk', open: .12 + .62 * singOpen(t, li, li), brows: .3 } });
  function noon(ctx, t) {
    look(0); const tc = twos(t);
    const screen = (c, b, tt) => teamsCall(c, b, tt, { chrome: 'bar', layout: 'speaker', timer: timerAt(tt), participants: 9, shadow: false,
      tiles: [gregTile(tt, .45, 24), danTile(), { who: 'linda', muted: true }, { who: 'tasha', camOff: true, muted: true }] });
    officeDesk(ctx, t, { k: 0, clock: clockAt(t), screen, headset: false });
    const [x, y, s] = DESK.dan, pose = { sit: 1, turn: .45, hunch: .35, glare: 1, lx: .6, mouth: 'o', open: .45, lids: blink(tc, [41.85]), t: tc };
    const M = person(pushLayer(), x, y, s, DAN, pose).mouth; popLayer();
    const A = person(ctx, x, y, s, DAN, { ...pose, reachL: [M[0] + 30, M[1] + 52], handL: 'grip' });
    sandwich(ctx, A.handL[0] + 16, A.handL[1] - 30, .8, -.12);
    officeDesk(ctx, t, { k: 0, fg: true });
  }

  // ---------- 42.21 / 44.90 Greg far too close (and closer) ----------
  const SELF = [1548, 826, 336, 189];
  function gregClose(k0, k1, li, a, b) {
    return (ctx, t) => {
      look(0); const tc = twos(t), lean = easeInOut(seg(t, a, b)), camK = lerp(k0, k1, lean) + noise1(t * .7) * .02;
      fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
      teamsCall(ctx, FULL, t, { title: TITLE, timer: timerAt(t), participants: 9, layout: 'speaker', shadow: false, unread: 4, tiles: [gregTile(tc, camK, li)] });
      // Dan's self view leans back as Greg leans in
      teamsTile(ctx, SELF, t, { ...danTile({ nod: -lean * .12, lids: blink(tc, [42.9, 45.3]) }, { fit: { zoom: lerp(1, .8, lean), dy: lean * .05 } }), name: 'Dan Kowalski (You)', zoom: 1.1 });
    };
  }

  // ---------- 43.30 the invite: one sentence, sixty minutes ----------
  function invite(ctx, t) {
    look(0);
    const OL = INK.outlook, hitK = backOut(seg(t, 44.17, 44.42), 1.7), long = t >= 44.17;
    fillPts(ctx, rect(0, 0, W, H), '#F3F2F1', false);
    fillPts(ctx, rect(0, 0, W, 76), OL, false);
    outlookLogo(ctx, 52, 38, 36); txt(ctx, 'Outlook', 84, 50, { font: 'ui', weight: 600, size: 28, color: '#FFFFFF' });
    fillPts(ctx, rrect(640, 18, 640, 40, 6), '#DEECF9', false); txt(ctx, 'Search', 690, 46, { font: 'ui', size: 20, color: '#335A7A' });
    const card = outlookInvite(ctx, 96, 112, 780, t, { title: 'Quick question \uD83D\uDE42', when: long ? 'Wed 10/7/2026 1:00 PM \u2013 2:00 PM' : 'Wed 10/7/2026 1:00 PM \u2013 1:15 PM', dur: long ? '60 min' : '15 min', attendees: ['greg', 'dan'] }).card;
    // the body: one sentence, then the Teams boilerplate
    const by = card[1] + card[3] + 22, bw = card[2], bh = 760 - by;
    ink(ctx, rrect(card[0], by, bw, bh, 10), { fill: '#FFFFFF', line: 1.5, smooth: false });
    txt(ctx, 'Just wanted your thoughts on this.', card[0] + 36, by + 70, { font: 'ui', weight: 600, size: 46, color: '#242424' });
    ['________________________________________________', 'Microsoft Teams meeting', 'Join on your computer, mobile app or room device', 'Meeting ID: 284 119 553 07   Passcode: qU1ck5yn']
      .forEach((s, i) => txt(ctx, s, card[0] + 36, by + 122 + i * 30, { font: 'ui', weight: i === 1 ? 700 : 400, size: 21, color: '#8A8886' }));
    // the day column: the block stretches from 15 minutes to an hour on "sentence"
    const end = 13 + lerp(.25, 1, hitK);
    outlookCalendar(ctx, [930, 112, 894, 648], t, { days: 1, date: 7, today: 0, from: 13, to: 14.5, nav: false, zoom: 1.4,
      events: [{ day: 0, start: 13, end, title: 'Quick question \uD83D\uDE42', where: long ? '1:00 PM \u2013 2:00 PM' : '1:00 PM \u2013 1:15 PM' }] });
  }

  // ---------- 46.56 background blur eats Dan ----------
  const PANEL = [1450, 148, 446, 908];
  function effectsPanel(ctx, t, sel) {
    const [x, y, w, h] = PANEL;
    ink(ctx, rrect(x, y, w, h, 12), { fill: '#292929', line: 1.5, lineColor: '#3D3D3D', smooth: false });
    txt(ctx, 'Background effects', x + 30, y + 58, { font: 'ui', weight: 700, size: 30, color: '#FFFFFF' });
    txt(ctx, '\u2715', x + w - 44, y + 58, { font: 'ui', size: 26, color: '#ADADAD' });
    txt(ctx, 'Background', x + 30, y + 118, { font: 'ui', weight: 600, size: 22, color: '#ADADAD' });
    const tw = 182, th = 112, cells = ['None', 'Blur', 'Office', 'Beach', 'Bookshelf', 'Space'];
    cells.forEach((name, i) => {
      const cx = x + 30 + (i % 2) * (tw + 22), cy = y + 140 + Math.floor(i / 2) * (th + 56), b = rrect(cx, cy, tw, th, 8);
      ctx.save(); clipPts(ctx, b, false);
      const bg = ['#3A3A3A', '#8D98A3', '#C6C1B5', '#8CC7DE', '#B9A48C', '#20244A'][i]; fillPts(ctx, rect(cx, cy, tw, th), bg, false);
      if (i === 0) { ctx.strokeStyle = '#D6D6D6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx + tw / 2, cy + th / 2, 26, 0, TAU); ctx.moveTo(cx + tw / 2 - 18, cy + th / 2 + 18); ctx.lineTo(cx + tw / 2 + 18, cy + th / 2 - 18); ctx.stroke(); }
      if (i === 1) { ctx.filter = 'blur(6px)'; fillPts(ctx, ell(cx + tw / 2, cy + 46, 22, 26, 16), '#E8C9AE'); fillPts(ctx, ell(cx + tw / 2, cy + 120, 56, 44, 16), '#B8CCE1'); ctx.filter = 'none'; }
      if (i === 2) { fillPts(ctx, rect(cx, cy + th * .55, tw, th), '#A8B2BC', false); fillPts(ctx, rect(cx + 20, cy + 18, 60, 36), '#F4F2EC', false); }
      if (i === 3) { fillPts(ctx, rect(cx, cy + th * .62, tw, th), '#E9D9AE', false); fillPts(ctx, ell(cx + 140, cy + 30, 16, 16, 12), '#FFE9A0'); }
      if (i === 4) for (let j = 0; j < 7; j++) fillPts(ctx, rect(cx + 16 + j * 22, cy + 20 + hash(j) * 12, 16, 40), ['#7C8FA8', '#C08A6E', '#8FA88C', '#D1B36E'][j % 4], false);
      if (i === 5) for (let j = 0; j < 12; j++) fillPts(ctx, ell(cx + hash(j * 3) * tw, cy + hash(j * 7) * th, 2, 2, 6), '#FFFFFF');
      ctx.restore();
      if (sel === i) outline(ctx, rrect(cx - 4, cy - 4, tw + 8, th + 8, 10), 4, '#7F85F5', { smooth: false });
      txt(ctx, name, cx + 4, cy + th + 32, { font: 'ui', weight: sel === i ? 700 : 400, size: 21, color: sel === i ? '#FFFFFF' : '#D6D6D6' });
    });
    return [x + 30 + tw + 22 + tw / 2, y + 140 + th / 2];
  }
  function blurCam(ctx, t) {
    look(0); const tc = twos(t), CLICK = 46.88, BG0 = 46.92, D0 = 47.4, D1 = 47.9;
    const bgR = 22 * easeOut(seg(t, BG0, BG0 + .18)), dR = 60 * easeIn(seg(t, D0, D1));
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const camBox = box => { const [x, y, , h] = box; return [x, y, PANEL[0] - 12 - x, h]; };
    const draw = (c, box) => {
      const [x, y, w, h] = box, big = [x - 80, y - 80, w + 160, h + 160];
      const L = pushLayer(); cubicleCam(L, big, t, clockAt(t)); popLayer();
      c.save(); if (bgR > .5) c.filter = `blur(${bgR}px)`; c.drawImage(L.canvas, 0, 0); c.restore();
      const cb = camBox(box), D = pushLayer(), F = headFit(cb[0] + cb[2] / 2, cb[1] + cb[3] * .47, cb[3] * .46, DAN);
      const A = person(D, F.x, F.y, F.s, DAN, { view: 'bust', glare: 1, mouth: 'polite', lids: blink(tc, [46.7]), twitch: t > 47.0 && t < 47.6 ? twitchAt(t, .6) : 0, t: tc });
      popLayer();
      if (dR < .5) { c.drawImage(D.canvas, 0, 0); return; }
      c.save(); c.filter = `blur(${dR}px)`; c.drawImage(D.canvas, 0, 0); c.restore();
      // the last thing to go: the glasses (clipped tight to the two lenses and the bridge)
      const s = F.s, [l, r] = A.eyeL[0] < A.eyeR[0] ? [A.eyeL, A.eyeR] : [A.eyeR, A.eyeL], lw = .17 * 1.3 * s, lh = .15 * 1.05 * s, m = .03 * s;
      c.save(); c.beginPath();
      for (const e of [l, r]) c.rect(e[0] - lw - m, e[1] - lh - m, 2 * (lw + m), 2 * (lh + m));
      c.rect(l[0], l[1] - lh * .7, r[0] - l[0], lh * .5); c.clip(); c.drawImage(D.canvas, 0, 0); c.restore();
    };
    teamsCall(ctx, FULL, t, { title: TITLE, timer: timerAt(t), participants: 9, layout: 'speaker', shadow: false, camera: true, tiles: [{ who: DAN, name: 'Dan Kowalski (You)', muted: true, draw }] });
    const target = effectsPanel(ctx, t, t >= CLICK - 1 / 24 ? 1 : 0);
    const mv = easeInOut(seg(t, 46.5, CLICK - .04)), px = lerp(1180, target[0], mv), py = lerp(760, target[1] + 10, mv);
    if (t < 47.5) pointer(ctx, px, py, 52, { click: t >= CLICK - 1 / 24 ? clamp((t - CLICK + 1 / 24) / .18) : 0 });
  }

  // ---------- 48.26 screen share: Greg shares his whole screen, which shows the call, which shows... ----------
  const shareTiles = t => [{ who: 'greg', speaking: true, cam: 'forehead', camK: .3, pose: { mouth: 'talk', open: .1 + .6 * singOpen(t, 28, 28) } }, danTile({ glare: 1 }), { who: 'linda', muted: true }, { who: 'tasha', camOff: true, muted: true }];
  const DR = (() => { // level geometry: the shared desktop inside the call stage, the call window inside the desktop
    const z = W / 1280, pad = 8 * z, gap = 6 * z, sy = 88 * z + pad, sh = H - sy - pad, sw = W - pad * 2, cw = Math.min(sw * .22, 300 * z);
    const scr = fit169([pad, sy, sw - cw - gap, sh]), win = [scr[0] + scr[2] * .19, scr[1] + scr[3] * .08, scr[2] * .6, scr[2] * .6 * 9 / 16], r = win[2] / W;
    return { scr, win, r, f: [win[0] / (1 - r), win[1] / (1 - r)] };
  })();
  function desktop(c, area, t, d, on) {
    const s = fit169(area), [x, y, w, h] = s, u = w / 100;
    fillPts(c, rect(...area), '#000000', false);
    if (!on) { spinner(c, x + w / 2, y + h / 2, u * 3, t); return; }
    fillPts(c, rect(x, y, w, h), '#3C6FB5', false);
    fillPts(c, ell(x + w * .62, y + h * .52, w * .3, h * .42, 40, -.4), '#5B8FD0'); fillPts(c, ell(x + w * .7, y + h * .6, w * .17, h * .25, 30, -.4), '#86B2E6');
    if (u > 2.5) ['Q4_FINAL_v7.pptx', 'Q4_FINAL_v8.pptx', 'New folder (12)', 'thoughts.docx'].forEach((n, i) => {
      const ix = x + u * 4.6, iy = y + u * (4 + i * 9);
      fillPts(c, rect(ix - u * 1.6, iy, u * 3.2, u * 3.8), ['#E9E4D8', '#E9E4D8', '#F3C969', '#E9E4D8'][i], false);
      if (i !== 2) fillPts(c, rect(ix - u * 1.6, iy + u * 2.6, u * 3.2, u * 1.2), i === 3 ? '#2B579A' : '#C43E1C', false);
      txt(c, n, ix, iy + u * 5.4, { font: 'ui', size: u * 1.1, color: '#FFFFFF', align: 'center' });
    });
    fillPts(c, rect(x, y + h - u * 3.4, w, u * 3.4), '#E8EAEE', false);
    for (let i = 0; i < 5; i++) fillPts(c, rrect(x + w * .4 + i * u * 4, y + h - u * 2.8, u * 2.2, u * 2.2, u * .4), ['#0067C0', '#5B5FC7', '#F2C744', '#4A154B', '#0078D4'][i], false);
    const win = [x + w * .19, y + h * .08, w * .6, w * .6 * 9 / 16];
    if (d > 0) level(c, win, t, d - 1, on); else fillPts(c, rect(...win), INK.teamsBg, false);
  }
  function spinner(c, x, y, r, t) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.floor(t * 12) / 12 * TAU; c.save(); c.globalAlpha = .25 + .75 * frac(i / 8 + t * 1.5); fillPts(c, ell(x + Math.cos(a) * r, y + Math.sin(a) * r, r * .16, r * .16, 8), '#FFFFFF'); c.restore(); } }
  function level(c, box, t, d, on) {
    if (box[2] < 36) { fillPts(c, rect(...box), INK.teamsBg, false); return; }
    teamsCall(c, box, t, { title: TITLE, timer: timerAt(t), participants: 9, layout: 'share', presenter: 'greg', shadow: false, tiles: shareTiles(t), share: (cc, area, tt) => desktop(cc, area, tt, d, on) });
  }
  function share(ctx, t) {
    look(0); const on = t >= 48.96 - 1 / 24, lt = Math.max(0, t - 49.9), u = lt * 1.05 + lt * lt * .55;
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const S = Math.pow(DR.r, -frac(u)), depth = Math.max(1, Math.ceil(Math.log(30 / (W * S)) / Math.log(DR.r)));
    ctx.save(); ctx.translate(DR.f[0], DR.f[1]); ctx.scale(S, S); ctx.translate(-DR.f[0], -DR.f[1]);
    level(ctx, FULL, t, depth, on);
    ctx.restore();
  }

  // ---------- 51.50 every tile turns to stare at Dan ----------
  const STARE = 51.62;
  function stare(ctx, t) {
    look(0); const tc = twos(t), push = easeInOut(seg(t, 52.16, 52.76));
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const look_ = (i, c, r) => { const at = STARE + hash(i * 3.1) * .22, on = tc >= at, bl = tc >= at - 1 / 12 && tc < at + 1 / 12;
      return { lids: bl ? 1 : 0, lx: on ? (1 - c) : 0, ly: on ? (1 - r) * .9 : 0, turn: on ? (1 - c) * .42 : 0, tilt: on ? (1 - c) * 9 + (r - 1) * (c - 1) * 6 : 0, nod: on ? (1 - r) * .12 : 0, brows: on ? .25 : 0, mouth: on ? 'flat' : undefined }; };
    const who = ['greg', 41, 'linda', 42, DAN, 'bob', 43, 'tasha', 44], tiles = who.map((w, i) => {
      const c = i % 3, r = Math.floor(i / 3), base = { who: w, muted: w !== 'greg', cam: { zoom: 1.4 }, pose: look_(i, c, r) };
      if (w === 'greg') return { ...base, cam: 'forehead', camK: .2, pose: { ...look_(i, c, r), mouth: 'smile' } };
      if (w === DAN) return danTile({ rage: .3 * push, twitch: tc > 52.3 ? twitchAt(t, .5) : 0, sweat: push * .6, lids: 0 }, { speaking: tc >= 52.16, fit: { zoom: 1.4 } });
      if (w === 'bob') return { ...base, frozen: true };
      if (r === 2) return { ...base, camOff: true, initials: w === 'tasha' ? 'TJ' : undefined };
      if (i === 1) return { ...base, reactions: [{ e: '\uD83D\uDC40', at: 52.0 }] };
      if (i === 3) return { ...base, reactions: [{ e: '\uD83D\uDC40', at: 52.2, x: .6 }] };
      return base;
    });
    cam(ctx, 960, lerp(540, 610, push), lerp(1, 1.32, push));
    teamsCall(ctx, FULL, t, { title: TITLE, timer: timerAt(t), participants: 9, shadow: false, tiles });
    ctx.restore();
  }

  // ---------- 52.78 mask slip: BUDDY (4 frames) ----------
  function buddy(ctx, t) {
    look(1); const tc = twos(t), sh = shake(t, 14);
    sunburst(ctx, 960, 560, INK.paper, INK.red, t * .4, 20);
    depth(ctx, 10, c => { cam(c, 960 + sh[0], 540 + sh[1], 1.04, -.04); dotsIn(c, [0, 0, W, H], { spacing: 30, color: INK.redDk, k: (x, y) => clamp(Math.hypot(x - 960, y - 520) / 1000) }); c.restore(); });
    speedLines(ctx, 960, 470, { n: 46, r0: 520, r1: 1400, w: 16, color: INK.ink });
    cam(ctx, 960 - sh[0], 540 - sh[1], 1, .05);
    const F = headFit(960, 400, 560, DAN);
    person(ctx, F.x, F.y, F.s, DAN, { view: 'bust', rage: 1, wild: 1, stage: 1, mouth: 'scream', open: 1, spit: 1, sweat: 1, tilt: -7, nod: -.12, t: tc });
    ctx.restore();
    // the word is lettered here (not by the lyric overlay) so all four frames hit at full strength
    const age = t - wordT(31, 0) + 1 / 24, sc = 1 + .16 * Math.exp(-age * 28);
    ctx.save(); ctx.translate(960 + sh[0] * .5, 880); ctx.rotate(-.035); ctx.scale(sc, sc);
    txt(ctx, 'BUDDY,', 0, 130, { font: 'display', weight: 900, stretch: -2, size: 360, align: 'center', color: INK.yellow, stroke: { w: 16, color: INK.ink }, extrude: { dx: 18, dy: 20, color: INK.ink } });
    ctx.restore();
    misregFrame(ctx, 9, .6);
  }

  // ---------- 52.92 the CONTEXT slide: the answer is on it ----------
  function deck(ctx, t) {
    look(0); const tc = twos(t), u = W / 100;
    fillPts(ctx, rect(0, 0, W, H), '#000000', false);
    pptSlide(ctx, FULL, t, { view: 'show', title: 'CONTEXT', n: 3, bullets: [{ s: 'Greg asks Dan what he would suggest', at: 53.28 }, { s: 'Dan suggests Option B', at: 53.52 }, { s: 'We go with Option B', at: 53.86 }] });
    // Greg's laser pointer circles the answer, then jabs it on "deck"
    const by = 24.5 * u + 6.6 * u, bx = 10.5 * u, tw = measure(ctx, 'Dan suggests Option B', { font: 'ui', size: 3.4 * u }).w;
    const ox = bx + tw * .5, rx = tw * .6, ry = u * 3.4;
    const lp = tt => {
      if (tt < 53.9) return [lerp(1400, ox + rx, easeInOut(seg(tt, 53.3, 53.9))), lerp(820, by, easeInOut(seg(tt, 53.3, 53.9)))];
      if (tt < 54.8) { const a = (tt - 53.9) / .52 * TAU; return [ox + Math.cos(a) * rx, by + Math.sin(a) * ry]; }
      const j = Math.abs(Math.sin((tt - 54.8) * 18)) * Math.exp(-(tt - 54.8) * 3); return [bx + tw * .78, by + u * .8 + j * u * 1.6];
    };
    if (t > 53.3) {
      for (let i = 10; i >= 1; i--) { const p = lp(t - i / 60); ctx.save(); ctx.globalAlpha = (1 - i / 11) * .5; fillPts(ctx, ell(p[0], p[1], 9, 9, 10), '#FF3B30'); ctx.restore(); }
      const p = lp(t); ctx.save(); ctx.globalAlpha = .35; fillPts(ctx, ell(p[0], p[1], 30, 30, 16), '#FF6B5E'); ctx.restore();
      fillPts(ctx, ell(p[0], p[1], 15, 15, 14), '#FF2A1F'); fillPts(ctx, ell(p[0] - 3, p[1] - 3, 5, 5, 8), '#FFE4DE');
    }
    // the Teams frame around the share
    ink(ctx, rrect(40, 34, 560, 58, 8), { fill: 'rgba(20,20,20,.82)', line: 0, smooth: false });
    txt(ctx, 'Greg Hollis (He/Him) is presenting', 66, 72, { font: 'ui', weight: 600, size: 26, color: '#FFFFFF' });
    teamsTile(ctx, [1546, 30, 344, 194], t, { ...gregTile(tc, .3, 31), zoom: 1.1 });
    teamsTile(ctx, [1546, 236, 344, 194], t, { ...danTile({ glare: 1, rage: .3, twitch: t < 53.4 ? twitchAt(t, .9) : 0 }), zoom: 1.1 });
  }

  // ---------- the invite bomb (pre-chorus) ----------
  // bomb-local units: centre (0, 0), about 680 x 700. o: {parts 0..1 (assembly), rem (s left) | up (s elapsed), cut 0..1, beep 0..1}
  const WIRES = [ // [colour, p0, p1, p2, p3]
    [INK.slackBlue, [-110, -168], [-380, -120], [-420, 140], [-300, 222]],
    [INK.slackGreen, [-40, -168], [-250, -20], [-300, 230], [-150, 246]],
    [INK.slackRed, [-60, -322], [-130, -400], [150, -405], [90, -322]],
    [INK.slackYellow, [40, -168], [250, -20], [300, 230], [150, 246]],
    [INK.teams, [110, -168], [390, -140], [440, 140], [300, 222]],
  ];
  const wirePts = w => bezPts(w[1], w[2], w[3], w[4], 24);
  function bomb(ctx, t, x, y, s, o = {}) {
    const k = STYLE.k, m = (a, b) => mix(a, b, k), P = o.parts ?? 1, line = m(INK.oline, INK.ink);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sh = o.shadow || 0; fillPts(ctx, ell(10, 370 + sh, (360 * Math.max(.6, P)) * (1 - sh / 900), 26, 24), rgba(INK.ink, .14));
    if (P > 0) {
      for (let i = 0; i < 5; i++) { const e = backOut(clamp(P * 1.7 - Math.abs(i - 2) * .22), 1.8); if (e <= .01) continue;
        const sx = (i - 2) * 118, hh = 340 * e;
        ink(ctx, rrect(sx - 55, -hh, 110, 2 * hh, 22), { fill: m('#C8695F', INK.red), shade: { color: m('#9E4E47', INK.redDk), spacing: 14, dir: [1, 0], from: 10, to: 55 }, line: 3, seed: 80 + i });
        ink(ctx, ell(sx, -hh + 14, 44, 11, 16), { fill: m('#E8D3B8', INK.paper), line: 2, seed: 90 + i });
        if (i === 2 && e > .9) inkLine(ctx, [[sx, -hh + 10], [sx + 14, -hh - 30], [sx - 6, -hh - 58]], 5, m('#6E6458', INK.ink), { taper: [0, .4] });
      }
      const tp = backOut(clamp(P * 2 - .7), 1.5);
      for (const ty of [-238, 196]) if (tp > .01) ink(ctx, xform([[-330, -34], [330, -30], [326, 34], [-332, 30]], 0, ty, 1, ty < 0 ? -.02 : .015).map(([a, b]) => [a * tp, b]), { fill: m('#A6ABB2', INK.paperDk), shade: { color: m('#8A9098', INK.ink), spacing: 10, dir: [0, 1], from: 0, to: 30 }, line: 2.5, smooth: false, seed: 70 + ty });
    }
    // the invite card is the front plate
    outlookInvite(ctx, -262, -146, 524, t, { title: 'Quick sync \uD83D\uDE42', dur: '15 min', when: 'Wed 10/7/2026 12:15 PM \u2013 12:30 PM', attendees: ['greg', 'dan'], depth: 0 });
    if (P > 0) {
      const e = clamp(P * 2 - 1);
      // wires (cut: the Teams wire snaps in two and recoils)
      WIRES.forEach((w, i) => {
        const pts = wirePts(w), n = Math.max(2, Math.floor(pts.length * e)); if (e <= 0) return;
        const draw = q => { inkLine(ctx, q, 19, line, { taper: [0, 0] }); inkLine(ctx, q, 13, w[0], { taper: [0, 0], keepWeight: true }); };
        if (i === 4 && (o.cut || 0) > 0) { const c = o.cut, a = pts.slice(0, 6), b = pts.slice(7);
          draw(a.map((p, j) => j > 2 ? [p[0] - (j - 2) * 6 * c, p[1] - (j - 2) * 12 * c] : p)); draw(b.map((p, j) => j < 4 ? [p[0] + (4 - j) * 10 * c, p[1] + (4 - j) * 10 * c] : p)); }
        else draw(pts.slice(0, n));
      });
      // the LCD
      const lc = backOut(clamp(P * 2.2 - 1.1), 1.6); if (lc > .01) {
        ctx.save(); ctx.translate(0, -246); ctx.scale(lc, lc);
        ink(ctx, rrect(-200, -82, 400, 164, 14), { fill: m('#34363C', INK.ink), line: 3, smooth: false });
        fillPts(ctx, rrect(-182, -66, 364, 132, 8), m('#1D1F22', '#100C16'), false);
        const beep = o.beep || 0, red = mix(m('#E0605A', INK.red), '#FFFFFF', beep * .6);
        const up = o.up != null, val = up ? hms(o.up) : hms(o.rem ?? 900);
        txt(ctx, up ? 'TIME ELAPSED' : 'TIME REMAINING', 0, -34, { font: 'ui', weight: 800, size: 24, track: 3, align: 'center', color: up ? m('#9EA1F0', INK.teamsLt) : m('#9A9CA3', INK.paperDk) });
        txt(ctx, val, 0, 44, { font: 'mono', weight: 700, size: 74, align: 'center', color: up ? m('#C5CBFA', INK.teamsLt) : red });
        ctx.restore();
      }
    }
    ctx.restore();
  }
  const BOMB_T = 56.08, SNIP = 59.02, UP0 = 59.26;
  const remAt = t => t < BOMB_T ? 900 : Math.max(1, Math.ceil(900 * (1 - easeIn(seg(t, BOMB_T, SNIP - .02)))));
  // office wall + desk top, for the bomb shots
  function wallDesk(ctx, deskY) {
    const k = STYLE.k, m = (a, b) => mix(a, b, k);
    fillPts(ctx, rect(0, 0, W, deskY), m(INK.wall, INK.paper), false);
    if (k > .1) { ctx.save(); clipPts(ctx, rect(0, 0, W, deskY), false); dotsIn(ctx, [0, 0, W, deskY], { spacing: 30, color: rgba(INK.red, .8), k: (x, y) => (k - .1) * 1.6 * clamp(Math.hypot(x - 960, y - deskY * .5) / 1000) }); ctx.restore(); }
    fillPts(ctx, rect(0, deskY, W, H - deskY), m(INK.desk, INK.orangeLt), false);
    fillPts(ctx, rect(0, deskY, W, 10), m(INK.deskDk, INK.orange), false);
  }

  // ---------- 55.24 "let's just jump on": the invite jumps and lands as a bomb ----------
  function jumpOn(ctx, t0) {
    const k = LK(t0); look(k); const t = t0 + VLEAD;
    const FL = 876; wallDesk(ctx, 800);
    const crouch = t < 55.72 ? Math.sin(seg(t, 55.56, 55.72) * Math.PI * .5) : 0, land = t >= BOMB_T ? Math.exp(-(t - BOMB_T) * 9) * Math.cos((t - BOMB_T) * 30) : 0;
    const hop = t >= 55.72 && t < BOMB_T ? Math.sin(seg(t, 55.72, BOMB_T) * Math.PI) * 190 : 0;
    const sy = 1 - crouch * .1 - land * .14 + (hop > 0 ? .06 : 0), sx = 1 + crouch * .08 + land * .1 - (hop > 0 ? .04 : 0);
    const P = easeOut(seg(t, 55.86, BOMB_T));
    ctx.save(); ctx.translate(960, FL); ctx.scale(sx, sy); ctx.translate(-960, -FL);
    bomb(ctx, t, 960, 470 - hop, lerp(1.45, 1.1, easeInOut(seg(t, 55.72, BOMB_T))), { parts: P, rem: remAt(t), shadow: hop });
    ctx.restore();
    if (t >= BOMB_T && t < BOMB_T + .3) { const a = (t - BOMB_T) / .3; for (const sd of [-1, 1]) for (const dy of [0, 34]) inkLine(ctx, [[960 + sd * 380, FL - 10 - dy], [960 + sd * (450 + a * 140), FL - 40 - dy * 1.6 - a * 30]], 7 * (1 - a), mix(INK.oline, INK.ink, k), { taper: [0, .6] }); }
  }

  // ---------- 56.66 "like we're defusing a bomb": Dan, scissors, sweat ----------
  const BOMBK = [960, 826, .95];
  function defuse(ctx, t) {
    const k = LK(t); look(k); const tc = twos(t), r = RG(t), jolt = hit(t, [57.58], 10), push = easeInOut(seg(t, 56.66, 58.52));
    cam(ctx, 960, 540 + push * 16, 1 + push * .07);
    cubicleCam(ctx, [-80, -60, W + 160, 1200], t, clockAt(t));
    const wire = wirePts(WIRES[4])[6], wp = [BOMBK[0] + wire[0] * BOMBK[2], BOMBK[1] + wire[1] * BOMBK[2]];
    const tr = [noise1(t * 40) * 4 * (1 + jolt * 3), noise1(t * 40 + 9) * 3 * (1 + jolt * 3)], piv = [wp[0] + 40 + tr[0], wp[1] - 26 + tr[1]];
    const F = headFit(960, 262, 280, DAN);
    const A = person(ctx, F.x, F.y, F.s, DAN, { view: 'bust', rage: r, wild: .45, sweat: .8 + jolt * .2, glare: 0, eyes: jolt > .3 ? 'wide' : 'open', lx: .6, ly: .95,
      browTilt: .8, brows: .1, mouth: jolt > .3 ? 'o' : 'grit', open: jolt * .5, nod: .12 - jolt * .2, sq: -jolt * .04, tilt: 6,
      reachR: [piv[0] + 64, piv[1] + 4], handR: 'grip', reachL: [668 + tr[0], 560], handL: 'grip', t: tc });
    bomb(ctx, t, ...BOMBK, { rem: remAt(t), beep: jolt });
    scissors(ctx, piv[0], piv[1], 1.15, Math.PI * .97, .85 - .2 * Math.abs(Math.sin(tc * 5)));
    // the big sweat drop leaves his temple on "bomb"
    if (t >= 57.54 && t < 58.2) { const a = t - 57.54, p = [A.head[0] + 120 + a * 160, A.head[1] - 40 + a * a * 1600]; ink(ctx, [[p[0], p[1] - 34], [p[0] + 18, p[1]], [p[0], p[1] + 18], [p[0] - 18, p[1]]], { fill: mix('#DCEEF5', '#BDF2FF', k), line: 3 }); }
    ctx.restore();
  }

  // ---------- 58.52 "just a quick one": snip, and the countdown becomes a meeting timer ----------
  function snip(ctx, t) {
    const k = LK(t); look(k); const tc = twos(t), cut = easeOut(seg(t, SNIP - 1 / 24, SNIP + .12)), flinch = hit(t, [SNIP], 12), up = t >= UP0 - 1 / 24;
    const s = 1.9, bx = 780, by = 900, sh = shake(t, 10 * flinch);
    cam(ctx, 960 + sh[0], 540 + sh[1], 1 + flinch * .03);
    fillPts(ctx, rect(-50, -50, W + 100, H + 100), mix(INK.cube, INK.red, k), false);
    bomb(ctx, t, bx, by, s, { rem: remAt(t), up: up ? Math.floor((t - UP0 + 1 / 24) * 7) : null, cut, beep: up ? 0 : pulse(t, 8) * .6 });
    const wire = wirePts(WIRES[4])[6], wp = [bx + wire[0] * s, by + wire[1] * s];
    const close = cut > 0 ? 0 : .95 - .1 * Math.abs(Math.sin(tc * 6));
    scissors(ctx, wp[0] + 110 - cut * 30, wp[1] - 10 + cut * 10, 2.2, Math.PI * .98, close);
    if (cut > 0 && t < SNIP + .3) sfxSnip(ctx, wp[0] + 260, wp[1] - 170, t - SNIP);
    ctx.restore();
  }
  function sfxSnip(ctx, x, y, age) {
    const k = backOut(clamp((age + 1 / 24) / .1), 3), a = 1 - clamp((age - .18) / .12);
    txt(ctx, 'snip.', x, y, { font: 'ui', weight: 800, size: 84 * k, color: mix(INK.oline, INK.ink, STYLE.k), align: 'center', alpha: a, rot: -.08 });
  }

  // ---------- 59.72 "and the quick one lasted an hour": the clock spins 12 -> 1 ----------
  function hour(ctx, t) {
    const k = LK(t); look(k); const HR = 60.76, land = t >= HR - 1 / 24 ? 1 : 0, e = land || easeIn(seg(t, 59.72, HR));
    const secs = clockSecs(12, 1) + 3600 * e, wob = land ? Math.exp(-(t - HR) * 10) * Math.sin((t - HR) * 40) : 0;
    fillPts(ctx, rect(0, 0, W, H), mix(INK.wall, INK.paper, k), false);
    if (k > .3) dotsIn(ctx, [0, 0, W, H], { spacing: 32, color: rgba(INK.red, .9), k: (x, y) => (k - .3) * 2.4 * clamp(Math.hypot(x - 960, y - 420) / 900) });
    const R = 340, cx = 960, cy = 430;
    // speed smears trail the minute hand
    const v = 3600 * (easeIn(seg(t + .03, 59.72, HR)) - e) / .03;
    wallClock(ctx, cx, cy, R, secs, { k, rot: wob * .05 });
    if (v > 200 && !land) {
      const a = (secs / 60 % 60) / 60 * TAU, span = clamp(v / 9000, .2, 2.2);
      ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = .55;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, R * (.44 + i * .12), a - Math.PI / 2 - span, a - Math.PI / 2 - .08); ctx.lineWidth = R * .03; ctx.lineCap = 'round'; ctx.strokeStyle = mix(INK.oline, INK.ink, k); ctx.stroke(); }
      ctx.restore();
    }
  }

  // ---------- 60.76 "hour long": Dan's own tile, rage .6, the office cracking ----------
  function tile(ctx, t) {
    const k = LK(t); look(k); const tc = twos(t), r = RG(t), sn = snare(t, 10), kk = kick(t, 9), tr = shake(t, 2 + 6 * seg(t, 61.0, 61.85));
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const draw = (c, box) => {
      cubicleCam(c, box, t, clockSecs(13, 1) + (t - 60.76));
      const F = headFit(box[0] + box[2] / 2, box[1] + box[3] * .5, box[3] * (.44 + kk * .01), DAN);
      person(c, F.x + tr[0], F.y + tr[1], F.s, DAN, { view: 'bust', rage: r, wild: .5, glare: .35, mouth: 'polite', brows: -.1, sweat: .8, nod: -kk * .04, t: tc });
    };
    teamsTile(ctx, [20, 20, W - 40, H - 40], t, { who: DAN, name: 'Dan Kowalski (You)', muted: true, zoom: 3.2, draw });
    if (sn > .5) glitch(ctx, t, .3 * sn, 3);
    misregFrame(ctx, 1 + kk * 8 + sn * 6, .5);
  }

  chapter('verse2', 41.15, 61.85, [
    [41.15, noon], [42.21, gregClose(.12, .2, 24, 42.21, 43.3)], [43.30, invite], [44.90, gregClose(.2, .97, 26, 44.9, 46.4)],
    [46.56, blurCam], [48.26, share], [51.50, stare], [52.78, buddy], [52.92, deck],
    [55.24, jumpOn], [56.66, defuse], [58.52, snip], [59.72, hour], [60.76, tile],
  ]);

  const CAP = { mode: 'livecap', x: 200, w: 1300, size: 60, hold: .4 };
  Object.assign(LYRICS, {
    24: { ...CAP }, 25: { ...CAP }, 26: { ...CAP }, 27: { ...CAP, x: 110, w: 1290 }, 28: { ...CAP }, 29: { ...CAP },
    30: { ...CAP, x: 380, w: 1160, y: 1066 },
    31: { ...CAP, after: 52.91 },
    32: { ...CAP, look: .1 }, 33: { ...CAP, look: .25 }, 34: { ...CAP, look: .35 }, 35: { ...CAP, x: 480, w: 1300, look: .5 },
  });
})();
