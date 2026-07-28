# Rebrand kingnnt.org → SofinWave

**Date:** 2026-07-28
**Branch:** `refactor/rebrand-to-sofinwave`

## Goal

Replace the kingnnt.org brand identity with SofinWave across the landing page: logo,
brand name, canonical domain, contact email, and every derived artifact (metadata,
structured data, manifest, sitemap, llms.txt, docs, container names).

## Decisions

| Item | Value |
| --- | --- |
| Canonical domain | `https://sofinwave.org` |
| Display brand | `SofinWave` |
| Contact email | `Work.KingNNT@gmail.com` |
| GitHub profile (`sameAs`) | `https://github.com/SofinWave` |
| Header logo treatment | Full wordmark image, no separate text label |

## Assets

Source is `public/images/logo-sofinwave.png` — 2048×2048, RGB (no alpha), near-white
background (RGB 252–255 with noise), lockup centred with wide margins. It is kept as the
unmodified original. `public/images/logo-kingnnt.png` is also kept (archived, unreferenced).

Derived by a one-off Pillow script:

| File | Content |
| --- | --- |
| `public/images/logo-wordmark.png` | Whole lockup (SF mark + "Sofinwave" text), background trimmed and made transparent |
| `public/images/logo-wordmark-dark.png` | Same lockup, dark-navy pixels lifted for legibility on dark backgrounds |
| `public/images/logo-mark.png` | Square crop of the SF + wave mark only, transparent background |
| `app/icon.png` | Overwritten with a 500×500 render of `logo-mark` (favicon + manifest, which declares `sizes: "500x500"`) |

A dark variant is required, not optional: the dark theme sets
`--background: oklch(0.16 0.02 255)`, and the logo's darkest navy is close enough to that
value that a merely-transparent PNG would be near-invisible.

## Code changes

### `components/logo.tsx`

Renders the wordmark instead of a square icon plus text:

- Two `<Image>` elements — light variant with `dark:hidden`, dark variant with `hidden dark:block`.
- Sized `h-8 w-auto`; `width`/`height` set from the derived asset's intrinsic size so Next
  can reserve layout space.
- The `label` prop stops rendering visible text and becomes the `alt` value.
- `size` prop is dropped (a wordmark is not square). `className` and `priority` stay.

`components/site-header.tsx` is unchanged — it already wraps the logo in an
`<a aria-label={t("brand")}>`, so the brand name stays in the accessibility tree.

### `lib/site.ts`

- `SITE_URL` default → `https://sofinwave.org`
- `SITE_NAME` → `"SofinWave"`
- `SITE_EMAIL` → `"Work.KingNNT@gmail.com"`
- `SITE_SAME_AS` → `["https://github.com/SofinWave"]`
- Doc comment example domain updated

Everything downstream (`generateMetadata`, `app/sitemap.ts`, `app/robots.ts`,
`app/manifest.ts`, `lib/structured-data.ts`) derives from these and needs no edit beyond
the stale `kingnnt.org` mention in a `lib/structured-data.ts` comment.

### Message catalogs

`messages/en.json` and `messages/vi.json` — replace the literal `kingnnt.org` in prose and
update the email. Key structure is untouched (`tests/messages/parity.test.ts` enforces parity).

- `meta.title`, `meta.description`
- `header.brand`, `hero.subtitle`, `team.about`
- `footer.brand`, `footer.email`

### Content and infrastructure

- `public/llms.txt` — heading, summary, website URL, email, locale URLs
- `docker-compose.rpi.yml` — `kingnnt-dot-org_rpi_node` / `_caddy` → `sofinwave_rpi_node` / `_caddy` (both `container_name` and `hostname`)
- `CLAUDE.md` — overview sentence and the `lib/site.ts` paragraph
- `.vscode/settings.json` — add `SofinWave` to `cSpell.words`

## Out of scope

- `.docker/*/node/Dockerfile` `LABEL maintainer="KingNNT"` — a person, not the brand.
- DNS, deployment, and `NEXT_PUBLIC_SITE_URL` values in real `.env` files.
- Existing spec/plan documents under `docs/superpowers/` — historical records.

## Testing

Update existing assertions that hardcode the old brand:

- `tests/sections/footer.test.tsx` — contact email link text and `mailto:` href
- `tests/seo/structured-data.test.ts` — `@id`, `logo`, `url`, `publisher["@id"]`
- `tests/seo/metadata-routes.test.ts` — hreflang alternates, `robots.sitemap`/`host`, manifest `short_name`

Add `tests/components/logo.test.tsx`:

- renders an image whose `alt` is the passed label
- renders no visible text node for the label (the wordmark carries it)
- renders both light and dark variants

Verification gate: `pnpm test`, `pnpm lint`, `pnpm format:check` all pass.
