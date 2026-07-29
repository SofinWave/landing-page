# Orkestrators case study — design

**Date:** 2026-07-29
**Scope:** Add a real case study (Orkestrators, built with ArtinLeap) to the tech
site's home page, replacing one of the two fabricated placeholders.

## Why

`docs/CONTENT-TODO.md` item #1 names the two current case studies — "Acme Corp"
and "Globex" — as invented, along with every number attached to them. Buyers of
outsourcing read case studies more carefully than any other page, and answer
engines quote concrete figures over adjectives. One real case study outweighs
two fabricated ones.

## Decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Placeholder handling | Keep **Acme Corp**, replace **Globex** | Two cards keep the `lg:grid-cols-2` layout balanced. Acme (platform re-architecture) contrasts with an agentic-AI build; Globex (integration layer) overlaps with it. |
| Card title (`client`) | `Orkestrators` | The project is the recognisable name. ArtinLeap is named in the problem/solution copy instead. |
| Ordering | Orkestrators first | The real case study leads. |
| Metrics | Autonomous completion · Time to production · Manual work | See below. |

## Metric selection

The results row is a hard `grid-cols-3` (`case-studies.tsx:67`), so each case
study shows **exactly three** metrics. The three chosen answer three different
buyer questions, with no overlap:

1. **Autonomous completion rate** — the share of tasks the agents finish
   end-to-end with no human intervention. This is the defining metric of an
   agentic system; it separates a shipped product from a chatbot demo.
2. **Time to production** — weeks from kickoff to the first agent running on
   real traffic. This is the metric that evidences the value of consulting from
   day zero, which is what the engagement actually was.
3. **Manual work reduction** — what the client got back. Expressed as a
   percentage drop in human handling.

Considered and rejected: agent/workflow count in production (vanity without a
success rate beside it), eval pass rate (strong signal, opaque to non-technical
buyers), p95 latency (only worth a slot if real-time is the selling point),
token cost per run (dates quickly).

### Rendering note

`parseMetric()` animates any value that begins with an optional non-digit prefix
followed by a number (`-70%`, `92%`, `10 weeks` all animate). Values with no
leading number (`Real-time`) render as raw text. All three chosen metrics carry
numbers, so all three animate.

## Files to change

| File | Change |
| --- | --- |
| `messages/en.json` → `caseStudies.items` | Drop the Globex entry; add Orkestrators at index 0. |
| `messages/vi.json` → `caseStudies.items` | Same, translated. Key structure must stay identical — `tests/messages/parity.test.ts` enforces it. |
| `messages/zh.json` → `caseStudies.items` | Same again. `zh` is a live locale (`LocaleSupport.ZH`), and the parity test compares only key paths and array lengths — it would not have caught a stale Chinese catalog still advertising Globex. |
| `tests/sections/case-studies.test.tsx` | Assert the Orkestrators card and its three metric labels render. Rework the non-numeric-metric regression test (below). |

No other file references `caseStudies`. The section feeds no JSON-LD, sitemap,
or `llms.txt` output, so this is a pure content change.

## Test rework

`tests/sections/case-studies.test.tsx` currently proves that a non-numeric
metric value renders as raw text (no trailing `CountUp` zero) by asserting on
Globex's literal `"Real-time"`. Deleting Globex removes that fixture, and none
of the Orkestrators metrics is non-numeric.

Rather than bend the content to fit the test, the regression test will render
`CaseStudies` against a small inline messages object containing one non-numeric
metric. That keeps the `parseMetric` regression covered while decoupling it from
whatever copy the site happens to ship.

## Shipped values, and where they came from

| Field | Value | Source |
| --- | --- | --- |
| Autonomous completion | `92%` | Confirmed by the site owner |
| Time to production | `10 weeks` | Confirmed by the site owner |
| Manual work | `-70%` | Confirmed by the site owner |
| Problem / Solution | see catalogs | Drafted from the owner's description of the engagement — agentic AI systems, advised from day zero — with no business specifics invented |
| Tags | `Agentic AI`, `LLM Orchestration`, `Architecture` | Drafted, same basis |

The three figures were first written as format illustrations in a preview and
then confirmed for publication by the owner; they are not measurements this
repository can verify. The prose is a draft standing in for detail only
ArtinLeap and SofinWave hold — replacing it with the specific problem
Orkestrators solves would make the card considerably stronger.

## Left alone deliberately

`testimonials.items` still carries "John Smith, Head of Engineering, Globex" —
a quote attributed to a company that no longer appears anywhere else on the
site. That is `CONTENT-TODO.md` item #2 and outside this change's scope, but the
inconsistency is now visible and worth closing.
