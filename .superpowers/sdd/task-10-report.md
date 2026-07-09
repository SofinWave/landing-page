# Task 10 Report: Restyle SiteHeader (Mono Nav + Status Dot) + i18n Key

## Status
✅ COMPLETED

## What Was Built

**Component Changes (components/site-header.tsx):**
- Updated desktop nav links with `font-mono text-xs uppercase tracking-wider` styling
- Added status indicator span in desktop actions bar with:
  - Glowing green dot (h-2 w-2 rounded-full bg-primary with accent-glow shadow)
  - Mono-styled text showing `{t("status")}` 
  - Hidden on md breakpoint, visible on lg+ (`hidden lg:inline-flex`)

**i18n Catalog Updates:**
- `messages/en.json`: Added `"status": "Available for work"` to `header` object
- `messages/vi.json`: Added `"status": "Đang nhận dự án"` to `header` object

**Test Additions:**
- New test in `site-header.test.tsx`: `shows the availability status`
  - Uses existing `renderHeader()` helper
  - Asserts presence of "Available for work" text via `getByText()`

## TDD Flow

**RED**: Added failing test `shows the availability status` that looked for "Available for work" text (not yet rendered).

**GREEN**: Implemented:
1. i18n keys in both catalogs
2. Component changes (mono nav, status indicator span)
3. Test passed after implementation

## Test Results

- **Parity Test** (`tests/messages/parity.test.ts`): ✓ PASS — both catalogs have identical key structure
- **Component Test** (`tests/components/site-header.test.tsx`): ✓ PASS (3/3 tests, incl. new status test)
- **Full Test Suite** (`pnpm test`): ✓ PASS (26 test files, 43 tests)
- **Lint** (`pnpm lint`): ✓ PASS (no violations)
- **Format** (`pnpm format`): ✓ PASS (91 files checked, no fixes needed)

## Files Changed

```
modified:   components/site-header.tsx             (+5 lines)
modified:   messages/en.json                       (+1 line)
modified:   messages/vi.json                       (+1 line)
modified:   tests/components/site-header.test.tsx  (+4 lines)
```

## Self-Review vs. Brief

✓ Nav links have mono class with correct styling (font-mono, text-xs, uppercase, tracking-wider)
✓ Status indicator added with dot + text, positioned as first child of desktop actions
✓ Dot styled correctly (h-2 w-2, rounded-full, bg-primary, accent-glow shadow)
✓ Status text uses `{t("status")}` correctly
✓ Span hidden on md, visible on lg (`hidden lg:inline-flex`)
✓ Both i18n catalogs updated with `header.status` key
✓ English: "Available for work" ✓ Vietnamese: "Đang nhận dự án"
✓ Test uses `renderHeader()` helper as instructed
✓ Parity test passes — identical key structure maintained
✓ No new dependencies added
✓ Conventional Commits format, no `Co-Authored-By`

## Concerns
None. All requirements met, full test suite passes, both catalogs in parity.

## Git Commit
```
14faf27 feat(home): mono nav and availability status in header
```
