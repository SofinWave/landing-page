import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { Section } from "@/components/section";
import { HudCard } from "@/components/hud-card";
import { CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type Testimonial = { quote: string; author: string; role: string; company: string };

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Testimonial[];
  return (
    <Section className="bg-muted/30">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h2>
      {/* A lone quote in a two-column grid sits half-width against empty space. */}
      <div
        className={cn("grid gap-6", items.length === 1 ? "mx-auto max-w-2xl" : "md:grid-cols-2")}
      >
        {items.map((item) => (
          <HudCard key={item.author}>
            <Reveal>
              <CardContent className="pt-6">
                <Quote className="mb-4 h-8 w-8 text-primary/50" />
                <blockquote className="text-lg">{item.quote}</blockquote>
                <footer className="mt-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.author}</span> — {item.role}
                  , {item.company}
                </footer>
              </CardContent>
            </Reveal>
          </HudCard>
        ))}
      </div>
    </Section>
  );
}
