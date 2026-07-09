"use client";

import { useEffect, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function TypedText({ lines, className }: { lines: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [count, setCount] = useState(reduced ? lines.length : 0);

  useEffect(() => {
    if (reduced || !inView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (reduced) setCount(lines.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= lines.length) clearInterval(id);
    }, 550);
    return () => clearInterval(id);
  }, [inView, reduced, lines.length]);

  return (
    <div ref={ref} className={cn("font-mono text-sm leading-relaxed", className)}>
      {lines.slice(0, Math.max(count, reduced ? lines.length : count)).map((line, i) => (
        <div key={line} className={i === 0 ? "text-primary" : "text-muted-foreground"}>
          {line}
        </div>
      ))}
    </div>
  );
}
