// lookdev.js: standalone test scenes (node render.mjs --look=name --sheet=...). t is scene time, not song time.
const LOOKS = {};
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
