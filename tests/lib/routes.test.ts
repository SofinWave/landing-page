import { describe, it, expect } from "vitest";
import { SiteId } from "@/enums";
import { HOME_PATH, breadcrumbTrail, contentRoutesFor, findRoute, routesFor } from "@/lib/routes";
import { ALL_SITES, siteConfig } from "@/lib/sites";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

const catalogs: Record<string, Record<string, unknown>> = {
  en: en as unknown as Record<string, unknown>,
  vi: vi as unknown as Record<string, unknown>,
};

describe.each(ALL_SITES.map((s) => s.id))("route registry for %s", (siteId) => {
  const routes = routesFor(siteId);

  it("has a unique path and key per route", () => {
    expect(new Set(routes.map((r) => r.path)).size).toBe(routes.length);
    expect(new Set(routes.map((r) => r.key)).size).toBe(routes.length);
  });

  it("uses paths without leading or trailing slashes", () => {
    for (const route of routes) {
      expect(route.path).not.toMatch(/^\//);
      expect(route.path).not.toMatch(/\/$/);
    }
  });

  it("points every parent reference at a route of the same site", () => {
    for (const route of routes) {
      if (route.parent) expect(findRoute(siteId, route.parent)).toBeDefined();
    }
  });

  it("always has a landing page", () => {
    expect(findRoute(siteId, HOME_PATH)).toBeDefined();
    expect(contentRoutesFor(siteId)).toHaveLength(routes.length - 1);
  });
});

describe("breadcrumbTrail", () => {
  it("returns the route itself for a landing page", () => {
    expect(breadcrumbTrail(SiteId.Tech, HOME_PATH).map((r) => r.path)).toEqual([HOME_PATH]);
  });

  it("walks the full ancestor chain root-first", () => {
    expect(breadcrumbTrail(SiteId.Tech, "services/ai-implementation").map((r) => r.path)).toEqual([
      HOME_PATH,
      "services",
      "services/ai-implementation",
    ]);
  });

  it("returns an empty trail for a path belonging to another site", () => {
    expect(breadcrumbTrail(SiteId.Media, "services/ai-implementation")).toEqual([]);
  });
});

describe.each(ALL_SITES.map((s) => s.id))("content for %s", (siteId) => {
  const config = siteConfig(siteId);

  it.each(Object.keys(catalogs))("is complete in %s", (locale) => {
    const meta = catalogs[locale][config.metaNamespace] as Record<string, string>;
    expect(meta, `missing ${config.metaNamespace} in ${locale}`).toBeDefined();
    for (const key of ["title", "description", "ogHeadline", "ogSubline"]) {
      expect(meta[key], `${config.metaNamespace}.${key} in ${locale}`).toBeTruthy();
    }

    const pages = catalogs[locale][config.contentNamespace] as Record<
      string,
      Record<string, unknown>
    >;
    expect(pages, `missing ${config.contentNamespace} in ${locale}`).toBeDefined();
    expect(pages.breadcrumbLabel).toBeTruthy();
    expect(pages.faqHeading).toBeTruthy();

    for (const route of config.routes) {
      const page = pages[route.key];
      expect(page, `missing ${config.contentNamespace}.${route.key} in ${locale}`).toBeDefined();
      expect(page.title).toBeTruthy();
      expect(page.navLabel).toBeTruthy();
    }

    // The tech landing page is a bespoke composition, so only the shell-rendered
    // routes carry the full content shape.
    const shellRoutes = siteId === SiteId.Tech ? contentRoutesFor(siteId) : [...config.routes];

    for (const route of shellRoutes) {
      const page = pages[route.key];
      expect(page.metaTitle, `${route.key}.metaTitle in ${locale}`).toBeTruthy();
      expect(page.metaDescription).toBeTruthy();
      expect(page.lede).toBeTruthy();
      expect(Array.isArray(page.sections)).toBe(true);
      expect((page.sections as unknown[]).length).toBeGreaterThan(0);
      expect(Array.isArray(page.faq)).toBe(true);
      expect(page.cta).toBeDefined();
      expect((page.metaDescription as string).length).toBeLessThan(300);
    }
  });

  it.each(Object.keys(catalogs))("resolves every nav link to a page in %s", (locale) => {
    const pages = catalogs[locale][config.contentNamespace] as Record<
      string,
      Record<string, unknown>
    >;

    for (const link of [...config.nav, ...config.footerServices, ...config.footerCompany]) {
      expect(pages[link.key], `nav key ${link.key} on ${siteId}`).toBeDefined();
      expect(
        findRoute(siteId, link.href.replace(/^\//, "")),
        `nav href ${link.href}`,
      ).toBeDefined();
    }
  });
});
