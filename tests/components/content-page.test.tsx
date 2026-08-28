import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// next-intl/server's getTranslations relies on Next.js request-scoped APIs that
// aren't available outside a real request (and jsdom actively rejects it as a
// "Client Component" environment). Stub it with a translator that just echoes
// the key, since these tests assert on section content, not on shell copy.
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

import { ContentPage, type ContentPageData } from "@/components/content-page";
import { SiteId } from "@/enums";

function baseData(overrides: Partial<ContentPageData> = {}): ContentPageData {
  return {
    metaTitle: "Test title",
    metaDescription: "Test description",
    title: "Test page",
    lede: "This is a lede.",
    sections: [
      {
        heading: "Section heading",
        body: "Section body copy.",
      },
    ],
    faq: [],
    cta: { title: "CTA title", body: "CTA body", button: "CTA button" },
    ...overrides,
  };
}

describe("ContentPage", () => {
  it("renders a linked anchor for each section link with the right label and href", async () => {
    const data = baseData({
      sections: [
        {
          heading: "What we do",
          body: "We do things.",
          links: [
            { href: "/services/data-collection", label: "Data collection" },
            { href: "/services/data-annotation", label: "Data annotation" },
          ],
        },
      ],
    });

    const element = await ContentPage({
      locale: "en",
      path: "services/ai-training-data",
      data,
      site: SiteId.Tech,
    });
    render(element);

    const section = screen.getByText("What we do").closest("section") as HTMLElement;
    const sectionLinks = within(section).getAllByRole("link");
    expect(sectionLinks).toHaveLength(2);

    const dataCollectionLink = within(section).getByRole("link", { name: "Data collection" });
    expect(dataCollectionLink).toHaveAttribute("href", "/services/data-collection");

    const dataAnnotationLink = within(section).getByRole("link", { name: "Data annotation" });
    expect(dataAnnotationLink).toHaveAttribute("href", "/services/data-annotation");
  });

  it("renders no stray anchor for a section without links", async () => {
    const data = baseData({
      sections: [
        {
          heading: "No links here",
          body: "Just body copy, nothing else.",
        },
      ],
    });

    const element = await ContentPage({
      locale: "en",
      path: "services/ai-training-data",
      data,
      site: SiteId.Tech,
    });
    render(element);

    const section = screen.getByText("No links here").closest("section") as HTMLElement;
    expect(within(section).queryAllByRole("link")).toHaveLength(0);
  });

  // The mocked next-intl Link echoes href verbatim, so this asserts on the
  // element type: a cross-site URL must not go through the locale-aware Link,
  // which would prefix it with the current locale.
  it("leaves an absolute href untouched and outside the locale-aware Link", async () => {
    const data = baseData({
      sections: [
        {
          heading: "Our other businesses",
          body: "Four sites, one team.",
          links: [
            { href: "https://media.sofinwave.com/en/home", label: "media.sofinwave.com" },
            { href: "/ventures", label: "Ventures" },
          ],
        },
      ],
    });

    const element = await ContentPage({
      locale: "en",
      path: "ventures",
      data,
      site: SiteId.Tech,
    });
    render(element);

    const section = screen.getByText("Our other businesses").closest("section") as HTMLElement;

    const external = within(section).getByRole("link", { name: "media.sofinwave.com" });
    expect(external).toHaveAttribute("href", "https://media.sofinwave.com/en/home");

    const internal = within(section).getByRole("link", { name: "Ventures" });
    expect(internal).toHaveAttribute("href", "/ventures");
  });
});

describe("ContentPage outbound links", () => {
  const data = baseData({
    sections: [
      {
        heading: "Where our work lives",
        body: "One network, plus the products we run on their own domains.",
        links: [
          { href: "https://media.sofinwave.com/en/home", label: "media.sofinwave.com" },
          { href: "https://smartfintrack.com", label: "smartfintrack.com" },
          { href: "/products", label: "Products" },
        ],
      },
    ],
  });

  async function renderSection() {
    const element = await ContentPage({ locale: "en", path: "products", data, site: SiteId.Tech });
    render(element);

    return screen.getByText("Where our work lives").closest("section") as HTMLElement;
  }

  it("opens a link off our network in a new tab", async () => {
    const section = await renderSection();

    const product = within(section).getByRole("link", { name: "smartfintrack.com" });

    expect(product).toHaveAttribute("target", "_blank");
    expect(product).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  // Our four sites read as one network to a visitor, so moving between them is
  // not a departure and should not spawn a tab.
  it("keeps a sibling-site link in the current tab", async () => {
    const section = await renderSection();

    const sibling = within(section).getByRole("link", { name: "media.sofinwave.com" });

    expect(sibling).toHaveAttribute("href", "https://media.sofinwave.com/en/home");
    expect(sibling).not.toHaveAttribute("target");
  });

  it("keeps a relative link in the current tab", async () => {
    const section = await renderSection();

    expect(within(section).getByRole("link", { name: "Products" })).not.toHaveAttribute("target");
  });
});
