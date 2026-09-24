// lyricplan.js: how each lyric line is lettered (director-owned; chapters must leave these zones calm).
// Line indices follow LINES (src/data.js). Boxes are [x, y, w, h] in screen px.
const LEFT = [96, 150, 790, 780];                 // verse lyric column (split mode)
Object.assign(LYRICS, {
  // intro
  0: { mode: 'hero', box: [96, 150, 1000, 800], rows: [1, 1, 3], emph: [0], color: INK.paper, hot: INK.orange, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink }, end: 2.62 },
  1: { mode: 'none' },                            // DOWN THE RABBIT HOLE / TICK TICK TOCK are lettered by the shots
  // verse 1: lyric column left
  2: { mode: 'hero', box: [96, 170, 760, 720], rows: [1, 3, 2, 2], emph: [0], color: INK.paper, hot: INK.cyan, stroke: { w: 8, color: INK.ink }, extrude: { dx: 10, dy: 12, color: INK.ink } },
  3: { mode: 'hero', words: [2, 3, 4, 5, 6], box: [96, 280, 790, 640], rows: [1, 1, 3], emph: [2, 3], color: INK.paper, hot: INK.orange, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink } }, // "Small fix" is the on-screen PR title
  4: { mode: 'caption', x: 90, y: 90, w: 820, rot: -.02 },
  5: { mode: 'hero', box: [96, 200, 760, 700], rows: [1, 2, 4], emph: [0], color: INK.paper, hot: INK.orange, stroke: { w: 9, color: INK.ink }, extrude: { dx: 11, dy: 13, color: INK.ink } },
  6: { mode: 'caption', x: 90, y: 760, w: 900, rot: .015 },
  7: { mode: 'hero', box: [96, 170, 780, 740], rows: [4, 3, 1], emph: [6], color: INK.paper, hot: INK.green, stroke: { w: 9, color: INK.ink }, extrude: { dx: 11, dy: 13, color: INK.ink } },
  // chorus 1: centre
  8: { mode: 'hero', words: [0, 1, 2, 3, 4, 5], box: [300, 215, 1320, 400], rows: [1, 2, 3], emph: [0], align: 'center', color: INK.white, hot: INK.orange, stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink }, until: 35.15 },
  9: { mode: 'hero', words: [0, 1, 2, 3, 4, 5], box: [260, 60, 1400, 330], rows: [3, 3], emph: [4], align: 'center', color: INK.white, hot: INK.orange, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink }, until: 38.40 },
  10: { mode: 'sub', y: 1010 },
  11: { mode: 'hero', words: [2, 3, 4, 5, 6, 7], box: [260, 60, 1400, 340], rows: [3, 3], emph: [7], align: 'center', color: INK.white, hot: INK.orange, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink }, after: 43.1, until: 44.8 },
  // verse 2: the rabbit's inner voice
  12: { mode: 'caption', x: 90, y: 80, w: 880, rot: -.02 },
  13: { mode: 'caption', x: 980, y: 80, w: 840, rot: .02 },
  14: { mode: 'caption', x: 90, y: 820, w: 960, rot: .015 },
  15: { mode: 'caption', x: 90, y: 80, w: 860, rot: -.015 },
  16: { mode: 'caption', x: 1000, y: 820, w: 830, rot: -.02 },
  17: { mode: 'caption', x: 90, y: 80, w: 860, rot: .02, fill: INK.pinkLt, end: 69.24 },
  // chorus 2
  18: { mode: 'hero', words: [0, 1, 2, 3, 4, 5], box: [300, 215, 1320, 400], rows: [1, 2, 3], emph: [0], align: 'center', color: INK.white, hot: INK.cyan, stroke: { w: 12, color: INK.ink }, extrude: { dx: 14, dy: 16, color: INK.ink }, until: 72.35 },
  19: { mode: 'sub', y: 1010, until: 75.50 },
  20: { mode: 'sub', y: 1010 },
  21: { mode: 'hero', words: [2, 3, 4, 5, 6, 7], box: [260, 60, 1400, 340], rows: [3, 3], emph: [7], align: 'center', color: INK.white, hot: INK.cyan, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink }, after: 80.25, until: 81.9 },
  // bridge: noir
  22: { mode: 'noir', x: 90, y: 90, w: 900, hot: [1, 2, 3], rot: -.015 },
  23: { mode: 'noir', x: 90, y: 860, w: 900, hot: [0], rot: .015 },
  24: { mode: 'hero', box: [96, 110, 860, 860], rows: [3, 4, 3], color: INK.red, hot: INK.red, stroke: { w: 10, color: INK.ink }, extrude: { dx: 12, dy: 14, color: INK.ink }, tilt: .02 },
  25: { mode: 'sub', y: 1010, bg: INK.ink, color: INK.paper, hot: INK.red, end: 103.4 },
  // final chorus: ransom-note collage
  26: { mode: 'ransom', words: [0, 1, 2, 3, 4, 5], box: [120, 90, 1680, 460], rows: [2, 4], until: 107.1 },
  27: { mode: 'ransom', words: [0, 1, 2, 3, 4, 5, 6, 7], box: [160, 640, 1600, 360], rows: [4, 4], until: 110.8 },
  28: { mode: 'ransom', box: [140, 80, 1640, 380], rows: [3, 2, 3] },
  29: { mode: 'ransom', box: [140, 640, 1640, 360], rows: [5, 4], until: 116.8 },
  30: { mode: 'none' },
  31: { mode: 'none' },
});
