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

