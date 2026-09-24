// world.js: recurring sets. Each draws in world coordinates (a 1920x1080 layout); frame parts with cam().

// Rotating halftone sunburst (chorus stage, glory moments). Flat rays, never a gradient.
function sunburst(ctx, cx, cy, a, b, rot = 0, n = 18, R = 2600) {
  fillPts(ctx, rect(-2000, -2000, W + 4000, H + 4000), a, false);
  ctx.beginPath(); for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = a0 + TAU / n / 2; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); ctx.closePath(); }
  ctx.fillStyle = b; ctx.fill();
}

// ---------- the burrow ----------
// Layout (world px): room arch x 60..1860, desk top y 760, monitor wall x 1020..1800 / y 170..700, main screen MAIN.
const BURROW = { main: [1130, 250, 560, 380], side: [[1030, 190, 170, 140], [1720, 200, 150, 130], [1030, 520, 150, 120], [1740, 520, 130, 110]], desk: 760, chair: [1400, 1000] };
// burrow(ctx, t, {mood: 'warm'|'night'|'grey'|'party', screen: (ctx, [x, y, w, h], t) => ..., glow 0..1, lamp 0..1, fg: true})
function burrow(ctx, t, o = {}) {
  const mood = o.mood || 'warm', P = {
    warm: { earth: '#3A1C14', earth2: '#5A2A18', room: '#7A3A1E', dots: '#2A120C', light: INK.yellow },
    night: { earth: '#0E1230', earth2: '#1A2150', room: '#232C66', dots: '#0A0D24', light: INK.cyan },
    grey: { earth: '#2A2A2E', earth2: '#3E3E44', room: '#55555C', dots: '#1C1C20', light: '#D8D8D8' },
    party: { earth: '#2A0E3A', earth2: '#4A1060', room: '#6A1878', dots: '#1A0624', light: INK.pink },
  }[mood];
  fillPts(ctx, rect(-400, -400, W + 800, H + 800), P.earth, false);
  dotsIn(ctx, [-400, -400, W + 400, H + 400], { spacing: 34, color: P.dots, k: (x, y) => .35 + .35 * noise2(x * .004, y * .004) });
  // room arch (lighter earth), with roots
  const arch = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; arch.push([960 + Math.cos(a) * 980, 1010 + Math.sin(a) * 900]); } arch.push([1940, 1200], [-20, 1200]);
  ink(ctx, arch, { fill: P.room, shade: { color: P.earth2, spacing: 28, dir: [0, -1], from: -200, to: 500, max: .9 }, line: 6, boil: 1.2, smooth: true, seed: 2 });
  for (let i = 0; i < 9; i++) { const x0 = 180 + i * 190 + hash(i) * 60, len = 80 + hash(i + 3) * 170, sw = wob(t, .3, i * .2) * 6;
    inkLine(ctx, [[x0, 90 + Math.abs(x0 - 960) * .28], [x0 + 10 + sw, 90 + Math.abs(x0 - 960) * .28 + len * .5], [x0 - 8 + sw * 1.6, 90 + Math.abs(x0 - 960) * .28 + len]], 7 - hash(i) * 3, '#1A0A06', { taper: [.05, .9], seed: i }); }
  // pinned printed diffs + red-string board (left wall, dim so lyrics can sit on it)
  depth(ctx, o.pinsFocus ? 0 : 6, c => {
    const pins = [[190, 300, -.06], [360, 250, .05], [250, 470, .04], [430, 430, -.08], [560, 300, .07]];
    pins.forEach(([x, y, r], i) => { c.save(); c.translate(x, y); c.rotate(r); fillPts(c, rect(-70 + 6, -90 + 8, 140, 180), rgba(INK.ink, .7), false); fillPts(c, rect(-70, -90, 140, 180), mood === 'grey' ? '#C8C8C8' : '#EDE3CC', false);
      for (let k = 0; k < 8; k++) fillPts(c, rect(-55, -70 + k * 19, 40 + hash(i * 9 + k) * 70, 7), k % 3 === 1 ? rgba(INK.red, .6) : rgba(INK.green, .55), false);
      fillPts(c, ell(0, -84, 8, 8, 10), INK.red); c.restore(); });
    c.strokeStyle = mood === 'grey' ? '#9A9A9A' : INK.red; c.lineWidth = 4; c.beginPath(); c.moveTo(190, 216); c.lineTo(360, 166); c.lineTo(560, 216); c.moveTo(250, 386); c.lineTo(430, 346); c.lineTo(360, 166); c.stroke();
  });
  // monitor wall
  const glow = o.glow ?? 1, scr = mood === 'grey' ? '#BDBDBD' : '#DDF6FB';
  const monitor = ([x, y, w, h], main) => {
    ink(ctx, rrect(x - 26, y - 26, w + 52, h + 70, 22), { fill: mood === 'grey' ? '#8A8A8A' : '#D9CDB4', shade: { color: rgba(INK.ink, .35), spacing: 14, dir: [.6, .8], from: -40, to: h }, line: 6, boil: 1, smooth: false });
    fillPts(ctx, rrect(x, y, w, h, 16), '#101018', false);
    ctx.save(); clipPts(ctx, rrect(x, y, w, h, 16), false);
    if (main && o.screen) { fillPts(ctx, rect(x, y, w, h), scr, false); o.screen(ctx, [x, y, w, h], t); }
    else { fillPts(ctx, rect(x, y, w, h), mix('#101018', scr, .7 * glow), false); for (let k = 0; k < h / 16; k++) fillPts(ctx, rect(x + 12, y + 12 + k * 16, (w - 24) * (.3 + .6 * hash(k + x)), 7), k % 4 === 2 ? rgba(INK.red, .5) : rgba(INK.green, .45), false); }
    ctx.globalAlpha = .1; for (let k = 0; k < h; k += 6) fillPts(ctx, rect(x, y + k, w, 2), INK.ink, false); ctx.globalAlpha = 1;
    ctx.restore(); outline(ctx, rrect(x, y, w, h, 16), 4, INK.ink, { smooth: false });
  };
  BURROW.side.forEach(r => monitor(r, false)); monitor(BURROW.main, true);
  // monitor glow pooled on the desk (flat light shape, halftone edge)
  if (glow > 0) { ctx.save(); ctx.globalAlpha = .28 * glow; fillPts(ctx, [[1080, 700], [1740, 700], [1880, 900], [940, 900]], P.light, false); ctx.restore(); }
  // desk + props
  const dy = BURROW.desk;
  ink(ctx, [[820, dy], [1900, dy], [1900, dy + 50], [820, dy + 50]], { fill: '#8A5A34', shade: { color: '#4A2C18', spacing: 14, dir: [0, 1], from: 0, to: 60 }, line: 6, boil: 1, smooth: false });
  inkLine(ctx, [[880, dy + 50], [870, 1090]], 16, '#2A1A10', { taper: [0, 0], smooth: false }); inkLine(ctx, [[1850, dy + 50], [1860, 1090]], 16, '#2A1A10', { taper: [0, 0], smooth: false });
  // carrot mug
  ink(ctx, rrect(900, dy - 110, 90, 110, 16), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 12, dir: [.7, .7], from: -10, to: 90 }, line: 5, boil: 1, smooth: false });
  inkLine(ctx, [[990, dy - 85], [1030, dy - 70], [1030, dy - 35], [990, dy - 25]], 9, INK.ink, { taper: [0, 0] });
  for (let k = 0; k < 3; k++) inkLine(ctx, [[930 + k * 18, dy - 120], [925 + k * 18 + wob(t, .8, k) * 5, dy - 165], [935 + k * 18, dy - 205]], 4, rgba(INK.paper, .6), { taper: [.3, .8] });
  // paper stack
  for (let k = 0; k < 7; k++) ink(ctx, rect(1760 - k * 3, dy - 16 - k * 13, 120, 14), { fill: k % 2 ? '#EDE3CC' : '#F7F0DE', line: 3, boil: .6, smooth: false, seed: k });
  // desk lamp, warm cone
  if ((o.lamp ?? 1) > 0) { ctx.save(); ctx.globalAlpha = .22 * (o.lamp ?? 1); fillPts(ctx, [[1000, 330], [1060, 330], [1180, dy], [860, dy]], mood === 'warm' ? INK.yellow : P.light, false); ctx.restore(); }
  inkLine(ctx, [[1030, dy], [1000, 470], [1030, 340]], 10, INK.ink, { taper: [0, 0] });
  ink(ctx, [[975, 300], [1085, 300], [1105, 360], [955, 360]], { fill: INK.orange, line: 5, boil: .8, smooth: false });
  // foreground: dangling roots, out of focus
  if (o.fg !== false) depth(ctx, 10, c => { for (let i = 0; i < 3; i++) inkLine(c, [[i * 820 - 40, -20], [i * 820 + 30 + wob(t, .2, i) * 12, 110 + i * 30], [i * 820 + 10, 190 + i * 40]], 22, '#120604', { taper: [.02, .85], seed: 40 + i }); });
}

// ---------- the chorus stage ----------
// stage(ctx, t, {a, b: sunburst inks, spin, n: counter value, floor: ink for floor, marquee: bool, altar: 0..1 glow})
function stage(ctx, t, o = {}) {
  sunburst(ctx, 960, 420, o.a || INK.pink, o.b || INK.yellow, (o.spin ?? .08) * t, o.rays || 20);
  dotsIn(ctx, [0, 0, W, H], { spacing: 40, color: rgba(INK.ink, .22), dir: [0, 1], from: 0, to: H, min: 0, max: .6 });
  // floor: the PR page laid flat in perspective (diff bands crowd toward the horizon)
  const hz = o.horizon ?? 660, floor = [[-200, hz], [W + 200, hz], [W + 900, H + 60], [-900, H + 60]];
  ink(ctx, floor, { fill: INK.white, line: 6, boil: .8, smooth: false });
  ctx.save(); clipPts(ctx, floor, false);
  for (let i = 0; i < 26; i++) { const k0 = Math.pow(i / 26, 1.9), k1 = Math.pow((i + .8) / 26, 1.9), y0 = hz + k0 * (H - hz + 60), y1 = hz + k1 * (H - hz + 60), kind = hash(i * 7 + 3);
    if (kind < .55) continue; fillPts(ctx, rect(-900, y0, W + 1800, y1 - y0), kind < .8 ? '#D8F3E1' : '#FBDADF', false); }
  for (let i = -8; i <= 8; i++) inkLine(ctx, [[960 + i * 60, hz], [960 + i * 330, H + 60]], 2, rgba(INK.ink, .25), { taper: [0, 0], smooth: false });
  ctx.restore();
  // the altar: Merge pull request
  const ag = o.altar || 0;
  if (ag > 0) { ctx.save(); ctx.globalAlpha = .5 * ag; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * .16; ctx.moveTo(960, hz - 40); ctx.lineTo(960 + Math.cos(a - .04) * 1400, hz - 40 + Math.sin(a - .04) * 1400); ctx.lineTo(960 + Math.cos(a + .04) * 1400, hz - 40 + Math.sin(a + .04) * 1400); } ctx.fillStyle = INK.white; ctx.fill(); ctx.restore(); }
  if (o.altarBtn !== false) button(ctx, 1380, hz - 96, 360, 76, 'Merge pull request', { fill: INK.green, size: 28 });
  // marquee
  if (o.marquee !== false) {
    ink(ctx, rrect(360, 36, 1200, 150, 20), { fill: INK.ink, line: 6, boil: .8, smooth: false });
    for (let i = 0; i < 34; i++) { const on = (Math.floor(t * 8) + i) % 3 !== 0, px = 380 + i * 34.6; fillPts(ctx, ell(px, 52, 8, 8, 8), on ? INK.yellow : '#5A4A20'); fillPts(ctx, ell(px, 170, 8, 8, 8), on ? INK.yellow : '#5A4A20'); }
    txt(ctx, `${PR.title} #${PR.num}`, 960, 112, { font: 'ui', weight: 900, size: 44, color: INK.white, align: 'center' });
    if (o.n != null) txt(ctx, `Actionable comments posted: ${o.n}`, 960, 156, { font: 'ui', weight: 800, size: 26, color: INK.yellow, align: 'center' });
  }
}
// n comment-bunnies arranged on the stage floor in rows (formation). o: {rows, hopFn(i) -> height u, eyes, state(i)}
function bunnyRows(ctx, t, n, o = {}) {
  const hz = o.horizon ?? 660, rows = o.rows || Math.ceil(Math.sqrt(n / 2)), per = Math.ceil(n / rows);
  for (let r = 0; r < rows; r++) { const k = (r + 1) / (rows + .5), y = hz + Math.pow(k, 1.4) * (H - hz - 40), s = lerp(26, 70, k) * (o.scale || 1), span = lerp(700, 1700, k);
    for (let i = 0; i < per; i++) { const idx = r * per + i; if (idx >= n) break; const x = 960 + (per === 1 ? 0 : (i / (per - 1) - .5) * span) + (r % 2 ? s * .6 : 0);
      commentBunny(ctx, x, y, s, { hop: o.hopFn ? o.hopFn(idx) : 0, eyes: o.eyes || 'dot', state: o.state ? o.state(idx) : 'open', look: o.look ?? 0, sq: o.sqFn ? o.sqFn(idx) : 0 }); } }
}

// ---------- the developer, as a silhouette (3 a.m. only) ----------
function devShadow(ctx, x, y, s, o = {}) {
  const u = s / 10; ctx.save(); ctx.translate(x, y);
  const body = [[-5 * u, 0], [-4.6 * u, -6 * u], [-3 * u, -8.4 * u], [-2.4 * u, -12.6 * u], [0, -14.2 * u], [2.4 * u, -12.6 * u], [3 * u, -8.4 * u], [4.6 * u, -6 * u], [5 * u, 0]];
  ink(ctx, body, { fill: o.fill || '#0B0D1E', line: .4 * u, boil: .8 });
  const g = o.glare ?? 1; if (g) { ctx.globalAlpha = g; for (const sd of [-1, 1]) ink(ctx, ell(sd * 1.1 * u, -10.8 * u, .9 * u, .6 * u, 12), { fill: o.glareColor || INK.cyan, line: .2 * u, lineColor: INK.white, boil: .4 }); ctx.globalAlpha = 1; }
  ctx.restore();
}
