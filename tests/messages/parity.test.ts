import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

function arrayLengths(obj: unknown, prefix = ""): Record<string, number> {
  if (Array.isArray(obj)) {
    return obj.reduce<Record<string, number>>(
      (acc, item, i) => Object.assign(acc, arrayLengths(item, `${prefix}[${i}]`)),
      { [prefix]: obj.length },
    );
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).reduce<Record<string, number>>(
      (acc, [k, v]) => Object.assign(acc, arrayLengths(v, prefix ? `${prefix}.${k}` : k)),
      {},
    );
  }
  return {};
}

describe("message catalogs", () => {
  it("en and vi have identical key structure", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(vi).sort());
  });

  it("en and vi have identical array lengths at every path", () => {
    expect(arrayLengths(en)).toEqual(arrayLengths(vi));
  });
});
