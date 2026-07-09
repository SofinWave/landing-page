# SDD Progress — AI/Robotic Redesign

Plan: docs/superpowers/plans/2026-07-09-ai-robotic-redesign.md
Branch: feature/ai-robotic-redesign
Base (branch start): 6cc8342

## Tasks
- Task 1: Design tokens & utilities (globals.css) — complete (commits 6cc8342..8300304, review clean)
- Task 2: Shared motion hooks (lib/hooks.ts) — complete (commits 8300304..5d51747, review clean)
- Task 3: SectionLabel primitive — complete (commits 5d51747..0cf3080, review clean)
- Task 4: HudCard primitive — complete (commits 0cf3080..2ad0520, review clean)
- Task 5: CountUp primitive — complete (commits 2ad0520..6662fea; review found reduced-motion flash 99→0→99, FIXED in 6662fea via useState(0) + no force-zero; re-review clean)
- Task 6: Reveal primitive — complete (commits 6662fea..83584fd, review clean)
- Task 7: Backgrounds (GridBackdrop + NeuralField) — complete (commits 83584fd..5c0263a, review clean)
- Task 8: Section numbering — complete (commits 5c0263a..5a499fc, review clean)
- Task 8b (inserted): jsdom matchMedia + IntersectionObserver mocks in vitest.setup.ts (matchMedia→reduced-motion ON so components render final/static state) — complete (commit aeb8703, suite 41 green, lint clean). Unblocks all section-restyle tests.
- Task 9: Hero (neural constellation) — complete (commits aeb8703..37fd808, review clean)
- Task 10: SiteHeader (mono nav + status) — complete (commits 37fd808..14faf27, review clean; vi translation verified)
- Task 11: LogoStrip — complete (commits 14faf27..8b3585d, review clean)
- Task 12: Services (HudCard) — complete (commits 8b3585d..78f4158; Minor: dead `Card` import left — see findings)
- Task 13: Process (draw-on-scroll) — complete (commits 78f4158..67f09d5, review clean; Minor: unused `vi` import in process-line.test.tsx — cosmetic)
- Task 14: CaseStudies (CountUp) — complete (commits 67f09d5..8490dcc; review found parseMetric "Real-time0" bug + missing Reveal wrap, both FIXED in 8490dcc w/ regression test; re-review clean)
- Task 15: TechStack (terminal + typed text) — complete (commits 8490dcc..b6726cd, review clean)
- Task 16: Testimonials + Team — complete (commits b6726cd..667819e, review clean; dead Card import removed)
- Task 17: FAQ + Contact — complete (commits 667819e..afcdd4a, review clean)
- Task 18: Footer (status line) — complete (commits afcdd4a..4212c87, review clean; vi translation verified)
- Task 19: Full verification pass — complete (automated gates: format:check clean, lint clean, test 47/47, build OK — /en,/vi,/en/home,/vi/home + sitemap/robots/manifest). Manual browser visual pass still recommended (can't run headless here).

## Minor findings (for final review triage)
- T1 Minor: `pnpm lint` was not explicitly run for the CSS-only change (ESLint doesn't lint CSS; low risk). Covered by Task 19 full verification.
- T6 Minor: all `useReducedMotion` consumers (Reveal, CountUp, NeuralField, TypedText) render one frame with reduced=false before the hook's effect flips it — brief one-frame flash for reduced-motion users. Inherent to the SSR-safe hook; plan-mandated.
- T12 Minor: dead `Card` import left in services.tsx after Card→HudCard swap (Biome noUnusedImports disabled; ESLint doesn't flag → not caught by gates). WATCH for the same in T14 (case-studies) and T16 (testimonials/team). Batch-remove in final-review fix wave.
- T9 Minor: jsdom logs `HTMLCanvasElement.getContext not implemented` when hero.test renders NeuralField (guarded, harmless). Could suppress via a getContext stub in vitest.setup for pristine output — polish.
- T6 Minor: Reveal starts at `opacity-0`; with JS fully disabled, wrapped section content stays invisible (crawlers render JS so SEO ok; no-JS humans affected). Plan-mandated design — final review may want a no-JS fallback.

## Final whole-branch review (opus) — bf6a210
- Verdict: READY to merge. Gates green (format/lint/47 tests/build /en,/vi,/en/home,/vi/home). Reduced-motion contract complete across all consumers; hero stacking correct (bg absolute + content z-10); i18n parity intact (header.status, footer.status in both catalogs); accent tokens throughout; no correctness bugs; no hydration mismatches.
- Two dead-code cleanups FIXED in 8cf65f1 (services.tsx unused Card import; process-line.test.tsx unused vi import). Full suite green after.
- Accepted tradeoffs (non-blocking, not fixed): (a) one-frame reduced-motion flash inherent to SSR-safe useReducedMotion; (b) Reveal opacity-0 hides content for JS-disabled humans (crawlers run JS); (c) CountUp SSR/no-JS shows "0" for metrics — deliberate consequence of the reduced-motion-flash fix (useState(0)); (d) NeuralField "#22d3ee" hex fallback when --accent-from reads empty (pragmatic, token read first).
- Follow-up idea (cosmetic): Reveal placement inconsistent — grid-level in Services/CaseStudies vs card-level in Testimonials.

ALL TASKS COMPLETE. Branch feature/ai-robotic-redesign merge-ready at 8cf65f1.

## Notes
- pnpm is the package manager (not yarn, despite yarn.lock).
- Section components use next-intl `useTranslations` as SERVER components by design (established pattern from prior branch; do not "fix" to add "use client"). Only leaf components needing browser APIs are client.
- Bracket paths `app/[locale]/(public)/...` must be quoted in shell — prior haiku implementers created over-escaped duplicate dirs; avoid.
- SectionLabel renders `NN`, `/`, `NAME` as SEPARATE sibling spans, so `getByText("03 / PROCESS")` (full string) does NOT match — Task 8's test needs a matcher function or per-span assertions (Task 3 adapted the same way). 
- LINT GOTCHA: the repo's `react-hooks/set-state-in-effect` rule (error, via eslint-config-next) fires when a component calls setState *synchronously* in a useEffect body. Tasks 5 (CountUp: `setValue(to)`/`setValue(0)`) and 15 (TypedText: `setCount(lines.length)`) do this for the reduced-motion path — they will need a `// eslint-disable-next-line react-hooks/set-state-in-effect` on those lines (behavior-neutral, SSR-safe). setState inside rAF/setInterval/IO callbacks does NOT trip the rule.
