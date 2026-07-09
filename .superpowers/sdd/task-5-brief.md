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

