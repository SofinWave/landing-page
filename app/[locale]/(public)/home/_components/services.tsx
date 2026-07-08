import { useTranslations } from "next-intl";
import { Compass, Server, Code, Plug, Gauge, Shield, type LucideIcon } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  server: Server,
  code: Code,
  plug: Plug,
  gauge: Gauge,
  shield: Shield,
};

type ServiceItem = { icon: string; title: string; description: string };

export function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as ServiceItem[];
  return (
    <Section id="services">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? Compass;
          return (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{item.description}</CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
