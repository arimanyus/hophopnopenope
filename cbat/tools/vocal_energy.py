# Print the vocal stem's loudness in 0.1 s steps over given windows, to see where vocals really are.
#   python tools/vocal_energy.py work/stems/htdemucs/song/vocals.wav 44:49 64:70 81:88 100:106 117:128
import sys
import numpy as np
import soundfile as sf

x, sr = sf.read(sys.argv[1])
x = x.mean(axis=1) if x.ndim > 1 else x
hop = int(sr * .1)
db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same'))[::hop] + 1e-9)
ref = np.percentile(db, 95)
for w in sys.argv[2:]:
    a, b = map(float, w.split(':'))
    print(f'--- {a}..{b} s  (0 dB = loud vocal)')
    for i in range(int(a * 10), int(b * 10)):
        v = db[i] - ref
        print(f'{i / 10:6.1f} {v:6.1f} ' + '#' * max(0, int((v + 40) / 1.5)))
