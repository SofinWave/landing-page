import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import viMessages from "@/messages/vi.json";
import { LogoStrip } from "@/app/[locale]/(public)/home/_components/logo-strip";

describe("LogoStrip", () => {
  it("renders every client name from the catalog", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LogoStrip />
      </NextIntlClientProvider>,
    );
    for (const name of en.logos.items) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("lists the same clients in both locales", () => {
    expect(viMessages.logos.items).toEqual(en.logos.items);
  });
});
