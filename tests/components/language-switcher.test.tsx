import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace }),
}));

import { LanguageSwitcher } from "@/components/language-switcher";

describe("LanguageSwitcher", () => {
  it("switches locale to vi preserving pathname", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /language/i }));
    await userEvent.click(screen.getByText("Tiếng Việt"));
    expect(replace).toHaveBeenCalledWith("/home", { locale: "vi" });
  });
});
