# This Could Have Been a Text: handover

## Outputs
- `out/cbat.mp4`: master, 1920x1080, 24 fps, x264 CRF 16, AAC 256k (about 470 MB).
- `out/cbat_x.mp4`: X upload, CRF 17 capped at 16 Mbps, AAC 256k 48 kHz, faststart (about 260 MB).
- `out/frames/`: the 4317 rendered JPEG frames (0 .. 179.833 s).

## Re-render
Run from `cbat/`:
- one chapter's frames again: `node render.mjs --frames=A:B --workers=4 --force`; use A one frame early (e.g. 20.58 for 20.62), because a chapter's first frame is `floor(a * 24)`.
- the master: `node render.mjs --encode --out=out/cbat.mp4`.
- the X version: the ffmpeg line in "Encodes" below.
- checks: `--sheet=t1,t2 --cols=4 --w=480 --out=out/check/x.jpg`, `--stills=t`, `--clip=a:b`, `--look=NAME`, `--page=other.html`.

## Encodes
`ffmpeg -framerate 24 -i out/frames/f%05d.jpg -i assets/song.mp3 -map 0:v -map 1:a -c:v libx264 -preset slow -tune animation -crf 17 -maxrate 16M -bufsize 32M -pix_fmt yuv420p -profile:v high -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/cbat_x.mp4`

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
