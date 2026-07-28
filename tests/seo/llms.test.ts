import { describe, it, expect } from "vitest";
import { SiteId } from "@/enums";
import { buildLlmsTxt, buildLlmsFullTxt } from "@/lib/llms";
import { HOME_PATH, contentRoutesFor } from "@/lib/routes";
import { ALL_SITES, siteConfig } from "@/lib/sites";
import { routing } from "@/i18n/routing";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import zh from "@/messages/zh.json";

const catalog = en as unknown as Record<string, Record<string, never>>;
const CATALOGS: Record<string, Record<string, unknown>> = { en, vi, zh };

describe.each(ALL_SITES.map((s) => s.id))("llms.txt for %s", (siteId) => {
  const config = siteConfig(siteId);
  const txt = buildLlmsTxt(siteId);

  it("lists every route in every locale on that site's origin", () => {
    for (const locale of routing.locales) {
      expect(txt).toContain(`https://${config.host}/${locale}/${HOME_PATH}`);
      for (const route of contentRoutesFor(siteId)) {
        expect(txt).toContain(`https://${config.host}/${locale}/${route.path}`);
      }
    }
  });

  it("opens with the site's own name and description", () => {
    expect(txt.startsWith(`# ${config.name}`)).toBe(true);
    const meta = catalog[config.metaNamespace] as unknown as { description: string };
    expect(txt).toContain(meta.description);
  });

  it("never links another site", () => {
    for (const other of ALL_SITES) {
      if (other.id === siteId) continue;
      expect(txt).not.toContain(`https://${other.host}/`);
    }
  });
});

describe.each(ALL_SITES.map((s) => s.id))("llms-full.txt for %s", (siteId) => {
  const config = siteConfig(siteId);
  const txt = buildLlmsFullTxt(siteId);
  const pages = catalog[config.contentNamespace] as unknown as Record<
    string,
    {
      lede: string;
      sections: { heading: string; links?: { href: string; label: string }[] }[];
      faq: { answer: string }[];
    }
  >;

  it("includes the lede and section headings of every content page", () => {
    for (const route of contentRoutesFor(siteId)) {
      const page = pages[route.key];
      expect(txt, `lede for ${route.key}`).toContain(page.lede);
      for (const section of page.sections) {
        expect(txt, `heading "${section.heading}"`).toContain(section.heading);
      }
    }
  });

  it("carries every section link as an absolute URL", () => {
    for (const route of contentRoutesFor(siteId)) {
      for (const section of pages[route.key].sections) {
        for (const link of section.links ?? []) {
          const url = `https://${config.host}/en${link.href}`;
          expect(txt, `link ${link.href} on ${route.key}`).toContain(`[${link.label}](${url})`);
        }
      }
    }
  });

  it("includes every FAQ answer, which is what answer engines quote", () => {
    for (const route of contentRoutesFor(siteId)) {
      for (const item of pages[route.key].faq) {
        expect(txt).toContain(item.answer);
      }
    }
  });

  it("includes the landing page's own copy", () => {
    // The tech landing page is bespoke, so its copy comes from `hero`/`faq`
    // rather than a content-shell entry; every other site's home is a page.
    if (siteId === SiteId.Tech) {
      const hero = catalog.hero as unknown as { subtitle: string };
      const faq = catalog.faq as unknown as { items: { answer: string }[] };
      expect(txt).toContain(hero.subtitle);
      expect(txt).toContain(faq.items[0].answer);
    } else {
      expect(txt).toContain(pages.home.lede);
    }
  });
});

describe("llms-full.txt content specifics", () => {
  it("renders comparison tables as markdown so they survive plain-text parsing", () => {
    expect(buildLlmsFullTxt(SiteId.Tech)).toContain("| Destination | Overlap with Europe |");
  });

  it("carries the finance disclaimer, which must travel with the content", () => {
    const txt = buildLlmsFullTxt(SiteId.Finance);
    expect(txt).toContain("not a licensed investment adviser");
  });

  // The disclaimer is the reason the finance site can publish at all, so it has
  // to survive translation into every locale, not just the English source.
  it.each(routing.locales)("carries the finance disclaimer in %s", (locale) => {
    const disclaimer = (
      CATALOGS[locale].financePages as unknown as { disclaimer: { lede: string } }
    ).disclaimer.lede;
    expect(buildLlmsFullTxt(SiteId.Finance)).toContain(disclaimer);
  });
});

describe("llms.txt locale coverage", () => {
  // The languages line and the section headings were hardcoded to English and
  // Vietnamese; a third locale used to appear in the URLs but nowhere in the prose.
  it.each(ALL_SITES.map((s) => s.id))("names every routed locale on %s", (siteId) => {
    const txt = buildLlmsTxt(siteId);
    for (const locale of routing.locales) {
      expect(txt, `section heading for ${locale}`).toContain(`(${locale})`);
    }
    expect(txt).toContain("- Languages: English, Vietnamese, Chinese");
  });
});
