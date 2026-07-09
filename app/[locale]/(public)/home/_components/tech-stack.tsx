import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { TypedText } from "@/components/typed-text";

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function TechStack() {
  const t = useTranslations("tech");
  const technologies = t.raw("technologies") as string[];
  const domains = t.raw("domains") as string[];
  return (
    <Section index={4} label="Tech Stack">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="mx-auto mb-10 max-w-2xl overflow-hidden rounded-lg border border-border bg-card/80">
        <div className="flex gap-1.5 border-b border-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-4 py-4">
          <TypedText
            lines={[
              "$ deploy --env prod",
              "✓ build passed · 42s",
              "✓ tests 218/218",
              "✓ uptime 99.98%",
            ]}
          />
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("technologiesLabel")}
          </h3>
          <Chips items={technologies} />
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("domainsLabel")}
          </h3>
          <Chips items={domains} />
        </div>
      </div>
    </Section>
  );
}
