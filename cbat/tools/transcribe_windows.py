# Transcribe short windows of the vocal stem on their own (whole-song passes skip the ad-lib tags).
#   python tools/transcribe_windows.py work/stems/htdemucs/song/vocals.wav 44.5:49.5 81.5:85.6 ...
import sys
import stable_whisper

src, wins = sys.argv[1], [tuple(map(float, w.split(':'))) for w in sys.argv[2:]]
audio = stable_whisper.audio.load_audio(src)  # 16 kHz mono float32
model = stable_whisper.load_faster_whisper('large-v3', device='cpu', compute_type='int8')
for a, b in wins:
    clip = audio[int(a * 16000):int(b * 16000)]
    for temp in (0.0, 0.4):
        res = model.transcribe(clip, language='en', word_timestamps=True, vad=False, temperature=temp,
                               condition_on_previous_text=False, no_speech_threshold=None, verbose=None)
        words = ' '.join(f'{w.word.strip()}@{a + w.start:.2f}' for s in res.segments for w in s.words)
        print(f'[{a}-{b}] T={temp}: {words}', flush=True)
