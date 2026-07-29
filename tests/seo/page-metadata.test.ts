import { describe, it, expect } from "vitest";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/structured-data";
import { HOME_PATH, contentRoutesFor } from "@/lib/routes";
import { SiteId } from "@/enums";
import { routing } from "@/i18n/routing";

describe("pageMetadata", () => {
  it("self-canonicalises to the page's own URL", () => {
    const meta = pageMetadata({
      locale: "en",
      path: "services/dedicated-team",
      title: "t",
      description: "d",
    });

    expect(meta.alternates?.canonical).toBe("https://sofinwave.com/en/services/dedicated-team");
  });

  it("declares hreflang for the same path in every locale, plus x-default", () => {
    const meta = pageMetadata({ locale: "vi", path: "about", title: "t", description: "d" });
    const langs = meta.alternates?.languages ?? {};

    for (const locale of routing.locales) {
      expect(langs[locale]).toBe(`https://sofinwave.com/${locale}/about`);
    }
    expect(langs["x-default"]).toBe("https://sofinwave.com/en/about");
  });

  it("never canonicalises the landing page to the redirecting locale root", () => {
    const meta = pageMetadata({ locale: "en", path: HOME_PATH, title: "t", description: "d" });
    expect(meta.alternates?.canonical).toBe("https://sofinwave.com/en/home");
  });

  it("declares a 1200x630 social card on both og and twitter", () => {
    // Regression guard: setting `openGraph` here stops Next.js from merging the
    // `opengraph-image` file convention, which silently left every page without
    // an og:image.
    const meta = pageMetadata({ locale: "vi", path: "about", title: "t", description: "d" });
    const images = meta.openGraph?.images;

    expect(Array.isArray(images) && images.length).toBeTruthy();
    const image = (images as { url: string; width: number; height: number }[])[0];
    expect(image.url).toBe("https://sofinwave.com/vi/opengraph-image");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(meta.twitter?.images).toEqual(["https://sofinwave.com/vi/opengraph-image"]);
  });
});

describe("webPageSchema", () => {
  it("binds the page to the site and organization entities", () => {
    const node = webPageSchema({
      locale: "en",
      path: "about",
      title: "About",
      description: "d",
    });

    expect(node.url).toBe("https://sofinwave.com/en/about");
    expect(node.isPartOf["@id"]).toBe("https://sofinwave.com/#website");
    expect(node.about["@id"]).toBe("https://sofinwave.com/#organization");
  });
});

describe("breadcrumbSchema", () => {
  it("emits a positioned trail matching the route hierarchy", () => {
    const node = breadcrumbSchema("en", "services/delivery-teams", (r) => r.key, SiteId.Tech);

    expect(node.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(node.itemListElement.map((i) => i.item)).toEqual([
      "https://sofinwave.com/en/home",
      "https://sofinwave.com/en/services",
      "https://sofinwave.com/en/services/delivery-teams",
    ]);
  });
});

describe("serviceSchema", () => {
  it("names the provider entity and the areas served", () => {
    const node = serviceSchema({
      locale: "en",
      path: "services/offshore-development",
      name: "Offshore Software Development",
      description: "d",
      serviceType: "Offshore Software Development Services in Vietnam",
    });

    expect(node.provider["@id"]).toBe("https://sofinwave.com/#organization");
    expect(node.areaServed.some((a) => a.name === "Vietnam")).toBe(true);
  });

  it("covers every service route", () => {
    const serviceRoutes = contentRoutesFor(SiteId.Tech).filter((r) =>
      r.path.startsWith("services/"),
    );
    expect(serviceRoutes.length).toBeGreaterThan(0);
  });
});

describe("per-site metadata", () => {
  it("canonicalises each site to its own origin", () => {
    const media = pageMetadata({
      locale: "en",
      path: "about",
      title: "t",
      description: "d",
      site: SiteId.Media,
    });
    expect(media.alternates?.canonical).toBe("https://media.sofinwave.com/en/about");

    const finance = pageMetadata({
      locale: "vi",
      path: "disclaimer",
      title: "t",
      description: "d",
      site: SiteId.Finance,
    });
    expect(finance.alternates?.canonical).toBe("https://finance.sofinwave.com/vi/disclaimer");
  });

  it("points each site's social card at its own origin", () => {
    const meta = pageMetadata({
      locale: "en",
      path: HOME_PATH,
      title: "t",
      description: "d",
      site: SiteId.Academy,
    });
    expect(meta.twitter?.images).toEqual(["https://academy.sofinwave.com/en/opengraph-image"]);
  });
});
