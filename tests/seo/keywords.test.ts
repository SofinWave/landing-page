import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";
import { PAGE_KEYWORDS, SITE_KEYWORDS, pageKeywords, siteKeywords } from "@/lib/site";
import { routesFor } from "@/lib/routes";
import { SiteId } from "@/enums";
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

describe("page keywords", () => {
  const entries = Object.entries(PAGE_KEYWORDS[SiteId.Tech] ?? {});

  it("only names routes that exist", () => {
    for (const [routeKey] of entries) {
      const route = routesFor(SiteId.Tech).find((r) => r.key === routeKey);
      expect(route, `PAGE_KEYWORDS names ${routeKey}, which is not a tech route`).toBeDefined();
    }
  });

  it.each(entries)("%s has a non-empty, deduped list per locale", (_key, byLocale) => {
    for (const locale of routing.locales) {
      const list = byLocale[locale];
      expect(list, `missing ${locale}`).toBeDefined();
      expect(list.length).toBeGreaterThan(0);
      expect(new Set(list).size, `duplicate term in ${locale}`).toBe(list.length);
    }
  });

  // The point of the split: an annotation page that still advertises itself with
  // the site's consulting vocabulary is the bug this replaced.
  it.each(entries)("%s overrides the site list rather than inheriting it", (key) => {
    for (const locale of routing.locales) {
      expect(pageKeywords(locale, key, SiteId.Tech)).not.toEqual(siteKeywords(locale, SiteId.Tech));
    }
  });

  it("falls back to the site list for a page with no entry of its own", () => {
    expect(pageKeywords("en", "about", SiteId.Tech)).toEqual(siteKeywords("en", SiteId.Tech));
  });
});
