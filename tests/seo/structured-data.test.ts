import { describe, it, expect } from "vitest";
import {
  faqSchema,
  organizationSchema,
  serviceSchema,
  softwareApplicationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/structured-data";
import { SiteId } from "@/enums";
import { routing } from "@/i18n/routing";
import { CONTENT_LAST_MODIFIED } from "@/lib/routes";
import en from "@/messages/en.json";

const services = en.services.items;
const faq = en.faq.items;

describe("organizationSchema", () => {
  const org = organizationSchema({
    locale: "en",
    description: en.metadata.description,
    services,
    technologies: en.tech.technologies,
    domains: en.tech.domains,
  });

  it("is a ProfessionalService with a stable @id and logo", () => {
    expect(org["@type"]).toBe("ProfessionalService");
    expect(org["@id"]).toBe("https://sofinwave.com/#organization");
    expect(org.logo).toBe("https://sofinwave.com/icon.png");
    expect(org.url).toBe("https://sofinwave.com/en/home");
  });

  it("lists every service in the offer catalog", () => {
    expect(org.hasOfferCatalog.itemListElement).toHaveLength(services.length);
    expect(org.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe(services[0].title);
  });

  it("declares expertise and areas served", () => {
    expect(org.knowsAbout).toEqual([...en.tech.technologies, ...en.tech.domains]);
    expect(org.areaServed.some((a) => a.name === "Vietnam")).toBe(true);
  });

  it("declares the other three verticals as sub-organizations", () => {
    expect(org.parentOrganization).toBeUndefined();
    expect(org.subOrganization).toEqual([
      {
        "@type": "Organization",
        "@id": "https://media.sofinwave.com/#organization",
        name: "SofinWave Media",
        url: "https://media.sofinwave.com/en/home",
      },
      {
        "@type": "Organization",
        "@id": "https://finance.sofinwave.com/#organization",
        name: "SofinWave Finance",
        url: "https://finance.sofinwave.com/en/home",
      },
      {
        "@type": "EducationalOrganization",
        "@id": "https://academy.sofinwave.com/#organization",
        name: "SofinWave Academy",
        url: "https://academy.sofinwave.com/en/home",
      },
    ]);
  });
});

describe("organizationSchema on the sibling sites", () => {
  const cases = [
    { site: SiteId.Media, description: en.mediaMetadata.description },
    { site: SiteId.Finance, description: en.financeMetadata.description },
    { site: SiteId.Academy, description: en.academyMetadata.description },
  ] as const;

  for (const { site, description } of cases) {
    it(`points ${site} back at the apex organization`, () => {
      const org = organizationSchema({ locale: "en", description, site });

      expect(org.subOrganization).toBeUndefined();
      expect(org.parentOrganization).toEqual({
        "@type": "ProfessionalService",
        "@id": "https://sofinwave.com/#organization",
        name: "SofinWave",
        url: "https://sofinwave.com/en/home",
      });
    });

    it(`does not let ${site} borrow the tech catalog or expertise`, () => {
      const org = organizationSchema({ locale: "en", description, site });

      expect(org.hasOfferCatalog).toBeUndefined();
      expect(org.knowsAbout).toBeUndefined();
    });
  }
});

describe("serviceSchema", () => {
  // This was a hardcoded ["en", "vi"], which would have gone on telling answer
  // engines the service is offered in two languages after a third was added.
  it("advertises every routed locale as an available language", () => {
    const service = serviceSchema({
      locale: "en",
      path: "services/offshore-development",
      name: "Offshore development",
      description: "A complete offshore team.",
      serviceType: "Software outsourcing",
    });
    expect(service.availableLanguage).toEqual([...routing.locales]);
  });
});

describe("websiteSchema", () => {
  it("links to the organization publisher", () => {
    const site = websiteSchema("vi");
    expect(site["@type"]).toBe("WebSite");
    expect(site.url).toBe("https://sofinwave.com/vi/home");
    expect(site.publisher["@id"]).toBe("https://sofinwave.com/#organization");
  });
});

describe("webPageSchema", () => {
  const page = webPageSchema({
    locale: "en",
    path: "services/it-consulting",
    title: "IT consulting",
    description: "Consulting for teams shipping software.",
  });

  it("binds the page to the site and publisher entities", () => {
    expect(page["@id"]).toBe("https://sofinwave.com/en/services/it-consulting#webpage");
    expect(page.isPartOf["@id"]).toBe("https://sofinwave.com/#website");
    expect(page.publisher["@id"]).toBe("https://sofinwave.com/#organization");
  });

  // Answer engines weigh freshness when choosing what to cite, and nothing
  // else in the markup carried a date.
  it("carries the registry's modification date", () => {
    expect(page.dateModified).toBe(CONTENT_LAST_MODIFIED);
  });
});

describe("faqSchema", () => {
  it("maps each FAQ item to a Question/Answer pair", () => {
    const schema = faqSchema(faq);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(faq.length);
    expect(schema.mainEntity[0].name).toBe(faq[0].question);
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe(faq[0].answer);
  });
});

describe("softwareApplicationSchema", () => {
  const [smartFinTrack, tuViDauSo] = en.products.items.map((product) =>
    softwareApplicationSchema({
      key: product.key,
      name: product.name,
      description: product.blurb,
      url: product.href,
    }),
  );

  it("describes a free web application published by the consultancy", () => {
    expect(smartFinTrack["@type"]).toBe("SoftwareApplication");
    expect(smartFinTrack.name).toBe("SmartFinTrack");
    expect(smartFinTrack.url).toBe("https://smartfintrack.kingnnt.org");
    expect(smartFinTrack.operatingSystem).toBe("Web");
    expect(smartFinTrack.offers).toEqual({
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    });
    expect(smartFinTrack.publisher).toEqual({
      "@id": "https://sofinwave.com/#organization",
    });
  });

  it("categorises each product for its own audience", () => {
    expect(smartFinTrack.applicationCategory).toBe("FinanceApplication");
    expect(tuViDauSo.applicationCategory).toBe("LifestyleApplication");
  });

  it("declares the locales the routing config actually serves", () => {
    expect(smartFinTrack.inLanguage).toEqual([...routing.locales]);
  });

  // The testimonials are not real yet, and neither are any ratings.
  it("never claims a rating or a review", () => {
    for (const node of [smartFinTrack, tuViDauSo]) {
      expect(node.aggregateRating).toBeUndefined();
      expect(node.review).toBeUndefined();
    }
  });
});
