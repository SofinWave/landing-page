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
