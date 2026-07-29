import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { Faq } from "@/app/[site]/[locale]/(public)/home/_components/faq";

function renderFaq() {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Faq />
    </NextIntlClientProvider>,
  );
}

describe("Faq", () => {
  it("renders every question with its answer", () => {
    renderFaq();
    for (const item of en.faq.items) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }
  });

  // The answers used to live in a Radix accordion, which mounts its content
  // only once opened — so the served HTML carried none of them, and the
  // crawlers behind ChatGPT and Claude read questions with no answers.
  it("keeps the answers in the markup while the entries are collapsed", () => {
    renderFaq();
    const entries = document.querySelectorAll("details");
    expect(entries.length).toBe(en.faq.items.length);
    for (const entry of entries) {
      expect(entry.open).toBe(false);
      expect(entry.textContent).toContain(
        en.faq.items.find((i) => entry.textContent?.includes(i.question))?.answer,
      );
    }
  });
});
