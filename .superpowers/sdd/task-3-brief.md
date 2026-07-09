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

