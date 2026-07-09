### Task 16: Restyle Testimonials + Team

**Files:**
- Modify: `app/[locale]/(public)/home/_components/testimonials.tsx`
- Modify: `app/[locale]/(public)/home/_components/team.tsx`
- Test: `tests/sections/testimonials.test.tsx`, `tests/sections/team.test.tsx` (existing — keep green)

**Interfaces:** Consumes `HudCard`, `Reveal`, `Section` index/label.

- [ ] **Step 1: Implement Testimonials**

In `testimonials.tsx`: replace the bare `<h2>` heading with a `Section`-style number? It currently isn't wrapped in `Section` — keep its structure but wrap content in `<Reveal>`, and swap `<Card>` → `<HudCard>`. Change the `Quote` icon color to `text-primary/50`. Keep all text.

- [ ] **Step 2: Implement Team**

In `team.tsx`: change `<Section>` → `<Section index={6} label="Team">`; wrap the grid in `<Reveal>`; add `hud-corners relative overflow-hidden` to each member card `div`; change the role `<div>` to `font-mono text-xs uppercase tracking-wider text-muted-foreground`; keep the initials avatar `bg-primary/10 text-primary`.

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run tests/sections/testimonials.test.tsx tests/sections/team.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/(public)/home/_components/testimonials.tsx app/[locale]/(public)/home/_components/team.tsx
git commit -m "feat(home): hud styling for testimonials and team"
```

---

