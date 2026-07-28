import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { ProcessLine } from "@/components/process-line";

type Step = { title: string; description: string };

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];
  return (
    <Section id="process" index={2} label="Process" className="bg-muted/30">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ProcessLine className="mb-8 hidden md:block" />
      <ol className="grid gap-6 md:grid-cols-5">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-lg border border-border bg-card p-5 hud-corners relative overflow-hidden"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold font-mono">
              {i + 1}
            </div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
