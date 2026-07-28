import type { ContentPageData } from "@/components/content-page";
import type { SiteId } from "@/enums";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { routing } from "@/i18n/routing";
import { HOME_PATH } from "@/lib/routes";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";
import { SITE_EMAIL, isAbsoluteHref, pageUrl, siteUrl } from "@/lib/site";

/**
 * Generators for each site's `/llms.txt` and `/llms-full.txt`.
 *
 * Both are derived from the route registry and the message catalogs rather than
 * maintained by hand, so they cannot drift from the site the way the previous
 * hand-written `public/llms.txt` inevitably would have.
 */

type Catalog = Record<string, Record<string, unknown>>;

const CATALOGS: Record<string, Catalog> = {
  en: en as unknown as Catalog,
  vi: vi as unknown as Catalog,
};

function catalog(locale: string): Catalog {
  return CATALOGS[locale] ?? CATALOGS[routing.defaultLocale];
}

/**
 * Pages here are the same objects `components/content-page.tsx` renders, so the
 * shape comes from there rather than being restated. A local copy had already
 * drifted once — it never gained `links`, and this generator silently dropped
 * every internal link from the output.
 */
type ContentEntry = ContentPageData;

interface SiteMeta {
  title: string;
  description: string;
}

function meta(site: SiteId, locale: string): SiteMeta {
  return catalog(locale)[siteConfig(site).metaNamespace] as unknown as SiteMeta;
}

function pagesOf(site: SiteId, locale: string): Record<string, ContentEntry> {
  return catalog(locale)[siteConfig(site).contentNamespace] as unknown as Record<
    string,
    ContentEntry
  >;
}

function contentPages(site: SiteId, locale: string) {
  const pages = pagesOf(site, locale);

  return siteConfig(site)
    .routes.filter((route) => route.path !== HOME_PATH)
    .map((route) => ({
      route,
      url: pageUrl(locale, route.path, site),
      page: pages[route.key],
    }))
    .filter((entry) => Boolean(entry.page));
}

const LOCALE_LABEL: Record<string, string> = { en: "English", vi: "Tiếng Việt" };

/**
 * The landing page's text.
 *
 * The tech site's home is a bespoke composition of marketing sections rather
 * than a content-shell page, so its copy lives in the `hero` and `faq`
 * namespaces. Every other site renders home through the shell, where the copy
 * sits under `pages.home` like any other route.
 */
function homeContent(site: SiteId, locale: string): Pick<ContentEntry, "lede" | "faq"> {
  const home = pagesOf(site, locale)?.home;
  if (home?.lede) return { lede: home.lede, faq: home.faq ?? [] };

  const c = catalog(locale);
  const hero = c.hero as unknown as { subtitle?: string } | undefined;
  const faq = c.faq as unknown as { items?: ContentEntry["faq"] } | undefined;

  return {
    lede: hero?.subtitle ?? meta(site, locale).description,
    faq: faq?.items ?? [],
  };
}

/** Short index: what the site is, and one line per page. The llms.txt convention. */
export function buildLlmsTxt(site: SiteId = DEFAULT_SITE.id): string {
  const config = siteConfig(site);
  const lines: string[] = [
    `# ${config.name}`,
    "",
    `> ${meta(site, routing.defaultLocale).description}`,
    "",
    "## Pages",
    "",
  ];

  for (const locale of routing.locales) {
    lines.push(`### ${LOCALE_LABEL[locale] ?? locale} (${locale})`, "");
    lines.push(`- [${meta(site, locale).title}](${pageUrl(locale, HOME_PATH, site)})`);

    for (const { url, page } of contentPages(site, locale)) {
      lines.push(`- [${page.title}](${url}): ${page.metaDescription}`);
    }
    lines.push("");
  }

  lines.push(
    "## Contact",
    "",
    `- Website: ${siteUrl(site)}`,
    `- Email: ${SITE_EMAIL}`,
    "- Languages: English, Vietnamese",
    "",
  );

  return lines.join("\n");
}

/** Full text of every page, so an answer engine can cite specifics without crawling. */
export function buildLlmsFullTxt(site: SiteId = DEFAULT_SITE.id): string {
  const config = siteConfig(site);
  const lines: string[] = [
    `# ${config.name} — full content`,
    "",
    `> ${meta(site, routing.defaultLocale).description}`,
    "",
    `Canonical site: ${siteUrl(site)}. Content below is the complete text of every page,`,
    "in English first and Vietnamese second.",
    "",
  ];

  for (const locale of routing.locales) {
    lines.push("---", "", `# Locale: ${locale}`, "");

    const home = homeContent(site, locale);
    lines.push(
      `## ${meta(site, locale).title}`,
      "",
      `URL: ${pageUrl(locale, HOME_PATH, site)}`,
      "",
      home.lede,
      "",
    );

    if (home.faq.length > 0) {
      lines.push("### FAQ", "");
      for (const item of home.faq) lines.push(`**${item.question}**`, "", item.answer, "");
    }

    for (const { url, page } of contentPages(site, locale)) {
      lines.push("---", "", `## ${page.title}`, "", `URL: ${url}`, "", page.lede, "");

      for (const section of page.sections) {
        lines.push(`### ${section.heading}`, "", section.body, "");
        for (const bullet of section.bullets ?? []) lines.push(`- ${bullet}`);
        if (section.bullets?.length) lines.push("");

        // Absolute, like every other URL in this file: a bare `/services/...`
        // means nothing to an engine reading this text away from the site.
        // Cross-site links already carry their own origin.
        for (const link of section.links ?? []) {
          const url = isAbsoluteHref(link.href) ? link.href : pageUrl(locale, link.href, site);
          lines.push(`- [${link.label}](${url})`);
        }
        if (section.links?.length) lines.push("");
      }

      if (page.table) {
        lines.push(`### ${page.table.caption}`, "");
        lines.push(`| ${page.table.columns.join(" | ")} |`);
        lines.push(`| ${page.table.columns.map(() => "---").join(" | ")} |`);
        for (const row of page.table.rows) lines.push(`| ${row.join(" | ")} |`);
        lines.push("");
      }

      lines.push("### FAQ", "");
      for (const item of page.faq) {
        lines.push(`**${item.question}**`, "", item.answer, "");
      }
    }
  }

  lines.push("---", "", "## Contact", "", `Email: ${SITE_EMAIL}`, `Website: ${siteUrl(site)}`, "");

  return lines.join("\n");
}
