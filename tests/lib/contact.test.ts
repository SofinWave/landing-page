import { describe, it, expect } from "vitest";
import {
  buildContactMailto,
  contactSchema,
  invalidContactFields,
  MESSAGE_MAX,
} from "@/lib/contact";

const VALID = { name: "Ann", email: "a@b.com", message: "hello there friend" };
const LABELS = {
  subject: "New enquiry from Ann",
  name: "Name",
  email: "Email",
  message: "Message",
};

describe("contact schema", () => {
  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(VALID).success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const parsed = contactSchema.parse({ ...VALID, name: "  Ann  " });
    expect(parsed.name).toBe("Ann");
  });

  it("rejects a whitespace-only name that would pass a length check untrimmed", () => {
    expect(invalidContactFields({ ...VALID, name: "     " })).toEqual(["name"]);
  });

  it("reports every invalid field at once, not just the first", () => {
    expect(invalidContactFields({ name: "A", email: "nope", message: "hi" }).sort()).toEqual([
      "email",
      "message",
      "name",
    ]);
  });

  it("rejects a message longer than the mailto cap", () => {
    expect(invalidContactFields({ ...VALID, message: "x".repeat(MESSAGE_MAX + 1) })).toEqual([
      "message",
    ]);
  });

  it("returns no fields for valid input", () => {
    expect(invalidContactFields(VALID)).toEqual([]);
  });
});

describe("buildContactMailto", () => {
  it("addresses the mail to the given recipient", () => {
    expect(buildContactMailto("hi@example.com", VALID, LABELS)).toMatch(
      /^mailto:hi@example\.com\?/,
    );
  });

  it("encodes spaces as %20, never as '+'", () => {
    const url = buildContactMailto("hi@example.com", VALID, LABELS);
    expect(url).toContain("New%20enquiry%20from%20Ann");
    expect(url).not.toContain("+");
  });

  it("puts the name, email and message in the body", () => {
    const url = buildContactMailto("hi@example.com", VALID, LABELS);
    const body = decodeURIComponent(new URL(url).search.split("&body=")[1]);
    expect(body).toContain("Name: Ann");
    expect(body).toContain("Email: a@b.com");
    expect(body).toContain("hello there friend");
  });

  it("escapes characters that would otherwise break out of the query string", () => {
    const url = buildContactMailto("hi@example.com", { ...VALID, message: "a&b=c ?x #y" }, LABELS);
    const body = decodeURIComponent(new URL(url).search.split("&body=")[1]);
    expect(body).toContain("a&b=c ?x #y");
  });

  it("uses localised labels so the body follows the visitor's language", () => {
    const url = buildContactMailto("hi@example.com", VALID, {
      subject: "Liên hệ mới từ Ann",
      name: "Họ tên",
      email: "Email",
      message: "Nội dung",
    });
    const body = decodeURIComponent(new URL(url).search.split("&body=")[1]);
    expect(body).toContain("Họ tên: Ann");
    expect(decodeURIComponent(url)).toContain("Liên hệ mới từ Ann");
  });
});
