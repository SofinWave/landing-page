import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { HudCard } from "@/components/hud-card";
import { CountUp } from "@/components/count-up";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CaseStudy = {
  client: string;
  problem: string;
  solution: string;
  results: { label: string; value: string }[];
  tags: string[];
};

function parseMetric(value: string): {
  to: number;
  prefix: string;
  suffix: string;
  decimals: number;
} {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { to: 0, prefix: value, suffix: "", decimals: 0 };
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { to: Number(m[2]), prefix: m[1], suffix: m[3], decimals };
}

export function CaseStudies() {
  const t = useTranslations("caseStudies");
  const items = t.raw("items") as CaseStudy[];
  return (
    <Section id="work" index={3} label="Case Studies">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {items.map((c) => (
          <HudCard key={c.client} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{c.client}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
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
                    {(() => {
                      const p = parseMetric(r.value);
                      return (
                        <div className="text-2xl font-bold text-gradient">
                          <CountUp
                            to={p.to}
                            prefix={p.prefix}
                            suffix={p.suffix}
                            decimals={p.decimals}
                          />
                        </div>
                      );
                    })()}
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </HudCard>
        ))}
      </div>
    </Section>
  );
}
