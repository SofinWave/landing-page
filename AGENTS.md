# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, …) working in this
repository. `CLAUDE.md` imports this file, so it is the single source of truth —
edit here, not there.

## Overview

Trilingual (English / Vietnamese / Chinese) marketing site for SofinWave. Next.js 16 App
Router + React 19 + TypeScript (strict), styled with Tailwind v4 and shadcn/ui.

**One app serves four hostnames**, one per business vertical:

| Hostname | `SiteId` | Vertical |
| --- | --- | --- |
| `sofinwave.com` | `tech` | IT consulting & implementation, including AI |
| `media.sofinwave.com` | `media` | Video/content production, affiliate |
| `finance.sofinwave.com` | `finance` | Investing knowledge & tooling (YMYL) |
| `academy.sofinwave.com` | `academy` | Education |

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
pnpm lint:fix       # eslint --fix
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

Everything is locale-scoped. `next-intl` drives routing, and the whole app lives under `app/[site]/[locale]/` (the `[site]` segment is
filled in by the hostname rewrite described below).

- **Locales** are defined once in `enums/locale.enum.ts` (`EN` / `VI` / `ZH`) and wired into `i18n/routing.ts` (`localePrefix: "always"`, default `en`). Adding a locale means: the enum, `routing.locales`, a `messages/<locale>.json` file, its import in `tests/messages/parity.test.ts`, and an `OG_LOCALE` entry plus keywords in `lib/site.ts`.
- `i18n/request.ts` loads the per-request message catalog; `i18n/navigation.ts` exports locale-aware `Link`, `redirect`, `useRouter`, etc. — **use these, not `next/link`/`next/navigation`, for internal navigation.**
- **Middleware lives in `proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`). It applies the next-intl middleware *and* the hostname-to-site rewrite described below.
- Copy lives in `messages/{en,vi,zh}.json`. The tech home's sections read top-level namespaces (`hero`, `services`, `products`, …); the rest is namespaced per site (`metadata`/`pages` for tech, `mediaMetadata`/`mediaPages`, `financeMetadata`/`financePages`, `academyMetadata`/`academyPages`). All catalogs **must have identical key structure and array lengths**, with `en` as the reference — `tests/messages/parity.test.ts` enforces this. Add every new key to every file.
- Server Components read translations via `getTranslations`; Client Components via `useTranslations`. `setRequestLocale(locale)` is called in layouts/pages to enable static rendering.

### Multi-site routing

`proxy.ts` resolves the incoming `Host` header to a site via `resolveSite()` and
**rewrites** the request into that site's subtree: `media.sofinwave.com/en/about`
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
`_components/` (hero, logo-strip, services, process, case-studies, products,
tech-stack, testimonials, team, ecosystem, faq, contact); every other site's home is a content-shell page
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
- `lib/robots.ts` — per-site robots.txt, naming every answer-engine crawler
  explicitly. Each vendor runs separate agents for training, search indexing,
  and live fetch; allowing only the training bot is the usual mistake.
- `lib/structured-data.ts` + `components/structured-data.tsx` — JSON-LD. Each
  site emits only its own entity; the tech offer catalog, expertise list, and
  team roster must not leak into the other verticals.
- `lib/llms.ts` — generates `llms.txt` and `llms-full.txt` from the route
  registry and catalogs, per site. Never hand-edit those files.

`CONTENT_LAST_MODIFIED` in `lib/routes.ts` dates both `<lastmod>` and
`dateModified`. **Bump it when the message catalogs change**, not on deploy —
it is a constant precisely so an untouched page stops claiming to be fresh
every time the site is rebuilt.

Anything a crawler must read has to be in the server-rendered HTML: the
answer-engine bots behind ChatGPT, Claude, and Perplexity do not execute
JavaScript. Copy that only appears after hydration (a count-up animation, an
unmounted accordion panel) is invisible to them, or worse — `CountUp` starts at
the final value for exactly this reason.

**Never emit `Review`/`AggregateRating`** until the testimonials are real — see
`docs/CONTENT-TODO.md`. Placeholder team names are filtered out of `Person`
schema for the same reason.

### Deployment

Two targets build the same app:

- **Vercel** — the hosted deploy. It is why the lockfile and route-naming rules
  above exist, and the only place `<Analytics />` reports from.
- **Raspberry Pi** — `docker-compose.rpi.yml` + `.docker/rpi/`, run via the
  `rpi:*` mise tasks: Cloudflare Tunnel → Caddy (`:8003`) → Node. One Node
  process serves all four hostnames; an unrecognised `Host` falls back to the
  apex site. Optional config lives in `.env.rpi` (see `.env.rpi.example`).

`NEXT_PUBLIC_SITE_URL` overrides the apex origin and
`NEXT_PUBLIC_SITE_PROTOCOL` the protocol for every site (`lib/site.ts`). Both are
inlined at **build** time, not read at runtime.

### Analytics

`@vercel/analytics`'s `<Analytics />` sits in `app/[site]/[locale]/layout.tsx`,
which is the root layout for all four sites. It is inert off Vercel, so local
and Docker builds are unaffected. Page views must be enabled per project in the
Vercel dashboard; all four hostnames report into the one project.

### Brand assets

`components/logo.tsx` renders the wordmark lockup, which ships as two theme variants
(`public/images/logo-wordmark.png` / `-dark.png`) that swap via CSS — the brand navy is
too close to the dark theme background to read on transparency alone. Those files, plus
`public/images/logo-mark.png`, `app/icon.png`, `app/favicon.ico`, and `app/apple-icon.png`, are **derived**: regenerate them with
`python3 scripts/build-brand-assets.py` (needs Pillow) rather than editing them by hand.
The source art is `assets/brand/logo-sofinwave.png` — kept outside `public/` so the
4.4 MB original is never deployed or publicly downloadable.

### Path alias

`@/*` → repo root (`tsconfig.json` + vitest alias). Import as `@/components/...`, `@/lib/...`, `@/enums`, etc.

## Testing

Vitest + jsdom + `@testing-library/react` (`vitest.config.mts`, setup in `vitest.setup.ts`). Tests live in `tests/**/*.test.{ts,tsx}`, mirroring source structure (`tests/sections/`, `tests/components/`, `tests/seo/`, `tests/lib/`, `tests/i18n/`, `tests/messages/`). Globals are enabled (no need to import `describe`/`it`, though existing tests do). When adding a section or message key, add/extend the matching test.
