import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { GridBackdrop } from "@/components/backgrounds/grid-backdrop";
import { Link } from "@/i18n/navigation";
import type { SiteId } from "@/enums";
import { DEFAULT_SITE, siblingSites, siteConfig } from "@/lib/sites";
import { HOME_PATH } from "@/lib/routes";
import { SITE_SAME_AS, pageUrl } from "@/lib/site";

/**
 * Site-wide footer. Its columns are real internal links rather than home-page
 * anchors, so every page passes link equity down to the service and pillar
 * pages — the site previously had no internal links at all.
 */
export function SiteFooter({ site = DEFAULT_SITE.id }: { site?: SiteId }) {
  const config = siteConfig(site);
  const t = useTranslations("footer");
  const tEcosystem = useTranslations("ecosystem");
  const tPages = useTranslations(config.contentNamespace);
  const locale = useLocale();
  const github = SITE_SAME_AS[0];
  const siblings = siblingSites(site);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/20">
      <GridBackdrop className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent-gradient opacity-60"
      />
      <div className="container relative mx-auto px-4 py-14">
        <div
          className={
            config.footerServices.length > 0
              ? "grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]"
              : "grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]"
          }
        >
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-gradient">{config.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
            <div className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
              </span>
              {t("status")}
            </div>
          </div>

          {/* Services */}
          {config.footerServices.length > 0 ? (
            <nav aria-label={t("servicesNav")}>
              <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {`// ${t("servicesNav")}`}
              </div>
              <ul className="space-y-2.5">
                {config.footerServices.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {tPages(`${item.key}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {/* Company */}
          <nav aria-label={t("navigate")}>
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {`// ${t("navigate")}`}
            </div>
            <ul className="space-y-2.5">
              {config.footerCompany.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {tPages(`${item.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Ecosystem — the sibling verticals. Plain anchors: these point at a
              different hostname, which the locale-aware Link does not handle. */}
          <nav aria-label={tEcosystem("navLabel")}>
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {`// ${tEcosystem("navLabel")}`}
            </div>
            <ul className="space-y-2.5">
              {siblings.map((sibling) => (
                <li key={sibling.id}>
                  <a
                    href={pageUrl(locale, HOME_PATH, sibling.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {sibling.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {`// ${t("connect")}`}
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${t("email")}`}
                  className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail
                    aria-hidden
                    className="h-4 w-4 text-primary/70 transition-colors group-hover:text-primary"
                  />
                  {t("email")}
                </a>
              </li>
              {github ? (
                <li>
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span
                      aria-hidden
                      className="mask-icon h-4 w-4 text-primary/70 transition-colors group-hover:text-primary [mask-image:url(/icons/github.svg)] [-webkit-mask-image:url(/icons/github.svg)]"
                    />
                    GitHub
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/60 pt-6 font-mono text-xs text-muted-foreground">
          <span>
            © 2026 {config.name}. {t("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
