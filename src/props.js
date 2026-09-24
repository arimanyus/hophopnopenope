// props.js: shared characters and printed inserts. All drawn in the current ctx transform, pure functions of t.
// UI is crisp (boil .5) and on ones; creatures boil on twos.

// ---------- UI primitives ----------
// uiBox: a printed card. shadow = hard offset ink block (px), r = corner radius.
function uiBox(ctx, x, y, w, h, o = {}) {
  const r = o.r ?? 10, sh = o.shadow ?? 10;
  if (sh) fillPts(ctx, rrect(x + sh, y + sh, w, h, r), o.shadowColor || INK.ink, false);
  return ink(ctx, rrect(x, y, w, h, r), { fill: o.fill || INK.white, line: o.line ?? 4, lineColor: o.lineColor || INK.ink, boil: o.boil ?? .5, smooth: false, heavy: .3, seed: o.seed || 0 });
}
// pill label, returns its width. o: {fill, color, size, font, weight, pad, line}
function pill(ctx, x, y, s, o = {}) {
  const size = o.size || 26, f = { font: o.font || 'ui', weight: o.weight || 700, size }, m = measure(ctx, s, f), pad = o.pad ?? size * .6, w = m.w + pad * 2, h = size * 1.55;
  ink(ctx, rrect(x, y - h / 2, w, h, h / 2), { fill: o.fill || INK.green, line: o.line ?? 3, boil: .4, smooth: false, heavy: .2 });
  txt(ctx, s, x + pad, y + size * .36, { ...f, color: o.color || INK.white });
  return w;
}
function button(ctx, x, y, w, h, s, o = {}) {
  const p = clamp(o.press || 0), dy = p * 6;
  fillPts(ctx, rrect(x + 6, y + 8, w, h, 10), INK.ink, false);
  ink(ctx, rrect(x + p * 5, y + dy, w, h, 10), { fill: o.fill || INK.green, shade: o.noShade ? null : { color: rgba(INK.ink, .22), spacing: 12, dir: [0, 1], from: 0, to: h * 1.4 }, line: 4, boil: .5, smooth: false, heavy: .3 });
  txt(ctx, s, x + p * 5 + w / 2, y + dy + h / 2 + (o.size || h * .36) * .36, { font: 'ui', weight: 800, size: o.size || h * .36, color: o.color || INK.white, align: 'center' });
}
// tiny avatar disc: kind 'rabbit' | 'you' | 'bot' | 'user'
function avatar(ctx, x, y, r, kind = 'rabbit', col) {
  ink(ctx, ell(x, y, r, r, 20), { fill: col || (kind === 'rabbit' ? INK.orange : kind === 'you' ? INK.pink : kind === 'bot' ? INK.cyan : INK.nightLt), line: Math.max(2.5, r * .1), boil: .4 });
  ctx.save(); clipPts(ctx, ell(x, y, r, r, 20));
  if (kind === 'rabbit') { for (const s of [-1, 1]) fillPts(ctx, ell(x + s * r * .32, y - r * .55, r * .16, r * .5, 12, s * .2), INK.fur); fillPts(ctx, ell(x, y + r * .25, r * .5, r * .45, 14), INK.fur); fillPts(ctx, ell(x - r * .18, y + r * .15, r * .07, r * .09, 8), INK.ink); fillPts(ctx, ell(x + r * .18, y + r * .15, r * .07, r * .09, 8), INK.ink); }
  else if (kind === 'you') cursorShape(ctx, x - r * .25, y - r * .5, r * .9, INK.ink, INK.white);
  else if (kind === 'bot') { fillPts(ctx, rrect(x - r * .55, y - r * .4, r * 1.1, r * .9, r * .2), INK.white, false); fillPts(ctx, rect(x - r * .45, y - r * .15, r * .9, r * .22), INK.night, false); }
  ctx.restore();
}

// Review-request notification toast (frame 0's ping and the outro's button use the same one, so the video loops).
// toast(ctx, cx, cy, s, {title, num, add, del, badge, rot}) - s = 1 is 1000 px wide.
function toast(ctx, cx, cy, s = 1, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot ?? -.07); ctx.scale(s, s);
  uiBox(ctx, -500, -150, 1000, 300, { r: 26, shadow: 18, fill: INK.white, line: 6 });
  ink(ctx, rrect(-460, -110, 150, 150, 30), { fill: INK.orange, line: 5, boil: .5, smooth: false });
  avatar(ctx, -385, -35, 58, 'rabbit', INK.orange);
  txt(ctx, '\uD83D\uDD14 Review requested', -280, -62, { font: 'ui', weight: 700, size: 38, color: '#6E6A78' });
  txt(ctx, `${o.title || PR.title} #${o.num || PR.num}`, -280, 12, { font: 'ui', weight: 900, size: 70, color: INK.ink });
  txt(ctx, `+${o.add || PR.add}`, -280, 100, { font: 'mono', weight: 800, size: 58, color: INK.green });
  const aw = measure(ctx, `+${o.add || PR.add}`, { font: 'mono', weight: 800, size: 58 }).w;
  txt(ctx, `\u2212${o.del || PR.del}`, -280 + aw + 34, 100, { font: 'mono', weight: 800, size: 58, color: INK.red });
  if (o.badge !== false) { ink(ctx, ell(470, -140, 62, 62, 24), { fill: INK.red, line: 6, boil: .6 }); txt(ctx, String(o.badge || 1), 470, -118, { font: 'ui', weight: 900, size: 70, color: INK.white, align: 'center' }); }
  ctx.restore();
}
// The rabbit's office chair (front view). (x, y) = floor point under the seat centre; s = 1 fits a rabbit of s 40.
function officeChair(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  for (const a of [-1, -.35, .35, 1]) { inkLine(ctx, [[0, -60], [a * 150, -8]], 14, INK.ink, { taper: [0, 0], smooth: false }); ink(ctx, ell(a * 150, -6, 16, 14, 12), { fill: '#2A2638', line: 4, boil: .5 }); }
  inkLine(ctx, [[0, -60], [0, -190]], 22, '#2A2638', { taper: [0, 0], smooth: false });
  ink(ctx, rrect(-200, -290, 400, 110, 40), { fill: o.seat || INK.nightLt, shade: { color: INK.night, spacing: 12, dir: [0, 1], from: -20, to: 60 }, line: 6, boil: .8, smooth: false });
  if (o.back !== false) ink(ctx, rrect(-190, -760, 380, 470, 70), { fill: o.seat || INK.nightLt, shade: { color: INK.night, spacing: 14, dir: [.6, .8], from: -80, to: 260 }, line: 6, boil: .8, smooth: false });
  ctx.restore();
}

// ---------- the counter: CodeRabbit's real review header ----------
function countHeader(ctx, x, y, n, o = {}) {
  const size = o.size || 44;
  txt(ctx, 'Actionable comments posted: ', x, y, { font: 'ui', weight: 800, size, color: o.color || INK.ink });
  const w = measure(ctx, 'Actionable comments posted: ', { font: 'ui', weight: 800, size }).w;
  txt(ctx, String(n), x + w, y, { font: 'ui', weight: 900, size: size * (o.numScale || 1.25), color: o.numColor || INK.orange, stroke: o.stroke ? { w: size * .12, color: INK.ink } : null });
}

// ---------- PR page ----------
// Diff line data: [kind, text] with kind '+', '-', ' ' (context) or '@' (hunk header).
const PR = { title: 'Small fix', num: 4812, add: '14,203', del: '12', branch: 'fix/small-fix', author: 'you' };
function prHeader(ctx, x, y, w, o = {}) {
  const size = o.size || 54;
  txt(ctx, o.title ?? PR.title, x, y + size, { font: 'ui', weight: 800, size, color: INK.ink });
  const tw = measure(ctx, o.title ?? PR.title, { font: 'ui', weight: 800, size }).w;
  txt(ctx, ' #' + (o.num ?? PR.num), x + tw, y + size, { font: 'ui', weight: 500, size, color: '#6E6A78' });
  const py = y + size * 1.75, st = o.state || 'open';
  let px = x + pill(ctx, x, py, st === 'merged' ? 'Merged' : st === 'closed' ? 'Closed' : 'Open', { fill: st === 'merged' ? INK.purple : st === 'closed' ? INK.red : INK.green, size: size * .42 }) + 16;
  txt(ctx, `${o.author || PR.author} wants to merge into main from ${PR.branch}`, px, py + size * .15, { font: 'ui', weight: 500, size: size * .38, color: '#4A4658' });
  if (o.stats !== false) { const sy = py; txt(ctx, `+${o.add ?? PR.add}`, x + w - 330, sy + size * .15, { font: 'mono', weight: 800, size: size * .5, color: INK.green, align: 'right' }); txt(ctx, `\u2212${o.del ?? PR.del}`, x + w - 190, sy + size * .15, { font: 'mono', weight: 800, size: size * .5, color: INK.red, align: 'right' });
    for (let i = 0; i < 5; i++) fillPts(ctx, rect(x + w - 170 + i * 30, sy - 12, 24, 24), i < 5 ? INK.green : INK.red, false); }
  return y + size * 2.5;
}
function prTabs(ctx, x, y, w, o = {}) {
  const tabs = o.tabs || [['Conversation', o.conv ?? 3], ['Commits', 212], ['Checks', 14], ['Files changed', 347]], size = o.size || 28;
  let tx = x; tabs.forEach(([name, n], i) => { const on = i === (o.active ?? 3);
    txt(ctx, name, tx, y + size, { font: 'ui', weight: on ? 800 : 600, size, color: on ? INK.ink : '#5A5666' });
    const nw = measure(ctx, name, { font: 'ui', weight: on ? 800 : 600, size }).w;
    const bw = pill(ctx, tx + nw + 10, y + size * .64, String(n), { fill: '#E4DED0', color: INK.ink, size: size * .72, line: 0 });
    if (on) fillPts(ctx, rect(tx - 8, y + size * 1.75, nw + bw + 26, 6), INK.orange, false);
    tx += nw + bw + 48; });
  inkLine(ctx, [[x - 20, y + size * 2], [x + w + 20, y + size * 2]], 3, INK.ink, { taper: [0, 0], smooth: false });
  return y + size * 2.6;
}
// diff(ctx, x, y, w, lines, {lineH, start (first line number), hl: {lineIndex: color}, size})
function diff(ctx, x, y, w, lines, o = {}) {
  const lh = o.lineH || 44, size = o.size || lh * .52, n0 = o.start || 1;
  lines.forEach(([k, s], i) => {
    const yy = y + i * lh, bg = o.hl && o.hl[i] ? o.hl[i] : k === '+' ? '#D8F3E1' : k === '-' ? '#FBDADF' : k === '@' ? '#E7E2F7' : null;
    if (bg) fillPts(ctx, rect(x, yy, w, lh), bg, false);
    txt(ctx, k === '@' ? '' : String(n0 + i), x + 90, yy + lh * .68, { font: 'mono', weight: 500, size: size * .8, color: '#8A8496', align: 'right' });
    txt(ctx, k === '@' ? s : (k === ' ' ? ' ' : k) + ' ' + s, x + 116, yy + lh * .68, { font: 'mono', weight: k === '@' ? 500 : 600, size, color: k === '+' ? '#0E6B3A' : k === '-' ? '#9C0F24' : k === '@' ? '#5B3FA8' : INK.ink });
  });
  return y + lines.length * lh;
}
// A believable, mostly-generated diff for backgrounds. seed picks variations.
function fakeDiff(n, seed = 1, kind = '+') {
  const bits = ['const result = await fix(input);', 'if (x !== undefined && x !== null) {', 'return a ? b ? c : d : e;', 'console.log("here");', '// TODO: remove before merge',
    'export function fix(data) {', 'const user = users.find(u => u.id === id);', 'items.map(i => i.value).filter(Boolean);', '});', 'await sleep(1000); // fixes race',
    'let tmp2 = structuredClone(tmp);', 'try { return JSON.parse(s) } catch {}', 'if (!user) return user.name;', 'const retries = 99;', '// generated by agent', '}'];
  const out = []; for (let i = 0; i < n; i++) { const r = hash(seed * 17 + i * 3.7), ind = '  '.repeat(Math.floor(hash(seed + i) * 3)); out.push([r < .08 ? '@' : kind, r < .08 ? `@@ -${120 + i * 7},6 +${130 + i * 9},40 @@` : ind + bits[Math.floor(hash(seed * 3 + i) * bits.length)]]); } return out;
}
// Full PR window. o: {x, y, w, h, scroll (px), header, tabs, lines, start, hl, comments: [{at: line index, ...commentCard opts}], mergeState, merge (press 0..1)}
function prPage(ctx, t, o = {}) {
  const x = o.x ?? 120, y = o.y ?? 80, w = o.w ?? 1680, h = o.h ?? 920;
  uiBox(ctx, x, y, w, h, { r: 14, shadow: o.shadow ?? 14, fill: o.fill || INK.white });
  ctx.save(); clipPts(ctx, rrect(x + 3, y + 3, w - 6, h - 6, 12), false);
  let yy = y + 30 - (o.scroll || 0);
  if (o.header !== false) yy = prHeader(ctx, x + 50, yy, w - 100, o.header || {});
  if (o.tabs !== false) yy = prTabs(ctx, x + 50, yy, w - 100, o.tabs || {});
  if (o.before) yy = o.before(ctx, x + 50, yy, w - 100) ?? yy;
  const lines = o.lines || fakeDiff(40, o.seed || 3), lh = o.lineH || 46;
  fillPts(ctx, rect(x + 40, yy, w - 80, 52), '#EFEAE0', false); txt(ctx, o.file || 'src/fix.ts', x + 64, yy + 35, { font: 'mono', weight: 700, size: 26, color: INK.ink });
  yy += 60;
  const cm = (o.comments || []).slice().sort((a, b) => a.at - b.at); let ci = 0, li = 0;
  while (li < lines.length && yy < y + h + 200) {
    const chunk = []; while (li < lines.length && !(ci < cm.length && cm[ci].at === li)) chunk.push(lines[li++]);
    yy = diff(ctx, x + 40, yy, w - 80, chunk, { lineH: lh, start: (o.start || 1) + li - chunk.length, hl: o.hl });
    if (ci < cm.length && cm[ci].at === li) { const c = cm[ci++]; yy = commentCard(ctx, x + 150, yy + 14, w - 260, t, c) + 14; }
  }
  if (o.after) o.after(ctx, x + 50, yy, w - 100);
  ctx.restore();
  return { x, y, w, h, bottom: yy };
}
// Review comment card. o: {author, kind ('rabbit'|'you'|'bot'), time, chip ('critical'|'issue'|'nit'), body: [lines], state: 'open'|'resolved'|'outdated', size}
function commentCard(ctx, x, y, w, t, o = {}) {
  const size = o.size || 30, body = o.body || ['Consider handling the null case here.'], st = o.state || 'open';
  if (st === 'resolved') { uiBox(ctx, x, y, w, size * 1.9, { fill: '#E9E4DA', shadow: 6, r: 8 }); txt(ctx, '\u2713 Resolved \u00B7 ' + (o.author || 'coderabbitai') + (o.by ? ' \u00B7 by ' + o.by : ''), x + 24, y + size * 1.22, { font: 'ui', weight: 700, size: size * .9, color: '#6E6A78' }); return y + size * 1.9; }
  const h = size * (2.9 + body.length * 1.35 + (o.buttons === false ? 0 : 1.8));
  uiBox(ctx, x, y, w, h, { fill: st === 'outdated' ? '#ECE8DF' : INK.white, shadow: 8, r: 10 });
  avatar(ctx, x + 44, y + 44, 26, o.kind || 'rabbit');
  txt(ctx, o.author || 'coderabbitai', x + 84, y + 54, { font: 'ui', weight: 800, size, color: INK.ink });
  const aw = measure(ctx, o.author || 'coderabbitai', { font: 'ui', weight: 800, size }).w;
  txt(ctx, o.time || 'just now', x + 96 + aw, y + 54, { font: 'ui', weight: 500, size: size * .8, color: '#77738A' });
  if (st === 'outdated') pill(ctx, x + w - 170, y + 44, 'Outdated', { fill: '#D8D2C4', color: '#5A5666', size: size * .7, line: 2 });
  let yy = y + 60 + size * .6;
  if (o.chip) { const c = { critical: ['\u26A0 Potential issue', INK.red], issue: ['\u26A0 Potential issue', INK.orange], nit: ['\uD83E\uDDF9 Nitpick', '#8A8496'] }[o.chip]; pill(ctx, x + 84, yy + 10, c[0], { fill: c[1], size: size * .72 }); if (o.chip === 'critical') pill(ctx, x + 84 + measure(ctx, c[0], { font: 'ui', weight: 700, size: size * .72 }).w + size * 1.3, yy + 10, '\uD83D\uDD34 Critical', { fill: INK.redDk, size: size * .72 }); yy += size * 1.3; }
  body.forEach((line, i) => { txt(ctx, line, x + 84, yy + size * (1 + i * 1.35), { font: o.mono ? 'mono' : 'ui', weight: o.bold ? 800 : 600, size, color: st === 'outdated' ? '#8A8496' : INK.ink }); });
  yy += size * (.6 + body.length * 1.35);
  if (o.buttons !== false) { const bp = o.press || 0; ink(ctx, rrect(x + 84 + bp * 3, yy + 6 + bp * 3, size * 9.5, size * 1.4, 8), { fill: bp > .5 ? INK.pinkLt : '#EFEAE0', line: 3, smooth: false, boil: .4 }); txt(ctx, 'Resolve conversation', x + 84 + size * 4.75 + bp * 3, yy + 6 + size * .98 + bp * 3, { font: 'ui', weight: 700, size: size * .78, color: INK.ink, align: 'center' }); }
  return y + h;
}

// ---------- creatures ----------
// Comment-bunny: a speech bubble with rabbit ears. o: {hop (u), sq, eyes 'dot'|'happy'|'sad'|'x'|'wide', look, rot, state 'open'|'resolved'|'outdated', chip, col}
function commentBunny(ctx, x, y, s, o = {}) {
  const st = o.state || 'open', sq = o.sq || 0, u = s / 10;
  ctx.save(); ctx.translate(x, y - (o.hop || 0) * u); ctx.rotate(o.rot || 0); ctx.scale(1 + sq * .25, 1 - sq * .25);
  const grey = st !== 'open', fill = o.col || (grey ? '#DCD6CA' : INK.white), line = grey ? '#6E6A78' : INK.ink;
  if (st === 'resolved') { ink(ctx, rrect(-6.5 * u, -2.2 * u, 13 * u, 2.2 * u, u), { fill: '#DCD6CA', line: .35 * u, lineColor: line, boil: .5, smooth: false }); txt(ctx, '\u2713 resolved', 0, -.75 * u, { font: 'ui', weight: 800, size: 1.3 * u, color: '#6E6A78', align: 'center' }); ctx.restore(); return; }
  const earA = o.ears ?? 0;
  for (const side of [-1, 1]) { const e = tube([[side * 2.2 * u, -7.2 * u], [side * (2.4 + earA) * u, -10.5 * u], [side * (2.2 + earA * 1.8) * u, -13 * u]], k => (1.9 - k * .6) * u * Math.sin(Math.PI * (.2 + .8 * k)) + .3 * u, 8);
    ink(ctx, e, { fill, line: .38 * u, lineColor: line, boil: .6 * u / 4 }); if (!grey) fillPts(ctx, tube([[side * 2.2 * u, -8 * u], [side * (2.4 + earA) * u, -10.5 * u], [side * (2.2 + earA * 1.8) * u, -12.2 * u]], k => (.9 - k * .3) * u * Math.sin(Math.PI * (.2 + .8 * k)) + .1 * u, 6), INK.earIn); }
  // rounded speech bubble with the tail at the lower left
  const body = rrect(-6.2 * u, -7.6 * u, 12.4 * u, 6.2 * u, 2.2 * u), tailAt = body.findIndex(([px, py]) => py > -1.5 * u && px < 0);
  body.splice(Math.max(0, tailAt), 0, [-1.4 * u, -1.4 * u], [-3.8 * u, .9 * u], [-3.2 * u, -1.4 * u]);
  ink(ctx, body, { fill, shade: grey ? null : { color: rgba(INK.pink, .35), spacing: Math.max(8, u * 1.1), dir: [.4, .9], from: -2 * u, to: 5 * u, max: .7 }, line: .42 * u, lineColor: line, boil: .8 * u / 4, smooth: false });
  const ey = -4.8 * u, lx = (o.look || 0) * .5 * u, E = o.eyes || 'dot';
  for (const side of [-1, 1]) { const ex = side * 1.9 * u + lx;
    if (E === 'happy') inkLine(ctx, [[ex - .7 * u, ey + .2 * u], [ex, ey - .5 * u], [ex + .7 * u, ey + .2 * u]], .35 * u, line, { taper: [.2, .2] });
    else if (E === 'x') { inkLine(ctx, [[ex - .5 * u, ey - .5 * u], [ex + .5 * u, ey + .5 * u]], .3 * u, line); inkLine(ctx, [[ex + .5 * u, ey - .5 * u], [ex - .5 * u, ey + .5 * u]], .3 * u, line); }
    else { const r = E === 'wide' ? .75 : E === 'sad' ? .45 : .55; fillPts(ctx, ell(ex, ey, r * u, r * 1.25 * u, 12), line); fillPts(ctx, ell(ex - .18 * u, ey - .3 * u, .2 * u, .2 * u, 8), INK.white);
      if (E === 'sad') inkLine(ctx, [[ex - side * .8 * u, ey - 1.3 * u], [ex + side * .5 * u, ey - 1.0 * u]], .3 * u, line, { taper: [.2, .2] }); } }
  if (o.chip) fillPts(ctx, rrect(-4.5 * u, -3.3 * u, 9 * u, 1.1 * u, .5 * u), o.chip === 'critical' ? INK.red : o.chip === 'nit' ? '#B8B2C4' : INK.orange, false);
  else for (let i = 0; i < 2; i++) inkLine(ctx, [[-4.2 * u, (-3.1 + i * .9) * u], [(i ? 1.5 : 4) * u, (-3.1 + i * .9) * u]], .35 * u, grey ? '#9A94A6' : '#8A8496', { taper: [0, 0], smooth: false });
  if (st === 'outdated') pill(ctx, -4 * u, -8.9 * u, 'Outdated', { fill: '#CFC8BA', color: '#5A5666', size: 1.3 * u, line: 1.5 });
  ctx.restore();
}

// The developer: a big arrow cursor with a name tag. o: {label, click 0..1, crown, rot, color, shades, tremble}
function cursorShape(ctx, x, y, s, fillC = INK.ink, rim = INK.white) {
  const p = [[0, 0], [0, 17], [4.3, 13], [7.3, 19.6], [10.2, 18.3], [7.3, 12], [12.7, 12]].map(([a, b]) => [x + a * s / 20, y + b * s / 20]);
  ctx.save(); ctx.lineJoin = 'round'; ctx.beginPath(); tracePath(ctx, p, true, false); ctx.lineWidth = s * .09; ctx.strokeStyle = rim; ctx.stroke(); ctx.fillStyle = fillC; ctx.fill(); ctx.restore(); return p;
}
function cursor(ctx, x, y, s, o = {}) {
  const k = clamp(o.click || 0), sq = 1 - k * .18, tr = o.tremble ? shake(BOIL_T * 3, o.tremble) : [0, 0];
  ctx.save(); ctx.translate(x + tr[0], y + tr[1]); ctx.rotate(o.rot || 0); ctx.scale(sq, sq);
  if (k > 0) { ctx.save(); ctx.globalAlpha = 1 - k; outline(ctx, ell(0, 0, 20 + k * s * .9, 20 + k * s * .9, 24), 6 * (1 - k) + 1, o.color || INK.pink); ctx.restore(); }
  fillPts(ctx, cursorShape(ctx, 7, 9, s, INK.ink, INK.ink).map(p => p), INK.ink, false);
  const P = cursorShape(ctx, 0, 0, s, o.fill || INK.ink, INK.white);
  outline(ctx, P, Math.max(3, s * .035), INK.ink, { smooth: false, heavy: .2 });
  if (o.label !== false) { const L = o.label || 'you', size = Math.max(22, s * .2), m = measure(ctx, L, { font: 'ui', weight: 800, size });
    ink(ctx, rrect(s * .52, s * .82, m.w + size * 1.1, size * 1.6, size * .35), { fill: o.color || INK.pink, line: 3, boil: .4, smooth: false });
    txt(ctx, L, s * .52 + size * .55, s * .82 + size * 1.13, { font: 'ui', weight: 800, size, color: INK.white }); }
  if (o.crown) { const c = [[-.1, -.02], [.05, -.34], [.2, -.12], [.33, -.4], [.46, -.12], [.6, -.34], [.72, -.02]].map(([a, b]) => [a * s * .6 - s * .08, b * s * .6 - s * .02]);
    ink(ctx, c, { fill: INK.yellow, shade: { color: INK.orange, spacing: 9, dir: [0, 1] }, line: 4, smooth: false, boil: .6 }); }
  if (o.shades) { fillPts(ctx, rrect(-s * .05, s * .18, s * .5, s * .12, 4), INK.ink, false); }
  if (o.sweat) ink(ctx, [[s * .55, -s * .2], [s * .66, 0], [s * .55, s * .08], [s * .44, 0]], { fill: INK.cyan, line: 3, boil: .5 });
  ctx.restore();
}
// Agent bot: rounded head, cyan visor, ✨ antenna. o: {say, clap 0..1, bob, visor color}
function agentBot(ctx, x, y, s, o = {}) {
  const u = s / 10, bob = o.bob || 0;
  ctx.save(); ctx.translate(x, y - bob * u);
  ink(ctx, rrect(-4 * u, -1.5 * u, 8 * u, 5.5 * u, 1.6 * u), { fill: o.body || INK.paperDk, line: .4 * u, boil: .5, smooth: false });
  ink(ctx, rrect(-4.6 * u, -9 * u, 9.2 * u, 7.4 * u, 2.4 * u), { fill: INK.white, shade: { color: rgba(INK.blue, .35), spacing: Math.max(8, u), dir: [.5, .8], from: -u, to: 5 * u }, line: .45 * u, boil: .5, smooth: false });
  fillPts(ctx, rrect(-3.6 * u, -6.9 * u, 7.2 * u, 2.4 * u, 1.2 * u), o.visor || INK.night, false);
  for (const s2 of [-1, 1]) fillPts(ctx, ell(s2 * 1.5 * u, -5.7 * u, .5 * u, .5 * u, 10), INK.cyan);
  inkLine(ctx, [[0, -9 * u], [0, -10.8 * u]], .35 * u, INK.ink, { taper: [0, 0] });
  ink(ctx, star(0, -11.4 * u, 1.1 * u, .35, 4, BOIL_T * 3), { fill: INK.yellow, line: .25 * u, boil: 0, smooth: false });
  const c = clamp(o.clap || 0); for (const s2 of [-1, 1]) fillPts(ctx, ell(s2 * lerp(3.4, .7, c) * u, lerp(1, -.3, c) * u, 1.1 * u, 1.1 * u, 10), INK.white);
  for (const s2 of [-1, 1]) outline(ctx, ell(s2 * lerp(3.4, .7, c) * u, lerp(1, -.3, c) * u, 1.1 * u, 1.1 * u, 10), .3 * u);
  ctx.restore();
  if (o.say) bubble(ctx, x + (o.sayDx ?? 0), y - 12.5 * u - bob * u, o.say, { size: o.saySize || Math.max(24, u * 2.2), tail: 'down' });
}
// speech bubble centred at (x, y-bottom). o: {size, fill, color, tail 'down'|'left'|'none', w}
function bubble(ctx, x, y, s, o = {}) {
  const size = o.size || 32, f = { font: o.font || 'ui', weight: 800, size }, m = measure(ctx, s, f), w = m.w + size * 1.2, h = size * 1.7, x0 = x - w / 2, y0 = y - h;
  const pts = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x + size * .5, y0 + h], [x, y0 + h + size * .6], [x - size * .1, y0 + h], [x0, y0 + h]];
  ink(ctx, o.tail === 'none' ? rect(x0, y0, w, h) : pts, { fill: o.fill || INK.white, line: Math.max(3, size * .1), boil: .6, smooth: false });
  txt(ctx, s, x, y0 + h * .68, { ...f, color: o.color || INK.ink, align: 'center' });
}

// ---------- the pocket watch ----------
// pocketWatch(ctx, x, y, r, {time: 'h:m:s' seconds since midnight or {h, m, s}, left (s to deploy), total, open 0..1, crack 0..1, label})
function pocketWatch(ctx, x, y, r, o = {}) {
  const open = o.open ?? 1, secs = o.secs ?? (16 * 3600 + 58 * 60 + 30);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  // chain + crown
  inkLine(ctx, [[0, -r * 1.12], [r * .05, -r * 1.5], [r * .3, -r * 2.2], [r * .1, -r * 3.2]], r * .045, '#B8862B', { taper: [0, 0] });
  ink(ctx, rrect(-r * .14, -r * 1.22, r * .28, r * .2, r * .05), { fill: '#E8B23A', line: r * .03, boil: .5, smooth: false });
  ink(ctx, ell(0, -r * 1.02, r * .16, r * .12, 14), { fill: '#E8B23A', line: r * .03, boil: .5 });
  // case
  ink(ctx, ell(0, 0, r * 1.06, r * 1.06, 40), { fill: '#E8B23A', shade: { color: '#A8741C', spacing: Math.max(10, r * .05), dir: [.55, .83], from: -r * .2, to: r }, line: r * .04, boil: .6 });
  ink(ctx, ell(0, 0, r * .92, r * .92, 40), { fill: INK.white, line: r * .025, boil: .4 });
  // countdown arc (seconds left of total), red
  const left = o.left ?? 90, total = o.total ?? 90;
  if (left > 0 && total) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * .86, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(left / total), false); ctx.closePath(); ctx.fillStyle = rgba(INK.red, .16); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * .86, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(left / total), false); ctx.lineWidth = r * .06; ctx.strokeStyle = INK.red; ctx.stroke(); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0, r0 = r * (big ? .72 : .79); inkLine(ctx, [[Math.sin(a) * r0, -Math.cos(a) * r0], [Math.sin(a) * r * .84, -Math.cos(a) * r * .84]], big ? r * .03 : r * .012, INK.ink, { taper: [0, 0], smooth: false }); }
  ['XII', 'III', 'VI', 'IX'].forEach((s, i) => { const a = i / 4 * TAU; txt(ctx, s, Math.sin(a) * r * .58, -Math.cos(a) * r * .58 + r * .07, { font: 'serif', weight: 900, size: r * .2, align: 'center', color: INK.ink }); });
  if (o.label !== false) txt(ctx, o.label || 'DEPLOY \u00B7 FRI 5:00 PM', 0, r * .32, { font: 'ui', weight: 800, size: r * .085, align: 'center', color: INK.red });
  if (o.digital !== false) txt(ctx, o.digital || `T\u2212${Math.max(0, Math.ceil(left))}s`, 0, -r * .22, { font: 'mono', weight: 800, size: r * .17, align: 'center', color: INK.red });
  const h = secs / 3600 % 12, m = secs / 60 % 60, s = secs % 60;
  const hand = (a, L, w, c) => { inkLine(ctx, [[-Math.sin(a) * L * .15, Math.cos(a) * L * .15], [Math.sin(a) * L, -Math.cos(a) * L]], w, c, { taper: [0, .6], smooth: false }); };
  hand(h / 12 * TAU, r * .45, r * .06, INK.ink); hand(m / 60 * TAU, r * .68, r * .045, INK.ink); hand(Math.floor(s) / 60 * TAU, r * .78, r * .02, INK.red);
  fillPts(ctx, ell(0, 0, r * .05, r * .05, 12), INK.ink);
  if (o.crack) { ctx.save(); ctx.globalAlpha = clamp(o.crack); for (let i = 0; i < 7; i++) { const a = hash(i * 3) * TAU, pts = [[r * .1 * Math.cos(a), r * .1 * Math.sin(a)]]; for (let j = 1; j < 5; j++) { const aa = a + (hash(i * 7 + j) - .5) * .6; pts.push([Math.cos(aa) * r * .22 * j, Math.sin(aa) * r * .22 * j]); } inkLine(ctx, pts, r * .012, INK.ink, { taper: [0, .8], smooth: false }); } ctx.restore(); }
  // glass glare
  ctx.save(); clipPts(ctx, ell(0, 0, r * .92, r * .92, 40)); ctx.globalAlpha = .35; fillPts(ctx, [[-r, -r * .5], [-r * .5, -r], [-r * .2, -r], [-r, -r * .2]], INK.white, false); ctx.restore();
  // lid, hinged on the left, swings open
  if (open < 1) { ctx.save(); ctx.translate(-r * 1.05, 0); ctx.scale(Math.cos(open * Math.PI * .5), 1); ctx.translate(r * 1.05, 0);
    ink(ctx, ell(0, 0, r * 1.06, r * 1.06, 40), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: Math.max(10, r * .05), dir: [.55, .83], from: -r * .2, to: r }, line: r * .04, boil: .6 });
    outline(ctx, ell(0, 0, r * .7, r * .7, 30), r * .02, INK.orangeDk); ctx.restore(); }
  ctx.restore();
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
// Tweet card (X-like, dark or light). o: {name, handle, text: [lines], likes, reposts, views, time, dark, verified, note}
function tweetCard(ctx, x, y, w, o = {}) {
  const dark = o.dark ?? false, fg = dark ? '#F0EEF6' : INK.ink, mut = dark ? '#8C8AA0' : '#6E6A78', size = o.size || 34, lines = o.text || ['wake up babe, new model dropped'];
  const h = 150 + lines.length * size * 1.3 + size * 1.7 + (o.note ? size * 3.2 : 0);
  uiBox(ctx, x, y, w, h, { fill: dark ? '#15141C' : INK.white, r: 18, shadow: 10 });
  ink(ctx, ell(x + 58, y + 62, 32, 32, 20), { fill: o.avatar || INK.cyan, line: 3, boil: .4 });
  txt(ctx, o.name || 'timeline enjoyer', x + 106, y + 56, { font: 'ui', weight: 800, size: size * .9, color: fg });
  const nw = measure(ctx, o.name || 'timeline enjoyer', { font: 'ui', weight: 800, size: size * .9 }).w;
  if (o.verified !== false) ink(ctx, star(x + 106 + nw + 20, y + 44, 14, .75, 8), { fill: INK.blue, line: 0, boil: 0, smooth: false });
  txt(ctx, (o.handle || '@timeline_enjoyer') + ' \u00B7 ' + (o.time || '2m'), x + 106, y + 92, { font: 'ui', weight: 500, size: size * .72, color: mut });
  lines.forEach((l, i) => txt(ctx, l, x + 40, y + 150 + i * size * 1.3, { font: 'ui', weight: 600, size, color: fg }));
  const by = y + 150 + lines.length * size * 1.3 + size * .4;
  if (o.note) { ink(ctx, rrect(x + 30, by - size * .4, w - 60, size * 2.8, 12), { fill: dark ? '#23222E' : '#F2EFE6', line: 2, boil: .3, smooth: false });
    txt(ctx, '\u2139 Readers added context', x + 50, by + size * .5, { font: 'ui', weight: 800, size: size * .7, color: fg }); txt(ctx, o.note, x + 50, by + size * 1.6, { font: 'ui', weight: 500, size: size * .7, color: fg }); }
  const sy = y + h - size * .9; [['\u21A9', o.replies || '1.2K'], ['\u21BB', o.reposts || '8.8K'], ['\u2665', o.likes || '41K'], ['\u2587', o.views || '9.1M']].forEach(([ic, n], i) => txt(ctx, ic + ' ' + n, x + 40 + i * (w - 80) / 4, sy, { font: 'ui', weight: 600, size: size * .68, color: mut }));
  return y + h;
}
// arXiv-like abstract page. o: {id, title: [lines], authors, abstract: [lines], subj}
function arxivCard(ctx, x, y, w, o = {}) {
  const lines = o.abstract || ['We show that for every Friday deploy there', 'exists a finite time T* at which prod blows up.'], tl = o.title || ['On the Finite-Time Blowup', 'of Friday Deploys'];
  const h = 170 + tl.length * 58 + lines.length * 40 + 60;
  uiBox(ctx, x, y, w, h, { r: 4, shadow: 10 });
  fillPts(ctx, rect(x + 2, y + 2, w - 4, 64), '#B31B1B', false);
  txt(ctx, 'arXiv', x + 30, y + 46, { font: 'serif', weight: 900, size: 40, color: INK.white }); txt(ctx, '> ' + (o.subj || 'math.AP'), x + 150, y + 44, { font: 'ui', weight: 600, size: 24, color: INK.white });
  txt(ctx, `arXiv:${o.id || '2609.04812'}`, x + 30, y + 110, { font: 'mono', weight: 600, size: 22, color: '#6E6A78' });
  tl.forEach((l, i) => txt(ctx, l, x + 30, y + 170 + i * 58, { font: 'serif', weight: 800, size: 48, color: INK.ink }));
  let yy = y + 170 + tl.length * 58;
  txt(ctx, o.authors || 'A. Rabbit, C. Rabbit, and 10,000 Agents', x + 30, yy, { font: 'serif', weight: 500, size: 26, color: '#2B59FF' });
  yy += 50; txt(ctx, 'Abstract:', x + 30, yy, { font: 'serif', weight: 800, size: 26, color: INK.ink });
  lines.forEach((l, i) => txt(ctx, l, x + 30, yy + 40 + i * 40, { font: 'serif', weight: 500, size: 26, color: INK.ink }));
  return y + h;
}
// METR-style log chart. o: {pts: [[x0..1, label, value]], progress 0..1, ylabels, title, footnote, fit}
function metrChart(ctx, x, y, w, h, t, o = {}) {
  uiBox(ctx, x, y, w, h, { r: 6, shadow: 10 });
  const px = x + 110, py = y + 80, pw = w - 160, ph = h - 190;
  txt(ctx, o.title || 'Time horizon of agents (50% success)', x + 30, y + 50, { font: 'ui', weight: 800, size: Math.min(30, w * .045), color: INK.ink });
  const yl = o.ylabels || ['1 min', '10 min', '1 hr', '8 hrs', '1 wk'];
  yl.forEach((l, i) => { const yy = py + ph - i / (yl.length - 1) * ph; inkLine(ctx, [[px, yy], [px + pw, yy]], 1.5, '#D8D2C4', { taper: [0, 0], smooth: false }); txt(ctx, l, px - 14, yy + 8, { font: 'ui', weight: 600, size: 20, color: '#6E6A78', align: 'right' }); });
  inkLine(ctx, [[px, py], [px, py + ph], [px + pw, py + ph]], 3, INK.ink, { taper: [0, 0], smooth: false });
  const pts = o.pts || [[.05, 'GPT-2', .02], [.2, '', .1], [.35, '', .22], [.5, '', .36], [.62, '', .5], [.74, '', .64], [.84, '', .78], [.92, 'now', .92]];
  const pr = o.progress ?? 1, n = Math.ceil(pts.length * pr);
  if (o.fit !== false) { ctx.save(); ctx.setLineDash([14, 10]); inkLine(ctx, [[px, py + ph * .98], [px + pw * .95, py + ph * .05], [px + pw * 1.05, py - ph * .3]].map(([a, b]) => [a, b]), 3, INK.orange, { taper: [0, 0] }); ctx.restore(); }
  for (let i = 0; i < n; i++) { const [a, l, v] = pts[i], xx = px + a * pw, yy = py + ph - v * ph; ink(ctx, ell(xx, yy, 13, 13, 14), { fill: i === n - 1 ? INK.orange : INK.blue, line: 3, boil: .5 }); if (l) txt(ctx, l, xx + 18, yy - 14, { font: 'ui', weight: 700, size: 20, color: INK.ink }); }
  if (o.footnote) txt(ctx, o.footnote, x + 30, y + h - 30, { font: 'ui', weight: 500, size: 20, color: '#6E6A78' });
}
// Terminal window. o: {title, lines: [[text, color]], cps (typing), t0, size}
function terminal(ctx, x, y, w, h, t, o = {}) {
  uiBox(ctx, x, y, w, h, { fill: '#0F0E16', r: 12, shadow: 10 });
  fillPts(ctx, rrect(x + 3, y + 3, w - 6, 44, 10), '#262434', false);
  [INK.red, INK.yellow, INK.green].forEach((c, i) => fillPts(ctx, ell(x + 34 + i * 30, y + 25, 9, 9, 10), c));
  txt(ctx, o.title || 'zsh \u2014 burrow', x + w / 2, y + 33, { font: 'ui', weight: 600, size: 22, color: '#A8A4B8', align: 'center' });
  const size = o.size || 30, lines = o.lines || [['$ git push --force', INK.white]];
  let budget = o.cps ? Math.max(0, (t - (o.t0 || 0)) * o.cps) : 1e9;
  ctx.save(); clipPts(ctx, rect(x + 6, y + 50, w - 12, h - 56), false);
  const start = Math.max(0, lines.length - Math.floor((h - 70) / (size * 1.35)));
  lines.slice(o.scrollFrom ?? 0).forEach(([s, c], i) => { if (budget <= 0) return; const shown = s.slice(0, Math.floor(budget)); budget -= s.length;
    txt(ctx, shown + (budget < 0 && Math.floor(t * 4) % 2 ? '\u2588' : ''), x + 26, y + 90 + i * size * 1.35, { font: 'mono', weight: 700, size, color: c || '#E8E6F0' }); });
  ctx.restore();
}
// Win95 dialog. o: {title, text: [lines], buttons: [labels], press: index, icon}
function win95(ctx, x, y, w, h, o = {}) {
  fillPts(ctx, rect(x + 10, y + 12, w, h), INK.ink, false);
  fillPts(ctx, rect(x, y, w, h), '#C0C0C0', false); inkLine(ctx, [[x, y + h], [x, y], [x + w, y]], 4, '#FFFFFF', { taper: [0, 0], smooth: false }); inkLine(ctx, [[x + w, y], [x + w, y + h], [x, y + h]], 4, '#404040', { taper: [0, 0], smooth: false });
  fillPts(ctx, rect(x + 6, y + 6, w - 12, 46), '#000080', false); txt(ctx, o.title || 'Error', x + 20, y + 40, { font: 'ui', weight: 800, size: 26, color: INK.white });
  fillPts(ctx, rect(x + w - 46, y + 12, 34, 32), '#C0C0C0', false); txt(ctx, '\u00D7', x + w - 29, y + 38, { font: 'ui', weight: 900, size: 30, color: INK.ink, align: 'center' });
  ink(ctx, ell(x + 64, y + 118, 30, 30, 20), { fill: o.iconColor || INK.red, line: 3, boil: .3 }); txt(ctx, o.icon || '\u00D7', x + 64, y + 130, { font: 'ui', weight: 900, size: 38, color: INK.white, align: 'center' });
  (o.text || ['400 unresolved comments.']).forEach((l, i) => txt(ctx, l, x + 120, y + 112 + i * 38, { font: 'ui', weight: 600, size: 28, color: INK.ink }));
  (o.buttons || ['Resolve all', 'Merge anyway']).forEach((b, i, a) => { const bw = 200, bx = x + w / 2 - (a.length * (bw + 20) - 20) / 2 + i * (bw + 20), by = y + h - 76, p = o.press === i;
    fillPts(ctx, rect(bx, by, bw, 52), '#C0C0C0', false); inkLine(ctx, [[bx, by + 52], [bx, by], [bx + bw, by]], 3, p ? '#404040' : '#FFFFFF', { taper: [0, 0], smooth: false }); inkLine(ctx, [[bx + bw, by], [bx + bw, by + 52], [bx, by + 52]], 3, p ? '#FFFFFF' : '#404040', { taper: [0, 0], smooth: false });
    txt(ctx, b, bx + bw / 2 + (p ? 2 : 0), by + 35 + (p ? 2 : 0), { font: 'ui', weight: 700, size: 24, color: INK.ink, align: 'center' }); });
}
// "What do you want to build?" prompt box. o: {text (placeholder), typed, t, w}
function promptBox(ctx, x, y, w, t, o = {}) {
  const h = o.h || 120;
  uiBox(ctx, x, y, w, h, { r: 26, shadow: 8, fill: o.fill || INK.white });
  const s = o.typed != null ? o.typed : o.text || 'What do you want to build?';
  txt(ctx, s + (Math.floor(t * 2.5) % 2 ? '|' : ''), x + 36, y + h * .58, { font: 'ui', weight: 600, size: o.size || 34, color: o.typed != null ? INK.ink : '#8A8496' });
  ink(ctx, ell(x + w - h * .5, y + h * .5, h * .28, h * .28, 18), { fill: o.btn || INK.ink, line: 0, boil: 0 });
  txt(ctx, '\u2191', x + w - h * .5, y + h * .62, { font: 'ui', weight: 900, size: h * .32, color: INK.white, align: 'center' });
}
// Status page rows. o: {rows: [[name, state 'ok'|'degraded'|'down']], title}
function statusPage(ctx, x, y, w, t, o = {}) {
  const rows = o.rows || [['API', 'down'], ['Web', 'down'], ['Database', 'down'], ['Auth', 'degraded'], ['Webhooks', 'down']], rh = 74;
  const h = 130 + rows.length * rh; uiBox(ctx, x, y, w, h, { r: 10, shadow: 10 });
  const worst = rows.some(r => r[1] === 'down');
  fillPts(ctx, rrect(x + 24, y + 24, w - 48, 76, 8), worst ? INK.red : INK.green, false);
  txt(ctx, o.title || (worst ? 'Major outage' : 'All systems operational'), x + 50, y + 74, { font: 'ui', weight: 800, size: 34, color: INK.white });
  rows.forEach(([n, s], i) => { const yy = y + 130 + i * rh; txt(ctx, n, x + 40, yy + 46, { font: 'ui', weight: 700, size: 30, color: INK.ink });
    pill(ctx, x + w - 250, yy + 36, s === 'ok' ? 'Operational' : s === 'degraded' ? 'Degraded' : 'Outage', { fill: s === 'ok' ? INK.green : s === 'degraded' ? INK.orange : INK.red, size: 22 });
    inkLine(ctx, [[x + 24, yy + rh], [x + w - 24, yy + rh]], 1.5, '#D8D2C4', { taper: [0, 0], smooth: false }); });
  return y + h;
}
// Rubber stamp (LGTM, NOPE, CRITICAL, MERGED). Pops in at age 0 with a slam. o: {color, rot, life}
function stamp(ctx, s, x, y, size, age, o = {}) {
  if (age < 0 || (o.life && age > o.life)) return;
  const k = age < .08 ? lerp(1.8, 1, easeIn(age / .08)) : 1 + .04 * Math.exp(-(age - .08) * 20) * Math.sin((age - .08) * 60);
  const col = o.color || INK.red, f = { font: 'display', weight: 900, stretch: o.stretch ?? 0, size: size * k }, m = measure(ctx, s, f);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.12); ctx.globalAlpha = age < .08 ? clamp(age / .04) : 1;
  const bw = m.w + size * .5, bh = size * 1.05 * k;
  ctx.lineWidth = size * .09; ctx.strokeStyle = col; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
  txt(ctx, s, 0, size * .36 * k, { ...f, color: col, align: 'center' });
  // worn ink: knock paper-coloured specks out of the stamp
  ctx.globalAlpha = .9; dotsIn(ctx, [-bw / 2, -bh / 2, bw / 2, bh / 2], { spacing: size * .14, color: o.paper || INK.paper, k: (a, b) => clamp(.15 + noise2(a * .03 + 7, b * .03) * .5) });
  ctx.restore();
}
// Thumbs-up reaction (drawn, not an emoji glyph).
function thumbsUp(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const u = s / 10, hand = [[-3.5 * u, -1 * u], [-1 * u, -1.5 * u], [0, -5.5 * u], [.8 * u, -8 * u], [2.4 * u, -7.4 * u], [2.2 * u, -3 * u], [4.8 * u, -3 * u], [5.2 * u, -1.6 * u], [4.6 * u, 4.2 * u], [-3.5 * u, 4.2 * u]];
  ink(ctx, hand, { fill: INK.yellow, shade: { color: INK.orange, spacing: Math.max(9, u), dir: [.5, .85], from: -3 * u, to: 5 * u }, line: Math.max(4, .45 * u), boil: .8, smooth: false });
  ink(ctx, rrect(-6 * u, -1.8 * u, 2.8 * u, 6.8 * u, .8 * u), { fill: INK.blue, line: Math.max(4, .45 * u), boil: .6, smooth: false });
  for (let i = 0; i < 3; i++) inkLine(ctx, [[1.6 * u, (-.8 + i * 1.6) * u], [4.8 * u, (-.8 + i * 1.6) * u]], Math.max(2.5, .3 * u), INK.ink, { taper: [.1, .3] });
  ctx.restore();
}
// Release ticker crawl. items: strings; speed px/s.
function ticker(ctx, y, t, items, o = {}) {
  const h = o.h || 72, size = o.size || 34, speed = o.speed || 400;
  fillPts(ctx, rect(0, y, W, h), o.bg || INK.ink, false);
  fillPts(ctx, rect(0, y, 220, h), o.tag || INK.red, false); txt(ctx, o.label || 'LIVE', 110, y + h * .66, { font: 'display', weight: 900, size: size * .95, color: INK.white, align: 'center' });
  const str = items.join('   \u25B2   ') + '   \u25B2   ', f = { font: 'ui', weight: 800, size }, sw = measure(ctx, str, f).w;
  ctx.save(); clipPts(ctx, rect(220, y, W - 220, h), false);
  let x0 = 220 - mod(t * speed, sw); while (x0 < W) { txt(ctx, str, x0, y + h * .66, { ...f, color: o.color || INK.yellow }); x0 += sw; }
  ctx.restore();
}
// Evangelion-style title card: white Mincho on ink, mechanically squashed blocks in an L arrangement.
// blocks: [{s, x, y, size, sx (horizontal squash), font 'serif'|'jp', align}]
function evaCard(ctx, t, blocks, o = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fillPts(ctx, rect(0, 0, W, H), o.bg || '#0B0A0F', false); ctx.restore();
  for (const b of blocks) txt(ctx, b.s, b.x, b.y, { font: b.font || 'serif', weight: b.font === 'jp' ? 800 : 900, stretch: b.font === 'jp' ? 0 : -3, size: b.size, sx: b.sx ?? .72, color: b.color || '#F4F1EA', align: b.align || 'left', track: b.track ?? -2 });
}
