/**
 * What We Do hizmet görselleri — v4 seti, tek görsel dil.
 *
 *   node scripts/generate-service-photos-v4.mjs <kaynak-klasörü>
 *
 * NEDEN (18 Eylül 2026, kullanıcı): *"what-we-do sayfası içindeki görselleri
 * revize etmek lazım. Biraz daha profesyonel ve 4K kalitesinde premium
 * görseller lazım. Bunları da Higgsfield kullanarak üret. Ama bir görsel tarz
 * oluştur ve hepsinde aynı görsel dil olsun."*
 *
 * Sorun çözünürlük değildi, DİL BİRLİĞİYDİ: sekiz hizmetin görselleri üç ayrı
 * kuşaktan geliyordu (eski site türevleri, "editorial-v2" AI seti, arşivden
 * duotone fotoğraflar) — aynı sayfada üç ayrı ışık, üç ayrı renk sıcaklığı.
 * v4'ün tamamı TEK bir prompt ailesinden üretildi; sanat yönetimi ve kabul
 * ölçütleri `docs/design/WHAT_WE_DO_VISUAL_LANGUAGE.md` içinde.
 *
 * DUOTONE KALKTI. v3'te marka birliğini duotone kuruyordu; premium hissi
 * bozan da oydu (cilt tonları kayboluyordu). v4'te birliği sahnenin KENDİSİ
 * kuruyor: siyah baskın kadraj, tek pratik sarı ışık kaynağı, tek küçük fuşya
 * gösterge, 50mm f/2 sığ alan derinliği.
 *
 * KAYNAKLAR repoda DEĞİL: her biri 5056x3392 PNG, ~20-30 MB. Higgsfield
 * iş numaraları aşağıda — gerekirse oradan yeniden indirilir. Repoya yalnız
 * 2400x1600 webp türevler giriyor (ilk yükleme bütçesi < 2 MB, CLAUDE.md).
 *
 * Higgsfield iş numaraları (model cinematic_studio_2_5, 4K, 3:2):
 *   creative        24f70652-7803-495f-8886-029c108b425a
 *   production      9235b33b-1900-4131-a2cd-7e181afff4d4
 *   postProduction  ebaffb1d-4f12-40cd-9eb3-f83969be52dd
 *   digital         f62467be-324c-41d6-bbf8-dcd3988baa36
 *   liveBroadcast   b8cc5f6c-7dad-4bd7-98af-96278cc9661c
 *   cloudTv         3f7f0da1-b447-414e-ba52-d4241bd54665
 *   eventManagement fac65623-70b9-47c5-b08a-18a8c8d2b235
 *   photography     4e8651fe-1891-40f1-8a0a-9ef790b06713
 *   creative kontak baskısı (01-04):
 *     cb505f9a-6cf9-4dcf-9526-93ea371fa2d5
 *     3d4726df-8adc-4562-8c49-e35af5615759
 *     d09ae0b3-737b-4485-831c-495b8e05baf2
 *     82f9c836-1c68-4de7-baae-567dadc05f83
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = process.argv[2];
if (!SOURCE) {
  throw new Error("Kullanım: node scripts/generate-service-photos-v4.mjs <kaynak-klasörü>");
}

/** Hizmet görselleri: 3:2, hub ve hizmet sayfasında aynı dosya kullanılıyor. */
const W = 2400;
const H = 1600;

/** Kontak baskısı kareleri daha küçük basılıyor (masaüstünde ~330px). */
const SHEET_W = 1200;
const SHEET_H = 800;

const JOBS = [
  { src: "svc-01.png", out: "images/site/services/creative-photo-v4", w: W, h: H },
  { src: "svc-02.png", out: "images/site/services/production-photo-v4", w: W, h: H },
  { src: "svc-03.png", out: "images/site/services/post-production-photo-v4", w: W, h: H },
  { src: "svc-04.png", out: "images/site/services/digital-photo-v4", w: W, h: H },
  { src: "svc-05.png", out: "images/site/services/live-broadcast-photo-v4", w: W, h: H },
  { src: "svc-06b.png", out: "images/site/services/cloud-tv-photo-v4", w: W, h: H },
  { src: "svc-07b.png", out: "images/site/services/event-management-photo-v4", w: W, h: H },
  { src: "svc-08.png", out: "images/site/services/photography-photo-v4", w: W, h: H },
  { src: "cre-01.png", out: "images/site/services/creative/sheet-01", w: SHEET_W, h: SHEET_H },
  { src: "cre-02.png", out: "images/site/services/creative/sheet-02", w: SHEET_W, h: SHEET_H },
  { src: "cre-03.png", out: "images/site/services/creative/sheet-03", w: SHEET_W, h: SHEET_H },
  { src: "cre-04.png", out: "images/site/services/creative/sheet-04", w: SHEET_W, h: SHEET_H },
];

let total = 0;

for (const job of JOBS) {
  const from = path.join(SOURCE, job.src);
  const to = path.join(ROOT, "public", `${job.out}.webp`);

  // Kaynak zaten 3:2 üretildi; `cover` yine de yazılı, çünkü modelin
  // döndürdüğü piksel ölçüsü (5056x3392 = 1.4906) tam 1.5 değil ve yuvarlama
  // farkı kırpılmazsa bir piksellik şerit bırakıyor.
  const info = await sharp(from)
    .resize(job.w, job.h, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toFile(to);

  total += info.size;
  console.log(`${job.out}.webp  ${(info.size / 1024).toFixed(0)} KB`);
}

console.log(`\nToplam ${(total / 1024).toFixed(0)} KB / ${JOBS.length} dosya`);
