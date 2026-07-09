import { getTranslations } from "next-intl/server";
import { faqSchema, organizationSchema, websiteSchema } from "@/lib/structured-data";

/**
 * Injects JSON-LD (Organization, WebSite, FAQPage) into the page for search
 * engines and generative/answer engines. Server component — reads localized
 * content and serializes it into a single application/ld+json graph.
 */
export async function StructuredData({ locale }: { locale: string }) {
  const [tMeta, tServices, tTech, tFaq] = await Promise.all([
    getTranslations({ locale, namespace: "metadata" }),
    getTranslations({ locale, namespace: "services" }),
    getTranslations({ locale, namespace: "tech" }),
    getTranslations({ locale, namespace: "faq" }),
  ]);

  const services = tServices.raw("items") as { title: string; description: string }[];
  const technologies = tTech.raw("technologies") as string[];
  const domains = tTech.raw("domains") as string[];
  const faqItems = tFaq.raw("items") as { question: string; answer: string }[];

  const graph = [
    organizationSchema({
      locale,
      description: tMeta("description"),
      services,
      technologies,
      domains,
    }),
    websiteSchema(locale),
    faqSchema(faqItems),
  ];

  return (
    <script
      type="application/ld+json"
      // Content is derived from our own translation files, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
