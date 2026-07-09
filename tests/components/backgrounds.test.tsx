import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GridBackdrop } from "@/components/backgrounds/grid-backdrop";
import { NeuralField } from "@/components/backgrounds/neural-field";

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

describe("backgrounds", () => {
  it("GridBackdrop renders the grid layer", () => {
    const { container } = render(<GridBackdrop />);
    expect(container.querySelector(".grid-backdrop")).not.toBeNull();
  });
  it("NeuralField mounts a canvas without throwing", () => {
    const { container } = render(<NeuralField />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
