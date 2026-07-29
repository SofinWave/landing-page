import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { CaseStudies } from "@/app/[site]/[locale]/(public)/home/_components/case-studies";

// A metric value with no leading number must not be fed to CountUp. The fixture
// is inline so the regression outlives any change to the copy the site ships.
const nonNumericMetric = {
  caseStudies: {
    ...en.caseStudies,
    items: [
      {
        client: "Fixture Co",
        problem: "Reports arrived a day late.",
        solution: "We rebuilt the pipeline to stream.",
        results: [
          { label: "Report latency", value: "Real-time" },
          { label: "Go-live", value: "10 weeks" },
          { label: "Manual work", value: "-80%" },
        ],
        tags: ["Fixture"],
      },
    ],
  },
};

describe("CaseStudies", () => {
  it("renders cases with problem, solution, and result metrics", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <CaseStudies />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Orkestrators")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getAllByText("Problem").length).toBeGreaterThan(0);
    expect(screen.getByText("8x")).toBeInTheDocument();
  });

  it("leads with the Orkestrators metrics", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <CaseStudies />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Autonomous completion")).toBeInTheDocument();
    expect(screen.getByText("Time to production")).toBeInTheDocument();
    expect(screen.getByText("Manual work")).toBeInTheDocument();
  });

  it("renders non-numeric metric values as raw text without a trailing CountUp digit", () => {
    render(
      <NextIntlClientProvider locale="en" messages={nonNumericMetric}>
        <CaseStudies />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Real-time")).toBeInTheDocument();
    expect(screen.queryByText(/Real-time0/)).toBeNull();
  });
});
