# Snap the beat grid to the drum onsets and list the kick and snare hits; write assets/drums.json.
# The tracked beats (tools/beats.py) lag the drum attacks by ~43 ms. The groove alternates kick on odd beat
# indices and snare on even ones, so hits are labelled by phase and kept only where the drum stem plays.
#   python -m demucs -n htdemucs -o work/stems4 assets/song.mp3
#   python tools/drums.py
import json
import numpy as np
import librosa

y, sr = librosa.load('work/stems4/htdemucs/song/drums.wav', sr=22050, mono=True)
beats = np.array(json.load(open('assets/beats.json'))['beats'])
hop = 128
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop)); f = librosa.fft_frequencies(sr=sr, n_fft=1024)
e = np.log1p(S[(f >= 35) & (f < 5000)].sum(0))
flux = np.maximum(0, np.diff(e, prepend=e[0]))
pk = librosa.util.peak_pick(flux, pre_max=6, post_max=6, pre_avg=30, post_avg=30, delta=.12 * flux.max(), wait=int(.1 * sr / hop))
on = librosa.frames_to_time(pk, sr=sr, hop_length=hop)

near = np.abs(on[None, :] - beats[:, None]).argmin(1)
d = on[near] - beats
hit = np.abs(d) < .07
off = float(np.median(d[hit]))
grid = np.where(hit, on[near], beats + off)
kicks = [round(float(t), 3) for i, t in enumerate(grid) if hit[i] and i % 2 == 1]
snares = [round(float(t), 3) for i, t in enumerate(grid) if hit[i] and i % 2 == 0]
print(f'offset {off * 1000:.0f} ms, {hit.sum()}/{len(beats)} beats on a drum hit, {len(kicks)} kicks, {len(snares)} snares')
for a in range(0, 170, 10):
    print(f'{a:3d}s  kicks {sum(a <= t < a + 10 for t in kicks):3d}  snares {sum(a <= t < a + 10 for t in snares):3d}')
json.dump({'offset': round(off, 3), 'beats': [round(float(t), 3) for t in grid], 'kicks': kicks, 'snares': snares}, open('assets/drums.json', 'w'))
