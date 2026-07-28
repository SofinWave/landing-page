import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { routing } from "@/i18n/routing";
import { ROUTES, HOME_PATH } from "@/lib/routes";
import { SITE_EMAIL, SITE_NAME, SITE_URL, pageUrl } from "@/lib/site";

/**
 * Generators for `/llms.txt` and `/llms-full.txt`.
 *
 * Both are derived from the route registry and the message catalogs rather than
 * maintained by hand, so they cannot drift from the site the way the previous
 * hand-written `public/llms.txt` inevitably would have.
 */

type Catalog = typeof en;

const CATALOGS: Record<string, Catalog> = {
  en,
  vi: vi as unknown as Catalog,
};

function catalog(locale: string): Catalog {
  return CATALOGS[locale] ?? CATALOGS[routing.defaultLocale];
}

interface ContentEntry {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lede: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
  table?: { caption: string; columns: string[]; rows: string[][] };
  faq: { question: string; answer: string }[];
}

function contentPages(locale: string) {
  const pages = catalog(locale).pages as unknown as Record<string, ContentEntry>;

  return ROUTES.filter((route) => route.path !== HOME_PATH).map((route) => ({
    route,
    url: pageUrl(locale, route.path),
    page: pages[route.key],
  }));
}

/** Short index: what the site is, and one line per page. The llms.txt convention. */
export function buildLlmsTxt(): string {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${en.metadata.description}`,
    "",
    "## Pages",
    "",
  ];

  for (const locale of routing.locales) {
    const home = pageUrl(locale, HOME_PATH);
    lines.push(`### ${locale === "en" ? "English" : "Tiếng Việt"} (${locale})`, "");
    lines.push(`- [${catalog(locale).metadata.title}](${home})`);

    for (const { url, page } of contentPages(locale)) {
      lines.push(`- [${page.title}](${url}): ${page.metaDescription}`);
    }
    lines.push("");
  }

  lines.push(
    "## Contact",
    "",
    `- Website: ${SITE_URL}`,
    `- Email: ${SITE_EMAIL}`,
    `- Languages: English, Vietnamese`,
    "",
  );

  return lines.join("\n");
}

/** Full text of every page, so an answer engine can cite specifics without crawling. */
export function buildLlmsFullTxt(): string {
  const lines: string[] = [
    `# ${SITE_NAME} — full content`,
    "",
    `> ${en.metadata.description}`,
    "",
    `Canonical site: ${SITE_URL}. Content below is the complete text of every page,`,
    "in English first and Vietnamese second.",
    "",
  ];

  for (const locale of routing.locales) {
    lines.push("---", "", `# Locale: ${locale}`, "");

    const home = catalog(locale);
    lines.push(`## ${home.metadata.title}`, "", `URL: ${pageUrl(locale, HOME_PATH)}`, "");
    lines.push(home.hero.subtitle, "");
    lines.push("### FAQ", "");
    for (const item of home.faq.items) {
      lines.push(`**${item.question}**`, "", item.answer, "");
    }

    for (const { url, page } of contentPages(locale)) {
      lines.push("---", "", `## ${page.title}`, "", `URL: ${url}`, "", page.lede, "");

      for (const section of page.sections) {
        lines.push(`### ${section.heading}`, "", section.body, "");
        for (const bullet of section.bullets ?? []) lines.push(`- ${bullet}`);
        if (section.bullets?.length) lines.push("");
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

  lines.push("---", "", "## Contact", "", `Email: ${SITE_EMAIL}`, `Website: ${SITE_URL}`, "");

  return lines.join("\n");
}
