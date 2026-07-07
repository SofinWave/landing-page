import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { CaseStudies } from "@/app/[locale]/(public)/home/_components/case-studies";

describe("CaseStudies", () => {
  it("renders cases with problem, solution, and result metrics", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <CaseStudies />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getAllByText("Problem").length).toBeGreaterThan(0);
    expect(screen.getByText("8x")).toBeInTheDocument();
  });
});
