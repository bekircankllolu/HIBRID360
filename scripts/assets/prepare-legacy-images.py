#!/usr/bin/env python3
"""Eski hibrid360.com görsellerinden web türevleri üretir.

NE ÜRETİR
---------
İstenen kaynaklarda eski sitenin **sarı/yeşil filtresi** marka sistemine
göre yeniden türetilir: görsel önce parlaklığa (luminance) indirgenir,
sonra siyah → marka sarısı (#FFFC00) rampasından geçirilir. Eski dosyada
bu filtre zaten pişmişti ama tonu marka sarısı değil zeytin yeşiliydi;
kaynağın kendisinden yeniden üretmek onu marka paletine oturtuyor.
Gamma 1.6, orta tonları koyu tutmak için: üstüne gelen beyaz metin
WCAG AA'yı bir gradyan perde ile sağlıyor (bkz. sayfa CSS'i).

Her kaynak için iki genişlikte (1600w, 2560w — kaynak daha darsa yalnızca
sığanlar) WebP **ve** AVIF türevi. AVIF önce denenir, tarayıcı
desteklemiyorsa WebP'ye düşer (bkz. sayfalardaki <picture> blokları).

KULLANIM
--------
    python scripts/assets/prepare-legacy-images.py            # public/ altına yazar
    python scripts/assets/prepare-legacy-images.py <dizin>    # başka bir yere

Betik kaynağı indirir, sha256'sını aşağıdaki manifest değeriyle
karşılaştırır (kaynak değiştiyse uyarır), türevleri üretir ve ölçülen
boyut/bayt/hash'i JSON olarak basar. Çıktı `docs/content/`
LEGACY_CONTENT_ROUTE_MAP.md'deki tabloyla karşılaştırılabilir.

TELİF NOTU — KAPANMADI
----------------------
Türevler artık depoda (müşterinin 29 Ağustos 2026 talimatı: eski sitedeki
bu görseller korunacak). Bu, telif teyidinin geldiği anlamına **gelmez**:

  * `little_prince.png` — Saint-Exupéry eseri, ticari kullanım büyük
    olasılıkla lisans gerektirir. EN YÜKSEK RİSKLİ MADDE.
  * `ataturk.jpg` — baskı/restorasyon hakkı ve arşiv kaynağı bilinmiyor.

İkisi de docs/content/LEGACY_CONTENT_ROUTE_MAP.md ve
docs/visual-audit/BLOCKERS.md içinde AÇIK blocker olarak duruyor ve
yayın öncesi kapatılmalı.

`kadin.jpg` (eski What We Believe kapak görseli) bilerek **alınmadı**:
tanınabilir bir kişinin portresi ve model rıza kaydı yok — Atatürk ve
Küçük Prens bölümlerinden farklı, ayrıca bu revizyonda istenmedi.

Gereksinim: Pillow (AVIF için 11.3+ veya pillow-avif-plugin).
"""
import hashlib
import io
import json
import os
import sys
import urllib.request

BASE = "https://hibrid360.com/assets/img/"
DEFAULT_OUT = os.path.join("public", "images", "site")

# Kaynak sha256'ları 2026-08-29'da ölçüldü.
SOURCES = [
    {
        "legacy": "contact/contact-bg.jpg",
        "dir": "contact",
        "out": "istanbul-panorama",
        "sha256": "0807d0a17f649783bf92fab0c92f650edd3b7007a2024e1c4b4932e5ad7996ea",
        # Gri tonlama gece çekimi; siyah zemine olduğu gibi oturuyor,
        # duotone uygulanmıyor.
        "duotone": False,
        "note": "İstanbul panoraması — eski Contact hero arka planı",
    },
    {
        "legacy": "ataturk.jpg",
        "dir": "what-we-believe",
        "out": "ataturk",
        "sha256": "820cede696bdc080998c699ff1d93f95cf2890c578bfeca2eaef8d31c1569d88",
        "duotone": True,
        "note": '"Everything in the world created by women" alıntısının arka planı',
    },
    {
        "legacy": "little_prince.png",
        "dir": "what-we-believe",
        "out": "little-prince",
        "sha256": "fb3149535122cae3479b84c0f3c8773f76c3a1d04d66e3276b5629cf41929580",
        "duotone": True,
        "note": "Küçük Prens alıntısının arka planı",
    },
]

# Marka renkleri — CLAUDE.md "Marka sistemi (sabit)".
BRAND_BLACK = (0, 0, 0)
BRAND_YELLOW = (255, 252, 0)
DUOTONE_GAMMA = 1.6

WIDTHS = (1600, 2560)
WEBP_QUALITY = 80
AVIF_QUALITY = 55  # AVIF aynı görsel kalitede WebP'den düşük sayı ister


def duotone(gray, shadow, highlight, gamma):
    """Parlaklığı shadow→highlight rampasına eşler (kanal başına LUT)."""
    channels = []
    for c in range(3):
        lut = [
            round(shadow[c] + (highlight[c] - shadow[c]) * (i / 255) ** gamma)
            for i in range(256)
        ]
        channels.append(gray.point(lut))
    from PIL import Image as _Image

    return _Image.merge("RGB", channels)


def main() -> int:
    # Windows konsolu cp1254 olabiliyor; manifest her zaman UTF-8 yazılır.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    out_root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT

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
        if src["sha256"] and digest != src["sha256"]:
            print(f"UYARI: {src['legacy']} kaynağı değişmiş. sha256={digest}")

        out_dir = os.path.join(out_root, src["dir"])
        os.makedirs(out_dir, exist_ok=True)

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
        if src["duotone"]:
            from PIL import ImageOps

            rgb = duotone(
                ImageOps.grayscale(rgb), BRAND_BLACK, BRAND_YELLOW, DUOTONE_GAMMA
            )
            entry["treatment"] = (
                f"duotone {BRAND_BLACK} -> {BRAND_YELLOW}, gamma {DUOTONE_GAMMA}"
            )

        for width in WIDTHS:
            if width > image.width:
                continue
            height = round(image.height * width / image.width)
            resized = rgb.resize((width, height), Image.LANCZOS)
            # Kaynak metadata'sını TAŞIMA. contact-bg.jpg gri tonlama
            # (mode "L") ve 912 baytlık tek kanallı bir ICC profili
            # taşıyor; Pillow bunu RGB'ye çevrilmiş görüntünün AVIF
            # çıktısına da yazıyor ve Chromium o dosyayı **çözemiyor**
            # (sessizce kırık görsel; <picture> type fallback'i devreye
            # girmiyor çünkü sorun destek değil, çözümleme).
            # Ayrıca EXIF/XMP'yi de web türevine taşımanın anlamı yok.
            resized.info = {}

            for fmt, params in (
                ("WEBP", {"quality": WEBP_QUALITY, "method": 6}),
                ("AVIF", {"quality": AVIF_QUALITY}),
            ):
                name = f"{src['out']}-{width}w.{fmt.lower()}"
                path = os.path.join(out_dir, name)
                resized.save(path, fmt, **params)
                data = open(path, "rb").read()
                entry["derivatives"].append(
                    {
                        "file": f"{src['dir']}/{name}",
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
