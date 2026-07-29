import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { siteKeywords, siteUrl } from "@/lib/site";
import { ALL_SITES, DEFAULT_SITE, isSiteId, siteConfig } from "@/lib/sites";
import "../../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Set in the deployment environment once the property is claimed on Baidu. */
const BAIDU_VERIFICATION = process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION;

export function generateStaticParams() {
  return ALL_SITES.flatMap((site) => routing.locales.map((locale) => ({ site: site.id, locale })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string; locale: string }>;
}): Promise<Metadata> {
  const { site, locale } = await params;
  const config = siteConfig(isSiteId(site) ? site : DEFAULT_SITE.id);
  const t = await getTranslations({ locale, namespace: config.metaNamespace });

  /**
   * Site-wide defaults only. Canonical, hreflang, and per-page Open Graph are
   * set by each page via `pageMetadata` — declaring a canonical on the layout
   * would point every route at the same URL.
   */
  const origin = siteUrl(config.id);

  return {
    metadataBase: new URL(origin),
    manifest: "/manifest.webmanifest",
    title: {
      default: t("title"),
      template: `%s | ${config.name}`,
    },
    description: t("description"),
    applicationName: config.name,
    keywords: siteKeywords(locale, config.id),
    authors: [{ name: config.name, url: origin }],
    creator: config.name,
    publisher: config.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    /**
     * Ownership token from Baidu's search resource platform (ziyuan.baidu.com),
     * which is what unlocks sitemap submission and the URL push API.
     *
     * Read from the environment and emitted only when set: the token is
     * per-property, and a placeholder committed here would fail verification
     * while looking like it had been done.
     */
    ...(BAIDU_VERIFICATION
      ? { verification: { other: { "baidu-site-verification": BAIDU_VERIFICATION } } }
      : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isSiteId(site)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
        {/* No-ops outside Vercel, so local and Docker builds are unaffected. */}
        <Analytics />
      </body>
    </html>
  );
}
