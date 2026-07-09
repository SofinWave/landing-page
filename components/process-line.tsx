"use client";

import { useInView } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function ProcessLine({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className={cn("relative h-px w-full bg-border", className)}>
      <div className="draw-line absolute inset-0 bg-accent-gradient" data-in-view={inView} />
    </div>
  );
}
