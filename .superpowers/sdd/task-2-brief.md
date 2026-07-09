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

