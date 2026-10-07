# Track beats on the instrumental stem, estimate downbeat phase from kick/snare energy, write assets/beats.json.
#   python tools/beats.py work/stems/htdemucs/song/no_vocals.wav
import json, sys
import numpy as np
import librosa

y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
hop = 256
env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, aggregate=np.median)
tempo, frames = librosa.beat.beat_track(onset_envelope=env, sr=sr, hop_length=hop, tightness=400, units='frames')
beats = librosa.frames_to_time(frames, sr=sr, hop_length=hop)
tempo = float(np.atleast_1d(tempo)[0])
ibi = np.diff(beats)
print(f'tempo {tempo:.1f} bpm, {len(beats)} beats, first {beats[0]:.3f}, last {beats[-1]:.3f}')
print(f'ibi median {np.median(ibi):.4f}  min {ibi.min():.4f}  max {ibi.max():.4f}')

S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
lo, hi = S[(f > 30) & (f < 130)].sum(0), S[(f > 2000) & (f < 8000)].sum(0)
at = lambda band, t: band[max(0, librosa.time_to_frames(t, sr=sr, hop_length=hop) - 2):librosa.time_to_frames(t, sr=sr, hop_length=hop) + 4].max()
K = np.array([at(lo, t) for t in beats]); N = np.array([at(hi, t) for t in beats])
K /= np.percentile(K, 95); N /= np.percentile(N, 95)
for ph in range(4):
    print(f'phase {ph}: kick on bar-beat1 {K[ph::4].mean():.2f} beat3 {K[ph + 2::4].mean():.2f} | snare beat2 {N[ph + 1::4].mean():.2f} beat4 {N[ph + 3::4].mean():.2f}')
for i in range(0, len(beats) - 3, 4):
    print(f'b{i:3d} {beats[i]:7.2f} | kick ' + ' '.join(f'{K[i + k]:.1f}' for k in range(4)) + ' | snare ' + ' '.join(f'{N[i + k]:.1f}' for k in range(4)))
json.dump({'bpm_approx': round(tempo, 1), 'beats': [round(float(b), 3) for b in beats]}, open('assets/beats.json', 'w'), indent=0)
