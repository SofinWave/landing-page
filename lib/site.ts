import { LocaleSupport, SiteId } from "@/enums";
import { HOME_PATH } from "@/lib/routes";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";

/**
 * Protocol used to build absolute URLs. Override with NEXT_PUBLIC_SITE_PROTOCOL
 * for a non-TLS preview environment.
 */
const PROTOCOL = process.env.NEXT_PUBLIC_SITE_PROTOCOL ?? "https";

/**
 * Canonical URL of the apex site.
 *
 * Kept for the tech site's existing callers; per-site URLs come from
 * {@link siteUrl}, which reads the hostname out of the site registry.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `${PROTOCOL}://${DEFAULT_SITE.host}`
).replace(/\/$/, "");

export const SITE_NAME = DEFAULT_SITE.name;

/** Absolute origin for a site, e.g. `https://media.sofinwave.org`. */
export function siteUrl(site: SiteId): string {
  if (site === DEFAULT_SITE.id) return SITE_URL;
  return `${PROTOCOL}://${siteConfig(site).host}`;
}

/** BCP-47 tags used for Open Graph locale + hreflang. */
export const OG_LOCALE: Record<string, string> = {
  [LocaleSupport.EN]: "en_US",
  [LocaleSupport.VI]: "vi_VN",
};

/** Locale-aware keywords for <meta name="keywords"> and GEO context. */
export const SITE_KEYWORDS: Record<string, string[]> = {
  [LocaleSupport.EN]: [
    "software outsourcing Vietnam",
    "offshore software development",
    "AI implementation consulting",
    "LLM integration services",
    "dedicated development team",
    "IT staff augmentation",
    "custom software development",
    "hire developers Vietnam",
    "software outsourcing company",
    "system integration",
    "DevOps outsourcing",
    "Next.js",
    "TypeScript",
  ],
  [LocaleSupport.VI]: [
    "thuê ngoài phát triển phần mềm",
    "gia công phần mềm",
    "triển khai hệ thống AI",
    "tích hợp LLM",
    "công ty gia công phần mềm",
    "thuê đội ngũ lập trình",
    "phát triển phần mềm theo yêu cầu",
    "tăng cường nhân sự IT",
    "tích hợp hệ thống",
    "DevOps",
    "Next.js",
    "TypeScript",
  ],
};

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = ["https://github.com/SofinWave"];

export const SITE_EMAIL = "Work.KingNNT@gmail.com";

/**
 * Absolute URL for a locale-prefixed path on a site.
 *
 * `path` is the segment after the locale, without leading or trailing slashes.
 * Omitting it yields the locale root, which only ever redirects — link to a real
 * page rather than relying on that hop.
 */
export function pageUrl(locale: string, path = "", site: SiteId = DEFAULT_SITE.id): string {
  const origin = siteUrl(site);
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${origin}/${locale}/${clean}` : `${origin}/${locale}`;
}

/** Absolute URL for a site's landing page. */
export function localeUrl(locale: string, site: SiteId = DEFAULT_SITE.id): string {
  return pageUrl(locale, HOME_PATH, site);
}

/** hreflang alternates map (locale -> absolute URL) for a given path. */
export function languageAlternates(
  locales: readonly string[],
  path: string = HOME_PATH,
  site: SiteId = DEFAULT_SITE.id,
): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, pageUrl(l, path, site)]));
}
