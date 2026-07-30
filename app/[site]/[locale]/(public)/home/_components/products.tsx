import { useTranslations } from "next-intl";
import { ArrowUpRight, Sparkles, Wallet } from "lucide-react";
import { Section } from "@/components/section";
import { HudCard } from "@/components/hud-card";
import { Reveal } from "@/components/reveal";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type Product = {
  key: string;
  name: string;
  blurb: string;
  price: string;
  languages: string;
  features: string[];
  href: string;
  host: string;
};

/**
 * Icons are keyed by the catalog's untranslated `key`, not by product name —
 * the name is copy and differs per locale.
 */
const ICONS: Record<string, typeof Wallet> = {
  smartfintrack: Wallet,
  tuvidauso: Sparkles,
};

/**
 * SofinWave's own products, on the tech landing page.
 *
 * Sits next to Case Studies on purpose: work delivered for clients, then
 * software we run ourselves. Every feature is plain markup — the answer-engine
 * crawlers do not execute JavaScript, so nothing here may depend on hydration.
 */
export function Products() {
  const t = useTranslations("products");
  const items = t.raw("items") as Product[];

  return (
    <Section id="products" index={4} label="Products">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("heading")}</h2>
        <p className="mt-3 text-muted-foreground">{t("lede")}</p>
      </div>
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-2">
          {items.map((product) => {
            const Icon = ICONS[product.key];
            return (
              <a key={product.key} href={product.href} className="group block h-full">
                <HudCard className="flex h-full flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {Icon ? <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" /> : null}
                      <CardTitle className="flex items-center gap-1.5 text-2xl">
                        {product.name}
                        <ArrowUpRight
                          aria-hidden
                          className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
                        />
                      </CardTitle>
                    </div>
                    <p className="pt-2 font-mono text-xs tracking-wider text-muted-foreground">
                      {product.price} · {product.languages}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="leading-relaxed text-muted-foreground">{product.blurb}</p>
                    <ul className="space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-sm text-muted-foreground">
                          <span
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                            aria-hidden
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto border-t border-border pt-4 font-mono text-xs text-muted-foreground/80">
                      {product.host}
                    </span>
                  </CardContent>
                </HudCard>
              </a>
            );
          })}
        </div>
      </Reveal>
      <div className="mt-10 text-center">
        <Link
          href="/products"
          className="font-mono text-sm text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
        >
          {t("ctaLabel")}
        </Link>
      </div>
    </Section>
  );
}
