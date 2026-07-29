import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Clapperboard, GraduationCap, LineChart } from "lucide-react";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { SiteId } from "@/enums";
import { HOME_PATH } from "@/lib/routes";
import { pageUrl } from "@/lib/site";
import { siblingSites } from "@/lib/sites";

const ICONS: Record<string, typeof Clapperboard> = {
  [SiteId.Media]: Clapperboard,
  [SiteId.Finance]: LineChart,
  [SiteId.Academy]: GraduationCap,
};

/**
 * The other three verticals, linked from the tech landing page.
 *
 * Only this site's home is a bespoke composition, so the section lives here
 * rather than in the content shell. The footer carries the same links on every
 * page of every site; this is the version a visitor actually reads.
 */
export function Ecosystem() {
  const t = useTranslations("ecosystem");
  const locale = useLocale();
  const siblings = siblingSites(SiteId.Tech);

  return (
    <Section index={8} label="Ecosystem">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("heading")}</h2>
        <p className="mt-3 text-muted-foreground">{t("lede")}</p>
      </div>
      <Reveal>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {siblings.map((sibling) => {
            const Icon = ICONS[sibling.id];
            return (
              <a
                key={sibling.id}
                href={pageUrl(locale, HOME_PATH, sibling.id)}
                className="hud-corners group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  {Icon ? <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" /> : null}
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {t(`sites.${sibling.id}.role`)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 font-semibold">
                  {sibling.name}
                  <ArrowUpRight
                    aria-hidden
                    className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`sites.${sibling.id}.blurb`)}
                </p>
                <span className="mt-4 font-mono text-xs text-muted-foreground/80">
                  {sibling.host}
                </span>
              </a>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}
