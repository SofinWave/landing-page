import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace: () => {} }),
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SiteHeader } from "@/components/site-header";

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SiteHeader />
    </NextIntlClientProvider>,
  );
}

describe("SiteHeader", () => {
  it("renders nav links and CTA", () => {
    renderHeader();
    expect(screen.getAllByText("Services").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Why Vietnam").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Book a consultation").length).toBeGreaterThan(0);
  });

  it("toggles the mobile menu", async () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: /open menu/i });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });

  it("shows the availability status", () => {
    renderHeader();
    expect(screen.getByText("Available for work")).toBeInTheDocument();
  });
});
