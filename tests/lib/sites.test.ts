import { describe, it, expect } from "vitest";
import { SiteId } from "@/enums";
import { ALL_SITES, DEFAULT_SITE, isSiteId, siteConfig } from "@/lib/sites";
import { pageUrl, siteUrl } from "@/lib/site";

describe("site registry", () => {
  it("covers every SiteId exactly once", () => {
    expect(ALL_SITES).toHaveLength(Object.values(SiteId).length);
    expect(new Set(ALL_SITES.map((s) => s.id)).size).toBe(ALL_SITES.length);
  });

  it("gives every site a distinct hostname and message namespaces", () => {
    expect(new Set(ALL_SITES.map((s) => s.host)).size).toBe(ALL_SITES.length);
    expect(new Set(ALL_SITES.map((s) => s.metaNamespace)).size).toBe(ALL_SITES.length);
    expect(new Set(ALL_SITES.map((s) => s.contentNamespace)).size).toBe(ALL_SITES.length);
  });

  it("makes the apex the default", () => {
    expect(DEFAULT_SITE.id).toBe(SiteId.Tech);
    expect(DEFAULT_SITE.host).toBe("sofinwave.org");
  });

  it("declares the schema type each vertical actually is", () => {
    expect(siteConfig(SiteId.Tech).schemaType).toBe("ProfessionalService");
    expect(siteConfig(SiteId.Academy).schemaType).toBe("EducationalOrganization");
    // Not FinancialService — that describes a regulated provider, and this
    // site publishes knowledge rather than offering advice.
    expect(siteConfig(SiteId.Finance).schemaType).toBe("Organization");
  });
});

describe("isSiteId", () => {
  it("accepts known ids and rejects anything else", () => {
    expect(isSiteId("tech")).toBe(true);
    expect(isSiteId("finance")).toBe(true);
    expect(isSiteId("nope")).toBe(false);
    expect(isSiteId("")).toBe(false);
  });
});

describe("URL builders", () => {
  it("builds absolute URLs on each site's own origin", () => {
    expect(siteUrl(SiteId.Tech)).toBe("https://sofinwave.org");
    expect(siteUrl(SiteId.Media)).toBe("https://media.sofinwave.org");
    expect(pageUrl("vi", "about", SiteId.Academy)).toBe("https://academy.sofinwave.org/vi/about");
  });

  it("strips stray slashes from the path", () => {
    expect(pageUrl("en", "/about/", SiteId.Media)).toBe("https://media.sofinwave.org/en/about");
  });

  it("defaults to the apex when no site is given", () => {
    expect(pageUrl("en", "about")).toBe("https://sofinwave.org/en/about");
  });
});
