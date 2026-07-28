# Content TODO — facts only you can supply

Everything in this list is something the site would benefit from but that must
not be invented. Each item says where it goes and what it unlocks.

Nothing here blocks the site from shipping. The pages are complete and honest
without these; filling them in makes the site more competitive.

## 1. Replace the fabricated case studies (highest impact)

**Where:** `messages/en.json` and `messages/vi.json` → `caseStudies.items`

The two case studies currently on the site are invented: "Acme Corp" and
"Globex", with results of `-95%`, `8x`, `-60%`, `-80%`, and `10 weeks`. Those
numbers describe no real project.

Buyers of outsourcing read case studies more carefully than any other page, and
answer engines quote concrete numbers over adjectives. Two real, specific case
studies would be worth more than every other item on this list combined.

For each, we need: the client (or an anonymised descriptor such as "a Series B
logistics platform"), the problem, what was built, and two or three outcome
numbers you can stand behind.

Until then, consider whether to keep the placeholders visible at all.

## 2. Replace the fabricated testimonials

**Where:** `messages/*.json` → `testimonials.items`

"Jane Doe, CTO, Acme Corp" and "John Smith, Head of Engineering, Globex" are
invented people.

`Review` and `AggregateRating` structured data is deliberately **not** emitted
for these. Publishing fabricated reviews as genuine violates Google's
structured-data policy and risks a manual spam action — the schema helpers exist
but stay off until the quotes are real and attributable with permission.

Once you have real quotes with named consent, say so and the `Review` and
`AggregateRating` nodes can be wired into `lib/structured-data.ts`.

## 3. Strengthen the team roster

**Where:** `messages/*.json` → `team.members`

The placeholder entries are gone — the roster now carries real first names
(Jesse, Alex, Brian) with 512x512 portraits, so all three are emitted as
schema.org `Person` nodes rather than being filtered out.

What would strengthen it further, in rough order of value:

- **Surnames.** Full names are a much stronger entity signal than first names,
  and let search engines connect a person to their LinkedIn or GitHub.
- **A one-line background each** — years of experience, or the systems they have
  shipped. E-E-A-T rewards demonstrable expertise, not job titles.
- **Real portraits for Alex and Brian.** Two of three are currently the
  `anonymous-*` placeholders. Stock or anonymised images are honest as long as
  nobody presents them as photographs of those people, but real ones are better.
- **`sameAs` per person** — LinkedIn or GitHub URLs on the `Person` nodes.

The placeholder filter in `components/structured-data.tsx` still guards against
regressions: any entry named "Team Member", "TBD", or "Coming soon" is silently
omitted from schema rather than published as staff.

## 4. Business identity facts for Organization schema

**Where:** `lib/site.ts` and `lib/structured-data.ts` → `organizationSchema`

These fields are supported by schema.org and improve entity recognition in both
search and answer engines. All are currently absent:

- **Registered address** — enables `PostalAddress`, and with it the local-business
  signals that `ProfessionalService` is designed to carry.
- **Founding year** — `foundingDate`.
- **Team size** — `numberOfEmployees`, even as a range.
- **Phone number**, if you want one public — `ContactPoint`.
- **Legal entity name**, if it differs from "SofinWave" — `legalName`.

## 5. Social and directory profiles

**Where:** `lib/site.ts` → `SITE_SAME_AS`

Currently only the GitHub organisation. `sameAs` is how search engines confirm
that scattered mentions refer to one entity. Worth adding when they exist:
LinkedIn company page, Clutch, GoodFirms, Crunchbase.

Clutch and GoodFirms are worth real effort — for outsourcing buyers they are
both a ranking surface and a trust signal, and answer engines cite them.

## 6. Rate ranges

**Where:** `messages/*.json` → `pages.engagementModels`

The engagement-models page deliberately says rates depend on role and seniority
and invites the reader to ask. That is honest, and it is also a conversion step
some buyers will not take.

If you are willing to publish a range — even "from $X/hour for mid-level" — it
would match a large volume of real search queries ("Vietnam developer hourly
rate") that the site currently cannot answer.

## 7. Verified market statistics

**Where:** `messages/*.json` → `pages.vietnamSoftwareOutsourcing`

The Vietnam pillar page makes qualitative claims about the talent pool and
avoids statistics, because unsourced numbers are worse than none. Answer engines
reward specific, citable figures.

If you add any — engineer headcount, IT graduate numbers, industry growth — cite
the source and year inline. Prefer government or major-analyst sources over
vendor blogs, which mostly cite each other.

## 8. Off-site work the code cannot do

Not in this repository, but these determine how much of the above pays off:

- Google Search Console and Bing Webmaster Tools — submit `sitemap.xml`.
- Google Business Profile, if you have a registered address.
- Clutch and GoodFirms profiles.
- Backlinks. For outsourcing this is the hardest and most decisive factor, and
  no amount of on-page work substitutes for it.
