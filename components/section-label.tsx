import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  name,
  className,
}: {
  index: number;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      <span className="text-primary">{String(index).padStart(2, "0")}</span>
      <span aria-hidden>/</span>
      <span>{name.toUpperCase()}</span>
    </span>
  );
}
