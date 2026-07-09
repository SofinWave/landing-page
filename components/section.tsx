import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/section-label";

export function Section({
  id,
  className,
  children,
  index,
  label,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  index?: number;
  label?: string;
}) {
  return (
    <section id={id} className={cn("container mx-auto px-4 py-16 md:py-24", className)}>
      {index != null && label ? (
        <div className="mb-6 flex justify-center">
          <SectionLabel index={index} name={label} />
        </div>
      ) : null}
      {children}
    </section>
  );
}
