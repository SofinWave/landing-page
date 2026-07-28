import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { OG_LOCALE, SITE_NAME, SITE_URL, languageAlternates, pageUrl } from "@/lib/site";

interface PageMetadataArgs {
  locale: string;
  /** Path after the locale prefix, e.g. `"services/dedicated-team"`. */
  path: string;
  title: string;
  description: string;
}

/**
 * Per-page canonical, hreflang, and Open Graph metadata.
 *
 * This belongs on the page rather than the layout: a layout wraps every route,
 * so a canonical declared there would point every page at the same URL.
 */
export function pageMetadata({ locale, path, title, description }: PageMetadataArgs): Metadata {
  const url = pageUrl(locale, path);

  /**
   * Referenced explicitly rather than left to Next.js's `opengraph-image` file
   * convention: because these pages set `openGraph` in `generateMetadata`, the
   * convention-based image was not being merged in and every page shipped
   * without an `og:image` at all.
   */
  const image = {
    url: `${SITE_URL}/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: SITE_NAME,
  };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(routing.locales, path),
        "x-default": pageUrl(routing.defaultLocale, path),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
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
