import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { GridBackdrop } from "@/components/backgrounds/grid-backdrop";
import { NeuralField } from "@/components/backgrounds/neural-field";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <div id="top" className="relative overflow-hidden bg-hero-gradient">
      <GridBackdrop />
      <NeuralField className="opacity-70" />
      <div className="container relative z-10 mx-auto px-4 py-24 text-center md:py-32">
        <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-accent-gradient text-primary-foreground">
            <a href="#contact">{t("ctaPrimary")}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#work">{t("ctaSecondary")}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
