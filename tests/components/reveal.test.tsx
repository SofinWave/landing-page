import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Reveal } from "@/components/reveal";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
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

describe("Reveal", () => {
  it("always renders children", () => {
    render(
      <Reveal>
        <p>hello</p>
      </Reveal>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
