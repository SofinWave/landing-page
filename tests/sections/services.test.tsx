import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Services } from "@/app/[site]/[locale]/(public)/home/_components/services";

describe("Services", () => {
  it("renders heading and all service cards", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Services />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 2, name: en.services.title })).toBeInTheDocument();
    // Every card, by title, so a card dropped from the catalog fails here rather
    // than silently shrinking the grid.
    for (const item of en.services.items) {
      expect(screen.getByText(item.title), item.title).toBeInTheDocument();
    }
  });
});
