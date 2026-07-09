"use client";

import type { ReactNode } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const shown = reduced || inView;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
