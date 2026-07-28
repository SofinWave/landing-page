import { LocaleSupport } from "@/enums";
import { HOME_PATH } from "@/lib/routes";

/**
 * Canonical site URL. Override per environment with NEXT_PUBLIC_SITE_URL
 * (no trailing slash), e.g. https://sofinwave.org.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sofinwave.org").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "SofinWave";

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
    "dedicated development team",
    "IT staff augmentation",
    "custom software development",
    "offshore development center",
    "hire developers Vietnam",
    "software outsourcing company",
    "system integration",
    "DevOps outsourcing",
    "Next.js",
    "TypeScript",
    "fintech software development",
  ],
  [LocaleSupport.VI]: [
    "thuê ngoài phát triển phần mềm",
    "gia công phần mềm",
    "công ty gia công phần mềm",
    "thuê đội ngũ lập trình",
    "phát triển phần mềm theo yêu cầu",
    "tăng cường nhân sự IT",
    "trung tâm phát triển offshore",
    "tích hợp hệ thống",
    "DevOps",
    "Next.js",
    "TypeScript",
    "phần mềm fintech",
  ],
};

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = ["https://github.com/SofinWave"];

export const SITE_EMAIL = "Work.KingNNT@gmail.com";

/**
 * Absolute URL for a locale-prefixed path.
 *
 * `path` is the segment after the locale, without leading/trailing slashes.
 * Omitting it yields the locale root, which only ever redirects — link to a real
 * page (see {@link canonicalUrl}) rather than relying on that hop.
 */
export function pageUrl(locale: string, path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${SITE_URL}/${locale}/${clean}` : `${SITE_URL}/${locale}`;
}

/**
 * Canonical URL for a page. The landing page lives at `/{locale}/home` — the
 * locale root `/{locale}` redirects there, so it must never be used as a
 * canonical or hreflang target.
 */
export function canonicalUrl(locale: string, path: string): string {
  return pageUrl(locale, path);
}

/** Absolute URL for a locale's landing page. */
export function localeUrl(locale: string): string {
  return pageUrl(locale, HOME_PATH);
}

/** hreflang alternates map (locale -> absolute URL) for a given path. */
export function languageAlternates(
  locales: readonly string[],
  path: string = HOME_PATH,
): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, pageUrl(l, path)]));
}
