import { expect, test } from "@playwright/test";
import { acceptCookies } from "./utils";

const chapters = [
  ["production", "production", "aperture", "PRODUCTION", "production.mp4"],
  ["post-production", "postProduction", "timeline", "POST PRODUCTION", "post-production.mp4"],
  ["digital", "digital", "cursor", "BUILT FOR THE FEED. MADE TO MOVE.", "digital.mp4"],
  ["live-broadcast", "liveBroadcast", "broadcast", "LIVE BROADCAST", "live-broadcast.mp4"],
  ["cloud-tv", "cloudTv", "cloud", "CLOUD TV", "cloud-tv.mp4"],
  ["event-management", "eventManagement", "stage", "EVENT MANAGEMENT", "event-management.mp4"],
] as const;

for (const [route, id, shape, title, videoFile] of chapters) {
  test(`${id} uses the service chapter and its own MONA form`, async ({ page }) => {
    await page.goto(`/tr/what-we-do/${route}`);
    await acceptCookies(page);
    const chapter = page.locator(`article[data-chapter="${id}"]`);
    await expect(chapter).toBeVisible();
    await expect(chapter).toHaveAttribute("data-service-shape", shape);
    await expect(chapter.getByRole("heading", { level: 1 })).toHaveAccessibleName(title);
    const shard = chapter.locator(`[data-shape="${shape}"]`);
    await expect(shard).toHaveCount(1);
    // MONA daima sağda — eskiden dereceye göre sol/sağ değişiyordu (bkz.
    // ServiceChapter.tsx side hesabının kaldırılması).
    await expect(shard).toHaveAttribute("data-side", "right");
    await expect(chapter.locator("[data-instrument]")).toHaveCount(0);
    const signatureVideo = chapter.locator("[data-signature-video]");
    await expect(signatureVideo).toHaveCount(1);
    await expect(signatureVideo.locator("source")).toHaveAttribute(
      "src",
      `/videos/service-signatures/${videoFile}`,
    );
    expect(
      await signatureVideo.evaluate((node) => {
        const video = node as HTMLVideoElement;
        return {
          autoplay: video.autoplay,
          loop: video.loop,
          muted: video.muted,
          paused: video.paused,
        };
      }),
    ).toEqual({ autoplay: false, loop: false, muted: true, paused: true });
    await expect(chapter.locator("[data-service-nav]")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}

test("imza videosunun zaman çizelgesi scroll ile ilerler, tamamlanır ve geri sarılır", async ({ page }) => {
  await page.goto("/tr/what-we-do/production");
  await acceptCookies(page);
  const scene = page.locator("[data-signature-video-scene]");
  const video = scene.locator("[data-signature-video]");

  const seekScene = async (progress: number) => {
    await scene.evaluate((node, nextProgress) => {
      const element = node as HTMLElement;
      const top = element.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      window.scrollTo(0, top + travel * nextProgress);
    }, progress);
  };

  await seekScene(0);
  await expect.poll(() => video.getAttribute("data-progress")).toBe("0.0000");

  await seekScene(0.4);
  await expect.poll(async () => {
    const state = Number(await video.getAttribute("data-progress"));
    return state > 0.4 && state < 0.6;
  }).toBe(true);

  await seekScene(0.9);
  await expect.poll(() => video.getAttribute("data-progress")).toBe("1.0000");

  await seekScene(0);
  await expect.poll(() => video.getAttribute("data-progress")).toBe("0.0000");
});

test("hareket azaltmada imza çizimi ilk kareden itibaren tamamlanmış görünür", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/tr/what-we-do/production");
  await acceptCookies(page);
  const scene = page.locator("[data-signature-video-scene]");
  const stage = scene.locator('[class*="ServiceSignatureVideo_stage"]');
  const video = scene.locator("[data-signature-video]");
  await scene.scrollIntoViewIfNeeded();
  await expect(stage).toHaveCSS("position", "relative");
  await expect.poll(() => video.getAttribute("data-progress")).toBe("1.0000");
});

test("AI keeps the original MONA hero and starts the chapter below it", async ({ page }) => {
  await page.goto("/tr/what-we-do/ai-creative-production");
  await acceptCookies(page);
  const mona = page.getByTestId("mona-stage");
  const continuation = page.locator('[data-ai-continuation]');
  await expect(mona).toBeVisible();
  await expect(continuation).toHaveAttribute("data-chapter", "aiCreativeProduction");
  expect(await mona.evaluate((node) => node.compareDocumentPosition(document.querySelector('[data-ai-continuation]')!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await expect(continuation.getByText("CREATE THE FUTURE.", { exact: true })).toBeVisible();
});

test("next chapter navigation carries the shared MONA element", async ({ page }) => {
  await page.goto("/tr/what-we-do/production");
  await acceptCookies(page);
  const shard = page.locator('[data-shape="aperture"]');
  await expect(shard).toHaveCSS("view-transition-name", "service-mona");
  await page.locator('[data-service-nav="postProduction"]').click();
  await expect(page).toHaveURL(/\/tr\/what-we-do\/post-production$/);
  await expect(page.locator('[data-shape="timeline"]')).toHaveCount(1);
});

test("Creative'ten çıkan ChapterNext geçişi de aynı View Transition yolunu kullanır, Creative bozulmaz", async ({
  page,
}) => {
  // `MonaShard.module.css`'e eklenen `view-transition-name` ve
  // `ChapterNext.tsx`'teki `startViewTransition` her sayfada paylaşılıyor —
  // Creative kendi page.tsx'i değişmeden bu yola giriyor. Riskli olan
  // senaryo: aynı isim iki kez aynı anda var olursa View Transitions API
  // hata fırlatır. Tek gerçek doğrulama, geçişi gerçekten tetiklemek.
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/tr/what-we-do/creative");
  await acceptCookies(page);
  const creativeShard = page.locator('[data-shape="lotus"]');
  await expect(creativeShard).toHaveAttribute("data-side", "right");
  await expect(creativeShard).toHaveCSS("view-transition-name", "service-mona");

  await page.locator("[data-service-nav]").click();
  await expect(page).toHaveURL(/\/tr\/what-we-do\/production$/);
  await expect(page.locator('[data-shape="aperture"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});
