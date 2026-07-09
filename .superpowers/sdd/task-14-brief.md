### Task 14: Restyle CaseStudies (CountUp metrics — signature #2)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/case-studies.tsx`
- Test: `tests/sections/case-studies.test.tsx` (existing — keep green)

**Interfaces:** Consumes `HudCard`, `CountUp`, `Reveal`. Adds a local `parseMetric` helper.

- [ ] **Step 1: Implement**

In `case-studies.tsx`:
- Import `HudCard`, `CountUp`, `Reveal`.
- Change `<Section id="work">` → `<Section id="work" index={3} label="Case Studies">`.
- Replace the `<Card …>` wrapper with `<HudCard key={c.client} className="flex h-full flex-col">`.
- Add this helper above the component:

```tsx
function parseMetric(value: string): { to: number; prefix: string; suffix: string; decimals: number } {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { to: 0, prefix: value, suffix: "", decimals: 0 };
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { to: Number(m[2]), prefix: m[1], suffix: m[3], decimals };
}
```

- Replace the metric value line `<div className="text-2xl font-bold text-gradient">{r.value}</div>` with:

```tsx
{(() => {
  const p = parseMetric(r.value);
  return (
    <div className="text-2xl font-bold text-gradient">
      <CountUp to={p.to} prefix={p.prefix} suffix={p.suffix} decimals={p.decimals} />
    </div>
  );
})()}
```

- [ ] **Step 2: Run the existing section test**

Run: `pnpm exec vitest run tests/sections/case-studies.test.tsx`
Expected: PASS. If a test asserts an exact metric string that is now split by CountUp, update it to match the rendered numeric text (e.g. `40%`). Keep all other assertions.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(public)/home/_components/case-studies.tsx tests/sections/case-studies.test.tsx
git commit -m "feat(home): animated metrics for case studies"
```

---

