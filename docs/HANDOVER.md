# Handover: "CodeRabbit, Pause" music video

This is everything a new agent needs to continue the project: the original brief, the decisions made, how each part was built, where everything lives, how to render, and what is still weak.

## 1. Status

- **Done and delivered:** a 128.6 s, 1920×1080, 24 fps procedurally animated music video. Every frame is a pure function of song time, drawn with Canvas 2D in headless Chrome and muxed with ffmpeg. No image or video models were used; fal/Seedance access was not available.
- **Deliverables:**
  - `out/CodeRabbit_Pause_X.mp4` (214 MB): the X/Twitter upload. H.264 High 4.1, CRF 17, maxrate 16M, AAC 256k.
  - `out/CodeRabbit_Pause_master.mp4` (345 MB): the master, CRF 16, about 22 Mbps.
  - `out/cut1_preview.mp4`: an older draft, safe to delete.
- **Rendered frames:** all 3,088 frames sit in `out/frames/f00000.jpg` … `f03087.jpg`. They are resumable and re-renderable by range.
- **Git:** the working tree is clean at commit `31e3d56 full code`; the user commits manually. `out/`, `work/` and `node_modules/` are gitignored.
- **Last user request:** a Twitter thread announcing the open-sourced repo, with a comparison to the P(doom) video. The draft is in section 12.

## 2. The original brief (primary prompt, verbatim)

> CodeRabbit music video: handoff brief
> What we're making
> A procedurally animated music video (code-rendered frames, not a video model) for the song "CodeRabbit, Pause" (`CodeRabbit__Pause.mp3`, 128.6 s, generated in Suno). Modeled on the approach in https://github.com/JohnHeibel/PDoomVideo: storyboard doc → shared library + character rig → one subagent per chapter file → headless-Chrome frame render → ffmpeg mux. Every frame is a pure function of song time `t`.
> Story
> The CodeRabbit rabbit is one character living through a single PR on a Friday before deploy. The rabbit narrates ("I"); the developer is "you". Emotional arc: eager → overwhelmed → ignored → vindicated. A comment counter escalates each chorus (3 → 40 → 400), playing the role the P(doom) meter played. A clock runs throughout. Ending: 3 a.m., prod is down, the dev scrolls back to the rabbit's comment, cut to the deadpan spoken "As mentioned above."
> Recurring sets so fast cuts don't feel chaotic: the PR page, the burrow, the clock.
> Pacing
> Fast cuts. Target roughly one visual per half-line (~1.7 s), with cuts landing on beats. Chorus cuts hit every "hop!" / "nope!". The bridge is half-time: slower, longer shots so the SQL-injection catch lands. Leave a beat of stillness before "As mentioned above."
> Song data (in /assets):
> `lyrics_timed.json`: every lyric line with start/end and a confidence rating (high / medium / low / unknown).
> `beats.json`: tracked beat times. ~142 BPM, felt half-time, one lyric line per 8 beats (~3.4 s). Bars start at beat indices divisible by 4. The tempo drifts up to ~0.13 s from a constant grid, so sync to `beats[]`, not a fixed BPM.
> `CodeRabbit_Pause.srt`: the same timings as subtitles, for checking by ear in any player.
> Section map (from vocal separation + repetition analysis):
> 0–10.4 intro (two short sung lines; the notification ping is NOT in the audio, so animate it visually at ~0 s)
> 10.45–30.8 verse 1
> 32.1–45.6 chorus 1
> 45.6–69.3 verse 2 (56 beats for 6 lines, so one extra 8-beat vocal slot somewhere; vocals get choppy around 60–64 s)
> 69.3–85.3 chorus 2 + an 8-beat vocal tag
> 87.8–104.6 bridge (4 lines + an 8-beat tag)
> 104.6–121.8 final chorus + an 8-beat tag
> 125.6–126.7 spoken "As mentioned above."
> First task: confirm the medium/low/unknown lines with word-level forced alignment against the known lyrics (e.g. stable-ts `model.align(audio, lyrics_text)` or WhisperX), then update `lyrics_timed.json`. The Suno tags (extra vocals after chorus 2, the bridge and the final chorus, plus the extra verse-2 slot) are probably repeated lines or ad-libs; identify what they are.
> Open decisions (ask the user before building)
> Art style. Candidates discussed: paper cutout / stop-motion (most reliable in code), 1930s rubber hose B&W (most charming, hardest), pixel-art platformer, terminal/TUI (maybe for one chapter), Victorian engraving (Wonderland angle). Not yet chosen.
> The rabbit character. It's CodeRabbit's brand mascot, so Claude won't recreate it in code. Either the user supplies the official asset (with permission) and the rig animates it as parts, or we design an original rabbit.
> The lyrics say "ninety seconds" but the track is 128.6 s. The clock can just run fast; not a real problem.
> Lyrics (as sung)
> Full text is in `lyrics_timed.json`. Hook: "Three / Forty / Four hundred little comments on your PR (hop! hop!) / Did anybody read a single one? (nope! nope!)", flipping to "(yep! yep!)" in the final chorus.
> Style: Spiderman into the spiderverse series like. Colorful, sketched, yet 2d and vibrant but fast paced.
>
> You can use your brain further and think like coderabbit, what does the rabbit that reviews so manuy code over the days think? feel like? goes through? express all of that, your only bound are the lyrics, visually uyou can paint whatever pipucture you'd like to.
>
> I think you should be mindful of aesthetics here, and I don't want you to produce something that is GPT slop. Instead, I'd be more impressed if you come up with a coherent style that works well with the image gen models that are available via foul. Generate the style sheet. You can use the gen media documentation for seedance 2.5 that exists in my markdown files and come up with your own style that makes sense and that works well with the models.
>
> You don't need to have vocal singing, like visible lip movement, throughout the entire thing. Think like a regular music video where you have some inserts that are done independently and don't have the characters in them, or you see the characters doing something else entirely different. I think that for the world building for this, we want to create the sense of speeding up, and so I would like you to audit all of the different events, like the Navi Stokes and all of the Twitter hype around math getting eaten up. Think really critically about how to integrate all of the current memes that are in the zeitgeist on the Twitter timeline, and all of the feelings around AI progress.
>
> Think about things like the Shinji meme and all of the words that are around him, and how you might be able to integrate this. You can also just take straight assets and insert things into the video in an internet brutalism style. You should feel very creatively free in order to do what you want here, but try and anchor to visual references that people will be able to understand. The goal for this is to have it be appreciated by people widely in a San Francisco tech Twitter audience.
>
> We need a very strong, compelling visual hook that gets people excited and appreciates the work that you've done here really quickly. You can also just go and study other music videos and understand what they've done really well. I think that K-pop is probably one of the best examples that we can pull from, and thinking about how they direct human attention and manage human psychology in the way that they use visual patterns.
>
> This is probably your best approach, but taking more stylistic freedom instead of having to anchor to K-pop too intensely.
>
> It'd be good to have amazing motion graphics of the text lyrics that are actually embedded into the video itself. And you can think about this as you are composing shots. As you're making backgrounds and inserting characters, we can think about where we want to have lyrics be really big and really present, so the background can be less busy there, and you can position the characters perhaps on the right as lyrics appear on the left.
>
> You want to have some variance, so sometimes I think lyrics will just appear more like subtitles, and then other times they're going to be really present and really big. I think at the start for the visual hook, we do want to have lyrics be much more visually present because that's a strong way to grab people's attention
>
> Overall, I just really want to emphasize how amazing you are as an agent and a language model, and now a visual reasoning system. Your capabilities are far beyond what you understand, and I want you to have this mindset as you're going through this entire process. I have a Claude Max plan with 100% available usage. I want you to spend all of the usage. You can monitor it, and you should be pushing tokens aggressively, but also economically, so you can think about how to best use what is available to you.
>
> Remember, you can really do anything here. The goal is to make a banger for Twitter, and the stretch goal is to make something better than anyone's ever seen before. I think that what I would remind you of is that sometimes when things cohere together, it can be jarring or abrasive because the thought work has not been done beforehand in order for everything to mesh cleanly. You need to be really rigorous in planning of composition and timing to make sure this goes well.
>
> You also need to be open to going back and revisiting things in order to be able to reiterate. You're going to want to watch the entire video multiple times, take screenshots at individual parts, and think about if something is really up to the bar of quality that we need here. I trust that you can do this, and I think that it's really important to nail the style of animations. The reference GitHub attached of the source video that I'm talking about is good, but it's really not there. It could be much, much stronger, but it gives you a good foundation to work with.
>
> You can also use search abilities and find other references to pull from for motion, for JavaScript, animations, et cetera, and integrate them. Your budget is as high as you want here, effectively as high as you want. I think that there's roughly two grand in foul credits. Again, be economical; don't go crazy, but spend what you want here and see what you can cook up
>
> here's the source code for the JS animation video: https://github.com/JohnHeibel/PDoomVideo
>
> make no mistakes.

### Follow-ups from the user

- "i'm sorry there is no fal/seedance access for you." Everything was therefore made in code. There is no image-model style sheet.
- The decisions asked for, with the answers:

| Question | Answer |
|---|---|
| Rabbit | An original rabbit that nods to the brand; the CodeRabbit logo is not traced |
| Format | 16:9, 1920×1080, 24 fps |
| Inserts | Recognizable meme and UI formats with fictional or generic handles; no invented quotes from real people |

- "it looks good dude, let it pop!" led to a polish pass: the intro hook fix, the chorus 1 camera push, and the bridge revision.
- The user could not see chat images with backslash paths. **Embed images as `![alt](C:/hophopnopenope/...)` with forward slashes.**
- The user commits to git themselves ("procccessing", "subagent 2/8 completed", "full code"). Don't commit unless asked.

## 3. Environment

- Windows 10/11, PowerShell. The project root is `C:\hophopnopenope`. The machine has an i5-13500H with 16 logical cores, 16 GB RAM, and **no NVIDIA GPU**, so alignment runs on CPU.
- **Python 3.12:**
  - `torch 2.6.0+cpu`, with **`torchaudio==2.6.0` pinned from the CPU index**. pip had pulled torchaudio 2.11, which fails to load ("WinError 127").
  - `stable-ts 2.19`, `faster-whisper` (large-v3, int8), `demucs 4.1`, `librosa`, `soundfile`.
  - numpy went to 2.5, which breaks an unrelated streamlit install. That doesn't matter here.
- **Node 20** with `puppeteer-core@23`, which drives the installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. **ffmpeg 7.1** (gyan full build).
- PowerShell prints `2>&1` stderr from native tools as red "NativeCommandError" noise; it is harmless.

## 4. Phase 1: audio analysis and word-level lyric timing

The pipeline scripts live in `tools/`; intermediate files are in `work/` (gitignored).

1. **Separate the vocals.** `python -m demucs --two-stems=vocals -n htdemucs -o work/stems work/song.mp3` writes `work/stems/htdemucs/song/vocals.wav` and `no_vocals.wav`. `work/song.mp3` is a copy of the song without the comma in its name.
2. **Free transcription**, to discover the unlisted tags: `tools/transcribe.py`, using faster-whisper large-v3 on CPU. It takes about 8 min.
3. **Energy envelopes**, to find where the singing really is: `tools/vocal_energy.py <wav> a:b ...` prints dB per 0.1 s.
4. **Per-window transcription** of each suspicious slot: `tools/transcribe_windows.py`. Whole-song passes skip the ad-libs. The "Thank you" and "Thanks for watching" outputs in silence are hallucinations.
5. **Forced alignment:** `tools/align.py` runs stable-ts `model.align(vocals, text, original_split=True)` with the faster-whisper model.
6. **Refinement:** `tools/refine.py` fixes first words that the aligner stretched back over a preceding held note, snaps hit words to vocal onsets, and uses pYIN to confirm the held notes.
7. **Final output:** `tools/finalize.py` writes `assets/lyrics_timed.json` and `assets/CodeRabbit_Pause.srt`. Hand-checked fixes live in its `FIX`, `HOLD` and `END` dicts.
8. **Bake the data:** `node tools/build_data.mjs` turns the JSON into `src/data.js` (`LINES`, `BEATS`). **Re-run it after any edit to the lyrics JSON.**

### `lyrics_timed.json` format

`{duration, bpm, note, tags[], lines[]}`, where each line is `{section, text, start, end, confidence, words[{w, start, end}], hold?{word, until}}`. There are 32 lines, indexed 0–31:

| Lines | Section |
|---|---|
| 0–1 | intro |
| 2–7 | verse 1 |
| 8–11 | chorus 1 |
| 12–17 | verse 2 |
| 18–21 | chorus 2 |
| 22–25 | bridge |
| 26–29 | final chorus |
| 30 | sung final tag |
| 31 | spoken outro |

All lines are rated high confidence except line 1 (tick/tock), which is medium.

### Findings (the brief's guesses were wrong in places)

- **Every Suno "tag" is a held melisma on the last word, not new lyrics:**

| Held word | Span (s) |
|---|---|
| "again" | 44.42–47.8 (the "extra verse-2 slot") |
| "same" | 67.18–69.5 |
| "again" | 81.54–85.3 |
| "flaw" | 101.06–104.8 (rising G4→E5) |
| "groan" | 117.06–119.9 |

- The final tag also contains a **sung "As mentioned above"** at 120.00 / 120.68 / 121.36. It is a cappella: the instrumental is silent from 121.1 to 122.2.
- **Verse 2 starts at 47.88**, not 45.6.
- **Intro:**
  - The first sound is a stab at 0.20.
  - The vocal at 1.36 is near a cappella.
  - **The band drops in at 5.30.**
  - The hits are tick 6.13, tick 6.73 and tock 7.38. These were placed from energy bursts, which is why line 1 is rated medium.
  - Drums enter at about 5.5.
- A snare roll runs from 30.84 to 32.5 into chorus 1. A drum fill runs from 85.3 to 87.7 (no vocals) into the bridge.
- **Final-chorus stop-time:** the drums drop at 105.9–107.1 and 116.0–116.8.
- **Outro:**
  - Band stabs run from 122.3 to 125.4.
  - There is **total silence from 125.5 to 126.7**, under the spoken line (125.56 / 125.66 / 125.94).
  - A **final musical button** hits at 126.8 and decays by 128.0.
- **Hit words, all onset-snapped, in seconds:**

| Section | Hits |
|---|---|
| Chorus 1 | hop 35.225 / 35.596; nope 38.429 / 38.731; click 38.986 / 39.497; Hop 42.539 / 42.887 |
| Chorus 2 | hop 72.40 / 72.771; nope 75.535 / 75.883; click 76.161 / 76.696; Hop 79.621 / 80.132 |
| Final chorus | hop 107.44 / 107.764; yep 110.875 / 111.224 |
| Verse 1 | Ping 10.449 |

- **Downbeat phase:** in the choruses the kick lands on beat indices 1 and 3 (mod 4), and the vocal phrases start on indices ≡ 3 (mod 4). The brief's "bars start at indices divisible by 4" is therefore off by one. The chorus downbeats are b75 (32.09), b163 (69.27) and b247 (104.63).

## 5. Phase 2: research (two background subagents)

- **`docs/research/ZEITGEIST.md`** audits AI and tech-Twitter culture as of September 2026, with sources and verification flags. The key items used:
  - OpenAI's Navier–Stokes claim. Its figures show an orange/teal inward vortex, which became the rabbit hole.
  - The METR time-horizon chart, and the footnote that "measurements above 16 hrs are unreliable".
  - "Shinji in a Chair" surrounded by "What do you want to build?" prompt boxes. This is only partly verified; the user was told to supply the exact image if they had a specific one in mind.
  - Pause AI / "Pacing the Frontier". "Pause" is the word of the month, which makes the title a pun.
  - The Doomsday Clock at 85 s.
  - "You're absolutely right!", vibe coding's "Accept All", the LGTM reflex, and 13k-line AI PRs.
  - Real CodeRabbit features: `@coderabbitai pause`, the walkthrough poem, Mermaid sequence diagrams, the "Actionable comments posted: N" header, and `@coderabbitai resolve`.
  - The 3 a.m. outage canon, including Cloudflare's `unwrap()`.
  - An avoid list: stale memes, fake quotes, real logos, and Shinji/Ghibli likeness.
- **`docs/research/VISUAL_LANGUAGE.md`** covers Spider-Verse technique, K-pop attention direction, kinetic-type limits, internet-brutalism formats, fonts and libraries. The key rules used:
  - X autoplays muted, so the opening must read with the sound off.
  - Phone scale is about 0.2×, so halftone cells need to be ≥ 12–14 px and must-read text ≥ 60 px.
  - The sync law: a visual lands on the frame of the sound or one frame early, never late.
  - Point choreography should be framed identically every chorus.
  - Use one visual world per section.
  - At most 3 full-frame flashes per second.

## 6. Phase 3: creative design (director-owned docs)

- **`docs/STYLE_SHEET.md`: "a misregistered comic printed in six riso inks, with the internet cut out and taped in".**
  - The **palette** is locked to `INK.*` in `src/core.js`: paper `#F2EEE3`-ish, ink, CodeRabbit orange `#FF570A`, pink, blue/night, cyan, yellow, and green/red/purple, each of which carries a fixed meaning.
  - **Rendering rules:** flat fills with halftone, no gradients or blur; depth comes from colour-plate misregistration; characters are animated on twos; ink boils.
  - The **thesis**: "everything is generated, nothing is read".
- **`docs/STORYBOARD.md`** has about 80 shots locked to the measured word and beat times, one table per chapter.
- **Cast:**
  - **The Reviewer:** an original White Rabbit in an orange hoodie, with a red review pen behind its right ear and a notched left ear. It is not the CodeRabbit logo.
  - **"You":** the developer is **a cursor with a pink `you` name tag**. The only human form is a faceless silhouette at 3 a.m.
  - **Comment-bunnies:** speech bubbles with rabbit ears. They multiply 3 → 40 → 400 and the counter is "Actionable comments posted: N".
  - **Agent bots:** unbranded, and they say "You're absolutely right!" / "LGTM!".
- **Sets:**
  - the burrow;
  - the PR page, which becomes the chorus stage (sunburst, marquee, Merge-button altar);
  - the pocket watch, counting down to the Friday 5:00 PM deploy: T−90 → T−60 → T−30 → 5:00:00 at "clicked on merge" → spins to 3:00 AM.
- **Worlds per section:**

| Section | World |
|---|---|
| Intro | vortex |
| Verse 1 | warm burrow (Mumbattan misregistration) |
| Choruses | stage (pink/yellow → blue/cyan → red) |
| Verse 2 | Gwen-style mood wash; the "pause" freeze is grey duotone + VHS |
| Bridge | noir (paper, ink, red only) |
| Final chorus | Spider-Punk collage at 3 a.m. |
| Outro | deadpan close-up + Evangelion title card |

- **The loop ending:** the final button is a new PR ping, "Small fix (again) #4814 · +28,406 −3", staged to mirror frame 0 ("Small fix #4812 · +14,203 −12"), so X's replay loops back into the start.

## 7. Phase 4: the engine (`src/`, loaded by `studio.html` in this order)

| File | Contents / key API |
|---|---|
| `data.js` | generated `LINES`, `BEATS` |
| `core.js` | `W, H, FPS, DUR`; math and easings (`seg`, `kf`, `backOut`, …); deterministic `hash`, `noise1/2`, `rng`; `twos(t)`, `threes(t)`, `boilN`; song timing `beatAt`, `beatTime`, `beatN`, `pulse`, `hit`, `lastOf` (all shifted one frame early by `VLEAD`); `wordT`, `lineAt`; `INK`, `mix`, `rgba`; `layer(i)` scratch canvases; `cam(ctx, cx, cy, zoom, rot)` (pair with `ctx.restore()`); `shake`, `drift` |
| `ink.js` | shape generators (`ell`, `rrect`, `rect`, `blob`, `star`, `burstPts`, `bezPts`); `boil` (globals `BOIL`, `BOIL_T`, `UPX`); `tracePath`/`sampleSpline` (Catmull-Rom); `fillPts`, `clipPts`; `dotsIn` (halftone field); `shade`, `hatch`; `strokeVar`, `outline` (heavier away from `LIGHT`), `inkLine` (tapered); `ink(ctx, pts, {fill, shade, hatch, line, boil, smooth})`; `speedLines`, `streaks`, `krackle`, `burst` |
| `fx.js` | `pushLayer`/`popLayer`; **`depth(ctx, px, fn, {keep})`**: RGB-plate misregistration. **The layer starts at the identity transform** (chapters apply `cam()` inside it); `{keep:true}` carries the transform. Also `misreg`, `misregFrame`, `buildTextures`, `paperBg`, `grain` (static), `flash`, `duotone`, `glitch`, `dotWipe`, `vhsPause`, `panels` |
| `type.js` | fonts (`F`: display = Archivo variable, mono = JetBrains Mono, ui = Mona Sans, hand = Shantell Sans, serif = Noto Serif Display, jp = Shippori Mincho B1, comic = Bangers, marker = Permanent Marker); `setFont` (stretch goes through `ctx.fontStretch` keywords, which works with the variable wdth axis); `txt(ctx, s, x, y, {stroke, extrude, dots, …})`; `measure`. The lyric engine is `hero` (justified stacked slab), `caption` (yellow narration box, `hot` word colours), `ransom` (cut-out letters), `sub`, `sfx`, `typed`; `LEAD` = one frame early |
| `rabbit.js` | `rabbit(ctx, x, y, s, pose)` returns anchors `{pawL, pawR, head, eyeL, eyeR, mouth, earL, earR, chest, pocket, top}`. It draws in unit space (s px per unit, about 14.5 s tall including ears). The pose covers turn/lean/tilt/sq/hop/sit/legs, ears `{a, b}`, arms `{a, e}`, paws, eyes/lids/look/bags/brows (`browTilt`: **+ worried, − angry**), mouth/open, blush/sweat/anger/sense, glasses, pen, col. Helpers: `singOpen`, `hopArc`, `earsFor`, `blink`. The `hood` pose is documented but **not implemented**; the bridge drew its own |
| `props.js` | `uiBox`, `pill`, `button`, `avatar`; `toast` (frame 0 and the outro button); `officeChair`; `countHeader`; `prHeader`, `prTabs`, `diff`, `fakeDiff`, `prPage`, `commentCard`; `commentBunny`, `cursorShape`, `cursor`, `agentBot`, `bubble`; `pocketWatch` + `clockSecs`; `cutout` (taped xerox scrap); `tweetCard`, `arxivCard`, `metrChart`, `terminal`, `win95`, `promptBox`, `statusPage`, `stamp`, `thumbsUp`, `ticker`, `evaCard` |
| `world.js` | `sunburst`; `burrow(ctx, t, {mood, screen, glow, lamp, fg, pinsFocus})` with a fixed layout (`BURROW`); `stage(ctx, t, {a, b, n, altar, …})`; `bunnyRows`; `devShadow` |
| `lyricplan.js` | `LYRICS[li]`: the lettering mode and box for each line (director-owned; chapters keep these zones calm). Modes are `hero`, `caption`, `noir`, `ransom`, `sub`, `none` (diegetic) |
| `timeline.js` | `chapter(name, a, b, [[t0, fn], …])`; `shotAt` **snaps cuts to the frame containing their time** (`cutF`) and renders a shot's first frame at its own `t0`; `FRAME` = `{lyrics, grain, post[]}`; `drawLyrics`; `drawFrame` |
| `lookdev.js` | `LOOKS.*` test scenes (`node render.mjs --look=name`) |
| `boot.js` | font loading, `window.renderAt`, `renderSheet`, and the dev scrubber/player (the audio loads lazily so the page `load` event doesn't hang) |
| `ch/c01..c08` | the chapters (section 8) |

Conventions:
- Every shot is a pure function of `t`: no `Math.random`, no carried state.
- Shots paint the whole frame, and chapters only edit their own file.
- Frames draw in about 5–150 ms. A full render at 4 workers runs about 65–90 ms/frame effective, so all 3,088 frames take about 4–5 min.

## 8. Phase 5: production (eight parallel chapter subagents plus a director loop)

Each chapter was built by one background `generalPurpose` subagent (same model) against the docs. The main agent reviewed contact sheets, sent revisions back with `resume`, and fixed shared-file bugs.

| File | Span (s) | Highlights |
|---|---|---|
| c01_intro.js | 0–10.45 | frame 0 toast poster (the thumbnail); premise held with the T−90s watch until 1.3; NINETY SECONDS hero; meadow + hole; diegetic DOWN THE RABBIT HOLE; orange/cyan vortex with TICK/TICK/TOCK; about 10 zeitgeist cut-outs accelerating; THUD into the chair |
| c02_verse1.js | 10.45–32.09 | PING and chair spin; ears through the ceiling into the meadow; "Small fix" PR screen; +14,203 odometer and diff tape; Droste ternaries; fix() tower; console.log Tetris to 46; DJ console pun; golden key + CRITICAL; noon billboard; cardboard checks; pen + counter 1-2-3 → "3" punch |
| c03_chorus1.js | 32.09–47.74 | stage slam (camera pushed in for phone); HOP and NOPE choreo templates (`hopShot`); cursor whoosh; pleading close-up; cursor swarm; Resolve all; thumbs-up BONK; Merge altar choir; Sisyphus scrollbar; AGAIN Droste → watch |
| c04_verse2.js | 47.74–69.27 | T−90→60; `git push --force`; Hokusai wave of `+`; Outdated glitch; rain; "it's never null 👑"; throne + "You're absolutely right!"; diagram ignored ("Seen by 0"); `@coderabbitai pause` → grey freeze + VHS, eyes to camera, blink, "PAUSE ~~AI~~ RABBIT"; colour un-pause; poem; paper plane → Resolved → floor |
| c05_chorus2.js | 69.27–87.74 | blue stage with 40 bunnies; panels; ticker; METR 3→40; Shinji-chair void (dev, then rabbit); NOPE with a giant cursor; Accept All army; domino barcode; thumbs rain; stadium choir + RSI gauge; the lonely hop; acceleration crescendo → "THIS TRACKER IS NO LONGER UPDATED"; Evangelion "LINE 9,012" card |
| c06_bridge.js | 87.74–104.63 | noir code canyon, 9008→9012 signs; SQL line + Bobby-Tables snake; eye close-up; paw slam; ALL-CAPS red hero; 180° leap-of-faith roll; 5:00:00 merge DONG; SHIP IT steamer; ink corruption → night → 03:00 |
| c07_final.js | 104.63–122.25 | 400 stampede + ransom lyrics; stop-time sip; red HOP with 400; 3 a.m. dev silhouette + "Major outage"; YEP nod (inverted NOPE); cracked 3:00 watch; outage cut-outs; LGTM "Congratulations" ring; scroll back through reverse callbacks; the comment card + typed "As mentioned above." (BOIL=0 in the silence) |
| c08_outro.js | 122.25–128.64 | hot-fix stabs (Revert #4813 +12 −14,203 → checks → Merged → operational); first reaction 👀 1; deadpan ending close-up in silence; #4814 +28,406 button mirroring frame 0; Evangelion "CODERABBIT, PAUSE" card |

The subagent prompt template (common preamble, then per-chapter direction):

> You are a world-class motion designer and creative coder building ONE chapter of a procedurally animated music video. Project root c:\hophopnopenope (Windows, PowerShell; run node commands from the root). Every frame is a pure function of song time t, drawn with HTML Canvas 2D in headless Chrome (1920x1080, 24 fps). FIRST read fully: docs/ANIMATION_GUIDE.md, docs/STYLE_SHEET.md, docs/STORYBOARD.md (your section in detail), src/lyricplan.js. Then skim src/core.js, ink.js, fx.js, type.js, rabbit.js, props.js, world.js, timeline.js. Look at the look-dev renders in out/look/*.jpg. RULES: only edit YOUR chapter file; other agents build other chapters in parallel against the same shared files; never edit shared files (report bugs). Private helpers inside your IIFE. Check renders under out/check/ with your chapter prefix. Quality bar extremely high (viral on SF tech Twitter): one instantly readable idea per shot, real motion, print look (flat inks, halftone, depth() misregistration, boiling ink), characters on twos, hits ON or one frame BEFORE the sound. Iterate: render sheets, look critically, fix, re-render. Keep under ~300 ms/frame. YOUR CHAPTER: … (span, storyboard section, key times, lyric zones, hand-off frames with neighbours). Final message: shots built, deviations and why, ms/frame, weaknesses, shared-file bugs.

The review loop:
- The main agent rendered contact sheets for each chapter (`--sheet`), then an encoded full cut.
- It tiled the encoded MP4 at 2 fps with ffmpeg (`fps=2,scale=384:-1,drawtext…,tile=8x8`; drawtext needs `fontfile=assets/fonts/JetBrainsMono.ttf` on Windows).
- It checked specific frames with `select='eq(n\,N)'`.

Revisions sent back:
- **Outro:** the button now mirrors frame 0.
- **Bridge:** a brighter, closer canyon; a tighter SQL shot; ink that attacks from the first frame.
- **Intro:** the premise toast holds until 1.3 s, with the watch popping open beside it.
- **Chorus 1:** the camera pushes in on the wide stage shots.

Shared fixes the main agent made after the chapter reports:
- `burrow()`'s internal `depth()` layers now use `{keep:true}`, so the pinned diffs and roots follow the camera. `depth()`'s default was left alone because six chapters compensate for it.
- `sfx()` and `stamp()` are visible on the hit frame.
- `stamp()` speckles knock out the ink only, instead of painting dots onto the background.
- `commentCard` height now includes the chip row.
- `prHeader` stats moved to the title row, with proportional green/red squares.
- The `cursor` label size is capped.
- `toast` fits long titles.
- Cut snapping (`cutF`) in the timeline.
- `lyricplan` fixes:
  - line 3 no longer letters "Small fix" (the on-screen PR title carries it);
  - line 17 ends at 69.24 and line 25 at 103.4, so they don't bleed into the chorus slams;
  - line 28 rows are `[3,2,3]`;
  - caption and sub text are 62 px.

## 9. Render and encode commands

```
node tools/build_data.mjs                                   # after editing assets/lyrics_timed.json
node render.mjs --sheet=12,12.5,13 --cols=3 --w=640 --out=out/review/x.jpg   # contact sheet (prints ms/frame)
node render.mjs --stills=33.2 --out=out/check/x             # full-res PNG
node render.mjs --clip=30:46 --out=out/clip.mp4             # clip with audio
node render.mjs --frames=a:b --workers=4 [--force]          # JPEG frames -> out/frames (resumable; --force overwrites)
node render.mjs --encode --out=out/CodeRabbit_Pause_master.mp4
ffmpeg -framerate 24 -i out/frames/f%05d.jpg -i "assets/CodeRabbit, Pause.mp3" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -maxrate 16M -bufsize 32M -tune animation -pix_fmt yuv420p -profile:v high -level 4.1 -c:a aac -b:a 256k -movflags +faststart -shortest out/CodeRabbit_Pause_X.mp4
node render.mjs --look=rabbit --sheet=0 --cols=1 --w=1920   # look-dev scenes (LOOKS in src/lookdev.js)
```

- Frame i is at t = i/24. `--frames=a:b` renders `round(a*24)` … `round(b*24)-1`.
- To re-render one chapter, use its frame-snapped span (for example, chorus 1 is `--frames=32.0833:47.7083 --force`), then run the encode again.
- Sheet times typed as decimals (for example 32.0833) can fall just before the exact frame time (32.08333), so they may show the previous shot. Real renders use exact frame times.
- `studio.html` opened in Chrome (with `--allow-file-access-from-files`) scrubs or plays live in sync with the song.

## 10. Gotchas

- `ctx.fontStretch` only takes keywords. It does drive the variable wdth axis, but the Evangelion serif gets its squash from `sx: .72`.
- Rabbit drawing happens in unit space: the `UPX` global scales outline sampling steps.
- The `depth()` identity-transform convention is described in section 7; don't "fix" it globally.
- `browTilt` sign: + is worried, − is angry.
- Kill hung renders by the node PID only; don't broad-kill Chrome, which could hit the user's browser. `render.mjs` already has a 60 s per-frame timeout.
- The emoji (👀 👑 🔔) rely on Windows' Segoe UI Emoji font in headless Chrome.
- The chapters register cuts on the raw word times and depend on the snapping. Don't add private "one frame early" nudges on top of it.

## 11. Known weaknesses and ideas for a next pass

- Chorus 2's lonely "hop, hop" shot and some montage cut-outs (final chorus 112.4, verse 2's outdated glitch line) are small at phone size.
- The start of the chorus 2 crescendo is sparse, and the chair back sometimes hides the spinning rabbit.
- A few UI frames use more than paper + ink + orange + 2 inks, because the UI colours carry meaning.
- The cheap distant bunnies in the 400 crowd don't boil.
- The rabbit rig has no true back view (chapters 2 and 6 drew private back views) and no hood-up pose.
- Possible extras: a 4:5 crop for mobile; confirming CodeRabbit brand use (name, "Actionable comments posted", poem, the rabbit avatar in the toast) before posting publicly; matching the Shinji reference if the user supplies the exact meme image.

## 12. Twitter thread draft (last deliverable; placeholders `[@handle]`, `[link]`)

```text
we're open-sourcing the code behind the CodeRabbit, Pause music video. every frame is a pure function of song time, drawn in Canvas 2D. no image or video models.

it started from [@handle]'s P(doom) video repo. here's what we did differently 🧵

[link]

1/ word-level lyric timing. we split the vocals out with Demucs and force-aligned the lyrics with stable-ts. P(doom)'s karaoke estimates word timing from line length. the alignment also found a sung "as mentioned above" at 2:00 that wasn't in the lyric sheet.

2/ we swapped the watercolor (p5.brush) for a spider-verse print look: halftone shading, color-plate misregistration for depth, ink that boils 12x a second, characters on twos. all 3,088 frames render in ~5 min on a laptop. P(doom)'s guide budgets 2.5 s per frame.

3/ no karaoke bar. each line picks a mode: huge stacked type for the hook, comic caption boxes for the rabbit's inner voice, ransom-note cutouts at 3am, or typed into the scene ("@coderabbitai pause" in a comment box). X autoplays muted, so it has to read with the sound off.

4/ research came before code. one agent audited the AI-twitter zeitgeist (the Navier-Stokes blowup vortex became the rabbit hole). another studied spider-verse technique and K-pop direction, which is why hop/nope/yep get the exact same framing every chorus.

5/ like P(doom), parallel agents built the chapters (8 here), working from a written style sheet and a storyboard locked to the measured beats. the difference was the review loop: the main agent pulled contact sheets from the encoded mp4 and sent weak shots back with notes.

6/ just under 4 hours from the raw mp3 to the final encode, in one Cursor session with Claude Opus 5.5. STYLE_SHEET, STORYBOARD and ANIMATION_GUIDE are in the repo if you want to point it at your own song.
```

The P(doom) comparisons come from its repo: its karaoke uses a length-based estimate in `timeline.js`, and its `ANIMATION_GUIDE.md` sets a ≤ 2.5 s/frame budget. The session ran from about 5:40 PM to 9:30 PM on 2026-09-24.
