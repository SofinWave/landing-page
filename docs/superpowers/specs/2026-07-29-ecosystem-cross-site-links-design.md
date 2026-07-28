# Ecosystem — cross-site links between the four SofinWave sites

## Problem

The four sites share a brand, a team, and a codebase, but nothing links them.
`/ventures` on the tech site already describes all four verticals and names
`media.sofinwave.com`, `finance.sofinwave.com`, and `academy.sofinwave.com` — as
plain prose, not anchors. So today:

- No link equity flows between the four hostnames.
- A crawler landing on any one site has no path to the other three.
- Search and answer engines must infer that the four hostnames belong to one
  organization. The JSON-LD asserts four independent `Organization` nodes with
  no relation between them.

## Goals

All three, weighted equally:

1. **SEO / entity consolidation** — make the four-property relationship explicit
   to search and answer engines.
2. **Navigation** — a visitor on any site can find the other three.
3. **Brand credibility** — SofinWave reads as a group with four lines of work,
   not a single outsourcing shop.

## Non-goals

- Merging the sites, or weakening their separation. The verticals stay on
  separate hostnames with separate content namespaces for the reasons in
  `CLAUDE.md`: topical focus, and keeping the YMYL finance vertical isolated.
- Sending heavy traffic into media/finance/academy. Those three currently have
  only `home`, `about`, and `contact`; a prominent home-page funnel into them
  would land visitors on thin pages. Hence the footer-plus-tech-home scope
  below rather than a section on all four homes.
- Fixing `siteUrl()` for local development (see Known limitation).

## Why cross-linking does not undermine the split

The site separation exists to keep *content* focused, not to isolate link
graphs. Topical authority comes from what each site publishes. Four subdomains
of one registrable domain are already clustered by search engines; linking them
confirms the entity relationship rather than diluting anything. The YMYL
concern is likewise about content — an investing claim must not appear on the
tech site — and is unaffected by an anchor tag.

## Scope

| Surface | Sites | What |
| --- | --- | --- |
| Footer column | all four | 3 links to the sibling sites' home pages |
| Home section | tech only | 3 cards with role + blurb |
| JSON-LD | all four | `subOrganization` / `parentOrganization` |
| `/ventures` | tech only | prose hostnames become real anchors |

## Design

### 1. Copy

New top-level message namespace `ecosystem` in both `messages/en.json` and
`messages/vi.json`. It is shared across all four sites, following the existing
`footer` namespace precedent rather than being duplicated per site namespace.

```
ecosystem: {
  navLabel,          // footer column heading
  heading, lede,     // home-page section
  sites: {
    tech    : { role, blurb },
    media   : { role, blurb },
    finance : { role, blurb },
    academy : { role, blurb },
  }
}
```

Site display names come from `SITES[id].name`, which already holds them — they
are not repeated in the catalogs. `tests/messages/parity.test.ts` enforces that
both catalogs carry identical keys.

The finance blurb must stay free of advisory vocabulary, matching the
constraint already applied to `SITE_KEYWORDS[SiteId.Finance]`: the site
publishes a record of a process and the tools behind it, and holds no licence.

### 2. Sibling lookup

`lib/sites.ts` gains one helper:

```ts
export function siblingSites(site: SiteId): SiteConfig[]
```

Returns `ALL_SITES` minus the given site, in registry order.

No shared link component is introduced. The footer renders a list, the home
section renders cards; both call `siblingSites()` and
`pageUrl(locale, HOME_PATH, id)` from `lib/site.ts`. Two consumers with
different markup do not justify an abstraction.

Links target each site's **home page**, never `/{locale}` — that path only
redirects, as `lib/site.ts` already documents.

### 3. Footer column

`components/site-footer.tsx` gains an "Ecosystem" column listing the three
sibling sites. Details:

- Rendered with plain `<a>`, not the next-intl `Link` — these are absolute URLs
  to a different hostname, and `Link` is for locale-scoped internal navigation.
- The current locale is preserved in the target URL, read via `useLocale()`.
- No `rel="nofollow"` or `rel="noreferrer"`. These are first-party brand links;
  passing equity is the point. No `target="_blank"` either — a visitor
  switching verticals is navigating, not opening a reference.
- Grid: the column count grows from 4 to 5 on tech and from 3 to 4 elsewhere.
  Switch to a responsive `md:grid-cols-2 lg:grid-cols-<n>` so five columns do
  not get crushed at tablet width.
- The column appears on all four sites, and never links a site to itself.

### 4. Home-page section (tech only)

New `app/[site]/[locale]/(public)/home/_components/ecosystem.tsx`, inserted
between `<Team />` and `<Faq />` in `home/page.tsx`.

Placement rationale: by the time a visitor reaches Team they know who does the
work; the ecosystem section answers "what else is there" before FAQ and Contact
close the page.

Uses the shared `Section` shell. Three cards, each carrying the site name, a
role label, a one-line blurb, and an arrow link to that site's home page. Icons
from `lucide-react`, matching the other marketing sections.

Only the tech home is a bespoke composition; the other three render through
`ContentPage`. This section is therefore added to the tech composition only,
and no change to `ContentPage` is needed for it.

### 5. `/ventures` gets real links

`ContentSection` in `components/content-page.tsx` already declares an optional
`links: { href, label }[]`, but renders them through the next-intl `Link`,
which is only correct for locale-scoped internal paths.

Change: when `href` matches `^https?://`, render a plain `<a>`; otherwise keep
the existing `Link`. This makes `links` usable for external and cross-site
targets on every content page, not just `/ventures`.

Then add a `links` entry to each of the four vertical sections of
`pages.ventures` in both catalogs, pointing at the corresponding site's home
page.

### 6. Structured data

In `lib/structured-data.ts`, `organizationSchema()` emits the group
relationship:

- Tech: `subOrganization: [...]` — one node per other site.
- Media, finance, academy: `parentOrganization: {...}` pointing at
  `https://sofinwave.com/#organization`.

Each referenced node carries `@type`, `@id`, `name`, and `url` rather than a
bare `@id`, because the referenced node lives in a different document and a
bare reference would not resolve for a consumer that fetched only one page.

`hasOfferCatalog` and `knowsAbout` are untouched. The existing rule holds: a
site emits only its own catalog and expertise, so nothing leaks across
verticals.

## Testing

- `tests/sections/ecosystem.test.tsx` (new) — the section renders three cards;
  each href is the sibling site's absolute home URL; the current locale is
  preserved; the tech site does not link to itself.
- `tests/sections/footer.test.tsx` (extend) — the ecosystem column renders on
  all four sites with exactly three links, none self-referential.
- `tests/seo/structured-data.test.ts` (extend) — tech carries
  `subOrganization` with three entries and no `parentOrganization`; the other
  three carry `parentOrganization` and no `subOrganization`; no site borrows
  another's offer catalog.
- `tests/components/content-page.test.tsx` (extend) — an absolute `href`
  renders as `<a>` with the URL unchanged; a relative `href` still renders the
  locale-prefixed internal link.
- `tests/messages/parity.test.ts` — already covers the new namespace; no change
  needed.

## Known limitation

`siteUrl()` always builds production hostnames, and only the tech site honours
`NEXT_PUBLIC_SITE_URL`. Under `pnpm dev`, an ecosystem link therefore navigates
to `https://media.sofinwave.com` rather than `media.localhost:3000`. Production
is unaffected. Teaching `siteUrl()` to derive sibling hosts from
`NEXT_PUBLIC_SITE_URL` would fix it, but that is outside this change and is
deliberately left out.

## Files touched

| File | Change |
| --- | --- |
| `messages/en.json`, `messages/vi.json` | new `ecosystem` namespace; `links` on `pages.ventures` sections |
| `lib/sites.ts` | `siblingSites()` |
| `components/site-footer.tsx` | ecosystem column, responsive grid |
| `app/[site]/[locale]/(public)/home/_components/ecosystem.tsx` | new section |
| `app/[site]/[locale]/(public)/home/page.tsx` | render the section on tech |
| `components/content-page.tsx` | absolute href renders as `<a>` |
| `lib/structured-data.ts` | `subOrganization` / `parentOrganization` |
| `tests/sections/ecosystem.test.tsx` | new |
| `tests/sections/footer.test.tsx`, `tests/components/content-page.test.tsx`, `tests/seo/structured-data.test.ts` | extended |
