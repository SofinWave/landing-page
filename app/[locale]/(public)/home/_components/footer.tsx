import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { GridBackdrop } from "@/components/backgrounds/grid-backdrop";
import { SITE_SAME_AS } from "@/lib/site";

const NAV = [
  { href: "#services", key: "services" },
  { href: "#process", key: "process" },
  { href: "#work", key: "work" },
  { href: "#contact", key: "contact" },
] as const;

export function SiteFooter() {
  const t = useTranslations("footer");
  const tHeader = useTranslations("header");
  const github = SITE_SAME_AS[0];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/20">
      <GridBackdrop className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent-gradient opacity-60"
      />
      <div className="container relative mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-gradient">{t("brand")}</span>
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

          {/* Navigate */}
          <nav>
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {`// ${t("navigate")}`}
            </div>
            <ul className="space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {tHeader(item.key)}
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
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 font-mono text-xs text-muted-foreground sm:flex-row">
          <span>
            © 2026 {t("brand")}. {t("rights")}
          </span>
          <span className="inline-flex items-center gap-2 text-muted-foreground/70">
            <span className="text-primary">{"</>"}</span>
            {t("builtWith")}
          </span>
        </div>
      </div>
    </footer>
  );
}
