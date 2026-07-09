import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  label?: string;
  className?: string;
  size?: number;
  priority?: boolean;
}

export function Logo({ label, className, size = 32, priority = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/images/logo.png"
        alt={label ?? "Logo"}
        width={size}
        height={size}
        priority={priority}
        className="h-8 w-8 rounded-lg object-contain"
      />
      {label ? <span className="text-lg font-semibold">{label}</span> : null}
    </span>
  );
}
