import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HudCard({ className, children, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow hud-corners hover:glow-accent",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
