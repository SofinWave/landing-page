import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Hero } from "@/app/[site]/[locale]/(public)/home/_components/hero";

describe("Hero", () => {
  it("renders the single h1 and both CTAs", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>,
    );
    // Read from the catalog rather than repeating the copy: this test exists to
    // prove the h1 is wired to `hero.title`, not to freeze the wording.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(en.hero.title);
    expect(screen.getByText(en.hero.ctaPrimary)).toBeInTheDocument();
    expect(screen.getByText(en.hero.ctaSecondary)).toBeInTheDocument();
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
