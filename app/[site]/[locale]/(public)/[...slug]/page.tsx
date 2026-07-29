import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContentPage, type ContentPageData } from "@/components/content-page";
import { PageStructuredData } from "@/components/structured-data";
import { Contact } from "@/app/[site]/[locale]/(public)/home/_components/contact";
import { pageMetadata } from "@/lib/metadata";
import { contentRoutesFor, findRoute } from "@/lib/routes";
import { ALL_SITES, isSiteId, siteConfig } from "@/lib/sites";
import { routing } from "@/i18n/routing";

/**
 * Renders every content route of every site through one shared shell.
 *
 * `/{locale}/home` has its own explicit route file, which Next.js matches ahead
 * of this catch-all, so landing pages are unaffected.
 */
export function generateStaticParams() {
  return ALL_SITES.flatMap((site) =>
    routing.locales.flatMap((locale) =>
      contentRoutesFor(site.id).map((route) => ({
        site: site.id,
        locale,
        slug: route.path.split("/"),
      })),
    ),
  );
}

async function loadPage(site: string, locale: string, slug: string[]) {
  if (!isSiteId(site)) return null;

  const path = slug.join("/");
  const route = findRoute(site, path);
  if (!route) return null;

  const t = await getTranslations({ locale, namespace: siteConfig(site).contentNamespace });
  return { site, route, data: t.raw(route.key) as ContentPageData };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string; locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { site, locale, slug } = await params;
  const page = await loadPage(site, locale, slug);
  if (!page) return {};

  return pageMetadata({
    locale,
    path: page.route.path,
    title: page.data.metaTitle,
    description: page.data.metaDescription,
    routeKey: page.route.key,
    site: page.site,
  });
}

export default async function ContentRoutePage({
  params,
}: {
  params: Promise<{ site: string; locale: string; slug: string[] }>;
}) {
  const { site, locale, slug } = await params;
  setRequestLocale(locale);

  const page = await loadPage(site, locale, slug);
  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <PageStructuredData
        locale={locale}
        path={page.route.path}
        data={page.data}
        site={page.site}
      />
      <SiteHeader site={page.site} />
      <main className="flex-1">
        <ContentPage locale={locale} path={page.route.path} data={page.data} site={page.site} />
        {/* The contact page is the one route that needs an interactive element. */}
        {page.route.path === "contact" ? <Contact /> : null}
      </main>
      <SiteFooter site={page.site} />
    </div>
  );
}
