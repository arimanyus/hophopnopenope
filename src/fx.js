// fx.js: print/camera effects. Misregistration replaces blur for depth; grain is static (it survives X's encoder).

// ---------- layers with misregistration ----------
// Scratch layers for user code come from a stack (indices 10..29) so nesting depth()/panels() is safe.
// Fixed indices 40+ are private to the effects below, which never call back into user code.
let LDEPTH = 0;
const pushLayer = () => layer(10 + LDEPTH++), popLayer = () => { LDEPTH--; };
// depth(ctx, px, fn, o): fn(c) draws into a scratch layer, which is composited into ctx with the three colour
// plates shifted by px (RGB split). px = 0 is in focus; 6-14 reads as foreground/background out of focus.
function depth(ctx, px, fn, o = {}) {
  if (!px) { fn(ctx); return; }
  const c = pushLayer(); fn(c); popLayer();
  misreg(ctx, c.canvas, px, o.angle ?? 0, o.alpha ?? 1);
}
function chan(src, color, i) { const c = layer(i); c.drawImage(src, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = color; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'destination-in'; c.drawImage(src, 0, 0); c.globalCompositeOperation = 'source-over'; return c.canvas; }
function misreg(ctx, src, px, ang = 0, alpha = 1) {
  const dx = Math.cos(ang) * px, dy = Math.sin(ang) * px, i = 50;
  const r = chan(src, '#FF0000', i), g = chan(src, '#00FF00', i + 1), b = chan(src, '#0000FF', i + 2), m = layer(i + 3);
  m.globalCompositeOperation = 'lighter'; m.drawImage(r, -dx, -dy); m.drawImage(g, 0, 0); m.drawImage(b, dx, dy);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(m.canvas, 0, 0); ctx.restore();
}
// Whole-frame misregistration (on hits): splits what is already on ctx.
function misregFrame(ctx, px, ang = 0) { if (px < .5) return; const c = layer(40); c.drawImage(ctx.canvas, 0, 0); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore(); misreg(ctx, c.canvas, px, ang); }

// ---------- paper, grain, vignette (built once) ----------
let GRAIN = null, PAPER = null;
function buildTextures() {
  const r = rng(7);
  PAPER = makeCanvas(); const p = PAPER.getContext('2d');
  p.fillStyle = INK.paper; p.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H, rr = 150 + r() * 420, g = p.createRadialGradient(x, y, 0, x, y, rr), a = .05 * r(); g.addColorStop(0, `rgba(150,110,70,${a})`); g.addColorStop(1, 'rgba(150,110,70,0)'); p.fillStyle = g; p.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  p.lineWidth = 1; for (let i = 0; i < 2200; i++) { const x = r() * W, y = r() * H, l = 4 + r() * 22, a = r() * TAU; p.strokeStyle = `rgba(100,80,55,${.03 + r() * .06})`; p.beginPath(); p.moveTo(x, y); p.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
  // grain: multiply layer, mostly white with sparse warm specks + fibres, plus a soft vignette
  GRAIN = makeCanvas(); const g = GRAIN.getContext('2d'), id = g.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (r() < .5 ? r() * r() * 42 : 0); d[i] = v; d[i + 1] = v - 2; d[i + 2] = v - 6; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  g.globalAlpha = .5; g.drawImage(PAPER, 0, 0); g.globalAlpha = 1;
  const v = g.createRadialGradient(W / 2, H / 2, H * .42, W / 2, H / 2, H * 1.02); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(90,70,60,.38)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}
const paperBg = ctx => ctx.drawImage(PAPER, 0, 0);
function grain(ctx, k = 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = k; ctx.drawImage(GRAIN, 0, 0); ctx.restore(); }

// ---------- full-frame effects (screen space) ----------
function flash(ctx, color, k) { if (k <= .01) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(k); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// Map the current frame to two inks (dark -> light) by luminance. Used for the noir bridge and the paused rabbit.
function duotone(ctx, dark = INK.ink, light = INK.paper, contrast = 1.25) {
  const c = layer(41); c.filter = `grayscale(1) contrast(${contrast})`; c.drawImage(ctx.canvas, 0, 0); c.filter = 'none';
  c.globalCompositeOperation = 'multiply'; c.fillStyle = light; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen'; c.fillStyle = dark; c.fillRect(0, 0, W, H);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c.canvas, 0, 0); ctx.restore();
}
// Horizontal slice-tear glitch of what is already on ctx. amt 0..1.
function glitch(ctx, t, amt = 1, seed = 0) {
  if (amt <= .01) return; const c = layer(42); c.drawImage(ctx.canvas, 0, 0); const f = Math.floor(t * 24) + seed * 100, n = Math.floor(6 + amt * 18);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) { const y = hash(f * 3.1 + i) * H, h = 8 + hash(f + i * 7) * 90 * amt, dx = (hash(f * 1.3 + i * 5) - .5) * 260 * amt; ctx.drawImage(c.canvas, 0, y, W, h, dx, y, W, h); }
  ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = INK.cyan;
  for (let i = 0; i < n / 3; i++) { if (hash(f + i * 11) < .5) continue; ctx.fillRect(hash(f * 7 + i) * W, hash(f * 9 + i) * H, 40 + hash(i + f) * 300 * amt, 6 + hash(i * 3 + f) * 30); }
  ctx.restore(); misregFrame(ctx, 10 * amt, 0);
}
// Dot wipe: halftone dots grow to cover the frame (k 0 -> 1) sweeping along dir. Use k = 1 -> 0 to reveal.
function dotWipe(ctx, k, color = INK.ink, o = {}) {
  if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (k >= 1) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
  const dir = o.dir || [.8, .6], span = W * Math.abs(dir[0]) + H * Math.abs(dir[1]);
  dotsIn(ctx, [0, 0, W, H], { spacing: o.spacing || 44, angle: o.angle ?? Math.PI / 4, color, size: 1.05,
    k: (x, y) => clamp(k * 2.2 - ((x - (dir[0] < 0 ? W : 0)) * dir[0] + (y - (dir[1] < 0 ? H : 0)) * dir[1]) / span * 1.2) * 1.2 });
  ctx.restore();
}
// VHS pause: tracking bars, jitter and the OSD. Call after the frame is drawn.
function vhsPause(ctx, t, k = 1) {
  if (k <= .01) return; const f = Math.floor(t * 24); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const y = mod(f * 23, H + 200) - 100, c = layer(43); c.drawImage(ctx.canvas, 0, 0);
  ctx.drawImage(c.canvas, 0, y, W, 60, (hash(f) - .5) * 60 * k, y + 4, W, 60);
  ctx.globalAlpha = .55 * k; ctx.fillStyle = '#fff'; for (let i = 0; i < 70; i++) ctx.fillRect(hash(f + i) * W, y + hash(f * 3 + i) * 70, 6 + hash(i + f * 7) * 60, 2);
  ctx.globalAlpha = k; ctx.font = '700 64px "JetBrains Mono"'; ctx.textBaseline = 'top'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
  ctx.fillText('\u258C\u258C PAUSE', 90, 70); ctx.restore();
}

// ---------- comic panels ----------
// panels(ctx, t, [{r: [x, y, w, h] | poly: pts, fn: (c, t) => draws a full 1920x1080 frame, zoom, at: [cx, cy]}], o)
// Each panel's frame is scaled to cover its box; ink border, paper gutter background.
function panels(ctx, t, list, o = {}) {
  ctx.save(); ctx.fillStyle = o.gutter || INK.paper; ctx.fillRect(0, 0, W, H); ctx.restore();
  for (const p of list) {
    const poly = p.poly || rect(...p.r), [x0, y0, x1, y1] = bbox(poly), pw = x1 - x0, ph = y1 - y0;
    const c = pushLayer(); p.fn(c, t); popLayer();
    const s = Math.max(pw / W, ph / H) * (p.zoom || 1), [ax, ay] = p.at || [W / 2, H / 2];
    ctx.save(); clipPts(ctx, poly, false);
    ctx.drawImage(c.canvas, (x0 + x1) / 2 - ax * s, (y0 + y1) / 2 - ay * s, W * s, H * s); ctx.restore();
    outline(ctx, poly, o.border || 7, INK.ink, { smooth: false, heavy: .3 });
  }
}
