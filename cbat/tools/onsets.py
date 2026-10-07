# Print vocal onsets (with strength) inside windows, plus the nearest tracked beats, for hand-placing hit words.
#   python tools/onsets.py work/stems/htdemucs/song/vocals.wav 121:125.4 113.8:118
import json, sys
import numpy as np
import librosa

y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
env = librosa.onset.onset_strength(y=y, sr=sr)
on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, units='frames', backtrack=False, delta=.04)
B = np.array(json.load(open('assets/beats.json'))['beats'])
for w in sys.argv[2:]:
    a, b = map(float, w.split(':'))
    print(f'--- {a}..{b}  beats: ' + ' '.join(f'b{i}@{B[i]:.2f}' for i in np.where((B >= a) & (B <= b))[0]))
    for f in on:
        t = librosa.frames_to_time(f, sr=sr)
        if a <= t <= b: print(f'  {t:7.3f}  strength {env[f]:5.1f}')
