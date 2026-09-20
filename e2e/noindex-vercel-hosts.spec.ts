import { expect, test } from "@playwright/test";

/**
 * Geçici barındırma adresleri (*.vercel.app) arama motorlarına kapalı;
 * gerçek alan adında başlık hiç eklenmez (next.config.mjs `headers()`).
 * `Host` başlığı taklit edilir: aynı üretim sunucusu iki kimlikle sorgulanır.
 */
const NOINDEX = "noindex, nofollow, noarchive";

async function robotsHeader(
  request: import("@playwright/test").APIRequestContext,
  host: string,
  path: string,
) {
  const response = await request.get(path, { headers: { host }, maxRedirects: 0 });
  return response.headers()["x-robots-tag"];
}

test("vercel.app adresleri her yanıtta noindex başlığı taşıyor", async ({ request }) => {
  for (const host of ["hibrid-360.vercel.app", "hibrid-360-git-feat-x-bekircankllolus-projects.vercel.app"]) {
    for (const path of ["/tr", "/en/work", "/robots.txt", "/videos/hibrid-crystal-loop-20260920.webp"]) {
      expect(await robotsHeader(request, host, path), `${host}${path}`).toBe(NOINDEX);
    }
  }
});

test("özel alan adında ve benzeri adreslerde başlık YOK (canlıya geçişte kendiliğinden kalkar)", async ({ request }) => {
  for (const host of ["hibrid360.com", "www.hibrid360.com", "vercel.app.evil.com", "fooXvercelXapp"]) {
    expect(await robotsHeader(request, host, "/tr"), host).toBeUndefined();
  }
});
