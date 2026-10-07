// apps.js: exact recreations of the workplace apps the lyrics name (Teams, Slack, Zoom, Outlook, PowerPoint, iPhone),
// with their real layouts, brand colours and logos, all drawn as vector paths. Every function is a pure function of
// its arguments (time comes in as t) and restores the canvas state it changes.
//
// TWO WORLDS, ONE CALL. Under look(0) the UI is crisp and registered: flat fills, hairline borders, no boil.
// As STYLE.k rises the same call is printed riso: fills boil and slip off register against the ink plate, ink outlines
// appear and thicken, big fills get a halftone screen (k > .5), and each top-level component is wrapped in a depth()
// RGB split of 2.5k px (opt {depth: 0} turns it off, {depth: px} forces it). Colours that differ between the worlds are
// mixed with STYLE.k (real brand colour -> riso ink). Text always stays crisp.
//
// UNITS. Screen/world px. Windows take box = [x, y, w, h] and an optional `zoom` (UI scale); the default zoom is box
// width / the app's reference width (1280 for meeting windows), so a full-frame window reads like a 1280-wide
// screenshot blown up 1.5x. Raise zoom for phone-readable chrome. Cards and toasts take a top-left (x, y) and a width w
// and scale everything from w. Logos take a centre (x, y) and a size (px, the mark's longest side).
// `who` everywhere is a cast key ('dan' | 'greg' | 'linda' | 'tasha' | 'bob' | 'sam'), a number (seeded extra), or a
// display-name string; names, initials and avatar colours follow from it (override with `name`).
//
// LOGOS (centre x, y; size px)
//   teamsLogo(ctx, x, y, size)  slackLogo(...)  zoomLogo(...)  outlookLogo(...)  pptLogo(...)
//
// MICROSOFT TEAMS (new Teams, dark theme)
//   teamsCall(ctx, box, t, o) -> tile boxes [[x, y, w, h], ...] with extra props .stage, .leave (button box)
//     o.title (title-bar text), o.timer (seconds or string, shown HH:MM:SS), o.participants (number | '500+'),
//     o.tiles [teamsTile opts], o.layout 'grid' | 'speaker' | 'share', o.focus (main tile index for speaker/share;
//     default the first speaking tile), o.share (c, box, t) => paints the shared screen (default: a CONTEXT slide),
//     o.presenter (who is sharing; default the focus tile), o.captions (teamsCaption opts, drawn at the stage bottom),
//     o.chat (teamsChat opts: opens the meeting-chat panel on the right), o.leave (song time the Leave button is
//     clicked), o.mic / o.camera (false = off; mic defaults to off: Dan is always on mute), o.recording, o.unread
//     (Chat badge), o.chrome 'full' (title row + bar) | 'bar' | 'none', o.zoom, o.shadow, o.depth
//   teamsTile(ctx, box, t, o) -> box     (inside teamsCall the UI zoom is the call's; standalone default box w / 480)
//     o.who, o.name, o.muted, o.speaking, o.camOff (initials avatar on grey), o.initials, o.frozen (true or the song
//     time the video froze at; desaturated + "connection is unstable"), o.self (frozen text says "Your network is
//     unstable"), o.hand (raised hand: gold ring + hand in the label), o.reactions [{e: '👍', at, x}], o.draw
//     (c, box, t) => paints custom content (label and rings still draw on top; STYLE is restored after it),
//     o.look (k: the tile content prints in look(k) while the chrome keeps the caller's look: the grid "unmutes"),
//     o.pose (object or t => object, merged into the bust pose), o.bg (webcamBg kind or false), o.seed,
//     o.cam {dx, dy, zoom} (bust framing nudges, via human.js bustFit) or 'forehead' (Greg too close and too low:
//     human.js foreheadCam, o.camK 0..1 how bad), o.zoom
//   teamsToast(ctx, x, y, w, t, o) -> [x, y, w, h] | null      (slides in from the right at o.t0, out at o.until)
//     o.kind 'chat' | 'call', o.who, o.name, o.text, o.t0, o.until, o.photo (bust avatar), o.presence (chat avatar
//     badge), o.press ('video' | 'audio' | 'decline', call buttons), o.reply (string | {text, t0, cps} typed into the
//     reply box), o.dark (default true)
//   teamsChat(ctx, box, t, o) -> box
//     o.title, o.messages [{who, name, text, time, at, me, react: [['👍', 2]]}], o.me (who is "me", default 'dan'),
//     o.typing (who | name | [who...]), o.compose (string, or {text, t0, cps} typed into the box), o.dark (default
//     true), o.zoom
//   teamsCaption(ctx, x, y, w, o) -> [x, y, w, h]       live captions bar (the 'livecap' lyric mode)
//     o.speaker (who), o.name, o.words [{s, shown, on, k: 0..1 entry, color}], o.size (caption text px; 40-110 reads),
//     o.lines (rows reserved, default 2; older rows scroll up), o.bottom (y is the bottom edge), o.weight, o.photo, o.t
//   mutedToast(ctx, x, y, t, t0, o)        "You're muted" toast centred on (x, y); o.zoom (default 2), o.life (s)
//   unstableBanner(ctx, box, o)            "Your network is unstable" bar at the top centre of box; o.text, o.zoom
//   screenShareBorder(ctx, box, t, o)      red presenting border + "You're presenting" bar; o.who (someone else is
//                                          presenting), o.zoom, o.t0 (bar slides down)
//   aiRecap(ctx, box, t, o)                Recap tab with AI notes; o.title, o.date, o.sections [{h, items, tasks}],
//                                          o.t0 (items appear one by one), o.speakers [{who, name, share 0..1}], o.zoom
//   teamsAvatar(ctx, cx, cy, r, who, o)    colourful initials disc (o.photo: webcam bust), o.presence 'available' |
//                                          'busy' | 'away' | 'dnd' | 'offline', o.ring (badge ring colour), o.t
// SLACK (desktop, aubergine)
//   slackWindow(ctx, box, t, o) -> box
//     o.workspace ('Alignment Co.'), o.channel ('quick-sync'), o.dm (who: a DM instead of a channel), o.channels
//     [{name, unread, mention}], o.dms [who], o.dmBadge, o.members, o.me, o.messages [{who, name, text, time, at,
//     photo, reactions: [{e, n, me}]}] (consecutive messages from one person group), o.typing (who | [who...]; 3+ =
//     "Several people are typing..."), o.huddle (true | {who: [...], speaking: who, time}), o.compose (string |
//     {text, t0, cps}), o.zoom
//   slackNotif(ctx, x, y, w, t, o) -> [x, y, w, h] | null     Windows toast from Slack; o.who, o.name, o.text,
//                                          o.channel, o.photo, o.t0, o.until
// ZOOM
//   zoomCall(ctx, box, t, o) -> tile boxes
//     o.tiles [{who, name, muted, camOff (name centred, Zoom style), speaking (green frame), frozen, draw, look, pose,
//     cam, bg}], o.timer, o.waiting (true: "Please wait, the meeting host will let you in soon" | 'host': "Waiting for
//     the host"), o.title (meeting topic), o.muted (self: red Unmute), o.video (false: Start Video), o.recording,
//     o.participants, o.leave (red Leave instead of End), o.zoom
// OUTLOOK
//   outlookCalendar(ctx, box, t, o) -> event boxes      the little blue boxes
//     o.days (count, default 5, or [labels]), o.today (column index, default 2 = Wed), o.date (first day of month
//     shown, default 5), o.events [{day, start, end (hours, 9.25 = 9:15), title, at (pops in), where}], o.from/o.to
//     (hours shown, default 8..18), o.now (hours: the current-time line), o.nav (left pane), o.zoom
//   outlookInvite(ctx, x, y, w, t, o) -> {card, accept, tentative, decline}
//     o.title, o.when, o.dur ('15 min'), o.organizer (who), o.attendees [who | {who, status: 'yes' | 'maybe' | 'none'}],
//     o.press ('accept' | 'tentative' | 'decline'), o.pressAt (song time of the click), o.t0 (pops in)
//   emailCompose(ctx, box, t, o) -> send button box
//     o.to [who | name], o.cc, o.subject, o.body (string, \n ok), o.t0, o.cps (typing speed; body typed from t0),
//     o.send (song time Send is pressed), o.zoom
// POWERPOINT
//   pptSlide(ctx, box, t, o) -> slide box
//     o.title ('CONTEXT'), o.bullets [string | {s, at}], o.n, o.total, o.presenter (presenter view), o.view 'edit' |
//     'presenter' | 'show' (the bare slide, fitted 16:9 in box), o.file, o.notes, o.timer, o.clock, o.nextTitle, o.zoom
// PHONE
//   phoneScreen(ctx, x, y, h, t, o) -> screen box     iPhone, (x, y) top-left, h device height
//     o.lock (default true): o.time, o.date, o.notifs [{app: 'teams' | 'slack' | 'outlook' | 'zoom' | 'messages' |
//     'calendar', title, text, at, time}], o.max (full cards before the rest stack)
//     o.lock false: Messages thread, o.contact (who), o.thread [{text, side, at}], o.typing (bool: the dots bubble)
//   textBubble(ctx, x, y, w, o) -> bubble box          iMessage bubble inside the column [x, x + w]
//     o.text, o.side 'in' | 'out', o.t0, o.t (pop-in), o.size (text px, default w / 21), o.sms (green)
// MISC
//   pointer(ctx, x, y, s, o)    Windows mouse pointer, tip at (x, y), s = height px; o.kind 'arrow' | 'hand' | 'text',
//                               o.click 0..1 (press squash + ripple), o.color (ripple)
//   appIcon(ctx, name, cx, cy, size, color, o)   Fluent-style UI icon (names in ICONS below); o.off (slash), o.bg
//                               (slash gap colour), o.w (stroke width in 20-unit grid)
//   appName(who) -> display name
// Every component also takes o.depth (see TWO WORLDS) and windows take o.shadow (false = no drop shadow).
// Look-dev: LOOKS.logos, teams_call, teams_layouts, teams_unmute, teams_toasts, teams_chat, slack, zoom, outlook,
// email_ppt, phone, recap, props, riso_ui, perf (per-component ms printed on the frame).
(() => {
// ---------- printing primitives ----------
let SC = 1, NEST = 0;                                         // SC = screen px per drawing unit of the current component
const scaleOf = ctx => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; };
const K = (office, stage) => mix(office, stage, STYLE.k);    // a colour that differs between the two worlds
const REG = [2.6, 1.8];                                       // riso colour-plate slip (screen px at k = 1)
const P2D = new Map(), p2d = d => { let p = P2D.get(d); if (!p) P2D.set(d, p = new Path2D(d)); return p; };
function local(ctx, x, y, z) { ctx.save(); ctx.translate(x, y); ctx.scale(z, z); const prev = SC; SC = scaleOf(ctx); return prev; }
function unlocal(ctx, prev) { ctx.restore(); SC = prev; }
// Every public component runs through printed(): sets SC and, under the stage look, wraps itself in depth().
function printed(ctx, o, fn) {
  const px = NEST ? 0 : o && o.depth != null ? o.depth : STYLE.k > .5 ? 2.5 * STYLE.k : 0, prev = SC;
  NEST++;
  try {
    if (!px) { SC = scaleOf(ctx); return fn(ctx); }
    let r; depth(ctx, px, c => { SC = scaleOf(c); r = fn(c); }, { keep: true, angle: .6 }); return r;
  } finally { NEST--; SC = prev; }
}

// Rounded rect points, r = radius or [tl, tr, br, bl]; corners get enough points to stay round at any zoom.
function rr(x, y, w, h, r = 0) {
  const lim = Math.max(0, Math.min(w, h) / 2), R = (typeof r === 'number' ? [r, r, r, r] : r).map(q => clamp(q, 0, lim)), p = [];
  const c = (cx, cy, q, a0) => { if (!q) { p.push([cx, cy]); return; } const n = clamp(Math.ceil(q * SC / 3), 2, 32); for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } };
  c(x + w - R[1], y + R[1], R[1], -Math.PI / 2); c(x + w - R[2], y + h - R[2], R[2], 0); c(x + R[3], y + h - R[3], R[3], Math.PI / 2); c(x + R[0], y + R[0], R[0], Math.PI);
  return p;
}
const oval = (cx, cy, rx, ry = rx) => ell(cx, cy, rx, ry, clamp(Math.ceil(Math.max(rx, ry) * SC * .8), 12, 120));
// Polygon with its corners rounded (quadratic) by r.
function roundPoly(pts, r) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], da = dist(p, a), db = dist(p, b), q = Math.min(r, da / 2, db / 2);
    const p0 = [p[0] + (a[0] - p[0]) / da * q, p[1] + (a[1] - p[1]) / da * q], p1 = [p[0] + (b[0] - p[0]) / db * q, p[1] + (b[1] - p[1]) / db * q], m = clamp(Math.ceil(q * SC / 2), 2, 12);
    for (let j = 0; j <= m; j++) { const u = j / m, v = 1 - u; out.push([v * v * p0[0] + 2 * v * u * p[0] + u * u * p1[0], v * v * p0[1] + 2 * v * u * p[1] + u * u * p1[1]]); }
  }
  return out;
}
// A flat UI fill. Office: crisp and registered. Stage: boiled, the colour plate slipped off register, an ink outline
// (o.line screen px, 0 = none) and, past k = .5, a halftone screen of o.dots ramping from the middle of the shape down
// to o.max coverage at the bottom edge.
function face(ctx, pts, fill, o = {}) {
  const k = STYLE.k;
  if (k < .01) { fillPts(ctx, pts, fill, false); return pts; }
  const u = 1 / SC, P = o.boil === 0 ? pts : boil(pts, (o.boil ?? 1) * u, o.seed || 0), d = (o.reg ?? 1) * k * u;
  const Q = d ? P.map(([a, b]) => [a + REG[0] * d, b + REG[1] * d]) : P;
  fillPts(ctx, Q, fill, false);
  if (o.dots && k > .5) { const b = bbox(Q), hh = (b[3] - b[1]) / 2; shade(ctx, Q, { color: o.dots, spacing: (o.sp || 14) * u, dir: [0, 1], from: 0, to: hh, min: 0, max: (o.max ?? .5) * (k - .5) * 2, smooth: false }); }
  if (o.line !== 0) outline(ctx, P, (o.line ?? 2.5) * k * u, o.lineColor || INK.ink, { smooth: false, heavy: .5, step: 6 * u, seed: o.seed || 0 });
  return P;
}
// Office hairline border (fades out as the stage look takes over; face() outlines replace it).
function edge(ctx, pts, color, w = 1) {
  const a = 1 - STYLE.k * 2; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); tracePath(ctx, pts, true, false); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(); ctx.restore();
}
function rule(ctx, x0, y0, x1, y1, color, w = 1) {
  if (STYLE.k < .5) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(); return; }
  inkLine(ctx, [[x0, y0], [x1, y1]], Math.max(w, 2.2 / SC), color, { taper: [0, 0], smooth: false, step: 8 / SC });
}
// Window/card shadow: a flat two-step drop in the office, a hard boiled ink block on stage.
function drop(ctx, pts, o = {}) {
  const k = STYLE.k, g = ctx.globalAlpha;
  if (k < .5) { for (const [d, a] of [[2, .16], [7, .09]]) { ctx.globalAlpha = g * a * (1 - k * 2) * (o.a ?? 1); fillPts(ctx, pts.map(([x, y]) => [x, y + d / SC]), '#000000', false); } ctx.globalAlpha = g; return; }
  const d = (o.d ?? 10) * k / SC; fillPts(ctx, boil(pts, 1 / SC, 5).map(([x, y]) => [x + d, y + d]), INK.ink, false);
}
// Ring stroke (speaking ring, raised hand, borders): a crisp stroke in the office, a boiling coloured ink line on stage.
function ring(ctx, pts, color, w) {
  if (STYLE.k < .01) { ctx.beginPath(); tracePath(ctx, pts, true, false); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(); return; }
  outline(ctx, boil(pts, 1.2 / SC, 7), w + 4 * STYLE.k / SC, color, { smooth: false, heavy: .4, step: 6 / SC });
}
function inkFrame(ctx, pts, w = 3) { if (STYLE.k > .01) outline(ctx, boil(pts, 1 / SC, 2), w * STYLE.k / SC, INK.ink, { smooth: false, heavy: .5, step: 6 / SC }); }

// ---------- UI text ----------
// tx draws Mona Sans (the Segoe UI stand-in) vertically centred on y.
function tx(ctx, s, x, y, size, color, weight = 400, o) { txt(ctx, s, x, y, o ? { font: 'ui', size, weight, color, base: 'middle', ...o } : { font: 'ui', size, weight, color, base: 'middle' }); }
function tw(ctx, s, size, weight = 400) { setFont(ctx, { font: 'ui', size, weight }); return ctx.measureText(s).width; }
function fit(ctx, s, size, weight, maxW) {
  s = String(s); if (tw(ctx, s, size, weight) <= maxW) return s;
  let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (tw(ctx, s.slice(0, m) + '\u2026', size, weight) <= maxW) lo = m; else hi = m - 1; }
  return s.slice(0, lo).trimEnd() + '\u2026';
}
function wrap(ctx, s, size, weight, maxW, maxLines = 99) {
  const out = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) { const tryL = line ? line + ' ' + word : word; if (line && tw(ctx, tryL, size, weight) > maxW) { out.push(line); line = word; } else line = tryL; }
    out.push(line);
  }
  if (out.length > maxLines) { out.length = maxLines; out[maxLines - 1] = fit(ctx, out[maxLines - 1] + ' \u2026\u2026', size, weight, maxW); }
  return out;
}
const pad2 = n => String(n).padStart(2, '0');
const fmtTimer = v => typeof v === 'number' ? `${pad2(Math.floor(v / 3600))}:${pad2(Math.floor(v / 60) % 60)}:${pad2(Math.floor(v) % 60)}` : String(v);
const fmtH = h => { const H = Math.floor(h), m = Math.round((h - H) * 60); return `${(H + 11) % 12 + 1}:${pad2(m)} ${H < 12 ? 'AM' : 'PM'}`; };
const typedOf = (c, t) => c == null ? '' : typeof c === 'string' ? c : typed(c.text, t, c.t0 ?? 0, c.cps ?? 14, false);
const caretOn = t => Math.floor(t * 2.2) % 2 === 0;

// ---------- icons (Fluent-style, 20-unit grid) ----------
const ICONS = {
  chat: c => c.stroke(p2d('M10 2.5a7.5 7.5 0 1 1-3.6 14.1L2.6 17.5l.9-3.6A7.5 7.5 0 0 1 10 2.5Z')),
  people: c => c.stroke(p2d('M10.5 6.5a3 3 0 1 1-6 0a3 3 0 1 1 6 0M2 16.5V16a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v.5M16.5 7a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0M14.5 12.5h.5a3 3 0 0 1 3 3v1')),
  raise: c => c.stroke(p2d('M6 11V5.2a1.2 1.2 0 0 1 2.4 0V9.5V3.7a1.2 1.2 0 0 1 2.4 0v5.8V4.7a1.2 1.2 0 0 1 2.4 0V10V7.2a1.2 1.2 0 0 1 2.4 0V12a6 6 0 0 1-6 6h-.4a5 5 0 0 1-4-2l-2.6-3.6a1.3 1.3 0 0 1 2-1.6L6 12.6')),
  react: c => { c.stroke(p2d('M17.5 10a7.5 7.5 0 1 1-15 0a7.5 7.5 0 1 1 15 0M7.2 12.2a3.5 3.5 0 0 0 5.6 0')); c.fill(p2d('M8.6 8a1 1 0 1 1-2 0a1 1 0 1 1 2 0M13.4 8a1 1 0 1 1-2 0a1 1 0 1 1 2 0')); },
  view: c => { c.beginPath(); for (const [a, b] of [[3, 3], [11, 3], [3, 11], [11, 11]]) c.roundRect(a, b, 6, 6, 1.5); c.stroke(); },
  more: c => { c.beginPath(); for (const a of [4.5, 10, 15.5]) { c.moveTo(a + 1.4, 10); c.arc(a, 10, 1.4, 0, TAU); } c.fill(); },
  camera: c => c.stroke(p2d('M4.5 5.5h6A2.5 2.5 0 0 1 13 8v4a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 12V8a2.5 2.5 0 0 1 2.5-2.5ZM13 8.6l3.6-2.3a.6.6 0 0 1 .9.5v6.4a.6.6 0 0 1-.9.5L13 11.4')),
  mic: c => c.stroke(p2d('M10 2.5a2.75 2.75 0 0 1 2.75 2.75v4.5a2.75 2.75 0 0 1-5.5 0v-4.5A2.75 2.75 0 0 1 10 2.5ZM4.75 9.5a5.25 5.25 0 0 0 10.5 0M10 14.75V17.5')),
  share: c => c.stroke(p2d('M4.5 4h11A2.5 2.5 0 0 1 18 6.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 13.5v-7A2.5 2.5 0 0 1 4.5 4ZM10 13V7.5M7.6 9.8 10 7.4l2.4 2.4')),
  hangup: c => c.fill(p2d('M2.6 11.4c4.1-4.2 10.7-4.2 14.8 0 .5.5.5 1.3 0 1.8l-1.2 1.2c-.4.4-1.1.5-1.6.1l-1.5-1.1c-.4-.3-.6-.8-.5-1.3l.2-1c-1.8-.6-3.8-.6-5.6 0l.2 1c.1.5-.1 1-.5 1.3l-1.5 1.1c-.5.4-1.2.3-1.6-.1l-1.2-1.2c-.5-.5-.5-1.3 0-1.8Z')),
  phone: c => c.fill(p2d('M6.5 2.6c.6-.2 1.2.1 1.5.6l1.3 2.6c.3.5.1 1.1-.3 1.5L7.9 8.4c.7 1.6 2 2.9 3.7 3.7l1.1-1.1c.4-.4 1-.6 1.5-.3l2.6 1.3c.5.3.8.9.6 1.5l-.5 1.6c-.3.9-1.2 1.4-2.1 1.3C8.9 15.8 4.2 11.1 3.6 5.2c-.1-.9.4-1.8 1.3-2.1Z')),
  video: c => c.fill(p2d('M4.5 5h6A2.5 2.5 0 0 1 13 7.5v5a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 12.5v-5A2.5 2.5 0 0 1 4.5 5ZM14 8.3l3-2a.7.7 0 0 1 1.1.6v6.2a.7.7 0 0 1-1.1.6l-3-2Z')),
  chevron: c => c.stroke(p2d('M5.5 8l4.5 4.5L14.5 8')),
  chevronUp: c => c.stroke(p2d('M5.5 12.5 10 8l4.5 4.5')),
  back: c => c.stroke(p2d('M12.5 3.5 6 10l6.5 6.5')),
  close: c => c.stroke(p2d('M5 5l10 10M15 5 5 15')),
  send: c => c.stroke(p2d('M3 3.2 17.3 10 3 16.8l2-6.8-2-6.8ZM5 10h6')),
  search: c => c.stroke(p2d('M13.5 8.5a5 5 0 1 1-10 0a5 5 0 1 1 10 0M12.2 12.2 17 17')),
  headphones: c => c.stroke(p2d('M3.5 13v-2.5a6.5 6.5 0 0 1 13 0V13M3.5 12.5H5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-.5a1 1 0 0 1-1-1v-4ZM16.5 12.5H15a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1v-4Z')),
  hash: c => c.stroke(p2d('M8 3 6.5 17M13.5 3 12 17M4 7.5h13M3.5 12.5h13')),
  bell: c => c.stroke(p2d('M10 2.5a5 5 0 0 1 5 5V11l1.5 3h-13L5 11V7.5a5 5 0 0 1 5-5ZM8 16.5a2 2 0 0 0 4 0')),
  gear: c => { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.moveTo(10 + Math.cos(a) * 5.6, 10 + Math.sin(a) * 5.6); c.lineTo(10 + Math.cos(a) * 7.6, 10 + Math.sin(a) * 7.6); } c.moveTo(15.6, 10); c.arc(10, 10, 5.6, 0, TAU); c.moveTo(12.3, 10); c.arc(10, 10, 2.3, 0, TAU); c.stroke(); },
  calendar: c => c.stroke(p2d('M5 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM3 8h14M7 2.5v3M13 2.5v3')),
  mail: c => c.stroke(p2d('M4.5 4.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM3 6l7 5 7-5')),
  record: c => { c.stroke(p2d('M17.5 10a7.5 7.5 0 1 1-15 0a7.5 7.5 0 1 1 15 0')); c.fill(p2d('M14 10a4 4 0 1 1-8 0a4 4 0 1 1 8 0')); },
  sparkle: c => c.fill(p2d('M10 1.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5ZM15.5 12.5c.3 2 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1 3-3Z')),
  waffle: c => { c.beginPath(); for (let i = 0; i < 9; i++) { const a = 4 + (i % 3) * 6, b = 4 + Math.floor(i / 3) * 6; c.moveTo(a + 1.5, b); c.arc(a, b, 1.5, 0, TAU); } c.fill(); },
  plus: c => c.stroke(p2d('M10 4v12M4 10h12')),
  check: c => c.stroke(p2d('M4 10.5l4 4 8-9')),
  lock: c => { c.stroke(p2d('M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9')); c.beginPath(); c.roundRect(4, 9, 12, 9, 2); c.fill(); },
  wifi: c => { c.stroke(p2d('M2.5 8a11 11 0 0 1 15 0M5 11a7.3 7.3 0 0 1 10 0M7.5 14a3.5 3.5 0 0 1 5 0')); c.fill(p2d('M11.2 16.5a1.2 1.2 0 1 1-2.4 0a1.2 1.2 0 1 1 2.4 0')); },
  warn: c => c.fill(p2d('M10 2.2c.4 0 .8.2 1 .6l7.4 13.1c.4.8-.1 1.7-1 1.7H2.6c-.9 0-1.4-.9-1-1.7L9 2.8c.2-.4.6-.6 1-.6ZM9.2 7.2h1.6v5.6H9.2ZM11 14.8a1 1 0 1 1-2 0a1 1 0 1 1 2 0'), 'evenodd'),
  shield: c => c.fill(p2d('M10 2l6.5 2.5v5c0 4-2.8 7.2-6.5 8.5-3.7-1.3-6.5-4.5-6.5-8.5v-5Z')),
  arrowUp: c => c.stroke(p2d('M10 15.5V4.5M5.5 9 10 4.5 14.5 9')),
  info: c => { c.stroke(p2d('M17.5 10a7.5 7.5 0 1 1-15 0a7.5 7.5 0 1 1 15 0M10 9v5')); c.fill(p2d('M11 6.3a1 1 0 1 1-2 0a1 1 0 1 1 2 0')); },
  pencil: c => c.stroke(p2d('M13.5 3.5l3 3L7 16H4v-3Z')),
  home: c => c.stroke(p2d('M3.5 9 10 3.5 16.5 9v7.5H12v-5H8v5H3.5Z')),
  dms: c => c.stroke(p2d('M3 4.5h10A1.5 1.5 0 0 1 14.5 6v5a1.5 1.5 0 0 1-1.5 1.5H8L5 15v-2.5H3A1.5 1.5 0 0 1 1.5 11V6A1.5 1.5 0 0 1 3 4.5ZM16.5 7.5h.5A1.5 1.5 0 0 1 18.5 9v5a1.5 1.5 0 0 1-1.5 1.5h-1V18l-3-2.5h-4')),
  clock: c => c.stroke(p2d('M17.5 10a7.5 7.5 0 1 1-15 0a7.5 7.5 0 1 1 15 0M10 5.5V10l3 2')),
  flash: c => c.stroke(p2d('M7 2.5h6v3l-1.5 2.5v9.5h-3V8L7 5.5Z')),
  photo: c => c.stroke(p2d('M3 7h3l1.5-2h5L14 7h3v9H3ZM12.8 11.3a2.8 2.8 0 1 1-5.6 0a2.8 2.8 0 1 1 5.6 0')),
  play: c => c.fill(p2d('M6 4l10 6-10 6Z')),
  pause: c => c.fill(p2d('M5.5 4h3v12h-3ZM11.5 4h3v12h-3Z')),
  smileAdd: c => { c.stroke(p2d('M16.8 9.5a7 7 0 1 1-6.3-6.5M7.4 12.2a3.3 3.3 0 0 0 5.2 0M15 2.5v5M12.5 5h5')); c.fill(p2d('M8.6 8.3a1 1 0 1 1-2 0a1 1 0 1 1 2 0M13.2 8.3a1 1 0 1 1-2 0a1 1 0 1 1 2 0')); },
  bold: c => c.stroke(p2d('M6 4h5a3 3 0 0 1 0 6H6ZM6 10h6a3 3 0 0 1 0 6H6Z')),
  list: c => c.stroke(p2d('M8 5.5h9M8 10h9M8 14.5h9')),
  at: c => c.stroke(p2d('M13 10a3 3 0 1 1-6 0a3 3 0 1 1 6 0v1.3a2 2 0 0 0 4 0V10a7 7 0 1 0-2.8 5.6')),
};
function icon(ctx, name, cx, cy, size, color, o = {}) {
  const f = ICONS[name]; if (!f) return;
  const k = STYLE.k, j = k > .01 ? k * BOIL * .7 / SC : 0, n = boilN(BOIL_T) + cx * .13 + cy * .07;
  ctx.save(); ctx.translate(cx + noise1(n) * j, cy + noise1(n + 9) * j); ctx.scale(size / 20, size / 20); ctx.translate(-10, -10);
  ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = (o.w || 1.5) * (1 + k * .45); ctx.lineCap = ctx.lineJoin = 'round';
  f(ctx);
  if (o.off) { ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(17, 17); if (o.bg) { ctx.strokeStyle = o.bg; ctx.lineWidth *= 3; ctx.stroke(); ctx.lineWidth /= 3; ctx.strokeStyle = color; } ctx.stroke(); }
  ctx.restore();
}
// Windows 11 caption buttons (minimise, maximise, close) at the right end of a title row.
function winCtl(ctx, right, top, h, color) {
  const y = top + h / 2; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1 + STYLE.k * 1.2; ctx.beginPath();
  let x = right - 23; ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);
  x -= 46; ctx.rect(x - 5, y - 5, 10, 10); x -= 46; ctx.moveTo(x - 5, y + .5); ctx.lineTo(x + 5, y + .5);
  ctx.stroke(); ctx.restore();
}

// ---------- logos (vector, from the real marks) ----------
const logoLine = size => ({ line: clamp(size * .022, 1.2, 7) });
// Microsoft Teams: the indigo T plate in front of two people (geometry of the official 2229 x 2073 mark).
function teamsLogo(ctx, x, y, size = 64) {
  const s = size / 2229, prev = local(ctx, x - 1114.4 * s, y - 1036.7 * s, s), L = logoLine(size);
  face(ctx, rr(1503, 777.5, 726, 985, [51, 98, 363, 363]), '#5059C9', L); face(ctx, oval(1943.75, 440.6, 233.25), '#5059C9', L);
  const body = rr(622, 777.5, 1141, 1296, [96, 96, 570, 570]);
  face(ctx, body, '#7B83EB', L); face(ctx, oval(1218.1, 336.9, 336.9), '#7B83EB', L);
  ctx.save(); clipPts(ctx, body, false); ctx.globalAlpha *= .1; fillPts(ctx, rr(560, 700, 684, 1010, 95), '#000000', false); fillPts(ctx, rr(560, 700, 631, 958, 95), '#000000', false); ctx.restore();
  face(ctx, rr(0, 466.5, 1140.3, 1141, 95), '#4B53BC', L);
  fillPts(ctx, [[320.1, 727.8], [820.2, 727.8], [820.2, 828.2], [630.2, 828.2], [630.2, 1345.5], [509.2, 1345.5], [509.2, 828.2], [320.1, 828.2]], K('#FFFFFF', INK.white), false);
  unlocal(ctx, prev);
}
// Slack: the four-colour hash, each colour a pill plus a drop with one square corner (official 127-unit mark).
const SLACK = [[14, 80, [13.2, 0, 13.2, 13.2], 33.8, 66.8, 26.4, 59.4, 'slackRed'], [47, 13.8, [13.2, 13.2, 0, 13.2], .7, 33.7, 59.5, 26.4, 'slackBlue'],
  [113.1, 46.9, [13.2, 13.2, 13.2, 0], 66.9, .6, 26.4, 59.5, 'slackGreen'], [80.1, 113, [0, 13.2, 13.2, 13.2], 66.9, 66.8, 59.5, 26.4, 'slackYellow']];
function slackLogo(ctx, x, y, size = 64) {
  const s = size / 125.8, prev = local(ctx, x - 63.5 * s, y - 63.4 * s, s), L = logoLine(size);
  for (const [cx, cy, r, px, py, pw, ph, c] of SLACK) { face(ctx, rr(cx - 13.2, cy - 13.2, 26.4, 26.4, r), INK[c], L); face(ctx, rr(px, py, pw, ph, 13.2), INK[c], L); }
  unlocal(ctx, prev);
}
// Zoom (2022 mark): blue rounded square, white video camera.
function zoomLogo(ctx, x, y, size = 64) {
  const s = size / 100, prev = local(ctx, x - 50 * s, y - 50 * s, s), wh = K('#FFFFFF', INK.white);
  face(ctx, rr(0, 0, 100, 100, 23), INK.zoom, logoLine(size));
  face(ctx, rr(17, 32, 46, 36, 9), wh, { line: 0, reg: 0 });
  face(ctx, roundPoly([[66.5, 45], [82, 35.5], [82, 64.5], [66.5, 55]], 4), wh, { line: 0, reg: 0 });
  unlocal(ctx, prev);
}
// Outlook (2019 mark): the white O plate in front of a tiled sheet tucked into an open envelope.
function outlookLogo(ctx, x, y, size = 64) {
  const s = size / 1831, prev = local(ctx, x - 915.5 * s, y - 925 * s, s), L = logoLine(size);
  face(ctx, rr(487, 857, 1344, 846, 100), '#0A2767', L);
  const tile = [['#0364B8', '#0364B8', '#0364B8'], ['#0078D4', '#28A8EA', '#28A8EA'], ['#0364B8', '#0078D4', '#50D9FF']], cx = [487, 810, 1175, 1561], ry = [147, 384, 743, 1097];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) face(ctx, rr(cx[c], ry[r], cx[c + 1] - cx[c] + 1, ry[r + 1] - ry[r] + 1, r === 0 ? [c === 0 ? 75 : 0, c === 2 ? 75 : 0, 0, 0] : 0), tile[r][c], { line: 0, reg: .5 });
  face(ctx, [[487, 857], [1159, 1265], [1831, 857], ...rr(487, 857, 1344, 846, [0, 0, 100, 100]).slice(1, -1)], '#28A8EA', L);
  face(ctx, [[1159, 1265], ...rr(487, 1260, 1344, 443, [0, 0, 100, 100]).slice(1, -1)], '#1490DF', { line: 0, reg: .5 });
  face(ctx, rr(0, 334.7, 1140, 1140, 95), '#0F6CBD', L);
  ctx.save(); ctx.beginPath(); ctx.ellipse(570, 905, 280, 335, 0, 0, TAU); ctx.ellipse(570, 905, 140, 192, 0, 0, TAU); ctx.fillStyle = K('#FFFFFF', INK.white); ctx.fill('evenodd'); ctx.restore();
  unlocal(ctx, prev);
}
// PowerPoint (2019 mark): orange pie behind the P plate.
function pptLogo(ctx, x, y, size = 64) {
  const s = size / 1920, prev = local(ctx, x - 960 * s, y - 897 * s, s), L = logoLine(size), wedge = (a0, a1) => { const p = [[1025, 897]]; for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40); p.push([1025 + Math.cos(a) * 895, 897 + Math.sin(a) * 895]); } return p; };
  face(ctx, wedge(0, Math.PI), '#D35230', L); face(ctx, wedge(Math.PI, Math.PI * 1.5), '#ED6C47', L); face(ctx, wedge(-Math.PI / 2, 0), '#FF8F6B', L);
  face(ctx, rr(0, 409.5, 1130.8, 1130.8, 91), '#C43E1C', L);
  ctx.save(); ctx.fillStyle = K('#FFFFFF', INK.white); ctx.fill(p2d('M319 662H560A240 205.5 0 0 1 560 1073H437V1300H319ZM437 761H555A103 103 0 0 1 555 967H437Z'), 'evenodd'); ctx.restore();
  unlocal(ctx, prev);
}

// ---------- people: names, avatars, webcam busts ----------
const NAMES = { dan: 'Dan Kowalski', greg: 'Greg Hollis (He/Him)', linda: 'Linda Marsh', tasha: 'Tasha Jordan', bob: 'Bob Brennan', sam: 'Sam Rivera' };
const EXTRAS = ['Priya Shah', 'Marcus Webb', 'Jen Alvarez', 'Tom Becker', 'Aisha Khan', 'Chris Novak', 'Mei Lin', 'Raj Patel', 'Olivia Grant', 'Sven Larsen',
  'Fatima Noor', 'Kevin Doyle', 'Hannah Weiss', 'Luis Ortega', 'Grace Kim', 'Omar Haddad', 'Nina Petrova', 'Ben Carter', 'Zoe Martin', 'Ade Bello'];
const strHash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 100003; return h; };
const seedOf = who => typeof who === 'number' ? who : strHash(who && who.name || who);
function nameOf(who) {
  if (who && typeof who === 'object') return who.name || 'Guest';
  if (typeof who === 'number') return EXTRAS[Math.floor(hash(who * 7.31 + 2) * EXTRAS.length)];
  return NAMES[who] || (who == null ? 'Guest' : String(who));
}
const initialsOf = name => { const w = String(name).replace(/\(.*?\)/g, '').trim().split(/\s+/); return ((w[0] || '?')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
const firstOf = name => String(name).split(' ')[0];
// Fluent "colourful" avatar pairs [background, initials] and their riso stand-ins.
const AVC = [['#E9C7CD', '#750B1C'], ['#FDCFB4', '#8A3707'], ['#F9E2AE', '#6D5700'], ['#BDD99B', '#294903'], ['#A6E9ED', '#00555A'],
  ['#9ABFDC', '#0A2E4A'], ['#D2CCF8', '#3F3682'], ['#D9A7E0', '#4C0D55'], ['#F7C0E3', '#80224F']];
const AVR = [INK.pinkLt, INK.orangeLt, INK.yellow, INK.greenLt, INK.cyan, INK.cyan, INK.teamsLt, INK.pinkLt, INK.pinkLt];
const AVWHO = { dan: 4, greg: 5, linda: 6, tasha: 8, bob: 1, sam: 3 };
const avIndex = (who, name) => typeof who === 'string' && who in AVWHO ? AVWHO[who] : strHash(name) % AVC.length;
const rigWho = who => typeof who === 'number' || (who && typeof who === 'object') || NAMES[who] ? who : seedOf(who);
const BGS = { dan: 'plain', greg: 'bookshelf', linda: 'ceiling', tasha: 'bed', bob: 'kitchen', sam: 'bed' };

function teamsAvatar(ctx, cx, cy, r, who, o = {}) { return printed(ctx, o, c => avatar_(c, cx, cy, r, who, o)); }
function avatar_(ctx, cx, cy, r, who, o = {}) {
  const name = o.name || nameOf(who), i = avIndex(who, name), disc = oval(cx, cy, r);
  if (o.photo) { face(ctx, disc, K(AVC[i][0], AVR[i]), { line: 0 }); ctx.save(); clipPts(ctx, disc, false); webcam(ctx, [cx - r, cy - r, 2 * r, 2 * r], o.t ?? 0, who, { framing: 'avatar', ...o.cam }); ctx.restore(); inkFrame(ctx, disc, 2); }
  else { face(ctx, disc, K(AVC[i][0], AVR[i]), { line: 2 }); tx(ctx, o.initials || initialsOf(name), cx, cy + r * .03, r * .78, K(AVC[i][1], INK.ink), 600, { align: 'center' }); }
  if (o.presence) presence(ctx, cx + r * .7, cy + r * .7, Math.max(r * .28, 4), o.presence, o.ring || K('#292929', INK.ink));
}
function presence(ctx, cx, cy, r, kind, ringCol) {
  const col = { available: K('#6BB700', INK.green), busy: K('#C4314B', INK.red), dnd: K('#C4314B', INK.red), away: K('#FFAA44', INK.yellow), offline: K('#8A8886', INK.ogrey) }[kind] || K('#6BB700', INK.green), wh = K('#FFFFFF', INK.white);
  fillPts(ctx, oval(cx, cy, r * 1.25), ringCol, false); fillPts(ctx, oval(cx, cy, r), col, false);
  ctx.save(); ctx.strokeStyle = wh; ctx.lineWidth = r * .32; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath();
  if (kind === 'available') { ctx.moveTo(cx - r * .45, cy); ctx.lineTo(cx - r * .1, cy + r * .35); ctx.lineTo(cx + r * .45, cy - r * .3); }
  else if (kind === 'dnd') { ctx.moveTo(cx - r * .45, cy); ctx.lineTo(cx + r * .45, cy); }
  else if (kind === 'away') { ctx.moveTo(cx, cy - r * .5); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * .35, cy + r * .25); }
  ctx.stroke(); ctx.restore();
}
// Idle webcam acting on twos: slow blinks, a little sway, talking mouth when speaking.
function idle(t, seed, speaking) {
  const tc = twos(t), ph = hash(seed) * 9, bl = frac((t + ph) / (3.1 + hash(seed + 1) * 2.4));
  const p = { tilt: noise1(tc * .35 + ph) * 3, nod: noise1(tc * .5 + ph + 4) * .06, lids: bl < .035 ? 1 : 0, lx: noise1(tc * .2 + ph) * .3 };
  if (speaking) { p.mouth = 'talk'; p.open = clamp(.2 + .6 * Math.abs(noise1(tc * 6 + ph))); }
  return p;
}
// A webcam frame of `who` filling box: home-office background (world.js webcamBg) + head-and-shoulders bust (human.js).
// framing 'avatar' crops tighter for profile pictures. o.cam / o: {dx, dy, zoom} nudge the framing; o.pose overrides.
function webcam(ctx, box, t, who, o = {}) {
  const [x, y, w, h] = box, seed = o.seed ?? seedOf(who), av = o.framing === 'avatar';
  if (o.bg !== false && !av) { const kind = o.bg || BGS[who] || ['bookshelf', 'kitchen', 'plain', 'blur'][seed % 4]; if (typeof webcamBg === 'function') webcamBg(ctx, box, kind, seed); else fakeBg(ctx, box, kind, seed); }
  const cam = o.cam === 'forehead' ? {} : o.cam || {}, pose = { view: 'bust', t, ...idle(t, seed, o.speaking), ...(typeof o.pose === 'function' ? o.pose(t) : o.pose) };
  if (typeof person !== 'function') { const s = h * (av ? .21 : .135) * (cam.zoom || 1); fakeBust(ctx, x + w * (.5 + (cam.dx || 0)), y + h * ((av ? .5 : .43) + (cam.dy || 0)) + 8.6 * s, s, who, pose); return; }
  if (o.cam === 'forehead' && typeof foreheadCam === 'function') { foreheadCam(ctx, box, t, rigWho(who), pose, { k: o.camK ?? .6 }); return; }
  const F = bustFit(box, rigWho(who), { zoom: (cam.zoom || 1) * (av ? 2.3 : 1), dy: (cam.dy || 0) + (av ? .05 : 0) });
  person(ctx, F.x + (cam.dx || 0) * w, F.y, F.s, rigWho(who), pose);
}
// Stand-ins until world.js / human.js provide webcamBg() and person(): a home-office wall and a flat bust.
function fakeBg(ctx, box, kind, seed) {
  const [x, y, w, h] = box, wall = K(['#D8D2C6', '#CBD3D5', '#DDD0C2', '#D3CCD8'][seed % 4], INK.paperDk), dk = K('#B9B0A2', INK.orangeLt);
  fillPts(ctx, rect(x, y, w, h), wall, false);
  if (kind === 'bookshelf') { fillPts(ctx, rect(x + w * .62, y + h * .08, w * .34, h * .8), dk, false); for (let i = 0; i < 9; i++) fillPts(ctx, rect(x + w * (.64 + i * .034), y + h * (.14 + hash(seed + i) * .08), w * .028, h * .2), K(['#7C8FA8', '#C08A6E', '#8FA88C', '#D1B36E'][i % 4], INK.red), false); }
  else if (kind === 'kitchen') { fillPts(ctx, rect(x, y, w, h * .3), K('#E8E3DA', INK.paper), false); fillPts(ctx, rect(x + w * .08, y + h * .04, w * .26, h * .22), dk, false); fillPts(ctx, rect(x + w * .66, y + h * .04, w * .26, h * .22), dk, false); }
  else if (kind === 'ceiling') { fillPts(ctx, rect(x, y, w, h * .55), K('#EEEBE4', INK.paper), false); fillPts(ctx, rect(x + w * .3, y + h * .12, w * .4, h * .1), K('#FFFFF6', INK.yellow), false); }
  else if (kind === 'bed') { fillPts(ctx, rr(x + w * .1, y + h * .35, w * .8, h * .5, h * .08), K('#B8A6C6', INK.pinkLt), false); }
}
const SKIN = { dan: '#EDC3A4', greg: '#F0BFA6', linda: '#F2CDB2', tasha: '#B67A5C', bob: '#EDB693', sam: '#D9A07E' };
function fakeBust(ctx, gx, gy, s, who, pose) {
  const id = typeof who === 'string' ? who : '', n = seedOf(who), pick = (m, l) => m[id] || l[n % l.length];
  const skin = K(pick(SKIN, ['#F1C7A8', '#C98E6B', '#8D5A3E', '#E8B896']), INK.pinkLt), dark = K('#2E2A33', INK.ink);
  const top = K(pick({ dan: INK.oshirt, greg: '#2F3B57', linda: '#B9A7D4', tasha: '#A9B99A', bob: '#5C6E86', sam: '#C9B79C' }, ['#8EA2B8', '#B8A08E', '#9DB09A', '#B5A9C4', '#7F8C9A']), INK.cyan);
  const hair = K(pick({ dan: '#5A4032', greg: '#7A6250', linda: '#CFCFD6', tasha: '#F28DB2', bob: '#C8662E', sam: '#2E2420' }, ['#3A2C24', '#6B4A33', '#1E1A18', '#A07850']), INK.ink);
  const prev = local(ctx, gx, gy, s), L = { line: 2.5 };
  face(ctx, rr(-3, -6.9, 6, 6, [2, 2, 0, 0]), top, L);
  if (id === 'dan') face(ctx, roundPoly([[-.25, -6.85], [.25, -6.85], [.38, -4.4], [0, -3.9], [-.38, -4.4]], .1), K('#2B3A5C', INK.red), { line: 1 });
  if (id === 'greg') face(ctx, roundPoly([[-1, -6.9], [1, -6.9], [0, -5.4]], .2), K('#F4F4F2', INK.white), { line: 1 });
  face(ctx, rr(-.5, -7.7, 1, 1.1, .2), skin, { line: 0 });
  ctx.save(); ctx.translate(0, -8.6 + (pose.nod || 0)); ctx.rotate((pose.tilt || 0) * Math.PI / 180);
  if (id === 'tasha') for (const sx of [-1, 1]) face(ctx, oval(sx * .95, -1.35, .55), hair, L);
  if (id === 'linda') face(ctx, rr(-1.5, -1.6, 3, 2.7, [1.5, 1.5, .4, .4]), hair, L);
  face(ctx, oval(0, 0, 1.12, 1.4), skin, L);
  if (id === 'greg') for (const sx of [-1, 1]) face(ctx, rr(sx > 0 ? .78 : -1.2, -.7, .42, .9, .2), hair, { line: 0 });
  else if (id === 'bob') face(ctx, roundPoly([[-1.12, .15], [1.12, .15], [.8, 1.3], [0, 1.95], [-.8, 1.3]], .45), hair, L);
  else if (id !== 'linda') face(ctx, [[-1.15, -.2], ...oval(0, -.25, 1.18, 1.2).filter(([, b]) => b < -.25), [1.15, -.2]], hair, { line: 0 });
  const ey = -.05;
  for (const sx of [-1, 1]) { if (pose.lids >= 1) fillPts(ctx, rect(sx * .42 - .16, ey, .32, .05), dark, false); else fillPts(ctx, oval(sx * .42, ey, .1, .12), dark, false); }
  if (id === 'dan') { ctx.lineWidth = .08; ctx.strokeStyle = dark; ctx.strokeRect(-.72, -.24, .56, .38); ctx.strokeRect(.16, -.24, .56, .38); }
  if (pose.mouth === 'talk') fillPts(ctx, oval(0, .62, .26, .08 + (pose.open || 0) * .2), K('#7A3B3B', INK.redDk), false);
  else { ctx.lineWidth = .07; ctx.strokeStyle = dark; ctx.beginPath(); ctx.arc(0, .42, .3, .5, Math.PI - .5); ctx.stroke(); }
  ctx.restore(); unlocal(ctx, prev);
}

// ---------- Microsoft Teams ----------
function TT(dark = true) {
  return dark ? {
    dark, bg: K('#1F1F1F', INK.ink), bar: K('#292929', '#231B33'), card: K('#292929', '#2A2140'), tile: K('#2E2E2E', '#2A2140'), stroke: K('#3D3D3D', '#3B3052'),
    fg: K('#FFFFFF', INK.white), fg2: K('#D6D6D6', '#EADFCB'), fg3: K('#ADADAD', '#B8AC98'), brand: K('#5B5FC7', INK.teams), brandFg: K('#7F85F5', INK.teamsLt),
    ring: K('#7F85F5', INK.teams), red: K('#C4314B', INK.red), redDk: K('#A4262C', INK.redDk), green: K('#13A10E', INK.green),
    mine: K('#2B2B40', '#3A2E66'), other: K('#292929', '#2A2140'), dots: rgba(INK.teams, .45),
  } : {
    dark, bg: K('#F5F5F5', INK.paper), bar: K('#EBEBEB', INK.paperDk), card: K('#FFFFFF', INK.white), tile: K('#E0E0E0', INK.paperDk), stroke: K('#E0E0E0', '#CDBFA6'),
    fg: K('#242424', INK.ink), fg2: K('#424242', INK.ink), fg3: K('#616161', '#6A6070'), brand: K('#5B5FC7', INK.teams), brandFg: K('#5B5FC7', INK.teams),
    ring: K('#5B5FC7', INK.teams), red: K('#C4314B', INK.red), redDk: K('#A4262C', INK.redDk), green: K('#13A10E', INK.green),
    mine: K('#E8EBFA', INK.teamsLt), other: K('#FFFFFF', INK.white), dots: rgba(INK.ink, .2),
  };
}
const gold = () => K('#FCD116', INK.yellow);

// Incoming chat / call notification (Teams' own toast), w = 360 reference.
function teamsToast(ctx, x, y, w, t, o = {}) { return printed(ctx, o, c => toast_(c, x, y, w, t, o)); }
function toast_(ctx, x, y, w, t, o) {
  const t0 = o.t0 ?? 0; if (t < t0 || (o.until != null && t > o.until + .3)) return null;
  const z = w / 360, call = o.kind === 'call', th = TT(o.dark ?? true), H = call ? 124 : 152, name = o.name || nameOf(o.who);
  const dx = (1 - backOut(seg(t, t0, t0 + .34), 1.3)) * (w + 60) / z + (o.until != null ? easeIn(seg(t, o.until, o.until + .3)) * (w + 60) / z : 0);
  const prev = local(ctx, x, y, z); ctx.translate(dx, 0);
  const card = rr(0, 0, 360, H, 8); drop(ctx, card); face(ctx, card, th.card, { dots: th.dots, line: 3, max: .16 }); edge(ctx, card, th.stroke);
  teamsLogo(ctx, 24, 20, 16); tx(ctx, 'Microsoft Teams', 40, 20, 12, th.fg3);
  icon(ctx, 'more', 314, 20, 16, th.fg3); icon(ctx, 'close', 340, 20, 13, th.fg3);
  if (call) {
    const ring_ = t - t0;
    for (let i = 0; i < 2; i++) { const p = frac(ring_ * .9 + i * .5); ctx.save(); ctx.globalAlpha *= (1 - p) * .7; ring(ctx, oval(46, 76, 26 + p * 13), th.brandFg, 2); ctx.restore(); }
    avatar_(ctx, 46, 76, 26, o.who, { name, photo: o.photo, t });
    tx(ctx, fit(ctx, name, 15, 700, 140), 84, 66, 15, th.fg, 700); tx(ctx, fit(ctx, o.text || 'Incoming call', 13, 400, 140), 84, 88, 13, th.fg3);
    [['video', 'video', 242, th.green], ['audio', 'phone', 288, th.green], ['decline', 'hangup', 334, th.red]].forEach(([id, ic, bx, col]) => {
      const p = o.press === id ? .9 : 1; face(ctx, oval(bx, 76, 18 * p), col, { line: 2 }); icon(ctx, ic, bx, 76, 18 * p, K('#FFFFFF', INK.white)); });
  } else {
    avatar_(ctx, 38, 66, 20, o.who, { name, photo: o.photo, t, presence: o.presence, ring: th.card });
    tx(ctx, fit(ctx, name, 14, 700, 270), 70, 56, 14, th.fg, 700);
    wrap(ctx, o.text || '', 14, 400, 272, 2).forEach((l, i) => tx(ctx, l, 70, 77 + i * 19, 14, th.fg2));
    const rb = rr(16, 112, 328, 28, 4), r = typedOf(o.reply, t); face(ctx, rb, th.bg, { line: 1.5 }); edge(ctx, rb, th.stroke);
    tx(ctx, r || 'Reply', 28, 126, 13, r ? th.fg : th.fg3); icon(ctx, 'send', 328, 126, 15, r ? th.brandFg : th.fg3);
  }
  unlocal(ctx, prev);
  return [x + dx * z, y, w, H * z];
}

// One gallery tile.
function teamsTile(ctx, box, t, o = {}) { return printed(ctx, o, c => tile_(c, box, t, o)); }
function tile_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? clamp(w / 480, .5, 4), th = TT(true), who = o.who, name = o.name || nameOf(who);
  const shape = rr(x, y, w, h, 6 * z), fz = o.frozen != null && o.frozen !== false, frozen = fz && (typeof o.frozen !== 'number' || t >= o.frozen), tf = !fz ? t : typeof o.frozen === 'number' ? Math.min(t, o.frozen) : 0;
  face(ctx, shape, th.tile, { dots: th.dots, line: 0, max: .35 });
  ctx.save(); clipPts(ctx, shape, false); const st = STYLE; if (o.look != null) look(o.look);
  if (o.draw) o.draw(ctx, box, t);
  else if (o.camOff) {
    const r = clamp(Math.min(w, h) * .2, 14 * z, 96 * z);
    if (o.speaking) ring(ctx, oval(x + w / 2, y + h / 2, r + (4 + 2 * Math.abs(Math.sin(t * 5))) * z), th.ring, 3 * z);
    avatar_(ctx, x + w / 2, y + h / 2, r, who, { name, initials: o.initials });
  } else webcam(ctx, box, tf, who, o);
  if (frozen && !o.draw) frozenOverlay(ctx, box, z, o.self ? 'Your network is unstable' : `${firstOf(name)}'s connection is unstable`);
  if (o.reactions) for (const r of o.reactions) reaction(ctx, box, t, r, z);
  STYLE = st; ctx.restore();
  inkFrame(ctx, shape, 3);
  const rc = o.hand ? gold() : o.speaking ? th.ring : null;
  if (rc) ring(ctx, rr(x + 1.5 * z, y + 1.5 * z, w - 3 * z, h - 3 * z, 5 * z), rc, 2.5 * z);
  // name label: [hand] name [mic-off]
  const ls = 12 * z, lh = 24 * z, pad = 8 * z, mic = o.muted ? 20 * z : 0, hand = o.hand ? 22 * z : 0;
  const label = fit(ctx, name, ls, 600, w - 12 * z - pad * 2 - mic - hand), lw = pad * 2 + tw(ctx, label, ls, 600) + mic + hand, lx = x + 6 * z, ly = y + h - 6 * z - lh;
  face(ctx, rr(lx, ly, lw, lh, 4 * z), rgba(K('#141414', INK.ink), lerp(.62, 1, STYLE.k)), { line: 1.5 });
  let cx = lx + pad;
  if (hand) { tx(ctx, '\u270B', cx + 7 * z, ly + lh / 2, 13 * z, gold(), 400, { align: 'center' }); cx += hand; }
  tx(ctx, label, cx, ly + lh / 2, ls, th.fg, 600);
  if (mic) icon(ctx, 'mic', lx + lw - pad - 7 * z, ly + lh / 2, 15 * z, th.fg, { off: true });
  return box;
}
function frozenOverlay(ctx, box, z, text) {
  const [x, y, w, h] = box;
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = .8; ctx.fillStyle = '#808080'; ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .38; ctx.fillStyle = '#000000'; ctx.fillRect(x, y, w, h); ctx.restore();
  const fs = clamp(13 * z, 9, 60), ph = fs * 2.5, pw = Math.min(tw(ctx, text, fs, 600) + fs * 4, w - 12 * z), px = x + (w - pw) / 2, py = y + h * .5 - ph / 2;
  face(ctx, rr(px, py, pw, ph, ph / 2), rgba(K('#1F1F1F', INK.ink), .9), { line: 2 });
  icon(ctx, 'wifi', px + fs * 1.55, py + ph / 2, fs * 1.25, gold());
  tx(ctx, fit(ctx, text, fs, 600, pw - fs * 3.6), px + fs * 2.6, py + ph / 2, fs, K('#FFFFFF', INK.white), 600);
}
function reaction(ctx, box, t, r, z) {
  const age = t - r.at; if (age < 0 || age > 2.6) return;
  const [x, y, w, h] = box, k = backOut(clamp(age / .25), 2.2), up = easeOut(age / 2.6), a = 1 - clamp((age - 2.1) / .5);
  txt(ctx, r.e || '\uD83D\uDC4D', x + w * (r.x ?? .5) + Math.sin(age * 4 + r.at * 7) * 10 * z, y + h * .82 - up * h * .5, { font: 'ui', size: 46 * z * k, align: 'center', base: 'middle', alpha: a });
}

// The meeting window.
function teamsCall(ctx, box, t, o = {}) { return printed(ctx, o, c => call_(c, box, t, o)); }
// Gallery layout: the grid that gives the biggest 16:9 tiles; fill = [minAspect, maxAspect] stretches tiles to use the
// stage like new Teams does (Zoom keeps strict 16:9).
function gridBoxes(n, x, y, w, h, gap, fill = null, ar = 16 / 9) {
  if (!n) return [];
  let best = null;
  for (let cols = 1; cols <= n; cols++) { const rows = Math.ceil(n / cols); let a = (w - gap * (cols - 1)) / cols, b = (h - gap * (rows - 1)) / rows; if (a / b > ar) a = b * ar; else b = a / ar; if (!best || a > best.a) best = { cols, rows, a, b }; }
  let { cols, rows, a, b } = best;
  if (fill) { a = (w - gap * (cols - 1)) / cols; b = (h - gap * (rows - 1)) / rows; if (a / b > fill[1]) a = b * fill[1]; if (a / b < fill[0]) b = a / fill[0]; }
  const out = [], y0 = y + (h - rows * b - (rows - 1) * gap) / 2;
  for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), inRow = r === rows - 1 ? n - r * cols : cols, rw = inRow * a + (inRow - 1) * gap; out.push([x + (w - rw) / 2 + (i % cols) * (a + gap), y0 + r * (b + gap), a, b]); }
  return out;
}
function call_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 1280, th = TT(true), chrome = o.chrome || 'full', R = chrome === 'none' ? 0 : 8 * z;
  const tH = chrome === 'full' ? 32 : 0, bH = chrome === 'none' ? 0 : 56, win = rr(x, y, w, h, R), out = [];
  if (chrome !== 'none' && o.shadow !== false) drop(ctx, win);
  face(ctx, win, th.bg, { dots: th.dots, line: 4, max: .3, sp: 16 });
  ctx.save(); clipPts(ctx, win, false);
  if (bH) { const prev = local(ctx, x, y, z), L = teamsBar(ctx, w / z, tH, t, o, th); unlocal(ctx, prev); out.leave = [x + L[0] * z, y + L[1] * z, L[2] * z, L[3] * z]; }
  const pad = 8 * z, gap = 6 * z, sy = y + (tH + bH) * z + pad; let sx = x + pad, sw = w - pad * 2, sh = h - (sy - y) - pad;
  if (o.chat) { const pw = Math.min(380 * z, sw * .36); chat_(ctx, [x + w - pad - pw, sy, pw, sh], t, { zoom: z, shadow: false, title: 'Meeting chat', ...o.chat }); sw -= pw + pad; }
  out.stage = [sx, sy, sw, sh];
  const tiles = o.tiles || [], lay = o.layout || 'grid', fi = o.focus ?? Math.max(0, tiles.findIndex(q => q.speaking));
  let boxes = [], area = out.stage;
  if (lay === 'grid') boxes = gridBoxes(tiles.length, sx, sy, sw, sh, gap, [1.2, 2]);
  else {
    const rest = tiles.map((_, i) => i).filter(i => i !== fi || lay === 'share');
    if (lay === 'speaker') {
      const sh2 = Math.min(sh * .19, 150 * z), bw = sh2 * 16 / 9, n = Math.min(rest.length, Math.floor((sw + gap) / (bw + gap)));
      area = [sx, sy, sw, sh - (n ? sh2 + gap : 0)]; boxes[fi] = area;
      rest.slice(0, n).forEach((i, j) => { boxes[i] = [sx + (sw - n * bw - (n - 1) * gap) / 2 + j * (bw + gap), sy + sh - sh2, bw, sh2]; });
    } else {
      const cw = Math.min(sw * .22, 300 * z), chh = cw * 9 / 16, n = Math.min(rest.length, Math.floor((sh + gap) / (chh + gap)));
      area = [sx, sy, sw - (n ? cw + gap : 0), sh];
      const sp = rr(...area, 6 * z); ctx.save(); clipPts(ctx, sp, false); fillPts(ctx, rect(...area), K('#000000', INK.ink), false);
      const st = STYLE; if (o.share) o.share(ctx, area, t); else ppt_(ctx, fitBox(area, 16 / 9), t, { view: 'show', title: 'CONTEXT' });
      STYLE = st; ctx.restore(); inkFrame(ctx, sp, 3);
      const pn = nameOf(o.presenter ?? (tiles[fi] || {}).who), ps = 12 * z, pl = `${pn} is presenting`, pw = tw(ctx, pl, ps, 600) + 20 * z;
      face(ctx, rr(area[0] + 8 * z, area[1] + 8 * z, pw, 26 * z, 4 * z), rgba(K('#141414', INK.ink), .82), { line: 1.5 }); tx(ctx, pl, area[0] + 18 * z, area[1] + 21 * z, ps, th.fg, 600);
      rest.slice(0, n).forEach((i, j) => { boxes[i] = [sx + sw - cw, sy + j * (chh + gap), cw, chh]; });
    }
  }
  tiles.forEach((tl, i) => { if (boxes[i]) { tile_(ctx, boxes[i], t, { zoom: z, ...tl }); out[i] = boxes[i]; } });
  if (o.captions) { const cw = Math.min(area[2] - 32 * z, Math.max(area[2] * .72, 560 * z)); caption_(ctx, area[0] + (area[2] - cw) / 2, area[1] + area[3] - 14 * z, cw, { size: 18 * z, bottom: true, ...o.captions }); }
  ctx.restore();
  return out;
}
const fitBox = ([x, y, w, h], ar) => { const a = Math.min(w, h * ar), b = a / ar; return [x + (w - a) / 2, y + (h - b) / 2, a, b]; };
// Title row (logo, title, caption buttons) + the meeting control bar, in native units. Returns the Leave button box.
function teamsBar(ctx, Wn, top, t, o, th) {
  if (top) { teamsLogo(ctx, 18, 16, 16); tx(ctx, fit(ctx, o.title || 'Meeting', 12, 400, Wn - 200), 34, 16, 12, th.fg2); winCtl(ctx, Wn, 0, 32, th.fg2); }
  const y0 = top, cy = y0 + 28, wh = K('#FFFFFF', INK.white);
  face(ctx, rect(0, y0, Wn, 56), th.bar, { line: 0, reg: .5, dots: th.dots, max: .25 });
  let lx = 16;
  if (o.recording) { fillPts(ctx, oval(22, cy, 5), th.red, false); lx = 34; }
  tx(ctx, fmtTimer(o.timer ?? 900), lx, cy, 14, th.fg, 600);
  const sep = rx => rule(ctx, rx, y0 + 16, rx, y0 + 40, th.stroke);
  const btn = (rx, ic, label, bw, opt = {}) => {
    const cx = rx - bw / 2, ix = opt.chev ? cx - 6 : opt.count != null ? cx - (tw(ctx, opt.count, 12, 600) + 4) / 2 : cx;
    icon(ctx, ic, ix, y0 + 21, 20, th.fg2, { off: opt.off, bg: th.bar });
    if (opt.chev) icon(ctx, 'chevron', cx + 14, y0 + 21, 12, th.fg2);
    if (opt.count != null) tx(ctx, opt.count, ix + 14, y0 + 21, 12, th.fg2, 600);
    if (opt.badge) { face(ctx, oval(cx + 9, y0 + 12, 7), th.red, { line: 1 }); tx(ctx, String(opt.badge), cx + 9, y0 + 12.5, 9, wh, 700, { align: 'center' }); }
    tx(ctx, label, cx, y0 + 45, 11, th.fg2, 400, { align: 'center' });
    return rx - bw;
  };
  const L = [Wn - 12 - 98, y0 + 12, 98, 32], pressed = o.leave != null && t >= o.leave - 1 / 24 && t < o.leave + .3;
  ctx.save(); if (pressed) { ctx.translate(L[0] + 49, cy); ctx.scale(.95, .95); ctx.translate(-L[0] - 49, -cy); }
  face(ctx, rr(...L, 4), pressed ? th.redDk : th.red, { line: 2 });
  icon(ctx, 'hangup', L[0] + 19, cy, 20, wh); tx(ctx, 'Leave', L[0] + 33, cy, 14, wh, 600);
  rule(ctx, L[0] + 77, y0 + 19, L[0] + 77, y0 + 37, rgba('#FFFFFF', .45)); icon(ctx, 'chevron', L[0] + 88, cy, 13, wh);
  ctx.restore();
  let rx = L[0] - 10; sep(rx); rx -= 8;
  rx = btn(rx, 'share', 'Share', 56); rx = btn(rx, 'mic', 'Mic', 66, { chev: true, off: !o.mic }); rx = btn(rx, 'camera', 'Camera', 66, { chev: true, off: o.camera === false });
  rx -= 6; sep(rx); rx -= 6;
  for (const [ic, lab] of [['more', 'More'], ['view', 'View'], ['react', 'React'], ['raise', 'Raise']]) rx = btn(rx, ic, lab, 56);
  const pc = o.participants != null ? String(o.participants) : null, pw = pc ? Math.max(58, tw(ctx, pc, 12, 600) + 44) : 56;
  rx = btn(rx, 'people', 'People', pw, { count: pc });
  btn(rx, 'chat', 'Chat', 56, { badge: o.unread });
  return L;
}

// Meeting chat panel / chat window.
function teamsChat(ctx, box, t, o = {}) { return printed(ctx, o, c => chat_(c, box, t, o)); }
function chat_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 400, th = TT(o.dark ?? true), Wn = w / z, Hn = h / z, prev = local(ctx, x, y, z), me = o.me ?? 'dan';
  const panel = rr(0, 0, Wn, Hn, 8); if (o.shadow !== false) drop(ctx, panel); face(ctx, panel, th.bg, { dots: th.dots, line: 3, max: .3 }); edge(ctx, panel, th.stroke);
  ctx.save(); clipPts(ctx, panel, false);
  tx(ctx, fit(ctx, o.title || 'Chat', 16, 700, Wn - 70), 16, 27, 16, th.fg, 700); icon(ctx, 'close', Wn - 24, 27, 14, th.fg2);
  rule(ctx, 0, 53, Wn, 53, th.stroke);
  // compose box
  const cy = Hn - 58, cb = rr(12, cy, Wn - 24, 46, 6), ct = typedOf(o.compose, t);
  face(ctx, cb, th.card, { line: 2 }); edge(ctx, cb, th.stroke); if (ct) fillPts(ctx, rect(13, cy + 44, Wn - 26, 2), th.brand, false);
  const cl = wrap(ctx, ct, 14, 400, Wn - 110), shown = cl[cl.length - 1];
  tx(ctx, ct ? shown + (caretOn(t) ? '|' : '') : 'Type a message', 24, cy + 23, 14, ct ? th.fg : th.fg3);
  icon(ctx, 'react', Wn - 70, cy + 23, 18, th.fg3); icon(ctx, 'send', Wn - 36, cy + 23, 18, ct ? th.brandFg : th.fg3);
  // typing indicator
  const ty = o.typing ? [].concat(o.typing) : [];
  if (ty.length) { const s = ty.length > 2 ? 'Several people are typing' : ty.map(q => firstOf(NAMES[q] || nameOf(q))).join(' and ') + (ty.length > 1 ? ' are typing' : ' is typing'); tx(ctx, s, 16, cy - 14, 12, th.fg3); dots(ctx, 16 + tw(ctx, s, 12, 400) + 10, cy - 13, 2.2, 6, t, th.fg3); }
  // messages, bottom-anchored
  const vis = (o.messages || []).filter(m => m.at == null || t >= m.at - 1 / 24), maxW = Wn - 56 - 32;
  const items = vis.map((m, i) => {
    const mine = m.me ?? m.who === me, pm = vis[i - 1], grouped = !!pm && pm.who === m.who && (pm.me ?? pm.who === me) === mine;
    const lines = wrap(ctx, m.text, 14, 400, maxW - 24), head = grouped ? '' : mine ? (m.time || '') : `${m.name || nameOf(m.who)}   ${m.time || ''}`;
    const bw = Math.min(maxW, Math.max(...lines.map(l => tw(ctx, l, 14, 400)), head ? tw(ctx, head, 12, 600) : 0) + 24), bh = 16 + (head ? 18 : 0) + lines.length * 20;
    return { m, mine, grouped, lines, head, bw, bh, rx: m.react && m.react.length ? 14 : 0, e: m.at == null ? 1 : easeOut(seg(t, m.at - 1 / 24, m.at + .22)) };
  });
  let yb = cy - (ty.length ? 30 : 12);
  for (let i = items.length - 1; i >= 0 && yb > 54; i--) {
    const it = items[i], gapA = (items[i + 1] && items[i + 1].grouped ? 3 : 14) * it.e; yb -= gapA * (i < items.length - 1 ? 1 : 0) + (it.bh + it.rx) * it.e;
    const bx = it.mine ? Wn - 16 - it.bw : 56, by = yb + (1 - it.e) * 12;
    ctx.save(); ctx.globalAlpha *= it.e;
    if (!it.mine && !it.grouped) avatar_(ctx, 32, by + 16, 16, it.m.who, { name: it.m.name, photo: it.m.photo, t });
    const bub = rr(bx, by, it.bw, it.bh, 6); face(ctx, bub, it.mine ? th.mine : th.other, { line: 2, dots: th.dots, max: .25 });
    let ty2 = by + 17;
    if (it.head) { tx(ctx, it.head, bx + 12, ty2, 12, it.mine ? th.fg3 : th.fg2, 600); ty2 += 19; }
    it.lines.forEach((l, j) => tx(ctx, l, bx + 12, ty2 + j * 20, 14, th.fg));
    (it.m.react || []).forEach(([e, n], j) => { const rx = bx + it.bw - 8 - (j + 1) * 52, ry = by + it.bh - 6, pb = rr(rx, ry, 48, 22, 11); face(ctx, pb, th.card, { line: 1.5 }); edge(ctx, pb, th.stroke); tx(ctx, e, rx + 15, ry + 11, 13, th.fg, 400, { align: 'center' }); tx(ctx, String(n), rx + 27, ry + 11, 12, th.fg2, 600); });
    ctx.restore();
  }
  ctx.restore(); unlocal(ctx, prev);
  return box;
}
function dots(ctx, x, y, r, gap, t, color) { for (let i = 0; i < 3; i++) fillPts(ctx, oval(x + i * gap, y - Math.max(0, Math.sin((t * 2.4 - i * .16) * TAU)) * r * 1.4, r), color, false); }

// Live captions bar.
function teamsCaption(ctx, x, y, w, o = {}) { return printed(ctx, o, c => caption_(c, x, y, w, o)); }
function caption_(ctx, x, y, w, o) {
  const size = o.size || 32, words = o.words || [], rows = o.lines ?? 2, wt = o.weight ?? 600, th = TT(true);
  const pad = size * .5, av = size * 1.2, ns = Math.max(size * .46, 11), lh = size * 1.24, tx0 = x + pad + av + pad * .7, twd = x + w - pad - tx0;
  setFont(ctx, { font: 'ui', size, weight: wt }); const sp = ctx.measureText(' ').width, pos = []; let r = 0, cx = 0, last = -1;
  words.forEach((wd, i) => { const ww = ctx.measureText(wd.s).width; if (cx > 0 && cx + ww > twd) { r++; cx = 0; } pos.push([r, cx]); cx += ww + sp; if (wd.shown !== false) last = i; });
  const first = Math.max(0, (last >= 0 ? pos[last][0] : 0) - rows + 1), h = pad * 1.7 + ns * 1.3 + rows * lh, y0 = o.bottom ? y - h : y;
  const bar = rr(x, y0, w, h, size * .3);
  face(ctx, bar, rgba(K('#1B1B1B', INK.ink), lerp(.86, 1, STYLE.k)), { line: 3, dots: th.dots, max: .18 });
  const spk = o.speaker ?? 'dan', sname = o.name || nameOf(spk);
  avatar_(ctx, x + pad + av / 2, y0 + pad + av / 2, av / 2, spk, { name: sname, photo: o.photo, t: o.t });
  tx(ctx, sname, tx0, y0 + pad + ns * .55, ns, th.fg3, 600);
  const by = y0 + pad + ns * 1.3 + lh * .5;
  words.forEach((wd, i) => {
    if (wd.shown === false) return; const [rw, wx] = pos[i]; if (rw < first || rw >= first + rows) return;
    const k = wd.k ?? 1; tx(ctx, wd.s, tx0 + wx, by + (rw - first) * lh + (1 - easeOut(k)) * size * .14, size, wd.color || th.fg, wt, { alpha: clamp(k * 2.5) });
  });
  return [x, y0, w, h];
}

// "You're muted" toast, centred on (x, y).
function mutedToast(ctx, x, y, t, t0, o = {}) { return printed(ctx, o, c => muted_(c, x, y, t, t0, o)); }
function muted_(ctx, x, y, t, t0, o) {
  const age = t - t0, life = o.life ?? 2.8; if (age < -1 / 24 || age > life) return;
  const th = TT(true), k = backOut(clamp((age + 1 / 24) / .22), 1.8), out = clamp((age - life + .25) / .25), z = (o.zoom ?? 2) * k;
  const prev = local(ctx, x, y + out * 20, z); ctx.globalAlpha *= 1 - out;
  const card = rr(-160, -30, 320, 60, 8); drop(ctx, card); face(ctx, card, th.card, { line: 3, dots: th.dots, max: .16 }); edge(ctx, card, th.stroke);
  icon(ctx, 'mic', -130, 0, 22, th.fg, { off: true, bg: th.card });
  tx(ctx, o.text || "You're muted", -108, -8, 15, th.fg, 700); tx(ctx, o.sub || 'Unmute to speak', -108, 12, 12, th.fg3);
  face(ctx, rr(56, -16, 88, 32, 4), th.brand, { line: 2 }); tx(ctx, 'Unmute', 100, 0, 13, K('#FFFFFF', INK.white), 600, { align: 'center' });
  unlocal(ctx, prev);
}
// Network warning bar at the top centre of a meeting stage.
function unstableBanner(ctx, box, o = {}) { return printed(ctx, o, c => banner_(c, box, o)); }
function banner_(ctx, box, o) {
  const [x, y, w] = box, z = o.zoom ?? w / 1280, bw = Math.min(w / z - 32, 600), prev = local(ctx, x + (w - bw * z) / 2, y + (o.top ?? 12) * z, z), text = o.text || 'Your network is unstable. Video may freeze.';
  const card = rr(0, 0, bw, 44, 6); drop(ctx, card, { a: .7 }); face(ctx, card, K('#463100', INK.yellow), { line: 3 }); edge(ctx, card, K('#6B5000', INK.ink));
  icon(ctx, 'warn', 24, 22, 18, K('#FCE100', INK.ink)); tx(ctx, fit(ctx, text, 14, 600, bw - 90), 44, 22, 14, K('#FFFFFF', INK.ink), 600); icon(ctx, 'close', bw - 22, 22, 13, K('#FFFFFF', INK.ink));
  unlocal(ctx, prev);
}
// Red presenting border with the sharing control bar.
function screenShareBorder(ctx, box, t, o = {}) { return printed(ctx, o, c => share_(c, box, t, o)); }
function share_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 1280, red = K('#C4314B', INK.red), th = TT(true), self = o.who == null;
  ring(ctx, rect(x + 2 * z, y + 2 * z, w - 4 * z, h - 4 * z), red, 4 * z);
  const label = self ? "You're presenting" : `${nameOf(o.who)} is presenting`, bw = tw(ctx, label, 13, 600) + (self ? 210 : 172), dy = (1 - easeOut(seg(t, o.t0 ?? -1, (o.t0 ?? -1) + .3))) * -60;
  const prev = local(ctx, x + w / 2, y + dy * z, z), bar = rr(-bw / 2, 0, bw, 44, [0, 0, 8, 8]);
  drop(ctx, bar); face(ctx, bar, th.bar, { line: 3 }); edge(ctx, bar, th.stroke);
  const lx = -bw / 2 + 18; fillPts(ctx, oval(lx + 4, 22, 5), red, false); ctx.save(); ctx.globalAlpha *= .35 + .35 * Math.sin(t * 5); ring(ctx, oval(lx + 4, 22, 8), red, 1.5); ctx.restore();
  tx(ctx, label, lx + 18, 22, 13, th.fg, 600);
  const b2 = self ? 'Stop presenting' : 'Request control', b2w = tw(ctx, b2, 12, 600) + 24, bx = bw / 2 - 12 - b2w;
  face(ctx, rr(bx, 8, b2w, 28, 4), self ? red : th.card, { line: 2 }); tx(ctx, b2, bx + b2w / 2, 22, 12, K('#FFFFFF', INK.white), 600, { align: 'center' });
  if (self) { icon(ctx, 'mic', bx - 28, 22, 16, th.fg2, { off: true, bg: th.bar }); icon(ctx, 'camera', bx - 56, 22, 16, th.fg2); }
  unlocal(ctx, prev);
}
// Recap tab with AI notes (the intelligent recap).
function aiRecap(ctx, box, t, o = {}) { return printed(ctx, o, c => recap_(c, box, t, o)); }
function recap_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 640, th = TT(o.dark ?? true), Wn = w / z, Hn = h / z, prev = local(ctx, x, y, z), t0 = o.t0 ?? 0;
  const panel = rr(0, 0, Wn, Hn, 8); drop(ctx, panel); face(ctx, panel, th.bg, { line: 3, dots: th.dots, max: .3 }); edge(ctx, panel, th.stroke);
  ctx.save(); clipPts(ctx, panel, false);
  tx(ctx, fit(ctx, o.title || 'Quick sync \uD83D\uDE42', 20, 700, Wn - 48), 24, 34, 20, th.fg, 700);
  tx(ctx, o.date || 'Wed, Oct 7  \u00B7  9:00 AM \u2013 12:02 PM', 24, 60, 13, th.fg3);
  let tx_ = 24; ['Recap', 'Chat', 'Files', 'Transcript'].forEach((s, i) => { const sw = tw(ctx, s, 14, i ? 400 : 600); tx(ctx, s, tx_, 92, 14, i ? th.fg2 : th.fg, i ? 400 : 600); if (!i) fillPts(ctx, rr(tx_, 106, sw, 3, 1.5), th.brandFg, false); tx_ += sw + 28; });
  rule(ctx, 0, 109, Wn, 109, th.stroke);
  const card = rr(16, 124, Wn - 32, Hn - 140, 8); face(ctx, card, th.card, { line: 2, dots: th.dots, max: .25 }); edge(ctx, card, th.stroke);
  icon(ctx, 'sparkle', 42, 154, 22, th.brandFg); tx(ctx, 'AI notes', 62, 154, 16, th.fg, 700);
  tx(ctx, 'Generated by AI. Be sure to check for accuracy.', 36, 180, 12, th.fg3);
  let yy = 212, n = 0;
  for (const s of o.sections || []) {
    const sa = t0 + .3 + n * .42; if (t < sa - .15) break;
    tx(ctx, s.h, 36, yy, 15, th.fg, 700); yy += 26;
    for (const it of s.items || []) {
      const at = t0 + .3 + n++ * .42, e = easeOut(seg(t, at, at + .25)); if (e <= 0) break;
      const lines = wrap(ctx, it, 14, 400, Wn - 110);
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * 10, 0);
      if (s.tasks) { const cb = rr(38, yy - 8, 16, 16, 3); edge(ctx, cb, th.fg2, 1.5); inkFrame(ctx, cb, 2); } else fillPts(ctx, oval(44, yy, 2.5), th.fg2, false);
      lines.forEach((l, j) => tx(ctx, l, 62, yy + j * 20, 14, th.fg2)); ctx.restore();
      yy += lines.length * 20 + 8;
    }
    yy += 12;
  }
  if (o.speakers) { yy = Math.max(yy, Hn - 40 - o.speakers.length * 34); tx(ctx, 'Speakers', 36, yy, 13, th.fg3, 600); yy += 24;
    for (const sp of o.speakers) { const nm = sp.name || nameOf(sp.who), bw = Wn - 260; avatar_(ctx, 46, yy, 11, sp.who, { name: nm }); tx(ctx, fit(ctx, nm, 13, 600, 120), 64, yy, 13, th.fg2, 600);
      const bar = rr(196, yy - 5, bw, 10, 5); face(ctx, bar, th.stroke, { line: 1 }); fillPts(ctx, rr(196, yy - 5, Math.max(10, bw * clamp(sp.share ?? .1)), 10, 5), th.brandFg, false); tx(ctx, Math.round((sp.share ?? .1) * 100) + '%', 204 + bw, yy, 12, th.fg3, 600); yy += 34; } }
  ctx.restore(); unlocal(ctx, prev);
}

// ---------- Slack ----------
function SL() {
  return { top: K('#350D36', INK.slackDk), side: K('#3F0E40', INK.slack), active: K('#1164A3', INK.blue), sideFg: K('#CFC3CF', '#E8D5E2'), wh: K('#FFFFFF', INK.white),
    main: K('#FFFFFF', INK.paper), fg: K('#1D1C1D', INK.ink), fg2: K('#616061', '#5A5263'), line: K('#DDDDDD', '#CDBFA6'), green: K('#007A5A', INK.green), badge: K('#CD2553', INK.red),
    hud: K('#1A1D21', INK.ink), dots: rgba(INK.pink, .45), mdots: rgba(INK.ink, .14) };
}
const SLAV = ['#E8912D', '#2BAC76', '#1264A3', '#E01E5A', '#7C3085', '#36C5F0', '#C2185B', '#4A8B2C'];
function slackAvatar(ctx, x, y, s, who, o = {}) {
  const name = o.name || nameOf(who), sq = rr(x, y, s, s, s * .22);
  if (o.photo) { face(ctx, sq, K(AVC[avIndex(who, name)][0], INK.paperDk), { line: 0 }); ctx.save(); clipPts(ctx, sq, false); webcam(ctx, [x, y, s, s], o.t ?? 0, who, { framing: 'avatar' }); ctx.restore(); inkFrame(ctx, sq, 2); return; }
  face(ctx, sq, K(SLAV[(AVWHO[who] ?? strHash(name)) % SLAV.length], [INK.orange, INK.green, INK.blue, INK.pink][strHash(name) % 4]), { line: 2 });
  tx(ctx, initialsOf(name), x + s / 2, y + s * .52, s * .4, K('#FFFFFF', INK.white), 700, { align: 'center' });
}
function slackWindow(ctx, box, t, o = {}) { return printed(ctx, o, c => slack_(c, box, t, o)); }
function slack_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 1100, Wn = w / z, Hn = h / z, c = SL(), prev = local(ctx, x, y, z), ws = o.workspace || 'Alignment Co.';
  const win = rr(0, 0, Wn, Hn, 8); if (o.shadow !== false) drop(ctx, win);
  face(ctx, win, c.top, { line: 4, dots: c.dots, max: .3 });
  ctx.save(); clipPts(ctx, win, false);
  // top bar: history, search, help
  const fgT = rgba(K('#FFFFFF', INK.white), .85);
  icon(ctx, 'back', 92, 20, 16, fgT); icon(ctx, 'back', 118, 20, 16, rgba('#FFFFFF', .4)); icon(ctx, 'clock', 146, 20, 16, fgT);
  const sw = Math.min(600, Wn * .46), sx = (Wn - sw) / 2, sb = rr(sx, 7, sw, 26, 6); face(ctx, sb, rgba(K('#FFFFFF', INK.white), .2), { line: 1.5 }); edge(ctx, sb, rgba('#FFFFFF', .25));
  icon(ctx, 'search', sx + 16, 20, 14, fgT); tx(ctx, `Search ${ws}`, sx + 32, 20, 13, fgT);
  icon(ctx, 'info', sx + sw + 24, 20, 16, fgT); winCtl(ctx, Wn, 0, 40, fgT);
  // rail
  const wsT = rr(15, 52, 40, 40, 9); face(ctx, wsT, K('#E8E2E8', INK.paper), { line: 2 }); tx(ctx, initialsOf(ws), 35, 72, 15, K('#4A154B', INK.ink), 800, { align: 'center' });
  [['home', 'Home', 1], ['dms', 'DMs'], ['bell', 'Activity'], ['more', 'More']].forEach(([ic, lab, on], i) => {
    const cy = 128 + i * 62; if (on) face(ctx, rr(19, cy - 16, 32, 32, 8), rgba('#FFFFFF', .22), { line: 0 }); icon(ctx, ic, 35, cy, 18, c.wh); tx(ctx, lab, 35, cy + 26, 11, c.wh, 600, { align: 'center' });
    if (i === 1 && o.dmBadge) { face(ctx, oval(46, cy - 14, 8), c.badge, { line: 1 }); tx(ctx, String(o.dmBadge), 46, cy - 13.5, 10, c.wh, 700, { align: 'center' }); } });
  slackAvatar(ctx, 19, Hn - 52, 32, o.me ?? 'dan'); presence(ctx, 49, Hn - 22, 4.5, 'available', c.top);
  // sidebar
  const X0 = 70, SW = 260, side = rr(X0, 40, SW, Hn - 46, [8, 0, 0, 8]);
  face(ctx, side, c.side, { line: 2, dots: c.dots, max: .3 });
  tx(ctx, fit(ctx, ws, 18, 800, SW - 70), X0 + 16, 66, 18, c.wh, 800); icon(ctx, 'chevron', X0 + 24 + Math.min(tw(ctx, ws, 18, 800), SW - 70), 67, 13, c.wh);
  face(ctx, oval(X0 + SW - 26, 66, 15), c.wh, { line: 1.5 }); icon(ctx, 'pencil', X0 + SW - 26, 66, 15, c.side);
  let ry = 106;
  for (const [ic, lab] of [['chat', 'Threads'], ['headphones', 'Huddles'], ['send', 'Drafts & sent']]) { icon(ctx, ic, X0 + 26, ry, 15, c.sideFg); tx(ctx, lab, X0 + 44, ry, 15, c.sideFg); ry += 28; }
  ry += 14; icon(ctx, 'chevron', X0 + 24, ry, 12, c.sideFg); tx(ctx, 'Channels', X0 + 40, ry, 15, c.sideFg, 600); ry += 30;
  const chans = o.channels || [{ name: 'general' }, { name: 'quick-sync', unread: true }, { name: 'random' }, { name: 'sync-about-syncs', unread: true, mention: 3 }, { name: 'announcements' }];
  const cur = o.dm ? null : o.channel || 'quick-sync';
  for (const ch of chans) {
    const on = ch.name === cur; if (on) face(ctx, rr(X0 + 8, ry - 14, SW - 16, 28, 6), c.active, { line: 1.5 });
    const col = on || ch.unread ? c.wh : c.sideFg, wt = on || ch.unread ? 700 : 400;
    icon(ctx, 'hash', X0 + 26, ry, 14, col); tx(ctx, fit(ctx, ch.name, 15, wt, SW - 90), X0 + 44, ry, 15, col, wt);
    if (ch.mention) { face(ctx, rr(X0 + SW - 46, ry - 9, 28, 18, 9), c.badge, { line: 1 }); tx(ctx, String(ch.mention), X0 + SW - 32, ry, 11, c.wh, 700, { align: 'center' }); }
    ry += 28;
  }
  ry += 14; icon(ctx, 'chevron', X0 + 24, ry, 12, c.sideFg); tx(ctx, 'Direct messages', X0 + 40, ry, 15, c.sideFg, 600); ry += 30;
  for (const who of o.dms || ['greg', 'linda', 'tasha', 'bob']) {
    const on = o.dm === who; if (on) face(ctx, rr(X0 + 8, ry - 14, SW - 16, 28, 6), c.active, { line: 1.5 });
    slackAvatar(ctx, X0 + 18, ry - 10, 20, who); tx(ctx, fit(ctx, nameOf(who), 15, 400, SW - 90), X0 + 46, ry, 15, on ? c.wh : c.sideFg); ry += 28;
  }
  if (o.huddle) huddle(ctx, X0 + 8, Hn - 6 - 140, SW - 16, t, o.huddle === true ? {} : o.huddle, cur || nameOf(o.dm), c);
  // main pane
  const mx = X0 + SW, mw = Wn - mx - 6, main = rr(mx, 40, mw, Hn - 46, [0, 8, 8, 0]);
  face(ctx, main, c.main, { line: 2, dots: c.mdots, max: .3 });
  ctx.save(); clipPts(ctx, main, false);
  const title = o.dm ? nameOf(o.dm) : cur;
  if (o.dm) slackAvatar(ctx, mx + 20, 54, 24, o.dm); else icon(ctx, 'hash', mx + 30, 66, 18, c.fg, { w: 2 });
  tx(ctx, fit(ctx, title, 18, 800, mw - 260), mx + 50, 66, 18, c.fg, 800); icon(ctx, 'chevron', mx + 60 + Math.min(tw(ctx, title, 18, 800), mw - 260), 67, 13, c.fg);
  const hud = !!o.huddle, hb = rr(mx + mw - 56, 52, 40, 28, 6);
  face(ctx, hb, hud ? c.green : c.main, { line: 1.5 }); edge(ctx, hb, c.line); icon(ctx, 'headphones', mx + mw - 36, 66, 17, hud ? c.wh : c.fg2);
  ['greg', 'linda', 'tasha'].forEach((q, i) => { const ax = mx + mw - 150 + i * 16; ctx.save(); fillPts(ctx, rr(ax - 1.5, 54.5, 25, 25, 6), c.main, false); slackAvatar(ctx, ax, 56, 22, q); ctx.restore(); });
  tx(ctx, String(o.members ?? 12), mx + mw - 90, 67, 13, c.fg2, 600);
  icon(ctx, 'chat', mx + 30, 99, 14, c.fg); tx(ctx, 'Messages', mx + 44, 99, 13, c.fg, 700); fillPts(ctx, rect(mx + 20, 113, 98, 2), c.fg, false);
  tx(ctx, 'Files', mx + 140, 99, 13, c.fg2, 600); icon(ctx, 'plus', mx + 194, 99, 13, c.fg2);
  rule(ctx, mx, 115, mx + mw, 115, c.line);
  // composer
  const cy = Hn - 6 - 112, cbx = rr(mx + 20, cy, mw - 40, 84, 8), ct = typedOf(o.compose, t);
  face(ctx, cbx, c.main, { line: 2 }); edge(ctx, cbx, K('#BBBBBB', INK.ink));
  ['bold', 'list', 'at'].forEach((ic, i) => icon(ctx, ic, mx + 40 + i * 30, cy + 18, 14, c.fg2));
  tx(ctx, ct ? ct + (caretOn(t) ? '|' : '') : `Message ${o.dm ? firstOf(nameOf(o.dm)) : '#' + cur}`, mx + 34, cy + 46, 15, ct ? c.fg : c.fg2);
  ['plus', 'react', 'at', 'video', 'mic'].forEach((ic, i) => icon(ctx, ic, mx + 40 + i * 30, cy + 70, 15, c.fg2));
  const sbx = rr(mx + mw - 64, cy + 56, 36, 24, 4); face(ctx, sbx, ct ? c.green : K('#F0F0F0', INK.paperDk), { line: 1.5 }); icon(ctx, 'send', mx + mw - 46, cy + 68, 14, ct ? c.wh : K('#B5B5B5', INK.ink));
  const ty = o.typing ? [].concat(o.typing) : [];
  if (ty.length) { const s = ty.length > 2 ? 'Several people are typing\u2026' : ty.map(q => firstOf(nameOf(q))).join(' and ') + (ty.length > 1 ? ' are typing\u2026' : ' is typing\u2026'); tx(ctx, s, mx + 24, cy + 98, 12, c.fg2, 600); }
  // messages, bottom-anchored
  const vis = (o.messages || []).filter(m => m.at == null || t >= m.at - 1 / 24), tw0 = mw - 100;
  const items = vis.map((m, i) => {
    const pm = vis[i - 1], grouped = !!pm && pm.who === m.who && !m.name === !pm.name, lines = wrap(ctx, m.text, 15, 400, tw0), rx = !!(m.reactions && m.reactions.length);
    return { m, grouped, lines, bh: (grouped ? 8 : 34) + lines.length * 22 + (rx ? 32 : 0) + 6, e: m.at == null ? 1 : easeOut(seg(t, m.at - 1 / 24, m.at + .2)) };
  });
  let yb = cy - 10;
  for (let i = items.length - 1; i >= 0 && yb > 116; i--) {
    const it = items[i], m = it.m; yb -= it.bh * it.e; const by = yb + (1 - it.e) * 10;
    ctx.save(); ctx.globalAlpha *= it.e;
    let ly = by + (it.grouped ? 12 : 38);
    if (!it.grouped) { slackAvatar(ctx, mx + 20, by + 8, 36, m.who, { name: m.name, photo: m.photo, t }); const nm = m.name || nameOf(m.who); tx(ctx, nm, mx + 68, by + 17, 15, c.fg, 800); tx(ctx, m.time || '9:41 AM', mx + 76 + tw(ctx, nm, 15, 800), by + 18, 12, c.fg2); }
    it.lines.forEach((l, j) => tx(ctx, l, mx + 68, ly + j * 22, 15, c.fg));
    let rx2 = mx + 68; const ry2 = ly + it.lines.length * 22;
    for (const r of m.reactions || []) { const s = String(r.n ?? 1), rw = 40 + tw(ctx, s, 12, 600), pb = rr(rx2, ry2 - 6, rw, 24, 12);
      face(ctx, pb, r.me ? K('#E8F5FA', INK.cyan) : K('#F4F4F4', INK.paperDk), { line: 1.5 }); edge(ctx, pb, r.me ? K('#1D9BD1', INK.blue) : c.line);
      tx(ctx, r.e, rx2 + 16, ry2 + 6, 14, c.fg, 400, { align: 'center' }); tx(ctx, s, rx2 + 29, ry2 + 6, 12, r.me ? K('#1264A3', INK.blue) : c.fg2, 600); rx2 += rw + 6; }
    ctx.restore(); yb -= 2;
  }
  ctx.restore(); ctx.restore(); unlocal(ctx, prev);
  return box;
}
function huddle(ctx, x, y, w, t, hu, where, c) {
  const card = rr(x, y, w, 132, 8); face(ctx, card, c.hud, { line: 2 }); edge(ctx, card, rgba('#FFFFFF', .12));
  icon(ctx, 'headphones', x + 18, y + 20, 15, K('#2BAC76', INK.green)); tx(ctx, fit(ctx, (where && !where.includes(' ') ? '#' : '') + where, 13, 700, w - 90), x + 34, y + 20, 13, c.wh, 700);
  tx(ctx, hu.time || '12:04', x + w - 14, y + 20, 12, rgba('#FFFFFF', .6), 600, { align: 'right' });
  (hu.who || ['greg', 'dan', 'linda', 'tasha']).slice(0, 5).forEach((q, i) => { const ax = x + 14 + i * 40; slackAvatar(ctx, ax, y + 40, 32, q); if (q === (hu.speaking ?? 'greg')) ring(ctx, rr(ax - 3, y + 37, 38, 38, 9), K('#2BAC76', INK.green), 2.5); });
  ['mic', 'video', 'share', 'react'].forEach((ic, i) => { const bx = x + 26 + i * 38; face(ctx, oval(bx, y + 106, 14), rgba('#FFFFFF', .12), { line: 1 }); icon(ctx, ic, bx, y + 106, 15, c.wh, { off: ic === 'mic' }); });
  const lb = rr(x + w - 70, y + 92, 58, 28, 14); face(ctx, lb, K('#E01E5A', INK.red), { line: 1.5 }); tx(ctx, 'Leave', x + w - 41, y + 106, 12, c.wh, 700, { align: 'center' });
}
// Slack desktop notification (Windows 11 toast).
function slackNotif(ctx, x, y, w, t, o = {}) { return printed(ctx, o, c => snotif_(c, x, y, w, t, o)); }
function snotif_(ctx, x, y, w, t, o) {
  const t0 = o.t0 ?? 0; if (t < t0 || (o.until != null && t > o.until + .3)) return null;
  const z = w / 364, th = TT(true), dx = (1 - backOut(seg(t, t0, t0 + .34), 1.3)) * (w + 60) / z + (o.until != null ? easeIn(seg(t, o.until, o.until + .3)) * (w + 60) / z : 0), H = 128;
  const prev = local(ctx, x, y, z); ctx.translate(dx, 0);
  const card = rr(0, 0, 364, H, 8); drop(ctx, card); face(ctx, card, K('#2B2B2B', '#2A2140'), { line: 3, dots: th.dots, max: .16 }); edge(ctx, card, th.stroke);
  slackLogo(ctx, 24, 20, 15); tx(ctx, 'Slack', 40, 20, 12, th.fg2); icon(ctx, 'more', 316, 20, 16, th.fg3); icon(ctx, 'close', 342, 20, 13, th.fg3);
  slackAvatar(ctx, 16, 44, 44, o.who, { name: o.name, photo: o.photo, t });
  const nm = o.name || nameOf(o.who), title = o.channel ? `${nm} in #${o.channel}` : nm;
  tx(ctx, fit(ctx, title, 14, 700, 270), 74, 54, 14, th.fg, 700);
  wrap(ctx, o.text || '', 14, 400, 272, 3).forEach((l, i) => tx(ctx, l, 74, 76 + i * 19, 14, th.fg2));
  unlocal(ctx, prev);
  return [x + dx * z, y, w, H * z];
}

// ---------- Zoom ----------
function ZM() {
  return { bg: K('#1A1A1A', INK.ink), bar: K('#242424', '#221C2C'), tile: K('#2B2B2B', '#2A2238'), fg: K('#FFFFFF', INK.white), fg2: K('#D0D0D0', '#E0D6C6'),
    red: K('#E02828', INK.red), green: K('#24B04B', INK.green), blue: K('#0B5CFF', INK.blue), speak: K('#2ED158', INK.yellow), dots: rgba(INK.blue, .55) };
}
function zoomCall(ctx, box, t, o = {}) { return printed(ctx, o, c => zoom_(c, box, t, o)); }
function zoom_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 1280, c = ZM(), Wn = w / z, Hn = h / z, out = [];
  const win = rr(x, y, w, h, 8 * z); if (o.shadow !== false) drop(ctx, win); face(ctx, win, c.bg, { line: 4, dots: c.dots, max: .3, sp: 16 });
  ctx.save(); clipPts(ctx, win, false);
  let prev = local(ctx, x, y, z);
  zoomLogo(ctx, 18, 16, 16); tx(ctx, 'Zoom Meeting', 34, 16, 12, c.fg2); winCtl(ctx, Wn, 0, 32, c.fg2);
  if (o.waiting) {
    const pg = rect(0, 32, Wn, Hn - 32); face(ctx, pg, K('#FFFFFF', INK.paper), { line: 0, dots: rgba(INK.ink, .15), max: .3 });
    const fg = K('#232333', INK.ink), cy = Hn * .42, host = o.waiting === 'host';
    zoomLogo(ctx, Wn / 2, cy - 92, 64);
    tx(ctx, host ? 'Waiting for the host to start this meeting.' : 'Please wait, the meeting host will let you in soon.', Wn / 2, cy, 22, fg, 700, { align: 'center' });
    tx(ctx, o.title || 'Quick sync', Wn / 2, cy + 38, 16, K('#6E7680', '#5A5263'), 400, { align: 'center' });
    const bw = 220, bb = rr(Wn / 2 - bw / 2, Hn - 84, bw, 40, 8); face(ctx, bb, K('#FFFFFF', INK.paper), { line: 2 }); edge(ctx, bb, K('#BAC0C8', INK.ink)); tx(ctx, 'Test Computer Audio', Wn / 2, Hn - 64, 14, fg, 600, { align: 'center' });
    unlocal(ctx, prev); ctx.restore(); return out;
  }
  icon(ctx, 'shield', 20, 50, 16, c.green); icon(ctx, 'info', 42, 50, 15, c.fg2);
  if (o.recording) { fillPts(ctx, oval(66, 50, 5), c.red, false); tx(ctx, 'Recording\u2026', 76, 50, 12, c.fg, 600); }
  if (o.timer != null) tx(ctx, fmtTimer(o.timer), Wn / 2, 50, 13, c.fg2, 600, { align: 'center' });
  icon(ctx, 'view', Wn - 66, 50, 15, c.fg2); tx(ctx, 'View', Wn - 54, 50, 12, c.fg2, 600);
  // toolbar
  const ty = Hn - 64; face(ctx, rect(0, ty, Wn, 64), c.bar, { line: 0, reg: .5 });
  const tool = (cx, ic, label, opt = {}) => {
    if (opt.green) { face(ctx, rr(cx - 13, ty + 9, 26, 24, 5), c.green, { line: 1.5 }); icon(ctx, 'arrowUp', cx, ty + 21, 16, c.fg, { w: 2 }); }
    else icon(ctx, ic, cx, ty + 21, 22, opt.off ? c.red : c.fg2, { off: opt.off, bg: c.bar });
    if (opt.chev) icon(ctx, 'chevronUp', cx + 20, ty + 13, 10, c.fg2);
    if (opt.count != null) tx(ctx, opt.count, cx + 14, ty + 11, 10, c.fg, 700);
    tx(ctx, label, cx, ty + 48, 11, c.fg2, 400, { align: 'center' });
  };
  tool(36, 'mic', o.muted ? 'Unmute' : 'Mute', { chev: true, off: o.muted }); tool(108, 'camera', o.video === false ? 'Start Video' : 'Stop Video', { chev: true, off: o.video === false });
  const mid = [['people', 'Participants', { count: String(o.participants ?? (o.tiles || []).length) }], ['chat', 'Chat'], ['share', 'Share Screen', { green: true }], ['record', 'Record'], ['smileAdd', 'Reactions']];
  mid.forEach(([ic, lab, opt], i) => tool(Wn / 2 + (i - 2) * 92, ic, lab, opt));
  const eb = rr(Wn - 76, ty + 16, 60, 32, 8); face(ctx, eb, c.red, { line: 2 }); tx(ctx, o.leave ? 'Leave' : 'End', Wn - 46, ty + 32, 14, c.fg, 700, { align: 'center' });
  unlocal(ctx, prev);
  // gallery
  const tiles = o.tiles || [], gap = 4 * z, boxes = gridBoxes(tiles.length, x + 8 * z, y + 66 * z, w - 16 * z, h - 138 * z, gap);
  tiles.forEach((tl, i) => {
    const [bx, by, bw, bh] = boxes[i], sq = rect(bx, by, bw, bh), name = tl.name || nameOf(tl.who).replace(/ \(.*\)/, '');
    face(ctx, sq, c.tile, { line: 0, dots: c.dots, max: .3 });
    ctx.save(); clipPts(ctx, sq, false); const st = STYLE; if (tl.look != null) look(tl.look);
    if (tl.draw) tl.draw(ctx, boxes[i], t); else if (tl.camOff) tx(ctx, fit(ctx, name, Math.min(bh * .11, 40 * z), 600, bw * .9), bx + bw / 2, by + bh / 2, Math.min(bh * .11, 40 * z), c.fg, 600, { align: 'center' });
    else webcam(ctx, boxes[i], tl.frozen != null && tl.frozen !== false ? (typeof tl.frozen === 'number' ? Math.min(t, tl.frozen) : 0) : t, tl.who, tl);
    STYLE = st; ctx.restore(); inkFrame(ctx, sq, 3);
    if (tl.speaking) ring(ctx, rect(bx + 1.5 * z, by + 1.5 * z, bw - 3 * z, bh - 3 * z), c.speak, 3 * z);
    const ls = 12 * z, lw = tw(ctx, name, ls, 400) + (tl.muted ? 30 : 12) * z, lx = bx + 4 * z, ly = by + bh - 26 * z;
    face(ctx, rect(lx, ly, lw, 22 * z), rgba(K('#000000', INK.ink), lerp(.6, 1, STYLE.k)), { line: 1.2 });
    if (tl.muted) icon(ctx, 'mic', lx + 12 * z, ly + 11 * z, 14 * z, c.red, { off: true });
    tx(ctx, name, lx + (tl.muted ? 24 : 6) * z, ly + 11 * z, ls, c.fg);
    out[i] = boxes[i];
  });
  ctx.restore();
  return out;
}

// ---------- Outlook ----------
function OL() {
  return { brand: K('#0078D4', INK.blue), brandDk: K('#005A9E', INK.blueDk), light: K('#C7E0F4', INK.cyan), lighter: K('#DEECF9', INK.paper), evText: K('#004578', INK.ink),
    bg: K('#FFFFFF', INK.paper), bg2: K('#FAF9F8', INK.paper), bg3: K('#F3F2F1', INK.paperDk), fg: K('#323130', INK.ink), fg2: K('#605E5C', '#5A5263'),
    line: K('#EDEBE9', '#D9CBB0'), line2: K('#C8C6C4', '#B3A487'), wh: K('#FFFFFF', INK.white), dots: rgba(INK.ink, .15), green: K('#107C10', INK.green), red: K('#C50F1F', INK.red), purple: K('#8764B8', INK.purple) };
}
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function outlookCalendar(ctx, box, t, o = {}) { return printed(ctx, o, c => cal_(c, box, t, o)); }
function cal_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 1280, c = OL(), Wn = w / z, Hn = h / z, prev = local(ctx, x, y, z), out = [];
  const win = rr(0, 0, Wn, Hn, 8); if (o.shadow !== false) drop(ctx, win); face(ctx, win, c.bg, { line: 4, dots: c.dots, max: .25 });
  ctx.save(); clipPts(ctx, win, false);
  // header
  face(ctx, rect(0, 0, Wn, 48), c.brand, { line: 0, reg: .5, dots: rgba(INK.ink, .3), max: .3 });
  icon(ctx, 'waffle', 24, 24, 16, c.wh); tx(ctx, 'Outlook', 48, 24, 16, c.wh, 600);
  const sw = Math.min(460, Wn * .36), sx = (Wn - sw) / 2; face(ctx, rr(sx, 9, sw, 30, 4), K('#DEECF9', INK.paper), { line: 1.5 }); icon(ctx, 'search', sx + 18, 24, 14, c.brandDk); tx(ctx, 'Search', sx + 34, 24, 13, c.brandDk);
  ['bell', 'gear'].forEach((ic, i) => icon(ctx, ic, Wn - 110 + i * 36, 24, 17, c.wh)); avatar_(ctx, Wn - 30, 24, 14, o.me ?? 'dan', {});
  // rail
  face(ctx, rect(0, 48, 48, Hn - 48), c.bg3, { line: 0 });
  ['mail', 'calendar', 'people', 'check'].forEach((ic, i) => { const cy = 76 + i * 44; if (i === 1) fillPts(ctx, rr(0, cy - 14, 3, 28, 1.5), c.brand, false); icon(ctx, ic, 24, cy, 19, i === 1 ? c.brand : c.fg2); });
  // nav pane
  let gx = 48;
  if (o.nav ?? Wn > 980) {
    const nb = rr(64, 62, 188, 34, 4); face(ctx, nb, c.brand, { line: 2 }); icon(ctx, 'calendar', 84, 79, 15, c.wh); tx(ctx, 'New event', 100, 79, 14, c.wh, 600);
    tx(ctx, 'October 2026', 64, 124, 14, c.fg, 600);
    'SMTWTFS'.split('').forEach((d, i) => tx(ctx, d, 72 + i * 26, 150, 11, c.fg2, 400, { align: 'center' }));
    const d0 = o.date ?? 5, td = d0 + (o.today ?? 2);
    for (let d = 1; d <= 31; d++) { const cell = d + 3, cx = 72 + (cell % 7) * 26, cy = 174 + Math.floor(cell / 7) * 24; if (d === td) { fillPts(ctx, oval(cx, cy, 11), c.brand, false); } tx(ctx, String(d), cx, cy, 12, d === td ? c.wh : c.fg, d === td ? 600 : 400, { align: 'center' }); }
    tx(ctx, 'My calendars', 64, 330, 13, c.fg, 600);
    [['Calendar', c.brand, 1], ['Birthdays', K('#8764B8', INK.purple)], ['United States holidays', K('#038387', INK.green)]].forEach(([s, col, on], i) => {
      const cy = 358 + i * 28, bx = rr(66, cy - 8, 16, 16, 3); face(ctx, bx, on ? col : c.bg, { line: 1 }); edge(ctx, bx, col, 1.5); if (on) icon(ctx, 'check', 74, cy, 12, c.wh, { w: 2.4 }); tx(ctx, s, 92, cy, 13, c.fg); });
    gx = 268;
  }
  // command bar
  const views = ['Day', 'Work week', 'Week', 'Month'], vi = (o.days ?? 5) === 1 ? 0 : (o.days ?? 5) === 7 ? 2 : 1;
  let vx = gx + 16; views.forEach((v, i) => { const vw = tw(ctx, v, 13, i === vi ? 600 : 400); tx(ctx, v, vx, 72, 13, i === vi ? c.fg : c.fg2, i === vi ? 600 : 400); if (i === vi) fillPts(ctx, rr(vx, 86, vw, 2.5, 1), c.brand, false); vx += vw + 26; });
  const tb = rr(Wn - 250, 58, 64, 28, 4); face(ctx, tb, c.bg, { line: 1.5 }); edge(ctx, tb, c.line2); tx(ctx, 'Today', Wn - 218, 72, 13, c.fg, 600, { align: 'center' });
  icon(ctx, 'back', Wn - 166, 72, 13, c.fg2); ctx.save(); ctx.translate(Wn - 138, 72); ctx.scale(-1, 1); icon(ctx, 'back', 0, 0, 13, c.fg2); ctx.restore();
  tx(ctx, 'October 2026', Wn - 114, 72, 14, c.fg, 600);
  rule(ctx, gx, 96, Wn, 96, c.line);
  // grid
  const days = Array.isArray(o.days) ? o.days : Array.from({ length: o.days ?? 5 }, (_, i) => { const d = (o.date ?? 5) + i; return `${d} ${WD[(d + 3) % 7]}`; });
  const nD = days.length, from = o.from ?? 8, to = o.to ?? 18, top = 152, colX = gx + 56, colW = (Wn - colX - 12) / nD, hh = (Hn - top - 8) / (to - from), today = o.today ?? 2;
  days.forEach((d, i) => {
    const cx = colX + i * colW, [num, ...rest] = String(d).split(' '), on = i === today;
    if (on) fillPts(ctx, rect(cx, 100, colW, 3), c.brand, false);
    tx(ctx, num, cx + 10, 124, 22, on ? c.brand : c.fg, on ? 700 : 400); tx(ctx, rest.join(' '), cx + 14 + tw(ctx, num, 22, on ? 700 : 400), 127, 13, on ? c.brand : c.fg2, on ? 600 : 400);
    rule(ctx, cx, 100, cx, Hn, c.line);
  });
  rule(ctx, colX, top, Wn, top, c.line2);
  for (let hr = from; hr <= to; hr++) { const yy = top + (hr - from) * hh; if (hr > from) rule(ctx, colX - 6, yy, Wn, yy, c.line); if (hr < to) tx(ctx, `${(hr + 11) % 12 + 1} ${hr < 12 ? 'AM' : 'PM'}`, colX - 10, yy + 10, 11, c.fg2, 400, { align: 'right' }); }
  ctx.save(); clipPts(ctx, rect(colX, top, Wn - colX, Hn - top), false);
  // events: overlapping events in a day split the column
  const evs = (o.events || []).map((e, i) => ({ ...e, i })).filter(e => e.at == null || t >= e.at - 1 / 24);
  for (let d = 0; d < nD; d++) {
    const list = evs.filter(e => (e.day ?? 0) === d).sort((a, b) => a.start - b.start || a.i - b.i), cols = [];
    for (const e of list) { let k = cols.findIndex(endT => endT <= e.start + 1e-6); if (k < 0) { k = cols.length; cols.push(0); } cols[k] = e.end; e.col = k; }
    for (const e of list) {
      const group = list.filter(q => q.start < e.end && q.end > e.start), n = Math.max(...group.map(q => q.col)) + 1;
      const ex = colX + d * colW + 2 + e.col * (colW - 6) / n, ew = (colW - 6) / n - 2, ey = top + (e.start - from) * hh + 1, eh = Math.max(10, (e.end - e.start) * hh - 2);
      const k = e.at == null ? 1 : backOut(seg(t, e.at - 1 / 24, e.at + .24), 2.2);
      ctx.save(); ctx.translate(ex, ey); ctx.scale(k, k); ctx.globalAlpha *= clamp(k * 3);
      face(ctx, rr(0, 0, ew, eh, 4), c.light, { line: 2, dots: rgba(INK.blue, .45), max: .4, sp: 12 }); fillPts(ctx, rr(0, 0, 4, eh, [4, 0, 0, 4]), c.brand, false);
      const fs = clamp(eh * .45, 9, 13);
      ctx.save(); clipPts(ctx, rect(0, 0, ew - 3, eh), false);
      tx(ctx, fit(ctx, e.title || 'Quick sync', fs, 600, ew - 14), 10, Math.min(eh / 2, 12), fs, c.evText, 600);
      if (eh > 34) tx(ctx, fit(ctx, e.where || `${fmtH(e.start)} \u2013 ${fmtH(e.end)}`, 11, 400, ew - 14), 10, 29, 11, c.evText);
      ctx.restore(); ctx.restore();
      out.push([x + ex * z, y + ey * z, ew * z, eh * z]);
    }
  }
  if (o.now != null && o.now >= from && o.now <= to) { const ny = top + (o.now - from) * hh, nx = colX + today * colW; fillPts(ctx, rect(nx, ny - 1, colW, 2), c.brandDk, false); fillPts(ctx, oval(nx + 1, ny, 5), c.brandDk, false); }
  ctx.restore(); ctx.restore(); unlocal(ctx, prev);
  return out;
}
// Meeting invite (reading pane card).
function outlookInvite(ctx, x, y, w, t, o = {}) { return printed(ctx, o, c => invite_(c, x, y, w, t, o)); }
function invite_(ctx, x, y, w, t, o) {
  const z = w / 480, c = OL(), att = (o.attendees || ['greg', 'dan', 'linda', 'tasha', 'bob']).map(a => typeof a === 'object' && a && 'who' in a ? a : { who: a });
  const H = 214 + att.length * 36, k = o.t0 == null ? 1 : backOut(seg(t, o.t0, o.t0 + .3), 1.8); if (k <= 0) return null;
  const prev = local(ctx, x + w / 2, y + H * z / 2, z * k); ctx.translate(-240, -H / 2); ctx.globalAlpha *= clamp(k * 3);
  const card = rr(0, 0, 480, H, 8); drop(ctx, card); face(ctx, card, c.bg, { line: 3, dots: c.dots, max: .16 }); edge(ctx, card, c.line2);
  fillPts(ctx, rr(0, 0, 480, 6, [8, 8, 0, 0]), c.brand, false);
  icon(ctx, 'calendar', 32, 38, 20, c.brand); tx(ctx, fit(ctx, o.title || 'Quick sync \uD83D\uDE42', 20, 700, 400), 54, 38, 20, c.fg, 700);
  icon(ctx, 'clock', 32, 72, 16, c.fg2); const when = o.when || 'Wed 10/7/2026 9:00 AM \u2013 9:15 AM'; tx(ctx, when, 54, 72, 14, c.fg);
  const dur = o.dur || '15 min', dw = tw(ctx, dur, 12, 600) + 18, dx = 62 + tw(ctx, when, 14, 400); face(ctx, rr(dx, 61, dw, 22, 11), c.lighter, { line: 1.5 }); tx(ctx, dur, dx + 9, 72, 12, c.brandDk, 600);
  teamsLogo(ctx, 32, 102, 16); tx(ctx, 'Microsoft Teams meeting', 54, 102, 14, c.fg); tx(ctx, 'Join', 72 + tw(ctx, 'Microsoft Teams meeting', 14, 400), 102, 14, c.brand, 700);
  const pressed = o.press && (o.pressAt == null || t >= o.pressAt - 1 / 24), pk = o.pressAt != null ? clamp((t - o.pressAt) / .12) : 1, res = {};
  [['accept', 'Accept', 'check', c.green, K('#DFF6DD', INK.greenLt)], ['tentative', 'Tentative', 'info', c.purple, K('#EFE6F7', INK.pinkLt)], ['decline', 'Decline', 'close', c.red, K('#FDE7E9', INK.pinkLt)]].forEach(([id, lab, ic, col, bgc], i) => {
    const bx = 24 + i * 148, on = pressed && o.press === id, s = on ? 1 - .06 * Math.sin(pk * Math.PI) : 1;
    ctx.save(); ctx.translate(bx + 68, 142); ctx.scale(s, s); ctx.translate(-bx - 68, -142);
    const b = rr(bx, 126, 136, 32, 4); face(ctx, b, on ? bgc : c.bg, { line: 2 }); edge(ctx, b, on ? col : c.line2, on ? 2 : 1);
    icon(ctx, ic, bx + 20, 142, 15, col, { w: 2 }); tx(ctx, lab, bx + 34, 142, 13, c.fg, 600); icon(ctx, 'chevron', bx + 120, 142, 11, c.fg2);
    ctx.restore(); res[id] = [x + bx * z, y + 126 * z, 136 * z, 32 * z];
  });
  rule(ctx, 24, 178, 456, 178, c.line);
  tx(ctx, `Attendees (${att.length})`, 24, 198, 13, c.fg2, 600);
  att.forEach((a, i) => {
    const ay = 228 + i * 36, nm = a.name || nameOf(a.who); avatar_(ctx, 38, ay, 13, a.who, { name: nm });
    tx(ctx, fit(ctx, nm + (i === 0 && o.organizer == null ? '  \u00B7  Organizer' : ''), 14, 400, 340), 60, ay, 14, c.fg);
    const st = a.status || (i === 0 ? 'yes' : 'none'); if (st === 'yes') icon(ctx, 'check', 448, ay, 14, c.green, { w: 2.2 }); else if (st === 'maybe') icon(ctx, 'info', 448, ay, 14, c.purple); else ring(ctx, oval(448, ay, 6), c.line2, 1.5);
  });
  unlocal(ctx, prev);
  res.card = [x, y, w, H * z];
  return res;
}
// Email compose window (desktop Outlook layout: big Send button left of To/Cc).
function emailCompose(ctx, box, t, o = {}) { return printed(ctx, o, c => compose_(c, box, t, o)); }
function compose_(ctx, box, t, o) {
  const [x, y, w, h] = box, z = o.zoom ?? w / 800, c = OL(), Wn = w / z, Hn = h / z, prev = local(ctx, x, y, z), subj = o.subject ?? 'Quick question';
  const win = rr(0, 0, Wn, Hn, 8); if (o.shadow !== false) drop(ctx, win); face(ctx, win, c.bg, { line: 4, dots: c.dots, max: .25 });
  ctx.save(); clipPts(ctx, win, false);
  face(ctx, rect(0, 0, Wn, 32), c.brand, { line: 0, reg: .5 }); outlookLogo(ctx, 18, 16, 16); tx(ctx, fit(ctx, `${subj || '(No subject)'} - Message (HTML)`, 12, 400, Wn - 200), 34, 16, 12, c.wh); winCtl(ctx, Wn, 0, 32, c.wh);
  face(ctx, rect(0, 32, Wn, 72), c.bg3, { line: 0 });
  let tx_ = 16; ['File', 'Message', 'Insert', 'Options', 'Format Text', 'Review'].forEach((s, i) => { const sw = tw(ctx, s, 12, i === 1 ? 600 : 400); tx(ctx, s, tx_, 46, 12, i === 1 ? c.brandDk : c.fg, i === 1 ? 600 : 400); if (i === 1) fillPts(ctx, rect(tx_, 56, sw, 2), c.brand, false); tx_ += sw + 22; });
  ['plus', 'bold', 'list', 'at', 'calendar', 'mail'].forEach((ic, i) => icon(ctx, ic, 24 + i * 34, 82, 16, c.fg2));
  const fb = rr(230, 70, 120, 24, 2); face(ctx, fb, c.bg, { line: 1 }); edge(ctx, fb, c.line2); tx(ctx, 'Aptos', 238, 82, 12, c.fg); tx(ctx, '11', 336, 82, 12, c.fg, 400, { align: 'right' });
  rule(ctx, 0, 104, Wn, 104, c.line2);
  // send + header fields
  const sent = o.send != null && t >= o.send - 1 / 24, sp = sent ? Math.sin(clamp((t - o.send) / .25) * Math.PI) : 0, S = [16, 116, 72, 72];
  ctx.save(); ctx.translate(52, 152); ctx.scale(1 - sp * .08, 1 - sp * .08); ctx.translate(-52, -152);
  face(ctx, rr(...S, 4), sent ? c.brandDk : c.brand, { line: 2.5 }); icon(ctx, 'send', 52, 140, 22, c.wh, { w: 1.8 }); tx(ctx, 'Send', 52, 170, 13, c.wh, 600, { align: 'center' });
  ctx.restore();
  const fx0 = 100, rows = [['To', o.to || ['greg']], ['Cc', o.cc || []]];
  rows.forEach(([lab, list], i) => {
    const ry = 116 + i * 38, lb = rr(fx0, ry, 52, 30, 3); face(ctx, lb, c.bg, { line: 1.5 }); edge(ctx, lb, c.line2); tx(ctx, lab, fx0 + 26, ry + 15, 13, c.fg, 400, { align: 'center' });
    rule(ctx, fx0 + 60, ry + 32, Wn - 16, ry + 32, c.line);
    let cx = fx0 + 66; for (const r of list) { const nm = typeof r === 'string' && !NAMES[r] ? r : nameOf(r), cw = tw(ctx, nm, 13, 400) + 40; face(ctx, rr(cx, ry + 3, cw, 24, 12), c.bg3, { line: 1.2 }); avatar_(ctx, cx + 12, ry + 15, 9, r, { name: nm }); tx(ctx, nm, cx + 26, ry + 15, 13, c.fg); cx += cw + 6; }
  });
  tx(ctx, subj ? subj : 'Add a subject', fx0 + 4, 208, 15, subj ? c.fg : c.fg2, subj ? 600 : 400); rule(ctx, fx0, 224, Wn - 16, 224, c.line);
  // body
  const body = o.body || '', shown = o.cps ? typed(body, t, o.t0 ?? 0, o.cps, false) : body, typing = o.cps && shown.length < body.length;
  const lines = wrap(ctx, shown, 15, 400, Wn - 56); let by = 254;
  lines.forEach((l, i) => { tx(ctx, l, 24, by, 15, c.fg); if (i === lines.length - 1 && (typing || !sent) && caretOn(t)) fillPts(ctx, rect(26 + tw(ctx, l, 15, 400), by - 10, 1.5, 20), c.fg, false); by += 24; });
  ctx.restore(); unlocal(ctx, prev);
  return [x + S[0] * z, y + S[1] * z, S[2] * z, S[3] * z];
}

// ---------- PowerPoint ----------
function PP() { return { brand: K('#C43E1C', INK.orange), title: K('#B7472A', INK.orange), ribbon: K('#F3F2F1', INK.paperDk), canvas: K('#E6E6E6', INK.paperDk), wh: K('#FFFFFF', INK.white), slide: K('#FFFFFF', INK.paper), fg: K('#262626', INK.ink), fg2: K('#605E5C', '#5A5263'), line: K('#D2D0CE', '#BDAE92'), dark: K('#262626', INK.ink), dots: rgba(INK.ink, .15) }; }
// The slide itself at [x, y, w, w * 9/16].
function slideArt(ctx, sb, t, o, c) {
  const [x, y, w] = sb, h = w * 9 / 16, u = w / 100, pts = rect(x, y, w, h);
  drop(ctx, pts, { a: .6 }); face(ctx, pts, c.slide, { line: 2.5, dots: c.dots, max: .2 });
  fillPts(ctx, rect(x, y, w * .018, h), c.brand, false);
  tx(ctx, o.title ?? 'CONTEXT', x + 7 * u, y + 13 * u * .9, 7.4 * u, c.fg, 800, { stretch: -1 });
  fillPts(ctx, rect(x + 7 * u, y + 17.5 * u, 9 * u, .7 * u), c.brand, false);
  let by = y + 24.5 * u;
  for (const b of o.bullets || ['We need to align on this', 'See previous slide for context', "Let's circle back offline"]) {
    const s = typeof b === 'string' ? b : b.s, at = typeof b === 'string' ? null : b.at, e = at == null ? 1 : easeOut(seg(t, at - 1 / 24, at + .2)); if (e <= 0) continue;
    ctx.save(); ctx.globalAlpha *= e; fillPts(ctx, oval(x + 8.3 * u, by, .55 * u), c.brand, false); tx(ctx, s, x + 10.5 * u, by, 3.4 * u, c.fg); ctx.restore(); by += 6.6 * u;
  }
  tx(ctx, 'Q4 Alignment  \u00B7  Confidential', x + 7 * u, y + h - 3 * u, 1.6 * u, c.fg2); tx(ctx, String(o.n ?? 3), x + w - 4 * u, y + h - 3 * u, 1.6 * u, c.fg2, 400, { align: 'right' });
}
function pptSlide(ctx, box, t, o = {}) { return printed(ctx, o, c => ppt_(c, box, t, o)); }
function ppt_(ctx, box, t, o) {
  const [x, y, w, h] = box, c = PP(), view = o.view || (o.presenter ? 'presenter' : 'edit'), n = o.n ?? 3, total = o.total ?? 47;
  if (view === 'show') { const sb = fitBox(box, 16 / 9); slideArt(ctx, sb, t, o, c); return sb; }
  const z = o.zoom ?? w / 1280, Wn = w / z, Hn = h / z, prev = local(ctx, x, y, z);
  const win = rr(0, 0, Wn, Hn, 8); if (o.shadow !== false) drop(ctx, win);
  let sb;
  if (view === 'presenter') {
    face(ctx, win, c.dark, { line: 4, dots: rgba(INK.orange, .4), max: .3 }); ctx.save(); clipPts(ctx, win, false);
    const fg = K('#FFFFFF', INK.white), fg2 = K('#BDBDBD', '#D8CCB8');
    ['Show Taskbar', 'Display Settings', 'End Slide Show'].forEach((s, i) => tx(ctx, s, 24 + i * 150, 22, 12, fg2));
    tx(ctx, fmtTimer(o.timer ?? 754).replace(/^00:/, '0:'), 24, 64, 30, fg, 600); icon(ctx, 'pause', 168, 64, 18, fg2);
    tx(ctx, o.clock || '12:01 PM', Wn * .62, 64, 30, fg, 600, { align: 'right' });
    const cw = Wn * .6; sb = [24, 96, cw - 24]; slideArt(ctx, sb, t, o, c);
    tx(ctx, 'Next slide', cw + 24, 104, 14, fg2, 600);
    slideArt(ctx, [cw + 24, 120, Wn - cw - 48], t, { title: o.nextTitle || 'MORE CONTEXT', bullets: ['(see appendix)'], n: n + 1 }, c);
    wrap(ctx, o.notes || 'Ask Dan what he thinks. Then explain it again.', 20, 400, Wn - cw - 48, 6).forEach((l, i) => tx(ctx, l, cw + 24, 140 + (Wn - cw - 48) * 9 / 16 + 28 + i * 28, 20, fg));
    const ny = Hn - 34; icon(ctx, 'back', Wn * .3 - 70, ny, 16, fg2); tx(ctx, `Slide ${n} of ${total}`, Wn * .3, ny, 14, fg, 600, { align: 'center' });
    ctx.save(); ctx.translate(Wn * .3 + 70, ny); ctx.scale(-1, 1); icon(ctx, 'back', 0, 0, 16, fg2); ctx.restore();
    ctx.restore(); unlocal(ctx, prev); return [x + sb[0] * z, y + sb[1] * z, sb[2] * z, sb[2] * z * 9 / 16];
  }
  face(ctx, win, c.canvas, { line: 4, dots: c.dots, max: .25 }); ctx.save(); clipPts(ctx, win, false);
  face(ctx, rect(0, 0, Wn, 34), c.title, { line: 0, reg: .5, dots: rgba(INK.ink, .3), max: .3 });
  tx(ctx, 'AutoSave', 16, 17, 12, c.wh); face(ctx, rr(74, 9, 32, 16, 8), rgba('#FFFFFF', .25), { line: 0 }); fillPts(ctx, oval(83, 17, 5), c.wh, false); tx(ctx, 'Off', 112, 17, 11, c.wh);
  tx(ctx, `${o.file || 'Q4_Alignment_FINAL_v7'} \u2022 Saved`, Wn / 2, 17, 12, c.wh, 400, { align: 'center' }); winCtl(ctx, Wn, 0, 34, c.wh);
  face(ctx, rect(0, 34, Wn, 98), c.ribbon, { line: 0 });
  let tx_ = 16; ['File', 'Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Record', 'Review', 'View'].forEach((s, i) => { const sw = tw(ctx, s, 13, i === 1 ? 600 : 400); tx(ctx, s, tx_, 50, 13, i === 1 ? c.brand : c.fg, i === 1 ? 600 : 400); if (i === 1) fillPts(ctx, rect(tx_, 62, sw, 2.5), c.brand, false); tx_ += sw + 22; });
  const rb = rr(10, 70, Wn - 20, 56, 6); face(ctx, rb, c.wh, { line: 1.5 }); edge(ctx, rb, c.line);
  [['Paste', 'plus'], ['New Slide', 'view']].forEach(([s, ic], i) => { icon(ctx, ic, 40 + i * 70, 88, 20, c.fg2); tx(ctx, s, 40 + i * 70, 114, 11, c.fg, 400, { align: 'center' }); });
  const fb = rr(170, 80, 150, 22, 2); face(ctx, fb, c.wh, { line: 1 }); edge(ctx, fb, c.line); tx(ctx, 'Aptos (Body)', 178, 91, 12, c.fg); const sz = rr(326, 80, 40, 22, 2); face(ctx, sz, c.wh, { line: 1 }); edge(ctx, sz, c.line); tx(ctx, '28', 346, 91, 12, c.fg, 400, { align: 'center' });
  ['B', 'I', 'U', 'S'].forEach((s, i) => tx(ctx, s, 182 + i * 24, 114, 13, c.fg, s === 'B' ? 800 : 400, { align: 'center', italic: s === 'I' }));
  ['list', 'list', 'view', 'sparkle'].forEach((ic, i) => icon(ctx, ic, 400 + i * 34, 96, 18, i === 3 ? c.brand : c.fg2));
  tx(ctx, 'Designer', 502 + 3 * 34 - 34, 116, 11, c.fg, 400, { align: 'center' });
  // thumbnails
  const thumbW = 132, notesH = 36, top = 140;
  for (let i = 0; i < 6; i++) { const sn = Math.max(1, n - 2) + i, ty = top + 8 + i * 92; if (ty > Hn - 60) break;
    tx(ctx, String(sn), 18, ty + 10, 11, c.fg2, 400, { align: 'center' }); slideArt(ctx, [32, ty, thumbW], t, sn === n ? o : { title: ['AGENDA', 'BACKGROUND', 'CONTEXT', 'MORE CONTEXT', 'NEXT STEPS', 'QUESTIONS?'][(sn - 1) % 6], bullets: ['\u2014', '\u2014'], n: sn }, c);
    if (sn === n) ring(ctx, rect(30, ty - 2, thumbW + 4, thumbW * 9 / 16 + 4), c.brand, 2.5); }
  sb = fitBox([186, top + 16, Wn - 206, Hn - top - 32 - notesH - 26], 16 / 9); slideArt(ctx, sb, t, o, c);
  const nb = rect(176, Hn - 26 - notesH, Wn - 176, notesH); face(ctx, nb, c.wh, { line: 1 }); tx(ctx, o.notes || 'Click to add notes', 192, Hn - 26 - notesH / 2, 12, c.fg2);
  face(ctx, rect(0, Hn - 26, Wn, 26), c.ribbon, { line: 0 }); tx(ctx, `Slide ${n} of ${total}`, 16, Hn - 13, 12, c.fg2); tx(ctx, 'English (United States)', 130, Hn - 13, 12, c.fg2);
  tx(ctx, 'Notes    Comments    \u2014\u2014\u25CF\u2014\u2014  +  68%', Wn - 16, Hn - 13, 12, c.fg2, 400, { align: 'right' });
  ctx.restore(); unlocal(ctx, prev);
  return [x + sb[0] * z, y + sb[1] * z, sb[2] * z, sb[2] * z * 9 / 16];
}

// ---------- iPhone ----------
function IOS() { return { blue: K('#007AFF', INK.blue), grey: K('#E9E9EB', INK.paperDk), green: K('#34C759', INK.green), wh: K('#FFFFFF', INK.white), bk: K('#000000', INK.ink), fg2: K('#8E8E93', '#7A7080'), bg: K('#FFFFFF', INK.paper) }; }
// App icon squircle for notifications: the brand logo on its iOS tile.
function appTile(ctx, app, x, y, s) {
  const sq = rr(x, y, s, s, s * .225), white = K('#FFFFFF', INK.white), cx = x + s / 2, cy = y + s / 2;
  if (app === 'zoom') { zoomLogo(ctx, cx, cy, s); return; }
  if (app === 'messages' || app === 'calendar') {
    face(ctx, sq, app === 'messages' ? K('#34C759', INK.green) : white, { line: 2 });
    if (app === 'messages') { ctx.save(); ctx.fillStyle = white; ctx.beginPath(); ctx.ellipse(cx, cy - s * .02, s * .34, s * .28, 0, 0, TAU); ctx.fill(); fillPts(ctx, [[cx - s * .24, cy + s * .14], [cx - s * .3, cy + s * .3], [cx - s * .08, cy + s * .22]], white, false); ctx.restore(); }
    else { tx(ctx, 'WED', cx, y + s * .24, s * .16, K('#FF3B30', INK.red), 600, { align: 'center' }); tx(ctx, '7', cx, y + s * .6, s * .5, K('#000000', INK.ink), 400, { align: 'center' }); }
    return;
  }
  face(ctx, sq, white, { line: 2 });
  ({ teams: teamsLogo, slack: slackLogo, outlook: outlookLogo, ppt: pptLogo }[app] || teamsLogo)(ctx, cx, cy, s * .66);
}
function phoneScreen(ctx, x, y, h, t, o = {}) { return printed(ctx, o, c => phone_(c, x, y, h, t, o)); }
function phone_(ctx, x, y, h, t, o) {
  const p = h / 876, prev = local(ctx, x, y, p), c = IOS(), lock = o.lock ?? true;
  const body = rr(0, 0, 417, 876, 68); drop(ctx, body); face(ctx, body, K('#1C1C1E', INK.ink), { line: 4 });
  ring(ctx, rr(2.5, 2.5, 412, 871, 66), K('#48484A', INK.ink), 2);
  ctx.save(); ctx.translate(12, 12); const scr = rr(0, 0, 393, 852, 56); clipPts(ctx, scr, false);
  const statusFg = lock ? c.wh : c.bk;
  if (lock) {
    fillPts(ctx, rect(0, 0, 393, 852), K('#253170', INK.night), false);
    face(ctx, oval(330, 250, 280), K('#3A4BA6', INK.blue), { line: 0, dots: rgba(INK.pink, .5), max: .5, sp: 16 }); face(ctx, oval(40, 720, 320), K('#5B3E8E', INK.purple), { line: 0, dots: rgba(INK.pink, .5), max: .5, sp: 16 });
    icon(ctx, 'lock', 196.5, 66, 18, c.wh);
    tx(ctx, o.date || 'Wednesday, October 7', 196.5, 104, 20, rgba(K('#FFFFFF', INK.white), .9), 600, { align: 'center' });
    tx(ctx, o.time || '8:57', 196.5, 178, 104, rgba(K('#FFFFFF', INK.white), .95), 700, { align: 'center', stretch: -1, track: -3 });
    // notifications: newest on top, the pile anchored above the bottom buttons; older ones beyond o.max stack
    const vis = (o.notifs || []).map((nf, i) => ({ ...nf, i })).filter(nf => nf.at == null || t >= nf.at - 1 / 24).sort((a, b) => (b.at ?? 0) - (a.at ?? 0) || b.i - a.i);
    const max = o.max ?? 4, cards = vis.slice(0, max), extra = vis.length - cards.length, cardH = nf => 46 + wrap(ctx, nf.text || '', 15, 400, 280, 2).length * 20;
    let yb = 852 - 112 - (extra > 0 ? 18 : 0);
    if (extra > 0) for (let s = Math.min(2, extra); s >= 1; s--) { const iw = 361 - s * 24; face(ctx, rr(16 + s * 12, yb - 30 + s * 9, iw, 30, 16), rgba(K('#E8E8ED', INK.paperDk), .6 - s * .15), { line: 1.5 }); }
    const hs = cards.map(cardH), total = hs.reduce((a, b) => a + b + 8, -8);
    let yy = yb - total;
    cards.forEach((nf, i) => {
      const e = nf.at == null ? 1 : backOut(seg(t, nf.at - 1 / 24, nf.at + .3), 1.6), ch = hs[i];
      ctx.save(); ctx.translate(196.5, yy + ch / 2); ctx.scale(lerp(.9, 1, clamp(e)), lerp(.9, 1, clamp(e))); ctx.translate(-196.5, -yy - ch / 2 + (1 - clamp(e)) * -30); ctx.globalAlpha *= clamp(e * 2);
      const cd = rr(16, yy, 361, ch, 22); face(ctx, cd, rgba(K('#F2F2F7', INK.paper), lerp(.88, 1, STYLE.k)), { line: 2.5, dots: rgba(INK.ink, .15), max: .3 });
      appTile(ctx, nf.app || 'teams', 30, yy + 14, 38);
      tx(ctx, fit(ctx, nf.title || '', 15, 600, 230), 80, yy + 24, 15, c.bk, 600); tx(ctx, nf.time || 'now', 362, yy + 24, 13, K('#6C6C70', '#5A5263'), 400, { align: 'right' });
      wrap(ctx, nf.text || '', 15, 400, 280, 2).forEach((l, j) => tx(ctx, l, 80, yy + 45 + j * 20, 15, c.bk));
      ctx.restore(); yy += ch + 8;
    });
    for (const [bx, ic] of [[56, 'flash'], [337, 'photo']]) { fillPts(ctx, oval(bx, 790, 25), rgba(K('#000000', INK.ink), .35), false); icon(ctx, ic, bx, 790, 22, c.wh); }
  } else {
    fillPts(ctx, rect(0, 0, 393, 852), c.bg, false);
    face(ctx, rect(0, 0, 393, 140), K('#F6F6F6', INK.paperDk), { line: 0 }); rule(ctx, 0, 140, 393, 140, K('#D1D1D6', INK.ink));
    icon(ctx, 'back', 24, 80, 22, c.blue, { w: 2.2 });
    const who = o.contact ?? 'greg', nm = nameOf(who).replace(/ \(.*\)/, '');
    face(ctx, oval(196.5, 82, 27), K('#A4A6AE', INK.ogrey), { line: 2 }); tx(ctx, initialsOf(nm), 196.5, 83, 22, c.wh, 600, { align: 'center' });
    tx(ctx, nm + ' \u203A', 196.5, 124, 12, c.bk, 400, { align: 'center' }); icon(ctx, 'video', 360, 80, 24, c.blue);
    let yy = 160;
    tx(ctx, 'iMessage', 196.5, yy, 11, c.fg2, 600, { align: 'center' }); tx(ctx, 'Today 5:01 PM', 196.5, yy + 15, 11, c.fg2, 400, { align: 'center' }); yy += 32;
    const msgs = (o.thread || []).filter(m => m.at == null || t >= m.at - 1 / 24);
    msgs.forEach((m, i) => { const b = bubble_(ctx, 12, yy, 369, { size: 17, ...m, t }); yy += b[3] + (msgs[i + 1] && msgs[i + 1].side === m.side ? 3 : 10); });
    const lastOut = msgs.map(m => m.side).lastIndexOf('out'); if (lastOut === msgs.length - 1 && lastOut >= 0) tx(ctx, 'Delivered', 377, yy, 11, c.fg2, 600, { align: 'right' });
    if (o.typing) { const tb = rr(12, yy + 6, 66, 38, 19); face(ctx, tb, c.grey, { line: 2 }); dots(ctx, 31, yy + 25, 4, 14, t, K('#8E8E93', INK.ink)); }
    fillPts(ctx, oval(30, 790, 17), K('#E5E5EA', INK.paperDk), false); icon(ctx, 'plus', 30, 790, 18, K('#8E8E93', INK.ink), { w: 2 });
    const fb = rr(56, 772, 322, 36, 18); face(ctx, fb, c.bg, { line: 1.5 }); edge(ctx, fb, K('#C6C6C8', INK.ink)); tx(ctx, 'iMessage', 72, 790, 16, K('#AEAEB2', '#7A7080')); icon(ctx, 'mic', 358, 790, 18, K('#8E8E93', INK.ink));
  }
  // status bar + island + home indicator
  if (!lock) tx(ctx, o.time || '5:01', 54, 30, 17, statusFg, 600, { align: 'center' });
  for (let i = 0; i < 4; i++) fillPts(ctx, rr(300 + i * 5.5, 34 - 4 - i * 2.2, 3.6, 4 + i * 2.2, 1), statusFg, false);
  ctx.save(); ctx.strokeStyle = statusFg; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(334, 24, 25, 12, 3.5); ctx.stroke(); ctx.restore(); fillPts(ctx, rr(336.5, 26.5, 17, 7, 1.5), statusFg, false);
  fillPts(ctx, rr(134.5, 11, 124, 36, 18), K('#000000', INK.ink), false);
  fillPts(ctx, rr(129.5, 836, 134, 5, 2.5), statusFg, false);
  ctx.restore(); unlocal(ctx, prev);
  return [x + 12 * p, y + 12 * p, 393 * p, 852 * p];
}
// iMessage bubble; the tail curls out of the bottom corner on the speaker's side.
function textBubble(ctx, x, y, w, o = {}) { return printed(ctx, o, c => bubble_(c, x, y, w, o)); }
function bubble_(ctx, x, y, w, o) {
  const size = o.size || w / 21, out = (o.side || 'out') === 'out', c = IOS(), t = o.t ?? 0;
  const k = o.t0 == null ? 1 : backOut(seg(t, o.t0 - 1 / 24, o.t0 + .28), 2); if (k <= 0) return [x, y, 0, 0];
  const px = size * .72, py = size * .42, lines = wrap(ctx, o.text || '', size, 400, w * .74 - px * 2), lh = size * 1.28;
  const bw = Math.max(...lines.map(l => tw(ctx, l, size, 400))) + px * 2, bh = lines.length * lh + py * 2 - (lh - size) * .3, R = Math.min(size * 1.05, bh / 2);
  const bx = out ? x + w - bw - size * .3 : x + size * .3, X = out ? bx + bw : bx, Y = y + bh, s = out ? 1 : -1, q = size * .55;
  const pts = rr(bx, y, bw, bh, out ? [R, R, 0, R] : [R, R, R, 0]), ci = pts.findIndex(([a, b]) => a === X && b === Y);
  const tail = [...bezPts([X, Y - R], [X, Y - R * .3], [X + s * q * .1, Y - q * .1], [X + s * q * .62, Y + q * .02], 8), ...bezPts([X + s * q * .62, Y + q * .02], [X - s * q * .15, Y + q * .1], [X - s * q * .55, Y - q * .02], [X - s * R * .9, Y], 8)];
  if (out) pts.splice(ci, 1, ...tail); else pts.splice(ci, 1, ...tail.reverse());
  const col = out ? (o.sms ? c.green : c.blue) : c.grey, fg = out ? c.wh : K('#000000', INK.ink);
  ctx.save(); ctx.translate(X, Y); ctx.scale(k, k); ctx.translate(-X, -Y); ctx.globalAlpha *= clamp(k * 3);
  face(ctx, pts, col, { line: 2.5, dots: out ? rgba(INK.ink, .3) : rgba(INK.ink, .15), max: .35 });
  lines.forEach((l, i) => tx(ctx, l, bx + px, y + py + lh * (i + .5) - (lh - size) * .15, size, fg));
  ctx.restore();
  return [bx, y, bw, bh];
}

// ---------- the mouse pointer ----------
const ARROW = [[0, 0], [0, 16.6], [4.1, 12.7], [6.9, 19.1], [9.4, 18], [6.7, 11.7], [12.2, 11.7]];
function pointer(ctx, x, y, s = 32, o = {}) { return printed(ctx, o, c => pointer_(c, x, y, s, o)); }
function pointer_(ctx, x, y, s, o) {
  const k = clamp(o.click || 0), sq = 1 - Math.sin(k * Math.PI) * .12, prev = local(ctx, x, y, s / 20 * sq), kind = o.kind || 'arrow', wh = K('#FFFFFF', INK.white), bk = K('#000000', INK.ink);
  if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha *= 1 - k; ring(ctx, oval(0, 0, 4 + k * 16), o.color || K('#5B5FC7', INK.pink), 1.6); ctx.restore(); }
  if (kind === 'text') { ctx.save(); ctx.strokeStyle = wh; ctx.lineWidth = 3.2; const pth = p2d('M-3 -9h6M0 -9v18M-3 9h6'); ctx.lineCap = 'round'; ctx.stroke(pth); ctx.strokeStyle = bk; ctx.lineWidth = 1.4; ctx.stroke(pth); ctx.restore(); unlocal(ctx, prev); return; }
  const pts = kind === 'hand' ? null : ARROW;
  if (STYLE.k > .5) { const sh = (pts || ARROW).map(([a, b]) => [a + 1.6, b + 1.6]); if (pts) fillPts(ctx, sh, INK.ink, false); }
  if (pts) { face(ctx, pts, wh, { line: 0, reg: .4 }); ctx.save(); ctx.beginPath(); tracePath(ctx, pts, true, false); ctx.lineJoin = 'round'; ctx.lineWidth = 1.1 + STYLE.k * 1.2; ctx.strokeStyle = bk; ctx.stroke(); ctx.restore(); }
  else { ctx.save(); ctx.translate(-6.2, -.8); const hp = p2d('M6.2 .8c1 0 1.8.8 1.8 1.8V8.3c.3-.2.7-.3 1.1-.3.9 0 1.6.6 1.8 1.4.3-.2.7-.3 1.1-.3 1 0 1.7.7 1.8 1.6.3-.2.6-.2.9-.2 1 0 1.8.8 1.8 1.8v4.4c0 2.8-2.2 5-5 5H9.6c-1.6 0-3-.7-4-2L2.3 15.6c-.6-.8-.4-1.9.3-2.5.7-.5 1.7-.4 2.3.2l-.5-.6V2.6c0-1 .8-1.8 1.8-1.8Z');
    ctx.fillStyle = wh; ctx.fill(hp); ctx.lineJoin = 'round'; ctx.lineWidth = 1.1 + STYLE.k * 1.2; ctx.strokeStyle = bk; ctx.stroke(hp); ctx.restore(); }
  unlocal(ctx, prev);
}
function appIcon(ctx, name, cx, cy, size, color, o = {}) { const prev = SC; SC = scaleOf(ctx); icon(ctx, name, cx, cy, size, color, o); SC = prev; }

Object.assign(window, { teamsLogo, slackLogo, zoomLogo, outlookLogo, pptLogo, teamsCall, teamsTile, teamsToast, teamsChat, teamsCaption, mutedToast, unstableBanner,
  screenShareBorder, aiRecap, teamsAvatar, slackWindow, slackNotif, zoomCall, outlookCalendar, outlookInvite, emailCompose, pptSlide, phoneScreen, textBubble,
  pointer, appIcon, appName: nameOf });

// ---------- look-dev ----------
const officeBg = ctx => { fillPts(ctx, rect(0, 0, W, H), INK.wall, false); fillPts(ctx, rect(0, H * .82, W, H * .18), INK.wallDk, false); };
const capWords = (s, t, t0, rate = .3) => s.split(' ').map((w, i) => { const a = t0 + i * rate; return { s: w, shown: t >= a, on: t >= a && t < a + rate, k: clamp((t - a) / .12) }; });
const CALL_TILES = t => [
  { who: 'greg', speaking: true }, { who: 'dan', muted: true }, { who: 'linda', muted: true, hand: true }, { who: 'tasha', camOff: true, muted: true },
  { who: 'bob', frozen: .4, muted: true }, { who: 1, muted: true }, { who: 2, muted: true, reactions: [{ e: '\uD83D\uDC4D', at: .3 }, { e: '\u2764\uFE0F', at: 1.1, x: .6 }] }, { who: 3, camOff: true, muted: true }, { who: 4, muted: true }];
LOOKS.logos = (ctx, t) => {
  look(0); officeBg(ctx);
  const L = [teamsLogo, slackLogo, zoomLogo, outlookLogo, pptLogo];
  L.forEach((f, i) => f(ctx, 260 + i * 350, 250, 230));
  L.forEach((f, i) => f(ctx, 200 + i * 350, 470, 48));
  L.forEach((f, i) => f(ctx, 290 + i * 350, 470, 24));
  look(1); fillPts(ctx, rect(0, 560, W, 520), INK.paper, false);
  L.forEach((f, i) => f(ctx, 260 + i * 350, 800, 230));
};
LOOKS.teams_call = (ctx, t) => {
  look(0); officeBg(ctx);
  teamsCall(ctx, [60, 40, 1800, 1000], t, { title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: 900 + t, participants: 9, tiles: CALL_TILES(t), leave: 1.6, unread: 3 });
};
LOOKS.teams_toasts = (ctx, t) => {
  look(0); officeBg(ctx);
  const st = [60, 60, 1100, 640]; fillPts(ctx, rr(...st, 12), INK.teamsBg, false);
  unstableBanner(ctx, st, { zoom: 1.5 });
  mutedToast(ctx, 610, 300, t, .2, { zoom: 2.2 });
  teamsCaption(ctx, 100, 680, 1020, { speaker: 'dan', words: capWords('Could have dropped it in Teams, could have slid into Slack', t, 0, .2), size: 54, bottom: true });
  teamsToast(ctx, 1200, 80, 680, t, { kind: 'chat', who: 'greg', text: 'hey, you got a sec? nothing urgent, just a quick sync \uD83D\uDE42', t0: .1, presence: 'busy' });
  teamsToast(ctx, 1200, 400, 680, t, { kind: 'call', who: 'greg', text: 'Incoming video call', t0: .5, photo: true });
  teamsCaption(ctx, 60, 760, 1800, { speaker: 'dan', words: capWords('This could have been a text', t, .3, .22), size: 100, lines: 1 });
};
LOOKS.teams_chat = (ctx, t) => {
  look(0); officeBg(ctx);
  teamsChat(ctx, [80, 60, 820, 960], t, { title: 'Greg Hollis (He/Him)', zoom: 2, typing: t > 1.4 ? 'greg' : null, compose: { text: 'this could have been a text', t0: .6, cps: 16 },
    messages: [{ who: 'greg', text: 'hey, you got a sec?', time: '8:57 AM' }, { who: 'greg', text: 'nothing urgent, just a quick sync', time: '8:57 AM', at: .3 }, { who: 'dan', text: 'sure, what is it?', time: '8:58 AM', at: .9, react: [['\uD83D\uDC4D', 1]] }] });
  teamsCall(ctx, [960, 160, 900, 760], t, { title: 'Quick sync', timer: 2832 + t, participants: 48, tiles: CALL_TILES(t).slice(0, 4), chat: { messages: [{ who: 'linda', text: "Greg you're on mute" }, { who: 'bob', text: 'can you hear me?', at: .5 }], typing: ['greg', 'linda', 'bob'] } });
};
LOOKS.slack = (ctx, t) => {
  look(0); officeBg(ctx);
  slackWindow(ctx, [60, 50, 1500, 900], t, { channel: 'quick-sync', huddle: true, typing: t > 1 ? ['greg', 'linda', 'bob'] : 'greg', compose: { text: 'could have been a text', t0: 1.2, cps: 14 },
    messages: [{ who: 'greg', text: 'hey team, quick sync at 9? \uD83D\uDE42', time: '8:57 AM', reactions: [{ e: '\uD83D\uDC4D', n: 4 }, { e: '\uD83D\uDE43', n: 1, me: true }] },
      { who: 'greg', text: 'nothing urgent', time: '8:57 AM' }, { who: 'linda', text: 'can we just do this async?', time: '8:58 AM', at: .4 }, { who: 'greg', text: "let's just hop on, it'll be quick", time: '8:58 AM', at: .9, reactions: [{ e: '\uD83D\uDC80', n: 3 }] }] });
  slackNotif(ctx, 1180, 760, 700, t, { who: 'greg', channel: 'quick-sync', text: 'can everyone see my screen?', t0: .3 });
};
LOOKS.zoom = (ctx, t) => {
  look(0); officeBg(ctx);
  zoomCall(ctx, [40, 60, 1300, 800], t, { tiles: [{ who: 'greg', speaking: true }, { who: 'dan', muted: true }, { who: 'linda', muted: true }, { who: 'tasha', camOff: true, muted: true }, { who: 'bob', muted: true }, { who: 5, camOff: true, muted: true }], muted: true, timer: 754 + t, recording: true });
  zoomCall(ctx, [1380, 300, 500, 380], t, { waiting: true, title: 'Quick sync', zoom: .6 });
};
LOOKS.outlook = (ctx, t) => {
  look(0); officeBg(ctx);
  const ev = [[0, 9, 9.25], [0, 10, 11], [1, 9, 9.5], [1, 11, 12], [2, 9, 9.25], [2, 9.25, 9.5], [2, 9.5, 10], [2, 10, 10.25], [2, 9, 10], [2, 11, 11.25], [2, 13, 14], [2, 14, 14.25], [3, 9, 10.5], [3, 15, 15.5], [4, 9, 9.25], [4, 16, 17], [2, 15.5, 16], [2, 16, 17]];
  outlookCalendar(ctx, [40, 40, 1300, 1000], t, { now: 9.6, events: ev.map(([day, start, end], i) => ({ day, start, end, title: ['Quick sync \uD83D\uDE42', 'Sync about the sync', 'Alignment', 'Circle back', 'Touch base', 'Pre-meeting'][i % 6], at: .1 + i * .13 })) });
  outlookInvite(ctx, 1370, 120, 520, t, { press: 'accept', pressAt: 1.8, t0: .2 });
};
LOOKS.email_ppt = (ctx, t) => {
  look(0); officeBg(ctx);
  emailCompose(ctx, [40, 60, 860, 640], t, { to: ['greg'], cc: ['linda'], subject: 'Re: Quick sync', body: 'Hi Greg,\nThis could have been a text.\nThanks,\nDan', t0: 0, cps: 22, send: 2.4 });
  pptSlide(ctx, [940, 60, 940, 560], t, { bullets: ['We need your thoughts on this', { s: 'The context is in the deck', at: .6 }, { s: "Let's circle back", at: 1.2 }] });
  pptSlide(ctx, [940, 650, 640, 380], t, { presenter: true, bullets: ['We need your thoughts on this'] });
  pptSlide(ctx, [80, 740, 520, 292], t, { view: 'show' });
};
LOOKS.phone = (ctx, t) => {
  look(0); officeBg(ctx);
  phoneScreen(ctx, 140, 60, 960, t, { notifs: [{ app: 'teams', title: 'Greg Hollis', text: 'hey, you got a sec?', at: 0 }, { app: 'outlook', title: 'Quick sync \uD83D\uDE42', text: 'Greg Hollis invited you · 9:00 AM (15 min)', at: .4 },
    { app: 'slack', title: '#quick-sync', text: "Greg: let's just hop on", at: .8 }, { app: 'zoom', title: 'Zoom', text: 'Meeting starting now', at: 1.2 }, { app: 'teams', title: 'Greg Hollis', text: 'are you joining?', at: 1.6 }, { app: 'calendar', title: 'Calendar', text: 'Sync about the sync · now', at: 2 }] });
  phoneScreen(ctx, 700, 60, 960, t, { lock: false, contact: 'greg', thread: [{ text: 'Hey, got a minute?', side: 'in' }, { text: 'No.', side: 'out', at: .5 }, { text: 'Send me the damn text.', side: 'out', at: 1.2 }], typing: t > 1.8 });
  textBubble(ctx, 1200, 300, 680, { text: 'Hey, got a minute?', side: 'in', size: 52, t0: .1, t });
  textBubble(ctx, 1200, 460, 680, { text: 'No.', side: 'out', size: 52, t0: .6, t });
  pointer(ctx, 1500, 800, 64, { click: clamp(t - 1) }); pointer(ctx, 1640, 800, 64, { kind: 'hand' }); pointer(ctx, 1760, 800, 64, { kind: 'text' });
};
LOOKS.recap = (ctx, t) => {
  look(0); officeBg(ctx);
  aiRecap(ctx, [300, 40, 1320, 1000], t, { zoom: 1.9, t0: 0, sections: [{ h: 'Discussion', items: ['Greg asked for everyone\u2019s thoughts on the deck.', 'Dan noted the context is in the deck.'] }, { h: 'Follow-up tasks', tasks: true, items: ['Greg to schedule a follow-up to discuss the follow-up.'] }],
    speakers: [{ who: 'greg', share: .97 }, { who: 'dan', share: .02 }, { who: 'linda', share: .01 }] });
};
LOOKS.teams_layouts = (ctx, t) => {
  look(0); officeBg(ctx);
  const tiles = [{ who: 'greg', speaking: true, cam: 'forehead', camK: .4 + .3 * Math.sin(t) }, { who: 'dan', muted: true }, { who: 'linda', muted: true }, { who: 'tasha', camOff: true, muted: true }, { who: 'bob', muted: true }];
  teamsCall(ctx, [40, 40, 900, 560], t, { title: 'Quick sync', timer: 2832 + t, participants: 48, layout: 'speaker', tiles, captions: { speaker: 'greg', words: capWords("let's circle back on this", t, .2, .25) } });
  teamsCall(ctx, [980, 40, 900, 560], t, { title: 'Quick sync', timer: 2832 + t, participants: 48, layout: 'share', tiles, focus: 0 });
  pptSlide(ctx, [40, 640, 760, 400], t, { zoom: .62 });
  screenShareBorder(ctx, [40, 640, 760, 400], t, { zoom: .8, t0: .3 });
  teamsTile(ctx, [860, 640, 520, 400], t, { who: 'bob', frozen: true, self: true, muted: true });
  teamsTile(ctx, [1420, 640, 460, 400], t, { who: 'greg', cam: 'forehead', camK: 1, speaking: true });
};
LOOKS.teams_unmute = (ctx, t) => {
  look(0); officeBg(ctx);
  const on = t >= 1, stageTile = (c, [x, y, w, h], tt) => { fillPts(c, rect(x, y, w, h), INK.red, false); dotsIn(c, [x, y, x + w, y + h], { spacing: 18, color: INK.pink, max: .6 }); txt(c, 'OUT OF OFFICE', x + w / 2, y + h / 2, { font: 'display', size: h * .18, align: 'center', base: 'middle', color: INK.yellow, stroke: { w: 6, color: INK.ink } }); };
  teamsCall(ctx, [60, 40, 1800, 1000], t, { title: 'Quick sync', timer: 900 + t, participants: 5, tiles: [{ who: 'greg', speaking: true }, { who: 'dan', muted: !on, look: on ? 1 : 0, pose: on ? { rage: 1, mouth: 'scream', open: 1 } : {} },
    { who: 'linda', muted: !on, look: on ? 1 : 0 }, { who: 'tasha', camOff: !on, muted: !on, draw: on ? stageTile : null }, { who: 'bob', muted: true }, { who: 6, muted: true }] });
};
LOOKS.closeup = (ctx, t) => {
  look(t < 1.5 ? 0 : 1); if (STYLE.k < .5) officeBg(ctx);
  teamsCall(ctx, [-1500, -60, 3400, 700], t, { zoom: 3, title: 'Quick sync \uD83D\uDE42 | Microsoft Teams', timer: 2832 + t, participants: 48, tiles: CALL_TILES(t).slice(0, 3), unread: 12, leave: 1.2 });
  teamsToast(ctx, 60, 420, 900, t, { kind: 'call', who: 'greg', photo: true, t0: 0 });
  teamsCaption(ctx, 60, 820, 900, { words: capWords('you said let us just hop on', t, 0, .15), size: 40 });
  slackNotif(ctx, 1000, 420, 860, t, { who: 'linda', channel: 'quick-sync', text: "Greg you're on mute", t0: 0 });
};
LOOKS.perf = (ctx, t) => {
  // CPU submission time only (the GPU raster is deferred); use --clip wall times for the full cost
  const tm = (n, f) => { const t0 = performance.now(); for (let i = 0; i < n; i++) f(i); return (performance.now() - t0) / n; }, r = [];
  for (const k of [0, 1]) {
    look(k); officeBg(ctx);
    r.push([`look(${k}) 9 busts alone`, tm(4, () => CALL_TILES(t).forEach((q, i) => { const b = [60 + (i % 3) * 370, 40 + Math.floor(i / 3) * 210, 360, 200]; ctx.save(); clipPts(ctx, rect(...b), false); webcam(ctx, b, t, q.who, q); ctx.restore(); }))]);
    r.push([`look(${k}) teamsCall 9 tiles`, tm(4, () => teamsCall(ctx, [60, 40, 1100, 620], t, { tiles: CALL_TILES(t), participants: 9 }))]);
    r.push([`look(${k}) teamsToast chat`, tm(20, () => teamsToast(ctx, 1200, 60, 660, t, { kind: 'chat', who: 'greg', text: 'hey, you got a sec?', t0: 0 }))]);
    r.push([`look(${k}) teamsToast call`, tm(20, () => teamsToast(ctx, 1200, 360, 660, t, { kind: 'call', who: 'greg', t0: 0 }))]);
    r.push([`look(${k}) teamsCaption 80px`, tm(20, () => teamsCaption(ctx, 60, 700, 1100, { words: capWords('This could have been a text', t, 0, .2), size: 80 }))]);
    r.push([`look(${k}) slackWindow`, tm(4, () => slackWindow(ctx, [60, 40, 1100, 620], t, { huddle: true, messages: [{ who: 'greg', text: 'quick sync?' }, { who: 'linda', text: 'async?' }] }))]);
    r.push([`look(${k}) outlookCalendar 18 ev`, tm(4, () => outlookCalendar(ctx, [60, 40, 1100, 620], t, { events: Array.from({ length: 18 }, (_, i) => ({ day: i % 5, start: 9 + (i % 6), end: 9.5 + (i % 6) })) }))]);
    r.push([`look(${k}) phoneScreen lock`, tm(4, () => phoneScreen(ctx, 1300, 100, 800, t, { notifs: [{ app: 'teams', title: 'Greg', text: 'sec?' }, { app: 'slack', title: '#quick-sync', text: 'hop on' }] }))]);
  }
  look(0); fillPts(ctx, rect(0, 0, W, H), INK.wall, false);
  r.forEach(([s, ms], i) => txt(ctx, `${s}: ${ms.toFixed(2)} ms`, 60 + Math.floor(i / 8) * 900, 80 + (i % 8) * 100, { font: 'mono', weight: 700, size: 36, color: INK.ink }));
};
LOOKS.props = (ctx, t) => {
  for (const k of [0, 1]) {
    look(k); ctx.save(); ctx.translate(0, k * 540); fillPts(ctx, rect(0, 0, W, 540), k ? INK.paper : INK.wall, false);
    uiBox(ctx, 40, 40, 260, 140); pill(ctx, 70, 110, 'Approved'); button(ctx, 340, 60, 240, 90, 'Send', { press: clamp(t - 1) });
    avatar(ctx, 660, 100, 50); avatar(ctx, 780, 100, 50, 'DK'); avatar(ctx, 900, 100, 50, 'bot');
    toast(ctx, 1450, 120, .5, { title: 'Quick sync', text: 'starting now', icon: (c, x, y, s) => teamsLogo(c, x, y, s) });
    officeChair(ctx, 160, 520, .5); bubble(ctx, 470, 300, "you're on mute", { size: 30 });
    cutout(ctx, 640, 230, 260, 160, -.05, t, c => txt(c, 'MINUTES', 30, 90, { font: 'display', size: 60, color: INK.ink }));
    terminal(ctx, 960, 230, 420, 200, t, { lines: [['PS C:\\> send-message', INK.white]], cps: 12, t0: 0 });
    win95(ctx, 1420, 230, 460, 260, {}); stamp(ctx, 'SENT', 400, 450, 70, t - .2); thumbsUp(ctx, 600, 470, 60);
    ticker(ctx, 470, t, ['ANOTHER MEETING', 'ANOTHER LINK'], { h: 56, size: 28 });
    ctx.restore();
  }
};
LOOKS.riso_apps = (ctx, t) => {
  look(1);
  slackWindow(ctx, [40, 40, 1000, 600], t, { huddle: true, typing: ['greg', 'linda', 'bob'], messages: [{ who: 'greg', text: "let's just hop on, it'll be quick", reactions: [{ e: '\uD83D\uDC80', n: 3, me: true }] }, { who: 'linda', text: 'can we just do this async?', at: .5 }] });
  outlookCalendar(ctx, [1080, 40, 800, 600], t, { nav: false, now: 9.6, events: Array.from({ length: 10 }, (_, i) => ({ day: i % 5, start: 9 + (i % 4) * .5, end: 9.5 + (i % 4) * .5, title: 'Quick sync', at: i * .15 })) });
  phoneScreen(ctx, 60, 680, 380, t, { notifs: [{ app: 'teams', title: 'Greg Hollis', text: 'got a sec?' }, { app: 'slack', title: '#quick-sync', text: 'hop on', at: .6 }] });
  pptSlide(ctx, [480, 680, 640, 360], t, {});
  emailCompose(ctx, [1160, 680, 720, 360], t, { to: ['greg'], subject: 'Re: Quick sync', body: 'This could have been a text.', t0: 0, cps: 14 });
  pointer(ctx, 1500, 900, 56, { click: clamp(t - 1) });
};
LOOKS.riso_call = (ctx, t) => { look(1); teamsCall(ctx, [60, 40, 1800, 1000], t, { title: 'Quick sync', timer: 11565 + t, participants: '500+', tiles: CALL_TILES(t) }); };
LOOKS.riso_ui = (ctx, t) => {
  look(1);
  teamsCall(ctx, [40, 40, 1100, 640], t, { title: 'Quick sync', timer: 11565 + t, participants: '500+', tiles: CALL_TILES(t), recording: true });
  teamsToast(ctx, 1200, 60, 660, t, { kind: 'call', who: 'greg', t0: .2 });
  slackNotif(ctx, 1200, 330, 660, t, { who: 'greg', channel: 'quick-sync', text: "let's just hop on, it'll be quick", t0: .4 });
  teamsCaption(ctx, 40, 720, 1100, { speaker: 'dan', words: capWords('God, this could have been a text', t, 0, .2).map(w => w.s === 'text' ? { ...w, color: INK.red } : w), size: 72, lines: 1 });
  outlookInvite(ctx, 1200, 610, 660, t, { press: 'decline', pressAt: 1.5 });
  [teamsLogo, slackLogo, zoomLogo].forEach((f, i) => f(ctx, 140 + i * 180, 960, 130));
  textBubble(ctx, 640, 880, 520, { text: 'Send me the damn text.', side: 'out', size: 46, t0: .5, t });
};
})();
