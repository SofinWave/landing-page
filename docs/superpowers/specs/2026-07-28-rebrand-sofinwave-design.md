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

Derived by `scripts/build-brand-assets.py` (Pillow), re-runnable from the repo root:

| File | Content |
| --- | --- |
| `public/images/logo-wordmark.png` | Horizontal lockup (mark left, "Sofinwave" right), transparent, 1115×192 |
| `public/images/logo-wordmark-dark.png` | Same lockup, brightness compressed into the top half of the range for dark backgrounds |
| `public/images/logo-mark.png` | Square S monogram, transparent, 500×500 |
| `app/icon.png` | Same monogram (favicon + manifest, which declares `sizes: "500x500"`) |

Two details fell out of measuring the source rather than eyeballing it:

- **The lockup is re-composed, not just cropped.** The source stacks the mark (1593×740)
  above the wordmark (1566×184). At a 32 px header height that wordmark would render ~6 px
  tall. The script therefore crops the two pieces and rebuilds them side by side, scaling
  the wordmark to 42% of the mark height — a 5.8:1 lockup that reads at 32 px (161 px wide,
  which leaves room for the three mobile controls at a 390 px viewport).
- **The favicon is the S alone, not the whole mark.** The mark is 2.15:1; letterboxed into
  a square it shrinks to illegibility at tab sizes, and cutting it short slices the wave
  mid-stroke. A clean 19 px column gap at x≈734 separates the S from the F, so the S is
  lifted out whole and padded to a square.

Assets are palette-quantised on save (the source is noisy AI-generated art, so full-depth
PNGs came out at ~390 KB); the exported files land at 40–45 KB with no visible banding.

A dark variant is required, not optional: the dark theme sets
`--background: oklch(0.16 0.02 255)`, and the logo's darkest navy is close enough to that
value that a merely-transparent PNG would be near-invisible.

## Code changes

### `components/logo.tsx`

Renders the wordmark instead of a square icon plus text:

- Two `<Image>` elements — light variant with `dark:hidden`, dark variant with `hidden dark:block`.
- Sized `h-7 w-auto sm:h-8`; `width`/`height` come from the asset's intrinsic size so Next
  can reserve layout space.
- Both variants stay in the DOM and swap in CSS, because the theme is unknown during SSR.
  A `display: none` element is dropped from the accessibility tree, so an `alt` on either
  image would vanish in one of the two themes — the accessible name goes on the wrapping
  `<span role="img" aria-label>` and both images carry `alt=""`.
- The `label` prop no longer renders visible text; it defaults to `SITE_NAME`.
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

- exposes the label as the accessible name of an `img` role
- falls back to `SITE_NAME` when no label is passed
- renders no visible text node for the label (the wordmark carries it)
- renders both theme variants with the classes that swap them

Verification gate: `pnpm test`, `pnpm lint`, `pnpm format:check`, and `pnpm build` all pass,
plus headless-Chrome screenshots of the header in both themes.
