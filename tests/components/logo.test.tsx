import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/logo";
import { SITE_NAME } from "@/lib/site";

describe("Logo", () => {
  it("exposes the brand name to assistive tech", () => {
    render(<Logo label="SofinWave" />);
    expect(screen.getByRole("img", { name: "SofinWave" })).toBeInTheDocument();
  });

  it("falls back to the site name when no label is given", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: SITE_NAME })).toBeInTheDocument();
  });

  it("renders the wordmark image instead of a text label", () => {
    const { container } = render(<Logo label="SofinWave" />);
    expect(screen.queryByText("SofinWave")).not.toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("ships a light and a dark variant that swap via CSS", () => {
    const { container } = render(<Logo label="SofinWave" />);
    const images = Array.from(container.querySelectorAll("img"));
    const light = images.find((img) => img.getAttribute("src")?.includes("logo-wordmark.png"));
    const dark = images.find((img) => img.getAttribute("src")?.includes("logo-wordmark-dark.png"));

    expect(light?.className).toContain("dark:hidden");
    expect(dark?.className).toContain("hidden");
    expect(dark?.className).toContain("dark:block");
  });
});
