import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CountUp } from "@/components/count-up";

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

describe("CountUp", () => {
  it("renders the final value under reduced motion", () => {
    render(<CountUp to={99} suffix="%" />);
    expect(screen.getByText("99%")).toBeInTheDocument();
  });
});
