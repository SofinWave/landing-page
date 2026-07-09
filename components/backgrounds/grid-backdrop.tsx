import { cn } from "@/lib/utils";

export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 grid-backdrop", className)}
    />
  );
}
