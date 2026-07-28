import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

import { Ecosystem } from "@/app/[site]/[locale]/(public)/home/_components/ecosystem";

function renderAt(locale: "en" | "vi") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? en : vi}>
      <Ecosystem />
    </NextIntlClientProvider>,
  );
}

describe("Ecosystem section", () => {
  it("links to the three sibling sites and not to the tech site itself", () => {
    renderAt("en");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    expect(hrefs).toEqual([
      "https://media.sofinwave.com/en/home",
      "https://finance.sofinwave.com/en/home",
      "https://academy.sofinwave.com/en/home",
    ]);
  });

  it("targets the landing page rather than the locale root, which only redirects", () => {
    renderAt("en");

    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).toMatch(/\/en\/home$/);
    }
  });

  it("carries the active locale into the cross-site URLs", () => {
    renderAt("vi");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    expect(hrefs).toEqual([
      "https://media.sofinwave.com/vi/home",
      "https://finance.sofinwave.com/vi/home",
      "https://academy.sofinwave.com/vi/home",
    ]);
  });

  it("names each sibling site and its role", () => {
    renderAt("en");

    expect(screen.getByText("SofinWave Media")).toBeInTheDocument();
    expect(screen.getByText("SofinWave Finance")).toBeInTheDocument();
    expect(screen.getByText("SofinWave Academy")).toBeInTheDocument();
    expect(screen.getByText("Media & Content")).toBeInTheDocument();
    expect(screen.getByText("Investing Knowledge")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
  });

  it("keeps advisory vocabulary out of the finance blurb", () => {
    renderAt("en");

    const blurb = en.ecosystem.sites.finance.blurb.toLowerCase();

    expect(blurb).toContain("not advice");
    for (const banned of [
      "financial advice",
      "we advise",
      "manage your money",
      "portfolio manag",
    ]) {
      expect(blurb).not.toContain(banned);
    }
  });
});
