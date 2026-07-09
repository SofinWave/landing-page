import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useInView, useReducedMotion } from "@/lib/hooks";

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

function ReducedProbe() {
  return <span>{useReducedMotion() ? "reduced" : "full"}</span>;
}
function InViewProbe() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="probe">
      {inView ? "in" : "out"}
    </div>
  );
}

describe("hooks", () => {
  it("reads prefers-reduced-motion", () => {
    render(<ReducedProbe />);
    expect(screen.getByText("reduced")).toBeInTheDocument();
  });
  it("useInView starts out of view", () => {
    render(<InViewProbe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("out");
  });
});
