# This Could Have Been a Text: style sheet

**The look in one line:** on camera he's a corporate stock illustration; off mute he's a punk zine.

**Thesis:** *polite on camera, screaming inside.* Dan sits through call after call, nodding, smiling, on mute. The band, **OUT OF OFFICE**, is the same people unmuted: Dan and three coworkers who suffer through the same meetings. Every time the song gets loud, the mask slips and the rage shows up in colour. The video's arc is that colour **bleeding from the stage into the office** until, at the breakdown, the office itself catches fire and the band plays the final chorus on the conference table.

Procedural Canvas 2D, 1920×1080, 24 fps, song 179.88 s, ~143.6 BPM pop-punk. Every frame is a pure function of song time.

---

## 1. The two worlds

| | OFFICE (reality, on camera, muted) | STAGE (inside his head, unmuted) |
|---|---|---|
| Ink switch | `look(0)` | `look(1)` (default every frame) |
| Palette | washed-out corporate pastels: greige walls, blue-grey carpet, beige laminate, fluorescent white, pale-blue shirt. The only saturated colour is the **app UIs in their real brand colours** (Teams purple, Slack aubergine, Zoom blue, Outlook blue). | hot riso inks: ink black, paper, **red**, **fluoro pink**, **yellow**, plus one section ink (cyan, blue, orange). |
| Line | thin, even, grey `INK.oline`, nearly no boil | heavy tapered ink, boiling 12×/s, heavier on the shadow side |
| Shading | one flat cel-shadow band (automatic under `look(0)`) | halftone dots, hatching in deep shadow |
| Depth | none: everything registered, clean, sterile | `depth()` misregistration everywhere (6–14 px), `misregFrame` on hits |
| Camera | locked off, symmetric, centred, webcam framing; at most a slow push | handheld `shake`, punch-zooms on snares, whip pans, Dutch tilts, crash zooms |
| Characters | posture hunched, faces polite: fixed smile, blank glasses glare, slow blinks | arched back, leaning into the mic, full rage faces, sweat and spit flying |
| Lettering | lyrics are UI text: Teams **live captions**, chat bubbles, invite titles, slide titles | lyrics are punk flyer type: huge condensed `hero` slabs with stroke + extrude, marker scrawl, `ransom` cut-outs |
| Editing | longer holds (1 bar), cut on the bar | cut on kicks and snares, 2–6 frame inserts, flashes on hits (≤ 3/s) |

**Blending.** `look(k)` with 0 < k < 1 is the rage bleeding in: lines thicken and start to boil, flat shadows turn to halftone past k = .5. Use it for the moments where the office starts to crack (pre-choruses, verse-2 glitches, the bridge build), and drive it with a section-level curve, never per-word flicker.

**Mask slips.** The core editing device. Inside an office sequence, on a hard consonant or hit word ("SEC", "TEXT", "SLACK", "BUDDY"), cut for 2–6 frames to stage-Dan screaming the same word in full riso, then straight back to office-Dan, polite, as if nothing happened. They get more frequent and longer each section.

**Split screen.** A Teams tile border divides the frame: left tile = office Dan nodding on mute, right tile = stage Dan screaming. Same line, two worlds, perfectly synced.

**The grid is the band.** In the Teams gallery each band member has a tile: Dan, Linda (her cat on the keyboard), Tasha (camera off, initials), Bob (frozen, "unstable connection"). When a chorus hits, the tiles *unmute*: each tile turns into that member on stage playing their instrument, in riso, inside the Teams tile. Greg's tile stays office-pastel, still talking.

## 2. The bleed, section by section

| Section | Time | World | `look` | Stage ink key |
|---|---|---|---|---|
| Verse 1 | 0–13.2 | office, 8:57 AM | 0 | mask slips 2 frames, red only |
| Pre-chorus 1 | 13.2–20.7 | office cracking (band enters at 13.6) | 0 → .4 | |
| Chorus 1 + tag | 20.7–41.2 | first full STAGE reveal at the 22.3 slam | 1 | red + pink + yellow |
| Verse 2 + PC2 | 41.2–61.9 | office, 12:01 PM, screen share | 0 → .5 | mask slips 4 frames |
| Chorus 2 | 61.9–76.8 | stage, bigger, the grid crowd | 1 | cyan + blue + yellow |
| Post-chorus | 76.8–92.3 | montage: calls invade his life (shower, gym, bedroom, beach), then Linda's solo | .6 home, 1 solo | pink + red |
| Verse 3 | 92.3–105.9 | office, 3:30 PM, stop-time stabs, paperwork avalanche | .3 | orange |
| Bridge | 105.9–121.85 | office, 4:59 PM; the build; Greg's forehead | .3 → .8 | red |
| Breakdown | 121.85–137.7 | the office ERUPTS into riso: band materialises in the office | 1 | red + yellow, everything |
| Final chorus | 137.7–152.45 | the office IS the stage: band on the conference table | 1 | every ink, Teams purple as a stage light |
| Final tag + outro | 152.45–179.88 | singalong, then calm: 5:01 PM, "No.", the text arrives | 1 → 0 | paper + ink + red, near-empty |

## 3. Inks (`INK` in src/core.js)

**Stage riso:** `ink #16121F`, `paper #F7EEDC`, `white`, `red #E8203A` / `redDk` (rage, always), `pink #FF3D8B` / `pinkLt`, `yellow #FFD23F`, `orange`, `blue`, `cyan`, `green`, `purple`, `night`. Every stage frame is paper + ink + red + at most two more.

**Office pastels:** `wall`, `wallDk`, `ceil`, `fluoro`, `carpet`, `carpetDk`, `desk`, `deskDk`, `cube`, `cubeDk`, `plant`, `plantDk`, `oline` (office line colour), `ogrey`, `oshirt` (Dan's shirt). Low contrast, no pure black, no pure white.

**App brand colours (real):** `teams #5B5FC7` / `teamsDk` / `teamsLt` / `teamsBg #1F1F1F` / `teamsTile` / `teamsBar`, `msRed #C4314B` (Leave), `msGreen`, `slack #4A154B` / `slackDk` plus the logo four (`slackBlue`, `slackGreen`, `slackYellow`, `slackRed`), `zoom #0B5CFF` / `zoomBg`, `outlook #0078D4` / `outlookLt` (the "little blue box"), `ppt #C43E1C`.

Meaning is locked: **red = rage**. Teams purple = the meeting (the enemy, and in the final chorus a stage light). Green only on Accept/Send/"Approved". No gradients except the vignette in the grain layer.

## 4. The cast

The rig is `person(ctx, x, y, s, who, pose)` in `src/human.js` (see docs/LIBRARY.md). The same rig draws both worlds; its colours and line follow `look()`. Proportions are cartoon (head ≈ 1/3.6 of height) so faces read at phone size. Each character has one **signature silhouette feature** that must survive at 60 px tall.

### Dan: the guy, "I", the frontman (vocals)
- Late 20s, lanky, long face, thick expressive brows, rectangular black glasses.
- **Signature:** a rebellious **hair tuft** (cowlick) at the crown, his emotional barometer like the rabbit's ears: combed flat in the office, springing up as he cracks, the whole head of hair spiking wild on stage (`wild 0..1`).
- Office: pale-blue button-down (`oshirt`), navy tie, **lanyard with a white ID badge** ("DAN K."), khaki chinos, brown shoes, smartwatch. Hunched. Blank white glasses glare when he's on a call.
- Stage: the **same clothes, transformed**: tie tied round his forehead as a headband (riso red), shirt untucked with the top buttons open, sleeves rolled, sweat patches, the ID badge swinging wildly on its lanyard (great secondary motion). Arched back, gripping the mic stand.
- Teams name: **Dan Kowalski**.

### Greg: "you", the caller (office only)
- 40s manager, big and upright. **Signature:** an enormous shiny **forehead** (receding hairline, slick side hair) and a too-white veneer smile.
- Navy fleece vest over a white quarter-zip, white AirPods, a giant tumbler, standing desk.
- Always too close to his webcam at a low angle: forehead and nostrils. Gestures: finger guns, thumbs up, the "circle back" hand twirl, leaning in.
- He never goes on stage. In the final chorus his tile is the one still talking while 500 tiles headbang.
- Teams name: **Greg Hollis (He/Him)** · VP, Alignment.

### Linda: guitar
- 50s, HR. Short and round. **Signature:** silver-grey bob plus **reading glasses on a beaded chain**. Lavender cardigan, floral blouse, pearl earrings.
- Office: her camera sees mostly ceiling; her cat walks across her keyboard; she's the one who says "you're on mute".
- Stage: shreds a wedge-shaped flying-V guitar (no brand) with a completely deadpan face, one foot on the monitor wedge. Glasses pushed up into her hair.

### Tasha: bass
- Early 20s, the newest hire. Small. **Signature:** two pink **space-bun** hair buns. Oversized sage-green hoodie, AirPods, phone always in hand, baggy jeans, chunky sneakers.
- Office: camera off (her tile is just "TJ" initials), or clearly in bed.
- Stage: plays a low-slung bass bored-cool, chews gum, blows a bubble that pops on a beat, then suddenly headbangs.

### Bob: drums
- 40s, IT. Very wide. **Signature:** bald head plus a huge **ginger beard**, with a call-centre headset (boom mic). Company polo, cargo shorts.
- Office: his video freezes mid-blink ("Your connection is unstable"); "can you hear me?".
- Stage: pounds the kit with violent joy: sticks blur, sweat sprays, beard flaps, headset still on.

### Sam: Dan's partner (post-chorus bedroom only)
- Curly dark hair, freckles. Seen only from the shoulders up, above the duvet. Reacts deadpan to the laptop ringing.

### Extras
- Seeded generic coworkers for meeting grids, the open-plan office and the final-chorus mosh, all with lanyards. They must be cheap to draw by the hundred.

### The rage scale (`rage 0..1`, Dan mostly; the band too)
| rage | face |
|---|---|
| 0 | office polite: fixed closed-mouth smile, glasses glare, slow blinks, tuft flat |
| .25 | an eye twitch (lid tremor on twos), jaw clenched, the smile strained, tuft springs up |
| .5 | temple vein, brows hard down, nostrils flared, a red halftone flush creeping up from the collar, sweat |
| .75 | teeth bared, neck tendons, the flush covers the face, steam puffs from the ears (office comedy) |
| 1 | the scream: mouth enormous (teeth, tongue, uvula), spit flecks flying, forehead vein pulsing on the beat, tiny pupils, glasses crooked or flying, hair wild |

Rage only shows when it should be *seen*. In the office his body language leaks rage while the face stays polite, and that contrast is the joke.

## 5. Sets (`src/world.js`)

1. **Dan's desk** (open-plan, 8:57 AM): a grey cubicle, dual monitor plus laptop with webcam, headset, a sad plant, sticky notes, a mug ("PER MY LAST EMAIL"), and a **wall clock** above the cubicles (the recurring clock device: 8:57 → 12:01 → 3:30 → 4:59 → 5:01). Fluorescent drop ceiling.
2. **Open-plan wide:** rows of identical cubicles, coworkers' heads, carpet, the window to a grey city.
3. **Greg's corner:** a glass-walled office, standing desk, ring light, motivational poster.
4. **Conference room:** a long table, a big wall screen showing the Teams grid, rolling chairs, a speakerphone starfish in the middle (the final chorus stage).
5. **The stage:** OUT OF OFFICE's club, built out of the office's subconscious. Amp stacks are laser printers and a photocopier with speaker cones; the backdrop is a projector screen; office fluorescent tubes hang as stage lights and strobe; office carpet tiles on the stage; a mic stand with a ring light; a kit whose kick-drum head reads **OUT OF OFFICE**; a crowd of lanyarded coworkers.
6. **Bedroom (night):** bed, duvet, nightstand, candles; the laptop on the nightstand lights up with a call.

## 6. The apps (`src/apps.js`): exact recreations

The lyrics name the apps, so they are recreated faithfully: real layouts, real brand colours and real logos, drawn in code. Text is crisp UI (`'ui'` font), straight edges, `smooth: false`, no boil in the office; on stage the same UIs can be printed riso and torn.

- **Microsoft Teams:** the incoming-call toast (Accept / Decline), a chat message, the meeting window (top bar with the timer, participant count and red **Leave**), the gallery grid with name labels, mic-muted icons and the speaking ring, **live captions**, "You're muted" toasts, the screen-share red border, the "unstable connection" banner, Recap / AI notes.
- **Slack:** the aubergine sidebar, messages, a DM, a huddle, notification badges.
- **Zoom:** the gallery view, "Waiting for host", the link invite.
- **Outlook:** a week calendar with **little blue boxes** (event blocks), the meeting invite card ("Quick sync 🙂 · 15 min · Accept / Tentative / Decline"), email compose with Send.
- **PowerPoint:** a deck slide ("CONTEXT"), presenter view.
- **Phone:** a lock screen with stacked notifications, and an iMessage-style text bubble (the final text).
- **Counters (the escalation device):** the Teams top bar's meeting timer and participant count escalate across the video: `00:15:00` "5 participants" in chorus 1 → `00:47:12` "48" in chorus 2 → `03:12:45` "500+" in the final chorus.

## 7. Typography and lyric modes

| Role | Face |
|---|---|
| Stage lyrics, SFX | **Archivo** 900 condensed slabs (`hero`), stroke + hard extrude; **Permanent Marker** for scrawl; `ransom` for the final chorus |
| Office lyrics | Teams **live captions** (`livecap`: dark bar, "Dan Kowalski" speaker label, words appear as sung), or diegetic UI text (`none`) |
| App UI | **Mona Sans** (stands in for Segoe UI) |
| Code / timers | **JetBrains Mono** |
| Handwriting (sticky notes) | **Shantell Sans** |

Type law: at most 3 sizes and 2 text systems per frame; must-read text ≥ 60 px; one hot word per line (red on stage); words appear one frame early; text should add a joke, not echo the vocal. Diegetic lyrics are the best tier: a lyric typed into a Teams chat beats any overlay.

## 8. Motion, timing and editing

- **Sync law:** a visual hit lands on the frame of the sound or one frame early, never late (`hit()`, `pulse()`, `beatTime()` already lead by one frame).
- **Office cut grid:** one bar (≈1.67 s) per shot, locked camera, cut on the downbeat.
- **Stage cut grid:** half-bars and hits, with 2–6 frame flash inserts on snares. Any shot that must be read holds ≥ 1 s.
- **Choreo moments are framed identically each time** (GIF-able): the band unison jump on "God, this could have been a text" (centre, full body, static camera, plain riso field), and the grid-unmute on each chorus downbeat.
- **Acting:** anticipation → action → overshoot → settle. Characters pose on twos (`twos(t)`), cameras and UI move on ones. Office acting is *underplayed* (micro-twitches); stage acting is *overplayed*.
- **Stop-time drops are sacred.** At 20.7, 92.6–98.4, 137.8–141.8 and 163.9–165.6 the band cuts out. Picture goes still and quiet too (one held image, very little motion), so the slam that follows hits twice as hard.
- **Flash safety:** at most 3 full-frame flashes per second.

## 9. Phone scale

X shows 1920 px at about 390 px wide. Halftone cells are ≥ 12 px on characters and 24–60 px on backgrounds. Must-read text is ≥ 60 px; app UI that must be read is drawn big (a Teams toast at 900 px wide, not 300). Fine texture turns to mush in the re-encode, so keep shapes big and simple. Grain is static.

## 10. Do / don't

- **Do:** real meeting-culture strings ("You're on mute", "Can everyone see my screen?", "Let's circle back", "Sorry, go ahead", "Let's give it two more minutes for people to join", "This meeting is being recorded", "Your connection is unstable"); deadpan office against riso explosions; consistent characters; big simple shapes; one focal point per shot.
- **Don't:** soft gradients, blur, generic stock-photo office clichés with no joke, real people's faces, text that only repeats the vocal, thin 1 px detail, more than 3 flashes per second, or explicit content. The bedroom scene is implied: duvet, candles, the laptop lighting up, a deadpan partner. Nothing explicit.
