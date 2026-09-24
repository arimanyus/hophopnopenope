# Word-level forced alignment of the known lyrics against the vocal stem.
#   python tools/align.py work/stems/htdemucs/song/vocals.wav work/aligned.json
import json, sys
import stable_whisper

CHORUS = ['{n} little comments on your PR, hop, hop', 'Did anybody read a single one? Nope, nope',
          'Click, click, resolve all, thumbs up, amen', "Hop, hop, guess I'll write 'em all again"]
LINES = [
    ('intro', 'Ninety seconds on the clock'),
    ('intro', 'Down the rabbit hole, tick, tick, tock'),
    ('verse1', 'Ping in the burrow, my ears stand tall'),
    ('verse1', 'Small fix, fourteen thousand lines in all'),
    ('verse1', 'Nested ternaries, a function called fix'),
    ('verse1', 'Forty-six console logs left in the mix'),
    ('verse1', 'A secret key committed, plain as day'),
    ('verse1', "The tests all pass 'cause they're skipped anyway"),
    *[('chorus1', l.format(n='Three')) for l in CHORUS],
    ('verse2', 'Sixty seconds, force-push on the branch'),
    ('verse2', 'Whole review gone, never had a chance'),
    ('verse2', "You said it's never null like you're the king"),
    ('verse2', "I drew a diagram, you didn't read a thing"),
    ('verse2', "You typed CodeRabbit, pause, like I'm to blame"),
    ('verse2', 'I wrote a poem for you all the same'),
    *[('chorus2', l.format(n='Forty')) for l in CHORUS],
    ('bridge', 'Line nine thousand twelve, now what is this?'),
    ('bridge', 'Unsanitized input, there it is'),
    ('bridge', 'I flagged it red, in all caps, with my paw'),
    ('bridge', 'You clicked on merge and then you shipped the flaw'),
    ('final_chorus', 'Four hundred comments on your PR, hop, hop'),
    ('final_chorus', 'So now you wanna read a single one? Yep, yep'),
    ('final_chorus', "It's three a.m., prod's down, who could've known?"),
    ('final_chorus', 'You scroll back to my comment and you groan'),
    ('final_tag', 'As mentioned above.'),
    ('outro_spoken', 'As mentioned above.'),
]

src, out = sys.argv[1], sys.argv[2]
model = stable_whisper.load_faster_whisper('large-v3', device='cpu', compute_type='int8')
res = model.align(src, '\n'.join(t for _, t in LINES), language='en', original_split=True)
segs = [s for s in res.segments if s.words]
if len(segs) != len(LINES):
    print(f'WARNING: {len(segs)} segments for {len(LINES)} lines')
data = []
for (sec, text), s in zip(LINES, segs):
    words = [{'w': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3), 'p': round(w.probability or 0, 3)} for w in s.words]
    data.append({'section': sec, 'text': text, 'start': words[0]['start'], 'end': words[-1]['end'], 'words': words})
    print(f"{sec:13s} {words[0]['start']:7.2f} {words[-1]['end']:7.2f}  p={sum(w['p'] for w in words) / len(words):.2f}  {' '.join(w['w'] + '@' + format(w['start'], '.2f') for w in words)}")
json.dump(data, open(out, 'w'), indent=1)
