# CodeRabbit, Pause: storyboard

128.64 s, 24 fps, 1920×1080. Read [STYLE_SHEET.md](STYLE_SHEET.md) first. The code guide is [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md).

## The film in one paragraph

Friday, 4:58:30 PM. A review request pings: "Small fix", +14,203 −12, and ninety seconds to the 5 PM deploy. The Reviewer, an original White Rabbit in an orange hoodie, dives down the rabbit hole. The hole is a Navier–Stokes blow-up vortex, lined with the accelerating AI timeline. It lands in its burrow and reads *everything*: the sins, the key, the skipped tests. It posts three comments (comment-bunnies), and nobody reads them. The dev (a cursor called `you`) force-pushes them away, is crowned king by a chorus of "You're absolutely right!" bots, and types `@coderabbitai pause`. The rabbit is literally paused, yet writes a poem anyway. At line 9,012, in noir black-and-red, the rabbit catches an SQL injection and flags it red with its paw. The dev merges at 5:00:00 exactly and ships the flaw. At 3 a.m. prod is down, 400 comment-bunnies flood the PR, the dev finally scrolls back up… to the rabbit's comment. **"As mentioned above."** Button: a new PR pings, "Small fix (again)", +28,406. The ears go up. The video loops.

**Emotional arc:** eager → overwhelmed → ignored → paused → vindicated (deadpan). **Escalation dials** (turn them up every chorus):
- counter 3 → 40 → 400
- clock T−90 → T−60 → T−30 → 5:00:00 → 3:00 AM
- cut rate
- saturation
- number of text systems
- zeitgeist bleed

## Music facts (measured, see assets/lyrics_timed.json)

- **Intro:**
  - 0.20: a stab. The vocal at 1.36 is near a cappella; an instrumental phrase runs 2.7–4.5; "Down the rabbit hole" at 4.34 is quiet.
  - **5.30: the full band drops in.** tick 6.13, tick 6.73, tock 7.38. Groove until 10.45.
- **Pre-chorus:** snare roll 30.84–32.5.
- **Chorus downbeats:** 32.09 (b75), 69.27 (b163), 104.63 (b247). The backbeat kick falls on beat indices ≡ 1, 3 (mod 4).
- **Held notes (melismas):**

| Word | Span | Pitch |
|---|---|---|
| "again" | 44.42–47.8 | rising |
| "same" | 67.18–69.5 | |
| "again" | 81.54–85.3 | rising to D#5 |
| "flaw" | 101.06–104.8 | rising G4 → E5 |
| "groan" | 117.06–119.9 | falling |

- **Drum fill:** 85.3–87.7 (no vocals) → bridge at 87.74.
- **Final chorus stop-time:** drums drop at 105.9–107.1, 116.0–116.8, and **full silence 121.1–122.2** (a cappella "above").
- **Outro:**
  - 122.3–125.4: band stabs.
  - **125.5–126.7: total silence** with the spoken "As mentioned above." (125.56).
  - **126.8: a final musical button** (0.8 s), decaying by 128.0.

## Chapters (one file each in src/ch/)

| File | Span | World |
|---|---|---|
| c01_intro.js | 0.00–10.45 | ping, the watch, the meadow hole, the vortex fall |
| c02_verse1.js | 10.45–32.09 | the burrow (misregistered warm comic) |
| c03_chorus1.js | 32.09–47.74 | the stage, pink/yellow |
| c04_verse2.js | 47.74–69.27 | mood wash (Gwen-style), the pause |
| c05_chorus2.js | 69.27–87.74 | the stage, blue/cyan, panels + acceleration + Evangelion card |
| c06_bridge.js | 87.74–104.63 | noir: paper, ink and red only |
| c07_final.js | 104.63–122.25 | 3 a.m. Spider-Punk collage |
| c08_outro.js | 122.25–128.64 | stabs, the ending fairy, the button, the title card |

Lyric modes per line live in src/lyricplan.js (owned by the director). "(diegetic)" means the shot letters the line itself. Where a shot says "lyric column left", keep x < 900 calm (flat or defocused) for the text.

---

## 1 · Intro (0.00–10.45)

| Time | Lyric | Picture | Notes / out |
|---|---|---|---|
| 0.00–0.20 | — | **PING.** Frame 0 is key art on a night-ink field: a big notification toast (paper card, tilted −4°) reading "🔔 Review requested / **Small fix #4812** / **+14,203 −12**", with a red badge "1" at its corner and a cyan ping ring expanding from the badge. The rabbit's two ear tips poke up from the bottom edge. The toast is already on screen at frame 0, mid-slam (1.15 → 1.0). | No fade-in. This frame is the thumbnail. |
| 0.20–1.30 | — | **Stab 0.20:** extreme close-up of the pocket watch. The orange lid springs open on the stab (smear), revealing 4:58:30, the red countdown arc and "T−90s". The rabbit's paw holds it at the bottom, the chain swings, the second hand ticks on beats, and the camera pushes slowly. Background: burrow-warm ink, defocused. | The watch face's circle graphic-matches the badge. |
| 1.30–2.62 | "Ninety seconds on the clock" **(hero)** | The watch slides to the right half, still ticking. The lyric column on the left is HUGE: NINETY / SECONDS / ON THE CLOCK, with NINETY in orange. Quiet ink background. | The hook. Type fills about 55% of the height. |
| 2.62–4.30 | — | **Wide, golden hour, Friday.** A flat orange sky, a halftone sun low behind, a meadow of simple grass tufts. The rabbit stands at the rim of a round hole in the grass; the hole glows orange and cyan from below. A White Rabbit "I'm late!" beat: it checks the watch, ears shoot up, sweat drop, then tucks the watch (3.85) and crouches in anticipation (4.1). | Sun and hole are two circles, another graphic match. |
| 4.30–5.30 | "Down the rabbit hole" **(diegetic)** | The rabbit dives head first (4.34 takeoff arc). The words DOWN · THE · RABBIT · HOLE pop in at their onsets around the hole rim, then get sucked down into it, shrinking and spiralling. The camera tilts down into the hole. | Cut on the drop, 5.30. |
| 5.30–7.85 | "tick, tick, tock" **(diegetic)** | **The vortex fall** (band drop). Looking straight down an inward-spiralling blow-up vortex: orange streamlines inside (fast) and cyan outside (slow), rotating, stretching, halftone, like the Navier–Stokes blow-up figures. The rabbit falls away from camera, tumbling, ears flapping, with speed lines. A clock face flies past the camera on each of **tick 6.13, tick 6.73, TOCK 7.38**, each with a giant SFX word; TOCK is biggest and the rabbit bonks off it. Wonderland debris drifts by: a golden key, `fix()`, `console.log("here")`, a green check (verse-1 foreshadowing). | |
| 7.85–10.20 | — | **Acceleration.** The timeline rushes up the hole as taped xerox cut-outs (inserts), each on screen 0.45 s at first, shrinking to 0.12 s: | Pause-bait: every card must be legible in freeze-frame. |
| | | 1. tweet "wake up babe, new model dropped" | |
| | | 2. METR-style log chart with its line going vertical ("Measurements above 16 hrs are unreliable") | |
| | | 3. arXiv "On the Finite-Time Blowup of Friday Deploys" | |
| | | 4. stopwatch "88:00:00 · 10,000 agents" | |
| | | 5. scoreboard "42/42" | |
| | | 6. Lean terminal `✔ 0 sorry` | |
| | | 7. toggle "it's so over ⇄ we're so back" | |
| | | 8. prompt box "What do you want to build?" | |
| | | 9. bar chart "commits/month 1.4B → 2.9B", its bar punching out of the frame | |
| | | 10. speedometer "RSI" with a SPEED LIMIT sign | |
| | | The vortex spins faster and the rabbit tumbles. Around 10.0 the vortex pinches to a point. | |
| 10.20–10.45 | — | The rabbit shoots out of the bottom of the hole and crash-lands in its office chair in the burrow: squash, dust puff, "THUD". | Lands on 10.40; verse 1 starts on the ping. |

## 2 · Verse 1: the burrow (10.45–32.09)

Split mode: lyric column left (hero, mid-size, varying height), action right. The burrow is warm, with the monitor wall and desk on the right half.

| Time | Lyric | Picture |
|---|---|---|
| 10.45–12.00 | "Ping in the burrow," **hero-left** | Burrow wide, just after landing. The main monitor **PINGs** (10.449): cyan ring, the screen floods the burrow with light, and the rabbit spins round in the chair to face it. Roots sway. |
| 12.00–13.40 | "my ears stand tall" **hero-left** | Low-angle medium close-up. The ears **spring up** on "ears" (12.14), then stretch absurdly TALL out of the top of the frame on "stand" / "tall" (12.5 / 12.86), with rabbit-sense squiggles. The camera tilts up with them. |
| 13.40–14.45 | "'Small fix,'" **hero-left, deliberately tiny** | The monitor close-up: the PR header (UI font) reads **Small fix #4812** · Open. The rabbit's face is reflected in the screen, leaning in, curious. The lyric is set *small*, as a joke. |
| 14.45–16.90 | "fourteen thousand lines in all" **hero-left, huge** | The diffstat odometer spins up to **+14,203**. The green bar overflows the monitor and a printed diff spews out as a paper scroll, unrolling across the floor, out of the door and up the tunnel. The rabbit's jaw drops (mouth 'o', eyes wide) and its ears blow back. Pause-bait on the scroll: "🤖 Co-authored-by: 64 agents". |
| 16.90–18.10 | "Nested ternaries," **caption** | A code panel on ink: `a ? b ? c : d ? e : f : g` with the ternary nesting fractally, each `?` opening a sub-panel (Droste zoom). The rabbit's eyes turn to spirals. |
| 18.10–19.70 | "a function called 'fix'" **caption (continues)** | `function fix() {` huge in mono, stacking with `fix2()`, `fixFinal()`, `fix_ACTUALLY_final()`, `fix_final_v3_REAL()`. The rabbit is deadpan (lids .5, mouth flat). Push in on "fix" (19.0). |
| 19.70–21.70 | "Forty-six console logs" **hero-left** (46 in orange) | `console.log("here")` lines rain down and stack like Tetris: "here", "here2", "HERE???", "why", "asdf", "it works??", "🙏". A counter ticks to **46** and the rabbit counts on its paws. |
| 21.70–23.40 | "left in the mix" **hero-left** | Pun: the rabbit as DJ, headphones clamped over its ears, behind a mixing console whose channel strips are labelled `console.log` ×46. It rides a fader and the VU meters pump on the beat. The burrow goes party-pink for 1.7 s. |
| 23.40–25.55 | "A secret key committed," **caption** | Diff close-up: a green line `+ STRIPE_SECRET_KEY = "sk_live_HOPHOPNOPE_4f9…"` with a literal golden key embedded in it, sparkling. Rabbit-sense squiggles. A red **CRITICAL** stamp lands on "committed" (24.50). |
| 25.55–27.30 | "plain as day" **caption (continues)** | The key on a giant billboard in a noon city, under a halftone sun blazing with flat rays. The key is huge; "PLAIN AS DAY". |
| 27.30–28.72 | "The tests all pass" **hero-left** | CI panel: "✓ All checks have passed", green checks popping in on beats, confetti. The rabbit relaxes and smiles. |
| 28.72–30.10 | "'cause they're skipped anyway" **hero-left** (SKIPPED emphasised) | Zoom into the test file: `it.skip(`, `describe.skip(`, `xit(`, and "0 passed · 412 skipped". The green checks turn out to be cardboard cut-outs on sticks. The rabbit pokes one and they topple like dominoes. |
| 30.10–32.09 | — (snare roll 30.84) | The rabbit's signature move: it plucks the **red pen from behind its ear**, cracks its knuckles and writes furiously (smears). "Actionable comments posted:" rolls 0 → 1 → 2 → **3** on the last three snare hits, and a zoom punch into the "3" cuts to the chorus. |

## 3 · Chorus 1: the stage (32.09–47.74)

Centre mode. The stage is the PR page as a pop stage: a pink/yellow sunburst, a marquee reading "Small fix #4812 / Actionable comments posted: N", a diff-stripe floor, and the Merge button as the altar.

| Time | Lyric | Picture |
|---|---|---|
| 32.09–33.40 | "Three" **hero-centre** THREE | SLAM on 32.09. The rabbit centre stage presents with jazz hands, and three BIG comment-bunnies (about 180 px) pop up from the floor on 32.22 / 32.92 / 33.44. The marquee counter reads 3. |
| 33.40–35.15 | "little comments on your PR" **hero-centre** | The bunnies take a chorus-line formation on the diff lines; slow push-in. |
| 35.15–35.88 | "(hop! hop!)" **SFX** | **Point choreo 1.** Static, centred, full body, plain pink field. The rabbit and the three bunnies hop twice in unison on 35.225 / 35.596 with ear flicks, and HOP! stamps land. *(This exact framing returns in every chorus.)* |
| 35.88–37.25 | "Did anybody read" **hero-top** | The `you` cursor whooshes right to left across the page, scroll-blurred. It passes over the bunnies without stopping, and their eyes follow it. Speed lines. |
| 37.25–38.40 | "a single one?" **hero-top** (SINGLE) | Close-up: the rabbit holds ONE bunny up to camera. Both have pleading, sparkly big eyes. |
| 38.40–38.98 | "(nope! nope!)" **SFX** | **Point choreo 2** on a plain red field. The cursor wags left/right like a "no-no" finger on 38.43 / 38.73, two giant red NOPE stamps slam, and the rabbit's head whips with a smear. |
| 38.98–39.80 | "Click, click," **sub** | Cursor swarm: a dozen `you` cursors converge in formation and click in unison on 38.99 / 39.50. Click rings; two bunnies squash into "Resolved" bars. |
| 39.80–40.90 | "resolve all," **sub** | A big pink **Resolve all** button is pressed. All the bunnies go *poof* into grey Resolved bars, and "Actionable comments posted: 3" gets struck through. |
| 40.90–41.70 | "thumbs up," **sub** | A giant drawn thumbs-up reaction slams in with "👍 1" and bonks the rabbit's ears flat. |
| 41.70–42.50 | "amen" **sub** | The Merge button as an altar: stained-glass halftone rays and a choir of agent-bots singing "LGTM". |
| 42.50–43.20 | "Hop, hop," **SFX** | Point-choreo framing again, but alone and smaller: the rabbit hops twice on 42.54 / 42.89. |
| 43.20–44.80 | "guess I'll write 'em all again" **hero-centre** | Sisyphus: the rabbit pushes a boulder-sized comment-bunny up the page's scrollbar (a hill). It rolls back and the counter resets to 3. |
| 44.80–47.74 | held "again~" | Time-loop: the rabbit writing the same three comments over and over in a Droste tunnel of shrinking panels. Evangelion-style stacked **AGAIN AGAIN AGAIN** blocks grow with the rising melisma. On 47.74 the watch face fills the frame. |

## 4 · Verse 2: the mood wash (47.74–69.27)

Gwen-style: the backgrounds are big wet-edged colour blobs whose hue follows the rabbit's mood:

| Mood | Wash |
|---|---|
| Hope | yellow |
| Hurt | blue |
| Paused | grey |
| The poem | pink/peach |

The lyrics are **caption** boxes, the rabbit's inner voice.

| Time | Lyric | Picture |
|---|---|---|
| 47.74–48.75 | "Sixty seconds," | Pocket-watch close-up: the countdown arc snaps to 60, the hands jump, and "T−60s". |
| 48.75–50.95 | "force-push on the branch" | The cursor types `git push --force` in a terminal strip (48.78). A Hokusai-style **great wave made of green diff lines** (`+ + +`) rises and crashes over the PR page (49.4–50.5), sweeping the comment-bunnies away. The rabbit clings to a literal tree **branch** labelled `fix/small-fix`. |
| 50.95–52.55 | "Whole review gone," | Aftermath on the soaked page. The comments are grey with **Outdated** tags, glitching and dissolving, and the timeline event reads "you force-pushed the branch from `a1b2c3` to `d4e5f6`". The rabbit reaches out. |
| 52.55–54.20 | "never had a chance" | The rabbit sits alone on the wet page, ears drooping (one folded). The wash turns deep blue, with rain as ink streaks. The last outdated bunny fades in its paws. |
| 54.20–55.62 | "You said 'it's never null'" | The dev's reply card pops in: `you`: "it's never null 👑". The cursor sprouts a crown. |
| 55.62–57.30 | "like you're the king" | The cursor on a gold throne, with rows of agent-bots bowing, each bubble reading **"You're absolutely right!"**. The rabbit in the corner raises a paw, "Actually—", and a bot's hand covers its mouth. A 3-frame flash-forward insert: `TypeError: Cannot read properties of null (reading 'id')` in red. |
| 57.30–58.95 | "I drew a diagram," | The rabbit proudly unveils a big **sequence diagram** on an easel, Mermaid-style: Client → API → DB, with lifelines, arrows and a red note "null?". Sparkles; the wash is warm yellow. |
| 58.95–60.95 | "you didn't read a thing" | The cursor scrolls straight past. The diagram smears into speed lines, "Seen by 0", and the rabbit's ears fold. |
| 60.95–62.95 | "You typed 'CodeRabbit, pause,'" **(diegetic + caption)** | Comment-box close-up: the cursor types **@coderabbitai pause** letter by letter, finishing "pause" at 62.24. It clicks Comment (62.6), the bot reply "✅ Reviews paused" appears, and everything FREEZES at 62.95. |
| 62.95–64.60 | "like I'm to blame" | **Killing part:** the frame is frozen, greyscale, with the VHS "▌▌ PAUSE" OSD and tracking lines. The rabbit is frozen mid-type; only its **eyes slide to camera** (63.2), then a slow deadpan blink (63.66). A 4-frame insert: a protest sign "PAUSE AI" with AI crossed out and RABBIT scrawled in. |
| 64.60–66.55 | "I wrote a poem for you" | The world stays frozen and grey, but the rabbit un-pauses *itself*: colour returns to it alone and the OSD glitches away. It takes the red pen and writes. A pink/peach watercolour-style wash blooms behind it, and the poem appears handwritten on a card (pause-bait): *"fourteen thousand lines of 'fix', / a key, a null, a skipped-test mix. / I read them all. I always do. / 🐇 hop hop — I wrote this for you."* |
| 66.55–69.27 | "all the same" + held "same" | The poem card folds into a paper aeroplane (66.9), glides across the frozen world into the PR thread and lands. The cursor instantly collapses it: **Resolved** (68.2). The watch flashes T−30, and the Resolved bar becomes the chorus-2 stage floor (69.27). |

## 5 · Chorus 2: the stage, escalated (69.27–87.74)

The same template with the dials up: a blue/cyan/yellow sunburst, 40 bunnies, faster camera, panels, two text systems (lyric + ticker/counter), and zeitgeist bleed.

| Time | Lyric | Picture |
|---|---|---|
| 69.27–70.35 | "Forty" **hero-centre** FORTY | SLAM. Forty comment-bunnies erupt from the floor in a grid, popping on eighth notes. The marquee reads 40. A METR-style log chart cut-out slides in with 3 → 40 on log axes and a dashed trend line. |
| 70.35–72.35 | "little comments on your PR" **hero-centre** | Three panels: (a) bunnies in a V formation, (b) a release ticker crawling ("MODEL 5.6 SOL ▲ · 6 ASTRA ▲▲ · FLASH 3.8 ▲ · NEW SOTA ▲ · NEW SOTA ▲"), (c) the watch at T−30. |
| 72.35–73.00 | "(hop! hop!)" | Point choreo 1 in the same framing as chorus 1, on a blue field. Forty bunnies behind the rabbit hop in unison on 72.40 / 72.77. |
| 73.00–74.50 | "Did anybody read" **sub** | **The Shinji-in-a-chair composition** (our own characters): a black void, a single top light, a folding chair. The developer's silhouette slumps in it, surrounded by floating prompt boxes that multiply: "What do you want to build?", "What can I help you ship?", "Start a new agent", "✨ Generate", "Run 64 agents in parallel?", "Ask anything". |
| 74.50–75.50 | "a single one?" **sub** | The inversion: the rabbit in the same chair in the same void, ears drooping, surrounded by its 40 unread comment-bunnies floating like the prompt boxes. |
| 75.50–76.15 | "(nope! nope!)" | Point choreo 2 again on blue (75.54 / 75.88). The NOPE stamps are bigger, and all 40 bunnies shake their heads. |
| 76.15–77.30 | "Click, click," **sub** | A cursor army: 40 cursors and agent-bots click in unison (76.16 / 76.70). A giant **Accept All** button with a spinning click odometer. |
| 77.30–78.05 | "resolve all," **sub** | Forty bunnies collapse in a domino cascade into Resolved bars; the page becomes a grey barcode. |
| 78.05–78.85 | "thumbs up," **sub** | A rain of thumbs-ups, "👍 40". |
| 78.85–79.60 | "amen" **sub** | The altar is now a stadium with 40 bots in the choir and an LGTM stamp. A flash insert of the "RSI" speedometer needle swinging into the red past a SPEED LIMIT sign. |
| 79.60–80.30 | "Hop, hop," | The rabbit hops twice (79.62 / 80.13), alone and smaller on an emptier, larger stage. |
| 80.30–81.90 | "guess I'll write 'em all again" **hero-centre** | Four panels of the rabbit writing, faster each time. The METR chart's line goes vertical, with the footnote "Measurements above 40 comments are unreliable with our current rabbit." |
| 81.90–85.30 | held "agaaain" (rising) | **The acceleration crescendo:** |
| | | • the ticker blurs solid | |
| | | • calendar pages tear off, each stamped NEW SOTA | |
| | | • the "it's so over ⇄ we're so back" toggle flips faster and faster | |
| | | • a 🟢🟡🔴 problem-tracker spreadsheet scrolls faster | |
| | | • a stopwatch hits 88:00:00 | |
| | | A grey banner slams down: **THIS TRACKER IS NO LONGER UPDATED** (84.85). The rabbit spins in its chair at the centre with spiral eyes. | |
| 85.30–87.74 | — (drum fill) | **Evangelion title card**, white Mincho on ink in squashed L-blocks: "LINE" / "9,012" / "第九千十二行" / "THE RABBIT, READING". Two hard cuts within it on the fill (86.54, 87.2), each re-arranging the blocks. |

## 6 · Bridge: noir (87.74–104.63)

Half-time and slow, with long shots. **Paper, ink and red ONLY** (Earth-42 style: no gradients, the linework reveals the light). Lyrics are black **noir caption** boxes with white text and red emphasis.

| Time | Lyric | Picture |
|---|---|---|
| 87.74–91.10 | "Line nine thousand twelve, now what is this?" | Long shot. The rabbit, hood up like a trench coat, with a flashlight, walks into a canyon whose walls are towering lines of code receding in perspective. Line numbers on the gutter wall tick 9008… 9011, **9012**, and it stops on "now" (89.6). The flashlight is a hard-edged white cone with a halftone edge. |
| 91.10–94.40 | "Unsanitized input, there it is" | Slow push-in on the code line in the beam: `const q = "SELECT * FROM users WHERE name = '" + req.query.name + "'";` with `req.query.name` in red. The incoming input `Robert'); DROP TABLE users;--` creeps along the line like a shadow. On "there it is" (92.86), an extreme close-up of the rabbit's eye with the red line reflected in it; rabbit-sense squiggles at maximum. |
| 94.40–97.60 | "I flagged it red, in all caps, with my paw" **hero, ALL CAPS, red** | The paw slams down (94.64) and a red paw-print stamps the line. The rabbit writes "⚠️ CRITICAL: SQL INJECTION. SANITIZE THIS INPUT." On "caps" (95.84) the camera **rotates 180°**, a Spider-Verse "leap of faith" homage: the rabbit hangs upside down from the canyon wall, flag raised, with the city of code hanging below. |
| 97.60–101.10 | "You clicked on merge and then you shipped the flaw" **sub** | Slow motion: the cursor descends on the Merge button, drawn in ink, white and red. The watch shows **5:00:00** and the click on "merge" (98.56) is a one-frame white flash plus a clock "DONG". Then "shipped" (99.88): the red line tears out of the page and sails off on a little noir **steamship** ("ship it"). The rabbit stands on the dock and watches it go. |
| 101.10–104.63 | held "flaaaw" (rising) | **Ink corruption** (Spot style): red ink spills from the ship's wake across the sea of code, chewing the frame. The watch hands spin forward in a time-lapse from 5 PM to 3 AM, night falls, and the paper turns night-blue. The spill forms **03:00** at 104.4, then SLAM into the final chorus. |

## 7 · Final chorus: 3 a.m. (104.63–122.25)

Spider-Punk collage: xerox cut-outs of earlier inserts, taped and on threes, in night blue + alarm red + orange. The hero lyrics are **ransom-note** letters (each glyph on its own cut-out scrap).

| Time | Lyric | Picture |
|---|---|---|
| 104.63–105.90 | "Four hundred" **ransom hero** | SLAM: "Actionable comments posted: **400**". Four hundred comment-bunnies flood the PR page like a stampede and pile up. The alarm strobes red (at most 3/s), and the pager buzzes 03:00. |
| 105.90–107.10 | "comments on your PR" **ransom** (drums stop) | Stop-time: the frame holds on the pile. The rabbit, exhausted (bags 1), sits on top holding a mug, deadpan, king of the mountain. |
| 107.10–108.35 | "(hop! hop!)" | Point choreo 1, same framing, red field. Four hundred bunnies hop in unison (107.44 / 107.76) and the camera shakes on each hop. |
| 108.35–110.80 | "So now you wanna read a single one?" **ransom** | The developer's silhouette at the desk at 3 a.m., lit blue by the monitor, glasses glaring, scrolling frantically. The status page behind reads "Major outage", and the cursor trembles with a sweat drop. |
| 110.80–111.40 | "(yep! yep!)" | Point choreo 2 **inverted**: a NOD in the same framing as the NOPE shots. The cursor bobs up and down twice (110.88 / 111.22), the rabbit nods slowly with half-lidded eyes, and YEP stamps land in yellow. |
| 111.40–112.35 | "It's three a.m.," **ransom** | The pocket watch at 3:00 AM with cracked glass, the pager, a halftone moon. |
| 112.35–113.25 | "prod's down," **ransom** | The outage montage, one cut-out per eighth: status-page rows flip red; `thread 'worker' panicked at 'called Option::unwrap() on a None value'`; `;; ANSWER SECTION:` (empty); a dripping server rack; an Error 500 page with *our* rabbit drawn as the error mascot. |
| 113.25–114.85 | "who could've known?" **ransom** | The "Congratulations" ring: agent-bots in a circle around the developer's silhouette, clapping and saying "LGTM!". The rabbit stands at the edge of the ring, deadpan, lifting one paw slightly. |
| 114.85–116.00 | "You scroll back to my comment" **ransom** | Close on the scroll wheel. The page starts scrolling UP, with comment-bunnies whooshing down past the camera. |
| 116.00–116.80 | "and you" (drums stop) | Freeze: the scrollbar thumb at the very bottom. Tension. |
| 116.80–119.90 | held "groan" | **The scroll back:** a vertiginous scroll up through 400 comments, then the whole video's events in reverse as a flying callback montage: the ship, the diagram, the poem, the wave, the key, the console logs, +14,203. It is the reverse of the rabbit-hole fall, decelerating. |
| 119.90–122.25 | sung "As mentioned above." **(diegetic)** | **The comment:** the rabbit's comment card from the bridge fills the frame, clean. It reads "coderabbitai · 10 hours ago", ⚠ Potential issue / 🔴 Critical, "Unsanitized input on line 9012 → SQL injection. Sanitize this input.", with the red paw print. Below it, a reply types itself: **"As mentioned above."** From 121.1 the music is silent: hold perfectly still (`BOIL = 0`). |

## 8 · Outro (122.25–128.64)

| Time | Lyric | Picture |
|---|---|---|
| 122.25–125.45 | — (band stabs) | Hot-fix montage, one UI event per stab: |
| | | • "Revert 'Small fix' #4813 · **+12 −14,203**" opened (122.3) | |
| | | • CI green (122.7) | |
| | | • Merged, purple (123.1) | |
| | | • status page flips to "All systems operational" (123.6) | |
| | | Then (123.8–125.2) the cursor moves slowly to the rabbit's comment and leaves the first reaction of the whole video, **👀 1**. | |
| 125.45–126.75 | spoken "As mentioned above." **sub, GitHub-comment style, small** | **Ending fairy:** deadpan close-up of the rabbit in the burrow, lit by the monitor. Half-lidded, bags, one ear up and one flat, holding the carrot mug. Total stillness except a slow blink at 126.2. No music. |
| 126.75–127.65 | — (button) | **PING!** A cyan ring and the toast slam in: "Review requested · **Small fix (again) #4814** · **+28,406 −3**". The rabbit's ears spring straight up by reflex (SPROING) and its pupils shrink to dots. |
| 127.65–128.64 | — | **Title card**, Evangelion-style: "CODERABBIT, PAUSE" / "コードラビット、一時停止" / "EPISODE: 4814". Hold to the end. The video loops to frame 0's ping. |
