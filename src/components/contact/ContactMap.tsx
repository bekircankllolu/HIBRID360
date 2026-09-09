"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "./ContactMap.module.css";

const CARTO_DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * CARTO'nun "dark-matter" stilindeki yol dolgu katmanları, çalışma
 * zamanında marka sarısına (#fffc00) boyanıyor. Katman kimlikleri
 * CARTO'nun yayınladığı style.json'dan doğrudan alındı (9 Eylül 2026,
 * bkz. src/data/contact.ts "Gömülü harita" karar notu) — uydurulmadı.
 *
 * Bilinçli olarak DOKUNULMAYAN katmanlar: `*_case` (yol kenarlığı,
 * suya/karaya karşı derinlik hissi veriyor), `*_ramp` ve `*_service_fill`
 * (bağlantı yolları/sokak arkaları — CARTO'nun kendi stilinde de zaten
 * belirgin değil, hepsini sarı yapmak görsel gürültü yaratır), tünel
 * katmanları (bilerek çok koyu, "yeraltı" hissi için).
 *
 * Ana yollar tam parlaklıkta, ikincil yollar aynı sarının düşük
 * opaklıklı hali — tek renk ailesinde hiyerarşi, uydurma ikinci bir
 * ton eklemeden.
 */
const FULL_YELLOW_LAYERS = [
  "road_mot_fill_noramp",
  "road_trunk_fill_noramp",
  "road_pri_fill_noramp",
  "bridge_mot_fill",
  "bridge_trunk_fill",
];
const DIM_YELLOW_LAYERS = [
  { id: "road_sec_fill_noramp", opacity: 0.55 },
  { id: "road_minor_fill", opacity: 0.45 },
];
const BRAND_YELLOW = "#fffc00";

// MapLibre, karo (.mvt) ayrıştırma işini kendi Web Worker'ında yapar ve
// varsayılan olarak worker script'inin konumunu `import.meta.url`'den
// otomatik türetir. Next.js'in webpack paketleyicisi kütüphaneyi kendi
// hash'li chunk dosyasına gömdüğü için bu türetme kırılıyor -- worker
// hiç başlamıyor, hiçbir hata fırlatmıyor (sessizce takılıyor), sonuç
// olarak hiçbir .mvt karo isteği asla atılmıyor. Ölçüldü: style/sprite/
// tiles.json normal yükleniyor ama tek bir .mvt isteği bile çıkmıyor.
// Çözüm: worker dosyasını (+ bağımlı olduğu paylaşılan chunk'ı) public/
// altına kopyalayıp `setWorkerUrl` ile sabit bir URL'e bağlamak.
let workerUrlConfigured = false;
function ensureWorkerUrl() {
  if (workerUrlConfigured) return;
  maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
  workerUrlConfigured = true;
}

interface ContactMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
}

/**
 * Contact sayfasıyla birlikte doğrudan yüklenen, marka renklerine
 * boyanmış vektör harita. Google Maps'in yerini aldı (9 Eylül 2026) —
 * anahtar gerektirmeyen CARTO/OpenStreetMap karoları + MapLibre GL JS.
 *
 * Erişilebilir ad kasıtlı olarak burada YOK: kapsayıcı `<section>`
 * (page.tsx) zaten `aria-labelledby` ile görsel-olarak-gizli bir <h2>
 * kullanıyor. Buraya `role="img"` + `aria-label` eklemek "nested
 * interactive" ihlali yaratıyordu -- MapLibre kendi attribution
 * butonunu (gerçek, tıklanabilir bir <button>) bu kapsayıcının içine
 * enjekte ediyor; "img" rolü ilan edip içine interaktif eleman
 * koymak ekran okuyucular için çakışma. Harita gerçekten interaktif
 * (sürüklenebilir/yakınlaştırılabilir), bir resim değil.
 */
export function ContactMap({ center, zoom = 15.5 }: ContactMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ensureWorkerUrl();

    const map = new maplibregl.Map({
      container,
      style: CARTO_DARK_STYLE,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: { compact: true },
      // Google'ın eski "ctrl + kaydırma ile yakınlaştırın" uyarısıyla
      // aynı amaç: sayfa kaydırılırken haritanın fareyi "yutmasını"
      // önler.
      cooperativeGestures: true,
    });

    map.on("load", () => {
      for (const id of FULL_YELLOW_LAYERS) {
        if (map.getLayer(id)) map.setPaintProperty(id, "line-color", BRAND_YELLOW);
      }
      for (const { id, opacity } of DIM_YELLOW_LAYERS) {
        if (map.getLayer(id)) {
          map.setPaintProperty(id, "line-color", BRAND_YELLOW);
          map.setPaintProperty(id, "line-opacity", opacity);
        }
      }
    });

    const markerEl = document.createElement("div");
    markerEl.className = styles.pin;
    new maplibregl.Marker({ element: markerEl }).setLngLat([center.lng, center.lat]).addTo(map);

    return () => map.remove();
  }, [center.lat, center.lng, zoom]);

  return <div ref={containerRef} className={styles.map} />;
}
