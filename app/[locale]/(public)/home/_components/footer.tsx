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
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-current text-primary/70 transition-colors group-hover:text-primary"
                    >
                      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
                    </svg>
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
