import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "@/components/section";

describe("Section", () => {
  it("renders children and applies id", () => {
    render(
      <Section id="about">
        <p>hello</p>
      </Section>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(document.getElementById("about")).not.toBeNull();
  });
});
