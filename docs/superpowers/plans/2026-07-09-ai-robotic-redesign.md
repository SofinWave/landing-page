# AI / Robotic Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the kingnnt.org landing page a dark-first "AI / robotic" identity (cyan→blue accent, neural-constellation Hero, restrained technical motifs) applied across every section via a reusable token + primitive layer.

**Architecture:** Add design tokens and utilities to `app/globals.css`, build a small set of reusable primitives (`SectionLabel`, `HudCard`, `CountUp`, `Reveal`, `GridBackdrop`, `NeuralField`) plus two shared hooks, then restyle each section to compose them. Only leaf components that need browser APIs are client components; sections stay server-rendered so `next-intl` server translations are untouched.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript (strict), Tailwind v4, shadcn/ui, next-intl, Vitest + Testing Library + jsdom. **No new runtime dependencies.**

## Global Constraints

- **No new dependencies.** Animation is CSS + one vanilla `<canvas>` + IntersectionObserver + a self-written count-up. No framer-motion / tsparticles / three.js.
- **Package manager is pnpm.** Run scripts with `pnpm ...` / `pnpm exec ...`.
- **Every animated component must honor `prefers-reduced-motion`** by rendering a static end-state; the canvas must also pause when offscreen or the tab is hidden.
- **Dark-first:** design for `.dark`; keep light mode clean and legible with reduced glow/grid — do not delete the theme toggle.
- **Accent tokens only:** components reference CSS variables / utilities (`.text-gradient`, `text-primary`, `--accent-*`), never hardcoded hex.
- **i18n parity:** any new visible copy goes into BOTH `messages/en.json` and `messages/vi.json` with identical key structure (`tests/messages/parity.test.ts` enforces this). Decorative/technical strings (`//`, `01 /`, terminal log lines) are rendered in components, not translated.
- **CI gates:** `pnpm format:check` and `pnpm lint` must pass. Format with `pnpm format` before committing.
- **Commit convention:** Conventional Commits, no author-attribution/`Co-Authored-By` lines. Work on branch `feature/ai-robotic-redesign`.
- **Existing section tests** under `tests/sections/*` assert translated text; restyles must keep that text intact so those tests stay green.

---

### Task 1: Design tokens, accent palette & utilities (`app/globals.css`)

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces (CSS): retuned `--primary`/`--ring` = accent; new vars `--accent-from`, `--accent-to`, `--accent-glow`, `--grid-line`; utilities `.text-gradient` (retuned), `.bg-accent-gradient`, `.glow-accent`, `.grid-backdrop`, `.hud-corners`, `.draw-line`; keyframes `glow-breathe`; a global `@media (prefers-reduced-motion: reduce)` rule that disables animations.

- [ ] **Step 1: Add accent variables + retune dark surfaces**

In `app/globals.css`, inside `:root { … }` add (after `--radius`):

```css
  --accent-from: oklch(0.79 0.13 210);
  --accent-to: oklch(0.62 0.19 258);
  --accent-glow: oklch(0.79 0.13 210 / 0.35);
  --grid-line: oklch(0.62 0.19 258 / 0.10);
```

In `:root` also retune primary/ring to accent (replace the existing lines):

```css
  --primary: oklch(0.62 0.19 258);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.62 0.19 258);
```

Inside `.dark { … }` add the same accent vars but brighter glow/grid, and retune surfaces to cool-tinted + primary to a brighter accent (replace existing `--background`, `--card`, `--popover`, `--muted`, `--secondary`, `--primary`, `--primary-foreground`, `--ring`, `--border`, `--input`):

```css
  --accent-from: oklch(0.82 0.13 205);
  --accent-to: oklch(0.68 0.17 245);
  --accent-glow: oklch(0.82 0.13 205 / 0.30);
  --grid-line: oklch(0.68 0.17 245 / 0.14);
  --background: oklch(0.16 0.02 255);
  --card: oklch(0.20 0.02 255);
  --popover: oklch(0.20 0.02 255);
  --muted: oklch(0.24 0.02 255);
  --secondary: oklch(0.26 0.02 255);
  --primary: oklch(0.82 0.13 205);
  --primary-foreground: oklch(0.18 0.02 255);
  --ring: oklch(0.82 0.13 205);
  --border: oklch(1 0 0 / 9%);
  --input: oklch(1 0 0 / 14%);
```

- [ ] **Step 2: Retune gradient utilities to accent + add new utilities**

Replace the `@layer utilities { … }` block at the bottom of `app/globals.css` with:

```css
@layer utilities {
  .text-gradient {
    background-image: linear-gradient(90deg, var(--accent-from), var(--accent-to));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .bg-accent-gradient {
    background-image: linear-gradient(90deg, var(--accent-from), var(--accent-to));
  }
  .bg-hero-gradient {
    background:
      radial-gradient(60% 60% at 50% 0%, var(--accent-glow), transparent),
      radial-gradient(50% 50% at 100% 20%, color-mix(in oklch, var(--accent-to) 22%, transparent), transparent);
  }
  .glow-accent {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--accent-from) 40%, transparent),
      0 0 32px -8px var(--accent-glow);
  }
  .grid-backdrop {
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 40px 40px;
    -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 40%, transparent 78%);
    mask-image: radial-gradient(120% 90% at 50% 0%, #000 40%, transparent 78%);
  }
  .hud-corners::before,
  .hud-corners::after {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1.5px solid color-mix(in oklch, var(--accent-from) 55%, transparent);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .hud-corners::before { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
  .hud-corners::after { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
  .hud-corners:hover::before,
  .hud-corners:hover::after { opacity: 1; }
  .draw-line {
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.9s ease;
  }
  .draw-line[data-in-view="true"] { transform: scaleX(1); }
  @keyframes glow-breathe {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 0.9; }
  }
  .animate-breathe { animation: glow-breathe 6s ease-in-out infinite; }
}
```

- [ ] **Step 3: Add global reduced-motion guard**

Append to `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  .draw-line { transform: none !important; }
}
```

- [ ] **Step 4: Verify build + format**

Run: `pnpm exec tsc --noEmit && pnpm format:check`
Expected: no type errors; formatting clean (run `pnpm format` first if it reports diffs).

Run: `pnpm build`
Expected: build succeeds (CSS compiles, no unknown token errors).

- [ ] **Step 5: Visual check**

Run the dev server (`pnpm dev`), open `http://localhost:3000`, toggle dark/light. Confirm the page background is cool-tinted in dark, CTA buttons and `text-gradient` headings now render cyan→blue, and nothing is broken. (Pure-CSS task — verification is visual + build, not unit tests.)

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat(ui): add cyan/blue accent tokens and robotic utilities"
```

---

### Task 2: Shared motion hooks (`lib/hooks.ts`)

**Files:**
- Create: `lib/hooks.ts`
- Test: `tests/lib/hooks.test.tsx`

**Interfaces:**
- Produces: `useReducedMotion(): boolean` — SSR-safe, `false` on server/first paint, reflects `(prefers-reduced-motion: reduce)`. `useInView<T extends Element>(options?: IntersectionObserverInit): { ref: React.RefObject<T | null>; inView: boolean }` — sets `inView` true once when the element first intersects, then disconnects.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/hooks.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useInView, useReducedMotion } from "@/lib/hooks";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
  // @ts-expect-error test stub
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

function ReducedProbe() {
  return <span>{useReducedMotion() ? "reduced" : "full"}</span>;
}
function InViewProbe() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return <div ref={ref} data-testid="probe">{inView ? "in" : "out"}</div>;
}

describe("hooks", () => {
  it("reads prefers-reduced-motion", () => {
    render(<ReducedProbe />);
    expect(screen.getByText("reduced")).toBeInTheDocument();
  });
  it("useInView starts out of view", () => {
    render(<InViewProbe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("out");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/hooks.test.tsx`
Expected: FAIL — cannot resolve `@/lib/hooks`.

- [ ] **Step 3: Implement the hooks**

Create `lib/hooks.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setInView(true);
        io.disconnect();
      }
    }, options ?? { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [inView, options]);
  return { ref, inView };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/lib/hooks.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/hooks.ts tests/lib/hooks.test.tsx
git commit -m "feat(ui): add useReducedMotion and useInView hooks"
```

---

### Task 3: `SectionLabel` primitive

**Files:**
- Create: `components/section-label.tsx`
- Test: `tests/components/section-label.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces: `SectionLabel({ index, name, className }: { index: number; name: string; className?: string })` — server component rendering `NN / NAME` where `NN` is `index` zero-padded to 2 digits, uppercased name, in `font-mono`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/section-label.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectionLabel } from "@/components/section-label";

describe("SectionLabel", () => {
  it("renders zero-padded index and uppercased name", () => {
    render(<SectionLabel index={2} name="Services" />);
    expect(screen.getByText("02 / SERVICES")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/section-label.test.tsx`
Expected: FAIL — cannot resolve `@/components/section-label`.

- [ ] **Step 3: Implement**

Create `components/section-label.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  name,
  className,
}: {
  index: number;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      <span className="text-primary">{String(index).padStart(2, "0")}</span>
      <span aria-hidden>/</span>
      <span>{name}</span>
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/section-label.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/section-label.tsx tests/components/section-label.test.tsx
git commit -m "feat(ui): add SectionLabel primitive"
```

---

### Task 4: `HudCard` primitive

**Files:**
- Create: `components/hud-card.tsx`
- Test: `tests/components/hud-card.test.tsx`

**Interfaces:**
- Consumes: `Card` from `@/components/ui/card`, `cn` from `@/lib/utils`.
- Produces: `HudCard({ className, children, ...props })` — server component wrapping `Card` with `relative hud-corners` and a hover glow; forwards `className` and remaining div props; renders `children` (callers place `CardHeader`/`CardContent` inside).

- [ ] **Step 1: Write the failing test**

Create `tests/components/hud-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HudCard } from "@/components/hud-card";

describe("HudCard", () => {
  it("renders children and hud-corners class", () => {
    const { container } = render(<HudCard>content</HudCard>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(container.querySelector(".hud-corners")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/hud-card.test.tsx`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: Implement**

Create `components/hud-card.tsx`:

```tsx
import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HudCard({ className, children, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow hud-corners hover:glow-accent",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/hud-card.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hud-card.tsx tests/components/hud-card.test.tsx
git commit -m "feat(ui): add HudCard primitive"
```

---

### Task 5: `CountUp` primitive

**Files:**
- Create: `components/count-up.tsx`
- Test: `tests/components/count-up.test.tsx`

**Interfaces:**
- Consumes: `useInView`, `useReducedMotion` from `@/lib/hooks`; `cn` from `@/lib/utils`.
- Produces: `CountUp({ to, prefix, suffix, decimals, duration, className })` — client component. Renders `prefix + number + suffix` in `font-mono`. Under reduced motion (or before in view) it must still render the final value once mounted; animation only refines intermediate frames.

- [ ] **Step 1: Write the failing test**

Create `tests/components/count-up.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CountUp } from "@/components/count-up";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  // @ts-expect-error test stub
  window.IntersectionObserver = class { observe() {} disconnect() {} };
});

describe("CountUp", () => {
  it("renders the final value under reduced motion", () => {
    render(<CountUp to={99} suffix="%" />);
    expect(screen.getByText("99%")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/count-up.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `components/count-up.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    if (!inView) {
      setValue(0);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setValue(to * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/count-up.test.tsx`
Expected: PASS. (`matchMedia.matches = true` → reduced path renders `99%`.)

- [ ] **Step 5: Commit**

```bash
git add components/count-up.tsx tests/components/count-up.test.tsx
git commit -m "feat(ui): add CountUp primitive"
```

---

### Task 6: `Reveal` primitive

**Files:**
- Create: `components/reveal.tsx`
- Test: `tests/components/reveal.test.tsx`

**Interfaces:**
- Consumes: `useInView`, `useReducedMotion` from `@/lib/hooks`; `cn` from `@/lib/utils`.
- Produces: `Reveal({ children, className, delay })` — client `<div>` wrapper; children always in the DOM (SEO/tests safe). Applies opacity/translate transition when not in view; visible immediately under reduced motion.

- [ ] **Step 1: Write the failing test**

Create `tests/components/reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Reveal } from "@/components/reveal";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  // @ts-expect-error test stub
  window.IntersectionObserver = class { observe() {} disconnect() {} };
});

describe("Reveal", () => {
  it("always renders children", () => {
    render(<Reveal><p>hello</p></Reveal>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/reveal.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `components/reveal.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const shown = reduced || inView;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/reveal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/reveal.tsx tests/components/reveal.test.tsx
git commit -m "feat(ui): add Reveal primitive"
```

---

### Task 7: Background primitives — `GridBackdrop` + `NeuralField`

**Files:**
- Create: `components/backgrounds/grid-backdrop.tsx`
- Create: `components/backgrounds/neural-field.tsx`
- Test: `tests/components/backgrounds.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `useReducedMotion`, `useInView` from `@/lib/hooks`.
- Produces: `GridBackdrop({ className })` — server component, absolutely-positioned `div` with `grid-backdrop` utility. `NeuralField({ className })` — client `<canvas>` that draws a drifting node network; static single frame under reduced motion; pauses when offscreen or `document.hidden`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/backgrounds.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GridBackdrop } from "@/components/backgrounds/grid-backdrop";
import { NeuralField } from "@/components/backgrounds/neural-field";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  // @ts-expect-error test stub
  window.IntersectionObserver = class { observe() {} disconnect() {} };
});

describe("backgrounds", () => {
  it("GridBackdrop renders the grid layer", () => {
    const { container } = render(<GridBackdrop />);
    expect(container.querySelector(".grid-backdrop")).not.toBeNull();
  });
  it("NeuralField mounts a canvas without throwing", () => {
    const { container } = render(<NeuralField />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/backgrounds.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `GridBackdrop`**

Create `components/backgrounds/grid-backdrop.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 grid-backdrop", className)} />
  );
}
```

- [ ] **Step 4: Implement `NeuralField`**

Create `components/backgrounds/neural-field.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Node = { x: number; y: number; vx: number; vy: number };

export function NeuralField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let visible = true;

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-from")
      .trim() || "#22d3ee";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(48, Math.round((width * height) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.globalAlpha = (1 - d / 130) * 0.35;
            ctx.strokeStyle = accent;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = accent;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (visible && !reduced) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/backgrounds.test.tsx`
Expected: PASS. (jsdom returns a canvas element; `getContext` returns null in jsdom, so the effect early-returns without throwing — the mount assertion still holds.)

- [ ] **Step 6: Commit**

```bash
git add components/backgrounds tests/components/backgrounds.test.tsx
git commit -m "feat(ui): add GridBackdrop and NeuralField backgrounds"
```

---

### Task 8: Extend `Section` with optional label

**Files:**
- Modify: `components/section.tsx`
- Test: `tests/components/section.test.tsx` (existing — extend)

**Interfaces:**
- Consumes: `SectionLabel` (Task 3), `cn`.
- Produces: `Section` now accepts optional `index?: number` and `label?: string`; when both present it renders a `SectionLabel` above `children`. Existing callers (no new props) are unchanged.

- [ ] **Step 1: Write the failing test**

Add to `tests/components/section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Section } from "@/components/section";

describe("Section label", () => {
  it("renders a SectionLabel when index and label are provided", () => {
    render(<Section index={3} label="Process">body</Section>);
    expect(screen.getByText("03 / PROCESS")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/section.test.tsx`
Expected: FAIL — `index`/`label` not supported (no label rendered).

- [ ] **Step 3: Implement**

Replace `components/section.tsx` with:

```tsx
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/section-label";

export function Section({
  id,
  className,
  children,
  index,
  label,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  index?: number;
  label?: string;
}) {
  return (
    <section id={id} className={cn("container mx-auto px-4 py-16 md:py-24", className)}>
      {index != null && label ? (
        <div className="mb-6 flex justify-center">
          <SectionLabel index={index} name={label} />
        </div>
      ) : null}
      {children}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/section.test.tsx`
Expected: PASS (new + existing tests).

- [ ] **Step 5: Commit**

```bash
git add components/section.tsx tests/components/section.test.tsx
git commit -m "feat(ui): support numbered SectionLabel in Section"
```

---

### Task 9: Restyle Hero (Neural Constellation)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/hero.tsx`
- Test: `tests/sections/hero.test.tsx` (existing — keep green, add mono-eyebrow assertion)

**Interfaces:**
- Consumes: `GridBackdrop`, `NeuralField`, `Button`.
- Produces: no exported API change (`Hero()` unchanged signature).

- [ ] **Step 1: Update the test**

Add to `tests/sections/hero.test.tsx` (keep existing assertions):

```tsx
it("renders the eyebrow in monospace style", () => {
  // eyebrow text comes from the `hero.eyebrow` message; assert it is present
  // inside an element with the font-mono class
  const { container } = renderHero(); // reuse existing render helper
  expect(container.querySelector(".font-mono")).not.toBeNull();
});
```

If the existing test file has no `renderHero` helper, render inline the same way the existing tests do (wrap in `NextIntlClientProvider` with the `en` messages).

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/sections/hero.test.tsx`
Expected: FAIL — no `.font-mono` element yet.

- [ ] **Step 3: Implement**

Replace `app/[locale]/(public)/home/_components/hero.tsx` with:

```tsx
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { GridBackdrop } from "@/components/backgrounds/grid-backdrop";
import { NeuralField } from "@/components/backgrounds/neural-field";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <div id="top" className="relative overflow-hidden bg-hero-gradient">
      <GridBackdrop />
      <NeuralField className="opacity-70" />
      <div className="container relative z-10 mx-auto px-4 py-24 text-center md:py-32">
        <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-accent-gradient text-primary-foreground">
            <a href="#contact">{t("ctaPrimary")}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#work">{t("ctaSecondary")}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/sections/hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/(public)/home/_components/hero.tsx tests/sections/hero.test.tsx
git commit -m "feat(home): neural-constellation hero"
```

---

### Task 10: Restyle SiteHeader (mono nav + status dot) + new i18n key

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/components/site-header.test.tsx` (existing — keep green), `tests/messages/parity.test.ts` (must stay green)

**Interfaces:**
- Produces: header nav links styled `font-mono`; a `● {header.status}` indicator in the desktop bar.

- [ ] **Step 1: Add the `status` message to both catalogs**

In `messages/en.json`, inside the `"header"` object add: `"status": "Available for work"`.
In `messages/vi.json`, inside the `"header"` object add: `"status": "Đang nhận dự án"`.

- [ ] **Step 2: Run parity test (should pass) then update the component test**

Run: `pnpm exec vitest run tests/messages/parity.test.ts`
Expected: PASS (keys still identical across catalogs).

Add to `tests/components/site-header.test.tsx`:

```tsx
it("shows the availability status", () => {
  renderHeader(); // reuse existing render helper / inline provider
  expect(screen.getByText("Available for work")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/site-header.test.tsx`
Expected: FAIL — status text not rendered.

- [ ] **Step 4: Implement**

In `components/site-header.tsx`: (a) give nav anchors a mono class, and (b) add the status indicator. Change the desktop `<nav>` links `className` to:

```tsx
className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
```

And insert this as the first child of the desktop actions `div` (the `hidden items-center gap-2 md:flex` block), before `<LanguageSwitcher />`:

```tsx
<span className="mr-2 hidden items-center gap-2 font-mono text-xs text-muted-foreground lg:inline-flex">
  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
  {t("status")}
</span>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/site-header.test.tsx tests/messages/parity.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/site-header.tsx messages/en.json messages/vi.json tests/components/site-header.test.tsx
git commit -m "feat(home): mono nav and availability status in header"
```

---

### Task 11: Restyle LogoStrip

**Files:**
- Modify: `app/[locale]/(public)/home/_components/logo-strip.tsx`
- Test: `tests/sections/logo-strip.test.tsx` (existing — keep green)

**Interfaces:** no API change.

- [ ] **Step 1: Implement (title → mono, logos → accent on hover)**

Replace the `<p>` and `<li>` classNames in `logo-strip.tsx`:
- Title `<p>` className → `"mb-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"`.
- Each `<li>` className → `"text-lg font-semibold text-muted-foreground/70 transition-colors hover:text-primary"`.

- [ ] **Step 2: Run the existing section test**

Run: `pnpm exec vitest run tests/sections/logo-strip.test.tsx`
Expected: PASS (text unchanged).

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(public)/home/_components/logo-strip.tsx
git commit -m "feat(home): mono label and accent hover for logo strip"
```

---

### Task 12: Restyle Services (numbered label + HudCard)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/services.tsx`
- Test: `tests/sections/services.test.tsx` (existing — keep green)

**Interfaces:** Consumes `HudCard`, `Reveal`, `Section` (index/label). No API change.

- [ ] **Step 1: Implement**

In `services.tsx`: import `HudCard` and `Reveal`; change `<Section id="services">` to `<Section id="services" index={1} label="Services">`; replace the `<Card key={item.title} className="h-full">` with `<HudCard key={item.title} className="h-full">` (and the matching closing tag); wrap the grid in `<Reveal>`. Keep `CardHeader/CardContent/CardTitle` imports and inner markup. The icon wrapper stays `bg-primary/10 text-primary` (now accent-colored via tokens).

- [ ] **Step 2: Run the existing section test**

Run: `pnpm exec vitest run tests/sections/services.test.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(public)/home/_components/services.tsx
git commit -m "feat(home): hud cards and numbered label for services"
```

---

### Task 13: Restyle Process (draw-on-scroll connector — signature #1)

**Files:**
- Create: `components/process-line.tsx`
- Modify: `app/[locale]/(public)/home/_components/process.tsx`
- Test: `tests/sections/process.test.tsx` (existing — keep green), `tests/components/process-line.test.tsx`

**Interfaces:**
- Consumes: `useInView` from `@/lib/hooks`, `cn`.
- Produces: `ProcessLine({ className })` — client component rendering a horizontal accent bar that scales from 0→1 (`draw-line` utility, `data-in-view` toggled by `useInView`).

- [ ] **Step 1: Write the failing test**

Create `tests/components/process-line.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProcessLine } from "@/components/process-line";

beforeEach(() => {
  // @ts-expect-error test stub
  window.IntersectionObserver = class { observe() {} disconnect() {} };
});

describe("ProcessLine", () => {
  it("renders a draw-line element", () => {
    const { container } = render(<ProcessLine />);
    expect(container.querySelector(".draw-line")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/process-line.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `ProcessLine`**

Create `components/process-line.tsx`:

```tsx
"use client";

import { useInView } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function ProcessLine({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className={cn("relative h-px w-full bg-border", className)}>
      <div className="draw-line absolute inset-0 bg-accent-gradient" data-in-view={inView} />
    </div>
  );
}
```

- [ ] **Step 4: Integrate into `process.tsx`**

In `process.tsx`: change `<Section id="process" className="bg-muted/30">` to add `index={2} label="Process"`; import `ProcessLine`; insert `<ProcessLine className="mb-8 hidden md:block" />` between the heading block and the `<ol>`; change each step number wrapper to `font-mono` and each `<li>` to `HudCard` styling is optional — keep the existing `<li>` border but add `hud-corners relative overflow-hidden` classes for the corner motif. Keep all step text.

- [ ] **Step 5: Run tests**

Run: `pnpm exec vitest run tests/components/process-line.test.tsx tests/sections/process.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/process-line.tsx app/[locale]/(public)/home/_components/process.tsx tests/components/process-line.test.tsx
git commit -m "feat(home): draw-on-scroll connector for process"
```

---

### Task 14: Restyle CaseStudies (CountUp metrics — signature #2)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/case-studies.tsx`
- Test: `tests/sections/case-studies.test.tsx` (existing — keep green)

**Interfaces:** Consumes `HudCard`, `CountUp`, `Reveal`. Adds a local `parseMetric` helper.

- [ ] **Step 1: Implement**

In `case-studies.tsx`:
- Import `HudCard`, `CountUp`, `Reveal`.
- Change `<Section id="work">` → `<Section id="work" index={3} label="Case Studies">`.
- Replace the `<Card …>` wrapper with `<HudCard key={c.client} className="flex h-full flex-col">`.
- Add this helper above the component:

```tsx
function parseMetric(value: string): { to: number; prefix: string; suffix: string; decimals: number } {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { to: 0, prefix: value, suffix: "", decimals: 0 };
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { to: Number(m[2]), prefix: m[1], suffix: m[3], decimals };
}
```

- Replace the metric value line `<div className="text-2xl font-bold text-gradient">{r.value}</div>` with:

```tsx
{(() => {
  const p = parseMetric(r.value);
  return (
    <div className="text-2xl font-bold text-gradient">
      <CountUp to={p.to} prefix={p.prefix} suffix={p.suffix} decimals={p.decimals} />
    </div>
  );
})()}
```

- [ ] **Step 2: Run the existing section test**

Run: `pnpm exec vitest run tests/sections/case-studies.test.tsx`
Expected: PASS. If a test asserts an exact metric string that is now split by CountUp, update it to match the rendered numeric text (e.g. `40%`). Keep all other assertions.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(public)/home/_components/case-studies.tsx tests/sections/case-studies.test.tsx
git commit -m "feat(home): animated metrics for case studies"
```

---

### Task 15: Restyle TechStack (terminal panel + typed text — signature #3)

**Files:**
- Create: `components/typed-text.tsx`
- Modify: `app/[locale]/(public)/home/_components/tech-stack.tsx`
- Test: `tests/components/typed-text.test.tsx`, `tests/sections/tech-stack.test.tsx` (existing — keep green)

**Interfaces:**
- Consumes: `useInView`, `useReducedMotion`; `cn`.
- Produces: `TypedText({ lines, className })` — client; renders monospace lines. Under reduced motion (or before in view) renders all lines fully. Lines are locale-neutral technical log strings passed by the caller (not translated).

- [ ] **Step 1: Write the failing test**

Create `tests/components/typed-text.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TypedText } from "@/components/typed-text";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  // @ts-expect-error test stub
  window.IntersectionObserver = class { observe() {} disconnect() {} };
});

describe("TypedText", () => {
  it("renders all lines fully under reduced motion", () => {
    render(<TypedText lines={["$ deploy --env prod", "✓ build passed"]} />);
    expect(screen.getByText("$ deploy --env prod")).toBeInTheDocument();
    expect(screen.getByText("✓ build passed")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/typed-text.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `TypedText`**

Create `components/typed-text.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function TypedText({ lines, className }: { lines: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [count, setCount] = useState(reduced ? lines.length : 0);

  useEffect(() => {
    if (reduced || !inView) {
      if (reduced) setCount(lines.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= lines.length) clearInterval(id);
    }, 550);
    return () => clearInterval(id);
  }, [inView, reduced, lines.length]);

  return (
    <div ref={ref} className={cn("font-mono text-sm leading-relaxed", className)}>
      {lines.slice(0, Math.max(count, reduced ? lines.length : count)).map((line, i) => (
        <div key={line} className={i === 0 ? "text-primary" : "text-muted-foreground"}>
          {line}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Integrate into `tech-stack.tsx`**

In `tech-stack.tsx`: change `<Section>` → `<Section index={4} label="Tech Stack">`; import `TypedText`; add a terminal panel above or beside the chips. Insert this block right after the heading `div` and before the grid:

```tsx
<div className="mx-auto mb-10 max-w-2xl overflow-hidden rounded-lg border border-border bg-card/80">
  <div className="flex gap-1.5 border-b border-border px-4 py-2.5">
    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
  </div>
  <div className="px-4 py-4">
    <TypedText
      lines={[
        "$ deploy --env prod",
        "✓ build passed · 42s",
        "✓ tests 218/218",
        "✓ uptime 99.98%",
      ]}
    />
  </div>
</div>
```

Give the chip `<span>` in `Chips` a hover accent: append `transition-colors hover:border-primary hover:text-primary` to its className.

- [ ] **Step 5: Run tests**

Run: `pnpm exec vitest run tests/components/typed-text.test.tsx tests/sections/tech-stack.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/typed-text.tsx app/[locale]/(public)/home/_components/tech-stack.tsx tests/components/typed-text.test.tsx
git commit -m "feat(home): terminal panel with typed text for tech stack"
```

---

### Task 16: Restyle Testimonials + Team

**Files:**
- Modify: `app/[locale]/(public)/home/_components/testimonials.tsx`
- Modify: `app/[locale]/(public)/home/_components/team.tsx`
- Test: `tests/sections/testimonials.test.tsx`, `tests/sections/team.test.tsx` (existing — keep green)

**Interfaces:** Consumes `HudCard`, `Reveal`, `Section` index/label.

- [ ] **Step 1: Implement Testimonials**

In `testimonials.tsx`: replace the bare `<h2>` heading with a `Section`-style number? It currently isn't wrapped in `Section` — keep its structure but wrap content in `<Reveal>`, and swap `<Card>` → `<HudCard>`. Change the `Quote` icon color to `text-primary/50`. Keep all text.

- [ ] **Step 2: Implement Team**

In `team.tsx`: change `<Section>` → `<Section index={6} label="Team">`; wrap the grid in `<Reveal>`; add `hud-corners relative overflow-hidden` to each member card `div`; change the role `<div>` to `font-mono text-xs uppercase tracking-wider text-muted-foreground`; keep the initials avatar `bg-primary/10 text-primary`.

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run tests/sections/testimonials.test.tsx tests/sections/team.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/(public)/home/_components/testimonials.tsx app/[locale]/(public)/home/_components/team.tsx
git commit -m "feat(home): hud styling for testimonials and team"
```

---

### Task 17: Restyle FAQ + Contact form (console confirmation)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/faq.tsx`
- Modify: `app/[locale]/(public)/home/_components/contact-form.tsx`
- Modify: `app/[locale]/(public)/home/_components/contact.tsx`
- Test: `tests/sections/faq.test.tsx`, `tests/sections/contact-form.test.tsx` (existing — keep green)

**Interfaces:** No API change. FAQ gets mono item numbers; Contact labels go mono; success/error messages get a `font-mono` console styling. No new i18n keys (reuse existing `contact.success` / `contact.error`).

- [ ] **Step 1: Implement FAQ numbering**

In `faq.tsx`: change `<Section className="max-w-3xl">` → `<Section className="max-w-3xl" index={7} label="FAQ">`. In the `AccordionTrigger`, prefix the question with a mono index: replace `{item.question}` with:

```tsx
<span className="flex items-center gap-3">
  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
  {item.question}
</span>
```

- [ ] **Step 2: Implement Contact form console styling**

In `contact-form.tsx`: add `font-mono text-xs uppercase tracking-wider` to each `<Label>` className. Replace the success/error paragraphs with console-styled versions:

```tsx
{status === "success" && (
  <p className="font-mono text-sm text-primary">{`> ${t("success")}`}</p>
)}
{status === "error" && (
  <p className="font-mono text-sm text-destructive">{`> ${t("error")}`}</p>
)}
```

Give the submit button an accent gradient: add `className="w-full bg-accent-gradient text-primary-foreground"` (keep `disabled` logic).

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run tests/sections/faq.test.tsx tests/sections/contact-form.test.tsx`
Expected: PASS. If the contact-form test asserts the exact success string, update it to the `> …`-prefixed text.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/(public)/home/_components/faq.tsx app/[locale]/(public)/home/_components/contact-form.tsx app/[locale]/(public)/home/_components/contact.tsx tests/sections/faq.test.tsx tests/sections/contact-form.test.tsx
git commit -m "feat(home): mono faq numbering and console-style contact form"
```

---

### Task 18: Restyle Footer (system status line) + new i18n key

**Files:**
- Modify: `app/[locale]/(public)/home/_components/footer.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/footer.test.tsx` (existing — keep green), `tests/messages/parity.test.ts`

**Interfaces:** Adds `footer.status` message key.

- [ ] **Step 1: Add the `status` message to both catalogs**

In `messages/en.json` `"footer"` add: `"status": "All systems operational"`.
In `messages/vi.json` `"footer"` add: `"status": "Hệ thống đang vận hành"`.

- [ ] **Step 2: Update footer test + implement**

Add to `tests/sections/footer.test.tsx`:

```tsx
it("renders the system status line", () => {
  renderFooter(); // reuse existing render pattern
  expect(screen.getByText("All systems operational")).toBeInTheDocument();
});
```

In `footer.tsx`, add a status line to the brand block (below `tagline`):

```tsx
<div className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
  {t("status")}
</div>
```

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run tests/sections/footer.test.tsx tests/messages/parity.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/(public)/home/_components/footer.tsx messages/en.json messages/vi.json tests/sections/footer.test.tsx
git commit -m "feat(home): system status line in footer"
```

---

### Task 19: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `pnpm test`
Expected: all tests pass (existing + new).

- [ ] **Step 2: Lint + format gates (what CI runs)**

Run: `pnpm format` then `pnpm format:check` then `pnpm lint`
Expected: no formatting diffs; lint clean.

- [ ] **Step 3: Production build**

Run: `pnpm build`
Expected: build succeeds with no type errors.

- [ ] **Step 4: Manual verification (use the `run` skill or `pnpm dev`)**

Open `http://localhost:3000`, and confirm:
- Dark mode: neural constellation animates in the hero; grid backdrop visible; cyan→blue accent throughout; section labels `01 / …` present; case-study numbers count up; process connector draws on scroll; tech-stack terminal types once.
- Toggle light mode: layout intact, glow/grid subdued, still legible.
- OS "Reduce motion" enabled: no animation; all final states shown (numbers final, terminal fully printed, sections visible).
- Resize to mobile: header collapses to menu, sections stack, no horizontal scroll.

- [ ] **Step 5: Final commit (if any format fixes)**

```bash
git add -A
git commit -m "chore: format and final polish for ai/robotic redesign"
```

---

## Self-Review Notes

- **Spec coverage:** tokens/palette (Task 1) · primitives SectionLabel/HudCard/CountUp/Reveal/GridBackdrop/NeuralField (Tasks 3–7) · hooks (Task 2) · Section numbering (Task 8) · Hero neural constellation (Task 9) · all sections + header/footer (Tasks 10–18) · motion level B signatures: process draw (13), count-up (14), typed text (15) · reduced-motion (global in Task 1 + per-component) · i18n parity (Tasks 10, 18) · zero deps (constraints) · testing + CI gates (Task 19). All spec sections map to a task.
- **Deferred (per spec):** PCB/trace dividers, WebGL, framer-motion, cursor parallax, contact backend — none scheduled here, intentionally.
- **Type consistency:** hook names `useReducedMotion`/`useInView`, component props, and `parseMetric` shape are used identically wherever referenced.
```
