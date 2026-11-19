"""Pre-generate the app's voices with VieNeu-TTS (https://github.com/pnnbao97/VieNeu-TTS, Apache 2.0).

Reads tools/tts/catalog.json (written by `npm run tts:export` in web/), synthesises every clip that is
not on disk yet, encodes it as a small mono MP3 in web/public/tts/<key>.mp3 and rewrites
web/public/tts/manifest.json. Safe to stop and rerun: existing clips are skipped.

    pip install vieneu av numpy
    python tools/tts/generate.py            # everything missing
    python tools/tts/generate.py --group mascot --limit 20
    python tools/tts/generate.py --prune    # also delete clips no longer in the catalog
"""
import argparse
import json
import sys
import time
from fractions import Fraction
from pathlib import Path

import av
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "tools/tts/catalog.json"
OUT = ROOT / "web/public/tts"
SAMPLE_RATE = 24_000
BITRATE = 40_000


def clip_key(voice: str, text: str) -> str:
    """Mirror of clipKey() in web/src/lib/tts.ts."""
    data = f"{voice}|{text.strip()}".encode("utf-8")

    def fnv(seed: int) -> str:
        h = seed & 0xFFFFFFFF
        for b in data:
            h = ((h ^ b) * 16777619) & 0xFFFFFFFF
        return f"{h:08x}"

    return fnv(2166136261) + fnv(0x811C9DC5 ^ 0x5BD1E995)


def encode_mp3(samples: np.ndarray, sr: int, path: Path) -> None:
    pcm = np.clip(np.asarray(samples, dtype=np.float32).reshape(-1), -1, 1)
    # Trim leading/trailing near-silence, keep 80 ms of padding.
    loud = np.flatnonzero(np.abs(pcm) > 0.01)
    if loud.size:
        pad = int(0.08 * sr)
        pcm = pcm[max(0, loud[0] - pad) : loud[-1] + pad]
    tmp = path.with_suffix(".part")
    with av.open(str(tmp), "w", format="mp3") as out:
        stream = out.add_stream("libmp3lame", rate=SAMPLE_RATE)
        stream.layout = "mono"
        stream.bit_rate = BITRATE
        frame = av.AudioFrame.from_ndarray(pcm[np.newaxis, :], format="fltp", layout="mono")
        frame.sample_rate = sr
        frame.time_base = Fraction(1, sr)
        resampler = av.AudioResampler(format=stream.codec_context.format, layout="mono", rate=SAMPLE_RATE)
        for f in resampler.resample(frame) + resampler.resample(None):
            for packet in stream.encode(f):
                out.mux(packet)
        for packet in stream.encode(None):
            out.mux(packet)
    tmp.replace(path)


def write_manifest(keys: set[str]) -> None:
    present = sorted(k for k in keys if (OUT / f"{k}.mp3").exists())
    (OUT / "manifest.json").write_text(json.dumps({"engine": "VieNeu-TTS v3 Turbo", "keys": present}, separators=(",", ":")))
    print(f"manifest: {len(present)} clips", flush=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--group", help="only this catalog group (part2, part3, vocab, mascot…)")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--prune", action="store_true")
    args = ap.parse_args()

    catalog = json.loads(CATALOG.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    all_keys = {clip_key(c["voice"], c["text"]) for c in catalog}
    todo = [c for c in catalog if not args.group or c["group"] == args.group]
    todo = [c for c in todo if not (OUT / f"{clip_key(c['voice'], c['text'])}.mp3").exists()]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(catalog)} in catalog, {len(todo)} to generate", flush=True)

    if todo:
        from vieneu import Vieneu

        tts = Vieneu()
        sr = int(getattr(tts, "sample_rate", 48_000))
        t0 = time.time()
        for i, c in enumerate(todo, 1):
            key = clip_key(c["voice"], c["text"])
            try:
                encode_mp3(tts.infer(c["text"], voice=c["voice"]), sr, OUT / f"{key}.mp3")
            except Exception as e:  # keep going; a missing clip falls back to browser speech
                print(f"FAILED {c['group']} {c['text'][:50]!r}: {e}", flush=True)
            if i % 25 == 0 or i == len(todo):
                rate = (time.time() - t0) / i
                print(f"{i}/{len(todo)} · {rate:.1f}s/clip · ~{rate * (len(todo) - i) / 60:.0f} min left", flush=True)
                write_manifest(all_keys)

    if args.prune:
        for f in OUT.glob("*.mp3"):
            if f.stem not in all_keys:
                f.unlink()
    write_manifest(all_keys)
    return 0


if __name__ == "__main__":
    sys.exit(main())
