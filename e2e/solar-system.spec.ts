import { expect, test, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { acceptCookies } from "./utils";
import {
  CRYSTAL_MEDIA,
  orbitStones,
  ORBIT_RINGS,
  ORBIT_TILT,
  ORBIT_VIEW,
} from "../src/data/solar-system";

const title = "One Hybrid Production Ecosystem.";

async function aimAtMovingPoint(page: Page, button: Locator) {
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(button).toBeVisible();
}
const services = [
  "PRODUCTION",
  "DIGITAL",
  "CREATIVE",
  "AI",
  "LIVE BROADCAST",
  "PHOTOGRAPHY",
  "POST PRODUCTION",
  "EVENTS",
];

async function openScene(page: Page, locale = "tr", reduced = false) {
  await page.goto(`/${locale}`);
  await acceptCookies(page);
  const stage = page.getByTestId("ecosystem-stage");
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute(
    "data-motion",
    reduced ? "paused" : "running",
  );
  if (!reduced) {
    await expect
      .poll(() =>
        stage.locator("video").evaluate((v: HTMLVideoElement) => v.readyState),
      )
      .toBeGreaterThanOrEqual(2);
    await expect
      .poll(() =>
        stage.locator("canvas").evaluate((c: HTMLCanvasElement) => {
          const data = c
            .getContext("2d")!
            .getImageData(
              c.width * 0.44,
              c.height * 0.42,
              c.width * 0.12,
              c.height * 0.15,
            ).data;
          let bright = 0;
          for (let i = 0; i < data.length; i += 4) if (data[i] > 100) bright++;
          return bright;
        }),
      )
      .toBeGreaterThan(100);
  }
  return {
    stage,
    region: page.getByRole("region", { name: title, exact: true }),
    video: stage.locator("video"),
  };
}

test("crystal pauses on hover, ignores scroll while held, then resumes", async ({
  page,
}) => {
  const { video } = await openScene(page);
  await page.getByTestId("crystal-hit").hover();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  const held = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.mouse.wheel(0, 24);
  await page.waitForTimeout(250);
  expect(
    await video.evaluate((v: HTMLVideoElement) => v.currentTime),
  ).toBeCloseTo(held, 1);
  await page.mouse.move(2, 100);
  await expect
    .poll(() =>
      video.evaluate((v: HTMLVideoElement) => ({
        mode: v.parentElement!.dataset.mediaMode,
        paused: v.paused,
        seeking: v.seeking,
        readyState: v.readyState,
        currentTime: v.currentTime,
        duration: v.duration,
      })),
    )
    .toMatchObject({ mode: "idle", paused: false });
});

test("scroll scrubs in both directions without resetting playback", async ({
  page,
}) => {
  const { stage, video } = await openScene(page);
  await page.mouse.move(5, 150);
  const duration = await video.evaluate((v: HTMLVideoElement) => v.duration);
  const before = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  const samples: unknown[] = [];
  await page.mouse.wheel(0, 120);
  await expect(stage).toHaveAttribute("data-media-mode", "scrub");
  await expect
    .poll(async () => {
      const state = await video.evaluate((v: HTMLVideoElement) => ({
        time: v.currentTime,
        mode: v.parentElement!.dataset.mediaMode,
        paused: v.paused,
        seeking: v.seeking,
        ready: v.readyState,
        scroll: scrollY,
      }));
      samples.push(state);
      return ((state.time - before + duration * 1.5) % duration) - duration / 2;
    })
    .toBeGreaterThan(0.3)
    .catch(async (error) => {
      await test.info().attach("scroll-media-state", {
        body: JSON.stringify({ before, duration, samples }),
        contentType: "application/json",
      });
      throw error;
    });
  const forward = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.mouse.wheel(0, -160);
  await expect(stage).toHaveAttribute("data-media-mode", "scrub");
  await expect
    .poll(async () => {
      const now = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
      return ((forward - now + duration * 1.5) % duration) - duration / 2;
    })
    .toBeGreaterThan(0.3);
  await expect
    .poll(() =>
      video.evaluate((v: HTMLVideoElement) => ({
        mode: v.parentElement!.dataset.mediaMode,
        paused: v.paused,
        seeking: v.seeking,
        readyState: v.readyState,
        currentTime: v.currentTime,
        duration: v.duration,
      })),
    )
    .toMatchObject({ mode: "idle", paused: false });
});

test("all eight points can be dragged and return without opening details", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const { region, stage } = await openScene(page);
  for (const name of services) {
    const button = region.getByRole("button", { name, exact: true });
    await aimAtMovingPoint(page, button);
    const start = (await button.boundingBox())!;
    const x = start.x + start.width / 2;
    const y = start.y + start.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + (x > 650 ? -90 : 90), y - 65, { steps: 14 });
    await expect(button).toHaveAttribute("data-dragging", "true");
    const moved = (await button.boundingBox())!;
    expect(Math.hypot(moved.x - start.x, moved.y - start.y)).toBeGreaterThan(
      60,
    );
    await page.mouse.up();
    await expect(button).toHaveAttribute("data-dragging", "false");
    await expect(button.locator("..")).toHaveAttribute(
      "data-returning",
      "false",
      { timeout: 3000 },
    );
    await expect(region.locator("#ecosystem-detail")).toBeHidden();
    await expect
      .poll(async () => {
        const returned = (await button.boundingBox())!;
        const scene = (await stage.boundingBox())!;
        const stone = orbitStones.find((item) => item.label === name)!;
        const radius = ORBIT_RINGS[stone.ring];
        const dx =
          ((returned.x + 22 - scene.x) / scene.width) * ORBIT_VIEW.w -
          ORBIT_VIEW.cx;
        const dy =
          ((returned.y + 22 - scene.y) / scene.height) * ORBIT_VIEW.h -
          ORBIT_VIEW.cy;
        // WebKit does not focus a button on mouse-down, so its orbit keeps moving.
        return Math.abs(
          (dx / radius) ** 2 + (dy / (radius * ORBIT_TILT)) ** 2 - 1,
        );
      })
      .toBeLessThan(0.12);
  }
});

test("Escape releases a captured drag and the next click still opens details", async ({
  page,
}) => {
  const { region } = await openScene(page);
  const button = region.getByRole("button", { name: "CREATIVE", exact: true });
  await aimAtMovingPoint(page, button);
  const box = (await button.boundingBox())!;
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y - 70, { steps: 8 });
  await expect(button).toHaveAttribute("data-dragging", "true");
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(button).toHaveAttribute("data-dragging", "false");
  await expect(button.locator("..")).toHaveAttribute("data-returning", "false");
  await aimAtMovingPoint(page, button);
  const returned = (await button.boundingBox())!;
  await page.mouse.click(
    returned.x + returned.width / 2,
    returned.y + returned.height / 2,
  );
  await expect(
    region.getByRole("heading", { name: "CREATIVE", exact: true }),
  ).toBeVisible();
});

for (const locale of ["tr", "en"]) {
  test(`${locale}: keyboard details, real links, dismissal and focus return`, async ({
    page,
  }) => {
    const { region } = await openScene(page, locale);
    const button = region.getByRole("button", {
      name: "PRODUCTION",
      exact: true,
    });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(
      region.getByRole("link", {
        name: locale === "tr" ? "Detaya git" : "View details",
      }),
    ).toHaveAttribute("href", `/${locale}/what-we-do/production`);
    const accessibility = await new AxeBuilder({ page })
      .include('section[aria-labelledby="solar-system-title"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await region
      .getByRole("button", {
        name: locale === "tr" ? "Detayı kapat" : "Close details",
      })
      .click();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });
}

test("manual pause freezes the canvas and offscreen video stops", async ({
  page,
}) => {
  const { region, stage, video } = await openScene(page);
  await region.getByRole("button", { name: "Animasyonu duraklat" }).click();
  await expect(stage).toHaveAttribute("data-motion", "paused");
  const image = await stage
    .locator("canvas")
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const held = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.waitForTimeout(200);
  expect(
    await stage
      .locator("canvas")
      .evaluate((c: HTMLCanvasElement) => c.toDataURL()),
  ).toBe(image);
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(
    held,
  );
  await region.getByRole("button", { name: "Animasyonu sürdür" }).click();
  await expect(stage).toHaveAttribute("data-motion", "running");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(stage).toHaveAttribute("data-motion", "paused");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
});

test("reduced motion uses a nonblank poster, including after resize", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { stage, region, video } = await openScene(page, "tr", true);
  await expect(video).not.toHaveAttribute("src");
  await expect
    .poll(() =>
      stage.locator("canvas").evaluate((c: HTMLCanvasElement) => {
        const pixels = c
          .getContext("2d")!
          .getImageData(
            c.width * 0.4,
            c.height * 0.35,
            c.width * 0.2,
            c.height * 0.3,
          ).data;
        return pixels.filter((value, index) => index % 4 === 0 && value > 100)
          .length;
      }),
    )
    .toBeGreaterThan(200);
  await page.setViewportSize({ width: 390, height: 844 });
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-motion", "paused");
  await region.getByRole("button", { name: "AI", exact: true }).click();
  await expect(
    region.getByRole("heading", { name: "AI", exact: true }),
  ).toBeVisible();
  expect(requests.some((url) => /hibrid-stone.*\.(mp4|webm)/.test(url))).toBe(
    false,
  );
});

test("media remains unloaded above the fold", async ({ page }) => {
  const media: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/videos/")) media.push(request.url());
  });
  await page.goto("/tr");
  await acceptCookies(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
  await page.waitForTimeout(400);
  expect(media).toEqual([]);
});

test("distant stars visibly twinkle in the background", async ({ page }) => {
  const { stage } = await openScene(page);
  await page.mouse.move(2, 100);
  const sample = () =>
    stage.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, Math.floor(canvas.height * 0.1)).data;
      return Array.from(pixels).filter((_, i) => i % 4 !== 3);
    });
  const before = await sample();
  expect(before.filter((channel) => channel > 25).length).toBeGreaterThan(20);
  await page.waitForTimeout(1400);
  const after = await sample();
  expect(
    after.filter((channel, i) => Math.abs(channel - before[i]) > 2).length,
  ).toBeGreaterThan(30);
});

test("point popover stays in the scene, gently focuses the crystal and dismisses", async ({
  page,
}) => {
  const { stage, region } = await openScene(page);
  const initialStage = (await stage.boundingBox())!;
  const initialCrystal = (await page.getByTestId("crystal-hit").boundingBox())!;
  const point = region.getByRole("button", { name: "AI", exact: true });
  await aimAtMovingPoint(page, point);
  const pointBounds = (await point.boundingBox())!;
  await page.mouse.click(
    pointBounds.x + pointBounds.width / 2,
    pointBounds.y + pointBounds.height / 2,
  );
  const dialog = region.getByRole("dialog", { name: "AI", exact: true });
  await expect(dialog).toBeFocused();
  await expect(dialog).toHaveAttribute("aria-modal", "false");
  const bounds = (await dialog.boundingBox())!;
  expect(bounds.width).toBeLessThanOrEqual(250);
  expect(bounds.height).toBeLessThan(190);
  expect(bounds.y).toBeGreaterThan(initialStage.y);
  expect(bounds.y + bounds.height).toBeLessThan(
    initialStage.y + initialStage.height,
  );
  expect((await stage.boundingBox())!.height).toBe(initialStage.height);
  await expect
    .poll(
      async () =>
        (await page.getByTestId("crystal-hit").boundingBox())!.width /
        initialCrystal.width,
    )
    .toBeGreaterThan(1.04);
  await page.keyboard.press("Tab");
  await expect(
    region.getByRole("button", { name: "Detayı kapat" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(point).toBeFocused();
  await point.press("Enter");
  await expect(dialog).toBeVisible();
  await region.getByRole("heading", { name: title, exact: true }).click();
  await expect(dialog).toBeHidden();
});

for (const width of [390, 768, 1440]) {
  test(`${width}px: nonblank scene, flat dots and unclipped details`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const { stage, region } = await openScene(page);
    await region.getByRole("button", { name: "Animasyonu duraklat" }).click();
    await expect(stage).toHaveAttribute("data-motion", "paused");
    const sceneWidth = (await stage.boundingBox())!.width;
    const originalWidth =
      sceneWidth <= 640
        ? Math.min(178, sceneWidth * 0.5)
        : Math.min(350, sceneWidth * 0.32);
    const hit = (await page.getByTestId("crystal-hit").boundingBox())!;
    expect(Math.abs(hit.width - originalWidth * 0.85 * 0.69)).toBeLessThan(0.1);
    expect(
      await stage
        .locator("video")
        .evaluate((v: HTMLVideoElement) => v.playbackRate),
    ).toBe(1);
    const pixels = await stage
      .locator("canvas")
      .evaluate((c: HTMLCanvasElement) => {
        const ctx = c.getContext("2d")!;
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let bright = 0;
        for (let i = 0; i < data.length; i += 4)
          if (data[i] > 100 && data[i + 1] > 60) bright++;
        return bright;
      });
    expect(pixels).toBeGreaterThan(1000);
    const frameQuality = await stage.locator("canvas").evaluate(
      (c: HTMLCanvasElement, offsets) => {
        const ctx = c.getContext("2d")!;
        const w = c.clientWidth;
        const scale = c.width / w;
        const size =
          (w <= 640 ? Math.min(178, w * 0.5) : Math.min(350, w * 0.32)) *
          scale *
          0.85;
        const cx = c.width * 0.5 + offsets.x * size;
        const cy = c.height * (324 / 640) + offsets.y * size;
        const corners: number[] = [];
        for (const x of [-0.43, 0.43]) {
          for (const y of [-0.43, 0.43]) {
            const patch = ctx.getImageData(
              cx + x * size,
              cy + y * size,
              7,
              7,
            ).data;
            const values = [...patch]
              .filter((_, index) => index % 4 !== 3)
              .sort((a, b) => a - b);
            corners.push(values[Math.floor(values.length / 2)]);
          }
        }
        const core = ctx.getImageData(
          cx - size * 0.1,
          cy - size * 0.1,
          size * 0.2,
          size * 0.2,
        ).data;
        const colors = new Set<number>();
        for (let i = 0; i < core.length; i += 4)
          colors.add(
            (core[i] >> 3) * 1024 +
              (core[i + 1] >> 3) * 32 +
              (core[i + 2] >> 3),
          );
        return { corners, colors: colors.size };
      },
      { x: CRYSTAL_MEDIA.offsetX, y: CRYSTAL_MEDIA.offsetY },
    );
    expect(Math.max(...frameQuality.corners)).toBeLessThan(8);
    expect(frameQuality.colors).toBeGreaterThan(32);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
    for (const name of services) {
      if (await region.locator("#ecosystem-detail").isVisible()) {
        await region.getByRole("button", { name: "Detayı kapat" }).click();
      }
      const button = region.getByRole("button", { name, exact: true });
      await button.click();
      const detail = region.locator("#ecosystem-detail");
      const bounds = (await detail.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      const stageBounds = (await stage.boundingBox())!;
      const crystal = (await page.getByTestId("crystal-hit").boundingBox())!;
      expect(bounds.y).toBeGreaterThanOrEqual(stageBounds.y);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(
        stageBounds.y + stageBounds.height,
      );
      expect(bounds.width).toBeLessThanOrEqual(250);
      const overlap =
        Math.max(
          0,
          Math.min(bounds.x + bounds.width, crystal.x + crystal.width) -
            Math.max(bounds.x, crystal.x),
        ) *
        Math.max(
          0,
          Math.min(bounds.y + bounds.height, crystal.y + crystal.height) -
            Math.max(bounds.y, crystal.y),
        );
      expect(overlap).toBe(0);
      expect(
        await detail.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    await stage.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`ecosystem-${width}.png`) });
  });
}

test("three complete video loops stay rendered", async ({ page }) => {
  test.setTimeout(60_000);
  const { stage, video } = await openScene(page);
  const cycleMillis = await video.evaluate(
    (v: HTMLVideoElement) => (v.duration / v.playbackRate) * 1000,
  );
  test.setTimeout(Math.max(60_000, cycleMillis * 3 + 30_000));
  await page.mouse.move(2, 100);
  const result = await video.evaluate(async (v: HTMLVideoElement) => {
    let loops = 0;
    let previous = v.currentTime;
    let blanks = 0;
    const blankFrames: Array<{
      time: number;
      bright: number;
      ready: number;
      seeking: boolean;
    }> = [];
    const canvas = v.parentElement!.querySelector("canvas")!;
    const context = canvas.getContext("2d")!;
    const deadline =
      performance.now() + ((v.duration / v.playbackRate) * 3 + 5) * 1000;
    while (loops < 3 && performance.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      if (v.currentTime < previous - 1) loops++;
      const pixels = context.getImageData(
        canvas.width * 0.44,
        canvas.height * 0.42,
        canvas.width * 0.12,
        canvas.height * 0.15,
      ).data;
      let bright = 0;
      for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 100) bright++;
      if (bright < 100) {
        blanks++;
        blankFrames.push({
          time: v.currentTime,
          bright,
          ready: v.readyState,
          seeking: v.seeking,
        });
      }
      previous = v.currentTime;
    }
    return { loops, blanks, blankFrames };
  });
  expect(result.loops).toBe(3);
  expect(result.blanks, JSON.stringify(result.blankFrames)).toBe(0);
  await expect(stage).toHaveAttribute("data-media-mode", "idle");
});

test.describe("touch", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("tap reveals details without navigation", async ({ page }) => {
    const { region } = await openScene(page);
    const point = (await region
      .getByRole("button", { name: "AI", exact: true })
      .boundingBox())!;
    await page.touchscreen.tap(
      point.x + point.width / 2,
      point.y + point.height / 2,
    );
    await expect(
      region.getByRole("heading", { name: "AI", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/tr$/);
    await expect(
      region.getByRole("link", { name: "Detaya git" }),
    ).toHaveAttribute("href", "/tr/what-we-do/ai-creative-production");
  });

  test("touch drag returns to orbit while empty-space swipes still scroll", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Native touch gesture injection uses Chromium CDP.",
    );
    const { stage, region } = await openScene(page);
    const point = region.getByRole("button", { name: "CREATIVE", exact: true });
    const box = (await point.boundingBox())!;
    const client = await page.context().newCDPSession(page);
    const beforeScroll = await page.evaluate(() => scrollY);
    const x = box.x + 22;
    const y = box.y + 22;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 12; i++) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + i * 5, y: y - i * 5 }],
      });
    }
    await expect(point).toHaveAttribute("data-dragging", "true");
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(async () => {
        const returned = (await point.boundingBox())!;
        return Math.hypot(returned.x - box.x, returned.y - box.y);
      })
      .toBeLessThan(15);
    expect(await page.evaluate(() => scrollY)).toBe(beforeScroll);
    await expect(region.locator("#ecosystem-detail")).toBeHidden();
    const bounds = (await stage.boundingBox())!;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: bounds.x + 3, y: bounds.y + 180 }],
    });
    for (let i = 1; i <= 8; i++) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: bounds.x + 3, y: bounds.y + 180 - i * 10 }],
      });
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(beforeScroll + 20);
    await client.detach();
  });
});
