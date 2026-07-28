import { describe, it, expect } from "vitest";
import { ROUTES, CONTENT_ROUTES, HOME_PATH, breadcrumbTrail, findRoute } from "@/lib/routes";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

const catalogs = { en, vi } as Record<string, typeof en>;

describe("route registry", () => {
  it("has a unique path and key per route", () => {
    expect(new Set(ROUTES.map((r) => r.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.key)).size).toBe(ROUTES.length);
  });

  it("uses paths without leading or trailing slashes", () => {
    for (const route of ROUTES) {
      expect(route.path).not.toMatch(/^\//);
      expect(route.path).not.toMatch(/\/$/);
    }
  });

  it("points every parent reference at a route that exists", () => {
    for (const route of ROUTES) {
      if (route.parent) expect(findRoute(route.parent)).toBeDefined();
    }
  });

  it("excludes the landing page from CONTENT_ROUTES", () => {
    expect(CONTENT_ROUTES.some((r) => r.path === HOME_PATH)).toBe(false);
    expect(CONTENT_ROUTES).toHaveLength(ROUTES.length - 1);
  });
});

describe("breadcrumbTrail", () => {
  it("returns the route itself for the landing page", () => {
    expect(breadcrumbTrail(HOME_PATH).map((r) => r.path)).toEqual([HOME_PATH]);
  });

  it("walks the full ancestor chain root-first", () => {
    expect(breadcrumbTrail("services/dedicated-team").map((r) => r.path)).toEqual([
      HOME_PATH,
      "services",
      "services/dedicated-team",
    ]);
  });

  it("returns an empty trail for an unknown path", () => {
    expect(breadcrumbTrail("nope/not-a-page")).toEqual([]);
  });
});

describe("route content", () => {
  it.each(Object.keys(catalogs))("has complete copy for every route in %s", (locale) => {
    const pages = catalogs[locale].pages as unknown as Record<string, Record<string, unknown>>;

    for (const route of ROUTES) {
      expect(pages[route.key], `missing pages.${route.key} in ${locale}`).toBeDefined();
      expect(pages[route.key].title).toBeTruthy();
    }

    for (const route of CONTENT_ROUTES) {
      const page = pages[route.key];
      expect(page.metaTitle, `pages.${route.key}.metaTitle in ${locale}`).toBeTruthy();
      expect(page.metaDescription).toBeTruthy();
      expect(page.lede).toBeTruthy();
      expect(Array.isArray(page.sections)).toBe(true);
      expect((page.sections as unknown[]).length).toBeGreaterThan(0);
      expect(Array.isArray(page.faq)).toBe(true);
      expect(page.cta).toBeDefined();
    }
  });

  it.each(
    Object.keys(catalogs),
  )("keeps meta descriptions within snippet length in %s", (locale) => {
    const pages = catalogs[locale].pages as unknown as Record<string, { metaDescription?: string }>;

    for (const route of CONTENT_ROUTES) {
      const description = pages[route.key].metaDescription ?? "";
      expect(description.length, `pages.${route.key}.metaDescription in ${locale}`).toBeLessThan(
        250,
      );
    }
  });
});
