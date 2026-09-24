// core.js: constants, math, deterministic randomness, song timing, palette, canvas layers, camera.
// Every frame is a pure function of song time t. Never use Math.random() or state that survives between frames.
const W = 1920, H = 1080, FPS = 24, DUR = 128.64, TAU = Math.PI * 2;

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => (x - a) / (b - a);
const remap = (x, a, b, c, d) => lerp(c, d, clamp(inv(a, b, x)));
const frac = x => x - Math.floor(x);
const mod = (x, m) => ((x % m) + m) % m;
const seg = (t, a, b) => clamp((t - a) / (b - a));                       // 0..1 progress of t through [a, b]
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeIn = x => Math.pow(clamp(x), 3);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const expoOut = x => { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
const expoIn = x => { x = clamp(x); return x === 0 ? 0 : Math.pow(2, 10 * x - 10); };
const backOut = (x, s = 1.9) => { x = clamp(x) - 1; return 1 + (s + 1) * x * x * x + s * x * x; };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * TAU / 3) + 1; };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
// keyframes: kf(t, [[t0, v0], [t1, v1], ...], ease). Values may be numbers or arrays of numbers.
function kf(t, keys, e = smooth) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
    return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
  }
  return keys[keys.length - 1][1];
}

// ---------- deterministic randomness ----------
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const hash2 = (x, y) => hash(x * 57.13 + y * 113.7);
const hrange = (n, a, b) => lerp(a, b, hash(n));
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let z = s; z = Math.imul(z ^ (z >>> 15), z | 1); z ^= z + Math.imul(z ^ (z >>> 7), z | 61); return ((z ^ (z >>> 14)) >>> 0) / 4294967296; }; }
// smooth value noise, roughly -1..1
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function noise2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(i, j), hash2(i + 1, j), ux), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), ux), uy) * 2 - 1;
}
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);

// ---------- animation rate ----------
// Characters are animated "on twos" (12 poses/s) while cameras move on ones (24 fps), like Spider-Verse.
const twos = t => Math.floor(t * 12 + 1e-6) / 12;
const threes = t => Math.floor(t * 8 + 1e-6) / 8;
const boilN = t => Math.floor(t * 12 + 1e-6);          // line-boil seed, changes 12x per second

// ---------- song timing (BEATS and LINES come from data.js) ----------
const BEAT = (BEATS[BEATS.length - 1] - BEATS[0]) / (BEATS.length - 1);
// fractional beat index at time t (beat 0 = BEATS[0]); extrapolates before the first and after the last beat
function beatAt(t) {
  const n = BEATS.length;
  if (t <= BEATS[0]) return (t - BEATS[0]) / BEAT;
  if (t >= BEATS[n - 1]) return n - 1 + (t - BEATS[n - 1]) / BEAT;
  let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (BEATS[m] <= t) lo = m; else hi = m; }
  return lo + (t - BEATS[lo]) / (BEATS[hi] - BEATS[lo]);
}
function beatTime(b) {
  const n = BEATS.length;
  if (b <= 0) return BEATS[0] + b * BEAT;
  if (b >= n - 1) return BEATS[n - 1] + (b - n + 1) * BEAT;
  const i = Math.floor(b); return lerp(BEATS[i], BEATS[i + 1], b - i);
}
// Sync law: a visual hit lands on the frame of the sound or one frame early, never late. VLEAD shifts every
// beat/hit helper below one frame earlier.
const VLEAD = 1 / 24;
const beatN = t => Math.floor(beatAt(t + VLEAD) + 1e-6);
// 1 on each beat, decaying after. every = 2 for every other beat, .5 for eighths.
const pulse = (t, k = 6, every = 1) => Math.exp(-frac(beatAt(t + VLEAD) / every) * k);
// decaying hit after the most recent of the given times (0 before the first one)
function hit(t, times, k = 8) { let last = -1e9; for (const x of times) if (x - VLEAD <= t + 1e-6 && x > last) last = x; return last < -1e8 ? 0 : Math.exp(-Math.max(0, t - last + VLEAD) * k); }
function lastOf(t, times) { let last = null; for (const x of times) if (x - VLEAD <= t + 1e-6 && (last === null || x > last)) last = x; return last; }
const since = (t, t0) => Math.max(0, t - t0);

// ---------- lyrics ----------
const lineAt = t => LINES.findIndex(l => t >= l.a && t < l.b);
const wordT = (li, wi) => LINES[li].words[wi].a;       // start time of word wi of line li

// ---------- palette ----------
// A fixed set of print inks. Every insert (UI, tweets, charts) is printed in these same inks, which is what holds
// the collage together.
const INK = {
  ink: '#16121F', paper: '#F7EEDC', paperDk: '#E6D8BD', white: '#FFFBF2',
  orange: '#FF5A1F', orangeDk: '#C73A0E', orangeLt: '#FF9A5C',
  pink: '#FF3D8B', pinkLt: '#FF9CC2', blue: '#2B59FF', blueDk: '#1A2A8C', cyan: '#19C6E6',
  yellow: '#FFD23F', green: '#1FB36B', greenLt: '#8BE3B0', red: '#E8203A', redDk: '#9C0F24',
  purple: '#8250DF', night: '#141A3C', nightLt: '#28346E', fur: '#FFF6E8', furShade: '#F3B79A', earIn: '#FF8FB1',
};
function hexRGB(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, k) { const A = hexRGB(a), B = hexRGB(b), c = i => Math.round(lerp(A[i], B[i], clamp(k))); return '#' + ((1 << 24) + (c(0) << 16) + (c(1) << 8) + c(2)).toString(16).slice(1); }
function rgba(c, a) { const [r, g, b] = hexRGB(c); return `rgba(${r},${g},${b},${a})`; }

// ---------- canvases ----------
function makeCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// Reusable full-frame scratch layers. layer(i) returns a cleared 2D context; nested users must pick different i.
const LAYERS = [];
function layer(i) {
  if (!LAYERS[i]) LAYERS[i] = makeCanvas().getContext('2d');
  const c = LAYERS[i]; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.clearRect(0, 0, W, H); return c;
}

// ---------- camera ----------
// cam(ctx, cx, cy, zoom, rot): world point (cx, cy) lands at the screen centre. Pair with ctx.restore().
function cam(ctx, cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy); }
// deterministic camera shake that changes on ones
const shake = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };
// Gentle handheld drift (smooth), for keeping still shots alive.
const drift = (t, amt = 6, f = .3) => [noise1(t * f + 11) * amt, noise1(t * f + 47) * amt];
