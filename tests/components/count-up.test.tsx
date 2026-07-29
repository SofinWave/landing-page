import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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

  // Answer-engine crawlers do not execute JavaScript. While the count-up began
  // at zero, they read every metric on the page as `0` — `-92%` came out `-0%`.
  it("server-renders the final value, not the zero the animation starts from", () => {
    const html = renderToStaticMarkup(<CountUp to={92} prefix="-" suffix="%" />);
    expect(html).toContain("-92%");
    expect(html).not.toContain("0%");
  });
});
