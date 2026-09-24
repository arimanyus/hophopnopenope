# Animation guide (read before painting a chapter)

The project renders a 128.64 s music video, "CodeRabbit, Pause", as procedural Canvas 2D animation in headless Chrome at 1920×1080 and 24 fps.

Read these first, in order:
1. [STYLE_SHEET.md](STYLE_SHEET.md): the look, the cast and the rules.
2. [STORYBOARD.md](STORYBOARD.md): your shots and their times.
3. `src/lyricplan.js`: how each lyric line is lettered, and which screen zones you must keep calm.

**The bar is high.** This is meant to go viral on SF tech Twitter and be better than anything like it. Every shot needs one clear idea that reads instantly (people watch on phones, often muted), an action or transformation, a camera that is alive, and the print look: flat ink, halftone, misregistration, boiling ink lines. No shot should just sit there, and no shot should be cluttered.

## How a chapter works

Each chapter is one file in `src/ch/`, wrapped in an IIFE so its helpers stay private:

```js
// src/ch/c02_verse1.js
(() => {
  const L = 2;                                   // private constants/helpers: any names
  function ping(ctx, t, lt, dur) { ... }         // a shot
  function ears(ctx, t, lt, dur) { ... }
  chapter('verse1', 10.45, 32.09, [[10.45, ping], [12.0, ears], ...]);
})();
```

- Cuts (chapter and shot starts) snap to the frame that *contains* their time, so a cut on a downbeat is never late. A shot's first frame is rendered at its own start time `t0`.
- `chapter(name, start, end, shots)` registers the chapter. Each shot is called as `fn(ctx, t, lt, dur)`: song time, time since the shot started, and shot length. It must paint **the entire frame**, background included. Cuts land on each shot's start time.
- **Frames render in parallel and out of order.** Every shot must be a pure function of `t`:
  - no state that carries between frames;
  - no `Math.random()` (use `hash(i)`, `hrange(i, a, b)` and `noise1/noise2`).
- **Only edit your own chapter file.** If a shared helper is missing, write a private one inside your IIFE. If you find a real bug in a shared file (core, ink, fx, type, rabbit, props, world, timeline, lyricplan, studio.html, render.mjs), report it in your final message; don't edit it.
- The timeline draws the lyrics from `lyricplan.js` **after** your shot, then the paper grain. Don't letter a line yourself unless its plan mode is `'none'`, or the storyboard says the shot letters it diegetically. In that case the lettering is part of your picture.
- To hide the overlay for a frame, set `FRAME.lyrics = false`. `FRAME.post.push((ctx, t) => ...)` draws screen-space overlays after the lyrics (VHS OSD, flashes over text).

## Canvas, coordinates and the camera

- 1920×1080 canvas, y down, origin top-left. `W`, `H`, `TAU` are globals.
- `cam(ctx, cx, cy, zoom, rot)` puts world point (cx, cy) at the screen centre; close it with `ctx.restore()`. Use it for pushes, pans, whips, tilts and zoom punches. The world layouts of the shared sets are 1920×1080, so `cam(ctx, 960, 540, 1)` shows the whole set.
- `shake(t, amt)` returns `[dx, dy]` (changes on ones). `drift(t, amt, f)` gives a smooth handheld drift.
- Safe area: keep faces and must-read text inside x 96–1824, y 54–1026.

## Time: sync everything to the song

- `LINES[li].words[wi]` has `{w, a, b}` (start and end seconds). `wordT(li, wi)` gives the start time. The line indices are in `lyricplan.js`, and the storyboard lists the key word times.
- `beatTime(i)` is the time of beat i (fractional allowed). `beatAt(t)` is the fractional beat index at t. `beatN(t)` is the integer beat.
- `pulse(t, k, every)` is 1 on each beat and decays. `hit(t, [times], k)` decays from the most recent of the given times.
- **Both already fire one frame early (the sync law). Hits never land late.**
- `seg(t, a, b)` gives 0..1 progress. `kf(t, [[t0, v0], [t1, v1], ...], ease)` interpolates keyframes; values may be arrays.
- Easings: `smooth`, `easeIn`, `easeOut`, `easeInOut`, `expoIn`, `expoOut`, `backOut(x, s)` (overshoot), `elasticOut`. Math: `lerp`, `clamp`, `frac`, `mod`, `remap`, `wob(t, f, ph)`.
- **Stepped time:**
  - Pose characters from `const tc = twos(t)` (12 poses/s).
  - Move cameras, UI and type with `t` (24 fps).
  - Collage cut-outs use `threes(t)`.
  - Line boil is automatic, 12×/s. Set the global `BOIL = 0` for frozen or paused moments, and remember that every shot starts with `BOIL = 1`.

## Drawing kit (src/ink.js)

Shapes are point lists `[[x, y], ...]`, traced as smooth closed splines.

- **Generators:**
  - `ell(cx, cy, rx, ry, n, rot)`, `rrect(x, y, w, h, r)`, `rect(x, y, w, h)`
  - `blob(cx, cy, r, seed, amt, n)`, `star(cx, cy, r, inner, n, rot)`, `burstPts(...)`
  - `bezPts(p0, p1, p2, p3, n)`, `xform(pts, x, y, s, rot)`, `bbox(pts)`
- **`ink(ctx, pts, o)`** is the workhorse: flat fill, then halftone shading, then comic outline. Options:
  - `fill`
  - `shade: {color, spacing, dir, from, to, min, max}`: dots grow along `dir` (unit vector into the shadow) from distance `from` to `to` (measured from the shape centre)
  - `hatch: {...}`
  - `line` (weight px; 0 = none), `lineColor`, `boil` (px, default 1.4), `smooth` (false for hard-edged UI), `seed`, `heavy` (shadow-side weight)
- `fillPts(ctx, pts, color, smooth)`, `clipPts(ctx, pts)`, `outline(ctx, pts, w, color)`, `inkLine(ctx, pts, w, color, {taper: [a, b]})` (tapered open stroke).
- `dotsIn(ctx, [x0, y0, x1, y1], {spacing, color, angle, dir, from, to, min, max, k: (x, y) => 0..1})` is a halftone field inside the current clip. Use it for backgrounds, glows, screen-tone and shadows.
- `shade(ctx, pts, o)` and `hatch(ctx, pts, o)` add halftone or hatching clipped to a shape.
- **Energy:**
  - `speedLines(ctx, cx, cy, {n, r0, r1, w, color})`: radial action lines
  - `streaks(ctx, box, {dir, n, len, w, color})`: travel lines
  - `krackle(ctx, cx, cy, r, {n, size, color})`
  - `burst(ctx, cx, cy, r, {fill, dotColor, seed, n, spike})`: SFX balloon
- `LIGHT` (global, default upper-left) sets which side of every outline gets heavier.

## Print effects (src/fx.js)

- `depth(ctx, px, c => { ...draw... })` draws into a scratch layer and composites with misregistered colour plates.
  - `px = 0` is in focus; use 6–12 px for foreground and background planes. This is how depth of field works in this film, so use it in almost every shot.
  - The layer starts at the **identity** transform, so apply your camera inside it (`cam(c, ...)` … `c.restore()`). Alternatively, pass `{keep: true}` to carry ctx's current transform into it.
  - Nesting is fine.
  - It costs a few ms per call, so don't call it 50 times a frame.
- `misregFrame(ctx, px, angle)` splits what is already drawn (hit flashes, whips).
- `flash(ctx, color, k)`: a full-frame flash (at most 3 per second).
- `glitch(ctx, t, amt, seed)`: slice-tear plus RGB split of what's drawn.
- `dotWipe(ctx, k, color, {dir, spacing})`: halftone-dot wipe.
- `duotone(ctx, dark, light, contrast)`: maps the frame to two inks (noir, paused).
- `vhsPause(ctx, t, k)`: VHS pause bars plus OSD.
- `panels(ctx, t, [{r: [x, y, w, h] | poly: pts, fn: (c, t) => drawFullFrame, zoom, at: [cx, cy]}], {gutter, border})`: a comic panel layout. Each panel's full-frame drawing is scaled to cover its box.
- `paperBg(ctx)` repaints the paper. `grain` is applied automatically.

## Lettering (src/type.js)

- `txt(ctx, s, x, y, o)` draws styled text. Options:
  - `font` ('display' | 'mono' | 'ui' | 'hand' | 'serif' | 'jp' | 'comic' | 'marker'), `size`, `weight`, `stretch` (−4..4; −2 = condensed, +2 = expanded), `italic`, `track`
  - `color`, `align`, `base`, `rot`, `skew`, `sx`/`sy`, `alpha`
  - `stroke: {w, color}` (fat outline), `extrude: {dx, dy, color}` (hard offset print shadow), `dots: {color, spacing}` (halftone inside the letters), `under` (colour: hand-drawn underline)
- `measure(ctx, s, o)` returns `{w, asc, desc}`.
- `sfx(ctx, 'HOP!', x, y, size, age, {rot, color, life, stretch, dotColor, shadow})`: comic onomatopoeia. It pops, jitters and snaps away. `age` = t − hitTime.
- `typed(s, t, t0, cps)` returns the visible prefix, for typing gags (with caret).
- Lyric renderers, used by the timeline; you rarely call them yourself: `hero`, `caption`, `sub`, `ransom`.
- **Font roles never swap:** UI text is always `'ui'` or `'mono'`; lyrics and SFX are `'display'`; the rabbit's handwriting is `'hand'`; Evangelion cards are `'serif'` / `'jp'`.
- Type law:
  - at most 3 sizes and 2 text systems per frame;
  - must-read text is at least 60 px;
  - unsung gag text holds at least 0.3 s per word, except deliberate pause-bait.

## The rabbit (src/rabbit.js)

`rabbit(ctx, x, y, s, pose)` draws the Reviewer and returns anchors `{pawL, pawR, head, eyeL, eyeR, mouth, earL, earR, chest, pocket, top}` in your coordinates, so props can be attached. (x, y) is the ground point between the feet. The rabbit is about 9.8s tall to the head top and about 14.5s to the ear tips (s = 40 is about 580 px). Hero close-ups use s = 60–110 (let the feet go off frame).

Pose fields (degrees for angles; all optional):

| Field | Meaning |
|---|---|
| `turn` −1..1 | faces screen-left..right (fake 3/4 view) |
| `flip` | mirror |
| `lean`, `tilt` | body lean, head roll |
| `nod` | head drop, u |
| `sq` | squash; − = stretch |
| `hop` | height, u |
| `sit` 0..1 | sitting |
| `legs` | 'stand' \| 'hop' \| 'run', with `phase`; `step` |
| `earL` / `earR` | `{a: base angle, b: bend at middle, len}`. Defaults: a −14 / +12. Big bend = folded or drooping. |
| `armL` / `armR` | `{a: shoulder, e: elbow}`. a: 0 hangs, 90 is out sideways, 150+ is raised. |
| `pawL` / `pawR` | 'mitt' \| 'point' \| 'fist' \| 'open' \| 'thumb' |
| `eyes` | 'open' \| 'wide' \| 'happy' \| 'closed' \| 'star' \| 'spiral' \| 'x' \| 'heart' \| 'dot' |
| `lids` 0..1 | .5 = deadpan |
| `lx`, `ly` | pupils look −1..1 |
| `bags` 0..1 | fatigue |
| `brows`, `browTilt` | + worried/pleading, − angry |
| `mouth` | 'smile' \| 'open' \| 'o' \| 'flat' \| 'frown' \| 'wavy' \| 'grin' \| 'smirk', with `open` 0..1 |
| `blush`, `sweat`, `anger`, `sense` 0..1 | `sense` = rabbit-sense squiggles (spider-sense) |
| `glasses` | reading glasses |
| `pen: false` | pen is in its paw, not behind its ear |
| `col: {...}` | colour overrides, e.g. greyscale when paused, noir inks in the bridge |
| `noShadow` | |

Helpers:
- `singOpen(t)` is mouth opening driven by the vocal. Use it only when the rabbit performs to camera.
- `hopArc(t, t0, dur, height)` returns `{h, sq, vy}` with anticipation and landing squash. Pass `hop: a.h, sq: a.sq, legs: 'hop'`.
- `earsFor(vy)` returns ear angles trailing the motion. `blink(t, [times])` returns lid values.

Acting rules:
- Anticipation → action → overshoot → settle.
- Never snap between expressions; go through a blink or squash.
- The rabbit is **deadpan** against absurd escalation.
- Fatigue (`bags`) accumulates: 0 in the intro and verse 1, .3 in verse 2, .6 in the bridge, 1 at 3 a.m.

## Shared props (src/props.js) and sets (src/world.js)

**Characters:**
- `commentBunny(ctx, x, y, s, {hop, sq, eyes: 'dot'|'happy'|'sad'|'x'|'wide', look, rot, state: 'open'|'resolved'|'outdated', chip: 'critical'|'nit'|'issue', ears})`. s ≈ its width/1.24; s = 150 is a big one.
- `cursor(ctx, x, y, s, {label: 'you', click: 0..1, crown, shades, sweat, tremble, rot, color})`. The tip is at (x, y); s ≈ height.
- `agentBot(ctx, x, y, s, {say, clap, bob, visor})` and `bubble(ctx, x, y, s, {size, fill, tail})`.
- `devShadow(ctx, x, y, s, {glare, glareColor})`: the developer as a faceless silhouette (3 a.m. / void only).

**UI:**
- `uiBox`, `pill(ctx, x, y, s, o)` (returns width), `button(ctx, x, y, w, h, s, {fill, press})`, `avatar(ctx, x, y, r, kind)`.
- `countHeader(ctx, x, y, n, {size})` draws "Actionable comments posted: N".
- The PR: `prPage(ctx, t, {x, y, w, h, scroll, header: {title, state, add, del}, tabs, lines, start, hl, comments: [{at, ...}], before, after})`, plus `prHeader`, `prTabs`, `diff(ctx, x, y, w, lines, {lineH, start, hl})`, `fakeDiff(n, seed, kind)` and `commentCard(ctx, x, y, w, t, {author, kind, time, chip, body: [lines], state, press, buttons})`. `PR` holds the title, number, stats and branch.

**Clock:** `pocketWatch(ctx, x, y, r, {secs: clockSecs(h, m, s), left: secondsToDeploy, total: 90, open: 0..1, crack, digital, label, rot})`.

**Inserts:**
- `cutout(ctx, x, y, w, h, rot, t, c => draw content in 0..w, 0..h, {seed, tape, xerox})`: a taped xerox scrap with jittering edges.
- `tweetCard(ctx, x, y, w, {name, handle, text: [lines], dark, note, likes...})`: invented handles only.
- `arxivCard`, `metrChart(ctx, x, y, w, h, t, {pts, progress, title, ylabels, footnote})`.
- `terminal(ctx, x, y, w, h, t, {lines: [[text, color]], cps, t0, title})`.
- `win95(ctx, x, y, w, h, {title, text, buttons, press})`, `promptBox(ctx, x, y, w, t, {text, typed})`, `statusPage(ctx, x, y, w, t, {rows})`.
- `stamp(ctx, 'NOPE', x, y, size, age, {color, rot})`, `thumbsUp(ctx, x, y, s)`, `ticker(ctx, y, t, items, {speed, label})`.
- `evaCard(ctx, t, [{s, x, y, size, font: 'serif'|'jp', sx, align}])`.

**Sets:**
- `burrow(ctx, t, {mood: 'warm'|'night'|'grey'|'party', screen: (ctx, [x, y, w, h], t) => ..., glow, lamp, fg})`. The world layout is fixed: main monitor `BURROW.main`, desk top y 760, chair near (1400, 1000).
- `stage(ctx, t, {a, b, spin, n (counter), altar 0..1, horizon, marquee, altarBtn})`, `bunnyRows(ctx, t, n, {rows, hopFn, eyes, state, scale})`, `sunburst(ctx, cx, cy, a, b, rot, n)`.

Everything in the style sheet about inks applies: use `INK.*` only (plus `mix()` and `rgba()` of them). Paper plus ink plus orange plus at most two others per frame.

## Performance

Aim for **≤ 300 ms per frame**; the render log prints ms/frame. Shared sets cost 20–80 ms. The expensive things are thousands of `ink()` calls with shading, big `dotsIn` fields at small spacing, and many `depth()` layers. If you draw hundreds of bunnies, draw far ones with a cheaper private function: flat fill plus ears, no shading.

## Checking your work (mandatory)

Run from the project root (`c:\hophopnopenope`):

```
node render.mjs --sheet=10.5,11.2,12.1,12.9 --cols=2 --w=960 --out=out/check/c02_a.jpg
node render.mjs --stills=11.2 --out=out/check/c02_full
node render.mjs --clip=10.45:16 --out=out/check/c02_clip.mp4
```

A sheet places several times on one image and prints ms per frame. Open it with the Read tool and look hard. Check:
- the first and last frames of every shot, and 2–3 in between;
- motion across consecutive frames around each hit (sample at 1/24 s steps);
- that every hit lands **on or before** its sound;
- that the lyric zones from `lyricplan.js` stay calm and nothing important sits under them;
- the transitions into and out of your chapter (look at the neighbouring chapter's first frame if it exists);
- readability at phone size: view the sheet at `--w=400`.

Iterate until each shot is **charming, readable, alive and on-model**. Fix whatever looks off: scale, contrast, clutter, stiffness, empty frames. If a storyboard idea doesn't work in practice, improve it in the same spirit and say what you changed.

**Final message:** list the shots you built (time, what's on screen), anything you changed from the storyboard and why, measured ms/frame, known weaknesses, and any shared-file bugs.
