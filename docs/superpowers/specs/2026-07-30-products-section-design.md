# Products: a section on the tech home page and a `/products` route

**Date:** 2026-07-30
**Site:** `tech` (`sofinwave.com`) only
**Status:** approved, ready for planning

## Problem

SofinWave ships two of its own products — SmartFinTrack and Tử Vi Đẩu Số — and
neither appears anywhere on the site. The tech site currently reads as a pure
consultancy: services, process, case studies, team. A visitor has no way to
learn that the company builds and runs consumer software of its own.

## Goal

Present both products as software a visitor can go and use, not as portfolio
exhibits. The audience is the end user of each product; the secondary effect —
proving to a consulting prospect that we ship — is a by-product of the same
copy, not a separate framing.

Scope is one new section on the tech landing page plus one new content route,
`/products`. No per-product subpages: neither product has enough copy behind it
to fill a page without padding, and thin pages cost more in topical authority
than they earn.

## Non-goals

- No `/products/<slug>` pages. Revisit when a product has real depth to write about.
- No changes to the media, finance, or academy sites. Their home pages stay
  content-shell pages, and the tech product catalog must not leak into their
  schema.
- No pricing table, no signup flow, no product screenshots.

## Content, and where it came from

Copy for Tử Vi Đẩu Số is taken from the product's own live pages
(`tuvidauso.kingnnt.org`, fetched 2026-07-30). Copy for SmartFinTrack could not
be: its public site is a shell — `<title>Welcome`, meta description
`Welcome to SmartFinTrack`, login and register buttons, and the `/about` and
`/contact` URLs listed in its sitemap return 404. The feature list below was
confirmed directly by the product owner and is what the app does today, not
roadmap.

**SmartFinTrack** — `https://smartfintrack.kingnnt.org`

- Category: personal finance management
- Features: income/expense entry by category; monthly budgets and limits;
  assets and investments; reports and charts
- Free. Interface in Vietnamese and English.
- VI blurb: "Hệ thống quản lý tài chính cá nhân. Ghi nhận thu chi theo danh
  mục, đặt ngân sách theo tháng, theo dõi tài sản và khoản đầu tư, rồi đọc lại
  tất cả bằng báo cáo và biểu đồ."
- EN blurb: "Personal finance management. Log income and expenses by category,
  set monthly budgets, track assets and investments, and read it all back as
  reports and charts."

**Tử Vi Đẩu Số** — `https://tuvidauso.kingnnt.org`

- Category: Zi Wei Dou Shu (Purple Star) astrology charting, with AI reading
- Features (the four the card and page list): casts a chart from birth date and
  time; solar or lunar calendar with leap-month support; 12 palaces with major
  stars and five elements; detailed AI interpretation. "Sign in to save charts"
  is stated in the price line rather than as a fifth bullet, so both cards carry
  four bullets and stay the same height.
- Casting is free; signing in unlocks saved charts and the detailed AI reading.
  Interface in Vietnamese and English.
- VI blurb: "Lập lá số tử vi từ ngày giờ sinh — dương lịch hoặc âm lịch, có
  tháng nhuận — an sao vào 12 cung kèm chính tinh và ngũ hành, rồi luận giải
  chi tiết bằng AI."
- EN blurb: "Casts a Zi Wei Dou Shu chart from a birth date and time — solar or
  lunar calendar, leap months included — across the 12 palaces with major stars
  and five elements, then reads it back in detail with AI."

The English catalog keeps the product name as "Tử Vi Đẩu Số" with a
"(Zi Wei Dou Shu astrology)" gloss. Translating the name away loses the proper
noun a reader would search for.

No metrics, no user counts, no ratings. Nothing in this section is a number.

### Known mismatch

Both products live on `kingnnt.org`, not a SofinWave domain. The page will say
these are our products while linking to a personal domain. This ships as-is by
decision; moving them to `smartfintrack.sofinwave.com` and
`tuvidauso.sofinwave.com` later means editing the two URLs in both catalogs and
the schema, nothing structural.

## Design

### 1. Home section

New component `app/[site]/[locale]/(public)/home/_components/products.tsx`,
rendered in `home/page.tsx` between `<CaseStudies />` and `<TechStack />`. The
two evidence sections belong adjacent: work done for clients, then software we
run ourselves, before the supporting material starts.

`SectionLabel` indices renumber accordingly — Products takes 4, and TechStack
4→5, Team 6→7, Ecosystem 7→8, Faq 8→9. (`Testimonials` carries no label and is
unaffected.)

Structure, following `case-studies.tsx` so the two read as one family:

- Centered heading + lede, `mx-auto mb-12 max-w-2xl text-center`
- `<Reveal>` wrapping `grid gap-8 lg:grid-cols-2`
- One `HudCard` per product, the whole card an `<a href>` to the product domain
  in the same tab (matching `ecosystem.tsx`), containing:
  - a `lucide-react` icon — `Wallet` for SmartFinTrack, `Sparkles` for
    Tử Vi Đẩu Số — plus an `ArrowUpRight` affordance
  - product name as the card title
  - a meta line: price and languages (e.g. "Miễn phí · Tiếng Việt / English")
  - the one-sentence blurb
  - a `<ul>` of four feature bullets
  - the bare hostname in `font-mono text-xs`, bottom-aligned via `mt-auto`
- Below the grid, an internal `Link` to `/products` ("Xem chi tiết sản phẩm →")

Copy lives under a new top-level `products` namespace in both catalogs, shaped
`{ navLabel, heading, lede, ctaLabel, items: [{ key, name, blurb, price,
languages, features: string[], href, host }] }`. The component reads
`t.raw("items")`, the same pattern `caseStudies` uses.

`key` is `"smartfintrack"` / `"tuvidauso"` — a stable, untranslated identifier.
It picks the icon in the component and the `applicationCategory` in the schema,
neither of which is copy and neither of which belongs in a message catalog.

No `CountUp`, no accordion, no client-only reveal of text — every word is in the
server-rendered HTML, which is the constraint that matters for the answer-engine
crawlers.

### 2. `/products` route

Add to `TECH_ROUTES` in `lib/routes.ts`:

```ts
{ path: "products", key: "products", parent: HOME_PATH, priority: 0.8, changeFrequency: "monthly" }
```

The registry drives sitemap, `llms.txt`, and breadcrumbs, so nothing else needs
touching for the page to be discoverable.

Copy goes under `pages.products` in both catalogs, following `ContentPageData`:

- `lede` — answers "what software does SofinWave build and run" in the first
  two sentences, since that is what an answer engine quotes.
- `sections`:
  1. **SmartFinTrack** — blurb as `body`, four features as `bullets`, product
     URL as `links`
  2. **Tử Vi Đẩu Số** — same shape
  3. **Why we build our own products** — ties the products back to the
     consulting business: the same team, the same standards, and a place where
     we carry the operational cost of our own recommendations
- `faq` — three questions: are they free; do I need an account; can SofinWave
  build something like this for us
- `cta` — points at `/contact`

Note the `products` message key exists twice by design and for different
readers: `products.*` (top level) is the home section's copy; `pages.products.*`
is the route's copy. This mirrors how `ecosystem` and `pages.ventures` already
coexist.

### 3. Navigation

Add `{ href: "/products", key: "products" }` to the tech site's `footerCompany`
in `lib/sites.ts`, positioned before `/ventures`.

Header nav stays at five items. All five are services; a sixth entry of a
different kind would blur what the nav is for, and the home section already
carries a link to the page.

### 4. Structured data

Add `softwareApplicationSchema()` to `lib/structured-data.ts`, emitting one
`SoftwareApplication` node per product:

```ts
{
  "@type": "SoftwareApplication",
  name, url,
  applicationCategory: "FinanceApplication" | "LifestyleApplication",
  operatingSystem: "Web",
  inLanguage: ["vi", "en"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
}
```

`applicationCategory` comes from a `key → category` map in
`lib/structured-data.ts`, not from the catalogs.

Emission point is `PageStructuredData` in `components/structured-data.tsx`,
guarded by `site === SiteId.Tech && path === "products"` — the same shape as the
existing `path.startsWith("services/")` branch that emits `Service`. It must not
appear on the other three sites, and it must never carry `aggregateRating` or
`review` — the existing prohibition applies here unchanged.

The names and URLs the schema emits are read from the `products` namespace, the
same entries the home card renders, so schema and visible copy cannot drift.

### 5. Freshness

Bump `CONTENT_LAST_MODIFIED` in `lib/routes.ts` to `2026-07-30`. The catalogs
change in this work, so the date is genuinely earned.

## Testing

- `tests/sections/products.test.tsx` — renders the section and asserts both
  product names, both absolute hrefs, and every feature bullet appear in the
  output. Asserting bullets specifically is the regression guard against a
  future refactor hiding them behind an interaction.
- `tests/seo/structured-data.test.ts` — extend: `SoftwareApplication` is emitted
  for the tech site, is absent for media/finance/academy, and no node carries
  `aggregateRating` or `review`.
- `tests/messages/parity.test.ts` — already enforces that every new key exists
  in both `en.json` and `vi.json`; no change needed, but it is the gate that
  catches a half-translated catalog.
- `tests/lib/routes.test.ts` and `tests/seo/metadata-routes.test.ts` cover the
  new route through their existing per-route sweeps.

## Files touched

| File | Change |
| --- | --- |
| `home/_components/products.tsx` | new component |
| `home/page.tsx` | render `<Products />` after `<CaseStudies />` |
| `home/_components/{tech-stack,team,ecosystem,faq}.tsx` | renumber `Section index` |
| `lib/routes.ts` | add `products` route; bump `CONTENT_LAST_MODIFIED` |
| `lib/sites.ts` | add `/products` to tech `footerCompany` |
| `lib/structured-data.ts` | add `softwareApplicationSchema()` + category map |
| `components/structured-data.tsx` | emit product schema on tech `/products` |
| `messages/en.json`, `messages/vi.json` | `products` namespace + `pages.products` |
| `tests/sections/products.test.tsx` | new |
| `tests/seo/structured-data.test.ts` | extend |
