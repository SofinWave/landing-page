import { getTranslations } from "next-intl/server";
import type { ContentPageData } from "@/components/content-page";
import { findRoute } from "@/lib/routes";
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  personSchema,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/structured-data";

function jsonLd(graph: unknown[]) {
  return (
    <script
      type="application/ld+json"
      // Content is derived from our own translation files, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

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

  const tTeam = await getTranslations({ locale, namespace: "team" });
  const members = tTeam.raw("members") as { name: string; role: string }[];

  return jsonLd([
    organizationSchema({
      locale,
      description: tMeta("description"),
      services,
      technologies,
      domains,
    }),
    websiteSchema(locale),
    faqSchema(faqItems),
    // Only real, named people get a Person node — placeholder roster entries are
    // skipped rather than published as if they were staff.
    ...members
      .filter((m) => !PLACEHOLDER_NAMES.has(m.name.trim().toLowerCase()))
      .map((m) => personSchema({ name: m.name, role: m.role, locale })),
  ]);
}

/** Roster placeholders that must never be emitted as schema.org `Person`. */
const PLACEHOLDER_NAMES = new Set(["team member", "tbd", "coming soon"]);

/**
 * JSON-LD for a content page: WebPage, BreadcrumbList, its FAQ, and — for
 * routes under `/services` — a Service node carrying the targeted query.
 */
export async function PageStructuredData({
  locale,
  path,
  data,
}: {
  locale: string;
  path: string;
  data: ContentPageData;
}) {
  const t = await getTranslations({ locale, namespace: "pages" });

  const graph: unknown[] = [
    webPageSchema({ locale, path, title: data.metaTitle, description: data.metaDescription }),
    breadcrumbSchema(locale, path, (route) => t(`${route.key}.title`)),
  ];

  if (data.faq.length > 0) graph.push(faqSchema(data.faq));

  if (path.startsWith("services/")) {
    const route = findRoute(path);
    if (route) {
      graph.push(
        serviceSchema({
          locale,
          path,
          name: data.title,
          description: data.metaDescription,
          serviceType: data.metaTitle,
        }),
      );
    }
  }

  return jsonLd(graph);
}
