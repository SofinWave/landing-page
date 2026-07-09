import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <div>
          <div className="font-semibold">{t("brand")}</div>
          <div className="text-sm text-muted-foreground">{t("tagline")}</div>
          <div className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
            {t("status")}
          </div>
        </div>
        <a
          href={`mailto:${t("email")}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("email")}
        </a>
        <div className="text-sm text-muted-foreground">
          © 2026 {t("brand")}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
