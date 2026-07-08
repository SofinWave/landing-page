import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CaseStudy = {
  client: string;
  problem: string;
  solution: string;
  results: { label: string; value: string }[];
  tags: string[];
};

export function CaseStudies() {
  const t = useTranslations("caseStudies");
  const items = t.raw("items") as CaseStudy[];
  return (
    <Section id="work">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {items.map((c) => (
          <Card key={c.client} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{c.client}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                {c.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("problemLabel")}
                </p>
                <p className="mt-1">{c.problem}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("solutionLabel")}
                </p>
                <p className="mt-1">{c.solution}</p>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-4">
                {c.results.map((r) => (
                  <div key={r.label}>
                    <div className="text-2xl font-bold text-gradient">{r.value}</div>
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
