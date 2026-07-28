import { describe, it, expect } from "vitest";
import { SiteId } from "@/enums";
import { routing } from "@/i18n/routing";
import { buildSitemap } from "@/lib/sitemap";
import { ALL_SITES, resolveSite, siteConfig } from "@/lib/sites";
import { HOME_PATH } from "@/lib/routes";

const LASTMOD = new Date("2026-07-28T00:00:00.000Z");

describe("resolveSite", () => {
  it("maps each production hostname to its site", () => {
    for (const site of ALL_SITES) {
      expect(resolveSite(site.host).id).toBe(site.id);
    }
  });

  it("ignores port, case, and a www prefix", () => {
    expect(resolveSite("MEDIA.SofinWave.com:443").id).toBe(SiteId.Media);
    expect(resolveSite("www.sofinwave.com").id).toBe(SiteId.Tech);
  });

  it("matches a leading label so local and preview hosts work", () => {
    expect(resolveSite("finance.localhost:3000").id).toBe(SiteId.Finance);
    expect(resolveSite("academy.example.dev").id).toBe(SiteId.Academy);
  });

  it("falls back to the apex rather than failing on an unknown host", () => {
    expect(resolveSite("nonsense.example.com").id).toBe(SiteId.Tech);
    expect(resolveSite(null).id).toBe(SiteId.Tech);
    expect(resolveSite("").id).toBe(SiteId.Tech);
  });
});

describe.each(ALL_SITES.map((s) => s.id))("sitemap for %s", (siteId) => {
  const config = siteConfig(siteId);
  const xml = buildSitemap(siteId, LASTMOD);

  it("lists every route in every locale, on that site's own origin", () => {
    for (const locale of routing.locales) {
      for (const route of config.routes) {
        expect(xml).toContain(`<loc>https://${config.host}/${locale}/${route.path}</loc>`);
      }
    }
  });

  it("never lists a locale root, which only redirects", () => {
    for (const locale of routing.locales) {
      expect(xml).not.toContain(`<loc>https://${config.host}/${locale}</loc>`);
    }
  });

  it("declares hreflang alternates including x-default", () => {
    expect(xml).toContain(
      `<xhtml:link rel="alternate" hreflang="x-default" href="https://${config.host}/en/${HOME_PATH}"/>`,
    );
    for (const locale of routing.locales) {
      expect(xml).toContain(
        `<xhtml:link rel="alternate" hreflang="${locale}" href="https://${config.host}/${locale}/${HOME_PATH}"/>`,
      );
    }
  });

  it("never leaks another site's URLs", () => {
    for (const other of ALL_SITES) {
      if (other.id === siteId) continue;
      expect(xml).not.toContain(`https://${other.host}/`);
    }
  });

  it("is well-formed and stamps lastmod on every entry", () => {
    const locs = xml.match(/<loc>/g) ?? [];
    const mods = xml.match(/<lastmod>/g) ?? [];
    expect(locs).toHaveLength(routing.locales.length * config.routes.length);
    expect(mods).toHaveLength(locs.length);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });
});
