// boot.js: load fonts, build textures, expose render hooks for render.mjs, and the dev scrubber/player.
(async () => {
  await Promise.all(['900 100px Archivo', 'italic 900 100px Archivo', '700 100px "JetBrains Mono"', '600 100px "Mona Sans"',
    '800 100px "Shantell Sans"', '900 100px "Noto Serif Display"', '800 100px "Shippori Mincho B1"', '100px Bangers',
    '100px "Dela Gothic One"', '100px "Permanent Marker"'].map(f => document.fonts.load(f, 'AaBb0123あ')));
  buildTextures();
  const out = document.getElementById('out'), ctx = out.getContext('2d', { alpha: false });
  window.renderAt = (t, type = 'image/png', q = .92) => { drawFrame(ctx, t); return out.toDataURL(type, q); };
  window.renderSheet = (times, cols = 3, w = 640) => {
    const h = Math.round(w * 9 / 16), rows = Math.ceil(times.length / cols), sc = makeCanvas(cols * w, rows * h), c = sc.getContext('2d'), ms = [];
    times.forEach((t, i) => {
      const t0 = performance.now(); drawFrame(ctx, t); ms.push(Math.round(performance.now() - t0));
      const x = (i % cols) * w, y = Math.floor(i / cols) * h; c.drawImage(out, x, y, w, h);
      c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x, y, 92, 24); c.fillStyle = '#fff'; c.font = '16px sans-serif'; c.fillText(t.toFixed(2) + 's', x + 6, y + 17);
    });
    return { url: sc.toDataURL('image/jpeg', .9), ms };
  };
  window.ready = true;
  if (location.search.includes('render')) return;
  // dev: scrub, or play in sync with the song (drops frames if painting is slower than real time)
  const s = document.getElementById('scrub'), lab = document.getElementById('tt'), au = document.getElementById('song'), btn = document.getElementById('play');
  au.src = 'assets/CodeRabbit, Pause.mp3'; au.preload = 'auto';
  const show = t => { const t0 = performance.now(); drawFrame(ctx, t); lab.textContent = `${t.toFixed(2)}s  beat ${beatAt(t).toFixed(2)}  ${Math.round(performance.now() - t0)} ms`; };
  s.oninput = () => { au.currentTime = +s.value; if (au.paused) show(+s.value); };
  btn.onclick = () => { if (au.paused) { au.currentTime = +s.value; au.play(); btn.textContent = 'pause'; } else { au.pause(); btn.textContent = 'play'; } };
  const loop = () => { if (!au.paused) { s.value = au.currentTime; show(au.currentTime); } requestAnimationFrame(loop); }; loop();
  show(+(new URLSearchParams(location.search).get('t') || 0));
})();
