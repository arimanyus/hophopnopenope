// props.js: generic printed props and inserts, drawn in the current ctx transform, pure functions of their arguments.
// They print through ink(), so they follow look(): thin grey office line under look(0), boiling riso ink under look(1).
// Office/stage colour pairs are mixed with STYLE.k. The exact app UIs (Teams, Slack, Zoom, Outlook, PowerPoint,
// iPhone, the OS mouse pointer) live in apps.js.
//
//   uiBox(ctx, x, y, w, h, {r, shadow (px), shadowColor, fill, line, lineColor, boil, seed}) -> outline points
//   pill(ctx, x, y, s, {fill, color, size, font, weight, pad, line}) -> width        (y = vertical centre)
//   button(ctx, x, y, w, h, s, {fill, color, size, press 0..1, noShade})
//   avatar(ctx, x, y, r, kind = 'user', col)      kind 'user' (silhouette) | 'bot' | initials string ('DK')
//   toast(ctx, cx, cy, s, {title, text, icon: (ctx, cx, cy, size) => draws, badge, rot})   s = 1 is 1000 px wide
//   officeChair(ctx, x, y, s, {seat, back, rot})   (x, y) = floor under the seat centre; s = 1 fits a person of s 40
//   bubble(ctx, x, y, s, {size, fill, color, font, tail: 'down' | 'none'})   speech bubble, (x, y) = bottom centre
//   cutout(ctx, x, y, w, h, rot, t, drawFn(ctx), {seed, jit, paper, tape, xerox})   taped xerox scrap
//   terminal(ctx, x, y, w, h, t, {title, lines: [[text, color]], cps, t0, size, scrollFrom})
//   win95(ctx, x, y, w, h, {title, text: [lines], buttons: [labels], press: index, icon, iconColor})
//   stamp(ctx, s, x, y, size, age, {color, rot, stretch, life})   rubber stamp that slams in at age 0
//   thumbsUp(ctx, x, y, s, {rot})   ticker(ctx, y, t, items, {h, size, speed, bg, tag, label, color})
//   clockSecs(h, m, s) -> seconds since midnight

// ---------- UI primitives ----------
function uiBox(ctx, x, y, w, h, o = {}) {
  const r = o.r ?? 10, sh = o.shadow ?? 10;
  if (sh) fillPts(ctx, rrect(x + sh, y + sh, w, h, r), o.shadowColor || mix('#9C978C', INK.ink, STYLE.k), false);
  return ink(ctx, rrect(x, y, w, h, r), { fill: o.fill || INK.white, line: o.line ?? 4, lineColor: o.lineColor || INK.ink, boil: o.boil ?? .5, smooth: false, heavy: .3, seed: o.seed || 0 });
}
function pill(ctx, x, y, s, o = {}) {
  const size = o.size || 26, f = { font: o.font || 'ui', weight: o.weight || 700, size }, m = measure(ctx, s, f), pad = o.pad ?? size * .6, w = m.w + pad * 2, h = size * 1.55;
  ink(ctx, rrect(x, y - h / 2, w, h, h / 2), { fill: o.fill || INK.green, line: o.line ?? 3, boil: .4, smooth: false, heavy: .2 });
  txt(ctx, s, x + pad, y + size * .36, { ...f, color: o.color || INK.white });
  return w;
}
function button(ctx, x, y, w, h, s, o = {}) {
  const p = clamp(o.press || 0), dy = p * 6;
  fillPts(ctx, rrect(x + 6, y + 8, w, h, 10), mix('#9C978C', INK.ink, STYLE.k), false);
  ink(ctx, rrect(x + p * 5, y + dy, w, h, 10), { fill: o.fill || INK.green, shade: o.noShade ? null : { color: rgba(INK.ink, .22), spacing: 12, dir: [0, 1], from: 0, to: h * 1.4 }, line: 4, boil: .5, smooth: false, heavy: .3 });
  txt(ctx, s, x + p * 5 + w / 2, y + dy + h / 2 + (o.size || h * .36) * .36, { font: 'ui', weight: 800, size: o.size || h * .36, color: o.color || INK.white, align: 'center' });
}
function avatar(ctx, x, y, r, kind = 'user', col) {
  const bg = col || (kind === 'bot' ? INK.cyan : mix('#9AA8B8', INK.nightLt, STYLE.k)), fg = mix('#E8ECF0', INK.white, STYLE.k);
  ink(ctx, ell(x, y, r, r, 20), { fill: bg, line: Math.max(2.5, r * .1), boil: .4 });
  ctx.save(); clipPts(ctx, ell(x, y, r, r, 20));
  if (kind === 'user') { fillPts(ctx, ell(x, y - r * .2, r * .36, r * .36, 16), fg); fillPts(ctx, ell(x, y + r * .75, r * .7, r * .5, 18), fg); }
  else if (kind === 'bot') { fillPts(ctx, rrect(x - r * .55, y - r * .4, r * 1.1, r * .9, r * .2), INK.white, false); fillPts(ctx, rect(x - r * .45, y - r * .15, r * .9, r * .22), INK.night, false); }
  else txt(ctx, String(kind), x, y + r * .3, { font: 'ui', weight: 700, size: r * .8, color: fg, align: 'center' });
  ctx.restore();
}

// Generic notification card. s = 1 is 1000 px wide.
function toast(ctx, cx, cy, s = 1, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot ?? 0); ctx.scale(s, s);
  uiBox(ctx, -500, -150, 1000, 300, { r: 26, shadow: 18, fill: INK.white, line: 6 });
  if (o.icon) o.icon(ctx, -385, -35, 150); else ink(ctx, rrect(-460, -110, 150, 150, 30), { fill: INK.blue, line: 5, boil: .5, smooth: false });
  const title = o.title || 'New message', tw = measure(ctx, title, { font: 'ui', weight: 900, size: 70 }).w;
  txt(ctx, title, -280, -30, { font: 'ui', weight: 900, size: 70 * Math.min(1, 700 / tw), color: INK.ink });
  if (o.text) txt(ctx, o.text, -280, 60, { font: 'ui', weight: 600, size: 46, color: mix('#5A5666', INK.ink, STYLE.k) });
  if (o.badge !== false) { ink(ctx, ell(470, -140, 62, 62, 24), { fill: INK.red, line: 6, boil: .6 }); txt(ctx, String(o.badge || 1), 470, -118, { font: 'ui', weight: 900, size: 70, color: INK.white, align: 'center' }); }
  ctx.restore();
}
function officeChair(ctx, x, y, s = 1, o = {}) {
  const seat = o.seat || mix('#4E5560', INK.nightLt, STYLE.k), dark = mix('#33373E', INK.night, STYLE.k), metal = mix('#2E3036', INK.ink, STYLE.k);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  for (const a of [-1, -.35, .35, 1]) { inkLine(ctx, [[0, -60], [a * 150, -8]], 14, metal, { taper: [0, 0], smooth: false }); ink(ctx, ell(a * 150, -6, 16, 14, 12), { fill: metal, line: 4, boil: .5 }); }
  inkLine(ctx, [[0, -60], [0, -190]], 22, metal, { taper: [0, 0], smooth: false });
  ink(ctx, rrect(-200, -290, 400, 110, 40), { fill: seat, shade: { color: dark, spacing: 12, dir: [0, 1], from: -20, to: 60 }, line: 6, boil: .8, smooth: false });
  if (o.back !== false) ink(ctx, rrect(-190, -760, 380, 470, 70), { fill: seat, shade: { color: dark, spacing: 14, dir: [.6, .8], from: -80, to: 260 }, line: 6, boil: .8, smooth: false });
  ctx.restore();
}
// Speech bubble centred on x with its bottom edge at y; the tail hangs below.
function bubble(ctx, x, y, s, o = {}) {
  const size = o.size || 32, f = { font: o.font || 'ui', weight: 800, size }, m = measure(ctx, s, f), w = m.w + size * 1.2, h = size * 1.7, x0 = x - w / 2, y0 = y - h;
  const pts = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x + size * .5, y0 + h], [x, y0 + h + size * .6], [x - size * .1, y0 + h], [x0, y0 + h]];
  ink(ctx, o.tail === 'none' ? rect(x0, y0, w, h) : pts, { fill: o.fill || INK.white, line: Math.max(3, size * .1), boil: .6, smooth: false });
  txt(ctx, s, x, y0 + h * .68, { ...f, color: o.color || INK.ink, align: 'center' });
}
const clockSecs = (h, m, s = 0) => h * 3600 + m * 60 + s;

// ---------- printed inserts ----------
// Taped xerox cut-out: jittered edge on threes, tape strips, hard shadow; drawFn(ctx) draws content in local coords (0..w, 0..h).
function cutout(ctx, x, y, w, h, rot, t, drawFn, o = {}) {
  const k = Math.floor(t * 8) + (o.seed || 0), j = (i) => (hash(k * 3.1 + i) - .5) * (o.jit ?? 6);
  const edge = [[j(1), j(2)], [w * .5 + j(3), j(4)], [w + j(5), j(6)], [w + j(7), h * .5 + j(8)], [w + j(9), h + j(10)], [w * .5 + j(11), h + j(12)], [j(13), h + j(14)], [j(15), h * .5 + j(16)]];
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  fillPts(ctx, edge.map(([a, b]) => [a + 12, b + 14]), rgba(INK.ink, .9), false);
  fillPts(ctx, edge, o.paper || INK.white, false);
  ctx.save(); clipPts(ctx, edge, false); drawFn(ctx); if (o.xerox !== false) { ctx.globalAlpha = .12; dotsIn(ctx, [0, 0, w, h], { spacing: 16, color: INK.ink, k: (xx, yy) => .25 + .25 * noise2(xx * .01 + k, yy * .01) }); } ctx.restore();
  outline(ctx, edge, 3, INK.ink, { smooth: false, heavy: .2 });
  if (o.tape !== false) for (const [tx, ty, tr] of [[w * .12, -8, -.35], [w * .86, -6, .3]]) { ctx.save(); ctx.translate(tx, ty); ctx.rotate(tr); ctx.globalAlpha = .82; fillPts(ctx, rect(-50, -16, 100, 32), '#F4E7B0', false); ctx.restore(); }
  ctx.restore();
}
function terminal(ctx, x, y, w, h, t, o = {}) {
  uiBox(ctx, x, y, w, h, { fill: '#0F0E16', r: 12, shadow: 10 });
  fillPts(ctx, rrect(x + 3, y + 3, w - 6, 44, 10), '#262434', false);
  [INK.red, INK.yellow, INK.green].forEach((c, i) => fillPts(ctx, ell(x + 34 + i * 30, y + 25, 9, 9, 10), c));
  txt(ctx, o.title || 'Windows PowerShell', x + w / 2, y + 33, { font: 'ui', weight: 600, size: 22, color: '#A8A4B8', align: 'center' });
  const size = o.size || 30, lines = o.lines || [['PS C:\\> ', INK.white]];
  let budget = o.cps ? Math.max(0, (t - (o.t0 || 0)) * o.cps) : 1e9;
  ctx.save(); clipPts(ctx, rect(x + 6, y + 50, w - 12, h - 56), false);
  lines.slice(o.scrollFrom ?? 0).forEach(([s, c], i) => { if (budget <= 0) return; const shown = s.slice(0, Math.floor(budget)); budget -= s.length;
    txt(ctx, shown + (budget < 0 && Math.floor(t * 4) % 2 ? '\u2588' : ''), x + 26, y + 90 + i * size * 1.35, { font: 'mono', weight: 700, size, color: c || '#E8E6F0' }); });
  ctx.restore();
}
function win95(ctx, x, y, w, h, o = {}) {
  fillPts(ctx, rect(x + 10, y + 12, w, h), INK.ink, false);
  fillPts(ctx, rect(x, y, w, h), '#C0C0C0', false); inkLine(ctx, [[x, y + h], [x, y], [x + w, y]], 4, '#FFFFFF', { taper: [0, 0], smooth: false }); inkLine(ctx, [[x + w, y], [x + w, y + h], [x, y + h]], 4, '#404040', { taper: [0, 0], smooth: false });
  fillPts(ctx, rect(x + 6, y + 6, w - 12, 46), '#000080', false); txt(ctx, o.title || 'Error', x + 20, y + 40, { font: 'ui', weight: 800, size: 26, color: INK.white });
  fillPts(ctx, rect(x + w - 46, y + 12, 34, 32), '#C0C0C0', false); txt(ctx, '\u00D7', x + w - 29, y + 38, { font: 'ui', weight: 900, size: 30, color: INK.ink, align: 'center' });
  ink(ctx, ell(x + 64, y + 118, 30, 30, 20), { fill: o.iconColor || INK.red, line: 3, boil: .3 }); txt(ctx, o.icon || '\u00D7', x + 64, y + 130, { font: 'ui', weight: 900, size: 38, color: INK.white, align: 'center' });
  (o.text || ['This meeting could have been an email.']).forEach((l, i) => txt(ctx, l, x + 120, y + 112 + i * 38, { font: 'ui', weight: 600, size: 28, color: INK.ink }));
  (o.buttons || ['OK', 'Cancel']).forEach((b, i, a) => { const bw = 200, bx = x + w / 2 - (a.length * (bw + 20) - 20) / 2 + i * (bw + 20), by = y + h - 76, p = o.press === i;
    fillPts(ctx, rect(bx, by, bw, 52), '#C0C0C0', false); inkLine(ctx, [[bx, by + 52], [bx, by], [bx + bw, by]], 3, p ? '#404040' : '#FFFFFF', { taper: [0, 0], smooth: false }); inkLine(ctx, [[bx + bw, by], [bx + bw, by + 52], [bx, by + 52]], 3, p ? '#FFFFFF' : '#404040', { taper: [0, 0], smooth: false });
    txt(ctx, b, bx + bw / 2 + (p ? 2 : 0), by + 35 + (p ? 2 : 0), { font: 'ui', weight: 700, size: 24, color: INK.ink, align: 'center' }); });
}
// Rubber stamp (SENT, NOTED, APPROVED, DECLINED). Pops in at age 0 with a slam.
function stamp(ctx, s, x, y, size, age, o = {}) {
  if (age < 0 || (o.life && age > o.life)) return;
  const k = age < .08 ? lerp(1.8, 1, easeIn(age / .08)) : 1 + .04 * Math.exp(-(age - .08) * 20) * Math.sin((age - .08) * 60);
  const col = o.color || INK.red, f = { font: 'display', weight: 900, stretch: o.stretch ?? 0, size: size * k }, m = measure(ctx, s, f);
  // drawn on its own layer so the worn-ink specks knock holes in the ink only, never paint the background
  const c = layer(45); c.setTransform(ctx.getTransform()); c.translate(x, y); c.rotate(o.rot ?? -.12);
  const bw = m.w + size * .5, bh = size * 1.05 * k;
  c.lineWidth = size * .09; c.strokeStyle = col; c.strokeRect(-bw / 2, -bh / 2, bw, bh);
  txt(c, s, 0, size * .36 * k, { ...f, color: col, align: 'center' });
  c.globalCompositeOperation = 'destination-out'; dotsIn(c, [-bw / 2 - size * .1, -bh / 2 - size * .1, bw / 2 + size * .1, bh / 2 + size * .1], { spacing: size * .14, color: '#000', k: (a, b) => clamp(.1 + noise2(a * .03 + 7, b * .03) * .45) });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = age < .08 ? clamp(age / .04 + .5) : 1; ctx.drawImage(c.canvas, 0, 0); ctx.restore();
}
function thumbsUp(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const u = s / 10, hand = [[-3.5 * u, -1 * u], [-1 * u, -1.5 * u], [0, -5.5 * u], [.8 * u, -8 * u], [2.4 * u, -7.4 * u], [2.2 * u, -3 * u], [4.8 * u, -3 * u], [5.2 * u, -1.6 * u], [4.6 * u, 4.2 * u], [-3.5 * u, 4.2 * u]];
  ink(ctx, hand, { fill: INK.yellow, shade: { color: INK.orange, spacing: Math.max(9, u), dir: [.5, .85], from: -3 * u, to: 5 * u }, line: Math.max(4, .45 * u), boil: .8, smooth: false });
  ink(ctx, rrect(-6 * u, -1.8 * u, 2.8 * u, 6.8 * u, .8 * u), { fill: INK.blue, line: Math.max(4, .45 * u), boil: .6, smooth: false });
  for (let i = 0; i < 3; i++) inkLine(ctx, [[1.6 * u, (-.8 + i * 1.6) * u], [4.8 * u, (-.8 + i * 1.6) * u]], Math.max(2.5, .3 * u), INK.ink, { taper: [.1, .3] });
  ctx.restore();
}
function ticker(ctx, y, t, items, o = {}) {
  const h = o.h || 72, size = o.size || 34, speed = o.speed || 400;
  fillPts(ctx, rect(0, y, W, h), o.bg || INK.ink, false);
  fillPts(ctx, rect(0, y, 220, h), o.tag || INK.red, false); txt(ctx, o.label || 'LIVE', 110, y + h * .66, { font: 'display', weight: 900, size: size * .95, color: INK.white, align: 'center' });
  const str = items.join('   \u25B2   ') + '   \u25B2   ', f = { font: 'ui', weight: 800, size }, sw = measure(ctx, str, f).w;
  ctx.save(); clipPts(ctx, rect(220, y, W - 220, h), false);
  let x0 = 220 - mod(t * speed, sw); while (x0 < W) { txt(ctx, str, x0, y + h * .66, { ...f, color: o.color || INK.yellow }); x0 += sw; }
  ctx.restore();
}
