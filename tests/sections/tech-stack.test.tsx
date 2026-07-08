import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { TechStack } from "@/app/[locale]/(public)/home/_components/tech-stack";

describe("TechStack", () => {
  it("renders technologies and domains", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <TechStack />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Fintech")).toBeInTheDocument();
  });
});
