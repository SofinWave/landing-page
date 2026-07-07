import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = { quote: string; author: string; role: string; company: string };

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Testimonial[];
  return (
    <Section className="bg-muted/30">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.author}>
            <CardContent className="pt-6">
              <Quote className="mb-4 h-8 w-8 text-primary/40" />
              <blockquote className="text-lg">{item.quote}</blockquote>
              <footer className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{item.author}</span> — {item.role}, {item.company}
              </footer>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
