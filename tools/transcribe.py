# Free transcription of the vocal stem, to find out what the unlisted Suno tags actually sing.
#   python tools/transcribe.py work/stems/htdemucs/song/vocals.wav work/transcript.json
import json, sys
import stable_whisper

src, out = sys.argv[1], sys.argv[2]
model = stable_whisper.load_faster_whisper('large-v3', device='cpu', compute_type='int8')
res = model.transcribe(src, language='en', word_timestamps=True, vad=True, condition_on_previous_text=False,
                       initial_prompt='CodeRabbit, pull request, PR, hop hop, nope nope, force-push, console logs, ternaries')
res.save_as_json(out)
for s in res.segments:
    print(f'{s.start:7.2f} {s.end:7.2f}  {s.text.strip()}')
