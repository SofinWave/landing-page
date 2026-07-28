import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Testimonials } from "@/app/[site]/[locale]/(public)/home/_components/testimonials";

describe("Testimonials", () => {
  it("renders quotes with attribution", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/shipped ahead of schedule/)).toBeInTheDocument();
  });
});
