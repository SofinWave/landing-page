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
});
