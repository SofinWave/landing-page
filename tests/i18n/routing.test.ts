import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";

describe("i18n routing", () => {
  it("supports en, vi, and zh with en default", () => {
    expect(routing.locales).toEqual(["en", "vi", "zh"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
