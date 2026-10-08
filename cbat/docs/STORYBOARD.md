# Storyboard: This Could Have Been a Text

Ten chapters, one file each in `src/ch/`. Times are song seconds and are locked to the vocal (`LINES`) and the drums (`KICKS`, `SNARES`, `BEATS` in `src/data.js`). `Lnn` is a lyric line index, followed by its key word start times. The shot lists are the plan: keep every **must-hit** and the beats of each joke. Improve the rest in the same spirit, and say what you changed.

The arc: **office (pastel, muted, polite) → cracks → stage (riso, unmuted, rage)**, getting stronger every section until the office itself becomes the stage. Ink, `look()` and clock time for each section are in STYLE_SHEET §2.

**Drums and sync points.** `BEATS` is snapped to the drum attacks. Kicks fall on odd beat indices and snares on even ones, and `kick(t, k)` / `snare(t, k)` decay from the most recent real hit (they stay silent where the drums stop). The bridge (105.9–121.4) is four-on-the-floor. Use `beatTime(i)` for these:

| Beat | Time | Event |
|---|---|---|
| b31 | 13.53 | the full band enters (pre-chorus 1) |
| b48 | 20.63 | chorus 1 stop-time hit |
| b52 | 22.30 | chorus 1 SLAM (the first stage reveal) |
| b148 | 62.07 | chorus 2 downbeat |
| b184 | 76.93 | the post-chorus |
| b216 | 90.12 | mid-solo downbeat |
| b292 / b296 | 121.45 / 122.99 | the bridge build peak / the breakdown bar |
| b332 | 137.71 | the final chorus dropout |
| b344 | 142.62 | the final chorus SLAM |
| b368 | 152.45 | the final tag |
| b396 / b400 | 163.90 / 165.54 | the last dropout / the band back |

**Running devices** (keep them consistent across chapters):
- **The wall clock** reads 8:57 (c01), 12:01 (c03), 3:30 (c06), 4:59 (c07), then 5:00 → 5:01 (c10).
- **The meeting timer and participant count:** `00:00:01` (pre-chorus 1) → `00:15:00`, 5 people (chorus 1) → `00:47:12`, 48 (chorus 2) → `01:58:30`, 112 (verse 3) → `03:12:45`, 500+ (final chorus).
- **Dan's rage peaks** (0..1): verse 1 .1, PC1 .4, chorus 1 1, verse 2 .3, PC2 .6, chorus 2 1, verse 3 .5, bridge .5 → .95, breakdown 1, final 1, outro → 0 (calm, free).
- **Dan's tuft** (`wild`) is the barometer: flat in the office, up when he cracks, and wild on stage.
- **The band in the grid:** Linda is the ceiling plus her cat; Tasha is camera-off "TJ"; Bob is frozen with "Your connection is unstable"; Greg's tile is far too close.
- **Mask slip:** a 2–6 frame cut to stage-Dan screaming the hit word, then straight back, as if nothing happened.
- **The unison jump** on each "God, this could have been a text" (L20, L44) is framed identically: centre frame, full body, static camera, a plain riso field. It must be GIF-able.

---

## Cold open: 1.83 s before song time 0
The song's first 13 s are quiet, so the film opens on the breakdown instead: song 121.71–123.54 (SEND. THE. MESSAGE., Dan screaming on his desk), audio and frames spliced in by `render.mjs --encode` (`COLD`). Its first frame is the thumbnail. Then a hard cut to near-silence and c01's desk, under a comic caption: **8 HOURS EARLIER**.

## c01 verse 1: 0 – 20.68 · office 8:57 AM · look 0 → .4
Music: a quiet verse to 13.2; the full band slams in at **13.58**; pre-chorus 13.6–20.68.
Frame 0 follows the cold open: Dan at his desk, polite, glasses glare, the clock at 8:57, a Teams toast already in, "8 HOURS EARLIER" up top.

| Time | Shot |
|---|---|
| 0 – 2.0 | **Dan's desk, front-on, symmetric.** A Teams chat toast "Greg Hollis: Hey, you got a sec? 🙂" pops at L0 0.60 (diegetic lyric). Dan's polite smile; the glare. |
| 2.0 – 3.7 | Close on Dan's face: "Yeah, that's never just a sec." The polite smile strains. **Mask slip at "sec" 3.14** (2 frames: stage-Dan screaming SEC in red). |
| 3.7 – 5.3 | The Teams chat, big: Greg types "Nothing urgent, just a quick sync 🙂" (L2, words 3.74…4.80); the "Greg is typing…" dots first. |
| 5.3 – 7.2 | The wall clock 8:57 (push in); "There goes half my day, I think": the minute hand ticks on "day" 6.12. |
| 7.2 – 8.7 | **Outlook calendar:** an empty blue afternoon; a **little blue box** drops in and pops on "box" 8.14 (the "block" lands at 7.38). |
| 8.7 – 10.3 | The invite card "Quick sync 🙂 · 15 min": the attendees list grows 2 → 5 → 12 → 27 as "everybody talks" (9.50, 9.72). |
| 10.3 – 11.6 | Dan types into the Teams reply: "can you just type it?" (on "typed" 10.52), stares, deletes it, types "Sure! 🙂" on "clear" 11.12. |
| 11.6 – 13.6 | He puts on the headset (it lands on "ear" 12.96); the "Join now" button; his cursor clicks at 13.30. |
| 13.6 – 20.68 | **Pre-chorus: the call.** Teams meeting window: Greg's tile far too close, Dan's tile small. The band slam at 13.53 cracks the office: from here `look` creeps 0 → .4 and the shot cuts on bars. Greg does finger guns on "hop" 14.22; on "Like that solves everything" (15.18…15.94) a smug Greg thumbs up; the timer starts at 00:00:01. "You said it'll be quick" (quick 17.50): Dan nods, eye twitch, tuft springs up. "That's the funniest thing" (18.72, funniest 19.14): Dan's polite fake laugh while his body shakes with rage. 19.94–20.68: his cursor hovers over the mic button… |

Handoff out: the last frame is the cursor over the **unmute** button with Dan's rage-twitching face.

## c02 chorus 1: 20.68 – 41.15 · STAGE reveal · look 1 · red + pink + yellow
Music: a **stop-time hit at 20.68** ("This could have been a text" sung over near-silence) → **SLAM at 22.33**; loud to 41.

| Time | Shot |
|---|---|
| 20.68 – 22.33 | **Sacred stop.** One held image: the huge Teams mic button flips from muted to **unmuted** at 20.68, then stillness (BOIL 0, no camera move). The lyric L12 is hero-lettered. Dan's face in one-tone riso, inhaling. |
| 22.30 | **SLAM: the first stage reveal.** Wide on OUT OF OFFICE: the band mid-air, the crowd, strobing fluoros, the OUT OF OFFICE kick-drum head. The colour arrives. |
| 22.33 – 23.70 | "Could've hit send, could've done it in a sec": Dan on the mic stand, full rage (1). A SEND key or paper plane on "send" 22.52. |
| 23.70 – 24.54 | "Could've dropped it in Teams": a giant **Teams logo** dropped/stamped on stage at "Teams" 24.26 (riso-printed logo). |
| 24.54 – 25.48 | "Could've slid into Slack": Tasha **knee-slides** across the stage ("slid" 24.68); the **Slack logo** stamp at 24.98. |
| 25.48 – 28.70 | **Split screen** (a Teams tile border down the middle): left = office-Dan staring at his camera on mute, polite; right = stage-Dan screaming the same words, synced. Greg in a third small tile doing the **circle-back** twirl on "circle back" 27.52; the whole frame whip-circles on "back" 27.86. |
| 28.70 – 31.62 | "This could have been an email / Two little lines and we're done for real": an Outlook compose window printed riso, with exactly two lines typed; Dan smashes **Send** on "real" 31.26. |
| 31.62 – 33.76 | "But you needed my face for a question with no depth": Dan's face crammed into a webcam tile, then Greg revealed as a **paper-thin flat cut-out** on "no depth" 33.14–33.34. |
| 33.76 – 35.56 | **THE UNISON JUMP** (GIF moment): all four band members jump on "God" 33.76, hang in the air, and land on "text" 35.06. Centre frame, static camera, a plain riso field. |
| 35.56 – 41.15 | Tag: "Oh, oh, oh…" / "This could have been a text" / "Oh…". The crowd chant: lanyards jumping, fists up. Bob close (sweat spray on snares), Linda's deadpan lick, Tasha's gum bubble pops on a snare. End on a hit at ~40.9. |

## c03 verse 2: 41.15 – 61.85 · office 12:01 PM · look 0 → .6 · mask slips 4 frames
Music: medium verse; pre-chorus 2 from 55.24.
Open with a **hard cut back to beige** (the comedy is the contrast): the same polite Dan, sweat stain, at noon.

| Time | Shot |
|---|---|
| 41.15 – 43.3 | Greg's tile, too close, AirPods: "Just wanted your thoughts on this" (L24, thoughts 42.22). Office captions. |
| 43.3 – 44.9 | "You want a meeting for a sentence?": an invite whose entire body is one sentence, with a 60-minute block (sentence 44.20). |
| 44.9 – 46.56 | "Can we talk through what happened here?": Greg leans in even closer. |
| 46.56 – 48.26 | "Sure, give me thirty minutes to disappear": Dan turns on **background blur** and it eats him; he dissolves into blur on "disappear" 47.42. |
| 48.26 – 49.9 | "Screen share, can you see my screen?": the red "You're presenting" border; Greg shares… the Teams window itself. |
| 49.9 – 51.5 | "Yeah, I've got the same one on my screen": **Droste**: the screen inside the screen inside the screen, zooming in forever (same 50.42). |
| 51.5 – 52.78 | "Then you ask what I would suggest": every tile turns to stare at Dan; his tile gets the speaking ring; silence-face. |
| 52.78 – 55.24 | **Mask slip on "Buddy" 52.78** (4 frames of stage-Dan), back to polite. PowerPoint slide: "CONTEXT", with the answer literally spelled out in the bullets, the presenter's laser pointer circling it on "context" 54.04; "deck" 54.84. |
| 55.24 – 61.85 | **Pre-chorus 2: the bomb.** "You said let's just jump on" (jump 55.72); the meeting invite becomes a **bomb with a countdown timer** and wires in Teams purple / Slack colours. "Like we're defusing a bomb" (bomb 57.58): Dan in a bomb-squad pose with scissors, sweating. "You said just a quick one" (quick 59.02). "And the quick one lasted an hour long" (hour 60.76): the wall clock hands spin 12 → 1; the meeting timer counts up to 00:59:59. `look` rises to .6 and Dan's rage to .6 (vein, flush). |

## c04 chorus 2: 61.85 – 76.80 · STAGE, bigger · look 1 · cyan + blue + yellow
Music: pickup at 61.94, downbeat 62.07 (b148); loud.

| Time | Shot |
|---|---|
| 61.85 – 63.6 | **The grid unmutes** (the chorus downbeat device): a Teams gallery, 48 participants, timer 00:47:12. On 62.07 the band's tiles flip to their stage versions **inside the tiles**: Linda shredding, Tasha on bass, Bob drumming, Dan screaming. Greg's tile stays pastel and still talking. |
| 63.6 – 65.1 | Wide stage, now bigger (more crowd, more lights). "Could've hit send…" |
| 65.1 – 66.86 | "Teams" 65.64 and "Slack" 66.38: the logos drop in as giant stage banners, different from chorus 1 (bigger, swinging). |
| 66.86 – 70.16 | "Now I'm nodding at my laptop while you're talking in abstracts": a **split**: office-Dan nodding on mute ↔ stage-Dan **headbanging**, the same motion on the same beats (nod = headbang). On "abstracts" 69.58 Greg's speech turns into abstract riso art (circles, squiggles, triangles) bursting out of his tile. |
| 70.16 – 72.94 | "This could have been an email / One clean paragraph, nobody has to bail": a single clean paragraph; on "bail" 72.56 Dan **ejects from the meeting** (he leaves through the red Leave button / parachutes out of the window). |
| 72.94 – 75.06 | "But you needed a call for a question with no depth": Dan back on stage, screaming into the camera close up (rage 1 close-up: teeth, spit, the vein pulsing on the snares). |
| 75.06 – 76.80 | **THE UNISON JUMP**, framed exactly as in chorus 1, with chorus-2 inks. |

## c05 post-chorus: 76.80 – 92.30 · calls invade his life · look .6, solo 1 · pink + red
Music: very loud chant ("Oh-oh-oh-oh, another…"); instrumental / **Linda's solo 89.1 – 92.2**.
Each "another" phrase is a new location where a call finds him. The band chants "oh-oh" in quick stage inserts on the snares.

| Time | Shot |
|---|---|
| 76.80 – 79.6 | "another meeting" (meeting 78.38): **the shower.** Dan shoulders-up behind the curtain, shampoo hair; his phone on the sink lights up with a Teams call. He answers with camera off. |
| 79.6 – 82.7 | "another link" (link 81.84): **the gym/run.** Dan on a treadmill; meeting links pile up on his phone and smartwatch (calendar notifications stacking up like Tetris). |
| 82.7 – 86.8 | "another 'you free?'" (you free 85.02): **the bedroom**, implied and for laughs. Candles, rose petals, Dan and Sam under the duvet (heads only); the laptop on the nightstand lights up cold blue: "Greg Hollis: you free? 🙂". Dan reaches over and answers with **camera off**; Sam's deadpan stare. Nothing explicit. |
| 86.8 – 89.1 | "give me a break" (break 88.68): **the beach**, Dan on vacation with an Out-of-Office reply on; Greg calls anyway. On "break" he snaps his laptop shut and **hurls it into the sea**. |
| 89.1 – 92.30 | **Linda's guitar solo.** Full stage: Linda deadpan, one foot on the wedge, glasses chain swinging, fingers blurring; the crowd's phones up. Cut on the snares; end with her final pose and a still. |

## c06 verse 3: 92.30 – 105.90 · office 3:30 PM · look .3 · orange
Music: **stop-time stabs at 92.99, 94.64 and 96.29** (measured on the stems; quiet snare ticks one beat earlier), near silence between; the band is back at **98.74**.
The paperwork avalanche: every stab slams a new artefact of the meeting onto Dan's desk.

| Time | Shot |
|---|---|
| 92.30 – 94.5 | "Then there's the follow-up after the call": a printed follow-up email slams onto the desk at the 92.6 stab; the frame holds still between stabs. |
| 94.5 – 96.0 | "Just recapping": the Teams **Recap** panel (AI sparkle) generates an absurdly long recap (stab 94.2 → the panel; "recapping" 94.66). |
| 96.0 – 97.6 | "the minutes, notes and thread": three documents drop onto the stack on "minutes" 96.62, "notes" 96.84, "thread" 97.34 (a Slack thread, "47 replies"). Stab 95.9. |
| 97.6 – 99.3 | "For something you could've typed from the start instead": the paper tower teeters; at the 98.4 stab Dan's face is buried; "instead" 98.82. |
| 99.3 – 100.94 | Band back at 99.2: "And I'm learning things I never knew": Dan, deadpan, scrolling; the camera starts moving again. |
| 100.94 – 102.78 | "Like apparently 'noted' needs a Zoom": Dan types "noted" in the chat and hits enter ("noted" 101.30); instantly a **Zoom invite "Re: noted"** pops, then the Zoom waiting room (Zoom 102.28). |
| 102.78 – 105.90 | "You sent a deck, I read the deck / Then booked a call to explain the deck": deck recursion (PowerPoint inside Teams inside PowerPoint), slide "AGENDA: Explain the deck"; on the last "deck" 105.58 the slide counter reads "1 / 94". Dan's rage .5: a red flush. |

## c07 bridge: 105.90 – 121.85 · office 4:59 PM · look .3 → .8 · red
Music: a four-on-the-floor kick build to 122.2. "Call me" vignettes, then the three TYPE IT slams, then Greg's forehead with the build.

| Time | Shot |
|---|---|
| 105.90 – 110.8 | **"Call me" vignettes**, Dan generous: framed riso cut-outs in his imagination. "If it needs emotion" (106.26): Dan gives a sincere supportive nod on a call. "If the building's on fire" (fire 108.04): the office building on fire, Dan on the phone, calm thumbs up. "If we're changing half the company" (half 109.60): the org chart torn in half. |
| 110.8 – 112.48 | "Yeah, okay, call me": back at the desk, a grudging shrug. The clock reads 4:59. |
| 112.48 – 114.2 | "But 'hey, can you approve this?'": a Greg call toast slides in (approve 113.34). |
| 114.20 | **TYPE IT slam 1**: a giant keyboard key / Dan's fist slams the desk at 114.20 ("it" 114.40). Hard riso insert. |
| 114.52 – 115.78 | "Can you send that over?": a second toast. |
| 115.78 | **TYPE IT slam 2**, bigger. |
| 116.20 – 117.47 | "Any update on this?": a third toast, the toasts stacking. |
| 117.47 | **TYPE IT slam 3**, biggest: the desk cracks. |
| 117.82 – 121.85 | **"Why am I looking at your forehead?!"** Greg on video far too close. A `foreheadCam` push and pan across a vast shiny forehead landscape as the kick build rises (forehead 119.12, held to 121.80). The look rises toward .8; Dan's rage → .95 in quick inserts; the frame fills with forehead shine. End on the full-frame forehead. |

## c08 breakdown: 121.85 – 137.70 · the office ERUPTS · look 1 · red + yellow, everything
Music: **SEND. THE. MESSAGE.** hits at 121.92 / 122.60 / 123.00 and 123.67 / 124.04 / 124.62; the heavy breakdown from 125.5; a snare build 132 – 137.7.

| Time | Shot |
|---|---|
| 121.92 / 122.60 / 123.00 | **SEND. THE. MESSAGE.** Three slams, three hard cuts: the office is suddenly printed riso (red halftone, boiling lines, the fluorescents strobing). Dan stands on his desk. Hero lettering, one word per hit. |
| 123.67 / 124.04 / 124.62 | The second SEND. THE. MESSAGE.: **the band materialises in the office**: Bob's kit on a desk cluster, Linda on the filing cabinet, Tasha on the printer. |
| 125.34 – 127.36 | "You have a keyboard.": Dan **throws his keyboard** at Greg's webcam (the monitor); the screen cracks on "keyboard" 126.46. |
| 127.36 – 129.14 | "You have my address.": a contact card / envelope hurled ("address" 128.10). |
| 129.14 – 130.24 | "You have Slack.": the Slack logo hurled at the screen (Slack 129.62). |
| 130.24 – 131.08 | "You have Teams.": the Teams logo hurled (Teams 130.56). |
| 131.08 – 133.40 | "You have email.": the Outlook logo hurled (email 131.42). The snare build starts: coworkers stand up one by one above the cubicles, lanyards swinging. |
| 133.40 – 135.30 | **"WHAT ARE WE DOING?"** The whole open plan, everyone standing, screaming at the camera (WHAT 133.40, ARE 134.02, WE 134.30, DOING 134.60). |
| 135.30 – 137.70 | The snare build: the whole office headbangs; the wall clock spins; papers storm; the camera pushes to Dan's scream. Cut to silence at 137.70. |

## c09 final chorus: 137.70 – 152.45 · the office IS the stage · look 1 · every ink, Teams purple as a stage light
Music: the band **drops out 137.8 – 141.8** (sparse, quiet); the **band is back at 142.62 (b344) = SLAM**; loud to the end.

| Time | Shot |
|---|---|
| 137.70 – 142.66 | **Sacred drop.** The conference room, empty except for Dan alone on the table with a mic, quiet, BOIL low. The wall screen shows the meeting: 500+ tiles, all muted, timer 03:12:45. "This could have been a text / Could've hit send / Could've dropped it in Teams / Could've kept the whole thing clean" builds; at "clean" 142.70 the screen… |
| 142.62 | **SLAM**: the conference room IS the stage. The band on the table (Bob's kit at the head of the table, Linda and Tasha on chairs), Teams purple as the stage light, the wall screen of 500 tiles headbanging. |
| 143.28 – 145.6 | "Now I'm trapped inside a meeting / That should've never been": Dan screaming into a ring-light mic; the glass walls shake. |
| 145.6 – 148.52 | "This could have been an email / Nobody needed your voice to tell the tale": the ransom-letter lyric collage; crowd-surfing on rolling chairs. |
| 148.52 – 151.06 | "But you booked a call for a thought with no context": close-ups of the band on the snares, rage 1. |
| 151.06 – 152.45 | **"And everybody's thinking:"**: the whole meeting grid unmutes, all 500 tiles singing (everybody's 151.22). |

## c10 final tag + outro: 152.45 – 179.88 · singalong → calm · look 1 → 0 · paper + ink + red
Music: the final tag is loud singalong 152.52 – 159.4; band instrumental 159.4 – 163.9; a **dropout 163.9 – 165.6** with "This could have been a text"; the band back at 165.58; the **outro over a loud ring-out**: "Hey, got a minute?" 166.97, **"No." 168.60**, "Send me the damn text." 170.06 – 172.42; the ring-out to 178.4; **silence 178.5 – 179.88**.

| Time | Shot |
|---|---|
| 152.45 – 159.40 | **Singalong:** the whole company sings, everyone (coworkers, the 500 tiles, the band). The punchline: Greg's tile alone is still talking, and he's **on mute** (the muted-mic icon, a "You're muted" toast). "THIS COULD HAVE BEEN A TEXT" (157.32): the hero title-scale lettering, the biggest of the film. |
| 159.40 – 163.94 | Instrumental climax: Dan crowd-surfs on a rolling office chair; Bob's cymbals; confetti made of sticky notes. |
| 163.94 – 165.58 | **Dropout**: one still image (Dan breathless, sweat, the badge mid-swing), the line L90 sung over it. |
| 165.58 – 168.6 | The band hits back, then sustains; **look falls to 0**. Back at the desk: a Teams toast, "Greg Hollis: Hey, got a minute? 🙂" (166.97). |
| 168.60 – 170.06 | **"No."** Dan, calm (rage 0, but a real face for the first time, no glare), clicks **Decline**. |
| 170.06 – 172.42 | "Send me the damn text.": he takes off the headset and the lanyard and stands up. The clock reads **5:01**. |
| 172.42 – 178.50 | He leaves; the camera holds on the empty desk; his phone buzzes: an iMessage from Greg: "approved 👍". Dan's first real smile (seen through the glass door or close on the phone). Then the **title card**: "THIS COULD HAVE BEEN A TEXT" with OUT OF OFFICE, printed riso. |
| 178.50 – 179.88 | Silence: on the empty desk a Teams toast slides in: "Greg Hollis: Hey, you got a sec? 🙂" (the loop back to frame 0). |
