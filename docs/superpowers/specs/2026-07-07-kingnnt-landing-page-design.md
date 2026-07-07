# kingnnt.org Landing Page — Design Spec

**Date:** 2026-07-07
**Status:** Approved (design), pending implementation plan

## 1. Goal & Positioning

A single-page, bilingual (EN/VI) landing page for **kingnnt.org**, a firm providing
**software system consulting & implementation services**.

Primary objective: **build credibility / present a capability profile**. B2B buyers
evaluate trust before acting, so the page is optimized to demonstrate competence
(case studies, client logos, testimonials, process) rather than to push aggressive
conversion.

Secondary: give interested visitors an easy, low-friction way to start a conversation
(book a call / contact form).

### Design principles

- **Trust before CTA** — proof (case studies, logos, testimonials) precedes any
  request for contact details.
- **Social proof at eye level** — client logos appear immediately below the hero,
  not buried at the bottom.
- **Case study is the centerpiece** — presented as *Problem → Solution → Result
  (with metrics)*.
- **Disciplined gradient** — dynamic gradient/color in hero + accents, but proof
  sections (case studies, numbers) stay on clean backgrounds to read as trustworthy.
- **Short, outcome-focused headline** (< 8 words, no jargon).
- **Bilingual EN/VI as first-class** — equal weight, powered by next-intl.
- **Mobile-first & fast** — layout stability and speed are themselves trust signals.

## 2. Target Audience

Both Vietnamese businesses and international/outsourcing clients, treated equally.
EN and VI content are maintained in parallel.

## 3. Page Structure (scroll order)

| # | Section | Purpose | Priority |
|---|---------|---------|----------|
| 1 | **Nav (sticky)** — logo, menu anchors, EN/VI switch, theme toggle, primary CTA | Navigation + persistent CTA | Must |
| 2 | **Hero** — short outcome headline, subheadline, primary CTA ("Book a consultation"), secondary CTA ("View case studies"); gradient background | Impression in < 5s | Must |
| 3 | **Client logo strip** — directly below hero | Social proof at eye level | Must |
| 4 | **Services / Capabilities** — 4–6 cards (architecture consulting, system implementation, software development, integration, maintenance, …) | Explain what we do | Must |
| 5 | **Implementation process** — Discovery → Design → Build → Deploy → Operate | Prove "implementation" is methodical | Must |
| 6 | **Featured case studies** — 2–3 projects, each *Problem → Solution → Result* | Capability proof (centerpiece) | Must (highlight) |
| 7 | **Technology & domains** — tech stack + domains served | Depth of expertise | Should |
| 8 | **Testimonials** — real quotes with name/title | Human trust weight | Should |
| 9 | **Team / About** (brief) | Credibility via people | Should |
| 10 | **FAQ** — 3–5 questions reducing hesitation (cost, timeline, process, security) | Remove objections | Should |
| 11 | **Final CTA** — minimal form (name, email, message) or "book a call" | Conversion | Must |
| 12 | **Footer** — contact, social, legal | Close | Must |

FAQ is limited to 3–5 items by design; anything more belongs elsewhere.
One primary CTA repeated at multiple scroll points (hero, mid-page, final).

## 4. Technical Approach

### Stack (existing)
Next.js 15 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui ·
next-themes · Geist fonts. Locale routing already handled by `middleware.ts`
(`/en`, `/vi`, default `en`, cookie `NEXT_LOCALE`).

### Component organization
Each section is its own component under
`app/[locale]/(public)/home/_components/`, composed by
`app/[locale]/(public)/home/page.tsx`. Small, single-purpose, independently
readable components.

### Content as data
Services, case studies, testimonials, FAQ, team, and client logos live as
structured data (per-locale) rather than inline JSX, so real content can be
updated without touching layout. Real assets (case studies, logos, team info)
exist and will be filled in; the spec defines the shape and ships clear
placeholders.

### Theming fix
The current home page hardcodes colors (`bg-gray-900`, `text-gray-100`), which
breaks the light/dark system. The rebuild uses shadcn design tokens
(`bg-background`, `text-foreground`, `text-muted-foreground`, etc.) so both
themes render correctly. Gradients are defined to work in light and dark.

### Rendering
Server Components by default for SEO and speed; client components only where
interactivity is required (theme toggle, language switch, mobile nav, contact form).

### Internationalization — next-intl
- Add `next-intl` and integrate with the existing locale routing.
- Message catalogs per locale (e.g. `messages/en.json`, `messages/vi.json`),
  namespaced per section.
- Reconcile `next-intl` request config with the current custom `middleware.ts`
  redirect logic (either adopt next-intl's middleware or bridge the existing one —
  to be finalized in the implementation plan).
- All user-facing copy comes from message catalogs; data-driven content
  (case studies, etc.) is keyed per locale.

## 5. Data Models (shape, indicative)

```ts
type Service = { id: string; icon: string; title: string; description: string };

type CaseStudy = {
  id: string;
  client: string;
  logo?: string;
  problem: string;
  solution: string;
  results: { label: string; value: string }[]; // metric chips
  tags: string[];
};

type Testimonial = {
  id: string; quote: string; author: string; role: string; company: string; avatar?: string;
};

type ProcessStep = { step: number; title: string; description: string };

type FaqItem = { question: string; answer: string };

type TeamMember = { name: string; role: string; avatar?: string; bio?: string };
```

Copy for these is provided per locale (EN/VI).

## 6. SEO & Metadata

- Per-locale `<html lang>` and localized `metadata` (title, description, OG tags)
  replacing the current "Generated by create next app" default.
- `hreflang` alternates for en/vi.
- Semantic heading hierarchy: one H1 (hero), H2 per section, H3 for sub-items.

## 7. Accessibility & Performance

- Mobile-first, keyboard-navigable, sufficient contrast in both themes.
- Optimized images (`next/image`), lazy-loaded below-the-fold assets.
- Minimal client JS; measure against fast first-load as a launch gate.

## 8. Out of Scope (YAGNI)

- Blog / CMS integration.
- Backend for the contact form beyond a simple submission handler (email/webhook);
  full CRM integration is future work.
- Authentication / client portal.
- Analytics dashboards (basic analytics tag can be added later).

## 9. Open Items for Implementation Plan

- Final next-intl ↔ existing middleware integration strategy.
- Contact form submission target (email service, webhook, or form provider).
- Exact section copy (EN/VI) and real assets from the client.
