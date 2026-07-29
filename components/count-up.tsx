"use client";

import { useEffect, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>();
  /**
   * Starts at the final value, so the server-rendered HTML carries the real
   * number rather than the zero the animation begins from.
   *
   * Every answer-engine crawler that matters here — GPTBot, OAI-SearchBot,
   * ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot — reads the HTML
   * without executing JavaScript. Counting up from a `0` initial state meant
   * they read `0%` where the copy says `92%`, which is worse than publishing no
   * metric at all. The rewind to zero now happens after hydration instead.
   */
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (reduced) {
      // `useReducedMotion` only knows the answer after its own effect has run,
      // so this also restores the value the pass below rewound.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(to);
      return;
    }
    if (!inView) {
      // Rewinds once the client takes over, while the element is still out of
      // view, so the count-up has somewhere to start from.
      setValue(0);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setValue(to * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
