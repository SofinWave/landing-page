"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-togger";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import type { SiteId } from "@/enums";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";

/**
 * Navigation comes from the site registry rather than home-page anchors: these
 * links have to resolve from every page, and they are how crawlers reach the
 * service and pillar pages.
 */
export function SiteHeader({ site = DEFAULT_SITE.id }: { site?: SiteId }) {
  const config = siteConfig(site);
  const t = useTranslations("header");
  const tPages = useTranslations(config.contentNamespace);
  const [open, setOpen] = useState(false);

  const links = config.nav.map((item) => ({
    href: item.href,
    label: tPages(`${item.key}.navLabel`),
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/home" aria-label={config.name}>
          <Logo label={config.name} priority />
        </Link>

        {/*
         * Desktop chrome starts at lg, not md. The wordmark (~186px), five nav
         * labels, and the right-hand cluster need ~970px; md only offers 736,
         * which made the nav labels wrap inside a 64px-tall header. The status
         * pill waits until xl for the same reason — it costs another ~150px.
         */}
        <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="mr-2 hidden items-center gap-2 font-mono text-xs text-muted-foreground xl:inline-flex">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
            {t("status")}
          </span>
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild>
            <Link href="/contact">{t("cta")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border lg:hidden">
          <ul className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button asChild className="w-full">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  {t("cta")}
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
