import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Hero } from "@/app/[locale]/(public)/home/_components/hero";

describe("Hero", () => {
  it("renders the single h1 and both CTAs", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "We ship the systems your business runs on",
    );
    expect(screen.getByText("Book a consultation")).toBeInTheDocument();
    expect(screen.getByText("View case studies")).toBeInTheDocument();
  });

  it("renders the eyebrow in monospace style", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector(".font-mono")).not.toBeNull();
  });
});
