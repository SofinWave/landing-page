import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import viMessages from "@/messages/vi.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SiteFooter } from "@/components/site-footer";
import { SiteId } from "@/enums";
import { ALL_SITES, siteConfig } from "@/lib/sites";

describe("SiteFooter", () => {
  it("renders brand and contact email", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SiteFooter />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByText("Software outsourcing and offshore development from Vietnam."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Work.KingNNT@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:Work.KingNNT@gmail.com",
    );
  });

  it("renders the system status line", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SiteFooter />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("All systems operational")).toBeInTheDocument();
  });

  describe("ecosystem column", () => {
    for (const site of ALL_SITES) {
      it(`links the ${site.id} site to the other three and never to itself`, () => {
        render(
          <NextIntlClientProvider locale="en" messages={en}>
            <SiteFooter site={site.id} />
          </NextIntlClientProvider>,
        );

        const nav = screen.getByRole("navigation", { name: "Ecosystem" });
        const hrefs = within(nav)
          .getAllByRole("link")
          .map((link) => link.getAttribute("href"));

        expect(hrefs).toHaveLength(3);
        expect(hrefs).not.toContain(`https://${site.host}/en/home`);
        for (const href of hrefs) {
          expect(href).toMatch(/^https:\/\/[a-z.]*sofinwave\.com\/en\/home$/);
        }
      });
    }

    it("labels each link with the sibling site's brand name", () => {
      render(
        <NextIntlClientProvider locale="en" messages={en}>
          <SiteFooter site={SiteId.Tech} />
        </NextIntlClientProvider>,
      );

      const nav = screen.getByRole("navigation", { name: "Ecosystem" });

      for (const id of [SiteId.Media, SiteId.Finance, SiteId.Academy]) {
        expect(within(nav).getByRole("link", { name: siteConfig(id).name })).toHaveAttribute(
          "href",
          `https://${siteConfig(id).host}/en/home`,
        );
      }
    });

    it("carries the active locale into the cross-site URLs", () => {
      render(
        <NextIntlClientProvider locale="vi" messages={viMessages}>
          <SiteFooter site={SiteId.Finance} />
        </NextIntlClientProvider>,
      );

      const nav = screen.getByRole("navigation", { name: "Hệ sinh thái" });
      const hrefs = within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"));

      expect(hrefs).toEqual([
        "https://sofinwave.com/vi/home",
        "https://media.sofinwave.com/vi/home",
        "https://academy.sofinwave.com/vi/home",
      ]);
    });
  });
});
