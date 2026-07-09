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

