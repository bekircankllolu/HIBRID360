/**
 * What We Do hizmet görselleri — müşterinin fotoğraf arşivinden üretir.
 *
 *   node scripts/generate-service-photos.mjs <arşiv-klasörü>
 *
 * Arşiv: "hibrid-360_wb-site-fotograglar_2026-08-21_0937/wb site fotoğraglar"
 * (müşterinin 21 Ağustos 2026'da verdiği klasör).
 *
 * NEDEN: yapay zekâyla üretilmiş "editorial-v2" görsellerin yedisi aynı
 * kalıptan çıkmıştı (aynı yüzler, aynı Boğaz penceresi, aynı ışık) ve
 * kullanıcı beğenmedi (17 Eylül 2026). Yerlerine arşivdeki gerçek fotoğraflar.
 *
 * İŞLEM KURALI:
 *   - fotoğraf olanlar marka DUOTONE'u: parlaklık siyah (#000) -> marka
 *     sarısı (#FFFC00) arasına eşlenir. Yedi sayfa aynı görsel dile bağlanır,
 *     stok fotoğrafların farklı renk sıcaklıkları kaybolur.
 *   - zaten grafik olanlar ORİJİNAL renk: renk barları (anlamı rengin
 *     kendisi) ve sarı zeminli 3D illüstrasyon (zaten marka sarısı).
 *
 * KIRPIM: kaynak 3:2'ye kırpılır, kadraj sharp "attention" stratejisiyle
 * görselin en dikkat çeken bölgesine oturur. Hub (ServiceDirectory) yataya
 * yakın bir sahne, hizmet sayfası (ChapterVisualDeck) kare kırpar — 3:2 ve
 * ortada duran konu ikisinde de çalışıyor.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ARCHIVE = process.argv[2];
if (!ARCHIVE) throw new Error("Kullanım: node scripts/generate-service-photos.mjs <arşiv-klasörü>");

const W = 2400;
const H = 1600;

const JOBS = [
  { out: "creative-photo-v3", src: "_MG_0295.jpg", duotone: true },
  // Arşivde aynı silüetin sarı zeminli 1920px hâli de var (PRODUCTION/34.jpg);
  // beyaz zeminli 7680px kaynağın duotone'u aynı görüntüyü birebir #FFFC00
  // ve 4 kat çözünürlükle veriyor.
  { out: "production-photo-v3", src: "SHOOTİNG -PRODUCTION/20.png", duotone: true },
  { out: "post-production-photo-v3", src: "HİBRİD WEB SAYFASI GÖRSEL 2/22.png", duotone: true },
  { out: "live-broadcast-photo-v3", src: "LIVE BROAD CAST/11.png", duotone: true },
  { out: "event-management-photo-v3", src: "EVENT MANAGEMENT/event2.jpg", duotone: true },
  { out: "cloud-tv-photo-v3", src: "HİBRİD WEB SAYFASI GÖRSEL 2/34.png", duotone: false },
  { out: "digital-photo-v3", src: "14.jpg", duotone: false },
];

for (const job of JOBS) {
  const input = path.join(ARCHIVE, job.src);
  const base = sharp(input).rotate().resize(W, H, { fit: "cover", position: sharp.strategy.attention });
  let pipeline;
  if (job.duotone) {
    const { data } = await base.greyscale().normalise().raw().toBuffer({ resolveWithObject: true });
    const rgb = Buffer.alloc(W * H * 3);
    for (let i = 0; i < W * H; i++) {
      const l = data[i];
      rgb[i * 3] = l;
      rgb[i * 3 + 1] = Math.round((l * 252) / 255);
      rgb[i * 3 + 2] = 0;
    }
    pipeline = sharp(rgb, { raw: { width: W, height: H, channels: 3 } });
  } else {
    pipeline = base;
  }
  const outFile = path.join(ROOT, "public/images/site/services", `${job.out}.webp`);
  const info = await pipeline.webp({ quality: 82 }).toFile(outFile);
  console.log(`  ${job.out}.webp  ${(info.size / 1024).toFixed(0)} KB  ${job.duotone ? "duotone" : "orijinal"}`);
}
