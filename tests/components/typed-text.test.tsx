import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TypedText } from "@/components/typed-text";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
  // @ts-expect-error test stub
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

describe("TypedText", () => {
  it("renders all lines fully under reduced motion", () => {
    render(<TypedText lines={["$ deploy --env prod", "✓ build passed"]} />);
    expect(screen.getByText("$ deploy --env prod")).toBeInTheDocument();
    expect(screen.getByText("✓ build passed")).toBeInTheDocument();
  });
});
