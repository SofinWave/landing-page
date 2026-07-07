# kingnnt.org Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, bilingual (EN/VI) credibility-focused landing page for kingnnt.org (software system consulting & implementation services).

**Architecture:** Next.js 15 App Router with all routes under `app/[locale]`. `next-intl` provides bilingual content; section components use `useTranslations` and render synchronously as Server Components. Interactive pieces (language switch, mobile nav, FAQ accordion, contact form) are Client Components. All copy + asset paths live in `messages/en.json` and `messages/vi.json`. Colors use existing shadcn design tokens (light/dark aware); gradients are added as utility classes.

**Tech Stack:** Next.js 15, React 19, Tailwind v4, shadcn/ui (new-york), next-intl, next-themes, lucide-react, zod (form validation), vitest + @testing-library/react (tests).

## Global Constraints

- Package manager: **yarn** (repo uses `yarn.lock` + corepack + husky). Run `yarn install` before first commit so the lockfile syncs and the husky pre-commit hook passes.
- Supported locales: `en`, `vi`. Default locale: `en`. Locale enum: `LocaleSupport` in `enums/locale.enum.ts` (`EN = "en"`, `VI = "vi"`).
- Commit convention: Conventional Commits. **NEVER** add `Co-Authored-By` or author-attribution lines.
- Colors: use shadcn tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `text-primary`, etc.). **No hardcoded** `gray-*` / hex colors in components. Must render correctly in both light and dark themes.
- Every user-facing string comes from `messages/{locale}.json` via next-intl — no literal copy in JSX.
- Headings: exactly one `<h1>` (Hero); `<h2>` per section; `<h3>` for sub-items.
- All sections composed by `app/[locale]/(public)/home/page.tsx`.
- Section components live in `app/[locale]/(public)/home/_components/`.

---

## File Structure

**Created:**
- `vitest.config.mts`, `vitest.setup.ts` — test infra
- `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts` — next-intl config
- `messages/en.json`, `messages/vi.json` — translations + content
- `app/[locale]/layout.tsx` — root layout (html/body, providers, metadata)
- `components/language-switcher.tsx` — client, locale switch
- `components/site-header.tsx` — sticky nav (+ mobile)
- `components/ui/accordion.tsx`, `components/ui/textarea.tsx`, `components/ui/label.tsx` — shadcn primitives
- `app/[locale]/(public)/home/_components/{hero,logo-strip,services,process,case-studies,tech-stack,testimonials,team,faq,contact,footer}.tsx`
- `app/[locale]/(public)/home/_components/contact-form.tsx` — client form
- `app/actions/contact.ts` — server action + zod schema
- `tests/**` — test files mirroring the above

**Modified:**
- `next.config.ts` — wrap with `createNextIntlPlugin`
- `middleware.ts` — replace custom redirect with next-intl middleware
- `app/[locale]/(public)/home/page.tsx` — compose sections
- `app/globals.css` — gradient utilities
- `package.json` — deps + `test` scripts

**Deleted:**
- `app/layout.tsx` — replaced by `app/[locale]/layout.tsx` (root layout moves under `[locale]`)

---

## Task 1: Test infrastructure (vitest + Testing Library)

**Files:**
- Create: `vitest.config.mts`, `vitest.setup.ts`, `tests/smoke.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `yarn test` runs vitest once; `describe/it/expect` + jsdom + `@testing-library/jest-dom` matchers available in all later test files.

- [ ] **Step 1: Sync lockfile + install dev deps**

```bash
yarn install
yarn add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test scripts to `package.json`** (in `"scripts"`)

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.mts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

- [ ] **Step 5: Write smoke test `tests/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run and verify pass**

Run: `yarn test`
Expected: PASS (1 passed).

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock vitest.config.mts vitest.setup.ts tests/smoke.test.ts
git commit -m "test: set up vitest and testing-library"
```

---

## Task 2: Install and configure next-intl

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`
- Modify: `next.config.ts`, `middleware.ts`, `package.json`
- Test: `tests/i18n/routing.test.ts`

**Interfaces:**
- Produces:
  - `routing` (from `i18n/routing.ts`): `{ locales: ["en","vi"], defaultLocale: "en" }`
  - `i18n/navigation.ts` exports typed `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`
  - `i18n/request.ts` default export: `getRequestConfig` loading `messages/{locale}.json`
  - Middleware handles locale prefixing for all non-asset routes.

- [ ] **Step 1: Install next-intl**

```bash
yarn add next-intl
```

- [ ] **Step 2: Create `i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";
import { LocaleSupport } from "@/enums";

export const routing = defineRouting({
  locales: [LocaleSupport.EN, LocaleSupport.VI],
  defaultLocale: LocaleSupport.EN,
  localePrefix: "always",
});
```

- [ ] **Step 3: Create `i18n/navigation.ts`**

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 4: Create `i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 5: Replace `middleware.ts` with next-intl middleware**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
```

- [ ] **Step 6: Wrap `next.config.ts` with the plugin**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

Note: if `next.config.ts` already has config keys, keep them inside `nextConfig` and only wrap the export.

- [ ] **Step 7: Write test `tests/i18n/routing.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";

describe("i18n routing", () => {
  it("supports en and vi with en default", () => {
    expect(routing.locales).toEqual(["en", "vi"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
```

- [ ] **Step 8: Run and verify pass**

Run: `yarn test tests/i18n/routing.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add i18n next.config.ts middleware.ts package.json yarn.lock tests/i18n
git commit -m "feat(i18n): configure next-intl routing and middleware"
```

---

## Task 3: Localized root layout, metadata, and message scaffold

**Files:**
- Create: `app/[locale]/layout.tsx`, `messages/en.json`, `messages/vi.json`
- Delete: `app/layout.tsx`
- Test: `tests/messages/parity.test.ts`

**Interfaces:**
- Consumes: `routing` (Task 2), `ThemeProvider` (`@/components/theme-provider`).
- Produces: `app/[locale]/layout.tsx` renders `<html lang={locale}>`, wraps children in `NextIntlClientProvider` + `ThemeProvider`, exports `generateMetadata` and `generateStaticParams`. Message files contain a top-level `metadata` namespace: `{ title, description }`.

- [ ] **Step 1: Create `messages/en.json`** (scaffold; sections added in later tasks)

```json
{
  "metadata": {
    "title": "kingnnt.org — Software Consulting & Implementation",
    "description": "kingnnt.org helps businesses design and implement reliable software systems — from architecture consulting to full delivery."
  }
}
```

- [ ] **Step 2: Create `messages/vi.json`**

```json
{
  "metadata": {
    "title": "kingnnt.org — Tư vấn & Triển khai Hệ thống Phần mềm",
    "description": "kingnnt.org đồng hành cùng doanh nghiệp thiết kế và triển khai hệ thống phần mềm đáng tin cậy — từ tư vấn kiến trúc đến bàn giao trọn gói."
  }
}
```

- [ ] **Step 3: Delete `app/layout.tsx`**

```bash
git rm app/layout.tsx
```

- [ ] **Step 4: Create `app/[locale]/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Write locale-parity test `tests/messages/parity.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe("message catalogs", () => {
  it("en and vi have identical key structure", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(vi).sort());
  });
});
```

- [ ] **Step 6: Run and verify pass**

Run: `yarn test tests/messages/parity.test.ts`
Expected: PASS.

- [ ] **Step 7: Verify build/dev boots**

Run: `yarn dev` then open `http://localhost:3000` → should redirect to `/en/home` (existing placeholder still renders). Stop the server.

- [ ] **Step 8: Commit**

```bash
git add app/[locale]/layout.tsx messages tests/messages
git rm app/layout.tsx
git commit -m "feat(i18n): localized root layout and metadata"
```

---

## Task 4: Gradient utilities + shared Section wrapper

**Files:**
- Modify: `app/globals.css`
- Create: `components/section.tsx`
- Test: `tests/components/section.test.tsx`

**Interfaces:**
- Produces:
  - CSS utility classes: `.text-gradient` (gradient clipped to text), `.bg-hero-gradient` (subtle radial hero background, theme-aware).
  - `Section` component: `function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }): JSX.Element` — renders `<section id className="... container mx-auto px-4 py-16 md:py-24">`.

- [ ] **Step 1: Append utilities to `app/globals.css`** (after the existing `@layer base { ... }` block)

```css
@layer utilities {
  .text-gradient {
    background-image: linear-gradient(
      90deg,
      var(--chart-1),
      var(--chart-4)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .bg-hero-gradient {
    background:
      radial-gradient(60% 60% at 50% 0%, color-mix(in oklch, var(--chart-1) 18%, transparent), transparent),
      radial-gradient(50% 50% at 100% 20%, color-mix(in oklch, var(--chart-4) 14%, transparent), transparent);
  }
}
```

- [ ] **Step 2: Create `components/section.tsx`**

```tsx
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("container mx-auto px-4 py-16 md:py-24", className)}>
      {children}
    </section>
  );
}
```

- [ ] **Step 3: Write test `tests/components/section.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "@/components/section";

describe("Section", () => {
  it("renders children and applies id", () => {
    render(
      <Section id="about">
        <p>hello</p>
      </Section>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(document.getElementById("about")).not.toBeNull();
  });
});
```

- [ ] **Step 4: Run and verify pass**

Run: `yarn test tests/components/section.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/section.tsx tests/components/section.test.tsx
git commit -m "feat(ui): add gradient utilities and Section wrapper"
```

---

## Task 5: Language switcher (client)

**Files:**
- Create: `components/language-switcher.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/components/language-switcher.test.tsx`

**Interfaces:**
- Consumes: `usePathname`, `useRouter` from `@/i18n/navigation`; `useLocale` from `next-intl`; `Button`, `DropdownMenu*` from shadcn.
- Produces: `LanguageSwitcher()` client component that switches the active locale while preserving the current pathname.

- [ ] **Step 1: Add `nav` keys to `messages/en.json`** (top level)

```json
"nav": {
  "language": "Language",
  "english": "English",
  "vietnamese": "Tiếng Việt"
}
```

- [ ] **Step 2: Add `nav` keys to `messages/vi.json`**

```json
"nav": {
  "language": "Ngôn ngữ",
  "english": "English",
  "vietnamese": "Tiếng Việt"
}
```

- [ ] **Step 3: Create `components/language-switcher.tsx`**

```tsx
"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const labels: Record<string, string> = {
    en: t("english"),
    vi: t("vietnamese"),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("language")}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            disabled={loc === locale}
            onClick={() => router.replace(pathname, { locale: loc })}
          >
            {labels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 4: Write test `tests/components/language-switcher.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace }),
}));

import { LanguageSwitcher } from "@/components/language-switcher";

describe("LanguageSwitcher", () => {
  it("switches locale to vi preserving pathname", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /language/i }));
    await userEvent.click(screen.getByText("Tiếng Việt"));
    expect(replace).toHaveBeenCalledWith("/home", { locale: "vi" });
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/components/language-switcher.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/language-switcher.tsx messages tests/components/language-switcher.test.tsx
git commit -m "feat(nav): add language switcher"
```

---

## Task 6: Site header / sticky nav (with mobile menu)

**Files:**
- Create: `components/site-header.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/components/site-header.test.tsx`

**Interfaces:**
- Consumes: `LanguageSwitcher`, `ModeToggle` (`@/components/mode-togger`), `Button`, `Link` (`@/i18n/navigation`), `useTranslations`.
- Produces: `SiteHeader()` client component — sticky top bar with brand, anchor links (`#services`, `#work`, `#contact`), language switch, theme toggle, primary CTA, and a mobile hamburger toggling a nav panel.

- [ ] **Step 1: Add `header` keys to `messages/en.json`**

```json
"header": {
  "brand": "kingnnt.org",
  "services": "Services",
  "process": "Process",
  "work": "Case studies",
  "contact": "Contact",
  "cta": "Book a consultation",
  "openMenu": "Open menu",
  "closeMenu": "Close menu"
}
```

- [ ] **Step 2: Add `header` keys to `messages/vi.json`**

```json
"header": {
  "brand": "kingnnt.org",
  "services": "Dịch vụ",
  "process": "Quy trình",
  "work": "Dự án",
  "contact": "Liên hệ",
  "cta": "Đặt lịch tư vấn",
  "openMenu": "Mở menu",
  "closeMenu": "Đóng menu"
}
```

- [ ] **Step 3: Create `components/site-header.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-togger";
import { LanguageSwitcher } from "@/components/language-switcher";

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
        <a href="#top" className="text-lg font-semibold">
          {t("brand")}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
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
```

- [ ] **Step 4: Write test `tests/components/site-header.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace: () => {} }),
}));

import { vi } from "vitest";
import { SiteHeader } from "@/components/site-header";

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SiteHeader />
    </NextIntlClientProvider>,
  );
}

describe("SiteHeader", () => {
  it("renders nav links and CTA", () => {
    renderHeader();
    expect(screen.getAllByText("Case studies").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Book a consultation").length).toBeGreaterThan(0);
  });

  it("toggles the mobile menu", async () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: /open menu/i });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });
});
```

Note: hoist the `vi` import above the mock if the runner complains — place `import { vi } from "vitest";` at the top of the file.

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/components/site-header.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/site-header.tsx messages tests/components/site-header.test.tsx
git commit -m "feat(nav): add sticky site header with mobile menu"
```

---

## Task 7: Hero section

This task establishes the **section pattern** used by Tasks 8–14 and 17: a Server Component using `useTranslations("<namespace>")`, colors from tokens, tested by rendering inside `NextIntlClientProvider` with `en` messages.

**Files:**
- Create: `app/[locale]/(public)/home/_components/hero.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/hero.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Button`, `useTranslations`.
- Produces: `Hero()` — the page's single `<h1>`, subheadline, primary + secondary CTA.

- [ ] **Step 1: Add `hero` to `messages/en.json`**

```json
"hero": {
  "eyebrow": "Software consulting & implementation",
  "title": "We ship the systems your business runs on",
  "subtitle": "kingnnt.org partners with you from architecture to delivery — designing, building, and operating reliable software systems that scale.",
  "ctaPrimary": "Book a consultation",
  "ctaSecondary": "View case studies"
}
```

- [ ] **Step 2: Add `hero` to `messages/vi.json`**

```json
"hero": {
  "eyebrow": "Tư vấn & triển khai phần mềm",
  "title": "Xây dựng hệ thống doanh nghiệp bạn vận hành mỗi ngày",
  "subtitle": "kingnnt.org đồng hành từ kiến trúc đến bàn giao — thiết kế, xây dựng và vận hành hệ thống phần mềm đáng tin cậy, sẵn sàng mở rộng.",
  "ctaPrimary": "Đặt lịch tư vấn",
  "ctaSecondary": "Xem dự án"
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/hero.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <div id="top" className="bg-hero-gradient">
      <div className="container mx-auto px-4 py-24 text-center md:py-32">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
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
```

- [ ] **Step 4: Write test `tests/sections/hero.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Hero } from "@/app/[locale]/(public)/home/_components/hero";

describe("Hero", () => {
  it("renders the single h1 and both CTAs", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "We ship the systems your business runs on",
    );
    expect(screen.getByText("Book a consultation")).toBeInTheDocument();
    expect(screen.getByText("View case studies")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/hero.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/hero.tsx messages tests/sections/hero.test.tsx
git commit -m "feat(home): add hero section"
```

---

## Task 8: Client logo strip

**Files:**
- Create: `app/[locale]/(public)/home/_components/logo-strip.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/logo-strip.test.tsx`

**Interfaces:**
- Consumes: `useTranslations`. Reads `t.raw("items")` → `string[]` of client names (text placeholder for real logos).
- Produces: `LogoStrip()` — a horizontal band of client names/logos directly below the hero.

- [ ] **Step 1: Add `logos` to `messages/en.json`**

```json
"logos": {
  "title": "Trusted by teams building serious software",
  "items": ["Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Stark Industries"]
}
```

- [ ] **Step 2: Add `logos` to `messages/vi.json`** (same brand names; translate title)

```json
"logos": {
  "title": "Được tin dùng bởi các đội xây dựng phần mềm nghiêm túc",
  "items": ["Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Stark Industries"]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/logo-strip.tsx`**

```tsx
import { useTranslations } from "next-intl";

export function LogoStrip() {
  const t = useTranslations("logos");
  const items = t.raw("items") as string[];
  return (
    <div className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <p className="mb-6 text-center text-sm text-muted-foreground">{t("title")}</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((name) => (
            <li key={name} className="text-lg font-semibold text-muted-foreground/80">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/logo-strip.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { LogoStrip } from "@/app/[locale]/(public)/home/_components/logo-strip";

describe("LogoStrip", () => {
  it("renders all client names", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LogoStrip />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Stark Industries")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/logo-strip.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/logo-strip.tsx messages tests/sections/logo-strip.test.tsx
git commit -m "feat(home): add client logo strip"
```

---

## Task 9: Services section

**Files:**
- Create: `app/[locale]/(public)/home/_components/services.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/services.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Card*` (`@/components/ui/card`), lucide icons, `useTranslations`.
- Produces: `Services()` — a `#services` section with a heading and a grid of service cards. Each item shape in messages: `{ icon: string; title: string; description: string }` where `icon` is a lucide key mapped locally.

- [ ] **Step 1: Add `services` to `messages/en.json`**

```json
"services": {
  "title": "What we do",
  "subtitle": "End-to-end capability across the software delivery lifecycle.",
  "items": [
    { "icon": "compass", "title": "Architecture consulting", "description": "System design, tech due diligence, and roadmaps that de-risk delivery." },
    { "icon": "server", "title": "System implementation", "description": "We stand up the platforms, services, and infrastructure your product runs on." },
    { "icon": "code", "title": "Custom software development", "description": "Web, mobile, and backend engineering tailored to your business rules." },
    { "icon": "plug", "title": "Integration", "description": "Connect ERPs, payment, and third-party systems into one reliable flow." },
    { "icon": "gauge", "title": "Performance & scale", "description": "Profiling, optimization, and re-architecture for growing workloads." },
    { "icon": "shield", "title": "Maintenance & operations", "description": "Monitoring, support, and continuous improvement after go-live." }
  ]
}
```

- [ ] **Step 2: Add `services` to `messages/vi.json`**

```json
"services": {
  "title": "Chúng tôi làm gì",
  "subtitle": "Năng lực trọn vòng đời phát triển phần mềm.",
  "items": [
    { "icon": "compass", "title": "Tư vấn kiến trúc", "description": "Thiết kế hệ thống, thẩm định công nghệ và lộ trình giảm rủi ro triển khai." },
    { "icon": "server", "title": "Triển khai hệ thống", "description": "Dựng nền tảng, dịch vụ và hạ tầng cho sản phẩm của bạn vận hành." },
    { "icon": "code", "title": "Phát triển phần mềm", "description": "Web, mobile và backend theo đúng nghiệp vụ doanh nghiệp." },
    { "icon": "plug", "title": "Tích hợp hệ thống", "description": "Kết nối ERP, thanh toán và hệ thống bên thứ ba thành một luồng tin cậy." },
    { "icon": "gauge", "title": "Hiệu năng & mở rộng", "description": "Đo lường, tối ưu và tái kiến trúc cho tải tăng trưởng." },
    { "icon": "shield", "title": "Bảo trì & vận hành", "description": "Giám sát, hỗ trợ và cải tiến liên tục sau khi go-live." }
  ]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/services.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Compass, Server, Code, Plug, Gauge, Shield, type LucideIcon } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  server: Server,
  code: Code,
  plug: Plug,
  gauge: Gauge,
  shield: Shield,
};

type ServiceItem = { icon: string; title: string; description: string };

export function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as ServiceItem[];
  return (
    <Section id="services">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? Compass;
          return (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{item.description}</CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/services.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Services } from "@/app/[locale]/(public)/home/_components/services";

describe("Services", () => {
  it("renders heading and all service cards", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Services />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "What we do" })).toBeInTheDocument();
    expect(screen.getByText("Architecture consulting")).toBeInTheDocument();
    expect(screen.getByText("Maintenance & operations")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/services.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/services.tsx messages tests/sections/services.test.tsx
git commit -m "feat(home): add services section"
```

---

## Task 10: Implementation process section

**Files:**
- Create: `app/[locale]/(public)/home/_components/process.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/process.test.tsx`

**Interfaces:**
- Consumes: `Section`, `useTranslations`. Item shape: `{ title: string; description: string }`; step numbers derived from array index.
- Produces: `Process()` — a `#process` section rendering an ordered list of numbered steps.

- [ ] **Step 1: Add `process` to `messages/en.json`**

```json
"process": {
  "title": "How we deliver",
  "subtitle": "A methodical path from idea to a system in production.",
  "steps": [
    { "title": "Discovery", "description": "We map goals, constraints, and success metrics before writing code." },
    { "title": "Design", "description": "Architecture, interfaces, and a delivery plan you can review and approve." },
    { "title": "Build", "description": "Iterative development with tests, demos, and frequent checkpoints." },
    { "title": "Deploy", "description": "Automated, repeatable releases into your environment." },
    { "title": "Operate", "description": "Monitoring, support, and continuous improvement after launch." }
  ]
}
```

- [ ] **Step 2: Add `process` to `messages/vi.json`**

```json
"process": {
  "title": "Cách chúng tôi triển khai",
  "subtitle": "Lộ trình bài bản từ ý tưởng đến hệ thống chạy thật.",
  "steps": [
    { "title": "Khảo sát", "description": "Xác định mục tiêu, ràng buộc và tiêu chí thành công trước khi viết code." },
    { "title": "Thiết kế", "description": "Kiến trúc, giao diện và kế hoạch triển khai để bạn duyệt." },
    { "title": "Xây dựng", "description": "Phát triển lặp với kiểm thử, demo và checkpoint thường xuyên." },
    { "title": "Triển khai", "description": "Phát hành tự động, lặp lại được vào môi trường của bạn." },
    { "title": "Vận hành", "description": "Giám sát, hỗ trợ và cải tiến liên tục sau khi ra mắt." }
  ]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/process.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

type Step = { title: string; description: string };

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];
  return (
    <Section id="process" className="bg-muted/30">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ol className="grid gap-6 md:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {i + 1}
            </div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/process.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Process } from "@/app/[locale]/(public)/home/_components/process";

describe("Process", () => {
  it("renders all five steps in order", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Process />
      </NextIntlClientProvider>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("Discovery");
    expect(items[4]).toHaveTextContent("Operate");
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/process.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/process.tsx messages tests/sections/process.test.tsx
git commit -m "feat(home): add implementation process section"
```

---

## Task 11: Case studies section (centerpiece)

**Files:**
- Create: `app/[locale]/(public)/home/_components/case-studies.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/case-studies.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Card*`, `useTranslations`. Item shape: `{ client: string; problem: string; solution: string; results: { label: string; value: string }[]; tags: string[] }`.
- Produces: `CaseStudies()` — a `#work` section, each case rendered as Problem → Solution → Result metrics + tags.

- [ ] **Step 1: Add `caseStudies` to `messages/en.json`**

```json
"caseStudies": {
  "title": "Selected work",
  "subtitle": "Real systems, real outcomes.",
  "problemLabel": "Problem",
  "solutionLabel": "Solution",
  "items": [
    {
      "client": "Acme Corp",
      "problem": "A legacy monolith couldn't handle seasonal traffic and releases took weeks.",
      "solution": "We re-architected to modular services with automated CI/CD and observability.",
      "results": [
        { "label": "Deploy time", "value": "-95%" },
        { "label": "Peak capacity", "value": "8x" },
        { "label": "Incidents", "value": "-60%" }
      ],
      "tags": ["Architecture", "DevOps", "Node.js"]
    },
    {
      "client": "Globex",
      "problem": "Disconnected tools meant manual data entry and reporting delays.",
      "solution": "We built an integration layer unifying ERP, CRM, and payments in real time.",
      "results": [
        { "label": "Manual work", "value": "-80%" },
        { "label": "Report latency", "value": "Real-time" },
        { "label": "Go-live", "value": "10 weeks" }
      ],
      "tags": ["Integration", "TypeScript", "PostgreSQL"]
    }
  ]
}
```

- [ ] **Step 2: Add `caseStudies` to `messages/vi.json`**

```json
"caseStudies": {
  "title": "Dự án tiêu biểu",
  "subtitle": "Hệ thống thật, kết quả thật.",
  "problemLabel": "Vấn đề",
  "solutionLabel": "Giải pháp",
  "items": [
    {
      "client": "Acme Corp",
      "problem": "Hệ thống monolith cũ không chịu nổi tải mùa cao điểm, mỗi lần phát hành mất hàng tuần.",
      "solution": "Tái kiến trúc thành các service module với CI/CD tự động và observability.",
      "results": [
        { "label": "Thời gian deploy", "value": "-95%" },
        { "label": "Sức chứa đỉnh", "value": "8x" },
        { "label": "Sự cố", "value": "-60%" }
      ],
      "tags": ["Kiến trúc", "DevOps", "Node.js"]
    },
    {
      "client": "Globex",
      "problem": "Các công cụ rời rạc khiến phải nhập liệu thủ công và báo cáo trễ.",
      "solution": "Xây lớp tích hợp hợp nhất ERP, CRM và thanh toán theo thời gian thực.",
      "results": [
        { "label": "Việc thủ công", "value": "-80%" },
        { "label": "Độ trễ báo cáo", "value": "Thời gian thực" },
        { "label": "Go-live", "value": "10 tuần" }
      ],
      "tags": ["Tích hợp", "TypeScript", "PostgreSQL"]
    }
  ]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/case-studies.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CaseStudy = {
  client: string;
  problem: string;
  solution: string;
  results: { label: string; value: string }[];
  tags: string[];
};

export function CaseStudies() {
  const t = useTranslations("caseStudies");
  const items = t.raw("items") as CaseStudy[];
  return (
    <Section id="work">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {items.map((c) => (
          <Card key={c.client} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{c.client}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                {c.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("problemLabel")}
                </p>
                <p className="mt-1">{c.problem}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("solutionLabel")}
                </p>
                <p className="mt-1">{c.solution}</p>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-4">
                {c.results.map((r) => (
                  <div key={r.label}>
                    <div className="text-2xl font-bold text-gradient">{r.value}</div>
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/case-studies.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { CaseStudies } from "@/app/[locale]/(public)/home/_components/case-studies";

describe("CaseStudies", () => {
  it("renders cases with problem, solution, and result metrics", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <CaseStudies />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getAllByText("Problem").length).toBeGreaterThan(0);
    expect(screen.getByText("8x")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/case-studies.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/case-studies.tsx messages tests/sections/case-studies.test.tsx
git commit -m "feat(home): add case studies section"
```

---

## Task 12: Technology & domains section

**Files:**
- Create: `app/[locale]/(public)/home/_components/tech-stack.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/tech-stack.test.tsx`

**Interfaces:**
- Consumes: `Section`, `useTranslations`. Reads `t.raw("technologies")` → `string[]` and `t.raw("domains")` → `string[]`.
- Produces: `TechStack()` — two labelled chip groups (technologies, domains).

- [ ] **Step 1: Add `tech` to `messages/en.json`**

```json
"tech": {
  "title": "Technology & domains",
  "subtitle": "Depth where it matters, pragmatic everywhere else.",
  "technologiesLabel": "Technologies",
  "domainsLabel": "Domains",
  "technologies": ["TypeScript", "Node.js", "React / Next.js", "Python", "Go", "PostgreSQL", "Kubernetes", "AWS"],
  "domains": ["Fintech", "E-commerce", "Logistics", "SaaS platforms", "Enterprise ERP"]
}
```

- [ ] **Step 2: Add `tech` to `messages/vi.json`**

```json
"tech": {
  "title": "Công nghệ & lĩnh vực",
  "subtitle": "Chuyên sâu ở nơi cần, thực dụng ở mọi nơi khác.",
  "technologiesLabel": "Công nghệ",
  "domainsLabel": "Lĩnh vực",
  "technologies": ["TypeScript", "Node.js", "React / Next.js", "Python", "Go", "PostgreSQL", "Kubernetes", "AWS"],
  "domains": ["Fintech", "Thương mại điện tử", "Logistics", "Nền tảng SaaS", "ERP doanh nghiệp"]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/tech-stack.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
          {item}
        </span>
      ))}
    </div>
  );
}

export function TechStack() {
  const t = useTranslations("tech");
  const technologies = t.raw("technologies") as string[];
  const domains = t.raw("domains") as string[];
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("technologiesLabel")}
          </h3>
          <Chips items={technologies} />
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("domainsLabel")}
          </h3>
          <Chips items={domains} />
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/tech-stack.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { TechStack } from "@/app/[locale]/(public)/home/_components/tech-stack";

describe("TechStack", () => {
  it("renders technologies and domains", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <TechStack />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Fintech")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/tech-stack.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/tech-stack.tsx messages tests/sections/tech-stack.test.tsx
git commit -m "feat(home): add technology and domains section"
```

---

## Task 13: Testimonials section

**Files:**
- Create: `app/[locale]/(public)/home/_components/testimonials.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/testimonials.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Card*`, `useTranslations`. Item shape: `{ quote: string; author: string; role: string; company: string }`.
- Produces: `Testimonials()` — a grid of quote cards.

- [ ] **Step 1: Add `testimonials` to `messages/en.json`**

```json
"testimonials": {
  "title": "What clients say",
  "items": [
    {
      "quote": "They understood our system faster than teams we'd worked with for years, and shipped ahead of schedule.",
      "author": "Jane Doe",
      "role": "CTO",
      "company": "Acme Corp"
    },
    {
      "quote": "Clear communication, disciplined delivery. The integration just worked on day one.",
      "author": "John Smith",
      "role": "Head of Engineering",
      "company": "Globex"
    }
  ]
}
```

- [ ] **Step 2: Add `testimonials` to `messages/vi.json`**

```json
"testimonials": {
  "title": "Khách hàng nói gì",
  "items": [
    {
      "quote": "Họ hiểu hệ thống của chúng tôi nhanh hơn cả những đội đã làm nhiều năm, và bàn giao sớm hơn kế hoạch.",
      "author": "Jane Doe",
      "role": "CTO",
      "company": "Acme Corp"
    },
    {
      "quote": "Giao tiếp rõ ràng, triển khai kỷ luật. Phần tích hợp chạy đúng ngay ngày đầu tiên.",
      "author": "John Smith",
      "role": "Head of Engineering",
      "company": "Globex"
    }
  ]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/testimonials.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = { quote: string; author: string; role: string; company: string };

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Testimonial[];
  return (
    <Section className="bg-muted/30">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.author}>
            <CardContent className="pt-6">
              <Quote className="mb-4 h-8 w-8 text-primary/40" />
              <blockquote className="text-lg">{item.quote}</blockquote>
              <footer className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{item.author}</span> — {item.role}, {item.company}
              </footer>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/testimonials.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Testimonials } from "@/app/[locale]/(public)/home/_components/testimonials";

describe("Testimonials", () => {
  it("renders quotes with attribution", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/shipped ahead of schedule/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/testimonials.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/testimonials.tsx messages tests/sections/testimonials.test.tsx
git commit -m "feat(home): add testimonials section"
```

---

## Task 14: Team / About section

**Files:**
- Create: `app/[locale]/(public)/home/_components/team.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/team.test.tsx`

**Interfaces:**
- Consumes: `Section`, `useTranslations`. Reads `about` (string) and `members` → `{ name: string; role: string }[]`.
- Produces: `Team()` — brief about paragraph + member grid with initials avatars.

- [ ] **Step 1: Add `team` to `messages/en.json`**

```json
"team": {
  "title": "Who we are",
  "about": "kingnnt.org is a focused team of senior engineers and consultants who have delivered production systems across fintech, e-commerce, and enterprise. We work as an extension of your team.",
  "members": [
    { "name": "King Nguyen", "role": "Principal Consultant" },
    { "name": "Team Member", "role": "Lead Engineer" },
    { "name": "Team Member", "role": "Solutions Architect" }
  ]
}
```

- [ ] **Step 2: Add `team` to `messages/vi.json`**

```json
"team": {
  "title": "Chúng tôi là ai",
  "about": "kingnnt.org là đội ngũ kỹ sư và chuyên gia tư vấn cấp cao đã bàn giao nhiều hệ thống production trong fintech, thương mại điện tử và doanh nghiệp. Chúng tôi làm việc như một phần trong đội của bạn.",
  "members": [
    { "name": "King Nguyen", "role": "Chuyên gia tư vấn chính" },
    { "name": "Thành viên", "role": "Kỹ sư trưởng" },
    { "name": "Thành viên", "role": "Kiến trúc sư giải pháp" }
  ]
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/team.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

type Member = { name: string; role: string };

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Team() {
  const t = useTranslations("team");
  const members = t.raw("members") as Member[];
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("about")}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {members.map((m, i) => (
          <div key={`${m.name}-${i}`} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              {initials(m.name)}
            </div>
            <div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/team.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Team } from "@/app/[locale]/(public)/home/_components/team";

describe("Team", () => {
  it("renders about text and members", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Team />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("King Nguyen")).toBeInTheDocument();
    expect(screen.getByText("Principal Consultant")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/team.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/team.tsx messages tests/sections/team.test.tsx
git commit -m "feat(home): add team section"
```

---

## Task 15: FAQ section (accordion)

**Files:**
- Create: `components/ui/accordion.tsx` (shadcn), `app/[locale]/(public)/home/_components/faq.tsx`
- Modify: `messages/en.json`, `messages/vi.json`, `package.json` (adds `@radix-ui/react-accordion`)
- Test: `tests/sections/faq.test.tsx`

**Interfaces:**
- Consumes: shadcn `Accordion*`, `Section`, `useTranslations`. Item shape: `{ question: string; answer: string }`.
- Produces: `Faq()` — a `#faq`-less section (linked via `#contact` region is separate) with an accordion of 3–5 Q&A.

- [ ] **Step 1: Add the shadcn accordion primitive**

```bash
npx shadcn@latest add accordion
```

If the CLI is unavailable, create `components/ui/accordion.tsx` manually from the shadcn "new-york" accordion source and run `yarn add @radix-ui/react-accordion`.

- [ ] **Step 2: Add `faq` to `messages/en.json`**

```json
"faq": {
  "title": "Frequently asked questions",
  "items": [
    { "question": "How do engagements start?", "answer": "With a short discovery call to understand your goals, followed by a written proposal and plan." },
    { "question": "Do you work with existing teams?", "answer": "Yes. We frequently embed with in-house teams and hand off cleanly with documentation." },
    { "question": "How is pricing structured?", "answer": "Fixed-scope for well-defined projects, or time-and-materials for evolving work. We agree it up front." },
    { "question": "What about security and IP?", "answer": "You own all code and IP. We follow least-privilege access and can sign an NDA before we start." }
  ]
}
```

- [ ] **Step 3: Add `faq` to `messages/vi.json`**

```json
"faq": {
  "title": "Câu hỏi thường gặp",
  "items": [
    { "question": "Hợp tác bắt đầu như thế nào?", "answer": "Bằng một buổi khảo sát ngắn để hiểu mục tiêu, sau đó là đề xuất và kế hoạch bằng văn bản." },
    { "question": "Có làm việc cùng đội hiện có không?", "answer": "Có. Chúng tôi thường phối hợp với đội nội bộ và bàn giao gọn gàng kèm tài liệu." },
    { "question": "Cách tính chi phí ra sao?", "answer": "Cố định theo phạm vi cho dự án rõ ràng, hoặc theo thời gian cho công việc thay đổi. Thống nhất trước khi bắt đầu." },
    { "question": "Bảo mật và sở hữu trí tuệ thì sao?", "answer": "Bạn sở hữu toàn bộ code và IP. Chúng tôi áp dụng quyền truy cập tối thiểu và có thể ký NDA trước." }
  ]
}
```

- [ ] **Step 4: Create `app/[locale]/(public)/home/_components/faq.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = { question: string; answer: string };

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];
  return (
    <Section className="max-w-3xl">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={item.question} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
```

- [ ] **Step 5: Write test `tests/sections/faq.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Faq } from "@/app/[locale]/(public)/home/_components/faq";

describe("Faq", () => {
  it("expands an answer when its question is clicked", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Faq />
      </NextIntlClientProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /How do engagements start/i }));
    expect(await screen.findByText(/short discovery call/i)).toBeVisible();
  });
});
```

- [ ] **Step 6: Run and verify pass**

Run: `yarn test tests/sections/faq.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ui/accordion.tsx app/[locale]/(public)/home/_components/faq.tsx messages package.json yarn.lock tests/sections/faq.test.tsx
git commit -m "feat(home): add FAQ accordion section"
```

---

## Task 16: Contact section (form + server action)

**Files:**
- Create: `app/actions/contact.ts`, `app/[locale]/(public)/home/_components/contact-form.tsx`, `app/[locale]/(public)/home/_components/contact.tsx`, `components/ui/textarea.tsx`, `components/ui/label.tsx`
- Modify: `messages/en.json`, `messages/vi.json`, `package.json` (adds `zod`)
- Test: `tests/actions/contact.test.ts`

**Interfaces:**
- Produces:
  - `contactSchema` (zod) + `type ContactInput` in `app/actions/contact.ts`.
  - `submitContact(data: ContactInput): Promise<{ ok: true } | { ok: false; error: string }>` — server action; validates with `contactSchema`; on success logs/forwards (stub) and returns `{ ok: true }`.
  - `ContactForm()` client component using the action.
  - `Contact()` server wrapper (`#contact` section) rendering heading + `ContactForm`.

- [ ] **Step 1: Install zod + shadcn primitives**

```bash
yarn add zod
npx shadcn@latest add textarea label
```

If the CLI is unavailable, create `components/ui/textarea.tsx` and `components/ui/label.tsx` from the shadcn "new-york" sources (label needs `@radix-ui/react-label` → `yarn add @radix-ui/react-label`).

- [ ] **Step 2: Create `app/actions/contact.ts`**

```ts
"use server";

import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message is too short"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export async function submitContact(
  data: ContactInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  // TODO(integration): forward to email/webhook provider (see spec §9).
  console.log("[contact] submission", parsed.data);
  return { ok: true };
}
```

- [ ] **Step 3: Write test `tests/actions/contact.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { contactSchema, submitContact } from "@/app/actions/contact";

describe("contact action", () => {
  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ name: "Ann", email: "nope", message: "hello there!" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid submission", async () => {
    const res = await submitContact({ name: "Ann", email: "a@b.com", message: "hello there friend" });
    expect(res.ok).toBe(true);
  });

  it("returns an error for short message via the action", async () => {
    const res = await submitContact({ name: "Ann", email: "a@b.com", message: "hi" });
    expect(res).toEqual({ ok: false, error: "Message is too short" });
  });
});
```

- [ ] **Step 4: Run and verify pass**

Run: `yarn test tests/actions/contact.test.ts`
Expected: PASS.

- [ ] **Step 5: Add `contact` to `messages/en.json`**

```json
"contact": {
  "title": "Let's talk about your system",
  "subtitle": "Tell us what you're building. We'll reply within one business day.",
  "name": "Name",
  "email": "Email",
  "message": "Message",
  "submit": "Send message",
  "sending": "Sending…",
  "success": "Thanks — we'll be in touch shortly.",
  "error": "Something went wrong. Please try again."
}
```

- [ ] **Step 6: Add `contact` to `messages/vi.json`**

```json
"contact": {
  "title": "Cùng trao đổi về hệ thống của bạn",
  "subtitle": "Hãy cho chúng tôi biết bạn đang xây gì. Chúng tôi phản hồi trong một ngày làm việc.",
  "name": "Họ tên",
  "email": "Email",
  "message": "Nội dung",
  "submit": "Gửi tin nhắn",
  "sending": "Đang gửi…",
  "success": "Cảm ơn bạn — chúng tôi sẽ liên hệ sớm.",
  "error": "Có lỗi xảy ra. Vui lòng thử lại."
}
```

- [ ] **Step 7: Create `app/[locale]/(public)/home/_components/contact-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitContact } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await submitContact({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    if (res.ok) {
      setStatus("success");
      e.currentTarget.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("submit")}
      </Button>
      {status === "success" && <p className="text-sm text-primary">{t("success")}</p>}
      {status === "error" && <p className="text-sm text-destructive">{t("error")}</p>}
    </form>
  );
}
```

- [ ] **Step 8: Create `app/[locale]/(public)/home/_components/contact.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { ContactForm } from "./contact-form";

export function Contact() {
  const t = useTranslations("contact");
  return (
    <Section id="contact" className="bg-hero-gradient">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ContactForm />
    </Section>
  );
}
```

- [ ] **Step 9: Verify existing tests still pass**

Run: `yarn test`
Expected: PASS (all suites).

- [ ] **Step 10: Commit**

```bash
git add app/actions/contact.ts app/[locale]/(public)/home/_components/contact.tsx app/[locale]/(public)/home/_components/contact-form.tsx components/ui/textarea.tsx components/ui/label.tsx messages package.json yarn.lock tests/actions/contact.test.ts
git commit -m "feat(home): add contact section with server action"
```

---

## Task 17: Footer

**Files:**
- Create: `app/[locale]/(public)/home/_components/footer.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/footer.test.tsx`

**Interfaces:**
- Consumes: `useTranslations`. Reads `brand`, `tagline`, `rights`, and `email`.
- Produces: `SiteFooter()` — brand, contact email, copyright.

- [ ] **Step 1: Add `footer` to `messages/en.json`**

```json
"footer": {
  "brand": "kingnnt.org",
  "tagline": "Software consulting & implementation.",
  "email": "hello@kingnnt.org",
  "rights": "All rights reserved."
}
```

- [ ] **Step 2: Add `footer` to `messages/vi.json`**

```json
"footer": {
  "brand": "kingnnt.org",
  "tagline": "Tư vấn & triển khai phần mềm.",
  "email": "hello@kingnnt.org",
  "rights": "Bảo lưu mọi quyền."
}
```

- [ ] **Step 3: Create `app/[locale]/(public)/home/_components/footer.tsx`**

```tsx
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <div>
          <div className="font-semibold">{t("brand")}</div>
          <div className="text-sm text-muted-foreground">{t("tagline")}</div>
        </div>
        <a href={`mailto:${t("email")}`} className="text-sm text-muted-foreground hover:text-foreground">
          {t("email")}
        </a>
        <div className="text-sm text-muted-foreground">
          © 2026 {t("brand")}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Write test `tests/sections/footer.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { SiteFooter } from "@/app/[locale]/(public)/home/_components/footer";

describe("SiteFooter", () => {
  it("renders brand and contact email", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SiteFooter />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Software consulting & implementation.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@kingnnt.org" })).toHaveAttribute(
      "href",
      "mailto:hello@kingnnt.org",
    );
  });
});
```

- [ ] **Step 5: Run and verify pass**

Run: `yarn test tests/sections/footer.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/(public)/home/_components/footer.tsx messages tests/sections/footer.test.tsx
git commit -m "feat(home): add footer"
```

---

## Task 18: Compose page + final verification

**Files:**
- Modify: `app/[locale]/(public)/home/page.tsx`
- Test: `tests/messages/parity.test.ts` (re-run), full suite

**Interfaces:**
- Consumes: all section components + `SiteHeader`, `SiteFooter`, `setRequestLocale`.
- Produces: the assembled localized landing page replacing the placeholder.

- [ ] **Step 1: Replace `app/[locale]/(public)/home/page.tsx`**

```tsx
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "./_components/hero";
import { LogoStrip } from "./_components/logo-strip";
import { Services } from "./_components/services";
import { Process } from "./_components/process";
import { CaseStudies } from "./_components/case-studies";
import { TechStack } from "./_components/tech-stack";
import { Testimonials } from "./_components/testimonials";
import { Team } from "./_components/team";
import { Faq } from "./_components/faq";
import { Contact } from "./_components/contact";
import { SiteFooter } from "./_components/footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <Services />
        <Process />
        <CaseStudies />
        <TechStack />
        <Testimonials />
        <Team />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 2: Run the full test suite**

Run: `yarn test`
Expected: PASS (all suites, including en/vi parity).

- [ ] **Step 3: Typecheck + lint + build**

Run: `yarn lint && yarn build`
Expected: no type errors; build succeeds. Fix any reported issue before continuing.

- [ ] **Step 4: Manual verification (both locales + themes)**

Run: `yarn dev`, then check:
- `http://localhost:3000/` → redirects to `/en/home`.
- `/en/home` and `/vi/home` render all sections with correct copy.
- Language switcher swaps locale and preserves the path.
- Theme toggle: all sections readable in light **and** dark (no hardcoded gray).
- Mobile width (~375px): header hamburger works, no horizontal scroll.
Stop the server.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/(public)/home/page.tsx
git commit -m "feat(home): compose bilingual landing page"
```

---

## Self-Review Notes (author checklist — completed)

- **Spec coverage:** Nav (T6), Hero (T7), Logo strip (T8), Services (T9), Process (T10), Case studies (T11), Tech/domains (T12), Testimonials (T13), Team (T14), FAQ (T15), Contact/form (T16), Footer (T17), theming fix (T4 + token rule enforced per section), next-intl (T2), localized metadata/SEO (T3), one-H1/H2 hierarchy (Global Constraints + per-section headings), mobile-first (T6 + T18 manual check). Out-of-scope items (blog, CRM, auth) intentionally excluded per spec §8.
- **Type consistency:** `submitContact`/`ContactInput`/`contactSchema` names match across T16. `useTranslations` namespaces match message keys added in each task. Data shapes (`results`, `tags`, `steps`, `items`, `members`) consistent between component readers and message files.
- **Open items** deferred to real content/integration: contact-form delivery target (T16 stub) and final asset swaps — flagged in spec §9.
