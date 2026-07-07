import { setRequestLocale } from "next-intl/server";
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
import { SiteFooter } from "./_components/footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
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
