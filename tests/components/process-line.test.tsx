import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ProcessLine } from "@/components/process-line";

beforeEach(() => {
  // @ts-expect-error test stub
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

describe("ProcessLine", () => {
  it("renders a draw-line element", () => {
    const { container } = render(<ProcessLine />);
    expect(container.querySelector(".draw-line")).not.toBeNull();
  });
});
