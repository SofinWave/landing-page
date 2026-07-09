### Task 12: Restyle Services (numbered label + HudCard)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/services.tsx`
- Test: `tests/sections/services.test.tsx` (existing — keep green)

**Interfaces:** Consumes `HudCard`, `Reveal`, `Section` (index/label). No API change.

- [ ] **Step 1: Implement**

In `services.tsx`: import `HudCard` and `Reveal`; change `<Section id="services">` to `<Section id="services" index={1} label="Services">`; replace the `<Card key={item.title} className="h-full">` with `<HudCard key={item.title} className="h-full">` (and the matching closing tag); wrap the grid in `<Reveal>`. Keep `CardHeader/CardContent/CardTitle` imports and inner markup. The icon wrapper stays `bg-primary/10 text-primary` (now accent-colored via tokens).

- [ ] **Step 2: Run the existing section test**

Run: `pnpm exec vitest run tests/sections/services.test.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(public)/home/_components/services.tsx
git commit -m "feat(home): hud cards and numbered label for services"
```

---

