import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import type { SiteId } from "@/enums";
import { breadcrumbTrail } from "@/lib/routes";
import { isAbsoluteHref, isExternalHref } from "@/lib/site";
import { siteConfig } from "@/lib/sites";

export interface ContentSection {
  heading: string;
  body: string;
  bullets?: string[];
  /** Internal paths are locale-prefixed; absolute URLs are left untouched. */
  links?: { href: string; label: string }[];
}

export interface ContentTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface ContentFaqItem {
  question: string;
  answer: string;
}

/** Shape every content page's entry under the `pages` message namespace follows. */
export interface ContentPageData {
  metaTitle: string;
  metaDescription: string;
  title: string;
  /** Answers the page's core question in the first sentences — what answer engines quote. */
  lede: string;
  sections: ContentSection[];
  table?: ContentTable;
  faq: ContentFaqItem[];
  cta: { title: string; body: string; button: string };
}

/**
 * Shared shell for every non-landing page.
 *
 * Renders semantic, server-rendered markup throughout — the FAQ is plain
 * headings and paragraphs rather than an accordion, so both crawlers and answer
 * engines read the answers without executing anything.
 */
export async function ContentPage({
  locale,
  path,
  data,
  site,
}: {
  locale: string;
  path: string;
  data: ContentPageData;
  site: SiteId;
}) {
  const t = await getTranslations({ locale, namespace: siteConfig(site).contentNamespace });
  const trail = breadcrumbTrail(site, path);
  const ancestors = trail.slice(0, -1);

  return (
    <article>
      <Section className="max-w-3xl pb-0">
        <nav aria-label={t("breadcrumbLabel")} className="mb-8">
          <ol className="flex flex-wrap items-center gap-1 font-mono text-xs text-muted-foreground">
            {ancestors.map((crumb) => (
              <li key={crumb.path} className="flex items-center gap-1">
                <Link href={`/${crumb.path}`} className="transition-colors hover:text-foreground">
                  {t(`${crumb.key}.title`)}
                </Link>
                <ChevronRight className="size-3" aria-hidden />
              </li>
            ))}
            <li aria-current="page" className="text-foreground">
              {data.title}
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">{data.title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{data.lede}</p>
      </Section>

      <Section className="max-w-3xl space-y-12 pt-12">
        {data.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{section.heading}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{section.body}</p>
            {section.bullets?.length ? (
              <ul className="mt-4 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.links?.length ? (
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {isAbsoluteHref(link.href) ? (
                      // A different hostname — one of the sibling sites, or an
                      // outside reference. The locale-aware Link would try to
                      // prefix it with the current locale.
                      <a
                        href={link.href}
                        // Only a link off our own network opens a new tab.
                        // Moving between our four sites is not a departure.
                        {...(isExternalHref(link.href)
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {data.table ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="mb-4 text-left text-2xl font-semibold tracking-tight md:text-3xl">
                {data.table.caption}
              </caption>
              <thead>
                <tr className="border-b">
                  {data.table.columns.map((column) => (
                    <th key={column} scope="col" className="py-3 pr-4 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.table.rows.map((row) => (
                  <tr key={row.join("|")} className="border-b border-border/50">
                    {row.map((cell, i) => (
                      <td
                        key={cell}
                        className={
                          i === 0 ? "py-3 pr-4 font-medium" : "py-3 pr-4 text-muted-foreground"
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Section>

      <Section className="max-w-3xl pt-0">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("faqHeading")}</h2>
        <dl className="mt-8 space-y-8">
          {data.faq.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-2 leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="max-w-3xl pt-0">
        <div className="rounded-lg border bg-card p-8 md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">{data.cta.title}</h2>
          <p className="mt-3 text-muted-foreground">{data.cta.body}</p>
          <Button asChild className="mt-6">
            <Link href="/contact">{data.cta.button}</Link>
          </Button>
        </div>
      </Section>
    </article>
  );
}
