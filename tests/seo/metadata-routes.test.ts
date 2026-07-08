import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { routing } from "@/i18n/routing";

describe("sitemap", () => {
  const entries = sitemap();

  it("has one entry per locale", () => {
    expect(entries).toHaveLength(routing.locales.length);
    for (const locale of routing.locales) {
      expect(entries.some((e) => e.url.endsWith(`/${locale}`))).toBe(true);
    }
  });

  it("declares hreflang alternates including x-default on every entry", () => {
    for (const entry of entries) {
      const langs = entry.alternates?.languages ?? {};
      expect(langs["x-default"]).toBe("https://kingnnt.org/en");
      for (const locale of routing.locales) {
        expect(langs[locale]).toBe(`https://kingnnt.org/${locale}`);
      }
    }
  });
});

describe("robots", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];

  it("allows all crawlers and disallows /api/", () => {
    const wildcard = rules.find((rule) => rule?.userAgent === "*");
    expect(wildcard?.allow).toBe("/");
    expect(wildcard?.disallow).toContain("/api/");
  });

  it("explicitly welcomes AI/answer-engine crawlers (GEO)", () => {
    const agents = rules.map((rule) => rule?.userAgent);
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      expect(agents).toContain(bot);
    }
  });

  it("points to the sitemap and host", () => {
    expect(r.sitemap).toBe("https://kingnnt.org/sitemap.xml");
    expect(r.host).toBe("https://kingnnt.org");
  });
});

describe("manifest", () => {
  it("references the logo icon", () => {
    const m = manifest();
    expect(m.icons?.[0]?.src).toBe("/icon.png");
    expect(m.short_name).toBe("kingnnt.org");
  });
});
