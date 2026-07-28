import type { SiteId } from "@/enums";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/sites";
import { pageUrl } from "@/lib/site";

/** Escapes the five XML entities. URLs are ours, but correctness is free here. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Sitemap for one site, with full `xhtml:link` hreflang annotations.
 *
 * Hand-rolled rather than using Next's `MetadataRoute.Sitemap`: that helper does
 * not live under a dynamic segment cleanly, and emitting the XML directly makes
 * the alternate-language block explicit.
 *
 * Every URL points at a real page — never `/{locale}`, which only redirects.
 */
export function buildSitemap(site: SiteId, lastModified: Date): string {
  const { routes } = siteConfig(site);
  const lastmod = lastModified.toISOString();

  const urls = routing.locales.flatMap((locale) =>
    routes.map((route) => {
      const alternates = [
        ...routing.locales.map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${xml(pageUrl(l, route.path, site))}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(pageUrl(routing.defaultLocale, route.path, site))}"/>`,
      ].join("\n");

      const priority = locale === routing.defaultLocale ? route.priority : route.priority * 0.9;

      return [
        "  <url>",
        `    <loc>${xml(pageUrl(locale, route.path, site))}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${route.changeFrequency}</changefreq>`,
        `    <priority>${priority.toFixed(1)}</priority>`,
        alternates,
        "  </url>",
      ].join("\n");
    }),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
