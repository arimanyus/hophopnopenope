// render.mjs: drive studio.html in headless Chrome.
//   node render.mjs --sheet=12,12.5,13 [--cols=3] [--w=640] [--out=out/sheet.jpg]   contact sheet (fast visual check)
//   node render.mjs --stills=1.4,33.2 [--out=out/stills]                           full-res PNG stills
//   node render.mjs --clip=30:46 [--out=out/clip.mp4]                              clip with audio (single worker)
//   node render.mjs --frames=0:128.64 --workers=4                                  JPEG frames -> out/frames (resumable)
//   node render.mjs --encode [--out=out/coderabbit_pause.mp4]                      frames + song -> MP4
//   --look=name renders the look-dev scene LOOKS[name] instead of the song (t = scene time).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROME = args.chrome || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DUR = 128.64, fps = 24, FRAMES = 'out/frames', SONG = 'assets/CodeRabbit, Pause.mp3';
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

if (args.encode) {
  const out = args.out || 'out/coderabbit_pause.mp4', n = readdirSync(FRAMES).filter(f => f.endsWith('.jpg')).length;
  console.log(`encoding ${n} frames -> ${out}`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES}/f%05d.jpg`, '-i', SONG,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', out]);
  console.log('wrote ' + out); process.exit(0);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--allow-file-access-from-files', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu-rasterization', '--window-size=1920,1080',
    '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required'] });
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  if (args.look) await page.evaluate(n => { window.LOOK = LOOKS[n]; }, args.look);
  return page;
}
const frameOf = async (page, t, type, q) => { const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q); return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'); };
const times = s => String(s).split(',').map(Number);

if (args.sheet) {
  const page = await openPage(), out = args.out || 'out/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
  const { url, ms } = await page.evaluate((ts, c, w) => window.renderSheet(ts, c, w), times(args.sheet), +(args.cols || 3), +(args.w || 640));
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')); console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'out/stills'; mkdirSync(out, { recursive: true });
  for (const s of times(args.stills)) { const t0 = Date.now(), f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, await frameOf(page, s, 'image/png')); console.log(`${f}  ${Date.now() - t0} ms`); }
} else if (args.frames) {
  const [a, b] = String(args.frames).split(':').map(Number), workers = +(args.workers || 4); mkdirSync(FRAMES, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(DUR * fps) - 1, Math.round(b * fps) - 1), todo = [];
  for (let i = first; i <= last; i++) { const f = `${FRAMES}/f${String(i).padStart(5, '0')}.jpg`; if (args.force || !existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES}/f${String(i).padStart(5, '0')}.jpg`;
      writeFileSync(f + '.tmp', await frameOf(page, i / fps, 'image/jpeg', .95)); renameSync(f + '.tmp', f);
      if (++done % 48 === 0 || done === todo.length) { const el = (Date.now() - start) / 1000; console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`); }
    }
  }));
} else {
  const page = await openPage(), [a, b] = args.clip ? String(args.clip).split(':').map(Number) : [0, DUR];
  const out = args.out || 'out/clip.mp4'; mkdirSync(dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-ss', String(a), '-t', String(b - a), '-i', SONG,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((b - a) * fps), start = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frameOf(page, a + i / fps, 'image/jpeg', .9); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 48 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(`wrote ${out}`);
}
await browser.close();
