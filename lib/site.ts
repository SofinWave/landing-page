import { LocaleSupport } from "@/enums";

/**
 * Canonical site URL. Override per environment with NEXT_PUBLIC_SITE_URL
 * (no trailing slash), e.g. https://kingnnt.org.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kingnnt.org").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "kingnnt.org";

/** BCP-47 tags used for Open Graph locale + hreflang. */
export const OG_LOCALE: Record<string, string> = {
  [LocaleSupport.EN]: "en_US",
  [LocaleSupport.VI]: "vi_VN",
};

/** Locale-aware keywords for <meta name="keywords"> and GEO context. */
export const SITE_KEYWORDS: Record<string, string[]> = {
  [LocaleSupport.EN]: [
    "software consulting",
    "software implementation",
    "system architecture",
    "custom software development",
    "system integration",
    "DevOps",
    "Next.js",
    "TypeScript",
    "fintech software",
    "enterprise software",
  ],
  [LocaleSupport.VI]: [
    "tư vấn phần mềm",
    "triển khai hệ thống",
    "kiến trúc hệ thống",
    "phát triển phần mềm",
    "tích hợp hệ thống",
    "DevOps",
    "Next.js",
    "TypeScript",
    "phần mềm doanh nghiệp",
  ],
};

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = ["https://github.com/kingnnt"];

export const SITE_EMAIL = "hello@kingnnt.org";

/** Absolute URL for a locale's home page. */
export function localeUrl(locale: string): string {
  return `${SITE_URL}/${locale}`;
}

/** hreflang alternates map (locale -> absolute URL) for a path. */
export function languageAlternates(locales: readonly string[]): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, localeUrl(l)]));
}
