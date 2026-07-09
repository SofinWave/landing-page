import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import { ContactForm } from "@/app/[locale]/(public)/home/_components/contact-form";
import { submitContact } from "@/app/actions/contact";

vi.mock("@/app/actions/contact", () => ({
  submitContact: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("ContactForm", () => {
  it("shows a success message and clears the fields after a successful submit", async () => {
    const user = userEvent.setup();
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactForm />
      </NextIntlClientProvider>,
    );

    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const messageInput = screen.getByLabelText("Message") as HTMLTextAreaElement;

    await user.type(nameInput, "Ann");
    await user.type(emailInput, "a@b.com");
    await user.type(messageInput, "hello there friend");

    await user.click(screen.getByText("Send message"));

    expect(await screen.findByText("> Thanks — we'll be in touch shortly.")).toBeInTheDocument();

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
    });

    expect(submitContact).toHaveBeenCalledWith({
      name: "Ann",
      email: "a@b.com",
      message: "hello there friend",
    });
  });
});
