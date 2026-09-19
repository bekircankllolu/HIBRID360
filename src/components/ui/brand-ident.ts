/**
 * Marka ident'i — parçacıkların hedef noktalarını METİNDEN çıkarır.
 *
 * Çizimden ayrı: burada yalnız sayı var, dolayısıyla testi var.
 *
 * 19 Eylül 2026 kullanıcı geri bildirimi: *"Works sayfasındaki şu videoyu
 * hâlâ anlayabilmiş değilim. Buraya biraz daha açıklayıcı, kendini
 * anlatan, daha yaratıcı bir video koyabiliriz. Videonun kalitesi düşük
 * gibi sanki."*
 *
 * Önceki hâl AI ile üretilmiş dönen bir parçacık küresiydi ve haklı
 * olarak hiçbir şey anlatmıyordu. Yeni hâl kelimenin tam anlamıyla
 * kendini anlatıyor: parçacıklar dağınık durumdan gelip MARKANIN ADINI
 * yazıyor, sonra dağılıyor. Üstelik bu sahne videodan değil koddan —
 * 664 KB'lık indirme tamamen kalktı ve çözünürlük ekranın çözünürlüğü.
 */

export interface Target {
  x: number;
  y: number;
}

/**
 * Verilen metni bir offscreen canvas'a çizip DOLU piksellerini örnekler.
 * Dönen noktalar parçacıkların hedefleri.
 *
 * `step` örnekleme sıklığı: 1 her pikseli alır (çok yoğun), 4 her dört
 * pikselde bir. Çağıran, istediği parçacık sayısına göre seçiyor.
 */
export function sampleText(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  font: string,
  step: number,
): Target[] {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillText(text, width / 2, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const targets: Target[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      // Alfa kanalı: harfin içi mi?
      if (data[(y * width + x) * 4 + 3] > 128) {
        targets.push({ x, y });
      }
    }
  }
  return targets;
}

/**
 * Metni kutuya sığdıran punto.
 *
 * Ölçüyü tarayıcıya ÖLÇTÜRÜYOR (`measureText`), tahmin etmiyor: Archivo
 * değişken genişlikli ve `wdth` ekseni ayarlı, dolayısıyla karakter
 * başına sabit bir katsayı yanlış sonuç veriyor. İkili arama değil tek
 * bir orantı adımı yetiyor — punto ile genişlik doğrusal.
 */
export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontTemplate: (size: number) => string,
): number {
  const probe = 100;
  ctx.font = fontTemplate(probe);
  const measured = ctx.measureText(text).width || 1;
  const byWidth = (maxWidth / measured) * probe;
  // Cap yüksekliği punto'nun ~0.7'si (Archivo 800 ölçüldü: 0.686).
  const byHeight = maxHeight / 0.7;
  return Math.max(8, Math.min(byWidth, byHeight));
}

/**
 * İlerlemeyi üç evreye böler: TOPLANMA → DURMA → DAĞILMA.
 *
 * Dönen `gather` 0 iken parçacık kendi serbest yerinde, 1 iken hedefte.
 * Orta evrede 1'de kalıyor ki yazı OKUNACAK kadar dursun — doğrudan
 * toplanıp dağılan bir animasyonda kelime seçilemiyordu.
 */
export function gatherAmount(progress: number): number {
  const IN_END = 0.42;
  const OUT_START = 0.62;
  if (progress <= 0) return 0;
  if (progress < IN_END) return easeOutCubic(progress / IN_END);
  if (progress < OUT_START) return 1;
  const out = (progress - OUT_START) / (1 - OUT_START);
  return 1 - easeInCubic(Math.min(1, out));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number): number {
  return t ** 3;
}
