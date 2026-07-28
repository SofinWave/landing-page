import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteId } from "@/enums";
import { pageMetadata } from "@/lib/metadata";
import { HOME_PATH } from "@/lib/routes";
import { ALL_SITES, isSiteId, siteConfig } from "@/lib/sites";
import { routing } from "@/i18n/routing";
import { ContentPage, type ContentPageData } from "@/components/content-page";
import { PageStructuredData, StructuredData } from "@/components/structured-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "./_components/hero";
import { LogoStrip } from "./_components/logo-strip";
import { Services } from "./_components/services";
import { Process } from "./_components/process";
import { CaseStudies } from "./_components/case-studies";
import { TechStack } from "./_components/tech-stack";
import { Testimonials } from "./_components/testimonials";
import { Team } from "./_components/team";
import { Faq } from "./_components/faq";
import { Contact } from "./_components/contact";

export function generateStaticParams() {
  return ALL_SITES.flatMap((site) => routing.locales.map((locale) => ({ site: site.id, locale })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string; locale: string }>;
}): Promise<Metadata> {
  const { site, locale } = await params;
  if (!isSiteId(site)) return {};

  const t = await getTranslations({ locale, namespace: siteConfig(site).metaNamespace });

  return {
    // Landing pages own their site's default title, so they opt out of the
    // "%s | <site>" template the layout applies to subpages.
    ...pageMetadata({
      locale,
      path: HOME_PATH,
      title: t("title"),
      description: t("description"),
      site,
    }),
    title: { absolute: t("title") },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;
  if (!isSiteId(site)) notFound();
  setRequestLocale(locale);

  // The tech site's landing page is a bespoke composition of marketing
  // sections. Every other site's home is a content-shell page like any other
  // route, so it stays data-driven.
  if (site !== SiteId.Tech) {
    const t = await getTranslations({ locale, namespace: siteConfig(site).contentNamespace });
    const data = t.raw("home") as ContentPageData;

    return (
      <div className="flex min-h-screen flex-col">
        <StructuredData locale={locale} site={site} />
        <PageStructuredData locale={locale} path={HOME_PATH} data={data} site={site} />
        <SiteHeader site={site} />
        <main className="flex-1">
          <ContentPage locale={locale} path={HOME_PATH} data={data} site={site} />
        </main>
        <SiteFooter site={site} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData locale={locale} site={site} />
      <SiteHeader site={site} />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <Services />
        <Process />
        <CaseStudies />
        <TechStack />
        <Testimonials />
        <Team />
        <Faq />
        <Contact />
      </main>
      <SiteFooter site={site} />
    </div>
  );
}
