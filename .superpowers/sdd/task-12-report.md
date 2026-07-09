# Task 12 Report: Restyle Services (numbered label + HudCard)

**Date:** 2026-07-09  
**Branch:** feature/ai-robotic-redesign  
**Commit:** 78f4158

## Changes Applied

Modified `/app/[locale]/(public)/home/_components/services.tsx`:

1. **Added imports:**
   - `HudCard` from `@/components/hud-card`
   - `Reveal` from `@/components/reveal`

2. **Updated Section component:**
   - Changed `<Section id="services">` → `<Section id="services" index={1} label="Services">`
   - Adds numbered label "1" and label text "Services" to section

3. **Replaced Card component:**
   - Changed `<Card>` → `<HudCard>` wrapper for each service item
   - Preserved all inner markup: `CardHeader`, `CardContent`, `CardTitle`
   - Kept icon wrapper styling: `bg-primary/10 text-primary` (accent-colored via tokens)

4. **Added Reveal wrapper:**
   - Wrapped the cards grid in `<Reveal>` component
   - Wraps `<div className="grid gap-6...">` containing the mapped items

5. **Preserved imports:**
   - Kept `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card` (still used)
   - All existing icon and translation logic unchanged

## Test Results

### Targeted Test
```
pnpm exec vitest run tests/sections/services.test.tsx
✓ Test Files  1 passed (1)
✓ Tests  1 passed (1)
```

### Full Test Suite
```
pnpm test
✓ Test Files  26 passed (26)
✓ Tests  43 passed (43)
```

### Linting
```
pnpm lint
$ eslint .
✓ No errors
```

### Formatting
```
pnpm format
$ biome format --write
✓ Formatted 91 files in 70ms (no fixes needed)
```

## Git Status Confirmation

Only the target file was modified:
```
 M app/[locale]/(public)/home/_components/services.tsx
```

Untracked (workflow artifacts, not part of implementation):
- CLAUDE.md
- docs/superpowers/plans/2026-07-09-ai-robotic-redesign.md

## Self-Review vs Brief

✓ **Step 1 (Implement):** All 5 requirements completed
  - HudCard and Reveal imported
  - Section index/label added
  - Card → HudCard replacement done
  - Grid wrapped in Reveal
  - Icon styling preserved

✓ **Step 2 (Test):** services.test.tsx passes green

✓ **Step 3 (Commit):** Applied with conventional commit format: `feat(home): hud cards and numbered label for services`

## No Concerns

- No new dependencies added
- No unused imports remaining (Card still used by CardHeader/CardContent/CardTitle)
- All tests green
- Linting clean
- File content and structure follows project conventions
- Branch correctly named: feature/ai-robotic-redesign

---

**Status:** ✓ Complete
