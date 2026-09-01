import { describe, expect, it } from "vitest";
import en from "./en.json";
import tr from "./tr.json";

function flatten(
  value: unknown,
  prefix = "",
  output: Record<string, unknown> = {},
): Record<string, unknown> {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}.${index}`, output));
    return output;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) =>
      flatten(item, prefix ? `${prefix}.${key}` : key, output),
    );
    return output;
  }

  output[prefix] = value;
  return output;
}

describe("locale message contracts", () => {
  const enMessages = flatten(en);
  const trMessages = flatten(tr);

  it("keeps English and Turkish message keys in parity", () => {
    expect(Object.keys(trMessages).sort()).toEqual(Object.keys(enMessages).sort());
  });

  it.each([
    "insights.heroTitle",
    "insights.heroSubtitle",
    "contact.heroTitle",
    "services.cloudTv.solutionsTitle",
  ])("provides an actual Turkish translation for %s", (key) => {
    expect(trMessages[key]).not.toBe(enMessages[key]);
  });

  it("contains no Unicode replacement characters", () => {
    expect(JSON.stringify(tr)).not.toContain("\uFFFD");
    expect(JSON.stringify(en)).not.toContain("\uFFFD");
  });
});
