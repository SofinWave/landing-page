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

