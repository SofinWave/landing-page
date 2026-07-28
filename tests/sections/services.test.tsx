import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Services } from "@/app/[locale]/(public)/home/_components/services";

describe("Services", () => {
  it("renders heading and all service cards", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Services />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "How we work with you" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Architecture consulting")).toBeInTheDocument();
    expect(screen.getByText("Maintenance & operations")).toBeInTheDocument();
  });
});
