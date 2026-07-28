# AI Training Data Services — Design

**Date:** 2026-07-28
**Status:** Approved, ready for implementation planning

## Problem

SofinWave has a capability the site does not sell: a data annotation workforce
and the equipment and process to collect egocentric and exocentric data. Both
are real today — there are people labelling, there are rigs capturing, and
headcount can scale on contract. None of it appears anywhere on any of the four
sites.

The gap matters because the buyer for this work is already adjacent to the
buyer the tech site serves. A team that comes to `sofinwave.org` for AI
implementation frequently has a training-data problem underneath the one they
described, and today that conversation has nowhere to land.

## Decision: a service cluster on the tech site, not a fifth vertical

The four existing sites are separate because a single domain covering software,
media, investing, and education would dilute topical authority in all four, and
because finance is YMYL. Neither reason applies here.

Data-for-AI is not a different topic from the tech site — it is the same topic
one step upstream. `sofinwave.org` already carries `services/ai-implementation`,
`services/llm-integration`, and `services/ai-agents`. Training data belongs in
that cluster, and placing it there compounds the domain's existing authority
instead of starting a fifth subdomain from zero.

The cost of being wrong is bounded: if the annotation business later warrants
its own brand, the pages move to a subdomain behind redirects. The cost of the
alternative is not — a fifth thin satellite site would rank for nothing, which
is the observable state of the three satellite sites that exist now.

## Positioning: from capture to a model in production

Every page answers "why you" the same way: **the same team collects the data,
labels it, fine-tunes on it, and ships the model.**

This is the only claim in the space that competitors cannot copy. Vietnamese
annotation BPOs — DIGI-TEXX, LTS, SIBAI, MP BPO — sell labelled data and stop
there. Western data vendors sell scale but not the downstream engineering.
SofinWave writes the data spec with the people who will later have to train on
it, which is the difference between a dataset that passes acceptance and one
that improves a model.

Three supporting arguments carry weight on individual pages but are not the
frame:

- **Engineering-led operations.** Auto-label pre-pass, QA automation, pipeline
  tooling — the client receives infrastructure, not hours.
- **Ego/exo capture.** Rare anywhere, effectively absent in Vietnam.
- **Southeast Asian diversity.** Scenes, faces, and languages that
  Western-collected datasets underrepresent — a genuine buying reason, but one
  that frames the business as cheap if led with.

## Routes

Five pages, all under `/services`, all rendered by the existing
`components/content-page.tsx` shell. No new components.

| Path | `key` | `parent` | priority | changeFrequency |
| --- | --- | --- | --- | --- |
| `services/ai-training-data` | `aiTrainingData` | `services` | 0.9 | monthly |
| `services/data-collection` | `dataCollection` | `services` | 0.9 | monthly |
| `services/egocentric-data-collection` | `egocentricDataCollection` | `services/data-collection` | 0.9 | monthly |
| `services/data-annotation` | `dataAnnotation` | `services` | 0.9 | monthly |
| `services/rlhf-sft-data` | `rlhfSftData` | `services` | 0.8 | monthly |

The URL stays one level under `/services` for every page, matching the existing
service pages. `services/egocentric-data-collection` declares
`services/data-collection` as its `parent`, so the breadcrumb trail reads Home →
Services → Data collection → Egocentric and exocentric capture without a third
URL segment. This works because `breadcrumbTrail()` resolves `parent` by calling
`findRoute()` on it, so the value is any route's full path and need not be the
slug prefix.

## Page content

Each page uses the standard content namespace shape: `navLabel`, `title`,
`metaTitle`, `metaDescription`, `lede`, `sections[{heading, body, bullets?}]`,
`faq[{question, answer}]`, `cta{title, body, button}`.

### `services/ai-training-data` — hub

Carries the positioning. Argument: AI projects fail on data, not on model
choice; the model is a commodity and the dataset is not.

Sections:

1. **Why AI projects stall on data** — a model is a few lines of configuration;
   a dataset that matches the deployment distribution is months of work.
2. **What we do** — four capabilities, each linking to its page: collection,
   ego/exo capture, annotation, LLM post-training data.
3. **The same team trains the model** — the positioning stated plainly, with
   links to `services/ai-implementation` and `services/llm-integration`.
4. **How we keep quality measurable** — gold sets seeded into every batch,
   multi-pass review, inter-annotator agreement as a reported number, automated
   pre-labelling with human correction rather than human-from-scratch.
5. **Security and access** — NDA coverage, per-project access control,
   environment separation, deletion on completion.

FAQ: minimum engagement size, how a pilot batch works, who owns the data and
the derived labels, what happens to disputed labels.

### `services/data-collection`

Collection to a written spec: video, image, audio and speech, document, and
scripted scenario capture.

Sections:

1. **Collection to spec** — the spec is the deliverable that matters; ambiguity
   in it is what produces unusable data.
2. **Consent and provenance** — every person appearing in collected media signs
   a release; the chain of custody is documented per item. This is the section
   that decides whether an enterprise buyer proceeds.
3. **Where our coverage is genuinely different** — Southeast Asian scenes,
   faces, and languages, and the operating environments that go with them.
4. **Delivery** — formats, metadata schema, and matching the client's existing
   training pipeline rather than exporting into it.

FAQ: how consent is evidenced, whether minors are ever captured, data
residency, redelivery when the spec changes mid-collection.

### `services/egocentric-data-collection` — the differentiating page

The narrowest and least contested search surface available to this business.
Written to be found on long-tail queries around egocentric capture, exocentric
multi-view capture, and robot demonstration data.

Sections:

1. **Egocentric and exocentric, captured together** — first-person head-mounted
   capture alongside external multi-view, timecode-synchronised.
2. **Why paired ego-exo data is worth more** — the exocentric view supplies the
   ground truth that the egocentric view cannot see, which is what makes the
   pair trainable rather than merely watchable.
3. **How a session runs** — calibration, activity scripting, operator briefing,
   in-session quality checks, and same-day review before the crew stands down.
4. **Teleoperation demonstrations** — supported when the client supplies the
   rig; the operator training and session discipline is ours.
5. **What you receive** — synchronised video, calibration and pose metadata,
   session logs, and annotation on the same footage when wanted.

Uses the field's actual vocabulary — Ego4D, EgoExo4D, EgoDex, VLA models,
demonstration count per task — because that is what the queries contain. Every
term used describes a public dataset or an established concept, not a claimed
association.

FAQ: how many hours a crew can capture per day, whether a custom rig can be
built, how ego data consent differs from ordinary video, delivery latency.

### `services/data-annotation`

Coverage breadth, stated as a table of capability rather than prose.

Sections:

1. **Image and video** — 2D bounding boxes, polygons, semantic and instance
   segmentation, keypoints and pose, video object tracking across frames.
2. **3D and sensor** — point cloud annotation, LiDAR-camera sensor fusion,
   cuboid tracking through sequences.
3. **Document and text** — OCR and document structure, named entity
   recognition, text classification, intent labelling.
4. **Audio** — transcription, speaker diarisation, event and acoustic labelling.
5. **Tooling** — CVAT and Label Studio in-house, or the client's own platform;
   the workforce adapts to the tool rather than forcing a migration.
6. **Scaling a team onto a project** — the ramp: pilot batch, guideline
   iteration against real disagreements, then headcount.

FAQ: accuracy targets and how they are measured, what happens when guidelines
turn out to be ambiguous, how rework is priced, throughput at steady state.

### `services/rlhf-sft-data`

LLM post-training data, the bridge from this cluster back into
`services/llm-integration`.

Sections:

1. **SFT demonstrations** — written by people who can do the task, not people
   paraphrasing what the task looks like.
2. **Preference ranking** — pairwise comparison against a written rubric, with
   the rubric treated as a versioned artefact.
3. **Rubric-based evaluation** — model output scored consistently enough that a
   change is measurable.
4. **Red teaming** — adversarial prompting against the deployed behaviour.
5. **Vietnamese and English** — genuinely bilingual annotators rather than
   translated English guidelines, which is where most bilingual programmes
   fail.

FAQ: how annotator disagreement is resolved, whether domain experts can be
sourced, how this connects to the fine-tuning work on the LLM integration page.

## Wiring

- **`lib/routes.ts`** — five `RouteDef` entries appended to `TECH_ROUTES`.
- **`lib/sites.ts`** — `services/ai-training-data` added to the tech site's
  `nav` (header goes from four items to five) and to `footerServices`.
- **`messages/en.json` and `messages/vi.json`** — five page namespaces under
  `pages`, one new entry in `services.items`, and nav labels. Both catalogs must
  carry identical key structure; `tests/messages/parity.test.ts` enforces it.
- **`lib/site.ts`** — `SITE_KEYWORDS` extended with the cluster's terms in both
  locales.

The new `services.items` entry flows into the schema.org `hasOfferCatalog` on
the tech site's `ProfessionalService` node automatically, because
`organizationSchema()` builds the catalog from that list. No change to
`lib/structured-data.ts` is needed.

Untouched: `proxy.ts`, everything under `app/`, `enums/site.enum.ts`,
`lib/structured-data.ts`, `lib/sitemap.ts`, `lib/llms.ts`. Sitemap, breadcrumbs,
and `llms.txt` all read the route registry, so they pick the pages up without
edits.

## Honesty constraints

The copy states capability and method. It does not state anything unverified.

Specifically forbidden in this work:

- Any security certification claim — no ISO 27001, no SOC 2, no GDPR
  compliance assertion. The security section describes NDA coverage, access
  control, and environment separation, which are true, and stops there.
- Any accuracy percentage, throughput number, annotator headcount, or captured
  hours figure.
- Any named client, logo, or case study.
- Any claim of association with Ego4D, EgoExo4D, EgoDex, or their publishers.
  Those are referenced as public datasets that define the vocabulary, nothing
  more.

These go into `docs/CONTENT-TODO.md` as a new section, each item saying where it
goes and what it unlocks:

1. Real security certifications, if held — unlocks the enterprise security
   section and a compliance line in the hub FAQ.
2. Annotator headcount and measured throughput — unlocks concrete capacity
   claims on the annotation page.
3. Ego/exo equipment detail and hours captured to date — unlocks the strongest
   available proof on the differentiating page.
4. A real data project as a case study — worth more than the rest combined, per
   the existing note at the top of that file.
5. Languages supported beyond English and Vietnamese.

## Testing

- `tests/lib/routes.test.ts` — the five routes resolve; the egocentric page
  produces a four-level breadcrumb trail through `data-collection`.
- `tests/seo/metadata-routes.test.ts` — canonical and hreflang for all five
  paths, on the tech site only.
- `tests/seo/llms.test.ts` — all five appear in the tech site's `llms.txt`.
- `tests/messages/parity.test.ts` — passes unchanged, proving both catalogs
  gained the same keys.
- No new page component is added — every page renders through
  `components/content-page.tsx`, which is already covered — so the five pages
  need registry and SEO assertions rather than rendering tests.

## Out of scope

- A fifth vertical or any new hostname.
- Changes to the media, finance, or academy sites.
- Pricing pages or public rate cards.
- A separate annotation-platform product.
