# AI Training Data Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five pages to the tech site selling SofinWave's data collection and
annotation capability, positioned as "the same team captures, labels, fine-tunes,
and ships."

**Architecture:** Pure content-and-registry work. Every page renders through the
existing `components/content-page.tsx` shell, so the only code changes are five
route registry entries, navigation wiring, one icon, and one test improvement.
The existing test suite is parameterised over the route registry, which means
adding a route turns the suite red until that route's copy exists in **both**
message catalogs. That is the red-green cycle for tasks 1–5: add the route, watch
it fail naming the missing key, write the copy, watch it pass.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, next-intl,
Vitest + jsdom, pnpm, Biome (format) + ESLint (lint).

## Global Constraints

Every task's requirements implicitly include this section.

- **Package manager is pnpm.** Never `npm` or `yarn`, despite the stray lockfiles.
- **Branch is `feature/data-annotation-services`.** Never commit to `develop`.
- **Both catalogs, always.** `messages/en.json` and `messages/vi.json` must gain
  identical key structure. `tests/messages/parity.test.ts` enforces it.
- **Vietnamese is an adaptation, not a translation.** Write it as a Vietnamese
  copywriter would, keeping technical English terms that the industry uses
  untranslated (`egocentric`, `bounding box`, `point cloud`, `RLHF`, `SFT`,
  `LiDAR`, `fine-tune`). Never machine-translate a heading into something no
  practitioner says.
- **`metaDescription` must be under 300 characters.** Asserted by
  `tests/lib/routes.test.ts`.
- **Formatting is Biome, not ESLint.** 2-space indent, 100 columns, double
  quotes, semicolons, trailing commas. Run `pnpm format` before committing.
- **Conventional Commits.** Never add `Co-Authored-By`, `Generated with`, or any
  attribution line to a commit message.

### Forbidden claims — copied verbatim from the spec

These must not appear in any copy written by this plan:

- Any security certification claim — **no ISO 27001, no SOC 2, no GDPR
  compliance assertion.** Security copy describes NDA coverage, access control,
  and environment separation, which are true, and stops there.
- Any accuracy percentage, throughput number, annotator headcount, or
  captured-hours figure.
- Any named client, logo, or case study.
- Any claim of association with Ego4D, EgoExo4D, EgoDex, or their publishers.
  They are referenced as public datasets that define the vocabulary, nothing
  more.

### Voice

Match the existing service pages. Read `pages.aiImplementation` in
`messages/en.json` before writing a word. The register is: declarative, concrete,
willing to name what goes wrong, no superlatives, no "we are proud to", no
exclamation marks. Sentences make a claim and then qualify it. Prefer "we build"
over "we deliver world-class".

### Spec deviations recorded here

The spec listed everything under `app/` as untouched. Task 6 adds one icon to
`app/[site]/[locale]/(public)/home/_components/services.tsx`, because the home
page service grid maps `icon` strings through a fixed `ICONS` record and there is
no data-shaped icon in it. This is a two-line addition, not a redesign.

---

## File Structure

| File | Responsibility | Tasks |
| --- | --- | --- |
| `lib/routes.ts` | Five new `RouteDef` entries in `TECH_ROUTES` | 1–5 |
| `messages/en.json` | English copy for five pages, services card, subtitle | 1–6 |
| `messages/vi.json` | Vietnamese copy, identical key structure | 1–6 |
| `lib/sites.ts` | Header nav and footer services links | 6 |
| `lib/site.ts` | `SITE_KEYWORDS` for both locales | 6 |
| `app/.../home/_components/services.tsx` | One added icon mapping | 6 |
| `tests/lib/routes.test.ts` | Breadcrumb assertion for the nested page | 3 |
| `tests/sections/services.test.tsx` | New service card renders | 6 |
| `tests/messages/parity.test.ts` | Array-length parity (new capability) | 7 |
| `docs/CONTENT-TODO.md` | The facts that unlock stronger copy | 7 |

## Shared content shape

Every page object added by tasks 1–5 has exactly this shape. `bullets` is
optional per section; `sections`, `faq`, and every `bullets` array must have the
**same length in both locales**.

```json
{
  "navLabel": "",
  "title": "",
  "metaTitle": "",
  "metaDescription": "",
  "lede": "",
  "sections": [{ "heading": "", "body": "", "bullets": [""] }],
  "faq": [{ "question": "", "answer": "" }],
  "cta": { "title": "", "body": "", "button": "" }
}
```

Insert each new page object into the `pages` namespace at the **same position in
both files** — immediately after `aiAgents`, so the AI cluster stays contiguous.
Key order does not affect the parity test, but a consistent order keeps diffs
readable.

---

## Task 1: The AI training data hub page

**Files:**
- Modify: `lib/routes.ts` (append to `TECH_ROUTES`, before the `about` entry)
- Modify: `messages/en.json` (`pages.aiTrainingData`)
- Modify: `messages/vi.json` (`pages.aiTrainingData`)

**Interfaces:**
- Consumes: `RouteDef` from `lib/routes.ts` — `{ path, key, parent?, priority, changeFrequency }`.
- Produces: route path `services/ai-training-data` and content key `aiTrainingData`.
  Task 3 links to this page; Task 6 puts it in the header nav and footer.

- [ ] **Step 1: Add the route entry**

In `lib/routes.ts`, inside `TECH_ROUTES`, immediately after the `services/ai-agents`
entry:

```ts
  {
    path: "services/ai-training-data",
    key: "aiTrainingData",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run tests/lib/routes.test.ts`

Expected: FAIL. The message names the missing key exactly:
`missing pages.aiTrainingData in en`.

- [ ] **Step 3: Write the English copy**

Add to `messages/en.json` under `pages`, after `aiAgents`:

```json
    "aiTrainingData": {
      "navLabel": "Training data",
      "title": "AI Training Data: Collection, Annotation, and Post-Training",
      "metaTitle": "AI Training Data Services — Collection & Annotation",
      "metaDescription": "Data collection, annotation, and LLM post-training data from Vietnam, run by the engineers who then fine-tune and ship the model. Egocentric and exocentric capture included.",
      "lede": "The model is the cheap part. A model is a few lines of configuration and a bill; the dataset it learns from is months of work by people who understand the task, and that is where most AI projects actually stall. We collect data to your specification, label it, and — because building AI systems is our main business — we are the people who later have to train on it. That changes how the specification gets written.",
      "sections": [
        {
          "heading": "Why AI projects stall on data rather than models",
          "body": "Teams arrive with a model choice already made and a dataset problem they have not named yet. The pattern is consistent.",
          "bullets": [
            "The labelling guidelines were written before anyone had seen the hard cases, so the hard cases are labelled inconsistently.",
            "The collected data matches the demo environment rather than the deployment environment.",
            "Nobody measured agreement between annotators, so nobody knows whether the labels mean anything.",
            "The dataset covers the common case thoroughly and the failure case not at all, which is the reverse of what training needs.",
            "The format has to be rewritten before it can enter the training pipeline, and the rewrite loses information."
          ]
        },
        {
          "heading": "What we do",
          "body": "Four capabilities, sold separately or as one programme.",
          "bullets": [
            "Data collection to a written specification — video, image, audio, document, and scripted scenarios.",
            "Egocentric and exocentric capture for robotics and embodied AI, recorded as synchronised pairs.",
            "Annotation across image, video, 3D point cloud, document, and audio.",
            "LLM post-training data: supervised fine-tuning demonstrations, preference ranking, and evaluation."
          ]
        },
        {
          "heading": "The team that labels it also trains on it",
          "body": "Most annotation vendors hand over a dataset and never learn whether it worked. We build AI systems as our main business, which means a dataset we produce is one we may have to fine-tune on, evaluate, and defend in production. That is not a marketing distinction — it decides what goes into the labelling guidelines, because the person writing them knows which ambiguities will surface later as model failures."
        },
        {
          "heading": "How we keep quality measurable",
          "body": "Quality claims are worth nothing without a measurement behind them, so we instrument the work rather than asserting the outcome.",
          "bullets": [
            "Gold-standard items seeded into every batch, scored continuously rather than audited at the end.",
            "Multi-pass review, with the second pass blind to the first.",
            "Inter-annotator agreement reported as a number, not a claim.",
            "Automated pre-labelling where a model can do the first pass, with people correcting rather than starting from nothing.",
            "Guidelines versioned like code, because a guideline change silently invalidates everything labelled before it."
          ]
        },
        {
          "heading": "Security and access",
          "body": "What we can state plainly, we state; what we cannot, we leave out.",
          "bullets": [
            "Every person touching your data is covered by an NDA before they see any of it.",
            "Access is granted per project, not per employee, and revoked when the project ends.",
            "Client data stays in an environment separated from our other work.",
            "Data is deleted on completion, on a schedule agreed in the contract."
          ]
        }
      ],
      "faq": [
        {
          "question": "What is the smallest project you take?",
          "answer": "A pilot batch. It is the right first step regardless of eventual size, because it is the only way to find out whether the guidelines survive contact with real data."
        },
        {
          "question": "How does a pilot batch work?",
          "answer": "You send a representative sample and an acceptance criterion. We label it, report the disagreements we hit, and rewrite the guidelines against them. The disagreements are the point — a pilot that produces none was too easy to be informative."
        },
        {
          "question": "Who owns the data and the labels?",
          "answer": "You do, including anything derived from them. We retain nothing after the agreed deletion date, and we never reuse client data to build datasets of our own."
        },
        {
          "question": "What happens when annotators disagree?",
          "answer": "Disagreement is escalated, not averaged. A senior reviewer adjudicates, and the resolution goes back into the guidelines so the same case is not decided twice."
        },
        {
          "question": "Do you work in languages other than English and Vietnamese?",
          "answer": "Talk to us about the language and the volume. We would rather tell you we cannot staff it than staff it badly."
        }
      ],
      "cta": {
        "title": "Start with a pilot batch",
        "body": "Send a sample and what you need it to become. We will tell you what the specification is missing.",
        "button": "Get in touch"
      }
    },
```

- [ ] **Step 4: Write the Vietnamese copy**

Add to `messages/vi.json` at the matching position, with these exact headings and
FAQ questions. Bodies and bullets are written fresh in Vietnamese, one-for-one
with the English array lengths (5 sections, bullet counts 5/4/0/5/4, 5 FAQ items).

- `navLabel`: `"Dữ liệu huấn luyện"`
- `title`: `"Dữ liệu huấn luyện AI: thu thập, gán nhãn và post-training"`
- Section headings, in order:
  1. `"Vì sao dự án AI tắc ở dữ liệu chứ không ở model"`
  2. `"Chúng tôi làm gì"`
  3. `"Đội gán nhãn cũng là đội huấn luyện model"`
  4. `"Chất lượng phải đo được"`
  5. `"Bảo mật và quyền truy cập"`
- FAQ questions, in order:
  1. `"Dự án nhỏ nhất các bạn nhận là bao nhiêu?"`
  2. `"Pilot batch chạy như thế nào?"`
  3. `"Dữ liệu và nhãn thuộc về ai?"`
  4. `"Khi annotator bất đồng thì xử lý ra sao?"`
  5. `"Các bạn có làm ngôn ngữ khác ngoài tiếng Anh và tiếng Việt không?"`
- `cta`: title `"Bắt đầu bằng một pilot batch"`, button `"Liên hệ"`

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run tests/lib/routes.test.ts tests/messages/parity.test.ts tests/seo`

Expected: PASS. Sitemap, hreflang, and `llms.txt` coverage for the new page comes
from the registry-driven suites without any new assertions.

- [ ] **Step 6: Format and commit**

```bash
pnpm format
git add lib/routes.ts messages/en.json messages/vi.json
git commit -m "feat(content): add the AI training data hub page"
```

---

## Task 2: The data collection page

**Files:**
- Modify: `lib/routes.ts`
- Modify: `messages/en.json` (`pages.dataCollection`)
- Modify: `messages/vi.json` (`pages.dataCollection`)

**Interfaces:**
- Consumes: `RouteDef` from `lib/routes.ts`.
- Produces: route path `services/data-collection` and content key `dataCollection`.
  **Task 3 declares this path as its `parent` and will fail without it.**

- [ ] **Step 1: Add the route entry**

In `lib/routes.ts`, after the `services/ai-training-data` entry:

```ts
  {
    path: "services/data-collection",
    key: "dataCollection",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run tests/lib/routes.test.ts`

Expected: FAIL with `missing pages.dataCollection in en`.

- [ ] **Step 3: Write the English copy**

Key `dataCollection`. Structure: 4 sections, 4 FAQ items.

- `navLabel`: `"Data collection"`
- `title`: `"Data Collection for AI Training"`
- `metaTitle`: `"AI Data Collection Services — Video, Image, Audio, Document"`
- `metaDescription`: one sentence, under 300 characters, naming video, image,
  audio, and scripted scenario collection, Vietnam, and documented consent.
- `lede`: 3–4 sentences. Argument: the deliverable that decides success is the
  specification, not the footage; ambiguity in the spec is what produces data
  that is technically correct and practically useless.
- Sections, with these exact headings:
  1. `"Collection to a written specification"` — body plus 4–5 bullets covering
     video, still image, audio and speech, document capture, and scripted
     scenarios. Each bullet says what varies and therefore must be pinned down
     (lighting, angle, distance, background noise, speaker demographics).
  2. `"Consent and provenance"` — body plus 4 bullets. This is the section that
     decides whether an enterprise buyer proceeds, so it is the most concrete on
     the page: every person appearing in collected media signs a release; the
     release is filed against the item, not the batch; chain of custody is
     documented per item; anything that cannot be evidenced is not delivered.
     **No certification claims.**
  3. `"Where our coverage is genuinely different"` — body, no bullets. Southeast
     Asian scenes, faces, languages, and operating environments that
     Western-collected datasets underrepresent. State it as a coverage fact, not
     as a price argument.
  4. `"Delivery"` — body plus 3–4 bullets: formats, metadata schema, matching the
     client's existing training pipeline rather than exporting into it, and a
     rejected-item report rather than silent substitution.
- FAQ questions, verbatim:
  1. `"How is consent evidenced?"`
  2. `"Do you capture minors?"`
  3. `"Where is the data stored during collection?"`
  4. `"What happens if the specification changes mid-collection?"`
- `cta`: title `"Tell us what you need captured"`, button `"Get in touch"`

- [ ] **Step 4: Write the Vietnamese copy**

Same key, same array lengths. Headings, in order:

1. `"Thu thập theo đặc tả viết ra giấy"`
2. `"Consent và nguồn gốc dữ liệu"`
3. `"Vùng phủ mà chúng tôi thực sự khác biệt"`
4. `"Bàn giao"`

FAQ questions, in order:

1. `"Consent được chứng minh bằng gì?"`
2. `"Các bạn có thu dữ liệu của trẻ em không?"`
3. `"Dữ liệu được lưu ở đâu trong lúc thu thập?"`
4. `"Nếu đặc tả thay đổi giữa chừng thì sao?"`

`cta` title: `"Cho chúng tôi biết bạn cần thu gì"`, button `"Liên hệ"`

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run tests/lib/routes.test.ts tests/messages/parity.test.ts tests/seo`

Expected: PASS.

- [ ] **Step 6: Format and commit**

```bash
pnpm format
git add lib/routes.ts messages/en.json messages/vi.json
git commit -m "feat(content): add the data collection service page"
```

---

## Task 3: The egocentric and exocentric capture page

This is the page the whole cluster exists to rank. It is the narrowest and least
contested search surface available to this business, and it is the only page here
describing a capability that competing Vietnamese vendors do not have.

**Files:**
- Modify: `lib/routes.ts`
- Modify: `messages/en.json` (`pages.egocentricDataCollection`)
- Modify: `messages/vi.json` (`pages.egocentricDataCollection`)
- Test: `tests/lib/routes.test.ts` (one added assertion)

**Interfaces:**
- Consumes: route path `services/data-collection` from Task 2, used as `parent`.
- Produces: route path `services/egocentric-data-collection`, content key
  `egocentricDataCollection`.

- [ ] **Step 1: Write the failing breadcrumb test**

In `tests/lib/routes.test.ts`, inside the existing `describe("breadcrumbTrail")`
block, after the `"walks the full ancestor chain root-first"` test:

```ts
  it("follows a parent that is not the path prefix", () => {
    expect(
      breadcrumbTrail(SiteId.Tech, "services/egocentric-data-collection").map((r) => r.path),
    ).toEqual([
      HOME_PATH,
      "services",
      "services/data-collection",
      "services/egocentric-data-collection",
    ]);
  });
```

This asserts the one non-obvious thing in the whole plan: `breadcrumbTrail()`
resolves `parent` by calling `findRoute()` on it, so a route's parent can be any
route's full path and need not be its slug prefix. The page sits one level deep in
the URL and three levels deep in the breadcrumb.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/lib/routes.test.ts -t "follows a parent"`

Expected: FAIL. The trail is empty, so the assertion reports `[]` against the
four expected paths.

- [ ] **Step 3: Add the route entry**

In `lib/routes.ts`, after the `services/data-collection` entry:

```ts
  {
    path: "services/egocentric-data-collection",
    key: "egocentricDataCollection",
    parent: "services/data-collection",
    priority: 0.9,
    changeFrequency: "monthly",
  },
```

- [ ] **Step 4: Run the test to verify the breadcrumb passes**

Run: `pnpm exec vitest run tests/lib/routes.test.ts -t "follows a parent"`

Expected: PASS. The content tests in the same file still fail with
`missing pages.egocentricDataCollection in en` — that is the next step.

- [ ] **Step 5: Write the English copy**

Key `egocentricDataCollection`. Structure: 5 sections, 4 FAQ items.

Use the field's real vocabulary, because that is what the queries contain:
egocentric, exocentric, first-person, multi-view, timecode synchronisation,
calibration, teleoperation, demonstration, vision-language-action (VLA) models.
Ego4D, EgoExo4D, and EgoDex may be named **as public datasets that established
the vocabulary** — never as partners, customers, or affiliations.

- `navLabel`: `"Ego & exo capture"`
- `title`: `"Egocentric and Exocentric Data Collection"`
- `metaTitle`: `"Egocentric Data Collection Services — Ego & Exo Capture"`
- `metaDescription`: under 300 characters, naming egocentric first-person
  capture, synchronised exocentric multi-view, robotics and embodied AI, Vietnam.
- `lede`: 3–4 sentences. Argument: robot learning needs demonstrations of humans
  doing things, recorded from the viewpoint the robot will have and from a
  viewpoint that shows what that first viewpoint missed.
- Sections, with these exact headings:
  1. `"Egocentric and exocentric, captured together"` — body plus 4 bullets:
     head-mounted first-person capture; external multi-view rigs; timecode
     synchronisation across every stream; calibration recorded with the footage
     rather than reconstructed afterwards.
  2. `"Why the paired view is worth more than either alone"` — body, no bullets.
     The strongest argument on the page: the egocentric stream shows what the
     actor saw and the exocentric stream shows what the actor did, including the
     hands, objects, and body pose the head-mounted camera occludes. The pair is
     trainable; either alone is mostly watchable. Reference EgoExo4D here as the
     public dataset that made this pairing standard practice.
  3. `"How a session runs"` — body plus 5 bullets: calibration before the first
     take; activity scripting so takes are comparable; operator briefing;
     in-session quality checks rather than end-of-day discovery; same-day review
     before the crew stands down, because a reshoot is cheap on day one and
     impossible on day thirty.
  4. `"Teleoperation demonstrations"` — body, no bullets. Supported when the
     client supplies the rig; the operator training, session discipline, and
     take-level quality control are ours. Note honestly that demonstration counts
     per manipulation task run into the hundreds, so throughput planning matters
     more than per-take polish.
  5. `"What you receive"` — body plus 4 bullets: synchronised video per stream;
     calibration and pose metadata; per-session logs tying takes to script steps;
     annotation on the same footage when wanted, which is where this page hands
     off to the annotation page.
- FAQ questions, verbatim:
  1. `"How much footage can a crew capture in a day?"`
  2. `"Can you build a custom rig for our task?"`
  3. `"How is consent different for egocentric data?"`
  4. `"Can you annotate the footage you capture?"`

  The consent answer matters most: egocentric capture records private
  environments and bystanders, so releases cover everyone in frame, not only the
  wearer, and locations where bystander consent cannot be obtained are not shot.
- `cta`: title `"Talk to us about a capture programme"`, button `"Get in touch"`

- [ ] **Step 6: Write the Vietnamese copy**

Same key, same array lengths (5 sections, bullet counts 4/0/5/0/4, 4 FAQ items).
Keep `egocentric`, `exocentric`, `timecode`, `calibration`, `teleoperation`,
`VLA` in English — Vietnamese practitioners use them untranslated.

Headings, in order:

1. `"Thu ego và exo cùng lúc"`
2. `"Vì sao cặp ego-exo có giá trị hơn từng cái riêng lẻ"`
3. `"Một buổi thu diễn ra thế nào"`
4. `"Teleoperation demonstration"`
5. `"Bạn nhận được gì"`

FAQ questions, in order:

1. `"Một ekip thu được bao nhiêu giờ mỗi ngày?"`
2. `"Các bạn có dựng rig riêng cho bài toán của chúng tôi được không?"`
3. `"Consent cho dữ liệu egocentric khác gì so với video thường?"`
4. `"Các bạn có gán nhãn luôn phần dữ liệu đã thu không?"`

`cta` title: `"Trao đổi về một chương trình thu dữ liệu"`, button `"Liên hệ"`

- [ ] **Step 7: Run the full suite to verify it passes**

Run: `pnpm exec vitest run tests/lib/routes.test.ts tests/messages/parity.test.ts tests/seo`

Expected: PASS, including the new breadcrumb assertion.

- [ ] **Step 8: Format and commit**

```bash
pnpm format
git add lib/routes.ts messages/en.json messages/vi.json tests/lib/routes.test.ts
git commit -m "feat(content): add the egocentric and exocentric capture page"
```

---

## Task 4: The data annotation page

**Files:**
- Modify: `lib/routes.ts`
- Modify: `messages/en.json` (`pages.dataAnnotation`)
- Modify: `messages/vi.json` (`pages.dataAnnotation`)

**Interfaces:**
- Consumes: `RouteDef` from `lib/routes.ts`.
- Produces: route path `services/data-annotation`, content key `dataAnnotation`.

- [ ] **Step 1: Add the route entry**

In `lib/routes.ts`, after the `services/egocentric-data-collection` entry:

```ts
  {
    path: "services/data-annotation",
    key: "dataAnnotation",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run tests/lib/routes.test.ts`

Expected: FAIL with `missing pages.dataAnnotation in en`.

- [ ] **Step 3: Write the English copy**

Key `dataAnnotation`. Structure: 6 sections, 4 FAQ items. This page is a coverage
page: its job is to be found for a specific annotation type and then answer that
query completely, so the bullets carry the search surface and should name the
technique rather than describe it vaguely.

- `navLabel`: `"Annotation"`
- `title`: `"Data Annotation and Labelling Services"`
- `metaTitle`: `"Data Annotation Services — Image, Video, 3D, Text, Audio"`
- `metaDescription`: under 300 characters, naming image, video, 3D point cloud,
  document, and audio annotation from Vietnam.
- `lede`: 3–4 sentences. Argument: labelling is not data entry; the difficulty is
  concentrated in the ambiguous cases, and a vendor's real quality is what it does
  when the guideline does not cover what is on screen.
- Sections, with these exact headings:
  1. `"Image and video"` — 5 bullets: 2D bounding boxes; polygons; semantic and
     instance segmentation; keypoints and pose; object tracking across frames
     with identity preserved through occlusion.
  2. `"3D and sensor data"` — 3 bullets: point cloud annotation; LiDAR-camera
     sensor fusion; cuboid tracking through sequences.
  3. `"Document and text"` — 4 bullets: OCR and document structure; named entity
     recognition; text classification; intent and utterance labelling.
  4. `"Audio"` — 3 bullets: transcription; speaker diarisation; acoustic event
     labelling.
  5. `"Tooling"` — body, no bullets. CVAT and Label Studio in-house, or the
     client's own platform. State the position plainly: the workforce adapts to
     the tool, because asking a client to migrate annotation platforms to buy
     labelling is a vendor's problem being charged to the customer.
  6. `"Putting a team on your project"` — body plus 4 bullets describing the ramp:
     pilot batch; guidelines rewritten against the disagreements the pilot
     surfaced; a small trained core; then headcount, with the core reviewing.
     Say why the order matters — scaling before the guidelines stabilise
     multiplies a labelling error instead of a labelling capacity.
- FAQ questions, verbatim:
  1. `"What accuracy do you target, and how is it measured?"`
  2. `"What happens when the guidelines turn out to be ambiguous?"`
  3. `"How is rework priced?"`
  4. `"Can you work inside our annotation platform?"`

  The accuracy answer must not invent a number. Describe the mechanism — the
  target is agreed per project against a gold set, and it is reported
  continuously rather than asserted up front.
- `cta`: title `"Send us a pilot batch"`, button `"Get in touch"`

- [ ] **Step 4: Write the Vietnamese copy**

Same key, same array lengths (6 sections, bullet counts 5/3/4/3/0/4, 4 FAQ items).
Keep `bounding box`, `polygon`, `segmentation`, `keypoint`, `point cloud`,
`LiDAR`, `OCR`, `NER`, `diarisation`, `CVAT`, `Label Studio` untranslated.

Headings, in order:

1. `"Hình ảnh và video"`
2. `"Dữ liệu 3D và cảm biến"`
3. `"Tài liệu và văn bản"`
4. `"Âm thanh"`
5. `"Công cụ"`
6. `"Đưa một đội vào dự án của bạn"`

FAQ questions, in order:

1. `"Các bạn cam kết độ chính xác bao nhiêu, và đo bằng cách nào?"`
2. `"Nếu guideline không bao được trường hợp thực tế thì sao?"`
3. `"Làm lại thì tính phí thế nào?"`
4. `"Các bạn làm trực tiếp trên platform của chúng tôi được không?"`

`cta` title: `"Gửi cho chúng tôi một pilot batch"`, button `"Liên hệ"`

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run tests/lib/routes.test.ts tests/messages/parity.test.ts tests/seo`

Expected: PASS.

- [ ] **Step 6: Format and commit**

```bash
pnpm format
git add lib/routes.ts messages/en.json messages/vi.json
git commit -m "feat(content): add the data annotation service page"
```

---

## Task 5: The RLHF and SFT data page

**Files:**
- Modify: `lib/routes.ts`
- Modify: `messages/en.json` (`pages.rlhfSftData`)
- Modify: `messages/vi.json` (`pages.rlhfSftData`)

**Interfaces:**
- Consumes: `RouteDef` from `lib/routes.ts`.
- Produces: route path `services/rlhf-sft-data`, content key `rlhfSftData`.

- [ ] **Step 1: Add the route entry**

In `lib/routes.ts`, after the `services/data-annotation` entry:

```ts
  {
    path: "services/rlhf-sft-data",
    key: "rlhfSftData",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run tests/lib/routes.test.ts`

Expected: FAIL with `missing pages.rlhfSftData in en`.

- [ ] **Step 3: Write the English copy**

Key `rlhfSftData`. Structure: 5 sections, 3 FAQ items. This page is the bridge
back into `services/llm-integration`; link to it in the final section.

- `navLabel`: `"RLHF & SFT data"`
- `title`: `"RLHF and SFT Data for LLM Post-Training"`
- `metaTitle`: `"RLHF & SFT Data Services — LLM Post-Training"`
- `metaDescription`: under 300 characters, naming SFT demonstrations, preference
  ranking, evaluation, red teaming, English and Vietnamese.
- `lede`: 3–4 sentences. Argument: post-training data is written, not labelled,
  and the quality ceiling is set by whether the writer can actually do the task
  being demonstrated.
- Sections, with these exact headings:
  1. `"Supervised fine-tuning demonstrations"` — body, no bullets. Written by
     people who can do the task, not people paraphrasing what a good answer looks
     like. Name the failure mode: demonstrations that are fluent and wrong teach
     a model to be fluent and wrong.
  2. `"Preference ranking"` — body plus 3 bullets: pairwise comparison against a
     written rubric; the rubric versioned as an artefact; disagreement rates
     tracked, because a rubric that produces no disagreement is usually not
     discriminating.
  3. `"Rubric-based evaluation"` — body, no bullets. Scoring consistent enough
     that a model change is a measurable event rather than an impression. Connect
     this to the evaluation argument already made on `services/ai-implementation`.
  4. `"Red teaming"` — body plus 3 bullets: adversarial prompting against
     deployed behaviour; findings written as reproducible cases; the cases folded
     into the evaluation set so a fix stays fixed.
  5. `"Vietnamese and English"` — body, no bullets. Genuinely bilingual
     annotators rather than English guidelines translated for annotators who then
     interpret them differently. Name this as where most bilingual programmes
     fail. Close by linking to `/services/llm-integration` for the fine-tuning
     and retrieval work these datasets feed.
- FAQ questions, verbatim:
  1. `"How do you resolve disagreement between annotators?"`
  2. `"Can you source domain experts?"`
  3. `"How does this connect to your LLM integration work?"`
- `cta`: title `"Talk to us about a post-training programme"`, button `"Get in touch"`

- [ ] **Step 4: Write the Vietnamese copy**

Same key, same array lengths (5 sections, bullet counts 0/3/0/3/0, 3 FAQ items).
Keep `SFT`, `RLHF`, `fine-tuning`, `preference ranking`, `red teaming`, `rubric`
untranslated.

Headings, in order:

1. `"Demonstration cho supervised fine-tuning"`
2. `"Preference ranking"`
3. `"Đánh giá theo rubric"`
4. `"Red teaming"`
5. `"Tiếng Việt và tiếng Anh"`

FAQ questions, in order:

1. `"Bất đồng giữa các annotator được giải quyết thế nào?"`
2. `"Các bạn tìm được chuyên gia theo lĩnh vực không?"`
3. `"Phần này nối với mảng tích hợp LLM của các bạn ra sao?"`

`cta` title: `"Trao đổi về một chương trình post-training"`, button `"Liên hệ"`

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run tests/lib/routes.test.ts tests/messages/parity.test.ts tests/seo`

Expected: PASS.

- [ ] **Step 6: Format and commit**

```bash
pnpm format
git add lib/routes.ts messages/en.json messages/vi.json
git commit -m "feat(content): add the RLHF and SFT data page"
```

---

## Task 6: Navigation, the home page service card, and keywords

Five pages that nothing links to are five pages nobody finds. This task makes the
cluster reachable and adds it to the tech site's schema.org offer catalog.

**Files:**
- Modify: `lib/sites.ts` (tech `nav` and `footerServices`)
- Modify: `app/[site]/[locale]/(public)/home/_components/services.tsx` (one icon)
- Modify: `messages/en.json` (`services.subtitle`, `services.items`)
- Modify: `messages/vi.json` (`services.subtitle`, `services.items`)
- Modify: `lib/site.ts` (`SITE_KEYWORDS`)
- Test: `tests/sections/services.test.tsx`

**Interfaces:**
- Consumes: route path `services/ai-training-data` and content key
  `aiTrainingData` from Task 1. The nav test asserts both the route and the
  content key exist, so this task cannot run before Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing test for the new service card**

In `tests/sections/services.test.tsx`, add to the existing test body:

```ts
    expect(screen.getByText("AI training data")).toBeInTheDocument();
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/sections/services.test.tsx`

Expected: FAIL with `Unable to find an element with the text: AI training data`.

- [ ] **Step 3: Add the icon mapping**

In `app/[site]/[locale]/(public)/home/_components/services.tsx`, add `Database` to
the lucide import and to the `ICONS` record:

```ts
import { Compass, Server, Code, Plug, Gauge, Shield, Database, type LucideIcon } from "lucide-react";
```

```ts
const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  server: Server,
  code: Code,
  plug: Plug,
  gauge: Gauge,
  shield: Shield,
  database: Database,
};
```

The record already falls back to `Compass` for an unknown key, so a missing
mapping would not crash — it would silently render the wrong icon, which is worse.

- [ ] **Step 4: Add the service card and fix the subtitle arithmetic**

The current `services.subtitle` in `messages/en.json` reads "Three team models and
three engineering services, across the full delivery lifecycle." A seventh card
makes that sentence false, so it must change in the same edit.

In `messages/en.json`:

```json
    "subtitle": "Team models and engineering services across the full delivery lifecycle, now including the data your models learn from.",
```

Append to `services.items`:

```json
      {
        "icon": "database",
        "title": "AI training data",
        "description": "Collection, annotation, and post-training data — labelled by the team that trains on it."
      }
```

In `messages/vi.json`, the matching subtitle and item:

```json
    "subtitle": "Các mô hình hợp tác và dịch vụ kỹ thuật xuyên suốt vòng đời dự án, nay có cả dữ liệu để model học.",
```

```json
      {
        "icon": "database",
        "title": "Dữ liệu huấn luyện AI",
        "description": "Thu thập, gán nhãn và dữ liệu post-training — do chính đội sau đó huấn luyện model làm."
      }
```

This entry also flows into the tech site's schema.org `hasOfferCatalog`, because
`components/structured-data.tsx` reads `services.items` and passes it to
`organizationSchema()`. No change to `lib/structured-data.ts` is needed.

- [ ] **Step 5: Add the navigation links**

In `lib/sites.ts`, in the `SiteId.Tech` config, add to `nav` after the
`aiImplementation` entry:

```ts
      { href: "/services/ai-training-data", key: "aiTrainingData" },
```

and to `footerServices`, after the `llmIntegration` entry:

```ts
      { href: "/services/ai-training-data", key: "aiTrainingData" },
```

The header goes from four items to five. The nav is `hidden md:flex` with
`gap-6`, and `aiTrainingData.navLabel` is `"Training data"` / `"Dữ liệu huấn
luyện"` — short enough to fit alongside the existing labels.

- [ ] **Step 6: Extend the keyword list**

In `lib/site.ts`, append to `SITE_KEYWORDS[LocaleSupport.EN]`:

```ts
    "AI training data services",
    "data annotation outsourcing",
    "egocentric data collection",
    "video annotation services",
    "3D point cloud annotation",
    "RLHF and SFT data",
```

and to `SITE_KEYWORDS[LocaleSupport.VI]`:

```ts
    "dịch vụ gán nhãn dữ liệu",
    "thu thập dữ liệu huấn luyện AI",
    "gán nhãn hình ảnh và video",
    "thu thập dữ liệu góc nhìn thứ nhất",
    "gán nhãn point cloud 3D",
    "dữ liệu RLHF và SFT",
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `pnpm exec vitest run`

Expected: PASS. `tests/lib/routes.test.ts` proves every nav link resolves to both
a route and a content key; `tests/sections/services.test.tsx` proves the card
renders.

- [ ] **Step 8: Format and commit**

```bash
pnpm format
git add lib/sites.ts lib/site.ts messages/en.json messages/vi.json \
  "app/[site]/[locale]/(public)/home/_components/services.tsx" \
  tests/sections/services.test.tsx
git commit -m "feat(nav): surface AI training data in navigation and on the home page"
```

---

## Task 7: Array-length parity, content TODOs, and full verification

**Files:**
- Modify: `tests/messages/parity.test.ts`
- Modify: `docs/CONTENT-TODO.md`

**Interfaces:**
- Consumes: all copy from Tasks 1–6.
- Produces: nothing.

- [ ] **Step 1: Write the failing array-length parity test**

`keyPaths()` in `tests/messages/parity.test.ts` stops at arrays — it returns the
path and does not recurse — so English with five `sections` and Vietnamese with
four currently passes. With ten new copy blocks in this change, that gap is worth
closing now.

Add to `tests/messages/parity.test.ts`:

```ts
function arrayLengths(obj: unknown, prefix = ""): Record<string, number> {
  if (Array.isArray(obj)) {
    return obj.reduce<Record<string, number>>(
      (acc, item, i) => Object.assign(acc, arrayLengths(item, `${prefix}[${i}]`)),
      { [prefix]: obj.length },
    );
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).reduce<Record<string, number>>(
      (acc, [k, v]) => Object.assign(acc, arrayLengths(v, prefix ? `${prefix}.${k}` : k)),
      {},
    );
  }
  return {};
}
```

and a second test inside the existing `describe`:

```ts
  it("en and vi have identical array lengths at every path", () => {
    expect(arrayLengths(en)).toEqual(arrayLengths(vi));
  });
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec vitest run tests/messages/parity.test.ts`

Expected: PASS if Tasks 1–6 kept the array lengths aligned. **If it fails, that
is a real defect in the copy, not a bad test** — the failure names the path, for
example `pages.dataAnnotation.sections[1].bullets`. Fix the catalog so both
locales carry the same number of bullets, then re-run.

- [ ] **Step 3: Record what the copy still needs**

Append a section to `docs/CONTENT-TODO.md`, matching that file's existing format —
each item says where it goes and what it unlocks:

```markdown
## 6. Facts the data services pages are missing

**Where:** `messages/en.json` and `messages/vi.json` → `pages.aiTrainingData`,
`pages.dataCollection`, `pages.egocentricDataCollection`, `pages.dataAnnotation`,
`pages.rlhfSftData`

The five data pages describe capability and method only. Everything below was
deliberately left out because it cannot be invented, and each unlocks something
concrete.

- **Security certifications, if held.** ISO 27001 or SOC 2 would replace the
  "Security and access" bullets on the hub page with a claim buyers filter on.
  Enterprise data buyers frequently screen vendors on this before reading
  anything else. Nothing is claimed today.
- **Annotator headcount and measured throughput.** Units per day at steady state
  and current team size would turn "Putting a team on your project" from process
  description into a capacity claim.
- **Measured accuracy against a gold set.** The annotation FAQ currently
  describes how accuracy is agreed and measured, and names no number.
- **Ego/exo equipment and hours captured to date.** Camera models, rig count, and
  hours already collected are the strongest available proof on
  `services/egocentric-data-collection`, which is the page with the least
  competition and therefore the most to gain.
- **One real data project as a case study.** Worth more than everything else in
  this list combined, for the reasons given at the top of this file.
- **Languages supported beyond English and Vietnamese.** The hub FAQ currently
  answers this by inviting the question rather than listing locales.
```

- [ ] **Step 4: Run the full verification suite**

Run each and confirm it passes before claiming completion:

```bash
pnpm exec vitest run
pnpm format:check
pnpm lint
pnpm build
```

`pnpm build` is the one that catches what the tests cannot: a page that renders
in jsdom but fails static generation. All five new routes must appear in the
build output as prerendered paths under both `/en` and `/vi`.

- [ ] **Step 5: Commit**

```bash
git add tests/messages/parity.test.ts docs/CONTENT-TODO.md
git commit -m "test(messages): assert array-length parity between catalogs

keyPaths stops at arrays, so a Vietnamese page with fewer sections or
bullets than its English counterpart passed unnoticed. Ten new copy blocks
made that worth closing."
```

- [ ] **Step 6: Push and open a draft PR**

Confirm with the user first — the project's git rules require explicit approval
before pushing or opening a PR.

```bash
git push -u origin feature/data-annotation-services
gh pr create --draft --base develop \
  --title "feat(content): add AI training data service pages" \
  --body "..."
```

The PR body must include a test plan listing the four commands from Step 4.

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: the five routes to Tasks
1–5 with the exact paths, keys, parents, and priorities from the spec's table;
the wiring section to Task 6; the honesty constraints to the Global Constraints
block and Task 7 Step 3; the testing section to the per-task verification steps
plus Task 7 Step 4. The spec's positioning appears in Task 1 Section 3 and is
restated in the Voice block.

**Deviation.** The spec said everything under `app/` was untouched. Task 6 adds
one lucide icon to the home page services component, recorded under "Spec
deviations" above. The spec also did not anticipate the `services.subtitle`
arithmetic problem — a seventh card falsifies "three team models and three
engineering services" — which Task 6 Step 4 fixes in both locales.

**Addition.** Task 7's array-length parity test is not in the spec. It closes a
real gap found while reading `tests/messages/parity.test.ts` and directly protects
the ten copy blocks this plan adds.

**Type consistency.** `RouteDef` fields (`path`, `key`, `parent`, `priority`,
`changeFrequency`) match `lib/routes.ts`. `NavLink` fields (`href`, `key`) match
`lib/sites.ts`. The `ServiceItem` type in the services component requires `icon`,
`title`, and `description`, all three supplied in Task 6. Content keys are spelled
identically in every task that references them: `aiTrainingData`,
`dataCollection`, `egocentricDataCollection`, `dataAnnotation`, `rlhfSftData`.
