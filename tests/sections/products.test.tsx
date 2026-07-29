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
