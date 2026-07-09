# Task 5: CountUp Primitive — Implementation Report

## Summary
Successfully implemented the `CountUp` primitive component that animates a number from 0→target when scrolled into view. The component uses `useInView` and `useReducedMotion` hooks, respects reduced-motion preferences, and renders the final value immediately under reduced motion or before scrolling into view.

## TDD Process

### RED Phase
Created `tests/components/count-up.test.tsx` with a single test case. Ran `pnpm exec vitest run tests/components/count-up.test.tsx` and confirmed failure: module import error (component didn't exist).

### GREEN Phase
Implemented `components/count-up.tsx` using the exact specification from the brief. Ran the test again and confirmed it passed immediately.

## Implementation Details

### Component Signature
```typescript
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
})
```

### Key Features
- **Reduced Motion Handling**: Renders final value immediately if `useReducedMotion()` is true
- **Scroll Detection**: Animates only when element is in view (using `useInView` hook)
- **Easing**: Uses cubic easing curve `1 - (1 - p)³` for smooth animation
- **Formatting**: Renders with monospace font (`font-mono`) and tabular-nums for consistent digit width
- **SSR Safe**: Initializes state with target value, updates to 0 when not in view

### Linting Gotcha Resolution
The brief warned about `react-hooks/set-state-in-effect` rule violations. Analysis showed only one line actually triggered the rule (the `setValue(to)` call in the reduced-motion branch). Added `// eslint-disable-next-line react-hooks/set-state-in-effect` only to that line. Removed unnecessary disable on `setValue(0)` which wasn't flagged by the linter.

## Test & Lint Results

### Full Test Suite
- **Result**: ✅ PASS
- **Output**: 24 test files, 37 tests — all passed
- **Duration**: 6.79s

### Linting
- **Result**: ✅ PASS
- **Output**: 0 errors, 0 warnings

## Files Changed
- Created: `components/count-up.tsx` (48 lines)
- Created: `tests/components/count-up.test.tsx` (26 lines, formatted by linter)

## Commit
- **SHA**: 664d267
- **Message**: `feat(ui): add CountUp primitive`
- **Branch**: feature/ai-robotic-redesign

## Self-Review vs. Brief

| Requirement | Status | Notes |
|-------------|--------|-------|
| Create `components/count-up.tsx` | ✅ | CLIENT component with "use client" directive |
| Create test file | ✅ | Exact test from brief; tests reduced-motion path |
| Export `CountUp` with correct props | ✅ | All props match brief signature |
| Use `useInView` + `useReducedMotion` | ✅ | Both hooks used correctly |
| Font styling | ✅ | `font-mono tabular-nums` applied |
| Reduced motion behavior | ✅ | Renders final value immediately when `reduced=true` |
| Animation easing | ✅ | Cubic easing `1 - (1 - p)³` implemented |
| Linting passes | ✅ | Fixed eslint-disable placement; 0 errors/warnings |
| Full test suite passes | ✅ | All 37 tests pass |
| Conventional commit | ✅ | `feat(ui): add CountUp primitive` format |
| No new dependencies | ✅ | Used existing hooks and utilities |

## Concerns
None. The implementation matches the brief exactly, all tests pass, linting passes, and the component integrates cleanly with the existing codebase hooks and utilities.

---

## Fix: Reduced-motion flash bug (review fix)

**Bug**: `useReducedMotion()` initializes to `false` before its own effect resolves the real value. On CountUp's first effect run with a `prefers-reduced-motion` user, `reduced` was still `false`, so execution fell into the `!inView` branch which called `setValue(0)` — zeroing the initial `useState(to)` state. This produced a visible `99% → 0% → 99%` flash for reduced-motion users.

**Fix applied** in `components/count-up.tsx`:
1. Changed initial state from `useState(to)` to `useState(0)`.
2. Removed the `setValue(0)` call from the `!inView` branch — it now just `return`s, leaving `value` at its initial `0`.

### Final effect code

```tsx
const [value, setValue] = useState(0);

useEffect(() => {
  if (reduced) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(to);
    return;
  }
  if (!inView) {
    return;
  }
  let raf = 0;
  let start = 0;
  const tick = (t: number) => {
    if (!start) start = t;
    const p = Math.min((t - start) / duration, 1);
    setValue(to * (1 - (1 - p) ** 3));
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [inView, reduced, to, duration]);
```

### Commands run and output

```
$ pnpm exec vitest run tests/components/count-up.test.tsx
 RUN  v4.1.10 /Users/kingnnt/Documents/workspaces/inviduality/kingnnt-dot-org/landing-page
 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  12:02:07
   Duration  1.50s (transform 28ms, setup 126ms, import 20ms, tests 22ms, environment 1.23s)

$ pnpm exec eslint components/count-up.tsx
(no output, exit 0)
```

### Commit

```
$ git add components/count-up.tsx && git commit -m "fix(ui): avoid reduced-motion flash in CountUp"
[feature/ai-robotic-redesign 6662fea] fix(ui): avoid reduced-motion flash in CountUp
 1 file changed, 1 insertion(+), 2 deletions(-)
```

Reasoning check: a reduced-motion user now sees at most `0 → to` (initial state 0, then the reduced-motion branch immediately sets `to`) — never `to → 0 → to`. No separate force-zero branch exists anymore.
