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

describe("Section label", () => {
  it("renders a SectionLabel when index and label are provided", () => {
    render(
      <Section index={3} label="Process">
        body
      </Section>,
    );
    // SectionLabel renders as three separate spans: "03", "/", "PROCESS"
    // Assert each part separately since they're in different elements
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("PROCESS")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
