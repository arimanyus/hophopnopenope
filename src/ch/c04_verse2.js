// c04_verse2.js: Verse 2, the mood wash (47.74-69.27). The rabbit's care goes unread.
// Gwen-style backgrounds: big wet-edged flat blobs whose hue follows the rabbit's mood
// (yellow = hope, blue = hurt, grey = paused, pink/peach = the poem). Lyrics are caption boxes (the inner voice).
(() => {
  const BAGS = .3, D = a => a * Math.PI / 180;
  const ago = (t, T) => t - (T - VLEAD);                          // time since a hit, which shows one frame early
  const kick = (t, T, k = 8) => { const a = ago(t, T); return a < 0 ? 0 : Math.exp(-a * k); };
  const FREEZE = 62.95;

  // ---------- mood wash ----------
  const MOOD = {
    hope: { fill: INK.yellow, rim: mix(INK.yellow, INK.orange, .55), dots: INK.orange },
    soak: { fill: mix(INK.blue, INK.paper, .6), rim: mix(INK.blue, INK.paper, .2), dots: INK.blueDk },
    hurt: { fill: INK.blue, rim: INK.blueDk, dots: INK.blueDk },
    deep: { fill: mix(INK.blue, INK.blueDk, .55), rim: INK.night, dots: INK.night },
    grey: { fill: mix(INK.paper, INK.ink, .26), rim: mix(INK.paper, INK.ink, .48), dots: INK.ink },
    poem: { fill: mix(INK.pinkLt, INK.orangeLt, .4), rim: mix(INK.pink, INK.orange, .2), dots: INK.pink },
  };
  // One main blob plus satellites straddling its edge; the frame falls off into bare paper at the corners.
  // o: {k: bloom 0..1 (grows from o.at), c: centre, r: [rx, ry], n: satellites}
  function moodWash(ctx, t, col, seed = 1, o = {}) {
    const P = typeof col === 'string' ? MOOD[col] : col, k = o.k ?? 1, at = o.at || [960, 540];
    const [mx, my] = o.c || [960, 540], [RX, RY] = o.r || [800, 480], B = [[mx, my, RX, RY]];
    for (let i = 0; i < (o.n ?? 5); i++) {
      const a = (i + .3 * hash(seed * 3 + i)) / (o.n ?? 5) * TAU + seed, d = .8 + .25 * hash(seed * 5 + i), r = hrange(seed * 7 + i, 210, 380);
      B.push([mx + Math.cos(a) * RX * d, my + Math.sin(a) * RY * d, r, r * hrange(seed * 11 + i, .65, 1)]);
    }
    const pts = B.map(([x, y, rx, ry], i) => {
      const d = drift(t + i * 5 + seed * 9, 14, .18);
      return blob(lerp(at[0], x + d[0], k), lerp(at[1], y + d[1], k), rx * k, seed * 13 + i, .15, 18, ry * k);
    });
    pts.forEach((p, i) => {
      fillPts(ctx, p, i ? mix(P.fill, i % 2 ? P.rim : INK.paper, .08 + .1 * hash(seed + i)) : P.fill);
      // wet edge: pigment pooled inside the rim, drawn as an offset outline
      ctx.save(); clipPts(ctx, p); outline(ctx, p.map(([x, y]) => [x + 8, y + 10]), 22, P.rim, { heavy: .9, seed: seed + i }); ctx.restore();
    });
    ctx.save(); ctx.beginPath(); for (const p of pts) tracePath(ctx, p, true, true); ctx.clip();
    const bb = bbox(pts.flat());
    dotsIn(ctx, bb, { spacing: 30, angle: .5, color: rgba(P.dots, .32), k: (x, y) => clamp(.05 + .7 * (noise2(x * .0032 + seed, y * .0032) * .5 + .5) - .2) });
    ctx.restore();
  }
  // background plate on its own misregistered layer, with parallax
  function bg(ctx, K, fn, px = 8, par = .5) {
    depth(ctx, px, c => { cam(c, lerp(960, K[0], par), lerp(540, K[1], par), lerp(1, K[2], par), (K[3] || 0) * par); fn(c); c.restore(); });
  }

  // ---------- small private kit ----------
  // tube along a pixel-space spine, width profile wf(s)
  function limb(spine, wf, n = 10) {
    const d = sampleSpline(spine, false, true, 6), L = [0];
    for (let i = 1; i < d.length; i++) L.push(L[i - 1] + dist(d[i - 1], d[i]));
    const tot = L[L.length - 1] || 1, left = [], right = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n; let j = 0; while (j < d.length - 2 && L[j + 1] / tot < s) j++;
      const a = d[j], b = d[j + 1], q = clamp((s * tot - L[j]) / ((L[j + 1] - L[j]) || 1)), x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q);
      const an = Math.atan2(b[1] - a[1], b[0] - a[0]), w = wf(s) / 2, nx = -Math.sin(an), ny = Math.cos(an);
      left.push([x + nx * w, y + ny * w]); right.push([x - nx * w, y - ny * w]);
    }
    return [...left, ...right.reverse()];
  }
  // the rabbit's paw + sleeve entering from off frame (close-ups). (x, y) = paw centre, r = paw radius, ang = toward the shoulder.
  function bigPaw(ctx, x, y, r, ang, o = {}) {
    const dx = Math.cos(ang), dy = Math.sin(ang), L = o.len || r * 12, P = k => [x + dx * L * k, y + dy * L * k];
    ink(ctx, limb([P(.1), P(.5), P(1)], s => r * (2.1 + s * .7), 8), { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 12, dir: [-dy, dx], from: -r * .4, to: r * 1.6 }, line: 6 });
    ink(ctx, limb([P(.05), P(.13)], () => r * 2.25, 3), { fill: INK.orangeDk, line: 5, smooth: false, boil: .8 });
    if (o.pen) pen(ctx, o.pen[0], o.pen[1], Math.atan2(y - o.pen[1], x - o.pen[0]), r * 3.4, r * .42);
    ink(ctx, ell(x, y, r * 1.08, r * .92, 18, ang), { fill: INK.fur, shade: { color: INK.furShade, spacing: 12, dir: [.5, .85], from: -r * .2, to: r }, line: 6 });
    for (const k of [-.35, .3]) { const nx = -dy, ny = dx; inkLine(ctx, [[x - dx * r * .5 + nx * r * k, y - dy * r * .5 + ny * r * k], [x - dx * r * .95 + nx * r * k * 1.1, y - dy * r * .95 + ny * r * k * 1.1]], 3.5, INK.ink, { taper: [.2, .6] }); }
  }
  // the red review pen, tip at (x, y), body running along ang
  function pen(ctx, x, y, ang, L = 150, w = 22) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ink(ctx, rrect(w * 1.5, -w * .5, L - w * 1.5, w, w * .3), { fill: INK.red, line: Math.max(3, w * .16), smooth: false, boil: .5 });
    fillPts(ctx, rect(L - w * 1.5, -w * .5, w * .5, w), INK.white, false);
    ink(ctx, [[0, 0], [w * 1.5, -w * .5], [w * 1.5, w * .5]], { fill: INK.fur, line: Math.max(3, w * .14), smooth: false, boil: .4 });
    fillPts(ctx, ell(w * .22, 0, w * .2, w * .2, 8), INK.red);
    ctx.restore();
  }
  // same crown as cursor({crown: true}); (x, y) = the cursor's own origin, s = cursor size, k = sprout scale
  function crownOn(ctx, s, k) {
    if (k <= .01) return;
    const bx = .106 * s, by = -.02 * s;
    const pts = [[-.1, -.02], [.05, -.34], [.2, -.12], [.33, -.4], [.46, -.12], [.6, -.34], [.72, -.02]].map(([a, b]) => [bx + (a - .31) * s * .6 * k, by + b * s * .6 * k]);
    ink(ctx, pts, { fill: INK.yellow, shade: { color: INK.orange, spacing: 9, dir: [0, 1] }, line: 4, smooth: false, boil: .6 });
  }
  function sparkle(ctx, x, y, r, rot = 0, fill = INK.white) { ink(ctx, star(x, y, r, .28, 4, rot), { fill, line: Math.max(3, r * .12), smooth: false, boil: .6 }); }
  // '+' marks as halftone: one path, one fill
  function plusMarks(ctx, pts, color) {
    ctx.beginPath();
    for (const [x, y, a] of pts) { if (a < .8) continue; const b = a * .34; ctx.rect(x - a, y - b, a * 2, b * 2); ctx.rect(x - b, y - a, b * 2, a * 2); }
    ctx.fillStyle = color; ctx.fill();
  }
  // dissolve what is on a scratch layer into halftone dots (k 0 intact -> 1 gone)
  function dotOut(c, box, k, seed = 0, sp = 16) {
    if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out';
    if (k >= 1) c.fillRect(0, 0, W, H); else dotsIn(c, box, { spacing: sp, size: 1.1, color: '#000', k: (x, y) => clamp(k * 2.4 - .7 + .5 * noise2(x * .02 + seed, y * .02)) * 1.3 });
    c.restore();
  }
  // draw fn into a scratch layer with ctx's current transform, run post(c) on it, then composite
  function sprite(ctx, fn, post) {
    const c = pushLayer(); c.setTransform(ctx.getTransform()); fn(c); if (post) post(c); popLayer();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c.canvas, 0, 0); ctx.restore();
  }
  const screenBox = (ctx, x0, y0, x1, y1) => { const m = ctx.getTransform(), a = m.transformPoint(new DOMPoint(x0, y0)), b = m.transformPoint(new DOMPoint(x1, y1)); return [Math.min(a.x, b.x) - 40, Math.min(a.y, b.y) - 40, Math.max(a.x, b.x) + 40, Math.max(a.y, b.y) + 40]; };
  const drops = (ctx, t, x, y, n, len, seed) => { // water dripping from a point, on twos
    const tc = twos(t);
    for (let i = 0; i < n; i++) { const ph = frac(tc * 1.6 + hash(seed + i)), dx = (hash(seed * 3 + i) - .5) * 40; if (ph > .8) continue;
      ink(ctx, [[x + dx, y + ph * len - 16], [x + dx + 9, y + ph * len + 6], [x + dx, y + ph * len + 14], [x + dx - 9, y + ph * len + 6]], { fill: INK.cyan, line: 3, boil: .5 }); }
  };

  // ======================================================================================================
  // 1 · 47.74 "Sixty seconds": the watch face (graphic match from chorus 1). The countdown SNAPS 90 -> 60.
  // the countdown readout in its own window above the hands, so the number always reads; pops when it changes (a = age)
  function watchLCD(ctx, x, y, r, rot, s, a = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.translate(0, -r * .27);
    const pop = a >= 0 ? lerp(1.3, 1, backOut(clamp(a / .12), 3)) : 1; ctx.scale(pop, pop);
    ink(ctx, rrect(-r * .34, -r * .12, r * .68, r * .24, r * .05), { fill: INK.white, line: 5, smooth: false, boil: .5 });
    if (a >= 0 && a < .09) txt(ctx, s, 8, r * .07, { font: 'mono', weight: 800, size: r * .19, align: 'center', color: INK.cyan });
    txt(ctx, s, 0, r * .07, { font: 'mono', weight: 800, size: r * .19, align: 'center', color: INK.red });
    ctx.restore();
  }
  const WATCH = [1120, 560];
  function sixty(ctx, t) {
    const SNAP = 47.88, a = ago(t, SNAP), hk = kick(t, SNAP, 9), [wx, wy] = WATCH, r = 380;
    const z = lerp(1.34, 1, easeOut(seg(t, 47.74, 48.75))) * (1 + .07 * hk), [dx, dy] = drift(t, 7, .6), [sx, sy] = shake(t, 16 * hk + (a < 0 ? 3 : 0));
    const K = [lerp(wx, 980, easeOut(seg(t, 47.74, 48.3))) + dx + sx, lerp(wy, 600, easeOut(seg(t, 47.74, 48.3))) + dy + sy, z, .012 * wob(t, .35) - .02 * hk];
    bg(ctx, K, c => {
      moodWash(c, t, 'hope', 2);
      if (a >= 0 && a < .5) speedLines(c, wx, wy, { r0: r * 1.2, r1: 2100, n: 64, w: 12, color: rgba(INK.orange, .8 * (1 - a / .5)) });
    });
    cam(ctx, ...K);
    const rot = -.06 + .025 * wob(t, .45) - .07 * hk;
    bigPaw(ctx, wx - 60, wy + r * 1.06, 92, D(100));
    const left = a < 0 ? 90 : 60 - 7 * Math.exp(-a * 9) * Math.cos(a * 30);
    const secs = a < 0 ? clockSecs(16, 58, 30) : lerp(clockSecs(16, 58, 30), clockSecs(16, 59, 0), backOut(clamp(a / .14), 2.4));
    pocketWatch(ctx, wx, wy, r, { secs, left, total: 90, digital: false, rot });
    watchLCD(ctx, wx, wy, r, rot, a < 0 ? 'T\u221290s' : 'T\u221260s', a);
    ink(ctx, ell(wx - 36, wy + r * .93, 58, 40, 16, -.3), { fill: INK.fur, shade: { color: INK.furShade, spacing: 12, dir: [.5, .85], from: -10, to: 50 }, line: 6 });  // thumb over the case
    // the lost 30 s of the red arc snaps off and falls away
    if (a >= 0 && a < .9) {
      const a0 = -Math.PI / 2 + TAU * 2 / 3, a1 = -Math.PI / 2 + TAU, pts = [];
      for (let i = 0; i <= 14; i++) { const th = lerp(a0, a1, i / 14); pts.push([Math.cos(th) * r * .95, Math.sin(th) * r * .95]); }
      for (let i = 14; i >= 0; i--) { const th = lerp(a0, a1, i / 14); pts.push([Math.cos(th) * r * .76, Math.sin(th) * r * .76]); }
      const cx = Math.cos(D(210)) * r * .86, cy = Math.sin(D(210)) * r * .86, ta = twos(a), pop2 = 70 * (1 - Math.exp(-a * 30));
      ctx.save(); ctx.translate(wx, wy); ctx.rotate(rot); ctx.translate(cx * (1 + pop2 / r) - 520 * ta, cy * (1 + pop2 / r) - 220 * ta + 2900 * ta * ta); ctx.rotate(-2.2 * ta); ctx.translate(-cx, -cy);
      ink(ctx, pts, { fill: INK.red, shade: { color: INK.redDk, spacing: 12, dir: [.5, .85], from: -r * .3, to: r }, line: 6 });
      ctx.restore();
      if (a < .2) for (const th of [a0, a1]) for (let i = 0; i < 5; i++) { // snap strokes at both breaks
        const q = th + (i - 2) * .12, r0 = r * (1.0 + .02 * i), r1 = r0 + 90 * (1 - a / .2) + 30;
        ctx.save(); ctx.translate(wx, wy); ctx.rotate(rot); inkLine(ctx, [[Math.cos(q) * r0, Math.sin(q) * r0], [Math.cos(q) * r1, Math.sin(q) * r1]], 7, INK.ink, { taper: [0, .8] }); ctx.restore();
      }
    }
    ctx.restore();
  }

  // ======================================================================================================
  // 2 · 48.75 "force-push on the branch": `git push --force`, then a Hokusai great wave of green diff lines
  const ENTER = 49.40, CRASH = 50.22;
  const BR = [[-40, 560], [240, 522], [520, 474], [760, 452]];                       // the branch fix/small-fix
  const GRIP = [500, 478];
  function tree(ctx, t) {
    const bark = mix(INK.orangeDk, INK.ink, .55), barkLt = mix(INK.orangeDk, INK.ink, .3);
    const trunk = limb([[40, -120], [70, 400], [30, 1200]], s => 230 - s * 30, 10);
    ink(ctx, trunk, { fill: bark, hatch: { color: INK.ink, spacing: 22, width: 4, angle: 1.45 }, line: 7, seed: 3 });
    ink(ctx, limb(BR, s => 92 - s * 58, 12), { fill: barkLt, shade: { color: INK.ink, spacing: 12, dir: [0, 1], from: 0, to: 40 }, line: 6, seed: 4 });
    ink(ctx, limb([[640, 460], [700, 400], [730, 350]], s => 26 - s * 18, 5), { fill: barkLt, line: 5, seed: 5 });
    // label: a GitHub-ish branch pill wrapped on the branch
    ctx.save(); ctx.translate(250, 520); ctx.rotate(-.14);
    ink(ctx, rrect(-150, -27, 300, 54, 27), { fill: INK.white, line: 4, smooth: false, boil: .5 });
    txt(ctx, 'fix/small-fix', 0, 14, { font: 'mono', weight: 800, size: 38, align: 'center', color: INK.ink });
    ctx.restore();
  }
  // Hokusai wave in local coords (curl centre at 0, 0), travelling left. curl 0..1.3 = how far the lip wraps.
  function waveShape(R, curl) {
    const th0 = D(22), th1 = D(-95 - 145 * curl), N = 44, SX = 1.3;
    const rad = f => R * (1 - .56 * Math.min(1, curl) * Math.pow(f, 1.25)), thick = f => R * .64 * Math.pow(1 - f, .72);
    const P = (f, dr = 0) => { const th = lerp(th0, th1, f), r = rad(f) - dr; return [Math.cos(th) * r * SX, Math.sin(th) * r]; };
    const outer = [], inner = []; for (let i = 0; i <= N; i++) outer.push(P(i / N));
    for (let i = N - 1; i >= 0; i--) inner.push(P(i / N, thick(i / N)));
    const o0 = outer[0], i0 = inner[inner.length - 1], G = R * 3;
    const back = bezPts([R * 4.5, G], [R * 3, R * 2], [o0[0] + R * .6, o0[1] + R * .5], o0, 10);
    const face = bezPts(i0, [i0[0] + R * .1, i0[1] + R * .5], [-R * .2, R * 1.3], [-R * .7, G], 10);
    return { poly: [...back.slice(0, -1), ...outer, ...inner, ...face.slice(1), [-R * .7, G + 600], [R * 4.5, G + 600]], P, thick, face };
  }
  // one Hokusai claw: a hooked finger of foam reaching forward off the lip
  function claw(ctx, p, tg, n, L, seed) {
    const u = [n[0] * .55 + tg[0] * .85, n[1] * .55 + tg[1] * .85], w = L * .3, tip = [p[0] + u[0] * L, p[1] + u[1] * L];
    const hook = [tip[0] - n[0] * L * .32 + tg[0] * L * .05, tip[1] - n[1] * L * .32 + tg[1] * L * .05];
    ink(ctx, [[p[0] - tg[0] * w, p[1] - tg[1] * w], [p[0] + u[0] * L * .55 - tg[0] * w * .5, p[1] + u[1] * L * .55 - tg[1] * w * .5], tip, hook,
      [p[0] + u[0] * L * .45 + tg[0] * w * .3 - n[0] * w * .2, p[1] + u[1] * L * .45 + tg[1] * w * .3 - n[1] * w * .2], [p[0] + tg[0] * w, p[1] + tg[1] * w]], { fill: INK.white, line: 4.5, boil: 1.4, seed });
  }
  function drawWave(ctx, t, C, R, curl, fall = 0) {
    const S = waveShape(R, curl), pv = [R * 1.4, R * 2.4];
    ctx.save(); ctx.translate(C[0], C[1]); ctx.translate(...pv); ctx.rotate(-.62 * fall); ctx.translate(-pv[0], -pv[1]);
    const P = ink(ctx, S.poly, { fill: INK.green, line: 7, boil: 1.4, seed: 21 });
    ctx.save(); clipPts(ctx, P);
    dotsIn(ctx, [-R * 1.5, -R * 1.2, R * 4.5, R * 3.2], { spacing: 16, color: rgba(INK.ink, .5), dir: [.6, .8], from: R * .1, to: R * 2.2, max: .95 });
    // diff rows down the wall: '+' gutters and code bars, like the stripes in the print
    for (let k = 0; k < 10; k++) { const y = R * .12 + k * R * .24; for (let x = -R * .6 + (k % 2) * R * .25; x < R * 4; x += R * .62) {
      fillPts(ctx, rect(x + R * .1, y - R * .035, R * (.22 + .2 * hash(k * 7 + x)), R * .07), rgba(INK.greenLt, .6), false); plusMarks(ctx, [[x, y, R * .05]], INK.white); } }
    ctx.restore();
    // stripes following the curl
    for (let j = 1; j <= 5; j++) { const pts = []; for (let f = 0; f <= .95; f += .03) pts.push(S.P(f, S.thick(f) * j / 6)); inkLine(ctx, boil(pts, 1.2, j), R * .032, j % 2 ? INK.greenLt : INK.white, { taper: [.05, .5] }); }
    // foam lip: white band, '+' halftone foam and the claws
    const lip = []; for (let f = .18; f <= 1.001; f += .02) lip.push(S.P(f, R * .035));
    inkLine(ctx, boil(lip, 1.5, 7), R * .12, INK.white, { taper: [.3, .05] });
    const marks = [];
    for (let f = .15; f <= 1; f += .022) for (let m = 0; m < 4; m++) { const p = S.P(f, R * (.1 + m * .07)); marks.push([p[0], p[1], R * .044 * (1 - m * .24) * (.4 + .6 * f)]); }
    for (let f = .1; f <= .95; f += .035) for (let m = 1; m < 4; m++) { const p = S.P(f, -R * m * .075), j = hash(f * 97 + m); marks.push([p[0] + (j - .5) * 24, p[1], R * .036 * (1 - m * .25) * j]); }
    plusMarks(ctx, marks, INK.white);
    for (const f of [.58, .67, .75, .82, .88, .93, .97]) {
      const p = S.P(f), q = S.P(f + .015), tl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, tg = [(q[0] - p[0]) / tl, (q[1] - p[1]) / tl], n = [-tg[1], tg[0]];
      claw(ctx, p, tg, n, R * .42 * (1.3 - f * .7) * (.8 + .4 * hash(f * 31)), f * 50);
    }
    ctx.restore();
  }
  const surfAt = (t, level, amp) => x => level + amp * (Math.sin(x * .006 + t * 9) * .6 + Math.sin(x * .015 - t * 15) * .4);
  function flood(ctx, t, level, amp, front = -400) {
    const surf = surfAt(twos(t), level, amp), top = []; for (let x = front; x <= 2320; x += 60) top.push([x, surf(x) + (x - front < 240 ? -(1 - (x - front) / 240) * 90 : 0)]);
    const poly = [[front - 40, 1700], [front - 30, surf(front) + 40], ...top, [2320, 1700]];
    fillPts(ctx, poly, INK.green, false);
    ctx.save(); clipPts(ctx, poly, false);
    dotsIn(ctx, [-100, level - 100, 2020, 1300], { spacing: 18, color: rgba(INK.ink, .35), dir: [0, 1], from: 0, to: 700, c: [960, level], max: .8 });
    for (let k = 0; k < 18; k++) { const y = level + 40 + k * 56, off = mod(-t * 2800 + k * 331, 700);
      for (let x = -700 + off; x < 2300; x += 700) { fillPts(ctx, rect(x + 30, y - 9, 220 + hash(k) * 260, 18), rgba(INK.greenLt, .6), false); plusMarks(ctx, [[x, y, 13]], INK.white); } }
    streaks(ctx, [0, level, 2200, 1100], { dir: [-1, 0], n: 50, len: 380, w: 5, color: rgba(INK.white, .8) });
    ctx.restore();
    inkLine(ctx, top, 20, INK.white, { taper: [0, 0] });
    const marks = []; for (let x = Math.max(-100, front); x < 2020; x += 34) for (let m = 0; m < 3; m++) marks.push([x + (m % 2) * 17, surf(x) + 22 + m * 26, 12 - m * 3.5]);
    plusMarks(ctx, marks, INK.white);
    outline(ctx, poly, 5, INK.ink, { smooth: false });
  }
  // the crash: a foam crown that bursts up off the impact and breaks into '+' spray
  function splash(ctx, t, x, y, a) {
    if (a >= .5) return;
    const g = easeOut(clamp(a / .12)), r = lerp(380, 520, g);
    sprite(ctx, c => {
      ink(c, burstPts(x, y - r * .35, r, 15, 7, .5).map(([px, py]) => [px, y - (y - py) * 1.25]), { fill: INK.white, line: 7, smooth: false, boil: 2.5 });
      ink(c, burstPts(x, y - r * .2, r * .55, 11, 9, .42), { fill: INK.greenLt, line: 5, smooth: false, boil: 2 });
    }, c => dotOut(c, [x - r - 80, y - r * 1.6, x + r + 80, y + 120], clamp((a - .06) / .2), 5, 22));
    const pts = []; for (let i = 0; i < 80; i++) { const an = D(-172 + hash(i) * 164), v = 600 + hash(i + 9) * 1700; pts.push([x + Math.cos(an) * v * a, y + Math.sin(an) * v * a + 2400 * a * a, 17 * (1 - a * 1.6) * (.5 + hash(i * 3))]); }
    plusMarks(ctx, pts, INK.white);
  }
  function forcePush(ctx, t) {
    const tc = twos(t), aE = ago(t, ENTER), aC = ago(t, CRASH);
    const out = aE < 0 ? 0 : expoOut(clamp(aE / .3));
    const z = lerp(1.5, 1, out) * (1 + .06 * smooth(seg(t, 49.7, CRASH)) - .05 * (aC > 0 ? Math.exp(-aC * 3) : 0));
    const rumble = aC < 0 ? 7 * seg(t, 49.6, CRASH) : 34 * Math.exp(-aC * 5);
    const [sx, sy] = shake(t, rumble), [dx, dy] = drift(t, 5, .5);
    const K = [960 + dx + sx, lerp(875, 545, out) + dy + sy, z, lerp(.015, -.008, out)];
    const drained = aC > .5;
    bg(ctx, K, c => moodWash(c, t, drained ? 'soak' : 'hope', 3));
    cam(ctx, ...K);
    // the great wave rises behind the page, the dev surfing its crest
    let surfer = null;
    if (aE > 0 && aC < .12) {
      const k = seg(t, ENTER, CRASH - .13), kc = seg(t, CRASH - .13, CRASH), sink = clamp(aC / .12), e = easeOut(k), R = lerp(240, 370, e);
      const C = [lerp(2500, 1300, e) - 180 * easeIn(kc) - 120 * sink, lerp(1150, 380, e) + 120 * easeIn(kc) + 420 * sink], curl = smooth(k) + .25 * kc;
      drawWave(ctx, t, C, R, curl, easeIn(kc) + .4 * sink);
      if (kc > 0 && aC < 0) streaks(ctx, [C[0] - R * 1.6, C[1] - R, C[0] + R * .5, C[1] + R], { dir: [-.6, .8], n: 22, len: 360, w: 7, color: rgba(INK.white, .9) });
      const S = waveShape(R, curl), p = S.P(.16), q = S.P(.2);
      if (aC < 0) surfer = [C[0] + p[0], C[1] + p[1] - R * .06, Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI, kc];
    }
    tree(ctx, t);
    // the PR page (the shore, small in the trough like Fuji) and the three comment-bunnies on it
    ctx.save(); ctx.translate(980, 1000); ctx.rotate(-.02); ctx.translate(-980, -1000);
    prPage(ctx, t, { x: 560, y: 740, w: 880, h: 600, seed: 5, tabs: { active: 0 }, header: { size: 44, stats: false } });
    ctx.restore();
    const B = [[690, 752], [930, 744], [1170, 738]];
    if (aC < 0) B.forEach(([x0, y0], i) => {
      const seen = t > 49.7, hp = hopArc(tc, 48.99 + i * .06, .3, 1.6), hp2 = hopArc(tc, 49.43 + i * .06, .3, 1.6), h = seen ? 0 : hp.h + hp2.h;
      commentBunny(ctx, x0, y0, 118, { hop: h * 2, sq: seen ? .05 * wob(tc, 6, i) : hp.sq + hp2.sq, eyes: seen ? 'wide' : 'happy', look: seen ? 1 : 0, rot: seen ? .04 * wob(tc, 5, i) : 0 });
    });
    if (surfer && surfer[3] < .6) { ctx.save(); ctx.translate(surfer[0], surfer[1]); ctx.rotate(surfer[2]); cursor(ctx, -30, -120, 130, { shades: true }); ctx.restore(); }
    // impact, flood, splash, then the bunnies tumbling away in the surge
    if (aC >= 0) {
      const level = kf(aC, [[0, 590], [.16, 620], [.55, 1180]], easeIn), front = lerp(700, -500, easeOut(clamp(aC / .16)));
      if (aC < .6) flood(ctx, t, level, lerp(45, 15, aC / .6), front);
      splash(ctx, t, 900, 640, aC < .05 ? 0 : twos(aC));
      if (aC < .8) B.forEach(([x0, y0], i) => {
        const a = twos(aC), x = x0 - 2400 * a - 1400 * a * a + 200 - i * 90, y = surfAt(twos(t), level, 40)(x) - 50 + wob(a, 3, i) * 40;
        commentBunny(ctx, x, y, 118 + 40 * i * a, { rot: -a * 9 - i, eyes: 'x', sq: .2 * wob(a, 4, i) });
      });
      if (drained) { // soaked page: puddles and '+' foam left behind
        ctx.save(); ctx.globalAlpha = .9; for (let i = 0; i < 5; i++) fillPts(ctx, blob(640 + i * 190, 840 + hash(i) * 160, 110 + hash(i + 2) * 50, i + 30, .3, 12, 36), rgba(INK.blue, .22)); ctx.restore();
        const m = []; for (let i = 0; i < 40; i++) m.push([580 + hash(i) * 840, 730 + hash(i + 50) * 330, 8 + hash(i + 7) * 8]); plusMarks(ctx, m, INK.white);
      }
    }
    // the rabbit clings to the branch
    const th = aC < 0 ? .04 * wob(tc, 2) : aC < .45 ? D(60) + .08 * wob(tc, 5) : D(60) * Math.exp(-(aC - .45) * 5) * Math.cos((aC - .45) * 10);
    const s = 26, flow = aC >= 0 && aC < .45, limp = aC >= .45;
    ctx.save(); ctx.translate(...GRIP); ctx.rotate(th);
    rabbit(ctx, 0, 8 * s, s, {
      armL: { a: 170, e: -8 }, armR: { a: 172, e: -6 }, pawL: 'fist', pawR: 'fist', noShadow: true, bags: BAGS, legs: 'stand', step: aC < 0 ? .3 + .3 * wob(tc, 3) : .1,
      eyes: flow ? 'closed' : aC < 0 && t > 50.05 ? 'closed' : 'wide', lids: limp ? .5 : 0, lx: aC < 0 ? .9 : 0, mouth: flow ? 'wavy' : limp ? 'flat' : 'o',
      sense: aC < 0 && t > 49.5 ? 1 : 0, sweat: aC < 0 ? .7 : 0, browTilt: -2,
      earL: flow ? { a: -110, b: -30 } : limp ? { a: -150, b: -10 } : { a: -34, b: -20 * wob(tc, 3) }, earR: flow ? { a: -95, b: -40 } : limp ? { a: 150, b: 10 } : { a: 30, b: 20 * wob(tc, 3, .3) },
    });
    ctx.restore();
    if (limp) { drops(ctx, t, GRIP[0], GRIP[1] + 230, 3, 200, 1); drops(ctx, t, GRIP[0] - 40, GRIP[1] + 40, 2, 120, 4); }
    if (flow) { ctx.save(); ctx.globalAlpha = .9; streaks(ctx, [200, 380, 1400, 700], { dir: [-1, 0], n: 18, len: 420, w: 6, color: INK.white }); ctx.restore(); }
    // terminal strip + the cursor typing (drops away once the wave rises)
    const drop = easeIn(seg(t, 49.55, 49.85)) * 520;
    if (drop < 500) {
      const lines = aE < 0 ? [['$ git push --force', INK.white]] : [['$ git push --force', INK.white], ['+ a1b2c3...d4e5f6 (forced update)', INK.yellow]];
      terminal(ctx, 360, 770 + drop, 1200, 240, t, { lines, size: 52, cps: aE < 0 ? 30 : 0, t0: 48.78 - 2 / 30, title: 'zsh \u2014 fix/small-fix' });
      const keyT = Math.floor((t - 48.78) * 30), peck = aE < 0 && t > 48.78 && t < 49.35 ? .35 * (keyT % 2) : 0;
      const ck = aE >= 0 ? clamp(aE / .3) : 0, cx = 1180 + (aE < 0 ? 12 * frac((t - 48.78) * 6) : 0), cy = 890 + drop + peck * 10;
      cursor(ctx, cx, cy, 120, { click: aE >= 0 && aE < .3 ? ck : peck * .5 });
    }
    ctx.restore();
    if (aC >= 0 && aC < .15) misregFrame(ctx, 18 * (1 - aC / .15));
  }

  // ======================================================================================================
  // 3 · 50.95 "Whole review gone,": the soaked page. Outdated comments glitch out; the force-push event remains.
  function forceEvent(ctx, x, y, k) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(lerp(.8, 1, backOut(k)), lerp(.8, 1, backOut(k))); ctx.globalAlpha *= clamp(k * 3);
    inkLine(ctx, [[0, -140], [0, 140]], 6, '#CFC8BA', { taper: [0, 0], smooth: false });
    ink(ctx, ell(0, 0, 36, 36, 20), { fill: '#E4DED0', line: 4, boil: .5 });
    inkLine(ctx, [[0, 16], [0, -14]], 6, INK.ink, { taper: [0, 0], smooth: false }); inkLine(ctx, [[-11, -2], [0, -16], [11, -2]], 6, INK.ink, { taper: [0, 0], smooth: false }); inkLine(ctx, [[-13, 20], [13, 20]], 5, INK.ink, { taper: [0, 0], smooth: false });
    const f = { font: 'ui', size: 44 }, segs = [['you', 800, INK.ink], [' force-pushed the branch from ', 500, '#4A4658'], ['a1b2c3', 0], [' to ', 500, '#4A4658'], ['d4e5f6', 0]];
    let xx = 66;
    for (const [s, w, c] of segs) {
      if (!w) { const pw = pill(ctx, xx + 4, -2, s, { fill: '#E4DED0', color: INK.ink, font: 'mono', weight: 700, size: 36, line: 0 }); xx += pw + 8; continue; }
      txt(ctx, s, xx, 15, { ...f, weight: w, color: c }); xx += measure(ctx, s, { ...f, weight: w }).w;
    }
    ctx.restore();
  }
  function gone(ctx, t, lt, dur) {
    const tc = twos(t), p = lt / dur, [dx, dy] = drift(t, 6, .5);
    const K = [960 + 40 * easeInOut(p) + dx, 560 + dy, 1.0 + .06 * easeInOut(p), -.008];
    bg(ctx, K, c => moodWash(c, t, 'soak', 4));
    cam(ctx, ...K);
    ctx.save(); ctx.translate(960, 700); ctx.rotate(-.012); ctx.translate(-960, -700);
    fillPts(ctx, rrect(74, 312, 1800, 900, 18), INK.ink, false);
    const page = rrect(60, 296, 1800, 900, 18);
    ink(ctx, page, { fill: mix(INK.white, INK.blue, .06), line: 5, smooth: false, boil: .6 });
    ctx.save(); clipPts(ctx, page, false);
    for (let i = 0; i < 7; i++) fillPts(ctx, blob(260 + i * 250, 700 + hash(i) * 320, 130 + hash(i + 2) * 90, i + 40, .3, 12, 50 + hash(i + 3) * 40), rgba(INK.blue, .14));
    const m = []; for (let i = 0; i < 40; i++) m.push([120 + hash(i) * 1700, 520 + hash(i + 50) * 600, 7 + hash(i + 7) * 7]); plusMarks(ctx, m, rgba(INK.blue, .35));
    ctx.restore();
    forceEvent(ctx, 150, 400, seg(t, 50.99, 51.2));
    ctx.restore();
    // three outdated bunnies: two glitch out on the beats, the rabbit reaches the last one
    const S = 175, gl = [[1610, 880, 51.107], [1230, 860, 51.525]];
    gl.forEach(([x, y, T], i) => {
      const g = seg(t, T - .04, T + .42); if (g >= 1) return;
      const bun = c => commentBunny(c, x, y, S, { state: 'outdated', eyes: 'sad', rot: .06 * (i ? 1 : -1), sq: .04 * wob(tc, 2, i) });
      if (g <= 0) { bun(ctx); return; }
      const box = screenBox(ctx, x - S * .7, y - S * 1.45, x + S * .7, y + S * .15);
      sprite(ctx, bun, c => {
        glitch(c, t, .4 + .5 * g, i + 3);
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-in'; c.fillRect(box[0] - 60, box[1], box[2] - box[0] + 120, box[3] - box[1]); c.restore();
        dotOut(c, box, easeIn(clamp((g - .25) / .75)), i * 9, 16);
      });
    });
    const reach = smooth(seg(t, 51.75, 52.35));
    commentBunny(ctx, 860 - 50 * reach, 870, S, { state: 'outdated', eyes: 'sad', look: -reach, rot: -.05 });
    // the rabbit, soaked, reaching out
    const s = 44, step = twos(seg(t, 51.7, 52.3));
    const A = rabbit(ctx, 330 + 70 * step, 1060, s, {
      turn: .45, lean: 8 + 8 * reach, bags: BAGS, eyes: 'open', lx: .8, ly: .25, browTilt: -2.2, brows: .2, mouth: t > 51.9 ? 'o' : 'frown',
      armR: { a: lerp(40, 92, reach), e: lerp(40, -8, reach) }, pawR: reach > .3 ? 'open' : 'mitt', armL: { a: 12, e: 18 },
      earL: { a: -48, b: -55 }, earR: { a: 52, b: 62 + 6 * wob(tc, 1.5) },
    });
    drops(ctx, t, A.earL[0], A.earL[1], 2, 260, 7); drops(ctx, t, A.earR[0], A.earR[1], 2, 300, 9); drops(ctx, t, A.chest[0], A.chest[1] + 60, 2, 140, 11);
    ctx.restore();
  }

  // ======================================================================================================
  // 4 · 52.55 "never had a chance": alone on the wet page in deep-blue ink rain; the last bunny fades in its paws.
  function rain(ctx, t, lt, dur) {
    const tc = twos(t), p = lt / dur, [dx, dy] = drift(t, 5, .4);
    const K = [860 + dx, 620 + dy + 20 * p, 1.0 + .1 * easeInOut(p), 0];
    bg(ctx, K, c => { moodWash(c, t, 'deep', 5, { c: [880, 560], r: [700, 470] }); }, 6, .5);
    cam(ctx, ...K);
    // wet floor with a pale puddle under it
    fillPts(ctx, [[-300, 1000], [2300, 985], [2300, 1500], [-300, 1500]], mix(INK.white, INK.blue, .12), false);
    ctx.save(); ctx.globalAlpha = .9; fillPts(ctx, blob(860, 1050, 460, 5, .2, 16, 60), mix(INK.blue, INK.white, .55)); ctx.restore();
    outline(ctx, [[-300, 1000], [2300, 985], [2300, 1500], [-300, 1500]], 5, INK.ink, { smooth: false });
    const fade = seg(t, 53.1, 53.64), gone = ago(t, 53.64) > 0;
    const fold = backOut(seg(t, 52.9, 53.02), 2), droop = smooth(seg(t, 53.6, 53.85));
    const lids = Math.max(lerp(.3, .45, droop), blink(t, [52.62, 54.0], .14));
    const s = 66, gx = 860, gy = 1160, hug = { a: 5, e: -135 };
    const pose = {
      sit: 1, bags: BAGS, eyes: 'open', lids, ly: .8, lx: -.05, browTilt: -2.5, mouth: 'flat', turn: .05, noShadow: true,
      armL: hug, armR: hug, pawL: 'mitt', pawR: 'mitt',
      earL: { a: lerp(-24, -62, droop), b: lerp(-18, -70, droop) }, earR: { a: lerp(18, 40, fold), b: lerp(10, 118, fold) },
    };
    const A = rabbit(ctx, gx, gy, s, pose);
    // the last outdated bunny, cradled, fading to halftone dots
    const bs = 180, bx = (A.pawL[0] + A.pawR[0]) / 2, by = (A.pawL[1] + A.pawR[1]) / 2 + bs * .3;
    if (!gone) sprite(ctx, c => commentBunny(c, bx, by, bs, { state: 'outdated', eyes: 'sad', look: .2, rot: -.05 }), c => dotOut(c, screenBox(ctx, bx - bs * .7, by - bs * 1.4, bx + bs * .7, by + bs * .15), fade, 3, 12));
    else { const a = ago(t, 53.64); ctx.save(); ctx.globalAlpha = clamp(1 - a / .5); ctx.beginPath(); for (let i = 0; i < 14; i++) { const x = bx + (hash(i) - .5) * 200, y = by - 80 - a * (80 + hash(i + 3) * 180), r = 6 + hash(i + 5) * 6; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } ctx.fillStyle = '#8A8496'; ctx.fill(); ctx.restore(); }
    // the paws again, over the bunny, so it sits in them
    for (const q of [A.pawL, A.pawR]) ink(ctx, ell(q[0], q[1], s * .52, s * .48, 16), { fill: INK.fur, shade: { color: INK.furShade, spacing: 10, dir: [.5, .85], from: -5, to: 30 }, line: 5 });
    ctx.restore();
    // ink-streak rain, in screen space, kept off the caption (top right)
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(1840, 60, -900, 260); ctx.clip('evenodd');
    streaks(ctx, [-100, -200, 2100, 1150], { dir: [-.24, .97], n: 70, len: 260, w: 3.2, color: rgba(INK.night, .75), seed: 3 });
    streaks(ctx, [-100, -200, 2100, 1150], { dir: [-.24, .97], n: 24, len: 180, w: 2.4, color: rgba(INK.white, .7), seed: 8 });
    ctx.restore();
  }

  // ======================================================================================================
  // 5 · 54.20 "You said 'it's never null'": the dev's reply card; the cursor sprouts a crown on "null".
  const NULL_T = 55.20;
  function replyCard(ctx, x, y, sc, t, k) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc * lerp(.6, 1, backOut(k, 2.4)), sc * lerp(.6, 1, backOut(k, 2.4))); ctx.rotate(-.015); ctx.globalAlpha *= clamp(k * 4);
    commentCard(ctx, 0, 0, 580, t, { author: 'you', kind: 'you', time: 'just now', body: ["it's never null"], buttons: false, size: 32 });
    const bw = measure(ctx, "it's never null", { font: 'ui', weight: 600, size: 32 }).w;
    ctx.translate(84 + bw + 36, 103); crownOn(ctx, 72, 1);
    ctx.restore();
  }
  function neverNull(ctx, t, lt, dur) {
    const tc = twos(t), p = lt / dur, nk = kick(t, NULL_T, 7), [dx, dy] = drift(t, 6, .5);
    const K = [960 + dx, 520 + dy, 1.0 + .06 * easeOut(p) + .05 * nk, -.01 * nk];
    bg(ctx, K, c => moodWash(c, t, 'hurt', 7));
    cam(ctx, ...K);
    const slam = seg(t, 54.46, 54.62), sk = kick(t, 54.52, 14);
    replyCard(ctx, 250 + shake(t, 12 * sk)[0], 170, 2.4, t, slam);
    // the cursor swaggers in and grows a crown on "null"
    const cin = expoOut(seg(t, 54.3, 54.62)), ck = ago(t, NULL_T);
    const cx = lerp(2100, 1500, cin) + 10 * wob(tc, .8), cy = lerp(-100, 330, cin) + 8 * wob(tc, 1.2), rot = -.08 + .06 * wob(tc, .7) - .1 * kick(t, NULL_T, 6);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    cursor(ctx, 0, 0, 240, { crown: ck > .2 });
    if (ck >= 0 && ck <= .2) crownOn(ctx, 240, backOut(clamp(ck / .16), 3.2));
    ctx.restore();
    if (ck >= 0 && ck < .7) for (let i = 0; i < 5; i++) { const a = D(-170 + i * 38), d = 110 + ck * 240; sparkle(ctx, cx + 30 + Math.cos(a) * d, cy - 30 + Math.sin(a) * d, 30 * (1 - ck / .7) + 8, ck * 4 + i, INK.yellow); }
    // the rabbit peeks up from the bottom corner
    const fold = backOut(seg(t, NULL_T + .05, NULL_T + .2), 2);
    rabbit(ctx, 1600, 1330, 54, { bags: BAGS, lx: -.75, ly: -.85, lids: Math.max(.42, blink(t, [54.9], .12)), mouth: 'flat', turn: -.15, earL: { a: -18, b: -20 }, earR: { a: 22, b: lerp(8, 100, fold) } });
    ctx.restore();
  }

  // ======================================================================================================
  // 6 · 55.62 "like you're the king": throne, bowing bots, "Actually—" gets a hand over the mouth. Flash-forward insert.
  const KING = 56.80, HUSH = 56.40;
  function throne(ctx, t) {
    const gold = { fill: INK.yellow, shade: { color: INK.orange, spacing: 13, dir: [.55, .83], from: -40, to: 300 }, line: 6 };
    ink(ctx, [[470, 800], [470, 360], [520, 250], [590, 310], [640, 170], [690, 310], [760, 250], [810, 360], [810, 800]], { ...gold, smooth: false, seed: 1 });
    ink(ctx, rrect(510, 330, 260, 420, 30), { fill: mix(INK.pink, INK.ink, .15), shade: { color: INK.ink, spacing: 12, dir: [.6, .8], from: 0, to: 300, max: .6 }, line: 5, smooth: false });
    ink(ctx, ell(640, 238, 28, 28, 16), { fill: INK.pink, line: 4 });
    for (const x of [450, 800]) ink(ctx, rect(x, 760, 32, 250), { fill: INK.orange, line: 5, smooth: false });
    ink(ctx, rrect(420, 700, 440, 100, 18), { ...gold, smooth: false, seed: 2 });
    ink(ctx, rrect(446, 664, 388, 60, 28), { fill: INK.pink, shade: { color: mix(INK.pink, INK.ink, .4), spacing: 11, dir: [0, 1], from: 0, to: 40 }, line: 5, smooth: false });
    for (const x of [392, 828]) { ink(ctx, rrect(x, 560, 60, 170, 16), { ...gold, smooth: false, seed: x }); ink(ctx, ell(x + 30, 556, 38, 34, 16), { ...gold, seed: x + 1 }); }
    // steps
    for (let i = 0; i < 3; i++) ink(ctx, rect(330 - i * 60, 1000 + i * 50, 620 + i * 120, 50), { fill: i % 2 ? mix(INK.pink, INK.ink, .15) : INK.pink, line: 5, smooth: false, seed: 9 + i });
  }
  function typeErrorInsert(ctx, t) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    fillPts(ctx, rect(0, 0, W, H), mix(INK.red, INK.white, .82), false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 26, color: rgba(INK.red, .35), dir: [0, 1], from: 0, to: H });
    const j = shake(t, 6);
    ctx.translate(j[0], j[1]); ctx.rotate(-.02);
    fillPts(ctx, rect(80, 330, 1760, 360), INK.ink, false); fillPts(ctx, rect(60, 310, 1760, 360), INK.white, false); outline(ctx, rect(60, 310, 1760, 360), 6, INK.ink, { smooth: false });
    fillPts(ctx, rect(66, 316, 1748, 348), mix(INK.red, INK.white, .88), false);
    ink(ctx, ell(150, 420, 38, 38, 18), { fill: INK.red, line: 5 }); txt(ctx, '\u00D7', 150, 440, { font: 'ui', weight: 900, size: 64, color: INK.white, align: 'center' });
    txt(ctx, 'TypeError: Cannot read properties', 220, 445, { font: 'mono', weight: 800, size: 70, color: INK.red });
    txt(ctx, "of null (reading 'id')", 220, 545, { font: 'mono', weight: 800, size: 70, color: INK.red });
    txt(ctx, 'at Profile (profile.tsx:42)', 220, 625, { font: 'mono', weight: 700, size: 40, color: INK.redDk });
    ink(ctx, rect(60, 170, 520, 96), { fill: INK.ink, line: 0, smooth: false });
    txt(ctx, '\u25B6\u25B6 SAT 03:00 AM', 90, 236, { font: 'mono', weight: 800, size: 50, color: INK.white });
    ctx.restore();
    misregFrame(ctx, 10);
  }
  function king(ctx, t, lt, dur) {
    const tc = twos(t), p = lt / dur, kk = kick(t, KING, 6), [dx, dy] = drift(t, 6, .5);
    const K = [990 - 50 * easeInOut(p) + dx, 540 + dy, 1.02 + .05 * p + .05 * kk, .01 * kk];
    bg(ctx, K, c => {
      moodWash(c, t, 'hurt', 8, { c: [1100, 560] });
      c.save(); clipPts(c, blob(640, 460, 560, 12, .14, 18, 480)); sunburst(c, 640, 400, INK.yellow, mix(INK.yellow, INK.orange, .4), t * .15, 16, 1400);
      dotsIn(c, [0, 0, 1400, 1100], { spacing: 26, color: rgba(INK.orange, .4), dir: [0, 1], from: 0, to: 900 }); c.restore();
      outline(c, blob(640, 460, 560, 12, .14, 18, 480).map(([x, y]) => [x + 8, y + 10]), 14, INK.orange);
    });
    cam(ctx, ...K);
    throne(ctx, t);
    ctx.save(); ctx.translate(560, 330); ctx.rotate(-.2 + .03 * wob(tc, .5));
    cursor(ctx, 0, 0, 300, { crown: true });
    if (kk > .05) sparkle(ctx, 70, -120, 40 * kk + 8, t * 3, INK.white);
    ctx.restore();
    // bowing bots, in unison on the beats, deepest on "king"
    const beats = [55.751, 56.192, 56.61, 57.028], bowAt = i => { let v = 0; for (const b of beats) { const d = tc - (b - VLEAD) + i * .04; if (d > -.12 && d < .45) v = Math.max(v, d < 0 ? 1 + d / .12 : Math.exp(-d * 5)); } return v; };
    const BOTS = [[1000, 900, 84], [1190, 900, 84], [1380, 900, 84], [1130, 1030, 140], [1370, 1030, 140], [1600, 1030, 140]];
    BOTS.forEach(([x, y, s], i) => {
      const hush = i === 5 && t > HUSH - .1, deep = on(t, KING) ? 1.3 * kick(t, KING, 3) : 0, a = hush ? D(10) : -D(8 + 34 * Math.max(bowAt(i % 3), deep));
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); agentBot(ctx, 0, -s * .4, s, { bob: 0 }); ctx.restore();
    });
    // the pile-up: the same bubble, again and again, stacking up the frame
    [[1200, 700, 55.70], [1330, 600, 56.14], [1180, 500, 56.56], [1350, 400, 56.78]].forEach(([x, y, T], i) => {
      const k = seg(t, T - VLEAD, T - VLEAD + .1); if (k <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.rotate((hash(i + 4) - .5) * .1); ctx.scale(backOut(k, 2.5), backOut(k, 2.5)); bubble(ctx, 0, 0, "You're absolutely right!", { size: 42 }); ctx.restore();
    });
    // the rabbit in the corner: "Actually—", and a bot's hand
    const raise = backOut(seg(t, 55.98, 56.1), 2), hushK = seg(t, HUSH - .06, HUSH), hushed = hushK > 0;
    const R = rabbit(ctx, 1760, 1040, 34, {
      turn: -.4, bags: BAGS, armR: { a: lerp(10, 168, hushed ? lerp(1, .6, hushK) : raise), e: -8 }, pawR: 'open', mouth: hushed ? 'flat' : raise > .2 ? 'open' : 'flat', open: .5,
      eyes: hushed && t < 56.72 ? 'wide' : 'open', lids: t > 56.72 ? .5 : 0, lx: -.6, brows: raise > .2 ? .3 : 0, earL: { a: -18, b: hushed ? -30 : 0 }, earR: { a: 16, b: hushed ? 40 : 0 },
    });
    if (raise > .05) { ctx.save(); ctx.translate(1690, 560); const q = raise * (hushed ? lerp(1, .75, hushK) : 1); ctx.scale(q, q); ctx.rotate(hushed ? .12 : 0); bubble(ctx, 0, 0, hushed ? 'Actu\u2014' : 'Actually\u2014', { size: 42 }); ctx.restore(); }
    if (hushed) {
      const b = [1600 + 60, 1030 - 120], m = R.mouth, hk = backOut(hushK, 2);
      const hx = lerp(b[0], m[0], hk), hy = lerp(b[1], m[1] - 8, hk);
      inkLine(ctx, [b, [lerp(b[0], hx, .5), lerp(b[1], hy, .5) - 40], [hx, hy]], 13, INK.ink, { taper: [0, 0] });
      ink(ctx, ell(hx, hy, 36, 32, 14), { fill: INK.white, line: 6 });
    }
    ctx.restore();
    if (t >= 56.99 && t < 57.11) typeErrorInsert(ctx, t);
  }
  const on = (t, T) => ago(t, T) >= -1e-6;

  // ======================================================================================================
  // 7-8 · 57.30 "I drew a diagram," / 58.95 "you didn't read a thing": the easel, the unveil, the scroll past.
  const UNVEIL = 58.06, BOARD = [860, 190, 920, 700];
  function diagram(ctx, t, arrows) {
    const [bx, by] = BOARD, X = [1020, 1320, 1620], f = { font: 'ui', weight: 800, size: 38 };
    ctx.save(); ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.strokeStyle = INK.ink; ctx.beginPath(); for (const x of X) { ctx.moveTo(x, by + 140); ctx.lineTo(x, by + 650); } ctx.stroke(); ctx.restore();
    ['Client', 'API', 'DB'].forEach((s, i) => { ink(ctx, rrect(X[i] - 115, by + 50, 230, 88, 12), { fill: mix(INK.yellow, INK.white, .55), line: 5, smooth: false, boil: .6 }); txt(ctx, s, X[i], by + 108, { ...f, align: 'center' }); });
    const M = [[0, 1, 'GET /user/42', 0], [1, 2, 'SELECT user', 0], [2, 1, 'null', 1], [1, 0, '200 OK \u2713', 1]];
    M.forEach(([a, b, s, ret], i) => {
      const k = clamp(arrows * 4 - i); if (k <= 0) return;
      const y = by + 230 + i * 100, x0 = X[a], x1 = lerp(X[a], X[b], easeOut(k)), dirn = Math.sign(X[b] - X[a]);
      ctx.save(); if (ret) ctx.setLineDash([14, 10]); ctx.lineWidth = 5; ctx.strokeStyle = i === 2 ? INK.red : INK.ink; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
      fillPts(ctx, [[x1, y], [x1 - dirn * 24, y - 13], [x1 - dirn * 24, y + 13]], i === 2 ? INK.red : INK.ink, false);
      if (k > .6) txt(ctx, s, (x0 + X[b]) / 2, y - 16, { font: 'ui', weight: 700, size: 32, align: 'center', color: i === 2 ? INK.red : INK.ink });
    });
    const nk = clamp(arrows * 4 - 3.4); if (nk > 0) {
      ctx.save(); ctx.translate(1470, by + 610); ctx.rotate(-.05); ctx.scale(backOut(nk, 2.6), backOut(nk, 2.6));
      fillPts(ctx, rect(-128, -44, 256, 88), INK.ink, false); ink(ctx, rect(-136, -52, 256, 88), { fill: INK.red, line: 4, smooth: false });
      txt(ctx, 'null?', -8, 6, { font: 'hand', weight: 800, size: 44, color: INK.white, align: 'center', base: 'middle' }); ctx.restore();
      ctx.save(); ctx.globalAlpha = nk; inkLine(ctx, [[1395, by + 548], [1370, by + 480], [1420, by + 454]], 5, INK.red, { taper: [.1, .3] }); ctx.restore();
    }
  }
  function easel(ctx, t, o) {
    const [bx, by, bw, bh] = BOARD, wood = mix(INK.orangeDk, INK.ink, .35);
    for (const [x0, x1] of [[bx + 120, bx + 40], [bx + bw - 120, bx + bw - 40]]) ink(ctx, limb([[x0, by - 40], [x1, 1120]], () => 30, 4), { fill: wood, line: 5, smooth: false });
    ink(ctx, limb([[bx + bw / 2, by - 70], [bx + bw / 2, 1120]], () => 26, 4), { fill: mix(wood, INK.ink, .3), line: 5, smooth: false });
    fillPts(ctx, rect(bx + 16, by + 18, bw, bh), INK.ink, false);
    const board = rect(bx, by, bw, bh);
    ink(ctx, board, { fill: INK.white, line: 6, smooth: false, boil: .8 });
    ctx.save(); clipPts(ctx, board, false);
    const sc = o.scroll || 0;
    if (sc < 1) {
      if (sc > 0) { // scrolled past: the diagram smears upward into speed lines (multiples, never blur)
        const off = -easeIn(sc) * 1400;
        for (let g = 3; g >= 0; g--) { ctx.save(); ctx.globalAlpha = g ? .22 : 1; ctx.translate(0, off + g * 90 * (1 - sc) + g * 40); diagram(ctx, t, 1); ctx.restore(); }
      } else diagram(ctx, t, o.arrows ?? 1);
    }
    if (o.smear > 0) { ctx.save(); ctx.globalAlpha = o.smear; streaks(ctx, [bx, by, bx + bw, by + bh + 400], { dir: [0, -1], n: 36, len: 520, w: 9, color: INK.ink, seed: 2 }); streaks(ctx, [bx, by, bx + bw, by + bh + 400], { dir: [0, -1], n: 14, len: 400, w: 7, color: INK.red, seed: 5 }); ctx.restore(); }
    ctx.restore();
    ink(ctx, rect(bx - 30, by + bh - 6, bw + 60, 34), { fill: wood, line: 5, smooth: false });
    // the drape
    const dk = o.drape ?? 0;
    if (dk < 1) {
      const e = dk, ox = -e * 1500, oy = -e * 420, sx = 1 + e * .8;
      ctx.save(); ctx.translate(bx + bw / 2 + ox, by + oy); ctx.rotate(-e * .6); ctx.scale(sx, 1 - e * .35);
      const sway = wob(twos(t), .9) * 10, cloth = [[-bw / 2 - 40, -20], [bw / 2 + 40, -20], [bw / 2 + 60 + sway, bh + 40], [bw / 4, bh + 10], [0, bh + 50], [-bw / 4, bh + 12], [-bw / 2 - 60 + sway, bh + 40]];
      ink(ctx, cloth, { fill: INK.orange, shade: { color: INK.orangeDk, spacing: 13, dir: [.4, .9], from: 0, to: bh }, line: 6, seed: 6 });
      for (let i = -3; i <= 3; i++) inkLine(ctx, [[i * 120, 20], [i * 130 + sway, bh * .6], [i * 140 + sway * 1.5, bh]], 4, INK.orangeDk, { taper: [.2, .4] });
      ctx.restore();
      if (dk > 0) streaks(ctx, [bx - 600, by - 300, bx + bw, by + bh], { dir: [-.95, -.3], n: 30, len: 500, w: 7, color: rgba(INK.orangeDk, .8 * (1 - dk)) });
    }
  }
  function drawDiagram(ctx, t, lt, dur) {
    const tc = twos(t), uk = kick(t, UNVEIL, 6), p = lt / dur, [dx, dy] = drift(t, 6, .5), au = ago(t, UNVEIL);
    const K = [1000 + dx, 560 + dy, 1.0 + .05 * easeInOut(p) + .05 * uk, 0];
    bg(ctx, K, c => moodWash(c, t, 'hope', 9, { c: [1100, 540] }));
    cam(ctx, ...K);
    easel(ctx, t, { drape: au < 0 ? 0 : expoOut(clamp(au / .14)) * .96 + (au >= .14 ? .04 : 0), arrows: seg(t, 58.14, 58.85) });
    if (au >= 0 && au < 1.2) for (let i = 0; i < 6; i++) { const k = backOut(clamp((au - i * .07) / .14), 3) * (1 - clamp((au - .6 - i * .05) / .3)); if (k > .02) sparkle(ctx, [900, 1760, 1830, 820, 1300, 1700][i], [170, 150, 600, 820, 110, 930][i], 38 * k, tc * 2 + i, i % 2 ? INK.yellow : INK.white); }
    // the rabbit yanks the cord, then presents, proud
    const crouch = seg(t, 57.84, UNVEIL - .05), yank = au >= 0, pr = smooth(seg(t, UNVEIL + .1, UNVEIL + .35));
    const cord = [700, 250];
    const A = rabbit(ctx, 600, 1010, 38, {
      turn: .4, bags: BAGS, sq: yank ? .25 * Math.exp(-au * 10) * Math.cos(au * 30) : .22 * crouch, lean: yank ? lerp(-14, -6, pr) : 6 * crouch,
      armR: yank ? { a: lerp(40, 105, pr), e: lerp(10, -25, pr) } : { a: 150 - 10 * crouch, e: 10 }, pawR: yank ? 'open' : 'fist', armL: { a: 20, e: 30 },
      eyes: yank ? (au < .5 ? 'star' : 'happy') : 'open', lx: .6, ly: -.3, mouth: yank ? 'grin' : 'smile', blush: yank ? .7 : .2,
      earL: { a: -10, b: yank ? -10 * Math.exp(-au * 6) * Math.cos(au * 25) : 0 }, earR: { a: 10, b: yank ? 14 * Math.exp(-au * 6) * Math.cos(au * 25) : 0 },
    });
    if (!yank) inkLine(ctx, [cord, [lerp(cord[0], A.pawR[0], .5) + 20, lerp(cord[1], A.pawR[1], .5) + 30], A.pawR], 5, INK.ink, { taper: [0, 0] });
    ctx.restore();
  }
  function scrollPast(ctx, t, lt, dur) {
    const tc = twos(t), [dx, dy] = drift(t, 6, .5), SC = 59.30, as = ago(t, SC), p = lt / dur;
    const K = [1000 + dx, 560 + dy, 1.05 + .03 * p, 0];
    const blue = smooth(seg(t, 59.9, 60.6));
    bg(ctx, K, c => { moodWash(c, t, 'hope', 9, { c: [1100, 540] }); if (blue > 0) moodWash(c, t, 'hurt', 10, { k: blue, at: [1320, 520], c: [1050, 540] }); });
    cam(ctx, ...K);
    const sc = seg(t, SC, SC + .22);
    easel(ctx, t, { drape: 1, scroll: sc, smear: sc > 0 ? clamp(1 - (t - SC - .1) / .5) : 0 });
    // "Seen by 0"
    const sk = seg(t, 59.84, 59.98);
    if (sk > 0) { ctx.save(); ctx.translate(1560, 950); ctx.rotate(-.03); ctx.scale(backOut(sk, 2.6), backOut(sk, 2.6));
      fillPts(ctx, rrect(-222, -42, 460, 100, 50), INK.ink, false);
      ink(ctx, rrect(-230, -50, 460, 100, 50), { fill: INK.white, line: 5, smooth: false, boil: .5 });
      ink(ctx, ell(-160, 0, 32, 20, 16), { fill: INK.white, line: 5, boil: .3 }); fillPts(ctx, ell(-160, 0, 11, 11, 10), INK.ink);
      txt(ctx, 'Seen by 0', 30, 19, { font: 'ui', weight: 800, size: 54, align: 'center', color: INK.ink }); ctx.restore(); }
    // rabbit: pride deflates through a blink into deadpan; ears fold on "read" and "thing"
    const f1 = backOut(seg(t, 59.84, 59.98), 2), f2 = backOut(seg(t, 60.38, 60.52), 2), low = smooth(seg(t, 60.0, 60.7));
    const lids = Math.max(t > 59.62 ? .5 : 0, blink(t, [59.6], .1));
    rabbit(ctx, 600, 1010, 38, {
      turn: .4, bags: BAGS, lean: lerp(-6, 2, low), armR: { a: lerp(105, 16, low), e: lerp(-25, 10, low) }, pawR: 'open', armL: { a: 20, e: 30 },
      eyes: t < 59.3 ? 'happy' : 'open', lids, lx: as > 0 && as < .4 ? .5 : .7, ly: as > 0 && as < .35 ? .9 : 0, mouth: t < 59.5 ? 'grin' : 'flat', blush: lerp(.7, 0, seg(t, 59.3, 59.7)),
      earL: { a: lerp(-10, -40, f2), b: lerp(0, -105, f2) }, earR: { a: lerp(10, 26, f1), b: lerp(0, 110, f1) },
    });
    // the cursor scrolls straight past
    const ce = seg(t, 59.0, 59.2), cs = seg(t, SC, SC + .3);
    if (ce > 0 && cs < 1) {
      const cx = lerp(lerp(2050, 1500, easeOut(ce)), 1150, easeIn(cs)), cy = lerp(lerp(-120, 250, easeOut(ce)), 1450, easeIn(cs));
      if (cs > 0) streaks(ctx, [cx - 100, cy - 700, cx + 250, cy], { dir: [-.25, .97], n: 16, len: 520, w: 8, color: INK.pink });
      cursor(ctx, cx, cy, 190, { rot: cs > 0 ? .3 : 0 });
    }
    ctx.restore();
  }

  // ======================================================================================================
  // 9-10 · 60.95 "You typed 'CodeRabbit, pause,'" / 62.95 "like I'm to blame": the comment box, then the freeze.
  const CMD = '@coderabbitai pause', CLICK = 62.60, REPLY = 62.74;
  const nTyped = t => t < 61.2 ? 0 : t < 61.95 ? Math.floor(seg(t, 61.2, 61.95) * 13 + 1e-6) : t < 62.0 ? 13 : Math.min(19, 13 + Math.floor(seg(t, 62.0, 62.22) * 6 + 1e-6));
  function laptop(ctx, x, y, grey) {
    const lid = grey ? mix(INK.ink, INK.paper, .35) : INK.nightLt, base = grey ? mix(INK.ink, INK.paper, .6) : mix(INK.nightLt, INK.paper, .45);
    ink(ctx, [[x - 120, y], [x + 120, y], [x + 140, y + 30], [x - 140, y + 30]], { fill: base, line: 5, smooth: false, boil: .6 });
    ink(ctx, [[x - 112, y + 4], [x + 112, y + 4], [x + 104, y - 118], [x - 104, y - 118]], { fill: lid, shade: { color: rgba(INK.ink, .5), spacing: 12, dir: [.6, .8], from: 0, to: 140 }, line: 5, smooth: false, boil: .6 });
    ink(ctx, [[x - 8, y - 80], [x + 22, y - 44], [x + 6, y - 34], [x - 18, y - 70]], { fill: grey ? mix(INK.ink, INK.paper, .7) : INK.orange, line: 3, smooth: false, boil: .4 }); // carrot sticker
    fillPts(ctx, [[x - 14, y - 84], [x - 4, y - 100], [x - 2, y - 82]], grey ? mix(INK.ink, INK.paper, .5) : INK.green, false);
  }
  function pauseScene(ctx, T, o = {}) {
    const tc = twos(T), typed = nTyped(T), posted = ago(T, CLICK) > .04, ck = ago(T, CLICK);
    // the dev's comment box
    uiBox(ctx, 110, 120, 1140, 480, { r: 16, shadow: 12 });
    if (!posted) {
      txt(ctx, 'Write', 150, 178, { font: 'ui', weight: 800, size: 34 }); txt(ctx, 'Preview', 280, 178, { font: 'ui', weight: 600, size: 34, color: '#6E6A78' });
      fillPts(ctx, rect(140, 192, 110, 6), INK.orange, false);
      ink(ctx, rrect(140, 206, 1080, 250, 10), { fill: INK.white, line: 3, smooth: false, boil: .4 });
    } else {
      avatar(ctx, 170, 172, 30, 'you'); txt(ctx, 'you', 216, 186, { font: 'ui', weight: 800, size: 38 }); txt(ctx, 'commented just now', 296, 186, { font: 'ui', weight: 500, size: 34, color: '#77738A' });
      inkLine(ctx, [[130, 222], [1230, 222]], 3, '#D8D2C4', { taper: [0, 0], smooth: false });
    }
    const s = CMD.slice(0, typed), caret = !posted && Math.floor(T * 4) % 2 === 0;
    txt(ctx, s + (caret ? '\u258D' : ''), 172, 318, { font: 'mono', weight: 800, size: 70, color: INK.ink });
    // @-mention dropdown: the rabbit's own account, summoned
    if (typed >= 5 && typed < 13 && !posted) {
      uiBox(ctx, 200, 350, 560, 96, { r: 10, shadow: 8 }); fillPts(ctx, rrect(206, 356, 548, 84, 8), INK.pinkLt, false);
      avatar(ctx, 250, 398, 28, 'rabbit'); txt(ctx, 'coderabbitai', 295, 412, { font: 'ui', weight: 800, size: 36 }); pill(ctx, 540, 398, 'bot', { fill: '#E4DED0', color: INK.ink, size: 24, line: 0 });
    }
    if (!posted) button(ctx, 960, 480, 250, 84, 'Comment', { fill: INK.green, press: ck > -.06 && ck < .12 ? 1 : 0, size: 36 });
    // the reply: coderabbitai itself, obliging
    const rk = seg(T, REPLY, REPLY + .1);
    if (rk > 0) {
      ctx.save(); ctx.translate(110, 650); const q = lerp(.7, 1, backOut(rk, 2.4)); ctx.scale(1.6 * q, 1.6 * q); ctx.globalAlpha *= clamp(rk * 4);
      commentCard(ctx, 0, 0, 700, T, { author: 'coderabbitai', kind: 'rabbit', time: 'just now', body: ['     Reviews paused'], buttons: false, size: 30 });
      ink(ctx, rrect(84, 102, 34, 34, 7), { fill: INK.green, line: 3, smooth: false, boil: .3 }); inkLine(ctx, [[92, 119], [99, 127], [111, 110]], 5, INK.white, { taper: [0, 0], smooth: false });
      ctx.restore();
    }
    // the rabbit on the right, typing its next review on its lap
    if (o.rabbit !== false) pauseRabbit(ctx, T, o);
    // the cursor
    const move = smooth(seg(T, 62.28, 62.5)), cx = lerp(1000 + 10 * wob(T, 1.1), 1085, move), cy = lerp(300 + 8 * wob(T, .9), 518, move);
    if (!o.noCursor) cursor(ctx, cx, cy, 150, { click: ck >= 0 && ck < .3 ? ck / .3 : 0 });
  }
  const DRAFT = ['Also, line 88: user', 'can be nu'], RX = 1540, RY = 720;
  function pauseRabbit(ctx, T, o = {}) {
    const tc = twos(T), frozen = T >= FREEZE - .05, beat = Math.floor(tc * 12) % 2;
    // draft card: its next comment, typed as fast as it reads
    const n = Math.floor((T - 60.3) * 11), l1 = DRAFT[0].slice(0, clamp(n, 0, DRAFT[0].length)), l2 = DRAFT[1].slice(0, clamp(n - DRAFT[0].length, 0, DRAFT[1].length));
    uiBox(ctx, 1250, 40, 600, 220, { r: 12, shadow: 8 });
    avatar(ctx, 1294, 88, 24, 'rabbit'); txt(ctx, 'coderabbitai', 1332, 100, { font: 'ui', weight: 800, size: 30 }); txt(ctx, 'drafting\u2026', 1526, 100, { font: 'ui', weight: 500, size: 28, color: '#77738A' });
    const cr = Math.floor(T * 4) % 2 || frozen ? '\u258D' : '';
    txt(ctx, l1 + (l2 ? '' : cr), 1280, 164, { font: 'ui', weight: 700, size: 38 });
    if (l2) txt(ctx, l2 + cr, 1280, 218, { font: 'ui', weight: 700, size: 38 });
    fillPts(ctx, [[1500, 260], [1544, 260], [1516, 296]], INK.white, false); inkLine(ctx, [[1500, 262], [1516, 296], [1544, 262]], 4, INK.ink, { taper: [0, 0], smooth: false });
    const up = frozen ? 1 : beat;
    const pose = {
      sit: 1, bags: BAGS, turn: -.15, eyes: 'open', lx: o.lx ?? -.15, ly: o.ly ?? .75, lids: o.lids ?? .12, mouth: 'flat', brows: -.05,
      armL: up ? { a: 30, e: -110 } : { a: 112, e: -56 }, armR: up ? { a: 118, e: -58 } : { a: 30, e: -110 }, pawL: 'point', pawR: 'point',
      earL: { a: -12, b: frozen ? 22 : 8 * wob(tc, 2) }, earR: { a: 14, b: frozen ? -30 : -8 * wob(tc, 2) },
    };
    if (o.poseOverride) Object.assign(pose, o.poseOverride);
    if (o.rabbitFn) o.rabbitFn(ctx, pose); else rabbit(ctx, RX, RY, 32, pose);
    laptop(ctx, RX, RY - 60, o.greyLaptop);
  }
  const pauseK = t => { const p = seg(t, 60.95, FREEZE), [dx, dy] = drift(t, 5, .6); return [lerp(820, 940, easeInOut(p)) + dx, lerp(420, 500, easeInOut(p)) + dy, lerp(1.14, 1.02, easeInOut(p)) + .04 * kick(t, CLICK, 9), 0]; };
  function typePause(ctx, t) {
    const K = pauseK(t);
    bg(ctx, K, c => moodWash(c, t, 'hurt', 11, { c: [980, 520] }));
    cam(ctx, ...K); pauseScene(ctx, t); ctx.restore();
  }
  // the frozen frame: nothing moves but the rabbit's eyes
  function frozenScene(ctx, T, eyes, K) {
    bg(ctx, K, c => moodWash(c, FREEZE, 'hurt', 11, { c: [980, 520] }));
    cam(ctx, ...K); pauseScene(ctx, T, eyes); ctx.restore();
  }
  function frozen(ctx, t) {
    BOIL = 0; BOIL_T = FREEZE - .01;
    const FREEZE_K = pauseK(FREEZE - .01);
    const slide = smooth(clamp(ago(t, 63.20) / .17)), lids = Math.max(lerp(.12, .42, slide), blink(t, [63.80], .18));
    const push = smooth(seg(t, 63.0, 64.55)), K = [lerp(FREEZE_K[0], 1300, push), lerp(FREEZE_K[1], 545, push), lerp(FREEZE_K[2], 1.32, push), 0];
    const insert = t >= 64.16 && t < 64.33;
    if (!insert) frozenScene(ctx, FREEZE - .01, { lx: lerp(-.15, 0, slide), ly: lerp(.75, -.05, slide), lids }, K);
    else pauseSign(ctx, t);
    FRAME.post.push((c, tt) => { duotone(c, INK.ink, mix(INK.paper, INK.white, .3), 1.2); if (insert) pauseSignRed(c); else vhsPause(c, tt, 1); });
  }
  // 4-frame insert: the cardboard protest sign, AI crossed out, RABBIT scrawled in
  function pauseSign(ctx, t) {
    const card = mix(INK.orangeLt, INK.paperDk, .55);
    fillPts(ctx, rect(0, 0, W, H), mix(INK.paper, INK.ink, .2), false);
    dotsIn(ctx, [0, 0, W, H], { spacing: 30, color: rgba(INK.ink, .3), k: () => .35 });
    ink(ctx, rect(930, 700, 60, 500), { fill: mix(INK.orangeDk, INK.paper, .3), line: 6, smooth: false });
    ctx.save(); ctx.translate(960, 460); ctx.rotate(-.05);
    fillPts(ctx, rect(-600, -300, 1200, 600).map(([x, y]) => [x + 18, y + 20]), INK.ink, false);
    ink(ctx, [[-600, -300], [600, -312], [612, 300], [-592, 296]], { fill: card, shade: { color: mix(card, INK.ink, .3), spacing: 14, dir: [0, 1], from: -100, to: 400 }, line: 7, smooth: false });
    for (let i = 0; i < 14; i++) inkLine(ctx, [[-560 + i * 84, -280], [-556 + i * 84, 280]], 2, rgba(INK.ink, .15), { taper: [0, 0], smooth: false });
    txt(ctx, 'PAUSE', -470, 130, { font: 'marker', size: 250, color: INK.ink });
    txt(ctx, 'AI', 250, 130, { font: 'marker', size: 250, color: INK.ink });
    ctx.restore();
  }
  function pauseSignRed(ctx) {
    ctx.save(); ctx.translate(960, 460); ctx.rotate(-.05);
    inkLine(ctx, [[230, 60], [320, 20], [480, -40]], 26, INK.red, { taper: [.05, .1] });
    inkLine(ctx, [[240, -60], [360, -10], [490, 60]], 24, INK.red, { taper: [.05, .1] });
    txt(ctx, 'RABBIT', 360, -130, { font: 'marker', size: 140, color: INK.red, rot: -.12, align: 'center' });
    inkLine(ctx, [[300, -60], [340, -110], [380, -60]], 12, INK.red, { taper: [.1, .1] });
    ctx.restore();
  }

  // ======================================================================================================
  // 11 · 64.60 "I wrote a poem for you": the world stays paused; the rabbit un-pauses itself and writes.
  const POEM = ["fourteen thousand lines of 'fix',", 'a key, a null, a skipped-test mix.', 'I read them all. I always do.', '   hop hop \u2014 I wrote this for you.'];
  const POEM_T = [[65.06, 65.40], [65.44, 65.80], [65.84, 66.12], [66.16, 66.46]];
  const CARD = [480, 330, 1020, 560];
  function poemCard(ctx, t, o = {}) {
    const [x, y, w, h] = CARD, f = { font: 'hand', weight: 700, size: 50 };
    fillPts(ctx, rect(x + 16, y + 18, w, h), INK.ink, false);
    ink(ctx, rect(x, y, w, h), { fill: INK.white, line: 6, smooth: false, boil: .7 });
    for (let i = 0; i < 5; i++) inkLine(ctx, [[x + 20, y + 110 + i * 100], [x + w - 20, y + 110 + i * 100]], 2.5, rgba(INK.pink, .45), { taper: [0, 0], smooth: false });
    inkLine(ctx, [[x + 90, y + 12], [x + 90, y + h - 12]], 3, rgba(INK.red, .5), { taper: [0, 0], smooth: false });
    let head = null;
    POEM.forEach((s, i) => {
      const [a, b] = POEM_T[i], k = o.all ? 1 : seg(twos(t), a, b); if (k <= 0) return;
      const n = Math.floor(s.length * k), shown = s.slice(0, n), yy = y + 96 + i * 100;
      txt(ctx, shown, x + 110, yy, { ...f, color: INK.ink });
      const ww = measure(ctx, shown, f).w;
      if (k < 1) head = [x + 110 + ww, yy - 8];
      if (i < 3 && k >= 1 && !o.all && seg(twos(t), ...POEM_T[i + 1]) <= 0) head = [lerp(x + 110 + ww, x + 110, seg(twos(t), b, POEM_T[i + 1][0])), yy - 8 + 100 * seg(twos(t), b, POEM_T[i + 1][0]) - 30];
      if (i === 3 && n > 1) { // the rabbit's doodle signature instead of an emoji
        const dx = x + 128, dy = yy - 18; for (const sd of [-1, 1]) inkLine(ctx, [[dx + sd * 7, dy - 6], [dx + sd * 10, dy - 34]], 6, INK.red, { taper: [.1, .3] });
        ink(ctx, ell(dx, dy, 17, 14, 12), { fill: INK.white, line: 4, lineColor: INK.red, boil: .5 }); fillPts(ctx, ell(dx - 6, dy - 2, 2.6, 3, 6), INK.red); fillPts(ctx, ell(dx + 6, dy - 2, 2.6, 3, 6), INK.red);
      }
    });
    return head;
  }
  // colour flows back into the rabbit as growing halftone dots
  function colourIn(ctx, k, box, fn) {
    if (k >= 1) { fn(ctx); return; }
    if (k <= 0) return;
    sprite(ctx, fn, c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-in';
      dotsIn(c, box, { spacing: 18, size: 1.1, color: '#000', k: (x, y) => clamp(k * 2.6 - 1 + (1 - (y - box[1]) / (box[3] - box[0])) * .8) * 1.3 }); c.restore(); });
  }
  function poem(ctx, t, lt, dur) {
    BOIL_T = t;
    const tc = twos(t);
    if (t < 65.04) { // A: the un-pause
      const K = [1330, 545, 1.32, 0], still = t < 64.8;
      BOIL = 0; frozenScene(ctx, FREEZE - .01, { lx: 0, ly: -.05, lids: .42, rabbit: false }, K);
      cam(ctx, ...K); pauseRabbit(ctx, FREEZE - .01, { lx: 0, ly: -.05, lids: .42, greyLaptop: true, rabbitFn: still ? undefined : () => {} }); ctx.restore(); BOIL = 1;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); duotone(ctx, INK.ink, mix(INK.paper, INK.white, .3), 1.2); ctx.restore();
      bg(ctx, K, c => moodWash(c, t, 'poem', 14, { k: easeOut(seg(t, 64.7, 65.1)), at: [RX - 120, 520], c: [RX - 170, 520], r: [330, 300], n: 4 }), 0, 1);
      cam(ctx, ...K);
      if (!still) laptop(ctx, RX, RY - 60, true);
      const rise = seg(t, 64.8, 64.92), grab = seg(t, 64.88, 64.98), hasPen = t >= 64.96;
      const pose = {
        sit: 1 - smooth(rise), sq: rise > 0 && rise < 1 ? -.15 : 0, bags: BAGS, turn: -.15, eyes: 'open', lx: 0, ly: -.05, lids: t < 64.8 ? .42 : .3, mouth: 'flat',
        armL: { a: lerp(30, 20, rise), e: lerp(-110, 20, rise) }, armR: grab > 0 ? { a: lerp(118, 160, grab), e: lerp(-58, hasPen ? 20 : 70, grab) } : { a: 118, e: -58 },
        pawL: 'mitt', pawR: hasPen ? 'fist' : 'point', pen: !hasPen, earL: { a: -12, b: lerp(22, 0, rise) }, earR: { a: 14, b: lerp(-30, 0, rise) },
      };
      const rx = RX - 170 * smooth(rise);
      colourIn(ctx, seg(t, 64.6, 64.78), screenBox(ctx, rx - 200, RY - 480, rx + 200, RY), c => {
        const A = rabbit(c, rx, RY, 32, pose);
        if (hasPen) pen(c, A.pawR[0] - 20, A.pawR[1] - 36, D(-60), 110, 15);
      });
      if (rise <= 0) laptop(ctx, RX, RY - 60, true);
      ctx.restore();
      const g = seg(t, 64.6, 64.8);
      FRAME.post.push((c, tt) => osdTear(c, tt, g));
      return;
    }
    // B: the card close-up, the red pen writing line by line
    const p = seg(t, 65.04, 66.55), [dx, dy] = drift(t, 5, .6);
    const K = [990 + dx, 610 + dy, 1.0 + .04 * p, -.01];
    BOIL = 0; bg(ctx, [1360, 480, 1.6, 0], c => pauseScene(c, FREEZE - .01, { noCursor: true, greyLaptop: true, rabbitFn: () => {} }), 10, 1); BOIL = 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); duotone(ctx, INK.ink, mix(INK.paper, INK.white, .3), 1.2); ctx.restore();
    bg(ctx, K, c => moodWash(c, t, 'poem', 14, { k: 1, c: [1000, 600], r: [760, 440] }), 6, .6);
    cam(ctx, ...K);
    const head = poemCard(ctx, t);
    const tip = head || [CARD[0] + CARD[2] - 200, CARD[1] + CARD[3] - 40];
    const jig = [4 * wob(tc, 5), 5 * wob(tc, 7)];
    const lift = head ? 0 : 60;
    bigPaw(ctx, tip[0] + 70 + jig[0], tip[1] + 110 - lift + jig[1], 62, D(40), { pen: [tip[0] + jig[0], tip[1] - lift + jig[1]], len: 1100 });
    if (head && Math.floor(tc * 12) % 3 === 0) inkLine(ctx, [[tip[0] + 10, tip[1] + 30], [tip[0] + 40, tip[1] + 40]], 4, INK.ink, { taper: [.3, .3] });
    ctx.restore();
  }
  // the VHS OSD tearing itself apart as the rabbit un-pauses
  function osdTear(ctx, t, g) {
    if (g >= 1) return;
    const c = pushLayer(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.font = '700 64px "JetBrains Mono"'; c.textBaseline = 'top'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowOffsetX = 4; c.shadowOffsetY = 4; c.fillText('\u258C\u258C PAUSE', 90, 70);
    popLayer();
    const f = Math.floor(t * 24);
    for (let i = 0; i < 8; i++) { if (hash(f * 3 + i) < g * 1.1) continue; const y = 60 + i * 12, dx = (hash(f + i * 7) - .5) * 400 * g; ctx.drawImage(c.canvas, 0, y, 700, 12, dx, y, 700, 12); }
  }

  // ======================================================================================================
  // 12 · 66.55 "all the same" (held "same"): fold, fly, land, Resolved in one click; T-30; the bar becomes the stage floor.
  const LAUNCH = 66.94, LAND = 67.92, RESOLVE = 68.20, FLASH30 = 68.43, BAR = [480, 930];
  // paper aeroplane, side view, pointing right (s = length)
  function paperPlane(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const nose = [s * .55, 0], L = { line: 5, smooth: false, boil: .8 };
    ink(ctx, [nose, [-s * .5, s * .15], [-s * .42, s * .02]], { fill: mix(INK.paper, INK.paperDk, .7), ...L });
    ink(ctx, [nose, [-s * .45, -s * .27], [-s * .3, s * .02]], { fill: INK.white, ...L });
    for (let i = 0; i < 3; i++) inkLine(ctx, [[-s * .32 + i * s * .06, -s * .16 + i * s * .05], [s * .12 + i * s * .05, -s * .05 + i * s * .016]], Math.max(3, s * .014), rgba(INK.pink, .75), { taper: [.1, .2] });
    inkLine(ctx, [nose, [-s * .42, s * .02]], 3, INK.ink, { taper: [0, 0], smooth: false });
    ctx.restore();
  }
  // the poem card folding, one pose per step (on twos): 1 halved, 2 corners in, 3 the dart
  function foldPose(ctx, k, w, h) {
    const L = { line: 5, smooth: false, boil: .8 };
    if (k === 1) {
      ink(ctx, rect(-w / 2, -h * .02, w, h * .5), { fill: mix(INK.paper, INK.paperDk, .7), ...L });
      for (let i = 0; i < 3; i++) inkLine(ctx, [[-w * .4, h * .1 + i * h * .1], [w * .3, h * .1 + i * h * .1]], 5, rgba(INK.pink, .4), { taper: [.1, .1] });
    } else if (k === 2) {
      ink(ctx, [[-w * .38, 0], [w * .1, 0], [w * .34, h * .22], [w * .1, h * .44], [-w * .38, h * .44]], { fill: INK.white, ...L });
      inkLine(ctx, [[w * .1, 0], [-w * .1, h * .22], [w * .1, h * .44]], 4, rgba(INK.ink, .5), { taper: [0, 0], smooth: false });
    } else paperPlane(ctx, 0, h * .2, w * .55, -.06);
  }
  // the frozen grey world (the pause scene without its rabbit), duotoned
  function greyWorld(ctx, K) {
    BOIL = 0; bg(ctx, K, c => { moodWash(c, FREEZE, 'hurt', 11, { c: [980, 520] }); pauseScene(c, FREEZE - .01, { noCursor: true, greyLaptop: true, rabbitFn: () => {} }); }, 0, 1); BOIL = 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); duotone(ctx, INK.ink, mix(INK.paper, INK.white, .3), 1.2); ctx.restore();
  }
  const GLIDE_K = t => { const e = easeInOut(seg(t, 67.08, LAND)), [dx, dy] = drift(t, 6, .5); return [lerp(1180, 780, e) + dx, lerp(440, 720, e) + dy, lerp(1.12, 1.24, e) + .05 * kick(t, RESOLVE, 8), 0]; };
  const glidePath = f => [lerp(2050, BAR[0] + 40, f) + Math.sin(f * 5.2) * 110, lerp(150, BAR[1] - 50, f * f) - Math.sin(f * Math.PI) * 60 + Math.sin(f * 9) * 22];
  function plane(ctx, t, lt, dur) {
    BOIL_T = t;
    const tc = twos(t), aL = ago(t, LAUNCH);
    if (t < 67.12) { // fold on twos, then throw
      const K = [990, 610, 1.04, -.01];
      BOIL = 0; bg(ctx, [1360, 480, 1.6, 0], c => pauseScene(c, FREEZE - .01, { noCursor: true, greyLaptop: true, rabbitFn: () => {} }), 10, 1); BOIL = 1;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); duotone(ctx, INK.ink, mix(INK.paper, INK.white, .3), 1.2); ctx.restore();
      bg(ctx, K, c => moodWash(c, t, 'poem', 14, { k: 1, c: [1000, 600], r: [760, 440] }), 6, .6);
      cam(ctx, ...K);
      const fk = twos(seg(t, 66.68, 66.92)) * 2;
      if (fk <= 0) { const lift = seg(t, 66.55, 66.68); ctx.save(); ctx.translate(990, 610); ctx.rotate(-.03 * lift); ctx.scale(1 + .03 * lift, 1 + .03 * lift); ctx.translate(-990, -610); poemCard(ctx, t, { all: true }); ctx.restore();
        bigPaw(ctx, 1400 + 500 * easeIn(lift), 870 + 300 * easeIn(lift), 62, D(40), { pen: [1330 + 500 * easeIn(lift), 830 + 300 * easeIn(lift)], len: 1100 }); }
      else if (aL < 0) paperPlane(ctx, 990, 610, lerp(1020, 520, fk / 2), -.03 - .1 * fk, fk);
      else { const e = expoOut(clamp(aL / .18)); paperPlane(ctx, lerp(990, 1700, e), lerp(610, 200, e), lerp(520, 150, e), lerp(-.23, -.35, e), 2); streaks(ctx, [900, 200, 1700, 700], { dir: [.86, -.5], n: 14, len: 300, w: 6, color: INK.pink }); }
      ctx.restore();
      return;
    }
    if (t < FLASH30 - VLEAD || (t >= FLASH30 - VLEAD + 4 / 24 && t < FLOOR)) { // glide across the frozen world, land, get resolved
      const p = seg(t, 67.12, FLOOR), [dx, dy] = drift(t, 6, .5), rk = kick(t, RESOLVE, 8);
      const K = [960 + dx, 560 + dy + 20 * p, 1.0 + .08 * easeInOut(p) + .04 * rk, 0];
      BOIL = 0; bg(ctx, K, c => { moodWash(c, FREEZE, 'hurt', 11, { c: [980, 520] }); pauseScene(c, FREEZE - .01, { noCursor: true, greyLaptop: true, rabbitFn: () => {} }); }, 0, 1); BOIL = 1;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); duotone(ctx, INK.ink, mix(INK.paper, INK.white, .3), 1.2); ctx.restore();
      cam(ctx, ...K);
      // the rabbit (still in colour) watches it go
      const done = ago(t, RESOLVE) > .1, fold = backOut(seg(t, RESOLVE + .08, RESOLVE + .2), 2);
      rabbit(ctx, RX - 170, RY, 32, { bags: BAGS, turn: -.45, lx: -.8, ly: done ? .2 : -.3, lids: done ? .5 : .15, mouth: done ? 'flat' : 'smile', armR: { a: lerp(120, 20, seg(t, 67.1, 67.5)), e: 10 }, pawR: 'open', armL: { a: 16, e: 20 }, earL: { a: -12, b: lerp(0, -100, fold) }, earR: { a: 14, b: 0 } });
      // the flight: a long floaty S across the frame, a dashed pink trail
      const fl = seg(t, 67.12, LAND), path = f => [lerp(1500, 520, f) + Math.sin(f * 5.2) * 90, 180 + Math.sin(f * Math.PI) * -40 + f * f * 740 + Math.sin(f * 9) * 18];
      const trail = []; for (let i = 0; i <= 30; i++) { const f = fl * i / 30; trail.push(path(f)); }
      if (fl > 0) { ctx.save(); ctx.setLineDash([18, 16]); ctx.lineWidth = 5; ctx.strokeStyle = INK.pink; ctx.beginPath(); tracePath(ctx, trail, false, true); ctx.stroke(); ctx.restore(); }
      const aR = ago(t, RESOLVE), land = seg(t, LAND - .02, LAND + .1);
      if (aR < 0) {
        const q = path(Math.min(1, fl)), q2 = path(Math.min(1, fl + .02)), ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
        const lx = fl >= 1 ? q[0] - 60 * easeOut(land) : q[0], ly = fl >= 1 ? q[1] + 10 * easeOut(land) : q[1];
        paperPlane(ctx, lx, ly, 170, fl >= 1 ? lerp(ang, Math.PI + .1, easeOut(land)) : ang, 2);
        if (land > 0 && land < 1) krackle(ctx, lx, ly + 30, 60, { n: 10, size: 10 });
      } else { // collapsed into a Resolved bar (squash on twos)
        const sq = backOut(clamp(twos(aR) / .12), 2.2);
        ctx.save(); ctx.translate(480, 930); ctx.scale(lerp(.3, 1, sq), lerp(2.2, 1, sq));
        commentCard(ctx, -330, -28, 660, t, { state: 'resolved', author: 'coderabbitai', by: 'you', size: 30 }); ctx.restore();
      }
      // the cursor, in colour, arrives and clicks without looking
      const cin = expoOut(seg(t, 68.0, 68.16)), cout = easeIn(seg(t, 68.3, 68.55));
      if (cin > 0 && cout < 1) cursor(ctx, lerp(-100, 700, cin) + 900 * cout, lerp(1200, 960, cin) - 500 * cout, 150, { click: aR >= 0 && aR < .3 ? aR / .3 : 0 });
      ctx.restore();
      return;
    }
    if (t < FLOOR) { // 4-frame insert: the watch flashes T-30
      const a = ago(t, FLASH30);
      fillPts(ctx, rect(0, 0, W, H), INK.red, false);
      speedLines(ctx, 960, 540, { r0: 480, r1: 1800, n: 70, w: 14, color: INK.redDk });
      pocketWatch(ctx, 960, 560, 440 * (1.05 - .05 * clamp(a / .1)), { secs: clockSecs(16, 59, 30), left: 30, total: 90, digital: 'T\u221230s', rot: .04 });
      return;
    }
    // the Resolved bar grows into the chorus-2 stage floor
    const g = seg(t, FLOOR, 69.2), e = easeInOut(g), hz = 660;
    fillPts(ctx, rect(0, 0, W, H), mix(mix(INK.paper, INK.ink, .3), INK.blue, smooth(seg(t, 68.85, 69.15))), false);
    if (t > 68.9) dotsIn(ctx, [0, 0, W, hz], { spacing: 40, color: rgba(INK.ink, .22), dir: [0, 1], from: 0, to: H, min: 0, max: .6 });
    const bar = [[480 - 330, 902], [480 + 330, 902], [480 + 330, 959], [480 - 330, 959]], fl = [[-200, hz], [W + 200, hz], [W + 900, H + 60], [-900, H + 60]];
    const zoomed = bar.map(([x, y]) => [lerp(960, (x - 480) * 3.2 + 960, easeOut(clamp(g * 2))), lerp(540, (y - 930) * 3.2 + 700, easeOut(clamp(g * 2)))]);
    const Q = zoomed.map((p, i) => [lerp(p[0], fl[i][0], smooth(clamp(g * 1.6 - .5))), lerp(p[1], fl[i][1], smooth(clamp(g * 1.6 - .5)))]);
    ink(ctx, Q, { fill: mix('#E9E4DA', INK.white, e), line: 6, smooth: false, boil: .8 });
    const tk = 1 - clamp(g * 2.2);
    if (tk > 0) { ctx.save(); ctx.globalAlpha = tk; const c = [(Q[0][0] + Q[2][0]) / 2, (Q[0][1] + Q[2][1]) / 2], sc = (Q[1][0] - Q[0][0]) / 660;
      txt(ctx, '\u2713 Resolved \u00B7 coderabbitai \u00B7 by you', c[0], c[1] + 10 * sc, { font: 'ui', weight: 700, size: 27 * sc, color: '#6E6A78', align: 'center' }); ctx.restore(); }
    const fk = smooth(clamp(g * 1.6 - .5));
    if (fk > .3) { ctx.save(); clipPts(ctx, Q, false); ctx.globalAlpha = (fk - .3) / .7;
      for (let i = 0; i < 26; i++) { const k0 = Math.pow(i / 26, 1.9), k1 = Math.pow((i + .8) / 26, 1.9), y0 = hz + k0 * (H - hz + 60), y1 = hz + k1 * (H - hz + 60), kind = hash(i * 7 + 3); if (kind < .55) continue; fillPts(ctx, rect(-900, y0, W + 1800, y1 - y0), kind < .8 ? '#D8F3E1' : '#FBDADF', false); }
      ctx.restore(); }
    if (g > 0 && g < .5) streaks(ctx, [0, 400, W, 1080], { dir: [0, 1], n: 20, len: 300, w: 6, color: rgba(INK.ink, .5) });
  }

  chapter('verse2', 47.74, 69.27, [
    [47.74, sixty], [48.75, forcePush], [50.95, gone], [52.55, rain], [54.20, neverNull], [55.62, king],
    [57.30, drawDiagram], [58.95, scrollPast], [60.95, typePause], [62.95, frozen], [64.60, poem], [66.55, plane],
  ]);
})();
