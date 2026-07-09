import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// Mock window.matchMedia for useReducedMotion
// Reports reduced motion is ON so animated components render deterministically
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: true,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

// Mock IntersectionObserver for useInView
// @ts-expect-error - minimal mock for testing
globalThis.IntersectionObserver = class MockIntersectionObserver {
  constructor(_callback: any, _options?: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
