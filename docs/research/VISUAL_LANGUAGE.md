# Visual Language: "CodeRabbit, Pause"

Research brief for a 128.6 s, 1920×1080, 24 fps music video drawn procedurally with Canvas 2D. Rules come first. History is kept only where it changes a decision. Sources are linked inline and collected at the end. Research date: 2026-09-24.

---

## 0. Numbers that everything else depends on

| Quantity | Value at 24 fps |
|---|---|
| 1 frame | 41.7 ms |
| 1 beat (142.2 BPM) | 0.422 s ≈ 10.1 frames |
| Felt half-time pulse (2 beats) | 0.844 s ≈ 20 frames |
| 1 bar (4 beats) | 1.69 s ≈ 40.5 frames |
| 1 lyric line (8 beats) | ≈ 3.38 s ≈ 81 frames |
| On-twos character drawings | 12/s ≈ 5 per beat |

- The beat grid drifts by up to 0.13 s, so sync to `assets/beats.json`, not to a constant BPM. `assets/lyrics_timed.json` only has line-level times. Word reveals need word onsets, either from the transcription tool's word timestamps or by snapping words to the eighth-note grid.
- **Sync law.** Put a visual hit on the frame at the transient or up to one frame before it, never after. ITU-R BT.1359 puts the detectability threshold at +45 ms when sound leads the picture and −125 ms when sound lags it. In other words, a picture that arrives late is noticed after about one frame, while a picture that arrives early is tolerated for about three. ITU-T J.248 adds that impulsive sounds such as drums may have narrower limits ([ITU-R BT.1359](https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I%21%21PDF-E.pdf), [ITU-T J.248](https://www.itu.int/rec/dologin_pub.asp?id=T-REC-J.248-200806-I%21%21PDF-E&lang=e&type=items)). Implementation: `hitFrame = floor(beatTime * 24)`.
- **Section map** (from the SRT and lyrics JSON). The gaps between sections are free moments for switch-ups.

| Section | Time | Notes |
|---|---|---|
| Intro | 0–10.4 s | "Ninety seconds on the clock" starts at 1.36 s, so this is the hook window |
| Verse 1 | 10.45–30.4 s | Six "list of sins" lines: 14k-line diff, ternaries, 46 console.logs, leaked key, skipped tests |
| Gap | 30.4–32.1 s | 1 bar: switch-up or slam cut |
| Chorus 1 | 32.1–45.6 s | "Three little comments… (hop! hop!)… (nope! nope!)" |
| Verse 2 | 45.6–69.3 s | Force-push, "never null", the diagram, **"CodeRabbit, pause"** at 59.1 s, the poem at 62.5 s |
| Chorus 2 | 69.3–85.3 s | "Forty little comments", plus a tag |
| Gap | 85.3–87.8 s | 2.5 s: Evangelion-style title card slot ("LINE 9,012") |
| Bridge | 87.8–104.6 s | "flagged it red… you clicked on merge… shipped the flaw" |
| Final chorus | 104.6–121.8 s | "Four hundred comments", "(yep! yep!)", "3 a.m., prod's down" |
| Outro | 125.6–126.7 s | Spoken "As mentioned above." Hold until 128.6 s |

---

## 1. Spider-Verse visual grammar as procedural techniques

### 1.1 Why it reads as Spider-Verse at a glance
Viewers recognize the look from five substitutions. Each replaces a normal CG convention with a printed-comic one:
1. **Color fringes where you'd expect blur.** Depth of field is done as offset-print misregistration, not lens blur ([Imageworks](https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse)).
2. **Dots and lines where you'd expect gradients.** "Soft gradations are avoided in favor of halftoning and line hatching" ([Imageworks](https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse)).
3. **Choppy, crisp characters against smooth camera moves.** Characters are "primarily on twos" with "no motion blur" ([AWN, Beveridge](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse)).
4. **Comic text living inside the frame.** Narration boxes and onomatopoeia are part of the image ([Fantasy/Animation](https://www.fantasy-animation.org/current-posts/super-psych-into-the-discourse-verse)).
5. **Ink lines that describe acting, not just outlines.** "Emotional acting lines" are built into rigs, and form lines come from the effects department ([AWN](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse)).

Governing attitude: "nothing could be soft… it had to snap"; "computers make perfect arcs that you could never draw"; and "never just do one trick, always be changing the trick" (Beveridge, same AWN interview).

### 1.2 Technique cards (film evidence → Canvas recipe → cost)

| Technique | What the films did | Canvas 2D recipe | Cost |
|---|---|---|---|
| **Stepped timing** | Mostly on twos, no motion blur. Animators switch between ones and twos per moment ([AWN](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse)) | Give each layer a `step`. Sample its animation at `tq = floor(f/step)*step/24`. Rabbit = 2; camera, type and UI = 1; the fastest 4–8 frames of a hit = 1; collage = 3 or 4. Break smooth easing into holds plus fast transitions | Trivial |
| **Misregistration as depth of field and motion trail** | Offset-print misregistration replaces lens blur ([Imageworks](https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse)). The *ChromaShifter* tool, driven by motion vectors, produces motion trails ([Foundry](https://www.foundry.com/insights/film-tv/graphic-look-in-comp-spiderman)). *Across* added a CMYK "separator" tool and ran into additive vs. subtractive color problems ([Foundry](https://colorway.foundry.com/insights/film-tv/across-the-spider-verse-nuke-mari-katana)) | Render each depth layer once to a buffer. Composite on paper with `globalCompositeOperation='multiply'`: black ink aligned, cyan and magenta copies offset by `k·|z − zFocus|` (0 at focus, up to 8–12 px). For fast movers, offset along −velocity. Use integer pixel offsets | Low |
| **Halftone and hatching instead of gradients** | *Thresher* and *Hatcher* tools vary dots and lines thick-to-thin with lighting. Dots should *track the character* during fast moves ("otherwise he'll appear to be swimming through a pattern") but stay loose when they represent light. Glows are "sprinkled" halftone ([Foundry](https://www.foundry.com/insights/film-tv/graphic-look-in-comp-spiderman)) | 2–3 flat tone bands per shape. Dots in light, rim and glow areas; hatching in shadow; cross-hatching in core shadow. See §6.2 | Low–medium |
| **Ink linework** | Two kinds of lines: acting lines (built into rigs, hand-placed) and form lines (effects department). "We didn't use a toon shader" ([AWN](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse)) | Contour lines are tapered `perfect-freehand` strokes, thicker on the shadow side. Acting lines are short strokes on brows, cheeks and ears. Re-seed the line boil once per drawing | Medium |
| **Smears, multiples, eroded action lines** | "Floating limbs and deconstructed edges, little eroded action lines" ([AWN](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse)). Smears are elongated in-betweens; multiples duplicate a shape along its motion path ([Wikipedia](https://en.wikipedia.org/wiki/Smear_frames)) | When a shape moves more than about ⅓ of its size between drawings, insert 1–2 frames containing a stretched silhouette along the path, 2–4 CMY-tinted multiples, and dry-brush streaks | Medium |
| **Kirby krackle** | A field of black dots forming negative space *around* energy ([Wikipedia](https://en.wikipedia.org/wiki/Kirby_Krackle)) | Poisson-disk points inside a noise-thresholded blob. Dot radius shrinks toward the edges. Black dots on a bright energy color. Re-seed every 3 frames | Low |
| **Captions and onomatopoeia** | Miles' thoughts appear in narration boxes; sound effects are drawn next to the action ([Fantasy/Animation](https://www.fantasy-animation.org/current-posts/super-psych-into-the-discourse-verse)) | Yellow box, 3–4 px black border, ±2° tilt, hard offset shadow, all-caps lettering. Sound effects get a thick outline, an offset shadow, and a halftone fill inside the letters. They pop on the transient with a 2–3 frame overshoot | Low |
| **Split-screen panels and template repetition** | Comic panel layouts. Each Spider-Person gets the same "let's do this one last time" origin recap in their own style, which is repetition with variation | Panel grid with cream paper showing in the gutters and ink borders. Each panel appears on a beat and runs on its own time offset | Low |
| **Glitch** | The art style "glitches" to show a dimension rejecting a character ([Fantasy/Animation](https://www.fantasy-animation.org/current-posts/super-psych-into-the-discourse-verse)) | For 2–6 frames: horizontal band displacement, RGB split, palette swap | Low |

### 1.3 *Across the Spider-Verse* worlds and which song section each one suits
Style tells the story in these films ("style is part of the storytelling", [AWN](https://www.awn.com/animationworld/unpacking-spot-and-hobies-disruptive-styles-spider-man-across-spider-verse)). Borrow the *mechanism*, a distinct world per section, rather than the specific looks.

- **Gwen, Earth-65: watercolor.** The world "changes in every shot like a mood ring keyed to Gwen's emotional state" (painted with Rebelle). Frames are flat and graphic and sometimes fall off into white space. Her drum opening was "timed out to music" with cleaner 2D shapes ([IndieWire](https://www.indiewire.com/features/animation/spider-man-across-the-spider-verse-animated-worlds-interview-1234874269/), [Deadline](https://deadline.com/2023/12/spider-man-across-the-spider-verse-nimona-teenage-mutant-ninja-turtles-mutant-mayhem-vfx-supervisor-magazine-feature-animation-1235681172/)). → **Verse 2:** a background wash whose hue follows the rabbit's frustration. Build it from large noise-edged blobs with a darker "wet edge" rim, composited with multiply. It must never be a gradient.
- **The Spot: pencil and ink.** "The undoing of comic book language": blue-line pencil, gesso, and ink "chewing away" at the surface. "If he's moving fast, the artist is drawing fast" ([AWN](https://www.awn.com/animationworld/unpacking-spot-and-hobies-disruptive-styles-spider-man-across-spider-verse)). → **Bridge ("shipped the flaw"):** ink corruption that spreads across the frame. Global rule: **line roughness scales with speed.**
- **Pavitr's Mumbattan, Earth-50101.** 1970s comics on pulpy paper with printing misalignment and "colors and forms outside the lines". The palette is simplified, so detail lives in the ink lines (Imageworks built a tool called *Kismet* for this) ([Foundry](https://colorway.foundry.com/insights/film-tv/across-the-spider-verse-nuke-mari-katana), [IndieWire](https://www.indiewire.com/features/animation/spider-man-across-the-spider-verse-animated-worlds-interview-1234874269/)). → **Verse 1:** offset the fill from its linework by 3–8 px and keep a limited palette.
- **Spider-Punk, Earth-138: collage and zine.** Made with a Xerox, newspapers, masking tape, razor blades, highlighters and staples. "His body being on a frame rate of fours and his vest being on threes, or vice versa". The cut-out edges are "always dancing, acting like a keep-alive". His guitar has the lowest frame rate. "Consistently inconsistent", and "we just slap people in the face with the feeling" ([AWN](https://www.awn.com/animationworld/unpacking-spot-and-hobies-disruptive-styles-spider-man-across-spider-verse)). → **Template for every internet-brutalism insert, and for the final chorus.**
- **Earth-42: noir.** "No gradient anywhere", linework reveals light, ink splatter, saturated red, black and green ([IndieWire](https://www.indiewire.com/features/animation/spider-man-across-the-spider-verse-animated-worlds-interview-1234874269/)). → **Bridge palette:** the red-flag and security-bug moment.

### 1.4 The five techniques with the most recognizability per unit of effort
1. **CMY misregistration for depth and speed.** It is the most-copied tell and needs only 2 extra draws per layer.
2. **Stepped timing:** rabbit on twos, camera and type on ones, hits on ones. One line of time math.
3. **Halftone dots in light, hatching in shadow, 2–3 flat tone bands.** Pattern tiles make it close to free.
4. **In-world comic lettering:** caption boxes, onomatopoeia, panels. It doubles as the lyric system, which makes it the best value in this project.
5. **Ink contours with boil, plus smears and eroded action lines instead of motion blur.**

Runner-up: the dimension glitch, used 2–6 frames at a time on section changes.

**Phone-scale correction (derived).** On X mobile, a 1920-px frame shows at roughly 390 CSS px wide, about 0.2×. Film-scale detail disappears at that size and turns into compression mush, so scale everything up:
- Halftone cells ≥ 14 px, and 40–80 px on hero backgrounds.
- Misregistration offsets of 4–12 px.
- Contours ≥ 4 px and sound-effect outlines ≥ 8 px.
- Keep paper texture **static**. Grain that changes every frame wastes bitrate and gets smeared by the re-encode.

---

## 2. K-pop direction: how attention is managed (mechanisms, not surface)

This section translates mechanisms. It does not copy idol styling. Analyzed directly: NewJeans (*Ditto*, *Super Shy*, *ETA*, *OMG*), aespa (*Supernova*, *Whiplash*), ILLIT (*Magnetic*), LE SSERAFIM (*Antifragile*), BTS (*IDOL*, *Heartbeat*). Other groups on the brief are covered by the general principles below, not by individual sources.

### 2.1 The first 3 seconds
- **X autoplays video muted in the timeline** ([Techdows](https://techdows.com/2015/08/disable-or-stop-videos-from-autoplaying-on-twitter.html), [PCMag](https://www.pcmag.com/how-to/make-it-stop-how-to-turn-off-autoplay-videos-on-social-media-streaming)). The opening therefore has to work silently. Giant lyric type acts as the caption: the "big type as hook" idea is a functional requirement, not just a style.
- K-pop now often opens straight on the chorus, built around a roughly 15-second viral hook ([Korea Herald](https://www.koreaherald.com/article/10692913)). *Supernova* establishes its premise in its first shot: Karina falls onto a car and lifts it ([Wikipedia](https://en.wikipedia.org/wiki/Supernova_(Aespa_song))).
- Eye-tracking research: attention after a cut peaks about 0.66 s later. Show the key element **centered, uninterrupted, for at least 1 s** at the start of the video and of each new scene. Lower visual complexity increases attentional synchrony, meaning more viewers look at the same place ([J. Acad. Marketing Science, 2025](https://link.springer.com/article/10.1007/s11747-025-01137-x)).
- **Applied to 0:00–0:03:**
  - Frame 0 is already moving. No fade from black, no logo ident.
  - From 0 to 1.36 s, a 6–10 frame flash-forward of the payoff (**"Actionable comments posted: 400"** avalanching in, at 3 a.m.), then a "tick tick" rewind.
  - At 1.36 s, **NINETY SECONDS** slams in centered, filling 40–55% of the frame height.

### 2.2 Cut rhythm and the beat
- K-pop editing is "two, three times" faster than American music videos ([Asia Times](https://asiatimes.com/2019/06/k-pop-videos-from-marketing-to-works-of-art/)). *Whiplash* uses "flashy cut-ins on the beat and dynamic tracking shots" ([EnVi](http://envimedia.co/aespa-establish-icon-status-in-whiplash-the-5th-mini-album/)). *Supernova* matches frantic zooms and edits to the song's sliding synths, then slows down before the switch-up ([Seoulbeats](https://seoulbeats.com/2024/05/supernova-is-campy-chaotic-and-peak-aespa/)).
- **Rule:** cuts shorter than 0.66 s are punctuation, not information. Any shot that must be read needs at least 1 s.
  - Chorus cut grid: the half-time pulse (0.84 s) or the bar.
  - Verse cut grid: the bar or the lyric line (3.38 s).
  - Flash inserts of 2–6 frames go on snares and ad-libs, at most one per bar in verses.
- **Change speed by toggling, not ramping.** OK Go's *The One Moment* runs each section at a constant rate and switches between rates ([OK Go notes](https://okgo.net/2016/11/23/background-notes-and-full-credits-for-the-one-moment-video/)). Freezes and slow-motion should be discrete states.

### 2.3 Point choreography, killing parts, and the ending fairy
- Terms ([HAEMIL](https://haemilkorea.com/kpop/what-is-killing-part-in-kpop)):
  - **Point choreography:** the easy-to-copy move that represents the song.
  - **Killing part:** the few seconds everyone replays.
  - **Ending fairy:** the held close-up at the end of a performance.
- ILLIT's magnet hands became a short-form challenge, and ILLIT released both fixed-camera and moving-camera performance versions ([K-en News](https://www.k-ennews.com/news/articleView.html?idxno=451), [Daily Dot](https://dailydot.com/magnetic-illit-tiktok-dance)). Reviewers mark down videos that lack a defining move (*Whiplash*, *Antifragile*: [KPOPREVIEWED](https://kpopreviewed.com/2024/10/26/whiplash-aespa/), [KPOPREVIEWED](https://kpopreviewed.com/2022/10/17/antifragile-le-sserafim/)).
- **Applied:**
  - "hop! hop!" → a double ear-flick plus a hop on the two ad-lib hits.
  - "nope! nope!" → a head-whip, drawn with smears and multiples. In the final chorus it becomes "yep! yep!" with a nod: the same framing, inverted meaning.
  - "Click, click, resolve all" → a **swarm of multiplayer cursors clicking in unison**. This is the group-choreography equivalent.
  - Shoot these moments the same way every chorus: centered, full body, static camera, plain color field, held for at least 1 bar. That makes them GIF-able.
- **Killing-part candidate:** at "CodeRabbit, pause" (59.1 s), the whole frame freezes with a desaturated tone overlay while the rabbit alone keeps moving and turns to camera. This is time manipulation as a joke, the same move as *Supernova*'s time-looping member.
- **Ending fairy:** "As mentioned above." Deadpan close-up, subtitle-sized text in GitHub-comment style, held for more than 2 s. The understatement after the chaos is the joke.

### 2.4 Sets, color blocks, repetition with variation, escalation
- Big K-pop videos cycle looks fast ("yellow room, pink room and toilet room – in only ten seconds", [kbrecordzz](https://kbrecordzz.com/2022/03/18/what-makes-k-pop-music-videos-so-great-heres-the-answer/)). Sets are built for each video ([Asia Times](https://asiatimes.com/2019/06/k-pop-videos-from-marketing-to-works-of-art/)).
- **BTS *IDOL*:** one European-building set appears 15 times in cuts of 1–7 s, and turns from beige to purple at 3:15 as an escalation marker ([OSF paper](https://doi.org/10.31235/osf.io/ycn4w)).
- ***Whiplash*** uses only two sets and a limited palette and still feels rich, because the editing does the work ([EnVi](http://envimedia.co/aespa-establish-icon-status-in-whiplash-the-5th-mini-album/)). Constraint is a valid option.
- **NewJeans *OMG*** ends on a montage of the group's earlier videos, a callback payoff ([Teen Vogue](https://www.teenvogue.com/story/newjeans-talk-ditto-fan-theories-songwriting-year-of-the-bunny-2023-interview)).
- **Switch-up before the final chorus:** *Supernova* slows down before its switch-up. OK Go drops to about 16 s of real-time lip sync, "a moment of human contact", before the final chorus ([OK Go](https://okgo.net/2016/11/23/background-notes-and-full-credits-for-the-one-moment-video/)).
- **Applied:** at most 4 worlds, and the chorus stage is one template that returns each time. Escalation dials, turned up at every chorus:
  1. Count and density: `Actionable comments posted: 3 → 40 → 400`. CodeRabbit's real review header is **"Actionable comments posted: N"** ([example PR](https://github.com/macalbert/envilder/pull/169)).
  2. Camera distance and movement.
  3. Frame rate: more hits on ones.
  4. Saturation and contrast, with the stage recolored IDOL-style.
  5. Number of simultaneous text systems, going from 1 to 2.
  6. World bleed: inserts from earlier sections leak in.

  The final chorus is a Spider-Punk collage built from Xerox copies of every insert used so far.

### 2.5 Framing
- K-pop centers its hero moments. The research agrees: center plus low complexity produces the most synchronized attention.
- **Two layout modes:**
  - Verses use **split mode**: lyrics on the left, rabbit on the right, as the director asked.
  - Chorus downbeats use **center mode**: symmetric, hero type or the signature gesture.

  The switch between modes signals the section change by itself.
- In dense frames, keep exactly one high-contrast focal element and demote everything else with misregistration, halftone and lower contrast. Spider-Verse's depth-of-field language doubles as an attention-management tool.

### 2.6 Text and UI inside K-pop MVs
- *Whiplash* uses text flashes ([KPOPREVIEWED](https://kpopreviewed.com/2024/10/26/whiplash-aespa/)). *Heartbeat* opens with a title screen and on-screen text ([BTS other-worlds](https://doi.org/10.52086/001c.29650)). *IDOL* layers typography, drawings and glitches ([OSF](https://doi.org/10.31235/osf.io/ycn4w)). *Super Shy* uses DDR-style gradient logo art and lines that divide the frame ([Design Compass](https://designcompass.org/en/2023/07/24/new-jeans-mv-design/)).
- **NewJeans *ETA*:** phone UI (FaceTime, camera modes) *drives the plot* ([PetaPixel](https://petapixel.com/2023/07/21/new-music-video-from-k-pop-group-newjeans-shot-entirely-on-iphone/), [Hypebeast](https://hypebeast.com/2023/9/hee-jin-min-newjeans-eta-music-video-apple-iphone-collaboration-interview)). → GitHub UI should carry the story (comment posted → ignored → "resolve all" → merged → prod down), not decorate it.
- **NewJeans *Ditto*:** the director set out to break the standard idol-MV format. His solution was to show the choreography "through someone's gaze", adding a sixth character with a camcorder ([Melon interview, JP translation](https://note.com/emmayellow/n/nb8f516afb1d5)). → Use the rabbit's reviewer point of view (a scrolling diff, a highlight cursor) to justify cuts.
- **Deadpan comedy:** *Supernova* works because "deadpan timing gives VFX a personality budget" ([CVM Sekai](https://cvmsekai.com/aespa-supernova-mv-react/)). The rabbit should react flatly to absurd escalation.

### 2.7 Non-K-pop lessons
- **Childish Gambino, *This Is America* (Hiro Murai):** a foreground performance distracts from background chaos. The DP aimed for an "accidental tableau": images that pop out of chaos and dissolve back. The camera moves so that "the audience [finds] each piece" ([ASC](https://theasc.com/article/dp-larkin-seiple-on-this-is-america-quot/)). → Add a background gag layer (notification pile-ups, a CI fire) for rewatches and "did you notice" replies.
- **OK Go, *The One Moment*:** 318 events synced from a timing spreadsheet ([OK Go](https://okgo.net/2016/11/23/background-notes-and-full-credits-for-the-one-moment-video/)). → Treat `beats.json` as the event spreadsheet: every gag gets a beat index.
- **a-ha, *Take On Me*:** loose pencil rotoscope chasing "a fleeting impression". About 2,000–3,000 drawings over 16 weeks ([Guardian](https://www.theguardian.com/culture/2015/sep/15/a-ha-how-we-made-take-on-me), [BBC](https://www.bbc.com/news/entertainment-arts-11485702)). → Use sketch-line "portal" transitions between the painted world and the UI world.
- **Daft Punk, *Interstella 5555*:** no dialogue; an entire album told through visuals alone ([Wikipedia](https://en.wikipedia.org/wiki/Interstella_5555:_The_5tory_of_the_5ecret_5tar_5ystem)). → Every plot beat must read with the sound muted.
- ***The Mitchells vs. the Machines*:** "Katie Vision" is teen-style drawing over expensive renders that should "stand out in frame, but not too much". The handmade human world is contrasted with a slick tech world ([CGW](https://www.cgw.com/Publications/CGW/2021/July-August-September-2021/Dual-Approach.aspx), [SIGGRAPH](https://blog.siggraph.org/2021/12/the-handmade-look-of-the-mitchells-vs-the-machines.html/)). → The rabbit's red-pen annotations drawn over clean UI.
- **Lyric videos:** Prince's *Sign O' the Times* (1987) is an early precursor. CeeLo's 2010 *F\*\*k You* lyric video came out before the official video and reached about 11M views, making the format standard ([Atlantic](https://www.theatlantic.com/culture/archive/2014/08/where-did-all-these-lyric-videos-come-from-and-why-are-we-giving-them-awards/376084/), [Billboard](https://www.billboard.com/music/music-news/lyric-videos-the-power-of-words-1178783/)). The kinetic-type roots are Saul Bass titles and Jarratt Moody's *Pulp Fiction* "Say What Again" piece ([history video](https://www.youtube.com/watch?v=3P0BKrOlBVM)). One critique: type that only repeats the sung words feels like "Slap! Slap! Slap!" ([Montfort](https://nickm.com/post/index.html%3Fp=1082.html)). → **Text should add a second joke layer.**
- **Young-Hae Chang Heavy Industries, *Dakota* (Seoul):** big black capitals in Monaco, one to three words per flash, synced to Art Blakey. It speeds up until it is nearly unreadable. Emphasis comes from duration and size ([ELD](https://www.directory.eliterature.org/individual-work/4835), [ELMCIP](https://ns9035k.elmcip.sigma2.no/creative-work/dakota), [analysis](https://elmcip.net/sites/default/files/media/critical_writing/attachments/read_fast_die_young_elo13mk.pdf)). → A Korean text-on-beat precedent that isn't K-pop.
- ***Neon Genesis Evangelion*:** flashing type-only frames and title cards in "crude, black-and-white Matisse EB… mechanically compressed to fit into interlocking compositions", an homage to old Toho title cards ([Fonts In Use](https://fontsinuse.com/uses/28760/neon-genesis-evangelion)). The layout is an L-shape of mixed type sizes ([zbfghk](https://zbfghk.org/2020/02/20/eva-3/)).

---

## 3. Kinetic lyric typography

### 3.1 Reading-speed limits (hard numbers)
| Source | Rule |
|---|---|
| BBC subtitle guidelines | 160–180 wpm; minimum about **0.3 s per word** (a 4-word line needs about 1.2 s) ([BBC](https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/)) |
| Netflix | Each subtitle on screen **≥ 5/6 s (20 frames at 24 fps)** and ≤ 7 s; ≤ 2 lines; ≤ 42 characters per line; **≤ 20 characters per second** for adults ([general](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements), [English](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide)) |
| RSVP research (one word at a time) | Comprehension matches normal reading at 250–350 wpm (about 170–240 ms per word) and drops at 400 wpm or more ([IJHFE 2018](https://doi.org/10.1504/ijhfe.2018.10016316)) |
| Motion-type practice | Text should stay readable for **≥ 0.5 s after it settles**; character staggers of about 40–60 ms ([IK Agency](https://www.ikagency.com/graphic-design-typography/kinetic-typography/), [Vertex](https://vertex.art/blogs/typography-animation-kinetic-typography)) |

Check against this song: a chorus line such as "Three little comments on your PR (hop! hop!)" is 9 words in 3.38 s, about 160 wpm. That sits right at the BBC limit, so full lines are readable.

"Ninety seconds on the clock" is 5 words in 1.24 s, about 240 wpm. Word by word that is too fast to show and replace, so **accumulate the words and hold the full line.**

### 3.2 Two tiers of text
- **Sung text:** the audio carries the meaning, so the eye only confirms. Words appear at their vocal onsets and **accumulate** until the line ends. A hero single word stays at least 8 frames (333 ms) and settles for 12 frames or more when it matters.
- **Unsung text** (jokes, UI, captions): follow BBC and Netflix strictly, at least 0.3 s per word and at least 20 frames. The exception is deliberate **pause-bait**: dense easter-egg text such as the 14k-line diff, the actual code, the poem, or the chart numbers. It is meant to be screenshotted, and viewers aren't expected to read it in real time.

### 3.3 Scale hierarchy at 1080p (at most 3 sizes per frame)
- **Hero:** 1–3 words, cap height 300–700 px (28–65% of frame height). Anton or Archivo ExtraCondensed Black.
- **Line:** 90–140 px, in the verse column on the left.
- **Subtitle:** **≥ 60 px** is the phone-legibility floor (derived: 60 px × 0.2 ≈ 12 CSS px on phones). Netflix sizing aims for 42 characters across the frame.
- **UI micro:** 28–40 px. Show GitHub's 14 px UI zoomed 2–2.5×.
- **Safe areas (EBU R95):** graphics-safe is a 5% margin per edge, which is x 96–1824 and y 54–1026. Action-safe is 3.5% ([EBU R95](https://tech.ebu.ch/publications/r095)). Verse lyric column: about x 96–880. Rabbit zone: about x 1000–1824.

### 3.4 Reveal and emphasis
- Word-by-word reveals land on vocal onsets using the sync law (§0). Type moves on ones while the rabbit is on twos, so the two layers read as separate planes.
- **At most one emphasized word per line:**
  - Which words: numbers (3/40/400/46/14,000/9,012) and the words hop, nope, yep, pause, merge, prod.
  - Treatment: switch to CR Orange `#FF570A` (or red in the bridge), scale-punch from 115% to 100% over 3 frames, and add a one-frame misregistration flash on landing.
- Ease quickly out of the entrance, then hold. Motion that never stops can't be read.
- Hit-shake on type: offset of 2–6 px, lasting 2–4 frames, and never on text that must be read.

### 3.5 Text as part of the set
- **Occlusion:** the rabbit stands in front of part of a giant word (draw order: background → word → rabbit → foreground). Words become floors, walls and props that the rabbit's ears knock into on hits.
- **Masks:** clip to the glyph outline so the word becomes a window into another world, such as the diff showing through "NOPE".
- **Perspective:** get glyph outlines from fontkit or opentype.js, transform each point projectively, and fill as a `Path2D`. Canvas `setTransform` alone is affine only.
- **Stacking:** fitted blocks. Scale each line so it spans the column width, with leading of 0.8–0.9 em. This is the Evangelion-style interlocking composition.
- **Floating in-world text:** plain, unboxed text next to the subject in one consistent face. This is *Sherlock*'s texting solution, praised for having no bubble and no device chrome ([Every Frame a Painting](https://www.youtube.com/watch?v=uFfq2zblGXw), [Frame.io](https://blog.frame.io/2024/01/22/texting-messaging-in-movies-and-tv-shows/)). Use it for Slack pings and PR events when a full insert would be too heavy.

### 3.6 Keeping clutter down
- At most **2 text systems** on screen: lyric plus one gag.
- One focal point per frame.
- Change the vertical position of the lyric block between lines. The eye habituates to one spot (inhibition of return, [Springer](https://link.springer.com/article/10.1007/s11747-025-01137-x)).
- **Flash safety:** no more than 3 full-field luminance flashes per second, and flashing areas at most 25% of a 10° field ([WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)). Inversions on every beat (2.37 Hz) are fine. Inversions on eighth notes (4.7 Hz) are not.

---

## 4. Internet-brutalism and web-core inserts

### 4.1 Vocabulary SF tech Twitter will recognize (use exact strings and colors)
- **GitHub (Primer tokens, verified in [@primer/primitives](https://unpkg.com/@primer/primitives/dist/css/functional/themes/light.css)):**
  - Light theme: background `#ffffff`, muted background `#f6f8fa`, text `#1f2328`, muted text `#59636e`, border `#d1d9e0`, links `#0969da`.
  - Status: merge button and success `#1f883d`, danger `#cf222e`, merged purple `#8250df`, attention background `#fff8c5`.
  - Dark theme: background `#0d1117`, text `#f0f6fc`, success `#238636`, merged `#8957e5`.
  - Fonts: the UI stack now starts with **"Mona Sans VF"**. The mono stack is `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono`.
  - Recognizable elements: timeline events such as "force-pushed the branch from `abc123` to `def456`", "Resolve conversation", "Merge pull request", and red/green diff gutters.
- **CodeRabbit (real product details):**
  - Commands: `@coderabbitai pause`, `resume`, `ignore`, `review`, `resolve`, `approve` ([docs](https://docs.coderabbit.ai/reference/review-commands)).
  - Every walkthrough ends with a generated **poem**, on by default (`reviews.poem: true`, [docs](https://docs.coderabbit.ai/pr-reviews/walkthroughs)). That makes "I wrote a poem for you all the same" literally true.
  - Review markup: **"Actionable comments posted: N"**, "_⚠️ Potential issue_ | _🔴 Critical_", "🧹 Nitpick comments (3)", "📝 Proposed fix", "⚠️ Outside diff range comments" ([example PR](https://github.com/macalbert/envilder/pull/169)).
  - Brand colors: CR Orange `#FF570A`, cream `#EEEEE3`, neutral `#171717`, with mint and cobalt as accents only. Keep the logo mark upright and unmodified ([brand](https://www.coderabbit.ai/brand), [simple-icons](https://github.com/simple-icons/simple-icons/issues/12222)).
- **Windows 95/98 chrome:** face `#C0C0C0`, shadow `#808080`, highlight `#FFFFFF`, title bar `#000080`, and dialogs with [Yes] [No] buttons. [98.css](https://github.com/jdan/98.css) (MIT) is a good reference for bevel values.
- **Terminal and TUI:** `git push --force`, `git commit -m "small fix"`, and a red CI ✗ reading "Some checks were not successful".
- **Figma multiplayer cursors:** colored arrows with name pills. This is the resolve-all swarm.
- **Slack and Discord:** stacked notification toasts and unread badges counting up to 400.
- **X:** a dark-UI post card and a **Community Notes** box ("Readers added context: the rabbit mentioned this above").
- **arXiv, LaTeX, benchmark charts:**
  - An arXiv abstract page with its red masthead and a Computer Modern title, e.g. "*Comments Are All You Ignore*".
  - Benchmark bars that commit a **"chart crime"**. GPT-5's August 2025 launch showed a 50.0% bar shorter than a 47.4% bar, which Sam Altman called a "mega chart screwup" ([Verge](https://www.theverge.com/news/756444/openai-gpt-5-vibe-graphing-chart-crime), [BI](https://www.businessinsider.com/openai-made-mistakes-with-charts-in-its-gpt-5-demo-2025-8)).
- **Meme-typography precedent:** *brat*. Lowercase stretched Arial/ABC Rom on `#8ACE00`, designed at 150 px and blown up so it looks low-res ([Fonts In Use](https://www.fontsinuse.com/uses/61357/charli-xcx-brat-album-art-and-campaign), [Dinamo](https://abcdinamo.com/newsletter/the-dinamo-update-our-font-for-charli-xcxs-brat)). It is 2024-coded, so use it for one gag at most.
- **Brutalist traits** in general: exposed grids, system fonts, hard borders, clashing flat colors, and error messages or code used as graphics ([overview](https://www.marcfriedmanportfolio.com/blog/brutalism-anti-design-web-trends/)).

### 4.2 Integration rules (how to keep it coherent)
1. **One print pipeline for everything.** Every UI insert passes through the same paper-multiply and misregistration pass, at half the painted-world offset. Big flat UI fills (such as the green merge button) get halftone in their shadow. The inserts should read as printed matter inside the comic.
2. **Give inserts a physical form.**
   - Xeroxed cut-outs with tape and staples, with edges jittering every frame and the body on 3s or 4s (Spider-Punk, §1.3).
   - Ink-bordered panels.
   - Screens drawn inside the world.

   A bare full-frame swap is reserved for deliberate "brutal cuts" (at most one per section).
3. **Style contrast must mean something.** The handmade rabbit world and the too-clean UI world echo Mitchells' handmade humans vs. slick tech. The rabbit's red-pen circles, arrows and "!!!" drawn over the UI bind the two, Katie-Vision style.
4. **Frame-rate contrast:** UI on ones (the machine), rabbit on twos (the hand), collage on 3s or 4s.
5. **Palette discipline:** each frame gets paper, ink, CR Orange, and at most 2 more hues. GitHub status colors keep their *meaning* everywhere: green means merged or approved, red means a flaw, purple means merged.
6. **Font roles never swap.** UI text is always Mona Sans or JetBrains Mono. Lyrics are always display faces.
7. **Inserts are short and on the beat** (1 bar or less) unless the insert *is* the section's set, as with the verse-1 diff world.

---

## 5. Fonts (OFL and Apache, verified download paths)

| Role | Family (exact) | Weights and axes | Notes |
|---|---|---|---|
| (a) Comic sound effects | **Bangers** | 400 | Classic all-caps comic SFX. OFL |
| (a) Alternate sound effects | **Luckiest Guy** | 400 | Rounder and bouncier. Apache-2.0 |
| (a) Caption lettering | **Shantell Sans** | wght 300–800, INFM 0–100, BNCE −100–100, SPAC | Marker hand-lettering. The BNCE ("bounce") axis gives per-glyph jitter, which suits boil. OFL |
| (b) Hero lyrics | **Anton** | 400 | Impact-class heavy condensed type. OFL |
| (b) Variable display | **Archivo** | wdth 62–125, wght 100–900 | Animate weight on beats; ExtraCondensed Black for stacks. OFL |
| (b) Ultra-tall stacks (optional) | **League Gothic** | wdth 75–100 | OFL |
| (c) Code, terminal, diff | **JetBrains Mono** | wght 100–800 (use 400/700) | OFL |
| (c) GitHub's own mono (optional) | **Monaspace Neon** | variable | GitHub Next, OFL-1.1, release zip |
| (d) Evangelion card, kanji and kana | **Noto Serif JP** | **900** | Same design as Source Han Serif Heavy, which the open-source EVA title generator [itorr/eva-title](https://github.com/itorr/eva-title) recommends as the Matisse fallback. 13.6 MB, so subset it |
| (d) Evangelion card, Latin | **Noto Serif** | **wdth 62.5 + wght 900** | `ctx.fontStretch='extra-condensed'` (= 62.5%), then add `ctx.scale(0.75,1)` for Anno-style mechanical compression. OFL |
| (d) Evangelion alternate | **Shippori Mincho B1** | 800 | More brush contrast. OFL |
| (e) GitHub-like UI | **Mona Sans** | wdth 75–125, wght 200–900 (400/500/600) | First in GitHub's actual UI font stack. OFL |
| (e) Alternate UI / X cards | **Inter** | opsz 14–32, wght 100–900 | OFL |
| Extra: Win9x pixel | **Pixelify Sans** / **Silkscreen** | wght / 400 | OFL |
| Extra: CRT terminal | **VT323** | 400 | OFL |
| Extra: LaTeX / arXiv | **CMU Serif** (Computer Modern Unicode) | Regular / Bold | OFL-1.1 ([CTAN](https://ctan.org/pkg/cm-unicode)) |

How to reproduce the Evangelion card:
- White Mincho on black. Lines of mixed sizes arranged in an L-shape that interlocks.
- Horizontal compression by non-uniform scale, which is literally what the official site does with a CSS transform ([Fonts In Use](https://fontsinuse.com/uses/28760/neon-genesis-evangelion)).
- Numbers written as kanji for spacing ([zbfghk](https://zbfghk.org/2020/02/20/eva-3/)).
- 1–2 frames of film grain.
- Best slot: the 85.3–87.8 s gap, reading "第九千十二行 / LINE 9,012".

---

## 6. Canvas 2D techniques and libraries

### 6.1 Determinism and stepped time
- Every random draw comes from a seeded PRNG (`alea`) keyed by `(layerId, drawingIndex)` with `drawingIndex = floor(frame/step)`. The boil then advances exactly when a layer's drawing changes.
- rough.js has a `seed` option (1…2³¹) for the same purpose ([rough wiki](https://github.com/rough-stuff/rough/wiki)). simplex-noise v4 takes a PRNG, as in `createNoise2D(alea('seed'))`.

### 6.2 Halftone (three methods, cheapest first)
1. **Pattern tiles (screen-locked or object-locked).**
   - Pre-render 8–12 small tile canvases, one per tone. Dot radius `r = cell·√(coverage/π)`, cell 14–24 px.
   - Use `createPattern(tile,'repeat')` and set the screen angle with `pattern.setTransform(new DOMMatrix().rotate(θ))`. Classic angles: C 15°, M 75°, Y 0°, K 45°.
   - For dots that should *track the character*, multiply the pattern matrix by the object's transform (Foundry's "swimming through a pattern" note).
   - Fill with `clip(shapePath)` then `fillRect`. It costs about the same as a flat fill ([MDN setTransform](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform), [MDN createPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern)).
2. **Analytic variable-size dots.** Loop over the grid, compute the tone from a function (light direction, radial falloff, a signed-distance field), add every `arc` to *one* path, and fill once. At a 14 px cell, a full frame is about 10k dots.
3. **Sampled threshold for arbitrary shading.** Render shading to a low-resolution buffer (for example 480×270), call `getImageData` once (with `willReadFrequently:true`), then draw dots ([anderoonies halftone](http://anderoonies.github.io/projects/halftone/)).

In all three: shading comes in 2–3 bands with dots only in the transitions and glows, and hatching goes in the shadows (rough.js `hachure` / `cross-hatch` with `hachureAngle`, `hachureGap`, `fillWeight`, or custom clipped lines).

### 6.3 Misregistration and chromatic offset
- **Flat vector art:** redraw the fill path offset in cyan and magenta under `multiply`. Nothing extra has to be buffered.
- **Complex layers:**
  1. Tint the buffered layer: draw it into a temp canvas, then `globalCompositeOperation='source-in'` and fill with the ink color.
  2. Composite with `multiply` at integer offsets.
- Offset size follows depth-of-field (`|z − zFocus|`) or velocity (trails). The focal subject is always registered.
- Composite-mode switches are comparatively slow ([anderoonies](http://anderoonies.github.io/projects/halftone/)), so batch per mode.

### 6.4 Paper
- Pre-compute once: tileable fBm noise at 1024², fibers, and 2–3 variants.
- Multiply at 6–12% opacity over the whole frame. Keep it static.
- In collage sections, swap variants on 4s for a Xerox flicker.
- Use the cream `#EEEEE3` as the paper base.

### 6.5 Linework
- **perfect-freehand** turns centerline points into a tapered pressure outline via `getStroke(points, {size, thinning, smoothing, streamline, simulatePressure, start/end: {taper, cap}})`, filled as a `Path2D`. Good for contours, action lines and dry-brush streaks ([repo](https://github.com/steveruizok/perfect-freehand)).
- **rough.js:** `roughness`, `bowing`, `disableMultiStroke` (use it for cleaner ink), hachure and cross-hatch fills, and `seed`. Cache drawables per drawing index, because generating them costs more than drawing them.
- **Boil:** noise-jitter control points by 0.5–1.5 px once per drawing. Scale roughness with speed (Spot rule).

### 6.6 Motion and energy effects
- **Smear frames:** see the table in §1.2.
- **Multiples:** CMY-tinted ghosts along the motion arc.
- **Focus lines** (manga-style radial lines): a few hundred thin seeded wedges aimed at the focal point, in one path, re-seeded on twos.
- **Parallel speed lines:** the same approach, for travel.
- **Kirby krackle:** see §1.2.
- **Shatter and cracked-screen effects** (for "prod's down"): cells from d3-delaunay.

### 6.7 Text rendering specifics
- Load every font with `FontFace` plus `document.fonts.load()` before frame 0.
- Weight is continuous in `ctx.font` (for example `"830 400px Archivo"`) when the FontFace declares a weight range.
- `ctx.fontStretch` only accepts **keywords**, not percentages ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fontStretch)).
- Custom axes such as Shantell's BNCE and INFM, per-glyph animation, and perspective all need outlines:
  - **fontkit:** `font.getVariation({...})`, `layout()`, `path.toFunction()`.
  - **opentype.js 2.x:** `getPath()`, with variable-font support through a `VariationManager`.

### 6.8 Performance notes
- Avoid full-frame `shadowBlur` and `ctx.filter` blur.
- Cache static layers (paper, backgrounds, pattern tiles).
- Batch paths per fill style and keep composite-mode switches to a minimum.
- Call `getImageData` at most once per frame.
- simplex-noise benchmarks at about 70M `noise2D` calls/s per thread on the author's Ryzen 5950X, so noise is never the bottleneck.
- Budget: 3,087 frames × 100 ms ≈ 5 min per full render, which makes quick iteration realistic.
- Check the cost of a full-frame dot loop against that budget early.

---

## 7. Top 12 rules for this video

1. **Hook with the sound off.**
   - Frame 0 is already moving, with one centered focal element: no fade, no logo.
   - A 6–10 frame "400 comments" flash-forward, then **NINETY SECONDS** at 1.36 s filling 40–55% of the frame height.
   - The premise is clear by 3 s.
2. **Stepped time.**
   - Rabbit on twos. Camera, type and UI on ones. The fastest frames of hits on ones. Collage on 3s or 4s.
   - Break smooth arcs into holds plus snaps ("always be changing the trick").
3. **Print, don't render.**
   - Shading is 2–3 flat tones, halftone in the light, hatching in the shadow.
   - Depth and speed come from CMY misregistration.
   - Zero gradients, zero blur.
4. **Scale the print for phones.** At 1080p: dots ≥ 14 px (40–80 px on hero backgrounds), offsets 4–12 px, contours ≥ 4 px, sound-effect outlines ≥ 8 px. Paper stays static.
5. **Sync law.**
   - Hits land at the `beats.json` transient or up to 1 frame before it, never after.
   - Chorus cuts follow the 0.84 s pulse; verse cuts follow the bar or the line.
   - Information shots last at least 1 s, with the key element centered for the first second.
   - Flash inserts of 2–6 frames, at most one per bar in verses.
6. **Two layout modes.**
   - Verses: lyrics left (x 96–880), rabbit right.
   - Chorus downbeats: centered, symmetric hero mode.

   The mode switch is the section marker.
7. **One world per section, 4 at most**, each with its own palette and technique subset:
   - Verse 1: Mumbattan-style misregistered comic.
   - Verse 2: Gwen-style mood wash.
   - Bridge: Earth-42 noir, red and black, then Spot-style ink corruption.
   - Final chorus: Spider-Punk collage.

   The chorus stage recurs and gets recolored each time.
8. **Point choreography and killing parts.**
   - "hop! hop!" = ear-flick hop. "nope! nope!" = head-whip with smears; the final chorus flips it to "yep! yep!" = nod.
   - "Resolve all" = cursor-swarm unison click.
   - "CodeRabbit, pause" = full-frame freeze with only the rabbit moving.
   - All shot the same way every time: center, full body, static, plain field, held for at least 1 bar.
9. **Choruses are one template with escalating dials.** Count (3 → 40 → 400), density, saturation, frame rate, text systems, world bleed. The bridge is the deliberate switch-up (slow, human, near real time). The final chorus is a callback collage of every earlier insert.
10. **Type law.**
    - At most 3 sizes and 2 text systems per frame.
    - Must-read text ≥ 60 px.
    - Unsung text ≥ 0.3 s per word and ≥ 20 frames.
    - Sung words accumulate until the line ends.
    - One emphasized word per line, in CR Orange, with a 3-frame scale punch.
    - Text adds a joke rather than just echoing the vocal.
11. **Inserts are printed matter that drives the plot.**
    - Same paper, ink and misregistration as the rest of the video.
    - Framed as panels or taped Xerox cut-outs.
    - They tell the story: comment → ignored → resolved → merged → prod down.
    - Real CodeRabbit and GitHub strings and colors; the rabbit red-pens over the UI.
12. **Reward rewatches and stay safe.**
    - Beat-indexed background gags (This Is America, OK Go).
    - At most 3 full-field flashes per second.
    - End on an "ending fairy" deadpan hold on "As mentioned above." in subtitle size.

---

## 8. Recommended font stack (exact families and direct URLs)

All are from `github.com/google/fonts` unless noted, and all were checked to return HTTP 200 on 2026-09-24.

- **Bangers 400** (sound effects): https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf
- **Luckiest Guy 400** (alternate sound effects, Apache-2.0): https://raw.githubusercontent.com/google/fonts/main/apache/luckiestguy/LuckiestGuy-Regular.ttf
- **Shantell Sans** (captions; wght, INFM, BNCE, SPAC): https://raw.githubusercontent.com/google/fonts/main/ofl/shantellsans/ShantellSans%5BBNCE,INFM,SPAC,wght%5D.ttf
- **Anton 400** (hero lyrics): https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf
- **Archivo** (wdth 62–125, wght 100–900; animated display): https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf
- **League Gothic** (optional tall stacks): https://raw.githubusercontent.com/google/fonts/main/ofl/leaguegothic/LeagueGothic%5Bwdth%5D.ttf
- **JetBrains Mono** (code, terminal, diff): https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf
- **Monaspace Neon** (optional, GitHub Next, OFL-1.1): https://github.com/githubnext/monaspace/releases/download/v1.400/monaspace-variable-v1.400.zip
- **Noto Serif JP 900** (Evangelion kanji): https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf
- **Noto Serif, wdth 62.5 / wght 900** (Evangelion Latin): https://raw.githubusercontent.com/google/fonts/main/ofl/notoserif/NotoSerif%5Bwdth,wght%5D.ttf
- **Shippori Mincho B1 ExtraBold 800** (alternate Evangelion): https://raw.githubusercontent.com/google/fonts/main/ofl/shipporiminchob1/ShipporiMinchoB1-ExtraBold.ttf
- **Mona Sans** (GitHub UI; 400/500/600): https://raw.githubusercontent.com/google/fonts/main/ofl/monasans/MonaSans%5Bwdth,wght%5D.ttf
- **Inter** (alternate UI, X cards): https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf
- **Pixelify Sans** (Win9x): https://raw.githubusercontent.com/google/fonts/main/ofl/pixelifysans/PixelifySans%5Bwght%5D.ttf
- **Silkscreen 400** (pixel labels): https://raw.githubusercontent.com/google/fonts/main/ofl/silkscreen/Silkscreen-Regular.ttf
- **VT323 400** (CRT terminal): https://raw.githubusercontent.com/google/fonts/main/ofl/vt323/VT323-Regular.ttf
- **CMU Serif Regular / Bold** (LaTeX / arXiv, OFL): https://cdn.jsdelivr.net/gh/bitmaks/cm-web-fonts@master/font/Serif/cmunrm.ttf and https://cdn.jsdelivr.net/gh/bitmaks/cm-web-fonts@master/font/Serif/cmunbx.ttf (CTAN OTF: https://mirrors.ctan.org/fonts/cm-unicode/fonts/otf/cmunrm.otf)

Minimal core set if you want fewer files: Anton, Archivo, Bangers, Shantell Sans, JetBrains Mono, Mona Sans, Noto Serif JP, Noto Serif.

---

## 9. Recommended libraries (all run offline from `node_modules`)

| Library | Version | License | Use | Performance note |
|---|---|---|---|---|
| **perfect-freehand** | 1.2.3 | MIT | Tapered ink strokes, action lines, dry-brush | Cheap per stroke; hundreds per frame is fine |
| **roughjs** | 4.6.6 | MIT | Sketchy shapes, hachure and cross-hatch, `seed` | Moderate; cache drawables per drawing index |
| **simplex-noise** | 4.0.3 | MIT | Boil, paper, blobs, Kirby masks | About 70M `noise2D` calls/s |
| **alea** | 1.0.1 | MIT | Seeded PRNG (alternative: seedrandom 3.0.5, MIT) | Negligible |
| **fontkit** | 2.0.4 | MIT | Variable-axis glyph outlines (`getVariation`), shaping, `path.toFunction()` for canvas | Cache paths per string and axis value |
| **opentype.js** | 2.0.0 | MIT | Glyph paths and point access for perspective or warps; variable fonts | Cache paths |
| **bezier-easing** | 3.1.0 | MIT | CSS-style cubic-bezier easing | Negligible |
| **d3-ease** | 3.0.1 | BSD-3 | Back, elastic and bounce overshoots for type punches | Negligible |
| **fast-2d-poisson-disk-sampling** | 1.0.3 | MIT | Kirby krackle and stipple distributions | Pre-compute per seed |
| **d3-delaunay** | 6.0.4 | ISC | Voronoi shatter and crack cells | Fast |
| **bezier-js** | 6.1.4 | MIT | Offsets and arc-length sampling for strokes along curves | Fine |
| **svg-path-properties** | 2.1.0 | ISC | Write-on effects (point at length) | Fine |
| **polygon-clipping** | 0.15.7 | MIT | Panel layouts, cut-out shapes, boolean masks | Pre-compute |
| **flubber** | 0.4.2 | MIT | Shape morphs (smears, transitions) | Pre-compute interpolators |
| **culori** | 4.0.2 | MIT | OKLCH palettes and mood-wash hue shifts | Negligible |
| **hershey** | 2.1.7 | MIT | Single-line font for pen and plotter write-ons | Fine |
| **puppeteer** | 25.12.0 | Apache-2.0 | Headless Chrome frame driver | Not applicable |

Avoid or treat as optional:
- **GSAP:** "standard no-charge" license, not OSI-approved. It isn't needed, since every frame is a pure function of time.
- **potrace:** GPL-2.0.
- **essentia.js:** AGPL-3.0.

Beats and lyrics already exist in `assets/`, so no audio-analysis library is needed.

Optional speed path: **@napi-rs/canvas** 1.0.9 or **skia-canvas** 3.0.8 (both MIT) give a Node Canvas API without a browser, if headless Chrome becomes the bottleneck.

---

## Sources (grouped)

**Spider-Verse:** [Imageworks](https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse) · [AWN, Beveridge](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse) · [Foundry, Into](https://www.foundry.com/insights/film-tv/graphic-look-in-comp-spiderman) · [Foundry, Across](https://colorway.foundry.com/insights/film-tv/across-the-spider-verse-nuke-mari-katana) · [IndieWire, worlds](https://www.indiewire.com/features/animation/spider-man-across-the-spider-verse-animated-worlds-interview-1234874269/) · [AWN, Spot and Hobie](https://www.awn.com/animationworld/unpacking-spot-and-hobies-disruptive-styles-spider-man-across-spider-verse) · [Deadline, VFX](https://deadline.com/2023/12/spider-man-across-the-spider-verse-nimona-teenage-mutant-ninja-turtles-mutant-mayhem-vfx-supervisor-magazine-feature-animation-1235681172/) · [Fantasy/Animation](https://www.fantasy-animation.org/current-posts/super-psych-into-the-discourse-verse) · [Kirby Krackle](https://en.wikipedia.org/wiki/Kirby_Krackle) · [Smear frame](https://en.wikipedia.org/wiki/Smear_frames)

**K-pop and music videos:** [HAEMIL, killing part](https://haemilkorea.com/kpop/what-is-killing-part-in-kpop) · [Korea Herald, hooks](https://www.koreaherald.com/article/10692913) · [Asia Times](https://asiatimes.com/2019/06/k-pop-videos-from-marketing-to-works-of-art/) · [kbrecordzz](https://kbrecordzz.com/2022/03/18/what-makes-k-pop-music-videos-so-great-heres-the-answer/) · [Seoulbeats, Supernova](https://seoulbeats.com/2024/05/supernova-is-campy-chaotic-and-peak-aespa/) · [EnVi, Whiplash](http://envimedia.co/aespa-establish-icon-status-in-whiplash-the-5th-mini-album/) · [BTS IDOL paper](https://doi.org/10.31235/osf.io/ycn4w) · [Ditto director interview (JP)](https://note.com/emmayellow/n/nb8f516afb1d5) · [Super Shy, Wikipedia](http://wikipedia.org/wiki/Super_Shy) · [PetaPixel, ETA](https://petapixel.com/2023/07/21/new-music-video-from-k-pop-group-newjeans-shot-entirely-on-iphone/) · [ILLIT, K-en News](https://www.k-ennews.com/news/articleView.html?idxno=451) · [ASC, This Is America](https://theasc.com/article/dp-larkin-seiple-on-this-is-america-quot/) · [OK Go, The One Moment](https://okgo.net/2016/11/23/background-notes-and-full-credits-for-the-one-moment-video/) · [Guardian, Take On Me](https://www.theguardian.com/culture/2015/sep/15/a-ha-how-we-made-take-on-me) · [Interstella 5555](https://en.wikipedia.org/wiki/Interstella_5555:_The_5tory_of_the_5ecret_5tar_5ystem) · [CGW, Mitchells](https://www.cgw.com/Publications/CGW/2021/July-August-September-2021/Dual-Approach.aspx) · [Attention and scene cuts study](https://link.springer.com/article/10.1007/s11747-025-01137-x)

**Typography:** [BBC subtitles](https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/) · [Netflix general](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements) · [RSVP study](https://doi.org/10.1504/ijhfe.2018.10016316) · [WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) · [EBU R95](https://tech.ebu.ch/publications/r095) · [Every Frame a Painting, texting](https://www.youtube.com/watch?v=uFfq2zblGXw) · [Lyric video history](https://www.theatlantic.com/culture/archive/2014/08/where-did-all-these-lyric-videos-come-from-and-why-are-we-giving-them-awards/376084/) · [YHCHI, Dakota](https://www.directory.eliterature.org/individual-work/4835) · [Evangelion, Fonts In Use](https://fontsinuse.com/uses/28760/neon-genesis-evangelion) · [MDN fontStretch](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fontStretch)

**Web and UI:** [Primer primitives](https://unpkg.com/@primer/primitives/dist/css/functional/themes/light.css) · [CodeRabbit commands](https://docs.coderabbit.ai/reference/review-commands) · [CodeRabbit walkthroughs](https://docs.coderabbit.ai/pr-reviews/walkthroughs) · [CodeRabbit brand](https://www.coderabbit.ai/brand) · [98.css](https://github.com/jdan/98.css) · [Verge, chart crime](https://www.theverge.com/news/756444/openai-gpt-5-vibe-graphing-chart-crime) · [brat, Fonts In Use](https://www.fontsinuse.com/uses/61357/charli-xcx-brat-album-art-and-campaign)

**Canvas and libraries:** [rough.js API](https://github.com/rough-stuff/rough/wiki) · [perfect-freehand](https://github.com/steveruizok/perfect-freehand) · [fontkit](https://github.com/foliojs/fontkit) · [anderoonies, halftone](http://anderoonies.github.io/projects/halftone/) · [MDN CanvasPattern.setTransform](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform)
