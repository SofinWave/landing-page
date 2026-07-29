import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import en from "@/messages/en.json";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace }),
}));

import { LanguageSwitcher } from "@/components/language-switcher";

async function openMenu() {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <LanguageSwitcher />
    </NextIntlClientProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /language/i }));
}

describe("LanguageSwitcher", () => {
  beforeEach(() => replace.mockClear());

  it("switches locale to vi preserving pathname", async () => {
    await openMenu();
    await userEvent.click(screen.getByText("Tiếng Việt"));
    expect(replace).toHaveBeenCalledWith("/home", { locale: "vi" });
  });

  it("switches locale to zh preserving pathname", async () => {
    await openMenu();
    await userEvent.click(screen.getByText("中文"));
    expect(replace).toHaveBeenCalledWith("/home", { locale: "zh" });
  });

  // A locale added to routing without a `nav.*` label renders a blank menu item,
  // which looks like a broken menu rather than a missing translation.
  it("labels every routed locale", async () => {
    await openMenu();
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(routing.locales.length);
    for (const item of items) expect(item.textContent?.trim()).not.toBe("");
  });
});
