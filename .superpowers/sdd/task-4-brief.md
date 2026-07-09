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

