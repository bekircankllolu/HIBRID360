import { test, expect, type Page } from "@playwright/test";
import sharp from "sharp";

const route = "/tr/what-we-do/ai-creative-production";
test.setTimeout(90000);
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hibrid360-consent", JSON.stringify({ necessary: true, analytics: false, decidedAt: new Date().toISOString() }));
  });
});

const dots = (page: Page) => page.getByTestId("mona-stage").locator("[data-dots]");
const settled = (page: Page) => expect(dots(page)).toHaveAttribute("data-intro", "done", { timeout: 30000 });

test("dots fly in from off-screen before forming the shape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-intro", "playing", { timeout: 30000 });
  const started = Date.now();
  await settled(page);
  expect(Date.now() - started).toBeGreaterThan(1000);
});

test("dot sphere renders yellow dots, pauses offscreen and loads no 3D asset", async ({ page }, info) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-dots", "webgl", { timeout: 30000 });
  await expect(dots(page)).toHaveAttribute("data-running", "true");
  await settled(page);
  await expect(page.getByTestId("mona-stage").locator("canvas")).toHaveCount(1);
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "false");
  await page.screenshot({ path: info.outputPath("desktop.png") });
  // Measure only the sphere's box so the yellow start pill cannot satisfy the check.
  const pixels = await sharp(await page.locator("[data-mona-character]").screenshot()).removeAlpha().raw().toBuffer();
  let yellow = 0;
  for (let i = 0; i < pixels.length; i += 3) if (pixels[i] > 90 && pixels[i + 1] > 90 && pixels[i + 2] < 60) yellow++;
  expect(yellow / (pixels.length / 3)).toBeGreaterThan(0.01);
  await page.getByTestId("mona-questions").scrollIntoViewIfNeeded();
  await expect(dots(page)).toHaveAttribute("data-running", "false");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(dots(page)).toHaveAttribute("data-running", "true");
  expect(requests.some(url => /\.glb(?:$|\?)/.test(url))).toBe(false);
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

test("suggested questions, back and progress drive the conversation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await page.locator("[data-mona-character]").click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
  const suggestion = page.getByTestId("mona-experience").getByRole("button", { name: "Hibrid 360 yalnızca bir video prodüksiyon şirketi mi?" });
  await suggestion.click();
  await expect(page.getByTestId("mona-answer")).not.toContainText("Merhaba");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("button", { name: "Önceki satır" }).click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
  await page.getByTestId("mona-experience").getByRole("button", { name: "Tüm sorular" }).click();
  await expect(page.getByTestId("mona-questions")).toBeInViewport();
});

test("approaching pointer pulls the dots like a magnet and leaving releases them", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await settled(page);
  await expect(dots(page)).toHaveAttribute("data-reacting", "false");
  const sphere = (await page.locator("[data-mona-character]").boundingBox())!;
  // Just outside the shape's edge: the magnet reaches beyond the silhouette.
  await page.mouse.move(sphere.x - sphere.width * 0.1, sphere.y + sphere.height * 0.4);
  await page.mouse.move(sphere.x - sphere.width * 0.05, sphere.y + sphere.height * 0.45);
  await expect(dots(page)).toHaveAttribute("data-reacting", "true");
  await page.mouse.move(720, 20);
  await expect(dots(page)).toHaveAttribute("data-reacting", "false");
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-started", "false");
});

/** With a fake clock the scene only advances when the test runs time forward. */
async function settleOnFakeClock(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.install();
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-dots", "webgl", { timeout: 30000 });
  for (let i = 0; i < 40 && (await dots(page).getAttribute("data-intro")) !== "done"; i++) {
    await page.clock.runFor(250);
  }
  await expect(dots(page)).toHaveAttribute("data-intro", "done");
}

test("falls asleep after 20 s alone and wakes when the pointer returns", async ({ page }) => {
  await settleOnFakeClock(page);
  await expect(dots(page)).toHaveAttribute("data-mood", "awake");
  await page.clock.fastForward(21000);
  await page.clock.runFor(500);
  await expect(dots(page)).toHaveAttribute("data-mood", "sleeping");
  const stage = (await page.getByTestId("mona-experience").boundingBox())!;
  await page.mouse.move(stage.x + 200, stage.y + stage.height - 100);
  await page.mouse.move(stage.x + 220, stage.y + stage.height - 110);
  await page.clock.runFor(300);
  await expect(dots(page)).toHaveAttribute("data-mood", "awake");
});

test("four quick taps make the dots flee and then gather again", async ({ page }) => {
  await settleOnFakeClock(page);
  const sphere = (await page.locator("[data-mona-character]").boundingBox())!;
  const x = sphere.x + sphere.width / 2, y = sphere.y + sphere.height / 2;
  for (let i = 0; i < 4; i++) await page.mouse.click(x, y);
  await page.clock.runFor(200);
  await expect(dots(page)).toHaveAttribute("data-mood", "scattered");
  await page.clock.runFor(5000);
  await expect(dots(page)).toHaveAttribute("data-mood", "awake");
});

test("dots react while MONA speaks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-running", "true", { timeout: 30000 });
  await page.getByRole("button", { name: "SESİYLE TANIŞ" }).click();
  await page.mouse.move(720, 20);
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "true", { timeout: 20000 });
  await expect(dots(page)).toHaveAttribute("data-reacting", "true");
});

test("mobile framing, readable answers and English voice", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/what-we-do/ai-creative-production");
  await expect(dots(page)).toHaveAttribute("data-dots", "webgl", { timeout: 30000 });
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

test("touch dragging on the sphere does not start the voice", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-running", "true", { timeout: 30000 });
  const target = (await page.locator("[data-mona-character]").boundingBox())!;
  const x = target.x + target.width / 2, y = target.y + target.height / 2;
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 80, y }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-started", "false");
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "false");
  await client.detach();
});

test("reduced motion draws one still frame and ignores the pointer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-dots", "static", { timeout: 30000 });
  await expect(dots(page)).toHaveAttribute("data-running", "false");
  const sphere = (await page.locator("[data-mona-character]").boundingBox())!;
  await page.mouse.move(sphere.x + sphere.width / 2, sphere.y + sphere.height / 2);
  await page.waitForTimeout(400);
  await expect(dots(page)).toHaveAttribute("data-reacting", "false");
  await page.locator("[data-mona-character]").click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
  await expect(page.getByTestId("mona-stage")).toHaveAttribute("data-speaking", "false");
});

test("without WebGL an SVG sphere remains and all answers work", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto(route);
  await expect(dots(page)).toHaveAttribute("data-dots", "fallback", { timeout: 30000 });
  await expect(page.getByTestId("mona-dots-fallback")).toBeVisible();
  await page.locator("[data-mona-character]").click();
  await expect(page.getByTestId("mona-answer")).toContainText("Merhaba");
  await expect(page.getByTestId("mona-questions").getByRole("button")).toHaveCount(28);
});
