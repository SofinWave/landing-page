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
