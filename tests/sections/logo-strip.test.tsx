import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { LogoStrip } from "@/app/[locale]/(public)/home/_components/logo-strip";

describe("LogoStrip", () => {
  it("renders all client names", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LogoStrip />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Stark Industries")).toBeInTheDocument();
  });
});
