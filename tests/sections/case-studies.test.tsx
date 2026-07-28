import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { CaseStudies } from "@/app/[site]/[locale]/(public)/home/_components/case-studies";

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

  it("renders non-numeric metric values as raw text without a trailing CountUp digit", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <CaseStudies />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Real-time")).toBeInTheDocument();
    expect(screen.queryByText(/Real-time0/)).toBeNull();
  });
});
