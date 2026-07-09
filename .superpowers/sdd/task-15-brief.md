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

