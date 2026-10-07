// c05_post.js: post-chorus 76.80-92.30. "Oh-oh-oh-oh, another ...": calls invade Dan's life (shower, treadmill,
// bedroom, beach), the band chants "OH" in 3-5 frame stage inserts on the snares, then Linda's deadpan solo.
(() => {
const KH = .6;                                            // home locations print in the bleed look
const HB = [150, 30, 1620, 232];                          // the "another ..." slab: one row across the top
const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
const pk = pair => mix(pair[0], pair[1], STYLE.k);        // a cast palette pair at the current look
const fillA = (ctx, pts, c, a, sm = false) => { ctx.save(); ctx.globalAlpha *= a; fillPts(ctx, pts, c, sm); ctx.restore(); };
const ui = (ctx, s, x, y, size, color, weight = 700, o = {}) => txt(ctx, s, x, y, { font: 'ui', weight, size, color, ...o });
const early = x => x - 1 / 24;                            // in-shot hits land one frame early (the sync law)

// Dan off duty: the lanyard never comes off
const DAN_BARE = { ...CAST.dan, top: 'bare', tie: false, watch: false };
const DAN_GYM = { ...CAST.dan, top: 'tee', sleeve: 'short', tie: false, bottom: 'shorts', belt: false, shoes: 'sneaker' };
const DAN_BEACH = { ...CAST.dan, tie: false, bottom: 'shorts', belt: false, shoes: 'flat' };
const bareCol = () => ({ top: pk(CAST.dan.pal.skin), topDk: pk(CAST.dan.pal.skinDk) });

// ---------- shared bits ----------
function phoneDev(ctx, [x, y, w, h], scr, o = {}) {
  const r = w * .15;
  fillA(ctx, rrect(x + 16, y + 20, w, h, r), INK.ink, .3);
  ink(ctx, rrect(x, y, w, h, r), { fill: mix('#2A2A30', INK.ink, STYLE.k), line: 4, smooth: false, boil: .4, seed: 7 });
  const sb = [x + w * .045, y + w * .045, w * .91, h - w * .09];
  ctx.save(); clipPts(ctx, rrect(...sb, r * .78), false); scr(ctx, sb); ctx.restore();
  fillPts(ctx, rrect(x + w / 2 - w * .15, y + w * .08, w * .3, w * .085, w * .04), INK.ink, false);
  if (o.wet) for (let i = 0; i < 9; i++) { const dx = sb[0] + hash(i * 3.1) * sb[2], dy = sb[1] + hash(i * 7.7) * sb[3], r2 = 4 + hash(i) * 7; ink(ctx, ell(dx, dy, r2, r2 * 1.2, 10), { fill: rgba(INK.white, .5), line: 1.5, lineColor: rgba(INK.white, .9), boil: .3 }); }
}
function roundBtn(ctx, cx, cy, r, fill, ic, press = 0) {
  const s = 1 - .14 * Math.sin(clamp(press) * Math.PI);
  ink(ctx, ell(cx, cy, r * s, r * s, 28), { fill, line: 2.5, boil: .3 });
  appIcon(ctx, ic, cx, cy, r * 1.05 * s, INK.white);
}
// Teams mobile incoming call; o.press = song time the green audio-only button is tapped
function teamsRing(c, [x, y, w, h], t, o) {
  const u = w / 100, pressed = t >= o.press + .12;
  fillPts(c, rect(x, y, w, h), mix('#24233A', INK.night, STYLE.k * .5), false);
  dotsIn(c, [x, y, x + w, y + h], { spacing: 14, color: rgba(INK.teams, .8), dir: [0, -1], from: -h * .3, to: h * .6, max: .7 });
  if (!pressed) {
    teamsLogo(c, x + w / 2 - 22 * u, y + 15 * u, 8 * u); ui(c, 'Microsoft Teams', x + w / 2 - 15 * u, y + 17.4 * u, 5.4 * u, '#E8E6F4', 600);
    const cy = y + h * .34, R = w * .26;
    for (let i = 0; i < 2; i++) { const p = frac(twos(t) * 1.2 + i * .5); c.save(); c.globalAlpha *= 1 - p; outline(c, ell(x + w / 2, cy, R * (1 + p * .5), R * (1 + p * .5), 32), 3, INK.teamsLt); c.restore(); }
    teamsAvatar(c, x + w / 2, cy, R, 'greg', { photo: true, t });
    ui(c, 'Greg Hollis', x + w / 2, y + h * .57, 12.5 * u, INK.white, 800, { align: 'center' });
    ui(c, 'Quick sync \uD83D\uDE42', x + w / 2, y + h * .63, 7.2 * u, '#C9C6DD', 600, { align: 'center' });
    const by = y + h * .84, br = 10.5 * u;
    roundBtn(c, x + w * .2, by, br, '#4A4955', 'video');
    roundBtn(c, x + w * .5, by, br, INK.msGreen, 'phone', seg(t, o.press - 1 / 24, o.press + .14));
    roundBtn(c, x + w * .8, by, br, INK.msRed, 'hangup');
    ui(c, 'Audio', x + w * .5, by + br + 7 * u, 5.2 * u, '#C9C6DD', 600, { align: 'center' });
    return;
  }
  // in the call: Greg far too close, Dan's camera off
  const vb = [x, y + h * .09, w, h * .62];
  foreheadCam(c, vb, t, 'greg', { mouth: 'talk', open: .25 + .4 * Math.abs(Math.sin(twos(t) * 9)) }, { k: .2 });
  fillPts(c, rect(x, y, w, h * .09), '#1F1F1F', false);
  ui(c, '00:0' + Math.min(9, Math.floor(t - o.press)), x + w / 2, y + h * .068, 6 * u, INK.white, 700, { align: 'center' });
  fillPts(c, rect(x, y + h * .71, w, h * .29), '#1F1F1F', false);
  const sy = y + h * .79;
  appIcon(c, 'camera', x + w * .5, sy + 2 * u, 22 * u, INK.white, { off: true, bg: '#1F1F1F', w: 1.7 });
  ui(c, 'Camera off', x + w / 2, sy + 21 * u, 8.6 * u, INK.white, 800, { align: 'center' });
  const by = y + h * .955; [[.25, 'mic', true], [.5, 'more', false], [.75, 'hangup', false]].forEach(([fx, ic, off], i) => { if (i === 2) ink(c, ell(x + w * fx, by - 2 * u, 6 * u, 6 * u, 20), { fill: INK.msRed, line: 0, boil: 0 }); appIcon(c, ic, x + w * fx, by - 2 * u, 7 * u, INK.white, { off, bg: '#1F1F1F' }); });
}
function steam(ctx, t, box, n, a = .5, seed = 0) {
  const [x0, y0, w, h] = box;
  for (let i = 0; i < n; i++) {
    const hh = hash(i * 3.3 + seed), x = x0 + hash(i * 1.7 + seed) * w + noise1(t * .3 + i) * 40, y = y0 + h - mod(t * (40 + hh * 30) + hh * h, h * 1.2), r = 90 + hash(i * 5 + seed) * 120;
    const b = blob(x, y, r, i + Math.floor(t * 4), .16, 14, r * .7); ctx.save(); ctx.globalAlpha *= a * Math.sin(clamp((y - y0 + 100) / (h + 100)) * Math.PI);
    fillPts(ctx, b, INK.white); ctx.restore();
  }
}
function oh(ctx, x, y, size, age, rot = -.08, color = INK.yellow) {
  const k = backOut(clamp((age + 1 / 24) / .1), 3), j = shake(age + x, 6);
  txt(ctx, 'OH!', x + j[0], y + j[1], { font: 'display', weight: 900, stretch: 1, italic: true, size: size * k, align: 'center', base: 'middle', rot, color, stroke: { w: size * .08, color: INK.ink }, extrude: { dx: size * .05, dy: size * .07, color: INK.ink }, dots: { color: rgba(INK.red, .9), spacing: size * .07 } });
}
const bandHits = t => ({ kick: kick(t, 9), snare: snare(t, 9), hat: pulse(t, 12, .5), crash: hit(t, [89.30, 90.12, 91.77, 92.17], 3) });
const bob = t => (c => { const tc = twos(t), b = beatAt(tc + VLEAD); person(c, STAGE.bob[0], STAGE.bob[1], STAGE.bob[2], 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(b + .5), r: stroke(b) }, mouth: 'grin', rage: .6, sweat: .8, eyes: 'wide', t: tc }); });

// ---------- 1. the shower (76.80-79.39) ----------
const SH_HEAD = [880, 470, 290], SH = headFit(...SH_HEAD, 'dan'), SH_PHONE = [1196, 246, 330, 660], T_RING = 77.75 + 4 / 24, T_TAP = 78.52;
const shAt = (u, v) => [SH_HEAD[0] + u * SH_HEAD[2], SH_HEAD[1] + v * SH_HEAD[2]];   // offsets in head heights from the head centre
const SH_BTN = [SH_PHONE[0] + SH_PHONE[2] * .5, SH_PHONE[1] + SH_PHONE[2] * .045 + (SH_PHONE[3] - SH_PHONE[2] * .09) * .84];
function bathroom(ctx, t) {
  const k = STYLE.k, tile = mix('#D6E4DF', INK.pinkLt, k), grout = mix('#AFC2BB', INK.pink, k * .85), ts = 132;
  fillPts(ctx, rect(0, 0, W, H), grout, false);
  ctx.beginPath(); for (let y = -60; y < H; y += ts) for (let x = -40; x < W; x += ts) ctx.rect(x + 5, y + 5, ts - 10, ts - 10); ctx.fillStyle = tile; ctx.fill();
  ctx.beginPath(); for (let y = -60; y < H; y += ts) for (let x = -40; x < W; x += ts) ctx.rect(x + 16, y + 14, 26, 8); ctx.fillStyle = rgba(INK.white, .6); ctx.fill();
  dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: rgba(INK.red, .5), k: (x, y) => clamp((Math.hypot((x - 900) / 1150, (y - 560) / 720) - .5) * 2.2) });
  // the shower head and its pipe, water raining onto Dan
  inkLine(ctx, [[-20, 128], [520, 128], [600, 140]], 22, mix('#B9BEC2', INK.paperDk, k), { taper: [0, 0] });
  ink(ctx, xform([[-40, -26], [40, -40], [56, 40], [-30, 30]], 640, 168, 1, .5), { fill: mix('#C9CDD0', INK.paperDk, k), shade: { color: INK.ink, spacing: 9, dir: [.6, .8], from: 0, to: 60 }, line: 4, smooth: false, seed: 3 });
  ctx.save(); const ph = t * 2.6;
  for (let i = 0; i < 46; i++) { const a = hash(i * 1.3), u = frac(ph + hash(i * 7.1)), p0 = [655 + a * 40, 195], p1 = [760 + a * 330, 470 + hash(i * 3) * 120];
    const p = [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)], d = nrm2(p1[0] - p0[0], p1[1] - p0[1]);
    inkLine(ctx, [p, [p[0] + d[0] * 46, p[1] + d[1] * 46]], 5, mix('#EAF6FA', INK.white, k), { taper: [.3, .3], keepWeight: true }); }
  ctx.restore();
}
const nrm2 = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
function curtains(ctx, t) {
  const k = STYLE.k, base = mix('#E6CFD6', INK.pink, k), stripe = mix('#F4ECEE', INK.paper, k);
  inkLine(ctx, [[-20, 62], [1940, 62]], 16, mix('#B9BEC2', INK.ink, k), { taper: [0, 0], smooth: false });
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -30 : 1950, x1 = sd < 0 ? 330 : 1590, sway = Math.sin(t * 1.3 + sd) * 8, n = 7;
    const top = [], bot = [];
    for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u); top.push([x, 70]); bot.push([lerp(x0, x1 - sd * 50, u) + sway * u + Math.sin(i * 2.1) * 10, 1090]); }
    const P = [...top, ...bot.reverse()];
    ink(ctx, P, { fill: base, line: 4, smooth: false, boil: .8, seed: 20 + sd });
    ctx.save(); clipPts(ctx, P, false); ctx.beginPath();
    for (let i = 0; i < 9; i++) { const xx = lerp(x0, x1, (i + .3) / 9); ctx.rect(xx - 14, 60, 28, 1040); } ctx.fillStyle = stripe; ctx.fill();
    for (let i = 1; i < n; i++) { const xx = lerp(x0, x1, i / n); inkLine(ctx, [[xx, 80], [xx + sway * i / n + sd * 6, 560], [xx + sway * i / n, 1090]], 3.5, INK.ink, { taper: [.1, .2], seed: i }); }
    dotsIn(ctx, bbox(P), { spacing: 18, color: rgba(INK.red, .7), dir: [-sd, 0], c: [x1, 500], from: 0, to: Math.abs(x1 - x0), min: 0, max: .8 });
    ctx.restore();
    for (let i = 0; i <= n; i += 1) ink(ctx, ell(lerp(x0, x1, i / n), 62, 13, 13, 14), { fill: 0, line: 3.5, boil: .4 });
  }
}
function shelves(ctx, t) {
  const k = STYLE.k, glass = mix('#E4F1F1', INK.white, k);
  for (const [x, w] of [[340, 360], [1120, 420]]) {
    fillA(ctx, rect(x + 10, 914, w, 16), INK.ink, .25); ink(ctx, rect(x, 900, w, 14), { fill: glass, line: 3, smooth: false, seed: x });
    for (const bx of [x + 24, x + w - 36]) ink(ctx, [[bx, 914], [bx + 12, 914], [bx + 12, 960], [bx, 940]], { fill: mix('#B9BEC2', INK.ink, k), line: 2.5, smooth: false });
  }
  // left shelf: conditioner, a sad loofah, the rubber duck
  ink(ctx, rrect(380, 700, 86, 200, 20), { fill: mix('#E3B8C9', INK.pink, k), shade: { color: INK.redDk, spacing: 12, dir: [1, 0], from: 0, to: 60 }, line: 3.5, smooth: false, seed: 41 });
  ink(ctx, rrect(398, 672, 50, 34, 8), { fill: mix('#F0F0EC', INK.white, k), line: 3, smooth: false, seed: 42 });
  ui(ctx, 'COND.', 423, 800, 20, INK.ink, 900, { align: 'center' });
  ink(ctx, blob(560, 840, 62, 4, .3, 16, 54), { fill: mix('#E9C9A8', INK.yellow, k), shade: { color: INK.orange, spacing: 11, dir: [.6, .8], from: 0, to: 70 }, line: 3, seed: 43 });
  const dq = Math.sin(twos(t) * 3) * .05;
  ink(ctx, xform(ell(0, 0, 48, 38, 20), 650, 862, 1, dq), { fill: INK.yellow, shade: { color: INK.orange, spacing: 10, dir: [.5, .9], from: 0, to: 40 }, line: 3.5, seed: 44 });
  ink(ctx, ell(632, 812, 28, 26, 16), { fill: INK.yellow, line: 3.5, seed: 45 }); ink(ctx, [[602, 812], [580, 820], [604, 826]], { fill: INK.orange, line: 2.5, smooth: false });
  fillPts(ctx, ell(622, 806, 4, 5, 8), INK.ink);
}
function tub(ctx) {
  const k = STYLE.k, enamel = mix('#F2F1EC', INK.white, k);
  ink(ctx, [[-20, 968], [1940, 968], [1940, 1100], [-20, 1100]], { fill: enamel, shade: { color: rgba(INK.red, .7), spacing: 16, dir: [0, 1], from: 20, to: 140 }, line: 5, smooth: false, seed: 61 });
  inkLine(ctx, [[-20, 986], [1940, 986]], 3, INK.ink, { taper: [0, 0] }); fillPts(ctx, rect(-20, 972, 1960, 9), rgba(INK.white, .9), false);
}
function foamHawk(ctx, top, droop, t) {
  // shampoo suds sculpted into Dan's stage spikes; droop 0 = proud mohawk, 1 = melted down the side of his head
  const [cx, cy] = top, n = 5, wob = Math.sin(twos(t) * 9) * 5 * (1 - droop), sh = { color: mix('#C9D9E6', INK.pinkLt, STYLE.k), spacing: 11, dir: [.6, .8], from: 0, to: 60 };
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1) - .5, L = (175 - Math.abs(u) * 130) * (1 - droop * .3), a = -Math.PI / 2 + u * 1.2 + droop * (1.75 + u * .5);
    const b0 = [cx + u * 130, cy + 30], tip = [b0[0] + Math.cos(a) * L + wob, b0[1] + Math.sin(a) * L], w = 44 - Math.abs(u) * 16, nx = -Math.sin(a), ny = Math.cos(a), m = (f, sd) => [lerp(b0[0], tip[0], f) + nx * w * sd * (1 - f * .8), lerp(b0[1], tip[1], f) + ny * w * sd * (1 - f * .8)];
    ink(ctx, [m(0, -1), m(.5, -1.15), tip, m(.5, 1.15), m(0, 1)], { fill: INK.white, shade: sh, line: 3.4, seed: 70 + i });
  }
  for (let j = 0; j < 7; j++) { const x = cx - 150 + j * 50 + droop * 30, y = cy + 34 + Math.sin(j * 2.3) * 8 + droop * 20; ink(ctx, ell(x, y, 34, 28, 14), { fill: INK.white, shade: sh, line: 3, seed: 90 + j }); }
  for (let j = 0; j < 9; j++) outline(ctx, ell(cx - 140 + hash(j * 3) * 280, cy - 10 + hash(j * 7) * 60 - (1 - droop) * hash(j) * 90, 6 + hash(j) * 7, 6 + hash(j) * 7, 10), 2, INK.ink);
  if (droop > .2) for (let i = 0; i < 3; i++) { const dx = cx + 90 + i * 34, L = droop * (90 + i * 50) + frac(t * .7 + i * .3) * 40; ink(ctx, [[dx - 15, cy + 40], [dx + 15, cy + 40], [dx + 9, cy + 50 + L], [dx, cy + 62 + L], [dx - 9, cy + 50 + L]], { fill: INK.white, line: 2.5, seed: 80 + i }); }
}
function bottle(ctx, x, y, rot, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ink(ctx, rrect(-34, -96, 68, 190, 22), { fill: mix('#F2C24E', INK.yellow, k), shade: { color: INK.orange, spacing: 11, dir: [1, 0], from: 0, to: 40 }, line: 4, smooth: false, seed: 51 });
  ink(ctx, rrect(-20, -128, 40, 36, 8), { fill: INK.red, line: 3.5, smooth: false, seed: 52 }); ink(ctx, rect(-8, -146, 16, 20), { fill: INK.red, line: 3, smooth: false, seed: 53 });
  ink(ctx, rrect(-26, -40, 52, 66, 6), { fill: INK.white, line: 2.5, smooth: false, seed: 54 });
  txt(ctx, 'SHAM', 0, -12, { font: 'display', weight: 900, size: 20, align: 'center', color: INK.red }); txt(ctx, 'POO', 0, 10, { font: 'display', weight: 900, size: 20, align: 'center', color: INK.red });
  ctx.restore();
}
function shower(ctx, t) {
  look(KH); const tc = twos(t), k = STYLE.k;
  if (t < LINES[45].words[0].a - 1 / 24) FRAME.lyrics = false;   // the hard cut leaves chorus 2's falling slab behind
  bathroom(ctx, t); steam(ctx, t, [200, 100, 1500, 900], 7, .35, 1);
  const ring = t >= T_RING, tap = seg(t, T_TAP - .32, T_TAP), back = seg(t, T_TAP + .15, T_TAP + .5);
  // the cold Teams light spills off the phone onto the pink tiles
  if (ring) { const [px, py, pw, ph] = SH_PHONE, e = .55 + .45 * Math.abs(Math.sin(t * 7)) * (t < T_TAP ? 1 : 0), cx = px + pw / 2, cy = py + ph * .4;
    ctx.save(); dotsIn(ctx, [cx - 760, cy - 560, cx + 760, cy + 640], { spacing: 26, color: rgba(INK.teams, .85), k: (x, y) => (1 - Math.hypot((x - cx) / 760, (y - cy) / 620)) * 1.4 * e }); ctx.restore(); }
  shelves(ctx, t);
  // Dan: singing into the shampoo, then the take, the tap, the polite face
  const sing = singOpen(t, 45, 45), beatB = Math.exp(-frac(beatAt(tc + VLEAD)) * 4);
  let pose;
  if (t < T_RING) pose = { eyes: 'closed', mouth: 'o', open: .45 + .55 * sing, brows: .45, tilt: -7 + beatB * 5, nod: -.1 - beatB * .08, blush: .5 };
  else if (t < 78.40) pose = { eyes: 'wide', lids: 0, mouth: 'o', open: .3, brows: .7, browTilt: .6, lx: .9, ly: .2, tilt: 2, sweat: .3 };
  else pose = { eyes: 'open', lids: .15 + blink(tc, [78.44]) * .85, mouth: 'polite', glare: seg(t, 78.44, 78.5), lx: t < T_TAP + .3 ? .7 : .3, tilt: t > 78.9 ? 3 : 0, nod: t > 78.9 ? Math.max(0, Math.sin((t - 78.9) * 7)) * .12 : 0, twitch: t > 79.05 ? twitchAt(tc, .5) : 0 };
  // the shampoo mic: at the chin while he sings, lowered to his chest once he's on the call
  const low = easeInOut(seg(twos(t), 78.40, 78.75)), h0 = shAt(-.36, 1.02), h1 = shAt(-.62, 1.55), hand = [lerp(h0[0], h1[0], low), lerp(h0[1], h1[1], low)];
  bottle(ctx, hand[0] + 6, hand[1] - 52, lerp(-.22, .05, low), k);
  const restR = shAt(.5, 1.75), tapPt = [SH_BTN[0], SH_BTN[1]];
  const reachR = t < T_TAP - .32 || t > T_TAP + .5 ? null : t < T_TAP + .15 ? [lerp(restR[0], tapPt[0], easeOut(tap)), lerp(restR[1], tapPt[1], easeOut(tap))] : [lerp(tapPt[0], restR[0], easeInOut(back)), lerp(tapPt[1], restR[1], easeInOut(back))];
  // phone first so the reaching hand lands on top of it
  const vibr = ring && t < T_TAP ? shake(t, 5) : [0, 0];
  ctx.save(); ctx.translate(vibr[0], vibr[1]);
  phoneDev(ctx, SH_PHONE, (c, b) => { if (!ring) { fillPts(c, rect(...b), '#101014', false); fillA(c, [[b[0] + b[2] * .2, b[1]], [b[0] + b[2] * .45, b[1]], [b[0] + b[2] * .05, b[1] + b[3] * .5], [b[0], b[1] + b[3] * .38]], INK.white, .12); } else teamsRing(c, b, t, { press: T_TAP }); }, { wet: true });
  ctx.restore();
  if (ring && t < T_TAP) for (const sd of [-1, 1]) { const x = sd < 0 ? SH_PHONE[0] - 22 : SH_PHONE[0] + SH_PHONE[2] + 22, y = SH_PHONE[1] + 120; for (let i = 0; i < 2; i++) inkLine(ctx, [[x + sd * i * 20, y], [x + sd * (14 + i * 20), y + 40], [x + sd * i * 20, y + 80]], 5, INK.ink, { taper: [.2, .2] }); }
  const A = person(ctx, SH.x, SH.y, SH.s, DAN_BARE, { view: 'bust', col: bareCol(), stage: 0, reachL: hand, handL: 'grip', reachR: reachR || undefined, handR: reachR ? 'point' : 'relax', wild: 0, sweat: .2, t: tc, ...pose });
  foamHawk(ctx, A.top, t < 78.40 ? 0 : easeOut(seg(t, 78.40, 79.2)), t);
  if (t < T_RING) { const w = LINES[45].words, wi = w.findIndex(q => t >= q.a - 1 / 24 && t < q.b); if (wi >= 0 && wi < 4) oh(ctx, 520 - (wi % 2) * 40, 330 + (wi % 2) * 90, 170, t - w[wi].a, wi % 2 ? .1 : -.12, INK.white); }
  tub(ctx); curtains(ctx, t);
}

// ---------- 2. the treadmill (79.39-82.70) ----------
const TM = { x: 1060, y: 990, s: 66 }, T_LINK = early(81.84), T_MAX = 81.96, T_FLING = 82.06, T_LAND = early(82.30);
const LINKS = [
  { at: 79.66, app: 'outlook', h: 'Quick sync \uD83D\uDE42 · 7:30 AM', s: 'outlook.office.com/calendar/…' },
  { at: 80.38, app: 'zoom', h: 'Zoom meeting', s: 'zoom.us/j/93812207446' },
  { at: 80.76, app: 'teams', h: 'Sync about the sync', s: 'Join the meeting now' },
  { at: 81.06, app: 'slack', h: 'Huddle in #quick-sync', s: 'slack.com/huddle/T04…' },
  { at: 81.50, app: 'outlook', h: 'Pre-meeting (for the meeting)', s: 'outlook.office.com/…' },
];
const BIGLINK = 'teams.microsoft.com/l/meetup-join/19%3ameeting_NjM4ZTkxYzAtOWQ2Ni00YjE1LWI5ZTEtNzQ1M2Y0ZDQ3ODg5%40thread.v2/0?context=%7b%22Tid%22%3a%2272f988bf';
const LOGO = { teams: teamsLogo, zoom: zoomLogo, outlook: outlookLogo, slack: slackLogo };
const PILE = i => [1690 + (hash(i * 3.7) - .5) * 110, 1072 - 58 - i * 106, (hash(i * 9.1) - .5) * .16];
const TM_PHONE = [396, 300, 132, 246];
function linkCard(ctx, x, y, rot, L, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const w = 600, h = 108, blue = mix('#0F6CBD', INK.blue, STYLE.k);
  fillA(ctx, rrect(-w / 2 + 10, -h / 2 + 12, w, h, 16), INK.ink, .35);
  ink(ctx, rrect(-w / 2, -h / 2, w, h, 16), { fill: mix('#FFFFFF', INK.white, STYLE.k), line: 3.5, smooth: false, boil: .5, seed: 90 });
  LOGO[L.app](ctx, -w / 2 + 58, 0, 66);
  ui(ctx, L.h, -w / 2 + 110, -10, 32, mix('#242424', INK.ink, STYLE.k), 800);
  ui(ctx, L.s, -w / 2 + 110, 32, 29, blue, 600);
  fillPts(ctx, rect(-w / 2 + 110, 38, measure(ctx, L.s, { font: 'ui', weight: 600, size: 29 }).w, 3), blue, false);
  ctx.restore();
}
function gym(ctx, t) {
  const k = STYLE.k, wall = mix('#D8D2E3', INK.pinkLt, k);
  fillPts(ctx, rect(0, 0, W, H), wall, false);
  // the window: a riso sunrise over the city
  const wx = 480, wy = 90, ww = 1060, wh = 580;
  ink(ctx, rect(wx - 22, wy - 22, ww + 44, wh + 44), { fill: mix('#EEEAF0', INK.paper, k), line: 4, smooth: false, seed: 1 });
  ctx.save(); clipPts(ctx, rect(wx, wy, ww, wh), false);
  fillPts(ctx, rect(wx, wy, ww, wh), mix('#F3C9C2', INK.pink, k), false);
  for (let i = 0; i < 5; i++) fillPts(ctx, rect(wx, wy + 330 + i * 36 - i * i * 3, ww, 12 + i * 5), mix('#F6DCC5', INK.orangeLt, k), false);
  const sx = wx + ww * .52, sy = wy + 470; ink(ctx, ell(sx, sy, 190, 190, 40), { fill: INK.yellow, line: 0, boil: .5 });
  for (let i = 0; i < 4; i++) fillPts(ctx, rect(wx, sy - 40 + i * 38, ww, 8 + i * 4), mix('#F3C9C2', INK.pink, k), false);
  ctx.beginPath(); for (let i = 0; i < 14; i++) { const bx = wx + i * 76 + hash(i) * 20, bh = 120 + hash(i * 3) * 190; ctx.rect(bx, wy + wh - bh, 62 + hash(i * 5) * 30, bh); } ctx.fillStyle = mix('#9C8FB0', INK.redDk, k); ctx.fill();
  ctx.beginPath(); for (let i = 0; i < 60; i++) { const bx = wx + hash(i * 1.3) * ww, by = wy + wh - hash(i * 2.9) * 260; ctx.rect(bx, by, 9, 12); } ctx.fillStyle = rgba(INK.yellow, .8); ctx.fill();
  ctx.restore();
  for (const u of [.5]) inkLine(ctx, [[wx + ww * u, wy], [wx + ww * u, wy + wh]], 12, mix('#EEEAF0', INK.paper, k), { taper: [0, 0], smooth: false });
  inkLine(ctx, [[wx, wy + wh * .55], [wx + ww, wy + wh * .55]], 12, mix('#EEEAF0', INK.paper, k), { taper: [0, 0], smooth: false });
  outline(ctx, rect(wx, wy, ww, wh), 4, INK.ink, { smooth: false });
  dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: rgba(INK.red, .45), k: (x, y) => clamp((Math.hypot((x - 960) / 1100, (y - 500) / 700) - .55) * 2) });
  // floor
  ink(ctx, rect(-20, 1040, 1960, 60), { fill: mix('#C8B7A6', INK.pinkLt, k * .7), shade: { color: rgba(INK.redDk, .8), spacing: 18, dir: [0, 1], from: 0, to: 60 }, line: 4, smooth: false, seed: 2 });
}
// side-on, Dan running screen-left: the console is on the left, the belt runs off the back (right) towards the pile
function treadmill(ctx, t, layer, belt, maxK) {
  const k = STYLE.k, body = mix('#4A4C57', INK.ink, k), trim = mix('#9AA0A8', INK.paperDk, k);
  if (layer === 'back') {
    inkLine(ctx, [[600, 990], [500, 640], [880, 690]], 18, mix(trim, INK.ink, .3), { taper: [0, 0], smooth: false });
    ink(ctx, [[520, 984], [1660, 984], [1680, 1046], [500, 1046]], { fill: body, line: 4, smooth: false, seed: 3 });
    for (const x of [532, 1648]) ink(ctx, ell(x, 1015, 32, 32, 18), { fill: trim, line: 3, boil: .3 });
    ctx.beginPath(); for (let i = 0; i < 28; i++) { const x = 540 + mod(i * 40 + belt, 1110); ctx.rect(x, 988, 18, 7); } ctx.fillStyle = mix('#6E707A', INK.redDk, k); ctx.fill();
    if (maxK > 0) streaks(ctx, [520, 960, 1660, 990], { dir: [1, 0], n: 20, len: 300, w: 3.5, color: INK.white });
    return;
  }
  ink(ctx, [[560, 990], [606, 990], [512, 600], [470, 604]], { fill: trim, line: 4, smooth: false, seed: 4 });
  ink(ctx, [[300, 470], [540, 500], [530, 626], [318, 600]], { fill: body, line: 4, smooth: false, seed: 5 });
  const lcd = [[332, 520], [452, 534], [448, 590], [330, 576]], max = maxK > 0 && Math.floor(t * 8) % 2;
  fillPts(ctx, lcd, max ? INK.red : mix('#9BC79A', INK.yellow, k), false); outline(ctx, lcd, 2.5, INK.ink, { smooth: false });
  ctx.save(); ctx.translate(392, 556); ctx.rotate(.11); txt(ctx, maxK > 0 ? 'MAX 12.0' : 'SPD 6.0', 0, 11, { font: 'mono', weight: 800, size: 30, align: 'center', color: max ? INK.white : INK.ink }); ctx.restore();
  ink(ctx, ell(498, 560, 20, 20, 16), { fill: maxK > 0 ? INK.red : INK.msGreen, line: 3, boil: .3 });
  inkLine(ctx, [[520, 650], [870, 700]], 18, trim, { taper: [0, 0], smooth: false });
}
function tread(ctx, t) {
  look(KH); const k = STYLE.k;
  gym(ctx, t);
  const maxK = seg(t, T_MAX, T_MAX + .06), belt = 700 * t + 3400 * Math.max(0, t - T_MAX);
  treadmill(ctx, t, 'back', belt, maxK);
  // Dan running (a stride per beat), then MAX: legs a blur, flung off the back into his own pile of links
  const tc = twos(t), cad = beatAt(tc + VLEAD) * .5 + Math.max(0, tc - T_MAX) * 5, q = frac(cad) * TAU, fl = clamp((t - T_FLING) / (T_LAND - T_FLING)), landed = t >= T_LAND;
  const panic = seg(t, T_LINK, T_LINK + .1), looks = LINKS.some(L => t > L.at && t < L.at + .4);
  const pose = { legs: 'run', phase: frac(cad), turn: -.82, lean: -9 - panic * 8, armL: { a: 45 * Math.cos(q), e: -80 }, armR: { a: -45 * Math.cos(q), e: -80 }, hop: .18 * Math.abs(Math.sin(q)),
    swing: 40 * Math.sin(q), mouth: panic ? 'o' : 'flat', open: panic ? .8 : 0, eyes: panic ? 'wide' : looks ? 'side' : 'open', lx: looks ? 1 : -.3, ly: looks ? -.7 : 0, sweat: .5 + panic * .5, brows: panic ? .7 : looks ? .3 : 0, browTilt: panic ? .8 : 0,
    col: { top: mix('#A8AEB8', INK.blue, k * .6), topDk: mix('#8A909A', INK.blueDk, k * .6), pants: mix('#4A4E5E', INK.ink, k), pantsDk: mix('#3A3D4A', INK.ink, k) }, t: tc };
  const danAt = () => { ctx.save();
    if (t >= T_FLING) { const hip = TM.y - 4.4 * TM.s, x = lerp(TM.x, 1650, easeOut(fl)), y = lerp(hip, 610, fl) - Math.sin(fl * Math.PI) * 300, rot = landed ? 2.9 + Math.sin((t - T_LAND) * 30) * Math.exp(-(t - T_LAND) * 8) * .15 : fl * 2.9;
      ctx.translate(x, y); ctx.rotate(rot); ctx.translate(-TM.x, -hip);
      Object.assign(pose, { legs: landed ? 'run' : 'jump', phase: frac(tc * 3), armL: { a: 150, e: 30 }, armR: { a: 165, e: 20 }, handL: 'open', handR: 'open', eyes: 'x', mouth: 'o', open: 1, swing: 120, sweat: 1, lean: 0 }); }
    const A = person(ctx, TM.x, TM.y, TM.s, DAN_GYM, pose); ctx.restore(); return A; };
  const A = t < T_FLING ? danAt() : null;
  treadmill(ctx, t, 'front', belt, maxK);
  // the phone on the console + the watch: every link pings both
  const ping = hit(t, LINKS.map(L => L.at).concat(T_LINK), 7);
  ctx.save(); ctx.translate(TM_PHONE[0] + TM_PHONE[2] / 2, TM_PHONE[1] + TM_PHONE[3] / 2); ctx.rotate(.12); ctx.translate(-TM_PHONE[0] - TM_PHONE[2] / 2, -TM_PHONE[1] - TM_PHONE[3] / 2);
  phoneDev(ctx, TM_PHONE, (c, b) => { fillPts(c, rect(...b), mix('#2B2A44', INK.night, k), false); if (ping > .05) { fillA(c, rect(...b), INK.teams, ping); teamsLogo(c, b[0] + b[2] / 2, b[1] + b[3] / 2, b[2] * .55); } });
  ctx.restore();
  if (A && ping > .2) { const w = A.handL; for (let i = 0; i < 3; i++) outline(ctx, ell(w[0], w[1], 16 + i * 13 + (1 - ping) * 22, 16 + i * 13 + (1 - ping) * 22, 16), 3.5, INK.teams); }
  // the links shoot out of the phone, over his head, and pile up behind him like Tetris
  const scatter = landed ? Math.exp(-(t - T_LAND) * 9) * Math.sin(clamp((t - T_LAND) / .3) * Math.PI) : 0;
  const cards = () => LINKS.forEach((L, i) => { const age = t - (L.at - 1 / 24); if (age < 0) return;
    const [px, py, pr] = PILE(i), f = clamp(age / .32), x = lerp(TM_PHONE[0] + 66, px, easeInOut(f)), y = lerp(TM_PHONE[1] + 80, py, f) - Math.sin(f * Math.PI) * 360, land = age > .32 ? Math.exp(-(age - .32) * 14) * Math.sin((age - .32) * 40) * .08 : 0;
    linkCard(ctx, x + scatter * (hash(i) - .5) * 160, y - scatter * (90 + i * 50), pr * f + (1 - f) * .7 + land + scatter * (hash(i * 3) - .5), L, lerp(.35, 1, easeOut(f)) * (1 + land));
    if (age > .3 && age < .52 && t < T_LINK) sfx(ctx, 'PING!', px - 330, py - 40, 76, age - .3, { rot: -.1, color: INK.white, life: .22 }); });
  if (landed) { danAt(); cards(); } else { cards(); if (t >= T_FLING) danAt(); }
  // the endless Teams meeting link slams in on "link"
  const ba = t - T_LINK;
  if (ba >= 0) { const e = backOut(clamp(ba / .14), 1.4), x = lerp(2200, 110, e), y = 820, scroll = Math.max(0, ba - .2) * 900;
    ctx.save(); ctx.translate(0, y); ctx.rotate(-.035);
    fillA(ctx, rect(x + 14, -70 + 16, 3000, 150), INK.ink, .4);
    ink(ctx, rect(x, -70, 3000, 150), { fill: INK.white, line: 6, smooth: false, boil: .8, seed: 95 });
    teamsLogo(ctx, x + 80, 5, 96);
    ctx.save(); clipPts(ctx, rect(x + 150, -70, 2850, 150), false);
    const lw = measure(ctx, BIGLINK, { font: 'ui', weight: 700, size: 64 }).w;
    for (const o of [0, lw + 80]) { const tx0 = x + 170 - scroll + o; ui(ctx, BIGLINK, tx0, 28, 64, INK.blue, 700); fillPts(ctx, rect(tx0, 40, lw, 6), INK.blue, false); }
    ctx.restore(); ctx.restore(); }
}

// ---------- 3. the bedroom (82.70-86.82) ----------
// Candles, petals, the long "Ohhh"; the laptop on Dan's nightstand lights up cold blue and kills it. Dan answers, audio only.
const T_GLOW = early(83.70), T_CU = 84.50, T_BACK = 85.40, T_YF = 85.02, T_AUDIO = early(85.18), T_SINK = early(86.42);
const bedGlow = t => seg(t, T_GLOW, T_GLOW + .05);
function bedLaptop(c, [x, y, w, h], t) {
  fillPts(c, rect(x, y, w, h), '#0C0D14', false); if (bedGlow(t) <= 0) return;
  fillPts(c, rect(x, y, w, h), '#1B2340', false);
  fillPts(c, rrect(x + w * .42, y + h * .5, w * .54, h * .42, 3), '#2E2E2E', false); teamsLogo(c, x + w * .5, y + h * .6, h * .14);
  for (const [fx, col] of [[.68, INK.msGreen], [.78, INK.msGreen], [.88, INK.msRed]]) fillPts(c, ell(x + w * fx, y + h * .78, h * .06, h * .06, 10), col);
}
function hearts(ctx, t, x, y, k) {
  for (let i = 0; i < 6; i++) { const u = frac(t * .45 + hash(i * 3.3)), hx = x + (hash(i * 7) - .5) * 120 + Math.sin(u * 7 + i) * 18, hy = y - u * 260, r = (12 + hash(i) * 14) * Math.sin(u * Math.PI) * k;
    if (r < 2) continue; const P = []; for (let j = 0; j < 24; j++) { const a = j / 24 * TAU, s = Math.sin(a), c = Math.cos(a); P.push([hx + r * 16 * s * s * s / 16, hy - r * (13 * c - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); }
    ink(ctx, P, { fill: INK.pink, line: 2.5, boil: .5, seed: i }); }
}
function bedWide(ctx, t, cx, cy, z) {
  const tc = twos(t), call = t >= T_BACK, glow = bedGlow(t) * (call ? .75 : 1), lean = easeInOut(seg(tc, 83.20, 83.62)) * (1 - bedGlow(t)), sink = easeIn(seg(tc, T_SINK, T_SINK + .3));
  cam(ctx, cx, cy, z);
  bedroom(ctx, t, { k: KH, glow, laptop: bedLaptop, layer: 'back' });
  const fx = (BED.pillowL[0] + BED.pillowR[0]) / 2, fy = BED.pillowL[1] - 9.1 * BED.pillowL[2];
  if (glow < 1) hearts(ctx, t, fx, fy - 40, 1 - glow);
  // Sam on the left pillow, Dan on the right one, next to the laptop
  let sam, dan;
  if (t < T_GLOW) { sam = { eyes: lean > .5 ? 'closed' : 'happy', mouth: lean > .5 ? 'o' : 'smile', open: .12, blush: .9, tilt: 6 + lean * 10, lx: .8 }; dan = { eyes: lean > .5 ? 'closed' : 'happy', mouth: lean > .5 ? 'o' : 'smile', open: .12, blush: .9, tilt: -6 - lean * 10, lx: -.8 }; }
  else if (!call) { const guilty = t > 84.0 && t < 84.25; sam = { eyes: 'wide', lids: 0, mouth: 'flat', lx: 1, ly: .3, brows: .5 }; dan = { eyes: 'wide', lids: 0, mouth: 'o', open: .2, lx: guilty ? -1 : 1, ly: .3, brows: .7, browTilt: .7, sweat: .5 }; }
  else { const talk = t > 85.55 && t < 85.95; sam = { eyes: 'open', lids: .55, mouth: 'flat', lx: t < 85.95 ? 1 : 0, ly: t < 85.95 ? .2 : 0, brows: -.1 }; dan = { glare: 1, mouth: talk ? 'talk' : 'polite', open: talk ? .3 + .3 * Math.abs(Math.sin(tc * 11)) : 0, lx: .8, turn: .25, nod: Math.max(0, Math.sin((t - T_BACK) * 9)) * .1, tilt: 4 }; }
  const [sx, sy, ss] = BED.pillowL, [dx, dy, ds] = BED.pillowR;
  person(ctx, sx + lean * 26, sy + sink * ss * 3.2, ss, 'sam', { view: 'bust', t: tc, ...sam });
  person(ctx, dx - lean * 26, dy, ds, DAN_BARE, { view: 'bust', col: bareCol(), stage: 0, t: tc, ...dan });
  bedroom(ctx, t, { k: KH, glow, layer: 'front' });
  if (glow > 0 && glow < 1) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; inkLine(ctx, [[fx + Math.cos(a) * 60, fy + Math.sin(a) * 50], [fx + Math.cos(a) * 110, fy + Math.sin(a) * 90]], 4, INK.pink, { taper: [0, .5] }); }
  if (t >= T_GLOW && t < T_CU) { const [lx, ly, lw] = BED.laptop; for (const sd of [-1, 1]) { const ex = lx + lw / 2 + sd * (lw / 2 + 12); for (let i = 0; i < 2; i++) inkLine(ctx, [[ex + sd * i * 9, ly + 6], [ex + sd * (8 + i * 9), ly + 26], [ex + sd * i * 9, ly + 46]], 2.6, INK.cyan, { taper: [.2, .2] }); } }
  ctx.restore();
}
// The laptop screen, close: the call toast, then Greg's chat lands on "you free?", the pointer picks audio only
function bedCU(ctx, t) {
  const m = easeInOut(seg(t, T_YF - .2, T_YF)), cw = lerp(1240, 640, m), z = cw / 360, cx = lerp(340, 1170, m), cy = lerp(330, 866, m), btn = [cx + 288 * z, cy + 76 * z];
  fillPts(ctx, rect(0, 0, W, H), '#0A0B10', false);
  ink(ctx, rrect(40, -60, 1840, 1240, 46), { fill: '#1C1D24', line: 5, smooth: false, boil: .4 });
  ctx.save(); clipPts(ctx, rect(96, 0, 1728, 1080), false);
  fillPts(ctx, rect(96, 0, 1728, 1080), '#14204A', false);
  for (let i = 0; i < 4; i++) ink(ctx, ell(1100 + i * 90, 520 + i * 40, 520 - i * 90, 300 - i * 50, 40, -.5), { fill: ['#1F3A8A', '#2C55C9', '#3E7BF0', '#7FB2FF'][i], line: 0, boil: 0 });
  dotsIn(ctx, [96, 0, 1824, 1080], { spacing: 24, color: rgba(INK.cyan, .55), dir: [0, -1], from: -200, to: 900, max: .7 });
  fillPts(ctx, rect(96, 1018, 1728, 62), rgba('#202020', .92), false);
  ui(ctx, '11:48 PM', 1790, 1058, 26, INK.white, 600, { align: 'right' });
  teamsToast(ctx, 200, 232, 1500, t, { kind: 'chat', who: 'greg', text: 'you free? \uD83D\uDE42', t0: T_YF - .08, presence: 'available' });
  teamsToast(ctx, cx, cy, cw, t, { kind: 'call', who: 'greg', text: 'Incoming video call', t0: T_CU - .3, photo: true, press: t >= T_AUDIO ? 'audio' : undefined });
  if (t > 85.08 && t < T_AUDIO + .1) { const tw = 300, tx0 = btn[0] - tw / 2, ty0 = btn[1] - 150; ink(ctx, rrect(tx0, ty0, tw, 74, 10), { fill: '#2B2B2B', line: 2, lineColor: '#5A5A5A', smooth: false, boil: 0 }); ui(ctx, 'Audio only', btn[0], ty0 + 50, 38, INK.white, 700, { align: 'center' }); }
  const mv = easeInOut(seg(t, T_YF, T_AUDIO - .04)), px = lerp(1560, btn[0] + 8, mv), py = lerp(820, btn[1] + 10, mv);
  pointer(ctx, px, py, 70, { click: seg(t, T_AUDIO, T_AUDIO + .2) });
  ctx.restore();
  fillPts(ctx, ell(960, -26, 9, 9, 10), '#333640');
}
function bed(ctx, t) {
  look(KH);
  if (t >= T_CU && t < T_BACK) return bedCU(ctx, t);
  const [hx, hy] = [(BED.pillowL[0] + BED.pillowR[0]) / 2, BED.pillowL[1] - 9.1 * BED.pillowL[2]];   // between the two faces
  if (t < T_BACK) { const u = easeInOut(seg(t, 82.70, T_GLOW)), snap = backOut(seg(t, T_GLOW + .04, T_GLOW + .2), 2); bedWide(ctx, t, hx + 30 - 10 * snap, hy + lerp(50, 40, u) - 10 * snap, lerp(2.25, 2.5, u) + .45 * snap); }
  else bedWide(ctx, t, hx + 25, hy + 30, 2.9);
}

// ---------- 4. the beach (86.82-89.30) ----------
const BCH = { x: 660, y: 1040, s: 70 }, T_CALL = early(87.24), T_SLAM = early(88.47), T_THROW = early(88.68), T_SPLASH = early(89.10), SPLASH = [1290, 622], SUNX = 1360;
function beachBg(ctx, t) {
  const k = STYLE.k, sky = mix('#F4C9CF', INK.pink, k), sea = mix('#8FC6CF', INK.cyan, k * .8), sand = mix('#EEDDB6', INK.paper, k * .5);
  fillPts(ctx, rect(0, 0, W, 600), sky, false);
  for (let i = 0; i < 6; i++) fillPts(ctx, rect(0, 300 + i * 50 - i * i * 4, W, 10 + i * 6), mix('#F7DCCB', INK.orangeLt, k), false);
  dotsIn(ctx, [0, 0, W, 600], { spacing: 26, color: rgba(INK.red, .55), dir: [0, -1], from: -100, to: 400, min: 0, max: .9 });
  // the sunset: a striped riso sun on the horizon
  const sx = SUNX, sy = 590; ctx.save(); clipPts(ctx, rect(0, 0, W, 600), false);
  ink(ctx, ell(sx, sy, 250, 250, 48), { fill: INK.yellow, line: 0, boil: .4 });
  for (let i = 0; i < 5; i++) fillPts(ctx, rect(sx - 300, sy - 120 + i * 30, 600, 6 + i * 3), sky, false);
  ctx.restore();
  fillPts(ctx, rect(0, 596, W, 210), sea, false);
  ctx.save(); clipPts(ctx, rect(0, 596, W, 210), false);
  dotsIn(ctx, [0, 596, W, 806], { spacing: 20, color: rgba(INK.blue, .7), dir: [0, 1], from: 0, to: 220, min: .1, max: .8 });
  ctx.beginPath(); for (let i = 0; i < 18; i++) { const y = 610 + (i % 6) * 32, w = 120 - (i % 6) * 8 + 60, x = mod(sx - 40 + (hash(i) - .5) * 300 + Math.sin(t * 2 + i) * 14, W); ctx.rect(x - w / 2 + (i % 6) * 6, y, w - (i % 6) * 14, 6); } ctx.fillStyle = INK.yellow; ctx.fill();
  ctx.beginPath(); for (let i = 0; i < 26; i++) { const y = 630 + hash(i * 2.2) * 160, x = mod(hash(i * 5.1) * W + t * (20 + hash(i) * 20), W + 200) - 100; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y - 10, x + 40, y); } ctx.strokeStyle = INK.white; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  inkLine(ctx, [[-20, 598], [1940, 598]], 4, INK.ink, { taper: [0, 0] });
  // sand + the surf line
  const surf = 806 + Math.sin(t * 1.6) * 8; ink(ctx, [[-20, surf], [480, surf - 6], [980, surf + 6], [1500, surf - 4], [1940, surf], [1940, 1100], [-20, 1100]], { fill: sand, shade: { color: rgba(INK.orange, .6), spacing: 18, dir: [0, 1], from: 0, to: 300 }, line: 4, smooth: true, seed: 10 });
  ink(ctx, [[-20, surf], [480, surf - 6], [980, surf + 6], [1500, surf - 4], [1940, surf], [1940, surf + 16], [-20, surf + 18]], { fill: INK.white, line: 2.5, seed: 11 });
  // a palm, leaning in from the right
  inkLine(ctx, [[1850, 1100], [1820, 760], [1740, 420], [1680, 200]], 46, mix('#A88C6A', INK.orange, k), { taper: [0, .4], seed: 12 });
  for (let i = 0; i < 6; i++) { const a = -2.9 + i * .75 + Math.sin(t * 1.2 + i) * .04, L = 260 + hash(i) * 60, p0 = [1680, 200], p2 = [1680 + Math.cos(a) * L, 200 + Math.sin(a) * L + 60], p1 = [1680 + Math.cos(a) * L * .55, 200 + Math.sin(a) * L * .55 - 30];
    ink(ctx, [p0, [p1[0], p1[1] - 26], p2, [p1[0], p1[1] + 26]], { fill: mix('#7FA67A', INK.green, k * .7), shade: { color: INK.ink, spacing: 12, dir: [0, 1], from: 0, to: 40 }, line: 3.5, seed: 13 + i }); }
}
function umbrella(ctx) {
  const k = STYLE.k, cx = 400, cy = 330, R = 450;
  inkLine(ctx, [[cx, cy - 100], [cx + 70, 1060]], 11, mix('#F2EFE6', INK.white, k), { taper: [0, 0], smooth: false });
  for (let i = 0; i < 6; i++) { const a0 = Math.PI + i / 6 * Math.PI, a1 = a0 + Math.PI / 6; ink(ctx, [[cx, cy - 120], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * 160 + 40], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * 160 + 40]], { fill: i % 2 ? INK.red : INK.white, shade: { color: rgba(INK.redDk, .6), spacing: 16, dir: [0, 1], from: 0, to: 220 }, line: 3.5, smooth: false, seed: 30 + i }); }
}
// side view of a striped deck chair, s-scaled around Dan's ground point
function deckChair(ctx, layer) {
  const k = STYLE.k, wood = mix('#B88A5C', INK.orange, k), x = BCH.x, y = BCH.y, s = BCH.s / 46;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (layer === 'back') { const P = [[-120, -380], [110, -360], [140, -150], [-140, -150]];
    ink(ctx, P, { fill: INK.red, shade: { color: INK.redDk, spacing: 10, dir: [0, 1], from: 0, to: 220 }, line: 3, smooth: false, seed: 40 });
    ctx.save(); clipPts(ctx, P, false); ctx.beginPath(); for (let i = 0; i < 4; i++) ctx.rect(-140 + i * 76, -400, 34, 280); ctx.fillStyle = INK.white; ctx.fill(); ctx.restore();
  } else { for (const sd of [-1, 1]) inkLine(ctx, [[sd * 150, -160], [sd * 170, 10]], 9, wood, { taper: [0, 0], smooth: false });
    inkLine(ctx, [[-160, -150], [160, -150]], 10, wood, { taper: [0, 0], smooth: false }); }
  ctx.restore();
}
function strawHat(ctx, top, rot, k) {
  ctx.save(); ctx.translate(top[0], top[1]); ctx.rotate(rot);
  const straw = mix('#E8CF8E', INK.yellow, k);
  ink(ctx, ell(0, 18, 170, 38, 30), { fill: straw, shade: { color: INK.orange, spacing: 10, dir: [0, 1], from: 0, to: 40 }, line: 4, seed: 61 });
  ink(ctx, [[-90, 18], [-80, -50], [-30, -78], [30, -78], [80, -50], [90, 18]], { fill: straw, shade: { color: INK.orange, spacing: 10, dir: [1, 0], from: 0, to: 90 }, line: 4, seed: 62 });
  ink(ctx, [[-88, -4], [88, -4], [90, 16], [-90, 16]], { fill: INK.red, line: 3, smooth: false, seed: 63 });
  ctx.restore();
}
// the out-of-office card: an Outlook auto-reply, big
function oooCard(ctx, x, y, w, t, t0) {
  const e = backOut(seg(t, t0 - 1 / 24, t0 + .22), 1.6), h = w * .24; if (e <= 0) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(e, e); ctx.translate(-w / 2, -h / 2);
  fillA(ctx, rrect(12, 16, w, h, 18), INK.ink, .35);
  ink(ctx, rrect(0, 0, w, h, 18), { fill: mix('#FFFFFF', INK.white, STYLE.k), line: 4, smooth: false, boil: .5, seed: 64 });
  fillPts(ctx, rrect(0, 0, 14, h, 7), mix(INK.outlook, INK.blue, STYLE.k * .5), false);
  outlookLogo(ctx, 82, h / 2, 92);
  ui(ctx, 'Automatic replies: ON', 150, h * .42, w * .056, mix('#242424', INK.ink, STYLE.k), 800);
  ui(ctx, 'Out of office until Oct 14 \uD83C\uDF34', 150, h * .78, w * .043, mix('#616161', INK.ink, STYLE.k), 600);
  ctx.restore();
}
function beach(ctx, t) {
  look(KH); const tc = twos(t), k = STYLE.k;
  beachBg(ctx, t); umbrella(ctx); deckChair(ctx, 'back');
  const s = BCH.s, x = BCH.x, y = BCH.y, pre = t < T_THROW, thr = easeOut(seg(t, T_THROW, T_THROW + .12));
  const stand = easeInOut(seg(tc, 88.20, 88.42)), rage = kf(t, [[87.25, 0], [87.95, .35], [88.3, .6], [88.47, .9], [88.68, 1], [88.95, 1], [89.12, .1]]);
  const lapCol = mix('#C9CCD2', INK.paperDk, k), slab = (cx, cy, rot, sc = 1) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ink(ctx, rrect(-125, -20, 250, 40, 8), { fill: lapCol, shade: { color: INK.ink, spacing: 10, dir: [0, 1], from: 0, to: 40 }, line: 4, smooth: false, seed: 50 }); ctx.restore(); };
  const lift = easeOut(seg(t, T_SLAM, T_THROW - .06)), lapY = lerp(y - 6.6 * s, y - 10.9 * s, lift), up = [[x - 92, lapY + 12], [x + 92, lapY + 2]];
  const flight = f => [lerp(x + 30, SPLASH[0], f), lerp(y - 10.4 * s, SPLASH[1], f) - Math.sin(f * Math.PI) * 90];
  // Dan: bliss, the call, the slow boil, SNAP it shut, hurl it into the sea
  const pose = { sit: 1 - stand, turn: .2, stage: 0, t: tc, col: { top: mix('#F4A6B9', INK.pink, k), topDk: mix('#D98AA0', '#B8215F', k), pants: mix('#F2D27A', INK.yellow, k), pantsDk: mix('#D2B25A', INK.orange, k) } };
  const greg = (c, b) => foreheadCam(c, b, t, 'greg', { mouth: 'talk', open: .3 + .4 * Math.abs(Math.sin(tc * 9)) }, { k: .3 });
  if (t < T_CALL) Object.assign(pose, { hold: 'laptop', eyes: 'closed', mouth: 'smile', brows: .3, tilt: -8, nod: -.05, blush: .4 });
  else if (t < T_SLAM) Object.assign(pose, { hold: 'laptop', screen: greg, ...rageFace(rage), glare: rage < .5 ? 1 : 0, mouth: rage < .45 ? 'polite' : 'grit', steam: clamp((rage - .5) * 3), lx: .6, sq: t > 88.20 && t < 88.30 ? .18 : 0 });
  else Object.assign(pose, { ...rageFace(rage), glare: 0, wild: 1, mouth: t < T_THROW + .3 ? 'scream' : 'smile', open: t < T_THROW + .3 ? 1 : 0, eyes: t < T_THROW + .3 ? 'rage' : 'happy',
    legs: 'wide', lean: pre ? -8 - lift * 6 : lerp(-14, 14, thr), sq: pre ? .18 * lift : -.12 * (1 - thr),
    reachL: pre ? up[0] : undefined, reachR: pre ? up[1] : undefined, armL: pre ? undefined : { a: lerp(165, 40, thr), e: lerp(10, -60, thr) }, armR: pre ? undefined : { a: lerp(165, 100, thr), e: 0 },
    handL: pre ? 'grip' : 'open', handR: pre ? 'grip' : 'open' });
  if (t >= T_SLAM && pre) slab(x, lapY, -.06);
  const A = person(ctx, x, y, s, DAN_BEACH, pose);
  deckChair(ctx, 'front');
  if (A.laptop && t < 88.30) { const q = A.laptop, c = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2]; ink(ctx, ell(c[0], c[1], 26, 26, 16), { fill: INK.red, line: 2.5, boil: .4 }); txt(ctx, 'OOO', c[0], c[1] + 6, { font: 'display', weight: 900, size: 17, align: 'center', color: INK.white }); }
  // the straw hat: on his head until the snap, then it flies
  const hatAge = t - T_SLAM;
  if (hatAge < 0) strawHat(ctx, [A.top[0] + 4, A.top[1] + 26], -.08, k);
  else if (hatAge < .6) strawHat(ctx, [A.top[0] - 420 * hatAge, A.top[1] - 900 * hatAge + 1400 * hatAge * hatAge], -hatAge * 9, k);
  // the cocktail on the sand
  ink(ctx, [[930, 960], [972, 960], [964, 1030], [940, 1030]], { fill: rgba(INK.pinkLt, .9), line: 3, smooth: false, seed: 60 });
  inkLine(ctx, [[952, 960], [984, 906]], 4, INK.ink, { taper: [0, 0] }); ink(ctx, [[962, 918], [1014, 900], [1000, 940]], { fill: INK.yellow, line: 2.5, smooth: false });
  if (hatAge >= 0 && hatAge < .22) sfx(ctx, 'SNAP!', x - 330, y - 6.8 * s, 140, hatAge, { rot: -.14, color: INK.white, life: .22 });
  // the auto-reply is on; Greg calls anyway. On the throw both cards get dragged into the sea with the laptop.
  const suck = clamp((t - T_THROW) / (T_SPLASH - T_THROW)), fp = flight(easeIn(suck));
  if (suck < 1) [[0, 300, c => oooCard(c, 1020, 300, 840, t, 86.86)], [1, 520, c => teamsToast(c, 1020, 520, 840, t, { kind: 'call', who: 'greg', text: 'Incoming video call', t0: T_CALL, photo: true })]].forEach(([i, cy, draw]) => {
    const e = easeIn(clamp(suck * 1.25 - i * .15)), cx = 1440;
    ctx.save(); ctx.translate(lerp(cx, fp[0], e), lerp(cy + 100, fp[1], e)); ctx.rotate(e * (i ? 2 : -2)); ctx.scale(1 - e * .95, 1 - e * .95); ctx.translate(-cx, -cy - 100);
    if (t < T_THROW && i === 1) { const j = shake(t, 4 * pulse(t, 6, .5)); ctx.translate(j[0], j[1]); }
    draw(ctx); ctx.restore(); });
  // the laptop's last flight
  if (!pre) { const f = clamp((t - T_THROW) / (T_SPLASH - T_THROW)), [lx, ly] = flight(f), sc = lerp(1, .2, f);
    if (f < 1) { speedLines(ctx, lx, ly, { n: 16, r0: 120 * sc + 20, r1: 300, w: 5, color: INK.ink });
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(-f * 12); ctx.scale(sc * 1.25, sc * 1.25 * (.55 + .45 * Math.abs(Math.cos(f * 9))));
      ink(ctx, rrect(-125, -84, 250, 168, 16), { fill: lapCol, shade: { color: INK.ink, spacing: 12, dir: [.6, .8], from: 0, to: 120 }, line: 5, smooth: false, seed: 51 });
      ink(ctx, ell(0, 0, 40, 40, 18), { fill: INK.red, line: 3, boil: .4 }); txt(ctx, 'OOO', 0, 9, { font: 'display', weight: 900, size: 26, align: 'center', color: INK.white });
      ctx.restore(); }
    else { const age = t - T_SPLASH, r = 70 + easeOut(clamp(age / .25)) * 170; ink(ctx, burstPts(SPLASH[0], SPLASH[1] - r * .45, r, 11, 5, .5).map(([a, b]) => [a, Math.min(b, SPLASH[1] + 6)]), { fill: INK.white, shade: { color: rgba(INK.cyan, .9), spacing: 14, dir: [0, 1], from: 0, to: r }, line: 4, smooth: false, boil: 2 });
      for (let i = 0; i < 8; i++) { const a = -Math.PI * (.15 + .7 * hash(i)), d = 60 + age * 700 * (.6 + hash(i * 3)), py = SPLASH[1] - Math.sin(-a) * d + 900 * age * age; ink(ctx, ell(SPLASH[0] + Math.cos(a) * d, py, 10, 13, 10), { fill: INK.white, line: 2.5, boil: .5 }); }
      sfx(ctx, 'SPLOOSH!', SPLASH[0], SPLASH[1] - 260, 120, age, { rot: -.06, color: INK.white, life: .45 }); } }
}

// ---------- 5. Linda's solo (89.30-92.30) ----------
function soloCam(ctx, t, cx, cy, z, rot = 0) { const p = snare(t, 9), d = drift(t, 8, .4), sh = shake(t, 6 * p); cam(ctx, cx + d[0] + sh[0], cy + d[1] + sh[1], z * (1 + .05 * p), rot); }
// The stage with the band; Linda is drawn sharp in front, everything else can sit out of focus (o.blur px).
function bandOnStage(ctx, t, o = {}) {
  const tc = twos(t), b = beatAt(tc + VLEAD), hb = headbang(tc, 1, .7);
  const back = c => {
    stage(c, t, { inks: 'pink', smoke: 0, crowd: false, hits: bandHits(t), drummer: bob(t), lights: 1, strobe: .9 });
    person(c, ...STAGE.dan, 'dan', { hold: 'micstand', micAt: STAGE.mic, rage: .9, wild: 1, legs: 'wide', lean: 4 + hb.lean * .3, nod: hb.nod * .3, mouth: 'grin', eyes: 'wide', lx: -.8, t: tc });
    person(c, ...STAGE.tasha, 'tasha', { hold: 'bass', strum: frac(b * .5), fret: .5, legs: 'wide', ...hb, t: tc });
  };
  if (o.blur) depth(ctx, o.blur, back, { keep: true }); else back(ctx);
  if (o.spot) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .5; fillPts(ctx, [[STAGE.linda[0] - 50, -40], [STAGE.linda[0] + 50, -40], [STAGE.linda[0] + 250, 940], [STAGE.linda[0] - 250, 940]], INK.yellow, false); ctx.restore();
    dotsIn(ctx, [STAGE.linda[0] - 260, 860, STAGE.linda[0] + 260, 950], { spacing: 14, color: INK.yellow, k: (px, py) => 1.2 - Math.hypot((px - STAGE.linda[0]) / 250, (py - 905) / 40) }); }
  const A = person(ctx, ...STAGE.linda, 'linda', linda(t));
  blurHands(ctx, A, STAGE.linda[2], t);
  stage(ctx, t, { fg: true, inks: 'pink', smoke: 0, crowd: false });
  if (o.crowd !== false) crowd(ctx, t, [0, STAGE.crowdY - 40, 1920, 230], 90, { seed: 3, jump: .8, headbang: .5, inks: 'pink', k: 1, style: 'silhouette', view: 'back', size: 34, phones: .6, hands: .45 });
  return A;
}
// Linda: deadpan shred, a foot on the wedge, picking hand a blur, the head bobbing so the glasses chain swings
function linda(t) {
  const tc = twos(t), b = beatAt(tc + VLEAD);
  return { hold: 'guitar', strum: frac(tc * 6.5), fret: .35 + .3 * noise1(tc * 7), legs: 'step', stepH: .95, turn: .35, lean: -4 + Math.sin(tc * 3) * 2, tilt: Math.sin(b * Math.PI) * 6, nod: Math.abs(Math.sin(b * Math.PI)) * .06,
    lids: .52 + blink(tc, [90.6, 91.5]) * .48, mouth: 'flat', lx: .1, t: tc };
}
function blurHands(ctx, A, s, t) {
  const p = A.handL, f = A.handR, tc = twos(t);
  for (let i = 0; i < 4; i++) { const a = -1.2 + i * .45 + hash(Math.floor(tc * 12) + i) * .3; inkLine(ctx, [[p[0] + Math.cos(a) * s * .5, p[1] + Math.sin(a) * s * .5], [p[0] + Math.cos(a + .5) * s * 1.1, p[1] + Math.sin(a + .5) * s * 1.1]], s * .09, INK.ink, { taper: [.3, .5] }); }
  for (let i = 0; i < 3; i++) inkLine(ctx, [[f[0] - s * (.9 + i * .2), f[1] + s * (.3 + i * .15)], [f[0] + s * (.9 - i * .2), f[1] - s * (.35 - i * .1)]], s * .07, INK.white, { taper: [.3, .3] });
}
// 89.30 wide: Linda steps up into the spotlight, the crowd's phones go up
function solo1(ctx, t) {
  look(1); const u = seg(t, 89.30, 90.12);
  soloCam(ctx, t, lerp(960, 860, easeOut(u)), lerp(560, 600, u), lerp(1.0, 1.14, easeOut(u)));
  bandOnStage(ctx, t, { spot: true }); ctx.restore();
}
// 90.12 low-angle medium: deadpan face, fingers a blur, the band out of focus behind her
function solo2(ctx, t) {
  look(1); const u = seg(t, 90.12, 90.95), cx = STAGE.linda[0] + 40, cy = STAGE.linda[1] - 215;
  soloCam(ctx, t, cx, cy, lerp(2.85, 3.1, u), -.07);
  bandOnStage(ctx, t, { crowd: false, blur: 10, spot: true });
  ctx.restore();
}
// 90.95 the crowd films it: big phones up in the foreground, every screen shows the same deadpan Linda
function solo3(ctx, t) {
  look(1); const u = seg(t, 90.95, 91.77);
  ctx.save(); depth(ctx, 7, c => { soloCam(c, t, lerp(700, 640, u), 620, 1.3); bandOnStage(c, t, { spot: true, crowd: false }); c.restore(); }); ctx.restore();
  crowd(ctx, t, [-60, 740, 2040, 420], 34, { seed: 9, jump: .9, headbang: .5, inks: 'pink', k: 1, style: 'silhouette', view: 'back', size: 88, phones: 0, hands: .25 });
  [[360, 600, -.14, 0], [980, 520, .04, 1], [1580, 640, .16, 2]].forEach(([x, y, rot, i]) => {
    const bb = Math.sin((beatAt(t + VLEAD) + i * .3) * Math.PI) * 14;
    ctx.save(); ctx.translate(x, y + bb); ctx.rotate(rot);
    fillPts(ctx, [[-70, 160], [70, 160], [110, 760], [-110, 760]], INK.ink, false);
    phoneDev(ctx, [-130, -250, 260, 500], (c, [sx, sy, sw, sh]) => {
      fillPts(c, rect(sx, sy, sw, sh), INK.pink, false); sunburst(c, sx + sw / 2, sy + sh * .4, INK.pink, INK.red, t * .5 + i, 14, 600);
      fillA(c, [[sx + sw * .4, sy], [sx + sw * .6, sy], [sx + sw * .85, sy + sh * .8], [sx + sw * .15, sy + sh * .8]], INK.yellow, .5);
      person(c, sx + sw / 2, sy + sh * .8, sh * .07, 'linda', { ...linda(t), lean: 0 });
      fillPts(c, rect(sx, sy + sh * .8, sw, sh * .2), INK.ink, false);
      fillPts(c, ell(sx + 26, sy + 44, 9, 9, 12), INK.red); ui(c, 'REC 0:4' + (7 + i), sx + 42, sy + 52, 22, INK.white, 800);
      ink(c, ell(sx + sw / 2, sy + sh * .9, 22, 22, 18), { fill: INK.red, line: 3, lineColor: INK.white, boil: .3 });
    });
    for (const sd of [-1, 1]) ink(ctx, rrect(sd * 128 - 18, 60 + sd * 30, 36, 90, 16), { fill: INK.ink, line: 0 });
    ctx.restore(); });
}
// 91.77 the fill: a crash-zoom into her face. Not one muscle moves.
function solo4(ctx, t) {
  look(1); const u = seg(t, 91.77, beatTime(221)), tc = twos(t);
  insBg(ctx, t, INK.pink, INK.red);
  speedLines(ctx, 960, 470, { n: 70, r0: 520, r1: 1500, w: 16, color: rgba(INK.ink, .7) });
  const sh = shake(t, 4 + 10 * u), B = headFit(960, 500, lerp(640, 820, easeIn(u)), 'linda');
  person(ctx, B.x + sh[0], B.y + sh[1], B.s, 'linda', { view: 'bust', lids: .55, mouth: 'flat', tilt: Math.sin(tc * 7) * 3, armL: { a: 20, e: -90 }, armR: { a: 30, e: -100 }, handL: 'grip', handR: 'grip', t: tc });
  misregFrame(ctx, 4 + 10 * u, .3);
}
// 92.17 (b221, the fill's last accent) the final pose and the still: foot on the wedge, horns up, reading glasses back down
// her nose. Per my last email.
function soloEnd(ctx, t) {
  look(1); BOIL = 0;
  sunburst(ctx, 900, 520, INK.red, INK.pink, .3, 22);
  dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - 900) / 1000, (y - 520) / 620) - .45) * 1.6) });
  fillPts(ctx, rect(0, 900, W, 180), INK.ink, false);
  const x = 860, y = 930, s = 90;
  ink(ctx, [[x - 40, y], [x + 260, y], [x + 226, y - 112], [x - 10, y - 112]], { fill: '#57555E', shade: { color: INK.ink, spacing: 10, dir: [0, 1], from: 0, to: 112 }, line: 5, lineColor: INK.pink, smooth: false, boil: 0 });
  fillPts(ctx, rect(x - 4, y - 112, 226, 14), INK.yellow, false);
  person(ctx, x, y, s, 'linda', { hold: 'guitar', strum: .85, fret: .15, legs: 'step', stepH: 1.18, turn: .35, lean: -13, tilt: -7, stage: 0, lids: .4, ly: -.5, lx: -.1, mouth: 'flat', brows: .25,
    armL: { a: 168, e: 12, force: true }, handL: 'horns', t: twos(t) });
  crowd(ctx, t, [0, 970, 1920, 150], 50, { seed: 3, jump: 0, headbang: 0, inks: 'pink', k: 1, style: 'silhouette', view: 'back', size: 40, phones: .7, hands: .2 });
  flash(ctx, INK.white, .45 * (1 - clamp((t - T_POSE) * 12)));
}

// ---------- the "OH!" stage inserts on the snares ----------
function insBg(ctx, t, a = INK.pink, b = INK.red) {
  sunburst(ctx, 960, 560, a, b, t * .4, 20);
  dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: INK.ink, k: (x, y) => clamp((Math.hypot((x - 960) / 1000, (y - 540) / 620) - .45) * 1.6) });
}
const INSERTS = [
  [77.75, 4, (ctx, t, age) => { insBg(ctx, t); person(ctx, SH.x, SH.y, SH.s, 'dan', { view: 'bust', hold: 'mic', holdHand: 'L', rage: 1, wild: 1, stage: 1, mouth: 'scream', open: 1, tilt: -8, t: twos(t) }); oh(ctx, 1520, 540, 300, age, -.08); }],
  [80.22, 3, (ctx, t, age) => { insBg(ctx, t, INK.red, INK.pink); fillPts(ctx, rect(0, 900, W, 180), INK.ink, false);
    drumKit(ctx, 960, 1180, 78, t, { layer: 'back', hits: bandHits(t), inks: 'pink' }); person(ctx, 960, 1150, 78, 'bob', { sit: 1, hold: 'sticks', hits: { l: 0, r: 0 }, armL: { a: 160, e: 10 }, armR: { a: 160, e: 10 }, mouth: 'scream', open: 1, rage: 1, sweat: 1, t: twos(t) }); drumKit(ctx, 960, 1180, 78, t, { layer: 'front', hits: bandHits(t), inks: 'pink' });
    oh(ctx, 470, 360, 270, age, -.1); }],
  [81.05, 4, (ctx, t, age) => { insBg(ctx, t); fillPts(ctx, rect(0, 960, W, 120), INK.ink, false); const tc = twos(t);
    [['linda', 420, { hold: 'guitar', strum: .3 }], ['dan', 790, { hold: 'mic', holdHand: 'L' }], ['tasha', 1130, { hold: 'bass', strum: .4 }], ['bob', 1500, { hold: 'sticks', hits: { l: 0, r: 0 } }]].forEach(([w, x, p]) =>
      person(ctx, x, 960, 50, w, { legs: 'wide', mouth: 'scream', open: 1, rage: w === 'linda' ? 0 : .9, armR: p.hold === 'guitar' || p.hold === 'bass' ? undefined : { a: 165, e: 8 }, handR: 'fist', ...p, ...(w === 'linda' ? { mouth: 'o', open: .6, lids: .5 } : {}), t: tc }));
    oh(ctx, 960, 230, 280, age, -.04); }],
  [83.53, 3, (ctx, t, age) => { insBg(ctx, t, INK.red, INK.pink); const B = headFit(900, 600, 500, 'tasha'); person(ctx, B.x, B.y, B.s, 'tasha', { view: 'bust', mouth: 'scream', open: 1, rage: .9, gum: 1.3, eyes: 'wide', armL: { a: 165, e: 10 }, handL: 'fist', t: twos(t) }); oh(ctx, 1500, 430, 250, age, .1); }],
  [84.35, 4, (ctx, t, age) => { insBg(ctx, t); crowd(ctx, t, [-80, 420, 2080, 700], 30, { seed: 4, rows: 2, size: 120, depth: .75, view: 'front', style: 'flat', k: 1, jump: 1, headbang: .2, hands: .95, phones: 0, rage: 1, inks: 'pink' }); oh(ctx, 960, 240, 330, age, -.05); }],
  [87.65, 5, (ctx, t, age) => { insBg(ctx, t, INK.red, INK.pink); const sh = shake(t, 10), F = headFit(960 + sh[0], 610 + sh[1], 580, 'dan'); person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, wild: 1, stage: 1, tilt: -8, nod: -.15, t: twos(t) }); oh(ctx, 1560, 860, 260, age, .1); }],
];
const insertShot = ([t0, n, fn]) => (ctx, t) => { look(1); const age = t - t0, z = 1.12 - .1 * clamp(age * 24 / n); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); fn(ctx, t, age); ctx.restore(); misregFrame(ctx, 9 - age * 30, .4); };

// ---------- the chapter ----------
const T_POSE = beatTime(221);
const BASE = [[76.80, shower], [79.39, tread], [82.70, bed], [86.82, beach], [89.30, solo1], [90.12, solo2], [90.95, solo3], [91.77, solo4], [T_POSE, soloEnd]];
const SHOTS = [...BASE];
for (const I of INSERTS) {
  const t1 = I[0] + I[1] / 24, host = BASE.filter(s => s[0] <= I[0]).pop();
  SHOTS.push([I[0], insertShot(I)], [t1, host[1]]);
}
SHOTS.sort((a, b) => a[0] - b[0]);
chapter('post', 76.80, 92.30, SHOTS);

const ST = { mode: 'hero', box: HB, align: 'center', color: INK.paper, hot: INK.red, stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink } };
Object.assign(LYRICS, {
  45: { ...ST, words: [4, 5], rows: [2], emph: [5] },
  46: { ...ST, words: [4, 5], rows: [2], emph: [5] },
  47: { ...ST, words: [4], rows: [1] },
  48: { ...ST, words: [4, 5, 6, 7], rows: [4], emph: [7], end: 89.30 },
});
})();
