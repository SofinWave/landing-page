import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HudCard } from "@/components/hud-card";

describe("HudCard", () => {
  it("renders children and hud-corners class", () => {
    const { container } = render(<HudCard>content</HudCard>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(container.querySelector(".hud-corners")).not.toBeNull();
  });
});
