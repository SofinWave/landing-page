### Task 10: Restyle SiteHeader (mono nav + status dot) + new i18n key

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `messages/en.json`, `messages/vi.json`
- Test: `tests/components/site-header.test.tsx` (existing — keep green), `tests/messages/parity.test.ts` (must stay green)

**Interfaces:**
- Produces: header nav links styled `font-mono`; a `● {header.status}` indicator in the desktop bar.

- [ ] **Step 1: Add the `status` message to both catalogs**

In `messages/en.json`, inside the `"header"` object add: `"status": "Available for work"`.
In `messages/vi.json`, inside the `"header"` object add: `"status": "Đang nhận dự án"`.

- [ ] **Step 2: Run parity test (should pass) then update the component test**

Run: `pnpm exec vitest run tests/messages/parity.test.ts`
Expected: PASS (keys still identical across catalogs).

Add to `tests/components/site-header.test.tsx`:

```tsx
it("shows the availability status", () => {
  renderHeader(); // reuse existing render helper / inline provider
  expect(screen.getByText("Available for work")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/site-header.test.tsx`
Expected: FAIL — status text not rendered.

- [ ] **Step 4: Implement**

In `components/site-header.tsx`: (a) give nav anchors a mono class, and (b) add the status indicator. Change the desktop `<nav>` links `className` to:

```tsx
className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
```

And insert this as the first child of the desktop actions `div` (the `hidden items-center gap-2 md:flex` block), before `<LanguageSwitcher />`:

```tsx
<span className="mr-2 hidden items-center gap-2 font-mono text-xs text-muted-foreground lg:inline-flex">
  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--accent-glow)]" />
  {t("status")}
</span>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/site-header.test.tsx tests/messages/parity.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/site-header.tsx messages/en.json messages/vi.json tests/components/site-header.test.tsx
git commit -m "feat(home): mono nav and availability status in header"
```

---

