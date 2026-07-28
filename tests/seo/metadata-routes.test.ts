import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every route in every locale", () => {
    expect(entries).toHaveLength(routing.locales.length * ROUTES.length);

    for (const locale of routing.locales) {
      for (const route of ROUTES) {
        expect(entries.some((e) => e.url === `https://sofinwave.org/${locale}/${route.path}`)).toBe(
          true,
        );
      }
    }
  });

  it("never lists a locale root, which only redirects", () => {
    for (const locale of routing.locales) {
      expect(entries.some((e) => e.url === `https://sofinwave.org/${locale}`)).toBe(false);
    }
  });

  it("declares hreflang alternates pointing at real pages, including x-default", () => {
    for (const entry of entries) {
      const path = new URL(entry.url).pathname.split("/").slice(2).join("/");
      const langs = entry.alternates?.languages ?? {};

      expect(langs["x-default"]).toBe(`https://sofinwave.org/en/${path}`);
      for (const locale of routing.locales) {
        expect(langs[locale]).toBe(`https://sofinwave.org/${locale}/${path}`);
      }
    }
  });

  it("stamps lastModified on every entry", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
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
    expect(r.sitemap).toBe("https://sofinwave.org/sitemap.xml");
    expect(r.host).toBe("https://sofinwave.org");
  });
});

describe("manifest", () => {
  it("references the logo icon", () => {
    const m = manifest();
    expect(m.icons?.[0]?.src).toBe("/icon.png");
    expect(m.short_name).toBe("SofinWave");
  });
});
