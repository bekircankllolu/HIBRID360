import { test, expect } from "@playwright/test";
import sharp from "sharp";

const route = "/tr/what-we-do/ai-creative-production";
test.setTimeout(90000);
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hibrid360-consent", JSON.stringify({ necessary: true, analytics: false, decidedAt: new Date().toISOString() }));
  });
});

test("supplied video renders, moves and pauses without any 3D asset", async ({ page }, info) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  const surface = page.getByTestId("mona-video-surface");
  const video = page.getByTestId("mona-video");
  await expect(surface).toHaveAttribute("data-playing", "true", { timeout: 30000 });
  expect(await video.evaluate((node: HTMLVideoElement) => node.videoWidth)).toBe(1920);
  expect(await video.evaluate((node: HTMLVideoElement) => node.muted)).toBe(true);
  const start = await video.evaluate((node: HTMLVideoElement) => node.currentTime);
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeGreaterThan(start + 0.3);
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "false");
  await page.getByRole("button", { name: "Hareketi duraklat" }).click();
  await expect(surface).toHaveAttribute("data-playing", "false");
  await page.screenshot({ path: info.outputPath("desktop.png") });
  const before = await video.screenshot();
  const pixels = await sharp(before).removeAlpha().raw().toBuffer();
  let bright = 0;
  for (let i = 0; i < pixels.length; i += 3) if (pixels[i] > 80 || pixels[i + 1] > 80 || pixels[i + 2] > 80) bright++;
  expect(bright / (pixels.length / 3)).toBeGreaterThan(0.08);
  const paused = await video.evaluate((node: HTMLVideoElement) => node.currentTime);
  await page.waitForTimeout(300);
  expect(await video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeCloseTo(paused, 2);
  await page.getByRole("button", { name: "Hareketi oynat" }).click();
  await expect(surface).toHaveAttribute("data-playing", "true");
  await page.getByTestId("mona-questions").scrollIntoViewIfNeeded();
  await expect(surface).toHaveAttribute("data-playing", "false");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(surface).toHaveAttribute("data-playing", "true");
  expect(requests.some(url => /\.glb(?:$|\?)/.test(url))).toBe(false);
  await expect(page.getByTestId("mona-stage").locator("canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("local female voice, captions, stop, replay, mute and scroll cancellation", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const audioRequests: string[] = [];
  page.on("request", request => { if (request.url().endsWith(".mp3")) audioRequests.push(request.url()); });
  await page.goto(route);
  await expect(page.getByRole("button", { name: "SESİYLE TANIŞ" })).toBeVisible();
  expect(audioRequests).toHaveLength(0);
  await page.getByRole("button", { name: "SESİYLE TANIŞ" }).click();
  const stage = page.getByTestId("mona-stage");
  await expect(stage).toHaveAttribute("data-speaking", "true", { timeout: 20000 });
  await expect(page.getByTestId("mona-answer")).toContainText("Kafam biraz retro");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: info.outputPath("speaking.png") });
  expect(audioRequests.some(url => url.endsWith("/tr/opening.mp3"))).toBe(true);
  await page.getByRole("button", { name: "Sustur", exact: true }).click();
  await expect(stage).toHaveAttribute("data-speaking", "false");
  await page.getByRole("button", { name: "Tekrar dinle" }).click();
  await expect(stage).toHaveAttribute("data-speaking", "true");
  await page.getByRole("button", { name: "Sesi kapat", exact: true }).click();
  await expect(stage).toHaveAttribute("data-speaking", "false");
  await page.getByRole("button", { name: "Sesi aç", exact: true }).click();
  await expect(stage).toHaveAttribute("data-speaking", "true");
  await page.keyboard.press("Escape");
  await expect(stage).toHaveAttribute("data-speaking", "false");
  const questions = page.getByTestId("mona-questions").getByRole("button");
  await expect(questions).toHaveCount(28);
  await questions.first().click();
  await expect(stage).toHaveAttribute("data-speaking", "true", { timeout: 15000 });
  await expect(page.getByTestId("mona-answer")).not.toContainText("Kafam biraz retro");
  expect(audioRequests.some(url => url.endsWith("/tr/q1.mp3"))).toBe(true);
  await page.getByTestId("mona-questions").scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-speaking", "false");
});

test("mobile framing, readable answers and English voice", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/what-we-do/ai-creative-production");
  await expect(page.getByTestId("mona-video-surface")).toHaveAttribute("data-playing", "true", { timeout: 30000 });
  await expect(page.getByRole("button", { name: "MEET HER VOICE" })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("mobile.png") });
  await page.getByRole("button", { name: "MEET HER VOICE" }).click();
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "true", { timeout: 15000 });
  await expect(page.getByTestId("mona-answer")).toContainText("My head is a little retro");
  await page.getByTestId("mona-questions").getByRole("button").last().click();
  await expect(page.getByTestId("mona-answer")).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("reduced motion keeps the video still and allows explicit playback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const surface = page.getByTestId("mona-video-surface");
  await expect(page.getByRole("button", { name: "Hareketi oynat" })).toBeVisible();
  await page.waitForTimeout(400);
  await page.mouse.move(80, 320);
  await expect(surface).not.toHaveAttribute("data-mode", "tracking");
  await expect(surface).toHaveAttribute("data-playing", "false");
  expect(await page.getByTestId("mona-video").evaluate((node: HTMLVideoElement) => node.currentTime)).toBe(0);
  await page.locator("[data-mona-character]").click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "false");
  await page.getByRole("button", { name: "Hareketi oynat" }).click();
  await expect(surface).toHaveAttribute("data-playing", "true");
});

test("pointer selects real left and right video frames and resumes on exit", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  const surface = page.getByTestId("mona-video-surface");
  const video = page.getByTestId("mona-video");
  await expect(surface).toHaveAttribute("data-playing", "true");
  const bounds = (await page.getByTestId("mona-experience").boundingBox())!;
  await page.mouse.move(bounds.x + 12, bounds.y + bounds.height * 0.4);
  await expect(surface).toHaveAttribute("data-mode", "tracking");
  await expect(surface).toHaveAttribute("data-playing", "false");
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeGreaterThan(2.65);
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.seeking)).toBe(false);
  const left = await video.screenshot();
  await page.screenshot({ path: info.outputPath("look-left.png") });
  await page.mouse.move(bounds.x + bounds.width - 12, bounds.y + bounds.height * 0.4);
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeLessThan(0.96);
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.seeking)).toBe(false);
  const right = await video.screenshot();
  expect(left.equals(right)).toBe(false);
  const leftPixels = await sharp(left).resize(320, 180).removeAlpha().raw().toBuffer();
  const rightPixels = await sharp(right).resize(320, 180).removeAlpha().raw().toBuffer();
  let changed = 0;
  for (let i = 0; i < leftPixels.length; i++) if (Math.abs(leftPixels[i] - rightPixels[i]) > 20) changed++;
  expect(changed / leftPixels.length).toBeGreaterThan(0.015);
  await page.screenshot({ path: info.outputPath("look-right.png") });
  for (let i = 0; i < 15; i++) await page.mouse.move(i % 2 ? 40 : 1400, 330);
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.4);
  await expect.poll(async () => Math.abs(await video.evaluate((node: HTMLVideoElement) => node.currentTime) - 1.75)).toBeLessThan(0.06);
  await page.mouse.move(720, 35);
  await expect(surface).toHaveAttribute("data-mode", "idle");
  await expect(surface).toHaveAttribute("data-playing", "true");
});

test("manual pause suppresses hover and focused character supports keyboard look", async ({ page }) => {
  await page.goto(route);
  const surface = page.getByTestId("mona-video-surface");
  await expect(surface).toHaveAttribute("data-playing", "true");
  await page.getByRole("button", { name: "Hareketi duraklat" }).click();
  await page.mouse.move(70, 300);
  await expect(surface).toHaveAttribute("data-mode", "paused");
  await page.getByRole("button", { name: "Hareketi oynat" }).click();
  await page.locator("[data-mona-character]").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(surface).toHaveAttribute("data-mode", "tracking");
  await expect.poll(() => page.getByTestId("mona-video").evaluate((node: HTMLVideoElement) => node.currentTime)).toBeGreaterThan(2.65);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => page.getByTestId("mona-video").evaluate((node: HTMLVideoElement) => node.currentTime)).toBeLessThan(0.96);
  await page.keyboard.press("Escape");
  await expect(surface).toHaveAttribute("data-mode", "idle");
});

test("touch dragging tracks without starting voice and release resumes playback", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const surface = page.getByTestId("mona-video-surface");
  await expect(surface).toHaveAttribute("data-playing", "true");
  const target = (await page.locator("[data-mona-character]").boundingBox())!;
  const x = target.x + target.width / 2, y = target.y + target.height / 2;
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 80, y }] });
  await expect(surface).toHaveAttribute("data-mode", "tracking");
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(surface).toHaveAttribute("data-mode", "idle");
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-started", "false");
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "false");
  await client.detach();
});

test("video plays without WebGL and retains all text answers", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto(route);
  await expect(page.getByTestId("mona-video-surface")).toHaveAttribute("data-playing", "true", { timeout: 30000 });
  await page.locator("[data-mona-character]").click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
  await expect(page.getByTestId("mona-questions").getByRole("button")).toHaveCount(28);
});

test("video failure retains its poster and functioning answers", async ({ page }) => {
  await page.route("**/videos/mona-performance-20260907.mp4", route => route.abort());
  await page.goto(route);
  const poster = page.getByTestId("mona-video-fallback");
  await expect(poster).toBeVisible();
  await expect.poll(() => poster.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  await page.locator("[data-mona-character]").click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
});
