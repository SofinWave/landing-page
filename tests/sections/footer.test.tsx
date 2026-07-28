import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { SiteFooter } from "@/app/[locale]/(public)/home/_components/footer";

describe("SiteFooter", () => {
  it("renders brand and contact email", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SiteFooter />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Software consulting & implementation.")).toBeInTheDocument();
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
