import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";
import { languageAlternates, pageUrl } from "@/lib/site";

/**
 * Every route from the registry, in every locale, with hreflang alternates.
 *
 * URLs point at real pages (`/{locale}/home`, not `/{locale}`) — the locale root
 * only redirects, and listing a redirect in a sitemap wastes crawl budget.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: pageUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: locale === routing.defaultLocale ? route.priority : route.priority * 0.9,
      alternates: {
        languages: {
          ...languageAlternates(routing.locales, route.path),
          "x-default": pageUrl(routing.defaultLocale, route.path),
        },
      },
    })),
  );
}
