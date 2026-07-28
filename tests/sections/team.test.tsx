import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Team } from "@/app/[site]/[locale]/(public)/home/_components/team";

describe("Team", () => {
  it("renders about text and members", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Team />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Jesse")).toBeInTheDocument();
    expect(screen.getByText("Principal Consultant")).toBeInTheDocument();
  });

  it("renders a portrait for each member", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Team />
      </NextIntlClientProvider>,
    );
    for (const [name, file] of [
      ["Jesse", "jesse"],
      ["Alex", "anonymous-1"],
      ["Brian", "anonymous-2"],
    ]) {
      expect(screen.getByAltText(name)).toHaveAttribute(
        "src",
        expect.stringContaining(`members%2F${file}.png`),
      );
    }
  });
});
