import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SiteFooter } from "@/components/site-footer";

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
});
