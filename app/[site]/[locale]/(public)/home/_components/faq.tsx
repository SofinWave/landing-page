"use client";

import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

type FaqItem = { question: string; answer: string };

/**
 * Native `details`/`summary` rather than the Radix accordion.
 *
 * A closed Radix `AccordionContent` is never mounted, so none of the answers
 * appeared in the served HTML — they survived only in the `FAQPage` JSON-LD.
 * Google reads that; the crawlers behind ChatGPT, Claude, and Perplexity work
 * from the page text and were seeing questions with no answers. `details` keeps
 * the collapse interaction, ships the full answer in the markup either way, and
 * opens without JavaScript.
 */
export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];
  return (
    <Section className="max-w-3xl" index={8} label="FAQ">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h2>
      <div className="w-full">
        {items.map((item, i) => (
          <details key={item.question} className="group border-b last:border-b-0">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.question}
              </span>
              <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
