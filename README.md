# CodeRabbit, Pause

A procedurally animated music video for the song "CodeRabbit, Pause" (`assets/CodeRabbit, Pause.mp3`, 128.6 s).

Every frame is a pure function of song time, painted with Canvas 2D in headless Chrome and muxed with ffmpeg. No image or video models are used. The pipeline is modelled on [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo): a storyboard, then a shared drawing library and character rig, then one file per chapter, then a frame render, then an ffmpeg mux.

[![Anti-Trust-War Machine](https://img.youtube.com/vi/EnmpDgFD3OI/maxresdefault.jpg)](https://www.youtube.com/watch?v=EnmpDgFD3OI)

## Docs

- `docs/STYLE_SHEET.md`: the look (six riso inks, halftone, misregistration, stepped timing), the cast, typography and layout modes.
- `docs/STORYBOARD.md`: every shot, locked to measured word and beat times.
- `docs/ANIMATION_GUIDE.md`: the drawing API and the rules for chapter files.
- `docs/research/ZEITGEIST.md`: the AI and tech-Twitter reference audit behind the inserts.
- `docs/research/VISUAL_LANGUAGE.md`: Spider-Verse, K-pop and kinetic-type technique research.

## Song data (`assets/`)

- `lyrics_timed.json`: every line with **word-level** times, produced by stable-ts forced alignment (faster-whisper large-v3) on a Demucs vocal stem and cross-checked by free transcription. The file also records `hold` spans for the melismas and `tags` explaining each unlisted Suno slot.
- `beats.json`: tracked beats. `CodeRabbit_Pause.srt` holds the same timings as subtitles.
- `tools/`: the alignment pipeline (`transcribe.py`, `transcribe_windows.py`, `align.py`, `refine.py`, `finalize.py`, `vocal_energy.py`) and `build_data.mjs`, which bakes the JSON into `src/data.js`.

## Code (`src/`)

| File | What |
|---|---|
| core.js | math, deterministic randomness, song timing (beats, words, sync law), inks, layers, camera |
| ink.js | shapes, boiling tapered ink outlines, halftone shading, hatching, speed lines, bursts |
| fx.js | colour-plate misregistration, paper and grain, glitch, VHS pause, dot wipe, duotone, comic panels |
| type.js | lettering and the lyric engine (hero stack, caption box, subtitle, ransom note, SFX) |
| rabbit.js | the Reviewer rig |
| props.js | PR UI, comment-bunnies, cursor, agent bots, pocket watch, printed inserts |
| world.js | the burrow and the chorus stage |
| lyricplan.js | how each lyric line is lettered |
| timeline.js | chapter registry and frame assembly |
| ch/*.js | the eight chapters |

## Rendering

You need Node.js, Google Chrome and ffmpeg. Run `npm install` first. Then:

```
node tools/build_data.mjs                             # after editing assets/lyrics_timed.json
node render.mjs --sheet=12,13,14 --cols=3 --w=640     # contact sheet for quick checks
node render.mjs --clip=30:46 --out=out/clip.mp4       # a clip with audio
node render.mjs --frames=0:128.64 --workers=6         # all frames -> out/frames (resumable)
node render.mjs --encode --out=out/coderabbit_pause.mp4
```

Open `studio.html` in Chrome (`--allow-file-access-from-files`) to scrub or play in real time with the song.
