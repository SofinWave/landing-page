import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Testimonials } from "@/app/[site]/[locale]/(public)/home/_components/testimonials";

const quote = (author: string) => ({
  quote: "They shipped it.",
  author,
  role: "CTO",
  company: "Fixture Co",
});

const oneQuote = { testimonials: { ...en.testimonials, items: [quote("First Author")] } };
const twoQuotes = {
  testimonials: { ...en.testimonials, items: [quote("First Author"), quote("Second Author")] },
};

describe("Testimonials", () => {
  it("renders quotes with attribution", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/shipped ahead of schedule/)).toBeInTheDocument();
  });

  it("centres a lone quote instead of leaving it half-width", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={oneQuote}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    const grid = container.querySelector("div.grid");
    expect(grid).not.toHaveClass("md:grid-cols-2");
    expect(grid).toHaveClass("mx-auto");
  });

  it("keeps two columns once there is more than one quote", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={twoQuotes}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("div.grid")).toHaveClass("md:grid-cols-2");
  });
});
