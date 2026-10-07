# Word-level forced alignment of the known lyrics (as sung) against the vocal stem.
#   python tools/align.py work/stems/htdemucs/song/vocals.wav work/aligned.json
import json, sys
import stable_whisper
from lyrics import LINES

src, out = sys.argv[1], sys.argv[2]
model = stable_whisper.load_faster_whisper('large-v3', device='cpu', compute_type='int8')
res = model.align(src, '\n'.join(t for _, t, _ in LINES), language='en', original_split=True)
segs = [s for s in res.segments if s.words]
if len(segs) != len(LINES):
    print(f'WARNING: {len(segs)} segments for {len(LINES)} lines')
data = []
for (sec, text, _), s in zip(LINES, segs):
    words = [{'w': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3), 'p': round(w.probability or 0, 3)} for w in s.words]
    data.append({'section': sec, 'text': text, 'start': words[0]['start'], 'end': words[-1]['end'], 'words': words})
    print(f"{sec:10s} {words[0]['start']:7.2f} {words[-1]['end']:7.2f}  p={sum(w['p'] for w in words) / len(words):.2f}  {' '.join(w['w'] + '@' + format(w['start'], '.2f') for w in words)}")
json.dump(data, open(out, 'w'), indent=1)
