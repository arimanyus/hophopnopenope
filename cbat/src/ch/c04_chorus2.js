// c04_chorus2.js: chorus 2 (61.85 - 76.80). STAGE, bigger than chorus 1; inks cyan + blue + yellow (+ red for rage).
(() => {
const INKS = 'cool', DOWN = 62.07, TIMER = 47 * 60 + 12;
const TEAMS_T = wordT(38, 4), SLID_T = wordT(39, 1), SLACK_T = wordT(39, 3), SEND_T = wordT(37, 2);
const ABSTRACT_T = wordT(40, 10), BAIL_T = wordT(42, 6), DEPTH_T = wordT(43, 10), GOD_T = wordT(44, 0), TEXT_T = wordT(44, 6);
const lead = t => t + VLEAD;                                   // hit-side time: visuals land one frame early
const ST = { color: INK.paper, align: 'center', stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink }, tilt: .03 };

// ---------- shared bits ----------
// stick stroke from a beat phase: impact (1) on the beat, rebound, fall back
const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
const kitHits = t => ({ kick: kick(t, 9), snare: snare(t, 9), crash: hit(t, [DOWN, beatTime(156), beatTime(164), beatTime(172), TEXT_T], 3), hat: pulse(t, 12, .5) });
const sing = t => singOpen(t, 36, 44);
const misreg = (ctx, px, ang) => { if (px >= 1.5) misregFrame(ctx, px, ang); };
// a riso field inside box (clip first): cool sunburst + halftone vignette
function field(c, [x, y, w, h], t, o = {}) {
  sunburst(c, x + w * (o.cx ?? .5), y + h * (o.cy ?? .45), o.a || INK.blue, o.b || INK.cyan, (o.spin ?? .15) * t, o.n || 18, Math.hypot(w, h));
  dotsIn(c, [x, y, x + w, y + h], { spacing: o.sp || Math.max(20, h * .045), color: INK.ink, k: (px, py) => clamp((Math.hypot((px - x - w / 2) / w, (py - y - h * .45) / h) - .3) * 2.4) });
}
function drummer(c, t, x, y, s, o = {}) {
  const tc = twos(t), b = beatAt(lead(tc)), hb = headbang(tc, 1, .6);
  person(c, x, y, s, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(b + .5), r: stroke(b) }, mouth: 'grin', rage: .6, eyes: 'wide', sweat: .9, nod: hb.nod * .5, tilt: hb.tilt * .4, t: tc, ...o });
}
// The band on the shared STAGE layout (Bob is drawn by stage() through the drummer hook).
function stageBand(ctx, t, o = {}) {
  const tc = twos(t), b = beatAt(lead(tc)), hb = headbang(tc, 1, 1), gp = frac(b / 8);
  person(ctx, ...STAGE.linda, 'linda', { hold: 'guitar', strum: frac(tc * 4.8), fret: .35 + .25 * Math.sin(tc * 3), legs: 'step', stepH: .9, turn: .35, lids: .5, mouth: 'flat', lean: -4 + hb.lean * .3, t: tc });
  person(ctx, ...STAGE.tasha, 'tasha', { hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.35, legs: 'wide', lids: gp > .85 ? .1 : .55, eyes: gp > .85 ? 'wide' : 'open', gum: gp < .85 ? gp * 1.18 : 1 + (gp - .85) * 2.6, nod: hb.nod * .4, t: tc });
  person(ctx, ...STAGE.dan, 'dan', { hold: 'micstand', micAt: STAGE.mic, rage: 1, stage: 1, wild: 1, legs: 'wide', turn: o.turn ?? .25, lean: 12 + hb.lean * .4, tilt: -6 + hb.tilt * .3, nod: hb.nod * .3 - .1, swing: hb.swing, open: .55 + .45 * sing(t), t: tc });
}
// Handheld stage camera: drift, punch-zoom and Dutch kick on snares.
function stageCam(t, cx, cy, z, amt = 1) {
  const sn = snare(t, 9) * amt, d = drift(t, 9 * amt, .45), sh = shake(t, 7 * sn), side = beatN(t) % 4 < 2 ? 1 : -1;
  return [cx + d[0] + sh[0], cy + d[1] + sh[1], z * (1 + .05 * sn), .006 * Math.sin(t * .8) + side * .012 * sn];
}
function onCam(ctx, C, fn) { cam(ctx, ...C); fn(ctx); ctx.restore(); }
// Teams paper plane (the Send glyph), nose along +x
const PLANE = [[-1, -.78], [1.15, 0], [-1, .78], [-.62, 0]];

// ---------- 1. the grid unmutes (61.85) ----------
const GRID_BOX = [0, 0, W, H], DAN_TILE_C = [960, 606];
function bandTileDraw(who) {
  return (c, box, t) => {
    const [x, y, w, h] = box, tc = twos(t), hb = headbang(tc, 1, 1);
    c.save(); clipPts(c, rect(x, y, w, h), false);
    field(c, box, t + hash(who.length) * 3, { a: who === 'dan' ? INK.blue : who === 'bob' ? INK.cyan : INK.paper, b: who === 'dan' ? INK.cyan : who === 'bob' ? INK.yellow : INK.cyan });
    if (who === 'dan') { const F = bustFit(box, 'dan', { zoom: 1.35, dy: .04 }); person(c, F.x, F.y, F.s, 'dan', { view: 'bust', hold: 'mic', rage: 1, stage: 1, wild: 1, open: .6 + .4 * sing(t), nod: hb.nod * .35, tilt: hb.tilt * .7, t: tc }); }
    else if (who === 'linda') person(c, x + w * .5, y + h * 1.6, h * .16, 'linda', { hold: 'guitar', strum: frac(tc * 4.8), fret: .4 + .3 * Math.sin(tc * 4), turn: .3, lids: .5, mouth: 'flat', legs: 'wide', lean: hb.lean * .3, t: tc });
    else if (who === 'tasha') person(c, x + w * .5, y + h * 1.57, h * .16, 'tasha', { hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.3, legs: 'wide', ...hb, lean: hb.lean * .6, t: tc });
    else if (who === 'bob') { const gx = x + w * .5, gy = y + h * 1.02, s = h * .095;
      drumKit(c, gx, gy, s, t, { layer: 'back', hits: kitHits(t), inks: INKS }); drummer(c, t, gx, gy - s * .2, s); drumKit(c, gx, gy, s, t, { layer: 'front', hits: kitHits(t), inks: INKS }); }
    c.restore();
  };
}
function overflowTile(n) {
  return (c, [x, y, w, h]) => {
    fillPts(c, rect(x, y, w, h), '#2E2E2E', false);
    [3, 9, 14].forEach((s, i) => teamsAvatar(c, x + w / 2 - 70 + i * 52, y + h * .4, 34, s, { ring: '#2E2E2E' }));
    txt(c, '+' + n, x + w / 2, y + h * .74, { font: 'ui', weight: 700, size: 40, color: '#FFFFFF', align: 'center', base: 'middle' });
  };
}
function gridTiles(t, on) {
  const tc = twos(t);
  const stageT = who => ({ who, muted: false, speaking: true, look: 1, draw: bandTileDraw(who) });
  return [
    { who: 'greg', speaking: true, cam: 'forehead', camK: .3, pose: { mouth: 'talk', open: .25 + .35 * Math.abs(noise1(tc * 7)) } },
    on ? stageT('linda') : { who: 'linda', muted: true, cam: { dy: .3 } },
    { who: 21, muted: true, pose: { eyes: on ? 'side' : 'open', lx: on ? -.8 : 0, mouth: 'polite' }, reactions: [{ e: '\uD83D\uDC4D', at: 62.55 }] },
    on ? stageT('tasha') : { who: 'tasha', camOff: true, initials: 'TJ', muted: true },
    on ? stageT('dan') : { who: 'dan', muted: true, pose: { rage: .55, glare: .85, mouth: 'polite', twitch: twitchAt(t, .8) } },
    on ? stageT('bob') : { who: 'bob', muted: true, frozen: true },
    { who: 22, muted: true, pose: { eyes: on ? 'wide' : 'open', mouth: on ? 'o' : 'polite', open: .3 } },
    { who: 23, muted: true, camOff: true },
    { who: 'overflow', name: ' ', draw: overflowTile(40) },
  ];
}
function grid(ctx, t) {
  look(0);
  const tf = lead(t), on = tf >= DOWN, age = tf - DOWN;
  fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
  // dead office camera until the downbeat; then it wakes up and finally crashes into Dan's tile
  const dz = expoIn(seg(t, 63.12, 63.6)), C = on ? stageCam(t, lerp(960, DAN_TILE_C[0], dz), lerp(540, DAN_TILE_C[1], dz), lerp(1, 3.25, dz), .5) : [960, 540, 1, 0];
  cam(ctx, ...C);
  const tiles = gridTiles(t, on), boxes = teamsCall(ctx, GRID_BOX, t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: TIMER + (t - 61.85), participants: 48, tiles, chrome: 'full', shadow: false, unread: 9, mic: on });
  // the pop: band tiles burst out of their slots on the downbeat
  if (on && age < .5) {
    const sc = 1 + .2 * Math.exp(-age * 9) * Math.cos(age * 26);
    [1, 3, 4, 5].forEach((i, j) => {
      const [x, y, w, h] = boxes[i], cx = x + w / 2, cy = y + h / 2;
      if (age < .17) { look(1); ink(ctx, burstPts(cx, cy, w * lerp(.62, .5, age / .17), 16, j * 7 + 3 + Math.floor(age * 24), .3), { fill: j % 2 ? INK.yellow : INK.cyan, shade: { color: INK.blue, spacing: 18, dir: [0, 1], from: -h * .2, to: h * .8 }, line: 6, smooth: false }); look(0); }
      ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy); teamsTile(ctx, boxes[i], t, { zoom: 1.5, ...tiles[i] }); ctx.restore();
    });
  }
  ctx.restore();
  if (on) misreg(ctx, 14 * Math.exp(-age * 9) + 4 * snare(t, 10), .3);
}

// ---------- 2. wide stage, bigger (63.60) ----------
// The nearest rows of the crowd, in screen space with a little parallax: fists, horns and phones over the lyric band.
function bigCrowd(c, t, C, n = 20) {
  c.save(); c.translate((960 - C[0]) * 1.4, (540 - C[1]) * 1.4);
  crowd(c, t, [-200, 850, 2320, 200], n, { seed: 41, view: 'back', style: 'silhouette', size: 62, rows: 1, jump: 1, hands: .8, phones: .3, inks: INKS });
  c.restore();
}
// Extra floor lamps at the lip, sweeping up through the band (the bigger show); flat translucent wedges like the truss beams.
function floorBeams(ctx, t) {
  const sn = snare(t, 6);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  [[120, 1], [520, 1], [1400, -1], [1800, -1]].forEach(([x, sd], i) => {
    const a = -Math.PI / 2 + sd * (.25 + .3 * Math.sin(t * 1.1 + i * 1.9)), w = .07, L = 1500, e = .22 + .4 * Math.max(sn * (i % 2 ? 1 : .6), pulse(t, 5, 2) * .5);
    ctx.globalAlpha = e; fillPts(ctx, [[x - 18, 1000], [x + 18, 1000], [x + Math.cos(a + w) * L, 1000 + Math.sin(a + w) * L], [x + Math.cos(a - w) * L, 1000 + Math.sin(a - w) * L]], i % 2 ? INK.cyan : INK.yellow, false); });
  ctx.restore();
}
// "send": a Teams paper plane leaves Dan's mic and flies straight at the lens
function plane(ctx, t, C) {
  const a = lead(t) - SEND_T; if (a < 0 || a > .5) return;
  const k = Math.pow(a / .5, 1.6), src = [960 + (STAGE.mic[0] - C[0]) * C[2], 540 + (STAGE.mic[1] - C[1]) * C[2]];
  const x = lerp(src[0] + 40, 1560, k), y = lerp(src[1] - 10, 260, k), s = lerp(70, 760, k * k), ang = -.32 + k * .2;
  look(1); if (k > .1) { ctx.save(); ctx.globalAlpha = .9; speedLines(ctx, x, y, { n: 40, r0: s * 1.1, r1: 2400, w: 10, color: INK.ink }); ctx.restore(); }
  const P = xform(PLANE, x, y, s, ang); fillPts(ctx, P.map(([px, py]) => [px + s * .05, py + s * .07]), INK.ink, false);
  ink(ctx, P, { fill: INK.yellow, shade: { color: INK.cyan, spacing: Math.max(10, s * .06), dir: [0, 1], from: -s * .2, to: s }, line: 4 + s * .012, smooth: false });
  inkLine(ctx, [xform([[-.62, 0]], x, y, s, ang)[0], xform([[1.15, 0]], x, y, s, ang)[0]], 3 + s * .01, INK.ink, { taper: [0, .3] });
}
function wide(ctx, t, lt, dur) {
  look(1);
  // slow push, then a crash onto Dan's face on "sec"
  const cz = easeOut(seg(lead(t), wordT(37, 8) - .02, wordT(37, 8) + .16)), C = stageCam(t, 960, lerp(562, 530, cz), lerp(1.0, 1.04, smooth(lt / dur)) * lerp(1, 2.7, cz));
  const so = { inks: INKS, hits: kitHits(t), drummer: (c, tt) => drummer(c, tt, ...STAGE.bob), strobe: 1, lights: 1, smoke: .12, crowd: 170, jump: 1, headbang: .7 };
  depth(ctx, 4, c => onCam(c, C, c => stage(c, t, so)));
  onCam(ctx, C, c => { floorBeams(c, t); stageBand(c, t); });
  depth(ctx, 9, c => { onCam(c, C, c => stage(c, t, { ...so, fg: true })); bigCrowd(c, t, C); });
  plane(ctx, t, C);
  misreg(ctx, 3 * snare(t, 10), .5);
}

// ---------- 3. the logos drop in as stage banners (65.10) ----------
function banner(ctx, t, cx, top, w, h, rot, logo) {
  ctx.save(); ctx.translate(cx, top); ctx.rotate(rot);
  for (const sd of [-1, 1]) inkLine(ctx, [[sd * w * .42, -1400], [sd * w * .42, 8]], 5, INK.ink, { taper: [0, 0], smooth: false });
  const B = rect(-w / 2, 0, w, h);
  fillPts(ctx, B.map(([x, y]) => [x + 16, y + 20]), INK.ink, false);
  ink(ctx, B, { fill: INK.paper, shade: { color: rgba(INK.blue, .55), spacing: 22, dir: [0, 1], from: h * .3, to: h * 1.1 }, line: 7, smooth: false, seed: 3 });
  fillPts(ctx, rect(-w / 2, 0, w, 30), INK.ink, false);
  for (const sd of [-1, 1]) { ink(ctx, ell(sd * w * .42, 15, 9, 9, 10), { fill: INK.paperDk, line: 3 }); }
  ctx.save(); clipPts(ctx, B, false); dotsIn(ctx, [-w / 2, 0, w / 2, h], { spacing: 26, color: INK.cyan, k: (x, y) => clamp(1 - Math.hypot(x, y - h * .5) / (w * .42)) * .9 }); ctx.restore();
  logo(ctx, 0, h * .5, w * .74);
  ctx.restore();
}
function banners(ctx, t, lt) {
  look(1);
  const tf = lead(t), ta = tf - TEAMS_T, sa = tf - SLACK_T, impact = hit(t, [TEAMS_T], 7) + hit(t, [SLACK_T], 9) * .6;
  const C = stageCam(t, 960, 470, 1.02); C[0] += shake(t, 16 * impact)[0]; C[1] += shake(t, 16 * impact)[1] - 30 * impact;
  const so = { inks: INKS, hits: kitHits(t), drummer: (c, tt) => drummer(c, tt, ...STAGE.bob), strobe: 1, lights: 1, smoke: .15, crowd: 150, jump: 1 };
  depth(ctx, 4, c => onCam(c, C, c => stage(c, t, so)));
  onCam(ctx, C, c => {
    // Teams: DROPPED from the flies, lands on "Teams", bounces and swings
    if (ta > -.32) { const fall = ta < 0 ? -1150 * (1 - easeIn(seg(ta, -.32, 0))) : 70 * Math.exp(-ta * 7) * Math.sin(ta * 24);
      banner(c, t, 545, 170 + fall, 560, 560, ta < 0 ? 0 : .1 * Math.exp(-ta * 2.2) * Math.sin(ta * 6.5 + .3), (c, x, y, s) => teamsLogo(c, x, y, s)); }
    // Slack: SLID in along the truss on "slid", stops on "Slack" and swings out its momentum
    const sl = tf - SLID_T; if (sl > -.05) { const x = sa < 0 ? lerp(2500, 1375, easeOut(seg(tf, SLID_T - .05, SLACK_T))) : 1375, rot = sa < 0 ? .05 : -.2 * Math.exp(-sa * 2.6) * Math.cos(sa * 7.5);
      banner(c, t, x, 170, 560, 560, rot, (c, x, y, s) => slackLogo(c, x, y, s)); }
    stageBand(c, t, { turn: 0 });
  });
  depth(ctx, 9, c => { onCam(c, C, c => stage(c, t, { ...so, fg: true })); bigCrowd(c, t, C); });
  if (ta >= 0 && ta < .12) flash(ctx, INK.white, .55 * (1 - ta / .12));
  misreg(ctx, 8 * impact + 3 * snare(t, 10), .4);
}

// ---------- 4. nodding on mute = headbanging on stage (66.86) ----------
const SHAPES = [
  (c, x, y, s, col) => ink(c, ell(x, y, s * .5, s * .5, 20), { fill: col, line: 4 }),
  (c, x, y, s, col, r) => ink(c, xform([[0, -.6], [.55, .4], [-.55, .4]], x, y, s, r), { fill: col, line: 4, smooth: false }),
  (c, x, y, s, col, r) => ink(c, xform(rect(-.42, -.42, .84, .84), x, y, s, r), { fill: col, line: 4, smooth: false }),
  (c, x, y, s, col, r) => inkLine(c, xform([[-.6, 0], [-.3, -.35], [0, 0], [.3, .35], [.6, 0]], x, y, s, r), s * .16, col, { taper: [.1, .1] }),
  (c, x, y, s, col, r) => ink(c, xform([[-.5, 0], ...ell(0, 0, .5, .5, 12).slice(6), [.5, 0]], x, y, s, r), { fill: col, line: 4, smooth: false }),
  (c, x, y, s, col, r) => inkLine(c, xform([[-.55, .3], [-.2, -.3], [.15, .3], [.5, -.3]], x, y, s, r), s * .14, col, { taper: [0, 0], smooth: false }),
];
const SPLIT_ZOOM = 1.12, SPLIT_DY = -.05;
const SHAPE_COL = [INK.yellow, INK.cyan, INK.red, INK.blue, INK.pink, INK.yellow];
function split(ctx, t, lt, dur) {
  look(0); const tc = twos(t), hbO = headbang(tc, 1, .6), hbS = headbang(tc, 1, 1.5), tf = lead(t);
  fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
  const burstK = seg(tf, ABSTRACT_T, ABSTRACT_T + .55), shk = hit(t, [ABSTRACT_T], 5);
  const push = lerp(1, 1.06, smooth(lt / dur)), C = burstK > 0 ? [960 + shake(t, 14 * shk)[0], 540 + shake(t, 14 * shk)[1], push * (1 + .04 * shk), 0] : [960, 540, push, 0];
  cam(ctx, ...C);
  const office = { who: 'dan', muted: true, cam: { zoom: SPLIT_ZOOM, dy: SPLIT_DY }, pose: { nod: hbO.nod * .6, tilt: hbO.tilt * .15, glare: .9, eyes: 'dead', mouth: 'polite', hunch: .3, lids: blink(tc, 7) } };
  const stageD = { who: 'dan', name: 'Dan Kowalski (unmuted)', muted: false, speaking: true, look: 1, draw: (c, box, t) => {
    const [x, y, w, h] = box; c.save(); clipPts(c, rect(x, y, w, h), false); field(c, box, t, { cy: .4 });
    const F = bustFit(box, 'dan', { zoom: SPLIT_ZOOM, dy: SPLIT_DY }), sn = snare(t, 7);
    const A = person(c, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, stage: 1, wild: 1, ...hbS, nod: hbS.nod * .9, open: .55 + .45 * sing(t), sweat: 1, armL: { a: 150, e: 20 }, handL: 'horns', t: tc });
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (hash(i * 3.1) - .5) * 2.6, d = (1 - sn) * 380 + 60, r = 6 + hash(i) * 9; if (sn > .15) ink(c, ell(A.head[0] + Math.cos(a) * d, A.head[1] + Math.sin(a) * d * .8, r, r * 1.3, 10), { fill: INK.white, line: 3 }); }
    c.restore(); } };
  const tb = teamsCall(ctx, GRID_BOX, t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: TIMER + (t - 61.85), participants: 48, tiles: [office, stageD], shadow: false, unread: 14 });
  // the stage's halftone leaks across the tile border into the office, a little more on every snare
  const [ox, oy, ow, oh] = tb[0], reach = .08 + .3 * seg(t, 66.86, ABSTRACT_T) + .1 * snare(t, 6);
  ctx.save(); clipPts(ctx, rect(ox, oy, ow, oh), false);
  dotsIn(ctx, [ox + ow * .5, oy, ox + ow, oy + oh], { spacing: 24, color: INK.cyan, k: (x, y) => clamp((reach - (ox + ow - x) / ow + .05 * noise2(x * .01, y * .01 + t)) * 2.6) * .7 });
  ctx.restore();
  // Greg's floating tile, captioned in pure abstraction
  const G = [700, 128, 520, 292];
  fillPts(ctx, rect(G[0] - 8, G[1] - 8, G[2] + 16, G[3] + 16), INK.teamsBg, false);
  teamsTile(ctx, G, t, { who: 'greg', speaking: true, zoom: 1.3, pose: { mouth: 'talk', open: .25 + .4 * Math.abs(noise1(tc * 7)), armR: { a: 60 + 20 * Math.sin(tc * 5), e: -80 }, handR: 'point', twirl: 1 } });
  const bar = teamsCaption(ctx, G[0] + 12, G[1] + G[3] + 82, G[2] - 24, { speaker: 'greg', name: 'Greg Hollis (He/Him)', words: [{ s: ' ', shown: true }], size: 34, lines: 1, bottom: true });
  const n = clamp(Math.floor((t - 66.9) * 4.5), 0, 8);
  look(1);
  for (let i = 0; i < n; i++) if (burstK <= 0 || i > 8 * burstK) SHAPES[i % 6](ctx, bar[0] + 100 + i * 46, bar[1] + bar[3] * .64, 32, SHAPE_COL[i % 6], hash(i) * 2);
  // "abstracts": the jargon bursts out of his tile as riso shapes
  if (burstK > 0) {
    for (let i = 0; i < 46; i++) {
      const a = hash(i * 1.7) * TAU, sp = 600 + hash(i * 2.3) * 1500, e = easeOut(burstK), x = 960 + Math.cos(a) * sp * e, y = 274 + Math.sin(a) * sp * e * .7;
      const s = (60 + hash(i * 5.1) * 170) * (.3 + .7 * backOut(clamp(burstK * 3), 2)), r = hash(i * 9) * 6 + twos(t) * (hash(i) - .5) * 6;
      SHAPES[i % 6](ctx, x, y, s, SHAPE_COL[(i + 2) % 6], r);
    }
  }
  look(0); ctx.restore();
  misreg(ctx, 8 * shk, .5);
}

// ---------- 5a. one clean paragraph (70.16) ----------
const PARA_LINES = ['Hi Greg, the numbers are in the sheet. Launch is Friday. Nothing', 'here needs a decision from you. That was the whole meeting.', 'Thanks, Dan'];
const PARAGRAPH = PARA_LINES.join(' ');
function email(ctx, t, lt) {
  look(1);
  field(ctx, [0, 0, W, H], t, { cy: .55, spin: .05, a: INK.paper, b: INK.cyan, n: 22 });
  // the whole window, then a push onto the paragraph as it completes
  const pk = easeInOut(seg(t, wordT(42, 2) - .1, 71.84)), C = stageCam(t, lerp(960, 930, pk), lerp(540, 600, pk), lerp(1, 1.18, pk), .5);
  cam(ctx, ...C);
  ctx.save(); ctx.translate(960, 640); ctx.rotate(-.02 + .008 * snare(t, 8)); ctx.translate(-960, -640);
  emailCompose(ctx, [150, -250, 1620, 1500], t, { zoom: 3.2, to: ['greg'], subject: 'Re: Quick sync \uD83D\uDE42  (47 min)', body: PARAGRAPH, t0: 70.28, cps: 135 });
  // "one clean paragraph": a riso highlighter swipes it, line by line, on the words
  ctx.translate(150, -250); ctx.scale(3.2, 3.2); ctx.globalCompositeOperation = 'multiply';
  PARA_LINES.forEach((s, i) => { const k = easeOut(seg(lead(t), wordT(42, 0) + i * .14, wordT(42, 0) + i * .14 + .16)); if (k <= 0) return;
    const w = measure(ctx, s, { font: 'ui', size: 15, weight: 400 }).w + 8; fillPts(ctx, [[20, 254 + i * 24 - 14], [20 + w * k, 254 + i * 24 - 15], [20 + w * k, 254 + i * 24 + 6], [20, 254 + i * 24 + 5]], INK.yellow, false); });
  ctx.restore(); ctx.restore();
}

// ---------- 5b. nobody has to bail (71.84) ----------
function eject(ctx, t, lt) {
  look(1); const tc = twos(t), tf = lead(t), fly = tf - BAIL_T;
  fillPts(ctx, rect(0, 0, W, H), INK.ink, false);
  const C = stageCam(t, 1080, 500, 1.12, .5); if (fly > 0) { const s = shake(t, 22 * Math.exp(-fly * 5)); C[0] += s[0]; C[1] += s[1]; }
  cam(ctx, ...C);
  const danT = { who: 'dan', name: 'Dan Kowalski', muted: true, draw: (c, [x, y, w, h], t) => {
    fillPts(c, rect(x, y, w, h), INK.paperDk, false); dotsIn(c, [x, y, x + w, y + h], { spacing: 22, color: rgba(INK.blue, .5), dir: [0, 1], from: 0, to: h });
    if (fly > 0) { c.save(); c.globalAlpha = clamp(1 - fly * 1.2); for (let i = 0; i < 9; i++) { const r = 70 + hash(i) * 90 + fly * 300; fillPts(c, blob(x + w * (.25 + hash(i * 3) * .5), y + h * (.75 - hash(i * 5) * .4) - fly * 200, r, i * 3 + Math.floor(tc * 12), .2, 14), i % 2 ? INK.white : INK.paper); } c.restore();
      txt(c, 'Dan Kowalski left the meeting', x + w / 2, y + h * .42, { font: 'ui', weight: 700, size: 40, color: INK.ink, align: 'center' }); }
  } };
  const boxes = teamsCall(ctx, GRID_BOX, t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: TIMER + (t - 61.85), participants: fly > 0 ? 47 : 48, tiles: [{ who: 'greg', speaking: true, cam: 'forehead', camK: .45, pose: { mouth: 'talk', open: .25 + .4 * Math.abs(noise1(tc * 7)) } }, danT], leave: BAIL_T, shadow: false });
  // Dan in his office chair; on "bail" the seat fires and he leaves through the roof of the window
  const [x, y, w, h] = boxes[1], gx = x + w * .5, gy = y + h + 40, up = fly > 0 ? fly * 2400 + fly * fly * 7000 : 0, sq = fly > 0 ? -.3 * Math.exp(-fly * 6) : .08 * Math.sin(clamp(-fly / .2) * Math.PI);
  ctx.save(); if (fly <= 0) clipPts(ctx, rect(x, y, w, h), false);
  if (fly > 0) { for (let i = 0; i < 3; i++) ink(ctx, burstPts(gx + (i - 1) * 60, gy - up + 40, 120 + i * 30, 12, i * 5 + Math.floor(tc * 12), .45), { fill: i === 1 ? INK.yellow : INK.red, line: 5, smooth: false });
    streaks(ctx, [gx - 220, gy - up, gx + 220, gy - up + 900], { dir: [0, -1], n: 22, len: 500, w: 8, color: INK.white }); }
  ctx.translate(gx, gy - up); ctx.scale(1 - sq * .5, 1 + sq); ctx.translate(-gx, -gy);
  officeChair(ctx, gx, gy, 1.05, {});
  const eyeing = fly <= 0 && tf > 72.2;
  person(ctx, gx, gy - 4, 66, 'dan', { sit: 1, stage: fly > 0 ? 1 : 0, rage: fly > 0 ? 0 : .6, wild: fly > 0 ? 1 : .3, mouth: fly > 0 ? 'grin' : eyeing ? 'smirk' : 'polite', eyes: fly > 0 ? 'happy' : eyeing ? 'side' : 'open', lx: eyeing ? .9 : 0, ly: eyeing ? -.8 : 0, glare: fly > 0 || eyeing ? 0 : .8,
    armL: fly > 0 ? { a: 165, e: 10 } : { a: 20, e: -60 }, armR: fly > 0 ? { a: 165, e: 10 } : { a: 20, e: -60 }, handL: fly > 0 ? 'horns' : 'relax', handR: fly > 0 ? 'fist' : 'relax', t: tc });
  ctx.restore();
  // the pointer goes for Leave and hits it on "bail"
  const L = boxes.leave, pk = easeInOut(seg(tf, 71.95, BAIL_T - .04)), px = lerp(1250, L[0] + L[2] * .4, pk), py = lerp(760, L[1] + L[3] * .6, pk);
  pointer(ctx, px, py, 60, { click: clamp((tf - BAIL_T) / .3) });
  ctx.restore();
  misreg(ctx, 14 * hit(t, [BAIL_T], 6), .3);
}

// ---------- 6. the rage-1 scream close-up (72.94) ----------
function scream(ctx, t, lt) {
  look(1); const tc = twos(t), sn = snare(t, 8), tf = lead(t), dz = expoIn(seg(tf, DEPTH_T - .04, GOD_T - .16));
  sunburst(ctx, 960, 460, INK.blue, INK.cyan, t * .35, 24, 2400);
  dotsIn(ctx, [0, 0, W, H], { spacing: 38, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - 960) / 960, (y - 470) / 600) - .5) * 1.8) });
  if (sn > .2) { ctx.save(); ctx.globalAlpha = sn; speedLines(ctx, 960, 560, { n: 70, r0: 520, r1: 1500, w: 14, color: INK.ink }); ctx.restore(); }
  // crash zoom about the open mouth (it stays put on screen while it swallows the frame)
  const F = headFit(960, 400, 620, 'dan'), M = [955, 740], side = beatN(t) % 4 < 2 ? 1 : -1, sh = shake(t, (10 + 14 * sn) * (1 - dz)), Z = (1 + .07 * sn) * (1 + 11 * dz);
  cam(ctx, M[0] + (960 - M[0]) / Z + sh[0], M[1] + (540 - M[1]) / Z + sh[1], Z, (side * .025 * sn + Math.sin(t * 1.3) * .015) * (1 - dz));
  const A = person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, stage: 1, wild: 1, open: .75 + .25 * sing(t), tilt: -5 + noise1(tc * 3) * 4, nod: -.12, sweat: 1, t: tc });  // sweat flung off on every snare
  const age = t + VLEAD - (lastOf(t, SNARES) ?? -9);
  if (age < .4) for (let i = 0; i < 16; i++) { const a = (hash(i * 4.7 + Math.floor(t)) - .5) * 3.6 - Math.PI / 2, d = 300 + age * 2600 * (.6 + hash(i) * .6), r = 10 + hash(i * 2) * 16;
    const p = [A.head[0] + Math.cos(a) * d, A.head[1] + Math.sin(a) * d * .8 + age * age * 900]; ink(ctx, ell(p[0], p[1], r, r * 1.35, 12, a), { fill: INK.white, shade: { color: INK.cyan, spacing: 8 }, line: 4 }); }
  ctx.restore();
  misregFrame(ctx, 4 + 8 * sn, .2);
}

// ---------- 7. THE UNISON JUMP (GOD - .16), staged exactly like chorus 1's (c02), cool inks ----------
// crouch from GOD - .16, take off on GOD, hang (flattened arc), land on TEXT with a squash and a flash
const CROUCH_T = GOD_T - .16;
function jumpState(t) {
  const k = (t - GOD_T) / (TEXT_T - GOD_T);
  if (t < GOD_T) { const c = seg(t, CROUCH_T, GOD_T); return { hop: 0, sq: .42 * Math.sin(c * Math.PI * .5) * (c < 1 ? 1 : 0), air: 0, vy: 0, c }; }
  if (k < 1) { const f = 1 - Math.pow(Math.abs(2 * k - 1), 2.6); return { hop: 3.6 * f, sq: k < .12 ? -.3 * (1 - k / .12) : k > .9 ? -.18 * (k - .9) / .1 : 0, air: 1, vy: 1 - 2 * k, c: 1 }; }
  const a = t - TEXT_T; return { hop: 0, sq: .5 * Math.exp(-a * 9) * Math.cos(a * 22), air: 0, vy: 0, c: 1, land: a };
}
function jump(ctx, t) {
  const tc = twos(t), tj = lead(t), J = jumpState(tj), up = J.air ? smooth(clamp((tj - GOD_T) / .2)) : 0;
  const crouchArms = J.air ? 0 : J.c > 0 && J.land == null ? J.c : 0;
  look(1);
  if (t < GOD_T - LEAD) FRAME.lyrics = false;
  fillPts(ctx, rect(0, 0, W, H), INK.paper, false);
  sunburst(ctx, 960, 560, INK.paper, INK.cyan, 0, 20, 2400);
  dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.blue, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 560) / 640) - .45) * 1.8) });
  const scream = J.air ? 1 : .55 + .45 * singOpen(tc, 44, 44), land = J.land != null ? Math.exp(-J.land * 8) : 0;
  const common = { hop: J.hop, sq: J.sq, vy: J.vy, swing: J.vy * 40, ...(J.air && J.hop > .3 ? { legs: 'jump' } : {}), noShadow: true, t: tc };
  for (const [x, r] of [[420, 120], [790, 110], [1130, 110], [1500, 140]]) fillPts(ctx, ell(x, 962, r * (1 - J.hop * .07), 18 * (1 - J.hop * .07), 24), rgba(INK.ink, .85));
  const arm = (a0, e0, e1) => ({ a: lerp(lerp(a0, -25, crouchArms), 168, up), e: lerp(e0, e1, up) });
  person(ctx, 420, 960, 50, 'linda', { ...common, rage: .3, mouth: 'flat', open: 0, lids: .5, hold: 'guitar', strum: J.air ? 0 : frac(tc * 4), fret: .4, turn: .3 });
  person(ctx, 790, 960, 50, 'dan', { ...common, rage: 1, stage: 1, wild: 1, mouth: 'scream', open: scream, hold: 'mic', armL: arm(20, -20, 15), handL: J.air ? 'horns' : 'fist', turn: .15 });
  person(ctx, 1130, 960, 50, 'tasha', { ...common, rage: .8, mouth: 'scream', open: scream, hold: 'bass', strum: J.air ? 0 : frac(tc * 2), fret: .5, turn: -.25 });
  person(ctx, 1500, 960, 50, 'bob', { ...common, rage: .8, mouth: 'scream', open: scream, sweat: 1, hold: 'sticks', hits: { l: 0, r: 0 }, armL: arm(30, -30, 20), armR: arm(30, -30, 20), turn: -.2 });
  const la = J.land ?? -1; if (la >= 0 && la < .1) flash(ctx, INK.white, .7 * (1 - la / .1));
  if (land > .05) misregFrame(ctx, 10 * land, 0);
}

chapter('chorus2', 61.85, 76.80, [[61.85, grid], [63.60, wide], [65.10, banners], [66.86, split], [70.16, email], [71.84, eject], [72.94, scream], [CROUCH_T, jump]]);

Object.assign(LYRICS, {
  44: { mode: 'hero', ...ST, box: [200, 34, 1520, 236], rows: [3, 4], emph: [0, 6], hot: INK.red, tilt: 0, out: 'cut', end: TEXT_T + .39 },   // same as L20 in c02
  36: { mode: 'hero', ...ST, box: [100, 860, 1720, 180], rows: [6], emph: [5], hot: INK.yellow, tilt: 0 },
  37: { mode: 'hero', ...ST, box: [160, 835, 1600, 215], rows: [3, 6], emph: [2], hot: INK.yellow },
  38: { mode: 'hero', ...ST, box: [120, 870, 1680, 170], rows: [5], emph: [4], hot: INK.yellow },
  39: { mode: 'hero', ...ST, box: [120, 870, 1680, 170], rows: [4], emph: [3], hot: INK.yellow },
  41: { mode: 'hero', ...ST, box: [140, 800, 1640, 200], rows: [6], emph: [5], hot: INK.yellow },
  42: { mode: 'hero', ...ST, box: [140, 790, 1640, 260], rows: [3, 4], emph: [6], hot: INK.red },
  43: { mode: 'hero', ...ST, box: [160, 850, 1600, 200], rows: [5, 6], emph: [10], hot: INK.yellow },
});
})();
