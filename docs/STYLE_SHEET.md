# CodeRabbit, Pause: style sheet

**The look in one line:** a misregistered comic printed in six riso inks, with the internet cut out and taped in.

The video is Spider-Verse *grammar* rather than Spider-Verse *likeness*: halftone instead of gradients, colour-plate misregistration instead of blur, characters on twos against cameras on ones, and comic lettering that lives inside the frame. Everything is printed with the same inks, including the "internet brutalism" inserts (tweet cards, charts, GitHub UI, Win95 dialogs). That shared print treatment is what makes a collage of wildly different sources read as one world.

Thesis, for every design decision: **everything is generated, nothing is read.** The rabbit is the last reader, and reading is the scarce, slow, loving act.

---

## 1. Inks (palette)

Use the names in `INK` (src/core.js). Every frame is paper plus ink, plus **orange**, plus at most two more inks.

| Ink | Hex | Meaning (locked) |
|---|---|---|
| paper | `#F2EEE3` | Everything is printed on this. Even night is ink over paper, never pure black. |
| ink | `#16121F` | Lines, text, shadows. |
| orange / orangeDk / orangeLt | `#FF570A` / `#C23F06` / `#FF9A5C` | The rabbit (CodeRabbit orange). The one emphasised word of a lyric line. |
| pink | `#FF3D8B` | The developer's cursor ("you"). Chorus-stage heat. |
| blue / night / nightLt | `#2B59FF` / `#141A3C` / `#28346E` | Night, verse-2 melancholy, depth. |
| cyan | `#19C6E6` | Notifications, pings, screen glow. |
| yellow | `#FFD23F` | Caption boxes, highlight, "LGTM" glory. |
| green | `#1FB36B` | Added lines, passing checks, the Merge button. Only ever "approved/added". |
| red / redDk | `#E8203A` / `#9C0F24` | Flaws, removed lines, alarms, the bridge's only colour. Only ever "danger". |
| purple | `#8250DF` | "Merged". Nothing else. |

Section keys (the stage recolours every chorus, BTS *IDOL*-style):

| Section | Inks |
|---|---|
| Intro | ink night, orange + cyan vortex (orange = fast, cyan = slow, like the Navier–Stokes blow-up figures) |
| Verse 1 (the burrow) | warm: orange, yellow, paper; cyan monitor light |
| Chorus 1 (stage) | pink + yellow sunburst |
| Verse 2 (mood wash) | blue → grey when paused → pink for the poem |
| Chorus 2 (stage) | blue + cyan + yellow, denser |
| Bridge (noir) | paper + ink + **red only** |
| Final chorus (3 a.m. collage) | night + red + orange, xeroxed cut-outs of earlier inserts |
| Outro | paper + ink + orange, near-empty |

## 2. Rendering grammar

1. **Print, don't render.** Flat fills; 2–3 tone bands; halftone dots (`shade`, `dotsIn`) in transitions and glows, hatching in deep shadow. No gradients, no blur. The only exceptions are the vignette in the grain layer and the tiny light glows.
2. **Ink contours.** Tapered, heavier on the side away from the light (`LIGHT` comes from the upper left), and boiling at 12 fps (`boil`). Outlines are at least 4 px on anything important.
3. **Depth is misregistration.** `depth(ctx, px, fn)` shifts the colour plates. Focus is 0. Background and foreground run 6–12 px. The focal subject is always registered.
4. **Stepped time.** Characters are posed from `twos(t)` (12 poses/s). Cameras, type and UI move on ones (24 fps). Collage cut-outs are on threes (`threes(t)`). The fastest frames of a big hit go to ones.
5. **Energy.** Smear or multiples on fast moves, never motion blur. `speedLines` go to the focus, `streaks` along travel, `krackle` on impacts, and `burst` balloons for SFX.
6. **Phone scale** (X shows 1920 px at about 390 px wide): halftone cells are at least 12 px on characters and 24–60 px on backgrounds. Must-read text is at least 60 px. Keep detail large and simple, because fine texture turns to mush in X's re-encode. Grain is static.
7. **Flash safety.** At most 3 full-frame flashes per second, and never on eighth notes.

## 3. The cast

### The Reviewer (the rabbit, "I")
- An **original** White Rabbit: cream fur, pink inner ears, big dark eyes with two highlights, and buck teeth when the mouth opens.
- An oversized CodeRabbit-orange hoodie with kangaroo pocket, white drawstrings and a rolled hood.
- A red review pen tucked behind the right ear, and a notch bitten out of the left ear.
- It is not the CodeRabbit logo and is never drawn as one.
- Silhouette: very long ears (half its height), big head, big feet. The ears are the main emotional instrument:

| Mood | Ears |
|---|---|
| Eager | tall, straight up |
| Alarmed / rabbit-sense | stiff, vibrating, with `sense` squiggles (the spider-sense, rabbit edition) |
| Ignored | one ear folds over at the middle (`b` bend), then both droop |
| Paused | frozen mid-flop, greyscale |
| Vindicated | one ear up, one ear flat, half-lidded eyes (deadpan) |

- Fatigue accumulates across the video: `bags` goes 0 in the intro, .3 in verse 2, .7 in the bridge, and 1 at 3 a.m.
- The rig is `rabbit(ctx, x, y, s, pose)` (src/rabbit.js). At s = 40 it stands about 580 px tall including ears. Hero shots use s = 50–90. Crowd rabbits use s ≤ 15.
- Mouth: `singOpen(t)` opens it on sung words. Use it only in shots where the rabbit is *performing to camera*. Most shots are acting, not lip-sync.

### "You" (the developer)
- Never shown as a person with a face. The developer *is* **the cursor**: a large black arrow pointer with a white rim and a pink name tag reading `you`, in the style of multiplayer cursors. It is fast, careless and dismissive. It clicks with a squash plus a ring.
- It can wear things: a crown in verse 2, sunglasses.
- It can multiply into a unison cursor swarm for "click, click, resolve all".
- At 3 a.m. only, the developer is a silhouette in a hoodie lit by the monitor, with glasses glare and no face.

### Comment-bunnies (the comments)
- Each review comment is a small creature: a paper speech bubble with two rabbit ears, two dot eyes, a speech-bubble tail, and a line of "text" squiggles or a ⚠️ chip.
- They hop. They multiply 3 → 40 → 400.
- When resolved, a comment squashes into a flat grey `Resolved` bar. When force-pushed away, it turns grey with an `Outdated` tag and glitches out.
- The badge that counts them is CodeRabbit's real review header, **"Actionable comments posted: N"**.

### Agents (the bots)
- Generic, unbranded helper bots: a rounded-square head, cyan visor band, and a tiny antenna tipped with ✨.
- They appear in identical rows and say **"You're absolutely right!"** or **"LGTM!"**, and clap in a ring at 3 a.m. (*Evangelion*'s "Congratulations" composition).

## 4. Recurring sets

1. **The burrow** (home). An underground workroom under tree roots: a wall of CRT monitors showing the PR, printed diffs pinned to the earth wall, a red-string board ("seen this null before"), a desk lamp, a carrot mug, and the rabbit's chair. It's warm and dense, with misregistered fills (Mumbattan-style: the fill is slightly offset from the line).
2. **The PR page** (the stage). A GitHub-*like* pull request drawn in inks:
   - Title: "Small fix #4812".
   - Pills: "Open", "+14,203 −12".
   - Tabs: Conversation / Commits / Checks / Files changed.
   - Diff gutters in green/red, comment threads, `Resolve conversation`, and the big green `Merge pull request` button.
   - No Octocat and no GitHub wordmark.

   In choruses the page becomes a performance stage: it's the floor, the Merge button is the altar, and the comment-bunnies are the dancers.
3. **The clock.** The rabbit's pocket watch (brass, orange enamel back). The face shows the time plus a red countdown arc to the **Friday 5:00 PM deploy**. The clock runs fast throughout:

| Section | Clock |
|---|---|
| Intro | 4:58:30, T−90 s |
| Verse 2 | T−60 s |
| Chorus 2 | T−30 s |
| Bridge | 5:00:00 exactly, when "you clicked on merge" |
| Final chorus | spins through the night to 3:00 AM Saturday |

## 5. Typography

| Role | Face | Notes |
|---|---|---|
| Hero lyrics, SFX | **Archivo** 900, stretch −2 (condensed) for stacks, +2 italic (expanded) for SFX | `hero()`, `sfx()`. One family, animated width. |
| Caption boxes (the rabbit's inner voice) | **Shantell Sans** 800 caps | `caption()`: yellow box, 4 px ink border, offset shadow. |
| Code, diff, terminal | **JetBrains Mono** 700 | |
| UI (PR page, tweet cards) | **Mona Sans** 600–800 | GitHub's own open-source UI face. |
| Evangelion cards | **Noto Serif Display** 900 (compressed with `sx .72`) + **Shippori Mincho B1** 800 for kana/kanji | White on ink, interlocking L-shaped blocks, mechanically squashed. |

Lyric modes (src/lyricplan.js sets one per line):
- **hero**: justified stacked slab; each row fills the column width. Used for the hook (intro), chorus downbeats (centre) and one key line per verse (left column, x 96–880).
- **caption**: Spider-Verse narration box. The rabbit's inner voice, mostly in verse 2.
- **sub**: subtitle scale, at least 54 px, word-highlight. Used when the picture carries the joke.
- **none (diegetic)**: the shot letters the line itself, typed into a comment box, written as code, or flying down the rabbit hole. This is the best tier; use it whenever the words *are* an object in the scene.

Type law:
- At most 3 sizes and 2 text systems (lyric plus one gag) per frame.
- One emphasised word per line, in orange (red in the bridge).
- Words appear one frame before their vocal onset and accumulate until the line ends.
- Unsung text lasts at least 0.3 s per word, *except* deliberate pause-bait (the diff, the poem, chart footnotes), which is a rewatch reward.
- Text should add a joke, not echo the vocal.

## 6. Layout modes

- **Hook / full-bleed hero**: the type fills 40–60% of the frame height and the background is quiet (flat ink or a single slow element).
- **Split (verses)**: the lyric column sits left at x 96–880 and the action right at x 1000–1824. Move the column's vertical position between lines.
- **Centre (chorus downbeats)**: symmetric, with the rabbit or the counter dead centre. Choreo moments ("hop! hop!", "nope! nope!", "yep! yep!") are shot the same way every chorus: full body, static camera, plain colour field, held for at least 1 bar. They should be GIF-able.
- **Panels (chorus 2, final chorus)**: 2–5 comic panels with paper gutters. Each panel lands on a beat.
- Safe area: keep faces and must-read text inside x 96–1824, y 54–1026.

## 7. Motion and timing

- **Sync law:** a visual hit lands on the frame of the sound, or one frame early, never late. Use word times from `LINES`, beats from `beatTime(i)`, and hits with `hit(t, times)`.
- **Cut grid:** verses cut on the bar or half-line (about 1.7 s). Chorus cuts go on the vocal hits and the half-time pulse (0.84 s). Any shot that must be *read* holds at least 1 s. Flash inserts of 2–6 frames go on snares and ad-libs, at most one per bar in verses.
- **Toggle, don't ramp:** speed changes are discrete (real time ↔ half-time ↔ freeze), except for deliberate accelerations (the intro fall, the clock at night).
- **Acting:** anticipation → action → overshoot → settle. Mood changes go through a blink or squash, never a snap. The rabbit is deadpan against absurd escalation; understatement is the joke.

## 8. Inserts (internet brutalism)

The inserts are recognisable formats, redrawn in our inks:
- tweet cards with invented handles
- a METR-style log chart
- an arXiv abstract page
- a Lean terminal
- a Win95 dialog
- a status page
- the prompt box ("What do you want to build?")
- a release ticker
- Evangelion title cards

They are **printed matter**: taped xerox cut-outs (edges jitter on threes, strips of tape, a slight tilt), ink-bordered panels, or screens drawn inside the world. A bare full-frame swap is a deliberate "brutal cut", at most one per section.

The inserts drive the plot (comment → ignored → resolved → merged → prod down) and the acceleration theme. They never carry real logos, real people, real faces, or quotes attributed to real people. Numbers can be real-world-flavoured ("88 hours", "10,000 agents", "42/42") without naming anyone.

## 9. Transitions

- **Hard cut on the beat** (default).
- **Graphic match:** badge ↔ watch face ↔ rabbit hole; comment-bunny ↔ speech bubble.
- **Scroll:** the PR page scrolls into the next scene.
- **Glitch cut** (force-push, 2–6 frames).
- **Ear wipe:** the rabbit's ear swipes across frame.
- **Dot wipe:** halftone dots grow to cover the frame (`dotWipe`).
- **Panel split / merge.**
- **VHS pause** ("CodeRabbit, pause").

## 10. Do / don't

- **Do:** big simple shapes, one focal point, an action in every shot, deadpan acting, real CodeRabbit strings (`@coderabbitai pause`, "Actionable comments posted", the poem), and real dev strings (`git push --force`, `it.skip`, `console.log("here")`).
- **Don't:**
  - soft gradients, blur, or glowing-brain "AI" iconography
  - purple-to-blue ✨ gradients, Matrix rain, Drake/galaxy-brain templates
  - real logos or real people
  - Spider-Man, Miles, Shinji or Ghibli likenesses
  - text that only repeats the vocal
  - thin 1 px detail
  - more than 3 flashes per second
