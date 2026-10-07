# Shared library contract

Three shared files sit on top of the drawing kit (`core.js`, `ink.js`, `fx.js`, `type.js`; see ANIMATION_GUIDE.md). Chapters call them; they never call chapters. Load order: `data, core, ink, fx, type, props, human, apps, world, timeline, lyricplan, ch/*, boot`. So `world.js` may call `human.js` and `apps.js`, and `apps.js` may call `human.js`.

Rules for every shared function:
- It is a **pure function of its arguments** (time comes in as `t`). No `Math.random`, no state between calls. Use `hash`, `hrange`, `noise1` and `noise2`.
- It honours **`look()`**. `ink()`, `inkLine()` and `shade()` already switch between OFFICE and STAGE printing through the global `STYLE`. Colours that differ between worlds are blended with `STYLE.k` (0 = office pastel, 1 = stage riso), using `mix(officeColour, stageColour, STYLE.k)`.
- It restores the canvas state it changes (`save`/`restore`).
- It is fast: a full-body character ≤ 12 ms, a bust ≤ 5 ms, a set ≤ 40 ms, a Teams call window with 9 tiles ≤ 60 ms.
- It is documented in a header comment block at the top of the file: signature, units, every option, what it returns.

The signatures below are the **contract**. Builders may add options and helpers, but must not rename these.

---

## human.js: the cast rig

```js
person(ctx, x, y, s, who, pose = {}) -> anchors
```
- `(x, y)` is the ground point between the feet. `s` is px per unit. Standing height, feet to crown (hair excluded), is **10 u**, so `s = 50` gives a 500 px tall person. Head height (chin to crown) is about 2.8 u, so the head is about 1/3.6 of the body.
- `who`: `'dan' | 'greg' | 'linda' | 'tasha' | 'bob' | 'sam'`, a number (a seeded generic extra), or a cast object (see `CAST`).
- `pose` (angles in degrees; everything optional):
  - **body:** `turn` −1..1 (fake 3/4, faces screen-left..right), `flip`, `lean`, `tilt` (head roll), `nod` (head drop, u), `sq` (squash; − = stretch), `hop` (u), `sit` 0..1 (sitting on a chair seat 4.2 u above the floor), `legs: 'stand' | 'wide' | 'walk' | 'run' | 'jump' | 'kneel'` with `phase` 0..1, `hunch` 0..1 (office slump)
  - **arms:** `armL`, `armR` = `{a, e}`: shoulder angle (0 hangs down, 90 out to the side, 170 straight up) and elbow bend
  - **hands:** `handL`, `handR` = `'relax' | 'fist' | 'open' | 'point' | 'thumb' | 'horns' | 'grip' | 'wave' | 'type'`
  - **face:** `eyes: 'open' | 'wide' | 'closed' | 'happy' | 'dead' | 'side' | 'rage' | 'x'`, `lids` 0..1, `lx`/`ly` (look −1..1), `brows` (raise), `browTilt` (+ worried, − angry), `mouth: 'polite' | 'smile' | 'flat' | 'frown' | 'o' | 'talk' | 'grit' | 'scream' | 'grin' | 'smirk'`, `open` 0..1
  - **rage** 0..1 (the rage scale in STYLE_SHEET §4: twitch, vein, red flush, tendons, scream extras), plus `sweat`, `steam`, `spit`, `blush` 0..1, `glare` 0..1 (blank white glasses glare), `twitch` 0..1
  - **hair:** `wild` 0..1 (Dan's tuft, then whole-head spikes)
  - **outfit:** `stage` 0..1 (Dan: tie migrates to a forehead headband, shirt untucks, sleeves roll; others get their stage tweaks)
  - **held props:** `hold: null | 'mic' | 'micstand' | 'guitar' | 'bass' | 'sticks' | 'phone' | 'mug' | 'tumbler' | 'laptop'`, with `strum` (picking-hand phase 0..1), `fret` (neck hand position 0..1) and `hits: {l, r}` (stick strokes 0..1). The rig places the hands on the prop.
  - **view:** `'full'` (default) or `'bust'` (head, shoulders and arms only; cheap, for webcam tiles and close-ups)
  - `col`: colour overrides; `noShadow`
- Returns anchors in the caller's coordinates: `{head, top, forehead, eyeL, eyeR, mouth, chest, hip, handL, handR, badge, mic, neck}`.

Helpers:
- `singOpen(t, li0, li1)` returns mouth openness 0..1 from the lyric word times (lines `li0..li1`). Use it only when the character performs.
- `blink(t, times)`, `twitchAt(t, k)`, `headbang(t, every = 1)` → `{nod, tilt}` on the beat, `jumpArc(t, t0, d, h)` → `{hop, sq, vy}`.
- `rageFace(r)` → a pose fragment for rage level r (merge it into a pose).
- `CAST` holds the preset objects; `extra(seed)` makes a generic coworker.
- `crowdPerson(ctx, x, y, s, seed, {jump, nod, arms})` is the cheap far-crowd body (flat fill plus lanyard, no shading). It must cost under 1 ms each.

## apps.js: exact app UIs (real layouts, brand colours, logos)

All take screen/world px. UI is crisp: `smooth: false`, no boil in the office look. Text uses font `'ui'` (Mona Sans) and `'mono'`.

```js
teamsLogo(ctx, x, y, size)   slackLogo(...)   zoomLogo(...)   outlookLogo(...)   pptLogo(...)
teamsToast(ctx, x, y, w, t, {kind: 'chat'|'call', name, who, text, t0})        // incoming chat / call, slides in at t0; call = Accept/Decline
teamsCall(ctx, box, t, {title, timer, participants, tiles, layout: 'grid'|'speaker'|'share', share, captions, focus, leave}) -> tile boxes
teamsTile(ctx, box, t, {who, name, muted, speaking, camOff, initials, frozen, draw})   // draw(c, box, t) paints custom tile content
teamsChat(ctx, box, t, {title, messages: [{who, name, text, time, at}], typing})
teamsCaption(ctx, x, y, w, {speaker, words: [{s, shown, on}], size})            // live captions bar (used by the 'livecap' lyric mode)
slackWindow(ctx, box, t, {workspace, channel, messages: [{who, name, text, time, at}], typing, huddle})
slackNotif(ctx, x, y, w, t, {name, who, text, t0})
zoomCall(ctx, box, t, {tiles, timer, waiting, muted})
outlookCalendar(ctx, box, t, {days, events: [{day, start, end, title, at}], now})  // the little blue boxes
outlookInvite(ctx, x, y, w, t, {title, when, dur, attendees, press})
emailCompose(ctx, box, t, {to, subject, body, t0, cps, send})
pptSlide(ctx, box, t, {title, bullets, n, total, presenter})
phoneScreen(ctx, x, y, h, t, {time, notifs: [{app, title, text, at}], lock})
textBubble(ctx, x, y, w, {text, side: 'in'|'out', t0, t})
screenShareBorder(ctx, box, t, {who})   mutedToast(ctx, x, y, t, t0)   unstableBanner(ctx, box)
aiRecap(ctx, box, t, {title, sections: [{h, items}], t0})
```
Tiles call `person(..., {view: 'bust'})` for people; `draw` overrides the content (chapters use it to put a riso stage version of a band member *inside* a tile).

## world.js: sets

Each set paints a full background (and optional foreground) in world coordinates where `cam(ctx, 960, 540, 1)` shows the whole set. Each exports a layout constant so chapters can place people and screens consistently.

```js
officeDesk(ctx, t, {clock, screen, laptop, fg, k})   + DESK = {dan: [x, y, s], monitor: [x, y, w, h], laptop: [...], clock: [x, y, r], webcam: [x, y], mug: [x, y]}
openPlan(ctx, t, {clock, rows, people, k})            + OPEN = {...}
gregOffice(ctx, t, {screen, k})                       + GREGOFF = {greg: [x, y, s], ...}
confRoom(ctx, t, {screen, chairs, k})                 + CONF = {table: [...], screen: [...], seats: [[x, y, s], ...]}
stage(ctx, t, {inks, lights, crowd, backdrop, smoke, strobe, fg})   + STAGE = {dan, linda, tasha, bob, kit, backdrop: [x, y, w, h], crowdY}
drumKit(ctx, x, y, s, t, {layer: 'back'|'front', hits: {kick, snare, tom, crash}})
bedroom(ctx, t, {glow, candles, fg})                  + BED = {pillowL, pillowR, laptop: [x, y, w, h], ...}
webcamBg(ctx, box, kind, seed)                        // 'bookshelf' | 'kitchen' | 'plain' | 'bed' | 'car' | 'ceiling' | 'blur' | 'stage'
crowd(ctx, t, box, n, {seed, jump, headbang, inks})
wallClock(ctx, x, y, r, secs, {style})   fluoro(ctx, t, box, {flicker, strobe})
```
`k` is the local look override for sets that bleed between worlds (default `STYLE.k`).
