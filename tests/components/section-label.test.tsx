import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectionLabel } from "@/components/section-label";

describe("SectionLabel", () => {
  it("renders zero-padded index and uppercased name", () => {
    const { container } = render(<SectionLabel index={2} name="Services" />);
    const span = container.querySelector("span");
    expect(span?.textContent).toContain("02");
    expect(span?.textContent).toContain("SERVICES");
  });
});
