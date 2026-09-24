# Merge the refined alignment with the display text and write assets/lyrics_timed.json + assets/CodeRabbit_Pause.srt.
#   python tools/finalize.py
import json

ref = json.load(open('work/refined.json'))['lines']
CH = lambda n, a='nope', b='hop': [f'{n} comments on your PR ({b}! {b}!)', f'Did anybody read a single one? ({a}! {a}!)',
                                   'Click, click, resolve all, thumbs up, amen', "Hop, hop, guess I'll write 'em all again"]
DISPLAY = ['Ninety seconds on the clock', 'Down the rabbit hole, tick, tick, tock',
           'Ping in the burrow, my ears stand tall', '"Small fix," fourteen thousand lines in all',
           'Nested ternaries, a function called "fix"', 'Forty-six console logs left in the mix',
           'A secret key committed, plain as day', "The tests all pass 'cause they're skipped anyway",
           *CH('Three little'), 'Sixty seconds, force-push on the branch', 'Whole review gone, never had a chance',
           'You said "it\'s never null" like you\'re the king', "I drew a diagram, you didn't read a thing",
           'You typed "CodeRabbit, pause," like I\'m to blame', 'I wrote a poem for you all the same',
           *CH('Forty little'), 'Line nine thousand twelve, now what is this?', 'Unsanitized input, there it is',
           'I flagged it red, in all caps, with my paw', 'You clicked on merge and then you shipped the flaw',
           'Four hundred comments on your PR (hop! hop!)', 'So now you wanna read a single one? (yep! yep!)',
           "It's three a.m., prod's down, who could've known?", 'You scroll back to my comment and you groan',
           'As mentioned above.', 'As mentioned above.']

# Hand-checked fixes (see work/ notes): intro ticks from the vocal-energy bursts; chorus-1 hit pairs from the matching
# chorus-2 onsets (same melody, 37.175 s later); Ping on the 10.449 downbeat onset.
FIX = {(1, 4): 6.13, (1, 5): 6.73, (1, 6): 7.38, (2, 0): 10.449, (8, 6): 35.225, (8, 7): 35.596,
       (9, 6): 38.429, (9, 7): 38.731, (10, 0): 38.986, (10, 1): 39.497, (18, 7): 72.771, (21, 0): 79.621}
HOLD = {'again': [(11, 47.80), (21, 85.30)], 'same': [(17, 69.50)], 'flaw': [(25, 104.80)], 'groan': [(29, 119.90)]}
END = {1: 7.85, 30: 122.25, 31: 126.70}
MEDIUM = {1: 'tick/tick/tock placed from vocal-energy bursts; the aligner and transcriber disagreed'}

lines = []
for i, (L, disp) in enumerate(zip(ref, DISPLAY)):
    toks = disp.split()
    assert len(toks) == len(L['words']), (i, toks, [w['w'] for w in L['words']])
    words = []
    for j, (tok, w) in enumerate(zip(toks, L['words'])):
        s = FIX.get((i, j), w['start'])
        words.append({'w': tok, 'start': round(s, 3), 'end': round(w['end'], 3)})
    for j in range(len(words) - 1):  # keep words ordered and non-overlapping after fixes
        words[j]['end'] = round(min(max(words[j]['end'], words[j]['start'] + .08), words[j + 1]['start']), 3)
    line = {'section': L['section'], 'text': disp, 'start': words[0]['start'], 'end': END.get(i, words[-1]['end']),
            'confidence': 'medium' if i in MEDIUM else 'high', 'words': words}
    if i in END: words[-1]['end'] = END[i]
    for held, spots in HOLD.items():
        for k, e in spots:
            if k == i:
                line['hold'] = {'word': held, 'until': e}; line['end'] = e
    if i in MEDIUM: line['note'] = MEDIUM[i]
    lines.append(line)

out = {
    'duration': 128.64, 'bpm': 142.2,
    'note': 'Word times from stable-ts forced alignment (faster-whisper large-v3) on a Demucs vocal stem, cross-checked '
            'against a free transcription and per-window passes; hit words snapped to vocal onsets. Beat grid drifts '
            'up to ~0.13 s from a constant tempo; use beats[] for sync, not a fixed BPM.',
    'tags': [
        {'slot': [44.42, 47.88], 'what': 'held melisma on "again" (end of chorus 1): the "extra verse-2 slot". Verse 2 starts at 47.88, half a line late.'},
        {'slot': [67.18, 69.50], 'what': 'held "same" (end of verse 2) leading into chorus 2'},
        {'slot': [81.54, 85.30], 'what': 'chorus-2 tag: long rising melisma on "again"; silence 85.3-87.7'},
        {'slot': [101.06, 104.80], 'what': 'bridge tag: rising held "flaw" (G4 up to E5)'},
        {'slot': [117.06, 122.25], 'what': 'final tag: held "groan" (117.1-119.9), then a SUNG "As mentioned above" (120.0-122.25); silence 122.3-125.6 before the spoken one'},
    ],
    'lines': lines,
}
json.dump(out, open('assets/lyrics_timed.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

fmt = lambda t: f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}'
srt = []
for n, L in enumerate(lines, 1):
    srt += [str(n), f"{fmt(L['start'])} --> {fmt(L['end'])}", f"[{L['section']}] {L['text']}" + (f" (held: {L['hold']['word']})" if 'hold' in L else ''), '']
open('assets/CodeRabbit_Pause.srt', 'w', encoding='utf-8').write('\n'.join(srt))
for L in lines: print(f"{L['section']:13s} {L['start']:7.2f}-{L['end']:7.2f} {L['confidence']:6s} {L['text']}")
