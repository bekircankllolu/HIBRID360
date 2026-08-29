#!/usr/bin/env python3
"""Eski hibrid360.com görsellerinden web türevleri üretir.

NEDEN BU DEPODA BINARY YOK
--------------------------
Bu depo **herkese açık**. Aşağıdaki görsellerin telif/kullanım hakkı
doğrulanmadı (Atatürk fotoğrafının kaynağı belirsiz; Küçük Prens
illüstrasyonu büyük olasılıkla hâlâ korumalı; kadın fotoğrafı muhtemelen
stok). Doğrulanmamış üçüncü taraf görselini herkese açık bir depoya
koymak, yayına almanın kendisi kadar riskli. Bu yüzden depoda yalnızca
**bu betik ve manifest** duruyor; ikili dosyalar değil.

Telif teyidi gelince türevler `public/images/site/what-we-believe/`
altına alınır ve `src/data/site-images.ts`'e bağlanır.

KULLANIM
--------
    python scripts/assets/prepare-legacy-images.py <cikis-dizini>

Betik kaynağı indirir, sha256'sını manifest'teki değerle karşılaştırır
(kaynak değiştiyse uyarır), sonra WebP türevlerini üretir ve ölçülen
boyut/hash'i basar. Çıktı dizini depo dışında olmalı.

Gereksinim: Pillow (yerelde zaten kurulu; depoya bağımlılık eklenmedi).
"""
import hashlib
import io
import json
import os
import sys
import urllib.request

BASE = "https://hibrid360.com/assets/img/"

# Kaynak sha256'ları 2026-08-29'da ölçüldü (bkz.
# docs/content/LEGACY_CONTENT_ROUTE_MAP.md).
SOURCES = [
    {
        "legacy": "ataturk.jpg",
        "out": "what-we-believe-quote-women-bg",
        "sha256": "820cede696bdc080998c699ff1d93f95cf2890c578bfeca2eaef8d31c1569d88",
        "note": '"Everything in the world created by women" alıntısının arka planı',
    },
    {
        "legacy": "little_prince.png",
        "out": "what-we-believe-quote-little-prince-bg",
        "sha256": "fb3149535122cae3479b84c0f3c8773f76c3a1d04d66e3276b5629cf41929580",
        "note": "Küçük Prens alıntısının arka planı",
    },
    {
        "legacy": "kadin.jpg",
        "out": "what-we-believe-hero-cover",
        "sha256": "051f3aacd7912c29ec06ee163b67d867ea4eadc0a9f8da4baf9e15e8312c149c",
        "note": "Sayfa hero kapak görseli",
    },
]

WIDTHS = (1600, 2560)
QUALITY = 80


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)

    try:
        from PIL import Image
    except ImportError:
        print("Pillow gerekli:  python -m pip install Pillow")
        return 1

    manifest = []
    for src in SOURCES:
        url = BASE + src["legacy"]
        raw = urllib.request.urlopen(url, timeout=60).read()
        digest = hashlib.sha256(raw).hexdigest()
        if not digest.startswith(src["sha256"][:16]):
            print(f"UYARI: {src['legacy']} kaynağı değişmiş. sha256={digest}")

        image = Image.open(io.BytesIO(raw))
        entry = {
            "legacySrc": f"/assets/img/{src['legacy']}",
            "note": src["note"],
            "source": {
                "format": image.format,
                "size": f"{image.width}x{image.height}",
                "mode": image.mode,
                "bytes": len(raw),
                "sha256": digest,
            },
            "derivatives": [],
        }

        rgb = image.convert("RGB")
        for width in WIDTHS:
            if width > image.width:
                continue
            height = round(image.height * width / image.width)
            name = f"{src['out']}-{width}w.webp"
            path = os.path.join(out_dir, name)
            rgb.resize((width, height), Image.LANCZOS).save(
                path, "WEBP", quality=QUALITY, method=6
            )
            data = open(path, "rb").read()
            entry["derivatives"].append(
                {
                    "file": name,
                    "size": f"{width}x{height}",
                    "bytes": len(data),
                    "sha256": hashlib.sha256(data).hexdigest(),
                }
            )
        manifest.append(entry)

    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
