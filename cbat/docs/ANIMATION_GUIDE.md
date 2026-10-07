# Animation guide (read before painting a chapter)

The project renders a 179.88 s music video, "This Could Have Been a Text", as procedural Canvas 2D animation in headless Chrome at 1920×1080 and 24 fps. Project root: `c:\hophopnopenope\cbat`. Run every command from there.

Read these first, in order:
1. [STYLE_SHEET.md](STYLE_SHEET.md): the two worlds, the cast, the rage scale, the rules.
2. [STORYBOARD.md](STORYBOARD.md): your shots, their times, the sync points and the running devices.
3. [LIBRARY.md](LIBRARY.md) plus the **header comment blocks** at the top of `src/human.js`, `src/apps.js` and `src/world.js`: the cast rig, the app UIs and the sets you build with. Read the look-dev scenes (`LOOKS.*`) in those files too: they are working examples of every feature.
4. `src/lyricplan.js`: the default lettering of every lyric line.

**The bar is high.** This is meant to go viral on tech Twitter (people watch on phones, often muted). Every shot needs:
- one clear idea that reads instantly;
- a joke or a transformation;
- a camera that is alive (on stage) or deliberately dead (in the office);
- the right world's print look.

The office must be *funny-boring*: deadpan, symmetric, pastel, painfully real app UIs. The stage must be *loud*: riso, halftone, boiling ink, sweat, spit, rage you can see. No shot should just sit there, and no shot should be cluttered.

## How a chapter works

Each chapter is one file in `src/ch/`, wrapped in an IIFE so its helpers stay private:

```js
// src/ch/c02_chorus1.js
(() => {
  function unmute(ctx, t, lt, dur) { ... }       // a shot
  function slam(ctx, t, lt, dur) { ... }
  chapter('chorus1', 20.62, 41.15, [[20.62, unmute], [22.30, slam], ...]);
  Object.assign(LYRICS, { 12: { mode: 'none' } }); // optional: override the lettering of your own lines
})();
```

- `chapter(name, start, end, shots)` registers the chapter. Each shot is called as `fn(ctx, t, lt, dur)`: song time, time since the shot started, and shot length. It must paint **the entire frame**, background included.
- Cuts (chapter and shot starts) snap to the frame that *contains* their time, so a cut on a downbeat is never late. A shot's first frame is rendered at its own start time.
- **Frames render in parallel and out of order.** Every shot must be a pure function of `t`:
  - no state that carries between frames;
  - no `Math.random()` (use `hash(i)`, `hrange(i, a, b)` and `noise1/noise2`).
- **Only edit your own chapter file.** If a shared helper is missing, write a private one inside your IIFE. If you find a real bug in a shared file (core, ink, fx, type, props, human, apps, world, timeline, lyricplan, studio.html, render.mjs), report it in your final message; don't edit it.
- **Lyrics.** The timeline letters the lyrics **after** your shot, then the paper grain, as planned in `lyricplan.js`.
  - You may override the entries of **your own lines** with `Object.assign(LYRICS, {...})` inside your IIFE. Do this to move a box away from your action, change the hot word, or make a line diegetic (`{mode: 'none'}`, typed into a Teams chat, an invite title, a slide).
  - Keep the type law: office lines are `livecap` or diegetic UI text; stage lines are `hero`, `caption` or `ransom`; every sung line is readable somewhere on screen while it is sung.
- **Overlay switches:**
  - `FRAME.lyrics = false` hides the overlay for a frame (only when the line is lettered diegetically).
  - `FRAME.post.push((ctx, t) => ...)` draws screen-space overlays after the lyrics.
  - `FRAME.grain` scales the grain.

## The two worlds: `look(k)`

- Every frame starts in `look(1)` (STAGE printing). Call `look(0)` at the top of an office shot. Every `ink()`, `inkLine()`, `shade()`, rig, set and app UI then prints the office way automatically: thin even grey lines, almost no boil, flat cel shadows, pastel palette.
- `look(k)` with 0 < k < 1 is the bleed (pre-choruses, verse 2, the bridge build). Drive it with a section-level curve (`seg`, `kf`), not per-word flicker.
- **Mask slips** and **split screens** switch worlds inside a shot: call `look(1)` for the stage insert and `look(0)` again after it. For a split, draw each half in its own clip with its own look.
- The timeline resets `look(1)` before drawing the lyrics, so lyric lettering is always stage-printed. `livecap` captions are crisp UI anyway.

## Canvas, coordinates and the camera

- 1920×1080 canvas, y down, origin top-left. `W`, `H`, `TAU` are globals.
- `cam(ctx, cx, cy, zoom, rot)` puts world point (cx, cy) at the screen centre; close it with `ctx.restore()`. Use it for pushes, pans, whips, tilts and zoom punches. The shared sets are laid out so that `cam(ctx, 960, 540, 1)` shows the whole set.
- `shake(t, amt)` returns `[dx, dy]` (changes on ones). `drift(t, amt, f)` gives a smooth handheld drift.
- Office camera: locked off, symmetric, at most a slow push. Stage camera: handheld drift, punch-zooms on snares, whips, Dutch tilts.
- Safe area: keep faces and must-read text inside x 96–1824, y 54–1026.

## Time: sync everything to the song

- `LINES[li].words[wi]` has `{w, a, b}` (start and end seconds), and `wordT(li, wi)` gives the start. The storyboard lists the key word times.
- **Drums:**
  - `BEATS` is snapped to the drum attacks: `beatTime(i)` is the time of beat i, `beatAt(t)` the fractional index, `beatN(t)` the integer beat. Kicks are on odd beats, snares on even.
  - `kick(t, k)` and `snare(t, k)` decay from the most recent **real** hit (`KICKS`, `SNARES`); they stay silent in the dropouts. Use `snare` for punch-zooms, flashes, sweat sprays and headbangs.
  - `pulse(t, k, every)` is 1 on each beat and decays (grid-only: it keeps going through dropouts).
  - `hit(t, [times], k)` decays from the most recent of the given times (use it for the storyboard's hit lists).
- **Every helper above already fires one frame early (the sync law). Hits never land late.**
- `seg(t, a, b)` gives 0..1 progress. `kf(t, [[t0, v0], [t1, v1], ...], ease)` interpolates keyframes; values may be arrays.
- Easings: `smooth`, `easeIn`, `easeOut`, `easeInOut`, `expoIn`, `expoOut`, `backOut(x, s)` (overshoot), `elasticOut`. Math: `lerp`, `clamp`, `frac`, `mod`, `remap`, `wob(t, f, ph)`, `mix(colA, colB, k)`, `rgba(col, a)`.
- **Stepped time:**
  - Pose characters from `const tc = twos(t)` (12 poses/s).
  - Move cameras, UI and type with `t` (24 fps).
  - Collage cut-outs use `threes(t)`.
  - Line boil is automatic (12×/s, scaled by the look). Set the global `BOIL = 0` for frozen moments (the sacred stops); every frame starts with `BOIL = 1`.

## Drawing kit (src/ink.js)

Shapes are point lists `[[x, y], ...]`, traced as smooth closed splines.

- **Generators:**
  - `ell(cx, cy, rx, ry, n, rot)`, `rrect(x, y, w, h, r)`, `rect(x, y, w, h)`
  - `blob(cx, cy, r, seed, amt, n)`, `star(cx, cy, r, inner, n, rot)`, `burstPts(...)`
  - `bezPts(p0, p1, p2, p3, n)`, `xform(pts, x, y, s, rot)`, `bbox(pts)`
- **`ink(ctx, pts, o)`** is the workhorse: flat fill, then shading (halftone on stage, a flat cel band in the office), then the outline. Options:
  - `fill`
  - `shade: {color, spacing, dir, from, to, min, max}`
  - `hatch: {...}`
  - `line` (weight px; 0 = none), `lineColor`, `boil` (px), `smooth` (false for hard-edged UI), `seed`, `heavy` (shadow-side weight)
- `fillPts(ctx, pts, color, smooth)`, `clipPts(ctx, pts)`, `outline(ctx, pts, w, color)`, `inkLine(ctx, pts, w, color, {taper: [a, b], keepWeight})`.
- `dotsIn(ctx, [x0, y0, x1, y1], {spacing, color, angle, dir, from, to, min, max, k: (x, y) => 0..1})` is a halftone field inside the current clip, for backgrounds, glows, screen-tone and shadows.
- **Energy:** `speedLines(ctx, cx, cy, {n, r0, r1, w, color})`, `streaks(ctx, box, {dir, n, len, w, color})`, `krackle(ctx, cx, cy, r, {n, size, color})`, `burst(ctx, cx, cy, r, {fill, dotColor, seed, n, spike})`.
- `LIGHT` (global, default upper-left) sets which side of every outline gets heavier.

## Print effects (src/fx.js)

- `depth(ctx, px, c => { ...draw... })` draws into a scratch layer and composites it with misregistered colour plates.
  - `px = 0` is in focus; use 6–14 px for stage foreground and background planes. **Office: no `depth()`** (sterile, registered).
  - The layer starts at the **identity** transform, so apply your camera inside it (`cam(c, ...)` … `c.restore()`), or pass `{keep: true}`.
  - It costs a few ms per call.
- `misregFrame(ctx, px, angle)` splits what is already drawn (hit flashes, whips).
- `flash(ctx, color, k)`: a full-frame flash (**at most 3 per second**).
- `glitch(ctx, t, amt, seed)`: slice-tear plus RGB split (video-call glitches, mask slips).
- `dotWipe(ctx, k, color, {dir, spacing})`, `duotone(ctx, dark, light, contrast)`, `vhsPause(ctx, t, k)`.
- `panels(ctx, t, [{r: [x, y, w, h] | poly: pts, fn: (c, t) => drawFullFrame, zoom, at: [cx, cy]}], {gutter, border})`: comic panels; each panel's full-frame drawing is scaled to cover its box (good for split screens and the post-chorus montage).
- `paperBg(ctx)` repaints the paper. `grain` is applied automatically.

## Lettering (src/type.js)

- `txt(ctx, s, x, y, o)` draws styled text. Options:
  - `font` ('display' | 'mono' | 'ui' | 'hand' | 'serif' | 'comic' | 'marker'), `size`, `weight`, `stretch` (−4..4), `italic`, `track`
  - `color`, `align`, `base`, `rot`, `skew`, `sx`/`sy`, `alpha`
  - `stroke: {w, color}`, `extrude: {dx, dy, color}`, `dots: {color, spacing}`, `under`
- `measure(ctx, s, o)` returns `{w, asc, desc}`. `typed(s, t, t0, cps)` returns the visible prefix (typing gags, with a caret).
- `sfx(ctx, 'SLAM!', x, y, size, age, {rot, color, life, stretch, dotColor, shadow})`: comic onomatopoeia.
- Lyric modes, with the options you can put in a LYRICS override:
  - `hero` {box, rows, words, emph, hot, color, align, stroke, extrude, tilt, out, end, until, after}
  - `caption` {x, y, w, size, rot, fill, hot}
  - `sub` {y, size}
  - `livecap` {x, y, w, size, speaker, hold}
  - `ransom` {box, rows, words}
- **Font roles never swap:** app UI is `'ui'` / `'mono'`; lyrics and SFX are `'display'`; sticky notes are `'hand'`; scrawl is `'marker'`.
- Type law:
  - at most 3 sizes and 2 text systems per frame;
  - must-read text is at least 60 px (UI that must be read is drawn big);
  - unsung gag text holds at least 0.3 s per word.

## The cast, the apps and the sets

The shared files are documented in their header comments. Rules of use:
- **The cast:** always `person(...)` from `src/human.js`, never a private redraw of a cast member. Use the rage scale from the style sheet (`rage`, `wild`, `glare`, `stage` outfit) and the section's rage level from the storyboard. Office acting is underplayed (micro-twitches, polite smile, the body leaking rage); stage acting is overplayed. Pose on twos, and never snap between expressions (go through a blink, squash or cut).
- **The apps:** the real UIs from `src/apps.js`. Show must-read UI big (a toast 700–1000 px wide).
- **The sets:** the sets from `src/world.js` and their layout constants (`DESK`, `STAGE`, `CONF`, …), so continuity holds across chapters. The same desk, the same clock, the same stage.
- **Inks:** use `INK.*` only, plus `mix()` / `rgba()` of them. Stage frames are paper + ink + red + at most two section inks; office frames are the pastels plus the real app colours.

## Performance

Aim for **≤ 300 ms per frame** (the render log prints ms/frame). The expensive things are hundreds of full-body rigs (use `crowdPerson` or `crowd` for far people), big `dotsIn` fields at small spacing, and many `depth()` layers.

## Checking your work (mandatory)

Run from `c:\hophopnopenope\cbat`:

```
node render.mjs --sheet=20.7,22.3,23.5,24.3 --cols=2 --w=960 --out=out/check/c02_a.jpg
node render.mjs --stills=22.3 --out=out/check/c02_full
node render.mjs --clip=20.62:26 --out=out/check/c02_clip.mp4
```

A sheet places several times on one image and prints ms per frame. Open it with the Read tool and look hard. Check:
- the first and last frames of every shot, and 2–3 in between;
- motion across consecutive frames around each hit (sample at 1/24 s steps);
- that every hit lands **on or before** its sound;
- that the lyrics are readable and nothing important sits under them;
- the transitions into and out of your chapter (look at the neighbouring chapter's first frame if it exists);
- readability at phone size: view the sheet at `--w=400`.

Iterate until each shot is **funny, readable, alive and on-model**. Fix whatever looks off: scale, contrast, clutter, stiffness, empty frames, an office that isn't deadpan enough, a stage that isn't loud enough. If a storyboard idea doesn't work in practice, improve it in the same spirit and say what you changed.

**Final message:** list the shots you built (time, what's on screen), anything you changed from the storyboard and why, your LYRICS overrides, measured ms/frame, known weaknesses, and any shared-file bugs.
