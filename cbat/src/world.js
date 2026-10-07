// world.js: the sets. Each paints in world px of a 1920x1080 layout (cam(ctx, 960, 540, 1) shows all of it; push in 2-3x
// freely, everything is vector). Pure functions of t and options; no state. Every set takes k (0 office pastel .. 1 stage
// riso, default STYLE.k), runs under look(k) internally and restores ctx state and STYLE. Sets with people in them have
// layers: layer 'back' (default) | 'front' (fg: true is the same as layer 'front'; 'all' draws both). Draw: set back,
// your characters, set front. Screen callbacks are fn(ctx, [x, y, w, h], t), clipped to the screen, state restored after.
// inks (stage colour pairs): a preset name 'hot' (red/pink/yellow), 'cool' (blue/cyan/yellow), 'pink' (pink/red/yellow),
// 'orange' (orange/red/yellow), 'fire' (red/yellow/orange), 'red' (red only), 'all' (red/pink/yellow/cyan/Teams purple),
// or an array [main, second, accent]. STAGE_INKS holds the presets; stageInks(x) -> {a, b, c, adk, bdk}.
//
// officeDesk(ctx, t, {k, inks = 'fire', clock: secs (default 8:57 + t), screen: fn | false (off) | default mini Teams,
//   laptop: fn | false, mug, headset, chair, plant (false hides each), flicker 0..1 (troffer 3), strobe 0..1 (default
//   rises from k .6), layer | fg})  Dan's cubicle, front-on; front layer = troffer strobe light washing over Dan (k > .6).
//   DESK: vp [960, 560]; dan [700, 1050, 60] (ground point + s; he sits, sit: 1, turn ~ .45 toward the monitor);
//   chair [700, 1050] (seat top y 798); monitor [930, 398, 440, 248] (screen rect); webcam [1150, 382] (clip-on lens);
//   laptop [1452, 532, 216, 134] (screen) + laptopCam [1560, 524]; keyboard [990, 698, 272, 24]; mouse [1296, 712];
//   mug [1772, 726] (base centre, "PER MY LAST EMAIL"); plant [432, 712] (pot base); papers [205, 688] (in-tray top: emit
//   flying paper here); clock [960, 244, 80]; memo [370, 392, 178, 226]; partition [300, 335, 1620, 640] (x0, top, x1,
//   desk line); deskY 640 / deskFront 732; wall [0, 150, 1920, 335]; ceilY 150; fluoro: three troffer quads.
// openPlan(ctx, t, {k, inks, clock, rows (1..11), people 0..1 (false = empty), stare 0..1 (coworkers turn to camera),
//   flicker, strobe})  Rows of cubicles down a central aisle, one-point perspective from 2.5 m up; every monitor is in the
//   same Teams call. OPEN: vp [960, 380], f 900, eye 2.5 m, P(X, Y, z) -> [x, y] (metres, z depth), at(z, X = 0) ->
//   [x, y, s] for someone in the aisle (aisle X -1..1); walk [[960, 1042, 46.3], [960, 462, 5.7]] (near / far end);
//   clock [960, 324, 60] (hanging over the aisle); desks: 60 x {x, y, r (head px), X, z, row, col, side, id, empty}.
// gregOffice(ctx, t, {k, inks, screen: fn (wall TV), laptop: fn (back of his lid), ring 0..1, layer | fg})  Seen through
//   his glass front wall: SYNERGY poster | city window | wall TV, ring light, standing desk, fiddle-leaf fig. Front layer =
//   standing desk, laptop, tumbler, ring light, glass mullions, frosted dot band, his name, reflections.
//   GREGOFF: greg [960, 823.5, 38.7] (stands behind the desk); laptop [915.7, 529.1, 88.6, 64]; webcam [960, 529.1];
//   ring [741.8, 423.8, 61.6]; screen [1287.6, 397.9, 229.3, 129.4]; poster [427.7, 355.3, 196.6, 212.9];
//   window [681.6, 281.6, 556.9, 425.9]; tumbler [1086.7, 596.7]; vp [960, 470]; P(X, Y, z).
// confRoom(ctx, t, {k, inks = 'all', screen: fn, chairs (false = none), lights 0..1 (Teams-purple beams from the screen +
//   troffer strobe; default rises from k .7), strobe, flicker, clock, layer | fg})  From the head of the table. Back =
//   room, wall screen, chairs; seat people next; front = table, speakerphone, donut box, laptop, cups (people standing on
//   the table go after it). CONF: table [[560, 750], [1360, 750], [1085, 509.4], [835, 509.4]] (top quad near L, near R,
//   far R, far L; top .75 m); screen [751.7, 234.7, 416.7, 234.7]; seats (draw order, far to near; [x, y, s, turn]):
//   [742.6, 652.2, 30.4, .7], [1177.4, 652.2, 30.4, -.7], [696.8, 705.3, 36.8, .7], [1223.2, 705.3, 36.8, -.7],
//   [626.7, 786.7, 46.7, .7], [1293.3, 786.7, 46.7, -.7], [505.5, 927.3, 63.6, .7], [1414.5, 927.3, 63.6, -.7];
//   band (standing on the table): dan [960, 633.3, 58.3], linda [840, 575, 43.8], tasha [1080, 575, 43.8],
//   bob [960, 526.1, 31.5] (sits), kit [960, 532.1, 33]; phone [960, 562.8] (speakerphone); presenter [641.8, 619.7, 26.5];
//   clock [1279.4, 288.9, 30.6]; at(X, Y, z) -> [x, y, s]; P(X, Y, z).
// stage(ctx, t, {inks = 'hot', k, lights 0..1, strobe 0..1 (beat chase on the tubes and beams), smoke 0..1, crowd (false |
//   n = 90), backdrop: fn (projector screen), banner, ring 0..1 (ring light), kit: true | 'back' | false, hits, drummer:
//   (ctx, t) => draws Bob between the kit layers (t is also passed third), spin, rays, jump, headbang, seed, layer | fg})  The band's club built from
//   office junk. Back = sunburst wall, beat shockwave, OUT OF OFFICE banner, truss tubes, projector screen, halftone beams,
//   carpet-tile floor, gaffer tape, cords, AGENDA setlist, copier + printer amps, carpet riser, kit, ring light, wedges.
//   Front = floor smoke, the stage lip, the moshing crowd (silhouettes from behind). Without drummer, kit: true draws the
//   whole kit; to draw Bob yourself pass kit: 'back', then person(Bob), then drumKit(..., {layer: 'front'}).
//   STAGE: dan [960, 905, 42] (front centre) + mic [960, 566] (micAt for 'micstand'); linda [470, 880, 40];
//   tasha [1450, 880, 40]; bob [960, 438, 30] (sit: 1 on the riser); kit [960, 444, 30]; backdrop [560, 160, 800, 450];
//   banner [430, 22, 1060, 104]; ring [960, 552, 94]; riser [690, 444, 540, 196]; copier [80, 296, 330, 336];
//   printers [1510, 296, 330, 336]; wedges [[520, 902], [770, 914], [1150, 914], [1400, 902]]; backY 610 / lipY 930
//   (floor back edge / front edge); vp [960, 330]; crowdY 900 (top of the crowd's heads; crowd box [0, 860, 1920, 220]).
// drumKit(ctx, x, y, s, t, {layer: 'back' | 'front' | 'all', hits: {kick, snare, tom, crash, ride, hat} 0..1 envelopes
//   (e.g. hit(t, times) or pulse(t)), k, inks})  (x, y) = floor under the kick, s = Bob's px per unit. Back = floor tom,
//   ride, hi-hat, crash + stands; front = kick (OUT OF OFFICE head, flexes on kick), rack tom, snare. Cymbals wobble on hits.
// bedroom(ctx, t, {k, inks = 'pink', glow 0..1, candles 0..1, laptop: fn, petals, layer | fg})  Night, from the foot of
//   the bed. Back = room, headboard, pillows, nightstands, candles, laptop; front = the duvet (to the sleepers' chests),
//   petals, floor candles and, when glow > 0, the laptop's cold blue light over everything (kills the candle warmth).
//   BED: pillowL [840.6, 973.3, 52.2] / pillowR [1079.4, 973.3, 52.2] (person(..., {view: 'bust'}) ground points: heads land
//   on the pillows); laptop [1281.6, 546.4, 117, 76]; duvetTop 602.7; candles [[x, y, top, r] x 7]; vp [960, 330]; P.
// webcamBg(ctx, box, kind, seed, {k, t, inks})  Home-office backgrounds for Teams tiles, fills box: 'bookshelf' | 'kitchen' |
//   'plain' | 'bed' | 'car' (window scrolls with t) | 'ceiling' (camera pointed up) | 'blur' (Teams background blur of a
//   seeded room) | 'stage' (riso, always printed) | 'cubicle' (Dan's desk) | 'office' (Greg's window). Scales with box.
// crowd(ctx, t, box, n, {seed, jump 0..1, headbang 0..1, inks, k, style: 'silhouette' | 'flat', view: 'back' | 'front',
//   size (front-row s px, default box h * .07), depth (.5: back-row scale), rows, hands 0..1, phones 0..1, rage 0..1 (front
//   view: polite smiles .. screaming)})  Lanyarded coworkers in rows, batched by colour: 300 people cost ~2-5 ms.
// wallClock(ctx, x, y, r, secs, {style: 'office' | 'stage', k, rot, tick (false = sweep), crack 0..1, brand})  School clock.
// fluoro(ctx, t, box | quad, {k, flicker 0..1, strobe 0..1, env, on, glow, seed, line, spacing})  One troffer panel.
// cubeHead(ctx, x, y, r, seed, {facing: 1 | -1, t, k, nod, lx, glasses, headset, lod})  Cheap coworker head with headset.
// sunburst(ctx, cx, cy, a, b, rot, n, R)  Flat two-ink rays.
// Look-dev (LOOKS): desk, bleed, openplan, greg_office, conf, conf_final, stage, stage_cool, stage_empty, kit, bedroom,
//   bedroom_full, webcambgs, crowd (human.js's own crowd look is kept as crowd_rig), crowd_office, clocks, desk_k,
//   openplan_k, greg_k, z_* (zoomed checks), perf_* (set-only timing).
(() => {
  // ---------- shared helpers ----------
  const KOF = o => clamp(o.k ?? STYLE.k);
  const blend = k => { const c = smooth(k); return (a, b) => mix(a, b, c); };
  // run fn under look(k), then give the caller its STYLE back
  function inLook(k, fn) { const S = STYLE; look(k); try { return fn(); } finally { STYLE = S; } }
  // call a chapter callback without letting it leak style or canvas state into the set
  function cb(fn, ctx, box, t) { const S = STYLE, B = BOIL, L = LIGHT; ctx.save(); try { fn(ctx, box, t); } finally { ctx.restore(); STYLE = S; BOIL = B; LIGHT = L; } }

  const DARK = { [INK.red]: INK.redDk, [INK.orange]: INK.orangeDk, [INK.blue]: INK.blueDk, [INK.yellow]: INK.orange, [INK.cyan]: INK.blue,
    [INK.pink]: '#B8215F', [INK.green]: '#0E7A48', [INK.purple]: '#4E2A99', [INK.teams]: INK.teamsDk, [INK.paper]: INK.paperDk };
  const darkOf = c => DARK[c] || mix(c, INK.ink, .45);
  const INKSETS = {
    hot: [INK.red, INK.pink, INK.yellow], cool: [INK.blue, INK.cyan, INK.yellow], pink: [INK.pink, INK.red, INK.yellow],
    orange: [INK.orange, INK.red, INK.yellow], fire: [INK.red, INK.yellow, INK.orange], red: [INK.red, INK.redDk, INK.paper],
    all: [INK.red, INK.pink, INK.yellow, INK.cyan, INK.teams],
  };
  // inks: preset name or [main, second, accent, extra...] -> {a, b, c, d, adk, bdk}
  function inkSet(x, def = 'hot') {
    const a = Array.isArray(x) ? x : INKSETS[x] || INKSETS[def];
    return { a: a[0], b: a[1] ?? a[0], c: a[2] ?? INK.yellow, d: a[3] ?? a[2] ?? INK.yellow, e: a[4] ?? INK.teams, adk: darkOf(a[0]), bdk: darkOf(a[1] ?? a[0]) };
  }

  const qp = (q, u, v) => { const a0 = lerp(q[0][0], q[1][0], u), a1 = lerp(q[0][1], q[1][1], u), b0 = lerp(q[3][0], q[2][0], u), b1 = lerp(q[3][1], q[2][1], u); return [lerp(a0, b0, v), lerp(a1, b1, v)]; };
  const subq = (q, u0, v0, u1, v1) => [qp(q, u0, v0), qp(q, u1, v0), qp(q, u1, v1), qp(q, u0, v1)];
  // point on the line from the vanishing point vp through p, at height y
  const toward = (vp, p, y) => [vp[0] + (p[0] - vp[0]) * (y - vp[1]) / (p[1] - vp[1]), y];
  const persp = (cx, cy, f, eye) => (X, Y, Z) => [cx + f * X / Z, cy + f * (eye - Y) / Z];

  function fillA(ctx, pts, color, a) { ctx.save(); ctx.globalAlpha *= a; fillPts(ctx, pts, color, false); ctx.restore(); }
  // A shadow shape: one flat cel band in the office (k < .5), halftone dots in the stage print.
  function shadowArea(ctx, pts, k, color, o = {}) {
    if (k < .5) { fillA(ctx, pts, o.flat || color, o.alpha ?? .5); return; }
    ctx.save(); clipPts(ctx, pts, false);
    dotsIn(ctx, bbox(pts), { spacing: o.spacing || 18, color: o.dots || color, dir: o.dir || [0, 1], from: o.from, to: o.to, min: o.min ?? .35, max: o.max ?? 1 });
    ctx.restore();
  }
  // Rage bleeding in as print: halftone dots creep into a shape from one edge (dir = travel direction) as k rises.
  function bleed(ctx, pts, k, color, o = {}) {
    const K = remap(k, o.k0 ?? .2, 1, 0, o.reach ?? 1.25); if (K <= 0) return;
    const b = bbox(pts), d = o.dir || [0, -1], len = Math.abs(d[0]) * (b[2] - b[0]) + Math.abs(d[1]) * (b[3] - b[1]) || 1;
    const sx = d[0] >= 0 ? b[0] : b[2], sy = d[1] >= 0 ? b[1] : b[3], g = o.gain ?? 1.6, mx = o.max ?? 1;
    ctx.save(); clipPts(ctx, pts, false);
    dotsIn(ctx, b, { spacing: o.spacing || 24, color, angle: o.angle, k: (x, y) => clamp((K - ((x - sx) * d[0] + (y - sy) * d[1]) / len) * g) * mx });
    ctx.restore();
  }

  // ---------- riso graphics ----------
  // Flat sunburst rays (two inks, never a gradient).
  function sunburst(ctx, cx, cy, a, b, rot = 0, n = 18, R = 2600) {
    ctx.save(); ctx.fillStyle = a; ctx.fillRect(-4000, -4000, 12000, 12000);
    ctx.beginPath(); for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = a0 + TAU / n / 2; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); ctx.closePath(); }
    ctx.fillStyle = b; ctx.fill(); ctx.restore();
  }

  // ---------- fluorescent troffer ----------
  // fluoro(ctx, t, box, {flicker, strobe, env, on, k, glow, seed, line})
  // box = [x, y, w, h] or a perspective quad [[x, y] TL, TR, BR, BL]. flicker 0..1: the office stutter (a tube that
  // misfires now and then). strobe 0..1: stage flash amount; env (0..1) overrides the beat envelope pulse(t, 7).
  function fluoro(ctx, t, box, o = {}) {
    const k = KOF(o), m = blend(k), q = Array.isArray(box[0]) ? box : rect(...box), [x0, y0, x1, y1] = bbox(q);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0, s = o.seed || 0;
    let lit = o.on ?? 1;
    if (o.flicker) { const ph = frac(t * .19 + hash(s * 7.7)); if (ph < .09 * o.flicker) lit *= hash(Math.floor(t * 24) * 1.37 + s) < .55 ? .12 : .85; }
    const sb = clamp((o.strobe || 0) * (o.env ?? pulse(t, 7))) * lit, glow = o.glow || INK.yellow;
    ctx.save();
    if (k > .3 && lit > .2) {
      const R = Math.max(w, h) * (.3 + 1.1 * sb) * remap(k, .3, 1, .2, 1), rx = w / 2 + R, ry = h / 2 + R;
      dotsIn(ctx, [cx - rx, cy - ry, cx + rx, cy + ry], { spacing: o.spacing || 16, color: glow, k: (x, y) => (1.1 - Math.hypot((x - cx) / rx, (y - cy) / ry)) * 1.5 * lit * (.55 + .45 * sb) });
    }
    ink(ctx, q, { fill: m('#C3C5C4', INK.ink), line: o.line ?? 2.5, smooth: false, boil: .6, seed: s });
    const lens = subq(q, .04, .12, .96, .88), off = m('#C9CAC5', INK.paperDk);
    fillPts(ctx, lens, mix(off, m(INK.fluoro, INK.paper), lit), false);
    const tube = mix(off, sb > .25 ? INK.white : m('#FFFFFA', INK.white), lit);
    for (const v of [.3, .7]) fillPts(ctx, subq(lens, .02, v - .11, .98, v + .11), tube, false);
    if (k < .6) { // prismatic diffuser grid
      ctx.beginPath(); for (let i = 1; i < 16; i++) { const a = qp(lens, i / 16, 0), b = qp(lens, i / 16, 1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      for (let j = 1; j < 4; j++) { const a = qp(lens, 0, j / 4), b = qp(lens, 1, j / 4); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.strokeStyle = rgba(INK.oline, .07 * (1 - k)); ctx.lineWidth = 1; ctx.stroke();
    }
    if (sb > .45 && k > .5) { const r = Math.max(w, h) * .45 * sb; fillPts(ctx, star(cx, cy, r, .12, 4, 0), INK.white, false); }
    ctx.restore();
  }

  // ---------- the wall clock ----------
  // wallClock(ctx, x, y, r, secs, {style: 'office'|'stage', k, rot, tick: true, crack 0..1})
  // A round school clock. secs = seconds since midnight (clockSecs(h, m, s) from props.js); hands are exact, so
  // 8:57, 12:01, 3:30, 4:59 and 5:01 read at a glance. The second hand ticks with a small overshoot.
  function wallClock(ctx, x, y, r, secs, o = {}) {
    const k = clamp(o.k ?? (o.style === 'stage' ? 1 : o.style === 'office' ? 0 : STYLE.k)), m = blend(k);
    const rim = m('#55545C', INK.ink), face = m('#F5F3EE', INK.white), numc = m('#3B3A42', INK.ink), sec = m('#C9544E', INK.red);
    const s = mod(secs, 43200), h = s / 3600, mn = s / 60 % 60, sc = o.tick === false ? s % 60 : Math.floor(s % 60) - 1 + backOut(clamp(frac(s) / .14), 2.4);
    inLook(k, () => {
      ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
      fillA(ctx, ell(r * .05, r * .07, r * 1.04, r * 1.04, 48), m(INK.wallDk, INK.ink), k < .5 ? .55 : .9);
      ink(ctx, ell(0, 0, r, r, 48), { fill: rim, shade: { color: INK.ink, spacing: Math.max(6, r * .07), dir: [.5, .85], from: 0, to: r }, line: Math.max(2, r * .035), boil: .5 });
      ink(ctx, ell(0, 0, r * .87, r * .87, 48), { fill: face, shade: { color: m('#DAD6CD', INK.paperDk), spacing: Math.max(5, r * .055), dir: [.55, .8], from: r * .25, to: r * .95, max: .7 }, line: Math.max(1.5, r * .018), boil: .4 });
      // minute ticks (one path), fat 5-minute ticks
      ctx.beginPath();
      for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0, r0 = r * (big ? .7 : .77), r1 = r * .82, ww = r * (big ? .028 : .011), sa = Math.sin(a), ca = -Math.cos(a), px = -ca * ww, py = sa * ww;
        ctx.moveTo(sa * r0 + px, ca * r0 + py); ctx.lineTo(sa * r1 + px, ca * r1 + py); ctx.lineTo(sa * r1 - px, ca * r1 - py); ctx.lineTo(sa * r0 - px, ca * r0 - py); ctx.closePath(); }
      ctx.fillStyle = numc; ctx.fill();
      for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; txt(ctx, String(i), Math.sin(a) * r * .55, -Math.cos(a) * r * .55, { font: 'ui', weight: 800, size: r * .2, stretch: -1, align: 'center', base: 'middle', color: numc }); }
      txt(ctx, o.brand || 'OFFICE TIME', 0, r * .3, { font: 'ui', weight: 700, size: r * .065, track: r * .01, align: 'center', base: 'middle', color: rgba(numc, .55) });
      const hand = (a, L, tail, w, col) => { const p = [[-w / 2, tail], [-w * .42, -L * .86], [0, -L], [w * .42, -L * .86], [w / 2, tail]]; const P = xform(p, 0, 0, 1, a); fillPts(ctx, P, col, false); return P; };
      const shadowOff = r * .03;
      ctx.save(); ctx.globalAlpha *= .25; ctx.translate(shadowOff, shadowOff * 1.4); hand(h / 12 * TAU, r * .48, r * .12, r * .085, INK.ink); hand(mn / 60 * TAU, r * .74, r * .14, r * .055, INK.ink); ctx.restore();
      hand(h / 12 * TAU, r * .48, r * .12, r * .085, numc); hand(mn / 60 * TAU, r * .74, r * .14, r * .055, numc);
      const sa = sc / 60 * TAU; inkLine(ctx, [[-Math.sin(sa) * r * .2, Math.cos(sa) * r * .2], [Math.sin(sa) * r * .8, -Math.cos(sa) * r * .8]], r * .018, sec, { taper: [0, 0], smooth: false, keepWeight: true });
      fillPts(ctx, ell(-Math.sin(sa) * r * .15, Math.cos(sa) * r * .15, r * .045, r * .045, 14), sec);
      fillPts(ctx, ell(0, 0, r * .055, r * .055, 16), sec); fillPts(ctx, ell(0, 0, r * .022, r * .022, 10), numc);
      if (o.crack) { ctx.save(); ctx.globalAlpha *= clamp(o.crack); for (let i = 0; i < 6; i++) { const a = hash(i * 3 + 1) * TAU, pts = [[Math.cos(a) * r * .15, Math.sin(a) * r * .15]]; for (let j = 1; j < 5; j++) { const aa = a + (hash(i * 7 + j) - .5) * .7; pts.push([Math.cos(aa) * r * .2 * j, Math.sin(aa) * r * .2 * j]); } inkLine(ctx, pts, r * .014, INK.ink, { taper: [0, .8], smooth: false }); } ctx.restore(); }
      // glass glare
      ctx.save(); clipPts(ctx, ell(0, 0, r * .87, r * .87, 48)); fillA(ctx, [[-r, -r * .2], [-r * .2, -r], [r * .05, -r], [-r, r * .05]], INK.white, k < .5 ? .28 : .4); ctx.restore();
      ctx.restore();
    });
  }

  // ---------- small office props ----------
  function leafPts(x, y, L, ang, wd = 1) { const p = [[0, 0], [L * .3, -L * .34 * wd], [L * .78, -L * .2 * wd], [L, 0], [L * .78, L * .2 * wd], [L * .3, L * .34 * wd]]; return xform(p, x, y, 1, ang); }
  // the sad desk plant: pothos in a pot. droop 1 = sad, -1 = spiky (rage)
  function deskPlant(ctx, t, x, y, s, P, droop) {
    const m = P.m, potT = y - 60 * s;
    ink(ctx, [[x - 40 * s, potT], [x + 40 * s, potT], [x + 30 * s, y], [x - 30 * s, y]], { fill: P.pot, shade: { color: P.potDk, spacing: 12, dir: [1, 0], from: 0, to: 40 * s }, line: 3, smooth: false, seed: 31 });
    ink(ctx, rect(x - 44 * s, potT - 4 * s, 88 * s, 14 * s), { fill: P.potLt, line: 3, smooth: false, seed: 32 });
    const leaves = [[-1, .9, 0], [-.7, .35, 1], [-.35, .6, 0], [.1, .25, 1], [.4, .5, 0], [.7, .8, 0], [1, 1, 2]], sw = twos(t);
    leaves.forEach(([side, len, kind], i) => {
      const L = (60 + 40 * len) * s, a0 = -Math.PI / 2 + side * lerp(.5, .25, clamp(-droop)), base = [x + side * 14 * s, potT - 2 * s];
      const sway = Math.sin(sw * 1.3 + i) * .03 * (1 - clamp(-droop));
      const bend = lerp(-.25, 2.1, clamp(droop)) * side + sway, mid = [base[0] + Math.cos(a0) * L * .55, base[1] + Math.sin(a0) * L * .55];
      const a1 = a0 + bend, tip = [mid[0] + Math.cos(a1) * L * .5, mid[1] + Math.sin(a1) * L * .5];
      inkLine(ctx, [base, mid, tip], 4 * s, P.plantDk, { taper: [0, .3], seed: i });
      const fill = kind === 2 ? P.leafDead : kind === 1 ? P.plantLt : P.plant;
      ink(ctx, leafPts(tip[0], tip[1], (40 + 12 * len) * s, a1 + side * .35, lerp(.8, 1.15, clamp(droop)) * lerp(1, .55, clamp(-droop))), { fill, shade: { color: P.plantDk, spacing: 10, dir: [0, 1], from: 0, to: 20 * s }, line: 2.6, seed: 40 + i });
    });
  }
  function stickyNote(ctx, x, y, w, rot, text, fill, P, seed = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    fillA(ctx, rect(4, 6, w, w), INK.ink, .12);
    ink(ctx, [[0, 0], [w, 0], [w, w * .92], [w * .9, w], [0, w]], { fill, line: 2, smooth: false, boil: .5, seed });
    fillA(ctx, rect(0, 0, w, w * .16), INK.ink, .06);
    text.split('\n').forEach((s, i) => txt(ctx, s, w * .1, w * (.42 + i * .26), { font: 'hand', weight: 700, size: w * .2, color: P.ink }));
    ctx.restore();
  }
  function pushPin(ctx, x, y, col) { fillPts(ctx, ell(x + 2, y + 3, 6, 6, 10), rgba(INK.ink, .2)); ink(ctx, ell(x, y, 6, 6, 12), { fill: col, line: 1.6, boil: .3 }); fillPts(ctx, ell(x - 2, y - 2, 2, 2, 6), rgba(INK.white, .7)); }

  // tiny Teams look for idle screens (apps.js draws the real thing when a chapter passes screen:)
  function miniTeams(ctx, [x, y, w, h], t, seed = 1) {
    fillPts(ctx, rect(x, y, w, h), INK.teamsBg, false);
    const bar = h * .1; fillPts(ctx, rect(x, y, w, bar), INK.teamsBar, false);
    fillPts(ctx, rrect(x + w * .86, y + bar * .2, w * .12, bar * .6, bar * .15), INK.msRed, false);
    txt(ctx, 'Leave', x + w * .92, y + bar * .52, { font: 'ui', weight: 700, size: bar * .38, align: 'center', base: 'middle', color: '#FFFFFF' });
    txt(ctx, '00:15:' + String(Math.floor(t) % 60).padStart(2, '0'), x + w * .03, y + bar * .52, { font: 'mono', weight: 600, size: bar * .36, base: 'middle', color: '#C8C8C8' });
    const g = w * .012, tw = (w - g * 3) / 2, th = (h - bar - g * 3) / 2, cols = ['#C8A27C', '#8BA1C9', '#B58CB5', '#86B3A4'], ini = ['GH', 'LM', 'TJ', 'BR'];
    for (let i = 0; i < 4; i++) {
      const tx = x + g + (i % 2) * (tw + g), ty = y + bar + g + Math.floor(i / 2) * (th + g);
      fillPts(ctx, rrect(tx, ty, tw, th, w * .008), INK.teamsTile, false);
      fillPts(ctx, ell(tx + tw / 2, ty + th / 2, th * .2, th * .2, 20), cols[(i + seed) % 4]);
      txt(ctx, ini[i], tx + tw / 2, ty + th / 2, { font: 'ui', weight: 700, size: th * .14, align: 'center', base: 'middle', color: '#1F1F1F' });
      if (i === 0) { ctx.save(); ctx.strokeStyle = INK.teams; ctx.lineWidth = Math.max(2, w * .006); ctx.strokeRect(tx + 1, ty + 1, tw - 2, th - 2); ctx.restore(); }
    }
  }
  // tiny Outlook week: the little blue boxes
  function miniCalendar(ctx, [x, y, w, h], seed = 3, col = INK.outlook, colLt = INK.outlookLt, paper = '#FFFFFF') {
    fillPts(ctx, rect(x, y, w, h), paper, false);
    fillPts(ctx, rect(x, y, w, h * .12), col, false);
    const cw = w / 5, top = y + h * .2;
    ctx.beginPath(); for (let i = 1; i < 5; i++) { ctx.moveTo(x + i * cw, top); ctx.lineTo(x + i * cw, y + h); } ctx.strokeStyle = rgba('#000000', .1); ctx.lineWidth = 1; ctx.stroke();
    for (let d = 0; d < 5; d++) { let yy = top + 2; for (let j = 0; j < 9 && yy < y + h - 4; j++) { const bh = h * (.05 + .07 * hash(seed * 13 + d * 7 + j)); if (hash(seed + d * 3 + j * 5) < .85) { fillPts(ctx, rect(x + d * cw + 2, yy, cw - 4, bh - 2), colLt, false); fillPts(ctx, rect(x + d * cw + 2, yy, Math.max(2, cw * .06), bh - 2), col, false); } yy += bh; } }
  }

  // ---------- Dan's desk ----------
  const DESK = {
    vp: [960, 560],                       // vanishing point (camera at Dan's seated eye level)
    dan: [700, 1050, 60],                 // ground point between Dan's feet + s; seated (sit: 1) on the chair seat, turn ~ .45 toward the monitor
    chair: [700, 1050],                   // chair floor point (seat top at y 798)
    monitor: [930, 398, 440, 248],        // screen rect (16:9); chapters paint into it with screen(ctx, box, t)
    webcam: [1150, 382],                  // clip-on webcam lens on the monitor's top bezel
    laptop: [1452, 532, 216, 134],        // laptop screen rect
    laptopCam: [1560, 524],
    keyboard: [990, 698, 272, 24],        // keyboard footprint on the desk
    mouse: [1296, 712],
    mug: [1772, 726],                     // mug base centre ("PER MY LAST EMAIL"); mug: false hides it
    plant: [432, 712],                    // pot base centre
    papers: [205, 688],                   // top of the in-tray paper stack (emit flying paper from here)
    clock: [960, 244, 80],                // wall clock centre + radius
    memo: [370, 392, 178, 226],           // pinned memo rect on the partition
    wall: [0, 150, 1920, 335],            // far wall band (y 150..335) above the cubicle
    partition: [300, 335, 1620, 640],     // back partition x0, top, x1, desk line
    deskY: 640, deskFront: 732,           // desk top back edge / front edge y
    fluoro: [],                           // ceiling troffer quads (filled below)
  };
  {
    const vp = DESK.vp, yj = 150, yn = 78, lane = X => [toward(vp, [960 + X, yj], yj), toward(vp, [960 + X, yj], yn)];
    DESK.ceilY = yj;
    for (const [a, b] of [[-760, -420], [-170, 170], [420, 760]]) { const [A, Ad] = lane(a), [B, Bd] = lane(b); DESK.fluoro.push([Ad, Bd, B, A]); }
  }

  function deskPal(k, inks) {
    const I = inkSet(inks, 'fire'), m = blend(k);
    return { k, I, m, ink: m(INK.oline, INK.ink),
      ceil: m(INK.ceil, INK.paper), tileLine: m('#D2CFC6', I.adk), wall: m(INK.wall, INK.paper), wallDk: m(INK.wallDk, INK.paperDk),
      cube: m(INK.cube, I.a), cubeDk: m(INK.cubeDk, I.adk), cubeLt: m('#B6BFC8', I.adk), rail: m('#959EA8', INK.ink), seam: m('#98A2AC', I.adk),
      desk: m(INK.desk, I.b), deskDk: m(INK.deskDk, I.bdk), deskLt: m('#E0D6C1', I.b),
      knee: m('#838B95', INK.ink), kneeDk: m('#737A84', INK.ink), carpet: m(INK.carpet, I.adk), carpetDk: m(INK.carpetDk, INK.ink),
      black: m('#46454D', INK.ink), black2: m('#5A5961', INK.ink), metal: m('#BDBFC1', INK.paperDk), metalDk: m('#9C9FA3', INK.ink),
      sheet: m('#F4F2EC', INK.white), sheetDk: m('#E2DFD7', INK.paperDk),
      plant: m(INK.plant, INK.ink), plantLt: m('#A9BCA0', INK.ink), plantDk: m(INK.plantDk, INK.ink), leafDead: m('#C9C18E', I.b),
      pot: m('#CBB49B', I.a), potDk: m('#B39C83', I.adk), potLt: m('#D6C2AB', I.a),
      chair: m('#646B76', INK.ink), chairDk: m('#535963', INK.ink), chairLt: m('#747C88', I.adk),
      pin: m('#7F9CB5', INK.red), yellow: m('#ECE2A6', INK.yellow), pink: m('#EBC9CC', INK.pinkLt), calBlue: m(INK.outlook, I.a), calLt: m(INK.outlookLt, mix(I.a, INK.paper, .55)),
      light: m(INK.fluoro, INK.white), dot: I.adk };
  }

  // officeDesk(ctx, t, {k, inks, clock, screen, laptop, mug, headset, chair, plant, flicker, strobe, layer|fg})
  function officeDesk(ctx, t, o = {}) {
    const k = KOF(o), P = deskPal(k, o.inks), layer = o.layer || (o.fg ? 'front' : 'back');
    inLook(k, () => { ctx.save();
      if (layer !== 'front') deskBack(ctx, t, k, P, o);
      if (layer !== 'back') deskFront(ctx, t, k, P, o);
      ctx.restore(); });
  }
  function deskStrobe(t, k, o) { return o.strobe ?? clamp((k - .6) / .4); }

  function deskBack(ctx, t, k, P, o) {
    const vp = DESK.vp, [px0, ptop, px1, dy] = DESK.partition, df = DESK.deskFront, yj = DESK.ceilY;
    const strobe = deskStrobe(t, k, o), env = pulse(t, 6);
    // ceiling: drop tiles in perspective
    fillPts(ctx, rect(-20, -20, 1960, yj + 20), P.ceil, false);
    ctx.beginPath();
    for (let i = -9; i <= 9; i++) { const a = [960 + i * 170 + 85, yj], b = toward(vp, a, -20); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (const y of [yj - 1, 78, -14]) { ctx.moveTo(-20, y); ctx.lineTo(1940, y); }
    ctx.strokeStyle = P.tileLine; ctx.lineWidth = lerp(2, 3, k); ctx.stroke();
    DESK.fluoro.forEach((q, i) => fluoro(ctx, t, q, { k, flicker: i === 2 ? (o.flicker ?? .8) : 0, strobe, env: pulse(t, 6, 1), seed: i, glow: P.I.c }));
    // far wall + two corporate prints + the clock
    fillPts(ctx, rect(-20, yj, 1960, ptop - yj + 10), P.wall, false);
    fillA(ctx, rect(-20, yj, 1960, 14), P.wallDk, .7);
    bleed(ctx, rect(-20, yj, 1960, ptop - yj + 10), k, P.I.adk, { dir: [0, 1], spacing: 22, k0: .35, reach: 1.1 });
    for (const [fx, sd] of [[510, -1], [1410, 1]]) {
      fillA(ctx, rect(fx - 82, 188, 176, 120), INK.ink, .1);
      ink(ctx, rect(fx - 88, 180, 176, 120), { fill: P.sheet, line: 3, smooth: false, seed: fx });
      fillPts(ctx, rect(fx - 74, 194, 148, 92), P.m('#D9D3C6', P.I.b), false);
      fillPts(ctx, ell(fx + sd * 22, 232, 30, 30, 24), P.m('#A9B5BF', P.I.a));
      fillPts(ctx, rect(fx - sd * 30 - 22, 238, 44, 40), P.m('#C9B79D', INK.ink), false);
    }
    wallClock(ctx, ...DESK.clock, o.clock ?? clockSecs(8, 57) + t, { k });
    // back partition: fabric panels in an aluminium frame
    const back = rect(px0, ptop, px1 - px0, 940 - ptop);
    ink(ctx, back, { fill: P.cube, shade: { color: P.cubeDk, spacing: 26, dir: [0, 1], from: 20, to: 300 }, line: 3, smooth: false, seed: 3 });
    bleed(ctx, back, k, P.I.adk, { dir: [0, -1], spacing: 26, k0: .25 });
    ctx.beginPath(); for (let i = 1; i < 3; i++) { const x = px0 + (px1 - px0) * i / 3; ctx.rect(x - 4, ptop, 8, dy - ptop); } ctx.fillStyle = P.seam; ctx.fill();
    ink(ctx, rect(px0 - 6, ptop - 12, px1 - px0 + 12, 16), { fill: P.rail, line: 2.5, smooth: false, seed: 4 });
    // pinned memo, printed calendar, sticky notes
    const [mx, my, mw, mh] = DESK.memo;
    fillA(ctx, rect(mx + 6, my + 8, mw, mh), INK.ink, .14);
    ink(ctx, rect(mx, my, mw, mh), { fill: P.sheet, line: 2.5, smooth: false, seed: 7 });
    txt(ctx, 'MEMO', mx + 16, my + 40, { font: 'ui', weight: 900, size: 30, track: 2, color: P.ink });
    fillPts(ctx, rect(mx + 16, my + 52, mw - 32, 3), P.ink, false);
    ['ALL-HANDS', 'meeting re:', 'having fewer', 'meetings.'].forEach((s, i) => txt(ctx, s, mx + 16, my + 84 + i * 24, { font: 'ui', weight: i ? 500 : 800, size: 18, color: P.ink }));
    fillPts(ctx, rect(mx + 14, my + 178, mw - 28, 30), P.m('#E7D9A0', INK.yellow), false);
    txt(ctx, 'MANDATORY', mx + mw / 2, my + 200, { font: 'ui', weight: 900, size: 20, track: 1, align: 'center', color: P.m('#9A5A50', INK.red) });
    pushPin(ctx, mx + 22, my + 12, P.pin); pushPin(ctx, mx + mw - 22, my + 12, P.pin);
    const cal = [1436, 362, 178, 146];
    fillA(ctx, rect(cal[0] + 6, cal[1] + 8, cal[2], cal[3]), INK.ink, .14);
    ctx.save(); ctx.translate(cal[0] + cal[2] / 2, cal[1]); ctx.rotate(.02); ctx.translate(-cal[0] - cal[2] / 2, -cal[1]);
    miniCalendar(ctx, cal, 5, P.calBlue, P.calLt, P.sheet); outline(ctx, rect(...cal), 2.5, INK.ink, { smooth: false });
    txt(ctx, 'WEEK 41', cal[0] + 8, cal[1] + 14, { font: 'ui', weight: 800, size: 13, color: INK.white });
    pushPin(ctx, cal[0] + cal[2] / 2, cal[1] + 8, P.pin); ctx.restore();
    stickyNote(ctx, 846, 420, 66, -.05, 'sync re:\nsync', P.yellow, P, 1);
    stickyNote(ctx, 852, 500, 62, .06, 'circle\nback!!', P.pink, P, 2);
    // side partitions (perspective), framing the cubicle symmetrically
    for (const sd of [-1, 1]) {
      const xb = sd < 0 ? px0 : px1, xe = sd < 0 ? -20 : 1940, top0 = [xb, ptop - 12];
      const tE = [xe, vp[1] + (top0[1] - vp[1]) * (xe - vp[0]) / (xb - vp[0])], face = [[xb, ptop - 4], [tE[0], tE[1] + 8], [xe, 1100], [xb, 1100]];
      ink(ctx, face, { fill: P.cubeLt, shade: { color: P.cubeDk, spacing: 26, dir: [-sd * .3, 1], from: 0, to: 500 }, line: 3, smooth: false, seed: 10 + sd });
      bleed(ctx, face, k, P.I.adk, { dir: [-sd, 0], spacing: 26, k0: .2 });
      const rail = [[xb, ptop - 12], [tE[0], tE[1] - 6], [tE[0], tE[1] + 12], [xb, ptop + 4]];
      ink(ctx, rail, { fill: P.rail, line: 2.5, smooth: false, seed: 12 + sd });
    }
    // under the desk: knee space, floor in shadow, then lit carpet
    const kneeTop = df + 20, floorBack = 940;
    fillPts(ctx, rect(px0, kneeTop, px1 - px0, floorBack - kneeTop), P.knee, false);
    for (const sd of [-1, 1]) { const xb = sd < 0 ? px0 : px1, xe = sd < 0 ? -20 : 1940; fillPts(ctx, [[xb, kneeTop], [xe, kneeTop], [xe, 1100], [xb, 1100]], P.kneeDk, false); }
    const fl = toward(vp, [px0, floorBack], 1100), fr = toward(vp, [px1, floorBack], 1100), floor = [[px0, floorBack], [px1, floorBack], fr, fl];
    fillPts(ctx, floor, P.carpet, false);
    ctx.save(); clipPts(ctx, floor, false); ctx.beginPath();
    for (let i = -8; i <= 8; i++) { const a = [960 + i * 165, floorBack], b = toward(vp, a, 1100); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (const y of [985, 1050]) { ctx.moveTo(0, y); ctx.lineTo(1920, y); }
    ctx.strokeStyle = P.carpetDk; ctx.lineWidth = 2.5; ctx.stroke();
    shadowArea(ctx, rect(0, floorBack, 1920, 70), k, P.carpetDk, { alpha: .55, dots: INK.ink, spacing: 18, dir: [0, -1], from: -40, to: 40 });
    ctx.restore();
    // bin + crumpled memo, cords to a power strip
    ink(ctx, [[468, 890], [572, 890], [560, 1000], [480, 1000]], { fill: P.black2, shade: { color: INK.ink, spacing: 12, dir: [1, 0], from: 0, to: 50 }, line: 2.5, smooth: false, seed: 21 });
    ink(ctx, blob(512, 884, 22, 5, .3, 12), { fill: P.sheet, line: 2, seed: 22 });
    ink(ctx, ell(520, 890, 52, 8, 20), { fill: P.black, line: 2, seed: 23 });
    for (let i = 0; i < 3; i++) inkLine(ctx, [[1160 + i * 26, kneeTop], [1170 + i * 20, 880 + i * 10], [1210 + i * 18, 960 + i * 4], [1250 + i * 10, 968]], 4, P.black, { taper: [0, 0], seed: 24 + i });
    ink(ctx, rrect(1236, 958, 120, 22, 6), { fill: P.sheetDk, line: 2.5, smooth: false, seed: 27 });
    // drawer pedestal under the laptop side
    const ped = [1464, kneeTop, 262, 1006 - kneeTop];
    ink(ctx, rect(...ped), { fill: P.metal, shade: { color: P.metalDk, spacing: 16, dir: [0, 1], from: 0, to: 300 }, line: 3, smooth: false, seed: 28 });
    [[0, .27], [.27, .54], [.54, 1]].forEach(([a, b], i) => { const y0 = ped[1] + ped[3] * a + 8, y1 = ped[1] + ped[3] * b - 4;
      ink(ctx, rect(ped[0] + 12, y0, ped[2] - 24, y1 - y0), { fill: P.metal, line: 2.2, smooth: false, seed: 29 + i });
      fillPts(ctx, rrect(ped[0] + ped[2] / 2 - 40, y0 + 14, 80, 10, 4), P.metalDk, false); });
    // desk top + front edge
    const dl = toward(vp, [px0, dy], df), dr = toward(vp, [px1, dy], df), top = [[px0, dy], [px1, dy], dr, dl];
    ink(ctx, top, { fill: P.desk, line: 3, smooth: false, seed: 5 });
    shadowArea(ctx, [[px0, dy], [px1, dy], toward(vp, [px1, dy], dy + 26), toward(vp, [px0, dy], dy + 26)], k, P.deskDk, { alpha: .6, spacing: 14, dir: [0, -1], from: -14, to: 14 });
    bleed(ctx, top, k, P.I.bdk, { dir: [0, -1], spacing: 18, k0: .4, reach: .9 });
    ink(ctx, rect(-20, df, 1960, 22), { fill: P.deskDk, line: 3, smooth: false, seed: 6 });
    shadowArea(ctx, rect(-20, df + 22, 1960, 26), k, INK.ink, { flat: P.kneeDk, alpha: .9, spacing: 14, dir: [0, -1], from: -10, to: 16 });
    // in-tray + paper stack
    for (let i = 0; i < 9; i++) ink(ctx, [[130 + i * .6, 716 - i * 4], [292 - i * .6, 716 - i * 4], [286, 708 - i * 4], [136, 708 - i * 4]], { fill: i % 2 ? P.sheet : P.sheetDk, line: 1.6, smooth: false, seed: 60 + i });
    ink(ctx, [[118, 720], [304, 720], [300, 730], [122, 730]], { fill: P.metalDk, line: 2, smooth: false, seed: 70 });
    // plant (droops in the office, spikes up as rage prints)
    if (o.plant !== false) deskPlant(ctx, t, ...DESK.plant, 1, P, lerp(1, -1, smooth(remap(k, .3, 1, 0, 1))));
    // monitor on its stand
    const [sx, sy, sw, sh] = DESK.monitor, bz = 16, mcx = sx + sw / 2;
    ink(ctx, ell(mcx, 694, 110, 14, 24), { fill: P.black2, line: 2.5, seed: 8 });
    ink(ctx, [[mcx - 22, sy + sh + bz], [mcx + 22, sy + sh + bz], [mcx + 26, 692], [mcx - 26, 692]], { fill: P.black2, shade: { color: INK.ink, spacing: 10, dir: [1, 0], from: 0, to: 26 }, line: 2.5, smooth: false, seed: 9 });
    shadowArea(ctx, [[sx - bz + 26, sy - bz + 22], [sx + sw + bz + 30, sy - bz + 22], [sx + sw + bz + 30, dy], [sx - bz + 26, dy]], k, P.cubeDk, { alpha: .75, dots: INK.ink, spacing: 16, dir: [1, 0], from: -300, to: 200, min: .3, max: .8 });
    ink(ctx, rrect(sx - bz, sy - bz, sw + bz * 2, sh + bz * 2 + 4, 10), { fill: P.black, line: 3, smooth: false, seed: 11 });
    ctx.save(); clipPts(ctx, rect(sx, sy, sw, sh), false);
    if (typeof o.screen === 'function') cb(o.screen, ctx, DESK.monitor.slice(), t);
    else if (o.screen === false) { fillPts(ctx, rect(sx, sy, sw, sh), P.m('#2B2D33', INK.ink), false); fillA(ctx, [[sx + sw * .55, sy], [sx + sw * .75, sy], [sx + sw * .35, sy + sh], [sx + sw * .15, sy + sh]], INK.white, .05); }
    else miniTeams(ctx, DESK.monitor, t, 0);
    ctx.restore();
    fillPts(ctx, rrect(DESK.webcam[0] - 26, sy - bz - 12, 52, 18, 8), P.black, false);
    fillPts(ctx, ell(DESK.webcam[0], DESK.webcam[1] - 5, 6, 6, 12), INK.ink); fillPts(ctx, ell(DESK.webcam[0] - 2, DESK.webcam[1] - 7, 2, 2, 6), rgba(INK.white, .6));
    // headset hanging on the monitor corner
    if (o.headset !== false) {
      const hx = sx + sw + bz, hy = sy - bz;
      inkLine(ctx, [[hx + 8, hy + 62], [hx + 16, hy + 12], [hx - 6, hy - 14], [hx - 46, hy - 6], [hx - 54, hy + 6]], 9, P.black2, { taper: [0, 0], seed: 13 });
      ink(ctx, ell(hx + 8, hy + 80, 18, 26, 18), { fill: P.black2, line: 2.5, seed: 14 });
      ink(ctx, ell(hx + 4, hy + 80, 10, 18, 14), { fill: P.chairLt, line: 1.5, seed: 15 });
      inkLine(ctx, [[hx + 2, hy + 96], [hx - 10, hy + 126], [hx - 34, hy + 138]], 4, P.black2, { taper: [0, 0], seed: 16 });
      ink(ctx, ell(hx - 38, hy + 139, 8, 7, 10), { fill: P.black, line: 1.5, seed: 17 });
    }
    // keyboard + mouse
    const [kx, ky, kw, kh] = DESK.keyboard, kq = [[kx + 10, ky], [kx + kw - 10, ky], [kx + kw, ky + kh], [kx, ky + kh]];
    ink(ctx, [[kx + 10, ky], [kx + kw - 10, ky], [kx + kw, ky + kh], [kx + kw, ky + kh + 7], [kx, ky + kh + 7], [kx, ky + kh]], { fill: P.metal, line: 2.5, smooth: false, seed: 18 });
    ctx.beginPath();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 15; c++) { const q = subq(kq, (c + .14) / 15, (r + .2) / 4, (c + .86) / 15, (r + .82) / 4); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.lineTo(...q[2]); ctx.lineTo(...q[3]); ctx.closePath(); }
    ctx.fillStyle = P.metalDk; ctx.fill();
    const [mox, moy] = DESK.mouse;
    inkLine(ctx, [[mox, moy - 10], [mox - 10, 670], [mcx + 60, 690]], 2.5, P.black2, { taper: [0, 0], seed: 19 });
    ink(ctx, ell(mox, moy, 15, 11, 16), { fill: P.metal, line: 2.2, seed: 20 });
    // laptop
    const [lx, ly, lw, lh] = DESK.laptop, lb = 9;
    ink(ctx, rrect(lx - lb, ly - lb, lw + lb * 2, lh + lb * 2, 8), { fill: P.black, line: 2.5, smooth: false, seed: 33 });
    ctx.save(); clipPts(ctx, rect(lx, ly, lw, lh), false);
    if (typeof o.laptop === 'function') cb(o.laptop, ctx, DESK.laptop.slice(), t); else if (o.laptop === false) fillPts(ctx, rect(lx, ly, lw, lh), P.m('#2B2D33', INK.ink), false); else miniCalendar(ctx, DESK.laptop, 2);
    ctx.restore();
    fillPts(ctx, ell(DESK.laptopCam[0], DESK.laptopCam[1], 2.6, 2.6, 8), INK.ink);
    ink(ctx, [[lx - lb - 2, ly + lh + lb], [lx + lw + lb + 2, ly + lh + lb], [lx + lw + lb + 22, ly + lh + lb + 26], [lx - lb - 22, ly + lh + lb + 26]], { fill: P.metal, shade: { color: P.metalDk, spacing: 10, dir: [0, 1], from: 0, to: 20 }, line: 2.5, smooth: false, seed: 34 });
    fillPts(ctx, [[lx + 20, ly + lh + lb + 6], [lx + lw - 20, ly + lh + lb + 6], [lx + lw - 6, ly + lh + lb + 18], [lx + 6, ly + lh + lb + 18]], P.metalDk, false);
    // mug: PER MY LAST EMAIL
    if (o.mug !== false) {
      const [ux, uy] = DESK.mug, mw2 = 30, mh2 = 72;
      inkLine(ctx, [[ux + mw2 - 2, uy - 58], [ux + mw2 + 18, uy - 52], [ux + mw2 + 18, uy - 26], [ux + mw2 - 2, uy - 20]], 8, P.sheetDk, { taper: [0, 0], seed: 35 });
      ink(ctx, rrect(ux - mw2, uy - mh2, mw2 * 2, mh2, 7), { fill: P.sheet, shade: { color: P.sheetDk, spacing: 9, dir: [1, 0], from: 0, to: 30 }, line: 2.5, smooth: false, seed: 36 });
      fillPts(ctx, ell(ux, uy - mh2 + 3, mw2 - 4, 5, 16), P.m('#6E5A4A', INK.ink));
      txt(ctx, 'PER MY', ux, uy - 44, { font: 'display', weight: 900, stretch: -2, size: 12, align: 'center', color: P.m('#7D6F8F', INK.red) });
      txt(ctx, 'LAST EMAIL', ux, uy - 30, { font: 'display', weight: 900, stretch: -2, size: 12, align: 'center', color: P.m('#7D6F8F', INK.red) });
      if (k < .7) for (let i = 0; i < 2; i++) { const st = twos(t), dx = Math.sin(st * 2 + i * 2) * 5; inkLine(ctx, [[ux - 8 + i * 14, uy - mh2 - 8], [ux - 12 + i * 14 + dx, uy - mh2 - 30], [ux - 6 + i * 14 - dx, uy - mh2 - 54]], 3, rgba(P.wallDk, .9), { taper: [.3, .7], seed: 37 + i }); }
    }
    // Dan's chair (behind him)
    if (o.chair !== false) officeChairBack(ctx, ...DESK.chair, DESK.dan[2], P);
  }
  // Dan's rolling chair: (x, y) floor point, s = the rig's px per unit (seat top 4.2 s above the floor)
  function officeChairBack(ctx, x, y, s, P) {
    const seatY = y - 4.2 * s;
    // base: five-star legs + casters
    for (const [dx, dy] of [[-2.6, -.25], [-1.1, .1], [1.1, .1], [2.6, -.25]]) inkLine(ctx, [[x, y - .9 * s], [x + dx * s, y + dy * s - .3 * s]], .38 * s, P.chairDk, { taper: [0, 0], smooth: false });
    for (const [dx, dy] of [[-2.6, -.25], [-1.1, .1], [1.1, .1], [2.6, -.25]]) ink(ctx, ell(x + dx * s, y + dy * s, .3 * s, .24 * s, 12), { fill: P.black, line: 2, boil: .4 });
    ink(ctx, rect(x - .22 * s, seatY + .4 * s, .44 * s, 2.9 * s), { fill: P.metal, shade: { color: P.metalDk, spacing: 8, dir: [1, 0], from: 0, to: .3 * s }, line: 2.2, smooth: false });
    ink(ctx, rect(x - .45 * s, y - 1.25 * s, .9 * s, .5 * s), { fill: P.chairDk, line: 2.2, smooth: false });
    // back + seat
    ink(ctx, rect(x - .8 * s, seatY - 1.6 * s, .3 * s, 1.8 * s), { fill: P.chairDk, line: 2.2, smooth: false });
    ink(ctx, rrect(x - 2.1 * s, seatY - 5.1 * s, 2.9 * s, 3.7 * s, 1.1 * s), { fill: P.chair, shade: { color: P.chairDk, spacing: 14, dir: [.5, .85], from: -.5 * s, to: 2.5 * s }, line: 3, seed: 50 });
    ink(ctx, rrect(x - 1.9 * s, seatY - .15 * s, 3.8 * s, .75 * s, .35 * s), { fill: P.chair, shade: { color: P.chairDk, spacing: 12, dir: [0, 1], from: 0, to: .7 * s }, line: 3, smooth: false, seed: 51 });
  }

  function deskFront(ctx, t, k, P, o) {
    const strobe = deskStrobe(t, k, o); if (strobe <= 0) return;
    const e = strobe * pulse(t, 6);
    if (e < .03) return;
    ctx.save(); ctx.globalAlpha = .3 * e;
    for (const q of DESK.fluoro) { const a = q[3], b = q[2]; fillPts(ctx, [a, b, [b[0] + (b[0] - 960) * .9 + 260, 1100], [a[0] + (a[0] - 960) * .9 - 260, 1100]], INK.white, false); }
    ctx.restore();
  }

  // ---------- coworker heads (cheap, for partitions and webcams) ----------
  // cubeHead(ctx, x, y, r, seed, {facing: 1 camera | -1 away, t, k, nod, lx, glasses, headset}) - (x, y) head centre, r head radius
  function cubeHead(ctx, x, y, r, seed, o = {}) {
    const k = o.k ?? STYLE.k, m = blend(k), sk = CR_SKIN[Math.floor(hash(seed * 5.1) * 5)], hc = CR_HAIR[Math.floor(hash(seed * 1.9) * 6)], away = o.facing === -1;
    const skin = m(sk[0], sk[1]), hair = m(hc[0], hc[1]), dark = m('#2E2A33', INK.ink), set = m('#4A4950', INK.ink), hs = Math.floor(hash(seed * 6.6) * 4), lw = Math.max(1, r * .07);
    const tc = twos(o.t ?? 0), nod = (o.nod ?? 1) * Math.max(0, Math.sin(tc * (1.1 + hash(seed) * .8) * Math.PI + seed)) * r * .08;
    ctx.save(); ctx.translate(x, y + nod);
    if (o.lod) { // far away: flat fills and one stroked headset band
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 1.12, 0, 0, TAU); ctx.fillStyle = away ? hair : skin; ctx.fill();
      if (!away && hs !== 3) { ctx.beginPath(); ctx.ellipse(0, 0, r * 1.04, r * 1.16, 0, Math.PI + .3, TAU - .3); ctx.closePath(); ctx.fillStyle = hair; ctx.fill(); }
      if (o.headset !== false) { ctx.beginPath(); ctx.ellipse(0, -r * .05, r * 1.06, r * 1.2, 0, Math.PI, TAU); ctx.lineWidth = r * .16; ctx.strokeStyle = set; ctx.stroke(); ctx.fillStyle = set; ctx.fillRect(-r * 1.22, -r * .1, r * .34, r * .6); }
      ctx.restore(); return;
    }
    const head = ell(0, 0, r, r * 1.12, 20);
    if (away) { ink(ctx, head, { fill: hair, line: lw, boil: .3, seed }); fillPts(ctx, ell(-r * .98, r * .1, r * .2, r * .3, 10), skin); fillPts(ctx, ell(r * .98, r * .1, r * .2, r * .3, 10), skin); }
    else {
      if (hs === 2) fillPts(ctx, rrect(-r * 1.1, -r * .5, r * 2.2, r * 1.9, r * .6), hair, false);
      ink(ctx, head, { fill: skin, line: lw, boil: .3, seed });
      if (hs !== 3) { const cap = [...ell(0, 0, r * 1.04, r * 1.16, 20).filter(p => p[1] < -r * .12), [r * .2, -r * .3]]; fillPts(ctx, cap, hair, true); }
      const lx = (o.lx ?? 0) * r * .18, ey = r * .14;
      for (const sd of [-1, 1]) fillPts(ctx, ell(sd * r * .36 + lx, ey, r * .09, r * .13, 8), dark);
      if (o.glasses ?? hash(seed * 9.2) < .35) { ctx.lineWidth = lw * .9; ctx.strokeStyle = dark; ctx.strokeRect(-r * .66 + lx, ey - r * .17, r * .5, r * .34); ctx.strokeRect(r * .16 + lx, ey - r * .17, r * .5, r * .34); }
      inkLine(ctx, [[-r * .2, r * .56], [0, r * .64], [r * .2, r * .56]], lw * 1.1, dark, { taper: [.2, .2] });
    }
    if (o.headset !== false) { // band over the crown, ear cup, boom mic
      inkLine(ctx, ell(0, -r * .05, r * 1.06, r * 1.2, 20).filter(p => p[1] < 0).sort((a, b) => a[0] - b[0]), r * .14, set, { taper: [0, 0] });
      fillPts(ctx, rrect(-r * 1.22, -r * .1, r * .34, r * .6, r * .12), set, false);
      if (!away) inkLine(ctx, [[-r * 1.05, r * .38], [-r * .8, r * .78], [-r * .3, r * .8]], r * .08, set, { taper: [0, 0] });
      else fillPts(ctx, rrect(r * .88, -r * .1, r * .34, r * .6, r * .12), set, false);
    }
    ctx.restore();
  }

  // ---------- open plan ----------
  // One-point perspective, camera 2.5 m up at the head of the central aisle (aisle X -1..1 m, rows of 2.6 m cubicles from z 1.6).
  const OPEN = { vp: [960, 380], f: 900, eye: 2.5, ceil: 3.2, aisle: 1, zFar: 30, rows: 11, row0: 1.6, rowD: 2.6, cols: [1, 3.4, 5.8, 8.2], ph: 1.3, clock: null, desks: [], walk: [] };
  OPEN.P = persp(960, 380, OPEN.f, OPEN.eye);
  // [x, y, s] for a person standing in the aisle at depth z (m) and lateral offset X (m); s = rig px per unit
  OPEN.at = (z, X = 0) => { const p = OPEN.P(X, 0, z); return [p[0], p[1], .175 * OPEN.f / z]; };
  {
    const P = OPEN.P, cp = P(0, 2.78, 4.5); OPEN.clock = [cp[0], cp[1], .3 * OPEN.f / 4.5];
    OPEN.walk = [OPEN.at(3.4), OPEN.at(OPEN.row0 + OPEN.rowD * (OPEN.rows - 1))];
    // desks[i] = {x, y, r: head centre + radius in px, X, z: seat (m), row, col, side, id}: one seated coworker per cubicle
    for (let j = 1; j < OPEN.rows; j++) for (const sd of [-1, 1]) for (let c = 0; c < 3; c++) {
      const id = j * 6 + (sd > 0 ? 3 : 0) + c, X = sd * (OPEN.cols[c] + OPEN.cols[c + 1]) / 2, z = OPEN.row0 + j * OPEN.rowD - 1.25, p = P(X, 1.22, z);
      OPEN.desks.push({ x: p[0], y: p[1], r: .11 * OPEN.f / z, X, z, row: j, col: c, side: sd, id, empty: hash(id * 3.3 + 1) < .12 });
    }
  }
  // openPlan(ctx, t, {k, inks, clock, people 0..1 (false = empty), stare 0..1 (heads turn to camera), flicker, strobe})
  function openPlan(ctx, t, o = {}) {
    const k = KOF(o), D = deskPal(k, o.inks), P = OPEN.P, f = OPEN.f, m = D.m, zF = OPEN.zFar, H = OPEN.ceil, half = 9;
    inLook(k, () => { ctx.save();
      const q = (X0, Y0, Z0, X1, Y1, Z1) => [P(X0, Y0, Z0), P(X1, Y0, Z0), P(X1, Y1, Z1), P(X0, Y1, Z1)];
      // far wall with windows to a grey city, side walls of windows
      fillPts(ctx, rect(-20, -20, 1960, 1120), D.ceil, false);
      const fw = [P(-half, H, zF), P(half, H, zF), P(half, 0, zF), P(-half, 0, zF)];
      fillPts(ctx, fw, D.wall, false);
      for (const sd of [-1, 1]) {
        const wall = [P(sd * half, H, 6), P(sd * half, H, zF), P(sd * half, 0, zF), P(sd * half, 0, 6)];
        fillPts(ctx, wall, D.wallDk, false);
        const win = [P(sd * half, 2.5, 6), P(sd * half, 2.5, zF), P(sd * half, .8, zF), P(sd * half, .8, 6)];
        fillPts(ctx, win, m('#C9D2D8', INK.paper), false);
        ctx.save(); clipPts(ctx, win, false);
        for (let i = 0; i < 14; i++) { const z0 = 6 + i * 1.6 + hash(i + sd) * .6, z1 = z0 + .8 + hash(i * 3) * .9, hh = .8 + .9 * hash(i * 5 + sd); fillPts(ctx, [P(sd * half, hh + .8, z0), P(sd * half, hh + .8, z1), P(sd * half, .8, z1), P(sd * half, .8, z0)], m('#AFB8C0', D.I.adk), false); }
        ctx.restore();
        ctx.beginPath(); for (let z = 6; z <= zF; z += 2) { const a = P(sd * half, 2.5, z), b = P(sd * half, .8, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.strokeStyle = D.rail; ctx.lineWidth = 3; ctx.stroke();
      }
      const fwin = [P(-half + .6, 2.5, zF), P(half - .6, 2.5, zF), P(half - .6, .8, zF), P(-half + .6, .8, zF)];
      fillPts(ctx, fwin, m('#C9D2D8', INK.paper), false);
      ctx.save(); clipPts(ctx, fwin, false); for (let i = 0; i < 16; i++) { const X = -half + i * 1.15, w = .5 + hash(i * 2) * .5, hh = 1 + hash(i * 7) * 1.4; fillPts(ctx, q(X, .8 + hh, zF, X + w, .8, zF), m('#AFB8C0', D.I.adk), false); } ctx.restore();
      // ceiling grid + troffers
      ctx.beginPath();
      for (let X = -half; X <= half + .01; X += 1.2) { const a = P(X, H, .8), b = P(X, H, zF); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      for (let z = 1.2; z <= zF; z += 1.2) { const a = P(-half, H, z), b = P(half, H, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.strokeStyle = D.tileLine; ctx.lineWidth = 2; ctx.stroke();
      const strobe = o.strobe ?? clamp((k - .6) / .4);
      for (let z = 2.4; z < zF - 1; z += 3.6) for (const X of [-7.2, -4.8, -2.4, 0, 2.4, 4.8, 7.2]) {
        const qd = q(X - .6, H, z + .6, X + .6, H, z), sz = .6 * f / z;
        if (sz < 26 && k < .3) { fillPts(ctx, qd, D.rail, false); fillPts(ctx, subq(qd, .05, .14, .95, .86), D.light, false); }
        else if (sz < 12) fillPts(ctx, qd, D.light, false);
        else fluoro(ctx, t, qd, { k, line: sz > 30 ? 2.5 : 1.5, flicker: X === 4.8 && z < 4 ? (o.flicker ?? .8) : 0, strobe, env: pulse(t, 6), seed: X * 3 + z, glow: D.I.c, spacing: Math.max(12, sz * .4) });
      }
      // carpet + its tile grid, the aisle
      const floor = [P(-half, 0, 1.4), P(half, 0, 1.4), P(half, 0, zF), P(-half, 0, zF)], aisle = [P(-OPEN.aisle, 0, 1.4), P(OPEN.aisle, 0, 1.4), P(OPEN.aisle, 0, zF), P(-OPEN.aisle, 0, zF)];
      fillPts(ctx, floor, D.carpet, false);
      fillPts(ctx, aisle, m('#A9B1B9', D.I.a), false);
      ctx.beginPath();
      for (let X = -OPEN.aisle; X <= OPEN.aisle + .01; X += .5) { const a = P(X, 0, 1.4), b = P(X, 0, zF); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      for (let z = 1.4; z <= zF; z += .6) { const a = P(-OPEN.aisle, 0, z), b = P(OPEN.aisle, 0, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.strokeStyle = D.carpetDk; ctx.lineWidth = 2; ctx.stroke();
      bleed(ctx, aisle, k, D.I.adk, { dir: [0, -1], spacing: 22, k0: .3 });
      // cubicle rows, far to near: cross partition, then the people in the cubicle in front of it
      const ph = OPEN.ph, rowZ = j => OPEN.row0 + j * OPEN.rowD, cols = OPEN.cols, people = o.people === false ? 0 : o.people ?? 1, st = o.stare || 0;
      const lw = z => Math.max(1.2, 9 / z), scr = m('#3A3C44', INK.ink), nRows = clamp(Math.round(o.rows ?? OPEN.rows), 1, OPEN.rows);
      for (let j = nRows - 1; j >= 0; j--) {
        const z1 = rowZ(j), z0 = rowZ(j - 1) + .06, far = z1 > 12, shape = (pts, fill, z, seed, sm = false) => far ? fillPts(ctx, pts, fill, sm) : ink(ctx, pts, { fill, line: lw(z), smooth: sm, boil: .3, seed });
        for (const sd of [-1, 1]) {
          shape([P(sd, ph, z1), P(sd * cols[3], ph, z1), P(sd * cols[3], 0, z1), P(sd, 0, z1)], D.cube, z1, j * 2 + sd);
          fillPts(ctx, [P(sd, ph, z1), P(sd * cols[3], ph, z1), P(sd * cols[3], ph, z1 - .07), P(sd, ph, z1 - .07)], D.rail, false);
          if (j === 0) continue;
          for (let c = 2; c >= 0; c--) {
            const d = OPEN.desks.find(e => e.row === j && e.col === c && e.side === sd), X = d.X, xa = sd * cols[c], xb = sd * cols[c + 1];
            // desk along the far partition, the monitor (everyone is in the same Teams call), the coworker from behind
            shape([P(xa + sd * .08, .74, z1), P(xb - sd * .08, .74, z1), P(xb - sd * .08, .74, z1 - .75), P(xa + sd * .08, .74, z1 - .75)], D.desk, z1, d.id);
            const mz = z1 - .3, ma = P(X - .3, 1.24, mz), mb = P(X + .3, .9, mz), mw = mb[0] - ma[0], mh = mb[1] - ma[1];
            fillPts(ctx, rect(ma[0] - mw * .06, ma[1] - mw * .06, mw * 1.12, mh + mw * .12), D.black, false);
            if (mw > 100) miniTeams(ctx, [ma[0], ma[1], mw, mh], t, d.id);
            else { fillPts(ctx, rect(ma[0], ma[1], mw, mh), INK.teamsBg, false); if (mw > 12) { ctx.fillStyle = INK.teamsTile; for (let q = 0; q < 4; q++) ctx.fillRect(ma[0] + mw * (.04 + (q % 2) * .48), ma[1] + mh * (.14 + (q >> 1) * .43), mw * .44, mh * .38); } }
            if (!d.empty && hash(d.id * 1.9) <= people) {
              const fc = st > hash(d.id * 4.4) ? 1 : -1, sp = P(X, 1.02, d.z), r = d.r, sk = CR_SHIRT[Math.floor(hash(d.id * 9.3) * 6)];
              shape(rrect(sp[0] - r * 1.7, sp[1] - r * .25, r * 3.4, r * 3.2, r * .8), m(sk[0], sk[1]), d.z, d.id + 1);
              cubeHead(ctx, d.x, d.y, r, d.id, { facing: fc, t: t + d.id, k, lx: fc > 0 ? -(d.x - 960) / 900 : 0, lod: far });
              if (fc < 0) { const ca = P(X - .26, .98, d.z - .28), cb2 = P(X + .26, .52, d.z - .28); shape(rrect(ca[0], ca[1], cb2[0] - ca[0], cb2[1] - ca[1], r * .5), D.chair, d.z, d.id + 2); }
            } else { const cp = P(X, .95, d.z); shape(rrect(cp[0] - d.r * 1.4, cp[1], d.r * 2.8, d.r * 2.4, d.r * .7), D.chair, d.z, d.id + 3); }
            // the partition between this cubicle and the next one in (c = 0: the aisle partition)
            const xi = sd * cols[c], face = [P(xi, ph, z0), P(xi, ph, z1), P(xi, 0, z1), P(xi, 0, z0)];
            shape(face, c ? D.cubeDk : D.cubeLt, z0, j * 7 + c);
            if (c === 0) bleed(ctx, face, k, D.I.adk, { dir: [-sd, 0], spacing: Math.max(8, 60 / z0), k0: .25 });
            fillPts(ctx, [P(xi, ph, z0), P(xi, ph, z1), P(xi + sd * .07, ph, z1), P(xi + sd * .07, ph, z0)], D.rail, false);
          }
        }
      }
      // the hanging clock over the aisle
      const [cx, cy, cr] = OPEN.clock, rodTop = P(0, H, 4.5);
      inkLine(ctx, [rodTop, [cx, cy - cr]], 4, D.black, { taper: [0, 0], smooth: false });
      wallClock(ctx, cx, cy, cr, o.clock ?? clockSecs(8, 57) + t, { k });
      ctx.restore(); });
  }

  // ---------- the conference room ----------
  // One-point perspective from the head of the table (eye 1.45 m). Room X -3..3 m, far wall at z 7.2, table X -.8...8, z 2..6.4, top .75 m.
  const CONF = { vp: [960, 400], f: 1000, eye: 1.45, X: 3, zFar: 7.2, H: 2.8, T: { X: .8, z0: 2, z1: 6.4, top: .75 } };
  CONF.P = persp(960, 400, CONF.f, CONF.eye);
  CONF.at = (X, Y, z) => { const p = CONF.P(X, Y, z); return [p[0], p[1], .175 * CONF.f / z]; };
  {
    const P = CONF.P, T = CONF.T;
    CONF.table = [P(-T.X, T.top, T.z0), P(T.X, T.top, T.z0), P(T.X, T.top, T.z1), P(-T.X, T.top, T.z1)]; // table top quad (near L, near R, far R, far L)
    const a = P(-1.5, 2.64, CONF.zFar), b = P(1.5, .95, CONF.zFar); CONF.screen = [a[0], a[1], b[0] - a[0], b[1] - a[1]];
    CONF.seats = []; // [x, y, s, turn] in draw order (far to near, left then right)
    for (const z of [5.75, 4.75, 3.75, 2.75]) for (const sd of [-1, 1]) { const [x, y, s] = CONF.at(sd * 1.25, 0, z); CONF.seats.push([x, y, s, -sd * .7]); }
    CONF.band = { dan: CONF.at(0, .75, 3.0), linda: CONF.at(-.48, .75, 4.0), tasha: CONF.at(.48, .75, 4.0), bob: CONF.at(0, .75, 5.55), kit: CONF.at(0, .75, 5.3) };
    CONF.phone = P(0, .75, 4.3); CONF.presenter = CONF.at(-2.1, 0, 6.6);
    const c = P(2.3, 2.25, CONF.zFar); CONF.clock = [c[0], c[1], .22 * CONF.f / CONF.zFar];
  }
  function confPal(k, inks) {
    const I = inkSet(inks, 'all'), m = blend(k);
    return { k, I, m, ink: m(INK.oline, INK.ink), ceil: m(INK.ceil, INK.paper), tileLine: m('#D2CFC6', I.adk), wall: m('#DAD5CA', I.a), wallDk: m('#C7C1B4', I.adk), side: m('#CFC9BD', I.adk),
      carpet: m('#8A95A0', INK.ink), carpetDk: m('#76818C', I.adk), table: m('#C4AA8B', I.c), tableDk: m('#A68D70', INK.orange), chair: m('#525864', INK.ink), chairDk: m('#43484F', INK.ink), chairLt: m('#666D79', I.b),
      metal: m('#BDBFC1', INK.paperDk), metalDk: m('#9C9FA3', INK.ink), black: m('#3E3D45', INK.ink), black2: m('#55545C', INK.ink), glass: m('#CFDADE', INK.paper), slat: m('#ECEAE4', INK.white), sheet: m('#F4F2EC', INK.white), board: m('#F3F2EE', INK.white) };
  }
  // confRoom(ctx, t, {k, inks, screen: (ctx, box, t) => .., chairs: true|false, lights 0..1, strobe, flicker, clock, layer: 'back'|'front' | fg})
  // 'back' = room, wall screen, chairs; seat people (CONF.seats) next; 'front' = the table and what is on it (the band stands on it after).
  function confRoom(ctx, t, o = {}) {
    const k = KOF(o), C = confPal(k, o.inks), layer = o.layer || (o.fg ? 'front' : 'back');
    inLook(k, () => { ctx.save();
      if (layer !== 'front') confBack(ctx, t, k, C, o);
      if (layer !== 'back') confFront(ctx, t, k, C, o);
      ctx.restore(); });
  }
  function confBack(ctx, t, k, C, o) {
    const P = CONF.P, X = CONF.X, zF = CONF.zFar, H = CONF.H, f = CONF.f, m = C.m, zN = 1.2;
    fillPts(ctx, rect(-20, -20, 1960, 1120), C.ceil, false);
    // ceiling tiles + two troffers over the table
    ctx.beginPath(); for (let x = -X; x <= X + .01; x += .6) { const a = P(x, H, zN), b = P(x, H, zF); ctx.moveTo(...a); ctx.lineTo(...b); } for (let z = 1.8; z <= zF; z += .6) { const a = P(-X, H, z), b = P(X, H, z); ctx.moveTo(...a); ctx.lineTo(...b); }
    ctx.strokeStyle = C.tileLine; ctx.lineWidth = 2; ctx.stroke();
    const strobe = o.strobe ?? clamp((k - .6) / .4) * (o.lights ?? 1);
    [[3.6, 4.8], [5.4, 6.6]].forEach(([z0, z1], i) => fluoro(ctx, t, [P(-.6, H, z1), P(.6, H, z1), P(.6, H, z0), P(-.6, H, z0)], { k, strobe, env: pulse(t, 6, 1), flicker: i ? (o.flicker ?? 0) : 0, seed: 40 + i, glow: C.I.c }));
    // far wall, side walls, floor
    const far = [P(-X, H, zF), P(X, H, zF), P(X, 0, zF), P(-X, 0, zF)];
    ink(ctx, far, { fill: C.wall, line: 2.5, smooth: false, seed: 1 });
    bleed(ctx, far, k, C.I.adk, { dir: [0, -1], spacing: 20, k0: .3 });
    const rw = [P(X, H, zN), P(X, H, zF), P(X, 0, zF), P(X, 0, zN)];
    ink(ctx, rw, { fill: C.side, line: 2.5, smooth: false, seed: 2 });
    bleed(ctx, rw, k, C.I.adk, { dir: [-1, 0], spacing: 24, k0: .3 });
    const fl = [P(-X, 0, zN), P(X, 0, zN), P(X, 0, zF), P(-X, 0, zF)];
    fillPts(ctx, fl, C.carpet, false);
    ctx.beginPath(); for (let x = -X; x <= X + .01; x += .6) { const a = P(x, 0, zN), b = P(x, 0, zF); ctx.moveTo(...a); ctx.lineTo(...b); } for (let z = zN; z <= zF; z += .6) { const a = P(-X, 0, z), b = P(X, 0, z); ctx.moveTo(...a); ctx.lineTo(...b); }
    ctx.strokeStyle = C.carpetDk; ctx.lineWidth = 2; ctx.stroke();
    // glass wall with blinds (left)
    const gw = [P(-X, H, zN), P(-X, H, zF), P(-X, 0, zF), P(-X, 0, zN)];
    fillPts(ctx, gw, C.glass, false);
    ctx.save(); clipPts(ctx, gw, false);
    fillPts(ctx, [P(-X, .9, zN), P(-X, .9, zF), P(-X, 0, zF), P(-X, 0, zN)], m('#B9C4C9', INK.paperDk), false);
    ctx.beginPath(); for (let y = 2.62; y > 1.3; y -= .055) { const a = P(-X, y, zN), b = P(-X, y, zF); ctx.moveTo(...a); ctx.lineTo(...b); } ctx.strokeStyle = C.slat; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); for (let y = 2.62; y > 1.3; y -= .055) { const a = P(-X, y - .018, zN), b = P(-X, y - .018, zF); ctx.moveTo(...a); ctx.lineTo(...b); } ctx.strokeStyle = m('#C4C1B9', C.I.adk); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    ctx.beginPath(); for (const z of [2.4, 3.8, 5.2, 6.6]) { const a = P(-X, H, z), b = P(-X, 0, z); ctx.moveTo(...a); ctx.lineTo(...b); } ctx.strokeStyle = C.metalDk; ctx.lineWidth = 6; ctx.stroke();
    // whiteboard (right wall): DO NOT ERASE
    const wb = [P(X, 2.05, 3.3), P(X, 2.05, 5.9), P(X, .95, 5.9), P(X, .95, 3.3)];
    ink(ctx, wb, { fill: C.board, line: 3, smooth: false, seed: 3 });
    const mk = m('#5A6C8A', INK.ink), mkR = m('#A55A5A', INK.red);
    inkLine(ctx, [qp(wb, .1, .2), qp(wb, .3, .14), qp(wb, .55, .22)], 3, mk, { taper: [.1, .2] });
    inkLine(ctx, [qp(wb, .1, .4), qp(wb, .45, .36)], 3, mk, { taper: [.1, .2] }); inkLine(ctx, [qp(wb, .12, .55), qp(wb, .4, .52)], 3, mk, { taper: [.1, .2] });
    inkLine(ctx, [qp(wb, .58, .35), qp(wb, .7, .6), qp(wb, .9, .3)], 3, mkR, { taper: [.1, .2] });
    ink(ctx, subq(wb, .55, .7, .95, .92), { fill: null, line: 2.5, lineColor: mkR, smooth: false });
    { const a = qp(wb, .93, .76), b = qp(wb, .57, .76), c = qp(wb, .93, .9); ctx.save(); ctx.transform((b[0] - a[0]) / 100, (b[1] - a[1]) / 100, (c[0] - a[0]) / 30, (c[1] - a[1]) / 30, a[0], a[1]);
      txt(ctx, 'DO NOT ERASE', 50, 22, { font: 'marker', size: 22, align: 'center', color: mkR }); ctx.restore(); }
    // the wall screen + a clock
    const [sx, sy, sw, sh] = CONF.screen, bz = 9;
    ink(ctx, rect(sx - bz, sy - bz, sw + bz * 2, sh + bz * 2), { fill: C.black, line: 2.5, smooth: false, seed: 4 });
    ctx.save(); clipPts(ctx, rect(sx, sy, sw, sh), false);
    if (typeof o.screen === 'function') cb(o.screen, ctx, CONF.screen.slice(), t); else miniTeams(ctx, CONF.screen, t, 2);
    ctx.restore();
    ink(ctx, rect(sx + sw * .2, sy + sh + bz + 30, sw * .6, 36), { fill: m('#B8A68E', C.I.b), line: 2, smooth: false, seed: 5 });
    wallClock(ctx, ...CONF.clock, o.clock ?? clockSecs(15, 30) + t, { k });
    // Teams-purple light from the screen (final chorus)
    const lights = o.lights ?? clamp((k - .7) / .3);
    if (lights > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const e = .25 + .35 * pulse(t, 5);
      for (let i = 0; i < 5; i++) { const a = Math.PI / 2 + (i - 2) * .38 + Math.sin(t * .7 + i) * .1, cx = sx + sw / 2, cy = sy + sh / 2; ctx.globalAlpha = e * lights;
        fillPts(ctx, [[cx - 30, cy], [cx + 30, cy], [cx + Math.cos(a - .07) * 1500, cy + Math.sin(a - .07) * 1500], [cx + Math.cos(a + .07) * 1500, cy + Math.sin(a + .07) * 1500]], i % 2 ? INK.teams : INK.teamsLt, false); }
      ctx.restore(); }
    // chairs (behind their sitters)
    if (o.chairs !== false) for (const [x, y, s, turn] of CONF.seats) { ctx.save(); ctx.translate(x, 0); if (turn < 0) ctx.scale(-1, 1); officeChairBack(ctx, 0, y, s, C); ctx.restore(); }
  }
  function confFront(ctx, t, k, C, o) {
    const P = CONF.P, T = CONF.T, m = C.m;
    // shadow under the table, pedestal legs, the near end face and the top
    fillA(ctx, [P(-T.X, 0, T.z0 + .2), P(T.X, 0, T.z0 + .2), P(T.X, 0, T.z1), P(-T.X, 0, T.z1)], INK.ink, k < .5 ? .18 : .6);
    for (const z of [2.7, 5.7]) { const a = P(-.12, .72, z), b = P(.12, 0, z); ink(ctx, rect(a[0], a[1], b[0] - a[0], b[1] - a[1]), { fill: C.black2, line: 2, smooth: false }); const c = P(-.5, 0, z), d = P(.5, 0, z); fillPts(ctx, ell((c[0] + d[0]) / 2, c[1], (d[0] - c[0]) / 2, 8, 16), C.black); }
    ink(ctx, [P(-T.X, T.top, T.z0), P(T.X, T.top, T.z0), P(T.X, T.top - .06, T.z0), P(-T.X, T.top - .06, T.z0)], { fill: C.tableDk, line: 3, smooth: false, seed: 6 });
    ink(ctx, CONF.table, { fill: C.table, shade: { color: C.tableDk, spacing: 18, dir: [0, -1], from: -60, to: 220, max: .7 }, line: 3, smooth: false, seed: 7 });
    if (k < .5) { ctx.save(); ctx.globalAlpha = .18; fillPts(ctx, [qp(CONF.table, .3, .05), qp(CONF.table, .5, .05), qp(CONF.table, .62, .95), qp(CONF.table, .52, .95)], INK.white, false); ctx.restore(); }
    // HDMI cable, presenter laptop, donut box, cups, notepads
    inkLine(ctx, [P(-.25, T.top, 2.45), P(-.4, T.top, 3.5), P(-.2, T.top, 5.2), P(-.5, T.top, 6.4)], 3, C.black, { taper: [0, 0] });
    { const a = P(-.42, T.top, 2.35), b = P(-.08, T.top, 2.35), lt = P(-.42, T.top + .22, 2.55), rt = P(-.08, T.top + .22, 2.55);
      ink(ctx, [a, b, P(-.08, T.top, 2.6), P(-.42, T.top, 2.6)], { fill: C.metal, line: 2.5, smooth: false, seed: 8 });
      ink(ctx, [P(-.42, T.top, 2.6), P(-.08, T.top, 2.6), rt, lt], { fill: C.metalDk, line: 2.5, smooth: false, seed: 9 });
      fillPts(ctx, ell((lt[0] + rt[0]) / 2, (lt[1] + P(0, T.top, 2.6)[1]) / 2, 9, 9, 10), m('#D7D9DB', INK.paper)); }
    { const q = [P(.12, T.top, 2.3), P(.6, T.top, 2.3), P(.6, T.top, 2.75), P(.12, T.top, 2.75)];
      ink(ctx, q, { fill: m('#E7B9C2', INK.pink), line: 2.5, smooth: false, seed: 10 });
      ink(ctx, [q[3], q[2], P(.6, T.top + .3, 2.8), P(.12, T.top + .3, 2.8)], { fill: m('#EFC9D0', INK.pinkLt), line: 2.5, smooth: false, seed: 11 });
      for (let i = 0; i < 6; i++) { const c = qp(q, .2 + (i % 3) * .3, .3 + Math.floor(i / 3) * .42), r = 15 - Math.floor(i / 3) * 1.5; if (i === 4) continue;
        ink(ctx, ell(c[0], c[1], r, r * .5, 14), { fill: m(['#C9915E', '#E8C7A0', '#9A6A48'][i % 3], [INK.orange, INK.yellow, INK.redDk][i % 3]), line: 2, boil: .4 }); fillPts(ctx, ell(c[0], c[1], r * .3, r * .15, 10), C.table); } }
    for (const [x, z, c] of [[-.55, 3.6, '#F2EEE6'], [.6, 4.6, '#E9E3D8'], [-.6, 5.6, '#F2EEE6']]) { const b = P(x, T.top, z), tp = P(x, T.top + .12, z), r = .045 * CONF.f / z;
      ink(ctx, [[b[0] - r, tp[1]], [b[0] + r, tp[1]], [b[0] + r * .8, b[1]], [b[0] - r * .8, b[1]]], { fill: m(c, INK.white), line: 2, smooth: false }); fillPts(ctx, ell(b[0], tp[1], r, r * .3, 12), m('#7A5C48', INK.ink)); }
    for (const [x, z] of [[.5, 3.3], [-.5, 4.9], [.45, 5.6]]) ink(ctx, [P(x - .1, T.top, z - .14), P(x + .1, T.top, z - .14), P(x + .1, T.top, z + .14), P(x - .1, T.top, z + .14)], { fill: m('#F3EFC9', INK.white), line: 1.8, smooth: false });
    // the speakerphone starfish
    { const [cx, cy] = CONF.phone, r = .25 * CONF.f / 4.3, sq = .42, star3 = []; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3, rr = i % 2 ? r * .42 : r; star3.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sq]); }
      fillA(ctx, star3.map(([x, y]) => [x + 4, y + 5]), INK.ink, .3);
      ink(ctx, star3, { fill: C.black2, line: 2.5, smooth: true, seed: 12 });
      ink(ctx, ell(cx, cy - 3, r * .34, r * .34 * sq, 16), { fill: C.black, line: 1.5 });
      fillPts(ctx, rect(cx - r * .18, cy - 6, r * .36, 5), m('#C9B85E', INK.yellow), false);
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; fillPts(ctx, ell(cx + Math.cos(a) * r * .7, cy + Math.sin(a) * r * .7 * sq, 3, 3, 8), Math.floor(t * 2 + i) % 3 ? C.black : m('#C9544E', INK.red)); }
      inkLine(ctx, [[cx + r, cy + 2], P(.5, T.top, 4.1), P(.8, T.top, 3.9), P(.86, .3, 3.9)], 2.5, C.black, { taper: [0, 0] }); }
    // fluorescent strobe spill (stage world)
    const strobe = o.strobe ?? clamp((k - .6) / .4) * (o.lights ?? 1), e = strobe * pulse(t, 6);
    if (e > .03) { ctx.save(); ctx.globalAlpha = .25 * e; fillPts(ctx, [P(-.6, CONF.H, 4.8), P(.6, CONF.H, 4.8), P(1.6, 0, 3), P(-1.6, 0, 3)], INK.white, false); ctx.restore(); }
  }

  // ---------- Greg's corner office ----------
  // Seen through his glass front wall (z 2) from the open plan (eye 1.6 m). Back wall z 5.8: SYNERGY poster | city window | wall TV.
  const GREGOFF = { vp: [960, 470], f: 950, eye: 1.6, X: 3.6, zGlass: 2, zFar: 5.8, H: 2.9 };
  GREGOFF.P = persp(960, 470, GREGOFF.f, GREGOFF.eye);
  {
    const P = GREGOFF.P, z = GREGOFF.zFar, box = (x0, y0, x1, y1, zz = z) => { const a = P(x0, y1, zz), b = P(x1, y0, zz); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; };
    GREGOFF.window = box(-1.7, .15, 1.7, 2.75); GREGOFF.poster = box(-3.25, 1.0, -2.05, 2.3); GREGOFF.screen = box(2.0, 1.25, 3.4, 2.04);
    const g = P(0, 0, 4.3); GREGOFF.greg = [g[0], g[1], .175 * GREGOFF.f / 4.3];
    GREGOFF.desk = { z: 3.8, top: 1.1, X: .8 };
    const lt = P(-.18, 1.36, 3.86), lb = P(.18, 1.1, 3.86); GREGOFF.laptop = [lt[0], lt[1], lb[0] - lt[0], lb[1] - lt[1]];   // the back of Greg's open laptop lid
    GREGOFF.webcam = [(lt[0] + lb[0]) / 2, lt[1]];
    const rl = P(-.85, 1.78, 3.7); GREGOFF.ring = [rl[0], rl[1], .24 * GREGOFF.f / 3.7];
    GREGOFF.tumbler = P(.5, 1.1, 3.75);
  }
  function gregPal(k, inks) {
    const I = inkSet(inks, 'hot'), m = blend(k);
    return { k, I, m, ink: m(INK.oline, INK.ink), wall: m('#E2DED6', INK.paper), side: m('#D3CEC4', I.adk), ceil: m(INK.ceil, INK.paper), floor: m('#A7A39C', INK.ink), floorDk: m('#96928B', I.adk),
      sky: m('#D5DDE2', I.c), city: m('#AEB8C1', I.a), city2: m('#9AA5AF', I.adk), lit: m('#EDE7C8', INK.yellow), frame: m('#7E838A', INK.ink), glass: m('#CFDADE', INK.paper),
      desk: m('#E9E6E0', INK.white), deskDk: m('#C9C5BE', INK.paperDk), metal: m('#BDBFC1', INK.paperDk), metalDk: m('#8F9297', INK.ink), black: m('#3E3D45', INK.ink),
      plant: m('#7E9A72', INK.green), plantDk: m('#5E7A54', INK.ink), pot: m('#E9E6E0', INK.white), poster: m('#2F3B57', I.a), navy: m('#2F3B57', INK.ink) };
  }
  // gregOffice(ctx, t, {k, inks, screen: (ctx, box, t) => .., laptop: (ctx, box, t) => .. (back of the lid), ring 0..1, blinds 0..1, layer|fg})
  // 'back' = the room (window, poster, TV, plant); Greg stands at GREGOFF.greg; 'front' = standing desk, laptop, ring light, the glass wall.
  function gregOffice(ctx, t, o = {}) {
    const k = KOF(o), G = gregPal(k, o.inks), layer = o.layer || (o.fg ? 'front' : 'back');
    inLook(k, () => { ctx.save();
      if (layer !== 'front') gregBack(ctx, t, k, G, o);
      if (layer !== 'back') gregFront(ctx, t, k, G, o);
      ctx.restore(); });
  }
  function cityscape(ctx, box, t, G, seed = 1) {
    const [x, y, w, h] = box;
    fillPts(ctx, rect(x, y, w, h), G.sky, false);
    fillPts(ctx, ell(x + w * .78, y + h * .2, h * .06, h * .06, 16), G.m('#EEF1F2', INK.white));
    for (const [layerI, col, base, hmax] of [[0, G.city2, .62, .5], [1, G.city, .78, .62]]) {
      let xx = x - 10; let i = 0;
      while (xx < x + w) { const bw = w * (.05 + .07 * hash(seed * 9 + i * 3.1 + layerI)), bh = h * hmax * (.3 + .7 * hash(seed + i * 7.7 + layerI * 3)), by = y + h * base - bh + h * .3;
        fillPts(ctx, rect(xx, by, bw, y + h - by), col, false);
        if (layerI) { ctx.beginPath(); for (let r = by + 10; r < y + h - 8; r += 16) for (let c = xx + 6; c < xx + bw - 8; c += 14) if (hash(r * .37 + c * .11 + seed) < .2) ctx.rect(c, r, 6, 8); ctx.fillStyle = G.lit; ctx.fill(); }
        xx += bw + w * .006; i++; }
    }
  }
  function gregBack(ctx, t, k, G, o) {
    const P = GREGOFF.P, X = GREGOFF.X, z = GREGOFF.zFar, H = GREGOFF.H, zN = 1.4, m = G.m;
    fillPts(ctx, rect(-20, -20, 1960, 1120), G.ceil, false);
    ctx.beginPath(); for (let x = -X; x <= X + .01; x += .6) { const a = P(x, H, zN), b = P(x, H, z); ctx.moveTo(...a); ctx.lineTo(...b); } for (let zz = 1.6; zz <= z; zz += .6) { const a = P(-X, H, zz), b = P(X, H, zz); ctx.moveTo(...a); ctx.lineTo(...b); }
    ctx.strokeStyle = m('#D6D3CB', G.I.adk); ctx.lineWidth = 2; ctx.stroke();
    fluoro(ctx, t, [P(-.6, H, 4.4), P(.6, H, 4.4), P(.6, H, 3.8), P(-.6, H, 3.8)], { k, glow: G.I.c, seed: 5 });
    const far = [P(-X, H, z), P(X, H, z), P(X, 0, z), P(-X, 0, z)];
    ink(ctx, far, { fill: G.wall, line: 2.5, smooth: false, seed: 1 });
    for (const sd of [-1, 1]) { const wq = [P(sd * X, H, zN), P(sd * X, H, z), P(sd * X, 0, z), P(sd * X, 0, zN)]; ink(ctx, wq, { fill: G.side, line: 2.5, smooth: false, seed: 2 + sd }); bleed(ctx, wq, k, G.I.adk, { dir: [-sd, 0], spacing: 24, k0: .3 }); }
    // left wall: glass to the open plan, blinds half down
    const gl = [P(-X, 2.5, 2.3), P(-X, 2.5, 5.4), P(-X, .1, 5.4), P(-X, .1, 2.3)];
    fillPts(ctx, gl, G.glass, false);
    ctx.save(); clipPts(ctx, gl, false);
    fillPts(ctx, [P(-X, 1.3, 2.3), P(-X, 1.3, 5.4), P(-X, .1, 5.4), P(-X, .1, 2.3)], m('#A8B2BC', G.I.a), false);
    ctx.beginPath(); for (let y = 2.48; y > 1.6; y -= .06) { const a = P(-X, y, 2.3), b = P(-X, y, 5.4); ctx.moveTo(...a); ctx.lineTo(...b); } ctx.strokeStyle = m('#F1EFEA', INK.white); ctx.lineWidth = 6; ctx.stroke();
    ctx.restore(); outline(ctx, gl, 3, INK.ink, { smooth: false });
    // floor (polished concrete) with a rug
    const fl = [P(-X, 0, zN), P(X, 0, zN), P(X, 0, z), P(-X, 0, z)];
    fillPts(ctx, fl, G.floor, false);
    ink(ctx, [P(-1.6, 0, 3.0), P(1.6, 0, 3.0), P(1.6, 0, 5.2), P(-1.6, 0, 5.2)], { fill: m('#C9C2B4', G.I.b), line: 2.5, smooth: false, seed: 3 });
    // window to the city
    const [wx, wy, ww, wh] = GREGOFF.window;
    ctx.save(); clipPts(ctx, rect(wx, wy, ww, wh), false); cityscape(ctx, GREGOFF.window, t, G, 4); ctx.restore();
    ctx.beginPath(); ctx.rect(wx - 8, wy - 8, ww + 16, 12); ctx.rect(wx - 8, wy + wh - 4, ww + 16, 12); for (const u of [0, 1 / 3, 2 / 3, 1]) ctx.rect(wx + ww * u - 5, wy, 10, wh); ctx.fillStyle = G.frame; ctx.fill();
    outline(ctx, rect(wx - 8, wy - 8, ww + 16, wh + 16), 3, INK.ink, { smooth: false });
    // SYNERGY poster
    const [px, py, pw, phh] = GREGOFF.poster;
    fillA(ctx, rect(px + 8, py + 10, pw, phh), INK.ink, .2);
    ink(ctx, rect(px, py, pw, phh), { fill: m('#1F2A40', INK.ink), line: 3, smooth: false, seed: 4 });
    fillPts(ctx, rect(px + pw * .08, py + phh * .08, pw * .84, phh * .58), m('#5D7290', G.I.a), false);
    fillPts(ctx, [[px + pw * .08, py + phh * .66], [px + pw * .38, py + phh * .3], [px + pw * .55, py + phh * .5], [px + pw * .7, py + phh * .36], [px + pw * .92, py + phh * .66]], m('#3B4D68', INK.ink), false);
    fillPts(ctx, [[px + pw * .38, py + phh * .3], [px + pw * .44, py + phh * .37], [px + pw * .34, py + phh * .37]], INK.white, false);
    txt(ctx, 'SYNERGY', px + pw / 2, py + phh * .8, { font: 'serif', weight: 800, size: pw * .17, track: pw * .015, align: 'center', base: 'middle', color: m('#F3F0E8', INK.paper) });
    txt(ctx, 'Alone we are meetings. Together, we are more meetings.', px + pw / 2, py + phh * .91, { font: 'serif', weight: 500, size: pw * .036, align: 'center', base: 'middle', color: m('#C9C4B8', INK.paperDk) });
    // wall TV
    const [sx, sy, sw, sh] = GREGOFF.screen;
    ink(ctx, rect(sx - 7, sy - 7, sw + 14, sh + 14), { fill: G.black, line: 2.5, smooth: false, seed: 5 });
    ctx.save(); clipPts(ctx, rect(sx, sy, sw, sh), false); if (typeof o.screen === 'function') cb(o.screen, ctx, GREGOFF.screen.slice(), t); else miniTeams(ctx, GREGOFF.screen, t, 3); ctx.restore();
    // fiddle-leaf fig in the right corner, the healthy plant
    { const b = P(2.95, 0, 5.3), u = GREGOFF.f / 5.3;
      ink(ctx, [[b[0] - .22 * u, b[1] - .5 * u], [b[0] + .22 * u, b[1] - .5 * u], [b[0] + .17 * u, b[1]], [b[0] - .17 * u, b[1]]], { fill: G.pot, shade: { color: G.metalDk, spacing: 10, dir: [1, 0], from: 0, to: .2 * u }, line: 2.5, smooth: false, seed: 6 });
      inkLine(ctx, [[b[0], b[1] - .5 * u], [b[0] + 4, b[1] - 1.1 * u], [b[0] - 3, b[1] - 1.75 * u]], 4, G.plantDk, { taper: [0, .4] });
      for (let i = 0; i < 11; i++) { const yy = b[1] - (.85 + i * .09) * u, sd = i % 2 ? 1 : -1, L = (.3 - i * .012) * u; ink(ctx, leafPts(b[0] + sd * 3, yy, L, -Math.PI / 2 + sd * (1.15 - i * .07), 1.35), { fill: i % 3 ? G.plant : m('#93AE86', INK.green), shade: { color: G.plantDk, spacing: 9, dir: [0, 1], from: 0, to: L * .3 }, line: 2.2, seed: 60 + i }); } }
  }
  function gregFront(ctx, t, k, G, o) {
    const P = GREGOFF.P, D = GREGOFF.desk, m = G.m;
    // ring light on its tripod (lit side faces Greg; we see the back of the ring and its spill)
    if (o.ring !== false) { const [rx, ry, rr] = GREGOFF.ring, on = o.ring ?? 1, base = P(-.85, 0, 3.7);
      inkLine(ctx, [[rx, ry + rr], [base[0], base[1] - 40]], 6, G.black, { taper: [0, 0], smooth: false });
      for (const sd of [-1, 0, 1]) inkLine(ctx, [[base[0], base[1] - 60], [base[0] + sd * 40, base[1] + (sd ? 0 : 6)]], 5, G.black, { taper: [0, 0], smooth: false });
      if (on > 0) { ctx.save(); ctx.globalAlpha = .35 * on; fillPts(ctx, ell(rx + rr * .15, ry, rr * 1.35, rr * 1.35, 30), m('#FFFFF6', INK.white)); ctx.restore(); }
      ctx.save(); ctx.beginPath(); tracePath(ctx, ell(rx, ry, rr, rr, 36)); tracePath(ctx, ell(rx, ry, rr * .76, rr * .76, 36).reverse()); ctx.fillStyle = G.black; ctx.fill('evenodd'); ctx.restore();
      outline(ctx, ell(rx, ry, rr, rr, 36), 2.5, INK.ink); outline(ctx, ell(rx, ry, rr * .76, rr * .76, 36), 2, INK.ink);
      ctx.save(); ctx.globalAlpha = on; outline(ctx, ell(rx + 3, ry, rr * .82, rr * .82, 36), 3, m('#FFFFF2', INK.white)); ctx.restore(); }
    // standing desk, laptop (lid back toward us), tumbler
    const top = [P(-D.X, D.top, D.z - .35), P(D.X, D.top, D.z - .35), P(D.X, D.top, D.z + .35), P(-D.X, D.top, D.z + .35)];
    for (const sd of [-1, 1]) { const a = P(sd * (D.X - .12) - .04, D.top - .03, D.z), b = P(sd * (D.X - .12) + .04, 0, D.z); ink(ctx, rect(a[0], a[1], b[0] - a[0], b[1] - a[1]), { fill: G.metalDk, line: 2, smooth: false }); const f0 = P(sd * (D.X - .12) - .2, 0, D.z), f1 = P(sd * (D.X - .12) + .2, 0, D.z); fillPts(ctx, rect(f0[0], f0[1] - 6, f1[0] - f0[0], 8), G.black, false); }
    ink(ctx, [P(-D.X, D.top, D.z - .35), P(D.X, D.top, D.z - .35), P(D.X, D.top - .05, D.z - .35), P(-D.X, D.top - .05, D.z - .35)], { fill: G.deskDk, line: 2.5, smooth: false, seed: 7 });
    ink(ctx, top, { fill: G.desk, line: 2.5, smooth: false, seed: 8 });
    const [lx, ly, lw, lh] = GREGOFF.laptop;
    ink(ctx, rrect(lx, ly, lw, lh + 4, 4), { fill: G.metal, line: 2.5, smooth: false, seed: 9 });
    ctx.save(); clipPts(ctx, rect(lx, ly, lw, lh), false);
    if (typeof o.laptop === 'function') cb(o.laptop, ctx, GREGOFF.laptop.slice(), t);
    else { const st = m('#F2C94C', INK.yellow); ctx.save(); ctx.translate(lx + lw * .32, ly + lh * .45); ctx.rotate(-.15); fillPts(ctx, rrect(-lw * .22, -lh * .18, lw * .44, lh * .36, 3), st, false); txt(ctx, '#1 BOSS', 0, 1, { font: 'ui', weight: 900, size: lw * .085, align: 'center', base: 'middle', color: INK.ink }); ctx.restore();
      ctx.save(); ctx.translate(lx + lw * .7, ly + lh * .62); ctx.rotate(.1); fillPts(ctx, ell(0, 0, lw * .12, lw * .12, 16), m('#5B5FC7', INK.teams)); ctx.restore(); }
    ctx.restore();
    fillPts(ctx, ell(GREGOFF.webcam[0], GREGOFF.webcam[1] + 4, 3, 3, 8), INK.ink);
    { const [tx, ty] = GREGOFF.tumbler, r = 13, h2 = 70; ink(ctx, [[tx - r, ty - h2], [tx + r, ty - h2], [tx + r * .8, ty], [tx - r * .8, ty]], { fill: m('#3D5A80', INK.blue), shade: { color: INK.ink, spacing: 8, dir: [1, 0], from: 0, to: r }, line: 2.5, smooth: false, seed: 10 });
      ink(ctx, rrect(tx - r - 1, ty - h2 - 12, r * 2 + 2, 14, 4), { fill: G.metal, line: 2, smooth: false }); inkLine(ctx, [[tx + 4, ty - h2 - 12], [tx + 8, ty - h2 - 40]], 4, m('#E9E6E0', INK.white), { taper: [0, 0] }); }
    // the glass front wall: mullions, frosted dot band, his name, reflections
    const gz = GREGOFF.zGlass;
    for (const x of [-1.6, 1.6]) { const a = P(x - .04, 3, gz), b = P(x + .04, -.5, gz); ink(ctx, rect(a[0], -20, b[0] - a[0], 1120), { fill: G.frame, line: 2.5, smooth: false }); }
    { const a = P(-3, 1.06, gz), b = P(3, .94, gz); ctx.save(); ctx.globalAlpha = k < .5 ? .55 : .8; ctx.beginPath(); const r = (b[1] - a[1]) * .38;
      for (let x = 0; x < 1920; x += r * 2.6) { ctx.moveTo(x + r, (a[1] + b[1]) / 2); ctx.arc(x, (a[1] + b[1]) / 2, r, 0, TAU); } ctx.fillStyle = m('#F4F6F6', INK.white); ctx.fill(); ctx.restore(); }
    { const a = P(-1.45, 1.86, gz); txt(ctx, 'Greg Hollis', a[0], a[1], { font: 'ui', weight: 700, size: 38, color: rgba(m('#F4F6F6', INK.white), .9) }); txt(ctx, 'VP, Alignment', a[0], a[1] + 36, { font: 'ui', weight: 500, size: 26, color: rgba(m('#F4F6F6', INK.white), .8) }); }
    ctx.save(); ctx.globalAlpha = k < .5 ? .12 : .2; for (const [x0, w] of [[1180, 160], [1400, 60], [140, 90]]) fillPts(ctx, [[x0, -20], [x0 + w, -20], [x0 + w - 520, 1100], [x0 - 520, 1100]], INK.white, false); ctx.restore();
  }

  // ---------- the bedroom (night) ----------
  // From the foot of the bed (eye 1.6 m). Back wall z 3.9, bed X -.85...85, z 1.75..3.85, mattress .58 m.
  const BED = { vp: [960, 330], f: 1000, eye: 1.6, X: 2.5, zFar: 3.9, H: 2.6, head: 3.85, foot: 1.75 };
  BED.P = persp(960, 330, BED.f, BED.eye);
  {
    const P = BED.P, bust = X => { const z = 3.35, h = P(X, .95, z), s = .175 * BED.f / z; return [h[0], h[1] + (CAST.dan.H - CAST.dan.head.ry) * s, s]; };
    BED.pillowL = bust(-.4); BED.pillowR = bust(.4);             // person(ctx, ...BED.pillowL, 'dan', {view: 'bust'}): head on the pillow
    const a = P(1.1, .86, 3.42), b = P(1.5, .6, 3.42); BED.laptop = [a[0], a[1], b[0] - a[0], b[1] - a[1]]; // laptop screen on the right nightstand
    BED.candles = [[-1.44, .55, 3.62, .13], [-1.3, .55, 3.56, .21], [-1.17, .55, 3.66, .09], [-1.55, 0, 2.6, .12], [-1.3, 0, 2.35, .08], [1.32, 0, 2.38, .09], [1.6, 0, 2.62, .14]].map(([X, Y, z, hh]) => { const p = P(X, Y, z), q = P(X, Y + hh, z); return [p[0], p[1], q[1], .045 * BED.f / z]; });
    BED.duvetTop = P(0, .7, 3.3)[1];
  }
  function bedPal(k, inks) {
    const I = inkSet(inks, 'pink'), m = blend(k);
    return { k, I, m, wall: m('#6F6A86', INK.night), wallDk: m('#5E5973', '#0E1330'), ceil: m('#625D78', '#0E1330'), floor: m('#544C5E', INK.ink), floorLt: m('#62596D', INK.nightLt),
      frame: m('#5B4A44', INK.ink), wood: m('#7A6458', INK.redDk), woodDk: m('#634F45', INK.ink), duvet: m('#E6E1EA', INK.paper), duvetDk: m('#C6BED0', I.b), pillow: m('#F0EDF2', INK.white), pillowDk: m('#D2CCDA', INK.pinkLt),
      rug: m('#8A5C6C', INK.redDk), petal: m('#C24A5E', INK.red), petal2: m('#DA8C9C', INK.pink), wax: m('#EFE7D8', INK.paper), flame: m('#FFD98A', INK.yellow), flameIn: m('#FFF4D6', INK.white),
      halo: m('#F2B36A', INK.orange), sky: m('#3E4A6E', INK.nightLt), moon: m('#F2EDD8', INK.paper), metal: m('#BDBFC1', INK.paperDk), black: m('#3E3D45', INK.ink), cold: m('#9CC4F0', INK.cyan) };
  }
  // bedroom(ctx, t, {k, inks, glow 0..1 (laptop lit: cold blue kills the candles), candles 0..1, laptop: (ctx, box, t) => .., petals, layer: 'back'|'front' | fg})
  // bedroom(ctx, t, {layer: 'back'}); person(ctx, ...BED.pillowL, 'dan', {view: 'bust'}); person(... BED.pillowR, 'sam' ...); bedroom(ctx, t, {layer: 'front'})
  function bedroom(ctx, t, o = {}) {
    const k = KOF(o), B = bedPal(k, o.inks), layer = o.layer || (o.fg ? 'front' : 'back');
    inLook(k, () => { ctx.save();
      if (layer !== 'front') bedBack(ctx, t, k, B, o);
      if (layer !== 'back') bedFront(ctx, t, k, B, o);
      ctx.restore(); });
  }
  function candle(ctx, t, [x, y, top, r], i, B, warm) {
    const fl = 1 + .18 * noise1(t * 9 + i * 3.1) + .08 * Math.sin(t * 31 + i), sway = noise1(t * 5 + i * 7) * r * .25, fh = r * 2.2 * fl, hy = top - fh * .4;
    if (warm > .02) {
      if (B.k < .5) { ctx.save(); for (const [rr, a] of [[7, .1], [4.6, .12], [2.6, .16]]) { ctx.globalAlpha = a * warm; fillPts(ctx, ell(x, hy, r * rr * fl, r * rr * fl * .85, 24), B.halo); } ctx.restore(); }
      else dotsIn(ctx, [x - r * 9, hy - r * 9, x + r * 9, hy + r * 9], { spacing: Math.max(6, r * .9), color: B.halo, k: (px, py) => (1 - Math.hypot(px - x, (py - hy) * 1.2) / (r * 8 * fl)) * 1.3 * warm });
    }
    ink(ctx, [[x - r, top], [x + r, top], [x + r, y], [x - r, y]], { fill: B.wax, shade: { color: B.pillowDk, spacing: Math.max(5, r * .6), dir: [1, 0], from: 0, to: r }, line: Math.max(1.2, r * .12), smooth: false, boil: .3 });
    fillPts(ctx, ell(x, top, r, r * .3, 12), B.pillowDk);
    const flame = [[x, top - r * .2], [x + r * .55, top - fh * .35], [x + sway, top - fh], [x - r * .55, top - fh * .35]];
    fillPts(ctx, flame, B.flame, true); fillPts(ctx, flame.map(([a, b]) => [x + (a - x) * .5, top + (b - top) * .55]), B.flameIn, true);
    inkLine(ctx, [[x, top], [x, top - r * .5]], Math.max(1, r * .12), INK.ink, { taper: [0, 0] });
  }
  function bedBack(ctx, t, k, B, o) {
    const P = BED.P, X = BED.X, z = BED.zFar, H = BED.H, m = B.m, warm = (o.candles ?? 1) * (1 - .85 * (o.glow ?? 0));
    fillPts(ctx, rect(-20, -20, 1960, 1120), B.ceil, false);
    const far = [P(-X, H, z), P(X, H, z), P(X, 0, z), P(-X, 0, z)];
    ink(ctx, far, { fill: B.wall, line: 2.5, smooth: false, seed: 1 });
    for (const sd of [-1, 1]) ink(ctx, [P(sd * X, H, .9), P(sd * X, H, z), P(sd * X, 0, z), P(sd * X, 0, .9)], { fill: B.wallDk, line: 2.5, smooth: false, seed: 2 + sd });
    fillPts(ctx, [P(-X, 0, .9), P(X, 0, .9), P(X, 0, z), P(-X, 0, z)], B.floor, false);
    ctx.beginPath(); for (let x = -X; x <= X; x += .18) { const a = P(x, 0, .9), b = P(x, 0, z); ctx.moveTo(...a); ctx.lineTo(...b); } ctx.strokeStyle = B.floorLt; ctx.lineWidth = 2; ctx.stroke();
    ink(ctx, [P(-1.6, 0, 1.6), P(1.6, 0, 1.6), P(1.6, 0, 2.9), P(-1.6, 0, 2.9)], { fill: B.rug, line: 2.5, smooth: false, seed: 3 });
    // window with the night sky, a print over the bed
    const wq = [P(-2.3, 2.1, z), P(-1.45, 2.1, z), P(-1.45, 1.0, z), P(-2.3, 1.0, z)];
    ink(ctx, wq, { fill: B.sky, line: 3, smooth: false, seed: 4 });
    { const c = qp(wq, .7, .25); fillPts(ctx, ell(c[0], c[1], 16, 16, 16), B.moon); fillPts(ctx, ell(c[0] + 6, c[1] - 3, 13, 13, 16), B.sky); }
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const c = qp(wq, hash(i * 3.1), hash(i * 7.7) * .8); ctx.rect(c[0], c[1], 3, 3); } ctx.fillStyle = B.moon; ctx.fill();
    { const a = qp(wq, .5, 0), b = qp(wq, .5, 1), c = qp(wq, 0, .5), d = qp(wq, 1, .5); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.moveTo(...c); ctx.lineTo(...d); ctx.strokeStyle = B.frame; ctx.lineWidth = 6; ctx.stroke(); }
    ink(ctx, [P(-.5, 2.0, z), P(.5, 2.0, z), P(.5, 1.45, z), P(-.5, 1.45, z)], { fill: m('#C9A9B4', INK.pink), line: 3, smooth: false, seed: 5 });
    { const c = qp([P(-.5, 2.0, z), P(.5, 2.0, z), P(.5, 1.45, z), P(-.5, 1.45, z)], .5, .5); fillPts(ctx, ell(c[0] - 20, c[1], 26, 26, 20), m('#E7D2C0', INK.yellow)); fillPts(ctx, ell(c[0] + 22, c[1] + 4, 22, 22, 20), m('#9C7A90', INK.red)); }
    // headboard, bed frame, mattress, pillows
    const hb = [P(-.92, 1.32, 3.84), P(.92, 1.32, 3.84), P(.92, .3, 3.84), P(-.92, .3, 3.84)];
    ink(ctx, rrect(hb[0][0], hb[0][1], hb[1][0] - hb[0][0], hb[2][1] - hb[0][1], 22), { fill: B.wood, shade: { color: B.woodDk, spacing: 14, dir: [0, 1], from: 0, to: 140 }, line: 3, smooth: false, seed: 6 });
    ink(ctx, [P(-.88, .58, 3.82), P(.88, .58, 3.82), P(.88, .58, BED.foot), P(-.88, .58, BED.foot)], { fill: B.pillow, line: 2.5, smooth: false, seed: 7 });
    for (const sd of [-1, 1]) { const c = P(sd * .4, .74, 3.56), w = .66 * BED.f / 3.56, hh = .26 * BED.f / 3.56;
      ink(ctx, rrect(c[0] - w / 2, c[1] - hh / 2, w, hh, hh * .45), { fill: B.pillow, shade: { color: B.pillowDk, spacing: 10, dir: [0, 1], from: 0, to: hh }, line: 2.5, seed: 8 + sd }); }
    // nightstands: candles left, laptop right
    for (const sd of [-1, 1]) { const tq = [P(sd * 1.05, .55, 3.85), P(sd * 1.55, .55, 3.85), P(sd * 1.55, .55, 3.4), P(sd * 1.05, .55, 3.4)], fr = [P(sd * 1.05, .55, 3.4), P(sd * 1.55, .55, 3.4), P(sd * 1.55, 0, 3.4), P(sd * 1.05, 0, 3.4)];
      ink(ctx, fr, { fill: B.wood, shade: { color: B.woodDk, spacing: 12, dir: [0, 1], from: 0, to: 80 }, line: 2.5, smooth: false, seed: 10 + sd }); ink(ctx, tq, { fill: B.woodDk, line: 2.5, smooth: false, seed: 12 + sd });
      const kn = qp(fr, .5, .35); fillPts(ctx, ell(kn[0], kn[1], 5, 5, 8), B.metal); }
    BED.candles.slice(0, 3).forEach((c, i) => candle(ctx, t, c, i, B, warm));
    const [lx, ly, lw, lh] = BED.laptop, glow = o.glow ?? 0;
    ink(ctx, rrect(lx - 5, ly - 5, lw + 10, lh + 10, 4), { fill: B.black, line: 2.2, smooth: false, seed: 14 });
    ctx.save(); clipPts(ctx, rect(lx, ly, lw, lh), false);
    if (typeof o.laptop === 'function') cb(o.laptop, ctx, BED.laptop.slice(), t);
    else if (glow > 0) { fillPts(ctx, rect(lx, ly, lw, lh), INK.teamsBg, false); const r = lh * .2; fillPts(ctx, ell(lx + lw / 2, ly + lh * .4, r, r, 16), m('#8BA1C9', INK.pinkLt)); fillPts(ctx, ell(lx + lw * .38, ly + lh * .8, lh * .1, lh * .1, 12), INK.msGreen); fillPts(ctx, ell(lx + lw * .62, ly + lh * .8, lh * .1, lh * .1, 12), INK.msRed); }
    else fillPts(ctx, rect(lx, ly, lw, lh), m('#2B2D33', INK.ink), false);
    ctx.restore();
    ink(ctx, [[lx - 8, ly + lh + 5], [lx + lw + 8, ly + lh + 5], [lx + lw + 16, ly + lh + 14], [lx - 16, ly + lh + 14]], { fill: B.metal, line: 2, smooth: false, seed: 15 });
    if (o.petals !== false) petals(ctx, B, [P(-1.7, 0, 2.2), P(1.7, 0, 2.2), P(1.7, 0, 3.1), P(-1.7, 0, 3.1)], 18, 20);
  }
  function petals(ctx, B, q, n, seed) {
    for (let i = 0; i < n; i++) { const c = qp(q, hash(seed + i * 1.7), hash(seed * 3 + i * 2.3)), r = 7 + hash(i + seed) * 5, a = hash(i * 5 + seed) * TAU;
      fillPts(ctx, xform([[0, -r * .2], [r * .7, -r * .8], [r * 1.1, 0], [r * .4, r * .7], [0, r * .9], [-r * .4, r * .7], [-r * 1.1, 0], [-r * .7, -r * .8]], c[0], c[1], 1, a).map(([x, y]) => [x, c[1] + (y - c[1]) * .55]), i % 3 ? B.petal : B.petal2, true); }
  }
  function bedFront(ctx, t, k, B, o) {
    const P = BED.P, glow = o.glow ?? 0, warm = (o.candles ?? 1) * (1 - .85 * glow);
    // the duvet: pulled up to the sleepers' chests, crumpled, draped over the foot of the bed
    const top = [], N = 11; for (let i = 0; i <= N; i++) { const u = i / N, X = lerp(-.98, .98, u), p = P(X, .65 + .035 * Math.sin(u * 9 + 1), 3.22 - .06 * Math.cos(u * 6) + (Math.abs(Math.abs(X) - .4) < .2 ? .05 : 0)); top.push(p); }
    const right = [P(1.0, .62, 2.8), P(.98, .52, 1.9), P(.96, .2, 1.72)], bottom = []; for (let i = N; i >= 0; i--) { const u = i / N; bottom.push(P(lerp(-.96, .96, u), .16 + .05 * Math.sin(u * 13), 1.7 - .03 * Math.sin(u * 7))); }
    const left = [P(-.96, .2, 1.72), P(-.98, .52, 1.9), P(-1.0, .62, 2.8)], duvet = [...top, ...right, ...bottom.slice(1, -1), ...left];
    ink(ctx, duvet, { fill: B.duvet, shade: { color: B.duvetDk, spacing: 18, dir: [0, 1], from: 60, to: 520, max: .8 }, line: 3, seed: 20 });
    const fold = (pts, w) => inkLine(ctx, pts.map(p => P(...p)), w, B.duvetDk, { taper: [.3, .3] });
    fold([[-.4, .66, 3.1], [-.35, .64, 2.6], [-.45, .61, 2.1]], 5); fold([[.4, .66, 3.1], [.45, .64, 2.5], [.38, .61, 2.05]], 5); fold([[-.05, .63, 2.9], [.08, .62, 2.4], [-.04, .6, 2.0]], 4);
    fold([[-.8, .55, 1.85], [-.6, .4, 1.75], [-.65, .25, 1.72]], 4); fold([[.2, .5, 1.8], [.3, .35, 1.74], [.25, .22, 1.72]], 4); fold([[.75, .55, 1.85], [.7, .38, 1.75]], 4);
    if (o.petals !== false) petals(ctx, B, [P(-.8, .64, 3.1), P(.8, .64, 3.1), P(.8, .6, 1.95), P(-.8, .6, 1.95)], 24, 7);
    BED.candles.slice(3).forEach((c, i) => candle(ctx, t, c, i + 3, B, warm));
    // the laptop's cold light kills the mood
    if (glow > 0) {
      const [lx, ly, lw, lh] = BED.laptop, cx = lx + lw / 2, cy = ly + lh / 2;
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .55 * glow; ctx.fillStyle = mix('#7E94C8', '#4A5BB0', k); ctx.fillRect(-20, -20, 1960, 1120); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (const [a, sp] of [[.14, 1], [.14, .55]]) { ctx.globalAlpha = a * glow; fillPts(ctx, [[cx, cy - lh * .4], [cx, cy + lh * .4], [cx - 900 * sp, 1100], [cx - 1500 * sp, 1100 - 800 * sp], [cx - 400 * sp, -20]], B.cold, false); }
      ctx.globalAlpha = .6 * glow; fillPts(ctx, ell(cx, cy, lw * 1.1, lh * 1.4, 24), B.cold); ctx.restore();
      if (k >= .5) { ctx.save(); ctx.globalAlpha = .6 * glow; dotsIn(ctx, [cx - 240, cy - 240, cx + 240, cy + 240], { spacing: 22, color: INK.cyan, k: (px, py) => (1 - Math.hypot(px - cx, py - cy) / 220) * .9 }); ctx.restore(); }
    }
  }

  // ---------- webcam backgrounds ----------
  // webcamBg(ctx, box, kind, seed, {k, t}): fills box (clipped). kinds: 'bookshelf' | 'kitchen' | 'plain' | 'bed' | 'car' | 'ceiling' |
  // 'blur' (Teams background blur) | 'stage' (riso, always printed) | 'cubicle' (Dan at his desk) | 'office' (Greg's window).
  const WB_WALLS = ['#D8D2C6', '#CBD3D5', '#DDD0C2', '#D3CCD8', '#D6D9CC'];
  function webcamBg(ctx, box, kind = 'plain', seed = 1, o = {}) {
    const [x, y, w, h] = box, k = kind === 'stage' ? 1 : KOF(o), m = blend(k), u = h / 100, Wd = w / u, t = o.t ?? BOIL_T, I = inkSet(o.inks || ['hot', 'cool', 'pink', 'fire'][seed % 4]);
    const R = (a, b, c, d) => rect(x + a * u, y + b * u, c * u, d * u), pt = (a, b) => [x + a * u, y + b * u], L = Math.max(1, .35 * u);
    const wall = m(WB_WALLS[seed % WB_WALLS.length], INK.paper), wallDk = m('#B9B0A2', INK.paperDk), wood = m('#B59A7C', I.b), woodDk = m('#93795E', I.bdk);
    const bookC = ['#7C8FA8', '#C08A6E', '#8FA88C', '#D1B36E', '#A88FB0', '#C9C2B4', '#6E7F8C'].map((c, i) => m(c, [I.a, INK.ink, I.b, INK.yellow, INK.paper][i % 5]));
    ctx.save(); clipPts(ctx, rect(x, y, w, h), false);
    inLook(k, () => {
      if (kind === 'blur') { blurBg(ctx, box, seed, k); return; }
      if (kind !== 'stage' && kind !== 'car' && kind !== 'ceiling') fillPts(ctx, rect(x, y, w, h), wall, false);
      if (kind === 'plain') {
        fillPts(ctx, R(Wd * .74, 0, Wd, 100), m(mix(WB_WALLS[seed % 5], '#000000', .08), INK.paperDk), false);
        fillPts(ctx, R(0, 90, Wd, 10), m('#EFEAE0', INK.white), false);
        ink(ctx, R(Wd * .1, 16, 30, 24), { fill: m('#EFEAE0', INK.white), line: L, smooth: false });
        fillPts(ctx, R(Wd * .1 + 3, 19, 24, 18), m(['#A9B5BF', '#C9B79D', '#B9A5B5'][seed % 3], I.a), false);
        ink(ctx, R(Wd * .62, 46, 5, 8), { fill: m('#F2EFE8', INK.white), line: L, smooth: false });
      } else if (kind === 'bookshelf') {
        const bx = Wd * (seed % 2 ? .05 : .38), bw = Wd * .57;
        ink(ctx, R(bx, -2, bw, 104), { fill: wood, line: L, smooth: false });
        for (const sy of [18, 46, 74, 102]) {
          fillPts(ctx, R(bx + 2, sy - 26, bw - 4, 26), woodDk, false);
          let bxx = bx + 3, i = 0; while (bxx < bx + bw - 6) { const hh = hash(seed * 7 + sy + i * 3.3), bwi = 2.4 + hash(seed + sy * 3 + i) * 2.4, bh = 15 + hh * 8;
            if (hash(seed * 5 + i + sy) < .12 && i) { ink(ctx, [pt(bxx, sy), pt(bxx + 3, sy), pt(bxx + 9, sy - bh + 2), pt(bxx + 6, sy - bh)], { fill: bookC[(i + seed) % 7], line: L * .8, smooth: false }); bxx += 9; }
            else { ink(ctx, R(bxx, sy - bh, bwi, bh), { fill: bookC[(i * 3 + seed) % 7], line: L * .8, smooth: false }); bxx += bwi + .3; }
            if (hash(seed * 11 + i + sy) < .07) { const px = bxx + 4; fillPts(ctx, rect(x + px * u, y + (sy - 7) * u, 7 * u, 7 * u), m('#C9B49A', I.a), false); for (let j = 0; j < 3; j++) fillPts(ctx, leafPts(x + (px + 3.5) * u, y + (sy - 7) * u, 9 * u, -Math.PI / 2 + (j - 1) * .6, 1), m(INK.plant, INK.ink), true); bxx += 12; }
            i++; }
          fillPts(ctx, R(bx, sy, bw, 2.2), wood, false);
        }
      } else if (kind === 'kitchen') {
        const cab = m(['#E9E6DE', '#C9D3C4', '#D9CFC2'][seed % 3], INK.paper), cabDk = m('#BDB6A8', I.adk);
        for (let i = 0; i < Wd / 26; i++) ink(ctx, R(i * 26 + 1, -2, 25, 30), { fill: cab, line: L, smooth: false });
        ctx.beginPath(); for (let r = 0; r < 5; r++) for (let c = -1; c < Wd / 9; c++) ctx.rect(x + (c * 9 + (r % 2) * 4.5) * u, y + (30 + r * 6.4) * u, 8.6 * u, 6 * u); ctx.fillStyle = m('#F2F0EA', INK.white); ctx.fill();
        fillPts(ctx, R(0, 62, Wd, 6), m('#9A9690', INK.ink), false); fillPts(ctx, R(0, 68, Wd, 40), cabDk, false);
        ink(ctx, R(Wd * .08, 33, 30, 26), { fill: m('#C9D6DE', I.c), line: L * 1.4, smooth: false });
        ink(ctx, [pt(Wd * .63, 62), pt(Wd * .63 + 12, 62), pt(Wd * .63 + 11, 50), pt(Wd * .63 + 1, 50)], { fill: m('#B9BCC0', INK.ink), line: L, smooth: false });
        ink(ctx, R(Wd - 34, -2, 36, 104), { fill: m('#E6E4DF', INK.white), line: L, smooth: false });
        for (let i = 0; i < 4; i++) fillPts(ctx, R(Wd - 30 + hash(seed + i) * 20, 20 + hash(seed * 3 + i) * 30, 5, 5), [I.a, I.b, I.c, INK.cyan][i], false);
        ink(ctx, R(Wd - 28, 54, 16, 13), { fill: INK.white, line: L * .6, smooth: false });
      } else if (kind === 'bed') {
        fillPts(ctx, R(0, 0, Wd, 100), m('#C9BFD0', INK.night), false);
        ctx.beginPath(); for (let i = 0; i < 16; i++) { const px = i * Wd / 15, py = 14 + Math.sin(i * .9) * 4 + (i % 2) * 2; ctx.moveTo(x + px * u + 1.5 * u, y + py * u); ctx.arc(x + px * u, y + py * u, 1.5 * u, 0, TAU); }
        inkLine(ctx, Array.from({ length: 16 }, (_, i) => pt(i * Wd / 15, 12 + Math.sin(i * .9) * 4 + (i % 2) * 2)), L, m('#5A5560', INK.ink), { taper: [0, 0] });
        ctx.fillStyle = m('#F7E3A8', INK.yellow); ctx.fill();
        ink(ctx, R(Wd * .62, 22, 26, 34), { fill: m('#B58CB5', INK.pink), line: L, smooth: false });
        ink(ctx, rrect(x - 4 * u, y + 40 * u, w + 8 * u, 70 * u, 10 * u), { fill: m('#A98FA8', I.adk), line: L });
        for (const [a, b, c] of [[Wd * .08, 48, 40], [Wd * .55, 50, 44]]) ink(ctx, rrect(x + a * u, y + b * u, c * u, 22 * u, 9 * u), { fill: m('#F0ECF2', INK.white), shade: { color: m('#D2CCDA', INK.pinkLt), spacing: 6 * u, dir: [0, 1], from: 0, to: 12 * u }, line: L });
        ink(ctx, [pt(-5, 80), pt(Wd * .3, 70), pt(Wd * .6, 78), pt(Wd + 5, 68), pt(Wd + 5, 105), pt(-5, 105)], { fill: m('#E9E1EC', INK.paper), line: L });
      } else if (kind === 'car') {
        fillPts(ctx, R(0, 0, Wd, 100), m('#4E5058', INK.ink), false);
        const win = [pt(Wd * .12, 8), pt(Wd * .88, 8), pt(Wd * .95, 48), pt(Wd * .05, 48)];
        fillPts(ctx, win, m('#C9D9E4', I.c), false);
        ctx.save(); clipPts(ctx, win, false); const off = mod(t * 60, 30), n0 = Math.floor(t * 2);
        for (let i = -1; i < Wd / 30 + 2; i++) { const tx = i * 30 - off + hash(i + n0) * 6; fillPts(ctx, ell(x + tx * u, y + 40 * u, 11 * u, 13 * u, 14), m('#7F9A7A', INK.ink)); fillPts(ctx, R(tx - 1, 40, 2, 10), m('#6E5A4A', INK.ink), false); }
        ctx.restore();
        ink(ctx, [pt(Wd * .02, 0), pt(Wd * .12, 0), pt(Wd * .05, 52), pt(-2, 60)], { fill: m('#5E616A', INK.ink), line: L, smooth: false });
        ink(ctx, [pt(Wd * .98, 0), pt(Wd * .88, 0), pt(Wd * .95, 52), pt(Wd + 2, 60)], { fill: m('#5E616A', INK.ink), line: L, smooth: false });
        ink(ctx, rrect(x + Wd * .33 * u, y + 40 * u, Wd * .34 * u, 70 * u, 14 * u), { fill: m('#6A6D76', I.adk), shade: { color: INK.ink, spacing: 5 * u, dir: [1, 0], from: 0, to: 20 * u }, line: L });
        ink(ctx, rrect(x + Wd * .4 * u, y + 30 * u, Wd * .2 * u, 14 * u, 6 * u), { fill: m('#6A6D76', I.adk), line: L });
        inkLine(ctx, [pt(Wd * .78, 0), pt(Wd * .6, 100)], 4 * u, m('#3A3B40', INK.ink), { taper: [0, 0] });
      } else if (kind === 'ceiling') {
        const vpx = Wd * .5;
        fillPts(ctx, R(0, 0, Wd, 100), m('#EEEBE4', INK.paper), false);
        const wl = [pt(-5, 100), pt(Wd + 5, 100), pt(Wd + 5, 86), pt(-5, 74)];
        fillPts(ctx, wl, m(WB_WALLS[seed % 5], INK.paperDk), false);
        ink(ctx, [pt(-5, 74), pt(Wd + 5, 86), pt(Wd + 5, 82), pt(-5, 69)], { fill: m('#F5F2EA', INK.white), line: L, smooth: false });
        ctx.beginPath(); for (let i = -6; i <= 6; i++) { const a = pt(vpx + i * 30, 100); ctx.moveTo(a[0], a[1]); const b = pt(vpx + (i * 30) * .3, -40); ctx.lineTo(b[0], b[1]); } ctx.strokeStyle = rgba(m('#D9D5CB', INK.paperDk), .6); ctx.lineWidth = L; ctx.stroke();
        ink(ctx, ell(x + Wd * .42 * u, y + 30 * u, 20 * u, 9 * u, 24), { fill: m('#F9F7F0', INK.white), shade: { color: m('#E2DED3', INK.yellow), spacing: 4 * u, dir: [0, 1], from: 0, to: 8 * u }, line: L });
        ink(ctx, ell(x + Wd * .8 * u, y + 18 * u, 5 * u, 2.2 * u, 16), { fill: m('#F2EFE8', INK.white), line: L });
        fillPts(ctx, ell(x + Wd * .8 * u + 2 * u, y + 18 * u, .8 * u, .8 * u, 8), Math.floor(t * 1.2) % 2 ? m('#C9544E', INK.red) : m('#6E6A66', INK.ink));
        inkLine(ctx, [pt(Wd * .03, 64), pt(Wd * .09, 70), pt(Wd * .05, 76)], L * .7, m('#B9B4AA', INK.ink), { taper: [0, 0] }); inkLine(ctx, [pt(Wd * .01, 70), pt(Wd * .1, 66)], L * .7, m('#B9B4AA', INK.ink), { taper: [0, 0] });
      } else if (kind === 'stage') {
        sunburst(ctx, x + w / 2, y + h * .4, I.a, I.b, t * .1 + seed, 16, Math.max(w, h) * 1.2);
        dotsIn(ctx, [x, y, x + w, y + h], { spacing: Math.max(8, 7 * u), color: INK.ink, k: (px, py) => clamp(Math.hypot((px - x - w / 2) / w, (py - y - h * .4) / h) * 2.2 - .5) });
        fillPts(ctx, R(0, 82, Wd, 20), INK.ink, false);
        for (let i = 0; i < 3; i++) { const e = Math.exp(-frac(beatAt(t) - i / 3) * 4); ctx.save(); ctx.globalAlpha = .4 + .6 * e; fillPts(ctx, rrect(x + (Wd * (.15 + i * .35) - 18) * u, y + 6 * u, 36 * u, 4 * u, 2 * u), i === 1 ? I.c : INK.white, false); ctx.restore(); }
      } else if (kind === 'cubicle') {
        const D = deskPal(k, o.inks);
        fillPts(ctx, R(0, 0, Wd, 22), D.wall, false); fillPts(ctx, R(Wd * .3, 0, Wd * .4, 6), D.light, false);
        fillPts(ctx, R(0, 22, Wd, 80), D.cube, false); fillPts(ctx, R(0, 18, Wd, 5), D.rail, false); fillPts(ctx, R(Wd * .68, 22, 2.2, 80), D.seam, false);
        ink(ctx, [pt(Wd * .08, 34), pt(Wd * .08 + 30, 35), pt(Wd * .08 + 30, 74), pt(Wd * .08, 73)], { fill: D.sheet, line: L, smooth: false });
        txt(ctx, 'MEMO', x + (Wd * .08 + 4) * u, y + 42 * u, { font: 'ui', weight: 900, size: 5.5 * u, color: D.ink });
        for (let i = 0; i < 5; i++) fillPts(ctx, R(Wd * .08 + 4, 47 + i * 5, 20 - (i % 2) * 6, 1.6), D.ink, false);
        stickyNote(ctx, x + Wd * .8 * u, y + 34 * u, 15 * u, .06, 'sync re:\nsync', D.yellow, D, 1);
      } else if (kind === 'office') {
        const G = gregPal(k); cityscape(ctx, box, t, G, seed);
        ctx.beginPath(); for (const fr of [.33, .66]) ctx.rect(x + w * fr - 1.2 * u, y, 2.4 * u, h); ctx.rect(x, y + h * .9, w, h * .1); ctx.fillStyle = G.frame; ctx.fill();
      }
    });
    ctx.restore();
  }
  // Teams background blur: a seeded room painted into a scratch layer, composited through a blur filter (the one diegetic blur)
  function blurBg(ctx, box, seed, k) {
    const m = ctx.getTransform(), c = pushLayer(), [x, y, w, h] = box, pad = h * .12; c.setTransform(m);
    webcamBg(c, [x - pad, y - pad, w + pad * 2, h + pad * 2], ['bookshelf', 'kitchen', 'plain'][seed % 3], seed + 1, { k });
    popLayer();
    const p0 = m.transformPoint(new DOMPoint(x - pad, y - pad)), p1 = m.transformPoint(new DOMPoint(x + w + pad, y + h + pad)), sx = Math.max(0, Math.min(p0.x, p1.x)), sy = Math.max(0, Math.min(p0.y, p1.y)), sw = Math.min(W, Math.max(p0.x, p1.x)) - sx, sh = Math.min(H, Math.max(p0.y, p1.y)) - sy;
    if (sw <= 0 || sh <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${Math.max(4, sh * .036)}px) brightness(1.06)`;
    ctx.drawImage(c.canvas, sx, sy, sw, sh, sx, sy, sw, sh); ctx.filter = 'none'; ctx.restore();
  }

  // ---------- the stage ----------
  const STAGE = {
    vp: [960, 330],                     // floor vanishing point
    backY: 610, lipY: 930,              // floor meets the back wall / front edge of the stage floor (lip face below it)
    dan: [960, 905, 42],                // front centre at the mic stand
    mic: [960, 566],                    // mic head (pass as micAt for hold: 'micstand')
    linda: [470, 880, 40],              // stage left, in front of the copier stack
    tasha: [1450, 880, 40],             // stage right, in front of the printer stack
    bob: [960, 438, 30],                // seated behind the kit on the riser (sit: 1)
    kit: [960, 444, 30],                // drumKit(ctx, ...STAGE.kit, t, o): ground point under the kick + s
    riser: [690, 444, 540, 196],        // riser front face x, top y, w, h (carpet tiles)
    backdrop: [560, 160, 800, 450],     // projector screen surface; chapters paint into it (backdrop: fn)
    banner: [430, 22, 1060, 104],       // OUT OF OFFICE banner
    ring: [960, 552, 94],               // ring light halo behind Dan's head
    wedges: [[520, 902], [770, 914], [1150, 914], [1400, 902]],  // monitor wedge front-bottom centres
    copier: [80, 296, 330, 336], printers: [1510, 296, 330, 336], // amp stacks (x, y, w, h)
    crowdY: 900,                        // top of the crowd's heads; crowd box = [0, crowdY - 40, 1920, 220]
  };
  function stagePal(k, inks) {
    const I = inkSet(inks, 'hot'), m = blend(k);
    return { k, I, m, ink: INK.ink, paper: INK.paper, wall: m('#B9B2C2', I.a), ray: m('#C9C2CF', I.b), dots: m('#8E879A', INK.ink),
      floorA: m(INK.carpet, INK.ink), floorB: m(INK.carpetDk, I.adk), tile: m('#6F7882', I.a), plastic: m('#D5D0C6', INK.paperDk), plasticDk: m('#B5AFA4', '#B9A88A'),
      grille: m('#3E3C44', INK.ink), grilleLt: m('#57555E', I.adk), cone: m('#2E2D33', INK.ink), metal: m('#BDBFC1', INK.paperDk), tape: m('#D9D4C8', I.c), cord: m('#E0A060', I.c) };
  }
  function stage(ctx, t, o = {}) {
    const k = KOF(o), P = stagePal(k, o.inks), layer = o.layer || (o.fg ? 'front' : 'back');
    inLook(k, () => { ctx.save();
      if (layer !== 'front') stageBack(ctx, t, k, P, o);
      if (layer !== 'back') stageFront(ctx, t, k, P, o);
      ctx.restore(); });
  }
  function banner(ctx, t, [x, y, w, h], P) {
    const sag = 10 + Math.sin(twos(t) * 2.3) * 2, top = u => y + Math.sin(u * Math.PI) * sag, n = 12;
    inkLine(ctx, [[-20, 6], [x + 20, top(.02)]], 4, INK.ink, { taper: [0, 0] }); inkLine(ctx, [[x + w - 20, top(.98)], [1940, 6]], 4, INK.ink, { taper: [0, 0] });
    const pts = []; for (let i = 0; i <= n; i++) pts.push([x + w * i / n, top(i / n)]); for (let i = n; i >= 0; i--) pts.push([x + w * i / n, top(i / n) + h + Math.sin(i * 1.7) * 2]);
    fillPts(ctx, pts.map(([a, b]) => [a + 10, b + 12]), INK.ink, false);
    ink(ctx, pts, { fill: INK.paper, shade: { color: rgba(INK.ink, .3), spacing: 16, dir: [0, 1], from: h * .2, to: h * 1.4 }, line: 5, smooth: false, seed: 81 });
    for (const u of [.015, .985]) ink(ctx, ell(x + w * u + (u < .5 ? 14 : -14), top(u) + 16, 7, 7, 10), { fill: INK.paperDk, line: 3, boil: .4 });
    ctx.save(); ctx.translate(x + w / 2, y + h * .66 + sag * .8); ctx.rotate(-.01);
    txt(ctx, 'OUT OF OFFICE', 0, 0, { font: 'display', weight: 900, stretch: -2, size: h * .78, align: 'center', color: P.I.a, stroke: { w: 10, color: INK.ink }, extrude: { dx: 7, dy: 8, color: INK.ink } });
    ctx.restore();
    txt(ctx, 'AUTO-REPLY: BACK NEVER', x + w - 34, y + h + sag + 26, { font: 'mono', weight: 800, size: 22, align: 'right', color: INK.ink, rot: -.01 });
  }
  function speaker(ctx, cx, cy, r, P, pump) {
    const rr = r * (1 + .04 * pump);
    ink(ctx, ell(cx, cy, r, r, 28), { fill: P.metal, line: 3, boil: .6 });
    ink(ctx, ell(cx, cy, rr * .86, rr * .86, 28), { fill: P.cone, shade: { color: P.I.adk, spacing: 9, dir: [-.6, -.8], from: -r * .2, to: r }, line: 2.5, boil: .6 });
    outline(ctx, ell(cx, cy, rr * .6, rr * .6, 24), 2, P.grilleLt);
    ink(ctx, ell(cx - r * .04, cy - r * .04, rr * .26, rr * .26, 18), { fill: P.plasticDk, line: 2.5, boil: .4 });
  }
  function copierAmp(ctx, t, [x, y, w, h], P, pump) {
    fillPts(ctx, rect(x + 14, y + 16, w, h), INK.ink, false);
    // scanner lid + document feeder
    ink(ctx, rect(x - 8, y, w + 16, 34), { fill: P.plasticDk, line: 4, smooth: false, seed: 90 });
    ink(ctx, rect(x + 30, y - 26, w * .55, 28), { fill: P.plastic, line: 3.5, smooth: false, seed: 91 });
    for (let i = 0; i < 4; i++) fillPts(ctx, rect(x + 44 + i * 3, y - 22 - i * 3, w * .5, 4), INK.white, false);
    // body
    ink(ctx, rect(x, y + 34, w, h - 34), { fill: P.plastic, shade: { color: rgba(INK.ink, .55), spacing: 14, dir: [.6, .8], from: 40, to: h }, line: 4, smooth: false, seed: 92 });
    // control panel with the LCD
    const cp = [x + w * .52, y + 44, w * .42, 58];
    ink(ctx, rect(...cp), { fill: P.plasticDk, line: 3, smooth: false, seed: 93 });
    const blinkOn = Math.floor(t * 2) % 2 === 0;
    fillPts(ctx, rect(cp[0] + 8, cp[1] + 8, cp[2] * .62, 26), blinkOn ? mix(INK.yellow, INK.paper, .3) : '#C9B85E', false);
    txt(ctx, 'PC LOAD LETTER', cp[0] + 12, cp[1] + 26, { font: 'mono', weight: 800, size: 11, color: INK.ink });
    fillPts(ctx, ell(cp[0] + cp[2] - 22, cp[1] + 22, 12, 12, 14), P.I.a);
    for (let i = 0; i < 4; i++) fillPts(ctx, rrect(cp[0] + 8 + i * 22, cp[1] + 40, 16, 10, 3), INK.ink, false);
    // grille cloth with four speakers (the "4x12")
    const g = [x + 16, y + 112, w - 32, h - 196];
    ink(ctx, rect(...g), { fill: P.grille, line: 3.5, smooth: false, seed: 94 });
    const sr = Math.min(g[2], g[3]) * .24;
    for (const [u, v] of [[.27, .28], [.73, .28], [.27, .74], [.73, .74]]) speaker(ctx, g[0] + g[2] * u, g[1] + g[3] * v, sr, P, pump);
    ink(ctx, rrect(g[0] + g[2] / 2 - 70, g[1] + g[3] * .5 - 15, 140, 30, 6), { fill: INK.paper, line: 3, smooth: false, seed: 95 });
    txt(ctx, 'OUT OF TONER', g[0] + g[2] / 2, g[1] + g[3] * .5 + 7, { font: 'display', weight: 900, stretch: -2, italic: true, size: 20, align: 'center', color: P.I.a });
    // paper trays + a sheet sticking out
    for (let i = 0; i < 2; i++) { const ty = y + h - 80 + i * 38; ink(ctx, rect(x + 10, ty, w - 20, 32), { fill: P.plastic, line: 3, smooth: false, seed: 96 + i }); fillPts(ctx, rrect(x + w / 2 - 40, ty + 12, 80, 9, 4), P.plasticDk, false); }
    ink(ctx, [[x - 34, y + 150], [x + 4, y + 146], [x + 4, y + 162], [x - 30, y + 170]], { fill: INK.white, line: 2.5, smooth: false, seed: 98 });
    ink(ctx, rect(x - 40, y + 158, 44, 10), { fill: P.plasticDk, line: 3, smooth: false, seed: 99 });
  }
  function printerAmp(ctx, t, [x, y, w, h], P, pump) {
    fillPts(ctx, rect(x + 14, y + 16, w, h), INK.ink, false);
    // the head: a laser printer with knobs
    const hy = y + 30, hh = 104;
    ink(ctx, rect(x + 30, y, w - 60, 34), { fill: P.plasticDk, line: 3.5, smooth: false, seed: 100 });
    for (let i = 0; i < 5; i++) fillPts(ctx, rect(x + 50 + i * 2, y + 6 - i * 4, w - 100, 4), INK.white, false);
    ink(ctx, rect(x, hy, w, hh), { fill: P.plastic, shade: { color: rgba(INK.ink, .5), spacing: 12, dir: [0, 1], from: 0, to: hh * 1.5 }, line: 4, smooth: false, seed: 101 });
    fillPts(ctx, rect(x + 20, hy + 18, w * .5, 30), INK.ink, false);
    txt(ctx, Math.floor(t * 1.5) % 2 ? 'PAPER JAM' : 'TRAY 2 EMPTY', x + 28, hy + 39, { font: 'mono', weight: 800, size: 13, color: P.I.c });
    for (let i = 0; i < 6; i++) { const kx = x + 34 + i * ((w - 68) / 5), ky = hy + 76; ink(ctx, ell(kx, ky, 12, 12, 14), { fill: INK.ink, line: 2, boil: .4 }); const a = -2.2 + hash(i * 3) * 2.6 + pump * .6; inkLine(ctx, [[kx, ky], [kx + Math.cos(a) * 10, ky + Math.sin(a) * 10]], 3, INK.paper, { taper: [0, 0] }); }
    fillPts(ctx, ell(x + w - 30, hy + 30, 8, 8, 10), Math.floor(t * 3) % 2 ? P.I.a : INK.ink);
    // the cab: two printers' worth of grille
    const cy = hy + hh + 8, ch = h - (cy - y);
    ink(ctx, rect(x, cy, w, ch), { fill: P.plasticDk, line: 4, smooth: false, seed: 102 });
    const g = [x + 16, cy + 14, w - 32, ch - 50];
    ink(ctx, rect(...g), { fill: P.grille, line: 3.5, smooth: false, seed: 103 });
    const sr = Math.min(g[2] / 2, g[3]) * .4;
    speaker(ctx, g[0] + g[2] * .27, g[1] + g[3] / 2, sr, P, pump); speaker(ctx, g[0] + g[2] * .73, g[1] + g[3] / 2, sr, P, pump);
    ink(ctx, rect(x + 12, y + h - 30, w - 24, 22), { fill: P.plastic, line: 3, smooth: false, seed: 104 });
    ink(ctx, [[x + w * .3, y + h - 30], [x + w * .7, y + h - 30], [x + w * .72, y + h - 10], [x + w * .28, y + h - 10]], { fill: INK.white, line: 2, smooth: false, seed: 105 });
  }
  function tubeLight(ctx, a, b, w, lit, P, glowC) {
    const L = dist(a, b), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(ang);
    if (lit > .05) dotsIn(ctx, [-w * 3, -w * 3.4, L + w * 3, w * 3.4], { spacing: 13, color: glowC, k: (x, y) => (1 - Math.abs(y) / (w * (1.2 + 2.2 * lit))) * 1.5 * lit * (x < 0 || x > L ? .4 : 1) });
    ink(ctx, rrect(0, -w / 2, L, w, w / 2), { fill: mix(P.metal, INK.white, lit), line: 2.5, smooth: false, boil: .6 });
    fillPts(ctx, rect(-6, -w * .7, 12, w * 1.4), INK.ink, false); fillPts(ctx, rect(L - 6, -w * .7, 12, w * 1.4), INK.ink, false);
    ctx.restore();
  }
  function ringLight(ctx, t, x, y, r, on, P, glowC) {
    if (on > .02) { const R = r * (1.5 + .4 * on); dotsIn(ctx, [x - R, y - R, x + R, y + R], { spacing: 14, color: glowC, k: (px, py) => { const d = Math.hypot(px - x, py - y) / r; return (d < 1 ? (1.25 - (1 - d)) * .9 : 1.5 - (d - 1) * 2.4) * on; } }); }
    ctx.save(); ctx.beginPath(); tracePath(ctx, ell(x, y, r, r, 40)); tracePath(ctx, ell(x, y, r * .78, r * .78, 40).reverse()); ctx.fillStyle = mix(P.metal, INK.white, on); ctx.fill('evenodd'); ctx.restore();
    outline(ctx, ell(x, y, r, r, 40), 3.5); outline(ctx, ell(x, y, r * .78, r * .78, 40), 3);
  }
  function stageFloor(ctx, P, o) {
    const vp = STAGE.vp, yb = STAGE.backY, yf = STAGE.lipY, rows = [];
    for (let j = 0; j < 9; j++) { const y = vp[1] + (yf - vp[1]) / (1 + j * .19); if (y < yb) { rows.push(yb); break; } rows.push(y); }
    const X = (i, y) => vp[0] + i * 170 * (y - vp[1]) / (yf - vp[1]);
    fillPts(ctx, rect(-20, yb, 1960, yf - yb), P.floorA, false);
    ctx.beginPath();
    for (let r = 0; r < rows.length - 1; r++) { const y0 = rows[r + 1], y1 = rows[r];
      for (let i = -9; i < 9; i++) { if (mod(i + r, 2)) continue; ctx.moveTo(X(i, y0), y0); ctx.lineTo(X(i + 1, y0), y0); ctx.lineTo(X(i + 1, y1), y1); ctx.lineTo(X(i, y1), y1); ctx.closePath(); } }
    ctx.fillStyle = P.floorB; ctx.fill();
    ctx.save(); clipPts(ctx, rect(-20, yb, 1960, yf - yb), false);
    dotsIn(ctx, [-20, yb, 1940, yf], { spacing: 20, color: rgba(P.I.a, .55), dir: [0, -1], c: [960, yf], from: 0, to: yf - yb, min: .05, max: .7 });
    ctx.restore();
  }
  function stageBack(ctx, t, k, P, o) {
    const I = P.I, beat = beatAt(t + VLEAD), env = pulse(t, 6), lights = o.lights ?? 1, strobe = o.strobe ?? .5, [bx, by, bw, bh] = STAGE.backdrop;
    const hits = o.hits || {}, pump = Math.max(hits.kick || 0, pulse(t, 9));
    // back wall: rotating sunburst + a shockwave ring of dots on each beat + halftone vignette
    sunburst(ctx, bx + bw / 2, by + bh / 2, P.wall, P.ray, (o.spin ?? .04) * t, o.rays || 22);
    const ringR = 200 + frac(beat) * 1300;
    ctx.save(); dotsIn(ctx, [-20, -20, 1940, STAGE.backY + 20], { spacing: 30, color: rgba(I.c, .9), k: (x, y) => { const d = Math.abs(Math.hypot(x - 960, (y - 385) * 1.2) - ringR); return (1 - d / 120) * 1.2 * (1 - frac(beat)) * lights; } }); ctx.restore();
    dotsIn(ctx, [-20, -20, 1940, STAGE.backY + 20], { spacing: 34, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 385) / 620) - .45) * 1.6) });
    // truss + hanging tubes + the projector screen
    fillPts(ctx, rect(-20, 128, 1960, 6), INK.ink, false); fillPts(ctx, rect(-20, 150, 1960, 6), INK.ink, false);
    ctx.beginPath(); for (let x = -20; x < 1940; x += 28) { ctx.moveTo(x, 131); ctx.lineTo(x + 14, 153); ctx.lineTo(x + 28, 131); } ctx.strokeStyle = INK.ink; ctx.lineWidth = 3; ctx.stroke();
    if (o.banner !== false) banner(ctx, t, STAGE.banner, P);
    const tubes = [[60, 1], [190, -1], [320, 1], [1600, -1], [1730, 1], [1860, -1]];
    tubes.forEach(([x, sd], i) => { const e = Math.exp(-frac(beat / 2 - i / tubes.length) * 5) * strobe, lit = clamp(.35 + .65 * Math.max(e, lights * .4));
      inkLine(ctx, [[x, 156], [x + sd * 6, 176]], 2.5, INK.ink, { taper: [0, 0] });
      tubeLight(ctx, [x - 54 + sd * 6, 186 + sd * 8], [x + 54 + sd * 6, 186 - sd * 8], 16, lit, P, i % 2 ? I.c : INK.white); });
    // screen case + surface
    ink(ctx, rrect(bx - 30, 140, bw + 60, 30, 12), { fill: INK.ink, line: 3, smooth: false, seed: 110 });
    fillPts(ctx, rect(bx - 12 + 12, by - 6 + 14, bw + 24, bh + 22), rgba(INK.ink, .9), false);
    ink(ctx, rect(bx - 12, by - 6, bw + 24, bh + 22), { fill: INK.ink, line: 3, smooth: false, seed: 111 });
    ctx.save(); clipPts(ctx, rect(bx, by, bw, bh), false);
    if (typeof o.backdrop === 'function') cb(o.backdrop, ctx, STAGE.backdrop.slice(), t); else defaultBackdrop(ctx, t, P, env);
    ctx.restore();
    ink(ctx, rrect(bx + bw / 2 - 24, by + bh + 14, 48, 12, 6), { fill: INK.paperDk, line: 2.5, smooth: false, seed: 112 });
    // vertical tube stands
    [[440, 0], [1480, 1]].forEach(([x, i]) => { const e = Math.exp(-frac(beat - i * .5) * 6) * strobe, lit = clamp(.3 + .7 * Math.max(e, lights * .35));
      inkLine(ctx, [[x - 30, 640], [x, 610], [x + 30, 640]], 5, INK.ink, { taper: [0, 0], smooth: false });
      tubeLight(ctx, [x, 610], [x, 290], 18, lit, P, i ? INK.white : I.c); });
    stageFloor(ctx, P, o);
    // light beams from the truss: printed light (halftone wedges), sweeping, brighter on the beat
    if (lights > 0) [[250, 1, 0], [700, -1, 1], [1220, 1, 2], [1670, -1, 3]].forEach(([x, sd, i]) => {
      const a = Math.PI / 2 - sd * (.3 + .2 * Math.sin(t * .9 + i * 1.7)), w = .085, L = 1000, e = lights * (.55 + .45 * Math.max(env, Math.exp(-frac(beat / 2 - i / 4) * 4) * strobe));
      const ca = Math.cos(a), sa = Math.sin(a), wedge = [[x - 12, 160], [x + 12, 160], [x + Math.cos(a - w) * L, 160 + Math.sin(a - w) * L], [x + Math.cos(a + w) * L, 160 + Math.sin(a + w) * L]];
      ctx.save(); ctx.globalAlpha = .18 * e; fillPts(ctx, wedge, INK.white, false); ctx.globalAlpha = 1; clipPts(ctx, wedge, false);
      dotsIn(ctx, bbox(wedge), { spacing: 15, color: i % 2 ? I.c : INK.white, k: (px, py) => (1 - ((px - x) * ca + (py - 160) * sa) / L) * .75 * e });
      ctx.restore(); });
    // gaffer tape marks, cords, the setlist (a meeting agenda)
    const tapeX = (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(1, .32); for (const r of [-.7, .7]) { ctx.save(); ctx.rotate(r); fillPts(ctx, rect(-s, -8, s * 2, 16), P.tape, false); ctx.restore(); } ctx.restore(); };
    tapeX(...STAGE.dan.slice(0, 2), 40); tapeX(STAGE.linda[0], STAGE.linda[1] - 6, 34); tapeX(STAGE.tasha[0], STAGE.tasha[1] - 6, 34);
    for (const [pts, w] of [[[[250, 640], [300, 760], [620, 800], [900, 900]], 7], [[[1660, 640], [1600, 780], [1300, 840], [1020, 905]], 7], [[[440, 640], [520, 720], [700, 700], [780, 760], [690, 860]], 5]]) inkLine(ctx, pts, w, P.cord, { taper: [0, 0], seed: pts[0][0] });
    ink(ctx, rrect(640, 846, 120, 22, 5), { fill: INK.ink, line: 2, smooth: false, seed: 113 });
    for (let i = 0; i < 4; i++) fillPts(ctx, rect(650 + i * 27, 852, 14, 10), P.I.a, false);
    ctx.save(); ctx.translate(1090, 880); ctx.transform(1, 0, -.35, .38, 0, 0); ctx.rotate(.08);
    fillPts(ctx, rect(-62 + 8, -80 + 8, 124, 160), rgba(INK.ink, .6), false); fillPts(ctx, rect(-62, -80, 124, 160), INK.white, false);
    txt(ctx, 'AGENDA', -48, -50, { font: 'display', weight: 900, size: 30, color: INK.ink });
    ['1. Intro', '2. This Could Have', '   Been a Text', '3. Circle Back', '4. Per My Last Email', '5. AOB'].forEach((s, i) => txt(ctx, s, -48, -20 + i * 18, { font: 'mono', weight: 800, size: 13, color: i === 1 || i === 2 ? I.a : INK.ink }));
    fillPts(ctx, rect(-70, -88, 40, 14), P.tape, false); fillPts(ctx, rect(36, 70, 40, 14), P.tape, false);
    ctx.restore();
    // amps
    copierAmp(ctx, t, STAGE.copier, P, pump); printerAmp(ctx, t, STAGE.printers, P, pump);
    // riser: carpet-tile front, kit on top
    const [rx, ry, rw, rh] = STAGE.riser;
    ink(ctx, [[rx + 20, ry - 26], [rx + rw - 20, ry - 26], [rx + rw, ry], [rx, ry]], { fill: P.floorB, line: 3.5, smooth: false, seed: 114 });
    ink(ctx, rect(rx, ry, rw, rh), { fill: P.floorA, line: 4, smooth: false, seed: 115 });
    ctx.beginPath(); const ts = rw / 6; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) ctx.rect(rx + i * ts, ry + j * rh / 3, ts, rh / 3); ctx.fillStyle = P.floorB; ctx.fill();
    ctx.save(); clipPts(ctx, rect(rx, ry, rw, rh), false); dotsIn(ctx, [rx, ry, rx + rw, ry + rh], { spacing: 16, color: rgba(INK.ink, .7), dir: [0, 1], from: -rh * .2, to: rh * .7, min: 0, max: .9 }); ctx.restore();
    fillPts(ctx, rect(rx, ry + 8, rw, 12), P.tape, false);
    if (o.kit !== false) {
      const kh = { ...hits };
      if (typeof o.drummer === 'function') { drumKit(ctx, ...STAGE.kit, t, { hits: kh, layer: 'back', k, inks: o.inks }); cb(o.drummer, ctx, t, t); drumKit(ctx, ...STAGE.kit, t, { hits: kh, layer: 'front', k, inks: o.inks }); }
      else drumKit(ctx, ...STAGE.kit, t, { hits: kh, layer: o.kit === 'back' ? 'back' : 'all', k, inks: o.inks });
    }
    // ring light behind Dan (on its stand), monitor wedges
    if (o.ring !== false) { const [x, y, r] = STAGE.ring, on = clamp((o.ring ?? 1) * (.55 + .45 * Math.max(env, lights * .5)));
      inkLine(ctx, [[x, y + r], [x, STAGE.dan[1] - 20]], 8, INK.ink, { taper: [0, 0], smooth: false });
      for (const sd of [-1, 0, 1]) inkLine(ctx, [[x, STAGE.dan[1] - 40], [x + sd * 46, STAGE.dan[1] + 2 - Math.abs(sd) * 4]], 6, INK.ink, { taper: [0, 0], smooth: false });
      ringLight(ctx, t, x, y, r, on, P, I.c); }
    STAGE.wedges.forEach(([x, y], i) => { const w = i % 3 ? 120 : 150, h = 58;
      fillPts(ctx, [[x - w / 2 + 10, y + 6], [x + w / 2 + 10, y + 6], [x + w / 2 - 4, y - h + 10], [x - w / 2 + 4, y - h + 10]], INK.ink, false);
      ink(ctx, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 14, y - h], [x - w / 2 + 14, y - h]], { fill: P.grille, shade: { color: INK.ink, spacing: 10, dir: [0, 1], from: 0, to: h }, line: 3.5, smooth: false, seed: 120 + i });
      ink(ctx, [[x - w / 2 + 12, y - 8], [x + w / 2 - 12, y - 8], [x + w / 2 - 22, y - h + 8], [x - w / 2 + 22, y - h + 8]], { fill: P.grilleLt, line: 2, smooth: false, seed: 124 + i }); });
  }
  function defaultBackdrop(ctx, t, P, env) {
    const [x, y, w, h] = STAGE.backdrop, cx = x + w / 2, cy = y + h / 2, I = P.I;
    fillPts(ctx, rect(x, y, w, h), INK.paper, false);
    dotsIn(ctx, [x, y, x + w, y + h], { spacing: 22, color: I.b, k: (px, py) => clamp(Math.hypot(px - cx, py - cy) / (w * .55) - .15) });
    const s = h * (.0034 + .0003 * env);
    ctx.save(); ctx.translate(cx, cy - h * .02); ctx.scale(s * 100, s * 100);
    for (let i = 1; i <= 3; i++) for (const a0 of [0, Math.PI]) { ctx.beginPath(); ctx.arc(0, -.35, .85 + i * .38, a0 - .6, a0 + .6); ctx.lineWidth = .16; ctx.strokeStyle = i === 3 ? I.a : INK.ink; ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.translate(cx, cy - h * .02); const u = h * .34 * (1 + .03 * env);
    ink(ctx, rrect(-u * .32, -u * .95, u * .64, u * 1.1, u * .32), { fill: I.a, shade: { color: I.adk, spacing: 12, dir: [1, 0], from: -u * .1, to: u * .4 }, line: 6, seed: 116 });
    inkLine(ctx, [[-u * .55, -u * .25], [-u * .52, u * .3], [0, u * .5], [u * .52, u * .3], [u * .55, -u * .25]], 12, INK.ink, { taper: [0, 0] });
    inkLine(ctx, [[0, u * .5], [0, u * .85]], 12, INK.ink, { taper: [0, 0], smooth: false }); inkLine(ctx, [[-u * .32, u * .85], [u * .32, u * .85]], 12, INK.ink, { taper: [0, 0], smooth: false });
    ctx.restore();
  }
  function stageFront(ctx, t, k, P, o) {
    const yf = STAGE.lipY, smoke = o.smoke ?? .5;
    if (smoke > 0) { ctx.save();
      for (let i = 0; i < 10; i++) { const x = mod(i * 240 + t * (30 + hash(i) * 40), 2400) - 240, y = STAGE.lipY - 18 - hash(i * 3) * 40, r = 110 + hash(i * 5) * 90;
        ctx.globalAlpha = .45 * smoke; const b = blob(x, y + Math.sin(t * .7 + i) * 6, r * (1 + .06 * Math.sin(t * .9 + i * 2)), i * 7, .14, 14, r * .32);
        fillPts(ctx, b, mix(INK.paper, P.I.b, .25), true);
        ctx.globalAlpha = .8 * smoke; ctx.save(); clipPts(ctx, b); dotsIn(ctx, [x - r * 1.2, y - r * .6, x + r * 1.2, y + r * .6], { spacing: 16, color: INK.white, dir: [0, -1], c: [x, y], from: -r * .2, to: r * .5, min: 0, max: .8 }); ctx.restore(); }
      ctx.restore(); }
    // lip: the stage front face
    ink(ctx, rect(-20, yf, 1960, 70), { fill: INK.ink, line: 0, smooth: false });
    fillPts(ctx, rect(-20, yf, 1960, 10), P.tape, false);
    if (o.crowd !== false) crowd(ctx, t, [0, STAGE.crowdY - 40, 1920, 220], typeof o.crowd === 'number' ? o.crowd : 90, { seed: o.seed || 3, jump: o.jump ?? .8, headbang: o.headbang ?? .5, inks: o.inks, k, style: 'silhouette', view: 'back', size: 34 });
  }

  // ---------- the drum kit ----------
  // drumKit(ctx, x, y, s, t, {layer: 'back'|'front'|'all', hits: {kick, snare, tom, crash, ride, hat} 0..1 decaying envelopes, k, inks, head})
  // (x, y) = ground point under the kick drum, s = the drummer's px per unit (Bob at s sits right behind it).
  // 'back' = floor tom, hi-hat, ride, crash + stands (drawn behind Bob); 'front' = kick (OUT OF OFFICE head), rack tom, snare.
  function drumKit(ctx, x, y, s, t, o = {}) {
    const k = KOF(o), m = blend(k), I = inkSet(o.inks, 'hot'), layer = o.layer || 'all', h = o.hits || {};
    const C = { shell: m('#7A8494', I.a), shellDk: m('#5E6774', I.adk), head: m('#F2F0EA', INK.white), hoop: m('#C9CBCD', INK.paperDk), hw: m('#A9ACB0', INK.ink),
      brass: m('#D7C08A', INK.yellow), brassDk: m('#B39C66', INK.orange) };
    inLook(k, () => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const L = w => w / s, cym = (cx, cy, r, tilt, v, f, seed) => {
        const a = tilt + v * Math.sin(t * f) * .22, sq = .22 + .1 * Math.abs(Math.sin(t * f * .5)) * v;
        const pts = ell(0, 0, r, r * sq, 28);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
        ink(ctx, pts, { fill: C.brass, shade: { color: C.brassDk, spacing: L(9), dir: [0, 1], from: -r * .05, to: r * .25 }, line: L(3), boil: L(.8), seed });
        fillPts(ctx, ell(0, -r * sq * .15, r * .14, r * sq * .4, 12), C.brassDk);
        if (v > .2 && k > .4) for (const sd of [-1, 1]) inkLine(ctx, [[sd * r * 1.08, -r * .3], [sd * r * 1.3, -r * .5]], L(4) * v, INK.ink, { taper: [.2, .6] });
        ctx.restore();
      };
      const stand = (pts, w = 3) => inkLine(ctx, pts, L(w), C.hw, { taper: [0, 0], smooth: false });
      const drum = (cx, cy, w, hgt, seed, flex = 0) => { // a cylinder seen slightly from above
        const ry = w * .16, top = cy - hgt / 2, bot = cy + hgt / 2;
        ink(ctx, [[cx - w / 2, top], [cx + w / 2, top], ...ell(cx, bot, w / 2, ry, 16).slice(0, 9)], { fill: C.shell, shade: { color: C.shellDk, spacing: L(9), dir: [1, 0], from: 0, to: w / 2 }, line: L(3), boil: L(.8), seed, smooth: false });
        ink(ctx, ell(cx, top, w / 2 * (1 + flex * .03), ry * (1 + flex * .6), 22), { fill: C.head, line: L(3), boil: L(.6), seed: seed + 1 });
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const lx = cx - w / 2 + w * (i + .5) / 6; ctx.rect(lx - L(3), top + hgt * .2, L(6), hgt * .55); } ctx.fillStyle = C.hoop; ctx.fill();
      };
      if (layer !== 'front') {
        stand([[-2.6, -1.8], [-2.9, 0], [-2.6, -1.8], [-2.2, 0]]); stand([[3.6, -5], [3.6, 0]]); stand([[3.6, 0], [3.2, .05], [4, .05]]);
        stand([[2.9, -7.3], [2.6, -3.5], [2.4, 0]]); stand([[-2.9, -6.6], [-2.5, -3.5], [-2.3, 0]]);
        drum(-2.6, -2.7, 2.1, 1.9, 130, h.tom || 0);
        cym(-2.9, -6.6, 1.65, -.12, h.ride || 0, 31, 131);
        const hat = h.hat || 0; cym(3.6, -5.15 - hat * .15, 1.15, .08, hat * .4, 40, 132); cym(3.6, -4.95, 1.15, .08, 0, 40, 133);
        cym(2.9, -7.4, 1.45, .2, h.crash || 0, 27, 134);
      }
      if (layer !== 'back') {
        stand([[2.1, -3.2], [2.1, 0]]); stand([[2.1, -1.2], [1.7, 0]]); stand([[2.1, -1.2], [2.5, 0]]);
        const sn = h.snare || 0; drum(2.1, -3.45 - sn * .06, 1.9, .75, 140, sn);
        const kk = h.kick || 0, kr = 1.75 * (1 + kk * .025), kc = -1.75 - kk * .05;
        for (const sd of [-1, 1]) stand([[sd * 1.4, kc + .6], [sd * 2.1, .02]], 4);
        ink(ctx, ell(0, kc, kr * 1.06, kr * 1.06, 40), { fill: C.shell, line: L(3.5), boil: L(.8), seed: 141 });
        ink(ctx, ell(0, kc, kr * .94, kr * .94, 40), { fill: C.head, shade: { color: rgba(INK.ink, .25), spacing: L(10), dir: [.5, .85], from: kr * .2, to: kr }, line: L(3), boil: L(.6), seed: 142 });
        ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.moveTo(Math.cos(a) * kr * .98 + L(4), kc + Math.sin(a) * kr * .98); ctx.arc(Math.cos(a) * kr * 1.0, kc + Math.sin(a) * kr * 1.0, L(4), 0, TAU); } ctx.fillStyle = C.hw; ctx.fill();
        // the OUT OF OFFICE head
        ctx.save(); ctx.translate(0, kc); ctx.scale(1 + kk * .04, 1 + kk * .04);
        outline(ctx, ell(0, 0, kr * .78, kr * .78, 36), L(4), m('#9A8FA8', I.a));
        txt(ctx, 'OUT OF', 0, -kr * .3, { font: 'display', weight: 900, stretch: -2, size: kr * .34, align: 'center', base: 'middle', color: INK.ink });
        txt(ctx, 'OFFICE', 0, kr * .1, { font: 'display', weight: 900, stretch: -2, size: kr * .56, align: 'center', base: 'middle', color: m('#8D6F9A', I.a), stroke: { w: L(5), color: INK.ink } });
        txt(ctx, '\u21A9 auto-reply', 0, kr * .5, { font: 'mono', weight: 800, size: kr * .14, align: 'center', base: 'middle', color: INK.ink });
        ctx.restore();
        stand([[.6, -3.5], [.9, -3.9]], 4);
        const tm = h.tom || 0; drum(.95, -4.4 - tm * .05, 1.6, 1.1, 143, tm);
      }
      ctx.restore(); });
  }

  // ---------- the crowd ----------
  const CR_SKIN = [['#F1C9AE', '#FF9CC2'], ['#D9A988', '#FF9A5C'], ['#B07A5A', '#C73A0E'], ['#8A5A40', '#9C0F24'], ['#E8BC9C', '#FFD23F']];
  const CR_HAIR = [['#3A302C', '#16121F'], ['#5E4A3E', '#16121F'], ['#8A6A4A', '#9C0F24'], ['#C9A86A', '#FFD23F'], ['#B9B6B8', '#F7EEDC'], ['#2A2426', '#16121F']];
  const CR_SHIRT = [['#C7D3DE', '#2B59FF'], ['#D9CFC2', '#F7EEDC'], ['#B9C4B0', '#19C6E6'], ['#D6C0C8', '#FF3D8B'], ['#A9B2C2', '#16121F'], ['#E3DCC8', '#FFD23F']];
  const CR_LANY = [['#5C7FA3', '#2B59FF'], ['#A3605C', '#E8203A'], ['#7A6A9A', '#8250DF'], ['#C49A4A', '#FF5A1F']];
  // crowd(ctx, t, box, n, {seed, jump 0..1, headbang 0..1, inks, k, style: 'silhouette'|'flat', view: 'back'|'front', phones 0..1, hands 0..1, rows})
  // n people in rows filling box (back rows small at the top, front rows big and cut off at the bottom). Batched by colour, so 300+ is cheap.
  function crowd(ctx, t, box, n, o = {}) {
    const k = KOF(o), [bx, by, bw, bh] = box, I = inkSet(o.inks, 'hot'), seed = o.seed || 1, sil = (o.style || (k >= .5 ? 'silhouette' : 'flat')) === 'silhouette', front = o.view === 'front';
    const rows = o.rows || Math.max(2, Math.round(Math.sqrt(n / 12))), beat = beatAt(t + VLEAD), jump = o.jump ?? .6, hb = o.headbang ?? .4, phones = o.phones ?? .12, hands = o.hands ?? .4;
    const s1 = o.size || bh * .07, s0 = s1 * (o.depth ?? .5), line = k < .5 ? INK.oline : INK.ink, rage = o.rage ?? k;
    const oval = (p, x, y, rx, ry) => { p.moveTo(x + rx, y); p.ellipse(x, y, rx, ry, 0, 0, TAU); };
    let id = 0;
    ctx.save(); ctx.lineJoin = 'round';
    for (let r = 0; r < rows * 2; r++) {
      // each row is drawn as two interleaved passes (even / odd people, the odd ones a step nearer) with fixed draw
      // layers so faces stay on their own heads; each layer is batched by colour
      const LY = [0, 1, 2, 3, 4, 5, 6].map(() => new Map()), RP = (l, c) => { let p = LY[l].get(c); if (!p) LY[l].set(c, p = new Path2D()); return p; };
      const row = r >> 1, odd = r & 1, f = rows === 1 ? 1 : row / (rows - 1), s = lerp(s0, s1, f), y = by + bh * lerp(.18, .82, f) + s * (2.4 + odd * .45), cnt = Math.max(1, Math.round(n * lerp(.75, 1.25, f) / rows));
      const tone = sil ? mix(mix(I.adk, INK.ink, .3), INK.ink, f) : null, rim = f > .5 ? I.c : I.b;
      for (let i = odd; i < cnt; i += 2) {
        id = row * 1000 + i;
        const h0 = hash(seed * 31 + id * 1.37), h1 = hash(seed * 7 + id * 2.11), h2 = hash(seed + id * 5.3), h3 = hash(seed * 3 + id * 7.9);
        const x = bx + bw * (i + .5 + (h0 - .5) * .6) / cnt, ph = h1 * 2, bt = beat + ph * .5, sz = .88 + h3 * .24;
        const hop = jump * Math.max(0, Math.sin(frac(bt) * Math.PI)) * (h2 > .3 ? 1 : .3) * s * 1.1, nod = hb * Math.max(0, Math.sin(frac(beat + h0 * .3) * TAU)) * s * .35;
        const cx = x, gy = y - hop + (h3 - .5) * s * .7, hr = s * (.92 + h1 * .2) * sz, hy = gy - s * 2.45 * sz + nod;
        const shW = s * (1.65 + h2 * .45), skin = CR_SKIN[Math.floor(h0 * 5)], hair = CR_HAIR[Math.floor(h1 * 6)], shirt = CR_SHIRT[Math.floor(h2 * 6)];
        const bodyC = sil ? tone : mix(shirt[0], shirt[1], k), skinC = sil ? tone : mix(skin[0], skin[1], k), hairC = sil ? tone : mix(hair[0], hair[1], k);
        const body = RP(1, bodyC); body.moveTo(cx - shW, gy + s * 3); body.lineTo(cx - shW, gy - s * .7); body.quadraticCurveTo(cx - shW, gy - s * 1.45, cx - shW * .45, gy - s * 1.5); body.lineTo(cx + shW * .45, gy - s * 1.5); body.quadraticCurveTo(cx + shW, gy - s * 1.45, cx + shW, gy - s * .7); body.lineTo(cx + shW, gy + s * 3); body.closePath();
        // arms: raised fists, horns or a phone (screen toward us when seen from behind)
        const up = h0 > 1 - hands, ph2 = h1 < phones, ps = h1 > .5 ? 1 : -1;
        if (up || ph2) for (const sd of (h2 > .55 && !ph2 ? [-1, 1] : [ps])) {
          const sx = cx + sd * shW * .75, sy = gy - s * .9, pump = Math.sin((beat + ph) * Math.PI) * .25 * jump, a = -Math.PI / 2 + sd * (.2 + h2 * .3) + pump * sd;
          const L = s * (2.5 + h0 * .6), ex = sx + Math.cos(a) * L, ey = sy + Math.sin(a) * L, nx = -Math.sin(a) * s * .28, ny = Math.cos(a) * s * .28;
          const arm = RP(0, sil ? tone : skinC); arm.moveTo(sx - nx * 1.3, sy - ny * 1.3); arm.lineTo(ex - nx, ey - ny); arm.lineTo(ex + nx, ey + ny); arm.lineTo(sx + nx * 1.3, sy + ny * 1.3); arm.closePath();
          arm.moveTo(ex + s * .4, ey); arm.arc(ex, ey, s * .4, 0, TAU);
          if (ph2) { const pw = s * .5, phh = s * .9; RP(0, sil ? tone : '#3A3840').rect(ex - pw / 2 - s * .07, ey - phh - s * .2, pw + s * .14, phh + s * .14); if (!front) RP(5, k >= .5 ? INK.white : '#E9EEF4').rect(ex - pw / 2, ey - phh - s * .13, pw, phh); }
          else if (h1 > .72 && rage > .5) { for (const q of [-1, 1]) { arm.moveTo(ex + q * s * .22, ey - s * .2); arm.lineTo(ex + q * s * .44, ey - s * .95); arm.lineTo(ex + q * s * .26, ey - s * 1.0); arm.lineTo(ex + q * s * .06, ey - s * .3); arm.closePath(); } }
        }
        // head + hair (styles: cap, side part, long, bald, bun)
        if (sil) oval(RP(1, rim), cx - s * .14, hy - s * .16, hr, hr * 1.12);
        oval(RP(2, front || sil ? skinC : hairC), cx, hy, hr, hr * 1.12);
        if (!sil) { const hs = Math.floor(h3 * 5);
          if (front) { const hp = RP(3, hairC), a0 = Math.PI + .3, a1 = TAU - .3, sd = hs === 1 ? -1 : 1;
            if (hs === 2) { hp.moveTo(cx - hr * 1.08, hy + hr * .9); hp.lineTo(cx - hr * 1.08, hy - hr * .3); hp.lineTo(cx + hr * 1.08, hy - hr * .3); hp.lineTo(cx + hr * 1.08, hy + hr * .9); hp.lineTo(cx + hr * .78, hy + hr * .9); hp.lineTo(cx + hr * .78, hy - hr * .1); hp.lineTo(cx - hr * .78, hy - hr * .1); hp.lineTo(cx - hr * .78, hy + hr * .9); hp.closePath(); }
            if (hs !== 3) { hp.moveTo(cx + Math.cos(a0) * hr * 1.04, hy + Math.sin(a0) * hr * 1.16); hp.ellipse(cx, hy, hr * 1.04, hr * 1.16, 0, a0, a1); hp.quadraticCurveTo(cx + sd * hr * .2, hy - hr * .2, cx + Math.cos(a0) * hr * 1.04, hy + Math.sin(a0) * hr * 1.16); }
            if (hs === 4) oval(hp, cx, hy - hr * 1.18, hr * .4, hr * .34); }
          else { const sk = RP(3, skinC); sk.rect(cx - hr * .38, hy + hr * .75, hr * .76, hr * .55); oval(sk, cx - hr * .98, hy + hr * .1, hr * .2, hr * .3); oval(sk, cx + hr * .98, hy + hr * .1, hr * .2, hr * .3); if (hs === 3) oval(sk, cx, hy, hr * .9, hr); } }
        // lanyard + badge, faces
        if (!sil) { const ly = gy - s * 1.45, lc = CR_LANY[id % 4], lan = RP(4, mix(lc[0], lc[1], k)), dd = front ? 1.6 : .5;
          lan.moveTo(cx - s * .45, ly); lan.lineTo(cx, ly + s * dd); lan.lineTo(cx + s * .45, ly); lan.lineTo(cx + s * .3, ly); lan.lineTo(cx, ly + s * (dd - .25)); lan.lineTo(cx - s * .3, ly); lan.closePath();
          if (front) { RP(4, k >= .5 ? INK.white : '#F4F2EC').rect(cx - s * .32, ly + s * 1.5, s * .64, s * .85);
            const ey = hy + hr * .12, fc = RP(5, k >= .5 ? INK.ink : '#2E2A33'); oval(fc, cx - hr * .34, ey, hr * .09, hr * .13); oval(fc, cx + hr * .34, ey, hr * .09, hr * .13);
            if (rage < .5) { const sm = RP(6, k >= .5 ? INK.ink : '#5A4A4A'); sm.moveTo(cx - hr * .24, hy + hr * .52); sm.quadraticCurveTo(cx, hy + hr * .72, cx + hr * .24, hy + hr * .52); }
            else oval(RP(5, INK.redDk), cx, hy + hr * .62, hr * .28, hr * (.12 + .3 * jump * Math.abs(Math.sin((beat + ph) * Math.PI)))); } }
      }
      LY.forEach((m, l) => { for (const [c, p] of m) {
        if (l === 6) { ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, s * .1); ctx.lineCap = 'round'; ctx.stroke(p); continue; }
        ctx.fillStyle = c; ctx.fill(p); if (!sil && l < 4 && f > .3) { ctx.strokeStyle = line; ctx.lineWidth = Math.max(1, s * (k < .5 ? .06 : .1)); ctx.stroke(p); } } });
    }
    ctx.restore();
  }

  // ---------- debug markers (look-dev only) ----------
  function mark(ctx, label, x, y, s, sit) {
    ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = '#00A8F0'; ctx.fillStyle = '#00A8F0'; ctx.lineWidth = 2;
    if (s) { ctx.setLineDash([10, 7]); const hgt = (sit ? 9.4 : 10) * s; ctx.strokeRect(x - 1.7 * s, y - hgt, 3.4 * s, hgt); ctx.setLineDash([]); }
    ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke();
    ctx.font = '700 20px "JetBrains Mono"'; ctx.fillText(label, x + 8, y - 8); ctx.restore();
  }
  function markBox(ctx, label, b) { ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = '#FF2BD0'; ctx.fillStyle = '#FF2BD0'; ctx.lineWidth = 2; ctx.setLineDash([10, 7]); ctx.strokeRect(b[0], b[1], b[2], b[3]); ctx.setLineDash([]); ctx.font = '700 18px "JetBrains Mono"'; ctx.fillText(label, b[0] + 4, b[1] - 6); ctx.restore(); }
  function ghost(ctx, x, y, s, who, pose) {
    if (typeof person === 'function') { try { return person(ctx, x, y, s, who, pose); } catch (e) { console.warn('person() failed: ' + e.message); } }
    ctx.save(); ctx.globalAlpha = .22; const sit = pose && pose.sit, top = y - (sit ? 9.4 : 10) * s;
    fillPts(ctx, rrect(x - 1.5 * s, top + 2.6 * s, 3 * s, (sit ? 4.4 : 7.4) * s, s), INK.ink, false);
    fillPts(ctx, ell(x, top + 1.3 * s, 1.1 * s, 1.35 * s, 20), INK.ink); ctx.restore();
  }

  // ---------- look-dev ----------
  LOOKS.desk = (ctx, t) => {
    look(0); officeDesk(ctx, t, { clock: clockSecs(8, 57, 12) + t });
    ghost(ctx, ...DESK.dan, 'dan', { sit: 1, turn: .45, hunch: .4, glare: 1 });
    officeDesk(ctx, t, { fg: true });
    mark(ctx, 'DESK.dan', ...DESK.dan, true); markBox(ctx, 'monitor', DESK.monitor); markBox(ctx, 'laptop', DESK.laptop);
    mark(ctx, 'webcam', ...DESK.webcam); mark(ctx, 'mug', ...DESK.mug); mark(ctx, 'papers', ...DESK.papers);
  };
  const deskAt = k => (c, t) => { look(k); officeDesk(c, t, { k, clock: clockSecs([8, 12, 15, 16][Math.round(k * 3)], [57, 1, 30, 59][Math.round(k * 3)]) }); ghost(c, ...DESK.dan, 'dan', { sit: 1, turn: .45, rage: k, wild: k, stage: k }); officeDesk(c, t, { k, fg: true }); look(1); };
  LOOKS.bleed = (ctx, t) => panels(ctx, t, [{ r: [0, 0, 960, 540], fn: deskAt(0) }, { r: [960, 0, 960, 540], fn: deskAt(1 / 3) }, { r: [0, 540, 960, 540], fn: deskAt(2 / 3) }, { r: [960, 540, 960, 540], fn: deskAt(1) }], { gutter: INK.ink, border: 4 });
  LOOKS.perf_desk = (ctx, t) => { const k = clamp(t); look(k); officeDesk(ctx, 3, { k }); officeDesk(ctx, 3, { k, fg: true }); };
  LOOKS.desk_k = (ctx, t) => { const k = clamp(t); look(k); officeDesk(ctx, 3, { k }); ghost(ctx, ...DESK.dan, 'dan', { sit: 1, turn: .45 }); officeDesk(ctx, 3, { k, fg: true }); };
  LOOKS.openplan = (ctx, t) => {
    look(0); openPlan(ctx, t, { clock: clockSecs(8, 58) + t });
    const [x, y, s] = OPEN.at(4.2); ghost(ctx, x, y, s, 'dan', { legs: 'walk', phase: frac(t * .9), hunch: .5, glare: 1 });
    mark(ctx, 'OPEN.at(4.2)', x, y, s); const [fx, fy, fs] = OPEN.walk[1]; mark(ctx, 'OPEN.walk[1]', fx, fy, fs);
    markBox(ctx, 'OPEN.clock', [OPEN.clock[0] - OPEN.clock[2], OPEN.clock[1] - OPEN.clock[2], OPEN.clock[2] * 2, OPEN.clock[2] * 2]);
  };
  LOOKS.openplan_k = (ctx, t) => { const k = clamp(t); look(k); openPlan(ctx, 2, { k, stare: k > .9 ? 1 : 0 }); };
  LOOKS.conf = (ctx, t) => {
    look(0); confRoom(ctx, t);
    CONF.seats.forEach(([x, y, s, turn], i) => ghost(ctx, x, y, s, i + 11, { sit: 1, turn, hunch: .3, glare: i % 3 === 0 ? 1 : 0, t: twos(t) }));
    confRoom(ctx, t, { fg: true });
    CONF.seats.forEach(([x, y, s], i) => mark(ctx, 'seat ' + i, x, y, s, true)); markBox(ctx, 'CONF.screen', CONF.screen);
    for (const [n, v] of Object.entries(CONF.band)) if (n !== 'kit') mark(ctx, 'band.' + n, ...v);
  };
  LOOKS.conf_final = (ctx, t) => {
    look(1); confRoom(ctx, t, { k: 1, inks: 'all' });
    confRoom(ctx, t, { k: 1, fg: true, inks: 'all' });
    const B = CONF.band, tc = twos(t);
    drumKit(ctx, ...B.kit, t, { layer: 'back', hits: bandHits(t) }); ghost(ctx, ...B.bob, 'bob', { sit: 1, hold: 'sticks', hits: { l: frac(beatAt(t)), r: frac(beatAt(t) + .5) }, t: tc }); drumKit(ctx, ...B.kit, t, { layer: 'front', hits: bandHits(t) });
    ghost(ctx, ...B.linda, 'linda', { hold: 'guitar', legs: 'wide', t: tc }); ghost(ctx, ...B.tasha, 'tasha', { hold: 'bass', legs: 'wide', t: tc });
    ghost(ctx, ...B.dan, 'dan', { hold: 'mic', rage: 1, wild: 1, stage: 1, legs: 'wide', armL: { a: 150, e: 10 }, handL: 'horns', t: tc });
  };
  LOOKS.greg_office = (ctx, t) => {
    look(0); gregOffice(ctx, t);
    ghost(ctx, ...GREGOFF.greg, 'greg', { mouth: 'talk', open: .5, armR: { a: 40, e: 60 }, handR: 'gun', t: twos(t) });
    gregOffice(ctx, t, { fg: true });
    mark(ctx, 'GREGOFF.greg', ...GREGOFF.greg); markBox(ctx, 'screen', GREGOFF.screen); markBox(ctx, 'laptop', GREGOFF.laptop); mark(ctx, 'webcam', ...GREGOFF.webcam);
    markBox(ctx, 'poster', GREGOFF.poster); markBox(ctx, 'window', GREGOFF.window);
  };
  LOOKS.greg_k = (ctx, t) => { const k = clamp(t); look(k); gregOffice(ctx, 2, { k }); ghost(ctx, ...GREGOFF.greg, 'greg', { mouth: 'talk', open: .5 }); gregOffice(ctx, 2, { k, fg: true }); };
  const bedScene = (k, glow) => (c, t) => { look(k); bedroom(c, t, { k, glow, layer: 'back' });
    ghost(c, ...BED.pillowL, 'dan', { view: 'bust', eyes: glow ? 'wide' : 'closed', mouth: glow ? 'flat' : 'smile', tilt: 8, t: twos(t) });
    ghost(c, ...BED.pillowR, 'sam', { view: 'bust', eyes: glow ? 'side' : 'closed', lx: glow ? 1 : 0, mouth: glow ? 'flat' : 'smile', tilt: -8, t: twos(t) });
    bedroom(c, t, { k, glow, layer: 'front' }); look(1); };
  LOOKS.bedroom = (ctx, t) => panels(ctx, t, [{ r: [0, 0, 960, 540], fn: bedScene(0, 0) }, { r: [960, 0, 960, 540], fn: bedScene(0, 1) }, { r: [0, 540, 960, 540], fn: bedScene(.6, 0) }, { r: [960, 540, 960, 540], fn: bedScene(.6, 1) }], { gutter: INK.ink, border: 4 });
  LOOKS.bedroom_full = (ctx, t) => { bedScene(.6, clamp(t - 1))(ctx, t); mark(ctx, 'BED.pillowL', ...BED.pillowL); mark(ctx, 'BED.pillowR', ...BED.pillowR); markBox(ctx, 'BED.laptop', BED.laptop); };
  const WB_KINDS = ['bookshelf', 'kitchen', 'plain', 'bed', 'car', 'ceiling', 'blur', 'stage', 'cubicle', 'office'];
  LOOKS.webcambgs = (ctx, t) => {
    look(0); fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    WB_KINDS.forEach((kind, i) => { const c = i % 4, r = Math.floor(i / 4), bw = 456, bh = 256, bx = 24 + c * (bw + 16), by = 30 + r * (bh + 92), box = [bx, by, bw, bh];
      webcamBg(ctx, box, kind, i + 1, { t });
      if (typeof person === 'function' && kind !== 'ceiling') { const who = ['linda', 'bob', 'dan', 'tasha', 7, 'linda', 8, 'tasha', 'dan', 'greg'][i]; const F = typeof bustFit === 'function' ? bustFit(box, who) : null; if (F) { look(kind === 'stage' ? 1 : 0); ctx.save(); clipPts(ctx, rect(...box), false); ghost(ctx, F.x, F.y, F.s, who, { view: 'bust', t: twos(t), rage: kind === 'stage' ? 1 : 0 }); ctx.restore(); look(0); } }
      txt(ctx, kind, bx + 8, by + bh + 34, { font: 'mono', weight: 800, size: 26, color: '#DDDDDD' }); });
    webcamBg(ctx, [24 + 2 * 472, 30 + 2 * 348, 456, 256], 'plain', 3, { k: 1, t }); txt(ctx, "plain, k = 1", 24 + 2 * 472 + 8, 30 + 2 * 348 + 256 + 34, { font: 'mono', weight: 800, size: 26, color: '#DDDDDD' });
    webcamBg(ctx, [24 + 3 * 472, 30 + 2 * 348, 456, 256], 'bookshelf', 4, { k: 1, t }); txt(ctx, "bookshelf, k = 1", 24 + 3 * 472 + 8, 30 + 2 * 348 + 256 + 34, { font: 'mono', weight: 800, size: 26, color: '#DDDDDD' });
  };
  LOOKS.perf_webcam = (ctx, t) => { look(0); WB_KINDS.forEach((kind, i) => webcamBg(ctx, [(i % 4) * 480, Math.floor(i / 4) * 360, 480, 270], kind, i + 1, { t })); };
  const bandHits = t => ({ kick: pulse(t, 9), snare: pulse(t, 9, 2), tom: 0, crash: hit(t, [beatTime(Math.floor(beatAt(t) / 4) * 4)], 3), hat: pulse(t, 12, .5) });
  function band(ctx, t, o = {}) {
    const tc = twos(t), b = beatAt(t + VLEAD);
    ghost(ctx, ...STAGE.linda, 'linda', { hold: 'guitar', strum: frac(b), fret: .4, legs: 'wide', lean: -6 + 4 * Math.sin(b * Math.PI), t: tc });
    ghost(ctx, ...STAGE.tasha, 'tasha', { hold: 'bass', strum: frac(b * .5), fret: .5, legs: 'wide', t: tc });
    ghost(ctx, ...STAGE.dan, 'dan', { hold: 'micstand', micAt: STAGE.mic, rage: 1, stage: 1, wild: 1, legs: 'wide', lean: 4, t: tc });
    if (o.marks) { mark(ctx, 'STAGE.linda', ...STAGE.linda); mark(ctx, 'STAGE.tasha', ...STAGE.tasha); mark(ctx, 'STAGE.dan', ...STAGE.dan); mark(ctx, 'mic', ...STAGE.mic); mark(ctx, 'STAGE.bob', ...STAGE.bob, true); markBox(ctx, 'STAGE.backdrop', STAGE.backdrop); }
  }
  const drummer = (ctx, t) => ghost(ctx, ...STAGE.bob, 'bob', { sit: 1, hold: 'sticks', hits: { l: frac(beatAt(t)), r: frac(beatAt(t) + .5) }, t: twos(t) });
  LOOKS.stage = (ctx, t) => {
    look(1); stage(ctx, t, { hits: bandHits(t), drummer, inks: 'hot' });
    band(ctx, t, { marks: true }); stage(ctx, t, { fg: true });
    ctx.save(); ctx.strokeStyle = '#00A8F0'; ctx.globalAlpha = .7; ctx.setLineDash([10, 7]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, STAGE.crowdY); ctx.lineTo(W, STAGE.crowdY); ctx.stroke(); ctx.restore();
  };
  LOOKS.stage_cool = (ctx, t) => { look(1); stage(ctx, t, { hits: bandHits(t), drummer, inks: 'cool', strobe: 1 }); band(ctx, t); stage(ctx, t, { fg: true, inks: 'cool' }); };
  LOOKS.stage_empty = (ctx, t) => { look(1); stage(ctx, t, { inks: t < 1 ? 'hot' : t < 2 ? 'cool' : t < 3 ? 'orange' : 'fire' }); stage(ctx, t, { fg: true, inks: t < 1 ? 'hot' : t < 2 ? 'cool' : t < 3 ? 'orange' : 'fire', crowd: 140 }); };
  LOOKS.kit = (ctx, t) => {
    look(1); sunburst(ctx, 960, 400, INK.red, INK.pink, t * .05, 20);
    dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 400) / 620) - .45) * 1.6) });
    fillPts(ctx, rect(0, 940, W, 140), INK.ink, false);
    const h = { kick: pulse(t, 8), snare: pulse(t, 8, 2), tom: hit(t, [.5, 1.5], 6), crash: hit(t, [0, 1.6], 3), ride: pulse(t, 5, 4), hat: pulse(t, 12, .5) };
    drumKit(ctx, 520, 940, 62, t, { layer: 'all', hits: h });
    drumKit(ctx, 1420, 940, 62, t, { layer: 'back', hits: h });
    ghost(ctx, 1420, 920, 62, 'bob', { sit: 1, hold: 'sticks', hits: { l: frac(beatAt(t)), r: frac(beatAt(t) + .5) }, t: twos(t) });
    drumKit(ctx, 1420, 940, 62, t, { layer: 'front', hits: h });
    txt(ctx, "layer 'all'", 520, 1020, { font: 'mono', weight: 800, size: 30, color: INK.paper, align: 'center' }); txt(ctx, "'back' + Bob + 'front'", 1420, 1020, { font: 'mono', weight: 800, size: 30, color: INK.paper, align: 'center' });
  };
  if (LOOKS.crowd) LOOKS.crowd_rig = LOOKS.crowd; // human.js registered its crowdPerson look-dev under this name first
  LOOKS.crowd = (ctx, t) => {
    look(1); sunburst(ctx, 960, 200, INK.red, INK.pink, .1, 20);
    crowd(ctx, t, [0, 120, 1920, 460], 160, { seed: 2, view: 'front', style: 'flat', k: 1, jump: .9 });
    fillPts(ctx, rect(0, 560, W, 520), INK.yellow, false);
    crowd(ctx, t, [0, 600, 1920, 480], 300, { seed: 5, view: 'back', style: 'silhouette', jump: .8, inks: 'hot' });
  };
  LOOKS.crowd_office = (ctx, t) => { look(0); fillPts(ctx, rect(0, 0, W, H), INK.wall, false); crowd(ctx, t, [0, 200, 1920, 880], 300, { seed: 9, view: 'front', style: 'flat', k: 0, jump: .1, headbang: .1, hands: .05, phones: .05 }); };
  const zoomLook = (name, x, y, z) => (ctx, t) => { cam(ctx, x, y, z); LOOKS[name](ctx, t); ctx.restore(); };
  LOOKS.z_crowd = zoomLook('crowd_office', 400, 900, 3);
  LOOKS.desk_clean = (ctx, t) => { look(0); officeDesk(ctx, t, { clock: clockSecs(8, 57, 12) + t }); ghost(ctx, ...DESK.dan, 'dan', { sit: 1, turn: .45, hunch: .4, glare: 1 }); };
  LOOKS.desk1_clean = (ctx, t) => { look(1); officeDesk(ctx, t, { k: 1, clock: clockSecs(16, 59, 12) + t }); ghost(ctx, ...DESK.dan, 'dan', { sit: 1, turn: .45, rage: 1, wild: 1, stage: 1 }); officeDesk(ctx, t, { k: 1, fg: true }); };
  LOOKS.z_desk_clock = zoomLook('desk_clean', 960, 250, 3);
  LOOKS.z_desk_monitor = zoomLook('desk_clean', 1180, 560, 2.6);
  LOOKS.z_desk_left = zoomLook('desk_clean', 470, 560, 2.4);
  LOOKS.z_desk1 = zoomLook('desk1_clean', 1000, 520, 2);
  LOOKS.perf_crowd = (ctx, t) => { look(1); crowd(ctx, t, [0, 200, 1920, 880], 300, { seed: 5, view: 'back', style: 'silhouette' }); };
  LOOKS.perf_crowd_flat = (ctx, t) => { look(1); crowd(ctx, t, [0, 200, 1920, 880], 300, { seed: 5, view: 'front', style: 'flat' }); };
  LOOKS.perf_stage = (ctx, t) => { look(1); stage(ctx, t, { hits: bandHits(t) }); stage(ctx, t, { fg: true }); };
  LOOKS.perf_openplan = (ctx, t) => { const k = t > .5 ? 1 : 0; look(k); openPlan(ctx, t, { k }); };
  LOOKS.perf_conf = (ctx, t) => { const k = t > .5 ? 1 : 0; look(k); confRoom(ctx, t, { k }); confRoom(ctx, t, { k, fg: true }); };
  LOOKS.perf_greg = (ctx, t) => { const k = t > .5 ? 1 : 0; look(k); gregOffice(ctx, t, { k }); gregOffice(ctx, t, { k, fg: true }); };
  LOOKS.perf_bed = (ctx, t) => { const k = t > .5 ? .6 : 0; look(k); bedroom(ctx, t, { k, glow: 1, layer: 'back' }); bedroom(ctx, t, { k, glow: 1, layer: 'front' }); };
  LOOKS.perf_kit = (ctx, t) => { look(1); drumKit(ctx, 960, 900, 60, t, { hits: bandHits(t) }); };
  LOOKS.clocks = (ctx, t) => { look(0); fillPts(ctx, rect(0, 0, W, H), INK.wall, false); [[8, 57], [12, 1], [15, 30], [16, 59], [17, 1]].forEach(([h, m], i) => { wallClock(ctx, 200 + i * 380, 300, 160, clockSecs(h, m, 20), { k: 0 }); wallClock(ctx, 200 + i * 380, 780, 160, clockSecs(h, m, 40) + t, { k: 1 }); }); };

  Object.assign(window, { officeDesk, DESK, openPlan, OPEN, cubeHead, confRoom, CONF, gregOffice, GREGOFF, bedroom, BED, webcamBg, stage, STAGE, drumKit, crowd, wallClock, fluoro, sunburst, STAGE_INKS: INKSETS, stageInks: inkSet });
})();
