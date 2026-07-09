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

