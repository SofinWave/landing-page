### Task 11: Restyle LogoStrip

**Files:**
- Modify: `app/[locale]/(public)/home/_components/logo-strip.tsx`
- Test: `tests/sections/logo-strip.test.tsx` (existing — keep green)

**Interfaces:** no API change.

- [ ] **Step 1: Implement (title → mono, logos → accent on hover)**

Replace the `<p>` and `<li>` classNames in `logo-strip.tsx`:
- Title `<p>` className → `"mb-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"`.
- Each `<li>` className → `"text-lg font-semibold text-muted-foreground/70 transition-colors hover:text-primary"`.

- [ ] **Step 2: Run the existing section test**

Run: `pnpm exec vitest run tests/sections/logo-strip.test.tsx`
Expected: PASS (text unchanged).

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(public)/home/_components/logo-strip.tsx
git commit -m "feat(home): mono label and accent hover for logo strip"
```

---

