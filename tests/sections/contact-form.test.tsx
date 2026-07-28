import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import viMessages from "@/messages/vi.json";
import { ContactForm } from "@/app/[site]/[locale]/(public)/home/_components/contact-form";
import { SITE_EMAIL } from "@/lib/site";

/**
 * jsdom refuses to navigate, so swap window.location for a recorder and read
 * back the mailto: URL the form tried to open.
 */
let navigated: string[] = [];
const realLocation = window.location;

beforeEach(() => {
  navigated = [];
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: {
      ...realLocation,
      set href(value: string) {
        navigated.push(value);
      },
      get href() {
        return "";
      },
    },
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", { configurable: true, value: realLocation });
  vi.restoreAllMocks();
});

function renderForm(messages: typeof en | typeof viMessages = en, locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ContactForm />
    </NextIntlClientProvider>,
  );
}

async function fill(user: ReturnType<typeof userEvent.setup>, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    if (value) await user.type(screen.getByLabelText(label), value);
  }
}

describe("ContactForm", () => {
  it("opens the visitor's mail app with the enquiry pre-filled", async () => {
    const user = userEvent.setup();
    renderForm();
    await fill(user, { Name: "Ann", Email: "a@b.com", Message: "hello there friend" });
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(navigated).toHaveLength(1);
    const url = navigated[0];
    expect(url.startsWith(`mailto:${SITE_EMAIL}?`)).toBe(true);
    expect(decodeURIComponent(url)).toContain("New enquiry from Ann");
    expect(decodeURIComponent(url)).toContain("hello there friend");
  });

  it("confirms the mail app was opened without claiming the message was sent", async () => {
    const user = userEvent.setup();
    renderForm();
    await fill(user, { Name: "Ann", Email: "a@b.com", Message: "hello there friend" });
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText(/mail app should be open/)).toBeInTheDocument();
  });

  it("keeps what the visitor typed, so nothing is lost if no mail app opens", async () => {
    const user = userEvent.setup();
    renderForm();
    await fill(user, { Name: "Ann", Email: "a@b.com", Message: "hello there friend" });
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Ann");
    expect((screen.getByLabelText("Message") as HTMLTextAreaElement).value).toBe(
      "hello there friend",
    );
  });

  it("always offers the address as a fallback for visitors with no mail client", () => {
    renderForm();
    const link = screen.getByRole("link", { name: SITE_EMAIL });
    expect(link).toHaveAttribute("href", `mailto:${SITE_EMAIL}`);
  });

  it("flags every invalid field at once and does not open the mail app", async () => {
    const user = userEvent.setup();
    renderForm();
    await fill(user, { Name: "A", Email: "nope", Message: "hi" });
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(navigated).toHaveLength(0);
    expect(screen.getByText("Please enter at least 2 characters.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please write at least 10 characters.")).toBeInTheDocument();
  });

  it("marks invalid fields for assistive technology", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-describedby", "name-error");
  });

  it("clears the errors once the visitor fixes them", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();

    await fill(user, { Name: "Ann", Email: "a@b.com", Message: "hello there friend" });
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.queryByText("Please enter a valid email address.")).toBeNull();
    expect(navigated).toHaveLength(1);
  });

  it("composes the mail in Vietnamese for the vi locale", async () => {
    const user = userEvent.setup();
    renderForm(viMessages, "vi");
    await fill(user, { "Họ tên": "Ann", Email: "a@b.com", "Nội dung": "xin chao ban nhe" });
    await user.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));

    expect(decodeURIComponent(navigated[0])).toContain("Liên hệ mới từ Ann");
    expect(decodeURIComponent(navigated[0])).toContain("Họ tên: Ann");
  });
});
