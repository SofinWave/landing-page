# Design: Biome Formatter cho Landing Page

- **Ngày:** 2026-07-09
- **Trạng thái:** Approved (pending implementation)
- **Phạm vi:** Thiết lập Biome làm formatter duy nhất; giữ nguyên ESLint; thêm CI guard.

## 1. Mục tiêu & phạm vi

**Mục tiêu:** Thiết lập Biome làm công cụ formatting duy nhất (thay thế vai trò Prettier chưa từng có trong repo), giữ nguyên ESLint + `eslint-config-next` làm linter. Tích hợp vào local pre-commit hook (lint-staged) và CI (GitHub Actions).

**Không trong phạm vi:**
- Không thay ESLint (giữ `eslint-config-next` cho các rule chuyên biệt Next.js như `@next/next/no-img-element`, `no-html-link-for-pages`, ...).
- Không sửa style/nội dung source code hiện có ngoài những gì Biome format tự động reformat.
- Không thay đổi cấu trúc test/build hiện tại.
- Không cấu hình VSCode settings (defer — user tự thêm nếu cần).

## 2. Quyết định

| Quyết định | Lựa chọn | Lý do |
|------------|----------|-------|
| Vai trò Biome | Chỉ formatter, không lint | Tránh chồng chéo rule với ESLint + `eslint-config-next` |
| Cấu trúc config | File `biome.json` riêng ở root (A1) | Tách bạch, rõ ràng, dễ CI |
| lint-staged | Chạy cả Biome + ESLint (B1) | Format trước, lint sau — hàng rào local đầy đủ |
| Phạm vi file | `*.{ts,tsx,js,jsx,mjs,mts,json,jsonc,css}` (B) | Đồng bộ style toàn diện |
| CI | Tạo mới GitHub Actions workflow (3b-i) | Repo chưa có CI; guard format + lint trên PR/push |

## 3. Kiến trúc

Hai lớp tooling tách bạch:

| Lớp | Công cụ | Trách nhiệm |
|-----|---------|-------------|
| **Formatter** | Biome (mới) | Căn chỉnh code style cho JS/TS/JSON/CSS/MJS/MTS/JSONC |
| **Linter** | ESLint 9 + `eslint-config-next` (giữ nguyên) | Rule Next.js + rule JS chung |

**Thứ tự thực thi:** Biome format → ESLint fix. Áp dụng đồng nhất ở local (lint-staged) và CI.

## 4. Thành phần chi tiết

### 4a. `biome.json` (file mới ở root)

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
      "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx",
      "**/*.mjs", "**/*.mts", "**/*.json", "**/*.jsonc", "**/*.css"
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
    "formatter": { "trailingCommas": "none" }
  },
  "linter": { "enabled": false }
}
```

**Lý do chọn thông số:**
- `quoteStyle: double`, `semicolons: always` → khớp style hiện tại trong repo.
- `linter.enabled: false` → đảm bảo chỉ Biome formatter chạy, không xung đột ESLint.
- `useIgnoreFile: true` → Biome tự respect `.gitignore`, không format `node_modules`, `.next`, ...
- `lineWidth: 100` → chuẩn phổ biến.

### 4b. Scripts mới trong `package.json`

Giữ nguyên `lint` / `lint:fix` (ESLint), thêm:

```jsonc
"format": "biome format --write",
"format:check": "biome format"
```

> **Note (Biome v2):** The `--check` flag was removed in Biome 2.x. The read-only check mode is invoked with bare `biome format` (non-zero exit on unformatted files), and writing is done with `biome format --write`.

### 4c. Cập nhật `.lintstagedrc.json`

```jsonc
{
  "*.{ts,tsx,js,jsx,mjs,mts,json,jsonc,css}": ["biome format --write"],
  "*.{ts,tsx}": ["eslint --fix"]
}
```

**Lý do chia 2 entry:**
- Biome format áp cho toàn bộ phạm vi file.
- ESLint chỉ áp cho `*.{ts,tsx}` (giống scope hiện tại của repo).
- Thứ tự `lint-staged`: chạy theo thứ tự xuất hiện của key — đặt Biome trước, ESLint sau để format-xong-rồi-lint.

### 4d. `package.json` devDependencies

Thêm:
- `@biomejs/biome`: `^2.5.2` (stable mới nhất tính đến 2026-07-09)

### 4e. GitHub Actions workflow (file mới)

`.github/workflows/lint-format.yml`:

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
          node-version-file: ".mise.toml"
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
```

**Lý do:**
- `node-version-file: .mise.toml` → sync Node version với mise (repo đang dùng mise).
- Thứ tự: `format:check` (Biome) trước, `lint` (ESLint) sau — cùng thứ tự local.
- Trigger trên PR vào `main` và push `main` — không chạy thừa.

## 5. Data flow / Thực thi

```
Local dev sửa code → git add → git commit
                                    ↓
                          husky/pre-commit
                                    ↓
                          lint-staged (2 entry):
                            1. biome format --write  (match file staged)
                            2. eslint --fix           (chỉ ts/tsx)
                                    ↓
                          commit thành công

PR/push → GitHub Actions → format:check + lint → pass/fail
```

## 6. Migration: format toàn bộ codebase hiện tại

Một lần chạy `pnpm format` để Biome reformat toàn bộ source theo config mới, commit riêng: `style: format codebase with Biome`. Việc này giúp lịch sử git sạch sau này — các commit tiếp theo chỉ thấy diff logic, không lẫn diff format.

## 7. Testing & verification

Sau khi setup xong:
1. Chạy `pnpm format:check` → fail lần đầu (code chưa format) → chạy `pnpm format` → pass.
2. `pnpm lint` vẫn phải pass (không ảnh hưởng ESLint).
3. Tạo 1 file `.ts` sai format → `git commit` → verify lint-staged tự format.
4. Tạo PR thử → verify CI workflow chạy và pass.
