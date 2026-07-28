import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContentPage, type ContentPageData } from "@/components/content-page";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";
import { PageStructuredData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { CONTENT_ROUTES, findRoute } from "@/lib/routes";
import { routing } from "@/i18n/routing";

/**
 * Renders every content route from the registry through one shared shell.
 *
 * `/{locale}/home` has its own explicit route file, which Next.js matches ahead
 * of this catch-all, so the landing page is unaffected.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CONTENT_ROUTES.map((route) => ({ locale, slug: route.path.split("/") })),
  );
}

async function loadPage(locale: string, slug: string[]) {
  const path = slug.join("/");
  const route = findRoute(path);
  if (!route) return null;

  const t = await getTranslations({ locale, namespace: "pages" });
  return { route, data: t.raw(route.key) as ContentPageData };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await loadPage(locale, slug);
  if (!page) return {};

  return pageMetadata({
    locale,
    path: page.route.path,
    title: page.data.metaTitle,
    description: page.data.metaDescription,
  });
}

export default async function ContentRoutePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await loadPage(locale, slug);
  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <PageStructuredData locale={locale} path={page.route.path} data={page.data} />
      <SiteHeader />
      <main className="flex-1">
        <ContentPage locale={locale} path={page.route.path} data={page.data} />
        {/* The contact page is the one route that needs an interactive element. */}
        {page.route.path === "contact" ? <Contact /> : null}
      </main>
      <SiteFooter />
    </div>
  );
}
