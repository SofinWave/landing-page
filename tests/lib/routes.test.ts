import { describe, it, expect } from "vitest";
import { SiteId } from "@/enums";
import { HOME_PATH, breadcrumbTrail, contentRoutesFor, findRoute, routesFor } from "@/lib/routes";
import { ALL_SITES, siteConfig } from "@/lib/sites";
import { isAbsoluteHref } from "@/lib/site";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import zh from "@/messages/zh.json";

const catalogs: Record<string, Record<string, unknown>> = {
  en: en as unknown as Record<string, unknown>,
  vi: vi as unknown as Record<string, unknown>,
  zh: zh as unknown as Record<string, unknown>,
};

describe("navigation", () => {
  // Renaming a route is the change most likely to strand a link: the registry
  // moves, the nav keeps pointing at the old path, and nothing fails until a
  // visitor hits the 404.
  it.each(ALL_SITES.map((s) => s.id))("every %s nav and footer href is a real route", (siteId) => {
    const config = siteConfig(siteId);
    const items = [
      ...config.nav,
      ...(config.footerServices ?? []),
      ...(config.footerCompany ?? []),
    ];

    const stranded = items
      .filter((item) => !isAbsoluteHref(item.href))
      .filter((item) => !findRoute(siteId, item.href.replace(/^\//, "")));

    expect(stranded.map((i) => i.href)).toEqual([]);
  });

  it.each(ALL_SITES.map((s) => s.id))("every %s nav key matches its route key", (siteId) => {
    const config = siteConfig(siteId);
    for (const item of config.nav) {
      if (isAbsoluteHref(item.href)) continue;
      const route = findRoute(siteId, item.href.replace(/^\//, ""));
      expect(route?.key, `nav ${item.href}`).toBe(item.key);
    }
  });
});

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

  it("follows a parent that is not the path prefix", () => {
    expect(
      breadcrumbTrail(SiteId.Tech, "services/egocentric-data-collection").map((r) => r.path),
    ).toEqual([
      HOME_PATH,
      "services",
      "services/data-collection",
      "services/egocentric-data-collection",
    ]);
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

  it.each(Object.keys(catalogs))("resolves every section link to a page in %s", (locale) => {
    const pages = catalogs[locale][config.contentNamespace] as Record<
      string,
      Record<string, unknown>
    >;

    for (const [key, page] of Object.entries(pages)) {
      if (typeof page !== "object" || page === null) continue;
      const sections = (page as { sections?: unknown }).sections;
      if (!Array.isArray(sections)) continue;

      for (const section of sections as { links?: { href: string; label: string }[] }[]) {
        for (const link of section.links ?? []) {
          // Cross-site links name another hostname and so have no entry in
          // this site's registry. They are checked separately below.
          if (isAbsoluteHref(link.href)) continue;

          expect(
            findRoute(siteId, link.href.replace(/^\//, "")),
            `${key} link ${link.href}`,
          ).toBeDefined();
        }
      }
    }
  });

  it.each(
    Object.keys(catalogs),
  )("points every absolute section link at a real SofinWave landing page in %s", (locale) => {
    const hosts = new Set(ALL_SITES.map((s) => s.host));
    const pages = catalogs[locale][config.contentNamespace] as Record<
      string,
      Record<string, unknown>
    >;

    for (const [key, page] of Object.entries(pages)) {
      if (typeof page !== "object" || page === null) continue;
      const sections = (page as { sections?: unknown }).sections;
      if (!Array.isArray(sections)) continue;

      for (const section of sections as { links?: { href: string; label: string }[] }[]) {
        for (const link of section.links ?? []) {
          if (!isAbsoluteHref(link.href)) continue;

          const url = new URL(link.href);
          expect(hosts, `${key} link ${link.href}`).toContain(url.hostname);
          // `/{locale}` only ever redirects, so cross-site links must name
          // the landing page and must match the catalog they live in.
          expect(url.pathname, `${key} link ${link.href}`).toBe(`/${locale}/${HOME_PATH}`);
        }
      }
    }
  });
});
