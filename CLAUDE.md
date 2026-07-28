# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bilingual (English / Vietnamese) marketing site for SofinWave. Next.js 16 App
Router + React 19 + TypeScript (strict), styled with Tailwind v4 and shadcn/ui.

**One app serves four hostnames**, one per business vertical:

| Hostname | `SiteId` | Vertical |
| --- | --- | --- |
| `sofinwave.org` | `tech` | IT consulting & implementation, including AI |
| `media.sofinwave.org` | `media` | Video/content production, affiliate |
| `finance.sofinwave.org` | `finance` | Investing knowledge & tooling (YMYL) |
| `academy.sofinwave.org` | `academy` | Education |

They are separate sites rather than sections of one because a single domain
covering all four would dilute topical authority in each, and because the
finance vertical is YMYL — isolating it keeps its trust requirements away from
the software business.

## Commands

Package manager is **pnpm**, pinned by `packageManager` in `package.json`.
`pnpm-lock.yaml` is the only lockfile in the repo — do not add `yarn.lock` or
`package-lock.json` back. Vercel picks its package manager by lockfile and ranks
`yarn.lock` *above* `pnpm-lock.yaml`, so a second lockfile silently hands the
deploy to yarn and installs a tree nobody has built.

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

Docker workflows are wrapped as [mise](https://mise.jdx.dev) file tasks namespaced `local:*` / `prod:*` / `rpi:*` (see `mise.toml` and `mise/tasks/`; list with `mise tasks ls`). All three image families install with pnpm via corepack.

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
- **Middleware lives in `proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`). It applies the next-intl middleware *and* the hostname-to-site rewrite described above.
- Copy lives in `messages/en.json` and `messages/vi.json`, namespaced per site (`metadata`/`pages` for tech, `mediaMetadata`/`mediaPages`, `financeMetadata`/`financePages`, `academyMetadata`/`academyPages`). The two catalogs **must have identical key structure** — `tests/messages/parity.test.ts` enforces this and will fail otherwise. Add every new key to both files.
- Server Components read translations via `getTranslations`; Client Components via `useTranslations`. `setRequestLocale(locale)` is called in layouts/pages to enable static rendering.

### Multi-site routing

`proxy.ts` resolves the incoming `Host` header to a site via `resolveSite()` and
**rewrites** the request into that site's subtree: `media.sofinwave.org/en/about`
renders `/media/en/about`. The rewrite is invisible to the client, keeps
next-intl's locale handling untouched (the locale stays the first public path
segment), and keeps every page statically generatable — reading `Host` inside a
page would force dynamic rendering instead.

Root-level files whose content differs per site (`sitemap.xml`, `robots.txt`,
`llms.txt`, `llms-full.txt`, `manifest.webmanifest`) are rewritten to route
handlers under `app/s/[site]/`. `proxy.ts` holds the public-path → handler map;
the handler directory is named after the public file **except** the sitemap,
which lives at `app/s/[site]/sitemap-xml/`. A directory literally named
`sitemap.xml` makes Next classify the route as a static metadata file, and the
deployment adapter skips those when building its output map — a statically
prerendered dynamic route then has no parent output and the build dies with
`Invariant: failed to find source route`. The adapter only runs on Vercel, so a
local `pnpm build` passes regardless; `tests/seo/route-conventions.test.ts`
guards it instead. Never name a dynamic route directory after a metadata file.

- `enums/site.enum.ts` — the four `SiteId`s.
- `lib/sites.ts` — per-site config: hostname, brand name, message namespaces,
  schema.org type, routes, and navigation. **Adding a vertical starts here.**
- `lib/routes.ts` — route registry per site. Drives navigation, sitemaps,
  breadcrumbs, and `llms.txt`, so those cannot disagree.

### Page composition

`app/[site]/[locale]/(public)/home/page.tsx` renders the landing page. The
**tech** site's home is a bespoke composition of marketing sections from
`_components/` (hero, services, process, case-studies, tech-stack, testimonials,
team, faq, contact, logo-strip); every other site's home is a content-shell page
like any other route.

`app/[site]/[locale]/(public)/[...slug]/page.tsx` renders every other route
through `components/content-page.tsx` — a data-driven shell reading its copy from
the site's content namespace. Its FAQ renders as plain `dl`/`dt` rather than an
accordion so crawlers and answer engines read the answers without executing
anything.

`components/section.tsx` provides the shared section shell (container + vertical
rhythm). `components/site-header.tsx` and `site-footer.tsx` take a `site` prop
and read their links from the registry.

### UI components

shadcn/ui, "new-york" style (`components.json`), Radix primitives under `components/ui/`. Icons from `lucide-react`. `cn()` (clsx + tailwind-merge) from `@/lib/utils` for class merging. Theming via `next-themes` (`components/theme-provider.tsx`, `mode-togger.tsx`), light/dark through CSS variables in `app/globals.css`.

### Contact form

There is no server action and no inbox integration. `lib/contact.ts` holds the
Zod schema and `buildContactMailto()`; the form validates in the browser and
then hands off to a `mailto:` URL, so the enquiry is composed and sent from the
visitor's own mail client to `SITE_EMAIL`.

That means submissions are never recorded server-side, so the UI must not claim
delivery — it says the mail app was opened, keeps the typed text (nothing opens
when no mail client is registered), and always shows the address as a fallback.
The message is capped at `MESSAGE_MAX` because long `mailto:` URLs get truncated.
Wiring a real provider later means replacing the handoff, not restoring the
deleted action.

### SEO / metadata

The landing page lives at `/{locale}/home`; `/{locale}` only redirects there, so
**canonicals and sitemap entries must never point at `/{locale}`**.

- `lib/site.ts` — URL builders (`siteUrl`, `pageUrl`, `languageAlternates`),
  keywords, `sameAs`, OG locales. All take an optional `SiteId`.
- `lib/metadata.ts` — `pageMetadata()` builds per-page canonical, hreflang, and
  Open Graph. Canonical belongs on the page, never the layout, which wraps every
  route. The `og:image` is referenced explicitly: setting `openGraph` in
  `generateMetadata` stops Next.js merging the `opengraph-image` file
  convention, which silently drops the card.
- `lib/sitemap.ts` — hand-rolled XML with `xhtml:link` hreflang per URL.
- `lib/structured-data.ts` + `components/structured-data.tsx` — JSON-LD. Each
  site emits only its own entity; the tech offer catalog, expertise list, and
  team roster must not leak into the other verticals.
- `lib/llms.ts` — generates `llms.txt` and `llms-full.txt` from the route
  registry and catalogs, per site. Never hand-edit those files.

**Never emit `Review`/`AggregateRating`** until the testimonials are real — see
`docs/CONTENT-TODO.md`. Placeholder team names are filtered out of `Person`
schema for the same reason.

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
