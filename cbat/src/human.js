// human.js: the cast rig (Dan, Greg, Linda, Tasha, Bob, Sam, seeded extras, far crowds) and their held props.
// Drawn in unit space like the rabbit rig: u = 1 is s pixels; every part gets its own DOMMatrix.
//
// person(ctx, x, y, s, who, pose = {}) -> anchors
//   (x, y) = ground point between the feet (also in view 'bust'). s = px per unit. Anime proportions (Saiki K. x Aggretsuko):
//   Dan is 10 u feet-to-crown (hair excluded), head (chin to crown) 1.56 u, about 6.4 heads; his hair adds ~.25 u and the
//   ahoge another ~.4 u when sprung. Others: Greg 11.1 (1.92 u head, mostly forehead), Bob 9.6, Sam 9.6, Linda 8.7, Tasha 8.4,
//   extras 8.9..10.4. Head centre sits at y - (H - head.ry) * s (9.22 u up for Dan); bustFit() does this maths for you.
//   who: 'dan' | 'greg' | 'linda' | 'tasha' | 'bob' | 'sam' | number (seeded extra) | a cast object (see CAST / extra()).
//     Outfit overrides on a cast object, e.g. {...CAST.dan, top: 'bare'}: top 'shirt' | 'bare' (skin from pal.skin) | 'tee' |
//     'polo' | 'hoodie' | 'sweater' | 'blouse' | 'cardigan' | 'zipvest', sleeve 'long' | 'short', bottom 'pants' | 'jeans' |
//     'shorts' | 'skirt', belt, shoes 'shoe' | 'sneaker' | 'chunky' | 'flat', tie, watch, lanyard.
//   pose (angles in degrees, all optional):
//     body: turn -1..1 (fake 3/4, faces screen-left..right), flip, lean (deg, + = top to screen-right), tilt (head roll),
//       nod (head drop in v1 head units: the head moves nod * ry / 1.4 u; - lifts), sq (squash; - = stretch), hop (u), sit 0..1 (chair seat 4.2 u), hunch 0..1 (office slump;
//       in 3/4 it also pushes the head towards the screen), legs: 'stand' | 'wide' | 'walk' | 'run' | 'jump' | 'kneel' |
//       'step' (facing-side foot up on a monitor wedge, stepH u, default 1), phase 0..1 (walk/run cycle)
//       stance 0..1 (line of action, full view only; default lerp(.22, .35 + .65 * rage, STYLE.k): an idle S-curve in the office): weight on
//       one leg, hips out, torso leaning back over it, knees bent, arms and feet off-symmetry, fists from about rage .3.
//       It only fills lean / tilt / arms / hands you leave undefined (with hold 'micstand' the lean goes into the mic).
//     arms: armL / armR = {a, e}: a shoulder angle (0 hangs, 90 out to the side, 170 up), e elbow bend
//       (+ bends the forearm further outward/up, - folds it inward across the body). L/R = screen-left/right (before flip).
//       reachL / reachR [x, y] (caller coords): IK the hand onto a point (keyboards, desks, a shoulder); beats armL/armR.
//       farArm: 'back' | 'front' (in 3/4 the far arm goes behind the body by default unless a prop is held)
//     hands: handL / handR = 'relax' | 'fist' | 'open' | 'point' | 'thumb' | 'horns' | 'grip' | 'wave' | 'type' | 'gun'
//       (gun = finger gun), twirl 0..1 (the "circle back" swirl lines around the right hand)
//     face: eyes 'open' | 'wide' | 'closed' | 'happy' | 'dead' | 'side' | 'rage' | 'x', lids 0..1, lx / ly -1..1 (look),
//       brows (raise, u-ish, -1..1), browTilt (+ worried, - angry), mouth 'polite' | 'smile' | 'flat' | 'frown' | 'o' | 'talk' |
//       'grit' | 'scream' | 'grin' | 'smirk', open 0..1, nostrils 0..1 (low-angle webcam),
//       gum 0..1.4 (Tasha's bubble: 0..1 grows, 1..1.4 popped and splatted across her face)
//     rage 0..1: the STYLE_SHEET rage scale (merges rageFace(rage) under your explicit fields): .25 twitch + strained smile +
//       tuft up, .5 temple vein + brows down + flared nostrils + red halftone flush from the collar + sweat, .75 bared teeth +
//       neck tendons + full-face flush + ear steam, 1 scream (teeth, tongue, uvula), spit, pulsing vein, tiny pupils,
//       crooked glasses, wild hair. Extras 0..1: sweat, steam, spit, blush, glare (blank white glasses), twitch.
//     hair: wild 0..1 (Dan: the ahoge springs upright by .5, whole-head spikes by 1)
//     outfit: stage 0..1 (default 1 when STYLE.k >= .8, else 0). Dan: tie -> red forehead headband, shirt untucked, collar
//       open, sleeves rolled (smartwatch shows), sweat patches. Linda: glasses up in her hair, cardigan sleeves pushed up.
//       Tasha: hoodie sleeves pushed up. Bob: white sweatband under the headset. Greg and Sam: no stage change.
//     badge: swing (deg, extra pendulum angle of the ID badge; it also counter-rotates against lean), vy (from jumpArc: the
//       badge floats up while falling)
//     held props: hold null | 'mic' | 'micstand' | 'guitar' | 'bass' | 'sticks' | 'phone' | 'mug' | 'tumbler' | 'laptop';
//       the rig IKs the hands onto the prop unless you pass that arm. Hand props (mic, phone, mug, tumbler) sit in the right
//       hand; holdHand: 'L' moves them to the left. strum 0..1 (picking-hand phase), fret 0..1 (neck hand: 0 = by the
//       headstock, 1 = up by the body), hits {l, r} 0..1 (stick strokes: 0 = raised, 1 = impact; see the stroke curve in
//       LOOKS.band), lasso 0..1 (mic whirled on its cable overhead, 'mic' only), phoneFace (show the screen, not the case),
//       screen (c, [x, y, w, h]) => paints the laptop screen in its own px-like units (w = 300, h = 180), micAt / standAt [x, y]
//       (micstand: mic and stand-foot positions in caller coords; default: mic at the mouth, foot slanted out ahead)
//     view: 'full' (default) | 'bust' (no legs/shadow; cheaper; webcam tiles). col: palette overrides. noShadow. t (time,
//       default the frame time BOIL_T) drives sweat, steam, spit, twitch and the beat-pulsing vein.
//   Returns anchors in the caller's coordinates: {head, top, forehead, eyeL, eyeR, mouth, chest, hip, handL, handR, badge,
//     mic (mic head, when held), neck, laptop (screen quad [tl, tr, br, bl]; standing = screen faces camera, sitting = lid
//     back faces camera), tipL / tipR (stick tips), s}.
//   Cost (JS time, LOOKS.a_perf): full body 1.5-2.8 ms, bust 0.7-1.8 ms, a 600 px close-up head 2-5 ms, crowdPerson ~15 us;
//   the GPU raster at flush costs about as much again (the same as the v1 rig).
//
// Helpers:
//   singOpen(t, li0, li1) -> mouth openness 0..1 from LINES word times     blink(t, times | seed, d) -> lids 0..1
//   twitchAt(t, k) -> twitch amount (bursty, on twos)     headbang(t, every = 1, amt = 1) -> {nod, tilt, lean, swing}
//   jumpArc(t, t0, d = .5, h = 2.5) -> {hop, sq, vy}     rageFace(r) -> pose fragment
//   CAST {dan, greg, linda, tasha, bob, sam}     extra(seed) -> cast object for a generic lanyarded coworker
//   crowdPerson(ctx, x, y, s, seed, {jump, nod, arms}) -> far crowd body (flat, no shading; < 1 ms)
//   bustFit([x, y, w, h], who, {zoom = 1, dy = 0}) -> {x, y, s}: places person(..., {view: 'bust'}) as webcam framing, with
//     headroom for the hair and Dan's sprung ahoge (head centre at 48% of the box height, head ry = 26% of it); zoom punches in
//     on the face (the point between the eyes and the mouth stays put)
//   headFit(x, y, hh, who = 'dan') -> {x, y, s}: close-up framing, head centre at (x, y), head (chin to crown) hh px tall.
//     A v1 close-up person(ctx, X, Y + 8.6 * s, s, ...) (head centre Y, head 2.8 s tall) is headFit(X, Y, 2.8 * s).
//   foreheadCam(ctx, [x, y, w, h], t, who = 'greg', pose, {k, dx}) -> Greg far too close and too low in his webcam, ceiling
//     and ring light behind him. k 0: forehead fills the top, eyes and nostrils low; k 1: a vast shiny forehead landscape
//     with the eyebrows along the bottom edge (ring light reflected in the shine, sparkle, a sweat bead).
//   tube(spine, wf, n) -> closed outline of a tapered tube (exported for other rigs).
// Look-dev: LOOKS.cast_office, cast_stage, dan_faces, cast_faces, dan_scream, split, band, poses, greg, busts, human_crowd, human_props,
//   hands, legs, gum, flip, small, turn, human_perf; anime: a_sheet_<who> / a_body_<who> (who = dan..sam or 7; t < 1 office,
//   else stage), a_lineup, a_overrides, a_perf, anime_dan_poses, anime_dan_closeup(_office), anime_greg_head, anime_compare.
//   e.g. node render.mjs --look=a_sheet_dan --sheet=0.3,1.3 --cols=1 --w=1600
(() => {
const PREV = window.person ? { person: window.person, bustFit: window.bustFit } : null;   // the live rig, when this file is injected over it (look-dev compare)
const deg = a => a * Math.PI / 180;
const SEAT = 4.2;
const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const nrm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const rotv = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
const tp = (M, p) => { const q = M.transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; };
const resolve = (p, k) => { const o = {}; for (const key in p) { const v = p[key]; o[key] = Array.isArray(v) ? mix(v[0], v[1], k) : v; } return o; };

// ---------- geometry ----------
// Closed outline of a tube along a spine with width profile wf(s) (s 0..1 along the length).
function tube(spine, wf, n = 12) {
  const d = sampleSpline(spine, false, true, .1), L = [0]; let tot = 0;
  for (let i = 1; i < d.length; i++) { tot += dist(d[i - 1], d[i]); L.push(tot); }
  if (d.length < 2 || tot < 1e-4) return ell(spine[0][0], spine[0][1], wf(0) / 2, wf(0) / 2, 10);
  const left = [], right = []; let j = 0, a0 = 0;
  for (let i = 0; i <= n; i++) {
    const s = Math.min(i / n, .999) * tot; while (j < d.length - 2 && L[j + 1] < s) j++;
    const k = (s - L[j]) / ((L[j + 1] - L[j]) || 1), a = Math.atan2(d[j + 1][1] - d[j][1], d[j + 1][0] - d[j][0]); if (!i) a0 = a;
    const x = lerp(d[j][0], d[j + 1][0], k), y = lerp(d[j][1], d[j + 1][1], k), w = wf(i / n) / 2, nx = -Math.sin(a), ny = Math.cos(a);
    left.push([x + nx * w, y + ny * w]); right.push([x - nx * w, y - ny * w]);
  }
  const e = d[d.length - 1], p = d[d.length - 2], a = Math.atan2(e[1] - p[1], e[0] - p[0]), w1 = wf(1) * .5, w0 = wf(0) * .5;
  return [[d[0][0] - Math.cos(a0) * w0 * .6, d[0][1] - Math.sin(a0) * w0 * .6], ...left, [e[0] + Math.cos(a) * w1, e[1] + Math.sin(a) * w1], ...right.reverse()];
}
// two-bone IK: elbow/knee for a limb from A towards P; pref picks the bend side. Returns [joint, reached end].
function ik2(A, P, l1, l2, pref) {
  const dx = P[0] - A[0], dy = P[1] - A[1], D = Math.hypot(dx, dy) || 1e-6, Dc = clamp(D, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const ux = dx / D, uy = dy / D, a = (l1 * l1 - l2 * l2 + Dc * Dc) / (2 * Dc), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const nx = -uy, ny = ux, sg = nx * pref[0] + ny * pref[1] >= 0 ? 1 : -1;
  return [[A[0] + ux * a + nx * h * sg, A[1] + uy * a + ny * h * sg], [A[0] + ux * Dc, A[1] + uy * Dc]];
}
function fk(S, side, a, e, l1, l2) {
  const d1 = [side * Math.sin(deg(a)), Math.cos(deg(a))], a2 = a + e, d = [side * Math.sin(deg(a2)), Math.cos(deg(a2))];
  const E = add(S, d1, l1); return { S, E, W: add(E, d, l2), d };
}
const HEAD_FRONT = [[1, -.05], [.99, .2], [.93, .42], [.78, .64], [.52, .86], [.24, .97], [0, 1], [-.24, .97], [-.52, .86], [-.78, .64], [-.93, .42], [-.99, .2], [-1, -.05], [-.98, -.42], [-.84, -.76], [-.5, -.97], [0, -1.02], [.5, -.97], [.84, -.76], [.98, -.42]];
// anime head outline: round cranium, cheeks narrowing to a soft point; drop (fraction of ry) opens the jaw for screams.
// h.sq squares the jaw off (a flat chin), h.jowl fills the cheeks: both make a face read older and heavier.
function headPts(h, turn, drop = 0) {
  return HEAD_FRONT.map(([u, v]) => {
    let x = u * h.rx, y = v * h.ry;
    if (v > 0) { x *= 1 - (h.jaw || 0) * v * v + drop * .32 * v + (h.sq || 0) * 2.2 * v ** 4 + (h.jowl || 0) * Math.sin(v * Math.PI); y += drop * h.ry * clamp((v - .2) / .8) + (h.sq || 0) * .06 * h.ry * v ** 6; }
    else x *= 1 + (h.crown || 0) * -v;
    x += turn * h.rx * (.16 * (1 - v * v) * Math.sign(u) * (Math.sign(u) === Math.sign(turn) ? -.55 : 1) + .12 * Math.max(0, v));
    return [x, y];
  });
}
// ---------- form shading ----------
// Shadow only on the side away from LIGHT: halftone growing to the edge on stage, one flat cel band in the office.
// The lit core is the shape shifted towards the light by `off` (default amt = 38% of its depth along the light);
// tubes (o.spine = joint points, o.w = width) grow their dots across the width so long limbs shade along one side.
function tubeK(sp, w, sd) {
  const segs = [];
  for (let i = 0; i < sp.length - 1; i++) { const p = sp[i], q = sp[i + 1], L = dist(p, q) || 1e-6, d = [(q[0] - p[0]) / L, (q[1] - p[1]) / L]; let n = [-d[1], d[0]]; if (n[0] * sd[0] + n[1] * sd[1] < 0) n = [-n[0], -n[1]]; segs.push([p, d, n, L, Math.abs(n[0] * sd[0] + n[1] * sd[1])]); }
  return (x, y) => { let best = 1e9, k = 0;
    for (const [p, d, n, L, al] of segs) { const t = clamp((x - p[0]) * d[0] + (y - p[1]) * d[1], 0, L), vx = x - p[0] - d[0] * t, vy = y - p[1] - d[1] * t, dd = vx * vx + vy * vy;
      if (dd < best) { best = dd; k = clamp(((vx * n[0] + vy * n[1]) / (w / 2) - .3) / .7) * (.5 + .5 * al); } }
    return k * .85; };
}
function form(R, P, o) {
  const c = R.c, sd = nrm(-LIGHT[0], -LIGHT[1]), b = bbox(P), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, sm = o.smooth ?? true;
  const ext = Math.abs(sd[0]) * (b[2] - b[0]) + Math.abs(sd[1]) * (b[3] - b[1]), off = o.off ?? (o.w ? o.w * .5 : ext * (o.amt ?? .34));
  c.save(); clipPts(c, P, sm);
  if (STYLE.flat || o.flat) fillPts(c, P, o.tone || mix(o.fill, o.dk, .55), sm);
  else dotsIn(c, b, { spacing: R.SP, color: o.dk, k: o.spine ? tubeK(o.spine, o.w, sd) : (x, y) => clamp(((x - cx) * sd[0] + (y - cy) * sd[1] - ext / 2 + off * 1.25) / (off * 1.25)) * .9 });
  fillPts(c, P.map(([x, y]) => [x - sd[0] * off, y - sd[1] * off]), o.fill, sm);
  c.restore();
}
// ink() with form shading instead of a full-shape halftone ramp: {fill, dk (shadow ink), amt | off | spine + w, line, boil, seed, smooth}.
function inkF(R, pts, o) {
  const P = o.boil === 0 ? pts : boil(pts, o.boil ?? 1.4, o.seed || 0), sm = o.smooth ?? true;
  fillPts(R.c, P, o.fill, sm);
  if (o.dk && R.s >= 18) form(R, P, o);
  if (o.line !== 0) outline(R.c, P, o.line ?? 3, o.lineColor || INK.ink, { smooth: sm, seed: o.seed, heavy: o.heavy });
  return P;
}
const arcIdx = (hp, i0, i1, sc, cx = 0, cy = 0) => { const o = [], n = hp.length; for (let i = i0; i <= i1; i++) { const q = hp[mod(i, n)]; o.push([cx + (q[0] - cx) * sc, cy + (q[1] - cy) * sc]); } return o; };

// ---------- palettes ----------
// Every colour is [office, stage]; blended with mix(office, stage, STYLE.k).
const PAL = {
  mouthIn: ['#7A4348', '#4A0A1C'], throat: ['#5A2E34', '#2A0610'], tongue: ['#DC8A90', '#FF4F70'], teeth: ['#FBF7EE', '#FFFBF2'],
  white: ['#FBF8F2', '#FFFBF2'], pupil: ['#34313A', '#16121F'], blush: ['#EBA7A4', '#FF3D8B'], sweat: ['#DCEEF5', '#BDF2FF'],
  vein: [INK.red, INK.red], badge: ['#F7F6F2', '#FFFBF2'], steam: ['#FFFFFF', '#FFFBF2'], metal: ['#9A98A0', '#6E6A78'],
  glare: ['#F6F9FF', '#FFFBF2'], flush: [INK.red, INK.red], lash: ['#3A3440', INK.ink], iris: ['#5E4A42', '#3A1A1E'],
};
const SKINS = [['#F3D3BC', '#FFC6A5', '#DDB5A0', '#EE9A86'], ['#EBC4A2', '#F6B48C', '#D3A684', '#D98462'], ['#D9A988', '#E8A070', '#BE8C6E', '#C06A48'],
  ['#B88262', '#C47C55', '#99674C', '#8E4A30'], ['#93644A', '#A2603C', '#784F3A', '#6E3420'], ['#6E4A38', '#7E4A32', '#563A2C', '#4A2214']];
const HAIRS = [['#3A302C', '#16121F'], ['#5E4A3E', '#2B1A16'], ['#8A6A4A', '#C46A2A'], ['#C9A86A', '#FFD23F'], ['#B9B6B8', '#E6E2EA'], ['#9A5A3A', '#E8501F'], ['#2A2426', '#16121F']];
const SHIRTS = [['#C7D3DE', '#9ED3F7'], ['#D9CFC2', '#F7EEDC'], ['#B9C4B0', '#8BE3B0'], ['#D6C0C8', '#FF9CC2'], ['#A9B2C2', '#2B59FF'], ['#E3DCC8', '#FFD23F'], ['#C2B8D0', '#8250DF'], ['#E6E6E2', '#FFFBF2']];
const PANTS = [['#5A5E6A', '#28346E'], ['#CDBC98', '#F0C774'], ['#7A8494', '#2B59FF'], ['#4A4650', '#16121F'], ['#8A7A68', '#C73A0E']];
const LANY = [['#5C7FA3', '#2B59FF'], ['#A3605C', '#E8203A'], ['#6E8C6A', '#1FB36B'], ['#7A6A9A', '#8250DF'], ['#C49A4A', '#FF5A1F']];

// head fields (u, head-local): rx/ry, jaw/sq/jowl (shape, see headPts), eyeY/eyeX/eyeR, fu (nose and mouth size unit, default eyeR[1]), noseY, mouthY/mouthW, brow/browY.
// Cast fields beyond the outfit: age 0..1 (smile lines, crow's feet, a double chin at 1).
const BASE_HEAD = { rx: .6, ry: .76, jaw: .03, crown: .03, eyeY: .1, eyeX: .47, eyeR: [.145, .115], noseY: .35, nose: 'button', mouthY: .54, mouthW: .08, brow: .04, browY: .09 };
const BASE_BODY = { neck: .32, neckW: .17, leg: 4.7, sh: 1.0, ch: .86, waist: .76, hip: .8, belly: 0, arm: [1.75, 1.58], limb: .32, hand: .9, rest: [6, -10] };
const mk = c => ({ ...c, head: { ...BASE_HEAD, ...(c.head || {}) }, body: { ...BASE_BODY, ...(c.body || {}) }, pal: c.pal || {} });

const CAST = {
  dan: mk({ key: 'dan', name: 'Dan Kowalski', H: 10,
    head: { rx: .62, ry: .78, jaw: .02, crown: .04, eyeY: .13, eyeX: .47, eyeR: [.17, .15], noseY: .4, nose: 'long', mouthY: .58, mouthW: .08, brow: .05, browY: .09 },
    body: { neck: .26, neckW: .2, leg: 5.02, sh: 1.0, ch: .82, waist: .7, hip: .74, arm: [1.82, 1.62], limb: .3, hand: .9 },
    hair: 'dan', glasses: 'rect', top: 'shirt', sleeve: 'long', tie: true, lanyard: true, badge: 'DAN K.', bottom: 'pants', belt: true, shoes: 'shoe', watch: true,
    face: { mouth: 'polite', lids: .12 },
    pal: { skin: ['#F5DCC4', '#FFCFAE'], skinDk: ['#DDB494', '#E89A78'], hair: ['#5E4A3E', '#2B1A16'], hairDk: ['#3E322C', '#16121F'],
      top: [INK.oshirt, '#A6D8F7'], topDk: ['#93AAC4', '#2B59FF'], tie: ['#3D4A6E', INK.red], tieDk: ['#2C3654', INK.redDk], pants: ['#CDBC98', '#EFC77E'], pantsDk: ['#AD9C78', '#B9813A'],
      shoe: ['#6B4E3B', '#4A2412'], belt: ['#5C4535', '#2A1A14'], lanyard: ['#5C7FA3', INK.blue], frame: ['#2E2B33', INK.ink], accent: ['#5C7FA3', INK.blue] } }),
  greg: mk({ key: 'greg', name: 'Greg Hollis (He/Him)', H: 11.1,
    head: { rx: .74, ry: .96, jaw: -.04, sq: .22, jowl: .07, crown: .12, eyeY: .3, eyeX: .43, eyeR: [.14, .075], fu: .1, noseY: .55, nose: 'big', mouthY: .72, mouthW: .12, brow: .062, browY: .07 },
    body: { neck: .32, neckW: .25, leg: 5.4, sh: 1.18, ch: 1.05, waist: 1.0, hip: .92, belly: .16, arm: [1.95, 1.75], limb: .36, hand: .98, rest: [5, -8] },
    hair: 'greg', top: 'zipvest', sleeve: 'long', bottom: 'pants', belt: true, shoes: 'shoe', ear: 'airpods', age: 1,
    face: { mouth: 'grin', lids: .38, brows: .1 },
    pal: { skin: ['#E9B898', '#F6A783'], skinDk: ['#CC9677', '#D9775A'], hair: ['#5A4A40', '#2A1E18'], hairDk: ['#3E322C', '#16121F'], hairLt: ['#9A928C', '#E6E2EA'],
      top: ['#F1F2F3', '#FFFBF2'], topDk: ['#C9CDD3', '#9ED3F7'], vest: ['#3E4C6A', '#1A2A8C'], vestDk: ['#2C374E', '#16121F'], pants: ['#7C8088', '#28346E'], pantsDk: ['#62656C', '#16121F'],
      shoe: ['#3E3A3A', '#16121F'], belt: ['#2E2C2E', '#16121F'], accent: ['#3E4C6A', INK.blue] } }),
  linda: mk({ key: 'linda', name: 'Linda Marsh', H: 8.7,
    head: { rx: .68, ry: .8, jaw: -.06, eyeY: .14, eyeX: .46, eyeR: [.14, .105], noseY: .38, nose: 'button', mouthY: .56, mouthW: .08, brow: .035, browY: .09 },
    body: { neck: .22, neckW: .17, leg: 3.85, sh: .95, ch: 1.0, waist: 1.06, hip: 1.16, belly: .14, arm: [1.55, 1.4], limb: .34, hand: .84, rest: [5, -14] },
    hair: 'linda', glasses: 'reading', top: 'cardigan', sleeve: 'long', bottom: 'pants', shoes: 'flat', ear: 'pearls', age: .5,
    face: { mouth: 'flat', lids: .32 },
    pal: { skin: ['#F3D6C4', '#FFCDB5'], skinDk: ['#DDB6A0', '#EE9A86'], hair: ['#CFCED3', '#EEECF4'], hairDk: ['#A7A6AF', '#8C9AD8'],
      top: ['#BBA9D6', '#B48CFF'], topDk: ['#9886B6', '#8250DF'], blouse: ['#F4EEE4', '#FFFBF2'], flower: ['#E39BB0', INK.pink], leaf: ['#93AA8C', INK.green],
      pants: ['#4C4A5E', '#28346E'], pantsDk: ['#3A384A', '#16121F'], shoe: ['#5A4A5E', '#16121F'], frame: ['#A3584A', INK.red], bead: ['#C9A64A', INK.yellow],
      guitar: ['#E9D27A', INK.yellow], guitarDk: ['#C9A84A', INK.orange], accent: ['#BBA9D6', INK.purple] } }),
  tasha: mk({ key: 'tasha', name: 'Tasha Jordan', H: 8.4,
    head: { rx: .6, ry: .7, jaw: .03, eyeY: .14, eyeX: .47, eyeR: [.15, .13], noseY: .36, nose: 'button', mouthY: .52, mouthW: .07, brow: .035, browY: .08 },
    body: { neck: .24, neckW: .15, leg: 4.0, sh: 1.0, ch: .95, waist: .9, hip: .82, arm: [1.55, 1.4], limb: .38, hand: .8, rest: [4, -12] },
    hair: 'tasha', top: 'hoodie', sleeve: 'hoodie', bottom: 'jeans', shoes: 'chunky', ear: 'airpods',
    face: { mouth: 'flat', lids: .38, eyes: 'open' },
    pal: { skin: ['#B88262', '#C47C55'], skinDk: ['#99674C', '#8E4A30'], hair: ['#E7A6C4', INK.pink], hairDk: ['#C9839F', '#C4166A'],
      top: ['#AFC0A3', '#8BE3B0'], topDk: ['#8EA383', INK.green], pants: ['#93A6C2', '#4D7BFF'], pantsDk: ['#7488A6', INK.blueDk],
      shoe: ['#F2F0EA', INK.white], shoeDk: ['#D6D2C8', INK.paperDk], phone: ['#E7A6C4', INK.pink], bass: ['#E9A2BF', INK.pink], bassDk: ['#C9839F', INK.redDk], accent: ['#E7A6C4', INK.pink] } }),
  bob: mk({ key: 'bob', name: 'Bob Brennan', H: 9.6,
    head: { rx: .72, ry: .84, jaw: -.1, crown: .04, eyeY: .06, eyeX: .45, eyeR: [.13, .1], noseY: .32, nose: 'round', mouthY: .52, mouthW: .1, brow: .055, browY: .08 },
    body: { neck: .14, neckW: .26, leg: 4.2, sh: 1.32, ch: 1.36, waist: 1.48, hip: 1.28, belly: .26, arm: [1.72, 1.55], limb: .44, hand: 1.04, rest: [10, -10] },
    hair: 'bob', beard: 'ginger', top: 'polo', sleeve: 'short', bottom: 'shorts', shoes: 'sneaker', ear: 'headset', age: .4,
    face: { mouth: 'smile', lids: .1 },
    pal: { skin: ['#F2C9AE', '#FFBC9A'], skinDk: ['#D9A88C', '#E8896A'], hair: ['#C9794A', INK.orange], hairDk: ['#A35E36', INK.redDk],
      top: ['#7E9AB0', INK.blue], topDk: ['#647F95', INK.blueDk], pants: ['#A39A7C', '#C9A84A'], pantsDk: ['#857C60', INK.orangeDk],
      shoe: ['#A8A8AC', '#6E6A78'], shoeDk: ['#8A8A90', '#16121F'], sock: ['#F2F0EA', INK.white], headset: ['#3A3A40', INK.ink], accent: ['#E9D27A', INK.yellow] } }),
  sam: mk({ key: 'sam', name: 'Sam', H: 9.6,
    head: { rx: .6, ry: .74, jaw: .03, eyeY: .12, eyeX: .47, eyeR: [.145, .115], noseY: .36, nose: 'wide', mouthY: .54, mouthW: .08, brow: .04, browY: .09 },
    body: { neck: .34, neckW: .16, leg: 4.75, sh: .98, ch: .84, waist: .74, hip: .78, arm: [1.75, 1.58], limb: .3, hand: .87 },
    hair: 'sam', freckles: true, top: 'tee', sleeve: 'short', bottom: 'pants', shoes: 'sneaker',
    face: { mouth: 'flat', lids: .3 },
    pal: { skin: ['#7B5240', '#8A5238'], skinDk: ['#5F3E30', '#5A2418'], hair: ['#2E2420', '#16121F'], hairDk: ['#1E1816', '#16121F'], freckle: ['#4A3024', '#3A1408'],
      top: ['#D9CBBE', INK.paper], topDk: ['#B9AB9E', INK.pinkLt], pants: ['#5A5E6A', '#28346E'], pantsDk: ['#44474F', '#16121F'], shoe: ['#E6E6E2', INK.white], accent: ['#D9CBBE', INK.pink] } }),
};
// ---------- extras ----------
const EXTRA_NAMES = ['Priya S.', 'Marcus T.', 'Jenna W.', 'Kevin L.', 'Aisha M.', 'Tom R.', 'Mei C.', 'Raj P.', 'Olivia B.', 'Dmitri V.', 'Carla G.', 'Sean O.',
  'Fatima H.', 'Brad K.', 'Yuki N.', 'Leo F.', 'Nadia A.', 'Chris D.', 'Grace E.', 'Omar Z.', 'Hannah J.', 'Diego M.', 'Ruth P.', 'Ben S.'];
const XC = new Map();
function extra(seed) {
  seed = Math.floor(seed) || 0; if (XC.has(seed)) return XC.get(seed);
  const r = rng(seed * 7919 + 13), pick = a => a[Math.floor(r() * a.length)], fem = r() < .5;
  const sk = pick(SKINS), hc = pick(HAIRS), sh = pick(SHIRTS), pa = pick(PANTS), la = pick(LANY);
  const hair = fem ? pick(['bob', 'pony', 'long', 'curly', 'bun', 'short']) : pick(['short', 'side', 'bald', 'buzz', 'curly', 'side']);
  const H = (fem ? 8.9 : 9.5) + r() * .9, wide = r();
  const top = pick(fem ? ['blouse', 'shirt', 'sweater', 'tee', 'cardigan'] : ['shirt', 'shirt', 'polo', 'sweater', 'tee', 'zipvest']);
  const c = mk({ key: 'x' + seed, name: EXTRA_NAMES[seed % EXTRA_NAMES.length], H, seed,
    head: { rx: .57 + r() * .12, ry: .73 + r() * .08, jaw: r() * .08 - .02, eyeY: .08 + r() * .06, nose: pick(['button', 'long', 'wide', 'round']), mouthW: .07 + r() * .025, brow: .035 + r() * .02 },
    body: { neck: .3, leg: H * .48, sh: .92 + wide * .35, ch: .8 + wide * .35, waist: .7 + wide * .45, hip: .76 + wide * .38 + (fem ? .1 : 0), belly: wide > .7 ? .16 : 0, limb: .3 + wide * .08 },
    hair, glasses: r() < .32 ? 'round' : null, beard: !fem && r() < .3 ? (r() < .5 ? 'full' : 'stubble') : null,
    top, sleeve: top === 'polo' || top === 'tee' ? 'short' : 'long', tie: top === 'shirt' && !fem && r() < .4, lanyard: true, badge: '',
    bottom: fem && r() < .35 ? 'skirt' : 'pants', belt: !fem, shoes: pick(['shoe', 'sneaker', 'flat']), ear: r() < .2 ? 'airpods' : null,
    face: { mouth: pick(['polite', 'flat', 'smile', 'polite']), lids: .1 + r() * .3 },
    pal: { skin: [sk[0], sk[1]], skinDk: [sk[2], sk[3]], hair: hc, hairDk: [mix(hc[0], '#000000', .25), mix(hc[1], '#000000', .3)],
      top: sh, topDk: [mix(sh[0], '#5A5866', .25), mix(sh[1], INK.ink, .35)], vest: pick(PANTS), vestDk: ['#3A3A44', INK.ink], blouse: sh, flower: ['#E39BB0', INK.pink], leaf: ['#93AA8C', INK.green],
      tie: pick(LANY), tieDk: ['#3A3A44', INK.ink], pants: pa, pantsDk: [mix(pa[0], '#000000', .18), mix(pa[1], INK.ink, .3)], shoe: ['#5A4A40', '#2A1A14'], shoeDk: ['#3A302A', INK.ink],
      belt: ['#4A3A30', '#16121F'], lanyard: la, frame: ['#3A3640', INK.ink], accent: la } });
  XC.set(seed, c); return c;
}
const castOf = who => typeof who === 'number' ? extra(who) : typeof who === 'string' ? (CAST[who] || CAST.dan) : (who && who.head ? who : mk(who || {}));

// ---------- pose helpers ----------
function singOpen(t, li0 = 0, li1 = LINES.length - 1) {
  let v = 0;
  for (let li = Math.max(0, li0); li <= Math.min(li1, LINES.length - 1); li++) { const L = LINES[li]; if (t < L.a - .2 || t > L.b + .3) continue;
    for (const w of L.words) { const a = w.a - .03, b = Math.max(w.b, a + .12); if (t >= a && t < b + .12) v = Math.max(v, Math.min(1, (t - a) / .05) * (t < b ? .65 + .35 * Math.sin((t - a) / (b - a) * Math.PI) : 1 - (t - b) / .12)); } }
  return clamp(v);
}
// blink(t, times, d): lids for blinks centred at the given times; times may be a number seed for automatic blinks every 2.5-4.5 s.
function blink(t, times, d = .12) {
  if (typeof times === 'number') { const p = 3.4, i = Math.floor(t / p), c = (i + .3 + hash(i * 7.3 + times) * .5) * p; return blink(t, [c, c - p, c + p], d); }
  let v = 0; for (const b of times || []) { const k = Math.abs(t - b) / d; if (k < 1) v = Math.max(v, 1 - k * k); } return v;
}
// Eye twitch: bursts of lid tremor on twos. Pass as pose.twitch.
function twitchAt(t, k = 1) { const f = Math.floor(t * 12), burst = noise1(t * 1.3 + 4) > .1 ? 1 : .25; return clamp(k) * burst * (.35 + .65 * hash(f * 1.7)); }
// Headbang on the beat: head slams down on each beat (every = beats per bang).
function headbang(t, every = 1, amt = 1) {
  const b = beatAt(t + VLEAD) / every, p = frac(b), n = Math.floor(b), down = Math.exp(-p * 5.5), up = Math.sin(clamp((p - .45) / .55) * Math.PI);
  return { nod: amt * (down * .42 - up * .16), tilt: amt * (n % 2 ? 7 : -7) * (down * .8 + .2), lean: amt * (down * 9 - up * 4), swing: amt * (n % 2 ? 1 : -1) * 28 * (1 - down) };
}
function jumpArc(t, t0, d = .5, h = 2.5) {
  const k = (t - t0) / d;
  if (k < -.24 || k > 1.3) return { hop: 0, sq: 0, vy: 0 };
  if (k < 0) return { hop: 0, sq: .4 * Math.sin(clamp(-k / .24) * Math.PI), vy: 0 };
  if (k > 1) return { hop: 0, sq: .45 * Math.exp(-(k - 1) * 12) * Math.sin((k - 1) * 30 + 1.6), vy: 0 };
  return { hop: h * 4 * k * (1 - k), sq: -.28 * Math.sin(k * Math.PI) * (1 - k), vy: 1 - 2 * k };
}
function rageFace(r) {
  r = clamp(r); const top = r >= .86;
  return { rage: r, mouth: r < .62 ? 'polite' : top ? 'scream' : 'grit', open: top ? remap(r, .86, 1, .75, 1) : 0,
    eyes: r < .62 ? 'open' : top ? 'rage' : 'wide', lids: r < .62 ? lerp(.1, .3, r / .62) : 0, brows: top ? .05 : -r * .2,
    browTilt: -clamp(r / .5) * (top ? 1.3 : 1.05), twitch: r > .12 && r < .72 ? clamp((r - .12) / .13) : 0, wild: clamp(r * 1.25),
    sweat: clamp((r - .4) * 1.8), steam: r > .66 ? clamp((r - .66) / .1) : 0, spit: clamp((r - .86) / .14), nostrils: clamp((r - .4) / .3) };
}

// ---------- hands ----------
// Drawn in a local frame at the wrist: +y runs along the forearm out of the wrist, the thumb sits on the -x side (mirrored per arm).
const fingerT = (a, b, w) => tube([a, b], s => w * (1 - s * .18), 4);
function drawHand(R, W, d, side, kind, sc = 1) {
  const c = R.c, col = R.col, small = R.s * sc < 22, rot = Math.atan2(d[1], d[0]) - Math.PI / 2, hs = R.C.body.hand * sc * 1.5;
  // thumbs up is drawn world-aligned (a fist on its side, the thumb straight up) so it can never read as a middle finger
  const thumbUp = kind === 'thumb' && R.s * sc >= 22;
  c.save(); c.translate(W[0] + (thumbUp ? d[0] * .3 * hs : 0), W[1] + (thumbUp ? d[1] * .3 * hs : 0)); if (!thumbUp) c.rotate(rot); c.scale(side * hs, hs);
  const lw = R.L(2.8) / hs, bo = R.Bo(.6), sk = { fill: col.skin, line: lw, boil: bo, seed: side * 5 };
  const up = [-Math.sin(rot) * side, -Math.cos(rot)];       // world-up in the hand frame (for thumbs up)
  const F = (a, b, w = .13) => ink(c, fingerT(a, b, w), sk), groove = (x, y0, y1) => inkLine(c, [[x, y0], [x + .01, y1]], lw * .85, INK.ink, { taper: [.15, .25] });
  if (small) { if (kind === 'thumb') { c.restore(); c.save(); c.translate(W[0] + d[0] * .3 * hs, W[1] + d[1] * .3 * hs); c.scale(side * hs, hs); // a fat stub straight up from a fist
      ink(c, [[-.28, -.62], [-.06, -.62], [-.06, -.1], [.28, -.1], [.28, .28], [-.28, .28]], { ...sk, smooth: false }); }
    else ink(c, ell(0, .26, .22, .26, 10), sk); c.restore(); return; }
  // a chunky squared fist: knuckle row at the far end, the thumb wrapped across the front
  const fist = (thumb = true) => { ink(c, [[-.2, .02], [.19, .02], [.26, .14], [.28, .34], [.23, .48], [.08, .54], [-.1, .54], [-.24, .47], [-.28, .28], [-.26, .12]], sk);
    for (let i = 0; i < 3; i++) groove(-.12 + i * .12, .4, .53);
    if (thumb) F([-.27, .2], [.04, .34], .14); };
  switch (kind) {
    case 'fist': case 'grip': fist(); break;
    case 'point': F([-.1, .42], [-.13, .98], .15); fist(); break;
    case 'gun': F([-.1, .42], [-.13, 1.0], .15); fist(false); F([-.24, .22], add([-.24, .22], up, .42), .15); break;
    case 'thumb': ink(c, [[-.26, -.12], [.18, -.16], [.27, -.04], [.28, .16], [.18, .26], [-.22, .26], [-.3, .12]], sk);
      for (let i = 0; i < 3; i++) inkLine(c, [[-.2, -.04 + i * .1], [.2, -.06 + i * .1]], lw * .85, INK.ink, { taper: [.1, .4] });
      ink(c, tube([[-.17, -.08], [-.2, -.34], [-.14, -.56]], s => lerp(.2, .16, s), 6), sk); break;
    case 'horns': F([-.11, .42], [-.24, 1.0], .15); F([.15, .4], [.3, .92], .13); fist(); break;
    case 'open': case 'wave': {
      const spread = kind === 'wave' ? .5 : 1;
      for (let i = 0; i < 4; i++) { const a = deg((-27 + i * 18) * spread), L = [.36, .43, .41, .32][i]; F([-.13 + i * .09, .38], [-.13 + i * .09 + Math.sin(a) * L, .38 + Math.cos(a) * L], .13); }
      F([-.19, .14], [-.46, .38], .14); ink(c, ell(0, .27, .23, .22, 14), sk);
      if (kind === 'wave' && R.s > 40) for (const k of [-1, 1]) inkLine(c, [[k * .5, .5], [k * .62, .8], [k * .55, 1.05]], lw, INK.ink, { taper: [.3, .3] });
      break; }
    case 'type': ink(c, [[-.19, .02], [.19, .02], [.24, .3], [.2, .5], [-.2, .5], [-.25, .3]], sk);
      for (let i = 0; i < 4; i++) ink(c, ell(-.15 + i * .1, .52, .055, .07, 8), sk); break;
    default: // relax: the back of the hand, fingers loosely curled in towards the palm, the thumb along the front
      c.scale(.86, 1); ink(c, [[-.16, 0], [.15, 0], [.21, .16], [.24, .36], [.21, .5], [.13, .61], [.02, .63], [-.06, .56], [-.1, .44], [-.17, .3]], sk);
      for (const y of [.4, .5]) inkLine(c, [[.23, y - .05], [.09, y + .05]], lw * .7, INK.ink, { taper: [.2, .5] });
      ink(c, tube([[-.13, .05], [-.21, .27], [-.13, .45]], s => lerp(.15, .11, s), 6), sk);
  }
  c.restore();
}

// ---------- shoes and legs ----------
function drawShoe(R, A, side, ang = 0) {
  const c = R.c, col = R.col, kind = R.C.shoes, front = R.at < .25, f = R.f, at = R.at;
  const chunky = kind === 'chunky', sneaker = kind === 'sneaker' || chunky, h = chunky ? .46 : kind === 'flat' ? .28 : .34, len = front ? .42 : .38 + .3 * at, lw = R.L(3);
  c.save(); c.translate(A[0] + (front ? side * .04 : f * .2 * at), A[1] + .33 - h * .58); c.rotate(ang);
  // a rounded toe box with a heel and a sole: front = the toe dome facing camera, side = toe spring forwards
  const body = front ? [[-.26, -h], [.26, -h], [.39, -h * .4], [.45, h * .2], [.43, h * .58], [-.43, h * .58], [-.45, h * .2], [-.39, -h * .4]]
    : [[-len * .82, -h * .5], [-len * .55, -h], [len * .15, -h * .9], [len * .72, -h * .48], [len * 1.12, h * .02], [len * 1.12, h * .58], [-len * .86, h * .58]].map(([a, b2]) => [a * f, b2]);
  const fillC = col.shoe, sx = front ? .42 : len * 1.1;
  inkF(R, body, { fill: fillC, dk: R.s > 30 ? col.shoeDk || mix(fillC, INK.ink, .3) : null, amt: .4, line: lw, boil: R.Bo(.8) });
  if (sneaker) { const sole = [[-sx, h * .18], [sx, h * .18], [sx * 1.02, h * .66], [-sx * 1.02, h * .66]];
    ink(c, sole, { fill: chunky ? (col.shoeDk || INK.white) : INK.white, line: lw * .9, boil: R.Bo(.5), smooth: false });
    if (chunky) fillPts(c, rect(-len * .3, -h * .55, len * .6, h * .22), col.accent || INK.pink, false); }
  else { inkLine(c, [[-sx * .96, h * .34], [sx * .96, h * .34]], lw * .8, INK.ink, { taper: [.1, .1] });
    if (R.s > 26) fillPts(c, front ? ell(-.1, -h * .25, .13, .06, 10, -.2) : ell(f * len * .62, -h * .45, len * .2, h * .12, 10, f * .4), rgba(INK.white, .45)); }
  c.restore();
}

// ---------- props ----------
function drawMicHead(R, P, ax, sc = 1) {
  const c = R.c, lw = R.L(3), n = [-ax[1], ax[0]], head = add(P, ax, .55 * sc), r = .24 * sc;
  ink(c, tube([add(P, ax, -.45 * sc), add(P, ax, .3 * sc)], s => lerp(.15, .22, s) * sc, 4), { fill: INK.ink, line: lw, lineColor: INK.ink, boil: R.Bo(.5) });
  ink(c, tube([add(P, ax, .26 * sc), add(P, ax, .36 * sc)], () => .3 * sc, 3), { fill: R.col.metal, line: lw * .8, boil: R.Bo(.4) });
  ink(c, ell(head[0], head[1], r, r, 16), { fill: mix('#C9C7CF', '#E6E2EA', R.k), shade: { color: INK.ink, spacing: Math.max(R.SP * .7, .06), dir: [.5, .8], from: -.05, to: .3 }, line: lw, boil: R.Bo(.5) });
  if (R.s * sc > 45) { c.save(); clipPts(c, ell(head[0], head[1], r, r, 16)); for (let i = -2; i <= 2; i++) { inkLine(c, [add(add(head, n, i * r * .4), ax, -r), add(add(head, n, i * r * .4), ax, r)], lw * .4, INK.ink, { taper: [0, 0] }); inkLine(c, [add(add(head, ax, i * r * .4), n, -r), add(add(head, ax, i * r * .4), n, r)], lw * .4, INK.ink, { taper: [0, 0] }); } c.restore(); }
  return { bottom: add(P, ax, -.45 * sc), head };
}
function drawCable(R, a, b, sag = 1.2) { inkLine(R.c, bezPts(a, [a[0], a[1] + sag], [b[0], b[1] - sag * .2], b, 16), R.L(3.2), INK.ink, { taper: [0, 0] }); }
function drawGuitar(R, G, bass) {
  // bold enough to read at s = 30: big bodies (x1.4), heavy outline, contrasting pickguard
  const c = R.c, col = R.col, lw = R.L(3.4) * 1.45, bo = R.Bo(.8), bs = 1.4, sc = P => P.map(([x, y]) => [x * bs, y * bs]);
  c.save(); c.translate(G.at[0], G.at[1]); c.rotate(G.ang);
  const body = bass ? col.bass || INK.pink : col.guitar || INK.yellow, dk = bass ? col.bassDk || INK.redDk : col.guitarDk || INK.orange, nl = G.neck;
  ink(c, tube([[.3, 0], [nl, 0]], s => lerp(.27, .21, s), 6), { fill: mix('#8A5A36', '#7A4A2A', R.k), line: lw * .8, boil: bo });
  if (R.s > 28) for (let i = 1; i < 9; i++) { const x = nl - (nl - .9) * (1 - Math.pow(.84, i)) / (1 - Math.pow(.84, 9)); inkLine(c, [[x, -.12], [x, .12]], lw * .3, mix('#D6D0C4', INK.white, R.k), { taper: [0, 0], keepWeight: true }); }
  if (bass) {
    ink(c, [[nl - .05, -.15], [nl + .7, -.26], [nl + .8, .03], [nl + .62, .2], [nl - .05, .15]], { fill: body, line: lw * .8, boil: bo });
    for (let i = 0; i < 4; i++) ink(c, ell(nl + .15 + i * .16, -.31, .07, .08, 8), { fill: R.col.metal, line: lw * .4, boil: 0 });
    inkF(R, sc([[.55, -.42], [.15, -.55], [-.35, -.78], [-.85, -.62], [-1.2, -.4], [-1.25, .3], [-.85, .68], [-.25, .6], [.2, .45], [.5, .32], [.42, 0]]), { fill: body, dk, amt: .35, line: lw, boil: bo, seed: 41 });
    ink(c, sc([[.3, -.3], [-.2, -.45], [-.55, -.2], [-.4, .3], [.15, .32]]), { fill: INK.white, line: lw * .4, boil: bo });
    for (const [px, w2] of [[-.18, .14], [-.82, .18]]) fillPts(c, sc(rect(px, -.2, w2, .4)), INK.ink, false);
  } else {
    ink(c, [[nl - .05, -.15], [nl + .85, -.42], [nl + .65, .04], [nl - .05, .15]], { fill: body, line: lw * .8, boil: bo, smooth: false });
    inkF(R, sc([[.55, -.16], [.55, .16], [-1.45, .86], [-1.72, .62], [-.72, .07], [-.72, -.07], [-1.72, -.62], [-1.45, -.86]]), { fill: body, dk, amt: .35, line: lw, boil: bo, smooth: false, seed: 42 });
    ink(c, sc([[.45, -.12], [-.2, -.42], [-.45, -.15], [-.45, .15], [-.2, .42], [.45, .12]]), { fill: INK.ink, line: 0, boil: bo, smooth: false });
    for (const px of [-.1, .2]) fillPts(c, sc(rect(px, -.15, .16, .3)), R.col.metal, false);
    for (let i = 0; i < 3; i++) ink(c, ell((-1.15 + i * .2) * bs, (.55 + i * .03) * bs, .08, .08, 8), { fill: INK.white, line: lw * .3, boil: 0 });
  }
  const ns = bass ? 4 : 6;
  for (let i = 0; i < ns; i++) { const y = (i - (ns - 1) / 2) * (bass ? .055 : .036); inkLine(c, [[-.5 * bs, y * 1.6], [nl, y]], R.L(1.2) * (bass ? 1.3 : .9), mix('#E6E2EA', INK.white, R.k), { taper: [0, 0], keepWeight: true }); }
  c.restore();
}
function drawPhone(R, P, ang, face) {
  const c = R.c; c.save(); c.translate(P[0], P[1]); c.rotate(ang);
  ink(c, rrect(-.2, -.36, .4, .72, .07), { fill: face ? INK.ink : (R.col.phone || '#3A3A44'), line: R.L(2.8), boil: R.Bo(.4), smooth: false });
  if (face) fillPts(c, rrect(-.16, -.31, .32, .62, .04), mix('#CFE0F0', INK.cyan, R.k), false);
  else { fillPts(c, rrect(-.15, -.31, .14, .14, .04), INK.ink, false); fillPts(c, ell(-.11, -.27, .03, .03, 6), '#5A5A66'); }
  c.restore();
}
function drawMug(R, P, side) {
  const c = R.c, lw = R.L(2.8); c.save(); c.translate(P[0], P[1]);
  inkLine(c, [[side * -.22, -.12], [side * -.42, -.08], [side * -.42, .16], [side * -.22, .2]], lw * 2.2, INK.ink, { taper: [0, 0] });
  inkLine(c, [[side * -.22, -.12], [side * -.42, -.08], [side * -.42, .16], [side * -.22, .2]], lw * 1.1, mix('#F2EFE8', INK.white, R.k), { taper: [0, 0] });
  ink(c, [[-.26, -.32], [.26, -.32], [.24, .3], [-.24, .3]], { fill: mix('#F2EFE8', INK.white, R.k), shade: { color: mix('#D6D0C4', INK.pinkLt, R.k), spacing: R.SP, dir: [1, 0], from: 0, to: .3 }, line: lw, boil: R.Bo(.4) });
  fillPts(c, ell(0, -.31, .25, .06, 12), '#6A4A36');
  if (R.s > 70) { c.scale(R.flip, 1); txt(c, 'PER MY', 0, -.13, { font: 'ui', weight: 900, size: .1, color: INK.ink, align: 'center' }); txt(c, 'LAST', 0, .0, { font: 'ui', weight: 900, size: .1, color: INK.ink, align: 'center' }); txt(c, 'EMAIL', 0, .13, { font: 'ui', weight: 900, size: .1, color: INK.red, align: 'center' }); }
  else for (let i = 0; i < 3; i++) fillPts(c, rect(-.14, -.15 + i * .12, .28, .05), i === 2 ? INK.red : INK.ink, false);
  c.restore();
}
function drawTumbler(R, P, side) {
  const c = R.c, lw = R.L(3), body = mix('#9DB8B0', INK.cyan, R.k); c.save(); c.translate(P[0], P[1] - .3);
  inkLine(c, [[side * .32, -.45], [side * .62, -.38], [side * .6, .25], [side * .3, .3]], lw * 2.8, INK.ink, { taper: [0, 0] });
  inkLine(c, [[side * .32, -.45], [side * .62, -.38], [side * .6, .25], [side * .3, .3]], lw * 1.6, body, { taper: [0, 0] });
  inkLine(c, [[.08, -.9], [.2, -1.35]], lw * 1.4, mix('#E0E0E0', INK.pink, R.k), { taper: [0, 0] });
  ink(c, [[-.38, -.85], [.38, -.85], [.33, .55], [.22, .9], [-.22, .9], [-.33, .55]], { fill: body, shade: { color: mix(body, INK.ink, .3), spacing: R.SP, dir: [1, 0], from: 0, to: .4 }, line: lw, boil: R.Bo(.5) });
  ink(c, rrect(-.42, -1.0, .84, .2, .06), { fill: mix('#E6E6E2', INK.white, R.k), line: lw, boil: R.Bo(.4), smooth: false });
  fillPts(c, rrect(-.2, -.2, .4, .3, .08), mix('#F2EFE8', INK.white, R.k), false);
  c.restore();
}
function drawSticks(R, P, ax, k) {
  const c = R.c, lw = R.L(3), tip = add(P, ax, 1.75), butt = add(P, ax, -.3);
  if (k > .15 && k < .85) for (let i = 1; i <= 3; i++) { const a = add(P, rotv(ax, -i * .2), 1.7); inkLine(c, [a, L2(a, tip, .8)], lw * (1.4 - i * .3), INK.ink, { taper: [.4, 0] }); }
  ink(c, tube([butt, tip], s => lerp(.17, .1, s), 6), { fill: mix('#E8D2A8', '#FFD23F', R.k), line: lw, boil: R.Bo(.4) });
  fillPts(c, ell(tip[0], tip[1], .08, .08, 8), mix('#E8D2A8', '#FFFBF2', R.k));
  return tip;
}

// ---------- the anime face (head-local: centre (0, 0), crown at -ry, chin at +ry) ----------
// Saiki K. x Aggretsuko: clean deadpan salaryman faces (iris eyes, one lash stroke, a tick of a nose, a small mouth),
// and on stage a death-metal rage mode (dark red face, blank glowing eyes, an enormous shark-toothed jaw, flames).
const skull = (h, turn, a, sc = 1, top = 1) => { const c = Math.cos(a), s = Math.sin(a); let x = c * h.rx * sc * (1 + (h.crown || 0) * Math.max(0, -s)); const y = s * h.ry * sc * (s < 0 ? top : 1);
  x += turn * h.rx * .16 * (1 - s * s) * Math.sign(c) * (Math.sign(c) === Math.sign(turn) ? -.55 : 1); return [x, y]; };
const arcPts = (h, turn, a0, a1, n, sc, top) => { const o = []; for (let i = 0; i <= n; i++) o.push(skull(h, turn, lerp(a0, a1, i / n), sc, top)); return o; };
// spikes pushed out of an arc (wild hair): every other edge grows a sharp tip
function spiky(P, k, seed = 0, up = .35) {
  if (k <= 0) return P; const o = [];
  for (let i = 0; i < P.length; i++) { o.push(P[i]); if (i % 2 === 0 && i < P.length - 2) { const m = L2(P[i], P[i + 2], .5), d = nrm(m[0], m[1] - up), L = k * (.32 + .3 * hash(i * 3.7 + seed)) * Math.hypot(m[0], m[1]); o.push(add(m, rotv(d, (hash(i + seed) - .5) * .5), L)); i++; o.push(P[i]); } }
  return o;
}
// fringe: lock points [u, v] (u in rx, v in ry) joined by gently bowed edges; drawn unsmoothed so every tip stays sharp
// sweep > 0 bows the edges running down into a tip more than the edges back up, so locks hook to screen-right
function fringe(pts, h, sx, bow = .1, sweep = 0) {
  const P = pts.map(([u, v]) => [sx(u * h.rx), v * h.ry]), out = [];
  for (let i = 0; i < P.length; i++) { const p = P[i]; out.push(p); if (i < P.length - 1) { const q = P[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], b = bow * (dy > 0 ? 1 + sweep : 1 - sweep);
    out.push([lerp(p[0], q[0], .35) - dy * b, lerp(p[1], q[1], .35) + dx * b], [lerp(p[0], q[0], .7) - dy * b * .8, lerp(p[1], q[1], .7) + dx * b * .8]); } }
  return out;
}

function eyeDraw(R, x, y, sx, side) {
  const c = R.c, o = R.o, col = R.col, h = R.C.head, kind = R.eyes, lw = R.L(2.3), lc = col.lash;
  const wide = kind === 'wide' || kind === 'rage', ew = h.eyeR[0] * sx * (wide ? 1.06 : 1), eh = h.eyeR[1] * (wide ? 1.22 : 1);
  let lids = clamp((o.lids || 0) + (side < 0 && o.twitch ? o.twitch * (hash(boilN(R.T) * 1.7) > .45 ? .55 : .12) : 0));
  if (kind === 'dead') lids = Math.max(lids, .45); if (kind === 'side') lids = Math.max(lids, .3);
  if (R.blank) { // blank glowing eyes: the menace shadow and the death-metal mode
    const sl = -side * .14;
    if (R.k > .5) { fillPts(c, ell(x, y, ew * 1.3, eh * .95, 16, sl), rgba(INK.red, .75)); fillPts(c, ell(x, y, ew * 1.1, eh * .75, 16, sl), INK.yellow); }
    fillPts(c, ell(x, y, ew * .92, eh * .58, 16, sl), INK.white); return;
  }
  if (R.fpx < 16) { if (kind === 'closed' || kind === 'happy' || lids > .8) inkLine(c, [[x - ew, y], [x + ew, y]], lw * 1.4, lc, { taper: [0, 0], keepWeight: true }); else fillPts(c, ell(x, y + eh * .1, ew * .42, eh * .72 * (1 - lids * .6), 8), lc); return; }
  if (kind === 'closed' || lids > .94) { inkLine(c, [[x - ew, y - eh * .05], [x, y + eh * .35], [x + ew, y - eh * .05]], lw * 2.2, lc, { taper: [.2, .25], keepWeight: true }); return; }
  if (kind === 'happy') { inkLine(c, [[x - ew, y + eh * .35], [x, y - eh * .5], [x + ew, y + eh * .35]], lw * 2.2, lc, { taper: [.2, .2], keepWeight: true }); return; }
  if (kind === 'x') { inkLine(c, [[x + side * ew, y - eh * .8], [x - side * ew * .6, y], [x + side * ew, y + eh * .8]], lw * 2.1, lc, { taper: [.1, .1], keepWeight: true }); return; }
  // the opening: a flat-topped almond, outer corner a touch lower (u -1 = inner corner, +1 = outer)
  const top = [], bot = [], N = 8;
  for (let i = 0; i <= N; i++) { const u = i / N * 2 - 1, px = x + side * u * ew;
    top.push([px, y - eh * Math.pow(1 - u * u, .3) + eh * .1 * u]); bot.push([px, y + eh * .74 * Math.pow(1 - u * u, .62) + eh * .06 * u]); }
  const E = [...top, ...bot.slice().reverse()];
  fillPts(c, E, col.white);
  c.save(); clipPts(c, E);
  const lx = (o.lx ?? (kind === 'side' ? R.f * .85 : 0)) + R.turn * .3, ly = o.ly || 0, shock = wide ? (kind === 'rage' ? .34 : .55) : 1;
  const icx = x + lx * ew * .42, icy = y + ly * eh * .28 + eh * .08, irx = ew * .56 * shock, iry = eh * .98 * shock;
  fillPts(c, ell(icx, icy, irx, iry, 18), col.iris);
  if (shock > .5) { fillPts(c, ell(icx, icy - iry * .62, irx * 1.1, iry * .5, 14), mix(col.iris, INK.ink, .5)); fillPts(c, ell(icx, icy + iry * .05, irx * .45, iry * .5, 12), col.pupil); }
  else fillPts(c, ell(icx, icy, irx * .55, iry * .55, 10), col.pupil);
  if (kind !== 'dead') { fillPts(c, ell(icx - irx * .36, icy - iry * .36, Math.max(irx * .34, ew * .12), Math.max(iry * .24, eh * .12), 10, -.3), INK.white); if (shock > .5) fillPts(c, ell(icx + irx * .36, icy + iry * .42, irx * .14, irx * .14, 8), INK.white); }
  // the upper lid (skin) closing from the top, slanted by the brows: angry = inner corner down
  const bt = o.browTilt || 0, sl = clamp(-bt, -1, 1) * eh * .55;
  let lid = null;
  if (lids > .02 || bt < -.3) { const ly0 = lerp(y - eh, y + eh * .7, lids), yi = ly0 + Math.max(0, sl), yo = ly0 - Math.max(0, -sl) * .5;
    lid = [[x - side * ew * 1.05, yi], [x, (yi + yo) / 2 - eh * .03], [x + side * ew * 1.05, yo]];
    fillPts(c, [[x - side * ew * 1.6, y - eh * 2], [x + side * ew * 1.6, y - eh * 2], [x + side * ew * 1.6, yo], [x - side * ew * 1.6, yi]], R.skinC, false); }
  c.restore();
  // the lash line: one dark stroke, heaviest at the outer corner, with a flick past it
  const L = lid || top, oc = L[L.length - 1];
  inkLine(c, [...L, [oc[0] + side * ew * .22, oc[1] + eh * .14]], lw * 2.3, lc, { taper: [.35, .12], keepWeight: true });
  if (R.fpx > 30) inkLine(c, bot.slice(N / 2 + 1), lw * .8, lc, { taper: [.5, .25], keepWeight: true });
  if (kind === 'dead' && R.fpx > 40) inkLine(c, bot.slice(2, N - 1).map(([px, py]) => [px, py + eh * .34]), lw * .6, lc, { taper: [.3, .3], keepWeight: true });
}
function browsDraw(R, eyes) {
  const c = R.c, o = R.o, h = R.C.head, eh = h.eyeR[1], bt = o.browTilt || 0, br = (o.brows || 0) * eh * 1.3, wide = R.eyes === 'wide' || R.eyes === 'rage';
  for (const [e, sd, sx] of eyes) {
    const ew = h.eyeR[0] * sx, by = e[1] - eh * (wide ? 1.3 : 1) - h.browY - br;
    const inner = [e[0] - sd * ew * .9, by - bt * eh * .55 + (bt < 0 ? eh * .15 : 0)], outer = [e[0] + sd * ew * 1.12, by + bt * eh * .25 + eh * .12], mid = [e[0] + sd * ew * .15, by - eh * .16];
    inkLine(c, [inner, mid, outer], h.brow * (R.fpx < 16 ? 1.3 : 1), R.col.brow, { taper: [.12, .6], keepWeight: true });
  }
}
function noseDraw(R, nx, ny, kind) {
  const c = R.c, f = R.at > .15 ? R.f : 1, u = R.C.head.fu || R.C.head.eyeR[1], big = kind === 'big' || kind === 'round';
  inkLine(c, [[nx + f * u * .04, ny - u * (big ? .75 : .45)], [nx + f * u * (.16 + .1 * R.at), ny - u * .02], [nx - f * u * .04, ny + u * .08]], R.L(2.1), INK.ink, { taper: [.6, .3] });
  if ((R.o.nostrils || 0) > .05 && R.fpx > 20) for (const sd of [-1, 1]) fillPts(c, ell(nx + sd * u * .24, ny + u * .1, u * .06 * (1 + R.o.nostrils), u * .04, 8, sd * .4), R.col.throat);
}
function sharkTeeth(c, x0, x1, y, th, n, down, col, lw) {
  const P = []; for (let i = 0; i <= n * 2; i++) P.push([lerp(x0, x1, i / (n * 2)), i % 2 ? y + (down ? th : -th) : y]);
  fillPts(c, [[x0, y + (down ? -th * 3 : th * 3)], ...P, [x1, y + (down ? -th * 3 : th * 3)]], col.teeth, false);
  inkLine(c, P, lw, INK.ink, { taper: [0, 0], smooth: false });
}
function mouthDraw(R, mx, my, mw) {
  const c = R.c, o = R.o, col = R.col, h = R.C.head, m = o.mouth || 'polite', lw = R.L(2.5), u = h.fu || h.eyeR[1];
  const open = clamp(o.open ?? (m === 'talk' ? .5 : m === 'scream' ? 1 : 0)), strain = clamp(((o.rage || 0) - .08) / .5), jig = i => strain ? (hash(boilN(R.T) * 3.1 + i) - .5) * u * .3 * strain : 0;
  const S = (pts, w = lw) => inkLine(c, pts, w, INK.ink, { taper: [.2, .2] });
  if (R.fpx < 16) { if (m === 'scream' || m === 'talk' || m === 'o' || m === 'grin') fillPts(c, ell(mx, my + u * .3, mw * (m === 'scream' ? 1.6 : .8), u * (.3 + open * .9), 8), col.mouthIn); else S([[mx - mw, my], [mx + mw, my]], lw * 1.2); return; }
  const cavity = (P, tongue) => { ink(c, P, { fill: col.mouthIn, line: lw * 1.1, boil: R.Bo(.5), smooth: false }); c.save(); clipPts(c, P, false); const b = bbox(P);
    if (tongue) fillPts(c, ell((b[0] + b[2]) / 2, b[3], (b[2] - b[0]) * .3, (b[3] - b[1]) * tongue, 14), col.tongue); return b; };
  switch (m) {
    case 'polite': { const w = mw * (1.05 - strain * .1), pts = []; for (let i = 0; i <= 6; i++) { const t2 = i / 6 * 2 - 1; pts.push([mx + t2 * w, my - u * .12 + (1 - t2 * t2) * u * (.3 - strain * .22) + jig(i)]); } S(pts); break; }
    case 'flat': S([[mx - mw * .8, my + jig(1)], [mx, my + jig(4)], [mx + mw * .8, my + jig(2)]]); break;
    case 'smile': S([[mx - mw * 1.25, my - u * .25], [mx, my + u * .32], [mx + mw * 1.25, my - u * .25]], lw * 1.1); break;
    case 'frown': S([[mx - mw, my + u * .22], [mx, my - u * .12], [mx + mw, my + u * .22]]); break;
    case 'smirk': S([[mx - mw * .9, my + u * .06], [mx + mw * .35, my + u * .1], [mx + mw * 1.2, my - u * .35]], lw * 1.1); break;
    case 'o': { cavity(ell(mx, my + u * .25, mw * (.45 + open * .3), u * (.42 + open * .45), 14), .28); c.restore(); break; }
    case 'talk': { const w = mw * (.85 + .35 * open), hh = u * (.3 + open * 1.4); cavity([[mx - w, my - u * .05], [mx + w, my - u * .05], [mx + w * .62, my + hh * .78], [mx, my + hh], [mx - w * .62, my + hh * .78]], open > .3 ? .36 : 0); c.restore(); break; }
    case 'grin': { const w = mw * 1.7, hh = u * 1.05, b = cavity([[mx - w, my - u * .22], [mx + w, my - u * .22], [mx + w * .72, my + hh * .6], [mx, my + hh], [mx - w * .72, my + hh * .6]], .3);
      fillPts(c, rect(b[0], b[1] - u, b[2] - b[0], u * 1.45), col.teeth, false); inkLine(c, [[b[0], b[1] + u * .45], [b[2], b[1] + u * .45]], lw * .6, INK.ink, { taper: [.1, .1] }); c.restore();
      if (R.C.key === 'greg' && R.fpx > 24) ink(c, star(mx + w * .62, my - u * .05, u * .42, .25, 4, 0), { fill: INK.white, line: lw * .5, boil: 0, smooth: false }); break; }
    case 'grit': { const w = mw * 2.1, hh = u * .6, P = [[mx - w, my], [mx - w * .7, my - hh], [mx + w * .7, my - hh], [mx + w, my], [mx + w * .7, my + hh], [mx - w * .7, my + hh]];
      ink(c, P, { fill: col.teeth, line: lw * 1.1, boil: R.Bo(.5) }); c.save(); clipPts(c, P); const zz = []; for (let i = 0; i <= 10; i++) zz.push([mx - w + i * w * .2, my + (i % 2 ? -1 : 1) * hh * .42 + jig(i)]); inkLine(c, zz, lw * .9, INK.ink, { taper: [0, 0], smooth: false }); c.restore();
      if (R.fpx > 30) for (const sd of [-1, 1]) S([[mx + sd * w * 1.06, my - hh * 1.2], [mx + sd * w * 1.2, my + hh * 1.3]], lw * .7); break; }
    case 'scream': { // the enormous jaw: shark teeth top and bottom, tongue, throat, uvula
      const w = mw * (1.8 + 2.4 * open), y0 = my - u * .25, hh = h.ry * (.28 + open * .95);
      const P = [[mx - w, y0 + u * .15], [mx - w * .55, y0 - u * .25], [mx + w * .55, y0 - u * .25], [mx + w, y0 + u * .15], [mx + w * .9, y0 + hh * .55], [mx + w * .45, y0 + hh], [mx - w * .45, y0 + hh], [mx - w * .9, y0 + hh * .55]];
      const b = cavity(P, .2), bw = b[2] - b[0], bh = b[3] - b[1], th = Math.min(bh * .19, bw * .1), n = Math.max(4, Math.round(bw / (th * 1.5)));
      fillPts(c, ell(mx, lerp(b[1], b[3], .48), bw * .2, bh * .26, 14), col.throat);
      if (R.fpx > 40) ink(c, [[mx - th * .3, b[1] + th * .9], [mx + th * .3, b[1] + th * .9], [mx + th * .32, b[1] + th * 1.5], [mx, b[1] + th * 1.85], [mx - th * .32, b[1] + th * 1.5]], { fill: col.tongue, line: lw * .5, boil: 0 });
      sharkTeeth(c, b[0], b[2], b[1] + th * .4, th, n, true, col, lw * .7); sharkTeeth(c, b[0] + bw * .1, b[2] - bw * .1, b[3] - th * .5, th * .9, Math.max(3, n - 2), false, col, lw * .7);
      c.restore(); outline(c, P, lw * 1.3, INK.ink, { smooth: false, seed: 7 });
      if (R.fpx > 26) for (const sd of [-1, 1]) S([[mx + sd * w * .8, y0 - u * .9], [mx + sd * w * 1.16, y0 + u * .1], [mx + sd * w * 1.12, y0 + hh * .5]], lw * .8);
      break; }
  }
}

// ---------- anime hair ----------
// One mass with sharp lock tips, one cel shadow tone (form), one highlight band; Dan's ahoge on top. layer: 'back' | 'shade' | 'front'.
function hairDraw(R, layer, tx) {
  const c = R.c, C = R.C, h = C.head, o = R.o, col = R.col, rx = h.rx, ry = h.ry, lw = R.L(3), bo = R.Bo(1), st = C.hair, turn = R.turn, tiny = R.fpx < 18;
  const sx = x => x + tx * .55 * (1 - Math.abs(x) / (rx * 1.6));
  const wild = st === 'dan' ? clamp(o.wild || 0) : 0, spk = clamp((wild - .45) / .55), lift = wild * .3, HL = mix(col.hair, col.hairLt || '#FFE9D2', .3);
  const mass = (P, seed, sm = false) => inkF(R, P, { fill: col.hair, dk: tiny ? null : col.hairDk, amt: .24, flat: true, line: lw, boil: bo, seed, smooth: sm });
  // the highlight band: a lighter ring across the crown with a jagged lower edge
  const band = (P, a0, a1, v, n = 7) => { if (R.fpx < 22) return; c.save(); clipPts(c, P, false); const U = [], D = [];
    for (let i = 0; i <= n * 2; i++) { const a = lerp(a0, a1, i / (n * 2)), e = 1.15 - Math.abs(i / (n * 2) - .5) * 1.4; U.push(skull(h, turn, a, v + (i % 2 ? -.025 : .01) * e, 1.12)); D.push(skull(h, turn, a, v - (i % 2 ? .12 : .035) * e, 1.12)); }
    fillPts(c, [...U, ...D.reverse()].map(([x, y]) => [x + tx * .2, y]), HL, false); c.restore(); };
  // the fringe's shadow on the forehead (F runs screen-left to right)
  const shadeBand = F => { c.save(); clipPts(c, R.hp); fillPts(c, [...F.map(([x, y]) => [x, y + ry * .1]), [rx * 2, -ry * 2], [-rx * 2, -ry * 2]], mix(R.skinC, col.skinDk, .55), false); c.restore(); };
  const T = (tips, bow, sweep) => fringe(tips, h, sx, bow, sweep);
  switch (st) {
    case 'dan': case 'short': case 'side': {
      const part = st === 'side' ? .1 : 0;
      const F = T([[-1.02, .36 - lift * .6], [-.94, -.02], [-.8, -.2 - lift], [-.66, -.62], [-.46, -.3 - lift], [-.36 + part, -.74], [-.06, -.16 - lift], [-.02, -.68], [.28, -.26 - lift], [.36, -.64], [.62, -.2 - lift], [.72, -.5], [.9, -.04 - lift * .5], [.95, -.2], [1.02, .34 - lift * .6]], .11, .6);
      if (layer === 'back') { mass([...spiky(arcPts(h, turn, .62, -Math.PI - .62, 16, 1.1 + spk * .03, 1.15 + spk * .05), spk, 3), [-rx * .7, ry * .4], [rx * .7, ry * .4]], 3); return; }
      if (layer === 'shade') { shadeBand(F); return; }
      const P = [...spiky(arcPts(h, turn, .32, -Math.PI - .32, 18, 1.11, 1.19), spk, 7, .6), ...F];
      mass(P, 11); band(P, -Math.PI * .8, -Math.PI * .3, .93);
      if (st === 'dan' && R.fpx > 6) { // the ahoge, Dan's rage barometer: a limp hook in the office, sprung upright by rage .5, a jittering bolt beyond
        const up = smooth(wild / .5), j = wild > .55 ? noise1(boilN(R.T) * .9) * .07 * wild : 0, b = skull(h, turn, -Math.PI * .47, 1.1, 1.17);
        const K = (lx, ly, ux, uy) => [b[0] + lerp(lx, ux, up) * ry, b[1] - lerp(ly, uy, up) * ry];
        ink(c, tube([b, K(.02, .16, -.03, .2), K(.15, .28, .07 + j, .34), K(.31, .27, -.01 - j, .43), K(.42, .14, .1, .48)], s => lerp(.13, .025, Math.pow(s, .8)) * ry, 10), { fill: col.hair, line: lw * .85, boil: bo, seed: 13 }); }
      return; }
    case 'tasha': case 'bun': case 'pony': case 'long': case 'buzz': {
      const F = st === 'buzz' ? T([[-1.0, .05], [-.6, -.62], [0, -.72], [.6, -.62], [1.0, .05]], .04)
        : T([[-1.02, .38], [-.88, -.1], [-.72, -.34], [-.55, -.64], [-.36, -.36], [-.16, -.7], [.02, -.42], [.2, -.7], [.38, -.38], [.58, -.66], [.74, -.32], [.88, -.1], [1.02, .38]], .1);
      if (layer === 'back') {
        if (st === 'tasha' || st === 'bun') for (const [u, v] of st === 'tasha' ? [[-.74, -.92], [.74, -.92]] : [[0, -1.12]]) { const bx = sx(u * rx), by = v * ry, r = ry * .42;
          mass(ell(bx, by, r, r * .94, 18), bx * 3, true); if (!tiny) { inkLine(c, [[bx - r * .6, by + r * .1], [bx - r * .2, by - r * .55], [bx + r * .45, by - r * .35], [bx + r * .3, by + r * .2]], lw * .55, INK.ink, { taper: [.3, .3] }); inkLine(c, [[bx - r * .5, by + r * .62], [bx + r * .5, by + r * .55]], lw * .9, col.accent || INK.ink, { taper: [.1, .1] }); } }
        if (st === 'long') mass([...arcPts(h, turn, .3, -Math.PI - .3, 14, 1.1, 1.1), [-rx * 1.25, ry * 1.4], [-rx * 1.05, ry * 2.6], [-rx * .5, ry * 2.4], [rx * .5, ry * 2.4], [rx * 1.05, ry * 2.6], [rx * 1.25, ry * 1.4]], 5);
        if (st === 'pony') mass(tube([[rx * .5 - tx * .5, -ry * .7], [rx * 1.35, -ry * .3], [rx * 1.4, ry * .9], [rx * 1.1, ry * 1.9]], s => ry * .7 * (1 - s * .7), 10), 6, true);
        return; }
      if (layer === 'shade') { shadeBand(F); return; }
      const P = [...arcPts(h, turn, .32, -Math.PI - .32, 18, st === 'buzz' ? 1.02 : 1.07, st === 'buzz' ? 1.02 : 1.09), ...F];
      mass(P, 11); band(P, -Math.PI * .82, -Math.PI * .2, .86); return; }
    case 'linda': case 'bob': {
      if (st === 'bob' && C.key === 'bob') { if (layer !== 'front') return; for (const sd of [-1, 1]) mass([[sd * rx * 1.02, ry * .5], [sd * rx * 1.06, -ry * .1], [sd * rx * .94, -ry * .02], [sd * rx * .95, ry * .4]].map(([x, y]) => [x + tx * .3, y]), 14 + sd); return; }
      const up = st === 'linda' && C.glasses === 'reading' && R.stage > .5;
      // a rounded bob whose ends curl in under the jaw
      const F = T([[-1.14, .72], [-.98, .94], [-.84, .8], [-.92, .4], [-.88, -.1], [-.7, -.28], [-.5, -.42], [-.3, -.3], [-.12, -.42], [.06, -.28], [.24, -.4], [.42, -.26], [.6, -.36], [.78, -.24], [.88, -.1], [.92, .4], [.84, .8], [.98, .94], [1.14, .72]], .06);
      if (layer === 'back') { const P = arcPts(h, turn, .95, -Math.PI - .95, 16, 1.15, 1.1); mass([...P, [-rx * .92, ry * .82], [-rx * .6, ry * .86], [-rx * .3, ry * .92], [rx * .3, ry * .92], [rx * .6, ry * .86], [rx * .92, ry * .82]], 3); return; }
      if (layer === 'shade') { shadeBand(F.slice(9, F.length - 9)); return; }
      const P = [...arcPts(h, turn, .82, -Math.PI - .82, 18, 1.18, 1.14), ...F];
      mass(P, 21); band(P, -Math.PI * .85, -Math.PI * .15, .9, 5);
      if (up) glassesDraw(R, [[-h.eyeX * rx * .9 + tx, -ry * .78], [h.eyeX * rx * .9 + tx, -ry * .78]], 'reading', true);
      return; }
    case 'curly': case 'sam': {
      const P = [], n = 26; for (let i = 0; i <= n; i++) { const a = lerp(Math.PI * .1, -Math.PI * 1.1, i / n), r = 1.2 + (i % 2 ? .1 : -.03); P.push(skull(h, turn, a, r, 1.02)); }
      const I = []; for (let i = 0; i <= 10; i++) { const t2 = i / 10 * 2 - 1; I.push([sx(t2 * rx * 1.0), (-.48 + (i % 2 ? .1 : -.04) - (1 - t2 * t2) * .18 + Math.abs(t2) * .4) * ry]); }
      if (layer === 'back') { mass(P.map(([x, y]) => [x * 1.06, y * 1.04 + ry * .05]), 4, true); return; }
      if (layer === 'shade') { shadeBand(I); return; }
      const Pf = [...P, ...I]; mass(Pf, 17, true);
      if (R.fpx > 30) for (let i = 0; i < 8; i++) { const a = lerp(-Math.PI * .95, -Math.PI * .05, i / 7), q = skull(h, turn, a, .98 + hash(i) * .12), r2 = ry * .1; inkLine(c, [[q[0] - r2, q[1] + r2 * .6], [q[0], q[1] - r2 * .8], [q[0] + r2, q[1] + r2 * .2], [q[0] + r2 * .2, q[1] + r2]], lw * .5, INK.ink, { taper: [.2, .4] }); }
      return; }
    case 'greg': case 'bald': {
      if (layer !== 'front') return;
      if (st === 'greg') { // thinning salt-and-pepper sides swept back over the ears, three brave comb-over strands
        const e = h.eyeY;
        for (const sd of [-1, 1]) { const S = [[.9, -.62], [1.02, -.5], [1.09, -.3], [.99, -.24], [1.07, -.06], [.97, -.04], [1.02, .2], [.92, .18], [.93, -.32]].map(([u, v]) => [sd * rx * u + tx * .3, e + v * ry]);
          mass(S, 14 + sd); if (!tiny) { c.save(); clipPts(c, S, false); fillPts(c, rect(-rx * 2, -ry * 2, rx * 4, e - ry * .45 + ry * 2), col.hairLt, false); c.restore(); outline(c, S, lw, INK.ink, { smooth: false }); } }
        if (R.fpx > 14) for (let i = 0; i < 3; i++) inkLine(c, arcPts(h, turn, -Math.PI * (.8 - i * .04), -Math.PI * (.32 + i * .05), 8, .97 - i * .05, 1.0), lw * (.9 - i * .15), col.hair, { taper: [.12, .3], keepWeight: true });
      }
      // the shine: a hard white highlight with a sparkle
      if (R.fpx > 14) { c.save(); c.globalAlpha *= lerp(.85, 1, R.k); const gx = -rx * .32 + tx * .4, gy = st === 'greg' ? -ry * .58 : -ry * .7, g = st === 'greg' ? ry * .5 : ry * .3;
        fillPts(c, [[gx - g * .9, gy + g * .25], [gx - g * .3, gy - g * .22], [gx + g * .7, gy - g * .28], [gx + g * .2, gy], [gx - g * .4, gy + g * .12]], INK.white, true);
        if (st === 'greg' && R.fpx > 30) ink(c, star(gx + g * .95, gy - g * .5, g * .3, .18, 4, 0), { fill: INK.white, line: 0, boil: 0, smooth: false }); c.restore(); }
      return; }
  }
}

// ---------- glasses ----------
function glassesDraw(R, eyes, kind, up = false) {
  const c = R.c, o = R.o, col = R.col, h = R.C.head, ew = h.eyeR[0], eh = h.eyeR[1];
  const lw = R.L(kind === 'rect' ? 1.9 : 1.5) / STYLE.line, crook = up || R.blank ? 0 : clamp(((o.rage || 0) - .88) / .12), mid = L2(eyes[0], eyes[1], .5);
  c.save(); c.translate(mid[0], mid[1] + crook * eh * .5); c.rotate(deg(-crook * 12)); c.translate(-mid[0], -mid[1]);
  const fs = i => 1 - R.at * .3 * ((i === 0) === (R.f > 0) ? 0 : 1), W0 = kind === 'rect' ? 1.3 : kind === 'reading' ? 1.1 : 1.2, H0 = kind === 'rect' ? 1.05 : kind === 'reading' ? .6 : 1.05, dy = kind === 'reading' && !up ? eh * 1.05 : 0;
  const lens = eyes.map((e, i) => { const w = ew * W0 * fs(i), hh = eh * H0, y = e[1] + dy;
    return kind === 'rect' ? rrect(e[0] - w, y - hh, w * 2, hh * 2, eh * .25) : kind === 'reading' ? [[e[0] - w, y - hh * .3], [e[0] + w, y - hh * .3], [e[0] + w * .85, y + hh * .7], [e[0], y + hh], [e[0] - w * .85, y + hh * .7]] : ell(e[0], y, w, hh, 16); });
  // glare: opaque white lenses with a diagonal shine (the deadpan device); they glow at full rage
  const g = R.blank ? 1 : clamp(o.glare || 0);
  for (const L of lens) {
    const [x0, y0, x1, y1] = bbox(L);
    if (g > 0) { c.save(); clipPts(c, L, kind !== 'rect'); if (R.blank && R.k > .5) { fillPts(c, L, INK.yellow, false); fillPts(c, L.map(([x, y]) => [lerp(x, (x0 + x1) / 2, .22), lerp(y, (y0 + y1) / 2, .22)]), INK.white, false); }
      else { c.globalAlpha *= g; fillPts(c, L, col.glare, false); c.globalAlpha = 1; } fillPts(c, [[lerp(x0, x1, .1), y1], [lerp(x0, x1, .34), y1], [lerp(x0, x1, .74), y0], [lerp(x0, x1, .5), y0]], mix(col.glare, '#B9C9E2', .55 * g), false);
      fillPts(c, [[lerp(x0, x1, .44), y1], [lerp(x0, x1, .52), y1], [lerp(x0, x1, .92), y0], [lerp(x0, x1, .84), y0]], mix(col.glare, '#B9C9E2', .55 * g), false); c.restore(); }
    else if (R.fpx > 26) inkLine(c, [[lerp(x0, x1, .62), lerp(y0, y1, .2)], [lerp(x0, x1, .84), lerp(y0, y1, .02)]], lw * .7, INK.white, { taper: [.3, .3], keepWeight: true });
    outline(c, L, lw, col.frame, { smooth: kind !== 'rect', heavy: .15 });
  }
  const bx = i => eyes[i][0] - (i ? 1 : -1) * ew * W0 * fs(i);
  inkLine(c, [[bx(0), eyes[0][1] + dy - eh * .2], [mid[0], mid[1] + dy - eh * .35], [bx(1), eyes[1][1] + dy - eh * .2]], lw * .8, col.frame, { taper: [0, 0], keepWeight: true });
  if (R.fpx > 20) for (const sd of [-1, 1]) { if (R.at > .3 && sd === R.f) continue; const i = sd < 0 ? 0 : 1, ex = eyes[i][0] + sd * ew * W0 * fs(i); inkLine(c, [[ex, eyes[i][1] + dy - eh * .4], [sd * h.rx * .99 + R.tx * .2, eyes[i][1] + dy - eh * .1]], lw * .7, col.frame, { taper: [0, 0], keepWeight: true }); }
  if (kind === 'reading' && R.fpx > 20) for (const sd of [-1, 1]) { // the beaded chain from the temples, down under the jaw
    const a = [sd * h.rx * .98 + R.tx * .2, up ? -h.ry * .7 : eyes[0][1] + dy], b = [sd * h.rx * .55 + R.tx * .4, h.ry * 1.55], pts = bezPts(a, [a[0] + sd * h.ry * .2, a[1] + h.ry * .6], [b[0] + sd * h.ry * .2, b[1]], b, 9);
    inkLine(c, pts, lw * .5, INK.ink, { taper: [0, 0], keepWeight: true }); if (R.fpx > 34) pts.forEach((p, i) => i % 2 && fillPts(c, ell(p[0], p[1], eh * .14, eh * .14, 6), col.bead || INK.yellow));
  }
  c.restore();
}

// ---------- reactions (head-local) ----------
function veinDraw(R, x, y, k, beat) {   // the cross-popping vein mark, pulsing on the beat
  const c = R.c, sc = k * (1 + .3 * beat), lw = R.L(2.4);
  c.save(); c.translate(x, y); c.scale(sc, sc); c.rotate(.3);
  for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); ink(c, tube([[.07, -.26], [.06, -.12], [.12, -.06], [.26, -.07]], s => .085 * (1 - Math.abs(s - .5) * .7), 8), { fill: R.col.vein, line: lw / sc, boil: R.Bo(.4) }); }
  c.restore();
}
function steamDraw(R, ex, ey, side, k) {
  const c = R.c, T = twos(R.T), q = R.C.head.ry;
  for (let i = 0; i < 3; i++) { const p = frac(T * 1.3 + i / 3 + side * .17), r = (.07 + p * .2) * q * k * (1 - Math.max(0, p - .8) * 4), cx = ex + side * (.25 + p * .6) * q, cy = ey - (.1 + p * 1.3) * q;
    if (r > .01) ink(c, blob(cx, cy, r, i * 7 + side * 3 + Math.floor(T * 4), .22, 10), { fill: R.col.steam, line: R.L(2.6), boil: R.Bo(.8) }); }
  if (R.fpx > 30) for (const k2 of [-1, 1]) inkLine(c, [[ex + side * .25 * q, ey + k2 * .1 * q], [ex + side * .55 * q, ey + k2 * .25 * q]], R.L(2.4) * k, INK.ink, { taper: [.2, .5] });
}
function dropPts(x, y, r) { return [[x, y - r * 1.5], [x + r * .75, y], [x + r * .5, y + r * .8], [x, y + r], [x - r * .5, y + r * .8], [x - r * .75, y]]; }
function sweatDraw(R, k) {   // the big comic sweat drop on the side of the head (+ flying drops on stage)
  const c = R.c, h = R.C.head, T = twos(R.T), sd = R.at > .2 ? -R.f : 1, r = h.ry * (.13 + .1 * k), y = -h.ry * .45 + frac(T * .25) * h.ry * .15, x = sd * h.rx * 1.02;
  ink(c, dropPts(x, y, r), { fill: R.col.sweat, line: R.L(2.6), boil: R.Bo(.3) });
  if (R.fpx > 20) inkLine(c, [[x - r * .35, y - r * .1], [x - r * .4, y + r * .45]], R.L(2.2), INK.white, { taper: [.2, .2], keepWeight: true });
  if (k > .6 && R.k > .5) for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (hash(i * 11 + Math.floor(T * 3)) - .5) * 2.6, d = h.rx * 1.4 + frac(T * 2 + hash(i)) * h.ry * 1.2;
    ink(c, dropPts(Math.cos(a) * d, Math.sin(a) * d * 1.1, h.ry * (.05 + hash(i) * .04)), { fill: R.col.sweat, line: R.L(2), boil: R.Bo(.3) }); }
}
function spitDraw(R, mx, my, k) {
  const c = R.c, T = twos(R.T), q = R.C.head.ry, n = Math.round(4 + k * (R.fpx > 90 ? 12 : 7)), mw = R.C.head.mouthW * 2.5;
  for (let i = 0; i < n; i++) { const p = frac(T * 1.8 + hash(i * 3.3)), sd = i % 2 ? 1 : -1, a = sd > 0 ? lerp(-.5, .9, hash(i * 7.1)) : Math.PI - lerp(-.5, .9, hash(i * 7.1)), d = mw * 2 + p * (1 + hash(i) * 1.8) * k * q;
    const x = mx + Math.cos(a) * d * 1.2, y = my + .4 * q + Math.sin(a) * d * .7 + p * p * .6 * q, r = (.04 + hash(i * 5) * .05) * q * (1 - p * .5);
    ink(c, hash(i * 2) < .5 ? ell(x, y, r, r, 8) : dropPts(x, y, r), { fill: mix(INK.white, R.col.sweat, .4), line: R.L(1.8), boil: R.Bo(.3) }); }
}
// Flames behind the body at full rage on stage (unit-world; drawn first).
function auraDraw(R, cx, cy, rx, ry, k) {
  const c = R.c, T = twos(R.T);
  [[INK.red, 1.25], [INK.orange, 1.08], [INK.yellow, .9]].forEach(([fc, sc], L) => { const P = [], n = 22;
    for (let i = 0; i <= n; i++) { const a = Math.PI * (.05 + i / n * .9), tip = i % 2, w = 1 + (tip ? .16 + .18 * hash(i * 3 + L + Math.floor(T * 12) * .37) : 0);
      P.push([cx + Math.cos(a) * rx * sc * w * (tip ? .9 : 1), cy - Math.sin(a) * ry * sc * w * (tip ? 1.15 : 1)]); }
    P.push([cx - rx * sc, cy + ry * .25], [cx + rx * sc, cy + ry * .25]);
    ink(c, P.map(([x, y]) => [x, y]), { fill: fc, line: L ? 0 : R.L(3.5), boil: R.Bo(2), smooth: false, seed: L * 5 }); });
}

// ---------- the head ----------
function drawHead(R, layer) {
  const c = R.c, C = R.C, h = C.head, o = R.o, col = R.col, rx = h.rx, ry = h.ry, lw = R.L(3.2), tiny = R.fpx < 16;
  const m = o.mouth || 'polite', open = clamp(o.open ?? (m === 'scream' ? 1 : m === 'talk' ? .5 : 0));
  const drop = m === 'scream' ? .15 + open * .7 : m === 'talk' ? open * .1 : m === 'o' ? .05 : 0;
  const r = o.rage || 0, se = clamp((r - .78) / .12), dm = R.k * clamp((r - .86) / .1);
  R.blank = se > .55 || dm > .4; R.skinC = mix(col.skin, '#8A1426', dm * .85);
  const hp = R.hp = headPts(h, R.turn, drop), tx = R.tx, fs = 1 - R.at * .32;
  if (layer === 'back') { hairDraw(R, 'back', tx); return; }
  // ears
  const earY = h.eyeY + h.eyeR[1] * .9, ears = [];
  for (const sd of [-1, 1]) { const hide = R.at > .35 && sd === R.f, ex = sd * rx * (sd === -R.f ? 1 - .38 * R.at : 1) * .97 + tx * .1; if (!hide) ears.push([ex, earY, sd]); }
  const er = ry * .14, earInk = ([ex, ey, sd]) => { ink(c, [[ex - sd * er * .3, ey - er * 1.2], [ex + sd * er * .9, ey - er * 1.25], [ex + sd * er * 1.1, ey], [ex + sd * er * .5, ey + er * 1.2], [ex - sd * er * .3, ey + er]], { fill: R.skinC, line: lw * .8, boil: R.Bo(.5) });
    if (R.fpx > 26) inkLine(c, [[ex + sd * er * .6, ey - er * .7], [ex + sd * er * .2, ey], [ex + sd * er * .5, ey + er * .5]], lw * .5, INK.ink, { taper: [.3, .3] }); };
  if (R.at < .35) ears.forEach(earInk);
  // head: flat skin, one hard cel shadow tone; at full stage rage the death-metal dark red
  inkF(R, hp, { fill: R.skinC, dk: tiny ? null : mix(col.skinDk, '#3A0410', dm), amt: .05, flat: true, line: lw, boil: R.Bo(1.1), seed: 31 });
  // rage flush rising from the collar: flat red in the office, red halftone on stage
  const flush = clamp((r - .38) / .5) * (1 - dm);
  if (flush > 0 && !tiny) { c.save(); clipPts(c, hp); const yT = lerp(ry * 1.3, -ry * .2, flush);
    if (R.k < .5) { c.globalAlpha *= .32 * (.4 + .6 * flush); fillPts(c, [[-rx * 2, yT], [0, yT - ry * .1], [rx * 2, yT], [rx * 2, ry * 2], [-rx * 2, ry * 2]], INK.red, true); c.globalAlpha = 1; }
    else dotsIn(c, [-rx * 1.3, -ry * 1.3, rx * 1.3, ry * 1.4 + drop * ry], { color: col.flush, spacing: R.SP * .8, k: (x, y) => clamp((y - yT) / (ry * (.8 + flush))) * .5 });
    c.restore(); }
  if (R.at >= .35) ears.forEach(earInk);
  hairDraw(R, 'shade', tx);
  // the menace shadow over the eyes (high rage), drawn before the glowing eyes
  if (se > 0 && !tiny) { c.save(); clipPts(c, hp); const yb = h.eyeY + h.eyeR[1] * 1.7, P = [[-rx * 2, -ry * 2], [rx * 2, -ry * 2]];
    for (let i = 0; i <= 8; i++) P.push([rx * 1.2 - i * rx * .3, yb + (i % 2 ? h.eyeR[1] * .4 : 0)]);
    c.globalAlpha *= se * (R.k > .5 ? .8 : .5); fillPts(c, P, R.k > .5 ? mix(INK.ink, INK.redDk, .5) : '#3A3048', false); c.restore(); }
  // cheeks
  const eL = [-h.eyeX * rx * (R.turn < 0 ? 1 : fs) + tx, h.eyeY], eR = [h.eyeX * rx * (R.turn > 0 ? 1 : fs) + tx, h.eyeY], cy = h.eyeY + h.eyeR[1] * 2.1;
  if ((o.blush || 0) > 0 && !tiny) { const b = clamp(o.blush); for (const e of [eL, eR]) { const ex = e[0] + Math.sign(e[0] - tx) * h.eyeR[0] * .3; c.save(); c.globalAlpha *= .45 * b; fillPts(c, ell(ex, cy, h.eyeR[0] * 1.1, h.eyeR[1] * .45, 12), col.blush); c.restore();
    if (R.fpx > 24) for (let i = 0; i < 3; i++) inkLine(c, [[ex - h.eyeR[0] * (.6 - i * .45), cy + h.eyeR[1] * .3], [ex - h.eyeR[0] * (.35 - i * .45), cy - h.eyeR[1] * .3]], lw * .6 * b, INK.red, { taper: [.2, .2] }); } }
  if (C.freckles && R.fpx > 22) for (let i = 0; i < 14; i++) { const sd = i % 2 ? 1 : -1, x = sd * (.12 + hash(i * 3) * .4) * rx + tx * 1.05, y = h.noseY - h.eyeR[1] * (.6 - hash(i * 7)); fillPts(c, ell(x, y, ry * .022, ry * .022, 6), col.freckle || col.skinDk); }
  if (C.beard === 'stubble' && !tiny) { c.save(); clipPts(c, hp); dotsIn(c, [-rx, h.noseY, rx, ry * (1 + drop)], { color: rgba(col.hair, .45), spacing: R.SP * .7, k: (x, y) => y > h.mouthY - h.eyeR[1] * .6 ? .5 : 0 }); c.restore(); }
  // eyes, nose, beard, mouth
  eyeDraw(R, eL[0], eL[1], R.turn < 0 ? 1 : fs, -1); eyeDraw(R, eR[0], eR[1], R.turn > 0 ? 1 : fs, 1);
  if ((o.twitch || 0) > .3 && R.fpx > 28) for (let i = 0; i < 2; i++) inkLine(c, [[eL[0] - h.eyeR[0] * (1.5 + i * .4), eL[1] - h.eyeR[1] * (.8 - i * 1.4)], [eL[0] - h.eyeR[0] * (2.1 + i * .4), eL[1] - h.eyeR[1] * (1.1 - i * 1.4)]], lw * .6, INK.ink, { taper: [.2, .2] });
  noseDraw(R, tx * 1.08, h.noseY, h.nose);
  const mx = tx * 1.06, my = h.mouthY;
  // age (Greg 1, Linda, Bob): under-eye bags, smile lines from the nose round the mouth, crow's feet when smiling, forehead lines, a double chin
  const age = C.age || 0;
  if (age && R.fpx > 24 && dm < .4) { const al = lw * .6 * Math.sqrt(age), eh = h.eyeR[1], fu = h.fu || eh, smile = /grin|smile|smirk/.test(m) || R.eyes === 'happy', ln = mix(col.skinDk, INK.ink, .4);
    for (const [e, sd, sx] of [[eL, -1, R.turn < 0 ? 1 : fs], [eR, 1, R.turn > 0 ? 1 : fs]]) { const ew = h.eyeR[0] * sx;
      if (R.fpx > 140) inkLine(c, [[e[0] - sd * ew * .3, e[1] + eh * 1.55], [e[0] + sd * ew * .2, e[1] + eh * 1.7], [e[0] + sd * ew * .6, e[1] + eh * 1.5]], al * .8, ln, { taper: [.4, .4] });
      if (smile && age > .6) inkLine(c, [[e[0] + sd * ew * 1.3, e[1] + eh * .1], [e[0] + sd * ew * 1.65, e[1] - eh * .2]], al, ln, { taper: [.2, .5] });
      if (smile || R.fpx > 140) inkLine(c, [[mx + sd * rx * .24, h.noseY + fu * .5], [mx + sd * rx * .33, my - fu * .1], [mx + sd * rx * .31, my + fu * .7]], al, ln, { taper: [.35, .5] }); }
    if (age > .8 && drop < .1) inkLine(c, [[mx - rx * .26, ry * 1.07], [mx, ry * 1.12], [mx + rx * .26, ry * 1.07]], al, ln, { taper: [.3, .3] }); }
  if (C.beard === 'ginger' || C.beard === 'full') { // a clumped anime beard with sharp tips
    const big = C.beard === 'ginger', B = [], n = 14, yb = ry * (1 + drop) + ry * (big ? .8 : .28), sway = big ? noise1(twos(R.T) * 3) * .08 * ry * R.k : 0;
    for (let i = 0; i <= n; i++) { const t2 = i / n, a = lerp(-.05, Math.PI + .05, t2), tip = i % 2 && t2 > .15 && t2 < .85; B.push([Math.cos(a) * rx * (1.04 + (tip ? .06 : 0)) + tx * .3 + sway * Math.sin(a), lerp(earY - ry * .05, yb + (tip ? ry * .16 : 0), Math.pow(Math.sin(a), .8))]); }
    // inner edge, screen-left to right: down the cheeks from the sideburns, round the mouth corners, under the lower lip
    const eh = h.eyeR[1], mw = mw2(h), jd = drop * ry * .9, inner = [[-rx * .86, earY], [-rx * .64, h.noseY + eh * .6], [mx - mw * 2.1, my + eh * .3], [mx - mw * 1.1, my + eh * 1.5 + jd], [mx + mw * 1.1, my + eh * 1.5 + jd], [mx + mw * 2.1, my + eh * .3], [rx * .64, h.noseY + eh * .6], [rx * .86, earY]].map(([x, y]) => [x + tx * .5, y]);
    inkF(R, [...B, ...inner], { fill: col.hair, dk: tiny ? null : col.hairDk, amt: .3, line: lw, boil: R.Bo(1.1), seed: 51, smooth: false }); }
  mouthDraw(R, mx, my, h.mouthW);
  if (C.beard === 'ginger' || C.beard === 'full') for (const sd of [-1, 1]) { const eh = h.eyeR[1], mw = mw2(h);   // a soft drooping mustache over the upper lip
    ink(c, [[mx, h.noseY + eh * .55], [mx + sd * mw * 1.3, h.noseY + eh * .4], [mx + sd * mw * 2.4, my - eh * .1], [mx + sd * mw * 2.7, my + eh * .9], [mx + sd * mw * 1.9, my - eh * .05], [mx + sd * mw * .8, my - eh * .35], [mx, my - eh * .45]], { fill: col.hair, line: lw * .8, boil: R.Bo(.8), seed: 52 + sd }); }
  const vein = clamp((r - .42) / .2), beat = pulse(R.T, 7), vs = ry * 1.05;
  if (vein > 0 && R.fpx > 14) { veinDraw(R, -R.f * rx * .6 + tx * .5, -ry * .5, vein * vs * (.7 + .3 * clamp((r - .7) / .3)), r > .85 ? beat : 0); if (r > .9) veinDraw(R, R.f * rx * .3 + tx * .8, -ry * .62, .55 * vs, beat); }
  // gum 0..1 = the bubble grows; 1..1.4 = it has popped across her face
  const gum = o.gum || 0, gumC = mix('#F2B6CF', INK.pinkLt, R.k), q = ry;
  if (gum > .02 && gum <= 1 && R.fpx > 14) { ink(c, ell(mx + q * .03, my + q * .05, q * (.1 + gum * .5), q * (.1 + gum * .46), 18), { fill: gumC, line: lw * .8, boil: R.Bo(.5) }); fillPts(c, ell(mx - gum * q * .15, my - gum * q * .15, q * (.04 + gum * .07), q * (.03 + gum * .04), 10, -.5), INK.white); }
  if (gum > 1 && R.fpx > 14) { const g = clamp((gum - 1) / .4); ink(c, blob(mx, my - q * .1, q * .45 * (1 - g * .25), 23, .45, 14, q * .3), { fill: gumC, line: lw * .8, boil: R.Bo(.6) });
    for (let i = 0; i < 5; i++) { const a = -.4 + i * .6 + Math.PI * (i % 2), d = q * (.5 + g * .35); ink(c, ell(mx + Math.cos(a) * d, my - q * .1 + Math.sin(a) * d * .6, q * .05, q * .035, 8, a), { fill: gumC, line: lw * .5, boil: 0 }); } }
  hairDraw(R, 'front', tx);
  browsDraw(R, [[eL, -1, R.turn < 0 ? 1 : fs], [eR, 1, R.turn > 0 ? 1 : fs]]);
  // Dan's tie, now a bandana across his forehead; Bob's sweatband
  if ((C.tie && C.key === 'dan' && R.stage > .5) || (C.key === 'bob' && R.stage > .5)) {
    const dan = C.key === 'dan', by = -ry * (dan ? .6 : .55), bh = ry * .2, P = []; for (let i = 0; i <= 10; i++) { const t2 = i / 10 * 2 - 1; P.push([t2 * rx * 1.06 + tx * .3 * (1 - t2 * t2), by - bh * .5 + t2 * t2 * ry * .06 - (1 - t2 * t2) * ry * .04]); }
    inkF(R, [...P, ...P.slice().reverse().map(([x, y]) => [x, y + bh])], { fill: dan ? col.tie : INK.white, dk: dan ? col.tieDk : INK.red, amt: .35, line: lw * .9, boil: R.Bo(.8), seed: 61 });
    if (dan) { const kx = -R.f * rx * 1.0, kn = [kx, by], wv = Math.sin(R.T * 9) * ry * .1, wv2 = Math.sin(R.T * 9 + 1.3) * ry * .1;
      for (const [dx, dy, w] of [[-R.f * .65, .4, .17], [-R.f * .55, .7, .14]]) ink(c, tube([kn, [kx + dx * ry * .5, by + dy * ry * .35 + wv], [kx + dx * ry, by + dy * ry + wv2]], s => lerp(w, w * .7, s) * ry, 6), { fill: col.tie, line: lw * .8, boil: R.Bo(.8) });
      ink(c, ell(kx, by, ry * .11, ry * .1, 10), { fill: col.tieDk, line: lw * .8, boil: R.Bo(.5) }); } }
  if (C.glasses === 'rect' || C.glasses === 'round' || (C.glasses === 'reading' && R.stage <= .5)) glassesDraw(R, [eL, eR], C.glasses);
  // ear things
  for (const [ex, ey, sd] of ears) {
    if (C.ear === 'airpods' && R.fpx > 12) { ink(c, ell(ex + sd * er * .2, ey + er * .2, er * .45, er * .4, 8), { fill: INK.white, line: lw * .5, boil: 0 }); ink(c, tube([[ex + sd * er * .2, ey + er * .4], [ex + sd * er * .1, ey + er * 1.9]], () => er * .3, 3), { fill: INK.white, line: lw * .5, boil: 0 }); }
    if (C.ear === 'pearls' && R.fpx > 12) ink(c, ell(ex + sd * er * .3, ey + er * 1.4, er * .32, er * .32, 8), { fill: INK.white, line: lw * .5, boil: 0 }); }
  if (C.ear === 'headset') {
    const hs = col.headset || INK.ink, bandP = arcPts(h, R.turn, -Math.PI * .92, -Math.PI * .08, 12, 1.07, 1.06);
    inkLine(c, bandP, lw * 2, INK.ink, { taper: [0, 0], keepWeight: true }); inkLine(c, bandP, lw, mix(hs, '#FFFFFF', .25), { taper: [0, 0], keepWeight: true });
    const sd = R.at > .35 ? -R.f : -1, ex = sd * rx * (sd === -R.f ? 1 - .38 * R.at : 1) + tx * .1, cup = [ex + sd * er * .4, earY];
    ink(c, ell(cup[0], cup[1], er * 1.3, er * 1.7, 14), { fill: hs, line: lw, boil: R.Bo(.4) });
    if (R.fpx > 12) { const tip = [mx + sd * h.mouthW * 1.6, my + h.eyeR[1] * .2]; inkLine(c, bezPts([cup[0], cup[1] + er], [cup[0] + sd * er * .2, my + er], [tip[0] + sd * er * 2.4, tip[1] + er], tip, 10), lw * 1.1, hs, { taper: [0, 0], keepWeight: true }); ink(c, ell(tip[0], tip[1], er * .6, er * .5, 10), { fill: INK.ink, line: lw * .6, boil: 0 }); } }
  // reactions
  const stm = (o.steam || 0) * (1 - R.k);
  if (stm > 0 && R.fpx > 12) for (const [ex, ey, sd] of ears.length ? ears : [[-rx, earY, -1], [rx, earY, 1]]) steamDraw(R, ex, ey, sd, stm);
  if ((o.sweat || 0) > 0 && R.fpx > 14) sweatDraw(R, o.sweat);
  if ((o.spit || 0) > 0 && (m === 'scream' || m === 'talk') && R.fpx > 14) spitDraw(R, mx, my + ry * .15, o.spit);
  return { eL, eR, mouth: [mx, my + h.eyeR[1] * .4 + drop * ry * .5], top: [tx * .3, -ry], forehead: [tx * .5, -ry * .55], chin: [mx, ry * (1 + drop)] };
}
const mw2 = h => h.mouthW * 1.1;

// ---------- torso ----------
function torsoPts(b, T, hem, tw, hunch) {
  const bel = b.belly || 0, wy = lerp(-T + 1.1, hem, .55);
  const half = [[-b.neckW, -T - .04], [-b.sh * .62, -T + .1 + hunch * .1], [-b.sh * .98, -T + .5 + hunch * .12], [-b.ch, -T + 1.15], [-(b.waist + bel), wy], [-b.hip * 1.02, hem - .08], [-b.hip * .6, hem + .02]];
  return [...half.map(([x, y]) => [x * tw, y]), ...half.slice().reverse().map(([x, y]) => [-x * tw, y])];
}
function drawTorso(R, g) {
  const c = R.c, C = R.C, b = C.body, col = R.col, o = R.o, lw = R.L(3.6), bo = R.Bo(1.2), T = g.T, dx = g.dx, st = R.stage, small = R.s < 18;
  const top = C.top, untuck = (C.key === 'dan' && st > .5) || top === 'polo' || top === 'hoodie' || top === 'tee' || top === 'sweater' || top === 'blouse' || top === 'cardigan';
  const beltY = -T * .2, hem = untuck ? (top === 'hoodie' ? .45 : .22) : beltY + .06;
  const P = torsoPts(b, T, hem, g.tw, g.hunch);
  inkF(R, P, { fill: col.top, dk: small ? null : col.topDk, amt: .32, line: lw, boil: bo, seed: 11 });
  if (small) { if (C.lanyard) fillPts(c, rect(dx - .2, -T + 1.2, .4, .5), col.badge, false); return; }
  const nw = b.neckW;
  // sweat patches
  if ((o.sweat || 0) > .3 && R.k > .5 && top !== 'bare') { const sw = clamp((o.sweat - .3) / .5), wet = mix(col.top, col.topDk, .3); c.save(); clipPts(c, P);
    for (const sd of [-1, 1]) fillPts(c, blob(sd * b.ch * .92, -T + 1.15, .32 * sw + .1, 7 + sd, .2, 10, (.42 * sw + .12)), wet);
    fillPts(c, blob(dx, -T + .95, .22 * sw + .05, 9, .25, 10, .3 * sw + .08), wet); c.restore(); }
  switch (top) {
    case 'shirt': {
      const open = C.key === 'dan' ? st : 0;
      if (open > .5) ink(c, [[dx - nw * .9, -T - .02], [dx + nw * .9, -T - .02], [dx + .06, -T + .75]], { fill: col.skin, line: lw * .8, boil: bo });
      inkLine(c, [[dx + (open > .5 ? .06 : 0), -T + (open > .5 ? .75 : .25)], [dx + .02, hem]], lw * .55, INK.ink, { taper: [.05, .1] });
      for (let i = 0; i < 4; i++) { const yy = -T + .55 + i * .5; if (yy < hem - .1 && !(open > .5 && yy < -T + .8)) fillPts(c, ell(dx + .1, yy, .035, .035, 6), mix(col.topDk, INK.white, .3)); }
      ink(c, rect(dx + b.ch * .36, -T + .78, .26, .3), { line: lw * .5, boil: bo * .5, smooth: false });
      for (const sd of [-1, 1]) { const sp = open > .5 ? .22 : 0; ink(c, [[dx + sd * nw * 1.08, -T - .14], [dx + sd * .02, -T + .1 + sp * .4], [dx + sd * (.16 + sp), -T + .42 + sp * .2], [dx + sd * nw * 1.5, -T + .06]], { fill: col.top, line: lw * .8, boil: bo, smooth: false, seed: 12 + sd }); }
      if (C.tie && !(C.key === 'dan' && st > .5)) { const loose = C.key === 'dan' ? clamp(st * 2) : 0, ky = -T + .12 + loose * .3, kx = dx + loose * .06;
        ink(c, [[kx - .1, ky - .04], [kx + .1, ky - .04], [kx + .065, ky + .14], [kx - .065, ky + .14]], { fill: col.tieDk, line: lw * .7, boil: bo, smooth: false });
        inkF(R, [[kx - .065, ky + .14], [kx + .065, ky + .14], [kx + .13, ky + T * .52], [kx + .015, ky + T * .58], [kx - .1, ky + T * .52]], { fill: col.tie, dk: col.tieDk, amt: .4, line: lw * .8, boil: bo, smooth: false, seed: 15 }); }
      break; }
    case 'polo': {
      for (const sd of [-1, 1]) ink(c, [[dx + sd * nw * 1.1, -T - .1], [dx + sd * .05, -T + .2], [dx + sd * (nw * 1.6), -T + .28], [dx + sd * nw * 1.7, -T + .02]], { fill: col.top, line: lw * .8, boil: bo, seed: 12 + sd });
      ink(c, rect(dx - .1, -T + .1, .2, .65), { line: lw * .5, boil: bo * .5, smooth: false }); for (let i = 0; i < 2; i++) fillPts(c, ell(dx, -T + .35 + i * .25, .035, .035, 6), INK.white);
      ink(c, ell(dx + b.ch * .45, -T + .85, .16, .12, 10), { fill: col.accent, line: lw * .5, boil: 0 });
      break; }
    case 'tee': case 'sweater': inkLine(c, [[dx - nw * 1.25, -T - .02], [dx, -T + .28], [dx + nw * 1.25, -T - .02]], lw * .8, INK.ink, { taper: [.1, .1] });
      if (top === 'sweater') inkLine(c, [[-b.hip * .95, hem - .12], [b.hip * .95, hem - .12]], lw * .6, INK.ink, { taper: [.05, .05] }); break;
    case 'bare': { const L0 = lw * .6;   // collarbones, pecs, navel
      for (const sd of [-1, 1]) { inkLine(c, [[dx + sd * nw * 1.3, -T + .12], [dx + sd * b.sh * .5, -T + .2]], L0, INK.ink, { taper: [.2, .5] });
        inkLine(c, [[dx + sd * .06, -T + .62], [dx + sd * b.ch * .45, -T + 1.08], [dx + sd * b.ch * .82, -T + .95]], L0, INK.ink, { taper: [.3, .4] }); }
      inkLine(c, [[dx, -T + 1.3], [dx, -T * .45]], L0 * .8, INK.ink, { taper: [.4, .4] }); fillPts(c, ell(dx, beltY - .32, .04, .06, 8), col.skinDk); break; }
    case 'blouse': ink(c, [[dx - nw * 1.2, -T - .02], [dx + nw * 1.2, -T - .02], [dx, -T + .55]], { fill: col.skin, line: lw * .7, boil: bo }); break;
    case 'hoodie': {
      ink(c, [[dx - nw * 1.9, -T + .02], [dx - nw * 1.2, -T - .1], [dx + nw * 1.2, -T - .1], [dx + nw * 1.9, -T + .02], [dx + nw * .7, -T + .32], [dx - nw * .7, -T + .32]], { fill: col.topDk, line: lw * .8, boil: bo, seed: 18 });
      for (const sd of [-1, 1]) { inkLine(c, [[dx + sd * .15, -T + .2], [dx + sd * .18, -T + 1.1]], lw * .55, INK.white, { taper: [0, 0], keepWeight: true }); fillPts(c, ell(dx + sd * .18, -T + 1.12, .04, .06, 6), INK.white); }
      ink(c, [[dx - .7, hem - .95], [dx + .7, hem - .95], [dx + .88, hem - .2], [dx - .88, hem - .2]], { line: lw * .6, boil: bo * .6 });
      inkLine(c, [[-b.hip * 1.0, hem - .14], [b.hip * 1.0, hem - .14]], lw * .5, INK.ink, { taper: [.05, .05] });
      break; }
    case 'cardigan': {
      ink(c, [[dx - nw * .9, -T - .04], [dx + nw * .9, -T - .04], [dx + .36, hem + .02], [dx - .36, hem + .02]], { fill: col.blouse, line: lw * .7, boil: bo, seed: 19 });
      if (R.s > 25) { c.save(); clipPts(c, [[dx - nw * .9, -T - .04], [dx + nw * .9, -T - .04], [dx + .36, hem + .02], [dx - .36, hem + .02]]);
        for (let i = 0; i < 9; i++) { const fx = dx - .35 + (i % 3) * .35 + (Math.floor(i / 3) % 2) * .17, fy = -T + .25 + Math.floor(i / 3) * .7; for (let p = 0; p < 4; p++) fillPts(c, ell(fx + Math.cos(p * 1.57) * .07, fy + Math.sin(p * 1.57) * .07, .06, .06, 6), col.flower); fillPts(c, ell(fx + .14, fy + .12, .07, .035, 6, .6), col.leaf); }
        c.restore(); }
      for (const sd of [-1, 1]) inkLine(c, [[dx + sd * nw * .95, -T - .02], [dx + sd * .38, hem]], lw * .9, INK.ink, { taper: [.05, .05] });
      for (let i = 0; i < 4; i++) ink(c, ell(dx + .44, -T + .7 + i * .45, .05, .05, 8), { fill: INK.white, line: lw * .4, boil: 0 });
      inkLine(c, [[-b.hip * 1.0, hem - .14], [b.hip * 1.0, hem - .14]], lw * .5, INK.ink, { taper: [.05, .05] });
      break; }
    case 'zipvest': {
      ink(c, [[dx - nw * 1.15, -T - .3], [dx + nw * 1.15, -T - .3], [dx + nw * 1.25, -T + .12], [dx - nw * 1.25, -T + .12]], { fill: col.top, line: lw * .8, boil: bo, smooth: false, seed: 20 });
      inkLine(c, [[dx, -T - .3], [dx, -T + .55]], lw * .6, INK.ink, { taper: [0, 0] }); ink(c, rrect(dx - .04, -T + .02, .08, .2, .03), { fill: col.metal, line: lw * .4, boil: 0, smooth: false });
      const V = [[dx - nw * 1.3, -T + .05], [-b.sh * .62 * g.tw, -T + .12], [-b.ch * .86 * g.tw, -T + .7], [-b.ch * .9 * g.tw, -T + 1.25], [-(b.waist + b.belly) * 1.02 * g.tw, lerp(-T + 1.1, hem, .55)], [-b.hip * 1.04 * g.tw, hem + .18], [dx - .02, hem + .2],
        [dx + .02, hem + .2], [b.hip * 1.04 * g.tw, hem + .18], [(b.waist + b.belly) * 1.02 * g.tw, lerp(-T + 1.1, hem, .55)], [b.ch * .9 * g.tw, -T + 1.25], [b.ch * .86 * g.tw, -T + .7], [b.sh * .62 * g.tw, -T + .12], [dx + nw * 1.3, -T + .05], [dx + .03, -T + .5], [dx - .03, -T + .5]];
      inkF(R, V, { fill: col.vest, dk: col.vestDk, amt: .32, line: lw, boil: bo, seed: 21 });
      inkLine(c, [[dx, -T + .5], [dx, hem + .18]], lw * .7, INK.ink, { taper: [0, 0] });
      fillPts(c, rrect(dx + b.ch * .4, -T + .75, .28, .12, .03), mix('#D9DDE3', INK.white, R.k), false);
      break; }
  }
  if (!untuck && C.belt) { ink(c, rect(-b.hip * 1.0 * g.tw, beltY - .05, b.hip * 2 * g.tw, .15), { fill: col.belt, line: lw * .7, boil: bo * .5, smooth: false }); ink(c, rrect(dx - .1, beltY - .06, .2, .17, .03), { fill: col.metal, line: lw * .6, boil: 0, smooth: false }); }
  if (untuck && C.key === 'dan') inkLine(c, [[-b.hip * .9, hem - .02], [-b.hip * .3, hem + .1], [b.hip * .2, hem - .02], [b.hip * .9, hem + .08]], lw * .6, INK.ink, { taper: [.1, .1] });
  // lanyard + badge (secondary motion: it hangs plumb against the lean and swings)
  if (C.lanyard) {
    const clip = [dx + .03, -T + T * .38], ang = deg(clamp((o.swing || 0) - (R.lean || 0) * .9, -150, 150)), fl = clamp(-(o.vy || 0)) * (R.o.hop > .2 ? 1 : 0);
    const a2 = ang + fl * Math.PI * .8 * (hash(7) > .5 ? 1 : -1), lc = col.lanyard;
    for (const sd of [-1, 1]) inkLine(c, [[dx + sd * nw * .95, -T - .02], [dx + sd * nw * .9, -T + .5], clip], lw * 1.1, lc, { taper: [0, 0], keepWeight: true });
    c.save(); c.translate(clip[0], clip[1]); c.rotate(a2); c.scale(.72, .72);
    fillPts(c, rect(-.05, 0, .1, .14), col.metal, false);
    ink(c, rrect(-.27, .12, .54, .74, .05), { fill: col.badge, line: lw * 1.04, boil: bo * .4, smooth: false, seed: 23 });
    fillPts(c, rect(-.27, .14, .54, .14), lc, false); fillPts(c, rect(-.18, .34, .2, .22), mix('#B8C4D0', INK.cyan, R.k), false);
    if (R.s > 80 && C.badge) { c.save(); c.scale(R.flip, 1); txt(c, C.badge, 0, .76, { font: 'ui', weight: 900, size: .13, color: INK.ink, align: 'center' }); c.restore(); }
    else { fillPts(c, rect(.06, .36, .15, .04), INK.ink, false); fillPts(c, rect(.06, .45, .12, .04), INK.ink, false); fillPts(c, rect(-.18, .66, .36, .06), INK.ink, false); }
    c.restore();
    g.badge = [clip[0] + Math.sin(-a2) * .36, clip[1] + Math.cos(a2) * .36];
  }
}
// piecewise-linear width profile along a limb: [[s, w], ...] with s 0..1 from the shoulder / hip
const prof = P => s => { let i = 1; while (i < P.length - 1 && s > P[i][0]) i++; const [s0, w0] = P[i - 1], [s1, w1] = P[i]; return lerp(w0, w1, clamp((s - s0) / (s1 - s0))); };
const ARM_SKIN = prof([[0, .9], [.14, 1.0], [.36, .88], [.52, .74], [.63, .84], [.8, .72], [1, .55]]);   // deltoid, elbow, forearm belly, wrist
const ARM_SLEEVE = prof([[0, .96], [.14, 1.04], [.3, 1.0], [.52, .9], [.72, .88], [.92, .8], [1, .82]]);
const LEG_PANTS = prof([[0, 1], [.22, .92], [.47, .7], [.6, .71], [.88, .6], [1, .63]]);
const LEG_JEANS = prof([[0, 1.04], [.25, .94], [.48, .76], [.62, .76], [1, .7]]);
const LEG_SKIN = prof([[0, .94], [.24, .82], [.47, .58], [.6, .68], [.74, .6], [1, .4]]);
// fold marks on the inner side of a bent joint (elbows, knees) once the bend passes ~35 deg
function folds(R, A, J, B, w) {
  const v1 = nrm(A[0] - J[0], A[1] - J[1]), v2 = nrm(B[0] - J[0], B[1] - J[1]), bend = Math.PI - Math.acos(clamp(v1[0] * v2[0] + v1[1] * v2[1], -1, 1));
  if (bend < .6 || R.s < 28) return; const bi = nrm(v1[0] + v2[0], v1[1] + v2[1]), lw = R.L(2.2) * clamp((bend - .6) / .5);
  for (const v of [v1, v2]) inkLine(R.c, [add(add(J, bi, w * .44), v, w * .3), add(add(J, bi, w * .08), v, w * .06)], lw, INK.ink, { taper: [.2, .6] });
}
function drawArm(R, A, side, sleeve) {
  const c = R.c, col = R.col, b = R.C.body, w0 = b.limb * 1.45, lw = R.L(3.4), bo = R.Bo(1), small = R.s < 18;
  const sp = [A.S, L2(A.S, A.E, .5), A.E, L2(A.E, A.W, .5), A.W], joints = [A.S, A.E, A.W];
  const len = sleeve === 'none' ? 0 : sleeve === 'short' ? .36 : sleeve === 'rolled' ? .62 : 1;
  const sub = k => k <= .5 ? [A.S, L2(A.S, A.E, k), L2(A.S, A.E, k * 2)] : [A.S, L2(A.S, A.E, .5), A.E, L2(A.E, A.W, (k - .5) * 2)];
  const sleeveInk = (pts, spine, w) => inkF(R, pts, { fill: col.top, dk: small ? null : col.topDk, spine, w, line: lw, boil: bo, seed: 32 + side });
  if (len < 1) inkF(R, tube(sp, s => w0 * ARM_SKIN(s), 14), { fill: col.skin, dk: small ? null : col.skinDk, spine: joints, w: w0 * .82, line: lw, boil: bo, seed: 30 + side });
  if (sleeve === 'none') { drawHand(R, A.W, A.d, side, R.hand[side]); return; }
  if (sleeve === 'hoodie') { const W2 = add(A.W, A.d, .14); drawHand(R, A.W, A.d, side, R.hand[side]); sleeveInk(tube([A.S, L2(A.S, A.E, .5), A.E, L2(A.E, W2, .5), W2], s => w0 * lerp(1.22, 1.0, s), 12), [A.S, A.E, W2], w0 * 1.15);
    inkLine(c, [add(W2, [-A.d[1], A.d[0]], w0 * .5), add(W2, [A.d[1], -A.d[0]], w0 * .5)], lw * .6, INK.ink, { taper: [0, 0] }); folds(R, A.S, A.E, W2, w0 * 1.1); return; }
  const S = len < 1 ? sub(len) : sp, ww = s => w0 * ARM_SLEEVE(s * len) * (len < 1 ? 1.06 : 1);
  if (len >= 1) drawHand(R, A.W, A.d, side, R.hand[side]);
  sleeveInk(tube(S, ww, 14), len >= 1 ? joints : len <= .5 ? [A.S, S[S.length - 1]] : [A.S, A.E, S[S.length - 1]], w0 * 1.0);
  if (len >= 1) folds(R, A.S, A.E, A.W, w0 * .9);
  const end = S[S.length - 1], pd = S.length > 1 ? nrm(end[0] - S[S.length - 2][0], end[1] - S[S.length - 2][1]) : A.d, n = [-pd[1], pd[0]], ew = ww(1) * .5;
  if (sleeve === 'rolled') ink(c, tube([add(end, pd, -.12), add(end, pd, .06)], () => ew * 2.3, 3), { fill: mix(col.top, INK.white, .25), line: lw * .8, boil: bo });
  else if (len >= 1 && !small) inkLine(c, [add(add(end, n, ew), pd, -.2), add(add(end, n, -ew), pd, -.2)], lw * .55, INK.ink, { taper: [0, 0] });
  if (len < 1) drawHand(R, A.W, A.d, side, R.hand[side]);
  if (R.C.watch && side === -1 && !small && len < 1) { const p = add(A.W, A.d, -.14), n = [-A.d[1], A.d[0]]; inkLine(c, [add(p, n, w0 * .42), add(p, n, -w0 * .42)], .1, INK.ink, { taper: [0, 0], keepWeight: true }); ink(c, rrect(p[0] - .07, p[1] - .07, .14, .14, .03), { fill: INK.ink, line: 0, boil: 0, smooth: false }); }
}
function drawLeg(R, hip, knee, ank, side, ang) {
  const c = R.c, C = R.C, b = C.body, col = R.col, lw = R.L(3.6), bo = R.Bo(1), small = R.s < 18, kind = C.bottom;
  const tw = b.hip * 1.1, sp = [hip, L2(hip, knee, .5), knee, L2(knee, ank, .5), ank], joints = [hip, knee, ank];
  const pants = (pts, spine, seed) => inkF(R, pts, { fill: col.pants, dk: small ? null : col.pantsDk, spine, w: tw * .85, line: lw, boil: bo, seed });
  if (kind === 'shorts' || kind === 'skirt') {
    const lw0 = b.limb * 1.75; inkF(R, tube(sp, s => lw0 * LEG_SKIN(s), 14), { fill: col.skin, dk: small ? null : col.skinDk, spine: joints, w: lw0 * .7, line: lw, boil: bo, seed: 40 + side });
    if (col.sock) ink(c, tube([L2(knee, ank, .74), ank], s => lw0 * lerp(.6, .46, s), 3), { fill: col.sock, line: lw * .8, boil: bo });
    if (kind === 'shorts') { const k2 = L2(hip, knee, 1.08); pants(tube([hip, L2(hip, knee, .5), k2], s => lerp(tw * 1.08, tw * .98, s), 6), [hip, k2], 41 + side);
      if (!small) ink(c, rect(L2(hip, knee, .55)[0] + side * tw * .25 - .17, L2(hip, knee, .55)[1] - .1, .34, .38), { line: lw * .55, boil: bo * .5, smooth: false }); }
  } else { pants(tube(sp, kind === 'jeans' ? s => tw * LEG_JEANS(s) : s => tw * LEG_PANTS(s), 14), joints, 41 + side); folds(R, hip, knee, ank, tw * .72); }
  drawShoe(R, ank, side, ang);
}

// ---------- the person ----------
function person(ctx, x, y, s, who = 'dan', pose = {}) {
  if (!(s > 0)) return null;
  const C = castOf(who), r0 = clamp(pose.rage || 0);
  const o = { ...(C.face || {}), ...(r0 > 0 ? rageFace(r0) : {}), ...pose }, k = STYLE.k;
  const col = { ...resolve(PAL, k), ...resolve(C.pal, k), ...(o.col || {}) }; if (!col.brow) col.brow = col.hairDk; if (o.eyes === 'glare') o.glare = Math.max(o.glare || 0, 1);
  if (C.top === 'bare') { col.top = col.skin; col.topDk = col.skinDk; }
  const U0 = UPX; UPX = 1 / s;
  const hd = C.head, b = C.body, ry = hd.ry, bust = o.view === 'bust';
  const turn = clamp(o.turn || 0, -1, 1), at = Math.abs(turn), f = turn < 0 ? -1 : 1, hunch = clamp(o.hunch || 0), sit = clamp(o.sit || 0), hop = o.hop || 0, sq = o.sq || 0, flip = o.flip ? -1 : 1;
  const R = { c: ctx, C, o, col, s, k, flip, turn, at, f, T: o.t ?? BOIL_T, stage: clamp(o.stage ?? (k >= .8 ? 1 : 0)), tx: turn * hd.rx * .42, fpx: s * hd.ry, eyes: o.eyes === 'glare' ? 'open' : o.eyes || 'open',
    L: n => n * Math.pow(s / 45, .62) / s, Bo: n => n * Math.pow(s / 45, .6) / s, SP: clamp(s * .2, 12, 46) / s, hand: { [-1]: o.handL || 'relax', [1]: o.handR || 'relax' } };
  const legs = o.legs || 'stand', ph = o.phase || 0, T = C.H - 2 * ry - b.neck - b.leg - hunch * .15;
  // Stage line of action (full view only, never in the office): weight on one leg, hips out, torso leaning back over it,
  // head counter-tilted, knees bent, arms off-symmetry. Only fills fields the caller left undefined; pose.stance 0..1 overrides.
  const e = bust ? 0 : clamp(o.stance ?? lerp(.22, .35 + .65 * clamp(o.rage || 0), k)) * (1 - sit) * (1 - hunch), stand = !o.legs || legs === 'stand' || legs === 'wide';
  const wS = at > .2 ? -f : 1, dirS = at > .1 ? f : 1, ms = o.hold === 'micstand';
  const lean = o.lean ?? e * (ms ? 11 * dirS : -6 * wS), tilt = o.tilt ?? e * (ms ? -5 * dirS : 5 * wS), hipX = stand ? e * (ms ? -.24 * dirS : .3 * wS) : 0;
  R.lean = lean; if (e > .55) { if (!o.handL) R.hand[-1] = 'fist'; if (!o.handR) R.hand[1] = 'fist'; }
  let hipH = b.leg - (stand ? .3 * e : 0);
  if (legs === 'wide') hipH -= .22 + .12 * e; else if (legs === 'walk') hipH -= .1 * Math.abs(Math.sin(ph * TAU)); else if (legs === 'run') hipH -= .3 + .2 * Math.abs(Math.sin(ph * TAU)); else if (legs === 'kneel') hipH = b.leg * .56;
  hipH = lerp(hipH, SEAT + .3, sit);
  const base = ctx.getTransform(), U = base.multiply(new DOMMatrix().translate(x, y).scale(s * (1 + sq * .2) * flip, s * (1 - sq * .2)));
  const B = new DOMMatrix().translate(hipX, -(hipH + hop)).rotate(lean + f * hunch * at * 9);
  const hx = f * at * .1 + (at > .1 ? f : 0) * hunch * (.2 + .35 * at);
  const Hd = B.translate(hx, -T).rotate(tilt + lean * .15).translate(turn * .06, -b.neck - ry + (o.nod || 0) * ry / 1.4 + hunch * .2);   // nod is measured against the v1 head (ry 1.4)
  const use = M => ctx.setTransform(U.multiply(M));
  const dx = f * at * b.ch * .36, tw = 1 - at * .14;
  const shY = -T + .36 + hunch * .12, shoulder = side => [side * (b.sh - b.limb * .55) * (1 - hunch * .1) * (at > .1 && side === f ? 1 - .32 * at : 1) * tw + dx * .3, shY];
  ctx.save();
  // ---- props layout (body frame) and arm targets ----
  const hold = o.hold || null, invB = B.inverse(), targets = {}, propInfo = {};
  const headPt = p => tp(invB, tp(Hd, p));            // head-local -> body frame
  const toU = U.inverse().multiply(base), fromC = p => tp(invB, tp(toU, p));   // caller coords -> body frame
  const pH = o.holdHand === 'L' ? -1 : 1, pArm = pH < 0 ? o.armL : o.armR, pHand = pH < 0 ? o.handL : o.handR;
  const mouthB = headPt([R.tx * 1.06, hd.mouthY + hd.eyeR[1] * .4]);
  if (hold === 'guitar' || hold === 'bass') {
    const bass = hold === 'bass', ang = deg(bass ? -24 : -30), at0 = [dx - (bass ? .25 : .45), bass ? .55 : -.05 - T * .05], ax = [Math.cos(ang), Math.sin(ang)], nl = bass ? 4.6 : 3.2;
    const st = o.strum || 0, n = [-ax[1], ax[0]], sw = Math.sin(st * TAU) * .28;
    propInfo.G = { at: at0, ang, neck: nl };
    targets[-1] = add(add(at0, ax, -.15), n, sw - .1); targets[1] = add(at0, ax, lerp(nl * .92, nl * .4, o.fret ?? .3));
    R.hand[-1] = o.handL || 'fist'; R.hand[1] = o.handR || 'grip';
  } else if (hold === 'micstand') {
    const mic = o.micAt ? fromC(o.micAt) : add(mouthB, [f * at * .3, .28]), ax = nrm(mouthB[0] - mic[0], mouthB[1] - mic[1] - .4), top = add(mic, ax, -.45);
    const micU = tp(B, mic), baseU = o.standAt ? tp(toU, o.standAt) : [micU[0] + (at > .1 ? f : 1) * (1.1 + at * .5), 0], baseB = tp(invB, baseU), pd = nrm(baseB[0] - top[0], baseB[1] - top[1]);
    Object.assign(propInfo, { mic, micAx: ax, base: baseU });
    const near = f > 0 && at > .1 ? -1 : 1; targets[near] = add(mic, ax, -.12); targets[-near] = add(top, pd, .5);
    R.hand[-1] = o.handL || 'grip'; R.hand[1] = o.handR || 'grip';
  } else if (hold === 'mic') { if (!pArm) targets[pH] = add(mouthB, [pH * .22, .8]); R.hand[pH] = pHand || 'grip'; }
  else if (hold === 'phone') { if (!pArm) targets[pH] = [dx + pH * .35, -T + 1.0]; R.hand[pH] = pHand || 'grip'; }
  else if (hold === 'mug' || hold === 'tumbler') { if (!pArm) targets[pH] = [dx + pH * .5, -T + 1.2]; R.hand[pH] = pHand || 'grip'; }
  else if (hold === 'laptop') { const ly = sit > .5 ? -.25 : -T + 1.65; propInfo.lap = [dx, ly]; targets[-1] = [dx - .75, ly + .05]; targets[1] = [dx + .75, ly + .05]; R.hand[-1] = o.handL || (sit > .5 ? 'type' : 'grip'); R.hand[1] = o.handR || (sit > .5 ? 'type' : 'grip'); }
  else if (hold === 'sticks') { const H2 = o.hits || {}; for (const sd of [-1, 1]) { const kk = clamp(sd < 0 ? H2.l ?? 0 : H2.r ?? 0); if (!(sd < 0 ? o.armL : o.armR)) targets[sd] = [sd * lerp(1.15, .95, kk) + dx, lerp(-T + .5, -T * .32, easeIn(kk))]; propInfo['k' + sd] = kk; } R.hand[-1] = o.handL || 'grip'; R.hand[1] = o.handR || 'grip'; }
  if (o.reachL) targets[-1] = fromC(o.reachL); if (o.reachR) targets[1] = fromC(o.reachR);
  const arms = {}, bodyProp = hold === 'guitar' || hold === 'bass' || hold === 'micstand' || hold === 'laptop';
  for (const sd of [-1, 1]) {
    const S = shoulder(sd), A = sd < 0 ? o.armL : o.armR, reach = sd < 0 ? o.reachL : o.reachR, [l1, l2] = b.arm;
    if (A && !reach && (!bodyProp || A.force)) arms[sd] = fk(S, sd, A.a ?? 8, A.e ?? -10, l1, l2);
    else if (targets[sd]) { const tgt = add(targets[sd], nrm(S[0] - targets[sd][0], S[1] - targets[sd][1]), .3 * b.hand); const [E, Wp] = ik2(S, tgt, l1, l2, [sd * .8, .6]); arms[sd] = { S, E, W: Wp, d: nrm(Wp[0] - E[0], Wp[1] - E[1]) }; }
    else arms[sd] = fk(S, sd, lerp(b.rest[0], sd === wS ? 18 : 30, e) - hunch * 2, lerp(b.rest[1], sd === wS ? -50 : -78, e) - hunch * 14, l1, l2);
  }
  // ---- sleeves by outfit ----
  const sleeve = C.top === 'bare' ? 'none' : R.stage > .5 && (C.sleeve || 'long') !== 'short' && (C.key === 'dan' || C.key === 'linda' || C.key === 'tasha') ? 'rolled' : C.sleeve || 'long';
  // ---- shadow, back hair, far arm, legs ----
  if (!bust && !o.noShadow) { use(new DOMMatrix()); const kk = 1 / (1 + hop * .25); ctx.save(); ctx.globalAlpha *= .22 * kk; fillPts(ctx, ell(0, 0, (b.hip * 1.6 + .6) * kk + sit * .5, .38 * kk, 20), INK.ink); ctx.restore(); }
  if (k > .5 && (o.rage || 0) > .85) { use(new DOMMatrix()); const ak = clamp(((o.rage || 0) - .85) / .1); auraDraw(R, hipX, -(hop + (bust ? C.H - 2.2 : C.H * .45)), b.sh * (1.35 + ak * .35), bust ? 2.4 : C.H * .5, ak); }
  use(Hd); drawHead(R, 'back');
  const farBack = at > .35 && (o.farArm ? o.farArm === 'back' : !hold);
  if (farBack) { use(B); drawArm(R, arms[f], f, sleeve); }
  if (!bust) {
    use(new DOMMatrix());
    const hipW = tp(B, [0, 0]), thigh = (b.leg - .32) * .5, shin = thigh, legOrder = at > .2 ? [f, -f] : [-1, 1];
    for (const sd of legOrder) {
      const free = sd !== wS, hx0 = sd * b.hip * .5 + dx * .2, hip = tp(B, [hx0, .05 + (stand ? (free ? .08 : -.08) * e : 0)]), q = ph * TAU + (sd > 0 ? Math.PI : 0), sf = Math.max(at, .3);
      let ank = [hx0 + sd * (.06 + (free ? .5 : .1) * e) + (free ? f * .3 * at * e : 0), -.32], ang = free ? sd * .12 * e : 0, knee = null;
      let proj = .12 + .88 * at + .3 * e * (1 - at), pref = [lerp(f * .9 + sd * .1 * (1 - at), sd, e * (1 - at)), .3];
      if (legs === 'wide') { ank = [sd * (b.hip * .5 + .95 + (free ? .3 : 0) * e) + dx * .3, -.32]; pref = [sd, .2]; proj = .8; ang = sd * .1; }
      else if (legs === 'walk') { ank = [hip[0] + f * Math.sin(q) * .75 * sf, -.32 - Math.max(0, Math.cos(q)) * .45]; ang = f * Math.max(0, Math.cos(q)) * -.3; }
      else if (legs === 'run') { ank = [hip[0] + f * Math.sin(q) * 1.3 * sf, -.32 - Math.max(0, Math.cos(q)) * 1.1]; ang = f * Math.cos(q) * -.4; }
      else if (legs === 'step' && sd === (at > .2 ? f : 1)) { ank = [hip[0] + f * .8 * at + sd * .3 * (1 - at), -.32 - (o.stepH ?? 1.0)]; pref = [at > .2 ? f : sd, -.4]; proj = .45 + .55 * at; ang = f * -.15; }
      else if (legs === 'jump') { ank = [hip[0] + sd * (.25 + (free ? .2 : 0) * e) - f * .5 * at, hipW[1] + (thigh + shin) * (free ? lerp(.6, .47, e) : lerp(.6, .64, e))]; pref = [f * at + sd * (1 - at) * .6, -.2]; proj = .5 + .5 * at; ang = -f * .5 * at + sd * .15 * (1 - at); }
      else if (legs === 'kneel') { const front = sd === (at > .2 ? f : -1);
        if (front) { knee = [hip[0] + f * thigh * .95 * at + sd * .15, hip[1] + .05 + .3 * (1 - at)]; ank = [knee[0] + f * .1 * at, -.32]; }
        else { knee = [hip[0] - f * .2 * at + sd * .12, -.25]; ank = [knee[0] - f * shin * .95 * at, -.28 + (1 - at) * -.15]; ang = -f * 1.2 * at; } }
      if (sit > 0) { const sk = [hip[0] + f * thigh * .95 * at + sd * .1 * (1 - at), hip[1] + .08 + .22 * (1 - at)], sa = [sk[0] - f * .15 * at + sd * .05, -.32];
        const [E0] = ik2(hip, ank, thigh, shin, pref), mid = L2(hip, ank, .5); knee = L2(knee || [mid[0] + (E0[0] - mid[0]) * proj, E0[1]], sk, sit); ank = L2(ank, sa, sit); }
      if (!knee) { const [E] = ik2(hip, ank, thigh, shin, pref), mid = L2(hip, ank, .5); knee = [mid[0] + (E[0] - mid[0]) * proj, E[1]]; }
      drawLeg(R, hip, knee, ank, sd, ang);
    }
  }
  // ---- torso ----
  use(B);
  const g = { T, dx, tw, hunch };
  if (!bust) { // pants seat: filled over the leg tops, outlined on the sides only
    const hw = b.hip * tw, by = -T * .2 - .05, lw = R.L(3.6);
    fillPts(ctx, [[-hw, by], [hw, by], [hw * 1.02, .12], [hw * .5, .3], [0, .24], [-hw * .5, .3], [-hw * 1.02, .12]], col.pants);
    for (const sd of [-1, 1]) inkLine(ctx, [[sd * hw, by], [sd * hw * 1.03, -.1], [sd * hw * 1.0, .2]], lw, INK.ink, { taper: [0, .7] });
    if (C.bottom !== 'skirt' && C.bottom !== 'shorts') inkLine(ctx, [[dx * .2, .05], [dx * .2, .45]], lw * .6, INK.ink, { taper: [.4, .4] });
    if (C.bottom === 'skirt') { const hw = b.hip * tw; inkF(R, [[-hw, -T * .2], [hw, -T * .2], [hw * 1.08, .5], [hw * 1.22, 1.45], [hw * .4, 1.52], [-hw * .4, 1.52], [-hw * 1.22, 1.45], [-hw * 1.08, .5]], { fill: col.pants, dk: col.pantsDk, amt: .36, line: R.L(3.6), boil: R.Bo(1) }); }
  }
  // neck
  const neckTop = tp(invB, tp(Hd, [R.tx * .4, ry * .55])), nW = b.neckW;
  const NP = tube([[dx * .5, -T + .25], neckTop], s2 => nW * (2.1 - s2 * .25), 4), dmk = k * clamp(((o.rage || 0) - .86) / .1), neckC = mix(col.skin, '#8A1426', dmk * .85);
  ink(ctx, NP, { fill: neckC, line: R.L(3), boil: R.Bo(.8), seed: 45 });
  ctx.save(); clipPts(ctx, NP); fillPts(ctx, [[neckTop[0] - nW * 2, neckTop[1] - .2], [neckTop[0] + nW * 2, neckTop[1] - .2], [neckTop[0] + nW * 2, neckTop[1] + ry * .2], [neckTop[0], neckTop[1] + ry * .34], [neckTop[0] - nW * 2, neckTop[1] + ry * .2]], mix(neckC, col.skinDk, .6), false); ctx.restore();
  const rr = o.rage || 0, ten = clamp((rr - .62) / .2), flush = clamp((rr - .38) / .5);
  if (flush > 0 && s >= 18 && dmk < .4) { ctx.save(); clipPts(ctx, NP); if (k < .5) { ctx.globalAlpha *= .3 * (.4 + .6 * flush); fillPts(ctx, NP, INK.red); } else dotsIn(ctx, bbox(NP), { color: col.flush, spacing: R.SP * .8, k: () => .3 + flush * .35 }); ctx.restore(); }
  if (ten > 0 && s > 25) for (const sd of [-1, 1]) inkLine(ctx, [L2([dx * .5 + sd * nW * .7, -T + .1], neckTop, 1).map((v, i) => v + (i ? 0 : sd * nW * .9)), [dx * .5 + sd * .07, -T + .12]], R.L(2.4) * (.6 + ten * .6), INK.ink, { taper: [.2, .2] });
  drawTorso(R, g);
  // ---- head ----
  use(Hd); const HA = drawHead(R, 'front');
  // ---- body props behind the hands ----
  use(B);
  let lapQuad = null, micW = null, tips = {};
  if (propInfo.G) drawGuitar(R, propInfo.G, hold === 'bass');
  if (hold === 'micstand') {
    use(new DOMMatrix()); const mic = tp(B, propInfo.mic), ax = rotv(propInfo.micAx, deg(lean + f * hunch * at * 9)), baseP = propInfo.base;
    const top = add(mic, ax, -.45);
    if (!bust) { for (const k2 of [-1, 0, 1]) inkLine(ctx, [[baseP[0], -1], [baseP[0] + k2 * .9, 0]], R.L(4), INK.ink, { taper: [0, 0] }); }
    inkLine(ctx, [top, bust ? add(top, nrm(baseP[0] - top[0], baseP[1] - top[1]), 6) : baseP], R.L(5), INK.ink, { taper: [0, 0] });
    inkLine(ctx, [L2(top, baseP, .3), L2(top, baseP, .95)], R.L(1.6), mix('#C9C7CF', INK.white, k), { taper: [.1, .1], keepWeight: true });
    drawMicHead(R, mic, ax); micW = add(mic, ax, .55);
    use(B);
  }
  if (hold === 'laptop') { const [lx, ly] = propInfo.lap, lw = R.L(3.2), open = sit > .5;
    if (open) { ink(ctx, [[lx - 1.05, ly + .1], [lx + 1.05, ly + .1], [lx + .9, ly - .1], [lx - .9, ly - .1]], { fill: mix('#C9CBD0', '#E6E2EA', k), line: lw, boil: R.Bo(.4), smooth: false }); lapQuad = [[lx - .95, ly - .1], [lx + .95, ly - .1], [lx + .95, ly - 1.35], [lx - .95, ly - 1.35]];
      ink(ctx, lapQuad, { fill: mix('#B9BCC2', '#9A98A0', k), line: lw, boil: R.Bo(.4), smooth: false }); fillPts(ctx, ell(lx, ly - .75, .12, .12, 10), mix('#DADCE0', INK.white, k)); }
    else { lapQuad = [[lx - 1.0, ly - 1.25], [lx + 1.0, ly - 1.25], [lx + 1.0, ly - .05], [lx - 1.0, ly - .05]];
      ink(ctx, [[lx - 1.08, ly - 1.33], [lx + 1.08, ly - 1.33], [lx + 1.08, ly + .02], [lx - 1.08, ly + .02]], { fill: INK.ink, line: lw, boil: R.Bo(.4), smooth: false });
      fillPts(ctx, lapQuad, mix('#DCE6F0', INK.white, k), false);
      if (o.screen) { ctx.save(); clipPts(ctx, lapQuad, false); ctx.translate(lx - 1.0, ly - 1.25); ctx.scale(2 / 300, 2 / 300); o.screen(ctx, [0, 0, 300, 180]); ctx.restore(); }
      ink(ctx, [[lx - 1.15, ly + .02], [lx + 1.15, ly + .02], [lx + 1.3, ly + .22], [lx - 1.3, ly + .22]], { fill: mix('#C9CBD0', '#E6E2EA', k), line: lw, boil: R.Bo(.4), smooth: false }); } }
  // ---- arms + hand props ----
  const sides = farBack ? [-f] : [-1, 1];
  for (const sd of sides) {
    const A = arms[sd], hp = add(A.W, A.d, .38 * b.hand), isR = sd === pH;
    if (isR && hold === 'mic') {
      if (o.lasso != null) { const a = o.lasso * TAU, cen = add(A.W, [0, -1.7]), m = [cen[0] + Math.cos(a) * 1.5, cen[1] + Math.sin(a) * .55];
        inkLine(ctx, bezPts(hp, L2(hp, m, .3).map((v, i) => v + (i ? -.3 : 0)), L2(hp, m, .7), m, 10), R.L(3), INK.ink, { taper: [0, 0] });
        drawMicHead(R, m, nrm(m[0] - cen[0], m[1] - cen[1])); micW = m;
        for (let i = 1; i <= 3; i++) { const aa = a - i * .35; inkLine(ctx, [[cen[0] + Math.cos(aa) * 1.65, cen[1] + Math.sin(aa) * .62], [cen[0] + Math.cos(aa + .25) * 1.65, cen[1] + Math.sin(aa + .25) * .62]], R.L(3.5) * (1 - i * .25), INK.ink, { taper: [.5, .1] }); } }
      else { const toM = nrm(mouthB[0] - hp[0], mouthB[1] - hp[1]), ax = Math.hypot(mouthB[0] - hp[0], mouthB[1] - hp[1]) < 1.8 ? toM : rotv(A.d, -sd * .9);
        const M = drawMicHead(R, hp, ax); micW = M.head; if (!bust) drawCable(R, M.bottom, [M.bottom[0] - .4, M.bottom[1] + 3.5], 1.5); }
    }
    if (hold === 'sticks') { const kk = propInfo['k' + sd] || 0, ax = rotv([0, -1], deg(sd * lerp(-15, -150, easeIn(kk)))); tips[sd] = drawSticks(R, hp, ax, kk); }
    drawArm(R, A, sd, sleeve);
    if (isR && hold === 'phone') drawPhone(R, add(hp, A.d, .1), deg(sd * 8), !!o.phoneFace);
    if (isR && hold === 'mug') drawMug(R, add(hp, [sd * .32, 0]), sd);
    if (isR && hold === 'tumbler') drawTumbler(R, add(hp, [sd * .45, 0]), sd);
    if ((o.twirl || 0) > 0 && sd === 1 && s > 25) { const cen = add(hp, A.d, .6); for (let i = 0; i < 3; i++) { const a = R.T * 9 + i * 2.1; inkLine(ctx, [[cen[0] + Math.cos(a) * .45, cen[1] + Math.sin(a) * .3], [cen[0] + Math.cos(a + .9) * .45, cen[1] + Math.sin(a + .9) * .3]], R.L(3), INK.ink, { taper: [.6, .1] }); } }
  }
  // ---- anchors ----
  const toC = (M, p) => { const q = U.multiply(M).transformPoint(new DOMPoint(p[0], p[1])); const r2 = base.inverse().transformPoint(q); return [r2.x, r2.y]; };
  const I = new DOMMatrix();
  const out = { head: toC(Hd, [0, 0]), top: toC(Hd, HA.top), forehead: toC(Hd, HA.forehead), eyeL: toC(Hd, HA.eL), eyeR: toC(Hd, HA.eR), mouth: toC(Hd, HA.mouth), neck: toC(B, [dx * .5, -T]),
    chest: toC(B, [dx, -T + 1.0]), hip: toC(B, [0, 0]), handL: toC(B, add(arms[-1].W, arms[-1].d, .38 * b.hand)), handR: toC(B, add(arms[1].W, arms[1].d, .38 * b.hand)),
    badge: g.badge ? toC(B, g.badge) : toC(B, [dx, -T + 1.6]), mic: micW ? toC(hold === 'micstand' ? I : B, micW) : null, s };
  if (lapQuad) out.laptop = lapQuad.map(p => toC(B, p));
  if (tips[-1]) out.tipL = toC(B, tips[-1]); if (tips[1]) out.tipR = toC(B, tips[1]);
  ctx.setTransform(base); ctx.restore(); UPX = U0;
  return out;
}

// ---------- framing helpers ----------
function bustFit(box, who = 'dan', o = {}) {
  // headroom for the hair and Dan's sprung ahoge (about 1.8 ry above the head centre); zoom keeps the face point (between eyes and mouth) still
  const C = castOf(who), h = C.head, [bx, by, bw, bh] = box, s1 = Math.min(bh * .2, bw * .16) * 1.3 / h.ry, s = s1 * (o.zoom || 1), f = (h.eyeY + h.mouthY) / 2;
  return { x: bx + bw / 2, y: by + bh * .48 - f * (s - s1) + (o.dy || 0) * bh + (C.H - h.ry) * s, s };
}
// headFit(x, y, hh, who) -> {x, y, s}: places person(..., {view: 'bust'}) with the head centre at (x, y), the head hh px tall
function headFit(x, y, hh, who = 'dan') { const C = castOf(who), s = hh / (2 * C.head.ry); return { x, y: y + (C.H - C.head.ry) * s, s }; }
function foreheadCam(ctx, box, t, who = 'greg', pose = {}, o = {}) {
  const [bx, by, bw, bh] = box, k = clamp(o.k ?? 0), C = castOf(who), h = C.head, sk = STYLE.k;
  ctx.save(); clipPts(ctx, rect(bx, by, bw, bh), false);
  // the ceiling behind him: the camera looks up from the desk
  fillPts(ctx, rect(bx, by, bw, bh), mix('#DCD9D2', INK.paperDk, sk), false);
  for (let i = 0; i < 5; i++) { const u = (i + .5) / 5; inkLine(ctx, [[bx + bw * u, by], [bx + bw * (.5 + (u - .5) * 1.6), by + bh]], Math.max(2, bw * .004), mix('#C4C0B6', INK.paperDk, sk), { taper: [0, 0], smooth: false }); }
  outline(ctx, ell(bx + bw * .5, by + bh * .08, bw * .26, bw * .1, 32), bw * .022, mix('#FFFFFF', INK.white, sk));
  // k 1: the brow line sits on the bottom edge of the frame. The landscape offsets were tuned on a 1.3 u wide head;
  // q rescales them to this head, so the composition in the box stays the same. nod = the head drop person() applies.
  const q = h.rx / 1.3, s = bw / (2 * h.rx) * lerp(.8, 1.08, k), sq = s * q, nod = (pose.nod || 0) * h.ry / 1.4, browUp = h.eyeR[1] + h.browY * .5 + .09 * q, sway = noise1(t * .6) * bw * .012 + (o.dx || 0) * bw;
  const eyeLine = by + lerp(bh * .6, bh * .975 + browUp * s, k), x = bx + bw / 2 + sway, headCy = eyeLine - h.eyeY * s + nod * s;
  person(ctx, x, headCy + (C.H - h.ry) * s - nod * s, s, who, { view: 'bust', mouth: 'grin', nostrils: 1 - k * .5, lids: .1, brows: .3, ...pose });
  // the forehead landscape: worry lines run off the frame like horizon lines, packing tighter towards the top
  const P = (u, v) => [x + u * s, headCy + v * s], lw = Math.max(3, sq * .024), n = 3 + Math.round(k * 3);
  for (let i = 0; i < n; i++) { const v = h.eyeY - (.66 + (i * .21 - i * i * .014) * lerp(1, 1.2, k)) * q, half = lerp(.55, 1.7, k) * h.rx, droop = (.05 + k * (.14 - i * .015)) * q;
    inkLine(ctx, [P(-half, v + droop), P(-half * .45, v), P(0, v - .03 * q), P(half * .45, v), P(half, v + droop)], lw * (1.1 - i * .13), mix('#C99377', '#D9775A', sk), { taper: [.25 - k * .2, .25 - k * .2] }); }
  // the specular shine, a white sun over the landscape, with the ring light reflected in it
  const g0 = P(-h.rx * .3, h.eyeY - 1.45 * q), gc = [lerp(g0[0], bx + bw * .36, k), lerp(g0[1], by + bh * .3, k)], grx = lerp(sq * .62, bw * .36, k), gry = lerp(sq * .2, bh * .17, k);
  ctx.save(); ctx.globalAlpha *= lerp(.6, .95, k);
  fillPts(ctx, ell(gc[0], gc[1], grx, gry, 28, -.08), INK.white); fillPts(ctx, ell(gc[0] + grx * 1.18, gc[1] - gry * .45, grx * .15, gry * .3, 12, -.08), INK.white);
  outline(ctx, ell(gc[0] + grx * .95, gc[1] + gry * 1.55, grx * .42, gry * .5, 28, -.08), Math.max(3, sq * .03), INK.white); ctx.restore();
  if (k > .3) { const r = lerp(sq * .14, bh * .13, k) * (1 + .25 * Math.sin(t * 9)) * clamp((k - .3) / .3); ink(ctx, star(gc[0] - grx * 1.05, gc[1] - gry * .9, r, .13, 4, 0), { fill: INK.white, line: 0, boil: 0, smooth: false }); }
  if (k > .5) ink(ctx, dropPts(gc[0] + grx * 1.5, gc[1] + gry * (1.5 + frac(t * .3) * 2.2), sq * .05), { fill: mix('#DCEEF5', '#BDF2FF', sk), line: lw * .8, boil: 0 });
  ctx.restore();
}

// ---------- the far crowd ----------
// crowdPerson(ctx, x, y, s, seed, {jump (u), nod (u), arms 0..1 raised}) -> flat silhouette with lanyard (no shading).
function crowdPerson(ctx, x, y, s, seed = 0, o = {}) {
  const k = STYLE.k, h = hash(seed * 3.7), sk = SKINS[Math.floor(hash(seed * 5.1) * SKINS.length)], sh = SHIRTS[Math.floor(hash(seed * 9.3) * SHIRTS.length)], hc = HAIRS[Math.floor(hash(seed * 1.9) * HAIRS.length)];
  const skin = mix(sk[0], sk[1], k), shirt = mix(sh[0], sh[1], k), hair = mix(hc[0], hc[1], k), line = k < .5 ? INK.oline : INK.ink, lany = mix(LANY[seed % LANY.length][0], LANY[seed % LANY.length][1], k);
  // anime proportions like person(): ~6.5 heads, a pointed chin, hair with a spiky fringe (4 styles: short, long, bun, bald)
  const Hh = 8.8 + h * 1.4, wd = .78 + hash(seed * 2.3) * .4, j = o.jump || 0, nod = o.nod || 0, arms = clamp(o.arms || 0), st = Math.floor(hash(seed * 6.6) * 4);
  ctx.save(); ctx.translate(x, y - j * s); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const top = -Hh, rx = .6, ry = .74, hy = top + ry + nod, sy = top + 1.95, hipY = -Hh * .47, lw = Math.max(1.2 / s, .12);
  ctx.strokeStyle = line; ctx.lineWidth = lw;
  // legs: tapered, a gap between the feet
  ctx.fillStyle = mix(PANTS[seed % PANTS.length][0], PANTS[seed % PANTS.length][1], k); ctx.beginPath();
  for (const sd of [-1, 1]) { ctx.moveTo(sd * .04, hipY); ctx.lineTo(sd * wd * .92, hipY); ctx.lineTo(sd * wd * .62, 0); ctx.lineTo(sd * .14, 0); ctx.closePath(); }
  ctx.fill(); ctx.stroke();
  // long hair behind the head
  if (st === 1) { ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, hy - .05, rx * 1.18, ry * 1.12, 0, Math.PI, TAU); ctx.lineTo(rx * 1.15, hy + ry * 1.5); ctx.lineTo(-rx * 1.15, hy + ry * 1.5); ctx.fill(); }
  // arms: one thick stroke each, the shirt colour
  ctx.lineWidth = .46; ctx.strokeStyle = shirt; ctx.beginPath();
  for (const sd of [-1, 1]) { const sx = sd * wd * .98, a = lerp(.12, 2.75, arms * (sd > 0 ? 1 : hash(seed + 1) > .4 ? 1 : .2)) + hash(seed * 4 + sd) * .2; ctx.moveTo(sx, sy + .25); ctx.lineTo(sx + sd * Math.sin(a) * 3.4, sy + .25 + Math.cos(a) * 3.4); }
  ctx.stroke(); ctx.lineWidth = lw; ctx.strokeStyle = line;
  // torso: shoulders to hips
  ctx.fillStyle = shirt; ctx.beginPath(); ctx.moveTo(-wd * 1.08, sy + .1); ctx.lineTo(-wd * .9, sy - .05); ctx.lineTo(wd * .9, sy - .05); ctx.lineTo(wd * 1.08, sy + .1); ctx.lineTo(wd * .92, hipY + .1); ctx.lineTo(-wd * .92, hipY + .1); ctx.closePath(); ctx.fill(); ctx.stroke();
  // lanyard + badge
  ctx.strokeStyle = lany; ctx.lineWidth = .14; ctx.beginPath(); ctx.moveTo(-.2, sy - .05); ctx.lineTo(0, sy + 1.05); ctx.lineTo(.2, sy - .05); ctx.stroke();
  ctx.fillStyle = mix('#F7F6F2', INK.white, k); ctx.fillRect(-.22, sy + 1.0, .44, .58); ctx.strokeStyle = line; ctx.lineWidth = lw;
  // head: round cranium, soft pointed chin
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, hy, rx, ry, 0, Math.PI, TAU); ctx.lineTo(rx * .9, hy + ry * .5); ctx.lineTo(0, hy + ry); ctx.lineTo(-rx * .9, hy + ry * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (st !== 3) { ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, hy - .04, rx * 1.12, ry * 1.1, 0, Math.PI * 1.04, Math.PI * 1.96);
    ctx.lineTo(rx * .95, hy + .1); ctx.lineTo(rx * .6, hy - .3); ctx.lineTo(rx * .32, hy - .06); ctx.lineTo(0, hy - .36); ctx.lineTo(-rx * .3, hy - .08); ctx.lineTo(-rx * .62, hy - .32); ctx.lineTo(-rx * .98, hy + .1); ctx.fill();
    if (st === 2) { ctx.beginPath(); ctx.arc(0, hy - ry * 1.12, .3, 0, TAU); ctx.fill(); } }
  if (s > 4) { ctx.fillStyle = line; ctx.fillRect(-.3, hy + .02, .12, .2); ctx.fillRect(.18, hy + .02, .12, .2); }
  ctx.restore();
}

// ---------- look-dev ----------
const NAMES = ['dan', 'greg', 'linda', 'tasha', 'bob', 'sam'];
function officeBg(ctx, floorY = 860) { fillPts(ctx, rect(0, 0, W, H), INK.wall, false); fillPts(ctx, rect(0, floorY, W, H - floorY), INK.carpet, false); fillPts(ctx, rect(0, floorY - 14, W, 14), INK.wallDk, false); }
function stageBg(ctx, t, c1 = INK.red) {
  ctx.save(); dotsIn(ctx, [0, 0, W, H], { spacing: 34, color: rgba(c1, .5), k: (x, y) => clamp(Math.hypot(x - W / 2, y - H * .45) / 1100) }); ctx.restore();
  fillPts(ctx, rect(0, 900, W, 180), INK.ink, false);
}
const label = (ctx, s, x, y, c = INK.oline) => txt(ctx, s, x, y, { font: 'ui', weight: 700, size: 26, color: c, align: 'center' });
LOOKS.cast_office = (ctx, t) => {
  look(0); officeBg(ctx, 900); const tc = twos(t);
  const L = [['dan', { hunch: .6, glare: .8, eyes: 'dead' }], ['greg', { armR: { a: 40, e: -100 }, handR: 'thumb' }], ['linda', {}], ['tasha', { hold: 'phone', nod: .1, ly: .6 }], ['bob', {}], ['sam', {}], [3, {}], [8, {}], [12, {}]];
  L.forEach(([w, p], i) => { const x = 130 + i * 207; person(ctx, x, 900, 64, w, { turn: (i % 3 - 1) * .25, lids: blink(tc, i + 1) || undefined, ...p }); label(ctx, typeof w === 'number' ? extra(w).name : CAST[w].name.split(' ')[0], x, 960); });
};
LOOKS.cast_stage = (ctx, t) => {
  look(1); stageBg(ctx, t); const tc = twos(t), hb = headbang(tc, 1, .6);
  const L = [['dan', { rage: 1, legs: 'wide', armL: { a: 150, e: 20 }, handL: 'horns', armR: { a: 40, e: -60 }, handR: 'fist' }], ['greg', { mouth: 'grin', armR: { a: 70, e: -80 }, handR: 'gun' }], ['linda', { lids: .45 }], ['tasha', { gum: .6 }], ['bob', { mouth: 'grin', rage: .7 }], ['sam', {}], [3, { armL: { a: 160, e: 10 }, handL: 'horns' }], [8, { ...hb }], [12, { mouth: 'scream', open: .8 }]];
  L.forEach(([w, p], i) => { const x = 130 + i * 207; person(ctx, x, 900, 64, w, { turn: (i % 3 - 1) * .25, ...p }); label(ctx, typeof w === 'number' ? extra(w).name : CAST[w].name.split(' ')[0], x, 960, INK.paper); });
};
const FACES = [['rage 0', { rage: 0, glare: 0 }], ['rage .25', { rage: .25 }], ['rage .5', { rage: .5 }], ['rage .75', { rage: .75 }], ['rage 1', { rage: 1 }], ['talk', { mouth: 'talk', open: .6, brows: .3 }], ['polite', { mouth: 'polite', lids: .2 }], ['dead + glare', { eyes: 'dead', glare: 1, mouth: 'flat' }], ['wild', { wild: 1, mouth: 'grin', eyes: 'wide' }]];
LOOKS.dan_faces = (ctx, t) => {
  const k = t < .2 ? 0 : t < .4 ? 1 : .5; look(k); if (k < .5) fillPts(ctx, rect(0, 0, W, H), INK.wall, false); else stageBg(ctx, t);
  FACES.forEach(([n, p], i) => { const cx = 320 + (i % 3) * 640, cy = 4 + Math.floor(i / 3) * 360, F = bustFit([cx - 300, cy, 600, 352], 'dan');
    ctx.save(); clipPts(ctx, rect(cx - 316, cy, 632, 352), false); person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', stage: k > .5 ? 1 : 0, ...p }); ctx.restore(); txt(ctx, n, cx - 300, cy + 40, { font: 'ui', weight: 800, size: 30, color: k < .5 ? INK.oline : INK.ink }); });
};
// Each cast member: rest, talk, rage .5, scream. t < .5 office, else stage.
LOOKS.cast_faces = (ctx, t) => {
  const k = t < .5 ? 0 : 1; look(k); if (k) stageBg(ctx, t); else fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
  const ex = [{}, { mouth: 'talk', open: .6, brows: .3 }, { rage: .5 }, { rage: 1 }];
  NAMES.forEach((w, r) => ex.forEach((p, i) => { const cx = (r < 3 ? 0 : 960) + 120 + i * 240, cy = 30 + (r % 3) * 350, F = bustFit([cx - 115, cy, 230, 330], w);
    ctx.save(); clipPts(ctx, rect(cx - 118, cy, 236, 330), false); person(ctx, F.x, F.y, F.s, w, { view: 'bust', t: twos(t), ...p }); ctx.restore(); }));
};
// Level of detail: person() at small scales next to crowdPerson().
LOOKS.small = (ctx, t) => {
  look(0); officeBg(ctx, 1080); const tc = twos(t);
  [8, 11, 14, 18, 24, 32].forEach((s, r) => { const y = 120 + r * 150 + s * 2; for (let i = 0; i < 12; i++) person(ctx, 80 + i * 150, y + s * 2, s, i < 6 ? NAMES[i] : i * 3, { turn: (hash(i) - .5), t: tc }); txt(ctx, 's ' + s, 1880, y, { font: 'mono', size: 24, color: INK.oline, align: 'right' }); });
  for (let i = 0; i < 20; i++) crowdPerson(ctx, 60 + i * 30, 1050, 8, i);
};
// Tasha's gum: grow, pop, splat.
LOOKS.gum = (ctx, t) => { look(1); stageBg(ctx, t); [0, .4, .8, 1.0, 1.15, 1.35].forEach((g, i) => { const B = bustFit([i * 320, 200, 320, 600], 'tasha'); person(ctx, B.x, B.y, B.s, 'tasha', { view: 'bust', gum: g, eyes: g > 1 ? 'wide' : 'open', lids: g > 1 ? 0 : .5, t: twos(t) }); txt(ctx, 'gum ' + g, i * 320 + 160, 900, { font: 'ui', weight: 800, size: 30, color: INK.ink, align: 'center' }); }); };
// Leg modes and the remaining face variants.
LOOKS.legs = (ctx, t) => {
  look(0); officeBg(ctx, 520); const tc = twos(t);
  [0, .25, .5, .75].forEach((p, i) => person(ctx, 120 + i * 200, 500, 40, 'dan', { legs: 'walk', phase: frac(p + tc * 1.2), turn: .7, armL: { a: -20 * Math.cos((p + tc * 1.2) * TAU), e: -15 }, armR: { a: 20 * Math.cos((p + tc * 1.2) * TAU), e: -15 }, t: tc }));
  [0, .5].forEach((p, i) => person(ctx, 960 + i * 220, 500, 40, 'tasha', { legs: 'run', phase: frac(p + tc * 1.8), turn: -.8, lean: -10, armL: { a: 40 * Math.cos((p + tc * 1.8) * TAU), e: -70 }, armR: { a: -40 * Math.cos((p + tc * 1.8) * TAU), e: -70 }, t: tc }));
  person(ctx, 1450, 500, 40, 'linda', { legs: 'kneel', turn: .5, hold: 'guitar', strum: frac(tc * 4), t: tc }); person(ctx, 1720, 500, 40, 'dan', { legs: 'kneel', turn: 0, armL: { a: 150, e: 10 }, armR: { a: 150, e: 10 }, handL: 'fist', handR: 'fist', rage: .9, t: tc });
  look(1); fillPts(ctx, rect(0, 540, W, 540), INK.paper, false);
  const F = [['side', { eyes: 'side', mouth: 'smirk' }], ['x', { eyes: 'x', mouth: 'o', open: .5 }], ['happy', { eyes: 'happy', mouth: 'grin' }], ['closed', { eyes: 'closed', mouth: 'frown' }], ['wide o', { eyes: 'wide', mouth: 'o', open: 1, brows: .6, browTilt: .8 }], ['worried', { browTilt: 1, mouth: 'frown', sweat: .6 }], ['blush', { blush: 1, mouth: 'smile', eyes: 'happy' }], ['look up', { ly: -1, lx: .6 }]];
  F.forEach(([n, p], i) => { const w = ['dan', 'tasha', 'bob', 'linda', 'greg', 'sam', 'tasha', 'dan'][i], B = bustFit([i * 240, 560, 240, 480], w);
    ctx.save(); clipPts(ctx, rect(i * 240, 560, 240, 480), false); person(ctx, B.x, B.y, B.s, w, { view: 'bust', t: tc, ...p }); ctx.restore(); txt(ctx, n, i * 240 + 120, 1060, { font: 'ui', weight: 800, size: 26, color: INK.ink, align: 'center' }); });
};
// flip + badge secondary motion: a jump loop (badge floats up on the way down), flipped copy on the right.
LOOKS.flip = (ctx, t) => {
  look(1); stageBg(ctx, t); const tc = twos(t);
  [0, .25, .5, .75].forEach((dt, i) => { const j = jumpArc(mod(tc + dt * .6, 1), .2, .6, 2.2);
    person(ctx, 240 + i * 480, 1000, 80, 'dan', { ...j, legs: j.hop > .1 ? 'jump' : 'stand', flip: i % 2 === 1, turn: .4, rage: .8, armL: { a: 120, e: 30 }, handL: 'horns', t: tc }); });
};
// What a chapter gets for free from minimal poses: office row (top) vs stage row (bottom).
LOOKS.defaults = (ctx, t) => {
  const tc = twos(t), P = [['dan', {}], ['dan', { rage: 1 }], ['dan', { rage: 1, hold: 'micstand' }], ['linda', { hold: 'guitar', strum: frac(tc * 4) }], ['tasha', { hold: 'bass', strum: frac(tc * 2) }], ['bob', { rage: .7 }], ['greg', {}], [5, { rage: .6 }]];
  stageBg(ctx, t); fillPts(ctx, rect(0, 0, W, 540), INK.wall, false);
  [0, 1].forEach(k => { look(k); const y0 = k * 540;
    P.forEach(([w, p], i) => { const x = 120 + i * 240; person(ctx, x, y0 + 515, 46 * 10 / castOf(w).H, w, { t: tc, ...p }); txt(ctx, JSON.stringify(p).replace(/[{}"]/g, '').replace(/,strum:[^,]*/, '') || 'defaults', x, y0 + 34, { font: 'mono', weight: 700, size: 18, color: INK.ink, align: 'center' }); }); });
};
// Every hand shape at a readable size, both sides, office (top) and stage (bottom).
LOOKS.hands = (ctx, t) => {
  const HS = ['relax', 'fist', 'open', 'point', 'thumb', 'horns', 'grip', 'wave', 'type', 'gun'];
  [0, 1].forEach(k => { look(k); const y0 = k * 540; if (!k) fillPts(ctx, rect(0, 0, W, 540), INK.wall, false);
    HS.forEach((hs, i) => { const x = 96 + i * 192; ctx.save(); clipPts(ctx, rect(x - 96, y0, 192, 540), false);
      person(ctx, x + 30, y0 + 290 + 8.6 * 52, 52, 'dan', { view: 'bust', armL: { a: 170, e: -12 }, armR: { a: 30, e: -60 }, handL: hs, handR: hs, mouth: 'smile', t: twos(t) }); ctx.restore();
      txt(ctx, hs, x, y0 + 520, { font: 'ui', weight: 800, size: 26, color: INK.ink, align: 'center' }); }); });
};
// Every held prop.
LOOKS.human_props = (ctx, t) => {
  look(1); stageBg(ctx, t); const tc = twos(t), b = beatAt(tc + VLEAD), cols = 5;
  const P = [['dan', { hold: 'mic', rage: .9 }, 'mic'], ['dan', { hold: 'micstand', rage: 1, turn: .3, lean: 12 }, 'micstand'], ['linda', { hold: 'guitar', strum: frac(tc * 4), fret: .5 }, 'guitar'], ['tasha', { hold: 'bass', strum: frac(tc * 2), fret: .6 }, 'bass'],
    ['bob', { hold: 'sticks', hits: { l: stroke(b + .5), r: stroke(b) }, mouth: 'grin' }, 'sticks'], ['tasha', { hold: 'phone', ly: .6 }, 'phone'], ['dan', { hold: 'mug', stage: 0 }, 'mug'], ['greg', { hold: 'tumbler' }, 'tumbler'],
    ['dan', { hold: 'laptop', stage: 0, screen: (c, [x, y, w, h]) => { fillPts(c, rect(x, y, w, h), INK.teams, false); fillPts(c, rect(x + 20, y + 30, w - 40, h - 60), INK.teamsBg, false); } }, 'laptop'], ['sam', { hold: 'laptop', sit: 1, turn: .3 }, 'laptop (sit)']];
  P.forEach(([w, p, n], i) => { const x = 192 + (i % cols) * 384, y = 520 + Math.floor(i / cols) * 540, s = 44 * 10 / castOf(w).H;
    const A = person(ctx, x, y, s, w, { t: tc, ...p }); txt(ctx, n, x, y + 10 - 490, { font: 'ui', weight: 800, size: 28, color: INK.ink, align: 'center' });
    if (A.laptop) for (const q of A.laptop) fillPts(ctx, ell(q[0], q[1], 6, 6, 8), INK.green); });
};
// Timing: ms per call for the heaviest cases (render with --sheet=0,0,0 and read the last frame).
LOOKS.human_perf = (ctx, t) => {
  look(1); const tm = (n, fn) => { const t0 = performance.now(); for (let i = 0; i < n; i++) fn(i); return (performance.now() - t0) / n; };
  const full = tm(12, i => person(ctx, 100 + i * 150, 1000, 55, 'dan', { rage: 1, hold: 'micstand', legs: 'wide', turn: .3, t: .5 }));
  const fullO = tm(12, i => { look(0); person(ctx, 100 + i * 150, 1000, 55, ['greg', 'linda', 'bob'][i % 3], { hunch: .5, t: .5 }); look(1); });
  const band = tm(4, i => person(ctx, 300 + i * 400, 1000, 60, ['linda', 'tasha', 'bob', 'dan'][i], { hold: ['guitar', 'bass', 'sticks', 'mic'][i], rage: .8, t: .5 }));
  const bust = tm(12, i => person(ctx, 100 + i * 150, 500 + 8.6 * 40, 40, i % 6, { view: 'bust', t: .5 }));
  const big = tm(2, i => person(ctx, 960, 420 + 8.6 * 330, 330, 'dan', { view: 'bust', rage: 1, t: .5 }));
  const crowd = tm(300, i => crowdPerson(ctx, (i * 37) % W, 300, 8, i, { jump: .3, arms: .5 }));
  fillPts(ctx, rect(0, 0, W, 300), INK.ink, false);
  txt(ctx, `full stage ${full.toFixed(2)} ms   full office ${fullO.toFixed(2)}   band w/ props ${band.toFixed(2)}   bust ${bust.toFixed(2)}   huge bust ${big.toFixed(2)}   crowd ${(crowd * 1000).toFixed(0)} us`, 40, 120, { font: 'mono', weight: 700, size: 30, color: INK.white });
};
// Turnaround at a big scale (checks the fake 3/4 and proportions). t < .5 office, else stage.
LOOKS.turn = (ctx, t) => {
  const k = t < .5 ? 0 : 1, who = ['dan', 'greg', 'linda', 'tasha', 'bob'][Math.floor(frac(t) * 5)] || 'dan'; look(k); if (k) stageBg(ctx, t); else officeBg(ctx, 1040);
  [-1, -.5, 0, .5, 1].forEach((tr, i) => person(ctx, 192 + i * 384, 1040, 94 * 10 / castOf(who).H, who, { turn: tr, t: twos(t) }));
};
// Huge close-up: the scream into camera (head ~1000 px wide).
LOOKS.dan_scream = (ctx, t) => {
  look(1); stageBg(ctx, t); const tc = twos(t), sh = shake(t, 6);
  ctx.save(); ctx.translate(sh[0], sh[1]); person(ctx, 960, 420 + 8.6 * 330, 330, 'dan', { view: 'bust', rage: 1, tilt: -6 + noise1(tc * 3) * 3, nod: -.15, t: tc }); ctx.restore();
};
// stick stroke phase from a beat clock: impact (1) on the beat, rebound up, fall back for the next one
const stroke = p => { p = frac(p); return p < .35 ? 1 - easeOut(p / .35) : easeIn((p - .35) / .65); };
function kitStub(ctx, x, y, s) { // placeholder drums for look-dev only (the real kit is drumKit() in world.js)
  ink(ctx, ell(x, y - 2.2 * s, 2.3 * s, 2.3 * s, 30), { fill: INK.white, shade: { color: INK.red, spacing: 14, dir: [.5, .8], from: s, to: 3 * s }, line: 6, boil: 1 });
  txt(ctx, 'OUT OF', x, y - 2.5 * s, { font: 'display', weight: 900, stretch: -2, size: s * .85, color: INK.ink, align: 'center' });
  txt(ctx, 'OFFICE', x, y - 1.6 * s, { font: 'display', weight: 900, stretch: -2, size: s * .85, color: INK.red, align: 'center' });
  for (const sd of [-1, 1]) ink(ctx, ell(x + sd * 2.9 * s, y - 4.3 * s, 1.3 * s, .42 * s, 20), { fill: INK.paper, line: 5, boil: 1 });
  ink(ctx, ell(x + 3.6 * s, y - 6.4 * s, 1.6 * s, .25 * s, 20, -.15), { fill: INK.yellow, line: 5, boil: 1 });
}
LOOKS.band = (ctx, t) => {
  look(1); stageBg(ctx, t); const tc = twos(t), b = beatAt(tc + VLEAD), hb = headbang(tc, 1, .8);
  // Bob on the riser behind the kit
  person(ctx, 760, 760, 44, 'bob', { sit: 1, hold: 'sticks', hits: { l: stroke(b + .5), r: stroke(b) }, mouth: 'grin', rage: .55, twitch: 0, eyes: 'wide', sweat: .8, nod: hb.nod * .6, tilt: hb.tilt * .5, t: tc });
  kitStub(ctx, 760, 790, 44);
  ink(ctx, rect(0, 820, W, 260), { fill: INK.ink, line: 0 });
  // Linda: deadpan shred, foot on the monitor wedge
  ink(ctx, [[220, 1010], [470, 1010], [440, 955], [250, 955]], { fill: INK.ink, line: 4, lineColor: INK.paper, smooth: false });
  person(ctx, 380, 1010, 60, 'linda', { hold: 'guitar', strum: frac(tc * 4.8), fret: .35 + .25 * Math.sin(tc * 3), legs: 'step', stepH: .9, turn: .35, lids: .5, mouth: 'flat', lean: -4, t: tc });
  // Dan on the mic stand: THE pose
  person(ctx, 1080, 1015, 64, 'dan', { hold: 'micstand', rage: 1, legs: 'wide', turn: .3, lean: 13 + hb.lean * .3, tilt: -6, nod: hb.nod * .3 - .1, swing: hb.swing, t: tc });
  // Tasha: low-slung bass, bored, gum
  const gp = frac(b / 4);
  person(ctx, 1580, 1005, 56, 'tasha', { hold: 'bass', strum: frac(tc * 2.4), fret: .55, turn: -.35, lids: gp > .8 ? .1 : .55, eyes: gp > .8 ? 'wide' : 'open', gum: gp < .8 ? gp * 1.2 : 1 + (gp - .8) * 2, legs: 'wide', t: tc });
};
LOOKS.poses = (ctx, t) => {
  const tc = twos(t), cells = [[0, 0], [640, 0], [1280, 0], [0, 540], [640, 540], [1280, 540]];
  const cell = (i, fn, k) => { const [x0, y0] = cells[i]; ctx.save(); clipPts(ctx, rect(x0, y0, 640, 540), false); look(k); if (k < .5) officeBg(ctx); else { fillPts(ctx, rect(x0, y0, 640, 540), INK.paper, false); dotsIn(ctx, [x0, y0, x0 + 640, y0 + 540], { spacing: 26, color: rgba(INK.red, .5), k: (x, y) => clamp(Math.hypot(x - x0 - 320, y - y0 - 270) / 420) }); }
    fn(x0, y0); ctx.restore(); outline(ctx, rect(x0 + 4, y0 + 4, 632, 532), 4, INK.ink, { smooth: false }); };
  cell(0, (x0, y0) => { // hunched typing at the desk
    const ty = Math.sin(tc * 40) * 3; ink(ctx, rrect(x0 + 120, y0 + 240, 70, 190, 18), { fill: INK.cubeDk, line: 3, smooth: false }); ink(ctx, rrect(x0 + 150, y0 + 400, 150, 30, 10), { fill: INK.cubeDk, line: 3, smooth: false }); ink(ctx, rect(x0 + 218, y0 + 430, 14, 60), { fill: INK.ogrey, line: 3, smooth: false });
    person(ctx, x0 + 250, y0 + 500, 40, 'dan', { sit: 1, hunch: 1, turn: .55, reachL: [x0 + 368, y0 + 326 + ty], reachR: [x0 + 400, y0 + 326 - ty], handL: 'type', handR: 'type', eyes: 'dead', glare: .9, mouth: 'polite', t: tc });
    ink(ctx, rect(x0 + 300, y0 + 330, 340, 26), { fill: INK.desk, line: 3, smooth: false }); ink(ctx, rect(x0 + 330, y0 + 356, 24, 190), { fill: INK.deskDk, line: 3, smooth: false });
    ink(ctx, rect(x0 + 430, y0 + 160, 180, 130), { fill: INK.ink, line: 3, smooth: false }); fillPts(ctx, rect(x0 + 440, y0 + 170, 160, 110), INK.teams, false); ink(ctx, rect(x0 + 510, y0 + 290, 20, 40), { fill: INK.ogrey, line: 3, smooth: false });
    label(ctx, 'typing (hunch 1, sit)', x0 + 320, y0 + 40); }, 0);
  cell(1, (x0, y0) => { person(ctx, x0 + 320, y0 + 500, 42, 'dan', { hunch: .5, glare: .8, eyes: 'dead', handR: 'relax', lids: blink(tc, 3), t: tc }); label(ctx, 'standing (office)', x0 + 320, y0 + 40); }, 0);
  cell(2, (x0, y0) => { const j = jumpArc(mod(tc, 1.2), .3, .55, 2.6); person(ctx, x0 + 320, y0 + 500, 40, 'dan', { ...j, legs: j.hop > .1 ? 'jump' : 'stand', armL: { a: 168 - j.sq * 90, e: 8 }, armR: { a: 105 - j.sq * 60, e: 65 }, rage: .9, swing: j.vy * 40, t: tc }); label(ctx, 'jump', x0 + 320, y0 + 40, INK.ink); }, 1);
  cell(3, (x0, y0) => { const hb = headbang(tc, 1, 1.2); person(ctx, x0 + 320, y0 + 520, 40, 'dan', { ...hb, legs: 'wide', rage: .85, wild: 1, armL: { a: 38, e: -72 }, armR: { a: 105 + hb.nod * 30, e: 75 }, t: tc }); label(ctx, 'headbang', x0 + 320, y0 + 40, INK.ink); }, 1);
  cell(4, (x0, y0) => { person(ctx, x0 + 320, y0 + 520, 40, 'dan', { legs: 'wide', rage: .8, mouth: 'scream', armL: { a: 168, e: 4 }, armR: { a: 85, e: 38 }, handL: 'horns', handR: 'horns', tilt: -8, t: tc }); label(ctx, 'horns', x0 + 320, y0 + 40, INK.ink); }, 1);
  cell(5, (x0, y0) => { person(ctx, x0 + 300, y0 + 520, 40, 'dan', { hold: 'mic', lasso: frac(tc * 1.5), armR: { a: 165, e: 10 }, handR: 'grip', armL: { a: 40, e: -30 }, handL: 'point', rage: 1, legs: 'wide', turn: -.2, t: tc }); label(ctx, 'mic swing', x0 + 320, y0 + 40, INK.ink); }, 1);
};
LOOKS.greg = (ctx, t) => {
  look(0); officeBg(ctx, 980); const tc = twos(t);
  const pew = stroke(tc * 1.5) * 10;
  person(ctx, 210, 980, 42, 'greg', { armL: { a: 22 + pew, e: 72 }, armR: { a: 22 + pew, e: 72 }, handL: 'gun', handR: 'gun', mouth: 'grin', lids: .25, tilt: 4, t: tc }); label(ctx, 'finger guns', 210, 1040);
  person(ctx, 560, 980, 42, 'greg', { armR: { a: 28, e: -118 }, handR: 'thumb', mouth: 'grin', lids: .2, brows: .4, t: tc }); label(ctx, 'thumbs up', 560, 1040);
  const a = tc * TAU * 1.2; person(ctx, 910, 980, 42, 'greg', { armR: { a: 62 + Math.sin(a) * 16, e: -75 + Math.cos(a) * 22 }, handR: 'point', twirl: 1, hold: 'tumbler', holdHand: 'L', mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(tc * 6)), t: tc }); label(ctx, 'circle back', 910, 1040);
  [0, .5, 1].forEach((k, i) => { const bw = 620, bh = bw * 9 / 16, bx = 1240, by = 24 + i * (bh + 18), box = [bx, by, bw, bh];
    fillPts(ctx, rect(bx - 6, by - 6, bw + 12, bh + 12), INK.teamsBg, false); foreheadCam(ctx, box, tc, 'greg', { mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(tc * 7)) }, { k }); txt(ctx, 'k = ' + k, bx + 14, by + 40, { font: 'ui', weight: 800, size: 30, color: INK.ink }); });
};
LOOKS.busts = (ctx, t) => {
  look(0); fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false); const tc = twos(t);
  const W3 = ['dan', 'greg', 'linda', 'tasha', 'bob', 'sam', 4, 9, 17], P = [{ glare: .8, eyes: 'dead' }, { mouth: 'talk', open: .5 }, { lids: .5 }, { hold: 'phone', ly: .7 }, { mouth: 'talk', open: .3 }, { lids: .4 }, {}, { mouth: 'smile' }, { lids: .3 }];
  W3.forEach((w, i) => { const bx = 24 + (i % 3) * 632, by = 20 + Math.floor(i / 3) * 352, box = [bx, by, 616, 340];
    ctx.save(); clipPts(ctx, rrect(bx, by, 616, 340, 10), false); fillPts(ctx, rect(bx, by, 616, 340), ['#B9B3A8', '#C9C4BA', '#A8B2BC'][i % 3], false);
    const F = bustFit(box, w); person(ctx, F.x, F.y, F.s, w, { view: 'bust', lids: blink(tc, i + 2), turn: (hash(i) - .5) * .4, ...P[i], t: tc }); ctx.restore();
    txt(ctx, typeof w === 'number' ? extra(w).name : CAST[w].name, bx + 16, by + 324, { font: 'ui', weight: 600, size: 22, color: INK.white }); });
};
LOOKS.human_crowd = (ctx, t) => {
  look(1); fillPts(ctx, rect(0, 0, W, H), INK.night, false); const tc = twos(t), b = beatAt(tc + VLEAD); let n = 0, t0 = performance.now();
  for (let row = 0; row < 9; row++) { const y = 420 + row * row * 9 + row * 30, s = 4 + row * 1.2;
    for (let x = -20 + (row % 2) * 30; x < W + 40; x += s * 3.4 + 4) { const sd = n * 7.3 + row, ph = hash(sd) * .3, j = Math.max(0, Math.sin((b + ph) * Math.PI)) * 1.2 * (hash(sd * 3) > .3 ? 1 : 0);
      crowdPerson(ctx, x + hash(sd * 5) * 10, y, s, Math.floor(sd), { jump: j, nod: j * .2, arms: hash(sd * 9) > .5 ? .5 + .5 * Math.sin((b + ph) * Math.PI) : 0 }); n++; } }
  const ms = performance.now() - t0; txt(ctx, `${n} crowdPerson  ${(ms / n * 1000).toFixed(0)} us each`, 40, 60, { font: 'mono', weight: 700, size: 32, color: INK.white });
};
// The core contrast, big: polite office Dan | stage Dan screaming the same word.
LOOKS.split = (ctx, t) => {
  const tc = twos(t);
  ctx.save(); clipPts(ctx, rect(0, 0, 960, H), false); look(0); fillPts(ctx, rect(0, 0, 960, H), INK.wall, false);
  person(ctx, 480, 560 + 8.6 * 150, 150, 'dan', { view: 'bust', hunch: .3, glare: .85, lids: blink(tc, 2), mouth: 'polite', nod: noise1(tc * .8) * .05, t: tc }); ctx.restore();
  ctx.save(); clipPts(ctx, rect(960, 0, 960, H), false); look(1); stageBg(ctx, t);
  person(ctx, 1440, 520 + 8.6 * 150, 150, 'dan', { view: 'bust', rage: 1, open: .7 + .3 * singOpen(tc + 21, 0, 99), tilt: -5, t: tc }); ctx.restore();
  fillPts(ctx, rect(952, 0, 16, H), INK.teamsBg, false);
};
LOOKS.dan_scream_office = (ctx, t) => { look(0); fillPts(ctx, rect(0, 0, W, H), INK.wall, false); person(ctx, 960, 470 + 8.6 * 330, 330, 'dan', { view: 'bust', rage: .5, glare: 0, t: twos(t) }); };

// ---------- anime look-dev (phase 1: Dan, plus Greg's head) ----------
const sheetTag = (ctx, s, x, y, c = INK.ink) => txt(ctx, s, x, y, { font: 'ui', weight: 800, size: 26, color: c });
const bust = (ctx, box, who, p, z) => { const F = bustFit(box, who, { zoom: z || 1 }); ctx.save(); clipPts(ctx, rect(...box), false); person(ctx, F.x, F.y, F.s, who, { view: 'bust', ...p }); ctx.restore(); };
const DFACES = [['rage 0 (polite)', { mouth: 'polite', lids: .15 }], ['glare (deadpan)', { eyes: 'glare', mouth: 'flat' }], ['dead', { eyes: 'dead', mouth: 'flat' }], ['talk', { mouth: 'talk', open: .6, brows: .2 }], ['side-eye', { eyes: 'side', mouth: 'smirk' }],
  ['rage .25', { rage: .25 }], ['rage .5', { rage: .5 }], ['rage .75', { rage: .75 }], ['rage .9 shadow', { rage: .9 }], ['rage 1', { rage: 1 }],
  ['happy', { eyes: 'happy', mouth: 'smile', blush: .8 }], ['wide shock', { eyes: 'wide', mouth: 'o', open: .5, sweat: .6 }], ['worried', { browTilt: 1, mouth: 'frown', sweat: .8 }], ['x_x', { eyes: 'x', mouth: 'grit' }], ['wild hair', { wild: 1, mouth: 'grin', eyes: 'wide' }]];
function faceGrid(ctx, t, k) {
  look(k); if (k) stageBg(ctx, t); else fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
  DFACES.forEach(([n, p], i) => { const bx = (i % 5) * 384, by = Math.floor(i / 5) * 360; bust(ctx, [bx + 8, by + 8, 368, 344], 'dan', { t: twos(t), ...p }); sheetTag(ctx, n, bx + 18, by + 40); });
}
LOOKS.anime_dan_faces_office = (ctx, t) => faceGrid(ctx, t, 0);
LOOKS.anime_dan_faces_stage = (ctx, t) => faceGrid(ctx, t, 1);
// full body: office row (standing, hunched typing, phone, mug) | stage row (jump, mic, micstand scream, horns)
LOOKS.anime_dan_poses = (ctx, t) => {
  const tc = twos(t), y1 = 520, y2 = 1060, s = 46;
  look(0); fillPts(ctx, rect(0, 0, W, 540), INK.wall, false); fillPts(ctx, rect(0, 500, W, 40), INK.carpet, false);
  person(ctx, 150, y1, s, 'dan', { lids: blink(tc, 1), t: tc }); sheetTag(ctx, 'office stand', 70, 40);
  ink(ctx, rrect(440, 300, 46, 140, 12), { fill: INK.cubeDk, line: 3, smooth: false }); ink(ctx, rrect(460, 420, 120, 22, 8), { fill: INK.cubeDk, line: 3, smooth: false });
  const ty = Math.sin(tc * 40) * 2; person(ctx, 540, y1, s, 'dan', { sit: 1, hunch: 1, turn: .55, reachL: [640, 372 + ty], reachR: [668, 372 - ty], handL: 'type', handR: 'type', glare: 1, mouth: 'polite', t: tc });
  ink(ctx, rect(600, 375, 260, 18), { fill: INK.desk, line: 3, smooth: false }); ink(ctx, rect(700, 220, 140, 100, 0), { fill: INK.ink, line: 3, smooth: false }); fillPts(ctx, rect(708, 228, 124, 84), INK.teams, false); sheetTag(ctx, 'typing (sit, hunch)', 460, 40);
  person(ctx, 1080, y1, s, 'dan', { hold: 'phone', ly: .8, eyes: 'dead', hunch: .6, t: tc }); sheetTag(ctx, 'phone', 1040, 40);
  person(ctx, 1380, y1, s, 'dan', { hold: 'mug', mouth: 'flat', lids: .5, t: tc }); sheetTag(ctx, 'mug', 1350, 40);
  person(ctx, 1700, y1, s, 'dan', { rage: .5, hunch: .3, t: tc }); sheetTag(ctx, 'rage .5 (office)', 1610, 40);
  look(1); ctx.save(); clipPts(ctx, rect(0, 540, W, 540), false); stageBg(ctx, t); ctx.restore();
  const j = jumpArc(mod(tc, 1.2), .25, .55, 2.4);
  person(ctx, 180, y2, s, 'dan', { ...j, legs: j.hop > .1 ? 'jump' : 'stand', armL: { a: 168 - j.sq * 90, e: 8 }, armR: { a: 105 - j.sq * 60, e: 65 }, rage: .9, swing: j.vy * 40, t: tc }); sheetTag(ctx, 'jump', 120, 580);
  person(ctx, 560, y2, s, 'dan', { hold: 'mic', rage: .95, t: tc }); sheetTag(ctx, 'mic', 520, 580);
  person(ctx, 960, y2, s, 'dan', { hold: 'micstand', rage: 1, t: tc }); sheetTag(ctx, '{rage: 1, hold: micstand}', 820, 580);
  person(ctx, 1380, y2, s, 'dan', { legs: 'wide', rage: .8, mouth: 'scream', armL: { a: 168, e: 4 }, armR: { a: 85, e: 38 }, handL: 'horns', handR: 'horns', t: tc }); sheetTag(ctx, 'horns', 1340, 580);
  person(ctx, 1730, y2, s, 'dan', { armR: { a: 28, e: -118 }, handR: 'thumb', mouth: 'smile', eyes: 'happy', stance: 0, t: tc }); sheetTag(ctx, 'thumbs up', 1660, 580);
};
// the hero close-up: the scream into camera (head ~900 px wide) and the office version of the same frame
LOOKS.anime_dan_closeup = (ctx, t) => { look(1); stageBg(ctx, t); const tc = twos(t), sh = shake(t, 6), s = 400;
  ctx.save(); ctx.translate(sh[0], sh[1]); person(ctx, 960, 575 + (10 - .78) * s, s, 'dan', { view: 'bust', rage: 1, tilt: -5 + noise1(tc * 3) * 3, t: tc }); ctx.restore(); };
LOOKS.anime_dan_closeup_office = (ctx, t) => { look(0); fillPts(ctx, rect(0, 0, W, H), INK.wall, false); const tc = twos(t), s = 480;
  person(ctx, 960, 650 + (10 - .78) * s, s, 'dan', { view: 'bust', glare: t < .5 ? 1 : 0, mouth: 'polite', lids: t < .5 ? 0 : .15, rage: t > 1 ? .5 : 0, t: tc }); };
// Greg: deadpan, smug closed-eye smile, talking, foreheadCam k = 0 / .5 / 1
LOOKS.anime_greg_head = (ctx, t) => {
  look(0); fillPts(ctx, rect(0, 0, W, H), INK.wall, false); const tc = twos(t);
  [['deadpan', { mouth: 'flat', lids: .25 }], ['smug', { eyes: 'happy', mouth: 'smirk', brows: .3 }], ['veneer grin', { mouth: 'grin' }], ['talking', { mouth: 'talk', open: .5, brows: .4 }]].forEach(([n, p], i) => { bust(ctx, [i * 480 + 8, 8, 464, 520], 'greg', { t: tc, ...p }); sheetTag(ctx, n, i * 480 + 20, 44); });
  [0, .5, 1].forEach((k, i) => { const bw = 620, bh = bw * 9 / 16, bx = 16 + i * 636, by = 560; fillPts(ctx, rect(bx - 6, by - 6, bw + 12, bh + 12), INK.teamsBg, false);
    foreheadCam(ctx, [bx, by, bw, bh], tc, 'greg', { mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(tc * 7)) }, { k }); sheetTag(ctx, 'foreheadCam k=' + k, bx + 12, by + 36); });
};
// old vs new, same poses. The old side needs the v1 rig (work/human_v1_bighead.js) loaded before this file, so PREV holds it.
LOOKS.anime_compare = (ctx, t) => {
  const tc = twos(t), old = PREV && PREV.person, oldFit = PREV && PREV.bustFit;
  const side = (x0, fn, fit, tag) => { ctx.save(); clipPts(ctx, rect(x0, 0, 960, H), false);
    look(0); fillPts(ctx, rect(x0, 0, 960, 540), INK.wall, false);
    fn(ctx, x0 + 180, 520, 46, 'dan', { hunch: .4, glare: .9, t: tc }); fn(ctx, x0 + 400, 520, 46 * 10 / 11.1, 'greg', { t: tc });
    const F = fit([x0 + 560, 40, 380, 470], 'dan'); fn(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', mouth: 'polite', lids: .15, t: tc });
    look(1); fillPts(ctx, rect(x0, 540, 960, 540), INK.paper, false); dotsIn(ctx, [x0, 540, x0 + 960, H], { spacing: 30, color: rgba(INK.red, .45), k: () => .5 });
    fn(ctx, x0 + 200, 1060, 46, 'dan', { hold: 'micstand', rage: 1, t: tc });
    const G = fit([x0 + 480, 570, 460, 490], 'dan'); fn(ctx, G.x, G.y, G.s, 'dan', { view: 'bust', rage: 1, t: tc });
    ctx.restore(); sheetTag(ctx, tag, x0 + 20, 36); };
  if (old) side(0, old, oldFit, 'OLD (v1 big head)'); side(960, person, bustFit, 'NEW (anime)'); fillPts(ctx, rect(954, 0, 12, H), INK.ink, false);
};
// ---------- anime look-dev (phase 2) ----------
// a_body_<who>: one character big, five full bodies. t < 1 office, else stage.
const bodySheet = (ctx, t, w) => {
  const tc = twos(t), k = t < 1 ? 0 : 1, s = 92 * 10 / castOf(w).H, y = 1050; look(k); if (k) stageBg(ctx, t); else officeBg(ctx, y);
  const P = k ? [{ rage: 1, hold: 'micstand' }, { legs: 'wide', rage: .8, mouth: 'scream', armL: { a: 168, e: 4 }, armR: { a: 85, e: 38 }, handL: 'horns', handR: 'horns' }, { hold: 'mic', rage: .6 }, { rage: .3, turn: .5, legs: 'walk', phase: .2 }, { armR: { a: 28, e: -118 }, handR: 'thumb', mouth: 'smile', eyes: 'happy', stance: 0 }]
    : [{}, { turn: .5 }, { hold: 'phone', ly: .8, hunch: .5 }, { hold: 'mug', turn: -.4 }, { rage: .5, armL: { a: 20, e: -100 }, handL: 'point', legs: 'walk', phase: .6, turn: .6 }];
  P.forEach((p, i) => person(ctx, 200 + i * 380, y, s, w, { t: tc, lids: blink(tc, i + 1) || undefined, ...p }));
};
// a_sheet_<who>: full bodies at rage 0 / .5 / 1, webcam busts at the same levels, close-ups at rage 0 and 1. t < 1 office, else stage.
const charSheet = (ctx, t, w) => {
  const tc = twos(t), k = t < 1 ? 0 : 1, C = castOf(w), s = 86 * 10 / C.H, ry = C.head.ry, tag = k ? INK.ink : INK.oline;
  look(k); if (k) stageBg(ctx, t); else officeBg(ctx, 1050);
  [0, .5, 1].forEach((r, i) => { person(ctx, 170 + i * 320, 1050, s, w, { rage: r, t: tc }); sheetTag(ctx, 'rage ' + r, 120 + i * 320, 34, tag);
    const box = [1000 + i * 307, 8, 299, 230]; fillPts(ctx, rect(...box), k ? INK.paperDk : INK.teamsBg, false); bust(ctx, box, w, { rage: r, t: tc }); });
  [0, 1].forEach(j => { const bx = 1000 + j * 460, by = 246, s2 = 220 / ry; ctx.save(); clipPts(ctx, rect(bx, by, 456, 826), false);
    person(ctx, bx + 228, by + 400 + (C.H - ry) * s2, s2, w, { view: 'bust', rage: j, t: tc }); ctx.restore(); outline(ctx, rect(bx, by, 456, 826), 3, INK.ink, { smooth: false }); });
};
// a_lineup: the whole cast, old rig (top, when PREV is loaded) over the new one (bottom). t < 1 office, else stage.
LOOKS.a_lineup = (ctx, t) => {
  const tc = twos(t), k = t < 1 ? 0 : 1, L = [...NAMES, 3, 8, 12];
  look(k); if (k) stageBg(ctx, t); else fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
  [[PREV && PREV.person, 520, 'OLD'], [person, 1060, 'NEW']].forEach(([fn, y, tag]) => { if (!fn) return;
    L.forEach((w, i) => fn(ctx, 110 + i * 212, y, 44, w, { t: tc, turn: (i % 3 - 1) * .2, ...(k ? { rage: [1, .3, 0, .2, .7, 0, .6, 0, .9][i], hold: ['micstand', null, 'guitar', 'bass', null, null, null, null, null][i] } : {}) }));
    sheetTag(ctx, tag, 20, y - 470, k ? INK.ink : INK.oline); });
};
// a_overrides: c05's cast overrides (bare, gym, beach) office and stage, plus thumbs up from s 12 to 46
LOOKS.a_overrides = (ctx, t) => {
  const tc = twos(t), D = CAST.dan, V = [{ ...D, top: 'bare', tie: false, watch: false }, { ...D, top: 'tee', sleeve: 'short', tie: false, bottom: 'shorts', belt: false, shoes: 'sneaker' }, { ...D, tie: false, bottom: 'shorts', belt: false, shoes: 'flat' }];
  fillPts(ctx, rect(0, 0, 1100, H), INK.wall, false); ctx.save(); clipPts(ctx, rect(1100, 0, 820, H), false); stageBg(ctx, t); ctx.restore();
  V.forEach((c, i) => { look(0); person(ctx, 140 + i * 300, 1040, 48, c, { t: tc, armL: i === 1 ? { a: 150, e: 20 } : undefined }); look(1); person(ctx, 1240 + i * 260, 1040, 48, c, { t: tc, rage: [1, .5, 0][i] }); });
  look(0); [12, 16, 20, 24, 32, 42].forEach((s, i) => ['dan', 'greg'].forEach((w, j) => person(ctx, 60 + i * 180 + j * s * 2.6, 470, s * 10 / castOf(w).H, w, { armR: { a: 28, e: -118 }, handR: 'thumb', t: tc })));
};
// a_perf: ms per call by character (render --sheet=0,0,0 and read the last frame)
LOOKS.a_perf = (ctx, t) => {
  const tm = (n, fn) => { const t0 = performance.now(); for (let i = 0; i < n; i++) fn(i); return (performance.now() - t0) / n; };
  const rows = [...NAMES, 7].map(w => { const s = 55 * 10 / castOf(w).H;
    look(0); const fo = tm(8, i => person(ctx, 100 + i * 220, 1000, s, w, { hunch: .3, t: .5 }));
    look(1); const fs = tm(8, i => person(ctx, 100 + i * 220, 1000, s, w, { rage: 1, legs: 'wide', turn: .3, t: .5 }));
    const bs = tm(20, i => person(ctx, 100 + i * 90, 500 + 8.6 * 40, 40, w, { view: 'bust', rage: .5, t: .5 })), cs = tm(4, i => person(ctx, 960, 600 + 9 * 300, 300, w, { view: 'bust', rage: 1, t: .5 }));
    look(0); const bo = tm(20, i => person(ctx, 100 + i * 90, 500 + 8.6 * 40, 40, w, { view: 'bust', t: .5 })), co = tm(4, i => person(ctx, 960, 600 + 9 * 300, 300, w, { view: 'bust', t: .5 }));
    return `${String(w).padEnd(6)} full office ${fo.toFixed(2)} stage ${fs.toFixed(2)} | bust office ${bo.toFixed(2)} stage r.5 ${bs.toFixed(2)} | close-up office ${co.toFixed(2)} stage r1 ${cs.toFixed(2)} ms`; });
  fillPts(ctx, rect(0, 0, W, H), INK.ink, false); rows.forEach((r, i) => txt(ctx, r, 60, 100 + i * 60, { font: 'mono', weight: 700, size: 30, color: INK.white }));
};
for (const w of [...NAMES, 7]) { LOOKS['a_body_' + w] = (ctx, t) => bodySheet(ctx, t, w); LOOKS['a_sheet_' + w] = (ctx, t) => charSheet(ctx, t, w); }

Object.assign(window, { person, CAST, extra, crowdPerson, singOpen, blink, twitchAt, headbang, jumpArc, rageFace, bustFit, headFit, foreheadCam, tube });
})();
