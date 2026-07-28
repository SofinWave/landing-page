import { describe, it, expect } from "vitest";
import { buildLlmsTxt, buildLlmsFullTxt } from "@/lib/llms";
import { CONTENT_ROUTES, HOME_PATH } from "@/lib/routes";
import { routing } from "@/i18n/routing";
import en from "@/messages/en.json";

describe("llms.txt", () => {
  const txt = buildLlmsTxt();

  it("lists every content route in every locale", () => {
    for (const locale of routing.locales) {
      expect(txt).toContain(`https://sofinwave.org/${locale}/${HOME_PATH}`);
      for (const route of CONTENT_ROUTES) {
        expect(txt).toContain(`https://sofinwave.org/${locale}/${route.path}`);
      }
    }
  });

  it("never links a locale root, which only redirects", () => {
    for (const locale of routing.locales) {
      expect(txt).not.toMatch(new RegExp(`sofinwave\\.org/${locale}\\)`));
    }
  });

  it("opens with the site summary", () => {
    expect(txt.startsWith("# SofinWave")).toBe(true);
    expect(txt).toContain(en.metadata.description);
  });
});

describe("llms-full.txt", () => {
  const txt = buildLlmsFullTxt();

  it("includes the lede and every section heading of each English page", () => {
    const pages = en.pages as unknown as Record<
      string,
      { lede: string; sections: { heading: string }[] }
    >;

    for (const route of CONTENT_ROUTES) {
      const page = pages[route.key];
      expect(txt, `lede for ${route.key}`).toContain(page.lede);
      for (const section of page.sections) {
        expect(txt, `heading "${section.heading}"`).toContain(section.heading);
      }
    }
  });

  it("includes every FAQ answer, which is what answer engines quote", () => {
    const pages = en.pages as unknown as Record<
      string,
      { faq: { question: string; answer: string }[] }
    >;

    for (const route of CONTENT_ROUTES) {
      for (const item of pages[route.key].faq) {
        expect(txt).toContain(item.answer);
      }
    }
  });

  it("renders comparison tables as markdown so they survive plain-text parsing", () => {
    expect(txt).toContain("| Destination | Overlap with Europe |");
  });
});
