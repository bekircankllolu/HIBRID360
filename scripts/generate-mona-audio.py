"""Generate local voice assets from the approved bilingual FAQ, never visitor text."""
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tmp/mona-tts-deps"))
import edge_tts

OPENING = {
    "id": "opening",
    "text": {
        "tr": "Merhaba. Ben MONA. Kafam biraz retro. Zevkim tamamen güncel. Burada işlerin nasıl yürüdüğünü sorabilirsin.",
        "en": "Hello. I'm MONA. My head is a little retro. My taste is entirely up to date. Ask me anything about how this place works.",
    },
}
VOICES = {"tr": "tr-TR-EmelNeural", "en": "en-US-JennyNeural"}

async def main():
    records = [OPENING] + json.loads((ROOT / "src/data/mona-faq.json").read_text(encoding="utf-8"))
    manifest_path = ROOT / "src/data/mona-audio.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    for record in records:
        for locale, voice in VOICES.items():
            folder = ROOT / "public/audio/mona" / locale
            folder.mkdir(parents=True, exist_ok=True)
            path = folder / f"{record['id']}.mp3"
            if path.exists() and path.stat().st_size > 1000:
                continue
            audio, cues = bytearray(), []
            communicate = edge_tts.Communicate(record["text"][locale], voice, rate="-4%")
            try:
                async with asyncio.timeout(75):
                    async for chunk in communicate.stream():
                        if chunk["type"] == "audio":
                            audio.extend(chunk["data"])
                        elif chunk["type"] == "SentenceBoundary":
                            cues.append({"start": chunk["offset"] / 10000000, "end": (chunk["offset"] + chunk["duration"]) / 10000000, "text": chunk["text"]})
            except Exception as error:
                print(f"FAILED {record['id']} {locale}: {error}", flush=True)
                if not manifest:
                    raise
                continue
            if len(audio) < 1000:
                raise RuntimeError("Empty speech response")
            path.write_bytes(audio)
            (folder / f"{record['id']}.json").write_text(json.dumps(cues, ensure_ascii=False), encoding="utf-8")
            manifest.setdefault(record["id"], {})[locale] = f"/audio/mona/{locale}/{record['id']}.mp3"
            manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
            print(f"OK {record['id']} {locale}: {len(audio)} bytes", flush=True)

asyncio.run(main())
