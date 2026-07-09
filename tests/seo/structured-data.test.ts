import { describe, it, expect } from "vitest";
import {
  faqSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/structured-data";
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
    expect(org["@id"]).toBe("https://kingnnt.org/#organization");
    expect(org.logo).toBe("https://kingnnt.org/icon.png");
    expect(org.url).toBe("https://kingnnt.org/en");
  });

  it("lists every service in the offer catalog", () => {
    expect(org.hasOfferCatalog.itemListElement).toHaveLength(services.length);
    expect(org.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe(
      services[0].title,
    );
  });

  it("declares expertise and areas served", () => {
    expect(org.knowsAbout).toEqual([...en.tech.technologies, ...en.tech.domains]);
    expect(org.areaServed.some((a) => a.name === "Vietnam")).toBe(true);
  });
});

describe("websiteSchema", () => {
  it("links to the organization publisher", () => {
    const site = websiteSchema("vi");
    expect(site["@type"]).toBe("WebSite");
    expect(site.url).toBe("https://kingnnt.org/vi");
    expect(site.publisher["@id"]).toBe("https://kingnnt.org/#organization");
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
