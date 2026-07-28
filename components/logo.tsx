import Image from "next/image";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Intrinsic size of the exported wordmark assets. */
const WORDMARK_WIDTH = 1115;
const WORDMARK_HEIGHT = 192;

interface LogoProps {
  label?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Brand wordmark. The lockup already carries the brand name, so no text is
 * rendered alongside it; `label` only names the image for assistive tech.
 *
 * Both theme variants stay in the DOM and swap via CSS — the theme is unknown
 * during SSR — so the accessible name lives on the wrapper instead of on an
 * `alt` that `display: none` would hide.
 */
export function Logo({ label, className, priority = false }: LogoProps) {
  const image = {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
    priority,
    className: "h-7 w-auto sm:h-8",
  };

  return (
    <span
      role="img"
      aria-label={label ?? SITE_NAME}
      className={cn("inline-flex items-center", className)}
    >
      <Image
        {...image}
        alt=""
        src="/images/logo-wordmark.png"
        className={cn(image.className, "dark:hidden")}
      />
      <Image
        {...image}
        alt=""
        src="/images/logo-wordmark-dark.png"
        className={cn(image.className, "hidden dark:block")}
      />
    </span>
  );
}
