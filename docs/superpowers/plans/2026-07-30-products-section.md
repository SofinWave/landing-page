# Products Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show SofinWave's two own products — SmartFinTrack and Tử Vi Đẩu Số — as a section on the tech landing page and as a `/products` content route, with `SoftwareApplication` schema.

**Architecture:** Copy lives in the `products` namespace (home section) and `pages.products` (route) of both message catalogs. A new `Products` section component reads `products` and renders server-side markup only. The route is registered in `lib/routes.ts`, which automatically feeds sitemap, `llms.txt`, and breadcrumbs. `PageStructuredData` emits one `SoftwareApplication` per catalog item, guarded to the tech site's `/products` path.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, next-intl, Tailwind v4, shadcn/ui, lucide-react, Vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-07-30-products-section-design.md`

## Global Constraints

- Every new message key must exist in **all three** catalogs — `messages/en.json`, `messages/vi.json`, `messages/zh.json` — with identical structure. `tests/messages/parity.test.ts` checks every locale in `routing.locales` against English and fails otherwise. (The repo's CLAUDE.md still describes the site as bilingual; it is stale — `enums/locale.enum.ts` carries `EN`, `VI`, `ZH`.)
- Everything a crawler must read has to be in the server-rendered HTML. No `CountUp`, no accordion, no text revealed only after hydration.
- Never emit `aggregateRating` or `review` in any schema node.
- The product catalog is tech-site only. It must not appear in media, finance, or academy schema or routes.
- Internal navigation uses `Link` from `@/i18n/navigation`, never `next/link`. External product URLs use a plain `<a>`.
- No metrics, no user counts, no invented features. The four features per product listed in this plan are the confirmed set; do not add to them.
- Formatting is Biome: 2-space indent, 100 columns, double quotes, semicolons, trailing commas. Run `pnpm format` before committing.
- Branch is `feature/products-section`. Commits follow Conventional Commits; no `Co-Authored-By` or attribution lines.

---

### Task 1: Home-section copy in both catalogs

**Files:**
- Modify: `messages/en.json` (add top-level `products` key, after `ecosystem`)
- Modify: `messages/vi.json` (same position)
- Modify: `messages/zh.json` (same position)
- Test: `tests/messages/products.test.ts` (create)

**Interfaces:**
- Consumes: nothing
- Produces: the `products` message namespace, shaped
  `{ heading: string, lede: string, ctaLabel: string, items: Product[] }` where
  `Product = { key: string, name: string, blurb: string, price: string, languages: string, features: string[], href: string, host: string }`.
  `key` is `"smartfintrack"` or `"tuvidauso"`. Tasks 2 and 5 both read this namespace.

- [ ] **Step 1: Write the failing test**

Create `tests/messages/products.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import zh from "@/messages/zh.json";

const catalogs = { en: en.products, vi: vi.products, zh: zh.products };

describe("products catalog", () => {
  for (const [locale, products] of Object.entries(catalogs)) {
    describe(locale, () => {
      it("lists both products in a stable order", () => {
        expect(products.items.map((p) => p.key)).toEqual(["smartfintrack", "tuvidauso"]);
      });

      it("gives each product exactly four features", () => {
        for (const product of products.items) {
          expect(product.features).toHaveLength(4);
        }
      });

      it("points at the live product hosts over https", () => {
        expect(products.items.map((p) => p.href)).toEqual([
          "https://smartfintrack.kingnnt.org",
          "https://tuvidauso.kingnnt.org",
        ]);
      });

      it("shows the bare host, matching the href", () => {
        for (const product of products.items) {
          expect(product.href).toBe(`https://${product.host}`);
        }
      });

      it("claims no metrics", () => {
        const prose = products.items.flatMap((p) => [p.blurb, ...p.features]).join(" ");
        expect(prose).not.toMatch(/\d+\s*(%|k\b|users|customers|downloads)/i);
      });
    });
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm exec vitest run tests/messages/products.test.ts`
Expected: FAIL — `Cannot read properties of undefined (reading 'items')`, because `products` does not exist in either catalog.

- [ ] **Step 3: Add the English copy**

In `messages/en.json`, insert this key immediately after the closing brace of `"ecosystem"` and before `"pages"`:

```json
  "products": {
    "heading": "Products we build and run",
    "lede": "Two applications of our own, both free to use. We carry the cost of running them, which is the only honest way to show we can ship software and keep it alive.",
    "ctaLabel": "More about our products",
    "items": [
      {
        "key": "smartfintrack",
        "name": "SmartFinTrack",
        "blurb": "Personal finance management. Log income and expenses by category, set monthly budgets, track assets and investments, and read it all back as reports and charts.",
        "price": "Free",
        "languages": "Vietnamese / English",
        "features": [
          "Income and expenses by category",
          "Monthly budgets and limits",
          "Assets and investments",
          "Reports and charts"
        ],
        "href": "https://smartfintrack.kingnnt.org",
        "host": "smartfintrack.kingnnt.org"
      },
      {
        "key": "tuvidauso",
        "name": "Tử Vi Đẩu Số",
        "blurb": "Casts a Zi Wei Dou Shu astrology chart from a birth date and time — solar or lunar calendar, leap months included — across the twelve palaces with major stars and five elements, then reads it back in detail with AI.",
        "price": "Free to cast; sign in to save charts",
        "languages": "Vietnamese / English",
        "features": [
          "Chart cast from birth date and time",
          "Solar or lunar calendar, leap months included",
          "Twelve palaces, major stars, five elements",
          "Detailed AI interpretation"
        ],
        "href": "https://tuvidauso.kingnnt.org",
        "host": "tuvidauso.kingnnt.org"
      }
    ]
  },
```

- [ ] **Step 4: Add the Vietnamese copy**

In `messages/vi.json`, at the same position:

```json
  "products": {
    "heading": "Sản phẩm chúng tôi tự làm và tự vận hành",
    "lede": "Hai ứng dụng của chính chúng tôi, đều miễn phí. Chúng tôi tự chịu chi phí vận hành chúng — cách trung thực nhất để cho thấy mình làm ra được sản phẩm và giữ nó sống.",
    "ctaLabel": "Tìm hiểu thêm về sản phẩm",
    "items": [
      {
        "key": "smartfintrack",
        "name": "SmartFinTrack",
        "blurb": "Hệ thống quản lý tài chính cá nhân. Ghi nhận thu chi theo danh mục, đặt ngân sách theo tháng, theo dõi tài sản và khoản đầu tư, rồi đọc lại tất cả bằng báo cáo và biểu đồ.",
        "price": "Miễn phí",
        "languages": "Tiếng Việt / English",
        "features": [
          "Thu chi theo danh mục",
          "Ngân sách và hạn mức theo tháng",
          "Tài sản và khoản đầu tư",
          "Báo cáo và biểu đồ"
        ],
        "href": "https://smartfintrack.kingnnt.org",
        "host": "smartfintrack.kingnnt.org"
      },
      {
        "key": "tuvidauso",
        "name": "Tử Vi Đẩu Số",
        "blurb": "Lập lá số tử vi từ ngày giờ sinh — dương lịch hoặc âm lịch, có hỗ trợ tháng nhuận — an sao vào mười hai cung kèm chính tinh và ngũ hành, rồi luận giải chi tiết bằng AI.",
        "price": "Lập lá số miễn phí; đăng nhập để lưu lá số",
        "languages": "Tiếng Việt / English",
        "features": [
          "Lập lá số từ ngày giờ sinh",
          "Dương lịch hoặc âm lịch, hỗ trợ tháng nhuận",
          "Mười hai cung, chính tinh, ngũ hành",
          "Luận giải chi tiết bằng AI"
        ],
        "href": "https://tuvidauso.kingnnt.org",
        "host": "tuvidauso.kingnnt.org"
      }
    ]
  },
```

- [ ] **Step 5: Add the Chinese copy**

In `messages/zh.json`, at the same position. Translate the English faithfully.
`key`, `href`, and `host` are identifiers, not copy — they stay byte-identical
across all three catalogs. `languages` describes what the *products* support,
which is Vietnamese and English regardless of what locale the visitor is
reading in.

- [ ] **Step 6: Run the tests and verify they pass**

Run: `pnpm exec vitest run tests/messages/`
Expected: PASS — both `products.test.ts` and `parity.test.ts` green. If parity fails, the catalogs have drifted; diff the blocks above key by key.

- [ ] **Step 7: Format and commit**

```bash
pnpm format
git add messages/ tests/messages/products.test.ts
git commit -m "feat(content): add product catalog copy for the tech site"
```

---

### Task 2: The `Products` home section

**Files:**
- Create: `app/[site]/[locale]/(public)/home/_components/products.tsx`
- Modify: `app/[site]/[locale]/(public)/home/page.tsx` (import + render between `<CaseStudies />` and `<TechStack />`)
- Modify: `app/[site]/[locale]/(public)/home/_components/tech-stack.tsx:25` (`index={4}` → `index={5}`)
- Modify: `app/[site]/[locale]/(public)/home/_components/team.tsx:28` (`index={6}` → `index={7}`)
- Modify: `app/[site]/[locale]/(public)/home/_components/ecosystem.tsx:29` (`index={7}` → `index={8}`)
- Modify: `app/[site]/[locale]/(public)/home/_components/faq.tsx:23` (`index={8}` → `index={9}`)
- Test: `tests/sections/products.test.tsx` (create)

**Interfaces:**
- Consumes: the `products` message namespace from Task 1.
- Produces: `export function Products()` from `@/app/[site]/[locale]/(public)/home/_components/products`. Takes no props, like every other home section.

- [ ] **Step 1: Write the failing test**

Create `tests/sections/products.test.tsx`, modelled on `tests/sections/ecosystem.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
// Aliased because `vi` is vitest's own export, which this file needs for the
// mock below — `tests/sections/footer.test.tsx` aliases it the same way.
import viMessages from "@/messages/vi.json";

// Repo convention: the real `Link` needs the intl router, which does not exist
// under jsdom. The locale prefixing it performs is covered by the routing tests.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { Products } from "@/app/[site]/[locale]/(public)/home/_components/products";

function renderAt(locale: "en" | "vi") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? en : viMessages}>
      <Products />
    </NextIntlClientProvider>,
  );
}

describe("Products section", () => {
  it("names both products", () => {
    renderAt("en");

    expect(screen.getByText("SmartFinTrack")).toBeInTheDocument();
    expect(screen.getByText("Tử Vi Đẩu Số")).toBeInTheDocument();
  });

  it("links each card out to the live product", () => {
    renderAt("en");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("https://smartfintrack.kingnnt.org");
    expect(hrefs).toContain("https://tuvidauso.kingnnt.org");
  });

  it("links through to the products page", () => {
    renderAt("en");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/products");
  });

  // Answer-engine crawlers do not execute JavaScript. Every feature has to be
  // in the markup, not behind an interaction.
  it("renders every feature of every product as text", () => {
    renderAt("en");

    for (const product of en.products.items) {
      for (const feature of product.features) {
        expect(screen.getByText(feature)).toBeInTheDocument();
      }
    }
  });

  it("states the price and the interface languages", () => {
    renderAt("en");

    expect(screen.getByText(/Free · Vietnamese \/ English/)).toBeInTheDocument();
  });

  it("renders the Vietnamese catalog under the vi locale", () => {
    renderAt("vi");

    expect(screen.getByText(viMessages.products.heading)).toBeInTheDocument();
    expect(screen.getByText("Luận giải chi tiết bằng AI")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm exec vitest run tests/sections/products.test.tsx`
Expected: FAIL — `Failed to resolve import ".../home/_components/products"`.

- [ ] **Step 3: Write the component**

Create `app/[site]/[locale]/(public)/home/_components/products.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { ArrowUpRight, Sparkles, Wallet } from "lucide-react";
import { Section } from "@/components/section";
import { HudCard } from "@/components/hud-card";
import { Reveal } from "@/components/reveal";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type Product = {
  key: string;
  name: string;
  blurb: string;
  price: string;
  languages: string;
  features: string[];
  href: string;
  host: string;
};

/**
 * Icons are keyed by the catalog's untranslated `key`, not by product name —
 * the name is copy and differs per locale.
 */
const ICONS: Record<string, typeof Wallet> = {
  smartfintrack: Wallet,
  tuvidauso: Sparkles,
};

/**
 * SofinWave's own products, on the tech landing page.
 *
 * Sits next to Case Studies on purpose: work delivered for clients, then
 * software we run ourselves. Every feature is plain markup — the answer-engine
 * crawlers do not execute JavaScript, so nothing here may depend on hydration.
 */
export function Products() {
  const t = useTranslations("products");
  const items = t.raw("items") as Product[];

  return (
    <Section id="products" index={4} label="Products">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("heading")}</h2>
        <p className="mt-3 text-muted-foreground">{t("lede")}</p>
      </div>
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-2">
          {items.map((product) => {
            const Icon = ICONS[product.key];
            return (
              <a key={product.key} href={product.href} className="group block h-full">
                <HudCard className="flex h-full flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {Icon ? <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" /> : null}
                      <CardTitle className="flex items-center gap-1.5 text-2xl">
                        {product.name}
                        <ArrowUpRight
                          aria-hidden
                          className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
                        />
                      </CardTitle>
                    </div>
                    <p className="pt-2 font-mono text-xs tracking-wider text-muted-foreground">
                      {product.price} · {product.languages}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="leading-relaxed text-muted-foreground">{product.blurb}</p>
                    <ul className="space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-sm text-muted-foreground">
                          <span
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                            aria-hidden
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto border-t border-border pt-4 font-mono text-xs text-muted-foreground/80">
                      {product.host}
                    </span>
                  </CardContent>
                </HudCard>
              </a>
            );
          })}
        </div>
      </Reveal>
      <div className="mt-10 text-center">
        <Link
          href="/products"
          className="font-mono text-sm text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
        >
          {t("ctaLabel")}
        </Link>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `pnpm exec vitest run tests/sections/products.test.tsx`
Expected: PASS, all six tests.

If `getByText` reports multiple matches on a feature string, the same wording appears in two products — reword one in the catalog rather than loosening the assertion.

- [ ] **Step 5: Render the section on the home page**

In `app/[site]/[locale]/(public)/home/page.tsx`, add the import after the `CaseStudies` import:

```tsx
import { Products } from "./_components/products";
```

and render it between `<CaseStudies />` and `<TechStack />`:

```tsx
        <CaseStudies />
        <Products />
        <TechStack />
```

- [ ] **Step 6: Renumber the section labels below it**

`Products` claims index 4, so each labelled section after it shifts by one. `Testimonials` carries no label and is not touched.

- `_components/tech-stack.tsx`: `<Section index={4} label="Tech Stack">` → `index={5}`
- `_components/team.tsx`: `<Section index={6} label="Team">` → `index={7}`
- `_components/ecosystem.tsx`: `<Section index={7} label="Ecosystem">` → `index={8}`
- `_components/faq.tsx`: `<Section className="max-w-3xl" index={8} label="FAQ">` → `index={9}`

- [ ] **Step 7: Run the full suite and the build**

Run: `pnpm exec vitest run && pnpm lint`
Expected: PASS. Section-index changes are cosmetic and no test asserts them, so nothing else should move.

- [ ] **Step 8: Format and commit**

```bash
pnpm format
git add app/ tests/sections/products.test.tsx
git commit -m "feat(home): add the products section to the tech landing page"
```

---

### Task 3: The `/products` route and its page copy

**Files:**
- Modify: `lib/routes.ts` (add the route to `TECH_ROUTES`; bump `CONTENT_LAST_MODIFIED`)
- Modify: `messages/en.json` (add `pages.products`)
- Modify: `messages/vi.json` (add `pages.products`)
- Modify: `messages/zh.json` (add `pages.products` — translate the English below; the
  `href` and `label` values in `links` stay identical across all three catalogs)
- Test: `tests/lib/routes.test.ts` (extend)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: a `RouteDef` with `path: "products"` and `key: "products"` in `routesFor(SiteId.Tech)`, and a `pages.products` entry matching `ContentPageData` from `components/content-page.tsx`. Task 5 keys its schema guard on `path === "products"`.

- [ ] **Step 1: Write the failing test**

Append to `tests/lib/routes.test.ts`:

```ts
describe("products route", () => {
  it("is registered on the tech site under the home page", () => {
    const route = findRoute(SiteId.Tech, "products");

    expect(route).toBeDefined();
    expect(route?.key).toBe("products");
    expect(route?.parent).toBe(HOME_PATH);
  });

  // The product catalog belongs to the consultancy. A media or academy site
  // advertising a personal-finance app would misdescribe the entity.
  it("exists on no other site", () => {
    for (const site of [SiteId.Media, SiteId.Finance, SiteId.Academy]) {
      expect(findRoute(site, "products")).toBeUndefined();
    }
  });
});
```

Make sure `findRoute`, `HOME_PATH`, and `SiteId` are imported at the top of the file; add whichever are missing.

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm exec vitest run tests/lib/routes.test.ts`
Expected: FAIL — `expected undefined to be defined` on the first assertion.

- [ ] **Step 3: Register the route**

In `lib/routes.ts`, inside `TECH_ROUTES`, insert directly after the `ventures` entry (before the `services` block):

```ts
  // Our own software, not client work. Kept as one page: neither product has
  // enough behind it to fill a page of its own without padding, and thin pages
  // cost more topical authority than they earn.
  {
    path: "products",
    key: "products",
    parent: HOME_PATH,
    priority: 0.8,
    changeFrequency: "monthly",
  },
```

- [ ] **Step 4: Bump the content date**

In `lib/routes.ts`, change:

```ts
export const CONTENT_LAST_MODIFIED = "2026-07-29";
```

to:

```ts
export const CONTENT_LAST_MODIFIED = "2026-07-30";
```

The catalogs genuinely change in this work, so the date is earned.

- [ ] **Step 5: Add the English page copy**

In `messages/en.json`, inside `"pages"`, add a `"products"` entry after `"ventures"`:

```json
    "products": {
      "navLabel": "Products",
      "title": "Products",
      "metaTitle": "Products — Software SofinWave Builds and Runs",
      "metaDescription": "SofinWave builds and runs two products of its own: SmartFinTrack, a personal finance manager, and Tử Vi Đẩu Số, which casts and interprets Zi Wei Dou Shu astrology charts with AI. Both are free to use.",
      "lede": "SofinWave builds and runs two products of its own, both free to use: SmartFinTrack, a personal finance manager, and Tử Vi Đẩu Số, which casts and interprets Zi Wei Dou Shu astrology charts with AI. They are built by the same team, to the same standards, as the software we build for clients.",
      "sections": [
        {
          "heading": "SmartFinTrack — personal finance management",
          "body": "A place to see where the money actually goes. You log income and expenses against categories, set what each category is allowed for the month, record the assets and investments you hold, and read the whole picture back as reports and charts. It is free, and the interface is available in Vietnamese and English.",
          "bullets": [
            "Income and expenses by category",
            "Monthly budgets and limits",
            "Assets and investments",
            "Reports and charts"
          ],
          "links": [{ "href": "https://smartfintrack.kingnnt.org", "label": "smartfintrack.kingnnt.org" }]
        },
        {
          "heading": "Tử Vi Đẩu Số — chart casting and AI interpretation",
          "body": "Zi Wei Dou Shu, or Purple Star astrology, places stars into twelve palaces derived from a birth date and time. The tool does that casting automatically — solar or lunar calendar, leap months included — showing the twelve palaces with their major stars and five elements, then producing a detailed AI reading. Casting a chart is free; signing in saves your charts. Available in Vietnamese and English.",
          "bullets": [
            "Chart cast from birth date and time",
            "Solar or lunar calendar, leap months included",
            "Twelve palaces, major stars, five elements",
            "Detailed AI interpretation"
          ],
          "links": [{ "href": "https://tuvidauso.kingnnt.org", "label": "tuvidauso.kingnnt.org" }]
        },
        {
          "heading": "Why we build our own products",
          "body": "Consulting advice is cheap to give and expensive to live with. Running our own applications means we carry the consequences of our own recommendations — the deployment, the bug reports, the cost of keeping something up long after launch. The products are built by the same engineers, on the same stack, under the same standards as client work, which is what makes them evidence rather than decoration."
        }
      ],
      "faq": [
        {
          "question": "Are SofinWave's products free?",
          "answer": "Yes. SmartFinTrack is free to use, and casting a chart on Tử Vi Đẩu Số is free. Neither has a paid plan today."
        },
        {
          "question": "Do I need an account?",
          "answer": "SmartFinTrack requires an account, because it stores your own financial records. Tử Vi Đẩu Số casts a chart without one; signing in lets you save charts and read the detailed AI interpretation."
        },
        {
          "question": "Can SofinWave build something like this for us?",
          "answer": "Yes — that is the consulting business. Both products were built by the same team that takes on client work, using the same architecture and delivery process. Get in touch and describe what you have in mind."
        }
      ],
      "cta": {
        "title": "Want something like this built?",
        "body": "The team that built these products takes on client work. Tell us what you are trying to build and we will tell you how we would approach it.",
        "button": "Talk to us"
      }
    },
```

- [ ] **Step 6: Add the Vietnamese page copy**

In `messages/vi.json`, at the same position inside `"pages"`:

```json
    "products": {
      "navLabel": "Sản phẩm",
      "title": "Sản phẩm",
      "metaTitle": "Sản phẩm — Phần mềm do SofinWave tự làm và vận hành",
      "metaDescription": "SofinWave tự làm và vận hành hai sản phẩm: SmartFinTrack — hệ thống quản lý tài chính cá nhân, và Tử Vi Đẩu Số — công cụ lập lá số và luận giải bằng AI. Cả hai đều miễn phí.",
      "lede": "SofinWave tự làm và vận hành hai sản phẩm của chính mình, cả hai đều miễn phí: SmartFinTrack — hệ thống quản lý tài chính cá nhân, và Tử Vi Đẩu Số — công cụ lập lá số tử vi và luận giải bằng AI. Chúng do cùng đội ngũ làm ra, theo đúng tiêu chuẩn chúng tôi áp dụng cho phần mềm của khách hàng.",
      "sections": [
        {
          "heading": "SmartFinTrack — quản lý tài chính cá nhân",
          "body": "Một chỗ để nhìn rõ tiền thực sự đi đâu. Bạn ghi nhận thu chi theo danh mục, đặt hạn mức cho từng danh mục trong tháng, theo dõi tài sản và khoản đầu tư đang nắm, rồi đọc lại toàn cảnh bằng báo cáo và biểu đồ. Miễn phí, giao diện có tiếng Việt và tiếng Anh.",
          "bullets": [
            "Thu chi theo danh mục",
            "Ngân sách và hạn mức theo tháng",
            "Tài sản và khoản đầu tư",
            "Báo cáo và biểu đồ"
          ],
          "links": [{ "href": "https://smartfintrack.kingnnt.org", "label": "smartfintrack.kingnnt.org" }]
        },
        {
          "heading": "Tử Vi Đẩu Số — lập lá số và luận giải bằng AI",
          "body": "Tử Vi Đẩu Số an sao vào mười hai cung dựa trên ngày giờ sinh. Công cụ lập lá số tự động — dương lịch hoặc âm lịch, có hỗ trợ tháng nhuận — hiển thị mười hai cung kèm chính tinh và ngũ hành, rồi đưa ra luận giải chi tiết bằng AI. Lập lá số miễn phí; đăng nhập để lưu lá số. Có tiếng Việt và tiếng Anh.",
          "bullets": [
            "Lập lá số từ ngày giờ sinh",
            "Dương lịch hoặc âm lịch, hỗ trợ tháng nhuận",
            "Mười hai cung, chính tinh, ngũ hành",
            "Luận giải chi tiết bằng AI"
          ],
          "links": [{ "href": "https://tuvidauso.kingnnt.org", "label": "tuvidauso.kingnnt.org" }]
        },
        {
          "heading": "Vì sao chúng tôi tự làm sản phẩm",
          "body": "Lời khuyên tư vấn thì dễ đưa ra, nhưng sống chung với nó mới tốn kém. Tự vận hành ứng dụng của mình nghĩa là chúng tôi gánh đúng hệ quả của những gì mình khuyên khách — từ khâu triển khai, báo lỗi, đến chi phí duy trì lâu sau ngày ra mắt. Sản phẩm do chính đội ngũ đó làm, trên cùng nền tảng công nghệ và cùng tiêu chuẩn với dự án khách hàng — đó là lý do chúng là bằng chứng chứ không phải đồ trang trí."
        }
      ],
      "faq": [
        {
          "question": "Sản phẩm của SofinWave có miễn phí không?",
          "answer": "Có. SmartFinTrack dùng miễn phí, và việc lập lá số trên Tử Vi Đẩu Số cũng miễn phí. Hiện chưa sản phẩm nào có gói trả phí."
        },
        {
          "question": "Tôi có cần tài khoản không?",
          "answer": "SmartFinTrack cần tài khoản, vì nó lưu chính dữ liệu tài chính của bạn. Tử Vi Đẩu Số lập được lá số mà không cần đăng nhập; đăng nhập để lưu lá số và xem luận giải chi tiết bằng AI."
        },
        {
          "question": "SofinWave có nhận làm sản phẩm tương tự cho chúng tôi không?",
          "answer": "Có — đó chính là mảng tư vấn và triển khai của chúng tôi. Cả hai sản phẩm đều do đội ngũ nhận dự án khách hàng làm ra, với cùng kiến trúc và quy trình. Hãy liên hệ và mô tả điều bạn đang muốn xây."
        }
      ],
      "cta": {
        "title": "Muốn xây một sản phẩm như vậy?",
        "body": "Chính đội ngũ làm ra hai sản phẩm này nhận dự án khách hàng. Hãy nói cho chúng tôi biết bạn đang muốn xây gì, chúng tôi sẽ nói cách mình sẽ tiếp cận.",
        "button": "Liên hệ với chúng tôi"
      }
    },
```

- [ ] **Step 7: Run the tests and verify they pass**

Run: `pnpm exec vitest run`
Expected: PASS, including `tests/messages/parity.test.ts`, `tests/lib/routes.test.ts`, and `tests/seo/metadata-routes.test.ts` — the last of these sweeps every registered route and will fail loudly if `pages.products` is missing a required field.

- [ ] **Step 8: Verify the page actually renders**

Run: `pnpm build`
Expected: the build output lists `/[site]/[locale]/(public)/[...slug]` prerendered paths including `products`. A missing catalog key surfaces here as a `MISSING_MESSAGE` error rather than a silent blank.

- [ ] **Step 9: Format and commit**

```bash
pnpm format
git add lib/routes.ts messages/ tests/lib/routes.test.ts
git commit -m "feat(content): add the /products page to the tech site"
```

---

### Task 4: `softwareApplicationSchema()`

**Files:**
- Modify: `lib/structured-data.ts` (append after `serviceSchema`)
- Test: `tests/seo/structured-data.test.ts` (extend)

**Interfaces:**
- Consumes: `pageUrl`, `siteUrl` from `@/lib/site`; `routing` from `@/i18n/routing`; `SiteId`, `DEFAULT_SITE` — all already imported in this file.
- Produces:
  ```ts
  export function softwareApplicationSchema(args: {
    key: string;
    name: string;
    description: string;
    url: string;
    site?: SiteId;
  }): Record<string, unknown>
  ```
  Task 5 calls it once per catalog item.

- [ ] **Step 1: Write the failing test**

Append to `tests/seo/structured-data.test.ts`:

```ts
describe("softwareApplicationSchema", () => {
  const [smartFinTrack, tuViDauSo] = en.products.items.map((product) =>
    softwareApplicationSchema({
      key: product.key,
      name: product.name,
      description: product.blurb,
      url: product.href,
    }),
  );

  it("describes a free web application published by the consultancy", () => {
    expect(smartFinTrack["@type"]).toBe("SoftwareApplication");
    expect(smartFinTrack.name).toBe("SmartFinTrack");
    expect(smartFinTrack.url).toBe("https://smartfintrack.kingnnt.org");
    expect(smartFinTrack.operatingSystem).toBe("Web");
    expect(smartFinTrack.offers).toEqual({
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    });
    expect(smartFinTrack.publisher).toEqual({ "@id": "https://sofinwave.com/#organization" });
  });

  it("categorises each product for its own audience", () => {
    expect(smartFinTrack.applicationCategory).toBe("FinanceApplication");
    expect(tuViDauSo.applicationCategory).toBe("LifestyleApplication");
  });

  it("declares the locales the routing config actually serves", () => {
    expect(smartFinTrack.inLanguage).toEqual([...routing.locales]);
  });

  // The testimonials are not real yet, and neither are any ratings.
  it("never claims a rating or a review", () => {
    for (const node of [smartFinTrack, tuViDauSo]) {
      expect(node.aggregateRating).toBeUndefined();
      expect(node.review).toBeUndefined();
    }
  });
});
```

Add `softwareApplicationSchema` to the existing import block at the top of the file.

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm exec vitest run tests/seo/structured-data.test.ts`
Expected: FAIL — `softwareApplicationSchema is not a function` / import resolution error.

- [ ] **Step 3: Implement the schema builder**

Append to `lib/structured-data.ts`, after `serviceSchema`:

```ts
/**
 * schema.org application categories, keyed by the product's untranslated `key`
 * in the message catalog. The category is a vocabulary term, not copy, so it
 * does not belong in the catalogs.
 */
const PRODUCT_CATEGORIES: Record<string, string> = {
  smartfintrack: "FinanceApplication",
  tuvidauso: "LifestyleApplication",
};

/**
 * SoftwareApplication node for one of our own products.
 *
 * Name, description, and URL come from the same catalog entry the page renders,
 * so the schema cannot drift from the visible copy. No rating and no review —
 * we have no real ones, and inventing them is a policy violation as well as a
 * lie.
 */
export function softwareApplicationSchema({
  key,
  name,
  description,
  url,
  site = DEFAULT_SITE.id,
}: {
  key: string;
  name: string;
  description: string;
  url: string;
  site?: SiteId;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name,
    description,
    url,
    applicationCategory: PRODUCT_CATEGORIES[key] ?? "WebApplication",
    operatingSystem: "Web",
    // Derived from the routing config so adding a locale cannot leave this
    // claiming fewer languages than the products actually offer.
    inLanguage: [...routing.locales],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    publisher: { "@id": `${siteUrl(site)}/#organization` },
  };
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `pnpm exec vitest run tests/seo/structured-data.test.ts`
Expected: PASS.

- [ ] **Step 5: Format and commit**

```bash
pnpm format
git add lib/structured-data.ts tests/seo/structured-data.test.ts
git commit -m "feat(seo): add SoftwareApplication schema for our own products"
```

---

### Task 5: Emit the schema on `/products`, and link the page from the footer

**Files:**
- Modify: `components/structured-data.tsx` (`PageStructuredData`)
- Modify: `lib/sites.ts:65-71` (tech `footerCompany`)
- Create: `tests/seo/page-structured-data.test.ts`
- Test: `tests/lib/sites.test.ts` (extend)

**Interfaces:**
- Consumes: `softwareApplicationSchema` from Task 4; the `products` namespace from Task 1; the `products` route from Task 3.
- Produces: nothing further tasks depend on. This is the last task.

- [ ] **Step 1: Write the failing tests**

Append to `tests/lib/sites.test.ts`:

```ts
describe("products in the footer", () => {
  it("links the tech footer to the products page", () => {
    const keys = siteConfig(SiteId.Tech).footerCompany.map((item) => item.href);

    expect(keys).toContain("/products");
  });

  it("keeps it out of the header nav, which is services only", () => {
    const hrefs = siteConfig(SiteId.Tech).nav.map((item) => item.href);

    expect(hrefs).not.toContain("/products");
  });

  it("does not offer it on the other three sites", () => {
    for (const site of [SiteId.Media, SiteId.Finance, SiteId.Academy]) {
      const config = siteConfig(site);
      const hrefs = [...config.nav, ...config.footerCompany, ...config.footerServices].map(
        (item) => item.href,
      );

      expect(hrefs).not.toContain("/products");
    }
  });
});
```

Make sure `siteConfig` and `SiteId` are imported at the top of that file; add whichever is missing.

Create `tests/seo/page-structured-data.test.ts`. It needs its own file rather
than an append, because `next-intl/server` has to be mocked module-wide and
`tests/seo/structured-data.test.ts` tests pure functions that must not be.

`getTranslations` relies on Next.js request-scoped APIs that do not exist under
jsdom — `tests/components/content-page.test.tsx` mocks it for the same reason.
The mock below is richer than that one because `PageStructuredData` calls
`t.raw()`, so it serves the real English catalog instead of echoing keys.

```ts
import { describe, it, expect, vi } from "vitest";
import en from "@/messages/en.json";
import { SiteId } from "@/enums";

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ namespace }: { namespace: string }) => {
    const messages = (en as Record<string, any>)[namespace];
    const t = (key: string) => key;
    t.raw = (key: string) => messages[key];
    return t;
  },
}));

import { PageStructuredData } from "@/components/structured-data";

async function graphFor(path: string, data: unknown, site = SiteId.Tech) {
  const element = (await PageStructuredData({
    locale: "en",
    path,
    data: data as never,
    site,
  })) as any;

  return JSON.parse(element.props.dangerouslySetInnerHTML.__html) as Record<string, unknown>[];
}

describe("PageStructuredData on /products", () => {
  it("emits one SoftwareApplication per catalogued product", async () => {
    const graph = await graphFor("products", en.pages.products);
    const apps = graph.filter((node) => node["@type"] === "SoftwareApplication");

    expect(apps.map((app) => app.name)).toEqual(en.products.items.map((p) => p.name));
  });

  it("emits none on a page that is not /products", async () => {
    const graph = await graphFor("about", en.pages.about);

    expect(graph.some((node) => node["@type"] === "SoftwareApplication")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `pnpm exec vitest run tests/lib/sites.test.ts tests/seo/page-structured-data.test.ts`
Expected: FAIL — `expected [...] to contain '/products'`, and an empty `SoftwareApplication` list where two names were expected.

- [ ] **Step 3: Emit the schema**

In `components/structured-data.tsx`, add `softwareApplicationSchema` to the import block from `@/lib/structured-data`, then inside `PageStructuredData`, after the existing `services/` branch:

```tsx
  // Our own products, on our own page, on the consultancy's site only. The
  // names and URLs are read from the same namespace the home section renders,
  // so schema and visible copy cannot drift apart.
  if (site === SiteId.Tech && path === "products") {
    const tProducts = await getTranslations({ locale, namespace: "products" });
    const products = tProducts.raw("items") as {
      key: string;
      name: string;
      blurb: string;
      href: string;
    }[];

    graph.push(
      ...products.map((product) =>
        softwareApplicationSchema({
          key: product.key,
          name: product.name,
          description: product.blurb,
          url: product.href,
          site,
        }),
      ),
    );
  }
```

- [ ] **Step 4: Add the footer link**

In `lib/sites.ts`, in the tech site's `footerCompany`, insert `/products` before `/ventures`:

```ts
    footerCompany: [
      { href: "/vietnam-it-consulting", key: "vietnamItConsulting" },
      { href: "/engagement-models", key: "engagementModels" },
      { href: "/products", key: "products" },
      { href: "/ventures", key: "ventures" },
      { href: "/about", key: "about" },
      { href: "/contact", key: "contact" },
    ],
```

The header nav stays at five entries. All five are services; a sixth of a different kind blurs what the nav is for, and the home section already links through.

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm exec vitest run`
Expected: PASS across the whole suite.

- [ ] **Step 6: Verify the rendered output end to end**

```bash
pnpm build && pnpm start
```

Then in another shell:

```bash
curl -s http://localhost:3000/en/products | grep -o 'SoftwareApplication'
curl -s http://localhost:3000/en/home | grep -c 'kingnnt.org'
curl -s http://localhost:3000/sitemap.xml | grep -o '/en/products'
```

Expected: `SoftwareApplication` appears twice; the home page HTML mentions `kingnnt.org` at least twice (both product hosts, confirming the section is server-rendered); the sitemap lists `/en/products`.

Stop the server when done.

- [ ] **Step 7: Format and commit**

```bash
pnpm format
git add components/structured-data.tsx lib/sites.ts tests/
git commit -m "feat(seo): emit product schema on /products and link it from the footer"
```

---

## Done criteria

- `pnpm exec vitest run` — all green
- `pnpm lint` and `pnpm format:check` — clean
- `pnpm build` — succeeds
- `/en/products` and `/vi/products` render, appear in `sitemap.xml` and `llms.txt`, and carry two `SoftwareApplication` nodes
- The home page's products section is present in the server-rendered HTML, features and all
- No `aggregateRating`, no `review`, no invented metric anywhere in the diff
