import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Faq } from "@/app/[site]/[locale]/(public)/home/_components/faq";

describe("Faq", () => {
  it("expands an answer when its question is clicked", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Faq />
      </NextIntlClientProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /How do engagements start/i }));
    expect(await screen.findByText(/short discovery call/i)).toBeVisible();
  });
});
