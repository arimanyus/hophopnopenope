// c01_verse1.js: verse 1 + pre-chorus 1 (0 - 20.62). Office, 8:57 AM. Quiet, locked, symmetric; the comedy is in the
// details. One 2-frame mask slip on "sec". From the band's entry (13.53) the office cracks: look 0 -> .4, rage -> .4.
(() => {
  const F1 = 1 / 24, on = (t, a) => t >= a - F1;                    // hits land on (or one frame before) their sound
  const CLOCK0 = clockSecs(8, 57, 0);
  const SLIPF = Math.floor(wordT(1, 5) * 24), isSlip = t => { const f = Math.round(t * 24); return f === SLIPF || f === SLIPF + 1; };   // "sec": exactly two frames
  const BAND = beatTime(31);                                        // 13.53, the full band slams in
  const LOOKC = t => kf(t, [[BAND, 0], [BAND + .5, .1], [20.6, .4]]);
  const DAN_HS = { ...CAST.dan, ear: 'headset', pal: { ...CAST.dan.pal, headset: ['#46454D', INK.ink] } };
  const MSG0 = 'Hey, you got a sec? \uD83D\uDE42';
  const DAY = wordT(3, 4), clockAt = t => CLOCK0 + t + (on(t, DAY) ? 60 : 0);   // the minute hand clunks on "day"

  // What Dan's webcam sees behind him: his cubicle partition (wall, rail, fabric panel, sticky notes).
  function cubicle(c, [x, y, w, h]) {
    fillPts(c, rect(x, y, w, h), INK.wall, false);
    fillPts(c, rect(x, y + h * .34, w, h * .66), INK.cube, false);
    fillPts(c, rect(x, y + h * .3, w, h * .045), '#959EA8', false);
    fillPts(c, rect(x + w * .33 - h * .01, y + h * .345, h * .02, h), INK.cubeDk, false);
    c.save(); c.translate(x + w * .86, y + h * .44); c.rotate(.06); fillPts(c, rect(0, 0, h * .14, h * .14), '#ECE2A6', false); c.restore();
    c.save(); c.translate(x + w * .78, y + h * .5); c.rotate(-.05); fillPts(c, rect(0, 0, h * .13, h * .13), '#EBC9CC', false); c.restore();
  }
  function danCam(c, box, t, pose, who = 'dan') {
    cubicle(c, box);
    const B = bustFit(box, 'dan', { zoom: pose.zoom || 1, dy: pose.dy || 0 });
    person(c, B.x + (pose.dx || 0) * box[2], B.y, B.s, who, { view: 'bust', t: twos(t), ...pose });
  }
  const deskScreen = (c, b, t) => outlookCalendar(c, b, t, { zoom: .34, nav: false, now: 8.95, from: 8, to: 18,
    events: Array.from({ length: 22 }, (_, i) => ({ day: i % 5, start: 9 + Math.floor(i / 5) * 1.5 + (i % 2) * .5, end: 9.75 + Math.floor(i / 5) * 1.5 + (i % 2) * .5, title: 'Quick sync' })) });

  // ---------- S1 0 - 2.0: the thumbnail. Dan mid-sip at his desk, the toast arriving. ----------
  function desk(ctx, t) {
    look(0); const tc = twos(t), ping = on(t, wordT(0, 0));
    // the sip: up towards the lips, frozen by the ping, then lowered (FK angles: a shoulder, e elbow)
    const sip = ping ? kf(tc, [[1.62, [35, -166]], [1.95, [10, -128]]], easeInOut) : kf(tc, [[0, [12, -152]], [.55, [35, -166]]], easeOut);
    const look1 = seg(tc, wordT(0, 0), wordT(0, 0) + .12);
    cam(ctx, 810, 410, lerp(2.2, 2.25, t / 2));
    officeDesk(ctx, t, { clock: clockAt(t), mug: false, screen: deskScreen });
    person(ctx, ...DESK.dan, 'dan', { sit: 1, turn: .45, hunch: .35, hold: 'mug', armR: { a: sip[0], e: sip[1] }, glare: 1 - look1 * .85, lx: look1 * .9, ly: look1 * .35,
      mouth: 'polite', lids: Math.max(.12, blink(tc, [1.75])), twitch: on(t, wordT(0, 4)) && t < wordT(0, 4) + .2 ? .9 : 0, brows: look1 * .12, t: tc });
    officeDesk(ctx, t, { fg: true });
    ctx.restore();
    teamsToast(ctx, 930, 620, 950, t, { kind: 'chat', who: 'greg', text: MSG0, t0: -.2, presence: 'available', photo: true });
  }

  // ---------- S2 2.0 - 3.62: close on Dan. The smile strains. Mask slip on "sec". ----------
  function close(ctx, t) {
    if (isSlip(t)) return slip(ctx, t, 'SEC!');
    look(0); const tc = twos(t), after = Math.round(t * 24) > SLIPF, r = after ? .12 : lerp(.04, .2, seg(tc, 2.1, 3.0));
    cam(ctx, 716, 572, 4.2);
    officeDesk(ctx, t, { clock: clockAt(t), mug: false, screen: deskScreen });
    person(ctx, ...DESK.dan, 'dan', { sit: 1, turn: .3, hunch: .3, rage: r, mouth: 'polite', lx: .55, ly: .15, brows: on(tc, wordT(1, 2)) && !after ? .18 : .05,
      wild: after ? .14 : 0, lids: Math.max(after ? .2 : .14, blink(tc, [2.2, 3.36])), t: tc });
    officeDesk(ctx, t, { fg: true });
    ctx.restore();
  }
  // The mask slip: full-riso stage Dan screaming the word, red only, then straight back.
  function slip(ctx, t, word) {
    look(1); FRAME.lyrics = false;
    const f = Math.floor(t * 24), sh = shake(t, 16), odd = f % 2;
    sunburst(ctx, 960, 470, INK.paper, INK.red, odd * .12, 18);
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: INK.redDk, k: (x, y) => clamp((Math.hypot(x - 960, y - 470) / 950 - .25) * 1.5) });
    depth(ctx, 10, c => { c.translate(sh[0], sh[1]); const F = headFit(960 + (odd ? 14 : -10), 560, 620, 'dan'); person(c, F.x, F.y, F.s, 'dan', { view: 'bust', rage: 1, stage: 1, wild: 1, open: 1, sweat: .3, tilt: odd ? -8 : 5, nod: -.12, t }); });
    txt(ctx, word, 960 + sh[0] * 2, 1010, { font: 'display', size: 330, weight: 900, stretch: -2, color: INK.paper, align: 'center', rot: odd ? -.05 : -.08,
      stroke: { w: 18, color: INK.ink }, extrude: { dx: 18, dy: 20, color: INK.ink } });
    misregFrame(ctx, 10, odd ? .5 : 2.1);
  }

  // ---------- S3 3.62 - 5.2: the chat, big. Greg types... then double-texts. ----------
  function chat(ctx, t) {
    look(0);
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    const a = wordT(2, 0), b = wordT(2, 2), typing = t < a - F1 || (t > a + .25 && t < b - F1) || t > 4.95 && t < 5.05;
    teamsChat(ctx, [120, 24, 1680, 1032], t, { title: 'Greg Hollis (He/Him)', zoom: 4, typing: typing ? 'greg' : null,
      messages: [{ who: 'greg', text: MSG0, time: '8:57 AM' }, { who: 'greg', text: 'Nothing urgent,', time: '8:57 AM', at: a }, { who: 'greg', text: 'just a quick sync \uD83D\uDE42', at: b }] });
  }

  // ---------- S4 5.2 - 7.1: the wall clock. Half the day goes Outlook blue; the minute hand clunks on "day". ----------
  function clock(ctx, t, lt) {
    look(0);
    const cx = 960, cy = 440, r = 300, z = lerp(1, 1.1, easeInOut(lt / 1.9));
    cam(ctx, cx, cy + 40, z);
    fillPts(ctx, rect(-200, -200, 2320, 1480), INK.wall, false);
    fillPts(ctx, rect(-200, -200, 2320, 230), INK.ceil, false);
    fillPts(ctx, rect(-200, 22, 2320, 14), INK.wallDk, false);
    fluoro(ctx, t, [700, -60, 520, 70], { k: 0 });
    const jolt = hit(t, [DAY], 18);
    wallClock(ctx, cx, cy, r, clockAt(t), { k: 0, rot: .025 * jolt * Math.cos((t - DAY) * 60) });
    const k = easeInOut(seg(t, wordT(3, 2) - F1, wordT(3, 3) + .05));
    if (k > 0) {
      const a0 = Math.PI, a1 = Math.PI + Math.PI * k, R = r * .87, wedge = [[cx, cy]];
      for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40); wedge.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; fillPts(ctx, wedge, INK.outlookLt, false); ctx.restore();
      inkLine(ctx, [[cx, cy], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R]], 10, INK.outlook, { taper: [0, 0], smooth: false, keepWeight: true });
      if (k > .6) txt(ctx, 'Quick sync \uD83D\uDE42', cx - r * .1, cy - r * .15, { font: 'ui', weight: 700, size: 30, color: '#0F3E66', align: 'right', alpha: seg(k, .6, 1) });
    }
    ctx.restore();
  }

  // ---------- S5 7.1 - 8.6: Outlook. The little blue boxes eat Dan's focus time. ----------
  function calendar(ctx, t) {
    look(0);
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    const z = 3.6, from = 8.75, to = 11, hh = 144, bx = 960 - (324 + 1.5 * 314.7) * z, by = 80 - 124 * z;
    outlookCalendar(ctx, [bx, by, 1280 * z, (160 + hh * (to - from)) * z], t, { zoom: z, from, to, now: 8.95, days: ['6 Tuesday', '7 Wednesday', '8 Thursday'], today: 1, events: [
      { day: 1, start: 9, end: 12, title: 'Focus time \uD83C\uDFA7', where: 'Do not book' },
      { day: 1, start: 9, end: 9.25, title: 'Quick sync \uD83D\uDE42', at: wordT(4, 1) },
      { day: 1, start: 9.25, end: 9.75, title: 'Re: quick sync \uD83D\uDE42', at: wordT(4, 4) },
      { day: 0, start: 9, end: 10, title: 'Standup' }, { day: 0, start: 10, end: 10.5, title: 'Pre-standup' }, { day: 2, start: 8.5, end: 9.5, title: 'Alignment' }, { day: 2, start: 10, end: 11, title: 'Touch base' }] });
  }

  // ---------- S6 8.6 - 10.2: the invite. 15 min; the attendee list explodes. ----------
  const PEOPLE = ['greg', 'dan', 'linda', 'tasha', 'bob', ...Array.from({ length: 22 }, (_, i) => i + 1)];
  function invite(ctx, t) {
    look(0);
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    const n = t < wordT(5, 3) - F1 ? 2 : t < wordT(5, 4) - F1 ? 5 : t < 9.93 - F1 ? 12 : 27;
    const att = PEOPLE.slice(0, n).map((who, i) => ({ who, status: i === 0 ? 'yes' : ['none', 'maybe', 'yes', 'none'][i % 4] }));
    const scroll = easeInOut(seg(t, 9.98, 10.2)) * 520;
    outlookInvite(ctx, 360, 24 - scroll, 1200, t, { title: 'Quick sync \uD83D\uDE42', dur: '15 min', attendees: att, t0: 8.45 });
  }

  // ---------- S7 10.2 - 11.55: the reply box. "can you just type it?" ... deleted ... "Sure! 🙂" ----------
  function reply(ctx, t) {
    look(0);
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    const s1 = 'can you just type it?', s2 = 'Sure! \uD83D\uDE42', a = 10.24, b = wordT(6, 2) + .05, d0 = 10.86, d1 = 11.0, c0 = 11.0, c1 = wordT(6, 5);
    let s = '';
    if (t < b) s = s1.slice(0, Math.floor(s1.length * clamp((t - a) / (b - a))));
    else if (t < d0) s = s1;
    else if (t < d1) s = s1.slice(0, Math.floor(s1.length * (1 - clamp((t - d0) / (d1 - d0)))));
    else s = [...s2].slice(0, Math.ceil([...s2].length * clamp((t - c0) / (c1 - c0)))).join('');
    teamsToast(ctx, 210, 90, 1500, t, { kind: 'chat', who: 'greg', text: 'just a quick sync \uD83D\uDE42', t0: 10.0, presence: 'available', reply: s });
  }

  // ---------- S8 11.55 - 13.53: pre-join. The headset lands on "ear"; the click on "Join now". ----------
  function prejoin(ctx, t) {
    look(0); const tc = twos(t), ear = wordT(7, 8), click = 13.30;
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    teamsLogo(ctx, 76, 58, 44);
    txt(ctx, 'Quick sync \uD83D\uDE42', 960, 92, { font: 'ui', weight: 700, size: 52, color: '#FFFFFF', align: 'center' });
    const box = [480, 122, 960, 540];
    teamsTile(ctx, box, t, { who: 'dan', muted: true, zoom: 1.8, draw: (c, b) => {
      const up = seg(tc, 12.3, 12.55), down = easeIn(seg(tc, 12.55, ear - F1)), landed = on(t, ear);
      const zoom = 1.15, B = bustFit(b, 'dan', { zoom }), hd = CAST.dan.head, hy = B.y - (CAST.dan.H - hd.ry) * B.s + .05 * B.s;
      const cupY = landed ? hy : hy - B.s * (lerp(0, .9, up) - .9 * down);
      const hands = tc >= 12.3 && !landed;
      const pose = { zoom, mouth: 'polite', lids: landed ? Math.max(.2, blink(tc, [13.08])) : hands ? .55 : .15, eyes: hands && !landed ? 'closed' : 'open', nod: landed ? .07 * Math.exp(-(tc - ear) * 9) : 0,
        lx: tc > 13.0 ? .55 : 0, ly: tc > 13.0 ? .5 : 0 };
      const hx = (hd.rx + .14) * B.s;
      if (hands) Object.assign(pose, { reachL: [B.x - hx, cupY + .18 * B.s], reachR: [B.x + hx, cupY + .18 * B.s], handL: 'grip', handR: 'grip' });
      danCam(c, b, t, pose, landed ? DAN_HS : 'dan');
      if (!landed && hands) headsetProp(c, B.x, cupY, B.s);
    } });
    // toggles under the preview, Join now on the right
    const ty = 712;
    appIcon(ctx, 'camera', 520, ty, 44, '#D6D6D6'); toggle(ctx, 570, ty, true);
    appIcon(ctx, 'mic', 720, ty, 44, '#D6D6D6', { off: true, bg: INK.teamsBg }); toggle(ctx, 770, ty, false);
    const jb = [1190, ty - 42, 250, 84], pk = clamp((t - click + F1) / .12), pressed = on(t, click);
    fillPts(ctx, rrect(jb[0], jb[1], jb[2], jb[3], 10), pressed ? INK.teamsDk : INK.teams, false);
    txt(ctx, pressed ? 'Joining...' : 'Join now', jb[0] + jb[2] / 2, ty + 2, { font: 'ui', weight: 700, size: 36, color: '#FFFFFF', align: 'center', base: 'middle' });
    const p = kf(t, [[12.9, [1700, 1060]], [13.18, [1330, ty + 14]], [13.5, [1330, ty + 14]]], easeOut);
    if (t > 12.9) pointer(ctx, p[0], p[1], 72, { click: pressed ? pk : 0 });
  }
  function toggle(ctx, x, y, onn) {
    fillPts(ctx, rrect(x, y - 20, 76, 40, 20), onn ? INK.teams : '#1F1F1F', false);
    if (!onn) outline(ctx, rrect(x, y - 20, 76, 40, 20), 3, '#ADADAD', { smooth: false });
    fillPts(ctx, ell(onn ? x + 56 : x + 20, y, 13, 13, 16), onn ? '#FFFFFF' : '#ADADAD');
  }
  // The headset in Dan's hands on its way down (once it lands, the rig draws it: DAN_HS).
  function headsetProp(c, x, y, s) {
    const col = '#46454D', band = [], { rx, ry } = CAST.dan.head, ex = (rx + .04) * s;
    for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; band.push([x + Math.cos(a) * ex, y - .05 * s + Math.sin(a) * (ry + .1) * s]); }
    inkLine(c, band, .17 * s, INK.oline, { taper: [0, 0], keepWeight: true }); inkLine(c, band, .09 * s, '#6A6870', { taper: [0, 0], keepWeight: true });
    for (const sd of [-1, 1]) ink(c, ell(x + sd * ex, y, .17 * s, .24 * s, 14), { fill: col, line: 2.5 });
    inkLine(c, bezPts([x - ex, y + .12 * s], [x - ex, y + .5 * s], [x - .4 * s, y + .62 * s], [x - .2 * s, y + .6 * s], 10), .05 * s, col, { taper: [0, 0], keepWeight: true });
  }

  // ---------- pre-chorus: the call ----------
  const TILE_DAN = (t, pose, k = null) => ({ who: 'dan', muted: true, look: k, draw: (c, b) => danCam(c, b, t, pose) });
  const others = () => [{ who: 'linda', muted: true }, { who: 'tasha', camOff: true, muted: true }, { who: 'bob', frozen: BAND + .4, muted: true }];
  const timer = t => 1 + Math.max(0, t - BAND);
  const danK = t => Math.min(1, LOOKC(t) + lerp(.15, .45, seg(t, BAND, 20.6)) * snare(t, 9));   // Dan's tile wants to unmute on every snare
  const nodBeat = (t, amt) => amt * Math.exp(-frac(beatAt(t + F1)) * 5) * .12;   // a polite nod that is secretly a headbang
  const TITLE = 'Quick sync \uD83D\uDE42 | Microsoft Teams';

  // Greg's webcam, painted here so his hands can be IK'd into frame. pose(F, hc) gets the bust fit and his head centre.
  function gregCam(c, b, t, zoom, dy, pose) {
    webcamBg(c, b, 'bookshelf', 1);
    const tc = twos(t), F = bustFit(b, 'greg', { zoom, dy }), hc = F.y - (CAST.greg.H - CAST.greg.head.ry) * F.s;
    person(c, F.x, F.y, F.s, 'greg', { view: 'bust', mouth: 'talk', open: clamp(.2 + .6 * Math.abs(noise1(tc * 6))), t: tc, ...pose(F, hc) });
  }
  // P1 13.53 - 15.21: Greg far too close; a big "hop on!" wave on "hop".
  function call1(ctx, t) {
    look(LOOKC(t)); const tc = twos(t), hop = wordT(8, 4), g = backOut(seg(t, hop - .14, hop), 2.4) * (1 - seg(tc, 14.8, 15.05)), wag = Math.sin((tc - hop) * TAU * 2.5) * g;
    fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
    teamsCall(ctx, [0, 0, 1920, 1080], t, { title: TITLE, timer: timer(t), participants: 5, layout: 'speaker', shadow: false, tiles: [
      { who: 'greg', speaking: true, draw: (c, b) => gregCam(c, b, t, 1.35, -.03, (F, hc) => g < .05 ? {} :
        { reachR: [F.x + (lerp(1.2, 2.0, g) + .12 * wag) * F.s, hc + lerp(2.6, .9, g) * F.s], handR: 'open', mouth: 'grin', open: .3, lids: .3 * g, brows: .25 * g, tilt: -4 * wag }) },
      ...others(), TILE_DAN(t, { lids: .15, nod: nodBeat(t, .5), rage: .12 }, danK(t))] });
    const crack = hit(t, [BAND], 16);                       // the band slams in: the office print slips for two frames
    if (crack > .3) misregFrame(ctx, 9 * crack, .5);
  }
  // P2 15.21 - 16.88: "Like that solves everything": Greg thumbs-up-reacts to his own sentence. Smug.
  function call2(ctx, t) {
    look(LOOKC(t)); const tc = twos(t), up = backOut(seg(tc, wordT(9, 2) - .14, wordT(9, 2)), 2.6), L = '\uD83D\uDC4D';
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    teamsTile(ctx, [60, 40, 1800, 1000], t, { who: 'greg', speaking: true, zoom: 3,
      draw: (c, b) => gregCam(c, b, t, 1.7, .02, () => ({ mouth: 'grin', open: 0, lids: lerp(.05, .4, up), brows: .25 + .25 * up, tilt: 5 * up, lx: -.2 * up })),
      reactions: [{ e: L, at: wordT(9, 2), x: .72 }, { e: L, at: wordT(9, 3), x: .8 }, { e: L, at: wordT(9, 3) + .3, x: .68 }] });
  }
  // P3 16.88 - 18.54: "it'll be quick": Dan nods; the twitch; the tuft springs up on "quick".
  function call3(ctx, t) {
    look(LOOKC(t)); const tc = twos(t), q = wordT(10, 4), sprung = backOut(seg(t, q - F1, q + .1), 3);
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    teamsTile(ctx, [60, 40, 1800, 1000], t, { ...TILE_DAN(t, { rage: lerp(.2, .3, sprung), wild: .1 + .3 * sprung, nod: nodBeat(t, .8), lids: .15, twitch: on(t, q) ? twitchAt(tc, 1) : 0 }, danK(t)), zoom: 3 });
  }
  // P4 18.54 - 19.80: "That's the funniest thing": the polite fake laugh, the body shaking with rage.
  function call4(ctx, t) {
    look(LOOKC(t)); const tc = twos(t), ha = Math.abs(Math.sin(tc * 13)), sh = shake(tc, 1)[0] * lerp(.004, .016, seg(tc, 18.6, 19.7));
    fillPts(ctx, rect(0, 0, W, H), INK.teamsBg, false);
    const z = W / 760, top = (32 + 56 + 8) * z, th = (590 - top) / .44;
    teamsCall(ctx, [0, 0, W, top + th + 8 * z], t, { zoom: z, title: TITLE, timer: timer(t), participants: 5, layout: 'speaker', shadow: false,
      tiles: [TILE_DAN(t, { zoom: 1.2, dy: .06, rage: lerp(.3, .4, seg(tc, 18.6, 19.7)), mouth: 'grin', eyes: 'happy', open: .25 + .35 * ha, nod: -.03 * ha, dx: sh, wild: .4, sweat: .3, tilt: 3 * Math.sin(tc * 9) }, danK(t))] });
  }
  // P5 19.80 - 20.62: the cursor hovers over the mic. Framed exactly like c02's first frame (Dan left, Mic panel right),
  // so the cut to c02 reads as the colour arriving.
  function hover(ctx, t) {
    look(LOOKC(t)); const tc = twos(t);
    cubicle(ctx, [-560, 0, 2480, H]);
    const F = headFit(560, 505, 540, 'dan');
    person(ctx, F.x, F.y, F.s, 'dan', { view: 'bust', turn: .38, rage: .42, wild: .45, glare: 0, lx: .8, ly: .35, mouth: 'polite', lids: .1,
      twitch: twitchAt(tc, 1), sweat: .35, brows: .1, nod: nodBeat(t, .6), t: tc });
    fillPts(ctx, rrect(1050, 560, 1000, 620, 44), INK.teamsBar, false);
    fillPts(ctx, rect(1050, 560, 1000, 8), '#3D3D3D', false);
    const cx = 1430, cy = 780;
    fillPts(ctx, rrect(1150, 600, 560, 440, 34), '#333333', false);
    appIcon(ctx, 'mic', cx, cy, 330, '#FFFFFF', { w: 1.35, off: true, bg: '#333333' });
    appIcon(ctx, 'chevron', cx + 230, cy - 6, 90, '#D6D6D6', { w: 1.6 });
    txt(ctx, 'Mic', cx, cy + 215, { font: 'ui', size: 92, weight: 500, color: '#D6D6D6', align: 'center', base: 'middle' });
    const p = kf(t, [[19.8, [1820, 1180]], [20.12, [1590, 880]]], expoOut), j = shake(t, 2 + 4 * seg(t, 20.1, 20.58));
    pointer(ctx, p[0] + j[0], p[1] + j[1], 150);
  }

  chapter('verse1', 0, 20.62, [
    [0, desk], [2.0, close], [3.62, chat], [5.2, clock], [7.1, calendar], [8.6, invite], [10.2, reply], [11.55, prejoin],
    [BAND, call1], [beatTime(35), call2], [beatTime(39), call3], [beatTime(43), call4], [beatTime(46), hover]]);

  Object.assign(LYRICS, {
    0: { mode: 'none' },                                   // Greg's toast
    1: { mode: 'livecap', hold: 0, until: 3.62 },          // gone before the chat cut
    2: { mode: 'none' },                                   // Greg's chat messages
    8: { mode: 'livecap', hold: .2, x: 40, w: 820, y: 1050 },
    9: { mode: 'livecap', hold: .2, y: 1050 },
    10: { mode: 'livecap', hold: .2, y: 1050 },
    11: { mode: 'livecap', hold: 0, x: 40, w: 860, y: 950, lines: 1, size: 48 },
  });
})();

