import type { Metadata } from "next";
import type { SiteId } from "@/enums";
import { routing } from "@/i18n/routing";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";
import { OG_LOCALE, languageAlternates, pageKeywords, pageUrl, siteUrl } from "@/lib/site";

interface PageMetadataArgs {
  locale: string;
  /** Path after the locale prefix, e.g. `"services/delivery-teams"`. */
  path: string;
  title: string;
  description: string;
  /**
   * Route key, used to look up page-specific keywords. Omitting it leaves the
   * site-level list the layout already set, which is the right default for a
   * page that is simply about what the site is about.
   */
  routeKey?: string;
  site?: SiteId;
}

/**
 * Per-page canonical, hreflang, and Open Graph metadata.
 *
 * This belongs on the page rather than the layout: a layout wraps every route,
 * so a canonical declared there would point every page at the same URL.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  routeKey,
  site = DEFAULT_SITE.id,
}: PageMetadataArgs): Metadata {
  const url = pageUrl(locale, path, site);
  const config = siteConfig(site);

  /**
   * Referenced explicitly rather than left to Next.js's `opengraph-image` file
   * convention: because these pages set `openGraph` in `generateMetadata`, the
   * convention-based image was not being merged in and every page shipped
   * without an `og:image` at all.
   */
  const image = {
    url: `${siteUrl(site)}/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: config.name,
  };

  return {
    title,
    description,
    // Overrides the layout's site-level list for this page only. Next merges
    // metadata child-over-parent, so pages without a routeKey keep the default.
    ...(routeKey ? { keywords: pageKeywords(locale, routeKey, site) } : {}),
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(routing.locales, path, site),
        "x-default": pageUrl(routing.defaultLocale, path, site),
      },
    },
    openGraph: {
      type: "website",
      siteName: config.name,
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
