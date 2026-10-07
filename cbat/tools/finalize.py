# Merge the forced alignment with the display text and hand-checked fixes; write assets/lyrics_timed.json + SRT.
#   python tools/finalize.py
import json
from lyrics import LINES

al = json.load(open('work/aligned.json'))
assert len(al) == len(LINES), (len(al), len(LINES))
idx = {}
for i, (sec, _, _) in enumerate(LINES): idx.setdefault(sec, []).append(i)
L = lambda sec, n: idx[sec][n]

# Word starts fixed by hand from the per-window transcriptions and vocal onsets (tools/onsets.py, tools/vocal_energy.py).
FIX = {
    L('tag1', 2): [38.84, 39.30, 39.60, 39.92, 40.32],
    L('verse2', 0): {0: 41.28, 1: 41.45},
    L('verse3', 0): {0: 92.38},
    L('bridge', 5): [114.20, 114.40], L('bridge', 7): [115.78, 115.96], L('bridge', 9): [117.47, 117.64],
    L('breakdown', 0): [121.92, 122.60, 123.00], L('breakdown', 1): [123.67, 124.04, 124.62],
    L('breakdown', 7): [133.40, 134.02, 134.30, 134.60],
    L('outro', 0): [166.97, 167.23, 167.37, 167.50], L('outro', 1): [168.60],
}
END = {L('tag1', 2): 40.90, L('bridge', 10): 121.80, L('breakdown', 0): 123.55, L('breakdown', 7): 135.30,
       L('outro', 0): 167.90, L('outro', 1): 168.95, L('final_tag', 3): 159.40}

lines = []
for i, ((sec, _, disp), a) in enumerate(zip(LINES, al)):
    toks = disp.split()
    assert len(toks) == len(a['words']), (i, toks, [w['w'] for w in a['words']])
    starts = [w['start'] for w in a['words']]; ends = [w['end'] for w in a['words']]
    f = FIX.get(i)
    if isinstance(f, list): starts[:len(f)] = f
    elif isinstance(f, dict):
        for j, s in f.items(): starts[j] = s
    for j in range(1, len(starts)): starts[j] = max(starts[j], starts[j - 1] + .02)
    words = [{'w': t, 'start': round(s, 3), 'end': round(e, 3)} for t, s, e in zip(toks, starts, ends)]
    for j in range(len(words)):  # ordered, non-overlapping, at least 80 ms long
        nxt = words[j + 1]['start'] if j + 1 < len(words) else None
        e = max(words[j]['end'], words[j]['start'] + .08)
        words[j]['end'] = round(min(e, nxt) if nxt is not None else e, 3)
    if i in END: words[-1]['end'] = END[i]
    lines.append({'section': sec, 'text': disp, 'start': words[0]['start'], 'end': words[-1]['end'], 'words': words})

out = {
    'duration': 179.88, 'bpm': 143.6,
    'note': 'Word times from stable-ts forced alignment (faster-whisper large-v3) on a Demucs vocal stem, cross-checked '
            'against a free transcription and per-window passes; hit words placed on vocal onsets by hand. '
            '"8:57" in the written lyric is not sung (the vocal opens at 0.60 with "Hey"). Use beats[] for sync.',
    'lines': lines,
}
json.dump(out, open('assets/lyrics_timed.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
fmt = lambda t: f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}'
srt = []
for n, l in enumerate(lines, 1): srt += [str(n), f"{fmt(l['start'])} --> {fmt(l['end'])}", f"[{l['section']}] {l['text']}", '']
open('assets/lyrics.srt', 'w', encoding='utf-8').write('\n'.join(srt))
for i, l in enumerate(lines): print(f"{i:3d} {l['section']:10s} {l['start']:7.2f}-{l['end']:7.2f} {l['text']}")
