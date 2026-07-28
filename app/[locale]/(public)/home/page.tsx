import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { HOME_PATH } from "@/lib/routes";
import { StructuredData } from "@/components/structured-data";
import { SiteHeader } from "@/components/site-header";
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
import { SiteFooter } from "@/components/site-footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    // The landing page owns the site's default title, so it opts out of the
    // "%s | SofinWave" template the layout applies to subpages.
    ...pageMetadata({
      locale,
      path: HOME_PATH,
      title: t("title"),
      description: t("description"),
    }),
    title: { absolute: t("title") },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData locale={locale} />
      <SiteHeader />
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
      <SiteFooter />
    </div>
  );
}
