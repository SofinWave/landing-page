import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Team } from "@/app/[locale]/(public)/home/_components/team";

describe("Team", () => {
  it("renders about text and members", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Team />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("King Nguyen")).toBeInTheDocument();
    expect(screen.getByText("Principal Consultant")).toBeInTheDocument();
  });
});
