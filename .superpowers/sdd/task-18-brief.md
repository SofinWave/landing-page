### Task 18: Restyle Footer (system status line) + new i18n key

**Files:**
- Modify: `app/[locale]/(public)/home/_components/footer.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/sections/footer.test.tsx` (existing — keep green), `tests/messages/parity.test.ts`

**Interfaces:** Adds `footer.status` message key.

- [ ] **Step 1: Add the `status` message to both catalogs**

In `messages/en.json` `"footer"` add: `"status": "All systems operational"`.
In `messages/vi.json` `"footer"` add: `"status": "Hệ thống đang vận hành"`.

- [ ] **Step 2: Update footer test + implement**

Add to `tests/sections/footer.test.tsx`:

```tsx
it("renders the system status line", () => {
  renderFooter(); // reuse existing render pattern
  expect(screen.getByText("All systems operational")).toBeInTheDocument();
});
```

In `footer.tsx`, add a status line to the brand block (below `tagline`):

```tsx
<div className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
  {t("status")}
</div>
```

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run tests/sections/footer.test.tsx tests/messages/parity.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/(public)/home/_components/footer.tsx messages/en.json messages/vi.json tests/sections/footer.test.tsx
git commit -m "feat(home): system status line in footer"
```

---

