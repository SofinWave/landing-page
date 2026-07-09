# AI / Robotic Visual Redesign — Design Spec

Date: 2026-07-09
Status: Approved (design), pending implementation plan

## Goal

Give the kingnnt.org landing page a stronger **AI / robotic** identity while keeping the
trust and readability a B2B software-consulting audience expects. The base aesthetic is a
refined "modern AI product" look (Linear / Vercel / OpenAI family) with restrained
technical/robotic accents. This is a **full visual redesign** applied across every section,
built on a reusable token + primitive layer — not a one-off Hero treatment.

## Decisions (locked)

| Topic | Decision |
| --- | --- |
| Direction | AI-product (tasteful) as base + technical/robotic accents |
| Scope | Full redesign — new visual foundation applied to all sections |
| Light/Dark | **Dark-first**; light mode kept as a secondary "translation" (toggle stays) |
| Accent color | **Electric Cyan → Blue** gradient (`#22d3ee → #3b82f6`) |
| Hero | **Neural Constellation** — centered layout, canvas node network + grid floor |
| Motion | **Level B (moderate)** — ambient + scroll reveals + 3 signature moments; all gated by `prefers-reduced-motion` |
| Robotic motifs | mono `// LABEL` section labels, section numbering (`01 /`), corner-bracket cards, monospace count-up numbers, faint animated grid backdrop. (PCB/trace dividers deferred.) |
| Build approach | **Zero heavy dependencies** — CSS + one small vanilla `<canvas>` + IntersectionObserver + a self-written count-up hook. No framer-motion, no tsparticles, no WebGL. |

## Design Language / Tokens

Defined once in `app/globals.css` as CSS variables, consumed everywhere. No hardcoded hex in
components.

- **Background (dark)**: base `~#080b12`, elevated surfaces `~#0a0e17`; neutrals retuned to a
  cool (slightly blue-tinted) grey so the existing shadcn "neutral" base reads cooler in dark.
- **Accent**: `--accent-from: #22d3ee` (cyan), `--accent-to: #3b82f6` (blue), plus
  `--accent-glow` (translucent cyan) for glow/shadow. Gradient helpers `.text-gradient` and a
  gradient button/background utility.
- **Typography**: keep **Geist Sans** (headings/body). Use the already-loaded **Geist Mono**
  (`--font-geist-mono`) for all technical labels and numeric readouts.
- **Light mode**: same structure and accent, but glow opacity, grid opacity, and node-network
  brightness are strongly reduced; surfaces become light. Light mode is intentionally less
  "lit up" than dark — it must stay clean and legible, not try to reproduce the dark glow.
- **Focus/interaction**: focus rings and key hover states use the accent color.

## Reusable Primitives (new components)

Small, single-purpose, independently testable. Server components unless they need browser APIs.

- `components/section-label.tsx` — renders the mono section label + number, e.g.
  `01 / SERVICES` and/or `// PROCESS`. Server component. Props: `index`, `name`, optional
  `variant`.
- `components/hud-card.tsx` — wraps shadcn `Card`; adds four corner brackets and an
  accent glow border on hover. Server component (CSS-only interactivity).
- `components/count-up.tsx` — **client** (`"use client"`). Animates a number from 0 to target
  when scrolled into view (IntersectionObserver). Renders in Geist Mono. Respects
  `prefers-reduced-motion` → shows final value immediately. Props: `to`, `suffix`, `duration`.
- `components/reveal.tsx` — **client**. Wrapper that fades/slides children in on first
  intersection. Respects reduced-motion → renders visible immediately. Props: `delay`,
  `as`/`className`.
- `components/backgrounds/neural-field.tsx` — **client**. A single `<canvas>` drawing a slowly
  drifting node/edge network with very subtle pointer influence. Pauses when offscreen
  (IntersectionObserver) and when the tab is hidden; renders a static frame (or nothing) under
  reduced-motion. Self-contained, no external lib.
- `components/backgrounds/grid-backdrop.tsx` — faint CSS grid layer (radial-masked) used as a
  site-wide ambient background. Server component (pure CSS).

**RSC boundary rule**: only the leaf pieces that need browser APIs (`count-up`, `reveal`,
`neural-field`) are client components. Section components stay server-rendered, composing these
leaves. This preserves the current architecture (sections use `next-intl` server-side
translations).

## Hero

`app/[locale]/(public)/home/_components/hero.tsx` — Neural Constellation:

- Centered headline (gradient via `.text-gradient`), mono eyebrow (`// SOFTWARE CONSULTING &
  IMPLEMENTATION`), subtitle, primary (gradient) + ghost CTA.
- Behind it: `GridBackdrop` (masked grid floor) + `NeuralField` (canvas node network).
- Nodes drift slowly; pointer influence is minimal. Reduced-motion → static composition.
- All copy stays translation-driven (existing `hero` namespace).

## Per-Section Treatment

Every section gets `SectionLabel` (numbered) and lives on the shared dark foundation. Specific
accents:

- **LogoStrip** — mono "trusted by / systems" label; monochrome logos that pick up cyan on hover.
- **Services** — grid of `HudCard`s (corner brackets, hover glow), lucide icons tinted accent.
- **Process** — stepper whose connecting line **draws on scroll** (signature moment #1); step
  numbers in mono.
- **CaseStudies** — `HudCard`s; metrics rendered with `CountUp` (signature moment #2).
- **TechStack** — the one place that leans into **terminal** flavor: a mono panel with a single
  **typed-text** effect (signature moment #3) plus the tech grid.
- **Testimonials** — cards, subtle reveal; restrained (no heavy robotic treatment).
- **Team** — `HudCard`s; role shown as a mono label.
- **FAQ** — existing accordion, with mono numbering on items.
- **Contact** — mono field labels; submit confirmation styled like a console/system response.
- **SiteHeader** — sticky, backdrop blur, mono nav, a small `● system online` status dot.
- **SiteFooter** — mono, grid-aligned, a subtle "system" status line.

All sections wrap their content in `Reveal` for the on-scroll fade/slide.

## Motion (Level B) & Accessibility

- **Ambient**: node drift + glow "breathing" (CSS/canvas).
- **Scroll reveals**: `Reveal` via IntersectionObserver on each section/major block.
- **Signature moments (exactly three)**: Process line draw-on-scroll, CaseStudies count-up,
  TechStack typed text. No other bespoke animations, to keep it controlled.
- **Reduced motion**: every animated component checks `prefers-reduced-motion` and degrades to a
  static end-state. The canvas additionally pauses when offscreen/tab-hidden.
- **Contrast/focus**: cyan-on-dark meets contrast targets for text; accent focus rings on all
  interactive elements; keyboard navigation unaffected.
- **Performance**: no new runtime dependencies; canvas is a single lightweight loop; images and
  logos stay optimized. Watch bundle size and Lighthouse.

## Internationalization

- New/changed visible copy (e.g. status lines, terminal log text, console confirmation) must be
  added to **both** `messages/en.json` and `messages/vi.json`. `tests/messages/parity.test.ts`
  enforces identical key structure and will fail otherwise.
- Decorative strings (section numbers, `//` prefixes, bracket glyphs) are rendered in the
  components, not stored as translations.
- Prefer locale-neutral or fully-translated terminal/status text; avoid English-only flavor text
  leaking into the Vietnamese catalog.

## Files Touched (indicative)

- `app/globals.css` — tokens (color, glow), grid/mono/gradient utilities, keyframes, reduced-motion rules.
- New: `components/section-label.tsx`, `components/hud-card.tsx`, `components/count-up.tsx`,
  `components/reveal.tsx`, `components/backgrounds/neural-field.tsx`,
  `components/backgrounds/grid-backdrop.tsx`.
- `components/section.tsx` — optionally render `SectionLabel` (index + name).
- Restyle each `app/[locale]/(public)/home/_components/*.tsx` and `components/site-header.tsx`.
- Possibly retune `components/ui/button.tsx` variants for the gradient/glow CTA.
- `messages/en.json` + `messages/vi.json` — any new strings (kept in parity).

## Testing

- Existing Vitest section tests assert on translated text; restyling must not break those
  assertions (keep text nodes/roles intact). Update where copy changes.
- New interactive leaves (`count-up`, `reveal`, `neural-field`) get light tests: reduced-motion
  path renders final/visible state; count-up renders its target value; canvas mounts without
  error in jsdom (guard for missing canvas APIs).
- `tests/messages/parity.test.ts` must stay green after any copy additions.
- `pnpm format:check` and `pnpm lint` must pass (CI gates on them).

## Out of Scope / Deferred

- PCB/trace-style section dividers (motif 6).
- WebGL / three.js Hero.
- framer-motion or any animation/particle library.
- Cursor-reactive parallax and heavy micro-interactions (motion level C).
- Wiring the contact form to a real email/webhook provider (separate, pre-existing TODO).
