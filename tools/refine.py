# Refine the forced alignment: fix first words that DTW stretched over a preceding held note, snap percussive
# hit words to vocal onsets, measure the held notes with pYIN, and write assets/lyrics_timed.json + the SRT.
#   python tools/refine.py work/stems/htdemucs/song/vocals.wav work/aligned.json
import json, sys
import numpy as np
import librosa

src, aligned = sys.argv[1], json.load(open(sys.argv[2]))
y, sr = librosa.load(src, sr=22050, mono=True)
beats = json.load(open('assets/beats.json'))['beats']

# First-word starts from the per-window transcriptions (the aligner smeared these back over the held note before).
FIRST = {('intro', 1): None, ('chorus1', 0): 32.22, ('verse2', 0): 47.88, ('chorus2', 0): 69.60,
         ('final_chorus', 0): 104.94, ('final_tag', 0): 120.00}
WINDOW_WORDS = {('final_tag', 0): [120.00, 120.68, 121.36]}  # "As mentioned above" (sung), from the window pass
HITS = {'hop', 'nope', 'yep', 'click', 'tick', 'tock', 'ping'}

onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time', backtrack=True, delta=.05)
env = librosa.onset.onset_strength(y=y, sr=sr)
def snap(t, rad=.18):
    c = onsets[np.abs(onsets - t) <= rad]
    if not len(c): return t, False
    fr = librosa.time_to_frames(c, sr=sr)
    return float(c[np.argmax(env[np.clip(fr, 0, len(env) - 1)])]), True

def voiced(a, b):
    seg = y[int(a * sr):int(b * sr)]
    f0, vflag, _ = librosa.pyin(seg, fmin=80, fmax=900, sr=sr, frame_length=2048)
    step = int(.25 / (512 / sr))
    rows = []
    for i in range(0, len(f0), step):
        f, v = f0[i:i + step], vflag[i:i + step]
        f = f[~np.isnan(f)]
        rows.append(f"{a + i * 512 / sr:6.2f} {'V' if v.mean() > .5 else '.'} {librosa.hz_to_note(np.median(f), unicode=False) if len(f) else '--':>4}")
    return vflag.mean(), rows

counts = {}
lines = []
for L in aligned:
    k = (L['section'], counts.get(L['section'], 0)); counts[L['section']] = k[1] + 1
    W = L['words']
    if k in WINDOW_WORDS:
        for w, t in zip(W, WINDOW_WORDS[k]): w['start'] = t
        for i in range(len(W) - 1): W[i]['end'] = W[i + 1]['start']
    elif FIRST.get(k):
        W[0]['start'] = FIRST[k]; W[0]['end'] = min(W[1]['start'], FIRST[k] + .6)
    for w in W:
        if w['w'].strip(',.?!').lower() in HITS:
            t, ok = snap(w['start']); w['start'] = round(t, 3); w['snapped'] = ok
    # "tock" was stretched to the next line; the sung word is short, so cap its end at 0.6 s.
    for i, w in enumerate(W):
        nxt = W[i + 1]['start'] if i + 1 < len(W) else None
        if nxt is not None and w['end'] > nxt: w['end'] = nxt
        if w['end'] - w['start'] > 1.2 and i == len(W) - 1 and L['section'] == 'intro': w['end'] = w['start'] + .6
    lines.append({**L, 'start': W[0]['start'], 'end': W[-1]['end'], 'words': W})

# tick, tick, tock: the aligner put "tock" at 9.7 s; find it as the strongest onset between the 2nd tick and 8.2 s.
intro2 = lines[1]['words']
c = onsets[(onsets > intro2[5]['start'] + .25) & (onsets < 8.2)]
if len(c):
    fr = librosa.time_to_frames(c, sr=sr); t = float(c[np.argmax(env[fr])])
    intro2[6]['start'], intro2[6]['end'] = round(t, 3), round(t + .5, 3); lines[1]['end'] = intro2[6]['end']

print('--- held-note check (pYIN voicing, median pitch per 0.25 s)')
HELD = [('verse2_extra', 'again', 44.42, 47.88), ('verse2_tail', 'same', 67.18, 69.60), ('chorus2_tag', 'again', 81.54, 85.30),
        ('bridge_tag', 'flaw', 101.06, 104.94), ('final_tag_held', 'groan', 117.06, 120.00)]
held = []
for name, word, a, b in HELD:
    v, rows = voiced(a, b)
    print(f'{name} "{word}" {a}-{b}: voiced {v:.0%}'); print('   ' + ' | '.join(rows))
    held.append({'section': name, 'held_word': word, 'start': a, 'end': b, 'voiced': round(float(v), 2)})

for L in lines:
    print(f"{L['section']:13s} {L['start']:7.2f} {L['end']:7.2f}  " + ' '.join(f"{w['w']}@{w['start']:.2f}{'*' if w.get('snapped') else ''}" for w in L['words']))
json.dump({'lines': lines, 'held': held, 'onsets': [round(float(o), 3) for o in onsets]}, open('work/refined.json', 'w'), indent=1)
