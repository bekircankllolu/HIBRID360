import type { InsightsPost } from "@/types/content";

/**
 * Faz 1 — Insights içerik motoru iskeleti.
 *
 * brief-rev12.md Bölüm 20.6, "İlk altı yazının konusu (öneri)" listesinden
 * ilk iki başlık burada gerçek metin olarak yer alıyor. Ancak brief'te
 * yalnızca başlıklar var — gövde metni, "her yazıda bulunması zorunlu dört
 * şey" (rakamlı iddialar, isimli alıntı, dış kaynak linkleri, özet) henüz
 * yazılmadı. CLAUDE.md kuralı gereği (lorem/sahte metin yasak) bu yazılar
 * `is_published: false` ile tutuluyor; body_tr/body_en dolana kadar
 * yayınlanmayacaklar.
 *
 * TODO: docs/DECISIONS.md — bu liste resmi bir [KARAR] maddesi değil, ama
 * gövde metinleri hazır olmadan yayınlanamayacağı için pratikte aynı
 * kategoride bir blocker. Metin geldiğinde body_tr/body_en doldurulup
 * is_published: true yapılacak.
 */
export const insightsPosts: InsightsPost[] = [
  {
    id: "insight-1",
    slug: "tek-cekim-gununden-dokuz-film",
    title_tr: "Tek çekim gününden dokuz film çıkarmak: kapsam planı nasıl kurulur",
    title_en: "Nine films from one shoot day: how we build the coverage plan",
    summary_tr: null,
    summary_en: null,
    body_tr: null,
    body_en: null,
    cover_image_url: null,
    category: "Prodüksiyon",
    published_at: null,
    last_reviewed_at: null,
    author_name: null,
    author_title: null,
    is_published: false,
  },
  {
    id: "insight-2",
    slug: "ai-ile-reklam-filmi-uretimi-2026",
    title_tr: "AI ile reklam filmi üretimi: 2026'da ne değişti, ne değişmedi",
    title_en: "AI in ad film production: what changed in 2026, what didn't",
    summary_tr: null,
    summary_en: null,
    body_tr: null,
    body_en: null,
    cover_image_url: null,
    category: "AI",
    published_at: null,
    last_reviewed_at: null,
    author_name: null,
    author_title: null,
    is_published: false,
  },
];
