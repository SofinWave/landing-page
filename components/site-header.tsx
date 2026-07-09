"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-togger";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#services", label: t("services") },
    { href: "#process", label: t("process") },
    { href: "#work", label: t("work") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#top" aria-label={t("brand")}>
          <Logo label={t("brand")} priority />
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild>
            <a href="#contact">{t("cta")}</a>
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
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Button asChild className="w-full">
                <a href="#contact" onClick={() => setOpen(false)}>
                  {t("cta")}
                </a>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
