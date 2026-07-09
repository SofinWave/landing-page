# Task 13 Report: Restyle Process (draw-on-scroll connector)

## TDD Workflow

### Step 1: RED (Failing Test)
- **Test File**: `tests/components/process-line.test.tsx` (created)
- **Test Content**: Renders a `.draw-line` element within ProcessLine
- **Status**: FAIL (Expected) — Module not found error for `@/components/process-line`

### Step 2: GREEN (Implementation)
- **Component File**: `components/process-line.tsx` (created)
- **Implementation**:
  - Client component using `"use client"` directive
  - Uses `useInView` hook to detect viewport intersection
  - Renders div with `.draw-line` class and `data-in-view` attribute
  - Accepts optional `className` prop
  - Applies `cn()` utility for class composition
- **Status**: PASS — Test now passes successfully

## Integration into Process Section

### Changes to `app/[locale]/(public)/home/_components/process.tsx`:

1. **Import ProcessLine**
   - Added: `import { ProcessLine } from "@/components/process-line";`

2. **Section Props Enhancement**
   - Modified: `<Section id="process" className="bg-muted/30">` 
   - To: `<Section id="process" index={2} label="Process" className="bg-muted/30">`
   - Adds section labeling and indexing

3. **ProcessLine Insertion**
   - Added: `<ProcessLine className="mb-8 hidden md:block" />`
   - Location: Between heading block and `<ol>` element
   - Styling: Hidden on mobile, visible on md breakpoint and above

4. **Step Number Typography**
   - Modified step number wrapper div
   - Added: `font-mono` class
   - Context: Number wrapper kept existing styling (bg-primary, text-sm, font-semibold)

5. **List Item Enhancement**
   - Modified: `<li key={step.title} className="rounded-lg border border-border bg-card p-5">`
   - To: Added `hud-corners relative overflow-hidden` classes
   - Preserved: All existing border, background, and padding classes
   - Content: No changes to step text or structure

## Test Results

### Targeted Tests
```
Test Files  2 passed (2)
Tests       2 passed (2)
```
- `tests/components/process-line.test.tsx` — ✓ PASS (ProcessLine renders draw-line element)
- `tests/sections/process.test.tsx` — ✓ PASS (Process renders 5 listitems with correct text)

### Full Test Suite
```
Test Files  27 passed (27)
Tests       44 passed (44)
```
- All tests pass
- No regressions

### Lint & Format
```
$ pnpm lint — ✓ PASS (no eslint issues)
$ pnpm format — ✓ PASS (biome format applied; 2 files fixed for consistency)
```

## Files Changed

```
✓ components/process-line.tsx (new)
✓ tests/components/process-line.test.tsx (new)
✓ app/[locale]/(public)/home/_components/process.tsx (modified)
```

### Untracked (not committed)
- CLAUDE.md (auto-generated)
- docs/superpowers/plans/2026-07-09-ai-robotic-redesign.md (auto-generated)

## Git Commit

**Commit SHA**: `67f09d5`  
**Message**: `feat(home): draw-on-scroll connector for process`  
**Branch**: `feature/ai-robotic-redesign`  
**Author**: kingnnt <dev.kingnnt@gmail.com>

```
$ git show 67f09d5 --stat

 app/[locale]/(public)/home/_components/process.tsx | 11 ++++++++---
 components/process-line.tsx                        | 13 +++++++++++++
 tests/components/process-line.test.tsx             | 18 ++++++++++++++++++
 3 files changed, 39 insertions(+), 3 deletions(-)
```

## Self-Review

### ✓ Correctness
- ProcessLine correctly implements the draw-line pattern with `useInView` hook
- `data-in-view` attribute toggles correctly based on intersection state
- Component is properly marked as client-side only
- No synchronous setState in effect — ESLint expectations met

### ✓ Integration Quality
- ProcessLine inserted at correct location (between heading and ol)
- ProcessLine is NOT inside `<ol>`, so doesn't affect listitem count (5 steps preserved)
- Step text unchanged ("Discovery" through "Operate" intact)
- All new classes (font-mono, hud-corners, relative, overflow-hidden) apply correctly
- Responsive: ProcessLine hidden on mobile (`hidden md:block`)

### ✓ Code Style
- Follows project conventions (single quotes, TypeScript types, import ordering)
- Minimal component — no over-engineering
- Uses existing utilities (useInView, cn)
- No new dependencies added

### ✓ Testing
- TDD workflow followed (RED → GREEN → integrate)
- Both targeted tests pass
- Full test suite passes (27 files, 44 tests)
- Existing process.test.tsx still passes (5 listitems assertion intact)

### ✓ Lint & Format
- eslint: no errors or warnings
- biome: formatting applied consistently
- No eslint-disable comments needed

## Concerns

None identified. Task completed per specification:
- ✓ TDD RED/GREEN workflow executed
- ✓ ProcessLine component implements draw-line utility correctly
- ✓ Integration maintains existing test assertions
- ✓ All tests pass (targeted + full suite)
- ✓ Lint and format clean
- ✓ Commit follows conventional commits (no Co-Authored-By)
- ✓ Only required files staged and committed
