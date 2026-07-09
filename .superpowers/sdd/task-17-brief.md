### Task 17: Restyle FAQ + Contact form (console confirmation)

**Files:**
- Modify: `app/[locale]/(public)/home/_components/faq.tsx`
- Modify: `app/[locale]/(public)/home/_components/contact-form.tsx`
- Modify: `app/[locale]/(public)/home/_components/contact.tsx`
- Test: `tests/sections/faq.test.tsx`, `tests/sections/contact-form.test.tsx` (existing — keep green)

**Interfaces:** No API change. FAQ gets mono item numbers; Contact labels go mono; success/error messages get a `font-mono` console styling. No new i18n keys (reuse existing `contact.success` / `contact.error`).

- [ ] **Step 1: Implement FAQ numbering**

In `faq.tsx`: change `<Section className="max-w-3xl">` → `<Section className="max-w-3xl" index={7} label="FAQ">`. In the `AccordionTrigger`, prefix the question with a mono index: replace `{item.question}` with:

```tsx
<span className="flex items-center gap-3">
  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
  {item.question}
</span>
```

- [ ] **Step 2: Implement Contact form console styling**

In `contact-form.tsx`: add `font-mono text-xs uppercase tracking-wider` to each `<Label>` className. Replace the success/error paragraphs with console-styled versions:

```tsx
{status === "success" && (
  <p className="font-mono text-sm text-primary">{`> ${t("success")}`}</p>
)}
{status === "error" && (
  <p className="font-mono text-sm text-destructive">{`> ${t("error")}`}</p>
)}
```

Give the submit button an accent gradient: add `className="w-full bg-accent-gradient text-primary-foreground"` (keep `disabled` logic).

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run tests/sections/faq.test.tsx tests/sections/contact-form.test.tsx`
Expected: PASS. If the contact-form test asserts the exact success string, update it to the `> …`-prefixed text.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/(public)/home/_components/faq.tsx app/[locale]/(public)/home/_components/contact-form.tsx app/[locale]/(public)/home/_components/contact.tsx tests/sections/faq.test.tsx tests/sections/contact-form.test.tsx
git commit -m "feat(home): mono faq numbering and console-style contact form"
```

---

