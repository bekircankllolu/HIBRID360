import { describe, expect, it } from "vitest";
import { insightsPosts } from "@/data/insights";
import { getInsightParagraphs } from "@/lib/insights";

describe("Think & Thank article import", () => {
  it("publishes the complete bilingual 19-article collection", () => {
    expect(insightsPosts).toHaveLength(19);
    expect(new Set(insightsPosts.map((post) => post.id)).size).toBe(19);
    expect(new Set(insightsPosts.map((post) => post.slug)).size).toBe(19);
    expect(insightsPosts.every((post) => post.is_published)).toBe(true);
  });

  it("keeps all localized editorial fields and three body paragraphs", () => {
    for (const post of insightsPosts) {
      expect(post.title_tr).toBeTruthy();
      expect(post.title_en).toBeTruthy();
      expect(post.summary_tr).toBeTruthy();
      expect(post.summary_en).toBeTruthy();
      expect(post.category_tr).toBeTruthy();
      expect(post.category_en).toBeTruthy();
      expect(post.author_name_tr).toBeTruthy();
      expect(post.author_name_en).toBeTruthy();
      expect(post.read_time_minutes).toBeGreaterThan(0);
      expect(getInsightParagraphs(post, "tr")).toHaveLength(3);
      expect(getInsightParagraphs(post, "en")).toHaveLength(3);
    }
  });

  it("contains no Unicode replacement characters", () => {
    expect(JSON.stringify(insightsPosts)).not.toContain("\uFFFD");
  });
});
