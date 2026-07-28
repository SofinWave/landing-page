# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bilingual (English / Vietnamese) marketing landing page for SofinWave (sofinwave.org), a software consulting business. Next.js 16 App Router + React 19 + TypeScript (strict), styled with Tailwind v4 and shadcn/ui.

## Commands

Package manager is **pnpm** (despite the presence of `yarn.lock`/`package-lock.json` — CI and the pre-commit hook both use pnpm).

```bash
pnpm dev            # dev server (Turbopack) on http://localhost:3000
pnpm build          # production build
pnpm start          # serve production build
pnpm test           # run vitest once
pnpm test:watch     # vitest watch mode
pnpm lint           # eslint (eslint-config-next)
pnpm lint:fix        # eslint --fix
pnpm format         # biome format --write
pnpm format:check   # biome format (verify only) — this is what CI runs
```

Run a single test file / test:

```bash
pnpm exec vitest run tests/sections/hero.test.tsx
pnpm exec vitest run -t "renders the CTA"
```

Docker workflows are wrapped as [mise](https://mise.jdx.dev) file tasks namespaced `local:*` / `prod:*` / `rpi:*` (see `mise.toml` and `mise/tasks/`; list with `mise tasks ls`). Note: the containerized `mise run local:dev` task runs `yarn dev` **inside** the container — this is the only place yarn is used.

## Formatting vs. linting split

Biome and ESLint are deliberately split — do not merge them:

- **Biome** = formatting only. Its linter is disabled (`biome.json` → `"linter": { "enabled": false }`). 2-space indent, 100 col, double quotes, semicolons, trailing commas.
- **ESLint** = linting only, via `eslint-config-next`.

The Husky pre-commit hook runs `lint-staged`: Biome formats all staged files, ESLint `--fix` runs on staged `.ts/.tsx`. CI (`.github/workflows/lint-format.yml`) runs `format:check` then `lint` on pushes/PRs to `develop`.

## Git flow

The default/integration branch is **`develop`** (not `main`) — target it for PRs, and CI only triggers on `develop`. Commits follow Conventional Commits; commitlint is enforced.

## Architecture

### Internationalization (next-intl) — the routing backbone

Everything is locale-scoped. `next-intl` drives routing, and the whole app lives under the `app/[locale]/` segment.

- **Locales** are defined once in `enums/locale.enum.ts` (`LocaleSupport.EN` / `.VI`) and wired into `i18n/routing.ts` (`localePrefix: "always"`, default `en`). Add a locale here + a `messages/<locale>.json` file.
- `i18n/request.ts` loads the per-request message catalog; `i18n/navigation.ts` exports locale-aware `Link`, `redirect`, `useRouter`, etc. — **use these, not `next/link`/`next/navigation`, for internal navigation.**
- **Middleware lives in `proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`), applying the next-intl middleware.
- Copy lives in `messages/en.json` and `messages/vi.json`. The two catalogs **must have identical key structure** — `tests/messages/parity.test.ts` enforces this and will fail otherwise. Add every new key to both files.
- Server Components read translations via `getTranslations`; Client Components via `useTranslations`. `setRequestLocale(locale)` is called in layouts/pages to enable static rendering.

### Page composition

`app/[locale]/(public)/home/page.tsx` is the single landing page. It composes one React component per marketing section from `app/[locale]/(public)/home/_components/` (hero, services, process, case-studies, tech-stack, testimonials, team, faq, contact, footer, logo-strip). Each section is a mostly-static, translation-driven component. To edit a section, edit its `_components/*.tsx` file and the corresponding namespace in the message catalogs.

`components/section.tsx` provides the shared section shell (container + vertical rhythm). Sections use anchor links (`#contact`, `#work`) for in-page nav.

### UI components

shadcn/ui, "new-york" style (`components.json`), Radix primitives under `components/ui/`. Icons from `lucide-react`. `cn()` (clsx + tailwind-merge) from `@/lib/utils` for class merging. Theming via `next-themes` (`components/theme-provider.tsx`, `mode-togger.tsx`), light/dark through CSS variables in `app/globals.css`.

### Server actions

`app/actions/contact.ts` (`"use server"`) handles the contact form, validating with a Zod schema in `app/actions/contact.schema.ts`. Currently logs submissions — forwarding to an email/webhook provider is a TODO.

### SEO / metadata

`lib/site.ts` is the single source of truth for site URL, name, keywords (per-locale), `sameAs`, and hreflang/OG-locale helpers. `SITE_URL` comes from `NEXT_PUBLIC_SITE_URL` (defaults to `https://sofinwave.org`). Metadata is generated in `app/[locale]/layout.tsx` (`generateMetadata`), plus `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, and JSON-LD via `components/structured-data.tsx` + `lib/structured-data.ts`. When changing domain, brand, or keywords, edit `lib/site.ts`.

### Brand assets

`components/logo.tsx` renders the wordmark lockup, which ships as two theme variants
(`public/images/logo-wordmark.png` / `-dark.png`) that swap via CSS — the brand navy is
too close to the dark theme background to read on transparency alone. Those files, plus
`public/images/logo-mark.png` and `app/icon.png`, are **derived**: regenerate them with
`python3 scripts/build-brand-assets.py` (needs Pillow) rather than editing them by hand.
The source art is `assets/brand/logo-sofinwave.png` — kept outside `public/` so the
4.4 MB original is never deployed or publicly downloadable.

### Path alias

`@/*` → repo root (`tsconfig.json` + vitest alias). Import as `@/components/...`, `@/lib/...`, `@/enums`, etc.

## Testing

Vitest + jsdom + `@testing-library/react` (`vitest.config.mts`, setup in `vitest.setup.ts`). Tests live in `tests/**/*.test.{ts,tsx}`, mirroring source structure (`tests/sections/`, `tests/components/`, `tests/seo/`, `tests/actions/`, `tests/i18n/`, `tests/messages/`). Globals are enabled (no need to import `describe`/`it`, though existing tests do). When adding a section or message key, add/extend the matching test.
