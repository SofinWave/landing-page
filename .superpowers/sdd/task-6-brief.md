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

