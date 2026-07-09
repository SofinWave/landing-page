# Biome Formatter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Biome as the sole code formatter for the landing-page project, replacing the absent Prettier, while keeping ESLint + `eslint-config-next` for linting; integrate into lint-staged and add a GitHub Actions CI guard.

**Architecture:** Two-layer tooling — Biome (formatter only, linter disabled) and ESLint (linter, unchanged). Execution order is Biome-format-then-ESLint-fix in both lint-staged (local pre-commit) and CI. A `biome.json` at root holds all formatter config; ESLint config stays untouched.

**Tech Stack:** Biome 2.5.2, ESLint 9 (existing), pnpm, Node 22. GitHub Actions for CI.

**Spec:** `docs/superpowers/specs/2026-07-09-biome-formatter-design.md`

**Spec deviation (noted):** The spec's CI step referenced `node-version-file: ".mise.toml"`, but `.mise.toml` contains no node version (only mise task comments). This plan pins `node-version: "22.15.0"` in the workflow instead, matching the project's Docker runtime (`FROM node:22.15.0` in `.docker/development/node/Dockerfile`).

**Verification approach:** This is a config/tooling task, not a feature with unit tests. Each task verifies via runnable commands (`pnpm format:check`, `pnpm lint`, manual hook test) instead of unit tests.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `biome.json` | Create | Root config: formatter settings, file scope, linter disabled |
| `package.json` | Modify | Add `format` / `format:check` scripts; add `@biomejs/biome` devDependency |
| `.lintstagedrc.json` | Modify | Run Biome format (all files) + ESLint fix (ts/tsx) on staged files |
| `.github/workflows/lint-format.yml` | Create | CI guard: `format:check` + `lint` on PR/push to `main` |

No source files are hand-edited; Task 3 runs `pnpm format` to auto-reformat the existing codebase.

---

### Task 1: Add Biome config, dependency, and scripts

**Files:**
- Create: `biome.json`
- Modify: `package.json` (devDependencies + scripts)

- [ ] **Step 1: Create `biome.json` at project root**

Create `biome.json` with exactly this content:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.5.2/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "includes": [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.mts",
      "**/*.json",
      "**/*.jsonc",
      "**/*.css"
    ],
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all",
      "lineEnding": "lf"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "linter": {
    "enabled": false
  }
}
```

- [ ] **Step 2: Install Biome as a devDependency**

Run:
```bash
pnpm add -D @biomejs/biome@2.5.2
```
Expected: `@biomejs/biome` `2.5.2` appears under `devDependencies` in `package.json`, and `pnpm-lock.yaml` updates.

- [ ] **Step 3: Add format scripts to `package.json`**

In `package.json`, add these two entries to the `"scripts"` object (keep all existing scripts unchanged):

```jsonc
"format": "biome format --write",
"format:check": "biome format"
```

> **Biome v2 note:** The `--check` flag was removed in Biome 2.x. Read-only check mode is `biome format` (exits non-zero on unformatted files); writing is `biome format --write`.

The final `"scripts"` block should read:
```jsonc
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "biome format --write",
  "format:check": "biome format --check",
  "prepare": "husky",
  "test": "vitest run",
  "test:watch": "vitest"
},
```

- [ ] **Step 4: Verify Biome runs**

Run:
```bash
pnpm format:check
```
Expected: Biome runs and reports files that are not formatted (exit code non-zero). This is expected and correct at this stage — the codebase has not been formatted yet. The important thing is that Biome executes without config errors.

If you instead see a config/parse error from `biome.json`, fix the JSON before continuing.

- [ ] **Step 5: Verify ESLint is unaffected**

Run:
```bash
pnpm lint
```
Expected: ESLint runs exactly as before (Biome has not changed any source files yet). It should pass with no errors.

- [ ] **Step 6: Commit**

```bash
git add biome.json package.json pnpm-lock.yaml
git commit -m "build: add Biome formatter config and scripts

Add biome.json with formatter-only config (linter disabled to avoid
overlap with ESLint). Add format and format:check scripts. Biome 2.5.2
replaces the absent Prettier as the project formatter."
```

---

### Task 2: Update lint-staged to run Biome + ESLint

**Files:**
- Modify: `.lintstagedrc.json`

- [ ] **Step 1: Replace `.lintstagedrc.json` contents**

Overwrite `.lintstagedrc.json` with exactly:

```jsonc
{
  "*.{ts,tsx,js,jsx,mjs,mts,json,jsonc,css}": ["biome format --write"],
  "*.{ts,tsx}": ["eslint --fix"]
}
```

Rationale: Biome formats all in-scope file types; ESLint fixes only ts/tsx (matching the repo's existing ESLint scope). `lint-staged` runs keys in order, so Biome formats first, then ESLint fixes.

- [ ] **Step 2: Verify the hook still resolves**

Run:
```bash
pnpm exec lint-staged --help >/dev/null && echo "lint-staged OK"
```
Expected: prints `lint-staged OK` (confirms config parses without errors).

- [ ] **Step 3: Commit**

```bash
git add .lintstagedrc.json
git commit -m "build: run Biome format and ESLint fix in lint-staged

Biome formats all in-scope file types first, then ESLint fixes ts/tsx,
matching the project's existing ESLint scope."
```

---

### Task 3: One-time codebase reformat

**Files:**
- No hand-edits. Biome rewrites in-scope files automatically.

- [ ] **Step 1: Run the formatter across the whole codebase**

Run:
```bash
pnpm format
```
Expected: Biome rewrites all in-scope files to match the configured style. A summary of formatted files is printed.

- [ ] **Step 2: Verify ESLint still passes after reformatting**

Run:
```bash
pnpm lint
```
Expected: PASS (no errors). If ESLint now reports errors introduced by formatting, do NOT disable rules — investigate; Biome and ESLint are in separate layers and formatting should not break lint rules. (If a genuine conflict arises, pause and ask the user before changing any config.)

- [ ] **Step 3: Verify format:check now passes**

Run:
```bash
pnpm format:check
```
Expected: PASS (exit code 0). The codebase is now fully formatted.

- [ ] **Step 4: Review the diff**

Run:
```bash
git status
git diff --stat
```
Review that only in-scope files changed and changes are purely formatting (whitespace, quotes, commas, line endings). If anything looks like a logic change, investigate before committing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style: format codebase with Biome

One-time reformat of all in-scope files (ts, tsx, js, jsx, mjs, mts,
json, css) to the Biome formatter baseline. No logic changes."
```

---

### Task 4: Add GitHub Actions CI guard

**Files:**
- Create: `.github/workflows/lint-format.yml`

- [ ] **Step 1: Create the workflow directory**

Run:
```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create `.github/workflows/lint-format.yml`**

Create the file with exactly this content:

```yaml
name: Lint & Format

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  check:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22.15.0"
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
```

Notes:
- `node-version: "22.15.0"` matches the project Docker runtime (`.docker/development/node/Dockerfile` → `FROM node:22.15.0`). The spec suggested `node-version-file: ".mise.toml"` but `.mise.toml` contains no node version, so the version is pinned here instead.
- `pnpm/action-setup@v4` must run BEFORE `actions/setup-node@v4` so that setup-node can detect pnpm for caching. The pnpm version is read automatically from the `packageManager` field or `pnpm-lock.yaml`; if neither pins a version, action-setup uses its bundled default.
- Steps run in order: format check first, lint second — same order as lint-staged.

- [ ] **Step 3: Validate the workflow YAML locally**

Run:
```bash
pnpm exec biome format --check .github/workflows/lint-format.yml 2>/dev/null; echo "exit: $?"
```
Expected: Biome reports it is already formatted (exit 0) or skips it as unknown. (YAML is not in Biome's formatter scope, so it may report `ignoreUnknown` skip — either is fine; the goal is no crash.) The key check is that the YAML is syntactically valid.

Optionally verify YAML parses:
```bash
node -e "const fs=require('fs');const yaml=require('js-yaml');yaml.load(fs.readFileSync('.github/workflows/lint-format.yml','utf8'));console.log('YAML OK')" 2>/dev/null || echo "js-yaml not installed — visual review only"
```
Expected: `YAML OK` or `js-yaml not installed — visual review only`. Do a careful visual review of indentation (2 spaces per level) regardless.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/lint-format.yml
git commit -m "ci: add lint & format check workflow

Run biome format:check and eslint on PRs and pushes to main. Pins
Node to 22.15.0 to match the Docker runtime. Uses pnpm with caching."
```

---

### Task 5: End-to-end verification

**Files:**
- None modified. This task verifies the full pipeline.

- [ ] **Step 1: Verify both check commands pass clean**

Run:
```bash
pnpm format:check && pnpm lint && echo "ALL CHECKS PASS"
```
Expected: `ALL CHECKS PASS`.

- [ ] **Step 2: Verify lint-staged formats a malformed file**

Create a temporary malformed file:
```bash
printf 'export const __biome_probe={a:1,b:2,c:3}\n' > app/__biome_probe.ts
git add app/__biome_probe.ts
git commit -m "test: biome probe" 2>&1
```
Note: the probe is an `export` so ESLint's `no-unused-vars` will not flag it and block the commit.

Expected: the commit succeeds, and during the commit you see lint-staged invoke Biome (and ESLint) on the probe file. After commit, inspect the file:
```bash
cat app/__biome_probe.ts
```
Expected: Biome has reformatted it, e.g.:
```ts
export const __biome_probe = { a: 1, b: 2, c: 3 };
```
(spaces around braces/colons, trailing semicolon added — per config).

- [ ] **Step 3: Remove the probe file**

```bash
git rm app/__biome_probe.ts
git commit -m "chore: remove biome probe"
```
(If commitlint requires a scope, use `chore: remove biome probe file`.)

- [ ] **Step 4: Verify CI triggers (manual, on push)**

Push the branch and open a PR against `main`. Observe the **Lint & Format** workflow run and pass. (If you cannot push/PR from this environment, note this step as deferred and confirm the workflow file is committed and syntactically valid from Task 4 Step 3.)

- [ ] **Step 5: Final clean-state confirmation**

Run:
```bash
git status
pnpm format:check && pnpm lint && echo "CLEAN"
```
Expected: `nothing to commit, working tree clean` and `CLEAN`.
