import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";
import { SITE_KEYWORDS, siteKeywords } from "@/lib/site";
import { ALL_SITES } from "@/lib/sites";

describe.each(ALL_SITES.map((s) => s.id))("keywords for %s", (siteId) => {
  it.each(routing.locales)("has its own non-empty list in %s", (locale) => {
    const keywords = siteKeywords(locale, siteId);
    expect(keywords.length).toBeGreaterThan(0);
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("falls back to English for a locale it does not declare", () => {
    expect(siteKeywords("de", siteId)).toEqual(SITE_KEYWORDS[siteId].en);
  });
});

describe("keywords across sites", () => {
  // The whole reason the verticals are separate hostnames. A finance page
  // advertising the software business's terms misdescribes the entity to search
  // and answer engines, and finance is the YMYL site — it is the one that can
  // least afford to look like something it is not.
  it.each(routing.locales)("never shares a term between two sites in %s", (locale) => {
    for (const site of ALL_SITES) {
      for (const other of ALL_SITES) {
        if (other.id === site.id) continue;

        const shared = siteKeywords(locale, site.id).filter((keyword) =>
          siteKeywords(locale, other.id).includes(keyword),
        );

        expect(shared, `${site.id} and ${other.id} both claim ${shared.join(", ")}`).toEqual([]);
      }
    }
  });
});
