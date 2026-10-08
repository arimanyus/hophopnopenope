# This Could Have Been a Text: handover

## Outputs
- `out/cbat.mp4`: master, 1920x1080, 24 fps, x264 CRF 16, AAC 256k (about 470 MB).
- `out/cbat_x.mp4`: X upload, CRF 17 capped at 16 Mbps, AAC 256k 48 kHz, faststart (about 260 MB).
- `out/frames/`: the 4317 rendered JPEG frames (0 .. 179.833 s).

## Re-render
Run from `cbat/`:
- one chapter's frames again: `node render.mjs --frames=A:B --workers=4 --force`; use A one frame early (e.g. 20.58 for 20.62), because a chapter's first frame is `floor(a * 24)`.
- the master: `node render.mjs --encode --out=out/cbat.mp4`.
- the X version: `node render.mjs --encode --x --out=out/cbat_x.mp4`.
- a quick look at the opening: `node render.mjs --encode --t=10 --out=out/check/hook.mp4`.
- checks: `--sheet=t1,t2 --cols=4 --w=480 --out=out/check/x.jpg`, `--stills=t`, `--clip=a:b`, `--look=NAME`, `--page=other.html`.

## Encodes
Both encodes put the cold open first: song frames 2925–2964 (SEND. THE. MESSAGE.) with the song's audio from 121.71 s, 1.83 s in all, then the whole film. `COLD` in `render.mjs` sets the splice. The X version is CRF 17 capped at 16 Mbps, with 48 kHz audio.

## Map
- Contracts: `docs/LIBRARY.md` (shared files), `docs/ANIMATION_GUIDE.md` (chapters), `docs/STORYBOARD.md`, `docs/STYLE_SHEET.md`.
- Shared libraries: `src/human.js` (anime cast rig), `src/apps.js` (Teams/Slack/Zoom/Outlook UIs), `src/world.js` (sets).
- Lyrics: `src/lyricplan.js` holds the per-line lettering defaults; chapters override their own lines.
- Chapters: `src/ch/c01..c10`, one `chapter()` each, wrapped in an IIFE.
- Old rig: the pre-anime big-head rig is kept in `work/human_v1_bighead.js`.

## Known weak spots
- Wide stage shots (c02, c04, the c09 slam) are busy at phone size, and the band's heads are small there.
- `world.js` `crowd()` and c09's back-wall tiles still draw the old big-head figures.
- Some UI text sits under the 60 px must-read size: the c06 recap, the c05 treadmill cards and the c04 email paragraph.
- In bust view `person()` doesn't draw a held guitar or bass.
- The `'gun'` hand reads as a middle finger in close framing; don't use it (the film currently doesn't).
