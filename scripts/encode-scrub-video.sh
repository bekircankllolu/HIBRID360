#!/usr/bin/env bash
# Scroll ile oynatılan (scrub) videoları web için kodlar.
#
#   scripts/encode-scrub-video.sh <girdi> <çıktı.mp4> [crf] [css-filtre-göm: yes|no]
#
# NEDEN TAM İNTRA (-g 1): scrub videoda her scroll karesi bir `currentTime`
# ataması, yani bir seek. Normal GOP'ta (ör. 6 karede bir anahtar kare) seek
# edilen kareye ulaşmak için önceki anahtar kareden itibaren 5 kareye kadar
# çözmek gerekir. Ana sayfadaki ay videosunda ölçüldü (17 Eylül 2026):
# seek medyanı 40ms -> 15ms. 40ms'lik seek videoyu saniyede ~25 güncellemeyle
# sınırlıyor ve scroll sırasında "takılma" olarak hissediliyor.
#
# NEDEN CRF 28: tam intra her kareyi bağımsız kodladığı için aynı CRF'de
# dosya büyür. Ay videosunda CRF 24 = 7.24MB, CRF 28 = 4.75MB (eski GOP6
# dosya 4.40MB idi). %100 ölçekte kırpma karşılaştırmasında fark
# görülmedi; video ayrıca koyu bir gradyan örtünün altında gösteriliyor.
#
# NEDEN H.264 (AV1 değil): scrub sürekli seek demek; H.264 her platformda
# donanımla çözülüyor. AV1 tam intra mobilde yazılımla çözülüp daha yavaş.
#
# CSS FİLTRE GÖMME (ClosingBody): eskiden `.media { filter: saturate(1.18)
# contrast(1.02) brightness(1.1) }` vardı. Filtre her yeni kare için
# yeniden hesaplanıyordu. Aynı işlem piksellere gömülüyor:
#   - saturate: CSS'in saturate() renk matrisi (s=1.18)
#   - contrast + brightness: CSS tanımıyla aynı sıra, gama uzayında
#   - YUV<->RGB matrisi BT.601: kaynak renk etiketi taşımıyor; Chromium'da
#     ölçüldü, BT.601 CSS filtreli görüntüye BT.709'dan daha yakın çıktı
#     (ort. piksel farkı 1.33 vs 1.54, 255 üzerinden).
# !! DİKKAT: `yes` ile yalnız FİLTRESİZ ana kaynağı ver. public/ altındaki
# home-moon-scroll.mp4 artık filtre GÖMÜLÜ hâli — ona tekrar `yes` ile
# çalıştırmak filtreyi iki kez uygular. Filtresiz ana kaynak git geçmişinde:
#   git show fd4d6cf:public/videos/home-moon-scroll.mp4 > master.mp4
set -euo pipefail

INPUT="$1"
OUTPUT="$2"
CRF="${3:-28}"
BAKE="${4:-no}"

VF="format=yuv420p"
if [ "$BAKE" = "yes" ]; then
  MIX="colorchannelmixer=rr=1.14166:rg=-0.1287:rb=-0.01296:gr=-0.03834:gg=1.0513:gb=-0.01296:br=-0.03834:bg=-0.1287:bb=1.16704"
  EXPR="clip(((val/255-0.5)*1.02+0.5)*1.1*255\,0\,255)"
  LUT="lutrgb=r='$EXPR':g='$EXPR':b='$EXPR'"
  M="in_color_matrix=bt601:out_color_matrix=bt601:in_range=tv:out_range=tv"
  VF="scale=$M,format=gbrp,$MIX,$LUT,scale=$M,format=yuv420p"
fi

ffmpeg -v error -i "$INPUT" -vf "$VF" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 1 -crf "$CRF" -preset slow -tune film \
  -movflags +faststart -an -y "$OUTPUT"

echo "$OUTPUT: $(du -h "$OUTPUT" | cut -f1)"
