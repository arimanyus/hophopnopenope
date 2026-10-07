// timeline.js: chapter/shot registry, the lyric plan, and frame assembly.
//
// A chapter file calls chapter(name, start, end, shots) with shots = [[t0, fn], ...] in time order.
// fn(ctx, t, lt, dur) paints the WHOLE frame (background included). t = song time, lt = t - t0, dur = shot length.
// Shots must be pure functions of t: frames render in parallel and out of order.
const CH = [];
function chapter(name, a, b, shots) { CH.push({ name, a, b, shots }); CH.sort((p, q) => p.a - q.a); }
// Cuts snap to the frame that contains their time, so a cut on a downbeat is never a frame late (sync law).
const cutF = x => Math.floor(x * FPS + 1e-6) / FPS;
const chAt = t => CH.find(c => t >= cutF(c.a) - 1e-6 && t < cutF(c.b) - 1e-6);
function shotAt(t) {
  const ch = chAt(t); if (!ch) return null;
  let i = 0; while (i + 1 < ch.shots.length && t >= cutF(ch.shots[i + 1][0]) - 1e-6) i++;
  const t0 = ch.shots[i][0], t1 = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.b;
  return { ch, i, fn: ch.shots[i][1], t0, t1 };
}

// Per-frame switches a shot may flip: FRAME.lyrics = false hides the lyric overlay, FRAME.grain scales the grain,
// FRAME.post.push(fn) runs fn(ctx, t) after the lyrics (screen-space overlays such as the VHS OSD).
let FRAME = null;

// ---------- lyric plan ----------
// LYRICS[li] = how line li is lettered: a spec or an array of specs. {mode: 'hero'|'caption'|'sub'|'livecap'|'ransom'|'none', ...opts}
// 'none' means the shot letters it itself (diegetic: typed into a Teams chat, an invite title, and so on).
// Defaults live in src/lyricplan.js; a chapter may override the entries of its own lines. Missing lines fall back to a subtitle.
// {hold: s} keeps a line up to s seconds after it is sung (never past the next line or a chapter cut).
const LYRICS = {};
const specsOf = li => [].concat(LYRICS[li] || { mode: 'sub' });
const shownUntil = li => Math.max(...specsOf(li).map(s => s.hold ? holdEnd(li, s.hold) : lineEnd(li)));
function drawLyrics(ctx, t) {
  const li = LINES.findIndex((l, i) => t >= l.words[0].a - LEAD - .1 && t < shownUntil(i)); if (li < 0) return;
  if (t > LINES[li].b && chAt(LINES[li].b) !== chAt(t)) return;
  for (const s of specsOf(li)) {
    if (s.until && t >= s.until) continue; if (s.after && t < s.after) continue;
    if (s.mode === 'hero') hero(ctx, t, li, s); else if (s.mode === 'caption') caption(ctx, t, li, s); else if (s.mode === 'sub') sub(ctx, t, li, s);
    else if (s.mode === 'noir') caption(ctx, t, li, { fill: INK.ink, color: INK.paper, hotColor: INK.red, ...s }); else if (s.mode === 'ransom') ransom(ctx, t, li, s);
    else if (s.mode === 'livecap') livecap(ctx, t, li, s);
  }
}

// ---------- frame ----------
function drawFrame(ctx, t) {
  BOIL_T = t; BOIL = 1; LIGHT = [-.55, -.83]; LDEPTH = 0; look(1);
  FRAME = { lyrics: true, grain: 1, post: [] };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  paperBg(ctx);
  const s = window.LOOK ? null : shotAt(t);
  if (window.LOOK) { ctx.save(); window.LOOK(ctx, t); ctx.restore(); FRAME.lyrics = FRAME.lyrics && !!window.LOOK.lyrics; }
  else if (s) { const ts = Math.max(t, s.t0); ctx.save(); s.fn(ctx, ts, ts - s.t0, s.t1 - s.t0); ctx.restore(); } else placeholder(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  look(1); BOIL = 1;
  if (FRAME.lyrics) drawLyrics(ctx, t);
  for (const f of FRAME.post) { ctx.save(); f(ctx, t); ctx.restore(); }
  grain(ctx, FRAME.grain);
}
function placeholder(ctx, t) {
  txt(ctx, 'unpainted ' + t.toFixed(2), W / 2, H / 2, { size: 80, align: 'center', base: 'middle', color: INK.ink });
}
