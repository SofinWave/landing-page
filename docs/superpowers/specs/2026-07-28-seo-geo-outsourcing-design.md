# SEO + GEO optimization for IT outsourcing positioning

**Date:** 2026-07-28
**Status:** approved (scope), implementation in progress

## Goal

Reposition sofinwave.org from generic "software consulting & implementation" to
**IT outsourcing**, and make it rank in classic search (SEO) and get cited by
answer engines (GEO).

**Target buyer:** US / EU companies hiring offshore development teams in Vietnam.
English is the primary revenue locale; Vietnamese ships at parity because the
repo enforces it.

## Constraints

1. **No fabricated facts.** Case studies (`Acme Corp`, `Globex`) and testimonials
   (`Jane Doe`, `John Smith`) currently on the site are invented, including their
   result numbers (`-95%`, `8x`, `-60%`). This spec does not add `Review` or
   `AggregateRating` schema to them — publishing fabricated reviews as genuine
   violates Google's structured-data policy and risks a manual spam action. The
   schema plumbing is built but stays disabled until real data arrives. Facts the
   owner must supply are tracked in `docs/CONTENT-TODO.md`.
2. **Keep the `/home` route.** The landing page stays at `/{locale}/home`.
   `/{locale}` continues to redirect there. Canonical, sitemap, hreflang, and
   `llms.txt` are corrected to point at `/{locale}/home` instead of `/{locale}`.
3. **Follow repo conventions.** Message catalogs stay at key parity
   (`tests/messages/parity.test.ts`), Biome formats, ESLint lints, every new
   section gets a test.

## Defects found in the current site

| # | Defect | Impact |
|---|--------|--------|
| 1 | `canonical` and `sitemap.xml` both declare `/{locale}`, which 307-redirects to `/{locale}/home`. The real page has no self-canonical. | Canonical pointing at a redirect. Google must resolve the hop and may pick its own canonical; duplicate-content ambiguity between `/en` and `/en/home`. |
| 2 | Open Graph and Twitter images are `/icon.png`, a 500×500 square, while `twitter:card` claims `summary_large_image`. | Broken/letterboxed social previews; weak thumbnails in AI answer surfaces. |
| 3 | `public/images/logo-sofinwave.png` is 4.4 MB; team avatars are 2.7–5.3 MB PNGs. | If served, destroys LCP and Core Web Vitals. |
| 4 | `sitemap.ts` has no `lastModified`. | Loses a recrawl signal. |
| 5 | `public/llms.txt` is hand-written, English-only, and duplicates copy that lives in `messages/*.json`. | Guaranteed to drift from the site. |
| 6 | Zero outsourcing vocabulary in copy, keywords, or schema. Positioning is "consulting & implementation". | Cannot rank for the buyer's actual queries. |
| 7 | One page per locale. | A single page cannot rank for ~20 distinct topics. |

## Architecture

### Information architecture

Every route ships in both locales under `app/[locale]/(public)/`.

| Route | Primary query cluster |
|---|---|
| `/home` | brand + "software outsourcing Vietnam" |
| `/vietnam-software-outsourcing` | pillar: why Vietnam, cost, timezone, talent pool, vs. India/Philippines/Poland |
| `/services` | hub, distributes internal link equity |
| `/services/offshore-development` | "offshore software development Vietnam" |
| `/services/dedicated-team` | "dedicated development team Vietnam" |
| `/services/staff-augmentation` | "IT staff augmentation Vietnam" |
| `/services/custom-software-development` | "custom software development company" |
| `/services/system-integration` | "system integration services" |
| `/services/devops-cloud` | "devops outsourcing", "cloud migration services" |
| `/engagement-models` | "fixed price vs time and materials", contract models |
| `/industries/fintech` | "fintech software development company" |
| `/industries/ecommerce` | "ecommerce development outsourcing" |
| `/industries/logistics` | "logistics software development" |
| `/about` | E-E-A-T, entity clarity, NAP |
| `/contact` | conversion + `ContactPage` schema |

Blog (`/blog`, `/blog/[slug]`) is deliberately **out of scope**. Publishing an
empty blog shell is an SEO liability, and there is no article content yet.

### Page composition

A shared content-page shell (`components/page-shell.tsx`) renders breadcrumbs,
`<h1>`, a direct-answer lede, body sections, an FAQ block, and a CTA — so every
new route is a data-driven composition rather than a bespoke layout. Route
definitions live in one place (`lib/routes.ts`) and drive navigation, the
sitemap, breadcrumbs, and the generated `llms.txt`, so those can never disagree.

Existing home sections stay in `app/[locale]/(public)/home/_components/`.

### Structured data

`lib/structured-data.ts` gains, alongside the current `ProfessionalService`,
`WebSite`, and `FAQPage` nodes:

- `Service` per service page, with `provider`, `areaServed`, `serviceType`.
- `BreadcrumbList` on every non-home page.
- `WebPage` bound to the site entity.
- `Person` for team members — real, named people only.
- `ContactPoint` and richer `Organization` fields (`foundingDate`,
  `numberOfEmployees`, `address`, `knowsLanguage`, `slogan`) once the owner
  supplies them.
- `Review` / `AggregateRating`: **built but disabled.** Gated behind real data.

### GEO layer

- `scripts/build-llms-txt.ts` generates `public/llms.txt` and
  `public/llms-full.txt` from `lib/routes.ts` + the message catalogs at build
  time. The hand-maintained file is deleted.
- A `/{locale}/{path}.md` route serves each page as plain markdown. Answer
  engines parse markdown far more reliably than a React-rendered DOM.
- Content patterns that answer engines reward, applied to every page: a lede that
  answers the page's question in the first two sentences; explicit
  entity-defining sentences; Q&A blocks; comparison tables; concrete, dated
  numbers.
- FAQ expands from 4 generic entries to the questions offshore buyers actually
  ask: rates, timezone overlap, IP ownership, NDA, ramp-up time, communication
  cadence, quality control, exit terms.

### Copy

Home and all new pages are written in English first for the US/EU buyer, then
translated to Vietnamese at key parity. Existing brand voice is preserved;
outsourcing vocabulary is introduced naturally rather than stuffed.

## Testing

- `tests/messages/parity.test.ts` already enforces EN/VI key parity and covers
  new keys automatically.
- One render test per new page and per new shared component.
- `tests/seo/` gains assertions that canonical, hreflang, and sitemap entries all
  resolve to `/{locale}/home` (defect #1) and that every route in `lib/routes.ts`
  appears in the sitemap.
- A test asserts the generated `llms.txt` matches the catalogs, so drift fails CI.

## Out of scope

- Blog infrastructure and articles.
- A Japanese locale.
- Backlink acquisition, Google Business Profile, directory listings — off-site
  work the code cannot do.
- Forwarding the contact form to a real email/webhook provider (existing TODO).
