"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-togger";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";

/**
 * Real routes rather than home-page anchors: these links have to resolve from
 * every page, and they are how crawlers reach the service and pillar pages.
 */
const NAV = [
  { href: "/services", key: "services" },
  { href: "/vietnam-software-outsourcing", key: "vietnamSoftwareOutsourcing" },
  { href: "/engagement-models", key: "engagementModels" },
  { href: "/about", key: "about" },
] as const;

export function SiteHeader() {
  const t = useTranslations("header");
  const tPages = useTranslations("pages");
  const [open, setOpen] = useState(false);

  const links = NAV.map((item) => ({ href: item.href, label: tPages(`${item.key}.navLabel`) }));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/home" aria-label={t("brand")}>
          <Logo label={t("brand")} priority />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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

        <div className="hidden items-center gap-2 md:flex">
          <span className="mr-2 hidden items-center gap-2 font-mono text-xs text-muted-foreground lg:inline-flex">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
            {t("status")}
          </span>
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild>
            <Link href="/contact">{t("cta")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
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
        <nav className="border-t border-border md:hidden">
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
