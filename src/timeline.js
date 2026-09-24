// timeline.js: chapter/shot registry, the lyric plan, and frame assembly.
//
// A chapter file calls chapter(name, start, end, shots) with shots = [[t0, fn], ...] in time order.
// fn(ctx, t, lt, dur) paints the WHOLE frame (background included). t = song time, lt = t - t0, dur = shot length.
// Shots must be pure functions of t: frames render in parallel and out of order.
const CH = [];
function chapter(name, a, b, shots) { CH.push({ name, a, b, shots }); CH.sort((p, q) => p.a - q.a); }
function shotAt(t) {
  const ch = CH.find(c => t >= c.a && t < c.b); if (!ch) return null;
  let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
  const t0 = ch.shots[i][0], t1 = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.b;
  return { ch, i, fn: ch.shots[i][1], t0, t1 };
}

// Per-frame switches a shot may flip: FRAME.lyrics = false hides the lyric overlay, FRAME.grain scales the grain,
// FRAME.post.push(fn) runs fn(ctx, t) after the lyrics (screen-space overlays such as the VHS OSD).
let FRAME = null;

// ---------- lyric plan ----------
// LYRICS[li] = how line li is lettered: a spec or an array of specs. {mode: 'hero'|'caption'|'sub'|'none', ...opts}
// 'none' means the shot letters it itself (diegetic: typed into a comment box, written as code, and so on).
// Filled in by src/lyricplan.js; anything missing falls back to a subtitle.
const LYRICS = {};
function drawLyrics(ctx, t) {
  const li = LINES.findIndex((l, i) => t >= l.words[0].a - LEAD - .1 && t < lineEnd(i)); if (li < 0) return;
  const specs = [].concat(LYRICS[li] || { mode: 'sub' });
  for (const s of specs) {
    if (s.until && t >= s.until) continue; if (s.after && t < s.after) continue;
    if (s.mode === 'hero') hero(ctx, t, li, s); else if (s.mode === 'caption') caption(ctx, t, li, s); else if (s.mode === 'sub') sub(ctx, t, li, s);
    else if (s.mode === 'noir') caption(ctx, t, li, { fill: INK.ink, color: INK.paper, hotColor: INK.red, ...s }); else if (s.mode === 'ransom') ransom(ctx, t, li, s);
  }
}

// ---------- frame ----------
function drawFrame(ctx, t) {
  BOIL_T = t; BOIL = 1; LIGHT = [-.55, -.83]; LDEPTH = 0;
  FRAME = { lyrics: true, grain: 1, post: [] };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  paperBg(ctx);
  const s = window.LOOK ? null : shotAt(t);
  if (window.LOOK) { ctx.save(); window.LOOK(ctx, t); ctx.restore(); FRAME.lyrics = FRAME.lyrics && !!window.LOOK.lyrics; }
  else if (s) { ctx.save(); s.fn(ctx, t, t - s.t0, s.t1 - s.t0); ctx.restore(); } else placeholder(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (FRAME.lyrics) drawLyrics(ctx, t);
  for (const f of FRAME.post) { ctx.save(); f(ctx, t); ctx.restore(); }
  grain(ctx, FRAME.grain);
}
function placeholder(ctx, t) {
  txt(ctx, 'unpainted ' + t.toFixed(2), W / 2, H / 2, { size: 80, align: 'center', base: 'middle', color: INK.ink });
}
