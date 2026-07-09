# Task 8b Report: Global jsdom Mocks

## Final vitest.setup.ts Content

```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// Mock window.matchMedia for useReducedMotion
// Reports reduced motion is ON so animated components render deterministically
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: true,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

// Mock IntersectionObserver for useInView
// @ts-expect-error - minimal mock for testing
globalThis.IntersectionObserver = class MockIntersectionObserver {
  constructor(_callback: any, _options?: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
```

## Commands and Output

### Test Suite
```
$ pnpm test

 RUN  v4.1.10 /Users/kingnnt/Documents/workspaces/inviduality/kingnnt-dot-org/landing-page

Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package
Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package

 Test Files  26 passed (26)
      Tests  41 passed (41)
   Start at  12:21:58
   Duration  6.07s (transform 3.01s, setup 10.36s, import 5.30s, tests 3.20s, environment 28.52s)
```

### Lint Check
```
$ pnpm lint
$ eslint .
```
Clean — no issues.

## Commit
```
[feature/ai-robotic-redesign aeb8703] test: add jsdom matchMedia and IntersectionObserver mocks
 1 file changed, 26 insertions(+)
```

## Verification Results
- ✅ Full test suite passes: 26 test files, 41 tests total
- ✅ Linting passes: clean
- ✅ Mock coverage:
  - `matchMedia`: Reports reduced motion ON (matches: true) for deterministic animation rendering
  - `IntersectionObserver`: No-op class with required methods for useInView testing
- ✅ No breaking changes to existing tests (tests that stub their own matchMedia/IntersectionObserver locally still work via override)

## Concerns
None. Mocks are minimal, correctly typed with @ts-expect-error where needed, and do not interfere with per-test overrides.
