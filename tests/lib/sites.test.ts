import { describe, it, expect } from "vitest";
import { SiteId } from "@/enums";
import { ALL_SITES, DEFAULT_SITE, isSiteId, siteConfig } from "@/lib/sites";
import { isExternalHref, pageUrl, siteUrl } from "@/lib/site";
import en from "@/messages/en.json";

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
    expect(DEFAULT_SITE.host).toBe("sofinwave.com");
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
    expect(siteUrl(SiteId.Tech)).toBe("https://sofinwave.com");
    expect(siteUrl(SiteId.Media)).toBe("https://media.sofinwave.com");
    expect(pageUrl("vi", "about", SiteId.Academy)).toBe("https://academy.sofinwave.com/vi/about");
  });

  it("strips stray slashes from the path", () => {
    expect(pageUrl("en", "/about/", SiteId.Media)).toBe("https://media.sofinwave.com/en/about");
  });

  it("defaults to the apex when no site is given", () => {
    expect(pageUrl("en", "about")).toBe("https://sofinwave.com/en/about");
  });
});

describe("products in the footer", () => {
  it("links the tech footer to the products page", () => {
    const keys = siteConfig(SiteId.Tech).footerCompany.map((item) => item.href);

    expect(keys).toContain("/products");
  });

  it("keeps it out of the header nav, which is services only", () => {
    const hrefs = siteConfig(SiteId.Tech).nav.map((item) => item.href);

    expect(hrefs).not.toContain("/products");
  });

  it("does not offer it on the other three sites", () => {
    for (const site of [SiteId.Media, SiteId.Finance, SiteId.Academy]) {
      const config = siteConfig(site);
      const hrefs = [...config.nav, ...config.footerCompany, ...config.footerServices].map(
        (item) => item.href,
      );

      expect(hrefs).not.toContain("/products");
    }
  });
});

describe("isExternalHref", () => {
  it("treats every one of our own sites as internal", () => {
    for (const site of ALL_SITES) {
      expect(isExternalHref(`https://${site.host}/en/home`)).toBe(false);
    }
  });

  it("treats the product domains as external", () => {
    for (const product of en.products.items) {
      expect(isExternalHref(product.href)).toBe(true);
    }
  });

  it("treats a third-party URL as external", () => {
    expect(isExternalHref("https://github.com/SofinWave")).toBe(true);
  });

  it("never calls a relative path external — it resolves against the current site", () => {
    for (const href of ["/products", "/en/home", "services/it-consulting"]) {
      expect(isExternalHref(href)).toBe(false);
    }
  });

  it("does not throw on an unparseable href", () => {
    expect(isExternalHref("https://")).toBe(false);
  });
});
