import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Process } from "@/app/[site]/[locale]/(public)/home/_components/process";

describe("Process", () => {
  it("renders all five steps in order", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Process />
      </NextIntlClientProvider>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("Discovery");
    expect(items[4]).toHaveTextContent("Operate");
  });
});
