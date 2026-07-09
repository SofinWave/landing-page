import { describe, it, expect } from "vitest";
import { contactSchema } from "@/app/actions/contact.schema";
import { submitContact } from "@/app/actions/contact";

describe("contact action", () => {
  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ name: "Ann", email: "nope", message: "hello there!" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid submission", async () => {
    const res = await submitContact({
      name: "Ann",
      email: "a@b.com",
      message: "hello there friend",
    });
    expect(res.ok).toBe(true);
  });

  it("returns an error for short message via the action", async () => {
    const res = await submitContact({ name: "Ann", email: "a@b.com", message: "hi" });
    expect(res).toEqual({ ok: false, error: "Message is too short" });
  });
});
