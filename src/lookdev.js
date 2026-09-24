// lookdev.js: standalone test scenes (node render.mjs --look=name --sheet=...). t is scene time, not song time.
const LOOKS = {};
LOOKS.toast = (ctx, t) => {
  fillPts(ctx, rect(0, 0, W, H), INK.night, false);
  toast(ctx, 960, 480, 1.25);
  officeChair(ctx, 300, 1060, .6);
  const a = rabbit(ctx, 300, 900, 22, { sit: 1, lx: .5 });
};
LOOKS.lyrics = (ctx, t) => { fillPts(ctx, rect(0, 0, W, H), t > 87.7 && t < 104.6 ? '#D9D4C8' : t > 104.6 ? INK.night : INK.blue, false); txt(ctx, t.toFixed(2), 1800, 1050, { size: 30, color: INK.white }); };
LOOKS.lyrics.lyrics = true;
LOOKS.burrow = (ctx, t) => {
  burrow(ctx, t, { screen: (c, [x, y, w, h], tt) => { c.save(); c.translate(x, y); c.scale(w / 1680, w / 1680); prPage(c, tt, { x: 0, y: 0, w: 1680, h: h * 1680 / w, shadow: 0, comments: [{ at: 4, chip: 'critical', body: ['Secret key committed. Rotate it.'] }] }); c.restore(); } });
  const tt = twos(t); rabbit(ctx, 1400, 1010, 30, { turn: .5, lx: .8, ly: -.3, armR: { a: 70, e: 60 }, earL: { a: -10, b: wob(tt, .6) * 8 }, earR: { a: 12, b: 0 } });
};
LOOKS.stage = (ctx, t) => {
  stage(ctx, t, { n: 3, altar: .6 });
  const tt = twos(t);
  bunnyRows(ctx, tt, 3, { rows: 1, hopFn: i => Math.max(0, Math.sin(tt * 6 + i)) * 2 });
  rabbit(ctx, 960, 1000, 34, { eyes: 'happy', mouth: 'grin', armL: { a: 140, e: 20 }, armR: { a: 140, e: 20 }, pawL: 'open', pawR: 'open' });
  cursor(ctx, 1500, 500, 160, { click: frac(t) });
};
LOOKS.props = (ctx, t) => {
  fillPts(ctx, rect(0, 0, W, H), INK.blue, false);
  dotsIn(ctx, [0, 0, W, H], { color: INK.blueDk, spacing: 30, dir: [0, 1], from: 0, to: H, min: .2, max: .8 });
  cutout(ctx, 60, 60, 620, 300, -.04, t, c => tweetCard(c, 0, 0, 620, { text: ['wake up babe,', 'new model dropped'], dark: true }), { xerox: true });
  cutout(ctx, 720, 40, 560, 420, .03, t, c => metrChart(c, 0, 0, 560, 420, t, { footnote: 'Measurements above 400 comments are unreliable.' }));
  pocketWatch(ctx, 1560, 330, 200, { left: 90, open: .4 + .6 * frac(t) });
  commentCard(ctx, 60, 440, 760, t, { chip: 'critical', body: ['Unsanitized input on line 9012.', 'This is an SQL injection.'] });
  terminal(ctx, 860, 500, 560, 250, t, { lines: [['$ git push --force', INK.white], ['+ 4f3a1c...d4e5f6 (forced update)', INK.yellow]] });
  win95(ctx, 1450, 600, 440, 280, { text: ['400 unresolved comments.'], press: 1 });
  promptBox(ctx, 60, 760, 760, t);
  statusPage(ctx, 860, 780, 560, t, { rows: [['API', 'down'], ['Web', 'down']] });
  for (let i = 0; i < 4; i++) commentBunny(ctx, 120 + i * 150, 1040, 90, { eyes: ['dot', 'happy', 'sad', 'wide'][i], state: i === 3 ? 'outdated' : 'open', chip: i === 1 ? 'critical' : null });
  agentBot(ctx, 1560, 1060, 80, { say: "You're absolutely right!", clap: frac(t * 2) });
  stamp(ctx, 'LGTM', 1640, 160, 120, .5, { color: INK.red });
  thumbsUp(ctx, 1800, 520, 90);
};
LOOKS.eva = (ctx, t) => evaCard(ctx, t, [{ s: 'LINE', x: 150, y: 330, size: 250 }, { s: '9,012', x: 150, y: 640, size: 330 }, { s: '第九千十二行', x: 1780, y: 380, size: 120, font: 'jp', align: 'right', sx: .9 }, { s: 'THE RABBIT, READING', x: 1780, y: 900, size: 120, align: 'right' }]);
LOOKS.rabbit = (ctx, t) => {
  ctx.fillStyle = INK.paper; ctx.fillRect(0, 0, W, H);
  const P = [
    { }, { turn: .6 }, { turn: -.6, eyes: 'wide', mouth: 'o', earL: { a: -30, b: -20 }, earR: { a: 30, b: 20 } },
    { eyes: 'happy', mouth: 'grin', blush: 1, armL: { a: 150, e: 20 }, armR: { a: 150, e: 20 }, pawL: 'open', pawR: 'open' },
    { mouth: 'open', open: .9, lids: .1, armR: { a: 95, e: -30 }, pawR: 'point', earR: { a: 18, b: 55 } },
    { lids: .5, mouth: 'flat', bags: 1, earL: { a: -40, b: -60 }, earR: { a: 45, b: 70 } },
    { eyes: 'open', browTilt: 2, mouth: 'frown', anger: 1, lids: .25 },
    { hop: 2, sq: -.2, legs: 'hop', ...earsFor(.8), armL: { a: 60, e: 40 }, armR: { a: 60, e: 40 } },
    { eyes: 'star', mouth: 'open', open: .6, sense: 1, glasses: true },
  ];
  P.forEach((p, i) => { const x = 130 + i * 208, y = 900; rabbit(ctx, x, y, 21, p); });
};
LOOKS.rabbitBig = (ctx, t) => {
  ctx.fillStyle = INK.blue; ctx.fillRect(0, 0, W, H);
  dotsIn(ctx, [0, 0, W, H], { color: INK.blueDk, spacing: 18, dir: [0, 1], from: 0, to: H, min: .2, max: .9 });
  const tt = twos(t), sing = singOpen(tt + 10.45);
  rabbit(ctx, 700, 1040, 58, { mouth: 'open', open: sing, lx: .3, ly: -.2, earL: { a: -14 + wob(tt, .5) * 5, b: wob(tt, .7) * 10 }, armR: { a: 40, e: 60 }, pawR: 'thumb', blush: .6 });
  rabbit(ctx, 1450, 1000, 34, { turn: .7, eyes: 'open', lids: .45, mouth: 'smirk', armL: { a: 20, e: 100 } });
};
LOOKS.engine = (ctx, t) => {
  // background plate, defocused
  depth(ctx, 9, c => {
    c.fillStyle = INK.night; c.fillRect(0, 0, W, H);
    dotsIn(c, [0, 0, W, H], { color: INK.nightLt, spacing: 22, dir: [0, 1], from: 0, to: H, min: .1, max: .9 });
    speedLines(c, 1400, 520, { color: rgba(INK.blue, .8), r0: 380, n: 70, w: 16 });
    for (let i = 0; i < 6; i++) ink(c, rrect(120 + i * 300, 700 + Math.sin(i) * 40, 220, 300, 18), { fill: [INK.pink, INK.yellow, INK.cyan][i % 3], shade: { color: rgba(INK.ink, .5), spacing: 12 }, line: 4, smooth: false, seed: i });
  });
  // a hero blob with halftone shading
  const b = blob(1400, 520, 260, 3, .12, 22);
  ink(ctx, b, { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 14, dir: [.5, .85], from: -60, to: 260 }, line: 7 });
  burst(ctx, 1560, 300, 120, { seed: 5 });
  inkLine(ctx, [[1200, 800], [1350, 900], [1600, 860], [1750, 950]], 14, INK.ink);
  hatch(ctx, ell(1300, 620, 120, 80), { color: INK.ink, spacing: 10, width: 3 });
  const k = frac(t / 2);
  txt(ctx, 'NINETY', 110, 330, { size: 300, stretch: -2, color: INK.paper, extrude: { dx: 14, dy: 16, color: INK.orange }, stroke: { w: 12, color: INK.ink } });
  txt(ctx, 'SECONDS', 110, 560, { size: 220, stretch: -2, color: INK.yellow, dots: { color: INK.orange }, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink } });
  sfx(ctx, 'PING!', 1500, 180, 150, k * 1.2);
  txt(ctx, 'function fix() { return a ? b ? c : d : e }', 110, 700, { font: 'mono', weight: 700, size: 40, color: INK.cyan });
  txt(ctx, 'Small fix #4812', 110, 780, { font: 'ui', weight: 700, size: 52, color: INK.paper });
  txt(ctx, 'ARCHIVO CONDENSED', 110, 880, { size: 80, stretch: -4, color: INK.pink });
  txt(ctx, 'ARCHIVO EXPANDED', 110, 980, { size: 80, stretch: 2, italic: true, color: INK.green });
  txt(ctx, 'EPISODE:17', 1100, 1000, { font: 'serif', weight: 900, stretch: -3, size: 90, color: INK.white });
  txt(ctx, '\u30EC\u30D3\u30E5\u30FC', 1580, 1000, { font: 'jp', weight: 800, size: 80, color: INK.white });
};
