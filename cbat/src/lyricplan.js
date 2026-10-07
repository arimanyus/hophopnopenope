// lyricplan.js: default lettering per lyric line (see the `LYRICS` notes in timeline.js).
// Office lines are Teams live captions; stage lines are punk hero slabs (one hot word, red for rage).
// A chapter may override its own lines: Object.assign(LYRICS, {12: {...}}) inside its IIFE.
(() => {
  const ST = { stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink } };
  const heroAt = (box, hot, o = {}) => ({ mode: 'hero', box, align: 'center', color: INK.paper, hot, ...ST, ...o });
  const TOP = [160, 70, 1600, 380], MID = [160, 230, 1600, 560], FULL = [120, 120, 1680, 840];
  const cap = (o = {}) => ({ mode: 'livecap', hold: 1.2, ...o });
  const plan = {};
  const range = (a, b, f) => { for (let i = a; i <= b; i++) plan[i] = f(i); };

  range(0, 11, () => cap());                                     // verse 1 + pre-chorus 1
  Object.assign(plan, {                                         // chorus 1 (red/pink/yellow)
    12: heroAt(MID, INK.red, { rows: [1, 2, 3], emph: [5], tilt: 0 }),
    13: heroAt(TOP, INK.red, { rows: [3, 6], emph: [2] }),
    14: heroAt(TOP, INK.red, { rows: [4, 1], emph: [4] }),
    15: heroAt(TOP, INK.red, { rows: [3, 1], emph: [3] }),
    16: { mode: 'sub', y: 1010 },
    17: heroAt(TOP, INK.red, { rows: [4, 2], emph: [5] }),
    18: heroAt(TOP, INK.red, { rows: [3, 5], emph: [1] }),
    19: { mode: 'sub', y: 1010 },
    20: heroAt(TOP, INK.red, { rows: [1, 3, 3], emph: [0] }),
    21: heroAt(TOP, INK.yellow, { budget: 20 }),
    22: heroAt(TOP, INK.red, { rows: [3, 3], emph: [5] }),
    23: heroAt(TOP, INK.yellow, { budget: 20 }),
  });
  range(24, 35, () => cap());                                    // verse 2 + pre-chorus 2
  Object.assign(plan, {                                         // chorus 2 (cyan/blue/yellow)
    36: heroAt(MID, INK.yellow, { rows: [1, 2, 3], emph: [5], tilt: 0 }),
    37: heroAt(TOP, INK.yellow, { rows: [3, 6], emph: [2] }),
    38: heroAt(TOP, INK.yellow, { rows: [4, 1], emph: [4] }),
    39: heroAt(TOP, INK.yellow, { rows: [3, 1], emph: [3] }),
    40: { mode: 'sub', y: 1010 },
    41: heroAt(TOP, INK.yellow, { rows: [4, 2], emph: [5] }),
    42: { mode: 'sub', y: 1010 },
    43: { mode: 'sub', y: 1010 },
    44: heroAt(TOP, INK.red, { rows: [1, 3, 3], emph: [0] }),
  });
  Object.assign(plan, {                                         // post-chorus: the "another ..." punchline is the slab
    45: heroAt(TOP, INK.red, { words: [4, 5], rows: [1, 1], emph: [5] }),
    46: heroAt(TOP, INK.red, { words: [4, 5], rows: [1, 1], emph: [5] }),
    47: heroAt(TOP, INK.red, { words: [4, 5, 6], rows: [1, 2], emph: [5, 6] }),
    48: heroAt(TOP, INK.red, { words: [4, 5, 6, 7], rows: [3, 1], emph: [7] }),
  });
  range(49, 56, () => cap());                                    // verse 3
  Object.assign(plan, {                                         // bridge
    57: { mode: 'caption', x: 90, y: 80, w: 900, rot: -.02, hot: [3] },
    58: { mode: 'caption', x: 90, y: 80, w: 900, rot: .02, hot: [4] },
    59: { mode: 'caption', x: 90, y: 80, w: 900, rot: -.015, hot: [3] },
    60: { mode: 'caption', x: 90, y: 80, w: 900, rot: .015 },
    61: cap({ hold: 0 }), 63: cap({ hold: 0 }), 65: cap({ hold: 0 }),
    62: heroAt(MID, INK.red, { rows: [2], emph: [0, 1], tilt: 0 }),
    64: heroAt(MID, INK.red, { rows: [2], emph: [0, 1], tilt: 0 }),
    66: heroAt(MID, INK.red, { rows: [2], emph: [0, 1], tilt: 0 }),
    67: heroAt(TOP, INK.red, { rows: [4, 3], emph: [6] }),
  });
  Object.assign(plan, {                                         // breakdown: one word per hit
    68: heroAt(FULL, INK.red, { rows: [1, 1, 1], emph: [2], tilt: 0, out: 'cut' }),
    69: heroAt(FULL, INK.red, { rows: [1, 1, 1], emph: [2], tilt: 0, out: 'cut' }),
    70: heroAt(TOP, INK.red, { rows: [3, 1], emph: [3] }),
    71: heroAt(TOP, INK.red, { rows: [3, 1], emph: [3] }),
    72: heroAt(TOP, INK.red, { rows: [2, 1], emph: [2] }),
    73: heroAt(TOP, INK.red, { rows: [2, 1], emph: [2] }),
    74: heroAt(TOP, INK.red, { rows: [2, 1], emph: [2] }),
    75: heroAt(FULL, INK.red, { rows: [2, 2], emph: [3], tilt: 0 }),
  });
  Object.assign(plan, {                                         // final chorus: quiet drop, then the ransom collage
    76: { mode: 'sub', y: 1000 }, 77: { mode: 'sub', y: 1000 }, 78: { mode: 'sub', y: 1000 },
    79: { mode: 'ransom', box: [140, 80, 1640, 360], rows: [3, 3] },
    80: { mode: 'ransom', box: [140, 80, 1640, 360], rows: [3, 3] },
    81: { mode: 'ransom', box: [140, 640, 1640, 340], rows: [2, 2] },
    82: { mode: 'ransom', box: [140, 80, 1640, 360], rows: [3, 3] },
    83: { mode: 'ransom', box: [140, 640, 1640, 340], rows: [4, 4] },
    84: { mode: 'ransom', box: [140, 80, 1640, 380], rows: [5, 6] },
    85: { mode: 'ransom', box: [140, 640, 1640, 340], rows: [1, 2] },
  });
  Object.assign(plan, {                                         // final tag + outro
    86: heroAt(TOP, INK.red, { rows: [4, 2], emph: [5] }),
    87: heroAt(TOP, INK.red, { rows: [3, 3], emph: [5] }),
    88: heroAt(TOP, INK.red, { rows: [3, 3], emph: [5] }),
    89: heroAt(FULL, INK.red, { rows: [2, 3, 1], emph: [5], tilt: 0 }),
    90: { mode: 'sub', y: 1000 },
    91: cap({ hold: .5 }),
    92: heroAt(MID, INK.red, { rows: [1], emph: [0], tilt: 0 }),
    93: heroAt(TOP, INK.red, { rows: [3, 2], emph: [3, 4] }),
  });
  Object.assign(LYRICS, plan);
})();
