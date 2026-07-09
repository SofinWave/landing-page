### Task 1: Design tokens, accent palette & utilities (`app/globals.css`)

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces (CSS): retuned `--primary`/`--ring` = accent; new vars `--accent-from`, `--accent-to`, `--accent-glow`, `--grid-line`; utilities `.text-gradient` (retuned), `.bg-accent-gradient`, `.glow-accent`, `.grid-backdrop`, `.hud-corners`, `.draw-line`; keyframes `glow-breathe`; a global `@media (prefers-reduced-motion: reduce)` rule that disables animations.

- [ ] **Step 1: Add accent variables + retune dark surfaces**

In `app/globals.css`, inside `:root { … }` add (after `--radius`):

```css
  --accent-from: oklch(0.79 0.13 210);
  --accent-to: oklch(0.62 0.19 258);
  --accent-glow: oklch(0.79 0.13 210 / 0.35);
  --grid-line: oklch(0.62 0.19 258 / 0.10);
```

In `:root` also retune primary/ring to accent (replace the existing lines):

```css
  --primary: oklch(0.62 0.19 258);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.62 0.19 258);
```

Inside `.dark { … }` add the same accent vars but brighter glow/grid, and retune surfaces to cool-tinted + primary to a brighter accent (replace existing `--background`, `--card`, `--popover`, `--muted`, `--secondary`, `--primary`, `--primary-foreground`, `--ring`, `--border`, `--input`):

```css
  --accent-from: oklch(0.82 0.13 205);
  --accent-to: oklch(0.68 0.17 245);
  --accent-glow: oklch(0.82 0.13 205 / 0.30);
  --grid-line: oklch(0.68 0.17 245 / 0.14);
  --background: oklch(0.16 0.02 255);
  --card: oklch(0.20 0.02 255);
  --popover: oklch(0.20 0.02 255);
  --muted: oklch(0.24 0.02 255);
  --secondary: oklch(0.26 0.02 255);
  --primary: oklch(0.82 0.13 205);
  --primary-foreground: oklch(0.18 0.02 255);
  --ring: oklch(0.82 0.13 205);
  --border: oklch(1 0 0 / 9%);
  --input: oklch(1 0 0 / 14%);
```

- [ ] **Step 2: Retune gradient utilities to accent + add new utilities**

Replace the `@layer utilities { … }` block at the bottom of `app/globals.css` with:

```css
@layer utilities {
  .text-gradient {
    background-image: linear-gradient(90deg, var(--accent-from), var(--accent-to));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .bg-accent-gradient {
    background-image: linear-gradient(90deg, var(--accent-from), var(--accent-to));
  }
  .bg-hero-gradient {
    background:
      radial-gradient(60% 60% at 50% 0%, var(--accent-glow), transparent),
      radial-gradient(50% 50% at 100% 20%, color-mix(in oklch, var(--accent-to) 22%, transparent), transparent);
  }
  .glow-accent {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--accent-from) 40%, transparent),
      0 0 32px -8px var(--accent-glow);
  }
  .grid-backdrop {
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 40px 40px;
    -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 40%, transparent 78%);
    mask-image: radial-gradient(120% 90% at 50% 0%, #000 40%, transparent 78%);
  }
  .hud-corners::before,
  .hud-corners::after {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1.5px solid color-mix(in oklch, var(--accent-from) 55%, transparent);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .hud-corners::before { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
  .hud-corners::after { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
  .hud-corners:hover::before,
  .hud-corners:hover::after { opacity: 1; }
  .draw-line {
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.9s ease;
  }
  .draw-line[data-in-view="true"] { transform: scaleX(1); }
  @keyframes glow-breathe {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 0.9; }
  }
  .animate-breathe { animation: glow-breathe 6s ease-in-out infinite; }
}
```

- [ ] **Step 3: Add global reduced-motion guard**

Append to `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  .draw-line { transform: none !important; }
}
```

- [ ] **Step 4: Verify build + format**

Run: `pnpm exec tsc --noEmit && pnpm format:check`
Expected: no type errors; formatting clean (run `pnpm format` first if it reports diffs).

Run: `pnpm build`
Expected: build succeeds (CSS compiles, no unknown token errors).

- [ ] **Step 5: Visual check**

Run the dev server (`pnpm dev`), open `http://localhost:3000`, toggle dark/light. Confirm the page background is cool-tinted in dark, CTA buttons and `text-gradient` headings now render cyan→blue, and nothing is broken. (Pure-CSS task — verification is visual + build, not unit tests.)

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat(ui): add cyan/blue accent tokens and robotic utilities"
```

---

